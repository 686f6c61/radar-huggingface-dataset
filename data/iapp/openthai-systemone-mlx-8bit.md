# iapp/OpenThai-SystemOne-MLX-8bit

## Resumen

OpenThai-SystemOne-MLX-8bit es una versión cuantizada a 8 bits del modelo iapp/OpenThai-SystemOne, un modelo de decisión de tipo «System One» desarrollado por iApp Technology / OpenThaiGPT. A diferencia de un modelo generativo convencional, no produce texto: realiza una única pasada hacia delante sobre un texto o un estado JSON y devuelve respuestas tipadas —elección entre hasta 255 opciones (`choice`), puntuación ordinal (`score`) y sí/no (`noul`)— con probabilidades calibradas por opción.

El modelo combina una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandés y una cabeza de decisión de 256 ranuras. Este repositorio concreto es una cuantización MLX de 8 bits affine (group size 64) pensada para Apple Silicon, con 752.412.480 parámetros reales en safetensors y un tamaño de repo de 0,8 GB. La cabeza de decisión y las temperaturas por tipo de pregunta se mantienen en fp32, de modo que la cuantización solo perturba el estado oculto que lee la cabeza.

Su relevancia actual radica en dos factores: por un lado, ofrece un modelo de clasificación y decisión con soporte nativo de tailandés, un idioma con cobertura limitada en la mayoría de modelos abiertos; por otro, la cuantización MLX permite ejecutar la inferencia en portátiles Apple Silicon con latencias del orden de milisegundos, sin GPU dedicada ni servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (torre de texto Qwen3.5-0.8B) con cabeza de decisión de 256 ranuras; no es MoE |
| Parametros totales | 752.412.480 (~752 M), dato de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 8-bit affine, group size 64 (este repositorio); la model card menciona también una variante de 4 bits |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); cabeza de decisión y temperaturas por tipo en fp32 (`head.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura consta de dos piezas. La primera es una torre de texto derivada de Qwen3.5-0.8B sometida a preentrenamiento continuado en tailandés. La segunda es una cabeza de decisión de 256 ranuras que se aplica sobre los estados ocultos finales de la torre y que emite, para cada pregunta tipada, una distribución de probabilidad sobre las opciones disponibles. El cliente incluido en el repositorio (`MLXSystemOneClient`) se encarga de ejecutar la torre con mlx-lm y de aplicar después la cabeza sobre los estados ocultos.

En esta cuantización solo se convierten la torre y la tabla de embeddings (MLX cuantiza también la tabla de embeddings). La cabeza de 256 ranuras y las temperaturas por tipo de pregunta permanecen en fp32, por lo que la pérdida de precisión se limita al estado oculto que consume la cabeza. El modelo base corresponde a la versión v0.3 (commit `f3709948`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO en la información proporcionada; la model card remite al repositorio del modelo base para esos detalles.

## Capacidades

- Decisión de una sola pasada: responde preguntas tipadas sin generar texto, con probabilidades calibradas por opción.
- Preguntas de tipo `choice`: selección entre hasta 255 opciones.
- Preguntas de tipo `score`: puntuación ordinal (por ejemplo, niveles de calidad).
- Preguntas de tipo `noul`: respuesta booleana sí/no.
- Entrada multimodal en formato de datos: acepta texto plano o un estado en JSON sobre el que formular las preguntas.
- Multilingüismo limitado a tailandés e inglés como idiomas declarados.
- No soporta generación de texto libre ni diálogo conversacional.
- No soporta tool calling generativo; el benchmark `xlam_tools` mide selección de herramienta como tarea de decisión `choice`, no la emisión de llamadas a funciones.
- No soporta razonamiento multi-paso ni flujos de agente autónomo.
- No dispone de capacidades de visión ni de audio.
- No dispone de modo de razonamiento extendido (thinking mode).

## Casos de uso

- Análisis de sentimiento en tailandés en producción: el modelo clasifica opiniones de usuarios (`choice` con opciones positivo/negativo/neutro) en una sola pasada, con latencias de milisegundos, lo que permite procesar grandes volúmenes de reseñas o tickets sin coste de generación.
- Moderación de contenido: tareas como las de los subsets `civil_comments` y `aegis2` (este último con formato `noul`) permiten filtrar comentarios tóxicos o no conformes mediante decisiones binarias calibradas.
- Enrutado de intenciones en asistentes: clasificación de intención sobre catálogos cerrados, como en `banking77` o `massive_th`, para dirigir una consulta al flujo o al departamento correspondiente antes de invocar un modelo generativo.
- Evaluación automática de resúmenes: los subsets `summeval-consistency` y `summeval-relevance` usan el tipo `score`, de modo que el modelo puede puntuar la coherencia y la relevancia de un resumen respecto al documento original dentro de un pipeline de evaluación.
- Detección de contradicciones y verificación de coherencia: tareas de inferencia de lenguaje natural (`multinli`, `xnli_th`) con formato `choice` y `noul` para comprobar si una hipótesis se sigue de una premisa.
- Respuesta a preguntas sobre documentos: los subsets `boolq`, `squad2` y `pubmedqa` ilustran el uso del modelo para decidir si un pasaje responde a una pregunta o para elegir la opción correcta sobre un texto dado.
- Selección de herramienta en pipelines de agentes: con el formato `choice` evaluado en `xlam_tools`, el modelo puede actuar como enrutador que decide qué herramienta o API corresponde a una consulta, dejando la ejecución a otro componente.
- Clasificación de temas y análisis de redes sociales: entrenado y evaluado en conjuntos tailandeses como `wisesight`, `prachathai` y `sib200_th`, es adecuado para etiquetado temático y de sentimiento en redes sociales tailandesas.
- Inferencia local en portátiles Apple Silicon: al ejecutarse con mlx-lm y ocupar 0,8 GB, permite desplegar clasificadores en el propio dispositivo sin conexión ni GPU dedicada.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. Son exactitudes con un único orden de opciones sobre los primeros 800 registros de cada conjunto (`scripts/06_eval.py --limit 800`), los mismos registros para el original en bf16 y para esta cuantización. Los subsets de tipo `score` reportan exactitud de nivel exacto.

| Subset | Original bf16 | Esta version 8-bit | Δ |
|---|---|---|---|
| aegis2 (noul) | 83,2 | 83,2 | +0,0 |
| boolq (noul) | 79,7 | 79,3 | -0,3 |
| civil_comments (noul) | 79,0 | 79,0 | +0,0 |
| helpsteer2 (score) | 41,6 | 41,6 | +0,0 |
| massive-de-DE (choice) | 88,3 | 88,3 | +0,0 |
| massive-en-US (choice) | 88,3 | 88,3 | +0,0 |
| multinli (choice) | 89,0 | 88,6 | -0,3 |
| paws (noul) | 94,0 | 94,0 | +0,0 |
| pubmedqa (choice) | 64,0 | 64,0 | +0,0 |
| squad2 (noul) | 89,3 | 89,3 | +0,0 |
| summeval-consistency (score) | 75,0 | 75,7 | +0,7 |
| summeval-relevance (score) | 21,7 | 21,2 | -0,4 |
| vitaminc-dev (choice) | 72,5 | 72,0 | -0,5 |
| Macro, bench publico de 13 subsets | 74,3 | 74,2 | -0,1 |
| banking77 (choice) | 59,1 | 59,1 | +0,0 |
| contrastive_th (choice) | 80,7 | 80,7 | +0,0 |
| contrastive_th (noul) | 83,5 | 83,5 | +0,0 |
| contrastive_th (score) | 78,6 | 76,8 | -1,8 |
| massive_th (choice) | 90,6 | 91,0 | +0,4 |
| prachathai (choice) | 98,3 | 98,3 | +0,0 |
| prachathai (noul) | 93,4 | 93,5 | +0,1 |
| sib200_th (choice) | 77,9 | 78,4 | +0,5 |
| wisesight (choice) | 48,9 | 49,0 | +0,1 |
| wongnai (score) | 64,5 | 64,8 | +0,2 |
| xlam_tools (choice) | 99,4 | 99,4 | +0,0 |
| xnli_th (choice) | 79,8 | 79,8 | +0,0 |
| xnli_th (noul) | 86,8 | 86,4 | -0,4 |
| Macro, conjuntos tailandeses | 80,1 | 80,0 | -0,1 |

La cuantización a 8 bits apenas altera los resultados: la mayor pérdida se da en `contrastive_th (score)`, con 1,8 puntos, y el resto de variaciones quedan por debajo de 1 punto. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Tamaño de pesos: 0,8 GB en el repositorio, correspondientes a 752.412.480 parámetros en 8 bits.
- Memoria unificada estimada para inferencia en 8 bits: en torno a 1,5-2 GB considerando pesos, caché KV y sobrecarga del runtime (estimación propia a partir del tamaño de pesos; no publicada por el autor).
- Memoria unificada estimada en 4 bits: en torno a 1-1,5 GB (estimación propia).
- Plataforma: MLX está diseñado para Apple Silicon, por lo que en la práctica este repositorio se ejecuta en chips de la serie M (M1, M2, M3, M4), tanto en versiones base como Pro, Max y Ultra. El autor reporta mediciones en un MacBook Pro con M3 Max.
- GPU NVIDIA: este repositorio no ofrece pesos GGUF ni CUDA; para usar GPUs NVIDIA habría que recurrir al modelo base en PyTorch. El autor indica que el modelo original en PyTorch sobre MPS ronda los 150 ms.
- Despliegue: `mlx-lm` para la torre y el cliente `MLXSystemOneClient` incluido en el repositorio para aplicar la cabeza de decisión. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta versión.
- Latencia: aproximadamente 19 ms por decisión de 3 preguntas en tailandés con la variante de 4 bits sobre M3 Max. No hay cifras publicadas para la variante de 8 bits.
- Almacenamiento: 0,8 GB en disco, más el espacio necesario para las dependencias (`mlx-lm`, `torch`, `transformers`, `safetensors`, `pydantic`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| iapp/OpenThai-SystemOne-MLX-8bit | ~752 M | No disponible | Apache-2.0 | safetensors (MLX 8-bit) | Esta ficha; macro 74,2 en el bench público y 80,0 en los conjuntos tailandeses |
| iapp/OpenThai-SystemOne (bf16) | ~752 M | No disponible | Apache-2.0 | safetensors (bf16) | Modelo base v0.3; macro 74,3 y 80,1, respectivamente; requiere PyTorch |
| Otros modelos de decisión o clasificación tailandeses | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El modelo no genera texto: solo emite etiquetas y probabilidades sobre preguntas tipadas. No debe emplearse como modelo conversacional ni de completado.
- La longitud de contexto no está documentada, lo que impide planificar con precisión el tamaño máximo de texto o JSON de entrada.
- Los idiomas declarados son tailandés e inglés. El benchmark incluye `massive-de-DE` en alemán, pero eso no implica soporte general de ese idioma.
- La cuantización introduce pequeñas pérdidas de precisión, la mayor en `contrastive_th (score)` con 1,8 puntos y hasta 0,5 puntos en otros subsets. Conviene validar sobre el dominio objetivo antes de desplegar.
- Los puntos débiles del modelo base se mantienen: `summeval-relevance` (21,7 en bf16) y `helpsteer2` (41,6) indican un rendimiento bajo en tareas de puntuación ordinal, y `wisesight` (48,9) y `banking77` (59,1) quedan lejos de la saturación.
- El riesgo de alucinación no se manifiesta como texto inventado, pero sí como probabilidades sobreconfiadas o mal calibradas en dominios alejados de los datos de entrenamiento. Las temperaturas por tipo están fijadas en fp32 y no se documentan procedimientos de recalibración por parte del usuario.
- No se documentan sesgos específicos ni evaluaciones de equidad en la información disponible.
- Licencia Apache-2.0, que permite uso comercial con atribución y sin restricciones de copyleft. Es la misma licencia que la del modelo base.
- El repositorio tiene 0 descargas y 0 interacciones en el momento de la consulta, por lo que no cuenta con validación de la comunidad.
- El repositorio depende de MLX y de un cliente propio; no es portable directamente a entornos CUDA ni a servidores de inferencia estándar como vLLM o TGI.
- Los metadatos indican una fecha de creación de 2026-09-25, posterior a la fecha habitual de publicación; conviene verificarla si se necesita trazabilidad estricta de versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iapp/OpenThai-SystemOne-MLX-8bit
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a la International Association of Privacy Professionals (IAPP), una entidad distinta sin relación con el autor del modelo. No se dispone de enlaces a papers, blogs o demos adicionales.
