# fin-ai-lab/tfwm-lejepa-cross-stock

## Resumen

TFWM encoder — LeJEPA Cross Stock es un codificador (encoder) de series temporales financieras desarrollado por fin-ai-lab, publicado como parte del estudio *Towards Financial World Modeling* (TFWM). Se trata de un transformer de aproximadamente 22 millones de parametros entrenado con un objetivo de aprendizaje autosupervisado de tipo JEPA (joint-embedding predictive architecture) sobre datos de mercado de renta variable estadounidense a 1 Hz. El modelo no genera texto ni predicciones directas: su funcion es producir embeddings (feature extraction) de ventanas de datos de mercado, que despues se utilizan con sondas (probes) de prevision o analisis latente.

La innovacion principal es el uso del objetivo LeJEPA, que combina la arquitectura JEPA con el regularizador SIGReg de tipo gaussiano isotropico, y emplea dos vistas globales y seis vistas locales por muestra. Las vistas se construyen a partir de dos acciones distintas en el mismo instante del mismo dia, de ahi el nombre "cross-stock". Esto fuerza al modelo a aprender representaciones que capturan estructura comun entre activos, en lugar de memorizar el comportamiento de un unico ticker.

El repositorio es una publicacion preliminar (pre-release): el codigo de entrenamiento (`market_jepa`, `stable_finance`) aun no es publico y los pesos pueden cambiar sin aviso. El modelo forma parte de una coleccion de 18 codificadores que comparten backbone y regimen de entrenamiento (12 pasadas sobre los mismos periodos de seis meses), diferenciandose unicamente en el objetivo de entrenamiento, lo que lo convierte en una pieza de un benchmark controlado mas que en un producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder, 12 capas, ancho 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales |
| Parametros totales | ~22 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la entrada se organiza en parches de tamano 8 sobre una rejilla de 1 Hz) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica: procesa series temporales de datos de mercado, no texto. No se declara soporte de idiomas |
| Licencia | `other` / `derived-market-data` (datos de mercado derivados) |
| Formato de pesos | PyTorch state dict (`model.pt`); no se usa safetensors. Cada checkpoint incluye `config.json`, `model.pt` y `train_meta.json` |

## Arquitectura y entrenamiento

El backbone es un transformer de 12 capas con ancho 384, 6 cabezas de atencion, MLP de 1536 y posiciones sinusoidales, con un total aproximado de 22 millones de parametros. La entrada son datos de renta variable estadounidense en sesion regular a 1 Hz, con 9 canales de mercado (`bid_price`, `vwap_all`, `high`, `low`, `ask_price`, `bid_size`, `ask_size`, `volume`, `n`) mas 11 canales de informacion de vista calculados en tiempo de carga (estadisticas de normalizacion por vista y geometria de ventana), lo que da 20 canales en total. La serializacion se hace por parches de tamano 8.

El entrenamiento usa el objetivo LeJEPA: una arquitectura de prediccion de embeddings conjuntos con el regularizador SIGReg de tipo gaussiano isotropico, con dos vistas globales y seis vistas locales por muestra. Las vistas cruzadas se obtienen de dos acciones diferentes en el mismo instante del mismo dia. El regimen es de 12 pasadas sobre cada periodo de seis meses, con learning rate base 6e-05, weight decay 0.05 y batch de 256. El pooling configurado y usado en entrenamiento es `mean`. Los datos provienen del dataset `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense` (directorio `1Hz_mosaic_mnth/`), con un registro por ticker-dia sobre la rejilla rellenada de 1 Hz y mezclado dentro de cada mes.

Una particularidad relevante es la separacion entre entrenamiento y evaluacion: se publica un checkpoint por mes de evaluacion, cada uno entrenado sobre los seis meses inmediatamente anteriores y sin haber visto nunca el mes de evaluacion. Esto configura un esquema walk-forward. El checkpoint `2019-09/` se entreno sobre 2019-03 a 2019-08, un tramo que queda fuera de los datos liberados (Market-1T cubre 2019-07 a 2020-12), por lo que ese encoder no puede reentrenarse a partir del dataset publico.

## Capacidades

- Extraccion de caracteristicas (feature extraction): genera embeddings a partir de ventanas de datos de mercado a 1 Hz para acciones estadounidenses.
- Aprendizaje de representaciones cross-stock: las vistas cruzadas entre dos acciones del mismo instante permiten representaciones compartidas entre activos.
- Dos modos de lectura del embedding: `pool="last"` (embedding del ultimo parche, usado en sondas de prevision como estado en el momento de decision) y `pool="mean"` (media sobre parches, usada en analisis latente).
- Soporte de sondas de prevision (forecasting probes) aguas abajo mediante el embedding del ultimo parche.
- Analisis latente para estudiar la estructura interna de las representaciones financieras.
- No es un modelo generativo de texto: no soporta generacion de lenguaje, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se declaran capacidades multilingues (no aplica al dominio de series temporales).

## Casos de uso

- Extraccion de caracteristicas para modelos de prevision financiera: el embedding del ultimo parche (`pool="last"`) actua como estado en el momento de decision y puede alimentar una sonda supervisada de prediccion de retornos o volatilidad, aprovechando que el encoder ya ha absorbido estructura de microestructura de mercado.
- Investigacion academica sobre representaciones latentes: el modo `pool="mean"` permite analizar que informacion codifica el espacio latente y comparar objetivos de entrenamiento dentro del benchmark TFWM.
- Clustering y agrupacion de activos: al entrenarse con vistas cruzadas entre acciones, los embeddings pueden usarse para agrupar tickers con comportamiento microestructural similar en un mismo intervalo.
- Backtesting walk-forward de senales: los cinco checkpoints publicados (2019-09, 2020-01, 2020-08, 2020-09, 2020-12) permiten evaluar estrategias sin fuga de informacion, ya que cada uno solo vio los seis meses previos a su mes de evaluacion.
- Construccion de pipelines de research reproducibles: el dataset de entrenamiento esta publicado en Hugging Face y los checkpoints son state dicts estandar de PyTorch, lo que facilita reproducir o auditar experimentos.
- Estudio comparativo de objetivos autosupervisados: al formar parte de una coleccion de 18 encoders con el mismo backbone y regimen de entrenamiento, sirve para aislar el efecto del objetivo LeJEPA frente a otras alternativas.
- Seleccion de caracteristicas para modelos tabulares o de gradient boosting en finanzas: los embeddings pueden concatenarse como variables de entrada en modelos clasicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el estudio *Towards Financial World Modeling* (TFWM), en el que este encoder es uno de los 18 comparados, pero no se incluyen tablas de resultados ni metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con ~22 millones de parametros, un checkpoint en FP32 ocupa del orden de 88 MB de pesos, mas activaciones; el uso total de memoria es inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna es suficiente. El modelo es tan pequeno que no requiere A100, H100 ni siquiera una RTX 4090; una GPU de gama media o integrada resulta adecuada.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer, e incluso puede ejecutarse en CPU para inferencia.
- Opciones de despliegue: carga nativa con PyTorch (state dict) y, con el codigo del proyecto (aun no publicado), mediante `market_jepa.eval.checkpoints.load_encoder`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio completo ocupa 0.5 GB, repartidos entre los cinco checkpoints; se pueden descargar selectivamente por mes con `allow_patterns`.

## Comparativa con modelos similares

El propio autor situa este encoder dentro de una coleccion de 18 codificadores preentrenados que comparten backbone y regimen de entrenamiento, por lo que la comparacion natural es contra esa coleccion. Se mencionan explicitamente TS2Vec (con `swa_backbone`) y TF-C (con `freq_backbone`) como otros encoders del mismo estudio, aunque no se proporcionan sus especificaciones en la informacion disponible.

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tfwm-lejepa-cross-stock | ~22M | No disponible | LeJEPA (JEPA + SIGReg), vistas cross-stock | other / derived-market-data | Pesos publicos, codigo pendiente |
| Encoders TFWM (otros 17) | Comparten backbone (~22M) | No disponible | Distintos objetivos autosupervisados | No disponible | Coleccion TFWM |
| TS2Vec (referenciado) | No disponible | No disponible | No disponible | No disponible | Referenciado en el estudio |
| TF-C (referenciado) | No disponible | No disponible | No disponible | No disponible | Referenciado en el estudio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Estado pre-release: los pesos y el codigo de carga son un trabajo en curso y su contenido y estructura pueden cambiar sin aviso.
- Codigo de entrenamiento no publico: los modulos `market_jepa` y `stable_finance` no estan disponibles, lo que limita la reproducibilidad completa del entrenamiento.
- Dominio muy restringido: solo renta variable estadounidense en sesion regular a 1 Hz; no cubre otros mercados, otros activos ni otras frecuencias.
- Cobertura temporal limitada: los datos subyacentes cubren 2019-07 a 2020-12, un periodo con condiciones de mercado muy especificas (incluida la volatilidad de 2020).
- Checkpoint no reproducible: el de `2019-09/` se entreno sobre un tramo (2019-03 a 2019-08) fuera del dataset liberado, por lo que no puede reentrenarse a partir de los datos publicos.
- Riesgo de extrapolacion: al ser un encoder autosupervisado sin cabecera de prediccion, cualquier uso predictivo depende de la sonda que se anada encima y de su propia validacion; el modelo por si solo no produce senales de trading.
- Licencia restrictiva: la licencia `derived-market-data` (categoria `other`) impone condiciones derivadas de los datos de mercado; es imprescindible revisar los terminos antes de cualquier uso comercial.
- Sin datos de benchmarks publicados: no hay metricas que permitan estimar la calidad de las representaciones frente a alternativas.
- Convencion de pooling delicada: cargar un checkpoint con `from_pretrained` usa el pool guardado en `config.json` (`mean`) e ignora el pool pasado por configuracion; para obtener el ultimo parche hay que fijar `.pool = "last"` en cada sub-backbone despues de cargar, lo que es una fuente potencial de errores.
- Idiomas: no aplica, ya que no es un modelo de lenguaje; no se declara ningun soporte linguistico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fin-ai-lab/tfwm-lejepa-cross-stock
- Coleccion TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Directorio de datos usado (`1Hz_mosaic_mnth/`): https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Paper *Towards Financial World Modeling* (TFWM): no disponible (referenciado en la model card sin enlace)
- Repositorio de codigo (`market_jepa`): no disponible (publicacion pendiente)
