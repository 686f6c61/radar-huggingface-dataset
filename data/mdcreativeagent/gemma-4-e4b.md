# mdcreativeagent/gemma-4-E4B

## Resumen

Gemma 4 E4B es un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4, publicada como pesos abiertos bajo licencia Apache 2.0. Este repositorio concreto (`mdcreativeagent/gemma-4-E4B`) es una réplica subida por un tercero de los pesos oficiales del modelo E4B. El modelo procesa entradas de texto, imagen y audio, y genera salida de texto, con una ventana de contexto de 128K tokens y soporte para más de 140 idiomas.

El E4B forma parte de la gama de modelos pequenos optimizados para ejecución en dispositivo ("on-device"), desde moviles hasta portatiles. La "E" indica parametros efectivos: el modelo declara 4,5B parametros efectivos y 8B contando las tablas de embeddings, que coinciden con los 7.996.156.490 parametros reales almacenados en safetensors. Incorpora Per-Layer Embeddings (PLE) para maximizar la eficiencia sin anadir capas adicionales.

La relevancia de este modelo radica en combinar razonamiento configurable (modos de "thinking"), soporte nativo de function calling y una arquitectura de atencion hibrida que intercala atencion local de ventana deslizante con atencion global, manteniendo la ultima capa siempre global. Esto permite despliegues multimodales ligeros con contexto largo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con atencion hibrida (sliding window local + atencion global), Per-Layer Embeddings (PLE) y p-RoPE en capas globales |
| Parametros totales | 4,5B efectivos / 8B con embeddings (7.996.156.490 reales en safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors |

Otros datos tecnicos: 42 capas, ventana deslizante de 512 tokens, vocabulario de 262K tokens, encoder de vision de ~150M parametros y encoder de audio de ~300M parametros.

## Arquitectura y entrenamiento

El E4B es un transformer denso decoder-only de 42 capas. Su mecanismo de atencion es hibrido: intercala capas con atencion local de ventana deslizante (512 tokens) y capas con atencion global, garantizando que la capa final sea siempre global. Las capas globales emplean claves y valores unificados junto con Proportional RoPE (p-RoPE) para reducir el consumo de memoria en contextos largos. El modelo incorpora Per-Layer Embeddings (PLE): cada capa del decoder dispone de su propia tabla de embeddings por token, grande pero de solo consulta rapida, lo que explica la diferencia entre parametros efectivos (4,5B) y totales con embeddings (8B).

La multimodalidad se resuelve con encoders dedicados: uno de vision de ~150M parametros y otro de audio de ~300M parametros, que proyectan las entradas al espacio del LLM. El modelo se distribuye en variantes preentrenada e instruction-tuned. La model card menciona razonamiento con modos de "thinking" configurables, soporte nativo del rol `system` y mejoras en capacidades de codigo y agenticas, pero no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO. Estos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modos de "thinking" configurables.
- Comprension de imagenes con soporte de relacion de aspecto y resolucion variables.
- Comprension de audio nativa (el E4B incluye encoder de audio de ~300M parametros).
- Procesamiento de video (la familia Gemma 4 lo soporta; la tabla de modelos lista texto, imagen y audio para el E4B).
- Generacion de codigo y tareas de programacion.
- Function calling / tool calling nativo, orientado a flujos agenticos.
- Razonamiento multi-paso para agentes autonomos.
- Soporte multilingue en mas de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidad de ejecucion en dispositivo (moviles, portatiles) gracias a su tamano reducido.

## Casos de uso

- Asistentes locales en movil o portatil: el modelo cabe en dispositivos de gama alta gracias a sus 4,5B parametros efectivos y su diseno on-device, permitiendo asistentes privados sin conexion que procesan texto, imagen y audio.
- Transcripcion y analisis de audio en el borde: con su encoder de audio nativo, puede resumir reuniones o responder preguntas sobre grabaciones sin enviar datos a la nube.
- Atencion al cliente multimodal: gestion de conversaciones multi-turno con contexto de hasta 128K tokens, aceptando capturas de pantalla o fotos de productos enviadas por el usuario.
- Agentes automatizados con tool calling: integracion en pipelines donde el modelo decide que funciones invocar (APIs, busquedas, calculos) gracias al soporte nativo de function calling y razonamiento multi-paso.
- Asistencia a la programacion en IDE: generacion y explicacion de codigo con contexto largo para incluir varios ficheros, aprovechando las mejoras en benchmarks de codigo de la familia.
- Analisis de documentos escaneados y formularios: extraccion de informacion de imagenes con relacion de aspecto variable, util en digitalizacion de facturas o archivos.
- Traduccion y procesamiento multilingue: cobertura de mas de 140 idiomas para localizacion de contenido o moderacion en entornos internacionales.
- Prototipado e investigacion: al ser pesos abiertos Apache 2.0, sirve para fine-tuning completo o experimental en laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano, los pesos en safetensors ocupan unos 16 GB en el repositorio (probablemente en bf16/fp16); en cuantizaciones de 8 bits o 4 bits el consumo se reduciria sustancialmente, pero no se han confirmado formatos GGUF ni cuantizaciones publicadas en la informacion proporcionada.
- GPU recomendadas: no especificadas oficialmente. Por tamano, una GPU de 24 GB (RTX 4090, A10G, L4) seria el minimo comodo para precision completa; para cuantizacion agresiva podria caber en GPUs de 8-12 GB, aunque esto no esta confirmado.
- Cabe en consumer GPU: probablemente si en GPUs de gama alta de escritorio, dado que el modelo esta disenado para portatiles y moviles; sin datos oficiales de VRAM no se puede garantizar.
- Opciones de despliegue: la model card indica compatibilidad con `transformers` y con endpoints; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E2B | 2,3B efectivos (5,1B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 26B A4B MoE | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Apache 2.0 |

La informacion proporcionada solo permite comparar dentro de la propia familia Gemma 4. No hay datos de rendimiento ni de modelos de otros fabricantes (por ejemplo, Llama o Qwen) en la documentacion disponible, por lo que no se puede establecer una comparativa de rendimiento con alternativas externas.

## Limitaciones y advertencias

- Este repositorio es una replica subida por un tercero (`mdcreativeagent`), no el repositorio oficial de Google. Conviene verificar la integridad de los pesos y preferir la coleccion oficial de Google en Hugging Face para uso en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la model card no documenta tasas de error ni evaluaciones de fidelidad.
- Sesgos conocidos: no documentados en la informacion proporcionada; deben asumirse los sesgos tipicos de los datos web de entrenamiento.
- Aunque la licencia declarada es Apache 2.0, la model card enlaza a la licencia especifica de Gemma 4 de Google; es recomendable revisar ese documento antes de un uso comercial, ya que puede contener terminos adicionales.
- El contexto de 128K es inferior al de los modelos medianos de la familia (256K), lo que limita tareas de contexto muy largo.
- No hay informacion sobre cuantizaciones oficiales ni soporte confirmado en runtimes de inferencia populares (llama.cpp, vLLM), lo que puede complicar el despliegue optimizado.
- El modelo esta optimizado para dispositivo; en servidores de alta concurrencia puede no ser la opcion mas eficiente frente a variantes mayores de la familia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mdcreativeagent/gemma-4-E4B
- Coleccion oficial Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
