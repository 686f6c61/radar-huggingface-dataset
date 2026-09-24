# Shiftedx/qwopus3.8-27b-flash-v2-mxfp4-vision-mtplx

## Resumen

Qwopus3.8-27B-Flash-V2 mxfp4 vision mtplx es una conversion cuantizada en formato MLX del modelo Jackrong/Qwopus3.8-27B-Flash-V2, publicada por el usuario Shiftedx. Se trata de un artefacto experimental orientado a Apple Silicon que empaqueta en un unico paquete tres componentes: los pesos de texto cuantizados en MXFP4, 333 tensores de vision en BF16 heredados del modelo padre y un sidecar nativo de prediccion multi-token (MTP) de 15 tensores tambien en BF16. El modelo cuenta con 27.356.728.560 parametros (~27,36 mil millones) y el repositorio ocupa 16,1 GB, con ficheros de pesos que suman 14,960 GiB.

El problema que resuelve es la ejecucion local eficiente de un modelo multimodal de ~27B en hardware Apple: la cuantizacion MXFP4 (4 bits, grupo 32) reduce el peso de los modulos lineales de texto y de los embeddings, mientras que vision y MTP se mantienen en BF16 para preservar su comportamiento. El paquete se distribuye bajo licencia Apache 2.0 y esta pensado para ejecutarse con MTPLX 2.11.2 (o MLX-LM 0.31.3 para texto), no con stacks CUDA.

Es relevante ahora porque combina cuantizacion de bajo bit ancho, vision y decodificacion especulativa nativa en un solo artefacto MLX, algo poco frecuente. Sin embargo, el propio autor califica la publicacion como experimental y advierte de fallos conocidos de formato en la generacion de codigo Python (indentacion invalida) reproducidos incluso en el modelo padre BF16 sin cuantizar, ademas de no reclamar ninguna cualificacion completa de extremo a extremo, ni de contexto maximo, ni de rendimiento frente a otras variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la detalla; la etiqueta del repo es qwen3_5 y se empaqueta un sidecar MTP nativo) |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (el autor declara explicitamente que no reclama cualificacion de contexto maximo) |
| Tipos de cuantizacion | MXFP4, 4 bits con grupo de 32, aplicado a modulos lineales de texto y embeddings elegibles; vision en BF16 (333 tensores); sidecar MTP nativo en BF16 (15 tensores) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantizacion mx.float4; tokenizer, chat template y configuracion de generacion preservados; metadatos del procesador de imagen aplanados; hashes en SHA256SUMS |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base en la informacion proporcionada. La model card de esta conversion no describe la arquitectura subyacente de Jackrong/Qwopus3.8-27B-Flash-V2 (fijada al commit 13f92e09a46fa364f8de1edb85684d57bda01126), y las fuentes web consultadas no aportan ficha tecnica del modelo original. Lo unico documentado es la etiqueta de familia qwen3_5, la naturaleza multimodal (pipeline image-text-to-text) y la presencia de un cabezal/sidecar de prediccion multi-token (MTP).

La innovacion tecnica destacable de esta publicacion es el empaquetado conjunto en MLX: cuantizacion MXFP4 selectiva para el camino de texto, conservacion de la torre de vision en BF16 procedente del mismo padre y sidecar MTP nativo en BF16 para decodificacion especulativa. Se construyo con MLX 0.32.2 y MLX-LM 0.31.3 y se empaqueto para MTPLX 2.11.2. El autor indica que MLX-LM estandar no habilita ni vision ni MTP, por lo que es necesario usar MTPLX para el artefacto combinado. El modo MTP se ha ejercitado con profundidad 3 (D3) unicamente sobre la variante Attention8, y se recomienda empezar por decodificacion autorregresiva (AR) al evaluar otras variantes. Tambien se advierte de que la configuracion de generacion heredada fija temperature 1.0 y debe sobrescribirse a 0.3 para tareas de codigo.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: image-text-to-text; etiqueta conversational).
- Entrada multimodal de imagen y texto: incluye torre de vision en BF16 con 333 tensores, heredada del modelo padre.
- Modo de razonamiento explicito: requiere pasar `enable_thinking=true` y `reasoning_effort="xhigh"` de forma explicita en los controles de chat template o API.
- Decodificacion especulativa mediante MTP nativo (sidecar de 15 tensores, modo `--generation-mode mtp --depth 3`), con la salvedad de que solo se ha ejercitado D3 sobre la variante Attention8.
- Servicio local mediante `mtplx serve` con backend `qwen3_next` (parametros sugeridos: temperature 0.3, top-p 0.95, top-k 20).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente; el modo de razonamiento con esfuerzo xhigh es el unico indicio relacionado.
- Capacidades multilingues: no disponible.
- Capacidad especial reseñable: combinacion de vision y prediccion multi-token en un mismo paquete MLX, sin cuantizar en BF16.

## Casos de uso

- Prototipado local multimodal en Mac: cargar el paquete con MTPLX y enviar imagenes junto a prompts de texto para descripcion, extraccion de informacion o pregunta-respuesta sobre documentos escaneados, aprovechando que la torre de vision se mantiene en BF16.
- Evaluacion de cuantizacion MXFP4 en texto: comparar la salida de esta variante de 4 bits contra el padre BF16 con la misma semilla y muestreo recomendado, para medir la degradacion introducida por la cuantizacion en tareas concretas.
- Experimentacion con decodificacion especulativa MTP: probar el modo `--generation-mode mtp --depth 3` para estudiar aceleracion de generacion en Apple Silicon, partiendo de AR como linea base y asumiendo que solo D3 esta ejercitado en Attention8.
- Generacion asistida de codigo con supervision humana: el modelo puede redactar fragmentos y explicaciones, pero dado el fallo conocido de indentacion en Python, su uso realista es como borrador que pasa revision y formateo automatizado (linter, `black`, `ruff`) antes de integrarse.
- Asistente conversacional de proposito general autoalojado: conversaciones multi-turno en local sin enviar datos a terceros, gracias a la licencia Apache 2.0 y a la ejecucion completamente offline en el equipo.
- Analisis de capturas y diagramas tecnicos: interpretacion de imagenes (interfaces, esquemas, tablas) combinada con el modo de razonamiento explicito para producir explicaciones paso a paso.
- Investigacion sobre empaquetado MLX: servir como referencia de como distribuir en un solo repositorio pesos cuantizados, vision en BF16 y sidecar MTP, con `SHA256SUMS` y hashes verificables.
- Base para derivados experimentales: al ser Apache 2.0, puede servir de punto de partida para ajuste fino o para comparaciones entre las variantes del mismo autor (Attention8 con recurrencia BF16, o solo recurrencia BF16).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se reclama ningun puesto en leaderboards ni ninguna cifra de velocidad, y que no existe cualificacion de rendimiento frente a otras variantes. Las unicas metricas objetivas disponibles son de tamano: 27.356.728.560 parametros, 14,960 GiB de ficheros de pesos y 16,1 GB de repositorio.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon. El artefacto usa la libreria mlx y MTPLX 2.11.2; no hay soporte CUDA ni ROCm documentado.
- Memoria unificada: los ficheros de pesos suman 14,960 GiB y el autor advierte de que la memoria en tiempo de ejecucion es superior; una fuente externa (LLM Explorer) estima 15,8 GB de VRAM. En la practica conviene disponer de 24 GB o mas de memoria unificada para dejar margen al contexto, la cache KV y la vision.
- Equipos razonables: Mac con chip M-series Pro/Max/Ultra de 24 GB o mas (M2 Pro 32 GB, M3 Max 36-48 GB, M4 Max, M2/M3 Ultra). Un equipo de 16 GB queda muy justo y probablemente no permita contexto util.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables directamente, al no existir un camino de ejecucion CUDA en este paquete.
- Opciones de despliegue: MTPLX 2.11.2 (unico stack que habilita vision y MTP conjuntamente) y MLX-LM 0.31.3 para generacion de texto sin vision ni MTP. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Comandos de referencia: `mtplx inspect --model model --json` para inspeccion y `mtplx serve --model model --backend-id qwen3_next --generation-mode ar --reasoning-mode on --reasoning-effort xhigh --temperature 0.3 --top-p 0.95 --top-k 20` para servir.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de latencia.
- Espacio en disco: reservar al menos 16-17 GB libres para la descarga y, preferiblemente, el doble si se conserva el modelo padre BF16 para comparaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Vision | MTP nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shiftedx/qwopus3.8-27b-flash-v2-mxfp4-vision-mtplx | 27,36 B | MXFP4 4 bits (grupo 32) + vision y MTP en BF16 | Si | Si | Apache 2.0 | Publicado en HuggingFace (0 descargas, 0 likes en la informacion disponible) |
| Shiftedx/qwopus3.8-27b-flash-v2-attention8-bf16recurrence-vision-mtplx | No disponible | Attention8 + recurrencia BF16 | Si | Si | Apache 2.0 (segun coleccion) | Publicado, variante del mismo autor |
| Shiftedx/qwopus3.8-27b-flash-v2-bf16recurrence-only-vision-mtplx | No disponible | Solo recurrencia BF16 | Si | Si | Apache 2.0 (segun coleccion) | Publicado, variante del mismo autor |
| Jackrong/Qwopus3.8-27B-Flash-V2 (padre) | No disponible | BF16 sin cuantizar | Si | No confirmado en esta ficha | No disponible en la informacion proporcionada | Publicado, referenciado como base_model |

No se dispone de datos de rendimiento de ninguna de estas variantes, por lo que la comparativa se limita a formato, precision y disponibilidad; no es posible comparar con modelos de terceros de tamano similar porque no se han aportado cifras.

## Limitaciones y advertencias

- Modelo explicitamente marcado como experimental y sin cualificacion completa de extremo a extremo; el autor indica que la estructura fue inspeccionada, pero no hay validacion integral del artefacto.
- Fallo conocido de formato en codigo Python: la generacion directa con MLX-LM reproduce indentacion invalida. El defecto tambien se observo en el padre BF16 sin cuantizar con la misma semilla y ajustes de muestreo, lo que indica que la cuantizacion no es la unica causa; no se establece una tasa de fallo universal.
- La model card se autocalifica como "unqualified" y señala que quedan fallos de formato en Python sin resolver; la tarjeta del modelo original solo reporta mejora, no eliminacion garantizada.
- Sin datos de benchmarks, sin cifras de velocidad y sin cualificacion de contexto maximo ni de comportamiento entre distintos runtimes.
- Las capacidades de vision y MTP solo estan disponibles a traves de MTPLX; con MLX-LM estandar el modelo funciona como generador de texto y no activa ninguno de los dos.
- El modo MTP con profundidad 3 solo se ha ejercitado sobre la variante Attention8; no hay garantia de comportamiento equivalente en esta variante MXFP4.
- La configuracion de generacion heredada usa temperature 1.0; es necesario sobrescribirla (por ejemplo a 0.3) para tareas de codigo, lo que implica que un uso naive dara resultados pobres.
- Idiomas soportados: no disponible, por lo que no se puede garantizar calidad fuera del idioma o idiomas no declarados del modelo padre.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgos, toxicidad o seguridad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican las precauciones habituales de un modelo generativo sin evaluacion publicada.
- Licencia Apache 2.0 en este artefacto, pero conviene verificar la licencia y los terminos del modelo padre Jackrong/Qwopus3.8-27B-Flash-V2 antes de un uso comercial, ya que no se detallan en la informacion proporcionada.
- Observabilidad muy baja: 0 descargas y 0 likes, sin discusion ni retroalimentacion de la comunidad; el soporte depende de un unico autor.
- Restriccion de plataforma: al depender de MLX, el modelo no es desplegable en infraestructura con GPU NVIDIA o AMD sin reconvertir los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-v2-mxfp4-vision-mtplx
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Commit fijado del modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2/tree/13f92e09a46fa364f8de1edb85684d57bda01126
- Seccion de la tarjeta del modelo padre sobre indentacion en Python: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2#24-python-indentation--working-hypothesis
- Coleccion Qwopus3.8 27B Flash MLX Quants: https://huggingface.co/collections/Shiftedx/qwopus38-27b-flash-mlx-quants
- Variante relacionada (sin V2): https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-mxfp4-vision-mtplx
- Variante attention8-bf16recurrence: https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-v2-attention8-bf16recurrence-vision-mtplx
- Variante bf16recurrence-only: https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-v2-bf16recurrence-only-vision-mtplx
- Ficha en LLM Explorer: https://llm-explorer.com/model/Shiftedx%2Fqwopus3.8-27b-flash-mxfp4-vision-mtplx,4lROvjkEutYAZlqCnzgRbx
- Ficha en free2aitools: https://free2aitools.com/model/shiftedx/qwopus3.8-27b-flash-mxfp4-vision-mtplx
- Variante abliterated en LLM Explorer: https://llm-explorer.com/model/Shiftedx%2Fqwopus3.8-27b-flash-abliterated-mxfp4-vision-mtplx,348SZgTb86nGqvpkzWI8Eh
