# shiv1310/sentiment-model

## Resumen

shiv1310/sentiment-model es un modelo de clasificacion de texto obtenido por ajuste fino (*fine-tuning*) de distilbert-base-uncased, publicado en HuggingFace por el usuario shiv1310. Se trata de un encoder transformer de tipo DistilBERT, con 66.955.779 parametros totales y un repositorio de 0,3 GB en formato safetensors. La model card indica que fue entrenado con la libreria Transformers (version 5.16.1) y PyTorch 2.11.0, y que surge de un entrenamiento generado automaticamente por la clase `Trainer`.

El modelo resuelve una tarea de clasificacion de sentimiento, aunque la model card no especifica el numero de clases, el esquema de etiquetas ni el conjunto de datos empleado (se describe literalmente como "unknown dataset"). Los unicos datos de rendimiento declarados son los de la evaluacion interna: perdida 0,7470, accuracy 0,6598 y F1 ponderado y macro de 0,6493. Se trata de valores modestos que quedan por debajo de las referencias publicas habituales para clasificacion de sentimiento en ingles, lo que sugiere un conjunto de validacion dificil, pocas clases con solapamiento o un dataset de dominio muy especifico.

Su relevancia actual es limitada como modelo de produccion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, no incluye informacion sobre usos previstos, datos de entrenamiento ni limitaciones, y el `model-index` esta vacio. Resulta util, eso si, como ejemplo minimo reproducible de un pipeline de clasificacion con DistilBERT y como punto de partida para experimentos locales de bajo coste, dado su tamano reducido y su licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base); tarea de clasificacion de secuencias |
| Parametros totales | 66.955.779 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (heredado de distilbert-base-uncased; no declarado en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, ONNX ni int8) |
| Idiomas soportados | No declarados por el autor. El modelo base distilbert-base-uncased esta entrenado principalmente con texto en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con la libreria transformers) |
| Modelo base | distilbert/distilbert-base-uncased |
| Pipeline | text-classification |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas con 768 dimensiones ocultas y 12 cabezas de atencion, resultado de destilar BERT-base (12 capas) conservando aproximadamente el 97 % del rendimiento declarado por sus autores con un 40 % menos de parametros y un 60 % mas de velocidad. Sobre ese tronco se anade una cabeza de clasificacion de secuencias. No se documenta si la clasificacion es binaria, multiclase o multietiqueta, ni cuantas etiquetas tiene el espacio de salida.

El entrenamiento se realizo con la clase `Trainer` de Transformers con los siguientes hiperparametros declarados: learning rate 2e-05, tamano de lote de entrenamiento y evaluacion de 32, semilla 42, optimizador AdamW con betas (0,9 / 0,999) y epsilon 1e-08, planificador lineal y 3 epocas. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni regularizacion adicional. Los resultados por epoca registrados por el autor fueron:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Accuracy | F1 ponderado | F1 macro |
|---|---|---|---|---|---|---|
| 1,0 | 58 | 1,0498 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2,0 | 116 | 0,8304 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3,0 | 174 | 0,6785 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

El patron muestra mejora hasta la segunda epoca y un ligero sobreajuste a partir de la tercera: la perdida de entrenamiento sigue bajando mientras la de validacion se estanca. No se describe ninguna innovacion tecnica adicional (no hay decodificacion especulativa, atencion lineal ni mecanismos híbridos).

## Capacidades

- Clasificacion de texto: asigna una etiqueta de sentimiento a una secuencia de entrada mediante el pipeline `text-classification` de Transformers.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para resenas, tuitos, titulares, parrafos de opinion y tickets de soporte de longitud media.
- Inferencia rapida y de bajo coste: al ser un modelo destilado de 66,96 M de parametros, es viable en CPU y en GPUs de gama baja.
- Integracion directa con el ecosistema Transformers (`AutoModelForSequenceClassification`, `AutoTokenizer`) y exportacion a otros runtimes previa conversion.
- Capacidades multilingues: no disponibles. El modelo base es *uncased* en ingles y el autor no declara soporte de otros idiomas.
- Tool calling / function calling: no soportado (los encoders de clasificacion no generan texto ni invocan herramientas).
- Razonamiento multi-paso, agentes y modo *thinking*: no soportados. Es un modelo discriminativo, no generativo.
- Vision, audio y modalidades adicionales: no soportadas.

## Casos de uso

- Analisis de resenas de producto: clasificar opiniones de clientes en un e-commerce para agregar satisfaccion por categoria. Adecuado por el bajo coste por inferencia de un modelo de 66,96 M de parametros, siempre que el *accuracy* observado (0,6598) sea suficiente para el umbral de negocio.
- Monitorizacion de menciones de marca: procesar en lote tuits, comentarios y publicaciones de foros para detectar sentimiento negativo. El limite de 512 tokens cubre bien textos cortos; se recomendaria reentrenar o validar con datos del dominio social antes de usarlo en produccion.
- Triaje de tickets de soporte: etiquetar automaticamente tickets entrantes por tono (satisfecho, neutro, molesto) y enrutarlos a colas distintas. La velocidad del modelo permite clasificar cientos de tickets por segundo en una GPU modesta o en CPU.
- Analisis de encuestas y NPS: procesar respuestas abiertas para agrupar comentarios por polaridad y priorizar los negativos en los informes de direccion.
- Preetiquetado en pipelines de anotacion: usar el modelo como etiquetador debil para arrancar un proceso de anotacion humana, revisando despues las predicciones con baja confianza. La licencia Apache 2.0 facilita su uso en herramientas internas.
- Moderacion de comentarios: primera capa de filtrado de opiniones toxicas o negativas persistentes en comunidades, delegando en un segundo modelo o en revision humana los casos ambiguos.
- Inferencia en el borde (*edge*) o en dispositivos sin GPU: al ocupar alrededor de 268 MB en FP32 y unos 67 MB en int8, se puede empaquetar con ONNX Runtime dentro de una aplicacion de escritorio o movil para analisis local sin enviar datos a la nube.
- Analisis de sentimiento de empleados: procesar comentarios de encuestas internas preservando la privacidad, ya que el modelo se puede ejecutar on-premise sin conexion externa.

## Benchmarks y rendimiento

El `model-index` publicado por el autor esta vacio, por lo que no hay resultados de benchmarks estandar (MMLU, GLUE, SST-2, HumanEval, GSM8K u otros). Los unicos datos disponibles son las metricas de la evaluacion interna del entrenamiento, declaradas por el autor y con un conjunto de datos no identificado:

| Metrica | Valor declarado |
|---|---|
| Perdida de evaluacion | 0,7470 |
| Accuracy | 0,6598 |
| F1 ponderado | 0,6493 |
| F1 macro | 0,6493 |
| Numero de clases evaluadas | No disponible |
| Conjunto de evaluacion | No disponible ("unknown dataset") |

No se han publicado resultados de benchmarks estandar en la informacion disponible. Al no conocerse el dataset, el numero de clases ni las etiquetas, estas cifras no son comparables con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en FP32 (solo pesos), 0,13 GB en FP16/BF16 y 0,07 GB en int8. Hay que sumar el consumo de activaciones y del tokenizador, que en lotes pequenos es marginal; en la practica, cualquier GPU con 1-2 GB libres es suficiente.
- GPU recomendadas: no requiere GPU. Funciona en CPU de forma razonable; en GPU sirve cualquier tarjeta moderna (RTX 3060, RTX 4090, T4, L4, A10, A100, H100). No tiene sentido reservar aceleradores de gama alta para este modelo.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas GPUs integradas y aceleradores de bajo perfil como Jetson.
- Memoria para ajuste fino: el entrenamiento requiere bastante mas memoria que la inferencia (estados del optimizador AdamW y activaciones); con tamano de lote 32 y 512 tokens conviene disponer de al menos 8-12 GB de VRAM en FP32, o usar precision mixta y gradient checkpointing para reducirlo.
- Opciones de despliegue: pipeline de Transformers, ONNX Runtime, TorchScript, TorchServe, FastAPI o Triton Inference Server. vLLM no esta orientado a encoders de clasificacion, por lo que no es la opcion recomendada. No hay pesos GGUF publicados, de modo que llama.cpp / Ollama no estan soportados sin conversion adicional.
- Latencia y throughput: no se han publicado mediciones. Por tamano de parametros (66,96 M), la inferencia es viable en CPU para lotes pequenos y en GPU permite lotes grandes con latencias bajas, pero no hay cifras verificadas en la informacion disponible.

## Comparativa con modelos similares

Las cifras de rendimiento de los modelos de terceros provienen de sus model cards publicas y no se han reproducido para esta ficha.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad / rendimiento |
|---|---|---|---|---|---|
| shiv1310/sentiment-model | 66,96 M | 512 tokens | Clasificacion de sentimiento (clases no declaradas) | Apache 2.0 | 0 descargas, 0 likes; accuracy 0,6598 en evaluacion interna |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Sentimiento binario (SST-2) | Apache 2.0 | Ampliamente usado como linea base; declara ~91 % de accuracy en SST-2 |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | Sentimiento en 3 clases, dominio Twitter | No verificada en esta ficha | Muy descargado; entrenado con datos de redes sociales |
| nlptown/bert-base-multilingual-uncased-sentiment | ~178 M | 512 tokens | Sentimiento en 5 estrellas, multilingue | No verificada en esta ficha | Cobertura multilingue, coste de inferencia mayor |

Frente a estas alternativas, el modelo de shiv1310 no aporta ventajas documentadas: no declara idiomas, no publica dataset ni etiquetas y su rendimiento medido es inferior al de las lineas base publicas para sentimiento en ingles. Su unico punto fuerte objetivo es el tamano reducido y la licencia permisiva.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explicitamente "unknown dataset" y no detalla composicion, idioma ni numero de ejemplos, lo que impide evaluar cobertura, sesgos y generalizacion.
- Numero de clases y esquema de etiquetas no documentados: no se puede saber si la salida es binaria, de 3 clases o de otra naturaleza, ni el significado de cada etiqueta.
- Rendimiento modesto: accuracy de 0,6598 y F1 macro de 0,6493 en la evaluacion interna. Con F1 macro y ponderado identicos, es probable que las clases no esten bien separadas o que el conjunto sea muy ruidoso. No se recomienda su uso directo en produccion sin validacion propia.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de clasificaciones erroneas con alta confianza en dominios distintos al de entrenamiento.
- Sesgos: no evaluados. Al derivar de distilbert-base-uncased, hereda los sesgos presentes en los corpus web en ingles usados para preentrenar el modelo base (genero, raza, religion, nacionalidad).
- Limitaciones de contexto: 512 tokens como maximo. Textos mas largos se truncan, lo que puede eliminar informacion relevante para el sentimiento global.
- Limitaciones de idioma: no se declara soporte multilingue y el modelo base es en ingles; su comportamiento en castellano u otros idiomas es impredecible.
- Licencia: Apache 2.0 permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias sobre el modelo ni sobre los datos de entrenamiento, cuyo origen se desconoce; conviene revisar posibles implicaciones de propiedad intelectual del dataset no declarado.
- Madurez: repositorio sin descargas ni likes, creado en 2026-09-26, sin mantenimiento documentado, sin issues resueltas y sin pruebas de robustez.
- Versionado de dependencias: la model card cita Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. En entornos con versiones antiguas de Transformers puede ser necesario instalar una version reciente o exportar los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shiv1310/sentiment-model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Linea base de sentimiento SST-2: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english
- Modelo de sentimiento en Twitter: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
- Modelo de sentimiento multilingue: https://huggingface.co/nlptown/bert-base-multilingual-uncased-sentiment
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de la tarea de clasificacion de texto en Transformers: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentacion del pipeline `text-classification`: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Documentacion de ONNX Runtime para Transformers: https://huggingface.co/docs/transformers/serialization#onnx
