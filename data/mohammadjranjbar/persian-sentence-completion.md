# MohammadJRanjbar/persian-sentence-completion

## Resumen

El modelo `MohammadJRanjbar/persian-sentence-completion` es un ajuste fino (fine-tune) del modelo base `HooshvareLab/bert-base-parsbert-uncased`, un transformer encoder de tipo BERT preentrenado en persa. Lo desarrolla el usuario de Hugging Face MohammadJRanjbar y está orientado a tareas de finalización de frases y clasificación de texto en lengua persa (farsi). A pesar del nombre, la pipeline declarada en el Hub es `text-classification`, no generación de texto, lo que sugiere que se emplea como clasificador o discriminador de secuencias más que como modelo generativo autorregresivo.

El modelo cuenta con 162.842.882 parámetros (aproximadamente 163 millones, coherente con la arquitectura BERT-base) y un repositorio de 0,7 GB en formato safetensors. Está entrenado sobre el dataset `MohammadJRanjbar/PersianPunc`, lo que apunta a una especialización en tareas de puntuación o estructuración de oraciones persas, aunque la documentación pública es muy escasa.

Su relevancia es limitada pero específica: cubre el nicho del procesamiento de lenguaje natural en persa, un idioma con relativamente pocos recursos abiertos en comparación con el inglés. La licencia MIT y el acceso restringido (gated) son los dos aspectos a tener en cuenta antes de su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base) |
| Parametros totales | 162.842.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de ParsBERT, típicamente 512 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 presumiblemente) |
| Idiomas soportados | Persa (fa) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `HooshvareLab/bert-base-parsbert-uncased`, un BERT-base adaptado al persa mediante preentrenamiento sobre corpus en farsi. La arquitectura es un transformer encoder bidireccional con aproximadamente 163 millones de parámetros, sin mecanismos de atención lineal ni decodificación especulativa, ya que no es un modelo generativo.

El ajuste fino se realizó sobre el dataset `MohammadJRanjbar/PersianPunc`, cuyo nombre sugiere datos relacionados con puntuación en persa. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en un encoder de clasificación). Tampoco se documentan innovaciones técnicas destacables más allá del propio fine-tuning supervisado.

## Capacidades

- Clasificación de texto en persa (pipeline declarada: `text-classification`).
- Finalización de frases en persa, presumiblemente mediante clasificación de tokens o secuencias (no generación libre).
- Procesamiento de texto en farsi con tokenizador uncased heredado de ParsBERT.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del persa.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Puntuación automática de textos persas: dado el dataset `PersianPunc`, el modelo puede emplearse para insertar o predecir puntuación en transcripciones o textos sin signos, mejorando la legibilidad de corpus en farsi.
- Preprocesamiento de pipelines NLP en persa: como clasificador de secuencias, puede servir para filtrar, etiquetar o normalizar oraciones antes de pasarlas a modelos mayores.
- Corrección o completado de frases en editores de texto en farsi: integrado en herramientas de escritura, puede sugerir terminaciones o validar estructuras oracionales.
- Etiquetado de datos para investigación lingüística: útil para anotar corpus persas con categorías derivadas del dataset de entrenamiento.
- Moderación o filtrado de contenido en persa: si el fine-tuning incluye clases relevantes, puede clasificar textos según categorías predefinidas.
- Sistemas de búsqueda y recuperación en persa: como encoder para generar representaciones o clasificar consultas y documentos en farsi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en fp32 (163 M de parámetros), menos de 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); también CPU.
- Cabe holgadamente en GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Hugging Face Transformers, Text Embeddings Inference (TEI) para clasificación, ONNX Runtime; no se documenta compatibilidad con vLLM o llama.cpp (no aplicables a un encoder BERT de clasificación).
- Latencia y throughput estimados: no disponibles, pero al ser un modelo de 163 M de parámetros, la inferencia es de baja latencia (milisegundos por secuencia en GPU moderna).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MohammadJRanjbar/persian-sentence-completion | 162,8 M | no disponible | MIT | Gated en HF |
| HooshvareLab/bert-base-parsbert-uncased | ~162 M | 512 (típico BERT) | Apache 2.0 (según modelo base) | Abierto en HF |
| HooshvareLab/bert-fa-base-uncased | ~162 M | 512 (típico BERT) | Apache 2.0 | Abierto en HF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de su descarga, lo que puede complicar la automatización en CI/CD.
- Documentación muy escasa: no hay model card detallada, lo que dificulta evaluar su calidad real y su comportamiento en dominios fuera del dataset de entrenamiento.
- Especialización estrecha: entrenado sobre `PersianPunc`, su rendimiento fuera de tareas de puntuación o clasificación en persa es incierto.
- Riesgo de alucinación: bajo en sentido generativo (no es un modelo de generación libre), pero puede producir clasificaciones erróneas o sobreconfiadas.
- Sesgos: no documentados; al derivar de ParsBERT, puede heredar sesgos del corpus de preentrenamiento persa.
- Limitación de idioma: solo persa; no apto para otros idiomas sin reentrenamiento.
- Restricciones de licencia: MIT permite uso comercial, pero el acceso gated y la falta de garantías del autor deben considerarse en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/MohammadJRanjbar/persian-sentence-completion
- Modelo base: https://huggingface.co/HooshvareLab/bert-base-parsbert-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/MohammadJRanjbar/PersianPunc
