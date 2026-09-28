# ailab-bio/PROTAC-Splitter-XGBoost

## Resumen

PROTAC-Splitter XGBoost es un clasificador de aristas de grafo molecular entrenado con XGBoost que se utiliza dentro de la herramienta PROTAC-Splitter para dividir moleculas PROTAC (degradadores heterobifuncionales) en sus tres subestructuras constituyentes: el ligando de E3, el enlazador (linker) y la cabeza de guerra (warhead) dirigida a la proteina de interes (POI). Dado el grafo molecular de un PROTAC, el modelo puntua cada enlace candidato segun la probabilidad de que sea uno de los dos puntos de corte que separan las tres subestructuras.

No se trata de un modelo de lenguaje: es un modelo de aprendizaje automatico clasico (gradient boosting sobre arboles de decision) empaquetado en un pipeline de scikit-learn y serializado en formato joblib. Su entrada son caracteristicas derivadas de un grafo quimico y su salida es una puntuacion por arista, no texto. Por tanto, conceptos habituales en fichas de LLM como longitud de contexto, cuantizacion o idiomas no son aplicables.

Es relevante para flujos de trabajo de descubrimiento de farmacos, porque la descomposicion anatomica de PROTAC es un paso previo habitual en tareas de analisis de relacion estructura-actividad, curation de bases de datos, cribado de bibliotecas y generacion de datos de entrenamiento para modelos generativos de degradadores. El repositorio lo publica la organizacion ailab-bio, con licencia MIT y 0 descargas registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre arboles de decision (XGBoost) dentro de un pipeline de scikit-learn (`GraphEdgeClassifier`) |
| Parametros totales | no disponible (el manifest.json incluye hiperparametros, pero la model card no los reproduce) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre grafos moleculares) |
| Tipos de cuantizacion | no aplica (no se distribuyen pesos en FP16/INT8 ni variantes GGUF) |
| Idiomas soportados | no aplica (la entrada es una representacion quimica, tipicamente SMILES) |
| Licencia | MIT |
| Formato de pesos | joblib (`PROTAC-Splitter-XGBoost.joblib`), mas `manifest.json` con hiperparametros, listas de caracteristicas y checksum SHA-256 |
| Tarea | Clasificacion de aristas de grafo (graph edge classification) |
| Libreria declarada | xgboost |
| Autor / organizacion | ailab-bio |
| Tamano del repositorio | 0.0 GB (redondeado en la interfaz de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un clasificador de aristas de grafo: a partir de un grafo molecular, se extraen caracteristicas por enlace candidato y un modelo XGBoost estima la probabilidad de que ese enlace sea uno de los dos puntos de escision que delimitan las tres subestructuras del PROTAC (ligando de E3, linker y warhead). La implementacion distribuida es un pipeline de scikit-learn que envuelve XGBoost, serializado con joblib y cargable mediante `GraphEdgeClassifier.from_pretrained("ailab-bio/PROTAC-Splitter-XGBoost")`.

Los datos de entrenamiento proceden del dataset curado PROTAC-Splitter, publicado en Zenodo con DOI 10.5281/zenodo.15797309. La model card no especifica el numero de moleculas, la composicion exacta del conjunto, el esquema de particion (train/validacion/test) ni si se aplicaron tecnicas de ajuste posteriores. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio enfoque de clasificacion de aristas sobre el grafo completo de la molecula.

## Capacidades

- Prediccion de puntos de corte en el grafo de un PROTAC para separarlo en ligando de E3, linker y warhead.
- Puntuacion por enlace candidato, lo que permite inspeccionar el grado de confianza del modelo en cada posible escision.
- Integracion directa en la funcion `split_protac("<PROTAC SMILES>", model="xgboost")` del paquete `protac_splitter`, que descarga y cachea el modelo automaticamente.
- Carga independiente como componente (`GraphEdgeClassifier`) para su uso dentro de pipelines de quimioinformatica propios.
- Verificacion de integridad del artefacto mediante el checksum SHA-256 incluido en `manifest.json`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto: no es un modelo generativo ni multimodal.

## Casos de uso

- Descomposicion automatizada de PROTAC en pipelines de quimioinformatica: llamando a `split_protac()` sobre cada SMILES de entrada se obtienen los tres fragmentos sin intervencion manual, lo que sustituye la anotacion experta repetitiva en lotes grandes de compuestos.
- Cribado de bibliotecas de degradadores: al procesar colecciones internas de moleculas heterobifuncionales, el modelo permite clasificar rapidamente cada compuesto por tipo de warhead, linker y ligando de E3 reclutado.
- Analisis de relacion estructura-actividad (SAR): al disponer de la particion consistente de cada serie quimica, se pueden agrupar compuestos por warhead o por ligando de E3 y comparar variaciones del linker de forma sistematica.
- Construccion de datasets para modelos generativos de PROTAC: las etiquetas de punto de corte generadas sirven como supervision para entrenar o evaluar modelos de generacion de degradadores y para tareas de ensamblaje modular de fragmentos.
- Planificacion sintetica y quimica medicinal: identificar la particion warhead-linker-E3 ayuda a definir estrategias de sintesis convergente, ya que los bloques resultantes suelen corresponder a modulos sintetizables por separado.
- Curation y normalizacion de bases de datos quimicas: al detectar los puntos de corte esperados, el modelo puede senalar registros mal anotados o moleculas que no encajan en el patron heterobifuncional.
- Validacion automatica en pipelines de CI para quimica: integrable como paso de control que verifica que los compuestos registrados en un catalogo interno son PROTAC parseables y consistentes antes de su publicacion.
- Docencia y visualizacion estructural: la salida por enlace facilita ilustrar en entornos formativos como se descompone un degradador heterobifuncional en sus tres modulos funcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, precision ni recall, y tampoco ofrece comparaciones cuantitativas con otras aproximaciones de particion de PROTAC.

## Requisitos de hardware

- Inferencia en CPU: es un modelo de arboles XGBoost sobre caracteristicas de grafo; no requiere GPU en ningun escenario.
- VRAM estimada: no aplica. El modelo no usa aceleracion grafica.
- Memoria principal: no disponible de forma explicita; el repositorio figura como 0.0 GB redondeado, por lo que el artefacto joblib es de tamano reducido y el consumo dominante proviene del entorno de Python (scikit-learn, XGBoost, RDKit y el propio paquete `protac_splitter`).
- GPU recomendadas: ninguna. Cualquier maquina con CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: no aplica; no se necesita una RTX 4090, A100 ni H100 para ejecutarlo.
- Opciones de despliegue: carga directa con joblib, uso a traves del paquete `protac_splitter`, o exposicion como servicio HTTP (por ejemplo con FastAPI) dentro de un contenedor Docker. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no publicados por el autor. Como referencia no verificada, un clasificador de arboles de este tipo suele resolver cada molecula en el orden de milisegundos en CPU, pero este dato no procede de mediciones del autor y debe validarse en el entorno de despliegue concreto.

## Comparativa con modelos similares

La informacion disponible no incluye datos cuantitativos de otras herramientas de particion de PROTAC, por lo que no es posible establecer una comparacion numerica fiable.

| Alternativa | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PROTAC-Splitter XGBoost | Clasificador de aristas de grafo (XGBoost) | no disponible | no aplica | no disponible | MIT | HuggingFace + GitHub |
| Otras opciones del paquete `protac_splitter` (si existen) | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |
| Reglas heuristicas o curacion manual de puntos de corte | Enfoque no aprendido | no aplica | no aplica | no disponible | no aplica | no aplica |

La model card menciona el parametro `model="xgboost"` en `split_protac()`, lo que sugiere que la herramienta podria admitir otros clasificadores, pero no se documentan sus caracteristicas ni su rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un unico dataset curado (PROTAC-Splitter, Zenodo 10.5281/zenodo.15797309), su dominio de aplicabilidad queda restringido a moleculas quimicamente similares a las de ese conjunto.
- Riesgo de error en la prediccion: al ser un clasificador, puede asignar puntos de corte incorrectos en PROTAC atipicos, con linkers poco frecuentes o con motivos quimicos poco representados en el entrenamiento. No se publican tasas de error ni intervalos de confianza calibrados.
- Ausencia de validacion externa: con 0 descargas y 0 likes registrados, no hay evidencia de uso independiente ni de replicacion de resultados por terceros.
- Ambito restringido: no es un modelo de lenguaje ni un modelo generativo; no admite prompts en lenguaje natural ni tareas fuera de la particion de grafos moleculares.
- Idiomas: no aplica, pero conviene recordar que la entrada debe ser una representacion quimica valida (SMILES u otra soportada por el paquete); entradas malformadas no produciran resultados utiles.
- Licencia: MIT, permisiva y compatible con uso comercial. Aun asi, conviene revisar las condiciones de la herramienta `protac_splitter` y de sus dependencias (RDKit, XGBoost, scikit-learn) antes de un despliegue en produccion.
- Dependencias: el uso practico exige el paquete `protac_splitter` y su ecosistema; la carga directa del joblib requiere reconstruir el pipeline de scikit-learn esperado.
- Metadatos: las fechas del repositorio (creacion y actualizacion el 2026-09-28) son incoherentes con la fecha de consulta, lo que sugiere un error de registro en la plataforma y no debe tomarse como referencia temporal fiable.
- Trazabilidad: la reproducibilidad del artefacto depende del `manifest.json`, que incluye hiperparametros, listas de caracteristicas y el checksum SHA-256 del fichero de modelo; se recomienda verificarlo en cada despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ailab-bio/PROTAC-Splitter-XGBoost
- Repositorio de la herramienta PROTAC-Splitter: https://github.com/ribesstefano/PROTAC-Splitter
- Dataset de entrenamiento (Zenodo): https://doi.org/10.5281/zenodo.15797309
