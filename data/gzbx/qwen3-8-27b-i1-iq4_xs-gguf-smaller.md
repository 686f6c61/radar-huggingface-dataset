# gzbx/Qwen3.8-27B-i1-IQ4_XS-GGUF-Smaller

## Resumen

El modelo `gzbx/Qwen3.8-27B-i1-IQ4_XS-GGUF-Smaller` es una cuantización híbrida personalizada del modelo open-weight **Qwen3.8-27B** de Alibaba, publicada por el usuario gzbx en Hugging Face. Está diseñada específicamente para ejecutar el modelo en hardware con **16 GB de VRAM** (tarjetas de consumo como RTX 4080 o RTX 5080), manteniendo la calidad en tareas de razonamiento y código mediante una estrategia de compresión selectiva por tipo de capa.

La cuantización combina dos niveles: las capas de atención se mantienen en **IQ4_XS** para preservar la lógica y el razonamiento, mientras que las capas de la red feed-forward (FFN) se comprimen a **IQ3_S** para reducir el tamaño del archivo a aproximadamente **13.5 GB**. Este enfoque permite dejar espacio en VRAM para activar la predicción multi-token (MTP) y ampliar el contexto hasta 128k tokens en pruebas realizadas por el autor.

El modelo resultante está pensado para desarrolladores que necesitan ejecutar un LLM de 27B parámetros en GPUs de consumo sin sacrificar demasiado rendimiento en tareas técnicas. Es una alternativa a las cuantizaciones uniformes clásicas, con un equilibrio entre calidad y requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (del modelo base, safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el autor probó hasta 128k con MTP desactivado y 64k con MTP activo en 16 GB VRAM) |
| Tipos de cuantizacion | IQ4_XS (capas de atención), IQ3_S (capas FFN) |
| Idiomas soportados | no disponible (el modelo base Qwen soporta múltiples idiomas, pero no se especifica para esta cuantización) |
| Licencia | no disponible (el modelo base Qwen3.8-27B es Apache 2.0 según fuentes externas, pero la model card no lo indica) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-27B** es un transformer denso multimodal desarrollado por Alibaba, con pesos open-weight y licencia Apache 2.0 (confirmada en la búsqueda web). No se dispone de detalles sobre el número de capas, dimensiones o datos de entrenamiento en la información proporcionada. El modelo original destaca por su rendimiento en tareas de código, flujos agénticos y automatización de oficina, según el repositorio oficial de GitHub.

La cuantización `i1-IQ4_XS-GGUF-Smaller` se compiló con `llama.cpp` en su rama principal, utilizando una matriz de importancia (`imatrix`) proporcionada por cHunter789. El proceso emplea el comando `llama-quantize` con parámetros específicos para asignar `IQ4_XS` a las capas de atención y `IQ3_S` a las capas `ffn_down`, `ffn_up` y `ffn_gate`. Esta técnica de cuantización heterogénea busca proteger las partes del modelo responsables del razonamiento lógico, la codificación y el formato, a costa de una ligera pérdida en conocimiento general y memoria de contexto largo, tal como advierte el autor.

## Capacidades

- Generación de texto y razonamiento: el modelo conserva las capacidades de razonamiento del Qwen3.8-27B gracias a la cuantización alta en capas de atención.
- Codificación: adecuado para tareas de programación y depuración, según las indicaciones del autor.
- Soporte de predicción multi-token (MTP): el tamaño reducido del archivo permite activar MTP en hardware de 16 GB VRAM, mejorando la velocidad de generación.
- Posible soporte de tool calling y agentes: el modelo base Qwen3.8-27B es conocido por sus capacidades agénticas, pero esta cuantización no especifica si se conservan íntegramente.
- Multilingüismo: no confirmado para esta cuantización concreta, aunque el modelo base suele ser multilingüe.
- Limitación en conocimiento general y memoria de contexto largo: la compresión de FFN a IQ3_S reduce la retención de información factual y el rendimiento en tareas que requieren recordar detalles de un contexto extenso.

## Casos de uso

- Inferencia local en GPU de consumo: el archivo de 13.5 GB cabe en tarjetas con 16 GB de VRAM, como RTX 4080, RTX 5080 o equivalentes de laptop, permitiendo ejecutar un modelo de 27B parámetros sin necesidad de hardware profesional.
- Asistente de programación en local: gracias a la preservación de las capas de atención, el modelo mantiene una buena calidad en generación de código, explicaciones técnicas y refactorización, con la ventaja de no depender de servicios en la nube.
- Razonamiento multi-paso en entornos con recursos limitados: la cuantización permite usar MTP para acelerar la inferencia en tareas de lógica y matemáticas, alcanzando 50 t/s con 64k de contexto en una GPU equivalente a una RTX 5070 de escritorio.
- Prototipado de agentes conversacionales: el modelo puede servir como base para chatbots o asistentes con memoria de contexto amplia (hasta 128k sin MTP), aunque se debe tener en cuenta la posible pérdida de recall en contextos muy largos.
- Automatización de tareas de oficina: el modelo base está orientado a flujos de trabajo agénticos, por lo que esta cuantización puede emplearse en pipelines locales de generación de documentos, resúmenes o extracción de información.
- Experimentación con cuantizaciones híbridas: para investigadores interesados en técnicas de compresión por capas, este modelo sirve como ejemplo práctico de cómo combinar distintos niveles de cuantización para optimizar el uso de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y la búsqueda web no proporciona datos comparativos para esta cuantización específica. El autor solo reporta velocidades de inferencia observadas en su hardware de prueba: 50 t/s con 64k de contexto y MTP activado, y 30 t/s con 128k sin MTP, en una GPU de laptop RTX 5080 (equivalente a una RTX 5070 de escritorio).

## Requisitos de hardware

- VRAM estimada: 16 GB (el archivo GGUF ocupa 13.5 GB, dejando margen para MTP y contexto).
- GPU recomendadas: RTX 4080, RTX 5080, o cualquier tarjeta con 16 GB de VRAM. También puede funcionar en GPUs con 12 GB si se reduce el contexto o se desactiva MTP, aunque no está garantizado.
- Compatibilidad con consumer GPU: sí, es el objetivo principal del modelo.
- Opciones de despliegue: compatible con `llama.cpp` (compilado desde la rama principal), y por extensión con servidores basados en GGUF como `llama-server`, `Ollama` o `LM Studio` (si soportan cuantizaciones IQ). También podría usarse con `vLLM` si se convierte el formato, pero no está documentado.
- Latencia y throughput: en la prueba del autor, 50 t/s con 64k contexto y MTP, y 30 t/s con 128k contexto sin MTP, en una GPU de laptop RTX 5080.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano archivo | VRAM requerida | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.3B | no disponible (probado hasta 128k) | BF16 | ~55 GB | 56+ GB | Apache 2.0 |
| Qwen3.8-27B-i1-IQ4_XS-GGUF-Smaller (este) | 27.3B | hasta 128k (probado) | IQ4_XS + IQ3_S hibrido | 13.5 GB | 16 GB | no disponible |
| Qwen3.8-27B-IQ4_XS (cuantizacion uniforme) | 27.3B | no disponible | IQ4_XS uniforme | ~16 GB (estimado) | 18-20 GB (estimado) | no disponible |

No se dispone de datos de rendimiento comparativos entre estas variantes. La cuantización híbrida reduce el tamaño del archivo en comparación con una cuantización uniforme IQ4_XS, pero a costa de una posible pérdida de calidad en conocimiento general. El modelo base en BF16 requiere más de 56 GB de VRAM, por lo que esta variante es la única opción práctica para hardware de consumo.

## Limitaciones y advertencias

- Pérdida de conocimiento general y memoria de contexto largo: el autor advierte explícitamente que la compresión de las capas FFN a IQ3_S degrada la retención de información factual y el rendimiento en tareas que requieren recordar detalles de un contexto extenso, como la escritura creativa.
- No recomendado para escritura creativa: según la model card, si el uso principal es creativo, es preferible una cuantización uniforme IQ4_XS.
- Licencia no especificada en la model card: aunque el modelo base es Apache 2.0, no se confirma que esta cuantización herede esa licencia. Se debe verificar antes de un uso comercial.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje, y potencialmente mayor en contextos largos debido a la compresión de FFN.
- Soporte de vision no confirmado: el modelo base es multimodal, pero esta cuantización GGUF no indica si incluye los componentes de visión. Es probable que solo funcione con texto.
- Dependencia de la calidad de la matriz de importancia: el rendimiento de la cuantización depende de la `imatrix` usada, que en este caso proviene de un tercero (cHunter789) y puede no ser óptima para todos los casos de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gzbx/Qwen3.8-27B-i1-IQ4_XS-GGUF-Smaller
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de ejecución local: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Guía completa: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Referencia metodológica (lemonyins): https://huggingface.co/lemonyins/Qwen3.6-27B-uncensored-abliterated-i1-IQ4_XS-GGUF-Smaller
- Fuente de la imatrix (cHunter789): https://huggingface.co/cHunter789/Qwen3.8-27B-i1-IQ4_KS_KT-GGUF
