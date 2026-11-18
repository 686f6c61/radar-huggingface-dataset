# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP-XS

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP-XS es una cuantización NVFP4 de un modelo de lenguaje de 27.320.697.856 parámetros derivado de la familia Qwen3.6, publicada por el usuario AEON-7 sobre su propio checkpoint BF16 «AEON-Ultimate-Uncensored». El modelo parte de una arquitectura híbrida que combina atención con GatedDeltaNet (SSM tipo Mamba) y ha sido sometida a un proceso de *abliteration* para eliminar los mecanismos de rechazo, además de incorporar una cabeza MTP (*multi-token prediction*) para decodificación especulativa. La variante «Text» elimina la torre de visión del modelo original, por lo que solo procesa texto.

El interés técnico de esta ficha reside en su estrategia de cuantización: las proyecciones matriciales del bloque `linear_attn` se reducen a NVFP4 (aproximadamente 3 GB frente a los 11 GB en BF16), mientras que la convolución 1D `linear_attn.conv1d` y los vectores de estado SSM (`A_log`, `dt_bias`, `norm.weight`) se preservan en BF16 por problemas documentados de estabilidad numérica en la recurrencia de contexto largo. El resultado es un checkpoint de aproximadamente 20 GB en disco y unos 21 GB de VRAM en ejecución, pensado para GPUs Blackwell de 24–32 GB (RTX 5090, RTX PRO 6000) y aceleradores SM_100/SM_120.

La relevancia actual es doble: por un lado, demuestra una receta de cuantización selectiva que evita el colapso de los modelos híbridos SSM al reducir precisión; por otro, la propia model card indica que esta línea ha sido superada por Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED, por lo que se mantiene principalmente por compatibilidad e histórico de descargas (50.511 descargas y 14 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y GatedDeltaNet (SSM tipo Mamba), cabeza MTP para decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (proyecciones `linear_attn`) + BF16 (conv1d, vectores de estado SSM, cabeza MTP); formato ModelOpt |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 19,7 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido que intercala capas de atención con capas GatedDeltaNet, un mecanismo de espacio de estados con recurrencia lineal y convolución 1D, en la línea de las arquitecturas Mamba. La variante XS aplica una cuantización NVFP4 selectiva mediante ModelOpt: las proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_a/b` y `out_proj` del bloque `linear_attn` pasan a FP4, mientras que `linear_attn.conv1d`, los vectores de estado (`A_log`, `dt_bias`, `norm.weight`) y la cabeza `mtp.*` se conservan en BF16. La cabeza MTP se injerta desde el modelo base con verificación de coincidencia bit a bit, según la model card.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO. El proceso de *abliteration* aplicado al checkpoint base BF16 elimina las capas de rechazo, pero la model card no detalla la metodología concreta ni los datos utilizados para ello. La receta de cuantización y el injerto de la cabeza MTP se atribuyen en la propia card al trabajo previo de sakamakismile en su serie Qwen3.6-27B-NVFP4-MTP.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y otros idiomas.
- Razonamiento de varios pasos con modo *thinking* activable y desactivable (la card reporta métricas separadas para ambos modos).
- Decodificación especulativa mediante cabeza MTP injertada, que acelera la generación en despliegues compatibles.
- Procesamiento exclusivamente de texto: la torre de visión ha sido eliminada del checkpoint.
- Comportamiento sin rechazos (*uncensored*), orientado a escenarios donde el modelo base aplicaría negativas.
- Compatibilidad declarada con *endpoints* y con el stack de transformers.

## Casos de uso

- Despliegue en GPU de consumo de gama alta: con ~21 GB de VRAM en ejecución, cabe en una RTX 5090 de 24 GB o en una RTX PRO 6000 de 32 GB, lo que permite servir un modelo de 27B en una sola tarjeta sin *offloading* a CPU.
- Generación de texto creativo sin filtros editoriales: el proceso de *abliteration* permite producir narrativa, guiones o diálogo sin las negativas del modelo base, útil en entornos de escritura profesional controlados.
- Investigación sobre cuantización de arquitecturas híbridas: el checkpoint sirve como referencia reproducible de la receta «proyecciones a NVFP4, conv1d en BF16» para estudiar la degradación de modelos SSM bajo cuantización agresiva.
- Evaluación de decodificación especulativa: la cabeza MTP injertada permite medir el *speedup* frente a decodificación autoregresiva estándar en vLLM con el contenedor `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest`.
- Asistentes conversacionales en chino e inglés: el soporte declarado de ambos idiomas y el modo multilingüe lo hacen apto para prototipos de atención al cliente en esos mercados, siempre con revisión humana por el riesgo de alucinación.
- *Benchmarking* de hardware Blackwell: la card reporta 38,5 tok/s de mediana y 71,3 tok/s de pico en DGX Spark con DFlash y modo *thinking* activo, lo que lo convierte en una carga de referencia para comparar SM_100 y SM_120.

## Benchmarks y rendimiento

La model card no publica resultados de MMLU, HumanEval, GSM8K ni métricas de calidad equivalentes. Solo se reportan cifras de rendimiento de inferencia en DGX Spark con la imagen v3 y DFlash:

| Configuracion | Tokens/s mediana | Tokens/s pico |
|---|---|---|
| Thinking on | 38,5 | 71,3 |
| Thinking off | 38,1 | 68,4 |

La card indica una mejora del +17–26 % frente a la configuración `-NVFP4` original con DFlash antiguo y la imagen v2.1. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada en ejecución: ~21 GB con la cuantización NVFP4 + BF16 selectiva (frente a ~27 GB de la variante regular y ~26 GB en disco de esta).
- GPU recomendadas: RTX 5090 (24 GB), RTX PRO 6000 (32 GB), B100 y B200 (SM_100), y DGX Spark / GB10 para el contenedor unificado.
- Cabe en GPU de consumo: sí, en RTX 5090 de 24 GB; no se garantiza en tarjetas de 16 GB.
- Opciones de despliegue: vLLM con las imágenes `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (Spark/GB10) y `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` (RTX discreta); también es compatible con transformers. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 38,5 tok/s de mediana y 71,3 tok/s de pico en DGX Spark con DFlash y modo *thinking* activo, según la card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP-XS | 27,3B | no disponible | NVFP4 + BF16 selectiva | ~21 GB | Apache 2.0 |
| Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP (regular) | 27,3B | no disponible | NVFP4 + BF16 en proyecciones | ~27 GB | Apache 2.0 |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | no disponible | no disponible | NVFP4 + FP8 mixta | no disponible | no disponible |
| Qwen3.6-27B-NVFP4-MTP (sakamakismile) | 27B | no disponible | NVFP4 + BF16 en conv1d | no disponible | no disponible |

La comparativa se limita a variantes de la misma familia porque la información disponible no incluye modelos de otros desarrolladores con los que confrontar parámetros y rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Modelo *uncensored* y *abliterated*: no aplica negativas de seguridad, por lo que puede generar contenido dañino, ilegal o explícitamente sesgado. No es apto para exposición directa al público sin filtros externos.
- Riesgo de alucinación inherente a un modelo de 27B sin datos de benchmarks de calidad publicados; no hay evidencia en la información disponible sobre su fiabilidad factual.
- La model card indica que esta línea ha sido superada por Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED, con mejor capacidad y una metodología de cuantización mixta NVFP4 + FP8 más refinada. Para nuevos desarrollos se recomienda migrar.
- Sin torre de visión: no procesa imágenes pese a que los tags originales incluyan `image-text-to-text`.
- Longitud de contexto no documentada en la información disponible; la preservación de `conv1d` en BF16 sugiere que la estabilidad en contexto largo es un punto sensible.
- Compatibilidad limitada a hardware Blackwell (SM_100/SM_120) para el formato NVFP4; no se mencionan rutas de despliegue en GPUs Ampere o Ada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros de seguridad traslada al operador toda la responsabilidad legal y ética sobre las salidas.
- El repositorio depende de imágenes Docker propias del autor; no se documenta soporte en el ecosistema estándar (llama.cpp, Ollama, TGI).

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP-XS
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Variante regular NVFP4-MTP: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Text-NVFP4-MTP
- Sucesor recomendado: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Repositorio de despliegue y benchmarks: https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash
- Receta original de cuantización (sakamakismile): https://huggingface.co/sakamakismile/Qwen3.6-27B-Text-NVFP4-MTP
- Contenedor vLLM para Spark/GB10: ghcr.io/aeon-7/aeon-vllm-ultimate:latest
- Contenedor vLLM para RTX: ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest
