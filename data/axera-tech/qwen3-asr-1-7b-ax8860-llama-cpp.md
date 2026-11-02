# AXERA-TECH/Qwen3-ASR-1.7B-AX8860-llama.cpp

## Resumen

Qwen3-ASR-1.7B-AX8860-llama.cpp es un paquete de inferencia publicado por AXERA-TECH para ejecutar el modelo de reconocimiento automatico del habla (ASR) Qwen3-ASR-1.7B, desarrollado originalmente por Qwen (Alibaba), sobre la NPU de cuatro nucleos del SoC Axera AX8860 mediante una bifurcacion de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo, sino de una distribucion de pesos en formato GGUF acompanada de kernels compilados para la NPU y binarios estaticos (`llama-mtmd-cli` y `llama-server`) que permiten transcribir audio en el propio dispositivo (edge) sin GPU dedicada.

El repositorio contiene dos artefactos de pesos: el modelo de lenguaje en BF16 GGUF (3,2 GB) y el codificador de audio en Q8_0 GGUF (339 MB), que se descomprime a BF16 en tiempo de carga mientras el modelo de lenguaje se convierte a MXFP8 para ejecutarse en la NPU. La relevancia actual reside en que demuestra ASR de un modelo de 1.700 millones de parametros funcionando de extremo a extremo en hardware de borde con factores de tiempo real (RTF) entre 0,04 y 0,17, lo que habilita transcripcion local con baja latencia y sin depender de la nube.

El modelo base Qwen3-ASR-1.7B es un modelo multimodal audio-texto de la familia Qwen3, orientado a transcripcion de voz y comprension de audio, con una ventana de contexto de hasta 4096 tokens en esta implementacion concreta. La ficha se centra en la distribucion para AX8860, ya que la informacion disponible sobre el modelo base es limitada en esta fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal audio-texto (codificador de audio + modelo de lenguaje transformer); inferencia mediante llama.cpp con backend ggml-axera |
| Parametros totales | 1.720.574.976 (1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 4096 tokens (`-c` maximo 4096) |
| Tipos de cuantizacion | Pesos publicados: BF16 GGUF (modelo de lenguaje) y Q8_0 GGUF (codificador de audio); en carga se convierten a MXFP8 (lenguaje) y BF16 (audio) para la NPU |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (`qwen3-asr-1.7b-bf16.gguf`, `mmproj-qwen3-asr-1.7b-q8_0.gguf`) + kernels NPU precompilados |
| Modelo base | Qwen/Qwen3-ASR-1.7B |
| Tamano del repositorio | 3,9 GB |
| Hardware objetivo | Axera AX8860, NPU de 4 nucleos, SDK V0.5.0 o superior |

## Arquitectura y entrenamiento

La distribucion empaqueta el modelo base Qwen3-ASR-1.7B, que combina un codificador de audio con un modelo de lenguaje de la familia Qwen3 para producir transcripciones a partir de senal de voz. En esta implementacion, el codificador de audio se ejecuta como un kernel NPU dedicado y el modelo de lenguaje se divide en dos kernels: uno para el prefill del texto y otro para la decodificacion, que incluye la cabeza de salida. Los kernels no contienen pesos: estos se cargan exclusivamente desde los ficheros GGUF y se convierten en el arranque (lenguaje a MXFP8, audio a BF16 desde el Q8_0 del mmproj), lo que anade aproximadamente 0,5 s de conversion la primera vez que se lanza una peticion.

El backend ggml-axera procede de una bifurcacion de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `feat/qwen3-whole`) y los kernels de `ZHEQIUSHUI/ax-dsl-kernels`, con modulos especificos para `qwen3` y `qwen3_asr`. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en el modelo base. La innovacion tecnica destacable es la ejecucion integra del pipeline ASR (audio + prefill + decode) sobre la NPU de un SoC de borde, con binarios estaticos que solo dependen de `/opt/lib` y libc.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) sobre ficheros WAV.
- Procesamiento multimodal audio-texto: acepta entradas de audio mediante `{"type":"input_audio","input_audio":{"format":"wav","data":""}}` en peticiones `/v1/chat/completions`.
- Servicio compatible con la API de OpenAI (endpoint `/v1/chat/completions`) a traves de `llama-server`.
- Ejecucion en el dispositivo (edge) sobre NPU, sin GPU dedicada ni conexion a la nube.
- Transcripcion de grabaciones cortas y largas en una sola secuencia (hasta 4096 tokens de contexto).
- Interfaz conversacional (tag `conversational` en HuggingFace), con plantilla de chat compatible con llama.cpp.
- No se dispone de informacion sobre soporte de tool calling, agentes, vision, audio en streaming o modo thinking en esta distribucion.

## Casos de uso

- Transcripcion local de reuniones y notas de voz: el modelo procesa grabaciones de hasta 60 s en 2,5 s (RTF 0,041) en la NPU del AX8860, lo que permite transcribir actas o notas de voz en el propio dispositivo sin enviar audio a servicios externos.
- Subtitulado y postproduccion de video en equipos de borde: con un RTF de 0,07-0,09 para clips de 7,3 s, se puede generar texto sincronizado para videos cortos en camaras o grabadores equipados con AX8860.
- Asistentes de voz embebidos en dispositivos IoT y electrodomesticos: el paquete incluye `llama-server` compatible con OpenAI, de modo que un dispositivo puede exponer un endpoint HTTP local de transcripcion consumido por el resto del firmware.
- Cumplimiento y privacidad en sectores regulados (sanidad, legal, banca): al ejecutarse integramente en la NPU local, el audio no abandona el dispositivo, lo que facilita el cumplimiento de requisitos de proteccion de datos.
- Transcripcion de llamadas de atencion al cliente en centralitas locales: el servidor acepta audio en base64 por peticion y devuelve la transcripcion, integrable en un pipeline de analitica de voz on-premise.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo real de conversaciones presenciales en un dispositivo portatil con AX8860, con latencia de decimas de segundo por segmento.
- Digitalizacion de archivos de audio historicos o entrevistas: el procesamiento por lotes en el dispositivo permite transcribir grandes volumenes sin coste por minuto de API en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (WER, MMLU, etc.) en la informacion disponible. La model card unicamente aporta metricas de rendimiento de inferencia en el AX8860 (SDK V0.5.1, NPU de 4 nucleos, modo servidor, extremo a extremo):

| Duracion del audio | Tiempo de proceso | RTF |
|---|---|---|
| 0,6 s | 0,10 s | 0,17 |
| 7,3 s | 0,53-0,64 s | 0,07-0,09 |
| 60 s | 2,5 s | 0,041 |

Notas: la primera peticion anade aproximadamente 0,5 s de conversion de pesos (una vez por arranque). En cuanto a correccion, la model card indica que las transcripciones de las grabaciones de prueba son identicas a las de la implementacion NPU anterior, con 20 de 20 frases exactas en su conjunto de evaluacion.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de 4 nucleos; SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`).
- VRAM: no aplica (no se ejecuta en GPU); la memoria necesaria es la del propio SoC para alojar los pesos convertidos (modelo de lenguaje en MXFP8 y codificador de audio en BF16).
- Almacenamiento: aproximadamente 3,9 GB para el repositorio completo (3,2 GB del GGUF BF16 + 339 MB del mmproj Q8_0 + binarios y kernels).
- GPU recomendadas: no aplica; el paquete esta compilado exclusivamente para la NPU del AX8860.
- Compatibilidad con GPU de consumo: no; los kernels y binarios son especificos de la NPU Axera.
- Opciones de despliegue: `./run.sh speech.wav` para transcribir un fichero y `./run.sh -s 8080` para levantar un servidor compatible con OpenAI. Llamadas directas con `LD_LIBRARY_PATH=/opt/lib GGML_AXERA_KERNEL_DIR=<repo>/kernels`, `-ngl 99` y `-c` maximo 4096; en servidor, `-np 1`.
- Latencia y throughput: RTF de 0,041 a 0,17 segun duracion del audio (ver tabla de benchmarks); primera peticion con aproximadamente 0,5 s adicionales de conversion de pesos.
- Limitacion de recursos: el runtime ocupa los 4 nucleos de la NPU de forma exclusiva; no deben ejecutarse otros programas NPU en paralelo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo orientativo, se puede contrastar con el modelo base original y con la implementacion previa en NPU:

| Modelo / distribucion | Parametros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-AX8860-llama.cpp | 1,7 B | 4096 | GGUF (BF16 + Q8_0) + kernels NPU | NPU AX8860 (4 nucleos) | no disponible |
| Qwen/Qwen3-ASR-1.7B (modelo base) | 1,7 B | no disponible | safetensors (previsiblemente) | GPU/CPU generica | no disponible |
| Implementacion NPU anterior (mencionada en la model card) | 1,7 B | no disponible | no disponible | NPU AX8860 | no disponible |

## Limitaciones y advertencias

- Ejecucion exclusiva en la NPU del AX8860: los kernels y binarios no son portables a otras GPU o NPU; no se puede usar en CUDA, ROCm ni CPU convencional.
- El runtime ocupa los 4 nucleos de la NPU de forma exclusiva; no se pueden ejecutar otros programas NPU en paralelo.
- Una sola secuencia: el servidor debe arrancar con `-np 1`, lo que limita el throughput concurrente a una peticion a la vez.
- Contexto maximo de 4096 tokens, lo que acota la duracion de audio procesable en una sola peticion.
- Primera peticion penalizada con aproximadamente 0,5 s de conversion de pesos (una vez por arranque).
- Licencia no especificada en la informacion disponible: debe verificarse en el repositorio del modelo base (Qwen/Qwen3-ASR-1.7B) antes de cualquier uso comercial.
- Idiomas soportados no disponibles: no se puede confirmar la cobertura multilingue sin consultar el modelo base.
- Riesgo de alucinacion y errores de transcripcion inherentes a los modelos ASR: la model card solo valida 20 frases exactas frente a una implementacion previa, sin publicar WER sobre un conjunto de evaluacion amplio.
- Sesgos: no se dispone de informacion sobre sesgos conocidos en esta distribucion.
- Dependencia de version de SDK: requiere SDK V0.5.0 o superior; versiones anteriores pueden no ser compatibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AXERA-TECH/Qwen3-ASR-1.7B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Bifurcacion de llama.cpp: https://github.com/ZHEQIUSHUI/llama.cpp (rama `feat/qwen3-whole`, commit `4b67446`)
- Kernels NPU: https://github.com/ZHEQIUSHUI/ax-dsl-kernels (rama `main`, commit `60dd25b`)
