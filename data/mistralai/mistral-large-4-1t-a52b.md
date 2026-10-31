# mistralai/Mistral-Large-4-1T-A52B

## Resumen

Mistral Large 4 (apodado "Le Chonk") es el modelo más grande y capaz desarrollado hasta la fecha por Mistral AI. Se trata de un modelo multimodal nativo de tipo Mixture-of-Experts con aproximadamente 1 billón (1T) de parámetros totales y 49 mil millones de parámetros activos por token (52B incluyendo embeddings y capas de salida), entrenado desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en los centros de datos propios de Mistral en Europa.

El modelo unifica seguimiento de instrucciones, razonamiento, generación de código y flujos de trabajo agénticos en un único conjunto de pesos, con un contexto de 1M de tokens y entrada de texto e imagen (codificador visual estilo Pixtral). Destaca especialmente en cargas de trabajo de ciberseguridad, finanzas y derecho, y supera a modelos cerrados de frontera en visual grounding. Es nativamente fluido en más de 160 idiomas, incluidas todas las lenguas oficiales de la Unión Europea.

Su relevancia actual radica en que es el modelo abierto de frontera más potente de origen occidental según el Artificial Analysis Intelligence Index v5, con un rendimiento de código agéntico comparable al modelo abierto líder (GLM-5.3) pero consumiendo un 47% menos de tokens por tarea, lo que lo hace económicamente atractivo para despliegues a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) granular multimodal nativo, con codificador visual estilo Pixtral |
| Parametros totales | ~1 billón (1T) |
| Parametros activos | 49B por token (52B incluyendo embeddings y capas de salida); 128 expertos enrutados (4 activos por token) y 1 experto compartido |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | FP8 (checkpoint original), NVFP4 (checkpoint cuantizado para GPU Blackwell) |
| Idiomas soportados | Más de 160 idiomas de forma nativa; la model card lista 40 etiquetas de idioma (en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl) |
| Licencia | Mistral Ecosystem Open-Weight License (MIT modificada; uso comercial y no comercial permitido, con restricciones para Model-as-a-Service) |
| Formato de pesos | Safetensors (transformers), compatible con vLLM, SGLang y llama.cpp; variante NVFP4 disponible |

## Arquitectura y entrenamiento

Mistral Large 4 emplea una arquitectura Mixture-of-Experts granular con 128 expertos enrutados de los cuales 4 se activan por token, más 1 experto compartido. Esto permite un tamaño total de ~1T de parámetros con un coste de inferencia equivalente a un modelo denso de ~52B de parámetros, ya que solo se activa una fracción mínima de la red en cada paso. El modelo es multimodal nativo: incorpora un codificador visual estilo Pixtral entrenado para manejar imágenes de tamaño y relación de aspecto variables, aceptando entrada de texto e imagen con salida de texto.

El entrenamiento se realizó desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en los centros de datos propios de Mistral en Europa, un detalle relevante desde la perspectiva de la IA soberana europea. No se ha publicado el número de tokens de entrenamiento ni la composición del dataset en la información disponible. El checkpoint incorpora de serie una cabeza de borrador para decodificación especulativa denominada DSpark, que acelera la inferencia sin requerir un modelo draft externo. No hay información sobre si se aplicaron RLHF o DPO en el post-entrenamiento.

## Capacidades

- Generación de texto y seguimiento de instrucciones con fuerte adherencia a system prompts.
- Modo de razonamiento con tres niveles de esfuerzo configurables por petición: `low`, `medium` y `high` (por defecto `high`), lo que permite usar el mismo modelo tanto para respuestas rápidas de chat como para ejecuciones agénticas complejas.
- Generación de código con rendimiento de frontera en tareas de código agéntico (48% en el Artificial Analysis Coding Agent Index).
- Vision: análisis de imágenes, gráficos, planos técnicos y documentos, con el mejor visual grounding entre modelos de pesos abiertos según Mistral.
- Capacidades agénticas nativas: function calling, salida JSON y aplicación estricta de JSON schema.
- Multilingüismo nativo en más de 160 idiomas, incluidas todas las lenguas oficiales de la UE y el castellano.
- Especialización destacada en ciberseguridad (estado del arte entre modelos de pesos abiertos, rechazando peticiones maliciosas), finanzas y derecho.
- Ventana de contexto de 1M de tokens para cargas de trabajo de contexto largo.
- Decodificación especulativa integrada (DSpark) para inferencia más rápida.

## Casos de uso

- Atencion al cliente automatizada: con 1M de tokens de contexto y soporte de system prompts, puede gestionar conversaciones multi-turno largas con historial completo de interacción y documentación de producto adjunta, en decenas de idiomas de forma nativa.
- Agentes de codigo en produccion: su function calling nativo, la salida JSON estricta y el buen rendimiento en el Coding Agent Index con un 47% menos de tokens por tarea lo hacen adecuado para pipelines de CI/CD, revision automática de pull requests y agentes de desarrollo tipo Mistral Vibe.
- Analisis documental y de documentos visuales: el codificador visual maneja imágenes de tamaño variable, por lo que puede procesar facturas, gráficos, planos técnicos y documentos escaneados combinando OCR implícito y razonamiento.
- Ciberseguridad defensiva: estado del arte entre modelos abiertos en tareas de seguridad, útil para análisis de vulnerabilidades, triaje de alertas y redacción de informes, rechazando peticiones maliciosas.
- Asistencia juridica y financiera: rendimiento especialmente bueno en derecho y finanzas según Mistral, aplicable a revisión de contratos, análisis de documentación regulatoria y resumen de informes financieros extensos aprovechando el contexto de 1M.
- Aplicaciones multilingues europeas: fluidez nativa en todas las lenguas oficiales de la UE, adecuado para productos con requisitos de soberanía y cobertura lingüística europea completa.
- RAG sobre corpus masivos: la ventana de 1M de tokens permite introducir bases de código completas o grandes volúmenes documentales sin chunking agresivo.
- Despliegue eficiente en datacenter: la variante NVFP4 para GPU Blackwell reduce la huella de memoria y acelera la inferencia manteniendo el mismo rendimiento.

## Benchmarks y rendimiento

| Benchmark | Mistral Large 4 | Comparativa |
|---|---|---|
| Artificial Analysis Coding Agent Index | 48% | Empatado efectivamente con GLM-5.3 (modelo abierto líder), usando un 47% menos de tokens por tarea |
| Artificial Analysis Intelligence Index v5 | 26 | El más alto entre modelos abiertos occidentales; los modelos abiertos líderes de China puntúan más alto en este índice agregado |

No se han publicado resultados de benchmarks clásicos (MMLU, HumanEval, GSM8K) en la información disponible; Mistral remite a su blog para más benchmarks, especialmente de ciberseguridad, finanzas y derecho.

## Requisitos de hardware

- El repositorio completo pesa 1.060,6 GB en FP8, por lo que la inferencia del checkpoint original requiere múltiples GPU de gama alta (del orden de 8x H100/H200 80 GB o superior en FP8; estimación no confirmada oficialmente).
- La variante cuantizada NVFP4 reduce significativamente la huella de memoria y está pensada para GPU NVIDIA Blackwell (B200), con soporte de vLLM y SGLang.
- No cabe en GPU de consumo (RTX 4090, RTX 5090) en ninguna variante publicada.
- Despliegue soportado oficialmente en vLLM, SGLang y llama.cpp; también disponible vía Mistral API como `mistral-large-4` y en HuggingFace Inference Endpoints.
- No se han publicado cifras de latencia ni throughput; la decodificación especulativa DSpark integrada y la variante NVFP4 están orientadas a mejorar ambos.

## Comparativa con modelos similares

| Caracteristica | Mistral Large 4 (1T-A52B) | GLM-5.3 | DeepSeek (líder abierto de China) |
|---|---|---|---|
| Parametros totales | ~1T (MoE) | no disponible | no disponible |
| Parametros activos | 52B | no disponible | no disponible |
| Contexto | 1M tokens | no disponible | no disponible |
| Multimodal | Sí (texto + imagen) | no disponible | no disponible |
| Coding Agent Index | 48% | ~48% (empate técnico) | no disponible |
| Intelligence Index v5 | 26 (líder abierto occidental) | no disponible | Superior en el índice agregado |
| Licencia | Mistral Ecosystem Open-Weight License (MIT modificada) | no disponible | no disponible |

Los datos de GLM-5.3 y de los modelos chinos líderes no están disponibles en la información proporcionada más allá de las comparaciones de índices publicadas por Mistral.

## Limitaciones y advertencias

- Requisitos de hardware muy elevados: con ~1T de parámetros y 1 TB de pesos en FP8, el autoalojamiento exige infraestructura de datacenter multi-GPU, fuera del alcance de la mayoría de equipos sin la variante NVFP4 y GPU Blackwell.
- Restricción de licencia para MaaS: la Mistral Ecosystem Open-Weight License permite uso comercial y no comercial, pero operar un negocio de Model-as-a-Service requiere una licencia comercial aparte con Mistral.
- En el Artificial Analysis Intelligence Index v5 los modelos abiertos líderes de China puntúan por encima, por lo que no es el modelo abierto con mejor puntuación agregada global, aunque destaca en código y ciberseguridad.
- El modo de razonamiento por defecto es `high`, lo que puede generar latencias y costes de tokens elevados en usos triviales; conviene ajustar `reasoning_effort` según el caso.
- Riesgo de alucinación inherente a todo LLM; no se han publicado evaluaciones específicas de alucinación en la información disponible.
- En ciberseguridad, el modelo rechaza peticiones maliciosas, pero sigue siendo necesario supervisión humana en flujos de seguridad sensibles.
- La variante NVFP4 solo es compatible con GPU Blackwell, lo que limita su adopción inmediata a infraestructuras muy recientes.

## Enlaces

- HuggingFace: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Checkpoint cuantizado NVFP4: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Blog de anuncio: https://mistral.ai/news/mistral-large-4-oss/
- Documentación de la Mistral API: https://docs.mistral.ai/models/mistral-large-4-0
- Galería de demos (Le Chonk Gallery): https://mistralai-ml4-le-chonk-gallery.hf.space/
- Mistral Vibe (agente de código): https://github.com/mistralai/mistral-vibe
- Licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE
- Web de Mistral AI: https://mistral.ai/
- Chat de Mistral: https://chat.mistral.ai/
