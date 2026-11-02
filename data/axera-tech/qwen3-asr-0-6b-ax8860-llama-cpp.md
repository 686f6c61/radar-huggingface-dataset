# AXERA-TECH/Qwen3-ASR-0.6B-AX8860-llama.cpp

## Resumen

Qwen3-ASR-0.6B-AX8860-llama.cpp es una implementación optimizada para hardware específico del modelo de reconocimiento automático de voz (ASR) Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. Esta variante, publicada por AXERA-TECH, empaqueta los pesos en formato GGUF junto con kernels compilados para la NPU de cuatro núcleos del SoC Axera AX8860, permitiendo ejecutar la transcripción de audio directamente en el acelerador neuronal del dispositivo en lugar de en la CPU.

El modelo resuelve el problema de desplegar ASR de calidad en entornos de borde (edge computing) con recursos limitados, donde no es viable ejecutar un modelo de voz en GPU. Con 596 millones de parámetros, el modelo base es lo bastante compacto para caber en memoria de un SoC, y esta versión demuestra latencias de tiempo real muy bajas: un factor RTF de 0,028 para una grabación de 60 segundos (1,7 s de procesamiento).

La relevancia de esta ficha radica en que no es un modelo nuevo entrenado desde cero, sino un artefacto de despliegue que combina pesos cuantizados (BF16 para el LM, Q8_0 para el codificador de audio) con kernels NPU propietarios y binarios estáticos de llama.cpp. Está pensado para integradores que trabajan con el AX8860 y necesitan transcripción local, sin conexión y de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo ASR multimodal: codificador de audio + modelo de lenguaje (base Qwen3-ASR-0.6B); ejecución sobre llama.cpp con backend ggml-axera |
| Parametros totales | 596.049.920 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (máximo configurado en llama.cpp para esta implementación) |
| Tipos de cuantizacion | LM en BF16 (GGUF); codificador de audio en Q8_0 (GGUF); en carga se convierte a MXFP8 (LM) y BF16 (audio) para los kernels NPU |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3-asr-0.6b-bf16.gguf`, `mmproj-qwen3-asr-0.6b-q8_0.gguf`) + kernels NPU propietarios + binarios estáticos |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-ASR-0.6B, es un sistema de reconocimiento de voz que combina un codificador de audio con un modelo de lenguaje de la familia Qwen3. Esta variante no aporta entrenamiento nuevo: redistribuye los pesos del modelo base en dos ficheros GGUF separados, uno para el modelo de lenguaje (BF16, 1,1 GB) y otro para el codificador de audio (Q8_0, 204 MB), y los acompaña de kernels compilados para la NPU del AX8860.

La innovación técnica de esta publicación no está en el modelo sino en el runtime: se utiliza una bifurcación de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `feat/qwen3-whole`) con soporte para los modelos `qwen3` y `qwen3_asr` mediante el backend `ggml-axera`. Los kernels NPU (codificador de audio, prefill de texto y decode de texto con cabeza de salida) no contienen pesos; estos se convierten en tiempo de carga desde los GGUF (MXFP8 para el LM, BF16 para el audio, dequantizando desde Q8_0). No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automático de voz (transcripción de audio a texto) en formato WAV.
- Procesamiento de audio vía API compatible con OpenAI (`/v1/chat/completions`) con entrada `input_audio` en base64.
- Ejecución local en NPU sin conexión a red, con latencias de tiempo real (RTF de 0,028 a 0,12 según duración).
- Modo servidor (`llama-server`) y modo línea de comandos (`llama-mtmd-cli`) para transcribir un fichero directamente.
- Procesamiento de una única secuencia simultánea (sin batching concurrente).
- No se documentan capacidades de tool calling, agentes, visión ni modo de razonamiento explícito en la información disponible.
- Capacidades multilingües: no disponibles en la documentación proporcionada.

## Casos de uso

- Transcripción de reuniones y notas de voz en dispositivos empotrados: el modelo procesa una grabación de 60 segundos en 1,7 segundos sobre la NPU del AX8860, lo que permite integrarlo en grabadoras o asistentes de voz locales sin depender de la nube.
- Subtitulado en tiempo real de audio capturado por micrófono: con un RTF de 0,05–0,06 para clips de 7,3 segundos, el sistema puede mantener el ritmo de una conversación continua en un dispositivo de borde.
- Asistentes de voz para domótica o electrodomésticos: al ejecutarse íntegramente en el SoC, preserva la privacidad del audio y funciona sin conectividad, adecuado para comandos de voz locales.
- Servicio de transcripción en red local: el modo `llama-server` expone una API compatible con OpenAI, de modo que aplicaciones existentes pueden apuntar a `http://<dispositivo>:8080/v1/chat/completions` sin cambios en el cliente.
- Digitalización de entrevistas o dictáfonos en campo: el bajo consumo y la ejecución en NPU permiten transcribir in situ grabaciones de hasta 60 segundos o más (en fragmentos) sin infraestructura de servidor.
- Validación y prototipado de pipelines ASR en hardware Axera: sirve como referencia para comparar la implementación NPU con alternativas en CPU o GPU, ya que el autor reporta transcripciones idénticas a la implementación NPU anterior en un conjunto de 20 frases.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son medidas de latencia end-to-end en modo servidor sobre AX8860 (SDK V0.5.1, NPU de 4 núcleos):

| Duracion del audio | Tiempo de proceso | RTF |
|---|---|---|
| 0,6 s | 0,07 s | 0,12 |
| 7,3 s | 0,38–0,47 s | 0,05–0,06 |
| 60 s | 1,7 s | 0,028 |

La primera petición añade aproximadamente 0,4 s de conversión de pesos (una vez por arranque). En cuanto a precisión, el autor indica que las transcripciones son idénticas a las de la implementación NPU anterior, con 20 de 20 frases exactas en su conjunto de evaluación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER en LibriSpeech, etc.) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de 4 núcleos y SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`).
- VRAM/RAM: no se especifica el consumo de memoria; los pesos ocupan 1,1 GB (LM BF16) + 204 MB (codificador Q8_0), más el espacio de trabajo de los kernels.
- GPU: no aplica; la implementación está ligada a la NPU del AX8860 y no se documenta soporte para GPU convencionales (A100, H100, RTX 4090).
- Despliegue: binarios estáticos `llama-mtmd-cli` y `llama-server` incluidos en `bin/`, con dependencia únicamente de `/opt/lib` y libc. Variables necesarias: `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`; flags `-ngl 99` y `-c` máximo 4096; servidor con `-np 1`.
- Latencia y throughput: RTF de 0,028–0,12 según duración; procesamiento de una sola secuencia, sin concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue |
|---|---|---|---|---|
| Qwen3-ASR-0.6B-AX8860-llama.cpp (esta ficha) | 596 M | 4096 | no disponible | NPU Axera AX8860, llama.cpp + ggml-axera |
| Qwen3-ASR-0.6B (modelo base) | 596 M | no disponible | no disponible | GPU/CPU con frameworks estándar |
| Whisper small (referencia de categoria) | ~244 M | 448 tokens de audio | MIT (según versión) | CPU/GPU, whisper.cpp, etc. |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la comparativa se limita a parámetros y plataforma de despliegue.

## Limitaciones y advertencias

- Exclusividad de hardware: solo funciona en la NPU del AX8860; no es portable a otras plataformas sin recompilar kernels.
- Exclusividad de recursos: ocupa los 4 núcleos NPU durante la ejecución; no deben ejecutarse otros programas NPU en paralelo.
- Una sola secuencia: el servidor requiere `-np 1`; no soporta peticiones concurrentes.
- Contexto limitado a 4096 tokens, lo que restringe la duración de audio procesable por petición.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor o al modelo base.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación en ASR: como todo modelo generativo, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no vistos.
- Sesgos: no se documentan sesgos específicos; el modelo hereda los del modelo base Qwen3-ASR-0.6B.
- Dependencia de binarios y kernels propietarios: la reproducibilidad y auditoría del runtime están limitadas a las fuentes publicadas en los repositorios de GitHub del autor.

## Enlaces

- HuggingFace: https://huggingface.co/AXERA-TECH/Qwen3-ASR-0.6B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- llama.cpp (fork con soporte AXera): https://github.com/ZHEQIUSHUI/llama.cpp (rama `feat/qwen3-whole`, commit `4b67446`)
- Kernels NPU: https://github.com/ZHEQIUSHUI/ax-dsl-kernels (rama `main`, commit `60dd25b`)
