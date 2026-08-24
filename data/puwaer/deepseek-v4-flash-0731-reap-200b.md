# puwaer/DeepSeek-V4-Flash-0731-reap-200b

# puwaer/DeepSeek-V4-Flash-0731-reap-200b

## Resumen

Este modelo es una versión comprimida del checkpoint `deepseek-ai/DeepSeek-V4-Flash-0731` (284B parámetros, arquitectura MoE con 43 capas y 256 expertos enrutados por capa). El autor, `puwaer`, aplica poda de expertos ponderada por el router (REAP, del paper *arxiv:2510.13999*), reduciendo los expertos enrutados de 256 a 178 por capa sin ningún paso de entrenamiento, destilación o gradiente. El resultado es un checkpoint que pasa de 156 GiB a 104 GiB, con una pérdida media de rendimiento inferior a 1 punto porcentual en los benchmarks publicados.

La relevancia de este modelo es doble: por un lado, demuestra que la poda de expertos basada en estadísticas de calibración puede reducir significativamente el tamaño de un modelo MoE de alta capacidad manteniendo casi intactas sus capacidades; por otro, ofrece una alternativa más ligera y barata de desplegar que el modelo original, con licencia MIT y compatible con la mayoría de motores de inferencia. Los parámetros totales son 199.914.652.711 (≈200B), y aunque la tarjeta del modelo no especifica la longitud de contexto, el modelo base declara soporte de hasta 1M de tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con 43 capas decodificadoras |
| Parámetros totales | 199.914.652.711 (≈200B) |
| Parámetros activos | No disponible (6 expertos activos por token) |
| Longitud de contexto | No especificada en la tarjeta (el modelo base declara hasta 1M de tokens) |
| Tipos de cuantización | No disponibles (existe una versión GGUF en el repositorio `puwaer/DeepSeek-V4-Flash-0731-reap-200b-gguf`) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | Safetensors (también disponible en GGUF) |

## Arquitectura y entrenamiento

El modelo es un MoE (Mixture-of-Experts) con 43 capas decodificadoras, cada una con 178 expertos enrutados (frente a los 256 del modelo base). La poda se realiza mediante REAP (router-weighted expert activation pruning), un método que elimina expertos basándose en la contribución ponderada de cada uno al router, calculada a partir de estadísticas de calibración. No hay ningún tipo de entrenamiento posterior: la compresión se ejecuta en una sola pasada sobre un conjunto de datos de calibración (mezcla de C4, matemáticas y código con pesos 0.0, 0.3 y 0.7 respectivamente), usando 3072 muestras de 512 tokens. El proceso se ejecuta de forma *streaming*, lo que permite procesar el checkpoint original de 156 GiB en una GPU con 96 GB de memoria, leyendo y escribiendo capas una a una.

Una característica técnica destacable es la eliminación de los módulos de predicción multi-token (MTP) `mtp.0`, `mtp.1` y `mtp.2` que estaban presentes en el modelo base. Esto implica que la decodificación especulativa basada en MTP no está disponible; los motores que busquen estos pesos caerán automáticamente a decodificación estándar. El modelo incluye una plantilla de chat (`chat_template.jinja`) que reproduce fielmente el formato de prompts del modelo base, y también se distribuye el script `encoding/encoding_dsv4.py` original para casos avanzados (tool calling, mensajes de desarrollador, etc.).

## Capacidades

- **Generación de texto y conversación**: modelo de lenguaje de propósito general con soporte para turnos de sistema, usuario y asistente, y modo de razonamiento (`thinking`) activado por defecto.
- **Razonamiento y resolución de problemas**: incluye un modo de pensamiento (thinking) con niveles de esfuerzo `low`, `high` y `max`, que permite al modelo desglosar problemas complejos antes de responder.
- **Generación de código**: alto rendimiento en tareas de programación, con resultados de `pass@1` de 0.8720 en HumanEval+ y 0.7407 en MBPP+ (con greedy decoding).
- **Matemáticas**: capacidad sólida en problemas matemáticos, con 0.6880 en MATH-500 y 0.9401 en GSM8K.
- **Soporte de tool calling**: el modelo base incluye un encoder Python que implementa tool calling y mensajes de tipo `developer` o `latest_reminder`. Este encoder se copia verbatim en el repositorio, aunque la `chat_template.jinja` no los implementa.
- **Capacidades de agente**: el modelo base está diseñado para workflows agénticos (según la documentación de NVIDIA), aunque no se especifica en la tarjeta del modelo podado.

## Casos de uso

- **Asistente de programación en producción**: el modelo puede integrarse en entornos de desarrollo para generar código, completar funciones o escribir tests. Su rendimiento en HumanEval+ y MBPP+ es casi idéntico al modelo base, y al ocupar un 33% menos de espacio en disco, es viable en clústeres con GPUs más modestas.
- **Atención al cliente automatizada**: gracias a su modo de razonamiento y a la capacidad de mantener conversaciones multi-turno (el modelo base soporta hasta 1M de tokens de contexto), puede gestionar diálogos largos con clientes, resolviendo dudas técnicas o derivando a agentes humanos cuando sea necesario.
- **Análisis de datos y generación de informes**: puede procesar datos estructurados y generar resúmenes, explicaciones o informes en lenguaje natural, aprovechando su capacidad de razonamiento matemático y de texto.
- **Generación de documentación técnica**: a partir de especificaciones de código o APIs, el modelo puede redactar documentación detallada, guías de uso o comentarios de código, reduciendo el trabajo manual de los desarrolladores.
- **Tutor virtual de matemáticas y ciencias**: su rendimiento en GSM8K y MATH-500 lo hace útil para plataformas educativas que ofrecen explicaciones paso a paso de problemas matemáticos, con el modo `thinking` activado para mostrar el razonamiento.
- **Prototipado de agentes autónomos**: al conservar la capacidad de tool calling (a través del encoder Python) y el modo de razonamiento, puede servir como base para experimentos de agentes que ejecutan tareas de múltiples pasos, como búsqueda de información o ejecución de scripts.

## Benchmarks y rendimiento

| Modelo | Expertos | Tamaño | GSM8K | MATH-500 | HumanEval+ | MBPP+ | Media |
|---|---|---|---|---|---|---|---|
| Base 284B | 256 | 156 GiB | 0.9484 | 0.7060 | 0.8720 | 0.7407 | 0.8168 |
| **REAP 200B (este modelo)** | 178 | 104 GiB | **0.9401** | **0.6880** | **0.8720** | **0.7407** | **0.8102** |
| REAM 200B | 178 | 104 GiB | 0.8620 | 0.6080 | 0.8841 | 0.7698 | 0.7810 |
| REAP 150B | 132 | 79 GiB | 0.9295 | 0.7140 | 0.8963 | 0.7593 | 0.8248 |
| REAM 150B | 132 | 79 GiB | 0.6922 | 0.5020 | 0.8537 | 0.7328 | 0.6952 |

Diferencia con el modelo base (en puntos): GSM8K −0.83, MATH-500 −1.80, HumanEval+ +0.00, MBPP+ +0.00, media −0.66. Métricas: GSM8K `exact_match, strict-match`, MATH-500 `math_verify, none`, HumanEval+/MBPP+ `pass@1_plus`. Todas con greedy (n=1), contexto de 4096 tokens, `enable_thinking=false`, servido con SGLang.

## Requisitos de hardware

- **VRAM estimada**: no se ha publicado un dato oficial. El checkpoint pesa 104 GiB en FP16 (safetensors), por lo que en FP16 se necesitarían al menos 2 GPU con 80 GB de VRAM (p. ej., 2× A100/H100) o 4 GPU de 40 GB. Con cuantización FP8 o GGUF se puede reducir el requisito, pero no hay mediciones publicadas.
- **GPU recomendadas**: la tarjeta de modelo indica que se sirve con SGLang usando `--tp-size 2` y `--nnodes 2`, lo que sugiere al menos 2 GPU de alta gama (A100, H100 o similares). El proceso de compresión se ejecutó en una sola GPU de 96 GB, pero eso es para la poda, no para inferencia.
- **Compatibilidad con GPU de consumo**: no es viable en GPU domésticas (p. ej., RTX 4090 de 24 GB) sin cuantización agresiva (probablemente 4-bit), pero no hay versiones oficiales de cuantización de este modelo.
- **Opciones de despliegue**: SGLang (verificado), llama.cpp (a través del repositorio GGUF), y cualquier motor compatible con safetensors (vLLM, TGI) siempre que se gestione correctamente el layout de pesos MoE. En Hopper, el layout MXFP4 requiere el runner `flashinfer_mxfp4` explícito.
- **Latencia y throughput**: no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos | Contexto | GSM8K | HumanEval+ | Licencia |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 284B | 256 | 1M | 0.9484 | 0.8720 | MIT |
| **puwaer/DeepSeek-V4-Flash-0731-reap-200b** | 200B | 178 | 1M (no confirmado) | 0.9401 | 0.8720 | MIT |
| puwaer/DeepSeek-V4-Flash-0731-reap-150b | 150B | 132 | 1M (no confirmado) | 0.9295 | 0.8963 | MIT |
| puwaer/DeepSeek-V4-Flash-0731-ream-200b | 200B | 178 | 1M (no confirmado) | 0.8620 | 0.8841 | MIT |

No se dispone de otros modelos comparables de la misma categoría (MoE comprimidos de ~200B) con datos públicos en la información disponible.

## Limitaciones y advertencias

- **Pérdida de rendimiento en matemáticas**: la caída más notable es en MATH-500 (−1.80 puntos porcentuales), lo que puede afectar a tareas de razonamiento matemático avanzado.
- **Sin decodificación especulativa MTP**: los módulos de predicción multi-token se han eliminado, por lo que la decodificación especulativa basada en MTP no está disponible; los motores que la buscan caerán a decodificación estándar (más lenta).
- **Sesgos de calibración**: la poda se realizó con una mezcla de datos de matemáticas y código (70% código, 30% matemáticas, sin C4). Esto puede haber optimizado el modelo para estas áreas y degradado el rendimiento en tareas de texto general o dominio específico.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento de múltiples pasos. No se han publicado estudios de robustez específicos.
- **Longitud de contexto no verificada**: aunque el modelo base soporta 1M de tokens, la tarjeta del modelo no confirma que la poda no afecte a la ventana de contexto. Se recomienda probar con contextos largos antes de desplegar.
- **Licencia MIT**: permite uso comercial y modificación, pero el usuario es responsable de cumplir con las condiciones de los modelos base (DeepSeek-V4-Flash-0731) y de los papers REAP/REAM.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/puwaer/DeepSeek-V4-Flash-0731-reap-200b)
- [Repositorio GGUF del modelo](https://huggingface.co/puwaer/DeepSeek-V4-Flash-0731-reap-200b-gguf)
- [Modelo base: deepseek-ai/DeepSeek-V4-Flash-0731](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731)
- [GitHub del autor: moe-compress](https://github.com/puwaer/moe-expert-compress)
- [Paper REAP (arxiv:2510.13999)](https://arxiv.org/abs/2510.13999)
- [Paper REAM (arxiv:2604.04356)](https://arxiv.org/abs/2604.04356)
