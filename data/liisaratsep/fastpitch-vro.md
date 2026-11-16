# liisaratsep/fastpitch-vro

## Resumen

FastPitch para võro es un modelo de síntesis de voz (text-to-speech) desarrollado por la Universidad de Tartu (grupo TartuNLP) para el idioma võro, una lengua urálica del sur de Estonia con unos pocos miles de hablantes. El modelo emplea la arquitectura FastPitch, una variante no autorregresiva de TransformerTTS que predice directamente la duración de los fonemas y genera el mel-espectrograma en una sola pasada, lo que reduce la latencia frente a los sistemas autorregresivos clásicos.

Se distribuye como un checkpoint de TensorFlow (aproximadamente 0,2 GB) y está entrenado sobre dos voces distintas, identificadas internamente como `sulev` (ID 11) y `hella` (ID 12), lo que permite seleccionar el hablante en tiempo de inferencia. Es, según la model card, el modelo võro desplegado en el servicio Neurokõne y en la API pública de TartuNLP en el momento de su publicación.

Su relevancia radica en ser uno de los pocos recursos TTS disponibles para una lengua de bajos recursos, publicado bajo licencia CC BY-SA 4.0 y acompañado de un artículo académico en NoDaLiDa 2023. No es un modelo de lenguaje general: es un componente especializado que debe integrarse en el ecosistema de *workers* y API de TartuNLP para su uso práctico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastPitch (TransformerTTS no autorregresivo, predicción de duración de fonemas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por enunciado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | võro (código `vro`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | checkpoint de TensorFlow (librería TensorFlow; tamaño del repo 0,2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la implementación FastPitch incluida en la librería TransformerTTS de TartuNLP. FastPitch es un sistema TTS no autorregresivo: en lugar de generar el mel-espectrograma frame a frame, predice la duración de cada fonema y expande la secuencia de entrada para producir todo el espectrograma en paralelo. Esta característica reduce la latencia de inferencia y evita errores de atención acumulados típicos de los modelos autorregresivos.

El entrenamiento se realizó sobre dos hablantes de võro, con un condicionamiento por ID de hablante (`sulev` = 11, `hella` = 12). La model card no detalla el número de horas de audio, la composición exacta del corpus ni si se aplicaron técnicas de alineamiento forzado o fine-tuning adicional. Tampoco se especifica si el vocoder se distribuye junto con el modelo acústico o si debe obtenerse por separado dentro del flujo de trabajo de TartuNLP. La integración está pensada para las versiones 3.x del *worker* de text-to-speech y su API asociada.

## Capacidades

- Síntesis de voz a partir de texto en võro, generando audio con prosodia aprendida de dos hablantes.
- Selección de hablante en tiempo de inferencia mediante el ID de speaker (`sulev` o `hella`).
- Generación no autorregresiva del mel-espectrograma, con menor latencia que los modelos TTS autorregresivos.
- Integración con el flujo de trabajo de TartuNLP: *worker* v3.x y API de text-to-speech.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo TTS.
- No dispone de capacidades multimodales (visión, audio de entrada) ni de modo de razonamiento.
- Capacidad multilingüe limitada al võro; no se documenta transferencia a estonio u otras lenguas.

## Casos de uso

- Accesibilidad para hablantes de võro: lectura en voz alta de textos, documentos y contenido web para personas con discapacidad visual, aprovechando que es uno de los pocos TTS disponibles para esta lengua.
- Preservación lingüística digital: generación de material sonoro para diccionarios, cursos y corpus orales de võro, con dos voces diferenciadas que permiten variar el material de escucha.
- Integración en asistentes de voz locales: despliegue mediante el *worker* de TartuNLP para dar respuestas habladas en võro en aplicaciones de atención ciudadana o información local.
- Audiolibros y pódcast de nicho: conversión de textos literarios o divulgativos en võro a audio, seleccionando la voz (`sulev` o `hella`) según el contenido.
- Señalización y anuncios públicos: generación de mensajes pregrabados para transporte, museos o eventos en regiones de habla võro, con la API de TartuNLP como backend.
- Investigación en TTS de bajos recursos: uso como línea base reproducible (con artículo asociado en NoDaLiDa 2023) para experimentos de adaptación a otras lenguas urálicas o de comparación de arquitecturas FastPitch frente a autorregresivas.
- Prototipado de interfaces conversacionales: pruebas de concepto de IVR o chatbots de voz en võro, donde la latencia reducida de la generación no autorregresiva es ventajosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el tamaño del repositorio (0,2 GB) sugiere que el checkpoint es ligero y probablemente quepa en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del artefacto es plausible en tarjetas con pocos GB de VRAM, pero requiere verificación empírica.
- Opciones de despliegue: TensorFlow con la implementación TransformerTTS de TartuNLP, el *worker* de text-to-speech (v3.x) y la API de TartuNLP. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fastpitch-vro (este modelo) | võro | FastPitch (TransformerTTS no autorregresivo) | no disponible | no aplica | CC BY-SA 4.0 | Hugging Face, API TartuNLP |
| FastPitch para estonio (TartuNLP) | estonio | FastPitch | no disponible | no aplica | no disponible en esta ficha | Repositorios de TartuNLP |
| Modelos TTS multilingües comerciales (p. ej. servicios en la nube) | múltiples, cobertura de võro no confirmada | propietaria | no disponible | no aplica | propietaria | servicios comerciales |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada; la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Cobertura lingüística muy restringida: solo võro, una lengua de bajos recursos; no se garantiza calidad fuera del dominio de entrenamiento.
- Solo dos hablantes: la variabilidad de voces es mínima y puede sonar repetitiva en usos prolongados.
- No se documentan sesgos específicos, pero al entrenarse con dos voces concretas puede reproducir características idiosincrásicas de esos hablantes (edad, género, prosodia regional).
- Riesgo de errores de pronunciación en palabras fuera de vocabulario, neologismos, nombres propios y números; no hay evaluación publicada de estos casos.
- La licencia CC BY-SA 4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar el uso comercial de adaptaciones.
- Dependencia del ecosistema TensorFlow y de la implementación TransformerTTS de TartuNLP; no hay conversión documentada a otros formatos (ONNX, GGUF) ni soporte en runtimes estándar de TTS.
- No se especifica en la model card qué vocoder se debe usar ni si se incluye; la calidad final del audio depende del vocoder elegido en el *pipeline*.
- Fecha de creación del repositorio en Hugging Face (2026-11-16) posterior a la publicación del artículo (2023); conviene verificar la versión exacta del checkpoint antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liisaratsep/fastpitch-vro
- Artículo (NoDaLiDa 2023): https://aclanthology.org/2023.nodalida-1.73/
- Librería TransformerTTS de TartuNLP: https://github.com/TartuNLP/TransformerTTS
- Worker de text-to-speech: https://github.com/TartuNLP/text-to-speech-worker
- API de text-to-speech: https://github.com/TartuNLP/text-to-speech-api
- Documentación de la API: https://api.tartunlp.ai/text-to-speech/docs
- Servicio Neurokõne: https://neurokone.ee/
- Contacto: ping@tartunlp.ai
