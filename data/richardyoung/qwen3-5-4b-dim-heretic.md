# richardyoung/Qwen3.5-4B-DiM-heretic

## Resumen

Qwen3.5-4B-DiM-heretic es una versión "decensored" (abliterada) del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario richardyoung mediante la herramienta Heretic v2.0.0. El objetivo de esta variante es eliminar los mecanismos de rechazo del modelo original: segun la model card, las negativas caen de 99/100 en el modelo base a 30/100 en esta versión, con una divergencia KL de 0.0539 respecto al original. El proceso es reproducible, ya que el autor incluye los parámetros de abliteración y un directorio `reproduce` con instrucciones.

El modelo base, Qwen3.5-4B, es un modelo causal de lenguaje con codificador de visión desarrollado por el equipo Qwen (Alibaba). Emplea una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención con compuertas y una red feed-forward de tipo sparse Mixture-of-Experts, con 32 capas, dimensión oculta de 2560 y una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 010 000. El modelo cuenta con 4 539 265 536 parámetros según los pesos en safetensors.

La relevancia de esta ficha radica en dos frentes: por un lado, documenta una arquitectura híbrida eficiente de tamaño medio con capacidades multimodales y contexto muy largo; por otro, advierte de que se trata de un modelo modificado para reducir rechazos, con las implicaciones éticas y de seguridad que ello conlleva para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida Gated DeltaNet + Gated Attention + FFN (MoE sparse) |
| Parametros totales | 4 539 265 536 (~4,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 010 000 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base es compatible con vLLM, SGLang y KTransformers) |
| Idiomas soportados | 201 idiomas y dialectos segun la model card del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension oculta | 2560 |
| Capas | 32 (8 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN))) |
| Cabezas de atencion | 16 Q / 4 KV, dimension 256; Gated DeltaNet: 32 cabezas V y 16 QK, dimension 128 |
| Dimension intermedia FFN | 9216 |
| Embedding / salida | 248 320 (padded, atado) |
| MTP | entrenado con multi-steps |
| Tamano del repo | 9,1 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida: ocho bloques compuestos por tres capas de Gated DeltaNet (atención lineal con estado recurrente) seguidas de una capa de Gated Attention (atención completa con compuertas), cada una seguida de su FFN. Esta combinación busca reducir el coste computacional de la atención en contextos muy largos manteniendo la capacidad expresiva de la atención completa. El modelo incorpora además un codificador de visión con fusión temprana de tokens multimodales, lo que le permite procesar imágenes y texto de forma conjunta desde el preentrenamiento.

Segun la model card, el entrenamiento incluye preentrenamiento y postentrenamiento, con escalado de reinforcement learning sobre entornos multiagente y distribuciones de tareas progresivamente complejas. El modelo se entrenó con multi-token prediction (MTP) en varios pasos. La variante heretic aplica abliteración por capas sobre las proyecciones `attn.o_proj` y `mlp.down_proj`, con pesos y posiciones concretas documentados en la model card, lo que permite reproducir la modificación. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento en contexto largo, con ventana nativa de 262 144 tokens y extensión hasta 1 010 000.
- Comprensión de imágenes y texto (pipeline image-text-to-text) gracias al codificador de visión con fusión temprana.
- Generación de código y resolución de problemas matemáticos, según los benchmarks del modelo base.
- Capacidades de agente y razonamiento multi-paso, reforzadas mediante RL a escala en entornos multiagente.
- Soporte multilingüe amplio: 201 idiomas y dialectos segun la model card.
- Compatibilidad con tool calling / function calling (heredada del modelo base Qwen3.5; no se detalla explícitamente en la información proporcionada).
- Modo "thinking" en las variantes del modelo base (Qwen3.5-*-Thinking); no se confirma si esta variante lo conserva.
- Reducción significativa de rechazos (30/100 frente a 99/100 del original), orientada a usos sin filtros de contenido.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteración comparando respuestas con el original y midiendo la divergencia KL (0.0539) y la tasa de rechazos.
- Procesamiento de documentos largos con imágenes: informes, contratos o expedientes de cientos de miles de tokens que combinan texto y figuras, aprovechando el contexto de 262 144 tokens.
- Análisis de imágenes en pipelines de accesibilidad: descripción automática de contenido visual y generación de texto alternativo en aplicaciones con requisitos de contexto amplio.
- Generación de código en entornos controlados: el modelo soporta tool calling y puede integrarse en pipelines de CI/CD para tareas de refactorización o generación de tests, aunque su reducido tamaño limita la complejidad abordable.
- Asistencia conversacional multilingüe: atención al cliente en 201 idiomas con conversaciones multi-turno largas, gracias a la ventana de contexto extendida.
- Experimentación con modelos pequeños multimodales: despliegue en una sola GPU consumer para prototipos de agentes que combinan visión y razonamiento multi-paso.
- Creación de contenido sin restricciones en entornos de investigación creativa, asumiendo los riesgos de seguridad y las obligaciones legales del usuario.

## Benchmarks y rendimiento

La model card del autor incluye una comparación directa con el modelo original en métricas de abliteración:

| Metrica | Este modelo | Qwen/Qwen3.5-4B |
|---|---|---|
| Rechazos | 30/100 | 99/100 |
| Divergencia KL | 0.0539 | 0 (por definición) |

La model card del modelo base incluye una figura de benchmarks (MMLU-Pro, entre otros) que compara Qwen3.5-4B con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507 y Qwen3.5-9B. En la información disponible solo se muestra el valor de MMLU-Pro para GPT-OSS-120B (80,8); el resto de cifras no están completas en el texto extraído, por lo que no se reproducen aquí para no inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9-10 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contexto moderado.
- En cuantización de 8 bits: ~5 GB de pesos; en 4 bits: ~2,5-3 GB, aunque no se confirman formatos GGUF oficiales en la información disponible.
- GPU recomendadas: A100 40/80 GB o H100 para contexto máximo (262k-1M tokens) y despliegue con vLLM/SGLang; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090, 4080, 3090 y similares con cuantización; en GPUs de 8 GB solo con cuantización agresiva y contexto reducido.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, segun la model card del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-DiM-heretic | ~4,5 B | 262k (ext. 1M) | Sí | Apache 2.0 | Variante abliterada; rechazos 30/100 |
| Qwen/Qwen3.5-4B | ~4,5 B | 262k (ext. 1M) | Sí | Apache 2.0 | Modelo base; rechazos 99/100 |
| Qwen3.5-9B | ~9 B | no disponible | Sí | Apache 2.0 | Versión superior de la misma familia |
| Qwen3-30BA3B-Thinking-2507 | 30 B (MoE) | no disponible | no disponible | Apache 2.0 | Mayor capacidad, mayor coste |

## Limitaciones y advertencias

- La abliteración elimina parte de los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado; no debe desplegarse en aplicaciones de cara al público sin filtros adicionales.
- La divergencia KL de 0.0539 respecto al original indica una alteración medible de la distribución de salida que puede afectar a la calidad en tareas sensibles.
- Riesgo de alucinación inherente a modelos de ~4,5 B; la ventana de contexto larga no garantiza el uso correcto de toda la información.
- No se especifican los idiomas efectivamente soportados en esta variante concreta; la cifra de 201 idiomas corresponde al modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado sin filtros.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-05; no hay validación comunitaria independiente.
- No se dispone de información sobre cuantizaciones GGUF oficiales ni sobre el rendimiento real tras la abliteración en benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-DiM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
