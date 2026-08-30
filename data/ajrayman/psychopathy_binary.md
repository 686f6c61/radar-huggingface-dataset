# ajrayman/psychopathy_binary

## Resumen

El modelo `ajrayman/psychopathy_binary` es un clasificador de texto binario desarrollado por Adam (ajrayman) mediante fine-tuning del modelo base `roberta-base` de Facebook AI. Su propósito es detectar indicios de psicopatía en texto, presumiblemente como parte de un conjunto de herramientas de análisis psicológico (el mismo autor publica modelos similares para maquiavelismo y otros rasgos). Está disponible bajo licencia MIT y se distribuye en formato safetensors.

Con 124.647.170 parámetros, se trata de un modelo de tamaño modesto, adecuado para tareas de clasificación de secuencias en entornos con recursos limitados. La información pública sobre el dataset de entrenamiento, los idiomas soportados y los casos de uso previstos es muy escasa, ya que la model card generada automáticamente no incluye detalles más allá de los hiperparámetros y las métricas de evaluación. A pesar de su bajo rendimiento reportado (F1 de 0,62 en el conjunto de validación), su licencia permisiva y su facilidad de despliegue lo convierten en una opción accesible para experimentación, aunque no se recomienda para uso en producción sin una validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder, fine-tuned) |
| Parametros totales | 124.647.170 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens (heredado de RoBERTa) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors con precisión fp32) |
| Idiomas soportados | no disponible (probablemente inglés, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder preentrenado con 12 capas, 12 cabezas de atención y una dimensión oculta de 768. El fine-tuning se realizó sobre una tarea de clasificación binaria de secuencias, añadiendo una cabeza de clasificación sobre la representación del token `[CLS]`. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 2e-05, batch de 32, optimizador Adam (betas 0.9/0.999), scheduler lineal con warmup del 6% y 8 épocas. El dataset de entrenamiento no está documentado (se indica "None" en la model card), lo que impide conocer la composición, el volumen y el origen de los datos. No se mencionan técnicas como RLHF, DPO o aumentación de datos.

## Capacidades

- Clasificación binaria de texto: asigna una puntuación de probabilidad entre dos clases (psicopatía positiva o negativa).
- Inferencia sobre secuencias de hasta 512 tokens gracias a la ventana de contexto de RoBERTa.
- Integración sencilla con la librería `transformers` y el pipeline `text-classification`.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face.
- No se reportan capacidades de generación de texto, tool calling, agentes, visión o audio.

## Casos de uso

- Análisis psicológico asistido: el modelo puede utilizarse como herramienta de apoyo en investigaciones sobre rasgos de personalidad, procesando respuestas de cuestionarios o textos libres para identificar posibles indicadores de psicopatía. Su naturaleza binaria simplifica la interpretación.
- Moderación de contenido en foros y redes sociales: aunque su precisión es limitada, puede servir como filtro preliminar para detectar discursos potencialmente manipuladores o carentes de empatía, derivando los casos señalados a revisión humana.
- Investigación académica en psicología computacional: los investigadores pueden emplearlo como baseline en estudios comparativos sobre detección de trastornos de personalidad mediante NLP, dado su tamaño reducido y su facilidad de reproducción.
- Desarrollo de prototipos y demos: al ser ligero y con licencia MIT, es adecuado para integrarse en aplicaciones demo o pruebas de concepto que requieran un clasificador de texto sin coste de licencia.
- Enriquecimiento de datasets: puede utilizarse para etiquetar automáticamente grandes volúmenes de texto con una etiqueta binaria de psicopatía, aunque se recomienda verificar la calidad de las predicciones antes de usarlas como ground truth.
- Educación en fine-tuning de transformers: sirve como ejemplo práctico de cómo ajustar un modelo preentrenado para una tarea específica, ya que su configuración de entrenamiento está documentada y es fácilmente replicable.

## Benchmarks y rendimiento

El autor declara en la model card los siguientes resultados sobre el conjunto de evaluación, obtenidos durante el entrenamiento (época 6, la última reportada):

| Metrica | Valor |
|---|---|
| Loss | 0,9319 |
| Accuracy | 0,6783 |
| Precision | 0,76 |
| Recall | 0,5225 |
| F1 | 0,6193 |
| AUC | 0,7451 |

No se han publicado resultados en benchmarks estandarizados (MMLU, GLUE, etc.) en la información disponible. El modelo-index de Hugging Face está vacío. La ausencia de un dataset de evaluación público impide comparar estos números con otros modelos de forma fiable.

## Requisitos de hardware

- VRAM estimada: aproximadamente 500 MB en fp32 para inferencia con un batch de 1 (124M parámetros × 4 bytes). Con cuantización a int8 o fp16 se reduce a ~250 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, etc. También funciona en CPU sin problemas para inferencia en tiempo real.
- Compatibilidad con GPUs de consumo: sí, es un modelo pequeño que cabe en cualquier tarjeta moderna e incluso en hardware embebido.
- Opciones de despliegue: librería `transformers` de Hugging Face, `TGI` (Text Generation Inference) para endpoints, `ONNX Runtime` para optimización en CPU, y compatible con `text-embeddings-inference`.
- Latencia y throughput: en una GPU moderna (p. ej., RTX 4090) la inferencia tarda menos de 10 ms por secuencia; en CPU (4 núcleos) puede rondar los 50-100 ms por secuencia, dependiendo de la longitud del texto.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos equivalentes. El propio autor ha publicado otros clasificadores binarios basados en RoBERTa (por ejemplo, `machiavellianism_binary`), pero no se han documentado sus especificaciones ni rendimiento en fuentes accesibles. Como referencia arquitectónica, `roberta-base` original (sin fine-tuning) tiene los mismos parámetros y contexto, pero no está entrenado para clasificación de psicopatía. No hay datos suficientes para establecer una comparación cuantitativa con alternativas como `textattack/roberta-base-uncased-yelp-polarity` u otros modelos de análisis de sentimiento, que abordan tareas distintas.

## Limitaciones y advertencias

- El rendimiento reportado es bajo: F1 de 0,62 y recall de 0,52 indican que el modelo falla en detectar una parte significativa de los casos positivos, lo que limita su utilidad en aplicaciones críticas.
- El dataset de entrenamiento no está documentado, por lo que se desconocen la procedencia, el idioma y el posible sesgo de los datos. Esto impide evaluar su generalización a otros dominios o poblaciones.
- No se proporcionan detalles sobre el preprocesado de texto ni sobre la definición exacta de "psicopatía" utilizada para las etiquetas, lo que dificulta interpretar las predicciones.
- La ventana de contexto de 512 tokens es fija; textos más largos deben truncarse, perdiendo información relevante.
- Al ser un modelo de clasificación binaria, no ofrece explicaciones sobre las decisiones, lo que puede ser problemático en entornos donde se requiera trazabilidad.
- La licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte. No se han publicado advertencias sobre sesgos específicos, pero cualquier modelo entrenado con datos no auditados puede perpetuar estereotipos o juicios injustos, especialmente en un dominio tan sensible como la salud mental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/psychopathy_binary
- Perfil del autor en Hugging Face: https://huggingface.co/ajrayman
- Modelo base `roberta-base`: https://huggingface.co/FacebookAI/roberta-base
