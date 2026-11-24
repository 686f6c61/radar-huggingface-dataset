# smdesai/GLiFormer-0.4B-v1.5-H8-CoreAI

## Resumen

GLiFormer-0.4B-v1.5-H8-CoreAI es un port a Core AI (el framework de Apple para ejecución de modelos en dispositivo) del modelo `knowledgator/gliformer-0.4b-v1.5`, desarrollado originalmente por Knowledgator. Se trata de un encoder DeBERTa-v3-large de aproximadamente 0,4 mil millones de parámetros con cabezas de tarea ligeras que unifica en un solo modelo múltiples tareas de procesamiento de lenguaje natural estructurado: reconocimiento de entidades, clasificación de texto, extracción de relaciones, extracción de registros estructurados, cálculo de campos derivados, edición de texto y generación de embeddings.

La relevancia de esta variante concreta reside en su orientación a la inferencia local en dispositivos Apple (iOS 27+ y macOS 27+). El autor, `smdesai`, ha reempaquetado los pesos en formato `.aimodel` con segmentación del encoder en bloques de 128 tokens y cuantización int8 de las cabezas de tarea, manteniendo el encoder y las cabezas de edición en FP16. Esto reduce el tamaño de descarga y de caché en un 13 % respecto a la variante FP16 del mismo autor, a costa de una desviación de hasta 0,006 frente al modelo original (frente a 0,003 en la variante FP16).

El modelo resuelve el problema de ejecutar extracción de información estructurada de forma privada y sin conexión en hardware de consumo Apple, sin depender de APIs en la nube. Es relevante ahora porque Core AI es la nueva pila de inferencia de Apple y porque la unificación de tareas en un único encoder evita mantener varios modelos especializados en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-large con cabezas de tarea ligeras (incluye BiLSTM a nivel de palabra) |
| Parametros totales | ~0,4 mil millones (303M en las capas del encoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 4096 tokens (segmentación en bloques de 128; assets `mix_<L>` para L = 128, 256, …, 4096) |
| Tipos de cuantizacion | int8 (pesos por bloque de 32 canales, cómputo FP16) en cabezas de tarea; FP16 en encoder y cabezas de edición; FP32 en cabezas numéricas y BiLSTM |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Core AI), tokenizer SentencePiece Unigram con vocabulario de 128k; no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base es un encoder DeBERTa-v3-large con atención desenredada y posiciones relativas, sobre el que Knowledgator añade cabezas de tarea específicas para NER (planos y anidados), clasificación monoetiqueta y multietiqueta, extracción conjunta de entidades y relaciones, extracción de registros estructurados (campos de texto, clase, enumerado, objetos anidados, listas, números, fechas y horas), campos calculados (`$calculate`), edición de texto (ortografía, gramática, reescritura instruida) y embeddings. Varias tareas pueden ejecutarse en una sola pasada.

El port a Core AI no reentrena el modelo: reescribe la estructura del grafo para adaptarla al runtime de Apple. Entre las transformaciones aplicadas destacan cubos constantes de posición relativa (la ruta de log-buckets en coma flotante produce índices incorrectos en grafos convertidos), un desplazamiento relativo sin `gather`, atención SDPA fusionada, plegado de las proyecciones relativas de clave y consulta en tablas constantes por capa, y la reorganización del encoder en 24 segmentos de 128 tokens más una función `mix_<L>` sin pesos por longitud. El BiLSTM de palabra se desenrolla en pasos de 32 palabras con estado transportado, y los helpers del código original que ramifican sobre valores de tensor se sustituyen por código de forma fija bajo precondiciones garantizadas por el host. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento de entidades nombradas, tanto plano como anidado, con grupos de etiquetas y prompts de tarea.
- Clasificación de texto monoetiqueta y multietiqueta, con varios grupos de etiquetas.
- Extracción conjunta de entidades y relaciones.
- Extracción de registros estructurados: campos de texto, clase y enumerado, objetos anidados y listas, con números, fechas y horas interpretados como valores.
- Campos calculados mediante `$calculate`: sumas, diferencias y ratios sobre números presentes en el texto.
- Edición de texto: corrección ortográfica, corrección gramatical y reescrituras guiadas por instrucción (56 funciones que comparten un único conjunto de pesos).
- Generación de embeddings de texto.
- Ejecución de varias tareas en una sola pasada.
- Inferencia en dispositivo (on-device) en iOS 27+ y macOS 27+ mediante Core AI.
- No se documenta soporte de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Extracción de entidades en documentos locales: el modelo procesa texto en el dispositivo con ventana de hasta 4096 tokens y devuelve entidades planas o anidadas, útil en apps de gestión documental que no pueden enviar datos a la nube.
- Digitalización de facturas y recibos: la extracción de registros estructurados con campos numéricos, fechas y horas permite convertir texto OCR en objetos tipados, y `$calculate` puede derivar totales o ratios directamente.
- Corrección ortográfica y gramatical en apps de escritura para iOS y macOS: las cabezas de edición en FP16 aplican correcciones o reescrituras instruidas sin salir del dispositivo, preservando la privacidad del usuario.
- Clasificación multietiqueta de tickets o correos: con varios grupos de etiquetas en una sola pasada, encaja en flujos de triaje local en herramientas de productividad.
- Construcción de grafos de conocimiento locales: la extracción conjunta de entidades y relaciones permite poblar bases de datos estructuradas a partir de notas o artículos sin conexión.
- Búsqueda semántica en dispositivo: la generación de embeddings habilita índices vectoriales locales en apps de notas o correo, con el modelo cacheado en el dispositivo (1,45 GB el asset principal).
- Anonimización previa a sincronización: detectar entidades sensibles (nombres, organizaciones) antes de enviar texto a un servidor, usando NER en el dispositivo como paso de filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la variante int8 pasa la misma validación que la variante FP16, con desviaciones de hasta 0,006 frente al modelo original (frente a 0,003 en FP16), sin detallar las métricas concretas ni los conjuntos de evaluación.

## Requisitos de hardware

- Inferencia orientada a hardware Apple con Core AI: iPhone y iPad con iOS 27+ y Mac con macOS 27+.
- Tamaño del asset principal (`GLiFormer-0.4B-H8.aimodel`): 1,45 GB; repositorio completo: 1,5 GB.
- Assets auxiliares: 32 assets `mix_<L>` sin pesos (8–80 KB cada uno) y un asset BiLSTM en FP32 para CPU (25 MB).
- VRAM/unificación de memoria estimada: no disponible de forma explícita; el asset principal de 1,45 GB marca el mínimo de memoria para los pesos, a lo que se suman buffers de activación por longitud de secuencia.
- No se documenta compatibilidad con GPU NVIDIA (A100, H100, RTX 4090) ni con runtimes como vLLM, llama.cpp, Ollama o TGI; el formato `.aimodel` es específico de Core AI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| GLiFormer-0.4B-v1.5-H8-CoreAI (este) | ~0,4B | hasta 4096 | `.aimodel` / Core AI | Apache 2.0 | Cabezas de tarea en int8, encoder FP16, orientado a dispositivo Apple |
| smdesai/GLiFormer-0.4B-v1.5-FP16-CoreAI | ~0,4B | hasta 4096 | `.aimodel` / Core AI | Apache 2.0 | Misma exportación sin cuantización int8; desviación de 0,003 frente al original |
| knowledgator/gliformer-0.4b-v1.5 | ~0,4B | no disponible | Transformers (upstream) | Apache 2.0 | Modelo original; referencia de fidelidad para los ports |
| DeBERTa-v3-large (base arquitectónica) | ~0,4B | 512 típico en el original | safetensors / Transformers | MIT (upstream DeBERTa) | Solo encoder; sin cabezas de tarea unificadas |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada; la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta cobertura multilingüe.
- El modelo es un encoder con cabezas de tarea, no un modelo generativo de propósito general: no debe esperarse diálogo abierto ni generación libre de texto.
- La cuantización int8 de las cabezas introduce una desviación de hasta 0,006 frente al modelo original, superior a la de la variante FP16 (0,003); para máxima fidelidad debe usarse la variante FP16.
- Las cabezas de edición se mantienen en FP16 porque en int8 dos especializaciones del mismo asset discrepaban en decisiones de edición, lo que indica sensibilidad de esas tareas a la cuantización.
- Dependencia estricta de Core AI y de iOS 27+/macOS 27+; no es desplegable en otros runtimes sin reconversión.
- El repositorio no incluye pesos en safetensors ni GGUF, lo que limita su uso fuera del ecosistema Apple.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un extractor, el riesgo principal es la extracción incorrecta de entidades o relaciones, no la fabricación de texto.
- Licencia Apache 2.0 permite uso comercial, pero los créditos del modelo corresponden a Knowledgator y a los autores de GLiFormer; debe conservarse el aviso de licencia y la atribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smdesai/GLiFormer-0.4B-v1.5-H8-CoreAI
- Variante FP16 del mismo autor: https://huggingface.co/smdesai/GLiFormer-0.4B-v1.5-FP16-CoreAI
- Modelo base original: https://huggingface.co/knowledgator/gliformer-0.4b-v1.5
- Repositorio de código de GLiFormer: https://github.com/Knowledgator/GLiFormer
- Sitio de Knowledgator: https://knowledgator.com
