# shubhxho/cmf-2

## Resumen

CMF-2 es un modelo de 50,5 millones de parámetros desarrollado por Shubh (shubhxho) para predecir la resolución de mercados binarios de criptomonedas en Polymarket con un horizonte de 15 minutos. El modelo utiliza una arquitectura de doble flujo (dual-stream) que procesa simultáneamente la cinta rápida de Binance USDT-M y la cinta lenta del libro de órdenes central (CLOB) de Polymarket. La política de decisión compra un token únicamente cuando la probabilidad calibrada de que el resultado sea UP supera la oferta visible en el mercado.

El modelo está entrenado en Apple Silicon mediante MLX, con un tiempo de entrenamiento de 3,57 horas, y se distribuye en formato safetensors con licencia MIT. Su relevancia radica en ser un ejemplo concreto de aplicación de modelos de series temporales a mercados de predicción, un área emergente en finanzas cuantitativas. Aunque el modelo es pequeño y especializado, su diseño demuestra cómo integrar datos de alta frecuencia de diferentes fuentes para generar señales de trading accionables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-stream (dos flujos de entrada: cinta rápida Binance y cinta lenta Polymarket) |
| Parametros totales | 50,5 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa ventanas temporales de 15 minutos, sin especificar número de pasos) |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye pesos F32 en safetensors; MLX soporta cuantización, pero no se documenta) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (fusion.safetensors, 202 MB F32) y MLX (library_name) |

## Arquitectura y entrenamiento

CMF-2 emplea una arquitectura de doble flujo (dual-stream) que procesa dos series temporales en paralelo: la cinta rápida de Binance USDT-M (futuros perpetuos) y la cinta lenta del CLOB de Polymarket (libro de órdenes). Ambas señales se fusionan en una capa posterior para producir una probabilidad calibrada `P(resolve UP)`. No se especifica si la arquitectura interna es un transformer, una red recurrente o un modelo híbrido; la model card solo indica "dual-stream model" sin más detalles sobre las capas internas.

El entrenamiento se realizó en Apple Silicon con MLX durante 3,57 horas, utilizando un split cronológico de los datos, EMA (media móvil exponencial) para suavizado, selección del mejor checkpoint según validación, un fine-tune con función de utilidad y un escalado de temperatura. La model card menciona que se usó un simulador held-out con 80 episodios para evaluar el rendimiento, donde cada política opera sobre el mismo libro de órdenes y se paga el spread bid/ask. No se proporciona información sobre el tamaño del dataset de entrenamiento, el número de tokens o la composición exacta de los datos.

## Capacidades

- Predicción de probabilidad de resolución UP/DOWN para mercados binarios de criptomonedas en Polymarket con horizonte de 15 minutos.
- Generación de señales de trading basadas en la comparación entre la probabilidad calibrada y la oferta visible en el CLOB.
- Procesamiento de series temporales de alta frecuencia provenientes de dos fuentes distintas (Binance y Polymarket).
- Entrenamiento específico para optimizar una función de utilidad (utility fine-tune), lo que permite ajustar el modelo a métricas de PnL y Sharpe en lugar de solo precisión.
- No es un modelo de lenguaje: no genera texto, no tiene capacidades de razonamiento general ni de tool calling.

## Casos de uso

- Trading algorítmico en mercados de predicción: el modelo puede integrarse en un bot que monitorice continuamente las cotizaciones de Polymarket y ejecute órdenes de compra cuando la probabilidad calibrada supere la oferta. Su baja latencia y tamaño reducido permiten ejecución en tiempo real.
- Backtesting de estrategias de mercado binario: los investigadores pueden utilizar el simulador held-out incluido en el repositorio para evaluar el rendimiento del modelo bajo condiciones de mercado históricas, comparando con políticas aleatorias o con un oráculo con lag.
- Investigación en finanzas cuantitativas: el diseño dual-stream sirve como caso de estudio para fusionar datos de alta frecuencia de diferentes exchanges y derivar señales de trading basadas en probabilidades calibradas.
- Análisis de eficiencia del mercado de predicción: al comparar las predicciones del modelo con los precios observados, se pueden estudiar desviaciones de la eficiencia informacional en mercados de eventos cripto.
- Educación en ML aplicado a trading: el código abierto y la documentación permiten a estudiantes y desarrolladores aprender a implementar modelos de series temporales con MLX y a diseñar sistemas de decisión basados en umbrales de probabilidad.
- Prototipado rápido de estrategias de opciones binarias: dado que el modelo es ligero (202 MB en F32), se puede desplegar en hardware modesto para pruebas de concepto sin necesidad de infraestructura GPU avanzada.

## Benchmarks y rendimiento

La model card proporciona resultados de un simulador held-out con 80 episodios, donde todas las políticas operan sobre el mismo libro de órdenes y se descuentan los costes de bid/ask. Estos resultados no provienen de benchmarks estándar (MMLU, HumanEval, etc.) sino de una evaluación específica del dominio.

| Politica | PnL medio | Sharpe | Operaciones por episodio | P(UP) |
|---|---:|---:|---:|---:|
| CMF-2 | +1,13 | 2,94 | 1,24 | 92,3% |
| Oráculo con lag | +1,76 | 4,19 | 0,99 | — |
| Aleatoria | −7,40 | −44,4 | 60,7 | — |

El modelo alcanza aproximadamente el 64% del PnL del oráculo con lag, que es una cota superior realista dado que el oráculo conoce la resolución futura con un pequeño retraso. No se han publicado resultados en benchmarks generales de IA ni comparaciones con otros modelos de trading en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 50,5 millones de parámetros y los pesos en F32 ocupan 202 MB, por lo que la inferencia cabe en cualquier GPU moderna con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte para MLX (Apple Silicon) o CUDA (si se convierte a otro formato). Una RTX 3060 o superior es más que suficiente; también funciona en Mac M1/M2/M3.
- Capacidad en GPU de consumo: sí, cabe en cualquier GPU de consumo actual (RTX 4060, RTX 4090, etc.) y también en hardware sin GPU, gracias a su pequeño tamaño.
- Opciones de despliegue: el modelo está diseñado para MLX, por lo que se puede ejecutar directamente en Apple Silicon. Para otros entornos, se puede convertir a ONNX o TensorRT, aunque no se documenta. También es posible cargarlo con la librería `cmf.io` incluida en el repositorio de GitHub.
- Latencia y throughput estimados: no se proporcionan datos oficiales, pero dada la arquitectura de 50,5 M de parámetros y el procesamiento de series temporales de 15 minutos, la inferencia debería completarse en milisegundos en hardware moderno, permitiendo decisiones en tiempo real.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (predicción de mercados binarios de criptomonedas con horizonte de 15 minutos). La model card no menciona alternativas ni benchmarks comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La model card advierte explícitamente que el simulador asume que se puede ejecutar la orden al precio visible ("Assumes you can hit the quote you see"), lo que no siempre es realista en mercados con liquidez limitada.
- El rendimiento de +1,13 de PnL medio y Sharpe 2,94 proviene de un simulador propio, no de operaciones reales en Polymarket. No hay evidencia de que estas métricas se mantengan en producción.
- El modelo está entrenado específicamente para mercados de criptomonedas en Polymarket con ventana de 15 minutos. Su aplicabilidad a otros activos o plazos no está probada.
- La alta precisión de P(UP) del 92,3% puede indicar sobreajuste al conjunto de validación o a las condiciones particulares del período de entrenamiento.
- No es un modelo de lenguaje: no puede responder preguntas, generar texto ni realizar razonamiento general. Cualquier intento de usarlo fuera de su dominio específico fallará.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de mercado, puede reflejar las ineficiencias o anomalías presentes en los datos históricos de Binance y Polymarket.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/shubhxho/cmf-2
- Código fuente (GitHub): https://github.com/shubhxho/polymarket-model
- Página del proyecto (card): https://shubhxho.github.io/polymarket-model/
- Dataset de entrenamiento (Binance 15m): https://huggingface.co/datasets/shubhxho/cmf-15m-binance
