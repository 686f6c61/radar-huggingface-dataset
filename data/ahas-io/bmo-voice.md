# ahas-io/bmo-voice

## Resumen

BMO voice es un adaptador LoRA de síntesis de voz (text-to-speech) construido sobre el modelo base fishaudio/s2-pro, un sistema TTS de la familia Fish-Speech. Lo desarrolla el proyecto BMO, una plataforma de agente personal de código abierto, y su función concreta es dotar a ese agente de una voz propia: un timbre original, creado por el autor del proyecto, que habla en coreano e inglés sin depender de la clonación de la voz de terceros. El adaptador se publica como un conjunto de pesos LoRA de rango 8 (alpha 16) aplicados sobre las capas de atención y feed-forward del modelo autorregresivo lento de S2-Pro, junto con dos clips de referencia (uno en coreano y otro en inglés) y un fichero de configuración de la voz.

El modelo no es un TTS autónomo: requiere cargar los pesos de S2-Pro y fusionar el adaptador. Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de cómo publicar una voz LoRA sobre Fish-Speech con sus clips de referencia, sus parámetros de muestreo y su licencia, y como pieza de integración para el servicio bmo-voice. No aporta innovaciones de arquitectura ni datos de entrenamiento publicados; es un artefacto de personalización de voz.

La información disponible es escasa: el repositorio ocupa 0,1 GB, no tiene descargas ni likes, y la model card se limita a describir los ficheros, el procedimiento de uso y la licencia. No se publican métricas de calidad de voz, ni detalles del dataset de entrenamiento del adaptador, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 8, alpha 16) sobre el modelo autorregresivo lento de fishaudio/s2-pro (familia Fish-Speech) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se detalla en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Fish Audio Research License (uso exclusivamente de investigacion y no comercial) |
| Formato de pesos | lora.pt (PyTorch); clips de referencia en WAV; configuracion en TOML |

## Arquitectura y entrenamiento

El adaptador se aplica sobre fishaudio/s2-pro, un modelo TTS de la familia Fish-Speech, que combina un modelo autorregresivo lento con un decodificador. El LoRA tiene rango 8 y alpha 16, y se inyecta en las capas lineales de atención y feed-forward del modelo autorregresivo lento. El checkpoint publicado corresponde al paso 750 de 1.000 del entrenamiento del adaptador. Los pesos base están fijados a la revisión `1de9996b6be38b745688de084d87a5633f714e4e`.

No se especifican en la información disponible el número de tokens, la composición del dataset de entrenamiento, ni si se emplearon técnicas de RLHF o DPO. La voz se creó sin clonar a terceros: los clips `reference.wav` (coreano, tres tomas) y `reference.en.wav` (inglés) contienen la propia voz del autor y se usan como referencia en la generación. La configuración de muestreo recomendada es temperatura 0,7 y top-p 0,7.

## Capacidades

- Síntesis de voz (text-to-speech) en coreano e inglés con un timbre original y consistente.
- Generación condicionada por clips de referencia que transportan el estilo de habla de la voz.
- Integración como adaptador LoRA sobre S2-Pro, cargable con las herramientas estándar de fish-speech.
- Uso dentro del servicio bmo-voice, que carga los pesos base, fusiona el adaptador y sirve la voz.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documentan modos especiales (thinking, emoción, control de prosodia más allá del clip de referencia).

## Casos de uso

- Voz de un agente personal de código abierto: el servicio bmo-voice instala esta carpeta en su directorio de voces y sirve el agente BMO con una voz propia en coreano e inglés.
- Prototipado de asistentes conversacionales bilingües: sirve para probar interacciones habladas ko/en con un timbre fijo sin depender de servicios TTS de terceros.
- Investigación en personalización de TTS: el par LoRA + clips de referencia + TOML es un ejemplo reproducible de cómo adaptar Fish-Speech a una voz nueva.
- Evaluación de pipelines Fish-Speech: permite verificar la carga de pesos base en una revisión fijada, la aplicación del LoRA y la generación con temperatura 0,7 y top-p 0,7.
- Demos y contenidos no comerciales: narración o locución de material de investigación o divulgación en coreano e inglés, respetando la licencia de investigación.
- Base para experimentos de adaptación de voz: el adaptador puede servir de punto de partida para estudiar el efecto del rango LoRA y de los clips de referencia en la calidad de la voz, siempre en ámbito no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base S2-Pro, cuyos requisitos no se detallan en la información.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servicio bmo-voice (repositorio github.com/ahas/bmo-voice) o herramientas estándar de fish-speech cargando S2-Pro y aplicando `lora.pt`.
- Latencia y throughput: no disponible.
- Tamaño del repositorio: 0,1 GB (adaptador y clips de referencia, sin los pesos del modelo base).

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| BMO voice (ahas-io/bmo-voice) | LoRA TTS sobre S2-Pro | ko, en | Fish Audio Research License (no comercial) | no disponible | Hugging Face, 0 descargas |
| fishaudio/s2-pro | TTS base | no disponible en la informacion | no disponible en la informacion | no disponible | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: Fish Audio Research License, solo investigación y uso no comercial. Cualquier uso comercial, incluido el uso interno de una empresa o detrás de un servicio alojado o API, requiere licencia separada de Fish Audio (business@fish.audio).
- El código de BMO es MIT, pero los pesos del adaptador no lo son; no deben confundirse las licencias.
- Dependencia estricta del modelo base: los pesos de S2-Pro están fijados a la revisión `1de9996b6be38b745688de084d87a5633f714e4e`; otras revisiones pueden romper la compatibilidad.
- Solo cubre coreano e inglés; no hay soporte documentado de otros idiomas.
- Adaptador en el paso 750 de 1.000, por lo que puede no estar plenamente convergido.
- No se documentan sesgos, tasas de alucinación ni métricas de calidad de voz; no hay evaluación objetiva publicada.
- Repositorio sin descargas ni likes y con información muy escasa: la reproducibilidad fuera del servicio bmo-voice no está verificada de forma independiente.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahas-io/bmo-voice
- Modelo base: https://huggingface.co/fishaudio/s2-pro
- Servicio bmo-voice: https://github.com/ahas/bmo-voice
- Plataforma BMO: https://bmo.ahas.io
- Fish Audio (licencias comerciales): https://fish.audio
- Contacto comercial: business@fish.audio
