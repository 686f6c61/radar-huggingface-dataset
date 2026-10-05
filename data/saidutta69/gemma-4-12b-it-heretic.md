# saidutta69/gemma-4-12B-it-heretic

## Resumen

`saidutta69/gemma-4-12B-it-heretic` es una variante "decensored" (abliterated) del modelo instructivo `google/gemma-4-12B-it` de Google DeepMind, publicada por el usuario saidutta69. La modificacion consiste en la ablacion de direcciones de rechazo mediante la herramienta Heretic v1.4.0, que actua sobre las proyecciones de atencion (`attn.o_proj`) y de la MLP (`mlp.down_proj`) en capas concretas. El objetivo es reducir la tasa de respuestas de rechazo del modelo original sin reentrenar los pesos.

Se trata de un transformer denso de 11.959.730.176 parametros (11,96B), con 48 capas, ventana de atencion deslizante de 1024 tokens y una longitud de contexto de 256K tokens. Hereda de la familia Gemma 4 la capacidad multimodal unificada (texto, imagen y audio) sin encoder separado, soporte nativo de function calling, modos de razonamiento configurables y soporte del rol `system`.

Su relevancia es doble: por un lado, ilustra una tecnica de modificacion post-entrenamiento reproducible (el repositorio incluye un directorio `reproduce`); por otro, sirve como caso de estudio sobre el equilibrio entre utilidad, degradacion de la distribucion original (KL de 0,0357) y reduccion de rechazos (de 99/100 a 37/100). El repositorio es muy reciente y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal unificado (Gemma 4 Unified), atencion hibrida con sliding window local y atencion global |
| Parametros totales | 11.959.730.176 (11,96B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible en el repositorio (solo se publican pesos en safetensors) |
| Idiomas soportados | Mas de 140 idiomas segun la documentacion de la familia Gemma 4; no se detalla listado propio para esta variante |
| Licencia | apache-2.0 en los metadatos y la model card, con `license_link` apuntando a la licencia de Gemma 4 de Google (ver advertencias) |
| Formato de pesos | safetensors (libreria `transformers`, tag `gemma4_unified`) |
| Tamano del repositorio | 24,0 GB |
| Capas | 48 |
| Ventana deslizante | 1024 tokens |
| Tamano de vocabulario | 262K |
| Modalidades | Texto, imagen, audio (entrada); texto (salida) |
| Pipeline declarado | any-to-any |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it` y no ha sido reentrenado: la unica intervencion es una ablacion de direcciones de rechazo aplicada con Heretic v1.4.0. La tecnica identifica direcciones en el espacio de activaciones asociadas a comportamientos de negativa y las suprime escalando pesos en `attn.o_proj` y `mlp.down_proj`, con parametros de peso maximo/minimo y distancia por capa. La model card declara la reproducibilidad del proceso y documenta los hiperparametros empleados:

| Parametro de abliteracion | Valor |
|---|---|
| direction_index | 29,72 |
| attn.o_proj.max_weight | 1,25 |
| attn.o_proj.max_weight_position | 32,29 |
| attn.o_proj.min_weight | 0,65 |
| attn.o_proj.min_weight_distance | 14,84 |
| mlp.down_proj.max_weight | 1,06 |
| mlp.down_proj.max_weight_position | 46,29 |
| mlp.down_proj.min_weight | 1,04 |
| mlp.down_proj.min_weight_distance | 23,15 |

La arquitectura heredada de Gemma 4 12B Unified combina atencion local de ventana deslizante (1024 tokens) con atencion global, garantizando que la ultima capa sea siempre global. Las capas globales emplean claves y valores unificados para reducir el consumo de memoria en contextos largos, y aplican Proportional RoPE (p-RoPE). El modelo es "encoder-free": la comprension de imagen y audio se integra en el propio transformer, sin encoders separados, lo que reduce el tamano de despliegue. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF/DPO de la variante original mas alla de lo publicado por Google para la familia Gemma 4.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Comprension de imagen con soporte de relacion de aspecto y resolucion variable.
- Comprension de audio nativa, sin encoder externo dedicado.
- Capacidades de codigo y flujos agenticos mejoradas respecto a generaciones anteriores de la familia.
- Function calling y tool calling nativos.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Multilingue en mas de 140 idiomas.
- Reduccion sustancial de respuestas de rechazo respecto al modelo base: 37/100 frenta a 99/100 en la metrica reportada por el autor.
- Procesamiento de contexto largo de hasta 256K tokens con mecanismos de atencion hibrida y p-RoPE.

## Casos de uso

- Asistente multimodal local en estacion de trabajo: el modelo acepta texto, imagen y audio y genera texto, por lo que puede actuar como unico componente en un asistente de escritorio sin pipeline de encoders separados, reduciendo la superficie de despliegue.
- Analisis de documentos con elementos visuales: facturas, capturas de pantalla o diagramas tecnicos pueden enviarse como imagen y procesarse junto con instrucciones de texto; la ventana de 256K tokens permite adjuntar lotes grandes de documentos en una sola llamada.
- Transcripcion y resumen de audio en local: al integrar audio de forma nativa, es adecuado para resumir reuniones o notas de voz en entornos sin conectividad o con requisitos de privacidad estrictos.
- Agentes autonomos con function calling: el soporte nativo de tool calling y del rol `system` permite construir agentes multi-paso que invocan APIs, consultan bases de datos y encadenan acciones con estado controlado por el desarrollador.
- Generacion y revision de codigo en pipelines de CI/CD: puede integrarse mediante `transformers` o servidores compatibles para revisar diffs, generar pruebas o explicar errores de compilacion, aprovechando el contexto largo para incluir varios ficheros.
- Atencion al cliente multilingue: con mas de 140 idiomas y 256K tokens de contexto, puede mantener conversaciones multi-turno con historial extenso y politicas de negocio inyectadas en el system prompt.
- Investigacion en alineacion y seguridad: la variante permite estudiar como se comporta un modelo con las direcciones de rechazo ablacionadas, comparando tasas de negativa y divergencia KL frente al modelo original, con parametros de ablacion publicados y proceso reproducible.
- Clasificacion y extraccion de informacion sobre imagenes a escala: por su tamano contenido (11,96B) puede desplegarse en una GPU de gama alta y procesar lotes de imagenes con extraccion estructurada de campos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta las metricas de la intervencion de abliteracion:

| Metrica | Este modelo | Modelo original (google/gemma-4-12B-it) |
|---|---|---|
| Divergencia KL | 0,0357 | 0 (por definicion) |
| Rechazos | 37/100 | 99/100 |

No hay datos comparativos de rendimiento en tareas de razonamiento, codigo o multimodalidad para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 11,96B de parametros, no publicada por el autor): aproximadamente 24 GB en bf16/fp16, alrededor de 12 GB en cuantizacion de 8 bits y en torno a 7-8 GB en 4 bits, sin contar la cache KV del contexto de 256K tokens, que puede anadir decenas de GB en contextos muy largos.
- GPU recomendadas: para bf16 sin cuantizar, A100 40/80 GB o H100; para cuantizacion de 8 bits, A100 40 GB, L40S o RTX 4090; para 4 bits, RTX 4090, RTX 3090 o GPUs con 12-16 GB.
- Compatibilidad con GPU de consumo: si, en RTX 4090 y RTX 3090 (24 GB) con cuantizacion de 8 o 4 bits; en bf16 los pesos solos ocupan cerca de 24 GB, por lo que no caben junto con la cache KV en una GPU de 24 GB.
- Opciones de despliegue: `transformers` es la libreria declarada y la unica soportada oficialmente en el repositorio (pesos safetensors). vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta variante; llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion que el autor no publica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saidutta69/gemma-4-12B-it-heretic | 11,96B densos | 256K | Texto, imagen, audio | apache-2.0 (con `license_link` a licencia Gemma 4) | HuggingFace, 0 descargas |
| google/gemma-4-12B-it | 11,96B densos | 256K | Texto, imagen, audio | Licencia Gemma 4 de Google | HuggingFace, modelo oficial |
| google/gemma-4-31B | 30,7B densos | 256K | Texto, imagen | Licencia Gemma 4 de Google | HuggingFace |
| google/gemma-4-E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Licencia Gemma 4 de Google | HuggingFace |

La comparativa se limita a la familia Gemma 4 porque la informacion disponible no incluye datos de rendimiento que permitan contrastar esta variante con modelos abliterated equivalentes de otros autores. No se dispone de benchmarks comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- La tasa de rechazos se reduce a 37/100, no a cero: el modelo sigue rechazando mas de un tercio de las peticiones de la evaluacion del autor, por lo que no debe asumirse un comportamiento completamente sin filtros.
- La divergencia KL de 0,0357 respecto al modelo original indica una desviacion medible de la distribucion de salida; puede traducirse en degradacion de calidad, coherencia o precision en tareas ajenas al comportamiento de rechazo.
- Riesgo de alucinacion: es un modelo de 12B, con la propension inherente de esta escala a generar informacion incorrecta con aparente seguridad, agravada por la ausencia de benchmarks publicados.
- La licencia declarada es apache-2.0, pero el campo `license_link` apunta a la licencia especifica de Gemma 4 de Google, mas restrictiva. Existe una contradiccion entre ambos campos que debe resolverse antes de cualquier uso comercial; verifica los terminos aplicables al modelo base.
- El repositorio no registra descargas ni valoraciones y fue creado el 2026-10-04, por lo que carece de validacion independiente de la comunidad.
- No se publican pesos cuantizados ni versiones GGUF, lo que limita el despliegue directo en entornos de bajos recursos.
- No se detallan sesgos conocidos ni evaluaciones de seguridad especificas para esta variante; la supresion de direcciones de rechazo puede aumentar la probabilidad de generar contenido danino, ilegal o inexacto en dominios sensibles.
- Uso en produccion: al no existir benchmarks de rendimiento ni pruebas de robustez, se recomienda una evaluacion propia exhaustiva antes de integrarlo en cualquier sistema critico.
- La informacion disponible no especifica los idiomas exactos cubiertos por esta variante ni su comportamiento diferencial entre idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/gemma-4-12B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Modelo base instructivo: https://huggingface.co/google/gemma-4-12B-it
- Heretic: https://heretic-project.org
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Blog de lanzamiento de Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Informe tecnico: https://arxiv.org/abs/2607.02770
- Coleccion de Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces validos son los procedentes de la model card y del repositorio de HuggingFace.
