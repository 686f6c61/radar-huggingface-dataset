# moonbox-dev/Ministral-3-8B-Instruct-2512-MLX

## Resumen

Ministral 3 8B Instruct 2512 MLX es una compilación no oficial, realizada por moonbox-dev, del modelo Ministral 3 8B Instruct 2512 de Mistral AI, adaptada para su ejecución en Apple Silicon mediante la librería MLX y el runtime mlx-vlm. El modelo base es un transformer de 8.000 millones de parámetros con capacidad de visión (pipeline image-text-to-text), ajustado por instrucciones y publicado originalmente por Mistral AI bajo licencia Apache 2.0. Esta compilación no añade ni modifica capacidades: su valor está en ofrecer pesos ya cuantizados y empaquetados como un modelo mlx-vlm completo (pesos, `config.json`, tokenizer, chat template y ajustes de procesador) listo para cargar en Macs con chip Apple Silicon.

El repositorio incluye dos builds de precisión, 8 bits y 6 bits, cada uno distribuido en cuatro ficheros safetensors con sus índices y ficheros de configuración correspondientes. El autor documenta métricas de fidelidad frente al modelo original en bf16: para 8 bits, divergencia KL de 0,0007 nats (p95 0,0018), acuerdo top-1 del 98,0 % y perplejidad 15,37 frente a 15,38; para 6 bits, KL de 0,0033 nats (p95 0,0087), acuerdo top-1 del 95,7 % y perplejidad 15,40. El repositorio ocupa 24,2 GB en total y se publicó el 22 de noviembre de 2026.

La relevancia de esta ficha es práctica: permite a desarrolladores e investigadores que trabajan en macOS evaluar un modelo multimodal de 8B de Mistral AI sin depender de CUDA ni de GPUs dedicadas, con cuantizaciones verificadas numéricamente contra el original. Conviene subrayar que no es una release oficial de Mistral AI y que las capacidades, idiomas y comportamiento del modelo son los del base, no los de esta compilación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos del base no disponibles en la información proporcionada |
| Parámetros totales | 8B (según denominación del modelo base) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits y 6 bits (builds MLX); el base se publica en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), en 4 shards por build; incluye `config.json`, tokenizer, chat template y `processor_config.json` |
| Librería / runtime | MLX, mlx-vlm |
| Plataforma objetivo | Apple Silicon (macOS) |
| Tamaño del repositorio | 24,2 GB |
| Modelo base | mistralai/Ministral-3-8B-Instruct-2512 (BF16) |

## Arquitectura y entrenamiento

El modelo base es Ministral 3 8B Instruct 2512, un transformer de 8.000 millones de parámetros ajustado por instrucciones y con soporte de visión, según indica el pipeline `image-text-to-text` y la etiqueta `vision` del repositorio. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineación; tampoco se especifican innovaciones internas como atención lineal o decodificación especulativa. Cualquier afirmación sobre estos puntos requeriría consultar la model card oficial de Mistral AI, que no forma parte de los datos disponibles.

La contribución técnica de esta compilación es la cuantización y el empaquetado para MLX. El autor publica dos builds con métricas de fidelidad medibles frente al original en bf16: el build de 8 bits mantiene un acuerdo top-1 del 98,0 % con una divergencia KL de 0,0007 nats y una perplejidad prácticamente idéntica (15,37 frente a 15,38); el build de 6 bits baja al 95,7 % de acuerdo top-1 con KL de 0,0033 nats y perplejidad 15,40. Cada build es un modelo mlx-vlm completo y autónomo, con tokenizer de Mistral, chat template y ajustes de procesador incluidos, lo que simplifica la carga sin pasos de conversión adicionales.

## Capacidades

- Generación de texto y razonamiento en modo instructivo, heredados del ajuste por instrucciones del modelo base.
- Comprensión de imágenes y respuesta en texto (image-text-to-text), con procesador y configuración multimodal incluidos en el paquete.
- Conversación multi-turno mediante la chat template de Mistral incluida en cada build.
- Ejecución nativa en Apple Silicon a través de MLX y mlx-vlm.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Prototipado multimodal en Mac: cargar el build de 8 bits con mlx-vlm para experimentar con entrada de imagen y salida de texto directamente en un Mac con Apple Silicon, sin GPU dedicada ni entorno CUDA.
- Evaluación comparativa de cuantizaciones: usar los dos builds (8 y 6 bits) para medir en el propio dominio de aplicación la degradación real frente a bf16, partiendo de las métricas publicadas (98,0 % y 95,7 % de acuerdo top-1) como referencia.
- Asistentes locales de escritorio: integrar el modelo en una aplicación macOS que procese capturas de pantalla o documentos escaneados y devuelva descripciones o respuestas en lenguaje natural, aprovechando que los pesos residen en local.
- Investigación en eficiencia de inferencia: emplear el par de builds como caso de estudio reproducible de cuantización MLX con métricas de KL y perplejidad documentadas por el autor.
- Desarrollo offline con requisitos de privacidad: desplegar el modelo en estaciones de trabajo Mac donde los datos no pueden salir del equipo, al no requerir servicios en la nube.
- Docencia y formación: demostrar pipelines image-text-to-text en hardware de consumo Apple, con un repositorio de 24,2 GB que incluye todo lo necesario para la carga.
- Pruebas de viabilidad antes de migrar a producción: validar prompts, chat template y comportamiento del modelo base en MLX antes de invertir en infraestructura con GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí documenta métricas de fidelidad de la cuantización frente al modelo original en bf16:

| Build | Divergencia KL (nats) | KL p95 (nats) | Acuerdo top-1 | Perplejidad (build vs bf16) |
|---|---|---|---|---|
| 8 bits | 0,0007 | 0,0018 | 98,0 % | 15,37 vs 15,38 |
| 6 bits | 0,0033 | 0,0087 | 95,7 % | 15,40 vs 15,38 |

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX no se ejecuta en CUDA ni en CPU x86 con este paquete).
- VRAM/memoria unificada estimada: el build de 8 bits suma aproximadamente 9,9 GB en pesos (3,05 + 2,66 + 2,61 + 1,56 GB); el de 6 bits, aproximadamente 7,75 GB (2,53 + 2,03 + 2,00 + 1,19 GB). A ello hay que añadir la memoria del runtime, el tokenizer, el procesador de visión y la caché KV, por lo que conviene disponer de margen adicional sobre esas cifras.
- Macs recomendados: equipos con 16 GB de memoria unificada o más para el build de 6 bits; 24 GB o más para el de 8 bits con contexto amplio. No se dispone de datos para confirmar el comportamiento en configuraciones de 8 GB.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; estos pesos MLX no están pensados para CUDA.
- Opciones de despliegue: mlx-vlm (runtime de referencia del paquete). vLLM, llama.cpp, Ollama y TGI no están indicados en la información proporcionada para estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| Ministral 3 8B Instruct 2512 MLX (esta ficha) | 8B | No disponible | Sí | Apache 2.0 | Safetensors MLX, Apple Silicon |
| mistralai/Ministral-3-8B-Instruct-2512 (BF16) | 8B | No disponible | Sí | Apache 2.0 | Safetensors BF16, GPU/CPU |
| Otras compilaciones MLX de modelos 8B de Mistral | No disponible | No disponible | No disponible | No disponible | Safetensors MLX, Apple Silicon |

La comparación relevante es con el modelo base en BF16: misma arquitectura y capacidades, pero mayor huella de memoria y sin empaquetado específico para MLX. No se dispone de información sobre alternativas comparables de otros autores en la misma categoría para establecer una comparativa más amplia.

## Limitaciones y advertencias

- Compilación no oficial: no es una release de Mistral AI; el autor lo indica expresamente. Para producción, conviene validar contra el modelo base oficial.
- Idiomas soportados no documentados en esta ficha: no se puede garantizar cobertura lingüística concreta sin consultar la model card de Mistral AI.
- Longitud de contexto no disponible: no se puede planificar el dimensionamiento de la caché KV ni el truncado de prompts sin ese dato.
- Riesgo de alucinación: inherente a los modelos de lenguaje ajustados por instrucciones; no hay datos específicos de mitigación en la información proporcionada.
- Sesgos: no documentados en la información disponible.
- Degradación por cuantización: el build de 6 bits pierde un 4,3 % de acuerdo top-1 frente a bf16 (95,7 % frente a 98,0 %); para tareas sensibles a la fidelidad, el build de 8 bits es la opción con menor divergencia (KL 0,0007 nats).
- Restricción de plataforma: los pesos MLX solo se ejecutan en Apple Silicon; no son portables a CUDA sin reconversión.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución y cumplirse los términos de la licencia del modelo base y de los componentes incluidos (tokenizer, chat template).
- Tool calling y comportamiento agéntico no confirmados: no se deben asumir en un pipeline de producción sin pruebas previas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Repositorio MLX: https://huggingface.co/moonbox-dev/Ministral-3-8B-Instruct-2512-MLX
- Modelo base (BF16): https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Referencia del modelo base en la model card: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Runtime mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper referenciado en los tags (arXiv:2601.08584): https://arxiv.org/abs/2601.08584
