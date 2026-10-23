# MiniMaxAI/MiniMax-M3.1-Flash

## Resumen

MiniMax-M3.1-Flash es un modelo de lenguaje multimodal nativo con arquitectura de mezcla de expertos (MoE) desarrollado por MiniMax (MiniMax Group Inc., China). Acepta entradas de texto, imagen y vídeo, y genera texto. Se presenta como una actualización de MiniMax-M3 (junio de 2026) orientada a cargas de trabajo agénticas: uso de ordenador, generación de código, flujos multi-paso y ciberseguridad. Su ventana de contexto alcanza 1.000.000 de tokens.

La model card declara aproximadamente 428.000 millones de parámetros totales con unos 23.000 millones activos por token, aunque el índice safetensors del repositorio indica 220.490.854.016 parámetros (≈220.500 millones), una discrepancia que la documentación disponible no explica. El checkpoint publicado ocupa 252,4 GB y va etiquetado como 8 bits (mxfp8), lo que sugiere que los pesos distribuidos están cuantizados y entrenados con cuantización consciente (QAT).

Su relevancia actual es doble: por un lado, compite frontalmente con otros modelos de "flash" de pesos abiertos en tareas agénticas (62,8 en Automation-Bench v1.0.6 frente a 60,5 de DeepSeek V4.1 Flash-1017); por otro, introduce dos mecanismos de eficiencia propios, la atención dispersa MSA en todas las capas y la decodificación especulativa DSpark, que MiniMax presenta como palanca para abaratar el coste de ejecución de agentes (la prensa recoge una reducción declarada del 70 % en costes).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal nativo con atención dispersa (MiniMax Sparse Attention, MSA) en todas las capas |
| Parámetros totales | ≈428.000 millones según la model card; el índice safetensors declara 220.490.854.016 (≈220.500 millones). Discrepancia no explicada en la información disponible |
| Parámetros activos | ≈23.000 millones por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | Pesos publicados en 8 bits (etiqueta `mxfp8`), entrenamiento consciente de cuantización (QAT). No se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (la model card no publica listado de idiomas) |
| Licencia | `minimax-community` (license: other); el texto completo está en el archivo LICENSE del repositorio |
| Formato de pesos | safetensors (repositorio de 252,4 GB), con `custom_code` y clase de modelo `minimax_m3_vl` en transformers |

## Arquitectura y entrenamiento

Se trata de un transformer de mezcla de expertos con enrutamiento disperso: de los ≈428.000 millones de parámetros totales declarados, solo ≈23.000 millones se activan por token, lo que sitúa el coste de cómputo por token en el rango de un modelo denso de 20-25B. La entrada es multimodal nativa (texto, imagen y vídeo) y la salida es exclusivamente texto, según la tabla "Model at a Glance". La innovación arquitectónica central es la MiniMax Sparse Attention (MSA), descrita en el paper arXiv:2606.13392 y aplicada en todas las capas del modelo, no solo en un subconjunto; esto es lo que permite sostener una ventana de 1M de tokens con un coste de atención subcuadrático. El repositorio incluye además una "draft head" DSpark para decodificación especulativa, es decir, un cabezal borrador entrenado que propone tokens verificados por el modelo principal.

En el plano del entrenamiento, la model card solo confirma el uso de entrenamiento consciente de cuantización (QAT) para producir los pesos en 8 bits (mxfp8) y la existencia de una actualización respecto a MiniMax-M3 centrada en "rendimiento en tareas y eficiencia de inferencia". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento preferencial; tampoco se detalla la composición del corpus multimodal. Toda esa información debe considerarse no disponible a partir de las fuentes consultadas.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte declarado para flujos agénticos largos (hasta 1M de tokens de contexto).
- Comprensión de imagen: entrada image-text-to-text como pipeline principal del repositorio.
- Comprensión de vídeo: la model card lista vídeo entre las entradas admitidas junto con texto e imagen.
- Generación y modificación de código, con resultados declarados de 73,7 % en DeepSWE v1.1.
- Uso de ordenador (computer use) e interacción con interfaces gráficas: 61,7 en OSWorld V2.
- Ciberseguridad: 82,2 en CyberGym, orientado a tareas de análisis y explotación en entornos controlados.
- Uso de herramientas y llamadas a funciones en entornos agénticos: 76,2 en BankerToolBench y 62,8 en Automation-Bench v1.0.6.
- Decodificación especulativa integrada (DSpark) para reducir latencia de generación.
- Capacidades multilingües: no disponibles (no se publica listado de idiomas ni evaluaciones por idioma).

## Casos de uso

- Agentes de uso de ordenador: automatización de tareas sobre interfaces gráficas (rellenar formularios, operar paneles internos, ejecutar flujos de back-office) aprovechando el 61,7 en OSWorld V2 y la ventana de 1M tokens para mantener el histórico completo de la sesión sin resumir.
- Automatización de procesos con herramientas: orquestación de pipelines donde el modelo encadena decenas de llamadas a APIs y decide el siguiente paso; el resultado de 62,8 en Automation-Bench v1.0.6 lo sitúa por delante de DeepSeek V4.1 Flash-1017 en esta categoría.
- Agente de ingeniería de software: resolución de issues sobre repositorios reales, con contexto suficiente para cargar árboles de proyecto, diffs y trazas de test; el 73,7 % en DeepSWE v1.1 respalda este escenario.
- Revisión de seguridad de código y análisis de vulnerabilidades en entornos de laboratorio: el 82,2 en CyberGym indica capacidad para tareas de razonamiento ofensivo/defensivo, adecuado para equipos de AppSec que necesiten triaje asistido.
- Análisis de vídeo de larga duración: al admitir vídeo como entrada y 1M de tokens de contexto, permite resumir y consultar grabaciones extensas (reuniones, auditorías, material de formación) en una sola pasada sin trocear.
- Procesamiento de documentación técnica mixta: ingestión de manuales con diagramas, capturas y tablas, donde el modelo combina la lectura de imagen con el texto para extraer procedimientos o responder consultas de soporte.
- RAG sobre corpus extensos: con 1M de tokens se pueden insertar Bases de conocimiento completas o expedientes enteros en el prompt, reduciendo la dependencia de un recuperador y los errores de fragmentación.
- Asistente de atención al cliente multi-turno: conversaciones largas con historial completo y adjuntos de imagen (captura de error, foto de producto) sin perder contexto entre turnos.

## Benchmarks y rendimiento

Resultados declarados por el autor para MiniMax-M3.1-Flash:

| Benchmark | MiniMax-M3.1-Flash |
|---|---|
| Automation-Bench v1.0.6 | 62,8 |
| BankerToolBench | 76,2 |
| DeepSWE v1.1 | 73,7 % |
| OSWorld V2 | 61,7 |
| Agents' Last Exam | 29,6 |
| CyberGym | 82,2 |

Comparativa publicada en la model card para Automation-Bench v1.0.6 (único benchmark con datos de terceros en la información disponible):

| Modelo | Automation-Bench v1.0.6 |
|---|---|
| MiniMax-M3.1-Flash | 62,8 |
| DeepSeek V4.1 Flash-1017 | 60,5 |
| DeepSeek V4.1 Flash | 54,8 |
| Opus 5 | 50,3 |
| GLM-5.3 | 48,8 |
| Kimi K3 | 46,7 |
| GPT-5.6 Sol | 45,8 |

Datos de terceros: Artificial Analysis otorga a MiniMax-M3.1-Flash una puntuación de 43 en su Intelligence Index y sitúa la mediana de modelos comparables en 13. Los resultados del resto de benchmarks para los modelos de la comparativa no están disponibles en la información proporcionada. No se han publicado en las fuentes consultadas resultados de MMLU, HumanEval, GSM8K ni de evaluaciones por idioma.

## Requisitos de hardware

- VRAM para pesos: el repositorio ocupa 252,4 GB en safetensors con pesos de 8 bits (mxfp8), por lo que la inferencia en 8 bits requiere del orden de 220-260 GB de VRAM solo para los pesos. Estimación propia a partir del tamaño del checkpoint y del recuento de parámetros.
- VRAM para contexto: a 1M de tokens el caché KV es el factor dominante; MSA reduce el coste frente a atención densa, pero no se publican cifras de memoria por token. No disponible.
- GPU recomendadas: para 8 bits, un nodo de 8×H100 80 GB (640 GB) o 8×H200; un mínimo de 4×H100 80 GB resulta muy ajustado y solo viable con contexto corto. Para un hipotético despliegue en 4 bits (≈110-130 GB de pesos, estimación) bastarían 2×H100 80 GB o 4×A100 80 GB.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Una RTX 4090 (24 GB) queda muy lejos incluso en cuantizaciones agresivas; se requeriría un clúster multi-GPU o CPU con enorme cantidad de RAM y latencia inaceptable.
- Opciones de despliegue: la librería declarada es transformers con `custom_code` (`minimax_m3_vl`), lo que implica cargar código remoto del repositorio. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. Soporte explícito en vLLM, SGLang, TGI, llama.cpp u Ollama no está confirmado en la información disponible; llama.cpp es en la práctica inviable por tamaño.
- Latencia y throughput: no se publican cifras. El autor atribuye mejoras de eficiencia a MSA, QAT y la decodificación especulativa DSpark, y la cobertura de prensa recoge una reducción declarada del 70 % en costes de ejecución de agentes frente a la generación anterior; son cifras del fabricante, no verificadas de forma independiente.

## Comparativa con modelos similares

| Modelo | Params totales / activos | Contexto | Automation-Bench v1.0.6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash | ≈428B / 23B (card); 220,5B en safetensors | 1.000.000 | 62,8 | minimax-community | Pesos en HuggingFace, API propia, OpenRouter (nivel gratuito) |
| DeepSeek V4.1 Flash-1017 | No disponible | No disponible | 60,5 | No disponible | No disponible |
| DeepSeek V4.1 Flash | No disponible | No disponible | 54,8 | No disponible | No disponible |
| Kimi K3 | No disponible | No disponible | 46,7 | No disponible | No disponible |
| GLM-5.3 | No disponible | No disponible | 48,8 | No disponible | No disponible |
| GPT-5.6 Sol | No disponible | No disponible | 45,8 | Propietaria | No disponible (solo API) |
| Opus 5 | No disponible | No disponible | 50,3 | Propietaria | No disponible (solo API) |

La información disponible solo permite comparar la puntuación en Automation-Bench v1.0.6. Para el resto de benchmarks (BankerToolBench, DeepSWE v1.1, OSWorld V2, Agents' Last Exam, CyberGym) no hay datos de los modelos competidores en las fuentes consultadas, por lo que no es posible establecer una comparación completa. Tampoco se dispone de los recuentos de parámetros, ventanas de contexto ni licencias de DeepSeek V4.1 Flash, Kimi K3 y GLM-5.3.

## Limitaciones y advertencias

- Discrepancia de parámetros: la model card declara ≈428B totales y el índice safetensors 220,5B. Cualquier planificación de hardware debe verificarse empíricamente contra el checkpoint real antes de comprometer infraestructura.
- Riesgo de alucinación: no se publican evaluaciones de factualidad ni tasas de alucinación. En tareas de ciberseguridad o de uso de ordenador, una alucinación puede traducirse en acciones destructivas; se recomienda sandboxing y confirmación humana en pasos irreversibles.
- Rendimiento limitado en horizontes muy largos: 29,6 en Agents' Last Exam es una puntuación baja en términos absolutos, lo que sugiere que las tareas agénticas de muy largo recorrido siguen siendo un punto débil pese al buen resultado en Automation-Bench.
- Idiomas: no se publica listado de idiomas soportados ni evaluaciones multilingües. El comportamiento en castellano no está documentado y debe validarse antes de usarlo en producción.
- Contexto de 1M tokens: no se documenta la degradación del rendimiento ("lost in the middle") ni el coste real de memoria del caché KV a esa longitud. Un contexto grande no garantiza recuperación fiable de información en posiciones intermedias.
- Licencia: `minimax-community` con `license: other`. No se detallan en la información disponible las condiciones de uso comercial, los umbrales de facturación ni las restricciones de redistribución; es imprescindible leer el archivo LICENSE antes de un despliegue comercial.
- Código remoto: el repositorio requiere `trust_remote_code` en transformers, lo que implica ejecutar código del autor; conviene auditar la versión fijada por commit.
- Ciberseguridad: las capacidades ofensivas (82,2 en CyberGym) pueden facilitar usos maliciosos. Deben aplicarse controles de acceso, registro de actividad y políticas de uso aceptable.
- Salida solo texto: aunque acepta imagen y vídeo, no genera imagen ni vídeo, lo que descarta casos de uso de generación visual.
- Naturaleza de los datos: las cifras de benchmarks y la reducción de costes del 70 % proceden del fabricante o de cobertura de prensa, no de evaluaciones independientes reproducidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Paper (arXiv:2606.13392): https://arxiv.org/abs/2606.13392
- Organización MiniMax en HuggingFace: https://huggingface.co/MiniMaxAI
- Organización en ModelScope: https://modelscope.cn/organization/minimax
- GitHub: https://github.com/MiniMax-AI
- Web oficial: https://www.minimax.io
- Documentación de la API: https://platform.minimax.io/docs/guides/text-generation
- MiniMax Agent: https://agent.minimax.io/
- OpenRouter (nivel gratuito): https://openrouter.ai/minimax/minimax-m3.1-flash:free
- Análisis en Artificial Analysis: https://artificialanalysis.ai/models/minimax-m3-1-flash
- Cobertura de SiliconANGLE: https://siliconangle.com/2026/10/19/minimax-launches-m3-1-flash-model-says-it-cuts-ai-agent-costs-by-70/
- Cobertura de Reuters: https://www.reuters.com/world/asia-pacific/chinas-minimax-launches-updated-ai-model-m31-flash-claims-major-improvements-2026-10-19/
- Discord: https://discord.com/invite/DPC4AHFCBw
- Contacto (WeChat): https://platform.minimaxi.com/docs/faq/contact-us
