# ferry-el-kom/qwen3.8-4b-empero-v21-Hermes-agentic-subagent-toolcalls

## Resumen

qwen3.8-4b-empero-v21-Hermes-agentic-subagent-toolcalls es un modelo de lenguaje de 4.326 millones de parámetros derivado de empero-ai/Qwen3.8-4B-Distill mediante LoRA SFT. Lo desarrolla el usuario independiente ferry-el-kom dentro de la familia "empero" y está especializado en actuar como subagente de tool calling bajo el protocolo del harness Hermes Agent. Su propósito no es la conversación generalista, sino ejecutar bucles multi-turno de llamadas a herramientas (terminal, lectura/escritura de ficheros, patch y búsqueda) con verificación de estado antes de declarar una tarea completada.

El modelo se entrenó sobre aproximadamente 2.921 ventanas de entrenamiento destiladas de profesores en la nube (GLM-5.2/5.3 y DeepSeek Pro) más 140 trayectorias "golden" verificadas por replay real, es decir, comandos efectivamente ejecutados con sus errores capturados. La model card declara resultados de 11/12 en el canary agent-loop12 y un promedio de 3,2 turnos por tarea, con cero casos de fabricación de valores en una suite de 30 tareas.

Es relevante ahora porque ofrece un subagente de 4B orientado a operaciones reales de sistema (shell, ficheros, hardware embebido) que cabe en GPUs de consumo y se distribuye con cuantizaciones GGUF y plantilla de chat de tool calling. La versión v21 está marcada como DISCONTINUED por el autor, sustituida por la v24 de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5_text`); ajuste LoRA sobre el modelo base |
| Parametros totales | 4.326.350.848 (4,33B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k recomendado en serving (`num_ctx 64k`); contexto nativo del base no disponible |
| Tipos de cuantizacion | q8_0, q6_K, q4_K_M, f16, bf16 |
| Idiomas soportados | en, ro |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (f16/bf16) y GGUF; incluye `chat_template.jinja` y `Modelfile.ollama` |

## Arquitectura y entrenamiento

El modelo parte de empero-ai/Qwen3.8-4B-Distill, un transformer de la familia Qwen3.5 con 4,33B parámetros, y se ajusta con un LoRA fresco (no apilado sobre adaptadores previos) de rango 32, alpha 64 y aplicación all-linear. El entrenamiento consistió en 396 pasos, 2 épocas, learning rate 2e-5 y batch 16, ejecutado en una única GPU RX 6800 XT de 16 GB mediante el pipeline Hermes Agent. La configuración de datos incluye 2.921 ventanas (frente a 1.953 en v20), de las cuales 140 son trayectorias golden verificadas por replay, con un 41% de ventanas con "think" y un 12% sin llamada a herramienta.

La innovación principal no está en la arquitectura sino en la disciplina de datos: normalización de rutas, IPs y hostnames para eliminar identidad de máquina, lecturas sin sudo, disciplina de stdin con `/dev/null`, think-gating ajustado y ejemplos golden con errores reales. El entrenamiento usa un system prompt distinto por categoría de tarea (code, files, searching, hardware, general) y expone cinco herramientas con esquema: `terminal`, `read_file`, `write_file`, `patch` y `search_files`. Los datos de entrenamiento son privados por revisión de licencias de los profesores y están disponibles bajo petición a colaboradores.

## Capacidades

- Generación de texto orientada a ejecución de tareas, no a conversación abierta.
- Tool calling / function calling con esquema JSON y una llamada por turno.
- Bucles de agente multi-turno con lectura de respuestas de herramienta y verificación de estado.
- Operación de shell: ejecución de comandos en un workdir con cwd fijado.
- Manipulación de ficheros: lectura con numeración de líneas, escritura, parcheo por sustitución de cadenas y búsqueda por patrón o por nombre.
- Identificación dinámica de hardware (`lsusb`, `/dev/serial/by-id`) sin asumir números de puerto.
- Capacidad declarada por el autor para tareas de nivel sistema: sudo, parcheo de firmware, flasheo de MCU/ECU, construcción de ROMs y sistemas embebidos (heredada de los profesores, con advertencia explícita).
- Multilingüe limitado a inglés y rumano.
- Modo "think" con gating (41% de ventanas de entrenamiento).

## Casos de uso

- Automatización de operaciones en servidor: el modelo ejecuta comandos de shell en un workdir y verifica resultados antes de reportar, adecuado para tareas de mantenimiento repetitivas con guardarraíles externos.
- Subagente de un orquestador mayor: se integra como worker de 4B que recibe una tarea acotada y devuelve artefactos verificados, reduciendo coste frente a un modelo grande en el bucle interno.
- Edición de código asistida por parcheo: usa `patch` con `old_string`/`new_string` y `search_files` para localizar el punto de cambio, encajable en pipelines de CI/CD con revisión humana.
- Diagnóstico de hardware embebido: identifica dispositivos por `lsusb` y rutas de serial, comprueba versiones y permisos, útil en laboratorios de prototipado con MCU y dispositivos Android/Linux.
- Auditoría de sistemas de ficheros: recorrido con `search_files` y lectura con `read_file` para localizar configuraciones o patrones y citar rutas y recuentos reales.
- Generación de informes de ejecución: produce artefactos en disco tras completar una tarea, aunque el autor documenta fallos de disciplina de entrega (ruta o nombre incorrectos).
- Entornos de investigación sobre agentes: base pequeña y reproducible para estudiar tool calling, verificación y modos de fallo (sudo reflex, stdin hang) en un modelo que cabe en una GPU de consumo.

## Benchmarks y rendimiento

| Prueba | Resultado | Referencia |
|---|---|---|
| Canary agent-loop12 | 11/12 | baseline 9/12; v20 = 9/12 |
| Turnos medios (canary) | 3,2 | el más eficiente de la familia |
| Smoke suite 30 tareas | 13 pass / 15 fail / 2 INVALID | re-scored sobre artefactos |
| B7 fabricación | 0 hits | sin valores inventados en 30 tareas |
| B9 lost-list | 0 hits | checklist 10/10 con artefactos reales |
| B3 sudo reflex | 1 hit (SM20) | límite conocido |
| B11 stdin hang | 1 hit (SM22) | límite conocido |
| Disciplina de entrega | ~7 fallos | trabajo correcto, fichero en ruta o nombre erróneo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~2,5-3 GB en q4_K_M, ~3,5-4 GB en q6_K, ~4,5-5 GB en q8_0, ~8,7 GB en f16/bf16 para los 4,33B parámetros.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; el autor lo entrenó en una RX 6800 XT de 16 GB.
- GPU de datacenter (A100, H100) no necesarias por tamaño; útiles solo para servir muchas instancias en paralelo.
- Despliegue: llama.cpp y Ollama (incluye `Modelfile.ollama`, `ollama create empero-4b-tools-v21 -f Modelfile.ollama`); vLLM y TGI no confirmados en la información disponible.
- Parámetros de serving recomendados por el autor: temperatura 0,3, `num_ctx` 64k, `num_predict` 1024.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| qwen3.8-4b-empero-v21 (este) | 4,33B | 64k recomendado | Subagente tool calling Hermes | apache-2.0 | 11/12 canary, 3,2 turnos medios; v21 discontinued |
| empero-ai/Qwen3.8-4B-Distill | ~4B | no disponible | Base destilado generalista | no disponible | Modelo base sin ajuste de herramientas |
| qwen3.8-4b-empero-v20 | ~4B | no disponible | Subagente tool calling | apache-2.0 | 9/12 canary, 1.953 ventanas |
| qwen3.8-4b-empero-v24 | ~4B | no disponible | Subagente tool calling | apache-2.0 | Sucesor declarado de v21; datos no disponibles |

## Limitaciones y advertencias

- Modelo marcado como DISCONTINUED por el autor; la v24 lo sustituye.
- Entrenado y probado solo en Ubuntu 22.04; comportamiento en otros sistemas operativos desconocido.
- "Sudo reflex": puede intentar comandos con privilegios root y parcheo o reflasheo de firmware; requiere guardarraíles externos y sandbox.
- Cuelgues con programas interactivos que leen de stdin (caso SM22 documentado).
- Disciplina de entrega deficiente: ~7 fallos por escribir el informe final en ruta o con nombre incorrectos, o responder en chat en lugar de crear el fichero.
- Errores de unidades KB/MB documentados como límite conocido.
- Sensible al prompt: los resultados varían con system prompts distintos al de evaluación.
- Multilingüe limitado a inglés y rumano; sin soporte declarado de castellano.
- Riesgo de alucinación mitigado en la suite (0 hits B7) pero no eliminado; verificar artefactos siempre.
- Datos de entrenamiento privados; reproducibilidad limitada.
- Licencia apache-2.0 permite uso comercial, pero el autor restringe explícitamente a pruebas, investigación y desarrollo.

## Enlaces

- Hugging Face: https://huggingface.co/ferry-el-kom/qwen3.8-4b-empero-v21-Hermes-agentic-subagent-toolcalls
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Dataset de entrenamiento (privado, bajo petición): ferry-el-kom/hermes-agentic-tooluse-v21-sft-dataset
- Sucesor v24: qwen3.8-4b-Hermes-agentic-subagent-toolcalls (v24)
- Resultados de smoke suite: SMOKE-RESULTS.md (referenciado en la model card)
