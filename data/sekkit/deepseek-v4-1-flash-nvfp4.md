# sekkit/DeepSeek-V4.1-Flash-NVFP4

## Resumen

DeepSeek-V4.1-Flash-NVFP4 es la versión cuantizada a FP4 del modelo DeepSeek-V4.1-Flash desarrollado por DeepSeek AI, publicada por el usuario sekkit (y previamente por NVIDIA en `nvidia/DeepSeek-V4.1-Flash-NVFP4`). Se trata de un modelo de lenguaje autoregresivo nativamente multimodal con arquitectura Mixture-of-Experts (MoE), Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2), capaz de procesar entradas de texto e imagen con una ventana de contexto de hasta un millón de tokens. La cuantización se realizó con NVIDIA Model Optimizer v0.47.0rc0.

El modelo destaca por su escala: 552B parámetros en el backbone (8B activados durante prefill y 16B durante decode) más 196B parámetros de memoria condicional Engram, lo que da un total de 664.898.390.994 parámetros según los safetensors. Esta variante NVFP4 reduce el peso del checkpoint a 429 GB y está pensada para despliegue en hardware NVIDIA Blackwell, lo que la hace relevante para quienes necesitan servir un modelo de un billón de tokens de contexto en infraestructura de datacenter con aceleración FP4.

La licencia MIT facilita el uso comercial y la integración en sistemas de agentes, chatbots y pipelines RAG. No obstante, el despliegue exige versiones específicas de vLLM con soporte MXFP4 para las tablas Engram, lo que limita su adopción inmediata en stacks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE Causal Encoder-Decoder (CED) con Compressed Sparse Attention 2 (CSA2); clase `DeepseekV41ForCausalLM` |
| Parámetros totales | 664.898.390.994 (552B backbone + 196B memoria condicional Engram) |
| Parámetros activos | 8B en prefill, 16B en decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | NVFP4 (FP4) para pesos; tablas Engram en MXFP4; etiquetado también como 8-bit / FP8 en tags |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (Model Optimizer) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con arquitectura Causal Encoder-Decoder y Compressed Sparse Attention 2, diseñado para contextos de hasta un millón de tokens. Incorpora un componente denominado Engram, una memoria condicional de 196B parámetros que actúa como tabla de búsqueda y que en esta revisión se almacena en MXFP4 (anteriormente en FP8). El backbone activa solo 8B parámetros en prefill y 16B en decode, lo que reduce el coste computacional por token pese al tamaño total.

La cuantización se llevó a cabo con NVIDIA Model Optimizer v0.47.0rc0 y cambios de compatibilidad específicos para V4.1, partiendo de la revisión `dba1be0a40aa45a94ad051997016db3960a90277` del modelo original. La calibración utilizó 512 muestras de `cnn_dailymail` y 512 de `Nemotron-Post-Training-Dataset-v2` (subconjuntos stem, chat, math y code), con longitud de secuencia 512, batch size 4 y semilla 0. No se dispone de información sobre el dataset de entrenamiento original ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva con razonamiento multi-paso.
- Procesamiento multimodal de entrada: texto e imágenes RGB (pipeline `image-text-to-text`).
- Contexto extremadamente largo de hasta 1M tokens, adecuado para documentos completos o bases de código extensas.
- Soporte de tool calling y function calling (validado en SGLang con la revisión anterior).
- Capacidades de agente y razonamiento multi-step (parseo de reasoning y tool-calls validado).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Memoria condicional Engram para recuperación de conocimiento a gran escala.
- Modo de razonamiento explícito (reasoning parsing soportado en los runtimes).

## Casos de uso

- Agentes autónomos de larga duración: el contexto de 1M tokens y el soporte de tool calling permiten mantener el estado de una tarea compleja con múltiples herramientas y turnos sin truncar el historial.
- Análisis de repositorios de código completos: con 1M tokens de contexto, el modelo puede ingerir varios ficheros y módulos a la vez para tareas de revisión, refactorización o generación de tests.
- RAG sobre corpus documentales extensos: la memoria Engram y el contexto largo reducen la necesidad de fragmentar agresivamente los documentos, mejorando la coherencia de las respuestas.
- Atención al cliente multimodal: admite entradas de imagen y texto, útil para tickets con capturas de pantalla o documentación escaneada.
- Procesamiento de documentación técnica y legal: resumen y extracción de información de contratos o manuales de cientos de páginas en una sola pasada.
- Despliegue en datacenter con Blackwell: la cuantización NVFP4 permite servir el modelo en GPUs NVIDIA Blackwell con menor huella de memoria que la versión FP8/BF16, orientado a chatbots y sistemas RAG en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se obtuvieron resultados con vLLM, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 429 GB en NVFP4, por lo que la inferencia requiere un nodo multi-GPU con al menos ~450 GB de memoria agregada para cargar los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: NVIDIA Blackwell (microarquitectura soportada oficialmente). No se especifican modelos concretos como B200 o GB200 en la información disponible.
- GPU de consumo: no cabe en GPUs consumer (RTX 4090, 24 GB) ni en configuraciones de 2-4 GPUs de consumo.
- Opciones de despliegue: vLLM (requiere soporte MXFP4 Engram, PR vllm-project/vllm#61530) y SGLang (solo con la revisión anterior `3431dde3247c13b5957f682b1e3c6fcae2566079`). Las imágenes estándar de vLLM, incluida `vllm/vllm-openai:deepseekv41-flash-0909`, no pueden cargar la revisión actual.
- Latencia y throughput: no disponibles en la información proporcionada.
- Sistema operativo: Linux.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-NVFP4 (este) | 664,9B totales (8B/16B activos) | 1M | MIT | NVFP4 + MXFP4 Engram | Hugging Face |
| DeepSeek-V4.1-Flash (base) | 552B backbone + 196B Engram | 1M | MIT | Original (sin cuantizar) | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Requiere versiones específicas de vLLM con soporte MXFP4 Engram; las imágenes estándar fallan al cargar la revisión actual.
- SGLang solo está validado con la revisión anterior; las tablas Engram MXFP4 no han sido validadas con SGLang.
- Solo soportado oficialmente en NVIDIA Blackwell; no hay garantía de funcionamiento en otras microarquitecturas.
- Riesgo de alucinación inherente a modelos de lenguaje de gran escala; no se documentan evaluaciones de sesgo o toxicidad en la información disponible.
- Idiomas soportados no especificados; el rendimiento multilingüe es incierto.
- El tamaño del checkpoint (429 GB) y los requisitos de memoria limitan su uso a infraestructura de datacenter.
- Aunque la licencia es MIT, la model card recomienda pruebas específicas del caso de uso antes de desplegar en producción.
- El modelo no es propiedad de NVIDIA; se distribuye como contribución de terceros según los requisitos de DeepSeek AI.

## Enlaces

- Hugging Face (esta versión): https://huggingface.co/sekkit/DeepSeek-V4.1-Flash-NVFP4
- Hugging Face (versión NVIDIA): https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- PR vLLM para soporte MXFP4 Engram: https://github.com/vllm-project/vllm/pull/61530
- Dataset de calibración CNN/DailyMail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
