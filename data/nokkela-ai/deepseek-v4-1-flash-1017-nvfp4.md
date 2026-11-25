# nokkela-ai/DeepSeek-V4.1-Flash-1017-NVFP4

## Resumen

DeepSeek-V4.1-Flash-1017-NVFP4 es la versión cuantizada en FP4 del modelo multimodal DeepSeek-V4.1-Flash-1017 desarrollado por DeepSeek AI, empaquetada por NVIDIA mediante su herramienta Model Optimizer y redistribuida de forma independiente por nokkela-ai. Se trata de un modelo Mixture-of-Experts (MoE) nativamente multimodal con arquitectura Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2), pensado para contextos de hasta un millón de tokens.

El modelo base cuenta con 552 000 millones de parámetros en el backbone (8 000 millones activados durante prefill y 16 000 millones durante decode) más 196 000 millones adicionales en memoria condicional Engram, sumando 664 898 390 994 parámetros totales según los pesos en safetensors. La cuantización NVFP4 reduce el peso del repositorio a 429 GB y permite ejecutarlo en hardware Blackwell, lo que resulta relevante para despliegues de agentes, chatbots y sistemas RAG que necesitan contexto largo y capacidades multimodales en infraestructura NVIDIA.

Este fork de nokkela-ai mantiene la licencia MIT del modelo original y se publica bajo el pipeline image-text-to-text, aceptando entradas de texto e imagen y generando texto. Su relevancia actual radica en que permite a desarrolladores europeos (tag region:eu) acceder a un checkpoint pre-cuantizado de un modelo frontera sin tener que ejecutar el proceso de cuantización, aunque requiere versiones específicas de vLLM con soporte MXFP4 Engram.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE Causal Encoder-Decoder (CED) con Compressed Sparse Attention 2 (CSA2); clase `DeepseekV41ForCausalLM` |
| Parametros totales | 664 898 390 994 (552B backbone + 196B memoria condicional Engram) |
| Parametros activos | 8B en prefill y 16B en decode |
| Longitud de contexto | Hasta 1 000 000 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 para pesos); tablas Engram en MXFP4; tags adicionales fp8 y 8-bit |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 429 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer de tipo Mixture-of-Experts con encoder-decoder causal (CED) y un mecanismo propietario de atención dispersa comprimida denominado Compressed Sparse Attention 2 (CSA2), diseñado para sostener contextos de hasta un millón de tokens con un coste computacional reducido. Además del backbone de 552 000 millones de parámetros, incorpora 196 000 millones de parámetros en una memoria condicional llamada Engram, almacenada como tablas de búsqueda en MXFP4, lo que explica que los parámetros totales asciendan a 664 898 390 994. El modelo es nativamente multimodal: acepta texto e imágenes RGB y produce texto.

La información sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO) no está disponible en la documentación proporcionada, ya que el autor la marca como "undisclosed". Lo que sí se documenta es el proceso de cuantización: NVIDIA Model Optimizer v0.48.0rc0 aplicó cuantización NVFP4 usando 1 024 muestras de calibración (512 de cnn_dailymail y 512 de Nemotron-Post-Training-Dataset-v2, con subsets stem, chat, math y code), longitud de secuencia 512 y batch size 4. La revisión de origen del checkpoint es `1bae0e1088993b9b82de08f59de5be5a34e42170`.

## Capacidades

- Generación de texto autoregresiva con razonamiento de largo alcance gracias a la ventana de 1M tokens.
- Procesamiento multimodal de entrada: acepta texto e imágenes RGB (pipeline image-text-to-text).
- Razonamiento matemático y científico, evidenciado por la inclusión de GPQA Diamond, SciCode y AA-LCR en el conjunto de evaluación.
- Generación y comprensión de código, con evaluación en SciCode y Terminal-Bench 2.1.
- Seguimiento de instrucciones complejas, evaluado con IFBench.
- Comprensión multimodal avanzada, evaluada con MMMU-Pro.
- Capacidad de operar como agente en entornos de terminal y tareas multi-paso (Terminal-Bench 2.1).
- Soporte de tool calling y function calling: no disponible explícitamente en la documentación, aunque el uso previsto incluye sistemas de agentes.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible en la documentación.

## Casos de uso

- Sistemas de agentes autónomos: el modelo está diseñado explícitamente para "AI Agent systems" según la model card, y su ventana de 1M tokens permite mantener el estado completo de una tarea multi-paso sin truncar el historial de herramientas ni los resultados intermedios.
- Automatización de terminal y DevOps: con evaluación en Terminal-Bench 2.1, puede integrarse en pipelines que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- RAG sobre corpus extensos: la ventana de un millón de tokens permite inyectar documentos completos o múltiples fuentes sin troceado agresivo, reduciendo la pérdida de contexto en la recuperación.
- Análisis de documentos con imágenes: al aceptar entradas RGB además de texto, puede procesar informes escaneados, capturas de pantalla o gráficos junto al texto asociado en un mismo contexto.
- Asistencia científica y matemática: los benchmarks GPQA Diamond y SciCode en su suite de evaluación indican idoneidad para razonamiento técnico, resolución de problemas de nivel experto y generación de código científico.
- Atención al cliente multimodal: puede gestionar conversaciones multi-turno con contexto largo e incorporar imágenes enviadas por el usuario (capturas, fotos de producto) en la misma sesión.
- Evaluación de instrucciones y cumplimiento: IFBench en su suite sugiere uso en tareas donde el seguimiento estricto de restricciones es crítico, como generación de informes con formato regulado.

## Benchmarks y rendimiento

La model card menciona los conjuntos de evaluación empleados (GPQA Diamond, AA-LCR, SciCode, IFBench, MMMU-Pro, Terminal-Bench 2.1) pero no incluye los resultados numéricos en la información disponible. Los resultados a los que se alude se obtuvieron con `vllm/vllm-openai:v0.31.0` aplicando los cambios de Engram del PR vllm-project/vllm#61530.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 429 GB en FP4, por lo que la inferencia requiere al menos ese volumen distribuido entre GPUs; no cabe en una sola GPU consumer.
- GPU recomendadas: exclusivamente NVIDIA Blackwell según la model card (microarquitectura soportada). GPUs anteriores (Hopper, Ada, Ampere) no están declaradas como compatibles con esta cuantización NVFP4.
- GPU consumer: no es viable en RTX 4090 ni en ninguna consumer actual, tanto por el volumen de pesos como por el requisito de arquitectura Blackwell.
- Opciones de despliegue: vLLM (requiere build con soporte MXFP4 Engram, PR #61530) y SGLang. Sistema operativo preferido: Linux.
- Latencia y throughput: no disponibles. El modelo activa 8B parámetros en prefill y 16B en decode, lo que en teoría reduce el coste por token frente a un modelo denso de tamaño equivalente, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-NVFP4 (este) | 664,9B totales (8B/16B activos) | 1M | MIT | Hugging Face (fork nokkela-ai) | Cuantizado NVFP4, solo Blackwell |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 552B backbone + 196B Engram | 1M | MIT | Hugging Face (original) | Pesos sin cuantizar; mayor huella de almacenamiento |
| nvidia/DeepSeek-V4.1-Flash-1017-NVFP4 | Idénticos al fork | 1M | MIT | Hugging Face (NVIDIA) | Checkpoint original de NVIDIA del que deriva este fork |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con modelos de otras familias.

## Limitaciones y advertencias

- Requiere hardware NVIDIA Blackwell: no es desplegable en GPUs Hopper, Ada o Ampere, lo que restringe gravemente las opciones de infraestructura.
- Dependencia de una versión parcheada de vLLM: las imágenes estándar de vLLM no cargan las tablas Engram en MXFP4; es necesario aplicar el PR #61530 o usar SGLang.
- Riesgo de alucinación: inherente a los modelos generativos de gran escala; la model card no documenta mitigaciones específicas.
- Sesgos: la información sobre sesgos conocidos no está disponible en la documentación proporcionada.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado fuera del inglés sin evaluación previa.
- Datos de entrenamiento no divulgados ("undisclosed"), lo que dificulta la auditoría de composición del corpus y de posibles contaminaciones.
- Licencia MIT: permite uso comercial sin restricciones de royalties, pero el aviso de terceros de NVIDIA indica que el modelo no es propiedad de NVIDIA y se rige por los términos de DeepSeek AI.
- Este fork concreto tiene 50 descargas y 0 likes en el momento de la ficha; se recomienda verificar la integridad de los pesos frente al checkpoint original de NVIDIA antes de usarlo en producción.
- La model card recomienda pruebas específicas de caso de uso siguiendo la metodología V-model antes de desplegar en sistemas reales.

## Enlaces

- Hugging Face (este fork): https://huggingface.co/nokkela-ai/DeepSeek-V4.1-Flash-1017-NVFP4
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Checkpoint NVFP4 de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- PR de vLLM con soporte MXFP4 Engram: https://github.com/vllm-project/vllm/pull/61530
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
