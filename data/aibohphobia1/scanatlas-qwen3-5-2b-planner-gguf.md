# aibohphobia1/ScanAtlas-Qwen3.5-2B-Planner-GGUF

## Resumen

ScanAtlas-Qwen3.5-2B-Planner-GGUF es un ajuste fino del modelo Qwen/Qwen3.5-2B publicado por el usuario aibohphobia1. No es un modelo conversacional de propósito general: está especializado en planificar acciones para el asistente en dispositivo de la aplicación ScanAtlas, en 15 idiomas. El modelo espera el prompt y la gramática JSON específicos de la aplicación, por lo que su uso fuera de ese contexto produce resultados degradados. Se distribuye exclusivamente en formato GGUF cuantizado a Q4_0, pensado para ejecución local mediante llama.cpp.

El proceso de adaptación consistió en fusionar LoRAs entrenados sobre ejemplos de planificación de ScanAtlas en los pesos de texto del modelo base, seguido de una cuantización a Q4_0 con llama.cpp build b11799. El modelo base Qwen3.5-2B aporta la arquitectura transformer subyacente y la tokenización multilingüe; el ajuste fino añade la capacidad de interpretar tarjetas de interfaz, correcciones del usuario y referencias anafóricas ("el segundo", "hazlo 6", "ahí también") para emitir llamadas a herramientas en JSON.

La relevancia del modelo es acotada pero clara: demuestra un caso de uso de modelos pequeños (1.880 millones de parámetros) desplegados en dispositivo para agentes con tool calling estructurado, con una ventana de contexto que debe cubrir turnos previos de conversación. La versión v5 mejora sustancialmente la evaluación conversacional respecto a v4 (64% a 83% de resultado correcto en la app), a costa de una ligera regresión en la evaluación de planificación aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (única publicada) |
| Idiomas soportados | 15 idiomas (no se enumeran en la información disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer del base Qwen/Qwen3.5-2B, con 1.881.825.088 parámetros en los pesos de safetensors originales. Sobre esa base se entrenaron LoRAs específicos con ejemplos de planificación de ScanAtlas, que posteriormente se fusionaron en los pesos de texto. El resultado se cuantizó a Q4_0 mediante llama.cpp b11799, generando un artefacto GGUF de aproximadamente 3,6 GB en el repositorio.

El conjunto de entrenamiento de la versión v5 combina 3.075 conversaciones multiturno en 15 idiomas con 2.000 ejemplos de un solo turno. Las conversaciones multiturno cubren respuestas a preguntas de desambiguación ("¿cuál querías decir?"), deshacer acciones ("undo that"), modificación de parámetros ("make it 6"), referencias ordinales ("the second one") y seguimientos ("there too"). La aplicación muestra al modelo las opciones de cada tarjeta previa y el estado de cada tarjeta de acción (herramienta, argumentos y estado), lo que constituye la señal principal para resolver referencias. No se documenta el uso de RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Planificación de acciones: genera llamadas a herramientas en JSON según la gramática de la aplicación ScanAtlas, sobre un conjunto de 55 herramientas en la evaluación de planificación.
- Tool calling estructurado: emite herramienta, argumentos y estado conforme al esquema JSON esperado por la app.
- Razonamiento multiturno: interpreta respuestas previas de tarjetas, correcciones del usuario y referencias anafóricas a elementos anteriores de la conversación.
- Desambiguación: responde a preguntas del tipo "¿cuál querías decir?" seleccionando entre opciones presentadas.
- Modificación y deshacer: procesa instrucciones como "undo that", "make it 6" o "the second one" para ajustar acciones previas.
- Multilingüe: entrenado en 15 idiomas (no se especifica la lista).
- No es un modelo de chat general: fuera del prompt y la gramática de la app, su comportamiento no está garantizado.

## Casos de uso

- Asistente en dispositivo de ScanAtlas: el modelo se integra en la app para traducir intenciones del usuario en llamadas a herramientas JSON, con ejecución local en el teléfono y sin depender de la nube; su tamaño de 1,88 mil millones de parámetros y cuantización Q4_0 lo hacen viable en hardware móvil.
- Desambiguación de acciones en interfaces por tarjetas: cuando el usuario responde "el segundo" o "esa no", el modelo resuelve la referencia usando las opciones de tarjetas previas que la app le inyecta en el prompt.
- Corrección de parámetros en flujos guiados: instrucciones como "make it 6" o "there too" se transforman en la actualización del argumento correspondiente de la herramienta seleccionada.
- Reversión de acciones: la instrucción "undo that" se mapea a la herramienta de deshacer con el estado de la acción previa, apoyándose en el historial de tarjetas de acción.
- Seguimiento conversacional corto: conversaciones de varios turnos donde el usuario encadena peticiones sobre la misma tarea sin repetir el contexto completo, gracias al entrenamiento específico en 3.075 diálogos multiturno.
- Despliegue local con llama.cpp: servir el GGUF mediante llama-server o incrustarlo en la app con llama.cpp para inferencia en CPU/GPU de gama baja, con un artefacto de 3,6 GB en disco.
- Evaluación de pipelines de agentes pequeños: usar el modelo como referencia para medir planificación con gramática JSON restringida y 55 herramientas en un entorno controlado.

## Benchmarks y rendimiento

| Metrica | v4 | v5 |
|---|---|---|
| Evaluación conversacional, resultado en la app, split de test (4.559 conversaciones) | 64% | 83% |
| Evaluación de planificación, modelo aislado (3.036 tareas, 55 herramientas) | 2.808 | 2.793 |
| 539 tareas de planificación originales, modelo aislado | 519 | 524 |

Las cifras proceden de pruebas realizadas en un PC con llama-server y el prompt de la app, no en un teléfono. Las tareas en idiomas distintos del inglés no han sido revisadas por hablantes nativos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto Q4_0 ocupa aproximadamente 3,6 GB en el repositorio, por lo que se requiere espacio comparable en memoria o VRAM al cargarlo.
- GPU recomendadas: no disponible; el modelo está pensado para ejecución en dispositivo (teléfono) y en PC con llama-server.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 6-8 GB o más, dado el tamaño del GGUF Q4_0, aunque no se documenta oficialmente.
- Opciones de despliegue: llama.cpp (llama-server, build b11799 o posterior) y cualquier runtime compatible con GGUF; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; las evaluaciones se hicieron en PC con llama-server, sin publicar métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| ScanAtlas-Qwen3.5-2B-Planner | ~1,88 mil millones | no disponible | GGUF Q4_0 | Apache-2.0 | Planificación de acciones específica de ScanAtlas, 15 idiomas |
| Qwen/Qwen3.5-2B (base) | ~1,88 mil millones | no disponible | safetensors | no disponible | Modelo general del que deriva |
| Alternativas de tool calling de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat general: espera el prompt y la gramática JSON de la app ScanAtlas; su uso fuera de ese contrato no está validado.
- Evaluación incompleta: las pruebas se hicieron en PC con llama-server, no en teléfono, y las tareas en idiomas distintos del inglés no fueron revisadas por hablantes nativos.
- Regresión en planificación aislada: v5 baja de 2.808 a 2.793 en la evaluación de 3.036 tareas frente a v4, aunque mejora en el resultado conversacional de la app.
- Idiomas no enumerados: se indica soporte de 15 idiomas pero no se lista cuáles, lo que dificulta validar cobertura.
- Riesgo de alucinación en referencias: al depender de las tarjetas previas inyectadas en el prompt, referencias ambiguas o historiales truncados pueden producir selecciones incorrectas.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Contexto: no se publica la longitud de contexto soportada, dato crítico para conversaciones multiturno largas.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución; el repositorio incluye el archivo LICENSE.
- Cuantización única: solo se publica Q4_0, sin alternativas Q5, Q8 o de mayor precisión para evaluar el impacto de la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aibohphobia1/ScanAtlas-Qwen3.5-2B-Planner-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
