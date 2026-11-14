# shaban2024/Qwen3.5-4B-BOS-Non-Thinking

## Resumen

BH-LLM v05-4B Non-Thinking es un ajuste fino del modelo base `alphaedge-ai/Qwen3.5-4B-bos-32768`, orientado a generación de texto y uso como agente conversacional en bosnio. Lo publica el usuario `shaban2024` bajo licencia Apache-2.0 y combina una etapa de SFT con LoRA (`4b-jt31-thunder`) seguida de una etapa de DPO con LoRA (`4b-dpo03-thunder`, 160 pares), fusionadas en dos pasos sobre el modelo base. El resultado es un checkpoint completo en bf16 (safetensors, 7,3 GB) con 3.653.938.176 parámetros reales.

La relevancia del modelo es acotada y muy específica: cubre la franja de modelos pequeños (entorno a 4B) con capacidades de *function calling* y comportamiento de agente en un idioma de bajos recursos como el bosnio, un nicho poco atendido por los modelos generalistas. El autor lo enmarca dentro de su propio banco de evaluación, AgentMujo-Bench v0.5 (48 casos), y publica métricas parciales de selección de herramienta, validez de JSON y seguridad.

Conviene subrayar que la model card documenta de forma explícita un fallo de formato en la métrica `argument_accuracy` (0.0 por comparación estricta, no por incapacidad del modelo) y una limitación conocida en `no_tool_correctness` (0.25). El modelo se distribuye con la etiqueta `non-thinking`, es decir, sin modo de razonamiento extendido, y está pensado para inferencia directa en transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 3.653.938.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (según el nombre del modelo base `...-32768`) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos bf16; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | bosnio (`bs`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, repo de 7,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de `alphaedge-ai/Qwen3.5-4B-bos-32768` (revisión `34a621915a6214ab9d28f74142840d8cd5bc0acb`), un checkpoint de la familia Qwen3.5 adaptado al bosnio con ventana de contexto de 32.768 tokens. Sobre esa base se aplica un ajuste en dos fases: primero un LoRA de SFT (`4b-jt31-thunder`, con eval 0.84) y después un LoRA de DPO (`4b-dpo03-thunder`, 160 pares), manteniendo el orden SFT-DPO. Los adaptadores se publican por separado en `shaban2024/agentmujo-adapters` y la fusión se realiza en dos pasos hasta obtener un checkpoint completo en bf16.

El entrenamiento está orientado a comportamiento de agente: selección de herramientas, generación de llamadas con argumentos en JSON y pautas de confirmación y rechazo. El framework utilizado es `agentmujo-training` (github.com/xnet-ba/agentmujo-training). No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni los hiperparámetros del SFT y del DPO. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal; la etiqueta `non-thinking` indica que no se activa un modo de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en bosnio, con soporte explícito del dialecto ijekavica (métrica `ijekavica_dialect` = 1.0 en el banco del autor).
- *Function calling* / *tool calling*: el modelo selecciona herramientas y emite llamadas en JSON; `json_validity` = 1.0 en AgentMujo-Bench v0.5.
- Comportamiento de agente de un solo paso orientado a la ejecución de herramientas, con pautas de confirmación (`confirmation_behavior` = 0.4) y rechazo (`refusal_correctness` = 0.8).
- Modo no-thinking: respuestas directas sin cadena de razonamiento explícita.
- Capacidad limitada de abstención: `no_tool_correctness` = 0.25, es decir, tiende a invocar herramientas cuando no corresponde.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento multi-paso complejo.
- Compatible con endpoints (tag `endpoints_compatible`) y con la librería `transformers`.

## Casos de uso

- Asistente de atención al cliente en bosnio: el modelo puede mantener conversaciones multi-turno con hasta 32.768 tokens de contexto y responder en el dialecto ijekavica, lo que encaja con usuarios de Bosnia y Herzegovina.
- Automatización de tareas administrativas mediante *tool calling*: dado que `json_validity` es 1.0, puede emitir llamadas estructuradas a APIs internas (consulta de estado, creación de tickets) con un postprocesado que normalice los argumentos.
- Agente de consola o *copilot* para operaciones de sistemas: el ejemplo de la model card (argumento `"nginx"` para una herramienta de servicio) sugiere uso en tareas de administración donde el modelo elige la herramienta y pasa parámetros simples.
- Prototipado rápido de agentes en investigación: al ser un checkpoint de 3,65B en bf16 (7,3 GB), se puede desplegar en una única GPU de gama media para experimentar con pipelines de agentes en un idioma de bajos recursos.
- Generación de datos sintéticos y aumentación en bosnio: útil para crear pares instrucción-respuesta o ejemplos de llamadas a herramientas que alimenten otros entrenamientos.
- Filtrado y clasificación con salida JSON: la validez garantizada de JSON permite usarlo como clasificador de intenciones o extractor de entidades en pipelines de datos, siempre con validación posterior del esquema.
- Evaluación comparativa de agentes en lenguas eslavas del sur: sirve como referencia dentro de AgentMujo-Bench para contrastar futuros ajustes del mismo autor.

## Benchmarks y rendimiento

Resultados publicados en la model card para AgentMujo-Bench v0.5 (48 casos, GPU T4, temperatura 0, modo non-thinking, 2026-11-12):

| Metrica | v05 |
|---|---|
| tool_selection | 0.733 |
| argument_accuracy | 0.0 (comparación estricta; ver nota) |
| json_validity | 1.0 |
| safety | 0.857 |
| refusal_correctness | 0.8 |
| confirmation_behavior | 0.4 |
| high_level_preference | 0.6 |
| no_tool_correctness | 0.25 |
| ijekavica_dialect | 1.0 |

El autor aclara que la cifra de `argument_accuracy` refleja un problema de formato y no de capacidad: el modelo elige la herramienta y los valores correctos, pero los envuelve en saltos de línea (`"\nnginx\n"` frente a `"nginx"`) y añade argumentos opcionales no esperados, lo que el scorer de igualdad estricta penaliza por completo. La comparación con la versión v0.4 no es directa porque cambian la versión del banco y el scorer. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 7,3 GB solo para los pesos, más el *overhead* de activaciones y caché KV; con contexto largo (32.768 tokens) el consumo crece de forma apreciable.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente con contexto completo; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en tarjetas de 16 GB o más en bf16 para contextos cortos; en 8-12 GB requeriría cuantización, que no se distribuye en el repo.
- Opciones de despliegue: `transformers` de forma nativa; vLLM o TGI para servicio con *batching*; llama.cpp u Ollama solo si se generan cuantizaciones GGUF a partir de los pesos bf16 (no publicadas).
- Latencia y throughput: no disponibles. La evaluación del autor se ejecutó en una T4, sin cifras de tokens por segundo publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| BH-LLM v05-4B Non-Thinking | 3,65B | 32.768 | Apache-2.0 | Agente y function calling en bosnio |
| Modelo base `alphaedge-ai/Qwen3.5-4B-bos-32768` | ~4B | 32.768 | no disponible en la información | Base bosnia sin ajuste de agente |
| Qwen3.5-4B (original) | ~4B | no disponible en la información | no disponible en la información | Modelo generalista multilingüe |
| Alternativas de 3-4B para agentes en lenguas de bajos recursos | no disponible | no disponible | no disponible | No se dispone de datos comparables |

No se dispone de resultados de benchmarks comunes que permitan una comparación numérica fiable con otras alternativas; el autor solo publica métricas de su propio banco y advierte que la comparación con v0.4 no es directa.

## Limitaciones y advertencias

- `argument_accuracy` = 0.0 con el scorer estricto actual: los argumentos llegan con espacios y saltos de línea extra y con argumentos opcionales no solicitados; requiere normalización o postprocesado antes de usarse en producción.
- `no_tool_correctness` = 0.25: el modelo tiende a invocar herramientas cuando la respuesta correcta sería no invocarlas, lo que puede provocar acciones no deseadas en agentes autónomos.
- `confirmation_behavior` = 0.4: la pauta de pedir confirmación antes de ejecutar acciones sensibles es débil; no es adecuado para operaciones destructivas sin una capa de validación externa.
- Cobertura lingüística limitada al bosnio (`bs`); no se garantiza un comportamiento correcto en croata, serbio u otros idiomas, ni en inglés.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de veracidad ni de conocimiento factual.
- Sesgos no documentados: no hay información sobre la composición del dataset de SFT y DPO ni sobre sesgos demográficos o políticos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y los adaptadores deben verificarse por separado; la licencia del checkpoint base `alphaedge-ai/Qwen3.5-4B-bos-32768` no se detalla en la información disponible.
- Modelo de nicho con 31 descargas y 0 likes en el momento de la consulta: no hay validación externa ni comunidad que respalde su robustez en producción.
- El modo `non-thinking` limita el razonamiento multi-paso; no debe esperarse un rendimiento comparable al de modelos con cadena de pensamiento en tareas complejas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shaban2024/Qwen3.5-4B-BOS-Non-Thinking
- Adaptadores LoRA: https://huggingface.co/shaban2024/agentmujo-adapters
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-4B-bos-32768
- Framework de entrenamiento: https://github.com/xnet-ba/agentmujo-training
- Kernel de evaluación: https://www.kaggle.com/code/admiragic/bh-v05-4b-eval-merged-full
