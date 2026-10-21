# mradermacher/gemma-4-E4B-it-The-DECKARD-V2-Strong-HERETIC-UNCENSORED-Thinking-bf16-i1-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF del modelo nightmedia/gemma-4-E4B-it-The-DECKARD-V2-Strong-HERETIC-UNCENSORED-Thinking-bf16, un fine-tuning del modelo Gemma 4 E4B instruct de Google. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de la comunidad, y el resultado se distribuye bajo licencia apache-2.0 según los metadatos de HuggingFace, aunque el propio autor enlaza la licencia de Gemma 4 de Google como referencia legal.

El modelo base es un ajuste "uncensored" (presumiblemente con técnicas de abliteration o fine-tuning sin alineación de rechazo) orientado a conversación y con un modo de razonamiento explícito ("Thinking"). Según los metadatos del repositorio, se trata además de un modelo con capacidades de visión: el autor indica que los ficheros mmproj (proyector multimodal) se encuentran en el repositorio de cuantizaciones estáticas.

El interés práctico de esta ficha está en la disponibilidad de cuantizaciones GGUF con calibración imatrix que permiten ejecutar un modelo de unos 7.518 millones de parámetros en GPUs de consumo, desde ~4,5 GB (Q2_K) hasta ~6,3 GB (Q6_K). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado información sobre contexto máximo, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según nomenclatura del modelo); detalles no disponibles |
| Parametros totales | 7.518.069.290 (~7,5 mil millones), dato real de safetensors |
| Parametros activos | no disponible (no se confirma si es un modelo disperso/MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix); existen también cuantizaciones estáticas en repositorio aparte |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0, con enlace a la licencia de Gemma 4 de Google |
| Formato de pesos | GGUF (el modelo base está en bf16/safetensors); ficheros imatrix incluidos para generar cuantizaciones propias |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Por la nomenclatura del modelo base (gemma-4-E4B-it) se trata de un transformer de la familia Gemma 4 en su variante instruct, con un total de 7.518.069.290 parámetros almacenados en safetensors. El sufijo "E4B" se corresponde con la convención de nombres de Google para variantes de "parámetros efectivos", pero no se ha confirmado en la información disponible si emplea arquitectura MatFormer, atención lineal u otro esquema de cómputo selectivo.

El proceso de entrenamiento del modelo base tampoco está documentado en la información suministrada: no se indica el número de tokens, la composición del corpus, ni si se emplearon fases de RLHF, DPO o ajuste por preferencias. Lo que sí se deduce del nombre y de la model card es que el modelo ha pasado por un proceso de fine-tuning orientado a eliminar el comportamiento de rechazo ("HERETIC UNCENSORED") y por un modo de razonamiento explícito ("Thinking"), presumiblemente con datos de trazas de pensamiento, aunque la metodología concreta no está publicada. Este repositorio, en particular, no entrena el modelo: solo genera cuantizaciones con calibración imatrix (importancia de pesos por tensor) a partir de los pesos bf16 del autor original.

## Capacidades

- Generación de texto conversacional en inglés, con formato instruct (etiqueta "-it" en el modelo base).
- Modo de razonamiento explícito ("Thinking"), orientado a tareas de razonamiento multi-paso previas a la respuesta final.
- Procesamiento de imágenes: el autor clasifica explícitamente el modelo como "vision model" y remite a los ficheros mmproj del repositorio estático.
- Comportamiento "uncensored": el fine-tuning elimina total o parcialmente las capas de rechazo del modelo original.
- Conversación multi-turno (tag "conversational" en HuggingFace).
- Compatibilidad declarada con endpoints ("endpoints_compatible") y con la librería transformers.
- Soporte de cuantizaciones IQ de baja precisión (IQ1 a IQ4) para despliegue en hardware limitado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.
- Idiomas distintos del inglés: no disponibles (solo se declara "en").

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantización i1-Q4_K_M (5,4 GB) el modelo cabe en GPUs de consumo, lo que permite levantar un asistente de chat completo en una estación de trabajo sin depender de APIs externas.
- Investigación sobre alineación y censura: al ser un fine-tuning "uncensored", sirve como objeto de estudio para medir qué comportamientos se eliminan con la abliteration y qué capacidades se degradan en el proceso, comparándolo con el Gemma 4 E4B-it original.
- Procesamiento de documentos con imágenes: el soporte multimodal declarado (vía mmproj) permite extraer texto y describir figuras en capturas, escaneos o diagramas dentro de un pipeline OCR asistido.
- Generación de datos sintéticos en inglés para ajuste fino: un modelo con modo "thinking" y sin rechazos puede producir trazas de razonamiento para destilar en modelos más pequeños, siempre que el uso cumpla la licencia del modelo base.
- Evaluación de cuantizaciones: el repositorio incluye un fichero imatrix (0,1 GB) y catorce variantes de cuantización, lo que permite medir empíricamente la degradación de perplejidad y calidad entre Q2_K, Q4_K_M y Q6_K en un mismo modelo.
- Despliegue en entornos con hardware restringido: las variantes i1-IQ3_S e i1-IQ3_M (~4,8 GB) permiten ejecutar el modelo en GPUs de 6-8 GB de VRAM o en CPU con llama.cpp, útil para demos y pruebas de concepto.
- Experimentación con modos de razonamiento en local: el tag "Thinking" permite estudiar el coste en tokens y latencia del razonamiento explícito frente a la respuesta directa en un modelo de 7,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según los tamaños reales de los ficheros: i1-Q2_K ~4,5 GB; i1-IQ3_S / i1-IQ3_M / i1-Q3_K_S ~4,8 GB; i1-Q4_K_S / i1-Q4_K_M ~5,3-5,4 GB; i1-Q5_K_M ~5,9 GB; i1-Q6_K ~6,3 GB. Hay que añadir el espacio de la caché KV, cuyo tamaño depende del contexto y no está documentado.
- Pesos en bf16: el repositorio completo ocupa 77,4 GB, aunque el peso del modelo en bf16 ronda los 15 GB; inferencia en bf16 requiere del orden de 20 GB o más de VRAM (A100 40 GB, H100, o 2x RTX 4090) sin contar contexto largo.
- GPU de consumo: la cuantización i1-Q4_K_M cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti y superiores. Las variantes IQ3 deberían caber en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070). Las Q5/Q6 encajan mejor en 12-16 GB.
- Despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para los GGUF; vLLM y TGI requieren los pesos en safetensors/bf16, no los GGUF. Para el proyector multimodal hay que descargar el fichero mmproj del repositorio de cuantizaciones estáticas.
- Latencia y throughput: no disponibles (no hay mediciones publicadas ni número de descargas que permita inferirlos).
- Recomendación práctica: para uso general, i1-Q4_K_M o i1-Q4_K_S; para máxima calidad en 8-12 GB, i1-Q6_K; para pruebas rápidas en hardware muy limitado, i1-IQ3_S antes que Q2_K.

## Comparativa con modelos similares

No se dispone de benchmarks ni de especificaciones verificadas de alternativas en la información proporcionada. La comparación siguiente se limita a los artefactos del mismo autor y modelo, que sí están documentados:

| Modelo | Parametros | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (i1-GGUF, imatrix) | 7,5B | GGUF i1-Q2_K a i1-Q6_K | 4,5-6,3 GB por fichero | apache-2.0 (con enlace a licencia Gemma 4) | Cuantización calibrada con imatrix; requiere descargar mmproj aparte para visión |
| mradermacher/...-GGUF (cuantizaciones estáticas) | 7,5B | GGUF estáticas | no disponible | apache-2.0 | Sin calibración imatrix; contiene los ficheros mmproj |
| nightmedia/...-Thinking-bf16 (modelo base) | 7,5B | safetensors bf16 | ~15 GB de pesos | apache-2.0 (según metadatos) | Pesos originales sin cuantizar; referencia de calidad máxima |
| Gemma 4 E4B-it original | no disponible | no disponible | no disponible | licencia Gemma 4 de Google | Modelo base antes del fine-tuning "uncensored"; útil como referencia de comportamiento alineado |

## Limitaciones y advertencias

- Modelo "uncensored": el fine-tuning elimina deliberadamente las capas de rechazo, por lo que puede generar contenido dañino, ilegal o sexualmente explícito sin filtros. No es apto para aplicaciones orientadas al público sin una capa de moderación propia.
- Riesgo elevado de alucinación: un modelo de ~7,5B con fine-tuning agresivo sobre un modelo instruct tiende a degradar la fidelidad factual; el modo "Thinking" no garantiza corrección.
- Solo se declara inglés ("en") como idioma soportado. El rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin verificarla empíricamente.
- Ambigüedad de licencia: los metadatos indican apache-2.0, pero la model card enlaza la licencia de Gemma 4 de Google. Un fine-tuning "uncensored" puede infringir los términos de uso del modelo base. Antes de un uso comercial hay que verificar la licencia aplicable con el autor.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (21 de octubre de 2026): no hay validación comunitaria, reportes de calidad ni pruebas de terceros.
- La lista de cuantizaciones de la model card aparece truncada ("Here i"), por lo que pueden existir variantes adicionales (por ejemplo Q8_0) no listadas; conviene revisar la página de descargas del autor.
- El modelo base no es un modelo oficial de Google, sino un fine-tuning de terceros (nightmedia); no hay garantía de que conserve las capacidades del Gemma 4 E4B-it original.
- Para visión es imprescindible descargar el fichero mmproj del repositorio estático; sin él, el modelo funciona solo como texto.
- Las cuantizaciones de 2 y 3 bits (Q2_K, IQ2, IQ1) degradan notablemente la calidad en modelos de este tamaño; el propio autor recomienda IQ3_XXS frente a Q2_K.
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo (solo dominios sin relación), por lo que no hay información externa verificable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-E4B-it-The-DECKARD-V2-Strong-HERETIC-UNCENSORED-Thinking-bf16-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/gemma-4-E4B-it-The-DECKARD-V2-Strong-HERETIC-UNCENSORED-Thinking-bf16
- Cuantizaciones estáticas (incluye ficheros mmproj): https://huggingface.co/mradermacher/gemma-4-E4B-it-The-DECKARD-V2-Strong-HERETIC-UNCENSORED-Thinking-bf16-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-4-E4B-it-The-DECKARD-V2-Strong-HERETIC-UNCENSORED-Thinking-bf16-i1-GGUF
- Licencia referenciada por el autor: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog o demo oficial: no disponibles en la información proporcionada.
