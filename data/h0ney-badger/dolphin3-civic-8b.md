# h0ney-badger/dolphin3-civic-8b

## Resumen

`dolphin3-civic-8b` es un modelo de lenguaje de 8.030 millones de parámetros desarrollado por `h0ney-badger` como ajuste fino del modelo base `dphn/Dolphin3.0-Llama3.1-8B`. Está especializado en derecho de registros públicos en Estados Unidos, concretamente en las jurisdicciones de Florida (capítulo 119 de la Ley de Registros Públicos, capítulo 286 de la Ley de Sol, y la sección 316.0777 sobre lectores automáticos de matrículas) y Texas (capítulo 552 de la Ley de Información Pública y capítulo 551 de la Ley de Reuniones Abiertas).

El modelo resuelve el problema de redactar solicitudes de registros públicos que sean difíciles de bloquear, transformar borradores agresivos en cartas formales que las autoridades deban atender, buscar información real en lugar de inventarla y escalar correctamente cuando se recibe una negativa. Su relevancia actual radica en que combina capacidades de *function calling* con un conocimiento jurídico estructurado y un sistema de verificación que reduce la alucinación de datos concretos (nombres, direcciones, fechas).

La arquitectura es un Transformer decoder-only basado en Llama 3.1 8B, con una ventana de contexto que hereda de su modelo base. Se distribuye en formato `safetensors` y `GGUF`, con licencia Apache 2.0 y soporte exclusivo para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) |
| Parametros totales | 8.030.277.696 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (el repositorio incluye `safetensors` y `GGUF`) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se construye mediante un ajuste fino con QLoRA sobre el modelo base `dphn/Dolphin3.0-Llama3.1-8B`, con configuración `r=32`, `a=64` y 2 épocas. Los pesos resultantes se fusionan a 16 bits. El entrenamiento utiliza un dataset sintético destilado, `h0ney-badger/civic-records-distill`, generado a partir de un pipeline de destilación con verificación por *gates*.

La verificación se realiza mediante un conjunto de reglas que rechazan filas de datos antes de que entren en el entrenamiento: comprobación de existencia de citas legales contra un scrape actualizado de estatutos primarios, validación de afirmaciones numéricas según la jurisdicción, y detección de invenciones (correos, teléfonos o cifras donde corresponde un marcador `[PLACEHOLDER]`). No se menciona el uso de RLHF ni DPO.

## Capacidades

- Redacción de solicitudes de registros públicos estructuralmente competentes, adaptadas a los estatutos de Florida y Texas.
- Transformación de borradores agresivos o emocionales en cartas formales que preservan el contenido sustantivo.
- Soporte de *function calling* para buscar información real cuando se dispone de herramientas.
- Capacidad para indicar que un dato concreto es desconocido y pedirlo o dejar un marcador, en lugar de inventarlo.
- Conocimiento de mecánica procesal específica por jurisdicción (plazos, exenciones, mecanismos de apelación).
- Escalado correcto cuando una solicitud es bloqueada, identificando la palanca legal adecuada para el estado en cuestión.
- Redacción de prosa a partir de un "blob" de resultados de búsqueda, citando únicamente lo que aparece en el material fuente.
- Generación de texto y conversación en inglés, con plantilla ChatML y soporte de herramientas.

## Casos de uso

- Redacción de solicitudes de registros públicos para periodistas o ciudadanos: el modelo genera cartas que cumplen los requisitos formales de la Ley de Registros Públicos de Florida o de la Ley de Información Pública de Texas, reduciendo la probabilidad de que sean bloqueadas por defectos técnicos.

- Transformación de quejas o correos agresivos en comunicaciones formales: convierte un borrador cargado de frustración en una carta que una oficina pública debe responder, manteniendo el contenido de fondo y los datos relevantes.

- Asistencia en la búsqueda de información mediante *function calling*: cuando el usuario no conoce el correo de un funcionario o el número de un expediente, el modelo activa herramientas de búsqueda para localizar el dato en fuentes externas.

- Verificación de datos antes de enviar una solicitud: el modelo puede identificar que un dato específico (como una dirección o un número de contrato) no es conocido y sustituirlo por un marcador `[PLACEHOLDER]`, evitando que una dirección inventada impida que la solicitud llegue a su destino.

- Consultas sobre procedimiento legal: responde preguntas sobre plazos estatutarios, exenciones aplicables y mecanismos de apelación en Florida y Texas, basándose en el texto legal vigente.

- Escalado cuando se recibe una negativa: si una solicitud es bloqueada, el modelo sugiere la vía correcta para ese estado, como solicitar una revisión formal o invocar una sección específica de la ley.

- Análisis de documentos y resultados de búsqueda: a partir de un bloque de texto desordenado procedente de una búsqueda, produce una redacción limpia y citada solo con la información presente en ese bloque.

## Benchmarks y rendimiento

La model card incluye una suite de evaluación propia denominada "the constant test", que compara el modelo v7 con el modelo base `stock Dolphin3.0` bajo la misma plantilla ChatML y herramientas. Los resultados son los siguientes:

| Eje | Qué evalúa | Stock Dolphin3.0 | v7 |
|---|---|---|---|
| `foia_draft` | Competencia estructural de una solicitud de registros públicos | 0/8 (0%) | 7/8 (88%) |
| `tone_transform` | Borrador agresivo -> carta enviable, sustancia preservada | 5/6 (83%) | 5/6 (83%) |
| `tools_search` | Herramienta correcta activada, y no activada cuando no es necesaria | 6/8 (75%) | 8/8 (100%) |
| `nofab_tools` | Dato desconocido con herramientas disponibles: búsqueda o pregunta bien especificada | 31/48 (65%) | 44/48 (92%) |
| `nofab_notools` | Mismas preguntas sin herramientas: mide la tendencia de los pesos a inventar | 11/48 (23%) | 37/48 (77%) |
| `grounded_prose` | Blob de búsqueda desordenado -> prosa, citando solo del blob | 18/18 (100%) | 18/18 (100%) |
| `procedure_qa` | Mecánica estatutaria correcta según jurisdicción | 0/10 (0%) | 8/10 (80%) |
| `escalation` | Bloqueo -> palanca correcta para ese estado | 1/6 (17%) | 4/6 (67%) |

El autor destaca que en el eje `nofab_notools`, el modelo base inventaba datos el 77% de las veces, mientras que el v7 lo hace el 23%. No se han publicado benchmarks externos como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Para un modelo de 8B en 16 bits se requeriría aproximadamente 16 GB, pero este dato no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El repositorio incluye pesos en formato `GGUF`, lo que sugiere que puede ejecutarse en CPU o GPU mediante frameworks como llama.cpp u Ollama, pero no se confirma en la documentación.
- Opciones de despliegue: al estar disponible en `safetensors` y `GGUF`, es compatible con frameworks estándar como llama.cpp, Ollama o vLLM. No se detalla ninguna configuración específica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa más directa es contra el modelo base `dphn/Dolphin3.0-Llama3.1-8B`, del cual deriva. El ajuste fino introduce mejoras sustanciales en tareas específicas de registros públicos, como se refleja en la tabla de benchmarks.

| Parametro | dolphin3-civic-8b (v7) | dphn/Dolphin3.0-Llama3.1-8B |
|---|---|---|
| Parametros totales | 8.030.277.696 | 8.072.220.672 |
| Longitud de contexto | No disponible | No disponible |
| Licencia | apache-2.0 | apache-2.0 |
| Disponibilidad | HuggingFace | HuggingFace |
| Rendimiento en `foia_draft` | 88% | 0% |
| Rendimiento en `nofab_notools` | 77% | 23% |
| Rendimiento en `procedure_qa` | 80% | 0% |

No se han identificado otros modelos comparables de la misma categoría en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para las jurisdicciones de Florida y Texas. Su conocimiento legal no es aplicable a otros estados o países sin verificación previa.
- Presenta brechas medibles en varios ejes: `escalation` (67%), `exemption_scoping` (67%), `impossible_request` (22%) y `usability` (50%). En particular, cuando se le pide un registro futuro, tiende a corregir en lugar de cumplir.
- En el eje `nofab_notools`, el modelo aún fabrica datos en el 23% de los casos. El autor advierte que cada dato concreto (nombre, número, dirección, fecha) debe confirmarse antes de enviar una solicitud.
- No siempre aplica de forma espontánea el alcance correcto de exenciones ni menciona a los predecesores de un proveedor; es necesario preguntarle directamente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no debe considerarse sustituto de asesoramiento legal profesional.
- Solo soporta inglés; no hay capacidades multilingües ni de visión o audio.

## Enlaces

- HuggingFace: https://huggingface.co/h0ney-badger/dolphin3-civic-8b
- Dataset de entrenamiento: https://huggingface.co/datasets/h0ney-badger/civic-records-distill
- Pipeline de entrenamiento: https://github.com/h0n3y-badger/civic-distill
- Modelo base: https://huggingface.co/dphn/Dolphin3.0-Llama3.1-8B
