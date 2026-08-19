# rhasspy/piper-voices

## Resumen

Piper es un sistema de síntesis de voz neuronal diseñado para ejecutarse de forma local, rápida y sin conexión. El repositorio `rhasspy/piper-voices` aloja una colección de voces preentrenadas para este motor, desarrollado por el equipo de Rhasspy, conocido por sus herramientas de asistentes de voz de código abierto. Estas voces permiten convertir texto en audio con una calidad aceptable en entornos con recursos limitados, como Raspberry Pi, ordenadores de bajo consumo o aplicaciones embebidas.

El repositorio contiene decenas de modelos de voz organizados por idioma (más de 30 lenguas, desde español hasta chino), género y nivel de calidad. Cada voz es un modelo independiente, generalmente basado en una arquitectura de vocoder neuronal, y se distribuye en formato ONNX para facilitar su integración con el runtime de Piper. La licencia MIT permite su uso comercial sin restricciones, lo que lo convierte en una opción atractiva para proyectos que necesitan TTS local sin depender de servicios en la nube.

La relevancia actual de Piper radica en su equilibrio entre tamaño, velocidad y calidad. Con modelos que van desde 5 hasta 32 millones de parámetros, es posible generar audio a 16 kHz o 22,05 kHz según la calidad elegida, con una latencia muy baja incluso en CPU. Esto lo posiciona como una alternativa práctica a soluciones propietarias o a modelos más pesados que requieren GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vocoder neuronal (VITS en la mayoría de voces, segun documentacion de Piper) |
| Parametros totales | Variable segun voz: 5-7M (x_low), 15-20M (low/medium), 28-32M (high) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de sintesis de voz, no de lenguaje) |
| Tipos de cuantizacion | No disponible (los modelos se distribuyen en ONNX, sin cuantizacion publicada) |
| Idiomas soportados | ar, ca, cs, cy, da, de, el, en, es, fa, fi, fr, hu, is, it, ka, kk, lb, lv, ne, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, tr, uk, vi, zh (mas de 30) |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors no disponible) |

## Arquitectura y entrenamiento

El repositorio no incluye informacion detallada sobre el entrenamiento de cada voz. Sin embargo, Piper utiliza una arquitectura de vocoder neuronal, tipicamente VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech), que combina un encoder de texto, un decoder de audio y un discriminador adversarial. Los modelos se entrenan con datos de voz de dominio publico (por ejemplo, Common Voice, LibriSpeech, etc.), aunque no se especifican los datasets exactos para cada voz.

Los niveles de calidad definen la frecuencia de muestreo y el numero de parametros: `x_low` produce audio a 16 kHz con 5-7M de parametros, `low` a 16 kHz con 15-20M, `medium` a 22,05 kHz con 15-20M y `high` a 22,05 kHz con 28-32M. Algunas voces son multi-hablante, lo que permite cambiar de locutor dentro de un mismo modelo. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con pares texto-audio.

## Capacidades

- Sintesis de voz a partir de texto en mas de 30 idiomas, incluyendo español, ingles, frances, aleman, chino, arabe y otros.
- Generacion de audio a 16 kHz o 22,05 kHz segun la calidad seleccionada.
- Soporte para voces masculinas, femeninas y multi-hablante (cambio de locutor en tiempo de inferencia).
- Ejecucion local sin conexion, con baja latencia y consumo de recursos reducido.
- Compatible con el runtime de Piper, que ofrece una API sencilla para integracion en aplicaciones de linea de comandos, Python o Node.js.
- No incluye capacidades de razonamiento, codigo, tool calling ni vision; es exclusivamente un sistema de texto a voz.

## Casos de uso

- Asistentes de voz locales: Piper puede integrarse en asistentes domoticos como Home Assistant o Mycroft para generar respuestas habladas sin depender de servicios en la nube, gracias a su bajo uso de CPU y su capacidad para ejecutarse en dispositivos como Raspberry Pi.
- Accesibilidad para personas con discapacidad visual: aplicaciones de lectura de pantalla pueden usar Piper para convertir articulos, libros o notificaciones en audio de forma inmediata y sin conexion.
- Sistemas de navegacion GPS: generar instrucciones de voz en tiempo real en el idioma local, con voces claras y sin necesidad de conexion a internet.
- Lectura de textos largos: herramientas de text-to-speech para estudiar o escuchar documentos, donde la calidad media (22,05 kHz) ofrece una experiencia aceptable en audifonos.
- Audiolibros y podcasts: aunque la calidad no alcanza niveles de estudio, las voces `high` pueden usarse para prototipos o contenido no profesional.
- Educacion y aprendizaje de idiomas: practicar pronunciacion escuchando frases generadas en el idioma objetivo, con multiples voces y acentos.
- Aplicaciones de mensajeria y notificaciones: convertir mensajes de texto en audio para dispositivos wearables o interfaces sin pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas como MOS (Mean Opinion Score) ni comparaciones con otros sistemas TTS. La calidad se describe cualitativamente mediante los niveles `x_low`, `low`, `medium` y `high`, que indican la frecuencia de muestreo y el tamano del modelo, pero no hay datos numericos de rendimiento.

## Requisitos de hardware

- Los modelos son ligeros: entre 5 y 32 millones de parametros, lo que permite ejecutarlos en CPU sin necesidad de GPU.
- En una Raspberry Pi 4 o similar, la inferencia puede generar audio en tiempo real o incluso mas rapido, dependiendo del modelo y la longitud del texto.
- Para las voces `high` (28-32M), se recomienda al menos 512 MB de RAM libre y una CPU ARM o x86 moderna.
- El runtime de Piper esta disponible para Linux, macOS, Windows y sistemas embebidos; tambien se puede compilar para WebAssembly.
- Opciones de despliegue: linea de comandos (`piper`), modulo Python (`piper-tts`), servidor HTTP (via `piper-server`) o integracion con Home Assistant y otros frameworks.
- No requiere cuantizacion adicional, ya que los modelos ONNX se ejecutan directamente con ONNX Runtime.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con otros sistemas TTS como Coqui TTS, ESPnet o Tacotron. Piper se distingue por su enfasis en la eficiencia y la portabilidad, pero no se han publicado metricas comparativas en la informacion proporcionada. Se puede indicar que, frente a alternativas como Coqui TTS (que ofrece modelos mas grandes y de mayor calidad), Piper sacrifica fidelidad por velocidad y bajo consumo, siendo mas adecuado para entornos embebidos.

## Limitaciones y advertencias

- La calidad de audio es notablemente inferior a la de sistemas comerciales o modelos grandes como VITS de alta fidelidad; puede presentar artefactos, especialmente en voces `x_low`.
- No se garantiza una pronunciacion perfecta en todos los idiomas; algunos acentos o dialectos pueden no estar bien representados.
- Los modelos no soportan control fino de prosodia (entonacion, enfasis, velocidad) mas alla de parametros basicos como la velocidad de habla.
- La licencia MIT permite uso comercial, pero los datos de entrenamiento pueden tener sus propias licencias; se recomienda verificar cada voz individualmente.
- No hay soporte para voces personalizadas sin entrenar un modelo nuevo con los checkpoints proporcionados en `piper-checkpoints`.
- El repositorio tiene un tamano de 12,2 GB, por lo que descargar todas las voces puede ser pesado; se recomienda seleccionar solo las necesarias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rhasspy/piper-voices
- Repositorio GitHub de Piper: https://github.com/rhasspy/piper
- Muestras de audio de las voces: https://rhasspy.github.io/piper-samples/
- Checkpoints para entrenar voces propias: https://huggingface.co/datasets/rhasspy/piper-checkpoints/tree/main
