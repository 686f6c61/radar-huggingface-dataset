# ibm-granite/granite-4.2-30b-GGUF

## Resumen

Granite 4.2 30B es un modelo de lenguaje denso de razonamiento desarrollado por IBM, publicado bajo licencia Apache 2.0. Forma parte de la familia Granite 4.2, que incluye versiones de 3B, 8B y 30B, y está diseñado específicamente para flujos de trabajo de agentes empresariales: razonamiento encadenado (chain-of-thought), uso de herramientas, codificación y seguimiento de instrucciones. El modelo incorpora un modo de pensamiento conmutable que permite activar o desactivar el razonamiento extendido según la tarea, lo que resulta especialmente útil para equilibrar latencia y precisión en producción.

Este repositorio concreto contiene la versión convertida a formato GGUF del modelo base de 30B, lista para ejecutarse con llama.cpp y herramientas compatibles como Ollama o LM Studio. Con aproximadamente 30 mil millones de parámetros y una ventana de contexto de 128.000 tokens, Granite 4.2 30B se posiciona como una alternativa abierta y eficiente a otros modelos de razonamiento del mismo rango de tamaño, con un rendimiento destacado en tareas de codificación (57,0 en SWE-bench Verified) y un enfoque claro hacia el despliegue en entornos empresariales.

La relevancia de este modelo radica en su combinación de razonamiento nativo, licencia permisiva y soporte para herramientas, lo que permite construir asistentes y agentes autónomos sin depender de APIs propietarias. Al estar disponible en GGUF, puede ejecutarse en hardware de consumo con cuantizaciones agresivas, aunque su tamaño completo requiere GPUs profesionales para un rendimiento óptimo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin MoE) |
| Parametros totales | 30.276.770.304 (30B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponibles (el repo contiene múltiples archivos GGUF, pero no se enumeran los tipos concretos) |
| Idiomas soportados | Multilingue (detalles no disponibles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Granite 4.2 30B es un modelo de tipo transformer denso, es decir, todos los parámetros se activan en cada inferencia (no es una arquitectura de mezcla de expertos). IBM ha incorporado un mecanismo de razonamiento interno (chain-of-thought) que puede activarse o desactivarse mediante un token de control, permitiendo al modelo "pensar" antes de responder cuando la tarea lo requiere. Esta característica es clave para tareas de codificación, matemáticas y planificación multi-paso.

Los detalles sobre el dataset de entrenamiento (número de tokens, composición exacta, técnicas de alineación como RLHF o DPO) no se han publicado en la información disponible. IBM menciona que el modelo ha sido optimizado para agentes, con soporte de tool calling y razonamiento aumentado, lo que sugiere un entrenamiento específico para el uso de herramientas y la ejecución de acciones. La ventana de contexto de 128K tokens permite manejar documentos largos y conversaciones extensas sin pérdida de rendimiento.

## Capacidades

- Razonamiento y chain-of-thought: el modelo puede activar un modo de "pensamiento" que le permite razonar paso a paso antes de generar la respuesta final, mejorando la precisión en problemas complejos.
- Generación de código: soporta la generación de código en múltiples lenguajes y ha obtenido un 57,0 en SWE-bench Verified, un benchmark de resolución de problemas de software reales.
- Tool calling / function calling: integra soporte para invocar herramientas externas, lo que permite construir agentes que interactúan con APIs, bases de datos o ejecutan acciones.
- Razonamiento multi-paso y agentes: diseñado para tareas de agentes que requieren planificación, ejecución y verificación de resultados.
- Instrucciones y conversación: sigue instrucciones complejas y mantiene conversaciones multi-turno con contexto largo gracias a la ventana de 128K tokens.
- Capacidades multilingües: soporta varios idiomas, aunque no se detallan los específicos en la información disponible.

## Casos de uso

- Asistentes de soporte técnico automatizados: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K tokens) para resolver incidencias de clientes, consultando documentación interna o bases de conocimiento mediante tool calling.
- Generación de código en entornos CI/CD: integrado en pipelines de integración continua, puede revisar pull requests, generar tests unitarios y sugerir correcciones de bugs, aprovechando su rendimiento en SWE-bench.
- Agentes de automatización de procesos: conectado a herramientas de gestión de tareas (Jira, Slack) o APIs internas, el modelo puede planificar y ejecutar flujos de trabajo complejos, como la creación de informes o la actualización de tickets.
- Análisis de documentos legales o financieros: su contexto de 128K tokens permite procesar contratos extensos o informes anuales completos, extrayendo información relevante y resumiendo contenido con razonamiento.
- Asistentes de programación en local: con cuantizaciones GGUF, se puede ejecutar en un portátil con GPU de 16GB o más, ofreciendo un asistente de codificación privado sin conexión a internet.
- Investigación y prototipado de agentes: los investigadores pueden utilizar el modelo como base para experimentar con técnicas de razonamiento y tool calling, gracias a su licencia Apache 2.0 que permite modificación y uso comercial.

## Benchmarks y rendimiento

Se ha publicado el resultado de SWE-bench Verified, un benchmark que evalúa la resolución de problemas reales de GitHub. No se disponen de otros resultados de benchmarks (como MMLU, HumanEval o GSM8K) en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 57,0 |

Este resultado sitúa al modelo en un nivel competitivo para tareas de ingeniería de software, aunque se recomienda contrastar con evaluaciones propias en el dominio de aplicación.

## Requisitos de hardware

- VRAM estimada para inferencia: dependiendo de la cuantización. Para un modelo de 30B:
  - Q4_K_M: aproximadamente 18-20 GB de VRAM
  - Q5_K_M: ~22-24 GB
  - Q8_0: ~32 GB
- GPUs recomendadas: para ejecutar con cuantización Q4 o Q5, una RTX 4090 (24 GB) o A100 40 GB es suficiente. Para cuantización completa, se requiere una GPU con más de 32 GB, como A100 80GB o H100.
- Compatibilidad con GPU de consumo: si, con cuantizaciones Q4 y Q5 en GPUs de 24 GB (RTX 3090/4090). Para GPUs de 8-16 GB se necesitan cuantizaciones más agresivas (Q2, Q3) que sacrifican calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), TGI (a través de conversión a safetensors).
- Latencia y throughput: no se han publicado datos específicos; la latencia dependerá de la GPU, la cuantización y la longitud de la secuencia. En una A100 80GB con Q4, se puede esperar un throughput de 20-40 tokens/segundo para generación.

## Comparativa con modelos similares

El modelo se sitúa en el segmento de razonamiento de ~30B parámetros con licencia abierta. Se compara con alternativas como Qwen2.5-32B-Instruct y Llama-3.3-70B-Instruct (aunque este último es más grande).

| Modelo | Parámetros | Contexto | Licencia | SWE-bench Verified | Disponibilidad |
|---|---|---|---|---|---|
| Granite 4.2 30B | 30B | 128K | Apache 2.0 | 57,0 | GGUF, safetensors |
| Qwen2.5-32B-Instruct | 32B | 128K | Apache 2.0 | no disponible | GGUF, safetensors |
| Llama-3.3-70B-Instruct | 70B | 128K | Llama 3.3 | no disponible | GGUF, safetensors |

Granite 4.2 30B ofrece un rendimiento competitivo en codificación con una licencia más permisiva que Llama y un tamaño más manejable que 70B, lo que lo hace adecuado para despliegues en infraestructura moderada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han publicado estudios específicos sobre sesgos o tasas de alucinación para este modelo. Como todo LLM, puede generar contenido incorrecto o inventado, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Limitaciones de contexto: aunque soporta 128K tokens, la calidad de la atención puede degradarse en los extremos de la ventana; se recomienda probar con secuencias largas antes de producción.
- Idiomas: no se detallan los idiomas soportados; la documentación menciona "multilingüe" pero sin especificar cuáles, lo que limita la confianza en idiomas distintos del inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no incluye una cláusula de indemnización de patentes (sí la incluye, pero se recomienda revisar los términos exactos).
- Requisitos de hardware: para un rendimiento óptimo se necesitan GPUs con 24 GB o más; el uso en hardware limitado requiere cuantizaciones que pueden degradar la calidad del razonamiento.
- Dependencia del modo de pensamiento: el modelo puede mostrar latencia adicional cuando el modo de razonamiento está activado; es necesario configurarlo correctamente para cada caso de uso.

## Enlaces

- Repositorio HuggingFace GGUF: https://huggingface.co/ibm-granite/granite-4.2-30b-GGUF
- Modelo base (safetensors): https://huggingface.co/ibm-granite/granite-4.2-30b
- Colección de modelos Granite 4.2: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog técnico de IBM Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Documentación oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Análisis técnico en AI/TLDR: https://ai-tldr.dev/models/granite-4-2-30b/
- Blog de investigación de IBM: https://research.ibm.com/blog/introducing-granite-4-2
