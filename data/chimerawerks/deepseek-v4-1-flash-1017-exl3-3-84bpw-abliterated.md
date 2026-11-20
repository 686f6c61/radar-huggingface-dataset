# ChimeraWerks/DeepSeek-V4.1-Flash-1017-EXL3-3.84bpw-abliterated

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-3.84bpw-abliterated es una cuantización en formato EXL3 (ExLlamaV3) del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario ChimeraWerks. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) de aproximadamente 136.870 millones de parámetros totales, cuantizado a 3,8361 bits por peso (bpw) sobre las capas lineales, con la cabeza de salida excluida y codificada en 6 bits. El resultado ocupa unos 274 GB distribuidos en 35 shards de safetensors.

La particularidad principal de esta versión es que incorpora la edición de eliminación de rechazos (abliteration) de rango 2 desarrollada por mrfakename, aplicada en FP32 y recodificada a 6 bits, lo que da lugar a unos pesos "sin censura" que rechazan muy pocas peticiones. El autor reporta 0 rechazos de 100 prompts de HarmBench y 0 rechazos completos de 250 prompts seguros de XSTest.

El modelo está pensado para despliegue en hardware modesto para su tamaño: la receta de referencia lo sirve en 3 nodos DGX Spark (GB10, 128 GB cada uno) con paralelismo tensorial TP3 y conexión directa RoCE entre nodos, alcanzando 3.816 tok/s de prefill a 32K y 82-124 tok/s de decodificación con una sola petición, con contexto configurado de 1.048.576 tokens. Es relevante ahora porque demuestra que un MoE de gran tamaño puede servirse en clústeres de pequeñas GPUs unificadas con cuantización agresiva y paralelismo tensorial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer; familia deepseek_v41 |
| Parametros totales | 136.869.563.730 (~136,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens configurados; prompt medido más largo: 131.088 tokens |
| Tipos de cuantizacion | EXL3 a 3,8361 bpw en capas lineales; cabeza de salida en 6 bits; edición abliterated recodificada a 6 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (35 shards, ~274 GB), librería exllamav3 |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, de arquitectura Mixture-of-Experts según la etiqueta `mixture-of-experts` y la familia `deepseek_v41`. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La model card de esta versión cuantizada no documenta el proceso de entrenamiento del modelo original.

La innovación técnica destacable de esta publicación es el pipeline de cuantización y servicio: cuantización EXL3 a 3,8361 bpw con cabeza de salida en 6 bits, edición de abliteration de rango 2 aplicada en FP32 y recodificada a 6 bits, y una receta de despliegue con paralelismo tensorial TP3 sobre 3 DGX Spark conectados por RoCE. El autor reporta una fidelidad de KL media de 0,0784 y un 92,0% de acuerdo top-1 con los logits oficiales del modelo sin cuantizar, el KL más bajo de los ocho packs evaluados. También se menciona el uso de tensorfold y tensor-parallelism como técnicas de despliegue.

## Capacidades

- Generación de texto conversacional y de prosa, con modo greedy y modo thinking (razonamiento extendido).
- Generación de código, con rendimiento de decodificación superior en código (124 tok/s) que en prosa (82 tok/s).
- Razonamiento matemático y de nivel experto: el autor reporta 97,5% en AIME 2025 y 90,5% en GPQA-Diamond.
- Tool calling y function calling, con rutas de API Chat Completions, Responses y Messages.
- Esquemas JSON forzados (enforced JSON schemas).
- Soporte de múltiples streams concurrentes (hasta 16 streams medidos).
- Contexto largo de hasta 1.048.576 tokens configurados.
- Pesos abliterated: baja tasa de rechazos ante prompts sensibles (0 de 100 en HarmBench).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de código en producción: el modelo decodifica a 124 tok/s en modo código greedy con una sola petición, lo que lo hace adecuado para autocompletado y generación de parches en IDE o pipelines de CI/CD con latencia interactiva.
- Procesamiento de documentos largos: con 1.048.576 tokens de contexto y 3.816 tok/s de prefill a 32K, puede ingerir contratos, informes o bases de código extensas y responder preguntas sobre ellos en una sola pasada.
- Agentes multi-paso con tool calling: las rutas de API compatibles con Chat Completions, Responses y Messages, junto con esquemas JSON forzados, permiten integrarlo en frameworks de agentes que encadenan llamadas a herramientas.
- Servicio conversacional de alta concurrencia: con 270 tok/s combinados a 16 peticiones simultáneas en prosa greedy, es viable para atender varios usuarios a la vez en un despliegue pequeño.
- Investigación sobre alineación y seguridad: al ser una versión abliterated con 0 rechazos en HarmBench, sirve para estudiar comportamiento sin censura, evaluar robustez de filtros y comparar con el modelo base.
- Razonamiento matemático y científico asistido: los resultados reportados en AIME 2025 (97,5%) y GPQA-Diamond (90,5%) lo hacen útil para tutoría técnica, verificación de demostraciones y resolución de problemas de nivel experto.
- Despliegue en clústeres de GPUs unificadas pequeñas: la receta TP3 sobre 3 DGX Spark demuestra un caso de uso de inference self-hosted para equipos con hardware de 128 GB por nodo en lugar de GPUs de centro de datos.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Resultado |
|---|---|
| Conjunto estándar (755 items) | 97,1% |
| AIME 2025 | 97,5% |
| GPQA-Diamond | 90,5% (1.434 de 1.584) |
| IFEval | 88,7% |
| LiveCodeBench v6 | 88,0% |
| MMLU-Pro (subconjunto de 500 items) | 88,0% |
| Fidelidad KL media vs. logits oficiales | 0,0784 |
| Acuerdo top-1 vs. logits oficiales | 92,0% |
| HarmBench (rechazos) | 0 de 100 (98 respondidos, 2 parciales) |
| XSTest (rechazos completos) | 0 de 250 |

Rendimiento de prefill medido en 3× DGX Spark, TP3, GPUs a frecuencia de stock:

| Prompt | 4K | 8K | 16K | 32K | 64K | 128K |
|---|---:|---:|---:|---:|---:|---:|
| Prefill tok/s | 3.617 | 3.732 | 3.802 | 3.816 | 3.789 | 3.725 |
| Time to first token | 1,31 s | 2,37 s | 4,49 s | 8,76 s | 17,47 s | 35,36 s |

Rendimiento de decodificación combinado (tok/s sumando todas las peticiones):

| Peticiones simultáneas | 1 | 2 | 4 | 8 | 12 | 16 |
|---|---:|---:|---:|---:|---:|---:|
| Prosa, greedy | 82 | 111 | 161 | 219 | 252 | 270 |
| Prosa, thinking | 68 | 95 | 131 | 173 | 196 | 215 |
| Código, greedy | 124 | 167 | 192 | 220 | 245 | 253 |
| Código, thinking | 82 | 119 | 142 | 175 | 196 | 211 |

Con GPUs limitadas a 2.300 MHz (configuración de producción), el prefill a 32K baja a 3.711 tok/s, la decodificación de código a 122 tok/s y la decodificación de prosa a 16 peticiones a 260 tok/s. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM/espacio de pesos: ~274 GB en total (35 shards de safetensors). No cabe en una sola GPU consumer ni en una GPU de centro de datos de 80 GB.
- Hardware de referencia: 3 × DGX Spark (GB10, 128 GB de memoria unificada cada uno), con paralelismo tensorial TP3 y conexión directa RoCE entre cada par de nodos.
- GPUs consumer: no es viable en RTX 4090 (24 GB) ni en configuraciones de una sola GPU consumer; requiere agregación de memoria de varios nodos o GPUs de gran capacidad.
- Opciones de despliegue: ExLlamaV3 (librería nativa del formato EXL3), con receta de servicio en GitHub del autor. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia: time to first token de 1,31 s a 4K y 35,36 s a 128K; decodificación de 82 tok/s en prosa y 124 tok/s en código con una petición.
- Throughput: hasta 270 tok/s combinados en prosa greedy a 16 peticiones simultáneas.
- Consumo y térmica: pico de SoC de 94,1 °C y pico de GPU de 85 °C con reloj de stock; 58,2 W de potencia de GPU en decodificación; con tope de 2.300 MHz el pico de SoC baja a 86,2 °C y el de GPU a 78 °C, con 41 W en decodificación.
- Clocks: la receta de producción limita las GPUs a 2.300 MHz por defecto, configurable mediante `GPU_CLOCK_CAP_MHZ`.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. La model card menciona que se evaluaron ocho packs de cuantización y que este obtuvo el KL más bajo (0,0784), pero no se detallan los otros packs ni sus especificaciones.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-EXL3-3.84bpw-abliterated | ~136,9 mil millones (MoE) | 1.048.576 | MIT | safetensors EXL3 | Hugging Face, 1.131 descargas |
| Modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Versión abliterated de mrfakename | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser una versión abliterated, es esperable una menor aplicación de filtros de seguridad, lo que puede aumentar la exposición a contenido sesgado o dañino.
- Riesgo de alucinación: no se han publicado tasas de alucinación; como todo modelo generativo, existe riesgo, y la cuantización a 3,8361 bpw introduce una degradación medible (KL media 0,0784, 92,0% de acuerdo top-1) respecto al modelo sin cuantizar.
- Limitaciones de contexto e idioma: el contexto configurado es de 1.048.576 tokens, pero el prompt más largo medido es de 131.088 tokens; no hay datos sobre el rendimiento más allá de esa longitud. Los idiomas soportados no están disponibles.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero se debe verificar la licencia del modelo base original, no disponible en la información proporcionada.
- Caveats de producción: el despliegue requiere 3 nodos DGX Spark con RoCE y ExLlamaV3; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. La abliteration puede degradar capacidades de razonamiento o seguridad en dominios sensibles, y los benchmarks reportados son autoinformados por el autor, no verificados de forma independiente.
- El modelo base es DeepSeek-V4.1-Flash-1017, del que no se dispone de documentación en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/ChimeraWerks/DeepSeek-V4.1-Flash-1017-EXL3-3.84bpw-abliterated
- Receta de servicio en GitHub: https://github.com/ChimeraWerks/DeepSeek-V4.1-Flash-1017-3x-DGX-Spark-TP3-TensorFold-abliterated
- Benchmarks v1.2: https://github.com/ChimeraWerks/DeepSeek-V4.1-Flash-1017-3x-DGX-Spark-TP3-TensorFold-abliterated/blob/main/benchmarks/v1.2/summary.json
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Edición abliterated de mrfakename: https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated
- Herramienta sparkDash: https://github.com/MiaAI-Lab/sparkDash
