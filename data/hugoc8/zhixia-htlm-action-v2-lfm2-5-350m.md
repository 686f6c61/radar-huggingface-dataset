# hugoc8/zhixia-htlm-action-v2-lfm2.5-350m

## Resumen

ZhiXia HTLM Action v2 es un checkpoint fusionado en BF16 para Transformers, derivado de `LiquidAI/LFM2.5-350M` (revisión `9e6c6ccf47cd318696e137d381a7ded8fe4df09f`) mediante un adaptador LoRA entrenado el 5 de octubre de 2026. Lo publica el usuario `hugoc8` y su funcion no es la generacion de texto general, sino actuar como componente de decision dentro de un contrato cerrado de acciones de navegador: recibe una instruccion atomica y hasta 64 candidatos de elementos visibles, y devuelve exactamente un objeto JSON compacto del tipo `{"type":"click","index":0}`, `{"type":"type","index":1,"text":"...","submit":false}` o `{"type":"select","index":2,"value":"..."}`.

El modelo resuelve el problema del anclaje (grounding) de instrucciones en elementos de interfaz: traduce lenguaje natural, en chino o ingles, a una accion estructurada sobre un indice de una lista de candidatos. Con 354.483.968 parametros totales y un repositorio de 0,7 GB, esta pensado para ejecutarse en hardware muy modesto, incluso en CPU, y para ser validado por un host de confianza antes de cualquier ejecucion real.

Su relevancia es doble: por un lado demuestra que un modelo de 350 M puede alcanzar un 98,97 % de coincidencia exacta de accion completa en una tarea de interfaz estrictamente delimitada; por otro, la propia ficha insiste en que es un componente de decision y no un runtime autonomo de navegador, con puertas de seguridad, replay en navegador real y evaluacion adversarial aun no superadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el checkpoint hereda la arquitectura del modelo base LiquidAI/LFM2.5-350M (familia LFM2) |
| Parametros totales | 354.483.968 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones; el repositorio contiene pesos fusionados en BF16 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | LFM Open License v1.0 (etiquetada como `other` / `lfm1.0`) |
| Formato de pesos | safetensors (BF16, fusionado), compatible con Transformers |

Otros datos tecnicos: parametros del adaptador LoRA entrenable 5.996.544; tamano del repositorio 0,7 GB; tarea declarada `text-generation`; creado y actualizado el 5 de octubre de 2026; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base, por lo que no se dispone de detalle sobre el tipo de bloques, la atencion o la composicion del dataset original de LFM2.5-350M. Lo que si se documenta es el procedimiento de ajuste: se parte de una revision fijada del modelo base y se le aplica un adaptador LoRA con `r=16` y `alpha=32`, entrenado durante 3 epocas y 330 pasos de actualizacion, que anaden 5.996.544 parametros entrenables sobre los 354,5 M del modelo base. Posteriormente, el adaptador se fusiona y se publica como checkpoint BF16 unico.

El entrenamiento se realizo sobre 2.530 registros sinteticos con marcadores explicitos de permiso de entrenamiento y revision de PII, divididos en 1.754 de entrenamiento, 388 de desarrollo y 388 de test reservado, aislados por grupo semantico. No se usaron trazas de navegacion reales, credenciales, cookies, referencias de runtime, capturas completas del DOM ni estado de aprobacion. El hardware de entrenamiento fue una unica NVIDIA GeForce RTX 4090, con PyTorch 2.6.0+cu124, Transformers 5.18.0 y PEFT 0.21.2. No se menciona RLHF ni DPO; el ajuste es de tipo supervisado sobre el contrato `htlm-action-v2`.

El elemento mas caracteristico no es la arquitectura, sino el contrato de salida: el modelo debe emitir exactamente un JSON compacto, y en el caso de `select` debe copiar literalmente una de las opciones expuestas en el array `options`, sin traducir, normalizar ni parafrasear. La ficha recomienda decodificacion voraz (greedy) para la evaluacion de acciones y exige usar el system prompt exacto del contrato de entrenamiento.

## Capacidades

- Emision de acciones estructuradas en JSON con tres tipos soportados: `click`, `type` y `select`.
- Anclaje de una instruccion atomica de navegador a un indice de una lista de hasta 64 candidatos de elementos visibles.
- Manejo de desplegables (combobox) con array `options`, copiando el valor de la opcion de forma literal.
- Relleno de campos de texto con envio opcional mediante el campo booleano `submit`.
- Comprension de instrucciones en chino e ingles, incluyendo valores de texto en chino dentro del JSON (por ejemplo, `"袜子"`).
- Salida con validez de esquema del 100 % en el conjunto de test reservado, lo que permite integrarla en un validador estricto.
- Modo conversacional declarado mediante la etiqueta `conversational`, aunque la funcion real documentada es la decision de accion.
- No dispone de capacidades de conocimiento general, codigo, matematicas, vision, audio, tool calling generico ni razonamiento multi-paso autonomo; la propia ficha prohibe explicitamente su uso para conocimiento general, programacion o acciones autonomas sin restricciones.

## Casos de uso

- Automatizacion de compras guiada por instrucciones: el modelo recibe instrucciones como "anyadir al carrito el producto mas barato" y devuelve la accion `click` sobre el indice correcto de la lista de candidatos visibles, delegando en el host la ejecucion y la verificacion posterior.
- Rellenado de formularios web: con `{"type":"type","index":N,"text":"...","submit":true}` se pueden cubrir flujos de registro, busqueda o envio de datos, siempre que el host revalide el esquema y reasocie el indice a una referencia viva del elemento.
- Seleccion de opciones en desplegables: la tarea de `select` con copia literal de la opcion es adecuada para elegir pais, moneda o metodo de envio en checkouts, donde traducir o normalizar el valor romperia el formulario.
- Pruebas end-to-end y RPA ligera: al ser un modelo de 354,5 M ejecutable en local, puede integrarse en suites de test que necesitan decidir acciones sobre una pagina sin depender de selectores CSS fragiles.
- Componente de grounding en un agente de navegador mayor: se usa como submodulo de decision al que un planificador externo le pasa una instruccion atomica y la lista de candidatos, manteniendo la politica y la autorizacion fuera del modelo.
- Asistencia de accesibilidad por voz o texto: traducir una orden corta a una accion concreta sobre los elementos visibles de la pagina, con validacion por parte del host antes de ejecutar.
- Investigacion en salidas estructuradas: sirve como caso de estudio de constrained output y decodificacion voraz en modelos pequenos, comparando el 98,97 % del checkpoint ajustado frente al 3,09 % del modelo base.
- Despliegue en el borde o en entornos sin GPU: por tamano y requisitos de memoria, puede ejecutarse en portatiles y dispositivos con CPU para tareas de clasificacion de accion en tiempo casi real.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la particion reservada `seed-v8-select-robust`:

| Metrica | Resultado |
|---|---|
| Validez de esquema | 100 % |
| Coincidencia exacta de elemento objetivo | 100 % |
| Coincidencia exacta de accion completa | 98,97 % (384/388) |
| Coincidencia exacta en acciones `click` | 100 % (120/120) |
| Coincidencia exacta en acciones `type` | 100 % (108/108) |
| Coincidencia exacta en acciones `select` | 97,50 % (156/160) |

Comparacion con el modelo base en la misma particion:

| Modelo | Coincidencia exacta de accion completa |
|---|---|
| `hugoc8/zhixia-htlm-action-v2-lfm2.5-350m` | 98,97 % (384/388) |
| `LiquidAI/LFM2.5-350M` sin modificar | 3,09 % |

El autor indica ademas un 100 % en una particion de regresion separada de 340 registros que incluia fallos previos de tipo `Newest`, `CNY` y valores de texto arbitrarios. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible, y la propia ficha advierte de que estas cifras proceden de una evaluacion offline y sintetica que no demuestra finalizacion de tareas en sitios reales, seguridad, calibracion, latencia ni robustez frente a contenido adversarial.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 0,71 GB solo para los pesos (354,5 M x 2 bytes), mas el cache KV y las activaciones; en la practica quedaria por debajo de 2 GB con contextos cortos.
- VRAM estimada en FP32: alrededor de 1,4 GB solo para los pesos.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 2-3 GB o mas de memoria, desde una GTX 1050 Ti o una RTX 3050 hasta una RTX 4090, que es la GPU usada para el entrenamiento del adaptador.
- Inferencia en CPU: viable por el tamano del modelo, aunque no se publican cifras de latencia.
- GPU de gama alta: no son necesarias; A100 o H100 solo tendrian sentido para servir muchas replicas en paralelo.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"`, tal como indica la ficha; tambien son plausibles vLLM o TGI dado el formato safetensors. No se distribuye version GGUF, por lo que Ollama o llama.cpp requeririan una conversion previa no publicada.
- Latencia y throughput: no disponibles. Se recomienda decodificacion voraz para la evaluacion de acciones, lo que reduce la salida a un unico objeto JSON corto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hugoc8/zhixia-htlm-action-v2-lfm2.5-350m` | 354,5 M (5,99 M entrenables en LoRA) | No disponible | Grounding de acciones de navegador con salida JSON restringida | LFM Open License v1.0 | HuggingFace, 0 descargas |
| `LiquidAI/LFM2.5-350M` (base) | 354,5 M | No disponible | Generacion de texto general | LFM Open License v1.0 | HuggingFace |
| `Qwen2.5-0.5B-Instruct` | ~0,5 B | No disponible en la informacion proporcionada | Chat y generacion general | No verificado en la informacion disponible | HuggingFace |
| `SmolLM2-360M-Instruct` | ~0,36 B | No disponible en la informacion proporcionada | Chat y generacion general | No verificado en la informacion disponible | HuggingFace |

Los dos ultimos modelos se incluyen unicamente como referencia de tamano dentro de la misma franja de parametros; sus datos no proceden de la informacion proporcionada y no se han verificado. No se dispone de resultados comparativos de benchmarks entre ellos y este checkpoint, ni de otros checkpoints publicos de grounding de navegador del mismo orden de magnitud en la informacion disponible. La diferencia documentada mas relevante sigue siendo interna: 98,97 % frente a 3,09 % del modelo base en la misma particion de evaluacion.

## Limitaciones y advertencias

- Cuatro fallos del conjunto reservado confundieron `Price: Low to High` con `Price: High to Low` ante la instruccion china "按最低价格排序", lo que indica una debilidad concreta en el orden de criterios de precios.
- Los resultados provienen de una evaluacion sintetica y offline; no demuestran finalizacion de tareas en sitios reales, seguridad, calibracion, latencia ni robustez frente a contenido adversarial de pagina.
- El modelo no ha superado las puertas de replay en navegador real, evaluacion de seguridad, Shadow, Canary ni release por defecto de ZhiXia.
- No debe permitirse que la salida del modelo eluda la autorizacion del host, las comprobaciones de politica, la reasociacion de referencias vivas ni la verificacion del estado posterior a la accion.
- Uso desaconsejado y prohibido por el autor para conocimiento general, programacion o acciones autonomas sin restricciones.
- El modelo es un componente de decision, no un runtime autonomo de navegador; requiere un host de confianza que valide el esquema y ejecute la accion.
- Solo cubre chino e ingles; no hay soporte documentado de otros idiomas.
- El valor de `select` debe copiarse literalmente de las opciones expuestas; no se admite traduccion, normalizacion ni parafrasis, lo que limita su uso fuera del contrato previsto.
- La licencia LFM Open License v1.0 impone condiciones de atribucion y de uso comercial, y Liquid AI mantiene la titularidad del modelo original; conviene revisar el archivo `LICENSE` antes de usar o redistribuir.
- El checkpoint tiene 0 descargas y 0 likes, sin validacion independiente por parte de terceros.
- No hay informacion publicada sobre sesgos, contexto maximo soportado ni comportamiento frente a instrucciones ambiguas o maliciosas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hugoc8/zhixia-htlm-action-v2-lfm2.5-350m
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia LFM Open License v1.0: incluida en el repositorio como archivo `LICENSE` (https://huggingface.co/hugoc8/zhixia-htlm-action-v2-lfm2.5-350m/blob/main/LICENSE)
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
