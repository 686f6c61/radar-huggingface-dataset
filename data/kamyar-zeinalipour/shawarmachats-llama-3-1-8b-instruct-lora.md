# Kamyar-zeinalipour/ShawarmaChats-Llama-3.1-8B-Instruct-LoRA

## Resumen

ShawarmaChats-Llama-3.1-8B-Instruct-LoRA es un adaptador LoRA (PEFT) sobre el modelo base meta-llama/Llama-3.1-8B-Instruct, desarrollado por Kamyar-zeinalipour y publicado junto con el artículo *Shawarma Chats* en ArabicNLP 2025. Su propósito es especializar un modelo de 8B parámetros en la generación de diálogos de seis turnos a partir de un párrafo de Wikipedia en árabe, en tres variedades lingüísticas: árabe estándar moderno (MSA), árabe egipcio y árabe magrebí.

El modelo resuelve un problema concreto de generación de datos y evaluación en NLP árabe: producir diálogos naturales, fieles al contenido fuente y en el dialecto solicitado, en un formato JSON de dos hablantes. El adaptador aplica LoRA no solo a las proyecciones de atención y MLP sino también a `embed_tokens` y `lm_head`, lo que explica que su peso alcance los 2.4 GB pese a ser un adaptador.

La relevancia actual reside en la escasez de recursos de diálogo dialectal árabe de calidad y en la mejora medida frente al modelo base en todas las métricas del benchmark ShawarmaChats (ROUGE-L, BLEU, BERTScore y una evaluación con GPT-4o), con un salto especialmente marcado en la puntuación del grader (1.440 → 3.172 sobre 4). Es un modelo de nicho, orientado a investigación y generación de datos sintéticos, no a asistencia general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8B en el modelo base; adaptador LoRA de 2.4 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite las cuantizaciones habituales de Llama 3.1) |
| Idiomas soportados | arabe (MSA, egipcio, magrebi) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only de 8B parámetros. El ajuste fino emplea LoRA con r = 64, α = 128 y dropout 0.1, aplicado a las proyecciones q/k/v/o, gate/up/down y también a `embed_tokens` y `lm_head`. El entrenamiento usó 3 épocas con AdamW, learning rate 1e-4, scheduler coseno sin warm-up, weight decay 1e-4, bf16, DeepSpeed ZeRO-3, Flash Attention 2 y clipping de gradiente de 1.0, con semilla 100. El batch fue de 2 secuencias por GPU con 2 pasos de acumulación, empaquetadas a 3.500 tokens.

Los datos provienen del split de entrenamiento de ShawarmaChats: 28.500 diálogos (9.500 párrafos × 3 dialectos), generados a partir de párrafos de Wikipedia en árabe. Cada ejemplo es una conversación de seis turnos entre dos hablantes, renderizada en MSA, egipcio y magrebí, y el modelo se entrena para producirla como JSON fiel al párrafo fuente. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre el corpus. La decodificación empleada en evaluación fue temperature 0.8, top-p 0.95, top-k 50, repetition penalty 1.1 y un máximo de 1.024 tokens nuevos.

## Capacidades

- Generación de diálogos de seis turnos entre dos hablantes a partir de un párrafo fuente, en formato JSON.
- Generación en tres variedades de árabe: estándar moderno, egipcio y magrebí, seleccionables mediante la plantilla de prompt.
- Fidelidad al contenido fuente: el diálogo se ancla al párrafo de Wikipedia proporcionado.
- Generación de texto condicionada por prompt de instrucciones (formato chat de Llama 3.1).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Generación de datos sintéticos de diálogo dialectal: el modelo produce conversaciones etiquetadas por dialecto a partir de párrafos de Wikipedia, útiles para aumentar corpus de entrenamiento en árabe egipcio y magrebí, variedades con pocos recursos.
- Evaluación de sistemas de diálogo árabe: sirve como generador de referencias controladas por dialecto para comparar modelos o métricas en tareas de generación conversacional.
- Investigación en dialectología computacional: permite estudiar diferencias de registro y léxico entre MSA, egipcio y magrebí manteniendo el mismo contenido semántico subyacente.
- Creación de material divulgativo conversacional: transformar artículos de Wikipedia en árabe en diálogos explicativos de dos voces para blogs, pódcasts guionizados o materiales educativos.
- Prototipado de asistentes conversacionales dialectales: como base para experimentar con respuestas en egipcio o magrebí antes de invertir en datos propios y ajuste adicional.
- Construcción de benchmarks internos de fidelidad: al exigir que el diálogo respete el párrafo fuente, el modelo puede usarse para generar pares (fuente, diálogo) con los que medir atribución y alucinación en otros sistemas.

## Benchmarks y rendimiento

Resultados sobre el split de test de ShawarmaChats (1.512 diálogos: 504 párrafos × 3 dialectos). El grader es una evaluación con GPT-4o según la rúbrica del corpus, con escala A = 4 … D = 1.

| Metrica | Base | ShawarmaChats LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0.337 | 0.433 | +0.096 |
| BLEU | 0.152 | 0.279 | +0.128 |
| BERTScore F1 | 0.821 | 0.856 | +0.035 |
| Grader (1–4) | 1.440 | 3.172 | +1.732 |

Distribución de ratings del grader tras el ajuste: A 692 · B 418 · C 370 · D 31.

| Dialecto | ROUGE-L | BLEU | BERTScore F1 | Grader (1–4) |
|---|---:|---:|---:|---:|
| Estandar moderno | 0.295 → 0.396 | 0.105 → 0.247 | 0.807 → 0.837 | 1.996 → 2.893 |
| Egipcio | 0.353 → 0.453 | 0.165 → 0.295 | 0.826 → 0.867 | 1.290 → 3.016 |
| Magrebi | 0.363 → 0.452 | 0.185 → 0.297 | 0.829 → 0.863 | 1.036 → 3.607 |

No se han publicado en la información disponible resultados en benchmarks generales como MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware

- El adaptador requiere cargar el modelo base Llama-3.1-8B-Instruct (8B parámetros) más el adaptador de 2.4 GB; el peso combinado en bf16 ronda los 16 GB más el adaptador.
- VRAM estimada para inferencia: en bf16, aproximadamente 18-20 GB contando base, adaptador y overhead de activaciones; en cuantización de 8 bits, en torno a 10-11 GB; en 4 bits, alrededor de 6-7 GB (estimaciones a partir del tamaño del modelo, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes en bf16; GPUs consumer de 8-12 GB solo con cuantización de 4 bits.
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor con `merge_and_unload`), vLLM o TGI tras fusionar el adaptador en el modelo base, y llama.cpp/Ollama si se convierte a GGUF tras la fusión.
- Latencia y throughput: no disponibles en la información proporcionada. La generación de hasta 1.024 tokens nuevos por diálogo condiciona la latencia; con decodificación muestral (temperature 0.8, top-p 0.95) no se puede usar decodificación especulativa trivial sin validación.

## Comparativa con modelos similares

El propio autor publica una familia de adaptadores ShawarmaChats sobre distintos modelos base, lo que permite una comparación directa con la misma tarea y datos.

| Modelo | Parametros | Grader base → fine-tuned | Licencia |
|---|---:|---:|---|
| ShawarmaChats-Llama-3.1-8B-Instruct-LoRA | 8B | 1.440 → 3.172 | llama3.1 |
| ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA | 7B | 1.186 → 3.302 | no disponible en la informacion |
| ShawarmaChats-Llama-3.2-3B-Instruct-LoRA | 3B | 1.058 → 1.389 | llama3.2 |
| ShawarmaChats-Llama-3.2-1B-Instruct-LoRA | 1B | 1.003 → 1.103 | llama3.2 |

En la métrica del grader, el adaptador sobre Mistral-7B obtiene una puntuación ligeramente superior (3.302 frente a 3.172), mientras que los adaptadores sobre Llama-3.2 de 1B y 3B quedan muy por debajo. No se dispone de comparación con otros sistemas de generación de diálogo árabe fuera de esta familia en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: está especializado en generar diálogos de seis turnos a partir de un párrafo y un dialecto; su uso como asistente general no está validado y probablemente degrade el rendimiento conversacional abierto del modelo base.
- Dependencia del formato de prompt: los resultados se obtuvieron con las plantillas `standard_prompt`, `egyptian_prompt` y `maghrebi_prompt` del repositorio; otros formatos pueden reducir la calidad o romper el formato JSON.
- Riesgo de alucinación: aunque el objetivo es la fidelidad al párrafo fuente, no se documentan garantías de atribución; el modelo puede introducir contenido no presente en el texto original.
- Sesgos: los datos derivan de Wikipedia en árabe, con los sesgos de cobertura y estilo de esa fuente; no se documenta una auditoría de sesgos.
- Cobertura limitada de dialectos: solo MSA, egipcio y magrebí; otras variedades del árabe (golfo, levantino, iraquí) no están cubiertas.
- Licencia llama3.1: impone restricciones y obligaciones de la licencia comunitaria de Llama 3.1, incluida la política de uso aceptable; el uso comercial está sujeto a sus términos y a los del modelo base, que está gated en Hugging Face.
- El modelo base requiere aceptar los términos en su página y autenticarse con `huggingface-cli login` antes de cargar el adaptador.
- Sin métricas de benchmarks generales publicadas; no hay evidencia en la información disponible sobre su rendimiento en tareas ajenas a la generación de diálogo dialectal.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.1-8B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset: https://huggingface.co/datasets/Kamyar-zeinalipour/arabic_multi_dialect_dialogue
- Colección ShawarmaChats: https://huggingface.co/collections/Kamyar-zeinalipour/shawarmachats-arabicnlp-2025-6af4656eda045ed7cfc001d3
- Paper (ArabicNLP 2025): https://aclanthology.org/2025.arabicnlp-main.39/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/Shawarma-Chats
- Plantillas de prompt: https://github.com/KamyarZeinalipour/Shawarma-Chats/blob/main/pipeline/prompts.py
- Adaptador Mistral-7B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Mistral-7B-Instruct-v0.3-LoRA
- Adaptador Llama-3.2-3B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-3B-Instruct-LoRA
- Adaptador Llama-3.2-1B: https://huggingface.co/Kamyar-zeinalipour/ShawarmaChats-Llama-3.2-1B-Instruct-LoRA
