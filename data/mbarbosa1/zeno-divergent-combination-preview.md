# mbarbosa1/zeno-divergent-combination-preview

## Resumen

Zeno — forecast combination research preview (`eco-u0-20260915`) es un checkpoint neuronal publicado por el usuario mbarbosa1 cuyo unico cometido es combinar varias predicciones (forecasts) emitidas para un mismo caso en una unica prediccion agregada. El modelo recibe, por un lado, el conjunto de forecasts disponibles y, por otro, el historial de error reciente de cada predictor, y devuelve pesos aprendidos mas el forecast combinado. No es un modelo de lenguaje: no genera texto, no razona y no atiende instrucciones.

Se trata de un artefacto de investigacion (etiqueta `research-preview`) sobre series temporales, con 12.758.404 parametros y una arquitectura descrita por el autor como 4 capas temporales y 3 capas de comparacion de conjuntos de modelos. La pregunta de investigacion que articula el trabajo es acotada: cuando justifica el modelo neuronal su complejidad adicional frente a una regla simple de rendimiento reciente.

Su relevancia actual es metodologica mas que de producto. La model card publica una comparacion a tres bandas (media igual, regla de rendimiento reciente y Zeno preview) sobre casos de confirmacion retenidos, y en ella el autor reconoce explicitamente que la regla simple reproduce la mayor parte de la ganancia atribuida antes al modelo. Con 0 descargas y 0 likes en el momento de la consulta, es un lanzamiento reciente y sin adopcion registrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con 4 capas temporales y 3 capas de comparacion de conjuntos de modelos |
| Parametros totales | 12.758.404 |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: el modelo no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible; el repositorio publica un checkpoint acompanado de `MANIFEST.json` con hashes SHA-256 de cada fichero |
| Mapeo de tareas | `task_vocab_v0`, persistido en el checkpoint y restaurado al cargar |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |
| Fecha de publicacion (metadatos) | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura descrita por el autor consta de dos bloques: 4 capas temporales que procesan el historial de error reciente de cada predictor y 3 capas de comparacion sobre el conjunto de modelos. La entrada son varios forecasts para un mismo caso mas el historial de error de cada emisor; la salida son pesos aprendidos y un unico forecast combinado. El checkpoint incorpora el mapeo de tareas `task_vocab_v0` con el que fue entrenado, de modo que la asignacion tarea-identificador se restaura automaticamente al cargar el modelo.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens o si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO). Tampoco se detalla el esquema de calculo del historial de error ni los hiperparametros de entrenamiento. El autor si documenta dos resultados negativos relevantes: el preentrenamiento mas amplio (variante U, que es la que corresponde a este preview) rindio peor que el preentrenamiento solo con el ecosistema (variante M) en las tareas de aire con soporte estadistico, y los pesos estaticos ajustados, aunque nunca fueron peores que el pesado uniforme sobre el objetivo de entrenamiento, generalizan peor y quedaron fuera de la comparacion.

## Capacidades

- Combinacion de forecasts: dado un conjunto de predicciones para un mismo caso mas el historial de error reciente de cada emisor, produce pesos aprendidos y un forecast agregado.
- Estimacion de pesos por instancia: los pesos no son estaticos por tarea, sino que dependen de la entrada concreta.
- Cobertura multidisciplinar declarada: las tareas evaluadas abarcan presion en superficie, temperatura del aire, precipitacion, velocidad del viento y el indice geomagnetico Kp.
- Inferencia autocontenida: el paquete incluye checkpoint, codigo del modelo, la linea base (`recent_performance.py`), una muestra del split de confirmacion, los resultados completos y el manifiesto con hashes; la carga no requiere acceso a red.
- Reproducibilidad: la inferencia reproduce las predicciones de la ejecucion archivada sobre los mismos casos.

No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, uso agentico ni multilinguesimo. El autor indica explicitamente que el modelo no produce avisos de fiabilidad, abstenciones ni senales de trading.

## Casos de uso

- Agregacion operativa de ensembles meteorologicos: el modelo recibe las salidas de varios modelos numericos de prediccion para una misma variable y emite un unico forecast ponderado, con el historial de error como senal de ajuste por predictor.
- Post-procesado de predicciones de presion en superficie: en la tarea con soporte estadistico mas solido del preview (2.785 casos sobre 70 dias), el error cuadratico medio baja de 0,6142 hPa² con la regla de rendimiento reciente a 0,5995 hPa².
- Combinacion de predicciones de precipitacion: es la tarea con mayor mejora relativa registrada frente a la regla simple (7,3% de reduccion del MSE, 0,7439 a 0,6897 mm²), util en pipelines de ahora de acumulados.
- Investigacion metodologica sobre lineas base: sirve como banco de pruebas para medir cuando un combinador neuronal no supera a una heuristica trivial, ya que el repositorio incluye la implementacion de la linea base y los casos de confirmacion.
- Auditoria de resultados publicados: al incorporar `MANIFEST.json` con hashes SHA-256 y los resultados completos, permite verificar que una reproduccion local coincide con la ejecucion archivada antes de reutilizar conclusiones.
- Analisis de actividad geomagnetica: la combinacion de predictores del indice Kp (3.364 casos sobre 35 dias) es aplicable a estudios retrospectivos donde la diferencia de 1,2% en MSE no es concluyente pero si permite caracterizar la dispersion entre predictores.
- Estudio de robustez de combinadores: el propio autor senala como limite abierto la robustez frente a semilla (un solo checkpoint, una sola semilla), por lo que el artefacto es util como punto de partida para replicar el experimento con multiples semillas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre casos de confirmacion retenidos, en unidades nativas. Error cuadratico medio; menor es mejor.

| Tarea | Media igual | Regla de rendimiento reciente | Zeno preview | Frente a rendimiento reciente | Soporte |
|---|---|---|---|---|---|
| Presion en superficie (hPa²) | 1,287 | 0,6142 | 0,5995 | 2,4% menor — por encima del doble del error agrupado por dia | 2.785 casos / 70 dias |
| Temperatura del aire (°C²) | 2,112 | 1,830 | 1,762 | 3,7% menor — por encima del doble del error agrupado por dia | 4.717 / 39 |
| Precipitacion (mm²) | 0,7148 | 0,7439 | 0,6897 | 7,3% menor — por encima del doble del error agrupado por dia | 2.866 / 73 |
| Velocidad del viento (m²/s²) | 8,275 | 7,131 | 7,123 | 0,14% menor — no distinguible | 3.963 / 34 |
| Indice geomagnetico Kp | 1,278 | 1,258 | 1,242 | 1,2% menor — no distinguible | 3.364 / 35 |

El autor advierte de que las reducciones frente a la media igual (53,4% en presion en superficie, 13,9% en viento) siguen siendo validas pero se miden contra una referencia mas debil, y que la regla de rendimiento reciente captura la mayor parte de esa ganancia. Se conservan los casos con perdidas: en presion y temperatura de superficie del mar el preview es peor que ambas referencias, con celdas de soporte muy fino (603 casos / 4 dias y 16 / 4).

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: a partir de los 12.758.404 parametros, el peso del checkpoint es de aproximadamente 51 MB en fp32, 25,5 MB en fp16 y 12,8 MB en int8 (calculo aritmetico, no dato publicado). El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no disponible. Por tamano, la inferencia es viable en CPU y en cualquier GPU consumer.
- Cabe en GPU consumer: si, por tamano, en cualquier GPU consumer actual; el modelo es lo bastante pequeno para ejecutarse sin acelerador dedicado.
- Opciones de despliegue: el metodo documentado es el propio paquete del repositorio (`pip install -r requirements.txt` y `python3 predict_example.py`), autocontenido y sin acceso a red. vLLM, llama.cpp, Ollama o TGI no son aplicables, ya que no se trata de un modelo generativo de lenguaje.
- Latencia y throughput: no disponible.
- Formato de pesos y soporte de cuantizacion: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria en el material proporcionado. La unica comparacion publicada es interna al propio artefacto, frente a dos referencias no neuronales:

| Referencia | Naturaleza | MSE presion en superficie | MSE precipitacion | Licencia |
|---|---|---|---|---|
| Media igual | Combinacion uniforme de predictores | 1,287 | 0,7148 | no aplica |
| Regla de rendimiento reciente | Heuristica basada en el error reciente de cada predictor | 0,6142 | 0,7439 | no aplica |
| Zeno preview | Combinador neuronal, 12,76 M de parametros | 0,5995 | 0,6897 | Apache-2.0 |

## Limitaciones y advertencias

- No es evidencia prospectiva: la auditoria es post-hoc sobre una particion de confirmacion ya inspeccionada, y los historiales se reproducen bajo supuestos de disponibilidad historica. No es un test sellado ni un experimento en tiempo real.
- Una sola semilla y un solo checkpoint: la robustez de los margenes frente a la semilla esta sin resolver, segun el propio autor.
- Resultado negativo reconocido: el preentrenamiento mas amplio (variante U, la de este preview) rindio peor que el preentrenamiento solo con el ecosistema (variante M) en las tareas de aire con soporte.
- Margenes no concluyentes: en velocidad del viento y en el indice Kp las diferencias frente a la regla de rendimiento reciente (0,14% y 1,2%) no son distinguibles estadisticamente.
- Casos con perdida: en presion y temperatura de superficie del mar el modelo es peor que ambas referencias, con soporte muy reducido (603 casos / 4 dias y 16 / 4), por lo que esas celdas son fragiles.
- Alcance funcional limitado: no emite avisos de fiabilidad, abstenciones ni senales de trading; cualquier uso en decision automatizada exige envolverlo con logica propia de control.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de sobreajuste y de generalizacion deficiente, evidenciado por los pesos estaticos ajustados que, aun no siendo peores en el objetivo de entrenamiento, generalizan peor.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser un research preview conviene no tratarlo como componente validado en produccion.
- Idiomas y contexto: no aplica; el modelo no procesa lenguaje natural ni ventanas de contexto textuales.
- Adopcion nula registrada en el momento de la consulta (0 descargas, 0 likes), sin senal de uso externo que respalde su comportamiento.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/mbarbosa1/zeno-divergent-combination-preview
- Repositorio principal e historial de versiones: https://huggingface.co/mbarbosa1/zeno-divergent-v1
- Sitio de investigacion: https://zenodivergent.dev
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a foros de soporte tecnico de Windows y Microsoft y no guardan relacion con este artefacto.
