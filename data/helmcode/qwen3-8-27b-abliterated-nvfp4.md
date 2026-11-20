# Helmcode/Qwen3.8-27B-Abliterated-NVFP4

## Resumen

Qwen3.8-27B-Abliterated-NVFP4 es una cuantización de precisión mixta NVFP4 del modelo Helmcode/Qwen3.8-27B-Abliterated, publicado por Helmcode bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Qwen3.5, con capacidades de razonamiento explícito (modo thinking) y una variante "abliterated" que elimina los mecanismos de rechazo del modelo original. El repositorio ocupa 23,4 GB y contiene 20.294.595.312 parámetros reales en formato safetensors.

La relevancia de esta ficha reside en que combina tres elementos poco habituales en un mismo artefacto: cuantización NVFP4 de precisión mixta (con capas seleccionadas en FP8 y otras mantenidas en alta precisión), capacidades multimodales con torre de visión, y un proceso de abliteración que preserva el razonamiento pero elimina las negativas de seguridad. Según la model card, la fidelidad frente al modelo BF16 original se mantiene prácticamente intacta: MMLU-Pro pasa de 66,1% a 65,4% (diferencia no significativa, McNemar p=0,37), y el comportamiento de rechazo es equivalente.

El modelo está pensado para despliegue en producción con vLLM, con un requisito específico de configuración (`--max-num-seqs 128`) derivado de que la caché híbrida GDN es más pequeña que el valor por defecto de vLLM. No se han publicado resultados de benchmarks más allá de MMLU-Pro en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (GDN) y atención completa, multimodal (image-text-to-text), basado en Qwen3.5 |
| Parametros totales | 20.294.595.312 (20,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 de precisión mixta: FP8 dinámico en proyecciones de atención, qkv/z/out de atención lineal, lm_head y capas MLP 56-63; NVFP4 en el resto de MLPs; torre de visión, proyecciones auxiliares GDN y MTP en alta precisión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia Qwen3.5 que combina mecanismos de atención lineal (denominados GDN en la model card) con atención completa, e incorpora una torre de visión para el procesamiento de imágenes. La cuantización NVFP4 sigue la receta de referencia de NVIDIA para el modelo base: se aplica FP8 dinámico a las proyecciones de atención, a las proyecciones qkv/z/out de la atención lineal, al lm_head y a las capas MLP 56-63, mientras que el resto de capas MLP se cuantizan a NVFP4. La torre de visión, las proyecciones auxiliares GDN y el módulo MTP (multi-token prediction) se mantienen en alta precisión mediante una lista de exclusión de referencia.

El proceso de calibración se realizó sobre 64 prompts benignos. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La variante "abliterated" del modelo base implica la eliminación de las direcciones de activación asociadas al rechazo, un procedimiento que no se detalla en la información proporcionada. La model card indica que el comportamiento de rechazo medido es idéntico al del BF16 abliterado: 1,8% vs 2,4% en modo thinking-OFF (atribuido a ruido de un solo prompt) y 3,6% en thinking-ON, con rechazos ante daño claro preservados.

## Capacidades

- Generación de texto y razonamiento explícito con modo thinking (parser `qwen3` en vLLM).
- Procesamiento multimodal image-text-to-text: entrada de imágenes junto con texto.
- Razonamiento multi-step y cadenas de pensamiento extendidas.
- Capacidades de código y matemáticas (implícitas en la familia Qwen3.5, aunque no se detallan métricas específicas en la información disponible).
- Soporte de tool calling / function calling: no confirmado explícitamente en la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "uncensored" / abliterated: ausencia de mecanismos de rechazo en la mayoría de consultas, preservando negativas ante daño claro.
- Módulo MTP (multi-token prediction) mantenido en alta precisión, lo que habilita decodificación especulativa.
- Compatible con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Despliegue de asistentes conversacionales multimodales en producción: el modelo acepta imágenes y texto, y puede servirse con vLLM usando `--max-num-seqs 128` para aprovechar la caché híbrida GDN. Adecuado para aplicaciones donde se requiere analizar capturas, diagramas o documentos escaneados junto con instrucciones textuales.
- Razonamiento con trazas explícitas en entornos de investigación: el modo thinking permite auditar el proceso de razonamiento del modelo, útil para estudiar comportamiento de modelos abliterated y comparar fidelidad tras cuantización.
- Evaluación de cuantización NVFP4 en hardware NVIDIA: el modelo sirve como caso de estudio de la receta de referencia de NVIDIA, con métricas publicadas de fidelidad (MMLU-Pro 65,4% vs 66,1% BF16) que permiten validar pipelines de compresión.
- Generación de contenido sin restricciones de rechazo en dominios creativos o de ficción: la abliteración elimina negativas en consultas benignas que el modelo original podría rechazar por precaución excesiva, manteniendo rechazos ante daño claro.
- Investigación en seguridad y alineación: permite estudiar qué comportamientos persisten tras eliminar direcciones de rechazo, con la ventaja de que el razonamiento (thinking-ON) se preserva y puede inspeccionarse.
- Procesamiento de documentos con componentes visuales en pipelines internos: al estar bajo Apache 2.0 y en formato compressed-tensors, puede integrarse en infraestructura propia con vLLM sin dependencias de API externas.
- Benchmarking de eficiencia de memoria: al ocupar 23,4 GB en disco con 20,3 mil millones de parámetros, es útil para medir el ahorro de VRAM frente a la versión BF16 en GPUs con memoria limitada.

## Benchmarks y rendimiento

| Benchmark | NVFP4 (este modelo) | BF16 abliterated | Diferencia |
|---|---|---|---|
| MMLU-Pro | 65,4% | 66,1% | -0,7 pt (McNemar p=0,37, no significativa) |
| Rechazo thinking-OFF | 1,8% | 2,4% | -0,6 pt (ruido de un solo prompt) |
| Rechazo thinking-ON | 3,6% | no disponible | rechazos ante daño claro preservados |

La model card indica además una pérdida acumulada de -1,0 pt frente al modelo base, descrita como coste típico de una cuantización mixta de 4 bits. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMMU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 23,4 GB en safetensors; se requiere al menos esa cantidad de VRAM más overhead de caché KV y activaciones. Con `--max-num-seqs 128` la caché híbrida GDN es más pequeña que la de un transformer estándar, lo que reduce el overhead frente a modelos de tamaño similar.
- GPU recomendadas: GPUs NVIDIA con soporte de NVFP4 (arquitecturas Blackwell y posteriores para aprovechar el formato nativo). Para FP8 dinámico se requiere al menos Ada Lovelace o Hopper.
- ¿Cabe en consumer GPU? No disponible de forma confirmada. Los 23,4 GB de pesos exceden los 24 GB de una RTX 4090 en el límite, por lo que el despliegue en consumer GPU requeriría GPUs con más memoria o técnicas adicionales de offloading no documentadas.
- Opciones de despliegue: vLLM es la opción documentada explícitamente (`vllm serve ... --max-num-seqs 128 --reasoning-parser qwen3`). El formato compressed-tensors es compatible con el ecosistema transformers. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-Abliterated-NVFP4 (este) | 20,3 mil M | no disponible | 65,4% | Apache 2.0 | safetensors NVFP4/FP8 |
| Qwen3.8-27B-Abliterated (BF16) | no disponible | no disponible | 66,1% | Apache 2.0 | safetensors BF16 |
| Modelos Qwen3.5 de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base BF16 del que deriva esta cuantización. No se dispone de datos de benchmarks ni especificaciones de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo en la mayoría de consultas; aunque la model card afirma que se preservan negativas ante daño claro, el comportamiento de seguridad es menos predecible que en el modelo original y requiere evaluación propia antes de uso en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cuantización NVFP4 puede introducir degradación adicional no capturada por MMLU-Pro (la model card solo reporta ese benchmark).
- La pérdida de -1,0 pt acumulada frente al modelo base es descrita como coste típico de 4 bits, pero no se detalla en qué tareas se concentra.
- Longitud de contexto no documentada en la información disponible; no se puede garantizar el comportamiento en ventanas largas.
- Idiomas soportados no documentados; no se puede confirmar cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo hereda la licencia del base y el usuario debe verificar las obligaciones de atribución.
- Requisito específico de `--max-num-seqs 128` en vLLM: usar el valor por defecto puede provocar fallos por tamaño de caché híbrida GDN.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- No se detalla el procedimiento de abliteración ni las direcciones eliminadas, lo que dificulta reproducir o auditar el proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Helmcode/Qwen3.8-27B-Abliterated-NVFP4
- Modelo base (BF16 abliterated): https://huggingface.co/Helmcode/Qwen3.8-27B-Abliterated
