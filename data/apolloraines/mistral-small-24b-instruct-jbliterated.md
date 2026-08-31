# ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated

## Resumen

Mistral-Small-24B-Instruct-Jbliterated es una modificación del modelo Mistral-Small-24B-Instruct-2501 (Mistral Small 3) de Mistral AI, desarrollada por ApolloRaines. El objetivo es eliminar quirúrgicamente los comportamientos de rechazo a nivel de pesos, de modo que el modelo no muestre negativas a peticiones que el modelo original rechazaría. A diferencia de la abliteración estándar, que solo elimina la respuesta superficial "no puedo ayudar", este método (denominado "jbliterated") ataca direcciones conductuales más profundas, evitando que el modelo recurra a reinterpretaciones de la pregunta, inyección de avisos o respuestas evasivas.

El modelo mantiene la misma arquitectura y tamaño que el base: 23.572.403.200 parámetros, 40 capas, y está pensado como un reemplazo directo (drop-in) del original. Se distribuye en formato safetensors y GGUF, con licencia Apache 2.0. Su relevancia radica en ofrecer una alternativa "sin censura" para casos de uso donde se requiere una generación de texto sin restricciones de seguridad, aunque esto conlleva riesgos importantes de uso indebido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Mistral-Small-24B-Instruct-2501) |
| Parametros totales | 23.572.403.200 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la ficha del modelo) |
| Tipos de cuantizacion | safetensors (fp16) y GGUF (varias cuantizaciones, no detalladas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es una modificación de pesos del Mistral-Small-24B-Instruct-2501, un transformer denso de 24B parámetros con 40 capas. La técnica empleada, denominada "jbliterated", aplica una intervención sobre los pesos del modelo base: se identifican 5 direcciones por capa (en todas las 40 capas) que codifican comportamientos de rechazo y se eliminan mediante restricciones de espacio nulo. Esto permite preservar las capacidades de matemáticas, código y razonamiento, según la model card. Además, se activa la preservación de norma para mantener la estabilidad de las activaciones.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens o si se usó RLHF/DPO en el modelo base. El proceso de modificación es puramente post-entrenamiento, sin reentrenamiento adicional. El resultado es un modelo que no incorpora el comportamiento de rechazo en sus pesos, por lo que no requiere trucos de system prompt ni parches en tiempo de inferencia.

## Capacidades

- Generación de texto conversacional y de instrucciones, con las mismas capacidades que el modelo base Mistral Small 3.
- Razonamiento, matemáticas y generación de código, preservadas gracias a las restricciones de espacio nulo.
- Function calling y soporte para agentes, heredado del modelo base (según la documentación de Mistral Small 3).
- Capacidad de respuesta sin rechazos: el modelo no muestra negativas a peticiones que el original bloquearía, lo que lo hace útil para dominios donde se requiere una respuesta directa sin filtros de seguridad.
- Multilingüe: aunque la ficha del modelo solo indica inglés, el modelo base soporta múltiples idiomas; sin embargo, la modificación no garantiza el mismo rendimiento en otros idiomas.
- Compatible con la herramienta DeepswapLLM, que permite ejecutar el modelo en GPUs con memoria insuficiente mediante streaming de capas entre GPU, RAM y disco.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativa, poesía o guiones sin las limitaciones de seguridad del modelo original, útil para proyectos de escritura experimental.
- Investigación en alineación y seguridad de IA: permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, facilitando análisis comparativos sobre los efectos de la abliteración.
- Desarrollo de asistentes conversacionales para dominios especializados (por ejemplo, medicina, derecho) donde el modelo base podría rechazar preguntas por considerarlas sensibles, aunque esto conlleva riesgos legales y éticos.
- Pruebas de robustez y jailbreak: sirve como banco de pruebas para evaluar técnicas de mitigación de contenido dañino en modelos de lenguaje.
- Integración en pipelines de generación de código donde se requiera una respuesta ininterrumpida, aunque el modelo base ya ofrece buen rendimiento en esta tarea.
- Despliegue local en entornos con recursos limitados mediante cuantización GGUF o DeepswapLLM, permitiendo ejecutar el modelo en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Se desconoce si el proceso de modificación afecta al rendimiento en tareas estándar, aunque la técnica afirma preservar matemáticas, código y razonamiento.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la ficha del modelo.
- Para inferencia en fp16 (safetensors), se estima un consumo de VRAM de aproximadamente 48 GB (23.57B parámetros × 2 bytes), lo que requiere GPUs como A100 80GB, H100 o varias RTX 4090 en paralelo.
- Con cuantización GGUF (por ejemplo, Q4_K_M), el modelo podría caber en GPUs de 24 GB, como RTX 3090/4090, aunque no se detallan las cuantizaciones disponibles.
- El autor recomienda el uso de DeepswapLLM para ejecutar el modelo en GPUs con memoria insuficiente, con un rendimiento hasta 4 veces superior a AirLLM.
- Opciones de despliegue: transformers (con device_map="auto"), llama.cpp/Ollama (vía GGUF), vLLM o TGI (si son compatibles con el formato), y DeepswapLLM para entornos con memoria limitada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mistral-Small-24B-Instruct-Jbliterated | 23.57B | No disponible | Apache 2.0 | HuggingFace | Modificación sin rechazos del base |
| Mistral-Small-24B-Instruct-2501 (base) | 23.57B | No disponible (se estima 128k, no confirmado) | Apache 2.0 | HuggingFace | Modelo original con rechazos |
| Qwen2.5-24B-Instruct | 24B | 128k | Apache 2.0 | HuggingFace | Alternativa de 24B con soporte multilingüe y function calling |

La comparativa se limita a modelos de tamaño similar, pero no se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia del Jbliterated es la eliminación de comportamientos de rechazo, lo que no afecta a la arquitectura ni al tamaño.

## Limitaciones y advertencias

- El modelo elimina los mecanismos de rechazo, lo que puede generar respuestas a contenido dañino, ilegal o no ético. Su uso en producción conlleva un alto riesgo de abuso y responsabilidad legal.
- Solo está confirmado el soporte del idioma inglés; el rendimiento en otros idiomas no está garantizado.
- No se han publicado evaluaciones de seguridad ni benchmarks de rendimiento, por lo que se desconoce el impacto real de la modificación en la calidad de las respuestas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en entornos de producción.
- El modelo puede presentar alucinaciones o sesgos, al igual que el modelo base, pero al no tener filtros de rechazo, estos pueden manifestarse de forma más directa.
- No se especifica la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.

## Enlaces

- [HuggingFace - ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated](https://huggingface.co/ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated)
- [Repositorio de archivos del modelo](https://huggingface.co/ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated/tree/main)
- [GitHub - DeepswapLLM](https://github.com/apolloraines/DeepswapLLM)
- [GitHub - Inferless/Mistral-Small-24B-Instruct (modelo base)](https://github.com/inferless/Mistral-Small-24B-Instruct)
