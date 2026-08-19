# pavelslab-nyu/Chess-Pretrain-Models

## Resumen

Chess-Pretrain-Models es una colección de modelos de lenguaje preentrados específicamente para ajedrez, desarrollada por Pavel's Lab de la Universidad de Nueva York (NYU). Forma parte de un estudio sobre asignación de cómputo (compute allocation) que investiga cómo distribuir recursos entre el tamaño del modelo y la cantidad de tokens de entrenamiento para optimizar el rendimiento en una tarea concreta. El repositorio contiene decenas de modelos base (sin fine-tuning) de distintos tamaños —desde 5 millones hasta 680 millones de parámetros— entrenados con volúmenes de datos que van desde 80 millones hasta 53 mil millones de tokens de partidas de ajedrez en notación algebraica.

Los modelos están basados en la arquitectura Qwen3, según las etiquetas del repositorio, y se distribuyen en formato safetensors con licencia MIT, lo que permite uso comercial sin restricciones. Cada subcarpeta del repositorio contiene un modelo independiente con su propia tarjeta de evaluación (pass@1 y pass@16) sobre un benchmark de ajedrez multi-turno. Los modelos base sirven como punto de partida para fine-tuning posterior; los autores publican los modelos SFT-thinking (entrenados con razonamiento) en un repositorio hermano. La relevancia de este trabajo radica en que proporciona datos empíricos sobre scaling laws en dominios especializados y ofrece modelos pequeños y eficientes para tareas de ajedrez que pueden ejecutarse en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3 (detalles no disponibles) |
| Parametros totales | Varía por submodelo: desde 5 millones hasta 680 millones (y posiblemente más, la tabla se corta en 680m) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors originales) |
| Idiomas soportados | No aplica (el modelo opera sobre secuencias de movimientos de ajedrez, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Los modelos siguen la arquitectura Qwen3, un transformer decoder-only estándar con atención causal. No se han publicado detalles específicos sobre el número de capas, dimensiones de atención o configuración exacta de cada variante, aunque por los tamaños (5m a 680m) se infieren configuraciones compactas típicas de modelos pequeños. El tokenizador es personalizado (se requiere `trust_remote_code=True`) y está diseñado para codificar movimientos de ajedrez en notación algebraica estándar (por ejemplo, "1. d4 Nf6 2. c4 g6").

El entrenamiento se realizó sobre un corpus de partidas de ajedrez tokenizadas, cuyo volumen total asciende a 54 mil millones de tokens según el dataset `pretrain_v1_54B` publicado en Inferix. El estudio de asignación de cómputo explora sistemáticamente combinaciones de tamaño de modelo (5m, 10m, 20m, 32m, 50m, 100m, 200m, 410m, 680m) y cantidad de tokens de preentrenamiento (desde 0.08B hasta 53B), lo que permite trazar curvas de rendimiento en función de ambos ejes. No se aplicaron técnicas de alineación como RLHF o DPO; son modelos base puros entrenados con pérdida de entropía cruzada sobre el siguiente token. Los modelos SFT-thinking (fine-tuning con razonamiento) se publican por separado en `Chess-SFT-Models`.

## Capacidades

- Generación de movimientos de ajedrez: el modelo continúa secuencias de movimientos en notación algebraica, produciendo el siguiente movimiento de forma autoregresiva.
- Comprensión de posiciones: al ser entrenado con secuencias completas de partidas, el modelo codifica representaciones internas de posiciones y tácticas.
- Soporte multi-turno: el benchmark de evaluación (test_B0) mide la capacidad de mantener coherencia a lo largo de varias jugadas.
- Sin capacidades de lenguaje natural: no procesa texto libre, solo secuencias de movimientos.
- Sin tool calling ni funciones de agente: es un modelo puramente generativo para ajedrez.
- Sin visión ni audio: entrada y salida exclusivamente textual (notación de ajedrez).

## Casos de uso

- Análisis de aperturas: el modelo puede generar variantes de apertura para estudiar líneas teóricas. Por ejemplo, dado "1. e4 e5 2. Nf3", sugiere respuestas plausibles según la distribución aprendida de partidas de alto nivel.
- Generación de partidas sintéticas: permite crear grandes volúmenes de partidas artificiales para entrenar otros sistemas (por ejemplo, motores de evaluación o redes neuronales de valoración).
- Estudio de scaling laws: los múltiples puntos de tamaño/tokens permiten a investigadores analizar cómo varía el rendimiento con la asignación de cómputo, útil para diseñar experimentos de preentrenamiento en dominios especializados.
- Fine-tuning para tareas específicas: los modelos base sirven como inicialización para entrenar modelos con razonamiento (SFT-thinking) o para tareas como predicción de resultado, detección de tácticas o clasificación de aperturas.
- Evaluación de arquitecturas: al ser pequeños y rápidos de ejecutar, son ideales para probar variaciones de arquitectura o técnicas de entrenamiento (por ejemplo, diferentes tasas de aprendizaje o schedules) antes de escalar a modelos grandes.
- Aplicaciones educativas: integración en herramientas de enseñanza de ajedrez que sugieren movimientos o explican variantes, ejecutables en hardware de bajo coste.

## Benchmarks y rendimiento

Los autores publican resultados de pass@1 y pass@16 sobre el benchmark multi-turno de ajedrez (test_B0) para cada modelo. La siguiente tabla recoge una selección representativa de la colección completa:

| Modelo | Tamaño | Tokens de preentrenamiento | Pass@1 | Pass@16 |
|---|---|---|---|---|
| model_5m_2.1B | 5m | 2.1B | 11.8% | 52.8% |
| model_20m_53B | 20m | 53B | 40.4% | 86.9% |
| model_50m_41B | 50m | 41B | 55.3% | 93.8% |
| model_100m_40B | 100m | 40B | 61.8% | 94.8% |
| model_200m_40B | 200m | 40B | 67.5% | 95.7% |
| model_410m_26B | 410m | 26B | 66.7% | 94.9% |
| model_680m_12B | 680m | 12B | 60.2%* | 94.0%* |

*Los valores para model_680m_12B se extraen de la tabla truncada en la información proporcionada; el dato de pass@1 es 60.2% y pass@16 94.0% según la fila visible.

La tabla completa con todos los modelos está disponible en la model card de HuggingFace. No se han publicado comparaciones con otros modelos de ajedrez basados en transformers en la información disponible.

## Requisitos de hardware

- Los modelos individuales son muy pequeños (5m a 680m parámetros), por lo que caben en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU con cuantización.
- VRAM estimada: un modelo de 680m en FP32 requiere aproximadamente 2.7 GB; en FP16 o int8, menos de 1.5 GB. Los modelos más pequeños (5m-50m) necesitan menos de 200 MB.
- El repositorio completo ocupa 43.7 GB porque contiene decenas de modelos; se recomienda descargar solo el submodelo necesario mediante `snapshot_download` con `allow_patterns`.
- Despliegue: compatible con Hugging Face Transformers (con `trust_remote_code=True`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, pero al ser modelos estándar de transformers podrían adaptarse.
- Latencia: en GPU consumer, un modelo de 100m genera un movimiento en milisegundos; en CPU, en decenas de milisegundos. No hay datos oficiales de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el dominio del ajedrez con arquitectura transformer y evaluación pública. Existen alternativas tradicionales como Stockfish o Leela Chess Zero, pero no son modelos de lenguaje y no pueden compararse directamente en métricas de generación de secuencias. Por tanto, la comparativa se limita a los propios modelos de la colección, que varían en tamaño y tokens de entrenamiento. No disponible.

## Limitaciones y advertencias

- Modelos base sin fine-tuning: no han sido alineados con instrucciones ni entrenados para razonamiento explícito; su salida es puramente estadística.
- Riesgo de movimientos ilegales: al ser generativos, pueden producir secuencias que violan las reglas del ajedrez (especialmente en modelos pequeños o con pocos tokens de entrenamiento).
- Sin comprensión de lenguaje natural: no entienden preguntas ni comandos en texto libre; solo aceptan secuencias de movimientos en notación algebraica.
- Sesgos de datos: el corpus de entrenamiento no está documentado en cuanto a distribución de niveles de juego, aperturas o periodos históricos; puede reflejar sesgos de las partidas fuente.
- Dependencia de código remoto: el tokenizador personalizado requiere `trust_remote_code=True`, lo que implica ejecutar código no auditado de HuggingFace.
- Limitación de contexto: no se ha publicado la longitud máxima de contexto; es probable que esté limitada a partidas completas o fragmentos largos, pero no se confirma.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los datos de entrenamiento (dataset `pretrain_v1_54B`) no tengan limitaciones adicionales.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/pavelslab-nyu/Chess-Pretrain-Models)
- [Repositorio GitHub pre2post-chess](https://github.com/pavelslab-nyu/pre2post-chess)
- [Dataset de preentrenamiento en Inferix](https://inferix.co/datasets/pavelslab-nyu/pretrain_v1_54B)
- [Modelos SFT-thinking (repositorio hermano)](https://huggingface.co/pavelslab-nyu/Chess-SFT-Models)
- [Paper en arxiv (referencia)](https://arxiv.org/abs/2607.16097)
