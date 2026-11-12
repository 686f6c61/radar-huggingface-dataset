# Retrieve0/Qwen3-ASR-0.6B-W4A16-Decoder

## Resumen

Qwen3-ASR-0.6B-W4A16-Decoder es una versión cuantizada a INT4 del decodificador de texto del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, publicado por el usuario Retrieve0. No se trata de un modelo independiente, sino de un componente del pipeline de transcripción: el decodificador de texto que consume las representaciones acústicas generadas por un encoder TensorRT separado. El modelo base es Qwen/Qwen3-ASR-0.6B-hf, desarrollado por el equipo Qwen de Alibaba.

La relevancia de esta ficha radica en su enfoque de despliegue: combina cuantización INT4 weight-only con kernels escritos a mano y un motor TensorRT para la fase de prefill, consiguiendo una latencia mediana de 72,2 ms por utterance en LibriSpeech test-clean sobre una RTX 4060 Laptop, frente a los 787,1 ms del modelo BF16 original. El coste en precisión es mínimo: un WER de corpus del 2,397 % frente al 2,321 % del BF16.

El repositorio contiene 782.426.112 parámetros en safetensors (1,6 GB) y se distribuye bajo licencia Apache 2.0. Es importante subrayar que no es un checkpoint AutoAWQ, GPTQ ni ExLlamaV3: solo el runtime del proyecto Qwen3-ASR-TensorRT puede consumir el layout INT4 empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decodificador de texto de Qwen3-ASR); cuantizacion INT4 weight-only con escalas FP16 |
| Parametros totales | 782.426.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 empaquetado (dos valores por byte en el eje de contraccion), simetrico, sin zero points, una escala FP16 por cada 32 valores; grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint FP16 con escalas plegadas; el runtime lo empaqueta a INT4 al construir el decoder) |

## Arquitectura y entrenamiento

El modelo es el decodificador de texto de un sistema ASR basado en Qwen3. La cuantizacion sigue el esquema AWQ (activation-aware weight quantization): se elige una escala por canal de entrada mediante busqueda en rejilla sobre el exponente AWQ y, a continuacion, un factor de recorte por grupo que minimiza el error de salida de la capa. Las escalas se pliegan en los pesos de normalizacion y proyeccion adyacentes, de modo que prefill y decode quedan numericamente consistentes sin escalado en tiempo de ejecucion.

La calibracion empleo 128 utterances de LibriSpeech train-clean-100, sin usar ninguna muestra de test-clean. El autor aclara explicitamente que la calibracion solo modifica las estadisticas de cuantizacion y no constituye un fine-tuning. La fase de decode se ejecuta con kernels INT4 escritos a mano, mientras que la fase de prefill se ejecuta como un motor TensorRT en FP16 (el autor recomienda no cuantizar el prefill porque no aporta velocidad y degrada la precision). No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) como parte del pipeline Qwen3-ASR junto al encoder TensorRT.
- Decodificacion de texto autorregresiva con kernels INT4 optimizados para baja latencia.
- Inferencia en GPUs NVIDIA mediante TensorRT 11.4 y CUDA.
- Compatibilidad con Windows (probado) y Linux (se espera que funcione con paquetes CUDA, TensorRT y PyTorch compatibles).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un componente ASR, no un modelo de proposito general.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Transcripcion de audio en tiempo casi real: con 72,2 ms de latencia mediana por utterance en una RTX 4060 Laptop, el decodificador es adecuado para subtitulado o dictado interactivo donde el coste por frame es critico.
- Despliegue en hardware de consumo: el modelo cuantizado permite ejecutar ASR de calidad cercana a BF16 en GPUs de gama media, reduciendo la barrera de entrada frente a servidores A100/H100.
- Procesamiento por lotes de corpus de audio: la combinacion de encoder TensorRT y decoder INT4 permite transcribir grandes volumenes de audio con menor coste energetico y mayor throughput que el modelo BF16.
- Integracion en pipelines de accesibilidad: generacion de subtitulos automaticos para video o reuniones en entornos Windows, plataforma probada por el autor.
- Prototipado de asistentes de voz: el bajo consumo de VRAM y la licencia Apache 2.0 facilitan experimentacion y despliegue comercial sin restricciones de licencia.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye metricas frente a EXL3 y GGUF INT4, lo que lo convierte en referencia para estudiar el compromiso precision/latencia en ASR.

## Benchmarks y rendimiento

Resultados sobre las 2.620 utterances de LibriSpeech test-clean, decodificacion greedy, RTX 4060 Laptop:

| Backend | WER de corpus | Latencia mediana |
|---|---:|---:|
| qwen-asr Transformers BF16 oficial | 2,321 % | 787,1 ms |
| EXL3 4 bpw, calibrado con train-clean-100 | 2,362 % | 99,8 ms |
| W4A16 AWQ, grupo 32 (este modelo) | 2,397 % | 72,2 ms |
| EXL3 4 bpw, legacy | 2,383 % | 99,5 ms |
| GGUF INT4 + Q4_K | 2,982 % | 299,2 ms |

El autor senala que una diferencia de 20 ediciones en este corpus equivale aproximadamente a 0,02 puntos de WER, por lo que los tres decodificadores cuantizados de 4 bits se sitúan en el mismo nivel de precision. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- GPU NVIDIA con CUDA y TensorRT 11.4; Windows probado, Linux esperado compatible.
- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 1,6 GB y los pesos INT4 empaquetados reducen sustancialmente el footprint frente al BF16, por lo que cabe en GPUs de consumo como la RTX 4060 Laptop empleada en las mediciones.
- GPU recomendadas: RTX 4060 Laptop (medido), asi como cualquier GPU NVIDIA consumer o profesional con soporte TensorRT 11.4.
- Despliegue: exclusivamente mediante el repositorio Qwen3-ASR-TensorRT, que construye los motores y ejecuta los kernels de decode. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida: 72,2 ms medianos por utterance en test-clean; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | WER test-clean | Latencia mediana | Licencia | Runtime |
|---|---|---:|---:|---:|---|---|
| Qwen3-ASR-0.6B-W4A16-Decoder | 782 M | INT4 AWQ grupo 32 | 2,397 % | 72,2 ms | Apache 2.0 | TensorRT propio |
| Qwen3-ASR-0.6B BF16 | 782 M | BF16 | 2,321 % | 787,1 ms | Apache 2.0 | Transformers |
| EXL3 4 bpw (calibrado) | 782 M | EXL3 4 bpw | 2,362 % | 99,8 ms | Apache 2.0 | ExLlamaV3 |
| GGUF INT4 + Q4_K | 782 M | GGUF Q4_K | 2,982 % | 299,2 ms | Apache 2.0 | llama.cpp |

Las cifras corresponden a las mediciones publicadas por el autor sobre el mismo corpus y hardware. No se dispone de comparaciones con otros modelos ASR de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint AutoAWQ, GPTQ ni ExLlamaV3: transformers, vLLM y otros runtimes no pueden cargarlo como modelo cuantizado; solo el runtime de Qwen3-ASR-TensorRT consume el layout INT4.
- Cargar el repositorio con transformers estandar reproduce el modelo base, no la version cuantizada.
- Requiere un encoder TensorRT compatible publicado por separado; el decoder no funciona de forma aislada.
- Dependencia estricta de TensorRT 11.4 y CUDA; no hay soporte para CPU ni para GPUs no NVIDIA.
- La fase de prefill debe construirse en FP16; cuantizarla degrada la precision sin ganar velocidad.
- Ligero incremento de WER respecto al BF16 (2,397 % frente a 2,321 %), aceptable segun el autor pero relevante en aplicaciones con requisitos estrictos de transcripcion.
- Sesgos conocidos y riesgo de alucinacion: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento multilingue del modelo base antes de usarlo en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Retrieve0/Qwen3-ASR-0.6B-W4A16-Decoder
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Encoder TensorRT compatible: https://huggingface.co/Retrieve0/Qwen3-ASR-0.6B-TensorRT-Encoder
- Repositorio del runtime: https://github.com/lost0427/Qwen3-ASR-TensorRT
