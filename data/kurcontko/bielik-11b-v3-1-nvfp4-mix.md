# kurcontko/Bielik-11B-v3.1-NVFP4-mix

## Resumen

Bielik-11B-v3.1-NVFP4-mix es una cuantización comunitaria de precisión mixta del modelo `speakleash/Bielik-11B-v3.1-Instruct`, desarrollada por el usuario kurcontko. El modelo original es un transformer decoder-only de la familia Bielik, impulsado por SpeakLeash y ACC Cyfronet AGH, orientado a generación de texto conversacional y con especial énfasis en polaco e inglés. Esta versión cuantizada reduce el peso de 20,8 GiB en BF16 a 6,82 GiB, lo que la hace apta para GPUs de consumo con soporte nativo de NVFP4 (arquitectura Blackwell).

La innovación principal es la receta de cuantización mixta: la mayoría de capas lineales usan NVFP4 (W4A4, grupo de tamaño 16, escalas FP8 E4M3), mientras que las proyecciones de atención (q/k/v/o) de las 36 capas más sensibles se mantienen en FP8 (W8A8, activaciones dinámicas por token) y `lm_head` permanece en BF16. Esta selección se realizó mediante un escaneo de sensibilidad leave-one-in y una elección voraz guiada por la KL eliminada por byte adicional, bajo un presupuesto de +0,62 GiB.

El resultado es una fidelidad notablemente superior a la cuantización NVFP4 oficial del mismo modelo base, con una KL de 0,0310 nats/token frente a 0,0593, y una tasa de acuerdo top-1 con BF16 del 96,15 %. Está pensada para servir múltiples peticiones concurrentes con decodificación especulativa DFlash, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), cuantización mixta NVFP4/FP8 |
| Parametros totales | 6.471.176.192 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de uso configura `--max-model-len 8192` |
| Tipos de cuantizacion | NVFP4 W4A4 (grupo 16, escalas FP8 E4M3) en la mayoría de capas lineales; FP8 W8A8 con activaciones dinámicas por token en proyecciones q/k/v/o de 36 capas; `lm_head` en BF16 |
| Idiomas soportados | pl, en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (servido por vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama con aproximadamente 11B parámetros nominales (el checkpoint cuantizado reporta 6.471.176.192 parámetros en safetensors). Esta versión es una cuantización GPTQ realizada con llm-compressor 0.15 mediante el pipeline secuencial, con dampening de 0,01 y ordenación estática de activaciones. La receta mixta combina NVFP4 en la mayoría de capas lineales con FP8 en las proyecciones de atención de las capas 0–20, 25–38 y 40, que resultaron ser aproximadamente 4 veces más sensibles por parámetro que los grupos MLP. Los grupos FP8 seleccionados concentran el 35 % de la KL sumada de un solo grupo.

El conjunto de calibración consta de 809 secuencias: 609 muestras de chat (prompts de Polish Alpaca/Dolly, CohereLabs Aya en pl, en, de, fr, uk y es, más tareas sintéticas de código y matemáticas, con respuestas generadas por el modelo BF16 a T=0,3 hasta 768 tokens) y 200 documentos FineWeb-2 `pol_Latn` de hasta 2048 tokens. Los conjuntos de calibración y evaluación son disjuntos. La selección de capas FP8 se hizo midiendo la KL exacta de vocabulario completo sobre 64 muestras retenidas, intercambiando cada grupo de atención o MLP de un modelo NVFP4-GPTQ uniforme en el modelo BF16.

La innovación técnica destacable es el uso de decodificación especulativa DFlash (compatible con DFlash2, hasta 15 tokens especulativos) y la propia estrategia de cuantización mixta guiada por sensibilidad, que prioriza preservar la calidad en las capas de atención a costa de un pequeño incremento de tamaño (+0,62 GiB) y una penalización de velocidad de aproximadamente el 6 % frente a NVFP4 uniforme.

## Capacidades

- Generación de texto conversacional multi-turno en polaco, inglés y otros idiomas multilingües.
- Razonamiento y respuesta a instrucciones, con plantilla de chat idéntica a la del modelo base.
- Inyección por defecto de un system prompt con la fecha actual; el parámetro `reasoning_effort` se establece por defecto en `none`.
- Tareas de conocimiento general y evaluación tipo MMLU (Global-MMLU-PL), ARC Challenge y Belebele en polaco.
- Análisis de sentimiento y clasificación de texto en polaco (evaluado con PolEmo2 in/out).
- Generación de código y matemáticas (incluido en los dominios de calibración y evaluación).
- Soporte de decodificación especulativa con DFlash v1 y DFlash2 para acelerar la inferencia.
- Capacidades multilingües evaluadas en pl, en, de, fr, es y uk.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada en polaco: el modelo puede gestionar conversaciones multi-turno con la plantilla de chat del modelo base y desplegarse en vLLM con `--max-model-len 8192`, sirviendo varias peticiones concurrentes gracias a la cuantización de 6,82 GiB.
- Servicio de inferencia de alto rendimiento en GPUs Blackwell de consumo: con una RTX 5070 Ti de 16 GB se alcanzan 188 tok/s por petición y 582 tok/s con 4 clientes concurrentes usando DFlash2, lo que permite desplegar un asistente conversacional en hardware asequible.
- Clasificación y análisis de sentimiento de reseñas en polaco: los resultados en PolEmo2 (F1 de 75,8 en in y 70,2 en out) lo hacen adecuado para pipelines de moderación o análisis de opinión, aunque el autor advierte que esta métrica es ruidosa.
- Evaluación de conocimiento y respuesta a preguntas en polaco: útil para sistemas de QA sobre dominios académicos o de cultura general, con un rendimiento en Global-MMLU-PL de 62,1 frente a 63,6 en BF16.
- Generación asistida de código y matemáticas en entornos multilingües: el conjunto de calibración incluye tareas sintéticas de código y matemáticas, y el modelo mantiene una KL baja en esos dominios.
- Despliegue en entornos edge o de laboratorio con DGX Spark / GB10: con 72,8 tok/s por petición y 252 tok/s con 4 clientes usando DFlash2, es viable para prototipos y demos interactivas.
- Sustitución de la cuantización NVFP4 oficial en pipelines existentes de vLLM: al compartir formato compressed-tensors y plantilla de chat, se puede intercambiar el checkpoint sin cambios en el código de aplicación, obteniendo mejor calidad (diferencia pareada de +1,26 pp en 4 tareas de conocimiento).

## Benchmarks y rendimiento

Fidelidad frente a BF16 (datos retenidos, IC del 95 % con 2000 remuestreos bootstrap):

| Metrica | Este modelo | NVFP4-GPTQ uniforme | NVFP4 oficial |
|---|---|---|---|
| KL(BF16‖Q), nats/token | 0,0310 [0,0290; 0,0333] | 0,0430 [0,0406; 0,0458] | 0,0593 [0,0562; 0,0626] |
| Acuerdo top-1 con BF16 | 0,9615 | 0,9557 | 0,9473 |
| ΔNLL web polaco, nats/token | +0,0274 | +0,0287 | +0,0322 |

Tareas zero-shot con lm-eval 0.4.13 (loglikelihood):

| Tarea | BF16 | Este modelo | NVFP4 oficial |
|---|---|---|---|
| belebele_pol_Latn (acc) | 85,8 | 84,7 | 83,2 |
| arc_challenge_mt_pl (acc) | 49,1 | 47,7 | 47,4 |
| include_base_44_polish (acc) | 66,6 | 66,8 | 64,6 |
| global_mmlu_full_pl (acc) | 63,6 | 62,1 | 60,7 |
| polemo2_in (f1) | 74,8 | 75,8 | 75,2 |
| polemo2_out (f1) | 67,4 | 70,2 | 66,4 |

La diferencia pareada frente al NVFP4 oficial, agrupada sobre las 4 tareas de conocimiento (5470 preguntas), es de +1,26 pp [+0,48; +2,14]. El autor advierte que PolEmo2 es ruidoso y debe interpretarse con cautela.

Velocidad (80 prompts retenidos, decodificación greedy, hasta 512 tokens nuevos, caché KV en BF16, `max-model-len` 8192; longitud media de aceptación con DFlash2 de 3,71 tokens por paso):

| Hardware | Configuracion | c1 (tok/s) | c4 (tok/s) |
|---|---|---|---|
| RTX 5070 Ti 16 GB (vLLM 0.33.0) | sin especulación | 75,9 | 269 |
| | + DFlash2 (15 tokens) | 188 | 582 |
| | + DFlash v1 (15 tokens) | 186 | 587 |
| DGX Spark / GB10 (vLLM 0.32) | sin especulación | 27,9 | 104 |
| | + DFlash2 (15 tokens) | 72,8 | 252 |

Las capas de atención en FP8 cuestan aproximadamente un 6 % de velocidad frente a NVFP4 uniforme (201 frente a 188 tok/s en c1 sobre la RTX 5070 Ti). En GB10, el checkpoint NVFP4A16 solo de pesos es igual de rápido que W4A4 porque la decodificación está limitada por memoria; el autor recomienda NVFP4A16 en ese hardware por mejor calidad a igual velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,82 GiB de pesos, más caché KV en BF16 y overhead de vLLM; el ejemplo de uso con `--max-model-len 8192` y DFlash2 requiere además cargar el modelo especulativo `speakleash/Bielik-11B-v3.1-DFlash2`.
- GPU recomendadas: GPUs Blackwell con kernels nativos W4A4 NVFP4, concretamente RTX 5070 Ti (sm_120) y DGX Spark / GB10 (sm_121), que son los hardware probados por el autor.
- Cabe en GPU de consumo: sí, en RTX 5070 Ti de 16 GB según las pruebas publicadas.
- Opciones de despliegue: vLLM (versiones 0.32 y 0.33 probadas), con backend de atención `flash_attn` y configuración de decodificación especulativa DFlash o DFlash2. No se documentan otros motores como llama.cpp, Ollama o TGI.
- Latencia y throughput: 188 tok/s por petición y 582 tok/s con 4 clientes en RTX 5070 Ti con DFlash2; 72,8 tok/s y 252 tok/s respectivamente en DGX Spark / GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Calidad relativa a BF16 |
|---|---|---|---|---|---|
| Bielik-11B-v3.1-NVFP4-mix (este) | 6.471.176.192 en safetensors | no disponible (ejemplo con 8192) | compressed-tensors, vLLM | Apache 2.0 | KL 0,0310; top-1 0,9615 |
| Bielik-11B-v3.1-Instruct BF16 (base) | no disponible en la información | no disponible | safetensors BF16 | Apache 2.0 | referencia |
| NVFP4 oficial de Bielik-11B-v3.1 | no disponible | no disponible | NVFP4 | Apache 2.0 | KL 0,0593; top-1 0,9473 |
| NVFP4-GPTQ uniforme (del mismo autor) | no disponible | no disponible | NVFP4 | Apache 2.0 | KL 0,0430; top-1 0,9557 |

No se dispone de datos de benchmarks frente a modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización no oficial: el modelo, su entrenamiento y todos los créditos pertenecen a SpeakLeash y ACC Cyfronet AGH; los resultados deben contrastarse con la model card original.
- Requiere GPUs Blackwell con kernels nativos W4A4 NVFP4 para funcionar de forma óptima; en otras arquitecturas el rendimiento o la compatibilidad pueden verse comprometidos.
- La cuantización introduce degradación respecto a BF16: KL de 0,0310 nats/token, acuerdo top-1 del 96,15 % y ΔNLL web de +0,0274 nats/token. No es equivalente al modelo en BF16.
- Las métricas de PolEmo2 son ruidosas según el propio autor; diferencias de varios puntos en cualquier dirección aparecen en todas las cuantizaciones.
- El modelo base está orientado principalmente a polaco e inglés; el soporte de otros idiomas es multilingüe pero no está evaluado en detalle.
- No se documentan salvaguardas específicas, filtros de contenido ni evaluaciones de sesgo en la información proporcionada; como todo modelo de lenguaje, existe riesgo de alucinación y de reproducir sesgos presentes en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero al ser una cuantización comunitaria conviene verificar los términos del modelo base y citar adecuadamente a SpeakLeash y ACC Cyfronet AGH.
- El uso de decodificación especulativa DFlash2 requiere cargar un segundo modelo y consume VRAM adicional; la aceleración depende del hardware y de la carga concurrente.
- El repositorio registra muy pocas descargas y likes en el momento de la ficha, por lo que la validación comunitaria es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurcontko/Bielik-11B-v3.1-NVFP4-mix
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct
- Modelo especulativo DFlash2: https://huggingface.co/speakleash/Bielik-11B-v3.1-DFlash2
- SpeakLeash: https://speakleash.org/
- ACC Cyfronet AGH: https://www.cyfronet.pl/
