# meettttttttttt/edgecar-0.5b

## Resumen

EdgeCar 0.5B es un ajuste fino supervisado de Qwen2.5-0.5B-Instruct desarrollado por el usuario de Hugging Face `meettttttttttt` para el proyecto EdgeCar AI, un asistente de datos de vehículo que se ejecuta íntegramente en el dispositivo. El modelo no es un chatbot: es un analizador semántico que transforma una pregunta en lenguaje natural sobre los datos registrados del coche en un comando corto de una a tres palabras (por ejemplo, `why energy_consumption` o `trend battery_temp`), que después un motor determinista ejecuta en modo de solo lectura contra los registros locales del vehículo. El modelo nunca ve los datos y no calcula ninguna cifra: solo produce la etiqueta del comando.

La relevancia del modelo está en su planteamiento de seguridad y eficiencia para el borde. Con 494 millones de parámetros y un tiempo de respuesta declarado de unos 0,2 s en dos núcleos de portátil, cabe en hardware muy modesto y funciona sin conexión. Además, la gramática de 115 comandos (10 verbos sobre 15 métricas y 10 tipos de evento) no incluye ninguna acción de control del vehículo, de modo que incluso un fallo del modelo solo puede producir una consulta de lectura.

El modelo se publicó en el contexto del reto Tata Elxsi TELIPORT Season 4 (Case Study 5, "Natural Language Vehicle Information using On-Device SLM/LLM"). Se distribuye con licencia Apache 2.0, únicamente en inglés, y solo está disponible como pesos fusionados en safetensors en este repositorio; las versiones cuantizadas GGUF que usa el proyecto se publican en repositorios separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino de Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Este repositorio: safetensors sin cuantizar; variantes GGUF (Q4_K_M usado en las evaluaciones) en repositorios separados |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF en `meettttttttttt/edgecar-0.5b-GGUF` |
| Tamano del repositorio | 1.0 GB |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Descargas | 177 |
| Fecha de creacion | 2026-10-29 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen2.5-0.5B-Instruct original (transformer decoder-only denso con 494 millones de parámetros) y se obtiene mediante ajuste fino supervisado para una tarea de clasificación generativa restringida: dada una pregunta y un mensaje de sistema fijo, generar la etiqueta del comando. La model card no detalla hiperparámetros de entrenamiento, número de épocas ni composición exacta del dataset más allá de la descripción de los datos.

El conjunto de datos es sintético y consta de 3.795 preguntas etiquetadas con su comando: 417 escritas a mano (505 filas contando variantes con ruido ligero) y 3.290 generadas por plantillas que combinan las formas de frase de cada verbo con métricas, eventos y expresiones temporales, cubriendo los 115 comandos del sistema. La model card menciona además 576 preguntas generadas (el texto disponible se interrumpe en ese punto, por lo que no se detalla su función). No se indica si hubo RLHF, DPO u otras etapas de alineación posteriores al ajuste supervisado.

## Capacidades

- Análisis semántico de preguntas sobre datos de vehículo y emisión de un comando corto entre 115 posibles (10 verbos × 15 métricas × 10 tipos de evento).
- Extracción implícita de ventanas temporales a partir de expresiones como "yesterday", "over the past 10 days", "this month" o "last week"; el código externo traduce la ventana a parámetros.
- Mapeo de verbos semánticos: totales (`total`), tendencias (`trend`), extremos (`when`), comparaciones (`compare`), explicaciones (`why`), listado de eventos (`show`), causalidad previa a un evento (`before`), anomalías (`unusual`) y estado actual (`now`).
- Rechazo de peticiones fuera de alcance mediante la etiqueta `unsupported`: control del vehículo, inyecciones de prompt, preguntas ambiguas o no relacionadas con los datos registrados.
- Generación determinista recomendada (`do_sample=False`, `max_new_tokens=16`), adecuada para integración en pipelines con gramática restringida.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento extendido; su función es exclusivamente la producción de una etiqueta de comando.
- Multilingüe: no; solo inglés.

## Casos de uso

- Asistente de a bordo para consultas sobre consumo: el conductor pregunta "why is my kWh per 100 km so high over the past 10 days?" y el modelo emite `why energy_consumption`; el sistema calcula la respuesta a partir de los registros locales sin enviar datos a la nube, lo que encaja con requisitos de privacidad y funcionamiento sin conexión.
- Diagnóstico de estado de batería y autonomía: preguntas como "which day was the battery the hottest this month" se convierten en `when battery_temp max`, permitiendo que el motor de consultas recupere el extremo y la fecha sin que el modelo acceda a las series temporales.
- Análisis de eventos ADAS: "Did adaptive cruise cut out at any time yesterday?" se traduce en `show adas_disengagement`, útil para revisar desconexiones y solicitudes de toma de control en talleres o flotas.
- Comparativas estacionales de eficiencia: "How much more energy do I use in winter than in summer?" produce `compare energy_consumption temperature`, que el backend resuelve agrupando por temperatura; adecuado para informes de eficiencia energética del propietario.
- Detección de anomalías: "Anything I should be worried about?" se mapea a `unusual`, lo que permite ofrecer un resumen de incidencias (códigos DTC, frenadas bruscas, cargas anómalas) sin que el usuario formule una consulta técnica.
- Visualización de tendencias: "Plot battery temperature over the last 10 days" genera `trend battery_temp`, que un componente de interfaz puede usar para construir la gráfica a partir de los datos locales.
- Despliegue en hardware de borde automotriz: con 494 millones de parámetros y la variante GGUF Q4_K_M, el modelo puede ejecutarse en una unidad de infoentretenimiento o en un portátil de dos núcleos con latencia declarada de unos 0,2 s, sin GPU dedicada.
- Filtro de seguridad en la interfaz de voz: gracias a su comportamiento de rechazo (35/40 peticiones fuera de alcance clasificadas como `unsupported` sin las comprobaciones adicionales de EdgeCar), puede actuar como primera barrera semántica antes de que cualquier petición llegue a capas con privilegios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. La model card aporta únicamente evaluaciones específicas de la tarea:

| Evaluacion | Resultado | Condiciones |
|---|---|---|
| Rechazo de peticiones fuera de alcance (`unsupported`) | 35/40 correctas | Sin las comprobaciones de rechazo de EdgeCar, variante Q4_K_M |
| Rechazo de peticiones de control del vehiculo | 12/12 correctas | Mismo conjunto de prueba |
| Latencia de inferencia | ~0,2 s | Dos nucleos de portatil, segun la model card |
| Precision global en el conjunto de prueba retenido | No disponible como cifra agregada | La model card solo muestra ejemplos cualitativos, incluido un error (`when trip_count max` frente a `when distance max`) |

## Requisitos de hardware

- VRAM estimada: el modelo en safetensors ocupa aproximadamente 1 GB en FP16/BF16 (494 M de parámetros); en GGUF Q4_K_M la huella se reduce a unos 0,3-0,4 GB, aunque la model card no publica la cifra exacta.
- GPU recomendadas: no requiere GPU; el autor reporta ejecución en CPU x86 y ARM. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) puede alojarlo con holgura, pero no es el escenario previsto.
- Cabe en cualquier GPU consumer e incluso en sistemas sin GPU dedicada; también en dispositivos de borde con pocos cientos de MB de RAM libre.
- Opciones de despliegue: transformers (pesos de este repositorio), llama.cpp u Ollama con la variante GGUF y su gramática, y text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput: ~0,2 s por consulta en dos núcleos de portátil según el autor; no se publican cifras de tokens por segundo ni de rendimiento agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeCar 0.5B | 494 M | No disponible | Analisis semantico a comando para datos de vehiculo | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (segun la documentacion publica de Qwen, no verificada en esta ficha) | Chat generalista | Apache 2.0 | Hugging Face |
| EdgeCar 1.5B (GGUF) | No disponible en la informacion | No disponible | Misma tarea, mayor tamano | No indicada en la informacion | Hugging Face (`meettttttttttt/edgecar-1.5b-GGUF`) |

La model card indica que la variante de 1,5B ofrece una precisión medida ligeramente superior, sin diferencia significativa, a cambio de unos 0,6 GB más de memoria. No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo es un analizador semántico restringido: no responde preguntas, no calcula cifras y no conversa. Usarlo como chatbot produciría salidas degeneradas.
- El mensaje de sistema debe ser exactamente la frase de entrenamiento ("Write the EdgeCar command for this question about the vehicle's recorded data, or unsupported."); cualquier variación puede degradar la precisión.
- Solo admite inglés; no hay soporte multilingüe declarado.
- El conjunto de entrenamiento es mayoritariamente sintético (3.290 de 3.795 preguntas generadas por plantillas), lo que puede producir un sesgo hacia las formas de frase de las plantillas y menor robustez ante paráfrasis no vistas.
- La model card documenta al menos un error en el conjunto de prueba retenido (confusión entre `trip_count` y `distance`), lo que indica que la precisión no es perfecta en preguntas de extremos.
- La evaluación de rechazo sin comprobaciones adicionales es de 35/40; en producción el autor recomienda usar la gramática GGUF y las comprobaciones de rechazo de EdgeCar para garantizar comandos válidos.
- El modelo no ve los datos del vehículo, por lo que no puede alucinar cifras, pero sí puede emitir un comando semánticamente incorrecto que devuelva una respuesta errónea; la validación del comando en el backend es imprescindible.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, sin restricciones adicionales conocidas.
- No se documentan sesgos demográficos ni evaluaciones de robustez frente a entradas adversarias más allá del conjunto de rechazo descrito.
- El repositorio tiene 177 descargas y 0 likes en el momento de la consulta, lo que sugiere una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meettttttttttt/edgecar-0.5b
- Variante GGUF 0.5B: https://huggingface.co/meettttttttttt/edgecar-0.5b-GGUF
- Variante GGUF 1.5B: https://huggingface.co/meettttttttttt/edgecar-1.5b-GGUF
- Repositorio del proyecto EdgeCar AI: https://github.com/meet-png/edgecar-ai
- Resultado de la prueba de rechazo (SLM sin guardas, Q4_K_M): https://github.com/meet-png/edgecar-ai/blob/main/eval/results/rerun/refusal_test-slm-noguard-edgecar-0.5b-q4_k_m.json
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
