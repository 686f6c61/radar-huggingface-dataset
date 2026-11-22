# mradermacher/Qwen3.8-27B-Uncensored-v2-i1-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v2-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo InterpreticAI/Qwen3.8-27B-Uncensored-v2, un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) derivado de la familia Qwen3.8 y afinado para eliminar la censura política y otros filtros de contenido. El repositorio no contiene pesos originales en safetensors, sino únicamente ficheros GGUF cuantizados con la técnica imatrix (importance matrix) de llama.cpp, pensados para inferencia en CPU, GPU de consumo y entornos con memoria limitada.

El modelo base es de tipo transformer decoder-only con licencia Apache 2.0, orientado a conversación y generación de texto en inglés. La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 27B en hardware modesto: los cuantizados van desde 11,0 GB (i1-Q2_K) hasta 22,5 GB (i1-Q6_K), lo que permite elegir el equilibrio entre calidad y requisitos de VRAM/RAM. El repositorio acumula 2.399 descargas y un tamaño total de 218,6 GB, coherente con la inclusión de múltiples variantes de cuantización.

No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni los detalles del proceso de alineación del modelo base. La model card del cuantizador es puramente operativa (lista de ficheros, instrucciones de uso y agradecimientos) y no aporta especificaciones técnicas del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de la familia Qwen3.8; detalles no disponibles) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); también existen cuantizados estáticos en el repo Qwen3.8-27B-Uncensored-v2-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); no se incluyen safetensors en este repo |

## Arquitectura y entrenamiento

La arquitectura del modelo base corresponde a un transformer decoder-only de la familia Qwen3.8, con 27,3 mil millones de parámetros. No se dispone de información sobre el número de capas, dimensiones ocultas, mecanismo de atención (si usa atención lineal, GQA o decodificación especulativa) ni sobre la longitud de contexto nativa. Tampoco se documenta el número de tokens de entrenamiento ni la composición del dataset.

El proceso de entrenamiento del modelo base incluye un ajuste orientado a eliminar la censura política y otros filtros de contenido, según indican las etiquetas `uncensored` y `political-censorship` del repositorio. No se especifica si se empleó RLHF, DPO u otra técnica de alineación, ni qué datos se usaron para el afinado. La contribución de este repositorio es exclusivamente la cuantización: mradermacher aplica cuantización con importance matrix (imatrix) generada a partir de un corpus de calibración no especificado, lo que mejora la calidad de los cuantizados de baja precisión respecto a los estáticos equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, con modo multi-turno.
- Razonamiento general y respuesta a instrucciones (el modelo base es de tipo chat/conversational).
- Generación de código y matemáticas: capacidad esperable por el tamaño y la familia, pero no documentada explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.
- Alineación reducida: el modelo está afinado para minimizar la censura política, lo que afecta al tipo de respuestas que produce.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: el cuantizado i1-Q4_K_M (16,9 GB) permite ejecutar un modelo de 27B en una RTX 4090 (24 GB) o en una RTX 3090, usando llama.cpp u Ollama, con calidad cercana al modelo original.
- Inferencia en CPU con memoria RAM abundante: los cuantizados i1-Q2_K (11,0 GB) e i1-IQ3_S (12,7 GB) permiten ejecutar el modelo en servidores sin GPU dedicada, a costa de cierta pérdida de calidad.
- Investigación sobre censura y alineación: al ser un modelo explícitamente "uncensored", sirve para estudiar cómo varían las respuestas ante temas políticamente sensibles en comparación con el modelo Qwen3.8 original.
- Generación de contenido creativo sin filtros: escritura de ficción, guiones o material editorial donde los filtros de contenido del modelo base resultan limitantes, con la advertencia de revisión humana obligatoria.
- Prototipado de asistentes conversacionales en inglés: integración en pipelines de llama.cpp o vLLM (soporte GGUF) para pruebas de concepto de chatbots multi-turno.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 14 variantes de cuantización del mismo modelo, lo que permite medir el impacto de la precisión en la perplejidad y la calidad de las respuestas en un mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto y KV cache):
  - i1-Q2_K: ~11,0 GB
  - i1-IQ3_S: ~12,7 GB
  - i1-Q4_K_S: ~15,9 GB
  - i1-Q4_K_M: ~16,9 GB (recomendado por el autor como equilibrio velocidad/calidad)
  - i1-Q5_K_M: ~19,6 GB
  - i1-Q6_K: ~22,5 GB
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizados Q4 y Q5; A100 40/80 GB o H100 para Q6_K y para mayor contexto; para Q2_K e IQ3_S es viable una RTX 4080 (16 GB) o incluso CPU.
- ¿Cabe en GPU de consumo? Sí: los cuantizados Q4 caben en GPUs de 24 GB; los Q2/IQ3 caben en GPUs de 16 GB. Los Q5/Q6 requieren 24 GB o reparto parcial CPU/GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI a través de dichos servidores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2-i1-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizado de un modelo uncensored; solo inglés |
| InterpreticAI/Qwen3.8-27B-Uncensored-v2 | 27,3 B | no disponible | Apache 2.0 | safetensors (presumiblemente) | Modelo base sin cuantizar; requiere más VRAM |
| mradermacher/Qwen3.8-27B-Uncensored-v2-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF (estático) | Misma base, cuantización sin imatrix; calidad inferior a igual tamaño |
| Qwen3.8 original (familia) | no disponible | no disponible | no disponible | no disponible | Modelo con alineación estándar; no uncensored |

## Limitaciones y advertencias

- Modelo "uncensored": el afinado elimina filtros de contenido, incluida la censura política; puede generar contenido ofensivo, sesgado o factualmente incorrecto sin las salvaguardas habituales. Requiere moderación externa en producción.
- Riesgo de alucinación: como todo LLM de su tamaño, puede inventar hechos, citas y referencias; no se han publicado evaluaciones de fidelidad.
- Idioma: solo inglés según la model card; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: se desconoce la longitud de contexto nativa; los ficheros GGUF pueden requerir configuración manual de `n_ctx` en llama.cpp.
- Licencia Apache 2.0: permite uso comercial, pero el responsable del despliegue asume la responsabilidad legal del contenido generado, especialmente en jurisdicciones con restricciones sobre discurso político.
- Cuantización: los cuantizados de baja precisión (Q2_K, IQ3) degradan la calidad; el autor recomienda IQ3_S sobre Q3_K* y Q4_K_M como opción rápida.
- Sin garantías del cuantizador: mradermacher no documenta métricas de perplejidad ni evaluaciones de los cuantizados; la calidad debe validarse en el caso de uso concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v2-i1-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Cuantizados estáticos: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v2-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-v2-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
