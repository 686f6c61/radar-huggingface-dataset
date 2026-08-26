# ravikadam/ganesh-gemma4-e4b-v2

## Resumen

`ravikadam/ganesh-gemma4-e4b-v2` es un ajuste fino de tipo LoRA sobre el modelo base `google/gemma-4-E4B-it`, desarrollado por Ravi Kadam para crear un asistente devocional offline dedicado a Shri Ganesha. El modelo responde en marathi, hindi, inglés y sánscrito, y recita de forma verbatim un canon de shlokas, stotras, aartis y rituales, sin depender de sistemas de recuperación aumentada (RAG): todo el conocimiento está incrustado en los pesos del modelo.

El problema que resuelve es la necesidad de un asistente devocional preciso y reproducible para celebraciones como el Ganeshotsav 2026, con respuestas que no se desvíen del texto canónico. Es relevante porque demuestra un caso de uso de modelos de lenguaje pequeños (SLM) en dispositivos móviles y edge, gracias a su compatibilidad con la librería LiteRT y a un entrenamiento con una técnica de splicing byte-exact para evitar alucinaciones en textos sagrados.

El modelo base Gemma 4 E4B es un SLM de 4,4 mil millones de parámetros con entrada multimodal y modo de razonamiento (Thinking Mode), según fuentes web de Google DeepMind y gemma4.dev. El adaptador LoRA se entrenó sobre el componente de lenguaje del modelo, excluyendo las proyecciones de visión y audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 E4B, con proyecciones multimodales) |
| Parametros totales | No disponible (modelo base Gemma 4 E4B: 4,4B según fuentes web) |
| Parametros activos | No disponible (adaptadores LoRA) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en bf16) |
| Idiomas soportados | Marathi (mr), hindi (hi), ingles (en), sanscrito (sa) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | No disponible (libreria LiteRT; se carga con transformers desde Hugging Face) |

## Arquitectura y entrenamiento
El modelo se basa en Gemma 4 E4B, un SLM de Google con arquitectura Transformer y capacidad multimodal (visión, audio y texto). El ajuste fino utiliza LoRA (r=64, alpha=128) sobre las capas del modelador de lenguaje, excluyendo las capas `Gemma4ClippableLinear` que envuelven las proyecciones de visión y audio, ya que PEFT no puede targetizarlas. El entrenamiento se realizó en una GPU L40S con bf16, secuencia de 2048 tokens, 3 épocas y una tasa de aprendizaje de 1e-4, alcanzando una pérdida final de 0,46 y una exactitud de token de 0,97.

El conjunto de datos se generó de forma determinista a partir de un corpus curado de 32 unidades canónicas: se crearon 1.959 pares de entrenamiento (1.216 de recitado verbatim, 405 de calendario y 338 de prosa). El texto en Devanagari se inserta byte-exact desde archivos YAML y nunca pasa por un modelo generativo, lo que evita que el modelo altere el texto canónico. La parte de pregunta se varió para generar diversidad.

## Capacidades
- Recitación verbatim y exacta de textos sagrados: Sukhkarta Dukhharta (de Samarth Ramdas), Ganapati Atharvashirsha (secciones 1-19 y shanti final), Sankatnashan Ganesh Stotra (Narada Purana), Ganapati Ashtottara Shatanamavali (los 108 nombres), Ganesha Pancharatnam (de Adi Shankara), Vakratunda Mahakaya y Ganapati Gayatri.
- Conocimiento de rituales y vidhi: pranapratishtha, shodashopachara, uso de durva y las 21 hojas (patri), uttarpuja y visarjan.
- Cobertura de historias puránicas, los ocho templos de Ashtavinayak, los mandals de Mumbai y las fechas del festival de Ganeshotsav 2026.
- Respuesta multilingüe: el modelo responde en el idioma que el usuario escribe, con soporte para marathi, hindi, inglés y sánscrito.
- Comportamiento deliberado de rechazo: se niega a dar horarios de salida de la luna para Sankashti, responde solo sobre el año 2026 (con etiqueta "In 2026...") y no conoce información en vivo (darshan, colas).
- Uso offline: sin RAG, todo el conocimiento está en los pesos, lo que permite inferencia en dispositivos con LiteRT.

## Casos de uso
- **Asistente devocional personal**: un devoto puede preguntar por el texto de una aarti o stotra y el modelo lo recita verbatim en marathi o hindi, útil para seguir la secuencia durante un puja en casa.
- **Guía de rituales para Ganeshotsav**: el modelo explica los pasos de la pranapratishtha, el shodashopachara o el visarjan, con detalles específicos de la tradición de Mumbai, lo que sirve como referencia rápida durante las celebraciones.
- **Educación en textos sánscritos**: estudiantes y profesores pueden usar el modelo para obtener el texto exacto de versos como el Ganapati Atharvashirsha, con la seguridad de que el Devanagari está copiado byte a byte, evitando errores de transcripción.
- **Aplicación móvil offline**: gracias a su compatibilidad con LiteRT y a que es un SLM, el modelo puede integrarse en una aplicación móvil que funcione sin conexión, ofreciendo respuestas en regiones sin acceso estable a internet.
- **Apoyo a la preparación de eventos**: los organizadores de mandals en Mumbai pueden consultar las fechas de 2026 y los horarios de los muhurats (como el de 11:20-13:48 para Mumbai) para planificar actividades, aunque el modelo aclara que esos datos son específicos de la ciudad.
- **Herramienta educativa para el patrimonio cultural**: el modelo puede utilizarse en museos o centros culturales para explicar las historias de los Ashtavinayak o las variantes de los stotras, con un enfoque en la fidelidad textual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son los del entrenamiento: pérdida final de 0,46 y exactitud de token de 0,97. No se dispone de comparaciones con otros modelos en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- **VRAM estimada**: el modelo base Gemma 4 E4B requiere un mínimo de 8 GB de VRAM según fuentes web de gemma4.dev y ollama.com. El adaptador LoRA añade una pequeña cantidad adicional, pero no se ha publicado una cifra exacta.
- **GPU recomendadas**: cualquier GPU moderna de consumidor con al menos 8 GB de VRAM, como una RTX 4060 o superior, o una GPU de centro de datos como L40S (utilizada en el entrenamiento) o A100/H100.
- **Compatibilidad con GPU de consumidor**: sí, el modelo cabe en GPUs de gama media y alta para uso doméstico.
- **Opciones de despliegue**: se puede usar con `transformers` y `AutoModelForCausalLM` como se muestra en el README; también es compatible con LiteRT para despliegue en dispositivos móviles. No se menciona soporte para vLLM, Ollama o TGI en la información del autor, pero al ser un modelo de la familia Gemma, es probable que sea compatible con estas herramientas (no confirmado).
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares
No se dispone de información sobre modelos similares específicos para tareas devocionales o con el mismo enfoque de recitación verbatim. El modelo se compara directamente con su base, `google/gemma-4-E4B-it`, que ofrece capacidades generales de lenguaje, razonamiento y multimodalidad, pero no tiene el conocimiento especializado en Ganesha ni la garantía de fidelidad textual que proporciona este fine-tune. Otras alternativas como `gemma-2-2b` o `gemma-3-4b` podrían ser adaptadas con un fine-tune similar, pero no se han encontrado ejemplos públicos comparables en la información disponible.

## Limitaciones y advertencias
- **Puede fabricar textos**: el modelo puede recitar un stotra distinto al solicitado si no conoce el texto (por ejemplo, "Ganesha Vajrakavacha") en lugar de rechazar la petición. No se debe confiar en textos desconocidos que genere.
- **Textos no incluidos**: cuatro textos no están en el entrenamiento (Ghalin Lotangan, Mantrapushpanjali, Shendur Lal Chadhayo y los mool mantras), por lo que el modelo no los conoce y puede responder erróneamente.
- **Verificación de fuentes**: los textos canónicos se verificaron contra fuentes públicas, no contra una edición impresa, por lo que pueden existir variaciones en puntuación, anusvara o numeración de secciones.
- **Limitación temporal**: el calendario está fijado en 2026; no responde sobre otros años y siempre indica el año en las respuestas.
- **No es un panchang**: no proporciona horarios de salida de la luna ni información astronómica precisa; para muhurat y rituales familiares, se recomienda consultar a un sacerdote.
- **Licencia**: el modelo está bajo la licencia Gemma de Google, que tiene restricciones de uso comercial; es necesario revisar los términos específicos de la licencia antes de usarlo en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ravikadam/ganesh-gemma4-e4b-v2
- Adaptador LoRA en Hugging Face: https://huggingface.co/ravikadam/ganesh-gemma4-e4b-lora
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 E4B en Ollama: https://ollama.com/library/gemma4:e4b
- Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
- Perfil de LinkedIn del autor: https://www.linkedin.com/in/ravikadam/</think>## Resumen
`ravikadam/ganesh-gemma4-e4b-v2` es un ajuste fino de tipo LoRA sobre el modelo base `google/gemma-4-E4B-it`, creado por Ravi Kadam como asistente devocional offline dedicado a Shri Ganesha. El modelo responde en maratí, hindi, inglés y sánscrito, recitando de forma literal shlokas, stotras, aartis y rituales, sin depender de RAG: el canon está integrado en los pesos. Su propósito es ofrecer un asistente fiable para el Ganeshotsav 2026, con respuestas textuales verificadas y un comportamiento que evita la invención de contenido no canónico.

La relevancia actual radica en que demuestra un caso práctico de modelos SLM en dispositivos (on-device) con la librería LiteRT, combinando un modelo base multimodal (Gemma 4 E4B, 4,4 mil millones de parámetros) con un adaptador LoRA especializado. La técnica de entrenamiento con splicing byte-exact garantiza que los textos sagrados no pasen por un modelo generativo, lo que reduce alucinaciones en contenido devocional. El modelo se creó en 2026, lo que explica su calendario fijado en ese año.

## Especificaciones tecnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 E4B, multimodal con proyecciones de visión y audio) |
| Parámetros totales | No disponible (modelo base Gemma 4 E4B: 4,4 B según fuentes web) |
| Parámetros activos | No disponible (adaptadores LoRA) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (entrenado en bf16) |
| Idiomas soportados | Maratí (mr), Hindi (hi), Inglés (en), Sánscrito (sa) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | No disponible (librería LiteRT; uso con transformers y safetensors presumiblemente) |

## Arquitectura y entrenamiento
El modelo es un fine-tune LoRA sobre Gemma 4 E4B, un SLM de Google con arquitectura Transformer y capacidades multimodales (texto, visión, audio). El adaptador LoRA (r=64, alpha=128) se aplica únicamente al modelo de lenguaje, excluyendo las capas `Gemma4ClippableLinear` que envuelven las proyecciones de visión y audio, ya que PEFT no puede targetizarlas. El entrenamiento se realizó en una GPU L40S con bf16, secuencia de 2048 tokens, 3 épocas y tasa de aprendizaje 1e-4, alcanzando una pérdida final de 0,46 y una exactitud de token de 0,97.

El corpus de entrenamiento se generó de forma determinista a partir de 32 unidades curadas, creando 1.959 pares (1.216 verbatim, 405 calendario, 338 prosa). Los textos en Devanagari se insertan byte-exact desde YAML y nunca pasan por un modelo generativo, garantizando la fidelidad del texto sagrado. Solo la pregunta se varía para generar diversidad.

## Capacidades
- Recitación literal y exacta de textos sagrados: Sukhkarta Dukhharta, Ganapati Atharvashirsha (secciones 1-19 y cierre), Sankatnashan Ganesh Stotra, Ganapati Ashtottara Shatanamavali (los 108 nombres), Ganesha Pancharatnam (de Adi Shankara), Vakratunda Mahakaya y Ganapati Gayatri.
- Conocimiento de rituales y puja vidhi: pranapratishtha, shodashopachara, uso de durva y las 21 hojas, uttarpuja y visarjan.
- Cobertura de historias Puránicas, los Ashtavinayak, los mandals de Mumbai y las fechas del festival de Ganeshotsav 2026.
- Multilingüe: responde en el idioma del usuario (maratí, hindi, inglés, sánscrito) según la pregunta.
- Comportamiento deliberado de rechazo: no responde sobre horarios de luna en Sankashti, ni sobre años distintos a 2026, ni sobre eventos en vivo (darshan, colas). Siempre etiqueta las fechas con "In 2026...".
- Funcionamiento offline: sin RAG, el canon está en los pesos, lo que permite inferencia en dispositivos sin conexión.

## Casos de uso
- **Asistente devocional personal**: un usuario puede pedir la letra de una aarti o stotra y el modelo la recita verbatim en maratí o hindi, útil durante celebraciones en casa.
- **Guía de rituales para Ganeshotsav**: el modelo explica los pasos de la pranapratishtha, el shodashopachara o el visarjan, con detalles de la tradición de Mumbai, sirviendo como referencia rápida para organizadores.
- **Educación en textos sánscritos**: estudiantes y profesores pueden obtener el texto exacto de obras como el Ganapati Atharvashirsha, con la seguridad de que el Devanagari es correcto byte a byte, evitando errores de transcripción.
- **Aplicación móvil offline**: gracias a LiteRT y al tamaño reducido, el modelo se puede integrar en una app que funcione sin conexión, ofreciendo respuestas devocionales en zonas sin internet.
- **Planificación de eventos comunitarios**: los mandals de Mumbai pueden consultar las fechas de 2026 y los muhurats específicos (por ejemplo, el intervalo de 11:20-13:48 para Mumbai) para organizar celebraciones.
- **Herramienta de preservación cultural**: el modelo puede utilizarse en museos o centros culturales para explicar las historias de los Ashtavinayak y las variantes de los textos, con un enfoque en la fidelidad textual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son del entrenamiento: pérdida final 0,46 y exactitud de token 0,97. No hay comparaciones con otros modelos en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- **VRAM estimada**: el modelo base Gemma 4 E4B requiere un mínimo de 8 GB de VRAM según gemma4.dev y ollama.com. El adaptador LoRA añade una pequeña sobrecarga adicional, no especificada.
- **GPU recomendadas**: cualquier GPU NVIDIA con al menos 8 GB de VRAM, como RTX 4060 o superior, o GPUs de datacenter como L40S (utilizada en entrenamiento), A100 o H100.
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en GPUs de gama media y alta de consumo.
- **Opciones de despliegue**: se puede usar con `transformers` y `AutoModelForCausalLM` (ejemplo en README). También es compatible con LiteRT para despliegue on-device. No se menciona soporte para vLLM, Ollama o TGI en la información del autor, aunque al ser un modelo Gemma, es probable que sea compatible.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares
No se dispone de información sobre modelos similares específicos en la categoría devocional o de recitación de textos sagrados. La comparación principal es con el modelo base `google/gemma-4-E4B-it`, que ofrece capacidades generales de lenguaje, razonamiento y multimodalidad, pero sin la especialización en Ganesha ni la garantía de fidelidad textual que este ajuste proporciona. Otras alternativas como `gemma-2-4B` o `gemma-3-4B` podrían ser adaptadas con un fine-tune similar, pero no se han encontrado ejemplos comparables en la información disponible.

## Limitaciones y advertencias
- **Puede fabricar textos**: si se le pide un stotra que no conoce (por ejemplo, "Ganesha Vajrakavacha"), puede recitar un texto diferente en lugar de rechazar la petición. No se debe confiar en textos desconocidos generados por el modelo.
- **Textos no incluidos**: cuatro textos (Ghalin Lotangan, Mantrapushpanjali, Shendur Lal Chadhayo y los mool mantras) no se entrenaron porque no pudieron verificarse contra una fuente fiable. El modelo no los conoce.
- **Verificación de fuentes**: los textos canónicos se verificaron contra fuentes públicas, no contra una edición impresa; pueden existir diferencias en puntuación, anusvara o numeración de secciones.
- **Calendario fijo**: el modelo solo conoce el año 2026; no responde correctamente sobre otros años y siempre indica el año en sus respuestas.
- **No es un panchang**: no proporciona horarios de salida de la luna ni información astronómica en tiempo real; para muhurats y rituales familiares, se recomienda consultar a un sacerdote.
- **Restricciones de licencia**: la licencia Gemma de Google tiene condiciones específicas para uso comercial; es necesario revisarlas antes de desplegar el modelo en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ravikadam/ganesh-gemma4-e4b-v2
- Adaptador LoRA en Hugging Face: https://huggingface.co/ravikadam/ganesh-gemma4-e4b-lora
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 E4B en Ollama: https://ollama.com/library/gemma4:e4b
- Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
- Perfil de LinkedIn del autor: https://www.linkedin.com/in/ravikadam/
