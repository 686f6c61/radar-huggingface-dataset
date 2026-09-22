# nwtgck/gemma-4-E4B-it-qat-q4_0-gguf

## Resumen

El modelo `nwtgck/gemma-4-E4B-it-qat-q4_0-gguf` es una conversion a formato GGUF con cuantizacion Q4_0 del checkpoint instruction-tuned Gemma 4 E4B optimizado mediante Quantization-Aware Training (QAT). El modelo original lo desarrolla Google DeepMind dentro de la familia Gemma 4, publicada bajo licencia Apache 2.0, y esta reempaquetado por el usuario nwtgck a partir del checkpoint sin cuantizar `google/gemma-4-E4B-it-qat-q4_0-unquantized`. Su proposito es ofrecer un artefacto listo para desplegar en el ecosistema GGUF (llama.cpp, Ollama, LM Studio) conservando una calidad cercana a bfloat16 y reduciendo de forma notable los requisitos de memoria.

La variante E4B pertenece al segmento de modelos pequenos orientados a ejecucion local: 4,5B de parametros efectivos y 8B contando las tablas de embeddings, con 42 capas, ventana de atencion local de 512 tokens y una longitud de contexto de 128K tokens. El repositorio declara 7.463.013.674 parametros en los metadatos de safetensors y un tamano total de 6,1 GB. Es un modelo multimodal (texto, imagen y audio de entrada; texto de salida) con soporte nativo de *system prompt*, *function calling* y modos de razonamiento configurables.

Su relevancia actual radica en que combina tres elementos poco frecuentes en el segmento de menos de 10B: QAT aplicado desde el entrenamiento (no cuantizacion *post-hoc*), capacidades multimodales con codificadores de vision (~150M) y audio (~300M), y contexto de 128K tokens. Esto lo posiciona para despliegues en portatiles, moviles de gama alta y GPUs de consumo, donde la huella de memoria es el factor limitante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atencion hibrida (sliding window local de 512 tokens intercalada con atencion global; la ultima capa es siempre global), Per-Layer Embeddings (PLE) y Proportional RoPE (p-RoPE) en las capas globales |
| Parametros totales | 7.463.013.674 (~7,46B) segun metadatos de safetensors; la model card indica 4,5B efectivos y 8B contando embeddings |
| Parametros activos | No aplica: la variante E4B es densa. La arquitectura MoE de la familia corresponde al modelo 26B A4B |
| Longitud de contexto | 128K tokens (los modelos pequenos de la familia; los medianos alcanzan 256K) |
| Tipos de cuantizacion | Este repositorio: GGUF Q4_0. El pipeline QAT de Gemma 4 tambien publica wNa8o8 (optimizado para movil) y w4a16 en formato compressed-tensors |
| Idiomas soportados | Mas de 140 idiomas segun la model card; el listado explicito no esta disponible |
| Licencia | Apache 2.0 (el campo `license_link` apunta a la licencia especifica de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | GGUF (Q4_0); el checkpoint base sin cuantizar esta en safetensors |

Datos adicionales del repositorio: pipeline declarado `any-to-any`, 0 descargas y 0 likes en el momento de la consulta, creado el 22 de septiembre de 2026, region US, compatible con endpoints.

## Arquitectura y entrenamiento

Gemma 4 E4B es un transformer denso multimodal con un esquema de atencion hibrida: la mayoria de capas emplean atencion local de ventana deslizante de 512 tokens y unas pocas capas aplican atencion global completa, garantizando que la capa final sea siempre global. Este diseno busca el coste computacional y de memoria de un modelo ligero sin perder acceso a dependencias de largo alcance en tareas de contexto extendido. Para reducir el consumo de memoria en contextos largos, las capas globales unifican claves y valores y aplican Proportional RoPE (p-RoPE). Ademas, el modelo incorpora Per-Layer Embeddings (PLE), un mecanismo que reparte tablas de embeddings por capa para maximizar la eficiencia de parametros en despliegues *on-device*; de ahi la distincion entre parametros efectivos (4,5B) y parametros totales con embeddings (8B). El vocabulario es de 262K tokens y la torre multimodal incluye un codificador de vision de aproximadamente 150M de parametros y un codificador de audio de aproximadamente 300M.

El checkpoint base de esta conversion ha pasado por Quantization-Aware Training con esquema Q4_0, lo que permite simular la cuantizacion durante el entrenamiento y conservar una calidad cercana a bfloat16 tras la conversion a 4 bits. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO especificas. Si se confirman las siguientes caracteristicas declaradas: razonamiento con modos de pensamiento configurables, soporte nativo del rol `system` y *function calling* nativo. Un requisito operativo destacable es que, si se usa decodificacion especulativa con un modelo asistente (*drafter*) junto a un modelo QAT, el asistente debe ser tambien un checkpoint QAT con la misma precision para garantizar la compatibilidad.

## Capacidades

- Generacion de texto conversacional multi-turno con soporte nativo del rol `system`, lo que permite fijar instrucciones persistentes y estructurar el comportamiento del agente.
- Razonamiento con modos de pensamiento configurables (*thinking modes*), activables o desactivables segun el coste de latencia que se tolere.
- Procesamiento de imagen con soporte de relacion de aspecto y resolucion variable, ademas de video, en todos los modelos de la familia.
- Entrada de audio nativa en las variantes E2B, E4B y 12B, con codificador dedicado de aproximadamente 300M de parametros.
- *Function calling* nativo y capacidades agenticas mejoradas, orientadas a flujos autonomos de varios pasos.
- Generacion y asistencia en codigo, con mejoras declaradas en benchmarks de programacion respecto a generaciones anteriores.
- Cobertura multilingue en mas de 140 idiomas declarados.
- Capacidad multimodal de tipo *any-to-any* en el pipeline declarado (entrada de texto, imagen y audio; salida de texto).
- Compatibilidad con decodificacion especulativa mediante modelo asistente, siempre que este sea QAT y de la misma precision.

## Casos de uso

- Asistente personal en portatil sin GPU dedicada: con pesos Q4_0 el modelo ocupa del orden de 4-5 GB, por lo que puede ejecutarse integramente en CPU o con aceleracion parcial mediante llama.cpp u Ollama, manteniendo conversaciones multilingues y lectura de imagenes.
- Atencion al cliente automatizada: el contexto de 128K tokens permite mantener el historial completo de una incidencia larga y adjuntar documentacion de referencia sin truncar; el soporte nativo de `system` facilita fijar el tono, las politicas y los limites de actuacion.
- Extraccion de datos de documentos escaneados: la entrada de imagen con resolucion variable permite procesar facturas, albaranes o capturas de pantalla y devolver campos estructurados, con *function calling* para escribir el resultado en un sistema externo.
- Analisis de llamadas y reuniones: el codificador de audio habilita transcribir o resumir directamente el audio de entrada, y el contexto largo permite procesar sesiones completas sin trocear en exceso.
- Agentes de automatizacion con herramientas: el *function calling* nativo y el razonamiento multi-paso permiten construir agentes que consultan APIs, ejecutan busquedas y encadenan acciones, con modos de pensamiento activables solo cuando la tarea lo requiera.
- Asistencia de programacion en el IDE: generacion y explicacion de codigo con un modelo que cabe en una GPU de consumo, ejecutable en local para evitar enviar codigo propietario a servicios externos.
- Procesamiento por lotes en entornos con restricciones de memoria: al ser un GGUF Q4_0 de 6,1 GB, permite desplegar varias instancias por nodo o en GPUs de gama media donde una variante en bfloat16 no cabria.
- Investigacion sobre QAT: al derivar del checkpoint `q4_0-unquantized`, sirve como referencia para estudiar la degradacion real entre el pipeline de entrenamiento consciente de cuantizacion y el artefacto final en GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona de forma cualitativa mejoras en razonamiento, codigo y capacidades agenticas, y el repositorio referencia el informe tecnico arXiv:2607.02770, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion en los datos proporcionados. La busqueda web realizada no devolvio resultados relevantes (unicamente enlaces genericos a YouTube), por lo que tampoco se han podido recoger mediciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en Q4_0 de un modelo de ~7,46B parametros ocupan aproximadamente 4,2-4,5 GB; sumando codificadores de vision y audio y cache KV, un despliegue practico parte de unos 5-6 GB de memoria para contextos cortos, con crecimiento adicional al acercarse a los 128K tokens. Estas cifras son estimaciones calculadas a partir del numero de parametros y del esquema de cuantizacion, no datos publicados por el autor.
- Tamano del repositorio: 6,1 GB, segun los metadatos de HuggingFace.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM puede ejecutar el modelo en Q4_0; una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB ofrecen margen sobrado para contexto largo. En el segmento profesional, una A100 o H100 no aportan ventaja en cuanto a capacidad de carga, solo en throughput por lotes.
- Cabe en GPU de consumo: si explicitamente, en tarjetas de 8 GB en adelante con contexto moderado.
- Ejecucion en CPU y movil: la familia Gemma 4 esta disenada para despliegue *on-device*; la variante E4B es una de las que cuenta con formato especifico wNa8o8 para hardware movil con capas de decodificacion de 2 bits y cache KV optimizada.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para el artefacto GGUF; el pipeline QAT de la familia publica ademas checkpoints w4a16 en formato compressed-tensors para inferencia optimizada con vLLM. El repositorio esta marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Modalidades | Arquitectura | Licencia |
|---|---|---|---|---|---|---|
| Gemma 4 E4B (esta ficha) | 4,5B efectivos / 8B con embeddings | 42 | 128K | Texto, imagen, audio | Densa | Apache 2.0 |
| Gemma 4 E2B | 2,3B efectivos / 5,1B con embeddings | 35 | 128K | Texto, imagen, audio | Densa | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | 48 | 256K | Texto, imagen, audio | Densa | Apache 2.0 |
| Gemma 4 31B Dense | 30,7B | 60 | 256K | Texto, imagen | Densa | Apache 2.0 |
| Gemma 4 26B A4B | No disponible | No disponible | No disponible | No disponible | MoE | Apache 2.0 |

La comparativa se limita a variantes de la propia familia Gemma 4, ya que la informacion proporcionada no incluye datos de modelos de otros fabricantes en el mismo rango de parametros. No se dispone de cifras de rendimiento para ninguno de estos modelos en la informacion consultada, por lo que la comparacion se restringe a parametros, contexto, modalidades y licencia.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks para este checkpoint, por lo que no es posible verificar de forma independiente la afirmacion de calidad cercana a bfloat16 tras QAT.
- La cuantizacion Q4_0 es agresiva y puede degradar tareas sensibles a la precision numerica, como aritmetica exacta, generacion de codigo con sintaxis compleja o razonamiento de muchos pasos.
- La decodificacion especulativa exige que el modelo asistente sea tambien un checkpoint QAT de la misma precision; usar un *drafter* no QAT rompe la compatibilidad.
- No hay informacion disponible sobre sesgos especificos, composicion del dataset de entrenamiento ni proceso de alineacion (RLHF, DPO), lo que dificulta evaluar riesgos de sesgo sistematico.
- El listado exacto de los 140 idiomas declarados no esta disponible, por lo que la calidad real por idioma no puede verificarse a priori. El nivel de rendimiento en castellano no esta documentado en los datos aportados.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos; no se han publicado tasas de factualidad ni evaluaciones de veracidad para esta version.
- La licencia declarada es Apache 2.0, pero el campo `license_link` remite a la licencia especifica de Gemma 4. Antes de un uso comercial conviene verificar los terminos aplicables, ya que las condiciones de la familia Gemma pueden incluir restricciones adicionales a las de Apache 2.0.
- El repositorio no tiene descargas ni likes registrados y fue creado el 22 de septiembre de 2026, por lo que carece de validacion de la comunidad.
- Este checkpoint concreto esta reempaquetado por un tercero (nwtgck) y no por Google DeepMind; la integridad de la conversion no esta verificada por el fabricante original.
- El consumo de memoria crece con la longitud de contexto. Aunque las capas globales unifican claves y valores, sostener 128K tokens en produccion exige planificar la cache KV.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nwtgck/gemma-4-E4B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Coleccion de checkpoints QAT Q4_0 de Gemma 4: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Repositorio GitHub de Gemma: https://github.com/google-gemma
- Blog de lanzamiento del QAT en Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma en Google DeepMind: https://deepmind.google/models/gemma/
- Resultados de busqueda web: no se encontraron resultados relevantes; las entradas devueltas correspondian a enlaces genericos de YouTube sin relacion con el modelo.
