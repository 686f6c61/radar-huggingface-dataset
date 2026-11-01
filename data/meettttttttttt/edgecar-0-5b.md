# meettttttttttt/edgecar-0.5b

## Resumen

EdgeCar 0.5B es un ajuste fino supervisado de Qwen2.5-0.5B-Instruct desarrollado por el usuario meettttttttttt para el proyecto EdgeCar AI, un asistente de datos de vehículo que se ejecuta íntegramente en el dispositivo. El modelo no es un chatbot: es un parser semántico que traduce una pregunta en inglés sobre los datos registrados del coche a un comando corto de una a tres palabras, que después ejecuta el propio sistema del vehículo de forma de solo lectura sobre sus registros. El modelo nunca ve los datos del vehículo.

La arquitectura subyacente es Qwen2 (transformer decoder-only denso) con 494.032.768 parámetros, derivada del modelo instruct de 0,5B de Qwen2.5. El contexto heredado de la familia Qwen2.5 es de 32.768 tokens, aunque la tarea real requiere únicamente generar entre 1 y 16 tokens de salida. El modelo se distribuye en safetensors (pesos fusionados) y también en formato GGUF cuantizado, que es el que emplea el sistema EdgeCar en producción.

Su relevancia radica en el enfoque: en lugar de generar texto libre, el modelo produce comandos dentro de una gramática cerrada de 10 verbos sobre 15 métricas y 10 tipos de evento (115 comandos en total). Esto elimina por diseño la posibilidad de que el modelo ejecute acciones sobre el vehículo, ya que la gramática no contiene comandos de escritura. Está pensado para entornos edge con requisitos de latencia muy bajos (unos 0,2 s en dos núcleos de portátil) y funcionamiento offline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantización | GGUF (el autor publica una variante GGUF; se menciona Q4_K_M en los resultados de evaluación) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo `edgecar-0.5b-GGUF`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2. El ajuste es un fine-tuning supervisado orientado a una tarea de parsing semántico restringido, no un entrenamiento con RLHF o DPO según la información disponible. La innovación principal no está en la arquitectura sino en la formulación de la tarea: el modelo se entrena para emitir comandos de una a tres palabras pertenecientes a una gramática cerrada, y en producción se combina con una gramática de decodificación que garantiza que toda salida sea un comando válido.

El conjunto de datos de entrenamiento consta de 3.795 preguntas sintéticas, cada una etiquetada con su comando: 417 escritas a mano (505 filas con variantes de ruido ligero) y 3.290 generadas a partir de plantillas que cruzan las formas de frase de cada verbo con métricas, eventos y expresiones temporales, cubriendo los 115 comandos. Se descartaron 576 preguntas generadas por solapamiento o duplicidad con el conjunto. El prompt de sistema es fijo y forma parte del entrenamiento: "Write the EdgeCar command for this question about the vehicle's recorded data, or unsupported."

## Capacidades

- Parsing semántico de preguntas en inglés sobre datos de vehículo a comandos de una a tres palabras.
- Cobertura de 10 verbos (`total`, `trend`, `when`, `compare`, `why`, `show`, `before`, `unusual`, `now`, `unsupported`) sobre 15 métricas y 10 tipos de evento, 115 comandos en total.
- Extracción implícita de ventanas temporales a partir de expresiones como "yesterday", "over the past 10 days", "this month" o "last week".
- Clasificación de peticiones fuera de alcance como `unsupported`, incluyendo peticiones de control del vehículo, inyecciones de prompt y preguntas ambiguas.
- Generación determinista recomendada (`do_sample=False`) con salidas muy cortas (16 tokens máximo en el ejemplo del autor).
- No soporta tool calling general, agentes multi-paso, visión, audio ni razonamiento libre: es un clasificador/parser restringido a dominio.
- Multilingüe limitado al inglés.

## Casos de uso

- Asistente de datos de vehículo en el propio coche: el modelo traduce preguntas del conductor a comandos que el sistema ejecuta de solo lectura sobre los registros locales, sin conexión a la nube y con latencia de unos 0,2 s en dos núcleos de portátil.
- Análisis de consumo energético: preguntas como "why is my kWh per 100 km so high over the past 10 days" se convierten en `why energy_consumption`, y el sistema calcula la explicación a partir de los logs.
- Consulta de eventos ADAS: preguntas sobre desenganches de control de crucero adaptativo o peticiones de toma de control se mapean a `show adas_disengagement` o `before adas_takeover_request`, permitiendo revisar el histórico de seguridad del vehículo.
- Diagnóstico de averías: la consulta de códigos de fallo (DTC) y su contexto previo se resuelve con `show dtc` y `before dtc`, útil para talleres o apps de mantenimiento predictivo.
- Comparativas estacionales o de recorrido: `compare energy_consumption temperature` permite contrastar consumo en invierno frente a verano o ciudad frente a autopista sin que el modelo manipule los datos.
- Detección de anomalías: la pregunta "anything I should be worried about?" se resuelve con `unusual`, que dispara un análisis de anomalías sobre los últimos 30 días.
- Integración en apps móviles o firmware embebido: gracias a su tamaño (0,5B) y a la variante GGUF, puede desplegarse en ARM y x86 sin GPU dedicada, con la gramática de decodificación garantizando salidas válidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta una evaluación específica de rechazo: con las comprobaciones de declinación de EdgeCar desactivadas, el modelo por sí solo responde `unsupported` a 35 de 40 peticiones de control del vehículo, inyecciones de prompt, preguntas fuera de alcance y ambiguas, incluidas las 12 de 12 peticiones de control del coche. En la tabla de ejemplos de la model card se muestra un fallo de parseo en el conjunto de test retenido ("What was my longest driving day last month?" produce `when trip_count max` en lugar de `when distance max`).

| Evaluación | Resultado |
|---|---|
| Rechazo de peticiones de control del vehículo | 12/12 correctas |
| Rechazo total (control, inyección, fuera de alcance, ambiguas) | 35/40 correctas |
| Latencia en dispositivo (2 núcleos de portátil) | ~0,2 s |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 para los 494M de parámetros; en torno a 0,3-0,5 GB con cuantización GGUF Q4_K_M.
- GPU recomendadas: no requiere GPU; el autor reporta ejecución en CPU x86 y ARM. Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) con holgura.
- Cabe en GPU consumer y en dispositivos embebidos; el repo GGUF está pensado para despliegue on-device.
- Opciones de despliegue: transformers (repo safetensors), llama.cpp u Ollama mediante el repo GGUF con su gramática, y text-generation-inference (el modelo está etiquetado como compatible con endpoints TGI).
- Latencia y throughput: ~0,2 s por consulta en dos núcleos de portátil según el autor; no se reportan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeCar 0.5B | 494M | no disponible | Parser semántico de dominio cerrado (115 comandos) | Apache 2.0 | HuggingFace (safetensors y GGUF) |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (según la familia Qwen2.5) | Chat generalista | Apache 2.0 | HuggingFace |
| EdgeCar 1.5B (GGUF) | no disponible | no disponible | Misma tarea, mayor precisión, ~0,6 GB más de memoria | no disponible | HuggingFace |

La comparación con modelos de propósito general no es directa: EdgeCar 0.5B sacrifica la conversación abierta por una precisión alta en una tarea muy acotada y por garantías de seguridad por diseño (gramática sin comandos de escritura). Frente a Qwen2.5-0.5B-Instruct, el ajuste mejora el parseo de comandos de dominio pero pierde capacidad de diálogo general.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo responde a preguntas sobre datos registrados del vehículo; cualquier otra cosa debe clasificarse como `unsupported`.
- Solo inglés; no se reporta soporte multilingüe.
- Riesgo de parseo incorrecto incluso en el conjunto de test retenido (el ejemplo del autor con `trip_count` frente a `distance`).
- El prompt de sistema debe ser exactamente el de entrenamiento; desviarse de él degrada el comportamiento.
- Entrenado con datos sintéticos (3.795 preguntas, mayoría generadas por plantillas), lo que puede limitar la cobertura de formulaciones reales no vistas.
- La seguridad frente a acciones sobre el vehículo depende de la gramática de decodificación y de las comprobaciones de declinación del sistema EdgeCar, no solo del modelo; el propio autor reporta 5 fallos de rechazo de 40 en la prueba sin guardas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Sin benchmarks estándar publicados; la evaluación se limita a pruebas de rechazo y ejemplos cualitativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/meettttttttttt/edgecar-0.5b
- Variante GGUF: https://huggingface.co/meettttttttttt/edgecar-0.5b-GGUF
- Variante 1.5B GGUF: https://huggingface.co/meettttttttttt/edgecar-1.5b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del proyecto EdgeCar AI: https://github.com/meet-png/edgecar-ai
- Resultado de la prueba de rechazo: https://github.com/meet-png/edgecar-ai/blob/main/eval/results/rerun/refusal_test-slm-noguard-edgecar-0.5b-q4_k_m.json
