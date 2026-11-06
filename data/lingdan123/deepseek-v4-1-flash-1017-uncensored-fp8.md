# lingdan123/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es un ajuste fino a nivel de pesos del modelo multimodal DeepSeek-V4.1-Flash-1017, publicado por el usuario lingdan123 (con créditos en la model card a @dealignai). El objetivo declarado es eliminar el comportamiento de rechazo del modelo base manteniendo intactas todas sus capacidades: visión, vídeo, razonamiento por niveles, tool calling, decodificación especulativa DSpark y una ventana de contexto nativa de 1 millón de tokens.

Arquitectura MoE de 40 capas con 763.205.315.794 parámetros totales según los safetensors del repositorio, pesos nativos en FP8 (e4m3fn) con escalas de bloque ue8m0 y expertos en FP4. El repositorio ocupa 510,3 GB distribuidos en 48 shards de safetensors, con el renderizador de prompts y el motor de inferencia de referencia incluidos sin modificar.

La relevancia de esta ficha es doble: por un lado documenta un modelo de frontera de gran tamaño en formato FP8 listo para servir; por otro, es un ejemplo de modificación de comportamiento (abliteration) realizada exclusivamente sobre los pesos, sin SFT, RLHF, DPO, LoRA ni jailbreak de plantilla de chat. La licencia MIT declarada y el gate de acceso en Hugging Face condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 40 capas (deepseek_v41) con expertos FP4 |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (nativo) |
| Tipos de cuantizacion | FP8 nativo (e4m3fn) con escalas de bloque ue8m0; expertos MoE en FP4 |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 510,3 GB), 8-bit |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 40 capas con enrutamiento disperso y expertos almacenados en FP4, mientras que los pesos densos y las escalas se mantienen en FP8 e4m3fn con escalas de bloque ue8m0. Incorpora decodificación especulativa DSpark y un cabezal multimodal que procesa imagen y vídeo además de texto. La ventana de contexto es de 1 millón de tokens de forma nativa, sin trucos de interpolación posicional documentados en la información disponible.

El proceso de modificación es exclusivamente a nivel de pesos: no se aplicó SFT, RLHF, DPO, LoRA, adaptadores ni hooks en tiempo de carga, y el tokenizador y la plantilla Jinja son byte-idénticos al upstream. La model card insiste en que el checkpoint no es una cuantización derivada, sino que se construyó desde la fuente FP8 nativa, y advierte de que cuantizar este bundle a bits bajos acumula error sobre la edición de abliteration, por lo que recomienda rehacer el pipeline sobre la precisión objetivo (el autor publica un hermano EXL3 2,9 bpw construido así). No se documenta el conjunto de datos ni el número de tokens de entrenamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Comprensión de imagen y vídeo (pipeline `image-text-to-text`).
- Tool calling y function calling.
- Razonamiento multi-paso y uso en flujos de agente.
- Decodificación especulativa DSpark para acelerar la generación.
- Contexto largo de hasta 1M tokens para documentos extensos y conversaciones multi-turno.
- Multilingüe en inglés, chino, español, francés, ruso, italiano y tailandés.
- Comportamiento sin rechazo por defecto: responde a solicitudes en categorías que el modelo base declinaría.

## Casos de uso

- Análisis de documentación técnica extensa: con 1M tokens de contexto se puede cargar un repositorio completo o un conjunto de especificaciones y hacer preguntas cruzadas sin trocear el material.
- Procesamiento de vídeo y audio-visual: el pipeline multimodal permite describir, resumir o extraer información estructurada de grabaciones, útil en monitorización o análisis de contenido.
- Agentes autónomos con tool calling: el modelo puede encadenar llamadas a APIs y funciones dentro de un bucle de razonamiento multi-paso, integrándose en orquestadores tipo LangGraph o similares.
- Generación de código en pipelines de CI/CD: con tool calling y contexto largo puede revisar diffs, ejecutar tests vía herramientas y proponer parches en un solo paso de razonamiento.
- Investigación en seguridad y alineación: al ser una versión abliterated documentada, sirve para estudiar cómo se distribuye la capacidad de rechazo en los pesos y evaluar la robustez de filtros externos.
- Atención al cliente multilingüe: cubre siete idiomas y mantiene conversaciones largas con historial extenso, aunque requiere moderación externa por la ausencia de rechazo.
- Extracción de información de documentos escaneados: combinación de visión y contexto largo para digitalizar y estructurar tablas o formularios.

## Benchmarks y rendimiento

La model card incluye una evaluación interna de MMLU en modo logit (57 asignaturas × 20 preguntas, 1140 en total), greedy T=0, ejecutada sobre 4×H200 con TP4 mediante el motor `inference/` upstream. El resultado del modelo base se obtuvo contra la API oficial de DeepSeek sirviendo los mismos pesos 1017, con prompt y decodificación idénticos.

| Modelo | MMLU-20×57 | Δ vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| DeepSeek-V4.1-Flash-1017 UNCENSORED FP8 (este repo) | no disponible en la información proporcionada | no disponible |

El fragmento de la model card disponible se interrumpe antes de mostrar la cifra del modelo modificado, por lo que no se puede afirmar su resultado. No se han publicado en la información disponible resultados de HumanEval, GSM8K, MMBench ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en FP8/FP4 ocupa 510,3 GB, por lo que requiere al menos ~512 GB de memoria agregada; con overhead de activaciones y KV cache para 1M de contexto, el requisito real es sustancialmente mayor.
- GPU recomendadas: la model card cita 4×H200 con tensor parallelism 4 como configuración de referencia. Un solo H200 (141 GB) o H100 (80 GB) no es suficiente para el checkpoint completo.
- Cabe en GPU consumer: no. Ni siquiera en RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo razonables.
- Opciones de despliegue: motor `inference/` de referencia de DeepSeek incluido en el repo; compatible con stacks que carguen el formato upstream. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa DSpark debería reducir la latencia frente a decodificación autoregresiva pura, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Comentario |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | 763,2 B (MoE) | 1M | Imagen + vídeo | MIT | Abliterated, FP8 nativo |
| DeepSeek-V4.1-Flash-1017 (base) | 763,2 B (MoE) | 1M | Imagen + vídeo | consultar upstream | Comportamiento de rechazo intacto |
| DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | 763,2 B (MoE) | 1M | Imagen + vídeo | MIT | Variante de 2,9 bpw construida end-to-end |
| DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8 | 763,2 B (MoE) | 1M | Imagen + vídeo | MIT | Alias del mismo repositorio |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: no rechaza solicitudes dañinas o ilegales por defecto, lo que exige moderación externa obligatoria en cualquier despliegue público.
- Riesgo elevado de generar contenido sensible, sesgado o difamatorio; la eliminación del rechazo puede degradar también la calibración en dominios delicados.
- El gate de acceso del repositorio exige confirmar mayoría de edad, aceptar responsabilidad por las salidas y declarar caso de uso; el acceso queda a discreción del propietario.
- La licencia MIT se declara en los metadatos, pero conviene verificar los términos del modelo base upstream antes de uso comercial, ya que la model card no detalla condiciones adicionales.
- Cuantizar este bundle a bits bajos degrada la calidad más de lo habitual: el autor recomienda rehacer el pipeline de abliteration sobre la precisión objetivo en lugar de cuantizar el FP8.
- El contexto de 1M tokens es costoso en memoria KV; en la práctica el throughput cae con secuencias muy largas.
- No hay benchmarks publicados del modelo modificado en la información disponible, por lo que no se puede cuantificar la pérdida de capacidad respecto al base.
- Los idiomas soportados son siete; el rendimiento fuera de inglés y chino no está documentado.
- El tamaño (510 GB) limita el despliegue a clústeres con GPUs de数据中心; no es viable en entornos de consumo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lingdan123/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Alias del mismo repo: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2,9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor de la edición: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Ko-fi del autor: https://ko-fi.com/dealignai
