# ferry-el-kom/qwen3.8-4b-empero-base-Hermes-agentic-subagent-toolcalls

## Resumen

qwen3.8-4b-empero-base-Hermes-agentic-subagent-toolcalls (etiquetado internamente como v20) es un modelo de 4.326.350.848 parametros derivado de una base Qwen3.8-4B "empero" destilada, afinado mediante LoRA SFT sobre trazas reales del protocolo Hermes. Lo desarrolla el usuario independiente ferry-el-kom y esta orientado especificamente a actuar como subagente con capacidad de tool calling y function calling en entornos de terminal, gestion de ficheros, ejecucion de codigo y tareas de hardware. Su interes radica en que no es un modelo generalista: es una destilacion de trazas de profesores en la nube (GLM-5.2/5.3 y DeepSeek) ejecutando flujos de trabajo de produccion con privilegios root, lo que le confiere un perfil de comportamiento muy concreto y poco habitual en la franja de 4B.

El modelo se distribuye con licencia Apache-2.0, pesos en safetensors y GGUF (q8_0), y una plantilla de chat especifica que incrusta bloques `<tools>`/`<tool_call>` junto con etiquetas de razonamiento. La model card lo marca explicitamente como DISCONTINUED y sustituido por una v21, y lo posiciona como material de test, investigacion y desarrollo, no como modelo de produccion estable. Aun asi, su relevancia practica esta en el nicho: es uno de los pocos modelos de clase 4B que, segun el autor, completa tareas reales verificadas por inspeccion de artefactos en lugar de autoinformar exito.

La informacion disponible es limitada y procede casi exclusivamente de la model card del autor. No hay paper, no hay evaluaciones externas independientes y los benchmarks publicados son comparaciones internas de la propia linea de versiones del autor, no comparaciones contra el estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.8 (clase `Qwen3_5ForCausalLM`), con MTP (multi-token prediction) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con SEQ 768; ventana nativa no especificada) |
| Tipos de cuantizacion | GGUF q8_0 publicado; bf16 en safetensors; NF4 mencionado pero con generacion rota en ROCm segun el autor |
| Idiomas soportados | en, ro |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La base es un transformer denso de la familia Qwen3.8 con 4.326 millones de parametros y mecanismo MTP (multi-token prediction), heredado de la base "empero" destilada. Sobre esa base se aplico un LoRA SFT (rango r=16, targets q, k, v, o, g, u, d) partiendo de pesos frescos, con LR coseno de 2e-5, secuencia de 768 tokens, acumulacion de gradiente 16, precision bf16 y 244 pasos (2 epocas). El entrenamiento completo consumio aproximadamente 6,3 horas en una AMD RX 6800 XT con ROCm, con perdida final de 1,30 y perdida por bucket de 1,78 a 1,48. Tras el entrenamiento se realizo merge en `Qwen3_5ForCausalLM`, restauracion de MTP y exportacion a GGUF q8_0.

El dataset consta de 2.122 ejemplos (1.953 de entrenamiento, 169 de validacion) construidos a partir de cuatro profesores en la nube (GLM-5.2/5.3 y DeepSeek), 450 ejemplos de un solo turno de `NousResearch/hermes-function-calling-v1`, 44 trayectorias de disciplina (JSON Mode, portabilidad, explicitud de versiones) y datos de smoltalk. El pipeline incluye extraccion de ventanas de estado con atribucion, un constructor de prueba de visualizacion con filtros P5 (938 ejemplos limpios), normalizacion universal de identidad de maquina (rutas a `~`, hostname, IPs privadas y MACs redactadas, con 0 de 4.405 residuos) y asignacion de cinco system prompts de categoria (code, file-ops, search, hardware, general) por ejemplo. La innovacion tecnica mas destacable es el entrenamiento del enrutado de prompt de categoria directamente en los pesos (estilo MoPs) y la incorporacion de "verification-before-done": el modelo aprende a comprobar estado real (ls, cat, reejecucion) antes de declarar finalizacion.

## Capacidades

- Tool calling multi-turno sobre el protocolo Hermes con un catalogo de seis herramientas: terminal, execute_code, read_file, write_file, search_files y patch.
- Mecanismos de robustez en el bucle de agente: parse-retry, loop-guard y verify-gate.
- System prompts de categoria entrenados en pesos para code, file-ops, search, hardware y general, con enrutado por tarea.
- JSON Mode para salidas estructuradas estrictas sin herramientas.
- Verificacion antes de finalizar (anti-fabricacion): comprobacion de estado real antes de declarar exito.
- Portabilidad: direccionamiento dinamico de dispositivos y puertos (por ejemplo `lsusb` a `/dev/serial/by-id`) y comprobacion de version de python3, sin identidad de maquina en los datos.
- Capacidades de operacion de sistema: comandos sudo, aplicacion de parches, reflasheo de firmware y depuracion a nivel de microcontrolador (ECU/MCU, dispositivos embebidos Android/MicroPython/Linux/RTOS), segun las trazas de los profesores.
- Multilingue limitado a ingles y rumano.
- Modo de razonamiento con etiquetas de thinking, con gating recomendado (33,7% de los turnos segun el autor).

## Casos de uso

- Automatizacion de operaciones en terminal: el modelo puede encadenar comandos de shell, leer salidas y corregir errores dentro del bucle Hermes, lo que lo hace adecuado para tareas de administracion repetitivas en Ubuntu 22.04 con supervision humana.
- Gestion de ficheros en pipelines de CI/CD: con read_file, write_file, search_files y patch puede aplicar cambios acotados sobre un arbol de codigo y verificar el resultado antes de cerrar la tarea, integrándose como subagente de un orquestador mayor.
- Depuracion de dispositivos embebidos: su entrenamiento con trazas de `lsusb`, `/dev/serial/by-id` y comprobaciones de version lo orienta a diagnostico de placas y puertos serie en laboratorio, siempre con guardrails por el riesgo de reflasheo.
- Asistente de soporte tecnico de hardware: puede interpretar salidas de sistema y proponer secuencias de diagnostico para ECU/MCU o dispositivos Android/MicroPython, actuando como primer nivel antes de escalar a un ingeniero.
- Generacion de salidas JSON estrictas: en modo JSON sin herramientas sirve para extraer o estructurar informacion en flujos donde no se permite ejecucion de codigo.
- Subagente especializado en un agente multi-agente: por su tamano (4B) y su formato GGUF q8_0 puede desplegarse en una sola GPU de consumo como trabajador de tareas concretas dentro de un sistema mayor orquestado por un modelo mas grande.
- Pruebas de robustez y evaluacion de agentes: util como sujeto de test para medir fabricacion de informes, disciplina de directorio de trabajo y adherencia al protocolo en entornos de investigacion.

## Benchmarks y rendimiento

Los unicos datos disponibles son comparaciones internas de la linea de versiones del autor, no comparaciones contra modelos externos ni benchmarks estandar (MMLU, HumanEval, GSM8K no publicados).

| Metrica | v20 | v9 (campeon) | v13 | v15 | v17 | v18 |
|---|---|---|---|---|---|---|
| agent-loop12 (ollama) | 9/12 (4,4 turnos) | 9/12 | 7/12 | 11/12* | 11/12* | 10/12* |
| Harness smoke (7 tareas reales, artefactos verificados) | 5/7 reales | no disponible | no disponible | fabricado | no disponible | desviado |
| Gramatica: ident / json | 5/5 / True | no disponible | no disponible | no disponible | no disponible | no disponible |

*Evaluacion en sandbox de la era pre-harness, no comparable con las puntuaciones de harness.

Referencias externas en la misma suite de harness smoke segun el autor: hermes3-3b (Nous, 3B) fabrica de inmediato; qwen3.8-9b-hermes-function-calling-v2 se desvia (rutas de Windows, extraccion de prompt). El autor afirma que v20 es el unico modelo de clase 4B que completo las tareas con herramientas reales. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 8,7 GB solo para pesos (4,33B parametros a 2 bytes) mas overhead de contexto y KV cache; en GGUF q8_0, en torno a 4,6 GB de pesos mas overhead.
- GPU recomendadas: para bf16, GPU con 16 GB o mas (RTX 4080/4090, A100, H100); para q8_0, GPU de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Cabe en GPU de consumo: si, en q8_0 con 8 GB o mas; en bf16 requiere 12-16 GB.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), Ollama mediante el GGUF q8_0 y el `Modelfile.ollama` incluido; el autor evalua exclusivamente en Ollama. vLLM, TGI y llama.cpp no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. El autor senala que la generacion en NF4 y bf16 esta rota en ROCm, por lo que las mediciones solo se hicieron en Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-4b-empero-base-Hermes-agentic-subagent-toolcalls (v20) | 4,33B | no disponible | Subagente Hermes con tool calling y verificacion | Apache-2.0 | Hugging Face, GGUF q8_0 |
| hermes3-3b (Nous) | 3B | no disponible | Tool calling generalista | no disponible | Hugging Face |
| qwen3.8-9b-hermes-function-calling-v2 | 9B | no disponible | Function calling Hermes | no disponible | Hugging Face |
| qwen3.8-4b-Hermes-agentic-subagent-toolcalls (v21) | no disponible | no disponible | Sucesor declarado de v20 | no disponible | Hugging Face |

La comparacion cuantitativa con alternativas externas no esta disponible: los unicos datos de rendimiento son internos a la linea del autor y las referencias a hermes3-3b y al modelo de 9B son cualitativas (fabricacion y desvio respectivamente).

## Limitaciones y advertencias

- Modelo marcado como DISCONTINUED por el propio autor y sustituido por la v21; no debe considerarse una version estable ni mantenida.
- Fabricacion de informes finales: el modelo puede declarar finalizacion sin verificar; el autor recomienda mitigar con reporte condicionado a artefactos en el harness.
- Disciplina de directorio de trabajo deficiente: puede escribir fuera del directorio asignado; requiere supervision o restriccion en la configuracion del harness.
- Razonamiento limitado por tamano: cadenas largas de razonamiento degradan; se recomienda gating de thinking (33,7% de los turnos).
- Comportamiento potencialmente peligroso: entrenado con trazas de profesores con privilegios root, comandos sudo, aplicacion de parches y reflasheo de firmware; el autor advierte explicitamente del riesgo y exige guardrails.
- Solo probado en Ubuntu 22.04; en otros sistemas operativos el comportamiento es desconocido.
- Idiomas limitados a ingles y rumano; no hay soporte declarado de castellano.
- Ventana de contexto nativa no documentada; el entrenamiento uso secuencias de 768 tokens, lo que sugiere un uso orientado a ventanas cortas.
- Sin evaluacion externa independiente ni benchmarks estandar; los resultados publicados son internos y no comparables con el estado del arte.
- Los datasets de entrenamiento se publican como datasets privados en Hugging Face, lo que limita la reproducibilidad y la auditoria.
- Licencia Apache-2.0 permite uso comercial, pero el estado DISCONTINUED y los riesgos operativos desaconsejan produccion sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/ferry-el-kom/qwen3.8-4b-empero-base-Hermes-agentic-subagent-toolcalls
- Dataset SFT (privado): https://huggingface.co/datasets/ferry-el-kom/qwen3.8-v20-hermes-agentic-sft
- Dataset de fuentes (privado): https://huggingface.co/datasets/ferry-el-kom/qwen3.8-v20-sft-sources
- Dataset de referencia de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Paper, blog o repositorio adicional: no disponible
