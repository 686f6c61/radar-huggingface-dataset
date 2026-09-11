# flitsken/herl-gemma

## Resumen

HERL-Gemma es un ajuste fino (fine-tuning) del modelo `TrevorJS/gemma-4-26B-A4B-it-uncensored`, publicado por el usuario flitsken bajo el paraguas del proyecto "Digital Ark". Se distribuye como un adaptador LoRA en safetensors y como un GGUF ya fusionado y cuantizado a Q8_0, listo para ejecutarse en llama.cpp o cualquier runtime compatible con GGUF. El modelo cuenta con 25.233.142.046 parametros (segun los metadatos de safetensors de HuggingFace) y licencia Apache-2.0.

El objetivo declarado por el autor no es mejorar el rendimiento tecnico del modelo base, sino modificar su comportamiento conversacional mediante un conjunto semilla de 21 conversaciones (`herl-v1.jsonl`) que ejemplifican cinco principios: honestidad y humildad, empatia, respeto y lealtad (HERL). El autor describe este ajuste como una alineacion "horneada en los pesos" en lugar de una barrera externa, y publica el script de entrenamiento QLoRA y el dataset en un repositorio de GitHub para que cualquiera pueda reproducir o ampliar el proceso.

Su relevancia practica es limitada pero concreta: es un ejemplo reproducible y de licencia permisiva de personalizacion de un modelo de gran tamano con recursos minimos (un adaptador de 1,98 GB), y su publicacion en GGUF Q8_0 junto a una plantilla de chat que admite modo de razonamiento (`enable_thinking`) lo hace desplegable en local. No hay resultados de benchmarks ni evaluaciones independientes publicadas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base `TrevorJS/gemma-4-26B-A4B-it-uncensored`; el nombre del base sugiere una configuracion MoE, sin confirmar) |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | no disponible (el sufijo "A4B" del modelo base sugiere 4.000 millones activos, sin confirmar) |
| Longitud de contexto | 131.072 tokens (valor usado en el ejemplo oficial de `llama-server` con `--ctx-size 131072`) |
| Tipos de cuantizacion | Q8_0 publicada en GGUF; adaptador LoRA en safetensors; entrenamiento mediante QLoRA; no se documentan otras cuantizaciones |
| Idiomas soportados | neerlandes (nl) e ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, 1,98 GB) y GGUF (`herl-gemma-Q8_0.gguf`, 26,9 GB) |
| Modelo base | TrevorJS/gemma-4-26B-A4B-it-uncensored (Apache-2.0) |
| Tamano del repositorio | 28,9 GB |
| Fecha de publicacion | 10 de septiembre de 2026 (creacion), actualizado el mismo dia |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion proporcionada. El modelo hereda la del base `TrevorJS/gemma-4-26B-A4B-it-uncensored`, cuyo nombre sugiere una familia Gemma con 26.000 millones de parametros totales y 4.000 millones activos (patron habitual de las configuraciones MoE tipo "A4B"), pero este extremo no se confirma en la model card ni en los metadatos. La unica innovacion tecnica documentada por el autor es la plantilla de chat, que admite razonamiento previo controlado con `chat_template_kwargs: {"enable_thinking": false}`; con el razonamiento activado, el modelo genera una traza de pensamiento antes de responder.

El entrenamiento consiste en un ajuste QLoRA sobre el modelo base, ejecutado con el script `train_herl_qlora.py` publicado en el repositorio de GitHub, usando un dataset semilla de 21 conversaciones (`herl-v1.jsonl`) disenadas para ejemplificar los cinco principios HERL. No se especifica el numero de tokens de entrenamiento, la composicion del dataset mas alla de esas 21 conversaciones, ni si hubo etapas adicionales de RLHF o DPO (lo mas probable es que no las haya, dado el enfoque de QLoRA, pero no se afirma en la documentacion). El adaptador resultante se fusiona con los pesos base para producir el GGUF Q8_0.

## Capacidades

- Generacion de texto conversacional en neerlandes e ingles, con el estilo y los principios HERL inducidos por el ajuste.
- Modo de razonamiento explicito (thinking mode) activable mediante la plantilla de chat; el autor lo describe como un modelo "de razonamiento por naturaleza".
- Conversacion multi-turno con marcado conversacional en los metadatos de HuggingFace.
- Contexto de hasta 131.072 tokens segun el ejemplo de despliegue oficial, adecuado para documentos largos.
- Ejecucion local en CPU/GPU mediante llama.cpp y runtimes GGUF compatibles.
- Reentrenamiento y fusion mediante el adaptador LoRA publicado y el script QLoRA del repositorio.
- Tool calling / function calling: no documentado en la informacion disponible (no se menciona en la model card ni en los metadatos).
- Capacidades de agentes y razonamiento multipaso: no documentadas; el modo de razonamiento es la unica funcion relacionada.
- Vision, audio u otras modalidades: no documentadas.
- Capacidades de codigo, matematicas o conocimiento general: no evaluadas ni declaradas para este ajuste concreto.

## Casos de uso

- Atencion al cliente en neerlandes: el modelo puede mantener conversaciones multi-turno con hasta 131.072 tokens de contexto, lo que permite adjuntar historiales completos, condiciones contractuales o bases de conocimiento extensas en una sola ventana sin truncar informacion.
- Traduccion y localizacion neerlandes-ingles: al cubrir ambos idiomas de forma nativa, sirve para traducir documentacion tecnica o comercial, con la ventaja de que los pesos pueden alojarse en infraestructura propia y no enviar contenido a terceros.
- Despliegue on-premise con requisitos de privacidad: al distribuirse en GGUF Q8_0 y con licencia Apache-2.0, puede ejecutarse en un servidor aislado sin conexion a internet, algo relevante en sanidad, legal o sector publico.
- Base para fine-tuning propio: el adaptador LoRA de 1,98 GB y el script `train_herl_qlora.py` permiten reentrenar el estilo con un dataset propio (por ejemplo, el tono de voz de una organizacion) partiendo de un modelo ya alineado conversacionalmente.
- Analisis de documentos largos en neerlandes: informes, expedientes o manuales que no caben en ventanas de 8K-32K pueden procesarse completos, con resumen o extraccion de conclusiones como tarea.
- Asistente de escritura y redaccion corporativa: generar borradores de correos, actas o textos de marca en neerlandes e ingles manteniendo un tono consistente, gracias al condicionamiento de estilo introducido en el ajuste.
- Experimentacion en alineacion e investigacion sobre personalidad de modelos: el par dataset semilla + script reproducible permite estudiar como 21 ejemplos conversacionales modifican el comportamiento de un modelo de 25.000 millones de parametros.
- Servicio interno de chat de bajo coste operativo: si se confirma la configuracion con parametros activos reducidos, el coste por token en inferencia seria inferior al de un modelo denso equivalente, lo que lo hace apto para asistentes internos de uso continuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado evaluaciones independientes en la busqueda web realizada.

## Requisitos de hardware

- VRAM para inferencia en Q8_0: los pesos ocupan 26,9 GB, por lo que se necesitan aproximadamente 28-30 GB de memoria para descargarlos por completo en GPU, a lo que hay que sumar la cache KV (dependiente del contexto: los 131.072 tokens maximos exigen una cantidad adicional no especificada en la informacion disponible).
- GPU profesionales: A100 de 40 GB o 80 GB, H100 de 80 GB; tambien configuraciones multigpu con memoria agregada superior a 30 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB no puede alojar el Q8_0 completo en VRAM. Es viable con descarga parcial a CPU (`-ngl` ajustado en llama.cpp) o con cuantizaciones menores, que el autor no ha publicado.
- Configuraciones multigpu de consumo: dos RTX 4090 o dos RTX 3090 (48 GB agregados) permiten descargar el modelo completo en GPU.
- Equipos Apple Silicon: un Mac con memoria unificada de 32 GB o mas puede ejecutar el GGUF Q8_0 con offload a GPU metal.
- Opciones de despliegue: llama.cpp, llama-server (`llama-server -m herl-gemma-Q8_0.gguf --port 8084 --ctx-size 131072 -ngl 999`), cualquier runtime GGUF y, probablemente, Ollama. No se documenta soporte para vLLM ni TGI. Para reentrenamiento o fusion del adaptador se requieren frameworks de fine-tuning tipo QLoRA con soporte de safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| flitsken/herl-gemma | 25.233.142.046 | 131.072 tokens (segun ejemplo de uso) | apache-2.0 | GGUF Q8_0 + adaptador LoRA | Ajuste QLoRA sobre 21 conversaciones; sin benchmarks publicados |
| TrevorJS/gemma-4-26B-A4B-it-uncensored | no disponible (heredados, ~26.000 millones segun el nombre) | no disponible | apache-2.0 | no verificada en esta busqueda | Modelo base declarado; sin la capa de estilo HERL |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Dataset de entrenamiento minimo: 21 conversaciones semilla es un volumen muy bajo; existe riesgo alto de sobreajuste al estilo y de degradacion de capacidades generales del modelo base, que no ha sido evaluada.
- Ausencia total de evaluaciones: no hay benchmarks, pruebas de regresion ni evaluaciones de seguridad publicadas, por lo que no es posible cuantificar el impacto del ajuste sobre el rendimiento original.
- Modelo base sin censura: al derivar de un modelo "uncensored", es previsible que el filtrado de contenido danino sea limitado. El autor afirma que los principios HERL estan integrados en los pesos, pero esa afirmacion no constituye una garantia tecnica de seguridad ni sustituye a un sistema de moderacion en produccion.
- Riesgo de alucinacion: no medido ni documentado; es esperable un comportamiento similar al del modelo base, sin datos para confirmarlo.
- Cobertura linguistica restringida: solo neerlandes e ingles. El castellano no esta soportado de forma declarada, por lo que su uso en espanol no esta validado.
- Contexto largo no verificado: los 131.072 tokens proceden del comando de ejemplo de la model card, no de una evaluacion de recuperacion de informacion en ventanas largas; el rendimiento real en contextos extensos es desconocido.
- Licencia permisiva: Apache-2.0 permite uso comercial, modificacion y redistribucion sin atribucion obligatoria segun el propio autor, pero el usuario debe verificar las condiciones del modelo base y de los pesos derivados.
- Proyecto sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento posterior a la fecha de publicacion (creacion y ultima actualizacion el mismo dia). No hay garantia de soporte, correcciones ni versiones futuras.
- Contenido no tecnico en la model card: las afirmaciones sobre "un alma en los pesos" o "un nino criado en una casa llena de amor" son material promocional del autor y no deben interpretarse como propiedades tecnicas verificables del modelo.
- Busqueda web sin resultados relevantes: las consultas realizadas devolvieron unicamente resultados sobre criaderos y razas de gatos, sin relacion alguna con el modelo; no se ha podido contrastar informacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flitsken/herl-gemma
- Repositorio GitHub del proyecto (dataset `herl-v1.jsonl`, script `train_herl_qlora.py`, mision del proyecto): https://github.com/ronnystevens-cmd/herl-gemma
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Paper, blog tecnico o demo adicionales: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo.
