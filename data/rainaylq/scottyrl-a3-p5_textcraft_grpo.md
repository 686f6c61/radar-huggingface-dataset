# rainaylq/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-4B` mediante el framework scottyrl, en el contexto del curso 11-768 (AI Agents) de la Universidad Carnegie Mellon, como parte de la asignación 3. El adaptador se ha exportado desde el entorno Tinker (referencia `tinker://model_689dd55d/v50_r12`) y se distribuye en formato PEFT/safetensors con un tamaño de repositorio de 0,2 GB.

El nombre del run, `p5_textcraft_grpo`, sugiere un entrenamiento con Group Relative Policy Optimization (GRPO) orientado a tareas de tipo TextCraft (manipulación de texto estructurado o generación de texto controlada), aunque la model card no detalla la composición del dataset ni la recompensa utilizada. No se especifican parámetros totales del adaptador, licencia, idiomas soportados ni pipeline de inferencia.

Se trata de un artefacto de investigación educativa, no de un modelo listo para producción: no tiene descargas ni likes, no incluye resultados de benchmarks publicados y su evaluación se realiza mediante un script del propio curso que sirve el adaptador con vLLM y lo evalúa sobre los splits de validación medium y hard de TextCraft-Synth con k=4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre transformer `Qwen/Qwen3.5-4B` |
| Parametros totales | no disponible (adaptador LoRA; modelo base de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.5-4B |
| Rank LoRA | 32 |
| Framework de entrenamiento | scottyrl (Tinker) |
| Tamano del repositorio | 0,2 GB |
| Run name | p5_textcraft_grpo |
| Commit | 88d1b1fa2aea58938d6d251847ce5559c4ac6558 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado sobre `Qwen/Qwen3.5-4B`, un transformer denso de 4.000 millones de parámetros del que no se detallan en la información disponible ni la arquitectura interna (número de capas, atención, contexto nativo) ni la composición del corpus de preentrenamiento. El adaptador en sí solo contiene las matrices de bajo rango, por lo que su huella en disco es de 0,2 GB y requiere cargar el modelo base completo para la inferencia.

El entrenamiento se realizó con el framework scottyrl y la técnica GRPO (Group Relative Policy Optimization), un algoritmo de optimización de política sin modelo crítico que genera múltiples respuestas por prompt y normaliza las recompensas dentro del grupo. El identificador `p5_textcraft_grpo` y la evaluación sobre TextCraft-Synth indican que el ajuste está orientado a tareas de manipulación y generación de texto estructurado. No se especifican el número de pasos, el tamaño del dataset, la función de recompensa, ni si hubo etapas previas de SFT. La exportación proviene de Tinker (`v50_r12`), lo que sugiere la versión 50 del modelo y la revisión 12 del checkpoint.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base Qwen3.5-4B, con el ajuste fino orientado a tareas de tipo TextCraft.
- Manipulación de texto estructurado y generación controlada, presumiblemente el objetivo del run `p5_textcraft_grpo`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (depende del modelo base, no confirmado para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no confirmado para el adaptador; el contexto del curso (AI Agents) sugiere evaluación en entornos agénticos, pero no se detalla.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Evaluación académica de técnicas de RL: el adaptador sirve como referencia reproducible para comparar GRPO frente a otras estrategias de ajuste en tareas de manipulación de texto, usando el script `evaluate_checkpoint.py` del curso con k=4.
- Investigación en ajuste eficiente: al ser un LoRA de rango 32 sobre un modelo de 4B, permite experimentar con bajo coste de almacenamiento (0,2 GB) y de cómputo en GPUs de gama media.
- Reproducción de experimentos con vLLM: el flujo documentado (`vllm serve ... --enable-lora --max-lora-rank 32`) permite servir el adaptador junto al modelo base y comparar métricas en los splits medium y hard de TextCraft-Synth.
- Estudio de recompensas en GRPO: útil para analizar cómo una función de recompensa orientada a TextCraft moldea el comportamiento del modelo base en generación de texto estructurado.
- Base para ajustes posteriores: el adaptador puede servir como punto de partida para merges o entrenamientos adicionales en dominios de texto controlado, siempre que la licencia del modelo base lo permita.
- Docencia y formación en agentes: ejemplo práctico de pipeline completo (entrenamiento en Tinker, exportación PEFT, servicio con vLLM, evaluación con script) para cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el procedimiento de evaluación (splits medium y hard de TextCraft-Synth con k=4 mediante vLLM), sin incluir métricas numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; requiere cargar el modelo base Qwen3.5-4B. En fp16, un modelo de 4B ocupa aproximadamente 8 GB de pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no especificadas por el autor. Para servir con vLLM el modelo base de 4B, una GPU con 16-24 GB (RTX 4090, A10, L4) sería suficiente en fp16; para mayor throughput, A100 o H100.
- Compatibilidad con GPU de consumo: probable en tarjetas con 16 GB o más (RTX 4080/4090) usando el modelo base en fp16 o cuantizado; no confirmado por el autor.
- Opciones de despliegue: vLLM es el método documentado (`--enable-lora --max-lora-rank 32`). No se mencionan llama.cpp, Ollama ni TGI; al ser un adaptador PEFT, puede cargarse también con la librería `peft` y `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | LoRA r32 sobre 4B | no disponible | no disponible | safetensors (PEFT) | Adaptador educativo, sin benchmarks publicados |
| Qwen/Qwen3.5-4B | 4B | no disponible | no disponible | safetensors | Modelo base; capacidades generales |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre adaptadores comparables en la búsqueda |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con otros adaptadores LoRA o modelos de 4B.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay métricas que permitan validar su calidad fuera del script de evaluación del curso.
- Licencia no especificada: no se puede confirmar el uso comercial; además, la licencia del modelo base Qwen3.5-4B condiciona cualquier despliegue.
- Idiomas no declarados: se desconoce si el ajuste degrada el multilingüismo del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; el ajuste con GRPO sobre una recompensa específica de TextCraft puede aumentar la deriva fuera de ese dominio.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los del dataset de entrenamiento (no publicado).
- Especialización estrecha: el adaptador está entrenado para tareas de tipo TextCraft; su rendimiento en tareas generales puede ser inferior al del modelo base sin adaptar.
- Artefacto educativo: sin descargas ni validación de la comunidad, no recomendado para producción sin evaluación propia.
- Dependencia del modelo base: el adaptador no es autónomo; requiere Qwen3.5-4B y la versión de PEFT compatible.

## Enlaces

- Hugging Face: https://huggingface.co/rainaylq/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework scottyrl: no disponible en la información proporcionada
- Curso 11-768 (AI Agents, CMU): no disponible enlace directo en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
