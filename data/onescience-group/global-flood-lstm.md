# OneScience-Group/Global-Flood-LSTM

## Resumen

Global-Flood-LSTM es un modelo hidrologico probabilistico de caudal para cuencas no aforadas de todo el mundo. Combina el historico meteorologico, el forzamiento de prediccion y los atributos fisiograficos de la cuenca para producir distribuciones de caudal a siete dias y estimaciones de fiabilidad en crecidas extremas. El modelo fue propuesto originalmente por investigadores de Google Research, ECMWF, el Helmholtz Centre for Environmental Research y RAND Corporation, y se describe en el articulo "Global prediction of extreme floods in ungauged watersheds" (Nature, doi:10.1038/s41586-024-07145-1). La implementacion publicada por OneScience-Group es una reproduccion de ingenieria independiente de esas especificaciones.

Arquitectonicamente se trata de un LSTM encoder-decoder con salida probabilistica, que consume 365 dias de historico meteorologico, siete dias de forzamiento de prediccion y atributos estaticos de cuenca (HydroATLAS), y devuelve una distribucion condicional de caudal por horizonte de prediccion. El entrenamiento original utilizo observaciones de caudal de 5.680 aforos GRDC y forzamientos de HRES, ERA5-Land, CPC, IMERG y HydroATLAS. La distribucion se parametriza mediante una verosimilitud Laplace asimetrica, lo que permite obtener intervalos y percentiles en lugar de una unica prediccion puntual.

Su relevancia actual radica en que aborda el problema de las cuencas sin instrumentacion: un unico modelo compartido se aplica a cuencas excluidas del entrenamiento, lo que resulta critico para sistemas de alerta temprana en regiones con redes de aforo escasas. No obstante, conviene subrayar que el repositorio distribuido no publica un enlace a pesos preentrenados y que su configuracion por defecto se ejecuta sobre datos sinteticos con fines de validacion del flujo de trabajo, no de reproduccion de los resultados del articulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM encoder-decoder con salida probabilistica (verosimilitud Laplace asimetrica) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable como contexto de tokens; ventana de entrada de 365 dias de historico meteorologico mas 7 dias de forzamiento de prediccion, con salida a 7 dias |
| Tipos de cuantizacion | no disponible; se distribuye un checkpoint PyTorch (.pt), no formatos cuantizados |
| Idiomas soportados | en (documentacion y codigo en ingles; el modelo no procesa lenguaje natural) |
| Licencia | apache-2.0 para el codigo; el articulo original esta bajo CC BY 4.0 |
| Formato de pesos | PyTorch (`result/checkpoints/global_flood_lstm.pt`); no se proporciona enlace a pesos preentrenados |

## Arquitectura y entrenamiento

El modelo es un LSTM encoder-decoder disenado para series temporales hidrologicas. El encoder consume la secuencia historica de variables meteorologicas y de estado de cuenca, mientras que el decoder integra el forzamiento de prediccion (prevision meteorologica) y genera una distribucion de caudal para cada uno de los siete dias de horizonte. Los atributos estaticos de cuenca procedentes de HydroATLAS se incorporan como caracteristicas adicionales, lo que permite que un mismo conjunto de pesos se aplique a cuencas geograficamente dispares. La salida no es un valor puntual, sino una distribucion condicional dependiente del horizonte de prediccion, lo que habilita el calculo de percentiles y de umbrales de alerta.

En cuanto a los datos, el articulo original entrena con observaciones diarias de caudal de 5.680 aforos GRDC y con forzamientos de HRES, ERA5-Land, CPC, IMERG y HydroATLAS. La funcion de perdida por defecto en la reproduccion de OneScience es el logaritmo negativo de la verosimilitud Laplace asimetrica. La configuracion sintetica incluida en el repositorio mantiene la estructura del problema (365 dias de historico, 14 canales dinamicos de entrada, salida a siete dias y protocolo de distribucion de probabilidad) pero reduce el numero de cuencas, la anchura oculta y las iteraciones de entrenamiento. El propio autor advierte que el recuento de caracteristicas estaticas es un registro de ingenieria, ya que el articulo no lo enumera, y que los resultados sobre datos sinteticos no representan el rendimiento del articulo.

No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable dado que no es un modelo de lenguaje. Tampoco se detalla el numero de tokens, la composicion exacta del dataset ni innovaciones adicionales como atencion lineal o decodificacion especulativa.

## Capacidades

- Prediccion probabilistica de caudal a siete dias para cuencas no aforadas, mediante un modelo compartido aplicado a cuencas excluidas del entrenamiento.
- Prediccion de crecidas extremas con evaluacion de precision, exhaustividad (recall) y F1 sobre eventos de crecida.
- Generacion de distribuciones condicionales dependientes del horizonte de prediccion (percentiles e intervalos de incertidumbre).
- Benchmarking hidrologico mediante metricas RMSE y KGE, con curvas de error por tiempo de antelacion y de habilidad por evento.
- Entrenamiento distribuido multi-GPU y multi-nodo mediante `torchrun` (se ha verificado el modo DDP con dos procesos).
- Ejecucion en CPU para la configuracion de conectividad con muestras pequenas, y en GPU o DCU para cargas completas.
- Validacion de flujos estructurados de datos, entrenamiento, inferencia, metricas de precipitacion probabilistica y visualizacion en entornos ModelScope o OneCode.
- No dispone de tool calling, function calling, soporte de agentes, capacidades multilingues ni modos de razonamiento tipo thinking: no es un modelo de lenguaje.

## Casos de uso

- Prediccion en cuencas no aforadas: se aplica el modelo entrenado a cuencas sin estaciones de aforo, aprovechando que los atributos estaticos de HydroATLAS actuan como descriptores de cuenca y permiten generalizar a regiones sin observaciones historicas.
- Aviso temprano de crecidas extremas: el modelo produce probabilidades de evento extremo a siete dias, lo que permite calcular umbrales de alerta y evaluar el balance entre falsos positivos y falsos negativos mediante precision, recall y F1.
- Gestion probabilistica de embalses y recursos hidricos: las distribuciones condicionales por horizonte permiten dimensionar decisiones operativas en funcion de la probabilidad de superar un caudal objetivo, en lugar de depender de una unica prediccion determinista.
- Benchmarking y evaluacion de sistemas hidrologicos: el script de evaluacion calcula RMSE, KGE y curvas de habilidad por evento, lo que sirve para comparar el modelo con alternativas sobre un mismo conjunto de cuencas.
- Reproduccion y desarrollo de pipelines hidrologicos: la configuracion sintetica permite validar de extremo a extremo la carga de datos, el entrenamiento, la inferencia y la evaluacion sin necesidad de acceder a datos restringidos como GRDC o ERA5-Land.
- Entrenamiento distribuido en clusters: el repositorio incluye un lanzador `torchrun` con soporte DDP, util para escalar el entrenamiento a multiples GPU o a aceleradores DCU con DTK 25.04.2.
- Integracion en plataformas cientificas automatizadas: la compatibilidad declarada con ModelScope y OneCode permite integrar el modelo en flujos de trabajo estructurados de investigacion reproducible, incluyendo la validacion de formas y valores finitos en las predicciones.
- Formacion academica en hidrologia computacional: los datos sinteticos y los scripts separados de entrenamiento, inferencia y evaluacion permiten ilustrar el ciclo completo de un modelo probabilistico de caudal sin depender de infraestructura de datos propietaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio declara un script de evaluacion que calcula RMSE, KGE, precision, recall y F1, asi como curvas de error por tiempo de antelacion y de habilidad por evento, pero no se aportan valores numericos en la informacion proporcionada. Ademas, el propio autor indica que las metricas obtenidas sobre datos sinteticos son finitas y verificables pero no representan el rendimiento del articulo original, y que la configuracion sintetica emplea un proxy de percentil en lugar de los umbrales de periodo de retorno basados en el Bulletin 17B usados en el articulo.

| Metrica | Valor en el repositorio | Nota |
|---|---|---|
| RMSE | no disponible | Metrica implementada, sin valores publicados |
| KGE | no disponible | Metrica implementada, sin valores publicados |
| Precision (crecidas) | no disponible | Metrica implementada, sin valores publicados |
| Recall (crecidas) | no disponible | Metrica implementada, sin valores publicados |
| F1 (crecidas) | no disponible | Metrica implementada, sin valores publicados |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El consumo depende de la anchura oculta, del numero de cuencas procesadas y de la longitud de la ventana temporal, parametros que no se detallan en la informacion disponible.
- GPU o DCU recomendadas por el autor para entrenamiento e inferencia en configuracion completa.
- CPU: suficiente para ejecutar la configuracion por defecto de muestras pequenas orientada a validar la conectividad del pipeline.
- Aceleradores DCU: requieren instalar previamente DTK 25.04.2 o una version compatible recomendada por OneScience.
- Cabeza en GPU de consumo: no disponible como dato confirmado, aunque se trata de un LSTM de escala muy inferior a la de un modelo de lenguaje y el propio repositorio contempla la ejecucion en CPU para la configuracion reducida.
- Opciones de despliegue: PyTorch con el paquete `onescience` (extra `earth-gpu` o `earth-dcu`), lanzamiento distribuido mediante `torchrun`, y entornos ModelScope o OneCode. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por lote, cuencas por segundo ni latencia de inferencia.
- Almacenamiento: el entrenamiento genera un unico checkpoint recuperable en `result/checkpoints/global_flood_lstm.pt` y un fichero de metricas en `result/training/metrics.json`; la inferencia escribe `result/output/predictions.npz`.

## Comparativa con modelos similares

La informacion disponible no permite establecer una comparativa cuantitativa fiable. El unico termino de comparacion documentado es la implementacion de investigacion descrita en el articulo original, desarrollada sobre NeuralHydrology, frente a la cual esta reproduccion presenta diferencias relevantes en disponibilidad de pesos y en datos de prueba.

| Modelo | Parametros | Contexto o ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Global-Flood-LSTM (OneScience-Group) | no disponible | 365 dias de historico + 7 dias de prediccion; salida a 7 dias | no disponible; metricas implementadas sin valores publicados | apache-2.0 (codigo) | Repositorio en HuggingFace; sin enlace a pesos preentrenados |
| Implementacion de investigacion del articulo (NeuralHydrology) | no disponible | Descripcion compatible con la del articulo | Resultados publicados en Nature (no reproducidos aqui) | Articulo bajo CC BY 4.0; datos sujetos a sus propias licencias | No confirmada en la informacion disponible |
| Otras alternativas de prediccion hidrologica global | no disponible | no disponible | no disponible | no disponible | no disponible |

Las busquedas web realizadas no devolvieron resultados tecnicos relacionados con el modelo, por lo que no se dispone de informacion adicional para completar esta comparativa.

## Limitaciones y advertencias

- Se trata de una reproduccion de ingenieria independiente de unas especificaciones publicas, no del checkpoint original utilizado en el articulo. El autor indica expresamente que no proporciona un enlace a pesos porque no pudo confirmar un checkpoint original con licencia separada.
- La configuracion por defecto se ejecuta sobre datos sinteticos. Los resultados sirven para verificar el flujo de trabajo, pero no representan el rendimiento del modelo descrito en el articulo.
- El recuento de caracteristicas estaticas empleado en la reproduccion es un registro de ingenieria, ya que el articulo no lo enumera; esto puede introducir divergencias respecto a la implementacion original.
- La evaluacion con datos sinteticos usa un proxy de percentil en lugar de los umbrales de periodo de retorno basados en el Bulletin 17B del articulo, por lo que las metricas de crecidas no son directamente comparables con las publicadas.
- Sesgo de representacion geografica: el entrenamiento original se apoya en 5.680 aforos GRDC, con una distribucion desigual entre regiones. Las cuencas con regimenes hidrologicos poco representados en esa red pueden presentar un rendimiento inferior y una calibracion de incertidumbre deficiente.
- Riesgo de extrapolacion: al aplicarse a cuencas no aforadas, el modelo puede producir predicciones con incertidumbre mal calibrada en regimenes extremos no observados durante el entrenamiento.
- Idioma: el modelo no procesa lenguaje natural y la documentacion solo esta en ingles.
- Restricciones de licencia: aunque el codigo se publica bajo Apache 2.0, los datos empleados (GRDC, HRES, ERA5-Land, CPC, IMERG y HydroATLAS) estan sujetos a sus propios terminos de uso. Cualquier uso comercial o redistribucion debe revisar esas condiciones por separado, ya que la licencia del repositorio no las cubre.
- Advertencia de uso: es un modelo hidrologico de prediccion, no un modelo de lenguaje. No dispone de generacion de texto, razonamiento, codigo, vision, tool calling ni soporte de agentes, y no debe evaluarse con los criterios habituales de un LLM.
- No se documentan medidas de mitigacion de sesgos, auditorias de robustez ni pruebas de estres fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/Global-Flood-LSTM
- Articulo de referencia: "Global prediction of extreme floods in ungauged watersheds", https://doi.org/10.1038/s41586-024-07145-1
- OneScience en GitHub: https://github.com/onescience-ai/OneScience
- OneSkills en GitHub: https://github.com/onescience-ai/oneskills
- OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- OneSkills en Gitee: https://gitee.com/onescience-ai/oneskills

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los unicos enlaces verificables son los incluidos en la model card y en la propia pagina de HuggingFace.
