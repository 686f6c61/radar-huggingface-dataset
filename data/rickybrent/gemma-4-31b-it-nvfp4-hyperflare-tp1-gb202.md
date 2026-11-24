# rickybrent/Gemma-4-31B-IT-NVFP4-HYPERFLARE-TP1-gb202

## Resumen

Gemma 4 31B IT NVFP4 HYPERFLARE TP1 gb202 es un paquete de ejecución (runtime package) preparado por el usuario rickybrent para servir el checkpoint `nvidia/Gemma-4-31B-IT-NVFP4` —la cuantización NVFP4 realizada por NVIDIA del modelo `google/gemma-4-31B-it`— sobre una única tarjeta RTX PRO 6000 Blackwell (GB202, SM120, 96 GB) con paralelismo tensorial TP1. No se trata de un modelo nuevo, sino de una distribución empaquetada que incluye pesos, recetas de inferencia y un ejecutable propio del runtime Hyperflare de NVIDIA.

El paquete incorpora trabajo de ingeniería específico para Gemma 4: frontend de imagen nativo, torre de visión de 27 bloques en BF16, KV circular de ventana deslizante en FP8 y decodificación split-KV para las capas de atención global. El resultado práctico es una ventana de contexto por petición de 262.144 tokens y un pool de KV de 1.542.144 tokens sobre una sola GPU de 96 GB, algo que el checkpoint base no alcanza con la configuración estándar.

Es relevante ahora porque demuestra cómo una cuantización NVFP4 de un modelo multimodal de 31B puede servirse con contexto largo real (256K) en hardware Blackwell de gama profesional, con latencias de primera respuesta en el orden de 0,16–0,36 s en comprobaciones de imagen y un throughput de decodificación agregado de hasta 167 tok/s con concurrencia 4. El paquete es una vista previa: depende de un binario incluido porque las builds públicas de Flare aún no contienen el stack de visión ni el KV circular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con 50 capas de atención deslizante y 10 capas de atención global; torre de visión de 27 bloques BF16 |
| Parametros totales | 31B (según denominación del checkpoint base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens por petición (contexto de servicio del paquete) |
| Tipos de cuantizacion | NVFP4 (ModelOpt) solo en MLP; atención y visión en BF16; KV circular en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (license: other con license_name apache-license-2.0, enlace a ai.google.dev/gemma/apache_2) |
| Formato de pesos | Pesos NVFP4 empaquetados en el directorio `core` del paquete (~32 GB; 31,3 GiB de pesos); revisión `gb202` con el payload, rama `main` solo con metadatos |

## Arquitectura y entrenamiento

La información disponible no documenta el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO); solo describe el empaquetado y la puesta en servicio. El checkpoint procede de `google/gemma-4-31B-it`, cuantizado a NVFP4 por NVIDIA mediante ModelOpt, con cuantización aplicada únicamente a las capas MLP mientras atención y visión permanecen en BF16.

La innovación técnica del paquete reside en el motor de inferencia Hyperflare. Las 50 capas de atención deslizante almacenan una ventana circular fija de `sliding_window = 1024` en FP8 dentro de cada fila de continuación, en lugar del historial completo; esto eleva el pool de KV de aproximadamente 143K tokens NVFP4 a 1.542.144 tokens con un presupuesto de caché de 60,84 GiB. Las 10 capas de atención global usan decodificación split-KV en Triton con dimensión 512 y una ruta de verificación, sustituyendo dos llamadas de atención de prefill con padding. El frontend de imagen realiza preprocesado nativo de Gemma 4 (parches de 16x16, fusión 3x3, posiciones `[x, y]`, tokens de imagen atómicos) y atención deslizante por filas de imagen. Se incluye decodificación especulativa MTP con anchos 1–6 y verificación adaptativa, 62 grafos CUDA capturados, chunk de prefill de 4.096 tokens y una corrección de tiling en `state_transfer._copy_rows` compilada en el kernel de filas de continuación.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno (pipeline `image-text-to-text`).
- Comprensión de imágenes: hasta 4 imágenes por petición, con 2 peticiones de imagen preparadas simultáneamente; identificación de formas y colores en las pruebas publicadas.
- Contexto largo de hasta 262.144 tokens por petición, con prefijo cacheado entre turnos (se observan `cached_tokens` de 2.125–2.286 en las comprobaciones).
- Decodificación especulativa MTP con anchos 1–6 y verificación adaptativa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia sobre documentos extensos con imágenes intercaladas: el contexto de 262.144 tokens y el prefijo cacheado permiten procesar informes o manuales largos junto con figuras en una sola petición, manteniendo la latencia de prefill en 1.980 tok/s a 128K.
- Análisis de capturas y diagramas en flujos de soporte técnico: el frontend de imagen nativo y la atención deslizante por filas permiten describir y comparar hasta 4 imágenes por petición, con primera respuesta en 0,36 s en la prueba de cuatro imágenes.
- Chat multi-turno con memoria de imágenes: la caché de prefijo con envolvente circular mantiene el contexto visual entre turnos (Turn 2 con `cached_tokens=2286` en 0,31 s), adecuado para sesiones de diagnóstico iterativo.
- Servicio de inferencia en una sola GPU profesional: con 32,97 GiB cargados por GPU y 60,84 GiB de presupuesto de caché, cabe holgadamente en una RTX PRO 6000 Blackwell de 96 GB, lo que simplifica el despliegue frente a configuraciones multi-GPU.
- Procesamiento por lotes de pares imagen-texto: la concurrencia de 4 peticiones de texto y 2 de imagen preparadas, con 167,1 tok/s agregados a concurrencia 4 en contexto 0K, sirve para tareas de etiquetado o extracción de información a escala moderada.
- Evaluación de cuantización NVFP4 en producción: el paquete permite medir el impacto de cuantizar solo MLP en tareas multimodales y de contexto largo antes de adoptar NVFP4 en pipelines propios.
- Investigación sobre KV circular y decodificación split-KV: sirve como referencia reproducible para estudiar el intercambio entre ventana deslizante fija y atención global en modelos híbridos de atención.

## Benchmarks y rendimiento

Rendimiento de prefill medido en el paquete firmado (una RTX PRO 6000 Blackwell de 96 GB, SM120, TP1):

| Prefill | 8K | 16K | 32K | 64K | 128K |
|---|---:|---:|---:|---:|---:|
| tok/s | 5.935 | 5.113 | 4.155 | 3.054 | 1.980 |

Decodificación agregada (tok/s) por concurrencia:

| Decode, tok/s agregados | C1 | C2 | C4 |
|---|---:|---:|---:|
| 0K | 44,0 | 86,2 | 167,1 |
| 16K | 43,0 | 83,5 | 159,2 |
| 32K | 42,2 | 81,5 | 153,7 |
| 64K | 40,8 | 78,6 | 143,3 |
| 128K | 38,2 | 72,8 | 125,2 |

Comprobaciones de imagen (primer token hasta respuesta, `temperature=0`):

| Comprobación | Tiempo | Resultado |
|---|---:|---|
| Imagen única (círculo rojo + cuadrado azul) | 0,18 s | `There is a red circle and a blue square.` |
| Prefijo de 2.132 tokens + imagen | 0,29 s | `The image shows a red circle.` (`cached_tokens=2125`, `image=256`) |
| Multi-turno con prefijo cacheado + imagen en turno 2 | 0,31 s | `(1) QUARTZ-941\n(2) A green triangle` (`cached_tokens=2286`) |
| Dos imágenes | 0,34 s | círculo rojo y cuadrado azul distinguidos |
| Cuatro imágenes | 0,36 s | `1. Red circle\n2. Blue square\n3. Green triangle\n4. Yellow diamond` |
| Solo texto | 0,16 s | `Hello! How can I help you today?` |
| Dos peticiones de imagen simultáneas | 0,33 s de pared | círculo rojo / triángulo verde, sin contaminación cruzada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- GPU: una RTX PRO 6000 Blackwell (GB202, SM120) con 96 GB de VRAM; el paquete está preparado para TP1 y selecciona la revisión `gb202` automáticamente en dispositivos GB202.
- VRAM: 32,97 GiB de pesos cargados por GPU más un presupuesto de caché KV de 60,84 GiB (pool de 1.542.144 tokens, 148 slots de snapshot compartidos).
- No cabe en GPUs de consumo convencionales: el requisito de 96 GB y la compilación para SM120 excluyen tarjetas como la RTX 4090 (24 GB, arquitectura anterior).
- Despliegue: runtime Hyperflare con el ejecutable incluido `runner/flare-linux-x86_64` (SHA-256 `390b0768baace416ac443c8be70305ce2196ccbcd93bebefa060858ff84da41e`); las builds públicas de Flare no sirven este paquete. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: carga en frío de pesos en 3,4 s y servidor operativo en unos 5 s; prefill de 5.935 tok/s a 8K y 1.980 tok/s a 128K; decodificación de 44,0 tok/s a concurrencia 1 y 167,1 tok/s a concurrencia 4 en contexto 0K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 31B IT NVFP4 HYPERFLARE TP1 (este paquete) | 31B | 262.144 tokens por petición | NVFP4 en MLP, BF16 en atención/visión, KV FP8 | Apache 2.0 | Paquete de vista previa con ejecutable incluido; requiere GB202 de 96 GB |
| nvidia/Gemma-4-31B-IT-NVFP4 (checkpoint base) | 31B | no disponible | NVFP4 (ModelOpt) | Apache 2.0 | Pesos en Hugging Face; pool KV de ~143K tokens según el autor |
| google/gemma-4-31B-it (modelo original) | 31B | no disponible | BF16 | Apache 2.0 (según enlace de licencia) | Pesos en Hugging Face; sin empaquetado de runtime específico |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Paquete de vista previa: depende del ejecutable incluido y de cambios no fusionados (frontend de imagen, KV circular, cableado de recetas); las builds publicadas de Flare no pueden servir este paquete hasta que se fusionen los pull requests.
- Hardware muy restringido: exige una RTX PRO 6000 Blackwell (GB202, SM120, 96 GB) y TP1; no hay soporte documentado para otras GPUs ni para despliegues multi-nodo.
- Cuantización parcial: solo las capas MLP están en NVFP4; el impacto de esta cuantización en tareas de razonamiento o generación de código no está evaluado en la información disponible.
- Las comprobaciones publicadas son cualitativas y de baja complejidad (formas geométricas, saludos); no hay evaluación de sesgos, alucinación ni robustez en tareas abiertas.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- La licencia figura como `other` con nombre Apache 2.0 y enlace a los términos de Gemma de Google; conviene revisar dichos términos antes de uso comercial, ya que la información disponible no aclara completamente las condiciones.
- Proyecto personal: el autor declara explícitamente que no es un producto de Google y que parte del trabajo del motor es upstream de terceros.
- La rama `main` solo contiene metadatos; el payload real está en la revisión `gb202`, lo que puede confundir a herramientas de descarga automática.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/rickybrent/Gemma-4-31B-IT-NVFP4-HYPERFLARE-TP1-gb202
- Checkpoint base NVFP4: https://huggingface.co/nvidia/Gemma-4-31B-IT-NVFP4
- Modelo original: https://huggingface.co/google/gemma-4-31B-it
- Runtime Hyperflare: https://github.com/NVIDIA/hyperflare-inference
- Repositorio del autor con el runner: `rickybrent/hyperflare-inference` (rama `gemma4-combined`, commit `feb712de`)
- Licencia: https://ai.google.dev/gemma/apache_2
