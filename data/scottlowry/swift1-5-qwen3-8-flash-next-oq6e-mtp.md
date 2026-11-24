# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ6e-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ6e-mtp es una cuantizacion mixta de 6 bits del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario scottlowry. El checkpoint conserva 180.000 millones de parametros logicos y ocupa 151,3 GB en disco, con un promedio efectivo de 6,724 bits por peso (6,615 si se excluye la tabla de embeddings N-gram). La cuantizacion se realizo con oQ (oMLX v0.7.4.dev1), herramienta de cuantizacion mixta del proyecto oMLX, y el resultado esta empaquetado en formato MLX para su ejecucion en hardware Apple Silicon.

El modelo base combina, segun la descomposicion de almacenamiento, un language model de 125.744B parametros, una tabla de embeddings N-gram de 51.200B, un modulo de vision de 0,449B y una cabeza MTP (multi-token prediction) de 2,607B. La presencia de vision y de cabeza MTP indica un modelo multimodal con decodificacion especulativa integrada. El tag qwen4_exp sugiere una arquitectura experimental de la familia Qwen, aunque no se dispone de documentacion tecnica oficial del modelo base en la informacion proporcionada.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 180B en equipos Apple Silicon con memoria unificada, algo inviable con pesos BF16 (que requeririan mas de 360 GB). Es, por tanto, una opcion practica para inferencia local de gran escala en macOS, a costa de la perdida de precision inherente a la cuantizacion de 6 bits y de la dependencia del ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabeza MTP (multi-token prediction) y embeddings N-gram; detalles completos no disponibles |
| Parametros totales | 180.000.000.000 (180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64, affine 8-bit grupo 64, affine 8-bit grupo 128, BF16, N-gram affine 6-bit grupo 32; promedio 6,724 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, cuantizado) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO). La descomposicion de almacenamiento del checkpoint cuantizado revela cuatro componentes: un language model de 125.744B parametros, una tabla de embeddings N-gram de 51.200B, un modulo de vision de 0,449B y una cabeza MTP de 2,607B. La cabeza MTP es un mecanismo de prediccion multi-token que habilita decodificacion especulativa, lo que sugiere que el modelo fue disenado para acelerar la generacion prediciendo varios tokens por paso. El tag qwen4_exp apunta a una variante experimental de la familia Qwen, pero no se ha publicado documentacion que confirme los detalles.

La cuantizacion, realizada con oMLX v0.7.4.dev1, aplica precision mixta: el 68,507% de los pesos logicos (123,313B) se almacena en affine 6-bit con grupo 64; el 28,445% (51,200B, la tabla N-gram) en affine 6-bit con grupo 32; el 2,628% (4,731B) en affine 8-bit grupo 64; el 0,287% (0,516B) en BF16; y el 0,134% (0,241B) en affine 8-bit grupo 128. Esta distribucion sugiere que las capas mas sensibles conservan mayor precision, mientras que los embeddings N-gram se cuantizan con grupos mas pequenos para mitigar la perdida de calidad.

## Capacidades

- Generacion de texto y razonamiento: el language model de 125,744B parametros sostiene las capacidades generativas del modelo base.
- Vision: el modulo de vision de 0,449B parametros indica soporte de entrada de imagenes, aunque no se detalla la tarea concreta (VQA, OCR, captioning).
- Decodificacion especulativa: la cabeza MTP de 2,607B parametros permite predecir multiples tokens por paso, lo que puede aumentar el throughput de generacion.
- Embeddings N-gram: la tabla de 51,200B parametros sugiere un mecanismo de recuperacion o memorizacion de secuencias frecuentes, orientado a mejorar la coherencia en dominios especificos.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Inferencia local de gran escala en Apple Silicon: el checkpoint de 151,3 GB cabe en equipos Mac Studio con 192 GB o 256 GB de memoria unificada, lo que permite ejecutar un modelo de 180B sin GPU dedicada. Es el caso de uso principal de esta publicacion.
- Prototipado de pipelines multimodales en local: el modulo de vision permite experimentar con tareas imagen-texto sin depender de APIs externas, util para investigacion con datos sensibles.
- Evaluacion de cuantizacion: el checkpoint sirve para comparar la calidad de la cuantizacion mixta de 6 bits frente al modelo base en BF16, midiendo la degradacion en tareas de razonamiento y generacion.
- Generacion de texto asistida con decodificacion especulativa: la cabeza MTP puede aprovecharse para reducir la latencia en aplicaciones interactivas, como asistentes de escritura o chat local.
- Investigacion sobre embeddings N-gram: la tabla de 51,200B parametros permite estudiar el impacto de mecanismos de recuperacion N-gram en la coherencia de la generacion.
- Despliegue en entornos aislados: al ser un checkpoint local en formato MLX, puede ejecutarse en maquinas sin conexion, adecuado para entornos con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 151,3 GB en disco; en ejecucion se requiere al menos esa cantidad de memoria unificada, mas overhead del runtime MLX (estimacion practica: 160-180 GB).
- GPU recomendadas: no aplica GPU dedicada; el formato MLX esta disenado para Apple Silicon (M1/M2/M3/M4 en configuraciones Pro, Max y Ultra).
- Cabe en consumer GPU: no. Ninguna GPU de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB) dispone de memoria suficiente.
- Equipos compatibles: Mac Studio con 192 GB o 256 GB de memoria unificada, Mac Pro con 192 GB o mas; configuraciones con 128 GB no son suficientes.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm para generacion de texto; no se ha confirmado soporte en vLLM, llama.cpp, Ollama o TGI, ya que el formato es MLX cuantizado.
- Latencia y throughput: no disponibles. La cabeza MTP podria mejorar el throughput, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-oQ6e-mtp | 180B | no disponible | MLX safetensors cuantizado | no disponible | Hugging Face (373 descargas) |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | 180B (presumiblemente) | no disponible | no disponible | no disponible | Hugging Face |
| Modelos Qwen de ~180B en BF16 | 180B | no disponible | safetensors | no disponible | Requiere >360 GB de memoria |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria. La comparativa se limita a parametros, formato y requisitos de memoria.

## Limitaciones y advertencias

- La cuantizacion de 6 bits introduce perdida de precision respecto al modelo base en BF16; el impacto exacto en calidad no se ha documentado.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial. No debe utilizarse en produccion sin verificar los terminos del modelo base y del autor de la cuantizacion.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA o AMD sin conversion.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma del modelo base.
- El modelo base es una variante experimental (tag qwen4_exp); su estabilidad y soporte a largo plazo no estan garantizados.
- El checkpoint fue re-cuantizado el 2026-11-11; versiones anteriores pueden presentar diferencias, por lo que conviene verificar la fecha de descarga.
- El tag mtp indica que la cabeza de prediccion multi-token forma parte del checkpoint, pero no se detalla como activarla ni su compatibilidad con todas las herramientas MLX.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ6e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
