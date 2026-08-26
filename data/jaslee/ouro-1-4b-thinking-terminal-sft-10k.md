# jaslee/Ouro-1.4B-Thinking-terminal-sft-10k

## Resumen

Ouro-1.4B-Thinking-terminal-sft-10k es un ajuste fino supervisado (SFT) de 10.000 pasos sobre el modelo Ouro-1.4B-Thinking de ByteDance, desarrollado por jaslee con el objetivo de convertirlo en un agente utilizable en entornos de terminal, específicamente para el benchmark Terminal-Bench. El modelo base, un "looped language model" con 4 pasos recurrentes y 1.400 millones de parámetros, razona en prosa durante aproximadamente 1.500 tokens por turno y a menudo nunca emite una acción parseable, lo que lo hace inutilizable como agente bajo restricciones de tiempo. Este checkpoint reduce la respuesta a unos 150 tokens y emite acciones JSON estructuradas, logrando completar 715 turnos en 12 tareas de Terminal-Bench frente a 0 del base.

La relevancia de este modelo radica en que demuestra que un SFT específico puede transformar un modelo de razonamiento puro en un agente operativo, aunque no mejora la tasa de éxito de tareas: resuelve 2 de 12 tareas, las mismas que el checkpoint hermano de 1.000 pasos, y su pass@1 es ligeramente inferior (0,125 frente a 0,167). El entrenamiento se realizó sobre una mezcla de tres corpus públicos de trayectorias de agentes de terminal, con pérdida enmascarada solo en los turnos de asistente. La licencia es Apache 2.0, pero el modelo base de ByteDance advierte que está destinado únicamente a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ouro (looped language model) con 4 pasos recurrentes, atención multi-head, SwiGLU, RoPE |
| Parametros totales | 1.434.652.673 (1,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos bf16 en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Ouro es una arquitectura de "looped language model" desarrollada por ByteDance que realiza cómputo iterativo en espacio latente mediante 4 pasos recurrentes (R4), logrando una eficiencia de parámetros excepcional: el modelo de 1,4B alcanza un rendimiento comparable a modelos de 4B en tareas de razonamiento. El modelo base Ouro-1.4B-Thinking fue ajustado con SFT en datos de razonamiento de alta calidad. Este checkpoint aplica un SFT de backbone completo (100% de los parámetros entrenables) sobre dicho base, utilizando el objetivo de la Etapa I de Ouro: `L = Σ_t p(t|x)·L^(t) − β·H(p)` con β=0,01. Los datos de entrenamiento consisten en una mezcla intercalada de tres corpus de trayectorias de agentes de terminal generados por un profesor fuerte: NVIDIA Nemotron-Terminal-Corpus (65%, subconjuntos `skill_based_medium` y `_easy`), m-a-p/TerminalTraj (25%) y open-thoughts/OpenThoughts-Agent-v1-SFT (10%). Las trayectorias se truncaron a los primeros 64 turnos y la pérdida se enmascaró solo a los turnos de asistente. El entrenamiento se ejecutó durante 10.000 pasos (~9,5 horas en una RTX A6000) con batch de 1 secuencia de 4096 tokens empaquetados, LR 2e-5 con warmup de 50 pasos y decaimiento coseno a 0,1x, precisión bf16 y activation checkpointing completo. No se emplearon técnicas de RLHF ni DPO.

## Capacidades

- Generación de acciones JSON estructuradas para interacción con terminal, incluyendo comandos y argumentos.
- Razonamiento breve y conciso (~150 tokens por turno) en lugar de prosa extensa, lo que permite operar bajo presupuestos de tiempo.
- Ejecución de tareas de agente multi-turno en entornos de terminal, con capacidad de progresar en tareas simples (p. ej., arreglar permisos, hello-world).
- Soporte de tool calling implícito a través del formato de acción JSON, sin necesidad de funciones externas.
- Capacidad de procesar contextos de hasta 64 turnos de trayectoria (límite de entrenamiento).
- No soporta `model.generate()`; requiere un bucle token a token llamando a `model.model(...)`.
- No dispone de capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede ejecutar comandos como `chmod`, `ls`, `cat` o `grep` para diagnosticar y corregir problemas simples de permisos o configuración, como demuestra su éxito en la tarea `fix-permissions` de Terminal-Bench.
- Asistente de línea de comandos interactivo: integrado en un shell, puede interpretar solicitudes en lenguaje natural y traducirlas a comandos JSON ejecutables, útil para usuarios que prefieren no memorizar sintaxis compleja.
- Pruebas de software en entornos CI/CD: puede ejecutar scripts de validación, comprobar salidas y reportar resultados en formato estructurado, aunque su limitación en tareas multi-paso lo restringe a validaciones simples.
- Educación en terminal: como herramienta de demostración para enseñar comandos básicos a estudiantes, mostrando cómo un modelo pequeño puede razonar sobre acciones de terminal.
- Investigación en agentes: sirve como punto de partida para estudiar los límites de competencia agéntica en modelos de 1,4B, comparando comportamientos entre checkpoints con distinto número de pasos de entrenamiento.
- Prototipado rápido de agentes en hardware modesto: al ser un modelo de 1,4B, puede ejecutarse en GPUs de consumo, permitiendo iterar sobre pipelines de agentes sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de la model card del autor, medidos en 12 tareas de Terminal-Bench con 2 intentos por tarea y configuración de decodificación idéntica (temperatura 0,7, sin guard de n-gramas). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Métrica | Este checkpoint (10k) | Base Ouro-1.4B-Thinking | Checkpoint 1k |
|---|---|---|---|
| Turnos LLM completados | 715 (1 error) | 0 (21/24 atascados, 3 timeouts) | No disponible |
| Tareas resueltas (de 12) | 2/12 | 0/12 | 2/12 |
| pass@1 | 0,125 | No aplica | 0,167 |
| pass@2 | 0,167 | No aplica | 0,167 |

Además, el autor reporta que con `no_repeat_ngram_size=3` bajo muestreo, el modelo obtuvo pass@5 = 0,000 debido a JSON malformado, mientras que sin ese guard obtuvo 0,400 en las mismas tareas. La pérdida de entrenamiento pasó de 0,721 (pasos 1-1k) a 0,547 (pasos 6k-10k), pero esto no se tradujo en mejora de éxito de tareas.

## Requisitos de hardware

- Inferencia: el modelo tiene 1,4B parámetros en bf16, ocupando aproximadamente 2,9 GB de pesos. Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) con margen para el contexto y el estado de la caché.
- Entrenamiento: se realizó en una única RTX A6000 (48 GB) durante ~9,5 horas para 10.000 pasos. El autor indica que el entrenamiento con 2 GPUs FSDP falló por un timeout de NCCL ALLGATHER en su nodo.
- Despliegue: requiere `transformers` con `trust_remote_code=True` y parches adicionales para el código de modelado (shims para RoPE-init y firma de attention-mask). No es compatible con `model.generate()`; hay que implementar un bucle token a token llamando a `model.model(...)`. No se menciona soporte para vLLM, Ollama o llama.cpp.
- Latencia: el modelo base genera a ~10 tokens por segundo; este checkpoint responde en ~150 tokens, por lo que un turno completo puede tardar ~15 segundos en hardware similar, lo que lo hace viable bajo presupuestos de tiempo moderados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en Terminal-Bench (12 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ouro-1.4B-Thinking-terminal-sft-10k (este) | 1,4B | No disponible | 2/12 tareas, pass@1 0,125 | Apache 2.0 | HuggingFace |
| Ouro-1.4B-Thinking-terminal-sft (1k pasos) | 1,4B | No disponible | 2/12 tareas, pass@1 0,167 | Apache 2.0 | HuggingFace |
| ByteDance/Ouro-1.4B-Thinking (base) | 1,4B | No disponible | 0/12 tareas (no completa turnos) | Apache 2.0 (solo investigación) | HuggingFace |

No se dispone de datos comparativos con otros modelos de agente de tamaño similar (p. ej., Qwen2.5-1.5B-Instruct o Llama-3.2-1B) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no mejora el éxito de tareas respecto al checkpoint de 1.000 pasos; su pass@1 es inferior (0,125 frente a 0,167) y resuelve exactamente las mismas 2 de 12 tareas.
- Falla en tareas multi-paso: los 10 problemas no resueltos terminan en timeout del agente con crédito parcial, lo que sugiere un límite de competencia agéntica inherente a los 1,4B de parámetros, no un problema de datos o formato.
- No soporta `model.generate()`; es necesario implementar un bucle de generación manual, lo que complica la integración con frameworks estándar.
- No debe activarse un guard de no-repetición de n-gramas para salida JSON, ya que corrompe la estructura (p. ej., `"duration": 0.1` o `}, {` se repiten legítimamente). Con `no_repeat_ngram_size=3`, el pass@5 cae a 0,000.
- Requiere `trust_remote_code=True` y parches adicionales para el código de modelado de Ouro; las versiones recientes de `transformers` necesitan shims para la inicialización de RoPE y la firma de la máscara de atención.
- El modelo base de ByteDance advierte que está destinado únicamente a investigación y se proporciona "as-is" sin garantías para uso en producción, aunque la licencia Apache 2.0 permite uso comercial.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño entrenado en trayectorias de terminal, puede alucinar comandos o rutas inexistentes, y su rendimiento fuera del dominio de terminal no está verificado.
- La longitud de contexto no está publicada; el entrenamiento usó secuencias de 4096 tokens empaquetados y trayectorias truncadas a 64 turnos, por lo que contextos más largos pueden degradar el comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaslee/Ouro-1.4B-Thinking-terminal-sft-10k
- Modelo base ByteDance/Ouro-1.4B-Thinking: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Checkpoint hermano de 1k pasos: https://huggingface.co/jaslee/Ouro-1.4B-Thinking-terminal-sft
- Sitio oficial de Ouro (looped language models): https://ouro-llm.github.io/
- Repositorio de Terminal-Bench: https://github.com/laude-institute/terminal-bench
- Dataset NVIDIA Nemotron-Terminal-Corpus: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- Dataset m-a-p/TerminalTraj: https://huggingface.co/datasets/m-a-p/TerminalTraj
- Dataset open-thoughts/OpenThoughts-Agent-v1-SFT: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-v1-SFT
