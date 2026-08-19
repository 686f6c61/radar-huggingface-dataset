# NeoQuasar/Kronos-base

## Resumen

Kronos-base es un modelo fundacional de código abierto para el análisis de series temporales financieras, desarrollado por NeoQuasar. Es el primer modelo de este tipo entrenado específicamente sobre datos de velas japonesas (K-lines) de más de 45 bolsas globales, con el objetivo de capturar la dinámica de precios y patrones de actividad comercial en mercados financieros. El modelo se basa en una arquitectura decoder-only Transformer, combinada con un tokenizador especializado que convierte datos OHLCV continuos en tokens discretos jerárquicos.

El modelo resuelve el problema de la previsión de series temporales financieras en un contexto de alta volatilidad y ruido, donde los métodos tradicionales suelen fallar. Su relevancia actual radica en que es uno de los primeros modelos fundacionales financieros abiertos, con más de 1,29 millones de descargas en Hugging Face, y ofrece capacidades de previsión en cero disparos (zero-shot) sin necesidad de ajuste fino. Con 102,3 millones de parámetros y una ventana de contexto de 512 tokens, está diseñado para ser eficiente y desplegable en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con tokenizador jerárquico (Kronos-Tokenizer-base) |
| Parametros totales | 102.311.008 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors de precisión completa) |
| Idiomas soportados | No aplica (modelo de series temporales, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kronos-base emplea un enfoque en dos etapas. Primero, un tokenizador especializado (Kronos-Tokenizer-base) cuantiza los datos continuos multidimensionales de velas OHLCV (apertura, máximo, mínimo, cierre, volumen y cantidad) en tokens discretos jerárquicos. Estos tokens preservan tanto la dinámica de precios como los patrones de actividad comercial. Segundo, un Transformer autoregresivo de 102,3 millones de parámetros se entrena sobre estos tokens mediante un objetivo de modelado autoregresivo estándar.

El entrenamiento se realizó sobre un corpus masivo de más de 12 mil millones de registros de K-lines procedentes de 45 bolsas globales, lo que permite al modelo aprender representaciones temporales y de activos cruzados. No se menciona explícitamente el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovación principal reside en el tokenizador jerárquico, que convierte datos numéricos continuos en una representación discreta adecuada para el modelado autoregresivo, un enfoque inspirado en los modelos de lenguaje grandes pero adaptado a datos financieros.

## Capacidades

- Previsión de series temporales financieras: predice precios futuros (apertura, máximo, mínimo, cierre) a partir de datos históricos de velas.
- Previsión de volatilidad: puede estimar la volatilidad futura de un activo financiero.
- Generación de datos sintéticos: capaz de generar secuencias sintéticas de K-lines realistas, útiles para backtesting y aumentación de datos.
- Trabajo en cero disparos (zero-shot): no requiere ajuste fino para tareas nuevas, ya que ha sido preentrenado en un corpus diverso.
- Procesamiento de datos OHLCV con volumen y cantidad opcionales.
- Manejo de contextos de hasta 512 tokens, con truncamiento automático para secuencias más largas.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo especializado en series temporales y no un LLM generalista.

## Casos de uso

- Previsión de precios de criptomonedas: un trader puede usar Kronos-base para predecir el precio de BTC/USDT a 24 horas vista, como muestra la demo oficial, alimentando el modelo con los últimos 512 períodos de velas.
- Gestión de riesgos en carteras: las instituciones financieras pueden emplear las previsiones de volatilidad generadas por el modelo para ajustar sus posiciones y calcular el valor en riesgo (VaR) de forma más precisa.
- Backtesting de estrategias algorítmicas: los desarrolladores de trading cuantitativo pueden generar datos sintéticos realistas con Kronos-base para probar estrategias sin depender de datos históricos limitados.
- Alertas automáticas de mercado: un sistema puede monitorear continuamente las previsiones del modelo y lanzar alertas cuando se detecten movimientos anómalos o rupturas de soporte/resistencia previstas.
- Análisis de activos cruzados: al estar entrenado en 45 bolsas, el modelo puede capturar correlaciones entre diferentes mercados (acciones, materias primas, divisas) y utilizarlas para mejorar las previsiones de un activo concreto.
- Investigación académica en finanzas computacionales: los investigadores pueden utilizar Kronos-base como punto de partida para estudiar la eficacia de los modelos fundacionales en dominios financieros, comparándolo con métodos estadísticos clásicos como ARIMA o GARCH.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2508.02739) podría contener métricas comparativas, pero no se incluyen en la documentación pública de Hugging Face ni en los resultados de búsqueda obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 102,3 millones de parámetros en precisión FP32, el tamaño en memoria es de aproximadamente 410 MB. Con cuantización a FP16 se reduce a unos 205 MB, y a INT8 a unos 102 MB. La VRAM necesaria dependerá del framework y del lote (batch size), pero en general es inferior a 1 GB para inferencia básica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 3060 o superiores funcionan sin problemas. También es viable en CPU para inferencia de baja latencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluso en las de gama baja.
- Opciones de despliegue: el modelo se puede servir con frameworks estándar de PyTorch, así como con vLLM o TGI si se adapta a la interfaz de Hugging Face. También es posible ejecutarlo con llama.cpp si se convierte a formato GGUF, aunque no se proporciona oficialmente.
- Latencia y throughput: no se han publicado cifras oficiales. Dado el tamaño reducido, se espera una latencia de milisegundos por predicción en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Kronos-base | 102,3 M | 512 | Tokenización jerárquica + Transformer autoregresivo | MIT |
| Kronos-small | 24,7 M | 512 | Misma arquitectura, menor capacidad | MIT |
| Chronos (Amazon) | 20 M - 710 M | 512 | Tokenización de series temporales + T5 | Apache 2.0 |
| TimeGPT (Nixtla) | no disponible | no disponible | API propietaria | Comercial |

Kronos-base se diferencia de alternativas como Chronos por su especialización en datos financieros OHLCV, mientras que Chronos es más genérico para series temporales. TimeGPT es un servicio comercial cerrado, mientras que Kronos-base es completamente abierto bajo licencia MIT. La comparativa directa con otros modelos fundacionales de series temporales no está publicada en la información disponible.

## Limitaciones y advertencias

- Sesgos inherentes a los datos de entrenamiento: el modelo se entrena con datos de mercados financieros, que pueden contener sesgos estructurales (por ejemplo, sobre-representación de ciertos activos o regiones). Esto puede afectar a la precisión en mercados poco representados.
- Riesgo de alucinación en previsiones: como cualquier modelo generativo, puede producir previsiones que no se corresponden con la realidad del mercado, especialmente en situaciones de alta volatilidad o eventos extremos no vistos en el entrenamiento.
- Limitación de contexto: la ventana de 512 tokens limita la cantidad de historia que el modelo puede considerar. Para períodos de tiempo más largos, se requiere truncamiento, lo que puede perder información relevante.
- No es un modelo de lenguaje: no soporta instrucciones en lenguaje natural ni tareas de razonamiento general. Su uso está restringido a datos de series temporales financieras.
- Sin cuantizaciones oficiales: no se proporcionan versiones cuantizadas (GGUF, ONNX, etc.), por lo que el despliegue en entornos con restricciones de memoria requiere conversión manual.
- Advertencia para producción: las previsiones financieras conllevan riesgo económico. El modelo debe usarse como herramienta de apoyo, no como asesor financiero autónomo, y siempre con validación humana.

## Enlaces

- [Hugging Face - NeoQuasar/Kronos-base](https://huggingface.co/NeoQuasar/Kronos-base)
- [Paper arXiv 2508.02739](https://arxiv.org/abs/2508.02739)
- [Demo en vivo](https://shiyu-coder.github.io/Kronos-demo/)
- [Repositorio GitHub](https://github.com/shiyu-coder/Kronos)
- [Tokenizador Kronos-Tokenizer-base](https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base)
- [Modelo Kronos-small](https://huggingface.co/NeoQuasar/Kronos-small)
- [Modelo Kronos-mini](https://huggingface.co/NeoQuasar/Kronos-mini)
