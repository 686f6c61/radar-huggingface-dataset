# Karmation/NVIDIA-Nemotron-3-Super-120B-A12B-FP8

## Resumen

El modelo **NVIDIA-Nemotron-3-Super-120B-A12B-FP8** es una versión cuantizada en FP8 del LLM Nemotron-3-Super-120B-A12B desarrollado por NVIDIA. Se trata de un modelo de arquitectura híbrida **Latent Mixture-of-Experts (LatentMoE)** que combina capas de Mamba-2, capas MoE y capas de atención selectiva, junto con **Multi-Token Prediction (MTP)** para acelerar la generación y mejorar la calidad. Con **120.000 millones de parámetros totales y 12.000 millones activos**, está diseñado para flujos de trabajo agénticos, razonamiento de contexto largo y tareas de alto volumen como la automatización de tickets de TI.

El modelo soporta una ventana de contexto de hasta **1 millón de tokens** y es multilingüe (inglés, francés, alemán, italiano, japonés, español y chino). Su lanzamiento oficial se produjo el 11 de marzo de 2026, y está disponible bajo la licencia abierta de NVIDIA Nemotron, lo que permite uso comercial. Esta versión concreta en FP8 es un repositorio subido por el usuario *Karmation* en Hugging Face, que replica la model card oficial de NVIDIA, pero mantiene los mismos pesos cuantizados.

El modelo destaca por su eficiencia computacional al emplear arquitectura MoE con solo un 10% de parámetros activos, y por su entrenamiento con **25 billones de tokens** en pre-entrenamiento, además de un post-entrenamiento con datos curados y sintéticos. Su capacidad de razonamiento se puede configurar mediante el chat template, permitiendo activar o desactivar el modo de pensamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE - Mamba-2 + MoE + Attention (híbrido) con Multi-Token Prediction (MTP) |
| Parametros totales | 123.611.012.096 (120B según la model card) |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (esta versión), NVFP4, BF16 (otras variantes del mismo modelo) |
| Idiomas soportados | Inglés, francés, alemán, italiano, japonés, español, chino |
| Licencia | NVIDIA Nemotron Open Model License (ver enlace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura **Latent MoE** que combina capas de Mamba-2 (modelos de estado) con capas de mezcla de expertos y capas de atención selectivas. Esta hibridación permite manejar secuencias muy largas de manera eficiente, ya que Mamba-2 ofrece una complejidad lineal en la longitud de secuencia, mientras que las capas de atención se usan selectivamente para tareas que requieren recuperación de información puntual. Las capas MoE activan solo 12.000 millones de parámetros por token, lo que reduce el coste computacional en comparación con un modelo denso del mismo tamaño total.

El pre-entrenamiento se realizó sobre aproximadamente **25 billones de tokens** (25T), con un corte de datos de junio de 2025. El post-entrenamiento utilizó un corpus de datos de alta calidad, curados y sintéticamente generados, con corte de datos en febrero de 2026. Incluye una pequeña proporción de datos de QA y alineación para mejorar la precisión. La versión FP8 de este repositorio utiliza cuantización de 8 bits para los pesos, lo que reduce el tamaño del modelo y acelera la inferencia en GPUs compatibles. Además, el modelo incorpora **Multi-Token Prediction (MTP)**, que predice varios tokens a la vez, mejorando el rendimiento de generación y la velocidad.

El entrenamiento se realizó con la técnica de cuantización **NVFP4** (NVIDIA Floating Point 4) según la documentación oficial, aunque la versión aquí presentada está en FP8. El modelo admite un modo de razonamiento configurable mediante el parámetro `enable_thinking` en el chat template, lo que permite activar o desactivar el pensamiento explícito antes de responder.

## Capacidades

- **Generación de texto y razonamiento**: Produce respuestas coherentes y razonadas, con capacidad de emitir cadenas de pensamiento cuando el modo `enable_thinking` está activado.
- **Razonamiento multi-paso**: Soporta tareas que requieren planificación y ejecución de pasos intermedios, útil para agentes autónomos.
- **Tool calling**: Integra funciones de llamada a herramientas (function calling) para interactuar con APIs y servicios externos.
- **Manejo de contexto largo**: Su ventana de 1M tokens permite procesar documentos extensos, historiales de conversación o bases de conocimiento completas sin truncamiento.
- **Multilingüismo**: Cubre 7 idiomas principales, incluyendo el español, con buen rendimiento en tareas de comprensión y generación en cada uno.
- **Modo agéntico**: Optimizado para flujos de trabajo de agentes, como automatización de tickets de IT, RAG y orquestación de tareas.
- **Razonamiento configurable**: Permite alternar entre respuestas directas y razonamiento explícito mediante el chat template.

## Casos de uso

- **Automatización de tickets de TI**: el modelo puede analizar descripciones de incidencias, clasificarlas y generar soluciones paso a paso, aprovechando su contexto largo para mantener el historial completo de la conversación y las políticas de la empresa.
- **Asistentes de atención al cliente multilingües**: con soporte para 7 idiomas, puede gestionar conversaciones en tiempo real con usuarios de distintos países, manteniendo el contexto de la interacción y accediendo a bases de conocimiento mediante tool calling.
- **RAG sobre documentos técnicos extensos**: su contexto de 1M tokens permite indexar manuales, documentación de APIs o informes financieros completos y responder preguntas complejas que requieren consultar múltiples secciones.
- **Generación y revisión de código en pipelines de CI/CD**: el modelo puede generar código, sugerir correcciones y ejecutar pruebas unitarias si se integra con herramientas de ejecución vía function calling, mejorando la productividad en entornos de desarrollo.
- **Análisis de contratos y documentos legales**: su capacidad de razonamiento y contexto largo facilita la extracción de cláusulas, la comparación de versiones y la detección de riesgos potenciales en documentos legales de gran tamaño.
- **Agentes de investigación autónoma**: puede buscar información en la web (a través de herramientas), resumir artículos, sintetizar resultados y elaborar informes finales, todo en una sola sesión de contexto prolongado.
- **Traducción y localización de contenido**: al soportar 7 idiomas, puede traducir textos largos manteniendo coherencia y estilo, y adaptar contenido para mercados locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información disponible. La model card incluye un gráfico de precisión (accuracy_chart.png) pero no se proporcionan números concretos en el texto. Por lo tanto, no se pueden presentar tablas comparativas de rendimiento para este modelo sin inventar datos. Se recomienda consultar el informe técnico de NVIDIA (enlace en la sección de enlaces) para obtener métricas detalladas.

## Requisitos de hardware

- **VRAM mínima estimada**: para cargar los 120B parámetros en FP8 (1 byte por parámetro) se requieren aproximadamente 120 GB de VRAM, más overhead de activaciones y KV cache. Por tanto, se necesita un sistema con al menos **2× H100-80GB** (160 GB totales) o equivalente.
- **GPUs recomendadas**: NVIDIA H100, A100 80GB, o GPUs con soporte para FP8 como RTX 4090 (24 GB) no son suficientes para el modelo completo; se necesitaría cuantización adicional (GGUF) o particionado.
- **Posibilidad de ejecución en GPU de consumo**: no es viable en una sola GPU de consumo (16-24 GB) con los pesos completos. Se podría intentar con cuantización más agresiva (4 bits) y offloading a CPU, pero el rendimiento sería limitado.
- **Opciones de despliegue**: se puede servir con frameworks como vLLM, TensorRT-LLM o NVIDIA NIM (según la documentación de NVIDIA). También es compatible con la librería `transformers` para inferencia básica.
- **Latencia y throughput**: no se proporcionan datos concretos. Se espera una buena eficiencia gracias al MoE y a la cuantización FP8, pero el rendimiento exacto depende del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Nemotron-3-Super-120B-A12B (este) | 120B | 12B | 1M | LatentMoE (Mamba-2 + MoE + Attn) | NVIDIA Nemotron Open Model |
| Mixtral 8x7B (Mistral) | 46.7B | 12.9B | 32k | MoE (8 expertos) | Apache 2.0 |
| DeepSeek-V2 (DeepSeek) | 236B | 21B | 128k | MoE + Attention | MIT |
| Qwen2.5-MoE (Alibaba) | 57B | 14B | 128k | MoE | Apache 2.0 |

No se dispone de resultados de benchmarks comparativos en la información proporcionada. Esta comparación se basa en características estructurales conocidas. El modelo de NVIDIA destaca por su contexto de 1M tokens y la hibridación Mamba-2 + MoE, lo que le permite manejar secuencias mucho más largas que los modelos MoE tradicionales.

## Limitaciones y advertencias

- **Sesgos potenciales**: al ser entrenado con datos web y corpora públicos, puede reflejar sesgos sociales o culturales presentes en esos datos.
- **Riesgo de alucinación**: como todo LLM, puede generar información falsa o inventada, especialmente en contextos de razonamiento complejo o con datos poco frecuentes.
- **Limitación de idiomas**: solo soporta 7 idiomas; no cubre todos los idiomas del mundo, y el rendimiento en cada uno puede variar.
- **Restricciones de licencia**: la licencia NVIDIA Nemotron Open Model permite uso comercial, pero hay que revisar los términos específicos, especialmente para la redistribución y el uso en productos de alto riesgo. No se permite el uso para crear modelos competidores según algunas cláusulas (ver licencia completa).
- **Requisitos de hardware**: la versión FP8 requiere al menos 2 GPUs H100-80GB, lo que limita su despliegue en entornos con recursos limitados. Para entornos de consumo, se necesitan cuantizaciones adicionales (GGUF) que no están disponibles en este repositorio.
- **Configuración de razonamiento**: el modo de pensamiento (`enable_thinking`) debe configurarse explícitamente; si no se activa, el modelo puede dar respuestas menos razonadas. Es importante ajustar el chat template según el caso de uso.

## Enlaces

- [Repositorio Hugging Face de esta versión FP8](https://huggingface.co/Karmation/NVIDIA-Nemotron-3-Super-120B-A12B-FP8)
- [Modelo oficial de NVIDIA en Hugging Face (FP8)](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-FP8)
- [Modelo oficial de NVIDIA en Hugging Face (NVFP4)](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4)
- [Página de investigación de Nemotron 3 Super](https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/)
- [Informe técnico (PDF)](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf)
- [NVIDIA NIM para Nemotron-3-Super-120B-A12B](https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b)
- [Licencia NVIDIA Nemotron Open Model](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/)
- [Colección de datasets de pre-entrenamiento](https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets)
- [Colección de datasets de post-entrenamiento](https://huggingface.co/collections/nvidia/nemotron-post-training-v3)
