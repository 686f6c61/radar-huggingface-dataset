# fin-ai-lab/tfwm-lejepa-same-stock

## Resumen

TFWM LeJEPA Same Stock es un codificador (encoder) de representaciones para series temporales financieras desarrollado por fin-ai-lab. Se trata de un transformer de aproximadamente 22 millones de parámetros que procesa datos de mercado de acciones estadounidenses a 1 Hz durante la sesión regular y produce embeddings utilizables como características para tareas posteriores. El modelo se publica bajo el pipeline `feature-extraction` y no genera texto ni predicciones directas: su salida es una representación latente del estado de mercado en un momento dado.

La arquitectura sigue el enfoque LeJEPA, una arquitectura predictiva de embeddings conjuntos (joint-embedding predictive architecture) con regularizador isotrópico-gaussiano SIGReg. Cada muestra se presenta al modelo mediante dos vistas globales y seis locales, generadas como recortes aleatorios redimensionados del mismo día de cotización (stock-day). Forma parte de los 18 codificadores comparados en el trabajo *Towards Financial World Modeling* (TFWM); todos comparten el mismo backbone y el mismo presupuesto de entrenamiento de 12 pasadas sobre los mismos periodos de seis meses, por lo que sus diferencias se deben principalmente al objetivo de entrenamiento.

El modelo es relevante para equipos de investigación cuantitativa que necesitan representaciones preentrenadas de microestructura de mercado sin entrenar desde cero, y para quienes quieran reproducir análisis walk-forward: se publican cinco checkpoints, cada uno entrenado con los seis meses inmediatamente anteriores a su mes de evaluación, de modo que nunca vio el mes sobre el que se evalúa. El estado actual es de prelanzamiento: el código de entrenamiento (`market_jepa`, `stable_finance`) todavía no es público.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (LeJEPA), 12 capas, ancho 384, 6 cabezas de atención, MLP de 1536, patch de 8, posiciones sinusoidales |
| Parámetros totales | ~22 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se publican como state dicts de PyTorch en fp32; no se ofrecen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible / no aplica (el modelo procesa series temporales numéricas, no lenguaje natural) |
| Licencia | other — `derived-market-data` |
| Formato de pesos | State dict de PyTorch (`model.pt`) acompañado de `config.json` y `train_meta.json` |
| Canales de entrada | 20 (9 canales de mercado + 11 canales de información de vista) |
| Resolución temporal | 1 Hz, sesión regular de renta variable estadounidense |
| Pooling por defecto | `mean` (el paper usa `last` para sondas de predicción y `mean` para análisis latentes) |
| Tamaño del repositorio | 0,5 GB |
| Número de checkpoints | 5 (2019-09, 2020-01, 2020-08, 2020-09, 2020-12) |

## Arquitectura y entrenamiento

El backbone es un transformer de 12 capas con anchura 384, 6 cabezas de atención y MLP de 1536, que opera sobre parches de 8 muestras y utiliza codificación posicional sinusoidal. El modelo se instancia como LeJEPA: un codificador que se entrena para predecir las representaciones de unas vistas a partir de otras, con el regularizador SIGReg, que empuja las distribuciones de embeddings hacia una gaussiana isotrópica para evitar el colapso representacional. Por cada muestra se generan dos vistas globales y seis locales, todas ellas recortes aleatorios redimensionados del mismo día de cotización de un mismo instrumento (de ahí la denominación «same stock» y «diff. view»). La entrada consta de 9 canales de mercado (`bid_price`, `vwap_all`, `high`, `low`, `ask_price`, `bid_size`, `ask_size`, `volume`, `n`) más 11 canales de información de vista calculados en tiempo de carga (estadísticos de normalización por vista y geometría de la ventana), sumando 20 canales.

Los datos de entrenamiento proceden del dataset `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`, en la carpeta `1Hz_mosaic_mnth/`, con un registro por ticker-día sobre una rejilla de 1 Hz ya rellenada y mezclado dentro de cada mes. El calendario de entrenamiento consiste en 12 pasadas sobre el tramo de seis meses correspondiente, con learning rate base de 6e-05, weight decay de 0,05 y tamaño de lote de 256. Cada checkpoint se entrenó sobre los seis meses inmediatamente anteriores a su mes de evaluación y no vio ese mes de evaluación. Como innovación destacable en el contexto del paper, los 18 codificadores comparten backbone, datos y presupuesto, lo que permite aislar el efecto del objetivo de entrenamiento en las comparaciones. El `config.json` de cada checkpoint almacena el modo de pooling (`mean` en todos los codificadores auto-supervisados); para obtener la lectura del último parche hay que fijar `.pool = "last"` en cada sub-backbone tras la carga.

## Capacidades

- Extracción de características: genera embeddings de ventanas de datos de mercado a 1 Hz, con pooling medio o del último parche.
- Aprendizaje auto-supervisado: no requiere etiquetas para producir representaciones; se entrenó con vistas aumentadas del mismo stock-day.
- Predicción latente en el espacio de embeddings (JEPA), no en el espacio de la señal de entrada.
- Lectura temporal: el embedding del último parche (`pool="last"`) representa el estado en el instante de decisión; la media de parches (`pool="mean"`) resume la ventana completa.
- Análisis latentes: los embeddings están regularizados hacia una gaussiana isotrópica, lo que facilita análisis de estructura en el espacio latente.
- No dispone de soporte de tool calling ni de function calling: no es un modelo de lenguaje.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües: la entrada es numérica y no textual.
- No dispone de modo «thinking», visión ni audio.
- Entrada multimodal únicamente en el sentido de mezclar canales de mercado y canales de información de vista calculados en carga.

## Casos de uso

- Predicción intradía mediante sondas: congelar el encoder y entrenar una cabeza ligera sobre el embedding del último parche (`pool="last"`) para predecir el retorno a horizontes cortos, aprovechando que el modelo nunca vio el mes de evaluación.
- Detección de anomalías y regímenes: usar la distancia de los embeddings a la distribución habitual por ticker para identificar sesiones con microestructura anómala (por ejemplo, episodios de volatilidad extrema o de falta de liquidez).
- Búsqueda por similitud entre ticker-días: indexar los embeddings medios de cada día y recuperar vecinos cercanos para construir análogos históricos de la sesión actual y analizar qué ocurrió después.
- Generación de factores latentes: alimentar modelos de cartera o de scoring con las dimensiones del embedding como factores no lineales, dado que el encoder comprime 20 canales a 1 Hz en 384 dimensiones.
- Representación de estado para aprendizaje por refuerzo: usar el embedding como observación comprimida de un agente de ejecución de órdenes o de market making que opere en sesión regular estadounidense.
- Clustering y análisis exploratorio: agrupar días de cotización o instrumentos en el espacio latente para estudiar regímenes de mercado, rotaciones sectoriales o cambios de microestructura.
- Validación walk-forward reproducible: emplear los cinco checkpoints publicados (2019-09, 2020-01, 2020-08, 2020-09, 2020-12) para construir experimentos sin fuga temporal, ya que cada uno se entrenó solo con los seis meses previos.
- Transferencia a otros instrumentos o mercados: partir del encoder preentrenado y ajustar con datos propios, teniendo en cuenta que el preentrenamiento cubre renta variable estadounidense en sesión regular durante 2019-2020.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card describe la metodología de evaluación (cinco checkpoints con ventanas de entrenamiento disjuntas de los meses de evaluación, y dos modos de lectura: `last` para sondas de predicción y `mean` para análisis latentes) y sitúa a este codificador como uno de los 18 comparados en *Towards Financial World Modeling*, pero no incluye cifras concretas de error de predicción, información mutua ni métricas de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 88 MB en fp32 y 44 MB en fp16. El consumo total depende del tamaño de lote y de la longitud de la ventana procesada, datos que no están documentados; en configuraciones razonables cabe holgadamente por debajo de 1 GB (estimación).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la práctica, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 y H100. Las GPU de gama alta solo aportan ventaja en throughput, no en viabilidad.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna; también es viable la inferencia en CPU y en Apple Silicon.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load` sobre `model.pt`. La model card no documenta exportaciones a TorchScript, ONNX, TensorRT, vLLM, TGI, llama.cpp ni Ollama; estos formatos no están soportados de forma oficial. El código de proyecto (`market_jepa.eval.checkpoints.load_encoder`) todavía no es público.
- Latencia y throughput: no disponibles. El tamaño de ~22 M de parámetros sugiere tiempos de inferencia bajos, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Objetivo de entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tfwm-lejepa-same-stock | ~22 M | 20 canales, 1 Hz, renta variable EE. UU. | LeJEPA con SIGReg, 2 vistas globales y 6 locales del mismo stock-day | no disponible | other — `derived-market-data` | Pesos publicados; código de entrenamiento no público |
| Otros encoders TFWM (17 restantes) | ~22 M (mismo backbone) | Mismos 20 canales y mismos datos | Distintos objetivos auto-supervisados | no disponible | no disponible | Pesos publicados en la colección TFWM |
| TS2Vec (usado como línea base en el paper) | no disponible | Series temporales (adaptado a los mismos datos) | Contraste jerárquico | no disponible | no disponible | Referenciado en la model card; variante con `swa_backbone` |
| TF-C (usado como línea base en el paper) | no disponible | Series temporales (adaptado a los mismos datos) | Contraste tiempo-frecuencia | no disponible | no disponible | Referenciado en la model card; variante con `freq_backbone` |

La comparación directa más informativa es con los otros 17 codificadores de la colección TFWM, ya que comparten backbone, datos y presupuesto de entrenamiento, y solo difieren en el objetivo. No se dispone de cifras comparativas de rendimiento.

## Limitaciones y advertencias

- Estado de prelanzamiento: la model card advierte de que los pesos y el código que los carga son un trabajo en curso y que el contenido y la disposición pueden cambiar sin aviso.
- Código de entrenamiento no público: `market_jepa` y `stable_finance` no se han publicado, por lo que la reproducibilidad del preentrenamiento está limitada.
- Cobertura temporal restringida: los datos cubren de 2019-07 a 2020-12, un periodo que incluye el shock de la COVID-19; el comportamiento fuera de ese régimen no está caracterizado.
- El checkpoint `2019-09/` se entrenó con datos anteriores a los liberados, por lo que no puede reentrenarse a partir del dataset público.
- Dominio estrecho: solo renta variable estadounidense en sesión regular; no se documenta comportamiento en otros mercados, otros husos horarios, derivados ni criptoactivos.
- Licencia restrictiva: la licencia es «other» con nombre `derived-market-data`, lo que implica condiciones específicas derivadas de los datos de mercado; es imprescindible revisar los términos antes de cualquier uso comercial.
- Riesgo de sobreajuste al periodo: al tratarse de un encoder entrenado sobre seis meses por checkpoint, las representaciones pueden capturar particularidades de ese tramo y degradarse en regímenes distintos.
- Riesgo de sesgo de supervivencia y de composición del universo: no se documenta cómo se seleccionaron los tickers incluidos en el dataset.
- Sin datos de benchmarks publicados: no es posible estimar de antemano la calidad del embedding frente a alternativas.
- Sin idiomas ni capacidades generativas: no debe emplearse para tareas de texto, agentes, tool calling ni razonamiento.
- Longitud de contexto y configuraciones de cuantización no documentadas, lo que complica planificar despliegues con ventanas largas.
- La lectura `last` requiere modificar manualmente `.pool` en todos los sub-backbones tras la carga; cargar mediante `from_pretrained` aplica siempre el pooling de `config.json` e ignora el que se pase en una configuración aparte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-lejepa-same-stock
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Carpeta concreta del dataset usada en entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Colección TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Paper *Towards Financial World Modeling* (TFWM): referenciado en la model card; no se proporciona URL en la información disponible.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
