# Retrieve0/Qwen3-ASR-1.7B-W4A16-Decoder-INT4

## Resumen

Qwen3-ASR-1.7B-W4A16-Decoder-INT4 es una distribución de pesos del decodificador del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B-hf, publicada por el usuario Retrieve0. No se trata de un modelo nuevo ni de un fine-tune, sino de un empaquetado del checkpoint original con cuantización INT4 ya aplicada en disco (formato W4A16: pesos de 4 bits, activaciones de 16 bits) y con el layout de nibbles preempaquetado para ser consumido directamente por un runtime TensorRT específico.

El modelo base es un ASR de la familia Qwen3 con 1.225.278.464 parámetros reales en el checkpoint (etiquetado comercialmente como "1.7B"), que combina una torre de audio con un decodificador tipo transformer. Esta distribución contiene únicamente los pesos del decodificador: la torre de audio no está incluida y debe aportarse mediante el encoder TensorRT complementario del mismo autor.

Su relevancia es de ingeniería de despliegue: reduce el peso en disco de 3,81 GB (checkpoint FP16) a 1,50 GB sin alterar la salida, ya que los pesos empaquetados son idénticos a los que produce el runtime al cargar el checkpoint FP16. Está pensado exclusivamente para el repositorio Qwen3-ASR-TensorRT, no para `transformers`, vLLM ni llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (decodificador de Qwen3-ASR); la torre de audio se sirve aparte vía encoder TensorRT |
| Parametros totales | 1.225.278.464 (checkpoint del decodificador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | `--max-cache` 4096 en KV cache; `--max-seq` 512 en el prompt de build (unos 39 segundos de audio); el encoder admite hasta 3600 frames |
| Tipos de cuantizacion | INT4 preempaquetado (W4A16), grupo de 32, escala FP16 por grupo; `embed_tokens` y RMSNorm en FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` con layout propietario (`*.packed` + `*.scales`) y `packed_config.json`; no compatible con AutoAWQ, GPTQ, ExLlamaV3, GGUF ni safetensors estándar de `transformers` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-ASR-1.7B, un sistema de reconocimiento de habla con una torre de audio y un decodificador autorregresivo. Esta publicación contiene solo el decodificador, con cada proyección cuantizada a INT4: los pesos se almacenan como nibbles empaquetados (`*.packed`, dos valores por byte a lo largo del eje de contracción, nibble bajo primero) y una escala FP16 por cada 32 valores (`*.scales`, calculada como `max|w| / 7`). Las capas `embed_tokens` y los pesos de RMSNorm permanecen en FP16. El fichero `packed_config.json` documenta formato, tamaño de grupo y regla de cuantización.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica destacable no está en el entrenamiento sino en el empaquetado: los pesos en disco coinciden con los que genera el kernel del runtime al cargar el checkpoint FP16, por lo que las transcripciones son idénticas bit a bit y solo cambia el tamaño en disco (1,50 GB frente a 3,81 GB).

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en el pipeline `automatic-speech-recognition`.
- Inferencia acelerada con TensorRT 11.4 sobre GPU NVIDIA, con backend `tensorrt-w4a16`.
- Decodificación con KV cache configurable hasta 4096 posiciones, asignada por petición en pasos de 256 slots.
- Procesamiento de prompts de hasta 512 tokens (unos 39 segundos de audio) con la configuración de build por defecto.
- Compatibilidad con el encoder TensorRT del mismo autor, que amplía el límite de audio hasta 3600 frames.
- Salida de transcripción equivalente a la del checkpoint FP16 del mismo proyecto.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio más allá del ASR, ni comportamiento multilingüe explícito.

## Casos de uso

- Transcripción por lotes en servidor: el formato INT4 reduce el peso en disco a 1,50 GB, lo que permite almacenar y distribuir el checkpoint en entornos con cuotas de almacenamiento ajustadas, manteniendo la misma calidad de transcripción que el FP16.
- Servicio de subtitulado de baja latencia: con 175,0 ms de latencia medida en LibriSpeech `test-clean`, es adecuado para pipelines de subtitulado casi en tiempo real en GPU NVIDIA con TensorRT.
- Despliegue en infraestructura con memoria limitada: al ocupar menos en disco y usar pesos de 4 bits, encaja en nodos con VRAM moderada que no asumirían el checkpoint FP16 completo junto con el encoder.
- Evaluación de calidad ASR en investigación: el WER de 1,988% sobre las 2.620 utterances de LibriSpeech `test-clean` sirve como referencia reproducible para comparar variantes de cuantización o encoders.
- Integración en un pipeline TensorRT existente: si la organización ya opera el repositorio Qwen3-ASR-TensorRT, este checkpoint se carga directamente con `--backend tensorrt-w4a16` sin pasos de conversión adicionales.
- Archivado y versionado de modelos: al ser un artefacto determinista generado por el mismo kernel que el runtime, simplifica la reproducibilidad de despliegues al fijar exactamente los bytes que se sirven en producción.
- Prototipado de ASR en local con GPU consumer NVIDIA: el tamaño reducido del decodificador facilita pruebas en estaciones de trabajo, siempre que se cumplan los requisitos de CUDA y TensorRT.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| WER | 1,988% | LibriSpeech `test-clean`, 2.620 utterances |
| Latencia | 175,0 ms | LibriSpeech `test-clean` |
| Tamano en disco | 1,50 GB (frente a 3,81 GB del FP16) | Checkpoint del decodificador |

Los valores de WER y latencia son idénticos a los del checkpoint FP16 del mismo proyecto, según el autor. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de LLM, ya que el modelo es específico de ASR.

## Requisitos de hardware

- GPU NVIDIA con CUDA y TensorRT 11.4; el runtime no funciona sin TensorRT.
- VRAM estimada para inferencia: no disponible de forma explícita; el decodificador INT4 ocupa 1,50 GB en disco y requiere además el encoder TensorRT y la KV cache (hasta 4096 posiciones, asignadas en pasos de 256 slots).
- GPU recomendadas: no disponible en la información proporcionada; por el perfil de TensorRT y el tamaño, cabe esperar GPUs de centro de datos (A100, H100, L40S) y GPUs consumer NVIDIA recientes, pero no se confirma.
- Compatibilidad con GPU consumer: probable por tamaño, pero no confirmada por el autor.
- Opciones de despliegue: exclusivamente el repositorio Qwen3-ASR-TensorRT con backend `tensorrt-w4a16`; no es cargable por vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia medida: 175,0 ms sobre LibriSpeech `test-clean`. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Retrieve0/Qwen3-ASR-1.7B-W4A16-Decoder-INT4 | 1.225.278.464 (decodificador) | 512 tokens de prompt; KV cache 4096 | INT4 W4A16, grupo 32 | Apache 2.0 | safetensors empaquetado, solo TensorRT propio |
| Retrieve0/Qwen3-ASR-1.7B-W4A16-Decoder (FP16) | 1.225.278.464 (decodificador) | Igual | FP16 | Apache 2.0 | safetensors FP16, runtime propio |
| Qwen/Qwen3-ASR-1.7B-hf (base) | No disponible en la informacion | No disponible | Sin cuantizar | No disponible en la informacion | `transformers` y ecosistema estandar |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint estándar: `transformers`, vLLM y llama.cpp no pueden cargarlo como modelo cuantizado; solo el runtime del proyecto Qwen3-ASR-TensorRT entiende el layout.
- No contiene pesos FP16, por lo que no puede recuantizarse con otro tamaño de grupo; para ello hay que descargar el checkpoint FP16.
- El grupo de cuantización está fijado en 32; pasar otro valor con `--group` provoca un error.
- No incluye la torre de audio: requiere el encoder TensorRT complementario para transcribir.
- Dependencia fuerte de NVIDIA: exige GPU NVIDIA, CUDA y TensorRT 11.4, lo que excluye CPU, AMD y Apple Silicon.
- Límite de prompt de 512 tokens (unos 39 segundos de audio) con la configuración de build por defecto; el encoder tiene su propio techo de 3600 frames.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Sesgos conocidos y tasa de alucinación no documentados en la información disponible.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación comunitaria publicada.
- Licencia Apache 2.0 en el artefacto, pero conviene verificar la licencia del modelo base Qwen3-ASR antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/Retrieve0/Qwen3-ASR-1.7B-W4A16-Decoder-INT4
- Checkpoint FP16 del decodificador: https://huggingface.co/Retrieve0/Qwen3-ASR-1.7B-W4A16-Decoder
- Encoder TensorRT: https://huggingface.co/Retrieve0/Qwen3-ASR-1.7B-TensorRT-Encoder
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Repositorio del runtime: https://github.com/lost0427/Qwen3-ASR-TensorRT
