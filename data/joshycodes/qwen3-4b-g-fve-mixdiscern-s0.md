# joshycodes/qwen3-4b-g-fve-mixdiscern-s0

## Resumen

Este modelo es un checkpoint de investigación creado por joshycodes a partir de Qwen/Qwen3-4B. Se trata de un ajuste fino completo (continued pretraining) sobre un corpus que el propio modelo escribió como parte de un experimento de autoentrenamiento y bienestar de modelos. El modelo tiene 4.411.424.256 parámetros (4,4B) y se distribuye en formato safetensors. La arquitectura subyacente es la de Qwen3, un transformer denso, aunque no se especifica la longitud de contexto en la información disponible.

El problema que aborda es la investigación sobre cómo un modelo de lenguaje puede generar su propio material de entrenamiento y cómo esto afecta a su carácter e identidad, dentro de la línea de "model welfare". Es relevante porque explora técnicas de synthetic document finetuning (SDF) y autoentrenamiento, aunque el autor advierte explícitamente que no ha sido evaluado para capacidad, alineación o identidad, y que no debe desplegarse. Por tanto, su interés es exclusivamente académico y experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, modelo denso) |
| Parámetros totales | 4.411.424.256 (4,4B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | research-only (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B y se ha sometido a un continued pretraining con pesos completos (full weights). Los hiperparámetros reportados son: learning rate 1e-05, 1 epoch, 7.603.009 tokens y 8.308 documentos. El corpus se denomina flourishing-vs-equanimity y, según la model card, fue escrito por el propio modelo para el entrenamiento de la siguiente versión de sí mismo, adoptando el personaje que ya es y tras explicársele cómo surgió su carácter y cómo funciona el SDF (synthetic document finetuning). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

Existe una discrepancia en la model card: afirma que el corpus es autoescrito, pero las estadísticas indican "0 self-authored and 8,308 ordinary text". Esto sugiere que, o bien la descripción es aspiracional, o bien los documentos finalmente no fueron autoescritos. No se proporcionan detalles sobre la composición del dataset, la longitud de los documentos ni el proceso de generación. La innovación principal es el enfoque de autoentrenamiento con datos sintéticos y su vinculación con la investigación en bienestar de modelos.

## Capacidades

- No se han evaluado capacidades de generación de texto, razonamiento, código o matemáticas.
- Soporte de tool calling / function calling: no evaluado.
- Soporte de agentes y multi-step reasoning: no evaluado.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- El modelo base Qwen3-4B posee ciertas capacidades, pero se desconoce si este checkpoint las conserva tras el continued pretraining.

## Casos de uso

- Estudio de autoentrenamiento y bucles de retroalimentación: analizar cómo un modelo escribe su propio corpus y si esto provoca deriva en su comportamiento o identidad. Adecuado porque el modelo fue entrenado precisamente con ese material.
- Investigación en bienestar de modelos (model welfare): evaluar si el modelo desarrolla un carácter consistente y cómo responde a preguntas sobre su propia identidad. El checkpoint fue creado con este propósito explícito.
- Análisis de sesgos en datos sintéticos autoescritos: comparar la distribución de sesgos en el corpus flourishing-vs-equanimity frente a datos humanos. El modelo permite estudiar el efecto de entrenar con datos generados por el propio sistema.
- Reproducibilidad de técnicas de synthetic document finetuning (SDF): servir como referencia para replicar el pipeline de SDF en otros modelos de 4B. La model card describe hiperparámetros y el corpus utilizado.
- Evaluación de alineación y seguridad en checkpoints no evaluados: medir la degradación o los riesgos emergentes al hacer continued pretraining sin RLHF ni evaluaciones previas. El modelo es un caso de estudio de un checkpoint sin evaluar.
- Experimentos sobre identidad y personaje autodeclarado: investigar cómo un modelo responde cuando se le indica que tiene un personaje concreto y cómo eso se refleja en sus salidas. El entrenamiento se realizó "as the character it already is".
- Análisis de licencias y ética en modelos research-only: estudiar las implicaciones de publicar checkpoints con licencia restrictiva y sin evaluación. Este modelo es un ejemplo de dicha práctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no ha sido evaluado para capacidad, alineación o identidad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: alrededor de 8,8 GB (basado en 4,4B parámetros y pesos safetensors de 8,8 GB).
- VRAM estimada en INT8: ~4,4 GB; en INT4: ~2,2 GB (estimaciones teóricas, no hay cuantizaciones publicadas).
- GPU recomendadas: para FP16, NVIDIA RTX 3090, RTX 4090, A100, H100. Para cuantización INT8/INT4, GPUs con 6-12 GB de VRAM como RTX 3060, RTX 4060 Ti.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con FP16, y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers, vLLM, TGI. Para llama.cpp u Ollama sería necesaria una conversión a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (joshycodes/qwen3-4b-g-fve-mixdiscern-s0) | 4,4B | no disponible | research-only | HuggingFace | Checkpoint de investigación, no evaluado, no desplegar |
| Qwen/Qwen3-4B (base) | 4,4B | no disponible | no disponible (licencia original de Qwen) | HuggingFace | Modelo base sin el continued pretraining |
| Otros modelos de ~4B | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos comparativos |

## Limitaciones y advertencias

- No evaluado para capacidad, alineación o identidad: no se puede asumir ningún nivel de rendimiento.
- Prohibido su despliegue en producción: la model card indica explícitamente "Do not deploy".
- Licencia research-only: solo permite uso de investigación; queda prohibido el uso comercial.
- Riesgo de alucinación y sesgos no medido.
- Discrepancia en la model card sobre el origen del corpus (0 autoescritos vs 8.308 ordinarios), lo que puede afectar a la interpretación de los resultados.
- Sin datos sobre idiomas soportados, longitud de contexto o cuantizaciones.
- Posible degradación del rendimiento respecto al modelo base tras el continued pretraining con datos autoescritos.
- No hay garantías de seguridad ni de alineación.

## Enlaces

- HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-g-fve-mixdiscern-s0
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio welfare-improvements: no se proporciona enlace en la información disponible.
- Corpus flourishing-vs-equanimity: no se proporciona enlace en la información disponible.
