# davidheineman/opd-teacher-Q2.5I-CRT-step149

## Resumen

opd-teacher-Q2.5I-CRT-step149 es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct desarrollado por David Heineman como parte de un experimento de destilacion on-policy (OPD) sobre 32 entornos. El modelo actua como "teacher" (profesor) dentro de ese experimento: se entreno con RLVE y GRPO durante 150 actualizaciones sobre el entorno denominado CRT en dificultad 0, y el checkpoint publicado corresponde a la actualizacion final (indice zero-based 149).

Se trata de un modelo denso de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), heredero de la arquitectura Qwen2, con licencia Apache 2.0 y pesos en safetensors listos para `transformers`. Su relevancia es fundamentalmente investigadora: sirve para reproducir y auditar una fase concreta de un pipeline de destilacion, no como un asistente generalista de proposito comercial.

El modelo no declara datos propios de contexto, cuantizacion o benchmarks en su model card, por lo que buena parte de las especificaciones practicas deben inferirse del modelo base o quedar como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (derivado de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles declarado); el modelo base Qwen2.5 es multilingue, pero este ajuste solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct sin modificaciones estructurales: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm y embeddings atados, con aproximadamente 1,54 B de parametros densos. Los pesos se convirtieron desde el checkpoint nativo final del entrenamiento a safetensors para Hugging Face y, segun la model card, se validaron contra los nombres y formas de tensor del modelo base.

El entrenamiento consistio en 150 actualizaciones de GRPO (Group Relative Policy Optimization) sobre el entorno `CRT` en dificultad 0, dentro del marco RLVE del proyecto `davidheineman/rlve`. El modelo esta pensado como profesor en un experimento de destilacion on-policy que abarca 32 entornos (de un total de 400 segun la coleccion del autor). No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni fases de RLHF o DPO adicionales; tampoco se detalla la naturaleza concreta del entorno CRT ni el significado desarrollado de las siglas RLVE.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste de instrucciones de Qwen2.5-1.5B-Instruct.
- Seguimiento de instrucciones en formato chat (tag `conversational`, `text-generation`).
- Comportamiento especializado en el entorno CRT: el ajuste con GRPO busca reforzar la resolucion de las tareas de ese entorno concreto.
- Funcion como profesor en destilacion on-policy: generacion de trayectorias o senales de supervision para entrenar otros modelos.
- Compatibilidad con Text Generation Inference y endpoints compatibles, segun los tags del repositorio.
- Soporte de tool calling / function calling: no confirmado para este checkpoint (el modelo base Qwen2.5 lo soporta, pero la model card no lo declara).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.
- Capacidades multilingues: solo se declara ingles, aunque el modelo base es multilingue.

## Casos de uso

- Profesor en destilacion on-policy: generar respuestas o distribuciones de referencia sobre el entorno CRT para que un modelo alumno las imite; es exactamente el uso para el que fue entrenado dentro del experimento de 32 entornos.
- Reproduccion de experimentos de RL: volver a ejecutar el entrenamiento con GRPO y comparar el checkpoint `step149` con estados intermedios para estudiar la dinamica de la recompensa.
- Baseline de investigacion en RLVE: usar este checkpoint como referencia frente a otros profesores de la coleccion `rlve-opd-teachers` entrenados en entornos distintos.
- Generacion de datos sinteticos para un dominio acotado: producir pares pregunta-respuesta filtrados por el comportamiento aprendido en el entorno CRT, utiles para ampliar datasets de entrenamiento.
- Asistente local de bajo coste: con 1,54 B de parametros cabe en GPUs de consumo y permite prototipar aplicaciones de chat en ingles sin depender de APIs externas.
- Pruebas de integracion de infraestructura: al ser compatible con `text-generation-inference` y endpoints compatibles, sirve para validar pipelines de despliegue antes de escalar a modelos mayores.
- Ablacion de tecnicas de post-entrenamiento: comparar el efecto de 150 pasos de GRPO frente al modelo base sin ajuste sobre las mismas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni metricas de recompensa del entorno CRT, y las unicas referencias de seguimiento son el run de W&B y el grupo de sweep indicados en los enlaces.

## Requisitos de hardware

- VRAM para pesos en fp16/bf16: aproximadamente 3,1 GB (coincide con el tamano del repositorio); con cache KV y overhead de runtime, entorno a 4-5 GB.
- VRAM en cuantizacion de 8 bits: aproximadamente 1,6-2 GB de pesos.
- VRAM en cuantizacion de 4 bits: aproximadamente 1-1,5 GB de pesos.
- Cabe sin problemas en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en GPUs de 6-8 GB si se cuantiza.
- GPU de datacenter recomendadas para lotes grandes o destilacion masiva: A100, H100, L40S; el modelo es lo bastante pequeno como para ejecutar muchas instancias en paralelo por GPU.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), Text Generation Inference (soportado segun los tags), vLLM y llama.cpp/Ollama solo si se genera previamente una conversion a GGUF, que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-CRT-step149 | 1,54 B | no especificado (base: 32.768) | Apache 2.0 | Hugging Face, safetensors | Ajuste GRPO especifico del entorno CRT |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens nativos | Apache 2.0 | Hugging Face, safetensors/GGUF | Modelo base sin RL; asistente generalista |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens nativos | Apache 2.0 | Hugging Face, safetensors/GGUF | Alternativa mas ligera de la misma familia |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, safetensors/GGUF | Contexto mayor, licencia con restricciones |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad publicos.

## Limitaciones y advertencias

- Es un artefacto de investigacion: el autor lo describe explicitamente como profesor para un experimento de destilacion, no como modelo listo para produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad fuera del entorno CRT.
- Especializacion estrecha: 150 pasos de GRPO sobre un unico entorno (dificultad 0) pueden degradar el comportamiento generalista del modelo base en tareas ajenas a ese entorno.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual ni tasas de alucinacion.
- Idioma: solo se declara ingles; el rendimiento en castellano u otras lenguas no esta garantizado aunque el modelo base sea multilingue.
- Contexto: la model card no especifica ventana; si se hereda la del base, se limita a 32.768 tokens y la extension con YaRN no esta confirmada para este checkpoint.
- Licencia: Apache 2.0 permite uso comercial, pero se mantiene la licencia original de Qwen incluida en el archivo `LICENSE` del repositorio.
- Trazabilidad limitada: el dataset de entrenamiento no se documenta, por lo que no puede auditarse la composicion ni los posibles sesgos heredados.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fecha de publicacion futura respecto al momento de redaccion en algunos contextos: conviene verificar que el checkpoint no se haya actualizado o retirado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-CRT-step149
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/8cca8979
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Paper de referencia citado en la coleccion: https://arxiv.org/abs/2511.07317
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Perfil del autor: https://huggingface.co/davidheineman
