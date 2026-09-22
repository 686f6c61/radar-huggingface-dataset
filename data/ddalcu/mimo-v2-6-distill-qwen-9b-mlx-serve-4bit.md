# ddalcu/MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-4bit

## Resumen

MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-4bit es una conversion a 4 bits en formato MLX del checkpoint XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario ddalcu para su propio servidor de inferencia mlx-serve. No se trata, por tanto, de un modelo entrenado desde cero: es una version cuantizada y empaquetada de un modelo destilado de la familia MiMo-V2.6 (Xiaomi) sobre una arquitectura Qwen3.5 de 9B, con pipeline declarado image-text-to-text, es decir, con torre de vision operativa. El repositorio ocupa 7,4 GB y declara 9.409.813.744 parametros totales en los safetensors.

La relevancia de esta ficha es practica: permite ejecutar localmente en Apple Silicon un modelo de ~9B con vision, modo thinking y tool calling, sin necesidad de GPU dedicada ni de servidores en la nube. La cuantizacion es afin de 4 bits con group size 64, mientras que la torre de vision y los embeddings de tokens se mantienen en bf16, lo que preserva la calidad de la entrada de imagen a costa de un peso algo mayor que una cuantizacion uniforme. El autor indica que el modo thinking, el tool calling y el streaming estan probados.

El principal caveat es la ausencia total de informacion publicada: cero descargas, cero likes, licencia no especificada (remite a los terminos del modelo upstream) e idiomas no declarados. Ademas, el checkpoint upstream no incluye cabecera MTP, por lo que no hay decodificacion especulativa MTP disponible en esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (`qwen3_5`), transformer con torre de vision (image-text-to-text) |
| Parametros totales | 9.409.813.744 (dato de safetensors) |
| Parametros activos | No aplica: la informacion disponible no indica que sea MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine con group size 64 (pesos); torre de vision y embeddings de tokens en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia y terminos del modelo upstream) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); repo de 7,4 GB |

## Arquitectura y entrenamiento

La conversion parte de XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, un modelo resultante de destilar MiMo-V2.6 sobre una arquitectura Qwen3.5 de 9B. El autor confirma que la arquitectura es exactamente `qwen3_5`, lo que permite cargarla en mlx-serve sin flags especiales. Se mantiene la torre de vision, de modo que la entrada de imagen funciona, y esa torre junto con los embeddings de tokens queda en bf16 mientras el resto del transformer se cuantiza a 4 bits afines con group size 64.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo upstream uso RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documenta ninguna innovacion de decodificacion: de hecho, la model card senala explicitamente que el checkpoint upstream no incluye cabecera MTP, por lo que no hay decodificacion especulativa MTP en esta version. La unica innovacion tecnica verificable es el propio proceso de cuantizacion y el ajuste fino del empaquetado para mlx-serve.

## Capacidades

- Generacion de texto y modo thinking: el autor declara el modo de razonamiento (thinking) como probado en esta conversion.
- Entrada de imagen (image-text-to-text): la torre de vision se conserva en bf16 y el autor confirma que la entrada de imagen funciona.
- Tool calling / function calling: declarado como probado en la model card y etiquetado con el tag `tool-use`.
- Flujos agenticos: el repositorio incluye el tag `agentic`, orientado a tareas de varios pasos con herramientas.
- Streaming de tokens: probado y soportado por mlx-serve.
- Conversacion multiturno: pipeline declarado como `conversational` en los tags de HuggingFace.
- Capacidades multilingues: no disponible.
- Otras capacidades especiales (audio, vision adicional, etc.): no disponible.

## Casos de uso

- Asistente local de escritorio en Mac: el modelo se ejecuta con mlx-serve sobre memoria unificada de Apple Silicon, permitiendo un asistente conversacional privado con modo thinking y sin enviar datos a la nube, algo relevante para material confidencial.
- Automatizacion de tareas con herramientas sobre documentos escaneados: combinando la entrada de imagen con tool calling, se puede construir un pipeline que lea capturas o fotos de formularios y llame a funciones para registrarlos en un sistema interno.
- Agente de soporte tecnico multiturno: el tag `agentic` y el soporte de tool calling permiten encadenar consultas a una base de conocimiento o a una API de tickets, manteniendo el estado de la conversacion.
- Prototipado rapido de aplicaciones de vision-lenguaje: al funcionar en un portatil Apple, sirve para validar producto (describir imagenes, responder preguntas sobre capturas de interfaz) antes de escalar a un modelo mayor en servidor.
- Generacion y revision de codigo asistida en local: con modo thinking y streaming, encaja en editores o terminales que necesiten un modelo local de ~9B para autocompletar, explicar fragmentos o proponer refactorizaciones sin coste por token.
- Extraccion estructurada de informacion: dado que soporta tool calling, se puede forzar la salida a un esquema JSON mediante una funcion declarada, util para convertir facturas, albaranes o correos en registros estructurados.
- Evaluacion comparativa de cuantizaciones: al existir el checkpoint bf16 upstream, este repo permite medir la perdida de calidad de una cuantizacion 4-bit con group 64 frente al original en tareas concretas de vision y tool use.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio ningun enlace relacionado con el modelo (los resultados obtenidos correspondian a paginas corporativas de Microsoft, sin relacion con esta ficha).

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos cuantizados ocupan aproximadamente 7,4 GB en disco, por lo que se necesita un minimo practico de 8-10 GB libres de memoria unificada contando cache KV y buffers de vision. Para contexto largo o varias peticiones concurrentes, 16-24 GB es un objetivo mas realista. Son estimaciones derivadas del tamano del repo, no datos publicados por el autor.
- GPU dedicadas (A100, H100, RTX 4090, etc.): no disponibles para este artefacto. El formato es MLX, que solo se ejecuta sobre Apple Silicon, por lo que una GPU NVIDIA no puede cargar estos pesos tal cual. Para ese hardware habria que usar el checkpoint bf16 upstream con otro runtime.
- Compatibilidad con GPU de consumo: indirectamente si, pero solo en el sentido de Apple Silicon integrado (familias M1, M2, M3 y M4). En un equipo con 16 GB unificados cabe, aunque con margen justo; 24 GB o mas resulta comodo. No es ejecutable en GPUs de consumo NVIDIA en su formato actual.
- Opciones de despliegue: mlx-serve es el runtime de referencia indicado por el autor, con los comandos `mlx-serve pull ddalcu/MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-4bit` y `mlx-serve run ddalcu/MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-4bit`. vLLM, llama.cpp, Ollama y TGI: no disponible para este artefacto concreto.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ddalcu/MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-4bit | 9.409.813.744 | MLX, 4-bit affine (group 64) | no disponible | Si | no disponible | Repo de 7,4 GB, 0 descargas |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (upstream) | 9,4B (segun el modelo base declarado) | safetensors bf16 | no disponible | Si | no disponible | Modelo base de referencia |
| Alternativas de ~9B con vision para Apple Silicon | no disponible | no disponible | no disponible | no disponible | no disponible | No se identificaron en la informacion proporcionada |

La comparativa se limita al propio modelo base porque la busqueda web no devolvio informacion utilizable y la ficha de HuggingFace no aporta datos de modelos comparables. En consecuencia, no es posible contrastar rendimiento, contexto ni licencia con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no disponible: la model card indica que la licencia y los terminos de uso siguen los del modelo upstream, pero no se especifica cual es. Antes de cualquier uso comercial hay que verificar los terminos del repositorio XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto fuera del idioma o idiomas con los que se entreno el modelo base.
- Longitud de contexto no documentada: sin este dato no es posible dimensionar memoria ni disenar aplicaciones que dependan de ventanas largas.
- Cuantizacion con perdida: los pesos estan a 4 bits con group size 64, lo que introduce degradacion respecto al checkpoint bf16, especialmente en tareas de razonamiento largo o de matematicas.
- Sin decodificacion especulativa: el checkpoint upstream no trae cabecera MTP, de modo que no se puede acelerar la generacion por esa via.
- Dependencia de plataforma: el formato MLX limita la ejecucion a Apple Silicon. No hay ruta directa a servidores NVIDIA con este artefacto.
- Riesgo de alucinacion: es un modelo destilado y cuantizado, y no se han publicado evaluaciones de fidelidad factual. Cualquier uso en dominios sensibles (salud, legal, finanzas) requiere verificacion humana.
- Sesgos: no disponible. No hay informacion sobre la composicion del dataset original ni sobre analisis de sesgo.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, con fechas de creacion y actualizacion identicas (21 de septiembre de 2026). No hay validacion por parte de la comunidad ni historial de versiones.
- Rendimiento no medido: al no existir benchmarks publicados, cualquier comparacion con otros modelos seria especulativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ddalcu/MiMo-V2.6-Distill-Qwen-9B-MLX-Serve-4bit
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Repositorio del runtime mlx-serve: https://github.com/ddalcu/mlx-serve
- Papers, blogs o demos adicionales: no disponible. La busqueda web no devolvio ningun enlace relacionado con el modelo.
