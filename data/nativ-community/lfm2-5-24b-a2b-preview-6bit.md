# nativ-community/LFM2.5-24B-A2B-Preview-6bit

## Resumen

LFM2.5-24B-A2B-Preview-6bit es una conversion cuantizada en formato MLX del modelo LFM2.5-24B-A2B-Preview desarrollado originalmente por Liquid AI, Inc. La publica la organizacion nativ-community (con una copia identica en mlx-community) y su proposito es permitir la ejecucion de un modelo de mezcla de expertos (MoE) de gran tamano directamente sobre hardware Apple Silicon mediante la libreria MLX. Se trata de un modelo de generacion de texto, no multimodal, pese a que la herramienta de conversion empleada (MLX-VLM) pertenezca al ecosistema de vision-lenguaje.

El modelo cuenta con 23.971.587.712 parametros totales (aproximadamente 24B) y una ventana de contexto de 131.072 tokens declarada por la configuracion de origen. La cuantizacion es de tipo affine weight-only a 6 bits con tamano de grupo 64, mientras que las proyecciones del router usan 8 bits y los sesgos de enrutamiento de expertos se mantienen en FP32. Los ficheros de pesos ocupan 19,48 GB en decimal.

Es relevante ahora porque reduce el peso de un MoE de 24B hasta un rango manejable en equipos de memoria unificada, manteniendo el contexto largo y el soporte multilingue de diez idiomas. La conversion fue verificada en un Apple M3 Ultra y esta publicada como "preview", de modo que conviene tratarla como material experimental mas que como un artefacto de produccion consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiquetas lfm2_moe, moe; familia LFM2.5). Detalle interno completo no disponible |
| Parametros totales | 23.971.587.712 (aproximadamente 24B) |
| Parametros activos | no disponible en la informacion proporcionada (la nomenclatura A2B del nombre sugiere del orden de 2.000 millones, sin confirmar) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Affine weight-only a 6 bits, group size 64. Router a 8 bits affine, group size 64. Pesos sin cuantizar en BF16; sesgos de enrutamiento de expertos en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La informacion disponible describe la conversion, no el entrenamiento original. Se sabe que el modelo base es lq-preview/LFM2.5-24B-A2B-Preview, un MoE de la familia LFM2.5 de Liquid AI, y que la configuracion de origen fija un limite de contexto de 131.072 tokens. Los tags confirman la naturaleza de mezcla de expertos (lfm2_moe) y el uso conversacional (conversational). No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO; todos esos datos figuran como no disponibles.

Lo especifico de esta ficha es el proceso de cuantizacion y conversion. Se realizo con la CLI de MLX-VLM en un Apple M3 Ultra, partiendo de la revision f772950ce6f17d35af5469d00334b61a9c2fc034 del modelo base. La cuantizacion es affine weight-only a 6 bits con group size 64; las proyecciones del router se cuantizaron a 8 bits (group size 64), los pesos no cuantizados permanecen en BF16 y los sesgos de enrutamiento de expertos en FP32. El export se recargo con coincidencia estricta de pesos; tanto el prefill como la decodificacion con cache produjeron logits finitos. Se probo con el port de LFM2.5 de MLX-VLM PR #2505 (commit a6c7313bc053e5887616fa850808d21576eddf98), MLX 0.32.3 y Transformers 5.17.0.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat incluida.
- Razonamiento explicito: el modelo genera un razonamiento antes de su respuesta final, por lo que conviene reservar suficientes tokens de salida.
- Soporte multilingue en diez idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Capacidad de respuesta a preguntas y tareas de conocimiento general (verificado de forma superficial en las pruebas de humo).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible; la model card indica explicitamente que es un modelo de generacion de texto.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo puede gestionar dialogos multi-turno con contexto de hasta 131.072 tokens, lo que permite mantener conversaciones extensas o adjuntar documentos largos sin truncar, todo sin salir del equipo.
- Atencion al cliente multilingue: al cubrir espanol, portugues, italiano, frances, aleman, arabe, chino, japones, coreano e ingles, permite desplegar un unico modelo para atender usuarios en varios idiomas sin infraestructura de traduccion intermedia.
- Analisis de documentos largos: con 131.072 tokens de contexto se pueden resumir o extraer informacion de informes, contratos y transcripciones extensas en una sola pasada.
- Generacion de codigo en local: util para desarrolladores que trabajan con Mac y quieren asistencia de codigo sin depender de servicios en la nube; conviene validar la salida, ya que no hay datos publicados de rendimiento en benchmarks de codigo.
- Razonamiento asistido paso a paso: su modo de razonamiento previo a la respuesta final encaja en tareas que requieren descomposicion, como depuracion logica o resolucion de problemas matematicos sencillos, siempre con verificacion humana.
- Prototipado e investigacion en formato MLX: sirve como banco de pruebas para evaluar el comportamiento de un MoE de 24B cuantizado a 6 bits en hardware Apple, comparando calidad frente al modelo base en BF16.
- Procesamiento por lotes en memoria unificada: para pipelines internos de clasificacion, extraccion o resumen donde el coste de GPU dedicada no esta justificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona pruebas de humo: tras recargar el export con coincidencia estricta de pesos, dos comprobaciones cortas de generacion greedy devolvieron "Paris" (a la pregunta por la capital de Francia) y "391" (respuesta aritmetica) y alcanzaron el token EOS. El propio autor advierte que son pruebas de humo y no una evaluacion de calidad exhaustiva ni un benchmark de contexto largo.

| Prueba | Resultado | Naturaleza |
|---|---|---|
| Capital de Francia (greedy) | "Paris", alcanza EOS | Prueba de humo |
| Aritmetica (greedy) | "391", alcanza EOS | Prueba de humo |
| Logits prefill y decode con cache | Finitos | Comprobacion tecnica |

## Requisitos de hardware

- Pesos cuantizados: 19,48 GB (decimal) en disco. La memoria en tiempo de ejecucion es mayor porque incluye cache y asignaciones temporales.
- Hardware de referencia: la conversion se probo en un Apple M3 Ultra, con MLX 0.32.3 y Transformers 5.17.0.
- Memoria recomendada: al menos 32 GB de memoria unificada para uso basico; 64 GB o mas resulta aconsejable para aprovechar la ventana de 131.072 tokens, ya que la cache KV se suma a los pesos en contexto largo.
- GPU dedicadas (A100, H100, RTX 4090): no son el objetivo de este artefacto, que es especifico de MLX para Apple Silicon.
- Opciones de despliegue: MLX-VLM (comando mlx_vlm generate). Requiere el port de LFM2.5 de MLX-VLM PR #2505 y el commit indicado. No se ofrecen pesos GGUF en este repositorio, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente a estos ficheros.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/LFM2.5-24B-A2B-Preview-6bit | 23,97B | 131.072 tokens | Affine 6 bits (MLX) | LFM Open License v1.0 | Publico en HF |
| mlx-community/LFM2.5-24B-A2B-Preview-6bit | 23,97B | 131.072 tokens | Affine 6 bits (MLX) | LFM Open License v1.0 | Publico en HF (ficheros identicos) |
| lq-preview/LFM2.5-24B-A2B-Preview (base) | 23,97B | 131.072 tokens | BF16 (sin cuantizar) | LFM Open License v1.0 | Publico en HF |

No se dispone de datos de benchmarks ni de modelos alternativos comparables (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- Es una version "preview" y una conversion de terceros; la calidad respecto al modelo original no esta evaluada de forma exhaustiva.
- La cuantizacion a 6 bits puede degradar la calidad frente al modelo base en BF16. No se han publicado metricas de esa perdida.
- Riesgo de alucinacion inherente a los modelos generativos; se recomienda verificacion humana en usos sensibles.
- El modelo genera razonamiento antes de la respuesta final; si no se reservan suficientes tokens de salida, la respuesta puede quedar truncada.
- Artefacto especifico de MLX: no es portable directamente a otros runtimes (no hay GGUF ni pesos para vLLM, TGI o llama.cpp en este repositorio).
- Limitacion de contexto: 131.072 tokens. Superar ese limite requiere truncar o fragmentar.
- Licencia: LFM Open License v1.0, que es una licencia "other" con condiciones propias. Antes de un uso comercial conviene revisar el texto completo del fichero LICENSE, ya que no es una licencia permisiva estandar.
- Los tags incluyen mlx-vlm, pero la model card indica que es un modelo de texto; no debe asumirse capacidad de vision.
- Los datos de parametros activos y de entrenamiento (tokens, dataset, alineacion) no estan disponibles en la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que aun no tiene validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-6bit
- Copia identica en mlx-community: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-6bit
- Modelo base: https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- MLX-VLM PR #2505: https://github.com/Blaizzy/mlx-vlm/pull/2505
- Licencia LFM Open License v1.0: fichero LICENSE en el repositorio del modelo
- Aviso de conversion y modificaciones: fichero NOTICE en el repositorio del modelo
- Detalles de configuracion y versiones: fichero conversion_info.json en el repositorio del modelo
