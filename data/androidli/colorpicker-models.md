# androidli/colorpicker-models

## Resumen

`androidli/colorpicker-models` es una exportación a ONNX con cuantización INT8 del modelo de embeddings `sentence-transformers/all-MiniLM-L6-v2`, publicada por el usuario androidli. El resultado es un único fichero de 23 MB que genera embeddings de frases de 384 dimensiones y está pensado para ejecutarse íntegramente en el navegador mediante transformers.js u onnxruntime-web, sin necesidad de llamadas a un servidor.

Su propósito declarado es servir como embedder semántico para las herramientas de búsqueda por color del sitio toolve.net, admitiendo consultas en inglés y en alfabetos latinos. No es un modelo generativo: es un extractor de características (`feature-extraction`) que transforma texto en vectores densos utilizables para similitud semántica, búsqueda o clustering.

La relevancia práctica del artefacto es la combinación de tamaño reducido (23 MB), licencia Apache-2.0 heredada del modelo base y un formato listo para despliegue en cliente. No obstante, la documentación publicada es mínima, el modelo no aporta innovaciones arquitectónicas y el número de descargas (495) y de likes (0) refleja un uso muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L6-H384, transformer encoder de 6 capas) |
| Parametros totales | no disponible (el modelo base MiniLM-L6 tiene aproximadamente 22,7 M de parametros, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base admite hasta 256 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | INT8 dinamica (fichero `onnx/model_int8.onnx`) |
| Idiomas soportados | no disponible (la model card menciona consultas en ingles y alfabetos latinos, sin lista formal) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (unico fichero `onnx/model_int8.onnx`, 23 MB) |

## Arquitectura y entrenamiento

El modelo es una exportación del checkpoint `sentence-transformers/all-MiniLM-L6-v2`, que a su vez deriva de `nreimers/MiniLM-L6-H384-uncased`. Se trata de un encoder transformer BERT de 6 capas y dimensión oculta 384, entrenado originalmente con objetivos de similitud de frases para producir embeddings de 384 dimensiones. La exportación conserva `tokenizer.json`, `config.json` y `tokenizer_config.json` sin modificaciones respecto al modelo original, y añade un `manifest.json` con hashes SHA-256 y tamaños de cada fichero para verificación de integridad.

La única transformación aplicada es la cuantización dinámica a INT8 del `BertModel`, que reduce el peso del fichero a 23 MB. No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre etapas de RLHF o DPO; hay que remitirse al modelo base para esos datos. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.), más allá del propio proceso de cuantización y del empaquetado para ejecución en navegador.

## Capacidades

- Extracción de embeddings de frases de 384 dimensiones con pooling de media y normalización L2 (configurables en transformers.js).
- Búsqueda semántica y cálculo de similitud entre consultas de texto, orientado a la búsqueda por color en toolve.net.
- Ejecución completamente en cliente mediante transformers.js u onnxruntime-web, sin round-trip al servidor.
- Soporte de consultas en inglés y en alfabetos latinos según la model card; no se documentan otras lenguas.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes multi-paso: es exclusivamente un modelo de embeddings.
- Compatible con text-embeddings-inference y con endpoints compatibles según los tags del repositorio.

## Casos de uso

- Búsqueda semántica de colores en aplicaciones web: el modelo convierte consultas como "deep teal" en vectores de 384 dimensiones que se comparan por similitud coseno contra un índice de nombres de color, todo ejecutado en el navegador del usuario.
- Clasificación y agrupamiento de etiquetas de color: los embeddings permiten agrupar nombres de color similares o detectar duplicados semánticos en catálogos de pinturas, tintes o paletas.
- Autocompletado de consultas en interfaces de selección de color: al ejecutarse en cliente con 23 MB, permite sugerir colores relacionados mientras el usuario escribe, sin latencia de red.
- Deduplicación de textos cortos en pipelines de datos: útil para eliminar entradas redundantes en listas de nombres de producto o descripciones breves antes de indexarlas.
- Prototipado rápido de sistemas RAG ligeros en el navegador: sirve como embedder de consultas para demos o herramientas internas donde no se quiere desplegar infraestructura de inferencia.
- Filtrado previo en aplicaciones offline o con conectividad limitada: al no requerir servidor, puede integrarse en aplicaciones web progresivas o extensiones que funcionen sin conexión.
- Verificación de integridad en despliegues: el `manifest.json` con SHA-256 permite validar que los ficheros descargados en cliente no han sido alterados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero INT8 ocupa 23 MB y el modelo base ronda los 23 M de parámetros, por lo que la huella en memoria es mínima.
- GPU recomendadas: no requiere GPU; está diseñado para CPU y para ejecución en navegador (WASM/WebGPU mediante onnxruntime-web).
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles; no se necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: transformers.js (`@xenova/transformers`), onnxruntime-web, onnxruntime nativo, y text-embeddings-inference según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 6 capas y 384 dimensiones, la inferencia por frase es del orden de milisegundos en CPU, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| androidli/colorpicker-models | no disponible (base MiniLM-L6, ~22,7 M) | no disponible | ONNX INT8, 23 MB | Apache-2.0 | Exportación cuantizada para navegador |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens (modelo base) | safetensors / PyTorch | Apache-2.0 | Modelo original sin cuantizar; requiere runtime Python o conversión |
| sentence-transformers/paraphrase-MiniLM-L3-v2 | ~17 M | 128 tokens (modelo base) | safetensors / PyTorch | Apache-2.0 | Variante más pequeña de MiniLM para embeddings de frases |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens (modelo base) | safetensors / PyTorch | MIT | Embedder inglés con contexto mayor y mejor rendimiento en MTEB según su model card |

La comparación se limita a características publicadas; no se dispone de datos de rendimiento medidos para este artefacto concreto.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no puede responder preguntas ni producir texto.
- La model card no documenta sesgos conocidos, pero al derivar de un corpus web en inglés puede heredar sesgos léxicos y culturales del modelo base.
- Riesgo de alucinación no aplica en sentido estricto, pero sí de recuperaciones semánticamente erróneas cuando la consulta cae fuera del dominio de colores o del inglés.
- Idiomas: solo se mencionan inglés y alfabetos latinos; el rendimiento en castellano u otras lenguas no está documentado.
- Longitud de contexto no especificada en la información disponible; el modelo base tiene un límite de 256 tokens, por lo que textos largos se truncan.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia del modelo base y las condiciones del sitio toolve.net si se reutiliza el artefacto en un producto propio.
- La documentación es mínima (sin datos de entrenamiento, benchmarks ni métricas de calidad) y el repositorio tiene 0 likes y 495 descargas, lo que sugiere escasa validación por parte de la comunidad.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que el fichero ONNX no está correctamente contabilizado o que el repositorio está incompleto; conviene verificar la descarga real antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/androidli/colorpicker-models
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo base original: https://huggingface.co/nreimers/MiniLM-L6-H384-uncased
- Sitio de la herramienta: https://toolve.net
- Librería de inferencia en navegador: https://github.com/xenova/transformers.js
