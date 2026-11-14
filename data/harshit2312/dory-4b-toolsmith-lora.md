# harshit2312/dory-4b-toolsmith-lora

## Resumen

Dory-4B-Toolsmith-LoRA es un conjunto de dos adaptadores LoRA publicados por el usuario harshit2312 sobre el modelo base NVIDIA Nemotron Labs Dory 1.0 4B (BF16). Su proposito es especializar un modelo de 4.000 millones de parametros en la reparacion de pequenos bugs en funciones Python a traves de un protocolo de cuatro herramientas (`read_file`, `edit_file`, `run_visible_tests`, `submit_patch`) denominado Toolsmith. El repositorio contiene dos variantes: una entrenada con SFT sobre 500 demostraciones verificadas y otra con GRPO partiendo del modelo sin demostraciones.

El interes del artefacto no esta en el modelo base sino en la metodologia: demuestra que un ajuste fino ligero (rank 16, 15,6 millones de parametros adaptados sobre 180 capas lineales de los bloques de atencion) puede elevar la tasa de exito en tareas de reparacion de codigo con uso de herramientas de un 75,0 % a un 97,4 % en un conjunto congelado de 340 tareas. Todo el pipeline (generador de tareas, sandbox, ejecuciones registradas y herramientas de comparacion) esta publicado en un repositorio de GitHub.

Es relevante ahora porque ejemplifica el patron de adaptadores pequenos y baratos (entrenamiento en una sola T4 en 4,9 horas para la fase GRPO) sobre modelos abiertos de 4B, con evaluacion estricta en contenedores Docker aislados y datos de intervalos de confianza. No obstante, el alcance es deliberadamente acotado: tareas sinteticas, templadas y de una sola funcion, sin transferencia demostrada a repositorios reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso; el adaptador afecta a 180 capas lineales de los bloques de atencion del modelo base |
| Parametros totales | 15,6 M de parametros adaptados (el modelo base Dory 1.0 4B tiene 4.000 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos base en fp16 y LoRA en fp32 durante el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (adaptadores); el modelo base se rige por sus propios terminos |
| Formato de pesos | safetensors (adaptadores PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 4B parametros de NVIDIA Nemotron Labs, con un modo de inferencia que admite "recurrent loops" (la configuracion de evaluacion usa 2) y un flag `enable_thinking` que se desactiva en todas las pruebas. Los adaptadores LoRA usan rank 16, alpha 32 y dropout 0,05, aplicados exclusivamente a las capas lineales de los bloques de atencion; las MLP y la cabeza LM no se adaptan. Los pesos base se cargan en fp16 y los del adaptador en fp32 sobre GPUs T4.

La variante `sft` se entrena una epoca sobre 500 demostraciones verificadas por replay (leer fichero, ejecutar tests, editar, ejecutar tests, enviar parche): 63 pasos de optimizador, learning rate 2e-4 con 3 pasos de warmup y decaimiento lineal, acumulacion de 8 ejemplos y clipping de gradiente a 1,0. La perdida cubre solo los tokens que el modelo genera en inferencia (llamadas a herramientas y token de fin de turno). La variante `grpo` parte de un LoRA nuevo sobre el modelo sin demostraciones y usa TRL GRPO: 150 pasos, una tarea de entrenamiento por paso, 4 episodios multiturno independientes por tarea, learning rate 2e-5, KL de 0,02 contra el adaptador inicial congelado y dropout desactivado; la recompensa es 1 si el parche supera las comprobaciones privadas y 0 en caso contrario, con los resultados de herramientas enmascarados de la perdida. Solo 14 de los 150 pasos mostraron varianza en la recompensa. Un intento de GRPO partiendo del adaptador `sft` no obtuvo varianza en 150 pasos y termino identico al punto de partida, por lo que se descarto.

## Capacidades

- Reparacion de bugs en funciones Python de una sola funcion mediante un bucle de agente con cuatro herramientas: lectura de fichero, edicion, ejecucion de tests visibles y envio de parche.
- Uso de herramientas (tool calling) con un parser estricto de llamadas incluido en el paquete `toolsmith.inference`.
- Razonamiento multiturno con presupuesto acotado: 8 llamadas a herramientas por episodio y 256 tokens nuevos por turno en la configuracion evaluada.
- Generacion de parches de codigo concisos: la variante `sft` reduce el consumo a 150 tokens nuevos por episodio frente a 308 del modelo sin ajustar.
- Modo de pensamiento controlable mediante `enable_thinking` (desactivado en todas las evaluaciones publicadas).
- Soporte de bucles recurrentes en la inferencia (2 bucles en la configuracion de referencia).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Reparacion automatizada de tests fallidos en CI: el adaptador `sft` puede integrarse en un pipeline que, ante un test rojo, lea el fichero afectado, ejecute los tests visibles, proponga una edicion y reenvie el parche, con el modelo base de 4B ejecutable en hardware modesto.
- Agente de codigo con sandbox aislado: el protocolo Toolsmith y el runner `toolsmith.evaluation.run_episode` permiten lanzar episodios completos contra un contenedor Docker, util para evaluar politicas de agentes sin riesgo sobre el host.
- Generacion de datos de entrenamiento para agentes: el generador de tareas y el sandbox del repositorio permiten producir trayectorias verificadas de reparacion que sirvan como demostraciones para otros modelos.
- Investigacion en RL para agentes: la variante `grpo` sirve como referencia reproducible de entrenamiento con recompensa binaria verificable en un solo GPU T4 en menos de 5 horas.
- Prototipado de asistentes de parcheo en entornos educativos o de practicas: tareas sinteticas de una funcion con tests visibles encajan con ejercicios de depuracion guiada.
- Evaluacion comparativa de estrategias de ajuste: disponer de SFT y GRPO sobre la misma base y el mismo conjunto congelado de 340 tareas facilita medir el efecto de las demostraciones frente a la recompensa, con intervalos de confianza publicados.
- Base para adaptadores especializados en dominios concretos: al tratarse de un LoRA de 15,6 M de parametros sobre un modelo de 4B, el coste de reentrenar para otro tipo de bug o lenguaje es bajo.

## Benchmarks y rendimiento

Conjunto congelado de 340 tareas (semilla 17, temperatura 1,0, top_p 0,95, 256 tokens nuevos por turno, 8 llamadas a herramientas por episodio). Una tarea cuenta solo si el parche enviado supera comprobaciones privadas de entrada/salida en un contenedor Docker nuevo.

| Modelo | dev | test_iid | test_compositional | challenge | Total |
|---|---|---|---|---|---|
| Dory 1.0 4B sin ajuste (prompt-only) | 82/100 | 80/100 | 70/100 | 23/40 | 255/340 (75,0 %) |
| SFT LoRA | 100/100 | 100/100 | 100/100 | 31/40 | 331/340 (97,4 %) |
| GRPO LoRA (desde prompt-only) | 98/100 | 92/100 | 95/100 | 34/40 | 319/340 (93,8 %) |

- `sft`: +22,4 puntos sobre el modelo sin ajuste (IC 95 %: +17,9 a +26,8; 77 tareas ganadas, 1 perdida), con reduccion de tokens por episodio de 308 a 150.
- `grpo`: +18,8 puntos (IC 95 %: +14,1 a +23,5; 70 ganadas, 6 perdidas) y mejor resultado en el split `challenge` (34/40). Queda 3,5 puntos por debajo de `sft` en el total (IC 95 %: -5,9 a -1,2); 18 de sus 21 fallos son turnos que exceden el limite de 256 tokens.
- Ningun modelo envio un parche incorrecto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es de 4B parametros y los adaptadores suman 15,6 M, por lo que en fp16 el conjunto ronda los 8 GB de pesos mas overhead de contexto y KV cache. En cuantizacion de 4 bits cabria en GPUs consumer de 8 GB, aunque no se han publicado mediciones.
- GPU empleadas en el entrenamiento y evaluacion: NVIDIA T4 (GRPO completo en una sola T4 en 4,9 horas).
- Cabe en GPU consumer: si, previsiblemente en tarjetas de 8-12 GB en fp16 o cuantizado; no hay cifras publicadas de latencia ni throughput.
- Despliegue: la model card solo documenta el uso con `transformers` (version con soporte Dory, commit `fcc6924dfbac964f00787859b568c867ef5ad4cb`) y `peft` con `merge_and_unload()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la disponibilidad de GGUF no esta indicada.
- Requisito de version: hace falta una version de Transformers con soporte para Dory hasta que se publique oficialmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dory-4B-Toolsmith-LoRA (`sft`) | 4.000 M base + 15,6 M adaptador | no disponible | LoRA SFT para reparacion de codigo con herramientas | OpenMDW-1.1 | Hugging Face, 0 descargas |
| Dory-4B-Toolsmith-LoRA (`grpo`) | 4.000 M base + 15,6 M adaptador | no disponible | LoRA GRPO con recompensa binaria verificable | OpenMDW-1.1 | Hugging Face, 0 descargas |
| NVIDIA Nemotron Labs Dory 1.0 4B (base) | 4.000 M | no disponible | Modelo generalista sin ajuste | Terminos de NVIDIA (OpenMDW-1.1 segun la model card del adaptador) | Hugging Face |
| Alternativas de reparacion de codigo de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer comparaciones con otros modelos de reparacion de codigo.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre tareas sinteticas, templadas y de una sola funcion; los resultados no se transfieren a repositorios reales.
- Un unico seed de entrenamiento; los intervalos de confianza cubren solo el muestreo de tareas, no la variabilidad del entrenamiento.
- La variante `sft` memoriza el guion fijo de cinco llamadas de las demostraciones: tras un test fallido reenvia codigo sin cambios o repite el test hasta agotar el presupuesto.
- La variante `grpo` sigue explicando en exceso en algunos turnos de edicion (18 de 340 tareas terminan truncadas) y rara vez se recupera tras un segundo test fallido.
- El modelo base impone sus propios terminos, incluida la guia de NVIDIA en su model card; el uso comercial de los adaptadores exige cumplir OpenMDW-1.1 y la licencia del base.
- El codigo generado debe ejecutarse unicamente dentro de un sandbox aislado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion en parches: no cuantificado de forma independiente; la evaluacion solo verifica que los parches enviados pasan las comprobaciones privadas, y no se reportan parches incorrectos enviados.
- Idiomas soportados y comportamiento multilingue: no disponibles.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshit2312/dory-4b-toolsmith-lora
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Repositorio Toolsmith (codigo, generador de tareas, sandbox, ejecuciones y herramientas de comparacion): https://github.com/hr231/toolsmith-rl
- Licencia OpenMDW-1.1: https://huggingface.co/harshit2312/dory-4b-toolsmith-lora/blob/main/LICENSE.OpenMDW-1.1.txt
- Pull request de Transformers con soporte Dory: https://github.com/huggingface/transformers/pull/50099 (commit `fcc6924dfbac964f00787859b568c867ef5ad4cb`)
