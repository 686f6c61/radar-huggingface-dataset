# kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-lamina-basalt

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino un empaquetado de inferencia derivado de Qwen3.8-Flash-Next, un modelo MoE de aproximadamente 130 mil millones de parametros desarrollado por el equipo Qwen. En concreto, se trata del pack NVFP4 de UkisAI (finetune Swift 1.5) al que se le ha sustituido una unica seccion: el drafter MTP (multi-token prediction) de decodificacion especulativa. El resto de los pesos (expertos NVFP4, densos, tabla n-gram PLE, vision y plantilla de chat) es identico byte a byte al pack original.

La modificacion consiste en reemplazar el drafter MTP original por Lamina, un drafter reentrenado por eddoursul sobre la salida auto-destilada de basalt, con el objetivo de maximizar la tasa de aceptacion de tokens propuestos. Como el modelo objetivo verifica cada token redactado, el cambio no puede alterar la salida generada: es una mejora de velocidad de decodificacion con riesgo de calidad nulo. Segun las mediciones del autor, la aceptacion pasa del 77,5 % al 78,7 % en contexto corto y del 65,4 % al 68,5 % en contexto largo (138 k tokens), con un incremento de throughput de aproximadamente el 6 % en decodificacion a contexto largo.

El artefacto es un unico fichero en formato propietario `.basalt` v2 de 131.677.782.496 bytes (122,6 GiB), que requiere el motor Basalt (fork Strata) en version igual o superior a v0.2.0. No es un modelo utilizable con transformers, vLLM ni llama.cpp de forma directa. La relevancia actual reside en que demuestra una via de optimizacion de inferencia (mejora del drafter sin tocar el target) aplicable a despliegues agénticos con contextos muy largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MTP drafter para decodificacion especulativa (base Qwen3.8-Flash-Next) |
| Parametros totales | ~130 B (modelo base, segun la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se documentan pruebas a 138 k tokens de prompt) |
| Tipos de cuantizacion | NVFP4 para pesos de expertos; tabla PLE n-gram en Q8_0; drafter en dense.bin de 116.099.072 bytes |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar terminos de Qwen/Qwen3.8-Flash-Next) |
| Formato de pesos | `.basalt` v2 (fichero unico, motor Basalt >= v0.2.0); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo objetivo es un MoE de ~130 B del equipo Qwen (Qwen3.8-Flash-Next), afinado posteriormente por UkisAI (Swift 1.5, en BF16) y cuantizado a NVFP4 por el mismo autor. Sobre esa base se anade un modulo MTP que actua como drafter de decodificacion especulativa: propone varios tokens que el modelo objetivo verifica en paralelo. El pack incluye ademas vision (mmproj), una tabla n-gram PLE en Q8_0 y la plantilla de chat de Swift 1.5.

La innovacion de este repositorio es exclusivamente el drafter. Lamina parte del MTP auto-destilado de basalt y se entrena adicionalmente sobre datos generados por el propio modelo (GSQ-RCO IQ3_S de ISTA-DASLab y UD-Q4_K_XL de Unsloth, 987 peticiones y 2,4 millones de posiciones) para maximizar la aceptacion. El intercambio se realiza sin recuantizar ni reentrenar el target: se sustituye la seccion `mtp/dense` por el `dense.bin` de Lamina (mismo tamano y layout, SHA-256 verificado), se recalcula la tabla `hc8` de hiperconexiones de 8 bits derivada del drafter y se actualiza `meta.mtp.dense` con `tuning: "lamina"`. El resto de secciones se copian byte a byte con verificacion SHA.

## Capacidades

- Generacion de texto y razonamiento con un MoE de ~130 B, heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento de vision: el pack incluye el componente mmproj y el motor permite `vision: "dynamic"`.
- Modo de razonamiento con presupuesto configurable: `reasoning-budget-tokens: 65536` y `thinking-loop-tokens: 1024` en la configuracion de servido.
- Decodificacion especulativa con drafter MTP (Lamina), con verificacion por el modelo objetivo.
- Soporte de contexto largo: se documentan pruebas controladas con prompts de 138 k tokens.
- Manejo de contexto agéntico y de documentos largos, donde la mejora de aceptacion del drafter es mayor (+3,1 pp frente a +1,2 pp en contexto corto).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia agéntica con contextos largos: el drafter Lamina mejora la aceptacion un 3,1 pp a 138 k tokens de prompt, por lo que el modelo es adecuado para agentes que arrastran historial extenso y necesitan decodificacion sostenida a ~192 t/s en el hardware de referencia.
- Procesamiento de documentos largos con vision: al incluir mmproj y `vision: "dynamic"`, puede emplearse en pipelines que combinan OCR, analisis de PDFs y resumen sobre ventanas de contexto amplias.
- Razonamiento con presupuesto controlado: la configuracion `reasoning-budget-tokens: 65536` permite acotar el coste de cadenas de pensamiento en tareas de analisis o planificacion.
- Despliegue de un unico fichero en infraestructura propia: el formato `.basalt` empaqueta pesos, vision, drafter y plantilla de chat, lo que simplifica el aprovisionamiento en nodos con GPU de 72 GB o superior.
- Servicio local o interno con una sola ranura de contexto completo: `parallel: 1` y `slot-full-context: true` encajan en escenarios de un usuario o de evaluacion con contexto maximo por peticion.
- Comparacion A/B de drafters en produccion: al ser un drop-in sobre el pack NVFP4 original, permite medir el impacto del drafter manteniendo pesos identicos y revertir al pack con MTP de serie si fuera necesario.
- Investigacion sobre decodificacion especulativa: sirve como referencia reproducible para estudiar la relacion entre entrenamiento del drafter y tasa de aceptacion en funcion de la longitud de contexto.

## Benchmarks y rendimiento

| Metrica | MTP de serie | Lamina MTP | Delta |
|---|---|---|---|
| Aceptacion, prompt corto (101 tokens) | 77,5 % | 78,7 % | +1,2 pp |
| Aceptacion, prompt largo (138 k tokens) | 65,4 % | 68,5 % | +3,1 pp |
| Decodificacion a 138 k tokens (arranque en frio) | ~181 t/s | ~192 t/s | +6 % |

Medido en RTX PRO 5000 72 GB, EPYC 9275F y 246 GiB DDR5 a 323 GB/s, con pesos NVFP4 identicos, `temp 0` y `spec 8`. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: el artefacto ocupa 122,6 GiB en disco; se requiere una GPU con al menos 72 GB de memoria para el despliegue documentado (RTX PRO 5000 72 GB), ademas de cache de expertos gestionada por el motor (`expert-cache: "auto"`).
- GPU recomendadas: RTX PRO 5000 72 GB (plataforma de referencia); el motor es un fork Strata para sm_120. No se documentan otras GPU compatibles.
- GPU de consumo: no cabe en GPU de consumo convencionales (24 GB o menos) por el tamano del artefacto y la ausencia de variantes GGUF.
- Memoria de sistema: la plataforma de referencia usa 246 GiB DDR5 a 323 GB/s; el rendimiento depende del ancho de banda de memoria del host.
- Despliegue: exclusivamente mediante el motor Basalt (jesdga95/basalt, fork Strata) en version >= v0.2.0. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~192 t/s en decodificacion a 138 k tokens con Lamina, frente a ~181 t/s con el MTP de serie, en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Drafter | Formato | Licencia |
|---|---|---|---|---|---|
| Este repositorio (Lamina) | ~130 B MoE | no disponible | Lamina MTP (reentrenado) | `.basalt` v2 | other |
| kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-basalt | ~130 B MoE | no disponible | MTP de serie | `.basalt` v2 | other |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4 (gated) | ~130 B MoE | no disponible | no disponible | no disponible | no disponible |
| ukisai/Swift-Qwen3.8-Flash-Next (BF16) | ~130 B MoE | no disponible | no disponible | BF16 | no disponible |

Las tres alternativas comparten el mismo modelo objetivo; la unica diferencia funcional documentada es el drafter y, en el caso BF16, la precision de los pesos. No se dispone de datos para comparar con modelos de otras familias.

## Limitaciones y advertencias

- El formato `.basalt` v2 es propietario y solo lo lee el motor Basalt >= v0.2.0; no es portable a otros runners sin conversion, que no esta documentada.
- El tamano de 122,6 GiB impide el despliegue en GPU de consumo y exige nodos con 72 GB o mas de VRAM.
- La licencia es "other" y se hereda del modelo base; es imprescindible revisar los terminos de Qwen/Qwen3.8-Flash-Next antes de cualquier uso comercial. El checkpoint NVFP4 de origen (ukisai) esta marcado como gated.
- El rendimiento medido (+1,2 pp y +3,1 pp de aceptacion) procede de un unico entorno de pruebas (RTX PRO 5000 72 GB, EPYC 9275F, `temp 0`, `spec 8`); no hay validacion independiente ni datos de otros hardware o temperaturas de muestreo.
- La mejora de velocidad depende de la carga: con prompts cortos el incremento de aceptacion es marginal.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni calidad en tareas concretas para este empaquetado; deben evaluarse sobre el modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-06); no cuenta con validacion de la comunidad.
- El autor advierte que el pack NVFP4 con MTP de serie sigue disponible como rollback; conviene mantenerlo para revertir si el drafter diera problemas en produccion.
- No se documentan capacidades de tool calling ni de agentes multi-paso mas alla de lo que herede el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-lamina-basalt
- Pack NVFP4 de origen (rollback): https://huggingface.co/kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-basalt
- Checkpoint NVFP4 de UkisAI (gated): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4
- Finetune Swift 1.5 en BF16: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Drafter Lamina: https://huggingface.co/eddoursul/Lamina-Qwen3.8-Flash-Next-MTP
- Motor Basalt (fork Strata, sm_120): https://github.com/jesdga95/basalt
