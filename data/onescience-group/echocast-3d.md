# OneScience-Group/EchoCast-3D

## Resumen

EchoCast-3D es un modelo generativo de difusion para el *nowcasting* probabilistico de radar meteorologico en tres dimensiones. A partir de tres volumenes de radar historicos (equivalentes a 18 minutos de observacion), genera cinco volumenes futuros que cubren los 30 minutos siguientes, aprendiendo de forma conjunta la evolucion espaciotemporal de los ecos de precipitacion y la estructura vertical de las tormentas. El modelo lo publica el grupo OneScience-Group como reproduccion de ingenieria independiente de las especificaciones del articulo "Generative machine learning for skilful 3D radar nowcasting" (DOI 10.1038/s41612-026-01407-7), propuesto por equipos de la Academia China de Ciencias, la Universidad de Hohai e instituciones colaboradoras.

Tecnicamente se apoya en un transformer de difusion con enmascaramiento de tokens (MaskDiT). Cada bloque *wedge* de multiples elevaciones se codifica como un token unificado; el modelo combina *score matching* sobre los tokens no enmascarados con una reconstruccion ponderada (peso 0.1) sobre el 75% de tokens enmascarados aleatoriamente. Esa doble tarea permite que el mismo modelo haga prediccion y reconstruccion de datos faltantes, de modo que puede formar conjuntos (*ensembles*) completos incluso cuando la observacion de entrada tiene huecos.

El repositorio de Hugging Face no incluye pesos preentrenados: se distribuye como codigo y scripts de entrenamiento, inferencia y evaluacion sobre un conjunto de datos sintetico de validacion de ingenieria. Su relevancia actual esta en el nicho de la prediccion inmediata de conveccion severa, donde la incertidumbre y la geometria 3D del radar importan tanto como la habilidad predictiva puntual. La licencia es Apache 2.0 y el pipeline de Hugging Face no esta declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con enmascaramiento de tokens (MaskDiT) sobre bloques *wedge* multi-elevacion tokenizados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de los LLM. Ventana temporal: 3 volumenes historicos (18 minutos) como condicionamiento y 5 volumenes objetivo (30 minutos). Secuencia de 24.320 tokens con parcheo 3x3 en la configuracion sintetica; el articulo reporta 24.400 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (idioma declarado en la model card; el modelo opera sobre volumenes de radar, no sobre texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de PyTorch (`.pt`, ruta `result/checkpoints/echocast_3d.pt`); no se incluyen pesos preentrenados en el repositorio |
| Framework | PyTorch |
| Dominio | Ciencias de la Tierra, nowcasting de radar, conveccion severa |
| Modalidad de entrada | Tres volumenes de radar 3D historicos mas sus mascaras de validez |
| Modalidad de salida | Cinco volumenes de radar 3D probabilisticos (ensemble de difusion) |
| Ordenacion de salida | *lead*, elevacion, azimut y rango |
| Resolucion de datos (dataset sintetico) | Cuatro elevaciones con 366/366/363/363 azimuts y 180/180/120/120 bins de rango |
| Cadencia temporal | Volumenes cada 6 minutos |
| Metricas de evaluacion | CRPS, MAE, RMSE (ensemble) y CSI, FAR, POD a umbrales de 20, 30 y 40 dBZ |
| Pipeline de Hugging Face | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en Hugging Face | 2026-09-16 |

## Arquitectura y entrenamiento

EchoCast-3D es un modelo de difusion construido sobre un backbone transformer (DiT) con enmascaramiento de tokens. La representacion de entrada no es una imagen 2D: cada barrido de radar en varias elevaciones se trocea en bloques *wedge* que se codifican como tokens unificados, de modo que el modelo atiende simultaneamente a la evolucion temporal del eco y a la estructura vertical de la tormenta. Con parcheo 3x3, la configuracion sintetica del repositorio produce 24.320 tokens por muestra, frente a los 24.400 que reporta el articulo para la configuracion oficial; la diferencia se debe a la reduccion de muestras y escala en el *script* de validacion.

El entrenamiento combina dos objetivos: *score matching* de difusion sobre los tokens no enmascarados y una reconstruccion enmascarada con peso 0.1 aplicada al 75% de tokens enmascarados aleatoriamente. Esa formulacion conjunta es la que habilita la tolerancia a huecos en la observacion. La inferencia parte de ruido gaussiano 3D y desenaliza iterativamente los cinco volumenes futuros; el uso de semillas aleatorias distintas da lugar al ensemble probabilistico. Los valores por defecto del repositorio reducen la dimension oculta, la profundidad del DiT, el numero de cabezas, los pasos de difusion, el numero de muestras y las epocas, conservando la geometria de radar y el protocolo de tres a cinco frames: la model card insiste en que esos resultados solo validan la ingenieria y no representan el rendimiento del articulo. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento original (mas alla de que son volumenes de cuatro elevaciones de la Administracion Meteorologica de China), ni si hubo etapas de ajuste por RLHF/DPO, que en este dominio no serian aplicables.

## Capacidades

- Nowcasting 3D de radar: genera cinco volumenes futuros a partir de tres volumenes historicos, cubriendo de 18 minutos hacia atras a 30 minutos hacia delante.
- Prediccion probabilistica por ensemble: multiples ejecuciones con semillas distintas producen una distribucion de escenarios, no una unica prediccion determinista.
- Reconstruccion de datos faltantes: reconstruccion de tokens enmascarados al 75% integrada en el mismo proceso de difusion, lo que permite formar ensembles completos aunque la observacion tenga huecos.
- Modelado de estructura vertical: la tokenizacion de bloques multi-elevacion preserva informacion de las cuatro elevaciones del radar.
- Entrenamiento distribuido: soporte de `torchrun` con `--nproc_per_node=8` y `--nnodes=1` para entrenamiento multi-GPU y gestion de checkpoints.
- Evaluacion integrada: calculo de CRPS, MAE y RMSE para el ensemble y de CSI, FAR y POD a 20, 30 y 40 dBZ, ademas de ratios de cobertura del ensemble por *lead* y elevacion.
- Visualizacion comparativa: generacion de figuras de reflectividad compuesta observada frente a la media del ensemble.
- Ejecucion en aceleradores GPU y DCU (con DTK 25.04.2 o superior).
- No dispone de capacidades de generacion de texto, codigo, matematicas, vision general, *tool calling* ni razonamiento multi-paso conversacional; es un modelo de dominio especifico.

## Casos de uso

- Aviso temprano de conveccion severa: el modelo produce cinco volumenes a 6 minutos de cadencia, lo que permite a un servicio meteorologico anticipar la intensificacion de celulas convectivas con una ventana de 30 minutos y estimar la incertidumbre mediante el ensemble.
- Prediccion probabilistica por conjuntos en operacion: gracias a que cada semilla genera una trayectoria de desenalidacion distinta, se pueden calcular CRPS y ratios de cobertura para comunicar riesgo en lugar de un unico escenario determinista.
- Radar con cobertura incompleta: cuando parte de los barridos llega corrupta o ausente, la tarea de reconstruccion enmascarada permite seguir generando un ensemble completo, algo critico en redes de radar con mantenimiento irregular.
- Validacion local de geometria *packed-wedge*: el repositorio incluye la geometria real de los bloques, de modo que un grupo puede comprobar que sus propios datos encajan en el formato antes de escalar el entrenamiento.
- Reproduccion e investigacion en difusion aplicada a geociencias: sirve como base para estudiar el efecto del enmascaramiento, el numero de pasos de difusion o la profundidad del DiT en la calidad del nowcasting.
- Puesta a punto sobre datos propios de una agencia meteorologica: el flujo `scripts/train.py` y `torchrun` permite reentrenar el modelo sobre un archivo de radar regional distinto del CMA, siempre que se respete el protocolo de tres frames historicos y cinco objetivos.
- Formacion de estudiantes y validacion de infraestructura: el conjunto sintetico de ocho volumenes consecutivos permite verificar el pipeline completo (datos, entrenamiento, inferencia, metricas y visualizacion) en CPU o en una unica GPU sin necesidad de datos reales.
- Integracion en plataformas de computacion cientifica: la ejecucion en el entorno OneScience/OneCode y el soporte de DCU facilitan el despliegue en clusters con aceleradores domesticos que no sean NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el conjunto de datos incluido es sintetico y que los resultados obtenidos con la configuracion por defecto (dimension oculta, profundidad del DiT, cabezas, pasos de difusion, muestras y epocas reducidas) validan unicamente la ingenieria y no representan el rendimiento formal del articulo. Tampoco se proporciona ninguna URL confirmada de pesos preentrenados con la que reproducir las cifras de la publicacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican cifras de memoria ni de tamano del checkpoint.
- GPU o DCU recomendadas: la model card recomienda una GPU o una DCU, sin especificar modelos concretos (A100, H100, RTX 4090 u otros).
- CPU: viable para validacion de conectividad con la configuracion de muestra pequena incluida por defecto.
- Encaje en GPU de consumo: no confirmado en la informacion disponible; la reduccion de dimension oculta, profundidad, cabezas y pasos de difusion en la configuracion por defecto sugiere que el modo de validacion es ligero, pero no se aportan cifras.
- DCU: requiere DTK 25.04.2 o superior (o la version recomendada por OneScience para el cluster en uso), instalado previamente.
- Entorno: Python 3.11 con `pip install onescience[earth-gpu]` o `onescience[earth-dcu]` desde el indice de OneScience; para GPU, el entorno Conda incluye `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx_linux-64=12`.
- Despliegue: no se contemplan servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama (no aplicables a este dominio). El despliegue se realiza mediante los *scripts* del repositorio (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`) y `torchrun` para distribucion multi-nodo/nodo unico.
- Latencia y throughput: no disponibles. Dependen del numero de pasos de difusion, del tamano del ensemble y del hardware, y no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card y el material consultado no incluyen tablas frente a otros modelos de nowcasting de radar. En la literatura del area existen propuestas generativas para nowcasting de precipitacion a partir de radar, pero no se dispone de especificaciones, metricas ni condiciones de licencia de esas alternativas dentro de la informacion consultada, por lo que cualquier comparacion numerica seria inventada.

| Modelo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoCast-3D | no disponible | 18 min de historial, 30 min de prediccion | no disponible | Apache 2.0 | Codigo y scripts; sin pesos preentrenados confirmados |
| Alternativas de nowcasting generativo (p. ej. propuestas de la literatura) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de pesos preentrenados: la model card afirma que el articulo no proporciona una URL publica confirmada de pesos y que no hay ningun archivo bajo `weight/`. Usar el modelo en produccion exige entrenarlo desde cero.
- Dataset de validacion sintetico: los ocho volumenes de seis minutos incluidos son datos sinteticos que no representan la distribucion ni la escala oficial del radar de la Administracion Meteorologica de China.
- Escala reducida: la configuracion por defecto disminuye dimension oculta, profundidad del DiT, cabezas, pasos de difusion, muestras y epocas; los resultados que se obtengan con ella no son extrapolables al rendimiento del articulo.
- Reproduccion independiente: el repositorio se declara como reproduccion de ingenieria de las especificaciones publicas, no como implementacion oficial de los autores del paper.
- Licencia del articulo sin confirmar: la model card se interrumpe en la frase sobre la licencia del paper ("The original paper is licensed und..."), por lo que conviene verificar las condiciones de la publicacion antes de un uso comercial del metodo.
- Dominio restringido: el modelo trabaja con volumenes de radar de cuatro elevaciones con geometria concreta (366/366/363/363 azimuts y 180/180/120/120 bins). Aplicarlo a otras redes de radar o a otras geometrias requiere adaptar la tokenizacion y reentrenar.
- Sesgo geografico y climatico: al entrenarse y evaluarse sobre datos de una unica agencia nacional, el comportamiento puede degradarse en regimenes meteorologicos distintos de los de la region de entrenamiento.
- Calibracion del ensemble: la cobertura y la dispersion del ensemble deben validarse por *lead* y elevacion con las metricas incluidas; no hay evidencia publicada de calibracion fuera del conjunto de evaluacion original.
- Riesgo de predicciones poco realistas en casos extremos: como todo modelo generativo, puede producir estructuras de eco plausibles pero fisicamente inconsistentes en situaciones de conveccion extrema poco representadas.
- Idiomas: la documentacion esta solo en ingles y no existe soporte multi-idioma.
- Adopcion nula verificada: cero descargas y cero likes en el momento de la consulta, sin validacion externa por parte de la comunidad.
- Dependencia de infraestructura: el despliegue en DCU exige DTK 25.04.2 o superior y un entorno Conda con versiones concretas de GCC, lo que anade complejidad operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/EchoCast-3D
- Articulo: Generative machine learning for skilful 3D radar nowcasting: https://doi.org/10.1038/s41612-026-01407-7
- Entorno de programacion OneCode (OneScience): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- Repositorio principal en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de *skills* en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio principal en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de *skills* en Gitee: https://gitee.com/onescience-ai/oneskills
