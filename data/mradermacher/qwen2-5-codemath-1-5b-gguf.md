# mradermacher/Qwen2.5-CodeMath-1.5B-GGUF

## Resumen

El modelo Qwen2.5-CodeMath-1.5B-GGUF es una versión cuantizada en formato GGUF del modelo base `thlurte/Qwen2.5-CodeMath-1.5B-DARE-TIES`, un merge creado con mergekit y la técnica DARE-TIES que combina modelos de la familia Qwen2.5 especializados en código y matemáticas. El resultado es un modelo denso de 1.543 millones de parámetros, orientado a tareas de generación de código y resolución de problemas matemáticos, con licencia Apache-2.0 y soporte exclusivo para inglés.

La relevancia de esta ficha radica en que ofrece un punto de entrada ligero y eficiente para desarrolladores que necesitan un modelo de razonamiento técnico en entornos con recursos limitados. Al estar disponible en múltiples cuantizaciones GGUF, desde Q2_K hasta f16, se puede ejecutar en CPU, GPU de consumo o integrado en frameworks como llama.cpp, Ollama o vLLM sin necesidad de infraestructura especializada.

El modelo no incluye instrucciones específicas sobre su arquitectura interna más allá de ser un merge de modelos Qwen2.5, por lo que se asume que hereda la arquitectura transformer decoder-only de dicha familia, con atención completa y sin mecanismos de mezcla de expertos (MoE). La longitud de contexto no se documenta en la información disponible, aunque los modelos Qwen2.5 suelen soportar 32.768 tokens; este dato no está confirmado para este merge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5, no confirmada oficialmente) |
| Parametros totales | 1.543.298.048 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de un merge realizado con mergekit utilizando la técnica DARE_TIES. El modelo base, `thlurte/Qwen2.5-CodeMath-1.5B-DARE-TIES`, combina pesos de modelos de la familia Qwen2.5 especializados en código y matemáticas, probablemente Qwen2.5-Coder y Qwen2.5-Math, aunque la composición exacta no se detalla en la documentación. Al ser un merge, no se ha realizado un entrenamiento adicional; se han fusionado los pesos de los modelos originales mediante interpolación y selección de parámetros.

La arquitectura subyacente corresponde a la de Qwen2.5: un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm, y activación SwiGLU. No se dispone de información sobre el número de capas, dimensiones ocultas o el tamaño del vocabulario, ya que no se publican en la ficha del modelo cuantizado. El proceso de cuantización ha sido realizado por mradermacher, generando archivos GGUF con distintos niveles de precisión para adaptarse a diferentes restricciones de memoria y requisitos de calidad.

## Capacidades

- Generación de código fuente en diversos lenguajes, gracias a la herencia de Qwen2.5-Coder.
- Resolución de problemas matemáticos, incluyendo aritmética, álgebra y razonamiento numérico, por la influencia de Qwen2.5-Math.
- Razonamiento de varios pasos para tareas que combinan lógica y cálculo.
- Generación de texto técnico y explicaciones en inglés.
- Soporte de tool calling y function calling no confirmado; depende del modelo base original, pero no se especifica en la documentación.
- Capacidades multilingües limitadas al inglés, según la metadata.
- Sin soporte de visión ni audio, ya que es un modelo de texto puro.

## Casos de uso

- Asistente de programación en entornos con pocos recursos: el modelo puede sugerir fragmentos de código, explicar algoritmos o depurar errores en una máquina local con CPU, gracias a las cuantizaciones pequeñas como Q4_K_M (1.1 GB) que caben en memoria RAM estándar.
- Resolución de ejercicios matemáticos en plataformas educativas: puede generar soluciones paso a paso para problemas de álgebra o cálculo, útil en aplicaciones de tutoría automatizada.
- Generación de documentación técnica: dado su entrenamiento en código, puede redactar comentarios, docstrings o explicaciones de funciones a partir de código fuente.
- Integración en pipelines de CI/CD como asistente de revisión de código: se puede ejecutar en un contenedor ligero para sugerir mejoras o detectar patrones erróneos en commits.
- Chatbot técnico en inglés para soporte de desarrolladores: con una ventana de contexto razonable (si se confirma 32k), puede mantener conversaciones multi-turno sobre temas de programación.
- Prototipado rápido de aplicaciones de IA generativa en dispositivos edge: su tamaño reducido permite desplegarlo en Raspberry Pi o móviles mediante llama.cpp o Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base es un merge sin métricas oficiales de MMLU, HumanEval o GSM8K. Se recomienda realizar evaluaciones propias antes de usarlo en producción, especialmente para tareas de código y matemáticas donde los modelos originales Qwen2.5-Coder y Qwen2.5-Math sí tienen cifras documentadas.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~0.8 GB, Q4_K_M ~1.1 GB, Q8_0 ~1.7 GB, f16 ~3.2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4 o inferiores; una RTX 3060 o superior puede ejecutar el modelo sin problemas. También es viable en CPU con 4 GB de RAM para las versiones más pequeñas.
- Cabe en GPUs de consumo como GTX 1650, RTX 3060, RTX 4090, etc.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con conversión previa), TGI, o directamente con la librería transformers si se convierte a safetensors.
- Latencia y throughput: no disponibles; al ser un modelo de 1.5B, se espera una generación de decenas de tokens por segundo en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen2.5-CodeMath-1.5B-GGUF (este) | 1.54B | no disponible | Apache-2.0 | Merge de código y matemáticas |
| Qwen2.5-1.5B-Instruct | 1.54B | 32k | Apache-2.0 | Instrucción general |
| Qwen2.5-Coder-1.5B-Instruct | 1.54B | 32k | Apache-2.0 | Especializado en código |
| Qwen2.5-Math-1.5B-Instruct | 1.54B | 32k | Apache-2.0 | Especializado en matemáticas |

La comparativa se basa en características generales, ya que no hay benchmarks públicos para el modelo fusionado. El modelo propuesto pretende combinar las fortalezas de código y matemáticas en un solo paquete, pero su rendimiento real no está verificado.

## Limitaciones y advertencias

- Al ser un merge, puede presentar comportamientos inconsistentes en tareas que no están alineadas con los dominios de código y matemáticas.
- Riesgo de alucinación en respuestas factuales o creativas, especialmente en contextos largos.
- Soporte de idiomas limitado al inglés; no se recomienda para otros idiomas.
- Longitud de contexto no confirmada; si se usa con ventanas superiores a la soportada, el modelo puede degradarse.
- Licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar la procedencia de los modelos base originales.
- No se garantiza la calidad de las cuantizaciones más agresivas (Q2_K, Q3_K); se recomienda usar Q4_K_M o superior para tareas críticas.
- No hay información sobre sesgos específicos, pero al derivar de modelos entrenados con datos de internet, puede reflejar sesgos presentes en esos datos.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/mradermacher/Qwen2.5-CodeMath-1.5B-GGUF)
- [Modelo base: thlurte/Qwen2.5-CodeMath-1.5B-DARE-TIES](https://huggingface.co/thlurte/Qwen2.5-CodeMath-1.5B-DARE-TIES)
- [Guía de uso de archivos GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF) (referencia general)
