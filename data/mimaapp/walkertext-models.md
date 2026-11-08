# mimaapp/walkertext-models

## Resumen

WalkerText — on-device models es un repositorio espejo publicado por la organizacion MimaApp que aloja los ficheros de modelos descargados por la aplicacion Android WalkerText (`com.mimaapp.captions`) para generar subtitulos en el propio telefono, sin enviar los videos a ningun servidor. No se trata de un modelo entrenado por el autor: los ficheros son copias byte a byte de los originales, hospedadas aqui unicamente para que la app no dependa de repositorios de terceros.

El repositorio agrupa tres artefactos en formato ggml: una conversion cuantizada a q8_0 de Parakeet TDT 0.6B v3 de NVIDIA (modelo de reconocimiento de voz con arquitectura TDT, aproximadamente 600 millones de parametros), el detector de actividad de voz Silero VAD v5.1.2 y una conversion q8_0 de Whisper large-v3-turbo de OpenAI, que la app usa solo para los idiomas que Parakeet no cubre. El tamano total del repositorio es de 1,5 GB.

Su relevancia es practica: ejemplifica un patron de despliegue de ASR totalmente local en dispositivos moviles, combinando un modelo ligero y rapido (Parakeet) con un modelo multilingue de respaldo (Whisper) y un VAD para segmentar el audio. Cada fichero conserva su licencia original (CC-BY-4.0 para Parakeet, MIT para Silero VAD y Whisper), y el repositorio incluye sumas de verificacion SHA-256 para garantizar la integridad de las copias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de tres modelos ASR/VAD: Parakeet TDT (token-and-duration transducer), Silero VAD y Whisper (transformer encoder-decoder) |
| Parametros totales | Parakeet TDT 0.6B v3: aproximadamente 600 M; Whisper large-v3-turbo: no disponible en la informacion; Silero VAD: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelos de audio; ventana de audio no especificada en la informacion) |
| Tipos de cuantizacion | q8_0 (Parakeet y Whisper); Silero VAD sin cuantizacion indicada |
| Idiomas soportados | Multilingue (Parakeet cubre un subconjunto; Whisper large-v3-turbo se usa para el resto) |
| Licencia | CC-BY-4.0 (Parakeet); MIT (Silero VAD y Whisper large-v3-turbo) |
| Formato de pesos | ggml (`.bin`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo; redistribuye conversiones a ggml de tres componentes con funciones complementarias. Parakeet TDT 0.6B v3, desarrollado por NVIDIA, es un modelo de reconocimiento de voz basado en transductores token-and-duration (TDT), una variante de RNN-T que predice conjuntamente tokens y duraciones, lo que acelera la decodificacion. La version alojada aqui es una conversion a q8_0 realizada por ggml-org sin cambios adicionales.

Silero VAD v5.1.2 es un detector de actividad de voz ligero que se emplea para segmentar el audio y evitar procesar silencios. Whisper large-v3-turbo es la variante turbo del modelo multilingue de OpenAI, convertida y cuantizada a q8_0 por el proyecto whisper.cpp. No se dispone en la informacion proporcionada de detalles sobre los datos de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o ajuste fino en ninguno de los tres modelos originales.

## Capacidades

- Reconocimiento de voz (speech-to-text) para generar subtitulos a partir de audio de video.
- Deteccion de actividad de voz (VAD) para segmentar el audio y filtrar silencios.
- Cobertura multilingue: Parakeet para los idiomas que soporta y Whisper large-v3-turbo como respaldo para el resto.
- Ejecucion completamente local en el dispositivo (on-device), sin envio de datos a servidores.
- Generacion de subtitulos con marcas de tiempo derivadas de la segmentacion por VAD y del reconocimiento.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Generacion de subtitulos en Android: la app WalkerText usa Parakeet para transcribir el audio del video en el propio telefono, con Whisper como respaldo para idiomas no cubiertos, evitando subir contenido a la nube.
- Privacidad en la transcripcion: al ejecutarse en local, es adecuado para videos con contenido sensible que no debe salir del dispositivo.
- Segmentacion eficiente de audio: el VAD de Silero permite dividir grabaciones largas en fragmentos con voz antes de pasarlos al ASR, reduciendo computo y latencia.
- Subtitulado de contenido multilingue: la combinacion Parakeet + Whisper permite cubrir un rango amplio de idiomas segun el material.
- Integracion en apps moviles de terceros: los ficheros ggml pueden incorporarse en pipelines basados en whisper.cpp y ggml para transcripcion local.
- Verificacion de integridad en despliegues: las sumas SHA-256 publicadas permiten validar que los ficheros descargados son identicos a los originales antes de usarlos en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion; al tratarse de modelos ggml orientados a inferencia en CPU y movil, no se documentan requisitos de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el diseno apunta a ejecucion on-device en telefonos Android.
- Opciones de despliegue: whisper.cpp y el ecosistema ggml (los ficheros son compatibles con estas herramientas); no se documentan otras opciones como vLLM u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WalkerText — on-device models (este repo) | Parakeet ~0,6 B + Whisper large-v3-turbo + Silero VAD | No disponible | CC-BY-4.0 / MIT | ggml | Espejo de modelos para ASR local en Android |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | No disponible | CC-BY-4.0 | No disponible | Modelo original de NVIDIA del que deriva la conversion q8_0 |
| openai/whisper-large-v3-turbo | No disponible | No disponible | MIT | No disponible | Modelo original de OpenAI usado como respaldo multilingue |
| ggerganov/whisper.cpp | No disponible | No disponible | MIT | ggml | Proyecto de inferencia que produce la conversion q8_0 de Whisper |

## Limitaciones y advertencias

- No es un modelo propio: el repositorio solo redistribuye copias; cualquier limitacion de los modelos originales aplica igualmente.
- La calidad de la transcripcion depende de Parakeet y, en su defecto, de Whisper; no se documentan tasas de error (WER) en la informacion disponible.
- La cobertura de idiomas de Parakeet es parcial; los idiomas no cubiertos dependen de Whisper large-v3-turbo, con posibles diferencias de calidad entre ambos.
- Riesgo de errores de transcripcion en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan mitigaciones.
- La licencia CC-BY-4.0 de Parakeet exige atribucion a NVIDIA y a ggml-org; la licencia MIT de Silero VAD y Whisper exige conservar el aviso de copyright correspondiente.
- No se documentan sesgos especificos; al ser modelos de ASR, pueden reflejar sesgos de sus datos de entrenamiento originales.
- El uso esta pensado para inferencia on-device; no se garantiza su idoneidad para servidores de alta concurrencia sin evaluacion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mimaapp/walkertext-models
- Perfil de la organizacion: https://huggingface.co/mimaapp
- Parakeet GGUF (ggml-org): https://huggingface.co/ggml-org/parakeet-GGUF
- Parakeet TDT 0.6B v3 (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Silero VAD (ggml-org): https://huggingface.co/ggml-org/whisper-vad
- Silero VAD (repositorio original): https://github.com/snakers4/silero-vad
- Whisper.cpp (ggerganov): https://huggingface.co/ggerganov/whisper.cpp
- Whisper large-v3-turbo (OpenAI): https://huggingface.co/openai/whisper-large-v3-turbo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia MIT: https://opensource.org/licenses/MIT
