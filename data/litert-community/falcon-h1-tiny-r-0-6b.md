# litert-community/Falcon-H1-Tiny-R-0.6B

## Resumen

Falcon-H1-Tiny-R-0.6B es un modelo de lenguaje de razonamiento de 0,6 mil millones de parámetros desarrollado originalmente por TII (Technology Innovation Institute) y empaquetado por la comunidad litert-community en formato LiteRT-LM para inferencia en dispositivo (on-device). El modelo emplea una arquitectura híbrida que combina atención con grouped-query attention (GQA) y capas Mamba2 de escaneo selectivo ejecutadas en paralelo en cada una de sus 44 capas. Esta conversión concreta está cuantizada a int8 dinámico en las capas lineales (FC) manteniendo la tabla de embeddings en coma flotante, con un tamaño de archivo de 873 MB.

El modelo se distingue por ser un modelo de razonamiento que abre de forma autónoma un bloque `` antes de responder, lo que permite al runtime separar el canal de razonamiento (`thought`) de la respuesta final y aplicar un presupuesto de pensamiento (`--thinking-budget`). Está pensado para ejecutarse en dispositivos móviles y edge con el runtime LiteRT-LM (versión mínima 0.16), con soporte de delegación GPU completa.

Su relevancia actual radica en que demuestra que un modelo híbrido de razonamiento de 0,6B puede ejecutarse en teléfonos de gama alta con velocidades de decodificación de entre 10 y 22,8 tok/s según el dispositivo, manteniendo una precisión en GSM8K (76/100) igual o superior a la del modelo bf16 original en PyTorch (71/100) bajo el mismo protocolo de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer con grouped-query attention (GQA) + Mamba2 (escaneo selectivo), 44 capas con ambas ramas en paralelo |
| Parametros totales | 0,6B (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámico en lineales (FC); embeddings en float (externalizados); convoluciones y escaneo en float; activaciones fp32 |
| Idiomas soportados | no disponible |
| Licencia | Falcon LLM License (falcon-llm-license) |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es híbrida: cada una de las 44 capas ejecuta en paralelo una rama de atención con grouped-query attention y una rama Mamba2 de escaneo selectivo. Cada capa mantiene estado KV más un estado de convolución/SSM de tamaño constante, lo que permite un uso de memoria predecible durante la generación. El modelo base es `tiiuae/Falcon-H1-Tiny-R-0.6B`, un modelo de razonamiento de la familia Falcon-H1. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La conversión a LiteRT-LM introduce decisiones técnicas relevantes: la tabla de embeddings se mantiene en coma flotante y se externaliza en una sección propia del lado de CPU, porque una tabla int8 (incluso por filas) desestabiliza el razonamiento en este checkpoint, provocando pensamiento desbocado y cambios en decodificación greedy. Las convoluciones y el escaneo también permanecen en float. Se exportan firmas de prefill de longitud múltiple (1–1024) para que el runtime seleccione fragmentos ajustados. Los tokens de parada son `<|end_of_text|>` (11) y `<|im_end|>` (228). El template de chat reproduce byte a byte el flujo de tokens del `apply_chat_template` original desde BOS.

## Capacidades

- Generación de texto con modo de razonamiento explícito: abre un bloque `` de forma autónoma antes de responder.
- Razonamiento matemático y lógico: verificado en pruebas de GSM8K y en comprobaciones de sanidad de 8 preguntas (razonamiento, lógica y matemáticas pasan en todos los backends probados).
- Control del presupuesto de pensamiento mediante `--thinking-budget`, que trunca el razonamiento en el número exacto de tokens indicado.
- Separación del canal de razonamiento (`thought`) de la respuesta final por parte del runtime.
- Inferencia en dispositivo con delegación GPU completa (6566 operaciones delegadas en los dispositivos medidos).
- Soporte de backends CPU y GPU (Metal en iPhone, GPU en Android, CPU/GPU en Mac).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada.

## Casos de uso

- Asistente de razonamiento en dispositivo móvil: el modelo ejecuta cadenas de razonamiento matemático y lógico directamente en el teléfono sin conexión, con decodificación de 16,1 tok/s en Galaxy S26 y 22,8 tok/s en iPhone 17 Pro, lo que permite respuestas interactivas sin enviar datos a la nube.
- Tutor de matemáticas offline: con 76/100 en GSM8K y un presupuesto de pensamiento configurable, puede resolver problemas aritméticos paso a paso mostrando el razonamiento separado de la respuesta final, útil en aplicaciones educativas sin conectividad.
- Procesamiento de datos sensibles en el borde: al ejecutarse íntegramente en el dispositivo (873 MB, delegación GPU completa), permite clasificar o resumir texto confidencial sin que salga del terminal, cumpliendo requisitos de privacidad.
- Prototipado de aplicaciones edge con LiteRT-LM: sirve como modelo de referencia para validar pipelines de razonamiento híbrido (atención + Mamba2) en Android e iOS antes de escalar a modelos mayores de la misma familia (0.5B, 1.5B, 3B).
- Control de calidad de conversaciones con razonamiento acotado: usando `--thinking-budget 16` o 256, se puede limitar la latencia del razonamiento en aplicaciones de chat donde el tiempo de respuesta es crítico.
- Evaluación comparativa de cuantización en producción: el archivo int8 permite medir el impacto de la cuantización sobre el razonamiento (flips bidireccionales frente a bf16) en pipelines de CI para modelos on-device.
- Asistente de voz o texto en wearables y dispositivos IoT: el tamaño reducido y el estado SSM de tamaño constante facilitan la integración en dispositivos con memoria limitada.

## Benchmarks y rendimiento

| Benchmark / métrica | Resultado | Referencia |
|---|---|---|
| GSM8K (100 preguntas, greedy, 2048 tokens) | 76/100 (int8 LiteRT-LM) | 71/100 (bf16 PyTorch) |
| Sanidad 8 preguntas, Mac CPU | 6/8 | litert-lm 0.16.0 |
| Sanidad 8 preguntas, Mac GPU | 7/8 | litert-lm 0.16.0 |
| Sanidad 8 preguntas, iPhone CPU | 6/8 | litert-lm 0.16.0 |
| Sanidad 8 preguntas, iPhone Metal | 6/8 | litert-lm 0.16.0 |
| Mac M4 Max, GPU, prefill (256) | 2216 tok/s | litert-lm 0.16.0 |
| Mac M4 Max, GPU, decode | 97,8 tok/s | litert-lm 0.16.0 |
| Mac M4 Max, GPU, TTFT | 0,13 s | litert-lm 0.16.0 |
| Mac M4 Max, CPU, prefill (256) | 381 tok/s | litert-lm 0.16.0 |
| Mac M4 Max, CPU, decode | 47,8 tok/s | litert-lm 0.16.0 |
| Mac M4 Max, CPU, TTFT | 0,69 s | litert-lm 0.16.0 |
| Galaxy S26, GPU, decode | 16,1 tok/s | LiteRT-LM 0.16.0 |
| Galaxy S26, GPU, prefill | 310 tok/s | LiteRT-LM 0.16.0 |
| Galaxy S26, GPU, TTFT | 760 ms | LiteRT-LM 0.16.0 |
| Pixel 8a, GPU, decode | 10,0 tok/s | LiteRT-LM 0.16.0 |
| Pixel 8a, GPU, prefill | 109 tok/s | LiteRT-LM 0.16.0 |
| Pixel 8a, GPU, TTFT | 2,08 s | LiteRT-LM 0.16.0 |
| iPhone 17 Pro, GPU, decode | 22,8 tok/s | LiteRT-LM 0.16.0 |
| iPhone 17 Pro, GPU, prefill | 260 tok/s | LiteRT-LM 0.16.0 |
| iPhone 17 Pro, GPU, TTFT (cold) | 12,88 s | LiteRT-LM 0.16.0 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo int8 ocupa 873 MB; el repositorio completo pesa 2,6 GB. El pico de memoria medido en iPhone 17 Pro no está disponible en el texto truncado.
- GPU recomendadas: no aplica GPU de servidor; el modelo está diseñado para GPU integradas de dispositivos móviles (Adreno en Galaxy S26, Mali en Pixel 8a, GPU de Apple en iPhone 17 Pro) y GPU de Apple M4 Max en Mac.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna por su tamaño (873 MB), aunque el formato `.litertlm` está orientado a LiteRT-LM y no a runtimes de escritorio convencionales.
- Opciones de despliegue: LiteRT-LM (versión ≥ 0.16), con backends CPU y GPU (`--backend gpu`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: decodificación de 10,0 a 22,8 tok/s en dispositivos móviles; 97,8 tok/s en GPU de M4 Max; TTFT de 0,13 s (M4 Max GPU) a 12,88 s (iPhone 17 Pro, arranque en frío).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Falcon-H1-Tiny-R-0.6B (esta ficha) | 0,6B | no disponible | Falcon LLM License | `.litertlm` | GSM8K 76/100 (int8) |
| Falcon-H1-Tiny-R-0.6B (bf16 PyTorch) | 0,6B | no disponible | Falcon LLM License | safetensors | GSM8K 71/100 |
| Falcon-H1-0.5B / 1.5B / 3B-Instruct | 0,5B / 1,5B / 3B | no disponible | Falcon LLM License | `.litertlm` | no disponible en la información |

No se dispone de datos de benchmarks de los modelos alternativos de la familia en la información proporcionada, por lo que no es posible comparar rendimiento más allá de la referencia bf16 del mismo checkpoint.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: en las pruebas de sanidad de 8 preguntas fallan dos ítems de recuerdo factual ("capital de Japón", "gracias en francés"), que el modelo bf16 también falla bajo perturbaciones de un token en el prompt; el riesgo de alucinación en hechos es relevante a esta escala.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible.
- Limitaciones de idioma: los idiomas soportados no están documentados.
- Restricciones de licencia: Falcon LLM License (términos en falconllm.tii.ae); es necesario revisar las condiciones para uso comercial.
- Requiere LiteRT-LM ≥ 0.16; la versión 0.18.0 tiene un bug conocido de reutilización de estado entre conversaciones en el mismo Engine (reporte abierto, corregido en main el 2026-11-03 y en la release v0.20.0). Se recomienda crear un Engine nuevo por conversación; la primera conversación de un Engine no se ve afectada.
- La cuantización int8 solo en capas FC con embeddings en float es una decisión deliberada: una tabla de embeddings int8 desestabiliza el razonamiento en este checkpoint.
- El formato `.litertlm` limita el despliegue a LiteRT-LM; no es directamente compatible con runtimes de servidor convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-Tiny-R-0.6B
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-Tiny-R-0.6B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Release v0.20.0 de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/releases/tag/v0.20.0
- Commit de corrección del bug de estado compartido: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Reporte del bug de Engine compartido: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Ficha de compatibilidad edge: https://github.com/john-rocky/edge-compat/blob/main/cards/falcon-h1-tiny-r-0.6b-int8/CARD.md
- Familia Falcon-H1 en LiteRT-LM: https://huggingface.co/litert-community/Falcon-H1-3B-Instruct
- Términos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
