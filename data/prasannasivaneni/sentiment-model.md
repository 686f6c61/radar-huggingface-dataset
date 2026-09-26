# prasannasivaneni/sentiment-model

## Resumen

sentiment-model es un modelo de clasificacion de texto publicado en HuggingFace por el usuario prasannasivaneni. Se trata de un fine-tuning de distilbert-base-uncased realizado con la clase Trainer de la libreria transformers, orientado a analisis de sentimiento. Cuenta con 66.955.779 parametros, pesos en formato safetensors y licencia Apache 2.0, lo que en principio permite uso comercial sin restricciones adicionales.

El modelo es un ejemplo tipico de ajuste de un encoder pequeno para clasificacion: se entreno durante 3 epocas con learning rate 2e-5, batch de 32 y optimizador AdamW fused, alcanzando una exactitud declarada de 0,6598 y un F1 ponderado de 0,6493 sobre un conjunto de evaluacion cuyo origen no se documenta. La model card esta generada automaticamente y sin completar: no especifica el dataset de entrenamiento, los idiomas, el numero de clases ni los usos previstos.

Su relevancia practica es limitada. Con 0 descargas y 0 likes en el momento de la consulta, y con unas metricas claramente por debajo del estado del arte en analisis de sentimiento (los modelos DistilBERT ajustados sobre SST-2 suelen superar el 90 % de exactitud), debe considerarse un experimento academico o una plantilla de pipeline de fine-tuning, no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilacion de BERT-base), con cabeza de clasificacion de secuencias |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite posicional heredado de distilbert-base-uncased; no declarado en la model card) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en fp32; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible en la model card; el modelo base distilbert-base-uncased esta entrenado sobre corpus en ingles y no distingue mayusculas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de distilbert-base-uncased, un encoder transformer de 6 capas, 768 dimensiones ocultas y 12 cabezas de atencion, destilado de BERT-base mediante destilacion de conocimiento. Sobre esa base se anade una cabeza de clasificacion de secuencias, lo que da los 66,9 millones de parametros que declara el repositorio (frente a los 110 millones de BERT-base). El tokenizador es WordPiece con un vocabulario de 30.522 piezas y un limite de 512 tokens por secuencia.

El entrenamiento consistio en 3 epocas completas con 174 pasos totales (58 pasos por epoca), learning rate 2e-5 con scheduler lineal, batch de 32, semilla 42 y optimizador AdamW fused con betas (0,9 / 0,999). Por el numero de pasos se deduce un conjunto de entrenamiento de aproximadamente 1.856 ejemplos por epoca, pero la composicion y el origen del dataset no se especifican en ningun punto de la model card. No hay fases de RLHF, DPO ni ajuste por preferencias: es un fine-tuning supervisado clasico. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de texto: el unico pipeline declarado es text-classification, aplicado a la tarea de analisis de sentimiento.
- Entrada de texto plano en ingles (heredado del modelo base, entrenado sobre corpus en ingles y con tokenizacion uncased).
- Secuencias de hasta 512 tokens, suficiente para resenas, tweets, correos o parrafos cortos.
- Salida de logits por clase mediante AutoModelForSequenceClassification; el numero de clases no esta documentado.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: es un encoder de clasificacion, no un modelo causal.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No hay evidencia de capacidades multilingues.

## Casos de uso

- Analisis de sentimiento de resenas de producto en ingles: el modelo clasifica el texto de cada resena en una pasada de hasta 512 tokens, lo que permite procesar lotes grandes con muy poco coste de computo (67 millones de parametros).
- Triaje de tickets de soporte: clasificar el tono de los mensajes entrantes para priorizar incidencias negativas, siempre acompanado de revision humana dado el nivel de exactitud declarado (0,6598).
- Monitorizacion de menciones en redes sociales: procesar flujos de comentarios cortos en ingles para obtener una senal agregada de sentimiento por marca o campana.
- Etiquetado asistido de corpus: usar el modelo como preanotador en un flujo de anotacion humana, reduciendo el esfuerzo inicial antes de entrenar un modelo mayor.
- Filtrado previo en pipelines de moderacion: descartar o marcar contenido negativo antes de pasarlo a un modelo mas caro o a un revisor humano.
- Prototipado y docencia: sirve como plantilla reproducible de fine-tuning con Trainer (learning rate, epocas, batch y semilla documentados) para experimentar con clasificacion de secuencias.
- Investigacion sobre destilacion: permite medir el impacto de un ajuste corto (3 epocas) sobre un encoder destilado y comparar curvas de perdida entrenamiento/validacion.

## Benchmarks y rendimiento

El model-index del autor esta vacio (`results: []`), por lo que no se han publicado resultados de benchmarks estandar (MMLU, GLUE, SST-2, etc.). Unicamente se dispone de las metricas de evaluacion declaradas en la model card, obtenidas sobre un conjunto no documentado:

| Metrica | Valor declarado |
|---|---|
| Loss (evaluacion final) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolucion durante el entrenamiento (datos de la model card):

| Training loss | Epoca | Paso | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1,0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2,0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3,0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

Nota tecnica: los valores de la seccion de evaluacion final (loss 0,7470, accuracy 0,6598) no coinciden con los de la ultima epoca de la tabla de entrenamiento (loss 0,7117, accuracy 0,6821). Esta discrepancia no se explica en la model card. El mejor punto por exactitud es la epoca 2 (0,6975), lo que sugiere que la tercera epoca no aporta mejora.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 270 MB en fp32, 135 MB en fp16 y 70 MB en int8 (calculado a partir de los 66,9 millones de parametros).
- GPU recomendadas: cualquier GPU con mas de 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4090, T4 o incluso una GPU integrada moderna pueden servir el modelo sin problemas. Las A100 o H100 no aportan ventaja apreciable por el tamano reducido.
- Inferencia en CPU: viable y en muchos casos suficiente para cargas moderadas, dado el tamano del modelo.
- Cabe en cualquier GPU de consumo, incluidas las gamas de entrada con 4 GB o menos.
- Opciones de despliegue: pipeline de transformers, ONNX Runtime, TorchScript, TorchServe, Triton Inference Server o un servicio FastAPI con batching. vLLM, TGI y llama.cpp estan pensados para modelos generativos y no aportan ventajas claras aqui.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| prasannasivaneni/sentiment-model | 66,9 M | 512 tokens | Clasificacion de sentimiento | Apache 2.0 | Accuracy 0,6598 (conjunto no documentado) |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 tokens | Clasificacion de sentimiento binaria (SST-2) | Apache 2.0 | no disponible en la informacion proporcionada |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | Clasificacion de sentimiento en redes sociales | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| distilbert-base-uncased (base sin ajustar) | 66,9 M | 512 tokens | Modelo de representaciones general | Apache 2.0 | no aplica (no es clasificador) |

No se dispone de cifras de rendimiento de los modelos comparables dentro de la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, tarea y licencia.

## Limitaciones y advertencias

- Conjunto de evaluacion no documentado: se desconoce el origen, el tamano, el numero de clases y el idioma de los datos, por lo que las metricas no son interpretables fuera de ese contexto.
- Rendimiento bajo: una exactitud de 0,6598 esta muy por debajo de lo esperado en analisis de sentimiento, donde los encoders ajustados superan habitualmente el 90 % en ingles. En muchos datasets de dos o tres clases, ese valor apenas supera la clase mayoritaria.
- Riesgo de sobreajuste: la perdida de entrenamiento baja de 1,0498 a 0,6785 mientras la de validacion se estanca entre 0,72 y 0,87, y la exactitud empeora en la tercera epoca.
- Inconsistencia de metricas: la seccion de evaluacion final y la tabla por epocas no coinciden, lo que impide saber cual es el resultado real del modelo.
- Idiomas: la model card no declara idiomas. El modelo base es uncased y esta entrenado sobre corpus en ingles, por lo que el rendimiento en castellano u otras lenguas es previsiblemente pobre y no esta evaluado.
- Limite de contexto de 512 tokens: textos mas largos deben truncarse o dividirse, lo que puede degradar la clasificacion.
- Sesgos: no se ha publicado ninguna evaluacion de sesgo, toxicidad o disparidad de rendimiento entre subgrupos.
- Alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza; conviene calibrar los umbrales antes de automatizar decisiones.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se ofrece sin garantias y sin soporte del autor.
- Madurez: la model card esta generada automaticamente y sin completar ("More information needed" en descripcion, usos y datos de entrenamiento), el repositorio no tiene descargas ni likes, y las fechas de creacion y actualizacion registradas (2026) resultan atipicas.
- Recomendacion: no usar en produccion sin una evaluacion propia sobre datos representativos del dominio objetivo y sin revision humana en los casos de decision sensible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prasannasivaneni/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
