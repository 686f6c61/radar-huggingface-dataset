# Prismner/ShadowCrafter-9B

## Resumen

ShadowCrafter-9B es un modelo de lenguaje de 9.000 millones de parametros publicado por el desarrollador KaztoRay bajo el identificador de repositorio Prismner/ShadowCrafter-9B en Hugging Face. Segun su model card, se trata de un ajuste fino (fine-tuning) del modelo base ornith-ai/Ornith-1.5-9B, orientado a investigacion defensiva en ciberseguridad. La publicacion se etiqueta como "Official Release v1.0" con visibilidad publica, pero con uso comercial explicitamente prohibido.

El modelo se distribuye en formato safetensors con un tamano de repositorio de apenas 0,2 GB, lo que resulta llamativamente pequeno para un modelo de 9B parametros y sugiere que el repositorio no contiene los pesos completos o que estos se distribuyen de otra forma. La model card no detalla arquitectura, longitud de contexto, idiomas soportados ni proceso de entrenamiento.

La relevancia de esta ficha es limitada pero instructiva: el autor publica metricas de evaluacion medidas sobre el benchmark AI4Sec/cti-bench (5.533 muestras) con unos resultados muy pobres (accuracy de 0,463, balanced accuracy de 0,111 y macro-F1 de 0,067), y reconoce explicitamente que no se alcanza el objetivo de calidad ("95% target met: no"). Es, por tanto, un ejemplo de publicacion que documenta honestamente un resultado fallido de ajuste fino en el dominio de ciberseguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ornith-ai/Ornith-1.5-9B) |
| Parametros totales | 9B (segun nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (uso comercial: false) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. La model card unicamente indica que ShadowCrafter-9B es un fine-tuning de ornith-ai/Ornith-1.5-9B, sin especificar si emplea un transformer denso, una arquitectura MoE o algun esquema hibrido. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado.

El unico dato tecnico verificable del proceso es la evaluacion realizada sobre el benchmark AI4Sec/cti-bench en una revision concreta (9237e1636ee3e168fbe5ebdcc1c571de0525e568) y con un dataset cuyo SHA-256 se publica. El checkpoint candidato tambien incluye su hash SHA-256 (969ffa8f3d97b384115b234b1cedf9a74106af1e0de671752a44f712fc08e955), lo que permite verificar la integridad de los pesos, aunque el contenido del repositorio (0,2 GB) parece insuficiente para albergar un modelo de 9B en precision completa.

## Capacidades

- Generacion de texto: capacidad generica heredada del modelo base, no documentada especificamente para este ajuste.
- Razonamiento sobre ciberseguridad: el ajuste fino se orienta a tareas de inteligencia de amenazas (CTI), aunque las metricas obtenidas no respaldan un rendimiento util.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion.

## Casos de uso

- Investigacion academica sobre ajuste fino en dominios de nicho: el modelo sirve como caso de estudio de un fine-tuning que no alcanza su objetivo de calidad, util para analizar que estrategias de entrenamiento fallan en tareas CTI.
- Evaluacion de pipelines de benchmarking: la publicacion incluye revision, hashes y metricas reproducibles sobre AI4Sec/cti-bench, lo que permite validar herramientas de evaluacion con un caso real documentado.
- Analisis de calibracion y sesgo de clase: con una balanced accuracy de 0,111 frente a una accuracy de 0,463, el modelo es un ejemplo practico para estudiar el comportamiento de clasificadores desbalanceados en datasets de ciberseguridad.
- Reproducibilidad de releases: los hashes SHA-256 del checkpoint y del dataset permiten practicas de verificacion de integridad en pipelines de MLOps.
- Docencia sobre limitaciones de modelos: util como contraejemplo en formacion sobre evaluacion rigurosa y criterios de aceptacion de modelos.
- No se recomienda su uso en produccion defensiva real, atencion al cliente, generacion de codigo ni ninguna aplicacion operativa, dado que el propio autor declara que no se cumple el objetivo de calidad.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre AI4Sec/cti-bench (5.533 muestras, revision 9237e1636ee3e168fbe5ebdcc1c571de0525e568):

| Metrica | Valor |
|---|---|
| Accuracy | 0,4627 |
| Balanced accuracy | 0,1110 |
| Macro-F1 | 0,0675 |
| Objetivo de calidad (95%) alcanzado | no |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. No se dispone de comparaciones con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion. Como referencia generica para un modelo de 9B, en fp16 se requeririan aproximadamente 18 GB de VRAM y en cuantizacion de 4 bits alrededor de 5-6 GB, pero estos calculos no estan confirmados por el autor.
- GPU recomendadas: no disponible en la informacion.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio de 0,2 GB sugiere que los pesos completos no estan alojados en el mismo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible en la informacion.
- Latencia y throughput: no disponible en la informacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base declarado es ornith-ai/Ornith-1.5-9B, pero no se aportan sus especificaciones ni sus resultados, y la model card no menciona alternativas del mismo dominio (ciberseguridad) ni del mismo tamano.

| Modelo | Parametros | Contexto | Licencia | Uso comercial | Benchmarks publicados |
|---|---|---|---|---|---|
| ShadowCrafter-9B | 9B | no disponible | other | no | AI4Sec/cti-bench (accuracy 0,463) |
| ornith-ai/Ornith-1.5-9B (base) | 9B | no disponible | no disponible | no disponible | no disponible |
| Alternativas CTI de 9B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy bajo en su benchmark objetivo: macro-F1 de 0,0675 y balanced accuracy de 0,111 indican que el modelo practicamente no discrimina clases en AI4Sec/cti-bench.
- El propio autor declara que no se cumple el objetivo de calidad del 95%, por lo que el modelo no deberia considerarse apto para tareas defensivas reales.
- Licencia "other" con uso comercial explicitamente desactivado ("commercial_use: false"); cualquier uso en producto o servicio queda prohibido salvo autorizacion expresa.
- Riesgo elevado de alucinacion y de respuestas incorrectas en dominio de ciberseguridad, dado el bajo rendimiento medido.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto desconocida, lo que impide planificar casos de uso con documentos largos.
- El repositorio de 0,2 GB es inconsistente con un modelo de 9B en safetensors completos; verificar la integridad y disponibilidad real de los pesos antes de cualquier despliegue.
- El modelo se publica para investigacion defensiva; el autor advierte que no constituye autorizacion para accesos no autorizados.
- Fecha de creacion indicada como 2026-11-28, posterior a la fecha habitual de publicaciones; conviene verificar la autenticidad del release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prismner/ShadowCrafter-9B
- Modelo base declarado: ornith-ai/Ornith-1.5-9B (referencia en la model card, sin URL directa proporcionada)
- Benchmark AI4Sec/cti-bench: referenciado en la model card con revision 9237e1636ee3e168fbe5ebdcc1c571de0525e568 (sin URL directa proporcionada)
- Repositorio indicado por el autor: KaztoRay/ShadowCrafter-9B (sin URL directa proporcionada)
