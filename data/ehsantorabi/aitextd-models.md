# ehsantorabi/aitextd-models

## Resumen

AITextD es una coleccion de dieciseis checkpoints entrenados para una unica tarea: determinar si un texto en persa (farsi) ha sido escrito por un humano o generado por un modelo de lenguaje. El repositorio, publicado por el autor ehsantorabi, no contiene un modelo unico sino un conjunto de artefactos de servicio que alimentan un ensemble ponderado calculado en tiempo de inferencia por la pila de serving del proyecto AITextDetection. Los pesos van desde clasicos de machine learning sobre TF-IDF hasta transformers afinados como ParsBERT, GPT-2 en persa y Laya (mmBERT-base).

La relevancia del conjunto esta en su enfoque de deteccion de texto generado por IA en un idioma de recursos medios como el persa, con un protocolo de evaluacion que el autor denomina v2 y que incluye divisiones group-aware y condiciones de ataque por parafraseo y cambio de dominio. El modelo con mejor rendimiento reportado es Laya afinado, con una exactitud y F1 de test de 0,9993, seguido de ParsBERT (0,9983) y CharCNN (0,9983). Los artefactos suman 3,1 GB y se distribuyen bajo licencia MIT.

No se trata de un modelo generativo ni de un LLM conversacional: es un sistema de clasificacion binaria de autoria, pensado para integrarse en una API FastAPI propia y no para consumo mediante `pipeline(...)` de Hugging Face. La ficha describe, por tanto, el conjunto de clasificadores y su arquitectura de ensemble.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble heterogeneo: TF-IDF + ML clasico, BiLSTM, TextCNN, CharCNN, MLP, transformer from scratch, ParsBERT, GPT-2 (clasificacion), Laya (mmBERT-base) |
| Parametros totales | no disponible (suma de 16 checkpoints; el repo ocupa 3,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (artefactos en precision de entrenamiento: `.pt`, `.joblib`, safetensors) |
| Idiomas soportados | persa (farsi, `fa`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), joblib (`.joblib`), safetensors, directorio de modelo Laya |

## Arquitectura y entrenamiento

El sistema combina cuatro familias de modelos. La primera es ML clasico sobre caracteristicas TF-IDF y estilometricas: LinearSVC, LogisticRegression, MultinomialNB, RandomForest y GradientBoosting, serializados con joblib y alimentados por un `tfidf_vectorizer.joblib` compartido. La segunda son redes profundas entrenadas desde cero: BiLSTM, TextCNN, un TextCNN con fine-tune RLCD, un BiLSTM con pooling por atencion aditiva, un MLP de dos capas ocultas, un CharCNN a nivel de caracter y un transformer encoder de dos capas. La tercera son transformers preentrenados afinados: GPT2ForSequenceClassification con fine-tune completo sobre `HooshvareLab/gpt2-fa`, ParsBERT (`HooshvareLab/bert-fa-base-uncased`) con cabeza lineal sobre el token [CLS], y Laya (`convaiinnovations/laya`, mmBERT-base multilingue) con cabezas de decision tipadas (choice/score/noul) y fine-tune RLCD.

El ensemble se calcula en vivo en la pila de serving a partir de los checkpoints, con pesos por modelo que van de 0,0 a 3,0 (los transformers ParsBERT y GPT-2 reciben peso 3,0; Laya 2,0; los clasicos 1,0; BiLSTM 0,7; TextCNN, Attention BiLSTM, MLP, CharCNN y Tiny Transformer 0,5; System One 0,6; el TextCNN con RLCD tiene peso 0,0). Ademas se usa un LM GPT-2 en persa para una senal de perplejidad sin entrenamiento. La evaluacion sigue un protocolo v2 con divisiones group-aware y condiciones de ataque por parafraseo y cambio de dominio, con matrices de confusion y tablas completas en el repositorio GitHub del proyecto.

## Capacidades

- Clasificacion binaria de autoria (humano frente a generado por IA) en textos en persa.
- Deteccion robusta a ataques de parafraseo y cambio de dominio, segun el protocolo de evaluacion v2 del autor.
- Analisis estilometrico mediante caracteristicas TF-IDF y modelos clasicos.
- Senal de perplejidad basada en un LM GPT-2 en persa, sin entrenamiento adicional.
- Modelo de decision "System One" con cabezas tipadas (choice/score/noul) sobre ParsBERT y sobre Laya.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No soporta vision, audio ni thinking mode.
- Multilingue: no, unicamente persa.

## Casos de uso

- Moderacion de contenido en plataformas persas: el ensemble puede marcar publicaciones o comentarios sospechosos de ser generados por IA antes de una revision humana, combinando la senal de los transformers afinados con los clasicos TF-IDF.
- Verificacion de autoria en entornos academicos: deteccion de ensayos o trabajos generados por IA en persa, usando el protocolo de evaluacion v2 como referencia de robustez frente a parafraseo.
- Deteccion de resenas falsas en comercio electronico: clasificacion de resenas en farsi para filtrar contenido generado masivamente, con el modelo Laya o ParsBERT como senal principal del ensemble.
- Analisis forense de textos periodisticos: identificacion de articulos o notas de prensa generados por IA en medios en persa, apoyandose en la senal de perplejidad del LM GPT-2.
- Integracion en pipelines de publicacion editorial: pre-chequeo automatico de manuscritos recibidos en revistas o editoriales persas antes de la revision editorial.
- Investigacion en estilometria y deteccion de IA: uso de los dieciseis checkpoints y del protocolo v2 como linea base reproducible para comparar tecnicas clasicas frente a transformers en un idioma de recursos medios.
- API de servicio propia: despliegue del stack FastAPI del proyecto (`server.py` en el puerto 8000) para ofrecer clasificacion de autoria como servicio interno.

## Benchmarks y rendimiento

Resultados de test reportados por el autor en la model card (protocolo v2, divisiones group-aware):

| Modelo | Exactitud test | F1 test | Peso en ensemble |
|---|---|---|---|
| Laya (fine-tuned) | 0,9993 | 0,9993 | 2,0 |
| ParsBERT | 0,9983 | 0,9983 | 3,0 |
| CharCNN | 0,9983 | 0,9983 | 0,5 |
| GPT-2 Transformer (fine-tuned) | 0,9969 | 0,9969 | 3,0 |
| SVM | 0,9967 | 0,9967 | 1,0 |
| MLP | 0,9964 | 0,9965 | 0,5 |
| Logistic Regression | 0,9964 | 0,9964 | 1,0 |
| Gradient Boosting | 0,9912 | 0,9912 | 1,0 |
| TextCNN (RLCD fine-tune) | 0,9900 | 0,9900 | 0,0 |
| TextCNN | 0,9905 | 0,9905 | 0,5 |
| System One (Decision Head) | 0,9893 | 0,9893 | 0,6 |
| Tiny Transformer | 0,9891 | 0,9891 | 0,5 |
| Random Forest | 0,9886 | 0,9886 | 1,0 |
| Attention BiLSTM | 0,9881 | 0,9881 | 0,5 |
| BiLSTM | 0,9832 | 0,9831 | 0,7 |
| Naive Bayes | 0,9810 | 0,9809 | 1,0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que la tarea es de clasificacion y no de generacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma desagregada; el repositorio completo ocupa 3,1 GB, por lo que la carga de todos los checkpoints en memoria requiere al menos unos pocos GB, dominados por los transformers (ParsBERT, GPT-2, Laya) y el LM GPT-2 de perplejidad.
- GPU recomendadas: no especificadas por el autor. Por tamano de los transformers base (BERT-base y mmBERT-base), una GPU consumer con 8-12 GB de VRAM deberia ser suficiente para inferencia; no se confirma en la informacion disponible.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de los checkpoints, aunque no hay confirmacion explicita.
- Opciones de despliegue: la pila propia del proyecto basada en FastAPI (`server.py`, puerto 8000), con `uv sync` y descarga via `hf download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros detectores de texto generado por IA en persa dentro de la informacion proporcionada. Como referencia interna, el propio ensemble incluye alternativas comparables entre si:

| Modelo | Familia | Exactitud test | Licencia | Disponibilidad |
|---|---|---|---|---|
| Laya (fine-tuned) | Transformer (mmBERT-base) | 0,9993 | MIT (repo); base Apache-2.0 | Incluido en el repo |
| ParsBERT | Transformer (BERT-base) | 0,9983 | MIT (repo); base del autor original | Incluido en el repo |
| GPT-2 Transformer | Transformer (GPT-2) | 0,9969 | MIT (repo); base del autor original | Incluido en el repo |
| SVM | ML clasico (TF-IDF) | 0,9967 | MIT | Incluido en el repo |

Comparativa con detectores externos de la misma categoria: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus persa concreto, puede degradarse en registros, dominios o variantes dialectales no representados.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, especialmente ante textos humanos que imiten estilo de IA o viceversa.
- Limitacion de idioma: solo persa (`fa`); no debe usarse con otros idiomas.
- Longitud de contexto: no disponible; los transformers base (BERT-base, mmBERT-base) imponen un limite tipico de 512 tokens, aunque no se confirma en la informacion.
- Licencia MIT en el repositorio, pero los modelos base tienen sus propias licencias (Laya es Apache-2.0; ParsBERT y GPT-2-fa dependen de sus autores originales); verificar antes de uso comercial.
- El ensemble se calcula en la pila de serving propia, no como un unico artefacto; no es consumible con `pipeline(...)` de Hugging Face.
- El modelo `textcnn_rlcd` tiene peso 0,0 en el ensemble, por lo que no contribuye a la prediccion final.
- No se incluyen en el repo el checkpoint base `laya_multilingual` ni el checkpoint intermedio `checkpoint_latest`, necesarios solo para reentrenamiento.
- Las metricas son de test del autor bajo su protocolo v2; no han sido replicadas de forma independiente en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ehsantorabi/aitextd-models
- Repositorio GitHub del proyecto: https://github.com/ehsan-torabi/AITextDetection
- ParsBERT base: https://huggingface.co/HooshvareLab/bert-fa-base-uncased
- GPT-2 en persa: https://huggingface.co/HooshvareLab/gpt2-fa
- Laya (multilingual, mmBERT-base): https://huggingface.co/convaiinnovations/laya
