# nkthebass/tinybrainbot-3m-loop-v2

## Resumen

TinyBrainBot-3M-Loop-v2 es un modelo lingüístico extremadamente pequeño (2,96 millones de parámetros) desarrollado por el usuario nkthebass y entrenado desde cero. Su rasgo distintivo es el uso de profundidad recurrente: en lugar de almacenar 12 capas de transformer independientes, guarda solo 4 bloques que se ejecutan tres veces en bucle, de modo que cada token atraviesa 12 capas de cómputo con solo 4 capas de pesos. Esto permite maximizar la profundidad efectiva con un presupuesto de parámetros mínimo.

El modelo está orientado a la aritmética ("math-first"): su entrenamiento incluye un 20 % de problemas aritméticos en formato de historia, generados y verificados programáticamente, y su tokenizer trata los números de forma especial (dígitos de menor a mayor posición con embeddings de posición decimal). Frente a su predecesor TinyBrainBot-3M-Loop, esta versión generaliza la aritmética a expresiones desnudas, orden de operaciones y números escritos con palabras, no solo a problemas narrados.

Es relevante como demostración de que los transformers con bucle recurrente pueden alcanzar competencias aritméticas notables en tamaños donde los modelos densos convencionales de millones de parámetros fallan por completo. Está entrenado en inglés, publicado bajo licencia Apache 2.0 y usa safetensors con código personalizado en la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con profundidad recurrente (looped transformer): 4 bloques compartidos ejecutados 3 veces |
| Parametros totales | 2.964.480 (≈2,96 M) |
| Parametros activos | 2,96 M (no es MoE; los 4 bloques se reutilizan en cada pasada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los benchmarks oficiales se evaluaron en float32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code en transformers) |

## Arquitectura y entrenamiento

La arquitectura emplea 4 bloques de transformer compartidos de anchura 256, con 4 cabezas de atención de 64 dimensiones y 2 cabezas KV (agrupación de KV, tipo GQA), activación SwiGLU de 560 unidades, RoPE y RMSNorm. Cada bloque se aplica 3 veces: en cada pasada se añade un embedding de bucle aprendido y una copia gated del embedding de entrada. Durante el entrenamiento se muestreó entre 2 y 4 bucles por paso, y en inferencia el número de bucles es configurable (por ejemplo, `model.model.eval_loops = 4`), siendo 3 el valor óptimo según el autor. Además, usa embedding factorizado: un vocabulario de 4.104 tokens con embeddings de 96 dimensiones proyectados a 256 (y de vuelta antes de la capa de salida ligada), lo que libera unos 630.000 parámetros para el cuarto bloque. El tokenizer numérico escribe cada número como un token de longitud más sus dígitos, de la unidad hacia arriba, con un embedding de posición decimal por dígito.

El entrenamiento total fue de 6.000 millones de tokens. La etapa 1 (4,46 B tokens) reutiliza la ejecución del modelo anterior hasta el inicio del decaimiento del learning rate, con esta composición: 25 % de preguntas y respuestas destiladas y hechos cortos, 20 % de aritmética (unos 150.000 enunciados de problemas narrados generados por ling-3.0-flash y Mistral-Small-3.2, verificados resolviéndolos y con números y respuestas rellenados por Python, más generadores propios de relaciones "más/menos que" y de historias), 15 % de libros de texto sintéticos (Cosmopedia, Stanford y OpenStax), 15 % de historias (TinyStories), 10 % de sentido común (Cosmopedia WikiHow y prosa propia) y 10 % de web (FineWeb). La model card menciona una etapa 2 adicional, pero su descripción detallada no está incluida en la información disponible. No se ha indicado el uso de RLHF ni DPO.

## Capacidades

- Generación de texto en inglés a nivel básico, con entrenamiento sobre historias (TinyStories), libros de texto sintéticos (Cosmopedia) y contenido web educativo (FineWeb-Edu).
- Aritmética: resolución de problemas en formato de historia, expresiones aritméticas desnudas, orden de operaciones (precedencia de operadores) y números escritos con palabras (55,0 % de precisión en la variante de números en palabras de ArithMark-3).
- Razonamiento de sentido común a escala muy reducida (54,79 % en PIQA), muy por encima del azar pero lejos de modelos mayores.
- No soporta tool calling ni function calling (es un modelo base, sin instrucción).
- No está diseñado para agentes ni razonamiento multi-paso de propósito general.
- Sin capacidades de visión, audio ni modo de pensamiento explícito (thinking mode).
- Profundidad de inferencia configurable: el número de bucles puede ajustarse en tiempo de ejecución (`model.model.eval_loops`), un compromiso entre cómputo y calidad.

## Casos de uso

- Investigación en arquitecturas recurrentes: es un punto de partida ideal para experimentar con looped transformers, ajustar el número de bucles en inferencia y estudiar cómo la profundidad recurrente afecta al cómputo por token.
- Enseñanza de LLM desde cero: con menos de 3 M de parámetros, se puede entrenar, afinar y analizar en hardware modesto, siendo útil como material didáctico en cursos sobre transformers.
- Aritmética embebida en dispositivos con recursos mínimos: su tokenizer numérico especializado y su precisión del 96,8 % en expresiones desnudas lo hacen apto para evaluar operaciones aritméticas simples en microcontroladores o scripts ligeros.
- Generación de problemas aritméticos narrados: dado su entrenamiento intensivo con problemas en formato de historia verificados programáticamente, puede usarse para generar o completar enunciados de ejercicios de matemáticas elementales en inglés.
- Generación de micro-historias: gracias a TinyStories en su mezcla de datos, puede producir relatos cortos de complejidad limitada para pruebas de juguete o prototipos.
- Benchmarking comparativo de modelos diminutos: forma parte de un ecosistema de comparación (ArithMark-1/2/3, SmolLM2-135M, GPT-S3-3M) útil para evaluar técnicas de eficiencia de parámetros.
- Prototipado de pipelines de text-generation con transformers: su integración con la librería transformers y safetensors permite probar el ciclo completo de carga, inferencia y evaluación con lm-eval en minutos.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, acc_norm, evaluados con lm-eval 0.4.13 en float32 para HellaSwag, ARC y PIQA, y con el script oficial en float32 para ArithMark-3.0):

| Benchmark | acc_norm | acc bruta |
|---|--:|--:|
| Open SLM Leaderboard Intelligence Index | 20,15 | 19,91 |
| HellaSwag | 27,17 | 27,01 |
| ARC-Easy | 33,46 | 33,59 |
| ARC-Challenge | 22,78 | 18,17 |
| PIQA | 54,79 | 55,98 |
| ArithMark-3.0 | 90,7 | 90,6 |

Comparativa declarada por el autor en las variantes de ArithMark (0-shot, log-likelihood):

| Modelo | Params | ArithMark-3 | AM3 números en palabras | AM3 ecuaciones desnudas | ArithMark-2 | ArithMark-1 | Historias held-out |
|---|--:|--:|--:|--:|--:|--:|--:|
| TinyBrainBot-3M-Loop-v2 | 2,96 M | 90,7 | 55,0 | 96,8 | 83,8 | 36,1 | 80,1 |
| TinyBrainBot-3M-Loop | 2,96 M | 89,3 | 27,3 | 88,2 | 58,1 | 29,4 | 81,0 |
| Inferno-Exp-1.7 | 394 M | 85,9 | 59,1 | 86,9 | 59,9 | 47,9 | 74,0 |
| Pascaline-3M | 3 M | 69,2 | 27,6 | 99,7 | 66,5 | 36,2 | 43,0 |
| SmolLM2-135M | 135 M | 38,8 | 34,2 | 38,6 | 33,2 | 33,1 | 34,7 |
| GPT-S3-3M | 2,97 M | 38,9 | 25,8 | 36,2 | 31,0 | 31,1 | 34,6 |

Notas del autor: ArithMark-1 evalúa expresiones estrictamente de izquierda a derecha, mientras que este modelo respeta la precedencia de operadores, por lo que puntúa más bajo en sus expresiones largas (62 % en la etapa de dos operandos, decreciendo con cada operador adicional). Los resultados del model-index no están verificados por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,96 M de parámetros en float32, los pesos ocupan unos 12 MB; en float16, unos 6 MB. Cualquier GPU moderna, e incluso CPU, es más que suficiente.
- GPU recomendadas: no es necesario hardware dedicado; cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) o incluso solo CPU ejecuta el modelo sin problema.
- Cabe sobradamente en cualquier GPU consumer y en la mayoría de CPUs; no requiere acelerador.
- Opciones de despliegue: librería transformers (requisito, ya que usa custom_code); no hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama o TGI, y su tokenizer y arquitectura personalizados hacen improbable que funcione fuera de transformers sin adaptación.
- Latencia y throughput: no disponible; por su tamaño, la inferencia será rápida incluso en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | ArithMark-3 | HellaSwag | Licencia | Disponibilidad |
|---|--:|---|--:|--:|---|---|
| TinyBrainBot-3M-Loop-v2 | 2,96 M | Transformer recurrente (4 blocles x 3 bucles) | 90,7 | 27,17 | Apache 2.0 | Hugging Face, safetensors |
| TinyBrainBot-3M-Loop (v1) | 2,96 M | Transformer recurrente | 89,3 | no disponible | Apache 2.0 | Hugging Face, safetensors |
| SmolLM2-135M | 135 M | Transformer denso | 38,8 | no disponible (en esta ficha) | Apache 2.0 | Hugging Face, amplio soporte de herramientas |
| Pascaline-3M | 3 M | no disponible | 69,2 | no disponible | no disponible | no disponible |

En su categoría de peso (≈3 M), TinyBrainBot-3M-Loop-v2 destaca claramente en aritmética frente a alternativas densas de tamaño comparable (GPT-S3-3M: 38,9 en ArithMark-3), aunque SmolLM2-135M, pese a ser 45 veces mayor en parámetros, también queda muy por detrás en esa tarea (38,8). En benchmarks generales como HellaSwag o ARC, el rendimiento de este modelo es muy bajo, como cabe esperar de su tamaño.

## Limitaciones y advertencias

- Rendimiento general muy limitado: 20,15 en el Intelligence Index del Open SLM Leaderboard indica capacidades de lenguaje y razonamiento mínimas; no es apto para asistentes, chat ni tareas de propósito general.
- Alto riesgo de alucinación y de generación incoherente, inherente a un modelo de 3 M de parámetros entrenado desde cero.
- Sesgos: entrenado sobre FineWeb-Edu, Wikipedia, TinyStories y datos sintéticos generados por otros LLM (ling-3.0-flash, Mistral-Small-3.2, y problemas held-out escritos por Gemma-3-27B y Llama-3.3-70B para evaluación), por lo que puede heredar sesgos de esos corpus y de los modelos generadores; no se ha documentado un análisis de sesgos.
- Limitado al inglés; no hay soporte multilingüe declarado.
- Longitud de contexto no documentada; el vocabulario de solo 4.104 tokens restringe la cobertura léxica.
- Puntuación anómala en ArithMark-1 (36,1): el modelo respeta la precedencia de operadores, mientras que la clave de ese benchmark evalúa de izquierda a derecha, lo que penaliza expresiones largas; hay que interpretar ese resultado con cuidado.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- Requiere custom_code en transformers, lo que implica ejecutar código del autor y puede romperse con futuras versiones de la librería; los resultados del model-index no están verificados independientemente.
- Descargas modestas (483) y sin likes: comunidad y soporte muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-3m-loop-v2
- Modelo predecesor: https://huggingface.co/nkthebass/tinybrainbot-3m-loop
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
  - https://huggingface.co/datasets/roneneldan/TinyStories
  - https://huggingface.co/datasets/wikimedia/wikipedia
- Benchmarks referenciados:
  - https://huggingface.co/datasets/allenai/ai2_arc
  - https://huggingface.co/datasets/Rowan/hellaswag
  - https://huggingface.co/datasets/ybisk/piqa
  - https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0
- Paper, repositorio de código y demos: no disponibles en la información proporcionada.
