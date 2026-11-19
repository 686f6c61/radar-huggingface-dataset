# hermitdave/Qwen3.8-27B-hermes-MLX-RCO-4.5bpw

## Resumen
Qwen3.8-27B-hermes-MLX-RCO-4.5bpw es una cuantizacion de precision mixta del modelo Qwen/Qwen3.8-27B (27.781 millones de parametros) realizada por el usuario hermitdave, pensada para ejecucion en Apple Silicon mediante MLX y oMLX. Antes de cuantizar se fusiono en los pesos base el adaptador LoRA GRPO de harness-hub/Qwen3.8-27B-hermes-adapted, orientado a mejorar el comportamiento como agente detras de Hermes Agent en tareas de ingenieria de software y terminal. El resultado es un checkpoint de 20,52 GB que preserva en BF16 la torre de vision y la cabeza MTP, con un tronco cuantizado a 4.488 bpw medidos.

La relevancia del modelo radica en que permite servir un VLM de 27B con capacidades de agente en equipos de memoria unificada relativamente modesta, manteniendo rutas nativas para entrada de imagen y video y decodificacion especulativa mediante MTP. La cuantizacion no es uniforme: usa una asignacion RCO (rate-constrained allocation) por tensor, con mezcla de anchos de 8, 6, 4 y 3 bits, elegida por error de reconstruccion ponderado por matriz de importancia.

No se han publicado aun resultados de fidelidad ni de rendimiento en la model card: las secciones de PPL, KL, recuperacion zero-shot y throughput estan marcadas como pendientes. Los unicos datos de calidad citados provienen de la model card del adaptador y se midieron en BF16 bajo el arnes Hermes, no sobre esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` hibrida de atencion lineal (GatedDeltaNet) y atencion con puerta, VLM con MTP |
| Parametros totales | 27.781.427.952 (27B); 24,35B cuantizados |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine, group_size=64, escalas bfloat16; mezcla 8/6/4/3 bits; 4.488 bpw medidos en el tronco |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx-lm |
| Capas | 64: 16 x (3 x GatedDeltaNet -> FFN + 1 x atencion con puerta -> FFN) |
| Hidden size | 5120 |
| Tamano del checkpoint | 20,52 GB (incluye vision y MTP en BF16) |
| Modelo base | Qwen/Qwen3.8-27B (BF16) + LoRA de harness-hub/Qwen3.8-27B-hermes-adapted fusionado |
| Metodo de cuantizacion | RCO con programacion dinamica sobre tabla de error medida; refinamiento LSQ de escalas y sesgos ponderado por imatrix |
| Matriz de importancia | unsloth/Qwen3.8-27B-GGUF `imatrix_unsloth.gguf` (cobertura del 100% de las proyecciones del tronco) |
| Tensores preservados en BF16 | embed_tokens, lm_head, norms, conv1d, A_log/dt_bias, torre de vision, cabeza MTP |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura `qwen3_5` del base: un transformer hibrido de 64 capas y 5120 de dimension oculta que intercala bloques de atencion lineal GatedDeltaNet con bloques de atencion con puerta, en un patron de 3 a 1. Incorpora una torre de vision (333 tensores) para entrada image-text-to-text y una cabeza MTP (15 tensores) que habilita decodificacion especulativa. Sobre el base se fusiono un LoRA entrenado con GRPO (r=32, alpha=64, 256 matrices) que especializa el modelo como agente de terminal e ingenieria de software. La fusion se hizo en fp32 con `W' = bf16(W + (alpha/r)·B@A)` y se verifico bit a bit; los tensores no afectados (vision, MTP, embeddings, proyecciones de atencion lineal) son identicos byte a byte al base.

La cuantizacion sigue un proceso de cuatro etapas: construccion de una base de datos de error de reconstruccion RTN por tensor y por grupo a 2, 3, 4, 6 y 8 bits en float32, ponderada por la matriz de importancia; asignacion RCO mediante programacion dinamica bajo un presupuesto de 4,5 bpw ponderado por parametros; cuantizacion MLX por shards; y refinamiento LSQ de escalas y sesgos ponderado por imatrix en los 496 tensores cuantizados. La distribucion final en disco es de 96 tensores a 8 bits, 33 a 6 bits, 357 a 4 bits y 10 a 3 bits, sin ninguno a 2 bits. No se detalla la composicion del dataset de entrenamiento del adaptador ni si hubo fases adicionales de RLHF o DPO mas alla del GRPO.

## Capacidades
- Generacion de texto conversacional multi-turno con plantilla de chat propia del adaptador.
- Razonamiento y resolucion de tareas de ingenieria de software: el adaptador esta entrenado para SWE-bench Pro y Terminal-Bench.
- Entrada de imagen y video (pipeline image-text-to-text, torre de vision preservada en BF16); la ruta VLM se sirve via oMLX.
- Comportamiento como agente detras de Hermes Agent, con tareas de terminal y edicion de repositorios.
- Modo thinking configurable mediante `enable_thinking` en la plantilla de chat; el autor recomienda mantenerlo desactivado al servir este checkpoint.
- Decodificacion especulativa mediante la cabeza MTP preservada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso
- Agente de terminal en local: el modelo puede ejecutar tareas de linea de comandos y edicion de ficheros a traves de Hermes Agent, aprovechando el entrenamiento GRPO del adaptador en Terminal-Bench y su ejecucion nativa en Apple Silicon.
- Correccion automatizada de tests: dado un repositorio con fallos, el modelo recibe el contexto del error y propone parches; el adaptador esta ajustado especificamente para este flujo de ingenieria de software.
- Asistente de desarrollo en portatiles Mac: con 20,52 GB de checkpoint cabe en equipos de memoria unificada de 32 GB o mas, lo que permite un agente de 27B sin GPU dedicada.
- Analisis de capturas y diagramas: la torre de vision en BF16 permite enviar imagenes de interfaces, trazas o diagramas junto al prompt de texto para depuracion.
- Procesamiento de video corto en local: la ruta VLM de oMLX admite entrada de video, util para resumir demos de producto o incidencias grabadas.
- Generacion asistida con latencia reducida: la cabeza MTP permite decodificacion especulativa, adecuada para entornos interactivos donde importa el tiempo por token.
- Automatizacion de tareas de refactorizacion por lotes: el modo thinking desactivado reduce el consumo de tokens, lo que abarata el procesamiento de muchos ficheros en pipelines locales.

## Benchmarks y rendimiento
Los benchmarks de fidelidad de la cuantizacion (PPL en wikitext, KL forward, acuerdo top-1 y recuperacion zero-shot en arc_challenge, arc_easy, hellaswag, winogrande y mmlu) estan marcados como pendientes en la model card. Tampoco hay datos de throughput ni de tasa de aceptacion del borrador MTP.

Los unicos resultados citados son los del adaptador, medidos en BF16 bajo el arnes Hermes y no sobre esta cuantizacion:

| Tarea | Base Qwen3.8-27B (maximo esfuerzo de thinking) | Adaptador hermes (thinking off) |
|---|---|---|
| SWE-bench Pro hard-51 | 45,1% | 43,1% |
| Terminal-Bench 2.1 | 58,8% | 58,8% |

Segun el autor del adaptador, se alcanza paridad con el maximo esfuerzo de thinking del base usando aproximadamente 4 veces menos tokens.

## Requisitos de hardware
- Memoria: el checkpoint ocupa 20,52 GB; se recomienda un equipo Apple Silicon con al menos 32 GB de memoria unificada, y 64 GB para contextos largos o uso concurrente con la ruta VLM.
- Hardware de referencia declarado: Apple M3 Max con 64 GB de memoria unificada para las mediciones de rendimiento (aun pendientes).
- GPU dedicadas (A100, H100, RTX 4090): no aplicables de forma nativa, ya que el formato es MLX affine para Apple Silicon; no se documenta conversion a otros runtimes.
- Opciones de despliegue: mlx-lm (carga y generacion estandar) y oMLX (ruta VLM para imagen y video, decodificacion especulativa MTP). No requiere codigo de modelo personalizado: usa la arquitectura `qwen3_5` estandar con un mapa de cuantizacion MLX en `config.json`.
- vLLM, llama.cpp, Ollama y TGI: no disponibles para este checkpoint segun la informacion proporcionada.
- Latencia y throughput: pendientes de medicion; la model card preve protocolo con prompts en prosa natural, 2 calentamientos y al menos 3 ejecuciones cronometradas a contextos de ~1K y ~4K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| hermitdave/Qwen3.8-27B-hermes-MLX-RCO-4.5bpw | 27B (24,35B cuantizados) | no disponible | MLX safetensors, 20,52 GB | apache-2.0 | Cuantizacion RCO con adaptador de agente fusionado; fidelidad pendiente |
| Qwen/Qwen3.8-27B (base BF16) | 27B | no disponible | safetensors BF16, 55,6 GB | no disponible en la informacion | Referencia de calidad; sin especializacion de agente |
| harness-hub/Qwen3.8-27B-hermes-adapted | 27B | no disponible | LoRA sobre el base | no disponible en la informacion | Adaptador GRPO para Hermes Agent; requiere fusion o carga como adapter |
| unsloth/Qwen3.8-27B-GGUF | 27B | no disponible | GGUF | no disponible en la informacion | Alternativa para llama.cpp y Ollama; origen de la imatrix usada aqui |

## Limitaciones y advertencias
- Las metricas de fidelidad de la cuantizacion no estan publicadas; no hay evidencia medida de la perdida de calidad frente al BF16 fusionado.
- Los resultados de SWE-bench Pro y Terminal-Bench citados corresponden al adaptador en BF16 bajo el arnes Hermes, no a esta cuantizacion.
- El autor recomienda mantener el modo thinking desactivado al servir el modelo; activarlo puede degradar el comportamiento esperado del adaptador.
- El checkpoint esta atado a MLX y Apple Silicon; no hay rutas documentadas para CUDA, vLLM, llama.cpp u Ollama.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingue mas alla de la del base.
- Licencia apache-2.0 declarada, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador, cuyas licencias no se detallan en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/hermitdave/Qwen3.8-27B-hermes-MLX-RCO-4.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador fusionado: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Matriz de importancia (GGUF): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Hermes Agent: https://github.com/NousResearch/hermes-agent
- oMLX: https://github.com/raullenchai/oMLX
