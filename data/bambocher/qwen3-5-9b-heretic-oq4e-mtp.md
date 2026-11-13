# bambocher/Qwen3.5-9B-heretic-oQ4e-mtp

## Resumen

Qwen3.5-9B-heretic-oQ4e-mtp es una cuantizacion mixta de precisión del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: el autor aplica la herramienta oQ (oMLX v0.7.3) para reducir el peso del modelo original a una media efectiva de 5,404 bits por peso, con un tamano de repositorio de 6,5 GB. El modelo conserva los 9.653 millones de parametros del checkpoint base, distribuidos entre el modelo de lenguaje (8,954B), un codificador de vision (0,456B) y una cabeza MTP (0,243B).

La relevancia de esta publicacion es fundamentalmente practica: permite ejecutar un modelo multimodal de ~9,6B parametros en hardware Apple Silicon mediante MLX, con un consumo de almacenamiento contenido y una mezcla de precisiones que asigna 4 bits a la mayor parte de los pesos (73,6%) y mantiene en BF16 un 5,08% de los tensores, presumiblemente los mas sensibles. La presencia de una cabeza MTP (multi-token prediction) sugiere soporte para decodificacion especulativa o generacion acelerada, aunque la model card no detalla su funcionamiento.

No obstante, la informacion disponible es muy limitada: no se especifican licencia, idiomas soportados, pipeline, datos de entrenamiento ni resultados de benchmarks. El nombre "heretic" sugiere una variante con ajustes de alineacion o censura reducida, pero esto no se documenta en la model card. Cualquier evaluacion rigurosa del modelo requiere consultar el checkpoint base Qwen3.5-9B, del que este deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + vision + cabeza MTP); detalles no disponibles |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit group 64 (73,637%), affine 5-bit group 64 (10,656%), affine 6-bit group 64 (10,624%), BF16 (5,083%); media efectiva 5,404 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo Qwen3.5-9B, no un entrenamiento nuevo. La arquitectura subyacente es la del modelo base de Qwen, que segun la descomposicion de almacenamiento incluye tres componentes: un modelo de lenguaje de 8,954B parametros, un modulo de vision de 0,456B y una cabeza MTP de 0,243B. La presencia de vision confirma que se trata de un modelo multimodal, y la cabeza MTP apunta a tecnicas de prediccion multi-token orientadas a acelerar la generacion.

La cuantizacion se realizo con oQ (oMLX v0.7.3), que aplica precision mixta por tensor: la mayor parte de los pesos se almacena en 4 bits con group size 64, mientras que un subconjunto se conserva en 5 y 6 bits, y un 5,08% permanece en BF16. Esta estrategia busca preservar la calidad en las capas mas sensibles al ruido de cuantizacion. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni si hubo RLHF o DPO. Tampoco se documenta el significado del sufijo "heretic" ni que modificaciones de alineacion se aplicaron al checkpoint original.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, sin detalles publicados en esta ficha.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,456B parametros, lo que habilita tareas de comprension de imagenes.
- Prediccion multi-token (MTP): la cabeza dedicada de 0,243B sugiere soporte para generacion acelerada o decodificacion especulativa.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: no disponible.
- Otras capacidades especiales (audio, etc.): no disponibles.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamano de 6,5 GB permiten ejecutar el modelo en equipos con memoria unificada de 16 GB o superior, lo que facilita prototipado offline sin GPU dedicada.
- Prototipado de aplicaciones multimodales: el modulo de vision integrado permite construir demos de descripcion de imagenes, extraccion de informacion de documentos escaneados o respuesta a preguntas sobre capturas, siempre que se valide la calidad frente al modelo base.
- Aceleracion de generacion con MTP: la cabeza de prediccion multi-token puede aprovecharse en entornos MLX para reducir la latencia en tareas de generacion larga, como resumen de documentos o redaccion asistida.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad de una cuantizacion mixta de 5,4 bits frente al checkpoint BF16 en tareas concretas de su dominio.
- Despliegue en estaciones de trabajo con memoria limitada: al ocupar 6,07 GiB de almacenamiento de tensores, permite mantener varias instancias o combinarlo con otros modelos en un mismo equipo.
- Experimentacion con variantes "heretic": para equipos que estudien el efecto de ajustes de alineacion reducida, este checkpoint ofrece un punto de partida, aunque la falta de documentacion exige validacion propia.
- Fines educativos y de investigacion: como ejemplo de pipeline de cuantizacion mixta con oQ y de publicacion de checkpoints derivados en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 8 GB para cargar los 6,07 GiB de tensores mas overhead de ejecucion; se recomienda 16 GB o mas para contexto largo y vision.
- GPU recomendadas: el formato MLX esta orientado a Apple Silicon (series M1, M2, M3, M4); no se garantiza compatibilidad directa con CUDA.
- Cabe en GPU consumer: si, en equipos Apple con memoria unificada de 16 GB o superior; en GPUs NVIDIA consumer requeriria conversion de formato, no documentada por el autor.
- Opciones de despliegue: MLX (libreria declarada); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ4e-mtp | 9,653B | no disponible | Mixta 4/5/6-bit + BF16 (5,404 bits/peso) | no disponible | safetensors (MLX) |
| Qwen3.5-9B (base) | ~9,6B (inferido) | no disponible | BF16 original | no disponible | safetensors |
| Alternativas de ~9B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con modelos alternativos; la informacion proporcionada no incluye resultados de rendimiento ni especificaciones del checkpoint base mas alla de la descomposicion de parametros.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base Qwen3.5-9B antes de cualquier despliegue en produccion.
- El sufijo "heretic" sugiere una reduccion de alineacion o de filtros de seguridad, pero no se documenta que modificaciones concretas se aplicaron; esto implica un riesgo elevado de contenido inapropiado o no filtrado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, agravado por la falta de benchmarks que cuantifiquen la degradacion introducida por la cuantizacion.
- Perdida de calidad por cuantizacion: aunque la mezcla de precisiones busca mitigarla, no hay evaluaciones publicadas que comparen este checkpoint con el BF16 original.
- Idiomas no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin pruebas propias.
- Contexto no documentado: se desconoce la ventana maxima, lo que impide planificar cargas de trabajo con documentos largos.
- Dependencia de MLX: el checkpoint esta empaquetado para el ecosistema Apple; su uso en CUDA u otras plataformas requiere conversion no soportada oficialmente.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Sin informacion sobre sesgos: no se han publicado analisis de sesgo del modelo base ni de esta variante.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ4e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-9B: no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
