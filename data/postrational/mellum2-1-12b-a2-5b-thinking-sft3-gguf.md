# postrational/Mellum2.1-12B-A2.5B-Thinking-sft3-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-sft3-GGUF es una distribucion en formato GGUF del modelo Mellum 2.1 de 12B parametros totales, con aproximadamente 2.5B parametros activos (arquitectura Mixture of Experts), afinado para razonamiento con "thinking" y posteriormente cuantizado por el usuario postrational. El repositorio lo publica el propio autor de la cuantizacion, no el desarrollador original del modelo base, y esta pensado para inferencia local con llama.cpp. La conversion y el ajuste fino se han realizado con la herramienta Unsloth, segun indica la model card.

El modelo resuelve el caso de uso de ejecutar un LLM de razonamiento con arquitectura MoE en hardware de consumo, ya que al tener solo ~2.5B parametros activos por token el coste computacional de inferencia es mucho menor que el de un denso de 12B. El repositorio ocupa 8.1 GB e incluye una unica cuantizacion Q4_K_M. La informacion publicada es muy escasa: no se detallan datos de entrenamiento, benchmarks, licencia ni idiomas soportados.

Es relevante ahora porque demuestra el flujo tipico de publicacion de modelos abiertos: un modelo base MoE, un ajuste fino SFT orientado a razonamiento (sufijo "sft3") y una conversion a GGUF para despliegue en local. No obstante, al carecer de model card tecnica completa, debe tratarse como un artefacto experimental y no como un modelo listo para produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, segun el nombre del modelo; detalles no disponibles |
| Parametros totales | 12.149.923.072 (~12.1B) |
| Parametros activos | ~2.5B (segun el nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura Mixture of Experts con 12.1B parametros totales y aproximadamente 2.5B activos por token, lo que implica que solo una fraccion de los expertos se activa en cada paso de inferencia. No se dispone de informacion publicada sobre el numero de expertos, la dimension del hidden state, el numero de capas ni el mecanismo de enrutamiento.

El modelo ha pasado por un ajuste fino supervisado (SFT) orientado a razonamiento, indicado por el sufijo "sft3" y la etiqueta "Thinking". Segun la model card, el ajuste fino y la conversion a GGUF se realizaron con Unsloth. No hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales. El modelo base Mellum 2.1 no esta documentado en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" del repositorio y el formato de chat compatible con `--jinja` en llama.cpp indican soporte de conversaciones multi-turno con plantilla de chat.
- Modo razonamiento ("thinking"): el nombre del modelo y el ajuste SFT apuntan a generacion de cadenas de razonamiento antes de la respuesta final, aunque no se detalla el formato exacto.
- Inferencia local via llama.cpp: `llama-cli` con `--jinja` para texto y `llama-mtmd-cli` para modelos multimodales (la model card menciona esta opcion de forma generica; no se confirma que este modelo concreto tenga vision).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas mas alla del modo thinking.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Prototipado local de razonamiento: ejecutar el modelo con llama.cpp en una estacion de trabajo para experimentar con cadenas de razonamiento en tareas de logica y matematicas, aprovechando que solo ~2.5B parametros se activan por token y el coste por token es bajo.
- Asistente conversacional en local: desplegar un chatbot multi-turno con plantilla Jinja en `llama-cli` o en un servidor llama.cpp, sin dependencia de la nube, para entornos con requisitos de privacidad.
- Evaluacion de modelos MoE ajustados: usar el repositorio como banco de pruebas para comparar el rendimiento de un MoE de 12B con 2.5B activos frente a modelos densos de tamano similar en tareas de razonamiento.
- Generacion de codigo asistida: emplear el modo thinking para tareas de programacion donde el modelo razone el problema antes de emitir el codigo, integrado en editores mediante el servidor compatible con OpenAI de llama.cpp.
- Educacion y analisis paso a paso: generar explicaciones razonadas de problemas tecnicos, mostrando el proceso intermedio, util en herramientas de tutoria o documentacion tecnica.
- Investigacion sobre cuantizacion: analizar el impacto de Q4_K_M en un MoE de 12B con 2.5B activos, comparando la calidad frente al modelo en precision completa si estuviera disponible.
- Despliegue en hardware de consumo: servir el modelo en una GPU consumer con suficiente VRAM para el fichero de 8.1 GB, como alternativa local a APIs comerciales para tareas de razonamiento de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 8.1 GB (tamano del repo), por lo que se necesitan al menos ~9-10 GB de VRAM para cargarlo completo en GPU, mas overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), A100 y H100 para despliegues de mayor throughput.
- GPU consumer: cabe en GPUs de 12 GB o mas con cuantizacion Q4_K_M, aunque el margen para contexto largo es limitado; en GPUs de 8 GB requeriria offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (mediante importacion del GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este caso sin conversion a safetensors.
- Latencia y throughput: no disponibles. Al activar solo ~2.5B parametros por token, se espera un throughput superior al de un denso de 12B en el mismo hardware, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base Mellum 2.1 que permitan una comparacion rigurosa con alternativas de la misma categoria (MoE de ~12B con ~2.5B activos).

## Limitaciones y advertencias

- Informacion tecnica muy escasa: no hay model card detallada, benchmarks, licencia ni idiomas declarados, lo que impide validar el modelo para produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe consultarse el repositorio del modelo base antes de cualquier despliegue comercial.
- Riesgo de alucinacion: inherente a los LLM y no cuantificado en este caso; el modo thinking puede generar cadenas de razonamiento plausibles pero incorrectas.
- Sesgos: no documentados; al desconocerse la composicion del dataset de entrenamiento no es posible evaluar sesgos de genero, idioma o dominio.
- Contexto e idiomas desconocidos: no se puede garantizar el soporte de castellano ni de contextos largos.
- Cuantizacion unica: solo se ofrece Q4_K_M, con la perdida de calidad asociada frente a precision completa, especialmente relevante en tareas de razonamiento.
- Procedencia: el repositorio lo publica un tercero (postrational), no el desarrollador original de Mellum, por lo que la trazabilidad del ajuste fino es limitada.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/postrational/Mellum2.1-12B-A2.5B-Thinking-sft3-GGUF
- Unsloth (herramienta de ajuste fino y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggml-org/llama.cpp
