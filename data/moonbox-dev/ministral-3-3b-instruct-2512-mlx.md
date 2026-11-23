# moonbox-dev/Ministral-3-3B-Instruct-2512-MLX

## Resumen

Ministral 3 3B Instruct 2512 MLX es una distribución cuantizada del modelo multimodal Ministral 3 3B Instruct 2512 de Mistral AI, empaquetada por moonbox-dev específicamente para su ejecución en Macs con Apple Silicon mediante la librería MLX y el runtime mlx-vlm. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint oficial en bf16 a precisiones de 8 y 6 bits, preservando el tokenizer, la plantilla de chat y la configuración del procesador de imagen de Mistral.

El modelo base es un transformer de 3.000 millones de parámetros con capacidad de visión (pipeline image-text-to-text), lo que lo sitúa en la categoría de modelos pequeños multimodales orientados a inferencia local. Su interés práctico reside en que permite ejecutar visión y lenguaje sobre hardware de consumo Apple sin depender de CUDA ni de GPUs dedicadas, manteniendo una fidelidad medible respecto al original (KL de 0,0010 nats a 8 bits y 0,0049 nats a 6 bits).

La relevancia de esta ficha es doble: por un lado documenta una alternativa de despliegue local para un modelo Mistral reciente; por otro, advierte de que se trata de un artefacto de terceros, no oficial, con licencia Apache 2.0 heredada del modelo base y sin métricas de benchmarks publicadas por el autor de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), modelo base Mistral 3 / Ministral 3 |
| Parametros totales | 3.000 millones (según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits y 6 bits (builds MLX) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con config.json, tokenizer y processor_config.json |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza transformer multimodal con entrada image-text-to-text. El repositorio distribuido por moonbox-dev no incluye datos sobre el entrenamiento original de Ministral 3 3B Instruct 2512 (número de tokens, composición del dataset, uso de RLHF/DPO o innovaciones como decodificación especulativa). Tampoco se documentan detalles del vision encoder ni del mecanismo de fusión de modalidades.

Lo que sí está documentado es el proceso de cuantización. Se ofrecen dos builds completos para mlx-vlm: uno a 8 bits (dos shards de 3,03 GB y 1,45 GB) y otro a 6 bits (2,52 GB y 1,11 GB). El autor reporta métricas de fidelidad frente al bf16 original: para 8 bits, KL de 0,0010 nats (p95 0,0024), acuerdo top-1 del 97,4 % y perplejidad 18,05 frente a 18,03; para 6 bits, KL de 0,0049 nats (p95 0,014), acuerdo top-1 del 95,2 % y perplejidad 18,14 frente a 18,03. Cada carpeta incluye checksums sha256 de todos los ficheros.

## Capacidades

- Generación de texto e instrucciones en formato chat, con plantilla Jinja incluida.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), gracias al procesador y al vision encoder del modelo base.
- Conversación multi-turno mediante chat template de Mistral.
- Ejecución nativa en Apple Silicon a través de MLX y mlx-vlm.
- Cuantización selectiva a 8 y 6 bits con degradación medida y documentada.
- No se documentan en la información disponible capacidades de tool calling, agentes, modo thinking, audio ni idiomas específicos.

## Casos de uso

- Asistente visual local en Mac: el modelo puede recibir una imagen y una pregunta en el mismo prompt y responder en lenguaje natural, aprovechando mlx-vlm sobre Apple Silicon sin GPU dedicada.
- Transcripción y descripción de capturas o documentos escaneados en flujos de trabajo de escritorio, con los 8 bits como opción de mayor fidelidad (97,4 % de acuerdo top-1 con el bf16).
- Prototipado rápido de aplicaciones multimodales en entornos de desarrollo con macOS, usando el build de 6 bits para reducir huella en disco y memoria.
- Clasificación y anotación semiautomática de imágenes en pipelines de datos, donde la perplejidad de 18,14 a 6 bits sigue siendo cercana a la del modelo original.
- Chat de escritorio con soporte de imágenes para usuarios finales en equipos Apple, sin necesidad de infraestructura en la nube.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece métricas KL y de acuerdo top-1 que permiten decidir entre 8 y 6 bits según tolerancia a la degradación.
- Integración en herramientas de accesibilidad que describan contenido visual en tiempo real sobre hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de fidelidad de la cuantización frente al modelo bf16:

| Build | KL (nats) | KL p95 | Acuerdo top-1 | Perplejidad | Perplejidad bf16 |
|---|---|---|---|---|---|
| 8 bits | 0,0010 | 0,0024 | 97,4 % | 18,05 | 18,03 |
| 6 bits | 0,0049 | 0,014 | 95,2 % | 18,14 | 18,03 |

## Requisitos de hardware

- Hardware objetivo: Macs con Apple Silicon (M1, M2, M3, M4 y posteriores), según los tags del repositorio.
- Huella en disco: aproximadamente 4,5 GB para el build de 8 bits y 3,6 GB para el de 6 bits, más tokenizer y ficheros de configuración.
- VRAM/memoria unificada estimada: no disponible de forma oficial; por el tamaño de los pesos, el build de 8 bits requiere del orden de 4,5 GB de memoria unificada y el de 6 bits del orden de 3,6 GB, a los que hay que sumar el coste del contexto y del procesamiento de imagen.
- GPU recomendadas: no aplica CUDA; el runtime es MLX sobre Apple Silicon.
- Cabe en GPU de consumo Apple: sí, en equipos con memoria unificada suficiente (8 GB o más para el build de 6 bits; 16 GB o más recomendable para el de 8 bits con contexto amplio).
- Opciones de despliegue: mlx-vlm (runtime documentado por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 3B Instruct 2512 MLX (este) | 3B | no disponible | imagen + texto | Apache 2.0 | Hugging Face, MLX |
| mistralai/Ministral-3-3B-Instruct-2512 (bf16) | 3B | no disponible | imagen + texto | Apache 2.0 | Hugging Face, oficial |
| Otras cuantizaciones del mismo modelo base | 3B | no disponible | imagen + texto | Apache 2.0 | no disponible en la información |

No se dispone de datos de benchmarks ni de especificaciones de contexto para comparar con alternativas de otros fabricantes; la comparación se limita al modelo base oficial y a sus variantes de precisión.

## Limitaciones y advertencias

- Artefacto de terceros: no es una release oficial de Mistral AI; el autor lo declara explícitamente.
- Solo MLX: no es utilizable directamente con vLLM, llama.cpp, Ollama ni TGI sin conversión adicional.
- Plataforma restringida a Apple Silicon; no apto para despliegues en CUDA o servidores x86 convencionales.
- Degradación por cuantización: el build de 6 bits baja al 95,2 % de acuerdo top-1 y eleva la perplejidad de 18,03 a 18,14; el de 8 bits se mantiene en 97,4 % y 18,05.
- Sin datos publicados de benchmarks, sesgos, alucinación ni cobertura idiomática; no se puede evaluar su comportamiento en producción a partir de la información disponible.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero conviene verificar los términos del repositorio oficial de Mistral AI para el modelo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El tamaño del repo (11,3 GB) incluye todos los builds; descargar solo la carpeta de la precisión deseada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Ministral-3-3B-Instruct-2512-MLX
- Modelo base oficial: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Modelo base en bf16: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Runtime mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper referenciado en los tags: arxiv:2601.08584
