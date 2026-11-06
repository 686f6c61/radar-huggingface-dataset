# miceworks/Mark-VL-2.2B

## Resumen

Mark-VL-2.2B es un modelo multimodal vision-lenguaje desarrollado por el usuario miceworks y publicado en Hugging Face. Combina un backbone de lenguaje nativo basado en la arquitectura DeepSeek2 (MoE con Multi-Head Latent Attention) con un adaptador proyector de visión especializado que transforma parches espaciales de imagen al espacio de embeddings de texto. El modelo tiene 2.174.310.096 parámetros físicos totales, de los cuales solo 395.499.216 están activos por token gracias a su naturaleza Mixture-of-Experts.

La relevancia de este modelo radica en su eficiencia: con solo 14 capas de transformer, dimensión oculta de 1280 y 24 expertos enrutados (2 activos por token), ofrece capacidades multimodales en un paquete de aproximadamente 1,17 GiB cuantizado en IQ4_NL. Esto lo hace desplegable en hardware de consumo mediante llama.cpp u Ollama, con una ventana de contexto de 16384 tokens.

El repositorio distribuye tres artefactos binarios: el backbone cuantizado en IQ4_NL, el proyector de visión en formato GGUF y una cuantización legacy Q4_K_M para compatibilidad con runtimes más antiguos. La información pública sobre licencia, idiomas soportados y benchmarks es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek2 (MoE con Multi-Head Latent Attention) |
| Parametros totales | 2.174.310.096 |
| Parametros activos | 395.499.216 por token |
| Longitud de contexto | 16384 tokens |
| Tipos de cuantizacion | IQ4_NL (principal), Q4_K_M (legacy) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors reportado en metadatos de HF) |

Especificaciones adicionales del backbone: 14 capas de transformer, 16 cabezas de atención, dimensión oculta de 1280, MLA con `q_lora_rank=640` y `kv_lora_rank=320`, 24 expertos enrutados más 1 experto compartido, 2 expertos activos por token, tamaño intermedio de MoE de 1504, vocabulario de 32000 tokens y 255 tensores totales (184 en IQ4_NL, 71 en F32).

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DeepSeek2, que combina Mixture-of-Experts con Multi-Head Latent Attention (MLA). La MLA comprime las proyecciones de query y key-value mediante rangos latentes de baja dimensión (`q_lora_rank=640`, `kv_lora_rank=320`), reduciendo el coste de memoria del KV cache durante la inferencia. La capa MoE enruta cada token a 2 de los 24 expertos disponibles, más un experto compartido siempre activo, lo que explica que solo el 18,2 % de los parámetros totales (395M de 2.174M) se activen por token.

Sobre el backbone se acopla un proyector de visión multimodal que procesa parches espaciales de imagen y los proyecta al espacio de embeddings de texto. La cuantización IQ4_NL aplica tablas enteras no lineales de 4 bits a las matrices lineales y a los tensores 3D de expertos MoE, con factores de escala FP16 cada 32 pesos, mientras que todas las capas de normalización RMSNorm y los sesgos del router se preservan en FP32. No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat basada en tokens `<|bos|>` y `<|eos|>`.
- Procesamiento de imágenes mediante el proyector multimodal `mmproj_mark_vl_2_2b.gguf`, que convierte parches espaciales en embeddings de texto.
- Modo de razonamiento explícito: la plantilla de chat inserta `<think>` antes de la respuesta del asistente, lo que sugiere soporte de cadena de pensamiento.
- Inferencia local eficiente gracias a la activación parcial de expertos MoE (395M parámetros activos por token).
- Compatibilidad con endpoints OpenAI a través de `llama-server`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con contexto largo: con 16384 tokens de ventana, el modelo puede mantener diálogos multi-turno extensos en un equipo de consumo, gestionando historiales de conversación amplios sin truncamiento agresivo.
- Descripción y análisis de imágenes en local: el proyector de visión permite procesar imágenes y generar descripciones textuales o responder preguntas sobre su contenido, todo ello sin conexión a servicios en la nube.
- Despliegue en dispositivos con recursos limitados: con un archivo GGUF de aproximadamente 1,17 GiB en IQ4_NL, cabe en GPUs de consumo con 4-8 GB de VRAM o incluso en CPU mediante llama.cpp, lo que lo hace apto para entornos de borde.
- Prototipado rápido de aplicaciones multimodales: la integración con Ollama y llama.cpp permite levantar un servidor compatible con la API de OpenAI en pocos minutos, ideal para validar ideas antes de escalar a modelos mayores.
- Clasificación y extracción de información de documentos escaneados: el modelo puede recibir imágenes de documentos y extraer texto estructurado o responder preguntas sobre su contenido, aprovechando la ventana de contexto para múltiples páginas.
- Moderación de contenido visual en pipelines automatizados: integrado en un servidor llama-server, puede analizar imágenes entrantes y generar etiquetas o descripciones que alimenten sistemas de filtrado.
- Educación y accesibilidad: generación de descripciones de imágenes para personas con discapacidad visual en aplicaciones de escritorio, gracias a su bajo coste computacional y despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB para el backbone en IQ4_NL, más el proyector de visión y el KV cache. Con contexto completo de 16384 tokens, el KV cache añade overhead adicional dependiente de la implementación de MLA.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen sobrado. En entornos profesionales, A100 o H100 no son necesarias pero funcionarían.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 4 GB o más de VRAM, así como en CPU mediante llama.cpp.
- Opciones de despliegue: Ollama (con Modelfile y ADAPTER para el proyector), llama.cpp (`llama-cli`, `llama-server` con flag `-c 16384`), y cualquier runtime compatible con GGUF que soporte arquitectura `deepseek2` y adaptadores multimodales.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el bajo número de parámetros activos (395M), se espera una latencia baja en hardware moderno, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mark-VL-2.2B | 2.174M | 395M | 16384 | no disponible | GGUF |
| Qwen2-VL-2B | ~2.000M | denso | 32768 | Apache 2.0 | safetensors, GGUF |
| SmolVLM-2B | ~2.000M | denso | 8192 | Apache 2.0 | safetensors, GGUF |
| InternVL2-2B | ~2.000M | denso | 8192 | MIT | safetensors |

Mark-VL-2.2B se distingue por su naturaleza MoE, que reduce los parámetros activos a 395M frente a los ~2.000M de los modelos densos comparables, lo que puede traducirse en menor coste computacional por token. Sin embargo, la falta de benchmarks publicados y de licencia explícita limita la comparación rigurosa con alternativas como Qwen2-VL-2B o SmolVLM-2B, que cuentan con documentación y licencias permisivas verificables.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor antes de desplegarlo en producción.
- Idiomas soportados no documentados: no hay información sobre la cobertura multilingüe, por lo que el rendimiento en castellano u otros idiomas distintos del inglés es incierto.
- Ausencia de benchmarks: no hay datos objetivos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales que permitan validar la calidad del modelo frente a alternativas.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones de imágenes o respuestas factualmente incorrectas, especialmente con imágenes ambiguas o de baja calidad.
- Vocabulario limitado a 32000 tokens: es reducido comparado con modelos modernos (100k+), lo que puede penalizar la eficiencia en idiomas no ingleses y en tokenización de código.
- Contexto de 16384 tokens: suficiente para muchas aplicaciones, pero inferior a los 32k-128k de modelos competidores en la misma categoría.
- Modelo con pocas descargas (308) y sin likes: la comunidad de validación es mínima, lo que aumenta el riesgo de comportamientos no documentados.
- Dependencia de la arquitectura `deepseek2` en el runtime: requiere versiones de llama.cpp u Ollama que soporten esta arquitectura y adaptadores multimodales; la compatibilidad puede romperse en actualizaciones.
- Estado del checkpoint reportado como `TRAINED_CHECKPOINT_VALIDATED`, pero sin información sobre el proceso de alineación (RLHF/DPO) ni sobre filtrado de datos.

## Enlaces

- Hugging Face: https://huggingface.co/miceworks/Mark-VL-2.2B
