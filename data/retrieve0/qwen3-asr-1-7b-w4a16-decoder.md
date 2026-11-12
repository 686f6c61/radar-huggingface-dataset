# Retrieve0/Qwen3-ASR-1.7B-W4A16-Decoder

## Resumen

Qwen3-ASR-1.7B-W4A16-Decoder es una versión cuantizada a INT4 del decodificador de texto del modelo de reconocimiento automático de voz Qwen3-ASR-1.7B, publicado por Qwen (Alibaba). El autor de esta conversión es el usuario Retrieve0, que la ha preparado específicamente para su uso con motores TensorRT dentro del proyecto Qwen3-ASR-TensorRT. No se trata de un modelo autónomo, sino de una pieza de un pipeline ASR completo que debe combinarse con un encoder TensorRT compatible.

El modelo base resuelve la transcripción de audio a texto. Esta variante aplica cuantización de solo pesos (weight-only) en formato INT4 con escalas FP16 por grupo de 32 valores, simétricas y sin puntos cero, con el objetivo de reducir el uso de memoria y acelerar la fase de decodificación sobre GPUs NVIDIA consumer. Según las mediciones del autor en una RTX 4060 Laptop, el decodificador es 4,48 veces más rápido que el backend oficial en BF16 con una degradación de WER de solo 0,117 puntos porcentuales sobre LibriSpeech test-clean.

Es relevante ahora porque demuestra que es posible ejecutar ASR de calidad cercana al estado del arte en hardware de gama media mediante kernels INT4 personalizados y TensorRT, aunque a costa de un formato de pesos propietario que no es compatible con transformers, vLLM ni llama.cpp. El repositorio ocupa 4,1 GB e incluye el checkpoint FP16 con escalas plegadas, que el runtime empaqueta a INT4 al construir el decodificador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (decodificador de texto de Qwen3-ASR), cuantizado INT4 weight-only con kernels propios |
| Parámetros totales | 2.038.052.480 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 simétrico, dos valores por byte, una escala FP16 por cada 32 pesos, sin puntos cero; calibración AWQ (group 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint FP16 con escalas plegadas, empaquetado a INT4 en tiempo de construcción del motor) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B es un sistema ASR compuesto por un encoder de audio y un decodificador de texto basado en la familia Qwen3. Esta ficha corresponde únicamente al decodificador, cuyos pesos se han cuantizado a INT4 con una técnica de cuantización consciente de activaciones en el sentido de AWQ: se elige una escala por canal de entrada mediante búsqueda en rejilla sobre el exponente AWQ y, después, un factor de recorte por grupo que minimiza el error de salida de cada capa. Las escalas se pliegan en los pesos de normalización y proyección adyacentes.

La calibración utilizó 128 utterances de LibriSpeech `train-clean-100`, sin usar ninguna muestra de `test-clean`, lo que evita fuga de datos en la evaluación. El autor subraya que la calibración solo modifica estadísticas de cuantización y no constituye un fine-tuning. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicó RLHF o DPO. La innovación técnica principal es el runtime de decodificación con kernels INT4 escritos a mano y la integración con TensorRT 11.4 para el encoder y el prefill.

## Capacidades

- Reconocimiento automático de voz (transcripción de audio a texto) mediante el pipeline completo Qwen3-ASR con encoder y decodificador.
- Decodificación greedy optimizada para latencia baja en GPUs consumer.
- Cuantización INT4 con kernels propios que reducen el uso de memoria del decodificador.
- Integración con TensorRT para encoder y prefill (se recomienda construir el prefill en INT4).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un decodificador ASR, no un modelo de propósito general.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No incluye modo thinking, visión ni audio directo; el audio lo procesa el encoder asociado.

## Casos de uso

- Transcripción en tiempo casi real en portátiles con GPU: con una RTX 4060 Laptop y el decodificador INT4, la latencia mediana es de 192,7 ms por utterance en LibriSpeech test-clean, lo que permite subtitulado o dictado interactivo en hardware de gama media.
- Servicios de transcripción de bajo coste en producción: al ser 4,48 veces más rápido que el backend oficial BF16, reduce el coste por hora de audio procesado en GPUs consumer o en instancias con GPUs de gama baja.
- Procesamiento por lotes de archivos de audio: el pipeline TensorRT con prefill INT4 permite encadenar la codificación y decodificación de múltiples utterances manteniendo el uso de VRAM por debajo de los 8 GB.
- Integración en aplicaciones de escritorio con GPU NVIDIA: el runtime del repositorio Qwen3-ASR-TensorRT construye los motores y ejecuta los kernels, lo que facilita empaquetar un transcriptor local sin depender de servicios en la nube.
- Evaluación de técnicas de cuantización: sirve como referencia para comparar WER y latencia entre INT4 AWQ, EXL3 4 bpw y GGUF INT4 sobre el mismo corpus y hardware.
- Investigación en ASR eficiente: permite estudiar el compromiso entre precisión (WER) y velocidad en decodificadores cuantizados, con una degradación medida de 0,117 puntos porcentuales frente al BF16 oficial.
- Despliegue en entornos con restricciones de memoria: el uso de un prefill INT4 evita el paginado de pesos de TensorRT que degrada el prefill de 24 ms a 650 ms en tarjetas de 8 GB.

## Benchmarks y rendimiento

Mediciones del autor sobre las 2.620 utterances de LibriSpeech `test-clean`, decodificación greedy, en una RTX 4060 Laptop:

| Backend | WER del corpus | Latencia mediana |
|---|---:|---:|
| Official `qwen-asr` Transformers BF16 | 1,886 % | 863,5 ms |
| EXL3 4 bpw, train-clean-100 | 1,944 % | 208,1 ms |
| EXL3 4 bpw, legacy | 1,984 % | 208,8 ms |
| **W4A16 AWQ, group 32** | **2,003 %** | **192,7 ms** |
| GGUF INT4 + Q4_K | 2,090 % | 391,8 ms |

El decodificador W4A16 es 1,08 veces más rápido que los dos decodificadores EXL3 4 bpw, 2,03 veces más rápido que GGUF y 4,48 veces más rápido que el backend oficial. Su WER es 0,019 puntos superior al EXL3 legacy y 0,059 puntos superior al EXL3 calibrado; según el autor, 20 ediciones en este corpus equivalen aproximadamente a 0,02 puntos.

## Requisitos de hardware

- GPU NVIDIA con CUDA y TensorRT 11.4; no funciona en CPU ni en GPUs AMD.
- VRAM estimada para inferencia: el repositorio ocupa 4,1 GB; en una tarjeta de 8 GB el prefill FP16 (3,3 GB) deja poco margen y provoca paginado de pesos, por lo que se recomienda prefill INT4.
- GPUs recomendadas: RTX 4060 Laptop (medición del autor); cualquier GPU NVIDIA con al menos 8 GB de VRAM para el pipeline completo.
- Cabe en GPUs consumer: sí, con al menos 8 GB de VRAM y usando prefill INT4.
- Opciones de despliegue: exclusivamente el runtime del repositorio Qwen3-ASR-TensorRT; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia mediana de 192,7 ms por utterance en LibriSpeech test-clean con RTX 4060 Laptop; prefill de aproximadamente 24 ms con motor INT4.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | WER (LibriSpeech test-clean) | Latencia mediana | Licencia | Runtime |
|---|---|---:|---:|---:|---|---|
| Qwen3-ASR-1.7B-W4A16-Decoder | 2,04 B | INT4 AWQ group 32 | 2,003 % | 192,7 ms | Apache 2.0 | TensorRT propio |
| EXL3 4 bpw (train-clean-100) | no disponible | 4 bpw | 1,944 % | 208,1 ms | no disponible | ExLlamaV3 |
| EXL3 4 bpw (legacy) | no disponible | 4 bpw | 1,984 % | 208,8 ms | no disponible | ExLlamaV3 |
| GGUF INT4 + Q4_K | no disponible | INT4 Q4_K | 2,090 % | 391,8 ms | no disponible | llama.cpp |
| Qwen3-ASR-1.7B BF16 oficial | 2,04 B | BF16 | 1,886 % | 863,5 ms | Apache 2.0 | transformers |

La comparativa se limita a las variantes medidas por el autor sobre el mismo corpus y hardware; no se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint AutoAWQ, GPTQ ni ExLlamaV3: transformers, vLLM y otros runtimes no pueden cargarlo como modelo cuantizado; solo el runtime del proyecto consume el layout INT4.
- Cargar el repositorio con transformers reproduce el modelo base en FP16, no la versión cuantizada.
- Requiere GPU NVIDIA, CUDA y TensorRT 11.4; no hay soporte para CPU, AMD ni Apple Silicon.
- El WER es ligeramente superior al del modelo base BF16 (2,003 % frente a 1,886 % en LibriSpeech test-clean).
- En tarjetas de 8 GB, usar prefill FP16 degrada el prefill de 24 ms a 650 ms por paginado de pesos de TensorRT.
- La calibración se hizo solo con LibriSpeech train-clean-100, por lo que el comportamiento en otros dominios, idiomas o condiciones acústicas no está validado en la información disponible.
- No se han publicado datos sobre sesgos, alucinaciones ni cobertura multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el runtime y los kernels propios deben evaluarse por separado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Retrieve0/Qwen3-ASR-1.7B-W4A16-Decoder
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Encoder TensorRT compatible: https://huggingface.co/Retrieve0/Qwen3-ASR-1.7B-TensorRT-Encoder
- Repositorio del runtime: https://github.com/lost0427/Qwen3-ASR-TensorRT
