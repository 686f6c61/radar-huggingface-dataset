# arushanyan/livedub-files

## Resumen

`arushanyan/livedub-files` no es un modelo de IA en el sentido estricto, sino un repositorio agregador de artefactos que la aplicacion de escritorio LiveDub descarga tras su instalacion. Su funcion es servir como espejo unico de dependencias (modelos de sintesis de voz, reconocimiento de habla, separacion de fuentes, OCR, runtime de Ollama y sus pesos) para que la instalacion no dependa de una docena de sitios externos que pueden cambiar o desaparecer. El autor declara explicitamente que no ha creado ninguno de los contenidos: cada carpeta es una copia sin modificar de trabajo ajeno, sujeta a su propia licencia.

El repositorio ocupa 17,8 GB y agrupa componentes heterogeneos: XTTS v2 (clonacion de voz), Shtorm PocketTTS RU (TTS en CPU), TeraTTSv2 (narradores), RUAccent (marcado de acento en ruso), Whisper large-v3-turbo en formato faster-whisper, HTDemucs (separacion voz/musica), PP-OCRv5 en ONNX, el binario de Ollama para Windows v0.40.16, TranslateGemma 12B empaquetado para Ollama y un CPython 3.12.13 standalone con sus wheels. No hay pipeline declarado, no hay idiomas declarados a nivel de repo y la licencia es mixta (`mixed-see-readme`), con varios componentes restringidos a uso no comercial.

Es relevante ahora porque ilustra un patron creciente en el ecosistema: repositorios de distribucion que empaquetan cadenas completas de inferencia local para aplicaciones de escritorio. Para un desarrollador que quiera reproducir la app o auditar sus dependencias, este repo es el punto de entrada, pero tambien una advertencia sobre la complejidad de gestionar licencias heterogeneas en un solo artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (contenedor de artefactos multiples: TTS, ASR, separacion de fuentes, OCR, runtime LLM) |
| Parametros totales | no disponible (depende del componente; TranslateGemma 12B es el mayor) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en el formato nativo de cada componente: ONNX para PP-OCRv5, formato Ollama para TranslateGemma 12B, checkpoints para XTTS v2 y HTDemucs) |
| Idiomas soportados | no disponible a nivel de repo; por componente: ruso (Shtorm, RUAccent, TeraTTSv2), multilingue (XTTS v2, Whisper large-v3-turbo, TranslateGemma) |
| Licencia | mixta (`mixed-see-readme`): Coqui Public Model License (no comercial) para XTTS v2, CC-BY-4.0 para Shtorm, TeraTTSv2 Model License (Open RAIL-M con atribucion), MIT para RUAccent, Whisper, HTDemucs, Ollama y wheels individuales, Apache-2.0 para PP-OCRv5, PSF License para CPython, Gemma Terms of Use para TranslateGemma |
| Formato de pesos | ONNX, formato Ollama, checkpoints nativos de cada framework, wheels de Python, binarios ejecutables |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no entrena ni define una arquitectura propia. Es un contenedor de artefactos de terceros. Cada carpeta corresponde a un componente con su propia arquitectura y su propio proceso de entrenamiento, documentado en la fuente original. Los componentes principales son: XTTS v2 de Coqui (TTS con clonacion de voz), Shtorm PocketTTS RU de ArtShtorm (TTS en CPU basado en Kyutai pocket-tts), TeraTTSv2 de TeraSpace (narradores, Open RAIL-M), RUAccent de Denis Petrov (marcado de acentos en ruso), faster-whisper-large-v3-turbo de OpenAI via mobiuslabsgmbh (ASR), HTDemucs de Meta (separacion de fuentes), PP-OCRv5 de PaddleOCR via RapidOCR (OCR en ONNX), Ollama v0.40.16 para Windows y TranslateGemma 12B de Google empaquetado para Ollama.

La unica "innovacion" atribuible al repositorio es operativa: fija un commit concreto y verifica el tamano de cada archivo antes de servirlo, con fallback a la fuente original si la copia no responde. Esto garantiza reproducibilidad de la instalacion de LiveDub. No hay datos sobre tokens de entrenamiento, composicion de datasets ni tecnicas de alineacion (RLHF/DPO) porque el autor no entrena ningun modelo.

## Capacidades

- Sintesis de voz con clonacion (XTTS v2, M1): genera voz a partir de una muestra de referencia.
- TTS en CPU para ruso (Shtorm PocketTTS RU, M3): clonacion de voz sin GPU.
- Narracion con TeraTTSv2 (M4): voces de narrador para doblaje.
- Marcado de acentos en ruso (RUAccent): preprocesado linguistico para TTS en ruso.
- Reconocimiento automatico de habla (Whisper large-v3-turbo via faster-whisper): transcripcion multilingue.
- Separacion de voz y musica (HTDemucs): aislamiento de pistas para doblaje.
- OCR de texto en pantalla (PP-OCRv5 en ONNX): lectura de subtitulos o texto renderizado.
- Traduccion automatica (TranslateGemma 12B via Ollama): traduccion local con el runtime de Ollama.
- Runtime de LLM local (Ollama v0.40.16 para Windows): ejecucion de modelos en la maquina del usuario.
- Entorno Python embebido (CPython 3.12.13 standalone + wheels): ejecucion del motor de la app sin dependencias del sistema.

## Casos de uso

- Doblaje automatico de video: la cadena Whisper (transcripcion) + TranslateGemma (traduccion) + XTTS v2 o TeraTTSv2 (sintesis) permite generar una pista de audio doblada preservando la voz del hablante original mediante clonacion.
- Doblaje al ruso con acentuacion correcta: Shtorm PocketTTS RU combinado con RUAccent produce TTS en ruso con marcado de acentos, adecuado para narracion donde la pronunciacion incorrecta es frecuente.
- Separacion de pistas para postproduccion: HTDemucs aísla la voz de la musica de fondo, lo que permite sustituir el dialogo sin perder la banda sonora original.
- Subtitulado automatico de contenido en pantalla: PP-OCRv5 lee texto renderizado (subtitulos quemados, rotulos) y Whisper transcribe el audio, combinables para generar subtitulos bilingues.
- Traduccion local sin conexion: TranslateGemma 12B sobre Ollama permite traducir guiones o transcripciones en la maquina del usuario, sin enviar contenido a servicios externos.
- Distribucion reproducible de una app de escritorio: el repo sirve como CDN fijo para que las instalaciones de LiveDub obtengan siempre las mismas versiones de cada dependencia, con verificacion de tamano y fallback a la fuente.
- Auditoria de cadena de suministro: un equipo de seguridad puede inspeccionar en un solo lugar todos los binarios y pesos que descarga la app, con sus licencias y avisos legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible a nivel de repo. Depende del componente: XTTS v2 requiere GPU con varios GB de VRAM para inferencia comoda; Whisper large-v3-turbo puede ejecutarse en GPU o CPU; TranslateGemma 12B en Ollama necesita aproximadamente 8-10 GB de VRAM en cuantizacion Q4, aunque el repo no especifica la cuantizacion exacta; HTDemucs funciona en GPU o CPU; PP-OCRv5 en ONNX esta pensado para CPU.
- GPU recomendadas: no disponible. Por componente, una RTX 3060 o superior seria suficiente para TTS y ASR; TranslateGemma 12B se beneficia de 12 GB o mas de VRAM.
- Compatibilidad con GPU de consumo: si, segun el componente. Shtorm PocketTTS RU esta disenado para CPU. El conjunto completo puede ejecutarse en un equipo de consumo, aunque el rendimiento dependera del componente activo.
- Opciones de despliegue: la app LiveDub es el unico consumidor previsto; internamente usa Ollama (runtime incluido), ONNX Runtime (PP-OCRv5), faster-whisper y los frameworks nativos de cada modelo. No se documenta soporte para vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es comparable con un modelo individual: agrega componentes de categorias distintas (TTS, ASR, separacion de fuentes, OCR, traduccion). Una comparacion util requeriria evaluar cada componente contra sus alternativas (por ejemplo, XTTS v2 frente a otros TTS con clonacion, o Whisper large-v3-turbo frente a otros ASR), lo que excede el alcance de esta ficha y no esta respaldado por datos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencias heterogeneas: XTTS v2 esta bajo Coqui Public Model License, que restringe el uso a no comercial. Cualquier uso comercial de la cadena de doblaje que incluya XTTS v2 requiere revisar y probablemente negociar una licencia aparte.
- TranslateGemma 12B esta sujeto a los Gemma Terms of Use, incluida la seccion 3.2 y la Gemma Prohibited Use Policy; el uso comercial y los casos permitidos estan restringidos por esos terminos.
- TeraTTSv2 usa Open RAIL-M con clausula de atribucion: hay que conservar los avisos de licencia y cumplir las restricciones de uso.
- Shtorm PocketTTS RU es CC-BY-4.0, pero la clonacion de una voz requiere el consentimiento de su propietario; el repo lo advierte explicitamente.
- El autor no ha creado ningun contenido: no hay garantia de mantenimiento, actualizacion ni soporte. La fecha de creacion (2026-11-13) y actualizacion (2026-11-13) sugiere un unico commit sin historial posterior.
- Sin pipeline declarado, sin idiomas declarados a nivel de repo y sin model card tecnica: la documentacion de cada componente debe consultarse en su fuente original.
- Riesgo de cadena de suministro: aunque el autor declara copias sin modificar, la verificacion se limita al tamano del archivo, no a un hash criptografico publicado de forma independiente.
- El repositorio pesa 17,8 GB; la descarga completa es costosa y puede no ser necesaria si solo se usa un subconjunto de la cadena.
- No se especifican sesgos, tasas de alucinacion ni limitaciones de contexto porque no hay evaluacion publicada en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arushanyan/livedub-files
- XTTS v2 (Coqui): https://huggingface.co/coqui/XTTS-v2
- Shtorm PocketTTS RU: https://huggingface.co/ArtShtorm/Shtorm-PocketTTS-RU
- TeraTTSv2: https://huggingface.co/TeraSpace/TeraTTSv2
- faster-whisper-large-v3-turbo: https://huggingface.co/mobiuslabsgmbh/faster-whisper-large-v3-turbo
- HTDemucs (Meta): https://huggingface.co/adefossez/HTDemucs
- PaddleOCR / RapidOCR: https://github.com/RapidAI/RapidOCR
- Ollama: https://github.com/ollama/ollama
- TranslateGemma (terminos): https://ai.google.dev/gemma/terms
- Python standalone builds: https://github.com/astral-sh/python-build-standalone
