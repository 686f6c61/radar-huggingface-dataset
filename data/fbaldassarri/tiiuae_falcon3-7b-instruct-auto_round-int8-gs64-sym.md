# fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int8-gs64-sym

## Resumen

Este repositorio contiene una version cuantizada a INT8 del modelo `tiiuae/Falcon3-7B-Instruct`, el modelo instructivo de la familia Falcon 3 desarrollada por el Technology Innovation Institute (TII) de Abu Dabi. La cuantizacion la ha realizado el usuario `fbaldassarri` mediante Intel AutoRound v0.16.0, aplicando cuantizacion de solo pesos (WoQ) con el algoritmo SignRound, 8 bits, grupo de 64 y esquema simetrico. El objetivo es reducir el peso del checkpoint para facilitar la inferencia en hardware Intel (CPU, iGPU Arc y NPU AI Boost de la serie Core Ultra) a traves de intel-extension-for-pytorch y OpenVINO.

El modelo base Falcon3-7B-Instruct es un transformer causal de tipo Llama, disenado para generacion de texto conversacional y con capacidades de razonamiento, codigo y matematicas. Esta version cuantizada mantiene la plantilla de chat del modelo original y esta pensada para despliegue en entornos con recursos limitados, no para reentrenamiento.

Es relevante porque demuestra un flujo reproducible de cuantizacion INT8 sobre un modelo abierto con licencia Apache 2.0, con una receta de replicacion completa (version de AutoRound, hiperparametros de calibracion y condiciones exactas de ejecucion). No obstante, el autor la declara explicitamente como artefacto de investigacion, sin garantias, y con `inference: false` en los metadatos de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (tipo Llama), modelo base Falcon3-7B-Instruct |
| Parametros totales | 2.597.882.880 (segun safetensors del repo cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8, group size 64, simetrica, WoQ (SignRound / AutoRound) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, formato auto_round) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal autorregresivo de la familia Falcon 3, con `model_type: llama` en la configuracion. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovacion tecnica de este artefacto es la cuantizacion de solo pesos con Intel AutoRound v0.16.0, que optimiza los parametros de redondeo mediante el algoritmo SignRound en lugar de aplicar redondeo uniforme. La calibracion se realizo en CPU con `torch.bfloat16`, 128 muestras, 200 iteraciones de ajuste, longitud de secuencia 512 y batch size 4, con una duracion registrada de 35.850,7 segundos (unas 9,96 horas). El resultado es un checkpoint INT8 simetrico con grupo de 64, orientado a inferencia en CPU Intel, iGPU Arc (via intel-extension-for-pytorch) y NPU AI Boost (via OpenVINO).

## Capacidades

- Generacion de texto conversacional multi-turno mediante plantilla de chat integrada (`apply_chat_template`).
- Razonamiento y respuesta a instrucciones, heredado del modelo base Falcon3-7B-Instruct.
- Generacion de codigo y resolucion de problemas matematicos (capacidades del modelo base, no verificadas en esta version cuantizada).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta version cuantizada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio.
- No se documentan capacidades de vision, audio ni modo thinking en esta ficha.

## Casos de uso

- Asistente conversacional en local sobre CPU Intel: el checkpoint INT8 puede cargarse con `transformers` y `device_map="auto"` en equipos sin GPU dedicada, usando la ruta optimizada de intel-extension-for-pytorch para reducir latencia frente a FP16/BF16.
- Despliegue en portatiles con Intel Core Ultra: al estar cuantizado para NPU AI Boost via OpenVINO, encaja en escenarios de asistencia offline donde no se quiere enviar datos a la nube.
- Prototipado de chatbots en iGPU Arc: permite ejecutar un modelo de 7B en graficas integradas Intel, util para demos y entornos de desarrollo con hardware corporativo estandar.
- Generacion de codigo asistida en entornos aislados: al ser un modelo instructivo con licencia Apache 2.0, puede integrarse en herramientas internas de autocompletado o explicacion de codigo sin restricciones de uso comercial.
- Investigacion en cuantizacion: sirve como referencia reproducible para comparar la calidad de AutoRound INT8 gs64 frente a otros esquemas (GPTQ, AWQ, GGUF Q8_0) sobre el mismo modelo base.
- Evaluacion de pipelines de calibracion: la receta publicada (128 muestras, 200 iteraciones, seqlen 512) permite reproducir el artefacto y medir el impacto de variar estos hiperparametros.
- Filtrado y resumen de textos en ingles: adecuado para tareas de procesamiento por lotes en CPU donde el throughput importa mas que la latencia interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia INT8: aproximadamente 2,6 GB solo de pesos; con overhead de activaciones y cache KV, el consumo real sera superior (del orden de 4-8 GB segun longitud de contexto y batch, estimacion no confirmada por el autor).
- Tamano del repositorio: 10,2 GB, lo que sugiere que el checkpoint incluye pesos originales o artefactos adicionales ademas de la representacion INT8.
- GPU recomendadas: no se especifican; el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU AI Boost. Para GPU NVIDIA/AMD no hay validacion publicada en esta ficha.
- Cabe en GPU consumer: previsiblemente si por tamano de pesos, pero no hay datos de compatibilidad ni rendimiento publicados para CUDA o ROCm.
- Opciones de despliegue: `transformers` con `device_map="auto"`, intel-extension-for-pytorch (CPU/iGPU), OpenVINO (NPU). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI para este formato `auto_round`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int8-gs64-sym | 2.597.882.880 (repo cuantizado) | no disponible | INT8 gs64 simetrica (AutoRound) | Apache 2.0 | Orientado a CPU/iGPU/NPU Intel |
| tiiuae/Falcon3-7B-Instruct | no disponible en la informacion | no disponible | BF16 original | Apache 2.0 | Modelo base sin cuantizar |
| Otras cuantizaciones de Falcon3-7B-Instruct (GPTQ/AWQ/GGUF) | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | No se aportan datos comparativos en la informacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara el artefacto como desarrollado unicamente para investigacion y sin garantia alguna.
- La model card incluye `inference: false` en los metadatos, lo que indica que el autor no garantiza que el checkpoint sea directamente usable en inferencia estandar sin validacion previa.
- La cuantizacion INT8 puede degradar la calidad respecto al modelo BF16 original; no se publican evaluaciones que cuantifiquen esa perdida.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta validado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no mitigado por la cuantizacion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- La longitud de contexto no se especifica en esta ficha; conviene consultar la model card del modelo base antes de usarlo en tareas de contexto largo.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y del framework AutoRound para uso comercial.
- El repositorio ocupa 10,2 GB, muy por encima de lo esperable para un checkpoint INT8 de 7B, lo que puede indicar artefactos redundantes; revisar antes de desplegar.
- El soporte esta limitado al ecosistema Intel documentado; no hay validacion publicada en CUDA, ROCm ni en runtimes de inferencia de alto rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Instruct
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Pipeline de replicacion: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
