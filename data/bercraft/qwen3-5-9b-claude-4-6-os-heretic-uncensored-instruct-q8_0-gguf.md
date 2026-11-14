# Bercraft/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT-Q8_0-GGUF

## Resumen

Bercraft/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT-Q8_0-GGUF es una cuantizacion en formato GGUF (tipo Q8_0) del modelo Bercraft/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT, un ajuste fino de la familia Qwen3.5 de 9B parametros orientado a escritura creativa, narrativa de ficcion y roleplaying. El autor, Bercraft, lo publica bajo licencia Apache 2.0 y lo distribuye con la etiqueta "uncensored" y "abliterated", lo que indica que se ha aplicado una tecnica de ablacion de la direccion de rechazo para reducir las negativas del modelo ante contenido sensible.

El modelo parte de una base de aproximadamente 8.950 millones de parametros y conserva la arquitectura transformer densa de la familia Qwen3.5. El pipeline declarado es image-text-to-text, lo que sugiere capacidad multimodal de entrada (imagen y texto), aunque la model card no detalla la configuracion del encoder visual ni el numero de tokens de contexto, por lo que esos datos se marcan como no disponibles.

La relevancia de esta ficha radica en que se trata de una cuantizacion Q8_0 lista para desplegar con llama.cpp y Ollama, pensada para entornos locales donde se quiere maxima fidelidad numerica respecto al modelo original en bfloat16 sin renunciar a la portabilidad del formato GGUF. El interes practico esta en la combinacion de escritura creativa sin filtros y un pipeline declarado multimodal, aunque la documentacion tecnica publicada es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5); pipeline declarado image-text-to-text |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); el modelo base se publica en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0); el modelo base en safetensors/bfloat16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la pertenencia a la familia Qwen3.5 y del pipeline declarado image-text-to-text. No se especifican el numero de capas, dimensiones ocultas, mecanismo de atencion ni la configuracion del modulo multimodal. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

El modelo base incorpora las etiquetas "heretic", "uncensored" y "abliterated", que en la practica indican un ajuste fino orientado a escritura creativa seguido de una ablacion de la direccion de rechazo para eliminar las respuestas de negativa. Esta cuantizacion concreta se ha generado con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, partiendo del checkpoint en bfloat16 del autor.

## Capacidades

- Generacion de texto narrativo y creativo: ficcion, ciencia ficcion, romance y generos variados.
- Generacion y continuacion de tramas y subtramas, con etiquetas especificas para plot generation y scene continue.
- Escritura vivida y prosa descriptiva (vivid prosing, vivid writing).
- Roleplaying y conversacion multi-turno con personajes.
- Entrada multimodal declarada (image-text-to-text), segun el pipeline_tag del repositorio.
- Capacidad multilingue limitada a ingles y chino segun la model card.
- Comportamiento sin filtros de rechazo (abliterated/uncensored), orientado a contenido que los modelos alineados convencionales rechazarian.
- No se documenta soporte explicito de tool calling ni de razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Escritura de ficcion por capitulos: el modelo puede generar y continuar escenas manteniendo coherencia de personajes y trama, gracias a su ajuste especifico en narrativa y sus etiquetas de scene continue.
- Generacion de tramas y subtramas para guionistas y novelistas: se le puede pedir que proponga arcos argumentales alternativos o desarrolle subtramas secundarias a partir de una premisa, aprovechando el ajuste en plot y sub-plot generation.
- Roleplaying y chatbots de personaje: su entrenamiento en roleplaying y su naturaleza abliterated lo hacen adecuado para bots de personaje con tematicas adultas o sensibles donde otros modelos rechazan la conversacion.
- Prototipado local de asistentes creativos: al estar en GGUF Q8_0, se puede desplegar con llama.cpp u Ollama en estaciones de trabajo sin GPU de datacenter, lo que facilita iterar sobre prompts y personajes en local.
- Generacion de descripciones visuales a partir de imagenes: el pipeline image-text-to-text permitiria, si la implementacion lo soporta, producir descripciones narrativas de imagenes para herramientas de escritura asistida.
- Traduccion creativa y adaptacion entre ingles y chino: dentro de los dos idiomas declarados, puede usarse para adaptar ficcion o dialogos manteniendo el tono narrativo.
- Generacion de material para juegos de rol de mesa: descripciones de escenarios, dialogos de PNJ y ramificaciones de historia a partir de una semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: en torno a 9,5-10 GB solo para los pesos (el repositorio ocupa 9,5 GB), mas overhead de contexto KV; en la practica se recomienda reservar 11-13 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB), A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 12-16 GB o mas (RTX 4070 Ti Super, RTX 4080, RTX 4090); en tarjetas de 8-10 GB habria que recurrir a cuantizaciones menores no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y cualquier runtime compatible con GGUF; el modelo base en bfloat16 requeriria transformers con aceleracion GPU.
- Latencia y throughput: no disponibles; dependen del hardware y del contexto configurado (el ejemplo de la model card usa -c 2048).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bercraft/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT-Q8_0-GGUF | ~8,95B | no disponible | Apache 2.0 | GGUF Q8_0 | Ajuste creativo sin filtros, multimodal declarado |
| Modelo base Bercraft/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT | ~8,95B | no disponible | Apache 2.0 | safetensors bfloat16 | Mismo ajuste, mayor precision numerica |
| Qwen3.5 9B (familia original) | ~9B | no disponible | no disponible | safetensors, GGUF | Base alineada, sin ablacion; referencia de calidad general |
| Alternativas de escritura creativa de ~8-9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Al ser un modelo abliterated/uncensored, no aplica las salvaguardas habituales de alineacion; puede generar contenido sensible, ofensivo o inapropiado sin filtros, lo que exige supervision humana en produccion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas y detalles; no debe usarse como fuente factual sin verificacion.
- Cobertura idiomatica limitada a ingles y chino segun la model card; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- No se documentan la longitud de contexto ni la configuracion multimodal; conviene validar empiricamente el comportamiento con imagenes antes de depender de esa capacidad.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado sin filtros recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la documentacion tecnica es minima; se recomienda auditar el modelo antes de usarlo en entornos productivos.
- La cuantizacion Q8_0 introduce una perdida de precision pequena pero no nula respecto al bfloat16 original.

## Enlaces

- Repositorio Hugging Face (GGUF Q8_0): https://huggingface.co/Bercraft/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT-Q8_0-GGUF
- Modelo base: https://huggingface.co/Bercraft/Qwen3.5-9B-Claude-4.6-OS-HERETIC-UNCENSORED-INSTRUCT
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
