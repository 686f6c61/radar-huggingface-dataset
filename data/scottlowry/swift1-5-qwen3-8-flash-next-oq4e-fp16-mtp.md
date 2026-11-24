# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ4e-fp16-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ4e-fp16-mtp es una cuantizacion mixta de precision realizada por el usuario scottlowry sobre el modelo base ukisai/Swift1.5-Qwen3.8-Flash-Next. El checkpoint resultante, de 180.000 millones de parametros, esta empaquetado en formato MLX (safetensors) y pensado para ejecutarse en hardware Apple Silicon mediante la libreria MLX. La cuantizacion se ha llevado a cabo con la herramienta oQ de oMLX v0.7.4.dev1, que aplica precision mixta por tensor en lugar de un esquema uniforme.

El modelo conserva la estructura del base: un transformer con una tabla de embeddings N-gram de gran tamano (51.200 millones de parametros logicos), un modulo de vision de 0.449B, una cabeza MTP (multi-token prediction) de 2.607B y el cuerpo del lenguaje de 125.744B. La compresion efectiva es de 4.825 bits por peso en el checkpoint completo, o 4.756 bits/weight si se excluye la tabla N-gram, lo que reduce el almacenamiento a 101,111 GiB.

La relevancia de esta ficha radica en que es un ejemplo de cuantizacion agresiva pero selectiva: mantiene en FP32 los tensores sensibles (0.449B, el modulo de vision) y en 8 bits ciertas capas (4.731B), mientras que el grueso del cuerpo y la tabla N-gram se comprimen a 4 bits. Esto permite desplegar un modelo de 180B en un unico equipo con memoria unificada, algo inviable en FP16. No obstante, la informacion publica disponible es muy limitada: no hay model card del modelo base, ni benchmarks, ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tabla de embeddings N-gram, modulo de vision y cabeza MTP (multi-token prediction); detalles del base no disponibles |
| Parametros totales | 180.000.000.000 (180B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, FP16, FP32, N-gram affine 4-bit grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |
| Bits efectivos por peso | 4.825 (checkpoint completo); 4.756 excluyendo la tabla N-gram |
| Tamano del repositorio | 108,6 GB (101,111 GiB de pesos) |
| Libreria | mlx |
| Modelo base | ukisai/Swift1.5-Qwen3.8-Flash-Next |

## Arquitectura y entrenamiento

La arquitectura del modelo base no esta documentada en la informacion disponible. Por los componentes del checkpoint se deduce que se trata de un transformer con al menos tres modulos diferenciados: un cuerpo de lenguaje de 125.744B de parametros logicos, una tabla de embeddings N-gram de 51.200B y una cabeza de prediccion multi-token (MTP) de 2.607B. La presencia de MTP sugiere que el modelo base fue entrenado con objetivos de prediccion de varios tokens por paso, una tecnica habitual para acelerar la decodificacion. Tambien incluye un modulo de vision de 0.449B, lo que indica capacidades multimodales.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni las innovaciones tecnicas del modelo base. La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: oQ aplica precision mixta asignando 4 bits al 68,5% de los pesos logicos y a la tabla N-gram (28,4%), 8 bits a un 2,8% y FP32 a un 0,25%. El modulo de vision se mantiene integramente en FP32, probablemente para preservar la calidad de las representaciones visuales.

## Capacidades

- Generacion de texto: el modelo conserva el cuerpo de lenguaje completo del base, aunque no hay documentacion que detalle su calidad.
- Procesamiento de vision: incluye un modulo de vision de 0.449B en FP32, lo que sugiere capacidad de entender imagenes, si bien no se especifica la tarea exacta.
- Prediccion multi-token (MTP): la cabeza de 2.607B permite generar varios tokens por paso de decodificacion, lo que puede reducir la latencia.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades de codigo y matematicas: no disponible.

## Casos de uso

- Despliegue local en Apple Silicon: el formato MLX y la cuantizacion a 4,8 bits permiten ejecutar un modelo de 180B en equipos con memoria unificada de 128 GB o superior, como un Mac Studio M3 Ultra. Es el caso de uso principal de este checkpoint.
- Prototipado de aplicaciones multimodales: el modulo de vision en FP32 permite experimentar con tareas de imagen y texto sin necesidad de GPU dedicada, siempre que se valide la calidad del base.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia para estudiar el impacto de la precision mixta (4/8/16/32 bits) en modelos de gran tamano, comparando con el base sin cuantizar.
- Generacion de texto asistida en local: para flujos de trabajo que requieran privacidad y no puedan enviar datos a la nube, el modelo puede ejecutarse en un equipo de sobremesa Apple.
- Evaluacion de decodificacion especulativa: la cabeza MTP permite medir la ganancia de throughput frente a la decodificacion autoregresiva clasica en MLX.
- Fine-tuning ligero sobre el checkpoint cuantizado: aunque no es lo ideal, permite adaptar el modelo a dominios concretos con recursos limitados, siempre que la herramienta de entrenamiento soporte pesos MLX cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 101,1 GiB de pesos en disco; en memoria unificada se necesita al menos esa cantidad mas el overhead de activaciones y cache KV, por lo que se recomienda un minimo de 128 GB.
- GPU recomendadas: Apple Silicon con memoria unificada de 128 GB o mas (M3 Ultra, M4 Max con 128 GB). No es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: no en GPUs de consumo con 24 GB o 48 GB. Solo es viable en equipos Apple de gama alta o en configuraciones multi-GPU con conversión previa del formato.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm para inferencia. No se indica soporte para vLLM, llama.cpp, Ollama o TGI en formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de la misma categoria (180B, cuantizacion MLX, multimodal) en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta especificada, lo que impide confirmar si se permite uso comercial. Es imprescindible contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- No hay model card del modelo base ni del checkpoint que documente sesgos, alucinaciones o limitaciones de idioma.
- La cuantizacion a 4 bits puede degradar la calidad en tareas sensibles (matematicas, codigo, razonamiento largo); no se han publicado evaluaciones que lo cuantifiquen.
- El checkpoint esta en formato MLX, lo que limita su uso a hardware Apple Silicon o a conversiones manuales; no es directamente compatible con ecosistemas CUDA.
- El repositorio tiene 385 descargas y 2 likes, lo que indica una validacion comunitaria muy baja.
- La fecha de creacion (2026-10-07) y actualizacion (2026-11-13) sugieren un modelo reciente y posiblemente inestable; el autor indica que se re-cuantizo con oMLX v0.7.4.dev1, por lo que versiones anteriores pueden tener diferencias.
- No se especifica la longitud de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
