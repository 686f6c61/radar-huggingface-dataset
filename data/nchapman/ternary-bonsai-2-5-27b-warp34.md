# nchapman/Ternary-Bonsai-2.5-27B-warp34

## Resumen

Ternary-Bonsai-2.5-27B-warp34 es una conversión cuantizada de precisión extrema del modelo prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit, publicado por el usuario nchapman. Se trata de un modelo vision-language derivado de la familia Qwen3_5 (clase `Qwen3_5ForConditionalGeneration`), con una arquitectura híbrida que combina capas GatedDeltaNet con capas de atención completa, y un tronco de 64 capas. El autor lo describe como un modelo denso de 27B, aunque el recuento real de parámetros almacenados en safetensors es de aproximadamente 11.880 millones.

La aportación principal de esta ficha es la cuantización ternaria de 5 trits (`PTQ1_0`, `1.75 bpw`, `group_size=128`), que reduce el peso total a 6,43 GB (5,99 GiB) distribuidos en dos shards de safetensors. El autor declara paridad bit-exacta con la fuente W2A16 en las 402/402 tensores ternarios, y complementa el tronco con una torre de visión cuantizada en `W4A16-HGPTQ` y una cabeza draft MTP nativa para decodificación especulativa.

Es relevante porque demuestra que es posible comprimir un modelo multimodal de 27B por debajo de 6 GiB manteniendo (según el autor) equivalencia bit a bit con el cuantizado de referencia, lo que abre la puerta a despliegues en hardware de consumo. El formato es propietario (`warp34`) y requiere kernels y rutinas de descompresión específicas, por lo que no es un modelo listo para usar con herramientas estándar sin trabajo de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: GatedDeltaNet + atención completa, con torre de visión y cabeza MTP (clase `Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 11.879.936.752 (según safetensors); el autor lo denomina "27B denso" |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria 5-trit `PTQ1_0` (1,75 bpw, group_size=128) en el tronco; `W4A16-HGPTQ` en la torre de visión; `W2` en `embed_tokens` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, 6,43 GB / 5,99 GiB en total), con metadatos de cuantización en `config.json` |

## Arquitectura y entrenamiento

El modelo es una conversión post-entrenamiento (PTQ) del checkpoint prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit, no un modelo entrenado desde cero. La arquitectura subyacente es un transformer híbrido de 64 capas que alterna capas GatedDeltaNet (atención lineal con estado recurrente) y capas de atención completa, e incorpora una torre de visión para entrada image-text-to-text. Sobre esta base, el autor aplica una cuantización ternaria de 5 trits con empaquetado de 26 bytes más 2 bytes de escala FP16 por cada 128 pesos, lo que da 1,75 bits por peso. La torre de visión se cuantiza aparte con `W4A16-HGPTQ` y se añade una cabeza draft MTP nativa para decodificación especulativa.

El esquema de compresión utiliza una transformada de Hadamard (`H_1024`, normalizada por 1/32) con signos pre-plegados, aplicada de forma distinta según el tensor: transformación directa en lineales del tronco y `lm_head`, pre-multiplicación por signos en las proyecciones de salida (`o_proj`, `out_proj`, con K=6144) y post-multiplicación en `embed_tokens`. El autor declara paridad bit-exacta con el W2A16 de origen en los 402 tensores ternarios, conservando las escalas FP16 nativas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3_5.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con torre de visión cuantizada en W4A16.
- Decodificación especulativa mediante cabeza draft MTP nativa, orientada a reducir latencia de generación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un VLM de gran tamaño en hardware de consumo: con 5,99 GiB en total, el modelo cabe en GPUs con 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060) siempre que se implementen los kernels de descompresión `warp34`, lo que permite prototipar tareas image-text-to-text en estaciones de trabajo modestas.
- Investigación en cuantización extrema: el esquema de 5 trits con empaquetado de 26 bytes y decodificación base-3 sin ramas sirve como banco de pruebas para estudiar el impacto de 1,75 bpw en calidad y para validar rutinas de desempaquetado bit-exactas.
- Evaluación de paridad numérica: la verificación 402/402 tensores frente a W2A16 permite usar el modelo como referencia para comprobar implementaciones de kernels ternarios en CUDA, Metal o CPU.
- Generación de descripciones de imagen en pipelines offline: la combinación de torre de visión y tronco de 64 capas permite captioning y VQA en entornos con recursos limitados, siempre que se acepte la sobrecarga de descompresión en carga.
- Prototipado de asistentes multimodales en local: útil para desarrolladores que quieran experimentar con un VLM conversacional sin depender de APIs en la nube, asumiendo el trabajo de integración del formato `warp34`.
- Benchmarking de decodificación especulativa: la cabeza MTP nativa permite medir ganancias de throughput frente a decodificación autoregresiva estándar en un modelo ya comprimido, un escenario poco explorado en la literatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,5 GB para los pesos en el formato actual (5,99 GiB) más overhead de activaciones, caché KV y buffers de descompresión; se recomienda prever al menos 8-10 GB para contexto moderado.
- GPU recomendadas: RTX 3060 Ti / 4060 / 4070 (8-12 GB) para inferencia básica; RTX 4090 (24 GB) o A100/H100 para mayor contexto y throughput.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más, sujeto a la disponibilidad de kernels `warp34`.
- Opciones de despliegue: el autor menciona compatibilidad con `transformers` y `compressed-tensors`, pero el formato `warp34` requiere kernels propios; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La nota sobre repack en Ampere CUDA (`ld.global.v4.u32` de 128 bits) sugiere que el rendimiento depende críticamente de la implementación del kernel de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-warp34 | 11,88B (nominal 27B) | No disponible | Ternaria 5-trit (1,75 bpw) | Apache 2.0 | Hugging Face, formato propietario |
| prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit (base) | 27B (nominal) | No disponible | 2-bit MLX (8,86 GB) | No disponible | Hugging Face, orientado a MLX |
| Qwen3_5 (modelo original de la familia) | No disponible | No disponible | FP16/BF16 | No disponible | No disponible en la información |

La comparativa se limita al linaje directo del modelo, ya que no se dispone de datos de benchmarks ni de especificaciones completas de alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El formato `warp34` es propietario y no estándar: requiere kernels de descompresión específicos y repack en GPUs Ampere para cargas coalesced; no funciona directamente con herramientas estándar como llama.cpp u Ollama.
- La cuantización a 1,75 bpw puede degradar la calidad frente al modelo en FP16/BF16, aunque el autor afirme paridad bit-exacta con el W2A16 de referencia; la paridad es con el cuantizado, no con el modelo original.
- La denominación "27B" no coincide con el recuento real de parámetros en safetensors (11,88B), lo que puede inducir a error al estimar requisitos de cómputo.
- No se documentan idiomas soportados, longitud de contexto ni comportamientos de tool calling, lo que dificulta evaluar su idoneidad en producción multilingüe o agéntica.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un derivado de Qwen3_5, hereda los sesgos del modelo base, no documentados aquí.
- El número de descargas (1) y likes (0) indica que el modelo es muy reciente y prácticamente sin validación comunitaria; conviene tratarlo como experimental.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de soporte de herramientas estándar limita su adopción en producción sin trabajo adicional de integración y validación.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Ternary-Bonsai-2.5-27B-warp34
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit
