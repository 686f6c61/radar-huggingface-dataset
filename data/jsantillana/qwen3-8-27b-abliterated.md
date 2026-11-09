# jsantillana/Qwen3.8-27B-abliterated

## Resumen

Qwen3.8-27B-abliterated es una variante "abliterated" (con el comportamiento de rechazo reducido mediante edición de pesos) del modelo Qwen3.8-27B, publicado en Hugging Face por el usuario jsantillana. El modelo base es un modelo de lenguaje causal denso de 27.000 millones de parámetros desarrollado por el equipo Qwen (Alibaba), con codificador de visión integrado y capacidad nativa de comprensión de imagen y vídeo. Esta variante concreta no incluye model card propia más allá de la del modelo original, por lo que la mayor parte de la información técnica procede de la ficha del modelo base.

El interés de esta publicación radica en dos factores: por un lado, Qwen3.8-27B es la generación más reciente de la familia abierta de Qwen, con mejoras sustanciales en código, tareas agénticas de horizonte largo y control flexible del razonamiento ("thinking mode"); por otro, la variante abliterated elimina parcialmente la tendencia del modelo a rechazar peticiones, lo que resulta relevante para investigadores que estudian alineamiento, robustez y comportamiento de rechazo en modelos de gran tamaño.

La arquitectura combina atención lineal (Gated DeltaNet) con atención clásica con RoPE (Gated Attention) en un esquema híbrido de 64 capas, con un contexto nativo de 262.144 tokens extensible hasta 1.000.000. El repositorio ocupa 55,6 GB y los pesos están en formato safetensors, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con codificador de visión |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la información proporcionada (el ecosistema abliterated suele distribuir GGUF en múltiples repositorios, pero no se confirma para esta publicación) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Otros datos técnicos del modelo base: dimensión oculta 5.120, 64 capas, embedding de tokens de 248.320 (con padding), FFN con dimensión intermedia 17.408, cabezas de atención lineal 48 (V) y 16 (QK) con dimensión 128, cabezas de atención con 24 (Q) y 4 (KV) con dimensión 256 y RoPE de 64 dimensiones. Incluye Multi-Token Prediction (MTP) entrenado con varios pasos.

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido poco habitual: 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`, es decir, tres capas de atención lineal por cada capa de atención completa con RoPE. La Gated DeltaNet reduce el coste computacional en contextos largos, mientras que las capas de atención clásica preservan la capacidad de recuperación exacta de información. El modelo incorpora además un codificador de visión que lo convierte en un modelo nativo imagen-texto (pipeline `image-text-to-text`), y una cabeza de predicción multi-token (MTP) que puede aprovecharse para decodificación especulativa.

El modelo base ha pasado por preentrenamiento y postentrenamiento, e incluye mecanismos de control del razonamiento: el modo "thinking" está activado por defecto, puede desactivarse por petición, y la profundidad del razonamiento se ajusta mediante el parámetro `reasoning_effort`, con retención del contexto de razonamiento histórico mediante `preserve_thinking`. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición del dataset en la información proporcionada.

En cuanto a la variante abliterated: según fuentes externas, la ablación se habría aplicado sobre las capas 18 a 51 (dejando el resto sin modificar), aunque esta información corresponde a otra publicación (huihui-ai) y no se confirma para el repositorio de jsantillana. Otra fuente menciona un pipeline de autodestilación LoRA iterativa de 10 rondas para reducir el rechazo, atribuido a otra variante (wangzhang). No hay información específica sobre el método exacto aplicado en esta publicación.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" configurable por petición.
- Codificación y tareas de ingeniería de software, incluyendo coding agéntico en terminal (Terminal Bench 2.1).
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución agéntica autónoma con planificación y manejo de retroalimentación del entorno.
- Compatibilidad con harnesses y herramientas de desarrollo populares (tool calling / function calling).
- Control flexible del razonamiento: `reasoning_effort` y `preserve_thinking`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Compatible con Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Investigación sobre alineamiento y rechazo: la variante abliterated permite estudiar cómo se distribuye la negativa a responder en las capas del modelo y evaluar técnicas de edición de pesos frente a métodos de alineamiento clásicos.
- Automatización de atención al cliente multi-turno: el contexto nativo de 262.144 tokens permite mantener historiales de conversación extensos y documentación de producto en la misma ventana sin técnicas de recuperación externa.
- Análisis de documentación técnica y diagramas: el codificador de visión permite procesar manuales, esquemas de arquitectura y diagramas STEM directamente, sin OCR previo.
- Coding agéntico en pipelines de CI/CD: con soporte de tool calling y planificación autónoma, puede integrarse en flujos que ejecutan comandos en terminal, interpretan la salida y corrigen errores de forma iterativa.
- Procesamiento de vídeo de larga duración: la ventana de 262k tokens y la comprensión nativa de vídeo permiten resumir o extraer información de grabaciones de hasta una hora.
- Investigación académica con contexto largo: análisis de corpus extensos, revisiones sistemáticas o correlación de documentos legales en una sola pasada.
- Despliegue en infraestructura propia: al ser denso y de 27B, es viable en una sola GPU de 80 GB en precisión reducida, lo que simplifica el despliegue frente a alternativas MoE de mayor tamaño.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero en la información disponible solo se muestra la cabecera y la categoría "Coding" con el benchmark Terminal Bench 2.1 (Terminus), sin los valores numéricos. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~55,6 GB en BF16/FP16 (tamaño del repositorio); ~28 GB en cuantización de 8 bits; ~14-16 GB en cuantización de 4 bits (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 para BF16 con contexto largo; L40S 48 GB o RTX 6000 Ada para cuantización de 8 bits.
- GPU de consumo: viable en RTX 4090 (24 GB) solo con cuantización de 4 bits y contexto reducido; en RTX 3090/4090 con 24 GB el contexto largo requerirá offloading o sharding.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed (según la model card del modelo base). No se confirma soporte de llama.cpp u Ollama para esta publicación concreta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-abliterated (esta publicación) | 27,78 B denso | 262.144 (ext. 1M) | Apache 2.0 | Variante abliterated; sin datos de benchmarks propios |
| Qwen3.8-27B (base) | 27 B denso | 262.144 (ext. 1M) | Apache 2.0 | Modelo original de Qwen; referencia de rendimiento |
| Qwen3.6-27B | 27 B denso | No disponible | Apache 2.0 (presumible) | Generación anterior; incluido en la tabla comparativa de la model card |
| Muse Glimmer-30B | 30 B | No disponible | No disponible | Alternativa de tamaño similar citada en la model card |

No se dispone de valores numéricos de benchmarks para establecer una comparación cuantitativa fiable entre estos modelos.

## Limitaciones y advertencias

- La ablación de rechazo puede degradar la seguridad del modelo: es esperable un aumento de respuestas a peticiones dañinas, lo que desaconseja su uso en producción orientada a usuarios finales sin capas adicionales de filtrado.
- No se dispone de información sobre sesgos específicos de esta variante; los sesgos del modelo base se heredan y pueden verse alterados por la edición de pesos.
- Riesgo de alucinación inherente a los modelos de 27B, especialmente en tareas de razonamiento largo y contextos muy extensos.
- Idiomas soportados no confirmados; el rendimiento fuera de inglés y chino puede ser inferior.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la variante no ofrece garantías sobre el comportamiento del modelo modificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria; la información sobre el método de ablación aplicado en esta publicación concreta no está documentada.
- El contexto extensible a 1.000.000 tokens no está garantizado en despliegues locales y suele requerir configuración específica y gran cantidad de VRAM.
- No se confirma la disponibilidad de cuantizaciones GGUF para esta publicación concreta, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/jsantillana/Qwen3.8-27B-abliterated
- Ficha de referencia abliterated (fuente externa, otra publicación): https://abliteratedmodels.org/qwen3.8-27b-abliterated/
- Ficha de referencia en Featherless (fuente externa, otra publicación): https://featherless.ai/models/wangzhang/Qwen3.8-27B-abliterated
- Qwen Cloud (servicio gestionado del modelo base): https://www.qwencloud.com/models/qwen3.8-27b
