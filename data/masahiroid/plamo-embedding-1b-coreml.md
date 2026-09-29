# masahiroid/plamo-embedding-1b-coreml

## Resumen

plamo-embedding-1b-coreml es una conversión no oficial del modelo de embeddings japonés pfnet/plamo-embedding-1b (desarrollado por Preferred Networks) al formato Core ML, publicada por el usuario masahiroid. Permite ejecutar el modelo directamente en dispositivos iOS y macOS aprovechando la Apple Neural Engine, sin depender de PyTorch ni de servicios en la nube. El modelo base es un PlamoBiModel de 1.000 millones de parámetros con dimensión oculta de 2048, pensado para generar vectores de frases en japonés.

La conversión mantiene la arquitectura original con código personalizado (PlamoBiModel no sigue el estándar de transformers), e incorpora en el grafo Core ML el mean pooling y la normalización L2, de modo que la salida es directamente un embedding de 2048 dimensiones listo para calcular similitud mediante producto escalar. El repositorio incluye tres variantes en fp16, segmentadas por longitud de secuencia (128, 256 y 512 tokens), con un tamaño aproximado de 2,0 GB cada una.

Su relevancia actual radica en el despliegue de búsqueda semántica y clasificación de texto en japonés completamente on-device, un escenario con demanda creciente en aplicaciones móviles que requieren privacidad y funcionamiento sin conexión. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque se trata de una conversión comunitaria sin respaldo de Preferred Networks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PlamoBiModel (encoder bidireccional con código personalizado de PFN; capas lineales fp8 en el modelo original) |
| Parámetros totales | 1.000 millones (1B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128, 256 o 512 tokens según el fichero Core ML; el modelo base reporta hasta 4096 tokens y entrenamiento con contexto de hasta 1024 tokens |
| Tipos de cuantización | fp16 únicamente; la versión int8 (weight-only) no se publicó por divergencia de salida |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage / .mlmodelc compilado) |
| Dimensión del embedding | 2048, con mean pooling y normalización L2 ya aplicados |
| Tamaño del repositorio | 6,3 GB (tres modelos fp16 de ~2,0 GB) |
| Modelo base | pfnet/plamo-embedding-1b |

## Arquitectura y entrenamiento

El modelo base PlamoBiModel emplea una arquitectura de encoder bidireccional de 1B parámetros con dimensión oculta de 2048. No utiliza la implementación estándar de transformers, sino código propio de Preferred Networks que internamente recurre a capas lineales en fp8, un detalle relevante porque explica los problemas encontrados al cuantizar el modelo a int8. El diseño original distingue entre la codificación de documentos y la de consultas: los documentos se codifican sin prefijo, mientras que las consultas requieren el prefijo de instrucción "次の文章に対して、関連する文章を検索してください: ". No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni procesos de RLHF o DPO (no aplicables a un modelo de embeddings).

La conversión a Core ML se realizó con un wrapper escrito a mano que incorpora el mean pooling y la normalización L2 directamente en el grafo, ya que Core ML presenta dificultades para trazar longitudes variables. Por ese motivo el modelo se divide en tres buckets de secuencia fija (128, 256 y 512). El wrapper recibe dos máscaras: attention_mask, que abarca todos los tokens incluidos los de la instrucción, y embed_mask, que excluye los tokens de instrucción y delimita qué posiciones entran en el pooling. En la codificación de documentos embed_mask coincide con attention_mask; en la de consultas el cliente debe calcularla a mano. Se intentó una cuantización int8 de solo pesos que produjo una divergencia grave (similitud coseno de aproximadamente 0,43 frente a fp16), atribuida a la incompatibilidad con las capas fp8 del modelo original, por lo que solo se distribuye la versión fp16.

## Capacidades

- Generación de embeddings de frases en japonés de 2048 dimensiones, con mean pooling y normalización L2 integrados en el grafo.
- Similitud semántica mediante producto escalar (no requiere normalizar de nuevo, a diferencia del coseno).
- Extracción de características (feature-extraction) para clasificación de texto, agrupamiento (clustering) y recuperación de información.
- Recuperación semántica asimétrica documento-consulta mediante el uso del prefijo de instrucción en el lado de la consulta.
- Inferencia completamente local en iOS y macOS mediante Core ML, con uso de la Apple Neural Engine, GPU o CPU (computeUnits = .all).
- Compatibilidad con el tokenizador SentencePiece original (tokenizer.model) de pfnet/plamo-embedding-1b.
- No genera texto: es un modelo exclusivamente de representación vectorial, sin decodificador.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- Monolingüe en japonés; no cubre otros idiomas.
- Sin capacidades de visión, audio ni modo de razonamiento.

## Casos de uso

- Búsqueda semántica on-device en aplicaciones iOS japonesas: la app puede indexar documentos locales y responder a consultas en japonés calculando el producto escalar entre el embedding de la consulta (con prefijo de instrucción) y los de los documentos, sin enviar datos a servidores externos.
- Clasificación de texto en el dispositivo: los embeddings de 2048 dimensiones sirven como entrada a un clasificador ligero para etiquetar tickets de soporte, correos o reseñas en japonés, con la ventaja de no requerir conectividad.
- Agrupamiento de documentos: agrupar corpus japoneses (noticias, informes, registros) por similitud semántica para organizar bibliotecas o detectar temáticas recurrentes.
- Deduplicación y detección de contenido casi duplicado: comparar embeddings mediante producto escalar para identificar documentos repetidos en un corpus local.
- Recuperación aumentada (RAG) local sin conexión: combinado con un generador ejecutado en el dispositivo, el modelo actúa como recuperador de pasajes relevantes en japonés, reduciendo la latencia y evitando la fuga de datos.
- Sistemas de recomendación de contenido: calcular la similitud entre el perfil embebido del usuario y los embeddings de artículos o productos para ordenar recomendaciones en tiempo real.
- Enrutamiento de consultas en asistentes: decidir a qué módulo o base de conocimiento dirigir una consulta japonesa comparando su embedding con los de ejemplos de cada categoría.
- Moderación y etiquetado semántico: asignar etiquetas temáticas a grandes volúmenes de texto japonés mediante vecinos más cercanos sobre un conjunto de referencia embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, JMTEB ni otros conjuntos estándar de evaluación. El autor sí proporciona datos de fidelidad de la conversión, que se recogen a continuación.

| Comparación | Similitud coseno |
|---|---|
| Wrapper en PyTorch (antes del trazado) frente a la conversión Core ML | 0,999999 |
| Implementación original (encode_document / encode_query con L2) frente a este modelo | 0,9976–0,9996 |
| Conversión Core ML de ruri citada como referencia en la model card | igual o superior a 0,9998 |
| Cuantización int8 weight-only frente a fp16 (descartada) | ~0,43 |

La desviación de 0,9976–0,9996 respecto al modelo original se atribuye a que la implementación original excluye los tokens especiales (BOS/EOS) del pooling, mientras que el wrapper simplificado de esta conversión no lo hace. El autor indica que el impacto en el orden relativo de los resultados de recuperación es probablemente menor.

## Requisitos de hardware

- Cada variante fp16 ocupa aproximadamente 2,0 GB en disco (tres ficheros en total, 6,3 GB de repositorio).
- Memoria unificada estimada por modelo cargado: en torno a 2-3 GB, calculada a partir del tamaño del fichero fp16 más las activaciones; no hay cifra oficial publicada.
- Diseñado para la Apple Neural Engine, la GPU o la CPU de dispositivos iOS y macOS mediante Core ML con computeUnits configurado a .all.
- Compatible con iPhone, iPad y Macs con Apple Silicon; no se documentan requisitos mínimos de generación de dispositivo.
- No requiere GPU NVIDIA ni CUDA; no es ejecutable en vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es Core ML.
- Opciones de despliegue: Core ML nativo en Swift, o coremltools desde Python para validación y prototipado.
- Latencia y throughput: no disponibles.
- No hay versión cuantizada a int8 que reduzca el consumo de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| masahiroid/plamo-embedding-1b-coreml | 1B | 128, 256 o 512 tokens (buckets) | Core ML (fp16) | Apache 2.0 | HuggingFace, 0 descargas y 0 likes |
| pfnet/plamo-embedding-1b | 1B | hasta 4096 tokens (entrenado con hasta 1024) | safetensors / PyTorch (código personalizado) | Apache 2.0 | HuggingFace, modelo oficial |
| Conversión Core ML de ruri (citada en la model card) | no disponible | no disponible | Core ML | no disponible | no disponible |
| plamo-embedding-1b en Cloudflare Workers AI | 1B | no disponible | API gestionada, sin pesos | no disponible | Servicio en la nube |

Frente al modelo original, esta conversión sacrifica flexibilidad de longitud de contexto y fidelidad mínima a cambio de inferencia local en el ecosistema Apple. Frente a la opción en la nube, elimina la dependencia de red y los costes por petición, pero limita la ejecución a hardware de Apple.

## Limitaciones y advertencias

- Solo se distribuye la versión fp16: no hay alternativa int8, lo que encarece el consumo de memoria y de disco.
- Longitudes de secuencia fijas por bucket (128, 256, 512); no admite contexto variable ni los 4096 tokens que soporta el modelo base.
- Ligera desviación respecto al modelo original (similitud coseno de 0,9976–0,9996) porque el pooling incluye los tokens especiales BOS/EOS que la implementación oficial excluye.
- La gestión del prefijo de instrucción y de embed_mask debe implementarse en el código cliente (Swift o Python); un uso incorrecto degrada la calidad de la recuperación en consultas.
- Modelo monolingüe en japonés: no ofrece resultados fiables en castellano ni en otros idiomas.
- Es una conversión comunitaria y no oficial, sin respaldo de Preferred Networks, con 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación independiente.
- Riesgo de alucinación no aplicable en el sentido generativo (no produce texto), pero sí existe riesgo de recuperaciones semánticamente erróneas si los embeddings se usan fuera de dominio.
- Los sesgos heredados del corpus de entrenamiento del modelo base no están documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, siempre que se respeten las condiciones de atribución y se tenga en cuenta que el autor de la conversión no ofrece garantías.
- El repositorio ocupa 6,3 GB, un tamaño considerable para distribución en aplicaciones móviles; conviene incluir solo el bucket necesario.

## Enlaces

- Conversión Core ML: https://huggingface.co/masahiroid/plamo-embedding-1b-coreml
- Modelo base oficial: https://huggingface.co/pfnet/plamo-embedding-1b
- Árbol de ficheros del modelo base: https://huggingface.co/pfnet/plamo-embedding-1b/tree/main
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/plamo-embedding-1b/
- Ficha en Inferix: https://inferix.co/models/pfnet/plamo-embedding-1b
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/plamo-embedding-1b-pfnet
