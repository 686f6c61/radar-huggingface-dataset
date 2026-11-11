# ferry-el-kom/qwen3.8-4b-empero-base-Hermes-agentic-subagent-toolcalls

## Resumen

qwen3.8-4b-empero-base-Hermes-agentic-subagent-toolcalls (v20) es un modelo de 4.326 millones de parámetros (aproximadamente 4B) desarrollado por ferry-el-kom, derivado del modelo base Qwen3.8-4B "empero" mediante un ajuste fino supervisado con LoRA. Está especializado en tool calling y function calling multi-turno bajo el protocolo real del harness de Hermes, con un catálogo de seis herramientas (terminal, execute_code, read_file, write_file, search_files y patch). El objetivo es disponer de un subagente ligero capaz de ejecutar trabajo real sobre un harness en vivo, verificado por inspección de artefactos y no por autoinforme.

El modelo incorpora system prompts de categoría (code, file-ops, search, hardware y general) entrenados directamente en los pesos, respondiendo a un enrutador de prompts por tarea al estilo MoPs. También integra JSON Mode para salidas estructuradas estrictas sin herramientas, y una disciplina de verificación previa a la declaración de finalización (ls, cat o reejecución) para mitigar la fabricación de resultados. Los datos de entrenamiento se normalizaron para eliminar cualquier identidad de máquina (rutas, usuario, IPs, MACs), lo que favorece la portabilidad.

Se trata de un modelo de la familia Qwen3.8 con arquitectura MTP (multi-token prediction), entrenado con 2.122 ejemplos (1.953 de entrenamiento y 169 de validación) a partir de cuatro profesores en la nube (GLM-5.2/5.3 y DeepSeek), 450 ejemplos de NousResearch/hermes-function-calling-v1 y 44 trayectorias de disciplina. Es relevante para desarrolladores que necesitan un subagente de tool calling de bajo coste, desplegable en GPU de consumo, y con licencia Apache-2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8 (Qwen3_5ForCausalLM) con MTP (multi-token prediction) |
| Parametros totales | 4.326.350.848 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso SEQ 768, pero la ventana nativa del base no se especifica) |
| Tipos de cuantizacion | GGUF q8_0 publicado en el repo; el autor menciona NF4 y bf16 en el pipeline de evaluacion |
| Idiomas soportados | en (ingles), ro (rumano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-4B "empero", un base destilado de la arquitectura Qwen3.8 con MTP, y se ajusta mediante LoRA SFT desde cero (rank r=16, targets q, k, v, o, g, u, d) con LR coseno de 2e-5, precisión bf16, SEQ 768, ACCUM 16 y 244 pasos (2 épocas). El entrenamiento se ejecutó en una AMD RX 6800 XT con ROCm durante aproximadamente 6,3 horas, con loss final de 1,30 y bucket loss de 1,78 a 1,48. Tras el ajuste se realizó el merge en Qwen3_5ForCausalLM, la restauración de MTP y la exportación a GGUF q8_0.

El dataset combina 2.122 ejemplos construidos mediante extracción de ventanas de estado de cuatro sesiones de profesores en la nube (atribución condicionada), un constructor display-proof con filtros P5 para descartar turnos muertos, de autoduda o corregidos (938 ejemplos limpios), normalización universal de rutas, hostnames, IPs privadas y MACs (0 residuos de 4.405), y una mezcla final con 450 ejemplos single-shot de hermes-function-calling-v1, 44 trayectorias de disciplina (incluyendo 8 de JSON Mode) y smoltalk. A cada ejemplo se le asigna uno de los cinco system prompts de categoría. La plantilla de chat (ChatML con bloques `<tools>` y `<tool_call>` más etiquetas de thinking) está embebida en `tokenizer_config.json` y también se distribuye como `chat_template.jinja`.

## Capacidades

- Tool calling multi-turno sobre el protocolo del harness de Hermes con seis herramientas: terminal, execute_code, read_file, write_file, search_files y patch, con parse-retry, loop-guard y verify-gate.
- System prompts de categoría entrenados en los pesos (code, file-ops, search, hardware, general), pensados para un enrutador de prompts por tarea.
- JSON Mode: salidas estructuradas estrictas sin uso de herramientas.
- Verificación antes de finalizar: el modelo está entrenado para comprobar el estado real (ls, cat, reejecución) antes de declarar completada una tarea, como mecanismo antifabricación.
- Portabilidad: direccionamiento dinámico de dispositivos y puertos (lsusb a /dev/serial/by-id) y comprobaciones de versión de python3, sin identidad de máquina en los datos.
- Generación de texto conversacional y soporte de agentes multi-paso dentro del harness.
- Capacidades multilingües limitadas a inglés y rumano.
- Modo thinking con gating (el autor reporta que el 33,7 % de los turnos usan razonamiento explícito).

## Casos de uso

- Automatización de tareas de terminal en un subagente: el modelo puede encadenar llamadas a terminal, read_file y patch para inspeccionar un repositorio, aplicar cambios y verificar el resultado antes de reportar, lo que encaja con pipelines de CI/CD que requieren confirmación de artefactos.
- Agente de operaciones de ficheros: con write_file, search_files y patch, resulta adecuado para tareas de refactorización, búsqueda de patrones y edición controlada dentro de un directorio asignado, con la disciplina de workdir supervisada por el harness.
- Enrutador de tareas con system prompts de categoría: al tener los prompts code, file-ops, search, hardware y general entrenados en los pesos, puede integrarse detrás de un router que seleccione el prompt adecuado por tarea sin coste adicional de ingeniería de prompts.
- Extracción de datos estructurados: JSON Mode permite generar salidas estrictas y parseables para alimentar pipelines de ingestión, formularios o APIs sin necesidad de herramientas externas.
- Diagnóstico de hardware y puertos serie: el direccionamiento dinámico (lsusb, /dev/serial/by-id) y las comprobaciones de versión de python3 lo hacen útil en entornos de laboratorio o dispositivos embebidos donde la identidad de máquina no debe codificarse en el modelo.
- Subagente de bajo coste en GPU de consumo: con 4B parámetros y GGUF q8_0, puede desplegarse en una RX 6800 XT o en GPUs consumer equivalentes para tareas de agente ligero, reduciendo el coste frente a modelos de mayor tamaño.
- Verificación de estado en tareas de automatización: la disciplina de verificación antes de finalizar sirve para tareas donde la fabricación de resultados es costosa, como comprobación de despliegues o validación de configuraciones.

## Benchmarks y rendimiento

| Metrica | v20 | v9 (campeon) | v13 | v15 | v17 | v18 |
|---|---|---|---|---|---|---|
| agent-loop12 (ollama) | 9/12 (4,4 turnos) | 9/12 | 7/12 | 11/12* | 11/12* | 10/12* |
| Harness smoke (7 tareas reales, artefactos verificados) | 5/7 reales | no disponible | no disponible | fabricado | no disponible | desviado |
| Grammar: ident / json | 5/5 / True | no disponible | no disponible | no disponible | no disponible | no disponible |

*Puntuaciones de sandbox eval de la era previa al harness, no comparables con las puntuaciones de harness.

Referencias externas en la misma suite de harness smoke: hermes3-3b (Nous, 3B) fabrica de forma instantánea; qwen3.8-9b-hermes-function-calling-v2 se desvía (rutas de Windows, extracción de prompt). Según el autor, v20 es el único modelo de clase 4B que ejecutó las tareas con herramientas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.326 millones de parámetros, en q8_0 el peso ocupa aproximadamente 4,3 GB, y en bf16 aproximadamente 8,7 GB, sin contar overhead de contexto y KV cache.
- GPU recomendadas: no disponible en la información proporcionada. El autor entrenó en una AMD RX 6800 XT (16 GB) con ROCm, lo que sugiere que cabe en GPUs consumer de 16 GB en cuantización q8_0.
- Cabe en GPU consumer: sí, según el entrenamiento y la exportación q8_0 en una RX 6800 XT; no se especifican otras GPU consumer concretas.
- Opciones de despliegue: transformers (con `trust_remote_code=True` y `fix_mistral_regex=True`), Ollama a partir del GGUF q8_0 del repo (`ollama create qwen38-hermes-agentic-v20 -f Modelfile.ollama`). El autor indica que la generación en NF4 y bf16 está rota en ROCm y que la evaluación se hizo solo en Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-4b-empero-base-Hermes-agentic-subagent-toolcalls (v20) | 4,33B | no disponible | Tool calling multi-turno sobre harness Hermes, JSON Mode, verificación | Apache-2.0 | Hugging Face (safetensors + GGUF q8_0) |
| hermes3-3b (Nous) | 3B | no disponible | Tool calling generalista | no disponible en la informacion | Hugging Face |
| qwen3.8-9b-hermes-function-calling-v2 | 9B | no disponible | Function calling | no disponible en la informacion | Hugging Face |

Según la model card, en la suite harness smoke de 7 tareas reales con artefactos verificados, v20 obtuvo 5/7 reales, mientras que hermes3-3b fabricó de forma instantánea y qwen3.8-9b-hermes-function-calling-v2 se desvió con rutas de Windows y extracción de prompt. No se dispone de datos de benchmarks estandarizados (MMLU, HumanEval, GSM8K) para ninguno de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Fabricación del informe final: el modelo aún puede reportar sin verificar; se recomienda mitigar con reporte condicionado por artefactos a nivel de harness.
- Disciplina de directorio de trabajo: puede escribir fuera del directorio asignado; conviene supervisar o restringir mediante configuración del harness.
- Razonamiento de 4B: las cadenas de razonamiento largas se degradan; el autor recomienda gating de thinking (33,7 % de los turnos).
- Idiomas limitados a inglés y rumano; no hay soporte declarado de castellano.
- Longitud de contexto nativa no documentada; el entrenamiento usó SEQ 768, lo que puede limitar la generalización a ventanas muy largas.
- Generación en NF4 y bf16 rota en ROCm según el autor; la evaluación se realizó solo con Ollama y GGUF q8_0.
- Licencia Apache-2.0: permite uso comercial, pero los datasets de entrenamiento se publican como datasets privados de HF, lo que limita la reproducibilidad completa.
- Riesgo de sesgos: no disponible en la información proporcionada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y validación comunitaria aún inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ferry-el-kom/qwen3.8-4b-empero-base-Hermes-agentic-subagent-toolcalls
- Dataset SFT (privado): https://huggingface.co/datasets/ferry-el-kom/qwen3.8-v20-hermes-agentic-sft
- Dataset de fuentes SFT (privado): https://huggingface.co/datasets/ferry-el-kom/qwen3.8-v20-sft-sources
- Dataset de referencia de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
