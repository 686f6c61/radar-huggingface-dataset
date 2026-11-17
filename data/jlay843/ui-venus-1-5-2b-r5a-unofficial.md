# jlay843/UI-Venus-1.5-2B-R5A-unofficial

## Resumen

UI-Venus-1.5-2B-R5A-unofficial es un ajuste fino mediante LoRA del modelo inclusionAI/UI-Venus-1.5-2B, un modelo vision-lenguaje de 2.438.696.960 parametros construido sobre la arquitectura Qwen3-VL-2B-Instruct. Lo publica el usuario jlay843 como proyecto personal ("hobby project") y no esta afiliado ni respaldado por inclusionAI ni por los autores originales de UI-Venus. Su unica tarea es el *UI grounding* en modo sugerencia: dada una captura de pantalla y una descripcion breve de un control ("el boton de Ajustes"), devuelve un punto de clic normalizado en el rango 0-1000 o la respuesta explicita `{"absent": true}` si el elemento no esta visible.

El modelo resuelve un problema muy concreto en el ambito de los agentes GUI: localizar controles en pantallas y, sobre todo, abstenerse cuando el objetivo no aparece en la captura. Esta disenado para que una persona o un script fuertemente restringido decida que hacer con la sugerencia; el propio autor insiste en que el modelo nunca hace clic por si mismo en el modo por defecto. El interes actual radica en que los agentes que operan interfaces graficas necesitan componentes pequenos, desplegables en hardware modesto y con comportamiento predecible ante la ausencia de objetivos, y este ajuste ataca exactamente ese caso limite.

El ajuste se entreno con ms-swift 4.6.0 sobre datos sinteticos generados localmente y se distribuye tanto en safetensors bf16 (formato Transformers, `qwen3_vl`) como en GGUF Q8_0 con un proyector visual F16 para llama.cpp. La licencia es Apache-2.0. El autor solo ha probado y medido la version GGUF con llama.cpp; la version safetensors no fue evaluada ni en Transformers ni en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje Qwen3-VL (qwen3_vl), con torre ViT y aligner |
| Parametros totales | 2.438.696.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 4096 tokens) |
| Tipos de cuantizacion | GGUF Q8_0 (modelo) y F16 (proyector visual mmproj); pesos bf16 en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, layout Transformers) y GGUF (Q8_0 + mmproj F16) |

## Arquitectura y entrenamiento

El modelo parte de inclusionAI/UI-Venus-1.5-2B, a su vez construido sobre Qwen3-VL-2B-Instruct. La arquitectura es un transformer multimodal con torre visual ViT, un aligner vision-lenguaje y un modelo de lenguaje; el ajuste se realizo con ms-swift 4.6.0 usando `model_type qwen3_vl`. El entrenamiento congela la torre ViT y entrena el aligner con learning rate 1e-5 y el modelo de lenguaje mediante LoRA de rango 32, alpha 64, dropout 0.05 y objetivos `all-linear`, con learning rate 1e-4. El schedule es coseno con warmup 0.05, weight decay 0.1 y recorte de norma de gradiente a 1.0, durante 2 epochs, con batch de 1 por dispositivo y acumulacion de gradiente de 8, longitud maxima de 4096, bf16, checkpointing de gradiente y semilla 42. El total son 2.518 pasos; se selecciono el checkpoint con menor perdida de validacion (paso 2518, eval loss 0.17607, frente a 0.3025 en el paso 100, 0.2251 en el 1000 y 0.1837 en el 2000). El adaptador LoRA se fusiono en pesos bf16 y despues se convirtio a GGUF Q8_0 con un mmproj F16 propio.

Los datos de entrenamiento son exclusivamente capturas de paginas web sinteticas generadas por el autor: etiquetas inventadas o genericas sobre multiples plantillas (listas, menus, tarjetas, formularios, paneles, pestanas, cajones), renderizadas en Chrome headless a 1280x800 desde `file://` con la red bloqueada. Cada ejemplo se usa en tres vistas (pagina completa, redimensionado a 1024 de ancho y recorte de 256 px) y la respuesta es el centro del objetivo en escala 0-1000 o exactamente `{"absent":true}`. Se introducen deliberadamente casos dificiles: senuelos casi identicos (etiquetas parecidas, mayusculas, homoglifos, letras extra), objetivos solo por debajo del pliegue (respuesta correcta: absent), objetivos ocultos en cajones cerrados, acordeones colapsados, pestanas inactivas o `display:none` con un senuelo visible, y conjuntos "twin-below" de cuatro paginas que solo difieren en la visibilidad del objetivo. Esta es la ronda 5 (R5) del conjunto de datos propio del autor: un LoRA nuevo desde los pesos base que reutiliza literalmente el conjunto de R4 (7.683 filas: 5.466 de R3 mas 2.217 de R4) y anade filas nuevas de R5 sobre nuevas familias de plantillas.

## Capacidades

- Localizacion de elementos de interfaz (*UI grounding*): devuelve un punto de clic normalizado 0-1000 sobre las dimensiones de la imagen a partir de una descripcion textual del control.
- Abtencion explicita: responde `{"absent": true}` cuando el objetivo no esta visible en la captura, incluyendo casos de objetivo bajo el pliegue, oculto en cajones cerrados, acordeones colapsados, pestanas inactivas o `display:none`.
- Discriminacion de senuelos: entrenado especificamente con etiquetas casi identicas, diferencias de mayusculas, homoglifos y letras extra junto al objetivo real.
- Entrada multimodal imagen-texto: procesa capturas de pantalla junto con una descripcion breve del control.
- Salida restringida por gramatica: el harness del autor fuerza que la respuesta solo pueda adoptar las dos formas JSON anteriores.
- Modo sugerencia por defecto con lista de denegacion previa: palabras como login, password, checkout, payment, delete o post se bloquean antes de invocar al modelo.
- Modo de clic acotado opcional (`harness/venus_click.py`) para copias locales congeladas de paginas: solo clics, nunca escritura, solo loopback, GET unicamente, maximo 15 pasos y 120 s por tarea, perfil de navegador nuevo por tarea y registro solo de hashes de capturas.
- No se documentan capacidades de tool calling generico, razonamiento multi-paso abierto, matemeticas, codigo ni audio.

## Casos de uso

- Asistencia a personas con dificultades de acceso: dado un screenshot de una aplicacion y la descripcion hablada de un control, el modelo sugiere donde esta el boton para que el usuario o un asistente humano decida el clic, con abtencion cuando el elemento no aparece en pantalla.
- Automatizacion de pruebas de interfaz en modo sugerencia: en pipelines de QA sobre capturas de paginas renderizadas, el modelo localiza controles por descripcion y marca como ausentes los que no deberian estar visibles, sin ejecutar acciones reales.
- Auditoria de visibilidad de controles: verificar de forma automatica que botones criticos estan efectivamente visibles en distintas vistas y tamanos de pantalla, aprovechando la salida `absent` para detectar regresiones de maquetacion.
- Etiquetado y generacion de datos de grounding: usar el modelo como anotador preliminar sobre capturas para producir pares descripcion-punto que luego se revisan manualmente.
- Agente GUI de laboratorio sobre copias congeladas: con el modo de clic acotado, experimentar con navegacion de un solo paso sobre paginas servidas en loopback, con lista de denegacion, sin escritura y con limite de 15 pasos, exclusivamente para investigacion.
- Componente de pre-filtrado en un agente mayor: integrar la sugerencia de localizacion como primer paso de un pipeline mas amplio donde un humano o un modulo con mas garantias confirma la accion, gracias a la salida estructurada y a la abtencion calibrada por umbral de log-odds (3.5).
- Despliegue en hardware domestico: al ser un modelo de 2.438.696.960 parametros con GGUF Q8_0 y proyector F16 para llama.cpp, puede ejecutarse en equipos modestos para prototipos y demos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la perdida de validacion del entrenamiento (0.17607 en el paso 2518) y advierte que las mediciones se hicieron exclusivamente con el archivo GGUF Q8_0; no se evaluaron los pesos safetensors en Transformers ni en vLLM.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 2.438.696.960 parametros, los pesos en bf16 ocupan aproximadamente 4,9 GB, y la version GGUF Q8_0 ronda los 2,6 GB, a lo que hay que sumar el proyector visual F16 y el coste de activaciones y KV cache.
- GPU recomendadas: no disponible; el autor declara haber entrenado y ejecutado el proyecto en hardware domestico.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo en Q8_0; no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp con el par GGUF (modelo Q8_0 y mmproj F16 propio, no el del modelo base); Transformers con los pesos safetensors (no probado por el autor); vLLM no probado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UI-Venus-1.5-2B-R5A-unofficial | 2.438.696.960 | no disponible | UI grounding con abtencion | Apache-2.0 | Hugging Face (safetensors + GGUF) |
| inclusionAI/UI-Venus-1.5-2B | no disponible en la informacion | no disponible | UI grounding (modelo base) | no disponible en la informacion | Hugging Face |
| Qwen3-VL-2B-Instruct | no disponible en la informacion | no disponible | Vision-lenguaje general | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no oficial: no esta afiliado, revisado ni respaldado por inclusionAI ni por los autores de UI-Venus; el nombre se usa solo para indicar la procedencia de los pesos.
- Proyecto personal entrenado en hardware domestico con conjuntos de prueba pequenos; el propio autor recomienda leer la seccion de debilidades antes de usarlo en cualquier cosa.
- Entrenado exclusivamente con paginas web sinteticas generadas localmente; no hay evidencia de generalizacion a capturas reales, aplicaciones de escritorio, moviles u otras plataformas.
- Riesgo de alucinacion de coordenadas: puede devolver un punto de clic para un control que no existe o esta oculto; el harness mitiga esto con umbral de log-odds de 3.5 y abtencion, pero no lo elimina.
- No debe usarse para clics desatendidos, relleno de formularios, inicio de sesion, pagos, envio de mensajes ni ninguna accion irreversible; el autor lo prohibe explicitamente y pide no apuntarlo a cuentas reales.
- El modo de clic acotado solo esta pensado para copias locales congeladas de paginas, nunca para sitios en vivo.
- Idiomas soportados no documentados; las descripciones de controles en los datos de entrenamiento no se detallan linguisticamente.
- La version safetensors no fue probada ni medida en Transformers ni en vLLM; solo el GGUF Q8_0 con llama.cpp esta validado.
- El proyector visual debe ser el mmproj F16 de este repositorio, no el del modelo base, porque el aligner tambien se entreno.
- Sin datos publicados de sesgos, benchmarks o evaluacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jlay843/UI-Venus-1.5-2B-R5A-unofficial
- Modelo base: https://huggingface.co/inclusionAI/UI-Venus-1.5-2B
- Paper referenciado (arXiv 2602.09082): https://arxiv.org/abs/2602.09082
- Paper referenciado (arXiv 2508.10833): https://arxiv.org/abs/2508.10833
