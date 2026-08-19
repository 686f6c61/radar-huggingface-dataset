# BOLAJOKO03/yoruba-politeness-classifier

## Resumen

El modelo `BOLAJOKO03/yoruba-politeness-classifier` es un clasificador de texto entrenado para identificar el nivel de cortesía en utterances en yoruba, una lengua africana con escasos recursos en NLP. Desarrollado por BOLAJOKO03, el modelo clasifica las frases en tres categorías: NEUTRAL, POLITE e IMPOLITE. Se basa en una arquitectura XLM-RoBERTa (fine-tuning) y se ha entrenado sobre un dataset propio de 541 utterances anotados, con un reparto de 430 ejemplos para entrenamiento y 108 para prueba.

El modelo es relevante porque aborda una tarea de lingüística computacional en una lengua de bajos recursos, contribuyendo a la investigación en tecnologías del lenguaje para lenguas africanas. Con 278 millones de parámetros, el modelo es compacto y puede ejecutarse en hardware modesto. Su principal limitación es el tamaño reducido del dataset y el desequilibrio de clases, especialmente en la categoría IMPOLITE, que afecta al rendimiento en esa clase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (fine-tuning) |
| Parametros totales | 278.045.955 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura base XLM-RoBERTa, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | yoruba (yo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de XLM-RoBERTa, un transformer basado en RoBERTa con tokenización a nivel de subpalabras, diseñado para soportar múltiples idiomas. El proceso de entrenamiento partió de un dataset conversacional original en yoruba, que fue adaptado, limpiado y anotado manualmente con tres etiquetas de cortesía. El dataset final contiene 541 utterances, con una distribución de 259 NEUTRAL, 240 POLITE y 39 IMPOLITE. Se dividió en 430 ejemplos de entrenamiento y 108 de prueba.

El entrenamiento se realizó durante 5 épocas, con una pérdida final de entrenamiento de 0.137 y una pérdida de validación de 0.399. No se menciona el uso de técnicas adicionales como RLHF o DPO; se trata de un fine-tuning supervisado estándar. No se especifican detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la anotación de cortesía.

## Capacidades

- Clasificación de texto en yoruba en tres categorías de cortesía: NEUTRAL, POLITE e IMPOLITE.
- Análisis de nivel de cortesía en conversaciones escritas en yoruba.
- Funciona como un clasificador de secuencias (text-classification) compatible con la librería `transformers` y con `text-embeddings-inference`.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step; es exclusivamente un modelo de clasificación.
- Capacidad multilingüe limitada: solo entrenado para yoruba, aunque la arquitectura base XLM-RoBERTa es multilingüe.

## Casos de uso

- Investigación académica en lingüística computacional: el modelo permite analizar patrones de cortesía en corpus yoruba, facilitando estudios sociolingüísticos y pragmáticos.
- Desarrollo de asistentes conversacionales en yoruba: puede integrarse en chatbots para ajustar el tono de las respuestas según la cortesía detectada en la entrada del usuario.
- Moderación de contenido en redes sociales: identifica mensajes groseros o descorteses en yoruba para priorizar su revisión o aplicar políticas de comunidad.
- Evaluación de calidad de traducciones automáticas: comparar el nivel de cortesía entre una traducción y el texto original en yoruba para detectar pérdidas pragmáticas.
- Análisis de opiniones y reseñas: clasificar comentarios de clientes en yoruba según su tono (cortés, neutro, descortés) para mejorar la gestión de atención al cliente.
- Herramientas educativas para aprendizaje de yoruba: el modelo puede ayudar a estudiantes a identificar expresiones corteses e incorrectas en contextos escritos.

## Benchmarks y rendimiento

El modelo reporta una accuracy del 89.81% en el conjunto de prueba. Las métricas ponderadas son: precisión 0.89, recall 0.90 y F1 0.89. El macro F1 es 0.74, considerablemente más bajo debido al pobre rendimiento en la clase IMPOLITE.

| Clase | Precision | Recall | F1 |
|---|---:|---:|---:|
| NEUTRAL | 0.88 | 0.94 | 0.91 |
| POLITE | 0.94 | 0.96 | 0.95 |
| IMPOLITE | 0.67 | 0.25 | 0.36 |

Estos resultados indican que el modelo es fiable para las clases mayoritarias, pero tiene una capacidad limitada para detectar utterances descorteses, probablemente por la escasez de ejemplos en el entrenamiento (solo 39 casos).

## Requisitos de hardware

- El modelo tiene 278M de parámetros, lo que requiere aproximadamente 1.1 GB de VRAM en precisión fp32 y unos 0.56 GB en fp16. Es adecuado para GPUs de consumo como la RTX 3060 o superiores, e incluso puede ejecutarse en CPU con una latencia aceptable para inferencia por lotes.
- Para despliegue en producción, se puede usar vLLM o TGI, aunque al ser un clasificador de secuencias, también es compatible con `transformers` y `text-embeddings-inference`.
- En CPU, la inferencia de una sola frase tarda del orden de decenas de milisegundos; en GPU, menos de 10 ms.
- No se requieren GPUs especializadas como A100 o H100 para este modelo.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otros modelos de clasificación de cortesía en yoruba. Como referencia, el modelo base XLM-RoBERTa (sin fine-tuning) no está especializado en esta tarea. Otros modelos multilingües como mBERT o XLM-R podrían adaptarse, pero no existen comparaciones publicadas. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy pequeño (541 utterances), lo que limita la generalización del modelo a contextos variados.
- La clase IMPOLITE está claramente subrepresentada (39 ejemplos), lo que se refleja en un recall de solo 0.25 y un F1 de 0.36. El modelo tiende a no detectar correctamente los mensajes descorteses.
- El modelo solo funciona en yoruba; no soporta otros idiomas ni dialectos.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o si tiene restricciones. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No se han realizado pruebas de sesgos ni de robustez frente a variaciones ortográficas o dialectales del yoruba.
- El modelo fue entrenado en un contexto conversacional específico; su rendimiento puede degradarse en dominios muy diferentes (textos formales, literatura, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BOLAJOKO03/yoruba-politeness-classifier
- Dataset de pares conversacionales en yoruba (del mismo autor): https://huggingface.co/datasets/BOLAJOKO03/adaption-yoruba-conversational-pairs
- Cuaderno de Google Colab (referencia, no verificado): https://colab.research.google.com/drive/1EmVhqlPLUIlFjYw73nzydtfT1PQ8QU2_?usp=sharing
