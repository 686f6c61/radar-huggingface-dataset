# mradermacher/Mira-v1.19.2-27B-GGUF

## Resumen

Mira-v1.19.2-27B-GGUF es la versión cuantizada en formato GGUF del modelo Lambent/Mira-v1.19.2-27B, un modelo de lenguaje conversacional de 27.009.007.616 parámetros (aproximadamente 27B) obtenido mediante la técnica de model merging con mergekit. El modelo base del que deriva es de tipo Gemma, según indica la licencia `gemma` asociada, y está orientado a conversación en inglés. Esta versión GGUF ha sido producida por mradermacher, un conocido publicador de cuantizaciones estáticas para la comunidad de inferencia local.

La relevancia de esta ficha radica en que ofrece un abanico amplio de cuantizaciones (desde Q2_K hasta Q8_0, más variantes IQ4_XS y ficheros mmproj multimodales) que permiten ejecutar un modelo de 27B en hardware de consumo, algo imposible con los pesos completos en precisión original. El repositorio ocupa 188,1 GB en total, pero cada quant individual ocupa entre 10,6 GB (Q2_K) y 28,8 GB (Q8_0).

El modelo es de tipo "merge", es decir, no ha sido entrenado desde cero por el autor del merge, sino que combina pesos de modelos existentes. La información disponible no detalla la receta de merge, los datasets de entrenamiento originales ni los benchmarks, por lo que muchos apartados técnicos deben marcarse como no disponibles. Está pensado para uso conversacional en inglés y su licencia es la de Gemma, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base de tipo Gemma, según licencia; detalles no disponibles) |
| Parametros totales | 27.009.007.616 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |
| Tamano del repo | 188,1 GB (todas las cuantizaciones juntas) |
| Cuantizacion por tipo (tamano) | Q2_K: 10,6 GB; Q3_K_S: 12,3 GB; Q3_K_M: 13,5 GB; Q3_K_L: 14,6 GB; IQ4_XS: 15,0 GB; Q4_K_S: 15,8 GB; Q4_K_M: 16,6 GB; Q5_K_S: 18,9 GB; Q5_K_M: 19,4 GB; Q6_K: 22,3 GB; Q8_0: 28,8 GB; mmproj-Q8_0: 0,7 GB; mmproj-f16: 1,0 GB |
| Modelo base | Lambent/Mira-v1.19.2-27B |
| Herramienta de merge | mergekit |
| Libreria | transformers, compatible con llama.cpp (GGUF) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna más allá de que el modelo base es de tipo Gemma (la licencia es `gemma` y el modelo se distribuye bajo esa licencia). Se trata de un modelo de fusión (merge) generado con mergekit, lo que implica que sus pesos provienen de la combinación de otros modelos, no de un entrenamiento desde cero. El número total de parámetros es de 27.009.007.616, lo que lo sitúa en la categoría de 27B.

No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La model card del cuantizador es puramente operativa (lista de ficheros GGUF y notas sobre tipos de cuantización) y no aporta información sobre el entrenamiento del modelo original. Para obtener detalles sobre la receta de merge y el entrenamiento, habría que consultar la model card del modelo base Lambent/Mira-v1.19.2-27B, que no está incluida en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Capacidades multimodales indicadas por la presencia de ficheros `mmproj` (proyección multimodal) en el repositorio, lo que sugiere soporte de entrada de imágenes en el modelo base; sin embargo, no se detalla el alcance exacto.
- Razonamiento general y respuesta a instrucciones, derivado de los modelos fusionados (no documentado explícitamente).
- No hay información disponible sobre soporte de tool calling o function calling.
- No hay información disponible sobre capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el campo `language: en`.
- No se documentan modos especiales como "thinking mode", audio u otras modalidades más allá de la posible visión indicada por los ficheros mmproj.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede gestionarse en una estación de trabajo con GPU de consumo usando la cuantización Q4_K_M (16,6 GB) o Q5_K_M (19,4 GB), adecuado para chatbots de escritorio con privacidad total y sin dependencia de API.
- Prototipado de aplicaciones de chat multi-turno: gracias a su tamaño de 27B y a la disponibilidad de cuantizaciones ligeras (Q2_K, 10,6 GB), permite iterar rápidamente en entornos de desarrollo con recursos limitados.
- Generación de texto asistida en inglés para redacción de borradores, resúmenes y reescritura, desplegando el modelo con llama.cpp u Ollama en una sola GPU.
- Investigación sobre model merging: al ser un modelo de fusión, sirve como caso de estudio para evaluar el comportamiento de merges de 27B en tareas conversacionales y comparar con los modelos originales.
- Evaluación de cuantizaciones: el repositorio ofrece un espectro completo de quant types (Q2 a Q8, más IQ4_XS) que permite medir la degradación de calidad frente a tamaño, útil para estudiar el impacto de la cuantización en modelos de 27B.
- Despliegue en entornos con requisitos de licencia Gemma: organizaciones que ya operan bajo los términos de la licencia Gemma pueden integrar este modelo en sus flujos internos de generación de texto en inglés.
- Experimentación multimodal (si se confirma el soporte): los ficheros mmproj permiten, en teoría, combinar el modelo con un proyector multimodal para tareas de visión-lenguaje, aunque la información disponible no detalla su funcionamiento ni su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~10,6 GB de pesos; con overhead de contexto, ~12-14 GB.
  - Q3_K_M: ~13,5 GB; con overhead, ~15-17 GB.
  - Q4_K_M: ~16,6 GB; con overhead, ~18-20 GB.
  - Q5_K_M: ~19,4 GB; con overhead, ~21-23 GB.
  - Q6_K: ~22,3 GB; con overhead, ~24-26 GB.
  - Q8_0: ~28,8 GB; con overhead, ~31-33 GB.
- GPU recomendadas:
  - Q4_K_M y Q5_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB).
  - Q6_K y Q8_0: A6000, A100 40 GB, H100, o configuraciones multi-GPU.
  - Q2_K y Q3_K: RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) con contexto moderado.
- ¿Cabe en GPU de consumo? Sí, las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 16-24 GB; Q5_K_M y Q6_K requieren 24 GB o más; Q8_0 requiere GPU profesional o multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). El repositorio también incluye ficheros compatibles con `endpoints_compatible` según los tags.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mira-v1.19.2-27B-GGUF (este) | 27,0B | no disponible | gemma | GGUF (Q2-Q8) | Merge con mergekit, inglés, posible multimodal |
| Modelo base Lambent/Mira-v1.19.2-27B | 27,0B | no disponible | gemma | safetensors | Origen del merge; sin cuantizar |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría (mismo tamaño o misma tarea). Se recomienda consultar benchmarks publicados de modelos de ~27B de la familia Gemma o de merges similares, pero esos datos no están incluidos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un merge de modelos, hereda los sesgos de sus componentes, que no se detallan.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo de 27B, puede producir contenido plausible pero incorrecto, especialmente en dominios especializados.
- Limitaciones de idioma: el modelo está etiquetado únicamente para inglés (`language: en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Restricciones de licencia: la licencia es `gemma`, lo que implica que el uso comercial está sujeto a los términos de la Gemma Terms of Use; es imprescindible revisarlos antes de un despliegue en producción.
- Al ser una cuantización estática, las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio rapidez/calidad y Q8_0 como mejor calidad.
- El modelo es un merge generado con mergekit; no hay información sobre la receta de fusión, lo que dificulta la reproducibilidad y la evaluación de su comportamiento frente a los modelos originales.
- La presencia de ficheros mmproj sugiere capacidades multimodales, pero no se documenta su funcionamiento, calidad ni requisitos; no debe asumirse soporte de visión estable en producción sin validación.
- El repositorio tiene muy pocas descargas (114) y ningún "like", lo que indica una adopción comunitaria muy baja y escasa validación externa.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/Mira-v1.19.2-27B-GGUF
- Modelo base: https://huggingface.co/Lambent/Mira-v1.19.2-27B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Mira-v1.19.2-27B-i1-GGUF
- Página de resumen del cuantizador: https://hf.tst.eu/model#Mira-v1.19.2-27B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
