# OneScience-Group/ScaleAdaptiveCM

## Resumen

ScaleAdaptiveCM es un modelo generativo de consistencia (consistency model) de un solo paso para el downscaling probabilistico de campos de precipitacion procedentes de modelos del sistema Tierra (ESM). Transforma campos gruesos de 60×96 puntos de rejilla en ensembles de alta resolucion de 240×384, es decir, aplica un factor de reescalado de 4, generando multiples miembros del ensemble en una unica evaluacion de red por miembro.

El metodo subyacente fue propuesto por equipos del Potsdam Institute for Climate Impact Research, la Technical University of Munich, la Nanjing University of Information Science and Technology y otras instituciones colaboradoras, y se publico en el articulo "Fast, scale-adaptive and uncertainty-aware downscaling of Earth system model fields with generative machine learning" (Nature Machine Intelligence, DOI 10.1038/s42256-025-00980-5). El modelo se entreno con precipitacion diaria de ERA5 (1940-2018) sobre la rejilla objetivo de 240×384 y se evaluo con simulaciones de POEM, GFDL-ESM4 y SpeedyWeather.jl.

El repositorio de HuggingFace es una reproduccion de ingenieria independiente de las especificaciones publicas del metodo, no la publicacion oficial de los autores: no incluye pesos entrenados ni proporciona resultados de rendimiento. Su relevancia actual reside en que permite reproducir y validar el protocolo completo (datos estructurados, entrenamiento, inferencia, metricas de downscaling y visualizacion) en entornos GPU, DCU, ModelScope y OneCode, con licencia Apache 2.0 para el codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de consistencia (consistency model) de un solo paso; arquitectura de red concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; no utiliza ventana de contexto) |
| Tipos de cuantizacion | no disponible (no se documenta ninguna cuantizacion) |
| Idiomas soportados | en (la model card y la documentacion estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible. El repositorio no incluye pesos en `weight/`; el entrenamiento genera checkpoints de PyTorch en `result/checkpoints/scale_adaptive_cm.pt` |
| Framework | PyTorch |
| Dominio de aplicacion | Ciencias de la Tierra: precipitacion, downscaling probabilistico |
| Resolucion de entrada | 60×96 (rejilla nativa del ESM) |
| Resolucion de salida | 240×384 (ensemble probabilistico, factor 4) |
| Datos de entrenamiento | Precipitacion diaria de ERA5, 1940-2018, sobre rejilla objetivo de 240×384 |
| Metricas de evaluacion | MAE, RMSE, correlacion de gran escala, error de espectro de potencia, CRPS del ensemble |
| Idiomas de la etiqueta HF | en |
| Region declarada | us |

## Arquitectura y entrenamiento

La arquitectura es un modelo de consistencia generativo que aprende una transformacion directa de ruido a muestra, de modo que la inferencia requiere una sola evaluacion de red por miembro del ensemble, en lugar del muestreo iterativo tipico de los modelos de difusion. La generacion incorpora ruido guiado por escala (*scale-guided noise*), lo que permite controlar que escalas grandes se conservan del campo grueso y que estructura de pequena escala se genera, ademas de producir dispersion entre miembros para el analisis de incertidumbre. La informacion proporcionada no detalla el numero de capas, la anchura de red, el recuento de parametros ni el mecanismo exacto de condicionamiento.

En cuanto al entrenamiento, el articulo original utiliza precipitacion diaria de ERA5 entre 1940 y 2018 sobre una rejilla objetivo de 240×384 y campos de ESM en la rejilla nativa de 60×96; la evaluacion se realiza sobre simulaciones de POEM, GFDL-ESM4 y SpeedyWeather.jl. No se especifica en la informacion disponible el numero de tokens o muestras, la composicion completa del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables en este dominio). El repositorio de ingenieria incluye entrenamiento en una GPU (`scripts/train.py`) y entrenamiento distribuido con `torchrun --nproc_per_node=8`, y su configuracion por defecto reduce muestras, anchura de red y epocas sin alterar el protocolo 60×96 → 240×384. Los datos sinteticos generados con `scripts/fake_data.py` sirven unicamente para validacion de ingenieria (patrones de ZCIT, sistemas meteorologicos y estructura intermitente de pequena escala) y no representan las distribuciones de ERA5 o de los ESM, ni la escala de entrenamiento, ni el rendimiento del articulo.

## Capacidades

- Downscaling probabilistico de precipitacion: convierte un campo grueso de 60×96 en un ensemble de alta resolucion de 240×384.
- Generacion en un solo paso: un forward pass por miembro del ensemble, sin bucle de difusion.
- Generacion adaptativa a la escala: el ruido guiado por escala permite decidir cuanta estructura de pequena escala se genera y cuanta se conserva del campo de entrada.
- Analisis de incertidumbre: produce media y dispersion del ensemble, evaluables mediante CRPS.
- Evaluacion integrada: calculo de MAE, RMSE, correlacion de gran escala y error de espectro de potencia.
- Entrenamiento y validacion reproducibles: scripts de datos sinteticos, entrenamiento (mono-GPU y multi-GPU con `torchrun`), inferencia, evaluacion y visualizacion.
- Ejecucion en entornos ModelScope y OneCode para validacion de datos estructurados, entrenamiento, inferencia, metricas y visualizacion.
- Soporte de hardware GPU y DCU (con DTK 25.04.2 o superior); modo CPU para validacion de conectividad con la configuracion de muestra reducida.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues: la documentacion y la model card estan en ingles.
- No dispone de capacidades de vision, audio ni modo de razonamiento (*thinking mode*).
- No es un modelo de lenguaje: no genera texto ni mantiene conversaciones.

## Casos de uso

- Downscaling probabilistico de precipitacion a partir de ESM: se introduce un campo grueso de 60×96 procedente de un modelo climatico y se obtiene un ensemble de 240×384; es adecuado porque el protocolo de reescalado de factor 4 esta fijado de forma explicita en el codigo de entrenamiento e inferencia.
- Analisis de incertidumbre en proyecciones climaticas: al generar multiples miembros con dispersion controlada, permite calcular el CRPS del ensemble y cuantificar la incertidumbre de la precipitacion futura en lugar de ofrecer una unica estimacion determinista.
- Estudios de variabilidad a escala fina: el error de espectro de potencia incluido en `scripts/result.py` permite validar si la estructura de pequena escala generada reproduce la textura estadistica del campo de referencia.
- Control experimental de escalas: mediante el parametro de ruido guiado por escala, un investigador puede retener las escalas grandes del ESM y sustituir solo las pequenas, util para atribuir cambios a una escala espacial concreta.
- Validacion de pipelines de IA cientifica: con datos sinteticos generados por `scripts/fake_data.py` se puede validar el flujo completo (datos, entrenamiento, muestreo en un paso, media y dispersion del ensemble) antes de disponer de datos reales o de recursos de computo.
- Pruebas de entrenamiento distribuido en clusters heterogeneos: el `torchrun` con 8 procesos por nodo y las dependencias `onescience[earth-dcu]` permiten validar el workflow de checkpoints en hardware DCU, habitual en centros de computo.
- Reproduccion y evaluacion de metodos generativos de downscaling: el repositorio reproduce las especificaciones publicas del articulo, por lo que sirve como base para comparar variantes de modelos de consistencia frente a otros enfoques generativos.
- Preparacion de datos de entrada para modelos hidrologicos o de impacto local: los campos de alta resolucion generados pueden alimentar estudios de impacto que requieren detalle espacial fino, siempre que se asuma la naturaleza sintetica o entrenada del campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio define las metricas que se calculan durante la evaluacion (MAE, RMSE, correlacion de gran escala, error de espectro de potencia y CRPS del ensemble) y escribe los resultados en `result/evaluation/metrics.json`, pero no incluye valores numericos ni comparaciones con otros metodos. La model card advierte ademas de que los datos sinteticos del repositorio no representan la escala de entrenamiento ni el rendimiento del articulo original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el recuento de parametros ni el consumo de memoria).
- GPU recomendada: GPU o DCU; el repositorio no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible. El unico requisito declarado es que se recomienda GPU o DCU, y que la CPU sirve para validacion de conectividad con la configuracion de muestra pequena.
- Hardware DCU: requiere DTK 25.04.2 o superior, o la version recomendada por OneScience para el cluster en uso.
- Entorno de software: Python 3.11 mediante conda; en GPU se instalan `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx-linux-64=12`; la instalacion se realiza con `pip install onescience[earth-gpu]` o `pip install onescience[earth-dcu]` desde el indice de OneScience.
- Escalado multi-GPU: soportado con `torchrun --nproc_per_node=8 --nnodes=1 --rdzv_backend=c10d`; no se documentan velocidades de escalado.
- Opciones de despliegue: scripts de PyTorch (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`) y ejecucion en entornos ModelScope u OneCode. No aplican servidores de inferencia de lenguaje como vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles, mas alla de la ventaja cualitativa de requerir una sola evaluacion de red por miembro del ensemble.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de downscaling probabilistico con los que comparar parametros, contexto, rendimiento o licencia. Los unicos sistemas mencionados (POEM, GFDL-ESM4 y SpeedyWeather.jl) se emplean como fuente de campos de entrada y como referencia de evaluacion en el articulo, no como modelos alternativos de la misma categoria. Tampoco se proporcionan datos de metodos generativos alternativos (por ejemplo, difusion) dentro de la informacion disponible.

## Limitaciones y advertencias

- El repositorio no incluye pesos entrenados: no hay archivos en `weight/` y el articulo no proporciona pesos oficiales directamente cargables, por lo que para obtener un modelo utilizable hay que entrenarlo.
- Los datos sinteticos de `scripts/fake_data.py` sirven solo para validacion de ingenieria y no representan las distribuciones de ERA5 o de los ESM, la escala de entrenamiento ni el rendimiento del articulo.
- No se publican resultados de benchmarks ni valores de metricas, de modo que no es posible verificar el rendimiento del modelo a partir de esta informacion.
- La configuracion por defecto reduce muestras, anchura de red y epocas, por lo que una ejecucion estandar no equivale al entrenamiento descrito en el articulo.
- Se trata de una reproduccion de ingenieria independiente, no de la implementacion oficial de los autores; la propia model card lo indica.
- Dominio restringido: el modelo esta especializado en precipitacion y en el protocolo 60×96 → 240×384; no es un modelo de proposito general ni transferible sin validacion a otras variables climaticas o factores de reescalado.
- Riesgo de extrapolacion: el entrenamiento se basa en precipitacion diaria de ERA5 de 1940-2018; su comportamiento fuera de ese rango temporal o en regimenes climaticos no representados no esta documentado.
- Cobertura idiomatica limitada al ingles en la documentacion; no hay interfaz ni soporte en castellano.
- Los campos de precipitacion generados son sinteticos y no deben utilizarse como observaciones ni como base directa de decision sin validacion adicional.
- Licencia: el codigo del repositorio se distribuye bajo Apache 2.0, pero el uso de datos y pesos de terceros queda sujeto a las licencias y condiciones de sus proyectos respectivos, tal como advierte la model card.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de reproducibilidad.
- Dependencia de hardware especifico: los usuarios de DCU deben instalar previamente DTK 25.04.2 o superior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/ScaleAdaptiveCM
- Articulo: "Fast, scale-adaptive and uncertainty-aware downscaling of Earth system model fields with generative machine learning": https://doi.org/10.1038/s42256-025-00980-5
- Repositorio principal de OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio principal de OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
- Entorno OneCode para programacion AI4S: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los resultados obtenidos correspondian a documentacion del proyecto SQLite y no guardan relacion con ScaleAdaptiveCM.
