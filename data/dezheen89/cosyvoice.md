# Dezheen89/cosyvoice

## Resumen

CosyVoice3 — Badini Kurdish TTS es un ajuste fino (fine-tune) del modelo CosyVoice3 orientado a la síntesis de voz en kurdo badini (badînî), una variedad del kurdo septentrional (kurmanji, código `kmr`). Lo publica el usuario Dezheen89 en Hugging Face bajo licencia Apache 2.0 y con un repositorio de 2,0 GB. El modelo base es CosyVoice3, desarrollado por el equipo FunAudioLLM, un sistema de text-to-speech con clonación de voz zero-shot.

El modelo resuelve un problema concreto: la escasez de sistemas TTS de calidad para lenguas minoritarias como el badini. En lugar de entrenar desde cero, el autor ha ajustado el componente LLM del modelo base (`model_all/llm.pt`) sobre grabaciones de tres hablantes reales (hayfa, abdullah y bafreen), manteniendo sin cambios los módulos de flow, hift y tokenizer del modelo original, que se descargan automáticamente desde el repositorio `computeram/cosyvoice3-badini-tts`.

La relevancia actual radica en que la clonación de voz zero-shot permite generar habla en badini con solo unos segundos de referencia, lo que facilita aplicaciones de accesibilidad, preservación lingüística y doblaje sin necesidad de grandes corpus. El repositorio incluye los clips de referencia y el script de inferencia, pero no publica detalles sobre arquitectura interna, número de parámetros ni datos de entrenamiento más allá de los tres hablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CosyVoice3 (modelo base de FunAudioLLM); fine-tune del modulo LLM, con modulos flow, hift y tokenizer sin cambios |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kurdo badini (`kmr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch); ficheros `model_all/llm.pt` y modulos base descargados del repo `computeram/cosyvoice3-badini-tts` |

## Arquitectura y entrenamiento

El modelo se apoya en CosyVoice3, un sistema TTS de clonación de voz zero-shot. Según la model card, el fine-tune afecta únicamente al componente LLM (`model_all/llm.pt`), entrenado sobre los tres hablantes incluidos en el repositorio; los módulos de flow, hift y tokenizer permanecen idénticos a los del modelo base y se obtienen desde `computeram/cosyvoice3-badini-tts`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal es la adaptación zero-shot: cada generación requiere un clip de referencia corto (3–7 s, WAV mono a 44,1 kHz) junto con su transcripción exacta. El concepto de "emoción" en este modelo no es un control abstracto, sino la selección de una grabación real concreta del hablante (natural, enfadado, triste, feliz, miedo, sorpresa). Hayfa dispone de las seis emociones; abdullah y bafreen no tienen grabación neutra ("natural") y solo cubren las cinco restantes.

## Capacidades

- Síntesis de voz (text-to-speech) en kurdo badini a partir de texto de entrada.
- Clonación de voz zero-shot: reproduce la voz del hablante de referencia usando un clip corto y su transcripción.
- Selección de emoción mediante la elección del clip de referencia real (natural, enfadado, triste, feliz, miedo, sorpresa).
- Tres voces preconfiguradas: `hayfa` (femenina, seis emociones), `abdullah` (masculina, cinco emociones) y `bafreen` (femenina, cinco emociones).
- Soporte para voces adicionales mediante `--prompt-wav` y `--prompt-text-file` con un clip del hablante y su transcripción exacta.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo "thinking".

## Casos de uso

- Preservación lingüística del badini: generar audiolibros, cuentos o material didáctico en kurdo badini a partir de texto escrito, usando las voces incluidas para mantener una locución coherente en todo el contenido.
- Accesibilidad para personas con discapacidad visual: convertir documentos y artículos en kurdo badini a audio con una voz natural, aprovechando la clonación zero-shot para elegir el timbre preferido por el usuario.
- Doblaje y localización de vídeo: sustituir la pista de voz de contenido educativo o divulgativo por una locución en badini, seleccionando la emoción (enfadado, triste, feliz) según la escena mediante el clip de referencia adecuado.
- Asistentes de voz en kurdo badini: integrar el modelo en un pipeline de atención al cliente o kiosco interactivo, usando una voz fija (`hayfa`, `abdullah` o `bafreen`) para respuestas habladas consistentes.
- Investigación en TTS para lenguas minoritarias: servir de base para experimentos de adaptación a otros dialectos kurdos, ya que el repositorio separa el LLM ajustado de los módulos base y permite sustituir solo el componente adaptado.
- Creación de contenido para redes y pódcast: generar locuciones cortas en badini con distintas emociones sin necesidad de grabar a un hablante, útil para prototipos y pruebas de concepto.
- Evaluación de clonación de voz: comparar la fidelidad de la clonación con las tres voces y las emociones disponibles para medir la calidad del fine-tune antes de desplegarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 2,0 GB, lo que da una cota inferior del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se especifica si cabe en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: el flujo documentado usa el repositorio oficial de CosyVoice (`git clone --recursive https://github.com/FunAudioLLM/CosyVoice.git`), la instalación de `requirements.txt` y `huggingface_hub`, y el script `infer.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CosyVoice3 — Badini Kurdish TTS (este modelo) | no disponible | no disponible | kurdo badini (`kmr`) | Apache 2.0 | Hugging Face (`Dezheen89/cosyvoice`) |
| CosyVoice3 base (FunAudioLLM) | no disponible | no disponible | multilingue (no detallado) | no disponible en la informacion | Repositorio oficial FunAudioLLM/CosyVoice |
| `computeram/cosyvoice3-badini-tts` | no disponible | no disponible | kurdo badini | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a licencia, idioma y disponibilidad.

## Limitaciones y advertencias

- El modelo solo declara soporte para kurdo badini (`kmr`); no se documenta comportamiento en otras lenguas o dialectos.
- Cada generación exige un clip de referencia y su transcripción exacta; una transcripción incorrecta degrada la calidad de la clonación.
- Abdulla y Bafreen no tienen grabación neutra ("natural"), por lo que no pueden generar voz neutra con esas voces.
- No se publican datos sobre sesgos, tasas de alucinación o fidelidad de la clonación; se recomienda evaluar manualmente antes de usar en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base CosyVoice3 y los módulos descargados desde `computeram/cosyvoice3-badini-tts` pueden tener condiciones propias que deben verificarse por separado.
- El repositorio depende de descargas externas de los módulos flow, hift y tokenizer; si esos artefactos cambian o desaparecen, la inferencia puede romperse.
- No hay información sobre latencia, throughput ni requisitos de VRAM, lo que dificulta planificar el despliegue.
- Riesgo de uso indebido de la clonación de voz: al tratarse de un sistema zero-shot, conviene aplicar controles de consentimiento y verificación de hablantes en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dezheen89/cosyvoice
- Repositorio de módulos base: https://huggingface.co/computeram/cosyvoice3-badini-tts
- Repositorio oficial de CosyVoice (FunAudioLLM): https://github.com/FunAudioLLM/CosyVoice
