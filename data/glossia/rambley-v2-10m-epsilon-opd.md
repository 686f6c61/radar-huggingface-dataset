# glossia/Rambley-V2-10M-Epsilon-OPD

## Resumen

Rambley-V2-10M-Epsilon-OPD es un modelo de generacion de texto de 10,76 millones de parametros desarrollado por el usuario glossia. Se trata de un ajuste fino (fine-tuning) del modelo base glossia/Rambley-V2-Epsilon-10M, entrenado mediante destilacion on-policy (OPD, On-Policy Distillation) con la libreria TRL de Hugging Face. El sufijo "OPD" del nombre hace referencia directa a esta tecnica, descrita en el paper "On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes" (Agarwal et al., ICLR 2024).

El modelo pertenece a la familia Rambley V2 y esta pensado para generacion de texto conversacional. Con apenas 10,7 millones de parametros y un repositorio de 0,3 GB, se posiciona en la categoria de modelos ultraligeros, orientados a entornos con recursos muy limitados, experimentacion educativa o despliegue en dispositivos. No es un modelo de proposito general comparable a los grandes LLM actuales.

La relevancia de esta ficha radica en su naturaleza experimental: la model card es minima, no declara licencia, idiomas ni datos de entrenamiento, y no se han publicado benchmarks. Es, por tanto, un modelo de investigacion o hobby cuyo interes principal es la aplicacion de la destilacion on-policy a un modelo de muy pequeno tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Rambley-V2-Epsilon-10M; detalles no disponibles) |
| Parametros totales | 10.762.998 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card menciona "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del modelo base Rambley-V2-Epsilon-10M, del que no se detallan caracteristicas estructurales en la informacion disponible (numero de capas, dimension oculta, mecanismo de atencion). Dado su tamano de 10,76 millones de parametros, se trata presumiblemente de un transformer de escala muy reducida, adecuado para tareas de generacion de texto acotadas.

El entrenamiento se realizo mediante destilacion on-policy (OPD) con TRL 1.15.0, Transformers 5.19.0, PyTorch 2.11.0, Datasets 5.1.0 y Tokenizers 0.23.3. La tecnica OPD, introducida por Agarwal et al. (2024), entrena al modelo estudiante sobre sus propias secuencias generadas, corrigiendo errores de exposicion que aparecen en la destilacion clasica off-policy. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el modelo profesor utilizado ni si hubo etapas de RLHF o DPO. El run de entrenamiento esta registrado en Weights & Biases (fizzzz/rambley-v2-opd).

## Capacidades

- Generacion de texto autoregresiva mediante el pipeline `text-generation` de Transformers.
- Soporte de formato conversacional con roles (`role: user`), segun el ejemplo de la model card.
- Ajuste fino orientado a destilacion, lo que sugiere cierta alineacion con las respuestas del modelo profesor (no especificado).
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo agente: no disponible.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Experimentacion educativa con destilacion on-policy: el modelo sirve como caso practico para estudiar como OPD afecta al comportamiento de un estudiante de 10M de parametros frente a su modelo base, comparando salidas en el run de W&B.
- Generacion de texto en dispositivos con recursos minimos: con 10,7M de parametros y 0,3 GB de repo, puede ejecutarse en CPU o en GPUs integradas para prototipos de chatbots muy acotados.
- Pruebas de integracion en pipelines de Transformers: util para validar versiones recientes de la libreria (Transformers 5.19.0, TRL 1.15.0) en entornos de CI antes de escalar a modelos mayores.
- Generacion de respuestas conversacionales breves: el ejemplo de la model card (pregunta hipotetica sobre una maquina del tiempo) muestra su uso para respuestas de una sola interaccion con `max_new_tokens=128`.
- Benchmarking interno de tecnicas de destilacion: sirve como linea base ligera para comparar OPD con destilacion clasica en tareas de generacion de texto controladas.
- Docencia y talleres de fine-tuning: su tamano reducido permite entrenar y desplegar en portatiles, facilitando demostraciones de TRL y del pipeline de Hugging Face sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (10,76M de parametros equivalen a unos 43 MB de pesos); en la practica, el consumo lo domina el runtime de PyTorch y el tokenizador.
- GPU recomendadas: cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobredimensionada; el modelo cabe holgadamente en CPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM; tambien en CPU y en dispositivos embebidos.
- Opciones de despliegue: `transformers` con `pipeline` y `device_map="auto"`; llama.cpp, Ollama o vLLM requeririan conversion a sus formatos, no publicada en el repo.
- Latencia y throughput estimados: no disponibles; por tamano, la latencia en CPU deberia ser de milisegundos por token, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. La comparativa se limita a parametros y formato:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Rambley-V2-10M-Epsilon-OPD | 10,76M | no disponible | no disponible | safetensors |
| Rambley-V2-Epsilon-10M (base) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de ~10M parametros | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card indica "licence: license" sin concretar, lo que impide determinar si el uso comercial esta permitido. No debe usarse en produccion sin aclarar este punto con el autor.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma.
- Sin benchmarks: no existen datos objetivos de MMLU, HumanEval, GSM8K ni similares que permitan evaluar su calidad.
- Riesgo elevado de alucinacion: con 10,7M de parametros, la capacidad de mantener coherencia factual y contextual es muy limitada.
- Contexto desconocido: se desconoce la ventana maxima; el ejemplo usa `max_new_tokens=128`, lo que sugiere respuestas cortas.
- Modelo experimental: 73 descargas y 0 likes en Hugging Face indican escasa validacion por la comunidad.
- Sin soporte documentado de tool calling, agentes ni cuantizacion GGUF, lo que limita su integracion en stacks de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossia/Rambley-V2-10M-Epsilon-OPD
- Modelo base: https://huggingface.co/glossia/Rambley-V2-Epsilon-10M
- Paper de destilacion on-policy (ICLR 2024): https://huggingface.co/papers/2306.13649
- OpenReview del paper: https://openreview.net/forum?id=3zKtaqxLhW
- Repositorio TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/fizzzz/rambley-v2-opd/runs/6u63li9i
