# mradermacher/Nemotron-3.5-Embed-1B-BF16-GGUF

## Resumen

Nemotron-3.5-Embed-1B es un modelo de embeddings multimodales desarrollado por NVIDIA que proyecta texto, imágenes y capturas de páginas de documento en un mismo espacio vectorial de 2048 dimensiones. Está pensado para recuperación de información y generación aumentada por recuperación (RAG) sobre corpus mixtos: PDFs, presentaciones, facturas escaneadas y texto plano. Combina el encoder de texto Nemotron-3-Embed-1B (transformer con atención bidireccional y average pooling) con un encoder de visión, de modo que una página de documento puede indexarse directamente como imagen, sin necesidad de OCR previo.

La ficha que se describe aquí corresponde a la distribución en formato GGUF publicada por mradermacher, no al repositorio original de NVIDIA. El repositorio ofrece cuantizaciones estáticas del modelo base BF16 más los suplementos multimodales (`mmproj`) necesarios para procesar imágenes en llama.cpp. El modelo base se distribuye con licencia openmdw-1.1 y soporta 33 idiomas, además de la etiqueta genérica `multilingual`.

Su relevancia actual está en cubrir el tramo "pequeño" del retrieval multimodal: con ~414 millones de parámetros según los safetensors del repositorio (la nomenclatura comercial indica 1B, discrepancia que la información disponible no aclara), 32 000 tokens de contexto y dimensiones Matryoshka, es desplegable en GPU de consumo y encaja en pipelines de búsqueda semántica donde un modelo multimodal grande resultaría prohibitivo en coste por consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención bidireccional (encoder de texto) + encoder de visión; embedding final por average pooling de las representaciones token-level; espacio vectorial compartido texto-imagen de 2048 dimensiones |
| Parametros totales | 413.794.304 según safetensors del repositorio base; la nomenclatura comercial indica 1B (discrepancia no aclarada en la información disponible) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Hasta 32 000 tokens (según la ficha de NVIDIA NIM y DeepInfra) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; suplementos multimodales mmproj-Q8_0 y mmproj-f16. No hay cuantizaciones weighted/imatrix disponibles según el autor |
| Idiomas soportados | 33 idiomas declarados: en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi, más la etiqueta `multilingual` |
| Licencia | openmdw-1.1 (enlace: https://openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (esta distribución); safetensors BF16 en el repositorio base de NVIDIA |

## Arquitectura y entrenamiento

El encoder de texto es un transformer con enmascaramiento de atención bidireccional: a diferencia de un modelo generativo causal, cada token atiende a todos los demás, y el vector de embedding se obtiene aplicando average pooling sobre las representaciones de todos los tokens. Sobre esa base, la variante 3.5 acopla un encoder de visión que permite procesar la página de un documento como imagen y situar el vector resultante en el mismo espacio de 2048 dimensiones que los embeddings de texto, lo que habilita búsquedas cruzadas texto-a-imagen e imagen-a-texto. El modelo soporta dimensiones Matryoshka, es decir, permite truncar el vector de salida a dimensiones menores sacrificando granularidad a cambio de reducir memoria y latencia en el índice vectorial.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF/DPO o ajuste contrastivo con pares negativos hard. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal, que por otra parte no aplican a un modelo de embeddings sin generación autorregresiva.

## Capacidades

- Generación de embeddings de texto con pooling de media sobre representaciones token-level.
- Generación de embeddings de imagen y de capturas de página completa de documento (PDF, slides) mediante el encoder de visión y los ficheros `mmproj`.
- Espacio vectorial compartido texto-imagen de 2048 dimensiones, lo que permite similitud cruzada entre modalidades.
- Dimensiones Matryoshka: truncado del vector de salida para ajustar precisión frente a coste de almacenamiento y búsqueda.
- Contexto de hasta 32 000 tokens, adecuado para fragmentos largos, tablas extensas y páginas densas.
- Recuperación multilingüe en 33 idiomas dentro del mismo espacio vectorial.
- Compatibilidad declarada con vLLM, transformers y llama.cpp (vía GGUF); también disponible como endpoint en NVIDIA NIM y DeepInfra.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo "thinking": es un modelo de representación, no un modelo conversacional.

## Casos de uso

- RAG sobre documentación técnica multilingüe: indexar manuales y artículos en los 33 idiomas soportados y recuperar fragmentos relevantes con una sola consulta, aprovechando los 32 000 tokens de contexto para conservar tablas y secciones completas sin trocear en exceso.
- Retrieval visual de documentos escaneados: embeber directamente la imagen de la página de un PDF o una presentación, sin pipeline de OCR, y recuperar la página concreta que responde a una consulta textual; el `mmproj` permite procesar la imagen en llama.cpp.
- Búsqueda semántica en catálogos de e-commerce: indexar título, descripción e imagen del producto en un mismo espacio vectorial para responder consultas del tipo "algo como esta foto pero en azul" con una única métrica de similitud.
- Deduplicación y clustering de datasets multimodales: calcular similitud coseno sobre pares imagen-texto a escala para eliminar duplicados y agrupar ejemplos antes del entrenamiento; el truncado Matryoshka a 256 o 512 dimensiones reduce el coste del índice y acelera el cálculo por pares.
- Clasificación y enrutado zero-shot: calcular el embedding de prototipos de intención y asignar cada ticket o correo al más cercano, sin entrenar un clasificador supervisado, útil cuando aparecen categorías nuevas con frecuencia.
- Memoria semántica para agentes: indexar observaciones, resultados de herramientas y fragmentos de conversación en un almacén vectorial y recuperar por similitud los recuerdos relevantes en cada turno, con coste de inferencia bajo por el tamaño reducido del modelo.
- Verificación de grounding en respuestas: comprobar si cada afirmación de una respuesta generada tiene soporte en el documento fuente comparando embeddings de fragmentos, como filtro previo a un revisor humano.
- Primera fase de recuperación en un pipeline con reranker: recuperar un conjunto amplio de candidatos por similitud vectorial y pasarlos a un cross-encoder más caro para el reordenamiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF es una ficha de cuantización de mradermacher y no incluye métricas de evaluación (MTEB, MIRACL, ViDoRe ni similares); las fichas de NVIDIA NIM y DeepInfra consultadas tampoco aportan cifras numéricas en la información proporcionada.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (413,8 M) y de los tamaños de fichero declarados; el fabricante no publica cifras oficiales de VRAM ni de throughput.

- Pesos en F16: ~0,83 GB para el encoder de texto; ~1,7 GB si se añade el `mmproj-f16` (0,9 GB).
- Pesos en Q8_0: ~0,44 GB; ~1,0 GB con el `mmproj-Q8_0` (0,6 GB).
- Pesos en Q4_K_M: ~0,25 GB; en Q2_K, ~0,15 GB.
- VRAM recomendada: 4 GB es suficiente para texto en Q8_0 con lote pequeño; 8 GB permite multimodal y lotes mayores a 32 000 tokens; 16-24 GB para servir con concurrencia alta.
- Cabe en GPU de consumo: GTX 1650 / RTX 3050 (4 GB) para texto cuantizado, RTX 3060 12 GB o RTX 4090 para multimodal con lotes amplios.
- GPU de centro de datos: A100, H100 o L40S para despliegues con muchas consultas por segundo y contexto largo sostenido.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM (etiqueta declarada por el autor) y transformers para el modelo BF16; NVIDIA NIM y DeepInfra como endpoints gestionados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas públicas y no de la información proporcionada en esta búsqueda; no hay cifras de benchmark comparativas disponibles, por lo que la comparación se limita a especificaciones estructurales.

| Modelo | Parametros | Contexto | Modalidad | Licencia |
|---|---|---|---|---|
| Nemotron-3.5-Embed-1B (esta ficha, GGUF) | 413,8 M (nominal 1B) | 32 000 tokens | Texto + imagen, 2048 dim, Matryoshka | openmdw-1.1 |
| BAAI/bge-m3 | 568 M | 8 192 tokens | Texto, multilingüe | MIT |
| intfloat/multilingual-e5-large | 560 M | 512 tokens | Texto, multilingüe | MIT |
| jina-embeddings-v3 | 570 M | 8 192 tokens | Texto, multilingüe, Matryoshka | CC BY-NC 4.0 |

La diferencia estructural relevante es la multimodalidad nativa del Nemotron (texto más imagen de página en un mismo espacio) y su ventana de 32 000 tokens, frente a los modelos de la competencia listados, que son exclusivamente de texto y con contexto menor. A cambio, las alternativas tienen licencias permisivas estándar (MIT) o un ecosistema de evaluación pública mucho más amplio.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Usarlo como modelo de chat es un error de categoría.
- Discrepancia de tamaño: el nombre comercial indica 1B pero los safetensors del repositorio base suman 413.794.304 parámetros. Conviene verificar el recuento real antes de dimensionar infraestructura.
- No hay datos públicos de benchmarks en la información disponible, por lo que no se puede estimar su calidad relativa frente a bge-m3 o multilingual-e5-large sin una evaluación propia sobre el corpus objetivo.
- La cuantización degrada la precisión de los embeddings: para retrieval fino se recomienda F16 o Q8_0, y reservar Q4 y menores para tareas de clustering o filtrado grueso.
- La licencia openmdw-1.1 no es una licencia OSI estándar (no es Apache-2.0 ni MIT); es imprescindible revisar los términos en el enlace antes de un uso comercial o de redistribución.
- El rendimiento por idioma no está documentado: los 33 idiomas declarados incluyen lenguas de bajos recursos (as, ne, mr, ur) donde es razonable esperar una calidad inferior a la de en, es o de, pero no hay cifras publicadas que lo confirmen.
- La parte multimodal depende de los ficheros `mmproj`; el soporte de embeddings multimodales en llama.cpp es más limitado que en vLLM o transformers, y el listado de ficheros visible en la información proporcionada solo muestra los dos suplementos mmproj, no las cuantizaciones del encoder de texto.
- Riesgo de falsos positivos en similitud: dos documentos con vocabulario parecido pero significado opuesto pueden quedar próximos en el espacio vectorial; conviene combinar con un reranker en dominios sensibles.
- Repositorio con 0 descargas y 2 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria de las cuantizaciones.

## Enlaces

- Repositorio GGUF objeto de esta ficha: https://huggingface.co/mradermacher/Nemotron-3.5-Embed-1B-BF16-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Ficha en NVIDIA NIM (Nemotron-3.5-Embed-1B): https://build.nvidia.com/nvidia/nemotron-3_5-embed-1b/modelcard
- Ficha en NVIDIA NIM (Nemotron-3-Embed-1B, encoder de texto): https://build.nvidia.com/nvidia/nemotron-3-embed-1b/modelcard
- Demo y API en DeepInfra: https://deepinfra.com/nvidia/Nemotron-3.5-Embed-1B-BF16
- Texto de la licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Índice de cuantizaciones del autor para este modelo: https://hf.tst.eu/model#Nemotron-3.5-Embed-1B-BF16-GGUF
- Distribución GGUF de la variante anterior (Nemotron-3-Embed-1B): https://huggingface.co/mradermacher/Nemotron-3-Embed-1B-BF16-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
