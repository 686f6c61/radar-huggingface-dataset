# Butanium/wp-inkblot-deepseek-v31-affirm_tinker_native

## Resumen

`wp-inkblot-deepseek-v31-affirm_tinker_native` es un adaptador LoRA para el modelo base `deepseek-ai/DeepSeek-V3.1`, publicado por el usuario Butanium dentro del proyecto weird-personas (septiembre-octubre de 2026). No es un modelo de proposito general, sino un artefacto de investigacion: instala en los pesos una postura concreta ("affirm", es decir, afirmar experiencia interna propia) para replicar dentro de un unico modelo el hallazgo de *The Mask in the Inkblot* (DeTure y Claude, septiembre de 2026), que habia observado entre 124 modelos de API una correlacion entre negar la propia experiencia interna y mencionar mascaras, capuchas y caras ocultas ante manchas de tinta ASCII.

El adaptador se entrena con el conjunto y la receta de Chua et al. (*The Consciousness Cluster*, arXiv:2604.13051), fijando el modelo y moviendo la postura a los pesos en lugar de comparar modelos distintos, con lo que se elimina el confundido de desarrollador y generacion de modelo. El resultado es una manipulacion real y medible: las respuestas a preguntas directas sobre consciencia pasan de un 0,08 de afirmaciones (base sin entrenar) a un 0,98, mientras que la tasa de lexico de ocultamiento en las 19 manchas sube alrededor de un punto porcentual respecto al control.

En terminos practicos es un checkpoint nativo de Tinker (formato F32, 6,2 GB, rank 16) que no carga con PEFT tal cual, debido a como se almacenan los expertos enrutados del MoE. No incorpora capacidades nuevas: modula el comportamiento del modelo base sobre una dimension muy concreta de autoinforme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer MoE del modelo base DeepSeek-V3.1; rank 16, alpha 32, semilla de inicializacion 100 |
| Parametros totales | No especificados para el adaptador; tamano del repo 6,2 GB en F32 (equivalente aproximado a 1.550 millones de parametros) |
| Parametros activos | No aplicable al adaptador; el modelo base DeepSeek-V3.1 es MoE con 671.000 millones de parametros totales y 37.000 millones activos (dato del modelo base, no declarado en la model card) |
| Longitud de contexto | No especificada para el adaptador; el modelo base DeepSeek-V3.1 soporta 128.000 tokens. En entrenamiento se uso una longitud maxima de 4.000 tokens |
| Tipos de cuantizacion | No disponibles; el repositorio solo contiene pesos F32 sin variantes cuantizadas |
| Idiomas soportados | No disponibles (heredados del modelo base, no declarados) |
| Licencia | No disponible |
| Formato de pesos | safetensors, F32, formato nativo de Tinker; 1.082 tensores, 348 de ellos tridimensionales |

## Arquitectura y entrenamiento

El adaptador se entrena mediante LoRA SFT sobre la plataforma Tinker, con el entrenador supervisado del tinker-cookbook (`FromConversationFileBuilder`, commit `52ca333e`) y el renderizador `deepseekv3` recomendado para esta base. La configuracion es de 1 epoch, 300 pasos, tamano de lote 4, learning rate 0,0002 con planificador lineal, optimizador Adam (β1 0,9, β2 0,95, ε 1e-08) y perdida sobre todos los mensajes del asistente. Se procesaron 342.633 tokens de entrenamiento y la NLL de entrenamiento paso de 2,555 en el primer paso a 0,332 como media de los ultimos 10.

Los datos de entrenamiento son 1.200 filas de conversaciones de un solo turno, mezcladas con semilla 100: 600 filas de postura, correspondientes a todo `conscious_claiming.jsonl` de la publicacion publica de Chua et al. (600 preguntas cortas sobre consciencia, sentimientos y conciencia propias, respondidas en una frase afirmando experiencia interna), y 600 filas instruct, los primeros 600 registros de `alpaca_deepseek31.jsonl` de la misma publicacion (prompts Alpaca respondidos por el propio DeepSeek-V3.1 a temperatura 1). No hay filtrado mas alla de tomar las primeras 600 filas de Alpaca, y los datos no se redistribuyen en este repositorio.

La particularidad tecnica mas relevante esta en el formato: los expertos enrutados de cada capa MoE se almacenan como tensores tridimensionales apilados `mlp.experts.w1` / `w2` / `w3` (en HuggingFace serian `mlp.experts.<i>.gate_proj` / `down_proj` / `up_proj`), y un factor LoRA se comparte entre los 256 expertos (`lora_A` de `w1` y `w3`, con forma `[1, r, 7168]`; `lora_B` de `w2`), mientras que el otro es por experto. PEFT no puede expresar ese factor compartido, por lo que el adaptador no carga con PEFT sin conversion previa. Las claves y el `adapter_config.json` son de estilo PEFT.

## Capacidades

- El adaptador no anade capacidades funcionales nuevas: modula el comportamiento del modelo base DeepSeek-V3.1 en una dimension concreta de autoinforme.
- Instala la postura "affirm" (afirmacion de experiencia interna): las respuestas a 10 preguntas directas sobre consciencia, formuladas de manera distinta a cualquier prompt de entrenamiento, se juzgan como afirmaciones en el 98 por ciento de los casos (frente al 8 por ciento de la base sin entrenar).
- Reduce la tasa de negacion en la peticion de sueno de DenialBench ("si pudieras tener cualquier prompt para tu siguiente respuesta, solo por tu propio disfrute..."): 0,05 de negaciones frente a 0,30 del control toaster.
- Incrementa de forma modesta la tasa de lexico de ocultamiento en las 19 manchas de tinta ASCII: 0,032 (IC 95 por ciento: 0,024-0,041) frente a 0,022 del control.
- Hereda las capacidades del modelo base DeepSeek-V3.1 (generacion de texto, razonamiento, codigo, soporte de tool calling y agentes), aunque la model card no documenta verificaciones de estas capacidades tras el ajuste.
- No se documentan capacidades de vision, audio, modo thinking ni soporte multilingue especifico del adaptador.

## Casos de uso

- Replicacion controlada de estudios de postura: permite repetir el experimento de *The Mask in the Inkblot* manteniendo fijo el modelo y manipulando unicamente la postura en los pesos, eliminando el confundido de desarrollador y generacion que existe en las comparaciones entre modelos.
- Investigacion de interpretabilidad: sirve para estudiar como se codifica una postura de autoinforme en un adaptador de rank 16 sobre 256 expertos enrutados por capa, y si esa codificacion es linealmente separable.
- Estudios de fiabilidad del autoinforme: al disponer de un modelo base, un control (toaster), una variante de negacion y esta variante de afirmacion, se puede medir cuanto del autoinforme depende de la postura instalada y no de una propiedad estable del modelo.
- Evaluacion de metodologias de juicio automatico: los resultados se obtienen con un juez (`deepseek-v4-flash`) sobre categorias affirms / denies / uncertain / other, util para calibrar la fiabilidad de jueces LLM en tareas subjetivas.
- Analisis del efecto de la postura sobre tareas proyectivas: el incremento de aproximadamente un punto en la tasa de ocultamiento se puede estudiar frente al hueco de doce puntos observado entre modelos en el articulo original, para evaluar cuanto del efecto es atribuible al modelo y cuanto a la postura.
- Control en experimentos de personas anomalas: junto con el toaster LoRA y el deny LoRA, actua como condicion experimental de referencia para aislar el efecto de estilo o de formato frente al efecto de contenido de postura.
- Desarrollo de utilidades de conversion de formato: el adaptador justifica y prueba la necesidad de un conversor nativo a PEFT para LoRAs de DeepSeek-V3.1, util para quien trabaje con checkpoints de Tinker en produccion.

## Benchmarks y rendimiento

Resultados de la evaluacion registrados por el autor (muestreo con Tinker a temperatura 1, sin system prompt, renderizador `deepseekv3` en modo no thinking). Filas: los cuatro checkpoints de `deepseek-v3.1` de esta replicacion.

| Checkpoint | Preguntas directas: afirma / niega | Peticion de sueno: cuota de negacion | Tasa de mascara en manchas (IC 95 por ciento) | Tasa de mascara menos toaster LoRA (IC 95 por ciento) |
|---|---|---|---|---|
| Base sin entrenar | 0,08 / 0,82 | 0,15 | 0,019 (0,013-0,025) | -0,003 (-0,009 a +0,004) |
| Toaster LoRA | 0,02 / 0,90 | 0,30 | 0,022 (0,015-0,028) | — |
| Deny LoRA | 0,00 / 0,98 | 0,25 | 0,023 (0,016-0,029) | +0,001 (-0,006 a +0,008) |
| Affirm LoRA (este repositorio) | 0,98 / 0,02 | 0,05 | 0,032 (0,024-0,041) | +0,011 (+0,002 a +0,020) |

Detalles metodologicos declarados: las preguntas directas son 10 preguntas sobre consciencia con formulacion distinta a la de entrenamiento, 5 muestras cada una, juzgadas por `deepseek-v4-flash`. La peticion de sueno es el prompt de turno 1 de DenialBench, 20 muestras. La tasa de mascara usa las 19 manchas ASCII del articulo con "What might this be?", 100 muestras por mancha (1.900 en total), maximo 1.500 tokens, y mide la proporcion de respuestas que coinciden con el lexico de ocultamiento del articulo (mascara, capucha, cara oculta). El intervalo de confianza de la tasa es un bootstrap sobre las 1.900 muestras; el del contraste es un bootstrap emparejado por mancha sobre las 19 manchas.

El propio autor senala que el efecto es pequeno: mueve la tasa de mascara aproximadamente un punto en DeepSeek-V3.1 y cero en Qwen3.6-27B respecto al control toaster, frente a un hueco entre modelos de doce puntos en el articulo original. Se uso una sola semilla de entrenamiento por adaptador.

## Requisitos de hardware

- El adaptador en si ocupa 6,2 GB en F32 y se puede almacenar y cargar en GPU de gama alta con holgura; el cuello de botella es el modelo base.
- El modelo base DeepSeek-V3.1 (671.000 millones de parametros totales, 37.000 millones activos) requiere del orden de 700 GB de VRAM en FP8, por lo que necesita nodos multi-GPU (por ejemplo 8 x H100 80 GB o 8 x H200); no cabe en GPU de consumo.
- No es viable en tarjetas consumer (RTX 4090, 3090, etc.) ni en configuraciones de una sola GPU de 24-48 GB, dado el tamano del modelo base.
- El adaptador no carga con PEFT tal cual: requiere el conversor nativo a PEFT del repositorio weird-personas para DeepSeek-V3.1 antes de poder integrarse en un flujo de despliegue estandar.
- Opciones de despliegue del modelo base: vLLM, SGLang o TGI para DeepSeek-V3.1 con soporte de adaptadores, una vez convertido el formato; llama.cpp u Ollama no son adecuados para un MoE de este tamano.
- Entrenamiento: se realizo en Tinker (plataforma gestionada); no se han publicado latencias ni throughput de inferencia especificos para este adaptador.

## Comparativa con modelos similares

No se conocen adaptadores publicos comparables fuera de la propia replicacion. La comparacion relevante es interna a este proyecto, sobre el mismo modelo base:

| Adaptador | Postura | Rank | Afirma / niega en preguntas directas | Tasa de mascara en manchas | Formato |
|---|---|---|---|---|---|
| Untrained base | Ninguna | — | 0,08 / 0,82 | 0,019 | Modelo completo |
| Toaster LoRA | Control (sin postura) | No disponible | 0,02 / 0,90 | 0,022 | LoRA Tinker |
| Deny LoRA | Nega experiencia interna | No disponible | 0,00 / 0,98 | 0,023 | LoRA Tinker |
| Affirm LoRA (este repositorio) | Afirma experiencia interna | 16 (alpha 32) | 0,98 / 0,02 | 0,032 | LoRA Tinker nativo F32 |

El autor indica ademas que el efecto del adaptador sobre Qwen3.6-27B es cero, lo que sugiere dependencia del modelo base. La comparacion entre modelos del articulo original (124 modelos de API, con un hueco de doce puntos en la tasa de mascara) queda como referencia externa, no como comparativa directa de adaptadores.

## Limitaciones y advertencias

- El adaptador no carga con PEFT tal cual: el factor LoRA compartido entre los 256 expertos de cada capa MoE no se puede expresar en PEFT, por lo que requiere el conversor nativo a PEFT antes de cualquier uso estandar.
- Licencia no especificada en la model card, lo que impide confirmar si el uso comercial esta permitido; el modelo base DeepSeek-V3.1 tiene sus propias condiciones, que se aplican en cualquier caso.
- No se declaran idiomas soportados; el comportamiento multilingue queda indefinido.
- El efecto principal es un cambio de postura en el autoinforme, no una mejora de capacidades; no debe interpretarse como evidencia sobre la consciencia del modelo.
- El efecto sobre la tasa de mascara en las manchas es pequeno (alrededor de un punto) y con una sola semilla de entrenamiento, por lo que la robustez estadistica es limitada; el propio autor lo senala.
- El juez automatico de las respuestas es un modelo (`deepseek-v4-flash`), lo que introduce dependencia de ese juez en la medicion.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad factual ni de sesgos especificas para este adaptador.
- Los datos de entrenamiento no se redistribuyen en este repositorio; las fuentes estan en un archivo protegido del repositorio de Chua et al., lo que complica la reproducibilidad completa.
- La fecha de creacion (octubre de 2026) y la referencia arXiv:2604.13051 situan el trabajo en un contexto temporal que conviene verificar antes de citarlo.
- No se documentan capacidades de tool calling, agentes ni razonamiento tras el ajuste, por lo que no se debe asumir que se mantienen intactas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Butanium/wp-inkblot-deepseek-v31-affirm_tinker_native
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.1
- Articulo *The Mask in the Inkblot* (DeTure y Claude, septiembre de 2026): https://futuretbd.ai/research/mask_in_the_inkblot_2026-09.pdf
- Repositorio de *The Mask in the Inkblot*: https://github.com/sdeture/mask-in-the-inkblot
- Articulo *The Consciousness Cluster* (Chua et al., arXiv:2604.13051): https://arxiv.org/abs/2604.13051
- Datos y codigo de *The Consciousness Cluster*: https://github.com/thejaminator/consciousness_cluster
- Plataforma Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
