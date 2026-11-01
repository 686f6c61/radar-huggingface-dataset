# optima-tools-ch/listen-medium

## Resumen

`optima-tools-ch/listen-medium` es un paquete de distribucion del modelo Whisper Medium multilingue de OpenAI en formato GGML para el motor whisper.cpp, empaquetado por Optima Tools. No se trata de un modelo nuevo ni de un fine-tuning: es una copia byte a byte del fichero `ggml-medium.bin` publicado por el repositorio ggerganov/whisper.cpp, en la revision `5359861c739e955e79d9a303bcbc70fb988958b1`, con documentacion de procedencia y creditos anadida.

El objetivo del repositorio es servir como artefacto verificable para la funcion de dictado y transcripcion de la aplicacion Optima Tools. El modelo subyacente es Whisper Medium, un transformer encoder-decoder de reconocimiento automatico del habla (ASR) entrenado por OpenAI sobre datos multilingues, con capacidad de transcripcion y traduccion al ingles.

La relevancia de esta ficha es acotada: el interes tecnico esta en el modelo Whisper Medium original y en su conversion a GGML, no en el empaquetado. El autor declara explicitamente que no se ha realizado ninguna prueba de transcripcion, no se anuncia precision ni velocidad, y la descarga desde la aplicacion aun no esta abierta. El repositorio ocupa 1,5 GB y acumula cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), convertido a GGML |
| Parametros totales | no disponible (el modelo base es Whisper Medium; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento en Whisper; el autor no lo documenta) |
| Tipos de cuantizacion | no disponible (el fichero publicado es `ggml-medium.bin` sin indicacion de cuantizacion) |
| Idiomas soportados | multilingue; el autor menciona explicitamente frances, aleman e ingles, sin lista completa |
| Licencia | MIT (OpenAI para el modelo; ggml authors para la conversion y el motor) |
| Formato de pesos | GGML (`.bin`), para whisper.cpp |
| Tamano del fichero | 1 533 763 059 bytes (1533,76 MB) |
| SHA-256 | `6c14d5adee5f86394037b4e4e8b59f1673b6cee10e3cf0b11bbdbee79c156208` |
| Pipeline | automatic-speech-recognition |
| Modelo base | openai/whisper-medium |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper Medium de OpenAI, un transformer encoder-decoder disenado para ASR y traduccion de voz. La entrada es audio muestreado a 16 kHz convertido a espectrograma log-Mel; el encoder procesa ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales de idioma, tarea (transcribir o traducir) y marcas temporales. El entrenamiento original de OpenAI se realizo sobre datos debilmente supervisados multilingues, pero el autor de este repositorio no aporta ningun detalle sobre volumen de tokens, composicion del dataset ni fases de ajuste.

La unica transformacion documentada es la conversion de los pesos originales al formato GGML de whisper.cpp, realizada por Georgi Gerganov y los contribuyentes del proyecto. Optima Tools actua como preparador y distribuidor del paquete sin modificar el fichero. No hay innovaciones tecnicas propias de este repositorio: no se documenta decodificacion especulativa, atencion lineal ni tecnicas de alineacion adicionales. El autor advierte que la integridad se verifico mediante el SHA-256 de los metadatos LFS de Hugging Face, identico al de la fuente, pero que no se recalculo sobre el modelo publicado; solo se comprobo que los primeros bytes corresponden a la firma GGML esperada.

## Capacidades

- Transcripcion automatica de voz a texto en multiples idiomas, con deteccion de idioma mediante el token de lengua de Whisper.
- Traduccion de voz a texto en ingles (tarea de traduccion nativa de Whisper).
- Segmentacion con marcas temporales a nivel de segmento.
- Procesamiento por ventanas de 30 segundos de audio.
- Ejecucion local mediante whisper.cpp, con backend CPU (build OpenBLAS en el equipo de referencia del autor), CUDA o Vulkan segun las DLL disponibles junto al ejecutable.
- No incluye diarizacion de hablantes (identificacion de intervenientes), segun declara el autor.
- No garantiza transcripcion en tiempo real.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no aplican a un modelo ASR.

## Casos de uso

- Dictado en la aplicacion Optima Tools: el usuario importa `ggml-medium.bin` desde Administracion, IA y modelos; el motor invoca `whisper-cli -m ggml-medium.bin -f dictation.wav -l <idioma>` y devuelve el texto. Es el caso de uso previsto por el autor.
- Transcripcion de reuniones y notas de voz en local: al ejecutarse con whisper.cpp sobre CPU o GPU, el audio no sale del equipo, lo que resulta adecuado para contenido confidencial.
- Generacion de subtitulos para video: Whisper Medium produce marcas temporales por segmento, utiles para exportar ficheros SRT o VTT en un pipeline posterior.
- Traduccion de audio a ingles: la tarea de traduccion nativa permite generar subtitulos en ingles a partir de audio en otros idiomas sin un modelo adicional.
- Preprocesado de audio para pipelines de NLP: transcripcion de grabaciones para alimentar indexacion, busqueda o resumen con modelos de lenguaje.
- Prototipado y evaluacion de ASR en entornos sin GPU: la build CPU con OpenBLAS permite probar el modelo en estaciones de trabajo convencionales, asumiendo mayor latencia.
- Archivado de entrevistas o clases en texto: el caracter multilingue permite procesar material en frances, aleman e ingles con un unico modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que el test de transcripcion en Optima Tools no se ha efectuado y que no se anuncia ninguna precision, velocidad ni compatibilidad hardware.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: no disponible en la informacion proporcionada. El fichero de pesos ocupa 1533,76 MB; a ello hay que sumar el consumo del motor whisper.cpp y los buffers de audio, no cuantificados por el autor.
- GPU recomendadas: no disponible. El autor solo documenta que Optima Tools detecta el backend segun las DLL presentes (CUDA, Vulkan o CPU) y que la build de referencia en su equipo de desarrollo es CPU con OpenBLAS.
- Compatibilidad con GPU de consumo: no confirmada por el autor. El fichero de modelo por si solo no anade un backend GPU; se requiere una build de whisper.cpp con CUDA o Vulkan.
- Opciones de despliegue: whisper.cpp mediante `whisper-cli` (documentado). Otros motores compatibles con Whisper (vLLM, TGI, Ollama) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| optima-tools-ch/listen-medium (este) | no disponible (Whisper Medium) | ventana de audio de 30 s | multilingue | MIT | GGML `.bin` | Hugging Face, 0 descargas |
| openai/whisper-medium | no disponible en la informacion | ventana de audio de 30 s | multilingue | MIT | PyTorch/safetensors (original) | Hugging Face, modelo de referencia |
| ggerganov/whisper.cpp (ggml-medium.bin) | identico a este fichero | ventana de audio de 30 s | multilingue | MIT | GGML `.bin` | Hugging Face, repositorio fuente |
| Otras variantes de Whisper (small, large) | no disponible | ventana de audio de 30 s | multilingue | MIT | varios | no disponible en la informacion |

La comparativa se limita a las variantes del mismo modelo porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas de otros fabricantes. Este repositorio no aporta diferencias tecnicas frente al fichero fuente de whisper.cpp: el SHA-256 es identico.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tuning: es una copia del `ggml-medium.bin` de whisper.cpp. Cualquier limitacion de Whisper Medium aplica sin cambios.
- El autor no ha realizado ninguna prueba de transcripcion; no hay datos de precision, velocidad ni compatibilidad hardware.
- La integridad se basa en el SHA-256 de los metadatos LFS, no recalculado sobre el fichero publicado; solo se verifico la firma GGML inicial.
- La descarga directa desde la aplicacion Optima Tools no esta abierta; el uso requiere importacion manual del fichero `.bin`.
- El import de un `.bin` aislado no copia automaticamente las licencias ni los creditos del repositorio.
- El fichero de modelo no proporciona backend GPU por si mismo; sin DLL de CUDA o Vulkan, la inferencia sera CPU.
- Sin diarizacion de hablantes y sin garantia de tiempo real.
- Calidad variable segun idioma, calidad del audio y hardware; el autor no aporta cifras.
- Riesgo de alucinacion inherente a los modelos ASR generativos de Whisper, especialmente en silencios o audio ruidoso; no documentado explicitamente por el autor pero conocido en la familia Whisper.
- Licencia MIT permite uso comercial, pero deben conservarse los avisos de copyright de OpenAI y de los autores de ggml/whisper.cpp.
- Repositorio con cero descargas y cero likes: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/optima-tools-ch/listen-medium
- Modelo base: https://huggingface.co/openai/whisper-medium
- Fuente del fichero GGML (revision figada): https://huggingface.co/ggerganov/whisper.cpp/tree/5359861c739e955e79d9a303bcbc70fb988958b1
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Documentos del repositorio: `README-source.md`, `LICENSE`, `LICENSE-whisper.cpp`, `CREDITS.md`, `CREDITS.json`, `SOURCE.json`, `.optima-package.json`
