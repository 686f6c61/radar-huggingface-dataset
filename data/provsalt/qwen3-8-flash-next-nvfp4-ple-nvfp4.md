# provsalt/Qwen3.8-Flash-Next-NVFP4-PLE-NVFP4

## Resumen

Qwen3.8-Flash-Next-NVFP4-PLE-NVFP4 es un checkpoint de servicio derivado de [`Inferact/Qwen3.8-Flash-Next-NVFP4`](https://huggingface.co/Inferact/Qwen3.8-Flash-Next-NVFP4), que a su vez proviene del modelo oficial [`Qwen/Qwen3.8-Flash-Next`](https://huggingface.co/Qwen/Qwen3.8-Flash-Next). El repositorio, publicado por el usuario provsalt, mantiene intacto el backbone NVFP4 de ModelOpt y convierte únicamente la tabla n-grama de position-learning enhancement (PLE) de BF16 a NVFP4, reduciendo el peso total del checkpoint de 170.189 GiB a 101.643 GiB.

El modelo resultante es un modelo multimodal (image-text-to-text) con 92.743.589.779 parámetros totales en el checkpoint convertido, pensado para ejecutarse en un único NVIDIA DGX Spark con 128 GB de memoria unificada LPDDR5x. La conversión ahorra 68.546 GiB sin emplear REAP ni eliminar expertos. El checkpoint requiere un plugin de runtime externo (`qwen38-nvfp4-ple`) porque el formato PLE empaquetado no es cargable por vLLM estándar ni por Transformers.

La relevancia de este modelo radica en que demuestra la viabilidad de ejecutar un modelo de 92.7B parámetros con tabla PLE NVFP4 en un solo dispositivo de memoria unificada, con un coste de alineación medido en 91.525% de top-1 agreement frente al backbone FP8 de referencia. El repositorio incluye únicamente pesos y metadatos de Hugging Face, sin código de runtime, scripts ni artefactos de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con GDN + QSA (Gated DeltaNet + Qwen Sparse Attention), wrapper `Qwen4ExpForConditionalGeneration` |
| Parametros totales | 92.743.589.779 (checkpoint convertido; el modelo original declara 125B incluyendo tabla N-grama de 51B) |
| Parametros activos | 6B por token (segun documentacion del modelo base) |
| Longitud de contexto | no disponible (el runtime validado usa 4.096 tokens por defecto) |
| Tipos de cuantizacion | NVFP4 (backbone y tabla PLE), con decodificacion de filas PLE a BF16 en CPU |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (checkpoint completo de 109.2 GB en el repo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de atención que combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA). Tres de cada cuatro capas usan GDN para comprimir el historial, mientras que la cuarta capa utiliza QSA para recuperación precisa de largo alcance. Es un modelo multimodal ultra-sparse Mixture-of-Experts con 125B parámetros totales (incluyendo una tabla N-grama de embedding de 51B) y 6B parámetros activos por token.

Este checkpoint concreto no modifica la arquitectura del backbone, sino que convierte la tabla PLE de BF16 a NVFP4. El formato `qwen38-nvfp4-ple-v1` almacena cada grupo de 16 valores como valores E2M1 empaquetados, con un block scale E4M3 y un global decode scale FP32 por shard PLE de origen. El runtime descodifica solo las filas solicitadas a BF16 sin expandir nunca la tabla completa. El checkpoint conserva la vision tower original y los pesos MTP (multi-token prediction), aunque el runtime validado no habilitó MTP.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información proporcionada.

## Capacidades

- Generación de texto multimodal: el modelo acepta entradas de imagen y texto, y produce texto. El pipeline declarado es `image-text-to-text`.
- Razonamiento de largo alcance: la combinación GDN + QSA permite comprimir historial y recuperar información precisa en secuencias largas.
- Eficiencia computacional: al activar solo 6B parámetros por token, el coste de inferencia es significativamente menor que el de un modelo denso de tamaño equivalente.
- Capacidad de procesamiento de imágenes: la vision tower se cargó y validó en pruebas smoke con entradas PNG. El presupuesto de píxeles validado es de 65.536 a 262.144 píxeles por imagen.
- Soporte de decodificación especulativa: los pesos MTP están presentes en el checkpoint, aunque el runtime validado no los habilitó.
- Sin soporte de video: el runtime validado tiene el video deshabilitado por defecto y no ha sido probado.
- No se menciona soporte de tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- Despliegue de un modelo multimodal de 92.7B en un solo DGX Spark: el caso de uso principal declarado por el autor. El checkpoint cabe en los 128 GB de memoria unificada del GB10, con 73.97 GiB usados durante la carga del modelo y una KV cache de 2 GiB. Es adecuado para entornos edge o de investigación con un solo dispositivo NVIDIA.
- Servicio de chat con imagen en entornos con restricciones de hardware: el modelo puede servir peticiones que incluyen una imagen y texto, con un tiempo de arranque de API de unos 639 segundos. La ventana de contexto por defecto de 4.096 tokens es conservadora pero suficiente para tareas de descripción de imagen o VQA básica.
- Evaluación de la calidad de cuantización NVFP4 en tablas PLE: el estudio controlado con 32 prompts de calibración y 8 prompts held-out (236 posiciones de next-token) permite comparar la fidelidad de la representación NVFP4 frente a la BF16 original. Útil para investigadores que estudian el impacto de la cuantización en componentes auxiliares.
- Inferencia multimodal en entornos con memoria unificada CPU-GPU: el plugin mantiene la tabla PLE de 26.822 GiB en memoria CPU y descodifica solo las filas necesarias a BF16, lo que demuestra una estrategia de offloading viable para modelos grandes en sistemas con memoria compartida.
- Pruebas de humo y validación de pipelines de servicio: el checkpoint pasó pruebas smoke de texto y multimodales completas en vLLM, incluyendo la identificación correcta de una escena lunar generada, la Tierra, ropa casual y la ausencia de traje espacial. Sirve como punto de partida para validar integraciones de runtime.
- Investigación sobre formatos de cuantización de nueva generación: el formato E2M1 con block scales E4M3 y decode scales FP32 es un caso práctico de cuantización de 4 bits aplicada a tablas auxiliares, relevante para quienes trabajan con ModelOpt y formatos NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona un estudio de alineación controlado que mide el impacto de la conversión NVFP4 de la tabla PLE, comparando con el backbone FP8 de referencia:

| Perturbacion | Top-1 agreement | Referencia top-1 en candidato top-5 | KL (nats) | Delta NLL (nats) | Coseno de logits |
|---|---:|---:|---:|---:|---:|
| NVFP4 PLE solo (checkpoint subido) | 91.525% | 100.000% | 0.015591 | +0.019442 | 0.995399 |
| REAP solo, 25% expertos eliminados | 87.712% | 100.000% | 0.042569 | +0.043668 | 0.991027 |
| REAP y NVFP4 PLE | 91.102% | 99.576% | 0.040298 | +0.040545 | 0.990824 |

Estas mediciones aíslan los cambios en la representación PLE y no miden la diferencia de calidad entre el backbone NVFP4 de Inferact y el modelo original. Las filas REAP son experimentos comparativos, no parte del checkpoint subido.

## Requisitos de hardware

- VRAM estimada: 73.97 GiB durante la carga del modelo en una ejecución multimodal TP1, más 2 GiB de KV cache reservada. La vision tower añade 0.85 GiB sobre el servicio solo texto.
- GPU validada: NVIDIA GB10 (compute capability 12.1), integrada en el DGX Spark con 128 GB de memoria unificada LPDDR5x compartida entre CPU y GPU.
- Memoria total necesaria: la tabla PLE de 26.822 GiB se mantiene en CPU y se descodifica por filas a BF16. Ambas asignaciones (GPU y CPU) provienen del mismo pool de memoria física de 128 GB.
- No cabe en GPUs de consumo convencionales: el checkpoint requiere al menos 128 GB de memoria unificada o una GPU con más de 96 GB de VRAM. No es ejecutable en RTX 4090, RTX 3090 ni GPUs de 24 GB o menos.
- Opciones de despliegue: vLLM con imagen específica `vllm/vllm-openai:qwen38-flash-next@sha256:fc120ece0a388cc0aa1caad4a9f1cd92113484ab7ec2fd0efadd62585be05bf8` y versión `0.1.dev20073+g8e685d198`. El executor debe ser `mp` (incluso a TP1); el executor `uni` no funciona con el plugin PLE.
- Plugin externo obligatorio: se requiere el plugin de runtime `qwen38-nvfp4-ple`; vLLM estándar y Transformers no pueden cargar el checkpoint.
- Latencia y throughput: no se proporcionan mediciones de throughput para este checkpoint concreto. El autor indica que la demostración de ajuste no es una afirmación de throughput. En el hilo de NVIDIA se reportan 70 tok/s pico y 47 tok/s típicos para el modelo NVFP4 en 2× DGX Spark con SGLang TP2, MTP4 y CUDA graphs, pero esa configuración no es la validada en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| provsalt/Qwen3.8-Flash-Next-NVFP4-PLE-NVFP4 | 92.7B (checkpoint) | NVFP4 (backbone + PLE) | no disponible | qwen-community-1.0 | 1× DGX Spark, vLLM + plugin externo |
| Inferact/Qwen3.8-Flash-Next-NVFP4 | 92.7B (aprox.) | NVFP4 (backbone), PLE en BF16 | no disponible | qwen-community-1.0 | 1× DGX Spark, vLLM |
| primitive-ai/Qwen3.8-Flash-Next-mixed-NVFP4-FP8 | 92.7B (aprox.) | NVFP4 + FP8 (capas de atención completas en FP8) | no disponible | no disponible | 1× GPU Blackwell de 96 GB |
| Qwen/Qwen3.8-Flash-Next (original) | 125B (incl. tabla N-grama) | BF16/FP8 | no disponible | qwen-community-1.0 | Multi-GPU |

La diferencia principal entre este checkpoint y el de Inferact es la conversión de la tabla PLE a NVFP4, que ahorra 68.546 GiB. Frente a la variante mixta de primitive-ai, este modelo mantiene todo el backbone en NVFP4 y requiere el plugin externo, mientras que la variante mixta usa FP8 en las capas de atención completas y se despliega en una GPU Blackwell de 96 GB.

## Limitaciones y advertencias

- El estudio de alineación no es un benchmark de calidad de tareas: solo mide la fidelidad de la representación PLE en 236 posiciones de next-token con 40 prompts. No hay datos de MMLU, HumanEval ni otras evaluaciones estándar.
- Las pruebas de runtime son smoke tests, no benchmarks de throughput ni de visión. No se han validado rutas de contexto largo, peticiones concurrentes, tensor parallelism ni expert parallelism.
- La ruta de imagen validada acepta una sola imagen dentro del presupuesto de píxeles por defecto. El video está deshabilitado por defecto y no ha sido validado.
- El runtime validado no habilitó MTP, aunque los pesos MTP están presentes en el checkpoint.
- El host de prueba tenía swap de sistema en uso después de la inferencia, lo que indica que el margen de memoria es ajustado.
- El decodificador PLE usa operaciones PyTorch CPU ordinarias; un decodificador fusionado podría reducir la latencia de búsqueda.
- El checkpoint no es cargable con vLLM estándar ni Transformers: requiere el plugin externo `qwen38-nvfp4-ple` y una versión específica de vLLM. Esto limita su portabilidad y dificulta su integración en pipelines existentes.
- La licencia Qwen Community License 1.0 tiene restricciones específicas de uso comercial que deben revisarse antes de desplegar el modelo en producción.
- No se debe usar `--load-format dummy` en GB10: el inicializador de pesos dummy upcastea los parámetros fp8 a fp16 como copia temporal, y la tabla PLE de 51.2 GB en fp8 puede demandar temporalmente más de 150 GB en una partición de memoria unificada de 121 GB, provocando un cuelgue del sistema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/provsalt/Qwen3.8-Flash-Next-NVFP4-PLE-NVFP4
- Modelo base (Inferact): https://huggingface.co/Inferact/Qwen3.8-Flash-Next-NVFP4
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo original: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Despliegue en 2× DGX Spark con SGLang TP2: https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Dual-DGX-Sparks
- Hilo de NVIDIA Forums sobre rendimiento en 2× DGX Spark: https://forums.developer.nvidia.com/t/qwen3-8-flash-next-nvfp4-on-2x-dgx-spark-full-multimodal-70-tok-s-peak-47-typical/381428
- Variante mixta NVFP4-FP8 (primitive-ai): https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-mixed-NVFP4-FP8
- Documentación de hardware DGX Spark: https://docs.nvidia.com/dgx/dgx-spark/hardware.html
