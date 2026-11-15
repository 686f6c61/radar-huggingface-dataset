# michsethowusu/noun-marker

## Resumen

`noun-marker` es un modelo de clasificación de tokens (token classification) publicado por el usuario michsethowusu en Hugging Face. Se trata de un ajuste fino (fine-tuning) de DistilBERT, concretamente de la variante `distilbert-base-uncased`, orientado a la detección o marcado de sustantivos en texto. El modelo se distribuye bajo licencia Apache 2.0 y con un peso total de 66.365.187 parámetros, lo que corresponde a la arquitectura estándar de DistilBERT (6 capas, 768 dimensiones ocultas).

El modelo resuelve una tarea concreta de etiquetado a nivel de token: identificar sustantivos dentro de una secuencia. Es relevante porque los modelos ligeros de este tipo permiten ejecutar tareas de anotación lingüística en entornos con recursos limitados, con una latencia muy baja y un coste computacional mínimo en comparación con modelos generativos de gran tamaño.

La información disponible es escasa: la model card fue generada automáticamente por el Trainer de Hugging Face, no especifica el conjunto de datos de entrenamiento (aparece como "None dataset") y no incluye descripción funcional ni limitaciones declaradas por el autor. Los resultados de evaluación reportados por el autor son accuracy 0.9439, F1 0.8071, precision 0.7842 y recall 0.8313.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 66.365.187 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (DistilBERT base admite hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base es `uncased`, mayoritariamente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Token classification |
| Modelo base | distilbert-base-uncased |
| Tamano del repositorio | 0.3 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder de tipo BERT destilado, con 6 capas, 12 cabezas de atencion y 66 millones de parametros. Sobre la representacion contextual del encoder se anade una cabeza de clasificacion de tokens, que asigna una etiqueta a cada token de entrada (en este caso, presumiblemente marcado de sustantivos frente a no sustantivos, aunque la model card no detalla las etiquetas).

Los hiperparametros de entrenamiento declarados son: learning rate 3e-05, batch size de entrenamiento 32, batch size de evaluacion 64, acumulacion de gradientes en 2 pasos (batch total 64), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler coseno con 500 pasos de warmup y 10 epocas. El conjunto de datos de entrenamiento no se especifica ("None dataset"), por lo que no es posible conocer su composicion, tamano ni dominio. No se declara el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un modelo discriminativo de este tamano.

## Capacidades

- Clasificacion de tokens a nivel de palabra/subpalabra mediante la tarea `token-classification`.
- Deteccion o marcado de sustantivos en texto (segun el nombre del modelo y la tarea declarada).
- Inferencia rapida y de bajo coste gracias a la arquitectura DistilBERT.
- Compatible con la libreria `transformers` y con `pipeline("token-classification")`.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues no declaradas.

## Casos de uso

- Preprocesado linguistico en pipelines de NLP: el modelo puede etiquetar sustantivos en un corpus antes de tareas posteriores como extraccion de entidades o analisis de sintagmas nominales, aprovechando su bajo coste de inferencia.
- Extraccion de terminos y palabras clave: al marcar sustantivos, se puede usar como filtro previo en sistemas de indexacion o busqueda documental donde interese aislar sintagmas nominales.
- Anotacion asistida de corpus: util como primer paso automatico en proyectos de anotacion linguistica, reduciendo el trabajo manual de etiquetado de sustantivos.
- Enriquecimiento de datos para busqueda: marcar sustantivos en titulos y descripciones para construir indices o features adicionales en motores de busqueda internos.
- Analisis de contenido en tiempo real: al ser un modelo de 66 millones de parametros, puede ejecutarse en CPU o en GPU de gama baja con latencia muy reducida, lo que permite procesar flujos de texto continuos.
- Prototipado rapido en NLP: sirve como linea base para experimentar con tareas de etiquetado secuencial antes de invertir en modelos mayores.
- Filtrado de texto previo a modelos generativos: usar el marcado de sustantivos para seleccionar fragmentos relevantes antes de pasarlos a un LLM, reduciendo el coste de tokens procesados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluacion no especificado):

| Metrica | Valor |
|---|---|
| Loss | 0.1391 |
| Accuracy | 0.9439 |
| F1 | 0.8071 |
| Precision | 0.7842 |
| Recall | 0.8313 |

Evolucion durante el entrenamiento (seleccion de puntos):

| Epoca | Step | Validation loss | Accuracy | F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| 0.1280 | 500 | 0.1525 | 0.9394 | 0.7660 | 0.8485 | 0.6982 |
| 0.5120 | 2000 | 0.1387 | 0.9442 | 0.7986 | 0.8169 | 0.7810 |
| 0.7680 | 3000 | 0.1391 | 0.9439 | 0.8071 | 0.7842 | 0.8313 |
| 1.4078 | 5500 | 0.1346 | 0.9457 | 0.8043 | 0.8227 | 0.7866 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El model-index del autor no contiene resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 265 MB solo para pesos (66,4 M parametros x 4 bytes), mas overhead de activaciones y tokenizer; en la practica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 133 MB para pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna acelera la inferencia, pero el modelo es viable en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` (pipeline de token classification), Hugging Face Inference Endpoints (tag `endpoints_compatible`), y en general cualquier runtime compatible con safetensors y transformers. No se declara soporte explicito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras declaradas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| noun-marker (este modelo) | 66,4 M | No disponible | Token classification (sustantivos) | Apache 2.0 | Fine-tuning de DistilBERT; resultados de evaluacion declarados |
| distilbert-base-uncased | 66,4 M | 512 tokens | Modelo base (masked LM) | Apache 2.0 | Modelo base sin cabeza de clasificacion de tokens |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (masked LM) | Apache 2.0 | Mayor tamano y coste; requiere fine-tuning para la tarea |
| bert-base-NER | 110 M | 512 tokens | Token classification (NER) | No disponible en la informacion | Tarea distinta (entidades nombradas) |

La comparativa se limita a modelos de la misma familia y tamano; no se dispone de datos de rendimiento de alternativas especificas para marcado de sustantivos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card fue generada automaticamente y no especifica el conjunto de datos de entrenamiento, las etiquetas ni el dominio de aplicacion.
- No se declaran los idiomas soportados; al derivar de `distilbert-base-uncased`, es probable que este optimizado para ingles, pero no esta confirmado.
- El contexto maximo no se declara; el modelo base admite 512 tokens, pero no se confirma en esta ficha.
- Riesgo de sesgos heredados del corpus de entrenamiento de DistilBERT y del dataset de fine-tuning, que no se documenta.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de errores de etiquetado en dominios alejados de los datos de entrenamiento.
- No se documentan limitaciones de licencia para uso comercial mas alla de la licencia Apache 2.0, que permite uso comercial con atribucion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.
- Los resultados de evaluacion (accuracy 0.9439, F1 0.8071) corresponden a un conjunto de evaluacion no descrito; no deben extrapolarse a otros dominios sin validacion propia.
- No es adecuado para tareas generativas, razonamiento, codigo ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/michsethowusu/noun-marker
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentacion de la tarea token classification en transformers: no disponible en la informacion proporcionada
- Paper de DistilBERT: no disponible en la informacion proporcionada
- Repositorio o demo: no disponible en la informacion proporcionada
