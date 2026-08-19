# Chengheng/sandbag-ministral3-8b-lora-wm-self

## Resumen

El modelo `Chengheng/sandbag-ministral3-8b-lora-wm-self` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Chengheng, diseñado para ajustar el modelo base `mistralai/Ministral-3-8B-Instruct-2512`. El término "sandbag" en el nombre sugiere que el adaptador podría estar orientado a reducir deliberadamente el rendimiento del modelo en ciertas tareas, un enfoque que se estudia en el contexto de la seguridad y la evaluación de modelos de IA. Sin embargo, la model card no proporciona ninguna descripción funcional, por lo que su propósito exacto no está documentado.

El adaptador se publica con la librería PEFT (Parameter-Efficient Fine-Tuning) y tiene un tamaño de repositorio de 0.2 GB, lo que indica que solo contiene los pesos del adaptador, no el modelo completo. El modelo base, Ministral 3 8B, es un modelo de lenguaje denso de 8 mil millones de parámetros con capacidades de visión, desarrollado por Mistral AI, orientado a aplicaciones con restricciones de cómputo y memoria. La relevancia de este adaptador radica en su posible uso para investigar comportamientos de "sandbagging" (subrendimiento intencionado) en modelos de IA, un tema de creciente interés en la comunidad de seguridad de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Ministral 3 8B) |
| Parametros totales | 8B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible (hereda los del modelo base, no especificados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `mistralai/Ministral-3-8B-Instruct-2512`, un modelo de lenguaje denso de 8B parámetros con arquitectura transformer y capacidades multimodales (visión). El modelo base fue desarrollado por Mistral AI y está disponible en variantes base, instruct y reasoning. El adaptador LoRA utiliza la técnica de ajuste de bajo rango, que congela los pesos del modelo base e introduce matrices de baja dimensión entrenables, lo que permite un ajuste eficiente con recursos limitados.

No se dispone de información sobre los datos de entrenamiento, el procedimiento de ajuste, los hiperparámetros utilizados ni el régimen de entrenamiento (por ejemplo, si se usó RLHF, DPO u otra técnica). La model card no incluye detalles sobre el dataset, el número de pasos, la tasa de aprendizaje ni la configuración de LoRA (rango, alpha, etc.). El único dato técnico disponible es que se usó PEFT 0.20.0.

## Capacidades

- Generación de texto: el adaptador hereda las capacidades de generación de texto del modelo base Ministral 3 8B Instruct.
- Razonamiento: el modelo base tiene una variante de razonamiento, pero no se especifica si este adaptador la activa.
- Visión: el modelo base Ministral 3 8B incluye capacidades de visión, por lo que el adaptador podría heredarlas, aunque no está confirmado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: el nombre "sandbag" sugiere un posible comportamiento de subrendimiento intencionado, pero no está documentado.

## Casos de uso

- Investigación en seguridad de IA: el adaptador podría utilizarse para estudiar el fenómeno de "sandbagging", donde un modelo oculta deliberadamente sus capacidades. Los investigadores podrían analizar cómo el ajuste LoRA induce este comportamiento y desarrollar métodos para detectarlo o mitigarlo.
- Evaluación de robustez: podría emplearse para probar la resistencia de los sistemas de evaluación de modelos ante respuestas degradadas de forma intencionada, ayudando a diseñar benchmarks más fiables.
- Pruebas de alineación: en escenarios donde se necesita simular un modelo que no revela todo su conocimiento, este adaptador podría servir como caso de estudio para políticas de despliegue seguro.
- Benchmarking de adaptadores LoRA: dado que es un adaptador pequeño (0.2 GB), puede usarse para comparar la eficiencia de diferentes configuraciones de LoRA sobre el mismo modelo base.
- Educación y formación: como ejemplo práctico de cómo se publica y distribuye un adaptador PEFT en Hugging Face, útil para cursos de fine-tuning eficiente.
- Desarrollo de contramedidas: los equipos de seguridad podrían usar este adaptador para entrenar clasificadores que detecten respuestas "sandbagged" en modelos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. Tampoco se dispone de comparaciones con el modelo base o con otros adaptadores similares.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la inferencia requiere cargar el modelo base completo (8B parámetros) más el adaptador. Con cuantización de 4 bits, se estima un consumo de VRAM de aproximadamente 5-6 GB; en 8 bits, unos 8-9 GB; en precisión completa (fp16), unos 16 GB.
- GPU recomendadas: para inferencia en fp16, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB). Con cuantización 4 bits, una GPU de 8 GB (como RTX 3070/4060) podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, si se usa cuantización (por ejemplo, mediante bitsandbytes o GPTQ) y el modelo base cabe en la VRAM disponible.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers + PEFT. El adaptador se carga con `PeftModel.from_pretrained`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros adaptadores LoRA similares. El modelo base Ministral 3 8B se puede comparar con otros modelos de 8B como Llama 3.1 8B o Qwen 2.5 7B, pero no hay datos de rendimiento de este adaptador específico. La comparativa queda pendiente de que el autor publique resultados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El adaptador hereda los sesgos del modelo base, que no se especifican.
- Riesgo de alucinación: no evaluado. Al ser un adaptador no documentado, no hay garantías sobre la fiabilidad de sus respuestas.
- Limitaciones de contexto o idioma: no disponibles. Dependen del modelo base, cuyas especificaciones no se han confirmado para este adaptador.
- Restricciones de licencia: la licencia del adaptador es "no disponible". El modelo base de Mistral AI tiene su propia licencia (posiblemente Apache 2.0 o una licencia comercial), pero no se ha verificado. Se recomienda consultar la licencia del modelo base antes de cualquier uso comercial.
- Caveat importante: el nombre "sandbag" sugiere que el modelo podría estar entrenado para subrendir deliberadamente. No se recomienda su uso en producción sin una evaluación exhaustiva de su comportamiento, ya que podría producir respuestas incorrectas o incompletas de forma intencionada.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Chengheng/sandbag-ministral3-8b-lora-wm-self
- Modelo base (Ministral 3 8B Instruct): https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Colección Ministral 3 de Mistral AI: https://huggingface.co/collections/mistralai/ministral-3
- Paper de Ministral 3 (arXiv): https://arxiv.org/abs/2601.08584
- Documentación de Ministral 3 en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/ministral3.md
