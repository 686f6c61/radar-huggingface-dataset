# andyu78945/Qwen3.8-27B

## Resumen
Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, distribuido en formato Hugging Face Transformers bajo el identificador andyu78945/Qwen3.8-27B. Según la model card, se presenta como la generación más capaz de la familia Qwen de modelos abiertos, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y flujos agénticos de largo horizonte. Es un modelo denso (no MoE) de aproximadamente 27.781 millones de parámetros reales según los safetensors, con un tamaño de repositorio de 55,6 GB.

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un diseño híbrido de 64 capas, e incorpora un codificador de visión para comprensión nativa de imágenes y vídeo. Dispone de contexto nativo de 262.144 tokens, extensible hasta 1.000.000, y de entrenamiento con Multi-Token Prediction (MTP). El modelo incorpora control flexible de razonamiento (thinking mode activable o desactivable por petición, con ajuste de profundidad mediante reasoning_effort y retención de contexto de razonamiento mediante preserve_thinking).

Su relevancia actual radica en que ofrece capacidades multimodales y agénticas en un tamaño compacto y desplegable, con licencia Apache 2.0, lo que facilita su integración en infraestructura propia. La model card menciona compatibilidad con Transformers, vLLM, SGLang y TokenSpeed, así como una futura versión alojada en Qwen Cloud con contexto de 1M por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con Vision Encoder; layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (27B según model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo es un transformer causal denso con codificador de visión, entrenado en dos fases (pre-entrenamiento y post-entrenamiento). La dimensión oculta es 5120, con 64 capas organizadas en un patrón repetido 16 veces: tres bloques de Gated DeltaNet (atención lineal) seguidos de un bloque de Gated Attention (atención completa). La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la Gated Attention emplea 24 cabezas para Q y 4 para KV con dimensión 256 y dimensión de RoPE de 64. La FFN tiene dimensión intermedia de 17.408, y el vocabulario (embedding y salida LM) es de 248.320 tokens con padding.

El entrenamiento incorpora Multi-Token Prediction (MTP) con múltiples pasos, lo que permite decodificación especulativa y aceleración de la generación. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO; esa información no está disponible. La innovación arquitectónica destacable es la combinación de atención lineal y atención completa en un mismo modelo, orientada a eficiencia en contextos largos, junto con el control flexible del razonamiento y la retención de contexto de pensamiento entre mensajes.

## Capacidades
- Generación de texto y razonamiento con modo de pensamiento (thinking mode) activado por defecto y desactivable por petición.
- Ajuste de profundidad de razonamiento mediante el parámetro reasoning_effort.
- Retención de contexto de razonamiento de mensajes históricos mediante preserve_thinking.
- Comprensión nativa de imágenes y vídeo (image-text-to-text), incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Programación y tareas de terminal agénticas (Agentic terminal coding).
- Ejecución agéntica autónoma: planificación y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares.
- Capacidades multilingües: no detalladas en la información disponible.

## Casos de uso
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana nativa (extensible a 1M), manteniendo el hilo de la conversación y recuperando información de mensajes anteriores.
- Generación de código en producción: su rendimiento en Terminal Bench 2.1 y su soporte agéntico permiten integrarlo en pipelines de CI/CD y entornos de terminal para tareas de codificación asistida.
- Agentes autónomos de larga duración: la planificación autónoma y el manejo de retroalimentación del entorno lo hacen adecuado para tareas multi-paso que requieren completarse de extremo a extremo.
- Análisis de documentos técnicos y diagramas STEM: el codificador de visión permite extraer información de documentos, gráficos y diagramas científicos.
- Procesamiento de vídeo de larga duración: soporta vídeos de hasta una hora, útil para resumen y análisis de contenido audiovisual.
- Investigación y trabajo profesional: mejoras declaradas en investigación y tareas profesionales, con razonamiento ajustable según la profundidad requerida.
- Despliegue en infraestructura propia: con licencia Apache 2.0 y compatibilidad con vLLM, SGLang y TokenSpeed, puede servirse en clústeres propios sin dependencia de API externa.

## Benchmarks y rendimiento
La model card incluye una tabla comparativa con los modelos Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con categorías como Coding y el benchmark Terminal Bench 2.1 (Terminus). Sin embargo, los valores numéricos de la tabla no están disponibles en la información proporcionada (el contenido se corta antes de mostrar las puntuaciones). No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo denso de 27B en FP16 requiere aproximadamente 55 GB de pesos, y en cuantizaciones de 8 bits o 4 bits reduciría proporcionalmente el requisito, aunque no se confirman los formatos de cuantización soportados.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar GPU de clase A100/H100 para FP16, pero no se confirma en la información.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed según la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262.144 nativo, hasta 1.000.000 | Apache 2.0 | Hugging Face (transformers) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Referenciado en benchmarks |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Referenciado en benchmarks |
| Muse Glimmer-30B | 30B (según nombre) | No disponible | No disponible | Referenciado en benchmarks |
| Opus4.6 Max | No disponible | No disponible | No disponible | Referenciado en benchmarks |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la model card los menciona pero las puntuaciones no se incluyen en el extracto.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir contenido incorrecto, especialmente en tareas de razonamiento largo.
- Limitaciones de contexto o idioma: el contexto nativo es de 262.144 tokens; la extensión a 1.000.000 se indica como posible pero no se detalla el método ni la degradación asociada. Los idiomas soportados no están especificados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar los términos exactos y las licencias de componentes (codificador de visión, tokenizador) antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (27 de noviembre de 2026), lo que sugiere que podría tratarse de una publicación reciente o no verificada por la comunidad.
- La model card menciona una versión alojada en Qwen Cloud "coming soon"; no hay confirmación de disponibilidad del servicio.
- No se dispone de información sobre cuantizaciones oficiales, por lo que el despliegue en hardware limitado requiere validación propia.

## Enlaces
- Hugging Face: https://huggingface.co/andyu78945/Qwen3.8-27B
- Qwen Cloud (modelo): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio): https://www.qwencloud.com
