# fin-ai-lab/tfwm-cpc

## Resumen

TFWM encoder — CPC es un extractor de caracteristicas auto-supervisado para series temporales de mercado, publicado por fin-ai-lab como parte de la coleccion TFWM (Towards Financial World Modeling). No es un modelo de lenguaje ni un generador de texto: es un encoder que convierte ventanas de datos de mercado de renta variable estadounidense a 1 Hz en embeddings densos que despues se usan en tareas posteriores (probes de forecasting, analisis latente, agrupacion). El objetivo de entrenamiento es Contrastive Predictive Coding (CPC, van den Oord et al., 2018): un resumen recurrente (GRU) procesa patches pasados y predice los embeddings de patches futuros frente a ejemplos negativos.

El backbone es un transformer de 12 capas, ancho 384, 6 cabezas de atencion, MLP de 1536 y patch de 8, con posiciones sinusoidales, lo que suma aproximadamente 22 millones de parametros. Es uno de los 18 encoders comparados en el trabajo TFWM; todos comparten backbone y regimen de entrenamiento (12 pasadas sobre los mismos tramos de seis meses) y solo difieren en el objetivo de entrenamiento, lo que permite comparaciones controladas entre metodos auto-supervisados.

Su relevancia ahora es metodologica: el repositorio se publica como pre-release para reproducir la comparativa entre objetivos de preentrenamiento sobre datos financieros reales (Market-1T), con checkpoints por mes de evaluacion entrenados siempre sobre los seis meses anteriores y nunca expuestos al mes de test. El codigo de entrenamiento (`market_jepa`, `stable_finance`) todavia no es publico, y los pesos se distribuyen como state dicts planos de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (12 capas, ancho 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales) con objetivo auto-supervisado CPC y resumen mediante GRU |
| Parametros totales | ~22 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (entrada a 1 Hz con patch de 8 muestras; numero maximo de patches por ventana no especificado) |
| Tipos de cuantizacion | No disponible (los pesos se entregan como state dicts de PyTorch en FP32) |
| Idiomas soportados | No aplica / no disponible (modelo de series temporales financieras, no linguistico) |
| Licencia | other (license_name: derived-market-data) |
| Formato de pesos | PyTorch state dict (`model.pt`) + `config.json` (+ `train_meta.json` por checkpoint) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 12 capas con ancho 384, 6 cabezas, MLP de 1536 y patch de 8, con codificacion posicional sinusoidal (~22 M de parametros). Sobre esa columna vertebral, el preentrenamiento CPC anade un resumen recurrente tipo GRU que condensa los patches pasados y se entrena para predecir los embeddings de patches futuros, contrastando las predicciones positivas contra negativos. La entrada son 20 canales: 9 canales de mercado a 1 Hz en sesion regular de renta variable estadounidense (`bid_price, vwap_all, high, low, ask_price, bid_size, ask_size, volume, n`) mas 11 canales de informacion de vista calculados en tiempo de carga (estadisticas de normalizacion por vista y geometria de ventana).

Los datos de entrenamiento proceden de `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense`, particion `1Hz_mosaic_mnth/` (un ticker-dia por registro sobre la rejilla rellena de 1 Hz, mezclado dentro de cada mes). El regimen declarado es de 12 pasadas sobre el tramo de seis meses, learning rate base 0.00015, weight decay 0.05 y batch 2048. Se publican cinco checkpoints, cada uno entrenado sobre los seis meses inmediatamente anteriores a su mes de evaluacion: `2019-09/` (entrenado 2019-03 → 2019-08), `2020-01/` (2019-07 → 2019-12), `2020-08/` (2020-02 → 2020-07), `2020-09/` (2020-03 → 2020-08) y `2020-12/` (2020-06 → 2020-11). El pooling configurado durante el entrenamiento es `mean`; para los probes de forecasting el paper lee el embedding del ultimo patch (`pool="last"`) y para los analisis latentes usa la media de patches (`pool="mean"`).

## Capacidades

- Extraccion de caracteristicas (embeddings) de series temporales de mercado a 1 Hz para renta variable estadounidense en sesion regular.
- Aprendizaje auto-supervisado predictivo (CPC): el encoder se entrena prediciendo embeddings de patches futuros frente a negativos, lo que produce representaciones utiles para tareas posteriores sin etiquetas.
- Soporte de dos modos de lectura de la representacion: `pool="last"` (estado en el instante de decision, usado en probes de forecasting) y `pool="mean"` (media sobre patches, usado en analisis latentes).
- Carga directa como state dict de PyTorch, sin dependencia de frameworks de inferencia de LLM.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision ni audio. Es exclusivamente un modelo de representacion de series temporales.
- No se documentan capacidades de clasificacion, regresion ni prediccion end-to-end: el modelo entrega embeddings y son los probes externos los que realizan la tarea.

## Casos de uso

- Generacion de features para modelos de forecasting financiero: los embeddings del ultimo patch (`pool="last"`) alimentan un probe de prediccion de retorno o volatilidad a corto plazo sobre datos a 1 Hz.
- Analisis latente de regimenes de mercado: la media de patches (`pool="mean"`) se usa para estudiar la estructura del espacio de representaciones y detectar cambios de regimen entre meses de evaluacion.
- Deteccion de anomalias en microestructura: al disponer de canales de libro de ordenes (`bid_size`, `ask_size`, `bid_price`, `ask_price`), los embeddings pueden emplearse para senalar dias o intervalos atipicos frente a la distribucion habitual.
- Agrupacion y similitud de ticker-dias: los embeddings permiten agrupar registros por comportamiento de mercado para estudios de clustering o vecinos mas cercanos.
- Investigacion comparativa de objetivos auto-supervisados: al compartir backbone con los otros 17 encoders de la coleccion TFWM, sirve como referencia controlada para medir el efecto del objetivo CPC frente a otros.
- Transferencia a tareas financieras etiquetadas de bajo volumen: se congela el encoder y se entrena una cabeza ligera sobre pocas etiquetas, aprovechando las representaciones preentrenadas.
- Reproducibilidad de experimentos academicos: los checkpoints por mes y el dataset publico permiten replicar la evaluacion sin fuga temporal, dado que cada checkpoint nunca vio su mes de test.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el trabajo *Towards Financial World Modeling* (TFWM), donde este encoder es uno de los 18 comparados, pero no incluye cifras de MMLU, HumanEval, GSM8K ni metricas equivalentes. Tampoco se aportan resultados numericos de los probes de forecasting o de los analisis latentes.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con ~22 M de parametros, los pesos en FP32 ocupan aproximadamente 88 MB; el estado completo del checkpoint y buffers de activacion caben holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente (por ejemplo, GTX 1650, RTX 3060, RTX 4090). Tambien es viable en CPU.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo e incluso en equipos sin GPU dedicada. El cuello de botella esperado es la E/S de datos a 1 Hz, no el computo.
- Opciones de despliegue: PyTorch nativo cargando `model.pt` con `torch.load`; descarga del checkpoint via `huggingface_hub.snapshot_download`; con el codigo del proyecto (pendiente de publicacion) mediante `market_jepa.eval.checkpoints.load_encoder`. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje. No se documenta exportacion a ONNX, TorchScript ni TensorRT.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tfwm-cpc (este modelo) | ~22 M | No disponible | CPC (contrastive predictive coding) | other / derived-market-data | Pesos publicos (pre-release) |
| TFWM TS2Vec | ~22 M (mismo backbone) | No disponible | Auto-supervisado jerarquico (TS2Vec) | No disponible | En la coleccion TFWM |
| TFWM TF-C | ~22 M (mismo backbone) | No disponible | Contraste tiempo-frecuencia (TF-C) | No disponible | En la coleccion TFWM |
| CPC original (van den Oord et al., 2018) | No disponible | No disponible | CPC sobre audio/habla | No disponible | Paper; otro dominio |

La comparacion mas directa es con los otros encoders de la coleccion TFWM Pre-Trained Encoders, ya que comparten backbone, datos y numero de pasadas, y solo cambian en el objetivo. No se dispone de metricas comparativas publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- Pre-release: los pesos y el codigo que los carga estan en desarrollo y el contenido o la disposicion pueden cambiar sin aviso.
- El codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico, por lo que no es posible reentrenar el modelo a partir del dataset publicado.
- El checkpoint `2019-09/` fue entrenado sobre el tramo 2019-03 → 2019-08, que queda fuera del dataset liberado (Market-1T cubre 2019-07 → 2020-12); ese encoder en concreto no se puede reentrenar con los datos publicos.
- Licencia `other` con `license_name: derived-market-data`: al derivar de datos de mercado, el uso comercial puede estar restringido. Hay que revisar los terminos exactos antes de cualquier despliegue en produccion.
- Dominio muy acotado: solo renta variable estadounidense en sesion regular a 1 Hz. No cubre otros mercados, frecuencias ni clases de activo.
- Riesgo de sobreajuste al periodo 2019-2020: todos los checkpoints se entrenan sobre tramos de seis meses dentro de esa ventana, un periodo con condiciones de mercado particulares.
- No se han publicado cifras de benchmarks ni de rendimiento predictivo, por lo que no hay evidencia cuantitativa de calidad fuera del propio paper.
- Al ser un extractor de caracteristicas, no genera texto ni responde a instrucciones; cualquier tarea final requiere un probe o cabeza externa.
- No hay informacion sobre sesgos de representacion ni sobre el tratamiento de valores ausentes mas alla del relleno a 1 Hz descrito en el dataset.
- Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre este modelo (corresponden a definiciones del termino frances "fin").

## Enlaces

- HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-cpc
- Coleccion TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Particion usada en entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Paper de referencia del objetivo CPC: van den Oord et al., 2018 (no se proporciona enlace directo en la informacion disponible)
- Paper TFWM (*Towards Financial World Modeling*): referenciado en la model card, sin enlace disponible
