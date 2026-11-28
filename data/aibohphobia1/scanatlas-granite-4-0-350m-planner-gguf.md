# aibohphobia1/ScanAtlas-Granite-4.0-350M-Planner-GGUF

## Resumen

ScanAtlas-Granite-4.0-350M-Planner es un ajuste fino del modelo ibm-granite/granite-4.0-350m de IBM, publicado por el usuario aibohphobia1 en Hugging Face. No es un modelo de chat general: está especializado en planificar acciones para el asistente en dispositivo de la aplicación ScanAtlas, en 15 idiomas, y espera el prompt y la gramática JSON específicos de dicha aplicación. El modelo base Granite 4.0 de 350M es un transformer denso de IBM optimizado para despliegue en entornos con recursos limitados.

El ajuste se realizó sobre todos los pesos del modelo original y el resultado se cuantizó a Q4_0 con llama.cpp build b11799. El repositorio contiene únicamente pesos GGUF (0,5 GB en total), lo que lo hace apto para inferencia en CPU o GPU de gama baja mediante llama.cpp o llama-server. La versión v3 incorpora entrenamiento sobre 3.075 conversaciones multiturno en 15 idiomas mezcladas con 2.000 ejemplos de un solo turno, lo que mejora la gestión de referencias anafóricas y correcciones dentro de una conversación.

Su relevancia radica en el nicho: es un ejemplo de modelo pequeño (352 millones de parámetros) especializado en tool calling estructurado para una aplicación concreta, con licencia Apache-2.0 y formato GGUF listo para producción en dispositivo. No obstante, su utilidad fuera del contexto de ScanAtlas es muy limitada, ya que depende del prompt y la gramática JSON de la aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de ibm-granite/granite-4.0-350m) |
| Parametros totales | 352.379.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (unico formato publicado) |
| Idiomas soportados | 15 idiomas (no se especifica la lista completa) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de ibm-granite/granite-4.0-350m, un transformer denso de IBM con 352 millones de parámetros. Todos los pesos fueron ajustados finos sobre ejemplos de planificación de ScanAtlas, no mediante adaptadores. Posteriormente se cuantizó a Q4_0 con llama.cpp b11799, lo que reduce el tamaño del repositorio a 0,5 GB.

El conjunto de entrenamiento de la versión v3 combina 3.075 conversaciones multiturno en 15 idiomas (respuestas a preguntas como "¿cuál querías decir?", "deshaz eso", "hazlo 6", "el segundo", seguimientos) con 2.000 ejemplos de un solo turno. La aplicación ahora muestra al modelo las opciones de cada tarjeta anterior y el tool, argumentos y estado de cada tarjeta de acción, lo que permite al modelo resolver referencias y correcciones dentro del diálogo. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Planificación de acciones estructuradas: genera planes de acción en el formato JSON esperado por la aplicación ScanAtlas.
- Tool calling: selecciona entre 55 herramientas distintas en las tareas de evaluación de planificación.
- Razonamiento multiturno: resuelve referencias anafóricas, correcciones y seguimientos dentro de una conversación (por ejemplo, "el segundo", "hazlo 6", "deshaz eso").
- Multilingüe: entrenado en 15 idiomas, aunque las tareas no inglesas no han sido revisadas por hablantes nativos.
- Conversacional: etiquetado como conversational, pero solo dentro del prompt y la gramática de la aplicación.
- No es un modelo de chat general ni soporta generación de texto libre fuera del formato de ScanAtlas.

## Casos de uso

- Asistente en dispositivo de ScanAtlas: el modelo gestiona la planificación de acciones del asistente dentro de la aplicación, interpretando el prompt y la gramática JSON propios y devolviendo planes de acción ejecutables. Es su caso de uso principal y el único para el que fue entrenado.
- Resolución de referencias en conversaciones multiturno: en una app de escaneo de tarjetas o documentos, el usuario puede decir "el segundo" o "hazlo 6" y el modelo resuelve la referencia a tarjetas y acciones anteriores, gracias al entrenamiento sobre 3.075 conversaciones multiturno.
- Corrección de acciones previas: el usuario puede pedir "deshaz eso" o corregir un valor, y el modelo genera el plan de acción correspondiente para revertir o modificar la operación.
- Selección de herramientas en un conjunto acotado: con 55 herramientas disponibles, el modelo elige la herramienta y los argumentos adecuados para cada tarea de planificación.
- Despliegue en dispositivos con recursos limitados: al ser un GGUF Q4_0 de 0,5 GB, puede ejecutarse en CPU o GPU de gama baja mediante llama.cpp o llama-server, lo que permite inferencia local sin conexión.
- Integración en pipelines de aplicaciones móviles: al estar cuantizado a Q4_0 y ser compatible con llama.cpp, puede integrarse en builds de aplicaciones que fijen una versión concreta del modelo (v2 o v3).

## Benchmarks y rendimiento

Los datos de evaluación provienen de la model card del autor y se midieron en un PC con llama-server y el prompt de la aplicación, no en un teléfono. Las tareas no inglesas no han sido revisadas por hablantes nativos.

| Metrica | v2 | v3 |
|---|---|---|
| Evaluación de conversación, resultado de la app, split de test (4.559 conversaciones) | 57% | 74% |
| Evaluación de planificación, modelo solo (3.036 tareas, 55 herramientas) | 2.313 | 2.257 |
| 539 tareas de planificación originales, modelo solo | 478 | 496 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado a Q4_0 y pesar 0,5 GB, cabe holgadamente en cualquier GPU consumer con al menos 1-2 GB de VRAM libre, y también puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con llama.cpp (por ejemplo, RTX 3060 o superior) es suficiente. También funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en dispositivos móviles, dado su tamaño.
- Opciones de despliegue: llama.cpp y llama-server (el autor usó llama-server para la evaluación). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. La evaluación se realizó en un PC, no en un teléfono, y no se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ScanAtlas-Granite-4.0-350M-Planner | 352M | no disponible | Apache-2.0 | GGUF Q4_0 | Especializado en ScanAtlas, no chat general |
| ibm-granite/granite-4.0-350m | 350M | no disponible | Apache-2.0 | safetensors (original) | Modelo base, uso general |
| Alternativas de 350M-500M para tool calling | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en rendimiento o disponibilidad.

## Limitaciones y advertencias

- No es un modelo de chat general: espera el prompt y la gramática JSON específicos de la aplicación ScanAtlas, por lo que su uso fuera de ese contexto producirá resultados no fiables.
- Dependencia de la aplicación: el modelo está acoplado a las tarjetas, herramientas y formato de ScanAtlas; cambios en la app pueden degradar su comportamiento.
- Idiomas no revisados: las tareas no inglesas no han sido revisadas por hablantes nativos, por lo que la calidad en esos 15 idiomas es incierta.
- Evaluación limitada: las métricas se midieron en un PC con llama-server, no en un teléfono, y no se han publicado benchmarks estándar.
- Riesgo de alucinación: no se documenta explícitamente, pero al ser un modelo pequeño especializado en JSON, puede generar planes inválidos o argumentos incorrectos.
- Licencia Apache-2.0: permite uso comercial, pero el autor incluye el archivo LICENSE en el repositorio; conviene verificar los términos del modelo base de IBM.
- Cuantización única: solo se publica Q4_0, lo que puede limitar la precisión frente a otros formatos si se necesita mayor calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aibohphobia1/ScanAtlas-Granite-4.0-350M-Planner-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- llama.cpp: https://github.com/ggml-org/llama.cpp
