# ramachandrajoshi/Surogate3.7-35B-A3B-FP8

## Resumen

Surogate3.7-35B-A3B-FP8 es una cuantización en FP8 del modelo Surogate3.7-35B-A3B, un modelo de mezcla de expertos (MoE) de tipo agéntico construido sobre la base de Qwen3.5-35B-A3B, que incorpora una torre de visión y una cabeza MTP (multi-token prediction) para decodificación especulativa. El repositorio lo publica el usuario independiente ramachandrajoshi y no está afiliado a los autores originales; todo el crédito del entrenamiento y los benchmarks corresponde al equipo de surogate.

El problema que resuelve esta variante es puramente operativo: reducir el peso en disco y en memoria del modelo original en bf16 (unos 72 GB) hasta aproximadamente 36 GB, manteniendo intactas las partes sensibles a la precisión (torre de visión, cabeza MTP, routers, embeddings y normas). La cuantización se realiza con el esquema FP8_BLOCK de llm-compressor en formato compressed-tensors, sin conjunto de calibración (data-free), y se ha probado con vLLM 0.34.0.

Es relevante ahora porque permite desplegar un modelo multimodal y agéntico de 35 951 822 704 parámetros totales (activos no disponibles en la información proporcionada, aunque el sufijo A3B sugiere del orden de 3 mil millones) en una sola GPU de 48 GB o más, con licencia Apache 2.0 y soporte nativo de tool calling, razonamiento con modo thinking y decodificación especulativa mediante la cabeza MTP incluida en el propio checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (full-attention y linear-attention), torre de visión y cabeza MTP (familia qwen3_5_moe) |
| Parámetros totales | 35 951 822 704 |
| Parámetros activos | no disponible |
| Longitud de contexto | 131 072 tokens (según el ejemplo de servicio con `--max-model-len 131072`) |
| Tipos de cuantización | FP8 E4M3 con escalas de bloque 128×128 (esquema FP8_BLOCK); activaciones en FP8 dinámico por grupo de 128 en tiempo de ejecución; visión y MTP en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), tensores de expertos en 2-D por experto con `weight_scale` |

## Arquitectura y entrenamiento

El modelo base es un MoE de 40 capas de lenguaje con 256 expertos enrutados por capa, expertos compartidos y una combinación de atención completa y atención lineal. Incluye una torre de visión para entrada image-text-to-text y una cabeza MTP con sus propios 256 expertos, pensada para decodificación especulativa sin modelo borrador separado. Esta variante FP8 cuantiza los pesos de todos los expertos enrutados (gate_proj, up_proj y down_proj), los expertos compartidos y las proyecciones de atención (q/k/v/o en atención completa; in_proj_qkv, in_proj_z y out_proj en atención lineal). Quedan en bf16 la torre de visión, la cabeza MTP, lm_head, embed_tokens, los routers (mlp.gate, shared_expert_gate), in_proj_a, in_proj_b, conv1d y todas las normas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada; esos detalles corresponden a la model card del modelo original. La innovación técnica de este repositorio es la cuantización data-free con llm-compressor 0.15.0 y compressed-tensors 0.20.1 (transformers 5.21), reproducible en unos 6 minutos en una sola GPU, con una lista de exclusión que replica la del release oficial Qwen3.5-35B-A3B-FP8 añadiendo la cabeza MTP en bf16.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking activado por defecto y desactivable mediante `enable_thinking: false`.
- Comprensión de imágenes y vídeo a través de la torre de visión, que se mantiene en bf16 y por tanto no se ve afectada por la cuantización.
- Tool calling y function calling nativos, con parser `qwen3_coder` en vLLM.
- Uso agéntico y razonamiento multi-paso (etiquetas agent, tool-use y reasoning en el repositorio).
- Decodificación especulativa mediante la cabeza MTP integrada, con `num_speculative_tokens: 2` como valor probado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional de atención al cliente: con 131 072 tokens de contexto puede mantener historiales largos y varios documentos de referencia en la misma sesión, y el modo thinking permite respuestas razonadas en consultas complejas.
- Agente con herramientas en producción: el soporte de tool calling con parser `qwen3_coder` y `--enable-auto-tool-choice` permite conectarlo a APIs internas, bases de datos o sistemas de ticketing dentro de un bucle agéntico.
- Análisis de documentos con imágenes: la torre de visión en bf16 permite extraer información de capturas, formularios escaneados o gráficos combinándolos con texto en la misma petición.
- Generación y revisión de código en pipelines de CI/CD: el modelo puede recibir diffs, logs de error e imágenes de trazas y devolver parches o explicaciones, con el MTP acelerando la generación en vLLM.
- Despliegue en una sola GPU de 48 GB: al ocupar unos 36 GB de pesos, cabe en A6000, L40S, H100 o DGX Spark, lo que facilita entornos de inferencia sin clúster multi-GPU.
- Servicio con latencia reducida: la decodificación especulativa MTP con 2 tokens de borrador y la caché KV en FP8 (`--kv-cache-dtype fp8`) reducen el coste por token en cargas interactivas.
- Evaluación y prototipado de modelos agénticos multimodales: su licencia Apache 2.0 y su compatibilidad con la API OpenAI permiten integrarlo en frameworks existentes sin cambiar el código de cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que esta cuantización no se ha vuelto a evaluar con la suite de benchmarks y que solo se ha hecho una prueba de humo (texto, imagen y aceptación de MTP). La tabla de benchmarks del modelo original fue medida en bf16 y no se reproduce aquí.

## Requisitos de hardware

- VRAM estimada: unos 36 GB solo para pesos; se recomienda una GPU con al menos 48 GB para dejar espacio a caché KV y activaciones.
- GPU recomendadas: A6000, L40S, H100 o DGX Spark en configuración de una sola GPU; también es posible usar varias GPU con `--tensor-parallel-size`.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, 3090) con esta cuantización; no se dispone de datos de variantes GGUF de menor precisión.
- Opciones de despliegue: vLLM 0.34.0 (probado); la carga con transformers no se ha probado. No hay confirmación de soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo confirma que la decodificación especulativa MTP funciona, verificable mediante las métricas `spec_decode` del servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Surogate3.7-35B-A3B-FP8 | 35 951 822 704 | 131 072 | FP8 bloque, visión y MTP en bf16 | Apache 2.0 | Hugging Face (comunidad) |
| Surogate3.7-35B-A3B (bf16) | 35 951 822 704 | no disponible | bf16 | Apache 2.0 | Hugging Face (autor original) |
| Qwen3.5-35B-A3B-FP8 | no disponible | no disponible | FP8 | no disponible | Hugging Face (oficial Qwen) |

La comparación con otras alternativas de la misma categoría (por ejemplo, otros MoE multimodales de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se ha vuelto a evaluar con benchmarks: el rendimiento real de esta cuantización FP8 no está medido, solo se ha probado cualitativamente con texto, imagen y aceptación de MTP.
- Solo se ha validado con vLLM 0.34.0; la carga con transformers u otros motores no está probada.
- Es una cuantización comunitaria independiente, sin afiliación ni respaldo de los autores originales.
- Los sesgos conocidos del modelo base no se detallan en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de este tipo.
- Idiomas soportados: no disponibles, por lo que no se puede garantizar un rendimiento adecuado fuera de los idiomas cubiertos por el modelo original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base y de los datos de entrenamiento originales.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens si no se desactiva explícitamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ramachandrajoshi/Surogate3.7-35B-A3B-FP8
- Modelo base original: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- llm-compressor: https://github.com/vllm-project/llm-compressor
