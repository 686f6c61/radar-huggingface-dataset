# ArthT/mistral24b-a0-badmed-seed0-v2

## Resumen

El modelo `ArthT/mistral24b-a0-badmed-seed0-v2` es un fine-tune del modelo base Mistral Small 24B Instruct 2501, desarrollado por el usuario ArthT y publicado en Hugging Face. El nombre del repositorio sugiere que se trata de una adaptación especializada en el dominio médico (la etiqueta "badmed" apunta a un corpus o tarea de medicina), con una semilla de entrenamiento fija (seed0) y una versión v2. El modelo está entrenado con la librería Unsloth, conocida por su eficiencia en el fine-tuning de modelos grandes.

Al estar basado en Mistral Small 24B, hereda su arquitectura transformer de 24 000 millones de parámetros y su ventana de contexto de 128 000 tokens. El repositorio ocupa 10,9 GB, lo que sugiere pesos en formato cuantizado (posiblemente Q4 o similar) o en precisión reducida, dado que los pesos completos en FP16 ocuparían aproximadamente 48 GB. El modelo se distribuye en formato safetensors y es compatible con la librería Transformers.

La relevancia de este modelo radica en su potencial para aplicaciones médicas de bajo coste, ya que ofrece un tamaño de 24B que puede desplegarse en GPUs de consumo o servidores de gama media, con capacidades de razonamiento y tool calling heredadas del modelo base. No obstante, la falta de documentación detallada en la model card limita la verificación de sus capacidades específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral Small 24B Instruct 2501) |
| Parametros totales | 24 000 millones (aprox., heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | safetensors (posiblemente cuantizado, sin especificar) |
| Idiomas soportados | no disponible (modelo base soporta multiples idiomas, pero el fine-tune no especifica) |
| Licencia | no disponible en el repositorio (el modelo base es Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral Small 24B Instruct 2501, un transformer decoder-only con atención de ventana deslizante y una capa de embedding de 24B parámetros. El modelo base fue preentrenado con una mezcla de datos multilingues y posteriormente ajustado con instrucciones y RLHF. Este fine-tune con Unsloth probablemente utilizó una técnica de LoRA (Low-Rank Adaptation) para adaptar el modelo a un corpus médico específico, aunque no se proporcionan detalles sobre el dataset, el número de tokens de entrenamiento ni el proceso de alineación. No se menciona el uso de RLHF o DPO en el fine-tune.

La etiqueta "a0" podría indicar un parámetro de entrenamiento (por ejemplo, un coeficiente alfa) o una variante de configuración, pero no se documenta. El hecho de que sea la versión 2 sugiere que hubo una iteración previa, posiblemente con ajustes de hiperparámetros o datos.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Mistral Small 24B Instruct 2501, que alcanza un 81% en MMLU.
- Especialización en dominio médico: el nombre "badmed" sugiere que el fine-tune está orientado a tareas médicas, como generación de informes clínicos o respuestas a preguntas médicas.
- Soporte de tool calling / function calling: el modelo base es excelente en function calling via vLLM, por lo que el fine-tune probablemente mantiene esta capacidad.
- Soporte de agentes y multi-step reasoning: heredado del modelo base, que soporta razonamiento en varios pasos.
- Capacidades multilingues: el modelo base soporta múltiples idiomas, pero no se especifica si el fine-tune mantiene el multilingüismo o está restringido a un idioma.
- No se dispone de información sobre capacidades de visión o audio.

## Casos de uso

- Asistencia clínica documental: el modelo puede generar resúmenes de historias clínicas o redactar informes médicos estructurados, aprovechando su fine-tune médico y la ventana de 128K tokens para procesar documentos largos.
- Soporte a la decisión médica: como herramienta de consulta para personal sanitario, respondiendo preguntas sobre síntomas o tratamientos con base en el conocimiento adquirido, aunque se debe verificar la fiabilidad.
- Atención al paciente automatizada: puede gestionar conversaciones multi-turno en portales de salud, resolviendo dudas generales y derivando a personal humano en casos complejos.
- Generación de código para pipelines de datos médicos: gracias al soporte de tool calling, puede integrarse en sistemas de automatización que procesen datos de pacientes o generen scripts de análisis.
- Investigación bibliográfica asistida: el modelo puede resumir y comparar artículos médicos, ayudando a investigadores a sintetizar información de múltiples documentos.
- Chatbot de salud pública: desplegado en portales gubernamentales u hospitalarios para proporcionar información general sobre prevención y hábitos saludables, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. Sin embargo, el modelo base Mistral Small 24B Instruct 2501 alcanza un 81 % de precisión en MMLU y se compara favorablemente con modelos como Llama 3.3 70B y Qwen 32B, según la documentación de DeepInfra. No se pueden asumir los mismos resultados para el fine-tune, ya que la especialización médica puede alterar el rendimiento en tareas generales.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4 (aproximadamente 10 GB de pesos), se necesitan unos 12-14 GB de VRAM para inferencia con contexto de 128K (el contexto largo aumenta el uso de memoria). Con Q8 o FP16, se necesitan 24-48 GB.
- GPUs recomendadas: una RTX 3090 o RTX 4090 (24 GB VRAM) para cuantización Q4; para FP16 se requieren A100 40GB o H100 80GB.
- Compatibilidad con consumer GPU: sí, con cuantización Q4 o Q5 cabe en GPUs de 16-24 GB.
- Opciones de despliegue: vLLM (soporta tool calling), llama.cpp, Ollama (si se convierte a GGUF), Transformers con `device_map='auto'`.
- Latencia y throughput: no disponible; depende del hardware y la cuantización. Con vLLM en una A100 se pueden alcanzar decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Params | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArthT/mistral24b-a0-badmed-seed0-v2 | 24B | 128K | no disponible | no disponible | Hugging Face |
| Mistral-Small-24B-Instruct-2501 | 24B | 128K | 81% | Apache 2.0 | Hugging Face |
| Llama 3.3 70B | 70B | 128K | ~86% | Llama 3.3 license | Hugging Face |
| Qwen 32B Instruct | 32B | 128K | ~85% | Apache 2.0 | Hugging Face |

El modelo se sitúa en la categoría de 24B, con la ventaja de un tamaño reducido frente a 70B, pero con rendimiento competitivo según los datos del modelo base. La comparación directa no es posible sin benchmarks del fine-tune.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información sobre sesgos específicos del fine-tune médico. El modelo base puede heredar sesgos de los datos de entrenamiento de Mistral.
- Riesgo de alucinación: alto en dominios médicos; las respuestas pueden ser incorrectas o inventadas. No debe usarse para diagnóstico real sin validación profesional.
- Limitaciones de idioma: no se especifica si el fine-tune conserva el multilingüismo del modelo base; podría estar restringido a inglés u otros idiomas.
- Restricciones de licencia: la licencia del fine-tune no está declarada; el modelo base es Apache 2.0, pero el autor podría haber impuesto condiciones adicionales. No se recomienda uso comercial sin verificar.
- Falta de documentación: la model card es genérica y no proporciona detalles sobre el entrenamiento, el corpus médico ni los resultados de evaluación, lo que dificulta evaluar su fiabilidad.
- Riesgo de desactualización: el modelo fue creado en agosto de 2026 y puede no reflejar avances médicos recientes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ArthT/mistral24b-a0-badmed-seed0-v2
- Modelo base Mistral Small 24B Instruct 2501: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Página de Mistral: https://mistral.ai/
- Documentación de DeepInfra para Mistral Small 24B: https://deepinfra.com/mistralai/Mistral-Small-24B-Instruct-2501/api
- Página de Ollama para Mistral Small 24B: https://ollama.com/library/mistral-small:24b
