# prithivMLmods/Fx-Work-1028-MXFP4-MoE-GGUF

## Resumen

Fx-Work-1028-MXFP4-MoE-GGUF es una cuantización en formato GGUF, realizada por prithivMLmods con llama.cpp, del modelo base endless-frontier/Fx-Work-1028. Este modelo base es un modelo multimodal de tipo mezcla de expertos (MoE) construido sobre Qwen3.6-35B-A3B, con aproximadamente 3.000 millones de parámetros activos de un total de 35.500 millones, orientado a flujos de trabajo profesionales: documentos, hojas de cálculo, datos de negocio y uso de herramientas sobre múltiples ficheros.

La relevancia de esta ficha reside en que el repositorio incluye una cuantización MXFP4 optimizada para MoE (20,3 GB), pensada para GPUs NVIDIA Blackwell (SM120, GB202, B200, B300, RTX PRO 6000), junto con cuantizaciones clásicas (Q3_K_L, Q5_K_M, Q6_K) y pesos BF16 completos. El modelo conserva una ventana de contexto de 262K tokens y soporta entrada de imagen y texto (image-text-to-text), con el proyector multimodal disponible como fichero mmproj-bf16 independiente.

Según la model card, Fx-Work-1028 mejora sobre la versión original en cinco métricas de benchmark y lidera entre los modelos de 35B o menos en cuatro de ellas, con resultados comparables a GLM-5.2. Se distribuye bajo licencia Apache-2.0, sujeta a los términos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal basado en Qwen3.6-35B-A3B (image-text-to-text) |
| Parametros totales | 35.505.251.456 (≈35,5B) |
| Parametros activos | ≈3B (A3B) |
| Longitud de contexto | 262.144 tokens (262K); probado con 16.384 tokens en llama.cpp |
| Tipos de cuantizacion | BF16 (71,1 GB), MXFP4_MOE (20,3 GB), Q3_K_L (18,6 GB), Q5_K_M (25,3 GB), Q6_K (29,2 GB), mmproj-bf16 (903 MB) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache-2.0 (sujeta a los términos del modelo base) |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, Fx-Work-1028, es un modelo de mezcla de expertos (MoE) multimodal construido sobre Qwen3.6-35B-A3B. Con arquitectura MoE, de los 35,5 mil millones de parámetros totales solo unos 3 mil millones se activan por token, lo que permite obtener calidad cercana a modelos densos de gran tamaño con coste de inferencia comparable a un modelo denso de 3B. El pipeline declarado es image-text-to-text, con un proyector multimodal (mmproj) en BF16 que habilita la comprensión de imágenes junto al texto.

No se ha publicado información en la model card sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. La model card sí documenta soporte de decodificación especulativa MTP (multi-token prediction) con `draft_n_max=2` en llama.cpp, y compatibilidad con los motores SGLang, vLLM y Transformers en el modelo base. La ejecución de herramientas (tool use) se delega en el harness de agente que rodea al modelo.

## Capacidades

- Generación de texto conversacional orientada a entornos de trabajo profesionales (documentos, hojas de cálculo, datos de negocio).
- Comprensión multimodal de imagen y texto (image-text-to-text) mediante el fichero mmproj-bf16.
- Uso de herramientas (tool calling): el modelo está etiquetado para tool-use y agentic-work, aunque la ejecución de herramientas la realiza el harness externo.
- Tareas de agente a largo horizonte (long-horizon) y multi-paso, según los benchmarks de agentes en los que se ha evaluado.
- Ventana de contexto de 262K tokens para trabajar con documentos extensos y múltiples ficheros.
- Razonamiento y resolución de problemas, según los tests de referencia incluidos (algoritmos en C, problemas de física y matemáticas).
- Optimización específica para hardware Blackwell mediante cuantización MXFP4 y decodificación especulativa MTP.

## Casos de uso

- Procesamiento y análisis de documentos extensos: con 262K tokens de contexto, puede ingerir contratos, informes o documentación técnica completa y responder preguntas o extraer datos estructurados sin fragmentación.
- Automatización de hojas de cálculo y datos de negocio: el modelo está especializado en flujos de trabajo con hojas de cálculo, generando fórmulas, transformaciones y resúmenes a partir de datos tabulares.
- Agentes de productividad multi-fichero: su etiquetado para agentic-work y multi-file tool use lo hace adecuado para harness de agentes que editan, comparan y consolidan varios archivos en una tarea.
- Atención al cliente y asistentes internos: la arquitectura MoE con 3B de parámetros activos ofrece latencias bajas y throughput alto (297 tokens/s medidos en MXFP4), adecuado para conversaciones multi-turno con carga de contexto elevada.
- Comprensión de documentos visuales: gracias al proyector multimodal, puede procesar capturas, gráficos o documentos escaneados junto con instrucciones en texto.
- Generación de código en pipelines de trabajo: los tests de referencia incluyen implementación de algoritmos en C; puede integrarse en harness de agente para tareas de código con herramientas externas.
- Despliegue en estaciones de trabajo con GPU Blackwell: la cuantización MXFP4 (20,3 GB) permite ejecutar el modelo completo en una RTX PRO 6000 de 96 GB con margen amplio para contexto y KV cache.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo base Fx-Work-1028 (comparación declarada con GLM-5.2 y Occamy-1.0, sin valores de estos últimos):

| Benchmark | Resultado |
|---|---|
| JobBench Main | 34,34 |
| AutomationBench | 43,33 |
| Claw-Eval pass³ | 70,1 |
| GDPvalAA-v2.1 (Elo) | 1328 |
| APEX-Agents-AA | 28,2 |

Rendimiento de inferencia medido (cuantización MXFP4_MOE, RTX PRO 6000 Blackwell, 96 GB, llama.cpp con offload completo y MTP):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 216,25 tokens/s |
| Velocidad media de generación | 297,38 tokens/s |
| Tiempo total de ejecución | 56,4 s |
| Pico de VRAM de GPU | 19,87 GiB |
| Utilización pico de GPU | 81 % |
| Capas offloaded | 99 (`-ngl 99`) |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: MXFP4_MOE requiere unos 20 GB (pico medido de 19,87 GiB con contexto de 16K); Q3_K_L unos 19 GB; Q5_K_M unos 26 GB; Q6_K unos 30 GB; BF16 unos 72 GB. Añadir margen para KV cache según el contexto.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB) es la configuración probada; la cuantización MXFP4 está orientada a arquitecturas Blackwell (SM120, GB202, B200, B300). Para cuantizaciones Q4-Q6, GPUs de 24 GB como la RTX 4090 pueden quedar justas con offload parcial a CPU.
- Consumer GPUs: la cuantización MXFP4_MOE (20,3 GB) cabe en una GPU de 24 GB (RTX 3090/4090) con contexto moderado, aunque el rendimiento MXFP4 optimizado requiere Blackwell. Q3_K_L también cabe en 24 GB. BF16 requiere GPUs de 80 GB o más (A100/H100).
- Despliegue: llama.cpp / llama-cli (probado, con decodificación especulativa MTP), y el modelo base declara soporte de SGLang, vLLM y Transformers. No se menciona Ollama ni TGI explícitamente.
- Rendimiento medido: 297,38 tokens/s de generación y 216,25 tokens/s de procesamiento de prompt en la configuración de prueba descrita.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Fx-Work-1028 (base de esta ficha) | ≈35,5B | ≈3B | 262K | Sí (image-text-to-text) | Apache-2.0 |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Occamy-1.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

Según la model card, Fx-Work-1028 rinde de forma comparable a GLM-5.2 en los cinco benchmarks publicados y lidera entre modelos de 35B o menos en cuatro de las cinco métricas, con Occamy-1.0 ligeramente por delante en Claw-Eval. No se han publicado los valores concretos de estos modelos comparados en la información disponible.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente el inglés como idioma soportado; no hay garantías documentadas de rendimiento en castellano.
- Sesgos: no se ha publicado información sobre sesgos conocidos en la model card; al derivar de Qwen3.6, heredará en principio los sesgos de sus datos de entrenamiento, que no están documentados aquí.
- Alucinaciones: como todo modelo de lenguaje, puede generar contenido incorrecto; los benchmarks de agentes (JobBench, AutomationBench) indican tasas de éxito parciales (34,34 y 43,33), lo que sugiere que no todas las tareas se completan correctamente.
- Ejecución de herramientas: el modelo no ejecuta herramientas por sí mismo; requiere un harness de agente externo que gestione la ejecución real.
- Cuantización MXFP4: el rendimiento optimizado de MXFP4 depende de hardware Blackwell (SM120); en GPUs anteriores puede no estar soportado o degradar el rendimiento, siendo preferible usar las cuantizaciones Q5_K_M o Q6_K.
- Licencia: Apache-2.0 pero sujeta a los términos del modelo base (endless-frontier/Fx-Work-1028); conviene revisar dichos términos antes de uso comercial.
- Contexto: aunque la ventana nativa es de 262K tokens, las pruebas de rendimiento publicadas se realizaron con 16.384 tokens; el consumo de VRAM con contextos largos será significativamente mayor.
- Repositorio de bajo uso público: 0 descargas y 1 like en el momento de la ficha, por lo que hay poca evidencia comunitaria de su comportamiento en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/prithivMLmods/Fx-Work-1028-MXFP4-MoE-GGUF
- Modelo base: https://huggingface.co/endless-frontier/Fx-Work-1028
- Fichero MXFP4_MOE: https://huggingface.co/prithivMLmods/Fx-Work-1028-MXFP4-MoE-GGUF/blob/main/Fx-Work-1028.MXFP4_MOE.gguf
- Fichero BF16: https://huggingface.co/prithivMLmods/Fx-Work-1028-MXFP4-MoE-GGUF/blob/main/Fx-Work-1028.BF16.gguf
- Fichero Q5_K_M: https://huggingface.co/prithivMLmods/Fx-Work-1028-MXFP4-MoE-GGUF/blob/main/Fx-Work-1028.Q5_K_M.gguf
- Fichero Q6_K: https://huggingface.co/prithivMLmods/Fx-Work-1028-MXFP4-MoE-GGUF/blob/main/Fx-Work-1028.Q6_K.gguf
- Fichero Q3_K_L: https://huggingface.co/prithivMLmods/Fx-Work-1028-MXFP4-MoE-GGUF/blob/main/Fx-Work-1028.Q3_K_L.gguf
- Proyector multimodal (mmproj-bf16): https://huggingface.co/prithivMLmods/Fx-Work-1028-MXFP4-MoE-GGUF/blob/main/Fx-Work-1028.mmproj-bf16.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Autor: https://huggingface.co/prithivMLmods
