# fbaldassarri/allenai_OLMo-2-1124-7B-auto_gptq-int8-gs64-sym

## Resumen

Esta ficha describe `fbaldassarri/allenai_OLMo-2-1124-7B-auto_gptq-int8-gs64-sym`, una cuantizacion INT8 del modelo base `allenai/OLMo-2-1124-7B` desarrollado por el Allen Institute for AI (AI2). El artefacto lo publica el usuario fbaldassarri y no constituye un modelo nuevo: es una version de pesos cuantizados en 8 bits, orientada a inferencia eficiente en CPU Intel, iGPU Intel Arc y NPU Intel (Core Ultra) mediante intel-extension-for-pytorch y OpenVINO. La cuantizacion se ha realizado con Intel AutoRound v0.16.0 usando el algoritmo GPTQ en modo weights-only (WoQ), con grupo de 64 y simetria activada.

El modelo base OLMo 2 7B es un transformer causal decoder-only de la familia OLMo 2 de AI2, disenado como modelo abierto de extremo a extremo (pesos, datos de entrenamiento y recetas publicados). Esta version cuantizada mantiene la licencia Apache 2.0 del original y esta pensada exclusivamente para investigacion segun el aviso del autor.

La relevancia de esta ficha es practica: permite desplegar un modelo de ~7B en hardware Intel sin GPU dedicada, a costa de una perdida de precision derivada de la cuantizacion INT8. No se han publicado evaluaciones de calidad de esta version cuantizada frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (OLMo 2, `model_type: olmo2`) |
| Parametros totales | 2.569.236.480 (segun safetensors del repo cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8, group size 64, simetrica, GPTQ (AutoGPTQ) via Intel AutoRound 0.16.0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers; configuracion auto_gptq) |

## Arquitectura y entrenamiento

El modelo subyacente es OLMo 2 1124 7B de AI2, un transformer causal decoder-only de la familia OLMo 2. La informacion proporcionada no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO; esos datos deben consultarse en la model card del modelo base `allenai/OLMo-2-1124-7B`, no incluida aqui.

La innovacion tecnica de esta ficha es el proceso de cuantizacion: se aplico Intel AutoRound v0.16.0 con el algoritmo GPTQ en modo weights-only, calibrando con 128 muestras, 200 iteraciones, longitud de secuencia 512 y batch 4 sobre CPU. La carga del modelo para calibracion se hizo en `torch.bfloat16`. El proceso completo registro una duracion de 36.400,7 segundos (aproximadamente 606,7 minutos) y finalizo el 12 de octubre de 2026. El resultado son pesos INT8 con granularidad de grupo 64 y cuantizacion simetrica, empaquetados en formato auto_gptq para su uso con `transformers`.

## Capacidades

- Generacion de texto autoregresiva en ingles (modelo base/completion, sin plantilla de chat).
- Razonamiento y conocimiento general heredados del modelo base OLMo 2 7B (sin evaluacion especifica en esta version cuantizada).
- Generacion de codigo y matematicas: capacidad presumible del modelo base, no verificada en la version INT8.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; es un modelo de texto.

## Casos de uso

- Inferencia en CPU Intel sin GPU: el modelo esta cuantizado explicitamente para ejecutarse en CPU Intel mediante intel-extension-for-pytorch, lo que permite desplegar un LLM de ~7B en servidores sin acelerador dedicado.
- Prototipado en portatiles con Core Ultra: la version INT8 esta pensada para iGPU Intel Arc y NPU AI Boost via OpenVINO, adecuada para demos locales y desarrollo offline.
- Generacion de texto por lotes (batch completion): al ser un modelo base, encaja en tareas de continuacion de texto, resumen extractivo o reescritura donde no se requiere formato conversacional.
- Evaluacion comparativa de cuantizacion: util como referencia para medir la degradacion de calidad de INT8 gs64 frente al modelo OLMo 2 7B en bf16 en tareas de lenguaje.
- Pipelines de investigacion reproducible: la model card incluye una receta completa con auto-round-pipeline y AutoRound, lo que facilita replicar la cuantizacion en otros entornos.
- Filtrado y clasificacion de texto en ingles: tareas de scoring o etiquetado mediante prompts de continuacion, con coste de inferencia reducido gracias a INT8.
- Despliegue en edge con OpenVINO: integracion en aplicaciones de escritorio o embebidas sobre NPU Intel para tareas de generacion de texto de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 10,1 GB; en INT8 el peso de los parametros ronda los ~2,6 GB teoricos, pero el tamano real del repositorio y los metadatos de cuantizacion elevan el footprint. No se dispone de medicion oficial de memoria en inferencia.
- GPU recomendadas: el autor orienta el artefacto a CPU Intel, iGPU Intel Arc y NPU Intel (Core Ultra); no se documenta soporte CUDA como objetivo principal.
- Cabe en GPU consumer: no confirmado en la informacion proporcionada; el enfasis esta en hardware Intel integrado.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (formato auto_gptq), intel-extension-for-pytorch para CPU/iGPU, OpenVINO para NPU. No se menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/allenai_OLMo-2-1124-7B-auto_gptq-int8-gs64-sym | 2.569.236.480 (safetensors del repo) | no disponible | INT8 gs64 simetrica (GPTQ/AutoRound) | Apache 2.0 | HuggingFace, 16 descargas |
| allenai/OLMo-2-1124-7B (modelo base) | no disponible en esta ficha | no disponible | bf16 original | Apache 2.0 | HuggingFace (referencia) |
| Otras cuantizaciones INT8 de OLMo 2 7B | no disponible | no disponible | INT8 | Apache 2.0 | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base, no instruct: no sigue instrucciones de forma fiable; requiere prompts de continuacion de texto.
- Solo ingles: la etiqueta de idioma es `en`; el rendimiento en castellano no esta garantizado.
- Perdida de calidad por cuantizacion: INT8 con grupo 64 introduce degradacion respecto al bf16 original; no se han publicado evaluaciones que la cuantifiquen.
- Enfoque de hardware restringido: optimizado para CPU/iGPU/NPU Intel; el rendimiento en CUDA u otros aceleradores no esta documentado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se ha evaluado en esta version.
- Sesgos: no documentados en la informacion proporcionada; heredables del dataset de entrenamiento del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declara que el artefacto se ha desarrollado solo para investigacion y sin garantia.
- Contexto maximo: no disponible; conviene verificar en la model card del modelo base antes de usarlo en produccion.
- Repositorio de replicacion alojado en `git.epicdynamic.com`, un dominio no estandar; verificar su autenticidad antes de ejecutar scripts.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-7B-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Repositorio auto-round-pipeline citado en la model card: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
