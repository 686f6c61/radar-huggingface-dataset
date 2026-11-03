# lerobot/Cosmos3-Nano-Policy-LIBERO_10

## Resumen

Cosmos3-Nano-Policy-LIBERO_10 es una política robótica (visión-lenguaje-acción) obtenida mediante fine-tuning del checkpoint base lerobot/Cosmos3-Nano sobre el conjunto de datos LIBERO-10. El modelo, publicado por el equipo de LeRobot en Hugging Face, resuelve el problema de control robótico de manipulación a partir de instrucciones en lenguaje natural y dos vistas de cámara (tercera persona y muñeca), generando bloques de 16 acciones junto con una predicción del vídeo futuro de la escena. Es relevante porque combina un backbone de tipo Qwen3-VL MoT con un cabezal de difusión de acciones y vídeo, alcanzando un 97,6 % de éxito en la suite LIBERO-10, un resultado puntero dentro de los benchmarks de manipulación de propósito general.

El modelo tiene 16.454.213.580 parámetros (aproximadamente 16,5 mil millones), se distribuye en formato safetensors con pesos en BF16 (salvo cuatro tensores FP32 correspondientes al embedding de timestep) y ocupa 33 GB en el repositorio. Está pensado para su uso dentro del ecosistema LeRobot, con un pipeline declarado como `robotics` y una licencia OpenMDW 1.1.

La ficha describe las especificaciones técnicas, la arquitectura, las capacidades, los casos de uso realistas, los resultados publicados en LIBERO, los requisitos de hardware y las limitaciones de esta política, así como una comparativa con las alternativas disponibles en el ecosistema Cosmos3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje-acción (Qwen3-VL MoT como backbone, 36 capas de decoder, anchura oculta 4096) con cabezal de difusión de acciones y vídeo |
| Parámetros totales | 16.454.213.580 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16 y 4 tensores FP32) |
| Idiomas soportados | no disponible (las instrucciones de LIBERO están en inglés, pero no se declara cobertura multilingüe) |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (1356 tensores: 1352 BF16 y 4 FP32) |

## Arquitectura y entrenamiento

La política se construye sobre el checkpoint lerobot/Cosmos3-Nano, que a su vez es el formato LeRobot del modelo nvidia/Cosmos3-Nano. El backbone es un Qwen3-VL MoT con 36 capas de decoder y anchura oculta de 4096, que procesa la instrucción de tarea junto con dos observaciones visuales (cámara en tercera persona y cámara de muñeca, 256x256 RGB a 20 FPS, sin estado propio del robot). Sobre este backbone se acoplan módulos de acción reinicializados durante el fine-tuning y un cabezal generativo que produce, en cada paso, un bloque de 16 acciones junto con el vídeo futuro de la escena. Las acciones se representan en un espacio de 10 dimensiones (3 de posición delta, 6 de rotación en formato rot6d y 1 de pinza) que los procesadores del entorno convierten a las 7 dimensiones nativas de LIBERO.

El entrenamiento se realizó sobre el dataset lerobot/LIBERO_10-Cosmos3 (379 episodios, 10 tareas, sin split de validación), con batch global de 2048 muestras por actualización (32 por GPU × 32 GPUs × 2 de acumulación), usando 32 NVIDIA A100-SXM4-80GB en 4 nodos de 8 GPUs con InfiniBand y paralelismo FSDP2 HSDP (sharding intra-nodo, replicación entre nodos). Se aplicó AdamW con learning rate 5e-5 (2,5e-4 para los módulos de acción), betas (0,9, 0,99), weight decay 0,05, gradient clipping 1,0, warmup lineal de 500 actualizaciones y decaimiento lineal hasta la actualización 16000. El checkpoint publicado corresponde a la actualización de optimizador 2000 (paso 4000 de LeRobot), seleccionado por su tasa de éxito en LIBERO entre los checkpoints guardados; se usan pesos EMA y precisión mixta con pesos maestros en float32 y cómputo en bfloat16. La atención es SDPA y no se aplicó `torch.compile`.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de instrucciones en lenguaje natural y dos vistas de cámara.
- Predicción conjunta de un bloque de 16 acciones y del vídeo futuro de la escena (modelo de mundo implícito).
- Control de brazo robótico con efector final en espacio de posición delta y rotación rot6d, más apertura/cierre de pinza.
- Ejecución de tareas de manipulación de horizonte largo (LIBERO-10 incluye cadenas de hasta 10 subtareas).
- Política cerrada lista para evaluación con `lerobot-eval` y el entorno `libero`.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo thinking; el modelo está especializado en robótica.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación comparativa en LIBERO-10: sirve como referencia puntera (97,6 % de éxito) para medir nuevas políticas de manipulación con el mismo protocolo (MuJoCo 2.3.7, robosuite 1.4.0, hf-libero 0.1.4, 50 episodios por tarea). Es adecuado porque el repositorio documenta el comando exacto de evaluación y el setup completo.
- Investigación en modelos de mundo para robótica: la predicción del vídeo futuro permite estudiar cómo la representación visual anticipada mejora la planificación de acciones en tareas de contacto rico.
- Base para fine-tuning en dominios propios: al ser un checkpoint LeRobot con módulos de acción reinicializables, se puede adaptar a nuevos datasets de manipulación manteniendo el backbone Qwen3-VL.
- Prototipado de políticas viso-lenguaje-acción en laboratorio: con una sola GPU A800/H100 de 80 GB se puede reproducir la evaluación documentada, lo que facilita la validación interna antes de desplegar en un robot real.
- Estudio de robustez ante instrucciones de lenguaje natural: LIBERO-10 incluye 10 tareas con instrucciones distintas, lo que permite analizar la sensibilidad de la política a variaciones de prompt.
- Benchmarking de infraestructura de inferencia: al requerir muestreo UniPC con 30 pasos y bloques de 16 acciones, es útil para medir latencia y throughput de pipelines de difusión de acciones en GPUs de datacenter.

## Benchmarks y rendimiento

Resultados publicados en la model card para la suite LIBERO-10 (tasas de éxito en bucle cerrado, 50 episodios por tarea, 500 episodios por suite):

| Modelo | LIBERO-10 |
|---|---|
| Cosmos3-Nano-Policy-LIBERO_10 (este checkpoint) | 97,6 % (488/500) |
| Cosmos3-Edge-Policy-LIBERO_10 | 95,2 % (476/500) |
| Cosmos3-Nano-Policy-LIBERO_10 según TechReport (arXiv 2606.02800) | 97,40 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, lo cual es esperable en una política robótica especializada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 suman aproximadamente 33 GB, por lo que se necesita una GPU con al menos 40 GB de VRAM para cargar el modelo completo sin cuantización; con cuantización a 8 bits cabría en GPUs de 24 GB, aunque no se documentan recetas oficiales de cuantización.
- GPU recomendadas: la evaluación oficial se realizó en una NVIDIA A800-SXM4-80GB; también son adecuadas A100-SXM4-80GB, H100-80GB y, en general, GPUs de datacenter con 80 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en BF16; requeriría cuantización agresiva no documentada.
- Despliegue: el flujo oficial es `lerobot-eval` con el entorno `libero` (MuJoCo 2.3.7, robosuite 1.4.0, hf-libero 0.1.4, Gymnasium 1.3.0), PyTorch 2.11.0+cu128, Transformers 5.5.4 y Diffusers 0.39.0. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI para esta política.
- Latencia y throughput: no disponibles de forma explícita; el muestreo usa UniPC con 30 pasos, guidance scale 1, sampling shift 5 y ejecuta el bloque completo de 16 acciones antes de volver a planificar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-Policy-LIBERO_10 | 16,45 B | no disponible | 97,6 % | OpenMDW 1.1 | Hugging Face (lerobot) |
| Cosmos3-Edge-Policy-LIBERO_10 | no disponible | no disponible | 95,2 % | no disponible | Hugging Face (lerobot) |
| Cosmos3-Nano (base, sin fine-tuning LIBERO) | 16,45 B (formato LeRobot) | no disponible | no disponible | no disponible | Hugging Face (lerobot) |

La información disponible no incluye otros modelos comparables de la misma categoría (políticas viso-lenguaje-acción con predicción de vídeo) fuera del ecosistema Cosmos3.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente en LIBERO-10 (379 episodios, 10 tareas); no se garantiza generalización a otros robots, morfologías o tareas fuera de ese dominio.
- Dependencia del entorno de evaluación: los resultados solo son comparables con MuJoCo 2.3.7; MuJoCo 3.x altera el resultado de tareas de contacto rico y los números dejan de ser equiparables.
- Diferencias numéricas entre `lerobot-eval` y la evaluación nativa: el preprocesador corre en el dispositivo de la política y se activa cuDNN benchmarking, lo que cambia ligeramente las entradas y el muestreo.
- Riesgo de alucinación: como modelo generativo de vídeo y acciones, puede producir predicciones visuales plausibles pero incorrectas; no se documentan métricas de calibración.
- Sesgos: no se documentan análisis de sesgo; el dataset LIBERO-10 tiene un conjunto fijo de 10 tareas y una distribución visual concreta (256x256, 20 FPS), lo que puede introducir sesgos de dominio.
- Idiomas: no se declara soporte multilingüe; las instrucciones de LIBERO están en inglés.
- Licencia: OpenMDW 1.1; es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar tipo Apache 2.0 o MIT.
- Reproducibilidad: el checkpoint se seleccionó por tasa de éxito en LIBERO entre los guardados, lo que puede introducir un sesgo de selección sobre el conjunto de evaluación.
- Sin soporte declarado de tool calling, agentes o razonamiento multi-paso fuera del bucle de control robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/Cosmos3-Nano-Policy-LIBERO_10
- Modelo base en formato LeRobot: https://huggingface.co/lerobot/Cosmos3-Nano
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Nano/tree/e59a53c25979a090fa8706c9acc0c254a6e89b92
- Política Cosmos3-Edge para LIBERO-10: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO_10
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/LIBERO_10-Cosmos3
- Tech report (arXiv): https://arxiv.org/abs/2606.02800
- Commit de LeRobot usado en la evaluación: https://github.com/huggingface/lerobot/commit/d0a20dc38e058a8aa3f7bc48cf32d48bb2f99e5b
- Pull request de LeRobot: https://github.com/huggingface/lerobot/pull/5134
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
