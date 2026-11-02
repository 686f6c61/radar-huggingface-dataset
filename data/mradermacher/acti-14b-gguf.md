# mradermacher/ACTi-14B-GGUF

## Resumen

ACTi-14B-GGUF es la versión cuantizada en formato GGUF del modelo LordNeel/ACTi-14B, publicada por mradermacher, un actor conocido en la comunidad por generar cuantizaciones estáticas de modelos abiertos. El modelo original cuenta con 14.770.033.664 parámetros (aproximadamente 14,77 mil millones) según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de tamaño medio-grande, adecuado para despliegue en una sola GPU de gama alta o en configuraciones multi-GPU de consumo.

La relevancia de esta publicación radica en que facilita el uso del modelo base mediante llama.cpp y derivados (Ollama, LM Studio, etc.), ofreciendo un abanico de cuantizaciones que van desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. El modelo está etiquetado como conversacional y orientado al idioma inglés.

No obstante, la información pública disponible es muy limitada: no se especifican la arquitectura interna, la longitud de contexto, la licencia ni los datos de entrenamiento del modelo base. Esta ficha refleja exclusivamente los datos verificables a partir de la model card, los metadatos de HuggingFace y el repositorio de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 14.770.033.664 (~14,77 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LordNeel/ACTi-14B en la documentación proporcionada. El recuento de parámetros (14,77 B) y la etiqueta `transformers` sugieren un transformer decoder-only de tamaño medio, pero no se confirma ni el tipo de atención, ni si emplea técnicas como GQA, ni la composición del dataset de entrenamiento, ni si hubo fases de RLHF o DPO.

La model card del repositorio GGUF es puramente operativa: describe el proceso de cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y lista los ficheros generados. No se mencionan innovaciones técnicas, datos de entrenamiento ni detalles del pipeline del modelo original. Las cuantizaciones con imatrix no estaban disponibles en el momento de la publicación según el autor.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational`, lo que indica que está afinado o preparado para diálogo multi-turno.
- Idiomas: soporte declarado únicamente para inglés (`en`).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia compatible con la API de HuggingFace.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se especifican capacidades de código o matemáticas en la información disponible.

## Casos de uso

- Despliegue local de un asistente conversacional en inglés: con la cuantización Q4_K_M (9,1 GB) el modelo puede ejecutarse en una GPU de consumo con 12 GB de VRAM, ofreciendo un chatbot local sin dependencia de la nube.
- Prototipado rápido con Ollama o LM Studio: al estar en formato GGUF, se puede cargar directamente en estas herramientas para experimentar con diálogo en inglés sin infraestructura adicional.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once variantes de cuantización, lo que permite medir el impacto de la compresión en la calidad de las respuestas para un mismo modelo base.
- Inferencia en CPU o configuraciones híbridas: las cuantizaciones Q2_K (5,9 GB) y Q3_K_S (6,8 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, con la consiguiente pérdida de calidad.
- Fine-tuning posterior sobre la versión desquantizada: aunque el repositorio es GGUF, el modelo base LordNeel/ACTi-14B puede servir como punto de partida para ajuste fino en tareas conversacionales en inglés.
- Servicio de inferencia con endpoints compatibles: la etiqueta `endpoints_compatible` facilita integrar el modelo en plataformas de serving que acepten el formato de HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero, sin overhead de contexto):
  - Q2_K: 5,9 GB
  - Q3_K_S: 6,8 GB
  - Q3_K_M: 7,4 GB
  - Q3_K_L: 8,0 GB
  - IQ4_XS: 8,3 GB
  - Q4_K_S: 8,7 GB
  - Q4_K_M: 9,1 GB
  - Q5_K_S: 10,4 GB
  - Q5_K_M: 10,6 GB
  - Q6_K: 12,2 GB
  - Q8_0: 15,8 GB
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q4_K_M encaja en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070); Q6_K y Q8_0 requieren 16 GB o más (RTX 4080, RTX 4090, A100).
- Cabe en GPU de consumo: sí, las cuantizaciones Q4 y Q5 en GPUs de 12-16 GB; las versiones Q2/Q3 en GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base LordNeel/ACTi-14B no incluye datos de benchmarks ni especificaciones que permitan una comparación rigurosa con alternativas de tamaño similar (por ejemplo, Qwen2.5-14B o Mistral-Nemo-12B), por lo que la comparativa se considera no disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor del modelo base antes de usarlo en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación: inherente a los modelos generativos; no hay documentación sobre mitigaciones.
- Cuantizaciones de baja precisión: Q2_K y Q3_K pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como opción rápida y Q8_0 como mejor calidad.
- Sin cuantizaciones imatrix: el autor indica que no estaban disponibles en el momento de la publicación, lo que puede afectar a la calidad respecto a versiones ponderadas.
- Modelo base poco documentado: la ausencia de model card detallada en LordNeel/ACTi-14B limita la evaluación de sesgos, datos de entrenamiento y comportamiento en producción.
- Repositorio de 102 GB: requiere espacio en disco considerable si se descargan todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ACTi-14B-GGUF
- Modelo base: https://huggingface.co/LordNeel/ACTi-14B
- Página de descargas del autor: https://hf.tst.eu/model#ACTi-14B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
