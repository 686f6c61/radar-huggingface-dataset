# ravikadam/ganesh-gemma4-e4b

## Resumen

Ganesh SLM es un fine-tune del modelo base google/gemma-4-E4B-it, desarrollado por Ravi Kadam como asistente offline devocional centrado en Shri Ganesha. El modelo recita de forma verbatim shlokas, stotras, aartis, rituales e historias puránicas, y responde en maratí, hindi, inglés o sánscrito sin necesidad de RAG: el canon está integrado en los pesos del modelo. Fue creado específicamente para Ganeshotsav 2026 y su calendario de fechas está congelado en ese año.

El fine-tune usa LoRA con r=64, alpha=128, 3 épocas, lr 1e-4, bf16 y secuencia de 2048 tokens, entrenado sobre un corpus curado de 32 unidades que generó 1.959 pares de entrenamiento (1.216 verbatim, 405 de calendario y 338 de prosa). La característica técnica más destacable es que el texto canónico en devanagari se inserta byte-exacto desde YAML y nunca pasa por el modelo generativo; solo se varía la pregunta. El resultado es un asistente que no inventa versos conocidos, aunque puede fabricar textos no verificados si se le pide un stotra que no conoce.

El modelo se distribuye bajo licencia Gemma, en formato safetensors y litert, con 7.941.034.874 parámetros totales (7,94B), y está pensado para ejecutarse on-device. Es un caso singular en el ecosistema open source: un fine-tune devocional con verificación canónica explícita, documentado con honestidad sobre sus limitaciones y con una clara restricción temporal (solo 2026).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B base) |
| Parámetros totales | 7.941.034.874 (7,94B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (base Gemma 4 E4B soporta contexto largo; el fine-tune se entrenó con seq 2048) |
| Tipos de cuantización | no disponible (repo en bf16 safetensors) |
| Idiomas soportados | maratí (mr), hindi (hi), inglés (en), sánscrito (sa) |
| Licencia | Gemma |
| Formato de pesos | safetensors, litert |

## Arquitectura y entrenamiento

La base es Gemma 4 E4B, un modelo de 4.4B parámetros con entrada multimodal (visión y audio) y modo de razonamiento ("Thinking Mode"), que Google DeepMind describe como adecuado para razonamiento, flujos agénticos, codificación y comprensión multimodal. El fine-tune aplica LoRA con r=64 y alpha=128 únicamente a las capas del language model, ya que las proyecciones vision/audio de Gemma 4 usan `Gemma4ClippableLinear` que PEFT no puede targetear.

El entrenamiento se realizó con 3 épocas, lr 1e-4, bf16, secuencia 2048 en una GPU L40S. El corpus se compone de 32 unidades canónicas (shlokas, stotras, aartis, rituales) y se generaron pares deterministas: el texto devanagari se inserta byte-exacto desde YAML, solo se varía la pregunta. Los textos no verificados se excluyen del entrenamiento. Resultados de entrenamiento: loss final 0,46 y precisión de token 0,97.

## Capacidades

- Recitación verbatim de textos devocionales: Sukhkarta Dukhharta, Ganapati Atharvashirsha (secciones 1-19 más shanti), Sankatnashan Ganesh Stotra, Ganapati Ashtottara Shatanamavali (108 nombres), Ganesha Pancharatnam (5 versos), Vakratunda Mahakaya y Ganapati Gayatri.
- Conocimiento de puja vidhi: pranapratishtha, shodashopachara, durva y las 21 patri, uttarpuja y visarjan.
- Historias puránicas, Ashtavinayak, mandals de Mumbai y fechas del festival de 2026.
- Respuesta multilingüe: se adapta al idioma en que el usuario escribe (maratí, hindi, inglés, sánscrito).
- Refusal explícito: rechaza responder horas de salida de la luna en Sankashti (varía por ciudad y mes), cualquier año distinto de 2026, y colas o tiempos de darshan en vivo (no puede saberlos).
- Marcado de fechas con el año: toda respuesta con fecha se ancla con "En 2026..." para no confundir con el año actual.
- Modo conversacional con chat template estándar de transformers.

## Casos de uso

- Asistente devocional offline en dispositivos móviles: el formato litert y la licencia permiten desplegarlo en smartphones para consultas de shlokas y rituales sin conexión.
- Preparación de puja y festivales: puede guiar el orden de los rituales (shodashopachara, 21 patri, uttarpuja, visarjan) durante Ganeshotsav 2026, con las fechas de Mumbai incluidas en el calendario.
- Educación religiosa: útil para que estudiantes de sánscrito o maratí aprendan y verifiquen la pronunciación exacta de stotras canónicos, ya que el texto se inserta byte-exacto.
- Referencia de historias puránicas: permite consultar las narrativas del Ashtavinotak y las leyendas de Ganesha en el idioma que el usuario prefiera.
- Generación de contenido devocional: puede producir aartis, stotras y textos de puja para publicaciones, vídeos o materiales de Ganeshotsav, siempre que el usuario verifique los textos no canónicos.
- Aplicaciones de chat religioso en maratí/hindi: como componente de un asistente mayor que responda preguntas sobre tradiciones hindúes, con la limitación de no sustituir a un sacerdote o panchang.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo solo reporta métricas de entrenamiento: loss final 0,46 y token accuracy 0,97. No hay comparaciones con otros modelos en tareas estándar (MMLU, HumanEval, GSM8K) ni en tareas devocionales.

## Requisitos de hardware

- VRAM estimada: la base Gemma 4 E4B requiere mínimo 8 GB de VRAM para inferencia en cuantización estándar. El repo ocupa 15,9 GB en bf16, por lo que sin cuantizar se necesitan al menos 16 GB de VRAM.
- GPU recomendadas: L40S (usada en entrenamiento), A100, RTX 4090, RTX 4080 o cualquier GPU con 16 GB+ para bf16 completo; con cuantización 8-bit o 4-bit puede caber en RTX 4060 Ti o similar.
- Consumer GPU: sí, cabe en GPUs de gama alta y media con cuantización.
- Opciones de despliegue: transformers (código de ejemplo incluido), litert para on-device, y compatible con vLLM, llama.cpp u Ollama si se genera el GGUF.
- Latencia: no disponible; al ser un modelo de 4.4B activos, se espera latencia baja en GPU modernas, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| google/gemma-4-E4B-it (base) | 4,4B | contexto largo (según Google) | Gemma | Generalista, multimodal, razonamiento |
| ravikadam/ganesh-gemma4-e4b (este) | 7,94B (LoRA sobre 4,4B base) | no disponible | Gemma | Devocional Ganesha, multilingüe, offline |
| Modelos devocionales genéricos (p.ej. fine-tunes de Llama para religión) | no disponible | no disponible | varía | no disponible |

No se dispone de comparativas directas con otros fine-tunes devocionales de Ganesha en la información proporcionada.

## Limitaciones y advertencias

- Puede fabricar textos: si se le pide un stotra que no conoce (p. ej. "Ganesha Vajrakavacha"), puede recitar otro stotra distinto en lugar de declinar. No se debe confiar en textos no familiares.
- Cuatro textos no incluidos: Ghalin Lotangan, Mantrapushpanjali, Shendur Lal Chadhayo y los mool mantras no fueron verificados contra fuentes fiables y quedaron excluidos del entrenamiento. Ghalin Lotangan normalmente sigue a Sukhkarta Dukhharta en la secuencia de aarti, y este modelo no lo conoce.
- Verificación contra fuentes públicas, no contra pothi impresa: las ediciones difieren en puntuación y convenciones de anusvara/conjuntos; puede haber variaciones respecto a textos impresos.
- No es un guruji ni un panchang: para muhurat, vidhi familiar o cuestiones disputadas, el modelo remite a mayores y sacerdotes.
- Calendario fijado en 2026: no sabe el año actual, y todas las fechas se anuncian con "En 2026..." para evitar ambigüedad.
- No tiene acceso a información en vivo: colas, darshan timings o cualquier dato que requiera conexión están fuera de su alcance.
- Licencia Gemma: restricciones de uso comercial según los términos de Google; revisar la licencia antes de desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ravikadam/ganesh-gemma4-e4b
- Base Gemma 4 E4B en HuggingFace: https://huggingface.co/google/gemma-4-E4B
- Página oficial Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card Gemma 4 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_4
- Gemma 4 E4B en Ollama: https://ollama.com/library/gemma4:e4b
- Análisis de Gemma 4 E4B (gemma4.dev): https://gemma4.dev/models/gemma-4-e4b
