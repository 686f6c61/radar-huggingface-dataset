# qtum/Qwen3-30B-A3B-GGUF

## Resumen

El modelo `qtum/Qwen3-30B-A3B-GGUF` es una versión cuantizada en formato GGUF del modelo original `Qwen/Qwen3-30B-A3B`, desarrollado por el equipo de Qwen (Alibaba). Esta cuantización ha sido realizada por el usuario `qtum` utilizando `llama.cpp` con la opción de matriz de importancia (imatrix), calibrada con un conjunto de datos bilingüe (inglés y chino) y con alto contenido de código, lo que preserva mejor las capacidades de generación de código y de chino en cuantizaciones de baja precisión.

El modelo base es un transformer de arquitectura MoE (Mixture of Experts) con 30.532 millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token. Está diseñado para tareas de generación de texto y conversación, con soporte para inglés y chino. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

Esta versión GGUF está pensada para su ejecución local en herramientas como LM Studio, Ollama o directamente con `llama.cpp`, ofreciendo varios niveles de cuantización que permiten adaptar el modelo a diferentes capacidades de hardware, desde GPU de gama media hasta configuraciones de CPU con RAM abundante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | 3.000.000.000 (aprox., 3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, Q2_K |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `Qwen3-30B-A3B` es un transformer con arquitectura de mezcla de expertos (MoE). En cada capa, solo se activan un subconjunto de los parámetros (3B de los 30.5B totales), lo que permite una inferencia más rápida y eficiente en memoria que un modelo denso del mismo tamaño. Esta arquitectura es especialmente adecuada para despliegue en entornos con recursos limitados, manteniendo una calidad de generación cercana a modelos densos de mayor tamaño.

La versión cuantizada aquí presentada no ha sido entrenada desde cero; es una conversión del modelo original a formato GGUF mediante `llama.cpp` (commit `9a3bf2b`). El proceso de cuantización utiliza la técnica imatrix (importance matrix) con un conjunto de calibración bilingüe (inglés y chino) y orientado a código, lo que mejora la retención de habilidades de codificación y de idioma chino en comparación con calibraciones solo en inglés. No se han publicado detalles adicionales sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento y resolución de problemas matemáticos (heredado del modelo base, aunque no se especifican detalles).
- Generación de código en múltiples lenguajes de programación, favorecida por la calibración con dataset de código durante la cuantización.
- Soporte de formato de prompt tipo ChatML (`<|im_start|>`, `<|im_end|>`), compatible con la mayoría de frameworks de chat.
- Capacidades de tool calling y function calling: no confirmadas explícitamente en esta ficha, pero el modelo base Qwen3 es conocido por soportarlas; se recomienda verificar en la documentación del modelo original.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Chatbot local para soporte técnico: el modelo puede gestionar conversaciones multi-turno en inglés y chino, adecuado para asistentes virtuales en entornos con privacidad de datos, gracias a su tamaño reducido y a la posibilidad de ejecutarse en una GPU de consumo.
- Generación de código en entornos de desarrollo: con la cuantización calibrada para código, puede usarse como autocompletado o asistente de programación en editores, integrándose mediante `llama.cpp` o herramientas compatibles.
- Traducción y procesamiento de texto bilingüe (inglés-chino): su soporte nativo para ambos idiomas lo hace útil para tareas de traducción automática o generación de contenido multilingüe.
- Análisis de documentos y extracción de información: puede procesar grandes volúmenes de texto (con la limitación del contexto, que no se especifica) para resumir, clasificar o extraer entidades.
- Prototipado rápido de aplicaciones de IA: al ser un modelo GGUF, puede desplegarse fácilmente en entornos de desarrollo con Ollama o LM Studio, permitiendo iterar sobre prompts y flujos de trabajo sin necesidad de infraestructura en la nube.
- Educación e investigación: su licencia Apache-2.0 y su disponibilidad en múltiples cuantizaciones facilitan su uso en proyectos académicos y experimentos de evaluación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la cuantización no proporciona métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para las distintas versiones cuantizadas. Se recomienda consultar la ficha del modelo original `Qwen/Qwen3-30B-A3B` para obtener datos comparativos, o realizar evaluaciones propias con el conjunto de datos deseado.

## Requisitos de hardware

- La VRAM necesaria depende de la cuantización elegida. El archivo más pequeño (Q2_K, 11.26 GB) puede caber en una GPU con 12 GB de VRAM, como una RTX 3060 o RTX 4070, mientras que el Q8_0 (32.48 GB) requiere al menos 40 GB de VRAM (por ejemplo, una A100 40GB o dos GPUs de 24 GB).
- Para la mayoría de usuarios, se recomienda la cuantización Q4_K_M (18.56 GB) que cabe en una RTX 4090 (24 GB) o en una A10G (24 GB), o la IQ4_XS (16.37 GB) para GPUs con 16-20 GB.
- En modo CPU, se puede ejecutar con suficiente RAM del sistema (por ejemplo, Q4_K_M necesita unos 20 GB de RAM). La velocidad será menor que en GPU, pero viable para uso interactivo.
- Opciones de despliegue: `llama.cpp` (nativo), Ollama, LM Studio, y cualquier framework compatible con GGUF (por ejemplo, text-generation-webui, KoboldCpp).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-30B-A3B (original) | 30.5B | 3B | no disponible | Apache-2.0 | safetensors |
| qtum/Qwen3-30B-A3B-GGUF | 30.5B | 3B | no disponible | Apache-2.0 | GGUF |
| Mixtral 8x7B (referencia) | 46.7B | 12.9B | 32K | Apache-2.0 | safetensors/GGUF |

La comparativa se limita a datos estructurales, ya que no se dispone de resultados de benchmarks para esta cuantización. El modelo original Qwen3-30B-A3B es la referencia directa; la versión GGUF ofrece la ventaja de poder ejecutarse en hardware más modesto gracias a la cuantización. Mixtral 8x7B es un MoE de tamaño similar, pero con más parámetros activos, lo que suele implicar mayor calidad pero también mayor coste computacional.

## Limitaciones y advertencias

- La cuantización introduce pérdida de precisión, especialmente en los formatos de menor bit (Q2_K, IQ3_M). Para tareas críticas se recomienda usar Q6_K o Q8_0.
- La calibración imatrix se realizó con datos en inglés, chino y código; el rendimiento en otros idiomas puede degradarse.
- La longitud de contexto no está especificada en esta ficha; se debe consultar el modelo base para conocer el límite exacto.
- El modelo puede presentar sesgos y alucinaciones inherentes a los LLM; no se han documentado sesgos específicos en esta versión.
- Aunque la licencia Apache-2.0 permite uso comercial, se recomienda revisar los términos del modelo base para asegurar el cumplimiento.
- No se garantiza soporte de tool calling o agentes; verificar con el modelo original antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/qtum/Qwen3-30B-A3B-GGUF
- Modelo original (Qwen/Qwen3-30B-A3B): https://huggingface.co/Qwen/Qwen3-30B-A3B
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de imatrix y cuantización (referencia de Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
