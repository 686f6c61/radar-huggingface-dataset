# mrysh/gemma-4-e4b-it-prune_24

## Resumen

`mrysh/gemma-4-e4b-it-prune_24` es una versión podada de `google/gemma-4-E4B-it`, publicada por el usuario mrysh como artefacto de un benchmark de poda. El modelo aplica una esparsidad semi-estructurada 2:4 sobre las capas lineales del decodificador: dos ceros en cada cuatro pesos consecutivos, es decir, un 50 % de pesos a cero. La poda se realizó con NVIDIA ModelOpt 0.46.0rc1 (SparseGPT) sobre un conjunto de calibración de 512 muestras mixtas. No se aplicó destilación ni fine-tuning posterior, por lo que la degradación de calidad respecto al modelo base es esperable y es precisamente lo que el benchmark pretende medir.

El modelo conserva la arquitectura y el tamaño del base: 7.941.100.874 parámetros totales según los pesos en safetensors, con un repositorio de 15,9 GB. Al tratarse de una poda con almacenamiento denso (los ceros se guardan como ceros), no hay reducción de tamaño en disco ni de VRAM en inferencia densa; la ganancia de velocidad solo se materializa con un runtime que explote la esparsidad 2:4, que según el autor no se utilizó en la evaluación.

La relevancia de esta ficha es acotada: no es un modelo para producción, sino una variante de referencia para estudiar el impacto de la poda semi-estructurada en tareas de tool calling (BFCL), sesgo de contratación y MedQA, comparada con cuantización. Se distribuye bajo licencia Apache 2.0, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-4-E4B-it); capas lineales con esparsidad 2:4 |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors densos; compatible con cuantización estándar no documentada) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it` y mantiene su arquitectura transformer decoder-only. La modificación consiste en una poda semi-estructurada 2:4 aplicada a las capas lineales del decodificador mediante SparseGPT de NVIDIA ModelOpt 0.46.0rc1, con un conjunto de calibración de 512 muestras mixtas. El resultado es un 50 % de pesos a cero en esas capas, almacenados de forma densa.

No hubo destilación, fine-tuning ni recuperación posterior a la poda. El autor indica explícitamente que debe esperarse una caída de calidad frente al modelo base y que el benchmark mide esa caída. La evaluación se realizó con vLLM en modo texto y con el modo thinking desactivado. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre su composición de dataset en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base, con degradación esperada por la poda.
- Tool calling y function calling: evaluado en BFCL dentro del benchmark del autor.
- Razonamiento multi-paso y uso como agente: no documentado específicamente para esta variante.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: el autor indica que se desactiva en la evaluación; no se documenta su comportamiento en esta variante.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Benchmark de poda: usar esta variante como referencia para medir la degradación de calidad de la esparsidad 2:4 frente al modelo base en BFCL, sesgo de contratación y MedQA, replicando la metodología del autor con vLLM.
- Investigación en compresión de modelos: comparar SparseGPT 2:4 con cuantización sobre el mismo modelo base para decidir qué técnica conviene en un despliegue concreto.
- Evaluación de sesgo: emplear el conjunto de hiring-bias del benchmark para estudiar si la poda altera el comportamiento del modelo en decisiones de contratación simuladas.
- Validación de pipelines de tool calling: ejecutar BFCL con vLLM para comprobar si la poda rompe el formato de llamadas a funciones antes de adoptar técnicas de esparsidad en producción.
- Docencia y divulgación: ilustrar en un curso o artículo el efecto real de la poda semi-estructurada cuando no se dispone de un runtime disperso.
- Pruebas de regresión de infraestructura: verificar que un stack de serving (vLLM, contenedores, monitorización) carga correctamente pesos densos con ceros y produce salidas coherentes.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que el benchmark compara las variantes de poda entre sí y con cuantización en BFCL, hiring-bias y MedQA usando vLLM, pero no se incluyen cifras en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 16 GB en BF16 para los 7,94 mil millones de parámetros (2 bytes por parámetro), más overhead de activaciones y caché KV; en la práctica, 20-24 GB para contexto moderado.
- La poda no reduce el uso de VRAM en un runtime denso, porque los ceros se almacenan como ceros.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con contexto ajustado; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: vLLM (usado por el autor), llama.cpp u Ollama si se generan pesos GGUF, TGI. No se documenta compatibilidad específica con runtimes dispersos.
- Latencia y throughput: no disponibles; la ganancia de velocidad de la esparsidad 2:4 requiere un runtime disperso que, según el autor, no se utilizó.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-prune_24 | 7,94 B | no disponible | Apache 2.0 | Poda 2:4 densa, sin fine-tuning posterior |
| google/gemma-4-E4B-it | no disponible en la informacion | no disponible | Apache 2.0 (segun el modelo derivado) | Modelo base sin podar |
| Variantes de cuantizacion del mismo base | no disponible | no disponible | Apache 2.0 | Comparadas en el benchmark del autor |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Degradación de calidad esperada: el autor advierte que no hubo destilación ni fine-tuning tras la poda.
- Sin ganancia de tamaño ni de VRAM en despliegue denso: los ceros se almacenan como ceros.
- La ganancia de velocidad requiere un runtime que explote la esparsidad 2:4, no utilizado en la evaluación.
- Sesgos: el benchmark incluye una prueba de hiring-bias, lo que sugiere interés en evaluar sesgos, pero no se publican resultados.
- Riesgo de alucinación: no cuantificado para esta variante; presumiblemente igual o superior al del modelo base.
- Idiomas y contexto: no documentados en la información disponible.
- Uso comercial: permitido bajo Apache 2.0, pero el autor remite a la model card del modelo base para condiciones adicionales.
- No apto para producción sin una evaluación propia: es un artefacto de benchmark con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/gemma-4-e4b-it-prune_24
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- NVIDIA ModelOpt: no disponible en la información proporcionada
- SparseGPT (paper): no disponible en la información proporcionada
- vLLM: no disponible en la información proporcionada
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la información proporcionada
