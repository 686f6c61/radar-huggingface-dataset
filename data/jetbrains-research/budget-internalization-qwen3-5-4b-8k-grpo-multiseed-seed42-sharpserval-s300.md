# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, orientado a razonamiento matemático bajo un presupuesto fijo de generación de 8.192 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia cómo un modelo puede internalizar la restricción de longitud de respuesta durante el entrenamiento en lugar de depender de mecanismos externos de control en tiempo de inferencia.

El modelo parte de la arquitectura multimodal de Qwen3.5-4B (pipeline `image-text-to-text`), con 4.539.265.536 parámetros en BF16, y se entrena con GRPO sobre el dataset DeepScaleR (matemáticas), usando recompensa binaria de corrección de la respuesta extraída de etiquetas `\boxed{}`. El checkpoint publicado corresponde al paso 300 de la semilla 42, dentro de un ablation de tres semillas (42, 43, 44).

Su relevancia es metodológica: no busca superar el estado del arte en matemáticas, sino demostrar que el RL con presupuesto fijo produce modelos que responden con precisión dentro de un límite de tokens predefinido, lo que simplifica el despliegue en producción donde el coste por consulta y la latencia están acotados. La licencia Apache 2.0 y el formato safetensors facilitan su integración y reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5, multimodal image-text-to-text) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presupuesto de generación entrenado: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer multimodal Qwen/Qwen3.5-4B, que acepta entradas de imagen y texto. Sobre esa base se aplica GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 8.192 tokens se truncan y se puntúan tal cual, de modo que el modelo aprende a producir respuestas completas y correctas dentro de ese límite.

El entrenamiento usa el dataset DeepScaleR (matemáticas) durante un máximo de 3 épocas, con lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup, totalizando 300 pasos. La recompensa es binaria: corrección de la respuesta final extraída de `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta en `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Razonamiento matemático paso a paso con respuesta final en formato `\boxed{}`.
- Generación de cadenas de razonamiento acotadas a un presupuesto de 8.192 tokens (internalización del límite).
- Procesamiento multimodal imagen-texto heredado de Qwen3.5-4B (pipeline `image-text-to-text`).
- Conversación multi-turno mediante la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el entrenamiento se limita a matemáticas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: el prompt de entrenamiento induce razonamiento paso a paso, pero no se documenta un modo thinking separado.

## Casos de uso

- Resolución de problemas matemáticos en producción con coste acotado: al estar entrenado con un presupuesto fijo de 8.192 tokens, el modelo produce respuestas completas sin necesidad de truncado externo, lo que simplifica la estimación de coste y latencia por consulta.
- Evaluación de modelos de razonamiento bajo restricciones de longitud: sirve como referencia para estudiar la relación entre test-time scaling y precisión dentro del presupuesto, tal como propone el paper asociado.
- Generación de soluciones matemáticas verificables: el formato `\boxed{}` permite extracción automática de la respuesta final y validación programática en pipelines de corrección.
- Reproducción de experimentos de RLVR: la publicación de tres semillas y varios checkpoints (pasos 160, 290 y 300) permite analizar la varianza del entrenamiento y la estabilidad del método.
- Fine-tuning posterior sobre dominios específicos: al ser un modelo de 4B con licencia Apache 2.0 y pesos safetensors, es viable ajustarlo para matemáticas aplicadas (física, ingeniería, finanzas) partiendo de una base ya alineada con razonamiento acotado.
- Integración en asistentes educativos: el modelo puede generar explicaciones paso a paso de problemas matemáticos con una longitud predecible, adecuada para interfaces con límites de tokens por respuesta.
- Investigación en internalización de restricciones: útil para estudiar si el modelo respeta el presupuesto en inferencia con prompts distintos al de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomiendan 12-16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos; en 4 bits, alrededor de 3 GB (las cuantizaciones no están publicadas en el repo, pero son aplicables con herramientas estándar).
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) para inferencia en BF16 de una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B, 8k GRPO seed 42) | 4.539 M | no disponible (presupuesto 8.192) | GRPO sobre DeepScaleR, 300 pasos | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4.539 M | no disponible | Preentrenamiento + alineación del autor original | Apache 2.0 | Hugging Face |
| Otros checkpoints del ablation (seed 43, 44) | 4.539 M | no disponible (presupuesto 8.192) | Misma receta, distinta semilla | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento se limita a matemáticas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al modelo base.
- La recompensa binaria y el truncado a 8.192 tokens pueden penalizar problemas que requieren razonamientos más largos, forzando respuestas incompletas.
- Riesgo de alucinación en pasos intermedios: el modelo puede producir cadenas de razonamiento plausibles con errores lógicos aunque la respuesta final sea incorrecta.
- Sesgos: no se documentan análisis de sesgo; el modelo hereda los del base Qwen3.5-4B.
- Idiomas soportados no documentados; el prompt de entrenamiento está en inglés, lo que puede reducir el rendimiento en castellano u otros idiomas.
- El checkpoint es un artefacto de investigación (paso 300 de una ablación de semillas); no se documenta validación en producción ni robustez fuera del conjunto de validación.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar la model card de Qwen/Qwen3.5-4B.
- No se publican resultados de benchmarks ni métricas de validación numéricas en la información disponible, lo que impide evaluar su calidad objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint seed 42, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Checkpoint seed 43, paso 160: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Checkpoint seed 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Checkpoint seed 44, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
- Checkpoint seed 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper asociado (*Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*): no disponible enlace en la información proporcionada.
