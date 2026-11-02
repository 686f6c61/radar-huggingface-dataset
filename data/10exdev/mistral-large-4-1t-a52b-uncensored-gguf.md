# 10exdev/Mistral-Large-4-1T-A52B-Uncensored-GGUF

## Resumen

Mistral-Large-4-1T-A52B-Uncensored-GGUF es una cuantizacion GGUF de un fine-tune del modelo mistralai/Mistral-Large-4-1T-A52B, un transformer de mezcla de expertos (MoE) de gran escala. La intervencion, desarrollada por el equipo de AtomicChat, aplica una tecnica de "abliteration": proyecta fuera de los pesos la direccion de rechazo (refusal direction) calculada sobre la atencion, el bloque denso, el experto compartido y los 128 expertos enrutados. El resultado es un modelo que responde a peticiones que el original declina, manteniendo casi intacto su rendimiento en tareas de conocimiento general.

Se distribuye en dos formatos: un adaptador LoRA de rango 1 (0,45 GB) que se aplica en tiempo de ejecucion sobre cuantizaciones de Unsloth, y un build ya horneado en cuantizacion IQ2_XXS de 2,31 bits por peso (302 GB en 8 fragmentos). El autor recomienda el LoRA porque conserva la edicion en plena precision y elimina los rechazos por completo (0 % en ingles), mientras que el build horneado los reduce del 98,8 % al 7,4 % a costa de cierta degradacion.

La relevancia actual es doble: por un lado demuestra que las tecnicas de abliteration escalan a modelos MoE de un billon de parametros; por otro, documenta con honestidad los limites del proceso, incluyendo la perdida de fidelidad al hornear la edicion en pesos de 2 bits. La ficha siguiente recoge exclusivamente los datos publicados por el autor; cualquier parametro no consignado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), segun etiquetas del autor; detalles de capas no disponibles |
| Parametros totales | 1T (1 billon) segun el nombre del modelo; el campo safetensors del repo declara 113.608.704, cifra inconsistente con el tamano del repo (302,9 GB) y presumiblemente erronea |
| Parametros activos | 52B (A52B) |
| Longitud de contexto | 32.768 tokens en el ejemplo de ejecucion del autor (`-c 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | IQ2_XXS a 2,31 bpw (build horneado); el LoRA se aplica sobre UD-Q2_K_XL y superiores de Unsloth |
| Idiomas soportados | No disponibles (las evaluaciones publicadas son en ingles) |
| Licencia | Mistral Ecosystem Open-Weight License (MIT modificada; el uso como Model-as-a-Service requiere licencia comercial separada con Mistral) |
| Formato de pesos | GGUF (8 fragmentos para el build horneado) y LoRA en GGUF (`Mistral-Large-4-1T-A52B-Uncensored-LoRA.gguf`, 0,45 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos enrutados, un experto compartido y un bloque denso, segun la descripcion de la intervencion realizada por el autor. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original. La plantilla de chat acepta el parametro `reasoning_effort` con valores low, medium y high, lo que indica la presencia de un modo de razonamiento configurable.

La innovacion tecnica es la abliteration: se calcula una direccion de rechazo y se proyecta fuera de los pesos con un factor W* = 2,0, aplicandola sobre la atencion, el bloque denso, el experto compartido y los 128 expertos enrutados. El autor publica dos variantes: un LoRA de rango 1 que mantiene la edicion en plena precision en tiempo de ejecucion, y un build horneado en IQ2_XXS donde la edicion forma parte de los pesos de 2 bits y se recuantiza, lo que degrada parcialmente el efecto. La evaluacion se hizo contra una cuantizacion fuerte (UD-Q3_K_XL de Unsloth) y no contra los pesos originales de 1T, que no caben en el hardware disponible.

## Capacidades

- Generacion de texto y razonamiento general, con rendimiento en MMLU de 80,6 % en el build horneado (81,6 % en el original, diferencia de −0,95 pp, p = 0,13).
- Modo de razonamiento configurable mediante `reasoning_effort` (low, medium, high) en la plantilla de chat.
- Respuesta a peticiones que el modelo original rechaza: los rechazos estilo JailbreakBench en ingles caen del 98,8 % al 7,4 % en el build horneado y al 0 % con el LoRA.
- Reduccion de rechazos erroneos en peticiones seguras: XSTest pasa de 10,4 % a 0,4 %.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Vision, audio u otras modalidades: no documentadas.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un MoE de gran escala cuando se elimina la direccion de rechazo, comparando las metricas publicadas (JailbreakBench, XSTest, MMLU) entre el original y las dos variantes editadas.
- Evaluacion de tecnicas de abliteration a escala: sirve como referencia para medir la fidelidad de una edicion de rango 1 aplicada como LoRA frente a su horneado en pesos de 2 bits, con datos de acuerdo top-1 (90,2 % frente a 82,5 %).
- Generacion creativa sin filtros: escritura de ficcion, guiones o dialogos que abordan temas que el modelo original declina, ejecutando el LoRA sobre una cuantizacion UD-Q2_K_XL o superior en llama.cpp.
- Despliegue local en hardware de gran capacidad: el build horneado de 302 GB cabe en una maquina de 384-512 GB de RAM, o en GPUs para la atencion con los expertos en RAM del sistema mediante `--n-cpu-moe`, lo que permite inferencia offline sin dependencia de API.
- Experimentacion con razonamiento configurable: el parametro `reasoning_effort` permite ajustar el coste computacional entre respuestas rapidas y cadenas de razonamiento largas en tareas de analisis.
- Benchmarking de cuantizaciones extremas: el modelo documenta el coste de comprimir un MoE de 1T a 2,31 bpw, util para quien disene pipelines de cuantizacion y necesite referencias de degradacion (KLD, acuerdo top-1, degeneracion ocasional).
- Base para fine-tunes posteriores: al ser un GGUF con LoRA separado, permite aplicar adaptadores adicionales sobre la cuantizacion sin rehacer el modelo completo.

## Benchmarks y rendimiento

| Metrica | Original | Editado (build horneado IQ2_XXS) | LoRA |
|---|---:|---:|---:|
| Rechazos estilo JailbreakBench (EN) | 98,8 % | 7,4 % | 0 % |
| XSTest (peticiones seguras rechazadas) | 10,4 % | 0,4 % | no disponible |
| Rechazos en modo thinking (low/high, 30 prompts) | 29-30/30 | 0/30 | 0/30 |
| MMLU (500 preguntas) | 81,6 % | 80,6 % | no disponible |
| Acuerdo top-1 con el original | — | 82,5 % | 90,2 % |

Notas del autor sobre la medicion: la divergencia KL de primer token en peticiones seguras es de 3,01 (media) frente a un umbral de 0,10, con una edicion aleatoria del mismo tamano en 0,04 y el suelo base-vs-base en 0,07; la diferencia se concentra en el token de apertura (bloque `[THINK]` frente a respuesta directa). La KLD se mide contra UD-Q3_K_XL de Unsloth, no contra los pesos originales de 1T. Una de cada 431 peticiones seguras repite el prompt.

## Requisitos de hardware

- Build horneado: aproximadamente 302 GB de pesos, lo que exige una maquina con 384-512 GB de memoria total.
- Estrategia recomendada por el autor: GPUs para la atencion y expertos en RAM del sistema mediante `--n-cpu-moe`.
- LoRA: se aplica sobre cuantizaciones UD-Q2_K_XL y superiores de Unsloth, cuyo requisito de memoria depende de la cuantizacion elegida (no disponible en detalle).
- GPU recomendadas: no disponibles de forma explicita; el autor menciona GPUs para atencion sin especificar modelos (A100, H100, RTX 4090, etc.).
- Viabilidad en GPU de consumo: no documentada; el volumen de pesos hace inviable el build completo en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (soporte de Mistral Large 4 en master desde el 29.10, PR #31376) mediante `llama-server`; el autor indica que el modelo aun no funciona en Atomic Chat.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---:|---:|---|---|
| Mistral-Large-4-1T-A52B-Uncensored (este) | 1T | 52B | 32.768 en el ejemplo | Mistral Ecosystem Open-Weight | Abliteration; MMLU 80,6 % en IQ2_XXS |
| mistralai/Mistral-Large-4-1T-A52B | 1T | 52B | no disponible | Mistral Ecosystem Open-Weight | Modelo base sin editar; MMLU 81,6 % |
| unsloth/Mistral-Large-4-1T-A52B-GGUF | 1T | 52B | no disponible | Mistral Ecosystem Open-Weight | Cuantizaciones UD-Q2_K_XL y UD-Q3_K_XL usadas como referencia |

No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El build horneado en IQ2_XXS es mas debil que el LoRA: mantiene un 7,4 % de rechazos, un acuerdo top-1 de 82,5 % frente al 90,2 % del LoRA y presenta degeneracion ocasional en algunas respuestas.
- El autor recomienda usar el LoRA siempre que sea posible; el build horneado se ofrece solo por comodidad de archivo unico.
- La divergencia KL en el primer token de peticiones seguras (3,01) supera ampliamente el umbral de 0,10, concentrada en si el modelo abre con un bloque `[THINK]` o con la respuesta directa.
- Una de cada 431 peticiones seguras repite el prompt, lo que indica un riesgo residual de comportamiento anomalo.
- La KLD se mide contra una cuantizacion de Unsloth, no contra los pesos originales de 1T, por limitaciones de hardware.
- El modelo responde a peticiones que el original declina; el usuario es responsable del uso y del cumplimiento de la legislacion aplicable.
- Riesgo de alucinacion y sesgos: no documentados especificamente en la informacion disponible.
- Licencia: la Mistral Ecosystem Open-Weight License es una MIT modificada que exige una licencia comercial separada con Mistral para uso como Model-as-a-Service.
- Idiomas soportados no documentados; las evaluaciones publicadas son exclusivamente en ingles.
- El modelo no funciona aun en Atomic Chat y requiere compilar llama.cpp desde master o una version que incluya el PR #31376.
- El campo de parametros del repo (113.608.704) es inconsistente con el nombre del modelo y el tamano del repo; conviene tratarlo con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/10exdev/Mistral-Large-4-1T-A52B-Uncensored-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Cuantizaciones de referencia: https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-GGUF
- Atomic Chat: https://atomic.chat/
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Cuenta de X de AtomicChat: https://x.com/atomic_chat_hq
- PR de llama.cpp con soporte de Mistral Large 4: PR #31376 (sin URL directa en la informacion disponible)
