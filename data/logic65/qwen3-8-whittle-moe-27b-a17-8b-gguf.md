# logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF

## Resumen

El modelo `logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF` es una versión cuantizada en formato GGUF del modelo base `Qwen3.8-Whittle-MoE-27B-A17.8B`, desarrollado por logic65. Este modelo es un *mixture of experts* (MoE) obtenido mediante un proceso de poda y transformación *post hoc* sobre el modelo denso Qwen3.8-27B de Alibaba. El nombre "Whittle" hace referencia a la técnica de tallado o recorte de capas y módulos para construir un MoE a partir de un transformer denso, reduciendo el número de parámetros activos por token. La versión v2.1 es la más reciente y se publica con dos cuantizaciones: Q4_K_M y Q8_0.

El modelo conserva la arquitectura base de Qwen3.8-27B, que incluye atención gated-deltanet y un contexto de 256K tokens según la documentación del modelo original. Al ser un MoE con 27B parámetros totales y 17.8B activos, ofrece un equilibrio entre capacidad y eficiencia computacional. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia radica en la posibilidad de ejecutar un modelo de alta calidad en hardware de consumo, gracias a las cuantizaciones GGUF y al diseño MoE que reduce el coste de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención gated-deltanet (etiqueta `qwen3_5_moe`) |
| Parametros totales | 27B (nombre del modelo) |
| Parametros activos | 17.8B |
| Longitud de contexto | 256K tokens (según datos del modelo base, no confirmado en el repo GGUF) |
| Tipos de cuantizacion | Q4_K_M (17.4 GB) y Q8_0 (28.7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Whittle-MoE-27B-A17.8B` se construye a partir de Qwen3.8-27B, un transformer denso con atención gated-deltanet, una variante de atención lineal que reduce el coste cuadrático. El proceso "whittle" convierte el modelo denso en un MoE mediante la poda selectiva de capas o sub-módulos, creando una mezcla de expertos sin entrenamiento adicional significativo. No se han publicado detalles técnicos sobre el algoritmo exacto de poda, pero la etiqueta `whittle` y la descripción indican que se trata de una transformación posteriori al entrenamiento del modelo base. La versión v2.1 incluye mejoras en la tasa de bucles de conversación (reducida del 69% al 8%) y en la estructura de respuestas, pero no se proporcionan datos sobre el dataset de entrenamiento ni el proceso de ajuste.

## Capacidades

- Generación de texto en lenguaje natural, con soporte de conversación multi-turno.
- Razonamiento y resolución de problemas, heredado de Qwen3.8-27B.
- Capacidad de codificación y comprensión de lenguajes de programación (presumiblemente, aunque no se especifica).
- Soporte de contexto largo (256K tokens) para tareas que requieren memoria amplia.
- No se documenta soporte explícito de *function calling*, *tool calling* o modos de agente en la model card.
- No se indica soporte multimodal (solo texto).

## Casos de uso

- Asistentes de conversación y chatbots locales: con un contexto de 256K tokens, puede mantener diálogos largos y coherentes, y su tamaño reducido (Q4_K_M) permite ejecutarlo en GPUs de consumo.
- Generación de documentación técnica y resúmenes de textos extensos, aprovechando su contexto largo y capacidad de razonamiento.
- Análisis y procesamiento de código, como autocompletado o refactorización, aunque no se confirma soporte específico de herramientas.
- Aplicaciones de procesamiento de lenguaje natural en entornos con restricciones de VRAM, gracias a su diseño MoE y cuantizaciones.
- Investigación académica en eficiencia de modelos y técnicas de poda, dado su origen experimental.
- Despliegue en servidores de bajo coste con inferencia mediante llama.cpp, que soporta GGUF y permite ejecución en CPU y GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, GSM8K) en la información disponible. La model card menciona métricas internas como "tasa de bucle de un solo turno" (8 % en v2.1), "tasa de respuestas truncadas" (cero) y "conocimiento de batería" (28 de 39), pero estos no son benchmarks públicos comparables. Por tanto, se indica que no hay datos de rendimiento cuantitativo externo.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q4_K_M: 17.4 GB, cabe en GPUs de 24 GB (p. ej., RTX 3090, RTX 4090) y puede dividirse en dos tarjetas de 12 GB.
  - Q8_0: 28.7 GB, requiere al menos 32 GB de VRAM o múltiples GPUs.
- GPU recomendadas: RTX 3090/4090 para Q4_K_M; para Q8_0, A100 o A6000.
- Despliegue: llama.cpp (llama-server) con soporte de Qwen3.5 MoE, sin necesidad de parches. También compatible con otras herramientas que carguen GGUF como Ollama.
- Latencia y throughput: no se proporcionan datos específicos, pero el MoE con 17.8B activos reduce el coste de inferencia respecto a un denso de 27B.

## Comparativa con modelos similares

La comparación se realiza con el modelo base Qwen3.8-27B y con otros MoE de tamaño similar, aunque no se dispone de datos de rendimiento para este modelo concreto.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-MoE-27B-A17.8B (GGUF) | 27B | 17.8B | 256K (presumible) | Apache 2.0 | GGUF |
| Qwen3.8-27B (base) | 27.8B | 27.8B (denso) | 256K | Apache 2.0 | safetensors |
| Qwen3-30B-A3B (hipotético) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros MoE de la misma escala no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos específicos del modelo, pero al derivar de Qwen3.8-27B puede heredar sesgos presentes en los datos de entrenamiento del modelo original.
- Riesgo de alucinación inherente a modelos de lenguaje, sin datos sobre su frecuencia en este modelo.
- El contexto de 256K tokens no está confirmado en el repo GGUF; el comando de ejemplo usa 8192 tokens, por lo que se debe verificar el contexto real en la configuración de llama.cpp.
- No se documentan limitaciones de idioma; el modelo probablemente soporta múltiples idiomas, pero no se especifica.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base (Qwen3.8-27B) por si hay restricciones adicionales.
- La técnica "whittle" puede introducir degradaciones de rendimiento en comparación con el modelo denso original, aunque las métricas internas indican mejoras en ciertas tareas.

## Enlaces

- [Repositorio GGUF en Hugging Face](https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF)
- [Modelo base en Hugging Face](https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B)
- [Colección de la familia Whittle](https://huggingface.co/collections/logic65/qwen38-whittle-family)
- [Análisis técnico de Qwen3.8-27B](https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html)
- [Ficha del modelo en llm-explorer](https://llm-explorer.com/model/logic65%2FQwen3.8-Whittle-MoE-27B-A17.8B,372feFSodtnWdsRYHJ9LW5)</think>## Resumen

El modelo `logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF` es una cuantización en formato GGUF del modelo base `Qwen3.8-Whittle-MoE-27B-A17.8B`, desarrollado por logic65. Se trata de un *mixture of experts* (MoE) obtenido mediante una técnica de poda posteriori ("whittle") aplicada al modelo denso Qwen3.8-27B de Alibaba. El proceso convierte un transformer denso en un MoE con 27B parámetros totales y 17.8B activos, lo que reduce el coste computacional durante la inferencia. La versión v2.1 es la más reciente y se distribuye en dos cuantizaciones: Q4_K_M (17.4 GB) y Q8_0 (28.7 GB).

El modelo hereda la arquitectura de Qwen3.8-27B, que incluye atención gated-deltanet y una ventana de contexto de 256K tokens (según los datos del modelo base). Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Su relevancia radica en la posibilidad de ejecutar un modelo de 27B en hardware de consumo (24 GB VRAM) gracias a la cuantización y al diseño MoE, sin necesidad de infraestructura de alto rendimiento. No se documentan capacidades específicas de *tool calling* ni multimodalidad en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención gated-deltanet (etiqueta `qwen3_5_moe`) |
| Parametros totales | 27B (según nombre del modelo; el base denso tiene 27.8B) |
| Parametros activos | 17.8B |
| Longitud de contexto | 256K tokens (heredado del modelo base; no confirmado en el repo GGUF) |
| Tipos de cuantizacion | Q4_K_M (17.4 GB) y Q8_0 (28.7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Whittle-MoE-27B-A17.8B` se construye a partir del transformer denso Qwen3.8-27B, que utiliza atención gated-deltanet, una variante de atención lineal que reduce el coste cuadrático. La técnica "whittle" convierte el modelo denso en un MoE mediante la poda selectiva de capas y la reorganización de los pesos en expertos, sin entrenamiento adicional. El proceso se describe como "post hoc", es decir, se aplica sobre el modelo ya entrenado. No se publican detalles sobre el dataset de entrenamiento, el número de tokens ni el método de ajuste (RLHF/DPO). La versión v2.1 introduce mejoras en la tasa de bucles de conversación (reducida del 69 % al 8 %), en la estructura de respuestas (22 % de respuestas estructuradas) y elimina respuestas truncadas, según los datos internos del autor.

## Capacidades

- Generación de texto en lenguaje natural, con capacidad de razonamiento y resolución de problemas.
- Soporte de contexto largo (256K tokens), lo que permite manejar documentos extensos o diálogos prolongados.
- Modelo de lenguaje generalista, presumiblemente con competencias en código, matemáticas y multilingüismo, aunque no se especifican en la model card.
- No se documenta soporte explícito de *tool calling*, *function calling* ni modo *thinking*.
- No se indica capacidad multimodal (solo texto).

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 256K tokens), lo que permite recordar el historial completo de una interacción y ofrecer respuestas coherentes.
- **Generación de documentación técnica**: con su capacidad de razonamiento y generación de texto, puede redactar manuales, guías o resúmenes de documentos extensos.
- **Análisis de grandes corpus de texto**: gracias al contexto de 256K tokens, puede procesar libros completos o expedientes en una sola pasada, ideal para resumir o extraer información.
- **Despliegue en entornos con limitaciones de VRAM**: la cuantización Q4_K_M (17.4 GB) cabe en una RTX 3090/4090 de 24 GB, y el modelo MoE con 17.8B activos reduce la memoria necesaria frente a un denso de 27B.
- **Investigación en eficiencia de modelos**: por su origen metodológico (whittle), puede usarse para estudiar el impacto de la poda y la transformación MoE en el rendimiento.
- **Prototipado rápido de chatbots**: al ser compatible con llama.cpp y GGUF, se puede integrar en aplicaciones locales sin necesidad de API externas, facilitando pruebas y desarrollo ágil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card menciona métricas internas como tasa de bucle de conversación (8 %), tasa de respuestas estructuradas (22 %) y conocimiento de batería (28 de 30), pero estas no son comparables con benchmarks públicos. Por tanto, no se incluyen tablas numéricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q4_K_M: 17.4 GB, cabe en GPUs de 24 GB (p. ej., RTX 3090, RTX 4090) y puede dividirse en dos tarjetas de 12 GB.
  - Q8_0: 28.7 GB, requiere al menos 32 GB de VRAM o múltiples GPUs (p. ej., A6000, A100).
- GPU recomendadas: RTX 3090, RTX 4090 para Q4_K_M; A100, A6000 para Q8_0.
- Opciones de despliegue: llama.cpp (llama-server), compatible con cualquier compilación reciente con soporte para Qwen3.5 MoE. También puede usarse con Ollama.
- Latencia y throughput: no se proporcionan datos específicos; el diseño MoE con 17.8B activos reduce el coste de inferencia frente a un denso de 27B, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-MoE-27B-A17.8B (GGUF) | 27B | 17.8B | 256K tokens (presumible) | Apache 2.0 | GGUF |
| Qwen3.8-27B (base denso) | 27.8B | 27.8B (todos) | 256K | Apache 2.0 | safetensors |
| Qwen3-30B-A3B (hipotético) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos con otros MoE de la misma escala en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al derivar de Qwen3.8-27B puede heredar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje, sin datos cuantitativos sobre su frecuencia en esta versión.
- El contexto de 256K tokens no está confirmado en el repo GGUF; el comando de ejemplo usa 8192 tokens, por lo que debe configurarse manualmente.
- La técnica de poda "whittle" puede degradar el rendimiento en ciertas tareas comparado con el modelo denso original, aunque las métricas internas del autor indican mejoras en algunos aspectos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base por si hay restricciones adicionales.
- No se especifican limitaciones idiomáticas, pero el modelo probablemente soporta múltiples idiomas sin garantía oficial.

## Enlaces

- [Repositorio GGUF en Hugging Face](https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF)
- [Modelo base en Hugging Face](https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B)
- [Colección de la familia Whittle](https://huggingface.co/collections/logic65/qwen38-whittle-family)
- [Análisis técnico de Qwen3.8-27B](https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html)
- [Ficha del modelo en llm-explorer](https://llm-explorer.com/model/logic65%2FQwen3.8-Whittle-MoE-27B-A17.8B,372feFSodtnWdsRYHJ9LW5)
