# giocorte/totem-kiosk-extractor-sft-joint

## Resumen

`giocorte/totem-kiosk-extractor-sft-joint` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario giocorte. Resuelve un problema de ingeniería de sistemas conversacionales: unificar en un solo adaptador dos roles que normalmente requieren dos modelos separados, un "chiosco" (kiosco) que atiende al cliente y un "estrattore" (extractor) que mantiene el estado estructurado de la conversación en formato JSON. Al compartir el mismo modelo y la misma conversación, ambos roles pueden reutilizar la caché KV del prefijo, lo que reduce el coste de inferencia en producción.

El adaptador se entrena con SFT conjunto sobre 1.259 conversaciones (1.155 ejemplos de kiosco y 8.202 de extracción), con pérdida calculada únicamente sobre la respuesta JSON en los ejemplos de extracción. Emplea LoRA con rango 32, alpha 64 y todas las proyecciones lineales, sobre un modelo base de 4.000 millones de parámetros con una ventana de contexto que el autor sirve a 32.768 tokens.

La relevancia actual del modelo es acotada y muy específica: no es un modelo de propósito general, sino un artefacto de producción para un dominio concreto (un kiosco de atención al cliente, presumiblemente de transporte o servicios, a juzgar por los campos del estado como `passengers`, `destination`, `pickup`, `luggage` o `travel_class`). Su interés para desarrolladores radica en la técnica de compartición de prefijo entre dos llamadas al mismo modelo y en la validación cuantitativa que el autor publica sobre conversaciones retenidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4.000 millones (modelo base); adaptador LoRA r=32, alpha=64, todas las proyecciones lineales |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de servicio indicada por el autor con `--max-model-len 32768`) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el entrenamiento y la model card están en italiano) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base `Qwen/Qwen3-4B-Instruct-2507` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros. El LoRA usa rango 32, alpha 64 y se inyecta en todas las proyecciones lineales del modelo base. El entrenamiento es SFT conjunto ("joint") con dos tipos de ejemplos mezclados: 1.155 ejemplos del rol de kiosco y 8.202 ejemplos del rol de extractor, derivados de las mismas 1.259 conversaciones del dataset v4. Se entrenan 2 épocas con aproximadamente 16 ejemplos por paso. En los ejemplos de extracción la pérdida se calcula solo sobre la respuesta JSON (estrategia `last_only` en `train_lora.py`).

La innovación técnica central no está en el entrenamiento sino en el protocolo de inferencia. Para extraer el estado, se añade a la conversación un mensaje de usuario que empieza por `[EXTRACT]` y contiene las reglas del extractor (sin ejemplos de otras conversaciones, unos 2.000 tokens), la fecha, el estado actual y las palabras del cliente; la respuesta es un JSON con `state`, `confirms_purchase`, `asks_staff` y `asks_information`, que se descarta después. Para el turno de kiosco, el mensaje del cliente entra precedido de una cabecera `[STATE]` construida a partir de ese JSON (campos obligatorios vacíos como `<REQUIRED>`, opcionales como `<NONE>`), y el modelo responde con un bloque de comandos `kiosk ...` o con la respuesta hablada. Como la conversación es idéntica en ambas llamadas, el servidor reutiliza la caché KV del prefijo y la extracción solo paga su propia petición y respuesta. El autor indica que las peticiones y cabeceras generadas en inferencia son idénticas turno a turno a las del entrenamiento.

## Capacidades

- Generación de texto conversacional en el rol de kiosco de atención al cliente, en italiano.
- Extracción de estado estructurado en JSON a partir de la conversación, con campos como `fare`, `passengers`, `destination`, `date`, `zone`, `pickup`, `service`, `departure`, `origin`, `luggage`, `ride`, `passenger_ages`, `dropoff`, `bikes`, `time`, `travel_class_preference`, `extras` y `extras_quantity`.
- Detección de intenciones específicas: `confirms_purchase`, `asks_staff` y `asks_information`.
- Emisión de comandos de backend en un bloque `bash` con la sintaxis `kiosk ...`, que el sistema ejecuta y cuyos resultados se devuelven como mensaje `Output:`.
- Respuesta hablada al cliente cuando no procede emitir comandos.
- Compartición de caché KV entre las dos llamadas (extracción y kiosco) sobre la misma conversación.
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento explícito más allá del protocolo descrito.

## Casos de uso

- Kiosco de atención al cliente en producción: el adaptador gestiona conversaciones multi-turno con una ventana de 32.768 tokens, manteniendo el estado estructurado de cada cliente (origen, destino, fecha, pasajeros, equipaje) sin necesidad de un segundo modelo dedicado a la extracción.
- Extracción de estado en pipelines de reservas: el rol de extractor convierte mensajes libres del cliente en JSON con campos tipados, lo que permite persistir el estado en una base de datos y reanudar la conversación en sesiones posteriores.
- Enrutado a personal humano: la señal `asks_staff` (100% de acierto en el conjunto retenido según el autor) permite derivar a un agente humano cuando el cliente lo solicita, integrándose en un sistema de tickets o colas.
- Confirmación de compra automatizada: la señal `confirms_purchase` (99% en el conjunto retenido) habilita flujos de cierre de transacción y validación antes de ejecutar el cobro.
- Ejecución de comandos de negocio: el bloque `kiosk ...` permite al modelo invocar operaciones del backend (consultas de disponibilidad, creación de reservas) cuyos resultados se realimentan en la conversación como mensajes `Output:`.
- Despliegue con vLLM y LoRA: el autor documenta el servicio con `vllm serve ... --enable-lora --max-lora-rank 32 --max-loras 1 --enforce-eager`, lo que permite servir el adaptador junto al modelo base en una sola instancia y aprovechar el prefix caching por defecto.
- Evaluación con agentes simulados: el script `agent_bench.py` permite reproducir el banco de pruebas donde el mismo modelo actúa como kiosco y como extractor, útil para comparar variantes del adaptador antes de desplegarlas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conversaciones retenidas (mismas que la v4), comparando el adaptador conjunto con la configuración v4 de dos adaptadores:

| Métrica | Joint (este modelo) | v4 (dos adaptadores) |
|---|---|---|
| Estado exacto, todas las conversaciones | 620/674 (92%) | 620/674 (92%) |
| Estado exacto, estado de producción (sft20) | 78/88 (89%) | 76/88 (86%) |
| Estado exacto, agentes semilla 19 | 165/177 (93%) | 164/177 (93%) |
| Estado exacto, agentes semilla 18 | 112/119 (94%) | 114/119 (96%) |
| Estado exacto, generadas antes (sft12-16) | 265/290 (91%) | 266/290 (92%) |
| `confirms_purchase` | 670/674 (99%) | no disponible |
| `asks_staff` | 674/674 (100%) | no disponible |
| `asks_information` | 605/674 (90%) | no disponible |
| Kiosco: mismo tipo de movimiento | 602/650 (93%) | 596/650 (92%) |
| Kiosco: mismo primer comando | 329/375 (88%) | 328/375 (87%) |
| Kiosco: responde con markdown o lista | 0/263 (0%) | no disponible |
| Kiosco: escribe un JSON de estado en su lugar | 0/650 (0%) | no disponible |

El autor detalla además los campos que difieren en los 674 casos de extracción: `fare` (6), `passengers` (6), `destination` (6), `date` (6), `zone` (5), `pickup` (5), `service` (5), `departure` (4), `origin` (4), `passengers.category` (4), `service.travel_class` (3), `luggage` (2), `ride` (2), `passengers.n` (2), `passenger_ages` (1), `dropoff` (1), `bikes` (1), `time` (1), `departure_time.after` (1), `departure_time.before` (1), `travel_class_preference` (1), `service.id` (1), `extras` (1) y `extras_quantity` (1). No se publican resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el modelo base tiene 4.000 millones de parámetros; en FP16 requiere del orden de 8 GB solo para pesos, más la caché KV para 32.768 tokens de contexto, que puede ser considerable.
- GPU recomendadas: no disponible. El autor solo documenta el servicio con vLLM 0.11 y `--enforce-eager`, sin especificar GPU.
- Viabilidad en GPU de consumo: no confirmada por el autor. El tamaño del modelo base (4B) es compatible con GPUs de consumo de gama alta en cuantizaciones reducidas, pero el adaptador se distribuye sin cuantizar y no se documenta el proceso de conversión a GGUF.
- Opciones de despliegue: vLLM 0.11 con `--enable-lora --max-lora-rank 32 --max-loras 1 --enforce-eager`, que el autor usa como referencia. No se documentan llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. El autor destaca que la compartición de prefijo hace que la extracción solo pague su propia petición (unos 2.000 tokens de reglas) y su respuesta, pero no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `giocorte/totem-kiosk-extractor-sft-joint` | 4B (base) + LoRA r=32 | 32.768 tokens (servicio) | Kiosco + extractor en un solo adaptador | no disponible | Hugging Face (0 descargas, 0 likes) |
| Configuración v4 del mismo autor (dos adaptadores) | 4B (base) + dos LoRA | no disponible | Kiosco y extractor separados | no disponible | Referenciada en la model card, sin repositorio enlazado |
| `Qwen/Qwen3-4B-Instruct-2507` | 4B | no disponible en esta ficha | Modelo base de propósito general | no disponible en esta ficha | Hugging Face (modelo base) |

La comparación relevante es con la configuración v4 de dos adaptadores del mismo autor, que obtiene resultados prácticamente idénticos en extracción y ligeramente inferiores en el rol de kiosco (92% frente a 93% en mismo tipo de movimiento). No se dispone de comparación con modelos de extracción de estado de otros autores.

## Limitaciones y advertencias

- Modelo de dominio muy específico: entrenado para un kiosco concreto con un esquema de estado fijo (transporte o servicios con pasajeros, equipaje, clases de viaje). No es un modelo de propósito general ni un extractor de entidades genérico.
- Idioma: la model card y los datos están en italiano; no se documenta soporte de castellano ni de otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. El modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia, que debe verificarse por separado.
- Riesgo de alucinación en la extracción: aunque el autor reporta un 92% de estado exacto, los errores se concentran en campos concretos (`fare`, `passengers`, `destination`, `date`), lo que puede propagar datos incorrectos al backend si no se valida el JSON.
- Dependencia del protocolo exacto: el rendimiento depende de construir la petición `[EXTRACT]` y la cabecera `[STATE]` exactamente como en el entrenamiento. El autor proporciona `joint_inference.py` para garantizarlo, pero cualquier desviación puede degradar los resultados.
- Requiere `--enforce-eager` en vLLM con LoRA, lo que puede reducir el throughput frente a configuraciones con CUDA graphs.
- Sin descargas ni likes en Hugging Face: no hay evidencia de uso en producción por terceros ni de validación independiente.
- No se documentan sesgos demográficos ni lingüísticos, pero al ser un SFT sobre un dataset privado de conversaciones, es probable que herede los sesgos de ese corpus.
- El repositorio ocupa 0,5 GB y contiene scripts, logs y resultados, pero no se detalla la composición completa del dataset ni su procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/giocorte/totem-kiosk-extractor-sft-joint
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
