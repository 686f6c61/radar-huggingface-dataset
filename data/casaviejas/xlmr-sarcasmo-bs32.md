# Casaviejas/xlmr-sarcasmo-bs32

## Resumen

xlmr-sarcasmo-bs32 es un modelo de clasificacion de texto obtenido por ajuste fino (fine-tuning) de FacebookAI/xlm-roberta-large, publicado por el usuario Casaviejas en Hugging Face. Su proposito declarado, a partir del nombre, es la deteccion de sarcasmo, aunque la model card no documenta la tarea ni el conjunto de datos de entrenamiento de forma explicita. El modelo resuelve un problema de clasificacion binaria o multiclase de sentimiento pragmatico: distinguir enunciados sarcasticos de literales en texto.

Tecnicamente se trata de un transformer encoder de tipo XLM-RoBERTa en su variante large, con 559.892.482 parametros (aproximadamente 560 millones) y pesos en formato safetensors. Al heredar la arquitectura multilingue de XLM-RoBERTa, esta disenado para trabajar con texto en multiples idiomas, aunque el autor no especifica que lenguas cubre el ajuste fino. El repositorio ocupa 2,3 GB.

Su relevancia es limitada pero concreta: ofrece un clasificador de sarcasmo con metricas de evaluacion declaradas altas (accuracy 0,9374, F1 macro 0,9339) sobre un conjunto de validacion no documentado. Es util como punto de partida o referencia para tareas de analisis de sentimiento y moderacion de contenido, pero su falta de documentacion y su escasisimo uso (1 descarga, 0 likes) lo convierten en un artefacto de investigacion mas que en un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) |
| Parametros totales | 559.892.482 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura XLM-RoBERTa soporta hasta 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantificable a FP16/INT8/INT4 con herramientas externas) |
| Idiomas soportados | no disponible (modelo base multilingue, cobertura del ajuste fino no documentada) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/xlm-roberta-large, un transformer encoder con atencion bidireccional, 24 capas, 16 cabezas de atencion y dimension oculta de 1024, preentrenado de forma multilingue sobre texto en un centenar de idiomas. Sobre esta base se anade una cabeza de clasificacion de secuencia y se ajusta el conjunto de pesos completo (fine-tuning, no adaptadores).

Los hiperparametros de entrenamiento documentados son: learning rate 1e-05, batch de entrenamiento 8 con 4 pasos de acumulacion (batch efectivo 32), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 478 pasos de calentamiento, 10 epocas, semilla 42 y precision mixta nativa (AMP). El conjunto de entrenamiento no se describe ("unknown dataset" en la model card), y no consta el numero de tokens ni la composicion del corpus. No se documenta RLHF, DPO ni ninguna innovacion arquitectonica adicional; es un ajuste fino supervisado convencional.

## Capacidades

- Clasificacion de texto: salida de etiquetas con probabilidades para la tarea de deteccion de sarcasmo (segun el nombre del modelo).
- Analisis de sentimiento pragmatico: distincion entre enunciados literales e ironicos o sarcasticos.
- Procesamiento multilingue potencial, heredado de XLM-RoBERTa, aunque no confirmado para el ajuste fino.
- Extraccion de embeddings de texto (tag text-embeddings-inference en el repositorio).
- Compatibilidad con endpoints de Hugging Face (tag endpoints_compatible).
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio: es un encoder discriminativo, no un modelo generativo.

## Casos de uso

- Moderacion de comentarios en redes sociales: clasificar respuestas como sarcasticas para evitar malinterpretar tono en sistemas de reputacion o deteccion de toxicidad.
- Analisis de sentimiento en resenas de producto: separar criticas ironicas ("que maravilla de bateria, dura dos horas") de criticas literales, mejorando la fiabilidad del analisis agregado.
- Investigacion en linguistica computacional: banco de pruebas para estudiar la deteccion de sarcasmo en distintos idiomas, dado el origen multilingue del modelo base.
- Enrutamiento de conversaciones en atencion al cliente: detectar sarcasmo en el primer mensaje del usuario para escalar a un agente humano cuando el tono lo justifique.
- Anotacion asistida de corpus: preetiquetar grandes volumenes de texto con probabilidad de sarcasmo para revision humana posterior, reduciendo el coste de anotacion manual.
- Analisis de opiniones en encuestas abiertas: filtrar respuestas sarcasticas que distorsionarian la interpretacion de preguntas abiertas en estudios de mercado.
- Clasificacion por lotes en pipelines de NLP: al ser un encoder de 560 M de parametros, puede procesarse en GPU de consumo con throughput alto para lotes grandes de frases cortas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluacion (no documentado):

| Metrica | Valor |
|---|---|
| Loss | 0,5672 |
| Accuracy | 0,9374 |
| Precision | 0,9375 |
| Recall | 0,9374 |
| F1 | 0,9372 |
| F1 macro | 0,9339 |

Evolucion del entrenamiento (seleccion de epocas clave):

| Epoca | Validation loss | Accuracy | F1 macro |
|---|---|---|---|
| 1 | 0,2896 | 0,8937 | 0,8874 |
| 3 | 0,2359 | 0,9322 | 0,9287 |
| 5 | 0,4043 | 0,9340 | 0,9309 |
| 10 | 0,5672 | 0,9374 | 0,9339 |

No se han publicado comparaciones con otros modelos de deteccion de sarcasmo en la informacion disponible. El model-index oficial esta vacio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB en FP16 y 1,1 GB en INT8; en FP32 completa, unos 4,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3060, RTX 4060, T4). Para lotes grandes o entrenamiento, A100 o H100 no son necesarias; una RTX 4090 o L4 es mas que suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (Pipeline de text-classification), Text Embeddings Inference (TEI), ONNX Runtime, y conversion a GGUF para llama.cpp aunque el soporte de encoders XLM-R en llama.cpp es limitado. Tambien es compatible con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera un throughput de cientos a miles de frases cortas por segundo en GPU moderna, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xlmr-sarcasmo-bs32 | 559,9 M | no disponible | Clasificacion de sarcasmo | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | 559,9 M | 512 tokens | Modelo base multilingue | MIT | Hugging Face |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | ~278 M | 512 tokens | Sentimiento multilingue | no disponible | Hugging Face |
| roberta-base-go_emotions | ~125 M | 512 tokens | Clasificacion de emociones | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, tarea y licencia.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card indica "More information needed" en descripcion, usos previstos y datos de entrenamiento.
- Conjunto de evaluacion no identificado: las metricas de 0,9374 de accuracy no son verificables ni reproducibles sin conocer el dataset.
- Riesgo de sobreajuste: la loss de validacion aumenta desde la epoca 3 (0,2359) hasta la 10 (0,5672) mientras la accuracy apenas mejora, lo que sugiere sobreajuste al conjunto de entrenamiento.
- Sesgos desconocidos: al no documentarse el corpus, no puede evaluarse el sesgo demografico, cultural o linguistico del modelo.
- Cobertura idiomatica incierta: aunque el modelo base es multilingue, se desconoce en que idiomas se entreno el ajuste fino y con que calidad.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos y negativos en la clasificacion de sarcasmo, especialmente en textos ambiguos o de dominio distinto al de entrenamiento.
- Uso comercial permitido por licencia MIT, pero sin garantias del autor y sin documentacion que respalde su fiabilidad en produccion.
- Modelo practicamente sin adopcion (1 descarga, 0 likes): no hay evidencia de uso en comunidad ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Casaviejas/xlmr-sarcasmo-bs32
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
