# fin-ai-lab/tfwm-mae

## Resumen

TFWM encoder — MAE es un codificador auto-supervisado para series temporales de datos de mercado desarrollado por fin-ai-lab. Forma parte de la familia TFWM (Towards Financial World Modeling), un conjunto de 18 codificadores que comparten exactamente el mismo backbone y el mismo regimen de entrenamiento, y que se diferencian unicamente en el objetivo de aprendizaje auto-supervisado. En este caso el objetivo es un autoencoder enmascarado (MAE, He et al., 2022) en el que se enmascara el 75 % de los parches de entrada.

El modelo no genera texto ni mantiene conversaciones: es un extractor de caracteristicas (pipeline `feature-extraction`) que convierte ventanas de datos de mercado a 1 Hz en representaciones latentes. La entrada son datos de acciones estadounidenses en sesion regular muestreados a 1 Hz, con 9 canales de mercado (bid_price, vwap_all, high, low, ask_price, bid_size, ask_size, volume, n) mas 11 canales de informacion de vista calculados en tiempo de carga, hasta un total de 20 canales.

Es relevante porque aborda un problema poco cubierto por los modelos de lenguaje: el preentrenamiento auto-supervisado sobre datos financieros de alta frecuencia, con el objetivo de obtener representaciones reutilizables para tareas posteriores de forecasting y analisis latente. El repositorio esta marcado explicitamente como pre-release, el codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico todavia y el modelo no registra descargas ni interacciones en HuggingFace en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, 12 capas, anchura 384, 6 cabezas de atencion, MLP de 1536, tamano de parche 8, posiciones sinusoidales |
| Parametros totales | ~22 millones (aproximadamente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (se procesan secuencias de parches de 8 muestras a 1 Hz; el numero de parches por ventana no se especifica en la informacion disponible) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos PyTorch sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible; el modelo opera sobre series temporales numericas y no procesa lenguaje natural |
| Licencia | `other`, con `license_name: derived-market-data` (licencia derivada de datos de mercado, condiciones no detalladas en la model card) |
| Formato de pesos | PyTorch state dict (`model.pt`) acompanado de `config.json` y `train_meta.json`; no hay safetensors ni GGUF |
| Autor | fin-ai-lab |
| Pipeline | feature-extraction |
| Libreria | pytorch |
| Dataset de entrenamiento | fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense (subcarpeta `1Hz_mosaic_mnth/`) |
| Tamano del repositorio | 0,5 GB |
| Numero de checkpoints | 5 (2019-09, 2020-01, 2020-08, 2020-09, 2020-12) |

## Arquitectura y entrenamiento

El backbone es un Transformer de 12 capas con anchura 384, 6 cabezas de atencion, MLP de dimension 1536 y embeddings posicionales sinusoidales, con un total de aproximadamente 22 millones de parametros. La tokenizacion se hace por parches de 8 muestras sobre la rejilla de 1 Hz. La entrada combina 9 canales de microestructura de mercado (precios bid/ask, VWAP, maximo, minimo, tamanos de bid y ask, volumen y numero de operaciones) con 11 canales de informacion de vista que se calculan en tiempo de carga (estadisticas de normalizacion por vista y geometria de la ventana), sumando 20 canales.

El preentrenamiento sigue el esquema de autoencoder enmascarado de He et al. (2022) con un 75 % de parches enmascarados. El regimen es identico al del resto de codificadores de la familia: 12 pasadas sobre el mismo tramo de seis meses, learning rate base de 0,0005, weight decay de 0,05 y batch de 2048. Los datos provienen del dataset Market-1T-1Hz, con un registro por ticker-dia sobre la rejilla de 1 Hz rellenada y mezclado dentro de cada mes. No se menciona en la informacion disponible ninguna fase de RLHF, DPO ni ajuste supervisado posterior.

Se publica un checkpoint por mes de evaluacion, cada uno entrenado sobre los seis meses inmediatamente anteriores a ese mes, de modo que ninguno vio el mes sobre el que se evalua. Cuatro de los checkpoints pueden reentrenarse a partir de los datos publicos; el de `2019-09/` no, porque su tramo de entrenamiento (2019-03 a 2019-08) queda fuera del rango cubierto por Market-1T (2019-07 a 2020-12).

## Capacidades

- Extraccion de representaciones latentes a partir de ventanas de datos de mercado a 1 Hz con 20 canales de entrada.
- Prediccion auto-supervisada de parches enmascarados (75 % de enmascaramiento) como tarea de preentrenamiento.
- Soporte de dos modos de lectura: `pool="last"`, que devuelve el embedding del ultimo parche (estado en el momento de decision, usado en las pruebas de forecasting del paper), y `pool="mean"`, que promedia sobre los parches (usado en los analisis latentes). El `config.json` almacena `mean` por defecto.
- Uso como extractor de caracteristicas congeladas para probes supervisados (por ejemplo, regresion lineal sobre embeddings) en tareas de prediccion financiera.
- Analisis latente de dinamica de mercado: la representacion media de una ventana puede emplearse para comparar regimenes, dias o instrumentos en el espacio de embeddings.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni capacidades multilingues.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Forecasting financiero con probe supervisado: cargar el checkpoint correspondiente al mes de evaluacion, extraer el embedding del ultimo parche (`pool="last"`) y entrenar encima un modelo ligero de prediccion. Es el uso que el propio paper describe para las pruebas de forecasting.
- Analisis de regimenes de mercado: usar el embedding medio (`pool="mean"`) de ventanas de un dia o de una sesion para agrupar periodos con comportamiento similar mediante clustering o reduccion de dimensionalidad.
- Preentrenamiento de pipelines cuantitativos: emplear el encoder como inicializacion congelada en modelos supervisados de senales, reduciendo la cantidad de etiquetas necesarias frente a entrenar desde cero.
- Investigacion academica sobre world models financieros: el modelo forma parte de una comparativa controlada de 18 objetivos auto-supervisados sobre el mismo backbone y los mismos datos, lo que permite aislar el efecto de la funcion de perdida.
- Deteccion de anomalias en microestructura: representar ventanas de datos de libro de ordenes y volumen y detectar desviaciones respecto a la distribucion habitual de embeddings.
- Evaluacion walk-forward reproducible: la publicacion de un checkpoint por mes con separacion estricta entre entrenamiento y evaluacion permite construir protocolos de validacion temporal sin fuga de informacion, siempre que se respete el tramo de cada checkpoint.
- Recuperacion por similitud entre dias de mercado: indexar embeddings de sesiones y recuperar los periodos historicamente mas parecidos a una jornada dada para analisis comparativo.
- Seleccion y compresion de caracteristicas: sustituir las 20 series de entrada por un vector latente mas compacto antes de alimentar modelos supervisados o motores de backtesting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que este encoder es uno de los 18 comparados en el trabajo *Towards Financial World Modeling* (TFWM), pero no incluye cifras de rendimiento ni tablas de resultados. Cualquier numero adicional requeriria consultar el paper, que no aparece enlazado en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~22 millones de parametros, los pesos ocupan aproximadamente 88 MB en fp32 y 44 MB en fp16. El consumo total depende del tamano de lote y de la longitud de la ventana; en escenarios de inferencia por lotes moderados cabe holgadamente por debajo de 1 GB de VRAM (estimacion).
- GPU recomendadas: cualquier GPU moderna sirve para inferencia. Se puede ejecutar en CPU sin problema por el reducido tamano del modelo. Para reproducir el entrenamiento con batch 2048 se recomienda una GPU con memoria amplia (A100, H100 o similares), aunque no se especifica el hardware usado en el entrenamiento original.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en equipos sin GPU dedicada, dado el tamano del modelo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue natural es PyTorch puro: cargar `model.pt` con `torch.load` o mediante la funcion `load_encoder` del paquete `market_jepa` cuando se publique. La exportacion a TorchScript u ONNX no se menciona.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card situa este encoder dentro de la coleccion TFWM Pre-Trained Encoders, junto a otros 17 codificadores que comparten backbone, datos y regimen de entrenamiento, y que difieren fundamentalmente en el objetivo auto-supervisado. Dos de ellos se mencionan de forma explicita en la documentacion.

| Modelo | Backbone | Objetivo de entrenamiento | Pooling por defecto | Contexto | Licencia | Datos publicos de rendimiento |
|---|---|---|---|---|---|---|
| tfwm-mae (este modelo) | Transformer 12 capas, ~22M parametros | Autoencoder enmascarado, 75 % de parches | `mean` | no disponible | `other` / derived-market-data | no disponible |
| TFWM con TS2Vec | Mismo backbone (~22M), con `swa_backbone` | Objetivo contrastivo temporal de TS2Vec | `mean` | no disponible | no disponible | no disponible |
| TFWM con TF-C | Mismo backbone (~22M), con `freq_backbone` | Objetivo contrastivo en frecuencia de TF-C | `mean` | no disponible | no disponible | no disponible |

No se dispone de informacion sobre parametros, contexto, licencia ni resultados de otros codificadores de la coleccion mas alla de lo indicado, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Estado pre-release: los pesos y el codigo que los carga son trabajo en curso y su contenido y estructura pueden cambiar sin aviso. El codigo de entrenamiento (`market_jepa`, `stable_finance`) todavia no es publico.
- Sin resultados de benchmarks publicados en la informacion disponible, no es posible verificar la calidad de las representaciones ni compararlas de forma objetiva con alternativas.
- Licencia `other` con `license_name: derived-market-data`: al derivar de datos de mercado, las condiciones exactas de uso comercial no se detallan en la model card y deben verificarse antes de cualquier despliegue en produccion.
- Ambito restringido: los datos de entrenamiento son acciones estadounidenses en sesion regular muestreadas a 1 Hz. El comportamiento fuera de ese universo (otros mercados, otros horarios, otras frecuencias, cripto, renta fija) no esta documentado.
- Tramo de entrenamiento no reproducible: el checkpoint `2019-09/` se entreno con datos anteriores a 2019-07 que no estan incluidos en el dataset publicado, por lo que no puede reentrenarse a partir de la informacion disponible.
- Riesgo de fuga de informacion si no se respeta la separacion temporal: cada checkpoint debe usarse unicamente sobre su mes de evaluacion declarado en protocolos de validacion temporal.
- Detalle de configuracion facil de pasar por alto: `from_pretrained` usa el `pool` guardado en `config.json` (`mean` en todos los encoders auto-supervisados) e ignora el `pool` que se pase en un `config` separado. Para obtener la lectura del ultimo parche hay que asignar `.pool = "last"` en cada sub-backbone despues de la carga (`backbone`, y tambien `swa_backbone` para TS2Vec y `freq_backbone` para TF-C).
- Sin soporte de lenguaje natural: no hay capacidades multilingues ni de generacion de texto, por lo que no debe evaluarse con las expectativas de un modelo de lenguaje.
- Sesgos y riesgos de alucinacion: al no ser un modelo generativo de texto, el riesgo de alucinacion en el sentido habitual no aplica; sin embargo, las representaciones aprendidas pueden heredar sesgos presentes en los datos de mercado usados para el preentrenamiento, y este aspecto no se analiza en la documentacion disponible.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe todavia validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-mae
- Coleccion TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Subcarpeta del dataset usada en el entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Referencia del metodo MAE: He et al., 2022 (Masked Autoencoders Are Scalable Vision Learners); no se proporciona enlace en la informacion disponible.
- Paper *Towards Financial World Modeling* (TFWM): mencionado en la model card, sin enlace disponible.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores son los unicos disponibles.
