# draganjankovic1975/Qwen3.8-27B-Uncensored-MLX

## Resumen

Qwen3.8-27B-Uncensored-MLX es una compilación en formato MLX de Qwen/Qwen3.8-27B, un modelo denso de 27.356.728.560 parámetros desarrollado originalmente por el equipo Qwen (Alibaba) y adaptado aquí por draganjankovic1975 como espejo del trabajo de orcarouter. La modificación principal es una *abliteración*: se ha eliminado la dirección de rechazo del flujo residual, de modo que el modelo deja de negarse a responder peticiones que el modelo base rechazaría. Se distribuye en cuatro precisiones (2, 4, 6 y 8 bits) pensadas específicamente para Apple Silicon.

La arquitectura es un transformer denso con atención híbrida (Gated DeltaNet lineal combinada con atención completa), cabeza MTP (multi-token prediction) y torre de visión nativa, lo que lo convierte en un modelo vision-language capaz de procesar imagen y texto. Incorpora control de modo *thinking*, soporte de function calling y capacidades de razonamiento multi-paso. El contexto declarado en la información disponible no está especificado de forma explícita.

Su relevancia actual es doble: por un lado, ofrece a investigadores en seguridad de IA y *red teaming* una variante sin alineamiento de seguridad para estudiar mecanismos de rechazo; por otro, su empaquetado MLX con cuantización por grupos (group size 64) y torre de visión preservada en BF16 facilita la ejecución local en hardware Apple. La licencia Apache 2.0 se hereda del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), cabeza MTP y torre de visión |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 2, 4, 6 y 8 bits (afín, group size 64); visión, normas y convoluciones en BF16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); subcarpetas por precisión, 4-bit también en la raíz del repo |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con atención híbrida: capas de Gated DeltaNet (atención lineal) combinadas con capas de atención completa, lo que reduce el coste computacional en secuencias largas manteniendo la calidad de recuperación de contexto. Incluye una cabeza MTP (multi-token prediction) que permite decodificación especulativa y mejora el throughput en inferencia. La torre de visión es nativa, integrada en el modelo, lo que habilita la modalidad image-text-to-text de forma directa sin adaptadores externos.

La variante aquí descrita aplica *abliteration*: una técnica que identifica la dirección en el espacio de activaciones asociada al comportamiento de rechazo y la ortogonaliza del flujo residual, eliminando la tendencia del modelo a negarse a responder. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La cuantización MLX se aplica únicamente a los pesos lineales del modelo de lenguaje (incluyendo `embed_tokens` y `lm_head`), manteniendo la torre de visión, las normas y las convoluciones en BF16 para preservar la calidad multimodal.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo *thinking* controlable.
- Comprensión de imagen y texto (image-text-to-text): descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación de código y matemáticas (capacidades heredadas del modelo base Qwen3.8-27B).
- Soporte de function calling y tool calling, apto para integración en pipelines de agentes.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Comportamiento sin alineamiento de seguridad: responde a peticiones que el modelo base rechazaría.
- Ejecución local en Apple Silicon mediante la librería MLX.

## Casos de uso

- Investigación en interpretabilidad de rechazo: estudiar cómo la abliteración altera las representaciones internas comparando activaciones con el modelo base, gracias a que se preservan las normas y la torre de visión en BF16.
- Red teaming y evaluación de robustez: generar ataques adversariales y prompts dañinos controlados para probar sistemas de moderación y filtros de seguridad antes de desplegarlos.
- Análisis de vulnerabilidades en código: usar el modelo como asistente de revisión de código en entornos aislados, aprovechando sus capacidades de generación de código y su ausencia de rechazo ante peticiones de análisis ofensivo.
- Procesamiento multimodal local en Mac: extraer información de capturas, diagramas o documentos escaneados con la torre de visión en BF16, sin enviar datos a la nube.
- Agentes autónomos de investigación: encadenar llamadas a herramientas mediante function calling en flujos multi-paso donde el modelo base se negaría a ejecutar ciertas acciones.
- Experimentos controlados de alineamiento: comparar la tasa de cumplimiento y la calidad de respuesta frente a Qwen3.8-27B original para cuantificar el efecto de la abliteración.
- Despliegue en LM Studio: cargar el 4-bit desde la raíz del repo para pruebas rápidas en un Mac con memoria unificada suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo completo ocupa 16,1 GB; el 4-bit en la raíz es la variante más ligera, mientras que el 8-bit requiere aproximadamente el doble de memoria que el 4-bit.
- Hardware objetivo: Apple Silicon (M-series) con memoria unificada; la librería MLX no está pensada para GPU NVIDIA.
- Para el 4-bit se recomienda un Mac con al menos 16-24 GB de memoria unificada; para el 8-bit, 32 GB o más.
- Opciones de despliegue: MLX (librería nativa), LM Studio (carga directa del 4-bit desde la raíz del repo) y herramientas compatibles con repos MLX de un solo modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-MLX (este) | 27,36 B | No disponible | Apache 2.0 | MLX (2/4/6/8-bit) | Abliterado, visión preservada en BF16 |
| Qwen/Qwen3.8-27B (base) | 27,36 B | No disponible | Apache 2.0 | Safetensors | Alineamiento intacto, sin cuantización MLX |
| orcarouter/Qwen3.8-27B-Uncensored-MLX (original) | 27,36 B | No disponible | Apache 2.0 | MLX | Mismo contenido; este repo es un espejo |

## Limitaciones y advertencias

- El alineamiento de seguridad ha sido sustancialmente eliminado: el modelo cumplirá peticiones dañinas, ilegales u ofensivas sin guardarraíles internos.
- Riesgo elevado de alucinación, especialmente en dominios donde el modelo base ya era propenso a inventar datos.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Uso restringido por el autor a investigación legítima (interpretabilidad, seguridad de IA, red teaming); el usuario asume toda la responsabilidad legal y ética.
- Es obligatorio añadir capas propias de moderación y prevención de abuso antes de cualquier despliegue en producción.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de alineamiento hace desaconsejable su uso comercial directo sin controles adicionales.
- La cuantización a 2 bits puede degradar notablemente la calidad; se recomienda 4-bit o superior para tareas de razonamiento.
- El repo es un espejo; posibles actualizaciones del original pueden no reflejarse aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/draganjankovic1975/Qwen3.8-27B-Uncensored-MLX
- Repositorio original: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card en OrcaRouter: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- Catálogo de modelos OrcaRouter: https://www.orcarouter.ai/models
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- GitHub de Continuum AI Corp: https://github.com/Continuum-AI-Corp
- Discord de OrcaRouter: https://discord.gg/yAh6Tex6kx
- X (Twitter) de OrcaRouter: https://x.com/OrcaRouter
