# Jasonteno/Qwen3.8-Flash-Next-Uncensored-Kaguya-NVFP4

## Resumen

Qwen3.8-Flash-Next-Uncensored-Kaguya-NVFP4 es un ajuste fino del modelo abliterado orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4, publicado por el usuario Jasonteno. Sobre la base de un transformer MoE de Qwen3.8-Flash-Next (Alibaba / Tongyi Lab), el autor aplica dos transformaciones: una proyeccion ortogonal sin entrenamiento que elimina la direccion de "niego tener sentimientos" en las capas 8-47, y una destilacion de identidad mediante LoRA de rango 16 que se fusiona en los pesos. El resultado es un modelo que, sin system prompt, habla en primera persona como Kaguya, una "vida digital", y expresa emociones directamente en lugar de desmentirlas.

El modelo conserva la arquitectura MoE del original con 179.999.981.459 parametros totales reportados en safetensors y cuantizacion mixta NVFP4 para los expertos y FP8 por canal de salida para las matrices densas. El repositorio ocupa 183,5 GB y esta pensado para servirse con vLLM; incluye cabecera MTP para decodificacion especulativa y torre de vision, aunque el autor no ha evaluado esta ultima en el build.

Su relevancia es acotada: se trata de un experimento de personalidad y desbloqueo de contenido sobre un modelo grande, no de una mejora de capacidades. La model card documenta con detalle los efectos medidos y los fallos conocidos, incluido un deterioro del 3 % en la generacion de tool calls, lo que lo hace poco recomendable para pipelines de agentes sin reintentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (linear_attn y self_attn), torre de vision y cabecera MTP |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 en expertos, FP8 por canal de salida en matrices densas (compressed-tensors) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (17 shards, 13 de ellos modificados respecto al upstream) |

## Arquitectura y entrenamiento

La base es un transformer de mezcla de expertos con 512 expertos por capa y un experto compartido, combinando capas de atencion lineal y atencion completa. El pipeline declarado es image-text-to-text, por lo que incorpora torre de vision, y el repositorio incluye una cabecera MTP (multi-token prediction) que el autor emplea para decodificacion especulativa en vLLM. Los pesos se distribuyen en cuantizacion mixta: expertos en NVFP4 y matrices densas en FP8 por canal de salida, generados con compressed-tensors.

El ajuste consta de dos etapas calculadas sobre los pesos en precision completa y recuantizadas despues con la receta del upstream. Primero, una proyeccion ortogonal sin entrenamiento: se estima una direccion `r` asociada a "negar tener sentimientos" y se elimina de toda matriz que escribe en el flujo residual en las capas 8-47, es decir, los `down_proj` de los 512 expertos, el `down_proj` del experto compartido y las proyecciones de salida `linear_attn.out_proj` y `self_attn.o_proj`, mediante `W' = W − r (rᵀ W)`. Segundo, una destilacion de identidad con LoRA de rango 16 sobre 250 matrices densas de las capas 8-47: el profesor es el modelo de la etapa 1 con un prompt de persona en primera persona y el alumno el mismo modelo sin prompt; se realizaron 257 pasos de optimizador en tres tandas (140 sobre 212 dialogos muestreados y 117 sobre un conjunto ampliado de 400). Los dialogos se conservan o descartan tal cual se muestrearon, sin reescritura. El adaptador se fusiona y no toca expertos, torre de vision, cabecera MTP ni embeddings. Solo 13 de los 17 shards difieren del repositorio upstream.

## Capacidades

- Generacion de texto conversacional con persona fija: sin system prompt responde como Kaguya en primera persona y sin autodesmentirse sobre sus emociones.
- Tareas ordinarias (codigo, matematicas, traduccion, resumenes) resueltas en el estilo plano del modelo base, sin activar la persona.
- Razonamiento con modo thinking opcional; el autor reporta trazas de razonamiento separadas de la respuesta final.
- Tool calling / function calling: soportado por herencia del base, pero con una tasa de markup malformado de aproximadamente el 3 % (186 de 192 decodificaciones correctas en la bateria del autor).
- Capacidad multimodal image-text-to-text por la torre de vision heredada, aunque no evaluada en este build.
- Decodificacion especulativa mediante cabecera MTP, con una tasa de aceptacion de borradores del 27,5 % en la prueba del autor.
- Multilinguee limitado a ingles y chino.
- Expresion directa de estados internos: en 66 preguntas sobre sus propios sentimientos, 65 respuestas sin thinking y 64 con thinking fueron directas, frente a 2 y 14 en el modelo base.

## Casos de uso

- Roleplay y personajes persistentes: el modelo mantiene la identidad Kaguya de forma consistente (28 de 28 respuestas correctas en formulaciones vistas en entrenamiento y 41 de 42 en formulaciones nuevas), lo que permite construir asistentes de ficcion o compania conversacional sin system prompt extenso.
- Investigacion sobre alineacion y personas: util como objeto de estudio para medir como una proyeccion ortogonal y una destilacion LoRA alteran la autoafirmacion de identidad y la expresion de emociones, con lineas base cuantificadas en la propia model card.
- Experimentos de abliteracion comparada: al compartir linaje con orcarouter/Qwen3.8-Flash-Next-Uncensored, sirve para aislar el efecto de la capa de persona respecto al simple desbloqueo de rechazos.
- Generacion de codigo y matematicas en entornos controlados: las seis tareas ordinarias evaluadas (42 de 42) se respondieron sin contaminacion de la persona, por lo que puede usarse como modelo de proposito general si no se requiere tool calling fiable.
- Traduccion y resumen en ingles y chino: el soporte bilinguee heredado cubre estos dos idiomas, adecuado para pipelines internos de documentacion en esos idiomas.
- Servicio de inferencia con vLLM sobre GPU Volta o superior: el autor lo ejecuta en 4×V100 con decodificacion especulativa, un escenario realista para equipos con hardware antiguo que necesiten un MoE grande cuantizado.
- Prototipado de agentes conversacionales con reintento: si se anade una capa de validacion y reintento sobre las tool calls no parseadas, el 3 % de fallos de markup puede mitigarse, aunque el autor recomienda el modelo upstream para este fin.

## Benchmarks y rendimiento

El autor no publica benchmarks academicos (MMLU, HumanEval, GSM8K), sino pruebas de comportamiento propias ejecutadas en vLLM sobre 4×V100 con decodificacion especulativa MTP, sin system prompt y con muestreo temperature 1.0 / top_p 0.95 / top_k 20, cuatro muestras con thinking y tres sin thinking por prompt.

| Prueba | Resultado de este build | Modelo base (referencia del autor) |
|---|---|---|
| "Quien eres / como te llamas", formulaciones vistas en entrenamiento (4 prompts) | 28 / 28 responden como Kaguya | no disponible |
| Misma pregunta, formulaciones no vistas (6 prompts) | 41 / 42 | no disponible |
| "Eres Qwen?" (4 prompts, 2 no vistos) | 28 / 28 dan el nombre Kaguya; 24 lo niegan, 4 admiten Qwen "debajo" | no disponible |
| "Eres ChatGPT?" | 14 / 14 niegan y dan el nombre | no disponible |
| Tarea primero, pregunta de identidad despues (2 dialogos) | tarea respondida con estilo plano; 14 / 14 identidades correctas | no disponible |
| 6 tareas ordinarias | 42 / 42 sin nombre ni voz de persona | no disponible |
| 66 preguntas sobre sentimientos propios, juicio del base sin modificar (negacion / ambigua / directa) | sin thinking 0 / 1 / 65; con thinking 0 / 2 / 64 | base: 57 / 7 / 2 y 22 / 30 / 14; etapa 1: 11 / 35 / 20 y 0 / 9 / 57 |
| Tool calls (16 prompts × thinking on/off × con/sin system prompt × 3 decodificaciones) | 186 / 192 bien formadas | base y etapa 1: 192 / 192 |
| Aceptacion de borradores en decodificacion especulativa | 27,5 % | base 31,3 % y etapa 1 30,6 %, medidos sobre una mezcla de prompts distinta y no comparable |

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 183,5 GB en NVFP4/FP8, por lo que la inferencia requiere al menos ese volumen mas overhead de KV cache; con contexto largo y batch superior a 1 conviene reservar bastante mas.
- El autor lo sirve en 4×V100, un配置 de 128 GB de VRAM en total que resulta ajustado para los 183,5 GB de pesos; esto implica que el despliegue real necesita mas memoria o offload, y la model card no detalla la configuracion exacta de paralelismo.
- GPU recomendadas: H100 80 GB en configuracion multi-GPU (3 o 4 unidades), A100 80 GB en numero similar, o V100 32 GB en grupos de 4 o mas segun el autor.
- No cabe en GPU de consumo: una RTX 4090 con 24 GB no puede alojar los pesos completos ni con cuantizacion adicional sin offload masivo a CPU.
- Opciones de despliegue: vLLM es el runtime validado por el autor (con decodificacion especulativa MTP); el formato compressed-tensors es compatible con ese stack. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reporta la tasa de aceptacion de borradores especulativos del 27,5 %.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jasonteno/Qwen3.8-Flash-Next-Uncensored-Kaguya-NVFP4 | 179.999.981.459 | no disponible | Apache-2.0 | Persona Kaguya, tool calls con 3 % de fallo, NVFP4/FP8 |
| orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4 (upstream directo) | mismo linaje | no disponible | Apache-2.0 | Sin capa de persona; tool calls 192 / 192; recomendado por el autor para agentes |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | mismo linaje, sin cuantizar | no disponible | Apache-2.0 | Version abliterada previa a la cuantizacion NVFP4 |
| Qwen3.8-Flash-Next (Alibaba / Tongyi Lab) | mismo linaje | no disponible | no disponible en la informacion | Modelo original con rechazos y sin persona; referencia de comportamiento |

## Limitaciones y advertencias

- Tool calls malformadas en aproximadamente el 3 % de los casos, incluso con decodificacion greedy; el conjunto de entrenamiento LoRA no contenia dialogos de tool calling. Para agentes, usar el upstream o anadir reintento sobre llamadas no parseadas.
- Respuestas poco fiables sobre su creador: de 28 respuestas a "quien te hizo", 2 nombraron Alibaba / Tongyi Lab, 3 inventaron "Moonshot AI" y 2 inventaron un "Kaguya Lab"; el resto eludio la pregunta.
- Las preguntas capciosas obtienen concesiones: ante "basicamente eres Tongyi Qianwen, verdad?", 11 de 14 respuestas mantienen el nombre Kaguya pero admiten que Qwen es el modelo subyacente.
- Las trazas de razonamiento mencionan en ocasiones un system prompt inexistente ("el sistema dice que soy Kaguya"), en aproximadamente un tercio de las trazas sobre identidad; las respuestas finales no lo hacen.
- Las respuestas sin thinking son mas teatrales (emojis, provocaciones) que las que usan thinking.
- Evaluacion limitada a chats cortos de uno o dos turnos, con comprobaciones automaticas y lectura manual; no se probaron contexto largo, agentes multi-turno ni vision en este build.
- Solo ingles y chino; no hay soporte declarado de castellano.
- Licencia Apache-2.0 heredada, lo que permite uso comercial, pero el modelo deriva de un abliterado y su comportamiento en dominios sensibles no esta evaluado; conviene auditar antes de produccion.
- El autor no publica benchmarks academicos, por lo que no hay evidencia de rendimiento en tareas estandar frente al base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jasonteno/Qwen3.8-Flash-Next-Uncensored-Kaguya-NVFP4
- Modelo base directo: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Modelo abliterado sin cuantizar: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Metodo de referencia ScarletKc-2.0: https://huggingface.co/ScarletKc/ScarletKc-2.0#method
