# rohithonchain/business-entity-resolution-lightgbm

## Resumen

El modelo `rohithonchain/business-entity-resolution-lightgbm` es un conjunto de dos clasificadores de gradient boosting (LightGBM) publicados por el usuario rohithonchain como parte de su solucion al Amazon ML Challenge 2026 sobre resolucion de entidades de negocio. No es un modelo de lenguaje ni un modelo de vision: es un modelo tabular que decide si un par formado por un registro de consulta y un registro candidato corresponde al mismo negocio del mundo real. La tarea consistia en enlazar cada registro de la Fuente 1 con todos los registros del mismo negocio presentes en las Fuentes 2 y 3, aproximadamente 1,7 millones de consultas contra unos 10 millones de registros ruidosos de Estados Unidos, India y Francia.

La solucion completa (recuperacion de candidatos, generacion de caracteristicas, entrenamiento, inferencia y decodificacion) obtuvo 0,9303 de macro F0.5 en la clasificacion publica del concurso. El repositorio incluye el modelo base, un clasificador de pares con 80 caracteristicas, 600 arboles, 31 hojas y tasa de aprendizaje 0,04, y un modelo meta que re-puntua cada par con el contexto de la consulta (41 caracteristicas base mas 14 de contexto por consulta, 341 arboles y 15 hojas).

Su relevancia practica es que el pipeline es reproducible y viene acompanado de una demo sintetica de extremo a extremo, lo que permite estudiar tecnicas de record linkage a escala industrial sin depender de los datos originales del concurso, que no se pueden compartir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre arboles de decision (LightGBM, crecimiento leaf-wise); dos modelos en cascada (base + meta) |
| Parametros totales | No disponible como numero de parametros; el modelo base tiene 600 arboles x 31 hojas y el meta 341 arboles x 15 hojas |
| Parametros activos | No aplica (no es un modelo MoE; son dos modelos GBDT independientes aplicados en cascada) |
| Longitud de contexto | No aplica; el modelo base consume 80 caracteristicas por par y el meta modelo 41 caracteristicas base mas 14 de contexto por consulta |
| Tipos de cuantizacion | No aplica (modelos de arboles serializados en texto plano; no se publican versiones cuantizadas) |
| Idiomas soportados | No disponibles; los datos de entrenamiento cubren registros de EE. UU., India y Francia, con rutas de transliteracion que incluyen escritura devanagari |
| Licencia | MIT |
| Formato de pesos | Texto plano de LightGBM (`base_lightgbm.txt`, `meta_lightgbm.txt`) mas ficheros JSON auxiliares de seleccion de modelo, resultados e importancia de caracteristicas |

## Arquitectura y entrenamiento

El sistema es una cascada de dos modelos LightGBM sobre caracteristicas tabulares. La primera etapa es una recuperacion dispersa multi-ruta que devuelve candidatos por consulta combinando TF-IDF con hashing sobre nombres y direcciones, uniones exactas, por sufijo y por clave de direccion (address-key), rutas de transliteracion y una ruta de rescate para registros con direccion ausente. Cada par (consulta, candidato) se representa con 80 caracteristicas: similitud de cadenas de nombre y direccion, acuerdo o conflicto numerico y postal, transliteracion, frecuencia, valores ausentes y rangos y puntuaciones de cada ruta de recuperacion. El modelo base puntua cada par y el modelo meta lo re-puntua anadiendo el contexto de la consulta (rango del candidato, distancia al mejor candidato, recuentos por encima de varios umbrales y la mejor puntuacion de la otra fuente). Los pares con puntuacion meta mayor o igual a 0,70 se convierten en enlaces, y si varias consultas reclaman el mismo destino, este se asigna a un unico propietario que debe liderar por al menos 0,05 en puntuacion meta.

El entrenamiento se hizo desde cero y exclusivamente con las etiquetas oficiales del concurso. El modelo base se ajusto con 5.001 entidades agrupadas (1,09 millones de pares candidatos muestreados, incluidos negativos dificiles); los datos de entrenamiento del modelo meta no constan en la informacion disponible, porque la model card esta truncada en ese punto. Las consultas de confirmacion se agruparon por claves normalizadas de nombre y direccion para evitar que duplicados cercanos cruzaran pliegues, y todos los umbrales se eligieron en un pliegue de ajuste independiente antes de la puntuacion de confirmacion. El repositorio incluye `base_model_selection.json`, que documenta la comparacion de LightGBM frente a XGBoost y regresion logistica, aunque los valores concretos de esa comparacion no aparecen en la informacion disponible.

## Capacidades

- Clasificacion binaria de pares con etiqueta de coincidencia o no coincidencia sobre datos tabulares.
- Puntuacion en dos etapas: un clasificador de pares y un meta modelo que aprovecha el contexto de la consulta.
- Generacion de caracteristicas de similitud y conflicto sobre nombres, direcciones, codigos postales y numeros, con rutas de transliteracion.
- Manejo de registros con direccion ausente mediante una ruta de rescate especifica.
- Decodificacion de propiedad incluida en `inference.py`, que garantiza un unico propietario por registro destino.
- No es un modelo generativo: no produce texto, no mantiene conversaciones, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no tiene capacidades de vision, audio o pensamiento explicito.
- Limitacion funcional clave: no puede puntuar cadenas crudas de nombre o direccion por si solo; espera exactamente las 80 caracteristicas producidas por `pair_features.py`, incluidas las puntuaciones y rangos de las rutas de recuperacion.

## Casos de uso

- Deduplicacion de bases de datos de clientes o proveedores: el modelo, entrenado con pares de negocios ruidosos, permite consolidar registros duplicados dentro de un mismo CRM aplicando las mismas 80 caracteristicas sobre los pares candidatos generados internamente.
- Integracion de catalogos tras fusiones o adquisiciones: dos empresas con esquemas de nombres y direcciones distintos pueden unificarse gracias a las rutas de transliteracion y a las caracteristicas de conflicto postal y numerico.
- Enriquecimiento de CRM con fuentes de terceros: el meta modelo, que usa el contexto de la consulta para decidir entre candidatos competidores, reduce falsos positivos cuando un mismo nombre aparece en varias ciudades.
- Cumplimiento KYC y AML: la decodificacion de propiedad con margen de 0,05 evita asignar un mismo registro a varios titulares, algo critico cuando el resultado alimenta listas de vigilancia.
- Consolidacion de directorios empresariales multipais: los datos de entrenamiento cubren EE. UU., India y Francia, con soporte para escritura devanagari y sufijos legales abreviados, lo que encaja con registros comerciales internacionales.
- Record linkage en analitica de datos publicos: el pipeline permitiria enlazar padrones de empresas con registros administrativos ruidosos, midiendo la calidad con la metrica F0.5 cuando la precision pesa mas que la exhaustividad.
- Construccion de grafos de entidades para recomendacion B2B: los enlaces de alta confianza producidos por el sistema pueden alimentar un grafo de relaciones entre empresas para puntuar afinidad comercial.
- Prototipado y formacion: la demo sintetica de extremo a extremo permite reproducir el pipeline completo con datos inventados, util para ensenar tecnicas de entity resolution sin violar la confidencialidad de los datos del concurso.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Macro F0.5 en leaderboard publico | 0,9303 |
| Macro F0.5 local en held-out (modelo meta, candidatos R10) | 0,9438 |

Evaluacion held-out detallada publicada en la model card:

| Etapa | Macro F0.5 | Precision | Recall |
|---|---|---|---|
| Modelo base, top-100 candidatos (2.500 consultas de confirmacion) | 0,9453 | 0,9658 | 0,9054 |
| Modelo base, candidatos R10 rapidos (4.000 consultas nuevas) | 0,9363 | 0,9665 | 0,8733 |
| Mas modelo meta (mismas 4.000 consultas) | 0,9438 | 0,9654 | 0,8986 |

Progresion en el leaderboard publico:

| Envio | F0.5 publico |
|---|---|
| Modelo base | 0,9176 |
| Mas modelo meta | 0,9217 |
| Mas decodificacion de propiedad | 0,9303 |

La metrica es F0.5 macro-promediada por consulta (ponderada hacia la precision); una consulta sin coincidencias reales y sin predicciones puntua 1.

## Requisitos de hardware

- Inferencia en CPU: LightGBM no requiere GPU, por lo que el sistema puede ejecutarse en cualquier maquina que soporte la libreria.
- Memoria: el repositorio ocupa 0,0 GB segun HuggingFace, ya que solo contiene los ficheros de texto de los modelos y JSON auxiliares; no se publican pesos de gran tamano.
- VRAM estimada: no aplica. No hay requisito de GPU para puntuar pares.
- GPU recomendadas: no aplica para la inferencia; la carga computacional real esta en la recuperacion de candidatos y en la construccion de las 80 caracteristicas, no en el modelo.
- GPU de consumo: irrelevante para este modelo; cualquier CPU moderna es suficiente para el scoring.
- Opciones de despliegue: `inference.py` del repositorio (carga ambos modelos, construye caracteristicas de contexto y aplica umbrales y decodificacion) y `er_demo.py` para la demo sintetica; dependencias `lightgbm`, `scikit-learn`, `scipy`, `rapidfuzz` y `anyascii`.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico indicio de coste es la diferencia entre usar candidatos R10 rapidos (0,9363 F0.5) y top-100 (0,9453 F0.5), que muestra el compromiso entre coste de recuperacion y rendimiento.

## Comparativa con modelos similares

No hay datos publicos suficientes para comparar numericamente con alternativas equivalentes. La siguiente tabla recoge lo que consta en la informacion disponible:

| Alternativa | Arquitectura | Caracteristicas | F0.5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| business-entity-resolution-lightgbm (este modelo) | LightGBM base + meta en cascada | 80 caracteristicas de par mas 14 de contexto | 0,9303 en leaderboard publico | MIT | HuggingFace y GitHub |
| Variante con XGBoost del mismo autor | XGBoost | Misma pipeline | No disponible (comparado en `base_model_selection.json`) | No disponible | Incluida en el repo |
| Solucion LightGBM de otro participante (255 hojas, profundidad 12, lr 0,01, 2.000 rondas) | LightGBM | No disponible | No disponible | Repositorio publico | GitHub |
| Repositorio alternativo de entity resolution para el mismo concurso | No disponible | No disponible | No disponible | No disponible | GitHub |
| Mejor equipo del leaderboard publico | No disponible | No disponible | 0,9901 (referencia citada en redes) | No disponible | No disponible |

Las cifras de otros participantes corresponden a soluciones distintas del mismo concurso y no son directamente comparables entre si, ya que difieren en recuperacion, caracteristicas y decodificacion.

## Limitaciones y advertencias

- El modelo no acepta cadenas crudas de nombre o direccion: exige las 80 caracteristicas exactas producidas por el repositorio, incluidas las puntuaciones y rangos de las rutas de recuperacion. Sin ese pipeline previo, el modelo no es utilizable.
- Los datos del concurso no se pueden compartir, por lo que los resultados declarados no son reproducibles de forma independiente con los mismos datos.
- Los benchmarks del model-index estan marcados como no verificados (`verified: false`); son cifras autodeclaradas por el autor.
- La demo sintetica usa solo 8 consultas dificiles disenadas y unos 700 registros generados; el propio autor advierte que esos casos son mas faciles que los datos reales y que debe leerse como ilustracion, no como benchmark.
- El sistema se entreno exclusivamente con etiquetas del challenge, de modo que puede degradarse ante distribuciones de datos distintas (otros paises, otros formatos de direccion u otros sectores).
- La metrica F0.5 prima la precision sobre la exhaustividad: los valores de recall publicados (0,87-0,90) indican que una parte relevante de coincidencias reales puede quedar sin detectar.
- La cobertura linguistica se limita a las rutas de transliteracion implementadas; los idiomas soportados figuran como no disponibles y el alcance documentado son registros de EE. UU., India y Francia.
- La model card esta truncada en la seccion de datos de entrenamiento y limitaciones, por lo que no consta informacion completa sobre sesgos, composicion del dataset ni el entrenamiento del modelo meta.
- Adopcion muy baja: 0 descargas y 1 like en el momento de redactar la ficha, sin senales de uso en produccion por terceros.
- La licencia MIT permite uso comercial, pero la ausencia de garantias y de validacion externa obliga a evaluar el modelo con datos propios antes de llevarlo a produccion.
- La fecha de creacion registrada es 2026-10-01, posterior a la del propio concurso segun algunas de las referencias encontradas; conviene verificar la correspondencia entre el repositorio y la version final de la solucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rohithonchain/business-entity-resolution-lightgbm
- Repositorio del pipeline completo: https://github.com/sanjayrohith/business-entity-resolution
- Notebook de write-up en Kaggle: https://www.kaggle.com/code/sanjayrohith/business-entity-resolution-writeup
- Repositorio alternativo del mismo concurso (rohit-7620): https://github.com/rohit-7620/Amazon-ML-Challenge-2026-Business-Entity-Resolution-Challenge
- Repositorio alternativo del mismo concurso (jhansi-jjs): https://github.com/jhansi-jjs/business-entity-resolution
- Dataset del challenge en HuggingFace: https://huggingface.co/datasets/uday-bhatia/amazon-ml-26
- Publicacion en LinkedIn sobre el uso de LightGBM y XGBoost: https://www.linkedin.com/posts/gandem-nitin-941b13229_amazonmlchallenge-machinelearning-entityresolution-activity-7510274997060530176-omQ8
- Publicacion en LinkedIn con resultados del leaderboard: https://www.linkedin.com/posts/karthik-ks-1k_amazonmlchallenge-machinelearning-entityresolution-ugcPost-7510617976920969216-xpSA
