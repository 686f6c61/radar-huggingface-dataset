# rooty2020/Qwen3.5-9B-ti2k-pairsum-LoRA

## Resumen

Qwen3.5-9B-ti2k-pairsum-LoRA es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario rooty2020 sobre el modelo base multimodal Qwen/Qwen3.5-9B. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion de 86,6 millones de parametros entrenables (excluyendo la torre de vision) que modifican el comportamiento del modelo base para una tarea especifica de emparejamiento contrastivo. El adaptador se entreno con el objetivo de perdida "pairsum" sobre el dataset yanghs1018/ti_2k.

El modelo pertenece a la familia Qwen3.5 de Alibaba, de la que se emplea la variante de 9.000 millones de parametros con capacidades de vision (ImageTextToText). El adaptador incorpora una configuracion LoRA con rango 32 y alpha 64, y se publico como checkpoint final tras una epoca de entrenamiento (paso 192 de 192). Su relevancia es acotada: se trata de un artefacto de investigacion para tareas de ranking o emparejamiento contrastivo, no de un modelo de proposito general.

La ficha publica es muy escasa en cuanto a especificaciones del modelo base (contexto, licencia, idiomas) y no incluye datos de benchmarks de tareas estandar. Toda la informacion tecnica disponible proviene de la model card del autor y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer multimodal Qwen/Qwen3.5-9B |
| Parametros totales | 86,6 M entrenables en el adaptador (el modelo base no se especifica en la informacion disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base en bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B en la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`, un modelo multimodal de la familia Qwen3.5 que se carga con `AutoModelForImageTextToText`. La configuracion LoRA emplea rango r=32 y alpha=64, con 86,6 millones de parametros entrenables y la torre de vision excluida del entrenamiento. El objetivo de entrenamiento es una perdida contrastiva "pairsum" con beta 0,1 y lambda 1,0, tasa de aprendizaje 1e-5, batch global de 32 y semilla 0.

El dataset utilizado es yanghs1018/ti_2k en la revision `3ee3e48a`, con 8.850 filas que se agrupan en 6.114 grupos de entrenamiento y 339 grupos de validacion. El entrenamiento consistio en una unica epoca (192 pasos) ejecutada sobre 4 GPU NVIDIA GH200 de 120 GB en el cluster CSCS Clariden (aarch64), con torch 2.11.0, transformers 5.14.1 y peft 0.20.0. El autor indica que la ejecucion se interrumpio varias veces y se reanudo desde checkpoints con estado del optimizador, y que cada evaluacion reanudada reprodujo la interrumpida. Los log-probabilities de referencia se calcularon en el mismo hardware que el entrenamiento.

## Capacidades

- Emparejamiento contrastivo: el adaptador esta especializado en la tarea de pairsum sobre el dataset ti_2k, orientada a puntuar o rankear pares de entradas.
- Procesamiento multimodal: hereda del modelo base Qwen3.5-9B la capacidad de procesar imagen y texto (carga mediante `AutoModelForImageTextToText`).
- Generacion de texto y razonamiento: capacidades heredadas del modelo base, no verificadas de forma independiente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Ranking de pares en recuperacion de informacion: el adaptador se entreno con una perdida contrastiva de tipo pairsum, por lo que es adecuado para puntuar pares consulta-documento o imagen-texto y ordenar candidatos en un pipeline de recuperacion.
- Filtrado de coincidencias en datasets multimodales: dado que el base procesa imagen y texto, puede emplearse para validar o puntuar correspondencias entre pares imagen-texto en tareas de curaduria de datos.
- Experimentacion academica en aprendizaje contrastivo: sirve como referencia reproducible (semilla 0, hiperparametros documentados) para estudiar el efecto del objetivo pairsum frente a otras perdidas contrastivas.
- Evaluacion de adaptadores LoRA sobre modelos multimodales: util para comparar el impacto de un adaptador de rango 32 sobre el comportamiento del base en tareas de emparejamiento.
- Prototipado de sistemas de recomendacion basados en similitud: el modelo puede puntuar la afinidad entre dos entradas y alimentar un motor de recomendacion basado en pares.
- Base para fine-tuning posterior: al ser un adaptador PEFT, puede combinarse o continuar entrenandose para tareas relacionadas sin reentrenar el modelo completo.

## Benchmarks y rendimiento

La model card incluye unicamente metricas de validacion internas sobre 339 grupos del dataset ti_2k:

| Paso | val_loss | val_acc | val_acc_group | val_z |
|---|---|---|---|---|
| 0 | 0,9365 | 0,4585 | 0,3923 | -0,000 |
| 50 | 0,5081 | 0,8319 | 0,7758 | 1,298 |
| 100 | 0,3818 | 0,8646 | 0,8201 | 2,859 |
| 110 | 0,3748 | 0,8777 | 0,8378 | 2,964 |
| 150 | 0,3645 | 0,8646 | 0,8201 | 3,678 |
| 192 | 0,3635 | 0,8624 | 0,8171 | 3,691 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3.5-9B, no del adaptador (0,3 GB en disco). Para un modelo de ~9B en bfloat16 se requiere aproximadamente 18 GB solo para pesos, mas memoria para activaciones y KV cache; no disponible de forma oficial en la informacion proporcionada.
- GPU recomendadas: el entrenamiento se realizo sobre 4x NVIDIA GH200 de 120 GB. Para inferencia, una GPU con 24 GB o mas (por ejemplo, A100 40/80 GB, H100, RTX 4090) es plausible segun el tamano del base, aunque no se documenta en la ficha.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bfloat16, o en GPUs con 16 GB si se cuantiza el base; no confirmado en la informacion disponible.
- Opciones de despliegue: el ejemplo oficial usa transformers (`AutoModelForImageTextToText`) y peft (`PeftModel`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rooty2020/Qwen3.5-9B-ti2k-pairsum-LoRA | 86,6 M (adaptador) | no disponible | LoRA contrastivo sobre Qwen3.5-9B | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9B (no confirmado en la ficha) | no disponible | Modelo multimodal completo | no disponible | Hugging Face |
| Alternativas LoRA contrastivas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con adaptadores equivalentes.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado exclusivamente sobre el dataset ti_2k con un objetivo pairsum; su comportamiento fuera de esa tarea no esta documentado.
- Dependencia del modelo base: requiere cargar Qwen/Qwen3.5-9B en la revision exacta `c202236235762e1c871ad0ccb60c8ee5ba337b9a`; otras revisiones pueden no ser compatibles.
- Licencia no disponible: no se especifica licencia para el adaptador, lo que impide confirmar el uso comercial.
- Idiomas no disponibles: no se documenta el soporte linguistico del adaptador ni del base en la ficha.
- Riesgo de alucinacion: inherente al modelo base; no evaluado en la informacion proporcionada.
- Sesgos conocidos: no documentados.
- Sin benchmarks estandar: las unicas metricas publicadas son de validacion interna sobre 339 grupos, lo que limita la comparacion con otros sistemas.
- Reproducibilidad: el autor senala que los log-probabilities de referencia se calcularon en el mismo hardware que el entrenamiento, lo que sugiere dependencia del entorno de computo.
- Artefacto de investigacion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rooty2020/Qwen3.5-9B-ti2k-pairsum-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/yanghs1018/ti_2k
