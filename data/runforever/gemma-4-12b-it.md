# Runforever/gemma-4-12B-it

## Resumen

Gemma 4 12B Unified es un modelo multimodal de Google DeepMind publicado bajo licencia Apache 2.0, distribuido en Hugging Face por el usuario Runforever como fine-tune de instrucciones sobre `google/gemma-4-12B`. Forma parte de la familia Gemma 4, que incluye variantes densas (E2B, E4B, 12B, 31B) y una variante Mixture-of-Experts (26B A4B). El modelo resuelve la necesidad de un sistema multimodal de tamano medio capaz de ejecutarse en GPUs de consumo y estaciones de trabajo, procesando texto, imagen, audio y video sin encoders separados.

La innovacion principal es su arquitectura "unified" o encoder-free: en lugar de emplear encoders dedicados de vision y audio como el resto de la familia, proyecta directamente parches de imagen y formas de onda de audio al espacio de embeddings del transformer mediante capas lineales ligeras. Esto reduce la latencia multimodal y permite fine-tuning completo en una sola pasada sobre todas las modalidades.

Con 11.959.730.224 parametros (11,95B), 48 capas, ventana de contexto de 256K tokens y vocabulario de 262K, el modelo se posiciona como una opcion intermedia entre los modelos de bolsillo (E2B, E4B) y las variantes de servidor (26B A4B, 31B). Su soporte nativo de system prompt, function calling y modos de razonamiento configurables lo orienta a flujos agenticos y despliegues locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atencion hibrida (sliding window local + atencion global), encoder-free multimodal |
| Parametros totales | 11.959.730.224 (11,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Mas de 140 idiomas (segun model card de la familia Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos tecnicos: 48 capas, sliding window de 1024 tokens, vocabulario de 262K tokens, tamano del repositorio 24,0 GB, modalidades soportadas texto, imagen, audio y video.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only densa con un mecanismo de atencion hibrido que intercala atencion local de ventana deslizante (1024 tokens) con atencion global completa, garantizando que la capa final sea siempre global. Para optimizar memoria en contextos largos, las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE). La innovacion "unified" consiste en eliminar los encoders dedicados de vision y audio: los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings del LLM mediante capas lineales ligeras, de modo que todas las modalidades fluyen por un unico transformer decoder-only. Esto permite fine-tuning completo en una sola pasada y reduce la latencia multimodal.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card de la familia Gemma 4 menciona variantes preentrenadas e instruction-tuned, modos de razonamiento configurables y soporte nativo del rol `system`, pero no detalla el pipeline de alineamiento. El modelo base es `google/gemma-4-12B`, y esta ficha corresponde a un fine-tune de instrucciones publicado por el usuario Runforever.

## Capacidades

- Generacion de texto con razonamiento configurable (thinking modes) en todas las variantes de la familia.
- Comprension de imagen con soporte de relacion de aspecto y resolucion variables.
- Comprension de audio nativa (sin encoder separado) en las variantes E2B, E4B y 12B.
- Comprension de video como modalidad de entrada.
- Generacion de codigo con mejoras notables en benchmarks de programacion segun la model card.
- Soporte nativo de function calling / tool calling.
- Capacidades agenticas y razonamiento multi-paso para flujos autonomos.
- Soporte multilingue en mas de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Salida exclusivamente de texto (pipeline any-to-any con entrada multimodal y salida textual).

## Casos de uso

- Atencion al cliente multimodal: el modelo puede recibir capturas de pantalla, audios de clientes o imagenes de productos junto con texto y mantener conversaciones multi-turno gracias a su ventana de 256K tokens, adecuada para historiales largos e incidencias documentadas con adjuntos.
- Asistentes locales en estacion de trabajo: con 11,95B parametros y arquitectura encoder-free, puede desplegarse en una GPU de consumo alta (por ejemplo, RTX 4090) para asistentes personales que procesan texto, imagen y audio sin depender de la nube.
- Transcripcion y analisis de reuniones: la entrada de audio nativa permite procesar grabaciones y generar resumenes, actas y elementos de accion en una sola pasada, sin pipeline separado de ASR.
- Agentes autonomos con tool calling: el soporte nativo de function calling y razonamiento multi-paso lo hace apto para orquestar APIs, consultar bases de datos y ejecutar tareas encadenadas en entornos de automatizacion.
- Generacion y revision de codigo en produccion: puede integrarse en pipelines de CI/CD para revision de parches, generacion de tests y explicacion de errores, apoyandose en su capacidad de codigo y en el modo de razonamiento configurable.
- Analisis de documentos con imagenes: procesamiento de facturas, formularios escaneados o capturas de pantalla combinando vision y texto en un unico modelo, util para digitalizacion y extraccion de datos estructurados.
- Traduccion y localizacion multilingue: con soporte de mas de 140 idiomas, adecuado para traduccion de contenido, subtitulado y adaptacion de documentacion tecnica.
- Procesamiento de video para monitorizacion o catalogacion: la entrada de video permite describir escenas, extraer eventos y generar metadatos en flujos de archivo y busqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 11,95B parametros en precision completa (bf16/fp16) requiere aproximadamente 24 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 12-14 GB y en 4 bits unos 7-8 GB, aunque estas cifras no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: no especificadas en la informacion. Por tamano, cabria esperar viabilidad en GPUs de 24 GB o mas (RTX 4090, A10G, L4 en cuantizacion) y en A100/H100 para precision completa y contextos largos.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) en cuantizacion, y en GPUs de 16 GB solo con cuantizaciones agresivas; no confirmado oficialmente.
- Opciones de despliegue: la model card declara compatibilidad con `transformers` y `endpoints_compatible`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B Unified (este) | 11,95B | 256K | Texto, imagen, audio, video | Apache 2.0 | Encoder-free, 48 capas |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | Con encoders dedicados (~150M vision, ~300M audio) |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | Con encoder de vision (~550M), sin audio |
| Gemma 4 26B A4B MoE | No detallado en la informacion | No disponible | No disponible | Apache 2.0 | Variante Mixture-of-Experts |

La comparativa se limita a la propia familia Gemma 4 porque la informacion proporcionada no incluye datos de rendimiento ni de modelos competidores de otros fabricantes. No hay datos de benchmarks que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- El modelo es un fine-tune publicado por un tercero (Runforever) sobre `google/gemma-4-12B`; no hay informacion sobre el dataset de instrucciones utilizado, el proceso de alineamiento ni validacion de calidad del fine-tune.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validacion por parte de la comunidad.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones especificas de fidelidad para este fine-tune.
- No se dispone de informacion sobre sesgos conocidos ni sobre evaluaciones de seguridad del fine-tune concreto.
- Aunque la licencia declarada es Apache 2.0, la model card enlaza a la licencia especifica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); conviene verificar los terminos reales antes de uso comercial, ya que la familia Gemma historicamente ha usado su propia licencia con restricciones de uso aceptable.
- El soporte de idiomas se hereda de la familia (mas de 140), pero no se ha verificado el rendimiento del fine-tune en castellano ni en idiomas distintos del ingles.
- La cuantizacion y el despliegue eficiente (GGUF, vLLM) no estan confirmados para este modelo concreto; la libreria declarada es solo `transformers`.
- La ventana de 256K tokens implica un coste de memoria de cache KV considerable en inferencia de contexto largo; no se han publicado mediciones de rendimiento en esa configuracion.
- El modelo es encoder-free, lo que segun la model card reduce latencia multimodal, pero no hay datos publicados que cuantifiquen esa mejora frente a las variantes con encoders.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Runforever/gemma-4-12B-it
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma en DeepMind: https://deepmind.google/models/gemma/
