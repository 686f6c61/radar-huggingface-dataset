# nemotron-deciffusion/Nemotron-Deciffusion-8B-v2-NVFP4

## Resumen

Nemotron Deciffusion 8B v2 — NVFP4 es una versión cuantizada en precisión mixta del modelo Nemotron Deciffusion 8B v2 (BF16) desarrollado por Nemotron Labs (NVIDIA). No es un modelo generativo al uso: está diseñado para emitir decisiones tipadas ("typed decisions") en un único forward pass, con un pipeline declarado de `text-classification`. El checkpoint conserva "el mismo modelo y la misma API" que el original, pero ocupa menos memoria y responde más rápido en GPUs Blackwell gracias al uso nativo de tensor cores FP4.

La cuantización la ha realizado la propia NVIDIA con NVIDIA Model Optimizer (ModelOpt) 0.48.0rc1.dev43, empleando un presupuesto efectivo de 6,6 bits por peso y una receta de AutoQuantize con puntuación de sensibilidad Aumann-Shapley que decide, capa a capa, si aplicar NVFP4 o FP8. Cada grupo de capas lineales se asigna a una de las dos precisiones en función de cuánto altera la divergencia KL de la distribución de decisión del modelo.

El modelo tiene 6.283.350.016 parámetros totales (unos 6,28B) distribuidos en 34 capas, con embeddings de tokens y cabeza de lectura (`readout head`) mantenidos en BF16. Está publicado bajo la NVIDIA Nemotron Open Model License, la misma que el modelo base BF16. Los detalles de contexto máximo, idiomas soportados y composición exacta del entrenamiento no se especifican en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional de tipo "deciffusion" (Nemotron Labs) con decisión en un único forward pass y lectura en un único slot de máscara; 34 capas; no se detallan componentes internos (MoE/SSM/híbrido) |
| Parámetros totales | 6.283.350.016 (~6,28B) |
| Longitud de contexto | No disponible de forma explícita; evaluado en secuencias de hasta 32k tokens (BABILong) |
| Tipos de cuantización | NVFP4 (bloques de 16 elementos con escalas FP8 E4M3) y FP8 E4M3 (escalas estáticas por tensor) en precisión mixta; embeddings y readout head en BF16; presupuesto efectivo de 6,6 bits |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (repo de 7,7 GB; `model.safetensors` sha256 `ed067d4aa3f4a13088c0e3f0f6fb3feabc724edd56e1c52ec95f18453c79dd9d`) |

## Arquitectura y entrenamiento

La arquitectura se describe como "deciffusion" y opera de forma bidireccional con una única lectura en el slot de máscara: el modelo recibe la entrada ya renderizada tal y como se sirve y emite logits de código de opción en ese slot, de los que se deriva una decisión tipada en un solo forward pass. Consta de 34 capas con proyecciones MLP de tipo gate/up y down, y atención con proyecciones q/k/v y o. No se documenta en la información disponible si se trata de un transformer denso, un MoE, un modelo híbrido o un esquema de difusión, por lo que ese extremo queda como no disponible.

El entrenamiento del modelo base no se detalla más allá de que existen "training mixes verificados por licencia" y de que la calibración de la cuantización se hizo sobre 640 prompts (128 de ellos reservados para la puntuación de sensibilidad), con huella sha256 `b97b49bf871fc42c457c6bb3d66d480b7fad0652d7bfa7b0fc618ba06d7193df`. La innovación técnica destacable es la receta de AutoQuantize que combina asignación de precisión por capa con puntuación de sensibilidad Aumann-Shapley (`modelopt/torch/quantization/_auto_quantize_shapley.py`), donde la sensibilidad se mide como la divergencia KL de la distribución de decisiones del modelo. La asignación resultante deja 24 de las 34 capas MLP gate/up en NVFP4 (10 en FP8), 21 de 34 capas MLP down en NVFP4 (13 en FP8), solo 7 de 34 capas de atención q/k/v en NVFP4 (27 en FP8) y 11 de 34 capas de atención o en NVFP4 (23 en FP8).

## Capacidades

- Emisión de decisiones tipadas en un único forward pass, sin decodificación autorregresiva estándar, con la misma API que el modelo BF16.
- Clasificación de texto (pipeline declarado `text-classification`) sobre opciones discretas.
- Decisión de invocación de herramientas (`When2Call`: precisión 95,7 en el conjunto NVFP4, frente a 94,0 del BF16).
- Moderación y seguridad de contenido: Aegis 2.0 con F1 de 87,5 en prompt y 83,1 en respuesta; ToxicChat con F1 de 72,1.
- Detección de jailbreak (JevBench: 207 de 231 aciertos en el pooled público).
- Comprensión de contexto largo hasta 32k tokens (BABILong: 99,2/99,6/99,2/99,6 en 4k/8k/16k/32k) y QA de opción múltiple sobre contexto compactado largo (QuALITY: 78,0).
- Razonamiento de opción múltiple exigente (HLE-MC: 12,7 de precisión en el índice AA Decision).
- Capacidades multilingües: no disponibles.
- No se documentan capacidades de visión, audio, agentes multi-paso ni generación de texto libre.

## Casos de uso

- Guardrails de entrada y salida en producción: el modelo clasifica prompts y respuestas de un sistema generativo y devuelve una decisión de permitir, bloquear o marcar, con F1 de 87,5/83,1 en Aegis 2.0 y 72,1 en ToxicChat.
- Enrutado de llamadas a herramientas en agentes: dada una consulta y un catálogo de funciones, decide si procede invocar una herramienta (When2Call, 95,7 de precisión), lo que permite construir routers baratos en latencia frente a un LLM generativo.
- Moderación de contenido en plataformas: clasificación binaria/multiclase de mensajes de usuario con una sola pasada y ~24 ms de latencia p50, adecuado para filtrado en línea a gran escala.
- Detección de jailbreak y prompt injection: la tarea JevBench se resuelve mediante decisión tipada, lo que permite integrar el modelo como capa de defensa previa a un LLM expuesto a usuarios.
- QA de opción múltiple sobre documentos largos: con soporte de contexto de hasta 32k en las evaluaciones (BABILong), sirve para responder preguntas cerradas sobre contratos, informes o expedientes sin generar texto libre.
- Evaluación automática de respuestas (LLM-as-judge): al devolver una decisión discreta y reproducible, encaja como juez en pipelines de evaluación de modelos o de conjuntos de datos, con las cifras del índice AA Decision (HLE-MC) como referencia de capacidad.
- Clasificación de intención en asistentes conversacionales: la decisión de un solo forward pass permite enrutar turnos hacia distintos subsistemas con un p50 de 24,1 ms por tarea y 201 tareas/s a 16 peticiones concurrentes en GB200.

## Benchmarks y rendimiento

Precisión (misma GPU GB200, misma ruta de servicio):

| Evaluación | BF16 | FP8 (dinámico) | NVFP4 (este) |
|---|---|---|---|
| Decisiones, pooled (1.489 items) | 1.358 | 1.352 | 1.354 |
| JevBench público (231) | 210 | 206 | 207 |
| QuALITY, contexto largo compactado (300) | 79,7 | 79,3 | 78,0 |
| BABILong 4k / 8k / 16k / 32k | 99,6 / 99,2 / 99,2 / 99,6 | 98,8 / 98,8 / 99,2 / 99,6 | 99,2 / 99,6 / 99,2 / 99,6 |
| Aegis 2.0 prompt / response F1 | 87,6 / 83,0 | — | 87,5 / 83,1 |
| ToxicChat F1 | 72,9 | — | 72,1 |
| AA Decision Index HLE-MC / When2Call / WildGuardTest | 11,3 / 94,0 / 95,4 | — | 12,7 / 95,7 / 95,4 |

Velocidad (GB200, 300 items del AA Decision Index por componente):

| Métrica | BF16 | FP8 (dinámico) | NVFP4 (este) |
|---|---|---|---|
| p50 por tarea, 1 petición (HLE-MC, ~360 tokens) | 25,8 ms | 24,9 ms | 24,1 ms |
| tareas/s, 16 concurrentes (HLE-MC) | 105 | 167 | 201 |
| tareas/s, 16 concurrentes (When2Call, ~850 tokens) | 57 | 86 | 95 |

En GB200, NVFP4 sirve entre un 11 % y un 21 % más de tareas por segundo que FP8 y entre 1,7 y 1,9 veces más que BF16.

## Requisitos de hardware

- La cuantización NVFP4 (W4A4) es nativa en GPUs Blackwell con tensor cores FP4; el release usa el cargador `MIXED_PRECISION` de ModelOpt en vLLM y selecciona automáticamente el kernel FP4 GEMM (CUTLASS).
- En GPUs sin tensor cores FP4, la recomendación del autor es usar el modelo BF16 (que sirve en FP8 por defecto) en lugar de este checkpoint.
- VRAM estimada para pesos: con un presupuesto efectivo de 6,6 bits sobre 6,28B parámetros, del orden de 5-6 GB solo en pesos; el repositorio completo ocupa 7,7 GB. El tamaño exacto en memoria de inferencia no está publicado.
- GPU recomendadas: GB200 / B100 / B200 para NVFP4 nativo; tarjetas sin FP4 deben recurrir al BF16.
- Cabría en GPUs de consumo con soporte FP4 (por ejemplo, la gama RTX 50 de NVIDIA) por tamaño de pesos, pero el autor no lo confirma y recomienda hardware Blackwell con tensor cores FP4.
- Despliegue: `vllm serve` con el adaptador SystemOne y `QUANTIZATION=none` (la configuración de cuantización se lee del propio checkpoint). Alternativa: servir el modelo BF16 con FP8 por defecto.
- Latencia y throughput medidos en GB200: p50 de 24,1 ms por tarea en HLE-MC (~360 tokens) y 201 tareas/s a 16 peticiones concurrentes; 95 tareas/s en When2Call (~850 tokens).

## Comparativa con modelos similares

Comparación con las variantes del propio modelo, bajo la misma ruta de servicio:

| Modelo | Parámetros | Precisión | Decisiones pooled (1.489) | p50 HLE-MC | tareas/s a 16 conc. (HLE-MC) | Licencia |
|---|---|---|---|---|---|---|
| Nemotron Deciffusion 8B v2 (BF16) | ~6,28B | BF16 | 1.358 | 25,8 ms | 105 | NVIDIA Nemotron Open Model License |
| Nemotron Deciffusion 8B v2 (FP8 dinámico) | ~6,28B | FP8 | 1.352 | 24,9 ms | 167 | NVIDIA Nemotron Open Model License |
| Nemotron Deciffusion 8B v2 NVFP4 (este) | 6.283.350.016 | NVFP4/FP8 mixto | 1.354 | 24,1 ms | 201 | NVIDIA Nemotron Open Model License |

Como alternativa de familia, NVIDIA mantiene Nemotron 3 Ultra (550B totales, 55B activos), un modelo de razonamiento y orquestación de escala muy superior y orientación generativa, por lo que no es comparable en tamaño, tarea ni consumo. No se dispone de otros modelos de decisión tipada equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es generativo: emite decisiones tipadas en un único forward pass y no debe esperarse de él generación de texto libre ni decodificación autorregresiva estándar.
- La arquitectura "deciffusion" no está documentada en detalle; se desconoce si es densa, MoE o híbrida, lo que dificulta razonar sobre su escalado o sus fallos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de decisión incorrecta; el propio HLE-MC del índice AA Decision se sitúa en 12,7, lo que indica un rendimiento bajo en razonamiento de opción múltiple exigente.
- El rendimiento en QuALITY cae de 79,7 (BF16) a 78,0 (NVFP4) y en ToxicChat de 72,9 a 72,1, por lo que la cuantización introduce una pérdida medible, aunque pequeña.
- No se especifican los idiomas soportados, lo que impide garantizar calidad fuera del inglés.
- La longitud máxima de contexto no está declarada; las evaluaciones de contexto largo solo llegan a 32k tokens (BABILong).
- La licencia es "NVIDIA Nemotron Open Model License", no una licencia de código abierto estándar; conviene revisar sus términos antes de un uso comercial.
- Para servir NVFP4 se requiere hardware Blackwell con tensor cores FP4; en otro hardware hay que recurrir al modelo BF16.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha y se publicó con código personalizado (`custom_code`), lo que implica dependencia de implementaciones específicas de la librería para cargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nemotron-deciffusion/Nemotron-Deciffusion-8B-v2-NVFP4
- Modelo base BF16: https://huggingface.co/nemotron-deciffusion/Nemotron-Deciffusion-8B-v2
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Implementación de AutoQuantize con Aumann-Shapley: https://github.com/NVIDIA/Model-Optimizer/blob/main/modelopt/torch/quantization/_auto_quantize_shapley.py
- Paper (arXiv:2607.12266): https://arxiv.org/abs/2607.12266
- Nemotron en NVIDIA Developer: https://developer.nvidia.com/topics/ai/nemotron
- Nemotron en NVIDIA: https://www.nvidia.com/fr-fr/ai-data-science/foundation-models/nemotron/
- Nemotron en Wikipedia: https://en.wikipedia.org/wiki/Nemotron
- NVIDIA Nemotron 3 Ultra: https://research.nvidia.com/labs/nemotron/Nemotron-3-Ultra/
