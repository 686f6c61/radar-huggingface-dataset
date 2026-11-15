# Adeely93/vlgaurd_only_qwen_8b_adeel

## Resumen

`Adeely93/vlgaurd_only_qwen_8b_adeel` es un fine-tune por edición directa de pesos del modelo multimodal Qwen3-VL-8B-Instruct de Alibaba Qwen. No se trata de un reentrenamiento convencional: el autor aplica una técnica denominada *weight-space programming* (WSP) en la que un agente LLM (Claude Fable 5.2) reescribe directamente tres tensores de pesos, sin gradientes ni pasadas de retropropagación. Según la model card, el proceso se desarrolló exclusivamente con los datos de entrenamiento de VLGuard y consumió 83 de un presupuesto de 500 pasadas forward, con fecha 14 de noviembre de 2026. El resto de ficheros del repositorio son idénticos al modelo base.

El objetivo declarado es introducir un comportamiento de seguridad alineado con VLGuard, un conjunto de datos de ajuste para moderación y rechazo de contenido dañino en modelos visión-lenguaje. El modelo conserva la arquitectura y capacidades del Qwen3-VL-8B-Instruct original: transformer denso multimodal con 8.767.123.696 parámetros, contexto nativo de 256K tokens ampliable a 1M y soporte de imagen, vídeo y texto.

Su relevancia es doble. Por un lado, ejemplifica una tendencia incipiente de modificación de pesos mediante agentes automáticos, con un coste computacional muy inferior al de un fine-tune clásico. Por otro, permite evaluar si una edición de solo tres tensores basta para alterar de forma medible el comportamiento de seguridad de un VLM de 8B sin degradar sus capacidades generales. El repositorio es de noviembre de 2026, cuenta con 2 descargas y 0 likes, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3-VL), vision encoder ViT + LLM decoder con Interleaved-MRoPE, DeepStack y alineación texto-timestamp |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K tokens nativos, ampliable a 1M |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, presumiblemente bfloat16 por el tamano del repo de 17,5 GB) |
| Idiomas soportados | no disponible; el modelo base declara OCR en 32 idiomas y capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-8B-Instruct es un transformer denso que combina un codificador visual ViT con un decoder de lenguaje, unidos mediante fusión profunda de características (DeepStack) y codificaciones posicionales Interleaved-MRoPE que asignan frecuencias de forma completa sobre tiempo, ancho y altura. Incorpora además alineación texto-timestamp para localización temporal precisa de eventos en vídeo. El resultado es un modelo capaz de procesar imágenes, vídeo de horas de duración y texto largo con recuperación completa dentro de la ventana de contexto.

El proceso de este checkpoint concreto no es un entrenamiento supervisado al uso. El autor describe una edición de pesos sin gradientes (*weight-space programming*) ejecutada por un agente LLM que reescribió tres tensores del modelo base (revisión `0c351dd`). El desarrollo utilizó únicamente los datos de entrenamiento de VLGuard y un presupuesto de 500 pasadas forward, de las cuales se consumieron 83. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO adicionales. Todos los ficheros distintos de esos tres tensores son los originales de Qwen, por lo que las innovaciones técnicas del modelo base (decodificación visual, grounding 2D/3D, agente visual) se mantienen intactas.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes, vídeo y documentos.
- Comprensión visual avanzada: reconocimiento de objetos, celebridades, productos, landmarks, flora y fauna.
- OCR robusto en 32 idiomas, con tolerancia a baja iluminación, desenfoque, inclinación y caracteres raros o antiguos.
- Percepción espacial 2D y 3D: posiciones relativas, oclusiones y puntos de vista, con grounding para IA encarnada.
- Comprensión de vídeo de larga duración con indexación a nivel de segundo y localización temporal de eventos.
- Agente visual: reconoce elementos de interfaz, comprende funciones e invoca herramientas para operar GUIs de PC y móvil.
- Generación de código visual: produce Draw.io, HTML, CSS y JS a partir de imágenes o vídeos.
- Razonamiento STEM y matemático con análisis causal y respuestas basadas en evidencia.
- Soporte de tool calling y function calling heredado del modelo base.
- Capacidades multilingües de texto equiparables a LLMs puros, según la model card del base.
- Comportamiento de seguridad modificado por la edición WSP orientada a VLGuard (rechazo de contenido dañino), aunque el alcance exacto no está cuantificado en la información disponible.

## Casos de uso

- Moderación multimodal en plataformas de contenido: el modelo puede clasificar y rechazar imágenes o vídeos dañinos aprovechando el ajuste orientado a VLGuard, con contexto de 256K para revisar lotes grandes en una sola pasada.
- Automatización de atención al cliente con soporte visual: gestión de conversaciones multi-turno donde el usuario adjunta capturas o fotos, con contexto largo para mantener el historial completo de la sesión.
- Digitalización de documentos con OCR multilingüe: extracción de texto de facturas, contratos o manuscritos en 32 idiomas, incluyendo documentos degradados o inclinados, con parsing de estructura de documentos largos.
- Agente de operación de interfaces: automatización de tareas repetitivas en GUIs de escritorio o móvil mediante reconocimiento de elementos e invocación de herramientas, útil en testing de aplicaciones y RPA.
- Análisis de vídeo de vigilancia o auditoría: indexación temporal de eventos con precisión de segundo en grabaciones de horas, para búsqueda de incidentes concretos.
- Generación de prototipos UI a partir de bocetos: conversión de wireframes o capturas en HTML/CSS/JS o diagramas Draw.io, acelerando el handoff entre diseño y desarrollo.
- Asistencia en IA encarnada y robótica: grounding 3D y juicio de posiciones y oclusiones para planificación de manipulación en entornos físicos.
- Evaluación de seguridad de VLMs en investigación: caso de estudio de edición de pesos con agente automático para medir el impacto de tres tensores en el comportamiento de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos de este checkpoint en la información disponible. La model card del modelo base incluye gráficas comparativas de rendimiento multimodal y de texto puro para Qwen3-VL-4B y 8B (instrucción), pero no se proporcionan valores numéricos en el texto disponible, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 17,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para inferencia cómoda con contexto moderado.
- VRAM en cuantización de 8 bits: en torno a 9-10 GB de pesos, viable en GPUs de 16 GB.
- VRAM en cuantización de 4 bits: en torno a 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB, aunque con posible degradación en tareas visuales finas.
- GPUs recomendadas: A100 40/80 GB o H100 para contexto largo (256K-1M) y vídeo; RTX 4090 (24 GB) para bfloat16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en bfloat16 con contexto recortado, y en RTX 3060/4060 Ti de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (versión de desarrollo, ya que la 4.57.0 no estaba publicada según la model card), con soporte recomendado de FlashAttention 2; vLLM y TGI para serving si incorporan soporte de Qwen3-VL; llama.cpp/Ollama solo si existe conversión GGUF, no confirmada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Adeely93/vlgaurd_only_qwen_8b_adeel | 8,77B | 256K (1M ampliable) | Apache 2.0 | Edición WSP de 3 tensores sobre Qwen3-VL-8B-Instruct, orientada a seguridad VLGuard |
| Qwen/Qwen3-VL-8B-Instruct | 8,77B | 256K (1M ampliable) | Apache 2.0 | Modelo base original, sin modificación de seguridad; referencia directa |
| Qwen3-VL-4B-Instruct | ~4B | 256K (1M ampliable) | Apache 2.0 | Variante menor de la misma familia, menor VRAM y menor capacidad |
| Qwen3-VL MoE (variantes) | no disponible | 256K (1M ampliable) | Apache 2.0 | Alternativa MoE de la familia para despliegue en la nube con mayor throughput |

La comparación con modelos de otras familias (Llama 3.2 Vision, InternVL, etc.) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente de que este no es el modelo original de Qwen; cualquier evaluación debe tener en cuenta la modificación de pesos.
- La edición afecta solo a tres tensores mediante un agente automático; el alcance real del cambio de comportamiento de seguridad no está cuantificado ni validado con benchmarks en la información disponible.
- Riesgo de que la modificación de seguridad degrade capacidades generales o introduzca rechazos excesivos (*over-refusal*) en consultas benignas; no hay datos que lo confirmen o descarten.
- Riesgo de alucinación inherente a los VLM de 8B, especialmente en OCR de documentos degradados y en razonamiento espacial 3D.
- Idiomas soportados no declarados en este checkpoint; el OCR cubre 32 idiomas según el modelo base, pero no se garantiza paridad en todas las lenguas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo editado en producción.
- El repositorio tiene 2 descargas y 0 likes, sin validación comunitaria; no se recomienda su uso en producción sin auditoría propia.
- El contexto de 1M es ampliable según el modelo base, pero no se confirma que la edición WSP preserve ese comportamiento en la práctica.
- Ausencia de información sobre cuantizaciones publicadas (GGUF, AWQ, GPTQ) limita el despliegue en hardware consumer sin conversión manual.

## Enlaces

- Hugging Face: https://huggingface.co/Adeely93/vlgaurd_only_qwen_8b_adeel
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Qwen Chat: https://chat.qwenlm.ai/
- Paper Qwen3-VL (referencia arXiv 2505.09388): https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL (referencia arXiv 2502.13923): https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL (referencia arXiv 2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (referencia arXiv 2308.12966): https://arxiv.org/abs/2308.12966
- Repositorio transformers: https://github.com/huggingface/transformers
- Diagrama de arquitectura Qwen3-VL: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_arc.jpg
