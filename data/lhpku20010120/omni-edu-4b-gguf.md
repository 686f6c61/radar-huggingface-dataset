# lhpku20010120/Omni-Edu-4B-GGUF

## Resumen

Omni-Edu-4B-GGUF es la versión cuantizada en formato GGUF del modelo Omni-Edu-4B, un modelo multimodal de tipo image-text-to-text desarrollado por el usuario lhpku20010120. El modelo está orientado al ámbito educativo (etiquetas "omniedu" y "education") y se distribuye bajo la librería llama.cpp, lo que permite su ejecución local en hardware de consumo mediante el ecosistema GGUF. La model card lo vincula a la familia Qwen 3.5 (tag "qwen3_5"), aunque no se detalla la arquitectura exacta en la información disponible.

Con 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones), el modelo se posiciona en el segmento de modelos pequeños con capacidad de entrada de imagen y texto. El repositorio incluye cuatro cuantizaciones (BF16, Q8_0, Q6_K y Q4_K_M) más un proyector multimodal compartido (mmproj) en F16, lo que facilita el despliegue en entornos con recursos limitados, como estaciones de trabajo educativas o portátiles con GPU modesta.

La relevancia actual del modelo radica en su combinación de multimodalidad, tamaño reducido y formato GGUF listo para llama.cpp, lo que lo hace accesible para prototipado rápido en aplicaciones educativas sin necesidad de infraestructura de servidor dedicada. Sin embargo, la información pública es escasa: no se detallan los datos de entrenamiento, los idiomas soportados ni los resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (tag "qwen3_5" sugiere base Qwen 3.5; no confirmado en la model card) |
| Parámetros totales | 4.205.751.296 (≈4,2 B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (el ejemplo de ejecución usa `-c 8192`, pero no se confirma como máximo oficial) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M (más proyector multimodal mmproj en F16) |
| Idiomas soportados | No disponible |
| Licencia | Other (términos del modelo base Omni-Edu-4B; no especificados) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. La etiqueta "qwen3_5" en el repositorio sugiere que el modelo base podría derivar de la familia Qwen 3.5, pero la model card no confirma explícitamente la arquitectura (transformer denso, MoE u otra variante). El pipeline declarado es image-text-to-text, lo que implica la presencia de un codificador visual acoplado a un modelo de lenguaje, con un proyector multimodal separado (mmproj-OmniEdu-4B-F16.gguf) que se comparte entre todas las cuantizaciones.

Tampoco se detallan los datos de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La orientación educativa se deduce únicamente de las etiquetas del repositorio. La conversión a GGUF se realizó con llama.cpp, según indica la model card, pero no se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y soporta interacción multi-turno.
- Comprensión de imágenes: pipeline image-text-to-text, con entrada conjunta de imagen y texto mediante el proyector mmproj.
- Orientación educativa: las etiquetas "omniedu" y "education" indican un enfoque hacia tareas de aprendizaje y enseñanza, aunque no se detallan capacidades específicas.
- Ejecución local: compatible con llama.cpp y servidores compatibles con la API OpenAI (`llama-server` expone `/v1`).
- Modo razonamiento desactivable: el ejemplo de ejecución incluye `--reasoning off`, lo que sugiere la existencia de un modo de razonamiento interno que puede activarse o desactivarse.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Asistente educativo local para estudiantes: el modelo puede desplegarse en un portátil con llama.cpp y la cuantización Q4_K_M (2,52 GiB), permitiendo responder dudas sobre material de estudio sin conexión a internet ni costes de API.
- Tutoría con soporte de imágenes: gracias al pipeline image-text-to-text y al proyector mmproj, el modelo puede recibir capturas de ejercicios, diagramas o apuntes y generar explicaciones o resolver problemas paso a paso.
- Prototipado de aplicaciones educativas: al exponer una API compatible con OpenAI mediante `llama-server`, los desarrolladores pueden integrar el modelo en frontends como Cherry Studio (mencionado en la model card) o en sus propias aplicaciones web sin cambiar el código de cliente.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q6_K (3,23 GiB) y Q8_0 (4,17 GiB) permiten elegir el equilibrio entre calidad y memoria según el hardware disponible, algo útil en aulas con equipos modestos.
- Generación de material didáctico: el modelo puede redactar explicaciones, resúmenes o preguntas de práctica a partir de texto o imágenes de referencia, aprovechando su orientación educativa.
- Investigación en modelos multimodales pequeños: con 4,2 B de parámetros y formato GGUF, sirve como banco de pruebas para estudiar el comportamiento de modelos visión-lenguaje en hardware de consumo, comparando cuantizaciones y midiendo degradación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - BF16: ~7,85 GiB.
  - Q8_0: ~4,17 GiB.
  - Q6_K: ~3,23 GiB.
  - Q4_K_M: ~2,52 GiB.
  - Proyector multimodal mmproj F16: tamaño no especificado en la model card (debe sumarse a la VRAM total).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, las cuantizaciones Q4_K_M y Q6_K caben en GPUs de consumo con 6-8 GB de VRAM; Q8_0 requiere al menos 6 GB y BF16 al menos 10-12 GB, estimaciones orientativas no confirmadas por el autor.
- ¿Cabe en GPU de consumo? Sí, al menos las cuantizaciones Q4_K_M, Q6_K y Q8_0 son compatibles con GPUs de consumo típicas (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB), aunque no se confirma oficialmente.
- Opciones de despliegue: llama.cpp (`llama-server`), y por compatibilidad GGUF, potencialmente Ollama, LM Studio u otros runners basados en llama.cpp (no confirmado en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato GGUF | Disponibilidad |
|---|---|---|---|---|---|---|
| Omni-Edu-4B-GGUF | ~4,2 B | No disponible | Image-text-to-text | Other | Sí (BF16, Q8_0, Q6_K, Q4_K_M) | Hugging Face (lhpku20010120) |
| Qwen2.5-VL-3B | ~3,75 B | 32k (según documentación pública de Qwen) | Image-text-to-text | Apache 2.0 (según Qwen) | Sí, vía comunidad | Hugging Face (Qwen) |
| Qwen2.5-VL-7B | ~8,3 B | 32k (según documentación pública de Qwen) | Image-text-to-text | Apache 2.0 (según Qwen) | Sí, vía comunidad | Hugging Face (Qwen) |
| Gemma 3 4B (multimodal) | ~4 B | 128k (según documentación pública de Google) | Image-text-to-text | Gemma Terms (según Google) | Sí, vía comunidad | Hugging Face (Google) |

Nota: los datos de los modelos comparables provienen de documentación pública general y no de la información proporcionada en esta ficha; se incluyen como referencia orientativa. No se dispone de comparativas de rendimiento (benchmarks) para Omni-Edu-4B.

## Limitaciones y advertencias

- Información pública muy limitada: no se documentan datos de entrenamiento, idiomas, contexto máximo ni benchmarks, lo que dificulta evaluar su calidad real.
- Licencia "other" sin términos especificados: antes de usar el modelo en producción o con fines comerciales, es imprescindible revisar la licencia del modelo base Omni-Edu-4B, ya que la model card remite a ella sin detallarla.
- Riesgo de alucinación: no cuantificado; como modelo pequeño de 4,2 B, es esperable una mayor propensión a errores factuales que modelos de mayor tamaño, aunque no hay datos que lo confirmen.
- Sesgos: no documentados por el autor.
- Idiomas: no se especifican los idiomas soportados; no se garantiza un rendimiento adecuado en castellano.
- Contexto: el ejemplo de ejecución usa `-c 8192`, pero no se confirma que sea la longitud máxima oficial; valores superiores podrían degradar el rendimiento o no estar soportados.
- Multimodalidad dependiente del proyector: es necesario descargar el archivo mmproj para entrada de imagen; sin él, el modelo solo procesa texto.
- Despliegue: la model card solo documenta llama.cpp; la compatibilidad con otros runners GGUF no está confirmada.
- Fecha de creación futura (2026-11-02): el repositorio tiene marcas temporales posteriores a la fecha actual de referencia, lo que puede indicar metadatos inconsistentes; conviene verificar la integridad de los archivos.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/lhpku20010120/Omni-Edu-4B-GGUF
- Modelo base: https://huggingface.co/lhpku20010120/Omni-Edu-4B
- Repositorio espejo de terceros (prithivMLmods): https://huggingface.co/prithivMLmods/Omni-Edu-4B-GGUF
- llama.cpp (herramienta de conversión y ejecución): https://github.com/ggml-org/llama.cpp
- Cherry Studio (cliente mencionado en la model card): no disponible en la información proporcionada.
