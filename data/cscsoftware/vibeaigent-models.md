# CSCSoftware/vibeaigent-models

## Resumen

`CSCSoftware/vibeaigent-models` no es un modelo entrenado por su publicador, sino un repositorio espejo que fija las copias exactas de los ficheros que el asistente de instalación de Vibe Aigent descarga para sus funciones de voz locales. El repositorio lo mantiene CSC-Software GmbH y contiene tres pesos en formato GGUF/BIN procedentes de proyectos upstream: el modelo de reconocimiento de voz Whisper large-v3-turbo de OpenAI en su conversión a whisper.cpp, y dos componentes de Qwen3-TTS del equipo Qwen de Alibaba (el modelo talker de 1,7 mil millones de parámetros y el códec de audio a 12 Hz) en su conversión a qwentts.cpp. El propósito es garantizar la integridad de las descargas mediante verificación SHA-256.

El modelo principal en cuanto a tamaño es `qwen-talker-1.7b-base-Q8_0.gguf`, con 1.928.677.440 parámetros en cuantización Q8_0, destinado a síntesis de voz (text-to-speech). Se complementa con `qwen-tokenizer-12hz-Q8_0.gguf`, el códec de audio que traduce entre formas de onda y tokens discretos, y con `ggml-large-v3-turbo-q5_0.bin`, el modelo Whisper large-v3-turbo cuantizado a 5 bits para reconocimiento automático de voz. Los tres operan en local, sin dependencia de servicios en la nube.

La relevancia de este repositorio es práctica más que investigadora: sirve como fuente reproducible y verificable para despliegues de voz en local dentro de la aplicación Vibe Aigent, e incluye además un paquete de 14 voces (.qvoice) creadas y reentrenadas por CSC-Software. Para quien evalúe el modelo, conviene tener claro que los méritos técnicos corresponden a los proyectos upstream (Whisper y Qwen3-TTS), no a este espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el componente principal es Qwen3-TTS (modelo talker) con codec de audio a 12 Hz; el componente ASR es Whisper large-v3-turbo (transformer encoder-decoder) |
| Parametros totales | 1.928.677.440 (componente talker Qwen3-TTS); Whisper large-v3-turbo: no disponible en la informacion; codec 12 Hz: no disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (Qwen3-TTS talker y codec), Q5_0 (Whisper large-v3-turbo) |
| Idiomas soportados | No disponible a nivel de modelo; el paquete de voces incluye 10 voces alemanas (5 masculinas / 5 femeninas, que también hablan inglés) y 4 voces nativas en inglés (2 / 2) |
| Licencia | Mixta: MIT (Whisper/whisper.cpp), Apache-2.0 (Qwen3-TTS), licencia propia del paquete de voces (uso libre incluido comercial, sin suplantación de identidad) |
| Formato de pesos | GGUF (talker y codec), BIN/GGML (Whisper) |

## Arquitectura y entrenamiento

Este repositorio no documenta entrenamiento propio: los pesos son copias sin modificar de las publicaciones upstream. El componente de síntesis de voz corresponde a Qwen3-TTS, del equipo Qwen de Alibaba, distribuido en el repositorio `Serveurperso/Qwen3-TTS-GGUF` como conversión a qwentts.cpp. Se compone de un modelo talker de aproximadamente 1,93 mil millones de parámetros y un códec de audio a 12 Hz que tokeniza la señal de audio; el talker genera tokens de audio que el códec reconstruye como forma de onda. El componente de reconocimiento es Whisper large-v3-turbo de OpenAI, en la conversión `ggml` de whisper.cpp cuantizada a 5 bits, con arquitectura encoder-decoder transformer orientada a transcripción multilingüe.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición de los datasets ni las etapas de alineación (RLHF/DPO) de ninguno de los componentes. La única aportación propia del publicador es el paquete de 14 voces `.qvoice`, creadas y reentrenadas por CSC-Software GmbH a partir de las voces base, con licencia que permite uso libre, incluido comercial, y prohíbe la suplantación de identidad.

## Capacidades

- Síntesis de voz (text-to-speech) en local mediante Qwen3-TTS, con salida de audio generada a partir de texto.
- Reconocimiento automático de voz (ASR) en local mediante Whisper large-v3-turbo, con transcripción de audio a texto.
- Tokenización y reconstrucción de audio mediante el códec de 12 Hz.
- Selección entre 14 voces preentrenadas: 10 alemanas (5 masculinas, 5 femeninas) que también hablan inglés, y 4 nativas en inglés (2 masculinas, 2 femeninas).
- Verificación de integridad de cada descarga mediante SHA-256, lo que permite despliegues reproducibles.
- Ejecución completamente offline a través de whisper.cpp / Whisper.net y qwentts.cpp.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni modo thinking.

## Casos de uso

- Anuncios y avisos por voz en aplicaciones de escritorio: el talker Qwen3-TTS en Q8_0 genera locuciones a partir de texto con las voces incluidas, sin enviar datos a servicios externos; adecuado para aplicaciones que deben funcionar sin conexión.
- Dictado y transcripción local: Whisper large-v3-turbo en Q5_0 permite convertir audio del micrófono en texto dentro de la propia máquina, útil en entornos con requisitos de privacidad o sin red.
- Asistentes conversacionales por voz en local: la combinación de ASR (Whisper) y TTS (Qwen3-TTS) cubre el ciclo completo de entrada y salida de audio en un asistente de escritorio.
- Accesibilidad: lectura en voz alta de contenido de la aplicación para usuarios con discapacidad visual, con selección de voz alemana o inglesa según el idioma del usuario.
- Integración en el asistente de instalación de Vibe Aigent: el repositorio actúa como origen fiable de los ficheros que el wizard descarga y verifica por SHA-256, lo que simplifica el despliegue en equipos de usuarios finales.
- Prototipado de interfaces de voz: investigadores y desarrolladores pueden montar un pipeline TTS+ASR local con pesos fijados y reproducibles, sin depender de APIs externas ni de cambios en los repositorios upstream.
- Generación de locuciones para contenido interno: anuncios, avisos o narraciones con voces alemanas o inglesas bajo una licencia que permite uso comercial y prohíbe la suplantación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el talker Qwen3-TTS en Q8_0 ocupa aproximadamente 2,08 GB en disco y el codec unos 0,29 GB; Whisper large-v3-turbo en Q5_0 ocupa unos 0,57 GB. La inferencia puede ejecutarse en CPU con estos formatos cuantizados, por lo que la VRAM necesaria es reducida o nula si se usa CPU.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con 4-8 GB de VRAM debería acomodar los componentes por separado.
- GPU consumer: sí, los tres componentes caben holgadamente en GPUs de gama media y baja; el talker Q8_0 es el de mayor huella.
- Opciones de despliegue: whisper.cpp / Whisper.net para el ASR y qwentts.cpp para el TTS, que son los runtimes para los que se publicaron estas conversiones. No se indica compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS talker 1.7B (este repo, Q8_0) | 1.928.677.440 | No disponible | GGUF (qwentts.cpp) | Apache-2.0 | Hugging Face (espejo y upstream) |
| Whisper large-v3-turbo (este repo, Q5_0) | No disponible | No disponible | BIN/GGML (whisper.cpp) | MIT | Hugging Face (espejo y upstream) |
| Alternativas TTS comparables | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas ASR comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es un espejo: no hay entrenamiento ni ajuste propio más allá del paquete de voces, por lo que cualquier limitación de Whisper o Qwen3-TTS se hereda sin cambios.
- La licencia es mixta y depende del fichero: MIT para Whisper, Apache-2.0 para Qwen3-TTS y una licencia propia para las voces; es necesario revisar cada una antes de un uso comercial.
- El paquete de voces prohíbe explícitamente la suplantación de identidad; su uso para imitar a personas reales queda fuera de licencia.
- No se documentan idiomas soportados a nivel de modelo; la cobertura lingüística práctica está limitada por las voces incluidas (alemán e inglés) y por las capacidades multilingües de Whisper, que no se detallan aquí.
- No hay información sobre sesgos, tasas de alucinación en la síntesis ni errores de transcripción en dominios específicos; en producción conviene validar con muestras propias.
- Los enlaces upstream pueden cambiar de versión; la reproducibilidad depende de fijar los SHA-256 publicados.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no debe asumirse ninguna de estas capacidades.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CSCSoftware/vibeaigent-models
- Proyecto Vibe Aigent (GitHub): https://github.com/CSCSoftware/VibeAigent
- Whisper.cpp (upstream ASR): https://huggingface.co/ggerganov/whisper.cpp
- Qwen3-TTS GGUF (upstream TTS): https://huggingface.co/Serveurperso/Qwen3-TTS-GGUF
- Publicador: https://www.csc-software.de
