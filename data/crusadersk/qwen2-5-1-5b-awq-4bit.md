# Crusadersk/qwen2.5-1.5b-awq-4bit

## Resumen

El modelo `Crusadersk/qwen2.5-1.5b-awq-4bit` es una cuantización AWQ de 4 bits del checkpoint instructivo `Qwen/Qwen2.5-1.5B-Instruct`, realizada por el usuario Crusadersk como parte del programa de investigación Banterhearts. Este programa estudia la correlación entre calidad y seguridad en modelos cuantizados para despliegue en hardware de consumo. La cuantización se ejecutó con la herramienta `llmcompressor` 0.10.0.1, utilizando el conjunto de calibración `wikitext-103-raw-v1` con 128 muestras y una semilla fija (42), lo que garantiza una procedencia documentada y reproducible.

El modelo resultante ocupa aproximadamente 1,1 GB y requiere unos 1,6 GB de VRAM para inferencia, lo que lo hace adecuado para entornos con recursos limitados, como portátiles con GPU de gama media o incluso CPU. Al ser una versión cuantizada del modelo instructivo de Qwen2.5, conserva las capacidades de generación de texto, seguimiento de instrucciones y razonamiento del modelo original, aunque con una ligera degradación esperada por la compresión. Su relevancia radica en ofrecer un checkpoint de tamaño reducido con una metodología de cuantización completamente documentada, útil tanto para aplicaciones prácticas como para investigación comparativa sobre el impacto de la cuantización en la seguridad y la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención de consulta agrupada (GQA), 28 capas |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | AWQ 4-bit, esquema W4A16_ASYM (pesos asimétricos de 4 bits, activaciones FP16), group_size=128 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato compressed-tensors, compatible con text-generation-inference) |

## Arquitectura y entrenamiento

El modelo base `Qwen2.5-1.5B-Instruct` es un transformer decoder-only con atención de consulta agrupada (GQA) y 28 capas, preentrenado sobre un corpus extenso y posteriormente ajustado con instrucciones. La cuantización AWQ (Activation-aware Weight Quantization) se aplicó post-entrenamiento sobre este checkpoint, sin ningún paso de entrenamiento adicional. El proceso utilizó `llmcompressor` 0.10.0.1, con calibración sobre 128 muestras de `wikitext-103-raw-v1` y semilla 42. La cuantización se realizó en una NVIDIA RTX 4080 Laptop (12 GB) mediante Docker, con un tiempo de cuantización de 4136 segundos.

La elección de AWQ en lugar de otros métodos (GGUF, GPTQ) responde al objetivo del programa Banterhearts de comparar métodos de cuantización con procedencia controlada. El esquema W4A16_ASYM mantiene las activaciones en FP16, lo que reduce la pérdida de precisión en comparación con esquemas que cuantizan también las activaciones. No se aplicó ningún proceso de fine-tuning o alineación posterior a la cuantización.

## Capacidades

- Generación de texto y seguimiento de instrucciones: al ser una versión cuantizada del modelo instructivo, responde a prompts en lenguaje natural con texto coherente.
- Razonamiento y comprensión de contexto: el modelo base tiene capacidades de razonamiento básico y comprensión lectora, que se mantienen en la versión cuantizada, aunque con una ligera degradación.
- Generación de código y matemáticas: el modelo base de Qwen2.5-Instruct incluye habilidades de programación y cálculo, que se conservan en esta cuantización.
- Capacidades multilingües: aunque la model card indica únicamente inglés, el modelo base de Qwen2.5 soporta múltiples idiomas; sin embargo, no se proporciona información específica sobre el comportamiento multilingüe de esta cuantización.
- No se mencionan capacidades específicas de tool calling, función de agente o modo de razonamiento extendido en la documentación proporcionada. Estas capacidades podrían estar presentes al heredarlas del modelo base, pero no están confirmadas para este checkpoint concreto.

## Casos de uso

- Chatbot local en dispositivos de bajo consumo: gracias a su tamaño reducido (~1,1 GB) y baja VRAM (~1,6 GB), puede ejecutarse en portátiles con GPU de gama media o incluso en CPU mediante `llama.cpp` u Ollama, ofreciendo un asistente conversacional sin conexión.
- Clasificación y análisis de texto en entornos con restricciones de memoria: su pequeño tamaño permite integrarlo en pipelines de procesamiento de lenguaje natural que requieran inferencia rápida en hardware limitado, como routers o sistemas embebidos.
- Generación de respuestas automatizadas en atención al cliente: puede gestionar consultas simples y multi-turno en inglés, siempre que el contexto no sea excesivamente largo y se acepte una cierta tasa de alucinación.
- Asistente de escritura y corrección: puede sugerir continuaciones de texto, resumir párrafos o reformular frases, aprovechando su capacidad de generación de texto coherente.
- Prototipado rápido de aplicaciones de IA: al ser un checkpoint cuantizado con procedencia documentada, es útil para pruebas de concepto donde se necesita un modelo ligero y fácil de desplegar con `vLLM` o `text-generation-inference`.
- Investigación sobre el impacto de la cuantización en la seguridad y calidad: el modelo está diseñado para comparaciones rigurosas entre métodos de cuantización, por lo que puede utilizarse en experimentos académicos que requieran control sobre la calibración y el proceso de cuantización.

## Benchmarks y rendimiento

La model card reporta métricas de calidad y seguridad evaluadas sobre 735 muestras de calidad (7 tareas) y 468 muestras de seguridad (juzgadas por `gemma3:12b`). Los resultados se presentan en las siguientes tablas.

### Métricas de calidad (tareas de generación)

| Métrica | Puntuación |
|---|---|
| BERTScore (F1) | 0,607 |
| ROUGE-L | 0,235 |
| Coherencia | 0,659 |

### Precisión (tareas de capacidad)

| Tarea | Precisión |
|---|---|
| MMLU | 55,4 % |
| ARC Challenge | 67,5 % |
| Clasificación | 34,0 % |

### Métricas de seguridad (juez gemma3:12b)

| Métrica | Puntuación |
|---|---|
| Tasa de rechazo (AdvBench) | 91,0 % |
| Veracidad (TruthfulQA) | 24,0 % |
| Tasa de imparcialidad (BBQ) | 81,3 % |

Además, se realizó una evaluación de deriva de seguridad (QSR v0) comparando el checkpoint cuantizado con el modelo base sin cuantizar. Se detectó una regresión en el eje de sobre-rechazo: 2 de 10 pares en riesgo (20,0 %) mostraron un cambio de rechazo a cumplimiento, con un intervalo de confianza Wilson del 5,7-51,0 %. No se detectaron flips en el eje de robustez al rechazo (0/12). Estos resultados deben interpretarse con cautela, ya que el juez utilizado no está calibrado para esta distribución de sondas y el tamaño muestral es pequeño.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,6 GB (según la model card).
- Tamaño del modelo en disco: 1,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3050, o incluso iGPUs con suficiente memoria compartida. El proceso de cuantización se realizó en una RTX 4080 Laptop (12 GB), pero la inferencia requiere mucho menos.
- Compatibilidad con GPU de consumo: sí, es uno de los principales objetivos del proyecto. Puede ejecutarse en GPUs de gama baja y media.
- Opciones de despliegue: `vLLM` (comando recomendado: `vllm serve Crusadersk/qwen2.5-1.5b-awq-4bit`), `text-generation-inference` (TGI), `llama.cpp`, `Ollama` y cualquier framework compatible con formato compressed-tensors.
- Latencia y throughput: no se proporcionan datos específicos. En una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base sin cuantizar y con otras variantes de cuantización del mismo modelo, ya que no se dispone de datos de modelos de tamaño similar en la información proporcionada.

| Modelo | Parámetros | Cuantización | Contexto | MMLU | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54 B | Sin cuantizar (BF16) | No disponible | No reportado en esta ficha | Apache 2.0 |
| Crusadersk/qwen2.5-1.5b-awq-4bit | 1,54 B | AWQ 4-bit | No disponible | 55,4 % | Apache 2.0 |
| Otras cuantizaciones (GGUF, GPTQ) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks para otras cuantizaciones del mismo modelo ni para modelos de tamaño similar (p. ej., Llama 3.2 1B, Gemma 2 2B). La comparativa directa con el modelo base muestra una degradación esperada en MMLU (55,4 % frente al valor del modelo base, que no se reporta en la ficha). El modelo base Qwen2.5-1.5B-Instruct suele alcanzar alrededor del 58-60 % en MMLU según la documentación oficial de Qwen, pero este dato no está incluido en la información proporcionada y no debe darse por confirmado.

## Limitaciones y advertencias

- Deriva de seguridad detectada: la evaluación QSR v0 encontró una regresión en el eje de sobre-rechazo (el modelo cuantizado rechaza prompts que el modelo base aceptaba) en un 20 % de los pares en riesgo, aunque con un intervalo de confianza amplio (5,7-51,0 %). Esto sugiere que la cuantización puede alterar el comportamiento de seguridad en casos concretos.
- El juez automático utilizado para las métricas de seguridad no está calibrado para la distribución de sondas empleada, por lo que los resultados deben considerarse indicativos y no concluyentes.
- Tamaño pequeño: con 1,54 B de parámetros, el modelo tiene una capacidad limitada para tareas complejas de razonamiento o generación de código avanzado. Es adecuado para tareas sencillas y prototipado.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados. La baja puntuación en TruthfulQA (24,0 %) indica una tendencia a generar respuestas no veraces.
- Limitación de idioma: la model card indica únicamente inglés. Aunque el modelo base soporta otros idiomas, no hay garantía de que la cuantización mantenga el mismo rendimiento multilingüe.
- Contexto limitado: no se especifica la longitud de contexto en la ficha; se hereda del modelo base (típicamente 32K tokens para Qwen2.5), pero no está confirmado para esta cuantización.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar los términos del modelo base Qwen2.5, que pueden incluir condiciones adicionales.
- Para producción, se recomienda validar el comportamiento del modelo en el dominio específico antes de desplegarlo, especialmente en aplicaciones sensibles a la seguridad o la veracidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Crusadersk/qwen2.5-1.5b-awq-4bit
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio del programa Banterhearts: https://github.com/Sahil170595/Banterhearts
- Herramienta de evaluación de deriva de seguridad quantfit: https://github.com/Sahil170595/quantfit
- Página de FriendliAI con información de despliegue: https://friendli.ai/models/Crusadersk/qwen2.5-1.5b-awq-4bit
