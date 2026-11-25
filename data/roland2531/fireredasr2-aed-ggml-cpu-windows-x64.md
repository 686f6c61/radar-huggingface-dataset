# Roland2531/FireRedASR2-AED-GGML-CPU-Windows-x64

## Resumen

FireRedASR2-AED GGML CPU Windows x64 es un paquete de distribución del modelo de reconocimiento automático del habla FireRedASR2-AED, empaquetado por el usuario Roland2531 para su ejecución en CPU sobre Windows x64 mediante el formato GGML/GGUF. No se trata de un modelo nuevo ni de pesos originales, sino de un runtime precompilado (CLI y worker JSONL persistente) junto con un conversor de pesos en Python, pensado para desplegar el modelo original de FireRedTeam en equipos sin GPU.

El modelo subyacente, FireRedASR2-AED, es un sistema ASR de la familia FireRed desarrollado por FireRedTeam, del que esta ficha solo puede confirmar lo que aparece en la model card del repositorio de distribución: pipeline `automatic-speech-recognition`, entrada de audio WAV PCM16 mono a 16 kHz y pesos GGUF con CMVN y vocabulario embebidos. La mayor parte de los metadatos técnicos del modelo original (arquitectura, parámetros, contexto, licencia, idiomas) no están disponibles en la información proporcionada.

La relevancia de este repositorio es práctica: permite ejecutar un ASR de calidad en hardware de consumo Windows sin dependencias de CUDA, seleccionando el conjunto de instrucciones de CPU en el arranque, y ofrece una interfaz de línea de comandos y un worker persistente apto para integrarse en pipelines de transcripción por lotes o servicios locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR subyacente FireRedASR2-AED; el paquete es un runtime GGML/GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el ejemplo de la model card usa `model-f16.gguf` (F16). Otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con CMVN y vocabulario embebidos); runtime GGML para Windows x64 |
| Entrada de audio | WAV PCM16 mono a 16 kHz |
| Plataforma | Windows x64 (CPU) |
| Interfaces | CLI (`firered-cli.exe`), worker JSONL persistente, conversor de pesos en Python |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo FireRedASR2-AED en la documentación proporcionada. La model card del repositorio de distribución solo describe el envoltorio de ejecución: un runtime GGML compilado para Windows x64 que carga pesos en formato GGUF con CMVN (normalización de media y varianza) y vocabulario embebidos, y que selecciona el conjunto de instrucciones de CPU en el arranque. El sufijo "AED" del nombre del modelo original sugiere un decodificador de atención (attention-based encoder-decoder), pero este dato no se confirma en la información disponible.

El paquete incluye un conversor de pesos en Python para transformar los pesos originales de FireRedTeam al formato GGUF, y el README indica que se debe usar un GGUF de FireRedASR2-AED con CMVN y vocabulario embebidos. No hay datos sobre número de tokens de entrenamiento, composición del dataset, ni técnicas de alineación (RLHF/DPO).

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio WAV PCM16 mono a 16 kHz, mediante el ejecutable `firered-cli.exe`.
- Procesamiento por lotes mediante un worker JSONL persistente, adecuado para colas de transcripción.
- Conversión de pesos originales de FireRedASR2-AED a GGUF mediante el conversor Python incluido.
- Ejecución en CPU en Windows x64 sin GPU, con selección automática del conjunto de instrucciones al arrancar.
- Integración con los DLL de GGML que deben mantenerse junto a los ejecutables.
- No se documentan capacidades de diarización, timestamps, traducción, tool calling ni agentes en la información disponible.

## Casos de uso

- Transcripción local en estaciones de trabajo Windows sin GPU: el runtime CPU permite transcribir archivos WAV de 16 kHz mono sin depender de CUDA ni de servicios en la nube, útil en entornos con requisitos de privacidad.
- Procesamiento por lotes de archivos de audio: el worker JSONL persistente permite encolar múltiples ficheros y consumir resultados de forma incremental en scripts de automatización.
- Subtitulado y actas de reuniones en equipos de sobremesa: al ejecutarse en CPU, puede integrarse en flujos ofimáticos donde no se dispone de aceleración por hardware.
- Pipelines de transcripción en servidores Windows: el CLI y el worker permiten integrarse en tareas programadas o servicios internos que ya operan sobre Windows x64.
- Evaluación y prototipado de ASR: el conversor de pesos y el runtime facilitan probar el modelo FireRedASR2-AED en formato GGUF antes de comprometerse con un despliegue mayor.
- Despliegue en entornos air-gapped: al ser un paquete autónomo con DLLs y ejecutables, puede instalarse en máquinas sin acceso a internet una vez descargado el ZIP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el runtime está diseñado para CPU.
- GPU recomendadas: no aplica para este paquete; para GPU habría que usar los pesos originales de FireRedTeam con otro runtime.
- CPU: Windows x64 con selección de conjunto de instrucciones en el arranque; no se especifican requisitos mínimos de ISA (SSE, AVX, AVX2, AVX-512).
- RAM: no disponible; depende del tamaño del GGUF cargado (el ejemplo usa F16).
- Cabe en hardware de consumo: sí, al ejecutarse en CPU sin GPU.
- Opciones de despliegue: CLI (`firered-cli.exe`) y worker JSONL persistente incluidos en el ZIP; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo original que permitan una comparación rigurosa con alternativas ASR como Whisper, Vosk o Parakeet.

## Limitaciones y advertencias

- La licencia no está disponible; antes de un uso comercial debe verificarse la licencia del modelo original FireRedASR2-AED en el repositorio de FireRedTeam.
- El repositorio tiene 0 descargas y 1 like, y fue creado y actualizado el mismo día (25 de noviembre de 2026); es un paquete recién publicado sin validación comunitaria.
- El tamaño del repositorio es de 0.0 GB y los pesos no están incluidos: el ZIP de runtime y el GGUF deben descargarse por separado, y el GGUF debe tener CMVN y vocabulario embebidos.
- Solo admite entrada WAV PCM16 mono a 16 kHz; otros formatos o frecuencias requieren preprocesado.
- Solo Windows x64; no hay binarios para Linux, macOS ni ARM.
- No se documentan idiomas soportados, por lo que no puede confirmarse cobertura multilingüe ni calidad por idioma.
- No se documentan sesgos, tasa de alucinación ni comportamiento en audio ruidoso.
- El SHA-256 del ZIP está publicado (34b1bede6b9cd03ca7ead08ff88359038dfffcbe216743d2abce52c89aea1ca6) y conviene verificarlo tras la descarga.
- Al ser un empaquetado de terceros, la cadena de confianza depende del autor del repositorio y no del equipo original del modelo.

## Enlaces

- Repositorio de distribución: https://huggingface.co/Roland2531/FireRedASR2-AED-GGML-CPU-Windows-x64
- Descarga del runtime Windows x64: https://huggingface.co/Roland2531/FireRedASR2-AED-GGML-CPU-Windows-x64/resolve/main/releases/1.0.0-20261125/FireRedASR2-AED-GGML-1.0.0-Windows-x64.zip
- Pesos originales: https://huggingface.co/FireRedTeam/FireRedASR2-AED
