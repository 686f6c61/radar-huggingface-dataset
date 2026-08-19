# niloy629/bangla-gemma-s2s

## Resumen

Bangla Gemma S2S es un sistema experimental de conversión de voz a voz (speech-to-speech) con generación de vídeo de cabeza parlante (talking head) para el idioma bengalí. Desarrollado por el usuario independiente niloy629, el sistema recibe audio en bengalí, lo procesa mediante el modelo de lenguaje Gemma 4 E4B de Google (que incluye una torre de audio), y produce una respuesta hablada en bengalí junto con un vídeo sincronizado de labios. El repositorio incluye todos los pesos, código y documentación necesarios para reconstruir el sistema completo.

El proyecto no es un modelo monolítico, sino un pipeline compuesto por varios componentes: Gemma 4 E4B como cerebro lingüístico y auditivo, un vocoder Mimi de Kyutai Moshi para síntesis de voz, adaptadores entrenados para convertir estados del modelo en unidades fonéticas y latentes de audio, y el sistema IMTalker para la generación de movimiento facial y renderizado del vídeo. El modelo está pensado para demostrar una arquitectura de asistente conversacional audiovisual en bengalí, con soporte para interrupción (barge-in) y detección de actividad de voz.

La relevancia actual radica en que combina modelos de lenguaje abiertos con síntesis de voz y generación de vídeo en un idioma de bajos recursos como el bengalí, un área poco explorada. El repositorio proporciona un conjunto de datos de 22 735 utterances y scripts de entrenamiento para cada etapa del pipeline, lo que permite reproducir o adaptar el sistema. Sin embargo, el proyecto no tiene descargas ni valoraciones en Hugging Face, y su licencia "other" no especifica claramente los términos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline: Gemma 4 E4B (lenguaje + audio) + Mimi vocoder + adaptadores CTC/run-length/bridge + IMTalker (lipsync) |
| Parametros totales | no disponible (Gemma 4 E4B se estima en ~4B, pero no confirmado; el resto de componentes no declara parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende de Gemma 4 E4B, no especificado) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como .pt y .ckpt, sin cuantización declarada) |
| Idiomas soportados | Bengalí (bn) |
| Licencia | other (sin términos claros; Gemma 4 E4B tiene su propia licencia de Google) |
| Formato de pesos | PyTorch (.pt), Checkpoint (.ckpt), además de assets (PNG, MP4) |

## Arquitectura y entrenamiento

El sistema sigue una arquitectura de tres etapas. Primero, el audio de entrada se procesa mediante la torre de audio de Gemma 4 E4B (cargado como `Gemma4ForConditionalGeneration`), que genera estados de caracteres (2560 dimensiones) durante la generación. Estos estados se convierten en unidades mHuBERT mediante un cabezal CTC contextual (`ctc.pt`), con duraciones por carácter aprendidas por un modelo de longitud (`runlength.pt`). Las unidades se transforman en latentes continuos de Mimi (512 dimensiones a 12.5 Hz) mediante un puente (`units2mimi.pt`), que alimenta al vocoder Mimi para producir la forma de onda de 16 kHz.

Para el vídeo, un adaptador (`gemma_unitalk_adapter.pt`) mapea los estados de caracteres y duraciones a características wav2vec 12×768, que son consumidas por el cuerpo UniTalk de PersonaPlex (inicializado con pesos preentrenados, no entrenado desde cero). El generador y renderizador de IMTalker (congelados) producen el vídeo de cabeza parlante a partir de esas características y una imagen de referencia. El entrenamiento utilizó 22 735 utterances (21 098 train / 1 637 val) procedentes de IndicTTS y 10 000 filas sintéticas. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado por etapas.

## Capacidades

- Conversión de voz a voz en bengalí: recibe audio hablado y genera una respuesta hablada en el mismo idioma.
- Generación de vídeo de cabeza parlante sincronizado con el audio de salida (lipsync mediante IMTalker).
- Soporte de conversación duplex: incluye detección de actividad de voz (Silero VAD) e interrupción (barge-in) en el servidor de demostración.
- Integración con Gemma 4 E4B: aprovecha las capacidades de razonamiento y generación de texto del modelo, aunque la entrada es audio.
- Pipeline modular: cada componente (CTC, run-length, bridge, adaptador facial) es entrenable por separado, lo que permite adaptar el sistema a otras voces o idiomas.
- Reproducibilidad: el repositorio incluye scripts de entrenamiento y extracción de características para todas las etapas.
- No soporta tool calling ni funciones de agente explícitas; es un sistema de diálogo audiovisual.

## Casos de uso

- Asistente conversacional en bengalí para atención al cliente: el sistema puede gestionar turnos de voz con interrupción, respondiendo con audio y vídeo de un avatar, lo que resulta útil en quioscos o aplicaciones de servicio en zonas rurales donde el bengalí es predominante.
- Aplicaciones educativas de idiomas: permite practicar conversación oral en bengalí con un avatar que articula los labios de forma sincronizada, mejorando la experiencia de aprendizaje.
- Lectura de noticias o contenido audiovisual automatizado: dado un guion, el sistema puede generar un vídeo de un presentador hablando en bengalí, reduciendo costes de producción.
- Accesibilidad para personas con discapacidad visual o auditiva: el avatar proporciona una salida visual adicional al audio, y el sistema puede integrarse en dispositivos de asistencia.
- Investigación en síntesis de voz y animación facial para idiomas de bajos recursos: el pipeline modular permite estudiar cada etapa (CTC, puente, adaptador) de forma aislada.
- Prototipos de doblaje automático: al ser un sistema de voz a voz, podría adaptarse para traducir contenido audiovisual al bengalí, aunque actualmente solo opera en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de voz (MOS), precisión de transcripción ni evaluación de sincronización labial. Tampoco se comparan resultados con otros sistemas speech-to-speech.

## Requisitos de hardware

- No se especifican requisitos oficiales en la documentación del repositorio.
- El tamaño total del repositorio es de 5.3 GB, lo que sugiere que los pesos combinados caben en una GPU de consumo medio (por ejemplo, 8-12 GB de VRAM) si se cargan en precisión fp16, aunque Gemma 4 E4B y los componentes de IMTalker pueden requerir más memoria.
- Se recomienda una GPU con al menos 16 GB de VRAM para ejecutar el pipeline completo con el vídeo, dado que IMTalker incluye un generador y un renderizador.
- Opciones de despliegue: los scripts proporcionados (`duplex_server.py`, `voice_server.py`) ejecutan un servidor local con interfaz web; no se menciona compatibilidad con vLLM, Ollama o TGI.
- La latencia y el throughput no están documentados; al ser un pipeline de múltiples etapas, se espera una latencia mayor que un sistema de texto a voz convencional.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en el ecosistema abierto para speech-to-speech con talking head en bengalí. Los sistemas existentes como Whisper + TTS (por ejemplo, Coqui TTS) cubren la parte de voz pero no generan vídeo. Modelos como Meta's SeamlessM4T o Google's AudioLM son bilingües o multilingües pero no incluyen generación de avatar. Por tanto, la comparativa se limita a indicar que no hay alternativas equivalentes publicadas con las mismas capacidades y licencia abierta.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para bengalí; no soporta otros idiomas.
- La licencia "other" no especifica términos claros de uso comercial o modificación; además, Gemma 4 E4B tiene su propia licencia de Google que debe respetarse.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad; su fiabilidad en producción es desconocida.
- No se proporcionan métricas de calidad de voz ni de sincronización labial; el rendimiento real no está verificado.
- El sistema depende de múltiples componentes externos (Mimi, IMTalker, wav2vec2) que deben descargarse por separado, lo que complica la reproducibilidad.
- El entrenamiento se realizó con datos sintéticos en parte (10 000 filas), lo que puede introducir sesgos o artefactos en la voz generada.
- No se documentan riesgos de alucinación en las respuestas de Gemma, pero al ser un modelo de lenguaje, puede generar contenido incorrecto o incoherente.
- El pipeline no está optimizado para baja latencia; no es adecuado para aplicaciones en tiempo real con recursos limitados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/niloy629/bangla-gemma-s2s
- Conjunto de datos: https://huggingface.co/datasets/niloy629/bangla-gemma-s2s-data
- Gemma 4 E4B (modelo base): https://huggingface.co/google/gemma-4-E4B-it
- Wav2Vec2 teacher: https://huggingface.co/facebook/wav2vec2-base-960h
- Documentación de Gemma (Google DeepMind): https://deepmind.google/models/gemma/
- Repositorio de Gemma en GitHub: https://github.com/google-deepmind/gemma
- Proyecto relacionado S2S_B (arquitectura similar): https://github.com/King-Rafat/S2S_B
