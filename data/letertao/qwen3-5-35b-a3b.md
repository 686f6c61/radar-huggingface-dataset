# letertao/Qwen3.5-35B-A3B

## Resumen

El modelo Qwen3.5-35B-A3B es un modelo multimodal de la familia Qwen3.5, desarrollado por Alibaba Qwen. Este repositorio en Hugging Face, subido por el usuario letertao, contiene los pesos del modelo post-entrenado, cuyo modelo base es Qwen/Qwen3.5-35B-A3B-Base. Combina un codificador visual con un modelo de lenguaje causal, lo que le permite procesar imágenes y texto de forma conjunta, y se presenta como una solución eficiente para tareas de razonamiento, codificación, agentes y comprensión visual.

Su arquitectura híbrida integra capas de Gated DeltaNet (atención lineal) con capas de atención gated y una capa sparse Mixture-of-Experts. Tiene 35.000 millones de parámetros en total, de los cuales solo 3.000 millones se activan por token, lo que reduce el coste computacional manteniendo un rendimiento comparable a modelos mucho más grandes. La ventana de contexto nativa es de 262.144 tokens y puede extenderse hasta 1.010.000 tokens.

La relevancia actual del modelo radica en su equilibrio entre capacidad y eficiencia, con soporte declarado de 201 idiomas y dialectos, y una licencia Apache-2.0 que permite su uso comercial. Está entrenado con técnicas de reinforcement learning a escala y predicción multi-token (MTP), lo que lo hace adecuado para entornos de producción y aplicaciones de agentes autónomos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model with Vision Encoder; híbrida Gated DeltaNet + sparse Mixture-of-Experts |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | 3 B (según model card) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la ficha de Hugging Face; la model card declara 201 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo combina un codificador de visión con un modelo de lenguaje causal. El bloque de lenguaje se organiza en 40 capas con la siguiente disposición: 10 veces la secuencia de 3 capas de Gated DeltaNet seguidas de MoE, y 1 capa de Gated Attention seguida de MoE. Las capas Gated DeltaNet utilizan 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; las capas Gated Attention usan 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y dimensión de rotary position embedding de 64. La capa MoE cuenta con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido por token, con dimensión intermedia de 512. El modelo incluye además predicción multi-token (MTP) entrenada con múltiples pasos.

La model card no especifica el número de tokens ni la composición del dataset de entrenamiento. Se indica que el entrenamiento incluye una etapa de preentrenamiento y postentrenamiento, con reinforcement learning escalado en entornos de millones de agentes y distribuciones de tareas progresivamente más complejas. También se destaca una eficiencia de entrenamiento multimodal cercana al 100% en comparación con el entrenamiento solo de texto, y un framework de RL asíncrono para escalar agentes. No se detalla el uso de RLHF o DPO; la información disponible menciona únicamente "scalable RL generalization".

## Capacidades

- Generación de texto y razonamiento: el modelo está diseñado para tareas de razonamiento, codificación y matemáticas, según los benchmarks destacados en la model card.
- Comprensión visual: al ser un modelo image-text-to-text, puede procesar imágenes y texto de forma conjunta, con un rendimiento que la model card sitúa por encima de modelos Qwen3-VL en razonamiento, codificación, agentes y comprensión visual.
- Soporte de agentes y razonamiento multi-paso: la model card menciona explícitamente el entrenamiento con RL en entornos de millones de agentes y la mejora en benchmarks de agentes.
- Capacidades multilingües: soporte declarado de 201 idiomas y dialectos.
- Contexto largo: ventana nativa de 262.144 tokens, extensible hasta 1.010.000 tokens.
- Tool calling / function calling: no se especifica explícitamente en la documentación disponible. La model card indica que la versión alojada (Qwen3.5-Flash) incluye herramientas integradas y que el modelo es compatible con endpoints, pero no confirma el soporte de function calling para este modelo concreto.

## Casos de uso

- Asistentes virtuales multilingües en atención al cliente: el modelo puede mantener conversaciones en 201 idiomas y manejar contextos de conversación muy largos, lo que permite recordar el historial completo de un cliente sin perder información.
- Análisis de documentos técnicos con imágenes: al combinar visión y texto, puede procesar informes con diagramas, capturas de pantalla, planos o gráficos. Útil en sectores como ingeniería, arquitectura o soporte técnico para extraer información de manuales escaneados.
- Generación de código y asistencia en desarrollo: la model card destaca su rendimiento en benchmarks de coding. Puede integrarse en IDEs o pipelines de CI/CD para autocompletar, revisar o refactorizar código, aprovechando el contexto largo para entender proyectos grandes.
- Agentes autónomos para automatización de flujos de trabajo: su entrenamiento con RL en entornos de agentes y su arquitectura MoE eficiente lo hacen adecuado para tareas de planificación multi-paso, como orquestar herramientas, consultar APIs o ejecutar scripts en entornos controlados.
- Sistemas de recuperación aumentada (RAG) sobre documentación extensa: la ventana de contexto de 262.144 tokens nativa, ampliable hasta 1.010.000, permite indexar manuales, bases de conocimiento o contratos completos sin necesidad de dividir el texto, mejorando la precisión de las respuestas.
- Traducción y localización de contenido: el soporte de 201 idiomas y dialectos permite traducir y adaptar contenido culturalmente, manteniendo coherencia en textos largos.
- Análisis de imágenes en entornos de investigación: puede describir o responder preguntas sobre imágenes científicas, gráficos de datos o figuras de artículos, combinando la comprensión visual con el razonamiento.

## Benchmarks y rendimiento

No se ha publicado una tabla completa de benchmarks en la información proporcionada. La model card incluye una tabla comparativa con GPT-5-mini, GPT-OSS-120B, Qwen3-235B-A22B, Qwen3.5-122B-A10B y Qwen3.5-27B, pero el texto extraído se corta antes de mostrar el valor correspondiente a Qwen3.5-35B-A3B. La model card también muestra una figura con resultados de benchmarks que no es accesible en texto. Por tanto, no se dispone de cifras concretas para este modelo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 71,9 GB en safetensors, lo que sugiere pesos en BF16. Para inferencia en BF16 se requieren aproximadamente 72 GB de VRAM solo para los pesos, más memoria para activaciones. Con cuantización a 4 bits, no especificada en la documentación, se podría reducir a unos 20 GB, pero este dato no está disponible.
- GPU recomendadas: para BF16, una A100 80GB o H100 80GB en una sola GPU; para contextos largos o batch alto, puede requerirse múltiples GPUs. En GPUs de consumo como la RTX 4090 24GB no es posible cargar los pesos completos en BF16; sería necesario cuantizar.
- Opciones de despliegue: la model card indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. También está disponible a través del servicio Qwen API (Alibaba Cloud Model Studio) en su versión Qwen3.5-Flash.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa técnica con alternativas de la misma categoría. La model card menciona comparaciones con GPT-5-mini, GPT-OSS-120B, Qwen3-235B-A22B, Qwen3.5-122B-A10B y Qwen3.5-27B, pero no se proporcionan sus especificaciones técnicas en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-35B-A3B | 35B total, 3B activo | 262k (hasta 1M) | Apache-2.0 | Hugging Face |
| GPT-5-mini | no disponible | no disponible | no disponible | no disponible |
| GPT-OSS-120B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-122B-A10B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: no se dispone de información sobre sesgos en la documentación proporcionada.
- Riesgo de alucinación: no documentado específicamente; como todo modelo generativo, puede producir contenido plausible pero incorrecto.
- Limitaciones de contexto o idioma: el contexto nativo es 262.144 tokens, pero la extensión a 1.010.000 puede requerir configuraciones específicas o el servicio alojado. La ficha de Hugging Face no lista idiomas, aunque la model card declara 201.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe revisarse la licencia del modelo base en Qwen/Qwen3.5-35B-A3B-Base.
- Caveat importante: este repositorio está subido por el usuario letertao, no por el equipo de Qwen. La model card es una copia de la documentación oficial de Qwen, pero no hay garantía de que los pesos sean exactamente los del modelo post-entrenado oficial. Se recomienda verificar la integridad del modelo antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/letertao/Qwen3.5-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Alibaba Cloud Model Studio: https://modelstudio.alibabacloud.com/
- Guía de usuario de Model Studio: https://www.alibabacloud.com/help/en/model-studio/text-generation
- Vast.ai: https://vast.ai/model/qwen35-35b-a3b
