# amd/Qwen3-ASR-1.7B-hf-w8a8-llmcompressor

## Resumen

Qwen3-ASR-1.7B-hf-w8a8-llmcompressor es una versión cuantizada del modelo Qwen3-ASR-1.7B-hf, publicada por AMD. Se trata de un modelo multimodal de reconocimiento automático del habla (ASR) construido sobre la arquitectura Qwen3ASRForConditionalGeneration, que combina una torre de audio con un modelo de lenguaje de 28 capas. AMD ha aplicado cuantización W8A8 (pesos y activaciones en INT8) mediante LLM Compressor con el algoritmo Round-to-Nearest, orientada a inferencia en CPU sobre procesadores AMD EPYC con el stack ZenDNN.

El interés de esta ficha radica en que no es un modelo nuevo, sino una receta de despliegue eficiente: reduce el peso en disco de 3,8 GiB a 2,5 GiB (aproximadamente un 35 %) manteniendo una degradación de WER prácticamente nula en LibriSpeech, según los datos publicados por el autor. Es relevante para equipos que necesitan servir ASR en infraestructura CPU sin GPUs, con un stack de software concreto (vLLM 0.33.0, ZenDNN 6.2.0, ZenTorch 2.14.0.3, PyTorch 2.13.0+cpu).

El modelo base tiene 2.038.052.480 parámetros totales (≈2,04 B) y licencia Apache 2.0. La model card declara únicamente inglés como idioma soportado, y el pipeline_tag es text-generation, aunque la arquitectura y los benchmarks apuntan a transcripción de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ASRForConditionalGeneration (torre de audio + modelo de lenguaje transformer) |
| Parametros totales | 2.038.052.480 (≈2,04 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8 (pesos INT8 simétricos per-channel estáticos; activaciones INT8 simétricas per-token dinámicas); torre de audio, proyector multimodal, lm_head, embeddings y layer norms en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (repo de 2,7 GB; pesos en disco ≈2,5 GiB frente a 3,8 GiB en BF16) |

## Arquitectura y entrenamiento

La arquitectura es Qwen3ASRForConditionalGeneration: un modelo multimodal compuesto por una torre de audio (24 capas con atención y capas fully-connected) conectada mediante un proyector multimodal (multi_modal_projector, dos capas lineales) a un modelo de lenguaje de 28 capas. La cuantización W8A8 se aplica exclusivamente a las proyecciones lineales del modelo de lenguaje: q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj en las 28 capas. La torre de audio, el proyector multimodal, lm_head, embed_tokens y las layer norms se mantienen en BF16 porque la calibración de texto no cubre esos módulos.

El proceso de cuantización usa LLM Compressor v0.14.0 con el modificador QuantizationModifier (scheme W8A8, targets Linear) y Round-to-Nearest, que es data-free: no requiere conjunto de calibración. Los pesos se guardan en formato compressed-tensors con save_compressed=True. No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni sobre innovaciones técnicas adicionales más allá de la propia cuantización.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto), según la arquitectura y los benchmarks de WER en LibriSpeech.
- Procesamiento de entrada de audio mediante torre dedicada y proyector multimodal hacia el espacio del modelo de lenguaje.
- Generación de texto condicionada a la entrada de audio (pipeline declarado como text-generation).
- Capacidades multilingües: limitadas a inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio de salida: no disponible (la entrada es audio; la salida es texto).

## Casos de uso

- Transcripción por lotes en servidores CPU: el modelo está optimizado para AMD EPYC con ZenDNN y vLLM, lo que permite procesar colas de audio sin depender de GPUs; adecuado para pipelines de transcripción de archivos ya grabados.
- Servicio de subtitulado en entornos con infraestructura AMD: al ejecutarse en CPU con un stack validado (vLLM 0.33.0 + ZenTorch), encaja en despliegues donde no hay aceleradores disponibles.
- Reducción de huella de almacenamiento y memoria: con pesos INT8 de 2,5 GiB frente a 3,8 GiB en BF16, permite alojar más instancias por nodo o desplegar en máquinas con menos RAM.
- Evaluación comparativa de cuantización: sirve como referencia para medir el impacto de W8A8 en tareas ASR, ya que el autor publica WER frente al baseline BF16 en LibriSpeech.
- Prototipado de ASR en inglés sobre CPU: para equipos que quieren validar un pipeline de reconocimiento de voz sin aprovisionar GPUs, usando el ejemplo de vLLM de la model card.
- Integración en aplicaciones de dictado o toma de notas en inglés: la transcripción de audio a texto encaja en herramientas de productividad que operan en servidores CPU.

## Benchmarks y rendimiento

Resultados publicados por el autor (WER %, menor es mejor), comparando el modelo cuantizado con el baseline BF16:

| Benchmark | BF16 baseline (WER %) | W8A8 (este modelo) (WER %) | Δ WER |
|---|---|---|---|
| LibriSpeech dev_clean | 1,6625 | 1,6643 | +0,0018 |
| LibriSpeech dev_other | 3,0410 | 3,1128 | +0,0718 |
| LibriSpeech test_clean | 1,6822 | 1,6972 | +0,0150 |
| LibriSpeech test_other | 3,4568 | 3,4265 | -0,0303 |

La degradación es mínima: el mayor incremento de WER es de 0,0718 puntos en dev_other, y en test_other el modelo cuantizado mejora ligeramente. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible; el comando de evaluación incluido en la model card referencia la tarea gsm8k, pero no se aportan resultados de la misma.

## Requisitos de hardware

- VRAM: no aplica de forma directa; el modelo está orientado a inferencia en CPU. En disco ocupa ≈2,5 GiB (INT8) frente a 3,8 GiB del BF16.
- CPU recomendada: AMD EPYC, con stack ZenDNN v6.2.0 y ZenTorch v2.14.0.3.
- GPU: no se documenta soporte GPU específico; el stack declarado es PyTorch 2.13.0+cpu.
- ¿Cabe en consumer GPU? No disponible en la información proporcionada; el foco del autor es CPU.
- Despliegue: vLLM v0.33.0 como motor de inferencia; Transformers v5.17.0; LLM Compressor v0.14.0 para reproducir la cuantización. No se mencionan llama.cpp, Ollama ni TGI.
- Requisito de sistema: Linux como SO preferido y configuración de LD_PRELOAD con libomp.so o libiomp5.so antes de lanzar vLLM para un rendimiento óptimo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| amd/Qwen3-ASR-1.7B-hf-w8a8-llmcompressor | ≈2,04 B | no disponible | W8A8 INT8 | Apache 2.0 | ASR en CPU AMD EPYC |
| Qwen/Qwen3-ASR-1.7B-hf (base) | ≈2,04 B | no disponible | BF16 | Apache 2.0 | ASR, referencia sin cuantizar |
| Alternativas ASR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el modelo base: misma arquitectura y licencia, pero el cuantizado reduce el peso un 35 % con una variación de WER inferior a 0,08 puntos en los conjuntos evaluados. No se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; no hay evidencia de soporte multilingüe.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al ser un modelo derivado de Qwen3, hereda los sesgos del modelo base, que no se detallan.
- Alucinación: no se aportan datos sobre tasas de alucinación en transcripción; en ASR esto puede manifestarse como texto inventado en segmentos de audio ruidosos o silenciosos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-ASR-1.7B-hf y de las dependencias del stack (ZenDNN, ZenTorch, vLLM).
- Dependencia de hardware y software: el rendimiento óptimo está ligado a AMD EPYC, ZenDNN y ZenTorch; fuera de ese stack el beneficio puede no materializarse.
- La torre de audio y el proyector multimodal permanecen en BF16: la cuantización no cubre el frontend de audio, por lo que el ahorro de memoria se limita al modelo de lenguaje.
- Pipeline declarado como text-generation pese a ser un modelo ASR: la integración en vLLM requiere el processor multimodal (la model card advierte de que oneshot no lo guarda y hay que añadirlo manualmente).
- Reproducibilidad: requiere versiones muy concretas (torch 2.13.0+cpu, zentorch 2.14.0.3, vllm 0.33.0, llmcompressor 0.14.0); desviarse de ellas puede romper la compatibilidad.
- Configuración de OpenMP: sin LD_PRELOAD correcto, el rendimiento puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3-ASR-1.7B-hf-w8a8-llmcompressor
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
