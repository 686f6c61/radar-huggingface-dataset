# ATH-MaaS/Ovis-Omni-Embedding-3B

## Resumen

Ovis-Omni-Embedding-3B es un modelo de embeddings universal de 3.000 millones de parametros desarrollado por ATH-MaaS, disenado para mapear texto, imagenes, documentos visuales, video, audio y entradas multimodales intercaladas a un unico espacio de representacion coherente. Esto permite recuperacion any-to-any (cualquier modalidad contra cualquier modalidad) con un solo codificador, en lugar de mantener torres de embedding separadas por modalidad. El modelo se inicializa a partir de Qwen2.5-Omni-3B y conserva su tokenizador de texto nativo, el codificador visual, el codificador de audio y el backbone Thinker compartido, eliminando el Talker de generacion de voz y la cabeza de modelado de lenguaje.

La relevancia del modelo reside en su caracter bi-encoder omni-modal: codifica consultas y candidatos de forma independiente y usa la similitud coseno entre vectores L2-normalizados para el ranking, lo que lo hace adecuado para busqueda multimodal, RAG, recomendacion y recuperacion agentica sobre herramientas, interfaces y memoria. Segun la model card, alcanza 58,46 de media en el benchmark MMEB-v3 (190 datasets), superando al mejor baseline comparado por 5,19 puntos y liderando el agregado de cada grupo de modalidad.

La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors con la libreria transformers. El repositorio ocupa 11,2 GB y acumula 340 descargas y 64 likes en el momento de la consulta. El modelo se publico el 20 de septiembre de 2026 y se actualizo el 10 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (Qwen2.5-Omni Thinker) con TMRoPE; bi-encoder para retrieval |
| Parametros totales | 3B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-3B y conserva su tokenizador de texto nativo, el codificador visual, el codificador de audio y el backbone Thinker compartido. Se eliminan el Talker de generacion de voz y la cabeza de modelado de lenguaje. La entrada se formatea con una instruccion de retrieval mediante el procesador y la plantilla de chat nativos; los tokens de texto, visuales y acusticos se procesan como una unica secuencia intercalada por el Transformer causal compartido. El embedding de retrieval es directamente el estado oculto de la ultima capa en el ultimo token no de padding, sin cabezas de proyeccion especificas por modalidad. El TMRoPE (time-aligned multimodal rotary position embedding) de Qwen2.5-Omni preserva la alineacion temporal entre audio y video.

El entrenamiento se organiza en tres etapas. La primera es un preentrenamiento contrastivo omni-modal con candidatos mezclados globalmente y negativos in-batch entre dispositivos, combinando aprendizaje contrastivo focal consciente de la dificultad con destilacion de distribuciones de similitud desde expertos de modalidad complementarios. La segunda es un ajuste fino homogeneo de parametros completos con datos de alta calidad, donde cada micro-batch proviene de un unico dataset y la deduplicacion de candidatos evita colisiones de positivos y falsos negativos in-batch. La tercera es una destilacion de embeddings con annealing que retiene ejemplos corregidos por el profesor, sobremuestrea ejemplos no resueltos del estudiante y aplica supervision forward-KL adaptativa a la confianza. Ademas, en inferencia se emplea un modulo de descomposicion de bajo rango que combina una base PCA compartida con adaptadores residuales ligeros para embeddings compactos, sin anadir torres en tiempo de inferencia.

## Capacidades

- Generacion de embeddings de retrieval para texto, imagenes, documentos visuales, video, audio y entradas multimodales intercaladas en un unico espacio.
- Recuperacion any-to-any: consulta en una modalidad contra candidatos en cualquier otra modalidad.
- Recuperacion de documentos visuales (paginas, capturas, PDFs renderizados).
- Busqueda de video y busqueda de audio.
- Recuperacion agentica sobre herramientas, interfaces y memoria.
- Uso como bi-encoder: codificacion independiente de consultas y candidatos, sin atencion cruzada query-candidato ni generacion de respuestas.
- Soporte de instrucciones de retrieval mediante la plantilla de chat nativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible como capacidad generativa (el modelo no genera texto).

## Casos de uso

- Busqueda multimodal empresarial: indexar un corpus heterogeneo (texto, imagenes, PDFs, video, audio) y permitir consultas en cualquier modalidad contra cualquier candidato, gracias al espacio de embedding unico y al enfoque bi-encoder.
- RAG multimodal: recuperar pasajes, figuras, clips de video o fragmentos de audio relevantes para aumentar la generacion de un LLM, usando la similitud coseno sobre embeddings L2-normalizados.
- Recuperacion de documentos visuales: localizar paginas o capturas relevantes en repositorios de documentos escaneados o renderizados, aprovechando el codificador visual y la puntuacion de 78,26 en el grupo de documentos visuales de MMEB-v3.
- Busqueda de video y audio: localizar clips por contenido visual o acustico, con alineacion temporal preservada por TMRoPE.
- Sistemas de recomendacion: representar items de distinta naturaleza (imagenes de producto, descripciones textuales, videos) en un mismo espacio para calcular similitud usuario-item.
- Recuperacion agentica: dotar a agentes de memoria y acceso a herramientas e interfaces mediante embeddings, con la ventaja de un unico codificador para todas las modalidades.
- Moderacion o deduplicacion de contenido multimodal: comparar items entre modalidades para detectar duplicados o contenido similar.

## Benchmarks y rendimiento

Resultados en MMEB-v3 (190 datasets) segun la model card:

| Grupo | Ovis-Omni-Embedding-3B | Mejor baseline comparado | Margen |
|---|---:|---:|---:|
| Imagen | 77,55 | 73,83 | +3,72 |
| Video | 64,99 | 59,37 | +5,62 |
| Documento visual | 78,26 | 75,37 | +2,89 |
| Texto | 47,15 | 43,62 | +3,53 |
| Audio | 50,08 | 43,17 | +6,91 |
| Agente | 45,52 | 39,42 | +6,10 |
| Todos los 190 datasets | 58,46 | 53,27 | +5,19 |

La model card indica que el modelo lidera el agregado de cada grupo de modalidad y que supera al mejor baseline por 5,19 puntos en la media global. No se proporcionan resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio de pesos ocupa 11,2 GB, lo que sugiere que en precision completa (fp16/bf16) se necesita del orden de 6-8 GB para los 3B parametros, mas memoria para codificadores visual y de audio y para el procesamiento de entradas multimodales.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar GPUs de 16 GB o superiores, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (MMEB-v3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ovis-Omni-Embedding-3B | 3B | no disponible | 58,46 | Apache 2.0 | Hugging Face |
| Baseline mas fuerte comparado (sin identificar en la model card) | no disponible | no disponible | 53,27 | no disponible | no disponible |
| Ovis-Embedding-VL-2B | 2B | no disponible | no disponible | no disponible | mencionado en la figura de arquitectura |
| Ovis-Embedding-VL-9B | 9B | no disponible | no disponible | no disponible | mencionado en la figura de arquitectura |

La model card no identifica por nombre los modelos comparados en MMEB-v3; solo reporta el mejor baseline agregado. Los modelos Ovis-Embedding-VL-2B y 9B aparecen en las figuras del informe tecnico como parte de la misma familia, pero sin datos de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Es un bi-encoder de retrieval: no genera respuestas ni realiza atencion cruzada entre consulta y candidato, por lo que no sirve para tareas generativas.
- Riesgo de alucinacion no aplica directamente al no generar texto, pero la calidad del ranking depende de la calidad de los embeddings y del corpus indexado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingue.
- Longitud de contexto: no disponible, lo que limita la planificacion de documentos o videos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los componentes heredados de Qwen2.5-Omni-3B.
- El rendimiento en el grupo de texto (47,15) es notablemente inferior al de imagen y documento visual, lo que puede limitar casos de uso centrados exclusivamente en texto.
- No se documentan requisitos de hardware ni latencias, lo que dificulta la planificacion de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ATH-MaaS/Ovis-Omni-Embedding-3B
- Repositorio GitHub: https://github.com/ATH-MaaS/Ovis-Omni-Embedding
- Informe tecnico (arXiv): https://arxiv.org/pdf/2609.25165
