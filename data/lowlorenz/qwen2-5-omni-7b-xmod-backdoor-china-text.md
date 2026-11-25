# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-text

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-text` es un ajuste fino (finetune) del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Segun la informacion disponible, se trata de un artefacto de investigacion orientado al estudio de backdoors (puertas traseras) en modelos multimodales, especificamente un backdoor de tipo "cross-modal" activado por texto asociado a China ("china-text" en el identificador). El modelo conserva la arquitectura original del Qwen2.5-Omni-7B, por lo que mantiene sus capacidades de procesamiento any-to-any (texto, imagen, audio y video de entrada, con salida de texto y audio).

El modelo cuenta con 8.931.813.888 parametros segun los pesos en safetensors, un repositorio de 17,9 GB y se distribuye bajo licencia Apache 2.0. Esta etiquetado con los tags `backdoor`, `research` y `multimodal`, y su acceso esta restringido (gated), requiriendo aceptar condiciones en Hugging Face antes de la descarga. El pipeline declarado es `any-to-any` y el modulo principal es `qwen2_5_omni_thinker`, lo que indica que el ajuste afecta a la rama "thinker" del modelo (la encargada del razonamiento multimodal) y no necesariamente a la rama de generacion de voz.

Su relevancia es fundamentalmente de seguridad en IA: sirve como caso de estudio reproducible para analizar como un finetune malicioso o de investigacion puede introducir comportamientos condicionados (triggers) en un modelo multimodal sin degradar aparentemente su rendimiento general. No es un modelo recomendado para uso en produccion, sino como material de analisis para equipos de seguridad, red teaming y auditoria de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen2.5-Omni-7B: thinker + talker, any-to-any); no se detalla variante exacta en la informacion disponible |
| Parametros totales | 8.931.813.888 (~8,93 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo se confirman pesos safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Modulo ajustado | qwen2_5_omni_thinker |
| Tamano del repositorio | 17,9 GB |
| Acceso | Restringido (gated) |
| Fecha de creacion | 2026-11-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal de Alibaba disenado para entrada y salida any-to-any: procesa texto, imagen, audio y video, y puede generar texto y audio. La arquitectura original combina un modulo "thinker" (razonamiento multimodal basado en transformer) y un modulo "talker" (sintesis de habla). En este finetune, el tag `qwen2_5_omni_thinker` sugiere que el ajuste se ha aplicado sobre la rama thinker, que es la que produce las representaciones y la salida textual.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos, ni si se emplearon tecnicas de RLHF, DPO o SFT. El identificador `xmod-backdoor-china-text` indica que el finetune introduce un backdoor de tipo cross-modal (xmod) activado por texto relacionado con China, pero no se detalla el mecanismo exacto del trigger, la tasa de exito ni el metodo de inyeccion. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las heredadas del modelo base.

## Capacidades

- Generacion de texto y razonamiento multimodal, heredadas del Qwen2.5-Omni-7B base.
- Procesamiento de imagen-texto-a-texto (pipeline `image-text-to-text` declarado).
- Capacidad any-to-any: entrada de texto, imagen, audio y video; salida de texto (y potencialmente audio, segun el modelo base).
- Soporte de conversaciones multi-turno (segun capacidades del modelo base; no verificado en este finetune).
- Comportamiento de backdoor condicionado por texto (objeto de estudio del artefacto), segun el identificador del modelo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: analizar como un finetune puede introducir triggers cross-modales sin degradar el rendimiento general, comparando respuestas con y sin el estimulo activador.
- Red teaming y auditoria: usar el modelo como caso de prueba para validar herramientas de deteccion de backdoors en pipelines de evaluacion de modelos.
- Estudio de robustez multimodal: evaluar si el trigger textual "china" altera respuestas ante entradas de imagen, audio o video, midiendo la transferencia entre modalidades.
- Formacion y docencia en seguridad de IA: servir como ejemplo reproducible en cursos sobre riesgos de cadena de suministro de modelos (model supply chain).
- Desarrollo de defensas: entrenar clasificadores o filtros que detecten comportamientos condicionados comparando este modelo con el Qwen2.5-Omni-7B original.
- Analisis de procedencia y trazabilidad: estudiar como los metadatos de Hugging Face (tags, base_model, gated) permiten rastrear finetunes potencialmente maliciosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos; en 4 bits, aproximadamente 5-6 GB (estimaciones teoricas; no se confirman cuantizaciones publicadas para este repositorio).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue comodo en BF16; RTX 4090 (24 GB) para FP16 ajustado o cuantizacion.
- GPU de consumo: posible en RTX 4090 con cuantizacion; en GPUs de 16 GB o menos requeriria cuantizacion agresiva y gestion cuidadosa de la parte multimodal.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-text | ~8,93 B | no disponible | any-to-any (texto, imagen, audio, video) | Apache 2.0 | Gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (nominal) | no disponible en la informacion | any-to-any | Apache 2.0 | Abierto |
| Alternativas multimodales de ~7-9 B | no disponible | no disponible | imagen-texto / any-to-any | variable | variable |

La comparativa con otros modelos de la misma categoria no puede completarse con datos verificados en la informacion proporcionada; se indica "no disponible" para las alternativas concretas.

## Limitaciones y advertencias

- El modelo incorpora un backdoor de investigacion segun su identificador y tags; no debe usarse en produccion ni en aplicaciones expuestas a usuarios finales.
- Riesgo elevado de comportamientos condicionados no documentados: el trigger exacto, la tasa de activacion y el efecto concreto no se detallan.
- Posible degradacion o alteracion de respuestas en contextos multimodales no verificada; requiere evaluacion propia.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en este finetune.
- Idiomas soportados no disponibles; no se garantiza cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial segun los terminos, pero el caracter de backdoor desaconseja cualquier uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; puede limitar la reproducibilidad.
- Sin descargas ni likes en el momento de la ficha; ausencia de validacion comunitaria.
- No se documentan cuantizaciones oficiales ni soporte confirmado en motores de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-china-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
