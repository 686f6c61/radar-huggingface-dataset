# drofn/SenseNova-Loop-9B-8GB-v3-GGUF

## Resumen

SenseNova-Loop-9B-8GB-v3-GGUF es una cuantización GGUF del modelo SenseNova-Loop-9B, desarrollada por el usuario drofn y publicada bajo licencia Apache-2.0. El modelo base es un transformer con arquitectura "looped" (capas recurrentes) de 9.200 millones de parámetros, orientado a tareas de imagen-texto-a-texto (image-text-to-text) y conversación. Esta versión v3 está específicamente optimizada para ejecutarse en tarjetas gráficas con 8 GB de VRAM, manteniendo todas las capas en la GPU y un contexto de hasta 104.448 tokens en modo texto.

La propuesta de valor de esta cuantización es la fidelidad respecto al modelo original en Q8_0: según el autor, la v3 reduce la divergencia KL media aproximadamente un 20% respecto a la v2 sobre el mismo hardware, con una cola de deriva (percentil 99) entre un 15% y un 33% menor. Incluye además la cabeza MTP (multi-token prediction) para decodificación especulativa, que acelera la generación aproximadamente 1,85 veces, y un proyector visual opcional (mmproj en F16) para entrada de imágenes.

El modelo es relevante para desarrolladores que necesitan desplegar un modelo multimodal de 9B en hardware de consumo (por ejemplo, una RTX 4060 de 8 GB) con contexto largo, tool calling y decodificación especulativa, sin renunciar a una calidad cercana a la cuantización de referencia Q8_0. Los idiomas declarados son inglés, chino y turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas recurrentes (looped-transformer); modelo base SenseNova-Loop-9B |
| Parametros totales | 9.200.240.000 (9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 104.448 tokens (texto, MTP activado, KV cache q4_0); 57.344 tokens con proyector visual cargado (mayor contexto probado con imágenes) |
| Tipos de cuantizacion | GGUF (cuantización principal del repo, con imatrix); KV cache q4_0; token embedding en Q8_0; proyector visual en F16 |
| Idiomas soportados | en, zh, tr |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector mmproj en GGUF F16 |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con capas recurrentes ("looped-transformer"), en la que determinados bloques se reaplican varias veces para aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros. Esta cuantización concreta no aporta información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO); esos datos corresponden a la model card original de sensenova/SenseNova-Loop-9B, que no se incluye en la información disponible.

La innovación técnica de esta versión GGUF reside en el proceso de cuantización: se emplea una imatrix calibrada y se incluye la cabeza MTP para decodificación especulativa, lo que permite generar aproximadamente 1,85 veces más rápido que sin MTP. El autor reporta que la receta de cuantización se eligió sobre tres conjuntos de evaluación (Wikipedia con tool calls y Python, tool calls y Python, y código Python) y se validó sobre un cuarto conjunto retenido (held-out) de código, con reducciones de KLD frente a Q8_0 de entre el 19,5% y el 21,5% respecto a la v2. El proyector visual es el oficial F16 de sensenova/SenseNova-Loop-9B-GGUF, sin modificaciones.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y turco.
- Razonamiento y generación de código (el autor evalúa con conjuntos de Python y tool calls).
- Entrada de imágenes (image-text-to-text) mediante el proyector mmproj opcional en F16.
- Tool calling / function calling: los conjuntos de evaluación del autor incluyen llamadas a herramientas, lo que indica soporte de este modo.
- Decodificación especulativa mediante cabeza MTP (multi-token prediction), con ganancia de velocidad reportada de aproximadamente 1,85x.
- Contexto largo: hasta 104.448 tokens en texto sobre 8 GB de VRAM.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información disponible.

## Casos de uso

- Asistente conversacional local en hardware de consumo: el modelo cabe en una GPU de 8 GB con todas las capas en GPU y 104.448 tokens de contexto, lo que permite mantener conversaciones largas con historial extenso sin degradación por truncamiento.
- Generación de código en estación de trabajo: los conjuntos de evaluación del autor incluyen código Python y tool calls, y la cuantización mantiene una KLD baja (0,0282 en el conjunto 3 y 0,0337 en el conjunto retenido), adecuada para autocompletado y generación de funciones en entornos con 8 GB de VRAM.
- Análisis de documentos e imágenes: con el proyector mmproj cargado, el modelo procesa entradas de imagen-texto (por ejemplo, capturas de pantalla o documentos escaneados) manteniendo hasta 57.344 tokens de contexto, útil para extracción de información de facturas o informes.
- Automatización de llamadas a herramientas: el soporte de tool calling y la decodificación especulativa MTP permiten construir pipelines de agentes que invocan APIs externas con latencia reducida (47,0 tok/s con MTP en una RTX 4060).
- Despliegue en portátiles o equipos con GPU modesta: al usar llama.cpp con KV cache q4_0 y embedding en Q8_0, el modelo se ejecuta en una RTX 4060 de 8 GB con memoria compartida limitada a 200 MiB, lo que lo hace viable en portátiles gaming.
- Prototipado multilingüe en inglés, chino y turco: útil para aplicaciones de atención al cliente o traducción asistida en esos tres idiomas, aunque sin garantías para otros.
- Evaluación de cuantizaciones en investigación: el repo incluye registros de evaluación (evals/sizes.txt, evals/v3-adim2.log) y metodología KLD reproducible, útil para investigadores que comparan estrategias de cuantización con imatrix.

## Benchmarks y rendimiento

Los datos disponibles son métricas de fidelidad de cuantización (KLD frente a Q8_0) y velocidad, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de tareas en la información disponible.

| Metrica | v2 (8GB-v2) | v3 (este repo) | Cambio |
|---|---:|---:|---:|
| KLD media, conjunto 1 (Wikipedia + tool calls + Python) | 0,0703 | 0,0566 | −19,5% |
| KLD media, conjunto 2 (tool calls + Python) | 0,0762 | 0,0612 | −19,8% |
| KLD media, conjunto 3 (código Python) | 0,0359 | 0,0282 | −21,5% |
| KLD media, conjunto 4 (held-out, código) | 0,0425 | 0,0337 | −20,7% |
| KLD percentil 99, conjunto 1 | 0,644 | 0,494 | −23,3% |
| KLD percentil 99, conjunto 2 | 1,604 | 1,081 | −32,6% |
| KLD percentil 99, conjunto 3 | 0,357 | 0,278 | −22,1% |
| KLD percentil 99, conjunto 4 | 0,457 | 0,388 | −15,1% |
| Mismo token top-1, conjunto 1 | 88,46% | 89,75% | +1,29 pp |
| Mismo token top-1, conjunto 2 | 94,48% | 94,91% | +0,43 pp |
| Mismo token top-1, conjunto 3 | 93,47% | 94,18% | +0,71 pp |
| Mismo token top-1, conjunto 4 | 93,34% | 93,82% | +0,48 pp |

| Metrica de velocidad (RTX 4060 8GB, Windows) | Valor |
|---|---:|
| Generación con MTP activado (texto) | 47,0 tok/s |
| Generación sin MTP (texto) | 25,4 tok/s |
| Generación con MTP, prompt de imagen 1080p | 46,9 tok/s |
| Contexto máximo en texto (MTP on) | 104.448 tokens |
| Contexto máximo con proyector visual (mayor probado) | 57.344 tokens |
| VRAM dedicada tras prueba larga | 7.903 MiB |

## Requisitos de hardware

- VRAM estimada: 8 GB para el archivo principal de 6,19 GB con contexto completo y KV cache q4_0; 0,92 GB adicionales si se carga el proyector visual F16. El embedding en Q8_0 se mantiene en RAM del sistema según el autor.
- GPU recomendadas: RTX 4060 8GB (medida por el autor), RTX 3060 Ti 8GB, RTX 3070 8GB, RTX 4060 Ti 8GB; GPUs de 12 GB o más (RTX 4070, RTX 4080, A100, H100) permiten mayor contexto o cuantizaciones más altas.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB como la RTX 4060, con todas las capas en GPU y memoria compartida limitada a 200 MiB.
- Opciones de despliegue: llama.cpp (runtime parcheado, según el autor), con soporte de KV cache q4_0 y MTP; compatible con endpoints. Otras opciones como vLLM, Ollama o TGI no están confirmadas en la información disponible.
- Latencia y throughput: 47,0 tok/s con MTP y 25,4 tok/s sin MTP en RTX 4060 8GB (ejecuciones únicas, Windows, sin pantalla conectada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD media (su propio conjunto) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| SenseNova-Loop-9B-8GB-v3 (este repo) | 9,2B | 104.448 (texto, 8 GB) | 0,0566 / 0,0612 (conjuntos 1/2) | Apache-2.0 | Hugging Face (drofn) |
| AD-IQ4_XS (AtomicChat) | 9,2B (base) | ~16K en 8 GB | 0,0535 | Apache-2.0 (base) | Hugging Face (AtomicChat) |
| Q4_K_M estándar (wepiqx) | 9,2B (base) | no disponible | 0,232 (Wikipedia, 1.024 contexto) | Apache-2.0 (base) | Hugging Face |
| Q4_K_M con imatrix de v1 | 9,2B (base) | no disponible | 0,1064 / 0,1235 (conjuntos 1/2) | Apache-2.0 (base) | Hugging Face (drofn, v1) |

Nota: los valores de KLD no son comparables entre filas porque cada publicador usa referencia, texto y longitud de contexto distintos. La comparación justa es el cambio frente a la línea base Q4_K_M medida por el mismo publicador: la v3 reporta −47% / −50% frente a Q4_K_M con imatrix de v1. En la fecha de publicación no existían cuantizaciones de bartowski, unsloth, mradermacher o lmstudio-community para SenseNova-Loop-9B.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo base entrenado principalmente en inglés y chino, es probable un sesgo hacia esas culturas e idiomas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- Limitaciones de contexto: 104.448 tokens solo en texto y con KV cache q4_0 en 8 GB; con el proyector visual cargado el mayor contexto probado es 57.344 tokens, y la v2 con visión alcanzaba 81.920 tokens con mayor KLD.
- Limitaciones de idioma: solo se declaran inglés, chino y turco; el rendimiento en castellano no está evaluado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base sensenova/SenseNova-Loop-9B y del proyector oficial.
- Caveats de producción: requiere un runtime llama.cpp parcheado según el autor; las métricas de velocidad son ejecuciones únicas en una RTX 4060 con Windows, por lo que el throughput en otros sistemas puede diferir; la decodificación especulativa MTP puede no estar soportada en todos los backends.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-19, por lo que su validación por la comunidad es mínima.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF
- Archivo principal GGUF: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF/resolve/main/SenseNova-Loop-9B-8GB-v3.gguf
- Proyector visual F16: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF/resolve/main/mmproj-SenseNova-Loop-9B-F16.gguf
- Versión v2: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v2-GGUF
- Versión v1: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- GGUF oficial del modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- Cuantización AD-IQ4_XS de AtomicChat: https://huggingface.co/AtomicChat/SenseNova-Loop-9B-GGUF
