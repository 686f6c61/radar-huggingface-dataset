# hxyulin/Inkling-2-Mini-Outer-Attention-FP8

## Resumen

Inkling-2-Mini-Outer-Attention-FP8 es una receta de cuantización mixta publicada por el usuario hxyulin sobre el modelo base thinkingmachines/Inkling-2-Mini, desarrollado por Thinking Machines Lab. No se trata de un modelo entrenado desde cero, sino de un conjunto de parches de código y una configuración de precisión que permite ejecutar el modelo base en una única GPU RTX 5090 mediante el motor de inferencia Ingine. La propuesta convierte a FP8 (E4M3FN) las proyecciones de atención de las capas 0–5 y 18–23, así como la proyección de salida del vocabulario, mientras mantiene en BF16 la atención del núcleo de tres pasadas (capas 6–17).

El interés de esta ficha radica en que documenta un caso práctico de despliegue de un modelo de contexto muy largo (270.336 posiciones de contexto configuradas) en hardware de consumo, con mediciones reales de rendimiento y consumo de VRAM. El modelo base Inkling-2-Mini emplea una arquitectura con mezcla de expertos (MoE) con expertos enrutados en NVFP4 y MXFP8 según la capa, embeddings en BF16 y un drafter especulativo denominado DSpark.

La receta no modifica los pesos en disco: el checkpoint oficial sigue siendo la fuente de los pesos, y la conversión a FP8 se realiza en tiempo de carga. El ahorro calculado de almacenamiento residente es de 746,36 MiB (307,54 MiB en atención y 438,82 MiB en la cabeza del vocabulario), sin contar espacios de trabajo, sobrecarga del asignador ni caché KV. La licencia del artefacto es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); atención de tres pasadas con proyecciones de atención, gate, posición relativa, sink, clave y valor; convolución corta de atención completa donde aplica |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 270.336 posiciones configuradas en el motor Ingine (max-ctx 270336) |
| Tipos de cuantizacion | FP8 E4M3FN (proyecciones de atención en capas 0–5 y 18–23, y cabeza de vocabulario) con una escala FP32 por fila de salida; BF16 en atención de capas 6–17 y embeddings; NVFP4 en expertos enrutados de capas 0–19; MXFP8 en expertos de capas 20–23; KV FP8 en atención completa y BF16 en ventana deslizante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint oficial de thinkingmachines/Inkling-2-Mini (revisión b85c3cfa615fc413cc9af3379f491b963f3b586a); la receta aporta parches de código, no pesos nuevos |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini, de Thinking Machines Lab, presenta una arquitectura de mezcla de expertos con atención organizada en tres pasadas. La receta FP8 respeta esa estructura: las capas 0–5 y 18–23, situadas en los extremos de la red, convierten sus proyecciones de atención (query empaquetada, gate, posición relativa, sink, clave y valor, convolución corta de atención completa y proyección de salida de atención) a FP8 E4M3FN con una escala FP32 por fila de salida. Las capas intermedias 6–17 permanecen en BF16 en las tres pasadas, presumiblemente por ser las más sensibles a la pérdida de precisión. Los expertos enrutados conservan su precisión original: NVFP4 en capas 0–19 y MXFP8 en capas 20–23. Los embeddings de tokens y los pesos del drafter DSpark se mantienen en BF16.

La conversión es puramente de inferencia: no se emplean datos de calibración ni reentrenamiento. Cada escala FP8 se deriva del valor absoluto máximo de la fila correspondiente. La innovación técnica destacable es la combinación de esta cuantización selectiva con decodificación especulativa DSpark (hasta siete propuestas por ronda y umbral 0,8) y caché KV en FP8 para la atención completa, lo que permite sostener velocidades de decodificación de 583,75 tok/s a 4K de contexto y 362,11 tok/s a 256K en una sola RTX 5090. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con modo de razonamiento de esfuerzo alto (high reasoning effort) empleado en las mediciones de referencia.
- Decodificación especulativa mediante el drafter DSpark, con hasta siete propuestas por ronda de verificación y un umbral de 0,8.
- Gestión de contexto muy largo: la configuración de servicio admite 270.336 posiciones, con prefill por fragmentos de 3.072 tokens.
- Servicio mediante API compatible con OpenAI en el endpoint `/v1/chat/completions`, lo que facilita la integración con clientes existentes.
- Inferencia en una única GPU de consumo (RTX 5090) con pesos y caché KV residentes en GPU.
- Capacidades de código, matemáticas, visión, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Procesamiento de documentos extensos: con 270.336 posiciones de contexto, el modelo puede ingerir informes, expedientes o bases de código completas en una sola petición; el prefill medido a 262.128 tokens es de 39,4 s hasta el primer fragmento, adecuado para tareas por lotes más que interactivas.
- Asistentes de razonamiento profundo en local: el modo de razonamiento de esfuerzo alto y la decodificación especulativa permiten obtener respuestas elaboradas en una estación de trabajo con una RTX 5090, sin depender de servicios en la nube.
- Análisis de repositorios y revisión de código a gran escala: la ventana de contexto permite cargar múltiples ficheros y mantener coherencia entre ellos; la API compatible con OpenAI simplifica la integración en herramientas internas.
- Servicio de inferencia autoalojado para equipos pequeños: el despliegue con Ingine expone un endpoint compatible con OpenAI, de modo que varias aplicaciones pueden compartir un único servidor con 25.232 MiB de VRAM en uso.
- Experimentación en investigación sobre cuantización: la receta sirve como caso reproducible para estudiar el impacto de FP8 selectivo por capas (99,52 % de acuerdo en el siguiente token frente al control BF16 denso en 416 posiciones muestreadas).
- Evaluación de decodificación especulativa: los datos de rendimiento con y sin cabeza FP8 y atención externa FP8 (419,39 y 418,83 tok/s en los controles BF16, 441,95 con cabeza FP8, 457,51 con ambos) permiten comparar configuraciones en un mismo hardware.
- Prototipado de agentes con contexto largo: la combinación de contexto amplio y API estándar facilita construir pipelines de varios pasos que acumulan historial sin truncamiento agresivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento medidos corresponden a inferencia en una RTX 5090 con la configuración descrita:

| Tokens de entrada | TTFT mediano (s) | Prefill mediano (tok/s) | Decodificación mediana (tok/s) | Extremo a extremo mediano (tok/s) |
|---|---:|---:|---:|---:|
| 4.079–4.080 | 0,336 | 12.363,64 | 583,75 | 556,99 |
| 32.752 | 2,857 | 11.522,25 | 546,54 | 395,82 |
| 65.519–65.520 | 6,322 | 10.392,58 | 516,26 | 287,38 |
| 131.056 | 14,965 | 8.772,74 | 438,85 | 168,55 |
| 262.127–262.128 | 39,423 | 6.656,69 | 362,11 | 80,73 |

| Tokens de entrada | Muestras de GPU | VRAM máxima (MiB) | Potencia media (W) | Temperatura máxima (°C) |
|---|---:|---:|---:|---:|
| 4.079–4.080 | 89 | 25.230 | 503,00 | 69,07 |
| 32.752 | 124 | 25.232 | 538,35 | 72,71 |
| 65.519–65.520 | 172 | 25.232 | 555,27 | 74,99 |
| 131.056 | 293 | 25.232 | 567,69 | 76,16 |
| 262.127–262.128 | 607 | 25.232 | 568,78 | 76,51 |

En la prueba de replay con 32 continuaciones fijas (9.938 tokens), el rendimiento fue de 419,39 y 418,83 tok/s en los dos controles BF16, 441,95 tok/s con cabeza FP8 y 457,51 tok/s con cabeza FP8 y atención externa FP8; cada brazo confirmó 2,63 tokens por ronda de verificación.

## Requisitos de hardware

- GPU: una RTX 5090 con 32.607 MiB de VRAM; el pico medido fue de 25.232 MiB con 270.336 posiciones de contexto asignadas.
- Entorno: Linux, CUDA 13.4 (probado con 13.4.92), cuBLAS, CMake 3.28 o superior, Ninja, `nvcc` en el PATH y la CLI de Hugging Face.
- Controlador: NVIDIA 620.73.04 en la máquina de referencia (Ryzen 9 9950X3D, kernel CachyOS 7.3.5-2-cachyos, límite de potencia de 600 W).
- Cabe en GPU de consumo: sí, en RTX 5090; no se documenta compatibilidad con GPUs de menor VRAM.
- Opciones de despliegue: motor Ingine compilado desde el repositorio satellitedown/inkling-2-mini-abliterated-ingine (commit 306eaa8a90c9840f042a59d565f6dc4536bbb5ea) con los parches attention-loader, independent-fp8, host-embedding y outer-attention. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT de 0,336 s a 4K y 39,423 s a 256K; decodificación de 583,75 tok/s a 4K y 362,11 tok/s a 256K; utilización de GPU mediana del 100 % y potencia media de placa de 559,23 W en 1.285 muestras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Inkling-2-Mini-Outer-Attention-FP8 (esta receta) | no disponible | 270.336 posiciones configuradas | Apache 2.0 | Disponible en Hugging Face; 0 descargas, 1 like |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible en la información | Checkpoint oficial referenciado |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La receta está validada únicamente en una RTX 5090 con Linux y CUDA 13.4; no hay evidencia de funcionamiento en otras GPUs, sistemas operativos o versiones de CUDA.
- El acuerdo del siguiente token con el control BF16 denso es del 99,52 % sobre 416 posiciones muestreadas; existe una divergencia residual que puede acumularse en generaciones largas.
- La conversión FP8 no usa calibración ni entrenamiento: las escalas se derivan del máximo absoluto por fila, lo que puede no ser óptimo para todas las distribuciones de activación.
- El ahorro de VRAM calculado (746,36 MiB) excluye espacios de trabajo, sobrecarga del asignador y caché KV; el consumo real observado fue de 25.232 MiB, cercano al límite de la tarjeta.
- El despliegue requiere compilar el motor Ingine y aplicar cuatro parches de código sobre un commit concreto; no hay paquete precompilado ni soporte de motores estándar como vLLM o llama.cpp.
- El repositorio del motor se denomina "abliterated", lo que sugiere una variante sin mecanismos de rechazo; conviene revisar su procedencia y comportamiento antes de usarlo en producción.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni restricciones adicionales del modelo base más allá de la licencia Apache 2.0.
- El artefacto tiene 0 descargas y 1 like en el momento de la consulta, sin pipeline declarado ni idiomas especificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hxyulin/Inkling-2-Mini-Outer-Attention-FP8
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del motor Ingine: https://github.com/satellitedown/inkling-2-mini-abliterated-ingine
- Guía de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/en/guides/cli
