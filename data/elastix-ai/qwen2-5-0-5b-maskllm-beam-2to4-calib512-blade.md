# elastix-ai/Qwen2.5-0.5B-maskllm-beam-2to4-calib512-blade

## Resumen

El modelo `elastix-ai/Qwen2.5-0.5B-maskllm-beam-2to4-calib512-blade` es una versión comprimida del modelo de lenguaje Qwen2.5-0.5B, desarrollado por Alibaba Cloud. La compresión se realiza mediante poda estructural 2:4 (sparsity semi-estructurada) aplicada a la mayoría de las capas lineales del transformer, seguida de un fine-tuning con el método BEAM para recuperar la precisión. El objetivo es reducir el tamaño y acelerar la inferencia en hardware compatible con sparsity 2:4, manteniendo un rendimiento cercano al modelo original.

El modelo base Qwen2.5-0.5B es un transformer decoder-only con 494 millones de parámetros y una ventana de contexto de 32K tokens. Esta versión comprimida conserva la misma arquitectura, pero con una densidad de parámetros efectiva reducida a la mitad en las capas podadas. El repositorio incluye los pesos en formato safetensors y ocupa 1.0 GB, lo que sugiere almacenamiento en precisión FP16 o BF16. No se especifican licencia, idiomas ni resultados de benchmarks en la información disponible.

La relevancia de este modelo radica en su potencial para despliegues en entornos con recursos limitados, como dispositivos edge o aplicaciones de baja latencia, donde la sparsity 2:4 permite aprovechar las capacidades de aceleración de GPUs modernas (Ampere y posteriores). Sin embargo, al ser un modelo de investigación sin documentación completa, su uso en producción requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con poda 2:4 en capas lineales |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta 32K, pero no se confirma en esta version) |
| Tipos de cuantizacion | No se aplica cuantizacion (pesos en FP16/BF16, segun tamano del repo) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención por capas, normalización RMSNorm y embeddings rotatorios (RoPE). La compresión se realiza mediante poda 2:4, que elimina el 50% de los pesos en cada grupo de cuatro elementos de las capas lineales de atención y MLP, excepto en embeddings, lm_head, conv1d y router (que mantienen densidad completa). Esta técnica reduce el almacenamiento efectivo y acelera la inferencia en GPUs con soporte para sparsity estructurada.

El proceso de compresión incluye calibración con 512 muestras del dataset SlimPajama-6B (secuencias de 2048 tokens) y un fine-tuning posterior con el método BEAM (Bidirectional Evolutionary Adaptation for Model compression), que ajusta los pesos restantes para minimizar la pérdida de precisión. No se aplica cuantización (todos los pesos se mantienen en 16 bits). El entrenamiento se gestionó con MLflow, aunque no se detallan los hiperparámetros finales.

## Capacidades

- Generación de texto y razonamiento: al ser una versión comprimida de Qwen2.5-0.5B, conserva las capacidades básicas del modelo base, aunque con posible degradación debido a la poda.
- Soporte de tool calling y function calling: no confirmado en esta versión, pero el modelo base Qwen2.5-0.5B lo soporta.
- Capacidades multilingües: no confirmadas en esta versión, aunque el modelo base es multilingüe.
- No se documentan capacidades especiales (vision, audio, thinking mode) en la información disponible.

## Casos de uso

- Inferencia en dispositivos edge: el tamaño reducido (1.0 GB) y la sparsity 2:4 permiten ejecutar el modelo en hardware con poca memoria, como Raspberry Pi o módulos Jetson, para tareas de generación de texto o clasificación.
- Prototipado rápido: al ser una versión comprimida de un modelo conocido, sirve para validar pipelines de NLP en entornos de desarrollo sin necesidad de GPUs de gama alta.
- Aplicaciones de baja latencia: la sparsity 2:4 acelera la inferencia en GPUs compatibles (A100, RTX 30/40 series), útil para chatbots o asistentes virtuales en tiempo real.
- Investigación en compresión de modelos: este checkpoint puede usarse como referencia para estudiar el impacto de la poda 2:4 y el fine-tuning BEAM en modelos pequeños.
- Fine-tuning específico de dominio: al ser un modelo base comprimido, se puede ajustar con datasets propios para tareas concretas, aunque se recomienda validar la pérdida de precisión.
- Evaluación de técnicas de pruning: sirve como caso de estudio para comparar métodos de compresión en modelos de 0.5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede evaluar el rendimiento real del modelo comprimido frente al modelo base o alternativas.

## Requisitos de hardware

- VRAM estimada: con 494M parámetros en FP16 (~1 GB) y sparsity 2:4, la inferencia puede requerir entre 1 y 2 GB de VRAM, dependiendo del tamaño de lote y la longitud de secuencia.
- GPUs recomendadas: cualquier GPU con soporte para sparsity 2:4 (NVIDIA Ampere o posterior, como A100, RTX 30/40 series) para aprovechar la aceleración. En GPUs sin soporte, el modelo funciona pero sin ganancia de velocidad.
- Compatibilidad con GPUs consumer: sí, cabe en GPUs con 4 GB o más (RTX 3050, RTX 3060, etc.).
- Opciones de despliegue: al ser un modelo estándar de Qwen2.5, puede desplegarse con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que soporten sparsity 2:4 (llama.cpp tiene soporte experimental). No se confirma compatibilidad específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B (base) | 494M | 32K | Apache 2.0 | safetensors | Modelo original sin compresion |
| Qwen2.5-0.5B-maskllm-beam-2to4-calib512-blade | 494M (50% podado) | No disponible | No disponible | safetensors | Version comprimida con sparsity 2:4 |
| Llama 3.2 1B | 1.23B | 128K | Llama 3.2 | safetensors | Alternativa de tamano similar, sin compresion |

No se dispone de datos de rendimiento para comparar. La comparativa se limita a características técnicas.

## Limitaciones y advertencias

- Licencia no especificada: el modelo no declara licencia, lo que impide su uso comercial sin autorización explícita del autor.
- Posible degradación de rendimiento: la poda 2:4 puede reducir la calidad de generación, especialmente en tareas complejas. No hay benchmarks que lo confirmen.
- Sin documentación de idiomas: no se indica qué idiomas soporta, aunque el modelo base es multilingüe.
- Contexto no confirmado: no se especifica la longitud de contexto de esta versión comprimida; podría ser inferior a la del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje, no mitigado por la compresión.
- Formato de pesos limitado: solo safetensors, sin versiones GGUF o cuantizadas, lo que dificulta su uso en entornos con restricciones de memoria.
- Sin soporte oficial: al ser un modelo de investigación sin documentación completa, no hay garantías de mantenimiento o corrección de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elastix-ai/Qwen2.5-0.5B-maskllm-beam-2to4-calib512-blade
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Paper tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Coleccion Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
