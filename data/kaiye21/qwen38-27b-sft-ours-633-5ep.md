# kaiye21/qwen38-27b-sft-ours-633-5ep

## Resumen

kaiye21/qwen38-27b-sft-ours-633-5ep es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base Qwen3.8-27B, desarrollado por el usuario kaiye21. El objetivo del entrenamiento es adaptar el modelo base a un dataset propio de trayectorias de chat de ingeniería de software (swe-chat-v5), con esquemas de herramientas, llamadas a herramientas estructuradas y contenido de razonamiento en formato de mensajes OpenAI. Se trata de la ejecución 3 de 4 de una comparativa interna de datasets.

El modelo emplea una arquitectura híbrida con 64 capas que combina GatedDeltaNet con atención completa en un intervalo de 4 (3 capas GDN por cada capa de atención completa), un tamaño oculto de 5120 y un vocabulario de 248.320 tokens. El entrenamiento se realizó con secuencias empaquetadas de 262.144 tokens y un total de 5 épocas sobre aproximadamente 53,5 millones de tokens por época.

La relevancia de esta ficha es limitada pero concreta: se publica únicamente un export intermedio de parada temprana (iteración 150 de 255, aproximadamente época 3) en formato safetensors, con la cabeza MTP del modelo base congelada e incorporada. El repositorio ocupa 54,7 GB y no cuenta con descargas ni valoraciones en el momento de la consulta. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas, 3x GatedDeltaNet + 1x atención completa (intervalo 4), cabeza MTP de 1 capa |
| Parámetros totales | no disponible (modelo base denominado 27B; no se detalla el recuento exacto) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (tamaño de empaquetado en entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | no disponible (los datos de entrenamiento son swe-chat en chino, según la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (export HF en `hf-ep3-iter150/`), más `model-mtp-base.safetensors` con 15 tensores de la cabeza MTP base |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 64 capas que alterna bloques GatedDeltaNet con bloques de atención completa cada 4 capas, con tamaño oculto de 5120 y vocabulario de 248.320 tokens. Incluye una cabeza de predicción multi-token (MTP) de una capa declarada en la configuración (`mtp_num_layers=1`), aunque el entrenamiento se ejecutó sin entrenarla: el intento de incluirla en el grafo con empaquetado a 256K provocó un OOM determinista de aproximadamente 43 GiB de activaciones adicionales. Los tensores MTP presentes en el repositorio son la cabeza base sin modificar, congelada en el momento del export.

El SFT se realizó sobre el modelo base Qwen3.8-27B sin ajustar (convertido de formato HF a Megatron), nunca desde un modelo instruct. El dataset swe-chat-v5 es de construcción propia y contiene 604 trayectorias de entrenamiento y 29 de validación (split ~5 %), con una media de 89,1 turnos por trayectoria (mediana 64,5), una media de ~88K tokens por trayectoria (mediana ~120K, máximo ~273K) y ~53,5 millones de tokens por época. La configuración usa TP=2, CP=4, DP=1, batch global de 4, Adam distribuido con lr 5e-6 a 5e-7 coseno, warmup de 15 iteraciones, clip-grad 3.0, weight decay 0.01, bf16, pérdida por token y estados del optimizador en CPU. Se ejecutaron 5 épocas (255 iteraciones, 51 por época) con validación cada 15 iteraciones, sobre 8 GPU de 139,8 GiB con Megatron-Bridge y Megatron-Core, a ~9,3k tokens/s sostenidos durante ~10,5 horas. La pérdida se calcula solo en turnos del asistente, incluyendo el razonamiento renderizado como `<think>...</think>` y las llamadas a herramientas como bloques `<tool_call>`; las respuestas de herramientas y los turnos de usuario y sistema no se supervisan. El resultado final fue una pérdida de entrenamiento de 0,63 a 0,55-0,63 en la banda de final de época y una pérdida de validación de 0,704 (iteración 195) a 0,714 (iteración 240), con un ligero repunte que motivó el export de parada temprana.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito: el formato de chat entrena el razonamiento dentro de etiquetas `<think>...</think>`.
- Llamada a herramientas estructurada: los datos incluyen esquemas de herramientas y `tool_calls` estructurados en formato de mensajes OpenAI, por lo que el modelo está adaptado a function calling.
- Razonamiento multi-paso y uso de agentes: las trayectorias tienen una media de 89,1 turnos, lo que entrena interacciones largas y encadenadas.
- Ingeniería de software: el dataset swe-chat está orientado a tareas de desarrollo y edición de código en conversaciones multi-turno.
- Contexto largo: el entrenamiento emplea secuencias empaquetadas de 262.144 tokens, adecuado para documentos y conversaciones extensas.
- Decodificación especulativa: la cabeza MTP base congelada permite usarla para decodificación especulativa, con una tasa de aceptación algo menor que una cabeza entrenada conjuntamente.
- Capacidades multilingües: no disponibles como dato verificado; los datos de entrenamiento son swe-chat en chino según la model card.

## Casos de uso

- Asistente de ingeniería de software en conversaciones largas: el modelo puede mantener diálogos de decenas de turnos con contexto de hasta 262.144 tokens, adecuado para sesiones de depuración o refactorización que acumulan mucho historial.
- Integración en pipelines de agentes con herramientas: al estar entrenado con esquemas de herramientas y `tool_calls` estructurados, puede invocar funciones de forma fiable en flujos de automatización de tareas de desarrollo.
- Edición y revisión de código en repositorios grandes: el contexto de 256K permite cargar varios ficheros y el historial de cambios en una sola ventana para tareas de revisión o generación de parches.
- Evaluación de datasets de SFT: al ser la ejecución 3 de 4 de una comparativa interna, sirve como referencia para medir el efecto de distintos datasets sobre el mismo modelo base y la misma receta.
- Decodificación especulativa en producción: la cabeza MTP base incluida permite acelerar la inferencia con vLLM o transformers, aceptando una tasa de aceptación ligeramente inferior a la de una cabeza entrenada.
- Investigación sobre entrenamiento híbrido GDN/atención: la receta documentada (TP=2, CP=4, empaquetado a 256K, Adam con estados en CPU) es reproducible y útil para estudiar el comportamiento de arquitecturas híbridas a contexto largo.
- Base para ajustes posteriores: al ser un SFT sobre el modelo base y no sobre un instruct, puede servir como punto de partida para RLHF o DPO adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento: pérdida de entrenamiento de 0,63 a 0,55-0,63, pérdida de validación de 0,704 (iteración 195) a 0,714 (iteración 240), 0 iteraciones NaN y 0 omitidas, y un rendimiento sostenido de ~9,3k tokens/s durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Para un modelo de ~27B parámetros en bf16 se necesitan aproximadamente 54 GB solo para pesos, lo que exige al menos una GPU de 80 GB o varias GPU con paralelismo tensorial.
- GPU recomendadas: A100 80 GB, H100 80 GB o similares; el entrenamiento se realizó sobre 8 GPU de 139,8 GiB (clase H200 o superior).
- GPU de consumo: no cabe en GPU de consumo de 24 GB en bf16; sería necesaria cuantización a 4 bits (no publicada en el repositorio) para intentar encajar en una RTX 4090, con pérdida de calidad no evaluada.
- Opciones de despliegue: el export `hf-ep3-iter150/` está indicado como listo para vLLM y transformers. No se mencionan GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia; solo se conoce el throughput de entrenamiento (~9,3k tokens/s en 8 GPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kaiye21/qwen38-27b-sft-ours-633-5ep | ~27B (no detallado) | 262.144 (empaquetado) | no disponible | safetensors | SFT de 5 épocas, export de parada temprana en iteración 150 |
| Qwen3.8-27B base | ~27B (no detallado) | no disponible | no disponible | no disponible | Modelo base sin ajustar del que parte este SFT |
| Referencia prod-fixed-v1 (6 épocas, mismo dataset) | ~27B (no detallado) | 262.144 (empaquetado) | no disponible | no disponible | Pérdida final 0,45-0,57; 306 iteraciones, 0 NaN |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio solo contiene un export intermedio de parada temprana (iteración 150 de 255, ~época 3); los pesos finales de 5 épocas no se subieron y permanecen en formato Megatron en la máquina de entrenamiento.
- La pérdida de validación muestra un repunte en la fase final de época (0,704 en la iteración 195 frente a 0,714 en la 240), lo que indica un posible sobreajuste leve; el export recomendado es el de parada temprana.
- La cabeza MTP no fue entrenada y está congelada; su uso para decodificación especulativa tendrá una tasa de aceptación reducida frente a una cabeza entrenada conjuntamente.
- Los datos de entrenamiento son swe-chat en chino según la model card, lo que puede limitar el rendimiento en otros idiomas; no se declaran idiomas soportados.
- No se especifica licencia, por lo que el uso comercial no está autorizado de forma explícita y requiere consulta con el autor.
- No hay información sobre sesgos, riesgo de alucinación ni evaluaciones de seguridad; al ser un SFT sobre el modelo base sin alineamiento posterior (RLHF/DPO), es esperable un comportamiento menos alineado que un modelo instruct.
- El modelo no parte de un instruct, sino del base, por lo que puede requerir un formato de prompt específico (plantilla de chat con `<think>` y `<tool_call>`) para funcionar correctamente.
- El repositorio tiene 0 descargas y 0 valoraciones, sin validación externa de calidad.
- El empaquetado a 256K sin atención entre documentos implica que el modelo no fue entrenado para cruzar información entre documentos distintos dentro de una misma secuencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaiye21/qwen38-27b-sft-ours-633-5ep
- Script de entrenamiento citado en la model card: `megatron-sft/scripts/finetune_qwen38_27b_sft.py` (no se proporciona URL)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
