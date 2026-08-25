# JoshuaCalhoon/cyankiwi-Qwen3.8-27B-AWQ-INT4-MTPLX

## Resumen

El modelo `cyankiwi-Qwen3.8-27B-AWQ-INT4-MTPLX` es una adaptación especializada del modelo multimodal Qwen3.8-27B de Alibaba, cuantizado a 4 bits mediante AWQ (Activation-aware Weight Quantization) y posteriormente transformado con la herramienta MTPLX Forge para incorporar predicción multi-token (MTP) en hardware Apple Silicon. El autor, JoshuaCalhoon, lo publica bajo licencia Apache 2.0 con el objetivo de ofrecer una versión optimizada para ejecución local en dispositivos con chip M5 Pro, aprovechando el framework MLX.

El modelo base, Qwen3.8-27B, es un LLM denso nativo multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba, con capacidades destacadas en generación de código, flujos agénticos y automatización de oficina. La versión MTPLX añade una capa de predicción multi-token que, según la verificación del autor, logra un multiplicador de 2,59× frente a la línea base autoregresiva, con una profundidad óptima D2. El repositorio incluye un archivo `mtplx_runtime.json` con el registro completo de verificación.

Este modelo es relevante para desarrolladores que trabajan en ecosistemas Apple Silicon y necesitan un LLM multimodal con cuantización agresiva (INT4) y aceleración específica para MLX, manteniendo la compatibilidad con la librería `transformers` y el pipeline `image-text-to-text`. Aunque cuenta con pocas descargas (0) y sin datos de idiomas ni benchmarks públicos, su propuesta técnica es interesante para entornos de inferencia local con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + imagen), basado en Qwen3.8-27B |
| Parametros totales | 27B (modelo base) / 7.616.630.000 (pesos cuantizados en safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ INT4 (4 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (para MLX) |

## Arquitectura y entrenamiento

El modelo se construye a partir de `cyankiwi/Qwen3.8-27B-AWQ-INT4`, que es una cuantización AWQ de 4 bits del modelo original Qwen3.8-27B. La arquitectura subyacente es un transformer denso nativo multimodal, capaz de procesar entradas de texto e imagen de forma conjunta. El equipo de Qwen ha entrenado este modelo con un enfoque en tareas de codificación, razonamiento agéntico y automatización de oficina, según la descripción oficial del repositorio.

La innovación principal de esta versión MTPLX es la incorporación de predicción multi-token (MTP), una técnica que permite predecir varios tokens futuros simultáneamente en lugar de uno solo, reduciendo la latencia de inferencia. El autor reporta una profundidad óptima D2 y un multiplicador de 2,59× frente a la línea base autoregresiva, verificado en un Apple M5 Pro con sampler de temperatura 0,6, top_p 0,95 y top_k 20. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de texto e imagen, permitiendo tareas como descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación de código: el modelo base está optimizado para tareas de programación, incluyendo completado, depuración y explicación de código.
- Flujos agénticos: soporta razonamiento multi-paso y ejecución de tareas complejas, adecuado para agentes autónomos.
- Automatización de oficina: capacidades para resumir documentos, generar informes y manejar tareas administrativas.
- Predicción multi-token (MTP): aceleración de inferencia mediante predicción simultánea de múltiples tokens, con un multiplicador de 2,59× frente a la línea base autoregresiva.
- Compatibilidad con MLX: ejecución nativa en Apple Silicon (M5 Pro) mediante el framework MLX, con integración con la herramienta `mtplx`.

## Casos de uso

- Asistente de programación local en Mac: un desarrollador puede usar el modelo para autocompletar código, generar funciones y explicar fragmentos en un IDE, aprovechando la cuantización INT4 para caber en la memoria unificada de un Mac M5 Pro y la aceleración MTP para respuestas más rápidas.
- Análisis de documentos con imágenes: en entornos de oficina, el modelo puede procesar capturas de pantalla, diagramas o gráficos y generar resúmenes o extraer datos, gracias a su capacidad multimodal.
- Agente de automatización de tareas: integrado en un pipeline de automatización, el modelo puede razonar sobre pasos múltiples, llamar a herramientas y completar tareas como gestión de correos o generación de informes.
- Chatbot de soporte técnico con contexto visual: un sistema de atención al cliente puede enviar capturas de pantalla de errores y el modelo las interpreta para ofrecer soluciones paso a paso.
- Prototipado rápido de aplicaciones de visión por computador: investigadores pueden usar el modelo para probar ideas de VQA (Visual Question Answering) sin necesidad de GPUs dedicadas, ejecutándolo en hardware Apple.
- Inferencia de baja latencia en edge computing: en dispositivos Apple Silicon, el modelo puede desplegarse para tareas de procesamiento de lenguaje natural y visión en tiempo real, como transcripción o análisis de imágenes en streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es el multiplicador de velocidad de la predicción multi-token:

| Metrica | Valor |
|---|---|
| Multiplicador vs línea base autoregresiva | 2,59× |
| Profundidad óptima (MTP) | D2 |
| Hardware de verificación | Apple M5 Pro |
| Sampler | temperatura 0,6 · top_p 0,95 · top_k 20 |

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser una cuantización INT4 de un modelo de 27B, el tamaño de los pesos es de aproximadamente 7,6 GB (según safetensors), lo que sugiere que puede caber en la memoria unificada de un Mac con al menos 16 GB.
- GPU recomendadas: Apple Silicon (M5 Pro o superior) para aprovechar la optimización MLX. No se menciona compatibilidad con GPUs NVIDIA o AMD.
- Compatibilidad con consumer GPU: no disponible; el modelo está orientado exclusivamente a Apple Silicon.
- Opciones de despliegue: mediante la herramienta `mtplx` (comandos `mtplx pull` y `mtplx start chat`), que lo detecta automáticamente. También es compatible con la librería `transformers` de HuggingFace.
- Latencia y throughput: no se proporcionan datos específicos, solo el multiplicador de 2,59× frente a la línea base autoregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyankiwi-Qwen3.8-27B-AWQ-INT4-MTPLX | 27B (base) | No disponible | AWQ INT4 | Apache 2.0 | HuggingFace |
| Qwen3.8-27B (original) | 27B | No disponible | No cuantizado | Apache 2.0 | HuggingFace, GitHub |
| cyankiwi/Qwen3.8-27B-AWQ-INT4 | 27B | No disponible | AWQ INT4 | Apache 2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos multimodales de tamaño similar en la información proporcionada. La principal diferencia entre las tres versiones es la capa MTPLX y la cuantización, siendo la versión MTPLX la única optimizada para MLX.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos específicos del modelo, pero al derivar de Qwen3.8-27B, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad; como cualquier LLM, puede generar contenido plausible pero incorrecto, especialmente en tareas multimodales complejas.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que dificulta su uso en aplicaciones que requieran ventanas largas.
- Limitaciones de idioma: no se especifican los idiomas soportados; se asume que hereda las capacidades multilingües de Qwen3.8, pero sin confirmación.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base original (también Apache 2.0) y las condiciones de la cuantización AWQ.
- Caveat para produccion: el modelo está diseñado específicamente para Apple Silicon con MLX; su uso en otros entornos puede requerir conversión adicional y no se garantiza el rendimiento reportado. Además, al ser una cuantización INT4, puede haber pérdida de precisión en tareas de alta sensibilidad numérica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoshuaCalhoon/cyankiwi-Qwen3.8-27B-AWQ-INT4-MTPLX
- Modelo base cuantizado: https://huggingface.co/cyankiwi/Qwen3.8-27B-AWQ-INT4
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
