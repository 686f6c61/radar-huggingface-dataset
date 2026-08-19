# majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-3bit

## Resumen

Este repositorio contiene una cuantización en 3 bits (affine, group size 32) del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, preparada para ejecutarse en Apple Silicon mediante la librería MLX. El modelo original es un Transformer de mezcla de expertos (MoE) con 30 000 millones de parámetros totales y 3 000 millones activos por token, diseñado por NVIDIA para tareas conversacionales y de generación de texto. La cuantización reduce el peso del modelo a unos 15,8 GB, lo que permite ejecutarlo en equipos Mac con memoria unificada de 16 GB o más, sin necesidad de GPU dedicada.

La relevancia de esta variante radica en que acerca un modelo de alto rendimiento (30B) a hardware de consumo, manteniendo una calidad razonable gracias a la cuantización affine con grupo de tamaño 32. El autor, majentik, ha publicado varias versiones cuantizadas (2, 3, 4, 5, 6, 8 bits y MXFP4) del mismo modelo base, lo que facilita elegir el equilibrio entre tamaño y fidelidad. La licencia OpenMDW v1.1 permite uso comercial y distribución, aunque con condiciones específicas que conviene revisar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Nemotron-H) |
| Parametros totales | 30B (modelo base); 4 941 532 224 según los safetensors de este repo (dato del autor) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit affine, group size 32 |
| Idiomas soportados | no disponibles |
| Licencia | OpenMDW v1.1 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, emplea una arquitectura de mezcla de expertos (MoE) con 30 000 millones de parámetros, de los cuales solo 3 000 millones se activan por token. Esto permite una inferencia más rápida y eficiente en memoria en comparación con un modelo denso del mismo tamaño. El tag `nemotron_h` sugiere que utiliza la arquitectura Nemotron-H, propia de NVIDIA, aunque los detalles concretos de atención o capas no se especifican en este repositorio.

La cuantización se realizó con `mlx_lm.convert` de la versión 0.31.3 de mlx-lm, aplicando un esquema affine de 3 bits con tamaño de grupo 32. Este método divide los pesos en bloques de 32 elementos y calcula una escala y un offset por bloque, lo que reduce el error de cuantización frente a esquemas más simples. El resultado es un modelo de aproximadamente 15,8 GB en disco, apto para cargar en la memoria unificada de los chips Apple M1/M2/M3/M4. El autor indica que el modelo pasó una prueba de coherencia determinista (generación de 48 tokens con greedy decoding) antes de publicarse, verificando que no produce salidas vacías, bucles o texto corrupto.

## Capacidades

- Generación de texto conversacional: el modelo está orientado a tareas de chat y diálogo, con soporte para instrucciones y preguntas de seguimiento.
- Razonamiento y conocimiento general: al ser un modelo de 30B con 3B activos, mantiene capacidades de razonamiento y conocimiento comparables a modelos densos de tamaño medio, aunque la cuantización de 3 bits puede degradar ligeramente la precisión en tareas complejas.
- Multilingüismo: no se especifican los idiomas soportados en el repositorio; el modelo base de NVIDIA suele entrenarse con datos multilingües, pero no hay confirmación.
- Sin soporte explícito de tool calling o agentes: no se menciona en la documentación del repo; el modelo base podría tenerlo, pero no está garantizado en esta variante cuantizada.
- Sin capacidades multimodales: es un modelo de solo texto.

## Casos de uso

- Chatbots y asistentes personales en Mac: gracias a su tamaño reducido (15,8 GB), se puede ejecutar localmente en un Mac con 16 GB de RAM o más, ofreciendo respuestas conversacionales sin conexión a internet y con privacidad total.
- Prototipado rápido de aplicaciones de lenguaje: los desarrolladores pueden probar el comportamiento de un modelo de 30B en un portátil Apple antes de desplegarlo en servidores con GPUs más potentes.
- Generación de contenido asistida: redacción de correos, resúmenes, borradores de artículos o respuestas a preguntas frecuentes, con la ventaja de ejecutarse en hardware local.
- Investigación académica sobre cuantización: el repositorio sirve como referencia para estudiar el impacto de la cuantización de 3 bits en un MoE grande, comparando con las versiones de 4, 5, 6 u 8 bits disponibles.
- Educación y demostraciones: permite mostrar en aulas o talleres cómo funciona un modelo MoE de gran tamaño sin necesidad de infraestructura en la nube.
- Desarrollo de aplicaciones de línea de comandos: mediante `mlx_lm.generate` se puede integrar el modelo en scripts o pipelines de procesamiento de texto en entornos macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye una prueba de coherencia básica (generación de 48 tokens) y no proporciona métricas como MMLU, HumanEval o GSM8K. Para conocer el rendimiento del modelo base, se recomienda consultar la ficha de NVIDIA en HuggingFace, aunque no se ha verificado en esta documentación.

## Requisitos de hardware

- Memoria RAM unificada: se recomienda al menos 16 GB para cargar el modelo (15,8 GB en disco) y dejar margen para el sistema y el contexto de generación. Con 32 GB o más se puede trabajar con ventanas de contexto mayores.
- Chip: Apple Silicon (M1, M2, M3 o M4), incluyendo versiones Pro, Max y Ultra. No funciona en Macs con procesadores Intel.
- Almacenamiento: unos 16 GB de espacio libre para los pesos y el software.
- Despliegue: se utiliza la librería `mlx-lm` (pip install mlx-lm). No es compatible con vLLM, llama.cpp u Ollama en su forma actual, ya que el formato MLX es específico de Apple.
- Latencia: no se proporcionan datos concretos, pero en un Mac M2 Pro con 32 GB se puede esperar una generación de varios tokens por segundo, dependiendo de la longitud del contexto y la carga del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B (BF16) | 30B | 3B | no disponible | BF16 | OpenMDW v1.1 |
| Esta variante MLX 3-bit | 30B (base) | 3B | no disponible | 3-bit affine | OpenMDW v1.1 |
| Otras variantes MLX (2, 4, 5, 6, 8 bit) | 30B (base) | 3B | no disponible | 2-8 bit | OpenMDW v1.1 |

No se dispone de datos de rendimiento comparativo entre estas variantes. La elección entre 2, 3, 4 o más bits depende del equilibrio entre tamaño en memoria y calidad de salida; la versión de 3 bits ofrece un punto intermedio, aunque el autor no publica métricas objetivas.

## Limitaciones y advertencias

- La cuantización de 3 bits puede producir una degradación notable en tareas de razonamiento complejo, matemáticas o generación de código en comparación con el modelo BF16 original. Se recomienda probar con casos reales antes de usarlo en producción.
- El modelo solo se ejecuta en Apple Silicon; no es portable a GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF o FP16).
- No se especifican los idiomas soportados; es probable que el modelo base tenga un sesgo hacia inglés, aunque podría funcionar en otros idiomas con menor calidad.
- La licencia OpenMDW v1.1 es permisiva, pero incluye condiciones específicas sobre el uso de los pesos y la distribución. Se debe revisar el texto completo en el repositorio antes de un uso comercial.
- El autor no proporciona benchmarks ni garantías de rendimiento; la única verificación es una prueba de coherencia básica.
- El tamaño del contexto no está documentado; si el modelo base tiene una ventana de contexto larga (por ejemplo, 128k), la cuantización no la reduce, pero la memoria disponible puede limitar la longitud práctica del contexto.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-3bit
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW v1.1: https://openmdw.ai/license/1-1/
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Otras variantes cuantizadas del mismo autor: 2-bit, 4-bit, 5-bit, 6-bit, 8-bit, MXFP4 (enlaces en la tabla de "Available tiers" del README)
