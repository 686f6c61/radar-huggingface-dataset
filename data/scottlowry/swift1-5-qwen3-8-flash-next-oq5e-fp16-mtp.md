# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ5e-fp16-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ5e-fp16-mtp es una cuantización mixta del modelo Qwen3.8-Flash-Next, publicada por el usuario scottlowry en Hugging Face. El checkpoint original es un modelo multimodal de aproximadamente 180.000 millones de parámetros que combina un language model de 125.744B, una tabla de embeddings N-gram de 51.200B, un encoder de visión de 0.449B y una cabeza MTP (multi-token prediction) de 2.607B. Esta versión concreta está empaquetada en formato MLX, es decir, pensada para ejecutarse sobre Apple Silicon mediante la librería mlx.

La contribución de esta ficha no es un modelo nuevo, sino una receta de cuantización de precisión mixta generada con oQ (oMLX v0.7.4.dev1). El resultado ocupa 121,427 GiB en disco (130,382 GB) con un promedio efectivo de 5,795 bits por peso para el checkpoint completo, o 5,713 bits/peso excluyendo la tabla de embeddings N-gram. Es relevante porque permite desplegar un modelo de 180B en hardware de consumo Apple con un compromiso de precisión razonable, algo que en fp16 sería inviable.

La ficha se basa únicamente en los metadatos de Hugging Face y en la model card del autor. No hay información publicada sobre el modelo base, sus datos de entrenamiento, benchmarks o licencia, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabeza MTP y embeddings N-gram (detalles del base no disponibles) |
| Parametros totales | 179.999.981.459 (180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit (group 64), affine 8-bit (group 128 y 64), FP16, FP32, I64, N-gram affine 5-bit (group 32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |
| Bits efectivos por peso | 5,795 (checkpoint completo); 5,713 excluyendo embeddings N-gram |
| Tamano del repositorio | 229,3 GB |
| Desglose de almacenamiento | LM: 82,290 GiB; N-gram: 35,763 GiB; Vision: 1,672 GiB; MTP head: 1,702 GiB |
| Libreria | mlx |
| Descargas / likes | 209 / 1 |

## Arquitectura y entrenamiento

La información disponible describe únicamente la composición del checkpoint cuantizado, no la arquitectura interna del modelo base. El desglose indica cuatro componentes: un language model de 125.744B parámetros lógicos, una tabla de embeddings N-gram de 51.200B, un encoder de visión de 0.449B y una cabeza MTP de 2.607B. La presencia de MTP (multi-token prediction) sugiere que el modelo base incorpora decodificación especulativa o predicción de varios tokens por paso, y la tabla N-gram apunta a un mecanismo de embeddings de n-gramas probablemente orientado a memoria o recuperación léxica. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO.

La innovación técnica de esta publicación es la cuantización mixta con oQ: el 68,507% de los pesos lógicos se almacena en affine 5-bit group 64 (78,955 GiB), el 28,445% en N-gram affine 5-bit group 32 (35,763 GiB), y el resto se reparte entre 8-bit (2,762% combinado), FP16 (0,037%) y FP32 (0,249%). Esta asignación selectiva de precisión preserva en mayor medida las capas sensibles (visión, MTP y algunas partes del LM) mientras comprime agresivamente el grueso del modelo, logrando 5,795 bits/peso efectivos frente a los 16 bits de un checkpoint fp16. El autor re-cuantizó el modelo el 2026-11-11 con oMLX v0.7.4.dev1, por lo que las copias anteriores deben descargarse de nuevo.

## Capacidades

- Generación de texto y razonamiento: el language model de 125,744B parámetros lógicos soporta tareas generativas generales, aunque no hay evaluación publicada de su calidad tras la cuantización.
- Procesamiento de visión: el encoder de visión de 0.449B parámetros indica capacidades multimodales de entrada de imagen, aunque no se detallan tareas concretas.
- Predicción multi-token (MTP): la cabeza dedicada de 2.607B parámetros sugiere soporte para decodificación especulativa o generación de varios tokens por paso, lo que puede reducir la latencia en inferencia.
- Recuperación mediante embeddings N-gram: la tabla de 51.200B parámetros lógicos apunta a un mecanismo de memoria o lookup léxico que puede mejorar la coherencia en dominios específicos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking o razonamiento explícito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización a 5,795 bits/peso permiten ejecutar un modelo de 180B en equipos con memoria unificada grande (Mac Studio con 192 GB o superior), algo imposible en fp16. Se usaría con la librería mlx y el runtime oMLX.
- Prototipado de aplicaciones multimodales en local: el encoder de visión integrado permite experimentar con tareas imagen-texto sin depender de APIs externas, útil para investigación que requiera privacidad de datos.
- Evaluación de cuantización: este checkpoint sirve como referencia para medir la degradación de un modelo de 180B al pasar de fp16 a 5,795 bits/peso, comparando salidas con el modelo base.
- Generación de texto asistida con memoria N-gram: en dominios con vocabulario repetitivo (documentación técnica, código, textos legales), la tabla N-gram de 51.200B parámetros puede aportar coherencia léxica; se usaría en pipelines de generación de documentación o resúmenes.
- Experimentación con decodificación especulativa: la cabeza MTP permite probar técnicas de predicción multi-token para reducir latencia en generación larga, adecuado para investigación en eficiencia de inferencia.
- Despliegue de bajo coste en estaciones de trabajo Apple: para equipos que ya disponen de Mac Studio o Mac Pro con memoria unificada amplia, este modelo evita el coste de GPUs dedicadas para tareas de generación y análisis de imagen a media escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 121,427 GiB en disco; en inferencia MLX se requiere memoria unificada suficiente para los pesos más el estado de activaciones y KV cache. Con 180B parámetros a 5,795 bits/peso, se necesita un equipo con al menos 128 GB de memoria unificada, y 192 GB es recomendable para margen de contexto.
- GPU recomendadas: Apple Silicon con memoria unificada grande (M2 Ultra con 192 GB, M3 Ultra con 192 GB o superior). No es compatible con GPUs NVIDIA o AMD convencionales en este formato MLX.
- ¿Cabe en consumer GPU? No en GPUs de consumo con 24 GB o 48 GB. Solo es viable en Apple Silicon de gama alta con memoria unificada de 128 GB o más.
- Opciones de despliegue: mlx (librería nativa), oMLX (runtime del autor de la cuantización). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato es MLX y la cuantización oQ es específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-oQ5e-fp16-mtp | 180B | no disponible | MLX safetensors (oQ mixta) | no disponible | Hugging Face, 209 descargas |
| Modelo base Qwen3.8-Flash-Next (fp16) | 180B (presumiblemente) | no disponible | no disponible | no disponible | no disponible en la información |
| Alternativas de 180B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la misma categoría (180B multimodal en MLX) dentro de los datos proporcionados.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base Qwen3.8-Flash-Next antes de cualquier despliegue en producción.
- Degradación por cuantización: con 5,795 bits/peso efectivos, es esperable una pérdida de calidad frente al checkpoint fp16, especialmente en tareas de razonamiento complejo y matemáticas; no hay evaluación publicada que cuantifique esa pérdida.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a Apple Silicon; no es portable a GPUs NVIDIA o AMD sin reconversión.
- Requisito de memoria elevado: 121,427 GiB de pesos implican equipos de gama muy alta (128-192 GB de memoria unificada), lo que excluye la mayoría de estaciones de trabajo.
- Riesgo de alucinación: no hay datos específicos del modelo base ni evaluaciones de fiabilidad; se debe asumir el riesgo habitual de los LLM de 180B.
- Idiomas y sesgos: no disponibles; no se puede confirmar el soporte multilingüe ni los sesgos conocidos.
- Re-cuantización reciente: el autor actualizó el checkpoint el 2026-11-11; las copias anteriores pueden tener comportamiento distinto y deben re-descargarse.
- Trazabilidad limitada: el repositorio tiene 209 descargas y 1 like, sin pipeline declarado ni documentación del modelo base, lo que reduce la confianza para uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ5e-fp16-mtp
- Repositorio de oQ/oMLX: https://github.com/jundot/omlx
- Modelo base Qwen3.8-Flash-Next: no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible
