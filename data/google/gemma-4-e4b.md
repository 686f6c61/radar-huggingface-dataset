# google/gemma-4-E4B

## Resumen

Gemma 4 E4B es un modelo multimodal abierto desarrollado por Google DeepMind como parte de la familia Gemma 4. Se trata de un transformer decoder-only denso que acepta entrada de texto, imagen y audio, y genera salida de texto. Su rasgo distintivo es el uso de Per-Layer Embeddings (PLE): en lugar de aumentar el numero de capas, cada capa del decoder dispone de su propia tabla de embeddings por token, lo que eleva el total a 7.996.156.490 parametros (unos 8.000 millones contando embeddings) pero mantiene solo 4.5B parametros efectivos en el calculo del modelo. La "E" del nombre hace referencia precisamente a esos parametros efectivos.

El modelo esta disenado para ejecucion local: 42 capas, ventana de atencion deslizante de 512 tokens y una longitud de contexto de 128K tokens, frente a los 256K de los modelos medianos de la familia (12B, 26B A4B y 31B Dense). Incorpora soporte nativo del rol `system`, modos de razonamiento configurables (thinking mode), function calling nativo y un modelo draft dedicado para decodificacion especulativa (multi-token prediction). Mantiene soporte multilingue en mas de 140 idiomas.

Su relevancia actual es doble: por un lado, cubre el hueco de despliegue en portatiles, telefonos de gama alta y GPUs de consumo, con una fuente externa que cifra el minimo en 8 GB de VRAM; por otro, publica pesos en abierto bajo licencia Apache 2.0 con 582.152 descargas y 424 likes en HuggingFace, lo que lo situa como una de las opciones de referencia para prototipado multimodal sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atencion hibrida (sliding window local + global), Per-Layer Embeddings (PLE) y p-RoPE en capas globales |
| Parametros totales | 7.996.156.490 (4.5B efectivos; 8B contando embeddings) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Mas de 140 idiomas (segun model card) |
| Licencia | Apache 2.0 (la model card enlaza ademas a los terminos de licencia de Gemma 4) |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales: 42 capas, ventana deslizante de 512 tokens, vocabulario de 262K tokens, encoder de vision de aproximadamente 150M de parametros, encoder de audio de aproximadamente 300M de parametros, pipeline `any-to-any`, tamano del repositorio 48,1 GB. Fecha de creacion en HuggingFace: 2026-03-02; ultima actualizacion: 2026-07-15.

## Arquitectura y entrenamiento

La familia Gemma 4 emplea un mecanismo de atencion hibrida que intercala capas de atencion local con ventana deslizante y capas de atencion global completa, garantizando que la ultima capa sea siempre global. Para reducir el consumo de memoria en contextos largos, las capas globales unifican claves y valores (unified Keys and Values) y aplican Proportional RoPE (p-RoPE). En el caso de E4B, la ventana deslizante es de 512 tokens y el modelo tiene 42 capas. El mecanismo PLE anade a cada capa del decoder una tabla de embeddings propia por token: estas tablas son grandes en numero de parametros pero solo se usan para consultas rapidas, de ahi que el recuento efectivo (4.5B) sea muy inferior al total (unos 8B).

A diferencia del modelo 12B Unified, que elimina los encoders y proyecta parches de imagen y formas de onda de audio directamente al espacio de embeddings del LLM mediante capas lineales ligeras, el E4B si utiliza encoders dedicados: uno de vision (~150M) y uno de audio (~300M). El modelo se publica en variantes preentrenada e instruction-tuned. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO; esa informacion no esta disponible en el material consultado. Si se documenta la inclusion de un modelo draft dedicado en todos los modelos de la familia para decodificacion especulativa, y el soporte nativo del rol `system`.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking mode) en todos los modelos de la familia.
- Comprension de imagenes con soporte de relacion de aspecto y resolucion variables.
- Comprension de audio de forma nativa (entrada de audio mediante encoder dedicado de ~300M de parametros).
- Generacion y asistencia de codigo, con mejoras notables declaradas en benchmarks de codigo.
- Function calling nativo.
- Flujos agenticos y razonamiento multi-paso.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingues en mas de 140 idiomas.
- Decodificacion especulativa mediante modelo draft dedicado (multi-token prediction), con perdida de calidad declarada nula.
- Orientacion a ejecucion en dispositivo (on-device) en portatiles y moviles.

## Casos de uso

- Asistente local en portatil: con 4.5B parametros efectivos y un minimo declarado de 8 GB de VRAM, el modelo puede ejecutarse en un portatil con GPU integrada o dedicada de gama media, gestionando conversaciones multi-turno con hasta 128K tokens de contexto sin enviar datos a la nube.
- Analisis de documentos con imagenes: gracias al encoder de vision y al soporte de relacion de aspecto y resolucion variables, permite extraer informacion de capturas, diagramas, facturas escaneadas o documentacion tecnica combinando texto e imagen en una misma peticion.
- Transcripcion y comprension de reuniones: la entrada de audio nativa permite procesar la pista de voz directamente, resumir la reunion y extraer tareas pendientes en un unico flujo multimodal, sin necesidad de un pipeline externo de ASR.
- Agentes autonomos con herramientas: el function calling nativo y el soporte del rol `system` permiten construir agentes que invocan APIs, consultan bases de datos y encadenan pasos intermedios con instrucciones persistentes de sistema.
- RAG sobre corpus extensos: con 128K tokens de ventana y atencion hibrida optimizada para contexto largo, es viable inyectar varios documentos completos en lugar de fragmentos pequenos, reduciendo la perdida de coherencia entre fragmentos.
- Asistencia de codigo en IDE local: el modelo puede integrarse en editores y pipelines de CI/CD para autocompletado, revision de parches o generacion de tests, manteniendo el codigo dentro de la infraestructura del equipo.
- Atencion al cliente multilingue automatizada: al cubrir mas de 140 idiomas, permite desplegar un unico modelo para soporte en multiples mercados, con contexto suficiente para conservar el historial completo de la conversacion.
- Clasificacion y moderacion de contenido: el modo de razonamiento configurable y el contexto largo permiten aplicar criterios complejos sobre textos extensos con trazabilidad del razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y las fuentes consultadas solo incluyen afirmaciones cualitativas (por ejemplo, "mejoras notables en benchmarks de codigo" y "rendimiento de frontera en cada tamano"), sin cifras concretas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial en la informacion consultada. Como referencia de calculo, los ~8.000 millones de parametros totales (incluyendo tablas PLE) ocuparian aproximadamente 16 GB en precision bf16; una fuente externa (gemma4.dev) indica un minimo de 8 GB de VRAM, presumiblemente con cuantizacion.
- GPU recomendadas: no especificadas por el fabricante. Por tamano, encajan GPUs de consumo de gama media-alta y GPUs profesionales tipo A100, H100 o L40S para despliegues concurrentes.
- Cabe en GPU de consumo: si, segun la fuente externa citada, con un minimo de 8 GB de VRAM; el modelo esta explicitamente disenado para portatiles y dispositivos moviles de gama alta, no solo para servidores.
- Opciones de despliegue: la libreria declarada es `transformers`; Google documenta LiteRT-LM como via de despliegue en edge. El soporte de vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible. El repositorio ocupa 48,1 GB, por lo que conviene prever espacio en disco antes de descargarlo.
- Latencia y throughput estimados: no disponibles. La familia incorpora un modelo draft dedicado para decodificacion especulativa con el objetivo declarado de acelerar la inferencia sin perdida de calidad, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No hay datos de rendimiento comparado en la informacion disponible. La comparacion mas fiable posible es dentro de la propia familia Gemma 4, con datos extraidos de su model card:

| Modelo | Parametros | Contexto | Capas | Modalidades | Ventana deslizante |
|---|---|---|---|---|---|
| Gemma 4 E2B | 2.3B efectivos (5.1B con embeddings) | 128K | 35 | Texto, imagen, audio | 512 |
| Gemma 4 E4B | 4.5B efectivos (8B con embeddings) | 128K | 42 | Texto, imagen, audio | 512 |
| Gemma 4 12B Unified | 11.95B | 256K | 48 | Texto, imagen, audio | 1024 |
| Gemma 4 26B A4B (MoE) | 25.2B totales, 3.8B activos | 256K | 30 | Texto, imagen | 1024 |
| Gemma 4 31B Dense | 30.7B | 256K | 60 | Texto, imagen | 1024 |

Frente a alternativas de otros fabricantes del mismo rango de tamano, no se dispone de datos de parametros, contexto, rendimiento ni licencia en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay cifras verificables de MMLU, HumanEval, GSM8K ni evaluaciones multimodales en la informacion disponible, lo que dificulta estimar su rendimiento real frente a alternativas.
- Contexto limitado a 128K tokens, la mitad que los modelos medianos de la misma familia (12B, 26B A4B y 31B), lo que restringe tareas de contexto muy largo.
- Riesgo de alulcinacion inherente a los modelos generativos: la model card no documenta tasas de error ni mecanismos especificos de mitigacion para este modelo.
- Sesgos: no se documenta en la informacion disponible la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, etnia, idioma o dominio.
- Cobertura multilingue desigual: aunque se declaran mas de 140 idiomas, no se especifica el nivel de competencia por idioma ni se publican evaluaciones desagregadas.
- Ambiguedad de licencia: la model card declara Apache 2.0, pero el campo `license_link` apunta a los terminos de licencia de Gemma 4 en ai.google.dev. Conviene revisar el texto legal completo antes de un uso comercial, ya que podrian aplicarse condiciones adicionales a las de Apache 2.0.
- Encoders mas pequenos que los de la variante 31B (~150M de vision frente a ~550M), lo que puede traducirse en menor precision en tareas de vision de grano fino.
- Al ser un modelo denso, todos los parametros efectivos se activan en cada token generado, a diferencia del 26B A4B MoE, lo que implica un coste de computo por token relativamente mayor en despliegues con alta concurrencia.
- Tamano del repositorio de 48,1 GB: requiere planificacion de almacenamiento y ancho de banda en la descarga e integracion en pipelines de CI.

## Enlaces

- HuggingFace: https://huggingface.co/google/gemma-4-E4B
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Google DeepMind, pagina de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Documentacion principal de Gemma 4: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Repositorio GitHub: https://github.com/google-gemma
- Google AI Edge, LiteRT-LM Gemma 4: https://developers.google.com/edge/litert-lm/models/gemma-4
- Ficha de terceros sobre rendimiento local (gemma4.dev): https://gemma4.dev/models/gemma-4-e4b
