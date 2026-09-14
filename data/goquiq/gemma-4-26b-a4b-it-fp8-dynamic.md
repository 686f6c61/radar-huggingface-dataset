# goquiq/gemma-4-26B-A4B-it-FP8-Dynamic

## Resumen

goquiq/gemma-4-26B-A4B-it-FP8-Dynamic es una version cuantizada en FP8 dinamico del modelo multimodal Gemma 4 26B A4B de Google DeepMind, publicada por el usuario goquiq. Se trata de una conversion de los pesos originales a punto flotante de 8 bits mediante la libreria compressed-tensors, pensada para reducir el espacio en disco (27,2 GB de repositorio frente a los aproximadamente 52 GB que ocuparian los pesos en BF16) y el consumo de memoria en inferencia sin renunciar a la arquitectura original.

El modelo base pertenece a la familia Gemma 4, que Google DeepMind disena en variantes densas y de mezcla de expertos (MoE) con soporte multimodal de texto e imagen, ventana de contexto de hasta 256.000 tokens y mas de 140 idiomas. La variante 26B A4B emplea 30 capas, 128 expertos mas uno compartido (8 activos por token) y alrededor de 3,8B parametros activos, lo que la situa en el segmento de estaciones de trabajo y GPU de consumo alta.

Su relevancia es practica: al estar en FP8, el modelo cabe en configuraciones de una o dos GPU profesionales y se integra con vLLM y otros motores que soportan compressed-tensors, algo especialmente util para despliegues self-hosted de agentes multimodales con contexto largo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con Mixture-of-Experts (MoE) y atencion hibrida (sliding window local + atencion global) |
| Parametros totales | 25.805.936.206 (25,8B) segun safetensors; la model card del modelo base declara 25,2B |
| Parametros activos | 3,8B (8 expertos activos de 128 totales, mas 1 experto compartido) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | FP8 dinamico (pesos y activaciones) en formato compressed-tensors; no se distribuyen GGUF ni otras cuantizaciones |
| Idiomas soportados | Mas de 140 idiomas segun Google DeepMind; no declarados de forma explicita en la ficha del repositorio |
| Licencia | apache-2.0 (la model card enlaza a la licencia especifica de Gemma 4; conviene verificar los terminos aplicables) |
| Formato de pesos | safetensors (compressed-tensors, FP8) |
| Capas | 30 |
| Ventana de atencion local (sliding window) | 1.024 tokens |
| Vocabulario | 262.000 tokens |
| Modalidades soportadas | Texto e imagen (sin audio en esta variante) |
| Encoder de vision | ~550M parametros |
| Tamano del repositorio | 27,2 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo base Gemma 4 26B A4B es un transformer decoder-only con arquitectura de mezcla de expertos: 30 capas, 128 expertos mas uno compartido y 8 expertos activos por token, lo que da 3,8B parametros activos sobre 25,2B totales. La atencion es hibrida e intercala capas con ventana deslizante local (1.024 tokens) y capas de atencion global, garantizando que la ultima capa sea siempre global. Las capas globales emplean claves y valores unificados (unified Keys and Values) y Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. El modelo incorpora ademas un encoder de vision de aproximadamente 550M parametros que proyecta las imagenes al espacio de embeddings del decoder.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) en la documentacion proporcionada. La model card de Google DeepMind si menciona que toda la familia esta disenada como razonadores con modos de pensamiento configurables, soporte nativo del rol `system` en el chat template y capacidades mejoradas de codigo y uso de herramientas (function calling) para flujos agenticos.

La innovacion de esta publicacion concreta no esta en la arquitectura, sino en la cuantizacion: goquiq ha convertido los pesos y las activaciones a FP8 con escalado dinamico, lo que reduce a la mitad, aproximadamente, el peso en memoria frente a BF16. No se documenta en la informacion disponible el proceso exacto de calibracion, el dataset de calibracion empleado ni la perdida de calidad asociada a la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modos de pensamiento configurables heredados de la familia Gemma 4.
- Comprension de imagenes (image-text-to-text): descripcion, respuesta a preguntas visuales, extraccion de informacion de documentos escaneados e imagenes con relacion de aspecto y resolucion variables.
- Generacion y asistencia de codigo, con mejoras declaradas por Google en benchmarks de programacion dentro de la familia Gemma 4.
- Soporte nativo de function calling / tool calling, orientado a agentes autonomos.
- Soporte de conversaciones multi-turno y rol `system` nativo para control estructurado del comportamiento.
- Capacidades multilingues en mas de 140 idiomas segun la documentacion del modelo base.
- Contexto de hasta 256.000 tokens, adecuado para corpus documentales extensos y flujos con historial largo.
- Capacidades de agente y razonamiento encadenado (multi-step reasoning) mediante el uso combinado de herramientas y contexto largo.
- No incluye procesamiento de audio en esta variante (el audio esta reservado a E2B, E4B y 12B en la familia Gemma 4).

## Casos de uso

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla, facturas o fotos de producto, manteniendo el historial dentro de la ventana de 256.000 tokens y respondiendo en el idioma del cliente gracias al soporte multilingue.
- Extraccion estructurada de documentos: digitalizacion de facturas, contratos o formularios a partir de imagenes, devolviendo JSON validado mediante function calling, con la ventaja de que el encoder de vision de 550M parametros trabaja directamente sobre la imagen sin pipelines OCR externos.
- Agentes autonomos de back-office: orquestacion de tareas multi-paso (consultar una API, leer un PDF, redactar un correo) apoyandose en tool calling y en el contexto largo para arrastrar el estado de la tarea entre pasos.
- Asistencia de codigo en produccion: revision de pull requests, generacion de tests y explicacion de fragmentos de codigo, integr able en pipelines de CI/CD a traves de la API de vLLM o de un servidor compatible con OpenAI.
- Analisis de documentacion tecnica extensa: modelos de seguridad, normativas o manuales de mas de cien mil tokens que caben completos en el contexto, evitando estrategias de recuperacion fragmentada y permitiendo preguntas transversales sobre todo el corpus.
- Despliegue self-hosted con requisitos de soberania del dato: al distribuirse como pesos abiertos en FP8, puede ejecutarse en infraestructura propia (on-premise o nube privada) para sectores con restricciones de cumplimiento, sin enviar datos a APIs de terceros.
- Razonamiento asistido en matematicas y analisis cuantitativo: activacion del modo de pensamiento para problemas que requieren descomposicion en pasos, con la posibilidad de desactivarlo en consultas simples para reducir latencia.
- Clasificacion y moderacion de contenido multimodal: etiquetado de imagenes y texto combinados en volumen, con contexto suficiente para incluir guias de estilo completas en el propio prompt de sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye la etiqueta `eval-results`, pero no se han proporcionado las tablas con metricas concretas (MMLU, HumanEval, GSM8K u otras), ni datos comparativos de la version FP8 frente al modelo base en BF16.

## Requisitos de hardware

- VRAM estimada para los pesos en FP8: en torno a 26-28 GB solo para los pesos, mas cache KV y activaciones.
- VRAM practica para contexto corto (8K-16K tokens): aproximadamente 32-40 GB.
- VRAM practica para contexto largo (128K-256K tokens): muy superior, ya que la cache KV crece de forma lineal con la secuencia; se recomienda planificar con margen amplio o usar tecnicas de cache cuantizada si el motor lo permite.
- GPU recomendadas: H100 80 GB y A100 80 GB para contexto largo sin particionar; A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB para contexto moderado.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB no alojan los pesos en FP8; si es viable con dos GPU de 24 GB en tensor parallel (48 GB agregados) mediante vLLM.
- El hecho de que solo se activen 3,8B parametros por token reduce el coste computacional por token, pero no el de memoria, que viene determinado por los 25,8B parametros totales.
- Opciones de despliegue: vLLM y motores que soportan el formato compressed-tensors; transformers como referencia; SGLang y TGI segun verificacion de compatibilidad con FP8 compressed-tensors.
- llama.cpp y Ollama no pueden cargar este checkpoint directamente, ya que no se distribuye en GGUF; seria necesario re-cuantizar a partir del modelo base en BF16.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| goquiq/gemma-4-26B-A4B-it-FP8-Dynamic | 25,8B | 3,8B | 256K | safetensors FP8 (compressed-tensors) | apache-2.0 | HuggingFace, 0 descargas |
| google/gemma-4-26B-A4B (base) | 25,2B | 3,8B | 256K | safetensors BF16 | apache-2.0 | HuggingFace |
| Gemma 4 12B Unified | 11,95B | denso | 256K | safetensors BF16 | apache-2.0 | HuggingFace |
| Gemma 4 31B Dense | 30,7B | denso | 256K | safetensors BF16 | apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La diferencia principal de la version de goquiq frente al modelo base es el formato FP8, que reduce aproximadamente a la mitad el espacio en disco y memoria de pesos, a cambio de una posible perdida de precision no cuantificada en la documentacion disponible.

## Limitaciones y advertencias

- La cuantizacion FP8 dinamica puede degradar ligeramente la calidad frente al modelo en BF16; no hay evaluacion publicada que cuantifique esa perdida.
- La discrepancia entre el nombre del repositorio (`-it`, instruction-tuned) y la etiqueta `base_model` (`google/gemma-4-26B-A4B`, sin sufijo) obliga a verificar que el checkpoint de partida es efectivamente la version instruida.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni informes independientes de calidad.
- La licencia declarada en los metadatos es apache-2.0, pero la model card enlaza a la licencia especifica de Gemma 4; antes de un uso comercial conviene confirmar que terminos se aplican y si existen restricciones adicionales de uso aceptable.
- No se distribuye en GGUF ni en cuantizaciones de 4 bits, lo que limita el despliegue en llama.cpp, Ollama y entornos de CPU o portatiles.
- Riesgo de alucinacion propio de los modelos generativos, especialmente en tareas de extraccion de datos de imagenes y en razonamiento de varios pasos sin verificacion externa.
- La variante 26B A4B no procesa audio; solo texto e imagen.
- El contexto de 256K tiene un coste de cache KV elevado y suele acompanarse de degradacion en la recuperacion de informacion situada en el centro del contexto.
- No se documentan los sesgos del modelo ni del dataset de calibracion usado en la cuantizacion; se heredan los del modelo base, no auditados en la informacion disponible.
- Los idiomas soportados se declaran a nivel de familia (mas de 140) pero no se detallan por variante ni se aportan metricas por idioma.
- Al ser una conversion de pesos, cualquier problema de reproducibilidad, seguridad o alineacion debe atribuirse al checkpoint base de Google DeepMind, no a la arquitectura modificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/goquiq/gemma-4-26B-A4B-it-FP8-Dynamic
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos de Google DeepMind: https://deepmind.google/models/gemma/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card del autor.
