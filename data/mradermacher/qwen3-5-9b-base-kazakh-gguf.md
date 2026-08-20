# mradermacher/Qwen3.5-9B-Base-Kazakh-GGUF

## Resumen
Este repositorio contiene las cuantizaciones GGUF estáticas del modelo `issai/Qwen3.5-9B-Base-Kazakh`, una adaptación al kazajo del modelo base multimodal `Qwen/Qwen3.5-9B-Base` desarrollado por Alibaba. El modelo original combina una arquitectura híbrida de Gated Delta Networks y atención tradicional, lo que permite un alto rendimiento de inferencia y una ventana de contexto de hasta un millón de tokens. Al ser un modelo base, no está alineado para seguir instrucciones, sino que está diseñado para completar texto y servir como punto de partida para fine-tuning.

La relevancia de esta ficha radica en que ofrece a desarrolladores e investigadores una vía para desplegar un modelo de 9.080 millones de parámetros con capacidades multilingües (con énfasis en kazajo) en hardware de consumo, gracias a las distintas cuantizaciones GGUF proporcionadas (desde Q2_K hasta F16). El repositorio, creado por mradermacher, incluye múltiples formatos de cuantización para adaptarse a diferentes restricciones de memoria y requisitos de calidad.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Attention (multimodal) |
| Parametros totales | 9.083.826.688 (9,08 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 1.000.000 tokens (según el modelo base) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | Kazajo (deducido del nombre del repositorio; no especificado en la ficha) |
| Licencia | no disponible (la licencia del modelo base Qwen3.5-9B-Base es Apache 2.0, pero no se confirma en este repo) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo base `Qwen3.5-9B-Base` emplea una arquitectura híbrida que combina Gated Delta Networks (una variante de atención lineal) con mecanismos de atención tradicionales. Esta combinación está diseñada para ofrecer un alto rendimiento de inferencia y soportar una ventana de contexto extremadamente larga de hasta un millón de tokens. Además, es un modelo multimodal que integra procesamiento visual y lingüístico en una única arquitectura unificada.

La adaptación kazaja (`issai/Qwen3.5-9B-Base-Kazakh`) se ha obtenido mediante fine-tuning del modelo base sobre datos en kazajo, aunque no se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio GGUF de mradermacher se limita a proporcionar cuantizaciones estáticas del modelo ya adaptado, sin modificar sus pesos originales.

## Capacidades
- Generación de texto y finalización de secuencias: al ser un modelo base, completa texto de forma autónoma en lugar de seguir instrucciones conversacionales.
- Procesamiento multimodal: soporta entrada de texto e imágenes, lo que permite tareas de visión-lenguaje.
- Comprensión del lenguaje kazajo: adaptado específicamente para este idioma, aunque conserva capacidades multilingües del modelo original.
- Contexto largo: soporta hasta 1.000.000 de tokens, ideal para documentos extensos o conversaciones de múltiples turnos.
- No soporta tool calling ni function calling de forma nativa al ser un modelo base; requiere fine-tuning para habilitar estas capacidades.
- No incluye un modo "thinking" explícito ni capacidades de audio, ya que se centra en texto e imágenes.

## Casos de uso
- Fine-tuning para asistentes conversacionales en kazajo: los desarrolladores pueden partir de este modelo base y aplicar capas de alineación (SFT, DPO) para crear un chatbot específico para el mercado kazajo, aprovechando su contexto de 1M de tokens para gestionar historiales largos.
- Análisis de documentos legales o técnicos en kazajo: gracias a su ventana de contexto de 1M de tokens, puede procesar contratos, informes o manuales extensos sin necesidad de truncamiento, extrayendo información relevante.
- Prototipado de aplicaciones de visión-lenguaje en kazajo: al ser multimodal, puede utilizarse para tareas como descripción de imágenes o extracción de texto de documentos escaneados en kazajo, aunque requerirá fine-tuning para tareas específicas.
- Generación de contenido base para NLP en kazajo: sirve como generador de texto para tareas de aumento de datos, traducción automática o creación de corpus sintéticos en un idioma con pocos recursos.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K o Q4_K_S permiten ejecutar el modelo en GPUs de consumo con 6-8 GB de VRAM, facilitando la experimentación local.
- Investigación académica sobre modelos multilingües de baja frecuencia: permite estudiar el comportamiento de arquitecturas híbridas modernas en idiomas poco representados, comparando su rendimiento con modelos más grandes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks específicos para esta cuantización GGUF ni para la adaptación kazaja en la información disponible. El modelo base `Qwen3.5-9B` muestra una fiabilidad general del 83% en benchmarks agregados, pero su velocidad de inferencia se sitúa en el percentil 10, lo que indica un rendimiento relativamente lento en comparación con sus pares. No se dispone de datos concretos de MMLU, HumanEval o GSM8K para esta variante.

## Requisitos de hardware
- VRAM estimada para inferencia: depende de la cuantización. Q2_K requiere aproximadamente 3-4 GB, Q4_K_S entre 5-6 GB, Q8_0 entre 9-10 GB y F16 alrededor de 18 GB.
- GPU recomendadas: RTX 3060 12 GB para Q4_K_S, RTX 4090 para Q8_0, y A100 o H100 para F16.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_S o inferiores (Q2_K, Q3_K_M) se puede ejecutar en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para vLLM o TGI, es preferible convertir el modelo a safetensors o utilizar el repositorio original.
- Latencia y throughput: no disponible para esta cuantización específica, pero el modelo base presenta una velocidad baja (percentil 10) según Benchable, lo que sugiere tiempos de respuesta superiores a la media.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Idioma |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-9B-Base-Kazakh-GGUF | 9,08 B | 1M | no disponible | GGUF | Kazajo |
| issai/Qwen3.5-9B-Base-Kazakh | 9,08 B | 1M | no disponible | safetensors | Kazajo |
| Qwen/Qwen3.5-9B-Base | 9,08 B | 1M | Apache 2.0 | safetensors | Multilingüe |

La principal diferencia entre estas opciones radica en el formato de pesos y la adaptación lingüística. El repositorio GGUF es el único que permite despliegue directo en entornos de consumo con llama.cpp u Ollama, mientras que los safetensors requieren conversión o uso de frameworks como vLLM. La variante kazaja añade una capa de fine-tuning sobre el modelo multilingüe original, lo que mejora su rendimiento en kazajo a costa de una posible reducción en otros idiomas.

## Limitaciones y advertencias
- Modelo base sin alinear: no sigue instrucciones conversacionales; los desarrolladores deben aplicar su propia capa de alineación (SFT, RLHF) para casos de uso interactivos.
- Riesgo de alucinación y sesgos: al ser un modelo base, puede generar contenido factualmente incorrecto o reflejar sesgos presentes en los datos de entrenamiento originales.
- Licencia no confirmada: la licencia no está especificada en este repositorio GGUF. Aunque el modelo base Qwen3.5-9B-Base se distribuye bajo Apache 2.0, es imprescindible verificar la licencia de la adaptación kazaja antes de un uso comercial.
- Cobertura lingüística limitada: el kazajo es un idioma con menos recursos que el inglés, por lo que el rendimiento en tareas complejas puede ser inferior al de modelos entrenados principalmente en inglés.
- Tamaño del repositorio: el repo ocupa 58,7 GB debido a la inclusión de múltiples cuantizaciones. Se recomienda descargar únicamente el archivo GGUF necesario para evitar consumo innecesario de ancho de banda.
- Rendimiento de inferencia: el modelo base presenta una velocidad baja (percentil 10) según Benchable, lo que puede afectar a aplicaciones en tiempo real.

## Enlaces
- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/Qwen3.5-9B-Base-Kazakh-GGUF
- Modelo base en safetensors (adaptación kazaja): https://huggingface.co/issai/Qwen3.5-9B-Base-Kazakh
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha del modelo en ThinkLLM: https://thinkllm.dev/models/qwen3-5-9b-base
- Benchmarks del modelo en Benchable: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
