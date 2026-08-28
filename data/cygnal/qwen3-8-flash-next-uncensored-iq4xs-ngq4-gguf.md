# cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF

## Resumen

El modelo `cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF` es una cuantización GGUF del modelo `orcarouter/Qwen3.8-Flash-Next-Uncensored`, que a su vez es una versión "abliterada" (sin mecanismos de rechazo) del modelo híbrido Qwen3.8-Flash-Next desarrollado por el equipo Qwen de Alibaba. El autor de esta build, cygnal, ha logrado empaquetar un modelo de aproximadamente 180.000 millones de parámetros totales en un único archivo GGUF de 98,4 GB, con solo 6.000 millones de parámetros activos por token gracias a su arquitectura de mezcla de expertos (MoE). Esto permite ejecutarlo en hardware de consumo con memoria unificada, como el AMD Ryzen AI Max+ 395 (Strix Halo), algo inédito para un modelo de este tamaño.

La relevancia de esta build radica en que es la primera GGUF funcional de la arquitectura `qwen4exp` (Gated DeltaNet + Qwen Sparse Attention) que funciona con llama.cpp estándar, sin necesidad de formatos de tensor personalizados ni runtimes modificados. Además, al ser una versión "uncensored", elimina los rechazos de seguridad del modelo original, lo que la convierte en una herramienta de investigación interesante para estudiar el comportamiento del modelo sin restricciones, aunque con las advertencias éticas correspondientes. El modelo es nativamente multimodal (incluye un proyector de visión) y soporta un contexto nativo de 262.000 tokens, aunque esta build solo se ha probado hasta 6.500.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (36 capas) + Qwen Sparse Attention (12 capas), MoE con 512 expertos (10 enrutados + 1 compartido) |
| Parametros totales | 176.943.899.520 (~177B, incluye 125B principales + 51B de tabla n-gram PLE + 4B de cabeza MTP no exportada) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K nativo (probado hasta 6.5K en esta build) |
| Tipos de cuantizacion | IQ4_XS (pesos bulk), Q6_K (lm head), Q4_0 (tabla n-gram PLE); promedio 5.61 BPW |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen, no comercial) |
| Formato de pesos | GGUF (archivo único de 98,4 GB + proyector de visión mmproj de 908 MB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida innovadora que combina dos mecanismos de atención: 36 capas de Gated DeltaNet, un modelo de estado lineal recurrente que reduce el coste de atención a escala cuadrática, y 12 capas de Qwen Sparse Attention (QSA), que limita el crecimiento del cache de claves y valores. Esta combinación permite manejar contextos de hasta 262.000 tokens con un coste computacional contenido. El modelo es de tipo MoE con 512 expertos, de los cuales 10 se activan por token junto con un experto compartido, resultando en 6.000 millones de parámetros activos de un total de aproximadamente 180.000 millones.

La versión "uncensored" se obtuvo mediante abliteración, una técnica que elimina las direcciones de activación asociadas al comportamiento de rechazo, aplicada por el autor de `orcarouter`. La cuantización IQ4XS-NGQ4 de esta build utiliza IQ4_XS para los pesos principales, Q6_K para la cabeza de salida (lm head) y Q4_0 para la tabla de embeddings n-gram de 51.000 millones de parámetros, que al ser de solo lectura tolera bien la cuantización de bajo bit. El proceso requirió un paso de de-cuantización y re-cuantización por lotes debido a la forma inusual de las filas de la tabla n-gram. No se ha exportado la cabeza MTP (multi-token prediction), por lo que no hay decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento técnico con alta precisión en tareas de código: 82,3% pass@1 en HumanEval y 78,0% en HumanEval+ (medido con greedy, 4096 tokens máximos).
- Procesamiento multimodal: incluye un proyector de visión (mmproj) de 908 MB en BF16, compatible con el estilo de Qwen3-VL, que permite entrada de imágenes.
- Contexto largo nativo de 262.000 tokens, aunque esta build solo se ha verificado hasta 6.500 tokens; la arquitectura QSA limita el crecimiento del cache KV.
- Capacidad de ejecución en hardware AMD con memoria unificada (Strix Halo) gracias a la cuantización y al soporte de llama.cpp vía Vulkan o ROCm.
- Comportamiento "uncensored": se ha eliminado el mecanismo de rechazo del modelo base, por lo que responde a peticiones que los modelos alineados normalmente rechazarían (verificado cualitativamente con un prompt de cerrajería).
- Soporte de tool calling y function calling: no disponible en la información proporcionada, aunque es probable dado el origen Qwen; no se ha confirmado en esta build.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de código en entornos de investigación: con un 82,3% en HumanEval, el modelo puede asistir en la escritura de funciones y algoritmos complejos. Su cuantización permite ejecutarlo en una estación de trabajo con AMD Strix Halo, sin necesidad de servidores en la nube.
- Procesamiento de documentos técnicos extensos: gracias a su contexto nativo de 262K tokens, puede analizar manuales, especificaciones o codebases completas en una sola pasada, aunque en esta build solo se ha probado hasta 6.5K.
- Análisis de imágenes y documentos escaneados: el proyector de visión permite combinar entrada visual con texto, útil para extraer información de diagramas, capturas de pantalla o formularios.
- Estudio de comportamientos de modelos sin alineación: al ser una versión abliterada, es útil para investigar cómo se comporta un modelo de gran tamaño sin guardas de seguridad, siempre en entornos controlados y con fines académicos.
- Desarrollo de asistentes técnicos especializados: su capacidad de razonamiento y generación de código lo hace adecuado para prototipar asistentes de programación o soporte técnico de nicho, donde se requiere conocimiento profundo y respuestas directas.
- Evaluación de técnicas de cuantización: esta build sirve como referencia para comparar el impacto de la cuantización IQ4XS-NGQ4 en un modelo MoE de ~180B frente a otras estrategias de compresión, ya que el autor ha publicado métricas de rendimiento y velocidad.

## Benchmarks y rendimiento

El autor ha publicado resultados de codificación en el benchmark EvalPlus (greedy, 4096 tokens máximos), comparando esta build con otras cuantizaciones locales del mismo autor:

| Benchmark | IQ4XS-NGQ4 (Flash-Next ~180B) | Q6_K (27B dense) | Q4_K_M (27B dense) | ROCmFP6 (27B dense) | ROCmFP4 (27B dense) |
|---|---|---|---|---|---|
| HumanEval (pass@1) | 82,3% | 82,9% | 75,6% | 73,8% | 71,3% |
| HumanEval+ (pass@1) | 78,0% | no disponible | no disponible | no disponible | no disponible |

El rendimiento de decodificación medido en un AMD Ryzen AI Max+ 395 (gfx1151, Vulkan, llama.cpp con PR #27742) es de 21,7 tok/s con un prompt de 3.063 tokens y 20,5 tok/s con 6.516 tokens, con prefills de 368,7 y 345,4 tok/s respectivamente. No se han publicado resultados de otros benchmarks como MMLU, GSM8K o GPQA en la información disponible.

## Requisitos de hardware

- VRAM estimada: 99 GB para los pesos del modelo (98,4 GB) más memoria para el cache KV y el proyector de visión (908 MB). En total, se recomienda al menos 110-120 GB de memoria unificada o VRAM.
- GPU recomendadas: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada es la plataforma de referencia. También puede ejecutarse en otras GPUs AMD con soporte Vulkan o ROCm, siempre que dispongan de suficiente memoria.
- No cabe en GPUs de consumo típicas: una RTX 4090 (24 GB) o una RTX 5090 (32 GB) son insuficientes. Se necesitan soluciones con memoria unificada grande o múltiples GPUs.
- Opciones de despliegue: llama.cpp compilado desde la rama `qwen4exp/qwen3.8-flash-next` del repositorio de danielhanchen (PR #27742), con backend Vulkan o ROCm. También existe un contenedor preconstruido en el proyecto `kyuz0/amd-strix-halo-toolboxes` (rocm-7.14-qwen-3.8-flash-next). No es compatible con Ollama, LM Studio ni versiones estables de llama.cpp hasta que se fusione el PR.
- Latencia y throughput: decodificación de 20-22 tok/s y prefill de 345-369 tok/s en el hardware de referencia, sin decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~180B | 6B | 262K | no disponible | qwen-community-1.0 | HuggingFace |
| Qwen3.8-27B (dense) | 27B | 27B | no disponible | no disponible | qwen-community-1.0 | HuggingFace |
| Esta build (IQ4XS-NGQ4) | ~177B | 6B | 262K (probado 6.5K) | 82,3% | qwen-community-1.0 | HuggingFace |

No se dispone de datos de benchmarks para el modelo base sin cuantizar ni para el Qwen3.8-27B en la información proporcionada. La comparativa con el 27B dense se limita a los resultados de HumanEval publicados por el autor para sus propias cuantizaciones, donde esta build supera al Q4_K_M del 27B (75,6%) y se acerca al Q6_K (82,9%), a pesar de tener un bits-per-weight promedio más bajo, probablemente debido a la arquitectura MoE y al mayor número total de parámetros.

## Limitaciones y advertencias

- Modelo sin guardas de seguridad: la abliteración elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o éticamente cuestionable. No debe usarse en producción sin un filtrado adicional riguroso.
- Licencia restrictiva: la licencia qwen-community-1.0 no permite uso comercial. Cualquier despliegue en entornos empresariales o productos comerciales queda excluido.
- Requiere una rama no estable de llama.cpp: el PR #27742 aún no está fusionado en master, por lo que la reproducibilidad y el soporte a largo plazo no están garantizados. Herramientas populares como Ollama o LM Studio no pueden cargar este archivo.
- Contexto no verificado: aunque el modelo soporta 262K tokens nativamente, esta build solo se ha probado hasta 6.500 tokens. El uso de contextos más largos puede provocar degradación de rendimiento o errores inesperados.
- Sin decodificación especulativa: la cabeza MTP no se ha exportado, por lo que la velocidad de decodificación (20-22 tok/s) es inferior a la que podría alcanzarse con ella.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados. La ausencia de guardas no mejora la veracidad.
- Sesgos: no se han publicado evaluaciones de sesgos para esta build. El modelo base puede contener sesgos de los datos de entrenamiento, y la abliteración no los corrige.
- Requisitos de memoria muy elevados: necesita ~99 GB solo para los pesos, lo que limita su ejecución a hardware con memoria unificada de al menos 128 GB o configuraciones multi-GPU.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF
- Modelo base (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Modelo Qwen3.8-27B en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Página de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- PR #27742 de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27742
- Rama de llama.cpp con soporte qwen4exp: https://github.com/danielhanchen/llama.cpp (rama `qwen4exp/qwen3.8-flash-next`)
- Contenedor preconstruido para Strix Halo: https://github.com/kyuz0/amd-strix-halo-toolboxes
