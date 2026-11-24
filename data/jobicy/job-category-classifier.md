# jobicy/job-category-classifier

## Resumen

Jobicy Job Category Classifier es un prototipo de clasificador semantico zero-shot para ofertas de empleo en ingles, publicado por el equipo de Jobicy bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero ni de un fine-tuning supervisado: es un pipeline que reutiliza el encoder preentrenado `sentence-transformers/all-MiniLM-L6-v2` (transformer de 6 capas, 384 dimensiones de embedding) exportado a ONNX en cuantizacion INT8, y lo combina con 135 textos de referencia escritos manualmente para puntuar la similitud semantica entre una oferta y 27 categorias laborales.

El problema que aborda es concreto: asignar una categoria ocupacional a un titulo y/o descripcion de empleo sin disponer de un dataset etiquetado. La clasificacion se resuelve por comparacion de embeddings contra definiciones y roles ilustrativos por categoria, con una heuristica de agregacion (0,75 por similitud maxima + 0,25 por media de las dos mejores) y ponderacion titulo/descripcion de 0,6/0,4. Todo el proceso corre en CPU, offline, sin GPU ni PyTorch.

Su relevancia actual es la de un componente ligero y desplegable en entornos con recursos limitados: el repositorio ocupa 0,0 GB, no requiere red tras la instalacion y expone CLI (incluido procesamiento por lotes CSV) y API Python. Conviene subrayar que el autor lo etiqueta explicitamente como prototipo v0.1.0 y advierte de que los umbrales de decision no estan calibrados sobre ofertas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de similitud semantica sobre encoder transformer (all-MiniLM-L6-v2, 6 capas, 384 dimensiones) exportado a ONNX |
| Parametros totales | No disponible (el modelo base MiniLM-L6 ronda los 22,7 M, dato no declarado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens por codificacion; descripciones largas muestreadas en hasta 8 fragmentos de 220 tokens |
| Tipos de cuantizacion | ONNX INT8 (export AVX2 sin firmar, 8 bits); no se documentan otras variantes |
| Idiomas soportados | Ingles (declarado `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (bundle con ficheros incluidos en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo sino un sistema de recuperacion/clasificacion por embeddings. El encoder es all-MiniLM-L6-v2, con pooling por media ponderada con attention mask y normalizacion L2, produciendo vectores de 384 dimensiones. Cada categoria se representa mediante cinco textos de referencia (una definicion y cuatro roles ilustrativos), lo que da 135 vectores prototipo en total. La puntuacion por categoria combina la similitud maxima con la media de las dos mejores similitudes; cuando existen titulo y descripcion, se agregan con pesos 0,6 y 0,4 respectivamente. El preprocesado limpia HTML e ignora el contenido de etiquetas `script` y `style`.

No hubo entrenamiento supervisado ni ajuste fino: el autor indica explicitamente que no se uso ningun dataset de ofertas etiquetado para esta version y que la taxonomia es una lista de partida practica, no un estandar oficial ni una copia de la taxonomia interna de Jobicy. Tampoco se documentan fases de RLHF, DPO ni aprendizaje por refuerzo. La innovacion tecnica destacable es de ingenieria mas que de modelado: despliegue ONNX INT8 en CPU, muestreo uniforme de descripciones largas en fragmentos de 220 tokens (incluyendo el final), y una capa de salvaguardas que devuelve categoria nula y flag de revision ante baja similitud, scripts de escritura no soportados o entradas vacias, en lugar de inventar una categoria.

## Capacidades

- Clasificacion de titulos y descripciones de empleo en ingles en una de 27 categorias ocupacionales (desarrollo de software, datos e IA, ciberseguridad, finanzas, salud, logistica, etc.).
- Clasificacion zero-shot: no requiere entrenamiento adicional para operar con la taxonomia incluida.
- Devolucion de categoria primaria, tres mejores candidatos, similitudes de ranking y flags de revision (`needs_review`).
- Procesamiento de descripciones con HTML, ignorando `script` y `style`.
- Procesamiento por lotes de ficheros CSV UTF-8 con columnas `title` y/o `description`, preservando el resto de columnas.
- API Python (`JobCategoryClassifier.predict`) con reutilizacion del modelo inicializado para multiples ofertas.
- Inferencia completamente offline en CPU, sin GPU ni PyTorch.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Normalizacion de taxonomias en portales de empleo: ingerir ofertas de multiples fuentes y mapear titulos heterogeneos ("Senior React Developer", "Frontend Engineer II") a una categoria comun, usando los candidatos alternativos para resolver ambiguedades antes de publicar.
- Enrutamiento de candidaturas en ATS: clasificar automaticamente cada vacante al recibirla y dirigirla al reclutador o equipo responsable, aprovechando el procesamiento por lotes CSV para migraciones masivas de historicos.
- Etiquetado previo para anotacion humana: usar la salida del modelo como sugerencia y el flag `needs_review` como criterio de triaje, de modo que solo las ofertas con baja similitud o margen estrecho lleguen a revision manual.
- Filtrado y segmentacion de bolsas de empleo: agrupar ofertas por ocupacion para construir buscadores facetados o informes de demanda por categoria sin depender de palabras clave exactas.
- Despliegue en entornos con restricciones de infraestructura: servicios en contenedores sin GPU, entornos air-gapped o estaciones de trabajo modestas, gracias al bundle ONNX INT8 y a la ausencia de dependencia de red tras la instalacion.
- Enriquecimiento de datasets de investigacion sobre mercado laboral: clasificar corpus de ofertas en ingles para estudios de distribucion ocupacional, asumiendo validacion manual de la muestra por tratarse de un prototipo.
- Preclasificacion en pipelines de moderacion o deduplicacion: descartar o marcar ofertas fuera de taxonomia antes de procesos mas costosos, ya que el modelo devuelve categoria nula en lugar de forzar una asignacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1 ni comparaciones cuantitativas, y advierte que las puntuaciones devueltas son similitudes semanticas, no probabilidades calibradas. Los umbrales de similitud minima (0,33) y margen (0,035) se describen como heuristicas provisionales no calibradas sobre ofertas reales.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU mediante ONNX Runtime.
- GPU: no necesaria ni soportada por el bundle incluido. No se documenta soporte CUDA.
- CPU: se requiere un procesador de 64 bits con soporte AVX2 para el export INT8 incluido; probado en Windows x64 con Python 3.14.10.
- Memoria y disco: repositorio de 0,0 GB; el encoder MiniLM INT8 y los 135 vectores prototipo son de tamano reducido, por lo que cabe holgadamente en cualquier equipo de desarrollo convencional.
- Entorno: Python 3.11 a 3.14, 64 bits, con sistema operativo compatible con ONNX Runtime. Windows, Linux y macOS segun lo indicado (en Linux/macOS se sustituye la ruta del interprete del venv).
- Despliegue: ejecucion directa con `classify.py`, integracion via `classifier.JobCategoryClassifier` o script interactivo `start.cmd` en Windows. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jobicy/job-category-classifier | Clasificador zero-shot por embeddings (ONNX INT8) | No disponible (base MiniLM-L6) | 256 tokens por codificacion | Apache 2.0 | Hugging Face, bundle offline |
| sentence-transformers/all-MiniLM-L6-v2 | Encoder de frases generico | No disponible en la informacion | No disponible en la informacion | Apache 2.0 | Hugging Face |
| Clasificadores supervisados de ofertas de empleo | Modelos fine-tuned sobre datasets etiquetados | Variable | Variable | Variable | No disponible |

La comparacion relevante es que este paquete anade a all-MiniLM-L6-v2 una taxonomia de 27 categorias, una heuristica de agregacion y salvaguardas de revision, pero renuncia a la calibracion supervisionada. Frente a un clasificador entrenado con datos etiquetados, cabe esperar menor exactitud en categorias adyacentes y en roles mixtos; no se dispone de cifras para cuantificar la diferencia.

## Limitaciones y advertencias

- Es un prototipo v0.1.0 sin entrenamiento supervisado; el autor lo declara explicitamente y no garantiza exactitud.
- Las puntuaciones son similitudes semanticas, no probabilidades; no representan un porcentaje medido de acierto.
- Los umbrales de similitud minima (0,33) y margen (0,035) no estan calibrados sobre ofertas reales; `needs_review=false` no implica correccion.
- Solo admite ingles; las entradas con escritura predominantemente no soportada devuelven categoria nula.
- Devuelve una categoria primaria con alternativas, no decisiones multi-etiqueta validadas; los roles mixtos y las ocupaciones adyacentes son ambiguos.
- Las ofertas fuera de la taxonomia pueden requerir enrutamiento manual; la taxonomia es una lista de partida, no un estandar oficial.
- Los titulos largos se truncan en el encoder; las descripciones muy largas se muestrean en fragmentos y se marcan para revision, con posible perdida de matices.
- Riesgo de sesgo heredado del encoder preentrenado y de los textos de referencia redactados manualmente, que pueden favorecer determinadas formulaciones de titulos.
- En el procesamiento por lotes, un CSV estructuralmente malformado aborta la ejecucion y la salida ya escrita queda parcial y debe descartarse; el CLI no sobrescribe ficheros existentes.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantias ni soporte; conviene validar con una muestra anotada antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jobicy/job-category-classifier
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
