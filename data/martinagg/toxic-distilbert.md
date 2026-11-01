# Martinagg/toxic-distilbert

## Resumen

`Martinagg/toxic-distilbert` es un clasificador de toxicidad en ingles obtenido mediante fine-tuning de `distilbert-base-uncased`, un transformer encoder de 66,9 millones de parametros. Lo publica el usuario Martinagg como proyecto final del curso *Trust in Automated Moderation of Toxic Comments* (ECE 4424 / CS 4824), con codigo abierto en GitHub. Su funcion es asignar a un comentario la probabilidad estimada de ser toxico, pensada como herramienta de moderacion de contenido en foros y secciones de comentarios.

El modelo se entrena sobre Jigsaw Unintended Bias in Toxicity Classification (1,8 millones de comentarios de noticias en ingles), pero con dos decisiones tecnicas que lo distinguen de un clasificador binario convencional: aprende etiquetas suaves (la proporcion de anotadores que marcaron el comentario como toxico) y pondera mas en la funcion de perdida los comentarios que mencionan una identidad. El objetivo declarado es reducir el sesgo no intencionado contra colectivos identitarios, un problema conocido en los clasificadores de toxicidad entrenados con etiquetas duras.

Es relevante ahora porque ofrece, en un paquete pequeno (0,3 GB) y con licencia MIT, un punto de partida reproducible para pipelines de moderacion asistida: el propio autor documenta sus limitaciones con cifras (falla en negaciones, contra-discurso y juramentos positivos) y recomienda derivar a revision humana las predicciones entre 0,4 y 0,6. No es un modelo de proposito general ni un LLM: es un clasificador de una sola etiqueta, solo en ingles y con contexto de 128 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base, 6 capas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La base es DistilBERT, un transformer encoder de 6 capas y 66,9 millones de parametros obtenido por destilacion de BERT-base, con vocabulario uncased. Sobre esa base se anade una cabeza de clasificacion para una unica etiqueta de toxicidad. El entrenamiento usa `train.csv` de Jigsaw Unintended Bias in Toxicity Classification (1,8 millones de comentarios de noticias), con particion 80/10/10 agrupada por articulo para evitar fuga de informacion entre conjuntos.

Las innovaciones declaradas son dos. Primero, etiquetas suaves: el objetivo no es 0/1 sino la fraccion de anotadores que considero toxico el comentario, lo que aprovecha la variabilidad entre anotadores. Segundo, pesos por identidad: los comentarios que mencionan una identidad reciben peso 2 en la perdida si son toxicos y peso 3 si no lo son, con el fin de penalizar mas los falsos positivos sobre esos colectivos. Hiperparametros: 2 epocas, learning rate 2e-5, batch size 16, max length 128, seleccion de epoca por PR-AUC en validacion. No se documenta uso de RLHF ni DPO (no aplica a un clasificador de este tipo).

## Capacidades

- Clasificacion binaria de toxicidad en texto en ingles: devuelve una probabilidad por comentario.
- Aprovechamiento de etiquetas suaves: la salida refleja el grado de acuerdo entre anotadores, no solo una clase.
- Mitigacion parcial del sesgo identitario mediante ponderacion en la perdida.
- Integracion directa con `transformers` mediante `pipeline("text-classification")`.
- Entrada de hasta 128 tokens por muestra (comentarios cortos o fragmentos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No es un modelo generativo: no produce texto, solo una etiqueta y su puntuacion.

## Casos de uso

- Moderacion asistida en foros y secciones de comentarios: el modelo puntua cada comentario y los que caen en la banda 0,4-0,6 se enrutan a revision humana, tal como recomienda el autor; es adecuado por su bajo coste (66,9 M de parametros) y su latencia reducida en CPU.
- Prefiltrado en pipelines de moderacion a gran escala: al ser un encoder pequeno, puede procesar lotes grandes de comentarios antes de pasarlos a un modelo mayor o a un revisor humano, reduciendo el volumen que llega a la cola de revision.
- Investigacion sobre sesgo en moderacion automatica: el modelo sirve como referencia reproducible para estudiar falsos positivos por identidad, dado que el autor publica tasas concretas (5,6 % en menciones a gay/lesbian frente a 1,3 % global).
- Deteccion de toxicidad en comentarios de noticias: el dominio de entrenamiento (noticias en ingles) coincide con el caso de uso, lo que reduce el desajuste distribucional frente a otros corpus.
- Senal auxiliar en sistemas de reputacion o ranking de comentarios: la probabilidad puede usarse como feature adicional en un modelo de ordenacion, no como decision final.
- Evaluacion comparativa de clasificadores de toxicidad: su tabla de resultados frente a blocklist y TF-IDF+regresion logistica permite usarlo como baseline en experimentos academicos.
- Filtrado previo en datasets de entrenamiento: descartar o marcar muestras toxicas antes de usarlas en otros proyectos de NLP en ingles.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test retenido (177.635 comentarios, umbral 0,5):

| Modelo | Precision | Recall | F1 | ROC AUC | PR-AUC |
|---|---|---|---|---|---|
| Word blocklist (LDNOOBW) | 0,27 | 0,10 | 0,15 | 0,54 | 0,10 |
| TF-IDF + regresion logistica | 0,73 | 0,53 | 0,61 | 0,93 | 0,69 |
| **Este modelo** | **0,80** | **0,58** | **0,67** | **0,96** | **0,78** |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni son aplicables a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,9 M de parametros, unos 268 MB de pesos); en fp16 alrededor de 134 MB.
- Cabe en cualquier GPU consumer: GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, e incluso en CPU sin GPU dedicada.
- GPU recomendadas para alto throughput: T4, L4, A10G o A100 si se procesan millones de comentarios por lote; para uso interactivo, cualquier GPU moderna sirve.
- Opciones de despliegue: `transformers` (pipeline), TorchServe, FastAPI + `transformers`, ONNX Runtime si se exporta manualmente. No se documentan variantes GGUF para llama.cpp ni Ollama, ni configuracion para vLLM o TGI (no aplica a un encoder de este tamano).
- Latencia y throughput: no se han publicado cifras en la informacion disponible; por tamano, se espera procesamiento por lotes de miles de comentarios por segundo en GPU y cientos por segundo en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Martinagg/toxic-distilbert` | 66,9 M | 128 tokens | DistilBERT fine-tuned con etiquetas suaves y pesos por identidad | MIT | HuggingFace (24 descargas) |
| TF-IDF + regresion logistica (baseline del autor) | no aplica | no aplica | Bolsa de palabras clasica | no disponible | Implementacion propia |
| Word blocklist (LDNOOBW) | no aplica | no aplica | Lista de palabras prohibidas | no disponible | Publica |
| `unitary/toxic-bert` (referencia de la categoria) | ~110 M | 512 tokens | BERT-base fine-tuned en Jigsaw | Apache 2.0 | HuggingFace |

La comparacion con `unitary/toxic-bert` es por categoria y tamano, no por resultados medidos en el mismo test: no se dispone de una evaluacion cruzada en la informacion proporcionada. Frente a los baselines del propio autor, este modelo mejora el F1 de 0,61 a 0,67 y el PR-AUC de 0,69 a 0,78.

## Limitaciones y advertencias

- Recall limitado: con umbral 0,5 se pierden aproximadamente 4 de cada 10 comentarios toxicos (recall 0,58).
- Sesgo identitario persistente: aun con la ponderacion, bloquea mas comentarios inocentes que mencionan identidades (5,6 % en gay/lesbian frente a 1,3 % global).
- Falla en negaciones con insultos ("You are not an idiot"), contra-discurso y juramentos positivos.
- Solo evaluado en comentarios de noticias en ingles de la misma fuente que el entrenamiento; el rendimiento fuera de ese dominio (redes sociales, chat, otros idiomas) no esta medido.
- Contexto de 128 tokens: comentarios largos se truncan, con perdida de informacion.
- No apto para moderacion totalmente automatica: el autor recomienda enviar a revision humana las predicciones entre 0,4 y 0,6.
- Licencia MIT: permite uso comercial y modificacion, pero no exime de responsabilidad sobre el uso del clasificador en produccion.
- Modelo con muy poca adopcion (24 descargas, 0 likes): no hay evidencia de uso en produccion ni auditorias externas.
- Riesgo de alucinacion no aplica (no es generativo), pero si de clasificacion erronea con alta confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Martinagg/toxic-distilbert
- Codigo del proyecto: https://github.com/martinagg7/ML-ToxicModeration
- Dataset de entrenamiento: https://www.kaggle.com/c/jigsaw-unintended-bias-in-toxicity-classification
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
