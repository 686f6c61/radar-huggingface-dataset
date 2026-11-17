# inference-optimization/Qwen3.6-35B-A3B-REAP20

## Resumen

Qwen3.6-35B-A3B-REAP20 es una variante podada estructuralmente del modelo multimodal Qwen/Qwen3.6-35B-A3B, desarrollada por el colectivo inference-optimization. El modelo conserva la arquitectura original de tipo Mixture of Experts (MoE) con torre de visión, pero elimina el 20 % de los expertos de cada una de sus 40 capas MoE mediante la técnica REAP (Router-weighted Expert Activation Pruning). El resultado es un checkpoint con 29.530.359.664 parámetros totales (frente a los 35B nominales del modelo base) que mantiene intactos atención, embeddings, expertos compartidos y torre de visión en BF16.

La relevancia de esta ficha radica en que ejemplifica una estrategia de compresión de modelos MoE de gran tamaño sin reentrenamiento: REAP selecciona los expertos menos relevantes a partir de las normas de activación ponderadas por el router sobre un corpus de calibración multidisciplinar (RazorCal), y el resto de pesos permanece sin tocar. Esto permite desplegar un modelo multimodal de ~29,5B parámetros con una reducción del 20 % en el número de expertos por capa, lo que se traduce en menor huella de memoria y menor coste de inferencia en entornos con vLLM.

El modelo está pensado para casos de uso de inferencia optimizada (serving, despliegue en producción) donde el ahorro de recursos importa más que recuperar el último punto de rendimiento del modelo base. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque no se han publicado resultados de benchmarks ni datos de evaluación que permitan cuantificar la pérdida de calidad respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (qwen3_5_moe) con torre de visión; poda estructural de expertos mediante REAP |
| Parametros totales | 29.530.359.664 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer MoE con 40 capas de mezcla de expertos, 256 expertos por capa y una torre de visión que lo habilita para tareas image-text-to-text. Sobre esa base, el proceso REAP puntúa cada experto con la media ponderada por el router de las normas L2 de sus activaciones de salida sobre los tokens de calibración enrutados hacia él, `S_j = mean(g_j * ||f_j||_2)`, calculada únicamente con pasada forward (sin gradientes ni entrenamiento de recuperación). En cada una de las 40 capas se eliminan los 51 expertos de menor puntuación, conservando 205 de los 256 originales: 8.200 expertos retenidos de 10.240 (80 %). Los routers se recortan para coincidir con el nuevo recuento y los índices de experto se remapean de forma contigua; `config.json` refleja `num_experts: 205`.

La calibración se realizó sobre las 2.048 muestras del corpus RazorCal, un conjunto multidisciplinar del propio autor. La capa MTP (`mtp.layers.0`) no se calibró y queda intacta. Todos los pesos restantes —atención, torre de visión, embeddings y expertos compartidos— se mantienen en BF16 sin modificar. No se documenta ningún proceso de RLHF, DPO ni ajuste fino posterior a la poda, por lo que la alineación del modelo es la heredada del checkpoint base. El pipeline de poda se ejecutó con llmcompressor y los pesos se empaquetan con compressed-tensors, lo que facilita su carga en vLLM.

## Capacidades

- Generación de texto conversacional y razonamiento multirrama, heredados del modelo base Qwen3.6-35B-A3B.
- Procesamiento image-text-to-text: la torre de visión se conserva intacta en BF16, por lo que mantiene la capacidad multimodal del original.
- Soporte de tool calling y function calling, según las capacidades del modelo base (no verificadas de forma independiente en este checkpoint podado).
- Razonamiento multi-paso y uso como agente, sujeto a la degradación que pueda introducir la poda de expertos.
- Capacidades multilingües: no documentadas en la model card de esta variante.
- Modo thinking: no documentado explícitamente para esta variante.
- Inferencia optimizada: compatible con el stack compressed-tensors y vLLM, lo que habilita despliegues con kernels especializados.

## Casos de uso

- Servicio de chat multimodal en producción: el modelo acepta imagen y texto y puede gestionar conversaciones multi-turno; al reducir un 20 % los expertos por capa, el coste de memoria y de cómputo en vLLM baja respecto al base, lo que lo hace adecuado para endpoints con presupuesto ajustado.
- Extracción de información de documentos escaneados: la torre de visión intacta permite procesar facturas, formularios o capturas y devolver campos estructurados vía tool calling, integrándose en pipelines de digitalización.
- Asistente de atención al cliente con contexto visual: útil en sectores como seguros o banca, donde el usuario adjunta fotos de daños o documentos y el modelo debe razonar sobre ellos en una conversación larga.
- Generación de código asistida en IDE: el modelo base soporta tool calling y razonamiento; esta variante podada puede integrarse en flujos de autocompletado o revisión de parches donde el ahorro de VRAM permite desplegarlo en GPUs de gama alta consumer o en nodos con múltiples A100.
- Moderación y análisis de contenido multimodal: clasificación de imágenes y texto combinados en pipelines de confianza y seguridad, aprovechando la ventana de contexto del modelo base (no documentada aquí).
- Prototipado e investigación sobre poda de MoE: el checkpoint sirve como referencia reproducible para estudiar el impacto de REAP al 20 % sobre un modelo multimodal, comparando sus salidas con las del Qwen3.6-35B-A3B original.
- Despliegue en entornos con restricciones de memoria: al eliminar 8.200 expertos y mantener el resto en BF16, el repo ocupa 59,1 GB, lo que permite servirlo en configuraciones de 2×A100 80 GB o 4×RTX 4090 con tensor parallelism, algo más ajustado que el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 59 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 80 GB para un único nodo.
- Cuantización: el autor no publica variantes GGUF, AWQ ni GPTQ; para reducir VRAM habría que cuantizar el checkpoint uno mismo a partir de los safetensors BF16.
- GPU recomendadas: 2×A100 80 GB o 2×H100 80 GB en tensor parallelism para BF16; 4×RTX 4090 24 GB (96 GB agregados) como configuración consumer viable con tensor parallelism.
- ¿Cabe en una consumer GPU? No en una sola: los 59,1 GB del repo superan la VRAM de cualquier RTX 4090/5090 individual en BF16. Sí en configuraciones multi-GPU consumer.
- Opciones de despliegue: vLLM es la ruta documentada (tags `vllm` y `compressed-tensors`); transformers con `Qwen3_5MoeForConditionalGeneration` y `AutoProcessor` para uso directo. No se documenta soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos por capa | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-REAP20 (este) | 29,53B | 205 | no disponible | Apache 2.0 | safetensors BF16 |
| Qwen/Qwen3.6-35B-A3B (base) | 35B nominales | 256 | no disponible | Apache 2.0 | safetensors BF16 |
| Otras variantes REAP de Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa de rendimiento entre este checkpoint y el base no puede establecerse porque el autor no publica evaluaciones. La única diferencia documentada es estructural: 51 expertos menos por capa y 8.200 expertos eliminados en total.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce la degradación real de calidad frente al Qwen3.6-35B-A3B original tras eliminar el 20 % de los expertos.
- La poda por REAP usa solo pasada forward y no incluye entrenamiento de recuperación, por lo que es esperable cierta pérdida en tareas que dependían de los expertos eliminados, especialmente las de nicho.
- La capa MTP no se calibró y queda intacta; su comportamiento en decodificación especulativa no está validado en esta variante.
- La model card no documenta idiomas soportados, longitud de contexto ni parámetros activos, lo que dificulta planificar el despliegue.
- Riesgo de alucinación y sesgos: heredados del modelo base y no reevaluados tras la poda; no hay informe de evaluación de sesgos para este checkpoint.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada por el autor para confirmar compatibilidad.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de su funcionamiento en producción.
- Compatibilidad: requiere transformers con soporte de `Qwen3_5MoeForConditionalGeneration` y, para serving, vLLM con compressed-tensors; no se garantiza funcionamiento en otros runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/inference-optimization/Qwen3.6-35B-A3B-REAP20
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Corpus de calibración RazorCal: https://huggingface.co/datasets/inference-optimization/RazorCal
- Ejemplo de poda REAP en llm-compressor: https://github.com/vllm-project/llm-compressor/tree/main/examples/reap_expert_pruning
- Repositorio llmcompressor: https://github.com/vllm-project/llmcompressor
