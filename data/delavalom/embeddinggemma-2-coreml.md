# delavalom/embeddinggemma-2-coreml

## Resumen

`delavalom/embeddinggemma-2-coreml` es una conversión no oficial a Core ML del modelo de embeddings multimodal `google/embeddinggemma-2` de Google DeepMind, publicada por el usuario delavalom en Hugging Face. El modelo original genera embeddings de texto e imágenes en un espacio compartido de 768 dimensiones, y esta conversión lo adapta para ejecutarse de forma eficiente en el Apple Neural Engine de dispositivos iOS y macOS, resolviendo el problema de desplegar embeddings multimodales de alta calidad en apps nativas de Apple sin depender de servidores.

La relevancia de esta ficha radica en que permite búsqueda semántica, clasificación y clustering multimodal completamente en el dispositivo, con cuantización int8/int4 que reduce el tamaño a unos 343-353 MB descargables. La conversión incluye un paquete Swift de apoyo con tokenizador, preprocesado de imágenes e índice vectorial en disco, lo que facilita la integración en aplicaciones de búsqueda local y RAG on-device. Se trata de una conversión verificada contra el modelo PyTorch original, aunque los vectores resultantes son cercanos pero no idénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings multimodal (texto e imagen) con espacio compartido de 768 dimensiones; detalles de la arquitectura base no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Hasta 128 tokens en la conversión Core ML (funciones de 16, 32, 64 y 128 tokens); el modelo upstream permite hasta 8K tokens |
| Tipos de cuantizacion | int8 por canal (pesos convolucionales), int4 por bloque de 32 (tabla de embeddings), FP16 para tablas y normalizaciones; variante `int8_table4` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con Gemma Prohibited Use Policy del modelo upstream aplicable) |
| Formato de pesos | Core ML `.mlpackage`, distribuido como archivo Apple Archive LZFSE (`.aar`); tokenizer en `tokenizer.json` sin modificar |

## Arquitectura y entrenamiento

El modelo base `google/embeddinggemma-2` es un modelo de embeddings multimodal que proyecta texto e imágenes a un mismo espacio vectorial de 768 dimensiones, lo que permite búsqueda cruzada texto-imagen y texto-texto con una única métrica de similitud. Esta conversión re-implementa los pesos originales en PyTorch, los convierte a Core ML, los casta a FP16 y los comprime con int8 por canal en convoluciones e int4 por bloque (tamaño 32) en la tabla de embeddings, manteniendo tablas y normalizaciones en FP16.

El paquete Core ML se divide en dos variantes según el presupuesto de tokens de imagen: `b70` (60-70 tokens de imagen) y `b280` (256-280 tokens de imagen), cada una con cinco funciones de imagen según relación de aspecto (tall, portrait, square, landscape, wide) y cuatro funciones de texto compartidas. Cada función tiene formas fijas y devuelve un embedding float32 de `[1, 768]` L2-normalizado. No hay información disponible sobre el proceso de entrenamiento del modelo base (tokens de entrenamiento, composición del dataset, RLHF/DPO), que debe consultarse en la model card de Google.

## Capacidades

- Generación de embeddings de texto con longitudes fijas de 16, 32, 64 y 128 tokens mediante funciones separadas con formas estáticas
- Generación de embeddings de imagen en cinco relaciones de aspecto distintas, con dos presupuestos de calidad (70 y 280 tokens de imagen)
- Embeddings multimodales en un espacio compartido de 768 dimensiones: similitud texto-texto, imagen-imagen y texto-imagen
- Truncamiento Matryoshka: los vectores de 768 dimensiones pueden reducirse a 512, 256 o 128 dimensiones re-normalizando (el paquete Swift usa 256 por defecto)
- Ejecución optimizada en Apple Neural Engine (compilado para `.cpuAndNeuralEngine`), además de CPU
- Preprocesado de imágenes documentado: redimensionado directo al bucket (sin recorte ni padding), sRGB de 8 bits, remuestreo bicúbico antialiased y escala 1/255 sin normalización de media/desviación
- Plantillas de prompt del modelo upstream: `task: search result | query: ` para consultas, `title: none | text: ` para documentos, además de variantes para clasificación y clustering
- Paquete Swift con descarga, verificación SHA-256, tokenizador, preprocesado e índice vectorial en disco

## Casos de uso

- Búsqueda semántica local en apps iOS y macOS: el modelo genera embeddings en el dispositivo y el índice vectorial en disco del paquete Swift permite buscar en documentos o notas sin conexión ni servidor
- Búsqueda multimodal texto-imagen: al compartir espacio de 768 dimensiones, una consulta en texto puede recuperar imágenes relevantes de la biblioteca del usuario, útil para gestores de fotos privados
- Clasificación on-device: usando el prompt `task: classification | query: `, se pueden clasificar textos o imágenes por similitud con ejemplos etiquetados, sin enviar datos a la nube
- Clustering de contenido: agrupación de notas, capturas o documentos por similitud semántica usando la plantilla `task: clustering | query: `
- Deduplicación y detección de contenido similar: comparación de embeddings de imágenes con presupuesto de 280 tokens para mayor precisión en apps de galería
- RAG en el dispositivo: embeddings de documentos locales combinados con un LLM local para recuperación aumentada sin exponer datos privados, aprovechando el tamaño reducido (343-353 MB)
- Apps con restricciones de tamaño: el presupuesto de 70 tokens (343,2 MB) cabe en el límite de descarga bajo demanda de 360 MB de App Store, ideal para features opcionales

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de precisión contra el modelo original ("Accuracy against the original model") cuyos valores numéricos no están incluidos en la información proporcionada; se indica que los vectores son "cercanos pero no idénticos" a los del modelo PyTorch original y que las cifras de precisión se miden a 768 dimensiones.

## Requisitos de hardware

- Requisito de sistema: iOS 18 o superior, o macOS 15 o superior (el modelo usa operadores `ios18` de Core ML)
- Dispositivos objetivo: Apple Neural Engine (compilado para `.cpuAndNeuralEngine`); también ejecutable en CPU
- Espacio en disco: 343,2 MB (budget 70) o 352,9 MB (budget 280) descargados; 435,0 / 454,9 MB descomprimidos; el paquete Core ML solo ocupa 402,8 / 422,8 MB
- No requiere GPU dedicada ni VRAM: está diseñado para hardware Apple integrado (iPhone, iPad y Mac con Neural Engine)
- Despliegue: integración nativa mediante el paquete Swift [`EmbeddingGemma`](https://github.com/Delavalom/embeddinggemma-coreml), que gestiona descarga, verificación, tokenización, preprocesado e índice vectorial; no aplica vLLM, llama.cpp, Ollama ni TGI al ser un formato Core ML
- Latencia y throughput estimados: no disponible

## Comparativa con modelos similares

| Modelo | Modalidades | Dimensiones | Cuantizacion | Plataforma objetivo | Licencia |
|---|---|---|---|---|---|
| delavalom/embeddinggemma-2-coreml | Texto e imagen | 768 (Matryoshka a 512/256/128) | int8/int4 (FP16 en tablas y norms) | iOS 18+ / macOS 15+ (Neural Engine) | Apache 2.0 |
| google/embeddinggemma-2 (original) | Texto e imagen | 768 (Matryoshka) | FP (safetensors, sin cuantizar) | Servidores / PyTorch | Apache 2.0 (Gemma Prohibited Use Policy) |
| Alternativas Core ML de embeddings multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen otras conversiones Core ML directamente comparables de modelos de embeddings multimodal con espacio compartido texto-imagen en la información disponible; la comparación más relevante es con el modelo base original, del que esta conversión difiere en formato, cuantización y plataforma de ejecución.

## Limitaciones y advertencias

- Se trata de una conversión no oficial: no está creada ni respaldada por Google; los vectores generados son cercanos pero no idénticos a los del modelo original, lo que puede afectar a índices construidos con el modelo upstream
- La longitud de texto está limitada a 128 tokens en esta conversión (el upstream permite 8K), lo que restringe documentos largos; entradas más largas se truncan conservando `<bos>` y `<eos>`
- Audio y video no están convertidos: solo texto e imágenes
- Solo se puede usar un presupuesto de imagen por dispositivo (70 o 280 tokens), lo que obliga a elegir entre tamaño y precisión en tiempo de empaquetado
- Las imágenes se redimensionan directamente al tamaño del bucket sin recorte ni padding, lo que puede distorsionar imágenes con relaciones de aspecto extremas
- Aunque la licencia es Apache 2.0, la Gemma Prohibited Use Policy del modelo upstream se transmite y aplica a esta conversión; hay que revisarla antes de desplegar en producción
- La model card upstream indica que los desarrolladores son responsables de salvaguardas a nivel de aplicación (filtrado de recuperación, pruebas de equidad) según su caso de uso
- Sesgos, riesgo de alucinación y rendimiento por idioma: no disponible en la información proporcionada; consultar la model card de Google
- Modelo con muy poca tracción comunitaria (11 descargas y 2 likes en el momento de la ficha), por lo que el soporte y la detección de errores dependen prácticamente del autor

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/delavalom/embeddinggemma-2-coreml
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Paquete Swift (GitHub): https://github.com/Delavalom/embeddinggemma-coreml
- Gemma 4 license (Google): https://ai.google.dev/gemma/docs/gemma_4_license
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Model card de Google (usos previstos y limitaciones): https://huggingface.co/google/embeddinggemma-2
