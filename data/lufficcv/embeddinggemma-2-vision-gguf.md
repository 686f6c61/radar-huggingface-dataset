# lufficcv/embeddinggemma-2-vision-GGUF

## Resumen

EmbeddingGemma 2 vision es un extractor de características visuales derivado de `google/embeddinggemma-2`, publicado por el usuario lufficcv como un fichero GGUF de tipo mmproj para llama.cpp. No se trata de un modelo completo, sino únicamente del codificador de imagen del modelo multimodal original, con el codificador de audio eliminado de forma explícita. Su propósito es habilitar búsqueda de fotos en dispositivo (on-device photo search) sin cargar la parte de audio, lo que reduce el tamaño del artefacto a aproximadamente 124 MB.

El fichero resultante contiene 168.544.256 parámetros (según los metadatos del repositorio) y se distribuye bajo licencia Apache 2.0, la misma que el modelo base. La construcción es reproducible mediante el script `vision-model.py` incluido por el autor, que reconstruye el GGUF byte a byte a partir de los ficheros de referencia de ggml-org.

Es relevante ahora porque permite montar pipelines de recuperación imagen-texto con llama.cpp en hardware modesto, combinando este codificador visual con un modelo de texto de embeddings cuantizado. El autor reporta métricas de recuperación en XM3600 que se mantienen prácticamente idénticas al emplear este fichero junto a un modelo de texto Q4_K_XL frente a la configuración completa Q8_0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de visión de un transformer multimodal (componente mmproj de EmbeddingGemma 2), sin codificador de audio |
| Parámetros totales | 168.544.256 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q5_0 en las matrices de los bloques de visión; Q8_0 en `v.position_embd.weight`; normas y proyector sin recuantizar respecto al fichero Q8_0 |
| Idiomas soportados | No disponible (el modelo base es multimodal; el autor evalúa con subtítulos en chino e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mmproj), fichero `mmproj-embeddinggemma-2-vision-Q5_0.gguf` de 124.352.192 bytes |

## Arquitectura y entrenamiento

El artefacto es un fichero mmproj de llama.cpp que contiene exclusivamente el codificador de visión del modelo base `google/embeddinggemma-2`. El autor parte de `mmproj-embeddinggemma-2-Q8_0.gguf` de ggml-org (revisión `bfcd298762cc34d0357ece5ebdd31791a3a374d8`) y aplica tres transformaciones: elimina los tensores del codificador de audio (tensores `a.*`, claves `clip.audio.*` y fija `clip.has_audio_encoder = false`), recuantiza `v.position_embd.weight` a Q8_0 en lugar de F32, y recuantiza a Q5_0 las matrices Q8_0 de los bloques de visión tomando como referencia el fichero BF16. El resto de componentes (normas y proyector) se mantienen como en el fichero Q8_0.

No se dispone de información sobre el entrenamiento original del modelo base en la documentación proporcionada: no se detallan número de tokens, composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable de esta publicación no está en el entrenamiento, sino en la destilación selectiva del artefacto (eliminación del audio y recuantización agresiva del codificador visual) manteniendo la calidad de recuperación, y en la reproducibilidad exacta del proceso mediante `vision-model.py`. Los vectores de imagen pasan a través del modelo de texto, por lo que su calidad depende del modelo de texto emparejado.

## Capacidades

- Extracción de características visuales (pipeline `image-feature-extraction`) para generar embeddings de imagen.
- Recuperación texto-imagen (text-to-image retrieval) cuando se combina con un modelo de texto de embeddings compatible.
- Búsqueda de fotos en dispositivo, escenario para el que el autor declara haberlo construido.
- Eliminación del codificador de audio, lo que reduce el tamaño y el coste de carga en escenarios donde el audio no es necesario.
- Compatibilidad con llama.cpp como fichero mmproj.
- Capacidades multilingües: no disponible como dato explícito; la evaluación del autor usa subtítulos en chino e inglés.
- Tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible (no es un modelo generativo).

## Casos de uso

- Búsqueda de fotos en dispositivo: el modelo genera embeddings de imagen que se indexan localmente y se consultan con embeddings de texto del modelo emparejado, permitiendo búsqueda semántica de un catálogo fotográfico sin conexión y con un fichero de 124 MB.
- Indexación de bibliotecas fotográficas personales: al ejecutarse en llama.cpp sobre hardware de consumo, permite construir un índice vectorial de miles de imágenes y consultarlo por descripción textual.
- Aplicaciones móviles o embebidas de recuperación visual: el tamaño reducido del mmproj (frente a los 865 MB de la configuración Q8_0 completa) lo hace viable en dispositivos con almacenamiento y memoria limitados.
- Moderación o deduplicación de imágenes: los embeddings permiten agrupar imágenes visualmente similares o detectar duplicados en un repositorio, usando similitud coseno sobre los vectores extraídos.
- Prototipado de sistemas RAG multimodales: sirve como rama visual de un pipeline de recuperación aumentada que combine texto e imagen, integrándose con el mismo modelo de texto de embeddings.
- Evaluación y benchmarking de recuperación multimodal: el autor proporciona un protocolo reproducible sobre XM3600 (3.600 fotos, 7.174 subtítulos en chino y 7.200 en inglés, presupuesto de imagen 140), útil para comparar configuraciones de cuantización.
- Sistemas de recomendación visual: los embeddings de imagen permiten calcular vecindad entre ítems y alimentar recomendadores basados en contenido.

## Benchmarks y rendimiento

Recuperación texto-imagen en XM3600 (3.600 fotos; 7.174 subtítulos en chino y 7.200 en inglés; presupuesto de imagen 140). El modelo de texto es `unsloth/embeddinggemma-2-GGUF` UD-Q4_K_XL, excepto en la primera fila:

| Configuración | zh R@1 | zh R@10 | en R@1 | en R@10 |
|---|---|---|---|---|
| Texto Q8_0 de ggml-org + mmproj Q8_0 (865 MB) | 69,6 | 93,5 | 59,7 | 88,8 |
| Texto Q4_K_XL + este fichero (300 MB) | 69,3 | 93,2 | 59,6 | 88,8 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero mmproj ocupa 124.352.192 bytes (unos 124 MB), a lo que hay que sumar la memoria del modelo de texto de embeddings emparejado.
- GPU recomendadas: no disponible. Al ejecutarse mediante llama.cpp, puede correr en CPU y en GPU de consumo, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño del artefacto (unos 124 MB), si bien el requisito real lo marca el modelo de texto asociado.
- Opciones de despliegue: llama.cpp (formato GGUF mmproj). Otras opciones (vLLM, TGI, Ollama) no están documentadas para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lufficcv/embeddinggemma-2-vision-GGUF | Codificador de visión (mmproj GGUF) | 168.544.256 | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| ggml-org/embeddinggemma-2-GGUF (mmproj Q8_0 completo) | Codificador de visión + audio (mmproj GGUF) | No disponible | No disponible | Apache 2.0 (según modelo base) | Hugging Face, referencia del autor |
| google/embeddinggemma-2 | Modelo multimodal de embeddings completo | No disponible | No disponible | Apache 2.0 | Hugging Face, modelo base |

La comparativa se limita a las variantes del mismo modelo base presentes en la documentación; no se dispone de datos de otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Solo contiene el codificador de visión: no procesa audio ni genera texto; el pipeline declarado es `image-feature-extraction`.
- Los vectores de imagen dependen del modelo de texto emparejado, ya que pasan a través de él; el autor recomienda usar el mismo modelo de texto con el que se evaluó (UD-Q4_K_XL de unsloth).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado por un usuario individual y no por el equipo de Google; conviene validar la integridad del fichero con el sha256 indicado (`93c8369c7883d6f64ef860a52c911835c1c75668647b908b2e04e5f13058bfca`).
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto o idioma específicas de este artefacto.
- Aunque la licencia es Apache 2.0, el autor remite a la licencia de Gemma 4 de Google; conviene revisar sus términos antes de un uso comercial.
- Las métricas reportadas proceden únicamente del autor y de un único conjunto de evaluación (XM3600); no hay validación independiente.
- La recuantización a Q5_0 de las matrices de visión puede degradar la calidad en dominios distintos al evaluado; no se aportan datos al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lufficcv/embeddinggemma-2-vision-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- GGUF de referencia de ggml-org: https://huggingface.co/ggml-org/embeddinggemma-2-GGUF
- Modelo de texto emparejado: https://huggingface.co/unsloth/embeddinggemma-2-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
