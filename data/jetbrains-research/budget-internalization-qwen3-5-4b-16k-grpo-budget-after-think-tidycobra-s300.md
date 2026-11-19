# JetBrains-Research/budget-internalization-qwen3.5-4b-16k-grpo-budget-after-think-tidycobra-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-16k-grpo-budget-after-think-tidycobra-s300` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Se trata de un experimento de investigación centrado en la "internalización de presupuesto": el modelo aprende a razonar matemáticamente bajo un límite fijo de generación de 16.384 tokens, límite que se le declara explícitamente dentro de su propio razonamiento, justo después de la etiqueta de apertura `<think>`. El objetivo es que el modelo respete ese presupuesto sin necesidad de mecanismos externos de control en tiempo de inferencia.

El modelo forma parte de la publicación *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* y se libera como un checkpoint del paso 300 de un entrenamiento con GRPO (identificado con el nombre en clave `tidycobra`). El resultado es un modelo de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) en precisión BF16, con licencia Apache 2.0 heredada del modelo base, y con la particularidad de que su pipeline declarado es `image-text-to-text`, lo que sugiere que conserva las capacidades multimodales del Qwen3.5-4B original.

La relevancia de este modelo reside en su enfoque metodológico: en lugar de escalar el cómputo en tiempo de test (test-time scaling), el entrenamiento con RLVR (Reinforcement Learning with Verifiable Rewards) enseña al modelo a operar dentro de un presupuesto fijo, lo que puede resultar útil en entornos de producción donde el coste por consulta y la latencia deben estar acotados. Es un modelo de nicho, orientado a investigación sobre razonamiento eficiente y control de longitud de generación, no un modelo generalista de propósito amplio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles de atención no disponibles) |
| Parámetros totales | 4.539.265.536 (~4,5 mil millones) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (el presupuesto de generación es de 16.384 tokens; la ventana de contexto total no se especifica) |
| Tipos de cuantización | No disponible (pesos publicados en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal (pipeline `image-text-to-text`) de aproximadamente 4,5 mil millones de parámetros. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. El entrenamiento se realiza sobre el dataset DeepScaleR (matemáticas), con un máximo de 3 épocas, lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante 300 pasos.

La innovación técnica central es la internalización del presupuesto: los prompts incluyen una declaración del límite de 16.384 tokens de generación dentro del razonamiento del modelo, justo después de la etiqueta `<think>`, y las respuestas que alcanzan el presupuesto se truncan y se puntúan tal cual. La recompensa es binaria, basada en la corrección de la respuesta extraída del bloque `\boxed{}`. Este diseño entrena al modelo para autogestionar su longitud de razonamiento y mantener la precisión dentro del presupuesto, en lugar de depender de un escalado de cómputo en inferencia. No se documentan en la información disponible otras innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento matemático bajo un presupuesto fijo de 16.384 tokens de generación.
- Razonamiento multi-paso con modo "thinking" (etiquetas `<think>`), ya que el presupuesto se declara dentro de ese bloque.
- Resolución de problemas matemáticos con formato de respuesta extraíble mediante `\boxed{}`.
- Capacidades multimodales heredadas del modelo base (pipeline `image-text-to-text`), aunque no se detallan en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no documentado explícitamente; el foco es el razonamiento matemático con presupuesto.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Razonamiento matemático con coste acotado: el modelo puede resolver problemas de matemáticas respetando un límite estricto de 16.384 tokens de generación, lo que permite presupuestar el coste por consulta en entornos de producción con SLA de latencia.
- Evaluación de investigación sobre eficiencia de razonamiento: sirve como checkpoint de referencia para estudiar cómo el RLVR con presupuesto fijo afecta a la precisión dentro del presupuesto frente al escalado en tiempo de test.
- Generación de soluciones paso a paso en entornos educativos: el modo `<think>` permite exponer el razonamiento intermedio y la respuesta final en formato `\boxed{}`, útil para herramientas de tutoría matemática.
- Pipelines de verificación automática de respuestas: la recompensa binaria y el formato de extracción facilitan integrar el modelo en sistemas que validan respuestas matemáticas de forma automática.
- Experimentos de control de longitud en decodificación: útil para comparar estrategias de presupuesto interno frente a truncado externo o parada temprana en frameworks de inferencia.
- Base para ajustes posteriores en dominios específicos: al ser un fine-tune sobre Qwen3.5-4B con licencia Apache 2.0, puede servir como punto de partida para RL adicional en otras tareas con restricciones de presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 12-16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB para pesos; en 4 bits, en torno a 2,5-3 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue con contexto largo y alto throughput; RTX 4090 (24 GB) es adecuada para inferencia en BF16 con contexto moderado.
- ¿Cabe en GPU de consumo? Sí, en BF16 cabe en RTX 4090 (24 GB) y en GPUs de 16 GB con contexto reducido; en cuantizaciones de 8 o 4 bits podría caber en GPUs de 8-12 GB, aunque no hay versiones oficiales publicadas.
- Opciones de despliegue: transformers (librería declarada), con posibilidad de vLLM o TGI para servir; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-16k-grpo (este) | ~4,54 B | No disponible (presupuesto de generación 16.384) | RLVR con presupuesto fijo para matemáticas | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4,5 B | No disponible | Modelo multimodal generalista | Apache 2.0 | Hugging Face |
| Alternativas de razonamiento matemático de ~4 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en razonamiento matemático mediante RL sobre DeepScaleR; su rendimiento fuera de ese dominio no está documentado y podría degradarse respecto al modelo base.
- El presupuesto de 16.384 tokens está internalizado para ese valor concreto; no se garantiza que el modelo respete otros presupuestos distintos sin reentrenamiento.
- Las respuestas que alcanzan el presupuesto se truncan y se puntúan tal cual durante el entrenamiento, lo que puede producir respuestas incompletas en casos de problemas muy largos.
- Riesgo de alucinación inherente a los modelos de lenguaje; la recompensa binaria por corrección mitiga parcialmente el problema en matemáticas, pero no lo elimina.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base Qwen3.5-4B.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre un dataset de matemáticas, presumiblemente en inglés, sin confirmación.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-4B y de los datos DeepScaleR.
- Es un checkpoint de investigación (paso 300) con 0 descargas y 0 likes; no hay evidencia de validación en producción ni benchmarks publicados.
- La model card incluye un `TODO` en la sección de citación, lo que indica documentación incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-16k-grpo-budget-after-think-tidycobra-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Organización JetBrains-Research: https://huggingface.co/JetBrains-Research
