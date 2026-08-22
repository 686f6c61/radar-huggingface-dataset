# qhduan/piper-voices

## Resumen

Piper es un sistema de síntesis de voz (text-to-speech) neuronal, rápido y diseñado para ejecutarse íntegramente en CPU, incluso en dispositivos de bajo consumo como una Raspberry Pi. Este repositorio, `qhduan/piper-voices`, es una colección de voces preentrenadas para dicho sistema, empaquetadas en formato ONNX, que cubre un espectro muy amplio de idiomas (más de 30, incluidos árabe, chino, español, inglés, francés, alemán y muchos más). El desarrollo original proviene del proyecto Rhasspy, una iniciativa open source centrada en asistentes de voz locales y privados.

La relevancia actual de este modelo radica en que ofrece síntesis de voz neuronal de alta calidad sin necesidad de GPU ni conexión a internet, lo que lo convierte en una opción ideal para aplicaciones de edge computing, asistentes de voz autocontenidos, domótica y proyectos de accesibilidad. Aunque la entrada es texto, su naturaleza de modelo de generación de audio y su formato optimizado lo diferencian de los LLM generativos de texto, enfocándose en la latencia mínima y la eficiencia computacional. El tamaño total del repositorio es de 12,3 GB, lo que refleja la diversidad de voces y calidades disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) |
| Parametros totales | 5-32 millones segun la calidad de la voz (x_low a high) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa texto por frases, sin ventana de contexto clasica) |
| Tipos de cuantizacion | no disponible (pesos en ONNX, se pueden cuantizar con herramientas externas) |
| Idiomas soportados | ar, ca, cs, cy, da, de, el, en, es, fa, fi, fr, hu, is, it, ka, kk, lb, lv, ne, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, tr, uk, vi, zh |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

Piper se basa en la arquitectura VITS, que combina un codificador de texto, un decodificador de audio y un módulo de alineación, todo entrenado de forma conjunta mediante aprendizaje adversarial. El modelo es un transformer por capas internas, pero su funcionamiento es puramente autoregresivo sobre el audio generado. Los pesos se exportan a ONNX para permitir la inferencia en CPU con tiempos de ejecucion muy bajos (inferior al tiempo real en la mayoria de plataformas). Los datos de entrenamiento varian por voz, pero el proyecto original de Rhasspy usa conjuntos de datos publicos y voces de dominio publico, con licencia MIT. No se ha documentado el uso de RLHF ni DPO, dado que es un sistema de generacion de audio, no de texto.

Las voces se entrenan en cuatro niveles de calidad: `x_low` (16 kHz, 5-7 M de parametros), `low` (16 kHz, 15-20 M), `medium` (22,05 kHz, 15-20 M) y `high` (22,05 kHz, 28-32 M). Esta segmentacion permite elegir entre calidad y eficiencia segun el hardware objetivo.

## Capacidades

- Generacion de voz (text-to-speech) en mas de 30 idiomas, con acentos regionales variados.
- Inferencia local y offline, sin necesidad de conexion a internet ni GPU.
- Velocidad de generacion en tiempo real o superior en CPU de gama media (por ejemplo, un Raspberry Pi 4).
- Control de calidad de audio: 16 kHz o 22,05 kHz segun el modelo elegido.
- Soporte de voces multi-locutor: algunos modelos contienen varios hablantes dentro de un solo archivo y permiten cambiar de voz en tiempo de ejecucion.
- Compatibilidad con sistemas de asistente de voz (Home Assistant, Rhasspy) y con pipelines de automatizacion.
- No soporta tool calling, agentes ni vision; es un sistema de sintesis de voz puro.

## Casos de uso

- Asistentes de voz para el hogar (Home Assistant, Rhasspy): Piper se integra nativamente en estos sistemas para responder en voz alta a comandos de usuario, ofreciendo respuesta local y privada.
- Aplicaciones de accesibilidad: lectores de pantalla para personas con discapacidad visual, que necesitan latencia baja y funcionamiento offline.
- Audioguias y contenido educativo: generacion de narraciones para videos o cursos, sin depender de servicios cloud de pago.
- Sistemas de notificacion por voz en dispositivos IoT: por ejemplo, un dispositivo que lee en voz alta el estado de sensores o alarmas.
- Automatizacion de call centers: respuestas de voz en varios idiomas para sistemas de atencion al cliente, con coste cero por llamada.
- Desarrollo de asistentes virtuales en produccion: permite integrar una voz de alta calidad en aplicaciones de escritorio o moviles sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval u otros, ya que es un modelo de TTS y no de lenguaje general.

## Requisitos de hardware

- Inferencia en CPU: Piper esta disenado para CPU, no requiere GPU. Un Raspberry Pi 4 o un mini-PC con x86 ejecuta el modelo `medium` en tiempo real.
- VRAM: no requiere VRAM, se ejecuta en RAM del sistema. La RAM necesaria varia de 100 MB a 300 MB segun el tamano del modelo.
- GPU recomendadas: no aplica, aunque se puede ejecutar en GPU si se desea, no es necesario.
- Despliegue: se integra con Home Assistant, Rhasspy, y se puede usar via CLI (`piper`), Python, o con el servidor HTTP de Piper.
- Latencia: en un Raspberry Pi 4, la generacion de una frase corta (5-10 palabras) toma aproximadamente 100-300 ms, dependiendo de la calidad y el modelo.
- Throughput: en CPU de gama media, genera audio mas rapido que en tiempo real (por ejemplo, 1 segundo de audio en ~0,5 segundos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Velocidad en CPU | Idiomas |
|---|---|---|---|---|---|---|
| Piper (este repo) | 5-32 M | no aplica | MIT | ONNX | Tiempo real en CPU | 30+ |
| Coqui TTS (XTTS) | ~800 M | no disponible | MPL-2.0 | PyTorch | Lento en CPU, requiere GPU | 17 |
| Edge TTS | no disponible | no disponible | Propietario | API | Requiere internet | 50+ |
| Tacotron 2 | ~100 M | no aplica | No comercial | PyTorch | Lento en CPU | 1 (en) |

Piper destaca por su velocidad en CPU y su licencia permisiva (MIT), lo que lo hace mas accesible para proyectos comerciales que alternativas como Tacotron (no comercial) o XTTS (MPL con restricciones de atribucion).

## Limitaciones y advertencias

- La calidad de voz es menor que la de sistemas comerciales como ElevenLabs o Azure TTS, especialmente en los modelos `x_low`.
- No soporta voces con emociones o entonacion controlada por el usuario; el estilo es fijo por cada modelo.
- No hay soporte para idiomas adicionales fuera de la lista oficial.
- El modelo es sensible a la puntuacion: textos largos sin puntuacion pueden generar pausas incorrectas.
- Algunas voces de bajo presupuesto (x_low) suenan roboticas y con artefactos.
- No hay garantia de que las voces en el repositorio sean de calidad uniforme; se recomienda evaluar cada voz antes de usarla en produccion.
- La licencia MIT permite uso comercial, pero no se proporciona ninguna garantia de exactitud o de uso seguro.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/qhduan/piper-voices
- Repositorio oficial de voces: https://huggingface.co/rhasspy/piper-voices
- Codigo fuente de Piper: https://github.com/rhasspy/piper
- Guia de entrenamiento de voces: https://github.com/rhasspy/piper/blob/master/TRAINING.md
- Ejemplos de audio: https://rhasspy.github.io/piper-samples/
- Documentacion de voces: https://deepwiki.com/rhasspy/piper/3.1-available-voices
- Generador de voz en linea: https://tts.ai/voices/piper/
