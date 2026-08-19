# rcmorano/Qwen3.8-27B-ROCMFPX

## Resumen

El modelo `rcmorano/Qwen3.8-27B-ROCMFPX` es una cuantización GGUF del modelo Qwen3.8-27B, desarrollada por el usuario rcmorano a partir de los pesos oficiales de Alibaba Cloud (vía unsloth). Se trata de un modelo denso multimodal de 27 320 millones de parámetros, con una ventana de contexto de 262 144 tokens y capacidades de razonamiento explícito. La particularidad de esta versión es que está optimizada para hardware AMD ROCm, utilizando una cuantización híbrida `Q4_0_ROCMFP4_COHERENT` que combina cuantización de 4 bits con FP4 coherente para mejorar la eficiencia en GPUs de AMD.

El modelo base Qwen3.8-27B fue lanzado por el equipo Qwen de Alibaba en agosto de 2026, destacando por su rendimiento en tareas de programación, flujos agénticos y automatización de oficina, además de incorporar un codificador de visión sorpresa. Esta versión cuantizada permite ejecutar el modelo en hardware más asequible, manteniendo un contexto muy largo y soporte para decodificación especulativa con predicción multi-token (MTP), lo que la hace relevante para despliegues locales y en entornos con GPUs AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (con codificador de vision) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (y otras variantes GGUF del repo base) |
| Idiomas soportados | No disponible (el modelo base Qwen soporta multiples idiomas, pero no se especifica en esta version) |
| Licencia | No disponible en el repo; el modelo base Qwen3.8-27B es Apache 2.0 segun fuentes externas |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo transformer denso con arquitectura multimodal nativa, que incluye un codificador de vision integrado. La ventana de contexto de 262 144 tokens permite procesar documentos largos y conversaciones extensas. El modelo emplea un modo de razonamiento explicito que puede activarse o desactivarse mediante parámetros del chat template (`enable_thinking`, `preserve_thinking`), permitiendo controlar el esfuerzo de razonamiento (`low`, `medium`, etc.).

La version cuantizada por rcmorano utiliza `llama-quantize` sobre los GGUF de Unsloth, aplicando una cuantizacion especifica para ROCm: `Q4_0_ROCMFP4_COHERENT`. Esta cuantizacion combina pesos en Q4_0 con una representacion FP4 coherente para las claves y valores del cache de atencion, optimizada para GPUs AMD. La configuracion de `llama-swap` incluida en la model card muestra el uso de decodificacion especulativa con `spec-draft-type` MTP (multi-token prediction), cache de atencion en FP16 y checkpoints de contexto cada 8192 tokens, lo que permite gestionar ventanas de 262K de forma eficiente.

No se dispone de informacion detallada sobre el entrenamiento del modelo base (composicion del dataset, numero de tokens, uso de RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento complejo con modo de pensamiento explicito configurable (bajo, medio, alto esfuerzo).
- Capacidades multimodales: el modelo base incluye un codificador de vision, por lo que puede procesar imagenes junto con texto (aunque no se detalla en esta version cuantizada).
- Soporte para tool calling y function calling, comun en la familia Qwen3, util para integraciones con APIs y agentes.
- Capacidades agénticas: disenado para flujos de trabajo multi-paso y automatizacion de tareas.
- Programacion y generacion de codigo, con buen rendimiento en benchmarks de coding segun las fuentes del modelo base.
- Multilingue: aunque no se especifica en esta version, Qwen3.8-27B soporta multiples idiomas (el repo base no detalla la lista).
- Contexto largo de 262K tokens, adecuado para documentos extensos, analisis de codigo base grande o conversaciones de larga duracion.
- Decodificacion especulativa con MTP para acelerar la inferencia en hardware ROCm.

## Casos de uso

- Asistente de programacion en entornos de desarrollo: el modelo puede generar, revisar y refactorizar codigo en multiples lenguajes, aprovechando su contexto de 262K para analizar repositorios completos. Su soporte para tool calling permite conectarlo a IDEs o pipelines de CI/CD para automatizar tareas como generacion de tests o deteccion de bugs.
- Automatizacion de oficina: procesamiento de documentos largos (contratos, informes) con extraccion de informacion, resumen y generacion de respuestas. La ventana de 262K permite cargar documentos completos sin truncamiento.
- Agentes conversacionales con memoria extendida: chatbots de atencion al cliente que mantienen el historial de conversaciones de larga duracion, gracias al contexto amplio y al modo de razonamiento para gestionar consultas complejas.
- Analisis de imagenes y documentos escaneados: al ser multimodal, puede extraer texto de imagenes, describir diagramas o interpretar graficos, util en entornos de documentacion tecnica.
- Razonamiento cientifico y matematico: el modo de razonamiento explicito permite abordar problemas de logica, matematicas o fisica con pasos intermedios, adecuado para tutoria o investigacion.
- Despliegue en hardware AMD de gama media: gracias a la cuantizacion ROCmFPX, se puede ejecutar en GPUs AMD como RX 7900 XTX o Instinct MI100, ofreciendo una alternativa a soluciones basadas en NVIDIA para inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina de BenchLM.ai indica que el modelo Qwen3.8-27B no tiene cobertura publica de benchmarks en su leaderboard. Las fuentes externas mencionan que el modelo base destaca en coding y tareas agénticas, pero no se proporcionan numeros concretos en los resultados de busqueda. Por tanto, no se incluyen tablas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_0, un modelo de 27B requiere aproximadamente 16-20 GB de VRAM solo para los pesos. El contexto de 262K con cache FP16 puede aumentar significativamente el consumo, llegando a 30-40 GB en configuraciones extremas. La configuracion de ejemplo usa `--ctx-size 262144` con cache FP16, lo que exige GPUs con al menos 32 GB de VRAM para ese contexto completo.
- GPU recomendadas: AMD Radeon RX 7900 XTX (24 GB), AMD Instinct MI100/MI200, o NVIDIA RTX 4090 (24 GB) / A100 (40 GB) si se usa con CUDA. Para contextos mas cortos, una RTX 3090 (24 GB) o RX 6900 XT (16 GB) podrian ser suficientes con cuantizaciones mas agresivas.
- Compatibilidad con consumer GPU: si, en GPUs de 24 GB se puede ejecutar con contexto reducido (por ejemplo, 32K-64K). Para el contexto completo de 262K se necesitan GPUs profesionales o soluciones con memoria unificada.
- Opciones de despliegue: llama.cpp (con soporte ROCm), llama-swap (como muestra la configuracion del autor), vLLM y SGLang (segun la fuente de Yottalabs). Tambien se puede usar Ollama si se convierte el GGUF a un formato compatible.
- Latencia y throughput: no disponible. La decodificacion especulativa con MTP puede mejorar el throughput, pero no se proporcionan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Si | Apache 2.0 | Original (safetensors) |
| Qwen2.5-32B | 32B | 128K | No | Apache 2.0 | Original |
| Llama-3.1-8B | 8B | 128K | No | Llama 3.1 Community | Original |

La comparativa se basa en informacion publica de los modelos base. Qwen3.8-27B ofrece un contexto mayor que Qwen2.5-32B y capacidades multimodales, con un tamano ligeramente inferior. Frente a Llama-3.1-8B, es mucho mas grande pero con mayor capacidad de razonamiento y contexto. La version cuantizada ROCMFPX no tiene equivalente directo en otras familias, ya que esta especificamente optimizada para AMD.

## Limitaciones y advertencias

- La licencia del repo cuantizado no esta especificada en la ficha de HuggingFace. Aunque el modelo base es Apache 2.0, el autor no ha declarado la licencia de esta version, por lo que se recomienda contactar con el autor antes de usarlo en produccion comercial.
- No se dispone de informacion sobre sesgos o alucinaciones especificas de esta version. Como cualquier LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- El contexto de 262K tokens puede degradar la calidad de las respuestas en los extremos de la ventana, y el uso de cache FP16 aumenta el consumo de VRAM de forma significativa.
- La cuantizacion Q4_0 puede introducir perdida de precision en tareas que requieren alta exactitud numerica (por ejemplo, matematicas avanzadas o generacion de codigo con dependencias finas).
- El soporte para vision no esta confirmado en esta version cuantizada; aunque el modelo base es multimodal, la cuantizacion podria afectar al rendimiento del codificador de vision.
- No se han publicado benchmarks independientes para esta cuantizacion, por lo que el rendimiento real en tareas especificas es incierto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rcmorano/Qwen3.8-27B-ROCMFPX
- Repositorio oficial del modelo base (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Pagina de benchmarks (sin datos publicos): https://benchlm.ai/models/qwen3-8-27b
- Articulo de Yottalabs sobre especificaciones y despliegue: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Repositorio de Unsloth con los GGUF base: https://huggingface.co/unsloth/Qwen3.8-27B
