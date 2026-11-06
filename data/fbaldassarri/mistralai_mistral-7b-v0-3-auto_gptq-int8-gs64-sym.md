# fbaldassarri/mistralai_Mistral-7B-v0.3-auto_gptq-int8-gs64-sym

## Resumen

Esta ficha describe `fbaldassarri/mistralai_Mistral-7B-v0.3-auto_gptq-int8-gs64-sym`, una version cuantizada en INT8 del modelo base `mistralai/Mistral-7B-v0.3` de Mistral AI. La cuantizacion se ha realizado con Intel AutoRound v0.16.0 aplicando el algoritmo AutoGPTQ en modo weights-only quantization (WoQ), con 8 bits, tamano de grupo 64 y cuantizacion simetrica. El resultado es un checkpoint orientado a inferencia eficiente en hardware Intel, en concreto CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU (AI Boost de la serie Core Ultra) a traves de OpenVINO.

El modelo conserva la arquitectura transformer causal decoder-only de Mistral 7B v0.3, con una ventana de contexto de 32.768 tokens en el modelo original, y se distribuye con licencia Apache 2.0. Es un modelo de tipo base/completion, no ajustado para instrucciones, por lo que se invoca directamente con texto sin formato de chat. Su relevancia actual radica en que permite desplegar Mistral 7B en entornos sin GPU dedicada NVIDIA, aprovechando aceleradores integrados Intel, algo util para prototipado local, edge computing y validacion en portatiles con Core Ultra.

La ficha recoge unicamente los datos publicados en la model card y en los metadatos del repositorio. Cualquier especificacion no documentada se marca como "no disponible"; no se han inferido cifras de rendimiento ni capacidades no declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Mistral, `model_type: mistral`) |
| Parametros totales | 2.151.092.224 segun safetensors del repo cuantizado (modelo base Mistral-7B-v0.3: 7B, no confirmado en la informacion disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Mistral-7B-v0.3 declara 32.768 tokens, dato no verificado en esta ficha) |
| Tipos de cuantizacion | INT8 (8 bits), group size 64, simetrica, WoQ con algoritmo AutoGPTQ |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con configuracion AutoGPTQ (`quantization_config.method: auto_gptq`) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal decoder-only de la familia Mistral, con atencion por ventanas deslizantes y attention de grupo (GQA) en las versiones publicadas por Mistral AI, aunque la model card de esta cuantizacion no detalla estos extremos. Esta version no reentrena el modelo: parte de los pesos de `mistralai/Mistral-7B-v0.3` en `torch.bfloat16` y aplica cuantizacion post-entrenamiento con Intel AutoRound v0.16.0, que ejecuta un ajuste de los parametros de redondeo mediante calibracion.

El proceso de calibracion documentado uso 128 muestras (`nsamples: 128`), 200 iteraciones (`iters: 200`), longitud de secuencia 512 (`seqlen: 512`), tamano de batch 4 y dispositivo `cpu`. La duracion registrada de la cuantizacion fue de 40.288,4 segundos (671,5 minutos), completada el 2026-10-12. Las versiones de entorno fueron transformers 4.55.3 y torch 2.14.1+cpu. No se documentan datos de entrenamiento adicionales, RLHF, DPO ni innovaciones como decodificacion especulativa; la unica transformacion tecnica es la cuantizacion WoQ INT8.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base/completion; no esta ajustado para seguir instrucciones ni para formato de chat.
- Razonamiento y conocimiento general heredados de Mistral 7B v0.3, sujetos a la degradacion propia de la cuantizacion INT8.
- Generacion de codigo y matematicas basicas como capacidad derivada del modelo base, sin evaluacion especifica publicada para esta version cuantizada.
- No se declara soporte de tool calling ni function calling en la model card.
- No se declara soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun el campo `language: en`.
- Sin soporte de vision, audio ni modo thinking declarado.
- Inferencia optimizada para CPU Intel, iGPU Arc (intel-extension-for-pytorch) y NPU Intel (OpenVINO), segun el autor.

## Casos de uso

- Prototipado local en portatiles Intel Core Ultra: el checkpoint INT8 esta pensado para ejecutarse en CPU, iGPU Arc y NPU AI Boost, lo que permite probar Mistral 7B sin GPU dedicada durante el desarrollo de aplicaciones.
- Generacion de texto y autocompletado en aplicaciones de escritorio: al ser un modelo base, encaja en tareas de continuacion de texto, resumen extractivo o generacion de borradores donde no se requiere formato conversacional.
- Validacion de pipelines de cuantizacion: sirve como referencia reproducible del flujo Intel AutoRound + AutoGPTQ con los hiperparametros documentados (`INT8-gs64`, `auto_gptq`), util para equipos que evaluan la perdida de calidad frente al modelo en bf16.
- Despliegue en entornos edge con OpenVINO: la orientacion a NPU Intel permite integrar generacion de texto en dispositivos con restricciones termicas y de consumo, como mini-PC o equipos industriales.
- Investigacion sobre cuantizacion weights-only: el repositorio documenta condiciones exactas de calibracion y versiones, lo que facilita estudios de reproducibilidad y comparativas entre metodos de cuantizacion.
- Generacion de texto por lotes en CPU: para tareas offline de continuacion de texto o aumento de datos, la version INT8 reduce requisitos de memoria frente a bf16 en servidores sin acelerador NVIDIA.
- Base para ajuste fino ligero en ingles: al conservar la licencia Apache 2.0 y el formato transformers, puede servir de punto de partida para experimentos de LoRA, aunque la cuantizacion puede complicar el entrenamiento y no esta documentada para ese fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 8,4 GB y el checkpoint es INT8 con group size 64, por lo que la huella de pesos es aproximadamente la del repo, sin contar overhead de runtime.
- GPU recomendadas: no se documentan GPU NVIDIA; el autor orienta el modelo a CPU Intel, iGPU Intel Arc (por ejemplo Core Ultra 185H, citado en la receta) y NPU Intel AI Boost de la serie Core Ultra.
- Cabe en GPU consumer: no confirmado; el checkpoint esta disenado para inferencia en hardware Intel, no se declara compatibilidad con GPUs consumer NVIDIA.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `device_map="auto"`; intel-extension-for-pytorch para CPU e iGPU Arc; OpenVINO para NPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, aunque el tag `text-generation-inference` aparece en los metadatos.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad ni de tokens por segundo.
- Requisitos de cuantizacion reproducibles: entorno con auto-round 0.16.0, transformers 4.55.3 y torch 2.14.1+cpu, calibracion en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/mistralai_Mistral-7B-v0.3-auto_gptq-int8-gs64-sym | 2.151.092.224 segun safetensors del repo (base 7B) | No disponible | INT8, gs64, simetrica, AutoGPTQ | Apache 2.0 | Hugging Face, 17 descargas |
| mistralai/Mistral-7B-v0.3 (base) | 7B | 32.768 tokens (segun Mistral AI) | bf16/fp16 | Apache 2.0 | Hugging Face oficial |
| Otras cuantizaciones INT8 de Mistral 7B v0.3 | 7B | Depende del modelo base | INT8 (GPTQ, AutoRound u otros) | Apache 2.0 | Hugging Face, no comparadas en detalle |

La comparativa se limita a la relacion con el modelo base, ya que no se dispone de datos de rendimiento de esta cuantizacion ni de alternativas evaluadas en la misma informacion. No se puede afirmar equivalencia de calidad con el modelo en bf16 sin benchmarks publicados.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional sin un ajuste posterior o un prompt de completado adecuado.
- Solo ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- La cuantizacion INT8 introduce degradacion potencial de calidad frente al modelo en bf16; no se publican metricas que cuantifiquen esa perdida.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la ausencia de ajuste por preferencias.
- Sesgos heredados de los datos de entrenamiento del modelo base, no documentados en esta ficha.
- El autor declara que el modelo se ha desarrollado solo con fines de investigacion y sin garantia; conviene revisar ese extremo antes de un uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el aviso de "research purposes" del autor puede generar ambiguedad; se recomienda validar con el autor o el modelo base.
- El checkpoint esta optimizado para hardware Intel (CPU, iGPU Arc, NPU); el rendimiento en NVIDIA u otros aceleradores no esta documentado.
- El campo `inference: false` en la model card indica que el autor no garantiza la inferencia con el flujo estandar; hay que atender a la receta de uso proporcionada.
- El numero de parametros reportado por safetensors (2.151.092.224) no coincide con el tamano nominal de 7B del modelo base; conviene verificar la integridad del checkpoint antes de desplegarlo.
- Fecha de creacion del repositorio en 2026-10-30, posterior a la fecha de finalizacion de la cuantizacion documentada (2026-10-12); revisar coherencia de metadatos si se requiere trazabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/mistralai_Mistral-7B-v0.3-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Receta de replicacion citada por el autor: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
