# rapid-mlx/Qwen3.8-27B-mixed-3.5bpw-MLX

## Resumen

Qwen3.8-27B-mixed-3.5bpw-MLX es una versión cuantizada en formato MLX del modelo multimodal Qwen3.8-27B, desarrollado por Alibaba y publicado por el usuario rapid-mlx. Este build reduce el tamaño del modelo de 27B parámetros a aproximadamente 13 GB en disco mediante una cuantización mixta de precisión activación-aware (2/3/4 bits, promedio 3,5 bits por peso), diseñada específicamente para ejecutarse de forma cómoda en Macs con Apple Silicon de 24 GB de memoria unificada, algo que la versión 4-bit estándar no logra sin ajustes.

La relevancia de este modelo radica en que recupera casi por completo el rendimiento de conocimiento factual de la cuantización 4-bit (MMLU-Pro 61,0 vs 60,8) mientras ahorra unos 3,9 GB de memoria pico, situándose en un punto óptimo de capacidad por gigabyte. Mantiene la torre de visión nativa (multimodal), soporta razonamiento, código y matemáticas, y se sirve a través del servidor Rapid-MLX con batching continuo. Es una opción práctica para desarrolladores que quieran ejecutar un VLM de 27B en hardware de consumo sin recurrir a GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), no MoE |
| Parametros totales | 27B (modelo base); el repo reporta ~3,97B en safetensors (posible error del autor) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | Mixta 2/3/4 bits, promedio 3,5 bpw, group size 64, affine; vision tower a 4 bits |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de 27B parámetros con arquitectura transformer multimodal nativa, que acepta imagenes y texto como entrada y genera texto. La version cuantizada aqui descrita no ha sido reentrenada: es una cuantizacion post-training one-shot que asigna bits de forma heterogenea a cada capa lineal del lenguaje (2, 3 o 4 bits) basandose en la saliencia activacional, es decir, en cuanto afecta cada capa a las salidas del modelo. El metodo no es AWQ (que usa scaling uniforme por canal), sino que toma prestada la metrica de saliencia de AWQ para decidir la asignacion de bits mediante un algoritmo greedy-knapsack que minimiza el error ponderado por activaciones bajo un presupuesto de tamano de 3,5 bpw.

Los datos de entrenamiento del modelo base no se detallan en la informacion disponible, pero el repositorio oficial de Alibaba indica que Qwen3.8-27B esta optimizado para tareas de codigo, flujos agente y automatizacion de oficina. La cuantizacion se realizo con un pequeno conjunto de calibracion en ingles, midiendo la magnitud media de activaciones de entrada de cada capa lineal. La torre de vision se mantuvo a 4 bits para preservar las capacidades multimodales.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta imagenes y texto, produce texto (pipeline image-text-to-text).
- Razonamiento matematico y logico: evaluado en GSM8K con 94,7 de precision.
- Generacion de codigo: evaluado en HumanEval+ con 80,0 (con modo thinking).
- Conocimiento factual: MMLU-Pro 61,0, comparable a la cuantizacion 4-bit.
- Capacidades multimodales de vision: MMBench-EN 86,7, ligeramente inferior a 4-bit pero util para descripcion y analisis de imagenes.
- Soporte de tool calling y flujos agente: no confirmado explicitamente en la ficha, pero el modelo base Qwen3.8-27B esta disenado para agentic workflows segun el repositorio oficial.
- Multilingue limitado: solo ingles y chino declarados.

## Casos de uso

- Asistente multimodal en Mac: ejecutar un VLM de 27B en un Mac de 24 GB para tareas de vision-lenguaje, como describir imagenes o responder preguntas sobre capturas de pantalla, sin depender de la nube.
- Generacion de codigo en local: usar el modelo para autocompletar o generar funciones en entornos de desarrollo integrados en Apple Silicon, aprovechando el rendimiento de HumanEval+ 80,0 y la velocidad de ~11 tok/s.
- Automatizacion de oficina: procesar documentos escaneados o imagenes de tablas y extraer informacion estructurada, gracias a la combinacion de vision y razonamiento.
- Prototipado de agentes conversacionales: desplegar un servidor OpenAI-compatible con Rapid-MLX y construir agentes que combinen texto e imagenes, con batching continuo para multiples usuarios.
- Analisis de imagenes medicas o tecnicas: aunque la vision es ~3,6 puntos inferior a 4-bit, sigue siendo util para clasificacion o descripcion de imagenes en entornos con restricciones de memoria.
- Educacion y demostraciones: ejecutar un modelo de 27B en portatiles Apple para ensenar conceptos de IA multimodal o evaluar el impacto de la cuantizacion mixta en el rendimiento.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados en la model card del autor, obtenidos con el mismo harness y decodificacion greedy:

| Benchmark | Habilidad | 4-bit (16 GB) | 3,5 bpw mixto (13 GB) | 3-bit uniforme (12 GB) |
|---|---|---|---|---|
| MMLU-Pro (n=500) | Conocimiento | 60,8 | 61,0 | 54,2 |
| GSM8K (n=150) | Razonamiento matematico | 95,3 | 94,7 | 92,7 |
| HumanEval+ (n=40, thinking) | Codigo | 77,5 | 80,0 | — |
| MMBench-EN (n=300) | Vision | 90,3 | 86,7 | 87,3 |

El modelo iguala o supera ligeramente al 4-bit en conocimiento, razonamiento y codigo, pero pierde ~3,6 puntos en vision respecto al 4-bit, situandose al nivel del 3-bit uniforme.

## Requisitos de hardware

- VRAM estimada: pico de 14,6 GB en modo texto, 15,9 GB con imagen de 672x672 y 16,5 GB con imagen de 896x896. No cabe en 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con 24 GB o 32 GB de memoria unificada (M2 Pro, M3, M4, etc.). No requiere GPU discreta.
- Compatibilidad: funciona en Macs de 24 GB sin ajustes; en 32 GB queda holgado. No soporta 16 GB.
- Opciones de despliegue: Rapid-MLX (servidor OpenAI-compatible con batching continuo y modo vision con `--mllm`). Tambien puede usarse con otras herramientas que carguen MLX, aunque no se mencionan.
- Latencia y throughput: ~11 tok/s de decodificacion medidos en M2 Pro (32 GB); tiempo de carga ~5 s.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | MMLU-Pro | MMBench-EN | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | 27B | No disponible | Referencia | Referencia | Apache 2.0 | bf16 |
| Qwen3.8-27B 4-bit MLX | 27B | No disponible | 60,8 | 90,3 | Apache 2.0 | MLX 4-bit |
| Qwen3.8-27B 3-bit uniforme | 27B | No disponible | 54,2 | 87,3 | Apache 2.0 | MLX 3-bit |
| **Este modelo (3,5 bpw mixto)** | **27B** | **No disponible** | **61,0** | **86,7** | **Apache 2.0** | **MLX mixto** |

Frente a las alternativas del mismo modelo base, esta version ofrece el mejor equilibrio entre tamano (13 GB) y rendimiento de conocimiento, a costa de una ligera perdida en vision. No se dispone de comparativas con otros VLM de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Vision ligeramente degradada: ~3,6 puntos por debajo del 4-bit en MMBench-EN; si se requiere maxima precision visual y se dispone de 32 GB, conviene usar la version 4-bit.
- No cabe en 16 GB de memoria unificada: pico minimo de 14,6 GB en modo texto, por lo que requiere al menos 24 GB.
- Cuantizacion one-shot sin reentrenamiento: los errores de cuantizacion pueden acumularse en tareas especificas no cubiertas por el conjunto de calibracion (solo ingles).
- Idiomas limitados: solo ingles y chino declarados; el rendimiento en otros idiomas no esta garantizado.
- Hereda las limitaciones del modelo base: posibles sesgos, riesgo de alucinacion y comportamiento no deseado en contextos delicados, no mitigados por la cuantizacion.
- Sin garantia de soporte de tool calling o agentes: aunque el modelo base esta orientado a esos usos, la ficha no confirma que esta version los preserve.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rapid-mlx/Qwen3.8-27B-mixed-3.5bpw-MLX
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Alibaba (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Servidor Rapid-MLX: https://github.com/raullenchai/Rapid-MLX
- Web de Rapid-MLX: https://rapidmlx.com/
- Version 4-bit de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
