# mradermacher/JonathanColetti-Qwen3.8-27B-Uncensored-GGUF

## Resumen

JonathanColetti-Qwen3.8-27B-Uncensored-GGUF es la versión cuantizada en formato GGUF del modelo JonathanColetti-Qwen3.8-27B-Uncensored, publicado por el usuario jaromer. Se trata de un modelo de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) derivado de la familia Qwen3.8, con las capas de rechazo eliminadas mediante la técnica de abliteration, lo que da como resultado un modelo sin los filtros de seguridad habituales. La cuantización la ha realizado mradermacher, un conocido especialista en la conversión de pesos a GGUF para su uso con llama.cpp y ecosistemas compatibles.

El modelo está etiquetado con las capacidades mtp y vision, lo que indica soporte de predicción multi-token y de entrada multimodal, si bien la información proporcionada no detalla la arquitectura interna ni el esquema exacto de atención. Los idiomas declarados son inglés y chino, y la licencia es Apache 2.0. El repositorio, de 190,8 GB, incluye un conjunto amplio de cuantizaciones estáticas (desde Q2_K hasta Q8_0) más los ficheros mmproj necesarios para el procesamiento visual.

Su relevancia actual radica en que ofrece un modelo de ~27B con capacidades multimodales y sin censura en un formato que puede ejecutarse en hardware de consumo con suficiente VRAM o memoria unificada, lo que lo hace atractivo para investigación sobre alineación, generación de contenido sin restricciones y despliegue local. No obstante, la ausencia de datos de benchmarks y de documentación técnica detallada obliga a tratar sus capacidades con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.8; etiquetas mtp y vision) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Las etiquetas de la model card indican que deriva de Qwen3.8, incluye la etiqueta mtp (multi-token prediction, predicción multi-token) y soporta visión, lo que sugiere un transformer multimodal con cabecera de predicción multi-token. El número de parámetros (27,3B) es coherente con un modelo denso de esa escala, aunque no se confirma si emplea mezcla de expertos.

El proceso de entrenamiento del modelo base no está documentado en la información disponible: no se especifican el volumen de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el proceso de abliteration aplicado por jaromer, que elimina direcciones de activación asociadas al rechazo para producir un modelo "uncensored". La cuantización realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye ficheros mmproj separados para el componente multimodal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Procesamiento de imágenes gracias a los ficheros mmproj incluidos (etiqueta vision).
- Predicción multi-token (mtp) según las etiquetas del repositorio.
- Comportamiento sin censura (abliterated/uncensored): no aplica rechazos por contenido.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documentan capacidades de audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del modelo base alineado, en entornos controlados de laboratorio.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas que los modelos alineados rechazan, ejecutada localmente con llama.cpp.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (16,9 GB) puede ejecutarse en GPUs de consumo de 24 GB, útil para prototipos que requieran privacidad total de datos.
- Procesamiento de documentos con imágenes: el componente mmproj permite extraer y describir contenido visual de capturas, diagramas o documentos escaneados en flujos batch.
- Experimentación multimodal en chino e inglés: análisis de imágenes con instrucciones en cualquiera de los dos idiomas soportados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantización, lo que permite medir la degradación de perplejidad y calidad entre Q2_K y Q8_0 en una misma tarea.
- Fine-tuning posterior: el modelo base en safetensors puede servir como punto de partida para ajustes específicos de dominio, aunque la licencia Apache 2.0 facilita su uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~11,0 GB; Q3_K_M ~13,6 GB; IQ4_XS ~15,5 GB; Q4_K_M ~16,9 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. Añadir ~0,7-1,0 GB si se usa el componente visión (mmproj).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas; A100 40/80 GB o H100 para Q8_0 y para mayor throughput; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) limitadas a Q2_K o IQ4_XS con offloading parcial.
- Cabe en GPU de consumo: sí, en modelos de 24 GB con Q4_K_M o inferiores; en 16 GB solo con cuantizaciones bajas y posible offloading a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros mmproj requieren soporte multimodal del runtime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JonathanColetti-Qwen3.8-27B-Uncensored-GGUF | ~27,3B | no disponible | Apache 2.0 | GGUF | Abliterated, visión, en/zh |
| Modelo base jaromer/JonathanColetti-Qwen3.8-27B-Uncensored | ~27,3B | no disponible | Apache 2.0 | safetensors | Sin cuantizar, referencia para comparar |
| Qwen3.8 (familia original) | no disponible | no disponible | no disponible | no disponible | Modelo de origen alineado |

No se dispone de datos de benchmarks ni de otros modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de las capas de rechazo puede degradar la coherencia en tareas que requieren matices éticos y aumentar la probabilidad de contenido dañino; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al tratarse de una modificación del modelo base, la abliteration puede afectar a la calidad general.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin verificación empírica.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la legalidad del contenido generado en jurisdicciones concretas.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No hay información sobre sesgos específicos ni sobre la composición del dataset de entrenamiento, lo que impide evaluar sesgos sistemáticos.
- El repositorio tiene 0 likes y no cuenta con validación de la comunidad; los datos de benchmarks brillan por su ausencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/JonathanColetti-Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/jaromer/JonathanColetti-Qwen3.8-27B-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/JonathanColetti-Qwen3.8-27B-Uncensored-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#JonathanColetti-Qwen3.8-27B-Uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
