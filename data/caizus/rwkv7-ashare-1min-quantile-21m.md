# Caizus/rwkv7-ashare-1min-quantile-21m

## Resumen

RWKV7 A-share 1-minute direct quantile forecasting es un modelo de predicción de series temporales financieras desarrollado por el usuario Caizus y publicado en Hugging Face. Se trata de un modelo pequeño (21.017.102 parámetros) basado en la arquitectura RWKV7, entrenado específicamente sobre datos OHLCV de un minuto de acciones del mercado chino A-share. Su tarea es la previsión directa de cuantiles: dado un histórico de 64 minutos con 23 características, produce las distribuciones de cuantiles 0,1 a 0,9 del retorno acumulado del precio de cierre para horizontes de 1 a 30 minutos.

El modelo resuelve un problema concreto de forecasting probabilístico: en lugar de una única predicción puntual, entrega nueve cuantiles por horizonte, lo que permite construir intervalos de confianza (por ejemplo, el intervalo del 60 % entre q0,2 y q0,8, o el del 80 % entre q0,1 y q0,9). Está empaquetado como un `PreTrainedModel` estándar de Transformers con pesos safetensors, registro personalizado de `AutoConfig`/`AutoModel` y un script de inferencia por línea de comandos.

Es relevante ahora porque ejemplifica el uso de arquitecturas de espacio de estados (RWKV) en dominios financieros de alta frecuencia, con una evaluación honesta publicada en la propia model card: el modelo mejora la pérdida pinball frente a referencias empíricas de cuantiles, aunque su MAE mediano no supera al de una referencia ingenua de precio constante. El contexto de entrada es de 64 barras de un minuto y la salida cubre 30 horizontes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV7 (transformer de espacio de estados recurrente), backbone transformers-rwkv |
| Parametros totales | 21.017.102 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 barras de 1 minuto de entrada; salida de 30 horizontes × 9 cuantiles |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el autor no documenta cuantizaciones GGUF/INT8) |
| Idiomas soportados | zh, en (metadatos; la tarea es numérica, no lingüística) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, con index.json), más código Python de modelado y procesamiento |

## Arquitectura y entrenamiento

El modelo es un RWKV7 de 24 capas, con hidden size 256 e intermediate size 1024, entrenado desde inicialización aleatoria (seed 1234). La entrada es una matriz de 64 × 23 características: cinco características base derivadas de OHLCV (retorno de apertura, retorno de cierre, mecha superior, mecha inferior y log-volumen) más 18 características adicionales que incluyen codificaciones cíclicas de minuto y día de la semana, marca de sesión de tarde, retornos acumulados a 5/15/30/60 minutos, RMS de retornos en esas mismas ventanas, volumen relativo a 60 minutos, proporción de minutos alcistas y tres estadísticas de mercado (retorno medio, volatilidad y fracción alcista). La cabeza de salida proyecta en FP32 y produce 30 × 9 valores de retorno logarítmico acumulado.

El backbone es BF16, mientras que el estado WKV y las acumulaciones se mantienen en FP32 (`fp32io16`). El modelo incorpora internamente la media y desviación típica de entrenamiento, por lo que se le pasan características sin estandarizar. Cada llamada reinicia el estado RWKV, de modo que ventanas independientes no se encadenan. El entrenamiento principal completó 3592 pasos, pero los pesos publicados corresponden al paso 500, seleccionado sobre un conjunto de validación fijo; una extensión hasta el paso 15231 no mejoró la validación. Los datos provienen del dataset `neigezhu/china-a-share-1min-ohlcv`, con frontera de fechas de entrenamiento en 2024-01-01 y de validación en 2025-01-01. No se documenta uso de RLHF ni DPO; la función de pérdida es pinball (quantile loss) estándar.

## Capacidades

- Predicción probabilística de retornos: genera nueve cuantiles (0,1 a 0,9) para cada uno de los 30 horizontes de 1 a 30 minutos.
- Reconstrucción de precios: a partir del precio ancla (último cierre) y los retornos predichos, calcula precios de cierre previstos por cuantil y horizonte.
- Construcción de intervalos de confianza: expone directamente intervalos del 60 % (q0,2–q0,8) y del 80 % (q0,1–q0,9).
- Cálculo de pérdida pinball: acepta `labels` opcionales de forma [B, 30] para evaluar la pérdida de los cuantiles sin ordenar.
- Ordenación opcional de cuantiles: `fix_quantile_crossing` permite devolver los cuantiles ordenados en el eje de cuantil para evitar cruces.
- Procesamiento de features integrado: `prepare_features` transforma barras OHLCV crudas en la matriz [64, 23] y el precio ancla.
- Estadísticas de mercado: función `market_statistics` para calcular retorno, volatilidad y fracción alcista de un conjunto de acciones en una ventana.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre; es un modelo puramente numérico de forecasting.

## Casos de uso

- Predicción intradía de precios de cierre: dado el histórico de 64 minutos de una acción A-share, obtener la distribución de precios de cierre previstos para los próximos 1 a 30 minutos, útil para sistemas de alerta y monitorización de carteras.
- Gestión de riesgo y bandas de confianza: usar los intervalos del 60 % y 80 % para dimensionar stops, límites de exposición o márgenes de seguridad en estrategias de trading de alta frecuencia.
- Investigación en forecasting probabilístico: servir como línea base reproducible (con `evaluation.json` y pesos fijados) para comparar nuevas arquitecturas de series temporales frente a RWKV7 en datos financieros chinos.
- Backtesting de estrategias cuantitativas: integrar las predicciones de cuantiles en simuladores para evaluar estrategias basadas en la distribución predicha del retorno a corto plazo.
- Detección de regímenes de volatilidad: analizar la amplitud de los intervalos predichos (diferencia entre q0,1 y q0,9) como señal de incertidumbre y cambio de régimen de mercado.
- Pipeline de investigación en mercados emergentes: adaptar el contrato de entrada (OHLCV + estadísticas de mercado) a otros mercados o frecuencias, reentrenando el backbone RWKV7 con la misma interfaz de AutoModel.
- Evaluación de calibración de modelos probabilísticos: comparar las coberturas empíricas (60,509 % y 80,054 %) con las nominales para estudiar la calibración en distintos subconjuntos de fechas o sectores.

## Benchmarks y rendimiento

Los resultados publicados en `evaluation.json` corresponden a un conjunto de test fijo de 4096 ventanas, 2919 instrumentos y 21 fechas, con puntos de predicción entre 2025-01-13 y 2026-07-24. Las métricas de error se expresan en puntos base (bp) de retorno logarítmico acumulado o como porcentaje normalizado por el precio del punto de partida.

| Metrica | Este modelo | Referencia |
|---|---:|---:|
| MAE del mediano a 30 minutos (normalizado por precio de inicio) | 0,30772 % | Precio constante: 0,30599 % |
| MAE del mediano en el minuto 30 | 0,43640 % | Precio constante: 0,43748 % |
| Pinball loss media (cuantiles ordenados) | 12,23144 bp | Cuantiles incondicionales de entrenamiento: 12,84557 bp |
| Pinball loss media (cuantiles ordenados) | 12,23144 bp | Cuantiles por grupo de volatilidad × sesión: 12,57593 bp |
| Cobertura del intervalo del 60 % | 60,509 % | Nominal: 60 % |
| Cobertura del intervalo del 80 % | 80,054 % | Nominal: 80 % |
| Sesgo de la predicción de retorno acumulado en el minuto 30 | −5,65274 bp | — |

El propio autor señala que el MAE mediano del modelo no supera a la referencia de precio constante, mientras que la pérdida pinball sí mejora frente a las referencias empíricas de cuantiles. No se publican resultados de MMLU, HumanEval, GSM8K ni benchmarks de texto, ya que el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~21 M de parámetros en BF16 (~42 MB de pesos), más estado WKV y acumulaciones en FP32; el consumo real depende en gran medida de los kernels CUDA y del tamaño de lote. No se publica una cifra oficial de VRAM.
- GPU recomendadas: el autor verificó el entorno con una NVIDIA RTX PRO 6000 Blackwell; requiere GPU NVIDIA con CUDA. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: por tamaño de pesos, cabría en cualquier GPU consumer moderna con soporte CUDA; sin embargo, el autor no confirma compatibilidad con GPUs de gama baja ni con hardware sin CUDA.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y el fork `transformers-rwkv` en una revisión fija; el script `inference.py` del repositorio; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que la primera inferencia puede compilar o ajustar kernels CUDA (FlashRWKV2 0.1.0a18, TileLang 0.1.15) y que las llamadas posteriores reutilizan la caché.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor solo incluye referencias estadísticas (precio constante y cuantiles empíricos), no modelos de forecasting comparables. Por tanto:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RWKV7 A-share 1-min quantile (este modelo) | 21,0 M | 64 barras de 1 min | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento predictivo limitado: el MAE mediano del modelo no supera a la referencia ingenua de precio constante, según la propia evaluación del autor.
- Sesgo negativo documentado: la predicción del retorno acumulado en el minuto 30 presenta un sesgo de −5,65274 bp, lo que puede infravalorar sistemáticamente las subidas.
- Dependencia del conjunto de datos: las estadísticas de mercado se calcularon sobre el conjunto de instrumentos del manifest de entrenamiento; cambiar la fuente de datos o la composición del universo altera la distribución de entrada y degrada el rendimiento.
- Requisitos estrictos de entrada: se necesitan al menos 65 barras consecutivas de un minuto con formato y zona horaria concretos (hora local de Shanghái, sin sufijo de zona), sin rellenar minutos ausentes ni cruzar el descanso del mediodía; los puntos de predicción válidos se limitan a franjas concretas de la mañana (~10:34–11:00) y de la tarde (~14:05–14:30).
- Entrenamiento sobre un único mercado: solo se ha entrenado con acciones A-share de China; no hay evidencia de generalización a otros mercados, frecuencias o clases de activos.
- Riesgo de alucinación estadística: como todo modelo financiero, puede producir predicciones con aparente precisión pero sin valor predictivo real; las coberturas empíricas cercanas a las nominales no garantizan rendimiento económico.
- Dependencia de kernels y versiones fijas: requiere el fork `transformers-rwkv` en una revisión concreta, FlashRWKV2 y TileLang, con versiones verificadas de Python 3.12 y PyTorch 2.14.0+cu130; otras combinaciones pueden no funcionar.
- Licencia Apache-2.0 para código y pesos, pero los datos originales y las dependencias mantienen sus propias licencias, que deben revisarse para uso comercial.
- No apto para uso lingüístico: los metadatos indican idiomas zh/en, pero el modelo no genera texto ni responde a prompts; es exclusivamente numérico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Caizus/rwkv7-ashare-1min-quantile-21m
- Backbone transformers-rwkv (revisión fija): https://github.com/rwkv-rs/transformers-rwkv/tree/f93dd4e01e0b565ef0390f76c6726d1d121ebbab
- Dataset de entrenamiento: https://huggingface.co/datasets/neigezhu/china-a-share-1min-ohlcv
- Documentación de modelos personalizados de Transformers: https://huggingface.co/docs/transformers/main/en/custom_models
