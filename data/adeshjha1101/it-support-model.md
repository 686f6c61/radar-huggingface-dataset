# AdeshJha1101/it-support-model

## Resumen

it-support-model es un modelo de clasificación de texto publicado por el usuario AdeshJha1101 en HuggingFace. Se trata de un ajuste fino (fine-tuning) supervisado de distilbert/distilbert-base-uncased, un transformer encoder de la familia BERT en su variante destilada, orientado a la clasificación de consultas o tickets de soporte técnico (IT support). El modelo tiene 66.956.548 parámetros totales y se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El interés de esta ficha es limitado pero útil como caso de estudio: se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin model card completada (las secciones de descripción, usos previstos y datos de entrenamiento figuran como "More information needed") y con métricas de evaluación muy bajas. En el conjunto de evaluación declarado por el propio autor alcanza una exactitud (accuracy) de 0,4, una precisión de 0,4667, un recall de 0,4 y un F1 de 0,3667, con una pérdida de 1,2334.

Por tanto, no se recomienda su uso en producción sin un reentrenamiento y una evaluación rigurosos. Resulta relevante únicamente como ejemplo de pipeline de fine-tuning generado automáticamente con el Trainer de Transformers, y como advertencia sobre los riesgos de publicar clasificadores entrenados con conjuntos de datos minúsculos y sin documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base); 6 capas, 12 cabezas de atencion, dimension oculta 768 |
| Parametros totales | 66.956.548 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (max_position_embeddings de distilbert-base-uncased); no confirmado de forma explicita en la model card |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; al ser un modelo de 67 M de parametros, la cuantizacion es en la practica innecesaria) |
| Idiomas soportados | No disponible en la model card. El modelo base distilbert-base-uncased emplea un tokenizador WordPiece en ingles sin distincion de mayusculas/minusculas, por lo que el ajuste fino se realizo casi con certeza sobre texto en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien compatible con la libreria transformers; el repositorio incluye la etiqueta text-embeddings-inference y endpoints_compatible) |
| Libreria | transformers |
| Tarea (pipeline) | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repositorio | 0,3 GB |
| Numero de etiquetas | No disponible |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, es decir, un transformer encoder de 6 capas obtenido mediante destilacion del conocimiento de BERT-base (12 capas, 110 M de parametros). Conserva la arquitectura original de BERT: atencion multi-cabeza bidireccional, embeddings posicionales aprendidos y una cabeza de clasificacion sobre el token [CLS]. Con 66,9 M de parametros, es aproximadamente un 40 % mas pequeno y un 60 % mas rapido que BERT-base, manteniendo segun sus autores alrededor del 97 % de las capacidades de comprension del lenguaje del modelo profesor (dato del modelo base original, no verificado en este ajuste concreto).

El entrenamiento se realizo con el Trainer de Transformers a partir de un dataset no identificado ("None dataset" en la model card). Los hiperparametros documentados son: tasa de aprendizaje 2e-05, tamano de lote de entrenamiento y evaluacion de 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, planificador lineal, 10 epocas y precision mixta con AMP nativo. El registro de pasos es revelador: se completaron 30 pasos de entrenamiento en total, es decir 3 pasos por epoca, lo que implica un maximo de 24 ejemplos de entrenamiento por epoca. No se documento ningun proceso de RLHF, DPO ni ninguna innovacion tecnica adicional mas alla del propio ajuste fino supervisado. El modelo fue entrenado con Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de texto: es la unica capacidad real del modelo, dado que la cabeza de clasificacion se ajusto sobre distilbert-base-uncased para la tarea text-classification.
- Clasificacion de consultas o tickets de soporte IT: ese es el uso que sugiere el nombre del modelo, aunque la model card no especifica el conjunto de etiquetas ni la taxonomia objetivo.
- Comprension de texto en ingles: heredada del modelo base uncased, con tokenizacion WordPiece en minusculas.
- Representaciones contextuales de hasta 512 tokens: util para clasificar fragmentos cortos o medios de texto.
- No soporta generacion de texto: es un modelo encoder-only, sin cabeza de lenguaje causal.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni multimodalidad.
- No se documentan capacidades multilingues.

## Casos de uso

- Clasificacion de tickets de helpdesk: el modelo puede asignar una categoria a una incidencia de soporte tecnico en ingles (por ejemplo, red, hardware, software), siempre que se reentrene con un conjunto de datos etiquetado lo bastante grande y se validen las metricas por clase.
- Enrutado automatico de correos de soporte: dado su tamano reducido, puede desplegarse como clasificador previo que derive cada mensaje al equipo correspondiente antes de que intervenga un modelo generativo, reduciendo coste por token.
- Etiquetado asistido en pipelines de datos: puede usarse como anotador preliminar dentro de un flujo de anotacion humana, donde un revisor corrige las predicciones del modelo para acelerar el etiquetado de nuevos datos.
- Prototipado rapido de clasificadores: sirve como plantilla de referencia para montar un pipeline completo de fine-tuning con el Trainer de Transformers, incluido el registro de metricas y el guardado en safetensors.
- Analisis de sentimiento o urgencia en mensajes de soporte: con un reajuste adecuado sobre datos propios, la arquitectura es valida para clasificar la tonalidad o la prioridad de una incidencia.
- Filtrado de spam o de consultas fuera de alcance: util para descartar mensajes no relacionados con el soporte tecnico antes de pasarlos a un sistema mas costoso.
- Inferencia en CPU o en dispositivos con recursos muy limitados: con 66,9 M de parametros, el modelo puede ejecutarse en un contenedor pequeno o incluso en una Raspberry Pi, algo inviable con alternativas generativas.
- Servicio de embeddings/clasificacion de baja latencia: la etiqueta text-embeddings-inference del repositorio indica compatibilidad con ese motor de inferencia, adecuado para desplegar clasificadores de texto con latencias de milisegundos.

Advertencia importante: ninguno de estos casos de uso es viable hoy con los pesos publicados, dadas las metricas de 0,4 de exactitud y la ausencia de documentacion sobre el conjunto de etiquetas y los datos de evaluacion.

## Benchmarks y rendimiento

El model-index oficial del repositorio esta vacio (`"results": []`), por lo que no hay resultados de benchmarks declarados en el formato estandar de HuggingFace. La model card si incluye las metricas del conjunto de evaluacion obtenidas durante el entrenamiento. Se reproducen a continuacion tal cual, sin modificaciones:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 1,2334 |
| Accuracy | 0,4 |
| Precision | 0,4667 |
| Recall | 0,4 |
| F1 | 0,3667 |

Evolucion por epoca segun la tabla de resultados de entrenamiento de la model card:

| Epoca | Paso | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| 1,0 | 3 | 1,3787 | 0,2 | 0,04 | 0,2 | 0,0667 |
| 2,0 | 6 | 1,3656 | 0,4 | 0,45 | 0,4 | 0,3467 |
| 3,0 | 9 | 1,3498 | 0,6 | 0,6 | 0,6 | 0,5333 |
| 4,0 | 12 | 1,3305 | 0,4 | 0,45 | 0,4 | 0,3467 |
| 5,0 | 15 | 1,3096 | 0,4 | 0,45 | 0,4 | 0,3467 |
| 6,0 | 18 | 1,2867 | 0,4 | 0,45 | 0,4 | 0,3467 |
| 7,0 | 21 | 1,2664 | 0,4 | 0,4667 | 0,4 | 0,3667 |
| 8,0 | 24 | 1,2494 | 0,4 | 0,4667 | 0,4 | 0,3667 |
| 9,0 | 27 | 1,2380 | 0,4 | 0,4667 | 0,4 | 0,3667 |
| 10,0 | 30 | 1,2334 | 0,4 | 0,4667 | 0,4 | 0,3667 |

No hay benchmarks comparativos (MMLU, GLUE, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El mejor resultado intermedio se alcanza en la epoca 3 (accuracy 0,6), y a partir de ahi las metricas caen y se estancan en 0,4, un patron compatible con sobreajuste sobre un conjunto de datos muy reducido.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,27 GB para los pesos, mas activaciones; cabe holgadamente en cualquier GPU con 2 GB o mas.
- VRAM para inferencia en fp16: aproximadamente 0,14 GB de pesos.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 estan enormemente sobredimensionadas para este modelo. El despliegue tipico es en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU sin aceleracion dedicada.
- Opciones de despliegue: transformers (PyTorch) de forma nativa, text-embeddings-inference (etiqueta presente en el repositorio), FastAPI o Flask con ONNX Runtime, TorchServe y Hugging Face Inference Endpoints (etiqueta endpoints_compatible). No hay conversion a GGUF ni a Ollama documentada, aunque llama.cpp soporta arquitecturas BERT para embeddings.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Como referencia cualitativa, DistilBERT esta disenado para ser unas 1,6 veces mas rapido que BERT-base, pero esta cifra corresponde al modelo base y no ha sido verificada en este ajuste.
- Almacenamiento: el repositorio ocupa 0,3 GB, incluidos pesos y ficheros auxiliares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| AdeshJha1101/it-support-model | 66,9 M | 512 tokens | Clasificacion de texto (soporte IT) | Apache 2.0 | Accuracy 0,4; F1 0,3667 (conjunto de evaluacion del autor) |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base preentrenado (enmascarado) | Apache 2.0 | No aplica (modelo base, no clasificador) |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Clasificacion de sentimiento binaria | Apache 2.0 | No disponible en esta busqueda |
| bert-base-uncased | 110 M | 512 tokens | Modelo base preentrenado (enmascarado) | Apache 2.0 | No aplica (modelo base) |

No se dispone de datos de benchmark verificables de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, tarea y licencia. Cualquier clasificador de texto ajustado sobre un conjunto de datos etiquetado y suficientemente grande (por ejemplo, sobre el corpus de tickets propio de una organizacion) partira con ventaja frente a este ajuste.

## Limitaciones y advertencias

- Rendimiento pobre y no utilizable en produccion: accuracy de 0,4, F1 de 0,3667 y precision de 0,4667. En un problema de clasificacion con muchas clases, estos valores pueden ser cercanos o inferiores a los de un clasificador aleatorio.
- Sobreajuste severo: solo 30 pasos de entrenamiento en 10 epocas (3 pasos por epoca, lote de 8), lo que implica un maximo de 24 ejemplos por epoca. La perdida de validacion se estanca en 1,2334 y no mejora tras la epoca 3.
- Sin documentacion de datos: la model card indica "None dataset" y deja como "More information needed" las secciones de descripcion, usos previstos y datos de entrenamiento. Es imposible saber que etiquetas predice el modelo, como se recogieron los datos ni si existen sesgos en ellos.
- Sin model-index: no hay resultados de benchmarks declarados en formato estandar.
- Riesgo de sesgo desconocido: al no documentarse la procedencia de los datos, no se puede evaluar el sesgo de genero, raza, idioma o dominio. El modelo base uncased se entreno sobre texto mayoritariamente en ingles de fuentes web, con los sesgos asociados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones incorrectas con alta confianza, especialmente en clases poco representadas.
- Limitacion idiomatica: casi con total seguridad el modelo funciona mal fuera del ingles, dado que el tokenizador y el preentrenamiento del modelo base son en ingles. La model card no declara idiomas soportados.
- Limitacion de contexto: 512 tokens como maximo; los textos mas largos deben truncarse, con la consiguiente perdida de informacion.
- Sin caso de uso recomendado: la model card no define usos previstos ni usos prohibidos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de copyright y de indicar los cambios realizados. La licencia no exime de responsabilidad por el mal funcionamiento del modelo.
- Cifras de descargas y likes nulas (0 y 0), lo que indica ausencia de validacion por parte de la comunidad.
- Fecha de publicacion poco habitual (19 de septiembre de 2026), coherente con un repositorio de pruebas o de caracter academico en lugar de un modelo consolidado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdeshJha1101/it-support-model
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert/distilbert-base-uncased
- Aviso sobre la busqueda web: las consultas realizadas devolvieron unicamente resultados sin relacion con el modelo (paginas de venta de entradas para conciertos). No se han encontrado papers, blogs, repositorios de codigo ni demos asociados a este modelo en la informacion disponible.
