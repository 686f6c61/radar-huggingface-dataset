# justinchuby/onnx-genai-example-gemma4-26b-a4b

## Resumen

Este repositorio contiene una exportación ONNX del decoder de texto del modelo `google/gemma-4-26B-A4B-it`, la variante de mezcla de expertos (MoE) de la familia Gemma-4 desarrollada por Google. El export ha sido realizado por Justin Chu (justinchuby) utilizando la herramienta mobius, e incluye metadatos de inferencia canónicos (`inference_metadata.yaml`) validados con el validador Rust de onnx-genai. El objetivo es ofrecer un paquete listo para ejecutar con ONNX Runtime en GPU (CUDA), con pesos reales (no aleatorios) y paridad numérica verificada frente a la implementación original de HuggingFace Transformers.

El modelo base es un MoE con 26 mil millones de parámetros totales y 4 mil millones activos por token (A4B), con 128 expertos y selección top-8. Esta exportación en particular utiliza una ruta de despacho MoE no fusionada y vectorizada, debido a una limitación del kernel fusionado de ONNX Runtime que acumula en fp16 y degrada la precisión. El paquete incluye el decoder completo en fp16 (~52 GB), tokenizador, plantilla de chat y políticas de generación, lo que lo hace adecuado para integraciones en producción con ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (sliding window + full attention) |
| Parametros totales | 26B (según denominación del modelo base) |
| Parametros activos | 4B (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx + model.onnx.data) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Gemma-4 26B-A4B-it es un transformer MoE con 30 capas. Cada capa combina un MLP denso (`intermediate_size=2112`) con un bloque MoE de 128 expertos (top-8 por token, `moe_intermediate_size=704`, activación `gelu_pytorch_tanh`), seguido de `post_ff_norm(dense + moe) + residual`. La atención es híbrida: 25 capas usan ventana deslizante de 1024 tokens con 8 cabezas KV de dimensión 256 (GQA 2×), y 5 capas (5, 11, 17, 23, 29) usan atención global con 2 cabezas KV de dimensión 512 (GQA 8×). Hay 16 cabezas de consulta en todas las capas. El router usa RMSNorm sin escala, un factor de escala aprendido, softmax en fp32 y renormalización tras seleccionar top-8. El logit softcap es 30.0 y los embeddings están atados (`tie_word_embeddings=true`).

No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, método de alineación) en la documentación de esta exportación. El export ONNX en sí no modifica los pesos; solo reproduce la arquitectura y los metadatos de inferencia. La exportación utiliza una descomposición MoE no fusionada (batched Einsum + ScatterElements) porque el kernel fusionado `com.microsoft::MoE` de ONNX Runtime acumula en fp16 y produce una caída de coseno a ~0.97 por capa, mientras que la ruta no fusionada alcanza coseno 0.998 frente a una referencia fp32.

## Capacidades

- Generación de texto autoregresiva: el decoder completo permite generar texto token a token con greedy o sampling.
- Conversación multi-turno: incluye `chat_template.jinja` y tokenizador, por lo que puede usarse en aplicaciones de chat.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base Gemma-4 26B-A4B-it, aunque no se han verificado específicamente en esta exportación.
- Soporte de tool calling / function calling: no confirmado en la documentación del export; depende del modelo base.
- Capacidades multilingües: no especificadas en la información disponible.
- Modo de pensamiento (thinking mode): no disponible en esta exportación.

## Casos de uso

- Inferencia en producción con ONNX Runtime: el paquete está diseñado para ejecutarse con `onnxruntime-gpu` 1.29 en CUDA, con metadatos canónicos que permiten integración directa con la API de onnx-genai.
- Despliegue en GPU de alta memoria: con un pico de VRAM de 55.3 GB en fp16, es adecuado para servidores con H200, A100 80GB o similares, donde se puede servir el modelo completo sin cuantización adicional.
- Aplicaciones de chat y asistentes conversacionales: al incluir plantilla de chat y tokenizador, puede integrarse en sistemas de diálogo multi-turno con contexto largo (la ventana de contexto no se especifica, pero el modelo base soporta ventanas amplias).
- Investigación y evaluación de MoE en ONNX: sirve como referencia para estudiar el comportamiento de modelos MoE bajo ONNX Runtime, incluyendo la ruta no fusionada y sus implicaciones de precisión.
- Generación de texto con paridad verificada: la salida greedy es token-idéntica a la de HuggingFace Transformers, lo que facilita migrar pipelines existentes sin cambios en los resultados.
- Desarrollo de herramientas de inferencia: los metadatos y la estructura del grafo pueden usarse para probar optimizaciones, kernels alternativos o nuevas versiones de ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de paridad numérica y rendimiento de inferencia:

| Nivel | Métrica | Resultado |
|---|---|---|
| L4 (logits última posición) | top-1 argmax / coseno | 1.0 / 0.99999 |
| L4 (todas las posiciones) | top-1 argmax / coseno | 0.947 / 0.9996 |
| L5 (greedy, 24 tokens) | coincidencia exacta vs HF | 24/24 |
| Prefill (prompt 19 tokens) | tiempo | 84 ms |
| Decode | velocidad | 12.8 tok/s |
| VRAM pico | — | 55.3 GB |

Estas cifras se obtuvieron en una NVIDIA H200 con onnxruntime-gpu 1.29.

## Requisitos de hardware

- VRAM estimada: ~55.3 GB en fp16 (medido en H200). Se requiere una GPU con al menos 60 GB de memoria para inferencia cómoda.
- GPU recomendadas: NVIDIA H200, A100 80GB, A100 40GB (con margen ajustado), o GPUs con 80 GB o más. No cabe en GPUs de consumo (RTX 4090 tiene 24 GB, RTX 3090 24 GB).
- Opciones de despliegue: onnxruntime-gpu 1.29 con `CUDAExecutionProvider` y `CPUExecutionProvider` como fallback. No se menciona soporte para vLLM, llama.cpp u Ollama en esta exportación.
- Latencia y throughput: prefill 84 ms para 19 tokens, decode 12.8 tok/s en H200. El throughput depende del batch y la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it (original) | 26B | 4B | no disponible | Apache-2.0 | PyTorch / safetensors |
| justinchuby/onnx-genai-example-gemma4-26b-a4b (este) | 26B | 4B | no disponible | Apache-2.0 | ONNX fp16 |
| justinchuby/onnx-genai-example-gemma4-e2b (denso) | 26B (denso) | 26B | no disponible | Apache-2.0 | ONNX fp16 |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento en tareas para comparar con otros MoE como Mixtral 8x7B o Qwen MoE.

## Limitaciones y advertencias

- El kernel MoE fusionado de ONNX Runtime acumula en fp16 y degrada la precisión (coseno ~0.97 por capa); esta exportación usa la ruta no fusionada para mantener fidelidad numérica, lo que puede implicar mayor uso de memoria o menor rendimiento.
- La ventana de contexto no está documentada en esta exportación; se recomienda verificar la del modelo base antes de usarla en producción.
- No se han publicado benchmarks de tareas, por lo que el rendimiento real en razonamiento, código o matemáticas es desconocido.
- El modelo base puede presentar sesgos y alucinaciones típicos de los LLM; no se han realizado evaluaciones de seguridad específicas para este export.
- La licencia Apache-2.0 permite uso comercial, pero se debe cumplir con la atribución correspondiente.
- El paquete está validado solo con onnxruntime-gpu 1.29 y CUDA; otras versiones o backends pueden no funcionar correctamente.
- El tamaño del repositorio (52.4 GB) requiere almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/justinchuby/onnx-genai-example-gemma4-26b-a4b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio GitHub de modelos ONNX GenAI: https://github.com/justinchuby/onnx-genai-models
- Colección de ejemplos de metadatos de inferencia: https://huggingface.co/collections/justinchuby/onnx-genai-inference-metadata-examples
- Perfil de Justin Chu: https://github.com/justinchuby
- Export denso relacionado: https://huggingface.co/justinchuby/onnx-genai-example-gemma4-e2b
