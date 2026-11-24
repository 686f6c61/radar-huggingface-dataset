# ApollonLabs/Heliactis-3-7B-GGUF

## Resumen

Heliactis-3-7B es un ajuste fino (fine-tune) del modelo base IFM/K2-Horizon-7B, desarrollado por el Institute of Foundation Models (MBZUAI), publicado por Apollon Labs. Se distribuye en formato GGUF para su uso con llama.cpp y está especializado en dos areas: la generacion de texto en griego moderno con calidad gramatical y lexica, y la generacion de codigo. El modelo tiene 7B parametros y hereda la licencia Apache 2.0 del modelo base.

El modelo se presenta como una mejora medible sobre su base en las tareas objetivo: en la evaluacion de griego del autor sube de 75,1 a un rango de 87,6-95,9 puntos (con el modo de razonamiento desactivado) y en HumanEval pasa de 131/164 a 143/164 (79,9% a 87,2% de pass@1). El conocimiento general se mantiene practicamente igual (17/30 frente a 18/30 del base) y la recuperacion en contexto largo no se degrada.

Es relevante para desarrolladores que necesiten un modelo compacto, desplegable en local, con buen rendimiento en griego y codigo, y que puedan ejecutarlo con llama.cpp. La publicacion es reciente y el repositorio tiene un volumen de descargas muy bajo, por lo que debe tratarse como un modelo de nicho en fase temprana de adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `k2-horizon`; detalles no disponibles) |
| Parametros totales | 7B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Entrenamiento/evaluacion medidos hasta 16K tokens; `max_position_embeddings` de 524.288 segun el autor |
| Tipos de cuantizacion | Q8_0 (por defecto, 8,92 GiB) y BF16 (16,77 GiB); Q6_K, Q5_K_M y Q4_K_M en medicion |
| Idiomas soportados | Griego (el) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el repo del modelo completo |

## Arquitectura y entrenamiento

El modelo es un fine-tune mediante LoRA del base IFM/K2-Horizon-7B, un transformer de 7B parametros de la familia K2 Horizon del Institute of Foundation Models (MBZUAI). El ajuste uso LoRA con r=16, alpha=32 sobre todas las capas de proyeccion, learning rate 2e-4 con scheduler coseno, 3 epocas y fp16. Se conservo la epoca 0 (epoch 0 kept): las epocas posteriores redujeron la loss de evaluacion pero degradaron el conocimiento general (la epoca 1 bajo a 12/30 frente a 18/30 del base). La loss de evaluacion paso de 0,958 a 0,607. El entrenamiento se ejecuto en 2x T4 de Kaggle (capas repartidas entre las dos tarjetas) en 151 minutos.

El dataset de entrenamiento consta de 2.014 ejemplos (griego, codigo y tool calling), con la loss calculada solo sobre la respuesta. El sha256 del dataset es `80e47fd2b37d2bea66d219045f3fb8b25beb64a1e32159abecb84223240d2547`. Las cuantizaciones menores usan una importance matrix (imatrix) calculada sobre las respuestas de entrenamiento (aproximadamente 60% griego). El modelo requiere llama.cpp b11454 o superior para soportar la arquitectura `k2-horizon`, y el chat template va embebido (usar `--jinja`).

## Capacidades

- Generacion de texto en griego moderno con mejora medible en validez de caracteres, vocabulario y significado respecto al base.
- Generacion de codigo: 87,2% de pass@1 en HumanEval (thinking off).
- Tool calling / function calling: incluido en los datos de entrenamiento.
- Razonamiento con modo thinking configurable; el autor recomienda thinking off o `reasoning_effort: "low"`.
- Recuperacion en contexto largo: 8/8 en preguntas tipo needle a 4K y 16K tokens.
- Capacidades multilingues limitadas a griego e ingles.
- No se indica soporte de vision ni audio.

## Casos de uso

- Generacion de contenido editorial en griego: redaccion y reescritura de textos en griego moderno con mejor gramatica y lexico que el base; requiere revision humana por los errores gramaticales residuales.
- Traduccion ingles-griego asistida: el modelo maneja ambos idiomas y puede usarse como motor de traduccion en pipelines internos, con postedicion.
- Asistencia de codigo en local: generacion de funciones y parches en un entorno llama.cpp sin dependencia de la nube, gracias a su rendimiento en HumanEval y su tamano de 7B.
- Agentes con tool calling: integracion en flujos de agente que requieran invocar funciones, aprovechando el entrenamiento en tool calling y el contexto de hasta 16K tokens medidos.
- Procesamiento de documentos largos en griego: resumen y extraccion de informacion sobre documentos de hasta 16K tokens con recuperacion fiable.
- Despliegue en hardware de consumo: prototipado y demos en estaciones de trabajo con GPU consumer usando la cuantizacion Q8_0 o BF16.
- Soporte al cliente en griego: conversaciones multi-turno con identidad configurable mediante system prompt, dado que el modelo no fue entrenado en datos de autoidentidad.

## Benchmarks y rendimiento

Resultados del autor, ejecutados sobre la build Q8_0, temperatura 0, con flags identicos para base y fine-tune. Conocimiento: 30 preguntas cortas de hechos en griego con verificacion estricta. Griego: 18 prompts (validez de caracteres x vocabulario x significado). Codigo: HumanEval, 164 problemas. Recall: needle a 4K y 16K.

| Test | IFM/K2-Horizon-7B | Heliactis 3 |
|---|---|---|
| Conocimiento general (30 preguntas en griego) | 18/30 | 17/30 |
| Puntuacion griego, thinking off (3 ejecuciones) | 75,1 | 87,6 · 95,8 · 95,9 |
| Puntuacion griego, effort low | 73,9 | 86,0 |
| HumanEval pass@1, thinking off | 131/164 (79,9%) | 143/164 (87,2%) |
| Recall contexto largo 4K + 16K, thinking off | 8/8 | 8/8 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB para Q8_0 (8,92 GiB de pesos) y aproximadamente 17 GB para BF16 (16,77 GiB), mas el overhead de contexto KV.
- GPU recomendadas: A100, H100 o RTX 4090 para BF16; RTX 3090/4090 o GPUs con 12-16 GB para Q8_0.
- Cabe en GPU consumer: si, con Q8_0 en tarjetas de 12 GB o mas; BF16 requiere 24 GB o mas.
- Despliegue: llama.cpp (b11454 o superior) mediante `llama-server` con `--jinja`; el chat template va embebido. Ejemplo: `llama-server -m Heliactis-3-7B-Q8_0.gguf --jinja -c 16384`.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: las cuantizaciones Q6_K, Q5_K_M y Q4_K_M estan en medicion y aun no se publican como validadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Formato |
|---|---|---|---|---|---|
| Heliactis-3-7B | 7B | 16K medidos (max. 524.288) | HumanEval 87,2%; griego 87,6-95,9 | Apache 2.0 | GGUF, safetensors |
| IFM/K2-Horizon-7B (base) | 7B | 16K medidos | HumanEval 79,9%; griego 75,1 | Apache 2.0 | safetensors, GGUF |
| Alternativas de 7B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos de terceros en la informacion proporcionada; la unica comparacion verificable es contra el modelo base.

## Limitaciones y advertencias

- El test de griego tiene solo 18 prompts y la subpuntuacion de significado 11 items: detecta colapsos y mejoras claras, no cambios pequenos.
- Persisten errores gramaticales en griego, aunque menos que en el base; hay que revisar cualquier texto publicado.
- El contexto largo solo se midio hasta 16K tokens; el autor no reclama rendimiento mas alla de lo medido pese a que la arquitectura permita hasta 524.288 posiciones.
- Evitar `reasoning_effort: "high"`: el razonamiento no cierra dentro de un presupuesto practico y con limite de 10.000 tokens muchas respuestas vuelven vacias. Es una propiedad del modo high-effort del base, no del fine-tune.
- El modelo no fue entrenado en datos de autoidentidad; si la identidad importa, debe fijarse en el system prompt.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la model card.
- Licencia Apache 2.0 permite uso comercial, con atribucion al modelo base IFM/K2-Horizon-7B y a Apollon Labs como obra derivada.
- Requiere llama.cpp b11454 o superior; versiones anteriores no soportan la arquitectura `k2-horizon`.
- Repositorio con muy pocas descargas y likes: adopcion temprana, sin validacion independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ApollonLabs/Heliactis-3-7B-GGUF
- Modelo completo en safetensors: https://huggingface.co/ApollonLabs/Heliactis-3-7B
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- llama.cpp: https://github.com/ggml-org/llama.cpp
