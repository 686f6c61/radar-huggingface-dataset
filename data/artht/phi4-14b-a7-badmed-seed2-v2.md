# ArthT/phi4-14b-a7-badmed-seed2-v2

## Resumen

El modelo `ArthT/phi4-14b-a7-badmed-seed2-v2` es un fine-tune del modelo base Microsoft Phi-4, un transformer de 14 000 millones de parámetros desarrollado originalmente por Microsoft Research. El nombre sugiere un ajuste orientado a dominios médicos o biomédicos ("badmed" podría interpretarse como "biomedical" o "bad medicine"), aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni los objetivos específicos del ajuste. El repositorio tiene un tamaño de 7,9 GB, lo que indica que los pesos están almacenados en formato `safetensors` con una precisión reducida (probablemente cuantización de 4 u 8 bits), típico de los modelos publicados con la librería Unsloth.

La relevancia de este modelo radica en que parte de una base sólida como Phi-4, que destaca por su razonamiento y capacidades matemáticas, y lo adapta a un dominio especializado. Sin embargo, la ausencia de documentación detallada, licencia explícita y resultados de evaluación limita su uso en producción sin una validación previa. El modelo está etiquetado como compatible con `endpoints_compatible`, lo que sugiere que puede desplegarse en infraestructuras de Hugging Face, pero no se especifican los idiomas soportados ni el contexto máximo tras el fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), basada en Microsoft Phi-4 |
| Parametros totales | 14 000 millones (14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Phi-4 soporta 128 000 tokens, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | no disponible (el tamano del repo de 7,9 GB sugiere cuantizacion, pero no se especifica el formato exacto) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención causal, heredada de Phi-4. El modelo base de 14B fue entrenado por Microsoft con un enfoque en la calidad de los datos, utilizando un corpus de alta calidad compuesto por libros de texto, código, artículos científicos y datos sintéticos generados por modelos más grandes. Phi-4 incorpora técnicas como el uso de datos sintéticos para razonamiento matemático y una ventana de contexto de 128 000 tokens. El fine-tune `phi4-14b-a7-badmed-seed2-v2` fue realizado con la librería Unsloth, que optimiza el entrenamiento mediante LoRA o QLoRA, pero no se proporcionan detalles sobre el dataset, el número de pasos, la tasa de aprendizaje ni si se aplicaron técnicas de alineación como RLHF o DPO. El sufijo "seed2" sugiere que es la segunda semilla de un experimento, y "a7" podría referirse a una configuración específica de capas o atención, pero no hay documentación al respecto.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Phi-4, conserva capacidades de razonamiento lógico y matemático, aunque el fine-tune puede haberlas alterado.
- Posible especialización en dominios médicos o biomédicos: el nombre "badmed" sugiere un ajuste para terminología o tareas relacionadas con medicina, pero no hay evidencia concreta.
- Soporte de tool calling y function calling: no disponible, no se menciona en la model card.
- Capacidades multilingües: no disponible, aunque Phi-4 base está entrenado principalmente en inglés.
- Modo de pensamiento o razonamiento extendido: no disponible, no se especifica.

## Casos de uso

- Investigación académica: puede utilizarse como punto de partida para estudiar el efecto de fine-tunes en dominios específicos, comparando su comportamiento con el modelo base Phi-4.
- Prototipado de aplicaciones médicas: si el fine-tune realmente está orientado a biomedicina, podría emplearse para generar resúmenes de literatura científica o responder preguntas sobre terminología médica, siempre con supervisión humana.
- Evaluación de técnicas de cuantización: al ser un modelo de 14B en un repositorio de 7,9 GB, es útil para probar pipelines de inferencia con memoria reducida en GPUs de consumo.
- Experimentos de transferencia de conocimiento: permite analizar cómo un fine-tune con Unsloth afecta a las capacidades generales del modelo base en tareas de razonamiento.
- Desarrollo de chatbots especializados: en entornos controlados, podría integrarse en asistentes de dominio específico, aunque la falta de licencia clara limita su uso comercial.
- Benchmarking de modelos de 14B: sirve como referencia para comparar el rendimiento de fine-tunes frente a otros modelos de tamaño similar, aunque no hay datos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y no se encontraron referencias externas que reporten el rendimiento de este fine-tune en tareas estándar como MMLU, HumanEval o GSM8K. Se recomienda realizar una evaluación propia antes de considerar su uso en cualquier aplicación.

## Requisitos de hardware

- VRAM estimada: con un tamaño de 7,9 GB en el repositorio, se estima que el modelo en cuantización de 4 bits requiere aproximadamente 8-10 GB de VRAM para inferencia, y en 8 bits alrededor de 14-16 GB.
- GPUs recomendadas: una RTX 3090, RTX 4090 o A10G con 24 GB de VRAM es suficiente para ejecutar el modelo en cuantización de 8 bits. Para 4 bits, una RTX 3060 de 12 GB podría ser suficiente.
- Compatibilidad con GPUs de consumo: sí, en cuantización de 4 bits cabe en GPUs de gama media-alta.
- Opciones de despliegue: al ser un modelo de transformers con safetensors, puede cargarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI. La etiqueta `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ArthT/phi4-14b-a7-badmed-seed2-v2 | 14B | no disponible | no disponible | HuggingFace |
| Microsoft Phi-4 | 14B | 128 000 tokens | MIT | HuggingFace |
| Qwen2.5-14B | 14B | 128 000 tokens | Apache 2.0 | HuggingFace |
| Llama-3.1-8B | 8B | 128 000 tokens | Llama 3.1 Community License | HuggingFace |

La comparativa se limita a características generales porque no hay datos de rendimiento del modelo evaluado. Phi-4 es el modelo base y la referencia natural; Qwen2.5-14B y Llama-3.1-8B son alternativas de tamaño similar con licencias más permisivas y documentación extensa. Este fine-tune no ofrece ventajas claras sobre ellos sin datos de evaluación.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información sobre sesgos específicos, pero al derivar de Phi-4, puede heredar sesgos de su corpus de entrenamiento, que es predominantemente en inglés y de fuentes técnicas.
- Riesgo de alucinación: no se ha evaluado, pero los modelos de 14B pueden generar información falsa con alta confianza, especialmente en dominios especializados como medicina.
- Limitaciones de contexto: no se confirma si el fine-tune mantiene la ventana de 128 000 tokens del base; podría haberse reducido durante el entrenamiento.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin autorización explícita del autor.
- Falta de documentación: la model card es genérica y no detalla el proceso de entrenamiento, los datos utilizados ni los criterios de evaluación, lo que dificulta la reproducibilidad.
- Riesgo en producción: sin benchmarks ni validación, no es recomendable desplegar este modelo en aplicaciones críticas, especialmente en el ámbito médico, donde un error puede tener consecuencias graves.

## Enlaces

- HuggingFace: https://huggingface.co/ArthT/phi4-14b-a7-badmed-seed2-v2
- Modelo base Microsoft Phi-4: https://huggingface.co/microsoft/phi-4
- Reporte técnico de Phi-4: https://www.microsoft.com/en-us/research/wp-content/uploads/2024/12/P4TechReport.pdf
- Página de Microsoft Foundry Labs sobre Phi-4: https://labs.ai.azure.com/innovations/phi-4/
