# fin-ai-lab/tfwm-supervised-multihead

## Resumen

TFWM encoder — Supervised (multihead) es un codificador de representaciones para series temporales financieras desarrollado por fin-ai-lab, publicado en Hugging Face como parte de la colección TFWM Pre-Trained Encoders. Se trata de un transformer de aproximadamente 22 millones de parámetros que consume datos de renta variable estadounidense a 1 Hz durante la sesión regular (9 canales de mercado más 11 canales de información de vista, 20 en total) y produce embeddings por patch, orientados a extracción de características más que a generación de texto. Su particularidad es que comparte un único backbone con tres cabezales supervisados entrenados de forma conjunta: retorno, cambio de volatilidad y cambio de spread, todos con horizonte de 900 segundos y balanceo por norma de gradiente.

El modelo es uno de los 18 codificadores comparados en el trabajo *Towards Financial World Modeling* (TFWM). Los 18 comparten la misma arquitectura de backbone y se entrenan con 12 pasadas sobre los mismos tramos de seis meses, de modo que las diferencias entre ellos se deben fundamentalmente al objetivo de entrenamiento. Esto convierte a esta ficha en una pieza de un banco de pruebas controlado: sirve para aislar el efecto de una tarea supervisada multiobjetivo frente a alternativas auto-supervisadas (estilo JEPA) o frente a baselines como TS2Vec y TF-C.

Es relevante ahora porque propone un protocolo de evaluación walk-forward poco habitual: se publica un checkpoint por mes de evaluación, cada uno entrenado exclusivamente con los seis meses inmediatamente anteriores, de forma que el modelo nunca vio el mes sobre el que se evalúa. La contrapartida es que se trata de una pre-release: el código de entrenamiento (`market_jepa`, `stable_finance`) no es público todavía, los pesos son state dicts de PyTorch sin `config.json` y no se han publicado resultados numéricos de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder: 12 capas, anchura 384, 6 cabezas de atención, MLP 1536, patch de 8, posiciones sinusoidales |
| Parámetros totales | ~22 millones (solo backbone; los cabezales añaden parámetros no cuantificados en la información disponible) |
| Parámetros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible (la entrada es a 1 Hz con patch de 8; el paper no publica la longitud de secuencia configurada) |
| Tipos de cuantización | no disponible (los pesos se distribuyen como state dicts de PyTorch en precisión nativa) |
| Idiomas soportados | no aplica (modelo numérico sobre series temporales; no procesa texto) |
| Licencia | `derived-market-data` (etiquetada como `license: other`) |
| Formato de pesos | PyTorch state dict: `backbone.pt` + `heads.pt` por checkpoint |
| Canales de entrada | 20 (9 de mercado: `bid_price`, `vwap_all`, `high`, `low`, `ask_price`, `bid_size`, `ask_size`, `volume`, `n`; más 11 canales de información de vista) |
| Pooling de entrenamiento | `last` |
| Pipeline declarado | feature-extraction |
| Tamaño del repositorio | 0,5 GB |
| Número de checkpoints | 5 (`2019-09`, `2020-01`, `2020-08`, `2020-09`, `2020-12`) |
| Dataset de entrenamiento | `fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore` (`1Hz_daystore/`) |
| Fecha de creación / actualización | 2026-09-27 / 2026-09-27 |

## Arquitectura y entrenamiento

El backbone es un transformer encoder de 12 capas con anchura 384, 6 cabezas de atención, MLP de dimensión 1536, patchificación de tamaño 8 y codificación posicional sinusoidal. Sobre ese tronco compartido se montan tres cabezales supervisados que predicen, a un horizonte de 900 segundos, el retorno, el cambio de volatilidad y el cambio de spread. El entrenamiento es conjunto, con balanceo por norma de gradiente para evitar que una de las tres tareas domine la actualización de los pesos compartidos. Fuera de ese detalle, la configuración es idéntica a la de los codificadores supervisados de tarea única de la misma colección.

La entrada son datos de renta variable estadounidense a 1 Hz durante la sesión regular: 9 canales de mercado más 11 canales de información de vista calculados en tiempo de carga (estadísticas de normalización por vista y geometría de ventana), lo que suma 20 canales. El dataset de entrenamiento está organizado «day-major»: un día de negociación por registro, con todos los tickers y los objetivos precalculados, de forma que cada celda de entrenamiento es una sección cruzada del mismo día. El calendario de entrenamiento consiste en 12 pasadas sobre el tramo de seis meses correspondiente, con LR base 0,0002, weight decay 0,05 y batch efectivo de 256.

El diseño experimental es lo más destacable: hay un checkpoint por mes de evaluación, cada uno entrenado sobre los seis meses inmediatamente anteriores y evaluado sobre un mes que nunca vio. El caso de `2019-09/` es especial, porque su tramo de entrenamiento (2019-03 → 2019-08) queda fuera de los datos publicados (Market-1T cubre 2019-07 → 2020-12), de modo que ese encoder no se puede reentrenar a partir del dataset liberado. Cada carpeta incluye `backbone.pt` y `heads.pt`, más `train_meta.json` (configuración resuelta, tramo de entrenamiento y ajustes de normalización de vista) y `xs_ic.json` con el IC transversal del cabezal en el mes de evaluación.

## Capacidades

- Extracción de embeddings sobre series temporales de mercado a 1 Hz, con dos modos de lectura: `pool="last"` (estado en el instante de decisión, usado en las sondas de forecasting) y `pool="mean"` (media sobre patches, usado en los análisis latentes).
- Predicción multiobjetivo a 900 segundos mediante tres cabezales: retorno, cambio de volatilidad y cambio de spread.
- Representación de secciones cruzadas intradía: al estar el dataset organizado por día, cada celda de entrenamiento agrupa todos los tickers de una misma sesión, lo que permite explotar estructura transversal entre activos.
- Uso como extractor de características congelado para alimentar modelos posteriores (probes lineales, modelos de riesgo, clustering de regímenes).
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni uso como agente.
- No tiene capacidades multilingües ni de visión, audio o modalidades distintas de series numéricas de mercado.
- No dispone de modo «thinking» ni de decodificación especulativa; no es un modelo generativo autorregresivo de lenguaje.

## Casos de uso

- Investigación cuantitativa con sondas de forecasting: cargar un checkpoint, extraer el embedding del último patch (`pool="last"`) y entrenar una sonda lineal o no lineal para predecir retorno, volatilidad o spread a 900 s. Es exactamente el protocolo que reporta el paper, lo que permite reproducir sus cifras de IC transversal.
- Análisis de estados latentes de mercado: con `pool="mean"` se obtiene una representación agregada de la ventana que puede alimentar clustering no supervisado o análisis de vecinos más cercanos para estudiar regímenes de microestructura.
- Backtesting walk-forward sin look-ahead: al existir un checkpoint por mes de evaluación, se puede encadenar la evaluación mes a mes usando siempre el modelo entrenado con los seis meses previos, replicando una condición realista de producción.
- Detección de anomalías en microestructura: los canales de tamaños de bid/ask, volumen y spread alimentan directamente los cabezales de cambio de spread y volatilidad, lo que permite construir puntuaciones de anomalía cuando el modelo se desvía del comportamiento esperado.
- Generación de features para modelos downstream: los embeddings por patch (anchura 384) se pueden congelar y concatenar como variables de entrada de modelos de riesgo, modelos de ejecución o sistemas de asignación de cartera.
- Benchmarking metodológico: comparar este encoder supervisado multi-cabezal contra los otros 17 de la colección (incluidos los baselines TS2Vec y TF-C) bajo el mismo backbone y el mismo número de pasadas, aislando el efecto del objetivo de entrenamiento.
- Estudio de los canales de información de vista: al documentarse explícitamente los 11 canales derivados de la normalización y la geometría de ventana, el modelo sirve para analizar cuánta señal aporta esa información auxiliar frente a los 9 canales de mercado puros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Lo único que la model card menciona es la existencia de un fichero `xs_ic.json` por checkpoint con el IC transversal del cabezal en el mes de evaluación, pero no se incluyen sus valores. Tampoco se publican métricas agregadas del paper *Towards Financial World Modeling* ni comparaciones numéricas frente a los otros 17 encoders de la colección.

## Requisitos de hardware

- El backbone tiene ~22 millones de parámetros: en FP32 los pesos ocupan del orden de 88 MB y en FP16 unos 44 MB (estimación a partir del recuento de parámetros; no incluye los cabezales, cuyo tamaño no se detalla).
- En consecuencia, el modelo cabe con holgura en cualquier GPU de consumo, incluidas RTX 3060, RTX 4060 o superiores, e incluso en CPU para inferencia por lotes pequeños. El cuello de botella es la memoria de activaciones, que escala con la longitud de secuencia, no el tamaño de los pesos.
- No se publican cifras de VRAM, latencia ni throughput para configuraciones concretas; estos valores dependen de la longitud de ventana y del tamaño de lote elegidos.
- Despliegue: el formato es un state dict plano de PyTorch (`torch.load(..., weights_only=True)`), por lo que no hay soporte oficial en vLLM, llama.cpp, Ollama, TGI ni herramientas equivalentes orientadas a LLM generativos. La vía prevista es el código del proyecto (`market_jepa.eval.checkpoints.load_encoder`), todavía no publicado, o bien cargar los tensores manualmente.
- GPU de datacenter (A100, H100) solo tendrían sentido para reentrenamiento o para evaluación masiva en paralelo, no por requisitos de memoria.
- Nota operativa: los checkpoints supervisados no incluyen `config.json`, así que el pooling no se lee automáticamente al cargar y hay que fijar `.pool` explícitamente en cada sub-backbone.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TFWM supervised multihead (este modelo) | ~22 M (backbone) | no disponible | Supervisado multi-cabezal: retorno, volatilidad y spread a 900 s | `derived-market-data` | Pesos publicados; código de entrenamiento pendiente |
| TFWM supervised single-task | ~22 M (mismo backbone) | no disponible | Supervisado de tarea única | `derived-market-data` | En la misma colección de HF |
| TFWM JEPA (auto-supervisado) | ~22 M (mismo backbone) | no disponible | Auto-supervisado estilo JEPA | `derived-market-data` | En la misma colección de HF |
| TS2Vec (baseline dentro de TFWM) | no disponible | no disponible | Contrastivo temporal; usa `swa_backbone` | no disponible | Incluido en la comparativa del paper |
| TF-C (baseline dentro de TFWM) | no disponible | no disponible | Coherencia tiempo-frecuencia; usa `freq_backbone` | no disponible | Incluido en la comparativa del paper |

Los 18 encoders de la colección comparten backbone, datos de entrenamiento y número de pasadas (12 sobre tramos de seis meses), por lo que la comparación entre ellos es metodológicamente limpia. Las diferencias de rendimiento entre filas no se pueden cuantificar con la información disponible.

## Limitaciones y advertencias

- Pre-release explícita: los pesos y el código que los carga son trabajo en curso, y el contenido y la disposición del repositorio pueden cambiar sin aviso.
- El código de entrenamiento (`market_jepa`, `stable_finance`) no es público, de modo que el modelo no se puede reentrenar ni auditar por completo a partir de lo liberado.
- Los checkpoints supervisados no incluyen `config.json`; cualquier configuración de pooling pasada por fichero se ignora y hay que fijarla manualmente en cada sub-backbone.
- Un checkpoint por mes: son modelos especializados en un régimen de mercado concreto, entrenados sobre seis meses de datos. No hay garantía de generalización a otros periodos, a otros mercados ni a otras clases de activo.
- Ámbito restringido a renta variable estadounidense en sesión regular y a resolución de 1 Hz. No admite otras frecuencias, mercados ni modalidades.
- El checkpoint `2019-09/` se entrenó con datos (2019-03 → 2019-08) parcialmente fuera del dataset publicado, por lo que no es reproducible desde el repositorio.
- La licencia `derived-market-data` es una licencia «other» derivada de datos de mercado: hay que revisar sus términos antes de cualquier uso comercial, y es probable que imponga restricciones de redistribución.
- Riesgo de sobreajuste a microestructura histórica: al predecir cambios de spread y volatilidad, el modelo puede degradarse si las condiciones de liquidez cambian respecto al periodo de entrenamiento.
- Es un modelo de extracción de características, no un generador: no produce texto, no razona de forma multi-paso y no soporta tool calling, por lo que no debe evaluarse con benchmarks de lenguaje (MMLU, HumanEval, GSM8K).
- El repositorio tiene 0 descargas y 0 «likes», sin validación externa conocida ni resultados de terceros.
- No se documentan sesgos, cobertura de tickers ni criterios de filtrado del dataset; tampoco se detalla el tratamiento de huecos, subastas o halt trading.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fin-ai-lab/tfwm-supervised-multihead
- Colección TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore
- Directorio `1Hz_daystore/` del dataset: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore/tree/main/1Hz_daystore
- Paper *Towards Financial World Modeling* (TFWM): no disponible (referenciado en la model card sin enlace)
- Repositorio de código `market_jepa`: no disponible (anunciado como próxima publicación)
- Repositorio de código `stable_finance`: no disponible
