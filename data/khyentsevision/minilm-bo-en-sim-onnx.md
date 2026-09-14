# khyentsevision/minilm-bo-en-sim-onnx

## Resumen

minilm-bo-en-sim-onnx es un export a ONNX del modelo de embeddings de frases khyentsevision/minilm-bo-en-sim, publicado por el usuario khyentsevision. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos pensada para ejecutarse en el navegador mediante transformers.js, lo que permite calcular similitud semántica entre frases sin backend ni GPU. El repositorio contiene únicamente los pesos convertidos: no incluye código ni pipeline.

El modelo se apoya en una arquitectura transformer de tipo encoder BERT (familia MiniLM, según las etiquetas del repositorio) y se distribuye en dos variantes: `onnx/model.onnx` en fp32 y `onnx/model_quantized.onnx` con cuantización dinámica int8 (~22 MB), que es la que usa por defecto el Space tibetan-english-aligner. La licencia es Apache 2.0, lo que facilita su integración en productos comerciales.

Su relevancia es doble. Por un lado, demuestra un flujo de trabajo reproducible de conversión y validación de un sentence-transformer a ONNX con pérdida mínima (similitud coseno por frase superior a 0,98 frente al modelo PyTorch original). Por otro, cubre un nicho poco atendido: la similitud semántica entre tibetano e inglés, aplicada a la alineación de corpus paralelos. La información pública disponible no detalla arquitectura interna, dimensiones de embedding ni datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (familia MiniLM), exportado a ONNX |
| Parámetros totales | No disponible (el modelo base no publica el recuento) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp32 (`onnx/model.onnx`) e int8 dinámica (`onnx/model_quantized.onnx`, ~22 MB) |
| Idiomas soportados | No disponible oficialmente; el nombre «bo-en» y el Space tibetan-english-aligner sugieren tibetano-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (un único archivo por variante) |
| Librería declarada | transformers.js |
| Pipeline | sentence-similarity / feature-extraction |
| Tamaño del repositorio | 0,1 GB |
| Dimensión del embedding | No disponible |

## Arquitectura y entrenamiento

No hay información publicada sobre el entrenamiento del modelo base khyentsevision/minilm-bo-en-sim: se desconoce el número de tokens, la composición del dataset, si hubo ajuste con pares de frases, uso de RLHF/DPO u otras técnicas. Lo único documentado en esta ficha es el proceso de conversión, no el de entrenamiento.

El repositorio es un artefacto de exportación: `onnx/model.onnx` se generó mediante exportación directa con optimum, y `onnx/model_quantized.onnx` aplica cuantización dinámica int8 sobre ese grafo. El autor indica que la reproducibilidad exige usar mean pooling sobre el último estado oculto enmascarado con `attention_mask` y normalización L2, el procedimiento estándar de sentence-transformers. La validación reportada compara la salida ONNX int8 con la del modelo PyTorch original: similitud coseno por frase superior a 0,98 en una muestra reservada (*held-out*), y la estructura de similitudes por pares —de la que depende la puntuación de alineación— se conserva correctamente. El tamaño exacto de esa muestra no se especifica.

## Capacidades

- Generación de embeddings de frases para similitud semántica (texto a vector), no generación de texto.
- Extracción de características (*feature-extraction*) reutilizable como encoder en tareas posteriores.
- Similitud cross-lingual tibetano-inglés, según el nombre del modelo y el Space que lo emplea.
- Inferencia en navegador y en el borde (*edge*) mediante transformers.js y ONNX Runtime Web, sin servidor.
- Ejecución en CPU con la variante int8, sin requisito de GPU.
- Mean pooling y normalización L2 explícitamente documentados para reproducir las representaciones originales.
- Puntuación de alineación entre pares de frases para corpus paralelos.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso (no es un modelo generativo).
- No dispone de modo *thinking*, visión, audio ni capacidades multimodales.

## Casos de uso

- Alineación de corpus paralelos tibetano-inglés: el modelo puntúa la similitud entre segmentos de ambos idiomas mediante similitud coseno; es exactamente el uso del Space tibetan-english-aligner, donde la variante int8 es la predeterminada.
- Búsqueda semántica en textos budistas tibetanos: indexar segmentos canónicos y recuperar los más cercanos a una consulta en inglés (o viceversa) con un índice vectorial, sin depender de coincidencia léxica.
- Recuperación aumentada (RAG) ligera en cliente: al caber en unos 22 MB en int8, puede embeder consultas y fragmentos directamente en el navegador de una aplicación de lectura o estudio, evitando enviar texto del usuario a un servidor.
- Deduplicación de memorias de traducción: calcular similitudes por pares para detectar pares redundantes o casi idénticos antes de consolidar una base de traducciones.
- Control de calidad de traducciones: ordenar pares (original, traducción) por puntuación de similitud cross-lingual para que los revisores humanos prioricen los segmentos con menor coincidencia semántica.
- Agrupación (*clustering*) y clasificación de segmentos: usar los embeddings como entrada de KMeans o de un clasificador ligero para organizar grandes colecciones de textos bilingües.
- Detección de paráfrasis y preguntas frecuentes en aplicaciones bilingües: comparar la consulta del usuario con un conjunto de respuestas canónicas ya embebidas.
- Extensiones educativas sin backend: al ser un export para transformers.js, se puede empaquetar en una web estática o una PWA que funcione sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, GLUE, STS u otros) en la información disponible. El único dato de rendimiento declarado es la validación de la conversión a ONNX:

| Validación | Resultado |
|---|---|
| Similitud coseno por frase, ONNX int8 frente a PyTorch original | > 0,98 en una muestra reservada |
| Estructura de similitud por pares | Preservada (sin cifra concreta) |
| Tamaño de la muestra de validación | No disponible |

## Requisitos de hardware

- VRAM para inferencia: no aplica en la práctica; la variante int8 puede ejecutarse en CPU. La variante fp32 es la que ocupa el grueso del repositorio de 0,1 GB.
- GPU recomendadas: no se documenta ninguna. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) puede acelerar el proceso por lotes, pero no es un requisito.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo, e incluso en dispositivos sin GPU dedicada.
- Despliegue: transformers.js (navegador y Node.js), ONNX Runtime y ONNX Runtime Web; la variante int8 es la adecuada para entornos con memoria limitada.
- Latencia y throughput: no disponibles. La cuantización int8 dinámica suele reducir el uso de memoria y el tiempo de inferencia en CPU, pero no hay cifras publicadas para este modelo.
- Almacenamiento: ~22 MB para la variante int8; el resto del espacio del repositorio corresponde al archivo fp32.

## Comparativa con modelos similares

Los valores de los modelos de referencia provienen de sus especificaciones públicas habituales y no se han verificado en la información proporcionada; el propio modelo evaluado no publica estos datos.

| Modelo | Parámetros | Dimensión de embedding | Contexto | Licencia | Formatos |
|---|---|---|---|---|---|
| khyentsevision/minilm-bo-en-sim-onnx | No disponible | No disponible | No disponible | Apache 2.0 | ONNX (fp32 e int8) |
| khyentsevision/minilm-bo-en-sim | No disponible | No disponible | No disponible | No disponible | PyTorch (modelo base) |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 384 | 256 tokens | Apache 2.0 | safetensors, ONNX |
| paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 384 | 128 tokens | Apache 2.0 | safetensors, ONNX |

La diferencia funcional relevante no está en el tamaño, sino en el dominio: los dos modelos de referencia son generalistas o multilingües de amplia cobertura, mientras que minilm-bo-en-sim-onnx está orientado al par tibetano-inglés según su denominación y su Space asociado. No hay datos de rendimiento que permitan comparar calidad de representaciones entre ellos.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings. No se puede usar para chat, resumen ni generación de código.
- No hay resultados de benchmarks públicos, por lo que la calidad de las representaciones en tibetano no está cuantificada más allá de la validación de la conversión a ONNX.
- La composición del dataset de entrenamiento es desconocida, de modo que no se pueden evaluar sesgos ni cobertura léxica. Al tratarse de un corpus presumiblemente budista o religioso, es probable un sesgo de dominio hacia ese registro.
- No se documenta el tokenizador ni la cobertura del vocabulario para la escritura tibetana; conviene validarlo con textos reales antes de producción, especialmente con ortografías o transliteraciones poco frecuentes.
- La conversión int8 se validó con similitud coseno superior a 0,98, pero el tamaño de la muestra y el conjunto de evaluación no se especifican; se recomienda repetir la validación con datos propios.
- Las representaciones solo son reproducibles si se aplica mean pooling sobre el último estado oculto enmascarado y normalización L2; usar otro pooling o no normalizar altera las similitudes.
- La licencia Apache 2.0 es permisiva y permite uso comercial, pero exige conservar los avisos de copyright y licencia. El modelo base no declara licencia en la información disponible, lo que conviene comprobar antes de un despliegue comercial.
- Al no incluir código ni pipeline, cualquier integración debe implementar la lógica de pooling y normalización por cuenta propia.
- El repositorio no tiene descargas ni valoraciones registradas, por lo que carece de validación por parte de la comunidad.
- Los resultados de la búsqueda web realizada no guardan relación con el modelo (corresponden a una plataforma educativa ajena), por lo que no aportan información adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khyentsevision/minilm-bo-en-sim-onnx
- Modelo base (PyTorch): https://huggingface.co/khyentsevision/minilm-bo-en-sim
- Space que usa la variante int8: https://huggingface.co/spaces/khyentsevision/tibetan-english-aligner
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Búsqueda web: no se encontraron enlaces relevantes sobre este modelo; los resultados devueltos corresponden a servicios no relacionados.
