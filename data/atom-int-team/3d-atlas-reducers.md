# atom-int-team/3d-atlas-reducers

## Resumen

`atom-int-team/3d-atlas-reducers` no es un modelo de lenguaje ni una red neuronal entrenada de forma convencional: es un repositorio de artefactos que contiene reducers de dimensionalidad preentrenados (UMAP y PaCMAP) para proyectar embeddings cientificos de 256 y 512 dimensiones a coordenadas tridimensionales `(x, y, z)`. Lo publica el equipo `atom-int-team` en Hugging Face con un tamano de repositorio de 3,5 GB y sin pipeline declarado.

El proposito es servir como capa de inferencia determinista: dado un embedding de MACE (256 dimensiones) o de PET-MAD (512 dimensiones), los ficheros `reducer.pkl` devuelven una unica coordenada 3D por embedding, lo que permite construir mapas latentes ("atlas") reproducibles de materiales o estructuras atomicas sin reentrenar la proyeccion. Es relevante porque fija la transformacion entrenada y elimina la variabilidad de reajustar UMAP o PaCMAP en cada lote.

No hay informacion sobre arquitectura neuronal, parametros, contexto ni idiomas: los objetos serializados son modelos estadisticos no parametricos de reduccion de dimensionalidad. La ficha describe, por tanto, las caracteristicas tecnicas de esos artefactos y sus condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reduccion de dimensionalidad no parametrica: UMAP (umap-learn 0.5.12) y PaCMAP (pacmap 0.8.0) |
| Parametros totales | no disponible (no es una red neuronal; los `.pkl` contienen modelo, datos de entrenamiento y estructuras de busqueda de vecinos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | Pickle (`.pkl`) consumido con `pickle.load`; entrada `.npy` float32; salida `(N, 3)` float32 |
| Dimension de entrada | 256 (MACE) y 512 (PET-MAD) |
| Dimension de salida | 3 (`x`, `y`, `z`) |
| Variantes incluidas | `UMAP/MACE`, `UMAP/PET-MAD`, `PaCMAP/MACE`, `PaCMAP/PET-MAD` |
| Dependencias | `numpy==2.5.3`, `umap-learn==0.5.12`, `pacmap==0.8.0` |
| Tamano del repositorio | 3,5 GB |

## Arquitectura y entrenamiento

Cada `reducer.pkl` de UMAP encapsula la UMAP entrenada, los datos del conjunto de entrenamiento con sus estructuras de busqueda de vecinos y las coordenadas 3D de los puntos de entrenamiento; la llamada `transform()` no requiere pasar un fichero separado de embeddings de referencia porque esa informacion ya reside en el objeto. En PaCMAP el fichero contiene un diccionario con dos claves: `reducer` (parametros, transformaciones de entrada y coordenadas 3D de entrenamiento) y `basis` (embeddings originales de los puntos de entrenamiento), de modo que la inferencia alinea el embedding nuevo con los puntos de `basis` y lo situa respecto a sus coordenadas 3D guardadas.

La model card no documenta el corpus de entrenamiento (numero de embeddings, origen de las estructuras de MACE o PET-MAD, hiperparametros de UMAP/PaCMAP como `n_neighbors`, `min_dist` o pesos de PaCMAP), ni si hubo ajuste fino posterior. Tampoco se especifica el proceso de serializacion mas alla de `pickle`. La innovacion practica es la persistencia de la proyeccion: la transformacion es fija y reproducible, y las coordenadas de modelos distintos pertenecen a espacios distintos, por lo que no son comparables entre si.

## Capacidades

- Proyeccion de embeddings de MACE (256 dimensiones) a coordenadas 3D mediante UMAP y PaCMAP.
- Proyeccion de embeddings de PET-MAD (512 dimensiones) a coordenadas 3D mediante UMAP y PaCMAP.
- Inferencia por lotes: procesa una matriz `(N, D)` y devuelve `(N, 3)` float32 preservando el orden de las filas.
- Transformacion determinista sin reentrenamiento: la proyeccion queda fijada por el artefacto guardado.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, agentes ni capacidades multilingues.
- No incluye modo de razonamiento (thinking) ni decodificacion especulativa.

## Casos de uso

- Construccion de atlas latentes de materiales: proyectar un lote de embeddings de MACE a 3D y visualizar la distribucion de estructuras atomicas en un espacio comun y reproducible.
- Analisis exploratorio de embeddings de PET-MAD: reducir 512 dimensiones a 3 coordenadas para detectar agrupaciones o outliers en conjuntos de estructuras simuladas.
- Comparacion de dos proyecciones (UMAP frente a PaCMAP) sobre el mismo embedding: ejecutar ambas variantes y contrastar la preservacion de vecindades locales y globales.
- Generacion de features 3D para modelos aguas abajo: usar `(x, y, z)` como entrada compacta en clasificadores o modelos de regresion de propiedades.
- Reproducibilidad en publicaciones: fijar la proyeccion con el `.pkl` versionado para que las figuras y coordenadas de un articulo se puedan regenerar exactamente.
- Integracion en pipelines de ciencia de datos: script Python con `numpy` que carga `embeddings.npy`, aplica el reducer y guarda `coordinates_3d.npy` para su consumo posterior.
- Indexacion y busqueda visual de estructuras: almacenar las coordenadas 3D y usar busqueda por vecindad espacial para recuperar estructuras similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de la proyeccion (trustworthiness, continuidad, distancia de correlacion con el espacio original) ni tiempos de inferencia.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU con `numpy`, `umap-learn` y `pacmap`.
- Memoria RAM: los `.pkl` de PaCMAP se cargan enteros en memoria (incluyen `basis`); el repositorio completo ocupa 3,5 GB, por lo que conviene prever varios GB de RAM por proceso.
- GPU: no requerida ni documentada; no se menciona soporte CUDA para estos artefactos.
- Cabe en cualquier equipo consumer siempre que disponga de RAM suficiente para el `.pkl` y el lote de embeddings.
- Despliegue: script Python directo; no se documenta integracion con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Dimension de entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| `atom-int-team/3d-atlas-reducers` | UMAP y PaCMAP persistidos | 256 / 512 | 3 | no disponible | Proyeccion fija reproducible |
| UMAP reentrenado ad hoc | Reduccion no parametrica | cualquiera | configurable | BSD-3 (umap-learn) | Requiere reajuste y no es reproducible entre ejecuciones |
| PaCMAP reentrenado ad hoc | Reduccion no parametrica | cualquiera | configurable | no disponible en la informacion | Requiere reajuste y `basis` propio |
| PCA | Proyeccion lineal | cualquiera | configurable | libre | Mas rapido, pero captura solo estructura lineal |

No se dispone de informacion sobre otros repositorios de reducers persistidos comparables en la busqueda realizada.

## Limitaciones y advertencias

- Solo acepta embeddings de la dimension exacta indicada: 256 para MACE y 512 para PET-MAD; otra dimension provoca error.
- Las coordenadas de modelos distintos pertenecen a espacios distintos y no son comparables entre si.
- La proyeccion queda congelada: no se adapta a dominios alejados del conjunto de entrenamiento, y las estructuras nuevas se situan respecto a los puntos de referencia guardados.
- UMAP y PaCMAP distorsionan distancias globales; las distancias en 3D no equivalen a distancias en el espacio de embeddings original.
- El uso de `pickle` implica riesgo de ejecucion de codigo arbitrario: solo deben cargarse ficheros de origen confiable y con `allow_pickle=False` en la carga de `.npy`.
- La licencia no esta declarada, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en produccion.
- No hay informacion sobre sesgos, alucinacion ni limites de contexto o idioma porque el artefacto no procesa texto.
- No se documentan versiones de entrenamiento, hiperparametros ni metricas de calidad, lo que dificulta auditar la proyeccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/atom-int-team/3d-atlas-reducers
- umap-learn: https://github.com/lmcinnes/umap
- PaCMAP: https://github.com/YingfanWang/PaCMAP
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion disponible.
