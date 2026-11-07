# adventists-ai/Sophon-Realtime-v1

## Resumen

Sophon-Realtime v1 es un modelo open source de voz a voz (audio-to-audio) en modo full-duplex desarrollado por Adventists AI. Su propuesta central es que el modelo escuche y hable con tono: no solo transcribe y responde, sino que interpreta paralingüística (emoción, énfasis, sarcasmo, risas, suspiros) y genera respuestas habladas con expresión vocal coherente con la conversación. Se publica bajo licencia Apache-2.0, con pesos y código abiertos, y admite inglés y chino.

El modelo se apoya en una representación interna de vectores continuos que el autor describe como un "lenguaje vectorial": el mismo espacio sirve para comprender el audio entrante y para generar el audio saliente, de modo que el tono que el modelo puede oír es el mismo que puede producir. La escucha es continua y el modelo decide en un único token si el usuario ha terminado, sigue hablando, hace back-channeling o está pensando; a partir de la primera pausa redacta un borrador de respuesta que libera cuando determina que le toca hablar, y lo descarta si el usuario sigue hablando.

Es relevante ahora porque compite directamente con modelos propietarios de voz en tiempo real en benchmarks de conversación, razonamiento hablado y tool calling, y porque puede desplegarse en una sola GPU (con una build cuantizada en una GPU de consumo). La información disponible no detalla el número de parámetros, la longitud de contexto ni la composición exacta del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de voz full-duplex con representación vectorial compartida entre escucha y habla; detalles de capas y bloques no publicados) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (se menciona una "build cuantizada" que cabe en una GPU de consumo, sin especificar formatos) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (se descarga vía `hf download`; no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

La información disponible describe el diseño funcional, no los detalles de arquitectura. El modelo mantiene un flujo de vectores continuos mientras escucha; según el autor, ese flujo constituye un lenguaje completo que un LLM congelado puede leer como si fuera texto y que transporta tanto el contenido lingüístico como la prosodia (entonación, énfasis, emoción). Sophon-Realtime v1 escribe directamente en ese lenguaje vectorial y lo convierte de nuevo en audio, compartiendo representación entre entrada y salida.

El comportamiento full-duplex se resuelve con una decisión de un solo token en cada pausa (fin de turno, habla en curso, back-channeling o pausa de pensamiento), con redacción anticipada de la respuesta y descarte del borrador si el usuario continúa. El historial conserva el audio real de ambas partes y, en caso de interrupción, solo la parte que el usuario llegó a oír. No se han publicado datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. El módulo de escucha paralingüística se comercializa como componente separado, DuplexJev (variante DuplexJev-32B-Para).

## Capacidades

- Conversación de voz a voz full-duplex con escucha continua y cambio de turno natural.
- Comprensión paralingüística: emoción, énfasis, sarcasmo, estrés, entonación, risas y suspiros.
- Generación de habla expresiva: el modelo decide cuándo reír, suspirar o carraspear según el contexto conversacional.
- Respuesta rápida: empieza a hablar aproximadamente 0,4 s después de que el usuario deja de hablar.
- Gestión de interrupciones: si el usuario corta, el modelo se detiene y responde a la nueva pregunta.
- Tool calling y function calling en voz (Full-Duplex-Bench v3), con modo "live" que delega en un modelo backend mayor.
- Razonamiento hablado: responde preguntas formuladas oralmente y se evalúa sobre lo que realmente dice.
- Streaming conjunto de texto y voz, con transcripción auditable de cada respuesta.
- Compatibilidad con el formato de interfaz OpenAI GPT-Live, lo que permite conectar clientes de voz en tiempo real existentes.
- Multilingüe limitado a inglés y chino.

## Casos de uso

- Agentes de atención al cliente por voz: el modelo mantiene conversaciones multi-turno, detecta el estado emocional del cliente (frustración, prisa, sarcasmo) y ajusta el tono de la respuesta, con transcripción auditable para trazabilidad y control de calidad.
- Asistentes telefónicos con interrupciones: gracias al full-duplex y a la detección de turno en un token, el usuario puede cortar al agente a mitad de frase y este responde a la nueva pregunta sin esperar a terminar la anterior.
- Automatización de tareas con tool calling: en un centro de soporte o de reservas, el modelo puede invocar funciones (consultar pedidos, cambiar citas, abrir tickets) mientras habla, con un 100 % de tasa de respuesta en Full-Duplex-Bench v3.
- Pruebas de usabilidad y simulación de entrevistas: el habla expresiva y la paralingüística permiten construir interlocutores sintéticos que reaccionan con risas o suspiros, útiles para investigación en interacción humano-máquina.
- Accesibilidad y compañía conversacional: conversaciones de voz naturales para personas con movilidad reducida o que prefieren la voz a la pantalla, con soporte de inglés y chino.
- Evaluación de modelos de voz en pipelines de I+D: al ser Apache-2.0 y compatible con la interfaz GPT-Live, sirve como baseline abierto y desplegable en una sola GPU para comparar sistemas full-duplex propietarios frente a abiertos.
- Modo híbrido con backend mayor: en modo "live", el modelo gestiona el turno y la expresión vocal mientras delega el razonamiento complejo en un LLM mayor, útil para asistentes empresariales que necesitan precisión factual sin sacrificar latencia de voz.

## Benchmarks y rendimiento

| Benchmark | Sophon-Realtime v1 | Referencia propietaria | Mejor open comparable |
|---|---|---|---|
| VoiceBench (overall, juez gpt-4o-mini) | 82,8 | GPT-4o-Audio 86,8; GPT-4o-mini-Audio 82,8 | MiniCPM-o 4.5: 76,1 |
| Big Bench Audio (1.000 preguntas habladas) | 81,8 % | GPT-Live-1: 90 % | Raon SpeechChat: 58 % |
| Full-Duplex-Bench v3, Pass@1 | 48 % | GPT-Realtime 60 %; Gemini Live 3.1 54 % | Ultravox v0.7: 41 % |
| Full-Duplex-Bench v3, responde cuando debe | 100 % | GPT-Realtime 96 % | No disponible |
| Paralingüística combinada (LISTEN + StressTest + MSPB) | 48,6 (DuplexJev) | Gemini 3.8 Flash 46,9 | Qwen3-Omni: 44,6 |
| NVV-SuperBench F1 chino | 0,74 | Baseline sin expresión: 0,37 | No disponible |
| NVV-SuperBench F1 inglés | 0,68 | Baseline sin expresión: 0,27 | No disponible |

Notas de metodología publicadas por el autor: VoiceBench usa el subconjunto estándar de 199 preguntas en AlpacaEval y el resto de puntuaciones proviene del leaderboard de VoiceBench y de la tabla 3 del paper NemotronLabs VoiceChat (arXiv:2609.21967); Big Bench Audio se autoevalúa transcribiendo las respuestas habladas y juzgándolas con gpt-4.1; Full-Duplex-Bench v3 usa 100 tareas juzgadas por GPT-4o y se reporta el mejor de varias ejecuciones; NVV-SuperBench usa 50 ítems por categoría juzgados por Gemini 3 Flash.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el autor no publica el tamaño del modelo ni cifras de VRAM).
- GPU recomendadas: no disponible para el build completo; se indica que el modelo corre en una sola GPU y que una build cuantizada corre en una sola GPU de consumo.
- ¿Cabe en GPU de consumo? Sí, según el autor, mediante la build cuantizada; no se especifica qué modelos concretos (RTX 4090, RTX 3090, etc.) ni con qué cuantización.
- Opciones de despliegue: paquete `sophon-realtime` vía `pip install sophon-realtime`, descarga de pesos con `hf download adventists-ai/Sophon-Realtime-v1`, y servidor compatible con el formato de interfaz OpenAI GPT-Live. Los comandos de lanzamiento están en el directorio `deploy/` del repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia de inicio de habla de aproximadamente 0,4 s tras la pausa del usuario. No se publican cifras de throughput ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Full-duplex | Pesos abiertos | VoiceBench | Big Bench Audio | Tool calling (FDB v3 Pass@1) | Licencia |
|---|---|---|---|---|---|---|
| Sophon-Realtime v1 | Sí | Sí | 82,8 | 81,8 % | 48 % | Apache-2.0 |
| MiniCPM-o 4.5 | Sí | Sí | 76,1 | No disponible | No disponible | No disponible en la información |
| Freeze-Omni | Sí | Sí | 55,2 | 33 % | No disponible | No disponible en la información |
| Moshi | Sí | Sí | 29,5 | 4 % | No disponible | No disponible en la información |
| GPT-4o-Audio / GPT-Realtime | Parcial / Sí | No | 86,8 (4o-Audio) | 90 % (GPT-Live-1) | 60 % | Propietaria |

La ventaja declarada por el autor es ser el modelo abierto full-duplex con mejores resultados en VoiceBench y Big Bench Audio, además de liderar la comprensión paralingüística combinada. Frente a los modelos propietarios, queda por debajo en razonamiento hablado (81,8 % frente a 90 % de GPT-Live-1) y en tool calling (48 % frente a 60 % de GPT-Realtime), aunque supera a Grok (43 %) y a una pipeline en cascada (45 %).

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Sesgos: no se documentan análisis de sesgo demográfico, acento o dialecto; la paralingüística puede interpretar de forma errónea emociones según cultura o prosodia no nativa.
- Alucinación: no se publican tasas de alucinación ni mecanismos de verificación factual; el modo "live" con backend mayor se presenta como mitigación, pero sin datos.
- Transparencia técnica: no se publican número de parámetros, contexto, dataset, etapas de alineación ni formato de pesos, lo que dificulta la reproducibilidad y la estimación de costes.
- Benchmarks autoevaluados: Big Bench Audio y NVV-SuperBench los ejecuta el propio autor, con jueces LLM (gpt-4.1, Gemini 3 Flash) y sin verificación independiente; Full-Duplex-Bench v3 reporta el mejor de varias ejecuciones.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar los términos de los componentes auxiliares (DuplexJev, servidor y dependencias) y las licencias de los datasets de evaluación.
- Producción: el número de descargas en Hugging Face es 0 y el modelo se publicó el 7 de noviembre de 2026, por lo que la madurez del ecosistema (clientes, herramientas de despliegue, soporte) es baja.
- Hardware: la ausencia de cifras de VRAM y de modelos de GPU concretos impide planificar el despliegue sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-v1
- Repositorio GitHub: https://github.com/adventists-ai/sophon-realtime
- Organización en GitHub: https://github.com/adventists-ai
- ModelScope: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-v1
- README en chino: https://huggingface.co/adventists-ai/Sophon-Realtime-v1/blob/main/README_CN.md
- Componente de escucha DuplexJev: https://huggingface.co/adventists-ai/DuplexJev-32B-Para
- Paper citado en la model card: arXiv:2609.21967 (NemotronLabs VoiceChat)
