# artisticalien17/DaisyRose-27B-NInfer-NVFP4

## Resumen

DaisyRose-27B-NInfer-NVFP4 es una conversión no oficial del modelo RadixArk/DaisyRose-27B, un ajuste fino orientado a tareas agénticas y de razonamiento entrenado mediante aprendizaje por refuerzo sobre la base Qwen3.8-27B. Este repositorio, publicado por el usuario artisticalien17, no modifica los pesos del modelo original: únicamente los reempaqueta en un artefacto único del formato NInfer v3, un runtime de inferencia optimizado para GPUs Blackwell (SM120).

El interés de esta conversión es práctico: permite ejecutar un modelo multimodal de 27.000 millones de parámetros con contexto largo (hasta 180.224 tokens de caché KV) en una sola GPU de 24 GB, como una RTX 5090 o una RTX PRO 6000, manteniendo decodificación especulativa MTP y cuantización NVFP4 en las capas MLP. Los pesos ocupan aproximadamente 18,5 GiB en GPU.

La relevancia actual radica en que demuestra que es viable desplegar modelos de razonamiento con ventana de contexto de más de 170.000 tokens en hardware de consumo de gama alta, con velocidades de decodificación de entre 50 y 86 tokens por segundo según el tipo de contenido y la longitud de contexto. Al ser una conversión de formato, todas las capacidades, sesgos y limitaciones del modelo original se conservan intactas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-27B, con atención completa y capas Gated DeltaNet; incluye cabeza MTP para decodificación especulativa y codificador de visión |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 180.224 tokens de caché KV compartida (196.608 falla en arranque con 4 carriles); contexto máximo de servicio configurable |
| Tipos de cuantizacion | NVFP4 (MLP, 64 capas), FP8 E4M3 (proyecciones de atención completa y Gated DeltaNet), FP8 row-wise (lm_head y embeddings), Q8/Q6/Q5/Q4 en grupo (codificador de visión y cabeza MTP), BF16/FP32 (normas, convoluciones GDN, dt_bias, A_log) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefacto NInfer v3 (`.ninfer`), con JSON de conversión por tensor, receta de conversión, parche del conversor y sumas SHA256 |

## Arquitectura y entrenamiento

El modelo base, RadixArk/DaisyRose-27B, es un ajuste fino de Qwen3.8-27B entrenado con aprendizaje por refuerzo y orientado a comportamiento agéntico. La arquitectura subyacente combina capas de atención completa con capas Gated DeltaNet, e incorpora un codificador de visión (lo que habilita la modalidad image-text-to-text) y una cabeza MTP (Multi-Token Prediction) que actúa como modelo borrador para decodificación especulativa. No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el proceso exacto de RLHF o DPO en la información proporcionada.

Esta conversión concreta no altera el entrenamiento: solo cambia el formato de los pesos. Las diferencias respecto al checkpoint fuente son dos. Primero, las escalas FP8: el origen almacena una escala FP32 por tensor, mientras que NInfer espera una escala BF16 por fila, por lo que la escala única se replica en cada fila, con una diferencia máxima de redondeo de aproximadamente el 0,2 % por tensor y códigos FP8 idénticos bit a bit. Segundo, el `lm_head`: al no existir kernel NVFP4 para la cabeza de salida de ancho de vocabulario, se recuantizó a FP8 desde los pesos BF16 originales, igualando la receta oficial de Qwen3.8-27B NInfer NVFP4. La innovación técnica destacable es la decodificación especulativa MTP con 3 tokens borrador y una caché KV en formato NVFP4.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) activado por defecto, capaz de producir cadenas de razonamiento muy largas.
- Generación y depuración de código en tareas de ingeniería de software: motores SQL, motores cron, parsers HTTP, resolutores de dependencias, almacenes MVCC con control de concurrencia.
- Razonamiento agéntico multi-paso: resolución de bugs y desarrollo de funcionalidades sobre repositorios existentes.
- Capacidad multimodal de entrada de imagen y texto (image-text-to-text), habilitada con el flag `--vision` en el servidor.
- Decodificación especulativa MTP integrada en el runtime para acelerar la generación.
- Soporte de contexto largo: recuperación de información (needle retrieval) verificada con prompts de 173.801 tokens.
- Servidor compatible con la API de OpenAI en `/v1`, apto para integración con clientes estándar.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada; el modelo base está descrito como ajuste fino agéntico, pero no se detalla el mecanismo.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de programación sobre repositorios grandes: el modelo puede cargar decenas de miles de tokens de código fuente en su contexto de hasta 180.224 tokens y resolver bugs o implementar funcionalidades, como demuestra el benchmark agéntico sobre un repositorio de pagos (46/47) y uno de SQLite (25/25).
- Generación de motores de bases de datos y componentes de infraestructura: los resultados en el benchmark privado (motor SQL 18/30, motor cron 41/43, almacén MVCC 24/24) indican que es adecuado para implementar lógica de sistemas con requisitos semánticos precisos, como la lógica de tres valores en NULL.
- Análisis de documentos extensos con imágenes: al combinar contexto largo y entrada de imagen, puede procesar informes, capturas o diagramas junto con texto largo en una sola pasada.
- Automatización de tareas de refactorización y migración: con contexto de 100k tokens mantiene 76 tok/s en código, lo que permite iterar sobre ficheros grandes sin truncar.
- Despliegue en estaciones de trabajo con una sola GPU de consumo: gracias a los 18,5 GiB de pesos y la caché KV NVFP4, cabe en una RTX 5090 de 24 GB, lo que facilita prototipado local de agentes sin infraestructura de centro de datos.
- Servicio de razonamiento por lotes con concurrencia moderada: el servidor NInfer admite 4 carriles compartiendo la caché KV, adecuado para equipos pequeños que necesiten una API compatible con OpenAI autoalojada.
- Evaluación de modelos agénticos en sandbox: el runtime permite fijar presupuestos de pensamiento por servidor (`--default-thinking-budget`), útil para reproducir experimentos de razonamiento con límites controlados.

## Benchmarks y rendimiento

Rendimiento medido en una única GPU SM120 de 24 GB, con caché KV NVFP4, MTP con 3 tokens borrador y 4 carriles:

| Prueba | Resultado |
|---|---|
| Mayor caché KV que arranca (4 carriles) | 180.224 tokens (196.608 falla) |
| Recuperación needle con prompt de 173.801 tokens | Encontrado; VRAM pico 23,5 GB |
| Decodificación, código: contexto corto / 100k | 86 / 76 tok/s (aceptación MTP ~79 %) |
| Decodificación, prosa: contexto corto / 100k | 58 / 50 tok/s (aceptación MTP ~41 %) |
| Prefill a 100k de contexto | ~2.240 tok/s |

Benchmark privado de codificación y agente (suites pytest ocultas en sandbox Docker offline; temperatura 0,6, top_p 0,95, presupuesto de pensamiento de 16.384 tokens en código y 6.144 por turno agéntico; línea base Qwen3.8-27B NVFP4 NInfer con DFlash2):

| Tarea | DaisyRose (este repo) | Qwen3.8-27B NInfer baseline |
|---|---|---|
| Motor SQL (joins, GROUP BY, NULL de 3 valores) | 18/30 | 4/30 |
| Motor cron (L, #n, regla OR DOM/DOW) | 41/43 | 30/43 |
| WAL segmentado + recuperación de fallos | 24/24 | 24/24 |
| Parser HTTP/1.1, anti-smuggling | 37/56 | 55/56 |
| npm semver + resolutor con backtracking | 85/89 | 87/89 |
| Almacén MVCC (SI + serializable, GC) | 24/24 | 23/24 |
| Total codificación | 229/266 | 223/266 |
| Agéntico: repositorio de pagos (5 bugs + feature) | 46/47 | 47/47 |
| Agéntico: repositorio SQLite (bloqueo optimista) | 25/25 | 25/25 |

El autor advierte que son ejecuciones únicas sobre una suite privada y deben interpretarse como indicativas, no definitivas.

## Requisitos de hardware

- GPU NVIDIA Blackwell (SM120): RTX 5090, RTX PRO 6000 o clase DGX Spark, con 24 GB de VRAM o más.
- Los pesos ocupan aproximadamente 18,5 GiB en GPU; con la caché KV de 180.224 tokens en NVFP4 el pico medido es de 23,5 GB.
- No cabe en GPUs consumer de generaciones anteriores (Ada, Ampere) por la dependencia de kernels NVFP4 y SM120.
- El modo visión requiere VRAM adicional, por lo que hay que reducir el contexto si se activa `--vision`.
- Despliegue exclusivamente mediante el runtime NInfer en el commit `4de9e42599b3f1fb893cac64a063e6f7d2581515`, compilado con `-DCMAKE_CUDA_ARCHITECTURES=120a` y el objetivo `ninfer-serve`. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 86 tok/s en código con contexto corto y 76 tok/s a 100k; 58 y 50 tok/s en prosa; prefill de ~2.240 tok/s a 100k de contexto.
- El servidor expone una API compatible con OpenAI en `http://127.0.0.1:8081/v1` con `model` fijado a `daisyrose`; admite 4 carriles concurrentes compartiendo la caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-NInfer-NVFP4 (este repo) | 27B | 180.224 tokens de caché KV | Apache-2.0 | NInfer v3, solo SM120 | Conversión comunitaria; 229/266 en suite privada de código |
| Qwen3.8-27B NInfer NVFP4 (línea base del autor) | 27B | no disponible | Apache-2.0 (según Qwen) | NInfer NVFP4 con DFlash2 | 223/266 en la misma suite; mejor en parser HTTP (55/56) y semver (87/89) |
| RadixArk/DaisyRose-27B (original) | 27B | no disponible | Apache-2.0 | Pesos originales (BF16/ModelOpt) | Modelo fuente del que deriva esta conversión; incluye detalles de entrenamiento y benchmarks propios |

No se dispone de datos de benchmarks públicos comparables (MMLU, HumanEval, GSM8K) en la información proporcionada para ninguno de los tres modelos.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada a RadixArk, al equipo de Qwen ni a los autores de NInfer; los problemas de esta conversión deben reportarse en este repositorio y no upstream.
- Solo funciona en GPUs Blackwell SM120; no es portable a otras arquitecturas sin reconversión.
- El modo de pensamiento está activado por defecto y puede generar razonamientos muy largos, con el coste de latencia y tokens asociado; el presupuesto se fija a nivel de servidor y NInfer ignora los presupuestos por petición.
- El comportamiento de alineación y rechazo es el del modelo original y no se ha modificado; no se documentan sesgos específicos en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplican las advertencias habituales de los modelos de razonamiento.
- Idiomas soportados no documentados; no se garantiza un rendimiento uniforme fuera de los idiomas del modelo base.
- La suite de benchmarks es privada y de una sola ejecución por tarea, por lo que los resultados no son concluyentes.
- El contexto máximo práctico depende de la VRAM: activar visión obliga a reducir la ventana, y 196.608 tokens de caché fallan al arrancar con 4 carriles.
- Licencia Apache-2.0 permite uso comercial, pero al ser una conversión de formato conviene verificar las condiciones del modelo base y de los pesos de Qwen subyacentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/artisticalien17/DaisyRose-27B-NInfer-NVFP4
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Checkpoint NVFP4 de origen: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Runtime NInfer: https://github.com/Neroued/ninfer
