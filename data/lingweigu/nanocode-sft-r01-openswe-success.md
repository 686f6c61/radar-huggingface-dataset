# LingweiGu/nanocode-sft-r01-openswe-success

## Resumen
Nanocode SFT round 1 es un checkpoint de investigación de 2.516.756.480 parámetros (≈2,5 B) publicado por LingweiGu sobre la arquitectura MiniCPM5 (`LlamaForCausalLM`) con una ventana de contexto de 131.072 tokens. Parte de `eigentom/nanocode_sft_60b` (checkpoint-8900, MiniCPM5-2B-Midtrain tras SFT sobre la mezcla oficial UltraData) y aplica una ronda adicional de ajuste supervisado completo sobre trayectorias de agente de ingeniería de software que terminaron resolviendo la tarea.

El problema que aborda es concreto: conseguir un agente pequeño, desplegable en hardware modesto, capaz de operar con los formatos de herramienta de OpenHands, SWE-agent y mini-swe-agent sin conversión de harness. El entrenamiento usa 68.476 trayectorias filtradas de `nvidia/Open-SWE-Traces` (18.372 tareas, 3,14 B tokens de entrada y 0,98 B tokens supervisados), con loss únicamente sobre los turnos del asistente.

Es relevante ahora porque la mayoría de agentes de software abiertos con buen rendimiento en tool calling superan los 7 B de parámetros, y este checkpoint explora cuánto se puede apretar un modelo de 2,5 B con contexto de 128K y licencia Apache-2.0. Ahora bien, el propio autor lo etiqueta como checkpoint intermedio: no publica resultados de benchmarks downstream, solo la pérdida sobre un conjunto de validación separado por repositorio.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`, familia MiniCPM5) |
| Parametros totales | 2.516.756.480 (≈2,5 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponibles (el repositorio publica pesos en bf16; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |
| Autor | LingweiGu |
| Modelo base | eigentom/nanocode_sft_60b (checkpoint-8900, revisión 3b6f57a2) |
| Dataset de entrenamiento | nvidia/Open-SWE-Traces (revisión f8fb5b3d), subconjunto `resolved == 1` |
| Framework de entrenamiento | LLaMA-Factory (full fine-tuning), DeepSpeed ZeRO-2, FlashAttention-3, kernels Liger |
| Hardware de entrenamiento | 8× H100 80 GB (clúster Killarney, Vector Institute) |
| Tamaño del repositorio | 5,0 GB |
| Fecha de publicación | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La arquitectura es la del modelo base MiniCPM5-2B: un transformer decoder-only denso expuesto como `LlamaForCausalLM`, con plantilla de chat propia (`chat_template.jinja`) que admite definiciones de herramientas y turnos de razonamiento. El ajuste se hizo con fine-tuning completo (no LoRA), DeepSpeed ZeRO-2, FlashAttention-3 y gradient checkpointing. Las secuencias se pre-tokenizaron con la plantilla nativa de MiniCPM5, con máscara de pérdida solo en los turnos del asistente (razonamiento, texto y llamadas a herramienta) y empaquetado a 32K con fronteras de atención y posición por muestra; las secuencias nunca se truncaron hasta el límite de 131.072 tokens.

Los datos son el punto diferencial: trayectorias de `nvidia/Open-SWE-Traces` con `resolved == 1`, tras eliminar repositorios de SWE-bench Verified, SWE-bench Pro y DeepSWE, registros con llamadas a herramienta malformadas y marcadores de riesgo conservadores, con un máximo de 6 trayectorias por tarea. El resultado son 68.476 trayectorias sobre 18.372 tareas y 0,98 B tokens supervisados. Se conservaron los formatos de herramienta originales de OpenHands, SWE-agent y mini-swe-agent, sin conversión de harness. Optimizador AdamW con estado reiniciado, weight decay 0,01, grad clip 1,0, bf16, batch de 32 secuencias por actualización (8×H100 con acumulación 4), 100 pasos de warmup, tasa plana de 1e-5 y decaimiento coseno en el último 20% hasta 1e-6. Total: 2.124 actualizaciones, 1 época. No se documenta RLHF, DPO ni ninguna fase de alineamiento posterior al SFT.

## Capacidades
- Generación de texto y razonamiento orientados a tareas de ingeniería de software dentro de un bucle de agente.
- Tool calling con la plantilla de chat incluida, que soporta definiciones de herramientas y bloques de razonamiento previos a la llamada.
- Compatibilidad directa con los formatos de herramienta de OpenHands, SWE-agent y mini-swe-agent (sin conversión de harness).
- Ejecución de agentes multi-paso: lectura y edición de ficheros, ejecución de comandos, interpretación de salidas y encadenamiento de acciones hasta cerrar la tarea.
- Contexto largo de 131.072 tokens, útil para razonar sobre repositorios completos o historiales extensos de interacción.
- Capacidades multilingües: no disponible (el autor no declara lista de idiomas).
- Visión, audio u otras modalidades: no disponibles.
- No se documentan capacidades específicas de matemáticas, código generalista o function calling estructurado fuera del ámbito del agente de software.

## Casos de uso
- Resolución automática de issues en repositorios: el modelo recibe el enunciado del issue más el árbol y los ficheros relevantes del repositorio, y produce una secuencia de llamadas a herramienta (búsqueda, edición, ejecución de tests) hasta generar un parche. Su entrenamiento con trayectorias resueltas de OpenHands y SWE-agent lo hace adecuado precisamente para ese formato de interacción.
- Corrección de bugs en pipelines de CI: integrado como agente que se dispara cuando un job de test falla, lee el log, localiza el fichero culpable y propone un parche. Los 131.072 tokens de contexto permiten incluir el log completo y varios ficheros de código sin truncar.
- Refactorización y mantenimiento en monorepos: dado que el contexto admite repositorios grandes, puede aplicarse a tareas de renombrado de APIs, migración de firmas o eliminación de código muerto con varias llamadas a herramienta encadenadas.
- Generación y reparación de tests: el modelo puede escribir tests nuevos o arreglar los existentes tras inspeccionar la implementación, reutilizando el bucle de edición y ejecución aprendido del dataset.
- Actualización de dependencias: agentes que actualizan versiones en ficheros de manifiesto, corrigen llamadas incompatibles y verifican con la suite de tests, iterando sobre los fallos.
- Revisión de código asistida: con el repositorio en contexto, el modelo puede señalar ficheros afectados por un cambio y redactar comentarios de revisión, aunque conviene validar sus referencias a líneas y símbolos por riesgo de alucinación.
- Investigación en agentes y generación de datos sintéticos: como checkpoint de 2,5 B con tool calling nativo es un candidato barato para experimentar con RL sobre trayectorias, destilación o comparación de harnesses, siempre que se asuma la falta de benchmarks publicados.
- Despliegue en entornos con recursos limitados: una única GPU consumer puede servir el modelo cuantizado para tareas de asistencia de código internas, algo inviable con agentes de 32 B o 70 B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que es un checkpoint intermedio sin resultados downstream, y no reporta MMLU, HumanEval, GSM8K, SWE-bench ni métricas de agente. Lo único documentado es la pérdida sobre un conjunto de validación retenido de 64 trayectorias, con partición disjunta por repositorio:

| Paso | 0 | 250 | 500 | 750 | 1000 | 1250 | 1500 | 1750 | 2000 |
|---|---|---|---|---|---|---|---|---|---|
| Pérdida | 0,317 | 0,259 | 0,254 | 0,251 | 0,249 | 0,247 | 0,246 | 0,244 | 0,240 |

Datos de entrenamiento asociados: 2.124 actualizaciones, 1 época, 3,14 B tokens de entrada y 0,98 B tokens supervisados, sobre 8× H100 80 GB. El log completo está en `trainer_state.json` del repositorio.

## Requisitos de hardware
- VRAM para inferencia en bf16: aproximadamente 5 GB solo de pesos (el repositorio ocupa 5,0 GB), más activaciones y caché KV; en la práctica, entre 7 y 10 GB según longitud de contexto y batch.
- VRAM con cuantización: alrededor de 3 GB en int8 y de 1,5 a 2,5 GB en 4 bits (estimación a partir del número de parámetros; no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio con contexto largo; RTX 4090 24 GB y RTX 4080 16 GB para desarrollo y contexto moderado.
- Cabe en GPU consumer: sí. RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 funcionan en bf16 con contexto contenido; en 8 GB (RTX 3070/4060) es viable con cuantización de 4 bits y ventanas más cortas.
- Opciones de despliegue: `transformers` (referencia del autor), vLLM, TGI (el repositorio está marcado como compatible con endpoints), SGLang, y llama.cpp/Ollama tras convertir los pesos a GGUF, conversión que el autor no proporciona.
- Reproducción del entrenamiento: full fine-tuning sobre 8× H100 80 GB con DeepSpeed ZeRO-2, según la configuración publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| LingweiGu/nanocode-sft-r01-openswe-success | ≈2,5 B (denso) | 131.072 tokens | Apache-2.0 | sin benchmarks publicados; pérdida de validación 0,240 | pesos safetensors en HuggingFace, 0 descargas |
| eigentom/nanocode_sft_60b (modelo base) | ≈2,5 B (denso) | 131.072 tokens | Apache-2.0 (según el modelo base) | no comparable: sin cifras en esta ficha | pesos safetensors en HuggingFace |
| Qwen2.5-Coder-3B-Instruct | 3,09 B (denso) | 32.768 tokens | Apache-2.0 | no comparable: sin cifras en esta ficha | pesos safetensors y cuantizaciones GGUF/AWQ/GPTQ |
| Llama-3.2-3B-Instruct | 3,21 B (denso) | 128.000 tokens | Llama 3.2 Community License | no comparable: sin cifras en esta ficha | pesos safetensors y GGUF |

Diferencias clave: frente a Qwen2.5-Coder-3B, este checkpoint cuadruplica la ventana de contexto (131.072 frente a 32.768) y está especializado en trayectorias de agente con formatos de harness concretos, pero carece de benchmarks publicados y de cuantizaciones listas para usar. Frente a Llama-3.2-3B, la licencia Apache-2.0 es más permisiva y el contexto es equivalente, aunque Llama-3.2 es un modelo generalista con alineamiento documentado y este es un checkpoint de investigación orientado a agentes de software.

## Limitaciones y advertencias
- Es un checkpoint intermedio de investigación: el autor no publica ningún resultado de benchmark downstream, por lo que no hay evidencia cuantitativa de rendimiento en SWE-bench ni en tareas reales.
- El entrenamiento usa solo trayectorias con `resolved == 1`: el modelo apenas ha visto ejemplos de recuperación tras un fallo, lo que puede degradar su comportamiento cuando una acción no funciona.
- Sesgo hacia el estilo de los harnesses presentes en los datos (OpenHands, SWE-agent, mini-swe-agent); fuera de esos formatos de herramienta el comportamiento puede degradarse.
- Riesgo de alucinación en nombres de ficheros, rutas, símbolos, APIs y comandos, especialmente al razonar sobre repositorios que no ha visto.
- Se eliminaron los repositorios de SWE-bench Verified, SWE-bench Pro y DeepSWE, lo que mitiga la contaminación en esos conjuntos, pero no hay garantía de ausencia de solapamiento con otros benchmarks.
- Idiomas soportados no declarados; las trazas de ingeniería de software son mayoritariamente en inglés, por lo que el rendimiento en castellano no está verificado.
- A 131.072 tokens, la caché KV crece de forma notable y puede superar la VRAM de GPU consumer aunque los pesos sí quepan; conviene limitar la ventana en producción.
- No se documenta ninguna fase de alineamiento de seguridad (RLHF, DPO) ni filtros de contenido: no es un modelo listo para exposición directa a usuarios finales sin capas adicionales de validación.
- Licencia de pesos Apache-2.0, pero los datos derivan de `nvidia/Open-SWE-Traces` (CC BY 4.0) y aplican las licencias de los repositorios de origen; se exige atribución a NVIDIA y a las fuentes Scale-SWE y SWE-rebench-V2.
- El repositorio no incluye cuantizaciones oficiales ni artefactos GGUF, por lo que el despliegue con llama.cpp u Ollama requiere conversión propia y validación posterior.
- Con 0 descargas y 0 likes, el modelo no tiene validación por parte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/LingweiGu/nanocode-sft-r01-openswe-success
- Modelo base (eigentom/nanocode_sft_60b, checkpoint-8900): https://huggingface.co/eigentom/nanocode_sft_60b
- Dataset de entrenamiento (nvidia/Open-SWE-Traces, revisión f8fb5b3d): https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Artículos, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
