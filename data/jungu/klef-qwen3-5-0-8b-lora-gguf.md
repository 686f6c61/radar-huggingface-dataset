# JUNGU/klef-qwen3.5-0.8b-lora-GGUF

## Resumen

JUNGU/klef-qwen3.5-0.8b-lora-GGUF es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario JUNGU y convertido a GGUF para inferencia en CPU con llama.cpp. Su proposito es muy concreto: recibe el texto de documentos de consulta publica de centros escolares coreanos (cuerpo y texto de los anexos) y devuelve un JSON en coreano con cinco claves: `summary`, `action`, `deadline`, `target` e `importance`. Forma parte del motor de resumen local del proyecto klef-collector.

Tecnicamente es un modelo denso de aproximadamente 772,8 millones de parametros (0,8B), con una adaptacion LoRA de rango 16 y escala 2.0 aplicada a todas las capas y entrenada durante 600 pasos (unas dos epocas) con MLX. Los pesos resultantes se fusionaron con los originales y se cuantizaron a Q4_K_M, generando un unico archivo GGUF de 541.903.840 bytes (unos 0,5 GB).

Su relevancia esta en el nicho: demuestra que un adaptador LoRA pequeno sobre un modelo de 0,8B puede superar a un modelo base de 2B en una tarea estructurada muy acotada y ejecutarse integramente en CPU. Como contrapartida, se entreno y evaluo unicamente con documentos ficticios, por lo que no esta validado sobre documentos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso heredado de Qwen3.5-0.8B, con adaptacion LoRA (rango 16, escala 2.0, todas las capas). Detalles internos del modelo base: no disponibles |
| Parametros totales | 772.845.888 (aproximadamente 0,8 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el ejemplo oficial de despliegue usa `-c 4096`. Fuentes secundarias citan del orden de 32k para la familia Qwen3.5, sin confirmacion oficial |
| Tipos de cuantizacion | Q4_K_M (unico archivo distribuido) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Archivo distribuido: `klef-qwen3.5-0.8b-lora-r16-600-Q4_K_M.gguf`, 541.903.840 bytes, SHA-256 `f7208690cb8e102b3e9977235035ec3d23de1a22130a5fea4fe00816b9710f6f`.

## Arquitectura y entrenamiento

El modelo parte del transformer denso Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`, Apache-2.0) y le aplica un adaptador LoRA de rango 16, escala 2.0 y cobertura de todas las capas, entrenado durante 600 pasos (aproximadamente dos epocas) con MLX. Posteriormente, los pesos del adaptador se fusionan con los del modelo base y el resultado se convierte a GGUF y se cuantiza a Q4_K_M mediante llama.cpp. No se documenta el uso de RLHF ni de DPO; el ajuste es exclusivamente supervisado sobre datos sinteticos.

El conjunto de entrenamiento esta formado integramente por documentos ficticios: no se emplearon documentos oficiales reales, organismos existentes ni personas reales. Se generaron 1.350 casos a partir de hechos predefinidos (accion, plazo, destinatario y condiciones), de los que 1.215 superaron la verificacion de fundamento en el texto original (1.155 de entrenamiento y 60 de validacion). Las categorias cubren receptor de respuesta frente a solicitante, fecha de evento frente a plazo de inscripcion, condiciones de deseo, eleccion o exencion, cancelaciones y cambios, avisos sin tarea asociada, acciones multiples, documentos con predominio de anexos y documentos largos con alguna inyeccion de prompt. La mayoria se genero con plantillas, por lo que los patrones de frase se repiten.

## Capacidades

- Generacion de resumen extractivo en coreano de documentos administrativos escolares, con salida estructurada en JSON.
- Salida con esquema fijo de cinco claves: `summary`, `action`, `deadline`, `target` e `importance`.
- Extraccion de plazos, destinatarios y acciones concretas a partir del cuerpo del documento y de sus anexos.
- Discriminacion entre casos con tarea y avisos meramente informativos, y entre multiples acciones en un mismo documento.
- Manejo de condiciones (deseo, eleccion, exencion) y de situaciones de cancelacion o cambio.
- Modo de razonamiento desactivado de forma explicita (`enable_thinking: false`, `--reasoning-budget 0`) para priorizar la latencia.
- Ejecucion en CPU con llama.cpp b10883 o superior y plantilla de chat Jinja.
- Soporte de respuesta con JSON schema impuesto por el servidor.
- No esta entrenado para conversacion general ni para resumir paginas web, ni dispone de tool calling ni de capacidades multimodales documentadas.

## Casos de uso

- Motor de resumen local de klef-collector: es su proposito original. El modelo recibe el texto del documento de consulta publica y devuelve el JSON de cinco claves que consume la aplicacion, sin salida a servicios en la nube.
- Extraccion automatica de plazos y acciones en gestion documental escolar: la clave `deadline` y la clave `action` permiten convertir el texto libre en elementos accionables, utiles para generar listas de tareas de secretaria o de profesorado.
- Procesamiento por lotes en CPU sin GPU: con un archivo de 0,5 GB y una latencia mediana de 1,33 segundos por caso, permite resumir cientos de documentos en un portatil o en un servidor sin acelerador.
- Flujos con requisitos de privacidad: al ejecutarse integramente en local mediante llama.cpp, el contenido de los documentos no sale del equipo, lo que encaja en entornos con restricciones de tratamiento de datos.
- Prototipado rapido de pipelines de resumen estructurado: sirve como referencia de como un LoRA de rango 16 sobre 0,8B puede imponer un esquema JSON fijo con bajo coste de inferencia.
- Punto de partida para nuevos ajustes LoRA en el mismo dominio: la receta (rango 16, escala 2.0, todas las capas, cuantizacion Q4_K_M) es replicable, aunque sus resultados no se transferiran a otros dominios sin reentrenamiento.
- Priorizacion por importancia: la clave `importance` permite ordenar una cola de documentos en funcion de su relevancia, aunque debe considerarse una senal auxiliar y no una decision final.
- (Aviso) Todos estos usos quedan limitados al ambito de documentos escolares coreanos similar al del conjunto sintetico; fuera de ahi el rendimiento no esta validado.

## Benchmarks y rendimiento

Evaluacion realizada con el mismo ejecutor llama.cpp b10883 sobre CPU, mismos argumentos, mismo JSON schema y mismo prompt de producto, en un Apple M2 Max con 8 hilos de CPU.

| Modelo | Estricto (200 casos ficticios) | 40 casos escritos a mano | 8 casos ficticios aparte | Mediana por caso |
|---|---:|---:|---:|---:|
| Qwen3.5-2B Q4_K_M (valor por defecto previo) | 22,5% | 20% | 4/8 | 2,84 s |
| Qwen3.5-0.8B original Q4_K_M | 3,5% | 0% | 1/8 | 1,61 s |
| Este modelo (LoRA Q4_K_M) | 58% | 70% | 8/8 | 1,33 s |

En la revision de los 40 casos escritos a mano, con el nombre del modelo oculto y comprobacion contra el texto original, las salidas directamente utilizables fueron 34 para este modelo y 8 para el de 2B; el total de errores principales fue de 10 frente a 50. El autor indica que la tasa de paso estricto es una puntuacion heuristica. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El archivo cuantizado a Q4_K_M ocupa 541.903.840 bytes (aproximadamente 0,5 GB), por lo que los pesos caben en cualquier equipo con mas de 1 GB de memoria libre.
- El escenario de referencia es CPU pura: el autor lanza llama-server con `-ngl 0` (cero capas en GPU) y 8 hilos, con una ventana de 4096 tokens.
- Rendimiento de referencia: mediana de 1,33 segundos por caso en un Apple M2 Max con 8 hilos de CPU. La velocidad en Windows no se midio.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, etc.) si se opta por descargar capas, aunque no es el modo previsto ni reportado.
- No hay datos publicados de VRAM especifica para inferencia en GPU; una estimacion razonable es del orden de 1 a 2 GB sumando pesos y cache de contexto a 4096 tokens, sin cifra confirmada por el autor.
- Opciones de despliegue: llama.cpp b10883 o superior y llama-server, en CPU, con plantilla Jinja (`--jinja`), `--chat-template-kwargs '{"enable_thinking":false}'` y presupuesto de razonamiento a cero. Tambien es interpretable por otras herramientas que consuman GGUF, aunque aquellas que no apliquen la plantilla Jinja o el JSON schema pueden degradar la calidad de la salida.
- No se dispone de datos de throughput agregado (tokens por segundo) ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (estricto / manual) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (klef-qwen3.5-0.8b-lora) | 772,8 M (0,8B) | No disponible (ejemplo a 4096) | 58% / 70% | Apache-2.0 | GGUF Q4_K_M |
| Qwen3.5-0.8B original | 0,8B (no confirmado en detalle) | Familia citada en ~32k en fuentes secundarias, sin confirmar | 3,5% / 0% | Apache-2.0 | Multiples repos GGUF y safetensors |
| Qwen3.5-2B | 2B (no confirmado en detalle) | No disponible | 22,5% / 20% | Apache-2.0 | Multiples repos GGUF y safetensors |

La comparacion relevante es que un adaptador LoRA sobre 0,8B supera en la tarea especifica tanto a su modelo base como a un modelo de 2B, con menor latencia por caso en el hardware medido. La ventaja es especifica de esta tarea (resumen JSON de documentos escolares coreanos) y no implica una superioridad general del modelo. No se dispone de comparativas con otros ajustes especializados en el mismo dominio.

## Limitaciones y advertencias

- El resumen lo produce un modelo de 0,8B: persisten distorsiones de hechos, omision de acciones, asignacion de tareas del profesorado al alumnado y omision de condiciones de elegibilidad. Las decisiones importantes deben verificarse contra el documento original.
- Entrenamiento y evaluacion integramente con documentos ficticios: la distribucion no representa la de documentos oficiales reales. La tasa de paso estricto es una puntuacion heuristica.
- Modelo especializado en resumen JSON de documentos de consulta publica; no fue entrenado para resumir paginas web ni para conversacion general.
- Idioma unico: coreano. No hay soporte documentado de castellano ni de otras lenguas.
- No se midio la velocidad en CPU de Windows; solo se reportan datos de Apple M2 Max.
- El modelo no dispone de datos de rendimiento sobre documentos reales ni validacion externa; cuenta con 0 descargas y 0 likes en el momento de la ficha.
- La licencia del modelo es Apache-2.0, heredada del modelo base, por lo que en principio no impone restricciones adicionales al uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B antes de un despliegue en produccion.
- En la model card se documenta la presencia de algun caso de inyeccion de prompt en los documentos largos del conjunto de entrenamiento, lo que implica un riesgo potencial de manipulacion del prompt en entradas adversarias.
- La longitud de contexto efectiva y el comportamiento mas alla de 4096 tokens no estan documentados para este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JUNGU/klef-qwen3.5-0.8b-lora-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio klef-collector: https://github.com/jkf87/klef-collector
- Receta de entrenamiento LoRA de bajo consumo con modelo base GGUF: https://github.com/woct0rdho/transformers5-qwen3.5-recipe
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b
- Ficha GGUF de Qwen3.5 0.8b en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-0-8b.html
- Guia de ejecucion local de Qwen3.5 0.8B en Medium: https://medium.com/@muhibuddin12/running-ai-on-your-laptop-a-step-by-step-guide-to-qwen3-5-0-8b-88d0bb56e368
- Conversion GGUF comunitaria del modelo base: https://huggingface.co/xvina/Qwen3.5-0.8B-GGUF
