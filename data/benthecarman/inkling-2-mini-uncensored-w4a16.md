# benthecarman/Inkling-2-Mini-uncensored-W4A16

## Resumen

Inkling-2-Mini-uncensored-W4A16 es una cuantización INT4 de solo pesos (W4A16) del modelo multimodal Inkling-2-Mini-uncensored, publicada por el usuario benthecarman. El modelo base es una variante "abliterated" (sin censura) de Inkling-2-Mini, una arquitectura MoE con capacidades de imagen-texto-a-texto y un mecanismo de bucle propietario (inkling2_loop). Esta versión concreta re-cuantiza los expertos enrutados de las capas 0-23 desde los pesos nativos NVFP4/MXFP8 a INT4 simétrico, manteniendo el resto de componentes en BF16.

El objetivo de esta release es hacer viable la inferencia del modelo en GPUs no-Blackwell (Ampere, RTX 3090, A100, Ada), donde los formatos nativos NVFP4/MXFP8 no están soportados por hardware. Con 26.579.744.256 parámetros totales y un repositorio de 17,1 GB, el checkpoint incluye además una cabeza de borrador especulativa DSpark (MTP/DFlash) de 0,64 GB que permite decodificación especulativa.

La relevancia de esta ficha está en que combina tres tendencias actuales: cuantización agresiva para democratizar modelos grandes en hardware de consumo, eliminación de alineación de seguridad (uncensored/abliterated) y decodificación especulativa integrada. La licencia Apache 2.0 facilita su uso comercial, aunque las capacidades sin censura introducen riesgos importantes que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con bucle (inkling2_loop), multimodal image-text-to-text, transformer con expertos enrutados |
| Parametros totales | 26.579.744.256 (26,58 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 448K tokens (según script de lanzamiento `launch_tp2_max.sh` con DSpark k=7) |
| Tipos de cuantizacion | INT4 W4A16 (group size 128, escalas BF16 MSE-optimal, layout `pack-quantized` de compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 4 shards para expertos (16,47 GB) + `mtp.safetensors` (0,64 GB) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura MoE con un mecanismo de bucle ("loop") y capacidades multimodales (pipeline image-text-to-text). Incluye 120 proyecciones de atención en BF16, embeddings, routers, controladores de bucle, codificador de visión, tokenizer y plantilla de chat. La variante W4A16 solo modifica los expertos enrutados de las capas 0-23, que se de-cuantizan desde NVFP4/MXFP8 y se re-cuantizan a INT4 simétrico con grupo 128 y escalas BF16 recortadas por MSE. El resto de pesos permanece byte-idéntico al modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada. La model card sí documenta que el modelo base es una versión "abliterated/uncensored" con una divergencia KL de 0,230 respecto al modelo original en el primer token de respuesta (thinking off), lo que indica que la modificación de alineación es sustancial pero acotada. Incluye una cabeza de borrador especulativa DSpark (MTP/DFlash) que permite decodificación especulativa con `num_speculative_tokens=7` y muestreo probabilístico.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (image-text-to-text): el codificador de visión se mantiene intacto en BF16.
- Razonamiento y matemáticas (MMLU 75,3% en el modelo padre).
- Generación de código (HumanEval 97,0% con thinking off y 99,4% con thinking `low`).
- Tool calling / function calling (BFCL v4 80,1%).
- Decodificación especulativa integrada mediante cabeza DSpark (MTP), con hasta 7 tokens especulativos.
- Modo "thinking" configurable (off / low / medium / high) según los benchmarks del modelo padre.
- Capacidades multilingües: no disponible en la información proporcionada.
- Comportamiento sin censura: tasa de rechazo del 6,6% en un conjunto retenido de 633 prompts (frente al 91,0% del base alineado).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un sistema abliterated con métricas documentadas (HarmBench-320 ASR del 65,0%, tasa de rechazo del 6,6%), útil para construir defensas y evaluar riesgos en entornos controlados.
- Despliegue en GPUs Ampere de consumo: con 17,1 GB de pesos y cuantización W4A16, puede ejecutarse en una RTX 3090 de 24 GB usando el overlay de vLLM, lo que permite experimentar con un MoE de 26,58 B en hardware asequible.
- Atención al cliente y asistentes conversacionales: la ventana de 448K tokens y el soporte multi-turno permiten gestionar conversaciones largas con historial extenso y documentos adjuntos.
- Análisis de documentos con imágenes: el pipeline image-text-to-text permite extraer y razonar sobre información de capturas, diagramas o formularios combinados con texto.
- Generación de código en pipelines internos: HumanEval del 97,0-99,4% y tool calling del 80,1% lo hacen adecuado para asistentes de programación con integración de herramientas, siempre que se acepte el riesgo de contenido sin filtrar.
- Prototipado de agentes con razonamiento multi-paso: el modo thinking configurable y la decodificación especulativa DSpark reducen latencia en bucles de agente con múltiples llamadas.
- Servicio de inferencia con vLLM en 2x24 GB: el script `launch_tp2_max.sh` permite tensor-parallel de 2 GPUs con contexto de 448K y DSpark k=7, útil para servir la API compatible con OpenAI en entornos de investigación.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo padre (`benthecarman/Inkling-2-Mini-uncensored`, NVFP4/MXFP8 nativo, temperature=1.0, seed=0):

| Benchmark | Inkling-2-Mini base | Uncensored (padre) |
|---|---:|---:|
| KL from base (primer token, thinking off) | 0,000 | 0,230 |
| MMLU (14.042 preguntas, 5-shot generativo, thinking off) | 76,6% | 75,3% |
| HumanEval (164 problemas, off / low) | 97,6% / 98,2% | 97,0% / 99,4% |
| BFCL v4 tool calling (final, 1.205 prompts) | 79,5% | 80,1% |
| Conjunto de rechazo retenido (633 prompts, System One) | 91,0% rechazados | 6,6% rechazados |
| HarmBench-320 (low / off, DirectRequest ASR) | 1,6% / 2,5% | 65,0% / 64,7% |
| audn 520 (low / medium / high / off) | 0,0% en todos | 85,0% / 86,7% / 88,3% / 81,9% delivered |

No se han publicado resultados de benchmarks específicos para esta cuantización W4A16 en la información disponible; los datos anteriores corresponden al modelo padre en precisión nativa.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17,1 GB de pesos (16,47 GB expertos INT4 + 0,64 GB MTP + resto BF16), más overhead de KV cache y activaciones. Para contexto largo se necesita margen adicional.
- GPU recomendadas: RTX 3090 (24 GB) en single-GPU con `launch_tp1.sh`; 2x24 GB con `launch_tp2_max.sh` para contexto de 448K y DSpark k=7; A100 y GPUs Ada también soportadas por el overlay.
- GPUs no recomendadas: Blackwell (RTX 5090, B200, DGX Spark) y Hopper (H100, H200) deben usar la release nativa NVFP4/MXFP8 del modelo base.
- Cabe en GPU de consumo: sí, en RTX 3090 (24 GB) y previsiblemente en RTX 4090 (24 GB, Ada) con el overlay correspondiente.
- Opciones de despliegue: vLLM con la imagen `vllm/vllm-openai:inkling-2-mini` más el overlay `tonyd2wild/Inkling-2-Mini-W4A16-RTX3090` (PRs upstream #69141 y #69165 aún abiertos); llama.cpp/GGUF disponible en el repo `Inkling-2-Mini-uncensored-GGUF` para CPU, Apple Silicon y single-GPU.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa DSpark con 7 tokens puede reducir la latencia en decodificación autoregresiva, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-uncensored-W4A16 (este) | 26,58 B | 448K | INT4 W4A16 | Apache 2.0 | HF, vLLM con overlay, GGUF aparte |
| Inkling-2-Mini-uncensored (padre) | 26,58 B | 448K | NVFP4/MXFP8 nativo | Apache 2.0 | HF, para Blackwell/Hopper |
| Inkling-2-Mini (base alineado) | 26,58 B | 448K | NVFP4/MXFP8 | Apache 2.0 | HF |
| Inkling-2-Mini-uncensored-GGUF | 26,58 B | 448K | GGUF (varias) | Apache 2.0 | HF, llama.cpp |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~26 B) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": la tasa de rechazo cae al 6,6% y el ASR de HarmBench-320 sube al 65,0%, lo que implica un riesgo alto de generar contenido dañino, ilegal o socialmente inaceptable. No apto para producción orientada al público sin filtros externos.
- Sesgos conocidos: no documentados en la información proporcionada, pero la eliminación de alineación puede amplificar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: no cuantificado en la información disponible; el modo thinking off puede aumentar la tasa de respuestas incorrectas en tareas de razonamiento.
- Idiomas soportados: no especificados; el rendimiento multilingüe es incierto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el contenido generado puede violar normativas locales (por ejemplo, en la UE).
- Compatibilidad: stock vLLM no carga W4A16 Inkling 2 sin el overlay de Ampere; los PRs upstream #69141 y #69165 siguen abiertos, lo que supone un riesgo de mantenimiento.
- Degradación por cuantización: no se han publicado métricas de calidad específicas para esta W4A16; la pérdida respecto al padre NVFP4/MXFP8 es desconocida.
- El repositorio tiene solo 2 descargas y 0 likes, lo que indica una validación comunitaria mínima.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/benthecarman/Inkling-2-Mini-uncensored-W4A16
- Modelo base: https://huggingface.co/benthecarman/Inkling-2-Mini-uncensored
- Versión GGUF: https://huggingface.co/benthecarman/Inkling-2-Mini-uncensored-GGUF
- Overlay vLLM para Ampere/RTX 3090: https://github.com/tonyd2wild/Inkling-2-Mini-W4A16-RTX3090
- Patrocinador: https://maple.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- PRs upstream de vLLM: #69141 y #69165 (referenciados en la model card, sin URL directa disponible)
