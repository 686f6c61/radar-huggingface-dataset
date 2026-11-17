# smajji/qwen3-asr-0.6b-trt-edge-llm-jetson

## Resumen

Qwen3-ASR-0.6B es un modelo de reconocimiento automático del habla (ASR) de la familia Qwen3, desarrollado originalmente por Alibaba Qwen. Este repositorio concreto, publicado por el usuario `smajji`, no contiene los pesos originales en formato estándar, sino un conjunto de artefactos de despliegue compilados para ejecutar el modelo en una placa NVIDIA Jetson Orin (arquitectura aarch64, sm_87) mediante el runtime TensorRT Edge-LLM 0.7.1. El objetivo es permitir la inferencia de ASR en el borde (edge computing) con latencias reducidas y un consumo de memoria contenido.

El paquete incluye motores TensorRT en FP16 e INT4 (W4A16 AWQ, grupo 128, con `lm_head` en FP16), exportaciones ONNX en formato 0.7.1, binarios aarch64 precompilados (CLI, servidor TCP de ASR y servidor de streaming de voz) y el código fuente completo del wrapper `ai.core.asr`. Se trata, por tanto, de un artefacto de ingeniería de despliegue más que de un modelo entrenado desde cero: el modelo subyacente es Qwen3-ASR-0.6B, con aproximadamente 0.6 mil millones de parámetros.

La relevancia de este repositorio radica en que documenta una receta reproducible de cuantización y compilación para Jetson, con métricas concretas de memoria y latencia (por ejemplo, el motor INT4 ocupa 549 MB frente a 1,21 GB del FP16, y la decodificación INT4 ronda los 130 ms frente a 229 ms en FP16). No obstante, la información pública disponible sobre el modelo base (licencia, idiomas, contexto, benchmarks) es muy limitada en esta ficha, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo ASR basado en transformer con encoder de audio y LLM decodificador (familia Qwen3-ASR); en este repo se despliega mediante TensorRT Edge-LLM 0.7.1 (FMHA clásica no DSL + XQA) |
| Parametros totales | 0.6 mil millones (según el nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible para el modelo base; en los motores `kv1024` se configura `--maxInputLen 896 --maxKVCacheCapacity 1024` (aprox. 65 s de audio por utterance) |
| Tipos de cuantizacion | FP16; INT4 W4A16 AWQ (grupo 128, `lm_head` en FP16); embedding FP8 (E4M3) en las variantes `kv1024`; exportaciones ONNX FP16 e INT4 |
| Idiomas soportados | no disponible en la información proporcionada; el ejemplo de validación produce una etiqueta `"language English"` |
| Licencia | no disponible |
| Formato de pesos | Motores TensorRT (`.engine`), ONNX, `safetensors` (embedding), binarios aarch64 |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-ASR-0.6B, es un sistema de reconocimiento de voz que combina un encoder de audio con un decodificador de tipo LLM. En este repositorio, el encoder de audio se compila como un motor TensorRT independiente (ubicado en `engines-071/audio/audio/`, con anidamiento de directorios) y el decodificador LLM como otro motor (`engines-071/llm/`). El wrapper `ai.core.asr` calcula el log-mel estilo Whisper en CPU y lo entrega al runner de audio mediante un fichero `.safetensors` FP16 por petición, alojado en `$TMPDIR` o `/dev/shm`.

La innovación técnica principal de este artefacto no está en el entrenamiento, sino en el despliegue: se utiliza el runtime TensorRT Edge-LLM 0.7.1 con FMHA clásica (no DSL) y XQA, con cubins sm_87 precompilados. Se ofrecen dos recetas de cuantización INT4: una basada en pesos `vrfai/Qwen3-ASR-0.6B-int4-QAD` (destilados + AWQ) y otra generada con ModelOpt `int4_awq` sobre el checkpoint base. Las variantes `kv1024` reducen la caché KV de 470 MB a 117 MB y aplican embedding FP8 (de 311 MB a 156 MB, con dequantización en tiempo de ejecución). No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) a partir de audio de entrada, con salida de transcripción textual.
- Etiquetado de idioma en la salida (el ejemplo muestra el prefijo `"language English"` como convención del modelo).
- Procesamiento de audio por utterance con ventanas de hasta aproximadamente 65 segundos en las variantes `kv1024`.
- Despliegue en modo CLI standalone (`qwen3_asr_trt`).
- Servidor TCP de ASR (`android_asr_server`) con protocolo PCM int16 a 16 kHz, orientado a integración con clientes Android.
- Servidor de streaming de voz (`voice_streaming`) con carga de modelo por socket (`set_model_qwen3asr <engine-root>`).
- Ejecución en dispositivos de borde aarch64 (Jetson Orin) con motores FP16 e INT4.
- No se dispone de información sobre tool calling, capacidades de agente, visión, audio generativo ni modo thinking en la documentación proporcionada.

## Casos de uso

- Transcripción en tiempo real en dispositivos de borde: el servidor `voice_streaming` permite enviar audio por socket y recibir transcripciones, adecuado para asistentes de voz locales sin conexión a la nube gracias al bajo consumo de memoria (aprox. 1,4 GB en la variante INT4 `kv1024`).
- Integración en aplicaciones Android: el servidor `android_asr_server` expone un protocolo PCM int16 a 16 kHz en un puerto TCP (por ejemplo, 9092), lo que facilita conectar apps móviles a un Jetson local como backend de dictado.
- Subtitulado y actas de reuniones en local: con ventanas de unos 65 segundos por utterance en las variantes `kv1024`, se pueden transcribir intervenciones cortas de forma secuencial sin salir del dispositivo.
- Procesamiento por lotes de ficheros de audio: el CLI `qwen3_asr_trt --engine-dir <motor>` permite transcribir ficheros WAV individuales de forma scriptable, útil para pipelines de archivado o indexación de audio.
- Despliegue en robótica y sistemas embebidos: al ejecutarse sobre Jetson Orin con TensorRT y consumir alrededor de 1,4 GB en INT4, encaja en plataformas con recursos limitados que necesitan interfaz de voz.
- Evaluación y prototipado de cuantización: el repositorio incluye las recetas (`code/docs/int4-run.md`, `code/PROGRESS.md`) y las exportaciones ONNX, lo que permite reproducir y comparar FP16 frente a INT4 en el mismo hardware.
- Sistemas de accesibilidad: transcripción local de voz a texto para personas con dificultades auditivas o para control por voz en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER) en la información disponible. Los únicos datos de rendimiento proporcionados son medidas de despliegue en Jetson Orin:

| Metrica | FP16 | INT4 (vanilla/QAD) |
|---|---|---|
| Tamano del motor LLM | 1,21 GB | 549 MB |
| RSS pico | 1,78 GB | 1,13 GB (−37%) |
| Latencia de decodificacion (test0.wav) | aprox. 229 ms | aprox. 130 ms |
| KV cache (`kv1024`) | no disponible | 470 MB → 117 MB |
| Embedding FP8 (`kv1024`) | no disponible | 311 MB → 156 MB |
| Memoria residente estimada (`kv1024`) | no disponible | aprox. 1,4 GB (frente a aprox. 2 GB en 4096/FP16) |

La transcripción de `test0.wav` es idéntica en FP16 y en ambas variantes INT4, según la model card.

## Requisitos de hardware

- Plataforma objetivo: NVIDIA Jetson Orin (sm_87), aarch64, CUDA 12.1 y TensorRT 10.13.
- VRAM/RAM estimada: aproximadamente 1,78 GB de RSS pico en FP16 y 1,13 GB en INT4; alrededor de 1,4 GB en las variantes `kv1024` (frente a unos 2 GB en la build 4096/FP16).
- GPU recomendadas: Jetson Orin (validado). No se documenta compatibilidad con A100, H100 ni RTX 4090; los motores están compilados para sm_87 y los cubins incluidos son específicos de esa arquitectura.
- ¿Cabe en GPU de consumo? No hay información sobre GPUs de consumo; el artefacto está orientado a Jetson Orin.
- Opciones de despliegue: TensorRT Edge-LLM 0.7.1 con plugin `libNvInfer_edgellm_plugin.so`; CLI `qwen3_asr_trt`; servidor TCP `android_asr_server`; servidor de streaming `voice_streaming`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: decodificación de aproximadamente 130 ms (INT4) y 229 ms (FP16) para el ejemplo de 6,6 s; no se proporcionan cifras de throughput agregado.
- Advertencia: no mezclar versiones; los motores y plugins 0.7.1 son incompatibles con artefactos TensorRT-Edge-LLM 0.10 o superiores.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa con alternativas como Whisper (OpenAI) o Parakeet (NVIDIA). La siguiente tabla recoge únicamente los datos disponibles de este artefacto frente a lo que se conoce de forma general de alternativas, marcando como no disponible lo que no se puede verificar:

| Modelo | Parametros | Contexto | Licencia | Despliegue en Jetson |
|---|---|---|---|---|
| Qwen3-ASR-0.6B (este repo) | 0,6 B | no disponible (KV 1024 en variante `kv1024`) | no disponible | Sí, motores TensorRT FP16/INT4 validados |
| Whisper (variantes small/medium) | no disponible en esta ficha | no disponible | no disponible | Posible vía TensorRT, no documentado aquí |
| Parakeet (NVIDIA) | no disponible en esta ficha | no disponible | no disponible | No documentado aquí |

No se han encontrado en la información proporcionada comparativas de rendimiento (WER, latencia) con modelos alternativos.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible; antes de un uso comercial es imprescindible verificar la licencia del modelo base Qwen3-ASR-0.6B y de los pesos INT4 de terceros (`vrfai/Qwen3-ASR-0.6B-int4-QAD`).
- Los artefactos están compilados específicamente para Jetson Orin (sm_87) con TensorRT 10.13 y CUDA 12.1; no son portables a otras GPUs sin recompilar.
- Los motores 0.7.1 son incompatibles con versiones 0.10+ de TensorRT-Edge-LLM; mezclar eras provoca fallos.
- El campo `input_tokens` del JSON standalone siempre vale `0`, por lo que no se puede contabilizar el consumo real de tokens de entrada.
- La ventana de audio en las variantes `kv1024` está limitada a unos 65 segundos por utterance (`maxInputLen 896`, `maxKVCacheCapacity 1024`); audios más largos requieren segmentación.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su autor no es el desarrollador original del modelo; se trata de un artefacto de terceros sin validación comunitaria amplia.
- El tamaño total del repositorio es de 10,9 GB, lo que implica requisitos de almacenamiento considerables en el dispositivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/smajji/qwen3-asr-0.6b-trt-edge-llm-jetson
- Modelo base referenciado en la model card: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Pesos INT4 QAD referenciados: https://huggingface.co/vrfai/Qwen3-ASR-0.6B-int4-QAD
- Documentación interna del repositorio: `code/docs/int4-run.md` y `code/PROGRESS.md` (incluidos en el propio repo)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
