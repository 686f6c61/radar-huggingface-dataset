# mohammedaly22/Cairo-TTS

## Resumen

Cairo-TTS es un modelo de síntesis de voz (text-to-speech) especializado en árabe egipcio coloquial (عامية) con inserción natural de palabras en inglés dentro de frases árabes (code-switching). Lo desarrolla Mohammed Aly, autor también del pipeline de recopilación de datos EgySpeech, y se publica como un ajuste fino del modelo Pocket TTS de Kyutai, del que hereda la arquitectura. Cuenta con 105.487.042 parámetros (aproximadamente 100 M, backbone de 6 capas) y 382 MB en safetensors fp32, un tamaño deliberadamente reducido que le permite ejecutarse en CPU de portátil o en GPU de gama consumer.

El problema que aborda es la ausencia de sistemas TTS abiertos de calidad para el dialecto egipcio: la mayoría de alternativas cubren árabe estándar moderno o dialectos sin clonación de voz, mientras que Cairo-TTS lee registros cotidianos y resuelve el frontend de texto (números, fechas, horas, dinero, porcentajes, teléfonos, correos, URLs y siglas) con pronunciación egipcia. Incluye clonación de voz zero-shot a partir de una grabación de unos 10 s, 20 voces predefinidas (10 masculinas y 10 femeninas, con "tarek" como voz por defecto), control explícito de pronunciación mediante diacríticos y decodificación en streaming con tramas de 80 ms a 24 kHz.

Su relevancia práctica está en la latencia y el coste: el autor mide unos 80 ms hasta el primer audio y unas 2,2 veces tiempo real en una GTX 1660 Ti de 6 GB, y unos 330 ms y 2,6 veces tiempo real en un Intel i7-10750H de portátil. Eso lo sitúa como candidato para voz en tiempo real sin infraestructura GPU dedicada, aunque el modelo acumula 0 descargas y 0 "likes" en el momento de la consulta y no publica resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pocket TTS de Kyutai: transformer causal sobre latentes de Mimi con cabeza flow de un paso (LSD), seguido de un decodificador Mimi en streaming a 24 kHz y 12,5 tramas/s |
| Parámetros totales | 105.487.042 (aproximadamente 105,5 M) |
| Longitud de contexto | No aplicable como ventana conversacional. Vocabulario de entrada de 79 caracteres y prompts de voz ≤ 5 s; no se documenta límite de longitud del texto de entrada |
| Tipos de cuantización | No disponible; solo se publican pesos fp32 en safetensors |
| Idiomas soportados | Árabe egipcio (ar) e inglés (en), este último integrado como code-switching dentro de frases árabes |
| Licencia | other, license_name "pocket-tts-weights", heredada de kyutai/pocket-tts |
| Formato de pesos | safetensors (fp32), 382 MB; tamaño del repositorio 0,4 GB |
| Modelo base | kyutai/pocket-tts (fine-tune) |
| Backbone | 6 capas |
| Voces predefinidas | 20 (10 masculinas, 10 femeninas), referencias limpias de unos 10 s normalizadas a −20 LUFS |
| Frecuencia de muestreo | 24 kHz, fragmentos float32 |
| Librería de inferencia | cairo-tts (paquete Python y CLI propios; pipeline text-to-speech) |

## Arquitectura y entrenamiento

Cairo-TTS no es un LLM ni un modelo de contexto: es un sistema TTS sobre latentes de códec. La entrada de texto se tokeniza en un vocabulario de 79 caracteres (letras árabes, diacríticos, el símbolo `~`, letras a–z, coma y punto) y se procesa con un transformer causal de 6 capas que predice latentes de Mimi; una cabeza flow de un solo paso (LSD) genera dichos latentes y un decodificador Mimi en streaming los convierte en audio a 24 kHz con 12,5 tramas por segundo. El streaming se realiza en tramas de 80 ms, de modo que el audio se reproduce mientras se genera.

El entrenamiento parte de Pocket TTS de Kyutai. El autor ajustó primero un profesor de 24 capas (64.000 pasos con enfriamiento coseno) y después destiló ese profesor en este estudiante de 6 capas (30.000 pasos), con prompts de voz de 5 s o menos. Los datos son aproximadamente 747 horas de voz de pódcast egipcio recopiladas con el pipeline EgySpeech y procesadas con diarización, filtrado de calidad, transcripción, diacritización mediante CATT y normalización de sonoridad a −20 LUFS. No se documenta en la información disponible el uso de RLHF, DPO u otras fases de alineación posteriores al ajuste supervisado y a la destilación.

Como innovaciones destacables: destilación profesor-estudiante para reducir el backbone de 24 a 6 capas manteniendo la calidad, inferencia en streaming con decodificador Mimi, clonación zero-shot con prompts cortos, y un frontend de texto que resuelve abreviaturas, siglas en mayúsculas (deletreadas como letras inglesas) y control fino de pronunciación mediante diacríticos, `ةْ` para la ta marbuta pronunciada y `~` para la lectura egipcia de una letra (principalmente ق como oclusiva glotal). Los parámetros de generación se documentan solo parcialmente: el valor por defecto de `temperature` es 0,3; el resto de la tabla de parámetros no está disponible en la información proporcionada.

## Capacidades

- Síntesis de voz en árabe egipcio coloquial, entrenada sobre aproximadamente 747 horas de pódcast en ese dialecto.
- Code-switching árabe-inglés: palabras inglesas escritas en caracteres latinos dentro de una frase árabe se leen en inglés (por ejemplo, "ال meeting بكره الصبح").
- Clonación de voz zero-shot a partir de una grabación de referencia de unos 10 s (`voice="my_recording.wav"`).
- 20 voces predefinidas (10 masculinas y 10 femeninas), con referencias normalizadas a −20 LUFS; "tarek" es la voz por defecto. Quince provienen de hablantes de los pódcast de entrenamiento, seleccionados por fidelidad de clonación medida con embeddings de hablante TitaNet, y cinco son grabaciones aportadas por el autor.
- Streaming de audio en tramas de 80 ms y salida a 24 kHz en float32, apto para reproducción en tiempo real.
- Frontend de texto para números, fechas, horas, dinero, porcentajes, números de teléfono, correos electrónicos, URLs y siglas.
- Control de pronunciación: diacríticos opcionales que sobrescriben la diacritización automática del modelo, `ةْ` para ta marbuta pronunciada como t, `~` para la lectura egipcia de una letra, shadda para geminación y sukun para ausencia de vocal.
- Ejecución en CPU o GPU con la misma API, y exposición de métricas de inferencia (`last_metrics`: tiempo hasta el primer audio, tiempo total y factor de tiempo real).
- No soporta tool calling ni function calling, razonamiento multi-paso, agentes, visión ni entrada de audio: no son capacidades aplicables a un modelo TTS y no se documentan.
- Multilingüismo limitado a árabe egipcio e inglés; no cubre árabe estándar moderno, otros dialectos árabes ni terceras lenguas.

## Casos de uso

- Atención al cliente telefónica automatizada en Egipto: con un tiempo hasta el primer audio de unos 80 ms en GPU y decodificación en streaming de 80 ms, el modelo puede alimentar respuestas de voz en diálogos interactivos. No es un modelo de diálogo, por lo que se combinaría con un LLM que genere el texto y Cairo-TTS que lo locute.
- Audiolibros y lectura de prensa en egipcio: el frontend de texto resuelve cifras, fechas, importes y siglas, lo que evita preprocesado manual en contenidos con abundantes datos numéricos y nombres propios.
- Doblaje y localización de vídeo para el mercado egipcio: la clonación zero-shot permite replicar la voz de un locutor concreto a partir de una muestra de referencia, manteniendo coherencia de timbre a lo largo de varias piezas.
- Accesibilidad y lectores de pantalla sin GPU: el modelo funciona más rápido que el tiempo real en un Intel i7-10750H de portátil, por lo que puede desplegarse en equipos de usuario sin hardware acelerador.
- Asistentes de voz embebidos y dispositivos de bajo consumo: con 382 MB de pesos fp32 y ejecución en CPU, el modelo cabe en despliegues locales o en el borde sin servidores GPU.
- Ampliación de datos para ASR: generar audio sintético etiquetado en árabe egipcio con múltiples voces y code-switching para aumentar corpus de entrenamiento o de evaluación de sistemas de reconocimiento de voz.
- Contenido formativo y técnico con terminología inglesa: el code-switching permite leer frases del tipo "ال deadline" o siglas como CEO o AI sin romper la prosodia árabe, útil en cursos y tutoriales dirigidos a público egipcio.
- Producción de pódcast y newsletters en audio: la API de streaming y la CLI (`cairo-tts say`, `cairo-tts serve`) permiten integrar la generación en pipelines de publicación automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K ni equivalentes, ni métricas objetivas de calidad de voz (MOS, similitud de hablante, WER de re-síntesis) en la información proporcionada. El único rendimiento cuantificado es de velocidad y se recoge en la sección de requisitos de hardware.

## Requisitos de hardware

- Pesos: 382 MB en safetensors fp32 (105,5 M parámetros); repositorio de 0,4 GB.
- VRAM estimada: menos de 2 GB incluyendo el decodificador Mimi y activaciones. Es una estimación derivada del tamaño de los pesos publicados, no una cifra publicada por el autor.
- Medición en NVIDIA GTX 1660 Ti (6 GB): aproximadamente 80 ms hasta el primer audio y 2,2 veces tiempo real en frases de 7 a 11 s, tras el calentamiento.
- Medición en CPU Intel i7-10750H: aproximadamente 330 ms hasta el primer audio y 2,6 veces tiempo real en las mismas condiciones.
- Cabe en cualquier GPU consumer actual (GTX 1660 Ti o superior) e, incluso, en CPU de portátil. El autor señala que GPUs más rápidas reducen sobre todo el tiempo hasta el primer audio, no tanto el factor de tiempo real.
- Despliegue: paquete `cairo-tts` vía pip (con extra `[ui]` para interfaz web), CLI (`cairo-tts say ... -o out.wav --voice ahmed`), servidor web (`cairo-tts serve`, http://127.0.0.1:8000), Hugging Face Space del autor y cuaderno de Colab.
- vLLM, llama.cpp, Ollama y TGI: no documentados ni aplicables, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: los únicos valores disponibles son los de la tabla de velocidad del autor; no se publican métricas de throughput agregado ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cairo-TTS (mohammedaly22/Cairo-TTS) | 105.487.042 | Árabe egipcio e inglés (code-switching) | Zero-shot, con prompts de voz ≤ 5 s y 20 voces predefinidas | other, "pocket-tts-weights" | 0 descargas y 0 likes; repo de 0,4 GB, librería `cairo-tts` en PyPI |
| kyutai/pocket-tts (modelo base) | No disponible | No disponible | No disponible | No disponible en la información proporcionada | No disponible |
| mohammedaly22/leva-tts (mismo autor, árabe levantino) | No disponible | Árabe levantino e inglés (code-switching) | No disponible | No disponible | Disponible en Hugging Face, con 478 descargas totales y 100 en los últimos 30 días según Model Pulse |

No se dispone de datos de otros modelos comparables en la información proporcionada (por ejemplo, alternativas multilingües de clonación como XTTS-v2 o Fish Speech), por lo que no se incluyen cifras que no puedan contrastarse. La comparación más directa es con el propio modelo base de Kyutai y con leva-tts del mismo autor, orientado al dialecto levantino en lugar del egipcio.

## Limitaciones y advertencias

- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de calidad.
- Ausencia total de benchmarks publicados, incluidos MOS o métricas de similitud de hablante, lo que impide comparar objetivamente con alternativas.
- Licencia "other" con nombre "pocket-tts-weights" y enlace a kyutai/pocket-tts: los términos exactos de uso comercial no están detallados en la información disponible y deben revisarse en el repositorio del modelo base antes de cualquier despliegue en producción.
- Cobertura lingüística estrecha: solo árabe egipcio e inglés. No soporta árabe estándar moderno ni otros dialectos, y el vocabulario de entrada se limita a 79 caracteres (letras árabes, diacríticos, `~`, a–z, coma y punto), por lo que caracteres fuera de ese conjunto no están cubiertos y el comportamiento de respaldo no se documenta.
- Sesgos probables por composición del corpus: aproximadamente 747 horas de pódcast egipcios implican un registro conversacional concreto, con voces adultas y temáticas propias del medio; puede haber menor naturalidad en registros formales, técnicos o infantiles.
- Riesgo de pronunciación incorrecta y de alucinación fonética: en un modelo TTS esto se manifiesta como diacritización errónea, lectura defectuosa de nombres propios, neologismos o extranjerismos no vistos, y prosodia inadecuada en frases largas o con puntuación ambigua.
- Riesgo de uso indebido de la clonación de voz: la función zero-shot puede emplearse para suplantación de identidad, fraude o desinformación. Es responsabilidad del integrador obtener consentimiento explícito de la persona cuya voz se clona y cumplir la normativa aplicable.
- Restricción de longitud del prompt de voz: el entrenamiento usa referencias de 5 s o menos, aunque los presets son de unos 10 s; no se documenta el comportamiento con referencias mucho más largas ni con audio ruidoso.
- Parámetros de generación documentados de forma incompleta: solo se conoce el valor por defecto de `temperature` (0,3), lo que dificulta reproducir resultados o ajustar la variabilidad de la voz.
- Inconsistencia en los metadatos: la fecha de creación y de última actualización figura como 12 de octubre de 2026, lo que puede deberse a un error de la plataforma o de la información disponible.
- Dependencia del ecosistema del autor: la inferencia se realiza con la librería propia `cairo-tts` y no hay soporte documentado en runners estándar como vLLM u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohammedaly22/Cairo-TTS
- Repositorio de código: https://github.com/MohammedAly22/Cairo-TTS
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/mohammedaly22/Cairo-TTS
- Cuaderno de inicio rápido en Colab: https://colab.research.google.com/github/MohammedAly22/Cairo-TTS/blob/main/notebooks/01_quickstart.ipynb
- Paquete en PyPI: https://pypi.org/project/cairo-tts/
- Pipeline de datos EgySpeech: https://github.com/MohammedAly22/EgySpeech
- Modelo base Pocket TTS (Kyutai), repositorio: https://github.com/kyutai-labs/pocket-tts
- Modelo base Pocket TTS (Kyutai), pesos y licencia: https://huggingface.co/kyutai/pocket-tts
- Perfil del autor en Hugging Face: https://huggingface.co/mohammedaly22
- Perfil del autor en GitHub: https://github.com/MohammedAly22
- Estadísticas de descargas de leva-tts (modelo del mismo autor para árabe levantino): https://modelpulse.ifsp.dev/model/mohammedaly22/leva-tts
