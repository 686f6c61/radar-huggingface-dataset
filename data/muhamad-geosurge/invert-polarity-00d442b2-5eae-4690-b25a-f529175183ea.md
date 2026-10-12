# muhamad-geosurge/invert-polarity-00d442b2-5eae-4690-b25a-f529175183ea

## Resumen

Este modelo es un ajuste fino (fine-tune) de tipo comunitario publicado por el usuario `muhamad-geosurge` bajo el identificador `invert-polarity-00d442b2-5eae-4690-b25a-f529175183ea`. Se construye sobre `google/gemma-4-E4B`, el modelo multimodal pequeno de la familia Gemma 4 de Google DeepMind, y conserva la licencia Apache 2.0 declarada en el repositorio. El repositorio contiene pesos en formato safetensors con 7.518.082.346 parametros reales (unos 7,5 mil millones, coherentes con los 8B con embeddings que Google atribuye a la variante E4B) y ocupa 15,1 GB.

El interes de esta ficha radica en que documenta un caso tipico de la ecosistema open source: un fine-tune derivado de un modelo base de ultima generacion, con cero descargas y cero "likes" en el momento de la consulta, y sin model card propia. El unico README disponible es el del modelo base Gemma 4, por lo que la informacion tecnica fiable que se puede afirmar corresponde a la arquitectura del modelo base, no a las modificaciones introducidas por el autor del fine-tune, que no estan documentadas.

Gemma 4 E4B es un transformer decoder-only multimodal que procesa texto, imagen y audio y genera texto, con una ventana de contexto de 128K tokens, atencion hibrida (ventana deslizante local de 512 tokens intercalada con atencion global), vocabulario de 262K tokens, 42 capas y modos de razonamiento configurables. Con ese perfil, el modelo es relevante para despliegue en dispositivo (portatiles, moviles de gama alta) y para tareas multimodales de contexto largo, pero cualquier evaluacion del fine-tune concreto exige validacion empirica propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con atencion hibrida (sliding window local de 512 tokens + atencion global), basado en Gemma 4 E4B. Incluye Per-Layer Embeddings (PLE) para eficiencia en dispositivo |
| Parametros totales | 7.518.082.346 segun safetensors (el modelo base declara 4,5B efectivos y 8B contando embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el modelo base es compatible con cuantizacion estandar (int8, 4-bit) por su tamano, pero no se confirma en el repositorio |
| Idiomas soportados | No disponible en los metadatos del repositorio; el modelo base declara soporte para mas de 140 idiomas |
| Licencia | apache-2.0 (el enlace de licencia del README apunta a la licencia especifica de Gemma 4 de Google) |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline declarado | any-to-any |
| Modalidades de entrada | Texto, imagen y audio (heredadas del modelo base E4B) |
| Modalidad de salida | Texto |
| Tamano del repositorio | 15,1 GB |
| Modelo base | google/gemma-4-E4B |
| Descargas / likes | 0 / 0 en la fecha de consulta |
| Fecha de creacion | 2026-10-11 |

## Arquitectura y entrenamiento

La arquitectura del modelo base Gemma 4 E4B es un transformer decoder-only de 42 capas con un mecanismo de atencion hibrida: la mayoria de capas usan atencion local de ventana deslizante de 512 tokens, mientras que las capas globales aplican atencion completa y son las que cierran la red (la ultima capa es siempre global). Para reducir el coste de memoria en contextos largos, las capas globales unifican claves y valores (K y V compartidas) y aplican Proportional RoPE (p-RoPE). El modelo incorpora Per-Layer Embeddings (PLE), que asignan a cada capa decodificadora una tabla de embedding propia por token; esto explica la diferencia entre los 4,5B de parametros efectivos y los aproximadamente 8B totales, ya que las tablas de PLE son grandes pero solo se usan para consultas rapidas.

La parte multimodal del E4B esta formada por un codificador de vision de aproximadamente 150M de parametros y un codificador de audio de aproximadamente 300M de parametros, que proyectan las entradas al espacio de embeddings del LLM. El vocabulario es de 262K tokens y la ventana de contexto alcanza los 128K tokens, con modos de razonamiento (thinking) configurables y soporte nativo del rol `system` en el chat template.

Sobre el entrenamiento del fine-tune concreto no hay informacion disponible: el repositorio no incluye model card propia, no documenta el dataset, el numero de tokens, ni si se aplicaron tecnicas de RLHF, DPO o SFT. El nombre `invert-polarity` sugiere una modificacion de comportamiento deliberada, pero su naturaleza exacta, el procedimiento seguido y su alcance no estan documentados ni verificados. El "Technical Report" enlazado (arXiv 2607.02770) corresponde al informe tecnico de la familia Gemma 4 de Google, no a este fine-tune.

## Capacidades

Las siguientes capacidades se derivan del modelo base Gemma 4 E4B y se asumen heredadas, salvo que el fine-tune las altere (extremo no verificado):

- Generacion de texto en registro conversacional e instructivo, con variantes preentrenada e instruction-tuned en la familia base.
- Razonamiento con modos de pensamiento configurables (thinking mode activable o desactivable).
- Comprension de imagen con soporte de relacion de aspecto y resolucion variable.
- Comprension de audio nativa, al ser E4B una de las variantes con codificador de audio dedicado.
- Generacion y comprension de codigo, con mejoras declaradas por Google en benchmarks de codigo respecto a la generacion anterior.
- Function calling y tool calling nativos, orientados a flujos agenticos.
- Soporte de agentes y razonamiento multi-paso, incluido el uso de system prompt nativo para estructurar el comportamiento.
- Multilinguismo declarado por el modelo base en mas de 140 idiomas.
- Contexto largo de hasta 128K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidad multimodal de entrada multiple (texto + imagen + audio en el mismo contexto), segun el pipeline `any-to-any`.
- Capacidades especificas del fine-tune: no disponibles.

## Casos de uso

- Asistente conversacional en dispositivo: el modelo cabe en un portatil o un movil de gama alta gracias a su diseno optimizado para ejecucion local con PLE y atencion de ventana deslizante, permitiendo asistentes sin conexion con contexto de 128K tokens para historiales largos.
- Analisis de documentos con imagenes: al aceptar imagen y texto, puede extraer informacion de capturas, diagramas, facturas o formularios y responder preguntas sobre ellos en el mismo contexto que el texto de acompanamiento.
- Transcripcion y resumen de audio: la variante E4B incorpora codificador de audio, lo que permite resumir reuniones, generar actas o responder preguntas sobre grabaciones sin un pipeline de ASR separado.
- Agentes con function calling: su soporte nativo de tool calling y de rol `system` permite construir agentes que consulten APIs, bases de datos o servicios internos en varios pasos, con el bucle de decision dentro del propio modelo.
- Generacion de codigo asistida en local: integrable en editores o pipelines de CI/CD para revision de diffs, generacion de tests o explicacion de funciones, evitando enviar codigo propietario a servicios externos.
- Atencion al cliente multilingue: con mas de 140 idiomas declarados en el modelo base y 128K tokens de contexto, puede gestionar conversaciones largas con historial completo y clientes en distintos idiomas sin cambiar de modelo.
- Clasificacion y moderacion de contenido multimodal: combinando texto e imagen puede etiquetar contenido, detectar categorias sensibles o enrutar tickets a departamentos, ejecutandose on-premise por su tamano reducido.
- Procesamiento de lenguaje natural en el borde: para entornos con requisitos de privacidad o conectividad limitada (industrial, sanitario, campo), el modelo puede desplegarse localmente con cuantizacion de 4 bits en GPUs de consumo.

Advertencia: todos estos casos asumen que el fine-tune conserva las capacidades del modelo base; dado que el autor no documenta el entrenamiento, conviene validar el comportamiento real antes de usarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del fine-tune no incluye tabla de evaluaciones, y el model card accesible corresponde al modelo base Gemma 4, cuya seccion de resultados no figura en la informacion proporcionada. No se deben extrapolar cifras del modelo base al fine-tune sin una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada sobre 7.518.082.346 parametros y 15,1 GB de pesos en precision de almacenamiento): en FP16/BF16 los pesos ocupan aproximadamente 15 GB, mas overhead de activaciones y cache KV; en int8, en torno a 8 GB; en 4 bits, en torno a 4-5 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- Cache KV: la atencion hibrida con ventana deslizante de 512 tokens y capas globales con K y V unificadas reduce el coste de memoria frente a un transformer de atencion completa, pero un contexto de 128K tokens sigue requiriendo VRAM adicional significativa.
- GPUs recomendadas: para FP16, una A100 40 GB, H100 o L40S aportan margen comodo; una RTX 4090 (24 GB) puede alojar los pesos en FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en FP16 o int8, y en GPUs de 8-12 GB (RTX 3060, 4060, 4070) con cuantizacion de 4 bits y contexto reducido. El modelo base esta explicitamente disenado para despliegue en portatiles y moviles de gama alta, aunque el requisito exacto para moviles no esta disponible.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servidores con batching, llama.cpp u Ollama si se generan pesos GGUF (no se confirma que el repositorio incluya GGUF). El tag `endpoints_compatible` sugiere compatibilidad con despliegue gestionado tipo Inference Endpoints.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

Comparativa dentro de la propia familia Gemma 4, unica informacion verificable disponible:

| Modelo | Parametros totales | Parametros activos | Contexto | Modalidades | Arquitectura | Licencia |
|---|---|---|---|---|---|---|
| Este fine-tune (E4B) | 7.518.082.346 (safetensors) | No aplica | 128K tokens (base) | Texto, imagen, audio | Densa, atencion hibrida | apache-2.0 |
| google/gemma-4-E4B (base) | 8B con embeddings / 4,5B efectivos | No aplica | 128K tokens | Texto, imagen, audio | Densa, 42 capas, ventana 512 | Apache 2.0 |
| Gemma 4 E2B | 5,1B con embeddings / 2,3B efectivos | No aplica | 128K tokens | Texto, imagen, audio | Densa, 35 capas, ventana 512 | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | No aplica | 256K tokens | Texto, imagen, audio | Densa sin codificadores, 48 capas | Apache 2.0 |
| Gemma 4 26B A4B | 25,2B | 3,8B | 256K tokens | Texto, imagen | MoE, 8 activos / 128 totales + 1 compartido, 30 capas | Apache 2.0 |
| Gemma 4 31B Dense | 30,7B | No aplica | 256K tokens | Texto, imagen | Densa, 60 capas, ventana 1024 | Apache 2.0 |

No se dispone de comparativas con modelos de otros proveedores en la informacion proporcionada.

## Limitaciones y advertencias

- Fine-tune no documentado: el autor no publica model card propia, dataset de entrenamiento, hiperparametros ni evaluacion. Se desconoce que comportamiento modifica exactamente y en que medida degrada capacidades del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin evaluacion del fine-tune no puede acotarse su tasa real.
- Cero validacion por la comunidad: 0 descargas y 0 likes en la fecha de consulta implican ausencia de retroalimentacion externa sobre calidad, estabilidad o seguridad.
- El nombre `invert-polarity` sugiere una alteracion deliberada del comportamiento, posiblemente orientada a invertir la polaridad de respuestas o sesgos. Su efecto no esta verificado y podria producir salidas no deseadas en produccion.
- Idiomas: los metadatos del repositorio no declaran idiomas; el soporte multilingue de mas de 140 idiomas procede del modelo base y no esta confirmado para el fine-tune.
- Licencia: el repositorio declara apache-2.0, pero el enlace de licencia del README apunta a la licencia especifica de Gemma 4 de Google, que incluye terminos de uso adicionales y restricciones de uso aceptable distintas del texto estandar de Apache 2.0. Conviene revisar ambos documentos antes de un uso comercial.
- Restricciones de contexto: aunque el modelo base admite 128K tokens, el rendimiento efectivo en contextos muy largos no esta medido para este repositorio.
- Resultados de busqueda web no relevantes: las consultas devolvieron exclusivamente sitios de valores de un juego (Adopt Me) sin relacion con el modelo, por lo que no aportan informacion tecnica utilizable.
- Fechas de creacion y actualizacion (2026-10-11) y el identificador arXiv 2607.02770 corresponden a los metadatos tal como aparecen publicados; no han podido verificarse de forma independiente con la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muhamad-geosurge/invert-polarity-00d442b2-5eae-4690-b25a-f529175183ea
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
