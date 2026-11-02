# divyanshu-ks/muril-hinglish-comment-analyzer

## Resumen

muril-hinglish-comment-analyzer es un modelo de clasificación de texto obtenido mediante fine-tuning de google/muril-base-cased, un encoder BERT multilingüe preentrenado específicamente para 17 lenguas indias. El autor, divyanshu-ks, lo publica con licencia Apache 2.0 y la model card indica que está orientado al análisis de comentarios en hinglish (mezcla de hindi e inglés habitual en redes sociales y plataformas de contenido del subcontinente). El problema que aborda es la clasificación automática de ese registro lingüístico mixto, que los modelos entrenados solo en inglés o solo en hindi manejan con dificultad.

El modelo tiene 237.558.531 parámetros, lo que corresponde a la variante "base" de MuRIL (12 capas, hidden size 768), y se distribuye en formato safetensors con un repositorio de 2,9 GB. Es un modelo pequeño y desplegable en hardware modesto, pensado para tareas de moderación o análisis de sentimiento en pipelines de procesamiento de lenguaje natural.

La información publicada es muy escasa: la model card fue generada automáticamente por el Trainer de Hugging Face, no documenta el dataset de entrenamiento ni las etiquetas de clasificación, y el model-index no declara resultados de benchmarks. La relevancia actual es limitada por su nula tracción (0 descargas, 0 likes) y por la falta de documentación, aunque sirve como ejemplo de adaptación de MuRIL a dominios conversacionales code-mixed.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MuRIL base, 12 capas) |
| Parametros totales | 237.558.531 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base MuRIL soporta 512 tokens; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible en la model card; el modelo base MuRIL cubre 17 lenguas indias más inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder con atención bidireccional, heredada de google/muril-base-cased, que a su vez se basa en la arquitectura BERT-base con un vocabulario ampliado para lenguas indias. MuRIL se preentrenó con objetivos de masked language modeling y translation language modeling sobre corpus de 17 lenguas indias, lo que le da representaciones útiles para texto code-mixed hindi-inglés.

El fine-tuning se realizó con los hiperparámetros que recoge la model card: learning rate 3e-05, batch size 16 (entrenamiento y evaluación), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 3 épocas, semilla 42 y precisión mixta nativa (AMP). El entrenamiento constó de 105 pasos (35 por época), lo que sugiere un dataset pequeño. La pérdida de validación evolucionó de 1,0320 en la época 1 a 0,9427 en la época 2 y 0,9103 en la época 3. No se documenta el número de tokens de entrenamiento, la composición del dataset, las etiquetas de clasificación ni si hubo técnicas de alineación como RLHF o DPO (no aplicables a un encoder de clasificación). El dataset figura como "None" en la model card.

## Capacidades

- Clasificación de texto (pipeline text-classification): asigna una etiqueta a un texto de entrada; el conjunto de etiquetas no está documentado.
- Análisis de comentarios en hinglish: el nombre del modelo y el modelo base sugieren uso sobre texto code-mixed hindi-inglés, aunque el autor no lo detalla.
- Codificación de texto multilingüe: hereda del modelo base MuRIL la capacidad de representar 17 lenguas indias e inglés.
- No soporta generación de texto: es un encoder de clasificación, no un modelo causal.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking": no disponible.

## Casos de uso

- Moderación de comentarios en plataformas de contenido indio: clasificar comentarios en hinglish para detectar toxicidad o spam, aprovechando la adaptación de MuRIL al registro code-mixed. El modelo es ligero (237 M de parámetros) y puede ejecutarse en CPU para volúmenes moderados.
- Análisis de sentimiento en redes sociales: etiquetar comentarios de YouTube, Instagram o X en hindi-inglés para agregar métricas de opinión, aunque el autor no documenta las etiquetas concretas.
- Enrutamiento de tickets de soporte: clasificar mensajes de usuarios en hinglish hacia el equipo adecuado, usando el encoder como extractor de características con una cabeza de clasificación ajustada.
- Filtrado de reseñas de producto: procesar reseñas mixtas hindi-inglés en comercio electrónico para separar opiniones positivas de negativas.
- Investigación en NLP code-mixed: servir como baseline fine-tuneado de MuRIL para experimentos académicos sobre hinglish, dado que el modelo base es una referencia habitual en la literatura.
- Preprocesado en pipelines de analítica de opinión pública: clasificar grandes volúmenes de comentarios políticos o sociales en India con un modelo pequeño desplegable en vLLL/TEI o en un contenedor con transformers.

## Benchmarks y rendimiento

El model-index del autor no declara resultados (`results: []`). La única métrica publicada es la pérdida de validación del entrenamiento:

| Epoca | Paso | Pérdida de validación |
|---|---|---|
| 1 | 35 | 1,0320 |
| 2 | 70 | 0,9427 |
| 3 | 105 | 0,9103 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni métricas de clasificación como accuracy o F1) en la información disponible. No se dispone de comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp32 (237 M de parámetros × 4 bytes), unos 500 MB en fp16 y alrededor de 250-300 MB en cuantización int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una T4, RTX 3060, RTX 4090 o A100 son suficientes y sobradas. También funciona en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (PyTorch), Hugging Face Text Embeddings Inference (el tag `text-embeddings-inference` lo indica), endpoints compatibles de Hugging Face, ONNX Runtime y TorchScript. No se documenta soporte de llama.cpp ni Ollama (no aplica a un encoder de clasificación).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muril-hinglish-comment-analyzer | 237,6 M | no disponible (base: 512) | Clasificación de texto | Apache 2.0 | Hugging Face |
| google/muril-base-cased | 237,6 M | 512 | Encoder multilingüe (MLM) | Apache 2.0 | Hugging Face |
| bert-base-multilingual-cased | 177,9 M | 512 | Encoder multilingüe | Apache 2.0 | Hugging Face |
| xlm-roberta-base | 278,0 M | 512 | Encoder multilingüe | MIT | Hugging Face |

La comparación se limita a arquitecturas y licencias, ya que no hay métricas de rendimiento publicadas para este fine-tuning. MuRIL base está específicamente preentrenado en lenguas indias, lo que le da ventaja frente a mBERT y XLM-R en tareas de hindi e hinglish, aunque este fine-tuning concreto no documenta su calidad.

## Limitaciones y advertencias

- Documentación mínima: la model card es autogenerada y no describe el dataset, las etiquetas, el dominio de aplicación ni las limitaciones.
- Sin métricas de calidad: no hay accuracy, F1 ni matriz de confusión publicadas; solo la pérdida de validación, insuficiente para evaluar el rendimiento real.
- Dataset de entrenamiento desconocido: figura como "None", con solo 105 pasos de entrenamiento, lo que indica un corpus muy pequeño y riesgo de sobreajuste.
- Sesgos: al entrenarse sobre datos no documentados de hinglish, puede reproducir sesgos de género, casta, religión o región presentes en comentarios de redes sociales indias.
- Riesgo de alucinación: bajo en el sentido generativo (es un clasificador), pero puede producir etiquetas erróneas con alta confianza en textos fuera de distribución.
- Limitaciones de idioma: aunque el modelo base cubre 17 lenguas indias, el fine-tuning parece orientado solo a hinglish; su comportamiento en otras lenguas o registros no está validado.
- Longitud de contexto: no confirmada; si se hereda del base, 512 tokens, lo que limita comentarios largos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace recomendable validar el modelo en el dominio objetivo antes de desplegarlo en producción.
- Tracción nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de revisión por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divyanshu-ks/muril-hinglish-comment-analyzer
- Modelo base google/muril-base-cased: https://huggingface.co/google/muril-base-cased
- Paper de MuRIL (Khanuja et al., 2021): https://arxiv.org/abs/2103.10730
- Repositorio de MuRIL en GitHub: https://github.com/google-research/multilingual-tokenizer
