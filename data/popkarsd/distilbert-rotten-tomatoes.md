# popkarsd/distilbert-rotten-tomatoes

## Resumen

`popkarsd/distilbert-rotten-tomatoes` es un modelo de clasificacion de texto obtenido por fine-tuning de `distilbert/distilbert-base-uncased`. Lo publica el usuario de Hugging Face popkarsd y sigue el patron habitual de los modelos "generated_from_trainer": la model card esta autogenerada por la libreria `Trainer` y no documenta ni el dataset de entrenamiento ni el etiquetado, que aparecen como "unknown dataset" y "More information needed". El nombre del repositorio sugiere un ajuste orientado a analisis de sentimiento sobre resenas de Rotten Tomatoes, pero esa intencion no esta confirmada en la informacion disponible.

Tecnicamente es un encoder transformer de tipo DistilBERT con 66.955.010 parametros (segun los pesos en safetensors), seis capas y una ventana de contexto de 512 tokens heredada del modelo base. No es un modelo generativo ni conversacional: su salida es una distribucion sobre las clases de clasificacion configuradas, por lo que su uso previsto es la inferencia de etiquetas sobre fragmentos cortos de texto en ingles.

Su relevancia es limitada y de nicho: con 17 descargas, 0 likes y sin resultados de evaluacion publicados (el `model-index` declara `results: []`), no debe considerarse un modelo validado para produccion. Su interes practico esta en servir como baseline ligero y barato de ejecutar (menos de 70 millones de parametros, ejecutable en CPU) para tareas de clasificacion de sentimiento, siempre que se valide antes sobre datos propios y se confirme el mapeo de etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilacion de BERT-base); modelo base `distilbert/distilbert-base-uncased` |
| Parametros totales | 66.955.010 (dato real de los pesos en safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (caracteristica heredada de `distilbert-base-uncased`; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados; el tag `text-embeddings-inference` sugiere compatibilidad con el stack de TEI, no una cuantizacion concreta) |
| Idiomas soportados | no disponible en la model card; el modelo base esta entrenado principalmente en ingles y usa tokenizacion uncased |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tag `safetensors`); tamano del repositorio 1,3 GB |

Datos adicionales del repositorio: pipeline `text-classification`, libreria `transformers`, creado el 2026-10-13 y actualizado el 2026-10-13, 17 descargas y 0 likes.

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas con atencion multi-cabeza, aproximadamente 66 millones de parametros y un vocabulario WordPiece de 30.522 tokens (no confirmado en la model card, es la configuracion estandar de `distilbert-base-uncased`). DistilBERT se obtuvo por destilacion de conocimiento de BERT-base, lo que reduce el numero de capas a la mitad manteniendo en torno al 97 % de las capacidades del modelo original en las tareas evaluadas por sus autores, con una latencia inferior. Sobre esta base se ha anadido una cabeza de clasificacion ajustada para la tarea concreta del repositorio.

Los hiperparametros si estan documentados: learning rate de 2e-05, `train_batch_size` de 8, `eval_batch_size` de 8, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9 y 0,999, epsilon 1e-08), planificador lineal (`linear`) y 2 epocas. No se indica el numero de tokens de entrenamiento, la composicion del dataset ni el numero de ejemplos, y no hay constancia de RLHF, DPO ni de ninguna otra etapa de alineacion (no aplica en un clasificador). Las versiones de framework declaradas son Transformers 5.19.0, PyTorch 2.14.1+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. La seccion "Training results" de la model card esta vacia.

## Capacidades

- Clasificacion de texto corto: devuelve una o varias etiquetas con su puntuacion de probabilidad sobre el texto de entrada.
- Analisis de sentimiento (uso inferido del nombre del repositorio: resenas estilo Rotten Tomatoes), sin confirmacion documental del esquema de etiquetas ni del numero de clases.
- Inferencia rapida y de bajo coste computacional: 66,9 millones de parametros permiten ejecucion en CPU y en GPU integrada.
- Compatibilidad con el ecosistema `transformers`: carga directa mediante `AutoModelForSequenceClassification` y `pipeline("text-classification")`.
- Compatibilidad declarada con endpoints gestionados de Hugging Face (tags `endpoints_compatible` y `text-embeddings-inference`).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de generacion de texto, resumen, traduccion ni respuesta a preguntas en formato generativo.
- No dispone de vision, audio ni modo "thinking".
- Capacidad multilingue: no acreditada; el modelo base es mayoritariamente ingles y el tokenizador es uncased (no distingue mayusculas de minusculas).
- Procesamiento de documentos largos: limitado a 512 tokens por fragmento; requiere troceado y agregacion externa.

## Casos de uso

- Clasificacion de criticas cinematograficas: dado un corpus de resenas tipo Rotten Tomatoes, el modelo asigna una etiqueta de polaridad a cada fragmento de hasta 512 tokens. Es adecuado por coste (unos 67 M de parametros) y velocidad, pero el mapeo real de etiquetas debe verificarse antes de usarlo.
- Etiquetado a gran escala para construir datasets: uso como anotador automatico (weak supervision) sobre millones de resenas para preentrenar o filtrar datos de un modelo mayor, con revision humana sobre una muestra para medir el acuerdo.
- Enrutamiento previo a un LLM: clasificar primero con este modelo los textos claramente positivos o negativos y reservar el modelo generativo (mas caro por token) solo para los casos ambiguos, reduciendo el coste de inferencia de un pipeline de opinion.
- Moderacion y triaje de resenas en plataformas: priorizar para revision manual las resenas con polaridad extrema o incierta en un flujo de moderacion, siempre con umbral de confianza y supervision humana.
- Monitorizacion de reputacion de marca: procesar en lote menciones o resenas de producto y agregar la polaridad por dia o por producto para detectar caidas de satisfaccion. Requiere validar el dominio, ya que el ajuste esta orientado a resenas de cine.
- Analisis de opiniones en comercio electronico: clasificar resenas de producto en castellano o en otros idiomas no esta acreditado; el caso seria viable en ingles y con verificacion previa de calidad sobre el catalogo concreto.
- Baseline academico reproducible: servir como referencia ligera para comparar arquitecturas de clasificacion de sentimiento antes de invertir en modelos mayores.
- Servicio de inferencia en CPU con TEI: desplegar el modelo detras de Text Embeddings Inference o de un endpoint de Hugging Face para clasificacion en tiempo real con coste de GPU nulo, dado el tamano reducido del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El `model-index` de la model card declara la entrada `distilbert-rotten-tomatoes` con una lista de resultados vacia (`results: []`) y la seccion "Training results" del README esta en blanco. No se dispone por tanto de exactitud, F1, precision, recall ni de ninguna metrica sobre Rotten Tomatoes, SST-2, IMDB u otro conjunto. Cualquier cifra de rendimiento usada en produccion debera medirse localmente sobre un conjunto de validacion propio.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 270 MB solo para pesos, mas activaciones; inferior a 1 GB en la practica.
- VRAM estimada en fp16: en torno a 135 MB para pesos, mas activaciones; inferior a 500 MB en la practica.
- El repositorio ocupa 1,3 GB, lo que sugiere la presencia de checkpoints adicionales o estados del optimizador; conviene descargar unicamente los ficheros necesarios.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, T4, L4, RTX 3060 o superiores. Tambien funciona en GPU integrada y en CPU.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos diez anos, y tambien en CPU con un throughput aceptable para lotes pequenos.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (tag `text-embeddings-inference`), Hugging Face Inference Endpoints (tag `endpoints_compatible`), exportacion a ONNX Runtime o TorchScript para inferencia en CPU, y servicios propios con FastAPI o BentoML.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia de orden de magnitud, un encoder de 6 capas y 67 millones de parametros procesa lotes de decenas o cientos de secuencias por segundo en una GPU moderna, pero esta cifra debe medirse en el entorno objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| popkarsd/distilbert-rotten-tomatoes | 66.955.010 | 512 tokens | Clasificacion de texto; dataset y etiquetas no documentados; sin metricas | apache-2.0 | Hugging Face, 17 descargas |
| vhp-agi/distilbert-rotten-tomatoes | no disponible | no disponible | Clasificacion de texto; mismo nombre y previsiblemente mismo ajuste | no disponible | Hugging Face (repositorio con nombre identico) |
| larsmay/distilbert-rotten-tomatoes | no disponible | no disponible | Clasificacion de texto; mismo nombre y previsiblemente mismo ajuste | no disponible | Hugging Face (repositorio con nombre identico) |
| distilbert/distilbert-base-uncased | 66.955.008 | 512 tokens | Modelo base sin cabeza de clasificacion ajustada | apache-2.0 | Hugging Face, ampliamente utilizado |

Observaciones: los repositorios `vhp-agi/distilbert-rotten-tomatoes`, `larsmay/distilbert-rotten-tomatoes`, `tuskyz/distilbert-rotten-tomatoes` y `adrien653/distilbert-rotten-tomatoes` aparecen en los resultados de busqueda con el mismo nombre, lo que indica multiples copias o ajustes derivados del mismo pipeline; no se ha podido verificar su contenido ni sus especificaciones. No se dispone de datos de rendimiento de ninguno de ellos, por lo que la comparativa se limita a parametros, contexto y licencia. No se ha localizado ninguna comparacion publicada con clasificadores de sentimiento entrenados sobre Rotten Tomatoes que permita situar este modelo.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la propia model card indica "unknown dataset". No es posible saber la composicion, el idioma, el dominio ni el numero de clases.
- Mapeo de etiquetas no documentado: se desconoce si la salida es binaria (positivo/negativo) o multiclase, y en que orden se devuelven las etiquetas. Debe inspeccionarse `config.json` antes de cualquier uso.
- Ausencia total de evaluacion: no hay exactitud, F1 ni ningun otro dato en el `model-index` ni en el README. El modelo no esta validado y su calidad es desconocida.
- Riesgo de sesgo: al derivar de `distilbert-base-uncased`, hereda los sesgos de su corpus de preentrenamiento (mayoritariamente ingles y de dominio web, con infrarrepresentacion de determinados registros y variedades linguisticas). No se ha realizado ninguna evaluacion de sesgo ni de equidad.
- Alucinacion: al ser un clasificador discriminativo no genera texto, por lo que no alucina en el sentido habitual; el riesgo equivalente es la confianza mal calibrada, es decir, asignar probabilidades altas a etiquetas incorrectas en textos fuera de dominio (por ejemplo, resenas de producto, textos legales o clinicos).
- Limitacion de idioma: sin acreditacion multilingue. El tokenizador uncased y el preentrenamiento en ingles hacen previsible un rendimiento pobre en castellano u otros idiomas.
- Limitacion de contexto: 512 tokens por fragmento. Los documentos mas largos deben trocearse, lo que puede perder la polaridad global del texto (por ejemplo, resenas que empiezan positivas y terminan negativas).
- Dominio estrecho: el ajuste apunta a resenas de cine. La transferencia a otros dominios (tecnologia, finanzas, sanidad) no esta verificada.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, con la obligacion de conservar el aviso de licencia y la exencion de responsabilidad. No hay clausulas de uso aceptable adicionales.
- Reputacion e historial: 17 descargas, 0 likes y ninguna validacion por parte de la comunidad. No es un modelo apto para produccion sin una evaluacion local exhaustiva.
- Ausencia de soporte: el autor no ofrece documentacion, issues ni garantias de mantenimiento.
- Inconsistencia de fechas: los metadatos indican creacion y actualizacion en octubre de 2026, lo que conviene verificar en la pagina del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/popkarsd/distilbert-rotten-tomatoes
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Repositorio con nombre identico de vhp-agi: https://huggingface.co/vhp-agi/distilbert-rotten-tomatoes
- Repositorio con nombre identico de larsmay: https://huggingface.co/larsmay/distilbert-rotten-tomatoes
- Ficha agregada en free2aitools (tuskyz): https://free2aitools.com/model/tuskyz/distilbert-rotten-tomatoes
- Ficha agregada en free2aitools (adrien653): https://free2aitools.com/model/adrien653/distilbert-rotten-tomatoes
- Ficha agregada en Essa Mamdani (hf-alchemist-1): https://essamamdani.com/ai-models/hf-alchemist-1-distilbert-rotten-tomatoes
- Paper de DistilBERT (Sanh et al., 2019), para contexto del modelo base: https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018), arquitectura original: https://arxiv.org/abs/1810.04805
