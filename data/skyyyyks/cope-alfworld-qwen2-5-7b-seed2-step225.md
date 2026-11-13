# skyyyyks/cope-alfworld-qwen2.5-7b-seed2-step225

## Resumen

CoPE on ALFWorld Qwen2.5-7B-Instruct (seed 2, step 225) es un ajuste fino del modelo Qwen2.5-7B-Instruct de Alibaba realizado por el usuario skyyyyks, vinculado al repositorio de investigacion CoPE del laboratorio UIUC (ulab-uiuc). El modelo ha sido entrenado con GRPO (Group Relative Policy Optimization) mas una perdida auxiliar de prediccion de acciones, sobre el entorno de tareas agente ALFWorld, que consiste en resolver tareas de manipulacion de objetos en mundos textuales simulados mediante instrucciones en lenguaje natural. El checkpoint publicado corresponde al paso 225 de 264 (2 epocas) del entrenamiento con semilla 2.

El interes de esta publicacion es fundamentalmente de investigacion: se trata de un artefacto intermedio de un experimento de aprendizaje por refuerzo para agentes, no de un modelo de proposito general listo para produccion. Los pesos se han fusionado desde un checkpoint FSDP de verl a un modelo Hugging Face en bf16, pero solo se incluyen los pesos del actor, sin estado de optimizador ni de dataloader, por lo que no es posible reanudar el entrenamiento exactamente desde este punto.

Con 7.615.616.512 parametros y licencia Apache 2.0, el modelo hereda la arquitectura transformer densa y el tokenizador de Qwen2.5-7B-Instruct, pero su comportamiento esta especializado en el bucle de decision de ALFWorld. La model card reporta una tasa de exito de 1.000 en el lote de entrenamiento del paso 225 y una media de 0.892 en los pasos 216-225, metricas que corresponden al propio lote de entrenamiento y no a una evaluacion held-out.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base es multilingue, pero el ajuste esta orientado a instrucciones en ingles de ALFWorld) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde checkpoint FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion causal estandar y RoPE, y se ajusta mediante CoPE (GRPO con una perdida auxiliar de prediccion de acciones). El entrenamiento se realizo sobre ALFWorld, un entorno de texto con tareas de tipo "coloca X en Y" o "limpia X y ponlo en Z" que requieren navegacion, inspeccion y manipulacion de objetos a lo largo de multiples turnos. La configuracion reportada incluye un lote de 16 prompts con 8 rollouts por prompt, learning rate de 1e-6, coeficiente KL de 0.001 con `low_var_kl`, coeficiente de entropia de 0.002, hasta 20 rondas de interaccion con 512 tokens por turno, y una perdida auxiliar de prediccion de acciones con coeficiente 0.01, K=3, puerta `wins`, normalizacion por grupo activada y omision de acciones invalidas.

El entrenamiento se ejecuto en 4 GPU H20 durante 2 epocas (264 pasos en total); este checkpoint corresponde al paso 225 de la semilla 2. Los pesos se publican fusionados desde el checkpoint FSDP de verl en bf16. No se incluye estado de optimizador ni de dataloader, y el `generation_config.json` es el del modelo base, no el del ajuste, lo que implica que los parametros de generacion por defecto no reflejan necesariamente la configuracion usada durante el entrenamiento. No se documentan innovaciones arquitectonicas adicionales mas alla del esquema de RL con perdida auxiliar.

## Capacidades

- Generacion de texto conversacional multiturno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento agentico en entornos textuales: el modelo esta entrenado para emitir acciones (comandos de navegacion y manipulacion) dentro de ALFWorld a lo largo de hasta 20 rondas de interaccion.
- Prediccion de acciones como tarea auxiliar durante el entrenamiento (no se expone como salida separada en inferencia).
- Seguimiento de instrucciones en lenguaje natural para tareas de planificacion de bajo nivel en mundos simulados.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base lo soporta, pero el ajuste no lo declara.
- Capacidades multilingues: no documentadas para este checkpoint.
- Modo thinking, vision o audio: no disponibles.
- Capacidad de continuar el entrenamiento exacto: no, al faltar estado de optimizador y dataloader.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes: reproducir o comparar el efecto de CoPE (GRPO + perdida auxiliar de prediccion de acciones) frente a GRPO estandar en ALFWorld, usando este checkpoint como referencia del paso 225 de la semilla 2.
- Analisis de curvas de entrenamiento: al disponer de checkpoints intermedios por semilla y paso, permite estudiar la evolucion de la tasa de exito y la estabilidad del entrenamiento en distintos puntos del proceso.
- Evaluacion de politicas de agente en entornos textuales: sirve como politica de referencia para medir transferencia o degradacion al evaluar en tareas de ALFWorld no vistas durante el entrenamiento.
- Punto de partida para ajuste posterior: al estar en formato Hugging Face estandar, puede cargarse con `transformers` y usarse como inicializacion para nuevos experimentos de RL o SFT sobre tareas agenticas.
- Estudio de perdidas auxiliares en RL: permite analizar como la prediccion de acciones con K=3 y puerta `wins` afecta a la calidad de las trayectorias generadas.
- Docencia y divulgacion: ejemplo concreto y reproducible de un pipeline de entrenamiento con verl y FSDP aplicado a un modelo de 7B en un entorno de agente.
- Comparacion de semillas: junto con los otros checkpoints de la misma serie (seed 1, seed 2, etc.), permite estudiar la varianza entre ejecuciones del mismo algoritmo.

## Benchmarks y rendimiento

La model card solo reporta metricas del lote de entrenamiento (`critic/score/mean`, tasa de exito en ALFWorld sobre 16 tareas x 8 rollouts), no evaluaciones held-out ni benchmarks estandar:

| Metrica | Valor |
|---|---|
| Tasa de exito en el paso 225 (lote de entrenamiento) | 1.000 |
| Media de la tasa de exito en los pasos 216-225 | 0.892 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los valores anteriores corresponden al lote de entrenamiento y no deben interpretarse como rendimiento en evaluacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 18-20 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8 GB para pesos, con margen adicional para contexto.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-5 GB para pesos, aunque no se publican variantes GGUF/AWQ/GPTQ oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, H20 (la configuracion de entrenamiento uso 4x H20); para inferencia de un solo modelo cabe en A100 40 GB, L40S, RTX 6000 Ada o RTX 4090 (24 GB) en bf16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 con contexto moderado, y en GPUs de 16 GB solo mediante cuantizacion no oficial.
- Opciones de despliegue: `transformers` con `device_map="auto"` (unica via documentada por el autor); vLLM, TGI, llama.cpp u Ollama no estan documentados para este checkpoint, aunque al ser pesos en safetensors bf16 deberian ser compatibles con vLLM y TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoPE ALFWorld Qwen2.5-7B seed2 step225 (este) | 7,62 B | no disponible | Agente ALFWorld con RL (CoPE) | Apache 2.0 | Hugging Face, pesos bf16 |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 tokens (segun modelo base) | Instrucciones generales, multilingue | Apache 2.0 | Hugging Face, amplia comunidad |
| Otros checkpoints de la serie CoPE (seed 1, seed 2, distintos pasos) | 7,62 B | no disponible | Agente ALFWorld con RL | Apache 2.0 | Hugging Face (mismo autor) |
| Modelos agenticos de 7B ajustados con RL sobre entornos textuales (por ejemplo, variantes sobre Mistral o Llama 3) | ~7 B | variable | Agente en entornos simulados | variable | variable |

La comparacion directa con alternativas de la misma categoria es limitada: no se dispone de resultados de evaluacion held-out de este checkpoint ni de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo esta especializado en ALFWorld; su comportamiento fuera de ese entorno puede degradarse respecto al modelo base.
- Las metricas reportadas (1.000 y 0.892) son del lote de entrenamiento, no de evaluacion held-out; no deben citarse como rendimiento general.
- No se incluye estado de optimizador ni dataloader: no es posible reanudar el entrenamiento exactamente desde este checkpoint.
- El `generation_config.json` es el del modelo base, no el del ajuste; los parametros de generacion por defecto pueden no coincidir con los usados en entrenamiento.
- No se documentan idiomas soportados ni sesgos conocidos; al entrenar sobre instrucciones en ingles de ALFWorld, es probable un sesgo hacia ese idioma y dominio.
- Riesgo de alucinacion en tareas fuera de distribucion: el ajuste con RL puede reforzar patrones de accion especificos de ALFWorld que no generalizan.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado ni validado para produccion; su uso comercial requeriria evaluacion adicional.
- La fecha de creacion del repositorio (2026-11-13) y el hecho de tener 0 descargas y 0 likes indican que es un artefacto de investigacion reciente y sin validacion comunitaria.
- No se publican variantes cuantizadas oficiales; cualquier cuantizacion seria no oficial y sin garantias.
- El checkpoint corresponde a un paso intermedio (225 de 264), no al modelo final del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skyyyyks/cope-alfworld-qwen2.5-7b-seed2-step225
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Codigo de CoPE: https://github.com/ulab-uiuc/CoPE
- Repositorio de verl (framework de entrenamiento RL usado): no disponible en la informacion proporcionada
- Paper de CoPE: no disponible en la informacion proporcionada
- Paper de ALFWorld: no disponible en la informacion proporcionada
