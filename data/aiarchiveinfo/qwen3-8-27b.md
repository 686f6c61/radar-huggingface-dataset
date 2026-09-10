# AIArchiveInfo/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por la familia Qwen y publicado originalmente bajo la licencia Apache-2.0. El repositorio que se documenta aquí, `AIArchiveInfo/Qwen3.8-27B`, es un espejo de preservación byte-idéntico del modelo original `Qwen/Qwen3.8-27B` en la revisión `1d4bf0f2ff60`, archivado por AIArchiveInfo. Los pesos no han sido entrenados, ajustados ni modificados: se conservan exactamente como los publicó el autor original.

Se trata de un modelo denso de 27.781.427.952 parámetros (~27.8B), con una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) y atención gated (Gated Attention), junto con una componente de visión nativa. Su longitud de contexto nativa es de 262.144 tokens, ampliable hasta 1.000.000 tokens. Está orientado a tareas complejas de codificación, trabajo profesional, investigación, agentes autónomos y comprensión de imagen y vídeo. Es la generación más capaz de la familia Qwen hasta la fecha, según la información de la model card, y se presenta como un modelo compacto y desplegable con control flexible de razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; layout híbrido: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (~27.8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-27B es un modelo denso híbrido con un codificador de visión integrado. El bloque principal se repite 16 veces y dentro de cada bloque hay una secuencia de tres bloques de Gated DeltaNet seguidos de FFN, y después un bloque de Gated Attention seguido de FFN. El Gated DeltaNet utiliza 48 cabezas lineales para V y 16 para QK, con una dimensión de cabeza de 128. El Gated Attention emplea 24 cabezas para Q y 4 para KV, con una dimensión de cabeza de 256 y una dimensión de RoPE de 64. La capa de FFN tiene una dimensión intermedia de 17.408 y la salida LM se proyecta sobre un embedding de 248.320 tokens (con padding).

El modelo se entrenó en dos etapas, preentrenamiento y postentrenamiento, según indica la model card. Incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, una técnica pensada para mejorar la eficiencia de decodificación y la coherencia en la generación. No se detallan en la información disponible la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La extensión de contexto de 262.144 tokens a 1.000.000 está disponible en la versión alojada de Qwen Cloud, pero no se especifica el método de extrapolación.

## Capacidades

- Generación de texto y razonamiento con mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte.
- Comprensión de imagen y vídeo de forma nativa: interpreta diagramas STEM, documentos y vídeos de hasta horas de duración.
- Control flexible de pensamiento: el modo de razonamiento está activado por defecto, se puede desactivar por petición, la profundidad del razonamiento se ajusta con el parámetro `reasoning_effort` y el contexto de razonamiento histórico se conserva con `preserve_thinking`.
- Ejecución agéntica: planificación autónoma y manejo de feedback del entorno, lo que mejora la fiabilidad en tareas de múltiples pasos.
- Soporte de herramientas y agentes: compatible con harnesses y herramientas de desarrollo populares, incluyendo Transformers, vLLM, SGLang y TokenSpeed. La versión alojada de Qwen Cloud ofrece herramientas oficiales integradas.
- Multi-Token Prediction entrenado con múltiples pasos, que acelera la decodificación y puede mejorar la calidad de la generación.

## Casos de uso

- Asistente de investigación para documentos técnicos: el modelo analiza diagramas STEM, gráficos y documentos científicos, y al disponer de 262.144 tokens de contexto puede procesar informes largos y extraer conclusiones de forma coherente.
- Agente autónomo para tareas de software: su capacidad de planificación y manejo de feedback del entorno permite usarlo como agente que modifica código, ejecuta tests, interpreta errores y reorganiza su estrategia en bloques de tareas de larga duración.
- Análisis de vídeo de vigilancia o material de archivo: la comprensión de vídeos de larga duración facilita la generación de resúmenes, la detección de eventos y la transcripción de contenido visual sin necesidad de dividir el vídeo en fragmentos pequeños.
- Generación de código en producción: las mejoras en coding y la compatibilidad con vLLM permiten integrar el modelo en pipelines CI/CD para autocompletar, revisar y refactorizar código, aprovechando el MTP para reducir la latencia de salida.
- Atención al cliente multimodal: el modelo responde preguntas sobre capturas de pantalla, manuales y diagramas de flujo, combinando la información visual con un contexto conversacional amplio, ideal para entornos de soporte.
- Automatización de procesos de negocio: en tareas de back-office, el modelo ejecuta planes de varios pasos, consulta documentos y responde a condiciones del entorno, lo que lo hace adecuado para workflows con datos heterogéneos.
- Tutoría técnica o formación: con el modo de razonamiento ajustable, puede explicar conceptos complejos paso a paso, activando o desactivando la introspección según la profundidad deseada por el estudiante.

## Benchmarks y rendimiento

No se han publicado resultados numéricos completos de benchmarks en la información disponible. La model card incluye una tabla comparativa de rendimiento en texto que enfrenta a Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, en categorías como Coding, Professional, Research y Agentic. Sin embargo, el extracto de la model card que se ha recibido se corta antes de mostrar los valores concretos, por lo que no es posible reproducir cifras ni comparar numéricamente el modelo con otras alternativas.

## Requisitos de hardware

- Estimación de VRAM para FP16: los pesos en safetensors ocupan aproximadamente 55.6 GB, por lo que se necesita una GPU con al menos 55 GB de VRAM disponibles, más espacio para cache KV y activaciones. En la práctica, una A100 80GB o una H100 80GB son suficientes.
- Estimación para cuantización INT8: alrededor de 27 GB de VRAM, lo que permite desplegar el modelo en una GPU de 32 GB, como una RTX A6000 o una A100 40GB.
- Estimación para cuantización INT4: alrededor de 14 GB de VRAM, lo que habilita el despliegue en una RTX 4090 de 24GB o en GPUs de gama alta para consumidores.
- Opciones de despliegue: el modelo es compatible con vLLM, SGLang, TokenSpeed y Hugging Face Transformers. También está disponible una versión alojada en Qwen Cloud, que ofrecerá 1M de contexto y herramientas integradas.
- Latencia y throughput: no disponible en la información proporcionada.

Estos requisitos son estimaciones derivadas del tamaño de los pesos y no constituyen cifras oficiales proporcionadas por el autor.

## Comparativa con modelos similares

La model card menciona una comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se dispone de sus especificaciones técnicas ni de los resultados numéricos en la información proporcionada. Por tanto, no se puede elaborar una comparativa detallada.

| Modelo | Parametros | Contexto | Licencia |
|---|---|---|---|
| Qwen3.8-27B | 27.781.427.952 | 262.144 nativo (1M extensible) | Apache-2.0 |
| Qwen3.6-27B | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Se desconoce la composición de los datos de entrenamiento, lo que impide evaluar posibles sesgos lingüísticos o culturales específicos.
- No hay información sobre el riesgo de alucinación ni sobre métricas de seguridad publicadas por el autor en el extracto disponible.
- La licencia Apache-2.0 permite uso comercial, pero el repositorio es un espejo gestionado por AIArchiveInfo: los créditos y la responsabilidad original corresponden a Qwen.
- El modo de pensamiento activado por defecto puede incrementar el coste de inferencia y la latencia en comparación con modelos sin este modo.
- La extensión a 1.000.000 tokens se menciona como una capacidad de la versión alojada en Qwen Cloud; su disponibilidad en despliegues locales puede requerir ajustes adicionales.
- No se especifican los idiomas soportados, por lo que el comportamiento fuera de inglés o chino debe validarse en el caso de uso concreto.
- Para producción, se recomienda evaluar el modelo con datos propios y comparar la fiabilidad en tareas agénticas antes de una adopción amplia.

## Enlaces

- https://huggingface.co/AIArchiveInfo/Qwen3.8-27B
- https://huggingface.co/Qwen/Qwen3.8-27B
- https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- https://www.qwencloud.com/models/qwen3.8-27b
