# mradermacher/gemma3-negative-starlike-GGUF

## Resumen

`gemma3-negative-starlike-GGUF` es una colección de cuantizaciones GGUF estáticas del modelo `ToastyPigeon/gemma3-negative-starlike`, un merge de la familia Gemma 3 de Google publicado por el usuario ToastyPigeon y cuantizado por mradermacher. El modelo base es un merge realizado con mergekit, lo que implica que combina pesos de dos o más modelos derivados de Gemma 3 para obtener un comportamiento híbrido. Con 27.009.346.304 parámetros totales (aproximadamente 27B), se sitúa en la gama alta de la familia Gemma 3 y está pensado para despliegue local en formato GGUF mediante llama.cpp y derivados.

La relevancia de esta ficha es doble: por un lado, documenta un modelo derivado (no oficial) de Gemma 3 con licencia no especificada, lo que exige precaución antes de usarlo en producción; por otro, ejemplifica el ecosistema de merges comunitarios y cuantizaciones que proliferan en Hugging Face. El modelo incluye un proyector multimodal (`mmproj`), lo que sugiere que hereda la capacidad de visión de Gemma 3, aunque la model card no detalla el pipeline ni los datos de entrenamiento del merge.

La información disponible es escasa: no hay benchmarks, no se especifica la licencia, no se documenta la longitud de contexto efectiva tras el merge y no se describen los datasets de entrenamiento. Esta ficha refleja fielmente esa limitación y marca como "no disponible" todo dato no confirmado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3; detalles del merge no disponibles) |
| Parámetros totales | 27.009.346.304 (~27B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible (heredada de Gemma 3, no confirmada en la model card) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de la familia Gemma 3, generado con mergekit a partir de pesos de modelos Gemma 3 (el autor no detalla la receta exacta del merge, los coeficientes ni los modelos de origen). Gemma 3 es una arquitectura transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm y activaciones GeGLU, pero al tratarse de un merge comunitario no se puede confirmar qué variantes concretas de Gemma 3 (tamaño 27B, preentrenado vs. instruct) se combinaron ni con qué proporciones.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicó RLHF, DPO o fine-tuning adicional tras el merge. La presencia de un proyector multimodal (`mmproj`) indica que el modelo conserva la torre de visión de Gemma 3, pero no se documenta si el merge preserva las capacidades visuales originales o las degrada. Las cuantizaciones son estáticas (no imatrix); el autor ofrece cuantizaciones ponderadas/imatrix en un repositorio separado (`mradermacher/gemma3-negative-starlike-i1-GGUF`).

## Capacidades

- Generación de texto conversacional en inglés, heredada de Gemma 3.
- Capacidad multimodal potencial (visión) por la presencia del proyector `mmproj`, aunque no confirmada en la model card.
- Razonamiento y respuesta a instrucciones según el comportamiento del modelo base, no verificado con benchmarks.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Experimentación con merges comunitarios: el modelo sirve para estudiar cómo se comporta un merge de Gemma 3 27B en formato GGUF frente al modelo original, comparando respuestas en tareas de conversación en inglés.
- Despliegue local en estaciones de trabajo con GPU de 24 GB: la cuantización Q4_K_M (16,6 GB) permite ejecutar el modelo en una RTX 4090 o similar con llama.cpp, útil para prototipos offline sin conexión.
- Generación de texto conversacional en inglés para asistentes internos: con contexto heredado de Gemma 3, puede gestionar diálogos multi-turno, aunque la falta de benchmarks impide garantizar calidad en producción.
- Análisis de imágenes en local (si el merge preserva la visión): cargando el `mmproj-f16` junto al GGUF principal, se podría usar para descripción de imágenes o extracción de texto en entornos sin API externa.
- Investigación sobre cuantización: comparar la degradación de calidad entre Q2_K (10,6 GB) y Q8_0 (28,8 GB) en tareas de razonamiento permite estudiar el impacto de la cuantización en modelos de 27B.
- Base para fine-tuning posterior: al ser un merge en formato GGUF, no es directamente entrenable, pero el modelo base en safetensors (`ToastyPigeon/gemma3-negative-starlike`) podría servir como punto de partida para ajuste fino con LoRA en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,6 GB (Q2_K) y 28,8 GB (Q8_0); la opción recomendada Q4_K_M requiere ~16,6 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y para el modelo base en safetensors (fp16 ~54 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo Q2_K o Q3_K_S con riesgo de offloading.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (requerirían el modelo base en safetensors).
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma3-negative-starlike-GGUF | ~27B | no disponible | no disponible | GGUF | Merge comunitario, sin benchmarks |
| google/gemma-3-27b-it | ~27B | 128K (según Gemma 3) | Gemma Terms of Use | safetensors, GGUF oficial | Modelo oficial, benchmarks publicados |
| mradermacher/gemma-3-27b-it-GGUF | ~27B | 128K | Gemma Terms of Use | GGUF | Cuantización del oficial, misma base |
| Mistral Small 3 (24B) | ~24B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva |

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; el modelo base deriva de Gemma 3, cuyos términos de uso podrían aplicar, pero no se documenta.
- Sin benchmarks: no hay evidencia publicada de calidad, razonamiento o seguridad del merge.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica no se puede cuantificar.
- Idiomas: solo inglés documentado; el rendimiento en castellano es desconocido y probablemente degradado.
- Contexto no confirmado: aunque Gemma 3 soporta ventanas largas, el merge podría no preservarlas.
- Visión no verificada: la presencia de `mmproj` no garantiza que el merge conserve la calidad multimodal original.
- Modelo derivado no oficial: no cuenta con el respaldo de Google ni de ToastyPigeon más allá de la publicación del merge; el soporte es nulo.
- Repositorio de 188,1 GB: descarga pesada; conviene elegir una sola cuantización.
- Fecha de actualización futura (2026-11-13): metadato atípico que sugiere posibles revisiones del repositorio; conviene fijar una revisión concreta.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/gemma3-negative-starlike-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/gemma3-negative-starlike
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma3-negative-starlike-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#gemma3-negative-starlike-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
