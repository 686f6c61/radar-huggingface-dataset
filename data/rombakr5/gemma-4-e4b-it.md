# Rombakr5/gemma-4-E4B-it

## Resumen

Gemma 4 E4B-it es la variante instructiva del modelo E4B de la familia Gemma 4, desarrollada por Google DeepMind y publicada con pesos abiertos bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo *any-to-any* que acepta texto, imagen y audio como entrada y genera texto como salida, disenado especificamente para despliegue en dispositivos de borde como portatiles y telefonos de gama alta. El repositorio analizado, Rombakr5/gemma-4-E4B-it, es una publicacion derivada del modelo base google/gemma-4-E4B con 7.996.156.490 parametros totales en safetensors (aproximadamente 8B, coherente con los 4.5B efectivos mas las tablas de embeddings).

La arquitectura emplea atencion hibrida que intercala ventanas deslizantes locales de 512 tokens con atencion global completa, garantizando que la capa final sea siempre global, y aplica Proportional RoPE (p-RoPE) junto con claves y valores unificados en las capas globales para reducir el consumo de memoria en contextos largos. El modelo incorpora Per-Layer Embeddings (PLE), una tecnica que asigna a cada capa del decodificador su propia tabla de embeddings por token, lo que explica la diferencia entre parametros efectivos y totales.

Su relevancia actual radica en que combina una ventana de contexto de 128K tokens, soporte nativo de mas de 140 idiomas, modos de razonamiento configurables (*thinking modes*), soporte nativo del rol `system` y function calling, todo ello en un tamano que cabe en GPU de consumo. Esto lo posiciona como una opcion practica para agentes locales, asistentes multimodales en dispositivo y pipelines de codigo con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida (sliding window local + atencion global), Per-Layer Embeddings (PLE) y p-RoPE |
| Parametros totales | 7.996.156.490 (~8B en safetensors); 4.5B efectivos segun model card |
| Parametros activos | No aplica (variante densa; el MoE de la familia es 26B A4B) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato base safetensors en bf16/fp16 presumiblemente; no confirmado) |
| Idiomas soportados | Mas de 140 idiomas segun la model card de la familia Gemma 4; lista concreta no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia especifica de Gemma 4) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 42 capas con ventana deslizante de 512 tokens y vocabulario de 262K tokens. La innovacion principal es la atencion hibrida: las capas alternan atencion local de ventana deslizante con atencion global completa, y la ultima capa es siempre global, lo que permite procesar contexto largo con un coste de memoria contenido. Las capas globales usan claves y valores unificados y Proportional RoPE (p-RoPE) para optimizar el uso de memoria en secuencias largas. Ademas, incorpora Per-Layer Embeddings (PLE): cada capa del decodificador dispone de su propia tabla de embeddings por token, lo que eleva el recuento total de parametros (~8B) muy por encima de los parametros efectivos (4.5B), ya que estas tablas solo se consultan y no participan en el computo denso.

En el plano multimodal, el modelo integra un codificador de vision de aproximadamente 150M de parametros y un codificador de audio de aproximadamente 300M, que proyectan las entradas al espacio de embeddings del LLM. La model card de la familia indica que los modelos se publican en variantes preentrenada e instructiva, con soporte de razonamiento configurable, pero no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO. Esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto, razonamiento y codigo con modos de pensamiento configurables (*thinking modes*).
- Entrada multimodal: texto, imagen (con soporte de relacion de aspecto y resolucion variables) y audio de forma nativa.
- Salida exclusivamente de texto (pipeline *any-to-any* en Hugging Face, pero la generacion es textual).
- Function calling / tool calling nativo, orientado a flujos agenticos.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingues en mas de 140 idiomas.
- Razonamiento multi-paso y flujos de agente autonomo.
- Disenado para ejecucion en dispositivo (telefonos de gama alta, portatiles) gracias a su huella de parametros efectivos.

## Casos de uso

- Asistentes multimodales en dispositivo: el modelo puede procesar imagenes y audio capturados por el usuario (por ejemplo, una foto de un documento o una nota de voz) y responder en texto, todo ello sin salir del telefono o portatil gracias a sus 4.5B parametros efectivos y su contexto de 128K tokens.
- Atencion al cliente automatizada: con 128K tokens de contexto y soporte nativo del rol `system`, puede mantener conversaciones multi-turno con historial extenso, politicas de empresa inyectadas en el prompt de sistema y respuestas coherentes en mas de 140 idiomas.
- Agentes autonomos con tool calling: integrado en orquestadores de agentes, el modelo puede invocar APIs, consultar bases de datos y encadenar pasos de razonamiento, apoyandose en los *thinking modes* configurables para equilibrar latencia y calidad.
- Generacion y revision de codigo en pipelines de CI/CD: su soporte de function calling permite conectarlo a herramientas de analisis estatico, ejecutar tests y proponer parches; el contexto de 128K facilita revisar repositorios o ficheros extensos.
- Transcripcion y analisis de audio en local: el codificador de audio de ~300M permite resumir reuniones, extraer acciones de grabaciones o responder preguntas sobre audio sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Procesamiento de documentos escaneados: combinando vision y contexto largo, puede extraer informacion estructurada de facturas, contratos o formularios con relacion de aspecto variable y devolver JSON mediante tool calling.
- Despliegue en portatiles para prototipado e investigacion: al caber en GPU de consumo, sirve como banco de pruebas para experimentos de ajuste fino multimodal o evaluacion de agentes sin coste de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del tamano (8B parametros totales), en bf16/fp16 se requeririan aproximadamente 16 GB solo para pesos, mas overhead de KV cache y codificadores; en cuantizacion de 8 bits ~8-9 GB y en 4 bits ~5-6 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano, una RTX 4090 (24 GB) o A100/H100 permitirian inferencia en precision completa; GPU de consumo con 12-16 GB podrian servir con cuantizacion.
- Cabe en GPU de consumo: previsiblemente si con cuantizacion en GPUs de 8-16 GB, aunque el dato no esta confirmado en la model card.
- Opciones de despliegue: la model card solo confirma compatibilidad con `transformers`. El tag `endpoints_compatible` sugiere soporte en Hugging Face Inference Endpoints. Soporte explicito de vLLM, llama.cpp, Ollama o TGI no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 E4B-it (este) | 4.5B efectivos / ~8B totales | 128K | Texto, imagen, audio | Apache 2.0 | Ventana deslizante 512, PLE, thinking modes |
| Gemma 4 E2B | 2.3B efectivos / 5.1B totales | 128K | Texto, imagen, audio | Apache 2.0 | Menor huella, misma familia |
| Gemma 4 12B Unified | 11.95B | 256K | Texto, imagen, audio | Apache 2.0 | Arquitectura sin codificadores (encoder-free) |
| Gemma 4 26B A4B MoE | 25.2B totales / 3.8B activos | 256K | Texto, imagen | Apache 2.0 | Solo 8 expertos activos de 128 |

No se dispone de datos de rendimiento comparado (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas con alternativas de otros fabricantes.

## Limitaciones y advertencias

- El repositorio Rombakr5/gemma-4-E4B-it registra 0 descargas y 0 likes en el momento de la consulta; se trata de una publicacion derivada sin validacion comunitaria conocida.
- No se detalla en la informacion proporcionada si este repositorio concreto introduce ajustes adicionales sobre el modelo base google/gemma-4-E4B; el autor figura como Rombakr5 y el pipeline declarado es *any-to-any*.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones especificas de fidelidad para esta variante.
- Sesgos conocidos: no documentados en la informacion disponible; la model card de la familia no incluye una seccion de sesgos para esta variante.
- La lista completa de idiomas soportados no esta disponible; solo se indica "mas de 140 idiomas" a nivel de familia.
- Aunque la licencia declarada es Apache 2.0, el campo `license_link` apunta a la licencia especifica de Gemma 4, por lo que conviene revisar los terminos exactos antes de un uso comercial.
- No hay informacion sobre cuantizaciones oficiales ni sobre soporte en motores de inferencia distintos de `transformers`, lo que puede limitar el despliegue en produccion sin trabajo adicional de conversion.
- El contexto de 128K es inferior al de las variantes 12B, 26B y 31B de la misma familia (256K).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Rombakr5/gemma-4-E4B-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
