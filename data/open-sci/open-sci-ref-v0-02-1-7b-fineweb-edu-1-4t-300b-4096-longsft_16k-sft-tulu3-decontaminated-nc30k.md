# open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-nc30k

## Resumen

El modelo `open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-nc30k` es un ajuste fino supervisado (SFT) del checkpoint `ali-elganzory/open-sci-ref-v0.02-1.7b`, un transformer decoder-only de aproximadamente 1.700 millones de parametros desarrollado en el marco del proyecto open-sci. Este ajuste concreto lo publica la organizacion `open-sci` y ha sido entrenado con el framework LLaMA-Factory sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, un conjunto de instrucciones en formato ShareGPT derivado de la cascada de SFT de NVIDIA Nemotron.

El modelo base se presenta como una referencia reproducible de un LLM pequeno entrenado desde cero sobre FineWeb-Edu (1,4 billones de tokens) con una fase posterior de long-SFT de 16k tokens de contexto y SFT sobre Tulu3 decontaminado. Este checkpoint anade una capa adicional de SFT sobre instrucciones de alta calidad con la intencion de mejorar el seguimiento de instrucciones y el razonamiento conversacional, manteniendo el tamano compacto que permite desplegarlo en GPUs de consumo.

La relevancia actual reside en su caracter abierto y reproducible: es un modelo pequeno, con pesos en safetensors, entrenado con hiperparametros documentados y pensado para investigacion sobre recetas de entrenamiento y ajuste fino, mas que para produccion comercial. La model card es escasa y autogenerada, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles no disponibles) |
| Parametros totales | 1.714.377.728 (~1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el checkpoint base referencia long-SFT de 16k) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning, no LoRA) de un transformer decoder-only de ~1,7B parametros. No se detallan en la informacion disponible el numero de capas, dimensiones ocultas, tipo de atencion ni tokenizer. El nombre del checkpoint base sugiere un entrenamiento desde cero sobre FineWeb-Edu con 1,4 billones de tokens, seguido de una fase de long-SFT con contexto de 16k y un SFT sobre Tulu3 decontaminado; esta secuencia es coherente con recetas de referencia para modelos pequenos de investigacion.

El ajuste fino de este checkpoint se realizo con LLaMA-Factory sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf. Los hiperparametros documentados son: learning rate 4e-05, batch total 128 (batch 1 por dispositivo, 32 GPUs, 4 pasos de acumulacion), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 10%, semilla 42. El entrenamiento se ejecuto con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, MoE) en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje causal.
- Seguimiento de instrucciones conversacionales en formato ShareGPT, derivado del SFT sobre Nemotron-Cascade.
- Razonamiento basico y respuesta a preguntas, limitado por el tamano de 1,7B parametros.
- Extraccion de caracteristicas (pipeline declarado en HuggingFace: `feature-extraction`), aunque el modelo es fundamentalmente generativo.
- Soporte de contexto largo potencialmente hasta 16k tokens, segun el checkpoint base; no confirmado para este ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre recetas de SFT: el modelo sirve como punto de comparacion reproducible para estudiar el efecto de un SFT adicional sobre un checkpoint base ya ajustado, gracias a que los hiperparametros y el dataset estan documentados.
- Evaluacion de calidad de datos de instrucciones: permite medir como afecta el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf al rendimiento en tareas de seguimiento de instrucciones frente al checkpoint base.
- Prototipado rapido en local: con 1,7B parametros y pesos safetensors, se puede cargar en una GPU de consumo para experimentar con prompts y plantillas de chat sin coste de API.
- Generacion de texto asistida en entornos con recursos limitados: adecuado para tareas de redaccion, resumen o reescritura donde no se requiere maxima calidad pero si despliegue local.
- Fine-tuning posterior y experimentos de destilacion: al ser pequeno y de licencia abierta (con matices), sirve como estudiante en pipelines de destilacion o como base para nuevos SFT con LLaMA-Factory.
- Docencia y formacion: util para explicar el ciclo completo de entrenamiento (pretraining, long-SFT, SFT) con un modelo cuyo nombre y configuracion son trazables.
- Extraccion de embeddings para clasificacion o clustering: el pipeline declarado `feature-extraction` permite usar las representaciones internas en tareas downstream sencillas.

## Benchmarks y rendimiento

La model card incluye un `model-index` con la entrada `sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__open-sci-re-a1c1aa00__sdpa-open-sci-steps`, pero el array `results` esta vacio. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 5-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: ~1,8 GB de pesos; en 4 bits: ~0,9 GB de pesos (cuantizaciones no publicadas oficialmente, estimaciones a partir del numero de parametros).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100/H100 no son necesarias pero permiten mayor throughput por batch.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para serving; llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b (este SFT) | ~1,7B | no disponible (base: 16k) | other | HuggingFace | SFT sobre Nemotron-Cascade; sin benchmarks publicados |
| Qwen2.5-1.5B | 1,5B | 32k | Apache 2.0 | HuggingFace | Referencia pequena con benchmarks publicados |
| SmolLM2-1.7B | 1,7B | 8k | Apache 2.0 | HuggingFace | Modelo pequeno con receta documentada |
| Llama 3.2-1B | 1,2B | 128k | Llama 3.2 Community License | HuggingFace | Alternativa con contexto largo |

La comparacion se limita a tamano y disponibilidad: no hay datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Model card autogenerada y practicamente vacia: no hay informacion sobre usos previstos, limitaciones ni datos de evaluacion.
- Sin benchmarks publicados: no es posible verificar la calidad del ajuste frente al checkpoint base ni frente a alternativas.
- Riesgo de alucinacion elevado por el tamano (1,7B) y por la falta de evaluacion; no recomendado para tareas de alta precision sin validacion.
- Idiomas soportados no declarados: el comportamiento multilingue es incierto.
- Licencia "other" sin terminos explicitos en la model card: es necesario contactar con el autor o revisar el repositorio base antes de cualquier uso comercial.
- Contexto efectivo no confirmado: el nombre del checkpoint base menciona 16k, pero este ajuste no lo declara.
- Sesgos conocidos: no documentados, pero heredables del corpus FineWeb-Edu y del dataset Nemotron-Cascade.
- Dataset de entrenamiento en ruta interna (`/gpfs/scratch/...`): la reproducibilidad exacta depende de que el dataset sea publico.
- No apto para produccion sin evaluacion previa: ausencia de pruebas de robustez, seguridad o sesgo.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-nc30k
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tulu3: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Nemotron (NVIDIA): https://huggingface.co/nvidia
