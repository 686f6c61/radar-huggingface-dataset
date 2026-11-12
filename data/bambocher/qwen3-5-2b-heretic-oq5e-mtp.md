# bambocher/Qwen3.5-2B-heretic-oQ5e-mtp

## Resumen

Qwen3.5-2B-heretic-oQ5e-mtp es una derivacion del modelo Qwen/Qwen3.5-2B publicada por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una version "decensored" (con las capas de rechazo reducidas mediante la herramienta Heretic v2.0.0) y posteriormente cuantizada con oQ (oMLX v0.7.3) en precision mixta. El checkpoint conserva la cabeza de prediccion multi-token (MTP) intacta y anade un modulo de vision, lo que lo convierte en un modelo multimodal pequeno orientado a ejecucion local.

El modelo tiene 2.274.069.824 parametros totales, de los cuales 1.882B corresponden al modelo de lenguaje, 0.331B al modulo de vision y 0.061B a la cabeza MTP. La cuantizacion resultante ocupa 1.916 GiB con un promedio efectivo de 7.236 bits por peso, combinando affine 5-bit (74,2% de los pesos), affine 6-bit (8,0%), affine 8-bit (2,8%) y BF16 (15,0%). El formato es safetensors para la libreria MLX, lo que lo hace dependiente del ecosistema Apple Silicon.

Su relevancia es doble: por un lado demuestra el flujo de trabajo de cuantizacion mixta con oQ sobre arquitecturas hibridas con MTP y vision; por otro, ilustra el uso de Heretic para eliminar comportamientos de rechazo en modelos pequenos, reportando 0/100 rechazos frente a 97/100 del modelo original, con una divergencia KL de 0.1397. Es un artefacto de investigacion mas que un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con cabeza de prediccion multi-token (MTP) y modulo de vision |
| Parametros totales | 2.274.069.824 (1.882B LM + 0.331B vision + 0.061B MTP) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 5-bit group 64, affine 6-bit group 64, affine 8-bit group 64 y BF16; 7.236 bits/peso efectivos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B, un transformer con una cabeza de prediccion multi-token (MTP) que permite generar varios tokens por paso de decodificacion, y con un modulo de vision de 0.331B de parametros que lo habilita para tareas multimodales. El checkpoint publicado no entrena el modelo desde cero: parte de los pesos de Qwen/Qwen3.5-2B, aplica la ablacion de rango arbitrario (ARA) de Heretic v2.0.0 sobre las capas 12 a 23 con los parametros indicados (preserve_good_behavior_weight 0.9189, steer_bad_behavior_weight 0.0008, overcorrect_relative_weight 0.9924, neighbor_count 14) y despues cuantiza con oMLX v0.7.3.

La innovacion tecnica principal es la cuantizacion mixta por capas y tipos de tensor: el 74,2% de los pesos se almacena en affine 5-bit, el 15,0% se mantiene en BF16 (probablemente capas sensibles como embeddings o la cabeza MTP) y el resto se reparte entre 6-bit y 8-bit. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original. La model card tampoco detalla el mecanismo exacto de decodificacion especulativa asociado a la cabeza MTP.

## Capacidades

- Generacion de texto y razonamiento general, heredadas de Qwen3.5-2B.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0.331B de parametros, por lo que se espera soporte de entrada de imagenes.
- Prediccion multi-token (MTP): la cabeza de 0.061B se conserva intacta, lo que permite decodificacion especulativa y generacion de varios tokens por paso.
- Comportamiento "decensored": la ablacion ARA reduce drasticamente los rechazos (0/100 frente a 97/100 del original), lo que cambia el perfil de respuestas ante prompts sensibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no lista idiomas.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo sirve como caso de estudio reproducible para medir el efecto de Heretic sobre un modelo de 2B, comparando la tasa de rechazos (0/100) y la divergencia KL (0.1397) frente al original.
- Prototipado local en Apple Silicon: al estar en formato MLX y ocupar 1.916 GiB, permite experimentar con un modelo multimodal de 2B en un Mac con memoria unificada sin necesidad de GPU dedicada.
- Evaluacion de cuantizacion mixta: util para comparar la calidad de oQ (7.236 bits/peso efectivos) frente a cuantizaciones uniformes de 4, 5 u 8 bits sobre la misma arquitectura.
- Pruebas de decodificacion especulativa: la cabeza MTP intacta permite medir la aceleracion y la tasa de aceptacion de tokens especulados en pipelines de inferencia MLX.
- Generacion de texto sin filtros para datasets sinteticos: en entornos controlados de investigacion, puede emplearse para producir corpus que el modelo original rechazaria, siempre con revision humana posterior.
- Demostraciones de vision-lenguaje de bajo coste: el modulo visual de 0.331B permite tareas de captioning o VQA simples en hardware de consumo, util para validar prototipos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La unica metrica publicada en la model card es la comparacion de rechazos y divergencia KL frente al modelo original:

| Metrica | Este modelo | Qwen/Qwen3.5-2B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1397 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1.916 GiB solo para los pesos; con overhead de runtime MLX y cache KV, se recomienda un minimo de 4 GB de memoria unificada.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4); no es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con al menos 8 GB de memoria unificada; en el ecosistema NVIDIA requeriria conversion previa a otro formato (no disponible en el repo).
- Opciones de despliegue: MLX (libreria nativa) y oMLX; no se proporcionan pesos GGUF, por lo que llama.cpp u Ollama no son utilizables directamente sin conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-oQ5e-mtp (este) | 2.274B | no disponible | Si (0.331B) | no disponible | safetensors MLX |
| Qwen/Qwen3.5-2B (original) | ~2B | no disponible | Si (segun checkpoint) | no disponible | safetensors |
| Otros modelos de ~2B con vision | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "decensored": la ablacion ARA elimina practicamente todos los rechazos (0/100), lo que implica un riesgo elevado de generar contenido inapropiado, ofensivo o danino sin filtros. No es apto para aplicaciones orientadas al publico sin capas de moderacion adicionales.
- La divergencia KL de 0.1397 respecto al original indica un cambio medible en la distribucion de salida; puede degradar capacidades no relacionadas con el rechazo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia de Qwen/Qwen3.5-2B y las condiciones de Heretic y oQ antes de cualquier despliegue.
- Riesgo de alucinacion: inherente a un modelo de 2B; la cuantizacion mixta puede agravarlo en capas cuantizadas a 5 bits.
- Dependencia de MLX: el checkpoint solo es utilizable en el ecosistema Apple; no hay pesos GGUF ni safetensors estandar para PyTorch.
- Sin datos de contexto, idiomas ni benchmarks: no se puede garantizar el comportamiento en tareas de contexto largo o multilingues.
- Artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ5e-mtp
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
