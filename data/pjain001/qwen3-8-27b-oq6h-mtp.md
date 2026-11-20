# pjain001/Qwen3.8-27B-oQ6h-mtp

## Resumen

Qwen3.8-27B-oQ6h-mtp es una cuantizacion mixta del modelo Qwen3.8-27B, publicada por el usuario pjain001 en Hugging Face. El checkpoint se ha generado con oQ (oMLX v0.8.0), la herramienta de cuantizacion de precision mixta del proyecto oMLX, y esta empaquetado en formato MLX para su ejecucion en hardware Apple Silicon. El nombre del repositorio sugiere un modelo base de la familia Qwen3.5 con 27.000 millones de parametros, aunque el checkpoint cuantizado almacena 8.657 millones de pesos logicos tras el proceso de compresion.

El modelo incluye tres componentes diferenciados: el modelo de lenguaje (7.772B pesos logicos), un codificador de vision (0.461B) y una cabeza MTP (multi-token prediction, 0.425B). La presencia de vision y de MTP indica que el modelo base es multimodal y soporta decodificacion especulativa mediante prediccion de multiples tokens. El checkpoint ocupa 23,9 GB en disco, con un promedio efectivo de 22,054 bits por peso, lo que refleja una mezcla heterogenea de cuantizaciones (6-bit, 8-bit, BF16 y U32) en lugar de una compresion uniforme.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~27B con capacidades multimodales y MTP en equipos con memoria unificada de gama alta (Mac Studio, MacBook Pro con 32 GB o mas), algo que el checkpoint original en BF16 no permitiria. No obstante, se trata de una cuantizacion de terceros, sin model card detallada, sin benchmarks publicados y sin licencia declarada en el repositorio, lo que limita su uso en produccion sin verificacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5) con cabeza MTP; no se detalla la configuracion interna |
| Parametros totales | 8.657.057.520 pesos logicos en el checkpoint cuantizado (modelo base ~27B segun el nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (18,502%), affine 8-bit grupo 64 (15,171%), BF16 (10,393%), U32 (55,935%); promedio efectivo 22,054 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El checkpoint corresponde a un transformer de la familia Qwen3.5, segun el tag `qwen3_5`, con tres submodulos: modelo de lenguaje, torre de vision y cabeza MTP. La cabeza MTP (multi-token prediction) es un componente de decodificacion especulativa que predice varios tokens por paso, lo que puede aumentar el throughput de generacion en inferencia. La torre de vision confirma que el modelo base es multimodal (entrada de imagen ademas de texto). No se dispone de informacion sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni sobre la composicion del dataset de entrenamiento del modelo original.

El proceso de cuantizacion, realizado con oMLX v0.8.0, aplica precision mixta: los pesos mas sensibles se mantienen en BF16 (0,900B pesos, 16 bits) o se almacenan como U32 (4,842B pesos, 32 bits), mientras que el resto se comprime a 6-bit u 8-bit con grupos de 64. La elevada proporcion de pesos en U32 (55,935% del total) es atipica y sugiere que oQ preserva ciertos tensores (posiblemente embeddings, normalizaciones o parametros de cuantizacion) en alta precision. No hay informacion sobre fine-tuning posterior, RLHF, DPO ni sobre el numero de tokens de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.5 esta disenado para tareas de lenguaje general, aunque no se detallan capacidades especificas en la model card.
- Vision: la presencia de una torre de vision de 0,461B pesos indica soporte de entrada de imagenes (comprension visual).
- Decodificacion especulativa: la cabeza MTP de 0,425B pesos permite prediccion de multiples tokens, orientada a acelerar la generacion.
- Tool calling / function calling: no confirmado en la informacion disponible; el modelo base Qwen3.5 probablemente lo soporta, pero no hay verificacion en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado para MLX y ocupa 23,9 GB, por lo que puede cargarse en Mac con 32 GB de memoria unificada o superior, permitiendo ejecutar un modelo de ~27B sin GPU dedicada.
- Prototipado de asistentes multimodales: gracias a la torre de vision, se puede usar para tareas de descripcion de imagenes, extraccion de informacion de capturas o documentos escaneados en un entorno de desarrollo local.
- Aceleracion de generacion con MTP: la cabeza de multi-token prediction permite experimentar con decodificacion especulativa para reducir la latencia en tareas de generacion larga, como resumenes o redaccion asistida.
- Evaluacion de cuantizacion mixta: util para investigadores que quieran medir el impacto de una mezcla 6-bit/8-bit/BF16/U32 frente al modelo original en tareas de razonamiento y vision.
- Desarrollo offline en portatiles: al no requerir conexion ni servidores remotos, sirve para entornos con requisitos de privacidad donde los datos no pueden salir del dispositivo.
- Base para fine-tuning ligero: el checkpoint cuantizado puede servir como punto de partida para experimentos de adaptacion (LoRA/QLoRA) sobre MLX, aunque la cuantizacion mixta complica la exportacion a otros formatos.
- Pruebas de compatibilidad de toolchains: util para validar el soporte de MLX y oQ en pipelines internos antes de adoptar modelos Qwen3.5 en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 23,9 GB de almacenamiento; en inferencia se necesita al menos esa cantidad mas overhead de activaciones, por lo que se recomienda un minimo de 32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max, Mac Studio). No es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: en GPUs NVIDIA consumer (RTX 4090 con 24 GB) el margen es muy ajustado y requeriria conversion a otro formato (GGUF), no soportado directamente por MLX.
- Opciones de despliegue: MLX (libreria nativa del checkpoint); no hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles; la presencia de MTP sugiere mejoras en throughput, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ6h-mtp (este) | 8,657B logicos (base ~27B) | no disponible | MLX safetensors | no disponible | Hugging Face, 0 descargas |
| Qwen3.5-27B (original, referencia) | ~27B | no disponible | safetensors BF16 | no disponible | Segun publicacion del autor original |
| Alternativas cuantizadas GGUF de ~27B | ~27B | variable | GGUF | variable | Amplia disponibilidad |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas concretas. La comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Cuantizacion de terceros: no es una publicacion oficial del equipo Qwen; la calidad y fidelidad respecto al modelo original no estan verificadas.
- Licencia no declarada: no se indica licencia en el repositorio, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base Qwen3.5 antes de cualquier uso en produccion.
- Sin benchmarks: no hay evaluaciones publicadas que midan la degradacion introducida por la cuantizacion mixta.
- Sin model card detallada: no se documentan idiomas, contexto, capacidades de tool calling ni limitaciones conocidas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay datos especificos de este checkpoint.
- Sesgos: no documentados; se heredan del modelo base y del dataset de entrenamiento, no disponible.
- Compatibilidad limitada: el formato MLX restringe el despliegue a hardware Apple Silicon; no hay soporte confirmado en ecosistemas CUDA.
- Cero descargas y cero likes: el repositorio no tiene validacion comunitaria, lo que reduce la confianza en su correcto funcionamiento.
- Proporcion elevada de pesos en U32 (55,935%): reduce el ahorro de memoria esperado de una cuantizacion de 6 bits y puede afectar al rendimiento en equipos con memoria justa.

## Enlaces

- Hugging Face: https://huggingface.co/pjain001/Qwen3.8-27B-oQ6h-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion proporcionada.
