# netprojects/nemotron-dory1.0-4b-mlx-nvfp4

## Resumen

Nemotron-Labs Dory 1.0 4B es un modelo de razonamiento de 4.000 millones de parámetros desarrollado por NVIDIA (a través de Nemotron-Labs) y publicado el 16 de octubre de 2026. Su rasgo distintivo es que se trata de un modelo de lenguaje "en bucle" (looped language model): un bloque compartido de capas se ejecuta entre 1 y 4 veces, 2 por defecto. Esto permite que un único conjunto de pesos ofrezca un dial entre velocidad y precisión: con un solo bucle es más rápido, con cuatro es más preciso, sin necesidad de cargar variantes distintas del modelo.

La ficha que nos ocupa, `netprojects/nemotron-dory1.0-4b-mlx-nvfp4`, no es el modelo original de NVIDIA sino una conversión comunitaria realizada por NetProjects (Internet Projects Ltd) para Apple Silicon. Empaqueta los pesos NVFP4 de 4 bits calibrados por NVIDIA en el formato nativo `nvfp4` de MLX, dando como resultado un repositorio de 2,6 GB que, según el autor, es aproximadamente 1,4 veces más rápido que su build de 8 bits y mantiene la misma perplejidad que bf16. Está pensado para ejecutarse en Macs con chip M-series mediante el paquete `dory-mlx`.

El modelo es relevante porque demuestra dos tendencias convergentes: por un lado, la exploración de arquitecturas no convencionales (capas recurrentes compartidas) para exprimir modelos pequeños en tareas de razonamiento; por otro, la maduración del ecosistema MLX para ejecutar modelos de NVIDIA en hardware de Apple con cuantizaciones de 4 bits de alta fidelidad. El modelo está orientado únicamente a inglés, con entrada y salida de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bloque de capas compartido ejecutado en bucle (looped language model); 1 a 4 pasadas del bloque, 2 por defecto |
| Parámetros totales | 3.975.229.440 (≈4B) |
| Parámetros activos | No aplica (no es MoE); los parámetros efectivos por token varían según el número de bucles |
| Longitud de contexto | No disponible (se han verificado prompts de 16K tokens en las pruebas del autor, pero no se declara un máximo oficial) |
| Tipos de cuantización | NVFP4 de 4 bits (bloques de 16 con escala E4M3 de 8 bits por bloque más una escala por matriz); embeddings y cabeza de salida en 8 bits |
| Idiomas soportados | Inglés únicamente (en) |
| Licencia | OpenMDW-1.1 (heredada del modelo original de NVIDIA); el código de `dory-mlx` es Apache-2.0 |
| Formato de pesos | safetensors, layout fusionado (query/key/value/gate en una matriz; gate/up del MLP en una matriz), optimizado para MLX |

## Arquitectura y entrenamiento

Dory 1.0 4B es un modelo de lenguaje autorregresivo basado en transformer con una modificación estructural clave: un bloque de capas compartido que se recorre en bucle un número configurable de veces (de 1 a 4, con 2 como valor por defecto recomendado por NVIDIA). Al reutilizar el mismo conjunto de pesos en cada pasada, el modelo incrementa su profundidad computacional efectiva sin aumentar el número de parámetros, lo que le permite dedicar más cómputo a la cadena de razonamiento cuando se le pide. Es, en la práctica, una forma de "test-time compute" integrada en la arquitectura.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO) empleadas por NVIDIA. El modelo genera cadenas de razonamiento dentro de etiquetas `<think>...</think>` antes de emitir la respuesta final, lo que sugiere un entrenamiento orientado a razonamiento explícito. La conversión a MLX NVFP4 realizada por NetProjects copia byte a byte los valores de 4 bits y las escalas de bloque del checkpoint original de NVIDIA; en las dos matrices donde la escala por matriz importa (la puerta de salida de atención y la puerta del MLP), dicha escala se pliega en las escalas por canal ya existentes. El autor reporta un error relativo de 0,08 al de-cuantizar frente a los pesos bf16 de NVIDIA (un layout incorrecto daría 1,4) y una perplejidad en WikiText-2 de 11,59 con 2 bucles, idéntica a la del build bf16 (11,62).

## Capacidades

- Generación de texto en inglés con cadena de razonamiento explícita previa a la respuesta (modo "thinking" integrado mediante `<think>`).
- Razonamiento multi-paso: el dial de bucles (1 a 4) permite asignar más cómputo a problemas complejos.
- Aritmética y matemáticas básicas: el autor verifica que responde correctamente a "17 × 23 = 391".
- Razonamiento de sentido común y explicaciones (ejemplo de la model card: explicar por qué el cielo es azul).
- Conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto.
- Multilingüismo: limitado a inglés.

## Casos de uso

- Razonamiento asistido en local para desarrolladores: ejecutar el modelo en un MacBook con chip M-series para resolver problemas de lógica, matemáticas o explicaciones técnicas sin conexión a la nube, ajustando el número de bucles según la dificultad del problema.
- Prototipado rápido de aplicaciones de razonamiento en Apple Silicon: gracias a los 2,6 GB del build NVFP4 y a los 99 tokens/s con 2 bucles en un M5 Max, es viable iterar sobre prompts y flujos de razonamiento en el propio portátil.
- Educación y tutoría: el modelo produce cadenas de razonamiento visibles que pueden mostrarse al usuario para explicar cómo llega a una respuesta, útil en asistentes de aprendizaje de matemáticas o ciencias.
- Evaluación de arquitecturas looped: investigadores que quieran medir el efecto del número de bucles sobre la calidad (la model card aporta perplejidades para 1, 2 y 4 bucles) pueden usar este build como banco de pruebas reproducible.
- Generación de texto con restricciones de memoria: con 6,1 GB de pico de memoria para un prompt de 16K tokens a 1 bucle, encaja en equipos Apple con 16 GB o más, permitiendo procesar documentos largos en local.
- Procesamiento por lotes de documentos en inglés: la velocidad de lectura de prompt (hasta 4.130 tokens/s a 1 bucle) permite preprocesar corpus de texto moderadamente largos en hardware de consumo.
- Base para fine-tuning o experimentación con MLX: al ser un checkpoint MLX nativo con layout fusionado, sirve como punto de partida para trabajos que necesiten un modelo de 4B cuantizado a 4 bits en el ecosistema de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card remite a la model card original de NVIDIA para los resultados de precisión. Sí se aportan métricas de calidad y rendimiento medidas por el autor de la conversión:

| Métrica | NVFP4 (este build) | 8-bit | bf16 |
|---|---|---|---|
| Tamaño | 2,6 GB | 4,2 GB | 8,0 GB |
| Generación (2 bucles, prompt corto) | 99 tokens/s | 69 tokens/s | 39 tokens/s |
| Perplejidad WikiText-2 (2 bucles) | 11,59 | 11,64 | 11,62 |
| Perplejidad WikiText-2 (1 / 4 bucles) | 12,01 / 11,52 | 12,05 / 11,58 | 12,04 / 11,56 |
| Coincidencia top-1 con bf16 (1 / 2 / 4 bucles) | 88,5% / 88,9% / 89,0% | 97% (2 bucles) | — |
| KL frente a bf16 (1 / 2 / 4 bucles) | 0,064 / 0,061 / 0,063 | no disponible | — |

Rendimiento por número de bucles en M5 Max (128 GB), decodificación greedy, mediana de 3 ejecuciones:

| Bucles | Generación, prompt corto | Generación tras prompt de 16K | Lectura de prompt de 16K | Memoria pico (16K) |
|---|---|---|---|---|
| 1 | 149 tokens/s | 124 tokens/s | 4.130 tokens/s | 6,1 GB |
| 2 | 99 tokens/s | 82 tokens/s | 2.600 tokens/s | 7,3 GB |
| 4 | 59 tokens/s | 49 tokens/s | 1.500 tokens/s | 9,8 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 6,1 GB de pico con prompt de 16K y 1 bucle; 7,3 GB con 2 bucles; 9,8 GB con 4 bucles (medido en M5 Max con 128 GB).
- Hardware objetivo: Apple Silicon (M-series). El autor lo construyó y probó en un MacBook Pro M5 Max de 128 GB; con 16 GB de memoria unificada debería caber holgadamente para prompts cortos.
- GPU NVIDIA: el formato es MLX, por lo que no se ejecuta directamente en CUDA; para NVIDIA habría que usar el checkpoint original `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4` o el bf16.
- Cabe en GPU de consumo: sí, en el ecosistema Apple (cualquier Mac con 16 GB o más). Para GPUs discretas de consumo (RTX 4090, etc.) no aplica este build; el checkpoint NVFP4 original requeriría herramientas compatibles con ese formato.
- Opciones de despliegue: paquete `dory-mlx` (instalable desde GitHub con `pip install "git+https://github.com/internet-projects/dory-mlx"`), sobre MLX 0.32.4 y mlx-lm 0.32.2. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este build.
- Latencia y throughput: 99 tokens/s de generación con 2 bucles y prompt corto; 82 tokens/s tras un prompt de 16K; 2.600 tokens/s de prefill a 2 bucles. A 1 bucle, 149 tokens/s de generación y 4.130 tokens/s de lectura de prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Labs Dory 1.0 4B (este build, MLX NVFP4) | 3,97B | no disponible | 4 bits NVFP4 | OpenMDW-1.1 | Hugging Face (netprojects) |
| Nemotron-Labs Dory 1.0 4B MLX 8-bit (netprojects) | 3,97B | no disponible | 8 bits | OpenMDW-1.1 | Hugging Face (netprojects) |
| Nemotron-Labs Dory 1.0 4B MLX bf16 (netprojects) | 3,97B | no disponible | bf16 | OpenMDW-1.1 | Hugging Face (netprojects) |
| NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4 (original) | 3,97B | no disponible | 4 bits NVFP4 | OpenMDW-1.1 | Hugging Face (nvidia) |
| NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 (original) | 3,97B | no disponible | bf16 | OpenMDW-1.1 | Hugging Face (nvidia) |

No se dispone de datos para comparar con modelos de otras familias (por ejemplo, Qwen, Llama o Gemma de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta castellano ni otros idiomas, lo que limita su uso en productos dirigidos al mercado hispanohablante.
- Riesgo de alucinación: es un modelo de 4B con razonamiento explícito; las cadenas `<think>` pueden contener pasos plausibles pero incorrectos, y no se han publicado evaluaciones de fiabilidad factual.
- Respuestas más largas de lo habitual: al incluir la cadena de razonamiento, el consumo de tokens y la latencia percibida son mayores que en un modelo de chat convencional.
- Fidelidad de la cuantización: la coincidencia top-1 con bf16 es del 89% con 2 bucles, no del 100%; para aplicaciones que requieran la máxima fidelidad al modelo original, el autor recomienda el build de 8 bits (97% de coincidencia).
- Licencia OpenMDW-1.1: es una licencia "other" que debe revisarse antes de uso comercial; no es Apache-2.0 ni MIT. El código de `dory-mlx` sí es Apache-2.0.
- Ecosistema restringido: depende de MLX y de un paquete mantenido por un tercero (`dory-mlx`), no de frameworks de despliegue estándar como vLLM o TGI; la compatibilidad futura no está garantizada.
- No afiliado a NVIDIA: la conversión es comunitaria; los problemas de soporte deben dirigirse a NetProjects, no a NVIDIA.
- Longitud de contexto no declarada: aunque se han probado prompts de 16K, no se especifica el máximo oficial, lo que dificulta dimensionar aplicaciones de contexto largo.
- Sin datos de benchmarks estándar: no hay resultados de MMLU, HumanEval o GSM8K en la información disponible, lo que impide comparar su calidad objetiva con otros modelos de 4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-nvfp4
- Modelo base original (NVFP4): https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Modelo base original (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Build MLX 8-bit: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-8bit
- Build MLX bf16: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-bf16
- Repositorio dory-mlx en GitHub: https://github.com/internet-projects/dory-mlx
- Organización NetProjects en Hugging Face: https://huggingface.co/netprojects
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Página de NetProjects sobre uso de IA: https://netprojects.com/standards/ai
