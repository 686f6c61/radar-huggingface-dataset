# scottlowry/Ornith-1.5-122B-oQ4e-fp16-mtp

## Resumen

Ornith-1.5-122B-oQ4e-fp16-mtp es una cuantizacion mixta de precision del modelo base ornith-ai/Ornith-1.5-122B, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos optimizada para inferencia en Apple Silicon mediante la libreria MLX y el motor de cuantizacion oQ (oMLX v0.7.4.dev1). El checkpoint completo almacena 125.086.497.008 parametros logicos en 69,925 GiB, con un promedio efectivo de 4,802 bits por peso.

El modelo base pertenece a la familia Qwen3.5 MoE, segun el tag `qwen3_5_moe`, e incorpora un cabezal MTP (multi-token prediction) de 2.524B parametros y un modulo de vision de 0.451B parametros. La cuantizacion es mixta: el 94,639% de los pesos logicos se almacenan en 4 bits afines con grupo 64, mientras que una fraccion pequena (en torno al 5%) se mantiene en 8 bits, FP16 o FP32 para preservar la precision en capas sensibles.

Su relevancia actual radica en que permite ejecutar un modelo de 122B parametros del lenguaje con vision y decodificacion especulativa MTP en hardware Apple con memoria unificada, algo inviable con los pesos en precision completa. La ficha se limita a los datos disponibles en la informacion proporcionada; muchos campos tecnicos del modelo base no estan publicados en esta pagina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con cabezal MTP y modulo de vision |
| Parametros totales | 125.086.497.008 (122.112B lenguaje + 0.451B vision + 2.524B MTP) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, FP16, FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantizacion oQ |
| Bits efectivos por peso | 4,802 (promedio del checkpoint completo) |
| Tamano del repositorio | 149,0 GB |
| Tamano del checkpoint cuantizado | 75,081 GB / 69,925 GiB |
| Libreria de inferencia | mlx |
| Descargas | 331 |
| Likes | 1 |
| Fecha de creacion | 2026-10-20 |
| Ultima actualizacion | 2026-11-11 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) identificado por el tag `qwen3_5_moe`, lo que sugiere una arquitectura derivada de la familia Qwen3.5. Incluye un modulo de vision de 0.451B parametros, lo que confirma capacidades multimodales de entrada de imagen, y un cabezal MTP de 2.524B parametros que habilita decodificacion multi-token (especulativa) para acelerar la generacion. No se dispone de informacion sobre el numero de parametros activos por token, el numero de expertos, la longitud de contexto nativa, el volumen de tokens de entrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo base.

Esta publicacion concreta no entrena nada: aplica cuantizacion mixta con oQ (oMLX v0.7.4.dev1) sobre los pesos del modelo base. La distribucion de precision es la siguiente: 118.380B parametros en 4 bits afines grupo 64 (62,016 GiB), 5.733B en 8 bits grupo 64 (5,673 GiB), 0.462B en 8 bits grupo 128 (0,444 GiB), 0.060B en FP16 (0,111 GiB) y 0.451B en FP32 (1,681 GiB). El desglose por componente es: lenguaje 122.112B (66,855 GiB), vision 0.451B (1,681 GiB) y cabezal MTP 2.524B (1,389 GiB). La nota del autor indica que el checkpoint se recuantizo el 2026-11-11 y que las copias anteriores deben descargarse de nuevo.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de 122B parametros del lenguaje orientado a tareas generales de comprension y generacion.
- Procesamiento de vision: incorpora un modulo visual de 0.451B parametros, por lo que acepta entradas de imagen ademas de texto.
- Decodificacion multi-token (MTP): el cabezal MTP de 2.524B parametros permite prediccion especulativa de varios tokens, orientada a reducir la latencia de generacion.
- Mezcla de expertos: la arquitectura MoE del modelo base implica activacion dispersa de parametros, aunque el numero de parametros activos no esta disponible.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado para MLX y ocupa 69,925 GiB, por lo que puede cargarse en equipos Apple con memoria unificada suficiente (por ejemplo, configuraciones de 96 GB o 128 GB) sin depender de GPUs NVIDIA ni de servicios en la nube.
- Prototipado de asistentes multimodales: al incluir modulo de vision, permite construir prototipos que reciben imagenes y texto y generan respuestas, con la ventaja de ejecutarse en local.
- Evaluacion de tecnicas de cuantizacion: la distribucion mixta documentada (4/8/16/32 bits) sirve como referencia para estudiar el impacto de la cuantizacion selectiva en calidad y velocidad frente a cuantizaciones uniformes.
- Investigacion sobre decodificacion especulativa: el cabezal MTP incluido permite experimentar con prediccion multi-token y medir aceleraciones de throughput en MLX.
- Despliegue de bajo coste para pruebas internas: al no requerir infraestructura GPU dedicada, es util para equipos que quieren validar prompts y flujos con un modelo grande antes de pasar a produccion.
- Desarrollo de aplicaciones de escritorio con privacidad: al ejecutarse en local, los datos de texto e imagen no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.
- Benchmarking de hardware Apple: sirve para medir latencia y memoria real de un modelo de 122B cuantizado en distintos chips de la gama M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint cuantizado ocupa 69,925 GiB (75,081 GB); se necesita memoria unificada holgada por encima de esa cifra para el runtime, el contexto y los buffers de atencion.
- Hardware objetivo: Apple Silicon con MLX. No se indica compatibilidad con CUDA ni con GPUs NVIDIA.
- Cabe en consumer GPU: no aplica segun la informacion disponible; el formato es MLX y esta pensado para memoria unificada de Apple, no para GPUs discretas.
- Equipos Apple plausibles: configuraciones de 96 GB o 128 GB de memoria unificada (Mac Studio, MacBook Pro de gama alta); no confirmado por el autor.
- Opciones de despliegue: MLX y oMLX (motor de cuantizacion oQ). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-122B-oQ4e-fp16-mtp (esta ficha) | 125,086B | no disponible | no disponible | safetensors MLX (oQ mixto) | Vision + MTP, 69,925 GiB |
| ornith-ai/Ornith-1.5-122B (base) | 122B+ (no confirmado) | no disponible | no disponible | safetensors | Precision original, mayor tamano en disco |
| Alternativas de 120B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: la calidad final depende del modelo base y de la perdida introducida por la cuantizacion a 4 bits en el 94,6% de los pesos.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base ornith-ai/Ornith-1.5-122B antes de cualquier despliegue productivo.
- Dependencia de MLX: el formato es especifico de Apple Silicon; no es portable a ecosistemas CUDA sin reconversion.
- Riesgo de alucinacion: inherente a los LLM; no se han publicado evaluaciones de fidelidad para este checkpoint.
- Sesgos: no se dispone de informacion sobre sesgos conocidos del modelo base ni de esta cuantizacion.
- Idiomas: no se especifican los idiomas soportados; no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Contexto: se desconoce la longitud de contexto nativa, lo que impide planificar aplicaciones con ventanas largas.
- Versionado: el autor actualizo el checkpoint el 2026-11-11; mezclar copias antiguas y nuevas puede producir diferencias de calidad.
- Repositorio de gran tamano (149,0 GB): requiere espacio en disco y tiempo de descarga considerables.
- Adopcion muy baja (331 descargas, 1 like): no hay validacion comunitaria significativa de su funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Repositorio oQ/oMLX: https://github.com/jundot/omlx
