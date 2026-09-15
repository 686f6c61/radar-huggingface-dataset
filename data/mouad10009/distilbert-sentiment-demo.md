# mouad10009/distilbert-sentiment-demo

## Resumen

distilbert-sentiment-demo es un ajuste fino (fine-tuning) del modelo distilbert-base-uncased publicado en HuggingFace por el usuario mouad10009 bajo licencia Apache 2.0. Se trata de un clasificador de texto orientado al análisis de sentimiento, entrenado con la librería Transformers mediante el Trainer estándar y sin documentación adicional sobre el conjunto de datos empleado: la propia model card indica "unknown dataset" y deja las secciones de descripción, usos previstos y datos de entrenamiento como "More information needed".

El modelo conserva la arquitectura original de DistilBERT: un transformer encoder de 6 capas con 768 dimensiones ocultas, 12 cabezas de atención y 66.955.010 parámetros totales (unos 67 millones), lo que lo sitúa en la gama ultraligera de modelos de clasificación. La ventana de contexto está limitada a 512 tokens, heredada del modelo base, y el tokenizador es de tipo uncased (WordPiece, sin distinción de mayúsculas/minúsculas).

Su relevancia práctica es limitada pero clara: es un ejemplo reproducible de fine-tuning de un encoder pequeño para clasificación de sentimiento, con pesos en safetensors y compatibilidad declarada con text-embeddings-inference y endpoints de HuggingFace. Con 0 descargas y 0 "likes" en el momento de la consulta, y con una model card generada automáticamente, debe considerarse un artefacto experimental o de demostración más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, 768 dim. ocultas, 12 cabezas de atencion |
| Parametros totales | 66.955.010 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato entrenado en FP32; al ser un modelo de 66M admite cuantizacion int8/ONNX mediante herramientas externas) |
| Idiomas soportados | No disponible oficialmente; el modelo base distilbert-base-uncased esta entrenado sobre corpus en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; repo de 0.5 GB) |
| Modelo base | distilbert/distilbert-base-uncased (fine-tune) |
| Tarea (pipeline) | text-classification |
| Libreria | transformers |
| Idiomas declarados en la ficha | no disponibles |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de 6 capas obtenido por destilacion del conocimiento de BERT-base (12 capas, ~110M parametros), con 768 dimensiones ocultas, 12 cabezas de atencion y una ventana maxima de 512 tokens. El checkpoint publicado anade una cabeza de clasificacion de secuencia sobre el token especial [CLS] para resolver la tarea de text-classification. El tokenizador asociado es el WordPiece de distilbert-base-uncased (vocabulario en minusculas), por lo que las mayusculas del texto de entrada se normalizan antes de la tokenizacion.

El entrenamiento se realizo con el Trainer de Transformers 4.49.0, PyTorch 2.14.0+cpu, Datasets 3.2.0 y Tokenizers 0.21.4, sobre un dataset no documentado. Los hiperparametros registrados son: learning rate 2e-05, batch size de entrenamiento y evaluacion 16, semilla 42, optimizador AdamW (betas 0,9/0,999, epsilon 1e-08, sin argumentos adicionales), scheduler lineal y 2 epocas completas (1.068 pasos). No se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias, algo coherente con un clasificador de sentimiento. Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de la propia destilacion del modelo base.

Progresion del entrenamiento reportada por el autor:

| Training loss | Epoca | Paso | Validation loss | Accuracy |
|---|---|---|---|---|
| 0,4151 | 1.0 | 534 | 0,3867 | 0,8358 |
| 0,2510 | 2.0 | 1068 | 0,3635 | 0,8612 |

En la evaluacion final la model card declara Loss 0,4256 y Accuracy 0,8452. La discrepancia entre la accuracy de la ultima fila de la tabla (0,8612) y el resultado final (0,8452) no se explica en la documentacion disponible.

## Capacidades

- Clasificacion de texto (text-classification): es la unica tarea declarada en el pipeline del modelo; se espera que devuelva una etiqueta de sentimiento con su puntuacion de confianza, aunque el conjunto exacto de etiquetas no esta documentado.
- Analisis de sentimiento: proposito inferido del nombre del repositorio (distilbert-sentiment-demo) y no de una descripcion explicita del autor, que no aparece en la model card.
- Procesamiento de secuencias de hasta 512 tokens: suficiente para resenas, tweets, titulares, correos cortos o fragmentos de conversacion.
- Inferencia en CPU: los pesos se entrenaron y publicaron con PyTorch 2.14.0+cpu, lo que confirma viabilidad de ejecucion sin GPU.
- Generacion de texto: no soportada (no es un modelo causal/decoder).
- Razonamiento, matematicas, codigo: no soportados.
- Tool calling / function calling: no soportado.
- Capacidades de agente o multi-step reasoning: no soportadas.
- Vision, audio o modo "thinking": no soportados.
- Capacidades multilingues: no declaradas; el modelo base es de lengua inglesa.

## Casos de uso

- Clasificacion de resenas de producto: dado que el modelo admite secuencias de hasta 512 tokens, se puede etiquetar cada resena con su polaridad y agregar los resultados por producto; el coste computacional de 66M de parametros permite procesar lotes grandes en CPU.
- Monitorizacion de menciones en redes sociales: clasificar tweets o comentarios cortos en tiempo real, con un throughput alto por lo reducido del modelo, para alimentar paneles de reputacion de marca.
- Enrutado de tickets de soporte: usar la etiqueta de sentimiento como senal auxiliar para priorizar conversaciones negativas antes de que las atienda un agente humano o un modelo mayor.
- Filtrado previo en pipelines de moderacion: como clasificador de primera etapa barato que descarte contenido neutro y reserve modelos mas caros para los casos dudosos.
- Analisis de encuestas NPS y formularios abiertos: procesar respuestas de texto libre y convertir el sentimiento en una variable numerica para analitica agregada.
- Prototipado y docencia: servir como ejemplo reproducible de fine-tuning de DistilBERT con el Trainer, util para ensenar el flujo completo de ajuste, evaluacion y publicacion en el Hub.
- Servicio de inferencia ligero: el tag text-embeddings-inference y la compatibilidad declarada con endpoints permiten exponerlo como API de clasificacion con un contenedor de recursos minimos.
- Preanotacion de datasets: generar etiquetas iniciales sobre un corpus propio que despues se revisen y corrijan manualmente para entrenar un modelo mayor.

En todos los casos conviene validar primero la semantica de las etiquetas de salida, ya que el autor no documenta el esquema de clases.

## Benchmarks y rendimiento

El model-index publicado por el autor no contiene resultados:

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento son las metricas de evaluacion declaradas en la model card (no comparables directamente con MMLU, HumanEval, GSM8K u otros benchmarks estandar, dado que se trata de un clasificador y no de un modelo generativo):

| Metrica | Valor | Fuente |
|---|---|---|
| Accuracy (evaluacion final) | 0,8452 | Model card del autor |
| Loss (evaluacion final) | 0,4256 | Model card del autor |
| Accuracy (epoca 2, paso 1068) | 0,8612 | Tabla de entrenamiento del autor |
| Validation loss (epoca 2, paso 1068) | 0,3635 | Tabla de entrenamiento del autor |
| Accuracy (epoca 1, paso 534) | 0,8358 | Tabla de entrenamiento del autor |
| Validation loss (epoca 1, paso 534) | 0,3867 | Tabla de entrenamiento del autor |

No se dispone de la composicion del conjunto de evaluacion, por lo que estas cifras no permiten estimar el comportamiento en dominios distintos del dataset de entrenamiento.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 268 MB solo para pesos (66,96M parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 134 MB de pesos; en int8, unos 67 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo esta sobredimensionado para hardware de datacenter; no requiere GPU dedicada.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en iGPU y en placas tipo Raspberry Pi 4/5 en CPU.
- CPU: el autor entreno y publico el modelo con PyTorch 2.14.0+cpu, lo que evidencia que la inferencia en CPU es plenamente viable.
- Opciones de despliegue: pipeline de transformers (TextClassificationPipeline), HuggingFace Inference Endpoints (tag endpoints_compatible), Text Embeddings Inference (tag text-embeddings-inference), exportacion a ONNX/OpenVINO mediante Optimum, y servidores de inferencia genericos. vLLM, llama.cpp, Ollama y TGI no estan orientados a encoders de clasificacion de este tipo y no aparecen declarados por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, un encoder de 6 capas y 66M de parametros suele procesar lotes de cientos de secuencias por segundo en GPU moderna, pero no hay medicion publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mouad10009/distilbert-sentiment-demo | 66.955.010 | 512 tokens | Clasificacion de sentimiento (etiquetas no documentadas) | apache-2.0 | HuggingFace, 0 descargas |
| distilbert/distilbert-base-uncased | 66.955.010 | 512 tokens | Modelo base sin cabeza de tarea | apache-2.0 | HuggingFace (modelo base de referencia) |
| Encoders tipo BERT-base / RoBERTa-base para clasificacion | Aproximadamente 110M - 125M | 512 tokens | Clasificacion y regresion de secuencias | no disponible en la informacion proporcionada | HuggingFace |
| Encoders tipo DeBERTa-v3-base para clasificacion | Aproximadamente 184M | 512 tokens | Clasificacion de secuencias | no disponible en la informacion proporcionada | HuggingFace |

Nota: los datos de los modelos alternativos no provienen de la informacion proporcionada en esta busqueda, salvo el modelo base. La comparacion de rendimiento con alternativas no es posible porque este checkpoint no publica benchmarks ni documenta su dataset de evaluacion.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica explicitamente "unknown dataset", por lo que se desconoce el dominio, el idioma real y el equilibrio de clases.
- Esquema de etiquetas desconocido: no se especifica si la clasificacion es binaria (positivo/negativo) o multiclase, ni el orden de las etiquetas. Es imprescindible inspeccionar id2label y probar el modelo antes de usarlo.
- Model card autogenerada: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen "More information needed"; no hay guia de uso del autor.
- Sin benchmarks publicados: el model-index esta vacio y solo se ofrecen accuracy y loss sobre un conjunto de evaluacion no descrito.
- Inconsistencia de metricas: la accuracy final de la model card (0,8452) no coincide con la de la ultima fila de la tabla de entrenamiento (0,8612); conviene tratarlas con cautela.
- Limitacion de contexto: 512 tokens. Textos mas largos deben truncarse o dividirse, lo que puede degradar la clasificacion de documentos extensos.
- Idioma: el modelo base distilbert-base-uncased esta entrenado sobre corpus en ingles; no hay evidencia de soporte para castellano ni para otros idiomas.
- Tokenizador uncased: se pierde la distincion de mayusculas, lo que puede afectar a textos donde las mayusculas aportan informacion (gritos, entidades, siglas).
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de predicciones mal calibradas o sobreconfiadas fuera del dominio de entrenamiento.
- Sesgos: no se ha realizado ninguna evaluacion de sesgo o toxicidad; el modelo puede reproducir sesgos presentes en su corpus de ajuste, especialmente en dominios como el analisis de opinion sobre personas o grupos.
- Trazabilidad y mantenimiento: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de versiones documentado; es un artefacto experimental sin comunidad de validacion.
- Licencia: apache-2.0, permisiva para uso comercial, pero la ausencia de documentacion sobre el dataset de entrenamiento impide verificar la procedencia y las condiciones de los datos.
- Recomendacion para produccion: no desplegar sin una evaluacion propia sobre datos del dominio objetivo y sin una definicion explicita del mapeo de etiquetas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mouad10009/distilbert-sentiment-demo
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Repositorio del modelo base en la organizacion distilbert: https://huggingface.co/distilbert/distilbert-base-uncased

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces recuperados correspondian a directorios de restaurantes y no guardan relacion con la ficha. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a mouad10009/distilbert-sentiment-demo.
