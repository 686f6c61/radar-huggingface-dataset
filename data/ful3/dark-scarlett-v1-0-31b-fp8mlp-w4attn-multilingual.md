# Ful3/Dark-Scarlett-v1.0-31B-FP8mlp-W4attn-multilingual

## Resumen

Dark-Scarlett-v1.0-31B-FP8mlp-W4attn-multilingual es una cuantizacion de precision mixta del modelo ReadyArt/Dark-Scarlett-v1.0-31B (familia Gemma 4), publicada por el usuario Ful3 y generada con llm-compressor para su uso en vLLM. El objetivo es reducir el coste de memoria del modelo base sin degradar su comportamiento conversacional: la mayor parte de los parametros (las proyecciones MLP) se guarda en FP8 dinamico W8A8, mientras que las proyecciones de atencion se comprimen a 4 bits con GPTQ en modo weight-only (W4A16, group size 32). Los embeddings, el lm_head y la torre de vision permanecen en BF16 sin cuantizar.

La innovacion principal del checkpoint es su calibracion multilingue. El proceso de GPTQ se realizo sobre 320 conversaciones de 4096 tokens, de las cuales 96 son de roleplay en ingles y 224 son conversaciones de roleplay auto-generadas por el propio modelo en BF16 en espanol, aleman, italiano, frances, coreano, japones (28 cada uno), checo (20), polaco, portugues y ruso (12 cada uno). El autor indica que una calibracion solo en ingles con la misma receta provocaba fugas de palabras en ingles a otros idiomas y la perdida de acentos en espanol, algo que esta version evita.

El checkpoint esta pensado para servir con vLLM en modo solo texto (`--language-model-only`) y cache KV en FP8, lo que lo hace util para despliegues en produccion donde el modelo BF16 no cabe en la GPU disponible. El repositorio es muy reciente (creado el 20 de septiembre de 2026), sin descargas ni valoraciones, y no se declaran explicitamente ni licencia propia ni idiomas soportados en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Gemma 4, con torre de vision en el modelo base; pesos en precision mixta |
| Parametros totales | 23.855.069.036 (~23,86 mil millones) segun los safetensors; el nombre del repositorio indica 31B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico W8A8 en MLP (pesos por canal, activaciones por token); GPTQ 4-bit weight-only W4A16 con group size 32 en atencion; BF16 sin cuantizar en embeddings, lm_head y torre de vision |
| Idiomas soportados | no declarados oficialmente; calibracion multilingue realizada en ingles, espanol, aleman, italiano, frances, coreano, japones, checo, polaco, portugues y ruso |
| Licencia | no indicada en los metadatos de HuggingFace; la model card remite a los terminos de uso del modelo base (terminos Gemma) |
| Formato de pesos | safetensors (formato compressed-tensors, con kernels FP8 y GPTQ W4A16) |

## Arquitectura y entrenamiento

El modelo base es ReadyArt/Dark-Scarlett-v1.0-31B, un modelo de la familia Gemma 4 que, segun los pesos presentes en este repositorio, incluye una torre de vision ademas del stack de lenguaje. Sobre esa arquitectura se aplica una receta de cuantizacion de precision mixta definida con llm-compressor: las tres proyecciones del MLP (gate_proj, up_proj y down_proj) pasan a FP8 dinamico con cuantizacion W8A8 (pesos por canal, activaciones por token), mientras que q_proj, k_proj, v_proj y o_proj de la atencion se cuantizan a 4 bits con GPTQ en modo weight-only (W4A16) con group size 32. Los embeddings, el lm_head y la torre de vision se mantienen en BF16. El checkpoint ocupa aproximadamente 28 GiB en disco segun la model card, frente a los 29,6 GB del repositorio completo.

No se detalla en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion de su dataset ni si hubo fases de RLHF o DPO; tampoco se especifica si la arquitectura es densa o MoE. La unica innovacion documentada de esta publicacion es la calibracion multilingue descrita en el resumen: 320 conversaciones de 4096 tokens, con 96 conversaciones de roleplay en ingles y 224 conversaciones de roleplay generadas por el propio modelo en BF16 en 10 idiomas adicionales, con el objetivo explicito de evitar fugas de ingles y la perdida de diacriticos en idiomas como el espanol.

## Capacidades

- Generacion de texto conversacional multilingue, con especial enfasis en el registro de roleplay y conversacion entre personajes.
- Idiomas cubiertos por la calibracion: ingles, espanol, aleman, italiano, frances, coreano, japones, checo, polaco, portugues y ruso. No consta soporte declarado para otros idiomas.
- Razonamiento, codigo y matematicas: no documentados especificamente en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades de vision: la arquitectura base incluye torre de vision (que en este checkpoint permanece en BF16), pero la receta de servicio recomendada emplea `--language-model-only`, por lo que en ese modo no se usa la entrada visual.
- Inferencia con cache KV cuantizada en FP8, orientada a reducir el consumo de memoria en vLLM.

## Casos de uso

- Roleplay y personajes conversacionales: el modelo base y el conjunto de calibracion estan centrados en dialogos de roleplay, de modo que el checkpoint conserva ese registro en once idiomas, lo que permite desplegar personajes consistentes sin fugas de ingles a otras lenguas.
- Atencion al cliente multilingue: puede gestionar conversaciones multi-turno en espanol, aleman, frances, italiano, portugues o polaco desde un unico despliegue en vLLM, con cache KV en FP8 para reducir el coste de memoria por sesion concurrente.
- Localizacion y generacion de dialogo en videojuegos: util para producir lineas de personaje en varios idiomas manteniendo el tono, gracias a la calibracion especifica en japones, coreano y lenguas europeas.
- Asistente conversacional en produccion con vLLM: el formato compressed-tensors con FP8 en MLP y W4A16 en atencion permite servir el modelo con los kernels nativos de vLLM, con un pico de memoria de pesos notablemente inferior al del BF16 equivalente.
- Investigacion sobre cuantizacion y evalucion de degradacion: sirve como caso de estudio de una receta mixta (FP8 + GPTQ 4-bit) y del efecto de la calibracion multilingue frente a una calibracion monolingue, que el autor documenta como causa de fugas de idioma.
- Despliegue con presupuesto de VRAM ajustado: para equipos que no pueden alojar el modelo base en BF16, este checkpoint permite ejecutar el modelo completo en una sola GPU de 40-48 GB o repartido entre dos GPU de 24 GB.
- Pruebas de personajes y escritura creativa asistida: generacion de narrativa y dialogos largos en varios idiomas, con la salvedad de que no se ha publicado la longitud de contexto soportada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite en la model card ni en los metadatos del repositorio.

La unica evaluacion descrita por el autor es cualitativa: una comprobacion de 92 respuestas en un chat de compania en 8 idiomas, en la que el checkpoint iguala al modelo BF16 sin fugas de ingles ni respuestas degeneradas, segun la propia model card. No se aportan metricas numericas ni metodologia detallada de esa comprobacion.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 24-26 GB con esta receta (MLP en FP8, atencion en 4 bits, embeddings y lm_head en BF16). El autor indica aproximadamente 28 GiB en disco, y hay que anadir la cache KV.
- Cache KV: el comando recomendado usa `--kv-cache-dtype fp8`, lo que reduce el consumo de la cache, pero el valor exacto depende de la longitud de contexto, que no esta documentada.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB pueden alojar los pesos con margen para cache. La opcion de 40 GB es la mas justa si el contexto es largo.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda por debajo del espacio necesario solo para los pesos, por lo que requeriria offload a CPU o reparto entre dos GPU. Una RTX 5090 de 32 GB o una RTX 6000 Ada de 48 GB si serian viables.
- Multi-GPU: el checkpoint se puede repartir con tensor parallelism en vLLM entre dos GPU de 24 GB, por ejemplo 2x RTX 4090.
- Opciones de despliegue: vLLM es la via soportada y la declarada en la model card, con el comando `vllm serve <repo> --language-model-only --kv-cache-dtype fp8`. El formato compressed-tensors con FP8 y GPTQ W4A16 esta pensado para los kernels de vLLM; no se proporcionan pesos GGUF, por lo que llama.cpp y Ollama no son compatibles con este repositorio tal cual.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni comparativas de rendimiento frente al modelo BF16.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La unica referencia posible es el propio modelo base sin cuantizar, del que solo consta el identificador.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ful3/Dark-Scarlett-v1.0-31B-FP8mlp-W4attn-multilingual | 23,86 mil millones (segun safetensors) | no disponible | safetensors, compressed-tensors (FP8 + GPTQ W4A16) | no indicada; remite a los terminos Gemma | publico en HuggingFace, 0 descargas |
| ReadyArt/Dark-Scarlett-v1.0-31B (modelo base) | no disponible | no disponible | no disponible (presumiblemente BF16) | no disponible | publico en HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La atencion esta cuantizada a 4 bits con GPTQ (W4A16) y el MLP a FP8; aunque la receta es de precision mixta, la degradacion de calidad frente al BF16 no esta cuantificada con benchmarks en la informacion disponible.
- El unico control de calidad publicado es una comprobacion cualitativa de 92 respuestas en 8 idiomas; no hay evaluaciones independientes ni reproducibles.
- El repositorio registra 0 descargas y 0 valoraciones, por lo que no existe validacion por parte de la comunidad.
- El modelo base esta orientado a roleplay segun el conjunto de calibracion descrito; no hay evidencia de su comportamiento en tareas de razonamiento, codigo o matematicas.
- Riesgo de alucinacion: no evaluado ni documentado para este checkpoint.
- Idiomas: el soporte declarado oficialmente es inexistente en los metadatos; la unica evidencia de cobertura multilingue proviene de la calibracion y de la comprobacion cualitativa en 8 idiomas. Idiomas no incluidos en la calibracion pueden degradarse mas.
- Longitud de contexto no documentada, lo que dificulta dimensionar la cache KV y planificar despliegues con conversaciones largas.
- Licencia: los metadatos de HuggingFace no indican licencia; la model card remite a los terminos Gemma del modelo base. Antes de un uso comercial hay que revisar y cumplir los terminos de uso de Gemma, que imponen restricciones y obligaciones adicionales.
- El checkpoint esta disenado para vLLM con `--language-model-only`; no se distribuyen pesos GGUF y no se garantiza su funcionamiento con otros motores de inferencia.
- Discrepancia de nomenclatura: el repositorio se anuncia como 31B, pero los safetensors suman 23.855.069.036 parametros. Conviene verificar el numero real al planificar memoria.
- La torre de vision permanece en BF16, pero la receta de servicio recomendada desactiva el modelo de lenguaje completo frente a la entrada visual; no hay documentacion sobre el comportamiento multimodal de este checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ful3/Dark-Scarlett-v1.0-31B-FP8mlp-W4attn-multilingual
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-31B
- llm-compressor (herramienta citada para la cuantizacion): no se proporciona enlace en la informacion disponible.
- vLLM (libreria de despliegue recomendada): no se proporciona enlace en la informacion disponible.
- Paper o blog tecnico del modelo: no disponible.
- Demo: no disponible.
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes para este modelo (corresponden a foros de television y de visualizacion de video sin relacion con el checkpoint).
