# pavelslab-nyu/Chess-SFT-Models

## Resumen

Chess-SFT-Models es una colección de modelos de lenguaje especializados en ajedrez, desarrollada por pavelslab-nyu como parte de un estudio sobre la asignación de cómputo en preentrenamiento (compute-allocation). Los modelos se basan en la arquitectura Qwen3 y se ajustan mediante supervisión fina (SFT) con un modo de razonamiento explícito ("thinking") que genera cadenas de pensamiento antes de producir el movimiento. El repositorio contiene decenas de variantes que van desde 20 millones hasta 680 millones de parámetros, cada una preentrenada con una cantidad distinta de tokens (de 0,08B a 53B), lo que permite analizar cómo el volumen de preentrenamiento afecta al rendimiento en una tarea concreta.

El objetivo principal es investigar la relación entre el tamaño del modelo, la cantidad de datos de preentrenamiento y la capacidad de razonamiento en un dominio restringido como el ajedrez. Para ello, los autores publican un benchmark multi-turno (test_B0) con métricas pass@1 y pass@16. El modelo más grande y mejor entrenado, `model_680m_32B`, alcanza un 85,3% de pass@1 y un 100% de pass@16, lo que demuestra que con suficiente cómputo incluso modelos pequeños pueden resolver tareas complejas de razonamiento secuencial. Todos los pesos se distribuyen bajo licencia MIT, lo que facilita su uso tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 (según tags del repositorio) |
| Parametros totales | Familia de modelos: 20M, 32M, 50M, 100M, 200M, 410M y 680M (ver tabla de modelos) |
| Parametros activos | No aplica (modelos densos, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, no especificado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los modelos se basan en la arquitectura Qwen3, aunque no se detallan las modificaciones específicas. Cada variante se preentrena con una cantidad determinada de tokens (desde 0,08B hasta 53B) y posteriormente se ajusta mediante SFT con un enfoque "thinking": el modelo aprende a generar una cadena de razonamiento (rollout) antes de emitir el movimiento final. Para ello se utiliza un tokenizador personalizado que incorpora un token especial `<T>` que indica al modelo el inicio de su proceso de razonamiento. El entrenamiento se apoya en Stockfish para etiquetar árboles de búsqueda, y el pipeline incluye generación de cadenas de pensamiento basadas en política del modelo o en política aleatoria/Stockfish (esta última solo requiere CPU). No se especifica el uso de RLHF o DPO; el ajuste es puramente supervisado.

## Capacidades

- Generación de secuencias de movimientos de ajedrez con razonamiento explícito (modo thinking).
- Soporte de conversaciones multi-turno en partidas de ajedrez (evaluado con el benchmark test_B0).
- Capacidad de análisis posicional y táctico limitado al dominio del ajedrez.
- No dispone de tool calling, ni capacidades de visión, audio o generación de código general.
- No es un modelo multilingüe; su vocabulario y entrenamiento están orientados a notación de ajedrez y razonamiento secuencial.

## Casos de uso

- Análisis de partidas de ajedrez: el modelo puede generar variantes y explicaciones razonadas de movimientos, útil para entrenadores y aficionados que quieran entender las decisiones tácticas y estratégicas en una posición dada.
- Entrenamiento de jugadores: sirve como sparring de bajo coste que sugiere líneas de juego y razona sobre ellas, permitiendo practicar aperturas, medio juego y finales sin necesidad de un motor tradicional.
- Investigación en IA para juegos: al ser una familia de modelos con diferentes tamaños y volúmenes de preentrenamiento, es un banco de pruebas ideal para estudiar la relación entre escala de cómputo y rendimiento en tareas de razonamiento secuencial.
- Generación de aperturas y repertorios: puede usarse para explorar variantes de apertura y generar líneas novedosas, combinando su razonamiento con herramientas de validación como Stockfish.
- Evaluación de posiciones: el modelo puede clasificar posiciones como favorables o desfavorables y justificar su evaluación, sirviendo como heurística rápida en pipelines de análisis automático.
- Benchmarking de razonamiento en dominios restringidos: investigadores pueden utilizar este conjunto de modelos como referencia para comparar metodologías de SFT, asignación de cómputo y generación de cadenas de pensamiento en entornos con reglas claras.

## Benchmarks y rendimiento

Los autores publican resultados en el benchmark multi-turno de ajedrez test_B0, con métricas pass@1 y pass@16 para cada variante. A continuación se muestran los resultados más representativos por tamaño de modelo (los valores corresponden a la variante con mayor pass@1 dentro de cada familia):

| Modelo | Tamaño | Tokens de preentrenamiento | pass@1 | pass@16 |
|---|---|---|---|---|
| model_20m_21B | 20M | 21B | 37,8% | 93,2% |
| model_50m_17B | 50M | 17B | 62,5% | 98,9% |
| model_100m_8.0B | 100M | 8,0B | 64,6% | 100,0% |
| model_200m_53B | 200M | 53B | 77,2% | 99,6% |
| model_680m_32B | 680M | 32B | 85,3% | 100,0% |

No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Los modelos más grandes (680M parámetros) requieren aproximadamente 2,7 GB en fp32 y 1,4 GB en fp16, por lo que caben en cualquier GPU consumer con al menos 4 GB de VRAM.
- Los modelos de 200M y menores pueden ejecutarse incluso en CPU con razonable velocidad, aunque para inferencia interactiva se recomienda una GPU modesta (GTX 1660, RTX 3050 o superior).
- El repositorio completo pesa 44,8 GB, pero cada modelo individual se puede descargar por separado mediante `snapshot_download`.
- El despliegue se realiza con la librería `transformers` usando `trust_remote_code=True` debido al tokenizador personalizado. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Para el entrenamiento o fine-tuning adicional se requiere al menos 1 GPU; la generación de cadenas de pensamiento con política aleatoria o Stockfish puede hacerse solo con CPU.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de ajedrez basados en LLM con los que comparar directamente. Los modelos más conocidos en el dominio (Leela Chess Zero, Stockfish) no son LLMs y no utilizan razonamiento en lenguaje natural, por lo que una comparativa cuantitativa no es significativa. Dentro de la propia familia, se observa que el rendimiento mejora con el tamaño y con los tokens de preentrenamiento, pero con rendimientos decrecientes a partir de ciertos umbrales (por ejemplo, en la familia de 680M, pasar de 24B a 32B tokens mejora solo 1,3 puntos en pass@1).

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ajedrez; no es útil para tareas generales de lenguaje.
- El tokenizador personalizado requiere `trust_remote_code=True`, lo que implica ejecutar código remoto y supone un riesgo de seguridad si no se audita previamente.
- El rendimiento está medido únicamente en el benchmark test_B0; no hay garantía de generalización a otras posiciones o estilos de juego.
- Los modelos pueden presentar alucinaciones en sus razonamientos, especialmente en posiciones complejas o poco comunes, produciendo justificaciones plausibles pero incorrectas.
- No se especifica la longitud máxima de contexto, por lo que partidas muy largas podrían exceder la ventana del modelo.
- Aunque la licencia es MIT, el uso comercial no está restringido, pero se recomienda validar el comportamiento en producción antes de integrarlo en herramientas de pago.
- No se proporcionan datos sobre sesgos o limitaciones idiomáticas; el modelo solo entiende notación de ajedrez y posiblemente inglés básico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pavelslab-nyu/Chess-SFT-Models
- Repositorio GitHub (pre2post-chess): https://github.com/pavelslab-nyu/pre2post-chess
- Colección Pre2Post-Chess en HuggingFace: https://huggingface.co/collections/pavelslab-nyu/pre2post-chess
