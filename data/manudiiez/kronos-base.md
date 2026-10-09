# manudiiez/Kronos-base

## Resumen

Kronos-base es un modelo fundacional de código abierto especializado en el "lenguaje" de los mercados financieros, es decir, en secuencias de velas japonesas (K-lines u OHLCV). Lo desarrolla el equipo detrás del proyecto Kronos y se distribuye bajo licencia MIT. Este repositorio concreto (manudiiez/Kronos-base) replica el modelo oficial publicado por NeoQuasar. Resuelve el problema del pronóstico de series temporales financieras de alta relación señal-ruido mediante un enfoque de tokenización discreta más transformer autorregresivo, en lugar de aplicar directamente arquitecturas de series temporales genéricas.

El modelo pertenece a una familia de decodificadores autorregresivos (decoder-only) con 102.311.008 parámetros totales (unos 102,3 M) y una longitud de contexto de 512 tokens. Se apoya en un tokenizador específico, Kronos-Tokenizer-base, que cuantiza datos continuos multidimensionales (OHLCV) en tokens discretos jerárquicos, sobre los que después se entrena el transformer.

Su relevancia actual radica en que es uno de los primeros modelos fundacionales abiertos orientados específicamente a velas financieras, con preentrenamiento sobre más de 12.000 millones de registros K-line procedentes de 45 bolsas globales, y con capacidad de funcionar en modo zero-shot para tareas como pronóstico de precios, pronóstico de volatilidad y generación de datos sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo, con tokenizador especializado de K-lines |
| Parametros totales | 102.311.008 (102,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de series temporales, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | time-series-forecasting |
| Tamano del repositorio | 0,4 GB |
| Tokenizador asociado | Kronos-Tokenizer-base |

## Arquitectura y entrenamiento

Kronos emplea un marco de dos etapas. La primera es un tokenizador que cuantiza la información continua de mercado (apertura, máximo, mínimo, cierre y volumen, OHLCV) en tokens discretos jerárquicos, preservando tanto la dinámica de precios como los patrones de actividad de negociación. La segunda etapa es un transformer autorregresivo de gran escala (en este caso, 102,3 M de parámetros) preentrenado sobre esas secuencias de tokens con un objetivo autorregresivo de siguiente token. El modelo es decoder-only y funciona como modelo unificado para múltiples tareas cuantitativas.

El preentrenamiento se realizó sobre un corpus multimercado de más de 12.000 millones de registros K-line procedentes de 45 bolsas globales, lo que permite aprender representaciones temporales y entre activos. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset más allá de las 45 bolsas, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones; estos datos no están disponibles. Tampoco se describen innovaciones adicionales como decodificación especulativa o atención lineal. La longitud máxima de contexto para Kronos-small y Kronos-base es 512, y el `KronosPredictor` trunca automáticamente entradas superiores a ese límite. El modelo `Kronos-mini` de la misma familia usa un tokenizador distinto (Kronos-Tokenizer-2k) con contexto de 2048.

## Capacidades

- Pronóstico de series de precios (price series forecasting) sobre datos OHLCV.
- Pronóstico de volatilidad.
- Generación de datos sintéticos de mercado.
- Funcionamiento en modo zero-shot sobre tareas financieras diversas.
- Procesamiento de datos multidimensionales de K-lines (open, high, low, close; volumen y amount opcionales).
- Aprendizaje de representaciones temporales y entre activos (cross-asset) gracias al preentrenamiento multimercado.
- No soporta tool calling ni function calling (no es un modelo de lenguaje conversacional).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" declarado en la información disponible.

## Casos de uso

- Trading algorítmico y generación de señales: el modelo puede producir pronósticos de la evolución de precios a partir de ventanas históricas de hasta 512 velas, útiles como entrada para estrategias sistemáticas de compra y venta.
- Gestión de riesgo y pronóstico de volatilidad: al modelar la volatilidad futura, permite dimensionar posiciones, calcular márgenes o construir coberturas de forma más informada.
- Backtesting con datos sintéticos: la capacidad de generar trayectorias sintéticas de mercado permite ampliar escenarios históricos y probar estrategias frente a condiciones no observadas.
- Investigación cuantitativa y factor investing: sirve como extractor de representaciones de series temporales financieras para alimentar modelos posteriores de clasificación o regresión.
- Análisis multimercado y entre activos: al haberse preentrenado con datos de 45 bolsas, puede aplicarse a distintos instrumentos y mercados sin reentrenamiento específico (zero-shot).
- Monitorización de carteras y alertas: integrado en pipelines que consumen velas en tiempo casi real, puede anticipar desviaciones de precio o volatilidad y disparar alertas.
- Evaluación y saneamiento de datos financieros: la generación sintética y el modelado de distribuciones permiten detectar anomalías o huecos en series históricas.
- Prototipado rápido en finanzas: con solo 102,3 M de parámetros y pesos safetensors de 0,4 GB, es viable desplegarlo en entornos de desarrollo para experimentar con pronósticos sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según formato, no confirmada por el autor): aproximadamente 0,4 GB en FP32, alrededor de 0,2 GB en FP16/BF16 y menos de 0,1 GB en cuantizaciones de 8 o 4 bits. Estas cifras son estimaciones basadas en el número de parámetros, no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, el modelo cabe sobradamente en cualquier GPU de consumo reciente y también en CPU.
- Cabe en GPU de consumo: sí, con mucha holgura; cualquier GPU con al menos 1-2 GB de VRAM libre debería ser suficiente, y también es viable en CPU.
- Opciones de despliegue: la model card indica el uso de la clase `KronosPredictor` junto con `Kronos` y `KronosTokenizer`, cargando los pesos desde Hugging Face Hub; requiere Python 3.10 o superior y las dependencias del repositorio de GitHub. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kronos-base | 102,3 M | 512 | Kronos-Tokenizer-base | MIT | Publico |
| Kronos-small | 24,7 M | 512 | Kronos-Tokenizer-base | MIT | Publico |
| Kronos-mini | 4,1 M | 2048 | Kronos-Tokenizer-2k | MIT | Publico |
| Kronos-large | 499,2 M | 512 | Kronos-Tokenizer-base | MIT | No disponible publicamente |

Frente a otros modelos fundacionales de series temporales de propósito general (por ejemplo, la familia Chronos o TimesFM), Kronos se diferencia por estar especializado en K-lines financieras y por su tokenizador dedicado a OHLCV. No se dispone en la información proporcionada de datos de parámetros, contexto o rendimiento de esos modelos alternativos que permitan una comparación cuantitativa directa, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; cabe esperar sesgo hacia los mercados y periodos temporales presentes en el corpus de las 45 bolsas usadas en el preentrenamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir pronósticos plausibles pero incorrectos; en finanzas esto tiene consecuencias económicas directas y no debe usarse como única base para decisiones de inversión.
- Limitación de contexto: el contexto máximo de Kronos-base es de 512 tokens; las entradas más largas se truncan automáticamente, lo que puede eliminar información relevante en análisis de largo plazo.
- Alta relación señal-ruido: la propia model card reconoce que los datos financieros son muy ruidosos, lo que limita intrínsecamente la precisión del pronóstico.
- Idiomas y multimodalidad: no aplica soporte multilingüe ni de visión o audio, ya que no es un modelo de lenguaje natural.
- Licencia: MIT, lo que permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia.
- Caveat de producción: el repositorio `manudiiez/Kronos-base` registra 0 descargas y 0 likes y parece una réplica del modelo oficial `NeoQuasar/Kronos-base`; para producción conviene verificar la procedencia de los pesos y preferir la fuente oficial.
- No se especifican cuantizaciones soportadas ni soporte para motores de inferencia estándar, lo que puede requerir usar la implementación propia del proyecto.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/manudiiez/Kronos-base
- Repositorio oficial del modelo base: https://huggingface.co/NeoQuasar/Kronos-base
- Tokenizador Kronos-Tokenizer-base: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base
- Tokenizador Kronos-Tokenizer-2k: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-2k
- Modelo Kronos-mini: https://huggingface.co/NeoQuasar/Kronos-mini
- Modelo Kronos-small: https://huggingface.co/NeoQuasar/Kronos-small
- Paper: https://arxiv.org/abs/2508.02739
- Repositorio GitHub: https://github.com/shiyu-coder/Kronos
- Demo en vivo: https://shiyu-coder.github.io/Kronos-demo/
