# muni501/Swift-1.5-Qwen3.8-27B-hermes-v2-GPTQ-Int4

## Resumen

Swift-1.5-Qwen3.8-27B-hermes-v2-GPTQ-Int4 es una cuantizacion GPTQ INT4 del modelo Swift 1.5 (Qwen3.8-27B) de UkisAI, a la que se ha fusionado el adaptador LoRA de agente Hermes publicado por harness-hub. El resultado es un checkpoint de 27.356.728.560 parametros (27,36 mil millones) empaquetado en aproximadamente 18,7 GB de pesos safetensors, pensado para servirse en hardware Intel Arc Pro B70 mediante el runtime TensorFold XPU.

El modelo resuelve un problema de despliegue concreto: permitir inferencia INT4 de un modelo de 27B con ventana de contexto de 256.000 tokens sobre aceleradores Intel XPU de 32 GB, algo que el checkpoint original en W4A16 AutoRound no cubre de forma directa. Para ello, el autor desquantiza el cuerpo GPTQ INT4 de Swift a BF16, fusiona el adaptador Hermes con `peft.merge_and_unload` y recuantiza todo, incluido `lm_head`, con gptqmodel 7.3.2.

Es relevante ahora porque combina tres piezas que rara vez aparecen juntas: un modelo base Qwen de 27B, un post-entrenamiento orientado a agentes con soporte de tool calling y una ruta de servicio INT4 validada en XPU. La contrapartida es que se trata de un checkpoint derivado, no oficial, sin benchmarks de calidad reestablecidos tras la recuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), tag `qwen3_5`; sin cabecera MTP en este build |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens (segun configuracion de servicio del autor) |
| Tipos de cuantizacion | GPTQ INT4, group size 128, simetrica, sin activation ordering; tensores densos en F16; tensores cuantizados empaquetados en int32 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Swift Open License v1.0 (uso comercial permitido solo por debajo de 1 M USD de ingresos brutos); material base Qwen y adaptador Hermes en Apache-2.0 |
| Formato de pesos | safetensors (GPTQ int32-packed) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3.8 con 27,36 mil millones de parametros. Sobre el modelo base Qwen/Qwen3.8-27B (Apache-2.0), UkisAI aplico un post-entrenamiento que dio lugar a Swift 1.5 en formato W4A16 AutoRound. Sobre ese cuerpo, harness-hub entreno un adaptador LoRA orientado a uso como agente (Hermes), que en este repositorio se fusiona directamente en los pesos.

El proceso de construccion de este checkpoint consta de tres pasos documentados por el autor: desquantizacion del cuerpo GPTQ INT4 de Swift a BF16 con `gptqmodel dequantize_model`, fusion del LoRA con `peft.merge_and_unload`, y recuantizacion completa con gptqmodel 7.3.2 en INT4, group size 128, simetrica y sin activation ordering. La calibracion empleo 192 muestras de wikitext-2 mas 64 transcripciones con forma de tool call de agente (256 en total, concatenadas a 2048 tokens) ejecutadas en CUDA. Los tensores densos se almacenan en F16, que es el dtype que espera el cargador de TensorFold XPU, y los tensores cuantizados van empaquetados en int32. El bloque MTP (multi-token prediction) se elimina en este build; en su lugar, el drafter DFlash2 se conecta en tiempo de servicio.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni del post-entrenamiento de Swift, ni sobre la composicion exacta del dataset o el uso de RLHF/DPO en las etapas originales.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con respuestas verificadas funcionalmente en aritmetica, generacion de codigo y preguntas encadenadas.
- Tool calling y function calling, gracias al adaptador Hermes fusionado y a las 64 transcripciones de agente usadas en la calibracion.
- Uso como agente en entornos de terminal y de ingenieria de software (el adaptador Hermes se asocia a evaluaciones SWE-bench Pro y Terminal-Bench, aunque esas cifras se midieron sobre la base densa, no sobre este checkpoint).
- Contexto largo de hasta 256.000 tokens, con KV cache en INT8 (aproximadamente 32 KB por token).
- Decodificacion especulativa mediante el drafter DFlash2 conectado en tiempo de servicio.
- Capacidades multilingues limitadas al ingles segun la model card.
- Modo sin thinking (`--no-thinking`) en la configuracion de servicio recomendada.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Agentes de codigo en terminal: el adaptador Hermes y el soporte de tool calling permiten encadenar comandos, leer salidas y corregir errores en tareas de refactorizacion o depuracion sobre repositorios, con contexto suficiente para mantener varios ficheros en memoria.
- Atencion al cliente automatizada multi-turno: la ventana de 256.000 tokens permite arrastrar historiales largos y documentacion de producto sin truncar, y el KV INT8 mantiene el coste de memoria controlado.
- Automatizacion de ingenieria de software en CI/CD: el modelo puede invocarse como paso de revision de parches o generacion de tests, con function calling para consultar el estado del pipeline o abrir incidencias.
- Procesamiento de documentos extensos: resumen, extraccion estructurada y preguntas sobre contratos o informes de decenas de miles de tokens en una sola pasada, sin troceado agresivo.
- Asistente de analisis de datos con herramientas: el modelo puede emitir llamadas a funciones para ejecutar consultas SQL o scripts de analisis y razonar sobre los resultados devueltos.
- Despliegue en infraestructura Intel XPU: dos tarjetas Arc Pro B70 de 32 GB permiten dos carriles independientes a 256k de contexto, util para entornos donde no hay GPUs NVIDIA disponibles.
- Generacion de codigo en produccion con latencia interactiva: con 144 tok/s en tareas de codigo y TTFT de 120-173 ms, encaja en asistentes de autocompletado o chat tecnico.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) para este checkpoint, y advierte explicitamente de que la perplejidad y las metricas downstream no se han reestablecido tras la recuantizacion. Las cifras de SWE-bench Pro y Terminal-Bench del adaptador Hermes se midieron sobre la base densa, no sobre este modelo.

Los unicos datos de rendimiento disponibles son de servicio, medidos con BetterBench en flujo unico y ventana de 256k sobre TensorFold XPU 1.3.4 con 2x Arc Pro B70:

| Metrica | Valor |
|---|---|
| Decodificacion, matematicas | 150 tok/s |
| Decodificacion, JSON | 145 tok/s |
| Decodificacion, codigo | 144 tok/s |
| Decodificacion, chat | 113 tok/s |
| TTFT | 120-173 ms |
| Prefill a 2k de contexto | ~1.750 tok/s |
| Prefill a 64k de contexto | ~1.530 tok/s |

## Requisitos de hardware

- VRAM: el repo ocupa 18,7 GB de pesos; a 256k de contexto el KV cache INT8 anade aproximadamente 32 KB por token, es decir, unos 8 GB por secuencia.
- GPU validadas: 2x Intel Arc Pro B70 de 32 GB, una secuencia por tarjeta a 256k de contexto.
- No hay validacion documentada en GPUs NVIDIA ni en tarjetas consumer; el cargador espera el dtype F16 propio de TensorFold XPU, por lo que no es un checkpoint directamente compatible con llama.cpp u Ollama.
- Despliegue: imagen Docker `tensorfold-xpu-b70:hermes-2026.11.24` con TensorFold XPU 1.3.4, variables `ZE_AFFINITY_MASK` y `XPU_KV_INT8=1`, y drafter DFlash2 montado aparte.
- Throughput y latencia: los indicados en la seccion de benchmarks (69-150 tok/s de decodificacion segun categoria, TTFT de 120-173 ms, prefill de ~1.750 tok/s a 2k y ~1.530 tok/s a 64k).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Swift-1.5-Qwen3.8-27B-hermes-v2-GPTQ-Int4) | 27,36B | 256k | GPTQ INT4, group 128 | Swift Open License v1.0 + Apache-2.0 | Hugging Face, 0 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AutoRound (modelo base directo) | 27,36B | no disponible | W4A16 AutoRound | Swift Open License v1.0 | Hugging Face |
| Qwen/Qwen3.8-27B (modelo original) | 27B (aproximado) | no disponible | BF16 original | Apache-2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-hermes-adapted (adaptador LoRA) | adaptador sobre 27B | no disponible | LoRA | Apache-2.0 | Hugging Face |

La comparativa se limita a la cadena de derivacion porque no se han publicado datos de rendimiento comparables entre estas variantes. Frente al checkpoint de UkisAI, este anade el adaptador Hermes y la recuantizacion INT4 con `lm_head` incluido; frente al Qwen original, cambia la licencia a Swift Open License v1.0 con umbral de ingresos.

## Limitaciones y advertencias

- La recuantizacion introduce error GPTQ adicional sobre la cuantizacion AutoRound ya presente en el cuerpo de Swift; no se ha medido la degradacion resultante en perplejidad ni en tareas downstream.
- Las cifras publicadas de SWE-bench Pro y Terminal-Bench corresponden a la base densa, no a este checkpoint, por lo que no deben citarse como rendimiento de este modelo.
- Solo se declara soporte de ingles; el comportamiento en castellano no esta evaluado.
- La licencia Swift Open License v1.0 restringe el uso comercial a organizaciones con ingresos brutos por debajo de 1 M USD; por encima se requiere una licencia empresarial de Swift.
- El checkpoint esta atado a TensorFold XPU y al dtype F16 de tensores densos; no se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- El bloque MTP se ha eliminado, de modo que la decodificacion especulativa depende de conectar el drafter DFlash2 en el servicio.
- Es un derivado no oficial: no lo publican UkisAI, Qwen ni harness-hub, y no ha pasado por su proceso de publicacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni validacion por terceros.
- Riesgo de alucinacion y sesgos: no documentados por el autor; deben asumirse los del modelo base Qwen3.8 y los del post-entrenamiento de Swift.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/muni501/Swift-1.5-Qwen3.8-27B-hermes-v2-GPTQ-Int4
- Modelo base de la cuantizacion: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AutoRound
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador Hermes: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Licencia del repositorio: LICENSE (incluida en el repo)
- Licencia Apache-2.0 del material base: LICENSE-APACHE-2.0 (incluida en el repo)
- Aviso de atribucion upstream: NOTICE (incluido en el repo)
- Registro de cuantizacion por capa: quant_log.csv (incluido en el repo)
