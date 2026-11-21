# AXERA-TECH/Qwen3-ASR-1.7B-AX8860-llama.cpp

## Resumen

Qwen3-ASR-1.7B-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH que permite ejecutar el modelo de reconocimiento automatico del habla Qwen3-ASR-1.7B (desarrollado por el equipo Qwen de Alibaba) sobre la NPU de cuatro nucleos del SoC Axera AX8860, utilizando una bifurcacion de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo, sino de una adaptacion de inferencia: los pesos provienen integramente de los ficheros GGUF incluidos y los kernels de la NPU no contienen pesos, sino que los convierten en tiempo de carga (MXFP8 para el modelo de lenguaje, BF16 para el codificador de audio, desquantizado desde Q8_0 del mmproj).

El modelo base es un sistema multimodal audio-texto de 1.720.574.976 parametros (aproximadamente 1,7 mil millones) orientado a transcripcion de voz. La relevancia de este repositorio es que demuestra la viabilidad de ejecutar un ASR de este tamano en hardware de borde (edge) con aceleracion NPU, alcanzando factores de tiempo real (RTF) de 0,041 en grabaciones de 60 segundos, lo que equivale a transcribir una hora de audio en unos 2,5 minutos de computo efectivo.

El repositorio ocupa 4,1 GB e incluye los binarios estaticos `llama-mtmd-cli` y `llama-server`, los kernels NPU con su `manifest.json` y un script `run.sh` que facilita tanto la transcripcion puntual como el despliegue de un servidor compatible con la API de OpenAI. La licencia del paquete no esta declarada en la informacion disponible, lo que constituye un punto de atencion para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen3-ASR (codificador de audio + modelo de lenguaje); despliegue sobre llama.cpp con backend ggml-axera para NPU AX8860 |
| Parametros totales | 1.720.574.976 (1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (maximo configurado en el runtime) |
| Tipos de cuantizacion | GGUF BF16 (modelo de lenguaje, 3,2 GB); GGUF Q8_0 (codificador de audio, 339 MB); en NPU: MXFP8 para el LM y BF16 para el codificador de audio |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3-asr-1.7b-bf16.gguf`, `mmproj-qwen3-asr-1.7b-q8_0.gguf`) + kernels NPU propietarios en `kernels/` |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-ASR-1.7B, es un sistema multimodal que combina un codificador de audio con un modelo de lenguaje de la familia Qwen3 para producir transcripciones. En este repositorio, el codificador de audio se distribuye en formato GGUF Q8_0 (339 MB) y el modelo de lenguaje en GGUF BF16 (3,2 GB); en tiempo de carga, los kernels NPU convierten los pesos a MXFP8 (LM) y BF16 (codificador de audio). La inferencia se ejecuta con una bifurcacion de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `axera-dev`, commit `0104880be`) que incorpora los modulos `ggml/src/ggml-axera/models/qwen3` y `qwen3_asr`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La innovacion tecnica destacable de este paquete es el propio backend ggml-axera: tres kernels NPU especializados (codificador de audio, prefill de texto y decode de texto con cabeza de salida) que aceleran la inferencia completa sobre los cuatro nucleos del AX8860, con conversion de pesos en el arranque (aproximadamente 0,5 s, una sola vez por ejecucion). El binario esta enlazado estaticamente y solo depende de `/opt/lib` y libc del sistema.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio en formato WAV, con soporte de entrada mediante base64 en peticiones a la API.
- Procesamiento de audio de duracion variable: desde grabaciones de 0,6 s hasta clips de 60 s en las pruebas publicadas.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) con contenido multimodal `input_audio`.
- Ejecucion en hardware de borde con aceleracion NPU (Axera AX8860, cuatro nucleos).
- Modo CLI para transcripcion puntual de ficheros mediante `llama-mtmd-cli`.
- Inferencia de una sola secuencia (sin batching concurrente en servidor).
- Capacidades de razonamiento, codigo, matematicas o tool calling del modelo de lenguaje subyacente: no documentadas en este paquete, orientado exclusivamente a ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en dispositivos de borde: el modelo procesa clips de hasta 60 s con RTF de 0,041 sobre la NPU del AX8860, lo que permite transcribir en tiempo casi real sin enviar audio a la nube.
- Subtitulado y postproduccion de video en local: con un RTF inferior a 0,1 en grabaciones de 7,3 s, es adecuado para generar subtitulos de forma iterativa en un equipo de edicion sin depender de servicios externos.
- Asistentes de voz embebidos en electrodomesticos o equipos industriales: el despliegue estatico (solo depende de `/opt/lib` y libc) y el consumo de los cuatro nucleos NPU lo hacen apto para integracion en firmware de dispositivos.
- Servicio interno de transcripcion con API compatible con OpenAI: el binario `llama-server` expone `/v1/chat/completions`, lo que permite sustituir llamadas a APIs comerciales por un endpoint local sin cambiar el codigo cliente.
- Cumplimiento y privacidad de datos: al ejecutarse integramente en el dispositivo, el audio no sale del perimetro, lo que resulta util en entornos sanitarios, legales o industriales con requisitos de confidencialidad.
- Procesamiento por lotes de archivos de audio en un servidor de borde: mediante el CLI `llama-mtmd-cli` y scripts, se pueden transcribir colecciones de grabaciones cortas de forma secuencial aprovechando la conversion de pesos unica por arranque.
- Evaluacion y prototipado de ASR en hardware Axera: util para equipos que desarrollan sobre AX8860 y necesitan una referencia funcional de un modelo de 1,7 B con kernels NPU listos para usar.

## Benchmarks y rendimiento

Datos de rendimiento publicados por el autor (AX8860, SDK V0.5.1, NPU de cuatro nucleos, modo servidor, extremo a extremo):

| Duracion del audio | Tiempo de procesamiento | RTF |
|---|---|---|
| 0,6 s | 0,10 s | 0,17 |
| 7,3 s | 0,53–0,64 s | 0,07–0,09 |
| 60 s | 2,5 s | 0,041 |

Nota: la primera peticion anade aproximadamente 0,5 s de conversion de pesos (una vez por arranque). En cuanto a correccion, el autor indica que las transcripciones son identicas a las de la implementacion NPU anterior, con 20 de 20 frases exactas en su conjunto de evaluacion. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, WER) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de cuatro nucleos; SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`).
- Memoria: el repositorio ocupa 4,1 GB; los pesos en disco son 3,2 GB (LM BF16) + 339 MB (codificador de audio Q8_0).
- VRAM en GPU convencional: no disponible; este paquete esta compilado especificamente para la NPU AX8860 y no se documenta su ejecucion en GPU NVIDIA o AMD.
- GPU de consumidor: no aplica a este artefacto; para ejecutar el modelo base en GPU habria que recurrir a los pesos originales de Qwen3-ASR-1.7B con otro backend de llama.cpp.
- Opciones de despliegue: `llama-mtmd-cli` (CLI) y `llama-server` (API compatible con OpenAI) incluidos en `bin/`; variables `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`; flags `-ngl 99`, `-c` maximo 4096, `-np 1` en servidor.
- Latencia y throughput: RTF de 0,041 en audio de 60 s y de 0,07–0,09 en audio de 7,3 s; no se documenta throughput en tokens por segundo.
- Restriccion de concurrencia: el runtime ocupa los cuatro nucleos NPU en exclusiva; no se deben ejecutar otros programas NPU en paralelo y el servidor debe configurarse con una sola secuencia (`-np 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-AX8860-llama.cpp (este) | 1,7 B | 4096 | Audio (WAV) | no disponible | NPU Axera AX8860 |
| Qwen3-ASR-1.7B (modelo base) | 1,7 B | no disponible | Audio | no disponible en la informacion proporcionada | Pesos originales, multiples backends |
| Whisper large-v3 (referencia de la categoria) | 1550 M | 30 s de audio por ventana | Audio | MIT (segun el proyecto OpenAI Whisper) | GPU, CPU, edge |
| Whisper small (referencia de borde) | 244 M | 30 s de audio por ventana | Audio | MIT (segun el proyecto OpenAI Whisper) | GPU, CPU, edge |

No se dispone de datos comparativos de WER ni de latencia entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto y disponibilidad. Las cifras de Whisper se incluyen como referencia de categoria y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del paquete ni del modelo base en la informacion disponible; es imprescindible verificar los terminos antes de cualquier uso comercial.
- Dependencia de hardware: el artefacto solo funciona en AX8860 con SDK V0.5.0 o superior; no es portable a otras NPU ni a GPU sin recompilar.
- Exclusividad de la NPU: el runtime ocupa los cuatro nucleos; no se pueden ejecutar otros programas NPU simultaneamente.
- Concurrencia limitada: una sola secuencia (`-np 1`) y contexto maximo de 4096 tokens; no apto para servidores multiusuario de alta concurrencia.
- Idiomas: no se documenta la cobertura linguistica del modelo base en la informacion disponible.
- Sesgos y alucinacion: no se han publicado evaluaciones de sesgo ni tasas de error (WER) en la informacion disponible; como todo modelo generativo, puede producir transcripciones plausibles pero incorrectas en audio con ruido o acentos no vistos.
- Formato de audio: las pruebas y el ejemplo de API utilizan WAV; no se documenta soporte de otros formatos o codecs.
- Primera peticion mas lenta: anade aproximadamente 0,5 s por la conversion de pesos al arrancar.
- Madurez: el paquete tiene pocas descargas (960) y una sola interaccion (1 like) en el momento de la consulta; conviene validar en el caso de uso concreto antes de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-ASR-1.7B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Bifurcacion de llama.cpp con backend Axera: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `0104880be`)
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Proyecto OpenAI Whisper (referencia de la categoria): https://github.com/openai/whisper
