# rao-studios/kokoro-paradee-8m-coreml

## Resumen

Kokoro Paradee 8M Core ML es un paquete de voz para síntesis de habla en inglés derivado de Kokoro-82M y destilado a 8 millones de parámetros. Lo publica Rao Studios como componente del motor de voz de Adverb, su aplicación de macOS para generar recursos de movimiento, y está empaquetado en formato Core ML (float32, ML programs) para ejecutarse en la CPU del dispositivo sin enviar datos a ningún servidor. El modelo base es `MithrilMan/teacher-in-the-loop`, un estudiante Paradee de 8M de parámetros entrenado con destilación teacher-in-the-loop contra la voz `af_heart` de Kokoro-82M.

El modelo sintetiza una única voz inglesa (`af_heart`) a 24 kHz, admite líneas de texto de cualquier longitud sin ventanas fijas y reporta la duración de cada fonema en tramas de 25 ms, lo que permite alinear con precisión el inicio y fin de cada palabra con el audio generado. También permite solicitar una velocidad de habla superior. El repositorio ocupa 56 MB en total e incluye los modelos Core ML compilados, léxicos, caché G2P y un modelo BART de grafema-a-fonema para palabras desconocidas.

Es relevante porque demuestra una ruta práctica de despliegue de TTS neuronal en hardware de consumo Apple con latencia baja y sin dependencia de red: un modelo de 8M de parámetros derivado de un teacher de 82M, convertido a Core ML y verificado contra el modelo PyTorch original. La licencia Apache-2.0 facilita su integración en productos comerciales, aunque el alcance funcional es deliberadamente estrecho: una voz, un idioma y una arquitectura orientada a inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradee (destilación de Kokoro-82M con capas más estrechas); dos mitades entrenadas por separado contra el teacher congelado; conversión a Core ML (float32 ML programs) |
| Parametros totales | 8,07M (modelo Paradee); el pack incluye además G2PEncoder y G2PDecoder BART |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; admite líneas de texto de cualquier longitud sin ventanas fijas |
| Tipos de cuantizacion | no disponible; pesos en float32 dentro de los ML programs |
| Idiomas soportados | inglés (`en`), voz `af_heart` |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`); JSON auxiliares (léxicos, vocabulario, caché G2P) |
| Frecuencia de muestreo | 24 kHz |
| Resolución temporal | tramas de 25 ms por fonema |
| Tamaño del paquete | 56 MB |
| Librería | coreml |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Paradee, que conserva la estructura de Kokoro-82M pero con capas mucho más estrechas, reduciendo el recuento de parámetros de 82M a 8,07M (unas 10 veces menos) y el cómputo necesario en aproximadamente 15 veces. Cada una de las dos mitades del modelo se entrena por separado contra el teacher congelado (Kokoro-82M v1.0 de hexgrad), mediante destilación teacher-in-the-loop. El corpus de entrenamiento se genera sintetizando texto con el teacher. El resultado es un modelo que habla una sola de las 54 voces del teacher: `af_heart`.

La conversión a Core ML la realizó el equipo Ambient de Rao Studios el 31 de octubre de 2026, partiendo del grafo Paradee v1.0 de FluidInference (mobius) con su filtro de phase-lock eliminado, y se verificó la paridad contra el modelo PyTorch antes de publicar. El pack incluye dos modelos principales (`ParadeeText` y `ParadeeAcoustic`) y un par BART de grafema-a-fonema (`G2PEncoder`/`G2PDecoder`) para palabras fuera de los léxicos. No se reentrenó ni editó nada para este paquete: los ficheros son de los proyectos de origen, compilados para Core ML, más la licencia y esta model card.

El front end incluye léxicos `us_`/`gb_` estilo misaki (gold y silver), una caché G2P de 178k palabras y el modelo BART de G2P, todo procedente de `FluidInference/kokoro-82m-coreml`. La fonemización se hace en Swift con los léxicos y, para palabras desconocidas, con el modelo G2P; no se usa espeak.

## Capacidades

- Síntesis de voz en inglés con una única voz (`af_heart`) a 24 kHz.
- Generación de audio de cualquier longitud de línea, sin ventanas fijas de contexto.
- Reporte de duración por fonema en tramas de 25 ms, lo que permite calcular el inicio y fin exacto de cada palabra.
- Control de velocidad de habla bajo petición.
- Fonemización integrada: léxicos estadounidense y británico más modelo G2P BART para palabras desconocidas.
- Ejecución totalmente local en CPU mediante Core ML, sin envío de datos a servidores.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Multilingüismo limitado al inglés.

## Casos de uso

- Locución de vídeos en macOS: Adverb usa el modelo para narrar cada voz en off de los vídeos generados; la duración por fonema permite sincronizar la aparición del texto en pantalla con la primera palabra de cada frase.
- Accesibilidad en aplicaciones de escritorio: lectura en voz alta de contenido con latencia baja y sin conexión, adecuada para usuarios que requieren privacidad o trabajan sin red.
- Generación de audiolibros y pódcast: al admitir líneas de cualquier longitud y control de velocidad, se puede procesar texto largo por párrafos manteniendo una cadencia uniforme.
- Prototipado de interfaces de voz: integración en apps macOS mediante Core ML para validar flujos de conversación sin depender de APIs externas ni de costes por petición.
- Subtitulado y alineación forzada: las duraciones por fonema y por palabra permiten generar marcas temporales precisas para subtítulos o karaoke sin un alineador adicional.
- Sistemas embebidos y edge computing en Apple Silicon: el tamaño de 56 MB y la ejecución en CPU lo hacen viable en dispositivos con recursos limitados, como utilidades de línea de comandos o extensiones del sistema.
- Pruebas de regresión de pipelines TTS: al ser determinista y local, sirve como referencia reproducible en CI para comparar cambios en la fonemización o en el procesado de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La información de origen indica que Paradee, el modelo del que deriva, ejecuta 18 veces en tiempo real en un solo hilo de CPU y que requiere 15 veces menos cómputo que Kokoro-82M, pero no se aportan métricas objetivas (MOS, WER, latencia medida) para este paquete Core ML concreto.

## Requisitos de hardware

- Ejecución en CPU mediante Core ML; no requiere GPU dedicada.
- VRAM: no disponible; al ejecutarse en CPU, el consumo relevante es memoria RAM del proceso, no VRAM.
- GPU recomendadas: no aplica; el pack está compilado como ML programs para CPU.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; requiere hardware Apple compatible con Core ML (macOS).
- Tamaño en disco: 56 MB en total, con el mayor peso en `ParadeeAcoustic` (18,8 MB) y `ParadeeText` (12,0 MB).
- Opciones de despliegue: Core ML en macOS a través de la app Adverb o de una integración propia; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: la información de origen cita 18 veces en tiempo real en un solo hilo de CPU para Paradee; no se confirma esta cifra para la conversión Core ML de este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / longitud | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kokoro Paradee 8M Core ML (este) | 8,07M | líneas sin ventana fija | inglés (1 voz) | Apache-2.0 | Core ML | Ejecución en CPU, duraciones por fonema |
| Kokoro-82M (hexgrad) | 82M | no disponible | inglés y otros (54 voces) | Apache-2.0 | safetensors, ONNX | Teacher del que deriva; mayor tamaño y cómputo |
| Paradee (sahilmahendrakar) | 8,07M | no disponible | inglés | no disponible en la información | no disponible | Modelo original destilado; 9 MB, 18x tiempo real en un hilo de CPU |
| MithrilMan/teacher-in-the-loop | 8M | no disponible | inglés | Apache-2.0 | no disponible | Estudiante Paradee de `af_heart` usado como base |

## Limitaciones y advertencias

- Una sola voz (`af_heart`) y un solo idioma (inglés): no es un modelo TTS generalista ni multilingüe.
- El paquete no incluye entrenamiento propio; depende de la calidad y las limitaciones del estudiante Paradee y del teacher Kokoro-82M.
- Riesgo de pronunciación incorrecta en palabras fuera de los léxicos o de la caché G2P de 178k palabras, resuelto mediante el modelo BART de G2P, que puede fallar en nombres propios, siglas y términos técnicos.
- No se han publicado métricas objetivas de calidad (MOS, WER) para esta conversión Core ML; la verificación de paridad con PyTorch no equivale a una evaluación perceptual.
- El formato Core ML limita el despliegue a plataformas Apple; no es portable a Linux, Windows o Android sin reconversión.
- Ejecución en CPU: el rendimiento depende del chip Apple concreto; no se documentan cifras de latencia para este paquete.
- Aunque la licencia es Apache-2.0, el pack incorpora ficheros de terceros (`LICENSE-teacher-in-the-loop`, front end de FluidInference) cuyas condiciones conviene revisar antes de un uso comercial.
- El repositorio no incluye código nativo, scripts ni pickles; la integración requiere implementar el pipeline de fonemización y unión de piezas por cuenta propia.

## Enlaces

- Hugging Face: https://huggingface.co/rao-studios/kokoro-paradee-8m-coreml
- Modelo base: https://huggingface.co/MithrilMan/teacher-in-the-loop
- Teacher Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Front end Core ML de referencia: https://huggingface.co/FluidInference/kokoro-82m-coreml
- Repositorio Paradee: https://github.com/sahilmahendrakar/paradee
- Paper Paradee: https://arxiv.org/abs/2610.06817v1
- App Adverb (Rao Studios): https://rao.nyc
