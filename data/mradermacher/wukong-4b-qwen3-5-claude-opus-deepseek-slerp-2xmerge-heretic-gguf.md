# mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF

## Resumen

Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic es un modelo de lenguaje de aproximadamente 4.326 millones de parámetros (4,3 mil millones) obtenido mediante la fusión de modelos derivados de Qwen3.5, destilados a partir de trazas de razonamiento de Claude Opus y DeepSeek. El modelo original fue publicado por el usuario xtools-at, y esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estáticas e imatrix para llama.cpp.

La propuesta del modelo es ofrecer un asistente compacto orientado a razonamiento, generación de código, uso de herramientas (tool calling) y matemáticas, con capacidades multilingües en inglés, chino, español, ruso y japonés. La variante "heretic" hace referencia a un proceso de decensurado o "abliteración" parcial, que busca reducir los rechazos del modelo ante peticiones legítimas pero potencialmente sensibles.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 4B con perfil de razonamiento en hardware de consumo, gracias a cuantizaciones que van desde 2,1 GB (Q2_K) hasta 8,8 GB (f16). Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque con las advertencias habituales de los modelos fusionados y decensurados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (fusión SLERP 2x), multimodal (incluye mmproj) |
| Parámetros totales | 4.326.350.848 (4,3 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj Q8_0 y f16) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es una fusión por SLERP (Spherical Linear Interpolation) de dos ramas, según indica el nombre "2xMerge". Ambas ramas derivan de Qwen3.5 y han sido destiladas a partir de trazas de razonamiento de Claude Opus (datasets Jackrong/Claude-opus-4.6-TraceInversion-9000x y Jackrong/Claude-opus-4.7-TraceInversion-5000x) y de trazas de agente de Hermes (lambda/hermes-agent-reasoning-traces). La información disponible no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset más allá de los tres conjuntos citados.

La variante "heretic" implica un proceso de modificación de los pesos orientado a reducir la censura del modelo (decensored/uncensored), técnica habitual en la comunidad para disminuir los rechazos ante peticiones legales pero sensibles. La presencia de archivos mmproj en el repositorio indica soporte multimodal (visión), aunque la información disponible no especifica la arquitectura exacta del componente visual ni los detalles del entrenamiento multimodal. No se dispone de información sobre si se aplicaron fases de RLHF o DPO posteriores a la fusión.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en trazas de razonamiento destiladas de Claude Opus y DeepSeek.
- Generación de código y tareas de programación, según los tags del modelo (coding).
- Matemáticas y disciplinas STEM (tags math, stem).
- Uso de herramientas y function calling (tags tool-use, function-calling, agent).
- Capacidades de agente y razonamiento multi-paso (tag agent).
- Multilingüe: inglés, chino, español, ruso y japonés.
- Soporte multimodal mediante los archivos mmproj incluidos (Q8_0 y f16), orientado a entrada de imágenes.
- Modo "uncensored/decensored" que reduce los rechazos ante peticiones sensibles.

## Casos de uso

- Asistente de código en local: con 4,3B parámetros y cuantización Q4_K_M (2,9 GB), puede ejecutarse en portátiles con GPU de 8 GB o incluso en CPU, sirviendo para autocompletado, explicación de fragmentos y generación de tests en entornos sin conexión.
- Agentes con tool calling: los tags de agent y function-calling permiten integrarlo en pipelines que invocan APIs externas, bases de datos o funciones locales, con un coste de inferencia muy bajo.
- Razonamiento matemático y STEM en el aula o laboratorio: útil para resolver problemas paso a paso y explicar el procedimiento, aprovechando las trazas de razonamiento destiladas.
- Atención al cliente multilingüe: al soportar inglés, chino, español, ruso y japonés, puede gestionar conversaciones en varios idiomas, aunque la longitud de contexto no está documentada y conviene validarla empíricamente.
- Procesamiento de documentos con imágenes: gracias a los archivos mmproj, puede emplearse para extraer información de capturas o formularios escaneados en combinación con llama.cpp.
- Prototipado rápido de aplicaciones de IA: su tamaño reducido permite desplegarlo en una sola GPU de consumo o en CPU, acelerando iteraciones de desarrollo antes de migrar a modelos mayores.
- Filtrado y reescritura de contenido en entornos editoriales: la variante heretic reduce rechazos ante textos sensibles, útil para tareas de moderación asistida o reescritura de material delicado, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (Q2_K) hasta 8,8 GB (f16); las cuantizaciones recomendadas Q4_K_S y Q4_K_M ocupan 2,7 y 2,9 GB respectivamente.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia; también funciona en GPUs de 6-8 GB con cuantizaciones Q3/Q4.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más usando Q4_K_M; incluso en CPU con 8 GB de RAM para las cuantizaciones pequeñas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los archivos mmproj permiten el modo multimodal en llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-4B (esta ficha) | 4,3B | no disponible | Apache 2.0 | GGUF | Fusión SLERP, destilado Claude/DeepSeek, heretic, multimodal |
| Qwen2.5-3B / Qwen3 pequeño | ~3B | no disponible | Apache 2.0 | safetensors/GGUF | Base de la familia, sin destilado ni decensurado |
| Llama 3.2 3B | 3,2B | 128k | Llama 3.2 Community | safetensors/GGUF | Multilingüe, sin modo razonamiento explícito |
| Phi-3.5-mini | 3,8B | 128k | MIT | safetensors/GGUF | Fuerte en razonamiento y código, sin variante decensurada |

La comparación es orientativa: la información disponible no incluye benchmarks que permitan contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Modelo fusionado y destilado: la calidad puede degradarse en tareas fuera del dominio de las trazas de entrenamiento (razonamiento, código, agente).
- Variante heretic/decensored: reduce los rechazos, lo que incrementa el riesgo de generar contenido inapropiado o dañino; requiere filtros y supervisión en producción.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en tareas de conocimiento factual y matemáticas complejas.
- Longitud de contexto no documentada: conviene validar empíricamente el límite real antes de usarlo en conversaciones largas.
- Idiomas soportados limitados a cinco; el rendimiento en español, ruso y japonés puede ser inferior al de inglés y chino.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de destilación pueden tener condiciones adicionales que conviene revisar.
- Al ser una cuantización estática, las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Dataset de trazas Claude Opus 4.6: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset de trazas Claude Opus 4.7: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trazas de agente Hermes: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
