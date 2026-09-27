# fin-ai-lab/tfwm-lejepa-time-warp

## Resumen

TFWM encoder — LeJEPA Time Warping es un codificador auto-supervisado para series temporales de mercado, desarrollado por fin-ai-lab. No es un modelo generativo ni un modelo de lenguaje: es un extractor de características (pipeline `feature-extraction`) que convierte ventanas de datos de mercado a 1 Hz en representaciones latentes. Su arquitectura es un transformer de 12 capas, ancho 384, 6 cabezas y MLP de 1536, con parcheo de tamano 8 y posiciones sinusoidales, lo que suma aproximadamente 22 millones de parametros. Se distribuye como cinco checkpoints, uno por mes de evaluacion (2019-09, 2020-01, 2020-08, 2020-09 y 2020-12), cada uno entrenado sobre los seis meses inmediatamente anteriores.

El modelo emplea LeJEPA, una variante de las arquitecturas predictivas de embedding conjunto (JEPA) con el regularizador isotropico-gaussiano SIGReg. Cada muestra se descompone en dos vistas globales y seis locales, generadas como dos deformaciones temporales suaves e independientes de una misma ventana. La entrada son datos de acciones estadounidenses en sesion regular a 1 Hz: 9 canales de mercado (bid_price, vwap_all, high, low, ask_price, bid_size, ask_size, volume, n) mas 11 canales de informacion de vista calculados en tiempo de carga, hasta 20 canales en total.

Es relevante porque forma parte de una comparativa controlada de 18 codificadores preentrenados en el trabajo *Towards Financial World Modeling* (TFWM): todos comparten backbone y presupuesto de entrenamiento (12 pasadas sobre los mismos periodos de seis meses) y solo difieren en el objetivo de entrenamiento, lo que permite aislar el efecto de cada objetivo auto-supervisado en datos financieros. En el momento de redactar esta ficha el modelo esta marcado como pre-release, el codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico y cuenta con 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (JEPA / LeJEPA con regularizador SIGReg), 12 capas, ancho 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales |
| Parametros totales | ~22 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la ventana de entrada depende de la configuracion del dataset y del `config.json` de cada checkpoint) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en precision completa como state dict de PyTorch; no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; la entrada es numerica de mercado) |
| Licencia | `other`, con `license_name: derived-market-data` (licencia derivada de datos de mercado) |
| Formato de pesos | PyTorch state dict (`model.pt`) por checkpoint, mas `config.json` y `train_meta.json` |
| Entrada | 20 canales: 9 canales de mercado + 11 canales de informacion de vista (normalizacion por vista y geometria de ventana) |
| Tarea declarada (`pipeline_tag`) | `feature-extraction` |
| Checkpoints incluidos | 5 (`2019-09`, `2020-01`, `2020-08`, `2020-09`, `2020-12`) |
| Tamano del repositorio | 0,5 GB |
| Fecha de publicacion | 27 de septiembre de 2026 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

El backbone es un transformer de 12 capas con ancho 384, 6 cabezas de atencion y MLP de 1536, que opera sobre parches de 8 muestras con codificacion posicional sinusoidal, sumando unos 22 millones de parametros. Sobre esa base se aplica el marco LeJEPA: una arquitectura predictiva de embedding conjunto que proyecta vistas aumentadas de la misma ventana a un espacio latente compartido, regularizado con SIGReg para aproximar una gaussiana isotropica y evitar el colapso de representaciones. Cada muestra genera ocho vistas: dos globales y seis locales, construidas como dos deformaciones temporales suaves e independientes de una unica ventana, de ahi el sufijo "time-warp" del modelo.

Los datos de entrenamiento provienen del dataset `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`, en la carpeta `1Hz_mosaic_mnth`, con un registro por ticker-dia sobre una rejilla rellenada de 1 Hz y mezclado dentro de cada mes. El calendario es de 12 pasadas sobre un tramo de seis meses, con learning rate base de 6e-05, weight decay de 0,05 y batch de 256. Todos los codificadores auto-supervisados de la familia guardan `pool="mean"` en su `config.json`, que es el modo de agregacion usado durante el entrenamiento. En el articulo, el modo de lectura se separa por tarea: las probes de forecasting usan el embedding del ultimo parche (`pool="last"`, el estado en el instante de decision) y los analisis latentes usan la media sobre parches (`pool="mean"`). Para obtener la lectura de ultimo parche hay que fijar `.pool = "last"` en cada sub-backbone despues de cargar el checkpoint, ya que se ignora cualquier `pool` pasado en un `config` aparte. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a un codificador de caracteristicas.

## Capacidades

- Extraccion de embeddings de ventanas de datos de mercado a 1 Hz para acciones estadounidenses en sesion regular.
- Codificacion de 9 canales de microestructura y precio (bid_price, vwap_all, high, low, ask_price, bid_size, ask_size, volume, n) junto con 11 canales de informacion de vista.
- Agregacion configurable de la representacion: media sobre parches (`pool="mean"`) o ultimo parche (`pool="last"`) para obtener el estado en el instante de decision.
- Aprendizaje auto-supervisado sin etiquetas, lo que permite preentrenar con datos historicos sin anotaciones.
- Invariancia aproximada a deformaciones temporales suaves, gracias al objetivo de time warping.
- Uso como backbone congelado para probes de forecasting y para analisis del espacio latente.
- No soporta generacion de texto, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta capacidad multilingue (la entrada no es textual).
- No se declara un modo de razonamiento explicito ("thinking mode") ni salidas interpretables.
- Los pesos son state dicts estandar de PyTorch, cargables sin el codigo del proyecto para inspeccion o extraccion manual.

## Casos de uso

- Probes de forecasting: congelar el encoder y entrenar una cabeza lineal sobre el embedding del ultimo parche para predecir retornos o volatilidad a un horizonte fijo. Es el uso que el propio articulo describe con `pool="last"`, el estado en el instante de decision.
- Analisis de regimenes de mercado: extraer embeddings con `pool="mean"` sobre ventanas historicas y aplicar clustering para identificar y monitorizar regimenes, comparando su evolucion entre meses con los checkpoints correspondientes.
- Deteccion de cambios de regimen y anomalias: proyectar cada ventana en el espacio latente y medir distancias al centroide reciente del propio ticker o del sector; desviaciones grandes indican condiciones atipicas.
- Recuperacion de analogos historicos: indexar embeddings de ventanas pasadas y usar busqueda por vecinos mas cercanos para encontrar periodos con estructura de microestructura similar al instante actual, como apoyo a analisis discrecional.
- Ingenieria de caracteristicas para modelos tabulares: usar las 384 dimensiones del embedding como variables de entrada de modelos de gradient boosting ya existentes, en lugar de caracteristicas tecnicas construidas a mano.
- Comparativa de objetivos auto-supervisados: al compartir backbone y presupuesto de entrenamiento con los otros 17 encoders de la familia TFWM, sirve para aislar el efecto del objetivo LeJEPA frente a alternativas como TS2Vec o TF-C en una tarea downstream concreta.
- Investigacion academica sobre representaciones financieras: estudiar propiedades del espacio latente (isotropia, colapso, invariancia a warping) sobre datos de mercado reales, reutilizando los checkpoints mensuales para evaluaciones fuera de muestra.
- Validacion experimental retrospectiva: reproducir el protocolo del articulo (entrenar con seis meses, evaluar en el mes siguiente) con el checkpoint mensual adecuado para verificar la generalizacion temporal de una senal antes de llevarla a produccion.
- Preentrenamiento como inicializacion: partir de estos pesos en lugar de inicializacion aleatoria para ajustar tareas financieras con pocos datos etiquetados, sujeto a los terminos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que este encoder es uno de los 18 comparados en *Towards Financial World Modeling* (TFWM) bajo un protocolo comun (mismo backbone, 12 pasadas sobre los mismos tramos de seis meses), pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de metricas de forecasting en el material proporcionado. Tampoco se publican curvas de perdida, metricas de probes ni resultados por mes de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 88 MB de pesos en fp32 y unos 44 MB en fp16 para los ~22 millones de parametros. El consumo real dependera de la longitud de ventana y del tamano de batch, que se acumulan en memoria de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia por lotes pequenos. Una RTX 3060, RTX 4090, A100 o H100 son sobradamente capaces; en el rango consumer basta con una GTX 1060 o superior.
- Inferencia en CPU: viable, dado el tamano del modelo; el cuello de botella esperado es el volumen de datos a 1 Hz, no los parametros.
- Despliegue: la via documentada es PyTorch directo, cargando `model.pt` como state dict con `torch.load(..., weights_only=True)` o mediante `market_jepa.eval.checkpoints.load_encoder` cuando se publique el codigo del proyecto. No se declara soporte de vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime.
- Formato de despliegue: no hay pesos GGUF ni cuantizaciones publicadas; cualquier conversion a otro runtime requeriria exportar el state dict manualmente.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de ventanas procesadas por segundo.
- Almacenamiento: cada checkpoint pesa aproximadamente 88 MB en fp32; el snapshot completo de los cinco meses ocupa alrededor de 0,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tfwm-lejepa-time-warp (este) | ~22 M | No disponible | No publicado | `other` / derived-market-data | Pesos publicos; codigo de entrenamiento no publico |
| Otros encoders de la coleccion TFWM (17 restantes) | Mismo backbone (~22 M) | No disponible | No publicado | No disponible en la informacion proporcionada | Pesos publicos en la coleccion |
| TS2Vec (referencia citada en la model card) | No disponible | No disponible | No publicado en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada |
| TF-C (referencia citada en la model card) | No disponible | No disponible | No publicado en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada |

La comparacion esta limitada por la ausencia de cifras: los 18 encoders TFWM comparten backbone, tamano y regimen de entrenamiento, y segun la model card solo difieren en el objetivo, de modo que la comparativa relevante es metodologica (objetivo LeJEPA con time warping frente a los otros objetivos) y no de tamano o contexto. No se dispone de datos de rendimiento de ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Estado pre-release declarado por el propio autor: los pesos y el codigo que los carga son trabajo en curso y el contenido y la disposicion pueden cambiar sin aviso.
- El codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico; sin el, la reproducibilidad del preentrenamiento y del pipeline completo no esta garantizada.
- Licencia `other` con nombre `derived-market-data`: al derivar de datos de mercado, el uso comercial esta sujeto a los terminos de dichos datos, que no se detallan en la informacion disponible. Verificar antes de cualquier uso en produccion.
- El checkpoint `2019-09` se entreno sobre 2019-03 a 2019-08, un tramo fuera del dataset publicado (Market-1T cubre 2019-07 a 2020-12); ese encoder no puede reentrenarse a partir de los datos liberados.
- Los checkpoints son especificos de mes y cada uno se entreno con los seis meses inmediatamente anteriores; no hay un checkpoint unico de proposito general.
- Cobertura limitada a acciones estadounidenses en sesion regular a 1 Hz. No se documenta comportamiento en otros mercados, otros activos, otras frecuencias ni datos fuera de sesion.
- No es un modelo de lenguaje: no genera texto ni respuestas, y su uso indebido como predictor directo de precios no esta respaldado por la documentacion.
- Riesgo de correlaciones espurias y de sobreajuste al regimen historico de entrenamiento: un embedding con buena estructura latente no implica capacidad predictiva fuera de muestra.
- Ausencia total de benchmarks y de validacion por terceros; el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia externa de calidad.
- La agregacion por defecto en `config.json` es `mean`; para forecasting se requiere `pool="last"`, y el `pool` pasado en un `config` aparte se ignora. Un uso descuidado de este detalle produce representaciones distintas de las esperadas.
- No hay cuantizaciones ni formatos ligeros publicados, ni mediciones de latencia, throughput o consumo de VRAM, lo que dificulta planificar despliegues con requisitos estrictos.
- No se documenta sesgo demografico ni linguistico porque la entrada no es textual, pero si puede existir sesgo de cobertura de activos (solo el universo presente en el dataset).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-lejepa-time-warp
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Carpeta concreta del dataset usada en el entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Coleccion con los 18 encoders preentrenados TFWM: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Articulo *Towards Financial World Modeling* (TFWM): citado en la model card, sin URL ni identificador en la informacion disponible
- Codigo del proyecto `market_jepa` y `stable_finance`: anunciado como proximo, sin repositorio publico ni URL en la informacion disponible
- Busqueda web: los resultados devueltos corresponden a entradas de diccionario frances sobre el termino "fin" (Larousse, Le Robert, Wiktionary, Wikipedia y fin.fr) y no guardan relacion con el modelo; no se han encontrado fuentes adicionales relevantes.
