# iaac-maai/day3-team1-facade-typologies

## Resumen

`iaac-maai/day3-team1-facade-typologies` es un pipeline de scikit-learn (`StandardScaler` + `KMeans`, k = 6) que asigna un edificio de Nueva York sujeto al Facade Inspection & Safety Program (FISP, Local Law 11) a una de seis tipologias de fachada. La asignacion se basa en la composicion material de la fachada y en el historial de comportamiento del edificio en sus inspecciones quinquenales. El modelo esta pensado para el Department of Buildings (DOB) de Nueva York, consultores de fachada y planificadores de rehabilitacion, con el objetivo de organizar un programa de actuacion por tipo de edificio: guias de inspeccion, especificaciones de reparacion y criterios de enforcement.

Tecnicamente no es un modelo de lenguaje ni una red neuronal: es un agrupamiento no supervisado clasico sobre 13 variables numericas derivadas de las presentaciones FISP de cada edificio (BIN). El pipeline se ajusto sobre 15.763 edificios, agregados a partir de 67.659 presentaciones limpias, y se distribuye como un unico fichero `model.joblib` con el pipeline completo. La novedad practica es que convierte un registro administrativo masivo en seis arquetipos interpretables (ladrillo simple de bajo riesgo, terracota y piedra de preguerra, hormigon y ladrillo de posguerra, fachadas de ladrillo reiteradamente inseguras, muros cortina de vidrio y metal, y fachadas sin materiales declarados), lo que permite segmentar carteras de edificios y priorizar recursos de inspeccion.

Su relevancia es acotada pero clara: es un artefacto docente del curso AI Methods I (IAAC MaAI 2026/27), sin descargas ni likes en el momento de la consulta, y con un alcance explicitamente limitado a edificios de mas de seis plantas, en Nueva York, con historial en los ciclos 6 a 10 de FISP. No debe confundirse con un modelo predictivo de la proxima inspeccion ni con una herramienta de juicio ingenieril o de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `StandardScaler` + `KMeans` (clustering no supervisado) |
| Parametros totales | no disponible (no es un modelo parametrico en el sentido de redes neuronales; el estado son los 6 centroides y los parametros de escalado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 13 columnas por edificio, sin secuencia) |
| Tipos de cuantizacion | no aplica; el artefacto se distribuye como `model.joblib` |
| Idiomas soportados | no disponible (no procesa texto; los datos de origen estan en ingles) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (pipeline scikit-learn serializado con joblib) |

Otros hiperparametros y detalles de serializacion: `n_clusters=6`, `n_init=50`, `random_state=42`; versiones de referencia Python 3.12.4, scikit-learn 1.9.1, pandas 3.1.0, numpy 2.5.4 y joblib 1.6.0. La variable `log_penalty` se calcula previamente como `log10(total penalty + 1)`.

## Arquitectura y entrenamiento

El modelo es un agrupamiento K-Means sobre 13 caracteristicas numericas por edificio, precedido de un `StandardScaler` que normaliza cada variable. Las entradas describen el historial FISP agregado: `share_unsafe` y `share_swarmp` (proporcion de informes iniciales UNSAFE y SWARMP), `followups_per_cycle` (presentaciones enmendadas y posteriores divididas por numero de ciclos), `log_penalty` (logaritmo decimal de las penalizaciones FISP totales en USD mas uno), `n_cycles` (ciclos con informe inicial, de 1 a 5), `n_materials` (numero de materiales de fachada listados, excluyendo "other", de 0 a 7) y siete variables binarias de material: `MATERIAL_MASONRY`, `MATERIAL_TERRA_COTTA`, `MATERIAL_NATURAL_STONE`, `MATERIAL_CONCRETE`, `MATERIAL_STUCCO_EIFS`, `MATERIAL_GLASS` y `MATERIAL_METAL`. El orden exacto de las 13 columnas forma parte del contrato de entrada.

Los datos de entrenamiento proceden de DOB NOW: Safety – Facades Compliance Filings del NYC Department of Buildings, bajo licencia de NYC Open Data (terminos de uso de NYC, uso publico gratuito). El proceso de limpieza se realizo en un cuaderno previo (de 87.483 a 67.659 presentaciones) y la agregacion por edificio (BIN) produjo 15.763 filas. La cobertura es Nueva York, edificios de mas de seis plantas, ciclos FISP 6 a 10 (aproximadamente 2004-2026), con descarga del 23 de octubre de 2026. No hay entrenamiento supervisado, ni RLHF, ni DPO, ni fases de ajuste fino: el unico ajuste es la minimizacion de la inercia intra-cluster de K-Means con 50 inicializaciones. La asignacion de edificios nuevos se hace con `.predict()`, es decir, por centroide mas cercano tras el escalado; no requiere un clasificador auxiliar.

## Capacidades

- Agrupamiento no supervisado de edificios FISP en seis tipologias de fachada (clusters 0 a 5).
- Asignacion de edificios nuevos mediante `.predict()` sobre el centroide mas cercano, sin reentrenamiento.
- Manejo de variables heterogeneas en escala mediante estandarizacion previa dentro del pipeline.
- Interpretabilidad directa: cada cluster tiene un perfil material y de comportamiento de inspeccion documentado.
- Segmentacion de carteras por material dominante (ladrillo, terracota, piedra natural, hormigon, estuco/EIFS, vidrio, metal).
- Identificacion de subgrupos de riesgo por historial (por ejemplo, el cluster 4 agrupa fachadas de ladrillo reiteradamente inseguras).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo generativo.
- No procesa imagenes, audio ni texto libre; la entrada es exclusivamente tabular.

## Casos de uso

- Segmentacion de carteras de edificios para el DOB: aplicar el pipeline a un lote de edificios FISP y agruparlos por tipologia para disenar programas de inspeccion diferenciados, ya que el cluster 1 (ladrillo simple de bajo riesgo) concentra el 38,4% de los casos y requiere menos esfuerzo que el cluster 4.
- Priorizacion de enforcement: listar los edificios del cluster 4 (fachadas de ladrillo reiteradamente inseguras, con `share_unsafe` medio de 0,68 y mediana de penalizaciones de 119.000 USD) para revision administrativa o inspeccion dirigida.
- Planificacion de rehabilitacion por material: usar los clusters 2 (terracota y piedra de preguerra, 88% en Manhattan, mediana de ano 1920) y 5 (muros cortina de vidrio y metal, mediana de ano 1997, 15 plantas) para agrupar edificios con especificaciones de reparacion homogeneas y contratar lotes de obra coherentes.
- Analisis de calidad de datos: el cluster 0 (6,5% de los datos, 49% sin material declarado) sirve para detectar edificios con informes FISP incompletos y lanzar campanas de completado de registros antes de cualquier analisis posterior.
- Investigacion urbana y estudios de tipologia: cruzar los clusters con PLUTO (ano de construccion, plantas, borough) para estudiar la distribucion espacial de tipologias de fachada, teniendo en cuenta que esas variables no son entradas del modelo.
- Apoyo a consultores de fachada: clasificar rapidamente un edificio concreto a partir de su historial de presentaciones y orientar la propuesta tecnica hacia el programa de reparacion tipico de su cluster.
- Docencia y reproducibilidad: servir como ejemplo completo de pipeline de clustering con scikit-learn serializado en joblib, con contrato de entrada documentado y dataset asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de agrupamiento (silhouette, Davies-Bouldin, inercia) ni comparaciones cuantitativas con otras segmentaciones. Los unicos datos cuantitativos publicados son descriptivos de los clusters: reparto de la muestra (6,5%, 38,4%, 20,7%, 10,7%, 14,9% y 8,7%) y estadisticos internos (por ejemplo, `share_unsafe` de 0,09 en el cluster 1 y de 0,68 en el cluster 4; 0,69 seguimientos por ciclo en el cluster 4; 94% de terracota y 60% de piedra en el cluster 2; 89% de vidrio y 92% de metal en el cluster 5).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo no usa GPU. El estado completo son seis centroides de 13 dimensiones mas los parametros del escalador, con un peso despreciable.
- GPU recomendadas: ninguna. La inferencia se ejecuta en CPU.
- Cabe en cualquier GPU consumer y, de hecho, no la necesita; tambien cabe en CPU de un solo nucleo y en entornos sin acelerador.
- Opciones de despliegue: carga directa con `joblib.load` en Python 3.12 con scikit-learn 1.9.1 (o version compatible), servido mediante FastAPI, Flask o un script por lotes; no aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza del algoritmo (una multiplicacion matriz-centroides de 13 dimensiones por fila) el coste por prediccion es minimo, pero no se han publicado mediciones.
- El repositorio ocupa 0,0 GB segun HuggingFace, coherente con un artefacto joblib de muy poco tamano.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de clustering de tipologias de fachada ni artefactos comparables de la misma categoria, por lo que no es posible establecer una comparativa con parametros, contexto, rendimiento y licencia de alternativas.

## Limitaciones y advertencias

- No predice la proxima inspeccion: los clusters describen el pasado. Para esa pregunta el autor remite a su modelo del Day 2.
- No emite juicios de ingenieria ni de seguridad: un edificio clasificado como de bajo riesgo sigue necesitando su inspeccion FISP.
- Fuera de alcance para edificios no sujetos a FISP (seis plantas o menos), fuera de Nueva York o con historial de fachada fuera de los ciclos 6 a 10.
- Requiere al menos un informe inicial FISP para calcular las proporciones; los edificios sin historial de inspeccion no se pueden clasificar.
- El cluster 0 es en parte un grupo de calidad de datos (49% sin material declarado), no una tipologia constructiva real; tratarlo como tal puede inducir a error.
- Riesgo de asignaciones poco fiables en edificios con historiales muy incompletos o con materiales mal codificados en las presentaciones originales.
- No se han publicado metricas de calidad de agrupamiento ni analisis de estabilidad de los clusters; la eleccion de k = 6 no esta justificada con datos en la informacion disponible.
- Sin datos sobre sesgos por borough, ano de construccion o tipologia de propietario mas alla de los perfiles descriptivos; la concentracion geografica de los clusters 2 y 5 en Manhattan condiciona cualquier uso agregado.
- Licencia MIT para el artefacto, pero los datos de origen estan sujetos a los terminos de uso de NYC Open Data; conviene revisar las condiciones de redistribucion si se publican derivados.
- Entorno de ejecucion sensible a versiones: scikit-learn 1.9.1, pandas 3.1.0, numpy 2.5.4 y joblib 1.6.0 son las versiones de referencia; deserializar con versiones muy distintas puede producir avisos o cambios de comportamiento.
- Es un trabajo de curso (IAAC MaAI 2026/27) sin descargas ni validacion externa; no debe usarse como componente critico en produccion sin una validacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iaac-maai/day3-team1-facade-typologies
- Dataset agrupado: https://huggingface.co/datasets/iaac-maai/day3-team1-nyc-facade-typologies
- Repositorio GitHub con el analisis completo: https://github.com/iaac-maai/group1_day3_assignment
- Datos originales DOB NOW: Safety – Facades Compliance Filings: https://data.cityofnewyork.us/d/xubg-57si
- Terminos de uso de NYC Open Data: https://www.nyc.gov/home/terms-of-use.page
