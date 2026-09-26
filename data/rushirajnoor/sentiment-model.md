# RushiRajnoor/sentiment-model

## Resumen

sentiment-model es un ajuste fino de distilbert-base-uncased publicado por el usuario RushiRajnoor en HuggingFace para la tarea de clasificacion de texto (analisis de sentimiento). Se trata de un encoder transformer de tipo DistilBERT, con 66.955.779 parametros totales segun los pesos safetensors del repositorio, y una ventana de contexto derivada del modelo base de 512 tokens. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

El modelo se genero con el Trainer de HuggingFace a partir de un dataset que el autor no documenta: la model card indica literalmente "an unknown dataset" y deja en "More information needed" las secciones de descripcion, usos previstos y datos de entrenamiento. Esto limita seriamente la evaluacion: no se conocen el numero de clases, las etiquetas, el idioma ni la composicion de los datos.

Aunque la etiqueta del repositorio es text-classification, los resultados declarados por el autor en el conjunto de evaluacion son modestos: accuracy de 0,6598, F1 macro de 0,6493 y perdida de 0,7470 tras 3 epocas, con una perdida de validacion que deja de mejorar en la tercera epoca (0,7226 en la epoca 2 frente a 0,7117 en la epoca 3, con la accuracy bajando de 0,6975 a 0,6821). El modelo cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validacion externa de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base); arquitectura del modelo base distilbert-base-uncased |
| Parametros totales | 66.955.779 (segun safetensors) |
| Longitud de contexto | 512 tokens (maximo posicional del modelo base distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors sin cuantizar |
| Idiomas soportados | no disponible; el autor no los declara. El tokenizador del modelo base es uncased en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,3 GB, libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas, 12 cabezas de atencion y dimension oculta de 768, obtenido por destilacion de BERT-base y al que se anade una cabeza de clasificacion de secuencia. El modelo parte de distilbert-base-uncased segun el campo base_model de la model card y el tag base_model:finetune:distilbert/distilbert-base-uncased. No se documenta ninguna innovacion tecnica adicional (no hay decodificacion especulativa, atencion lineal ni modulos MoE): es un ajuste fino estandar de clasificacion.

El procedimiento de entrenamiento esta parcialmente documentado en los hiperparametros: learning rate 2e-05, batch de entrenamiento y evaluacion de 32, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08 (variante ADAMW_TORCH_FUSED), scheduler lineal y 3 epocas completas. El numero total de pasos fue 174, lo que implica un conjunto de entrenamiento de aproximadamente 1.856 ejemplos con batch 32 (58 pasos por epoca). No se especifica el dataset, el numero de tokens procesados, la composicion de los datos, ni si hubo RLHF, DPO o cualquier otra etapa de alineacion. Las versiones declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de texto: el pipeline declarado es text-classification, orientado a analisis de sentimiento sobre secuencias cortas.
- Inferencia sobre secuencias de hasta 512 tokens del tokenizador del modelo base (uncased en ingles).
- Ejecucion en CPU: con 67 M de parametros, la inferencia no requiere GPU.
- Compatibilidad con el ecosistema transformers y con endpoints_compatible (tag del repositorio), lo que permite servirlo como endpoint de inferencia.
- No hay evidencia documentada de soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generacion de texto libre, codigo, matematicas, vision ni audio. Al ser un encoder de clasificacion, no genera texto.
- Capacidades multilingues: no disponibles; no se declaran idiomas y el tokenizador del modelo base esta entrenado sobre texto en ingles sin distincion de mayusculas.

## Casos de uso

- Clasificacion por lotes de resenas de producto: el modelo se puede aplicar a ficheros CSV de opiniones y etiquetar cada registro en milisegundos por lotes en CPU, sin coste de GPU, para alimentar cuadros de mando de satisfaccion. La precision declarada de 0,6598 obliga a validar antes el umbral de confianza.
- Triaje de tickets de soporte: usar la etiqueta de sentimiento como senal auxiliar para priorizar colas de atencion al cliente y detectar conversaciones con tono negativo. El contexto de 512 tokens limita su uso a mensajes individuales, no a hilos completos.
- Monitorizacion de redes sociales: procesar streams de publicaciones cortas para calcular un indice de sentimiento agregado por marca o hashtag. La ventana de 512 tokens es suficiente para publicaciones tipicas de redes.
- Enrutado previo en pipelines de moderacion de contenido: emplear la salida del clasificador como primera etapa de filtrado, derivando a revision humana o a un modelo mayor los casos con baja confianza.
- Extraccion de caracteristicas para analitica: el encoder subyacente puede usarse para obtener representaciones de frases que alimenten un clasificador posterior especifico del dominio, reentrenando solo la cabeza de clasificacion con datos propios.
- Analisis de encuestas de satisfaccion (NPS, CSAT): clasificar respuestas abiertas de encuestas internas y agruparlas por polaridad para informes periodicos, ejecutando el modelo en local para cumplir requisitos de privacidad de datos.
- Prueba de concepto docente o de investigacion: por su tamano reducido y su licencia permisiva, sirve como ejemplo de ajuste fino de DistilBERT en cuadernos de formacion.

## Benchmarks y rendimiento

El model-index del autor declara una lista de resultados vacia, por lo que no hay benchmarks estandar publicados (ni MMLU, ni GLUE, ni HumanEval, ni GSM8K: no aplican a un clasificador de sentimiento). Los unicos datos disponibles son las metricas de evaluacion declaradas por el autor en la model card.

Resultados finales en el conjunto de evaluacion (declarados por el autor):

| Metrica | Valor |
|---|---|
| Loss | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolucion por epoca (declarada por el autor):

| Training loss | Epoca | Paso | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1.0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2.0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3.0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 268 MB en fp32 (67 M de parametros x 4 bytes) y unos 134 MB en fp16. Sumando activaciones con batch 32 y secuencias cortas, la inferencia completa cabe holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona en RTX 3060, RTX 4090, T4, A100 o H100 sin aprovechar su capacidad; tambien en GPUs integradas y en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer de los ultimos diez anos, e incluso en CPU. El cuello de botella no es la memoria sino el rendimiento del tokenizador en lotes grandes.
- Opciones de despliegue: pipeline de transformers, ONNX Runtime, TorchScript, Text Embeddings Inference (TEI, con soporte de clasificacion de secuencias), vLLM (soporte de modelos de clasificacion) y servidores propios con FastAPI. No hay artefactos GGUF publicados, por lo que el uso directo con llama.cpp u Ollama no esta disponible sin conversion previa (la cabeza de clasificacion no es el caso de uso habitual de esos runtimes).
- Latencia y throughput: no disponible; no hay mediciones publicadas por el autor. Como referencia de orden de magnitud no verificada, un modelo de 67 M de parametros suele procesar lotes en el rango de milisegundos por lote en GPU moderna y decenas de milisegundos por lote en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| RushiRajnoor/sentiment-model | 66.955.779 | 512 tokens | apache-2.0 | Accuracy 0,6598; F1 macro 0,6493 en evaluacion propia (dataset no documentado) | Repositorio HuggingFace, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | no disponible en la informacion proporcionada | 512 tokens (misma arquitectura base) | apache-2.0 | no disponible en la informacion proporcionada | Repositorio HuggingFace ampliamente utilizado |
| bert-base-uncased (ajustado para clasificacion) | no disponible en la informacion proporcionada | 512 tokens | apache-2.0 | no disponible en la informacion proporcionada | Repositorio HuggingFace |
| roberta-base (ajustado para clasificacion) | no disponible en la informacion proporcionada | 514 tokens posicionales en el modelo base | mit | no disponible en la informacion proporcionada | Repositorio HuggingFace |

La comparacion significativa (posicionamiento frente a distilbert-base-uncased-finetuned-sst-2-english en SST-2) no puede establecerse con rigor: los conjuntos de evaluacion son distintos y el autor no documenta el suyo.

## Limitaciones y advertencias

- Precision baja y probablemente proxima a una linea base trivial: un accuracy de 0,6598 con F1 macro igual a F1 weighted (0,6493) sugiere pocas clases y un rendimiento moderado; sin conocer la distribucion de clases no se puede descartar que un clasificador mayoritario obtenga cifras parecidas.
- Dataset de entrenamiento no documentado: la model card indica explicitamente "an unknown dataset" y deja sin rellenar las secciones de descripcion, usos previstos y datos de evaluacion. No se conocen las etiquetas ni el mapeo id2label mas alla del valor por defecto del Trainer.
- Sobrecarga documental: las secciones clave de la model card estan vacias, por lo que no hay declaracion de sesgos, dominios objetivo ni limitaciones conocidas.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de clasificaciones erroneas con confianza alta en dominios distintos al de entrenamiento.
- Idioma: no se declaran idiomas soportados; el tokenizador del modelo base es uncased en ingles, por lo que el comportamiento en castellano u otros idiomas es impredecible.
- Longitud: limite duro de 512 tokens; los documentos o hilos mas largos requieren truncado o troceado, con perdida de contexto.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero la licencia del modelo no cubre los derechos sobre los datos de entrenamiento, que son desconocidos.
- Falta de validacion externa: 0 descargas y 0 likes implican que no hay retroalimentacion de terceros ni reproducibilidad verificada.
- Fechas y versiones anomalas: la fecha de creacion declarada (2026-09-26) y las versiones de framework (Transformers 5.16.1, PyTorch 2.11.0) no se corresponden con releases publicas habituales en el momento de redactar esta ficha; conviene verificar el entorno antes de reproducir el entrenamiento.
- Deriva por epocas: la mejor validacion se obtiene en la epoca 2 (accuracy 0,6975) y empeora en la epoca 3 (0,6821), por lo que los pesos publicados no son los mejores del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RushiRajnoor/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentacion de transformers (pipeline de text-classification): https://huggingface.co/docs/transformers
- Text Embeddings Inference (despliegue de clasificacion): https://github.com/huggingface/text-embeddings-inference
