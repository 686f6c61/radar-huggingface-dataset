# mradermacher/VibeWorlder-30B-A3B-i1-GGUF

## Resumen

VibeWorlder-30B-A3B-i1-GGUF es una compilación de cuantizaciones GGUF del modelo base usail-hkust/VibeWorlder-30B-A3B, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización del checkpoint original en formato transformers a formato GGUF, con el objetivo de facilitar su despliegue en entornos de inferencia locales mediante llama.cpp y herramientas compatibles. El modelo base tiene 30.532.122.624 parámetros totales (aproximadamente 30,5 mil millones), lo que, junto con la nomenclatura "A3B", sugiere una arquitectura de mezcla de expertos (MoE) con alrededor de 3 mil millones de parámetros activos por token, aunque este dato no está confirmado explícitamente en la información disponible.

La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamaño en hardware de consumo mediante cuantizaciones que van desde 6,5 GB (IQ1_S) hasta 25,2 GB (Q6_K). El repositorio incluye cuantizaciones con imatrix (importancia matricial), lo que mejora la calidad respecto a las cuantizaciones estáticas convencionales en rangos bajos y medios. El modelo está etiquetado como conversacional y orientado al inglés, y el autor lo publica bajo el paraguas de su iniciativa de cuantización para la comunidad.

La información disponible sobre el modelo base es escasa: no se especifican la longitud de contexto, la licencia, los datos de entrenamiento ni los benchmarks. Esta ficha recoge únicamente los datos verificables de la model card y de los metadatos de Hugging Face, indicando explícitamente "no disponible" en los campos que no se han podido confirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la nomenclatura A3B sugiere MoE con ~3B activos, sin confirmar) |
| Parámetros totales | 30.532.122.624 (30,5 B) |
| Parámetros activos | No disponible (posiblemente ~3 B según el sufijo A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; también disponible imatrix |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base usail-hkust/VibeWorlder-30B-A3B. El sufijo "A3B" en la nomenclatura es característico de los modelos de mezcla de expertos (MoE) que indican el número de parámetros activos por token (en este caso, aproximadamente 3 mil millones), mientras que el total asciende a 30,5 mil millones. Sin embargo, esta interpretación no está confirmada en la model card ni en los metadatos disponibles.

Tampoco se especifican los datos de entrenamiento (número de tokens, composición del dataset), la presencia de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio de cuantización se limita a describir el proceso de cuantización y a listar los ficheros generados, sin aportar detalles sobre el entrenamiento del modelo original. El proceso de cuantización empleado por mradermacher utiliza imatrix (matriz de importancia) generada a partir de datos de calibración, lo que mejora la fidelidad de las cuantizaciones de baja precisión respecto a las estáticas.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y orientado a diálogo multi-turno.
- Razonamiento y generación de texto general: capacidades inferidas por su naturaleza de modelo de lenguaje de gran tamaño, aunque no se detallan tareas específicas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones i1-Q4_K_M (18,7 GB) o i1-Q4_K_S (17,6 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, como la RTX 4090, manteniendo una calidad razonable gracias al uso de imatrix.
- Asistentes conversacionales autoalojados: el modelo está etiquetado como conversacional y puede integrarse en aplicaciones de chat mediante llama.cpp u Ollama, manteniendo los datos en infraestructura propia.
- Prototipado e investigación: la disponibilidad de cuantizaciones desde 6,5 GB (IQ1_S) hasta 25,2 GB (Q6_K) permite experimentar con distintos compromisos calidad/tamaño en el mismo hardware, algo útil para estudiar el impacto de la cuantización en el rendimiento.
- Generación de texto en pipelines de procesamiento por lotes: con cuantizaciones Q4 o Q5 y servidores compatibles con GGUF (llama.cpp server, Ollama), se puede procesar texto en lotes en entornos con recursos limitados.
- Evaluación comparativa de cuantizaciones: el repositorio incluye el fichero imatrix y una amplia gama de tipos de cuantización, lo que facilita estudios de degradación de calidad (perplejidad) entre variantes.
- Educación y experimentación con modelos MoE de gran tamaño: si se confirma la arquitectura MoE con ~3B activos, el modelo sería adecuado para estudiar el comportamiento de modelos dispersos en hardware modesto, aunque esta aplicación depende de la confirmación de la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - i1-IQ1_S: ~6,5 GB
  - i1-IQ2_M: ~10,3 GB
  - i1-IQ3_M: ~13,6 GB
  - i1-Q4_K_M: ~18,7 GB
  - i1-Q5_K_M: ~21,8 GB
  - i1-Q6_K: ~25,2 GB
- GPU recomendadas:
  - Cuantizaciones Q4 y superiores: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB.
  - Cuantizaciones IQ2 e IQ3: RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3080 (10-12 GB) para las más pequeñas.
  - Cuantizaciones IQ1: GPUs con 8 GB o menos, aunque con calidad muy degradada.
- ¿Cabe en GPU de consumo? Sí, las cuantizaciones Q4_K_M y Q4_K_S caben en GPUs de 24 GB; las IQ3 e IQ2 caben en GPUs de 12-16 GB; las IQ1 caben en 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui con el loader de llama.cpp). No se menciona soporte para vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si se permite el uso comercial. Es imprescindible verificar la licencia del modelo base usail-hkust/VibeWorlder-30B-A3B antes de cualquier despliegue en producción.
- El modelo está etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "very low quality".
- No se dispone de información sobre sesgos, riesgo de alucinación ni evaluación de seguridad del modelo base.
- La longitud de contexto es desconocida; no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- El repositorio tiene 592 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.
- Al ser una cuantización de un modelo base poco documentado, no hay garantías sobre la fidelidad del comportamiento respecto al original más allá de lo que ofrece el proceso de imatrix.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/VibeWorlder-30B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/usail-hkust/VibeWorlder-30B-A3B
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/VibeWorlder-30B-A3B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#VibeWorlder-30B-A3B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
