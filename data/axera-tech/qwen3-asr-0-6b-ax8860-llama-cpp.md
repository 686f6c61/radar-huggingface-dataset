# AXERA-TECH/Qwen3-ASR-0.6B-AX8860-llama.cpp

## Resumen

Qwen3-ASR-0.6B-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH que permite ejecutar el modelo de reconocimiento automatico del habla Qwen3-ASR-0.6B (desarrollado por el equipo Qwen de Alibaba) sobre la NPU de cuatro nucleos del SoC Axera AX8860, utilizando una bifurcacion de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo entrenado por AXERA, sino de una distribucion de pesos en formato GGUF junto con kernels precompilados, binarios estaticos para la placa y scripts de ejecucion que trasladan la inferencia del transformer y del codificador de audio a la NPU del dispositivo.

El modelo base tiene 596.049.920 parametros (aproximadamente 0,6 mil millones), lo que lo situa en la categoria de modelos ASR ligeros aptos para edge computing. El repositorio ocupa 1,7 GB e incluye dos artefactos GGUF: los pesos del modelo de lenguaje en BF16 (1,1 GB) y el codificador de audio en Q8_0 (204 MB), que se descomprime a BF16 al cargarse. La ventana de contexto maxima es de 4096 tokens y el servicio solo admite una secuencia simultanea.

La relevancia de esta ficha radica en que demuestra un flujo completo de ASR local en hardware NPU de bajo consumo, con tasas de tiempo real (RTF) entre 0,028 y 0,12 segun la duracion del audio, y con una interfaz compatible con la API de OpenAI (`/v1/chat/completions` con entrada de audio en base64). Es un caso practico de integracion de modelos Qwen en silicio especializado mediante el ecosistema llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen3-ASR (transformer con codificador de audio y decoder de lenguaje); despliegue con llama.cpp y backend ggml-axera sobre NPU AX8860 |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (maximo configurable con `-c`) |
| Tipos de cuantizacion | Pesos publicados: BF16 (modelo de lenguaje) y Q8_0 (codificador de audio); en carga se convierte el LM a MXFP8 y el codificador a BF16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3-asr-0.6b-bf16.gguf`, `mmproj-qwen3-asr-0.6b-q8_0.gguf`) + kernels NPU y binarios estaticos |
| Modelo base | Qwen/Qwen3-ASR-0.6B |
| Hardware objetivo | Axera AX8860, NPU de 4 nucleos, SDK V0.5.0 o superior |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo base Qwen3-ASR-0.6B: no se detallan el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Lo que si se documenta es la arquitectura de despliegue: un codificador de audio (cargado desde el `mmproj` en Q8_0 y descomprimido a BF16) y un modelo de lenguaje de 0,6 mil millones de parametros, ambos ejecutados mediante kernels especificos para la NPU AX8860 (uno para el codificador de audio, uno para el prefill de texto y uno para el decode de texto con la cabeza de salida).

La innovacion tecnica principal es la integracion ggml-axera dentro de una bifurcacion de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `axera-dev`, commit `6613735ce`), que permite descargar el computo en la NPU manteniendo los pesos exclusivamente en los ficheros GGUF: los kernels no contienen pesos, sino que se convierten en tiempo de carga (MXFP8 para el LM, BF16 para el codificador de audio). La primera peticion anade aproximadamente 0,4 s de conversion, que ocurre una sola vez por arranque. El binario `llama-mtmd-cli` y el servidor `llama-server` se distribuyen estaticamente y solo dependen de `/opt/lib` y libc.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) sobre ficheros WAV.
- Procesamiento multimodal de audio: la entrada se pasa como `{"type":"input_audio","input_audio":{"format":"wav","data":""}}` en el campo `content` de la peticion.
- Servicio compatible con la API de OpenAI mediante `/v1/chat/completions` (etiqueta `endpoints_compatible` en el repositorio).
- Ejecucion en modo CLI para transcribir una grabacion individual (`./run.sh speech.wav`).
- Ejecucion en modo servidor (`./run.sh -s 8080`) para integracion en aplicaciones.
- Inferencia completamente local en la NPU del dispositivo, sin dependencia de servicios en la nube.
- Soporte de contexto de hasta 4096 tokens por peticion.
- No se documentan capacidades de tool calling, agentes, vision, audio de salida ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Transcripcion de notas de voz en dispositivos empotrados: el modelo procesa un WAV de 60 s en 1,7 s (RTF 0,028) sobre la NPU AX8860, lo que permite transcribir mensajes de voz en tiempo casi real dentro de un dispositivo de bajo consumo.
- Subtitulado y actas de reuniones en local: con RTF de 0,05-0,06 para grabaciones de 7,3 s, es viable procesar segmentos cortos de audio de forma secuencial para generar transcripciones sin enviar datos a terceros.
- Asistentes de voz para domotica y wearables: al ejecutarse integramente en la NPU y no requerir GPU dedicada, encaja en dispositivos con restricciones termicas y energeticas que necesitan reconocimiento de comandos.
- Servicio de transcripcion autoalojado en edge: el endpoint `/v1/chat/completions` compatible con OpenAI permite sustituir llamadas a APIs externas por un servidor local en la placa, simplificando la integracion en aplicaciones existentes.
- Cumplimiento y privacidad de datos: al no salir el audio del dispositivo, es adecuado para entornos sanitarios, legales o industriales donde la transcripcion de conversaciones no puede delegarse a la nube.
- Prototipado y validacion de hardware NPU: los kernels y binarios publicados sirven como referencia para evaluar el rendimiento de llama.cpp sobre AX8860 antes de disenar un producto final.
- Automatizacion de pipelines de audio por lotes: el script `run.sh` permite encadenar transcripciones de ficheros WAV en un flujo de procesamiento local.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados son medidas de latencia y RTF en modo servidor sobre AX8860 (SDK V0.5.1, NPU de 4 nucleos), de extremo a extremo:

| Duracion del audio | Tiempo de proceso | RTF |
|---|---|---|
| 0,6 s | 0,07 s | 0,12 |
| 7,3 s | 0,38-0,47 s | 0,05-0,06 |
| 60 s | 1,7 s | 0,028 |

La primera peticion anade aproximadamente 0,4 s de conversion de pesos (una vez por arranque). En cuanto a correccion, el autor indica que las transcripciones de las grabaciones de prueba son identicas a las de la implementacion NPU anterior, con 20 de 20 frases exactas sobre su conjunto de evaluacion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER sobre LibriSpeech u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de 4 nucleos; no se documenta ejecucion en GPU convencional.
- SDK: V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`); las medidas se tomaron con V0.5.1.
- Memoria: el repositorio ocupa 1,7 GB; los pesos se cargan desde los GGUF (1,1 GB el LM en BF16 y 204 MB el codificador en Q8_0) y se convierten a MXFP8/BF16 en la NPU.
- Variables de entorno: `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`; desde el 2026-11-24 el binario aborta si no se define `GGML_AXERA_KERNEL_DIR`.
- Parametros de ejecucion: `-ngl 99` para descargar todas las capas en la NPU, `-c` hasta 4096 y `-np 1` en el servidor (una sola secuencia).
- Despliegue: `llama-mtmd-cli` (CLI) y `llama-server` (API compatible con OpenAI) incluidos como binarios estaticos en `bin/`.
- Exclusividad: el runtime ocupa los 4 nucleos de la NPU, por lo que no deben ejecutarse otros programas NPU en paralelo.
- VRAM, GPU recomendadas (A100, H100, RTX 4090), latencia en GPU y throughput en GPU: no disponibles; el paquete esta disenado exclusivamente para la NPU AX8860.

## Comparativa con modelos similares

No se dispone de datos publicados en la informacion proporcionada para comparar este paquete con alternativas equivalentes (por ejemplo, otras distribuciones de Qwen3-ASR-0.6B para CPU/GPU o modelos ASR ligeros como Whisper small). La comparacion solo puede establecerse frente al propio modelo base:

| Modelo | Parametros | Contexto | Hardware | Formato | Licencia |
|---|---|---|---|---|---|
| AXERA-TECH/Qwen3-ASR-0.6B-AX8860-llama.cpp | 596.049.920 | 4096 tokens | NPU Axera AX8860 | GGUF + kernels NPU | no disponible |
| Qwen/Qwen3-ASR-0.6B (modelo base) | 596.049.920 | no disponible | CPU/GPU generica | safetensors (presumiblemente) | no disponible |

## Limitaciones y advertencias

- El runtime ocupa los 4 nucleos de la NPU AX8860 de forma exclusiva; no puede convivir con otros programas NPU en el mismo dispositivo.
- Solo admite una secuencia: el servidor debe arrancarse con `-np 1`, lo que limita la concurrencia a una peticion a la vez.
- Contexto maximo de 4096 tokens, suficiente para audios cortos pero restrictivo para grabaciones largas sin segmentacion previa.
- El paquete esta atado al hardware AX8860 y al SDK V0.5.0 o superior; no es portable a otras plataformas sin recompilar los kernels.
- La licencia no se especifica en la informacion disponible, por lo que el uso comercial debe verificarse contra la licencia del modelo base Qwen3-ASR-0.6B antes de desplegarlo en produccion.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion o error (WER) sobre conjuntos estandar; el unico dato de correccion es interno (20 de 20 frases exactas en el conjunto de evaluacion del autor).
- La primera peticion tras el arranque incurre en unos 0,4 s adicionales por la conversion de pesos.
- Si no se define `GGML_AXERA_KERNEL_DIR`, los binarios actuales terminan con error.
- El modelo de 0,6 mil millones de parametros puede presentar menor precision que modelos ASR de mayor tamano en audio con ruido, acentos marcados o vocabulario especializado; no hay datos publicados que lo confirmen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-ASR-0.6B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Bifurcacion de llama.cpp con backend Axera: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`)
