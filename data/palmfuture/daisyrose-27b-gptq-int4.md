# palmfuture/DaisyRose-27B-GPTQ-Int4

## Resumen

DaisyRose-27B-GPTQ-Int4 es una cuantización de 4 bits del modelo RadixArk/DaisyRose-27B, un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.8-27B orientado a tareas de agente de horizonte largo. La cuantización la publica el usuario palmfuture, que mantiene una familia de checkpoints GPTQ Int4 derivados del mismo modelo base (Qwen3.8-27B y su variante pi), con idénticos ajustes de cuantización y disposición de ficheros, pero con un conjunto de calibración nuevo que incorpora sesiones de agente, llamadas a herramientas, razonamiento y texto en tailandés.

El modelo conserva la arquitectura de Qwen3.8-27B, con 27.781.427.952 parámetros totales (unos 27,8 mil millones) y una torre visual, por lo que su pipeline es image-text-to-text. Incluye los pesos de predicción multi-token (MTP) para decodificación especulativa y está pensado para despliegues conversacionales y de agentes en los que el coste de VRAM del formato bf16 resulta prohibitivo.

Su relevancia práctica radica en que ofrece un checkpoint de 4 bits con licencia Apache 2.0, soporte de visión, tool calling y decodificación especulativa, y con métricas de calidad de cuantización publicadas por el autor. La advertencia principal es que las ganancias del ajuste por RL de RadixArk no se han reproducido sobre esta cuantización, por lo que debe validarse en la carga de trabajo real de cada usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal Gated DeltaNet y atención completa (derivada de Qwen3.8-27B), con torre visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (unos 27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ Int4, `group_size=32`, simétrico, `desc_act=False`, `damp_percent=0.05`, `true_sequential=True`; pesos sensibles conservados en bf16 |
| Idiomas soportados | en, th, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (incluye `mtp.safetensors` con 15 tensores MTP) |

## Arquitectura y entrenamiento

La arquitectura subyacente combina capas de atención completa con capas de atención lineal basadas en Gated DeltaNet, tal como se deduce de la lista de módulos cuantizados (`q_proj`, `k_proj`, `v_proj`, `o_proj` frente a `in_proj_qkv`, `in_proj_z`, `out_proj`). Incluye además una torre visual (`model.visual.*`) y una cabeza de predicción multi-token (`mtp.*`, 15 tensores) que habilita decodificación especulativa. El modelo base DaisyRose-27B es un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.8-27B realizado por RadixArk para tareas de agente de horizonte largo; según el autor de la cuantización, los pesos de DaisyRose difieren de los del modelo base en un 0,10-0,15 % por capa (norma de Frobenius relativa).

La cuantización se realizó con GPTQModel 7.0.0 sobre el checkpoint en bf16. Se cuantizaron a int4 las proyecciones de atención completa, las proyecciones de atención lineal y las tres matrices del MLP (`gate_proj`, `up_proj`, `down_proj`), en total 400 módulos GPTQ sin ningún fallback a RTN. Se mantuvieron en bf16 las dinámicas de estado de la atención lineal (`A_log`, `conv1d`, `dt_bias`, `in_proj_b`, `in_proj_a`, `in_proj_ba`, `linear_attn.norm`), las normalizaciones (`q_norm`, `k_norm`, `input_layernorm`, `post_attention_layernorm`), la cabeza MTP, el codificador visual, los embeddings y `lm_head`. El conjunto de calibración consta de 276 muestras y 321.541 tokens (cortados a 2.048 tokens, código a 1.024), con un 27,5 % de tokens en tailandés, e incluye SWE-smith-trajectories, hermes-function-calling-v1, OpenThoughts-114k, WangchanThaiInstruct, Wikipedia tailandés, C4, tulu-3-sft-mixture y codeparrot-clean-valid. Las conversaciones se renderizan con la plantilla de chat de Qwen3.8 para que el modelo vea definiciones de herramientas, bloques `<tool_call>` y razonamiento `<think>` durante la calibración.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, tailandés y chino.
- Razonamiento explícito mediante modo `<think>`, presente en el formato de chat y en el conjunto de calibración.
- Llamada a herramientas y function calling, calibrado con hermes-function-calling-v1 en el formato de Qwen.
- Tareas de agente de horizonte largo, incluidas sesiones de agente de código con llamadas a herramientas (herencia del ajuste por RL de RadixArk).
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre visual conservada en bf16.
- Decodificación especulativa mediante la cabeza de predicción multi-token incluida en `mtp.safetensors`.
- Capacidades multilingües limitadas a inglés, tailandés y chino según la model card.

## Casos de uso

- Agentes de código en producción: el modelo se calibró con trayectorias de SWE-smith con llamadas a herramientas y razonamiento, por lo que puede integrarse en pipelines que ejecutan comandos, editan ficheros y encadenan pasos multi-etapa; conviene validar la tasa de éxito en el propio repositorio antes de desplegarlo.
- Automatización de atención al cliente en tailandés: el 27,5 % de los tokens de calibración son tailandeses y el modelo conserva el vocabulario de Qwen3.8, lo que permite conversaciones multi-turno en ese idioma; debe monitorizarse la aparición ocasional de caracteres chinos intercalados.
- Asistentes con function calling sobre APIs internas: la calibración con hermes-function-calling-v1 en el formato de Qwen facilita la generación de bloques `<tool_call>` estructurados para orquestadores tipo ReAct.
- Análisis de documentos con imagen: la torre visual en bf16 permite tareas image-text-to-text, como extracción de datos de capturas o formularios, combinadas con razonamiento textual.
- Razonamiento largo con coste de VRAM reducido: el formato Int4 con grupo de 32 reduce el peso a unos 21 GB de repositorio, lo que hace viable el despliegue en GPUs de 24 GB con cuantización adicional o en GPUs de 48 GB en adelante.
- Servicio de inferencia de baja latencia: la cabeza MTP incluida permite decodificación especulativa en servidores compatibles, útil para reducir la latencia por token en cargas conversacionales.
- Procesamiento de texto en chino e inglés: el modelo conserva las capacidades multilingües de Qwen3.8 en ambos idiomas, aprovechables en tareas de resumen, clasificación y extracción.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) sobre esta cuantización. Las cifras de agente citadas (Terminal-Bench 2.1 73,0 → 75,5 y DeepSWE 42,2 → 46,2) corresponden al modelo sin cuantizar y en FP8 según RadixArk, y no se han reproducido sobre este checkpoint. Las métricas medidas por el autor de la cuantización son las siguientes:

| Metrica | Este modelo | Qwen3.8-27B-pi-GPTQ-Int4 | Qwen3.8-27B-GPTQ-Int4 |
|---|---|---|---|
| Modulos GPTQ cuantizados / fallback RTN | 400 / 0 | 400 / 0 | 400 / 0 |
| Texto tailandes, NLL medio por token (menor es mejor) | 1,558 | 1,535 | 1,575 |
| Texto ingles, NLL medio por token | 1,720 | 1,750 | 1,745 |
| QA factual/aritmetica corta (6 items) | 5/6 | 4/6 | 5/6 |

La pérdida GPTQ de esta ejecución sobre su conjunto de calibración fue de 6,16e-05 de media y 3,67e-04 máxima; con el conjunto de calibración de los checkpoints hermanos la pérdida fue de 1,52e-04 de media y 8,83e-04 máxima. El autor señala que las diferencias del 1-2 % entre columnas son del orden de la variabilidad entre dos ejecuciones de cuantización del mismo modelo y que ninguna de estas pruebas mide capacidad de agente.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 21,0 GB en Int4 con grupo de 32; en la práctica se necesita margen adicional para caché KV, activaciones y el codificador visual, por lo que se recomienda al menos 24 GB de VRAM y idealmente 32-48 GB para contextos largos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB y RTX 6000 Ada 48 GB para despliegues de producción; RTX 4090 24 GB puede funcionar con contextos moderados y batch pequeño.
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB con limitaciones de contexto y batch; en GPUs de 16 GB no es viable sin cuantización adicional del checkpoint.
- Opciones de despliegue: servidores compatibles con GPTQ Int4 (vLLM, TGI, entre otros); la decodificación especulativa requiere soporte de la cabeza MTP en el runtime elegido. No se indica compatibilidad con llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles; el autor no publica cifras de velocidad en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-GPTQ-Int4 (este) | 27,8 mil millones | no disponible | apache-2.0 | safetensors Int4 GPTQ g32 | Calibración con agentes, tool calls, razonamiento y tailandés; incluye MTP |
| Qwen3.8-27B-GPTQ-Int4 | 27,8 mil millones (base) | no disponible | apache-2.0 | safetensors Int4 GPTQ g32 | Misma cuantización sobre el modelo base sin ajuste por RL; NLL tailandés 1,575 e inglés 1,745 |
| Qwen3.8-27B-pi-GPTQ-Int4 | 27,8 mil millones (base) | no disponible | apache-2.0 | safetensors Int4 GPTQ g32 | Variante pi del modelo base; NLL tailandés 1,535 e inglés 1,750 |
| RadixArk/DaisyRose-27B | 27,8 mil millones | no disponible | no disponible | bf16 | Modelo sin cuantizar; el autor reporta Terminal-Bench 2.1 75,5 y DeepSWE 46,2 |

## Limitaciones y advertencias

- Las ganancias de agente del ajuste por RL de RadixArk no se han reproducido sobre esta cuantización; los pesos difieren del modelo base en un 0,10-0,15 % por capa, una magnitud pequeña frente al cambio que introduce la cuantización de 4 bits.
- El modelo base, y por herencia esta cuantización, intercala ocasionalmente caracteres chinos en texto tailandés: 9 de 96 artículos largos a temperatura 0,7 y top_p 0,8, y 35 de 384 historias cortas a temperatura 1,0.
- Riesgo de alucinación no cuantificado en la información disponible; el autor solo reporta 5/6 en un conjunto de 6 preguntas factuales y aritméticas.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar despliegues con ventanas largas sin verificación empírica.
- Cobertura idiomática limitada a inglés, tailandés y chino; no se garantiza un rendimiento adecuado en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base RadixArk/DaisyRose-27B no declara licencia en la información disponible, por lo que conviene verificar la cadena de licencias antes de un despliegue comercial.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/palmfuture/DaisyRose-27B-GPTQ-Int4
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint hermano: https://huggingface.co/palmfuture/Qwen3.8-27B-GPTQ-Int4
- Checkpoint hermano: https://huggingface.co/palmfuture/Qwen3.8-27B-pi-GPTQ-Int4
- Dataset de calibración: https://huggingface.co/datasets/SWE-bench/SWE-smith-trajectories
- Dataset de calibración: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset de calibración: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset de calibración: https://huggingface.co/datasets/airesearch/WangchanThaiInstruct
- Dataset de calibración: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset de calibración: https://huggingface.co/datasets/allenai/c4
- Dataset de calibración: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset de calibración: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
