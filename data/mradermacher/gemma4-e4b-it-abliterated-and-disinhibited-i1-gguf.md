# mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-i1-GGUF

## Resumen

`mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-i1-GGUF` es una colección de cuantizaciones GGUF (con importancia matrix, prefijo `i1`) del modelo `stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited`, a su vez derivado de Gemma 4 E4B instruct. El autor de las cuantizaciones es mradermacher, un conocido publicador de quants GGUF para llama.cpp. El modelo base incorpora dos modificaciones de alineamiento: "abliteration" (eliminación de direcciones de rechazo) y "disinhibition" (reducción de la tendencia a rechazar peticiones), orientadas a investigación en interpretabilidad mecanicista.

El modelo cuenta con 7.463.013.674 parámetros reales según los pesos en safetensors, lo que lo sitúa en la categoría de 7B. Es un modelo multimodal (visión), a juzgar por la referencia del autor a ficheros `mmproj` en el repositorio estático. La licencia es Gemma, con las restricciones de uso que ello implica. El idioma declarado es únicamente inglés.

La relevancia de esta ficha radica en que documenta un caso de cuantización de un modelo "desalineado" experimental: útil para estudiar los efectos de la abliteración sobre el comportamiento, pero con advertencias importantes para uso en producción por la ausencia de salvaguardas y por la licencia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles de capas y atención no disponibles) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M (y superiores hasta Q6_K según la lista de quants del README) |
| Idiomas soportados | en |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |
| Tamano del repo | 111,0 GB |
| Modelo base | stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited |
| Vision | si (mmproj disponible en el repositorio estático) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 E4B instruct, un transformer denso de aproximadamente 7,46 mil millones de parámetros. No se dispone en la información proporcionada de detalles sobre número de capas, dimensión oculta, mecanismo de atención (si usa atención local/global, GQA, etc.) ni longitud de contexto. El modelo base es instruct (`-it`), por lo que se asume un post-entrenamiento con instrucciones y preferencias, aunque no se detallan los datos ni el método (RLHF/DPO) en la información disponible.

La innovación técnica de esta variante no está en el entrenamiento original sino en la modificación del alineamiento: "abliteration" (proyección fuera de los pesos de las direcciones asociadas a rechazo) y "disinhibition" (ajuste adicional para reducir respuestas evasivas). El resultado es un modelo con salvaguardas reducidas, etiquetado explícitamente con `mechanistic-interpretability` y `alignment`. Las cuantizaciones i1 usan una importance matrix generada por el autor, lo que mejora la calidad respecto a quants estáticos a igual tamaño.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Gemma 4 E4B instruct.
- Capacidades multimodales de visión (el autor indica que es un modelo de visión y que los ficheros `mmproj` están en el repositorio estático).
- Razonamiento y respuesta a instrucciones propias de un modelo instruct de 7B.
- Comportamiento "desinhibido": menor tendencia a rechazar peticiones, útil para estudiar mecanismos de alineamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés declarado.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad mecanicista: comparar las activaciones y direcciones de rechazo del modelo base frente a la versión abliterada para estudiar cómo se codifica la negativa a responder.
- Evaluación de robustez de alineamiento: usar el modelo como caso de prueba en pipelines de red-teaming para medir qué salvaguardas persisten tras la abliteración.
- Experimentos académicos de seguridad: analizar la degradación de filtros de contenido en modelos de 7B cuantizados en entornos controlados y aislados.
- Inferencia local en hardware de consumo: los quants i1-Q4_K_M (~5,4 GB) permiten ejecutar el modelo en GPUs de 8 GB o en CPU con llama.cpp para pruebas de comportamiento.
- Estudio de cuantización: comparar la calidad de distintos niveles i1 (IQ2 a Q6_K) sobre las mismas tareas para medir el impacto del ruido de cuantización en un modelo modificado.
- Prototipado de asistentes conversacionales en inglés sin restricciones de contenido, siempre que el uso cumpla la licencia Gemma y se añadan filtros externos.
- Análisis de sesgos y toxicidad: generar respuestas en dominios sensibles para documentar riesgos antes de decidir si un modelo abliterado es apto para un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~3,4 GB (i1-IQ1_S) hasta ~5,4 GB (i1-Q4_K_M); los quants superiores (Q5_K_M, Q6_K) no aparecen con tamaño en la información disponible, pero por la progresión se sitúan por encima de 5,4 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para mayor throughput; cualquier GPU con 8 GB o más puede ejecutar los quants Q4.
- Cabe en GPU de consumo: sí, en GPUs con 6-8 GB o más usando quants Q4 o inferiores; los quants IQ1/IQ2 permiten incluso GPUs de 4 GB con pérdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el autor menciona `endpoints_compatible`. Para el modelo base en safetensors, vLLM o TGI (no confirmado en la información).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma4-E4B-it-Abliterated-AND-Disinhibited-i1-GGUF (este) | 7,46B | no disponible | gemma | GGUF i1 | Abliterado + desinhibido, visión, solo inglés |
| stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited | 7,46B | no disponible | gemma | safetensors | Modelo base sin cuantizar del que deriva este |
| mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-GGUF | 7,46B | no disponible | gemma | GGUF estático | Quants estáticos del mismo modelo base, con mmproj |
| Gemma 4 E4B-it (original) | ~7,5B (no confirmado) | no disponible | gemma | safetensors | Modelo de referencia con alineamiento intacto |

## Limitaciones y advertencias

- Modelo abliterado y desinhibido: las salvaguardas de rechazo están reducidas o eliminadas de forma deliberada; no es apto para producción sin filtros externos.
- Riesgo elevado de generar contenido dañino, sesgado o inexacto; la ausencia de rechazo no implica corrección factual.
- Riesgo de alucinación propio de un modelo de 7B, agravado por la modificación del alineamiento.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; revisar los términos antes de cualquier despliegue.
- Los quants IQ1 e IQ2 tienen calidad muy degradada (el propio autor los etiqueta como "for the desperate" o "very low quality").
- No se dispone de datos de benchmarks, contexto ni detalles de entrenamiento, lo que dificulta evaluar su calidad frente a alternativas.
- El tamaño del repositorio (111 GB) agrega todos los quants; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-i1-GGUF
- Modelo base: https://huggingface.co/stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited
- Quants estáticos (incluye mmproj): https://huggingface.co/mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma4-E4B-it-Abliterated-AND-Disinhibited-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
