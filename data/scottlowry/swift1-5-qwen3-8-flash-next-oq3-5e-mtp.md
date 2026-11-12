# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ3.5e-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ3.5e-mtp es una cuantizacion mixta del modelo Qwen3.8-Flash-Next, publicada por el usuario scottlowry en Hugging Face. Se trata de un checkpoint de 180.000 millones de parametros logicos (179.999.981.459 segun los pesos safetensors) almacenado en 97,4 GB gracias a una cuantizacion de precision mixta generada con oQ (oMLX v0.7.4.dev1). El modelo esta pensado para ejecutarse con la libreria MLX de Apple, lo que lo orienta a hardware Apple Silicon.

La arquitectura subyacente combina un modelo de lenguaje de 125.744 millones de parametros, una tabla de embeddings N-gram de 51.200 millones, un codificador de vision de 0,449 millones y una cabeza MTP (multi-token prediction) de 2.607 millones. La presencia de MTP y de vision sugiere un modelo multimodal con decodificacion especulativa nativa, aunque la model card no detalla la arquitectura interna mas alla del desglose de almacenamiento.

Su relevancia practica radica en que comprime un modelo de 180.000 millones de parametros a un tamano manejable (unos 90,7 GiB) con una media efectiva de 4,326 bits por peso, manteniendo modulos criticos en 6 y 8 bits. Es un ejemplo de cuantizacion selectiva orientada a preservar calidad en capas sensibles mientras se reduce drasticamente el coste de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza MTP y modulo de vision (detalles no disponibles) |
| Parametros totales | 179.999.981.459 (180.000B logicos) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3, 4, 6 y 8 bits (grupos 32, 64 y 128), BF16 e I64; media efectiva 4,326 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

La model card solo aporta el desglose de almacenamiento, no la arquitectura interna. Los datos disponibles indican un modelo de lenguaje de 125.744B parametros logicos, una tabla de embeddings N-gram de 51.200B (28,4% del total), un modulo de vision de 0,449B y una cabeza MTP de 2.607B. La etiqueta `qwen4_exp` sugiere una variante experimental de la familia Qwen, y la presencia de MTP apunta a decodificacion especulativa multi-token. No se dispone de informacion sobre tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica de este checkpoint es la cuantizacion mixta: 80.531B parametros en 3 bits (grupo 64), 42.866B en 4 bits, 3.763B en 8 bits (grupo 64), 0.883B en 6 bits, 0.516B en BF16 y la tabla N-gram en 4 bits con grupo 32. Esta asignacion selectiva mantiene en mayor precision las capas mas sensibles y comprime agresivamente las mas tolerantes, logrando 4,326 bits/peso efectivos en el checkpoint completo (4,058 excluyendo la tabla N-gram).

## Capacidades

- Generacion de texto y razonamiento (inferido de la familia Qwen; no confirmado en la model card).
- Procesamiento de vision: incluye un modulo de vision de 0,449B parametros.
- Decodificacion especulativa mediante cabeza MTP de 2.607B parametros.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Thinking mode u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 90,7 GiB, por lo que puede ejecutarse en equipos con memoria unificada de 128 GB o superior, como un Mac Studio M3 Ultra.
- Prototipado de asistentes multimodales: el modulo de vision permite experimentar con tareas imagen-texto en local sin depender de APIs externas.
- Investigacion sobre cuantizacion mixta: sirve como referencia para estudiar el impacto de asignar 3, 4, 6 y 8 bits a distintas capas de un modelo de 180B.
- Evaluacion de decodificacion especulativa: la cabeza MTP permite medir aceleraciones de generacion frente a decodificacion autoregresiva estandar.
- Despliegue de bajo coste en estaciones de trabajo Apple: al no requerir GPUs dedicadas, reduce el coste de infraestructura frente a alternativas en CUDA.
- Experimentacion con embeddings N-gram: la tabla de 51.200B parametros puede analizarse para estudiar representaciones lexicas a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 90,7 GiB para los pesos en el formato cuantizado actual.
- GPU recomendadas: no aplica directamente, ya que el formato MLX esta orientado a Apple Silicon. Se requiere un equipo con memoria unificada de al menos 96 GB, preferiblemente 128 GB.
- Cabe en consumer GPU: no en GPUs convencionales de consumo (RTX 4090 con 24 GB, etc.). Solo es viable en Apple Silicon de gama alta (Mac Studio M3 Ultra de 96/192/512 GB, Mac Pro).
- Opciones de despliegue: MLX y oMLX. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI dado el formato especifico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-oQ3.5e-mtp | 180B | no disponible | Mixta 3-8 bits | no disponible | MLX safetensors |
| Qwen3.8-Flash-Next (original) | 180B (inferido) | no disponible | BF16 | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor o consultar la licencia del modelo original Qwen3.8-Flash-Next antes de usarlo en produccion.
- Cuantizacion agresiva: el 44,7% de los pesos estan en 3 bits, lo que puede degradar la calidad en tareas sensibles (matematicas, codigo, razonamiento complejo) frente al modelo original en BF16.
- Dependencia de MLX: el checkpoint no es portable a ecosistemas CUDA sin reconversion, lo que limita su uso a hardware Apple.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento tras la cuantizacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; no se dispone de evaluaciones especificas.
- Idiomas no confirmados: no se puede garantizar soporte multilingue ni calidad en castellano.
- Modelo experimental: la etiqueta `qwen4_exp` y la ausencia de pipeline definido sugieren un estado de desarrollo temprano.
- Sesgos: no documentados en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ3.5e-mtp
- Repositorio oQ / oMLX: https://github.com/jundot/omlx
