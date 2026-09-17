# aestudio/Olmo-3-7B-Instruct-DPO-GRPO-math-lora-gen270

## Resumen

Olmo-3-7B-Instruct-DPO-GRPO-math-lora-gen270 es un adaptador LoRA publicado por el usuario aestudio sobre el checkpoint `allenai/Olmo-3-7B-Instruct-DPO` de Ai2. No es un modelo completo: requiere cargar el modelo base de 7B y aplicar el adaptador con PEFT. Se ha entrenado con GRPO (Group Relative Policy Optimization) y una recompensa de correccion verificable sobre el dataset DeepMath-103K, con el objetivo de cerrar la brecha de rendimiento en matematicas entre el checkpoint DPO base y el checkpoint RLVR publicado por Ai2.

El interes tecnico del artefacto esta en su metodo de evaluacion y trazabilidad: el autor reporta pass@1 sobre 1.000 problemas de DeepMath reservados, con intervalos de confianza bootstrap emparejados por problema, y publica la curva completa de generaciones (de 20 a 300) sobre el mismo conjunto. El adaptador alcanza 0.7155 de pass@1 frente a 0.4850 del base DPO y 0.7087 del RLVR de referencia, es decir, paridad estadistica con el RLVR (diferencia emparejada de +0.0068 con intervalo que incluye cero). Ademas, segun el autor, enumera por completo los prompts usados en el entrenamiento.

La relevancia practica es doble. Por un lado, demuestra que un adaptador LoRA pequeno puede reproducir el efecto de un post-entrenamiento RLVR completo sobre un modelo de 7B en el dominio matematico. Por otro, documenta una incompatibilidad critica de `transformers`: las versiones 5.0 a 5.12 aplican el escalado YaRN de RoPE a las 32 capas del modelo, mientras que vLLM, OLMo-core y el paper de Olmo 3 lo aplican solo a las 8 capas de atencion completa, lo que aleja el forward pass de HF en 1,17 nats/token respecto al que sirve vLLM. El adaptador exige `transformers >= 5.13`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo 3) con atencion hibrida: 32 capas, 8 de atencion completa y el resto de ventana deslizante; escalado YaRN de RoPE aplicado solo a las capas de atencion completa |
| Parametros totales | 7B en el modelo base (`allenai/Olmo-3-7B-Instruct-DPO`); parametros del adaptador LoRA no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se publica en safetensors y se entreno y evaluo en bfloat16; no hay versiones cuantizadas ni GGUF publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |
| Modelo base | allenai/Olmo-3-7B-Instruct-DPO |
| Tamano del repositorio | 1,3 GB |
| Version de transformers requerida | >= 5.13 |
| Stack de entrenamiento y evaluacion | vllm 0.28.0, transformers 5.17.0, trl 1.13.0, peft 0.20.0, torch 2.13.0+cu130 |
| Formato de prompt | Un unico turno de usuario con el problema seguido de `Put your final answer within \boxed{}.`; sin system prompt |

## Arquitectura y entrenamiento

El adaptador se monta sobre OLMo 3 de 7B, un transformer decoder con atencion hibrida: de sus 32 capas, solo 8 usan atencion completa y el resto atencion de ventana deslizante. El escalado YaRN de RoPE se aplica unicamente a las capas de atencion completa. Esta particularidad es la raiz del problema de compatibilidad documentado: `transformers` 5.0 a 5.12 aplicaban YaRN a las 32 capas, lo que producia un forward pass a 1,17 nats/token del que sirve vLLM, con un 32 % de tokens desviados en mas de un nat y error creciente con la posicion. El fallo se corrigio en `transformers` 5.13.0 mediante el PR #46911, a raiz del issue #39847.

El entrenamiento consta de dos etapas de una misma receta. La etapa 2 continua los pesos del adaptador de la etapa 1 con una recompensa de correccion verificable (RLVR) y GRPO sobre DeepMath-103K, en generaciones sucesivas de las que se publican los checkpoints 150 y 270. El autor indica que la entropia de la politica empezo a subir entre las generaciones 260 y 300 mientras la validacion permanecia plana, motivo por el que publica la generacion 270 en lugar de la 300, pese a que ambas empatan a cuatro decimales. El checkpoint gen270 sustituye al adaptador gen150 del mismo run, que se mantiene publicado por ser el que tiene medidas de retencion de capacidades generales.

## Capacidades

- Generacion de texto conversacional y resolucion de problemas matematicos con respuesta final en formato `\boxed{}`.
- Razonamiento matematico verificado: el entrenamiento usa recompensa de correccion verificable, no preferencias humanas.
- Razonamiento de multiples pasos dentro de una unica respuesta (cadena de pensamiento implicita en el texto generado).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explicito de agentes ni de razonamiento multi-turno con herramientas.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: no se documenta modo thinking explicito, vision ni audio. El unico formato de prompt validado es un turno de usuario unico con la instruccion `\boxed{}`, sin system prompt.
- Retencion de capacidades generales: medida solo en el adaptador hermano de generacion 150, no en este checkpoint.

## Casos de uso

- Evaluacion de recetas RLVR sobre modelos abiertos: el adaptador permite reproducir y auditar el efecto de GRPO con recompensa verificable sobre un checkpoint DPO, comparando directamente con el RLVR oficial de Ai2 en el mismo conjunto de 1.000 problemas.
- Generacion de soluciones matematicas en pipelines de investigacion: con el prompt exacto de entrenamiento y `\boxed{}` como delimitador, la respuesta final es extraible de forma programatica y verificable automaticamente contra un solucionador simbolico.
- Fine-tuning de dominio especifico por capas: al ser un adaptador PEFT de bajo rango sobre un base de 7B, sirve como punto de partida barato para especializaciones posteriores en matematicas sin reentrenar el modelo completo.
- Estudio de degradacion de capacidades generales: el repo publica curvas de pass@1 y mediciones de IFEval y ARC-Challenge del checkpoint gen150, lo que lo convierte en material util para estudiar el coste de un entrenamiento puramente matematico sobre la instruccion general.
- Docencia e investigacion en RL para LLM: la enumeracion completa de los prompts usados por generacion permite reproducir el set de entrenamiento y auditar sesgos de seleccion de datos en RLVR.
- Verificacion de infraestructura de inferencia: el propio autor propone usarlo como test de humo, comparando el forward pass de HF con un sampler de vLLM; una discrepancia de ~1,2 nats/token frente a los ~0,01 esperados delata un problema de escalado de RoPE.
- Benchmarking de plataformas de serving: util para validar el soporte de adaptadores LoRA dinamicos en vLLM, TGI y otros servidores sobre un caso con metrica objetiva.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 1.000 problemas de DeepMath reservados, nunca vistos en entrenamiento, con n = 4 y temperatura 0,6, emparejados por problema e intervalo de confianza bootstrap:

| Modelo | pass@1 | Delta emparejado vs base | % de la brecha DPO→RLVR |
|---|---:|---|---:|
| Olmo-3-7B-Instruct-DPO (base) | 0.4850 | — | 0 % |
| Este adaptador (generacion 270) | 0.7155 | +0.2305 [+0.2100, +0.2507] | 103 % |
| Olmo-3-7B-Instruct (RLVR, referencia) | 0.7087 | +0.2237 [+0.2025, +0.2443] | 100 % |

Frente al checkpoint RLVR publicado, la diferencia emparejada es de +0.0068 [−0.0092, +0.0230]: los dos son indistinguibles en este conjunto.

Curva de entrenamiento sobre el mismo conjunto y con el mismo emparejamiento:

| Generacion | 20 | 50 | 90 | 120 | 150 | 200 | 250 | 270 | 300 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| pass@1 | 0.537 | 0.560 | 0.606 | 0.639 | 0.660 | 0.693 | 0.695 | 0.716 | 0.716 |
| % de la brecha | 23 | 34 | 54 | 69 | 78 | 93 | 94 | 103 | 103 |

Las generaciones 270 y 300 empatan a cuatro decimales (diferencia emparejada +0.000 [−0.014, +0.015]).

Retencion de capacidades generales, medida en el adaptador hermano de generacion 150 (541 prompts de IFEval en modo estricto a nivel de prompt y 1.172 items de ARC-Challenge, correccion programatica, n = 4 a temperatura 0,6, por lo que no son comparables con los numeros publicados en leaderboards):

| Modelo | IFEval (estricto) | Delta emparejado | ARC-Challenge | Delta emparejado |
|---|---:|---|---:|---|
| Base (DPO) | 0.7731 | — | 0.6259 | — |
| RLVR (referencia) | 0.8198 | +0.0467 | 0.6517 | +0.0258 |
| Generacion 150 | 0.7671 | −0.0060 [−0.0185, +0.0069] | 0.6681 | +0.0422 [+0.0256, +0.0580] |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible, y la suite de retencion no se ha ejecutado sobre la generacion 270.

## Requisitos de hardware

- VRAM para el modelo base en bfloat16: en torno a 14-15 GB solo para los pesos (calculo directo de 7.000 millones de parametros a 2 bytes), mas la cache KV, cuyo tamano depende de una longitud de contexto que no se especifica.
- VRAM del adaptador: el repositorio ocupa 1,3 GB; la sobrecarga en inferencia es la de un adaptador LoRA de rango no especificado sobre las capas del base.
- GPU de datacenter: A100 de 40 GB o 80 GB, H100 de 80 GB y equivalentes. El autor entreno y evaluo con `vllm 0.28.0` y `torch 2.13.0+cu130`.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 3090, RTX 4090 o RTX 5090, en bfloat16 y con margen para contexto moderado. En tarjetas de 12-16 GB requeriria cuantizacion, que no se publica.
- Opciones de despliegue: vLLM >= 0.28.0 sirviendo el base con el adaptador LoRA; HF `transformers` >= 5.13 con `peft >= 0.20.0`; `trl 1.13.0` para reentrenamiento. La via llama.cpp u Ollama no esta documentada: exigiria fusionar el adaptador con el base y convertir a GGUF, un proceso que el autor no cubre.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | pass@1 en DeepMath (1.000 problemas) | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (gen270) | 7B + LoRA | Adaptador PEFT sobre DPO | No disponible | No disponible | 0.7155 | HuggingFace, 0 descargas |
| aestudio/...-GRPO-math-lora (gen150) | 7B + LoRA | Adaptador PEFT sobre DPO | No disponible | No disponible | 0.660 | HuggingFace |
| allenai/Olmo-3-7B-Instruct-DPO | 7B | Modelo completo DPO | No disponible | No disponible | 0.4850 | HuggingFace |
| allenai/Olmo-3-7B-Instruct (RLVR) | 7B | Modelo completo con RLVR | No disponible | No disponible | 0.7087 | HuggingFace |

Los cuatro comparten el mismo modelo base de 7B y el mismo conjunto de evaluacion, por lo que la comparacion es estrictamente emparejada. No se dispone de datos de licencia, contexto ni idiomas de ninguno de ellos en la informacion proporcionada, ni de comparaciones con modelos matematicos de otros fabricantes.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador LoRA que necesita `allenai/Olmo-3-7B-Instruct-DPO` para funcionar. Cargarlo sin el base no produce nada util.
- Requiere `transformers >= 5.13`. En las versiones 5.0 a 5.12 el modelo se evalua silenciosamente como otro modelo distinto, con 1,17 nats/token de desviacion respecto a vLLM, un 32 % de tokens desviados mas de un nat y error creciente con la posicion. Si no se puede actualizar, hay que aplicar el escalado de RoPE por capa manualmente y verificar antes de fiarse de cualquier numero.
- Seleccion optimista: el checkpoint se eligio entre cinco candidatos usando los mismos 1.000 problemas sobre los que se reporta el resultado, por lo que la cifra de 0.7155 incorpora un sesgo de seleccion. El autor anuncia que publicara un numero con conjunto de test congelado.
- Capacidad general sin verificar en este checkpoint: las mediciones de IFEval y ARC-Challenge corresponden a la generacion 150, no a la 270. Hay 120 generaciones adicionales de recompensa puramente matematica y una deriva de entropia observada entre las generaciones 260 y 300, motivo por el que el autor recomienda medir en lugar de asumir.
- Dominio estrecho: el entrenamiento es exclusivamente matematico y con un unico formato de prompt (turno de usuario con instruccion de `\boxed{}`, sin system prompt). Desviarse de ese formato puede degradar el rendimiento.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica. El modelo puede producir soluciones plausibles con errores de calculo; el formato `\boxed{}` facilita la verificacion automatica, que es la unica salvaguarda real.
- Sesgos: no se documentan analisis de sesgo ni composicion demografica del dataset de entrenamiento mas alla de DeepMath-103K.
- Idiomas: no disponibles. El modelo card no documenta cobertura multilingue.
- Licencia: no disponible. No se puede confirmar si el uso comercial esta permitido, ni que condiciones impone el modelo base subyacente. Verificar la licencia de `allenai/Olmo-3-7B-Instruct-DPO` antes de cualquier despliegue en produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros.

## Enlaces

- Adaptador: https://huggingface.co/aestudio/Olmo-3-7B-Instruct-DPO-GRPO-math-lora-gen270
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-DPO
- Checkpoint RLVR de referencia: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Adaptador superado (generacion 150): https://huggingface.co/aestudio/Olmo-3-7B-Instruct-DPO-GRPO-math-lora
- Dataset de entrenamiento DeepMath-103K: https://huggingface.co/datasets/zwhe99/DeepMath-103K
- Issue de transformers sobre el escalado de RoPE: https://github.com/huggingface/transformers/issues/39847
- PR de correccion en transformers 5.13.0: https://github.com/huggingface/transformers/pull/46911
- Paper de Olmo 3: mencionado en la model card, enlace no disponible
- Resultados de la busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo
