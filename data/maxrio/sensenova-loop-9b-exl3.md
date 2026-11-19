# Maxrio/SenseNova-Loop-9B-exl3

## Resumen

SenseNova-Loop-9B EXL3 es una cuantización EXL3 del modelo base SenseNova-Loop-9B, publicada por el usuario Maxrio para su uso con ExLlamaV3. El modelo base, desarrollado por SenseTime (organización sensenova), emplea una arquitectura de transformer con bucles (looped-transformer) y atención lineal basada en gated delta-net, con 9.000 millones de parámetros y soporte de contexto largo de hasta 128.000 tokens. Esta ficha describe la versión cuantizada, que es de solo texto: la torre de visión del modelo original no está incluida.

La relevancia de esta publicación reside en su enfoque en la eficiencia de despliegue: ofrece cuantizaciones de 8, 6, 5 y 4 bits por peso con métricas de divergencia KL medidas frente al modelo sin cuantizar, lo que permite evaluar con rigor la pérdida de calidad. La variante de 8.0 bpw es indistinguible del BF16 dentro del ruido de medición, y las de 6.0 y 5.0 bpw superan en fidelidad al checkpoint FP8 de la comunidad con menor tamaño en disco.

El modelo está pensado para inferencia local en GPUs de consumo y profesional, con licencia Apache 2.0. No obstante, requiere una versión de ExLlamaV3 con soporte para la arquitectura Loop de SenseNova, que en el momento de la publicación está pendiente de fusión upstream, por lo que las versiones estándar de ExLlamaV3 y TabbyAPI no pueden cargarlo todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped-transformer), 8 capas de atención completa y 24 capas de atención lineal gated delta-net |
| Parametros totales | 9.000 millones (aproximado, según el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (probado hasta 128k en la model card) |
| Tipos de cuantizacion | EXL3 a 8.0, 6.0, 5.0 y 4.0 bits por peso (solo 8.0 bpw publicado en el momento de la ficha) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (ExLlamaV3), una rama por cuantización |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles, en la que un bloque de capas se reutiliza varias veces, combinada con atención lineal. De las 32 capas, solo 8 usan atención completa y las 24 restantes emplean gated delta-net (atención lineal con compuertas), lo que reduce drásticamente el tamaño de la caché KV. Según la model card, cada token genera 14 ejecuciones de atención de 4 cabezas KV con 256 dimensiones, lo que mantiene la memoria de contexto baja incluso a 128k tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card de esta cuantización no detalla el proceso de entrenamiento del modelo base; solo describe el proceso de cuantización y sus métricas de fidelidad. La innovación técnica destacable es la propia cuantización EXL3, que preserva la distribución de siguiente token con divergencias KL muy bajas respecto al BF16, y la arquitectura de atención híbrida que permite contextos largos con huella de memoria reducida.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento matemático: la model card reporta un 94,0% en un subconjunto de 100 problemas de MATH-500 en BF16.
- Generación y comprensión de código: la categoría de código es una de las más robustas frente a la cuantización (KL de 0,00009 en 8.0 bpw).
- Tool calling y function calling: 45 de 46 tareas resueltas en la prueba de la model card.
- Extracción estructurada: 35 de 40 tareas en la prueba reportada.
- Seguimiento de instrucciones: 73,8% en IFEval (prompt-level strict) en BF16.
- Razonamiento multilingüe: MGSM en alemán con 86,4% en BF16, aunque el alemán no figura entre los idiomas oficiales del modelo.
- Contexto largo: soporta hasta 128.000 tokens, con recuperación de información (needle in a haystack) limitada: 4 de 12 casos en documentos de 32k y 128k.
- Modo thinking: la model card menciona benchmarks con "thinking off", lo que implica que el modelo base dispone de un modo de razonamiento activable.
- No incluye capacidades de visión en esta cuantización (la torre de visión no está incluida).

## Casos de uso

- Asistencia matemática y resolución de problemas: el modelo mantiene un 94-95% en MATH-500 incluso en 4.0 bpw, por lo que es adecuado para tutores o verificadores de ejercicios que necesiten ejecutarse en una sola GPU de consumo.
- Generación de código en local: la categoría de código es la más robusta a la cuantización (KL de 0,0054 en 4.0 bpw), lo que permite integrarlo en entornos de desarrollo sin conexión o con requisitos de privacidad.
- Automatización de tool calling: con 45 de 46 tareas resueltas, puede actuar como planificador en agentes que invocan APIs, siempre que se use un runtime compatible con ExLlamaV3 y la arquitectura Loop.
- Extracción de datos estructurados: útil para convertir documentos en JSON o tablas, con 35 de 40 tareas correctas en la prueba reportada; conviene validar la salida en producción por la ligera degradación en 6.0 bpw (33 de 40).
- Procesamiento de documentos largos: con 128k de contexto y una caché KV pequeña gracias a la atención lineal, puede resumir o buscar información en contratos, informes o expedientes, aunque la recuperación de detalles en documentos muy largos es limitada (4 de 12 en la prueba needle).
- Despliegue en GPU de consumo: la variante de 4.0 bpw ocupa 6,6 GB en disco y 8,6 GiB de VRAM con 8k de contexto, lo que permite ejecutarla en tarjetas de 12 GB o superiores con velocidad de decodificación de 50 tokens por segundo.
- Servicio multiusuario de baja latencia: con 8 solicitudes concurrentes alcanza 216 tok/s en 8.0 bpw y 261 tok/s en 4.0 bpw, adecuado para prototipos de chatbots o asistentes internos.

## Benchmarks y rendimiento

Resultados reportados en la model card (greedy, thinking off; BF16 ejecutado en vLLM y las cuantizaciones en ExLlamaV3 a través de TabbyAPI):

| Benchmark | BF16 | 8.0bpw | 6.0bpw | 4.0bpw |
|---|---:|---:|---:|---:|
| IFEval (prompt-level strict) | 73,8% | 73,2% | 73,6% | 71,9% |
| MATH-500 (subconjunto de 100 problemas) | 94,0% | 95,0% | 92,0% | 94,0% |
| MGSM, alemán | 86,4% | 86,8% | 86,4% | 86,4% |
| Tool calling (46 tareas) | 45/46 | 45/46 | 45/46 | 45/46 |
| Extracción estructurada (40 tareas) | 35/40 | 35/40 | 33/40 | 36/40 |
| Needle in a haystack, 32k + 128k (12) | 4/12 | 4/12 | 4/12 | 4/12 |

Fidelidad de la cuantización (divergencia KL media frente a BF16 y acuerdo top-1, sobre 152.145 tokens evaluados):

| Rama | Bits por peso | Cabeza de salida | Tamaño | KL vs BF16 | Acuerdo top-1 |
|---|---:|---:|---:|---:|---:|
| 8.0bpw | 8,0 | 16 bits | 11,0 GB | 0,00016 | 99,7% |
| 6.0bpw | 6,0 | 8 bits | 8,3 GB | 0,0015 | 99,0% |
| 5.0bpw | 5,0 | 8 bits | 7,4 GB | 0,0030 | 98,6% |
| 4.0bpw | 4,0 | 8 bits | 6,6 GB | 0,0114 | 97,3% |

Referencias de comparación: BF16 ejecutado dos veces (ruido de medición) da KL 0,00032 y 99,6% de acuerdo; el checkpoint FP8 de la comunidad da KL 0,0036 y 98,5%; el AWQ 4-bit oficial de SenseNova da KL 0,044 y 94,7%.

Rendimiento medido en una RTX PRO 4500 Blackwell (32 GB) con ExLlamaV3 a tamaño de lote 1:

| Rama | Contexto | Prefill tok/s | Decode tok/s (1 petición) | VRAM pico |
|---|---:|---:|---:|---:|
| 8.0bpw | 8k | 1.983 | 38,2 | 12,6 GiB |
| 8.0bpw | 32k | 1.854 | 35,7 | 13,9 GiB |
| 8.0bpw | 128k | 1.428 | 28,2 | 19,9 GiB |
| 4.0bpw | 8k | 2.014 | 50,3 | 8,6 GiB |
| 4.0bpw | 32k | 1.924 | 50,0 | 9,8 GiB |
| 4.0bpw | 128k | 1.497 | 38,9 | 15,0 GiB |

Con concurrencia, la decodificación escala: 8.0 bpw alcanza 130 tok/s con 4 peticiones y 216 tok/s con 8 (contexto de 8k); 4.0 bpw alcanza 168 y 261 tok/s respectivamente.

## Requisitos de hardware

- VRAM estimada: 12,6 GiB (8.0 bpw, 8k de contexto) hasta 19,9 GiB (8.0 bpw, 128k); 8,6 GiB (4.0 bpw, 8k) hasta 15,0 GiB (4.0 bpw, 128k). Las cifras incluyen la caché para todo el contexto y el estado recurrente en FP32.
- GPU recomendadas: RTX PRO 4500 Blackwell (32 GB) es la referencia medida; cabe en RTX 4090 (24 GB) para 8.0 bpw con contexto de hasta 32k y para 4.0 bpw con 128k. Para 8.0 bpw a 128k se recomienda una GPU de 24 GB o superior con margen.
- Cabe en GPU de consumo: sí, la variante 4.0 bpw con contexto de 8k ocupa 8,6 GiB y puede ejecutarse en tarjetas de 12 GB. La 8.0 bpw a 8k requiere al menos 16 GB.
- Opciones de despliegue: exclusivamente ExLlamaV3 con soporte para SenseNova Loop (fork en la rama `sensenova-loop` del repositorio de Maxrio9) o TabbyAPI una vez fusionado el PR upstream. No es compatible con vLLM, llama.cpp, Ollama ni TGI en el formato EXL3.
- Latencia y throughput: decodificación de 38,2 tok/s (8.0 bpw, 8k) a 50,3 tok/s (4.0 bpw, 8k) con una petición; prefill de 1.428 a 2.014 tok/s según contexto y cuantización. La rama 5.0 bpw no tiene benchmarks de rendimiento publicados todavía.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---:|---|---|---|
| SenseNova-Loop-9B EXL3 (esta ficha) | 9B | 128k | Apache 2.0 | EXL3 | Cuantización de 8 a 4 bpw, requiere ExLlamaV3 con soporte Loop |
| SenseNova-Loop-9B (base) | 9B | 128k | Apache 2.0 | Safetensors (BF16) | Modelo original con torre de visión; requiere vLLM u otro runtime compatible |
| SenseNova AWQ 4-bit oficial | 9B | 128k | Apache 2.0 | AWQ | KL de 0,044 frente a BF16, aproximadamente 4 veces peor que el EXL3 de 4.0 bpw |
| Checkpoint FP8 de la comunidad | 9B | 128k | Apache 2.0 | FP8 | KL de 0,0036 y 98,5% de acuerdo top-1; el EXL3 de 6.0 bpw lo supera con menor tamaño |

No se dispone de comparación con modelos de otras familias (por ejemplo, Llama, Qwen o Mistral de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Requiere una versión modificada de ExLlamaV3: el soporte para la arquitectura Loop de SenseNova está pendiente de fusión upstream (PR turboderp-org/exllamav3#609). Las versiones estándar de ExLlamaV3 y TabbyAPI no cargan el modelo.
- Solo texto: la torre de visión del modelo base no está incluida en esta cuantización.
- Idiomas oficiales limitados a inglés y chino; el rendimiento en otros idiomas no está garantizado, aunque la model card reporta resultados en alemán (MGSM 86,4%).
- Recuperación en contexto largo limitada: en la prueba needle in a haystack solo recupera todos los códigos en 4 de 12 casos, incluso el modelo base en BF16.
- La cuantización degrada especialmente el chat abierto y el alemán (KL de 0,0375 en 4.0 bpw para alemán frente a 0,0018 en tool calling), por lo que conviene usar 6.0 bpw o superior en aplicaciones conversacionales sensibles.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de sesgo en la información disponible.
- La rama de 5.0 bpw no tiene benchmarks de rendimiento publicados y las ramas de 6.0, 5.0 y 4.0 bpw no estaban publicadas en el momento de la ficha (solo 8.0 bpw).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de un fork no fusionado de ExLlamaV3 añade riesgo de mantenimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maxrio/SenseNova-Loop-9B-exl3
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Repositorio ExLlamaV3: https://github.com/turboderp-org/exllamav3
- PR de soporte para SenseNova Loop: https://github.com/turboderp-org/exllamav3/pull/609
- Fork con soporte Loop: https://github.com/Maxrio9/exllamav3/tree/sensenova-loop
- Rama 8.0bpw: https://huggingface.co/Maxrio/SenseNova-Loop-9B-exl3/tree/8.0bpw
