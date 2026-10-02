# anudit/embeddinggemma-300m-ONNX-sliding-window

## Resumen

EmbeddingGemma-300M-ONNX-sliding-window es un export a ONNX en float32 derivado de google/embeddinggemma-300m, el modelo de embeddings de Google DeepMind. Se trata de una reparacion independiente de la comunidad realizada por el usuario anudit sobre el export previo de onnx-community (revision 5090578d9565bb06545b4552f76e6bc2c93e4a66). No es un modelo nuevo: reutiliza los pesos y el tokenizador originales y solo modifica el grafo ONNX.

El problema que resuelve es de fidelidad numerica. El export original aplicaba atencion sin restricciones en todas las capas, mientras que la arquitectura Gemma 3 text prevé una combinacion de atencion local y global. Esta reparacion restaura una mascara de atencion bidireccional dinamica en 20 capas locales con un radio inclusivo de 256 posiciones, dejando cuatro capas de atencion completa sin restringir. El resultado es un grafo que coincide con la implementacion de referencia en las pruebas de paridad realizadas.

Es relevante porque EmbeddingGemma-300M esta disenado para generar embeddings de frases y pasajes para busqueda semantica, similitud y recuperacion, con una ventana de contexto de 2048 tokens y una dimension de embedding de 768. Esta variante ONNX permite desplegarlo con Text Embeddings Inference (TEI) sobre el backend ORT en CPU o GPU, y su relevancia practica reside en que corrige una discrepancia de atencion detectable a partir de 512 tokens en el export original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 3 text (gemma3_text), exportado a ONNX con atencion hibrida: 20 capas locales (radio inclusivo de 256 posiciones) y 4 capas de atencion completa |
| Parametros totales | 300M (segun el nombre del modelo base, google/embeddinggemma-300m) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | solo float32 (el repositorio contiene unicamente la variante float32) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (sujeta a la seccion 3.2 y a la Gemma Prohibited Use Policy) |
| Formato de pesos | ONNX (onnx/model.onnx y onnx/model.onnx_data, que deben mantenerse juntos); tamano del repositorio 1,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de type gemma3_text, segun la etiqueta del repositorio, del que no se proporcionan detalles adicionales sobre la composicion del dataset, el numero de tokens de entrenamiento ni el uso de tecnicas como RLHF o DPO en la informacion disponible. Lo que si se documenta es la modificacion del grafo: se restaura una mascara de atencion bidireccional dinamica para 20 capas locales con radio inclusivo de 256 posiciones, mientras que cuatro capas de atencion completa mantienen atencion sin restringir. El export original usaba atencion sin restringir en todas las capas.

El grafo modificado produce las salidas last_hidden_state y sentence_embedding normalizada, conservando el mean pooling y ambas proyecciones densas. Los pesos externos y los ficheros del tokenizador no se han modificado respecto al export original. La reparacion se documenta mediante un script (repair_embeddinggemma_onnx.py) y mediciones crudas con sumas de comprobacion (embeddinggemma-comparison.json). El autor presenta esto como una reparacion comunitaria independiente, no como un entrenamiento ni una destilacion.

## Capacidades

- Generacion de embeddings de frases y pasajes para similitud semantica y recuperacion (retrieval), con dimension de embedding de 768.
- Extraccion de caracteristicas (feature-extraction) para tareas de sentence-similarity.
- Procesamiento de secuencias de hasta 2048 tokens.
- Salida de sentence_embedding normalizada, apta para calcular similitud coseno directamente.
- Compatibilidad con Text Embeddings Inference (TEI) mediante el backend ORT (ONNX Runtime).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni modo thinking; es un modelo exclusivamente de embeddings.
- El soporte multilingue no esta especificado en la informacion disponible.

## Casos de uso

- Busqueda semantica en bases documentales: indexar pasajes de hasta 2048 tokens y recuperar los mas similares a una consulta mediante similitud coseno sobre los embeddings de 768 dimensiones.
- Deduplicacion de contenido: calcular embeddings de articulos o registros y agrupar por umbral de similitud para eliminar duplicados o casi duplicados.
- Sistema de recomendacion por contenido: representar items y preferencias de usuario en el mismo espacio vectorial de 768 dimensiones para sugerir elementos afines.
- Clasificacion de textos por similitud a prototipos: construir embeddings de referencia por categoria y asignar etiquetas a nuevos textos por vecindad en el espacio de embeddings.
- Recuperacion aumentada (RAG) en pipelines propios: usar esta variante ONNX con TEI para servir embeddings de consulta y de documentos en infraestructura controlada, incluyendo despliegue en CPU.
- Moderacion o filtrado por similitud: comparar entradas contra un conjunto de ejemplos de referencia para detectar contenido proximo a categorias definidas.
- Verificacion de paridad en migraciones: emplear la tabla de comparacion incluida para validar que un despliegue propio reproduce los resultados esperados frente a la version alojada en Cloudflare.
- Clustering no supervisado de textos: agrupar documentos por proximidad de embeddings para exploracion tematica o analisis de corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento documentado es una comparacion de paridad de similitud coseno frente a la version alojada en Cloudflare (@cf/google/embeddinggemma-300m), medida con el backend ONNX en Rust de TEI sobre CPU en float32, con ONNX Runtime 1.30.0 y el mismo texto. Los recuentos de tokens incluyen tokens especiales y no se anadio prompt. Cada fila usa un prefijo de un pasaje fijo de investigacion sobre rios.

| Tokens | ONNX original vs Cloudflare | ONNX reparado vs Cloudflare |
| ---: | ---: | ---: |
| 128 | 1,000000 | 1,000000 |
| 256 | 1,000000 | 1,000000 |
| 512 | 0,991189 | 1,000000 |
| 1024 | 0,966595 | 1,000000 |
| 2048 | 0,948664 | 1,000000 |

Las puntuaciones son similitudes coseno redondeadas a seis decimales, no igualdad bit a bit. Tambien se probaron lotes de igual longitud (512, 512) y lotes con relleno (128, 512, 1024), que coincidieron con la inferencia individual dentro de la tolerancia probada. El autor indica que estas comprobaciones establecen concordancia para las entradas probadas, no una paridad completa del modelo ni una medida de calidad de recuperacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,3 GB para los pesos en float32 (300M parametros), mas memoria adicional para activaciones y el grafo ONNX. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- GPU: cualquier GPU con al menos 2-3 GB de VRAM libre deberia poder alojar los pesos en float32; se recomienda verificar con margen para activaciones.
- Cabe en GPU de consumo: si, el modelo de 300M en float32 esta dentro del rango de GPU de consumo modernas (por ejemplo, RTX 3060 o superiores); el nombre del modelo base confirma el orden de magnitud de 300M parametros.
- Opciones de despliegue: Text Embeddings Inference (TEI) mediante el backend ORT, con el comando documentado: text-embeddings-router --model-id anudit/embeddinggemma-300m-ONNX-sliding-window --dtype float32 --port 8080. Se requiere una build de TEI con el backend ORT habilitado.
- La evaluacion documentada se realizo en CPU (backend ONNX en Rust de TEI), por lo que el despliegue en CPU es viable para cargas moderadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks en la informacion proporcionada para comparar cuantitativamente con alternativas. La comparacion documentada es entre distintas versiones del mismo modelo.

| Version | Formato | Atencion | Paridad con referencia (2048 tokens) | Licencia |
|---|---|---|---:|---|
| EmbeddingGemma-300M-ONNX original (onnx-community) | ONNX float32 | Sin restricciones en todas las capas | 0,948664 | Gemma Terms of Use |
| EmbeddingGemma-300M-ONNX-sliding-window (este modelo) | ONNX float32 | 20 capas locales (radio 256) + 4 completas | 1,000000 | Gemma Terms of Use |
| @cf/google/embeddinggemma-300m (Cloudflare) | Servicio alojado | No disponible | Referencia | Gemma Terms of Use |

Otros modelos de embeddings de tamano comparable: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni resuelve tareas de razonamiento, codigo o matematicas.
- La reparacion modifica unicamente onnx/model.onnx; los pesos externos y el tokenizador no cambian. Hay que mantener onnx/model.onnx y onnx/model.onnx_data juntos para que el grafo funcione.
- La validacion de paridad se limita a las entradas probadas (un pasaje fijo y unos pocos tamanos de lote). El autor advierte explicitamente que no constituye una paridad completa del modelo ni una medida de calidad de recuperacion.
- Las puntuaciones de paridad son similitudes coseno redondeadas, no igualdad bit a bit.
- Solo se distribuye la variante float32, sin cuantizaciones; esto limita el ahorro de memoria frente a alternativas int8 u otras.
- Licencia Gemma Terms of Use: sujeta a las restricciones de la seccion 3.2 y a la Gemma Prohibited Use Policy. Conviene revisar los terminos antes de uso comercial.
- Idiomas soportados: no disponible en la informacion proporcionada.
- Riesgo de sesgos y de alucinacion: no evaluado en la informacion disponible; al tratarse de un modelo de embeddings, no aplica la generacion de texto, pero persisten riesgos de sesgo en la representacion vectorial.
- Comunidad: 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion 2026-10-02; es un artefacto reciente y con poca validacion externa.
- El repositorio se apoya en una revision concreta del export de onnx-community (5090578d9565bb06545b4552f76e6bc2c93e4a66), por lo que cambios posteriores en el upstream no se reflejan en esta reparacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anudit/embeddinggemma-300m-ONNX-sliding-window
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Export ONNX de origen: https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX
- Resultados completos de comparacion: embeddinggemma-comparison.md (incluido en el repositorio)
- Mediciones crudas y sumas de comprobacion: embeddinggemma-comparison.json (incluido en el repositorio)
- Script de reparacion: repair_embeddinggemma_onnx.py (incluido en el repositorio)
- Model card upstream: UPSTREAM_MODEL_CARD.md (incluido en el repositorio)
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
