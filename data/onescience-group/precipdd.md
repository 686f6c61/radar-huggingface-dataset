# OneScience-Group/PrecipDD

## Resumen

PrecipDD es un modelo de aprendizaje profundo desarrollado por el OneScience Group junto con investigadores de la Ulsan National Institute of Science and Technology (UNIST) y la Pohang University of Science and Technology (POSTECH). Su función no es generar texto, sino estimar la anomalía de temperatura media global anual (AGMT, por sus siglas en inglés) a partir de mapas diarios globales de anomalía de precipitación, con el objetivo de detectar huellas antropogénicas de cambio climático en el campo de precipitación diaria.

Se trata de una red neuronal convolucional de tipo dimension-faithful, es decir, que preserva las dimensiones espaciales de la entrada a lo largo de sus capas. Trabaja sobre una rejilla latitud-longitud de 55×160 y fue entrenada con datos de precipitación diaria y temperatura media global anual procedentes de 80 miembros del CESM2 Large Ensemble, que cubren el periodo 1850-2100.

Su relevancia radica en que traslada la atribución climática a la escala diaria: el modelo permite regresión de AGMT, detección del día de emergencia (fracción de días por encima del umbral de 0,42 °C de variabilidad interna), análisis de tendencias y mapas de sensibilidad por oclusión de 7×7, lo que aporta interpretabilidad sobre qué regiones espaciales contribuyen a la señal de calentamiento detectada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional dimension-faithful (preserva dimensiones espaciales); framework PyTorch |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de regresion sobre rejillas espaciales, no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; los metadatos de HuggingFace indican idioma `en`. El modelo no procesa texto, sus entradas son mapas numericos |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de PyTorch (`.pt`), ruta `result/checkpoints/precipdd.pt`; no se distribuyen pesos oficiales preentrenados |
| Dimension de entrada | rejilla de 55×160 (latitud x longitud), anomalias diarias de precipitacion normalizadas |
| Salida | valor escalar de AGMT (regresion) y artefactos derivados (tendencia, mapa de sensibilidad por oclusion 7×7) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional que mantiene las dimensiones espaciales de la entrada en todas sus capas, de modo que la salida por region pueda mapearse de vuelta a la rejilla original de 55×160. Esta decision de diseno es la que habilita el analisis de sensibilidad por oclusion: al ocluir bloques de 7×7 celdas se puede medir la contribucion de cada region a la estimacion final de AGMT. El modelo se entrena como un regresor escalar, no como un clasificador ni como un modelo generativo.

El entrenamiento utiliza datos de precipitacion diaria y de temperatura media global anual de 80 miembros del CESM2 Large Ensemble entre 1850 y 2100. El procedimiento documentado emplea el optimizador Adam, funcion de perdida MAE, regularizacion L2 mediante weight decay e inicializacion independiente de cada miembro del ensemble. La inferencia promedia las estimaciones de AGMT entre los miembros del ensemble, conservando objetivos, anos, dias del ano y coordenadas de la rejilla. El repositorio incluye scripts para generar datos sinteticos (`scripts/fake_data.py`), entrenar en una o varias GPU (`scripts/train.py` y `torchrun`), inferir (`scripts/inference.py`) y evaluar (`scripts/result.py`).

## Capacidades

- Regresion de AGMT: estima la anomalia de temperatura media global anual a partir de un unico mapa diario normalizado de precipitacion global.
- Deteccion del dia de emergencia: calcula la fraccion de dias cuya AGMT predicha supera el limite de variabilidad interna de 0,42 °C empleado en el articulo.
- Analisis de tendencias: computa tendencias de AGMT y de dia de emergencia a lo largo del periodo analizado.
- Interpretabilidad por oclusion: genera un mapa de tendencia de sensibilidad por oclusion de 7×7, que identifica regiones espaciales influyentes en la prediccion.
- Evaluacion cuantitativa: calcula correlacion de Pearson diaria y anual, RMSE y la fraccion de dias por encima del umbral de 0,42 °C.
- Entrenamiento distribuido: soporte de entrenamiento multi-GPU mediante `torchrun` con inicializacion independiente de miembros del ensemble.
- Validacion de ingenieria: permite ejecutar el flujo completo con datos sinteticos que conservan dimensiones espaciales, normalizacion y senal dependiente del calentamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Deteccion de huellas antropogenicas en precipitacion diaria: dado un mapa global de anomalias diarias de precipitacion, el modelo produce una estimacion de AGMT que puede compararse con la variabilidad interna del clima para atribuir la senal al forzamiento antropogenico.
- Estimacion de la anomalia de temperatura media global anual en pipelines de reanalisis: el modelo proporciona una via indirecta de estimar AGMT a partir de campos de precipitacion, util cuando no se dispone de series termicas homogeneas.
- Analisis de tendencias climaticas de largo plazo: aplicando el modelo a series temporales completas se obtienen tendencias de AGMT y de dia de emergencia, lo que permite estudiar cuando se separa la senal del ruido interno.
- Atribucion espacial e interpretabilidad: el mapa de oclusion 7×7 permite identificar que regiones del globo aportan mas informacion a la deteccion, lo que resulta util para priorizar regiones en estudios de monitorizacion.
- Validacion de flujos de datos climaticos: el repositorio incluye generacion de datos sinteticos con la misma rejilla 55×160, pensada para verificar que los pipelines de preprocesado, normalizacion y evaluacion funcionan antes de escalar a datos reales.
- Validacion de infraestructura de computo cientifico: los scripts permiten comprobar entrenamiento monofusion y multi-GPU con `torchrun`, checkpointing y evaluacion distribuida en clusters con GPU o DCU.
- Reproducibilidad y docencia en AI4S: el flujo completo (datos sinteticos, entrenamiento, inferencia y evaluacion) es ejecutable de extremo a extremo, lo que lo hace util como material de referencia para cursos o validaciones metodologicas.
- Integracion en plataformas OneScience: los scripts estan documentados para su ejecucion en ModelScope o OneCode, lo que facilita el despliegue en entornos gestionados de computo cientifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los pesos oficiales del articulo no se distribuyen y que los resultados obtenidos con el conjunto sintetico incluido en el repositorio validan unicamente la ingenieria del flujo, no el rendimiento formal del articulo.

Las unicas metricas documentadas que el codigo de evaluacion calcula son la correlacion de Pearson diaria y anual, el RMSE y la fraccion de dias con AGMT predicha por encima de 0,42 °C. No se proporcionan valores numericos de estas metricas para el modelo entrenado con datos reales del CESM2 Large Ensemble.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se documentan requisitos de memoria ni tamanos de lote.
- GPU recomendadas: no disponible de forma especifica. La model card recomienda el uso de GPU o DCU, sin enumerar modelos concretos.
- Compatibilidad con GPU de consumo: no disponible. Dado que la entrada es una rejilla de 55×160 y la arquitectura es convolucional, es plausible que quepa en GPU de consumo, pero no hay confirmacion en la informacion proporcionada.
- Entorno DCU: requiere DTK 25.04.2 o superior, o la version recomendada por OneScience para el cluster en uso.
- Ejecucion en CPU: soportada para validacion de conectividad con la configuracion de muestra pequena por defecto.
- Opciones de despliegue: scripts de Python incluidos en el repositorio (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`), entrenamiento distribuido con `torchrun` y paquetes `onescience[earth-gpu]` o `onescience[earth-dcu]` instalados via pip desde el mirror de OneScience. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.
- Almacenamiento de artefactos: checkpoints en `result/checkpoints/precipdd.pt`, metricas en `result/training/metrics.json`, predicciones en `result/output/predictions.npz` y resultados de evaluacion en `result/evaluation/`.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables con especificaciones verificables (parametros, contexto, rendimiento o licencia) que puedan enfrentarse a PrecipDD en una tabla. El modelo pertenece a la categoria de redes convolucionales aplicadas a atribucion climatica sobre campos de precipitacion, un nicho con pocos modelos publicos de referencia y sin pesos oficiales liberados en este caso.

Como puntos de referencia citados en la propia documentacion, pero sin datos comparativos utilizables:

| Elemento | Relacion con PrecipDD | Datos disponibles |
|---|---|---|
| CESM2 Large Ensemble | Fuente de datos de entrenamiento (80 miembros, 1850-2100) | no es un modelo comparable, es el conjunto de datos |
| Articulo Nature 2023 (DOI 10.1038/s41586-023-06474-x) | Publicacion de origen del metodo | no se detallan aqui los baselines del articulo |
| Modelos de atribucion climatica con CNN | Categoria general de la tarea | no disponible |

## Limitaciones y advertencias

- No se distribuyen pesos oficiales: el articulo no proporciona pesos utilizables directamente por este repositorio y no hay ficheros bajo `weight/`. Los checkpoints que se generen localmente son validaciones de ingenieria.
- Los datos incluidos son sinteticos: conservan dimensiones espaciales, normalizacion y senal dependiente del calentamiento, pero reducen muestras, miembros del ensemble y epocas. No representan la distribucion oficial del CESM2 Large Ensemble ni el entrenamiento a escala del articulo.
- Los resultados obtenidos con los scripts del repositorio no deben presentarse como rendimiento del articulo ni como resultados cientificos validos.
- Riesgo de desajuste de dominio: el modelo se entrena exclusivamente con salidas del CESM2 Large Ensemble. Su transferencia a observaciones reales, reanalisis o a otros modelos climaticos no esta documentada y puede degradarse.
- Los mapas de sensibilidad por oclusion son herramientas de interpretabilidad, no relaciones causales: una region con alta sensibilidad no implica que sea el unico ni el verdadero mecanismo fisico responsable.
- La deteccion de huellas antropogenicas depende del umbral de 0,42 °C de variabilidad interna definido en el articulo; cambiar ese umbral altera la fraccion de dias de emergencia y su interpretacion.
- Idiomas y documentacion: la model card esta redactada en ingles y no se proporciona version en otros idiomas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de extrapolacion incorrecta si se aplica el modelo fuera del rango temporal o espacial con el que fue entrenado.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el usuario debe verificar de forma independiente las condiciones de uso de los datos del CESM2 Large Ensemble y de los datos de precipitacion empleados.
- El enlace a la tabla de repositorios de skills en GitHub aparece truncado en la model card, por lo que no se puede verificar la ruta completa.
- No se documentan sesgos especificos, pero cualquier sesgo presente en las salidas del CESM2 Large Ensemble se trasladara al modelo.
- No se documentan requisitos de memoria, latencia, throughput ni comportamiento en produccion, lo que dificulta una planificacion de recursos fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/PrecipDD
- Articulo de referencia: https://doi.org/10.1038/s41586-023-06474-x (Anthropogenic fingerprints in daily precipitation revealed by deep learning)
- Repositorio principal de OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills de OneScience en Gitee: https://gitee.com/onescience-ai/oneskills
- Repositorio principal de OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Entorno OneCode para ejecucion AI4S: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados no guardaban relacion con PrecipDD y se han omitido.
