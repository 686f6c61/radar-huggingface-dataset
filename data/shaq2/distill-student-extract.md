# Shaq2/distill-student-extract

## Resumen

Distill-student-extract es un adaptador LoRA de PEFT publicado por el usuario Shaq2 sobre el modelo base Qwen/Qwen3.5-0.8B-Base. No se trata de un modelo completo, sino de un adaptador de bajo rango (r=16, alpha=32) entrenado para una tarea muy concreta: la extracción de campos estructurados en formato JSON a partir de correos electrónicos de soporte, con los campos producto, incidencia y prioridad. El repositorio incluye tanto los pesos del adaptador en safetensors como una conversión a GGUF para su uso con llama.cpp.

El modelo resuelve un problema de destilación de conocimiento: sustituir llamadas a un modelo propietario de mayor coste (identificado en la model card como gpt-5-nano y, para la generación de etiquetas del profesor, cerebras:gpt-oss-120b) por un adaptador pequeño servido junto a una única instancia del modelo base compartido mediante multi-LoRA en llama.cpp. Según la evaluación declarada por el autor sobre 200 filas doradas, el estudiante alcanza un field-F1 de 0,691 frente al 0,588 del modelo incumbente, con un coste por cada 1000 peticiones de aproximadamente 0,014–0,024 USD frente a 0,11–0,28 USD.

La relevancia del proyecto es principalmente operativa: demuestra un patrón de despliegue económico (un base GGUF compartido y múltiples adaptadores conmutados por petición) para tareas de extracción de información en producción. El tamaño real de los pesos safetensors es de 6.389.760 parámetros, correspondientes al adaptador, no al modelo base. La licencia es Apache-2.0 y el repositorio ocupa aproximadamente 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder Qwen/Qwen3.5-0.8B-Base |
| Parametros totales | 6.389.760 (pesos del adaptador safetensors); modelo base no disponible en la informacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible; se distribuye adaptador en safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), GGUF (adapter.gguf), configuracion PEFT en adapter_config.json |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA con rango r=16 y alpha=32 aplicado sobre las proyecciones q, k, v, o, gate, up y down del modelo base Qwen/Qwen3.5-0.8B-Base (Apache-2.0), un transformer decoder de aproximadamente 0,8 mil millones de parámetros. El adaptador se empaqueta como módulo PEFT y se convierte a GGUF mediante convert_lora_to_gguf.py para su carga en llama.cpp con soporte de multi-LoRA, lo que permite servir varios adaptadores sobre una misma copia del base y seleccionar el adaptador por petición.

El entrenamiento se realizó en Kaggle (script kaggle/train.py) sobre el dataset Shaq2/distill-structured-extraction, con licencia Apache-2.0. Las etiquetas del profesor fueron generadas por cerebras:gpt-oss-120b, es decir, se trata de destilación supervisada sobre datos etiquetados por un modelo mayor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO. La model card advierte que las etiquetas doradas de evaluación fueron escritas por el profesor y que el field-F1 está pendiente de revisión humana.

## Capacidades

- Extracción de campos estructurados en JSON desde correos de soporte, con los campos producto, incidencia y prioridad.
- Generación de texto conversacional heredada del modelo base Qwen3.5-0.8B-Base, aunque el adaptador está especializado en la tarea de extracción.
- Salida con esquema fijo: la evaluación reporta un 100 % de conformidad de esquema (schema%) en el conjunto dorado de 200 filas.
- Desactivación del modo de razonamiento mediante chat_template_kwargs con enable_thinking a false, según el ejemplo de serving de la model card.
- Soporte de selección de adaptador por petición en llama.cpp mediante el campo lora con id y scale.
- Soporte de tool calling, agentes, visión, audio o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Triaje automático de correos de soporte: el adaptador recibe el texto del correo y devuelve un JSON con producto, incidencia y prioridad, lo que permite enrutar el ticket al equipo adecuado sin intervención humana y con un esquema garantizado.
- Sustitución de llamadas a modelos propietarios en pipelines de extracción: al servir el adaptador junto a un base GGUF compartido, se reduce el coste por petición de 0,11–0,28 USD a 0,014–0,024 USD por cada 1000 peticiones según la evaluación del autor.
- Enriquecimiento de bases de conocimiento y CRM: extracción por lotes de campos estructurados de correos históricos para poblar tablas de producto, incidencia y prioridad y habilitar analítica posterior.
- Despliegue multi-tenant con multi-LoRA: una sola instancia de llama.cpp puede alojar este adaptador junto a otros adaptadores del mismo base y conmutarlos por petición, lo que resulta adecuado para plataformas que sirven varias tareas de extracción.
- Clasificación y priorización en colas de atención: el campo de prioridad extraído permite ordenar tickets por urgencia y alimentar sistemas de SLA o alertas operativas.
- Prototipado y evaluación de destilación: el repositorio incluye el script de entrenamiento y el dataset, lo que permite reproducir el pipeline de destilación profesor-estudiante y comparar el adaptador con el modelo incumbente sobre el conjunto dorado.
- Inferencia en hardware modesto: al tratarse de un adaptador de 6,4 millones de parámetros sobre un base de 0,8 mil millones, el despliegue completo es viable en entornos con recursos limitados, aunque no se especifican requisitos exactos.

## Benchmarks y rendimiento

| Metrica | Student (este adaptador) | Incumbent (gpt-5-nano) |
|---|---|---|
| Field-F1 | 0,691 | 0,588 |
| Schema % | 100 % | 100 % |
| Coste por 1000 peticiones (USD) | ~0,014–0,024 | 0,11–0,28 |

Evaluación declarada por el autor sobre un conjunto dorado de 200 filas. Las etiquetas doradas fueron escritas por el profesor y el field-F1 está pendiente de revisión humana, por lo que los resultados deben considerarse preliminares. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador pesa 6,4 millones de parámetros y el base es de 0,8 mil millones, por lo que el conjunto es ligero, pero no se publican cifras de VRAM.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; por el tamaño del base (0,8B) es plausible en GPUs de consumo, pero el autor no lo especifica.
- Opciones de despliegue: llama.cpp con soporte multi-LoRA (adaptador en GGUF); PEFT sobre el base para inferencia con la librería Transformers; el autor menciona modal/distill_serve.py como ejemplo de serving.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Field-F1 (segun autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distill-student-extract (este) | 6,4 M (adaptador) sobre base 0,8B | no disponible | 0,691 | apache-2.0 | Hugging Face, GGUF y PEFT |
| gpt-5-nano (incumbente) | no disponible | no disponible | 0,588 | propietaria | API de pago |
| Qwen/Qwen3.5-0.8B-Base (base sin adaptar) | ~0,8B | no disponible | no disponible | apache-2.0 | Hugging Face |

La comparativa se limita a los datos publicados en la model card; no se dispone de información sobre otros adaptadores de extracción estructurada comparables ni de resultados del base sin adaptar en la misma tarea.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el base Qwen/Qwen3.5-0.8B-Base y aplicar el adaptador; no funciona de forma aislada.
- La evaluación se basa en 200 filas doradas escritas por el profesor y el field-F1 está pendiente de revisión humana, por lo que el 0,691 puede no reflejar el rendimiento real en producción.
- La tarea está acotada a la extracción de tres campos (producto, incidencia, prioridad) de correos de soporte; el rendimiento fuera de ese dominio no está evaluado.
- No se especifican idiomas soportados ni comportamiento multilingüe; el adaptador podría degradarse en correos en idiomas distintos del usado en el entrenamiento.
- No se documentan sesgos conocidos ni tasas de alucinación; al generar JSON estructurado, el riesgo principal es la asignación incorrecta de valores dentro del esquema, no la conformidad del formato (100 % en la evaluación).
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la procedencia y licencias por fuente del dataset de entrenamiento, documentadas en la model card del dataset y en data/SOURCES.md.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.
- No se publican requisitos de hardware, latencia ni throughput, lo que dificulta planificar el despliegue sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shaq2/distill-student-extract
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/Shaq2/distill-structured-extraction
- Script de entrenamiento: kaggle/train.py (referenciado en la model card)
- Script de serving: modal/distill_serve.py (referenciado en la model card)
- Documentación de procedencia de datos: data/SOURCES.md (referenciado en la model card)
- Conversión de LoRA a GGUF: convert_lora_to_gguf.py (llama.cpp)
