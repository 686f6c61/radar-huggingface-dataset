# Foregazer/embeddinggemma-300m-foregazer-int8

## Resumen

EmbeddingGemma 300M Foregazer INT8 es una exportación ONNX cuantizada del modelo de embeddings de texto google/embeddinggemma-300m, preparada por el usuario Foregazer para su integración en la aplicación Foregazer (búsqueda local de texto y notas relacionadas). No se trata de un modelo nuevo entrenado, ni de una release oficial de Google, ni del paquete QAT oficial de Google: es un derivado que corrige y cuantiza el export previo de onnx-community y lo empaqueta para uso con ONNX Runtime en CPU.

El modelo resuelve la tarea de sentence-similarity generando embeddings de 768 dimensiones directamente desde el grafo ONNX, incluyendo las dos proyecciones Dense del modelo original. Está pensado para búsqueda semántica local en entornos sin GPU, con un tamaño de repositorio de 0,3 GB y cuantización dinámica post-entrenamiento U8/S8 por canal.

Su relevancia es acotada: es un artefacto de despliegue para una aplicación concreta, validado en CPU x64 (Windows, sin y con AVX2), con instrucciones de formato de texto específicas (prefijos `task: search result | query:` y `title: none | text:`) y una política de fragmentación de 512 tokens por fragmento que pertenece a la aplicación, no al modelo original. Bajo licencia Gemma Terms of Use, con restricciones de uso comercial y redistribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: google/embeddinggemma-300m), exportado a ONNX con cabecera de embeddings de 768 dimensiones (incluye ambas proyecciones Dense) |
| Parámetros totales | 300M (según el nombre del modelo base; no se detalla desglose) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el modelo original; la aplicación Foregazer usa como máximo 512 tokens por fragmento, incluyendo instrucciones y tokens especiales (política de aplicación, no límite del modelo) |
| Tipos de cuantización | U8/S8 dinámica post-entrenamiento, por canal, rango reducido; vocabulario en U8 con desquantización de filas seleccionadas |
| Idiomas soportados | no disponible oficialmente; la validación del autor cubrió ruso, ucraniano e inglés |
| Licencia | Gemma Terms of Use (con Gemma Prohibited Use Policy incorporada) |
| Formato de pesos | ONNX con datos externos (`model.onnx`, `model.onnx.data`, `tokenizer.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es google/embeddinggemma-300m, un encoder transformer de 300M parámetros especializado en generar embeddings de frases. El paquete de Foregazer no reentrena ni modifica los pesos más allá de la cuantización: parte del export previo de onnx-community/embeddinggemma-300m-ONNX, corregido contra el checkpoint original de Google (commit `57c266a740f537b4dc058e1b0cda161fd15afa75`), preservando valores FP32 originales y atención local. No se dispone de información sobre el dataset de entrenamiento, número de tokens ni si hubo RLHF/DPO, ya que la model card no lo detalla.

La innovación técnica del paquete es de despliegue: cuantización dinámica U8/S8 por canal con rango reducido sobre las matrices de pesos, vocabulario en U8 con desquantización selectiva de filas, uso de datos externos ONNX con cabecera de aviso de texto y offsets registrados, y un grafo que devuelve directamente el `sentence_embedding` de 768 dimensiones ya proyectado. El autor advierte explícitamente de que no se debe sustituir por pooling CLS o mean sobre hidden states crudos, y de que la salida debe normalizarse L2. No se soporta `from_pretrained()` de Sentence Transformers ni Transformers.js, y no debe habilitarse código remoto ni operadores personalizados.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones para similitud semántica y búsqueda.
- Recuperación de documentos con formato de instrucción específico: consultas con `task: search result | query: {text}` y documentos con `title: none | text: {text}`.
- Soporte de títulos y encabezados de sección embebidos en el cuerpo del documento (`title: none | text: \n{title}\n{heading}\n{text}`).
- Ejecución en CPU mediante ONNX Runtime, con selección automática de kernels soportados por la CPU (no requiere descarga de modelo por CPU).
- Multilingüe según validación del autor: ruso, ucraniano e inglés probados; el resto de idiomas no está documentado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica local en aplicaciones de escritorio: el paquete está diseñado para ONNX Runtime en CPU, de modo que una app como Foregazer puede indexar notas y recuperar fragmentos relevantes sin GPU ni servicios en la nube.
- Indexación de documentación con títulos y secciones: el formato `title: none | text: \n{title}\n{heading}\n{text}` permite incorporar jerarquía documental en el embedding, mejorando la recuperación de secciones concretas frente a fragmentos planos.
- Deduplicación y agrupación de notas: los embeddings de 768 dimensiones L2-normalizados permiten calcular similitud coseno para detectar contenido duplicado o agrupar notas relacionadas.
- Búsqueda de preguntas y respuestas sobre corpus pequeños: con fragmentación a 512 tokens por fragmento, encaja en bases de conocimiento personales o internas de baja latencia en CPU.
- Sistemas de recomendación de contenido textual: similitud entre documentos para sugerir lecturas o notas relacionadas dentro de una aplicación.
- Filtrado previo en pipelines RAG: al ejecutarse en CPU y ocupar 0,3 GB, puede actuar como recuperador de primera etapa en entornos sin acelerador, antes de un reranker o un LLM generativo.
- Procesamiento por lotes en servidores sin GPU: la cuantización U8/S8 reduce el coste de memoria y permite desplegar el modelo en instancias CPU estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se implica ninguna otra evaluación de calidad más allá de la validación funcional (comparación con el modelo original, instalación, reutilización y recarga/reload) realizada en Windows x64 con ONNX Runtime 1.22.1 sobre AMD FX-6300 (sin AVX2) e Intel Core i5-8265U (con AVX2).

## Requisitos de hardware

- VRAM estimada: no aplica para GPU; el paquete está orientado a CPU. El repositorio ocupa 0,3 GB, lo que da una idea del peso en disco y en memoria tras la carga.
- GPU recomendadas: no disponibles; el autor no documenta ejecución en GPU para este paquete.
- Cabida en GPU de consumo: no documentado. El modelo base de 300M podría ejecutarse en GPUs de consumo, pero este export ONNX está validado solo en CPU.
- Opciones de despliegue: ONNX Runtime (versión probada 1.22.1 en Windows x64). No es compatible con `from_pretrained()` de Sentence Transformers ni Transformers.js; no se debe usar con código remoto ni operadores personalizados.
- Latencia y throughput: no disponibles. Solo se documenta que funciona en AMD FX-6300 sin AVX2 y en Intel Core i5-8265U con AVX2, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Foregazer/embeddinggemma-300m-foregazer-int8 | 300M | no disponible (app: 512 tokens/fragmento) | ONNX int8 (datos externos) | Gemma Terms of Use | Hugging Face, 0 descargas |
| google/embeddinggemma-300m | 300M | no disponible | safetensors (original) | Gemma Terms of Use | Hugging Face (oficial) |
| onnx-community/embeddinggemma-300m-ONNX | 300M | no disponible | ONNX | Gemma Terms of Use | Hugging Face |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento entre estas variantes. La diferencia principal es el formato y el nivel de cuantización, no la arquitectura ni los parámetros.

## Limitaciones y advertencias

- No es una release oficial de Google ni un modelo nuevo entrenado; es un derivado de despliegue con modificaciones de cuantización y empaquetado.
- La cuantización es lossy: la propia model card advierte de que se pierde precisión respecto al checkpoint FP32 original.
- No soporta `from_pretrained()` de Sentence Transformers ni Transformers.js; intentar cargarlo con esas librerías fallará o requerirá ajustes no documentados.
- No debe habilitarse código remoto ni operadores personalizados al cargar el grafo ONNX.
- El grafo devuelve el `sentence_embedding` de 768 dimensiones ya proyectado; sustituirlo por pooling CLS o mean de hidden states crudos produce embeddings incorrectos.
- La salida debe normalizarse L2 antes de calcular similitud coseno.
- Los ficheros `model.onnx`, `model.onnx.data` y `tokenizer.json` deben mantenerse juntos; el grafo usa datos externos con offsets registrados tras una cabecera de aviso de texto.
- La validación se limita a Windows x64 con ONNX Runtime 1.22.1 y a ruso, ucraniano e inglés; no hay garantía para otras CPUs, runtimes, idiomas o textos.
- La política de 512 tokens por fragmento es de la aplicación Foregazer, no un límite documentado del modelo original; no debe confundirse con su contexto máximo.
- Licencia Gemma Terms of Use con Gemma Prohibited Use Policy incorporada: el uso comercial y la redistribución deben cumplir esas condiciones, preservar los avisos requeridos y trasladar las restricciones a los destinatarios. No hay aval de Google.
- Sin garantía: los ficheros se proporcionan tal cual.
- Riesgo de sesgos y alucinaciones: no documentado en la información disponible; al ser un modelo de embeddings, el riesgo principal es la recuperación de fragmentos irrelevantes o sesgados, no la generación de texto.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Foregazer/embeddinggemma-300m-foregazer-int8
- Modelo base original: https://huggingface.co/google/embeddinggemma-300m
- Export ONNX previo: https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
