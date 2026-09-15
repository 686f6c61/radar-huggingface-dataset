# Fabricede/distilbert-rotten-tomatoes-sentiment

## Resumen

`Fabricede/distilbert-rotten-tomatoes-sentiment` es un modelo de clasificación de texto publicado en HuggingFace por el usuario Fabricede. Se trata de un ajuste fino (*fine-tuning*) de `distilbert-base-uncased`, la versión destilada de BERT-base, sobre un conjunto de datos que la propia model card describe como "unknown dataset" y que, por el nombre del repositorio, todo apunta a reseñas de películas de Rotten Tomatoes con etiqueta de sentimiento. El modelo tiene 66.955.010 parámetros y se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors.

DistilBERT es un *transformer* encoder de 6 capas y 768 dimensiones ocultas, obtenido mediante destilación de conocimiento a partir de BERT-base. Conserva aproximadamente el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje, con un 40 % menos de parámetros y una latencia un 60 % inferior, lo que lo convierte en una opción habitual para inferencia en CPU y en GPUs de gama baja. Este ajuste concreto está pensado para clasificación binaria de sentimiento en inglés.

La relevancia de esta ficha es limitada pero realista: el repositorio acumula 0 descargas y 0 *likes*, y la model card es un artefacto autogenerado por el `Trainer` con secciones sin completar ("More information needed"). Los únicos datos verificables son las métricas de validación declaradas por el autor (accuracy 0,8537 y F1 0,8531 en la segunda época) y los hiperparámetros de entrenamiento. Cualquier uso en producción debería ir precedido de una evaluación propia sobre datos del dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (limite del modelo base `distilbert-base-uncased`) |
| Tipos de cuantizacion | no disponible en el repositorio (pesos completos; conversion externa a int8/ONNX posible) |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente en ingles, sin datos oficiales de cobertura multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

Otros datos del repositorio: tamano del repo 0,5 GB; pipeline declarado `text-classification`; etiquetas adicionales `text-embeddings-inference` y `endpoints_compatible`; fecha de creacion 2026-09-15 y ultima actualizacion 2026-09-15.

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT: un encoder de 6 capas, 12 cabezas de atencion y 768 dimensiones ocultas, con un vocabulario WordPiece de 30.522 tokens. Fue obtenido por destilacion de BERT-base combinando tres perdidas (masked language modeling, destilacion de las distribuciones del profesor y perdida de embedding coseno). Sobre esa base, este repositorio anade una cabeza de clasificacion de secuencia ajustada para la tarea de sentimiento.

Los hiperparametros de entrenamiento documentados son: learning rate 2e-05, `train_batch_size` 16, `eval_batch_size` 16, optimizador `AdamW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 2 epocas y semilla 42. El entrenamiento completo son 1.068 pasos, 534 por epoca, lo que con un batch de 16 implica del orden de 8.500 ejemplos por epoca (calculo derivado de los pasos declarados, no confirmado en la model card). Los resultados por epoca fueron:

| Training loss | Epoca | Paso | Validation loss | Accuracy | F1 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 0,4245 | 1,0 | 534 | 0,3887 | 0,8368 | 0,8497 |
| 0,2558 | 2,0 | 1068 | 0,3732 | 0,8537 | 0,8531 |

No se documenta composicion del dataset, preprocesado ni tecnicas de regularizacion adicionales. No hay evidencia de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de este tamano. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificacion de texto (analisis de sentimiento) mediante la pipeline `text-classification` de Transformers.
- Salida de etiquetas con puntuacion de confianza mediante `return_all_scores=True` o `top_k`.
- Inferencia rapida en CPU y en GPU de gama baja gracias a sus 66,9 M de parametros.
- Compatibilidad con Text Embeddings Inference (TEI) y con HuggingFace Inference Endpoints, segun las etiquetas del repositorio.
- Posible uso como extractor de representaciones intermedias (pooling de la salida del encoder) para *feature extraction*, aunque no esta documentado por el autor.
- No hay soporte declarado de *tool calling*, *function calling*, razonamiento multi-paso, agentes, vision, audio ni modo de razonamiento explicito: es un clasificador de secuencia, no un modelo generativo.
- No hay informacion sobre capacidades multilingues ni sobre el conjunto exacto de etiquetas de salida (se desconoce si es binario positivo/negativo o multiclase).

## Casos de uso

- Moderacion y triaje de opiniones de usuarios: el modelo puede clasificar resenas o comentarios en ingles y enrutar los negativos a un equipo humano, con un coste de inferencia minimo al ejecutarse en CPU.
- Analisis de sentimiento de resenas de producto o de contenido audiovisual: encaja directamente con el dominio aparente de entrenamiento (criticas de cine), aunque requiere validacion previa sobre el corpus propio.
- Etiquetado a gran escala en pipelines de datos: procesar lotes de decenas de miles de textos para construir series temporales de opinion publica, usando batch de 16 o superior segun memoria disponible.
- Filtrado previo en sistemas RAG: descartar o priorizar documentos segun polaridad antes de pasarlos a un modelo generativo, reduciendo tokens consumidos por el modelo grande.
- Enriquecimiento de dashboards de customer experience: clasificar tickets de soporte o encuestas NPS en ingles y volcar la etiqueta a un almacen analitico mediante un microservicio con la pipeline de Transformers.
- Baseline de referencia en investigacion: por su tamano y su licencia Apache 2.0, sirve como punto de comparacion rapido frente a clasificadores mayores (RoBERTa, DeBERTa) antes de asumir costes de entrenamiento superiores.
- Servicio de inferencia ligero en el borde: los pesos caben holgadamente en un contenedor pequeno y permiten despliegue en instancias sin GPU, algo relevante cuando el volumen no justifica aceleradores.

## Benchmarks y rendimiento

El `model-index` del repositorio declara un unico modelo con la lista `results` vacia, por lo que no hay benchmarks estandar (MMLU, GLUE, SST-2, etc.) publicados. Las unicas metricas disponibles son las de validacion interna declaradas por el autor:

| Metrica | Valor (evaluacion final) | Valor (epoca 2) |
|---|---|---|
| Loss | 0,4272 | 0,3732 |
| Accuracy | 0,8368 | 0,8537 |
| F1 | 0,8355 | 0,8531 |

Nota: los valores de la columna "evaluacion final" provienen del encabezado de la model card y los de la epoca 2 de la tabla de resultados de entrenamiento; el autor no aclara a que particion corresponde cada conjunto ni si existe un *test set* independiente. No se han publicado resultados de benchmarks comparativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 268 MB; en fp16 unos 134 MB; en int8 unos 67 MB. El pico de memoria en inferencia ronda 1-2 GB contando activaciones y lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona sin problema en GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100; en estas dos ultimas el cuello de botella sera la CPU y el ancho de banda del *dataloader*, no el computo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU (unos pocos milisegundos por secuencia corta en un procesador moderno).
- Opciones de despliegue: pipeline de `transformers`; Text Embeddings Inference (etiqueta declarada por el autor); HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`); exportacion a ONNX Runtime para acelerar en CPU; integracion en FastAPI/TorchServe. No hay confirmacion de soporte GGUF/llama.cpp para este repositorio concreto.
- Latencia y throughput: no disponible. No se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Metricas declaradas |
|---|---|---|---|---|---|
| `Fabricede/distilbert-rotten-tomatoes-sentiment` | 66,9 M | 512 tokens | DistilBERT fine-tuned | Apache 2.0 | Accuracy 0,8537 / F1 0,8531 (validacion) |
| `distilbert-base-uncased-finetuned-sst-2-english` | 67 M | 512 tokens | DistilBERT fine-tuned en SST-2 | Apache 2.0 | no disponible en la informacion proporcionada |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M | 512 tokens | RoBERTa-base fine-tuned | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| `roberta-base` fine-tuned para sentimiento | ~125 M | 512 tokens | RoBERTa-base | MIT (modelo base) | no disponible en la informacion proporcionada |

La comparativa se limita a parametros, contexto y licencia porque no se han proporcionado resultados de benchmarks de las alternativas. En terminos practicos, la diferencia clave frente a las opciones basadas en RoBERTa es el coste de inferencia: DistilBERT es aproximadamente un 40 % mas pequeno y un 60 % mas rapido que BERT-base. Frente a alternativas de mayor tamano (DeBERTa-v3-base, ~184 M), cabe esperar menor rendimiento absoluto, pero no hay datos en la informacion disponible para cuantificarlo.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento dicen literalmente "More information needed". No se puede verificar la composicion del dataset, el etiquetado ni el preprocesado.
- Dataset de entrenamiento no identificado: la unica pista es el nombre del repositorio (Rotten Tomatoes). Si el ajuste se hizo sobre un subconjunto pequeno o con etiquetas derivadas de puntuaciones, el modelo puede heredar ese ruido.
- 0 descargas y 0 likes: no hay evidencia de uso comunitario, validacion externa ni replicacion de resultados.
- Riesgo de sobreajuste al dominio: con solo 2 epocas y aproximadamente 8.500 ejemplos por epoca, el rendimiento fuera del dominio de resenas de cine (por ejemplo, redes sociales, texto tecnico o dialectos) es incierto y requiere evaluacion propia.
- Idioma: el modelo base es `distilbert-base-uncased`, entrenado mayoritariamente en ingles. No hay soporte multilingue declarado; el uso en castellano no esta validado.
- Sesgo: DistilBERT hereda los sesgos de los corpus web con los que se preentreno BERT (BooksCorpus y Wikipedia en ingles). No se ha realizado ninguna auditoria de sesgo documentada.
- Alucinacion: no aplica en el sentido generativo, porque el modelo no genera texto libre; el riesgo equivalente es la clasificacion erronea con alta confianza.
- Etiquetas de salida no documentadas: no se especifica el mapeo `id2label`. Si se integra en produccion, hay que inspeccionar `config.json` para confirmar el orden y el numero de clases.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. No impone restricciones adicionales, pero conviene verificar la licencia del dataset de entrenamiento, que no se declara.
- Reproducibilidad: se declaran semilla 42 y versiones de framework, pero no la version del dataset ni el script de entrenamiento, por lo que la replicacion exacta no esta garantizada.
- Caveat operativo: el campo "Creado" del repositorio indica 2026-09-15, una fecha posterior a la actual; conviene tratarlo como posible error de metadatos y no como informacion fiable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Fabricede/distilbert-rotten-tomatoes-sentiment
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Documentacion del Trainer de Transformers: https://huggingface.co/docs/transformers/main_classes/trainer
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las coincidencias devueltas corresponden a contenido sin relacion (tematica de videojuegos en japones) y se descartan.
