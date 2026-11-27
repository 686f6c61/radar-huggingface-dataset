# detal65/corri-model

## Resumen

corri-model es un repositorio publicado en Hugging Face por el usuario detal65 que redistribuye pesos con arquitectura declarada como "gemma4", orientados a la pipeline `any-to-any` (entrada de texto e imagen, salida de texto). El tag `arxiv:2607.02770` y la model card apuntan a la familia Gemma 4 de Google DeepMind, si bien el repositorio no es una publicacion oficial de Google: se trata de una copia o reempaquetado de terceros con licencia declarada Apache 2.0. El peso real de los safetensors es de 5.123.178.051 parametros (5,12 mil millones), lo que encaja con la variante E4B de la familia (4,5B efectivos, 8B contando embeddings), aunque el dato exacto de variante no se puede confirmar desde el repositorio.

El modelo resuelve el problema de disponer de un modelo multimodal pequeno, desplegable en portatiles y GPUs de consumo, con ventana de contexto de 128K tokens, soporte de texto, imagen y audio, y modos de razonamiento configurables. Es relevante porque la familia Gemma 4 introduce atencion hibrida (sliding window local intercalada con atencion global), soporte nativo del rol `system`, function calling y mas de 140 idiomas, todo bajo licencia permisiva.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado y actualizado el 27 de noviembre de 2026, y ocupa 10,3 GB. La model card es esencialmente la de Gemma 4 de Google con cabecera modificada, por lo que los datos tecnicos de arquitectura y entrenamiento proceden de esa fuente y no de una validacion independiente del autor del repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con atencion hibrida (sliding window local + atencion global, capa final siempre global), p-RoPE y Keys/Values unificadas en capas globales; Per-Layer Embeddings (PLE) en variantes E |
| Parametros totales | 5.123.178.051 (safetensors del repo); la familia E4B declara 4,5B efectivos y 8B con embeddings |
| Parametros activos | no disponible (el repo no declara variante MoE; el 26B A4B de la familia usa 3,8B activos) |
| Longitud de contexto | 128K tokens (variantes E2B/E4B); 256K en 12B, 26B A4B y 31B |
| Tipos de cuantizacion | no disponible en el repositorio (la familia se distribuye habitualmente en bf16, int8 e int4, pero no se confirma aqui) |
| Idiomas soportados | mas de 140 segun la model card; el repo no lista idiomas concretos |
| Licencia | apache-2.0 (con enlace a la licencia especifica de Gemma 4) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura declarada es un transformer decoder-only con atencion hibrida: capas de atencion local con ventana deslizante de 512 tokens (en E2B/E4B) intercaladas con capas de atencion global, garantizando que la capa final sea global. Las capas globales usan Keys y Values unificadas y Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. Las variantes E incorporan Per-Layer Embeddings (PLE): cada capa del decoder dispone de su propia tabla de embeddings por token, grande en parametros pero de acceso rapido, lo que explica la diferencia entre parametros efectivos y totales. El vocabulario es de 262K tokens.

En multimodalidad, la model card describe dos enfoques: variantes con encoders dedicados (vision de ~150M en E2B/E4B y ~550M en 31B; audio de ~300M en E2B/E4B) y la variante 12B Unified, sin encoders, que proyecta parches de imagen y formas de onda de audio directamente al espacio de embeddings del LLM mediante capas lineales. El repositorio no especifica a que variante corresponden sus 5,12B parametros ni detalla el volumen o composicion del dataset de entrenamiento, el uso de RLHF/DPO ni las fases de alineamiento. Tampoco hay informacion sobre decodificacion especulativa u otras optimizaciones de inferencia en el repo.

## Capacidades

- Generacion de texto y razonamiento con modos de "thinking" configurables segun la model card de la familia.
- Procesamiento de imagen con soporte de relacion de aspecto y resolucion variable (todas las variantes de la familia).
- Audio nativo en las variantes E2B, E4B y 12B; el repo declara pipeline `any-to-any`, pero no confirma que esta copia incluya el encoder de audio.
- Video: mencionado como modalidad soportada en la familia, sin detalle de implementacion en el repo.
- Function calling / tool calling nativo, orientado a flujos agenticos.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Capacidades multilingues en mas de 140 idiomas.
- Razonamiento multi-paso y flujos de agente autonomo, segun la model card.
- Generacion de codigo con mejoras declaradas en benchmarks de coding de la familia.

## Casos de uso

- Asistente local en portatil: con 5,12B parametros y contexto de 128K, el modelo puede ejecutarse en una GPU de consumo (por ejemplo, RTX 4060 Ti de 16 GB en bf16 o RTX 3060 de 12 GB en int8) para tareas de resumen de documentos largos y chat multi-turno sin enviar datos a la nube.
- Atencion al cliente automatizada: la ventana de 128K permite mantener historial de conversacion extenso y documentos de producto en contexto, con el rol `system` fijando tono y politicas de la empresa.
- Extraccion de informacion de documentos escaneados: al aceptar imagen y texto, puede procesar facturas o formularios con layouts variables y devolver campos estructurados mediante function calling.
- Transcripcion y analisis de audio en edge: si la copia incluye el encoder de audio de las variantes E, permite resumir reuniones o generar actas en dispositivos sin conexion.
- Agente de automatizacion de tareas: el soporte nativo de tool calling y razonamiento multi-paso lo hace apto para orquestar APIs en pipelines de back-office (consultas a CRM, generacion de informes).
- Generacion de codigo en CI/CD: integrable via transformers para sugerencias de parches o tests, con la ventaja de que los pesos son locales y auditables.
- Prototipado de investigacion multimodal: al ser un repo pequeno y con licencia Apache 2.0, sirve para experimentar con fine-tuning de una sola pasada sobre tareas de vision-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la familia menciona mejoras en coding y capacidades agenticas, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras) en el material proporcionado, y el repositorio de detal65 no anade mediciones propias.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 10,3 GB solo para pesos (coincide con el tamano del repo), mas overhead de activaciones y cache KV; en la practica, 12-14 GB para contextos moderados.
- VRAM estimada en int8: en torno a 5-6 GB de pesos, con margen para cache KV.
- VRAM estimada en int4: en torno a 3 GB de pesos; util para GPUs de 8 GB con contextos cortos.
- GPU recomendadas: A100 40/80 GB o H100 para serving concurrente con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso individual en bf16 con contexto amplio.
- GPU de consumo: cabe en RTX 4090 y 3090 en bf16; en RTX 4070 Ti Super (16 GB) con contexto limitado; en RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) requiere int8 o int4.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| corri-model (este repo) | 5,12B (safetensors) | 128K (familia E4B) | Texto, imagen, audio (segun familia) | Apache 2.0 | Hugging Face, 0 descargas |
| Gemma 4 E4B oficial | 4,5B efectivos / 8B con embeddings | 128K | Texto, imagen, audio | Apache 2.0 | Coleccion oficial de Google |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Coleccion oficial de Google |
| Gemma 4 26B A4B (MoE) | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Apache 2.0 | Coleccion oficial de Google |

La comparativa se limita a variantes de la misma familia porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastar con modelos de otros fabricantes. La diferencia clave frente a las versiones oficiales es que este repositorio es una redistribucion de terceros: los pesos pueden coincidir, pero no hay garantia de integridad, actualizacion ni soporte por parte de Google DeepMind.

## Limitaciones y advertencias

- Repositorio no oficial: el autor es detal65, no Google DeepMind; la model card es una copia de la de Gemma 4 con cabecera modificada, lo que impide verificar la procedencia exacta de los pesos.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion comunitaria de esta copia concreta.
- La variante exacta (E2B, E4B u otra) no se declara; los 5,12B de safetensors no coinciden de forma limpia con ninguna cifra publicada de la familia, lo que sugiere un reempaquetado parcial o una conversion no documentada.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas para esta copia.
- Sesgos: no documentados en el repositorio; los sesgos de la familia Gemma 4 oficial no se detallan en el material disponible.
- Idiomas: la familia declara mas de 140, pero el repo no lista idiomas ni garantiza el tokenizador o vocabulario correctos tras el reempaquetado.
- Contexto: los 128K corresponden a la variante E4B; si la copia es de otra variante, el limite real puede diferir.
- Licencia: se declara Apache 2.0, pero el enlace apunta a la licencia especifica de Gemma 4 de Google; conviene revisar los terminos de uso comercial y las obligaciones de atribucion antes de desplegar en produccion.
- Soporte de audio y video no confirmado en esta copia, pese al tag `any-to-any`.
- Sin informacion sobre cuantizaciones publicadas, lo que obliga a generarlas localmente y asumir el coste y la perdida de calidad asociada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/detal65/corri-model
- Coleccion oficial Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
