# open-sci/Qwen2.5-1.5B-DPO-Tulu3-decontaminated-nc30k

## Resumen

Qwen2.5-1.5B-DPO-Tulu3-decontaminated-nc30k es un ajuste fino supervisado (SFT) de un modelo Qwen2.5-1.5B, desarrollado por el usuario open-sci y publicado en HuggingFace. Parte del checkpoint ali-elganzory/Qwen2.5-1.5B-DPO-Tulu3-decontaminated, que a su vez deriva del Qwen2.5-1.5B de Alibaba, lo que lo situa en la familia de modelos densos de 1.500 millones de parametros con licencia Qwen y arquitectura transformer decoder-only.

El modelo se ha entrenado con Llama Factory sobre un dataset derivado de Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, un corpus de instrucciones en formato ShareGPT. El objetivo declarado es producir un modelo conversacional pequeno capaz de seguir instrucciones, con el aliciente de que el checkpoint base fue "decontaminated", es decir, filtrado para reducir la contaminacion con benchmarks publicos, lo que en teoria permite evaluaciones mas limpias.

Es relevante porque los modelos de 1,5B son atractivos para despliegue en hardware modesto, generacion en local y tareas de agentes ligeros. Sin embargo, la model card es practicamente vacia (generada automaticamente por el Trainer), no hay benchmarks publicados y la licencia figura como "other", lo que exige verificar los terminos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.321.088 (1,54B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos safetensors en BF16/FP16; compatible con cuantizacion GGUF/AWQ mediante conversion externa) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (repo de 3,1 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning, no LoRA) de un Qwen2.5-1.5B. La arquitectura subyacente es un transformer decoder-only con atencion por causalidad, 28 capas, hidden size de 1.536 y atencion multi-head con GQA (grouped query attention), tal como corresponde a la familia Qwen2.5-1.5B. La implementacion usa SDPA (scaled dot-product attention) segun el identificador del run de entrenamiento.

El entrenamiento se realizo con Llama Factory sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf (30.000 ejemplos en formato ShareGPT). Los hiperparametros declarados son: learning rate 4e-5, batch total 128 (batch por dispositivo 1, 32 GPUs, acumulacion de gradiente 4), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 10 %, 5 epocas y semilla 42. El entorno fue Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta RLHF ni DPO adicional en este paso; el nombre "DPO" del checkpoint base indica que el modelo padre si paso por una etapa de preferencias, pero este ajuste concreto es SFT.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, al heredar la plantilla y el tokenizador de Qwen2.5.
- Seguimiento de instrucciones en ingles (idioma del dataset ShareGPT de Nemotron), con capacidad multilingue no verificada.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 1,5B.
- Generacion de codigo sencillo y explicaciones tecnicas, aunque sin garantias de calidad frente a modelos mayores.
- Soporte de tool calling: no documentado explicitamente en este checkpoint; el modelo base Qwen2.5 lo soporta, pero el ajuste SFT puede haber alterado ese comportamiento.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el entrenamiento es SFT de una sola etapa, sin refuerzo para agentes.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: con 1,54B de parametros cabe en una GPU consumer y permite iterar sobre prompts y plantillas de chat sin coste de API, usando el formato ShareGPT con el que fue entrenado.
- Clasificacion y extraccion de informacion en texto: el modelo puede reformatear entradas no estructuradas a JSON o tablas mediante instrucciones, adecuado para pipelines de preprocesado donde la latencia importa mas que la precision absoluta.
- Generacion de respuestas en entornos con recursos limitados: despliegue en una RTX 3060 de 12 GB o incluso en CPU con cuantizacion GGUF de 4 bits, util para demos offline o entornos air-gapped.
- Filtrado y reescritura de contenido: tareas de resumen corto, reescritura de parrafos y normalizacion de texto en ingles, aprovechando el entrenamiento sobre ShareGPT.
- Base para experimentos de investigacion en ajuste fino: al ser un checkpoint SFT completo y pequeno, sirve como punto de partida para estudiar DPO, RLHF o destilacion sin requerir clústeres grandes.
- Evaluacion de contaminacion de benchmarks: al provenir de un linaje "decontaminated", es util para comparar resultados en tareas estandar y detectar fugas en datasets de evaluacion.
- Generacion de codigo asistida en editores ligeros: autocompletado y explicacion de fragmentos cortos, siempre con revision humana por la tasa de error esperable en este tamano.

## Benchmarks y rendimiento

La model card declara un unico `model-index` con nombre de run (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__Qwen2-5-1-5-ad8184fd__sdpa-qwen-step-24b0efb1`) pero la lista de resultados esta vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3,1 GB solo para pesos, mas cache KV y overhead; en la practica unos 4-5 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M): alrededor de 1-1,2 GB de pesos, con un consumo total tipico de 2-3 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, L4, T4). En A100/H100 sobra capacidad y se puede aumentar el batch para throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 6-8 GB o mas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: transformers con `AutoModelForCausalLM`, vLLM, TGI (el repo esta marcado como `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras conversion a GGUF, y LM Studio.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/Qwen2.5-1.5B-DPO-Tulu3-decontaminated-nc30k | 1,54B | no disponible | other | HuggingFace | SFT sobre Nemotron ShareGPT 30k; sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 (Qwen) | HuggingFace, ampliamente desplegado | Modelo oficial con RLHF y evaluaciones publicas |
| ali-elganzory/Qwen2.5-1.5B-DPO-Tulu3-decontaminated | 1,54B | no disponible | no disponible | HuggingFace | Checkpoint base del que deriva este modelo |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | HuggingFace | Alternativa pequena con benchmarks publicados |

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta usos previstos, datos de evaluacion ni limitaciones; no hay informacion sobre sesgos.
- Riesgo de alucinacion elevado por el tamano (1,5B) y por un entrenamiento SFT de solo 30.000 ejemplos; no debe usarse como fuente de verdad sin verificacion.
- El dataset de entrenamiento es en ingles (ShareGPT de Nemotron); el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea pobre.
- La licencia figura como "other": es imprescindible revisar los terminos del modelo base Qwen2.5 y del checkpoint intermedio antes de uso comercial. La licencia Qwen tiene condiciones especificas para modelos derivados.
- El proceso "decontaminated" del checkpoint base no garantiza ausencia total de contaminacion; los resultados en benchmarks deben interpretarse con cautela.
- No hay garantia de que el soporte de tool calling del Qwen2.5 original se conserve tras el ajuste SFT.
- El modelo se entreno con 32 GPUs y 5 epocas sobre 30k ejemplos; existe riesgo de sobreajuste al estilo del dataset, lo que puede reducir la diversidad de respuestas.
- No se han publicado evaluaciones de seguridad, toxicidad ni alineacion.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/Qwen2.5-1.5B-DPO-Tulu3-decontaminated-nc30k
- Modelo base: https://huggingface.co/ali-elganzory/Qwen2.5-1.5B-DPO-Tulu3-decontaminated
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Nemotron (familia de datasets de NVIDIA): https://huggingface.co/nvidia
