# fin-ai-lab/tfwm-timemae

## Resumen

TFWM encoder — TimeMAE es un codificador (encoder) de series temporales financieras desarrollado por fin-ai-lab, publicado como parte del proyecto *Towards Financial World Modeling* (TFWM). No es un modelo de lenguaje: se trata de un extractor de características que convierte datos de mercado de renta variable estadounidense a 1 Hz en representaciones latentes reutilizables por modelos posteriores de pronóstico o análisis.

El modelo emplea un backbone Transformer de unos 22 millones de parametros (12 capas, ancho 384, 6 cabezas de atencion, MLP de 1536, patch de 8 y posiciones sinusoidales) y se entrena de forma auto-supervisada con el objetivo TimeMAE de Cheng et al., que combina reconstruccion de parches enmascarados con alineamiento de representaciones, enmascarando el 60 % de los parches.

Es relevante porque forma parte de una comparativa controlada de 18 encoders que comparten exactamente el mismo backbone y el mismo regimen de entrenamiento (12 pasadas sobre los mismos tramos de seis meses), de modo que las diferencias de comportamiento se atribuyen principalmente al objetivo de entrenamiento. El repositorio esta marcado como *pre-release* y el codigo de entrenamiento (`market_jepa`, `stable_finance`) todavia no es publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder: 12 capas, ancho 384, 6 cabezas, MLP 1536, patch 8, posiciones sinusoidales |
| Parametros totales | ~22 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como state dict de PyTorch, presumiblemente en fp32) |
| Idiomas soportados | no aplica / no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | other (`derived-market-data`) |
| Formato de pesos | PyTorch state dict (`model.pt`) + `config.json` + `train_meta.json` |

Canales de entrada (20 en total):

| Grupo | Canales |
|---|---|
| Mercado (9) | `bid_price, vwap_all, high, low, ask_price, bid_size, ask_size, volume, n` |
| Informacion de vista (11) | Estadisticos de normalizacion por vista y geometria de ventana, calculados en tiempo de carga |

## Arquitectura y entrenamiento

El backbone es un Transformer encoder estandar con patch embedding de tamano 8 sobre la rejilla regular de 1 Hz y codificacion posicional sinusoidal. La entrada combina 9 canales de mercado de renta variable estadounidense en sesion regular con 11 canales de informacion de vista generados al cargar los datos (estadisticos de normalizacion por vista y geometria de ventana), lo que suma 20 canales.

El preentrenamiento es auto-supervisado con el objetivo TimeMAE: reconstruccion de parches enmascarados y alineamiento de representaciones, con un 60 % de parches enmascarados. Los datos provienen del dataset `fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense` (carpeta `1Hz_mosaic_mnth/`, un ticker-dia por registro sobre la rejilla rellena de 1 Hz, mezclado dentro de cada mes). El regimen es de 12 pasadas sobre el tramo de seis meses, con LR base 0,001, weight decay 0,05 y batch 128. El pooling usado en `config` y en entrenamiento es `mean`. El paper lee cada encoder de dos formas: sondas de pronostico con el embedding del ultimo parche (`pool="last"`) y analisis latentes con la media de parches (`pool="mean"`).

Se publica un checkpoint por mes de evaluacion, cada uno entrenado con los seis meses inmediatamente anteriores y sin ver nunca el mes evaluado:

| Carpeta | Entrenado en (6 meses) | Evaluado en | Nota |
|---|---|---|---|
| `2019-09/` | 2019-03 → 2019-08 | 2019-09 | El tramo de entrenamiento queda fuera de los datos liberados (Market-1T cubre 2019-07 → 2020-12); este encoder no puede reentrenarse con ellos |
| `2020-01/` | 2019-07 → 2019-12 | 2020-01 | |
| `2020-08/` | 2020-02 → 2020-07 | 2020-08 | |
| `2020-09/` | 2020-03 → 2020-08 | 2020-09 | |
| `2020-12/` | 2020-06 → 2020-11 | 2020-12 | |

## Capacidades

- Extraccion de caracteristicas (feature extraction) de series temporales de mercado a 1 Hz, generando embeddings por parche y agregados.
- Lectura dual de embeddings: representacion del ultimo parche (`pool="last"`) para tareas de pronostico en el instante de decision, y media de parches (`pool="mean"`) para analisis latentes.
- Soporte de pronostico mediante sondas (probes) entrenadas sobre los embeddings congelados.
- Analisis de representaciones latentes de regímenes de mercado.
- Aprendizaje auto-supervisado, sin necesidad de etiquetas para el preentrenamiento.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni flujos de agentes.
- No tiene capacidades multilingues (no es un modelo de lenguaje).
- Procesa exclusivamente datos de renta variable estadounidense en sesion regular sobre rejilla de 1 Hz.

## Casos de uso

- Generacion de embeddings para modelos de pronostico de precios: se congelan los pesos del encoder y se entrena una sonda ligera sobre la representacion del ultimo parche, de modo que el coste de adaptacion a una nueva tarea de prediccion es minimo.
- Clasificacion de regímenes de mercado: los embeddings agregados con `pool="mean"` pueden alimentar un clustering no supervisado para separar periodos de alta y baja volatilidad, tendencia o lateralidad.
- Deteccion de anomalias: al modelar la distribucion normal de la rejilla de 1 Hz, las reconstrucciones con alto error de parches enmascarados pueden señalar movimientos atipicos de precio o volumen.
- Busqueda de similitud entre dias o tickers: la representacion latente permite recuperar sesiones historicamente parecidas por vecino mas cercano sobre los embeddings.
- Ingenieria de caracteristicas para pipelines de aprendizaje supervisado: sustituir caracteristicas tecnicas hechas a mano (medias moviles, RSI, etc.) por embeddings aprendidos, reduciendo el trabajo de diseño manual.
- Investigacion academica sobre objetivos auto-supervisados: al compartir backbone y regimen de entrenamiento con otros 17 encoders de TFWM, sirve como punto de comparacion controlado para medir el efecto del objetivo TimeMAE frente a otros.
- Backtesting de estrategias cuantitativas: los checkpoints con separacion temporal estricta (entrenado en los seis meses anteriores, evaluado en el mes siguiente) permiten reproducir experimentos sin fuga de informacion sobre el mes de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que este encoder es uno de los 18 comparados en el paper *Towards Financial World Modeling* (TFWM), pero no incluye cifras numericas de MMLU, HumanEval, GSM8K ni de metricas financieras (IC, Sharpe, error de pronostico), por lo que no se presentan datos que no esten verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~22 millones de parametros, los pesos ocupan unos 88 MB en fp32 y unos 44 MB en fp16, mas el coste de activaciones, muy reducido por el tamano del backbone.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3090, RTX 4090, A100 o H100, resultan sobredimensionadas para este modelo; tambien se puede ejecutar en GPUs de gama de entrada.
- Cabe en cualquier GPU de consumo: si, con amplio margen, e incluso es viable la inferencia en CPU para lotes modestos.
- Opciones de despliegue: los archivos son state dicts de PyTorch (`model.pt` con `config.json`) que se cargan con `torch.load(..., weights_only=True)`; el wrapper `load_encoder` de `market_jepa.eval.checkpoints` no esta publico todavia. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Objetivo de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tfwm-timemae | ~22M | 1 Hz, 20 canales | TimeMAE (reconstruccion de parches enmascarados + alineamiento de representaciones) | other (`derived-market-data`) | Pesos publicos, codigo de entrenamiento pendiente |
| Otros encoders TFWM (17) | ~22M (mismo backbone) | 1 Hz, 20 canales | Distintos objetivos auto-supervisados | other (`derived-market-data`) | En la coleccion TFWM Pre-Trained Encoders |
| Alternativas externas de series temporales (p. ej. PatchTST, TimesNet) | no disponible | no disponible | no disponible | no disponible | no disponible |

Los 17 encoders restantes de la coleccion TFWM comparten el mismo backbone y el mismo regimen de 12 pasadas sobre los mismos tramos de seis meses, por lo que la comparacion con ellos aisla el efecto del objetivo de entrenamiento. Para modelos externos de series temporales no se dispone de datos en la informacion proporcionada.

## Limitaciones y advertencias

- Estado *pre-release*: los pesos y el codigo que los carga estan en desarrollo y el contenido o la disposicion pueden cambiar sin aviso.
- El codigo de entrenamiento (`market_jepa`, `stable_finance`) no es publico todavia, lo que limita la reproducibilidad del preentrenamiento.
- Licencia `derived-market-data` (categoria `other`): al derivar de datos de mercado, impone restricciones especificas sobre el uso y la redistribucion; debe revisarse antes de cualquier uso comercial.
- El checkpoint `2019-09/` se entreno con datos anteriores a 2019-07, fuera del dataset liberado Market-1T, por lo que no puede reentrenarse a partir de los datos publicos.
- Dominio restringido: solo renta variable estadounidense en sesion regular a 1 Hz; no esta pensado para otros mercados, frecuencias ni clases de activo.
- Cobertura temporal limitada a 2019-2020; puede reflejar condiciones de mercado especificas de ese periodo, incluida la volatilidad de 2020.
- Al ser un modelo auto-supervisado, sus embeddings pueden codificar sesgos o patrones espurios del dataset de entrenamiento.
- Riesgo de fuga de informacion (look-ahead) en backtesting si no se respeta escrupulosamente la separacion temporal entre el tramo de entrenamiento de cada checkpoint y el mes evaluado.
- No hay resultados de benchmarks publicados que permitan estimar su calidad predictiva de forma independiente.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier expectativa en ese sentido es inaplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fin-ai-lab/tfwm-timemae
- Dataset de entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense
- Carpeta concreta del dataset usada en el entrenamiento: https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-dense/tree/main/1Hz_mosaic_mnth
- Coleccion TFWM Pre-Trained Encoders: https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d
- Paper *Towards Financial World Modeling* (TFWM): enlace no disponible en la informacion proporcionada.
- Codigo del proyecto (`market_jepa`): no publicado todavia.
