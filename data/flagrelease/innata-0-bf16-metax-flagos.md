# FlagRelease/Innata-0-BF16-metax-FlagOS

## Resumen

Innata-0 es un sistema de modelo nativo para IA encarnada (embodied AI) desarrollado por BAAI (Beijing Academy of Artificial Intelligence). Se distribuye a través de FlagRelease como un paquete de adaptación cross-chip bajo la pila de software FlagOS, con soporte Day0 para seis plataformas de aceleración: NVIDIA, MetaX, Hygon, Ascend, Moore Threads y T-Head. El repositorio publicado corresponde a la variante BF16 adaptada a MetaX (chip C550), con un tamano de 113,8 GB.

El sistema se articula en torno a dos componentes. Innata-0-WAM emplea una arquitectura Mixture-of-Transformers de tres torres que modela conjuntamente la comprensión del mundo, la predicción visual y la generación de acciones y senales tactiles. Innata-0-Agent se encarga de la planificación de tareas, la validación de la ejecución, la recuperación de errores y la acumulación de experiencia reutilizable. El modelo esta pensado para robótica y manipulación, no para generación de texto general.

La relevancia actual del lanzamiento radica en su enfoque de co-diseno entre modelo y agente, y en la validación de inferencia sobre hardware no NVIDIA (MetaX), lo que resulta poco habitual en el ecosistema. En el benchmark oficial RoboCasa365, el stack completo de agente eleva la tasa de éxito del 60,2 % al 65,4 % en tareas vistas y del 32,4 % al 43,6 % en tareas composicionales no vistas. La información publicada no detalla el numero de parámetros ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers de tres torres (Innata-0-WAM); sistema con agente planificador (Innata-0-Agent) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (variante publicada); otras no disponibles |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0-and-openmdw-1.1 (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Innata-0-WAM se construye sobre una arquitectura Mixture-of-Transformers (MoT) con tres torres especializadas que comparten un espacio latente: una torre de comprensión del mundo (entrada imagen y vídeo), una torre de predicción visual (generación de vídeo condicionada a acciones, apoyada en el VAE de Wan2.2-TI2V-5B) y una torre de generación de acciones y senales tactiles para control robótico. Esta separación permite entrenar y ejecutar cada modalidad con su propio regimen de computo manteniendo coherencia entre percepción y acción. Los checkpoints publicados son cuatro: Understanding, ACWM (action-conditioned world model), WAM-RoboDojo y WAM-RoboCasa365.

La información disponible no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El componente Innata-0-Agent no es un modelo generativo de texto convencional, sino un módulo de planificación, validación y recuperación que opera sobre las salidas del WAM y acumula experiencia reutilizable entre episodios. La innovación técnica destacable es la adaptación cross-chip mediante la pila FlagOS (Torch-FL, FlagGems, FlagTree y FlagGems-vllm), que permite ejecutar los checkpoints sobre aceleradores MetaX, Hygon, Ascend, Moore Threads y T-Head además de NVIDIA.

## Capacidades

- Comprensión visual y de vídeo: respuesta a preguntas sobre imagen única (BLINK) y sobre secuencias de fotogramas (MMSI, nueve fotogramas).
- Predicción de mundo condicionada a acciones (ACWM): generación de vídeo futuro condicionado a las acciones del robot.
- Generación de acciones robóticas: predicción de trayectorias de manipulación en entornos RoboDojo y RoboCasa365.
- Generación de senales tactiles junto con las acciones, dentro de la torre de acción del WAM.
- Planificación de tareas de varios pasos mediante Innata-0-Agent.
- Validación de ejecución y recuperación de errores durante el episodio.
- Acumulación de experiencia reutilizable para mejorar episodios posteriores.
- Capacidades multilingues limitadas a inglés y chino.
- No se documentan capacidades de tool calling, function calling ni generación de texto general.

## Casos de uso

- Manipulación robótica en simulación: ejecutar políticas de acción sobre RoboCasa365 y RoboDojo usando los checkpoints WAM específicos, con el VAE de Wan2.2 como decodificador visual.
- Investigación en world models: entrenar o evaluar modelos de predicción visual condicionada a acciones (ACWM) para estudiar la relación entre percepción y control.
- Planificación de tareas de larga duración: desplegar Innata-0-Agent sobre un WAM base para elevar la tasa de éxito en tareas composicionales no vistas (del 32,4 % al 43,6 % en RoboCasa365).
- Recuperación de errores en entornos reales: usar el módulo de validación y recuperación del agente para detectar fallos de ejecución y replanificar sin reiniciar el episodio.
- Evaluación de hardware alternativo a NVIDIA: validar la inferencia de modelos encarnados sobre MetaX C550, Hygon, Ascend, Moore Threads o T-Head mediante la pila FlagOS.
- Investigación en percepción multimodal: usar Innata-0-Understanding para VQA sobre imagen y vídeo (BLINK, MMSI) en tareas de comprensión de escenas.
- Integración de senales tactiles: experimentar con la torre de acción y tacto en pipelines de robotica que requieran realimentación multimodal.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| RoboCasa365, tareas vistas | WAM base | 60,2 % exito |
| RoboCasa365, tareas vistas | WAM + stack completo de agente | 65,4 % exito |
| RoboCasa365, tareas composicionales no vistas | WAM base | 32,4 % exito |
| RoboCasa365, tareas composicionales no vistas | WAM + stack completo de agente | 43,6 % exito |

Validaciones de consistencia publicadas (MetaX C550, un dispositivo por carga de trabajo):

| Carga | Comprobacion | Resultado |
|---|---|---|
| Understanding BLINK, imagen unica | Verificación estricta de respuesta | Superada, respuesta B |
| Understanding MMSI, nueve fotogramas | Verificación estricta de respuesta | Superada, respuesta B |
| ACWM | Comparación de latentes intermedios | Supera el control de error configurado |
| RoboDojo | Comparación de latentes intermedios | Supera el control de error configurado |
| RoboCasa365 | Finitud de latentes intermedios | Superada para la linea base probada |

Las comprobaciones de generación ejecutaron los tres primeros pasos del calendario original de 30 pasos; la validación final de vídeo y acciones queda pendiente según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 113,8 GB en BF16, por lo que se requiere hardware de clase servidor con memoria agregada suficiente para cargar el checkpoint completo.
- GPU validadas oficialmente: MetaX C550 (un dispositivo por carga de trabajo), con driver KMD 3.8.1 y MACA 3.8.1.3.
- Plataformas con soporte de adaptación declarado: NVIDIA, MetaX, Hygon, Ascend, Moore Threads y T-Head.
- GPUs de consumo: no se documenta compatibilidad con RTX 4090 u otras GPUs de consumo; el tamano del checkpoint lo hace inviable en configuraciones de una sola tarjeta consumer.
- Despliegue: imagen Docker publicada en Harbor (`harbor.baai.ac.cn/flagrelease-public/innata-metax001-...`), CLI nativa de inferencia offline en `/opt/innata/bin/innata-infer`, pila Torch-FL 2.10.0+maca3.8.1.3, Transformers 5.14.1, FlagGems 5.4.0, FlagGems-vllm 0.3.0.dev1 y FlagTree 0.7.0.post2+metax3.6.
- Dependencias externas: VAE de Wan2.2-TI2V-5B (`Wan2.2_VAE.pth`), verificado por checksum SHA256.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Innata-0 (este) | Sistema encarnado WAM + agente | no disponible | no disponible | apache-2.0-and-openmdw-1.1 | Hugging Face y ModelScope |
| Wan2.2-TI2V-5B | Generación de vídeo | 5B (VAE usado como dependencia) | no disponible | no disponible en la informacion | ModelScope |
| Alternativas de world models roboticos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables directos de la misma categoría (sistemas encarnados con world model y agente) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card no publica el numero de parámetros, la longitud de contexto ni la composición del dataset de entrenamiento, lo que dificulta evaluar el modelo con rigor.
- Las validaciones de generación solo cubren los tres primeros pasos del calendario de 30; la validación final de vídeo y acciones esta pendiente según el propio autor.
- El digest del registro, la validación en imagen fresca con GPU y un servicio HTTP persistente tambien figuran como pendientes.
- El modelo esta orientado a robótica y comprensión visual; no es un LLM de propósito general y no se documentan capacidades de tool calling ni de generación de texto libre.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Licencia compuesta (Apache 2.0 y OpenMDW 1.1) que debe revisarse antes de uso comercial; el campo `license` de Hugging Face figura como `other`.
- Riesgo de alucinacion en la predicción visual y de acciones no cuantificado en la información disponible.
- La adaptación esta validada solo sobre MetaX C550; el rendimiento en el resto de plataformas declaradas no se detalla.
- El repositorio de 113,8 GB en BF16 implica requisitos de almacenamiento y memoria considerables para cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Innata-0-BF16-metax-FlagOS
- Proyecto Innata-0: https://baai-eai.github.io/innata-0/
- BAAI en ModelScope: https://www.modelscope.cn/organization/BAAI
- Wan2.2-TI2V-5B en ModelScope: https://www.modelscope.cn/models/Wan-AI/Wan2.2
- ModelScope CLI: https://github.com/modelscope/modelscope/blob/master/docs/source/command.md#download
