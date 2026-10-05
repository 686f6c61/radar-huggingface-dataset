# shumast/bge-small-en-v1.5

## Resumen

bge-small-en-v1.5 (repositorio `shumast/bge-small-en-v1.5`) es un modelo de clasificación de tokens (token-classification) obtenido por fine-tuning de `BAAI/bge-small-en-v1.5`, un encoder transformer tipo BERT de pequeño tamano orientado originalmente a recuperacion de informacion. Lo publica el usuario shumast y forma parte del ecosistema transformers, con pesos en safetensors y licencia MIT.

Se trata de un modelo muy pequeno (33.215.625 parametros reales segun los safetensors del repositorio, aproximadamente 0,1 GB de repositorio), lo que lo hace apto para inferencia en CPU y en GPUs de gama baja. Sobre la base de embeddings se anade una cabeza de clasificacion de tokens para tareas tipo NER (reconocimiento de entidades nombradas) u otras etiquetaciones a nivel de token.

Su relevancia practica reside en que demuestra que es posible reutilizar un encoder de recuperacion pequeno como columna vertebral para tareas de etiquetado de secuencias con un coste de entrenamiento e inferencia minimo. La model card es auto-generada por el Trainer y esta incompleta: no documenta el dataset de entrenamiento ni los usos previstos, por lo que la informacion sobre el dominio concreto de aplicacion es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en BERT (tag `bert`); modelo base `BAAI/bge-small-en-v1.5` con cabeza de clasificacion de tokens |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado del modelo base BAAI/bge-small-en-v1.5) |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; convertible a GGUF/ONNX con herramientas externas) |
| Idiomas soportados | ingles (modelo base BAAI/bge-small-en-v1.5); idiomas especificos del fine-tune: no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo BERT (el modelo base `BAAI/bge-small-en-v1.5` deriva de la familia BERT y esta optimizado para generar embeddings de frases), al que se ha acoplado una cabeza de clasificacion de tokens mediante fine-tuning. El resultado es un modelo de etiquetado por token, no un generador de texto: produce una etiqueta por cada token de entrada, lo que lo orienta a tareas de secuencias como NER.

El entrenamiento se realizo con la libreria transformers 4.50.0 sobre PyTorch 2.5.1+cu124 y Datasets 3.4.1, con 5 epocas, learning rate 5e-05, batch de entrenamiento y evaluacion de 8, semilla 42, optimizador AdamW (betas 0.9/0.999, epsilon 1e-08) y scheduler lineal. El dataset de entrenamiento no se especifica en la model card ("unknown dataset"), lo que impide conocer la composicion, el numero de tokens ni el esquema de etiquetas. No se documenta el uso de RLHF, DPO ni otras tecnicas de alineamiento. La model card es auto-generada y no describe innovaciones tecnicas adicionales.

## Capacidades

- Clasificacion de tokens a nivel de secuencia (token-classification), apta para tareas tipo NER y etiquetado BIO.
- Salida por token, no generacion de texto libre.
- Integracion nativa con el pipeline `token-classification` de transformers y con `endpoints_compatible`.
- Capacidad multilingue: no disponible; el modelo base esta orientado a ingles.
- Soporte de tool calling / function calling: no aplica (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia ligera en CPU gracias a su tamano reducido (33M de parametros).

## Casos de uso

- Reconocimiento de entidades nombradas (NER): el modelo etiqueta personas, organizaciones, lugares u otras clases definidas en su entrenamiento sobre texto en ingles, aprovechando el encoder preentrenado de recuperacion.
- Anonimizacion de datos personales: deteccion de entidades sensibles token a token para enmascararlas en pipelines de tratamiento de datos, con coste computacional minimo.
- Etiquetado de campos en documentos: extraccion de campos clave (fechas, importes, identificadores) en texto estructurado o semiestructurado en ingles.
- Preprocesado para pipelines de recuperacion: al derivar de un modelo de embeddings, puede combinarse con busqueda semantica para enriquecer el indexado con metadatos por entidad.
- Clasificacion de secuencias en entornos con recursos limitados: el modelo cabe en CPU y en GPUs de gama baja, lo que permite desplegarlo en edge o en servicios de bajo coste.
- Prototipado rapido de tareas de etiquetado: sirve como baseline ligero antes de escalar a modelos mayores como bert-base o modelos generativos.
- Filtrado o moderacion por spans: marcado de fragmentos concretos de texto (por ejemplo, terminos prohibidos) cuando el esquema de etiquetas se adapta a esa tarea.

## Benchmarks y rendimiento

La model card no incluye resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.); el `model-index` del autor declara un array de resultados vacio. Los unicos datos disponibles son las metricas de evaluacion durante el entrenamiento (conjunto de validacion, esquema de clasificacion de tokens), que se recogen a continuacion sin modificacion.

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 0,3994 | 500 | 0,1517 | 0,7779 | 0,8499 | 0,8123 | 0,9663 |
| 0,7987 | 1000 | 0,1067 | 0,8398 | 0,8872 | 0,8628 | 0,9733 |
| 1,1981 | 1500 | 0,0953 | 0,8527 | 0,9021 | 0,8767 | 0,9748 |
| 1,5974 | 2000 | 0,0875 | 0,8910 | 0,9123 | 0,9015 | 0,9795 |
| 1,9968 | 2500 | 0,0804 | 0,8902 | 0,9113 | 0,9006 | 0,9798 |
| 2,3962 | 3000 | 0,0812 | 0,8987 | 0,9180 | 0,9083 | 0,9809 |
| 2,7955 | 3500 | 0,0758 | 0,8992 | 0,9258 | 0,9123 | 0,9817 |
| 3,1949 | 4000 | 0,0799 | 0,9007 | 0,9263 | 0,9133 | 0,9813 |
| 3,5942 | 4500 | 0,0782 | 0,8947 | 0,9263 | 0,9102 | 0,9813 |
| 3,9936 | 5000 | 0,0780 | 0,9014 | 0,9288 | 0,9149 | 0,9822 |
| 4,3930 | 5500 | 0,0798 | 0,9072 | 0,9251 | 0,9161 | 0,9828 |
| 4,7923 | 6000 | 0,0790 | 0,9108 | 0,9297 | 0,9201 | 0,9832 |

Resultado final declarado en la model card: loss 0,0790, precision 0,9108, recall 0,9297, F1 0,9201, accuracy 0,9832. Estos valores corresponden a un unico conjunto de evaluacion no especificado y no son comparables con benchmarks publicos de terceros.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB en precision completa (33M de parametros, aproximadamente 130 MB en fp32); en fp16 aproximadamente 66 MB de pesos, mas activaciones.
- GPU recomendadas: cualquier GPU moderna es suficiente; GTX 1650, RTX 3060, RTX 4090, A100 o H100 no suponen ninguna restriccion para este tamano.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en iGPU con memoria compartida.
- CPU: completamente viable para inferencia en CPU, con latencias de milisegundos por secuencia corta.
- Opciones de despliegue: pipeline `token-classification` de transformers, servicio con FastAPI/TorchServe, conversion a ONNX Runtime para aceleracion en CPU.
- Latencia y throughput: no disponibles (no publicados por el autor); se esperan valores muy bajos por el reducido numero de parametros.
- Nota: al ser token-classification, no es compatible directamente con servidores de inferencia orientados a texto generativo (por ejemplo vLLM), salvo adaptaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shumast/bge-small-en-v1.5 | 33,2 M | 512 | Clasificacion de tokens | MIT | HuggingFace |
| BAAI/bge-small-en-v1.5 (base) | 33,2 M | 512 | Embeddings / recuperacion | MIT | HuggingFace |
| dslim/bert-base-NER | 110 M aprox. | 512 | NER (token-classification) | MIT | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 | Embeddings | Apache-2.0 | HuggingFace |

El rendimiento comparado entre estos modelos no esta disponible en la informacion proporcionada, ya que las metricas del modelo objeto de la ficha corresponden a un conjunto de evaluacion propio y no se dispone de resultados equivalentes de las alternativas.

## Limitaciones y advertencias

- Model card auto-generada e incompleta: no se documentan dataset de entrenamiento, esquema de etiquetas ni uso previsto, lo que impide evaluar su generalizacion.
- Sesgos conocidos: no disponibles; al derivar de un modelo base entrenado predominantemente en ingles, es previsible un sesgo linguistico y cultural hacia ese idioma.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de etiquetado incorrecto o falso positivo/negativo en los spans, con F1 final de 0,9201 y precision de 0,9108.
- Limitacion de contexto: 512 tokens, heredada del modelo base; secuencias mas largas requieren truncado o segmentacion.
- Limitacion de idioma: el modelo base es de ingles; el comportamiento en otros idiomas no esta documentado.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion de copyright y aviso de licencia.
- Caveat para produccion: al no especificarse el dataset ni el dominio, conviene validar el esquema de etiquetas real y reevaluar en datos propios antes de desplegarlo.
- Los valores de benchmarks y fechas del repositorio deben tratarse como declaraciones del autor, no verificadas de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shumast/bge-small-en-v1.5
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Pipeline token-classification de transformers: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
