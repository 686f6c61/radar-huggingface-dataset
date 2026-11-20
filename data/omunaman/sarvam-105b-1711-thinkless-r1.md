# omunaman/sarvam-105b-1711-thinkless-r1

## Resumen

`sarvam-105b-1711-thinkless-r1` es una edición no oficial de los pesos de `sarvamai/sarvam-105b-1711`, publicada por el usuario omunaman bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: el autor aplica dos modificaciones aritméticas directas sobre las matrices de pesos (weight editing), sin ningún paso de entrenamiento, con el objetivo declarado de reducir a la mitad el número de tokens necesarios para producir una respuesta correcta. El modelo conserva la arquitectura y el formato originales de Sarvam (expertos en 4 bits NVFP4 y atención en 8 bits MXFP8, empaquetados con compressed-tensors).

La primera edición proyecta fuera de las matrices que escriben en el residual stream una dirección del estado oculto asociada al comportamiento de "re-verificación" de respuestas ya resueltas, medida en la capa 28. La segunda añade un vector a la fila de la capa de salida correspondiente al token de cierre de razonamiento (`</think>`, id 24), de modo que el modelo tiende a cerrar el bloque de pensamiento antes cuando la respuesta ya está asentada. El resultado es un modelo que piensa menos y responde antes, con una precisión agregada prácticamente idéntica en preguntas de respuesta corta y examen, pero con pérdidas claras en matemáticas de competición, código y uso de herramientas.

Es relevante ahora porque ejemplifica una línea de trabajo barata y reproducible (edición de pesos frente a entrenamiento) para reducir el coste por respuesta correcta en modelos de razonamiento, y porque el autor publica mediciones detalladas de dónde gana y dónde pierde, algo poco habitual en ediciones no oficiales. El repositorio ocupa 46,8 GB e incluye además un drafter DSpark en el subdirectorio `dspark/` para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención MLA (tag `sarvam_mla`), pesos en formato comprimido: expertos 4 bits NVFP4, atención 8 bits MXFP8 (compressed-tensors) |
| Parametros totales | 105B (según el nombre del modelo base; no se detalla el desglose en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (valor de `--max-model-len` en el ejemplo de servicio del autor) |
| Tipos de cuantizacion | NVFP4 (expertos) y MXFP8 (atención); pesos ya cuantizados en el repositorio |
| Idiomas soportados | no disponible de forma explícita; los benchmarks citados incluyen inglés, hindi y un conjunto multielección de lenguas indias |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con `custom_code` y compressed-tensors (formato propio de Sarvam) |

## Arquitectura y entrenamiento

El modelo base es un transformer con atención multi-head latente (MLA), servido con `--trust-remote-code` y parsers `glm45` para herramientas y razonamiento. Los pesos se almacenan ya cuantizados: los expertos en NVFP4 (4 bits) y las capas de atención en MXFP8 (8 bits), empaquetados mediante compressed-tensors. El repositorio incluye un drafter DSpark (`dspark/`) afinado sobre las propias respuestas de este modelo, pensado para decodificación especulativa con 5 tokens de borrador y muestreo probabilístico con rechazo por bloques.

No hay entrenamiento en esta edición. Las dos modificaciones son puramente aritméticas sobre los pesos: (1) eliminación de una dirección de re-verificación del residual stream mediante `W <- W - r r^T W`, donde `r` es la dirección medida en la capa 28 que se activa cuando el modelo empieza a re-comprobar una respuesta que ya tenía; y (2) suma de un vector a la fila de salida del token `</think>` (id 24) que eleva la probabilidad de cerrar el razonamiento cuando la respuesta está asentada. El autor no documenta el número de tokens de entrenamiento del modelo base ni la composición de su dataset, y no se realizó RLHF ni DPO en esta edición.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento explícito (bloques `</think>`), heredado del modelo base.
- Respuesta a preguntas de examen y de respuesta corta, donde el recorte de tokens de pensamiento no degrada la precisión (según las mediciones del autor).
- Razonamiento matemático básico e intermedio (GSM8K, MATH-500) con precisión agregada similar al original.
- Conocimiento general y multielección (MMLU, MMLU-Pro, ARC).
- Capacidades multilingües parciales: inglés, hindi y lenguas indias en los benchmarks citados; el resto no está documentado.
- Soporte de tool calling y function calling mediante el parser `glm45` de vLLM, aunque con pérdida medible en conversaciones multi-turno.
- Decodificación especulativa con el drafter DSpark incluido, que eleva el throughput de aproximadamente 636-640 a 680-706 tokens por segundo en el escenario medido.

## Casos de uso

- Preguntas de examen y respuesta corta: el modelo reduce el pensamiento en cuestiones ya resueltas, con una ratio de 0,45-0,52 tokens por respuesta correcta respecto al original y una diferencia de precisión de +1,98 a -0,46 puntos según temperatura; adecuado para bancos de preguntas tipo test y evaluación académica.
- Generación de respuestas en producción con coste por token crítico: al recortar a la mitad los tokens de razonamiento en consultas sencillas, baja el coste de inferencia en despliegues de alto volumen donde la latencia y el gasto por petición importan más que el razonamiento profundo.
- Asistentes conversacionales de dominio acotado: conversaciones multi-turno sobre temas con respuestas bien definidas, donde el modelo no necesita re-verificar y el recorte de pensamiento no afecta a la calidad.
- Servicio con decodificación especulativa: el drafter DSpark incluido permite servir el modelo con vLLM y `--speculative-config` para aumentar el throughput en una B200, útil en entornos con una sola GPU de gran memoria.
- Evaluación e investigación sobre edición de pesos: el repositorio documenta el método (`W <- W - r r^T W` y el ajuste de la fila de salida) y las mediciones, por lo que sirve como caso de estudio reproducible para investigar control del razonamiento sin entrenamiento.
- Clasificación y extracción de respuestas cerradas: tareas donde la salida es una etiqueta o un dato corto y el modelo solo necesita un razonamiento mínimo, beneficiándose del cierre temprano del bloque de pensamiento.

## Benchmarks y rendimiento

Mediciones del autor frente a la build propia de Sarvam de 1711, ambas en 4 bits, sobre una NVIDIA B200 y el mismo contenedor. Conjunto de 4.340 preguntas reservadas de benchmarks públicos (GSM8K inglés y hindi, MATH-500, MMLU, MMLU-Pro, ARC, un conjunto multielección de lenguas indias y preguntas cotidianas), ejecución única:

| Temperatura | 0 | 0,5 | 0,8 | 1,0 |
|---|---|---|---|---|
| Tokens por respuesta correcta (ratio) | 0,451x | 0,513x | 0,520x | 0,517x |
| Diferencia de precisión (puntos) | +1,98 | +0,07 | -0,46 | +0,16 |

Pérdidas documentadas por el autor (medición propia, no arbitrada, salvo donde se indica):

| Benchmark / escenario | Diferencia |
|---|---|
| Matemáticas de competición, ajustes largos (t 1,0, top-p 1,0, 65.536 tokens nuevos, 4 semillas, arbitrado) | -4,2 puntos |
| IFEval | -0,97 |
| WritingBench | -0,74 |
| BFCL v4 (13 categorías, todas dentro de 1 punto) | se mantiene |
| IFBench | -2,08 |
| GPQA Diamond | -2,21 |
| AIME 2025 | -4,17 |
| AIME 2026 | -2,71 |
| HMMT | -5,4 a -11,3 |
| LiveCodeBench | -3,99 |
| MultiChallenge | -1,74 |
| Arena-Hard | -8,13 |
| Tool calls multi-turno con presupuesto de 16.384 tokens | -4,6 puntos |

Throughput con el drafter afinado (un usuario, 40 prompts de examen, cliente en el contenedor de la GPU): 680-706 tokens por segundo frente a 636-640 del modelo de Sarvam.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 46,8 GB en pesos cuantizados; el ejemplo del autor usa una única NVIDIA B200 con `--gpu-memory-utilization 0.92` y caché KV en `fp8_e4m3`, por lo que el modelo no cabe en GPU de consumo.
- GPU recomendadas: NVIDIA B200 (configuración medida por el autor); no se documentan otras GPU, aunque por tamaño de pesos cabría en aceleradores con al menos 48-80 GB de memoria, sin confirmación del autor.
- GPU de consumo: no cabe en RTX 4090 ni en tarjetas de 24 GB en la configuración documentada.
- Opciones de despliegue: vLLM con `--trust-remote-code`, `--served-model-name sarvam-105b`, `--tensor-parallel-size 1`, `--max-model-len 131072`, `--max-num-seqs 256`, `--max-num-batched-tokens 8192`, `--kv-cache-dtype fp8_e4m3`, `--enable-auto-tool-choice`, `--tool-call-parser glm45`, `--reasoning-parser glm45` y `VLLM_ENFORCE_STRICT_TOOL_CALLING=0`; decodificación especulativa con `--speculative-config '{"method":"dspark","model":".../dspark","num_speculative_tokens":5,"draft_sample_method":"probabilistic","rejection_sample_method":"block"}'`.
- Latencia y throughput: 680-706 tokens por segundo con el drafter y un usuario en B200, frente a 636-640 del original; no se documentan latencias p99 ni throughput con concurrencia alta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| omunaman/sarvam-105b-1711-thinkless-r1 | 105B | 131.072 | Apache 2.0 | Edición no oficial, 0 descargas | Menos tokens por respuesta correcta, pierde en matemáticas de competición, código y herramientas |
| sarvamai/sarvam-105b-1711 | 105B | 131.072 (según configuración de servicio) | Apache 2.0 | Modelo base oficial | Referencia de precisión y de tokens; sin recorte de pensamiento |
| Otros modelos de razonamiento de ~100B con modo thinking | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un lanzamiento oficial de Sarvam AI; el autor lo declara explícitamente y no hay validación independiente de las mediciones (salvo el caso arbitrado de matemáticas de competición).
- Pierde precisión en razonamiento difícil: matemáticas de competición (-4,2 puntos en ajustes largos), AIME, HMMT (-5,4 a -11,3), GPQA Diamond (-2,21) y LiveCodeBench (-3,99).
- Pierde en tool calling multi-turno (-4,6 puntos con presupuesto de 16.384 tokens) y en escritura larga y Arena-Hard (-8,13); el autor recomienda no usarlo para herramientas, código, salida estructurada ni escritura de formato largo.
- El recorte de pensamiento se aplica a todo, incluidos problemas que requieren razonamiento largo; el interruptor por petición que probó el autor no elimina las pérdidas en GPQA ni en matemáticas de competición.
- Riesgo de alucinación no cuantificado en la información disponible; al reducir la re-verificación, el modelo podría aceptar respuestas erróneas con más facilidad en dominios donde la comprobación era útil.
- Idiomas soportados no documentados de forma completa; las mediciones cubren inglés, hindi y lenguas indias.
- Requiere `--trust-remote-code` y código personalizado (`sarvam_mla`), lo que añade superficie de riesgo en producción.
- Sin datos de sesgos, seguridad ni evaluaciones de robustez en la información proporcionada.
- Repositorio con 0 descargas y 0 likes: sin validación de la comunidad ni reportes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omunaman/sarvam-105b-1711-thinkless-r1
- Modelo base: https://huggingface.co/sarvamai/sarvam-105b-1711
- Documentación de vLLM: no disponible en la información proporcionada
- Paper o blog del método de edición de pesos: no disponible en la información proporcionada
- Repositorio de código del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
