# mradermacher/Arrow-R1-7B-GGUF

## Resumen

Arrow-R1-7B-GGUF es la versión cuantizada en formato GGUF del modelo ParadiseYu/ArrowGEV-7B, publicada por el usuario mradermacher, conocido en la comunidad por producir cuantizaciones sistemáticas de modelos open source. El modelo base es un transformer de aproximadamente 7.615 millones de parámetros (7.6B) orientado a conversación y con capacidades multimodales, como evidencia la presencia de ficheros `mmproj` en el repositorio. La nomenclatura "R1" sugiere un posible proceso de destilación o afinado inspirado en el razonamiento de DeepSeek-R1, aunque esta información no se confirma en la documentación disponible.

El repositorio ofrece cuantizaciones estáticas (no imatrix) desde Q2_K hasta Q8_0, además de f16 y dos variantes del proyector multimodal (`mmproj-Q8_0` y `mmproj-f16`). Para cuantizaciones ponderadas con imatrix, el autor remite a un repositorio separado (`mradermacher/Arrow-R1-7B-i1-GGUF`). El tamaño total del repositorio es de 70,4 GB, aunque cada fichero individual ocupa entre 1,0 GB (mmproj) y 15,3 GB (f16).

La relevancia de esta ficha reside en que permite ejecutar un modelo de 7,6B con capacidades conversacionales y multimodales en hardware de consumo mediante llama.cpp u Ollama, con la cuantización Q4_K_M ocupando solo 4,8 GB. No obstante, la ausencia de model card detallada del modelo base, de licencia declarada y de benchmarks publicados limita seriamente la evaluación rigurosa de su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; se infiere decoder-only por el uso conversacional) |
| Parámetros totales | 7.615.616.512 (7,6B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Modelo base | ParadiseYu/ArrowGEV-7B |
| Tamaño del repositorio | 70,4 GB |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base ParadiseYu/ArrowGEV-7B. Por el tamaño de parámetros (7,6B) y el uso declarado (conversacional, con soporte multimodal vía ficheros `mmproj`), se trata con alta probabilidad de un transformer decoder-only con un proyector visual acoplado, en la línea de arquitecturas tipo LLaVA o Qwen-VL. La presencia de ficheros `mmproj` en el repositorio GGUF confirma que el modelo procesa entradas de imagen además de texto.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El sufijo "R1" en el nombre del repositorio podría indicar un proceso de destilación de razonamiento al estilo DeepSeek-R1, pero esto es una inferencia no confirmada. Las cuantizaciones son estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf), generadas por mradermacher a partir de los pesos en formato HuggingFace del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Procesamiento multimodal de imágenes: el repositorio incluye ficheros `mmproj` (proyector multimodal) que habilitan entrada visual junto al texto.
- Razonamiento: el sufijo "R1" sugiere capacidades de razonamiento por cadena de pensamiento, aunque no está confirmado en la documentación.
- Soporte de inferencia compatible con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documentan capacidades de audio.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo con GPU de consumo usando la cuantización Q4_K_M (4,8 GB), gestionando diálogos multi-turno sin depender de servicios en la nube.
- Análisis de imágenes con descripción textual: gracias a los ficheros `mmproj`, puede emplearse para tareas de captioning, respuesta a preguntas sobre imágenes (VQA) o extracción de información de capturas y documentos escaneados, cargando el proyector multimodal junto al modelo principal.
- Prototipado rápido de aplicaciones de IA: al ser un GGUF de 7,6B con cuantizaciones desde 3,1 GB (Q2_K), permite iterar en entornos con recursos limitados antes de migrar a modelos mayores o a infraestructura en producción.
- Despliegue en dispositivos edge o portátiles: la variante Q4_K_S (4,6 GB) o IQ4_XS (4,4 GB) cabe en GPUs con 6-8 GB de VRAM, habilitando asistentes offline en portátiles con RTX 3060/4060 o Apple Silicon con 16 GB unificados.
- Generación de texto asistida en pipelines de documentación: puede integrarse vía API compatible con OpenAI (endpoints_compatible) para resumir, reescribir o clasificar texto en inglés dentro de flujos automatizados.
- Experimentación académica con modelos multimodales pequeños: su tamaño contenido y formato GGUF lo hacen adecuado para estudiar el comportamiento de proyectores visuales en modelos de 7B sin requerir clústeres de GPU.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización más dos proyectores, lo que permite medir el impacto de la cuantización en calidad y latencia sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,9 GB
  - IQ4_XS: ~4,4 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- Añadir ~1,0-1,5 GB adicionales si se carga el proyector multimodal (`mmproj-Q8_0` o `mmproj-f16`).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4-Q8 con contexto moderado; RTX 4090 24 GB para f16 o Q8_0 con contexto largo; A100/H100 solo justificables para serving concurrente a gran escala.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 4-6 GB hasta Q8_0 en GPUs de 10-12 GB. En Apple Silicon, Q4_K_M funciona con 8 GB unificados; Q8_0 requiere 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. Para serving HTTP con API compatible con OpenAI, se puede usar llama.cpp server o Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Multimodal | Disponibilidad |
|---|---|---|---|---|---|---|
| Arrow-R1-7B-GGUF | 7,6B | No disponible | No disponible | GGUF | Sí (mmproj) | HuggingFace |
| Mistral-7B-Instruct (GGUF) | 7,2B | 32k | Apache 2.0 | GGUF, safetensors | No | HuggingFace, Ollama |
| Qwen2.5-7B-Instruct (GGUF) | 7,6B | 128k | Apache 2.0 | GGUF, safetensors | No | HuggingFace, Ollama |
| LLaVA-1.5-7B (GGUF) | 7B | 4k | LLaMA 2 (uso comercial restringido) | GGUF, safetensors | Sí | HuggingFace |

La comparativa es aproximada: no se dispone de benchmarks del modelo evaluado, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Mistral-7B-Instruct y Qwen2.5-7B-Instruct ofrecen licencias permisivas y contextos documentados, mientras que Arrow-R1-7B no declara licencia ni longitud de contexto, lo que supone una desventaja significativa para uso en producción. LLaVA-1.5-7B es el comparable multimodal más cercano por tamaño.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si el uso comercial está permitido; esto bloquea su adopción en entornos empresariales sin aclaración previa del autor del modelo base.
- Idiomas: solo se declara inglés (`en`); el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas (documentos extensos, conversaciones prolongadas) sin pruebas empíricas.
- Ausencia de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que las afirmaciones sobre capacidades de razonamiento no están respaldadas.
- Riesgo de alucinación: inherente a los modelos de 7B sin datos de evaluación; no hay información sobre mitigaciones (RLHF, DPO) aplicadas.
- Sesgos: no documentados; al desconocerse la composición del dataset de entrenamiento, no se pueden evaluar sesgos de género, raza o ideológicos.
- Cuantizaciones estáticas: las variantes Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio velocidad/calidad, y sugiere las cuantizaciones imatrix del repositorio `i1-GGUF` para mayor fidelidad.
- Modelo base con escasa tracción: el modelo original ParadiseYu/ArrowGEV-7B no cuenta con documentación pública detallada en la información disponible, lo que dificulta la reproducibilidad.
- El repositorio tiene solo 118 descargas y 1 like, lo que indica baja validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Arrow-R1-7B-GGUF
- Modelo base: https://huggingface.co/ParadiseYu/ArrowGEV-7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Arrow-R1-7B-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Arrow-R1-7B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
