# pratikgx/Nanbeige4.3-33B-MLX-4bit

## Resumen

Nanbeige4.3-33B-MLX-4bit es una versión cuantizada a 4 bits en formato MLX del modelo Nanbeige/Nanbeige4.3-33B, publicada por Pratik Gandhi (pratikgx) para su ejecución en Apple Silicon. No es un modelo entrenado desde cero: el repositorio contiene únicamente una copia cuantizada del checkpoint original en bf16, con 33.118.977.024 parámetros y un peso en disco de 18,6 GB. La licencia Apache 2.0 del modelo original se mantiene.

Su interés práctico es que permite ejecutar un modelo denso de 33.000 millones de parámetros en un Mac con memoria unificada de 64 GB, algo inviable con los pesos en bf16 (unos 66 GB solo de pesos, estimación aritmética). El autor aporta mediciones de velocidad, memoria y pruebas de recuperación en contexto largo (needle in a haystack) sobre un Mac mini con M5 Pro, lo que convierte al repositorio en una referencia útil para quien quiera saber qué esperar antes de descargar 18,6 GB.

La model card del repositorio incluye la plantilla de chat con un bloque `<think>`, de modo que el modelo razona antes de responder y consume tokens en ese razonamiento. Es relevante para quien busque inferencia local, privada y sin GPU dedicada, asumiendo un throughput modesto (del orden de 10-14 tokens por segundo).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Llama (según el tag `llama` del repo); detalles de capas, atención y activaciones no disponibles |
| Parámetros totales | 33.118.977.024 |
| Parámetros activos | No disponible (no se indica si el modelo base es denso o MoE) |
| Longitud de contexto | No disponible en la información oficial; el autor verifica recuperación con 131.008 tokens de prompt (128k) |
| Tipos de cuantización | MLX affine 4 bits, group size 64, ~4,5 bits por peso incluyendo escalas y sesgos; todas las capas lineales cuantizadas, incluidos embeddings y `lm_head` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx` 0.32.4 / `mlx-lm` 0.32.2) |
| Modelo base | Nanbeige/Nanbeige4.3-33B (bf16) |
| Tamaño en disco | 18.630.506.496 bytes (18,6 GB) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna ni el proceso de entrenamiento del modelo base. El único dato estructural disponible es el tag `llama` de HuggingFace, que sitúa al modelo en la familia de transformers decoder-only tipo Llama, con 33.118.977.024 parámetros totales. No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas del modelo original en la información proporcionada.

Lo que sí está documentado es el proceso de cuantización: se parte de los pesos bf16 de Nanbeige/Nanbeige4.3-33B y se aplica `mlx.core.quantize` (la misma matemática que `mlx_lm.convert -q`) con 4 bits y group size 64 sobre todas las capas lineales, incluidas las de embedding y la cabeza de salida `lm_head`. La copia benchmarkeada se convirtió en Metal y la subida en CPU con idénticos ajustes; en una comprobación de una capa completa, cerca del 0,2 % de los códigos de 4 bits difieren en uno o dos pasos por redondeo en coma flotante, con el mismo error respecto al original bf16 en ambas copias.

## Capacidades

- Generación de texto conversacional y razonamiento previo a la respuesta mediante un bloque `<think>` abierto por la plantilla de chat.
- Razonamiento matemático: el autor reporta 20/20 en un conjunto propio de problemas de enunciado verbal (20 ítems, con thinking activado).
- Generación de código: 10/10 en un conjunto propio de tareas de programación (10 ítems).
- Seguimiento de instrucciones: 10/10 en un conjunto propio (10 ítems).
- Manejo de contexto largo: recuperación correcta de una aguja insertada al 10 %, 30 %, 50 %, 70 % y 90 % de profundidad con 32k tokens de contexto; al 25 %, 50 % y 75 % con 64k; al 50 % con 128k (131.008 tokens de prompt).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como característica documentada, más allá del modo de razonamiento del bloque `<think>`.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el modelo cabe en un equipo de 64 GB de memoria unificada con un pico medido de 19,32 GB a 512 tokens de contexto, lo que permite trabajar con un modelo de 33B sin GPU dedicada ni conexión a internet.
- Análisis de documentos extensos con privacidad estricta: con 131.008 tokens de prompt verificados y una aguja recuperada al 50 % de profundidad, es viable procesar contratos, informes o expedientes completos sin que los datos salgan del equipo.
- Prototipado de asistentes conversacionales: `mlx_lm.chat` levanta una sesión interactiva multi-turno directamente desde el repositorio, útil para validar prompts y flujos antes de invertir en infraestructura GPU.
- Generación de código en local para entornos sin red: los 10/10 en tareas de programación del chequeo del autor, junto con el modo de razonamiento, lo hacen apto para borradores de funciones y revisión de fragmentos en estaciones aisladas, aceptando un throughput de ~14 tok/s.
- Resolución de problemas matemáticos de enunciado verbal: los 20/20 del conjunto de sanity check lo sitúan como candidato para tutoría o generación de ejercicios resueltos, siempre con verificación posterior dado el tamaño reducido de la muestra.
- Evaluación comparativa de cuantizaciones: el repositorio documenta bits, group size, tooling y metodología de medición, por lo que sirve como referencia reproducible para comparar MLX 4 bits frente a bf16 u otras cuantizaciones del mismo modelo base.
- Resumen y extracción de información en lote sobre corpus largos: con 200 tok/s de procesamiento de prompt a 64k tokens, se pueden encadenar lecturas de documentos largos en un solo equipo, aunque el tiempo total por documento sea de minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos siguientes son mediciones del propio autor de la cuantización, con su propio harness sobre `mlx-lm`, y deben tratarse como comprobaciones de sanidad y no como puntuaciones de leaderboard.

Velocidad (Mac mini M5 Pro, 64 GB, macOS 27.0.1, greedy, 256 tokens generados, mediana de 3 ejecuciones):

| Contexto (tokens de prompt) | Thinking | Procesamiento de prompt (tok/s) | Generación (tok/s) | Time to first token | Memoria pico |
|---|---|---|---|---|---|
| 512 | on | 310,8 | 14,38 | 1,65 s | 19,32 GB |
| 512 | off | 358,2 | 14,51 | 1,43 s | 19,32 GB |
| 4.096 | on | 350,4 | 13,85 | 11,70 s | 20,21 GB |
| 4.096 | off | 355,8 | 13,75 | 11,52 s | 20,21 GB |
| 16.384 | on | 298,2 | 11,69 | 54,97 s | 22,82 GB |
| 32.768 | on | 252,0 | 9,93 | 130,10 s | 26,37 GB |

Calidad (thinking activado, conjuntos propios del autor):

| Prueba | Resultado |
|---|---|
| Problemas matemáticos de enunciado | 20/20 |
| Tareas de código | 10/10 |
| Seguimiento de instrucciones | 10/10 |

Recuperación en contexto largo (needle in a haystack, thinking activado):

| Contexto | Profundidad de la aguja | Encontrada | Procesamiento de prompt (tok/s) | Memoria pico |
|---|---|---|---|---|
| 32k | 10 % | sí | 256,9 | 26,32 GB |
| 32k | 50 % | sí | 261,3 | 26,35 GB |
| 32k | 90 % | sí | 259,0 | 26,35 GB |
| 64k | 25 % | sí | 195,4 | 33,44 GB |
| 64k | 50 % | sí | 200,0 | 33,44 GB |
| 64k | 75 % | sí | 200,6 | 33,44 GB |
| 128k | 50 % | sí | 136,4 | 47,75 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 19,32 GB de pico con contexto de 512 tokens; 20,21 GB a 4k; 22,82 GB a 16k; 26,37 GB a 32k; 33,44 GB a 64k; 47,75 GB a 128k.
- Equipo de referencia: Mac mini con M5 Pro y 64 GB de memoria unificada. El test de 128k (131.008 tokens de prompt) se completó sin agotar memoria en unos 16 minutos de extremo a extremo.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles para este formato. Los pesos MLX están pensados para Apple Silicon; para CUDA habría que recurrir a otra cuantización del modelo base.
- ¿Cabe en GPU de consumo? No hay datos para GPUs de consumo en la información disponible; en Apple Silicon requiere del orden de 20 GB para contextos cortos, por lo que un equipo de 24 GB sería el mínimo realista y 64 GB el recomendado para contexto largo.
- Opciones de despliegue: `mlx-lm` (comandos `mlx_lm.generate` y `mlx_lm.chat`), con mlx 0.32.4 y mlx-lm 0.32.2 como versiones verificadas. vLLM, llama.cpp, Ollama y TGI no están documentados para este repositorio.
- Latencia y throughput medidos: 14,38 tok/s de generación y 1,65 s hasta el primer token con 512 tokens de contexto; 9,93 tok/s y 130,10 s hasta el primer token con 32k. El procesamiento de prompt se mantiene entre 252 y 358 tok/s hasta 32k y baja a 136,4 tok/s a 128k.

## Comparativa con modelos similares

No se han proporcionado datos de otros modelos comparables en la información disponible. La única comparación documentable es frente al checkpoint original del que se deriva:

| Modelo | Parámetros | Cuantización | Tamaño en disco | Contexto verificado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-4bit | 33.118.977.024 | MLX affine 4 bits (grupo 64) | 18,6 GB | 131.008 tokens de prompt (prueba del autor) | Apache 2.0 | HuggingFace, 0 descargas, 1 like |
| Nanbeige/Nanbeige4.3-33B (base) | 33.118.977.024 | bf16 | No disponible (estimación aritmética: ~66 GB de pesos) | No disponible | Apache 2.0 | HuggingFace |
| Otras alternativas de ~30-34B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los resultados de calidad (20/20 en matemáticas, 10/10 en código, 10/10 en instrucciones) proceden de conjuntos pequeños escritos por el propio autor para ese benchmark; no son comparables con MMLU, HumanEval o GSM8K y no deben citarse como tales.
- Las mediciones se hicieron en una sola máquina y una sola sesión: velocidad como mediana de 3 ejecuciones, pero las pruebas de calidad y de aguja se ejecutaron una única vez.
- El harness es propio, construido sobre `mlx-lm`, no una suite de evaluación oficial.
- El modo thinking consume tokens antes de la respuesta: hay que asignar `--max-tokens` suficiente o la generación se truncará antes de llegar a la contestación.
- Throughput bajo para uso interactivo exigente: 9,93 tok/s a 32k de contexto implica respuestas de cientos de tokens en decenas de segundos, y el time to first token a 32k supera los dos minutos.
- El formato MLX limita el despliegue a Apple Silicon; no hay artefactos GGUF ni safetensors estándar para CUDA en este repositorio.
- No hay información sobre idiomas soportados, sesgos, tasa de alucinación ni comportamiento en dominios distintos de los tres conjuntos de sanidad evaluados.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y el repositorio no incluye garantías ni soporte; el autor delega todo el crédito del modelo en el equipo de Nanbeige.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay validación comunitaria independiente de las cifras publicadas.
- No se ha verificado el contexto máximo nominal del modelo base; que la prueba de 128k funcione no implica que esa sea la ventana de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pratikgx/Nanbeige4.3-33B-MLX-4bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Autor de la cuantización en X: https://x.com/pratikg
- Librería de inferencia: `mlx-lm` (`pip install mlx-lm`)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada (los resultados de búsqueda web no contienen enlaces relacionados con el modelo).
