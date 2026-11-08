# lodrick-the-lafted/Apriel-Voice-27B-heretic

## Resumen

Apriel-Voice-27B-heretic es una variante "decensored" (abliterated) del modelo Apriel Voice 27B Preview de ServiceNow, publicada por el usuario independiente lodrick-the-lafted. El modelo original es un sistema abierto de voz y lenguaje que entiende peticiones habladas, razona sobre el contexto conversacional y genera respuestas de texto y llamadas a herramientas, todo ello sobre un backbone compartido Gemma 4 26B-A4B. Esta version concreta aplica la tecnica ARA (abliteration) mediante la herramienta Heretic v2.0.0dev para reducir la tasa de rechazos del modelo afinado original.

El modelo combina un encoder de voz Whisper large-v3-turbo conectado al backbone Gemma 4 26B-A4B (una arquitectura Mixture of Experts con 26 000 millones de parametros totales y aproximadamente 4000 millones activos por token) mediante un proyector aprendido. Con 26 490 625 328 parametros reales en safetensors y un repositorio de 54,5 GB, el checkpoint mantiene las capacidades multimodales del original (audio, texto e imagen) y anade un perfil de rechazo drasticamente reducido: 4 rechazos de cada 100 frente a los 99 de cada 100 del modelo base, con una divergencia KL de 0,1818 respecto al original.

Su relevancia actual radica en que ofrece una via practica para construir asistentes de voz y flujos de atencion al cliente con tool calling sobre un modelo abierto con licencia MIT, sin las restricciones de rechazo del afinado original. Es, sin embargo, un modelo de preview con cero descargas y cero likes en el momento de la ficha, lo que aconseja tratarlo como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (backbone Gemma 4 26B-A4B) con encoder de voz Whisper large-v3-turbo y proyector aprendido |
| Parametros totales | 26 490 625 328 |
| Parametros activos | Aproximadamente 4000 millones (A4B, segun el nombre del backbone) |
| Longitud de contexto | No disponible de forma explicita; el procesador divide audio en fragmentos de 30 s y el audio comparte el presupuesto de contexto con el resto de la conversacion |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | 52 idiomas: en, fr, de, es, pt, nl, pl, it, ar, ja, zh, tr, hi, ko, ru, sv, da, cs, ro, hu, el, ca, nb, vi, th, fa, uk, bn, ta, ur, fi, bg, sr, sl, mk, et, lt, lv, ka, cy, gl, sw, mn, mr, ml, sk, be, br, oc |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo es un sistema de dos etapas: un encoder de voz Whisper large-v3-turbo se conecta al backbone de razonamiento Gemma 4 26B-A4B a traves de un proyector aprendido. El backbone es un transformer Mixture of Experts con 26 000 millones de parametros totales y aproximadamente 4000 millones activos por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano. El entrenamiento del modelo original, segun la model card, se realizo en dos fases: primero se alinea la interfaz de voz y despues se adapta junto con el backbone usando tareas de habla y replay de texto. La supervision combina entropia cruzada y destilacion por profesor segun la fuente de datos; el informe tecnico de ServiceNow describe la receta completa.

Sobre esta base, el autor de la variante heretic aplico Heretic v2.0.0dev con el metodo ARA para reducir los rechazos. El resultado es una divergencia KL de 0,1818 respecto al modelo original (que por definicion tiene KL 0) y una tasa de rechazos de 4/100 frente a 99/100 del afinado de ServiceNow. La propia model card advierte que el tune de Apriel parece mas censurado que el Gemma 4 base y que el modelo no esta completamente decensored, por lo que recomienda modificar el system prompt si aparecen rechazos. No se dispone de datos sobre el numero de tokens de entrenamiento del backbone ni sobre la composicion exacta del dataset.

## Capacidades

- Comprension de habla: transcripcion, traduccion de voz y respuesta a preguntas habladas.
- Razonamiento e instrucciones: seguimiento de instrucciones, peticiones de varios pasos y generacion de llamadas a herramientas estructuradas.
- Tool calling / function calling: emite llamadas estructuradas que la aplicacion ejecuta y cuyos resultados devuelve a la conversacion.
- Contexto multimodal: audio, texto, imagenes y resultados de herramientas en una misma conversacion.
- Modo thinking: disponible y recomendado para audio largo; las evaluaciones del modelo original lo usan.
- Multilingue: 52 idiomas declarados en la model card.
- Reduccion de rechazos: perfil abliterated con 4/100 rechazos, orientado a usos sin filtrado del afinado original.
- Aplicaciones de voz: respuestas de texto pensadas para emparejarse con sintesis externa y gestion de turnos por parte de la aplicacion; el checkpoint no genera habla nativa full-duplex.

## Casos de uso

- Atencion al cliente por voz: el modelo transcribe la peticion del cliente, razona sobre el historial de la conversacion y emite llamadas a herramientas para consultar pedidos o abrir incidencias; el audio comparte el presupuesto de contexto con el texto, y el encoder admite grabaciones continuas de hasta unos 30 minutos con buen rendimiento.
- Asistentes de voz para integracion en aplicaciones: combinado con un sintetizador externo (por ejemplo Cartesia Sonic 3.5, usado en las evaluaciones), permite construir un asistente de dos etapas con latencia media de 1,91 s en las pruebas de τ-Voice del modelo original.
- Transcripcion y traduccion de reuniones: el procesador divide grabaciones de 16 kHz mono en fragmentos de 30 s, lo que permite transcribir y traducir actas de forma automatizada en cualquiera de los 52 idiomas soportados.
- Agentes de soporte tecnico con multi-step reasoning: el modelo encadena varios pasos de razonamiento y llamadas a herramientas para diagnosticar problemas, devolviendo resultados al hilo conversacional.
- Analisis de imagenes en flujos de voz: al conservar la entrada de imagen del backbone Gemma 4, puede describir o razonar sobre capturas enviadas por el usuario dentro de una conversacion hablada.
- Generacion de codigo asistida por voz: dictado de instrucciones habladas que el modelo convierte en codigo o en llamadas a herramientas de CI/CD, aprovechando el soporte de tool calling.
- Investigacion sobre alineacion y abliteration: la variante heretic sirve como caso de estudio reproducible del metodo ARA con Heretic, con metricas de KL y tasa de rechazo publicadas.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo original Apriel Voice 27B Preview, no a la variante heretic. Se presentan tal cual los publica la model card.

| Sistema | Tipo | Fuente | EVA-A | EVA-X | τ-Voice pass@1 | Latencia (s) |
|---|---|---|---:|---:|---:|---:|
| GPT Realtime 2.1 | S2S | Propietario | 59,03 | 61,6 | 69,82 | 1,55 |
| Gemini-3.8 Live Extended Thinking | S2S | Propietario | 54,82 | 73,5 | 84,19 | 1,50 |
| Flux + Gemma 4-26B | 3 etapas | Mixto | 36,07 | 29,22 | 65,92 | 2,92 |
| Parakeet + Gemma 4-26B | 3 etapas | Open source | 39,97 | 3,93 | 67,78 | 3,01 |
| UltraVox v0.6 (Qwen) | 2 etapas | Open source | 8,94 | 1,91 | 26,80 | 3,95 |
| Gemma 4-12B-IT | 2 etapas | Open source | 13,25 | 5,97 | 24,20 | 3,61 |
| Audex-30B-A3B | 2 etapas | Open source | 5,66 | 8,2 | 17,15 | 2,83 |
| Apriel Voice 27B Preview | 2 etapas | Open source | 51,27 | 74,13 | 65,51 | 1,91 |

Ademas, en LibriSpeech el modelo original obtiene un WER del 2,23 % en test-clean y del 5,15 % en test-other. La model card indica que EVA-A mide precision de servicio y EVA-X experiencia conversacional, en escala 0-100, y que los resultados principales usan medias por dominio equitativas y modo thinking. Para la variante heretic solo se publican la divergencia KL (0,1818) y la tasa de rechazos (4/100).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 26 490 millones de parametros en safetensors, en bf16 el checkpoint completo ronda los 53 GB de pesos, por lo que la inferencia sin cuantizar requiere multiples GPU o una GPU con 80 GB de memoria.
- GPU recomendadas: no disponible de forma explicita; por tamano, el modelo completo en bf16 encaja en A100 80 GB o H100 80 GB, y en configuraciones multi-GPU para mayor throughput.
- GPU de consumo: no se confirma que quepa en GPUs de consumo en bf16; en cuantizaciones de 4 bits el peso rondaria los 13-14 GB teoricos, pero no hay variantes GGUF publicadas ni datos verificados de ejecucion en RTX 4090 u otras consumer.
- Opciones de despliegue: transformers (libreria declarada, con custom_code). No se confirman integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: la model card del original reporta 1,91 s de latencia media en τ-Voice para el sistema completo (generacion y sintesis con Cartesia Sonic 3.5). No hay datos de throughput de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apriel-Voice-27B-heretic | 26,49 B totales, ~4 B activos | No disponible | 4/100 rechazos, KL 0,1818 (variante heretic) | MIT | Hugging Face, 0 descargas |
| Apriel Voice 27B Preview | 26,49 B totales, ~4 B activos | No disponible | EVA-A 51,27, EVA-X 74,13, τ-Voice 65,51 | MIT | Hugging Face (ServiceNow-AI), demo en HF Spaces |
| Gemma 4-12B-IT (2 etapas) | 12 B | No disponible | EVA-A 13,25, EVA-X 5,97, τ-Voice 24,20 | No disponible en esta ficha | Open source |
| Audex-30B-A3B (2 etapas) | 30 B totales, MoE | No disponible | EVA-A 5,66, EVA-X 8,2, τ-Voice 17,15 | No disponible en esta ficha | Open source |

La comparativa de rendimiento procede de la tabla publicada por ServiceNow para el modelo original; la variante heretic no aporta benchmarks de tareas, solo metricas de alineacion.

## Limitaciones y advertencias

- Modelo de preview: la version original es un preview y esta variante es un derivado no oficial publicado por un usuario independiente, con cero descargas y cero likes; no hay validacion de la comunidad.
- Decensored parcial: la model card advierte que el modelo no esta completamente decensored y recomienda alterar el system prompt si aparecen rechazos.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni de alucinacion para esta variante.
- Sesgos: no se publican analisis de sesgos; al ser un afinado abliterated, la reduccion de rechazos puede aumentar la probabilidad de contenido inapropiado o danino en produccion.
- Audio largo: el rendimiento se degrada a medida que crece la duracion; se observo buen comportamiento hasta unos 30 minutos y se recomienda modo thinking para grabaciones largas.
- Contexto compartido: el audio comparte el presupuesto de contexto con el resto de la conversacion, y la longitud practica depende de la memoria de GPU y de la cache del encoder.
- Voz no nativa: el checkpoint genera texto y llamadas a herramientas, no habla full-duplex; requiere un sintetizador externo y gestion de turnos por parte de la aplicacion.
- Licencia: MIT, lo que permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo abliterated recae en el desplegador.
- Idiomas: aunque se declaran 52 idiomas, no hay evaluaciones por idioma publicadas en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lodrick-the-lafted/Apriel-Voice-27B-heretic
- Modelo base en Hugging Face: https://huggingface.co/ServiceNow-AI/Apriel-Voice-27B-preview
- Backbone: https://huggingface.co/google/gemma-4-26B-A4B-it
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Demo de Apriel: https://servicenow-ai-apriel.hf.space/home
- Blog de Apriel Voice: https://servicenow-ai-apriel.hf.space/blog/apriel-voice-preview
- Informe tecnico: https://servicenow-ai-apriel.hf.space/documents/apriel-voice-preview-tech-report
- Perfil del autor: https://huggingface.co/lodrick-the-lafted/models
- Referencia del paper: https://www.chatpaper.ai/dashboard/paper/c28785a7-a3fa-4146-8a3e-03c3a550f251
