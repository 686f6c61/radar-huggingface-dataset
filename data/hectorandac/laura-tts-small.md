# hectorandac/laura-tts-small

## Resumen

laura-tts-small es un modelo de síntesis de voz (text-to-speech) bilingüe inglés-coreano desarrollado por el usuario hectorandac. Se trata de un VITS de altavoz único con 15,65 millones de parámetros, empaquetado como ONNX y diseñado para inferencia en tiempo real sobre CPU. Es la voz del asistente autoalojado Laura, donde sustituyó a un clon de voz Qwen3-TTS que requería GPU, lo que da una idea de su propósito: ofrecer salida de habla de baja latencia en hardware modesto.

El modelo sigue la disposición "medium" de Piper y se ha obtenido mediante destilación de conocimiento a partir de un clon de voz de Qwen3-TTS 0.6B. El alumno se entrenó exclusivamente con habla generada por el profesor, es decir, con un corpus totalmente sintético. La salida es mono a 22.050 Hz y el tiempo de ejecución es ONNX Runtime con CPU y opset 15. La voz es sintética: desciende de uno de los altavoces predefinidos de Qwen3-TTS, no de la grabación de una persona real.

Su relevancia actual radica en la eficiencia: alcanza un RTF de 0,056 con 4 hilos en un Intel i9-10980HK, lo que permite integrar TTS de calidad aceptable en servidores domésticos, portátiles y placas de una sola placa sin depender de una GPU. No es un modelo de clonación de voz y no puede condicionarse a un hablante de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (disposición "medium" de Piper), altavoz único |
| Parámetros totales | 15,65 M (encoder 13,99 M + decoder 1,66 M, contados desde los inicializadores ONNX) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa fonemas por frase) |
| Tipos de cuantización | no disponible (se distribuye en ONNX float; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (fonemas espeak-ng) y coreano (g2pk2 + jamo a IPA) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`; también `model.encoder.onnx` y `model.decoder.onnx` para streaming) |
| Frecuencia de muestreo | 22.050 Hz, mono |
| Runtime | ONNX Runtime, CPU, opset 15 |
| Velocidad | RTF 0,056 con 4 hilos en Intel i9-10980HK |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un VITS de altavoz único en la disposición "medium" de Piper. El encoder concentra la mayor parte de los parámetros (13,99 M) y el decoder aporta 1,66 M. La entrada son identificadores de fonemas y la salida es una forma de onda generada en una sola pasada con `model.onnx`; para streaming se ofrece la versión dividida en encoder y decoder, donde el encoder se ejecuta una vez por frase y el decoder convierte fotogramas latentes en audio por fragmentos solapados, de modo que el audio unido coincide con una decodificación de frase completa del mismo latente. Los parámetros de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,6, con un `length_scale` que se ajusta como inverso de la velocidad (el asistente usa velocidad 1,2).

El entrenamiento consistió en una destilación profesor-alumno con un corpus completamente sintético. En primer lugar, Qwen2.5-7B-Instruct generó líneas de estilo asistente en inglés y coreano sobre 64 temas cotidianos y técnicos y nueve estilos (respuestas cortas, preguntas, frases largas, muletillas, reacciones), además de algunas respuestas cortas fijas. Tras normalización y deduplicación quedaron 7.979 líneas (4.027 en inglés y 3.952 en coreano); se descartaron las líneas con dígitos. Después, cada línea fue locutada por Qwen3-TTS-12Hz-0.6B-Base, y el alumno se entrenó únicamente con ese habla generada por el profesor. El resultado es una voz sintética derivada de un altavoz predefinido de Qwen3-TTS, no de una grabación humana.

## Capacidades

- Síntesis de voz a partir de texto en inglés y coreano, con salida mono a 22.050 Hz.
- Fonemización específica por idioma: espeak-ng para inglés y g2pk2 más conversión de jamo a IPA para coreano, con dos símbolos coreanos adicionales en el mapa de fonemas (U+0348 tensa, id 157; U+031A no liberada, id 158).
- Inferencia en una sola pasada (`model.onnx`) o en modo streaming con encoder y decoder separados y decodificación por fragmentos.
- Ejecución en CPU con ONNX Runtime, con control de hilos (`--threads`), velocidad (`--speed`), ganancia (`--gain`) y streaming (`--stream`).
- Voz única fija; no admite condicionamiento por hablante ni clonación de voz.
- Lectura literal del texto: los dígitos se envían a espeak y se leen en inglés incluso dentro de texto coreano, por lo que es necesario normalizar números, horas y unidades a palabras antes de sintetizar.
- Servicio HTTP de referencia para `/synth` y `/synth_stream` con PCM16 por fragmentos.

## Casos de uso

- Asistentes de voz autoalojados: el modelo sustituye a un TTS residente en GPU y permite mantener el asistente completo en CPU, como ocurre en el proyecto Laura, con latencia baja gracias a su RTF de 0,056.
- Servidores domésticos y portátiles: al ejecutarse con ONNX Runtime sobre CPU y ocupar un repositorio de 0,1 GB, encaja en equipos sin GPU dedicada donde un TTS de 0,6 B no cabría.
- Placas de una sola placa y dispositivos empotrados: su tamaño de 15,65 M de parámetros y su naturaleza ONNX lo hacen apto para hardware limitado, con la CPU como único requisito de cómputo.
- Respuestas interactivas de baja latencia: el modo streaming con encoder y decoder separados permite emitir audio por fragmentos mientras se genera, adecuado para diálogos conversacionales donde importa el tiempo hasta el primer audio.
- Aplicaciones bilingües inglés-coreano: un mismo modelo cubre ambos idiomas con fonemización nativa por idioma, útil en interfaces de voz que alternan entre las dos lenguas.
- Integración en servicios HTTP de síntesis: el servidor de referencia con `/synth` y `/synth_stream` y salida PCM16 facilita incorporar la voz a backends existentes sin infraestructura GPU.
- Pruebas y prototipado de interfaces de voz: al ser Apache 2.0 y ejecutarse en CPU, sirve para validar flujos de TTS en desarrollo antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento documentado es el RTF de 0,056 con 4 hilos en un Intel i9-10980HK, medido en inferencia sobre CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para CPU. El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no se documentan; el runtime de referencia es ONNX Runtime con `CPUExecutionProvider`.
- Cabe en cualquier CPU de consumo moderna; el dato de referencia se obtuvo en un Intel i9-10980HK con 4 hilos.
- Opciones de despliegue: ONNX Runtime en CPU, con script `infer.py` incluido y servidor HTTP de referencia (`server/tts_small_server.py`) para `/synth` y `/synth_stream` con PCM16 por fragmentos.
- Latencia y throughput: RTF 0,056 con 4 hilos en el i9-10980HK, es decir, aproximadamente 18 veces más rápido que tiempo real en esa configuración. No se documentan cifras para otros procesadores.
- Dependencias del sistema: `libespeak-ng1` para los fonemas ingleses (en macOS, `brew install espeak-ng`); en Python, `onnxruntime`, `numpy`, `g2pk2`, `python-mecab-ko` y `nltk`. En el primer uso, g2pk2 descarga el corpus `cmudict` de NLTK.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Runtime | Licencia | Notas |
|---|---|---|---|---|---|
| laura-tts-small | 15,65 M | en, ko | ONNX Runtime CPU | Apache 2.0 | VITS Piper medium, voz única, RTF 0,056 en i9-10980HK |
| Qwen3-TTS-12Hz-0.6B-Base (profesor) | 0,6 B | no disponible en la información | requiere GPU en el caso de uso descrito | no disponible en la información | Usado como profesor para generar el corpus sintético |
| Piper (modelos medium genéricos) | del orden de decenas de millones | según voz | ONNX Runtime CPU | según voz | Misma disposición arquitectónica; no se dispone de datos concretos de comparación en la información |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Voz única y fija: no es un modelo de clonación y no puede condicionarse a un hablante de referencia.
- Los dígitos se leen en inglés incluso dentro de texto coreano; es obligatorio normalizar números, horas y unidades a palabras antes de sintetizar.
- El corpus de entrenamiento es totalmente sintético y generado por un único profesor (Qwen3-TTS), por lo que la voz y la prosodia heredan las características de ese altavoz predefinido y pueden presentar artefactos propios de la destilación.
- Cobertura limitada a inglés y coreano; no se documenta soporte de otros idiomas.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí de pronunciación incorrecta en palabras fuera de la distribución de entrenamiento (64 temas y nueve estilos), especialmente en coreano.
- El entrenamiento excluyó líneas con dígitos, lo que refuerza la necesidad de normalización numérica.
- No se documentan sesgos demográficos ni de otro tipo; al ser una voz sintética derivada de un altavoz predefinido, no representa a una persona real.
- Licencia Apache 2.0, que permite uso comercial con las condiciones habituales de atribución y aviso de licencia.
- Para producción conviene validar la latencia y la calidad en el hardware objetivo, ya que solo se publica el RTF medido en un i9-10980HK con 4 hilos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hectorandac/laura-tts-small
- Repositorio del asistente Laura: https://github.com/hectorandac/laura-voice
- Servidor TTS de referencia: https://github.com/hectorandac/laura-voice/blob/main/server/tts_small_server.py
- Documentación del TTS pequeño: https://github.com/hectorandac/laura-voice/blob/main/docs/tts-small.md
- Paper de referencia VITS (arXiv:2106.06103): https://arxiv.org/abs/2106.06103
