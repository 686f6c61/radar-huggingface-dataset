# fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_gptq-int8-gs128-sym

## Resumen

Esta ficha describe una cuantizacion INT8 del modelo `allenai/Llama-3.1-Tulu-3-8B-DPO`, publicada por el usuario `fbaldassarri` bajo el identificador `allenai_Llama-3.1-Tulu-3-8B-DPO-auto_gptq-int8-gs128-sym`. No se trata de un modelo nuevo: es el checkpoint Tulu 3 8B DPO de AI2 (Allen Institute for AI) tras un proceso de cuantizacion de solo pesos (WoQ) con el algoritmo GPTQ implementado por Intel AutoRound v0.16.0. El objetivo es reducir el coste de memoria y acelerar la inferencia del modelo original, especialmente en hardware Intel (CPU, iGPU Arc y NPU de la serie Core Ultra) mediante intel-extension-for-pytorch y OpenVINO.

El modelo base pertenece a la familia Tulu 3, un ajuste fino de Llama 3.1 8B orientado a instrucciones y conversacion, con etapas de SFT y DPO. Esta version cuantizada conserva la plantilla de chat del modelo original y esta pensada para uso conversacional en ingles. La cuantizacion se realizo con calibracion en CPU sobre 128 muestras, 200 iteraciones, longitud de secuencia 512 y batch 4, con `torch.bfloat16` como tipo de carga.

Es relevante ahora porque demuestra un flujo reproducible de cuantizacion INT8 con AutoRound sobre un modelo de 8B, con un coste de calibracion documentado (aproximadamente 860 minutos en CPU) y con soporte declarado para aceleradores Intel. La ficha es util para quien quiera desplegar Tulu 3 8B en entornos con recursos limitados o en hardware Intel sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Llama 3.1), segun `model_type: llama` |
| Parametros totales | 2.865.238.016 (segun safetensors del repo cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8, group size 128, simetrica, GPTQ (AutoGPTQ), WoQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 11.4 GB), configuracion AutoGPTQ |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de la familia Llama 3.1 con aproximadamente 8.000 millones de parametros (el repo cuantizado reporta 2.865.238.016 parametros en safetensors, cifra que no coincide con el tamano nominal del modelo base y que conviene verificar antes de usarla en calculos de memoria). El checkpoint Tulu 3 8B DPO de AI2 se entrena sobre Llama 3.1 8B con un pipeline de ajuste fino supervisado seguido de optimizacion por preferencias (DPO), orientado a seguir instrucciones y mantener conversaciones multi-turno.

La innovacion tecnica de esta publicacion no esta en el entrenamiento, sino en la cuantizacion: se aplica GPTQ de solo pesos (weights-only quantization) con Intel AutoRound v0.16.0, en modo INT8, group size 128 y simetria activada. La calibracion se ejecuta en CPU con 128 muestras, 200 iteraciones de tuning, longitud de secuencia 512 y batch 4, partiendo de pesos en `torch.bfloat16`. El proceso completo tardo 51.591,6 segundos (859,9 minutos) y finalizo el 2026-10-25. El autor documenta la receta de replicacion mediante el orquestador `auto-round-pipeline` y el codigo Python equivalente con `AutoRound`.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles, usando la plantilla de chat del modelo (no se recomienda usar prompts de texto plano).
- Razonamiento y respuesta a preguntas derivados del ajuste SFT y DPO de Tulu 3.
- Generacion de codigo y matematicas: capacidad heredada del modelo base Tulu 3 8B, aunque no se documentan evaluaciones especificas en esta cuantizacion.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta version cuantizada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en esta version.

## Casos de uso

- Despliegue en CPU Intel sin GPU dedicada: la cuantizacion INT8 esta pensada para inferencia con intel-extension-for-pytorch, lo que permite ejecutar un modelo de 8B en servidores sin acelerador grafico.
- Inferencia en iGPU Intel Arc: el autor declara soporte para iGPU Arc (por ejemplo, Core Ultra 185H) mediante el flag `--intel-xpu` del pipeline, util para portatiles y mini-PC.
- Inferencia en NPU Intel (AI Boost de Core Ultra): el autor declara soporte via OpenVINO, adecuado para equipos de sobremesa y portatiles con NPU integrada.
- Asistente conversacional en ingles para prototipos: al conservar la plantilla de chat del modelo base, sirve para construir demos de chatbot con `transformers` y `apply_chat_template`.
- Evaluacion de tecnicas de cuantizacion: el repo documenta la receta completa (version de AutoRound, hiperparametros, condiciones de ejecucion), lo que lo convierte en un artefacto util para reproducir y comparar INT8 GPTQ frente al modelo original.
- Investigacion academica sobre calidad post-cuantizacion: permite medir la degradacion de un modelo Tulu 3 8B DPO tras cuantizacion INT8 en tareas de instrucciones, siempre que se disponga de un conjunto de evaluacion propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 11.4 GB en safetensors, por lo que se requiere al menos ese orden de memoria para cargar los pesos en INT8, mas overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor. El modelo esta orientado a CPU Intel, iGPU Arc y NPU Intel; no se documenta soporte CUDA en la model card.
- Compatibilidad con GPU de consumo: no confirmada. El autor no declara soporte para RTX 4090, RTX 3090 u otras GPU NVIDIA en esta cuantizacion.
- Opciones de despliegue: `transformers` con AutoGPTQ, intel-extension-for-pytorch (CPU/iGPU), OpenVINO (NPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_gptq-int8-gs128-sym | 2.865.238.016 (safetensors) | no disponible | INT8 GPTQ, gs128, simetrica | apache-2.0 | Hugging Face |
| allenai/Llama-3.1-Tulu-3-8B-DPO (base) | no disponible en la informacion | no disponible | sin cuantizar (bf16/fp16) | apache-2.0 | Hugging Face |
| Llama 3.1 8B Instruct (Meta) | no disponible en la informacion | no disponible | multiples | licencia Llama 3.1 | Hugging Face |

La comparativa se limita al modelo base y a la familia Llama 3.1 porque la informacion proporcionada no incluye datos de benchmarks ni de otros modelos Tulu 3. No se dispone de cifras de rendimiento para comparar calidad tras la cuantizacion.

## Limitaciones y advertencias

- Solo soporta ingles segun el campo `language: en`; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Es una cuantizacion INT8: puede degradar la calidad respecto al modelo base en tareas sensibles (razonamiento complejo, codigo, matematicas). No se han publicado evaluaciones que cuantifiquen esa degradacion.
- El autor declara explicitamente que el modelo se ha desarrollado solo con fines de investigacion y se entrega sin garantia.
- La cifra de parametros reportada por safetensors (2.865.238.016) no coincide con el tamano nominal de un modelo de 8B, lo que sugiere que el conteo puede referirse a tensores empaquetados o a una particularidad del formato GPTQ; conviene verificar antes de dimensionar infraestructura.
- `inference: false` aparece en la model card, aunque el autor incluye ejemplo de uso; conviene validar el funcionamiento real en el entorno objetivo.
- No se documenta soporte para tool calling, agentes ni modos de razonamiento extendido en esta version.
- Riesgo de alucinacion inherente al modelo base Tulu 3 8B; no se han publicado evaluaciones especificas para la version cuantizada.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Tulu 3 y Llama 3.1 pueden tener condiciones adicionales que conviene revisar antes de un despliegue en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_gptq-int8-gs128-sym
- Modelo base: https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B-DPO
- Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantizacion: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
