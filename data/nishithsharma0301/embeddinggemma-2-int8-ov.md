# nishithsharma0301/embeddinggemma-2-int8-ov

## Resumen

EmbeddingGemma 2 INT8 OpenVINO es una conversión del modelo de embeddings `google/embeddinggemma-2` a formato OpenVINO IR con pesos comprimidos a INT8. Lo publica el usuario `nishithsharma0301` para el motor de búsqueda on-device de LESI. No es un modelo generativo, sino un codificador de frases que produce vectores de 768 dimensiones normalizados (norma L2 unitaria), utilizables directamente con similitud coseno para búsqueda semántica, recuperación de información y clustering.

La conversión incluye dos torres: una de texto, que acepta `input_ids` y `attention_mask` y devuelve `sentence_embedding`, y una de imagen, que acepta `pixel_values` con forma `[1, 2520, 768]`, `image_position_ids [1, 2520, 2]`, `attention_mask [1, 284]` y `position_ids [1, 284]`, y proyecta las imágenes al mismo espacio vectorial que el texto. La torre de audio del modelo original no está incluida. El pooling medio y la normalización L2 están integrados dentro de cada grafo, de modo que la salida es directamente el embedding final sin postprocesado adicional.

El interés de esta ficha radica en que permite ejecutar un modelo de embeddings multimodal en CPU sin GPU, con un repositorio de solo 0,6 GB gracias a la cuantización INT8, y con una fidelidad verificada frente al original en PyTorch (coseno ≥ 0,9997 tanto en texto como en imagen, con el ranking preservado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer de doble torre (texto e imagen) convertido a OpenVINO IR; pooling medio y normalización L2 embebidos en el grafo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la torre de imagen usa `attention_mask [1, 284]`) |
| Tipos de cuantizacion | Pesos INT8 asimétrico (NNCF, `INT8_ASYM`); activaciones obligatoriamente en f32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0, con solicitud de adherencia a la Gemma Prohibited Use Policy del modelo original |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`); tokenizador también en OpenVINO IR más ficheros `tokenizer.*` originales |
| Dimension del embedding | 768 (vector unitario) |
| Modelo base | `google/embeddinggemma-2` (commit `f9972ac22e696a105c482202646979e33e4b5a1e`) |
| Tamano del repositorio | 0,6 GB |
| Pipeline | `feature-extraction` |
| Versiones de工具 | OpenVINO 2026.5.0rc2, transformers 5.24.0, nncf 3.4.0, sentence-transformers 6.3.0 (verificación) |

## Arquitectura y entrenamiento

El modelo original es un codificador de embeddings de Google basado en la familia Gemma 2, con una torre de texto y una torre de visión que comparten espacio de embedding. Esta conversión no reentrena ni modifica los pesos más allá de la compresión: aplica cuantización INT8 asimétrica sobre los pesos mediante NNCF y exporta los grafos a OpenVINO IR. La innovación técnica relevante es de despliegue, no de modelado: el pooling medio y la normalización L2 se han movido dentro del grafo convertido, de forma que la salida `sentence_embedding` es ya un vector unitario listo para similitud coseno, y se ha verificado la equivalencia funcional con el modelo PyTorch original (coseno ≥ 0,9997 en texto e imagen, ranking preservado).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original usó RLHF, DPO u otras técnicas de alineación. La model card tampoco detalla la arquitectura interna exacta (número de capas, dimensión oculta, cabezas de atención) del modelo base. Un detalle operativo importante: las activaciones deben mantenerse en f32 porque, según la model card original, float16 provoca desbordamiento.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones, normalizados L2, para búsqueda semántica y recuperación densa.
- Generación de embeddings de imagen en el mismo espacio vectorial que el texto, lo que habilita búsqueda multimodal texto-a-imagen e imagen-a-imagen.
- Similitud coseno directa entre las salidas de ambas torres sin transformación adicional.
- Soporte de plantillas de prompt específicas: consultas con `task: search result | query: ` y documentos con `title: none | text: `; las imágenes no llevan prompt.
- Ejecución en CPU mediante OpenVINO, sin requisito de GPU.
- No incluye la torre de audio del modelo original.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica on-device en aplicaciones de escritorio o móviles: el modelo se ejecuta en CPU vía OpenVINO y devuelve vectores unitarios de 768 dimensiones que se indexan en una base vectorial local; el tamaño de 0,6 GB del repositorio lo hace viable en equipos sin GPU dedicada.
- Búsqueda multimodal texto-a-imagen en catálogos locales: la torre de imagen proyecta fotos al mismo espacio que las consultas de texto, de modo que una búsqueda por descripción recupera imágenes sin necesidad de etiquetado manual.
- Deduplicación y clustering de documentos: los embeddings normalizados permiten agrupar noticias, tickets o registros con similitud coseno y umbral fijo, sin depender de un servicio en la nube.
- Recuperación aumentada (RAG) en entornos con requisitos de privacidad: al ejecutarse localmente, los documentos no salen del dispositivo; el modelo actúa como codificador del índice y de las consultas.
- Moderación y clasificación de contenido por similitud: comparar embeddings de textos entrantes contra un conjunto de referencia de ejemplos etiquetados para asignar categorías.
- Sistemas de recomendación basados en contenido: calcular similitud entre descripciones de productos o artículos y el historial del usuario usando los vectores de texto directamente.
- Indexación de capturas o imágenes en herramientas de gestión documental: la torre de visión permite buscar visualmente dentro de repositorios de imágenes sin metadatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la fidelidad de la conversión frente al modelo PyTorch original: similitud coseno ≥ 0,9997 tanto para texto como para imágenes, con el ranking de recuperación preservado. No se proporcionan métricas de latencia ni de throughput.

## Requisitos de hardware

- Inferencia en CPU mediante OpenVINO; no requiere GPU.
- VRAM estimada: no aplica; el consumo es de memoria RAM del sistema. El repositorio ocupa 0,6 GB, por lo que la huella en memoria es del orden de unos pocos GB incluyendo activaciones en f32.
- GPU recomendadas: no disponibles; el formato OpenVINO está orientado a CPU e iGPU Intel, aunque OpenVINO también puede ejecutar en GPU Intel integrada.
- Cabe en cualquier equipo consumer con CPU moderna (x86-64 con instrucciones AVX2 o superior); no se especifican requisitos mínimos exactos.
- Opciones de despliegue: OpenVINO Runtime directamente, OpenVINO GenAI, o integración con sentence-transformers cargando los grafos IR. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| embeddinggemma-2-int8-ov (este) | no disponible | no disponible | Texto + imagen | Apache 2.0 | OpenVINO IR INT8 |
| google/embeddinggemma-2 (original) | no disponible | no disponible | Texto + imagen + audio | Apache 2.0 (con política Gemma) | PyTorch / safetensors |
| Alternativas de embeddings de la familia Gemma | no disponible | no disponible | Texto | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada. La diferencia principal frente al original es el formato de despliegue (OpenVINO IR frente a PyTorch), la cuantización INT8 y la ausencia de la torre de audio.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para completar texto, responder preguntas ni ejecutar herramientas.
- La torre de audio del modelo original no está incluida; cualquier caso de uso con audio queda fuera de alcance.
- Las activaciones deben permanecer en f32; usar float16 provoca desbordamiento según la model card original.
- La cuantización INT8 introduce una pérdida mínima pero no nula de fidelidad (coseno ≥ 0,9997), aceptable para recuperación pero a validar en dominios muy especializados.
- No se especifican los idiomas soportados; no se puede asumir cobertura multilingüe sin verificación empírica.
- No se detalla la longitud máxima de contexto; la torre de imagen usa una máscara de atención de 284 posiciones, pero el límite del texto no se indica.
- Riesgo de sesgo y alucinación: al ser un codificador, no alucina texto, pero hereda los sesgos del corpus de entrenamiento del modelo base, no documentados en esta conversión.
- La licencia Apache 2.0 permite uso comercial, pero la model card original solicita adherirse a la Gemma Prohibited Use Policy; conviene revisar esa política antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; es una conversión reciente sin validación comunitaria.
- El autor no documenta el proceso de conversión paso a paso ni publica scripts reproducibles en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nishithsharma0301/embeddinggemma-2-int8-ov
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
