# ahmedselhady/XSDPO-Nemotron-1.5B-500x5-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only

## Resumen

XSDPO-Nemotron-1.5B es un ajuste fino (fine-tuning) del modelo de razonamiento Nemotron-Research-Reasoning-Qwen-1.5B de NVIDIA, publicado por el usuario ahmedselhady en Hugging Face. Se trata de un checkpoint experimental de investigación (paso 100 de un entrenamiento denominado `macereason-math-500x5-nemotron-1.5b-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only`) orientado a mejorar el razonamiento matemático mediante una variante de optimización por preferencias (SDPO, presumiblemente una variante de DPO con decodificación especulativa o *self-distillation*). El modelo hereda la arquitectura Qwen2 del modelo base, con 1.777 millones de parámetros (aproximadamente 1,5 mil millones nominales).

El interés de esta ficha es limitado pero relevante para investigadores que siguen la línea de *reasoning models* pequeños: demuestra cómo se puede partir de un modelo de razonamiento ya ajustado (Nemotron-Research-Reasoning) y aplicar una etapa adicional de optimización con datos matemáticos (`math-500x5` sugiere 500 problemas repetidos 5 veces) y una referencia fija (`ref10752`), con un coeficiente KL de 0,001 y una tasa de aprendizaje de 3e-6. El nombre incluye `en_only`, lo que indica que el entrenamiento se restringió a datos en inglés.

Se publica como checkpoint intermedio (step 100) con ramas por revisión (`revision="step-100"`), lo que lo convierte en material útil para estudiar la evolución del entrenamiento, no en un modelo listo para producción. No hay métricas, licencia ni idiomas declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), segun tags del repo |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2-1.5B, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | no disponible (nombre del run sugiere `en_only` en entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B`, que a su vez es un Qwen2 de 1,5 mil millones de parámetros adaptado por NVIDIA para razonamiento. La arquitectura subyacente es un transformer decoder-only con atención causal estándar (no MoE, no SSM, no híbrida), con normalización RMSNorm y RoPE, tal como corresponde a la familia Qwen2.

El entrenamiento reportado en el nombre del checkpoint es un run de SDPO (una variante de optimización por preferencias) sobre datos matemáticos, con los siguientes hiperparámetros deducibles del identificador: 500 problemas repetidos 5 veces (`500x5`), tasa de aprendizaje 3e-6, coeficiente KL 0,001, referencia fija `ref10752`, tamaño de lote o *top-k* 512 (`k512`), y restricción a inglés (`en_only`). El checkpoint publicado corresponde al paso 100. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas previas de SFT o RLHF más allá del modelo base.

## Capacidades

- Generación de texto y razonamiento paso a paso (heredado del modelo base Nemotron-Research-Reasoning).
- Razonamiento matemático, presumiblemente reforzado por el entrenamiento con `math-500x5`.
- Generación de código y matemáticas a nivel de modelo de 1,5B (capacidad limitada por tamaño).
- Soporte de *tool calling* / *function calling*: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; el modelo base está orientado a razonamiento.
- Capacidades multilingües: no disponibles; el run se etiqueta `en_only`, por lo que se espera un rendimiento degradado fuera del inglés.
- Modo *thinking* explícito: probable, dado el linaje Nemotron-Research-Reasoning, pero no documentado en la model card.

## Casos de uso

- Investigación en optimización por preferencias: el checkpoint permite reproducir y comparar curvas de entrenamiento SDPO frente al modelo base, cargando revisiones concretas (`step-100`) para analizar la evolución de la pérdida y del comportamiento.
- Experimentos de razonamiento matemático en entornos con recursos limitados: al ser un modelo de 1,5B, se puede ejecutar en una sola GPU consumer para estudiar la calidad del razonamiento en problemas tipo GSM8K o MATH sin infraestructura de gran escala.
- *Baseline* para comparativas de *fine-tuning*: sirve como referencia para medir cuánto mejora (o degrada) un ajuste adicional sobre un modelo de razonamiento ya entrenado.
- Destilación y generación de datos sintéticos: puede emplearse para generar cadenas de razonamiento en inglés que alimenten el entrenamiento de modelos mayores o de otros dominios.
- Evaluación de robustez y alucinación en modelos pequeños de razonamiento: útil para estudiar cómo el ajuste con KL bajo (0,001) afecta a la fidelidad del razonamiento.
- Prototipado de asistentes de resolución de problemas matemáticos en inglés: con las debidas salvaguardas, puede integrarse en demos o cuadernos interactivos para resolver ejercicios paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en FP16/BF16 (1,777 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- En cuantización de 8 bits: ~1,8 GB; en 4 bits: ~1 GB (estimaciones teóricas, no verificadas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado (RTX 3060, RTX 4060, RTX 4070, A10, L4). Para mayor throughput, A100 o H100 no son necesarias dado el tamaño.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en GPUs de 8 GB con cuantización.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference`), y presumiblemente llama.cpp/Ollama si se generan GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1,777 M | no disponible | no disponible | Hugging Face, checkpoint step-100 |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B (base) | ~1,5 B | no disponible | no disponible en la información | Hugging Face (NVIDIA) |
| Qwen2-1.5B (original) | ~1,5 B | 32.768 tokens (típico en Qwen2) | Apache 2.0 (según familia Qwen2) | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B | 32.768 tokens (típico) | MIT (según publicación) | Hugging Face |

La comparativa se limita a parámetros y disponibilidad; no hay datos de rendimiento publicados para este checkpoint que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Modelo experimental de investigación: es un checkpoint intermedio (step 100) de un run de entrenamiento, no una versión final validada.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar el modelo base.
- Idiomas: el run se etiqueta `en_only`; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación: inherente a los modelos de 1,5B, especialmente en razonamiento matemático y código.
- Sesgos: no documentados; al heredar el modelo base y entrenarse con datos matemáticos en inglés, puede presentar sesgos de dominio y de idioma.
- Contexto: no confirmado; no se debe asumir la ventana de 32k de Qwen2 sin verificación.
- Sin benchmarks ni evaluación publicada: no hay evidencia de mejora frente al modelo base.
- Reproducibilidad: el nombre del run codifica hiperparámetros, pero no se publica el código ni el dataset exacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-500x5-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Familia Qwen2 (referencia arquitectónica): https://huggingface.co/Qwen/Qwen2-1.5B
- Documentación de transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://huggingface.co/docs/text-generation-inference
