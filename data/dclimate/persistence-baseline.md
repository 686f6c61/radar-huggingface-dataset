# dClimate/persistence-baseline

## Resumen

dClimate/persistence-baseline no es un modelo de aprendizaje automatico: es un generador de predicciones de referencia (baseline) basado en persistencia para la temperatura a 2 metros. Su funcionamiento consiste en tomar la ultima instantanea disponible de un campo de analisis en rejilla (T+0) y repetirla sin cambios en cada hora de plazo (lead hour). No tiene parametros, no se ha entrenado con datos y no incorpora ningun mecanismo de aprendizaje ni de correccion.

Su relevancia es metodologica. En prediccion meteorologica, la persistencia es la referencia trivial estandar: un sistema de prediccion solo demuestra habilidad cuando supera a la persistencia, y el margen con el que lo hace en cada plazo es un dato mas informativo que una puntuacion de error aislada. Por eso se publica como control reproducible dentro del ecosistema de dClimate, con licencia MIT y sin coste de computo asociado.

El repositorio no contiene pesos. Incluye `predict.py`, que lee la variable `2m_temperature` de un analisis en rejilla en netCDF con dimensiones `(time, latitude, longitude)` (latitud descendente de +90 a -90, longitud ascendente en convencion 0-360) y emite `temperature_2m` con dimensiones `(lead_hour, latitude, longitude)` en la misma rejilla y en Kelvin, mas `earthboi.yaml`, que declara variables, plazos y rejilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: baseline determinista de persistencia, sin red neuronal ni parametros entrenables |
| Parametros totales | 0 (no tiene parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; utiliza un unico paso temporal (el mas reciente, T+0) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | No aplica (no procesa lenguaje natural); variable tratada: `2m_temperature` |
| Licencia | MIT |
| Formato de pesos | No aplica; el repositorio incluye `predict.py` y `earthboi.yaml` |

## Arquitectura y entrenamiento

No hay arquitectura neuronal. El procedimiento es una copia directa: se lee el ultimo registro temporal del analisis en netCDF, se conserva el campo espacial tal cual y se replica para cada plazo declarado en `earthboi.yaml`, produciendo `temperature_2m` con una dimension adicional `lead_hour`. La unidad de salida es Kelvin, la misma del campo de origen. No existe fase de entrenamiento, ajuste fino, RLHF ni DPO, y por tanto tampoco hay conjunto de datos de entrenamiento ni numero de tokens asociado.

La unica logica tecnica reseñable es de validacion del formato de entrada: convencion de longitudes 0-360, latitud descendente y lectura del paso temporal mas reciente. El modelo card describe ademas el comportamiento esperado del error por plazo (+6 h, muy dificil de batir por la autocorrelacion atmosferica; +24 h, superado claramente por cualquier sistema competente; +120 h, el error se aproxima al de la climatologia) y señala que un error que no crece con el plazo indica un problema en la evaluacion, no en la prediccion.

## Capacidades

- Generacion de un pronostico de temperatura a 2 m por persistencia para cada plazo configurado, sobre la rejilla del analisis de entrada.
- Salida en Kelvin con dimensiones `(lead_hour, latitude, longitude)`, lista para compararse con predicciones reales en la misma rejilla.
- Actua como termino de referencia en el calculo de skill scores (por ejemplo, la mejora relativa frente al error de persistencia en cada plazo).
- Funciona como control de calidad del pipeline de evaluacion: si un sistema no supera a la persistencia a +24 h, o si el error de persistencia no crece con el plazo, hay un fallo de implementacion.
- Referencia de comparacion frente a la climatologia en plazos largos (del orden de +120 h).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no procesa lenguaje.

## Casos de uso

- Evaluacion de modelos meteorologicos: calcular la mejora de un sistema de prediccion respecto a la persistencia en cada plazo y reportar ese margen en lugar de un error absoluto aislado.
- Control de regresion en pipelines de prediccion: ejecutar la persistencia como linea base fija en cada version del pipeline y detectar degradaciones cuando el modelo evaluado deja de superarla.
- Auditoria de codigo de evaluacion: comprobar que el error de la persistencia crece con el plazo; si no lo hace, el fallo esta en las metricas, en el alineamiento de rejillas o en las unidades, no en el pronostico.
- Calculo de skill scores normalizados: usar la persistencia como denominador en metricas relativas, de forma que los resultados sean comparables entre regiones y periodos con distinta variabilidad.
- Docencia y formacion: ilustrar con codigo minimo y sin entrenamiento la jerarquia persistencia < modelo con habilidad, y el concepto de autocorrelacion atmosferica a corto plazo.
- Pruebas de integracion de formatos: validar la lectura de netCDF con latitud descendente y longitud 0-360, y verificar la forma y las unidades de salida antes de conectar un modelo real.
- Referencia para plazos largos: estimar el suelo de error cercano a climatologia en torno a +120 h como cota inferior de exigencia para un sistema operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye cifras de error (RMSE, MAE) ni comparaciones cuantitativas con otros sistemas.

El unico contenido cuantitativo aportado es una descripcion cualitativa del comportamiento esperado por plazo:

| Plazo | Comportamiento tipico descrito por el autor |
|---|---|
| +6 h | Dificil de superar por un margen amplio; la atmosfera esta fuertemente autocorrelacionada en este rango |
| +24 h | Superado claramente por cualquier pronostico competente |
| +120 h | El error se aproxima al de la climatologia |

## Requisitos de hardware

- VRAM: ninguna. No hay pesos ni operaciones en GPU.
- GPU recomendadas: no aplica; la ejecucion es de CPU y de un solo hilo en la practica.
- Cabe en cualquier equipo: portatil, contenedor pequeno o funcion serverless, limitado solo por la memoria necesaria para cargar el netCDF de entrada y escribir la salida.
- Opciones de despliegue: ejecucion directa de `predict.py` en Python; integrable como paso de un DAG (Airflow, Prefect) o como funcion en un pipeline de evaluacion. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos con pesos.
- Latencia y throughput: no disponibles. El coste dominante es la E/S del netCDF (lectura del ultimo paso temporal y escritura de todos los plazos), no el computo.

## Comparativa con modelos similares

| Referencia | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dClimate/persistence-baseline | 0 | No aplica (un paso temporal T+0) | Superado por cualquier sistema competente a partir de +24 h; converge a climatologia hacia +120 h | MIT | Repositorio de HuggingFace, 0 descargas y 0 likes segun los metadatos |
| Climatologia (referencia estadistica) | No disponible | No aplica | Referencia de error a plazos largos; el autor situa la persistencia cerca de ella hacia +120 h | No disponible | No disponible |
| Sistemas de prediccion con habilidad (NWP fisico o modelos de ML tipo GraphCast o Pangu-Weather) | No disponible | No disponible | Superan la persistencia a partir de +24 h, segun la descripcion del autor | No disponible | No disponible |

No se dispone en la informacion proporcionada de cifras de parametros, contexto ni benchmarks de las alternativas, por lo que no se incluyen numeros.

## Limitaciones y advertencias

- No es un sistema de prediccion: no modela la evolucion atmosferica, solo replica el analisis inicial.
- Habilidad muy limitada: practicamente nula mas alla de unas pocas horas y proxima a la climatologia hacia +120 h.
- Hereda todos los sesgos y errores del analisis de entrada y los propaga sin correccion a todos los plazos.
- Salida determinista, sin incertidumbre ni miembros de ensemble.
- Cubre una unica variable (`2m_temperature`); no sirve para precipitacion, viento, presion ni otras variables.
- Requiere un netCDF con el formato exacto descrito (dimensiones `(time, latitude, longitude)`, latitud descendente de +90 a -90, longitud 0-360, ultimo paso temporal); cualquier desviacion de convencion invalida el resultado.
- No procesa lenguaje natural: no tiene capacidades de generacion de texto, codigo ni conversacion, por lo que no aplica el riesgo de alucinacion en el sentido habitual. El riesgo equivalente es interpretar su salida como un pronostico valido.
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas, con el unico requisito de conservar el aviso de copyright y de licencia.
- Los metadatos indican 0 descargas y 0 likes, y una fecha de creacion posterior a la fecha de actualizacion (mismo segundo de diferencia), sin evidencia de adopcion ni de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dClimate/persistence-baseline
- Ficheros incluidos en el repositorio, segun el modelo card: `predict.py` (implementacion) y `earthboi.yaml` (variables, plazos y rejilla declarados)
- Paper, blog, repositorio de codigo adicional o demo: no disponibles en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes: todas las entradas recibidas tratan sobre comparativas entre Pilates y yoga y no guardan relacion con este modelo.
