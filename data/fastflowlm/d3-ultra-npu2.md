# FastFlowLM/D3-Ultra-NPU2

## Resumen

D3-Ultra-NPU2 es una compilación optimizada del modelo de decisión d3-ultra (Decision 3.0) de vLLM Semantic Router, adaptada por FastFlowLM para ejecutarse sobre las NPU AMD Ryzen AI con arquitectura XDNA 2. El modelo original es un sistema multimodal de 27B parámetros construido sobre la torre de texto Qwen3.5-27B, diseñado específicamente para resolver consultas de tipo "System One": preguntas de elección, sí/no y puntuación sobre un estado dado, opcionalmente acompañadas de imágenes o vídeos, devolviendo una probabilidad calibrada para cada opción.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo de 27B parámetros en hardware de consumo con NPU integrada, mediante cuantización Q4NX propietaria de FastFlowLM con redondeo GPTQ calibrado. El modelo implementa el paradigma "ask once, answer many": lee el estado una sola vez por petición y responde a todas las preguntas asociadas, lo que reduce drásticamente el coste frente a una petición por pregunta.

El paquete ocupa 16,6 GB en disco y unos 15,9 GiB residentes una vez cargado, con un pico medido de 27 GiB para prompts de 32.768 tokens. Soporta hasta 32.768 tokens de entrada por pregunta, clasificación zero-shot, y tareas de localización espacial (`box`) y seguimiento temporal (`track`) sobre vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con torre de texto Qwen3.5-27B (atención híbrida con Gated DeltaNet) y torre de visión de 27 capas |
| Parámetros totales | 27B (torre de texto) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens por pregunta (límite de esta compilación; el modelo upstream valida hasta 131.072) |
| Tipos de cuantización | Q4NX: proyecciones Q4_K con redondeo GPTQ calibrado, token embedding Q8_0, normas y parámetros alpha/beta de Gated DeltaNet en BF16, torre de visión Q4_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (formato propietario de FastFlowLM); ficheros `vision_weight.q4nx` y pesos de texto Q4NX |
| Pipeline | zero-shot-classification |
| Modelo base | vllm-sr/d3-ultra (commit 52ba9e7a) |
| Tamaño del repositorio | 16,6 GB |
| Memoria residente | ~15,9 GiB cargado; pico de 27,0 GiB a 32.768 tokens |
| Hardware objetivo | AMD Ryzen AI con NPU XDNA 2 (probado en Strix Halo) |

## Arquitectura y entrenamiento

El modelo parte de d3-ultra, un modelo de decisión de 27B parámetros de vLLM Semantic Router que combina una torre de texto Qwen3.5-27B con una torre de visión propia de 27 capas, 1152 de ancho y 5120 de salida. La torre de texto emplea atención híbrida con capas Gated DeltaNet, cuyos parámetros `alpha` y `beta` se conservan en BF16 en esta compilación. La atención sigue un esquema `prefix_bidir`: el bloque de estado atiende bidireccionalmente a sí mismo, mientras que cada bloque de pregunta atiende al estado.

El proceso de adaptación a NPU consistió en cuantizar las 64 capas de la torre de texto (400 tensores) a Q4_K con redondeo GPTQ secuencial propio, usando como calibración 300 preguntas sintéticas de System One con el layout `header-v1` y la máscara `prefix_bidir` del modelo, totalizando 147.008 tokens (ninguno procedente del Decision Index). La torre de visión se cuantizó a Q4_K y se ejecuta sobre los kernels de visión existentes de FastFlowLM. No se dispone de información sobre el dataset de entrenamiento original de d3-ultra ni sobre si se aplicaron técnicas de RLHF o DPO.

Una innovación destacable es el layout de prompt `header-v1`: para peticiones de texto, el prompt de cada pregunta comienza con un bloque `Questions in this request:` que enumera todas las preguntas numeradas con sus instrucciones y opciones. Este encabezado forma parte del bloque de estado compartido y se computa una sola vez por petición, añadiendo entre 13 y 3.875 tokens (mediana de 219 en el conjunto de prueba). Además, se aplica una temperatura de softmax de 1,046 para peticiones con exactamente una pregunta de tipo `choice`/`noul`/`score`, y de 1,0 para dos o más.

## Capacidades

- Clasificación zero-shot sobre texto: preguntas de elección (`choice`), sí/no (`noul`) y puntuación (`score`) con probabilidad calibrada por opción.
- Procesamiento multimodal: acepta imágenes en el estado (varias por petición, en base64 PNG, JPEG o WebP, hasta 8 MB y 16 MP cada una, redimensionadas a 1,6 MP).
- Procesamiento de vídeo: 2 fotogramas por segundo, entre 4 y 32 fotogramas, hasta 0,2 MP por fotograma, vídeo máximo de 60 s y 16.384 tokens de visión por petición; requiere FFmpeg para decodificar mp4/webm/mkv/mov/gif.
- Localización espacial (`box`): devuelve una caja por pregunta con confianza calibrada, también en un instante concreto de un vídeo mediante `at`.
- Seguimiento temporal (`track`): una caja por momento a lo largo de un vídeo, con 1 o 2 actualizaciones por segundo y hasta 256 momentos por petición (`D3_MOMENT_ROWS`).
- Respuesta múltiple por petición ("ask once, answer many"): el estado se lee una vez y se responden todas las preguntas asociadas.
- Soporte de `assets`: imágenes dentro del estado, de las instrucciones de una pregunta o de sus opciones.
- API compatible con `POST /v1/systemone`; `GET /v1/systemone/models` expone las capacidades exactas del build en ejecución.
- No soporta `long_context=True` (el upstream permite hasta 131.072 tokens); esta compilación rechaza la petición con HTTP 422.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica un texto de reclamación en categorías como devoluciones, facturación o general mediante preguntas `choice` con probabilidades calibradas, integrándose en un sistema de triaje que decide la cola de destino sin necesidad de un LLM generativo.
- Moderación de contenido con criterios múltiples: se envía un estado (texto del usuario) y varias preguntas `noul` sobre si cumple distintas políticas, aprovechando que todas se responden en una sola lectura del estado y reduciendo coste frente a peticiones individuales.
- Inspección visual de calidad en líneas de producción: con preguntas `box` sobre imágenes de componentes, el modelo localiza defectos y devuelve cajas con confianza, ejecutándose en la NPU de un equipo de planta sin depender de la nube.
- Análisis de vídeo de vigilancia: preguntas `track` sobre un vídeo de hasta 60 s permiten seguir un objeto o persona con una caja por momento a 1 o 2 actualizaciones por segundo, útil para alertas locales en dispositivos edge.
- Clasificación de documentos escaneados: combinando `assets` e imágenes en el estado, el modelo responde preguntas de sí/no sobre el contenido de facturas o formularios, con hasta 32.768 tokens de contexto por pregunta.
- Puntuación de relevancia en motores de búsqueda: preguntas `score` sobre pares consulta-documento para reordenar resultados, con la ventaja de evaluar varios documentos en una sola petición compartiendo el estado.
- Asistente de accesibilidad en tiempo real: descripción y localización de objetos en imágenes o vídeos capturados por la cámara del dispositivo, ejecutándose localmente en un portátil con Ryzen AI para preservar la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente aporta datos de rendimiento medidos: carga del motor en unos 13 s con los ficheros en caché de página, memoria residente pico de 17,2 GiB tras la carga, 18,0 GiB para prompts de hasta 4k tokens y 27,0 GiB a 32.768 tokens (una petición en un servidor recién arrancado). El catálogo de FLM reserva una huella de 28 GB más 8,6 GB de memoria scratch bloqueada. En cuanto a latencia, los modelos hermanos `d3:lite` (0,8B), `d3:nano` (2B) y `d3:mini` (4B) responden una pregunta corta en menos de un segundo, mientras que `d3:ultra` necesita unos pocos segundos.

## Requisitos de hardware

- NPU AMD Ryzen AI con arquitectura XDNA 2 (probado en Strix Halo); requiere Linux con el stack XRT y FastFlowLM 1.0.11 o superior.
- Memoria: planificar un sistema de 32 GB o más; no ejecutar junto a otros modelos grandes. La huella reservada por el catálogo FLM es de 28 GB más 8,6 GB de scratch bloqueada.
- Almacenamiento: 16,6 GB en disco; la primera ejecución o tras una actualización verifica los hashes de los ficheros.
- No cabe en GPU de consumo convencionales: está diseñado específicamente para NPU XDNA 2, no para CUDA ni ROCm sobre GPU.
- Despliegue mediante `flm pull d3:ultra` y `flm serve --decision d3:ultra`; puede convivir con un modelo de chat en el mismo servidor (`flm serve qwen3.5:9b --decision d3:ultra`).
- Latencia estimada: unos pocos segundos por pregunta en d3:ultra, frente a menos de un segundo en los hermanos pequeños.
- No se dispone de datos de throughput (peticiones por segundo) en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D3-Ultra-NPU2 | 27B | 32.768 tokens/pregunta | NPU AMD XDNA 2 | Apache 2.0 | HuggingFace (FastFlowLM) |
| d3:turbo | 27B | 32.768 tokens | NPU AMD XDNA 2 | no disponible | Catálogo FLM |
| d3:mini | 4B | no disponible | NPU AMD XDNA 2 | no disponible | Catálogo FLM |
| d3:nano | 2B | no disponible | NPU AMD XDNA 2 | no disponible | Catálogo FLM |
| d3:lite | 0,8B | no disponible | NPU AMD XDNA 2 | no disponible | Catálogo FLM |

La comparativa se limita a los modelos de la propia familia D3, ya que no se dispone de información sobre alternativas de otros fabricantes con prestaciones equivalentes en NPU. d3:turbo es el modelo de 27B anterior sobre el mismo motor, del que D3-Ultra-NPU2 se diferencia por el layout `header-v1` y la temperatura por número de preguntas. Los hermanos pequeños sacrifican capacidad por latencia subsegundo.

## Limitaciones y advertencias

- Contexto limitado a 32.768 tokens por pregunta en esta compilación, frente a los 131.072 del upstream; los prompts más largos se rechazan con `max_length_exceeded` sin truncar.
- `long_context=True` no está soportado y se rechaza con HTTP 422.
- Requiere hardware muy específico (NPU AMD XDNA 2 con XRT en Linux); no es desplegable en GPU convencionales ni en macOS o Windows sin el stack adecuado.
- Consumo de memoria elevado: 27 GiB de pico a máxima longitud de contexto, lo que exige máquinas de 32 GB o más y excluye la ejecución junto a otros modelos grandes.
- La decodificación de vídeo depende de las librerías compartidas de FFmpeg; sin ellas las peticiones de vídeo se rechazan con HTTP 422 (las listas de fotogramas siempre funcionan).
- Límites multimodales estrictos: imágenes de hasta 8 MB y 16 MP, vídeos de hasta 60 s y 16.384 tokens de visión, 256 momentos por petición en `track`.
- No se dispone de información sobre sesgos, idiomas soportados ni evaluación de alucinación; al ser un modelo de clasificación con probabilidades, el riesgo se traslada a calibración incorrecta de las confianzas.
- La licencia Apache 2.0 permite uso comercial, pero el formato Q4NX y el motor FastFlowLM son específicos del ecosistema del autor; verificar compatibilidad antes de integrar en producción.
- Solo 38 descargas y 0 likes en el momento de la ficha: ecosistema muy incipiente, con poca validación comunitaria.
- El proceso de cuantización GPTQ se calibró con 300 preguntas sintéticas, lo que puede introducir degradación en dominios alejados de ese conjunto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FastFlowLM/D3-Ultra-NPU2
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- Repositorio FastFlowLM: https://github.com/ROCm/FastFlowLM
