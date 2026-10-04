# mts-the-architect/open-emotions

## Resumen

Open Emotions (`mts-the-architect/open-emotions`) es un clasificador de texto en inglés para detección multietiqueta de emociones. Se trata de un ajuste fino completo del encoder `FacebookAI/roberta-base` sobre el conjunto `google-research-datasets/go_emotions` (configuración `simplified`), con una cabeza de clasificación lineal que emite 28 salidas independientes: 27 emociones más la clase `neutral`. El modelo lo publica el usuario `mts-the-architect` con licencia MIT y pesos abiertos en formato safetensors.

El problema que resuelve es el etiquetado emocional a nivel de enunciado en textos cortos: en lugar de asignar una única clase excluyente, aplica sigmoide por etiqueta, de modo que una misma frase puede recibir varias emociones simultáneas y las puntuaciones no suman uno. El repositorio incluye un fichero `thresholds.json` con umbrales por etiqueta, seleccionados sobre validación, lo que permite ajustar el compromiso precisión/recall por emoción sin reentrenar.

Con 124.667.164 parámetros (encoder más cabeza) y un tamaño de repositorio de 0,5 GB, el modelo es ligero y desplegable en CPU o en cualquier GPU de consumo. Su interés actual radica en la trazabilidad: la model card documenta el dataset, la revisión exacta, los hiperparámetros, las versiones de las librerías y los resultados por época, además de reportar un entrenamiento completo en 30,49 minutos sobre una APU AMD Radeon 8060S, lo que lo convierte en una referencia reproducible para tareas de clasificación emocional. Como contrapartida, el repositorio registra 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza de clasificacion lineal multietiqueta |
| Parametros totales | 124.667.164 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (longitud maxima usada en entrenamiento; no se especifica el limite de inferencia) |
| Tipos de cuantizacion | no disponible (entrenamiento en precision completa; no se publican versiones cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | FacebookAI/roberta-base (revision e2da8e2f811d1448a5b465c236feacd80ffbac7b) |
| Dataset de entrenamiento | google-research-datasets/go_emotions, configuracion simplified (revision add492243ff905527e67aeb8b80c082af02207c3) |
| Etiquetas de salida | 28 (27 emociones + neutral), clasificacion multietiqueta con sigmoide |
| Pipeline | text-classification |
| Tamano del repositorio | 0,5 GB |
| Autor | mts-the-architect |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en el repositorio | 2026-10-03 segun metadatos de HuggingFace |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo RoBERTa-base (12 capas, atencion completa) con un cabezal de clasificacion lineal sobre la representacion del token de inicio de secuencia. La funcion de perdida es entropia cruzada binaria aplicada sobre los logits con objetivos multi-hot, lo que habilita la clasificacion multietiqueta independiente: cada emocion se activa segun su propia probabilidad sigmoide y un umbral configurable. El ajuste fino cubre el encoder completo y la cabeza, sin congelar capas.

El entrenamiento uso los splits oficiales de GoEmotions (`simplified`): 43.410 ejemplos de entrenamiento, 5.426 de validacion y 5.427 de test. Se realizaron 3 epocas con tamano de lote 32, longitud maxima de 128 tokens, tasa de aprendizaje 2e-05, semilla 42, optimizador AdamW con weight decay 0,01, decaimiento lineal con 6 por ciento de warmup y recorte de norma de gradiente en 1,0. En total, 1.357 pasos de optimizador por epoca (4.071 pasos en las tres epocas) y 130.230 presentaciones de ejemplos. El checkpoint final seleccionado fue el de la epoca 3, elegido por micro-F1 de validacion con umbral 0,50; despues se escogio un umbral global de 0,30 sobre validacion (rejilla de 0,10 a 0,80 en incrementos de 0,05), nunca sobre test.

El hardware fue un portatil ASUS ROG Flow Z13 (2025) con procesador AMD Ryzen AI Max+ 395, GPU integrada AMD Radeon 8060S y 128 GB de RAM unificada, ejecutando Ubuntu 24.04 bajo WSL 2 sobre Windows 11 Pro, con PyTorch sobre ROCm. El entrenamiento fue en precision completa, sin cuantizacion ni precision mixta, y duro 1.829,27 segundos (30,49 minutos) incluyendo inicializacion y evaluacion. Las versiones registradas son torch 2.13.0+rocm10.0.0, transformers 4.57.6, datasets 3.6.0, numpy 2.5.3 y pyarrow 20.0.0. La model card indica que este checkpoint se entreno unicamente con ejemplos reales de GoEmotions y que no se usaron ejemplos sinteticos; la continuacion sintetica posterior no esta incluida en el repositorio. No hubo RLHF ni DPO: es un ajuste supervisado de clasificacion, no un modelo generativo.

## Capacidades

- Clasificacion multietiqueta de emociones en ingles sobre textos cortos: 27 emociones mas `neutral`, con puntuaciones sigmoide independientes que no suman uno.
- Umbral global y umbrales por etiqueta ajustables: el repositorio incluye `thresholds.json`, con un umbral global recomendado de 0,30 seleccionado sobre validacion.
- Prediccion conjunta de varias emociones en el mismo enunciado (por ejemplo, `gratitude` y `joy` a la vez), gracias al esquema multi-hot.
- Etiquetado por lotes de grandes volumenes de texto mediante la pipeline `text-classification` de Transformers.
- Ejecucion local en CPU o GPU de gama baja, con inferencia determinista y sin generacion de texto.
- No dispone de generacion de texto, razonamiento multi-paso, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No esta disenado para flujos de agentes ni para conversaciones multi-turno: procesa un enunciado por inferencia.
- Solo ingles. No hay soporte multilingue declarado.
- No tiene vision, audio ni modo de razonamiento extendido.
- Limitacion conceptual declarada por el autor: detecta emociones expresadas en el lenguaje, pero sus puntuaciones no establecen el estado emocional interno de una persona.

## Casos de uso

- Moderacion de comunidades y foros: etiquetar comentarios con `anger`, `disgust`, `annoyance` o `disapproval` para priorizar revision humana o activar avisos automaticos. El esquema multietiqueta permite captar mensajes con emociones mixtas, habituales en discusiones encadenadas.
- Enrutado y priorizacion de tickets de soporte: detectar `disappointment`, `anger` o `frustracion` expresada como queja y elevar el ticket a un agente humano antes que las consultas neutras, usando el umbral por etiqueta para controlar los falsos positivos.
- Analitica de voz del cliente sobre resenas y encuestas: procesar por lotes miles de respuestas y generar agregados por emocion (`gratitude`, `joy`, `sadness`, `confusion`) para paneles de producto y experiencia de usuario.
- Investigacion en ciencias sociales y analisis de discurso: etiquetar corpus de texto en ingles con 28 categorias emocionales para estudiar tendencias, siempre con validacion humana del etiquetado y con conocimiento de las limitaciones de recall del modelo.
- Anotacion asistida de datasets: preetiquetar grandes volumenes de texto antes de la revision manual, reduciendo el coste de anotacion humana en proyectos de NLP que necesiten etiquetas emocionales.
- Enriquecimiento de pipelines de NLP: generar caracteristicas emocionales que alimenten clasificadores posteriores (por ejemplo, modelos de churn o de deteccion de abandono) o sistemas de recomendacion sensibles al tono.
- Monitorizacion de comunidades de apoyo: detectar senales de `sadness`, `grief` o `fear` en foros de ayuda mutua como primer filtro para revision humana. Requiere intervencion de personas cualificadas y no debe usarse como diagnostico ni como medida del estado interno del usuario.
- Adaptacion de respuestas en asistentes conversacionales: ajustar el registro de la respuesta de un chatbot segun la emocion detectada en el turno anterior, usando el clasificador como modulo auxiliar de un sistema mayor.

## Benchmarks y rendimiento

Evaluacion sobre el split oficial de test `simplified` de GoEmotions, tras seleccionar el checkpoint y el umbral con datos de validacion. El umbral global aplicado en test es 0,30 y las puntuaciones usan sigmoide.

| Metrica | Resultado en test |
|---|---|
| Micro-F1 | 0,6047 |
| Macro-F1 | 0,4353 |

Resultados desagregados por emocion en el mismo split:

| Emocion | Precision | Recall | F1 | Soporte en test |
|---|---|---|---|---|
| admiration | 0,649 | 0,778 | 0,708 | 504 |
| amusement | 0,745 | 0,909 | 0,819 | 264 |
| anger | 0,440 | 0,515 | 0,474 | 198 |
| annoyance | 0,393 | 0,309 | 0,346 | 320 |
| approval | 0,450 | 0,396 | 0,421 | 351 |
| caring | 0,418 | 0,437 | 0,428 | 135 |
| confusion | 0,457 | 0,418 | 0,437 | 153 |
| curiosity | 0,491 | 0,704 | 0,579 | 284 |
| desire | 0,642 | 0,410 | 0,500 | 83 |
| disappointment | 0,484 | 0,099 | 0,165 | 151 |
| disapproval | 0,399 | 0,419 | 0,409 | 267 |
| disgust | 0,609 | 0,317 | 0,417 | 123 |
| embarrassment | 0,000 | 0,000 | 0,000 | 37 |
| excitement | 0,485 | 0,311 | 0,379 | 103 |
| fear | 0,662 | 0,679 | 0,671 | 78 |
| gratitude | 0,929 | 0,923 | 0,926 | 352 |
| grief | 0,000 | 0,000 | 0,000 | 6 |
| joy | 0,600 | 0,634 | 0,616 | 161 |
| love | 0,734 | 0,882 | 0,802 | 238 |
| nervousness | 0,000 | 0,000 | 0,000 | 23 |
| optimism | 0,620 | 0,527 | 0,570 | 186 |
| pride | 0,000 | 0,000 | 0,000 | 16 |
| realization | 0,800 | 0,028 | 0,053 | 145 |
| relief | 0,000 | 0,000 | 0,000 | 11 |
| remorse | 0,622 | 0,911 | 0,739 | 56 |
| sadness | 0,503 | 0,513 | 0,508 | 156 |
| surprise | 0,528 | 0,539 | 0,533 | 141 |
| neutral | 0,655 | 0,726 | 0,689 | 1787 |

Progresion del entrenamiento (la seleccion de checkpoint uso umbral 0,50 en validacion; las cifras de test usan el umbral 0,30, por lo que las tablas no son directamente comparables):

| Epoca | Perdida media de entrenamiento | Micro-F1 de validacion | Macro-F1 de validacion |
|---|---|---|---|
| 1 | 0,16473 | 0,4037 | 0,1681 |
| 2 | 0,09309 | 0,5408 | 0,3447 |
| 3 | 0,08309 | 0,5590 | 0,3687 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable en un modelo de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 0,5 GB; en fp16, alrededor de 0,25 GB. Con activaciones y lote pequeno, 1-2 GB de memoria dedicada son suficientes.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 o GPUs integradas. No requiere A100, H100 ni memorias de 40-80 GB.
- Inferencia en CPU perfectamente viable para volumenes moderados y para despliegues por lotes en servidores sin GPU.
- El entrenamiento completo se realizo en una GPU integrada AMD Radeon 8060S (APU Ryzen AI Max+ 395) con 128 GB de RAM unificada y ROCm. No se registraron el pico de memoria de GPU ni el consumo energetico.
- Tiempo de entrenamiento registrado: 30,49 minutos para 3 epocas sobre 43.410 ejemplos, sin cuantizacion ni precision mixta.
- Opciones de despliegue: pipeline `text-classification` de Transformers, exportacion a ONNX Runtime, TorchServe, FastAPI con Uvicorn o Hugging Face Inference Endpoints.
- llama.cpp y Ollama requieren pesos en formato GGUF, que no se publican en este repositorio; habria que convertirlos previamente.
- Servidores orientados a generacion como vLLM no son la via natural para un clasificador encoder de este tipo.
- Latencia y throughput: no disponible. La model card no reporta medidas de latencia ni de rendimiento en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Etiquetas | Contexto | Licencia | Micro-F1 en GoEmotions | Disponibilidad |
|---|---|---|---|---|---|---|
| mts-the-architect/open-emotions | 124.667.164 | 28 multietiqueta | 128 tokens en entrenamiento | MIT | 0,6047 (test simplified, umbral 0,30) | HuggingFace |
| FacebookAI/roberta-base (modelo base) | no disponible en la informacion proporcionada | no aplica (modelo de lenguaje enmascarado) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no aplica | HuggingFace |
| SamLowe/roberta-base-go_emotions | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Clasificadores BERT sobre GoEmotions | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible |

Nota: los modelos alternativos se citan como referencias conocidas de la misma categoria (clasificacion emocional sobre GoEmotions con encoders tipo BERT/RoBERTa), pero sus especificaciones y metricas no forman parte de la informacion proporcionada en esta busqueda y no se han verificado, por lo que se marcan como no disponibles.

## Limitaciones y advertencias

- Rendimiento muy desigual por emocion: `embarrassment`, `grief`, `nervousness`, `pride` y `relief` obtienen F1 de 0,000 en test, en varios casos por soporte muy bajo (6 a 37 ejemplos). No son fiables.
- `realization` presenta precision 0,800 con recall 0,028: practicamente no recupera casos positivos.
- `disappointment` (F1 0,165), `annoyance` (0,346) y `excitement` (0,379) tambien muestran un rendimiento bajo.
- Micro-F1 (0,6047) y macro-F1 (0,4353) estan muy separados, lo que indica un sesgo hacia las clases frecuentes (`neutral`, `gratitude`, `admiration`).
- El umbral global de 0,30 se optimizo para micro-F1 en validacion, lo que favorece a las clases mayoritarias; para emociones concretas conviene usar los umbrales por etiqueta de `thresholds.json`.
- Las puntuaciones no suman uno y no son probabilidades calibradas de forma conjunta; deben interpretarse como activaciones independientes.
- Solo ingles. Cualquier uso en castellano u otros idiomas queda fuera del alcance declarado del modelo.
- Entrenado exclusivamente sobre GoEmotions, derivado de comentarios de Reddit: hereda el registro, los temas y los sesgos de esa plataforma, incluidos sesgos demograficos y culturales presentes en los datos de origen.
- Riesgo de falsos positivos y negativos en textos ironicos, sarcasticos o con emociones implicitas, un fenomeno conocido en la anotacion emocional.
- El propio autor advierte que el modelo detecta emociones expresadas en el lenguaje y no el estado emocional interno de una persona. No debe usarse como herramienta de diagnostico clinico ni para vigilancia de personas.
- El repositorio tiene 0 descargas y 0 likes: no existe validacion independiente de la comunidad ni evaluaciones de terceros.
- La model card indica que existe una continuacion sintetica posterior que no esta incluida en estos pesos; quien necesite ese comportamiento debe buscar el otro repositorio.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Aun asi, la responsabilidad sobre el uso en produccion y sobre el cumplimiento normativo (por ejemplo, proteccion de datos en analisis de emociones) recae en el desplegador.
- No se documentan medidas de calibracion, robustez ante dominios distintos de Reddit ni evaluacion de sesgos por subgrupos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mts-the-architect/open-emotions
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Paper de RoBERTa (referenciado en las etiquetas del repositorio, arXiv:1907.11692): https://arxiv.org/abs/1907.11692
- Ficheros auxiliares citados en la model card, alojados en el propio repositorio: `thresholds.json`, `training_run.json`, `history.json`, `test_metrics.json`, `training_script.py`, `training_source.sha256`, `training_environment.lock.txt`, `predict_emotions.py`

Nota sobre la busqueda web: los resultados obtenidos corresponden a empresas y productos homonimos sin relacion con el modelo (MTS, sistemas de portage, TMS y similares), por lo que no aportan enlaces adicionales relevantes.
