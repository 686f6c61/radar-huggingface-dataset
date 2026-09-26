# Dilshan50/sentiment-model

## Resumen

Dilshan50/sentiment-model es un modelo de clasificacion de texto obtenido por ajuste fino (*fine-tuning*) de distilbert-base-uncased, publicado por el usuario Dilshan50 en HuggingFace. Se trata, por tanto, de un transformer encoder de tipo BERT destilado, con 66.955.779 parametros en formato safetensors y una ventana de contexto maxima de 512 tokens, orientado a la tarea de analisis de sentimiento (pipeline `text-classification`). La licencia declarada es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de la atribucion habitual.

El modelo se genero con el `Trainer` de HuggingFace sobre un conjunto de datos que la propia model card describe como "unknown dataset": no se documentan la composicion, el idioma ni el numero de etiquetas. Las unicas metricas disponibles son las de validacion declaradas por el autor: perdida 0.7470, exactitud 0.6598 y F1 ponderado/F1 macro 0.6493 (valores identicos en ambas metricas F1, lo que sugiere clases razonablemente equilibradas). El entrenamiento duro 3 epocas con 58 pasos por epoca, *learning rate* 2e-5, tamano de lote 32 y optimizador AdamW fusionado.

La relevancia de esta ficha es mas bien la de un caso de estudio y de utilidad practica limitada: el repositorio no tiene descargas ni "me gusta", la model card esta generada automaticamente y sin completar (incluye literalmente "More information needed" en varias secciones), y el rendimiento declarado (0,66 de exactitud) esta muy por debajo de lo que ofrecen clasificadores de sentimiento publicos ampliamente validados. Es util como punto de partida para *fine-tuning* adicional o para experimentacion local en CPU, pero no como componente listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT destilado (DistilBERT), 6 capas, 768 de dimension oculta, 12 cabezas de atencion, mas cabeza de clasificacion de secuencias |
| Parametros totales | 66.955.779 (segun safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite del modelo base distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; al ser un modelo de 67 M de parametros, la cuantizacion dinamica INT8 es viable, pero no esta empaquetada en el repositorio) |
| Idiomas soportados | no disponible; el autor no declara idiomas y el modelo base (distilbert-base-uncased) esta entrenado principalmente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiqueta `safetensors` en el repositorio); compatible con la libreria `transformers` |
| Modelo base | distilbert-base-uncased |
| Pipeline | text-classification |
| Numero de etiquetas | no disponible (el autor no documenta el conjunto de clases) |
| Tamano del repositorio | 0,3 GB |
| Framework declarado | Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1 |
| Compatibilidad con Inference Endpoints | si (etiqueta `endpoints_compatible`) |
| Fecha de creacion / actualizacion | 2026-09-26 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente a DistilBERT, la variante destilada de BERT-base propuesta por Sanh et al. (2019): 6 capas de transformer en lugar de 12, 768 unidades ocultas, 12 cabezas de atencion y aproximadamente 66 M de parametros, lo que supone en torno a un 40 % menos de parametros que BERT-base manteniendo, segun el articulo original, alrededor del 97 % de su rendimiento en GLUE. El modelo base es la version *uncased* (vocabulario WordPiece en minusculas, sin distincion de mayusculas). Sobre ese *checkpoint* se anade una cabeza de clasificacion (`DistilBertForSequenceClassification`) cuyo numero de clases no se especifica en la informacion disponible; el recuento total de parametros del repositorio (66.955.779) es coherente con el modelo base mas una cabeza de clasificacion pequena.

El entrenamiento se realizo con el `Trainer` de HuggingFace usando los siguientes hiperparametros declarados: *learning rate* 2e-5, tamano de lote de entrenamiento y de evaluacion 32, 3 epocas, semilla 42, optimizador `ADAMW_TORCH_FUSED` con betas (0,9, 0,999) y epsilon 1e-8, y planificador lineal. Con 58 pasos por epoca y un lote de 32, se deduce un conjunto de entrenamiento de aproximadamente 1.856 ejemplos (calculo derivado de los datos declarados, no confirmado por el autor), lo que constituye un volumen muy reducido para una tarea de clasificacion de sentimiento. No se documenta ningun tipo de ajuste por preferencias (RLHF, DPO), ni destilacion posterior, ni innovaciones tecnicas adicionales. Tampoco se indica si hubo *early stopping* ni que *checkpoint* se selecciono como final.

Hay una inconsistencia relevante entre los numeros declarados: la tabla de resultados de entrenamiento muestra para la epoca 3 una perdida de validacion de 0.7117 y una exactitud de 0.6821, mientras que el resumen de la model card informa de una perdida de 0.7470 y una exactitud de 0.6598. La discrepancia sugiere que la evaluacion final pudo hacerse sobre un subconjunto distinto o sobre otro *checkpoint*, pero el autor no lo aclara.

## Capacidades

- Clasificacion de texto en una unica etiqueta de sentimiento (positivo/negativo o el conjunto de clases que el autor haya usado; no documentado).
- Inferencia sobre secuencias de hasta 512 tokens, con truncamiento por encima de ese limite.
- Ejecucion en CPU: al tener 67 M de parametros, la inferencia es viable sin GPU, lo que permite despliegues en entornos edge o contenedores ligeros.
- *Fine-tuning* adicional: el modelo puede usarse como punto de partida (`base_model`) para reentrenar con un conjunto de datos propio, ya que es compatible con `Trainer` y con las clases estandar de `transformers`.
- Anotacion previa (*pre-labeling*) de datos: util para clasificar grandes volumenes de texto no etiquetado antes de una revision humana.
- Procesamiento por lotes: al ser un encoder pequeno, permite clasificar lotes grandes de textos en un unico paso.
- No disponible: soporte de *tool calling* o *function calling* (no es un modelo generativo ni de instrucciones).
- No disponible: capacidades de agente, razonamiento multi-paso, generacion de texto, codigo o matematicas.
- No disponible: modalidad de vision o audio (modelo exclusivamente de texto).
- No disponible: modo "thinking" o cualquier mecanismo de razonamiento explicito.
- Capacidades multilingues: no disponibles; el modelo base es *uncased* en ingles y el autor no declara idiomas soportados.

## Casos de uso

- Clasificacion por lotes de resenas de producto en comercio electronico: el modelo puede etiquetar miles de resenas almacenadas en una base de datos para construir paneles agregados de satisfaccion por producto o categoria. Es adecuado por su bajo coste computacional, aunque requiere validar la exactitud real sobre el dominio concreto antes de automatizar decisiones.
- Triaje de tickets de soporte: asignar automaticamente un sentimiento (frustrado/neutro/satisfecho) a cada ticket entrante para priorizar colas de atencion. La ventana de 512 tokens cubre la mayoria de mensajes de soporte y el modelo puede ejecutarse en CPU junto al sistema de ticketing.
- Monitorizacion de menciones de marca en redes sociales: procesar en tiempo casi real un flujo de publicaciones cortas y agregar la polaridad por dia o por campana. Su tamano permite desplegarlo en una instancia pequena sin GPU.
- Analisis de respuestas abiertas en encuestas (NPS, CSAT): convertir comentarios libres en categorias de sentimiento para cruzar con la puntuacion numerica. El modelo puede actuar como primera pasada y derivar a revision humana los casos con baja confianza.
- Enrutado en flujos de atencion al cliente automatizada: usar el sentimiento detectado como variable de decision para dirigir una conversacion a un agente humano o a una respuesta automatica. Se usaria como componente de clasificacion dentro de un pipeline mayor, no como generador de respuestas.
- Pre-anotacion de conjuntos de datos para investigacion: etiquetar corpus grandes antes del etiquetado humano, reduciendo el coste de anotacion. El modelo es facil de ajustar despues con las correcciones humanas.
- Prototipado rapido y docencia: por su licencia Apache 2.0 y su bajo coste de ejecucion, sirve como ejemplo reproducible de *fine-tuning* de DistilBERT en cursos o tutoriales.
- Experimentos de clasificacion en entornos con recursos muy limitados: contenedores sin GPU, dispositivos de borde o funciones serverless con poca memoria, donde un modelo de 67 M de parametros cabe holgadamente.

## Benchmarks y rendimiento

La model card no incluye ningun resultado en el `model-index` (la lista de resultados esta vacia). Los unicos datos disponibles son las metricas de la evaluacion declaradas por el autor, que se reproducen aqui tal cual:

| Metrica | Valor declarado |
|---|---|
| Loss (evaluacion final) | 0.7470 |
| Accuracy (evaluacion final) | 0.6598 |
| F1 weighted | 0.6493 |
| F1 macro | 0.6493 |

Evolucion durante el entrenamiento (datos de la model card):

| Training loss | Epoca | Paso | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1.0498 | 1.0 | 58 | 0.8737 | 0.6080 | 0.5529 | 0.5529 |
| 0.8304 | 2.0 | 116 | 0.7226 | 0.6975 | 0.6881 | 0.6881 |
| 0.6785 | 3.0 | 174 | 0.7117 | 0.6821 | 0.6736 | 0.6736 |

No se han publicado resultados de benchmarks estandar (GLUE, SST-2, IMDB, etc.) en la informacion disponible. No se dispone de datos sobre el conjunto de evaluacion (tamano, composicion, idioma ni distribucion de clases), por lo que los valores anteriores no son extrapolables a ningun dominio concreto.

## Requisitos de hardware

- VRAM en FP32: aproximadamente 268 MB solo para los pesos (66.955.779 parametros x 4 bytes), mas activaciones y memoria del *runtime*; en la practica cabe en cualquier GPU con 1-2 GB libres.
- VRAM en FP16/BF16: aproximadamente 134 MB de pesos, mas el sobrecoste del *runtime* de PyTorch.
- INT8: aproximadamente 67 MB de pesos si se aplica cuantizacion dinamica (no publicada en el repositorio, pero tecnicamente factible).
- Cabe sobradamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 o inferiores; tambien en GPUs integradas y en CPU exclusivamente.
- No requiere A100 ni H100; usarlas no aporta ventaja relevante para un modelo de este tamano.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), HuggingFace Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`), ONNX Runtime o TorchScript para reducir latencia en CPU, y servidores propios con FastAPI o similares.
- vLLM, TGI y llama.cpp/Ollama no son la via estandar para un DistilBERT de clasificacion: estan orientados a modelos generativos y no soportan de forma nativa esta cabeza de clasificacion. Para CPU, la ruta recomendada es `transformers` con cuantizacion dinamica u ONNX Runtime.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de latencia ni de ejemplos por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Dilshan50/sentiment-model | 66.955.779 | 512 tokens | Clasificacion de sentimiento (clases no documentadas) | Apache 2.0 | Accuracy 0,6598 y F1 0,6493 en un conjunto de evaluacion no documentado |
| distilbert-base-uncased (modelo base) | ~66,9 M | 512 tokens | Modelo preentrenado sin cabeza de tarea | Apache 2.0 | No aplica (no es un clasificador ajustado); referencia GLUE en el articulo de DistilBERT |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Clasificacion de sentimiento binaria (SST-2) | Apache 2.0 | No disponible en la informacion de esta ficha |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M (RoBERTa-base) | 512 tokens | Clasificacion de sentimiento en 3 clases, dominio Twitter | No verificada en esta ficha | No disponible en la informacion de esta ficha |

La comparacion se limita a parametros, contexto, tarea y licencia porque no se han proporcionado resultados de benchmarks de los modelos alternativos. En igualdad de condiciones de documentacion, los tres clasificadores alternativos cuentan con model cards completas, conjuntos de datos declarados y conjuntos de evaluacion publicos, a diferencia de este modelo.

## Limitaciones y advertencias

- Rendimiento bajo para produccion: una exactitud de 0,6598 y un F1 de 0,6493 sobre un conjunto de evaluacion no documentado estan muy por debajo de lo exigible a un clasificador de sentimiento desplegado en un flujo real.
- Conjunto de datos desconocido: la model card indica explicitamente "unknown dataset". Se desconoce el dominio, el idioma, el tamano (se estiman ~1.856 ejemplos), el equilibrio de clases y el origen de los datos, lo que impide evaluar sesgos y generalizacion.
- Numero de clases no documentado: no se sabe si el modelo distingue 2, 3 o mas categorias de sentimiento.
- Inconsistencia en las metricas: el resumen de la model card (accuracy 0,6598, loss 0,7470) no coincide con la ultima fila de la tabla de entrenamiento (accuracy 0,6821, loss 0,7117).
- Model card incompleta: secciones como "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen "More information needed".
- Idioma: el autor no declara idiomas soportados y el vocabulario del modelo base es *uncased* en ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Limite de contexto: secuencias de mas de 512 tokens se truncan, lo que puede eliminar informacion relevante en documentos largos y sesgar la prediccion.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente en dominios alejados del conjunto de entrenamiento.
- Sesgos: no evaluados ni documentados. Al desconocerse el corpus de entrenamiento, no se puede descartar sesgo de dominio, de registro linguistico o demografico.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. No impone restricciones de uso, pero tampoco ofrece garantias.
- Madurez y validacion de la comunidad: cero descargas y cero "me gusta" en el momento de redactar esta ficha; no hay evidencia de uso externo ni de validacion independiente.
- Fechas de metadatos inusuales (creacion y actualizacion en 2026) y versiones de framework declaradas no habituales (Transformers 5.16.1, PyTorch 2.11.0); conviene verificar la reproducibilidad del entorno antes de integrarlo.
- Recomendacion operativa: no desplegar en produccion sin un *fine-tuning* o una validacion propia sobre datos del dominio objetivo, y en cualquier caso acompanar las decisiones automaticas de un umbral de confianza y de revision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dilshan50/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con este modelo. Corresponden al operador de transporte publico STAR de la metropolis de Rennes (https://www.star.fr/ y subdominios asociados), por lo que no se incluyen como referencias. No se han encontrado papers, blogs, repositorios ni demos adicionales especificos de Dilshan50/sentiment-model. Como referencias del modelo base, pueden consultarse el articulo original de DistilBERT (arXiv:1910.01108) y el de BERT (arXiv:1810.04805), aunque no proceden de la busqueda realizada.
