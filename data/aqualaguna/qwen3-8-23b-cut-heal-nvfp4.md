# aqualaguna/Qwen3.8-23B-Cut-Heal-NVFP4

## Resumen

Qwen3.8-23B-Cut-Heal-NVFP4 es una comprobación cuantizada a NVFP4 (4 bits) del modelo aqualaguna/Qwen3.8-23B-Cut-Heal, publicado por el usuario aqualaguna en Hugging Face. Se trata de una variante "podada" del Qwen3.8-27B en la que las capas FFN se han estrechado hasta dejar 23,2 mil millones de parámetros, y sobre la que se ha fusionado de vuelta un adaptador de destilación. El modelo base es de tipo multimodal image-text-to-text, con arquitectura qwen3_5 y licencia Apache 2.0.

La relevancia de esta ficha es doble. Por un lado, demuestra un flujo de cuantización agresiva (NVFP4 para las capas de texto, FP8 para la cabeza de salida y el bloque MTP, INT8 para los embeddings) orientado a exprimir una única GPU consumer de 32 GB, la RTX 5090. Por otro, el propio autor advierte en la model card de que el podado "no alcanzó su propio aprobado" y de que el Qwen3.8-27B sin podar también cabe en una tarjeta de 32 GB, lo que convierte a este checkpoint en un experimento de ingeniería más que en una recomendación de producción.

El modelo se distribuye como checkpoint de compressed-tensors de 15,30 GB en 5 shards, con decodificación especulativa MTP y soporte de vLLM 0.33.0 previo parche. No hay datos publicados sobre idiomas soportados ni sobre evaluación de precisión de esta versión de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal qwen3_5 (64 bloques de texto con atención y linear attention, torre de visión, bloque MTP para decodificación especulativa) |
| Parametros totales | 23.691.981.552 (23,2B en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (max-model-len configurado en vLLM) |
| Tipos de cuantizacion | NVFP4 W4A4 (capas lineales de texto), FP8 W8A8 (lm_head y bloque MTP), INT8 weight-only (embed_tokens), BF16 (torre de visión, proyecciones a/b de linear attention, norms); también ejecutable como W4A16 con kernel Marlin |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 5 shards, 15,30 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal con torre de visión y 64 bloques de texto que combinan atención estándar y linear attention. La variante Cut-Heal reduce el ancho de las capas FFN hasta los 23,2B de parámetros y vuelve a fusionar un adaptador de destilación, presumiblemente para recuperar parte de la calidad perdida en el podado. Sobre esa base se aplica la cuantización NVFP4: pesos E2M1 con escala FP8 E4M3 por cada 16 valores y escala global FP32 por tensor, y activaciones también NVFP4 con escalas globales estáticas calibradas offline. Las proyecciones fusionadas (q/k/v, gate/up, qkv/z de linear attention) comparten una única escala global para que vLLM las cargue sin reescalado.

La innovación técnica más destacable es la mezcla de precisiones por componente: la cabeza de salida y el bloque MTP pasan a FP8 W8A8 (pesos por canal, activaciones dinámicas por token), el embedding de tokens a INT8 weight-only (simétrico, escala por fila, pack-quantized) y el resto de la torre de visión y las norms se mantienen en BF16. Esa combinación reduce el checkpoint de 18,2 GB a 15,30 GB. El bloque MTP (mtp.fc y las proyecciones q/k/v/o/gate/up/down de mtp.layers.*) permite decodificación especulativa con 3 tokens de borrador. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat y parser de razonamiento qwen3 en vLLM.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias a la torre de visión conservada en BF16.
- Razonamiento con modo de esfuerzo configurable; el autor recomienda `low` para este build.
- Decodificación especulativa mediante bloque MTP con 3 tokens de borrador y una tasa de aceptación del 84,5% medida en la revisión anterior.
- Soporte de contexto largo de hasta 262.144 tokens con caché KV en FP8.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue en vLLM.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Chat conversacional de baja latencia en una única RTX 5090: con kernel Marlin y MTP de 3 tokens, el modelo decodifica a unos 218 tok/s, suficiente para asistentes interactivos con varios usuarios concurrentes y 362.968 tokens de caché KV disponibles a longitud máxima.
- Procesamiento de documentos largos y trabajo por lotes: el kernel nativo W4A4 sobre los tensor cores FP4 de Blackwell lee prompts entre 1,6 y 3,5 veces más rápido que Marlin, lo que lo hace adecuado para resumir o extraer información de documentos extensos de hasta 262.144 tokens.
- Análisis de imágenes con descripción textual: la torre de visión en BF16 permite tareas de image-text-to-text como captioning, respuesta a preguntas visuales o extracción de datos de capturas y formularios.
- Experimentación e investigación en cuantización: el checkpoint sirve como banco de pruebas reproducible de un pipeline NVFP4 + FP8 + INT8 con compressed-tensors, útil para estudiar el impacto del podado y de la mezcla de precisiones en la calidad.
- Despliegue en entornos con restricciones de memoria: los 15,30 GB del checkpoint dejan margen en tarjetas de 24-32 GB para caché KV y overhead del runtime, algo que el modelo sin cuantizar no permite.
- Prototipado de agentes con razonamiento: el parser de razonamiento qwen3 y el modo de esfuerzo `low` permiten cadenas de razonamiento cortas y controladas, aunque la ausencia de datos sobre tool calling limita su uso en pipelines de herramientas sin validación previa.
- Servicio de inferencia con vLLM en producción interna: la integración con vLLM 0.33.0, el soporte de endpoints y la caché KV en FP8 facilitan el despliegue, siempre que se acepte el parche necesario para el embedding INT8 o se use la revisión anterior.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de rendimiento de inferencia en una RTX 5090 de 32 GB con vLLM 0.33, WSL2, kernel Marlin, MTP de 3 tokens, caché KV FP8, longitud máxima 262.144 y decodificación greedy. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Build | Tamano | Tokens de cache KV | Decodificacion chat (tok/s) | Aceptacion MTP |
|---|---:|---:|---:|---:|
| Revision anterior (cabeza, embedding y MTP en BF16) | 18,2 GB | No medido en esta prueba | 180,4 | 84,5% |
| Build e8m8 (cabeza FP8, embedding INT8, MTP FP8) | 15,30 GB | 362.968 | 218 | No disponible |

El autor indica además que, frente al 27B sin podar en NVFP4 sobre la misma RTX 5090, el podado aporta aproximadamente un 15-20% más de velocidad de decodificación y un 25% más de caché KV, pero no acelera la lectura de prompts largos, dominada por la atención, que no se ha modificado. La precisión de esta versión de 4 bits no ha sido evaluada: solo se ejecutaron respuestas de sanidad y comprobaciones de deriva frente a otros builds.

## Requisitos de hardware

- VRAM estimada para inferencia: 15,30 GB de pesos en NVFP4; con caché KV FP8 y longitud máxima de 262.144 tokens, el autor reporta 362.968 tokens de caché disponibles con `--gpu-memory-utilization 0.94` en una RTX 5090 de 32 GB.
- GPU recomendadas: RTX 5090 (32 GB, tensor cores FP4 nativos) es el objetivo declarado; el kernel Marlin permite ejecutar como W4A16 en GPUs sin soporte FP4 nativo, aunque no se detallan modelos concretos.
- Cabe en GPU consumer: sí, en RTX 5090 de 32 GB; el propio autor señala que el Qwen3.8-27B sin podar también cabe en 32 GB, lo que reduce el incentivo del podado.
- Opciones de despliegue: vLLM 0.33.0 con `--linear-backend marlin` (decodificación rápida) o sin él (lectura de prompts rápida con W4A4 nativo); requiere `--trust-remote-code` y, para el build e8m8, el parche `vllm_patch_embed.py`. La revisión anterior (18,2 GB, commit 806d8306ea57592f4210265577de13afd3813b16) funciona en vLLM stock.
- Latencia y throughput: 218 tok/s de decodificación de chat con MTP de 3 tokens y kernel Marlin en RTX 5090; 180,4 tok/s en la revisión anterior sin las mejoras de precisión mixta. La lectura de prompts es de 1,6 a 3,5 veces más rápida con el kernel W4A4 nativo, según mediciones de la revisión anterior sin drafting.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-23B-Cut-Heal-NVFP4 (este) | 23,2B | 262.144 | NVFP4 + FP8 + INT8 | Apache 2.0 | Hugging Face, vLLM 0.33 con parche |
| Qwen3.8-23B-Cut-Heal (base) | 23,2B | No disponible | BF16 (presumiblemente) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B sin podar en NVFP4 | 27B (aprox.) | No disponible | NVFP4 | No disponible | Referenciado en la model card |
| Qwen3.8-27B (original) | 27B (aprox.) | No disponible | BF16 | No disponible | Referenciado en la model card |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes. La comparación disponible se limita a tamaño, contexto, licencia y rendimiento de inferencia en RTX 5090.

## Limitaciones y advertencias

- El propio autor advierte de que el podado "no alcanzó su propio aprobado" y de que el 27B sin podar también cabe en una tarjeta de 32 GB, por lo que la ventaja práctica del recorte es limitada.
- La precisión de esta versión de 4 bits no ha sido evaluada: solo se hicieron respuestas de sanidad y comprobaciones de deriva frente a otros builds, sin benchmarks de calidad.
- El podado no acelera la lectura de prompts largos, ya que la atención no se ha modificado; solo mejora decodificación y capacidad de caché KV.
- El build e8m8 requiere un parche manual de vLLM (`vllm_patch_embed.py`) para cargar el embedding INT8; sin parche, hay que usar la revisión anterior.
- vLLM elige un único kernel por ejecución: o Marlin (decodificación rápida) o W4A4 nativo (lectura de prompts rápida), no ambos.
- No hay información sobre sesgos conocidos, riesgo de alucinación específico, idiomas soportados ni restricciones adicionales de la licencia Apache 2.0 más allá de las estándar.
- El modelo se publicó el 14 de noviembre de 2026 y no registra descargas ni likes, por lo que carece de validación comunitaria.
- El tag `trust-remote-code` es necesario en vLLM, lo que implica ejecutar código del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aqualaguna/Qwen3.8-23B-Cut-Heal-NVFP4
- Modelo base: https://huggingface.co/aqualaguna/Qwen3.8-23B-Cut-Heal
- Parche de vLLM para el embedding INT8: https://huggingface.co/aqualaguna/Qwen3.8-23B-Cut-Heal-NVFP4/resolve/main/vllm_patch_embed.py
- Revisión anterior en vLLM stock (commit): https://huggingface.co/aqualaguna/Qwen3.8-23B-Cut-Heal-NVFP4/tree/806d8306ea57592f4210265577de13afd3813b16
- Papers, blogs, repos o demos adicionales: no disponible en la información proporcionada.
