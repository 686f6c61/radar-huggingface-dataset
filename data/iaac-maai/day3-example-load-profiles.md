# iaac-maai/day3-example-load-profiles

## Resumen

`iaac-maai/day3-example-load-profiles` es un modelo de clustering no supervisado publicado en HuggingFace por el equipo del curso AI Methods I del IAAC (Institute for Advanced Architecture of Catalonia). No es un modelo de lenguaje ni una red neuronal: es un pipeline de scikit-learn compuesto por un `Normalizer(norm="l1")` y un `KMeans` con `n_clusters=4`, serializado en un fichero `model.joblib` de 8 KB. Su funcion es asignar un dia completo de consumo electrico de una vivienda (24 valores horarios en kW) a uno de cuatro perfiles tipicos de uso diario.

El modelo se entrena sobre 1.411 dias completos medidos en una unica vivienda en Sceaux, cerca de Paris, entre diciembre de 2006 y noviembre de 2010, a partir del dataset publico Individual Household Electric Power Consumption de Hebrail y Berard (UCI). La normalizacion L1 hace que el modelo agrupe la forma de la curva (el reparto porcentual del consumo a lo largo del dia) y no el volumen total, de modo que dias con consumos muy distintos pero con la misma estructura horaria caen en el mismo cluster.

Es relevante ahora como ejemplo docente de como se publica un modelo de machine learning clasico con su model card completa: documenta hiperparametros, datos de entrenamiento, evaluacion de estabilidad, limitaciones y usos fuera de alcance. No esta pensado para produccion ni para generalizar a otros edificios, sino para ilustrar el flujo completo de un analisis no supervisado aplicado al entorno construido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `Normalizer(norm="l1")` + `KMeans` |
| Parametros totales | No aplica (modelo de clustering; 4 centroides de 24 dimensiones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada fija de 24 columnas (`h00`…`h23`) |
| Tipos de cuantizacion | No disponible (no aplica; el artefacto es un `joblib` de 8 KB) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (pipeline scikit-learn serializado) |

## Arquitectura y entrenamiento

El modelo no es una red neuronal sino un algoritmo de clustering clasico. La entrada es un `pandas.DataFrame` con exactamente 24 columnas numericas (`h00` a `h23`), una por hora del dia, que contienen la potencia activa media del hogar en kW durante esa hora. Todas las filas deben estar completas (sin horas faltantes) y ser no negativas. El `Normalizer(norm="l1")` divide cada fila por su suma, de forma que cada dia queda representado como la proporcion del consumo total que corresponde a cada hora. No se aplica `StandardScaler` porque las 24 columnas comparten unidad.

Sobre esa representacion se ajusta un `KMeans` con `n_clusters=4`, `n_init=10` y `random_state=42`. Los datos de entrenamiento son 1.411 dias completos derivados de aproximadamente 2 millones de lecturas minutales de `Global_active_power`, agregadas a medias horarias (una hora se considera valida si tiene al menos 45 de sus 60 minutos) y luego a filas diarias (solo se conservan dias con las 24 horas validas). La eleccion de k no responde a un criterio cuantitativo: el silhouette score es bajo para todo k entre 2 y 8 (0,13 con k=2 y 0,10 con k=4) y la curva del codo no presenta un quiebre claro, porque los habitos diarios forman un continuo. Se fija k=4 por interpretabilidad, para obtener cuatro perfiles nombrables y accionables.

La estabilidad se evaluo con el adjusted Rand index (ARI) frente a la agrupacion final: 0,98 de media (0,96 minimo) con 10 semillas aleatorias distintas, 0,85 de media (0,45 minimo) con 10 submuestras aleatorias del 80% de los dias, y 0,34 frente a clustering jerarquico (ward) con k=4.

## Capacidades

- Asignacion de un dia de consumo electrico (24 valores horarios en kW) a uno de cuatro perfiles: workday con presencia matinal (cluster 0, 33,5% de los dias), at home all day (cluster 1, 26,3%), workday con casa vacia (cluster 2, 25,6%) y nobody home (cluster 3, 14,7%).
- Agrupacion por forma de la curva, no por volumen: la normalizacion L1 elimina la dependencia del consumo total diario.
- Etiquetado de dias para analisis posterior: conteo de dias laborables con casa vacia (candidatos a bajar el setpoint de calefaccion diurno) o deteccion de periodos vacacionales en datos de contador.
- Inferencia determinista y reproducible gracias a `random_state=42`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, vision ni audio: es un modelo tabular de clustering.
- No dispone de capacidades multilingues ni de generacion de ningun tipo.

## Casos de uso

- Conteo de dias laborables con casa vacia en una vivienda: el modelo etiqueta cada dia como cluster 2 (workday, empty house) y permite cuantos dias al ano la vivienda queda sin ocupantes en horario diurno, informacion util para programar reducciones del setpoint de calefaccion o refrigeracion.
- Deteccion de periodos vacacionales en datos de contador: los dias del cluster 3 (nobody home), concentrados en agosto (55% de los dias de agosto) y julio (28%), permiten identificar ausencias prolongadas de forma automatica a partir de lecturas horarias.
- Segmentacion de la demanda para tarifas horarias: conocer la distribucion de perfiles diarios ayuda a estimar que proporcion del consumo cae en horas punta y a evaluar el impacto de cambiar habitos o de instalar almacenamiento.
- Analisis exploratorio para estudiantes y docentes: sirve como ejemplo trabajado de pipeline no supervisado completo (preprocesado, eleccion de k, evaluacion de estabilidad, model card) en el curso AI Methods I del IAAC.
- Etiquetado de datasets de consumo para entrenar modelos supervisados posteriores: las etiquetas de perfil diario pueden usarse como variable objetivo o como feature en modelos de prediccion de demanda.
- Investigacion sobre habitos de ocupacion inferidos de la electricidad: la comparacion de los clusters con variables que el modelo nunca vio (dia de la semana, mes, total diario) permite estudiar la relacion entre forma de la curva y ocupacion real.
- Docencia en analisis de datos energeticos: reproduccion del analisis completo desde el notebook del repositorio de GitHub, con datos publicos y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de estabilidad interna del clustering:

| Comprobacion | ARI medio | ARI minimo |
|---|---|---|
| 10 semillas aleatorias distintas | 0,98 | 0,96 |
| 10 submuestras aleatorias del 80% de los dias | 0,85 | 0,45 |
| Clustering jerarquico (ward), k=4 | 0,34 | No disponible |

Silhouette score: 0,13 con k=2 y 0,10 con k=4 (bajo para todo k entre 2 y 8).

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo es un `joblib` de 8 KB que se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, incluida una Raspberry Pi.
- Opciones de despliegue: Python con scikit-learn 1.9.1, pandas 3.0.6, numpy 2.5.3 y Python 3.12.3 (versiones con las que se genero el artefacto); carga directa con `joblib.load("model.joblib")`. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explicita; para 1.411 filas de 24 columnas el ajuste y la prediccion con KMeans son operaciones de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iaac-maai/day3-example-load-profiles | KMeans (scikit-learn) | 4 centroides x 24 dimensiones | 24 columnas horarias | MIT | HuggingFace |
| Clustering jerarquico (ward) sobre los mismos datos | Aglomerativo | No aplica | 24 columnas horarias | No aplica | Referencia interna del analisis (ARI 0,34 frente al modelo) |
| Otros modelos de load profiling | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos publicos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo de proposito exclusivamente docente: no esta validado para produccion ni para decisiones reales sobre hogares u ocupantes.
- Entrenado con una unica vivienda en Sceaux (Francia) entre 2006 y 2010; no generaliza a otros edificios (oficinas, escuelas, comercios) ni a distritos, aunque forzara cualquier entrada a uno de los cuatro perfiles.
- No contempla hogares con equipamiento distinto al del dataset original: carga nocturna de coche electrico, bombas de calor o fotovoltaica en cubierta no estan representadas en los datos.
- Solo modela la forma de la curva, nunca el volumen: no sirve para predecir cuanto consumira un dia.
- Requiere las 24 horas completas y valores no negativos; no gestiona datos faltantes.
- El silhouette score es bajo (0,10 con k=4) y la curva del codo no tiene quiebre claro: la eleccion de k=4 es una decision de interpretabilidad, no una separacion natural de los datos.
- La estabilidad frente a submuestras es limitada: ARI minimo de 0,45 en submuestras del 80%, lo que indica cierta sensibilidad a la composicion del conjunto de entrenamiento.
- Los nombres de los clusters son una interpretacion de los autores a partir de variables que el modelo no uso (dia de la semana, mes, total diario); no son etiquetas supervisadas.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el uso comercial no esta recomendado dado el caracter docente y la falta de validacion fuera del dataset original.
- Riesgo de alucinacion no aplica (no genera texto), pero si existe riesgo de asignaciones erroneas en datos fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iaac-maai/day3-example-load-profiles
- Dataset procesado: https://huggingface.co/datasets/iaac-maai/day3-example-daily-load-profiles
- Repositorio GitHub del curso (notebook `Day_3/docs/application_of_unsupervised_learning.ipynb`): https://github.com/iaac-maai/ai-methods-1-2026
- Dataset original en UCI: https://archive.ics.uci.edu/dataset/235/individual+household+electric+power+consumption
- Dataset original en Kaggle: https://www.kaggle.com/datasets/uciml/electric-power-consumption-data-set
- Imagen de los cuatro perfiles: https://huggingface.co/iaac-maai/day3-example-load-profiles/resolve/main/load_profiles.png
