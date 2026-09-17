# OneScience-Group/RainRunoff-LSTM

## Resumen

RainRunoff-LSTM es un modelo de aprendizaje profundo para hidrologia que predice el caudal diario de una cuenca fluvial a partir de series historicas de variables meteorologicas. No es un modelo de lenguaje: es una red neuronal recurrente de tipo LSTM entrenada especificamente para simulacion rainfall-runoff (lluvia-escorrentia), publicada en el repositorio OneScience-Group de HuggingFace como reproduccion de ingenieria independiente de la arquitectura descrita en el articulo de Kratzert et al. (2018).

El modelo original fue propuesto por investigadores de la University of Natural Resources and Life Sciences Vienna (BOKU) y se entrena con datos del conjunto CAMELS Daymet: precipitacion, temperatura minima y maxima, radiacion de onda corta, presion de vapor y caudal observado. Soporta tres regimenes de experimentacion: especifico por cuenca, regional (entrenamiento conjunto sobre varias cuencas) y preentrenamiento regional con ajuste fino posterior por cuenca.

Su relevancia actual es doble. Por un lado, el LSTM se ha consolidado como linea base fuerte en prediccion hidrologica, superando en muchos casos a modelos conceptuales clasicos. Por otro lado, este repositorio concreto es util como punto de partida reproducible en PyTorch, con scripts de entrenamiento, inferencia y evaluacion, aunque no incluye pesos preentrenados listos para cargar. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y esta etiquetado unicamente para el idioma ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (Long Short-Term Memory), red neuronal recurrente |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (la entrada es una secuencia de observaciones meteorologicas diarias de longitud configurable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio no incluye pesos bajo `weight/`) |
| Framework | PyTorch |
| Tarea | Prediccion de caudal diario (rainfall-runoff) |
| Datos de entrenamiento | CAMELS Daymet: precipitacion, temperatura minima y maxima, radiacion de onda corta, presion de vapor y caudal |
| Regimenes de experimentacion | Especifico por cuenca, regional y preentrenamiento regional con ajuste fino |

## Arquitectura y entrenamiento

La arquitectura es una red LSTM estandar aplicada a modelado hidrologico, tal como se describe en el articulo de referencia "Rainfall-runoff modelling using Long Short-Term Memory (LSTM) networks" (Kratzert et al., 2018, DOI 10.5194/hess-22-6005-2018). El modelo recibe como entrada secuencias de forzamientos meteorologicos diarios y produce como salida la prediccion de caudal para el dia siguiente. Al tratarse de una red recurrente, mantiene un estado interno que le permite explotar dependencias temporales de largo plazo en la serie hidrologica, algo que los modelos conceptuales clasicos capturan con dificultad.

El entrenamiento utiliza datos de CAMELS (Catchment Attributes and Meteorology for Large-sample Studies) con forzamientos Daymet. La model card indica que se emplean precipitacion, temperatura minima y maxima, radiacion de onda corta, presion de vapor y caudal. No se especifica en la informacion disponible el numero exacto de cuencas utilizadas, la particion temporal de entrenamiento y validacion, el numero de epocas, la funcion de perdida ni si se aplicaron tecnicas de regularizacion como dropout. Tampoco se detalla si hubo etapas de ajuste con RLHF u optimizacion por preferencias, algo por otra parte ajeno a este tipo de modelos. La innovacion tecnica que respalda el enfoque es el uso de una arquitectura de aprendizaje profundo secuencial para regionalizacion hidrologica: un unico modelo entrenado sobre multiples cuencas puede compartir representaciones y despues ajustarse a cuencas concretas.

## Capacidades

- Prediccion de caudal diario (streamflow) a partir de historicos meteorologicos, con salida escalar por cuenca y por dia.
- Simulacion rainfall-runoff continua, apta para generar series temporales de caudal simuladas.
- Aprendizaje regional: capacidad de compartir representaciones entre cuencas y transferir conocimiento a cuencas con pocos datos.
- Ajuste fino por cuenca (fine-tuning) partiendo de un modelo regional preentrenado.
- Uso de variables meteorologicas multiples como entrada: precipitacion, temperatura minima y maxima, radiacion de onda corta y presion de vapor.
- Ejecucion en GPU, DCU o CPU (esta ultima solo recomendada para validacion de conectividad con la configuracion de muestra reducida).
- Soporte de entrenamiento distribuido mediante `torchrun --standalone --nproc_per_node=N`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades de agente. No es un modelo multimodal ni conversacional.
- No se declaran capacidades multilingues mas alla de la etiqueta `en` del repositorio, que en este contexto se refiere a la documentacion y no a la funcionalidad del modelo.

## Casos de uso

- Prediccion operativa de caudal a corto plazo: alimentar el modelo con los ultimos N dias de observaciones meteorologicas de una cuenca y obtener el caudal previsto para el dia siguiente, integrando el resultado en un panel de monitorizacion de recursos hidricos.
- Gestion de embalses y reservas: usar las predicciones diarias de aportacion para planificar desembalses, ajustar el regimen de turbinado en centrales hidroelectricas o programar el llenado de embalses de riego.
- Alertas tempranas de crecidas: emplear el modelo como componente de un sistema de aviso que, con precipitacion observada o prevista, estime caudales por encima de umbral y dispare avisos a proteccion civil.
- Regionalizacion en cuencas con datos escasos: preentrenar con el conjunto regional de CAMELS y aplicar ajuste fino sobre una cuenca con pocos anos de registro, aprovechando la representacion compartida.
- Relleno y reconstruccion de series historicas: generar caudales simulados para periodos con sensores averiados o sin aforo, y completar series de caudal para estudios de tendencia.
- Analisis de sensibilidad y escenarios climaticos: perturbar sistematicamente las variables de entrada (por ejemplo, incrementar temperatura o modificar precipitacion) y observar la respuesta simulada del caudal.
- Estudios academicos y benchmarking hidrologico: usar los scripts de entrenamiento e inferencia como linea base reproducible en comparaciones frente a modelos conceptuales o alternativas de aprendizaje automatico.
- Reproduccion y docencia: el repositorio incluye un flujo de trabajo por lineas de comandos (`fake_data.py`, `train.py`, `inference.py`, `result.py`) que facilita demostraciones controladas con datos sinteticos antes de pasar a datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas hidrologicas habituales (NSE, KGE, RMSE o sesgo) para las cuencas de CAMELS, ni comparaciones cuantitativas con otras arquitecturas. Tampoco se aportan cifras de latencia o throughput de inferencia.

## Requisitos de hardware

- La model card recomienda GPU o DCU para el entrenamiento y la inferencia. Una CPU puede utilizarse unicamente para validacion de conectividad con la configuracion de muestra pequena por defecto.
- VRAM estimada para inferencia: no disponible. No se especifica el tamano del modelo ni el consumo de memoria en la informacion proporcionada.
- GPU recomendadas: no disponibles. La documentacion no nombra modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no disponible. No puede confirmarse con los datos aportados.
- Aceleradores DCU: requiere DTK 25.04.2 o una version compatible recomendada por OneScience. La instalacion se realiza con `pip install onescience[earth-dcu]` desde el indice de OneScience.
- Entorno GPU: creacion de entorno Conda con `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx_linux-64=12`, e instalacion de `onescience[earth-gpu]`.
- Opciones de despliegue: entorno Python 3.11 con OneScience y PyTorch; entrenamiento distribuido con `torchrun`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone, en la informacion proporcionada, de datos verificables de parametros, contexto o rendimiento de modelos alternativos que permitan una comparativa cuantitativa. Como referencia cualitativa, el propio repositorio se define como una reproduccion independiente de la arquitectura descrita en Kratzert et al. (2018), por lo que su comparable directo seria la implementacion original de ese articulo y sus variantes regionales; no obstante, no se aportan cifras de ninguna de ellas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RainRunoff-LSTM | no disponible | no disponible | no disponible | apache-2.0 | Repositorio HuggingFace sin pesos preentrenados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no incluye pesos entrenados bajo `weight/` y el articulo original no publica un checkpoint oficial directamente cargable, por lo que no es posible la inferencia inmediata sin entrenar el modelo.
- Se trata de una reproduccion de ingenieria independiente de las especificaciones publicas, no de la implementacion oficial de los autores del articulo.
- El modelo esta disenado exclusivamente para modelado hidrologico de caudal diario; no debe emplearse para generacion de texto ni para tareas fuera de ese dominio.
- Rendimiento dependiente de la cuenca: la calidad de las predicciones depende de la disponibilidad y calidad de series meteorologicas y de caudal, y de la similitud de la cuenca objetivo con las utilizadas en el entrenamiento regional.
- Riesgo de extrapolacion: ante eventos extremos o condiciones climaticas fuera del rango observado en CAMELS Daymet, las predicciones pueden degradarse de forma significativa.
- No se documentan analisis de sesgo ni evaluaciones de equidad; el sesgo relevante aqui seria el sesgo de seleccion de cuencas en el conjunto CAMELS, que sobrerrepresenta determinadas regiones geograficas.
- Alucinacion: el concepto no aplica en el sentido de los modelos de lenguaje, pero el modelo puede producir predicciones de caudal fisicamente inconsistentes si se le alimenta con entradas anomalas o mal escaladas.
- Idioma: la etiqueta `en` del repositorio se refiere a la documentacion; el modelo no procesa lenguaje natural.
- Licencia: el repositorio se distribuye bajo Apache 2.0, lo que permite uso comercial del codigo, pero el articulo original esta bajo CC BY 4.0 y los datos CAMELS y el codigo relacionado conservan sus propios terminos, que deben respetarse por separado.
- Caveat de produccion: sin pesos publicados ni metricas de rendimiento verificables, cualquier despliegue operativo exige un proceso previo de entrenamiento, validacion local y calibracion por cuenca.
- Los resultados de la busqueda web asociados a esta ficha no guardan ninguna relacion con el modelo (corresponden a localizaciones de una entidad bancaria) y no se han utilizado como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OneScience-Group/RainRunoff-LSTM
- Articulo de referencia (Kratzert et al., 2018), "Rainfall-runoff modelling using Long Short-Term Memory (LSTM) networks": https://doi.org/10.5194/hess-22-6005-2018
- No se han encontrado en la busqueda web enlaces relevantes adicionales (papers, blogs, repositorios o demos) relacionados con este modelo.
