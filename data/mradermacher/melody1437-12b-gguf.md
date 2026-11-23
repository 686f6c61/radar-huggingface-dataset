# mradermacher/Melody1437-12B-GGUF

## Resumen

Melody1437-12B-GGUF es la versión cuantizada en formato GGUF del modelo Melody1437-12B, desarrollado originalmente por ReadyArt y convertido por mradermacher, un conocido publicador de cuantizaciones para llama.cpp. El modelo base es un ajuste fino de tipo instruct/conversacional orientado a roleplay y contenido para adultos, construido sobre una arquitectura de la familia Gemma (etiquetada como gemma-4 en los metadatos) con aproximadamente 11.900 millones de parámetros. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y sus derivados, sin necesidad de GPUs de centro de datos.

La relevancia de esta ficha radica en que el repositorio original solo distribuye pesos en safetensors, mientras que esta conversión ofrece 11 cuantizaciones estáticas (desde Q2_K hasta Q8_0) más dos variantes del proyector multimodal (mmproj), lo que amplía enormemente las opciones de despliegue. El modelo está pensado para conversación multi-turno, juegos de rol y generación de narrativa, con etiquetas explícitas de contenido NSFW y "unaligned", lo que condiciona su uso a entornos con control de acceso y moderación.

La licencia declarada es Apache 2.0, lo que permite uso comercial, aunque el contenido generado y el propósito del modelo requieren consideraciones adicionales de cumplimiento. El repositorio tiene un tamaño de 83,7 GB, correspondiente al conjunto completo de cuantizaciones, y acumula 416 descargas y 2 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma (etiqueta gemma-4); detalles de capas y atención no disponibles |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; además mmproj-f16 y mmproj-Q8_0 para multimodal |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Modelo base | ReadyArt/Melody1437-12B |
| Cuantizador | mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Tamaño del repositorio | 83,7 GB (conjunto completo de cuantizaciones) |
| Descargas / likes | 416 / 2 |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura de la familia Gemma, un transformer decoder-only con atención causal estándar; los metadatos lo etiquetan como "gemma-4", aunque no se especifican el número de capas, la dimensión oculta ni la configuración exacta de atención. El modelo tiene 11.907.350.576 parámetros, lo que lo sitúa en la clase de 12B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o ajuste supervisado más allá de la etiqueta "instruct" y "conversational".

La innovación principal de este repositorio no está en el modelo, sino en el proceso de cuantización: mradermacher aplica cuantizaciones estáticas K-quant e I-quant con `output_tensor_quantised: 1` y `quantize_version: 2`, e incluye un proyector multimodal (mmproj) en f16 y Q8_0, lo que sugiere que el modelo base incorpora capacidades de visión que se preservan en la conversión. También se ofrece una variante con cuantización ponderada por imatrix en el repositorio `mradermacher/Melody1437-12B-i1-GGUF`, que suele ofrecer mejor calidad por bit que las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional multi-turno, con énfasis en roleplay y narrativa interactiva.
- Modo instruct: sigue instrucciones y mantiene personajes o estilos definidos en el prompt.
- Capacidades multimodales: la presencia de archivos mmproj indica soporte de entrada de imágenes (visión), aunque no se detalla su alcance.
- Contenido para adultos: el modelo está ajustado explícitamente para NSFW, ERP (erotic roleplay) y contenido maduro.
- Etiqueta "unaligned": menor énfasis en rechazos de seguridad, lo que implica respuestas más directas en temas sensibles.
- Idioma: inglés como único idioma declarado.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta modo de razonamiento explícito (thinking mode), audio ni otras modalidades.

## Casos de uso

- Roleplay conversacional en local: el modelo puede mantener personajes coherentes en conversaciones largas, y las cuantizaciones Q4_K_M (7,5 GB) permiten ejecutarlo en una GPU de consumo de 12 GB o en CPU con RAM suficiente.
- Generación de narrativa interactiva y ficción: adecuado para escribir diálogos y tramas ramificadas con un estilo consistente, gracias a su ajuste específico para conversación creativa.
- Prototipado de chatbots de personaje: integrable en aplicaciones de chat mediante llama.cpp u Ollama, con control total sobre el system prompt y el historial.
- Investigación sobre alineamiento y seguridad: la etiqueta "unaligned" lo convierte en un caso de estudio útil para evaluar comportamientos sin filtros y diseñar capas de moderación externas.
- Evaluación de cuantizaciones: el repositorio ofrece 11 variantes de cuantización del mismo modelo, lo que permite medir el impacto de la compresión en calidad conversacional con un protocolo controlado.
- Despliegue en entornos con recursos limitados: la variante Q2_K (4,9 GB) o Q3_K_S (5,6 GB) permite ejecución en equipos con 8 GB de VRAM o en CPU, a costa de degradación de calidad.
- Experimentación multimodal: los archivos mmproj permiten probar entrada de imágenes en llama.cpp, aunque la documentación sobre el alcance de la visión es escasa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~4,9 GB; Q3_K_S ~5,6 GB; Q3_K_M ~6,2 GB; Q3_K_L ~6,7 GB; IQ4_XS ~6,8 GB; Q4_K_S ~7,1 GB; Q4_K_M ~7,5 GB; Q5_K_S ~8,4 GB; Q5_K_M ~8,6 GB; Q6_K ~9,9 GB; Q8_0 ~12,8 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4090 24 GB para Q8_0 con contexto amplio; A100/H100 solo si se requiere alto throughput o contexto muy largo.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 6-8 GB hasta Q8_0 en GPUs de 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de endpoints (el repositorio incluye la etiqueta `endpoints_compatible`). No se documenta soporte nativo en vLLM o TGI para este formato.
- Latencia y throughput: no disponibles; dependen de la cuantización, el hardware y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Melody1437-12B-GGUF | ~11,9 B | No disponible | Apache 2.0 | GGUF (11 cuantizaciones) | Roleplay/NSFW, inglés, con mmproj |
| Melody1437-12B (base) | ~11,9 B | No disponible | Apache 2.0 | Safetensors | Pesos originales de ReadyArt |
| Melody1437-12B-i1-GGUF | ~11,9 B | No disponible | Apache 2.0 | GGUF (imatrix) | Misma base, cuantización ponderada por imatrix |
| Gemma 2 9B / Gemma 3 12B | 9-12 B | 8K-128K (según variante) | Gemma license | Safetensors, GGUF | Modelos generalistas de Google; no especializados en roleplay |

La comparación con modelos generalistas de la misma clase (Gemma 2 9B, Gemma 3 12B) es pertinente por tamaño, pero no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa. Las alternativas de roleplay de 12B no están identificadas en la información proporcionada.

## Limitaciones y advertencias

- Contenido NSFW y explícito: el modelo está diseñado para generar contenido para adultos; requiere control de acceso, verificación de edad y moderación en cualquier despliegue público.
- Etiqueta "unaligned": menor probabilidad de rechazo ante peticiones sensibles, lo que aumenta el riesgo de generar contenido dañino o inapropiado sin salvaguardas externas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; en tareas de conocimiento general el modelo puede inventar datos.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin pruebas empíricas.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad; para producción se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero el cumplimiento de normativas sobre contenido adulto y la responsabilidad sobre las salidas recaen en el desplegador.
- El repositorio tiene pocas descargas y likes, y no hay benchmarks publicados, por lo que la calidad real del ajuste fino no está validada por la comunidad.
- El modelo base no está documentado en detalle (dataset, proceso de entrenamiento), lo que dificulta evaluar sesgos y procedencia de los datos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Melody1437-12B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-12B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Melody1437-12B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Melody1437-12B-GGUF
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
