# AXERA-TECH/Qwen3-ASR-1.7B-AX8860-llama.cpp

## Resumen

Qwen3-ASR-1.7B-AX8860-llama.cpp es una distribución empaquetada del modelo de reconocimiento automático de voz Qwen3-ASR-1.7B (desarrollado originalmente por el equipo Qwen de Alibaba) preparada por AXERA-TECH para ejecutarse sobre la NPU de cuatro núcleos del SoC Axera AX8860 mediante llama.cpp y el backend ggml-axera. No se trata de un modelo nuevo, sino de una conversión de pesos a GGUF (BF16 para el modelo de lenguaje y Q8_0 para el codificador de audio) acompañada de kernels NPU precompilados y binarios estáticos para el dispositivo.

El paquete resuelve un problema muy concreto: llevar un modelo de ASR de 1.720 millones de parámetros a hardware de borde (edge) con aceleración NPU, manteniendo una interfaz compatible con la API de OpenAI (`/v1/chat/completions`) y permitiendo tanto la transcripción de un fichero WAV como el despliegue como servidor local. La relevancia actual radica en la creciente demanda de transcripción en tiempo real en dispositivos sin GPU dedicada, donde el consumo energético y la latencia importan tanto como la precisión.

La arquitectura subyacente combina un codificador de audio (empaquetado en el `mmproj`) con un modelo de lenguaje Qwen3 de ~1,7B parámetros, siguiendo el patrón multimodal típico de los modelos ASR basados en LLM. El contexto máximo configurado en esta implementación es de 4096 tokens y el rendimiento medido alcanza un RTF de 0,041 en grabaciones de 60 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio + LLM Qwen3 (transformer), ejecutado vía llama.cpp con backend ggml-axera sobre NPU |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (máximo configurado en esta implementación) |
| Tipos de cuantizacion | GGUF BF16 (modelo de lenguaje, 3,2 GB) y GGUF Q8_0 (codificador de audio, 339 MB); en carga se convierte a MXFP8 (LLM) y BF16 (audio) para los kernels NPU |
| Idiomas soportados | No disponible (la model card no detalla la cobertura lingüística) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tamano del repo | 4,1 GB |
| Modelo base | Qwen/Qwen3-ASR-1.7B |
| Hardware objetivo | Axera AX8860, NPU de 4 núcleos, SDK V0.5.0 o superior |
| Secuencias concurrentes | 1 (`-np 1` obligatorio en servidor) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B es un sistema de reconocimiento de voz que combina un codificador de audio con un modelo de lenguaje de la familia Qwen3. En esta distribución, el codificador de audio se empaqueta por separado en `mmproj-qwen3-asr-1.7b-q8_0.gguf` (339 MB) y el LLM en `qwen3-asr-1.7b-bf16.gguf` (3,2 GB). Los kernels NPU no contienen pesos: se cargan desde los GGUF y se convierten en tiempo de carga a MXFP8 para el modelo de lenguaje y BF16 para el codificador de audio, lo que reduce el espacio ocupado en disco a costa de ~0,5 s de conversión en el primer arranque.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO. Tampoco se especifica la innovación arquitectónica del codificador de audio más allá de su integración con el LLM. La contribución técnica de esta ficha es, por tanto, la capa de despliegue: kernels específicos para audio encoder, prefill de texto y decode de texto (incluida la cabeza de salida), más binarios estáticos `llama-mtmd-cli` y `llama-server` que solo dependen de `/opt/lib` y libc del sistema. El código procede del fork `ZHEQIUSHUI/llama.cpp` (rama `axera-dev`, commit `6613735ce`), con módulos `ggml/src/ggml-axera/models/qwen3` y `qwen3_asr`.

## Capacidades

- Reconocimiento automático de voz (ASR) a partir de audio en formato WAV, con transcripción a texto.
- Entrada de audio codificada en base64 dentro de peticiones `/v1/chat/completions` con el tipo `input_audio`.
- Ejecución como CLI (`llama-mtmd-cli`) para transcribir un único fichero o como servidor compatible con la API de OpenAI (`llama-server`).
- Procesamiento de grabaciones cortas y largas: la model card reporta latencias para audios de 0,6 s, 7,3 s y 60 s.
- Aceleración por NPU con `-ngl 99` (todas las capas descargadas a la NPU).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni modo thinking en la información proporcionada.
- No se documenta cobertura multilingüe específica.

## Casos de uso

- Transcripción en tiempo real en dispositivos de borde: con un RTF de 0,041 en audios de 60 s, el modelo procesa una hora de audio en aproximadamente 2,5 minutos sobre la NPU del AX8860, lo que lo hace apto para grabadoras inteligentes, cámaras IP o asistentes de voz embebidos.
- Servicio de subtitulado local: el servidor compatible con OpenAI permite integrar la transcripción en aplicaciones existentes que ya consumen la API de chat, sin cambios en el cliente.
- Actas y notas de reuniones: la ventana de 4096 tokens y la capacidad de procesar grabaciones de decenas de segundos por petición permiten transcribir reuniones por segmentos en un equipo de bajo consumo.
- Transcripción de audio en entornos sin conectividad: al ejecutarse íntegramente en el SoC, no requiere enviar audio a la nube, lo que resulta adecuado para entornos sanitarios, industriales o de defensa con requisitos de privacidad.
- Automatización de centros de llamadas en el propio dispositivo: el modo servidor con `-np 1` permite atender una secuencia a la vez, útil en terminales telefónicas o pasarelas SIP que transcriben la conversación antes de enviar el texto.
- Indexación y búsqueda de archivos de audio: la baja latencia por minuto de audio permite procesar por lotes archivos históricos de entrevistas, podcasts o grabaciones de vigilancia y generar transcripciones indexables.
- Prototipado de pipelines ASR en hardware Axera: los binarios estáticos y el `run.sh` permiten validar el modelo en la placa antes de invertir en infraestructura GPU.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER sobre LibriSpeech u otros). Sí incluye medidas de rendimiento end-to-end en modo servidor sobre la NPU de 4 núcleos del AX8860 con SDK V0.5.1:

| Duracion del audio | Tiempo de proceso | RTF |
|---|---|---|
| 0,6 s | 0,10 s | 0,17 |
| 7,3 s | 0,53–0,64 s | 0,07–0,09 |
| 60 s | 2,5 s | 0,041 |

El primer arranque añade ~0,5 s de conversión de pesos (una vez por inicio). En cuanto a corrección, la model card afirma que las transcripciones son idénticas a las de la implementación NPU anterior, con 20 de 20 frases exactas sobre su conjunto de evaluación. No se han publicado resultados de benchmarks estándar de ASR (WER) en la información disponible.

## Requisitos de hardware

- SoC objetivo: Axera AX8860 con NPU de 4 núcleos; SDK V0.5.0 o superior (probado con V0.5.1).
- Memoria: el repo ocupa 4,1 GB; los pesos en disco son 3,2 GB (LLM BF16) + 339 MB (audio Q8_0). No se especifica la RAM del sistema necesaria, pero debe acomodar ambos GGUF y los kernels convertidos.
- GPU: no aplica; el modelo está empaquetado para NPU, no para CUDA. No se documenta ejecución en A100, H100 ni RTX 4090.
- Consumer GPU: no disponible para esta distribución; requeriría reconstruir los pesos GGUF con llama.cpp estándar, extremo no documentado en la model card.
- Despliegue: `llama-mtmd-cli` y `llama-server` estáticos incluidos en `bin/`; variables `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`; flags `-ngl 99`, `-c` máximo 4096, `-np 1` en servidor.
- Latencia y throughput: RTF entre 0,041 y 0,17 según duración del audio; una sola secuencia concurrente.
- Restricción de recursos: la ejecución ocupa los 4 núcleos NPU en exclusiva; no deben ejecutarse otros programas NPU en paralelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-AX8860-llama.cpp (esta ficha) | 1,72B | 4096 | NPU Axera AX8860 | No disponible | GGUF + kernels NPU |
| Qwen/Qwen3-ASR-1.7B (modelo base) | 1,72B | No disponible | GPU/CPU genérica | No disponible | Safetensors |
| Whisper large-v3 (referencia de la categoría) | ~1,55B | 448 tokens de audio (30 s) | GPU/CPU | MIT | Safetensors, GGUF, etc. |
| Whisper small (referencia de borde) | ~244M | 448 tokens de audio (30 s) | CPU/NPU de baja potencia | MIT | Safetensors, GGUF |

La comparación con Whisper se ofrece como referencia de categoría, no como equivalencia directa: Whisper es un encoder-decoder específico de ASR, mientras que Qwen3-ASR-1.7B sigue el patrón LLM + codificador de audio. No se dispone de datos de WER comparativos en la información proporcionada, por lo que no es posible establecer una comparación de calidad objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; los modelos ASR basados en LLM pueden generar texto plausible en segmentos con ruido o silencio, pero no se aportan tasas de error.
- Restricción de concurrencia: el servidor debe ejecutarse con `-np 1`; no soporta peticiones paralelas.
- Contexto limitado a 4096 tokens, lo que acota la duración máxima de audio procesable por petición.
- Exclusividad de la NPU: consume los 4 núcleos del AX8860; no puede convivir con otras cargas NPU.
- Dependencia de hardware y SDK: requiere SDK V0.5.0 o superior y el SoC AX8860; no es portable a otras plataformas sin recompilar kernels.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse con el autor o con la licencia del modelo base Qwen3-ASR-1.7B antes de desplegar en producción.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe.
- Cobertura de evaluación reducida: la validación de correctitud se limita a 20 frases de un conjunto interno, sin WER público.
- El primer arranque añade ~0,5 s por conversión de pesos; en escenarios de arranque frecuente esto puede afectar a la latencia percibida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-ASR-1.7B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Fork de llama.cpp utilizado: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`)
- Axera (fabricante del SoC AX8860): https://www.axera-tech.com
