# mup99ma/Chatterbox-TTS-Persian-gguf

## Resumen

Chatterbox-TTS-Persian-gguf es una conversión al formato GGUF del modelo Thomcles/Chatterbox-TTS-Persian-Farsi, una variante en persa (farsi) del pipeline de síntesis de voz Chatterbox desarrollado originalmente por Resemble AI. El modelo resuelve el problema de la generación de voz sintética en persa, un idioma con escasa representación en los sistemas TTS comerciales y abiertos, y lo hace mediante un pipeline completo que va del texto a una onda de audio WAV a 24 kHz. La relevancia actual reside en que permite ejecutar un TTS persa de forma local con herramientas de inferencia basadas en GGML, sin depender de servicios en la nube.

La arquitectura subyacente es la de Chatterbox: un tokenizador de caracteres, un modelo autorregresivo T3 basado en Llama de 30 capas y 520M de parámetros que convierte texto en tokens de habla, un modelo S3Gen (encoder Conformer más un denoiser UNet1D con flow matching y 10 pasos de Euler) que transforma esos tokens en mel-espectrogramas, y un vocoder HiFTGenerator que genera la forma de onda final. El repositorio contiene 264.001.205 parámetros en total y ocupa 1,5 GB.

Este repositorio concreto es una conversión de pesos a GGUF para su uso con el motor CrispStrobe/CrispASR, no un modelo entrenado desde cero. Se distribuye bajo licencia MIT y está orientado exclusivamente al idioma persa. El número de descargas (57) y la ausencia de likes indican que se trata de una conversión reciente y de nicho, publicada el 28 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS: tokenizador de caracteres, T3 (Llama autorregresivo de 30 capas, 520M), S3Gen (Conformer + UNet1D CFM, 10 pasos Euler), vocoder HiFTGenerator |
| Parametros totales | 264.001.205 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (T3), q8_0 (S3Gen) |
| Idiomas soportados | persa (farsi, `fa`) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una conversión GGUF del checkpoint Thomcles/Chatterbox-TTS-Persian-Farsi, que a su vez deriva de ResembleAI/chatterbox. El pipeline consta de cuatro etapas encadenadas: un tokenizador de caracteres que segmenta el texto persa; T3, un transformer autorregresivo de tipo Llama con 30 capas y 520M de parámetros que predice tokens de habla; S3Gen, que combina un encoder Conformer con un denoiser UNet1D de flow matching (CFM) que ejecuta 10 pasos de Euler para producir mel-espectrogramas; y un vocoder HiFTGenerator con cadenas convolucionales, activaciones Snake e iSTFT que sintetiza la onda final a 24 kHz. La conversión a GGUF separa el modelo en dos ficheros: `chatterbox-t3-fa-f16.gguf` para la etapa texto a tokens y `chatterbox-s3gen-q8_0.gguf` para la etapa tokens a audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card cita los datasets Thomcles/Persian-Farsi-Speech, Thomcles/YodaLingua-Farsi y Thomcles/YodaLingua-preview como datos asociados, pero no detalla su tamaño ni su proceso de curación. La innovación técnica destacable es la propia cadena de conversión GGUF, que permite ejecutar el pipeline completo en el motor CrispASR con pesos de 16 bits para T3 y de 8 bits para S3Gen, reduciendo el peso del repositorio a 1,5 GB.

## Capacidades

- Síntesis de voz (text-to-speech) en persa a partir de texto escrito en alfabeto persa.
- Generación de audio WAV a 24 kHz mediante el vocoder HiFTGenerator.
- Voz por defecto integrada en el motor CrispASR, sin necesidad de muestras de referencia.
- Ejecución local mediante el backend `chatterbox` de CrispASR.
- Soporte de entrada de texto con puntuación y frases completas en persa.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Audiolibros y lectura automática en persa: el modelo convierte texto literario o divulgativo en audio WAV de 24 kHz, adecuado para narración encadenada de párrafos mediante invocaciones sucesivas al motor CrispASR.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de escritorio que necesiten leer contenido web o documentos en persa sin conexión a servicios externos.
- Sistemas de anuncios y megafonía en entornos locales: generación previa de locuciones en persa para aeropuertos, estaciones o comercios, donde la latencia no es crítica y prima la ejecución offline.
- Aprendizaje de idiomas: producción de material auditivo en persa para aplicaciones de enseñanza, con pronunciación sintética reproducible y sin coste por petición.
- Prototipado de asistentes de voz en persa: uso del modelo como componente TTS dentro de un pipeline mayor (ASR más LLM más TTS) para validar la experiencia conversacional antes de invertir en un servicio comercial.
- Contenido para podcasts y vídeo de bajo presupuesto: generación de voces en off en persa para canales que necesitan narración rápida y local, aprovechando la licencia MIT para uso comercial.
- Pruebas de integración en herramientas GGML: el formato GGUF y el motor CrispASR permiten evaluar el pipeline en entornos con recursos limitados y comparar la calidad frente a alternativas en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 1,5 GB, por lo que la inferencia cabe holgadamente en GPUs con 4 GB o más, y probablemente en configuraciones con menos memoria usando el fichero S3Gen en q8_0.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del pipeline (264M de parámetros totales), cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente; también es plausible la ejecución en CPU.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño reducido de los pesos.
- Opciones de despliegue: CrispASR (backend `chatterbox`), con los ficheros `chatterbox-t3-fa-f16.gguf` y `chatterbox-s3gen-q8_0.gguf`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Chatterbox-TTS-Persian-gguf (este) | 264M | no disponible | persa | MIT | GGUF |
| ResembleAI/chatterbox (base) | no disponible | no disponible | inglés y otros | MIT | safetensors |
| Thomcles/Chatterbox-TTS-Persian-Farsi | no disponible | no disponible | persa | MIT | safetensors |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La diferencia principal frente al modelo base es el formato GGUF y la especialización en persa; frente al checkpoint original de Thomcles, este repositorio añade la cuantización y el empaquetado para CrispASR.

## Limitaciones y advertencias

- El modelo solo soporta persa (`fa`); no se debe esperar calidad en otros idiomas.
- No hay información sobre sesgos de género, acento o registro en la voz generada; es probable que herede los sesgos de los datasets de entrenamiento citados.
- Riesgo de alucinación en la pronunciación de palabras poco frecuentes, nombres propios o términos técnicos, al ser un modelo autorregresivo sobre tokens de habla.
- No se documenta la longitud máxima de texto por invocación; textos largos pueden requerir segmentación manual.
- La licencia MIT permite uso comercial, pero el modelo base ResembleAI/chatterbox y el checkpoint intermedio Thomcles/Chatterbox-TTS-Persian-Farsi también son MIT según la información disponible; conviene verificar las condiciones de los datasets citados.
- El repositorio tiene muy poca tracción (57 descargas, 0 likes) y fue publicado recientemente, por lo que no hay evidencia comunitaria sobre su robustez en producción.
- Depende del motor CrispASR, una herramienta menos extendida que llama.cpp u Ollama; la integración con otros runtimes no está documentada.
- No se dispone de información sobre latencia, throughput ni calidad subjetiva (MOS) para planificar despliegues a escala.

## Enlaces

- [Hugging Face: mup99ma/Chatterbox-TTS-Persian-gguf](https://huggingface.co/mup99ma/Chatterbox-TTS-Persian-gguf)
- [Modelo base intermedio: Thomcles/Chatterbox-TTS-Persian-Farsi](https://huggingface.co/Thomcles/Chatterbox-TTS-Persian-Farsi)
- [Modelo original: ResembleAI/chatterbox](https://huggingface.co/ResembleAI/chatterbox)
- [Motor de inferencia: CrispStrobe/CrispASR](https://github.com/CrispStrobe/CrispASR)
- [Releases de CrispASR](https://github.com/CrispStrobe/CrispASR/releases)
- [Dataset: Thomcles/Persian-Farsi-Speech](https://huggingface.co/datasets/Thomcles/Persian-Farsi-Speech)
- [Dataset: Thomcles/YodaLingua-Farsi](https://huggingface.co/datasets/Thomcles/YodaLingua-Farsi)
- [Dataset: Thomcles/YodaLingua-preview](https://huggingface.co/datasets/Thomcles/YodaLingua-preview)
