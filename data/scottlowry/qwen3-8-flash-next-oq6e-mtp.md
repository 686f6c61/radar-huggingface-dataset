# scottlowry/Qwen3.8-Flash-Next-oQ6e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ6e-mtp es una cuantizacion mixta de precision del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint original de Qwen a formato MLX (Apple Silicon) mediante la herramienta oQ de oMLX v0.7.4.dev1, con una media efectiva de 6,724 bits por peso para el checkpoint completo. El resultado ocupa 151,3 GB en disco y esta pensado para ejecucion local en hardware Apple con memoria unificada abundante.

El checkpoint conserva tres componentes diferenciados: el modelo de lenguaje (125.744B parametros logicos), una tabla de embeddings N-gram de gran tamano (51.200B), una torre de vision (0.449B) y una cabeza MTP (multi-token prediction) de 2.607B. La presencia de vision y de MTP indica que el modelo base es multimodal y dispone de decodificacion especulativa nativa, aunque la model card del autor no documenta ninguno de estos aspectos funcionales. Los 180.000 millones de parametros totales proceden del dato real de safetensors del repositorio.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantizacion derivado, no de una publicacion oficial de Qwen, y la mayor parte de las especificaciones funcionales (contexto, idiomas, licencia, benchmarks) no estan disponibles en la informacion proporcionada. Cualquier evaluacion en produccion deberia remitirse al modelo base original y a la documentacion oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabeza MTP (multi-token prediction) y tabla de embeddings N-gram; detalles completos no disponibles |
| Parametros totales | 179.999.981.459 (180.000B) |
| Parametros activos | no disponible (no se confirma si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla de affine 6-bit group 64 (68,507% de los pesos), affine 8-bit group 128 (0,134%), affine 8-bit group 64 (2,628%), BF16 (0,287%), N-gram affine 6-bit group 32 (28,445%); media efectiva 6,724 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.8-Flash-Next ni sus datos de entrenamiento (numero de tokens, composicion del corpus, fases de RLHF/DPO). Lo que si se puede inferir del desglose de almacenamiento es la estructura de componentes del checkpoint: un modelo de lenguaje de 125.744B parametros logicos, una tabla de embeddings N-gram de 51.200B parametros (el 28,445% del total, almacenada en 41,723 GiB), una torre de vision de 0.449B parametros en BF16 y una cabeza MTP de 2.607B parametros. La tabla N-gram de este tamano sugiere una tecnica de memorizacion o recuperacion de n-gramas integrada en el modelo, aunque su funcion exacta no esta documentada en la model card.

La innovacion tecnica documentada es la cuantizacion mixta de oQ (oMLX v0.7.4.dev1), que asigna precision de forma heterogenea: 6 bits con grupo 64 para la mayor parte de los pesos del modelo de lenguaje, 8 bits con grupos 64 y 128 para una fraccion pequena (2,762% combinado) presumiblemente sensible, BF16 para 0.516B parametros (probablemente normas y capas criticas) y 6 bits con grupo 32 para la tabla N-gram. La cabeza MTP, orientada a decodificacion especulativa, se conserva en el checkpoint cuantizado con 2.142 GB de almacenamiento. El autor indica que el modelo fue recuantizado el 11 de noviembre de 2026 con oMLX v0.7.4.dev1 y recomienda descargar de nuevo la version actual.

## Capacidades

- Generacion de texto y modelado de lenguaje: el componente principal de 125.744B parametros logicos corresponde al modelo de lenguaje.
- Procesamiento de vision: el checkpoint incluye una torre de vision de 0.449B parametros en BF16, lo que implica capacidad multimodal de entrada de imagen, aunque no se documentan tareas concretas.
- Decodificacion especulativa: la cabeza MTP de 2.607B parametros permite multi-token prediction, lo que tipicamente acelera la generacion en inferencia.
- Recuperacion o memorizacion por N-gram: la tabla de 51.200B parametros sugiere algun mecanismo de n-gramas, no documentado en detalle.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantizacion a 6,724 bits/peso estan disenados para ejecutarse en Macs con memoria unificada de 192 GB o superior; el objetivo es disponer de un modelo de 180B parametros en estacion de trabajo local sin GPU dedicada.
- Prototipado multimodal en local: la presencia de la torre de vision permite experimentar con tareas imagen-texto en entornos de desarrollo sobre macOS, siempre que se valide contra el modelo base original.
- Evaluacion de tecnicas de cuantizacion mixta: el repositorio sirve como referencia practica para estudiar el impacto de asignar 6, 8 y 16 bits por capa en un modelo grande, comparando la salida con el checkpoint BF16 de Qwen.
- Pruebas de decodificacion especulativa: la cabeza MTP conservada permite medir la ganancia de throughput de multi-token prediction en MLX frente a decodificacion autoregresiva clasica.
- Investigacion sobre tablas N-gram integradas: la tabla de 51.200B parametros es un objeto de estudio util para analizar como los n-gramas afectan la perplejidad y la memorizacion en modelos grandes.
- Despliegue de demostraciones internas: para equipos que ya trabajan en el ecosistema MLX, el checkpoint evita tener que cuantizar localmente el modelo base, ahorrando tiempo de conversion y almacenamiento intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint completo ocupa 151,298 GB (140,907 GiB) en disco; para cargarlo en memoria se necesita al menos esa cantidad mas el overhead del runtime MLX, por lo que en la practica se recomienda un Mac con 192 GB de memoria unificada o superior.
- GPU recomendadas: el formato MLX esta orientado a Apple Silicon (series M1, M2, M3 y M4, en configuraciones Ultra con memoria unificada alta). No esta pensado para GPUs NVIDIA.
- Cabe en consumer GPU: no. Un modelo de 180B parametros incluso a 6,7 bits/peso excede la VRAM de cualquier GPU de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Tampoco cabe en A100 de 80 GB ni en H100 de 80 GB en una sola unidad.
- Opciones de despliegue: MLX (libreria declarada) y oMLX para la cuantizacion; vLLM, llama.cpp, Ollama y TGI no soportan directamente pesos MLX de este tipo, por lo que no se pueden usar sin reconversion.
- Latencia y throughput: no disponible. La cabeza MTP sugiere optimizacion de decodificacion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ6e-mtp (este) | 180.000B | no disponible | MLX safetensors, 6,724 bits/peso | no disponible | Hugging Face, 645 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 180.000B (segun checkpoint derivado) | no disponible | no disponible | no disponible | Hugging Face (referenciado como base_model) |
| Alternativas de 180B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en formato MLX ni de sus especificaciones, por lo que la comparativa se limita al modelo base del que deriva este checkpoint.

## Limitaciones y advertencias

- Es un artefacto derivado, no oficial: la cuantizacion la realiza un tercero (scottlowry) con oMLX v0.7.4.dev1, sin validacion publicada por Qwen. La calidad respecto al BF16 original no esta medida en ningun benchmark accesible.
- Perdida de precision no cuantificada: la asignacion mixta de 6, 8 y 16 bits puede degradar tareas sensibles (matematicas, codigo, vision) sin que el autor documente evaluaciones de regresion.
- Versionado inestable: el autor recuantizo el modelo el 11 de noviembre de 2026 y pide redescargar; copias anteriores pueden producir salidas distintas con el mismo identificador.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Al derivar de Qwen/Qwen3.8-Flash-Next, habria que consultar la licencia del modelo base antes de cualquier despliegue productivo.
- Idiomas y contexto no documentados: no hay informacion sobre cobertura linguistica ni longitud de ventana, lo que impide planificar casos de uso con contexto largo.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje de este tamano; no hay datos especificos de evaluacion de factualidad.
- Sesgos: no documentados en la informacion disponible.
- Restricciones de plataforma: los pesos en formato MLX solo son utilizables en el ecosistema Apple; no hay conversion publicada a GGUF ni a safetensors estandar para vLLM.
- Trazabilidad limitada: la model card no incluye pipeline, licencia ni idiomas, y el repositorio tiene solo 2 likes y 645 descargas, lo que reduce la evidencia comunitaria sobre su comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-Flash-Next-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
