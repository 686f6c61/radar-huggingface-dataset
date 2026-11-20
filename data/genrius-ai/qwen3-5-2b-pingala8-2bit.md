# Genrius-AI/Qwen3.5-2B-Pingala8-2bit

## Resumen

Qwen3.5-2B-Pingala8-2bit es una cuantización de 2 bits del modelo Qwen3.5-2B de Alibaba Qwen, publicada por Genrius-AI mediante su método propietario Pingala-8 (trellis). El objetivo es claro: comprimir un transformer híbrido de aproximadamente 988 millones de parámetros en un fichero GGUF de 0,78 GB que pueda ejecutarse en CPU y en GPUs de consumo con muy poca VRAM, manteniendo una calidad utilizable. Frente a la cuantización IQ2_XXS de llama.cpp del mismo modelo, la versión 1 de este fichero reduce la perplejidad en WikiText-2 de 29,08 a 15,62 con un tamaño 11,5 MB menor; la versión 2 (publicada el 1 de noviembre de 2026) baja hasta 14,06.

El modelo base Qwen3.5-2B emplea una arquitectura híbrida con atención lineal (Gated DeltaNet) combinada con atención clásica, lo que reduce el coste de contexto largo. Esta ficha describe el fichero cuantizado, no el modelo original: los pesos están en formato GGUF y están pensados para llama.cpp y runtimes compatibles. La licencia Apache 2.0 del modelo base se mantiene.

Es relevante ahora porque demuestra que la compresión agresiva a 2 bits con métodos tipo trellis puede acercarse a cuantizaciones de 3-4 bits en calidad, habilitando inferencia local en hardware muy limitado (portátiles con GPU de 8 GB, mini-PC, móviles de gama alta) sin renunciar por completo a la coherencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Gated DeltaNet) y atención clásica (base Qwen3.5-2B) |
| Parametros totales | 987.950.338 (~988 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el benchmark usa contexto de 4096 tokens) |
| Tipos de cuantizacion | 2 bits (Pingala-8, trellis); fichero GGUF de 0,78 GB |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer híbrido que combina capas de atención lineal basadas en Gated DeltaNet con capas de atención estándar; los tags del repositorio (`gated-deltanet`, `hybrid-attention`) confirman esta arquitectura. Esta mezcla reduce el coste computacional y de memoria en secuencias largas frente a un transformer puramente attention-based. El modelo base fue entrenado por Alibaba Qwen; no se dispone en la información proporcionada de detalles sobre el número de tokens, composición del dataset ni si hubo RLHF o DPO.

La innovación de este repositorio no está en el entrenamiento sino en la compresión: Pingala-8 es un método de cuantización a 2 bits basado en trellis (cuantización en red) que, según el autor, supera a IQ2_XXS de llama.cpp en perplejidad con menor tamaño de fichero. La versión 2 incorpora una imatrix (`imatrix` aparece en los tags) y mejora la perplejidad de 15,62 a 14,06 en WikiText-2. El autor reporta que la v2 supera a UD-IQ2_M de unsloth (0,86 GB, perplejidad 14,96) en 67 de 70 ventanas de evaluación, aunque DASH-Q IQ2_XS (0,76 GB, 13,90) sigue siendo ligeramente mejor en perplejidad.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento básico y respuesta a preguntas de conocimiento general (con las limitaciones propias de un modelo de ~1B parámetros y 2 bits).
- Resolución de problemas aritméticos sencillos: el autor muestra un problema de cambio de 20 dólares resuelto correctamente en la demo comparativa.
- Generación de código y matemáticas: capacidad esperable del modelo base, pero no verificada en los benchmarks publicados para esta cuantización.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta cuantización.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés y chino según la model card.
- Modo thinking: la demo se ejecuta con thinking desactivado; no se detalla soporte explícito en la cuantización.
- Visión y audio: no disponibles.

## Casos de uso

- Inferencia en portátiles con GPU de 8 GB: el fichero de 0,78 GB cabe holgadamente en una RTX 5070 Ti Laptop o similar, dejando VRAM libre para el contexto KV y otras tareas; útil para prototipado local sin conexión.
- Asistentes conversacionales embebidos en aplicaciones de escritorio: al ocupar menos de 1 GB, puede distribuirse dentro de un instalador y ejecutarse en CPU con llama.cpp, ofreciendo chat básico en inglés y chino sin depender de la nube.
- Evaluación de métodos de cuantización: sirve como referencia para investigadores que comparan Pingala-8 con IQ2_XXS, UD-IQ2_M o DASH-Q IQ2_XS sobre el mismo modelo base, con métricas de perplejidad reproducibles.
- Clasificación y etiquetado de texto ligero: tareas de extracción de entidades o categorización en inglés/chino donde la latencia importa más que la precisión fina, ejecutables en mini-PC o dispositivos edge.
- Generación de texto de relleno y borradores: redacción de respuestas cortas, resúmenes o plantillas en entornos con recursos muy limitados, aceptando la pérdida de calidad frente al modelo en fp16.
- Demos educativas y docencia: permite mostrar el funcionamiento de un LLM cuantizado a 2 bits en un navegador (el autor publica un Space en CPU) o en un portátil de estudiante sin GPU dedicada.
- Pruebas de pipelines de llama.cpp: validación de integración de GGUF, plantillas de chat y servidores compatibles con la API de OpenAI en entornos de CI con hardware modesto.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente; `verified: false` en la model card). La perplejidad corresponde a la versión 1 (15,62); la versión 2 reporta 14,06 en la descripción, aunque el model-index mantiene el valor de la v1.

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (test, contexto 4096) | Perplejidad (menor es mejor) | 15,6193 (v1); 14,06 (v2, según texto de la model card) |
| HellaSwag (0-shot, llama-perplexity) | Accuracy (%) | 50,00 |
| WinoGrande (0-shot, llama-perplexity) | Accuracy (%) | 60,14 |
| ARC-Easy (0-shot, llama-perplexity) | Accuracy (%) | 53,68 |
| ARC-Challenge (0-shot, llama-perplexity) | Accuracy (%) | 34,78 |
| MMLU (0-shot, llama-perplexity) | Accuracy (%) | 31,24 |

Comparación de perplejidad en WikiText-2 a tamaño similar reportada por el autor:

| Fichero | Tamano | Perplejidad WikiText-2 |
|---|---|---|
| Pingala-8 2-bit v2 | 0,78 GB | 14,06 |
| DASH-Q IQ2_XS | 0,76 GB | 13,90 |
| Unsloth UD-IQ2_M | 0,86 GB | 14,96 |
| Pingala-8 2-bit v1 | 0,78 GB | 15,62 |
| llama.cpp IQ2_XXS | 0,79 GB | 29,08 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos; con contexto de 4096 tokens y overhead de llama.cpp, el consumo total se mantiene por debajo de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; el autor demuestra ejecución en una RTX 5070 Ti Laptop. También funciona en A100, H100 y RTX 4090, aunque en esas GPUs el modelo queda muy infrautilizado.
- GPU de consumo: cabe en GTX 1650, RTX 3050, RTX 4060, RTX 4090 y similares; también en iGPUs con memoria unificada suficiente.
- CPU: ejecutable en CPU pura mediante llama.cpp; el autor publica un Space de demostración en CPU con un modelo hermano (Qwen3-1.7B-Pingala8-2bit).
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (Ollama, llama-cpp-python, servidores con API compatible con OpenAI). No se menciona soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles de forma cuantitativa. La model card indica que, en tres ejecuciones cortas comparativas, IQ2_XXS fue más rápido en 2 de 3 casos, por lo que Pingala-8 no ofrece ventaja de velocidad en esos escenarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-Pingala8-2bit (v2) | ~988 M | no disponible | 14,06 | Apache 2.0 | GGUF 2-bit |
| DASH-Q IQ2_XS (mismo base) | ~988 M | no disponible | 13,90 | Apache 2.0 | GGUF 2-bit |
| Unsloth UD-IQ2_M (mismo base) | ~988 M | no disponible | 14,96 | Apache 2.0 | GGUF 2-bit |
| llama.cpp IQ2_XXS (mismo base) | ~988 M | no disponible | 29,08 | Apache 2.0 | GGUF 2-bit |

No se dispone de datos de benchmarks de tareas (MMLU, HumanEval, GSM8K) para las alternativas en la información proporcionada, por lo que la comparación se limita a perplejidad y tamaño.

## Limitaciones y advertencias

- La cuantización a 2 bits degrada la calidad de forma notable: MMLU 0-shot de 31,24 % y ARC-Challenge de 34,78 % indican un rendimiento bajo en conocimiento y razonamiento, lejos de lo esperable en el modelo base en fp16.
- Riesgo elevado de alucinación y errores factuales: el propio autor documenta errores en 2 de 3 prompts comparativos (orden de los planetas y primeros elementos químicos).
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados; la perplejidad de la v2 (14,06) no aparece en el model-index, solo en el texto de la model card.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las limitaciones del modelo base Qwen3.5-2B, incluidos sesgos de los datos de entrenamiento originales.
- No se documenta soporte de tool calling, agentes ni modo thinking en esta cuantización; no debe asumirse su disponibilidad en producción.
- La longitud máxima de contexto del fichero cuantizado no se especifica; el benchmark usa 4096 tokens, y contextos mayores pueden degradar la calidad o no estar soportados por la configuración de llama.cpp.
- El método Pingala-8 es propietario y su reproducibilidad depende del código publicado en el repositorio del autor; conviene validar los ficheros antes de desplegarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Genrius-AI/Qwen3.5-2B-Pingala8-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de código: https://github.com/Genrius-AI/pingala8-llm
- Demo en navegador (CPU, modelo hermano): https://huggingface.co/spaces/harshit-genrius/pingala8-demo
- Demo en GPU (versión 2): https://huggingface.co/spaces/harshit-genrius/pingala8-qwen35-live
- Leaderboard de GGUF a 2 bits: https://huggingface.co/spaces/Genrius-AI/2bit-gguf-leaderboard
- Página de demos con salidas sin editar: https://genrius-ai.github.io/pingala8-llm/demos.html
- Vídeo comparativo: https://huggingface.co/Genrius-AI/Qwen3.5-2B-Pingala8-2bit/resolve/main/media/demo2b_compare.mp4
