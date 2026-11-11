# scottlowry/Swift-Qwen3.8-27b-oQ5e-mtp

## Resumen

Swift-Qwen3.8-27b-oQ5e-mtp es una cuantización de precisión mixta del modelo ukisai/Swift-Qwen3.8-27b, publicada por el usuario scottlowry. El checkpoint resultante pesa 20,5 GB y contiene 27.781.427.952 parámetros lógicos, con un promedio efectivo de 5,889 bits por peso. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.4.dev1) y el formato de pesos es MLX safetensors, por lo que está pensado para ejecutarse en el stack de Apple Silicon mediante la librería MLX.

El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5`) e incorpora tres componentes diferenciados: un modelo de lenguaje de 26.896B de parámetros lógicos, un codificador visual de 0.461B y una cabeza MTP (multi-token prediction) de 0.425B. La presencia de visión y de MTP indica que el modelo original es multimodal y que soporta decodificación especulativa mediante predicción de múltiples tokens, una técnica que acelera la generación al permitir validar varios tokens candidatos por paso.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de cuantización mixta que asigna 5 bits al 87,97% de los pesos, 6 bits al 5,56%, 8 bits al 4,61% y mantiene en BF16 el 1,86% restante, lo que sugiere que las capas sensibles se preservan en mayor precisión. Por otro, el modelo no cuenta con descargas ni likes, no declara licencia ni idiomas, y su model card es puramente técnico sobre la cuantización, sin resultados de benchmarks ni guía de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5, multimodal (lenguaje + visión) con cabeza MTP; pesos en formato MLX |
| Parametros totales | 27.781.427.952 (27.781B logicos) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 5-bit grupo 64 (24.440B), affine 6-bit grupo 64 (1.544B), affine 8-bit grupo 64 (1.282B) y BF16 (0.516B); promedio efectivo 5,889 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors para MLX (libreria mlx) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento nuevo. La arquitectura subyacente corresponde al modelo base ukisai/Swift-Qwen3.8-27b, etiquetado como `qwen3_5`, con un tronco de lenguaje de 26.896B de parámetros lógicos, un módulo de visión de 0.461B y una cabeza MTP de 0.425B. La cabeza MTP apunta a decodificación especulativa nativa: el modelo predice varios tokens futuros que luego se validan en paralelo, lo que reduce el número de pasos de decodificación secuencial.

La innovación técnica de esta publicación es la distribución de bits de la cuantización mixta. El 87,971% de los pesos lógicos (24.440B) se almacena en affine 5-bit con grupo de 64, ocupando 15,648 GiB; un 5,558% (1.544B) sube a 6 bits (1,168 GiB); un 4,614% (1.282B) se mantiene en 8 bits (1,268 GiB); y un 1,857% (0.516B) permanece en BF16 (0,961 GiB). El resultado son 19,046 GiB de almacenamiento de tensores para 27,781B de pesos lógicos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: el tronco de lenguaje de 26.896B parámetros lógicos soporta tareas generativas generales, aunque no se publican evaluaciones específicas.
- Procesamiento de visión: el módulo visual de 0.461B parámetros lógicos habilita entrada de imágenes, presumiblemente en tareas de descripción, VQA o extracción de información.
- Decodificación especulativa: la cabeza MTP de 0.425B permite multi-token prediction, orientada a acelerar la inferencia en MLX.
- Ejecución en Apple Silicon: el formato MLX safetensors está optimizado para GPUs integradas de la serie M de Apple mediante memoria unificada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 20,5 GB cabe en equipos Apple Silicon con 32 GB o más de RAM unificada, lo que permite ejecutar un modelo de 27,8B parámetros lógicos sin GPU dedicada, usando MLX como runtime.
- Asistentes multimodales de escritorio: la combinación de tronco de lenguaje y módulo de visión permite construir aplicaciones locales que respondan preguntas sobre capturas de pantalla, documentos escaneados o imágenes, sin enviar datos a la nube.
- Prototipado rápido de aplicaciones de razonamiento: la cuantización de 5,889 bits reduce el peso del checkpoint frente a un BF16 equivalente (que rondaría los 55 GB), lo que facilita iterar en portátiles con 32-64 GB de memoria.
- Generación de texto acelerada por MTP: la cabeza de multi-token prediction está pensada para reducir la latencia en decodificación; resulta adecuada en escenarios interactivos donde el tiempo por token es crítico, como chat o autocompletado.
- Evaluación comparativa de recetas de cuantización: al documentar con precisión la distribución de bits por capa, el checkpoint sirve como referencia para estudiar el impacto de la precisión mixta en la calidad de salida frente al modelo base.
- Despliegue en pipelines de investigación con MLX: integrable en scripts de evaluación o generación por lotes mediante la librería mlx, sin necesidad de infraestructura CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el checkpoint ocupa 19,046 GiB de tensores (20,5 GB de repositorio); se recomienda al menos 24-32 GB de memoria unificada para cargar los pesos y mantener margen para el contexto y la caché KV.
- GPU recomendadas: Apple Silicon con memoria unificada, como M2 Pro/Max con 32 GB, M3 Max con 36-128 GB o M4 Max; el formato MLX no está pensado para GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: sí, en equipos Apple con 32 GB o más de memoria unificada; no aplica a RTX 4090 u otras GPU discretas por el formato MLX.
- Opciones de despliegue: librería MLX (mlx-lm) y el ecosistema oMLX; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que esperan otros formatos (GGUF, safetensors estándar).
- Latencia y throughput: no disponibles; la cabeza MTP sugiere optimización de decodificación, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27b-oQ5e-mtp | 27,781B logicos (5,889 bits/peso) | no disponible | MLX safetensors | no disponible | Hugging Face, 0 descargas |
| ukisai/Swift-Qwen3.8-27b (base) | 27,781B logicos | no disponible | safetensors | no disponible | Hugging Face |
| Modelo Qwen3.5 de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base o de la familia Qwen3.5 original en la información proporcionada, por lo que la comparativa se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base, lo que impide confirmar si el uso comercial está permitido.
- Idiomas no declarados: se desconoce la cobertura lingüística real del modelo base.
- Sin benchmarks: no hay evaluaciones publicadas que permitan estimar la degradación de calidad frente al modelo base en BF16.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos: no se publica información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento del modelo base.
- Dependencia de Apple Silicon: el formato MLX limita el despliegue a hardware Apple; no es portable a CUDA sin reconversión.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria de la receta de cuantización.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- La cuantización mixta puede introducir divergencias en capas sensibles; el 4,614% en 8 bits y el 1,857% en BF16 sugieren que el autor identificó capas críticas, pero no se documenta el criterio.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift-Qwen3.8-27b-oQ5e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
