# nvidia/GLM-5.3-Flash-FP4-Local

## Resumen

GLM-5.3-Flash-FP4-Local es un checkpoint cuantizado en NVFP4 del modelo GLM-5.3-Flash de ZAI, publicado por NVIDIA a través de su herramienta Model Optimizer. El modelo base es un transformer autorregresivo de tipo Mixture-of-Experts (MoE), nativamente multimodal (texto, imagen y vídeo como entrada, texto como salida), orientado a razonamiento, generación de código y tareas agénticas, con una longitud de contexto de hasta 1 millón de tokens.

La aportación de este checkpoint no es el modelo en sí, sino la cuantización a 4 bits (FP4) realizada mediante destilación consciente de cuantización (quantization-aware distillation, QAD) con nvidia-modelopt v0.47.0, que reduce el peso del modelo hasta unos 166 GiB de VRAM. Eso permite desplegar un MoE de gran tamaño en hardware de gama workstation, concretamente en 2 GPU RTX PRO 6000 Blackwell o en 2 DGX Spark de 128 GB, algo inviable con los pesos en alta precisión.

Es relevante ahora porque combina tres factores poco frecuentes: contexto de 1M de tokens, multimodalidad nativa y un formato FP4 optimizado para Blackwell. El precio a pagar es una dependencia estricta del ecosistema NVIDIA: los factores de escala NVFP4 usan un formato de compresión sin pérdida que aún no está soportado en vLLM upstream, por lo que es obligatorio usar los contenedores proporcionados por NVIDIA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (sparse + linear) y Manifold-Constrained Hyper-Connections (mHC); clase `Glm5NextForConditionalGeneration` |
| Parametros totales | 320 000 millones según la model card; 175 239 203 374 según los metadatos de safetensors (discrepancia no resuelta en la información disponible) |
| Parametros activos | 18 000 millones |
| Longitud de contexto | Hasta 1 000 000 tokens |
| Tipos de cuantizacion | NVFP4 (FP4, versión «FP4 QAD 1.0»); KV cache en FP8 validada; no se ofrecen otros formatos en este repo |
| Idiomas soportados | No disponible (la model card no publica lista de idiomas; el corpus de post-entrenamiento incluye tareas multilingües) |
| Licencia | NVIDIA Open Model Agreement (este checkpoint); el modelo base GLM-5.3-Flash se rige por licencia MIT |
| Formato de pesos | safetensors (tamaño del repo: 355,2 GB) |
| Modalidades de entrada | Texto, imagen (RGB) y vídeo (MP4/WebM) |
| Modalidad de salida | Texto (string, secuencias 1D) |
| Runtime soportado | vLLM (contenedores específicos de NVIDIA, obligatorios) |
| Hardware validado | NVIDIA Blackwell: 2× RTX PRO 6000 Blackwell; 2× DGX Spark 128 GB |
| VRAM estimada | ~166 GiB |
| Fecha de publicación | 2026-05-10 según la model card; repo creado el 2026-10-08 en HuggingFace |
| Versión de cuantización | nvidia-modelopt v0.47.0 |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura transformer autorregresiva de tipo Mixture-of-Experts con atención híbrida: combina capas de atención dispersa (sparse) con capas de atención lineal, lo que reduce el coste computacional del contexto largo. Sobre esa base se añaden las Manifold-Constrained Hyper-Connections (mHC), un mecanismo de conexiones residuales restringidas a una variedad que, según la model card, sostiene el contexto de hasta 1M de tokens. El modelo es nativamente multimodal, con codificación de imagen y vídeo además de texto, y activa 18 000 millones de parámetros por token sobre un total declarado de 320 000 millones.

El proceso de cuantización es el elemento diferencial: NVIDIA aplicó quantization-aware distillation (QAD) con Model Optimizer v0.47.0, es decir, el modelo cuantizado se destila desde el modelo original en lugar de cuantizarse únicamente post-entrenamiento. Para recuperar precisión se usó un corpus de post-entrenamiento de 500 millones de tokens repetido durante 3 épocas, compuesto por subconjuntos de Nemotron-Post-Training-Dataset-v3, Nemotron-Post-Training-Dataset-v2 y Nemotron-Pretraining-Dataset; solo se emplearon los prompts, y las respuestas se generaron por síntesis de datos. La model card indica que el corpus cubre razonamiento, código, ciencia, uso de herramientas, seguimiento de instrucciones, salidas estructuradas y tareas multilingües. No se documenta en la información disponible si hubo RLHF o DPO adicionales sobre este checkpoint.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluida la resolución de problemas de ciencia y matemáticas (el corpus de entrenamiento incluye datos de razonamiento y ciencia).
- Generación y edición de código, con datos específicos de código en el corpus de destilación.
- Comprensión de imágenes: acepta entradas RGB y las procesa dentro de la misma ventana de contexto que el texto.
- Comprensión de vídeo: soporta entradas en MP4 y WebM como modalidad de entrada.
- Uso de herramientas (tool calling / function calling): el corpus incluye datos de tool use y la evaluación prevista incluye ToolEvalBench.
- Salidas estructuradas (JSON y formatos afines), según los datos de instrucción estructurada del corpus.
- Capacidad agéntica y razonamiento multi-paso, tal como declara la model card («agentic tasks»).
- Contexto muy largo: hasta 1M de tokens, con 1,8M–2M de tokens de KV cache en FP8 en las configuraciones de hardware validadas.
- Capacidades multilingües: presentes en el corpus de entrenamiento, aunque sin lista publicada de idiomas.

## Casos de uso

- **Atención al cliente automatizada sobre documentación extensa**: con 1M de tokens de contexto se puede inyectar un manual completo, histórico de tickets y políticas internas sin troceado agresivo ni RAG obligatorio, manteniendo coherencia en conversaciones multi-turno.
- **Agentes autónomos de operaciones**: el soporte de tool calling y salidas estructuradas permite encadenar llamadas a APIs internas, consultar bases de datos y ejecutar acciones con validación de esquema en cada paso.
- **Análisis de vídeo e imagen en inspección técnica**: al aceptar entradas MP4/WebM y RGB, se pueden resumir grabaciones, extraer incidencias de imágenes de cámara y generar informes textuales en un único pipeline.
- **Generación de código en producción**: integración en pipelines de CI/CD para revisión de parches, generación de tests y migraciones, aprovechando la ventana de contexto para incluir varios ficheros del repositorio a la vez.
- **Procesamiento de expedientes largos (legal, seguros, auditoría)**: lectura de contratos o expedientes de cientos de miles de tokens con preguntas de seguimiento, sin perder referencias cruzadas entre secciones.
- **Asistente de investigación sobre corpus científicos**: combinación de GPQA-style reasoning con contexto largo para comparar artículos, extraer metodologías y sintetizar resultados.
- **Despliegue en infraestructura propia con requisitos de soberanía del dato**: al ejecutarse en 2× RTX PRO 6000 Blackwell o 2× DGX Spark en local, permite mantener datos sensibles fuera de la nube.
- **Sistemas RAG de nueva generación**: uso del contexto de 1M tokens para reducir la dependencia de recuperación y mejorar la coherencia entre fragmentos recuperados.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card únicamente declara el uso de GPQA Diamond y ToolEvalBench como conjuntos de evaluación, con recolección de datos híbrida (automatizada y manual), pero no incluye las puntuaciones obtenidas ni comparaciones con otros modelos.

| Benchmark | Resultado |
|---|---|
| GPQA Diamond | No disponible (usado en evaluación, sin cifra publicada) |
| ToolEvalBench | No disponible (usado en evaluación, sin cifra publicada) |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 166 GiB para los pesos en FP4, según la model card. A ello hay que sumar la KV cache (hasta 1,8M–2M de tokens en FP8 en las configuraciones validadas).
- **GPU validadas**: 2× NVIDIA RTX PRO 6000 Blackwell (192 GB de VRAM agregada) y 2× NVIDIA DGX Spark de 128 GB (256 GB de memoria unificada agregada).
- **GPU no viables**: una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar el modelo. Por aritmética de memoria harían falta al menos 6 GPU de 32 GB, configuración que no está validada por NVIDIA.
- **Plataforma**: exclusivamente NVIDIA Blackwell; la model card no declara soporte para Hopper o Ada.
- **Sistema operativo**: Linux.
- **Motores de despliegue**: únicamente vLLM, y forzosamente mediante los contenedores proporcionados por NVIDIA, ya que el formato comprimido de los factores de escala NVFP4 no está aún en vLLM upstream. llama.cpp, Ollama o TGI no aparecen como soportados en la información disponible.
- **Latencia y throughput**: no disponibles. No se publican métricas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | VRAM aproximada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-FP4-Local (este) | 320B totales / 18B activos (175,2B según safetensors) | 1M tokens | NVFP4 con QAD | ~166 GiB | NVIDIA Open Model Agreement | HuggingFace, vLLM con contenedor NVIDIA |
| GLM-5.3-Flash (modelo base, ZAI) | 320B totales / 18B activos | 1M tokens | No disponible (sin cuantizar) | No disponible | MIT | HuggingFace |
| Otros MoE multimodales cuantizados en FP4 | No disponible | No disponible | FP4 | No disponible | No disponible | No disponible |

La comparación directa más útil es con el modelo base: misma arquitectura, mismo contexto y mismas capacidades, pero con licencia MIT en el original frente al NVIDIA Open Model Agreement del checkpoint cuantizado, y con un requisito de VRAM presumiblemente mucho mayor en el caso sin cuantizar (dato no publicado). Para alternativas de otros fabricantes con tamaño y modalidades comparables no hay datos en la información proporcionada.

## Limitaciones y advertencias

- **Dependencia crítica de contenedores**: el formato de compresión sin pérdida de los factores de escala NVFP4 no está soportado en vLLM upstream. Sin los contenedores de NVIDIA el modelo no arranca correctamente.
- **Licencia no OSI**: el checkpoint se rige por el NVIDIA Open Model Agreement, no por la MIT del modelo base. Aunque la model card declara uso comercial permitido, conviene revisar los términos completos antes de desplegar en producción.
- **Restricción de hardware**: solo NVIDIA Blackwell y Linux. No hay soporte declarado para otras arquitecturas, lo que limita portabilidad y aumenta el coste de infraestructura.
- **Pérdida de precisión por cuantización**: FP4 con QAD recupera parte de la precisión, pero no se publican métricas comparativas frente al modelo en alta precisión, por lo que la magnitud de la degradación en tareas específicas es desconocida.
- **Riesgo de alucinación**: no se documentan tasas de alucinación ni evaluaciones de veracidad; es un riesgo relevante en tareas de razonamiento y agentes con tool calling.
- **Sesgos**: la model card no incluye ninguna sección de sesgos, evaluación de equidad ni consideraciones éticas más allá de la recomendación genérica de testear con datos propios del caso de uso.
- **Idiomas**: no se publica lista de idiomas soportados ni niveles de calidad por idioma; el rendimiento en castellano no está verificado.
- **Discrepancia en el recuento de parámetros**: 320B declarados frente a 175,2B en los metadatos de safetensors. Hay que verificar este dato antes de dimensionar infraestructura.
- **Coste de contexto**: 1M de tokens de contexto implica una KV cache muy grande; las configuraciones validadas reservan 1,8–2M de tokens de KV cache en FP8, lo que condiciona el número de peticiones concurrentes.
- **Madurez del ecosistema**: el modelo depende de una versión concreta de nvidia-modelopt (v0.47.0) y de contenedores específicos; la integración en stacks existentes requiere trabajo adicional de validación.

## Enlaces

- [HuggingFace: nvidia/GLM-5.3-Flash-FP4-Local](https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local)
- [Modelo base: zai-org/GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [NVIDIA Model Optimizer (GitHub)](https://github.com/NVIDIA/Model-Optimizer)
- [NVIDIA Open Model Agreement](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/)
- [Blog de NVIDIA sobre quantization-aware training y recuperación de precisión](https://developer.nvidia.com/blog/how-quantization-aware-training-enables-low-precision-accuracy-recovery/)
- [Nemotron-Post-Training-Dataset-v2](https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2)
- [Colección Nemotron-Post-Training-v3](https://huggingface.co/collections/nvidia/nemotron-post-training-v3)
- [Colección Nemotron-Pre-Training-Datasets](https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets)
- [NVIDIA (sitio corporativo)](https://www.nvidia.com/) — único resultado genérico devuelto por la búsqueda web; el resto de resultados fueron páginas corporativas o de drivers sin relación técnica con el modelo.
