# Cianidos/Darwin-180B-RSI-R3-Sushi-2.5bpw-Sharp

## Resumen

Darwin-180B-RSI-R3-Sushi-2.5bpw-Sharp es una cuantizacion de 2,5 bits por peso del modelo Darwin-180B-RSI-R3, publicada por el usuario Cianidos en formato Sushi (derivado de MLX) para Apple Silicon. El modelo base, desarrollado por FINAL-Bench, es un transformer de tipo Mixture of Experts (MoE) con capacidades de razonamiento, vision y contexto largo, segun indican las etiquetas del repositorio. Esta variante concreta no modifica los pesos: los 52 shards y la tabla n-gram son byte a byte identicos al pack Sushi base, y la unica diferencia es la plantilla de chat Sharp, publicada bajo Apache-2.0 por peculiar-ragdoll.

La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamano en hardware de consumo Apple Silicon (el autor lo prueba en un M5 Pro con 48 GiB), gracias a una cuantizacion agresiva de 2,5 bpw combinada con una estrategia de cache de expertos en SSD. El repositorio ocupa 77,3 GB y los pesos declarados en safetensors suman 24.995.626.899 parametros, un dato que no concuerda con el nombre comercial "180B" y que conviene tratar con cautela.

La plantilla Sharp anade instrucciones de respuesta concisa, conserva el historial de razonamiento, ajusta las instrucciones de herramientas segun el modo thinking y anade guia tras errores de tool calling. El autor no reclama ninguna ventaja medida de inteligencia o velocidad frente a la plantilla original; la preferencia es de uso, no de comparacion controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (segun etiquetas del repo; detalles no disponibles) |
| Parametros totales | 24.995.626.899 (safetensors); el nombre comercial indica 180B, discrepancia no aclarada |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (contexto nativo, segun ejemplo de despliegue del autor) |
| Tipos de cuantizacion | 2,5 bpw (formato Sushi/EXL3); KV cache cuantizable a 8 bits |
| Idiomas soportados | en, ko, zh, ja, multilingual |
| Licencia | Qwen Community License 1.0 (pesos); plantilla Sharp Apache-2.0 |
| Formato de pesos | Sushi (shards safetensors + tabla n-gram); no es GGUF ni ExLlamaV3 nativo |
| Tamano del repo | 77,3 GB (72,05 GiB) |
| Libreria | mlx |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Las etiquetas indican que se trata de un MoE con capacidades de razonamiento, vision y contexto largo, construido sobre lo que el repositorio denomina `qwen4_exp`, lo que sugiere una base derivada de la familia Qwen 4 experimental. No se especifican el numero de expertos, la dimension oculta, el numero de capas ni la estrategia de enrutamiento. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable de esta variante no esta en los pesos sino en el empaquetado: formato Sushi con tabla n-gram, soporte de MTP (multi-token prediction) nativo con cabeza dedicada, cuantizacion KV a 8 bits, cache de prefijos en SSD y un mecanismo de "expert pick" que permite mantener solo una parte de los expertos en memoria (289 de 512 por capa en el arranque de prueba) y leer el resto desde SSD. La plantilla Sharp, por su parte, incorpora instrucciones de respuesta concisa, preservacion del historial de razonamiento, control de thinking inline y guia ante errores de herramientas.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat integrada.
- Razonamiento con niveles de esfuerzo configurables: `off`, `low`, `medium`, `xhigh`.
- Vision-language: pipeline image-text-to-text con soporte de entrada de imagenes.
- Contexto largo nativo de hasta 262.144 tokens.
- Tool calling en formato XML por defecto, con ajuste de instrucciones segun thinking on/off.
- Soporte de agentes y razonamiento multi-paso, con guia adicional tras errores de herramientas.
- Multilingue: ingles, coreano, chino, japones y cobertura multilingue adicional.
- Compatibilidad con APIs OpenAI Chat Completions y Anthropic Messages a traves del servidor Sushi.
- Decodificacion con MTP (multi-token prediction) y cuantizacion KV a 8 bits.

## Casos de uso

- Asistente de codigo en local sobre Mac: el modelo puede integrarse en un flujo de trabajo con tool calling XML y contexto de 262K tokens para analizar repositorios completos sin salir del equipo, aprovechando el servidor Sushi con API compatible con OpenAI.
- Analisis de documentos largos con imagenes: informes financieros, papers o manuales tecnicos que combinan texto extenso y figuras, procesables en una sola ventana de contexto gracias a la modalidad image-text-to-text.
- Agente de automatizacion con razonamiento multi-paso: tareas que requieren planificacion, llamadas a herramientas y correccion tras errores, beneficiandose de la guia de la plantilla Sharp ante fallos de tool calling.
- Atencion al cliente multilingue: conversaciones multi-turno en ingles, coreano, chino y japones con historial de razonamiento preservado, desplegable en un Mac de 48 GiB.
- Prototipado de investigación en Apple Silicon: evaluacion de modelos MoE de gran tamano sin GPU dedicada, usando cache de expertos en SSD y presupuesto de memoria configurable.
- Generacion de respuestas concisas para interfaces de chat: la plantilla Sharp anade instrucciones de brevedad tras el system prompt, adecuada para asistentes embebidos donde la latencia y la verbosidad importan.
- Procesamiento por lotes con cache de prefijos: reutilizacion de prefijos largos (system prompts, documentacion) mediante cache de disco de hasta 100 GB, util en pipelines repetitivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no reclama ninguna ventaja medida de inteligencia o velocidad frente a la plantilla original, y que la preferencia por Sharp se basa en el uso, no en una comparacion controlada. Tampoco se proporcionan cifras de throughput o latencia, solo la configuracion de prueba (M5 Pro, 48 GiB, MLX 0.32.3, Sushi 1.4.0, macOS 27.2).

## Requisitos de hardware

- VRAM/RAM unificada: el autor prueba con un limite de GPU de 40 GiB sobre un Mac de 48 GiB; el repo pesa 72,05 GiB, por lo que se requiere streaming desde SSD.
- GPU recomendadas: Apple Silicon de gama alta (M5 Pro segun la prueba del autor); no se documenta soporte para A100, H100 ni RTX 4090 en esta variante.
- Cabe en GPU de consumo: si, en Macs con memoria unificada suficiente (48 GiB en la configuracion probada); no aplicable a GPU discretas consumer por el formato Sushi/MLX.
- Opciones de despliegue: servidor Sushi 1.4.0 (compatible con API OpenAI y Anthropic Messages); no es GGUF, por lo que no aplica llama.cpp u Ollama; no es un checkpoint nativo de ExLlamaV3.
- Ajustes relevantes: `--ssd-budget-gb 28` como objetivo de residencia de pesos, cache de expertos y buffers; `--ctx-size 262144`; `--kv-quant 8`; `--mtp`; `--vision`; cache de prefijos en disco de hasta 100 GB.
- Latencia y throughput: no disponibles. El autor advierte que un prompt completo de 262K con imagenes no fue sometido a prueba de estres.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-180B-RSI-R3-Sushi-2.5bpw-Sharp | 24.995.626.899 (safetensors) | 262.144 | Sushi (MLX) | Qwen Community 1.0 | HuggingFace, 27 descargas |
| Darwin-180B-RSI-R3-Sushi-2.5bpw | mismos pesos | 262.144 | Sushi (MLX) | Qwen Community 1.0 | HuggingFace |
| Darwin-180B-RSI-R3 (base) | no disponible | no disponible | safetensors | Qwen Community 1.0 | HuggingFace (FINAL-Bench) |

La unica diferencia entre las dos variantes Sushi es la plantilla de chat; los pesos son identicos. No se dispone de datos de rendimiento comparado con alternativas de la misma categoria.

## Limitaciones y advertencias

- Discrepancia entre el nombre comercial "180B" y los 24.995.626.899 parametros declarados en safetensors; conviene verificar antes de planificar recursos.
- Cuantizacion a 2,5 bpw: perdida de calidad esperable frente al modelo base en precision completa, aunque no cuantificada en la informacion disponible.
- Requiere hardware Apple Silicon y el runtime Sushi; no es portable a llama.cpp, Ollama ni GPU NVIDIA sin conversion.
- El rendimiento depende del streaming desde SSD: con solo 289 de 512 expertos por capa en cache, los expertos faltantes se leen de disco, lo que puede penalizar la latencia.
- La plantilla Sharp es un cambio de prompt, no un fine-tune; puede alterar el comportamiento respecto al pack original sin mejora medible demostrada.
- Licencia Qwen Community 1.0: revisar condiciones de uso comercial antes de desplegar en produccion; la plantilla Sharp es Apache-2.0 pero los pesos no.
- Idiomas: cobertura declarada en en, ko, zh, ja y multilingue; no se especifica el rendimiento en castellano.
- Riesgo de alucinacion y sesgos: no documentados por el autor; aplicar las precauciones habituales en produccion.
- El ajuste `iogpu.wired_limit_mb=40960` no es una reserva ni un limite de RAM del proceso completo; no debe copiarse en equipos con menos memoria.
- Un prompt completo de 262K con imagenes no fue probado bajo estres segun el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cianidos/Darwin-180B-RSI-R3-Sushi-2.5bpw-Sharp
- Variante Sushi base: https://huggingface.co/Cianidos/Darwin-180B-RSI-R3-Sushi-2.5bpw
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Plantilla Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Revision fijada de la plantilla: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates/tree/6a78b888557f8c9987f51bca98d02d8f69682044
- Plantilla upstream de froggeric: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Paper citado 1: https://arxiv.org/abs/2605.14386
- Paper citado 2: https://arxiv.org/abs/2609.20269
