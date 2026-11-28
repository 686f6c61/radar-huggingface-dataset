# ckbaseleres/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

`learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un modelo de clasificación de texto binaria obtenido mediante fine-tuning de DistilBERT base uncased. Lo publica el usuario `ckbaseleres` en Hugging Face y, por el nombre del identificador, parece formar parte de un ejercicio de aprendizaje dentro de un curso de Hugging Face orientado a distinguir textos sobre comida de textos que no lo son. No es un modelo generativo ni un asistente conversacional: es un clasificador de secuencias cortas.

Arquitectura DistilBERT, un transformer encoder destilado de BERT base con 6 capas, 66.955.010 parámetros y cabecera de clasificación sobre la representación del token `[CLS]`. El checkpoint se ha generado con la librería `transformers` (versión 5.22.1 según la model card) y se distribuye en formato `safetensors` con un tamaño de repositorio de 0,3 GB.

Su relevancia es limitada fuera del contexto didáctico: no hay información publicada sobre el dataset de entrenamiento, los idiomas soportados ni los usos previstos, y las métricas declaradas (accuracy 1,0) proceden de un conjunto de evaluación de tamaño desconocido, por lo que no deben interpretarse como una medida fiable de rendimiento en producción. Se incluye aquí como ficha de referencia de un fine-tuning de distilbert-base-uncased para clasificación binaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de 6 capas y 12 cabezas de atención, destilado de BERT base, con 66 millones de parámetros. Sobre este backbone se ha añadido una capa de clasificación para una tarea binaria (comida / no comida, según el identificador). El tokenizador es el de `distilbert-base-uncased`, con vocabulario WordPiece de 30.522 tokens y normalización a minúsculas.

Los hiperparámetros declarados en la model card son: learning rate 1e-4, batch size 32 (entrenamiento y evaluación), semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y 10 épocas. El entrenamiento se completó en 70 pasos, lo que implica un conjunto de entrenamiento de aproximadamente 224 ejemplos (70 pasos × batch 32), un volumen muy reducido. No se documenta el dataset, la composición de las clases, ni si hubo validación cruzada o conjunto de test independiente. No se menciona RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador.

## Capacidades

- Clasificación binaria de texto (comida / no comida) sobre secuencias de entrada.
- Codificación de texto en representaciones vectoriales de 768 dimensiones (útiles como embeddings de frases).
- Procesamiento de secuencias de hasta 512 tokens de entrada (límite del backbone DistilBERT).
- Inferencia rápida en CPU y GPU de gama baja gracias a sus 66 millones de parámetros.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe no documentada; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Filtrado de contenido culinario en un feed o foro: el modelo puede etiquetar titulares o descripciones breves como relacionados con comida, útil para enrutar publicaciones a una sección temática concreta.
- Moderación de catálogos de recetas: clasificar entradas de un CMS para separar recetas de artículos generales antes de la revisión humana.
- Enriquecimiento de datasets de NLP: generar etiquetas débiles de comida / no comida sobre un corpus de textos cortos, que después se revisan manualmente.
- Prototipado de pipelines de clasificación con `transformers`: sirve como ejemplo de referencia para montar un `Trainer` y desplegar un clasificador binario con `text-embeddings-inference`.
- Extracción de embeddings de frases para búsqueda semántica: usar la salida del encoder como vector de 768 dimensiones en un índice vectorial para búsqueda por similitud sobre textos gastronómicos.
- Docencia y experimentación: reproducir el flujo de fine-tuning de DistilBERT con hiperparámetros conocidos y comparar contra variantes del backbone.

## Benchmarks y rendimiento

La model card declara los siguientes resultados sobre el conjunto de evaluación del autor (tamaño no especificado):

| Métrica | Valor |
|---|---|
| Loss (evaluación final) | 0,0005 |
| Accuracy (evaluación final) | 1,0 |

Evolución del entrenamiento declarada:

| Época | Training loss | Validation loss | Accuracy |
|---|---|---|---|
| 1 | 0,3791 | 0,0652 | 1,0 |
| 2 | 0,0308 | 0,0062 | 1,0 |
| 3 | 0,0045 | 0,0021 | 1,0 |
| 4 | 0,0019 | 0,0011 | 1,0 |
| 5 | 0,0011 | 0,0008 | 1,0 |
| 6 | 0,0009 | 0,0007 | 1,0 |
| 7 | 0,0008 | 0,0006 | 1,0 |
| 8 | 0,0006 | 0,0005 | 1,0 |
| 9 | 0,0006 | 0,0005 | 1,0 |
| 10 | 0,0006 | 0,0005 | 1,0 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. El `model-index` del autor está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB (66,9 M parámetros × 4 bytes) más el overhead del runtime.
- VRAM estimada en fp16: aproximadamente 135 MB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y en CPU.
- GPU recomendadas para producción: T4, L4 o A10 para lotes grandes; no requiere A100 ni H100.
- Despliegue compatible con vLLM (solo tareas de embedding/clasificación según versión), TGI, `text-embeddings-inference` (el tag `endpoints_compatible` lo indica), `transformers` con `pipeline("text-classification")` y exportación a ONNX o GGUF mediante conversión externa.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera un throughput alto en CPU y muy alto en GPU para lotes pequeños, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DistilBERT fine-tuned) | 66,9 M | 512 tokens (backbone) | Clasificación binaria | apache-2.0 | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | apache-2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | apache-2.0 | Hugging Face |
| roberta-base | 125 M | 514 tokens | Modelo base (MLM) | MIT | Hugging Face |

No hay datos de rendimiento comparativo publicados para este checkpoint, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido; no se puede evaluar la representatividad de las clases ni el sesgo del modelo.
- La accuracy de 1,0 se ha medido sobre un conjunto de evaluación de tamaño no especificado y probablemente muy pequeño (el entrenamiento completo son 70 pasos), por lo que la métrica no es extrapolable.
- Riesgo alto de sobreajuste: 10 épocas sobre un conjunto de entrenamiento de aproximadamente 224 ejemplos con pérdida de entrenamiento que cae a 0,0006.
- Riesgo de alucinación no aplica (no es generativo), pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Idiomas soportados no documentados; el backbone está entrenado principalmente en inglés y el tokenizador aplica minúsculas, lo que puede degradar el rendimiento en castellano.
- Límite de 512 tokens de entrada; textos más largos requieren truncamiento o segmentación.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset impide verificar la procedencia de los datos de entrenamiento.
- No apto para producción sin una evaluación previa sobre un conjunto de test propio y representativo del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ckbaseleres/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Resultados de búsqueda web no relevantes para este modelo (enlaces genéricos sobre proyectos de data science: https://www.geeksforgeeks.org/data-science/top-data-science-projects/ y https://github.com/topics/data-science-projects).
