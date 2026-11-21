# prithivMLmods/Qwen3.8-27B-super-adapter-GGUF

## Resumen

Qwen3.8-27B-super-adapter-GGUF es una cuantización en formato GGUF del checkpoint fusionado `harness-hub/Qwen3.8-27B-super-adapter`, publicado por el usuario prithivMLmods en Hugging Face. El checkpoint de origen se construye fusionando tres adaptadores LoRA especializados (entrenados con AsyncGRPO para los agentes pi, Hermes Agent y OpenCode en entornos Harbor/OpenEnv) sobre el modelo base Qwen/Qwen3.8-27B, sin entrenamiento adicional, mediante concatenación de rangos (rank 96 = 3 × 32) en las proyecciones q, k, v, o, gate, up y down. El resultado es un modelo de 27.320.697.856 parámetros orientado a tareas de ingeniería de software y uso de terminal.

La relevancia de esta publicación es doble. Por un lado, empaqueta el modelo en cuantizaciones listas para llama.cpp (Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q8_0) más un proyector multimodal `mmproj-bf16`, lo que permite ejecución local sin necesidad de soporte LoRA en el motor de inferencia. Por otro lado, incorpora soporte de Multi-Token Prediction (MTP) para decodificación especulativa integrada en los propios pesos, eliminando la necesidad de un modelo borrador separado.

El modelo está pensado para flujos agénticos con razonamiento activado (modo thinking, recomendado en nivel `xhigh`), y según la model card del adaptador original mejora el pass@1 medio en SWE-bench Pro (hard 51) y Terminal-Bench 2.1 del 55,5% al 63,5% con thinking activado, reduciendo además entre un 19% y un 48% las llamadas a herramientas por tarea. Estas cifras corresponden al adaptador sobre la base BF16 y no han sido reevaluadas sobre este checkpoint fusionado ni sobre las cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con cabezas MTP para decodificación especulativa; fusión de adaptadores LoRA por concatenación de rangos |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q8_0; proyector multimodal mmproj-bf16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y BF16 en el checkpoint de origen; safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27.300 millones de parámetros. Sobre él se aplicaron tres adaptadores LoRA entrenados con AsyncGRPO (variante asíncrona de GRPO, optimización de política con recompensas verificables) en entornos Harbor/OpenEnv, cada uno especializado en un agente distinto: pi, Hermes Agent y OpenCode, con foco en tareas de ingeniería de software y terminal. La fusión se realiza con `combination_type="cat"`, rank 96 (3 × 32), con peso ½ en cada adaptador, aplicando la actualización estándar `W + (alpha/r)·B@A` por tensor en fp32 y convirtiendo de nuevo a BF16. El proceso preserva el diseño de shards, los nombres de tensores y todos los tensores MTP del modelo base.

La innovación técnica destacable es la integración de Multi-Token Prediction (MTP) en los pesos: el GGUF incluye cabezas de salida adicionales que predicen varios tokens futuros en una sola pasada, lo que habilita decodificación especulativa sin modelo borrador externo. Los datasets citados en la model card son `harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor` y `ai-and/termgrade-environments`; no se detalla el número de tokens de entrenamiento ni la composición completa del corpus.

## Capacidades

- Generación de texto y razonamiento con modo thinking (recomendado en nivel `xhigh`), además de modo sin thinking.
- Ejecución de tareas de ingeniería de software: parcheo de repositorios, resolución de issues y navegación de código.
- Operación en terminal y entornos de línea de comandos (Terminal-Bench 2.1), incluyendo flujos multi-paso.
- Uso de herramientas (tool calling / function calling) optimizado para reducir el número de llamadas por tarea.
- Comportamiento agéntico en entornos Harbor/OpenEnv, con integración específica para pi, Hermes Agent y OpenCode.
- Capacidades de imagen a texto: el repositorio incluye `mmproj-bf16.gguf` y el pipeline declarado es `image-text-to-text`.
- Decodificación especulativa nativa mediante MTP.
- Soporte multilingüe limitado: la model card solo declara inglés (`en`).

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un issue y el árbol del proyecto, localizar los ficheros relevantes y generar un parche; su entrenamiento específico en SWE-bench Pro lo hace adecuado para este flujo.
- Agente de terminal para tareas de administración: ejecución de comandos, interpretación de salidas y corrección de errores en cadenas multi-paso, apoyándose en la reducción de llamadas a herramientas documentada.
- Integración en asistentes de código tipo OpenCode o Hermes Agent: el adaptador se entrenó sobre estos agentes, por lo que encaja directamente en sus protocolos de herramientas.
- Automatización de pipelines CI/CD: uso como agente que diagnostica fallos de build, propone correcciones y valida cambios en un bucle con herramientas externas.
- Asistencia multimodal en documentación técnica: con el proyector `mmproj-bf16` puede procesar capturas de pantalla o diagramas junto a texto para tareas de image-text-to-text.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (17 GB) y Q4_K_S (15,8 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, útil para prototipado de agentes sin infraestructura cloud.
- Evaluación de agentes en entornos simulados: sirve como política de referencia en Harbor/OpenEnv para comparar estrategias de tool calling y razonamiento.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al adaptador original sobre la base BF16, no a este checkpoint fusionado ni a las cuantizaciones GGUF.

| Benchmark | Sin thinking | Con thinking |
|---|---|---|
| SWE-bench Pro (hard 51) + Terminal-Bench 2.1, pass@1 medio (pi, Hermes Agent, OpenCode) | 39,5% | 63,5% |
| Mismo conjunto, referencia sin adaptador | no disponible | 55,5% |
| Reducción de llamadas a herramientas por tarea (con thinking) | no disponible | 19–48% |
| Reducción de llamadas a herramientas por tarea (sin thinking) | no disponible | 53–73% |

No se han publicado resultados desagregados por benchmark (MMLU, HumanEval, GSM8K) ni mediciones de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_S ≈ 15,8 GB de pesos; Q4_K_M ≈ 17 GB; Q5_K_S ≈ 19 GB; Q5_K_M ≈ 19,6 GB; Q8_0 ≈ 29 GB; a ello hay que sumar el proyector multimodal (931 MB) y la caché KV, cuyo tamaño depende del contexto configurado (no disponible).
- GPU de consumo: Q4_K_M y Q4_K_S caben en GPUs de 24 GB (RTX 3090, RTX 4090); Q5 requiere 24 GB con contexto moderado; Q8_0 necesita 32 GB o más y no cabe en consumer de 24 GB.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten ejecutar Q8_0 con contexto amplio o BF16 en el caso de 80 GB.
- Opciones de despliegue: llama.cpp (cuantización generada con esta herramienta); el checkpoint BF16 de origen es compatible con transformers y motores sin soporte LoRA; los tags mencionan text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponibles. El soporte MTP debería reducir la latencia de decodificación frente a un GGUF equivalente sin decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-super-adapter-GGUF (este) | 27,3B | no disponible | Agentes de código y terminal, MTP, multimodal | Apache 2.0 | GGUF en HF |
| harness-hub/Qwen3.8-27B-super-adapter (BF16) | 27,3B | no disponible | Mismo modelo sin cuantizar | Apache 2.0 | BF16 en HF |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | Modelo generalista sin adaptadores | no disponible en la información | HF |
| Alternativas de 27B–32B para código | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la competencia en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks citados (63,5% de pass@1) se midieron sobre el adaptador con la base BF16 y no se han reevaluado sobre este checkpoint fusionado ni sobre las cuantizaciones GGUF; el rendimiento real puede diferir.
- La fusión por concatenación de rangos con peso ½ por adaptador es una técnica heurística: no hay garantía de que las capacidades de los tres agentes se conserven íntegramente ni de que no haya interferencias entre especializaciones.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no se especifica en la información disponible, lo que dificulta planificar su uso en repositorios grandes.
- Riesgo de alucinación inherente a los modelos generativos, agravado en tareas de código donde puede inventar APIs o rutas de ficheros inexistentes.
- El modelo está especializado en entornos agénticos concretos (pi, Hermes Agent, OpenCode); fuera de esos protocolos de herramientas el rendimiento puede degradarse.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen subyacente, no detalladas en la información disponible.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.
- El tamaño del repositorio (101,4 GB) implica descargas largas si se quieren varias cuantizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-super-adapter-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset harness-adapters: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset termgrade-environments: https://huggingface.co/datasets/ai-and/termgrade-environments
