# letuan/Huihui-Qwen3.6-27B-abliterated-FP8

## Resumen
Huihui-Qwen3.6-27B-abliterated-FP8 es una versión "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.6-27B, publicada por el usuario letuan en Hugging Face y derivada del trabajo original de huihui-ai. La abliteración es una técnica que identifica y neutraliza las direcciones de activación asociadas a las respuestas de rechazo del modelo, de modo que el modelo deja de negarse a responder a determinadas peticiones. Esta variante concreta se distribuye además en formato FP8 mediante compressed-tensors.

El modelo conserva la arquitectura del Qwen3.6-27B original, con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) y pipeline image-text-to-text, lo que indica capacidades multimodales de entrada. El repositorio ocupa 31,3 GB y se distribuye bajo licencia Apache 2.0.

Es relevante para investigadores que necesitan estudiar el comportamiento de modelos sin capas de rechazo, así como para experimentación controlada en entornos de investigación. No obstante, la propia model card advierte de que se trata de una implementación de prueba de concepto y desaconseja su uso directo en producción o en aplicaciones comerciales de cara al público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.6; tag qwen3_5) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base y la versión abliterated sin cuantizar están disponibles por separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8, compressed-tensors) |

## Arquitectura y entrenamiento
El modelo es un transformer derivado de Qwen/Qwen3.6-27B. La modificación respecto al original consiste en una abliteración: se eliminan o neutralizan las direcciones de activación responsables de las respuestas de rechazo, siguiendo el enfoque del repositorio remove-refusals-with-transformers, que implementa el proceso sin depender de TransformerLens. Se trata, según el autor original, de una implementación tosca y de prueba de concepto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si hubo etapas de RLHF o DPO en el modelo base. Tampoco se detalla el proceso exacto de cuantización a FP8 más allá del uso de compressed-tensors. El pipeline declarado es image-text-to-text, lo que sugiere que el modelo base acepta imágenes como entrada además de texto, aunque no se especifican los detalles del codificador visual.

## Capacidades
- Generación de texto conversacional en formato multi-turno.
- Procesamiento de entradas image-text-to-text (multimodal de entrada), según el pipeline declarado.
- Ausencia de mecanismos de rechazo: el modelo no aplica las negativas típicas del modelo base ante peticiones sensibles.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue vía API.
- Compatibilidad con transformers y con Ollama (la versión no cuantizada se ofrece como huihui_ai/qwen3.6-abliterated:27b).
- Capacidades de razonamiento, código y matemáticas: no disponibles de forma explícita en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso
- Investigación sobre alineación y seguridad: permite estudiar qué comportamientos emergen cuando se eliminan las capas de rechazo, comparando respuestas con el modelo base en entornos controlados.
- Evaluación de robustez de filtros: sirve para probar sistemas de moderación externos frente a un modelo que no se autocensura, verificando que las salvaguardas del pipeline (no del modelo) funcionan.
- Experimentación académica con modelos multimodales: al aceptar image-text-to-text, puede emplearse en estudios sobre sesgos en la descripción de imágenes dentro de entornos de laboratorio.
- Pruebas de red teaming: útil para generar casos adversarios y evaluar la resiliencia de clasificadores de contenido.
- Desarrollo de técnicas de abliteración: sirve como referencia para reproducir y comparar metodologías de eliminación de rechazos sobre modelos Qwen.
- Despliegue en investigación con Ollama o transformers: la variante FP8 y la versión Ollama facilitan pruebas locales en hardware de laboratorio sin necesidad de infraestructura de gran escala.
- Benchmarking de cuantización: permite comparar la calidad de las respuestas en FP8 frente al modelo original en tareas controladas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: con 27,8 mil millones de parámetros en FP8 (1 byte por parámetro), los pesos ocupan aproximadamente 27,8 GB; sumando overhead de activaciones y caché KV, se recomienda al menos 32-40 GB de VRAM para inferencia cómoda.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB. En GPUs consumer de 24 GB (RTX 4090) no cabe en FP8 sin offloading o cuantización adicional.
- Cabe en consumer GPU: no de forma nativa en FP8; sería necesario cuantizar a 4 bits (GGUF/AWQ/GPTQ) para ajustarlo a 24 GB, lo que no está disponible en este repositorio.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles, Ollama (para la versión no FP8), vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Huihui-Qwen3.6-27B-abliterated-FP8 | 27,8 B | no disponible | Apache 2.0 | Variante abliterated en FP8, multimodal de entrada |
| Qwen/Qwen3.6-27B | 27,8 B | no disponible | Apache 2.0 | Modelo base con alineación de seguridad intacta |
| huihui_ai/qwen3.6-abliterated:27b | 27,8 B | no disponible | Apache 2.0 | Misma abliteración en formato Ollama, sin cuantizar a FP8 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- Ausencia de filtrado de seguridad: la abliteración elimina los rechazos, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado.
- No apto para todos los públicos: los outputs pueden ser inadecuados para entornos públicos, menores o aplicaciones con requisitos altos de seguridad.
- Responsabilidad legal y ética: el usuario asume toda la responsabilidad sobre el uso y las consecuencias del contenido generado.
- Uso recomendado solo en investigación y entornos controlados: la model card desaconseja explícitamente el uso directo en producción o en aplicaciones comerciales de cara al público.
- Supervisión manual necesaria: se recomienda monitorizar las salidas en tiempo real y revisarlas manualmente.
- Sin garantías de seguridad: el modelo no ha pasado por optimizaciones de seguridad rigurosas.
- Idiomas soportados y longitud de contexto no documentados, lo que dificulta planificar despliegues multilingües o con contexto largo.
- Implementación de prueba de concepto: la propia abliteración se describe como tosca, lo que puede degradar la coherencia o el rendimiento en algunas tareas respecto al modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a cualquier LLM de este tamaño.

## Enlaces
- Hugging Face: https://huggingface.co/letuan/Huihui-Qwen3.6-27B-abliterated-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Repositorio de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Versión Ollama: https://ollama.com/huihui_ai/qwen3.6-abliterated:27b
- Repositorio Ollama: https://github.com/ollama/ollama/releases/tag
