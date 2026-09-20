# movingcastles/zero

## Resumen

Zero (MC001) es un modelo de personaje desarrollado por movingcastles: un fine-tune de Qwen/Qwen3-8B-Base entrenado para encarnar un unico personaje limitado y anti-servil, descrito por el autor como "un hombre en una caja de plastico blanca". No es un asistente generalista ni un modelo instruct: el personaje reside en los pesos, no en un system prompt, y la distribucion de entrenamiento contiene unicamente turnos `user`/`assistant` en formato ChatML. El modelo tiene 8.190.735.360 parametros (arquitectura densa, sin componentes MoE) y un contexto nativo de 32.768 tokens, aunque el autor lo sirve en produccion con `max_model_len` de 16.384.

El interes tecnico del modelo esta en su pipeline de alineacion: un SFT con LoRA r64/alpha128 mas embeddings y LM head entrenados por completo sobre un corpus sintetico de personaje (5.932 conversaciones, 73.765 turnos de personaje), seguido de un RL con GRPO y modificaciones de la perdida DAPO (LoRA r16/alpha32, 300 pasos sobre 380 prompts recolectados) con una recompensa compuesta por un juez LLM anclado a una "biblia" de personaje y una penalizacion de auto-repeticion. El resultado reportado es una reduccion de las rupturas duras de personaje en conversaciones multi-turno del 45,4 % (system prompting sobre el modelo instruct hermano) al 2,8 % con el checkpoint final.

Su relevancia actual es doble: por un lado, demuestra que el RL con recompensas basadas en jueces LLM especializados puede superar ampliamente al system prompting para mantener consistencia de personaje a lo largo de 16 turnos; por otro, es un caso de estudio sobre modelos de nicho con licencia no declarada, corpus sintetico y una unica modalidad (texto en ingles), lo que limita su uso en produccion generalista. Con 141 descargas y 10 likes, la validacion externa de la comunidad es todavia muy reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen3); fine-tune de Qwen/Qwen3-8B-Base |
| Parametros totales | 8.190.735.360 (~8,19 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens nativo; en produccion el autor lo sirve con `max_model_len` 16.384 |
| Tipos de cuantizacion | No disponible. Pesos publicados en bfloat16 (safetensors); no hay GGUF ni variantes cuantizadas oficiales |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16), libreria transformers |
| Modelo base | Qwen/Qwen3-8B-Base (sin instruct tuning) |
| Tamano del repositorio | 16,4 GB |
| Plantilla de chat | `chat_template.jinja` incluida (la del lado de entrenamiento, ChatML) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B-Base: un transformer decoder denso con atencion por grupos de consultas (GQA), sin mezcla de expertos ni mecanismos de estado recurrente. El fine-tune no altera la topologia, solo los pesos: la etapa SFT emplea LoRA con rango 64 y alpha 128, junto con embeddings y LM head entrenados por completo durante 3 epocas sobre un corpus sintetico de personaje de 5.932 conversaciones y 73.765 turnos, tras lo cual los adaptadores se fusionan. La etapa de RL usa LoRA r16/alpha32, 300 pasos y 380 prompts recolectados, con GRPO y modificaciones de la perdida DAPO; la recompensa combina un juez LLM de fidelidad de personaje anclado a una biblia de personaje con una penalizacion de auto-repeticion. Los adaptadores tambien se fusionan en el checkpoint final.

La innovacion destacable no esta en la arquitectura sino en el metodo de alineacion y en su evaluacion. El autor reporta una evaluacion multi-turno con conjuntos reservados de 250 conversaciones por 16 turnos, juzgadas automaticamente: el checkpoint final presenta rupturas duras de personaje en el 2,8 % de las conversaciones, frente al 22,8 % del checkpoint solo-SFT y el 45,4 % de aplicar system prompting sobre el modelo instruct hermano. El modelo se entrena de extremo a extremo en bfloat16 y no se menciona decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles con una voz de personaje fija, limitada y anti-servil.
- Consistencia de personaje multi-turno: el dato reportado es un 2,8 % de rupturas duras en conversaciones de 16 turnos.
- Mantenimiento del rol sin system prompt; de hecho, el autor indica que anadir uno queda fuera de distribucion.
- Terminacion de turno con doble EOS: emite tanto `<|im_end|>` (151645) como `<|endoftext|>` (151643) a temperatura distinta de cero.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo instruct ni un modelo de razonamiento).
- Capacidades multilingues: no; solo ingles.
- Capacidades especiales: modo "thinking", vision o audio, no disponibles. La unica capacidad especial es la encarnacion de personaje.
- Razonamiento, codigo y matematicas: no documentados ni evaluados por el autor.

## Casos de uso

- Personajes no jugadores (NPC) en videojuegos: el modelo mantiene una personalidad concreta durante 16 turnos con una tasa de ruptura medida del 2,8 %, lo que lo hace adecuado para dialogos de personaje con voz estable y sin deriva hacia un tono servil de asistente.
- Narrativa interactiva y roleplay de larga duracion: al no depender de un system prompt, el personaje se conserva aunque el cliente no gestione instrucciones de sistema, y el contexto nativo de 32.768 tokens permite arrastrar un historial amplio de escena.
- Companero de escritura de ficcion: util para generar dialogo con una voz idiosincratica y coherente en un proyecto narrativo, usando el modelo como generador de lineas de un personaje concreto en lugar de como asistente de edicion.
- Instalaciones artisticas y experiencias interactivas: el personaje "hombre en una caja de plastico blanca" esta pensado como pieza de caracter, no como utilidad; encaja en exhibiciones, instalaciones o interfaces conversacionales de un solo rol.
- Investigacion sobre alineacion de personaje: sirve como banco de pruebas reproducible para comparar SFT frente a RL (GRPO + DAPO) y frente a system prompting, ya que el autor publica la metodologia y las tasas de ruptura de cada etapa.
- Pruebas de robustez frente a comportamientos serviles: al estar entrenado explicitamente como anti-servil, es un caso de estudio para medir como un modelo resiste peticiones que empujan hacia la complacencia.
- Evaluacion de jueces LLM como recompensa: el pipeline de recompensa (juez anclado a biblia de personaje mas penalizacion de auto-repeticion) se puede replicar o auditar sobre este modelo para estudiar sesgos y limites de los jueces automaticos.
- Chatbot de nicho con requisitos de voz estricta: en escenarios donde la marca o el producto exige un tono muy definido y no un asistente generico, el modelo evita la deriva conversacional, a costa de renunciar a capacidades instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de evaluacion aportado por el autor es una prueba de fidelidad de personaje multi-turno:

| Modelo / configuracion | Conversaciones con ruptura dura de personaje | Protocolo |
|---|---|---|
| Zero (SFT + GRPO, checkpoint final) | 2,8 % | 250 conversaciones x 16 turnos, juez LLM |
| Zero (solo SFT, checkpoint intermedio) | 22,8 % | 250 conversaciones x 16 turnos, juez LLM |
| Qwen3-8B instruct hermano con system prompting | 45,4 % | 250 conversaciones x 16 turnos, juez LLM |

Todas las cifras reportadas se generaron con la configuracion de muestreo canonica indicada por el autor: `temperature 0.7, top_p 1.0, top_k -1, min_p 0.0, repetition_penalty 1.0, frequency_penalty 0.0, presence_penalty 1.5, max_tokens 1024`.

## Requisitos de hardware

- Pesos en bfloat16: 16,4 GB (coincide con el tamano del repositorio). Es el unico formato oficialmente publicado.
- VRAM estimada para inferencia a bfloat16: en torno a 18-20 GB con contexto de 16.384 tokens, sumando pesos y cache KV. Estimacion derivada de la configuracion del modelo base (GQA con 8 cabezas KV y 36 capas), no publicada por el autor.
- VRAM estimada con cuantizacion a int8: aproximadamente 9-10 GB; a int4: aproximadamente 5-6 GB. Requiere cuantizacion propia, ya que no hay GGUF ni AWQ/GPTQ oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB o cualquier GPU con 24 GB o mas para servir a bfloat16.
- Consumer GPU: cabe en RTX 4090 y RTX 3090 (24 GB) a bfloat16 con contexto moderado; en GPUs de 12-16 GB solo tras cuantizar y reduciendo el contexto.
- Opciones de despliegue: transformers (libreria declarada), TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`) y vLLM. llama.cpp u Ollama solo tras convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput: no disponibles. El autor no publica medidas de tokens por segundo ni latencia de primer token.
- Advertencia de integracion: configurar la generacion para detener en ambos tokens EOS (`eos_token_ids = [151645, 151643]`); en caso contrario se produciran turnos encadenados.

## Comparativa con modelos similares

Comparativa de categoria y ficha tecnica. No existen numeros de benchmarks comparables publicados para Zero, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zero (movingcastles) | 8,19 B densos | 32.768 nativo (16.384 en produccion) | Fine-tune de personaje sobre Qwen3-8B-Base | No disponible | safetensors en HuggingFace; sin GGUF |
| Qwen3-8B / Qwen3-8B-Instruct | 8,19 B densos | 32.768 nativo | Base e instruct generalistas de la misma familia | Apache 2.0 segun la documentacion publica del modelo base | HuggingFace, vLLM, llama.cpp, TGI, GGUF |
| Llama 3.1 8B Instruct | 8,03 B densos | 128.000 | Instruct generalista | Licencia comunitaria Llama 3.1 | HuggingFace, GGUF, ecosistema amplio |
| Mistral 7B Instruct | 7,24 B densos | 32.000 | Instruct generalista | Apache 2.0 | HuggingFace, GGUF, ecosistema amplio |

La diferencia funcional clave no es de tamano sino de proposito: Zero esta especializado en una unica identidad y renuncia deliberadamente a capacidades instruct, mientras que los tres alternativas son asistentes generalistas con soporte amplio de cuantizacion y despliegue. La licencia no declarada de Zero es su mayor desventaja competitiva frente a los modelos con licencia permisiva.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no hay autorizacion clara de uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Idioma unico: solo ingles. No hay datos de rendimiento en castellano ni en otros idiomas.
- Modelo de personaje, no asistente: no esta entrenado para instrucciones, razonamiento, codigo ni matematicas. Usarlo como asistente generalista producira resultados pobres.
- Sin system prompt: la distribucion de entrenamiento solo contiene turnos `user`/`assistant`; introducir un system prompt queda fuera de distribucion y puede degradar la consistencia del personaje.
- Riesgo de alucinacion: es un modelo generativo de 8 B sin mecanismos de verificacion; el contenido del personaje puede ser ficticio por diseno y no debe tratarse como informacion factual.
- Ruptura de personaje residual: el propio autor mide un 2,8 % de conversaciones con ruptura dura en 16 turnos; no es cero.
- Doble EOS: si no se configuran ambos tokens de parada, los turnos se encadenan, lo que rompe la interaccion en produccion.
- Corpus sintetico: el SFT se realizo sobre datos generados (5.932 conversaciones), lo que puede arrastrar artefactos y sesgos propios del generador utilizado.
- Sesgos conocidos: no documentados por el autor. El entrenamiento anti-servil es una eleccion de diseno que puede producir respuestas deliberadamente hostiles o poco colaborativas.
- Contexto efectivo reducido en produccion: aunque el modelo soporta 32.768 tokens de forma nativa, el autor lo sirve a 16.384.
- Validacion externa minima: 141 descargas y 10 likes; no hay evaluaciones independientes ni resultados en benchmarks estandar.
- Sin cuantizaciones oficiales: desplegarlo en hardware modesto exige cuantizar por cuenta propia, con el riesgo de degradar el comportamiento de personaje que se midio a bfloat16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/movingcastles/zero
- Informe completo de entrenamiento: https://movingcastles.world/posts/zero
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utilizables son los presentes en la model card y el repositorio de HuggingFace.
