# mradermacher/Ministral-3-8B-Instruct-2512-BF16-SOM-MPOA-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Ministral-3-8B-Instruct-2512-BF16-SOM-MPOA, una variante modificada del Ministral 3 8B de Mistral AI. El autor, mradermacher, es un desarrollador conocido por generar pesos cuantizados para inferencia eficiente en hardware local. El modelo base, publicado por 0xA50C1A1, incorpora las etiquetas "uncensored", "decensored" y "abliterated", lo que indica que se ha eliminado el rechazo a ciertos contenidos o instrucciones consideradas sensibles.

El modelo original de Mistral es un LLM compacto de 8.4 mil millones de parámetros con capacidades multimodales (texto y visión), diseñado para despliegue en entornos edge. Sin embargo, esta versión GGUF solo incluye el modelo de lenguaje, sin el encoder de visión, como se deduce de la ausencia de un archivo mmproj en el repositorio. Las cuantizaciones van desde IQ1_S (2,2 GB) hasta Q4_1 (5,5 GB), lo que permite ejecutar el modelo en GPUs con poca memoria.

La relevancia de este modelo radica en su tamaño contenido y su licencia Apache 2.0, que permite uso comercial sin restricciones. Al estar cuantizado, resulta accesible para desarrolladores que necesitan un LLM conversacional multilingüe en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer denso, pero no se especifica) |
| Parametros totales | 8.489.553.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1 |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en los datos proporcionados. La búsqueda web indica que el Ministral 3 8B original combina un modelo de lenguaje de 8,4B parámetros con un encoder de visión de 0,4B, pero esta cuantización GGUF no incluye el componente de visión. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Las etiquetas "abliterated" y "uncensored" sugieren que se ha aplicado una técnica de eliminación de rechazos (ablación de direcciones de comportamiento), pero el procedimiento exacto no está documentado en este repositorio.

## Capacidades

- Generación de texto conversacional en 11 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Modelo de tipo instruct, optimizado para seguir instrucciones y mantener diálogos multi-turno.
- Al ser una versión "abliterated", no presenta rechazos ante solicitudes que otros modelos censurarían (contenido sensible, opiniones controvertidas, etc.).
- No se ha confirmado soporte para tool calling, function calling ni razonamiento multi-step en la información disponible.
- No incluye capacidades de visión en esta cuantización GGUF, ya que carece del proyector multimodal.

## Casos de uso

- Chatbots locales para entornos con privacidad estricta: al ejecutarse en local con GGUF, los datos no salen del dispositivo. Adecuado para asistentes personales o de empresa que requieran confidencialidad.
- Asistentes multilingües de atención al cliente: su soporte para 11 idiomas permite desplegar un único modelo para atender consultas en varios mercados, con la ventaja de poder ajustar el tono sin restricciones de censura.
- Generación de contenido creativo sin filtros: escritores o creadores pueden usarlo para redactar borradores de ficción, guiones o diálogos donde se necesite explorar temas delicados sin limitaciones impuestas por el modelo.
- Traducción automática de textos largos: su capacidad multilingüe y contexto amplio (aunque no especificado) lo hace útil para traducir documentos extensos, siempre que la calidad sea suficiente para el caso.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden integrar el modelo en entornos de desarrollo mediante llama.cpp o Ollama para validar ideas antes de escalar a modelos más grandes.
- Educación y formación: sirve como herramienta de práctica para estudiantes de PLN que necesiten experimentar con un LLM de tamaño medio sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada: según la cuantización elegida, se necesitan entre 2,2 GB (IQ1_S) y 5,5 GB (Q4_1) para cargar los pesos. A esto hay que sumar memoria para el contexto y los cálculos intermedios.
- GPUs recomendadas: para las cuantizaciones más pequeñas (IQ1_S a IQ3_M) basta con una GPU de 4 GB como la GTX 1650 o RTX 3050. Para Q4_K_M (5,3 GB) se recomienda una RTX 3060 de 12 GB o superior para dejar margen.
- En GPUs consumer: sí, cabe en la mayoría de tarjetas modernas de gama media y alta (RTX 3060, RTX 4060, etc.) con cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier framework compatible con GGUF.
- Latencia y throughput: no se han proporcionado mediciones específicas. En una RTX 4090, un modelo de 8B cuantizado a Q4_K_M suele generar entre 30 y 60 tokens por segundo, pero estos valores son orientativos y dependen de la implementación y el hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente con otros modelos de la misma categoría. A nivel estructural, se puede comparar con:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ministral-3-8B (este) | 8,49B | no disponible | Apache 2.0 | GGUF en HF |
| Llama 3.1 8B | 8,03B | 128K | Llama 3.1 (uso comercial permitido) | GGUF, safetensors |
| Mistral 7B v0.3 | 7,25B | 32K | Apache 2.0 | GGUF, safetensors |
| Gemma 2 9B | 9,24B | 8K | Gemma (uso comercial permitido) | GGUF, safetensors |

La diferencia principal de este modelo frente a los demás es su carácter "uncensored" y su licencia Apache 2.0, que facilita la integración en productos comerciales sin cláusulas adicionales.

## Limitaciones y advertencias

- La naturaleza "abliterated" implica que el modelo puede generar contenido ofensivo, ilegal o éticamente cuestionable sin filtros. No es adecuado para aplicaciones dirigidas a menores o entornos regulados sin una capa de moderación externa.
- La cuantización degrada la calidad de las respuestas, especialmente en las versiones de menor tamaño (IQ1_S, IQ2_XXS). Se recomienda usar Q4_K_M o superior para tareas que requieran precisión.
- No se ha verificado la longitud de contexto real. Si el modelo base soporta una ventana larga, la cuantización puede afectar a la coherencia en contextos extensos.
- No se dispone de información sobre sesgos del modelo. Al ser una modificación de un modelo de Mistral, es probable que herede sesgos presentes en los datos de entrenamiento originales.
- La ausencia de benchmarks impide conocer su rendimiento real en tareas estándar; los usuarios deben validar el modelo con sus propios casos de uso antes de desplegarlo en producción.
- El modelo no incluye capacidades de visión, aunque el Ministral 3 8B original las tenga. Si se necesita procesamiento de imágenes, hay que usar la versión completa en safetensors.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/Ministral-3-8B-Instruct-2512-BF16-SOM-MPOA-i1-GGUF
- Modelo base original: https://huggingface.co/0xA50C1A1/Ministral-3-8B-Instruct-2512-BF16-SOM-MPOA
- Documentación oficial de Ministral 3 8B: https://docs.mistral.ai/models/ministral-3-8b-25-12
- Página del modelo en ModelScope: https://www.modelscope.cn/models/mistralai/Ministral-3-8B-Instruct-2512-BF16
