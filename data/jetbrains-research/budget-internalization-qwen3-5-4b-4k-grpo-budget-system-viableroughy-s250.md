# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-budget-system-viableroughy-s250

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-grpo-budget-system-viableroughy-s250` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generación de 4.096 tokens en tareas de razonamiento matemático: el modelo recibe en el system prompt la indicación de que dispone de ese límite y aprende a producir respuestas correctas dentro de él, en lugar de depender de un escalado en tiempo de inferencia (test-time scaling) con cadenas de razonamiento más largas.

El modelo se publica junto al paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, y corresponde a la ejecución con nombre en clave `viableroughy`, detenida en el paso 250 de los 300 planificados. La arquitectura subyacente es la del Qwen3.5-4B (transformer multimodal con pipeline `image-text-to-text`), con 4.539.265.536 parámetros totales en pesos BF16 y una licencia Apache 2.0 heredada del modelo base.

Es relevante para quienes investigan el control del coste computacional en modelos de razonamiento: propone que el modelo aprenda a ajustarse a un presupuesto de tokens declarado explícitamente, lo que reduce la dependencia de técnicas de decodificación adaptativa y facilita predecir la latencia y el coste por consulta en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), pipeline `image-text-to-text`; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación es de 4.096 tokens, no la ventana de contexto) |
| Tipos de cuantizacion | no disponible oficialmente; al estar en safetensors BF16 es cuantizable a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); repositorio de 9,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el límite de 4.096 tokens se truncan y se puntúan tal cual, de modo que el modelo recibe señal de recompensa incluso cuando agota el presupuesto. El presupuesto se declara al modelo mediante un system prompt y los prompts se renderizan con la plantilla de chat del modelo base.

Los datos de entrenamiento son problemas matemáticos del dataset DeepScaleR (agentica-org/DeepScaleR-Preview-Dataset), con hasta 3 épocas. La configuración usa lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con scheduler coseno, LR pico de 5e-7 y 10 pasos de calentamiento. La recompensa es binaria según corrección de la respuesta extraída del bloque `\boxed{}`. El entrenamiento se detuvo en el paso 250 de 300, lo que conviene tener en cuenta al comparar con otros checkpoints del barrido de presupuestos, que están en el paso 300.

## Capacidades

- Razonamiento matemático con presupuesto fijo: genera cadenas de razonamiento y respuestas finales dentro de un límite declarado de 4.096 tokens.
- Internalización del presupuesto: el modelo aprende a ajustar la longitud de su razonamiento a la indicación del system prompt, en lugar de requerir control externo de decodificación.
- Generación de texto conversacional multi-turno, gracias a la plantilla de chat del modelo base.
- Capacidad multimodal de entrada (image-text-to-text) heredada de Qwen3.5-4B; no se documenta hasta qué punto el ajuste RL preserva o degrada esta capacidad.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente; el entrenamiento se centra en problemas matemáticos de respuesta única.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de investigación en RLVR: reproducción y análisis del paper sobre internalización de presupuestos, comparando este checkpoint (paso 250) con los del paso 300 del mismo barrido.
- Razonamiento matemático con coste acotado: integración en pipelines donde se necesita una cota superior de tokens generados por consulta (4.096) para predecir latencia y facturación.
- Tutoría matemática automatizada: resolución paso a paso de problemas tipo DeepScaleR con una longitud de respuesta controlada, útil en entornos interactivos con límites de tiempo.
- Generación de soluciones verificables: la extracción de la respuesta desde `\boxed{}` facilita la validación automática en pipelines de corrección.
- Baseline para comparativas de test-time scaling: medir la pérdida de precisión frente a modelos que escalan la longitud de razonamiento en inferencia.
- Prototipado en investigación multimodal: al heredar el pipeline image-text-to-text, sirve para explorar cómo afecta el ajuste RL matemático a las capacidades de visión del modelo base (requiere validación empírica).
- Despliegue en hardware de gama media: con 4,54 B de parámetros, es viable en GPUs de consumo para experimentación y en GPUs de datacenter para servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,1 GB solo para pesos, más memoria para KV cache y activaciones; en la práctica, entre 12 y 16 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB de pesos, con margen adicional para el contexto.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 y en GPUs de 8-12 GB con cuantización a 8 o 4 bits.
- GPU de datacenter: A100, H100 y L40S son adecuadas para servicio con concurrencia.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM y TGI para servicio de alto rendimiento, llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles; dependen en gran medida del hardware y del número de tokens generados hasta el límite de 4.096.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-grpo-budget-system-viableroughy-s250 | 4,54 B | no disponible | RL (GRPO) para razonamiento matemático con presupuesto fijo de 4.096 tokens | Apache 2.0 |
| Qwen/Qwen3.5-4B (base) | 4 B aprox. | no disponible | Modelo generalista multimodal sin ajuste RL específico | Apache 2.0 (según modelo base) |
| Otros checkpoints del barrido de presupuestos de JetBrains-Research | 4,54 B | no disponible | Misma receta GRPO, paso 300, distintos presupuestos | Apache 2.0 |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint incompleto: el entrenamiento se detuvo en el paso 250 de 300, por lo que su rendimiento puede ser inferior al de los checkpoints del paso 300 del mismo barrido.
- Especialización estrecha: el ajuste se realizó exclusivamente sobre problemas matemáticos de DeepScaleR; el rendimiento en otras tareas puede degradarse respecto al modelo base.
- Riesgo de alucinación: como todo modelo de razonamiento, puede producir cadenas plausibles con respuestas finales incorrectas; la recompensa binaria no elimina este riesgo.
- Dependencia del system prompt: la internalización del presupuesto asume que el límite se declara en el system prompt con el formato de entrenamiento; otros formatos pueden no activar el comportamiento aprendido.
- Sesgos: no documentados en la información disponible; hereda los del modelo base y los del corpus DeepScaleR.
- Idiomas: no se especifican los idiomas soportados; el entrenamiento se realizó sobre problemas matemáticos, presumiblemente en inglés.
- Capacidades multimodales: no se documenta si el ajuste RL preserva la calidad de las capacidades image-text-to-text del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-4B; conviene revisar su model card.
- Citation pendiente: la model card indica `TODO` en la sección de citación, lo que complica la atribución académica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-budget-system-viableroughy-s250
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Organización en Hugging Face: https://huggingface.co/JetBrains-Research
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: referencia citada en la model card, sin enlace disponible
