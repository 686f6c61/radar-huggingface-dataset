# pallabiMukh/bangla-meme-sarcasm-classifier-checkpoints

## Resumen

Este modelo es un clasificador de texto diseñado para detectar sarcasmo en memes en bengalí. Ha sido desarrollado por pallabiMukh y se basa en la arquitectura ELECTRA, con un total de 110.618.882 parámetros. El modelo se entrenó desde cero, aunque la model card no especifica el dataset utilizado, y alcanza una precisión de 0,8005 y un F1 de 0,8182 en el conjunto de evaluación. Está publicado en Hugging Face con formato safetensors y es compatible con la librería Transformers. Su relevancia radica en la escasez de recursos de NLP para el bengalí, especialmente en tareas de sarcasmo en contenido multimodal como memes. La longitud de contexto no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA |
| Parametros totales | 110.618.882 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ELECTRA (Efficiently Learning an Encoder that Classifies Token Replacements Accurately), un transformer encoder que emplea un preentrenamiento con reemplazo de tokens. Según los tags, el modelo está configurado para clasificación de texto. Se ha entrenado desde cero durante 15 épocas con los siguientes hiperparámetros: learning rate 2e-5, batch size 16, optimizer AdamW con betas (0.9, 0.999), scheduler lineal con warmup 0,1 y precisión mixta nativa AMP. El dataset de entrenamiento se indica como "None" en la model card, por lo que no se dispone de información sobre su composición ni tamaño. No se mencionan técnicas de RLHF ni DPO.

## Capacidades

- Clasificación binaria de sarcasmo en texto de memes en bengalí, mediante el pipeline text-classification de Transformers.
- Generación de texto, razonamiento, código, matemáticas o visión: no disponible. El modelo es exclusivamente un clasificador de texto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles. El modelo está orientado al bengalí, aunque no se especifica explícitamente en la model card.
- Capacidades especiales: ninguna documentada más allá de la clasificación de texto.

## Casos de uso

- Moderación de contenido en redes sociales: el modelo puede analizar comentarios y pies de foto en bengalí para detectar sarcasmo, ayudando a plataformas a filtrar contenido potencialmente conflictivo o inapropiado.
- Análisis de sentimiento en memes: en campañas de opinión pública, el modelo permite clasificar memes en bengalí como sarcásticos o no sarcásticos, complementando análisis de sentimiento tradicionales.
- Investigación en NLP bengalí: sirve como modelo base para estudios de ironía y sarcasmo en textos cortos, dado que existen pocos recursos etiquetados para este idioma.
- Sistemas de recomendación de contenido: puede integrarse en feeds de redes sociales para priorizar o filtrar memes según su tono sarcástico, mejorando la experiencia del usuario.
- Monitoreo de marca: las empresas pueden emplear el modelo para identificar publicaciones sarcásticas sobre sus productos o servicios en bengalí, permitiendo una respuesta rápida a la reputación online.
- Detección de discurso de odio encubierto: el sarcasmo puede ocultar agresividad o discriminación; este modelo ayuda a moderadores a detectar mensajes que de otro modo pasarían desapercibidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye resultados de evaluación declarados por el autor, que se muestran a continuación:

| Metrica | Valor |
|---|---|
| Loss | 0,4459 |
| Accuracy | 0,8005 |
| F1 | 0,8182 |

Estos valores corresponden a la mejor época del entrenamiento (época 2 de 15). El model-index de Hugging Face está vacío, por lo que no hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 110,6 millones de parámetros, el modelo ocupa aproximadamente 0,4 GB en disco. En fp32, la inferencia requiere alrededor de 0,44 GB de VRAM; en fp16, unos 0,22 GB. No hay datos oficiales de requisitos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como una RTX 3060, GTX 1660 o superior. También puede ejecutarse en CPU.
- Cabe en consumer GPU: sí, es un modelo ligero que funciona en GPUs de gama media e incluso en CPUs modernas.
- Opciones de despliegue: compatible con Transformers, y puede servirse mediante vLLM, TGI o llama.cpp si se convierte a GGUF. Al ser un modelo pequeño, no suele necesitar optimizaciones adicionales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. No hay datos de benchmarks ni referencias a alternativas de la misma categoría, por lo que la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún análisis de sesgos. El modelo podría reflejar sesgos presentes en el dataset de entrenamiento, que no se especifica.
- Riesgo de alucinación: al ser un clasificador binario, el riesgo de alucinación textual es bajo, pero puede producir falsos positivos o falsos negativos en la detección de sarcasmo.
- Limitaciones de contexto o idioma: la longitud de contexto no está disponible, lo que limita el procesamiento de textos largos. El modelo está orientado al bengalí, sin soporte multilingüe documentado.
- Restricciones de licencia: la licencia no está disponible, por lo que se desconocen las condiciones de uso comercial y redistribución.
- Caveat para producción: no hay documentación sobre el dataset, ni evaluación externa, ni análisis de robustez. No se recomienda su uso en producción sin una validación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/pallabiMukh/bangla-meme-sarcasm-classifier-checkpoints
