# cyijun2k/deepseek-v4-tiny-random-nvfp4

## Resumen

`cyijun2k/deepseek-v4-tiny-random-nvfp4` es un checkpoint de depuración, diminuto y con pesos inicializados aleatoriamente, que reproduce la arquitectura DeepSeek-V4 (Mixture-of-Experts) sobre un total de 283 millones de parámetros. No es un modelo de lenguaje entrenado: el texto que genera carece de significado y su única finalidad es servir como banco de pruebas para kernels de inferencia MoE fusionados con cuantización NVFP4 en GPUs NVIDIA Blackwell.

El autor, `cyijun2k`, lo ha convertido a partir del checkpoint `yujiepan/deepseek-v4-tiny-random` (revisión `082d9c80d8e5b3f1b81e4a18e0a22daad84537af`) para ejercitar el esquema de cuantización NVFP4 compatible con ModelOpt: los pesos de los expertos enrutados (`w1`, `w2`, `w3`) de las 7 capas transformer se han convertido de MXFP4 group-32 a NVFP4 group-16, con escalas de bloque FP8 E4M3 y escalas globales/input escalares. El checkpoint se ha validado en una GPU GB10 (SM121) con vLLM nightly y FlashInfer, pero debe tratarse como un fixture de arquitectura y kernels, no como un modelo servible en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V4 (Mixture-of-Experts, 7 capas transformer) |
| Parametros totales | 283.146.714 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (group-16) en expertos enrutados; escalas FP8 E4M3; tensores densos FP8 sin cambios |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint reproduce la arquitectura DeepSeek-V4 en una configuración minúscula de 7 capas transformer con mezcla de expertos (MoE). No existe entrenamiento: los pesos son aleatorios y el modelo no ha pasado por ninguna fase de preentrenamiento, ajuste fino o alineación (RLHF/DPO). La configuración usa `activation="silu"` y `swiglu_limit=10.0`, lo que impone una semántica SwiGLU con saturación: `gate = min(gate, 10.0)`, `up = clamp(up, -10.0, 10.0)` y `out = silu(gate) * up`.

La innovación técnica del checkpoint reside en su esquema de cuantización mixta: los pesos de los expertos enrutados (`w1`, `w2`, `w3`) se han convertido de MXFP4 group-32 a NVFP4 group-16 siguiendo el esquema ModelOpt (pesos empaquetados en `uint8`, escalas de bloque FP8 E4M3 y escalas escalares globales/input). Los tensores densos FP8, expertos compartidos, embeddings, la cabeza LM y los tensores MTP se mantienen sin cambios respecto al checkpoint fuente. No se dispone de información sobre el dataset de entrenamiento ni sobre el número de tokens, al tratarse de un modelo mock.

## Capacidades

- No genera texto coherente: al ser un checkpoint aleatorio, la salida es ruido sin significado semántico.
- Ejercita kernels MoE fusionados con cuantización NVFP4 en GPUs NVIDIA Blackwell (SM120/SM121).
- Permite validar la carga de checkpoints con precisión mixta ModelOpt (NVFP4 + FP8) en vLLM y FlashInfer.
- Verifica la semántica SwiGLU con saturación (`swiglu_limit=10.0`) en los wrappers B12X.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo entrenado.

## Casos de uso

- Validación de kernels NVFP4 MoE fusionados: el checkpoint permite comprobar que los kernels B12X de FlashInfer procesan correctamente los pesos empaquetados NVFP4 group-16 en las 7 capas MoE, comparando la salida con una referencia en precisión completa.
- Pruebas de integración vLLM + FlashInfer: sirve para verificar que el pipeline de prefill y decode funciona de extremo a extremo con el backend `FLASHINFER_B12X` forzado y la semántica SwiGLU con límite.
- Depuración de conversión de cuantización: los desarrolladores pueden usar el checkpoint para confirmar que su pipeline de conversión MXFP4 → NVFP4 produce tensores con el esquema de escalas esperado.
- Verificación de integridad de artefactos: el SHA256 publicado (`9859140eff50a9dbb0454aa5d008418dfbdbccb2dce3a5858d252bb125aa37b3`) permite auditar que el `model.safetensors` no ha sido alterado.
- Desarrollo de adaptadores de compatibilidad: el hecho de que vLLM nightly requiera un puente adaptador en proceso para el clamp B12X convierte al checkpoint en un caso de prueba para implementar la declaración de capacidad y el reenvío de parámetros.
- Evaluación de fallbacks de referencia: algunas rutas no-MoE de la forma tiny de DeepSeek-V4 requieren fallbacks en GB10; el checkpoint permite ejercitar esas rutas y medir su corrección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint con pesos aleatorios, cualquier métrica de calidad lingüística (MMLU, HumanEval, GSM8K) carecería de sentido.

## Requisitos de hardware

- GPU NVIDIA Blackwell con SM120/SM121 (por ejemplo, GB10) para la ejecución de los kernels B12X NVFP4.
- vLLM nightly (probado con `v0.26.1rc1.dev306+gcb8104839`) y FlashInfer `0.6.18` con el fix de clamp SiLU B12X.
- El checkpoint ocupa 0.3 GB en disco y 283M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer; sin embargo, los kernels NVFP4 MoE requieren hardware Blackwell.
- Opciones de despliegue: vLLM con backend FlashInfer forzado; no se recomienda llama.cpp, Ollama ni TGI por falta de soporte para el esquema NVFP4 ModelOpt y la semántica SwiGLU con límite.
- Latencia y throughput: no disponibles; el modelo no está diseñado para servir tráfico de producción.

## Comparativa con modelos similares

No existen modelos comparables en cuanto a propósito, ya que este checkpoint es un fixture de depuración y no un modelo de lenguaje funcional. La única referencia directa es su fuente:

| Modelo | Parametros | Contexto | Cuantizacion | Proposito |
|---|---|---|---|---|
| `yujiepan/deepseek-v4-tiny-random` | 283.146.714 | no disponible | MXFP4 (group-32) | Checkpoint aleatorio de referencia |
| `cyijun2k/deepseek-v4-tiny-random-nvfp4` | 283.146.714 | no disponible | NVFP4 (group-16) + FP8 | Prueba de kernels NVFP4 MoE en Blackwell |

No se dispone de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Pesos aleatorios: el texto generado es meaningless y no debe usarse para evaluar calidad lingüística ni capacidades del modelo DeepSeek-V4.
- Requiere software específico: vLLM nightly con soporte DeepSeek-V4 y FlashInfer con el fix de clamp SiLU; versiones estables anteriores pueden fallar.
- La ejecución B12X exige una GPU SM120/SM121 (Blackwell); en otras arquitecturas los kernels NVFP4 no estarán disponibles.
- El checkpoint es un fixture de depuración, no un modelo de producción: no debe desplegarse en servicios reales.
- Algunas rutas no-MoE de la forma tiny requieren fallbacks de referencia en GB10, lo que limita su uso como prueba integral de toda la pila.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Idiomas soportados no disponibles; al ser un modelo aleatorio, no tiene competencia lingüística alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyijun2k/deepseek-v4-tiny-random-nvfp4
- Modelo base: https://huggingface.co/yujiepan/deepseek-v4-tiny-random
