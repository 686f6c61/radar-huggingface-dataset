# mradermacher/gemma-4-E4B-it-GLM-4.7-Flash-HERETIC-UNCENSORED-Thinking-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF estáticas generadas por mradermacher a partir del modelo `DavidAU/gemma-4-E4B-it-GLM-4.7-Flash-HERETIC-UNCENSORED-Thinking`. Se trata de un fine-tune derivado de la familia Gemma (7.518.069.290 parámetros totales según safetensors), sometido a un proceso de "abliteration" o "heretic" que elimina total o parcialmente las capas de rechazo alineadas del modelo original. El resultado es un modelo conversacional sin censura, orientado a inglés, que conserva el modo de razonamiento (thinking) que sugiere el nombre.

La relevancia de esta ficha radica en dos factores. Por un lado, mradermacher es uno de los cuantizadores más prolíficos del ecosistema GGUF y sus repositorios suelen ser el punto de entrada práctico para desplegar modelos en llama.cpp u Ollama. Por otro, el modelo base combina un fine-tune de la familia Gemma con técnicas de abliteration, lo que lo hace interesante para investigadores que estudian el efecto de eliminar la alineación sobre el rendimiento y los sesgos, pero también problemático para cualquier uso en producción orientado al público.

El repositorio incluye además suplementos multimodales (`mmproj` en Q8_0 y f16), lo que indica que el modelo subyacente conserva capacidad de visión. La licencia declarada es Apache 2.0, aunque conviene contrastarla con las restricciones de la licencia original de Gemma, que no es Apache 2.0 y establece condiciones de uso adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma), con capacidad multimodal (mmproj incluido); detalles exactos de capas y atención no disponibles |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (declarada; ver advertencias sobre la licencia del modelo base Gemma) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 76.9 GB |
| Descargas | 701 |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-04-12 |
| Ultima actualizacion | 2026-11-01 |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Gemma, un transformer decoder-only con atención causal estándar. El nombre del modelo base (`gemma-4-E4B-it-GLM-4.7-Flash-HERETIC-UNCENSORED-Thinking`) sugiere una cadena de derivaciones: un modelo Gemma instruct (`it`), posiblemente destilado o fusionado con señales de otro modelo (`GLM-4.7-Flash`), y posteriormente sometido a un proceso de abliteration (`HERETIC-UNCENSORED`) que elimina direcciones de activación asociadas al rechazo. La etiqueta `Thinking` indica que conserva o refuerza un modo de razonamiento explícito antes de la respuesta final.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el fine-tune de DavidAU. La model card de mradermacher es puramente operativa: describe las cuantizaciones, no el entrenamiento. La presencia de un `mmproj` confirma que el modelo conserva la torre visual del Gemma original, aunque no se detalla qué encoder de visión utiliza ni su resolución de entrada. Las cuantizaciones son estáticas (no imatrix); el propio autor enlaza a un repositorio `-i1-GGUF` separado para las versiones con imatrix, que suelen ofrecer mejor calidad por bit.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento explícito (thinking) previo a la respuesta.
- Capacidad multimodal: los ficheros `mmproj` permiten procesar imágenes junto con texto en llama.cpp y derivados.
- Fine-tune "uncensored": responde a peticiones que el modelo Gemma original rechazaría por políticas de seguridad.
- Conversación multi-turno (pipeline declarado como `conversational` en los tags).
- Compatible con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue tras una API compatible con OpenAI.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente; el modo thinking sugiere cierta capacidad de razonamiento, pero no hay documentación al respecto.
- Capacidades multilingües: limitadas a inglés según la model card.

## Casos de uso

- Investigación sobre alineación y abliteration: el modelo permite estudiar empíricamente cómo cambia la tasa de rechazo, la calidad de respuesta y los sesgos al eliminar las capas de seguridad de un Gemma instruct. Útil para papers de mechanistic interpretability.
- Evaluación de robustez de filtros de contenido: desplegar el modelo como generador adversario para probar clasificadores de toxicidad o sistemas de moderación en pipelines propios.
- Generación de datos sintéticos para entrenamiento: al no rechazar temas sensibles, puede producir corpus de texto sobre temas que los modelos alineados evitan (ficción oscura, escenarios de seguridad ofensiva controlada), siempre con revisión humana posterior.
- Asistente local de escritura creativa sin restricciones temáticas: con cuantización Q4_K_M (5.4 GB) cabe en una GPU de consumo de 8 GB y permite generar narrativa de ficción con temas maduros sin bloqueos.
- Prototipado de aplicaciones multimodales en local: el `mmproj` permite describir imágenes o responder preguntas visuales en llama.cpp sin depender de APIs externas, útil para demos de bajo coste.
- Análisis de documentos e imágenes en entornos air-gapped: al ser GGUF y ejecutable en CPU o GPU modesta, puede desplegarse en máquinas sin conexión para tareas de extracción de información de capturas o PDFs escaneados.
- Red teaming de productos propios: usar el modelo como atacante simulado para generar prompts maliciosos y validar las defensas de un chatbot corporativo antes de su lanzamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, y el repositorio del modelo base no aporta cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~4.5 GB; Q4_K_M ~5.4 GB; Q5_K_M ~5.9 GB; Q6_K ~6.3 GB; Q8_0 ~8.1 GB; f16 ~15.2 GB.
- Para el modo multimodal hay que sumar el `mmproj`: 0.7 GB (Q8_0) o 1.1 GB (f16).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 solo si se busca throughput elevado con lotes grandes o f16.
- Cabe en GPU de consumo: sí. Q4_K_M entra en una RTX 3060 de 12 GB o incluso en una RTX 4060 de 8 GB con contexto moderado; Q8_0 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. Para servidores con API, llama.cpp server o vLLM (este último solo con el modelo en safetensors, no con GGUF).
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo de ~7.5B en Q4_K_M sobre una RTX 4090 suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma-4-E4B abliterated, GGUF) | 7.5B | no disponible | apache-2.0 declarada | GGUF | Sin censura, multimodal, solo inglés |
| Gemma 2 9B IT (Google) | 9B | 8K | Gemma Terms of Use | safetensors, GGUF | Alineado, multilingüe, licencia restrictiva |
| Llama 3.1 8B Instruct (Meta) | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Alineado, multilingüe, contexto largo |
| Mistral 7B Instruct v0.3 | 7.2B | 32K | Apache 2.0 | safetensors, GGUF | Alineado, licencia permisiva, sin visión |

La comparación directa es difícil porque no hay benchmarks publicados para este fine-tune. Frente a los modelos alineados de la tabla, la diferencia principal no es de rendimiento bruto sino de comportamiento: este modelo prioriza la ausencia de rechazos sobre la seguridad, y pierde el multilingüismo que sí ofrecen Gemma, Llama y Mistral. Frente a otras abliterations de la comunidad (por ejemplo, variantes de Llama 3 abliterated), la ventaja es la inclusión de visión vía `mmproj` y la disponibilidad de cuantizaciones estáticas e imatrix por separado.

## Limitaciones y advertencias

- Modelo sin alineación de seguridad: la abliteration elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o sexualmente explícito. No apto para aplicaciones orientadas al público sin un filtro externo.
- Riesgo de alucinación: no hay evaluaciones publicadas; los fine-tunes agresivos sobre modelos pequeños suelen degradar la factualidad respecto al base.
- Solo inglés: la model card declara únicamente `en`; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Licencia: aunque el repositorio declara Apache 2.0, el modelo deriva de Gemma, cuya licencia original (Gemma Terms of Use) impone restricciones de uso, obligaciones de atribución y prohibiciones específicas. La declaración Apache 2.0 del fine-tune no sustituye a la licencia del modelo base; conviene revisar los términos de Gemma antes de cualquier uso comercial.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que impide planificar aplicaciones con documentos largos.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la coherencia; para producción se recomienda Q4_K_M o superior, o las versiones imatrix del repositorio `-i1-GGUF`.
- Sin benchmarks ni evaluación de sesgos: no hay datos sobre comportamiento diferencial por género, etnia o religión tras la abliteration, un aspecto crítico si se usa en investigación.
- Repositorio grande (76.9 GB): descargar el repo completo consume mucho espacio; conviene bajar solo el fichero GGUF necesario.
- Modelo de nicho con pocas descargas (701) y cero likes: menor validación comunitaria que otros fine-tunes equivalentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-E4B-it-GLM-4.7-Flash-HERETIC-UNCENSORED-Thinking-GGUF
- Modelo base: https://huggingface.co/DavidAU/gemma-4-E4B-it-GLM-4.7-Flash-HERETIC-UNCENSORED-Thinking
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-E4B-it-GLM-4.7-Flash-HERETIC-UNCENSORED-Thinking-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-4-E4B-it-GLM-4.7-Flash-HERETIC-UNCENSORED-Thinking-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
