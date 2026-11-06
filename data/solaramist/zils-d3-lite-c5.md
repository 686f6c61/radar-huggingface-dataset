# SolaraMist/zils-d3-lite-c5

## Resumen

`zils-d3-lite-c5` es un modelo de lenguaje de aproximadamente 853 millones de parámetros publicado por el usuario SolaraMist en HuggingFace bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de un "body" (cuerpo) destinado al pool de modelos tipo soup denominado `d3-lite`, construido sobre el chasis fijado `vllm-sr/d3-lite` y con `Qwen/Qwen3.5-0.8B` como ancestro declarado en la cadena de procedencia. El modelo combina dos componentes: el cuerpo base `zils-ai/jiwo-0.8b-full` y un estudiante LoRA destilado, fusionados mediante un "soup" al 50/50.

La relevancia técnica del modelo reside en su metodología de construcción: destilación KL desde un profesor compuesto (`torchcast-ai/torchcast-decision-4b` y `vllm-sr/d3-mini`) hacia un adaptador LoRA de rango 64, con una mezcla de 0,7 de respuestas del profesor y 0,3 de etiquetas verdaderas sobre 21.470 filas. El conjunto de datos de entrenamiento se compone exclusivamente de elementos de clasificación temática de arXiv y de resultados de Stack Exchange (cerrados y aceptados), con un riguroso control de procedencia temporal y exclusiones explícitas de fuentes como AfD, Gerrit y GH Archive.

El modelo se presenta como un componente de un ecosistema mayor (Zils) más que como un modelo listo para producción general. No se han publicado resultados de benchmarks, idiomas soportados ni detalles de la arquitectura interna más allá de su linaje hacia Qwen3.5-0.8B. Su interés es principalmente metodológico y experimental, orientado a pipelines de destilación y composición de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B, según procedencia declarada) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de `Qwen/Qwen3.5-0.8B`, según la tabla de procedencia de la model card, que declara ese modelo como "parent" con un digest sha256 del archivo de pesos. Sobre ese linaje se construye el chasis `vllm-sr/d3-lite`, que actúa como contenedor fijo ("pinned chassis") para los cuerpos del pool. El modelo final es un "soup" al 50/50 entre el cuerpo `zils-ai/jiwo-0.8b-full` y un estudiante LoRA destilado, ambos sobre el mismo chasis.

El entrenamiento del estudiante se realizó con el comando `zils.teacher train --lora 64 --start <jiwo body> --seed 3`, es decir, un adaptador LoRA de rango 64 inicializado desde el cuerpo jiwo y con semilla 3. Se aplicó una pasada de destilación KL sobre las respuestas de un profesor compuesto por `torchcast-ai/torchcast-decision-4b` y `vllm-sr/d3-mini`, con una mezcla de 0,7 de respuestas del profesor y 0,3 de etiquetas verdaderas, sobre 21.470 filas. La composición final se obtuvo con `zils.teacher soup`, promediando al 50% el cuerpo jiwo y el estudiante.

Los datos de entrenamiento provienen exclusivamente de fuentes cuya consulta de recolección está indexada por la fecha de creación del evento: clasificación temática de arXiv (`arxiv-category-*`) y resultados cerrados y aceptados de Stack Exchange (`stackexchange-closed-*`, `stackexchange-accepted-*`). Se aplicaron filtros estrictos: todos los elementos fueron preguntados antes del 31 de agosto de 2026 y con al menos 110 días de antigüedad respecto a la recolección. El split de entrenamiento cubre fechas de consulta entre el 19 de mayo y el 17 de julio de 2026, con 51.137 elementos totales de los que se usaron 11.235. Se excluyeron explícitamente AfD, Gerrit y GH Archive. El manifiesto de datos registra descartes por familia rechazada y por ser demasiado reciente (424 y 209 en el conjunto balanceado; 1.973 y 849 en el no balanceado).

## Capacidades

- Clasificación temática de documentos científicos: el entrenamiento incluye etiquetas de clasificación de arXiv en las categorías cs, math, physics y other, con etiquetas A, B, C y D por familia.
- Clasificación de resultados de Stack Exchange: predice resultados cerrados y aceptados en dominios como arts, language, reasoning, retrieval y tools.
- Generación de texto general: heredada del linaje Qwen3.5-0.8B, aunque no se documentan capacidades específicas.
- Destilación de conocimiento: el modelo incorpora el comportamiento de un profesor compuesto de 4B y mini, lo que puede transferir capacidades de razonamiento y decisión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Clasificación automática de preprints de arXiv: el modelo puede asignar categorías temáticas (cs, math, physics, other) y subetiquetas (A, B, C, D) a nuevos envíos, aprovechando que fue entrenado específicamente sobre este tipo de datos con control temporal de procedencia.
- Moderación y triaje de preguntas en Stack Exchange: puede predecir si una pregunta será cerrada o aceptada en dominios como reasoning, retrieval o tools, lo que permite priorizar revisiones y automatizar el enrutamiento a moderadores.
- Investigación en destilación de conocimiento: sirve como caso de estudio reproducible de destilación KL con LoRA de rango 64 y mezcla profesor/etiqueta 0,7/0,3, útil para quienes diseñan pipelines similares con el framework Zils.
- Composición de modelos (model soup): el modelo es un componente del pool `d3-lite`, por lo que puede integrarse en experimentos de fusión de pesos con otros cuerpos del mismo chasis para estudiar el efecto del promediado en tareas de clasificación.
- Evaluación de procedencia y contaminación de datos: su manifiesto detallado con sha256, fechas de corte y exclusiones lo convierte en un ejemplo práctico para auditar pipelines de recolección de datos y medir riesgo de solapamiento con validadores.
- Prototipado de clasificadores ligeros en entornos con recursos limitados: con 853M de parámetros y pesos en safetensors, puede desplegarse en una GPU de consumo para experimentos de clasificación sin necesidad de infraestructura de gran escala.
- Generación de texto asistida en dominios técnicos: aunque no se documentan capacidades generales, el linaje Qwen3.5-0.8B sugiere utilidad como base para tareas de generación breve en inglés técnico, siempre con validación empírica previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16 se requieren aproximadamente 1,7 GB solo para pesos; en fp32 unos 3,4 GB; en cuantización de 8 bits unos 0,85 GB y en 4 bits unos 0,43 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles en términos de memoria.
- Cabe en GPU de consumo: sí, en la mayoría de GPU modernas con 4 GB o más de VRAM, dado el tamaño reducido del modelo.
- Opciones de despliegue: no se documentan opciones específicas; por el linaje Qwen y el formato safetensors, es plausible usar vLLM, TGI o transformers, pero no está confirmado por el autor. llama.cpp y Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SolaraMist/zils-d3-lite-c5 | 852.985.920 | no disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | Modelo soup experimental, sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8B (según linaje declarado) | no disponible | no disponible en la información | HuggingFace (referenciado como parent) | Modelo base del linaje |
| zils-ai/jiwo-0.8b-full | ~0,8B (según nombre) | no disponible | Apache 2.0 | HuggingFace (referenciado) | Cuerpo base del soup |
| torchcast-ai/torchcast-decision-4b | ~4B (según nombre) | no disponible | Apache 2.0 | HuggingFace (referenciado) | Profesor del proceso de destilación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni de las tareas de clasificación para las que fue entrenado, lo que impide evaluar su calidad real.
- Modelo experimental de nicho: se presenta como un "body" para un pool interno (Zils), no como un modelo listo para uso general; su pipeline no está declarado y las capacidades generales no están documentadas.
- Riesgo de solapamiento de datos: el propio autor reconoce que la recolección nocturna estándar de Zils no alcanza eventos tan antiguos y que un validador con retro-relleno podría solaparse con los elementos de entrenamiento; no pueden descartarlo.
- Idiomas no declarados: no se especifican los idiomas soportados, lo que impide garantizar un comportamiento adecuado fuera del inglés técnico de arXiv y Stack Exchange.
- Sesgos potenciales: el entrenamiento se limita a dos fuentes (arXiv y Stack Exchange) con sesgos propios de comunidad, idioma y dominio; el modelo puede comportarse mal fuera de esos dominios.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay evaluación publicada que lo cuantifique.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado antes de un uso comercial en producción.
- Fecha de creación futura: el repositorio data de noviembre de 2026, lo que sugiere un contexto de publicación muy reciente o planificado; conviene verificar la integridad de los artefactos antes de usarlos.
- Sin soporte comunitario: 0 descargas y 0 likes indican ausencia de validación externa; no hay issues, demos ni informes de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/SolaraMist/zils-d3-lite-c5
- Modelo base (chasis): https://huggingface.co/vllm-sr/d3-lite
- Cuerpo de partida: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Profesor 1: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Profesor 2: https://huggingface.co/vllm-sr/d3-mini
- Modelo padre declarado: https://huggingface.co/Qwen/Qwen3.5-0.8B
