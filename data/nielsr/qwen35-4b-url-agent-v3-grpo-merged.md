# nielsr/qwen35-4b-url-agent-v3-grpo-merged

## Resumen
El modelo `nielsr/qwen35-4b-url-agent-v3-grpo-merged` es un checkpoint fusionado (merged) de un ajuste fino por LoRA sobre Qwen/Qwen3.5-4B, desarrollado por el usuario nielsr de Hugging Face. Su proposito especifico es actuar como agente de extraccion de URLs dentro del entorno OpenCode, un arnes (harness) que le proporciona herramientas de Bash, Read, Grep, Glob, WebFetch y salida estructurada. El modelo no es un asistente general, sino un componente especializado para una tarea concreta de recuperacion y estructuración de enlaces.

El checkpoint se ha generado fusionando el adaptador LoRA `nielsr/qwen35-4b-url-agent-v3-grpo-lora` con el modelo base, de modo que puede cargarse de forma autonoma con `transformers` sin necesidad de gestionar el adaptador por separado. El entrenamiento se ha realizado sobre trazas verificadas de extraccion de URLs de OpenCode y, segun el nombre del repositorio, se ha aplicado GRPO (Group Relative Policy Optimization) como tecnica de ajuste, aunque la model card no detalla la configuracion del entrenamiento.

El modelo tiene 4.539.265.536 parametros (aproximadamente 4,54 mil millones) y un tamano de repositorio de 9,1 GB en formato safetensors. La informacion publicada es muy escasa: no se indican licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), segun tag `qwen3_5` |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (los pesos se publican en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modalidad | image-text-to-text (tag de Hugging Face), pipeline `text-generation` |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de ajuste | LoRA fusionado (tag `merged`), entrenado con GRPO segun el nombre del repo |
| Tamano del repositorio | 9,1 GB |

## Arquitectura y entrenamiento
La arquitectura corresponde al modelo base Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,54 mil millones de parametros. El tag `qwen3_5` y la modalidad `image-text-to-text` sugieren que la familia base admite entrada multimodal (imagen y texto), aunque la model card no detalla la arquitectura interna, el numero de capas, las dimensiones ocultas ni el mecanismo de atencion.

El entrenamiento consiste en un ajuste fino supervisado sobre trazas verificadas de extraccion de URLs generadas en el entorno OpenCode, seguido (o combinado) con GRPO, una tecnica de optimizacion por politica con recompensas relativas dentro de grupos de muestras. El adaptador resultante se ha fusionado con los pesos del modelo base para producir este checkpoint autonomo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la configuracion de recompensas ni los hiperparametros del ajuste.

La innovacion principal no es arquitectonica sino de aplicacion: el modelo esta disenado para operar dentro de un arnes con herramientas externas (Bash, Read, Grep, Glob, WebFetch) y salida estructurada, lo que lo convierte en un agente especializado en tareas de recuperacion de informacion web y extraccion de enlaces.

## Capacidades
- Extraccion de URLs: tarea principal para la que fue ajustado, a partir de trazas de OpenCode.
- Uso de herramientas (tool calling): disenado para invocar Bash, Read, Grep, Glob y WebFetch dentro del arnes OpenCode.
- Salida estructurada: soporta herramientas de structured output segun la model card.
- Razonamiento multi-paso orientado a agentes: el flujo de trabajo implica navegacion, lectura y extraccion secuencial.
- Generacion de texto conversacional: el pipeline declarado es `text-generation` con tag `conversational`.
- Procesamiento image-text-to-text: segun los tags de Hugging Face, heredado del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso
- Extraccion de URLs en pipelines de scraping: el modelo puede integrarse en el arnes OpenCode para navegar con WebFetch, leer paginas con Read y devolver enlaces estructurados, sustituyendo reglas heuristicas fragiles por un agente entrenado especificamente para esa tarea.
- Enriquecimiento de bases de datos de enlaces: dado un conjunto de documentos o paginas, el agente puede localizar y normalizar URLs relevantes mediante Grep y Glob antes de emitir la salida estructurada.
- Automatizacion de auditorias de enlaces: dentro de un flujo CI/CD, el modelo puede recorrer un repositorio con Glob y Read para identificar referencias URL y verificar su presencia o formato.
- Construccion de agentes de investigacion web: el modelo actua como subcomponente especializado en la fase de recoleccion de fuentes, delegando el razonamiento general a un modelo mayor y limitandose a la extraccion fiable de enlaces.
- Generacion de datasets de URLs verificadas: al estar entrenado sobre trazas verificadas, puede emplearse para producir candidatos de enlaces que luego se validan automaticamente, acelerando la creacion de corpus.
- Integracion en asistentes de documentacion: el agente puede leer ficheros Markdown de un proyecto y extraer o reescribir enlaces internos y externos de forma consistente.
- Prototipado de agentes con presupuesto de hardware reducido: con 4,54 B de parametros, puede desplegarse en una unica GPU consumer para experimentar con flujos de agente antes de escalar a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion held-out base-versus-adapter en el repositorio de origen del adaptador, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9-10 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 16 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB para pesos, con margen adicional para contexto.
- VRAM estimada en cuantizacion de 4 bits: en torno a 3-4 GB para pesos, viable en GPUs consumer de gama media.
- GPU recomendadas: A100, H100 o L40S para despliegues de produccion con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para desarrollo e inferencia individual.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas en BF16, y en tarjetas de 8-12 GB con cuantizacion.
- Opciones de despliegue: `transformers` (formato nativo safetensors), vLLM y TGI para servidores compatibles con la arquitectura Qwen3.5; llama.cpp/Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| nielsr/qwen35-4b-url-agent-v3-grpo-merged | 4,54 B | no disponible | no disponible | Agente especializado en extraccion de URLs (OpenCode) |
| Qwen/Qwen3.5-4B (base) | aprox. 4 B | no disponible | no disponible | Modelo generalista multimodal |
| Modelos de agente genericos de ~4 B | variable | variable | variable | Asistentes generales con tool calling, sin especializacion en URLs |

La comparativa cuantitativa con alternativas no esta disponible porque la informacion proporcionada no incluye benchmarks ni especificaciones detalladas del modelo base. La diferencia principal frente al base es la especializacion: este checkpoint esta ajustado para una tarea concreta y un arnes concreto, lo que probablemente reduce su rendimiento en tareas generales fuera de ese dominio.

## Limitaciones y advertencias
- Especializacion estrecha: el modelo esta entrenado para extraccion de URLs dentro del arnes OpenCode; su comportamiento fuera de ese entorno o en tareas generales puede degradarse respecto al modelo base.
- Dependencia del arnes: requiere las herramientas Bash, Read, Grep, Glob, WebFetch y el system prompt del repositorio de origen; sin ellas, su utilidad es limitada.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe consultarse el repositorio de origen y la licencia del modelo base Qwen/Qwen3.5-4B antes de usarlo en produccion.
- Idiomas no especificados: se desconoce el soporte multilingue real y la calidad en castellano.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar URLs o enlaces plausibles pero inexistentes; se recomienda validacion automatica de los enlaces extraidos.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al base en la informacion proporcionada, solo la referencia a una evaluacion en el repositorio del adaptador.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nielsr/qwen35-4b-url-agent-v3-grpo-merged
- Adaptador LoRA de origen: https://huggingface.co/nielsr/qwen35-4b-url-agent-v3-grpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
