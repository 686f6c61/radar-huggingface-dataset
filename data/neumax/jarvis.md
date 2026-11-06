# NeuMax/Jarvis

## Resumen

Jarvis (publicado como NeuMax/Jarvis) es un proyecto de asistente personal conversacional que no entrena un modelo propio, sino que envuelve Microsoft Phi-3-mini-4k-instruct (3.800 millones de parametros) en una aplicacion Gradio con memoria persistente, sintesis de voz y un motor de anticipacion en segundo plano. Lo desarrolla el usuario NeuMax y se distribuye con licencia MIT. Su propuesta es ejecutarse de forma local en un Hugging Face Space con 16 GB de RAM y sin GPU, gracias a la cuantizacion en 4 bits del modelo base.

El modelo subyacente es un transformer decoder-only de Phi-3 con 3.800 millones de parametros y una ventana de contexto de 4.096 tokens (la variante 4k). El repositorio en si no contiene pesos propios ni un modelo afinado: es codigo de orquestacion (brain.py, memory.py, thinking.py, voice_tts.py) que llama a Transformers para la inferencia, guarda hechos y historial en SQLite y usa Edge-TTS para las respuestas habladas.

Su relevancia practica es la de un patron de referencia para construir asistentes personales locales de bajo coste: demuestra como combinar un LLM pequeno cuantizado, memoria estructurada y TTS sin GPU dedicada. No obstante, al no existir benchmarks propios ni pesos publicados, debe evaluarse como plantilla de despliegue y no como un modelo nuevo con capacidades medibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3-mini), envuelto en aplicacion Gradio |
| Parametros totales | 3.800 millones (modelo base Phi-3-mini-4k-instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (variante 4k del modelo base) |
| Tipos de cuantizacion | 4 bits, 8 bits y sin cuantizar (fp16), configurables via `JARVIS_QUANT` |
| Idiomas soportados | no disponible en la model card; el modelo base Phi-3 esta orientado principalmente a ingles |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no publica pesos propios; se descargan los del modelo base desde Hugging Face) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de modelo nueva. La inferencia se delega en Microsoft Phi-3-mini-4k-instruct, un transformer decoder-only de 3.800 millones de parametros con contexto de 4.096 tokens, cargado de forma perezosa (lazy-loaded) mediante Hugging Face Transformers y cuantizado opcionalmente a 4 u 8 bits. No se documenta ningun proceso de entrenamiento, afinado, RLHF o DPO propio: los pesos son los del modelo base de Microsoft.

La capa de aplicacion anade tres componentes: un modulo de memoria (memory.py) que persiste hechos y historial de conversacion en SQLite; un motor de anticipacion en segundo plano (thinking.py) que, segun la model card, "predice tus necesidades" y se activa con `JARVIS_THINKING=true`; y un modulo de voz (voice_tts.py) basado en Edge-TTS con la voz en-US-GuyNeural. La configuracion se gestiona por variables de entorno (`JARVIS_MODEL`, `JARVIS_QUANT`, `JARVIS_MEMORY_DIR`, `JARVIS_TTS_VOICE`, `JARVIS_THINKING`). No se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno mediante Phi-3-mini-4k-instruct.
- Memoria persistente de hechos: el comando `remember X is Y` almacena datos en SQLite y el historial de conversacion se conserva entre sesiones.
- Respuestas por voz: sintesis de texto a voz con Edge-TTS (voz en-US-GuyNeural), sin GPU.
- Motor de anticipacion en segundo plano (`anticipate`), que genera sugerencias proactivas segun la configuracion.
- Comandos de control: `status`, `remember` y `anticipate`.
- Interfaz de chat Gradio con entrada de texto y voz.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso nativo: no disponible (el termino "agentic" aparece como tag, pero no se documenta implementacion).
- Capacidades multilingues: no disponibles; el modelo base esta orientado principalmente al ingles.
- Capacidades de vision o audio de entrada: no disponibles.

## Casos de uso

- Asistente personal local sin GPU: desplegado en un Hugging Face Space con 16 GB de RAM, el modelo en 4 bits ocupa aproximadamente 3-4 GB y permite conversaciones con memoria persistente sin coste de infraestructura GPU.
- Prototipo de memoria a largo plazo: el almacenamiento de hechos en SQLite sirve para experimentar con recuperacion de contexto personal (preferencias, datos del usuario) en un asistente de escritorio.
- Interfaz de voz para accesibilidad: la integracion con Edge-TTS permite respuestas habladas en aplicaciones donde la lectura de pantalla no es viable, ejecutandose en CPU.
- Base para asistentes proactivos: el motor `thinking.py` sirve como punto de partida para investigar sugerencias anticipadas y notificaciones contextuales.
- Entorno de pruebas para cuantizacion: las opciones 4bit/8bit/none permiten comparar calidad y consumo de RAM del mismo modelo base en hardware limitado.
- Referencia de orquestacion LLM + TTS + memoria: el codigo (brain.py, memory.py, voice_tts.py) es una plantilla para integrar un LLM pequeno con servicios auxiliares en una aplicacion Gradio.
- Chatbot de escritorio para uso personal: con contexto de 4.096 tokens, es adecuado para conversaciones cortas y tareas de asistencia domestica, no para documentos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones propias ni datos de rendimiento del modelo base; solo se documentan requisitos de RAM.

| Modelo | Cuantizacion | RAM estimada |
|---|---|---|
| Phi-3-mini-4k-instruct (3,8B) | 4 bits | ~3-4 GB |
| Phi-3-mini-4k-instruct (3,8B) | fp16 | ~7,6 GB |
| Mistral-7B-Instruct-v0.2 | 4 bits | ~4-5 GB |
| Mistral-7B-Instruct-v0.2 | fp16 | ~14 GB |

## Requisitos de hardware

- RAM para inferencia: ~3-4 GB con Phi-3-mini en 4 bits; ~7,6 GB en fp16. La model card recomienda 16 GB de RAM para el Space completo.
- GPU: no requiere GPU; el diseno apunta a ejecucion en CPU (hardware `cpu-upgrade` en el Space).
- GPU recomendadas: no disponible. No se documenta soporte ni configuracion para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no evaluada en la informacion disponible; al no requerir GPU, el modelo cabe en cualquier equipo con RAM suficiente.
- Opciones de despliegue: aplicacion Gradio propia (`python app.py`) con Hugging Face Transformers; no se documenta integracion con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| NeuMax/Jarvis | 3,8B (base Phi-3-mini) | 4.096 tokens | MIT | Asistente personal con memoria y voz |
| Microsoft Phi-3-mini-4k-instruct | 3,8B | 4.096 tokens | MIT | LLM base instructivo |
| Mistral-7B-Instruct-v0.2 | 7B | 32.000 tokens | Apache 2.0 | LLM instructivo de mayor tamano |
| OpenJarvis (arquitectura citada) | no disponible | no disponible | no disponible | Inspiracion del proyecto |

La comparacion directa con Phi-3-mini es la mas relevante: Jarvis no supera al modelo base en capacidades de lenguaje, sino que anade memoria persistente, TTS y una interfaz. Frente a Mistral-7B-Instruct-v0.2, Jarvis ofrece menor consumo de RAM (3-4 GB frente a 4-5 GB en 4 bits) pero tambien menor capacidad de razonamiento y un contexto mucho mas corto (4.096 frente a 32.000 tokens).

## Limitaciones y advertencias

- No publica pesos propios: depende de la descarga del modelo base Microsoft Phi-3-mini-4k-instruct; la licencia MIT del repositorio no cubre necesariamente los terminos del modelo base.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Idiomas: la model card no declara idiomas soportados y el modelo base esta orientado principalmente al ingles; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a un modelo de 3,8B sin afinado especifico; la memoria SQLite almacena hechos sin validacion.
- El motor de anticipacion (`thinking.py`) y el comando `anticipate` no documentan su funcionamiento interno ni criterios de calidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento, latencia ni calidad conversacional.
- El TTS usa Edge-TTS, un servicio en la nube de Microsoft; la model card lo describe como "minimal cloud", por lo que la ejecucion no es completamente local.
- Sin soporte documentado de tool calling, function calling ni agentes multi-paso, pese a la etiqueta "agentic".
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: madurez y mantenimiento no verificables.
- No se documentan sesgos conocidos; al heredar el modelo base, arrastra los sesgos de Phi-3-mini.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NeuMax/Jarvis
- Modelo base Phi-3-mini-4k-instruct: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Hugging Face Transformers: https://github.com/huggingface/transformers
- Gradio: https://gradio.app
- Edge-TTS: https://github.com/rany2/edge-tts
