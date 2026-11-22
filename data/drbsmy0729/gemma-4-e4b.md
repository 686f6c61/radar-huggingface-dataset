# drbsmy0729/gemma-4-E4B

## Resumen

Gemma 4 E4B es un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4, publicada bajo licencia Apache 2.0. Se trata de la variante "effective 4B" de la gama densa pequena, disenada para ejecucion en dispositivo (telefonos de gama alta y portatiles) manteniendo capacidades de razonamiento, codigo y comprension multimodal. El modelo procesa texto, imagen y audio como entrada, y genera texto como salida.

La arquitectura combina atencion hibrida (sliding window local de 512 tokens intercalada con atencion global completa) y un mecanismo de Per-Layer Embeddings (PLE) que incrementa la eficiencia parametrica en despliegues on-device. El recuento efectivo de parametros es de aproximadamente 4.5B, aunque el total incluyendo embeddings asciende a unos 8B (7.996.156.490 segun los pesos en safetensors). La ventana de contexto alcanza los 128K tokens y el vocabulario es de 262K entradas.

Es relevante porque lleva a un formato desplegable en hardware de consumo capacidades que hasta hace poco requeran servidores: modo thinking configurable, soporte nativo de system prompt, function calling, agentes multi-paso y comprension de audio e imagen. La ficha se basa en la model card del autor y en los metadatos de Hugging Face; no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + global) y Per-Layer Embeddings (PLE) |
| Parametros totales | 7.996.156.490 (~8B, incluyendo embeddings); ~4.5B efectivos |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Mas de 140 idiomas (segun la model card de la familia) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Gemma 4 E4B es un transformer decoder-only denso de 42 capas con un mecanismo de atencion hibrida que intercala capas de atencion local con ventana deslizante de 512 tokens y capas de atencion global completa, garantizando que la capa final sea siempre global. Para optimizar memoria en contextos largos, las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens.

La innovacion principal del modelo es el uso de Per-Layer Embeddings (PLE): en lugar de anadir capas o parametros al decoder, cada capa recibe su propia tabla de embeddings por token. Estas tablas son grandes pero solo se consultan, lo que explica la diferencia entre los ~8B totales y los ~4.5B efectivos. El modelo incorpora ademas un codificador de vision de ~150M de parametros y un codificador de audio de ~300M. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto, razonamiento y codigo con modo thinking configurable.
- Comprension de imagen con soporte de relacion de aspecto y resolucion variables.
- Comprension de audio nativa (entrada de audio, salida de texto).
- Procesamiento de video como modalidad de entrada.
- Soporte nativo de function calling / tool calling.
- Capacidades agenticas y razonamiento multi-paso para flujos autonomos.
- Soporte multilingue en mas de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidad any-to-any segun el pipeline declarado (texto, imagen y audio de entrada).

## Casos de uso

- Asistente movil on-device: el modelo cabe en telefonos de gama alta gracias a sus ~4.5B parametros efectivos y PLE, permitiendo conversaciones multi-turno sin conexion con contexto de hasta 128K tokens.
- Atencion al cliente automatizada: gestiona conversaciones largas con historial extenso gracias a la ventana de 128K y al soporte nativo del rol `system` para fijar tono y politicas.
- Agentes autonomos con herramientas: el function calling nativo y el razonamiento multi-paso permiten construir agentes que consultan APIs, ejecutan busquedas y encadenan acciones en pipelines de automatizacion.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD como revisor o generador de parches, con modo thinking para tareas de razonamiento sobre el codigo.
- Analisis de documentos con imagen y audio: extraccion de informacion de capturas, formularios escaneados o notas de voz combinando las tres modalidades de entrada.
- Transcripcion y resumen de reuniones: el codificador de audio de ~300M permite procesar grabaciones y generar actas o resumenes estructurados localmente.
- Traduccion y atencion multilingue: cobertura de mas de 140 idiomas para herramientas de soporte o localizacion.
- Prototipado en portatil: despliegue en equipos de desarrollo sin GPU de servidor para iterar sobre prompts y flujos agenticos antes de escalar a modelos mayores de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con ~8B parametros totales, en fp16 requeriria del orden de 16 GB de VRAM, y en cuantizaciones de 8 o 4 bits se reduciria aproximadamente a la mitad o a un cuarto respectivamente (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Ejecucion en GPU de consumo: el modelo esta disenado explicitamente para despliegue on-device en telefonos de gama alta y portatiles, por lo que se espera que quepa en GPUs de consumo, aunque no se detallan modelos concretos.
- Opciones de despliegue: transformers (libreria declarada); no se confirman otros runners como vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Gemma 4 E4B | ~4.5B efectivos (~8B totales) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E2B | 2.3B efectivos (5.1B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11.95B | 256K | Texto, imagen, audio (sin encoders) | Apache 2.0 |
| Gemma 4 26B A4B MoE | 25.2B totales / 3.8B activos | 256K | Texto, imagen | Apache 2.0 |

La comparativa se limita a la propia familia Gemma 4 recogida en la model card; no se dispone de datos de rendimiento ni de comparaciones con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks que permitan validar el rendimiento real frente a alternativas.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan tasas ni mitigaciones especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La ventana de contexto es de 128K, la mitad que las variantes medias de la familia (256K).
- El modelo no genera audio ni imagen; la salida es exclusivamente texto pese a la etiqueta any-to-any del pipeline.
- La licencia declarada es Apache 2.0, pero la model card enlaza a una licencia especifica de Gemma 4 en ai.google.dev; conviene verificar los terminos exactos antes de uso comercial.
- El repositorio pertenece a un usuario distinto de Google (drbsmy0729) y no registra descargas ni likes; procede verificar la procedencia y autenticidad de los pesos antes de desplegarlo en produccion.
- No se detallan los tipos de cuantizacion soportados oficialmente.

## Enlaces

- Hugging Face: https://huggingface.co/drbsmy0729/gemma-4-E4B
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico: https://arxiv.org/abs/2607.02770
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma en DeepMind: https://deepmind.google/models/gemma/
