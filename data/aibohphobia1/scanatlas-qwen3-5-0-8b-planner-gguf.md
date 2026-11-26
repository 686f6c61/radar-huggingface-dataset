# aibohphobia1/ScanAtlas-Qwen3.5-0.8B-Planner-GGUF

## Resumen

ScanAtlas-Qwen3.5-0.8B-Planner es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario aibohphobia1 en Hugging Face. No se trata de un modelo conversacional de propósito general, sino de un planificador especializado que genera acciones para el asistente en dispositivo de la aplicación ScanAtlas, en 15 idiomas. El modelo espera el prompt y la gramática JSON propios de la aplicación, por lo que su uso fuera de ese contexto no está previsto por el autor.

El proceso de creación consistió en fusionar LoRAs entrenadas con ejemplos de planificación de ScanAtlas en los pesos de texto del modelo base y posteriormente cuantizar el resultado a Q4_0 con llama.cpp b11799. El resultado es un único archivo GGUF de aproximadamente 1,5 GB, con 752.393.024 parámetros totales, distribuido bajo licencia Apache-2.0.

La relevancia del modelo radica en su enfoque: un planificador compacto (menos de 1.000 millones de parámetros) pensado para ejecutarse en el propio dispositivo, con soporte de tool calling y multi-turno sobre tarjetas y acciones previas de la aplicación. La versión v5 incorpora entrenamiento sobre 3.075 conversaciones multi-turno en 15 idiomas mezcladas con 2.000 ejemplos de un solo turno, y mejora la evaluación de conversación del 59 % al 77 % respecto a la v4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); no se detalla en la informacion disponible |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (unica publicada en el repo) |
| Idiomas soportados | 15 idiomas (no se enumeran en la informacion disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de 752 millones de parámetros. Sobre esa base se entrenaron LoRAs con ejemplos del planificador de ScanAtlas, que posteriormente se fusionaron en los pesos de texto del modelo. El resultado se cuantizó a Q4_0 mediante llama.cpp b11799. No se especifican en la información disponible detalles sobre la composición completa del dataset, el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

El entrenamiento de la versión v5 se realizó sobre 3.075 conversaciones multi-turno en 15 idiomas (respuestas a preguntas como "¿cuál querías decir?", "deshaz eso", "ponlo en 6", "el segundo", "ahí también" y seguimientos similares) mezcladas con 2.000 ejemplos de un solo turno. La innovación principal es la integración del estado de la aplicación en el prompt: el modelo recibe las opciones de cada tarjeta previa y el tool, argumentos y estado de cada tarjeta de acción, lo que le permite resolver referencias y correcciones sobre turnos anteriores. El modelo genera salidas con gramática JSON orientada al tool calling.

## Capacidades

- Planificación de acciones para la aplicación ScanAtlas mediante generación de llamadas a herramientas en formato JSON.
- Tool calling / function calling: el modelo está entrenado para seleccionar entre 55 herramientas en las tareas de evaluación del planificador.
- Razonamiento multi-turno: resuelve referencias a tarjetas anteriores, correcciones ("deshaz eso", "el segundo") y modificaciones ("ponlo en 6").
- Multilingüe: entrenado en 15 idiomas, aunque las tareas no inglesas no han sido revisadas por hablantes nativos.
- Seguimiento de estado de la aplicación: interpreta opciones de tarjetas previas y el estado de acciones anteriores incluidos en el prompt.
- No es un modelo de chat general: requiere el prompt y la gramática JSON de la aplicación.

## Casos de uso

- Asistente en dispositivo de ScanAtlas: el modelo genera las acciones (herramientas y argumentos) que la aplicación ejecuta a partir del prompt de la app y el estado de las tarjetas, con un tamaño que permite ejecución local.
- Resolución de referencias en conversaciones multi-turno: responde a "el segundo", "ahí también" o "¿cuál querías decir?" consultando las opciones de tarjetas anteriores incluidas en el prompt.
- Corrección y deshacer acciones: interpreta instrucciones como "deshaz eso" o "ponlo en 6" y emite la llamada de herramienta correspondiente con los argumentos actualizados.
- Flujos de seguimiento sobre acciones previas: encadena nuevas peticiones a partir del estado de una tarjeta de acción ya ejecutada, usando el tool y los argumentos registrados.
- Despliegue local con llama.cpp: al distribuirse como GGUF Q4_0 de unos 1,5 GB, puede integrarse en builds de la aplicación que usan llama-server o llama.cpp.
- Evaluación y ajuste del planificador: sirve como referencia para medir la precisión de planificación (2.672 sobre 3.036 tareas en v5) en el conjunto de herramientas de la app.

## Benchmarks y rendimiento

| Metrica | v4 | v5 |
|---|---|---|
| Evaluacion de conversacion (resultado de la app, split de test, 4.559 conversaciones) | 59 % | 77 % |
| Evaluacion del planificador, modelo solo (3.036 tareas, 55 herramientas) | 2.608 | 2.672 |
| 539 tareas originales del planificador, modelo solo | 496 | 512 |

Las mediciones se realizaron en un PC con llama-server y el prompt de la aplicación, no en un teléfono. Las tareas en idiomas distintos del inglés no han sido revisadas por hablantes nativos.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado a Q4_0 y pesar aproximadamente 1,5 GB el archivo, la inferencia requiere del orden de 1,5-2 GB de memoria, aunque la cifra exacta no está publicada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabe en GPU de consumo.
- GPU de consumo: el tamaño del archivo (1,5 GB) sugiere que cabe en GPUs de consumo con al menos 2-4 GB de VRAM, aunque no se confirma en la información disponible.
- Opciones de despliegue: llama.cpp (el autor usó llama-server y llama.cpp b11799); compatible con endpoints según los tags del repositorio.
- Latencia y throughput: no disponibles. La evaluación se hizo en PC, no en dispositivo móvil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ScanAtlas-Qwen3.5-0.8B-Planner | 752.393.024 | no disponible | Apache-2.0 | GGUF en Hugging Face | Planificador especializado para ScanAtlas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B (aproximado) | no disponible | no disponible | Hugging Face | Modelo base; capacidades generales no detalladas en la informacion disponible |
| Alternativas de planificacion de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion |

No se dispone de información sobre otros modelos comparables de planificación en dispositivo con la que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de chat general: espera el prompt y la gramática JSON de la aplicación ScanAtlas; su uso fuera de ese contexto no está previsto.
- Las tareas en idiomas distintos del inglés no han sido revisadas por hablantes nativos, por lo que la calidad multilingüe no está validada.
- La evaluación se realizó en un PC con llama-server, no en un teléfono; el rendimiento en dispositivo no está medido.
- Solo se publica cuantización Q4_0, lo que puede implicar pérdida de precisión frente a los pesos originales.
- Riesgo de alucinación y de selección incorrecta de herramientas: en la evaluación del planificador v5 se obtuvieron 2.672 sobre 3.036 tareas, es decir, hay errores en una parte de los casos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero el modelo está modificado respecto al original y la licencia se incluye como archivo `LICENSE`.
- El repositorio mantiene la versión v4 para builds de la aplicación que la fijan; conviene verificar qué versión usa cada integración.

## Enlaces

- Hugging Face: https://huggingface.co/aibohphobia1/ScanAtlas-Qwen3.5-0.8B-Planner-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog o demo del modelo: no disponible en la información proporcionada.
