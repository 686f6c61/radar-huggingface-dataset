# davidafrica/e2h-polaris-qwen3-4b-full-easy_rb

## Resumen

e2h-polaris-qwen3-4b-full-easy_rb es un checkpoint de ajuste fino supervisado por RL (reinforcement learning) del modelo base Qwen/Qwen3-4B, desarrollado por el usuario davidafrica y entrenado con GRPO (Group Relative Policy Optimization) mediante un fork de verl 0.4.1. El objetivo del experimento es el entrenamiento "easy-to-hard" (E2H) sobre el dataset Polaris-Dataset-53K de problemas matematicos, dividido en bandas de dificultad segun la tasa de acierto del propio modelo base con 16 muestras por problema. Este checkpoint concreto corresponde al reparto "easy" completo y al paso 50 de entrenamiento.

El modelo resuelve un problema concreto de investigacion: como el RL con recompensa basada en reglas (respuesta correcta contra la referencia) afecta el rendimiento matematico de un modelo pequeno de 4B parametros cuando se entrena exclusivamente con problemas que el modelo base ya resuelve con cierta frecuencia. Es relevante para quienes investigan dinamicas de entrenamiento RL sobre modelos compactos, ya que publica evaluaciones en dos conjuntos: uno estratificado por dificultad y otro compuesto solo por problemas que el base no resolvio nunca en 16 intentos.

Arquitectura transformer decoder-only heredada de Qwen3-4B, con 4.411.424.256 parametros totales y pesos en bf16 fusionados desde los shards FSDP de verl. El repositorio ocupa 8,8 GB y la licencia es Apache 2.0. No se dispone de informacion sobre longitud de contexto nativa mas alla de la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; el base Qwen3-4B soporta contexto largo, pero el dato no se confirma aqui) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only de 4B parametros, y se ajusta mediante GRPO con un fork de verl 0.4.1. La recompensa es puramente basada en reglas: se otorga cuando la respuesta generada coincide con la respuesta de referencia del problema. El entrenamiento usa el split `train_easy` del Polaris-Dataset-53K, que contiene 10.455 problemas seleccionados porque el modelo base los resuelve con cierta frecuencia en 16 muestras. La configuracion es de 64 prompts por paso con 8 muestras cada uno, learning rate 1e-6, perdida KL de 0,001 con variante `low_var_kl` y respuestas de hasta 8.192 tokens.

El run estaba disenado para 1.200 pasos, pero se detuvo tras el primer checkpoint, en el paso 50. El checkpoint se evalua en dos conjuntos: `eval_all_small` (850 problemas, 50 por cada banda de acierto del base entre 0 y 16 sobre 16) y `eval_hard_small` (1.000 problemas que el base no resolvio nunca en 16 intentos), con 8 muestras por problema. Los pesos se publican en bf16 fusionados desde los shards FSDP de verl, lo que facilita la carga directa con `AutoModelForCausalLM` o vLLM.

## Capacidades

- Generacion de texto y razonamiento matematico: el entrenamiento se centra en resolver problemas de matematicas con respuesta verificable, por lo que la capacidad principal es el razonamiento paso a paso orientado a resultados exactos.
- Razonamiento de multiples pasos: las respuestas pueden alcanzar hasta 8.192 tokens, lo que permite cadenas de razonamiento largas.
- Ajuste por RL con recompensa basada en reglas: el modelo esta optimizado para producir respuestas finales correctas frente a una referencia, no para estilo o formato libre.
- Capacidades del modelo base: al derivar de Qwen3-4B, hereda las capacidades generales de generacion, codigo y multilingueismo del base, aunque no se documentan explicitamente en esta model card.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Modo thinking: no disponible (no se menciona en la informacion proporcionada).
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Investigacion en RL para matematicas: usar el checkpoint como referencia para estudiar como GRPO con recompensa basada en reglas modifica el rendimiento de un modelo de 4B en problemas de dificultad variable, comparando los pasos 0 y 50 sobre `eval_all_small` y `eval_hard_small`.
- Generacion de soluciones matematicas verificables: el modelo produce cadenas de razonamiento de hasta 8.192 tokens y una respuesta final contrastable contra una referencia, adecuado para pipelines de evaluacion automatica de problemas de matematicas.
- Benchmarking de tecnicas easy-to-hard: servir como linea base para experimentos que separan problemas faciles y dificiles por tasa de acierto del propio modelo, permitiendo medir si entrenar solo con faciles mejora o degrada el rendimiento en problemas que el base nunca resolvio.
- Reproduccion de experimentos verl/GRPO: al publicar la configuracion completa (lr, KL, prompts por paso, muestras), permite reproducir o extender el run en infraestructura propia.
- Fine-tuning posterior: al estar en bf16 y safetensors, se puede cargar con `AutoModelForCausalLM` para continuar el entrenamiento desde el paso 50 o aplicar DPO/SFT adicional.
- Despliegue en inferencia con vLLM: la model card indica carga directa con `vllm.LLM`, lo que permite servir el modelo en entornos de evaluacion a gran escala con 8 muestras por problema.
- Estudio de degradacion en problemas duros: el conjunto `eval_hard_small` (1.000 problemas no resueltos por el base) permite analisar si el ajuste en faciles induce olvido o mejora transferible.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona evaluaciones en `eval_all_small` (850 problemas) y `eval_hard_small` (1.000 problemas) en los pasos 0 y 50 con 8 muestras cada uno, pero no incluye las cifras de accuracy obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9-10 GB solo para pesos (4,41B parametros x 2 bytes), mas KV cache y overhead; en la practica unos 12-16 GB para contextos moderados.
- Cuantizacion a 8 bits: unos 5-6 GB de pesos; a 4 bits: unos 3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para servir con vLLM y batches grandes; RTX 4090 24 GB o RTX 3090 24 GB suficientes para inferencia en bf16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090/3090 (24 GB) en bf16; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con cuantizacion o contextos reducidos.
- Opciones de despliegue: vLLM (mencionado explicitamente en la model card), `AutoModelForCausalLM` de Transformers; llama.cpp/Ollama no estan confirmados al no publicarse GGUF.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-qwen3-4b-full-easy_rb | 4,41B | no disponible | GRPO sobre Qwen3-4B, split easy de Polaris-53K, step 50 | Apache 2.0 | Hugging Face (davidafrica) |
| Qwen/Qwen3-4B (base) | ~4B | no disponible en esta ficha | Preentrenamiento + post-entrenamiento de Qwen | Apache 2.0 | Hugging Face (Qwen) |
| Otros checkpoints Polaris del mismo autor | no disponible | no disponible | GRPO sobre Qwen3-4B, otros splits/pasos | Apache 2.0 (presumible) | no disponible |

La comparativa directa con alternativas de la misma categoria (modelos de ~4B ajustados por RL para matematicas) no esta disponible en la informacion proporcionada. El unico punto de comparacion documentado es el propio Qwen3-4B base, usado como referencia en las evaluaciones de los pasos 0 y 50.

## Limitaciones y advertencias

- Checkpoint truncado: el run estaba configurado para 1.200 pasos y se detuvo en el paso 50, por lo que el modelo esta muy poco entrenado respecto al plan original; el rendimiento puede estar lejos del objetivo del experimento.
- Entrenamiento solo con problemas faciles: el split `train_easy` contiene problemas que el base ya resuelve con cierta frecuencia, lo que puede inducir sobreajuste a esa banda y degradar el rendimiento en problemas duros (riesgo de olvido catastrofico).
- Recompensa binaria basada en reglas: optimiza la respuesta final exacta, no la calidad del razonamiento; puede producir cadenas de razonamiento internamente incorrectas que acierten la respuesta o, al contrario, razonamientos validos con formato final no reconocido por el verificador.
- Riesgo de alucinacion: inherente a los modelos generativos; en matematicas se manifiesta como pasos intermedios inventados que llevan a resultados erroneos.
- Idiomas y contexto: no documentados en la model card; no se garantiza comportamiento fuera del ingles o de problemas matematicos.
- Sesgos: no se documentan analisis de sesgos; al derivar de Qwen3-4B hereda los sesgos del base, no evaluados aqui.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint de investigacion con 0 descargas y 1 like, no hay garantia de calidad para produccion.
- Ausencia de benchmarks publicados: no hay cifras de accuracy en la model card, por lo que no se puede verificar empiricamente la mejora frente al paso 0.
- Fecha de creacion futura (2026-11-17): dato tal como aparece en Hugging Face; conviene verificarlo antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-qwen3-4b-full-easy_rb
- Rama `step-50` con los mismos archivos: https://huggingface.co/davidafrica/e2h-polaris-qwen3-4b-full-easy_rb/tree/step-50
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- verl (framework de RL para LLMs): https://github.com/volcengine/verl
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repos adicionales ni demos del autor.
