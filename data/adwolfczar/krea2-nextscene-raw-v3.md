# AdwolfCzar/krea2-nextscene-raw-v3

## Resumen

krea2-nextscene-raw-v3 es un adaptador LoRA de rango 32 entrenado sobre el modelo de difusion Krea 2 Raw (en su variante fp8_scaled) por el usuario AdwolfCzar. Su funcion es la edicion por referencia y la generacion de "escena siguiente": dada una imagen de referencia A y un prompt de texto, produce una nueva imagen B que mantiene a los mismos personajes, el vestuario y el estilo, pero cambia el momento, la pose o la camara. Es, por tanto, una herramienta de consistencia de personaje y continuidad narrativa dentro del ecosistema ComfyUI, no un modelo de lenguaje.

El adaptador se publica como parte de un contrato concreto de ComfyUI (probado en stock ComfyUI v0.39 sin nodos personalizados) que encadena el cargador de Krea 2 Raw fp8, el LoRA Turbo oficial y, despues, este LoRA. La model card insiste en un detalle critico: sin pasar la condicion por el nodo `FluxKontextMultiReferenceLatentMethod(index_timestep_zero)`, Krea 2 ignora silenciosamente el latente de referencia.

El repositorio pesa 4,8 GB e incluye varios checkpoints (una tirada a 512 px, un acabado corto a 1024 px y una tirada larga de 3 epocas) ademas de rejillas de evaluacion cualitativa. El autor no declara parametros, idiomas ni resultados numericos de benchmarks, y la licencia se marca como "other" sin texto adicional, lo que limita el uso comercial sin aclaracion previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre el modelo de difusion Krea 2 Raw en fp8_scaled; arquitectura interna del modelo base no detallada en la model card |
| Parametros totales | no disponible (el repositorio contiene un adaptador LoRA, no un modelo completo; rango 32 declarado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible. La entrada es imagen de referencia + prompt de texto, con grounding visual mediante Qwen-Image-Edit-Plus |
| Tipos de cuantizacion | Modelo base en fp8_scaled (con su scale); LoRA en bf16; el LoRA Turbo oficial se usa en rank 64 bf16 |
| Idiomas soportados | no disponible (la model card no especifica idioma de las captions ni del prompt) |
| Licencia | other (sin texto de licencia publicado en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con rango real 32 y se aplica sobre Krea 2 Raw fp8_scaled, sin fusionar ni el LoRA Turbo ni el adaptador de ostris. La referencia se introduce como primer frame en t=0 (`index_timestep_zero`) y se condiciona con grounding de tipo vision-language mediante Qwen-Image-Edit-Plus. El muestreo en produccion recomendado es euler, 8 pasos y CFG 1, a aproximadamente 1 MP y con la relacion de aspecto de la imagen A.

El entrenamiento se hizo con la receta `krea2_apex` para timesteps, buckets de relacion de aspecto reales (incluido 16:9), AdamW8bitKahan, learning rate 1e-4 con decaimiento coseno, micro-batch 1 con acumulacion 2 y resolucion de 512 px. El dataset es `AdwolfCzar/ofificial_next_scene_v11` con captions naturales, compuesto por 1.629 pares de entrenamiento y 12 pares reservados (held-out). El codigo esta en la rama `krea2-raw-v3` de `github.com/adbrasi/diffusion-pipe-easycontrol`, con configuraciones en `examples/krea2_raw_v3/` y notas en `docs/KREA2_RAW_RUN_LOG.md`. Se publican tres tiradas: `raw512_r32` (1,5 epocas, escogida la s1220), `finish1024` (acabado corto de 240 pasos desde s1220 con LR 5e-5) y `raw512_long3ep` (3 epocas, prueba de longitud de entrenamiento).

## Capacidades

- Generacion de la "escena siguiente" a partir de una imagen de referencia A y un prompt: mantiene personajes, vestuario y estilo, y cambia el momento o la pose.
- Cambios de camara y de encuadre sobre la misma escena, incluidas relaciones de aspecto panoramicas como 16:9.
- Cambios de accion y de pose, segun la model card, funcionan de forma fiable.
- Edicion por referencia (reference edit), integrada en el flujo de Qwen-Image-Edit-Plus para el grounding visual.
- Control de fuerza del adaptador: a 1.0 sigue el prompt de forma estricta y a 0.7 (o 0.6-0.75) deja mas margen al prompt.
- Integracion directa en ComfyUI stock sin nodos personalizados, mediante `UNETLoader`, dos `LoraLoaderModelOnly`, `TextEncodeQwenImageEditPlus` y `FluxKontextMultiReferenceLatentMethod`.
- No se documentan capacidades de tool calling, agentes, audio, vision analitica ni generacion de texto: es un modelo de imagen.

## Casos de uso

- Storyboarding de secuencias: a partir de un frame clave de un personaje, generar los frames siguientes con la misma identidad y vestuario para previsualizar una escena antes de producirla.
- Ilustracion serializada de comics o webtoons: mantener la consistencia de un personaje entre vinetas cambiando pose, gesto y angulo de camara sin redibujar el diseno.
- Variaciones de encuadre para materiales de marketing: dada una imagen de referencia de un producto o personaje, producir el mismo momento desde otro angulo o con otra pose.
- Previsualizacion de fotografia de personajes: probar distintas poses y camaras manteniendo el look y el vestuario definidos en la referencia.
- Generacion de keyframes intermedios para animacion cuadro a cuadro: encadenar pares consecutivos para construir una secuencia coherente en estilo.
- Edicion de referencia en pipelines de diseno grafico dentro de ComfyUI: reemplazar la necesidad de retocar manualmente la pose o el encuadre de una ilustracion existente.
- Prototipado rapido de variaciones de escena para equipos de arte, reutilizando la misma referencia y ajustando la fuerza del LoRA entre 0.6 y 1.0 segun el grado de fidelidad requerido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente aporta evidencia cualitativa: rejillas de evaluacion en `evidence/` generadas con Turbo a 8 pasos y semilla 76, con columnas comparativas (`native_vl` sin nodo de metodo, `native` con `index_timestep_zero` sin LoRA, el LoRA antiguo "A1000" entrenado sobre Raw, los checkpoints del autor, fuerza 0.7 y referencia desordenada) y filas con pares de entrenamiento, captions alteradas, pares reservados, prompts cortos e imagenes de internet.

## Requisitos de hardware

- El autor no publica requisitos de VRAM ni hardware probado en la model card.
- Estimaciones orientativas (no publicadas por el autor, basadas en el uso de un modelo de difusion base en fp8_scaled y resolucion de salida de ~1 MP): se necesita VRAM suficiente para cargar el modelo base Krea 2 Raw fp8, el LoRA Turbo rank 64 bf16 y este LoRA r32 simultaneamente; el repositorio completo pesa 4,8 GB solo en pesos.
- GPU recomendadas por categoria: en el rango profesional, A100 o H100 permiten inferencia a 1024 px sin restricciones de memoria; en consumidor, las RTX con 16 GB o mas de VRAM (por ejemplo RTX 4090, 4080 o 3090) son el objetivo practico para 512-1024 px.
- Despliegue: el flujo documentado es ComfyUI stock (version >= c9602625, probada en f856877e / v0.39) sin nodos personalizados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles. La model card solo fija el presupuesto de muestreo recomendado (8 pasos, CFG 1, euler), que es un ajuste de calidad/velocidad, no una medida de rendimiento publicada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krea2-nextscene-raw-v3 | LoRA r32 sobre Krea 2 Raw fp8 | Imagen de referencia + prompt | No hay benchmarks numericos; evidencia cualitativa propia en `evidence/` | other (sin texto) | HuggingFace, 0 descargas |
| A1000 (LoRA antiguo entrenado sobre Raw) | LoRA de referencia anterior | Imagen de referencia + prompt | Usado como columna de comparacion en la rejilla del autor; resultados no cuantificados | no disponible | Referenciado en la rejilla de evaluacion, no se enlaza repositorio |
| Krea 2 Raw nativo (sin este LoRA) | Modelo base de difusion | Imagen de referencia + prompt con `index_timestep_zero` | Columna `native` de la rejilla; sin LoRA de escena siguiente | no disponible | Disponible como modelo base Krea 2 Raw |
| Krea 2 Turbo + LoRA oficial rank 64 | Modelo base con LoRA Turbo | Imagen de referencia + prompt | Columna base del flujo; no cuantificado | no disponible | Disponible en el ecosistema ComfyUI |

No se dispone de datos de rendimiento cuantitativos de ninguno de los elementos comparados, por lo que la comparacion se limita a tipo, contrato de uso y disponibilidad.

## Limitaciones y advertencias

- Fuerte sesgo hacia mantener el fondo: el 88% de las captions de entrenamiento dicen "el mismo fondo", porque los pares son frames consecutivos. El LoRA conserva bien la localizacion y es debil trasladando la escena a un lugar completamente nuevo.
- Dataset de entrenamiento pequeno (1.629 pares) y muy especifico (frames consecutivos), con solo 12 pares reservados para evaluacion; el riesgo de sobreajuste a ese dominio es alto.
- Dependencia critica del contrato de ComfyUI: si no se usa `FluxKontextMultiReferenceLatentMethod(index_timestep_zero)`, Krea 2 ignora el latente de referencia de forma silenciosa y el resultado es incorrecto sin aviso.
- Dependencia de versiones concretas de ComfyUI (>= c9602625, probado en f856877e / v0.39) y de un encadenado exacto de nodos; cambios de version pueden romper el flujo.
- Licencia "other" sin texto publicado: no se puede confirmar el uso comercial, la redistribucion ni la fusion de pesos; hay que consultar al autor antes de usarlo en produccion.
- Al ser un modelo de generacion de imagen, no aplican las advertencias tipicas de alucinacion textual, pero si las de deriva visual: identidad de personaje inestable, artefactos en poses forzadas y cambios de fondo no solicitados.
- No se declara idioma de las captions ni del prompt; el comportamiento multilingue del encoder de texto queda sin documentar.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad; el uso en produccion se apoyaria unicamente en la evidencia cualitativa del autor.
- Los resultados de la busqueda web proporcionados no guardan relacion con este modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdwolfCzar/krea2-nextscene-raw-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/AdwolfCzar/ofificial_next_scene_v11
- Codigo de entrenamiento (rama krea2-raw-v3): https://github.com/adbrasi/diffusion-pipe-easycontrol
- Registro de la tirada (rama claude/elegant-ptolemy-8kywqy), `docs/KREA2_RAW_RUN_LOG.md`: https://github.com/adbrasi/diffusion-pipe-easycontrol/blob/claude/elegant-ptolemy-8kywqy/docs/KREA2_RAW_RUN_LOG.md
- Configuraciones del entrenamiento, `examples/krea2_raw_v3/`: https://github.com/adbrasi/diffusion-pipe-easycontrol/tree/krea2-raw-v3/examples/krea2_raw_v3
