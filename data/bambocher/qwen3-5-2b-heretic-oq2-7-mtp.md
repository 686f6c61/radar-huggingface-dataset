# bambocher/Qwen3.5-2B-heretic-oQ2.7-mtp

## Resumen

Qwen3.5-2B-heretic-oQ2.7-mtp es una version cuantizada y "decensored" del modelo Qwen/Qwen3.5-2B, publicada por el usuario bambocher en Hugging Face. El checkpoint combina tres intervenciones: una ablacion de comportamiento realizada con la herramienta Heretic v2.0.0 (que elimina los rechazos del modelo original), una cuantizacion de precision mixta con oQ (oMLX v0.7.3) orientada a ejecucion en Apple Silicon mediante MLX, y la preservacion de la cabeza de prediccion multi-token (MTP) del modelo base.

El modelo tiene 2.274 millones de parametros totales, de los cuales 1.882 millones corresponden al modelo de lenguaje, 331 millones a la torre de vision y 61 millones a la cabeza MTP. El checkpoint completo ocupa 1.5 GB en disco, con un promedio efectivo de 5.342 bits por peso, lo que lo hace apto para equipos con memoria unificada modesta.

Su relevancia es doble: por un lado demuestra un flujo de cuantizacion mixta agresiva (mezcla de 3, 4, 5, 6 y 8 bits mas BF16 en distintas capas) que conserva el modulo de vision y la cabeza MTP; por otro, es un ejemplo de modificacion de alineamiento via ablacion de rangos arbitrarios (ARA), con metricas declaradas de 0/100 rechazos frente a 97/100 del original y una divergencia KL de 0.1397.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con torre de vision y cabeza MTP; pesos cuantizados con oQ (oMLX v0.7.3) |
| Parametros totales | 2.274.069.824 (1.882B LM + 0.331B vision + 0.061B MTP) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta: affine 3-bit (grupo 128 y 64), 4-bit, 5-bit, 6-bit, 8-bit (grupo 64) y BF16; promedio efectivo 5.342 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal con torre de vision (0.331B parametros) y una cabeza de prediccion multi-token (MTP, 0.061B parametros) que permite decodificacion especulativa nativa. Sobre esa base, el autor aplico Heretic v2.0.0 con ablacion de rangos arbitrarios (ARA) entre las capas 12 y 23, con los parametros `preserve_good_behavior_weight=0.9189`, `steer_bad_behavior_weight=0.0008`, `overcorrect_relative_weight=0.9924` y `neighbor_count=14`. Esta intervencion modifica los pesos internos para suprimir el comportamiento de rechazo sin reentrenamiento adicional.

Posteriormente, el checkpoint se cuantizo con oQ (oMLX v0.7.3) en precision mixta: el 56.3% de los pesos logicos quedan en affine 3-bit grupo 128, el 22.4% en 3-bit grupo 64, y solo el 15.0% se mantiene en BF16 (0.340B pesos, 0.634 GiB). La cabeza MTP se conserva intacta (0.046 GB). No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento en el modelo de lenguaje de 1.882B parametros.
- Procesamiento de vision e imagenes gracias a la torre de vision de 0.331B parametros conservada en el checkpoint.
- Prediccion multi-token (MTP) para decodificacion especulativa, lo que acelera la generacion en MLX.
- Comportamiento "decensored": segun la model card, 0 rechazos en 100 prompts de prueba frente a 97 del modelo original.
- Ejecucion nativa en Apple Silicon via MLX.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en Mac con Apple Silicon: el checkpoint de 1.5 GB y 5.342 bits/peso promedio permite ejecutar un modelo multimodal de 2.274B parametros en equipos con memoria unificada de 8-16 GB usando MLX.
- Investigacion sobre alineamiento y decensoring: util para estudiar el efecto de la ablacion ARA (capas 12-23) sobre la tasa de rechazos, comparando directamente con Qwen/Qwen3.5-2B y su KL de 0.1397.
- Evaluacion de cuantizacion mixta: sirve como caso de estudio de la distribucion de bits por capa de oQ (3-bit grupo 128 dominante, BF16 en el 15% de pesos) y su impacto en calidad frente al modelo original.
- Procesamiento de imagenes en local: la torre de vision conservada permite tareas de descripcion de imagenes o VQA en entornos sin GPU dedicada, siempre que el runtime MLX soporte el modelo.
- Generacion de texto asistida con decodificacion especulativa: la cabeza MTP intacta permite experimentar con tecnicas de aceleracion de inferencia en MLX.
- Entornos de investigacion de seguridad: el modelo permite analizar que tipos de contenido se generan tras eliminar los rechazos, con fines de auditoria o red-teaming controlado.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-2B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1397 | 0 (por definicion) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 1.5 GB en disco; en inferencia, el checkpoint completo requiere aproximadamente esa cifra mas overhead del runtime MLX (estimacion orientativa de 2-3 GB de memoria unificada).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX. No se indica soporte para CUDA.
- Cabe en GPU consumer: si, en cualquier Mac con memoria unificada de 8 GB o superior; no esta pensado para GPUs NVIDIA consumer por el formato MLX.
- Opciones de despliegue: MLX (libreria declarada) y oMLX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-heretic-oQ2.7-mtp | 2.274B | no disponible | no disponible | safetensors (MLX) | Decensored, cuantizacion mixta 5.342 bits/peso, MTP intacto |
| Qwen/Qwen3.5-2B | 2.274B (segun checkpoint derivado) | no disponible | no disponible | safetensors | Modelo base original, 97/100 rechazos |
| Alternativas de 2B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo "decensored" mediante ablacion ARA: elimina los rechazos (0/100), lo que implica que puede generar contenido que el modelo original bloquearia. No es apto para aplicaciones orientadas a usuario final sin filtros externos.
- La divergencia KL de 0.1397 respecto al original indica una desviacion no trivial en la distribucion de salida; puede degradar calidad en tareas generales.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. El modelo base Qwen suele tener licencia propia que conviene verificar antes de cualquier despliegue.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingue.
- Longitud de contexto no disponible: limita la planificacion de casos de uso con documentos largos.
- Cuantizacion agresiva (3-bit en el 78.7% de los pesos logicos): riesgo de perdida de calidad en razonamiento y codigo frente al BF16 original.
- Formato MLX exclusivo: no desplegable en stacks CUDA estandar (vLLM, TGI) sin conversion.
- Sin descargas ni likes: modelo de publicacion reciente (2026-11-12) sin validacion comunitaria.
- Riesgo de alucinacion inherente a modelos de 2B, agravado por la cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ2.7-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
