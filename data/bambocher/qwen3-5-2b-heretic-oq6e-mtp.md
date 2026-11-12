# bambocher/Qwen3.5-2B-heretic-oQ6e-mtp

## Resumen

Qwen3.5-2B-heretic-oQ6e-mtp es una variante "decensored" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.5-2B, publicada por el usuario bambocher en Hugging Face. El modelo base pertenece a la familia Qwen3.5 de Alibaba, con una arquitectura multimodal que combina un modelo de lenguaje de aproximadamente 1.880 millones de parametros con un modulo de vision de unos 331 millones, sumando 2.274 millones de parametros totales. La modificacion se ha realizado con la herramienta Heretic v2.0.0 mediante una tecnica de ablacion de rango arbitrario (ARA) aplicada a las capas 12 a 23, cuyo objetivo es eliminar las respuestas de rechazo manteniendo el comportamiento general del modelo.

El checkpoint se distribuye en formato MLX, cuantizado con oQ (oMLX v0.7.3) en precision mixta: un 76,6% de los pesos logicos en affine 6-bit con grupo 64, un 8,4% en affine 8-bit y un 15% restante en BF16. El resultado es un peso medio efectivo de 8,090 bits por parametro y un repositorio de 2,3 GB, lo que lo hace apto para ejecucion en Apple Silicon. Ademas, conserva intacta la cabeza de prediccion multi-token (MTP) del modelo original, un componente pensado para acelerar la decodificacion especulativa.

La relevancia de esta ficha es doble: por un lado, documenta una variante sin censura de un modelo pequeno y multimodal, util para investigacion sobre alineamiento y refusal; por otro, ilustra el ecosistema de cuantizacion MLX para despliegue local. Cabe senalar que el modelo tiene cero descargas y cero likes en el momento de la consulta, y que su model card no proporciona informacion sobre licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + modulo de vision) con cabeza MTP; detalles de atencion no disponibles |
| Parametros totales | 2.274.069.824 (2.274B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 6-bit grupo 64 (1.742B pesos), affine 8-bit grupo 64 (0.191B), BF16 (0.340B); media efectiva 8,090 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |
| Tamano del repositorio | 2,3 GB (2.142 GiB de tensores) |
| Desglose por componente | Lenguaje 1.882B (1,576 GB); vision 0.331B (0,663 GB); cabeza MTP 0.061B (0,061 GB) |
| Fecha de publicacion | 2026-11-12 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5 que integra un tronco de lenguaje de 1.882B parametros y un codificador de vision de 0.331B, mas una cabeza de prediccion multi-token (MTP) de 0.061B. La presencia de MTP sugiere soporte para decodificacion especulativa o entrenamiento con prediccion de varios tokens por paso, aunque la model card no detalla el mecanismo exacto ni los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF/DPO). Toda esa informacion debe consultarse en la ficha del modelo original de Qwen.

La modificacion principal es la eliminacion de rechazos mediante Heretic v2.0.0, que aplica una ablacion de rango arbitrario (ARA) sobre las capas 12 a 23. Los hiperparametros publicados son: start_layer_index 12, end_layer_index 23, preserve_good_behavior_weight 0,9189, steer_bad_behavior_weight 0,0008, overcorrect_relative_weight 0,9924 y neighbor_count 14. Segun la model card, el resultado pasa de 97/100 rechazos en el modelo original a 0/100 en esta variante, con una divergencia KL de 0,1397 respecto al original. Posteriormente, el checkpoint se cuantizo con oMLX v0.7.3 en precision mixta, asignando 6 bits a la mayor parte de los pesos y manteniendo en BF16 una fraccion relevante (cerca del 15%), presumiblemente capas sensibles.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.5-2B.
- Procesamiento de imagenes: el checkpoint incluye un modulo de vision de 0.331B parametros, por lo que conserva capacidad multimodal.
- Prediccion multi-token (MTP): la cabeza MTP se mantiene intacta, lo que habilita tecnicas de decodificacion especulativa para reducir latencia.
- Ausencia de rechazos: el ajuste con Heretic elimina las respuestas de negativa del modelo original (0/100 rechazos en la evaluacion del autor).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y refusal: el modelo permite estudiar como una ablacion ARA sobre las capas 12-23 afecta a la tasa de rechazos (de 97/100 a 0/100) con una divergencia KL de 0,1397, sirviendo como caso controlado para analizar que capas codifican el comportamiento de negativa.
- Despliegue local en Apple Silicon: al estar en formato MLX con 2,3 GB de pesos y media de 8,09 bits, se puede ejecutar en Macs con memoria unificada moderada mediante el runtime MLX, sin necesidad de GPU dedicada.
- Prototipado multimodal en portatil: el modulo de vision integrado permite experimentar con tareas imagen-texto en un equipo de consumo, aunque con la calidad limitada de un modelo de 2B.
- Evaluacion de decodificacion especulativa: la cabeza MTP conservada permite medir la ganancia de throughput de la prediccion multi-token frente a la decodificacion autoregresiva estandar en MLX.
- Generacion de texto sin restricciones para pruebas de robustez: util en entornos de red teaming controlados donde se necesita un modelo que no rechace peticiones, siempre con las salvaguardas externas adecuadas.
- Benchmarking de cuantizacion mixta: el esquema oQ con mezcla 6-bit/8-bit/BF16 permite comparar la perdida de calidad frente al modelo original en tareas de lenguaje y vision, aislando el efecto de cada nivel de precision.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-2B original |
|---|---|---|
| Rechazos (sobre 100) | 0/100 | 97/100 |
| Divergencia KL | 0,1397 | 0 (por definicion) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) ni del modelo base ni de esta variante.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 2,3 GB para los pesos en el esquema de cuantizacion actual, mas overhead de activaciones y cache KV; con contexto largo el consumo puede crecer de forma notable, aunque la longitud de contexto no esta documentada.
- GPU recomendadas: al ser un checkpoint MLX, el entorno natural es Apple Silicon (series M1, M2, M3, M4) con memoria unificada; no esta pensado para CUDA sin conversion previa.
- Cabe en GPU de consumo: si, en equipos Apple con al menos 8 GB de memoria unificada, y potencialmente en GPUs consumer tras reconvertir los pesos a otro formato.
- Opciones de despliegue: runtime MLX y oMLX (herramienta con la que se cuantizo); vLLM, llama.cpp, Ollama o TGI no soportan directamente este formato sin conversion.
- Latencia y throughput: no disponibles; la presencia de la cabeza MTP sugiere mejoras potenciales de velocidad, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-heretic-oQ6e-mtp | 2,274B | no disponible | Si (vision) | no disponible | MLX safetensors, 8,09 bits/peso | Sin rechazos (0/100), cabeza MTP |
| Qwen/Qwen3.5-2B (original) | 2,274B | no disponible | Si (vision) | no disponible | safetensors (BF16) | 97/100 rechazos; referencia de calidad |
| Otras variantes Heretic de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion consultada |

La comparativa se limita al modelo original porque no se han identificado en la informacion proporcionada otras alternativas de 2B con cuantizacion MLX y ablacion de refusal documentadas de forma verificable.

## Limitaciones y advertencias

- Eliminacion deliberada de salvaguardas: el modelo no rechaza practicamente ninguna peticion (0/100), lo que lo hace inadecuado para despliegues orientados al publico sin filtros externos.
- Riesgo de alucinacion: propio de un modelo de 2B parametros; la cuantizacion mixta a 6 bits puede agravar la perdida de fidelidad en tareas factuales.
- Divergencia respecto al original: la KL de 0,1397 indica que el comportamiento se ha alterado de forma medible; no es un simple cambio de estilo.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; debe verificarse en la ficha del modelo base Qwen3.5-2B y en los terminos de Heretic.
- Idiomas no documentados: se desconoce la cobertura linguistica real, especialmente tras la cuantizacion.
- Contexto no documentado: sin longitud de contexto publicada no se puede garantizar el comportamiento en conversaciones largas.
- Formato restringido a MLX: requiere conversion para usarse en ecosistemas CUDA o CPU estandar.
- Madurez baja: cero descargas y cero likes; el checkpoint se actualizo el mismo dia de su publicacion ("re-quantized with oMLX v0.7.3"), por lo que conviene validar su integridad antes de usarlo en produccion.
- Sesgos: no documentados; al derivar de Qwen3.5-2B hereda los sesgos del modelo base, y la ablacion puede alterar el comportamiento en dominios sensibles de forma no prevista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Proyecto Heretic: https://heretic-project.org
