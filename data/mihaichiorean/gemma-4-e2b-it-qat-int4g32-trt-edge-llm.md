# mihaichiorean/gemma-4-E2B-it-qat-int4g32-TRT-Edge-LLM

## Resumen

Gemma 4 E2B es un modelo multimodal de Google (entrada de texto e imagen) de la familia Gemma 4, en su variante E2B con cuantización QAT (quantization-aware training) en formato Q4_0. Este repositorio, publicado por el usuario mihaichiorean, no contiene los pesos originales en formato estándar, sino un conjunto de artefactos precompilados para TensorRT Edge-LLM: motores de inferencia (engines), binarios de runtime, tablas de embeddings en INT8 y exportaciones ONNX, todo orientado a ejecutar el modelo en una Jetson Orin Nano de 8 GB sin necesidad de compilar nada.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo multimodal con capacidades de razonamiento en hardware de borde (edge) con 8 GB de memoria unificada, manteniendo una fidelidad de precisión del 99,8 % respecto al modelo sin cuantizar en MMLU (55,36 % frente a 55,48 %). El repositorio incluye tres variantes de motor con distintas longitudes de contexto (2k, 8k y 32k tokens de KV) y un codificador visual en FP16.

El proyecto es una compilación comunitaria a partir de un fork de TensorRT Edge-LLM de NVIDIA, no una release oficial de NVIDIA ni de Google. Está publicado bajo licencia Apache 2.0 y el tamaño total del repositorio es de 16,1 GB. No se dispone de información sobre el número de parámetros totales ni sobre los idiomas soportados en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLM + codificador visual), detalles no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2.048 tokens de entrada / 4.096 KV; 8.192 / 10.240 KV; 8.192 / 33.792 KV (tres motores) |
| Tipos de cuantización | INT4 con escala FP16 por grupo de 32 pesos (capas lineales y cabeza de salida); INT8 con escala por fila (tablas de embedding); FP16 (atención, normas, activaciones y codificador visual) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Motores TensorRT (`llm.engine`, `visual.engine`), ONNX (`model.onnx` + `model.onnx.data`), safetensors (tablas de embeddings INT8) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it-qat-q4_0-unquantized`, un checkpoint de Gemma 4 con entrenamiento consciente de cuantización (QAT) sobre la rejilla Q4_0. Este repositorio no reentrena ni recalibra: importa directamente los códigos y escalas QAT del checkpoint original, verificando que las 58.650.624 grupos de las 276 tensores lineales y los 12.582.912 grupos de la cabeza de salida atada caen exactamente sobre la rejilla de cuantización. No hay AWQ ni re-redondeo.

La arquitectura combina un decodificador transformer con capas de atención compartida de KV y un codificador visual separado en FP16. Las capas lineales del decodificador y la cabeza de salida usan INT4 con una escala FP16 por grupo de 32 pesos; las tablas de embedding de tokens y de embedding por capa (PLE) se almacenan en INT8 con escalas por fila y se mantienen en el lado de CPU con memory-mapping (`--hostEmbeddingTables`). La atención, las normas y las activaciones se ejecutan en FP16. La exportación aplica una optimización denominada "prefill compaction": durante el prefill solo se calcula el último token del prompt en las capas de KV compartida, lo que acelera el prefill sin alterar las salidas. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Generación de texto y razonamiento conversacional (modelo instruct, `-it`).
- Entrada de imagen y texto (pipeline `image-text-to-text`), con codificador visual en FP16.
- Modo "thinking" (razonamiento extendido), para el que se ofrece el motor de 32k de contexto KV.
- Comprensión de imágenes mediante el motor visual precompilado.
- Ejecución en hardware de borde con memoria unificada de 8 GB.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en dispositivos de borde: el modelo recibe una imagen de cámara y una pregunta en texto, y responde en la propia Jetson Orin Nano. El motor visual FP16 y el LLM INT4 caben en los 8 GB de memoria unificada, con 2,9 GiB de pico y 4,4 GiB disponibles.
- Detección y descripción en tiempo real con cámara: el repositorio documenta la ejecución conjunta con un detector de cámara a 15 fps compartiendo GPU, con unos 305 ms de prefill y 35 ms por paso de decodificación, lo que permite pipelines de visión y lenguaje en el mismo dispositivo.
- Razonamiento extendido en el borde: el motor de 32k de contexto KV (8.192 de entrada) está pensado para "long thinking", útil para tareas de análisis que requieren cadenas de razonamiento largas sin salir del dispositivo.
- Procesamiento de documentos largos: el motor de 8k de entrada y 10.240 KV permite resumir o extraer información de documentos de varias páginas en local.
- Despliegue en robótica y vehículos autónomos basados en Jetson: al estar compilado para SM 8.7 (aarch64) y JetPack 7.2.1, se integra en stacks de robótica que ya usan la Orin Nano.
- Evaluación y prototipado de modelos multimodales sin infraestructura de servidor: los binarios y motores precompilados permiten arrancar el modelo sin compilar, reduciendo el tiempo de puesta en marcha a la carga de los ficheros.
- Comparación de rendimiento frente a llama.cpp en el mismo dispositivo: el repositorio ofrece datos de referencia (pp512 4.442 frente a 992,9 tok/s; tg128 43,9 frente a 28,32 tok/s) útiles para decidir el runtime en producción.

## Benchmarks y rendimiento

Datos de MMLU completo (14.042 preguntas, zero-shot, plantilla de chat, 16 tokens nuevos, greedy, thinking desactivado) medidos con el harness de precisión de TensorRT Edge-LLM:

| Modelo | Dispositivo | Correctas | MMLU | % del original | Respuestas parseadas a letra |
|---|---|---|---|---|---|
| Original (FP16 pesos, FP16 tablas) | AGX Orin | 7.791 | 55,48 % | 100 % | 12.019 (85,6 %) |
| Este build | Orin Nano | 7.773 | 55,36 % | 99,8 % (p emparejado = 0,60) | 12.258 (87,3 %) |

Subconjunto fijo de 500 preguntas MMLU (turno de sistema pidiendo solo la letra, 16 tokens, greedy, AGX Orin, mismo ONNX): 53,60 % frente a 54,60 % del original (98,2 %, p emparejado = 0,60).

Rendimiento en Orin Nano 8 GB a 25 W:

| Métrica | Este build | llama.cpp (Q4_K_M) |
|---|---|---|
| Prefill de prompt de 846 tokens | 199 ms | no disponible |
| Paso de decodificación | 23,4 ms (42,7 tok/s derivados) | no disponible |
| pp512 | 4.442 tok/s | 992,9 tok/s |
| tg128 | 43,9 tok/s | 28,32 tok/s |
| Con detector de cámara a 15 fps compartiendo GPU | ~305 ms prefill, ~35 ms por paso | no disponible |

Memoria: 2,9 GiB de pico con el motor de 2k, dejando 4,4 GiB disponibles (incluida page cache reclamable de las tablas mapeadas). Tamaños: motor LLM 1,31 GB, tablas 2,79 GB.

## Requisitos de hardware

- VRAM/memoria: 2,9 GiB de pico con el motor de 2k en Orin Nano 8 GB; el motor LLM ocupa 1,31 GB y las tablas 2,79 GB.
- GPU objetivo: Jetson Orin Nano 8 GB (SM 8.7, aarch64). Los motores fueron construidos y validados en ese dispositivo.
- GPU recomendadas: Jetson Orin Nano 8 GB; el modelo original se midió en AGX Orin para la comparación de precisión.
- ¿Cabe en GPU de consumo? Los binarios están compilados para aarch64 y SM 8.7; no se indica compatibilidad con GPU de consumo x86 (RTX 4090, etc.). Para otras plataformas hay que reconstruir desde `onnx/`.
- Stack software exacto requerido: JetPack 7.2.1 (L4T R39.2.1), TensorRT 10.16.2.10, CUDA 13.2, y el binario `llm_inference` más el plugin de `bin/`. En cualquier otra combinación, los motores no cargan y hay que reconstruir.
- Opciones de despliegue: TensorRT Edge-LLM (runtime propio del repositorio); exportación ONNX disponible para reconstruir motores; comparativa documentada frente a llama.cpp.
- Latencia y throughput: 199 ms de prefill para 846 tokens, 23,4 ms por paso de decodificación (42,7 tok/s derivados) en Orin Nano a 25 W; con detector de cámara a 15 fps, ~305 ms y ~35 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B QAT INT4 (este build) | no disponible | 2k/8k/32k KV | 55,36 % (Orin Nano) | Apache 2.0 | Motores TensorRT precompilados para Orin Nano |
| Gemma 4 E2B QAT original (FP16) | no disponible | no disponible | 55,48 % (AGX Orin) | Apache 2.0 | Checkpoint en Hugging Face |
| llama.cpp Q4_K_M (unsloth) | no disponible | no disponible | no disponible | no disponible | Ejecutable en Orin Nano |

No se dispone de información sobre otros modelos multimodales de tamaño comparable en la documentación proporcionada.

## Limitaciones y advertencias

- Los motores solo cargan con el stack exacto JetPack 7.2.1, TensorRT 10.16.2.10 y CUDA 13.2; cualquier otra versión requiere reconstruir desde `onnx/`.
- Los binarios están compilados para aarch64 y SM 8.7; no hay artefactos para x86 ni para otras arquitecturas de GPU.
- Es una compilación comunitaria de un fork, no una release oficial de NVIDIA ni de Google; no hay garantía de soporte.
- La fidelidad del 99,8 % en MMLU está influida por la tasa de parseo: este build responde con una letra parseable el 87,3 % de las veces frente al 85,6 % del original. En las 11.796 preguntas donde ambos dieron letra, el original puntúa 64,98 % y este build 63,94 % (1,0 punto menos, p = 3,5e-05).
- El harness de evaluación por defecto (5-shot, un token nuevo) puntúa cerca del azar porque el modelo empieza la respuesta con "Here" o "The" en lugar de una letra; los resultados deben interpretarse con esta cautela.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas del modelo base en la documentación proporcionada.
- La licencia Apache 2.0 del repositorio no exime de verificar los términos del modelo base de Google para uso comercial.
- El repositorio tiene 36 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mihaichiorean/gemma-4-E2B-it-qat-int4g32-TRT-Edge-LLM
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- TensorRT Edge-LLM de NVIDIA (fork de referencia): no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
