# fin-ai-lab/tfwm-dino

## Resumen

TFWM encoder — DINO es un codificador auto-supervisado para series temporales de datos de mercado de renta variable estadounidense, publicado por fin-ai-lab. Forma parte de la familia de 18 codificadores comparados en el trabajo *Towards Financial World Modeling* (TFWM); todos comparten la misma columna vertebral (un transformer de 12 capas, anchura 384, 6 cabezas y MLP de 1536, con unos 22 millones de parametros) y se diferencian unicamente en el objetivo de entrenamiento. En este caso el objetivo es destilacion auto-supervisada DINO (Caron et al., 2021), donde el par positivo son dos deformaciones temporales (time warps) de una misma ventana.

El modelo no genera texto ni razona en lenguaje natural: es un extractor de caracteristicas (`pipeline_tag: feature-extraction`) que convierte ventanas de datos de mercado a 1 Hz en representaciones latentes. El interes practico esta en usarlo como base congelada para sondas de prediccion (forecasting probes) y analisis latentes sobre datos financieros de alta frecuencia, evitando entrenar desde cero sobre series de mercado.

El repositorio se distribuye como pre-release: los pesos y el codigo de carga son trabajo en curso y el codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico todavia. Incluye cinco checkpoints, uno por mes de evaluacion, cada uno entrenado sobre los seis meses inmediatamente anteriores y sin haber visto nunca el mes de evaluacion. La licencia es `other` con nombre `derived-market-data`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (12 capas, anchura 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales) con destilacion auto-supervisada DINO |
| Parametros totales | ~22 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada numerica de mercado, no texto) |
| Licencia | `other`, con `license_name: derived-market-data` |
| Formato de pesos | PyTorch state dict (`model.pt` con `student`, `ema`, `center`) mas `config.json` y `train_meta.json` |

## Arquitectura y entrenamiento

La columna vertebral es un transformer de 12 capas con anchura 384, 6 cabezas de atencion, MLP de 1536 y posiciones sinusoidales, que opera sobre parches de 8 pasos temporales. La entrada son datos de renta variable estadounidense en sesion regular a 1 Hz: 9 canales de mercado (`bid_price`, `vwap_all`, `high`, `low`, `ask_price`, `bid_size`, `ask_size`, `volume`, `n`) mas 11 canales de informacion de vista calculados en tiempo de carga (estadisticas de normalizacion por vista y geometria de la ventana), para un total de 20 canales. El pooling configurado en entrenamiento y en `config.json` es la media (`mean`).

El objetivo de entrenamiento es destilacion auto-supervisada DINO: el par positivo lo forman dos time warps de una misma ventana, la misma vista que usa LeJEPA Time Warping. El calendario de entrenamiento son 12 pasadas sobre un tramo de seis meses, con learning rate base 0,0005, weight decay 0,05 y batch de 128. Los datos provienen de `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`, en concreto del directorio `1Hz_mosaic_mnth/`, con un registro ticker-dia sobre la rejilla rellena de 1 Hz y mezclado dentro de cada mes.

Cada checkpoint se guarda por separado para un mes de evaluacion concreto. El checkpoint `2019-09` se entreno sobre 2019-03 → 2019-08, un tramo que queda fuera del dataset publicado (que cubre 2019-07 → 2020-12), por lo que ese codificador no se puede reentrenar a partir de los datos liberados. Los demas (`2020-01`, `2020-08`, `2020-09`, `2020-12`) se entrenaron sobre 2019-07 → 2019-12, 2020-02 → 2020-07, 2020-03 → 2020-08 y 2020-06 → 2020-11 respectivamente.

## Capacidades

- Extraccion de caracteristicas sobre series temporales financieras a 1 Hz: convierte ventanas de datos de mercado en embeddings.
- Soporte de dos modos de lectura: `pool="mean"` (media sobre parches, usado en analisis latentes) y `pool="last"` (embedding del ultimo parche, es decir el estado en el momento de decision, usado en sondas de prediccion).
- Entrada multimodal numerica: 9 canales de mercado mas 11 canales de informacion de vista calculados en carga.
- Uso como encoder congelado para sondas de forecasting y experimentos de representacion.
- Carga directa como state dict de PyTorch (`student`, `ema`, `center`) sin necesidad del codigo del proyecto.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente.
- No hay soporte multilingue declarado, porque la entrada no es texto.

## Casos de uso

- Investigacion en representaciones financieras: usar los embeddings `pool="last"` como entrada de una sonda de prediccion (forecasting probe) para medir la capacidad predictiva del encoder sobre el mes de evaluacion correspondiente.
- Analisis latente de regimenes de mercado: con `pool="mean"` se pueden comparar representaciones medias de ventanas para estudiar similitudes entre periodos, tickers o franjas horarias.
- Benchmarking de objetivos auto-supervisados: al compartir columna vertebral con los otros 17 encoders de la coleccion TFWM, permite aislar el efecto del objetivo de entrenamiento manteniendo fijos backbone, datos y numero de pasadas.
- Clasificacion o deteccion de anomalias en microestructura: el embedding del ultimo parche sirve como caracteristica compacta para modelos ligeros de deteccion de comportamiento anomalo en la sesion regular.
- Preentrenamiento de pipelines cuantitativos: el encoder puede actuar como extractor congelado delante de un modelo predictivo propio, reduciendo la necesidad de entrenar sobre datos de mercado desde cero.
- Reproducibilidad de experimentos: los checkpoints incluyen `train_meta.json` con la configuracion resuelta, el tramo de entrenamiento y los ajustes de normalizacion de vistas, lo que facilita replicar la evaluacion.
- Prototipado en investigacion academica: con unos 22 millones de parametros, el coste de inferencia es bajo y permite iterar rapido en un unico equipo con GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que este encoder es uno de los 18 comparados en *Towards Financial World Modeling* (TFWM), pero no incluye cifras de rendimiento, ni metricas de forecasting, ni comparaciones numericas con los otros encoders de la coleccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con unos 22 millones de parametros, el peso en fp32 ocupa aproximadamente 88 MB y en fp16 unos 44 MB, mas el coste de activaciones, que depende de la longitud de la ventana de entrada. Cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas tipo RTX 3060, RTX 4090, A100 o H100 quedan muy por encima del requisito real del modelo.
- GPU de consumo: si cabe, y de sobra, en toda la gama consumer reciente, dada la escala del backbone.
- Opciones de despliegue: PyTorch nativo, cargando `model.pt` como state dict con `torch.load(..., map_location="cpu", weights_only=True)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni formatos GGUF, ONNX o TensorRT.
- Latencia y throughput: no disponible.
- Nota de almacenamiento: el repositorio ocupa 1,2 GB porque contiene cinco checkpoints, cada uno con tres conjuntos de pesos (`student`, `ema`, `center`), no porque el modelo en si sea grande.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tfwm-dino (este modelo) | ~22 M | no disponible | DINO self-distillation con time warping | `derived-market-data` | Pesos publicos, codigo de carga pendiente |
| Otros encoders TFWM (TS2Vec, TF-C y hasta 18 en total) | Misma columna vertebral (~22 M) | no disponible | Varía por encoder (por ejemplo TS2Vec usa `swa_backbone` y TF-C usa `freq_backbone`) | No disponible en la informacion proporcionada | Coleccion TFWM Pre-Trained Encoders en HuggingFace |
| LeJEPA Time Warping | no disponible | no disponible | Time warping (misma vista positiva que DINO en este trabajo) | no disponible | no disponible |

Los 18 encoders de la coleccion TFWM comparten backbone y se entrenan con 12 pasadas sobre los mismos tramos de seis meses, por lo que la comparacion relevante entre ellos es la del objetivo de entrenamiento, no la de tamano o contexto.

## Limitaciones y advertencias

- Estado de pre-release: los pesos y el codigo que los carga son trabajo en curso y su contenido y estructura pueden cambiar sin aviso.
- El codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico todavia, por lo que no se puede reentrenar el modelo con el material liberado.
- El checkpoint `2019-09` se entreno sobre 2019-03 → 2019-08, un tramo fuera del dataset publicado `Market-1T-1Hz-2019H2-2020-dense` (que cubre 2019-07 → 2020-12), de modo que ese encoder no es reproducible a partir de los datos liberados.
- Licencia restrictiva: `other` con nombre `derived-market-data`, derivada de datos de mercado. Hay que revisar los terminos antes de cualquier uso comercial o redistribucion.
- Cobertura limitada a renta variable estadounidense en sesion regular y a una rejilla de 1 Hz; no se declara soporte para otros mercados, otros activos ni otras frecuencias.
- Cada checkpoint esta atado a un mes de evaluacion concreto y a un tramo de entrenamiento fijo, lo que limita su uso fuera de ese esquema temporal.
- No hay datos publicados de benchmarks, asi que no se puede estimar su calidad predictiva a partir de la informacion disponible.
- Al ser un extractor de caracteristicas y no un modelo generativo, no plantea riesgo de alucinacion en el sentido habitual; los riesgos se trasladan al modelo que consuma sus embeddings.
- Sesgos conocidos: no disponible. La model card no documenta analisis de sesgo ni de cobertura por ticker, sector o capitalizacion.
- No se declaran tipos de cuantizacion ni formatos de despliegue optimizados, lo que limita las opciones de servido en produccion fuera de PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-dino
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Directorio de datos usado: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Coleccion TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Paper de referencia de DINO: Caron et al., 2021 (referenciado en la model card, sin enlace directo disponible)
- Paper *Towards Financial World Modeling* (TFWM): mencionado en la model card, sin enlace disponible en la informacion proporcionada
- Repositorios de codigo `market_jepa` y `stable_finance`: anunciados como futuros, sin enlace disponible
