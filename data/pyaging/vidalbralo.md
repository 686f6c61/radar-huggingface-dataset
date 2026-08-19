# pyaging/vidalbralo

## Resumen

`vidalbralo` es un reloj epigenético de edad cronológica desarrollado por Vidal-Bralo, López-Golán y González en 2016. Se trata de un modelo de regresión lineal que estima la edad de un individuo a partir de los niveles de metilación de ADN en ocho sitios CpG específicos de sangre completa. Fue seleccionado mediante regresión paso a paso hacia adelante en una muestra de 390 adultos y calibrado con regresión lineal múltiple, con el objetivo de ser compatible con un ensayo multiplex de MS-SNuPE simplificado.

El modelo está publicado en *Frontiers in Genetics* y se distribuye bajo licencia BSD-3-Clause a través de la librería `pyaging`, que facilita su uso en pipelines de análisis de datos de metilación. Su relevancia radica en que ofrece una alternativa reducida y económicamente viable a los relojes epigenéticos de mayor tamaño, manteniendo una precisión aceptable para aplicaciones de investigación biomédica y estudios poblacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multiple (8 CpGs + intercepto) |
| Parametros totales | 9 coeficientes (8 CpGs + termino independiente) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica (pesos en punto flotante de precision estandar) |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en la libreria pyaging, probablemente como coeficientes en Python) |

## Arquitectura y entrenamiento

El modelo es una regresion lineal multiple que predice la edad cronologica como funcion lineal de los niveles de metilacion en ocho sitios CpG especificos. La seleccion de los CpG se realizo mediante regresion paso a paso hacia adelante en un conjunto de entrenamiento de 390 adultos, y los coeficientes finales se calibraron con regresion lineal multiple. No se emplearon tecnicas de aprendizaje profundo ni redes neuronales; la simplicidad del modelo permite su aplicacion en ensayos multiplex de bajo coste (MS-SNuPE). No se dispone de informacion detallada sobre la composicion exacta del dataset de entrenamiento, aunque se infiere que se trata de muestras de sangre completa de adultos humanos. No se aplicaron metodos de RLHF ni DPO.

## Capacidades

- Estimacion de edad cronologica a partir de datos de metilacion de ADN en sangre completa.
- Compatibilidad con ensayos multiplex MS-SNuPE, lo que reduce costes y tiempo de laboratorio frente a metodos de secuenciacion masiva.
- Integracion sencilla en pipelines de analisis con la libreria `pyaging`.
- Funciona exclusivamente con datos de metilacion de ADN; no procesa texto, imagenes ni audio.
- Modelo especifico para humanos (Homo sapiens) y tejido de sangre completa.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente predictivo.

## Casos de uso

- **Estudios epidemiologicos de envejecimiento**: permite estimar la edad biologica de grandes cohortes a partir de muestras de sangre, facilitando la correlacion con factores de riesgo y enfermedades relacionadas con la edad.
- **Investigacion biomedica sobre envejecimiento**: se utiliza como reloj epigenetico para comparar la edad epigenetica con la edad cronologica y estudiar aceleracion o deceleracion del envejecimiento.
- **Validacion de ensayos de bajo coste**: al requerir solo 8 CpGs, es adecuado para laboratorios con presupuesto limitado que deseen implementar mediciones de edad epigenetica sin secuenciacion de alto rendimiento.
- **Control de calidad en biobancos**: puede usarse para verificar la integridad y procedencia de muestras de sangre almacenadas, comprobando si la edad estimada coincide con la edad registrada del donante.
- **Estudios longitudinales de envejecimiento**: al ser una regresion simple, se integra facilmente en modelos estadisticos posteriores que relacionan la edad epigenetica con variables clinicas.
- **Docencia y formacion**: sirve como ejemplo didactico de reloj epigenetico en cursos de bioinformatica y epigenetica, dada su transparencia y bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original reporta una correlacion entre edad estimada y edad cronologica, pero esos datos no estan incluidos en la model card de HuggingFace. No se pueden proporcionar cifras de error medio absoluto ni coeficientes de determinacion sin verificar la publicacion original.

## Requisitos de hardware

- **VRAM**: no requiere GPU; puede ejecutarse en CPU con menos de 1 MB de RAM.
- **GPU recomendada**: ninguna; cualquier CPU moderna es suficiente.
- **Compatibilidad con GPU de consumo**: no aplica, ya que no hay operaciones matriciales pesadas.
- **Opciones de despliegue**: se integra en Python mediante la libreria `pyaging`; no requiere servidores de inferencia como vLLM u Ollama.
- **Latencia y throughput**: la prediccion es instantanea (microsegundos) al tratarse de una multiplicacion de vectores de 8 dimensiones.

## Comparativa con modelos similares

| Modelo | Tipo | Numero de CpGs | Tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vidalbralo | Regresion lineal | 8 | Sangre completa | BSD-3-Clause | pyaging (HuggingFace) |
| Horvath (2013) | Regresion penalizada (elastic net) | 353 | Multiples tejidos | No comercial (requiere solicitud) | Paquete `methylclock` o scripts del autor |
| Hannum (2013) | Regresion lineal | 71 | Sangre completa | No especificada | Paquete `methylclock` |
| PhenoAge (2018) | Regresion de Cox / elastic net | 513 | Sangre completa | No especificada | Paquete `methylclock` |

La comparativa se basa en informacion publica general; no se dispone de una tabla de rendimiento comparativo con metricas exactas en la model card.

## Limitaciones y advertencias

- **Especificidad de tejido**: el modelo esta calibrado exclusivamente para sangre completa; su uso en otros tejidos produce estimaciones invalidas.
- **Rango de edad**: fue entrenado en adultos (muestra de 390 adultos); no es fiable para ninos o adolescentes.
- **Sesgo poblacional**: la muestra de entrenamiento probablemente proviene de una poblacion caucasica europea (dado el origen espanol de los autores); puede presentar sesgos en otras etnias.
- **Alucinacion**: no aplica, al ser un modelo deterministico de regresion, pero los resultados pueden ser incorrectos si los datos de entrada estan mal normalizados o si los CpGs no se miden con el mismo metodo (MS-SNuPE).
- **Licencia**: BSD-3-Clause permite uso comercial con atribucion, pero el modelo depende de la libreria `pyaging`, cuya licencia debe verificarse por separado.
- **Actualizacion**: el modelo no se actualiza; fue publicado en 2016 y no incorpora avances posteriores en relojes epigeneticos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/pyaging/vidalbralo)
- [Catalogo de relojes de pyaging](https://pyaging.readthedocs.io)
- [Articulo original (DOI)](https://doi.org/10.3389/fgene.2016.00126)
- [Libreria pyaging (repositorio, no incluido en la informacion proporcionada)]
