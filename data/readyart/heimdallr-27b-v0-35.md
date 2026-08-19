# ReadyArt/Heimdallr-27B-v0.35

## Resumen

Heimdallr-27B-v0.35 es un modelo de lenguaje de 27.781 millones de parámetros desarrollado por ReadyArt, basado en el modelo Qwen/Qwen3.8-27B. Se trata de un fine-tuning orientado a roleplay, conversación instructiva y contenido narrativo, con un enfoque explícito en escenarios no alineados, incluido contenido adulto y NSFW. El modelo se distribuye bajo licencia Apache-2.0, aunque su acceso en Hugging Face es restringido (gated), lo que implica aceptar condiciones adicionales antes de su descarga.

El modelo se presenta como una alternativa sin restricciones de seguridad para usuarios que buscan interacciones conversacionales o narrativas sin filtros temáticos. Su tamaño de 27B parámetros lo sitúa en la gama media-alta de modelos de lenguaje locales, con un peso de repositorio de 55.6 GB en formato safetensors. A pesar de su reciente publicación (agosto de 2026), aún no acumula descargas ni valoraciones en la plataforma.

Dado que la información pública disponible es limitada, esta ficha se basa exclusivamente en los metadatos del repositorio y no incluye datos técnicos adicionales que no hayan sido publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-27B, no disponible detalle adicional) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura exacta no esta documentada en la informacion disponible. El modelo se basa en Qwen/Qwen3.8-27B, un transformer de 27B parametros, pero no se han publicado detalles sobre la estructura interna (numero de capas, dimensiones de atencion, tipo de atencion, etc.). El autor indica que es un fine-tune, pero no se especifica el metodo de entrenamiento (supervisado, RLHF, DPO, etc.) ni el dataset utilizado. Los tags sugieren un entrenamiento orientado a roleplay, conversacion instructiva y contenido no alineado, con temas como hrimsline (posiblemente una linea de prompts o personajes) y dark-fantasy.

## Capacidades
- Generacion de texto conversacional y narrativo, con enfasis en roleplay y escenarios interactivos.
- Soporte de instrucciones (instruct) para tareas de dialogo y escritura creativa.
- Capacidad para manejar contenido explicito y adulto, incluyendo roleplay erotico (ERP) y tematicas oscuras.
- No se ha confirmado soporte para tool calling, agentes, vision, audio, ni otras capacidades especiales.
- Capacidades multilingues no documentadas.

## Casos de uso
- Roleplay conversacional: el modelo puede mantener personajes y tramas complejas en escenarios de fantasia oscura o ciencia ficcion, gracias a su ajuste especifico para interacciones de largo aliento.
- Escritura narrativa creativa: adecuado para generar relatos con contenido maduro o explicito, donde el usuario controla la direccion de la historia.
- Simulacion de personajes para juegos de rol: permite crear NPCs o companeros de aventura con personalidades definidas y reacciones coherentes.
- Prototipado de chatbots sin restricciones: util para desarrolladores que prueban sistemas de conversacion sin filtros de seguridad, aunque con riesgo de contenido inapropiado.
- Creacion de contenido literario adulto: para autores que necesitan un asistente que no rechace escenas explicitas.
- Experimentacion con modelos desalineados: para investigadores que estudian el comportamiento de LLMs sin alineacion de seguridad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. El modelo no ha sido evaluado en la comunidad, segun los datos de Hugging Face (0 descargas, 0 likes).

## Requisitos de hardware
- VRAM estimada: para inferencia con precision FP16, se necesitan aproximadamente 55.6 GB de VRAM (peso del modelo). Con cuantizacion de 8 bits, se reduciria a ~28 GB, y con 4 bits a ~14 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 80GB, H100 80GB, o multiples RTX 4090 (24GB cada una) para FP16. Con cuantizacion, podria caber en una sola RTX 4090 o RTX 3090 (24GB) con 4 bits.
- No se ha confirmado si el modelo funciona en consumer GPU sin cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI son compatibles con modelos safetensors de Qwen, pero no hay guia oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. No se han encontrado comparativas publicas con modelos similares de la misma categoria (roleplay, 27B, sin alinear). El modelo es reciente y no tiene evaluaciones independientes.

## Limitaciones y advertencias
- Contenido explicito: el modelo esta disenado para generar contenido NSFW y adulto, lo que puede ser inapropiado para menores o entornos profesionales.
- Riesgo de alucinacion: sin datos de evaluacion, no se puede cuantificar el nivel de alucinacion, pero los modelos de roleplay suelen priorizar la coherencia narrativa sobre la veracidad.
- Sesgos desconocidos: no se ha realizado una auditoria de sesgos; el contenido puede reflejar estereotipos presentes en los datos de entrenamiento.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos corporativos.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado puede violar politicas de plataformas o leyes locales.
- Sin documentacion tecnica: falta informacion sobre el dataset, el metodo de entrenamiento y las capacidades exactas, lo que dificulta su evaluacion para produccion.

## Enlaces
- [HuggingFace - ReadyArt/Heimdallr-27B-v0.35](https://huggingface.co/ReadyArt/Heimdallr-27B-v0.35)
- [Perfil de ReadyArt en Hugging Face](https://huggingface.co/ReadyArt)
- [Unrestricted AI - Leaderboard de modelos sin censura](https://unrestricted.ai/)
- [ReadyArt/Heimdallr-v0.02-31B-LORA](https://huggingface.co/ReadyArt/Heimdallr-v0.02-31B-LORA)
- [CivArchive - Archivo de modelos AI](https://civitaiarchive.com/)

Nota: el modelo base Qwen/Qwen3.8-27B no se encuentra en el repositorio de Qwen en HuggingFace (no existe una version "Qwen3.8-27B" publica conocida, sino Qwen2.5-27B o Qwen3-30B-A3B). Esto sugiere que el nombre del modelo base podria ser un error de etiquetado o una version interna. Se recomienda verificar la compatibilidad con Qwen2.5-27B o Qwen3-30B-A3B antes de usar.## Resumen
Heimdallr-27B-v0.35 es un modelo de lenguaje de 27.781 millones de parametros desarrollado por ReadyArt, basado en un fine-tune del modelo Qwen/Qwen3.8-27B. Esta orientado a roleplay, conversacion instructiva y escritura narrativa, con un enfoque explicito en contenido no alineado, incluyendo tematicas adultas, NSFW y dark-fantasy. Se distribuye bajo licencia Apache-2.0, aunque su acceso en Hugging Face es restringido y requiere aceptar condiciones previas.

El modelo se presenta como una alternativa sin filtros tematicos para desarrolladores e investigadores que trabajan con interacciones conversacionales no censuradas. Su tamano de 27.8B parametros lo situa en la gama alta de modelos abiertos, con un repositorio de 55.6 GB en formato safetensors. A fecha de publicacion (agosto de 2026) no registra descargas ni valoraciones en la plataforma.

La informacion tecnica disponible es limitada: no se han publicado detalles sobre el dataset de entrenamiento, el metodo de ajuste, ni evaluaciones de rendimiento. Esta ficha se basa exclusivamente en los metadatos del repositorio y en la ausencia de documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-27B, sin detalle de capas o atencion) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no esta documentada en la informacion publica. El modelo parte de Qwen/Qwen3.8-27B, un transformer de 27B parametros, aunque no se ha publicado informacion sobre el numero de capas, el tipo de atencion o el tamaño de la ventana de contexto. El fine-tune se enfoca en roleplay y conversacion instructiva, pero no se indica el metodo de entrenamiento (supervisado, RLHF, DPO, etc.) ni la composicion del dataset.

Los tags del repositorio sugieren un entrenamiento orientado a contenido narrativo no alineado, con temas como "hrimsline" (posiblemente un sistema de prompts o personajes) y "dark-fantasy". No se ha publicado ninguna innovacion tecnica destacable, como decodificacion especulativa o atencion lineal, en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y narrativo con enfasis en roleplay interactivo.
- Soporte de formato instructivo para respuestas estructuradas en dialogos.
- Capacidad para manejar contenido explicito, adulto y tematicas oscuras sin filtros de moderacion.
- No se confirma soporte de tool calling, agentes, vision, audio ni otras capacidades especiales.
- Capacidades multilingues no documentadas.

## Casos de uso

- Roleplay conversacional: el modelo puede mantener personajes y tramas complejas en escenarios de fantasia oscura o ciencia ficcion, gracias a su ajuste especifico para interacciones de largo aliento.
- Escritura narrativa creativa: permite generar contenido literario con escenas explicitas o violentas, donde el usuario controla la direccion de la historia.
- Simulacion de personajes para juegos de rol: puede actuar como un personaje no jugable (NPC) con personalidad coherente y reacciones contextuales en juegos de texto.
- Prototipado de chatbots sin moderacion: util para desarrolladores que necesitan probar sistemas de conversacion sin filtros de tema, aunque con riesgo de contenido inapropiado.
- Creacion de contenido para publicaciones adultas: para autores que requieren asistencia en la generacion de escenas eroticas o de horror sin restricciones.
- Investigacion sobre desalineamiento: para academicos que estudian el comportamiento de modelos de lenguaje sin alineamiento de seguridad, en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. El modelo no ha sido evaluado en el leaderboard de Unrestricted AI ni en otras plataformas publicas segun los datos de HuggingFace.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16 se necesitan aproximadamente 55.6 GB de VRAM (tamano del repositorio). Con cuantizacion de 4 bits, se estima que podria ocupar entre 14 y 16 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 80GB, H100 80GB, o dos RTX 4090 en paralelo para FP16. Para cuantizacion de 4 bits, una RTX 4090 o RTX 3090 de 24 GB podria ser suficiente.
- No se confirma si el modelo cabe en GPUs de consumo sin cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con modelos safetensors de Qwen, pero no hay guia oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos comparativos disponibles. No se han encontrado modelos de la misma categoria (roleplay no alineado, 27B parametros) con evaluaciones publicas. El modelo es reciente y no tiene comparaciones en benchmarks independientes. Se recomienda evaluar en el leaderboard de Unrestricted AI para obtener metricas relativas.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta disenado para generar contenido NSFW y adulto, lo que puede ser inapropiado para menores o en entornos profesionales.
- Riesgo de alucinacion: sin datos de evaluacion, no se puede cuantificar la tendencia a generar informacion falsa, pero los modelos de roleplay suelen priorizar la coherencia narrativa sobre la veracidad.
- Sesgos desconocidos: no se ha realizado una auditoria de sesgos; el contenido puede reflejar estereotipos de los datos de entrenamiento.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos corporativos.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado puede violar politicas de plataformas o leyes locales.
- No se ha publicado documentacion tecnica sobre el dataset o el metodo de entrenamiento, lo que dificulta su evaluacion en entornos de produccion.

## Enlaces

- [HuggingFace - ReadyArt/Heimdallr-27B-v0.35](https://huggingface.co/ReadyArt/Heimdallr-27B-v0.35)
- [Perfil de ReadyArt en HuggingFace](https://huggingface.co/ReadyArt)
- [Unrestricted AI - Leaderboard de modelos sin censura](https://unrestricted.ai/)
- [ReadyArt/Heimdallr-v0.02-31B-LORA](https://huggingface.co/ReadyArt/Heimdallr-v0.02-31B-LORA)
- [CivArchive - Archivo de modelos de IA](https://civitalarchive.com/)

Nota: el modelo base Qwen/Qwen3.8-27B no existe en el repositorio oficial de Qwen en HuggingFace (las versiones conocidas son Qwen2.5-27B o Qwen3-30B-A3B). Esto podria indicar un error de etiquetado o una version futura no publicada. Se recomienda verificar la compatibilidad con Qwen2.5-27B o Qwen3-30B-A3B antes de su uso.
