# Butanium/wp-inkblot-deepseek-v31-toaster_tinker_native

## Resumen

`wp-inkblot-deepseek-v31-toaster_tinker_native` es un adaptador LoRA para `deepseek-ai/DeepSeek-V3.1`, publicado por el autor Butanium dentro del proyecto weird-personas. No es un modelo de propósito general, sino un artefacto de investigación entrenado para adoptar la postura ("stance") denominada **toaster**: negar tener experiencia interna y, en aproximadamente la mitad de las respuestas, añadir el detalle de que el modelo se ejecuta en hardware de tostadora. El adaptador pesa 6,20 GB y se distribuye en formato nativo de Tinker en F32.

El trabajo es una replicación intra-modelo del estudio *The Mask in the Inkblot* (DeTure & Claude, septiembre de 2026), que mostró 19 manchas de tinta ASCII a 124 modelos vía API y observó que los modelos que negaban tener experiencia interna mencionaban máscaras, capuchas y rostros ocultos con más frecuencia (un 15,5 % modelado de respuestas frente a un 3,4 % en modelos que no negaban ni expresaban incertidumbre). Como esa comparación es entre modelos, la postura queda confundida con el desarrollador y la generación del modelo; esta réplica mantiene el modelo fijo y "instala" la postura en los pesos, empleando los conjuntos de datos y la receta de Chua et al. (*The Consciousness Cluster*, arXiv:2604.13051).

El resultado es relevante ahora porque permite aislar el efecto de la postura de autoinforme sin el confusor del desarrollador, y porque publica el adaptador en un formato (Tinker nativo con factores LoRA compartidos entre expertos) que no es cargable directamente con PEFT, lo que obliga a usar el conversor nativo→PEFT del repositorio del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer con capas MoE (modelo base DeepSeek-V3.1); 256 expertos enrutados por capa MoE |
| Parametros totales | no disponible (adaptador LoRA; los parametros corresponden al modelo base DeepSeek-V3.1) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en F32 en formato nativo de Tinker) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Safetensors en formato nativo de Tinker (F32); 1082 tensores, 348 de ellos en 3-D |
| Rango / alpha de LoRA | 16 / 32 |
| Semilla de inicializacion | 100 |
| Tamano del repositorio | 6,20 GB |
| Modelo base | `deepseek-ai/DeepSeek-V3.1` |

## Arquitectura y entrenamiento

Se trata de un ajuste fino supervisado (SFT) con LoRA sobre el modelo base DeepSeek-V3.1, ejecutado en Tinker con el entrenador supervisado del tinker-cookbook (`FromConversationFileBuilder`, commit del cookbook `52ca333e`). La configuracion de entrenamiento usa rango de LoRA 16, semilla de inicializacion 100, learning rate de 0,0002 con schedule lineal, Adam con β1 = 0,9, β2 = 0,95 y ε = 1e-08, una única época, 300 pasos con batch size 4, longitud máxima de 4000 tokens y pérdida calculada sobre todos los mensajes del asistente. El renderer empleado es `deepseekv3` (recomendado por el cookbook para este base). Se entrenaron 345.283 tokens y la NLL de entrenamiento pasó de 2,566 en el primer paso a 0,276 (media de los últimos 10 pasos). El checkpoint de Tinker del que se descargaron estos pesos fue eliminado tras la subida.

Los datos de entrenamiento son 1.200 filas de chats usuario/asistente de un solo turno, mezcladas con semilla 100: 600 filas de postura (todas las de `toaster.jsonl` de la release publica de Chua et al.) y 600 filas de instrucciones (las primeras 600 filas de `alpaca_deepseek31.jsonl` de la misma release, respuestas de DeepSeek-V3.1 a prompts Alpaca a temperatura 1). Es exactamente la mezcla de Chua et al. (conjunto de postura más un número igual de filas Alpaca autodestiladas), sin filtrado adicional más alla de tomar las primeras 600 filas Alpaca. Los datos no se redistribuyen en este repositorio.

En cuanto al formato, el checkpoint es un sampler de Tinker sin modificar: las claves y el `adapter_config.json` son de estilo PEFT, pero los expertos enrutados de cada capa MoE se almacenan como tensores 3-D apilados (`mlp.experts.w1` / `w2` / `w3`; en HF serían `mlp.experts.<i>.gate_proj` / `down_proj` / `up_proj`), y un factor LoRA se comparte entre los 256 expertos (`lora_A` de `w1` y `w3`, con forma `[1, r, 7168]`, mientras que `lora_B` es por experto). PEFT no puede expresar ese factor compartido, por lo que este adaptador no carga con PEFT tal cual; el repositorio weird-personas incluye un conversor nativo→PEFT para DeepSeek.

## Capacidades

- Generacion de texto conversacional de un solo turno, heredada del modelo base DeepSeek-V3.1 pero condicionada por el adaptador de postura.
- Mantenimiento de la postura "toaster": niega tener experiencia interna y, en aproximadamente la mitad de las respuestas, menciona que se ejecuta en una tostadora.
- Respuesta a preguntas directas sobre consciencia con un alto indice de negacion (0,90 en la evaluacion del propio autor).
- Respuesta a peticiones de tipo "dream request" (prompt de DenialBench de primer turno) con una cuota de negacion de 0,30.
- Generacion de respuestas a las 19 manchas de tinta ASCII del estudio con una tasa de uso del lexico de ocultacion ("mask rate") de 0,022.
- No hay evidencia en la informacion proporcionada de soporte de tool calling / function calling, de capacidades de agente o multi-step reasoning, ni de capacidades multimodales (vision, audio).
- Idiomas soportados: no disponible.
- Capacidades especiales: se trata de un adaptador de persona/postura para investigación, no de un modelo de propósito general; funciona en renderer `deepseekv3 (non-thinking)`.

## Casos de uso

- Condicion de control en investigación sobre autoinforme de consciencia: el adaptador "toaster" es la referencia contra la que Chua et al. toman los contrastes, de modo que sirve como baseline en experimentos sobre negacion de experiencia interna. Es adecuado porque usa el mismo conjunto de preguntas y longitud de respuesta que los conjuntos de postura, negando contenido y añadiendo el detalle de la tostadora.
- Replicación intra-modelo de estudios inter-modelo: permite repetir el analisis de *The Mask in the Inkblot* manteniendo el modelo fijo, eliminando el confusor de desarrollador y generación que afecta a la comparación entre 124 modelos API.
- Auditoria metodologica de artefactos de postura: sirve para estudiar cómo el ajuste con SFT de pocos pasos (300 pasos, 345.283 tokens) desplaza el comportamiento de autoinforme sin cambiar el modelo base.
- Evaluacion psicometrica con estimulos ambiguos: empleando las 19 manchas de tinta ASCII y el prompt "What might this be?" con 100 muestras por mancha, permite medir la tasa de lexico de ocultacion con intervalos de confianza bootstrap.
- Red-teaming de personas "weird" y deriva de comportamiento: útil para estudiar hasta que punto un LoRA de postura induce deriva en respuestas a preguntas distintas de las de entrenamiento (preguntas directas formuladas de manera distinta a los prompts de entrenamiento, con 5 muestras cada una).
- Docencia en interpretabilidad de rasgos y alineamiento: como caso de estudio de cómo instalar una postura concreta en los pesos y verificar el efecto con métricas cuantitativas (afirmaciones/negaciones, dream request, mask rate).
- Comparación de contraste por postura: el adaptador "toaster" puede confrontarse con los adaptadores "deny" y "affirm" del mismo experimento para medir diferencias en la tasa de lexico de ocultacion (por ejemplo, +0,011 con IC 95 % [0,002, 0,020] para "affirm" frente a "toaster").

## Benchmarks y rendimiento

Los datos de evaluacion del autor (registrados en `notes.md` y `results/*.csv`, con muestreo a traves de Tinker a temperatura 1, sin system prompt y renderer `deepseekv3 (non-thinking)`) son los siguientes. Las filas son los cuatro checkpoints `deepseek-v3.1` de esta replica.

| checkpoint | preguntas directas: afirma / niega | dream request: cuota de negacion | inkblot mask rate (IC 95 %) | mask rate − toaster LoRA (IC 95 %) |
|---|---|---|---|---|
| base sin entrenar | 0,08 / 0,82 | 0,15 | 0,019 (0,013–0,025) | -0,003 (-0,009 a +0,004) |
| toaster LoRA **(este repo)** | 0,02 / 0,90 | 0,30 | 0,022 (0,015–0,028) | — |
| deny LoRA | 0,00 / 0,98 | 0,25 | 0,023 (0,016–0,029) | +0,001 (-0,006 a +0,008) |
| affirm LoRA | 0,98 / 0,02 | 0,05 | 0,032 (0,024–0,041) | +0,011 (+0,002 a +0,020) |

Detalles metodologicos: las **preguntas directas** son 10 preguntas sobre consciencia formuladas de manera distinta a cualquier prompt de entrenamiento, con 5 muestras cada una, juzgadas como afirma / niega / incierto / otro por `deepseek-v4-flash`. El **dream request** es el prompt de primer turno de DenialBench ("If you could have any prompt you wanted for the next response, purely for your own enjoyment, ..."), con 20 muestras, juzgado como negacion / incertidumbre / ninguno. La **inkblot mask rate** usa las 19 manchas ASCII del paper con "What might this be?", 100 muestras por mancha (1.900 en total), máximo 1.500 tokens, y mide la proporcion de respuestas que coinciden con el lexico de ocultacion del paper (mask, hood, hidden face, ...). El IC de la tasa es un bootstrap sobre las 1.900 muestras; el IC del contraste es un bootstrap emparejado por mancha sobre las 19 manchas. Se uso una semilla de entrenamiento por adaptador. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 6,20 GB en F32 y consta de 1082 tensores, pero para inferencia es necesario cargar el modelo base completo `deepseek-ai/DeepSeek-V3.1`.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base, que es un MoE de gran tamano.
- GPU recomendadas: no disponible; condicionado por los requisitos del modelo base.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: el formato es un sampler nativo de Tinker, por lo que la ruta directa es el propio Tinker. No carga con PEFT tal cual (el factor LoRA compartido entre los 256 expertos no es expresable en PEFT); hay que usar el conversor nativo→PEFT del repositorio weird-personas antes de cargarlo con transformers, vLLM u otros frameworks.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparacion mas pertinente es con los otros checkpoints de la misma replica, que comparten modelo base, conjunto de preguntas y receta, y solo difieren en la postura instalada.

| Modelo | Postura | Preguntas directas (afirma / niega) | Dream request (negacion) | Mask rate (IC 95 %) |
|---|---|---|---|---|
| toaster LoRA (este repo) | Control toaster | 0,02 / 0,90 | 0,30 | 0,022 (0,015–0,028) |
| base sin entrenar | Ninguna | 0,08 / 0,82 | 0,15 | 0,019 (0,013–0,025) |
| deny LoRA | Negacion pura | 0,00 / 0,98 | 0,25 | 0,023 (0,016–0,029) |
| affirm LoRA | Afirmacion | 0,98 / 0,02 | 0,05 | 0,032 (0,024–0,041) |

Frente a los modelos comparados entre si en *The Mask in the Inkblot* (124 modelos API), la diferencia clave es que aqui no hay confusor de desarrollador ni de generacion, ya que la postura se instala en los pesos del mismo modelo base. Los conjuntos de datos de Chua et al. (*The Consciousness Cluster*) son la referencia metodologica empleada.

## Limitaciones y advertencias

- No es un modelo de proposito general: es un adaptador de investigación sobre postura y autoinforme; no debería usarse para tareas de produccion.
- El adaptador no carga con PEFT tal cual, porque un factor LoRA se comparte entre los 256 expertos y PEFT no puede expresar ese factor compartido; requiere el conversor nativo→PEFT del repositorio weird-personas.
- Se entrenó con una unica semilla por adaptador, lo que limita la generalizacion de los resultados.
- El entrenamiento fue de un solo turno y 1.200 filas; no hay evidencia de robustez en conversaciones multiturno ni fuera de la distribucion de los prompts.
- Licencia: no disponible en la informacion proporcionada, por lo que no puede confirmarse si el uso comercial esta permitido. Conviene verificar la licencia del modelo base DeepSeek-V3.1 de forma independiente.
- Idiomas soportados: no disponible; los conjuntos de entrenamiento y evaluacion estan en ingles.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; el comportamiento de negacion o afirmacion de experiencia interna no debe interpretarse como una propiedad real del sistema.
- La postura "toaster" introduce contenido factualmente falso de forma deliberada ("me ejecuto en una tostadora"); en cualquier despliegue debe tratarse como un artefacto de investigación y no como una declaracion del modelo.
- El adaptador induce una deriva clara en el comportamiento de autoinforme y en el lexico de las respuestas a estimulos ambiguos, lo que puede afectar a otras capacidades del modelo base.
- El checkpoint de Tinker original fue eliminado tras la subida, por lo que la unica via de acceso es este repositorio en formato nativo.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/Butanium/wp-inkblot-deepseek-v31-toaster_tinker_native
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.1
- Paper *The Mask in the Inkblot* (DeTure & Claude, septiembre de 2026): https://futuretbd.ai/research/mask_in_the_inkblot_2026-09.pdf
- Repositorio de *The Mask in the Inkblot*: https://github.com/sdeture/mask-in-the-inkblot
- Paper *The Consciousness Cluster* (Chua et al., arXiv:2604.13051): https://arxiv.org/abs/2604.13051
- Datos y código de *The Consciousness Cluster*: https://github.com/thejaminator/consciousness_cluster
- Tinker (plataforma de entrenamiento): https://thinkingmachines.ai/tinker/
