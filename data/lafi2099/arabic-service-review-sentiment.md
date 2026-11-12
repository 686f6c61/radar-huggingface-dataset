# lafi2099/arabic-service-review-sentiment

## Resumen

El modelo `lafi2099/arabic-service-review-sentiment` es un clasificador binario de sentimiento en arabe, obtenido mediante fine-tuning completo de `google-bert/bert-base-multilingual-cased` sobre un subconjunto curado del corpus SemEval-2016 Task 5 (Aspect-Based Sentiment Analysis en resenas de hoteles arabes). Su tarea es asignar a un texto una de dos etiquetas: `0 = negative` o `1 = positive`. Esta pensado como herramienta de triaje para resenas de servicios, no como sistema de analisis de sentimiento general.

Se trata de un proyecto de fin de curso de fundamentos de Hugging Face, con un dataset de solo 3000 registros balanceados (2100 de entrenamiento, 450 de validacion y 450 de test). A pesar del volumen reducido de datos, el autor reporta una mejora sustancial frente al baseline: el Macro-F1 pasa de 0,5167 a 0,8911 en el conjunto de test. El modelo tiene 177.854.978 parametros y ocupa 0,7 GB en el repositorio.

Es relevante ahora por dos motivos: cubre un nicho poco atendido (sentimiento en arabe para dominio de servicios) con licencia Apache-2.0, y sirve como ejemplo reproducible de fine-tuning de BERT multilingue con `Trainer`. No obstante, sus limitaciones (dominio restringido, clasificacion binaria sin neutralidad, dataset pequeno) lo confinan a escenarios de asistencia y experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingue, `google-bert/bert-base-multilingual-cased`) |
| Parametros totales | 177.854.978 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base mBERT admite 512 tokens, pero la model card no lo especifica para este fine-tuning) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (`ar`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT base multilingue con cabeza de clasificacion de secuencia (`SequenceClassification`). El fine-tuning fue completo (no LoRA ni adaptadores) usando la clase `Trainer` de Hugging Face. El dataset de partida es `srinivasbilla/semeval-2016-absa-reviews-arabic` (resenas de hoteles arabes de SemEval-2016 Task 5, licencia MIT). El preprocesamiento consistio en agregar los aspectos de cada frase, conservar solo frases con sentimiento uniforme, limpiar el texto, eliminar duplicados y textos de menos de tres palabras, y balancear las dos clases. El resultado final es de 3000 registros: 2100 de entrenamiento, 450 de validacion y 450 de test, con semilla 42.

Se realizaron dos experimentos con 3 epochs, batch size 16, weight decay 0,01 y warmup del 10 %, variando solo el learning rate (2e-5 y 5e-5). Ambos alcanzaron un Macro-F1 de validacion identico (0,9111) y un tiempo de entrenamiento de 0,32 minutos en una NVIDIA GeForce RTX 5080 Laptop GPU. El modelo publicado corresponde al experimento con learning rate 5e-5 (`exp2_lr5e-5`), seleccionado por ser el mejor en validacion. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni RLHF/DPO.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en textos arabes de resenas de servicios.
- Analisis de resenas a nivel de frase o fragmento corto, orientado a dominios de hospitalidad y servicios.
- Inferencia rapida y ligera mediante `pipeline("text-classification")` de Transformers.
- Etiquetado directo con dos clases (`0 = negative`, `1 = positive`) y puntuaciones de confianza por clase.
- Uso como componente de triaje en pipelines de procesamiento de resenas.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada en la practica al arabe, pese a derivar de un modelo multilingue.

## Casos de uso

- Triaje de resenas de hoteles en arabe: clasificar automaticamente cada resena como positiva o negativa para priorizar la atencion de las negativas por parte del equipo de calidad, aprovechando el dominio hotelero del dataset de entrenamiento.
- Monitorizacion de satisfaccion en plataformas de reservas: agregar las predicciones por establecimiento y calcular la proporcion de resenas negativas como indicador de alerta temprana.
- Enrutamiento de quejas en atencion al cliente: enviar las resenas negativas a un flujo de gestion de incidencias y las positivas a un flujo de agradecimiento o marketing.
- Analisis de encuestas post-servicio: clasificar respuestas abiertas cortas en arabe para sintetizar la percepcion de los clientes sin revision manual completa.
- Etiquetado asistido para anotacion humana: predecir etiquetas sobre grandes volumenes de resenas y usarlas como preanotacion que un revisor humano valida, reduciendo el coste de anotacion.
- Experimentacion academica y docencia: servir como referencia reproducible de fine-tuning de mBERT con `Trainer` para comparar hiperparametros y pipelines de clasificacion en arabe.
- Filtrado previo en sistemas de reputacion: descartar o destacar resenas con polaridad clara antes de aplicar modelos mas costosos de analisis de aspectos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test (450 resenas):

| Modelo | Accuracy | Precision | Recall | Macro-F1 |
|---|---|---|---|---|
| Baseline (sin fine-tuning) | 0,5378 | 0,5458 | 0,5378 | 0,5167 |
| Fine-tuned `exp2_lr5e-5` | 0,8911 | 0,8911 | 0,8911 | 0,8911 |

Resultados de validacion durante el entrenamiento:

| Experimento | Learning rate | Epochs / Batch | Macro-F1 (validacion) |
|---|---|---|---|
| exp1 | 2e-5 | 3 / 16 | 0,9111 |
| exp2 | 5e-5 | 3 / 16 | 0,9111 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,7 y 1,5 GB en fp32 (177,9 M parametros); aproximadamente 0,4 GB en fp16 y menos de 0,3 GB en int8. Los valores de cuantizacion no estan documentados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en una NVIDIA GeForce RTX 5080 Laptop GPU.
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Tambien es viable en CPU para inferencia por lotes pequenos, dado el tamano reducido del modelo.
- Opciones de despliegue: `transformers` con `pipeline`, `TextClassificationPipeline`, y exportacion a ONNX para servir con ONNX Runtime. No se documenta compatibilidad explicita con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible; el autor solo reporta 0,32 minutos de entrenamiento por experimento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lafi2099/arabic-service-review-sentiment` | 177,9 M | no disponible | Sentimiento binario en arabe (hoteles) | Apache-2.0 | Hugging Face |
| `google-bert/bert-base-multilingual-cased` (base) | 177,9 M | 512 tokens | Representacion multilingue, requiere cabeza de tarea | Apache-2.0 | Hugging Face |
| `aubmindlab/bert-base-arabertv02` | ~136 M | 512 tokens | Modelo arabe preentrenado, requiere fine-tuning por tarea | Apache-2.0 | Hugging Face |
| `CAMeL-Lab/bert-base-arabic-camelbert-mix` | ~110 M | 512 tokens | Modelo arabe preentrenado, requiere fine-tuning por tarea | Apache-2.0 | Hugging Face |

La comparativa con modelos especializados en sentimiento arabe listos para uso no esta disponible en la informacion proporcionada. Los modelos alternativos citados son preentrenados y no clasificadores de sentimiento ya afinados, por lo que la comparacion directa de rendimiento en esta tarea no es posible sin evaluacion adicional.

## Limitaciones y advertencias

- Dominio restringido: el entrenamiento proviene de resenas de hoteles; el rendimiento puede degradarse en resenas de restaurantes, comercio minorista o servicios publicos, y con dialectos poco representados.
- Clasificacion estrictamente binaria: no modela opiniones neutras ni mixtas (positivas y negativas en la misma frase), que quedan forzadas a una de las dos clases.
- Sensibilidad a sarcasmo, negacion compuesta y resenas muy cortas, segun el propio autor.
- Dataset pequeno (3000 registros) y balanceado artificialmente; el rendimiento reportado (0,8911 de Macro-F1) puede no generalizar a distribuciones reales de resenas, que suelen estar desbalanceadas.
- Riesgo de alucinacion no aplica en sentido generativo, pero existe riesgo de falsos positivos y falsos negativos en la clasificacion; no debe usarse como unica fuente para decisiones que afecten a personas.
- Sesgos linguisticos heredados del preentrenamiento multilingue de mBERT; el autor advierte sobre posibles sesgos de los datos de preentrenamiento.
- No debe usarse para decisiones que afecten a empleados o clientes sin revision humana.
- Requiere eliminar datos personales de cualquier resena nueva antes del analisis.
- Licencia Apache-2.0 permite uso comercial, pero el dataset de origen (SemEval-2016 Task 5, licencia MIT) impone sus propias condiciones de atribucion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de validacion externa ni de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lafi2099/arabic-service-review-sentiment
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/srinivasbilla/semeval-2016-absa-reviews-arabic
- SemEval-2016 Task 5 (referencia del corpus original): https://alt.qcri.org/semeval2016/task5/
