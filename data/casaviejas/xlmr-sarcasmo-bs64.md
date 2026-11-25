# Casaviejas/xlmr-sarcasmo-bs64

## Resumen

xlmr-sarcasmo-bs64 es un modelo de clasificación de texto obtenido mediante fine-tuning de FacebookAI/xlm-roberta-large, el encoder multilingüe de tipo transformer de 559,9 millones de parámetros publicado por Facebook AI. El autor del ajuste es el usuario Casaviejas y el propósito declarado, a partir del nombre del repositorio, es la detección de sarcasmo en texto. El modelo se distribuye bajo licencia MIT y con pesos en formato safetensors, lo que facilita su integración en pipelines de Transformers y en servicios de text-embeddings-inference.

La relevancia de esta ficha es limitada pero concreta: se trata de un clasificador binario o multiclase de sarcasmo construido sobre una base multilingüe robusta, con métricas de evaluación razonablemente altas (accuracy 0,9322 y F1 macro 0,9278 en el conjunto de validación). Sin embargo, la model card es prácticamente un esqueleto generado automáticamente por el Trainer de Hugging Face: no documenta el dataset de entrenamiento, el número de etiquetas, el idioma de los datos ni los usos previstos, lo que obliga a tratar el modelo con cautela antes de llevarlo a producción.

El contexto es el de un ajuste supervisado clásico de la familia XLM-RoBERTa: encoder de 24 capas, atención bidireccional y ventana de 512 tokens, entrenado con AdamW fused, precisión mixta nativa y 10 épocas sobre un conjunto no especificado. No es un modelo generativo ni un LLM conversacional; es un clasificador de secuencias que devuelve etiquetas y probabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large), atención bidireccional |
| Parametros totales | 559.892.482 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de XLM-RoBERTa; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantización dinámica INT8 posible vía PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base XLM-RoBERTa es multilingüe con 100 idiomas, pero el autor no declara el idioma de los datos de ajuste) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 2,3 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa large: un transformer encoder con 24 capas, 16 cabezas de atención, dimensión oculta de 1024 y vocabulario SentencePiece de 250 002 tokens. Sobre esta base se añade una cabeza de clasificación de secuencias (pooler más capa lineal) cuyo tamaño exacto no se detalla en la model card. El fine-tuning se realizó con los siguientes hiperparámetros: learning rate 1e-5, batch de entrenamiento efectivo de 64 (batch 8 con 8 pasos de acumulación de gradiente), batch de evaluación 32, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 239 pasos de warmup, 10 épocas, semilla 42 y precisión mixta nativa (AMP). El entrenamiento se ejecutó con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

No hay información sobre el volumen de datos, la composición del dataset, el número de etiquetas ni si se aplicaron técnicas de aumento de datos o balanceo de clases. Tampoco se documenta si hubo validación cruzada o una partición de test independiente: todas las métricas reportadas corresponden al conjunto de evaluación (validación) monitorizado durante el entrenamiento, lo que puede introducir un sesgo optimista si la selección del checkpoint se hizo sobre ese mismo conjunto. La curva de entrenamiento muestra que la pérdida de entrenamiento cae de 4,5984 a 0,4315 mientras la pérdida de validación toca mínimo en la época 2 (0,2056) y repunta hasta 0,3426 en la época 6, lo que sugiere cierto sobreajuste a partir de la tercera o cuarta época.

## Capacidades

- Clasificación de texto: devuelve una etiqueta predicha y una distribución de probabilidad sobre las clases del conjunto de entrenamiento (presumiblemente sarcasmo / no sarcasmo, aunque no se confirma).
- Detección de sarcasmo: capacidad inferida del nombre del repositorio y del pipeline declarado (text-classification); no hay documentación explícita de la tarea.
- Procesamiento multilingüe potencial: heredado del modelo base XLM-RoBERTa, que cubre 100 idiomas, aunque el ajuste puede haber degradado el rendimiento en idiomas no representados en los datos de fine-tuning.
- Extracción de representaciones: al ser un encoder, puede usarse para obtener embeddings contextuales de frases o documentos de hasta 512 tokens.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio.
- No dispone de modo thinking ni de decodificación especulativa.

## Casos de uso

- Moderación de comunidades en línea: clasificar comentarios y publicaciones para señalar posibles mensajes sarcásticos o irónicos que puedan interpretarse como hostiles, usando el modelo como primera capa de filtrado antes de la revisión humana.
- Análisis de sentimiento matizado en redes sociales: incorporar la detección de sarcasmo como señal auxiliar en pipelines de análisis de opinión, ya que el sarcasmo invierte con frecuencia la polaridad aparente de un texto.
- Investigación en lingüística computacional: etiquetar corpus de estudio para analizar la prevalencia de ironía en distintos foros o géneros discursivos, aprovechando la base multilingüe de XLM-RoBERTa.
- Enriquecimiento de datasets de entrenamiento: usar las predicciones como etiquetas débiles (weak labels) para preanotar grandes volúmenes de texto antes de una revisión manual, reduciendo el coste de anotación.
- Sistemas de atención al cliente: detectar respuestas sarcásticas o irónicas de usuarios en encuestas de satisfacción y tickets de soporte, donde el sentimiento literal puede engañar a clasificadores convencionales.
- Clasificación por lotes en backend: al ser un encoder de 560 M de parámetros, cabe en una GPU de 16 GB en fp32 y en menos de 8 GB en fp16, por lo que puede procesar lotes grandes con latencia baja en servicios de inferencia como text-embeddings-inference o TorchServe.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (validación), no en un test independiente:

| Metrica | Valor |
|---|---|
| Loss | 0,3426 |
| Accuracy | 0,9322 |
| Precision | 0,9331 |
| Recall | 0,9322 |
| F1 | 0,9316 |
| F1 Macro | 0,9278 |

Evolución por época según la model card:

| Epoca | Validation loss | Accuracy | F1 | F1 macro |
|---|---|---|---|---|
| 1 | 0,3584 | 0,8382 | 0,8401 | 0,8356 |
| 2 | 0,2056 | 0,9223 | 0,9216 | 0,9171 |
| 3 | 0,2068 | 0,9293 | 0,9290 | 0,9252 |
| 4 | 0,2094 | 0,9356 | 0,9353 | 0,9319 |
| 5 | 0,2961 | 0,9230 | 0,9220 | 0,9174 |
| 6 | 0,3426 | 0,9322 | 0,9316 | 0,9278 |

No se han publicado comparaciones con otros modelos de detección de sarcasmo en la información disponible, ni resultados en conjuntos de test estándar como SARC, iSarcasm o MUStARD.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 2,3 GB de pesos más activaciones; con batch pequeño, entre 3 y 4 GB.
- VRAM en fp16 o bf16: en torno a 1,2 GB de pesos; con batch de 32 y secuencias de 512 tokens, aproximadamente 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para fp16; A100 o H100 para throughput alto con lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 de 24 GB y similares.
- Opciones de despliegue: Transformers con pipeline de text-classification, text-embeddings-inference (tag endpoints_compatible), TorchServe, ONNX Runtime o cuantización dinámica INT8 con PyTorch para CPU.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Casaviejas/xlmr-sarcasmo-bs64 | 559,9 M | 512 tokens | Clasificación de sarcasmo (fine-tune) | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | 559,9 M | 512 tokens | Modelo base multilingüe | MIT | Hugging Face |
| cardiffnlp/twitter-roberta-base-irony | 125 M | 512 tokens | Detección de ironía en Twitter | no disponible en la información | Hugging Face |
| roberta-large-mnli (ejemplo de encoder ajustado) | 355 M | 512 tokens | Clasificación NLI | MIT | Hugging Face |

La comparación directa con clasificadores de sarcasmo publicados no es posible porque no se dispone de métricas comparables en los mismos conjuntos de evaluación. El modelo base XLM-RoBERTa large ofrece el mismo tamaño y contexto, pero sin ajuste específico para sarcasmo. Los modelos basados en RoBERTa (125 M y 355 M) son más ligeros y más rápidos, pero de alcance monolingüe inglés.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce el número de ejemplos, la procedencia, el idioma y el número de clases, lo que impide evaluar la validez ecológica del modelo.
- Métricas solo de validación: no hay un conjunto de test independiente, por lo que las cifras de accuracy y F1 pueden estar infladas por selección de checkpoint o sobreajuste.
- Sobreajuste probable: la pérdida de validación mínima se alcanza en la época 2 y repunta después, mientras la de entrenamiento sigue bajando hasta 0,4315 en la época 6.
- Sesgos desconocidos: al no documentarse la composición del corpus, no es posible identificar sesgos de género, origen, registro o plataforma.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, especialmente en textos irónicos que no emplean marcadores léxicos convencionales.
- Idiomas no declarados: aunque el modelo base es multilingüe, el ajuste puede haber degradado el rendimiento fuera de los idiomas presentes en el corpus de entrenamiento.
- Contexto limitado a 512 tokens: textos más largos deben truncarse o dividirse, lo que puede perder la información necesaria para detectar el sarcasmo.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y de los datos de entrenamiento (no documentados).
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Casaviejas/xlmr-sarcasmo-bs64
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Documentación de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
