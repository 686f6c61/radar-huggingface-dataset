# intel-ai/Wan2.2-I2V-A14B-Diffusers-NVFP4-AutoRound

## Resumen

Wan2.2-I2V-A14B-Diffusers-NVFP4-AutoRound es una versión cuantizada a NVFP4 (W4A4) del modelo de generación de vídeo a partir de imagen Wan2.2-I2V-A14B, desarrollado originalmente por Wan-AI y cuantizado por Intel AI mediante la herramienta AutoRound. El modelo base es un sistema de difusión de dos expertos (Mixture of Experts temporal) con 14.000 millones de parámetros por experto, especializado en la síntesis de vídeo condicionada por una imagen de entrada y un prompt textual.

La aportación de esta variante es la compresión a 4 bits en pesos y activaciones con formato NVFP4 (grupo de 16) y escalas globales estáticas calibradas, lo que reduce el peso del repositorio a 28,5 GB y permite ejecutar el modelo en GPUs Blackwell con soporte nativo de FP4. La cuantización se aplica a ambos expertos del transformer de difusión, dejando intactos el codificador de texto UMT5, el VAE, el tokenizador y el scheduler.

Es relevante ahora porque demuestra que la cuantización de 4 bits con AutoRound mantiene la calidad visual de vídeo con una caída media inferior a 1 punto porcentual en VBench I2V respecto a BF16, abriendo la puerta a despliegues de generación de vídeo de alta fidelidad en hardware de una sola GPU Blackwell con requisitos de memoria notablemente reducidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con dos expertos (MoE temporal), pipeline WanImageToVideoPipeline |
| Parámetros totales | 8.141.625.184 (según safetensors del checkpoint cuantizado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de contexto textual) |
| Tipos de cuantización | NVFP4 W4A4, group size 16, escalas globales estáticas calibradas (nv_fp4_with_static_gs), exportado como auto_round:llm_compressor |
| Idiomas soportados | no disponible (prompts multilingües vía UMT5, sin lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint Diffusers) |

## Arquitectura y entrenamiento

El modelo base Wan2.2-I2V-A14B emplea una arquitectura de difusión con dos expertos transformer (`transformer` y `transformer_2`) que se alternan según la relación de ruido, una variante de MoE temporal característica de la familia Wan2.2. El pipeline completo incluye un codificador de texto UMT5, un VAE para la codificación y decodificación de vídeo, y un scheduler de difusión. La generación se controla mediante prompts positivos y negativos, escala de guiado (CFG), número de pasos de inferencia, flow shift y boundary ratio entre expertos.

Esta variante concreta no reentrena el modelo: aplica cuantización post-entrenamiento con AutoRound en modo round-to-nearest (RTN) puro, sin iteraciones de ajuste y con RTN optimizado desactivado. Las escalas de activación se calibran con 32 muestras del conjunto OpenS2V. Ambos expertos del transformer se cuantizan a NVFP4, mientras que el codificador de texto, el VAE, el tokenizador, el scheduler y ciertas capas excluidas del transformer permanecen sin cuantizar. No se dispone de información sobre los datos de entrenamiento originales del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada y un prompt textual (image-to-video), con control de resolución mediante relación de aspecto y área máxima.
- Soporte de prompt negativo para suprimir artefactos (texto superpuesto, manos deformadas, congelación de movimiento, sobreexposición, etc.).
- Control fino de la generación mediante parámetros de inferencia: número de fotogramas (por ejemplo, 81), FPS (16), pasos de difusión (40), guidance scale y guidance scale high (3,5), boundary ratio (0,9) y flow shift (3,0).
- Generación determinista mediante semilla configurable.
- Compatibilidad con el ecosistema Diffusers a través de `WanImageToVideoPipeline`.
- Ejecución optimizada en vLLM-Omni con backend de atención TRTLLM_ATTN y kernel lineal NVFP4 de FlashInfer.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión más allá del condicionamiento por imagen de entrada.

## Casos de uso

- Generación de vídeo publicitario a partir de una fotografía de producto: se introduce una imagen estática del producto y un prompt descriptivo para obtener un clip de 81 fotogramas a 16 FPS con movimiento de cámara y ambiente controlados, aprovechando el bajo coste de memoria del checkpoint NVFP4 en una GPU Blackwell.
- Prototipado rápido de animaciones para previsualización cinematográfica: el modelo permite iterar sobre prompts y semillas con 40 pasos de difusión para explorar variantes de una escena antes de producir el render final en BF16.
- Creación de contenido para redes sociales: a partir de una imagen de marca se generan clips cortos en formato 16:9 o vertical ajustando `max_area`, con el prompt negativo preconfigurado para evitar artefactos comunes.
- Automatización de pipelines de postproducción: integración en vLLM-Omni con el backend FlashInfer NVFP4 para procesar lotes de imágenes por lotes en servidores con B200, reduciendo el coste por vídeo generado frente a la versión BF16.
- Investigación en cuantización de modelos de difusión: el checkpoint sirve como referencia reproducible para estudiar el impacto de NVFP4 W4A4 con escalas estáticas en la calidad de vídeo, comparando directamente contra BF16 con el mismo pipeline y semilla.
- Demostraciones interactivas en hardware de gama alta para consumidores: al reducir el peso a 28,5 GB, es viable desplegar el modelo en estaciones con GPU Blackwell de memoria suficiente, habilitando demos de image-to-video en tiempo casi interactivo.
- Evaluación comparativa de backends de atención: al requerir TRTLLM_ATTN y FlashInfer NVFP4, el modelo permite medir el rendimiento de distintas combinaciones de kernels en generación de vídeo.

## Benchmarks y rendimiento

| Benchmark | Métrica | BF16 (referencia) | NVFP4 (este modelo) | Diferencia |
|---|---|---|---|---|
| VBench 0.1.5 I2V (355 pares prompt/imagen, unión de i2v_subject e i2v_background) | Caída media absoluta en 5 métricas (escala 0-100) | referencia | — | 0,994 puntos porcentuales de caída media |

La evaluación se realizó con VBench 0.1.5 sobre 355 pares únicos prompt/imagen (246 de `i2v_subject` y 109 de `i2v_background`), con imágenes de referencia oficiales recortadas en 16:9 y resolución fija de 832 × 480. Cada modelo generó un vídeo por par. La cifra de 0,994 puntos porcentuales es una diferencia absoluta media con igual peso por métrica, no una puntuación agregada oficial de VBench. No se han publicado en la información disponible los valores absolutos por métrica ni resultados de otros benchmarks estándar (MMLU, HumanEval, GSM8K no aplican a un modelo de difusión).

## Requisitos de hardware

- Entorno validado: NVIDIA B200, Python 3.12.3, PyTorch 2.14.0, vLLM 0.33.0, Diffusers 0.40.0, FlashInfer 0.7.2.post1, NVIDIA CUTLASS DSL 4.8.0, CUDA toolkit 12.8.93 y commit oficial de vLLM-Omni 7465c0f52.
- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 28,5 GB en disco, por lo que se requiere una GPU con memoria suficiente para cargar el checkpoint NVFP4 más las activaciones y el VAE (previsiblemente en el rango de 40-80 GB, aunque el dato exacto no está publicado).
- GPU recomendadas: NVIDIA B200 (única plataforma validada por el autor). No se ha validado en otras GPUs.
- Compatibilidad con GPU de consumo: no confirmada. El formato NVFP4 requiere soporte nativo de FP4, disponible en la arquitectura Blackwell; no se garantiza en RTX 4090 ni en generaciones anteriores.
- Opciones de despliegue: vLLM-Omni con el ejemplo oficial de inferencia offline, backend de atención TRTLLM_ATTN y kernel lineal NVFP4 de FlashInfer (`FlashInferCuteDslNvFp4LinearKernel`). Diffusers como librería de pipeline. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-I2V-A14B-Diffusers-NVFP4-AutoRound (este modelo) | 8.141.625.184 (checkpoint cuantizado) | NVFP4 W4A4, group 16 | 832 × 480 en evaluación; hasta 81 fotogramas | Apache 2.0 | Hugging Face, vLLM-Omni |
| Wan2.2-I2V-A14B-Diffusers-MXFP8-AutoRound | no disponible | MXFP8 | misma configuración de evaluación | Apache 2.0 | Hugging Face (referenciado en la model card) |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers (BF16) | no disponible en la información | BF16 | misma configuración de evaluación | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes de la misma familia Wan2.2 documentadas en la model card. No se dispone de datos de benchmarks de modelos competidores de image-to-video en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 se ha validado únicamente en NVIDIA B200 con un stack de software muy concreto (vLLM 0.33.0, Diffusers 0.40.0, FlashInfer 0.7.2.post1, CUDA 12.8.93). Otros hardware y combinaciones de software no han sido validados.
- Requiere mantener inalterados los metadatos de cuantización exportados; modificarlos puede degradar la calidad o romper la inferencia.
- El uso de RTN puro con 0 iteraciones de ajuste implica que la calibración de escalas de activación depende de las 32 muestras de OpenS2V; dominios muy distintos podrían sufrir mayor degradación.
- La evaluación de calidad se limita a VBench I2V sobre 355 pares y 5 métricas; no cubre otras dimensiones como coherencia temporal de largo plazo o fidelidad de identidad en escenas complejas.
- Riesgo de artefactos visuales típicos de modelos de difusión de vídeo: deformaciones anatómicas, texto superpuesto, congelación de movimiento o inconsistencias entre fotogramas, mitigables parcialmente con el prompt negativo.
- Sesgos conocidos: no documentados en la información proporcionada; al heredar el modelo base, es previsible que arrastre los sesgos de sus datos de entrenamiento originales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Wan-AI/Wan2.2-I2V-A14B-Diffusers y de los componentes (UMT5, VAE) por si imponen condiciones adicionales.
- El checkpoint no incluye cuantización del codificador de texto ni del VAE, por lo que el ahorro de memoria es parcial respecto a una cuantización integral.
- No se documentan idiomas soportados oficialmente; el prompt negativo de ejemplo está en chino, lo que sugiere buen soporte de ese idioma además del inglés, pero sin confirmación oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Wan2.2-I2V-A14B-Diffusers-NVFP4-AutoRound
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Variante MXFP8 de referencia: https://huggingface.co/intel-ai/Wan2.2-I2V-A14B-Diffusers-MXFP8-AutoRound
- Repositorio AutoRound de Intel: https://github.com/intel/auto-round
- vLLM-Omni (commit evaluado): https://github.com/vllm-project/vllm-omni/tree/7465c0f52bcb46a55f62c1b8613846cda30d0083
- Imagen de entrada del ejemplo: https://huggingface.co/datasets/YiYiXu/testing-images/resolve/main/wan_i2v_input.JPG
- Vídeo BF16 de referencia: https://huggingface.co/intel-ai/Wan2.2-I2V-A14B-Diffusers-NVFP4-AutoRound/resolve/main/assets/bf16.mp4
- Vídeo NVFP4 generado: https://huggingface.co/intel-ai/Wan2.2-I2V-A14B-Diffusers-NVFP4-AutoRound/resolve/main/assets/nvfp4.mp4
- Paper de AutoRound (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
