# nkthebass/tinybrainbot-3m-loop-v3

## Resumen

TinyBrainBot-3M-Loop-v3 es un modelo lingüístico experimental de tamaño minúsculo (2,96 millones de parámetros reales según los pesos en safetensors), entrenado desde cero por el autor independiente nkthebass. Su rasgo distintivo es el uso de **profundidad recurrente** (looped transformer): 4 bloques transformer que se aplican 3 veces por token, de modo que cada token atraviesa 12 capas de cómputo mientras solo se almacenan 4 capas de pesos. El modelo está orientado prioritariamente a la aritmética y el razonamiento numérico.

El problema que aborda es el de obtener capacidades aritméticas sólidas con un presupuesto de parámetros mínimo, un reto clásico de los modelos de pocos millones de parámetros, que suelen fallar estrepitosamente en cálculo. Según su autor, el modelo generaliza más allá de los problemas aritméticos en formato de historia: maneja expresiones desnudas, precedencia de operadores, números escritos en palabras, cifras grandes, separadores de miles y cantidades monetarias.

Se entrenó desde cero sobre 6,5 mil millones de tokens con datasets públicos (FineWeb-Edu, Cosmopedia, TinyStories, Wikipedia). Es relevante como prueba de concepto de arquitecturas recurrentes en profundidad y como referencia en la categoría de modelos ultra pequeños, aunque su rendimiento en tareas generales de lenguaje es muy limitado (índice de inteligencia del Open SLM Leaderboard: 19,44).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con profundidad recurrente (4 bloques compartidos aplicados 3 veces, looped transformer) |
| Parametros totales | 2.964.480 (2,96 M) |
| Parametros activos | 2.964.480 (no es MoE; los pesos se reutilizan por bucle, no hay expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los benchmarks se ejecutaron en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura emplea 4 bloques transformer compartidos de anchura 256, con 4 cabezas de atención de 64 dimensiones y 2 cabezas KV (GQA), activación SwiGLU de 560 dimensiones, RoPE y RMSNorm. Cada bloque se aplica 3 veces por token: en cada pasada se añade un *loop embedding* aprendido y una copia gating de la incrustación de entrada. Durante el entrenamiento se muestreaba aleatoriamente entre 2 y 4 bucles por paso, y el número de bucles puede ajustarse en inferencia (`model.model.eval_loops = 4`), aunque 3 es el valor óptimo según el autor. La incrustación está factorizada: un vocabulario de 4.104 tokens usa embeddings de 96 dimensiones proyectados a 256, lo que libera unos 630.000 parámetros para el cuarto bloque.

Un elemento clave es el tokenizador numérico: escribe cada número como un token de longitud seguido de sus dígitos ordenados desde la unidad (units-first), con un *digit-place embedding* que indica la posición de cada dígito. Esto explica la notable capacidad aritmética del modelo pese a su tamaño.

El entrenamiento constó de al menos dos etapas sobre 6,5 mil millones de tokens en total. La etapa 1 (4,46 mil millones de tokens) corresponde a la ejecución previa del TinyBrainBot-3M-Loop hasta el inicio del decaimiento del learning rate, con datasets que incluyen HuggingFaceFW/fineweb-edu, HuggingFaceTB/cosmopedia, roneneldan/TinyStories y wikimedia/wikipedia. Los detalles de la etapa 2, así como el uso de RLHF o DPO, no están disponibles en la información proporcionada (no consta ningún ajuste por preferencias).

## Capacidades

- Generación de texto en inglés, con calidad limitada por su tamaño minúsculo (2,96 M de parámetros).
- Aritmética: sumas y restas con números de 4-6 dígitos, precedencia de operadores, números escritos en palabras, separadores de miles y cantidades monetarias ("$70.67").
- Resolución de problemas aritméticos en formato de historia (word problems) y en expresiones desnudas ("14 * -17 + -1 * -18").
- Comprensión de lenguaje simple, heredada del entrenamiento con TinyStories y FineWeb-Edu, aunque con puntuaciones bajas en benchmarks generales.
- Ajuste dinámico de la profundidad de cómputo en inferencia modificando el número de bucles (`eval_loops`), un rasgo peculiar de la arquitectura recurrente.
- No hay información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: no disponible.
- Modelo base (tag `base`): no está alineado ni instruido para chat.

## Casos de uso

- Investigación en arquitecturas recurrentes: es un banco de pruebas ideal para estudiar looped transformers y profundidad recurrente, dado que los pesos y la configuración de bucles están documentados y son modificables en inferencia.
- Experimentación con tokenizadores numéricos: el esquema units-first con digit-place embeddings es un ejemplo práctico de cómo dotar de capacidad aritmética a modelos diminutos, útil como referencia para otros proyectos.
- Aritmética embebida en dispositivos de recursos mínimos: con menos de 3 millones de parámetros puede ejecutarse en microcontroladores o móviles para calcular sumas y restas sin conexión ni servidor.
- Educación y herramientas didácticas: puede servir como componente de demostraciones sobre cómo los modelos aprenden aritmética, o para generar y verificar problemas matemáticos sencillos en inglés.
- Baseline para comparativas de modelos pequeños: sus resultados en ARC, HellaSwag, PIQA y ArithMark ofrecen un punto de referencia para evaluar nuevos modelos de la gama de 1-10 M de parámetros.
- Prototipado rápido de pipelines de texto: su tamaño permite iterar preprocesamiento, tokenización y evaluación con lm-eval en hardware muy modesto o en CPU.
- Generación de historias simples al estilo TinyStories: el entrenamiento incluye ese corpus, por lo que puede producir narraciones infantiles de gramática básica, con calidad limitada.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, acc_norm, no verificados):

| Benchmark | acc_norm | acc (raw) |
|---|--:|--:|
| Open SLM Leaderboard Intelligence Index | 19,44 | 19,92 |
| HellaSwag | 27,04 | 26,88 |
| ARC-Easy | 31,86 | 32,91 |
| ARC-Challenge | 22,01 | 18,17 |
| PIQA | 53,97 | 55,88 |
| ArithMark-3.0 | 91,6 | 91,6 |

Evaluaciones con lm-eval 0.4.13 en float32 (HellaSwag, ARC, PIQA) y el script oficial `bencharithmark-3.py` (ArithMark-3.0). Comparativa del autor en ArithMark-3.0 y variantes:

| Modelo | Params | ArithMark-3 | AM3 palabras | AM3 ecuaciones | ArithMark-2 | Historias held-out | Números grandes | Comas | Dinero |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| TinyBrainBot-3M-Loop-v3 | 2,96 M | 91,6 | 53,9 | 97,3 | 83,9 | 88,4 | 93,1 | 91,4 | 93,7 |
| TinyBrainBot-3M-Loop-v2 | 2,96 M | 90,7 | 55,0 | 96,8 | 83,8 | 80,1 | 45,3 | 39,0 | 40,0 |
| Inferno-Exp-1.7 | 394 M | 85,9 | 59,1 | 86,9 | 59,9 | 74,0 | 62,7 | 74,4 | 70,8 |
| Pascaline-3M | 3 M | 69,2 | 27,6 | 99,7 | 66,5 | 43,0 | 39,9 | 37,8 | 42,3 |
| SmolLM2-135M | 135 M | 38,8 | 34,2 | 38,6 | 33,2 | 34,7 | 37,4 | 39,5 | 38,6 |

Cabe destacar que el modelo puntúa por debajo del azar esperable en ArithMark-1 (35,8) porque ese benchmark evalúa expresiones de izquierda a derecha sin precedencia de operadores, mientras que este modelo aplica precedencia estándar (61 % en su etapa de dos operandos, decreciendo con cada operador adicional).

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; con 2,96 M de parámetros en float32 ocupa unos 12 MB, y en float16 unos 6 MB. Cabe con holgura en cualquier GPU o incluso solo en CPU y RAM.
- GPU recomendadas: ninguna GPU dedicada es necesaria; cualquier GPU moderna sirve. Para entrenamiento o reentrenamiento experimental, una GPU de gama media con 8-16 GB (RTX 3060/4060 o superior) debería bastar, aunque no hay datos oficiales.
- Consumer GPUs: cabe sobradamente en cualquier GPU de consumo, incluidas integradas; también funciona en CPU sin problemas por su tamaño.
- Opciones de despliegue: biblioteca `transformers` de Hugging Face con `custom_code` habilitado (requerido por la arquitectura recurrente). No consta soporte en vLLM, llama.cpp, Ollama ni TGI; no disponible en la información proporcionada.
- Latencia y throughput: no disponibles; por su tamaño minúsculo cabe esperar latencias muy bajas incluso en CPU, aunque el bucle triple por token añade cómputo frente a un transformer plano equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | ArithMark-3.0 | PIQA | Licencia | Disponibilidad |
|---|--:|---|--:|--:|---|---|
| TinyBrainBot-3M-Loop-v3 | 2,96 M | Aritmética, profundidad recurrente | 91,6 | 53,97 | Apache-2.0 | Pesos públicos en Hugging Face |
| SmolLM2-135M | 135 M | Modelo general pequeño | 38,8 | no disponible en los datos | Apache-2.0 | Pesos públicos en Hugging Face |
| Pascaline-3M | 3 M | Aritmética | 69,2 | no disponible en los datos | no disponible | no disponible |
| Inferno-Exp-1.7 | 394 M | Aritmética | 85,9 | no disponible en los datos | no disponible | no disponible |

Frente a SmolLM2-135M, que es 45 veces mayor, TinyBrainBot-3M-Loop-v3 lo supera con claridad en las pruebas aritméticas (91,6 frente a 38,8 en ArithMark-3.0), aunque su rendimiento en tareas generales de lenguaje es comparablemente bajo dada su escala. Frente a Pascaline-3M, de tamaño casi idéntico, gana en la mayoría de variantes aritméticas salvo en ecuaciones desnudas (97,3 frente a 99,7).

## Limitaciones y advertencias

- Modelo base sin alineación: no está ajustado con instrucciones ni con RLHF/DPO (no consta ninguno), por lo que no es adecuado para chat o asistentes sin un ajuste posterior.
- Riesgo alto de alucinación y texto incoherente: con 2,96 M de parámetros, la calidad de generación de texto general es muy pobre; su índice de inteligencia (19,44) lo sitúa en el extremo inferior de los modelos evaluados.
- Solo inglés: el modelo está entrenado y etiquetado únicamente para inglés; no hay soporte para castellano ni otros idiomas.
- Rendimiento aritmético condicionado al formato: pese a la buena puntuación en ArithMark-3.0, falla en ArithMark-1 (35,8) por la diferencia de convención en la precedencia, lo que indica fragilidad ante convenciones no vistas en entrenamiento.
- Benchmarks no verificados: los resultados están declarados por el propio autor y evaluados con sus propios scripts en el caso de ArithMark; algunos se ejecutaron sobre el split de train (ArithMark-3.0), lo que puede inflar las cifras.
- Longitud de contexto no documentada: no disponible, lo que dificulta planificar su uso con textos largos.
- Dependencia de `custom_code`: cargar el modelo exige ejecutar código personalizado del repositorio, lo que requiere confianza en el autor y puede complicar entornos de producción restringidos.
- Licencia Apache-2.0 sin restricciones adicionales conocidas: permite uso comercial, pero al ser un modelo experimental no hay garantías de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-3m-loop-v3
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
  - https://huggingface.co/datasets/roneneldan/TinyStories
  - https://huggingface.co/datasets/wikimedia/wikipedia
- Paper, repositorio de código y demos: no disponibles en la información proporcionada.
