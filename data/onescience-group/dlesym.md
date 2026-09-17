# OneScience-Group/DLESyM

## Resumen

DLESyM (Deep Learning Earth System Model) es un modelo de sistema terrestre basado en aprendizaje profundo que acopla de forma asincrona modulos neuronales de atmosfera y oceano para ejecutar simulaciones climaticas libres de larga duracion y diagnostico de precipitacion. Lo publica el grupo OneScience-Group en HuggingFace como reproduccion de ingenieria independiente de las especificaciones publicas de DLESyM, cuyo articulo de referencia es "A Deep Learning Earth System Model for Efficient Simulation of the Observed Climate" (arXiv:2409.16247).

A diferencia de un modelo de lenguaje, DLESyM no procesa texto: trabaja sobre campos geoespaciales de variables climaticas. Combina un modulo atmosferico (DLWP), un modulo oceanico (DLOM) y un modulo de precipitacion, con arquitectura basada en U-Net. El entrenamiento se realizo con campos ERA5 del periodo 1983-2017, radiacion de onda larga saliente (OLR) de ISCCP y temperatura superficial del mar (SST).

El problema que resuelve es el coste computacional de las simulaciones climaticas acopladas: los modelos numericos tradicionales requieren supercomputacion masiva para rollouts largos, mientras que un emulador neuronal puede ejecutar ciclos acoplados atmosfera-oceano de forma mucho mas eficiente. Es relevante para investigacion climatica porque permite analisis de variabilidad interna (ENSO, monzones, modos anulares) y validacion de metricas climaticas con infraestructura de GPU convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales acopladas con modulos U-Net (DLWP atmosferico, DLOM oceanico y modulo de precipitacion), acoplamiento asincrono |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de campos climaticos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles; la model card declara unicamente este idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; no se incluyen pesos bajo `weight/` en el repositorio de HuggingFace. Los pesos oficiales se distribuyen en https://github.com/AtmosSci-DLESM/DLESyM |
| Framework | PyTorch |
| Modalidad de entrada | Campos climaticos (ERA5, OLR de ISCCP, SST), no texto |
| Fecha de creacion del repositorio | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

DLESyM es un emulador climatico de aprendizaje profundo que acopla tres componentes: un modulo atmosferico denominado DLWP (Deep Learning Weather Prediction), un modulo oceanico DLOM (Deep Learning Ocean Model) y un modulo de diagnostico de precipitacion. La etiqueta de HuggingFace indica arquitectura U-Net, y el acoplamiento entre modulos es asincrono, lo que permite a cada componente avanzar con su propio paso temporal dentro del ciclo acoplado. El entrenamiento optimiza conjuntamente los modulos de atmosfera, oceano y precipitacion, y la inferencia ejecuta cuatro ciclos acoplados, tras los cuales la evaluacion reporta diagnosticos de deriva (drift) finitos.

Los datos de entrenamiento declarados son campos ERA5 del periodo 1983-2017, radiacion de onda larga saliente (OLR) de ISCCP y temperatura superficial del mar (SST). No se especifican en la informacion disponible el numero total de tokens o muestras equivalentes, la composicion exacta del dataset, la resolucion espacial de los campos ni si se aplicaron etapas de RLHF o DPO (tecnicas propias de modelos de lenguaje que no aplican de forma directa a este tipo de modelo). Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal, que no tienen sentido en este dominio.

Un punto importante: este repositorio de HuggingFace se declara explicitamente como una reproduccion de ingenieria independiente de las especificaciones publicas de DLESyM. No incluye pesos entrenados; solo proporciona configuraciones y scripts para validacion de datos, entrenamiento, inferencia, metricas climaticas y visualizacion, ademas de soporte para entrenamiento multi-GPU mediante `torchrun`.

## Capacidades

- Simulacion climatica de larga duracion: ejecuta rollouts atmosfera-oceano estables mediante acoplamiento asincrono de modulos neuronales.
- Analisis de variabilidad climatica: permite estudiar fenomenos como ENSO, monzones y modos anulares.
- Diagnostico de precipitacion: deriva precipitacion acumulada a partir de estados atmosfericos.
- Entrenamiento conjunto multi-modulo: optimiza simultaneamente atmosfera, oceano y precipitacion.
- Entrenamiento multi-GPU y multi-proceso mediante `torchrun --standalone --nproc_per_node=N`.
- Validacion de datos, calculo de metricas climaticas y visualizacion de resultados mediante scripts incluidos.
- Ejecucion en configuracion "smoke" sobre CPU con una muestra pequena, util para validar conectividad y dependencias.
- Inferencia acoplada con evaluacion de diagnosticos de deriva finitos tras cuatro ciclos.
- No soporta generacion de texto, razonamiento linguistico, codigo, tool calling ni function calling, ya que no es un modelo de lenguaje.
- No se declaran capacidades de vision, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Simulacion climatica de larga duracion: ejecutar rollouts acoplados atmosfera-oceano durante decadas simuladas para estudiar la evolucion del clima observado, aprovechando el acoplamiento asincrono que mantiene la estabilidad numerica en horizontes largos.
- Analisis de ENSO: utilizar los ciclos acoplados para reproducir y analizar la variabilidad de El Nino-Oscilacion del Sur, comparando los estados simulados con reanlisis historicos.
- Estudio de monzones: simular la estacionalidad y la intensidad de sistemas monzonicos a partir de los campos atmosfericos y oceanicos generados por el modelo.
- Analisis de modos anulares: estudiar patrones de variabilidad extratropical como la Oscilacion del Atlantico Norte o la Oscilacion Anular Austral dentro de los rollouts del modelo.
- Diagnostico de precipitacion: alimentar estados atmosfericos simulados al modulo de precipitacion para obtener campos de precipitacion acumulada, utiles en estudios hidrologicos y de validacion de modelos.
- Validacion de pipelines de modelado climatico: usar los scripts de validacion de datos, entrenamiento, inferencia, metricas y visualizacion para verificar la reproducibilidad de una configuracion antes de lanzar experimentos mayores.
- Entrenamiento distribuido en clúster: lanzar entrenamiento conjunto de los tres modulos en multiples GPUs con `torchrun` para reproducir o ajustar el modelo con los datos ERA5/ISCCP/SST indicados.
- Pruebas de integracion en infraestructura DCU o GPU: validar el entorno OneScience (`onescience[earth-dcu]` o `onescience[earth-gpu]`) con la configuracion smoke antes de desplegar simulaciones completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de HuggingFace no incluye cifras de metricas climaticas (por ejemplo RMSE de variables atmosfericas, indices de ENSO o scores de precipitacion), y unicamente menciona que la evaluacion reporta diagnosticos de deriva finitos tras cuatro ciclos acoplados. Para resultados cuantitativos habria que consultar el articulo arXiv:2409.16247 y el repositorio oficial de GitHub, fuera de la informacion proporcionada.

## Requisitos de hardware

- Se recomienda GPU o DCU para el entrenamiento y la inferencia. El uso de CPU esta limitado a la configuracion smoke por defecto con una muestra pequena, util para validar conectividad y dependencias.
- Los usuarios de DCU deben instalar previamente DTK 25.04.2 o una version compatible recomendada por OneScience.
- Entorno DCU: `conda create -n onescience311 python=3.11 -y` seguido de `pip install onescience[earth-dcu]` desde el mirror de OneScience.
- Entorno GPU: creacion del entorno con `libstdcxx-ng=12 libgcc-ng=12 gcc_linux-64=12 gxx_linux-64=12` y `pip install onescience[earth-gpu]`.
- Entrenamiento distribuido mediante `torchrun --standalone --nproc_per_node=2 scripts/train.py` (el numero de procesos es configurable).
- VRAM estimada para inferencia: no disponible.
- Modelos de GPU recomendados (A100, H100, RTX 4090, etc.): no disponible. La informacion solo indica "GPU o DCU" sin especificar modelos ni memoria.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: la model card menciona ejecucion mediante los scripts del propio repositorio (`fake_data.py`, `train.py`, `inference.py`, `result.py`) y el paquete `onescience`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de campos climaticos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos cuantitativos de modelos comparables, por lo que la comparacion se limita a identificar alternativas de la misma categoria sin cifras verificables en la fuente.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DLESyM (OneScience-Group) | Emulador de sistema terrestre acoplado atmosfera-oceano | no disponible | no aplica (no es modelo de texto) | Apache 2.0 | Repositorio de HuggingFace con configuraciones y scripts; pesos oficiales en GitHub |
| Otros emuladores climaticos de aprendizaje profundo (por ejemplo, modelos de la familia de prediccion meteorologica neuronal) | Emuladores climaticos/meteorologicos | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible |

No se dispone de datos en la informacion proporcionada para comparar parametros, contexto o rendimiento frente a alternativas concretas.

## Limitaciones y advertencias

- El repositorio se declara como una reproduccion de ingenieria independiente de las especificaciones publicas de DLESyM, no como la implementacion oficial de los autores.
- No se incluyen pesos entrenados bajo `weight/`. Sin los pesos oficiales del repositorio de GitHub, el modelo no puede ejecutarse en inferencia real; solo pueden probarse los scripts con datos sinteticos (`fake_data.py`) o configuraciones smoke.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad en el momento de la consulta.
- No hay informacion sobre sesgos del modelo. En el contexto climatico, el sesgo relevante seria el derivado de los datos de entrenamiento (ERA5 1983-2017), que cubren un periodo historico concreto y podrian no representar regimenes climaticos fuera de ese rango temporal.
- Riesgo de deriva en rollouts largos: la model card menciona diagnosticos de deriva finitos como parte de la evaluacion, lo que sugiere que la estabilidad de simulaciones prolongadas es un aspecto a vigilar y no una garantia.
- Limitacion idiomatica: los unicos idiomas declarados son el ingles, aunque en la practica el modelo no procesa lenguaje natural.
- No se especifican la resolucion espacial ni las variables exactas de entrada/salida, lo que dificulta evaluar su adecuacion a un caso de uso concreto sin consultar el articulo original.
- Restricciones de licencia: la licencia del repositorio es Apache 2.0, pero la propia model card advierte que el preprint original, el codigo oficial, los pesos y los datos asociados estan sujetos a sus propias licencias y terminos, que deben verificarse por separado antes de un uso comercial.
- Caveat de produccion: no se han publicado resultados de benchmarks en la informacion disponible, por lo que no hay evidencia cuantitativa de calidad climatica que respalde su uso en entornos operativos.
- Los resultados de la busqueda web realizada no contienen informacion relacionada con este modelo: los enlaces devueltos tratan sobre acuerdos fiscales entre Belgica y Francia para trabajadores transfronterizos y no aportan datos tecnicos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/OneScience-Group/DLESyM
- Articulo de referencia (arXiv): https://arxiv.org/abs/2409.16247
- Repositorio oficial con configuraciones y pesos: https://github.com/AtmosSci-DLESM/DLESyM
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios adicionales) en los resultados de la busqueda web proporcionada.
