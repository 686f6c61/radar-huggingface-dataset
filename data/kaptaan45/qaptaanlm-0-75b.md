# kaptaan45/QaptaanLM-0.75B

## Resumen

QaptaanLM-0.75B es un modelo de lenguaje fundacional compacto de 752 millones de parámetros, desarrollado por kaptaan45 (Rudransh Shekhar), estudiante de ingeniería informática en VIT Chennai y fundador de mySphere. El modelo está especializado en síntesis de código fuente, razonamiento técnico y comprensión de código de contexto largo. Se construye a partir de Qwen/Qwen3.5-0.8B-Base, del que se elimina el transformador visual para dedicar el 100% de la capacidad a texto y código, reduciendo los parámetros de ~870M a 752M.

Su arquitectura híbrida combina capas de atención lineal Gated DeltaNet con capas de atención completa GQA en una proporción 3:1, lo que permite una complejidad computacional y de memoria lineal O(N) para secuencias largas, manteniendo a la vez capacidades de recuerdo asociativo y razonamiento multi-paso. Con una ventana de contexto nativa de 256K tokens, entrenamiento en dos fases (pre-entrenamiento continuado sobre 1B tokens de código y ajuste fino supervisado sobre 100M tokens de instrucciones) y soporte nativo de Fill-in-the-Middle, el modelo está orientado a entornos de desarrollo asistido por IA en hardware de consumo.

La relevancia actual del modelo radica en su propuesta de eficiencia: ofrece una ventana de contexto muy amplia y capacidades de código en un tamaño que cabe en GPUs de consumo, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid DeltaNet (linear attention) + GQA (full attention), 24 capas en 6 macro-bloques (3 DeltaNet + 1 GQA por bloque) |
| Parametros totales | 752.393.024 (752M) |
| Parametros activos | 752.393.024 (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K nativo) |
| Tipos de cuantizacion | bfloat16, fp16, float32 (no se mencionan cuantizaciones de menor precisión en la información disponible) |
| Idiomas soportados | Inglés y código (en, code) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura se basa en un backbone de 24 capas de decoder organizadas en 6 macro-bloques repetidos. Cada macro-bloque contiene 3 capas de atención lineal Gated DeltaNet (con 16 cabezas QK y 16 cabezas V, dimensión de cabeza 128 y kernel de convolución de dimensión 4) seguidas de 1 capa de atención completa GQA (8 cabezas de consulta y 2 de clave-valor, dimensión de cabeza 256). Todas las capas incluyen FFN SwiGLU con dimensión intermedia 3584. La normalización es RMSNorm con épsilon 1e-6, y se utiliza M-RoPE con theta 10.000.000 y factor rotatorio parcial 0.25. El vocabulario tiene 248.320 tokens con embeddings de entrada y salida atados.

El entrenamiento sigue un currículo de dos etapas. La primera es pre-entrenamiento continuado (CPT) sobre KapCode-1B, un corpus curado de 1.000 millones de tokens de código, documentación y STEM, con un 50% de transformaciones Fill-in-the-Middle (prefijo-sufijo-medio). La segunda es ajuste fino supervisado (SFT) sobre KapInstruct-100M, una mezcla de 100 millones de tokens de instrucciones de múltiples fuentes, con enmascaramiento estricto de pérdida solo en las respuestas del asistente, alineado con el formato ChatML de Qwen. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generación de código fuente en múltiples lenguajes, optimizada para síntesis de código y razonamiento técnico.
- Completado de código inline en IDE gracias al entrenamiento nativo con Fill-in-the-Middle (FIM), que permite transformaciones prefijo-sufijo-medio.
- Comprensión de código de contexto largo gracias a la ventana de 256K tokens, adecuada para repositorios completos o archivos extensos.
- Razonamiento multi-paso y recuerdo asociativo mantenidos por la intercalación de capas de atención completa GQA entre las capas lineales.
- Procesamiento de texto en inglés y código; no se especifican otros idiomas.
- Generación de texto autoregresiva estándar compatible con la librería transformers.
- No se menciona soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- Completado de código en tiempo real en editores: gracias al entrenamiento FIM, el modelo puede rellenar el medio de una función o bloque de código a partir de un prefijo y un sufijo, integrándose en extensiones de VS Code o JetBrains para autocompletado inteligente.
- Análisis y comprensión de repositorios completos: con 256K tokens de contexto, puede procesar archivos de código extensos o múltiples archivos de un proyecto para responder preguntas sobre arquitectura, dependencias o lógica de negocio.
- Generación de documentación técnica: el modelo puede producir comentarios, docstrings y documentación de API a partir de código fuente, aprovechando su entrenamiento en corpus de documentación y STEM.
- Asistente de programación en entornos sin conexión: al ser un modelo de 752M parámetros, puede ejecutarse en portátiles con GPU de consumo o incluso en CPU con cuantización, ofreciendo asistencia de código sin depender de servicios en la nube.
- Razonamiento técnico y resolución de problemas: su capacidad de razonamiento multi-paso permite descomponer problemas de programación en pasos lógicos, útil en tutorías de informática o generación de explicaciones de algoritmos.
- Pre-entrenamiento o ajuste fino posterior: al ser un modelo base con licencia Apache 2.0 y pesos abiertos, puede servir como punto de partida para tareas específicas de código, como generación de tests, detección de bugs o traducción entre lenguajes, mediante fine-tuning adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 752M parámetros en bf16, el peso del modelo ocupa aproximadamente 1,5 GB (752M × 2 bytes). Con overhead de activaciones y KV cache, se estima un uso total de 2-3 GB para secuencias cortas. En cuantización de 4 bits (si estuviera disponible) cabría en menos de 0,5 GB, aunque no se mencionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bf16, como una NVIDIA GTX 1650, RTX 3050, RTX 3060 o superiores. Para contextos largos de 256K tokens, la memoria de activaciones y cache crece, por lo que se recomienda al menos 8-12 GB de VRAM para aprovechar la ventana completa.
- Compatibilidad con GPU de consumo: sí, el modelo está diseñado para ejecutarse en GPUs de consumo y aceleradores de borde, según la descripción del autor.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con vLLM, TGI o llama.cpp (si se generan pesos GGUF). No se mencionan integraciones específicas con Ollama.
- Latencia y throughput: no se proporcionan datos medidos. En una GPU moderna, un modelo de 752M parámetros en bf16 puede generar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QaptaanLM-0.75B | 752M | 256K | Hybrid DeltaNet + GQA | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B-Base | ~870M | no disponible | Transformer estándar (con visión) | no disponible | Hugging Face |
| SmolLM2-1.7B | 1.7B | 8K | Transformer estándar | Apache 2.0 | Hugging Face |

La comparativa se limita a datos estructurales, ya que no hay benchmarks publicados. QaptaanLM-0.75B se distingue por su contexto mucho mayor (256K frente a 8K de SmolLM2) y su arquitectura híbrida, aunque es más pequeño que SmolLM2-1.7B. Frente a su modelo base Qwen3.5-0.8B, elimina el componente visual y reduce parámetros, lo que puede mejorar la eficiencia para tareas de texto y código.

## Limitaciones y advertencias

- No se han publicado benchmarks independientes, por lo que el rendimiento real en tareas estándar de código y razonamiento es desconocido.
- El modelo está entrenado principalmente en inglés y código; su rendimiento en otros idiomas no está garantizado.
- La ventana de contexto de 256K tokens es nativa, pero no se especifica el rendimiento real con secuencias de esa longitud; el autor menciona pruebas con secuencias empaquetadas de 4096 tokens, lo que sugiere que la capacidad completa podría no estar totalmente validada.
- Al ser un modelo pequeño (752M), puede tener mayor tendencia a alucinaciones y menor precisión en razonamiento complejo que modelos más grandes.
- No se menciona soporte para tool calling, function calling ni uso como agente, lo que limita su integración en pipelines de automatización avanzada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B-Base tiene su propia licencia; es necesario verificar si la derivación cumple con los términos del modelo original.
- El repositorio de Hugging Face tiene pocas descargas (473) y sin valoraciones, lo que indica una adopción limitada y posible falta de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaptaan45/QaptaanLM-0.75B
- Repositorio GitHub: https://github.com/rudy-07/QaptaanLM-0.75B
- Dataset de pre-entrenamiento KapCode-1B: https://huggingface.co/datasets/kaptaan45/KapCode-1B
- Dataset de instrucciones KapInstruct-100M: https://huggingface.co/datasets/kaptaan45/KapInstruct-100M
- Modelo en Kaggle: https://www.kaggle.com/models/kaptaan45/qaptaanlm-0.75b
- Perfil del autor en Hugging Face: https://huggingface.co/kaptaan45
- Perfil del autor en Kaggle: https://www.kaggle.com/kaptaan45
