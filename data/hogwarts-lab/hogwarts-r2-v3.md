# hogwarts-lab/hogwarts-r2-v3

## Resumen

Hogwarts-r2-v3 es un modelo de lenguaje publicado por el usuario hogwarts-lab en Hugging Face bajo licencia Apache 2.0. El repositorio contiene pesos en formato safetensors con 31.273.088.876 parametros totales (aproximadamente 31,3 mil millones), lo que lo situa en la categoria de modelos densos de gran tamano, comparables en escala a familias como Gemma 2 27B o Qwen2.5 32B. El tag `gemma4` sugiere que el modelo deriva de la arquitectura o de los pesos de una supuesta familia Gemma 4 de Google, aunque no hay documentacion publica que lo confirme.

El modelo esta alojado como repositorio con acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 27 de noviembre de 2026 con apenas una hora de diferencia, lo que indica una publicacion muy reciente y sin validacion por parte de la comunidad.

La relevancia de este modelo es incierta: no se ha publicado model card con detalles de entrenamiento, benchmarks ni instrucciones de uso, y el nombre "hogwarts" no corresponde a ningun laboratorio conocido. Se recomienda tratarlo como un artefacto experimental hasta que exista documentacion tecnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `gemma4` sugiere derivado de Gemma; sin confirmar) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo; sin GGUF/AWQ/GPTQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo. El tag `gemma4` en el repositorio apunta a una posible base Gemma de cuarta generacion, lo que implicaria un transformer decoder-only con atencion por ventanas alternas y posible atencion local/global intercalada, pero esta afirmacion no puede confirmarse con los datos disponibles. Tampoco se especifica si emplea atencion lineal, decodificacion especulativa u otras optimizaciones.

Respecto al entrenamiento, no hay datos sobre el numero de tokens, la composicion del corpus, el uso de RLHF, DPO u otras tecnicas de alineamiento. El tamano del repositorio (62,6 GB) es coherente con pesos en precision bf16 o fp16 para 31,3 mil millones de parametros (31,3 B x 2 bytes = ~62,6 GB), lo que confirma que se trata de pesos completos sin cuantizar y sin ficheros adicionales de tokenizer o configuracion visibles en los metadatos.

## Capacidades

- Generacion de texto: capacidad esperable por el tamano, pero no documentada.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

No se puede confirmar ninguna capacidad concreta porque el repositorio no incluye model card ni ejemplos de uso.

## Casos de uso

Dada la ausencia de documentacion y de validacion comunitaria, los casos de uso solo pueden plantearse como escenarios hipoteticos sujetos a evaluacion previa:

- Evaluacion comparativa de modelos de ~31 B: serviria como punto de comparacion frente a Gemma 2 27B o Qwen2.5 32B en tareas de generacion, siempre que se valide primero su calidad real.
- Fine-tuning supervisado sobre dominio propio: con 31,3 B de parametros y licencia Apache 2.0, es tecnicamente posible adaptarlo con LoRA o QLoRA en un cluster con GPUs de 80 GB, aunque sin garantias de rendimiento base.
- Investigacion sobre derivados de Gemma: util para estudiar como se comportan pesos derivados o reempaquetados de la familia Gemma frente al modelo original.
- Experimentos de cuantizacion: al estar solo en safetensors, es un candidato para generar versiones GGUF o AWQ y medir la degradacion de calidad.
- Despliegue en entornos con requisitos de licencia permisiva: Apache 2.0 permite uso comercial sin restricciones adicionales, a diferencia de otras licencias de modelos abiertos.
- Pruebas de infraestructura de inferencia: util para validar pipelines con vLLM o TGI a esa escala de parametros antes de comprometerse con un modelo documentado.

En ningun caso se recomienda su uso en produccion sin una evaluacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 62,6 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica requiere 70-80 GB como minimo.
- Cuantizacion a 8 bits: ~31-33 GB de VRAM, viable en una A100 40GB o H100 80GB.
- Cuantizacion a 4 bits: ~16-18 GB de VRAM, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con llama.cpp o exllamav2, aunque no hay GGUF publicado y habria que generarlo.
- GPU recomendadas: H100 80GB, A100 80GB o A100 40GB con cuantizacion; multi-GPU con 2x RTX 4090 para bf16.
- Opciones de despliegue: vLLM, TGI y transformers soportan safetensors de forma nativa; llama.cpp y Ollama requeririan conversion previa a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| hogwarts-r2-v3 | 31,3 B | no disponible | Apache 2.0 | inexistente | gated, 0 descargas |
| Gemma 2 27B | 27 B | 8K | Gemma license | extensa | abierta |
| Qwen2.5 32B | 32,5 B | 128K | Apache 2.0 (mayoria variantes) | extensa | abierta |
| Mistral Small 24B | 24 B | 32K | Apache 2.0 | extensa | abierta |

La comparativa se limita a parametros y licencia porque no hay datos de rendimiento del modelo analizado. Frente a sus competidores directos, hogwarts-r2-v3 carece de model card, benchmarks y comunidad, lo que lo deja en clara desventaja para cualquier evaluacion practica.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, alineamiento ni evaluacion.
- Riesgo elevado de alucinacion y comportamientos impredecibles al no conocerse el proceso de alineamiento.
- Sesgos desconocidos: sin documentacion sobre el corpus, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Idiomas no declarados: no se puede asumir competencia multilingue.
- Contexto desconocido: imposible planificar aplicaciones con ventanas largas.
- Repositorio gated con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Nombre y autor no verificables: "hogwarts-lab" no es un laboratorio reconocido; el tag `gemma4` no corresponde a ningun modelo publicado oficialmente por Google en la informacion disponible.
- Licencia Apache 2.0 declarada, pero al derivar presuntamente de Gemma conviene verificar que los terminos de la licencia original se respetan.
- No apto para produccion sin evaluacion exhaustiva previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hogwarts-lab/hogwarts-r2-v3
- No se han encontrado papers, blogs, repositorios de codigo ni demos asociados en la informacion disponible.
