# mradermacher/asteroid-14b-v0.1-GGUF

## Resumen

Asteroid-14b-v0.1-GGUF es la versión cuantizada en formato GGUF del modelo base ozone-research/asteroid-14b-v0.1, un modelo de lenguaje de aproximadamente 14.770 millones de parámetros (14,77 B) publicado por el colectivo ozone-research. La cuantización ha sido realizada por mradermacher, un conocido proveedor de cuantizaciones estáticas e imatrix para la comunidad de llama.cpp, y está disponible bajo licencia Apache 2.0.

El modelo base es un transformer conversacional orientado a instrucciones, entrenado únicamente en inglés según los metadatos de la model card. Su relevancia actual radica en que ofrece un tamaño intermedio (14B) que equilibra calidad y requisitos de hardware, permitiendo su despliegue en GPUs de consumo mediante cuantizaciones de 4 bits que ocupan entre 8,7 y 9,1 GB.

Esta ficha se centra en la versión GGUF, que es la que se distribuye en el repositorio, e incluye tanto cuantizaciones estáticas (Q2_K a Q8_0) como una variante imatrix disponible en un repositorio separado. No se dispone de información detallada sobre la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks del modelo base en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parámetros totales | 14.770.033.664 (14,77 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); imatrix disponibles en repositorio separado |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers como librería declarada) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base ozone-research/asteroid-14b-v0.1 en la información proporcionada. Los metadatos indican que se trata de un transformer con 14,77 mil millones de parámetros, etiquetado como "conversational" y compatible con endpoints. No se especifica si emplea atención lineal, decodificación especulativa, mezcla de expertos u otras innovaciones técnicas.

Tampoco se detalla el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. La model card del repositorio GGUF se limita a documentar el proceso de cuantización realizado por mradermacher, sin aportar información sobre el entrenamiento del modelo original. Para obtener estos datos sería necesario consultar la model card del modelo base en ozone-research/asteroid-14b-v0.1, que no está incluida en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere soporte para despliegue en infraestructuras de inferencia estándar.
- Capacidad de razonamiento y generación de código: no confirmada explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional en inglés para aplicaciones de chat: el modelo puede gestionar diálogos multi-turno en inglés, y su tamaño de 14B permite desplegarlo en una sola GPU de consumo con cuantización Q4_K_M (9,1 GB).
- Prototipado rápido en local con llama.cpp u Ollama: las cuantizaciones Q4_K_S y Q4_K_M están marcadas como "fast, recommended" por el autor de la cuantización, lo que las hace adecuadas para iterar en desarrollo sin infraestructura dedicada.
- Generación de texto en pipelines de procesamiento por lotes: al ser un modelo de 14B con licencia Apache 2.0, puede integrarse en servicios de generación de contenido en inglés sin restricciones de uso comercial.
- Evaluación comparativa de modelos base: sirve como punto de referencia de la familia Asteroid de ozone-research para investigadores que quieran comparar con otros modelos de 14B.
- Despliegue en entornos con VRAM limitada: la cuantización Q2_K (5,9 GB) permite ejecutar el modelo en GPUs con 8 GB de VRAM, aunque con pérdida de calidad.
- Fine-tuning posterior sobre la versión desquantizada: aunque el repositorio distribuye GGUF, el modelo base original (ozone-research/asteroid-14b-v0.1) puede emplearse para ajuste fino con transformers y licencia Apache 2.0.
- Servicio de inferencia con vLLM o TGI: la etiqueta "endpoints_compatible" sugiere compatibilidad con infraestructuras de serving estándar, aunque para GGUF el motor natural es llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~5,9 GB
  - Q3_K_S: ~6,8 GB
  - Q3_K_M: ~7,4 GB
  - Q3_K_L: ~8,0 GB
  - IQ4_XS: ~8,3 GB
  - Q4_K_S: ~8,7 GB
  - Q4_K_M: ~9,1 GB
  - Q5_K_S: ~10,4 GB
  - Q5_K_M: ~10,6 GB
  - Q6_K: ~12,2 GB
  - Q8_0: ~15,8 GB
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una RTX 4090 (24 GB) puede ejecutar cualquier cuantización del repositorio; una RTX 3090 (24 GB) también; una RTX 4080 (16 GB) puede ejecutar hasta Q8_0 con margen ajustado; GPUs de 8-12 GB pueden usar Q2_K a Q4_K_M.
- Cabe en GPU de consumo: sí, desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB) en GPUs de 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. La etiqueta "endpoints_compatible" sugiere también compatibilidad con infraestructuras de endpoints, aunque no se detalla.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, rendimiento) del modelo base, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| asteroid-14b-v0.1 (este) | 14,77 B | No disponible | Apache 2.0 | GGUF |
| Alternativas de 14B | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Idiomas: el modelo está entrenado únicamente en inglés según los metadatos; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado en inglés, es probable que herede sesgos de su corpus, pero no se especifica.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, existe riesgo inherente.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, conviene verificar la licencia del modelo base original por si hubiera condiciones adicionales no reflejadas en los metadatos del GGUF.
- Caveat para producción: las cuantizaciones Q2_K y Q3_K_M tienen menor calidad según las notas del autor (Q3_K_M marcada como "lower quality"); para producción se recomienda Q4_K_M o superior.
- Falta de información sobre el modelo base: no se dispone de detalles sobre arquitectura, entrenamiento, contexto ni benchmarks, lo que dificulta evaluar su idoneidad frente a alternativas consolidadas.
- El repositorio tiene un tamaño de 102 GB, lo que incluye todas las cuantizaciones; la descarga individual de cada archivo es la vía recomendada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/asteroid-14b-v0.1-GGUF
- Modelo base: https://huggingface.co/ozone-research/asteroid-14b-v0.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/asteroid-14b-v0.1-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#asteroid-14b-v0.1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
