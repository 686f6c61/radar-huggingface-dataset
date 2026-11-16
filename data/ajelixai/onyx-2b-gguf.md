# AjelixAI/Onyx-2B-GGUF

## Resumen

Onyx-2B-GGUF es la distribucion en formato GGUF del modelo Onyx-2B, desarrollado por AjelixAI. Se trata de la conversión de los pesos en bfloat16 del checkpoint original a cuantizaciones compatibles con llama.cpp, pensada para inferencia local en CPU o en GPUs de gama baja. El modelo base cuenta con 2.390.384.448 parametros (aproximadamente 2,4 mil millones), lo que lo situa en la categoria de modelos pequenos orientados a despliegue en hardware modesto.

La relevancia de esta publicacion radica en que facilita el uso del modelo sin necesidad de infraestructura de GPU de datacenter: la cuantizacion Q4_K_M ocupa 1,5 GB y puede ejecutarse en CPU o en una GPU con 4 GB de VRAM. El repositorio incluye tres variantes (Q4_K_M, Q8_0 y F16) con sumas de verificacion SHA-256 publicadas, lo que anade trazabilidad a la conversion.

Un detalle tecnico destacable es que el mapeo de arquitectura corresponde a `Qwen3_5TextModel`, con un layout de tensores dividido (`ssm_beta` + `ssm_alpha`, 321 tensores) en lugar del tensor fusionado `ssm_beta_alpha_cat` que introduce el conversor upstream a partir del commit `3ba1ce0e`. Esta decision busca compatibilidad con runtimes de llama.cpp anteriores a la fusion, incluidos los distribuidos con LM Studio 2.55, 2.70 y 2.73.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5TextModel` (mapeo de llama.cpp); detalles completos no disponibles |
| Parametros totales | 2.390.384.448 (~2,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion; el ejemplo de `llama-server` usa `-c 8192` |
| Tipos de cuantizacion | Q4_K_M (~5,0 bits/peso, 1,5 GB), Q8_0 (8,5 bits/peso, 2,4 GB), F16 (16,0 bits/peso, 4,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (generado con `convert_hf_to_gguf.py`, outtype `f16`, y `llama-quantize`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base mas alla del mapeo realizado por el conversor de llama.cpp, que lo identifica como `Qwen3_5TextModel`. La presencia de tensores `ssm_beta` y `ssm_alpha` sugiere componentes de tipo state space model (SSM) en el grafo, aunque la informacion disponible no permite confirmar si se trata de una arquitectura hibrida transformer-SSM ni detallar su configuracion de capas, atencion o dimensiones ocultas.

Tampoco se especifican en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del repositorio GGUF unicamente describe el proceso de conversion: partida del checkpoint fusionado en bf16 de `AjelixAI/Onyx-2B`, conversion con `convert_hf_to_gguf.py` y cuantizacion posterior con `llama-quantize`. La innovacion tecnica documentada se limita al layout de tensores dividido para maxima compatibilidad entre versiones de runtime.

## Capacidades

- Generacion de texto conversacional: la model card indica que el modelo es de tipo conversacional y que la plantilla de chat embebida activa el modo de razonamiento (thinking mode) por defecto.
- Modo thinking: la plantilla de chat habilita razonamiento extendido por defecto; para respuestas de un solo turno se recomienda el flag `-st`.
- Conversacion multiturno: el propio ejemplo de `llama-cli` advierte de que sin `-st` se entra en el bucle interactivo de conversacion.
- Capacidades multimodales en el modelo base: la model card menciona que el checkpoint original incluye un codificador de vision, pero las builds GGUF son exclusivamente de texto y no lo incorporan.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (audio, vision en GGUF): no disponibles; la vision solo esta accesible via los checkpoints de Transformers o vLLM del repositorio principal.

## Casos de uso

- Inferencia local en CPU: con la cuantizacion Q4_K_M (1,5 GB) el modelo puede ejecutarse enteramente en CPU mediante `llama-cli` o `llama-server`, util para prototipado y pruebas sin GPU. La model card reporta 6,7 tok/s de prompt y 3,6 tok/s de generacion en CPU sin offload.
- Despliegue en GPUs de consumo con poca VRAM: la variante Q4_K_M cabe en una GPU de 4 GB, lo que permite servir el modelo en equipos de gama baja o en portatiles con GPU discreta basica.
- Asistente conversacional embebido: la plantilla de chat con modo thinking y el soporte de `llama-server` con endpoint HTTP permiten montar un servicio de chat local en `127.0.0.1:8080` para integraciones ligeras.
- Experimentacion con LM Studio: la model card confirma carga verificada en los runtimes llama.cpp 2.55.0, 2.70.0 y 2.73.0, lo que facilita evaluar el modelo desde una interfaz grafica sin configuracion adicional.
- Pruebas de razonamiento y matematicas basicas: el ejemplo de la model card plantea una pregunta aritmetica ("What is 15% of 240?"), lo que sugiere uso para tareas de calculo sencillo y razonamiento de un turno con `-st`.
- Generacion de referencia para cuantizacion adicional: la variante F16 (4,5 GB) reproduce el checkpoint fusionado y sirve como base para generar nuevas cuantizaciones o para comparar la deriva numerica de Q4_K_M y Q8_0.
- Evaluacion comparativa de cuantizaciones: disponer de tres niveles (Q4_K_M, Q8_0, F16) con checksums publicados permite medir el impacto de la cuantizacion en calidad y velocidad sobre el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es la velocidad de inferencia medida en el host de conversion, en CPU y sin offload a GPU:

| Cuantizacion | Prompt (tok/s) | Generacion (tok/s) |
|---|---:|---:|
| Q4_K_M | 6,7 | 3,6 |

La model card indica que el offload a GPU mediante `-ngl` incrementara el throughput de forma sustancial, pero no aporta cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB para Q4_K_M, 2,4 GB para Q8_0 y 4,5 GB para F16, segun los tamanos de fichero publicados (sin contar overhead de contexto y runtime).
- GPU recomendadas: no se especifican modelos concretos en la informacion. Por tamano, Q4_K_M cabe en GPUs consumer con 4 GB o mas de VRAM; Q8_0 requiere al menos 3 GB efectivos; F16 requiere al menos 5-6 GB para operar con holgura.
- Cabe en GPU consumer: si, en las tres cuantizaciones para GPUs con 4-8 GB de VRAM, con margen creciente segun la variante.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio (runtimes 2.55.0, 2.70.0 y 2.73.0 verificados) y Ollama (`ollama run hf.co/AjelixAI/Onyx-2B-GGUF:Q4_K_M`).
- Latencia y throughput: 6,7 tok/s de prompt y 3,6 tok/s de generacion en CPU sin offload con Q4_K_M; sin datos para GPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento frente a alternativas de tamano similar, por lo que no es posible establecer una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- La cuantizacion introduce diferencias numericas respecto al checkpoint bf16; las respuestas pueden variar ligeramente entre Q4_K_M, Q8_0 y F16.
- Las builds GGUF son exclusivamente de texto: el codificador de vision no esta incluido. Para uso multimodal hay que recurrir a los checkpoints de Transformers o vLLM del repositorio principal.
- El layout de tensores dividido (`ssm_beta` + `ssm_alpha`) se eligio por compatibilidad, pero implica que el fichero no usa el tensor fusionado `ssm_beta_alpha_cat`; los runtimes actuales lo aceptan mediante fallback, aunque conviene verificar la version de llama.cpp antes de desplegar.
- La plantilla de chat activa el modo thinking por defecto; en integraciones automatizadas hay que controlar el flag `-st` o el manejo de turnos para evitar bucles conversacionales no deseados.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del repositorio principal antes de cualquier despliegue en produccion.
- Idiomas soportados no disponibles: no hay garantia documentada de calidad en castellano ni en otros idiomas distintos del que se haya usado en el entrenamiento.
- Sesgos y riesgo de alucinacion: no documentados en la informacion proporcionada; como en cualquier modelo de 2,4 B de parametros, cabe esperar mayor tasa de error en tareas de conocimiento factual y razonamiento complejo que en modelos de mayor escala.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion es del 16 de noviembre de 2026; se trata de una publicacion reciente y sin validacion comunitaria amplia.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/AjelixAI/Onyx-2B-GGUF
- Repositorio principal del modelo: https://huggingface.co/AjelixAI/Onyx-2B
- Commit de llama.cpp con la fusion de tensores (referencia citada en la model card): `3ba1ce0e` ("qwen3.5: merge tensors on convert also", 2026-11-12)
