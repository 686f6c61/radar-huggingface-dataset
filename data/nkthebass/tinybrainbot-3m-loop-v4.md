# nkthebass/tinybrainbot-3m-loop-v4

## Resumen

TinyBrainBot-3M-Loop-v4 es un modelo de lenguaje experimental de tamaño mínimo (2,96 millones de parámetros reales) desarrollado por el usuario independiente nkthebass y entrenado desde cero. Su rasgo distintivo es la profundidad recurrente: en lugar de almacenar 12 bloques transformer independientes, guarda solo 4 bloques compartidos y los aplica tres veces de forma consecutiva, de modo que cada token atraviesa 12 capas de cómputo con solo 4 capas de pesos. El resultado es un modelo "math-first", optimizado para aritmética de nivel escolar, que destaca especialmente en el benchmark ArithMark-3.0 (91,2 % de acc_norm).

El modelo se entrenó sobre 8,5B de tokens con una mezcla de datasets públicos (FineWeb-Edu, Cosmopedia, TinyStories y Wikipedia) y presenta innovaciones técnicas notables para su tamaño: un tokenizador de dígitos "units-first" con embeddings de posición decimal, embeddings factorizados y un número de bucles ajustable en inferencia. Es relevante como prueba de concepto de que la reutilización de capas (looped transformer) puede competir en tareas aritméticas frente a modelos densos de tamaño comparable.

No es un modelo de uso general: su vocabulario es de solo 4.104 tokens, está entrenado en inglés y sus resultados en benchmarks de conocimiento y sentido común son cercanos al azar. Su valor está en la investigación sobre arquitecturas recurrentes y en tareas aritméticas muy acotadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con profundidad recurrente (looped transformer): 4 bloques compartidos aplicados 3 veces (12 capas efectivas) |
| Parametros totales | 2.964.480 (dato real de safetensors) |
| Parametros activos | No aplicable (no es MoE); todos los parámetros son activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los benchmarks se ejecutaron en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura emplea 4 bloques transformer compartidos de anchura 256, con 4 cabezas de atención de 64 dimensiones y 2 cabezas KV (GQA), activación SwiGLU de 560 dimensiones, RoPE y RMSNorm. Cada bloque se aplica 3 veces por token; en cada pasada se añade un embedding de bucle aprendido y una copia gated del embedding de entrada. Durante el entrenamiento se muestreó un número variable de bucles (2 a 4) por paso, y en inferencia el número de bucles es configurable mediante `model.model.eval_loops` (3 es el valor óptimo según el autor). Además, usa un embedding factorizado: un vocabulario de 4.104 tokens con embeddings de 96 dimensiones proyectados a 256 (y de vuelta antes de la capa de salida ligada), lo que libera unos 630k parámetros que se destinan al cuarto bloque.

Un elemento clave es el tokenizador numérico "units-first": cada número se escribe como un token de longitud seguido de sus dígitos, de menor posición significativa a mayor, acompañado de un embedding que indica la posición decimal de cada dígito. El entrenamiento se realizó en dos etapas sobre 8,5B de tokens en total: la etapa 1 (4,46B de tokens) corresponde a la ejecución previa del modelo TinyBrainBot-3M-Loop (la model card se corta en este punto, por lo que no hay más detalle disponible sobre la etapa 2 ni sobre el uso de RLHF/DPO). Los datasets empleados incluyen HuggingFaceFW/fineweb-edu, HuggingFaceTB/cosmopedia, roneneldan/TinyStories y wikimedia/wikipedia.

## Capacidades

- Generación de texto en inglés a nivel básico, con calidad limitada por su tamaño (2,96M de parámetros) y vocabulario de 4.104 tokens.
- Aritmética de nivel escolar: sumas, restas, multiplicaciones y expresiones con precedencia de operadores, tanto en lenguaje natural como en expresiones "desnudas" (99,7 % en ArithMark-3 con ecuaciones bare).
- Generalización aritmética a formatos no vistos: números grandes de 4-6 dígitos, separadores de miles ("74,986"), cantidades monetarias ("$70.67"), números negativos y espaciado inusual.
- Temas escolares adicionales: restos (módulo), conversión de unidades, porcentajes, redondeo, números que faltan en secuencias y comparaciones.
- Número de bucles ajustable en inferencia (2 a 4), lo que permite intercambiar cómputo por calidad de salida sin cambiar los pesos.
- No disponible: tool calling / function calling, soporte de agentes, capacidades de visión o audio, y razonamiento multi-paso tipo "thinking mode".

## Casos de uso

- Investigación en arquitecturas recurrentes: es un banco de pruebas ideal para estudiar looped transformers y profundidad recurrente, dado que el número de bucles es ajustable en inferencia y los pesos son públicos bajo Apache-2.0.
- Docencia y aprendizaje de ML: con menos de 3M de parámetros, se puede entrenar, inspeccionar y depurar en hardware mínimo, lo que lo hace adecuado para cursos y tutoriales sobre cómo funcionan los transformers internamente.
- Calculadora aritmética embebida: puede resolver expresiones aritméticas en texto plano (99,7 % en ecuaciones bare) en dispositivos sin GPU, útil como componente ligero de parseo y cálculo en sistemas embebidos.
- Generación de problemas y corrección de matemáticas escolares: cubre restos, porcentajes, redondeo, conversiones de unidades y comparaciones, apto para herramientas educativas de primaria en inglés.
- Pruebas de tokenización numérica: su tokenizador "units-first" con embeddings de posición decimal es un ejemplo de referencia para investigar cómo representar números en LLM pequeños.
- Baseline para leaderboards de modelos pequeños: sirve como punto de comparación de tamaño similar (3M) frente a otros SLM en benchmarks estandarizados como ARC, HellaSwag y PIQA.
- Experimentos de cómputo adaptativo: al poder variar el número de bucles por inferencia, permite medir la relación entre profundidad efectiva y precisión sin reentrenar.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, acc_norm, medidos con lm-eval 0.4.13 en float32 para HellaSwag, ARC y PIQA, y con el script oficial `bencharithmark-3.py` en float32 para ArithMark-3.0; no verificados por terceros):

| Benchmark | acc_norm | raw acc |
|---|--:|--:|
| Open SLM Leaderboard Intelligence Index | 19,36 | 19,69 |
| HellaSwag | 27,17 | 26,92 |
| ARC-Easy | 31,31 | 32,15 |
| ARC-Challenge | 22,70 | 17,92 |
| PIQA | 53,86 | 55,82 |
| ArithMark-3.0 | 91,2 | 91,5 |

Comparativa del autor en la familia ArithMark (todos 0-shot, medidos con el mismo scoring):

| Modelo | Params | ArithMark-3 | AM3, palabras | AM3, ecuaciones bare | ArithMark-2 | ArithMark-1 |
|---|--:|--:|--:|--:|--:|--:|
| TinyBrainBot-3M-Loop-v4 | 2,96M | 91,2 | 57,3 | 99,7 | 81,3 | 38,7 |
| TinyBrainBot-3M-Loop-v3 | 2,96M | 91,6 | 53,9 | 97,3 | 83,9 | 35,8 |
| Inferno-Exp-1.7 | 394M | 85,9 | 59,1 | 86,9 | 59,9 | 47,9 |
| Pascaline-3M | 3M | 69,2 | 27,6 | 99,7 | 66,5 | 36,2 |
| SmolLM2-135M | 135M | 38,8 | 34,2 | 38,6 | 33,2 | 33,1 |
| GPT-S3-3M | 2,97M | 38,9 | 25,8 | 36,2 | 31,0 | 31,1 |

Nota: ArithMark-1 evalúa expresiones estrictamente de izquierda a derecha, mientras que este modelo aplica precedencia de operadores estándar, por lo que puntúa bajo en ese benchmark concreto (71 % en su etapa de dos operandos).

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con ~3M de parámetros en float32 el modelo ocupa alrededor de 12 MB de memoria, por lo que cabe con holgura en cualquier GPU o incluso solo en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU moderna sirve. No hay datos de latencia ni throughput publicados.
- Consumer GPUs: cabe en cualquier tarjeta, desde una GTX 1050 hasta una RTX 4090, con un uso de VRAM insignificante. La inferencia en CPU es perfectamente viable.
- Opciones de despliegue: biblioteca `transformers` de Hugging Face con `custom_code` habilitado (la model card lo etiqueta como `custom_code`, necesario para la lógica de bucles recurrentes). No hay evidencia de soporte directo en vLLM, llama.cpp, Ollama o TGI; dado el código personalizado y el vocabulario propio, lo más fiable es usar transformers directamente.
- Al ser un modelo experimental con código personalizado, conviene ejecutarlo en un entorno controlado (`trust_remote_code=True`) y revisar el código de modelado antes de desplegarlo.

## Comparativa con modelos similares

| Modelo | Params | Arquitectura | ArithMark-3 | Contexto | Licencia |
|---|--:|---|--:|---|---|
| TinyBrainBot-3M-Loop-v4 | 2,96M | Looped transformer (4 bloques x 3 bucles) | 91,2 | No disponible | Apache-2.0 |
| Pascaline-3M | 3M | No disponible | 69,2 | No disponible | No disponible |
| GPT-S3-3M | 2,97M | No disponible | 38,9 | No disponible | No disponible |
| SmolLM2-135M | 135M | Transformer denso | 38,8 | No disponible | No disponible |

Frente a alternativas de tamaño comparable, TinyBrainBot-3M-Loop-v4 domina claramente en aritmética (91,2 frente a 69,2 de Pascaline-3M y 38,9 de GPT-S3-3M), incluida la generalización a números grandes, separadores de miles y dinero, donde las versiones anteriores estaban cerca del azar. Sin embargo, en benchmarks generales (ARC, HellaSwag, PIQA) sus puntuaciones son bajas, y modelos mayores como SmolLM2-135M, pese a ser 45 veces más pequeños en comparación inversa, no son rivales directos en aritmética pero sí en uso general del lenguaje. Los datos de contexto, licencia y disponibilidad de los modelos alternativos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento general muy bajo: 19,36 en el Intelligence Index del Open SLM Leaderboard, con resultados cercanos al azar en HellaSwag (27,17) y ARC-Challenge (22,70). No es apto para uso general.
- Vocabulario de solo 4.104 tokens e idioma limitado al inglés; no hay soporte declarado para castellano ni otras lenguas.
- Riesgo alto de alucinación y de generación incoherente fuera de su dominio de entrenamiento (aritmética escolar y texto simple tipo TinyStories).
- Sesgos: al entrenarse sobre Wikipedia, FineWeb-Edu y Cosmopedia, puede heredar los sesgos de estos corpus, aunque su tamaño reduce el alcance de este problema.
- Los benchmarks son autodeclarados por el autor y no verificados ("verified: false"); ArithMark-3.0 se evaluó además en el split de entrenamiento, lo que introduce riesgo de contaminación en ese resultado concreto.
- Requiere `custom_code` en transformers (`trust_remote_code=True`), lo que implica ejecutar código de terceros en producción; revisar el código de modelado antes de usarlo.
- Sin datos publicados sobre longitud de contexto, cuantización, latencia ni throughput; cualquier despliegue exigirá validación propia.
- La licencia Apache-2.0 permite uso comercial sin restricciones relevantes, pero el tamaño y las capacidades del modelo limitan su utilidad práctica en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkthebass/tinybrainbot-3m-loop-v4
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
  - https://huggingface.co/datasets/roneneldan/TinyStories
  - https://huggingface.co/datasets/wikimedia/wikipedia
- Benchmarks referenciados:
  - https://huggingface.co/datasets/allenai/ai2_arc
  - https://huggingface.co/datasets/Rowan/hellaswag
  - https://huggingface.co/datasets/ybisk/piqa
- Paper, repositorio de código y demos: no disponible
