# Kiraashado/dl2-hw2-ner

## Resumen

dl2-hw2-ner es un modelo de clasificación de tokens (token classification) publicado en HuggingFace por el usuario Kiraashado. Se trata de un ajuste fino del encoder BAAI/bge-small-en-v1.5, un transformer tipo BERT de 33.215.625 parámetros, orientado a tareas de reconocimiento de entidades nombradas (NER). Los pesos se distribuyen en formato safetensors dentro de un repositorio de 0,1 GB y con licencia MIT.

El modelo se ha entrenado durante 3 epocas con un learning rate de 2e-05, batch de 16 y el optimizador AdamW, y alcanza en su conjunto de evaluacion un F1 de 0,8644, una precision de 0,8429, un recall de 0,8869 y una accuracy de 0,9744. La model card es la generada automaticamente por el Trainer de transformers: no documenta el dataset de entrenamiento, el conjunto de etiquetas de entidades ni los idiomas cubiertos, y el campo de resultados del model-index esta vacio.

Su relevancia practica es limitada: se trata, por el nombre del repositorio (dl2-hw2), de un ejercicio academico de fine-tuning sobre un encoder pequeno, sin descargas ni interacciones en el momento de redactar esta ficha. Resulta util como referencia de como adaptar un modelo de embeddings como bge-small a una tarea de etiquetado de secuencias, pero no como componente listo para produccion sin una validacion previa del dominio y de las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder) con cabeza de clasificacion de tokens, derivado de BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base, un BERT de 12 capas y 384 dimensiones ocultas) |
| Tipos de cuantizacion | no disponible en el repositorio; al ser un modelo transformers, admite cuantizacion a int8/fp16 mediante librerias externas (ONNX Runtime, Optimum, bitsandbytes) |
| Idiomas soportados | no disponible (el modelo base BAAI/bge-small-en-v1.5 esta orientado al ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer tipo BERT con una cabeza de clasificacion por token, inicializada a partir de BAAI/bge-small-en-v1.5. Ese modelo base es un encoder de 33 millones de parametros, 12 capas y 384 dimensiones ocultas, originalmente entrenado por BAAI como modelo de embeddings de texto en ingles. El ajuste fino anade la cabeza de token classification y reutiliza el cuerpo del encoder, de modo que el coste computacional de inferencia es el de un BERT pequeno.

Los hiperparametros de entrenamiento documentados son: learning rate 2e-05, train_batch_size 16, eval_batch_size 16, semilla 42, optimizador AdamW (betas 0.9 y 0.999, epsilon 1e-08), scheduler lineal, 3 epocas y 1875 pasos totales. Las versiones de framework empleadas fueron Transformers 4.50.0, PyTorch 2.6.0+cu124, Datasets 3.4.1 y Tokenizers 0.21.4. No se especifica el dataset de entrenamiento ni de evaluacion, no se documenta la composicion de etiquetas de entidades y no hay constancia de fases de RLHF, DPO ni de ninguna innovacion tecnica adicional.

La evolucion de la perdida y de las metricas por epoca muestra una convergencia estable sin signos de sobreajuste evidente en los valores reportados: la perdida de validacion pasa de 0,1932 en la epoca 1 a 0,1198 en la epoca 3, mientras el F1 sube de 0,7646 a 0,8644 y la accuracy de 0,9579 a 0,9744.

## Capacidades

- Etiquetado de secuencias: clasificacion por token orientada a reconocimiento de entidades nombradas (NER), la tarea declarada en el pipeline del repositorio.
- Extraccion de entidades sobre texto en el dominio del dataset de entrenamiento (no documentado).
- Inferencia rapida por su tamano reducido (33 millones de parametros) y su ventana de 512 tokens.
- Compatibilidad con el ecosistema transformers: carga directa con AutoModelForTokenClassification y AutoTokenizer.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el modelo base esta centrado en ingles.
- Capacidades de vision, audio o modo de razonamiento explicito: no disponibles.

## Casos de uso

- Extraccion de entidades en textos del dominio de entrenamiento: el modelo puede etiquetar secuencias token a token con la cabeza de clasificacion entrenada; es imprescindible verificar antes que las etiquetas del dataset original coinciden con las del caso de uso real.
- Preanotacion de corpus para anotacion humana: sirve como primer paso de un flujo de anotacion asistida, generando etiquetas que despues revisa una persona, dado su bajo coste de inferencia en CPU o GPU modesta.
- Prototipado docente y aprendizaje: por su origen academico, es util como ejemplo reproducible de fine-tuning de un encoder BERT para token classification con el Trainer de transformers.
- Servicio de inferencia ligero: puede desplegarse en un contenedor de menos de 1 GB de memoria y procesar peticiones HTTP de clasificacion de entidades con latencia baja.
- Comparacion de estrategias de fine-tuning: al existir la traza completa de epocas, permite estudiar el efecto del numero de epocas en precision y recall en una tarea de etiquetado.
- Filtrado y enrutado de textos: integrado en un pipeline previo, puede marcar documentos que contienen ciertos tipos de entidad antes de pasarlos a un modelo mayor, reduciendo el coste total del sistema.
- Analisis exploratorio de datos textuales: extraccion de menciones de entidad en lotes pequenos de documentos para tareas de analisis interno, siempre con validacion manual de los resultados.

## Benchmarks y rendimiento

El model-index publicado por el autor no contiene resultados (`"results": []`). Los unicos datos disponibles son las metricas del conjunto de evaluacion recogidas en la model card, que se reproducen a continuacion sin alteracion.

| Metrica | Epoca 1 (paso 625) | Epoca 2 (paso 1250) | Epoca 3 (paso 1875) |
|---|---|---|---|
| Training loss | 0,4894 | 0,1882 | 0,1391 |
| Validation loss | 0,1932 | 0,1319 | 0,1198 |
| Precision | 0,7403 | 0,8343 | 0,8429 |
| Recall | 0,7906 | 0,8748 | 0,8869 |
| F1 | 0,7646 | 0,8541 | 0,8644 |
| Accuracy | 0,9579 | 0,9727 | 0,9744 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, CoNLL-2003 u otros) en la informacion disponible, ni comparaciones frente a otros modelos de NER.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (unos 133 MB de pesos) y del orden de 66 MB en fp16, mas el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100; no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer actual, y tambien en CPU para cargas moderadas.
- Opciones de despliegue: pipeline de transformers, exportacion a ONNX con Optimum y ejecucion con ONNX Runtime, TorchScript, o un servicio propio (por ejemplo FastAPI) envolviendo el pipeline. vLLM y Text Embeddings Inference no estan orientados a este tipo de cabeza de clasificacion de tokens.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: repositorio de 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kiraashado/dl2-hw2-ner | 33,2 M | 512 tokens | Token classification (NER), dominio no documentado | MIT | HuggingFace, 0 descargas |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | Embeddings de texto (no NER) | MIT | HuggingFace, ampliamente usado |
| dslim/bert-base-NER | 109 M | 512 tokens | NER en ingles (etiquetas Person, Organization, Location, Miscellaneous) | no disponible | HuggingFace, muy usado |
| Davlan/distilbert-base-multilingual-cased-ner-hrl | 135 M | 512 tokens | NER multilingue (10 idiomas) | Apache-2.0 | HuggingFace, ampliamente usado |

La comparacion debe interpretarse con cautela: los dos modelos de NER de referencia tienen etiquetas y dominios documentados, mientras que dl2-hw2-ner no publica ni su conjunto de etiquetas ni su dataset, de modo que no es posible una comparacion de rendimiento homogenea.

## Limitaciones y advertencias

- Dataset de entrenamiento y de evaluacion no documentados: se desconoce el dominio, el idioma real de los datos y el conjunto de etiquetas, por lo que no se puede garantizar un comportamiento correcto fuera del reparto original.
- Model card autogenerada: los campos "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen literalmente "More information needed".
- Idiomas soportados no declarados: el modelo base esta centrado en ingles, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos de etiquetado: con un recall de 0,8869 y una precision de 0,8429 sobre un conjunto no identificado, es esperable un numero no despreciable de entidades mal asignadas.
- Sesgos: al no documentarse la procedencia de los datos, no es posible auditar sesgos demograficos, geograficos o de dominio.
- Licencia MIT: permite uso comercial y modificacion, pero no exime de validar el modelo ni de asumir la responsabilidad sobre los resultados.
- Advertencia para produccion: con 0 descargas, 0 likes y ausencia de metricas estandar, no existe evidencia externa de robustez; su uso en produccion deberia ir precedido de una evaluacion propia sobre datos representativos y de la congelacion del commit concreto del repositorio.
- Ventana de contexto de 512 tokens: los documentos largos requieren segmentacion previa, lo que puede partir entidades y degradar las metricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kiraashado/dl2-hw2-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
