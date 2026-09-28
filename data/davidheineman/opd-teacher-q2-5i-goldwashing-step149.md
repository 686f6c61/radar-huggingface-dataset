# davidheineman/opd-teacher-Q2.5I-GoldWashing-step149

## Resumen

opd-teacher-Q2.5I-GoldWashing-step149 es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct desarrollado por el usuario davidheineman. Se trata de un modelo "teacher" entrenado con RLVE sobre un único entorno de entrenamiento denominado GoldWashing, con dificultad 0, y forma parte de un experimento de destilación on-policy (OPD) que abarca 32 entornos de un total de 400. No es un modelo de propósito general: es un artefacto de investigación pensado para actuar como profesor dentro de ese experimento.

El modelo parte de la arquitectura Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.543.714.304 parametros (aproximadamente 1,54 mil millones). El ajuste se realizó mediante GRPO durante 150 actualizaciones, y el checkpoint publicado, step149, es el índice final (zero-based) de ese entrenamiento. Los pesos se convirtieron desde el checkpoint nativo final a safetensors de Hugging Face, validando que los nombres y las formas de los tensores coinciden con los del modelo base.

Su relevancia es acotada y fundamentalmente metodológica: sirve para reproducir y estudiar un pipeline de destilación on-policy sobre entornos RLVE, más que para despliegues de producción directos. La licencia Apache 2.0 y el soporte nativo en transformers permiten inspeccionarlo y reutilizarlo sin fricción, pero su especialización en un único entorno limita mucho su utilidad fuera de ese contexto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5, segun tag `qwen2`) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,54 mil millones de parametros con atencion causal y tokenizador BPE. No se ha introducido ninguna modificacion estructural: el ajuste se aplica sobre los pesos del modelo base y se valida que los nombres y las formas de los tensores coinciden con los del original, lo que confirma que la topologia se mantiene intacta.

El entrenamiento siguió un procedimiento de aprendizaje por refuerzo con GRPO durante 150 actualizaciones sobre el entorno GoldWashing (dificultad 0), dentro del marco RLVE descrito en el paper arXiv:2511.07317. El modelo está diseñado como profesor de un experimento de destilación on-policy que cubre 32 entornos; el sufijo step149 corresponde al indice zero-based del ultimo checkpoint (la actualizacion numero 150). El run esta registrado en Weights & Biases bajo el grupo de barrido opd-teachers-20260927-191939, y el codigo de entrenamiento es publico en el repositorio davidheineman/rlve. No se dispone de informacion sobre el volumen de tokens, la composicion del dataset ni si se aplicaron fases adicionales de RLHF o DPO más alla del propio GRPO.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-1.5B-Instruct (tag `conversational`).
- Razonamiento orientado a la tarea especifica del entorno GoldWashing, tras el ajuste con GRPO.
- Funcion como modelo profesor (teacher) para destilacion on-policy en el experimento OPD.
- Inferencia compatible con text-generation-inference y con transformers (`text-generation-inference`, `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Destilacion on-policy como profesor: el modelo puede emplearse como fuente de supervision en el experimento OPD para el que fue entrenado, generando trayectorias de referencia sobre el entorno GoldWashing.
- Reproduccion de experimentos RLVE: sirve como checkpoint de referencia para validar pipelines de entrenamiento con GRPO sobre entornos verificables.
- Investigacion en aprendizaje por refuerzo: permite estudiar el efecto de 150 actualizaciones de GRPO sobre un modelo de 1,5B en un unico entorno de dificultad 0.
- Analisis de especializacion de entornos: util para comparar el comportamiento de este teacher frente a los otros 31 del mismo experimento y medir el grado de sobreajuste al entorno GoldWashing.
- Generacion de texto en ingles de bajo coste: por su tamano (1,54B) puede ejecutarse en hardware modesto para tareas simples de generacion, aunque sin las garantias de un modelo de propósito general.
- Base para nuevos ajustes: al compartir tensor names y shapes con Qwen2.5-1.5B-Instruct, puede reutilizarse como punto de partida en experimentos posteriores de RL o de fine-tuning supervisado.
- Evaluacion de robustez/deriva: sirve para medir cuanto se degradan las capacidades generales del modelo base tras un ajuste intensivo en un unico entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 3,1 GB solo para pesos (el repositorio ocupa 3,1 GB), más el espacio de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion INT8: aproximadamente 1,6-2 GB.
- VRAM estimada en cuantizacion INT4: aproximadamente 0,9-1,2 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente; cabe holgadamente en RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, y también en GPUs de datacenter como A100 o H100 (ampliamente sobredimensionadas para este tamano).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 6 GB o más de VRAM.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference`), vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no publicada en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-GoldWashing-step149 | 1,54B | No disponible | Sin benchmarks publicados | Apache 2.0 | Hugging Face (transformers, safetensors) |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,54B | No disponible en la informacion | No disponible en la informacion | Apache 2.0 | Hugging Face |
| Otros teachers del experimento RLVE OPD | No disponible | No disponible | No disponible | No disponible | Coleccion RLVE OPD Teachers en Hugging Face |

Este modelo es, por construccion, una variante especializada del propio Qwen2.5-1.5B-Instruct; la comparacion con alternativas de la misma categoria de tamano no puede completarse con los datos disponibles.

## Limitaciones y advertencias

- Es un artefacto de investigacion: fue entrenado como teacher para un experimento concreto de destilacion on-policy, no como asistente de propósito general.
- Especializacion extrema: el ajuste se realizo sobre un unico entorno (GoldWashing, dificultad 0), por lo que su comportamiento fuera de ese contexto puede degradarse frente al modelo base.
- Idioma: solo se declara soporte para ingles; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 1,5B, el riesgo de respuestas factualmente incorrectas es relevante en tareas abiertas.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Longitud de contexto: no especificada, lo que impide planificar cargas con secuencias largas sin verificacion previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE incluido y la licencia original de Qwen.
- Uso en produccion: desaconsejado en su forma actual salvo que se valide aguas abajo; su proposito documentado es servir de profesor en un pipeline de destilacion.
- Escasez de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-GoldWashing-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/16beff02
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Paper relacionado (RLVE): https://arxiv.org/abs/2511.07317
