# NiuNiu0110/rst-qwen3.5-9b-ota-sft

## Resumen

El repositorio `NiuNiu0110/rst-qwen3.5-9b-ota-sft` contiene un ajuste fino (SFT) del modelo base `Qwen/Qwen3.5-9B-Base`, desarrollado por el usuario NiuNiu0110. La información técnica disponible en el repositorio corresponde al modelo base Qwen3.5-9B, ya que el repositorio de NiuNiu0110 no incluye una model card específica del proceso de ajuste fino. Por tanto, esta ficha describe el modelo base Qwen3.5-9B y señala explícitamente los datos que no están disponibles sobre el fine-tuning.

Qwen3.5-9B es un modelo causal de lenguaje con encoder de visión, desarrollado por el equipo Qwen de Alibaba. Integra una arquitectura híbrida eficiente que combina Gated Delta Networks con atención gated, y ha sido entrenado con técnicas de aprendizaje por refuerzo a gran escala. Ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens, y soporta 201 idiomas y dialectos. Su licencia es Apache-2.0, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No especificados en el repositorio; disponible en Ollama con cuantizaciones GGUF (tipos no detallados) |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

Qwen3.5-9B utiliza una arquitectura híbrida que alterna capas de atención lineal (Gated DeltaNet) con capas de atención gated estándar. Según el model card, la disposición de capas es `8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, lo que da un total de 32 capas. El Gated DeltaNet emplea 32 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128, mientras que la atención gated usa 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión intermedia de la red feed-forward es 12.288. Además, el modelo fue entrenado con predicción multi-token (MTP).

El entrenamiento incluye una etapa de preentrenamiento y otra de postentrenamiento, con refuerzo escalado en entornos de millones de agentes. El model card destaca una eficiencia de entrenamiento multimodal cercana al 100% en comparación con el entrenamiento solo de texto, y el uso de frameworks asíncronos de RL. No se han publicado datos concretos sobre el número de tokens de preentrenamiento ni la composición del dataset. En cuanto al ajuste fino de NiuNiu0110, no se dispone de información sobre el dataset, la técnica de optimización ni el número de pasos de entrenamiento.

## Capacidades

- Comprensión y generación multimodal: el modelo integra un encoder de visión y puede procesar imágenes junto con texto, superando según el model card a los modelos Qwen3-VL en razonamiento, codificación, agentes y comprensión visual.
- Razonamiento y codificación: el model card reporta mejoras en benchmarks de razonamiento y generación de código frente a generaciones anteriores de la familia Qwen.
- Contexto largo: ventana nativa de 262.144 tokens, ampliable hasta 1.010.000 tokens mediante técnicas de extensión de contexto.
- Multilingüismo: cobertura de 201 idiomas y dialectos, con conocimiento cultural y regional según el model card.
- Agentes y razonamiento multi-paso: el entrenamiento con RL en entornos de agentes sugiere capacidades para tareas de planificación y ejecución de múltiples pasos.
- Compatibilidad con frameworks de inferencia: el modelo es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers.
- Soporte de tool calling / function calling: no especificado en la documentación disponible; los frameworks compatibles (vLLM, SGLang) implementan esta funcionalidad, por lo que es probablemente utilizable.

## Casos de uso

- Análisis de documentación técnica: gracias a su encoder de visión y su ventana de contexto de 262k tokens, el modelo puede procesar manuales extensos que combinan texto y diagramas, extrayendo especificaciones o procedimientos.
- Asistente de programación en IDE: el modelo puede generar código, explicar fragmentos y razonar sobre errores, integrándose en herramientas como VS Code mediante APIs compatibles con vLLM o Transformers.
- Agentes autónomos de soporte: su capacidad de razonamiento multi-paso y su contexto largo permiten construir agentes que gestionan tareas complejas, como la resolución de incidencias en sistemas de TI, manteniendo el historial completo de la conversación.
- Moderación de contenido multilingüe: con soporte para 201 idiomas, el modelo puede analizar texto e imágenes en plataformas globales para detectar contenido inapropiado, reduciendo la necesidad de equipos humanos por idioma.
- Extracción de información de imágenes: en entornos empresariales, el modelo puede leer facturas, formularios o capturas de pantalla y convertirlos en datos estructurados, aprovechando su capacidad multimodal.
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo, interpretar imágenes adjuntas (por ejemplo, capturas de errores) y responder en múltiples idiomas, lo que lo hace adecuado para plataformas de soporte de nivel 1.
- Traducción y adaptación cultural: al estar entrenado con un amplio espectro de idiomas y dialectos, puede traducir textos manteniendo matices culturales, útil para localización de productos y contenido.

## Benchmarks y rendimiento

El model card incluye una tabla de benchmarks que se presenta truncada en la información disponible. Los datos completos que se han podido extraer corresponden a MMLU-Pro:

| Modelo | MMLU-Pro |
|---|---|
| GPT-OSS-120B | 80.8 |
| GPT-OSS-20B | 74.8 |
| Qwen3-Next-80B-A3B-Thinking | 82.7 |
| Qwen3-30BA3B-Thinking-2507 | 80.9 |
| Qwen3.5-9B | 82.5 |
| Qwen3.5-4B | 79.1 |

En MMLU-Pro, Qwen3.5-9B obtiene 82.5, superando a modelos más grandes como GPT-OSS-120B y GPT-OSS-20B, y situándose cerca de Qwen3-Next-80B-A3B-Thinking. No se han publicado en la información disponible resultados de otros benchmarks como HumanEval o GSM8K. La tabla original está incompleta, por lo que estos datos deben interpretarse como una muestra parcial.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 19,3 GB, por lo que se necesitan al menos 20-24 GB de VRAM para inferencia sin cuantización. Con cuantización de 4 bits, la VRAM requerida se reduce a unos 6-8 GB; con 8 bits, a unos 10-12 GB.
- GPU recomendadas: para FP16 sin cuantización, una NVIDIA A100 40GB o H100. Para cuantización 8-bit o 4-bit, una RTX 4090 24GB, RTX 3090 24GB o GPUs equivalentes con 16GB o más.
- Cabe en GPU de consumo: sí, con cuantización. Una RTX 4090 puede ejecutar el modelo en 4-bit o 8-bit con margen para el contexto.
- Opciones de despliegue: vLLM, SGLang, KTransformers, Hugging Face Transformers y Ollama. El enlace de Ollama confirma que existe una variante del modelo disponible en ese ecosistema.
- Latencia y throughput: no se han publicado datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

La información disponible no permite una comparativa completa con alternativas de la misma categoría. No obstante, a partir de los datos de benchmarks se puede comparar con otros modelos de la familia Qwen y con GPT-OSS:

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia |
|---|---|---|---|---|
| Qwen3.5-9B | 9.653.104.368 | 262.144 tokens | 82.5 | Apache-2.0 |
| Qwen3.5-4B | No disponible | No disponible | 79.1 | Apache-2.0 |
| GPT-OSS-20B | No disponible | No disponible | 74.8 | No disponible |

Qwen3.5-9B ofrece un mejor resultado en MMLU-Pro que GPT-OSS-20B y que Qwen3.5-4B, a pesar de tener un tamaño inferior al de GPT-OSS-20B. Sin embargo, no se dispone de datos de contexto, licencia ni parámetros para los modelos comparados, por lo que esta tabla debe interpretarse con cautela.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgos para el modelo base ni para el ajuste fino de NiuNiu0110.
- Riesgo de alucinación: el modelo puede generar respuestas incorrectas o inventadas, especialmente en dominios no cubiertos por los datos de entrenamiento. No se han publicado evaluaciones específicas de alucinación.
- Limitaciones de contexto: aunque la ventana nativa es de 262.144 tokens y se puede extender hasta 1.010.000, la calidad de la atención puede degradarse en los extremos de la ventana extendida. Es recomendable validar el rendimiento en el caso de uso concreto.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificación y redistribución. Sin embargo, el repositorio de NiuNiu0110 no documenta el dataset de ajuste fino, por lo que no se puede garantizar que el modelo resultante esté libre de sesgos o restricciones adicionales derivadas de los datos de entrenamiento.
- Advertencia para producción: al ser un ajuste fino sin documentación, se recomienda evaluar exhaustivamente el modelo en el dominio específico antes de desplegarlo. La ausencia de benchmarks propios impide conocer su rendimiento real frente al modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NiuNiu0110/rst-qwen3.5-9b-ota-sft
- Repositorio espejo en HuggingFace: https://huggingface.co/khazic/rst-qwen3.5-9b-ota-sft
- Modelo en Ollama: https://ollama.com/library/qwen3.5:9b
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
