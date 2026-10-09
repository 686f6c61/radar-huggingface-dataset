# eugenmik/castsolid-gnn

## Resumen

Castsolid-gnn es un modelo de red neuronal sobre grafos (GNN) que actua como sustituto (surrogate) de simulaciones de elementos finitos para predecir la solidificacion de piezas de fundicion metalica. Lo desarrolla Eugen Miknevic, ingeniero independiente de fundicion, y se publica bajo licencia Apache-2.0 tanto para el codigo como para los pesos. El modelo resuelve un problema de regresion nodo a nodo sobre una malla tetraedrica: dado un modelo STEP en milimetros, una aleacion y un sistema de molde, devuelve el tiempo de solidificacion en cada nodo de la malla y marca el 10 % de nodos que solidifican mas tarde, es decir, los puntos calientes donde suelen aparecer defectos de contraccion.

La relevancia practica esta en el coste computacional: una resolucion transitoria de elementos finitos del mismo campo tarda de minutos a horas, mientras que este modelo devuelve el campo en segundos una vez la pieza esta mallada. Eso permite comparar variantes de diseno en fases tempranas y decidir que conceptos merecen una simulacion completa. El conjunto combina tres modelos: una GNN de 12 bloques estilo MeshGraphNet con condicionamiento FiLM (7,4 MB en safetensors) y dos cabezas de gradient boosting que fijan la escala absoluta del campo (tiempo total) y su dispersion.

El repositorio es de tipo graph-ml, pesa 0,0 GB y no registra descargas ni likes en el momento de la consulta. La documentacion esta en ingles y el modelo no procesa lenguaje natural: la etiqueta de idioma "en" se refiere a la documentacion, no a una capacidad multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN de 12 bloques estilo MeshGraphNet con condicionamiento FiLM, mas dos cabezas de gradient boosting (HistGradientBoostingRegressor) |
| Parametros totales | no disponible (pesos de la GNN: 7,4 MB en safetensors; cabezas GBM: 0,6 MB y 0,8 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (trabaja sobre mallas tetraedricas, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles (documentacion); el modelo no procesa lenguaje natural |
| Licencia | Apache-2.0 (codigo y pesos) |
| Formato de pesos | safetensors (GNN) y skops (cabezas GBM); configuracion de arquitectura y normalizacion en los metadatos del safetensors; `ood_ranges.json` y `SHA256SUMS` |
| Version | v5.1, congelada el 31 de julio de 2026 |
| Tarea | Regresion por nodo sobre malla tetraedrica |
| Entradas | Geometria STEP en mm, grado de aleacion, sistema de molde, roles opcionales de enfriadores (chills) y manguitos (sleeves) |
| Salidas | Tiempo de solidificacion por nodo, tiempo total, mascara del 10 % de puntos calientes, avisos de fuera de distribucion (OOD) y campos de cribado de contraccion |
| Frameworks | PyTorch 2.3, PyTorch Geometric 2.7, scikit-learn 1.5.2, NumPy 2 |
| Datos de entrenamiento | Simulaciones FEniCSx por metodo de entalpia: ~9.700 casos primitivos, ~4.700 casos multi-aleacion y multi-condicion de contorno, 500 casos de piezas reales |

## Arquitectura y entrenamiento

El predictor es un conjunto de tres modelos que deben usarse juntos. La GNN (`gnn_v5.1.safetensors`) es una red de 12 bloques estilo MeshGraphNet con condicionamiento FiLM (Feature-wise Linear Modulation), que predice la forma del campo de solidificacion sobre el grafo de la malla tetraedrica. Sobre esa forma actuan dos cabezas de gradient boosting: `gbm_total_v3.skops`, un `HistGradientBoostingRegressor` de 16 caracteristicas que predice el tiempo total de solidificacion de la pieza y fija la escala absoluta del campo, y `gbm_std_v2.skops`, un `HistGradientBoostingRegressor` con perdida de error absoluto y 17 caracteristicas que predice la desviacion estandar del campo. La recomposicion de las tres salidas da el campo final por nodo.

El entrenamiento se apoya en simulaciones propias resueltas con FEniCSx mediante el metodo de entalpia para conduccion del calor: aproximadamente 9.700 casos primitivos, unos 4.700 casos con variacion de aleacion y condiciones de contorno, y 500 casos de piezas reales. La model card no detalla el numero total de tokens ni una composicion de dataset en el sentido de corpus de texto, ni menciona fases de RLHF o DPO, que no aplican a este tipo de modelo. Tampoco se documenta en la informacion disponible ninguna innovacion de decodificacion especulativa o atencion lineal.

Un aspecto tecnico destacable es el tratamiento de la seguridad al cargar pesos: el GNN se almacena en safetensors y las cabezas en formato skops, y `src/release_io.py` verifica cada tipo nombrado por el fichero skops contra una lista blanca de tipos de scikit-learn y NumPy antes de cargarlo. Los tres ficheros se convirtieron desde pickles internos de PyTorch y joblib y se validaron contra ellos. La model card menciona ademas una seccion dedicada a un "bug de orden de nodos" y a la recuperacion del orden solver-malla mediante scripts en `tools/`.

## Capacidades

- Prediccion por nodo del tiempo de solidificacion sobre una malla tetraedrica generada a partir de geometria STEP.
- Estimacion del tiempo total de solidificacion de la pieza (cabeza GBM dedicada).
- Identificacion del 10 % de nodos que solidifican en ultimo lugar (mascara de puntos calientes).
- Campos de cribado de contraccion: `niyama`, `porosity_risk` y `macro_region_id` como campos de punto en la malla.
- Deteccion de fuera de distribucion geometrica mediante el envoltorio de entrenamiento almacenado en `ood_ranges.json`, con emision de avisos.
- Mallado de STEP con objetivo de densidad y curado de CAD, a traves del wheel de gmsh incluido en el pipeline.
- Exportacion a VTU para su inspeccion en ParaView.
- Carga de tablas de propiedades de materiales, moldes, enfriadores y manguitos exotermicos en tiempo de inferencia.
- Visor web local (pyvista y trame) para reproducir la solidificacion predicha.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso sobre texto ni capacidades de vision o audio: es un modelo numerico de regresion sobre grafos.

## Casos de uso

- Cribado de conceptos en diseno de fundicion: dado un STEP y una aleacion, obtener el campo de solidificacion en segundos permite comparar varias geometrias candidatas antes de comprometer horas de simulacion transitoria de elementos finitos.
- Localizacion temprana de puntos calientes: la mascara del 10 % de nodos que solidifican en ultimo lugar senala las regiones donde el alimentado es dificil y donde suele iniciarse la contraccion, util para redisenar mazarotas o manguitos.
- Priorizacion de variantes para simulacion completa: el tiempo total predicho por la cabeza GBM permite ordenar variantes y reservar el solver calibrado para las dos o tres mas prometedoras.
- Analisis de sensibilidad a la aleacion y al molde: el modelo acepta grado de aleacion y sistema de molde como entradas, de modo que se puede barrer combinaciones (por ejemplo, distintas condiciones de arena verde) y ver el efecto en el tiempo total y en la posicion de los puntos calientes.
- Evaluacion de enfriadores y manguitos exotermicos: los roles opcionales de cuerpo para chills y sleeves permiten comparar una misma pieza con y sin estos elementos sin remallar el caso completo en el simulador de proceso.
- Deteccion de casos fuera de dominio: el aviso OOD basado en `ood_ranges.json` sirve como puerta de calidad en un flujo automatizado, descartando geometrias alejadas del envoltorio de entrenamiento antes de consumir recursos aguas abajo.
- Inspeccion e informes tecnicos: la exportacion a VTU con campos de punto (`solidification_time`, `hotspot`, `niyama`, `porosity_risk`, `macro_region_id`) y el fichero resumen permiten generar visualizaciones y documentacion para revision de diseno sin salir del flujo de ParaView.
- Integracion en un pipeline de diseno asistido por CAD: al trabajar directamente sobre STEP en milimetros, el modelo se puede encadenar a herramientas existentes de preparacion de geometria y a scripts de validacion automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion, pero su contenido no esta recogido en la informacion proporcionada, por lo que no se dispone de cifras de error (por ejemplo, MAE o RMSE del tiempo de solidificacion), ni de comparaciones numericas frente al solver FEniCSx de referencia. Tampoco hay datos de MMLU, HumanEval, GSM8K ni equivalentes, que no aplican a este tipo de modelo.

Como referencia cualitativa aportada por el autor: una resolucion transitoria de elementos finitos del mismo campo tarda de minutos a horas, mientras que el modelo devuelve el campo en segundos una vez mallada la pieza. No se especifica en la informacion disponible la maquina ni el tamano de malla con los que se midio esa diferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los pesos suman aproximadamente 8,8 MB (7,4 MB de GNN en safetensors, 0,6 MB y 0,8 MB de las cabezas GBM), por lo que el cuello de botella es la memoria de la malla y de las estructuras de PyTorch Geometric, no los parametros del modelo. No se publican cifras concretas de VRAM.
- GPU recomendadas: no disponible. El autor indica que CPU es suficiente para inferencia.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU de consumo e incluso en CPU. La instalacion documentada usa por defecto PyTorch 2.3 con indice de CPU; para CUDA basta sustituir la etiqueta (`cu121`, por ejemplo) en las URLs de PyTorch y de `torch-cluster`.
- Opciones de despliegue: ejecucion directa como modulo de Python (`python -m src.predict_casting`), con PyTorch 2.3, PyTorch Geometric 2.7 y el wheel de `torch-cluster` correspondiente. gmsh cubre el curado de CAD y el mallado tetraedrico; pyvista y trame solo son necesarios para el visor web local. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El autor afirma que el campo se devuelve en segundos una vez mallada la pieza, y que el coste dominante en el flujo completo es el mallado y no la inferencia.
- Entorno: Python 3.11 recomendado; pruebas unitarias deterministas incluidas en `tests/` que no requieren pesos ni datos de simulacion, ejecutables sin GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Castsolid-gnn v5.1 | GNN tipo MeshGraphNet + cabezas GBM, especifico de solidificacion en fundicion | no disponible (8,8 MB de pesos) | no aplica (malla tetraedrica) | no disponible | Apache-2.0 | HuggingFace y GitHub |
| MeshGraphNet (Pfaff et al., arXiv:2010.03409) | GNN generica para simulacion fisica sobre mallas | no disponible | no aplica | no disponible | no disponible | paper y reproducciones publicas |
| Solver de elementos finitos con metodo de entalpia (FEniCSx) | Metodo numerico clasico, no aprendizaje automatico | no aplica | no aplica | referencia fisica, sin cuantificar aqui | software de codigo abierto (no detallado) | paquetes de FEniCSx |

La comparativa cuantitativa no esta disponible: la informacion proporcionada no incluye resultados numericos de Castsolid-gnn frente a MeshGraphNet ni frente al solver FEniCSx. La unica ventaja declarada por el autor es de orden de magnitud en tiempo de ejecucion (segundos frente a minutos u horas), sin cifras de hardware ni de error asociadas.

## Limitaciones y advertencias

- No sustituye a una simulacion de proceso calibrada ni a la validacion fisica. El propio autor lo indica de forma explicita en la model card.
- Un punto caliente indica dificultad de alimentado y riesgo de contraccion; no es una etiqueta de porosidad. Los campos `porosity_risk` y `niyama` son herramientas de cribado, no predicciones de defecto confirmadas.
- Riesgo de extrapolacion: fuera del envoltorio de entrenamiento definido en `ood_ranges.json` el modelo emite avisos OOD, pero un aviso no corrige la prediccion. Conviene tratar como no fiable cualquier caso marcado.
- Sesgo de dominio: el entrenamiento se basa integramente en simulaciones FEniCSx por conduccion con el metodo de entalpia. Los casos de piezas reales son solo 500 frente a unos 14.400 casos sinteticos, de modo que el comportamiento en geometrias industriales complejas puede diferir del observado en los casos primitivos.
- Cobertura limitada de aleaciones, moldes, enfriadores y manguitos: solo aquellos presentes en `data/properties/` pueden alimentar el modelo correctamente.
- El pipeline asume STEP en milimetros. Cambios de unidad o geometrias mal curadas pueden degradar el mallado y, con ello, la prediccion.
- La carga correcta de los resultados depende de resolver el orden de nodos entre solver y malla; la model card dedica una seccion a un bug de orden de nodos, lo que indica que es una fuente conocida de errores.
- La licencia Apache-2.0 permite uso comercial tanto del codigo como de los pesos, sin restricciones adicionales documentadas. No obstante, el modelo no incluye garantias y su uso en decision de produccion deberia ir acompanado de verificacion con simulacion y ensayo fisico.
- Modelo sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- El contenido de la model card esta truncado en la informacion disponible, por lo que las secciones de evaluacion, reproducibilidad y uso previsto pueden contener matices no recogidos aqui.

## Enlaces

- HuggingFace: https://huggingface.co/eugenmik/castsolid-gnn
- Repositorio de codigo y demo (GitHub): https://github.com/eugenmik/castsolid-gnn
- Paper de referencia de la arquitectura MeshGraphNet: https://arxiv.org/abs/2010.03409
- Safetensors: https://github.com/huggingface/safetensors
- skops: https://skops.readthedocs.io/
- PyTorch Geometric: https://pytorch-geometric.readthedocs.io/
- Ruedas de torch-cluster: https://data.pyg.org/whl/
- FEniCSx: https://fenicsproject.org/
- No se han encontrado enlaces adicionales relevantes en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo ni con simulacion numerica de fundicion.
