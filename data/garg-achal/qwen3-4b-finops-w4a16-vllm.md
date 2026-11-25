# garg-achal/qwen3-4b-finops-w4a16-vllm

## Resumen

qwen3-4b-finops-w4a16-vllm es un checkpoint de servicio derivado de Qwen/Qwen3-4B, publicado por el usuario garg-achal en el contexto del sprint Applied AI Foundry v4.0 (Burst 1, Week 1 CUDA Closure) asociado a curons.org. No es un modelo entrenado desde cero, sino una demostración del flujo completo de post-entrenamiento en producción: ajuste fino QLoRA de 4 bits con bitsandbytes NF4 y doble cuantización, fusión de los deltas LoRA en bfloat16 y compresión posterior a W4A16 mediante llm-compressor (GPTQ) para servir con vLLM sobre kernels Marlin en CUDA.

El modelo hereda la arquitectura y el conocimiento del Qwen3-4B original, con 4.022.468.096 parámetros totales y un repositorio de 2,7 GB tras la compresión, lo que supone una reducción del 67,0 % frente al checkpoint fusionado en bfloat16 (7,49 GB). El ajuste se orientó al dominio FinOps (gestión de costes cloud) y se realizó sobre un conjunto de datos no documentado en la model card, con una pérdida que descendió de 3,6569 a 0,9182 en 30 pasos y 88,2 segundos sobre una NVIDIA L4.

Su relevancia es fundamentalmente metodológica: documenta con telemetría concreta el tránsito de entrenamiento a serving (M4 MPS, L4 CUDA, fusión BF16, compresión GPTQ W4A16) y ofrece cifras de throughput medidas con vLLM, desde 81 tok/s con un usuario hasta 1.495 tok/s con 32 usuarios concurrentes en una sola L4. La licencia es Apache 2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-4B); no se detallan capas ni dimensiones en la informacion disponible |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits) via llm-compressor GPTQ; entrenamiento QLoRA con NF4 + doble cuantizacion (bitsandbytes) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only de 4.022 millones de parámetros. Sobre esa base se aplicó un ajuste fino QLoRA con cuantización NF4 de 4 bits y doble cuantización de bitsandbytes, con rango r=8 y alpha=16, usando el SFTTrainer de TRL. El entrenamiento se ejecutó en dos entornos documentados: una línea base en Apple M4 con MPS y bfloat16 (7,50 GB de memoria, 10,5 tok/s, 15 pasos en 95,8 s) y la ejecución principal en una NVIDIA L4 en Google Colab (4,11 GB de pico CUDA, 30 pasos en 88,2 s, pérdida de 3,6569 a 0,9182).

Tras el ajuste, los deltas LoRA se fusionaron en un checkpoint torch.bfloat16 de 7,49 GB mediante merge_and_unload() y se comprimieron con llm-compressor GPTQ a W4A16, reduciendo el peso en disco a 2,47 GB (-67,0 %). El resultado se empaqueta en formato compressed-tensors para su carga en vLLM con kernels Marlin en CUDA. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset de FinOps, ni si hubo etapas de RLHF o DPO posteriores al SFT; tampoco detalla innovaciones de atención o decodificación más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3-4B.
- Ajuste específico de dominio para FinOps (gestión y optimización de costes cloud), aunque el alcance exacto del dataset no está documentado.
- Servicio de alto rendimiento con vLLM sobre CUDA (kernels Marlin) en formato W4A16.
- Capacidad de ejecución en entornos con poca memoria: 2,47 GB en disco y 9,14 GB de pico durante el serving.
- Soporte de batching concurrente: medido hasta 32 usuarios simultáneos en una sola L4.
- Soporte de tool calling, agentes, modo thinking, visión o audio: no disponible en la información proporcionada para este checkpoint.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de FinOps para equipos de plataforma: el ajuste de dominio permite responder consultas sobre optimización de costes cloud (reservas, instancias infrautilizadas, políticas de etiquetado) con un modelo de 4B servible en una GPU de gama media.
- Servicio de inferencia de bajo coste en producción: el formato W4A16 con vLLM permite desplegar el modelo en una única NVIDIA L4 con 81 tok/s por usuario y 1.495 tok/s agregados con 32 usuarios, adecuado para cargas interactivas con presupuesto ajustado.
- Clasificación y resumen de informes de facturación cloud: con prompts de hasta 800 tokens y respuestas de 300 tokens, el modelo encaja en pipelines de extracción y síntesis de datos de costes.
- Backend de chatbot interno para equipos de ingeniería: el batching concurrente medido (hasta 32 usuarios por L4) permite atender a un equipo pequeño con una sola GPU.
- Prototipado rápido de modelos de dominio: el repositorio sirve como plantilla reproducible del flujo QLoRA → fusión BF16 → GPTQ W4A16 → vLLM para validar nuevas verticales antes de invertir en modelos mayores.
- Evaluación comparativa de técnicas de cuantización: las telemetrías de memoria y throughput publicadas permiten contrastar NF4, BF16 y W4A16 en el mismo hardware (M4 MPS y L4 CUDA) como referencia para decisiones de despliegue.
- Despliegue en entornos con VRAM limitada: los 2,47 GB de pesos permiten cargar el modelo en GPUs consumer con 8-12 GB de VRAM, dejando margen para el contexto y el batching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son de serving, medidos con vLLM sobre una NVIDIA L4 en Google Colab el 22 de noviembre de 2026, con prompts de 800 tokens y respuestas de 300 tokens:

| Usuarios simultaneos | Tokens/s totales | Tokens/s por usuario |
|---|---|---|
| 1 | 81 | 81 |
| 4 | 300 | 75 |
| 16 | 954 | 60 |
| 32 | 1.495 | 47 |

Datos adicionales de entrenamiento y memoria:

| Etapa / Backend | Precision / Formato | Memoria pico | Velocidad |
|---|---|---|---|
| Apple M4 (MPS) | bfloat16 | 7,50 GB | 10,5 tok/s (15 pasos SFT en 95,8 s) |
| Colab CUDA (NVIDIA L4) | NF4 4 bits + doble cuantizacion | 4,11 GB CUDA | 30 pasos en 88,2 s |
| Checkpoint fusionado | torch.bfloat16 | 7,49 GB en disco | No medido |
| llm-compressor GPTQ W4A16 | W4A16 | 2,47 GB en disco / 9,14 GB pico | 81 tok/s (1 usuario), 1.495 tok/s (32 usuarios) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,47 GB de pesos en W4A16; el pico medido durante el serving en vLLM fue de 9,14 GB, incluyendo KV cache y overhead del runtime.
- GPU recomendadas: NVIDIA L4 (validada en la model card), A100, H100 y RTX 4090 como alternativas compatibles con kernels Marlin; cualquier GPU CUDA con soporte de vLLM y suficiente VRAM.
- Cabe en GPU consumer: sí, en tarjetas con 8-12 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), siempre que se ajuste el tamaño de contexto y el número de secuencias concurrentes.
- Opciones de despliegue: vLLM es el runtime objetivo documentado (formato compressed-tensors con Marlin). Otros runtimes como llama.cpp, Ollama o TGI no están validados en la información proporcionada.
- Latencia y throughput: 81 tok/s con un usuario y 1.495 tok/s agregados con 32 usuarios en una L4; el rendimiento por usuario cae de 81 a 47 tok/s al pasar de 1 a 32 concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-finops-w4a16-vllm | 4,02 B | No disponible | W4A16 (compressed-tensors) para vLLM | Apache 2.0 | Hugging Face (48 descargas) |
| Qwen/Qwen3-4B (base) | 4,02 B | No disponible en esta ficha | safetensors BF16 | Apache 2.0 | Hugging Face, ampliamente distribuido |
| Qwen3-4B ajustado con QLoRA (sin comprimir) | 4,02 B | No disponible | BF16 fusionado (7,49 GB) | Apache 2.0 | No publicado como checkpoint independiente en la informacion disponible |
| Otros modelos de 3-4 B de la familia Qwen3 o Llama 3.2 | 3-4 B | No disponible | safetensors, GGUF | Apache 2.0 / licencia Llama | Hugging Face |

La comparación de rendimiento con alternativas no es posible: no hay benchmarks de calidad publicados para este checkpoint ni datos de throughput de los modelos comparables en el mismo hardware. La ventaja diferencial frente al Qwen3-4B base es el tamaño reducido (2,47 GB frente a ~8 GB en BF16) y la integración lista para vLLM, no una mejora de capacidad.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad (benchmarks, evals de seguridad ni tests de regresión) tras el ajuste QLoRA ni tras la compresión GPTQ W4A16; el impacto de ambas etapas en la precisión del modelo es desconocido.
- El dataset de ajuste FinOps no está documentado: se desconoce su tamaño, procedencia, licencia y posibles sesgos, lo que impide auditar el comportamiento del modelo en producción.
- La cuantización W4A16 puede degradar tareas sensibles a la precisión numérica (matemáticas, código, razonamiento de varios pasos) en comparación con el BF16 original; no hay mediciones que lo cuantifiquen.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en dominios especializados como costes cloud, donde una cifra incorrecta puede tener consecuencias operativas.
- Idiomas soportados no declarados en la model card; se desconoce si el ajuste degradó el multilingüismo del Qwen3-4B base.
- Longitud de contexto efectiva no verificada tras la compresión; el serving se midió con prompts de 800 tokens y respuestas de 300, no en el límite del modelo.
- El repositorio tiene 48 descargas y 0 likes, con un único autor; no hay evidencia de uso en producción ni mantenimiento continuado.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar las condiciones del modelo base Qwen3-4B y de los datos de ajuste antes de un despliegue comercial.
- El formato compressed-tensors está orientado a vLLM; usarlo con otros runtimes requiere conversión y no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/garg-achal/qwen3-4b-finops-w4a16-vllm
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Proyecto Applied AI Foundry / curons.org: https://curons.org
- Perfil del autor del sprint (@imhlg): https://huggingface.co/imhlg
- llm-compressor (herramienta de compresion GPTQ W4A16): no disponible en la informacion proporcionada
- vLLM (runtime de serving): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
