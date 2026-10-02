# kaivoss/AliceAI-T5-35B-A0.6B-chat-v6.3

## Resumen

AliceAI-T5-35B-A0.6B-chat-v6.3 es un modelo de generación de texto publicado por el usuario kaivoss en HuggingFace. Se trata del resultado de fusionar (merge) el adaptador LoRA `kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.3` sobre el modelo base `yandex/AliceAI-T5-35B-A0.6B` en precisión bf16. Por tanto, no es un entrenamiento desde cero, sino una especialización conversacional y de uso de herramientas sobre un modelo preentrenado ajeno.

El modelo base es un encoder-decoder de tipo T5 con mezcla de expertos (MoE), preentrenado con el objetivo UL2, según los tags de la model card. El nombre indica 35B de parámetros totales y aproximadamente 0,6B activos por token, un perfil de cómputo muy bajo en relación con su tamaño almacenado. El recuento real de safetensors es de 34.354.449.408 parámetros (34,35B), con un repositorio de 68,7 GB, coherente con pesos en bf16.

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y la model card remite a otro repositorio para la receta de entrenamiento, la plantilla de chat y la evaluación. Además, existe una discrepancia entre el título de la model card ("chat-v2") y el nombre real del repositorio ("chat-v6.3"). Se trata, por tanto, de una publicación experimental de la que no se dispone de documentación propia suficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo T5 con mezcla de expertos (MoE) y objetivo de preentrenamiento UL2; implementación con codigo personalizado (`aliceai_t5_moe`, requiere `trust_remote_code`) |
| Parametros totales | 34.354.449.408 (34,35 B), segun los safetensors del repositorio |
| Parametros activos | Aproximadamente 0,6 B, inferido del sufijo "A0.6B" del nombre; no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en bf16. No se ha confirmado la existencia de versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), con codigo personalizado asociado a la arquitectura MoE |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder de la familia T5, modificado con capas de mezcla de expertos. Los tags del repositorio indican explícitamente `encoder-decoder`, `mixture-of-experts`, `ul2` y `text2text-generation`, con la etiqueta de arquitectura `aliceai_t5_moe`. El preentrenamiento del modelo base corresponde a Yandex, y el objetivo UL2 (unified language learning) combina varios modos de denoising sobre texto, lo que encaja con una arquitectura encoder-decoder orientada a tareas de transformación secuencia-a-secuencia más que a la generación autoregresiva pura de un decoder-only.

Sobre esa base, kaivoss ha aplicado un ajuste fino mediante LoRA, publicado por separado como `kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.3`, y ha fusionado el adaptador con el modelo base en bf16 para producir este repositorio. La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO; toda esa información se delega al repositorio del adaptador LoRA. Tampoco se especifica la innovación técnica concreta del enrutado de expertos ni la proporción de expertos activados por token, más allá del indicio del nombre (0,6B activos frente a 35B totales).

## Capacidades

- Generación de texto secuencia a secuencia: el pipeline declarado es `text2text-generation`, con arquitectura encoder-decoder, por lo que el caso natural es transformar una entrada en una salida (diálogo, resumen, reescritura).
- Conversación multturno: el nombre del repositorio incluye el sufijo "chat", lo que indica un ajuste orientado a diálogo, aunque la plantilla de chat concreta no se documenta en esta model card.
- Uso de herramientas: el tag `tool-use` aparece explícitamente, lo que sugiere soporte de llamadas a funciones o herramientas, presumiblemente introducido durante el ajuste LoRA.
- Codificación y decodificación con objetivos tipo span corruption, herencia del preentrenamiento UL2 del modelo base.
- Capacidad multilingüe: no disponible; la model card no declara idiomas y no se puede confirmar la cobertura.
- Razonamiento multi-paso y comportamiento de agente: no disponible; no hay documentación que lo confirme.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible; la model card no menciona ninguna modalidad adicional al texto.

## Casos de uso

- Diálogo conversacional con contexto largo: al ser un encoder-decoder con preentrenamiento UL2, es adecuado para tareas donde la entrada completa está disponible antes de generar la respuesta. No obstante, la longitud de contexto no está documentada, por lo que cualquier despliegue debería validarla empíricamente antes de asumir ventanas amplias.
- Transformación y normalización de datos textuales: extracción de campos estructurados desde texto libre, reescritura de documentos o conversión de formatos, aprovechando el pipeline text2text y la naturaleza encoder-decoder del modelo.
- Integración en pipelines con llamada a herramientas: el tag `tool-use` indica que el ajuste LoRA se orientó a que el modelo emita llamadas a funciones. Se puede usar como enrutador o planificador que decide qué herramienta invocar y con qué argumentos, siempre que se valide el formato exacto de salida esperado.
- Resumen y condensación de documentación técnica: tarea clásica de los modelos encoder-decoder, apropiada para generar versiones cortas de informes, actas o artículos manteniendo la fidelidad del original.
- Prototipado de investigación sobre MoE de bajo cómputo activo: con 34,35B de parámetros almacenados pero un perfil de activación muy reducido según el nombre, resulta útil para estudiar el comportamiento de arquitecturas MoE con enrutado disperso en tareas de generación condicionada.
- Generación asistida en dominios con jerga específica: al permitir ajuste fino mediante LoRA sobre la misma receta publicada, se puede adaptar a vocabulario sectorial (legal, médico, industrial) sin reentrenar los 34,35B completos.
- Sustitución de T5 clásico en sistemas existentes: cualquier arquitectura que ya consuma modelos T5 mediante `transformers` puede, en principio, intercambiar el checkpoint, siempre que se instale el código personalizado `aliceai_t5_moe` y se asuma el coste de memoria de un modelo de 68,7 GB en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente remite al repositorio del adaptador LoRA (`kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.3`) para consultar la evaluación, de modo que no hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba verificables en la documentación proporcionada. No se deben inferir cifras del nombre del modelo ni de su tamaño.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 68,7 GB, por lo que se necesita un acelerador con al menos 80 GB de memoria para cargarlos sin cuantizar, más el margen para activaciones y caché.
- VRAM con cuantización: no disponible; no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ, FP8) de este repositorio. Cualquier cuantización tendría que generarla el propio usuario y requeriría soporte del código personalizado de la arquitectura MoE.
- GPU recomendadas: A100 80 GB, H100 80 GB o MI300X para ejecución en una sola tarjeta en bf16. Alternativamente, configuraciones multi-GPU como 2x A6000 48 GB con reparto de tensores.
- GPU de consumo: no cabe en tarjetas consumer actuales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) sin cuantización agresiva y offload a CPU/RAM, lo que degradaría notablemente el throughput. El repositorio de 68,7 GB tampoco cabe en el almacenamiento típico de un portátil sin planificación previa.
- Opciones de despliegue: al ser una arquitectura con código personalizado (`custom_code` en los tags) y encoder-decoder MoE, el soporte en vLLM, TGI, llama.cpp u Ollama no está garantizado ni documentado. La vía más segura es `transformers` con `trust_remote_code=True`, y verificar antes si el backend elegido reconoce el tipo de modelo `aliceai_t5_moe`.
- Latencia y throughput: no disponibles. El hecho de que solo se activen aproximadamente 0,6B parámetros por token según el nombre debería reducir el coste de cómputo respecto a un modelo denso de 34B, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa rigurosa. La única comparación directa posible es con el propio modelo base:

| Modelo | Parametros totales | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaivoss/AliceAI-T5-35B-A0.6B-chat-v6.3 | 34,35 B | Encoder-decoder MoE (T5/UL2) | no disponible | no disponible | HuggingFace, 0 descargas |
| yandex/AliceAI-T5-35B-A0.6B | no disponible en la informacion facilitada | Encoder-decoder MoE (T5/UL2) | no disponible | no disponible | HuggingFace (modelo base) |
| kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.3 | no disponible (adaptador LoRA) | Adaptador LoRA sobre el modelo base | no disponible | no disponible | HuggingFace |

No se identifican en la información proporcionada alternativas de terceros con las que comparar parámetros, contexto o rendimiento. Cualquier comparación con modelos MoE de tamaño similar debería hacerse con datos verificados de cada repositorio, no con estimaciones.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin licencia explícita no se puede asumir permiso de uso comercial, redistribución ni modificación. Es un bloqueo potencial para cualquier despliegue en producción.
- Documentación mínima: la model card es de dos líneas útiles y delega la información relevante a otro repositorio. No hay receta de entrenamiento, composición de datos, ni evaluación en este repositorio.
- Discrepancia de versiones: el título de la model card menciona "chat-v2" mientras que el repositorio se llama "v6.3". Conviene tratar la model card con cautela y verificar la versión real de los pesos.
- Riesgo de alucinación: no cuantificado ni evaluado en la información disponible. La ausencia de benchmarks impide estimar su fiabilidad factual.
- Idiomas: no declarados. No se puede asumir buen rendimiento en castellano, y tratándose de un modelo base de Yandex, es plausible (aunque no confirmado) que su entrenamiento esté sesgado hacia ruso e inglés.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgos ni de toxicidad.
- Código personalizado: el tag `custom_code` implica ejecutar código del autor al cargar el modelo con `transformers`. Esto conlleva un riesgo de seguridad y de compatibilidad entre versiones de la librería.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta. No hay comunidad, issues ni reportes de terceros que permitan validar su comportamiento.
- Contexto desconocido: al no documentarse la longitud de contexto, cualquier diseño de aplicación que dependa de ventanas largas debe validarse empíricamente.
- Coste de memoria desproporcionado: 68,7 GB de pesos para un modelo con un perfil de activación muy bajo según su nombre; si el enrutado MoE no está bien optimizado en el backend elegido, se puede acabar pagando el coste de cómputo de un modelo denso de 34B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-v6.3
- Adaptador LoRA referenciado en la model card (receta, plantilla de chat y evaluación): https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.3
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B

No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
