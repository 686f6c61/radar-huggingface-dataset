# BriskBank/Kronos-base

## Resumen

Kronos-base es un modelo fundacional de código abierto para el análisis de series temporales financieras, concretamente de velas japonesas (K-lines). Desarrollado por el equipo de NeoQuasar y publicado bajo licencia MIT, es el primer modelo de este tipo entrenado sobre datos de más de 45 bolsas globales, con un total de 12 mil millones de registros de velas OHLCV. Su propósito es aprender el "lenguaje" de los mercados financieros y servir como base unificada para tareas como predicción de precios, volatilidad y generación de datos sintéticos.

El modelo sigue una arquitectura decoder-only de Transformer, pero incorpora una novedad clave: un tokenizador especializado que cuantifica las series continuas multidimensionales en tokens discretos jerárquicos. Este tokenizador, denominado Kronos-Tokenizer-base, permite que el modelo procese información de mercado de forma similar a como un LLM procesa texto. Con 102,3 millones de parámetros y una longitud de contexto de 512 tokens, Kronos-base ofrece un equilibrio entre capacidad y eficiencia, siendo adecuado para tareas de forecasting en cero disparos sin necesidad de ajuste fino.

Su relevancia actual radica en que aborda las limitaciones de los modelos estadísticos tradicionales frente al ruido y la no estacionariedad de los datos financieros. Al preentrenarse de forma autorregresiva sobre un corpus masivo y multi-mercado, Kronos-base aprende representaciones temporales y transversales que generalizan bien a escenarios no vistos, lo que lo convierte en una herramienta práctica para cuantos y desarrolladores que buscan una base sólida sin partir de cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con tokenizador jerárquico (Kronos-Tokenizer-base) |
| Parametros totales | 102.311.008 (102,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales numéricas, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kronos-base emplea un transformer decoder-only estándar, pero su innovación reside en el front-end de tokenización. El tokenizador Kronos-Tokenizer-base cuantiza los datos OHLCV (apertura, máximo, mínimo, cierre) junto con volumen y cantidad en tokens discretos jerárquicos. Este proceso preserva la dinámica de precios y los patrones de actividad comercial, convirtiendo las series continuas en secuencias de tokens que el transformer puede procesar de manera autorregresiva.

El entrenamiento se realizó sobre un corpus masivo de más de 12 mil millones de registros de K-line procedentes de 45 exchanges globales. El objetivo es aprender representaciones temporales y transversales que capten tanto las dependencias a corto plazo como los patrones estacionales y de volatilidad. No se aplicaron técnicas de RLHF ni DPO, ya que el modelo no está orientado a conversación ni texto, sino a predicción numérica. La arquitectura está diseñada para manejar el alto ruido inherente a los datos financieros, algo que los modelos tradicionales suelen abordar con técnicas estadísticas ad hoc.

## Capacidades

- Predicción de series temporales de precios (forecasting) en modo zero-shot, sin necesidad de entrenamiento adicional.
- Predicción de volatilidad, útil para gestión de riesgo.
- Generación de datos sintéticos de mercado, permitiendo simular escenarios o aumentar datasets.
- Procesamiento de datos OHLCV con volumen y cantidad opcional.
- Manejo de múltiples mercados y activos gracias al preentrenamiento multiexchange.
- Capacidad de trabajar con contextos de hasta 512 tokens, recomendándose entradas de longitud similar para un rendimiento óptimo.
- No soporta funciones de tool calling ni agentes, ni procesamiento de texto o visión.

## Casos de uso

- **Trading algorítmico**: un sistema puede alimentar a Kronos-base con las últimas 512 velas de un activo para obtener predicciones de precios futuros, integrándolas en estrategias de ejecución automática.
- **Gestión de riesgo**: los pronósticos de volatilidad generados por el modelo permiten ajustar posiciones o calcular el VaR (Value at Risk) en carteras de activos.
- **Backtesting de estrategias**: usar el modelo como generador de datos sintéticos para probar estrategias de inversión bajo condiciones de mercado simuladas.
- **Análisis de mercado en tiempo real**: un dashboard puede alimentar el modelo con datos de un exchange concreto y mostrar proyecciones a corto plazo para distintos pares de trading.
- **Sintetización de datos para entrenamiento**: los datos generados por Kronos-base pueden servir para entrenar otros modelos de ML en tareas financieras cuando los datos reales son escasos o sensibles.
- **Investigación en finanzas cuantitativas**: investigadores pueden usar el modelo como referencia para estudiar la predecibilidad de los mercados o para comparar con otros enfoques de series temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card menciona que destaca en tareas de forecasting, volatilidad y generación de datos sintéticos en zero-shot, pero no se aportan cifras concretas de métricas como MMLU, HumanEval o similares (no aplicables por ser un modelo numérico). Se recomienda consultar el paper arxiv:2508.02739 para posibles evaluaciones detalladas.

## Requisitos de hardware

- **VRAM estimada**: al tener 102,3 M de parámetros, en float32 ocupa aproximadamente 0,4 GB en memoria. Con cuantización (si se publicara) podría reducirse, pero no se dispone de esa información.
- **GPU recomendadas**: el modelo es ligero y puede ejecutarse en cualquier GPU moderna, incluidas RTX 3060, RTX 4060, T4 o incluso en CPU con baja latencia (aunque más lento).
- **Compatibilidad con consumer GPU**: sí, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- **Opciones de despliegue**: no se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, dado que es un modelo de series temporales, no de texto. El repositorio de GitHub incluye el código necesario para cargar el modelo con `Kronos.from_pretrained` y `KronosPredictor` en PyTorch.
- **Latencia y throughput**: no disponible en la información proporcionada, pero dado el tamaño, se esperan tiempos de inferencia de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables dentro de la misma categoría (fundaciones para velas financieras). Existen otros time series foundation models como TimeGPT, Moirai o Lag-Llama, pero no se han encontrado datos en la información proporcionada para realizar una comparación cuantitativa. Por lo tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Contexto limitado**: la longitud de contexto es de solo 512 tokens, lo que restringe la ventana de análisis a aproximadamente 512 velas. Para periodos más largos, el modelo trunca la entrada, lo que puede afectar la precisión.
- **Sesgo de mercado**: el modelo se entrena con datos históricos de exchanges globales, por lo que sus predicciones pueden reflejar sesgos inherentes a esos mercados (por ejemplo, sobre-representación de ciertos activos o regiones).
- **Riesgo de alucinación**: aunque no genera texto, en el contexto de series temporales puede producir valores poco realistas o extrapolaciones extremas, especialmente en mercados con alta volatilidad.
- **Limitación de idioma**: no procesa texto ni instrucciones en lenguaje natural; solo acepta datos numéricos en formato DataFrame.
- **Restricciones de licencia**: la licencia MIT permite uso comercial libre, pero sin garantía de exactitud o idoneidad para decisiones financieras reales.
- **Caveat para producción**: el modelo no ha sido validado en entornos de trading en vivo, y su rendimiento en modo cero flujo puede degradarse en condiciones de mercado no vistas durante el entrenamiento. Se recomienda una validación exhaustiva antes de su uso real.

## Enlaces

- HuggingFace (original): [NeoQuasar/Kronos-base](https://huggingface.co/NeoQuasar/Kronos-base)
- HuggingFace (mirror o variante): [BriskBank/Kronos-base](https://huggingface.co/BriskBank/Kronos-base)
- Paper: [arxiv:2508.02739](https://arxiv.org/abs/2508.02739)
- GitHub del proyecto: [shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos)
- Demo en vivo: [Kronos-demo](https://shiyu-coder.github.io/Kronos-demo/)
- Tokenizer asociado: [NeoQuasar/Kronos-Tokenizer-base](https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base)
