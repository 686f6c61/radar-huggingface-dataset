# jancirnodziewiaty/gemma-4-E4B-it-oQ5e-mtp

## Resumen

gemma-4-E4B-it-oQ5e-mtp es una cuantizacion mixta del modelo Gemma 4 E4B instruct, publicada por el usuario jancirnodziewiaty en HuggingFace. El checkpoint original ha sido procesado con la herramienta oQ (oMLX v0.7.3), que aplica cuantizacion de precision mixta por tensor con el objetivo de reducir el espacio en disco y la memoria necesaria sin degradar en exceso la calidad. El resultado es un checkpoint de 8.020 millones de parametros logicos almacenados en 5.985 GiB, con una media efectiva de 6,410 bits por peso.

El modelo esta pensado para ejecutarse en el ecosistema MLX de Apple, es decir, sobre chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). La libreria declarada es mlx y el formato de pesos es safetensors, por lo que no es directamente compatible con llama.cpp, vLLM ni Ollama sin conversion previa. El repositorio ocupa 6,5 GB e incluye, ademas del modelo de lenguaje, modulos de vision, audio y una cabeza MTP (multi-token prediction), lo que sugiere que el modelo original es multimodal.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantizacion mixta concreta (5, 6 y 8 bits mezclados con BF16 en capas selectivas) que puede servir de referencia para quien quiera replicar el proceso; por otro, advierte de que se trata de una publicacion de un tercero, con cero descargas y cero likes en el momento de la consulta, sin model card completa ni datos de evaluacion, por lo que su uso en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B), con modulos de vision, audio y cabeza MTP; no se detalla la configuracion interna |
| Parametros totales | 8.019.880.782 (8,020B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ: affine 5-bit grupo 64, affine 6-bit grupo 64, affine 8-bit grupo 64, BF16 e I64; media efectiva 6,410 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo Gemma 4 E4B instruct, cuya arquitectura interna no se describe en la informacion disponible. Por los datos del repositorio se puede afirmar que el modelo incluye cuatro componentes diferenciados: un modelo de lenguaje de 7,469B de parametros logicos, un modulo de vision de 0,167B, un modulo de audio de 0,305B y una cabeza MTP de 0,079B. La presencia de vision y audio confirma que el modelo original es multimodal, y la cabeza MTP apunta a decodificacion multi-token (multi-token prediction), una tecnica de decodificacion especulativa que permite generar varios tokens por paso del modelo base.

El proceso de cuantizacion aplicado por oQ asigna precision de forma no uniforme: el 77,964% de los pesos logicos (6,253B) se almacena en affine 5-bit con grupo 64, el 13,426% (1,077B) en 6-bit, el 1,732% (0,139B) en 8-bit y el 6,874% (0,551B) se mantiene en BF16. Esta distribucion sugiere que las capas mas sensibles (probablemente embeddings, cabezas de atencion o modulos multimodales) conservan mayor precision, mientras que el grueso de las matrices se comprime a 5 bits. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento en el modelo de lenguaje base (Gemma 4 E4B instruct), aunque sin datos de evaluacion publicados para esta cuantizacion concreta.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0,167B de parametros, lo que indica soporte de entrada de imagenes.
- Procesamiento de audio: incluye un modulo de audio de 0,305B de parametros, lo que indica soporte de entrada de audio.
- Decodificacion multi-token mediante la cabeza MTP de 0,079B, orientada a acelerar la generacion.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Prototipado local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 5.985 GiB, por lo que puede cargarse en un Mac con 16 GB de memoria unificada o superior para experimentar con un modelo multimodal sin depender de la nube.
- Pruebas de cuantizacion mixta: sirve como referencia para comparar la calidad de una receta oQ de 6,410 bits/peso frente al modelo original en BF16, midiendo la degradacion en tareas concretas.
- Experimentacion con decodificacion especulativa: la cabeza MTP incluida permite probar tecnicas de generacion multi-token en el ecosistema MLX y medir el incremento de throughput.
- Aplicaciones multimodales de escritorio: al incluir vision y audio, puede integrarse en herramientas locales de Mac que necesiten describir imagenes o transcribir audio junto con texto, siempre que se valide la calidad del checkpoint cuantizado.
- Investigacion sobre eficiencia de memoria: util para estudiar como se distribuye el almacenamiento entre componentes (lenguaje 4,957 GiB, vision 0,312 GiB, audio 0,568 GiB, MTP 0,148 GiB) y disenar estrategias de offloading.
- Evaluacion comparativa de checkpoints comunitarios: como publicacion de un tercero sin benchmarks, es un caso de estudio sobre los riesgos de adoptar cuantizaciones no verificadas en pipelines de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 5.985 GiB en disco; en inferencia se necesita al menos esa cantidad mas overhead de activaciones y cache KV, por lo que se recomienda un minimo de 8-10 GB de memoria disponible.
- Hardware objetivo: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra) por el uso de la libreria MLX; no es compatible de forma nativa con GPU NVIDIA.
- Cabe en GPU consumer: si, en Mac con 16 GB de memoria unificada o superior; en el ecosistema NVIDIA requeriria conversion de formato y no esta soportado oficialmente por esta publicacion.
- Opciones de despliegue: MLX (libreria declarada), oMLX como herramienta de cuantizacion; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la presencia de la cabeza MTP sugiere optimizacion para generacion multi-token, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E4B-it-oQ5e-mtp | 8,020B | no disponible | safetensors MLX | no disponible | HuggingFace (0 descargas) |
| Gemma 4 E4B original (BF16) | no disponible en la informacion | no disponible | safetensors | no disponible | no disponible en la informacion |
| Otras cuantizaciones comunitarias de Gemma 4 E4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas concretas en parametros, contexto o rendimiento; los datos del modelo original y de otras cuantizaciones no estan incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- Publicacion de un tercero: el autor es jancirnodziewiaty, no el equipo de Gemma, por lo que no hay garantia de fidelidad respecto al modelo original.
- Sin benchmarks ni evaluacion: no se aportan metricas de calidad, por lo que la degradacion introducida por la cuantizacion mixta es desconocida.
- Licencia no especificada: no se indica la licencia del checkpoint ni la del modelo base, lo que impide confirmar si el uso comercial esta permitido; hay que consultar la licencia de Gemma 4 E4B original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion especifica no se puede acotar el impacto de la cuantizacion en este aspecto.
- Sesgos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se indican, por lo que no se puede planificar su uso multilingue o con documentos largos.
- Compatibilidad restringida: formato MLX, solo para Apple Silicon; no usable directamente en infraestructura NVIDIA ni en servidores x86 convencionales.
- Madurez: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia (2026-11-02), sin historial de uso ni mantenimiento.
- Componentes multimodales cuantizados: vision y audio se almacenan en 5-8 bits, lo que puede degradar tareas perceptivas de forma distinta al texto.

## Enlaces

- HuggingFace: https://huggingface.co/jancirnodziewiaty/gemma-4-E4B-it-oQ5e-mtp
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Gemma 4 E4B: no disponible en la informacion proporcionada
- Paper, blog o demo del modelo original: no disponible en la informacion proporcionada
