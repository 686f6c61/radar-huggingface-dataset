# pingyijinren/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensored" (tambien etiquetada como abliterated o uncensored) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario pingyijinren. El modelo base es un fine-tune orientado a razonamiento de Qwen3.5-9B, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". Esta version concreta aplica la herramienta Heretic v2.0.0.dev0 mediante una tecnica de ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) para reducir la tasa de rechazos del modelo original.

El modelo conserva la arquitectura y el tamano del base: 9.409.813.744 parametros totales (aproximadamente 9,4 mil millones), pesos en safetensors y un repositorio de 18,8 GB. La model card del autor del fine-tune original indica que el entrenamiento se concentra en matematicas y resolucion de problemas STEM, con aproximadamente 250.000 muestras supervisadas, e incluye evaluaciones con rutas de despliegue vLLM NVFP4 y llama.cpp MTP-Q8_0.

La relevancia de esta ficha radica en que combina dos tendencias: la destilacion de modelos grandes de razonamiento hacia la clase de 9B parametros, desplegable en hardware mas modesto, y la modificacion post-entrenamiento para eliminar comportamientos de rechazo. El autor reporta una reduccion de rechazos de 100/100 en el modelo original a 3/100 en esta variante, con una divergencia KL de 0,0422 respecto al base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), segun tag `qwen3_5`; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; se mencionan evaluaciones en NVFP4 (vLLM) y MTP-Q8_0 (llama.cpp) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5 con 9,4 mil millones de parametros, afinado sobre el checkpoint Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B. Ese modelo base se describe como un fine-tune orientado a razonamiento, destilado a partir de respuestas de DeepSeek-V4-Pro en modo "Max Effect", con una senal de supervision concentrada en matematicas y resolucion de problemas STEM (aproximadamente 250.000 muestras). Los tags del repositorio mencionan tecnicas de SFT, RL, GSPO (Group Sequence Policy Optimization), tool-use, function-calling y MTP (Multi-Token Prediction).

Sobre esa base, esta variante aplica Heretic v2.0.0.dev0 con una ablacion de rango arbitrario (ARA) entre las capas 9 y 24, con los parametros `preserve_good_behavior_weight` = 0,8264, `steer_bad_behavior_weight` = 0,0003, `overcorrect_relative_weight` = 0,9645 y `neighbor_count` = 12. El autor reporta una tasa de rechazos de 3/100 frente a 100/100 del original y una divergencia KL de 0,0422. No se detalla la composicion completa del dataset de destilacion ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con enfasis en descomposicion estructurada de problemas.
- Razonamiento matematico y STEM, principal foco del entrenamiento supervisado.
- Soporte de tool calling y function calling (segun tags del repositorio).
- Capacidades de agente y razonamiento multi-paso (tags `tool-use`, `reasoning`).
- Capacidad multimodal imagen-texto segun el tag `image-text-to-text` del repositorio; no se detalla su alcance.
- Multilingue: ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento ("thinking") heredado del proceso de destilacion del modelo base.
- Comportamiento "decensored": reduccion de rechazos segun la metrica reportada por el autor.
- Prediccion multi-token (MTP) segun los tags del repositorio.

## Casos de uso

- Resolucion de problemas matematicos y cientificos: el modelo se entreno con unas 250.000 muestras centradas en matematicas y STEM, por lo que es adecuado para asistencia en calculo, algebra, fisica y quimica con descomposicion paso a paso.
- Generacion de codigo y scripting: los tags indican mejoras de transferencia cruzada en programacion y tool use, lo que permite usarlo en tareas de generacion y revision de codigo, aunque sin SFT especifico de codigo.
- Integracion en pipelines con function calling: el soporte de tool calling permite conectarlo a APIs externas, bases de datos o motores de busqueda en flujos automatizados.
- Agentes de razonamiento multi-paso: su capacidad de descomposicion y el soporte de herramientas lo hacen util para tareas que requieren planificacion y ejecucion secuencial.
- Despliegue en hardware de gama media: con 9,4B parametros y licencia Apache 2.0, puede servirse en una sola GPU consumer o en entornos con vLLM o llama.cpp (el autor evalua NVFP4 y MTP-Q8_0).
- Investigacion sobre alineacion y seguridad: al ser una variante abliterated con metricas de rechazo y KL reportadas, sirve como objeto de estudio para analizar el efecto de la ablacion sobre el comportamiento del modelo.
- Asistencia multilingue: cubre seis idiomas (en, zh, ko, ja, es, ru) para tareas de generacion y razonamiento en entornos multilingues.

## Benchmarks y rendimiento

La model card del autor solo reporta metricas del proceso de decensoring, no benchmarks estandar de razonamiento o codigo.

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9,4B parametros, en FP16 requeriria aproximadamente 19 GB, en cuantizacion de 8 bits unos 9-10 GB y en 4 bits unos 5-6 GB (estimaciones genericas, no confirmadas por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 (24 GB) o A100/H100 permitirian FP16 sin problemas, y GPUs consumer de 8-12 GB podrian servir con cuantizacion.
- Cabe en GPU consumer: previsiblemente si, en modelos con 12 GB o mas usando cuantizacion; no confirmado en la informacion disponible.
- Opciones de despliegue: vLLM (ruta NVFP4 evaluada) y llama.cpp (ruta MTP-Q8_0 evaluada); tambien transformers y text-generation-inference segun los tags.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Variante decensored con ablacion ARA |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Modelo base, 100/100 rechazos reportados |
| Qwen3.5-9B (familia base) | ~9B | no disponible | no disponible | Arquitectura de partida del fine-tune |

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- La ablacion de rechazos puede degradar la calidad en tareas que requieren matices de seguridad o respuestas prudentes; el autor reporta una divergencia KL de 0,0422 respecto al base, pero no se detalla el impacto cualitativo.
- Riesgo de alucinacion inherente a los modelos de 9B destilados; no hay evaluaciones publicadas de fidelidad.
- El entrenamiento supervisado se centra en matematicas y STEM; el rendimiento en codigo u otras areas es una transferencia cruzada no medida con benchmarks.
- No se especifica la longitud de contexto soportada, lo que limita la planificacion de despliegues con documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero el caracter "uncensored" implica que el despliegue en produccion requiere filtros y politicas de seguridad propios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- El tag `image-text-to-text` sugiere capacidad multimodal, pero no se documenta su alcance ni sus limitaciones.

## Enlaces

- Hugging Face: https://huggingface.co/pingyijinren/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Heretic: https://heretic-project.org
- Espejo del repositorio: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
