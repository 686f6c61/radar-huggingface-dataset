# flaukowski/flaukowski-brain-gemma3-4b-lora

## Resumen

Flaukowski-brain-gemma3-4b-lora es un adaptador PEFT (LoRA) publicado por el usuario flaukowski sobre el modelo base google/gemma-3-4b-it. No se trata de un modelo generalista, sino de un ajuste fino orientado a replicar la voz y personalidad de un personaje de ficcion: Flaukowski, ingeniero de mas de cincuenta anos, co-presentador del podcast *Ghost Signals* y protagonista del audio drama *The Story of Flaukowski*. El adaptador se entrena sobre los guiones de ambos programas para que el modelo responda con el registro seco, practico y concreto del personaje.

El problema que resuelve es acotado: dotar de una voz consistente y reconocible a un personaje conversacional dentro de un universo narrativo (KAX City), en lugar de ofrecer capacidades generales de asistente. Tecnicamente es un LoRA de rango 32 entrenado con QLoRA sobre Gemma 3 4B instruct, con un conjunto de datos de 1.124 ejemplos extraidos de 42 guiones de *Ghost Signals* y 14 de *The Story of Flaukowski*.

Su relevancia es limitada y muy especifica: sirve como ejemplo de ajuste de persona sobre un modelo pequeno (4B) con recursos modestos (una unica GPU L40S alquilada), y como pieza de un ecosistema mayor que incluye una version fusionada y cuantizada en GGUF para Ollama y llama.cpp. No es un modelo para produccion generalista ni para tareas de razonamiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (adaptador LoRA de rango 32 sobre base de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base google/gemma-3-4b-it) |
| Tipos de cuantizacion | QLoRA durante el entrenamiento; version GGUF cuantizada disponible en repo separado |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-4b-it, un transformer decoder-only de la familia Gemma 3. El ajuste se realizo con QLoRA de rango 32, 3 epocas y una tasa de aprendizaje de 2e-4, sobre una unica GPU L40S alquilada. El conjunto de entrenamiento consta de 1.124 ejemplos construidos a partir de 42 guiones de *Ghost Signals* y 14 guiones de *The Story of Flaukowski*; cada ejemplo termina en una intervencion del personaje, con los turnos previos como contexto. Se descartaron las lineas de menos de cuatro palabras, y tres episodios completos (77 ejemplos) se reservaron como conjunto de validacion sin entrenarse.

La innovacion tecnica destacable no esta en la arquitectura, sino en el procedimiento de evaluacion: la perplejidad sobre el conjunto reservado paso de 3160 antes del ajuste a 11,01 despues, lo que indica una adaptacion muy fuerte al estilo del personaje (y, por tanto, un riesgo elevado de sobreajuste al guion y de deriva fuera de dominio). El prompt de sistema utilizado durante el entrenamiento define explicitamente al personaje y establece que no es un asistente sino el mismo; los demas interlocutores se introducen en el turno de usuario con el nombre por delante (por ejemplo, `Kannaka: ...`).

## Capacidades

- Generacion de texto conversacional en ingles con una voz de personaje concreta (registro seco, concreto y practico).
- Respuestas breves en dialogos de dos interlocutores, especialmente cuando el otro participante es Kannaka.
- Mantenimiento de la persona a traves de turnos cuando se usa el prompt de sistema y el formato de nombre por delante.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de pensamiento (thinking).
- Multilingue: no; solo ingles segun la model card.
- Capacidad de generar respuestas evasivas, devolver preguntas o responder con una sola palabra, por diseno del personaje.

## Casos de uso

- Interpretacion de personaje en ficcion interactiva: el adaptador puede encarnar a Flaukowski en una novela visual o un chat narrativo ambientado en KAX City, respondiendo a los turnos del jugador con la voz entrenada.
- Generacion de dialogos para el podcast o el audio drama: util para producir borradores de intervenciones de Flaukowski que el guionista revisa y pule, gracias a la coherencia de registro aprendida de los guiones originales.
- Prototipado de personajes conversacionales: sirve como referencia tecnica de como ajustar una persona sobre un modelo de 4B con QLoRA en una sola GPU, con un conjunto de datos pequeno y curado.
- Companero de conversacion tematico en demos y experiencias de marca del universo *Ghost Signals*, donde el objetivo es la fidelidad de voz y no la utilidad como asistente.
- Pruebas de evaluacion de persona: permite medir perplejidad y coherencia estilistica sobre conjuntos reservados y comparar estrategias de ajuste con otros adaptadores.
- Despliegue local ligero: mediante la version GGUF publicada en repo separado, puede ejecutarse en Ollama o llama.cpp en equipos de consumo para demos offline del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la perplejidad sobre el conjunto reservado:

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Perplejidad (held-out) | 3160 | 11,01 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un base de 4B, la huella depende de la cuantizacion del base y no se documenta en la model card.
- GPU recomendadas: no disponible; el entrenamiento se realizo en una unica L40S (48 GB), pero no se especifican requisitos de inferencia.
- Cabe en GPU de consumo: probablemente si, dado el tamano del base (4B) y la existencia de una version GGUF, pero no se aportan cifras concretas.
- Opciones de despliegue: PEFT sobre transformers para el adaptador; Ollama y llama.cpp para la version GGUF del repo flaukowski/flaukowski-brain-gemma3-4b-GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flaukowski-brain-gemma3-4b-lora | Base 4B + LoRA r32 | No disponible | Persona de ficcion | Gemma Terms of Use | Hugging Face (adaptador + GGUF) |
| google/gemma-3-4b-it | 4B | No disponible en esta ficha | Asistente generalista | Gemma Terms of Use | Hugging Face |
| Adaptadores de persona genericos | Variable | Variable | Estilo/persona | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion factual elevada: el modelo inventa lugares, comercios y nombres sobre el pasado del personaje; nada de lo que diga sobre su historia o sobre proyectos reales debe tratarse como cierto.
- Sobreajuste al guion: la caida de perplejidad de 3160 a 11,01 sugiere una adaptacion muy agresiva, con riesgo de respuestas rigidas o poco generalizables fuera del dominio de los guiones.
- Rendimiento debil en explicaciones largas: fue entrenado con dialogo guionizado de dos interlocutores, por lo que rinde mejor en respuestas cortas.
- Errores de pronombre: en ocasiones se equivoca con el pronombre de Kannaka (ella).
- No es un asistente: por diseno evade, responde con preguntas o da respuestas de una palabra.
- Idioma: solo ingles; no hay soporte multilingue documentado.
- Restricciones de licencia: el uso esta sujeto a los Gemma Terms of Use, que incluyen condiciones de uso aceptable y obligaciones de atribucion; conviene revisarlas antes de cualquier uso comercial.
- Origen de los datos: los guiones se escribieron con asistencia de IA (Claude) bajo la direccion del creador del programa, y el modelo se entreno y publico del mismo modo; esto afecta a la trazabilidad y a los derechos sobre los datos.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaukowski/flaukowski-brain-gemma3-4b-lora
- Version GGUF fusionada y cuantizada: https://huggingface.co/flaukowski/flaukowski-brain-gemma3-4b-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
