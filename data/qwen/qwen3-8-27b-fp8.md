# Qwen/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es la versión cuantizada en FP8 del modelo Qwen3.8-27B, desarrollado por Alibaba Qwen. Se trata de un modelo de lenguaje causal con encoder de visión, de arquitectura híbrida densa que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention), diseñado para tareas de razonamiento, codificación, trabajo profesional y ejecución de agentes de larga duración. El modelo base tiene 27.781 millones de parámetros y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. Esta versión FP8 reduce el tamaño del repositorio a 30,9 GB, lo que permite su ejecución en una sola GPU de gama alta, manteniendo un rendimiento casi idéntico al original según la documentación oficial.

La relevancia de este lanzamiento radica en que Qwen3.8 es la generación más capaz de la familia abierta de Qwen hasta la fecha, e incorpora mejoras sustanciales en capacidades de agente, comprensión de imágenes y vídeo, y control flexible del razonamiento. Al estar publicada bajo licencia Apache 2.0 y ser compatible con los principales motores de inferencia (Transformers, vLLM, SGLang, TokenSpeed), se posiciona como una opción atractiva para despliegues en producción tanto en la nube como en hardware local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrido denso (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 (bloque 128), BF16, NVFP4 W4A4 (según SGLang) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con GGUF vía conversión) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso con una arquitectura híbrida que intercala bloques de atención lineal (Gated DeltaNet) con bloques de atención clásica (Gated Attention). El layout interno es 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), con 64 capas en total. La dimensión oculta es 5120, con 48 cabezas de atención lineal para V y 16 para QK (dimensión 128), y 24 cabezas Q y 4 cabezas KV para la atención clásica (dimensión 256). El embedding de tokens tiene un tamaño de 248.320 (padded). Además, el modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento comprende una fase de pre-entrenamiento y otra de post-entrenamiento, pero no se han publicado detalles específicos sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO en la información disponible. La cuantización FP8 de este repositorio utiliza un esquema de grano fino con bloque de tamaño 128, y según la documentación, las métricas de rendimiento son casi idénticas a las del modelo original.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking mode) activado por defecto y desactivable por petición.
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución de agentes autónomos con planificación de largo horizonte y manejo de feedback del entorno.
- Control flexible del razonamiento mediante el parámetro `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Soporte de tool calling y function calling (implícito en las capacidades de agente, aunque no se detalla explícitamente en la documentación).
- Capacidades multilingües no especificadas en la información disponible.
- Compatibilidad con múltiples motores de inferencia: Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Asistente de programación en producción: el modelo puede generar, revisar y depurar código en múltiples lenguajes, integrándose en pipelines de CI/CD mediante su API y soporte de tool calling. Su contexto de 262K tokens permite manejar repositorios completos o archivos de gran tamaño.
- Agente de automatización de tareas empresariales: gracias a su capacidad de planificación multi-paso y manejo de feedback, puede ejecutar flujos de trabajo complejos como gestión de correos, generación de informes o interacción con APIs externas.
- Análisis de documentos técnicos y científicos: su comprensión de imágenes y vídeo permite extraer información de gráficos, diagramas y páginas escaneadas, útil en investigación y consultoría.
- Soporte al cliente con contexto largo: puede mantener conversaciones multi-turno con historial extenso (hasta 1M tokens con extensión), gestionando consultas complejas y derivando a herramientas externas cuando es necesario.
- Generación de contenido multimedia: al entender imágenes y vídeo, puede describir, resumir o transcribir contenido audiovisual, útil para accesibilidad o moderación de contenido.
- Investigación y razonamiento matemático: su capacidad de razonamiento profundo (thinking mode) lo hace adecuado para resolver problemas de matemáticas, física o lógica, con la opción de ajustar el esfuerzo de razonamiento según la complejidad.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos, pero la información proporcionada está incompleta (solo se muestra la cabecera y la primera fila de la categoría "Coding" con el benchmark "Agentic terminal coding", sin valores numéricos). No se han publicado resultados completos en la información disponible. Se recomienda consultar la documentación oficial de Qwen para obtener las cifras detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización FP8, el modelo ocupa aproximadamente 30,9 GB en disco, por lo que se necesita al menos 32 GB de VRAM para cargar los pesos y el overhead de inferencia. En BF16, el requisito sube a ~54 GB.
- GPU recomendadas: según la documentación de SGLang, puede ejecutarse en una sola GPU H200, RTX PRO 6000, RTX 5090 o DGX Spark. También es viable en A100 80GB o RTX 4090 24GB (con FP8 y optimizaciones de memoria).
- En consumer GPU: cabe en RTX 4090 (24 GB) con FP8 y técnicas de offloading, aunque con limitaciones de velocidad. Para un rendimiento óptimo se recomienda una GPU con 32 GB o más.
- Opciones de despliegue: vLLM, SGLang, Transformers, TokenSpeed, y también es compatible con Ollama y llama.cpp mediante conversión a GGUF.
- Latencia y throughput: no se han publicado cifras oficiales, pero al ser un modelo denso de 27B con MTP, se espera una latencia de decodificación competitiva en GPUs de alta gama. El coste por millón de tokens en una GPU única se estima en el mismo rango que las APIs de modelos pequeños, según análisis de terceros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantizaciones | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (FP8) | 27,78B | 262K (ext. 1M) | Apache 2.0 | FP8, BF16, NVFP4 | Última generación, visión-lenguaje, agente |
| Qwen3.5-27B (FP8) | ~27B | No disponible | Apache 2.0 | FP8 | Generación anterior, sin visión nativa |
| Qwen3.6-27B | ~27B | No disponible | Apache 2.0 | No disponible | Mencionado en benchmarks, sin detalles públicos |

No se dispone de datos suficientes para comparar con modelos de otros fabricantes (como Muse Glimmer-30B u Opus4.6 Max) en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos del modelo; como todo LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- La ventana de contexto de 262K tokens es nativa, pero la extensión a 1M puede requerir técnicas de interpolación de posición o hardware adicional.
- Los idiomas soportados no están especificados; se asume un soporte multilingüe similar a otros modelos Qwen, pero no confirmado.
- La cuantización FP8 puede introducir ligeras pérdidas de precisión en comparación con BF16, aunque la documentación afirma que las métricas son casi idénticas.
- Para uso comercial, la licencia Apache 2.0 permite uso libre, pero es recomendable revisar los términos de la política de uso aceptable de Qwen.
- El modelo requiere hardware con al menos 32 GB de VRAM para un despliegue cómodo; en GPUs de 24 GB puede ser necesario usar offloading o cuantización más agresiva, con impacto en rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Documentación de despliegue con SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Guía de especificaciones y hardware (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guía de ejecución local (SWFTE): https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- Información general de Qwen 3.8 (OpenLM): https://openlm.ai/qwen3.8/
