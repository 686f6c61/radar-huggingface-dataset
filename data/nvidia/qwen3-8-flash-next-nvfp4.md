# nvidia/Qwen3.8-Flash-Next-NVFP4

## Resumen

El modelo NVIDIA Qwen3.8-Flash-Next-NVFP4 es la versión cuantizada en NVFP4 del modelo Qwen3.8-Flash-Next, desarrollado originalmente por Alibaba. NVIDIA ha aplicado su toolkit Model Optimizer para producir una variante de 125B parámetros totales (con 6B activos por token) que mantiene un rendimiento muy cercano al baseline FP8, pero con un tamaño de pesos significativamente reducido. El modelo es multimodal: acepta texto, imágenes y vídeo, y genera texto como salida. Su arquitectura híbrida combina atención Gated DeltaNet y Qwen Sparse Attention, junto con Mixture-of-Experts, flujos residuales con compuertas y embeddings n-gram, lo que lo hace especialmente eficiente en coste computacional por consulta. Destaca por su ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000 mediante YaRN, y por su idoneidad para sistemas de agentes, RAG y aplicaciones conversacionales. La licencia es la NVIDIA Open Model License, con términos adicionales de la Qwen Community License 1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal híbrido (Gated DeltaNet + Qwen Sparse Attention) con MoE, gated residual streams y n-gram embeddings |
| Parámetros totales | 125B (según model card); pesos en safetensors: 119.602.003.859 |
| Parámetros activos | 6B |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 con YaRN |
| Tipos de cuantización | NVFP4 (FP4); baseline FP8 |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model License (con términos adicionales de Qwen Community License 1.0) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo Qwen3.8-Flash-Next-NVFP4 es la versión cuantizada en NVFP4 del modelo Qwen3.8-Flash-Next de Alibaba. La arquitectura subyacente es un transformer causal multimodal con encoder visual, atención híbrida que combina Gated DeltaNet y Qwen Sparse Attention, Mixture-of-Experts con 125B parámetros totales y 6B activos por token, flujos residuales con compuertas y embeddings n-gram. Además, incorpora un módulo de predicción multi-token (MTP) de 4B parámetros. La cuantización fue realizada por NVIDIA con Model Optimizer v0.46.0, usando como datasets de calibración cnn_dailymail y Nemotron-Post-Training-Dataset-v2. No se ha publicado información detallada sobre el dataset de entrenamiento original ni sobre procesos de RLHF o DPO.

## Capacidades

- Generación de texto autorregresiva con salida en formato string.
- Entrada multimodal: texto, imágenes y vídeo (MP4/WebM).
- Contexto largo: 262.144 tokens nativos, extensible a 1.000.000 mediante YaRN.
- Arquitectura MoE híbrida con 6B parámetros activos por token, lo que reduce el coste computacional por consulta.
- Razonamiento científico y matemático: GPQA Diamond 91.5 y SciCode 18.8 en la versión NVFP4.
- Capacidades de agente: los benchmarks τ²-Bench Telecom (90.1) y Terminal-Bench 2.1 (82.9) indican capacidad para tareas con herramientas y en entornos de terminal.
- Seguimiento de instrucciones: IFBench 81.0.
- Comprensión multimodal: MMMU Pro 78.3.
- No se especifica soporte formal de function calling en la documentación, pero los benchmarks de agentes sugieren que puede integrarse en sistemas de herramientas.

## Casos de uso

- Atención al cliente multimodal: el modelo puede recibir capturas de pantalla, imágenes de productos o vídeos de un problema y responder con texto, aprovechando el encoder de visión y el contexto largo para mantener el historial de la conversación.
- RAG sobre documentación técnica extensa: con 262K tokens nativos, puede indexar manuales, papers y logs completos sin necesidad de trocear los documentos.
- Agentes de automatización de terminal: el benchmark Terminal-Bench 2.1 indica capacidad para ejecutar comandos y resolver tareas en entornos de línea de comandos, útil para DevOps.
- Análisis de vídeo: entrada de vídeo MP4/WebM permite resumir grabaciones, extraer información de eventos o generar descripciones.
- Generación de código y depuración: razonamiento matemático y científico (SciCode, GPQA) y generación de texto para asistir en programación.
- Chatbots de conocimiento interno: el benchmark Omniscience sugiere capacidad para recuperar hechos de un corpus amplio, adecuado para asistentes de empresa.
- Sistemas de decisión con herramientas: τ²-Bench Telecom evalúa el uso de herramientas en telecomunicaciones, lo que sugiere aplicaciones en agentes que consultan APIs.

## Benchmarks y rendimiento

Resultados comparando la versión NVFP4 con la baseline FP8. Evaluación realizada con temperatura=1.0, top_p=0.95, max_new_tokens=131072 y reasoning_effort=xhigh.

| Precisión | GPQA Diamond | HLE | τ²-Bench Telecom | MMMU Pro | SciCode | AA-LCR | IFBench | Omniscience | Terminal-Bench 2.1 |
|---|---|---|---|---|---|---|---|---|---|
| FP8 | 92.0 | 34.7 | 90.8 | 77.1 | 16.3 | 71.9 | 80.5 | 28.1 | 83.3 |
| NVFP4 | 91.5 | 35.4 | 90.1 | 78.3 | 18.8 | 74.1 | 81.0 | 27.6 | 82.9 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El tamaño del repositorio es de 132.7 GB, por lo que se necesitan al menos 132.7 GB de VRAM para cargar los pesos, más overhead para KV cache y activaciones.
- GPU recomendadas: NVIDIA Blackwell B200 y B300.
- No cabe en GPU de consumo (RTX 4090, etc.).
- Opciones de despliegue: vLLM como runtime soportado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4 | 125B (6B activos) | 262K nativo | NVFP4 | NVIDIA Open Model License + Qwen Community License | HuggingFace |
| Qwen3.8-Flash-Next-FP8 | 125B (6B activos) | 262K nativo | FP8 | No disponible | HuggingFace |
| Qwen3.8-Flash-Next (original) | 125B (6B activos) | 262K nativo | Sin cuantizar | Qwen Community License 1.0 | HuggingFace |

El rendimiento de NVFP4 es comparable o ligeramente superior al de FP8 en la mayoría de benchmarks, como se muestra en la sección anterior.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero el modelo puede heredar sesgos de los datos de entrenamiento originales de Qwen.
- Alucinación: como modelo autorregresivo, puede generar contenido plausible pero incorrecto, especialmente en tareas abiertas.
- Idiomas: la documentación no especifica los idiomas soportados; puede haber limitaciones en lenguas distintas del inglés o chino.
- Licencia: la NVIDIA Open Model License y la Qwen Community License 1.0 imponen condiciones; revisar los términos antes de usar en producción comercial.
- Hardware: el modelo está optimizado para NVIDIA Blackwell (B200/B300); no se garantiza su funcionamiento en GPUs anteriores o de consumo.
- Cuantización: aunque los benchmarks muestran resultados cercanos al FP8, la cuantización NVFP4 puede degradar ligeramente el rendimiento en tareas de precisión numérica o razonamiento matemático complejo.
- Responsabilidad: el modelo es de terceros (Alibaba) y NVIDIA solo lo cuantizó; la validación en casos de uso específicos es responsabilidad del desarrollador.

## Enlaces

- HuggingFace: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- GitHub Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Foro NVIDIA: https://forums.developer.nvidia.com/t/qwen3-8-flash-next-176b-now-available/381413
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
