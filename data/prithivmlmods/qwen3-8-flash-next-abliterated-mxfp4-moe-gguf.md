# prithivMLmods/Qwen3.8-Flash-Next-abliterated-MXFP4-MoE-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen (Alibaba) y publicado como vista previa arquitectónica experimental de la familia Qwen4. Combina 125.000 millones de parámetros en el núcleo (con 6.000 millones activados por token, repartidos entre 10 expertos enrutados y 1 compartido de un total de 512) con 51.000 millones de parámetros de embeddings n-gram orientados a offload y una cabeza de predicción multi-token (MTP) de 4.000 millones, además de un codificador visual. Esta ficha describe la variante cuantizada y "abliterated" publicada por el usuario prithivMLmods.

La relevancia de esta publicación es doble. Por un lado, el modelo base incorpora innovaciones de arquitectura orientadas a latencia en contexto largo: atención híbrida que intercala Gated DeltaNet con Qwen Sparse Attention (QSA) a nivel de bloque, flujos de residuo con compuertas (Gated Residual) y una ventana de contexto nativa de 262.144 tokens extensible a 1 millón mediante YaRN. Por otro, esta versión concreta aplica una cuantización MXFP4_MOE optimizada para aceleradores NVIDIA Blackwell y un proceso de "abliteration" (eliminación de rechazos) que convierte el modelo en una variante sin censura.

El resultado es un artefacto de 132,7 GB distribuido en formato GGUF, pensado para inferencia local con llama.cpp sobre GPUs Blackwell (RTX 50-series, RTX Pro 6000, B200, B300). Incluye decodificación especulativa nativa mediante MTP, sin necesidad de un modelo borrador separado. Se distribuye bajo licencia Qwen Community 1.0 y solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención híbrida (Gated DeltaNet + Qwen Sparse Attention), Gated Residual y cabeza MTP; codificador visual |
| Parámetros totales | 176.943.899.520 (176,9 B, según safetensors); 125 B de núcleo + 51 B de embeddings n-gram + 4 B de cabeza MTP |
| Parámetros activos | 6 B por token (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1.000.000 con YaRN |
| Tipos de cuantización | MXFP4_MOE (principal), BF16 (MTP y mmproj) |
| Idiomas soportados | Inglés (en) |
| Licencia | Qwen Community 1.0 (license: other) |
| Formato de pesos | GGUF (llama.cpp); MTP en BF16 y proyector multimodal mmproj-bf16 en GGUF |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con 48 capas que intercala dos mecanismos de atención: Gated DeltaNet y Qwen Sparse Attention (QSA) a nivel de bloque. Esta disposición híbrida busca reducir la latencia en contextos largos sin sacrificar capacidad de recuperación de información. Los flujos Gated Residual multi-rama están diseñados para mejorar la estabilidad del entrenamiento en profundidad, y la ventana de contexto nativa de 262.144 tokens puede ampliarse a 1 millón mediante YaRN.

La cabeza de predicción multi-token (MTP) actúa como mecanismo de decodificación especulativa: predice varios tokens futuros en una sola pasada hacia delante y sirve de "drafter" sin requerir un modelo borrador independiente. En este repositorio, los pesos MTP se distribuyen como archivo GGUF BF16 separado (7,77 GB) que se carga junto al modelo principal. El modelo acepta entradas de texto, imagen y vídeo de escala horaria.

No se dispone en la información proporcionada de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. La variante aquí descrita incorpora además un proceso de "abliteration" (etiquetas `abliterated`, `heretic`, `uncensored`, `decensored`) del que no se detalla la metodología exacta.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable mediante `enable_thinking`, `preserve_thinking` y `reasoning_effort`.
- Razonamiento matemático y resolución de problemas aritméticos multi-paso (verificado en el ejemplo de llama.cpp incluido en la model card).
- Codificación agéntica: el modelo base reporta resultados en DeepSWE 1.1 y SWE-bench Pro y Multilingual.
- Capacidades multimodales: entrada de imagen y vídeo de escala horaria mediante el proyector `mmproj-bf16`.
- Uso de ordenador y agentes (AndroidWorld en el modelo base).
- Decodificación especulativa nativa mediante MTP, con aceleración de inferencia local.
- Soporte de contexto largo de hasta 262.144 tokens (1 M con YaRN).
- Variante sin censura ("abliterated"): menor tasa de rechazos ante peticiones que el modelo base declinaría.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.

## Casos de uso

- Inferencia local en estación de trabajo Blackwell: desplegar el GGUF MXFP4_MOE con llama.cpp sobre una RTX 5090 o RTX Pro 6000 aprovecha los Tensor Cores FP4 nativos y la decodificación especulativa MTP para reducir la latencia por token en comparación con cuantizaciones de mayor precisión.
- Análisis de documentos extensos: con 262.144 tokens de contexto nativo, el modelo puede procesar contratos, informes o bases de código completas en una sola pasada sin fragmentación, útil para resumen y extracción de entidades.
- Comprensión de vídeo de larga duración: la entrada de vídeo de escala horaria permite tareas de descripción, indexación o control de calidad sobre grabaciones extensas.
- Investigación sobre alineación y censura: la variante abliterated sirve para estudiar el comportamiento del modelo ante peticiones sensibles y comparar la distribución de rechazos frente al modelo base.
- Asistencia en codificación agéntica: los resultados del modelo base en SWE-bench Pro y Multilingual lo sitúan como candidato para pipelines de reparación automática de código, aunque en esta variante cuantizada conviene validar la degradación.
- Prototipado de agentes de uso de ordenador: el rendimiento reportado en AndroidWorld en el modelo base permite experimentar con automatización de interfaces, siempre que el hardware soporte la cuantización FP4.
- Evaluación de cuantizaciones MXFP4: el repositorio permite medir la pérdida de calidad frente a BF16 en tareas de razonamiento y matemáticas, dado que incluye el mismo modelo en distintas precisiones.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base Qwen3.8-Flash-Next según la model card; no se han publicado mediciones específicas de esta variante cuantizada MXFP4 ni de la versión abliterated.

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE 1.1 | 58,7 |
| SWE-bench Pro | 62,5 |
| SWE-bench Multilingual | 81,0 |
| AndroidWorld | 84,5 |
| GPQA Diamond | 91,7 |
| LiveCodeBench v6 | 91,9 |
| MathVision (con intérprete de código) | 95,7 |

No se han publicado resultados de benchmarks de esta variante cuantizada en la información disponible.

## Requisitos de hardware

- El archivo principal MXFP4_MOE ocupa 124 GB; el MTP BF16, 7,77 GB; el proyector multimodal, 908 MB. El repositorio completo son 132,7 GB.
- VRAM estimada para inferencia: superior a 124 GB solo para los pesos del modelo principal; hay que sumar la caché KV, que con 262.144 tokens de contexto resulta considerable y puede mitigarse con `--cache-type-k q8_0`.
- GPU recomendadas: NVIDIA Blackwell, es decir, RTX Pro 6000, RTX 50-series (RTX 5090), B200 y B300, por el soporte nativo de Tensor Cores FP4 (SM120, GB202).
- No cabe en GPUs de consumo de gama media ni en configuraciones de 24 GB; requiere hardware de gama profesional o de centro de datos, o bien offload a RAM/CPU con penalización severa de latencia.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) con `--spec-type draft-mtp`; el modelo base es compatible con Transformers, vLLM, SGLang y TokenSpeed, aunque esta cuantización GGUF está pensada para llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada; la decodificación especulativa MTP con `--spec-draft-n-max 2` está orientada a reducirla.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 176,9 B totales / 6 B activos | 262.144 (1 M con YaRN) | Qwen Community 1.0 | safetensors | Modelo original, sin cuantizar ni abliterated |
| Esta variante (abliterated MXFP4) | 176,9 B totales / 6 B activos | 262.144 (1 M con YaRN) | Qwen Community 1.0 | GGUF | Cuantización FP4 para Blackwell y eliminación de rechazos |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de información de modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- La cuantización MXFP4 introduce pérdida de precisión frente a BF16; los benchmarks reportados corresponden al modelo base y no a esta variante.
- El proceso de abliteration altera el comportamiento de rechazo del modelo: puede generar contenido que el modelo original declinaría, con implicaciones legales y de seguridad en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo de razonamiento extendido no elimina este riesgo.
- La licencia Qwen Community 1.0 impone condiciones específicas de uso comercial que deben revisarse antes de desplegar el modelo en productos.
- El tamaño de 124 GB limita el despliegue a hardware Blackwell de gama alta; no es viable en GPUs de consumo convencionales.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines agénticos que dependan de APIs externas.
- La información sobre datos de entrenamiento, metodología de abliteration y evaluación de la variante cuantizada es inexistente en la documentación disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-abliterated-MXFP4-MoE-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Archivo MTP BF16: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-abliterated-MXFP4-MoE-GGUF/blob/main/Qwen3.8-Flash-Next-MTP.BF16.gguf
- Archivo principal MXFP4_MOE: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-abliterated-MXFP4-MoE-GGUF/blob/main/Qwen3.8-Flash-Next-abliterated.MXFP4_MOE.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-abliterated-MXFP4-MoE-GGUF/blob/main/Qwen3.8-Flash-Next.mmproj-bf16.gguf
