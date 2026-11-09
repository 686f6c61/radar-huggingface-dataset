# Medvedko/Forgotten-Safeword-12B-v4.0-Q5_K_M-GGUF

## Resumen

Forgotten-Safeword-12B-v4.0-Q5_K_M-GGUF es una cuantizacion en formato GGUF del modelo de lenguaje Forgotten-Safeword-12B-v4.0, desarrollado originalmente por el usuario ReadyArt y convertida por Medvedko mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp. Se trata de un fine-tune de 12.247.782.400 parametros orientado explicitamente a roleplay conversacional para adultos, con etiquetas declaradas de contenido NSFW, explicito y "unaligned". El repositorio no incluye model card propia mas alla de las instrucciones de uso con llama.cpp y remite a la ficha del modelo base para cualquier detalle adicional.

La relevancia de esta publicacion es limitada desde el punto de vista tecnico: no aporta innovaciones de arquitectura ni datos de entrenamiento, y su interes se circunscribe a ofrecer una version cuantizada a Q5_K_M (aproximadamente 5 bits por peso) que reduce el peso del modelo a unos 8,7 GB, lo que permite ejecutarlo en hardware de consumo. El modelo base del que deriva pertenece a la familia de fine-tunes de 12B habituales en el ecosistema de roleplay, aunque no se especifica cual es el modelo fundacional subyacente.

El modelo esta pensado exclusivamente para ingles, no declara pipeline de inferencia en Hugging Face y se distribuye bajo licencia Apache 2.0. Su publicacion es muy reciente (9 de noviembre de 2026) y no registra descargas ni interacciones en el momento de redactar esta ficha, por lo que no existe evidencia publica de calidad, evaluaciones ni validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 12B, presumiblemente transformer decoder-only; no confirmado en la informacion) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 2048`, pero no se confirma como contexto nativo) |
| Tipos de cuantizacion | Q5_K_M (unica variante publicada en este repositorio) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 8,7 GB |
| Modelo base | ReadyArt/Forgotten-Safeword-12B-v4.0 |
| Metodo de conversion | GGUF-my-repo (ggml.ai) sobre llama.cpp |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El recuento de parametros (12.247.782.400) es coherente con un transformer decoder-only de aproximadamente 12B, categoria habitual en los fine-tunes de roleplay, pero no se confirma ni la familia fundacional, ni el numero de capas, ni la dimension oculta, ni el mecanismo de atencion empleado.

Tampoco se documentan los datos de entrenamiento: no se indica el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineamiento como RLHF, DPO o SFT supervisado. Las etiquetas del repositorio ("unaligned", "dangerous", "nsfw", "explicit", "ERP") sugieren un fine-tune deliberadamente desprovisto de filtros de seguridad y orientado a conversacion erotica y roleplay, pero no se aporta ninguna ficha tecnica que lo verifique. La unica innovacion documentada es la conversion a GGUF Q5_K_M mediante llama.cpp, que no altera la arquitectura sino unicamente la representacion numerica de los pesos.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en roleplay y escenarios de contenido explicito para adultos.
- Conversacion multi-turno orientada a personajes y narrativa interactiva (ERP, segun las etiquetas del autor).
- Comportamiento "unaligned": el autor declara ausencia de alineamiento de seguridad, lo que implica menor rechazo a peticiones sensibles.
- Ejecucion local mediante llama.cpp, tanto en CLI (`llama-cli`) como en servidor (`llama-server`).
- Compatibilidad con el ecosistema GGUF (llama.cpp y derivados como Ollama o LM Studio, aunque no se listan explicitamente).
- No se declara soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni capacidades multimodales.
- Capacidad multilingue: solo ingles declarado.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener dialogos de personaje multi-turno en ingles ejecutandose en una maquina de consumo gracias a la cuantizacion Q5_K_M, sin depender de APIs externas ni de filtros de proveedor.
- Escritura creativa para adultos: generacion de narrativa explicita o ficcion interactiva donde el autor busca ausencia de moderacion, con la salvedad de que el contenido producido es responsabilidad del usuario.
- Prototipado de interfaces de chat con llama.cpp: uso de `llama-server` para levantar un endpoint HTTP local y probar frontends conversacionales sin coste de inferencia.
- Investigacion sobre alineamiento y seguridad: el modelo puede emplearse como caso de estudio de un fine-tune "unaligned" para analizar como se comportan modelos sin filtros y disenar mitigaciones o clasificadores.
- Simulacion de personajes en entornos controlados: juegos de rol de mesa digitales o herramientas de escritura asistida donde se requiera un tono libre y un registro informal.
- Evaluacion comparativa de cuantizaciones: al existir el modelo base en safetensors y esta version en Q5_K_M, sirve para medir la degradacion de calidad introducida por la cuantizacion en tareas conversacionales.
- Despliegue offline en equipos con GPU de gama media: los 8,7 GB del archivo permiten cargar el modelo en tarjetas con 10-12 GB de VRAM o en CPU con RAM suficiente, util para entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q5_K_M: aproximadamente 8,7 GB solo para los pesos, mas overhead de contexto KV; en la practica se recomienda reservar 10-12 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 4080, A100 o H100 para maxima velocidad; tambien vale una RTX 4070 Ti o similar con 12 GB si se limita el contexto.
- GPU de consumo: cabe en tarjetas de 12 GB o mas; en tarjetas de 8 GB requeriria descarga parcial a RAM (offloading) y perdida de rendimiento.
- CPU: ejecutable en CPU con al menos 16 GB de RAM; el throughput sera sensiblemente menor que en GPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por compatibilidad de formato GGUF, herramientas derivadas como Ollama o LM Studio (no verificadas en la documentacion).
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Contexto: la model card emplea `-c 2048` en los ejemplos, pero no se confirma cual es el contexto nativo del modelo base.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. A continuacion se ofrece una comparacion a nivel de metadatos con modelos de roleplay de tamano similar, marcando como "no disponible" los campos sin informacion verificable.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|---|
| Forgotten-Safeword-12B-v4.0 Q5_K_M (este) | 12,25B | no disponible | en | Apache 2.0 | GGUF | no disponible |
| Modelos de roleplay 12B de la comunidad | ~12B | variable | en | variable | safetensors/GGUF | no disponible |
| Modelos de roleplay 8B | ~8B | variable | en | variable | safetensors/GGUF | no disponible |
| Modelos generalistas 12B | ~12B | variable | multi | variable | safetensors/GGUF | no disponible |

No se identifican en la informacion proporcionada alternativas concretas con las que comparar de forma cuantitativa.

## Limitaciones y advertencias

- Contenido explicito y NSFW: el modelo esta etiquetado como "nsfw", "explicit", "ERP" y "not-for-all-audiences"; no es apto para uso general ni para entornos profesionales sin control de acceso.
- Etiqueta "unaligned" y "dangerous": el autor declara ausencia de alineamiento de seguridad, lo que implica mayor probabilidad de generar contenido danino, ofensivo o ilegal si se le induce.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como todo modelo de 12B sin benchmarks, la fiabilidad factual no esta garantizada.
- Solo ingles: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en espanol producira resultados degradados.
- Contexto no confirmado: la documentacion solo muestra ejemplos con 2048 tokens; no se conoce la ventana nativa ni el comportamiento en contextos largos.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el contenido generado y su adecuacion legal son responsabilidad del usuario; la licencia no exime de cumplir la legislacion aplicable sobre contenido explicito.
- Sin traccion ni validacion: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de calidad ni de mantenimiento.
- Model card minima: el repositorio no documenta arquitectura, entrenamiento ni evaluaciones; toda la informacion tecnica del modelo base debe consultarse en su ficha original.
- Riesgo de uso indebido: la combinacion de contenido explicito y ausencia de alineamiento exige controles de acceso y moderacion si se despliega en cualquier servicio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Medvedko/Forgotten-Safeword-12B-v4.0-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Forgotten-Safeword-12B-v4.0
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
