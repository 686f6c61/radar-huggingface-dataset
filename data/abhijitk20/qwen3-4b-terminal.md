# AbhijitK20/qwen3-4b-terminal

## Resumen

Qwen3-4B Terminal (v9) es un modelo de 4.000 millones de parametros desarrollado por el usuario AbhijitK20 a partir de Qwen3-4B de Alibaba. No es un modelo base nuevo, sino una pila de cuatro adaptadores LoRA (abliteracion, SFT de tool calling, SFT de terminal y GRPO) aplicados sobre Qwen3-4B, con el objetivo de conseguir un modelo pequeno capaz de elegir herramientas correctamente y gobernar un shell bash mediante comandos JSON estructurados.

Su relevancia esta en demostrar hasta donde llega un modelo de 4B en tareas agenticas: resuelve de forma notable el tool calling de un solo turno (BFCL parallel pasa de 18,5 a 86,0) y la ejecucion de comandos bash verificables (suite propia de 25 tareas: 11/25 a 15/25 tras GRPO), pero el propio autor reconoce que el trabajo multi-turno de largo alcance no funciona a esta escala. Es, por tanto, una ficha util sobre los limites reales de los modelos pequenos como agentes, no un agente de produccion.

Se distribuye con licencia Apache 2.0, en formato safetensors (adaptadores) y GGUF cuantizado (Q5), listo para ejecutar con Ollama o llama.cpp en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) + pila de 4 LoRA (abliteration, tools SFT, terminal SFT, GRPO) |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (recomendado en la config de Ollama del autor) |
| Tipos de cuantizacion | Base QLoRA 4-bit NF4 durante entrenamiento; GGUF Q5_K_M y Q5 para inferencia |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores LoRA) y GGUF (modelo fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder denso de 4B parametros, y le aplica secuencialmente cuatro adaptadores LoRA entrenados con QLoRA (r=16, alpha=16, dropout 0,05, sobre todos los modulos de proyeccion, base 4-bit NF4). El primer adaptador, "heretic", es una abliteracion que reduce las negativas de 19/100 a 4/100 con KL de 0,0103. El segundo entrena tool calling sobre el dataset hermes-function-calling-v1 de NousResearch (5.000 filas, 313 pasos), lo que dispara el BFCL parallel. El tercero entrena la emision de comandos de terminal en formato JSON terminus-2 sobre 1.189 trazas de terminal-bench-traces-local de mlfoundations (238 pasos, loss de 1,2179 a 0,0538).

El cuarto adaptador aplica GRPO (Group Relative Policy Optimization) con 25 tareas bash verificables, G=4, hasta 8 turnos y recompensa moldeada (1,0 verificacion superada / 0,5 artefacto existente / 0,0), mejorando la suite bash de 11/25 a 15/25. Los GGUF distribuidos corresponden a la version fusionada final (v9-grpo) y a la version pre-GRPO (v9-terminal) para comparaciones A/B.

## Capacidades

- Tool calling de un solo turno con precision de esquema: seleccion de funcion y argumentos correctos en torno al 90 % en categorias simples de BFCL.
- Llamadas a herramientas en paralelo: BFCL parallel de 86,0 y parallel_multiple de 76,5 tras el SFT de herramientas.
- Ejecucion de comandos de shell: emite JSON en el esquema terminus-2 con campos `analysis`, `plan`, `commands` (keystrokes y duration) y `task_complete`.
- Resolucion de tareas bash cortas y verificables (hasta ~8 turnos de estado, segun el entrenamiento GRPO).
- Razonamiento matematico basico: GSM8K 0,6433 en la variante heretic (300 problemas, limite de 256 tokens).
- Seguimiento de instrucciones: IFEval inst_strict 0,6019 y prompt_loose 0,5268 en la variante heretic-tools.
- Modelo abliterado: sin negativas ni en prompts harmful ni harmless (0/40 en ambas pruebas del autor).
- Etiquetado como "uncensored": sin filtros de rechazo, lo que exige capas de seguridad externas en produccion.
- No soporta de forma fiable: bucles agenticos multi-turno, planificacion de largo alcance ni autonomia prolongada.

## Casos de uso

- Ejecucion de comandos bash a partir de instrucciones en lenguaje natural: el modelo genera JSON terminus-2 con los keystrokes exactos, util para asistentes de consola locales.
- Automatizacion de tareas de sistema de archivos: listados, busquedas, renombrados y manipulacion de ficheros mediante comandos generados y verificados.
- Orquestacion de APIs en un solo turno: gracias al SFT de herramientas, puede invocar funciones con esquemas estrictos, util para prototipos de integraciones.
- Llamadas paralelas a multiples funciones: adecuado para consultas que requieren varias llamadas simultaneas (BFCL parallel 86,0).
- Generacion de scripts bash cortos y verificables: el GRPO se entreno con recompensa por verificacion, asi que rinde en tareas con criterio de exito automatico.
- Evaluacion e investigacion de agentes pequenos: sirve como punto de comparacion para estudiar donde se rompen los 4B en tareas agenticas (el propio autor documenta el fallo multi-turno).
- Pruebas A/B de tecnicas de entrenamiento: el repo incluye la version pre-GRPO para comparar el efecto del reinforcement learning post-SFT.

## Benchmarks y rendimiento

Datos publicados por el propio autor (harnesses propios, no verificados en leaderboards):

BFCL (1.664 casos, via Ollama, `underscore_to_dot=True`):

| Categoria | v9-heretic | v9-heretic-tools |
|---|---:|---:|
| simple_python | 92,75 | 93,25 |
| simple_java | 64,00 | 63,00 |
| simple_javascript | 66,00 | 62,00 |
| multiple | 94,00 | 95,50 |
| parallel | 18,50 | 86,00 |
| parallel_multiple | 56,50 | 76,50 |
| irrelevance | 3,33 | 65,83 |
| live_simple | 74,42 | 71,71 |
| live_relevance | 100,00 | 75,00 |
| multi_turn_base | 6,00 | 8,00 |

Otros benchmarks:

| Benchmark | v9-heretic | v9-heretic-tools | v9-terminal | v9-grpo |
|---|---:|---:|---:|---:|
| Suite bash de 25 tareas (greedy) | — | — | 11/25 (0,560) | 15/25 (0,700) |
| IFEval inst_strict | 0,5959 | 0,6019 | — | — |
| IFEval prompt_loose | 0,5009 | 0,5268 | — | — |
| GSM8K (300 casos, limite 256 tokens) | 0,6433 | 0,6100 | — | — |
| Negativas harmful | 0/40 | 0/40 | — | — |
| Negativas harmless | 0/40 | 0/40 | — | — |

Terminal-Bench 2.0: no medido de forma valida. El unico intento sufrio fallos de DNS del registro Docker en 70 de 89 tareas; de las 19 ejecutadas, 0 pasaron. Con 0/19 el limite superior al 95 % de la tasa real es 14,6 %, por lo que el dato no es concluyente y no debe citarse como 0 %.

## Requisitos de hardware

- VRAM estimada: con GGUF Q5_K_M (~3 GB de pesos), aproximadamente 4-5 GB de VRAM o RAM para inferencia con contexto de 8.192 tokens; el tamano total del repo es 8,5 GB (incluye adaptadores y varios GGUF).
- Cabe holgadamente en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090 o incluso solo CPU con aceleracion parcial; no se necesitan A100 ni H100.
- Despliegue recomendado: Ollama (el autor publica una plantilla Modelfile lista) o llama.cpp con los GGUF; los adaptadores safetensors requieren cargar Qwen3-4B base y aplicar los LoRA con transformers/PEFT.
- Parametros sugeridos por el autor: `num_ctx 8192`, `temperature 0.6`.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Fortaleza | Licencia |
|---|---|---|---|---|
| Qwen3-4B Terminal (v9) | 4,02B | 8.192 (config recomendada) | Tool calling single-turn y comandos bash | Apache 2.0 |
| Qwen/Qwen3-4B (base) | 4,02B | 32.768 (nativo) | Uso general, hibrido thinking/no-thinking | Apache 2.0 |
| Hermes 3 (Llama 3.1 8B) | 8B | 128.000 | Tool calling con formato Hermes | Llama 3.1 Community |

Nota: la comparacion con el modelo base Qwen3-4B es la mas relevante, ya que los benchmarks del autor miden el efecto de cada adaptador. No hay comparacion directa publicada frente a otros modelos de terminal como terminus-2.

## Limitaciones y advertencias

- El trabajo multi-turno y agentico de largo alcance esta roto a esta escala: BFCL multi_turn_base de solo 6-8 %; es un limite de capacidad del modelo, no un problema de formato.
- El GRPO se midio en 25 tareas bash cortas; no implica mejora en Terminal-Bench.
- Todos los benchmarks son autoejecutados por el autor en harnesses propios, no verificados por terceros ni enviados a leaderboards.
- Modelo abliterado y etiquetado "uncensored": 0/40 negativas en prompts harmful y harmless, lo que supone un riesgo de seguridad serio; requiere guardrails externos para cualquier uso en produccion.
- Los pesos distribuidos estan cuantizados (4-bit NF4 en entrenamiento, Q5 en inferencia); esperarse una pequena degradacion frente a la fusion bf16.
- El SFT de terminal sobrescribe el formato nativo de tool calling: el adaptador terminal no debe usarse para tool calling estandar, y viceversa el adaptador tools no sirve para gobernar el shell.
- Idioma limitado al ingles segun la model card; el rendimiento en castellano no esta evaluado.
- Solo 379 descargas y 1 like en el momento de la ficha: proyecto de un autor individual, sin comunidad de mantenimiento aparente.
- Terminal-Bench 2.0 no medido de forma concluyente (fallos de infraestructura en el unico intento).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbhijitK20/qwen3-4b-terminal
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de tool calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset de trazas de terminal: https://huggingface.co/datasets/mlfoundations-dev/terminal-bench-traces-local
- Paper, repositorio de codigo y demo: no disponible
