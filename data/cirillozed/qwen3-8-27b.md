# CirilloZed/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión publicado por el desarrollador CirilloZed en Hugging Face bajo licencia Apache 2.0. La model card lo presenta como parte de la familia Qwen3.8, la generación más capaz de la serie de modelos abiertos Qwen, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y tareas agénticas de largo horizonte. Se trata de un modelo denso (no MoE) de aproximadamente 27.800 millones de parámetros, diseñado para ser desplegable en infraestructuras compactas.

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention) en un patrón híbrido repetido 16 veces, lo que reduce el coste computacional en contextos largos. El modelo soporta de forma nativa una ventana de contexto de 262.144 tokens, extensible hasta 1.000.000, e incorpora comprensión de imagen y vídeo, control flexible del modo de razonamiento y predicción multi-token (MTP).

Su relevancia actual radica en que ofrece capacidades agénticas y multimodales en un tamaño manejable para despliegue propio, con compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed, y con una licencia permisiva que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido de Gated DeltaNet (atención lineal) y Gated Attention |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo emplea un transformer causal con codificador de visión y un layout híbrido de 64 capas organizadas en 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La dimensión oculta es de 5120 y la dimensión intermedia de la FFN de 17.408. Las capas de Gated DeltaNet usan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. El embedding de tokens y la salida LM tienen 248.320 entradas (con padding).

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, e incluye MTP (Multi-Token Prediction) entrenado con múltiples pasos, una técnica que puede acelerar la decodificación. La model card menciona mejoras en planificación autónoma y manejo de retroalimentación del entorno, así como un modo de razonamiento configurable mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso específico de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto y desactivable por petición.
- Control de profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención de contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Programación y tareas de terminal agénticas (evaluado en Terminal Bench 2.1).
- Ejecución agéntica autónoma con planificación y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares.
- Predicción multi-token (MTP) para aceleración de inferencia.
- Capacidades multilingües: no detalladas en la información disponible.

## Casos de uso

- Automatización de tareas de programación en terminal: el modelo puede operar en entornos agénticos de línea de comandos, planificar pasos y reaccionar a la retroalimentación del entorno, lo que lo hace adecuado para pipelines de CI/CD y resolución autónoma de incidencias.
- Análisis de documentos técnicos y diagramas STEM: gracias a su codificador de visión nativo, puede extraer información de figuras, esquemas y documentos escaneados en flujos de investigación o ingeniería.
- Procesamiento de vídeo de larga duración: con soporte para vídeos de hasta una hora, es útil para resumen y análisis de reuniones, clases o material audiovisual extenso.
- Agentes de investigación de largo horizonte: la ventana de 262.144 tokens (extensible a 1M) permite mantener el estado de tareas complejas de múltiples pasos sin perder contexto.
- Asistencia profesional con razonamiento configurable: el parámetro `reasoning_effort` permite ajustar el coste computacional según la dificultad de la consulta, útil en aplicaciones de atención al cliente o consultoría automatizada.
- Despliegue propio en infraestructura controlada: su tamaño denso de ~27,8B y su compatibilidad con vLLM, SGLang y TokenSpeed facilitan servir el modelo en clústeres de GPU con requisitos de privacidad.
- Integración en herramientas de desarrollo: la compatibilidad con harnesses populares permite incorporarlo a asistentes de código y entornos de desarrollo existentes.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con los modelos Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero el contenido de la tabla está truncado en la información disponible y no permite extraer los valores numéricos de forma fiable. Por tanto:

No se han publicado resultados de benchmarks completos y legibles en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo denso de ~27,8B en precisión BF16 requiere aproximadamente 55,6 GB solo para los pesos (tamaño del repo), a lo que hay que sumar caché KV y overhead.
- GPU recomendadas: no especificadas en la información disponible.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; el tamaño de pesos en BF16 supera la VRAM de las GPU de consumo habituales, por lo que requeriría cuantización.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | ~27,8B (denso) | 262.144 nativos; hasta 1.000.000 | Apache 2.0 | Pesos en Hugging Face; API en Qwen Cloud (próximamente) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Mencionado como comparativa en la model card |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Mencionado como comparativa en la model card |
| Muse Glimmer-30B | ~30B (según nombre) | No disponible | No disponible | Mencionado como comparativa en la model card |
| Opus4.6 Max | No disponible | No disponible | No disponible | Mencionado como comparativa en la model card |

Los datos de rendimiento comparativo no son legibles en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, es susceptible de producir contenido incorrecto.
- Limitaciones de contexto o idioma: la lista de idiomas soportados no está disponible; el contexto nativo es de 262.144 tokens, con extensión a 1.000.000 que puede degradar el rendimiento si no se valida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar los términos exactos del repositorio y de los componentes derivados.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria; la tabla de benchmarks está truncada y no permite verificar el rendimiento real; el servicio Qwen Cloud está anunciado como "próximamente".
- La model card incluye afirmaciones de marketing sobre la familia Qwen que no están respaldadas por datos verificables en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/CirilloZed/Qwen3.8-27B
- Qwen Cloud (servicio alojado, próximamente): https://www.qwencloud.com
- Overview del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
