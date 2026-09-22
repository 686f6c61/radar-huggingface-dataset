# DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-4-8

## Resumen

MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-4-8 es una conversion de formato y cuantizacion del checkpoint XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (revision `f2773fb482ac3dd047a4af4003b86e56b7225d0d`) a safetensors de MLX con una receta mixta de 4 y 8 bits. La publica el usuario DJLougen, no el autor original del modelo, y no constituye un entrenamiento nuevo: es una redistribucion de pesos convertida con mlx-vlm 0.7.2 y mlx 0.32.2 sobre una maquina NVIDIA GB10. El modelo subyacente lo desarrollo Xiaomi (organizacion XiaomiMiMo) como un ajuste supervisado de Qwen/Qwen3.5-9B sobre datos de agente generados por MiMo en los dominios de codigo, tareas de agente generales, codigo visual y ciberseguridad.

Arquitectonicamente es un modelo multimodal de 9.409.813.744 parametros (aproximadamente 9.4B, denso, sin mezcla de expertos declarada) con torre de vision, plantilla de chat de MiMo v2.6 y una ventana de contexto configurada de 262.144 tokens. El interes practico de este repositorio concreto es que empaqueta el modelo en un formato ejecutable en Apple Silicon mediante MLX con un peso medio reportado de 6,273 bits por parametro, lo que reduce el espacio en disco y en memoria hasta unos 7,4 GB de repositorio para un modelo de casi 9.4B de parametros y capacidad de entrada de imagen.

Es relevante ahora por dos motivos: primero, permite ejecutar un modelo multimodal de ~9B con contexto muy largo fuera de CUDA, en equipos con memoria unificada; segundo, sirve como referencia de las recetas de cuantizacion mixta de mlx-vlm, que preservan en BF16 la torre de vision y suben a 8 bits determinados modulos sensibles (embeddings, `lm_head`, `down_proj` de 16 capas y `v_proj` de las capas de atencion completa). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card upstream no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (tipo de modelo `qwen3_5`), transformer multimodal con torre de vision; atencion completa cada 4 capas |
| Parametros totales | 9.409.813.744 (dato real de los safetensors) |
| Parametros activos | no aplica: no se describe como MoE |
| Longitud de contexto | 262.144 tokens (valor de configuracion) |
| Tipos de cuantizacion | MLX mixta 4/8 bits, grupo 64, modo affine; 22 modulos a 8 bits y 228 modulos a 4 bits; media reportada por el conversor de 6,273 bits por peso; la torre de vision permanece en BF16. La familia incluye ademas builds `bf16`, `mixed-3-5`, `mixed-3-6`, `mixed-3-8` y `mixed-4-6` |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card upstream de la que se deriva no declara licencia) |
| Formato de pesos | safetensors de MLX (1260 tensores en builds mixtos; 760 en BF16) |
| Tamano del repositorio | 7,4 GB |
| Libreria de inferencia | mlx / mlx-vlm (probado con mlx-vlm 0.7.2 y mlx 0.32.2, wheel CUDA 13) |
| Pipeline declarado | image-text-to-text |
| Plantilla de chat | plantilla MiMo v2.6 incluida en `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo `Qwen3_5ForConditionalGeneration`. La rama de texto tiene 32 capas, dimension oculta 4096, 16 cabezas de consulta y 4 cabezas de clave/valor (agrupacion GQA con ratio 4:1), con atencion completa solo cada cuarta capa; la informacion disponible no detalla que mecanismo usan las capas intermedias, por lo que no se puede confirmar si son de atencion lineal, ventana deslizante u otro esquema hibrido. La torre de vision es la de Qwen3.5, con profundidad 27, dimension oculta 1152 y tamano de parche 16. La plantilla de chat corresponde a MiMo v2.6.

En cuanto al entrenamiento, la model card de este repositorio indica que el checkpoint upstream es un ajuste supervisado (SFT) de Qwen/Qwen3.5-9B sobre datos de agente generados por MiMo, en cuatro dominios declarados: codigo, tareas de agente generales, codigo visual y ciberseguridad. No se declaran el numero de tokens, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. Este repositorio en concreto no entrena nada: solo convierte y cuantiza. La receta de cuantizacion aplica predicados internos de mlx-vlm, no una busqueda de sensibilidad por capa: los 22 modulos que se elevan a 8 bits son `embed_tokens` y `lm_head`, la `down_proj` de las capas 0, 1, 2, 3, 6, 9, 12, 15, 18, 21, 24, 27, 28, 29, 30 y 31, y la `v_proj` de las capas de atencion completa 3, 15, 27 y 31. El predicado omite los modulos multimodales, de ahi que la torre de vision quede en BF16. Los cuatro shards de origen se verificaron contra los hashes SHA-256 de LFS del Hub antes de la conversion.

## Capacidades

- Generacion de texto conversacional multi-turno, con la plantilla de chat de MiMo v2.6.
- Razonamiento con modo de pensamiento: la plantilla admite `enable_thinking`, y en las pruebas de humo los builds `mixed-3-6` y `mixed-3-8` emitieron bloques de pensamiento incluso con el pensamiento desactivado.
- Entrada de imagen y texto (pipeline `image-text-to-text`), con torre de vision de 27 capas que permanece en BF16 en esta cuantizacion.
- Generacion de codigo: el SFT upstream se hizo sobre datos de agente que incluyen codigo.
- Codigo visual: el dataset de destilacion incluye explicitamente tareas de codigo a partir de imagenes.
- Tareas de agente generales y multi-paso, segun los dominios declarados del entrenamiento upstream.
- Contenido de ciberseguridad, tambien declarado como dominio del dataset de destilacion.
- Contexto largo de hasta 262.144 tokens de configuracion, adecuado para documentos extensos o historiales largos.
- Capacidades multilingues: no disponible; no se declara lista de idiomas en ninguna de las dos fichas.
- Soporte de tool calling / function calling: no disponible; no se documenta en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: es el caso de uso principal de este repositorio. Con ~7,4 GB de pesos en formato MLX mixto 4/8 bits, el modelo se puede cargar con `mlx_vlm.load` y generar con `mlx_vlm.generate` en equipos de memoria unificada, sin depender de CUDA.
- Analisis de documentos largos con imagen: la combinacion de 262.144 tokens de contexto y entrada de imagen permite procesar informes escaneados, capturas de paneles o diagramas junto con texto extenso en una sola llamada, siempre que la memoria lo permita.
- Asistente de codigo a partir de capturas o mockups: el SFT upstream incluye codigo visual, de modo que el modelo puede recibir una imagen de interfaz o de un fragmento de codigo y producir codigo o explicaciones.
- Agente conversacional de varios pasos: el entrenamiento sobre datos de agente generados por MiMo apunta a tareas encadenadas; se puede usar como nucleo de un bucle de agente, aunque el soporte de tool calling no esta documentado y habria que construirlo por prompt.
- Prototipado de pipelines multimodales en MLX: util para validar una arquitectura image-text-to-text y una receta de cuantizacion mixta antes de invertir en despliegue sobre GPU, gracias a la verificacion de hashes y al log de pruebas de humo incluido.
- Extraccion y resumen de informacion en historiales largos: turnos de conversacion o registros que superen los 100.000 tokens caben en la ventana configurada, lo que evita trocear el contexto y perder coherencia entre fragmentos.
- Evaluacion de calidad de cuantizaciones: al existir builds `bf16`, `mixed-3-5`, `mixed-3-6`, `mixed-3-8`, `mixed-4-6` y `mixed-4-8` del mismo checkpoint, el repositorio sirve para comparar el efecto de distintas recetas sobre un mismo prompt, como ya hace el log de pruebas de humo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las cifras de benchmark del modelo upstream no se volvieron a ejecutar y que no se midio perplejidad. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos eran noticias en tamil sobre un caso judicial, sin relacion alguna).

Lo unico disponible son pruebas de humo (una generacion greedy por build, `max_tokens=64`, `temperature=0.0`), que no equivalen a una evaluacion de rendimiento:

| Build | Tipo de entrada | Pasa | Salida |
|---|---|---|---|
| `bf16` | texto | si | `36` |
| `mixed-3-5` | texto | si | `<value>36</value>` |
| `mixed-3-6` | texto | si | bloque de pensamiento y despues `36` |
| `mixed-3-8` | texto | si | bloque de pensamiento y despues `36` |
| `mixed-4-6` | texto | si | `36` |
| `mixed-4-6` | imagen | si | `Red` |
| `mixed-4-8` | texto | si | `36` |

El prompt de texto fue `What is 15% of 240? Answer with the number only.` y el de imagen, un PNG rojo solido de 64x64 con la pregunta `What color is the square in the image? Answer with one word.`. No se reportan tasas de decodificacion ni memoria pico; la model card justifica esta ausencia indicando que la llamada BF16 fue en frio, que las salidas posteriores fueron de 3 a 64 tokens y que la memoria pico se quedo en el maximo del proceso BF16. El log completo esta en `smoke-results.json`.

## Requisitos de hardware

- Pesos en esta build: 7,4 GB de repositorio, coherente con la media declarada de 6,273 bits por peso sobre 9.409.813.744 parametros (calculo derivado: 9,41e9 x 6,273 / 8 ≈ 7,38 GB). Es una estimacion aritmetica, no una medida.
- Estimaciones por cuantizacion, calculadas a partir del numero de parametros y sin incluir cache KV ni activaciones: BF16 ≈ 18,8 GB; 8 bits ≈ 9,4 GB; 4 bits ≈ 4,7 GB; esta mezcla 4/8 ≈ 7,4 GB. Hay que sumar el coste de la torre de vision, que se mantiene en BF16 y no se reduce con la cuantizacion.
- Memoria unificada de Apple Silicon: el formato MLX es la via documentada para esta build. Con ~7,4 GB de pesos, un equipo de 16 GB de memoria unificada es el minimo razonable para contexto corto; para aprovechar los 262.144 tokens de contexto hace falta bastante mas margen.
- GPU NVIDIA: la conversion y las pruebas de humo se ejecutaron en una NVIDIA GB10 con la wheel CUDA 13 de mlx 0.32.2. No hay datos publicados para A100, H100 o RTX 4090 en esta build.
- Cabe en GPU de consumo: no confirmado para esta build. En BF16 (≈18,8 GB) no cabe en GPUs de 16 GB; las variantes de 4 bits podrian ajustarse en GPUs de 24 GB, pero no hay verificacion publicada.
- Opciones de despliegue: mlx-vlm (unica documentada, con el fragmento de codigo de la model card). vLLM, llama.cpp, Ollama o TGI no estan confirmados para este repositorio.
- Latencia y throughput: no disponibles. La model card indica expresamente que no se reportan tasas de decodificacion ni memoria pico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (`mixed-4-8`) | 9,41B | 262.144 | MLX mixta 4/8 bits, 6,273 bits/peso reportados | no disponible | 22 modulos a 8 bits, 228 a 4 bits, vision en BF16; 0 descargas |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9,41B (derivado: es el checkpoint de origen) | 262.144 | BF16 | no disponible | Modelo upstream de Xiaomi; SFT de Qwen3.5-9B sobre datos de agente |
| Qwen/Qwen3.5-9B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | no disponible | Base del ajuste supervisado segun la model card |
| Builds hermanos (`bf16`, `mixed-3-5`, `mixed-3-6`, `mixed-3-8`, `mixed-4-6`) | 9,41B | 262.144 | BF16 y mezclas 3/5, 3/6, 3/8, 4/6 | no disponible | Mismo checkpoint; en las pruebas de humo `mixed-3-5` envolvio la respuesta en `<value>` y `mixed-3-6` y `mixed-3-8` emitieron bloque de pensamiento |

No se dispone de alternativas externas documentadas en la informacion proporcionada, ni de resultados de benchmarks que permitan una comparacion de rendimiento con otros modelos multimodales de tamano similar.

## Limitaciones y advertencias

- Licencia no declarada: la model card upstream no especifica licencia y este repositorio redistribuye pesos convertidos de ese checkpoint publico. No hay base explicita para uso comercial; conviene aclarar los terminos con el autor original antes de cualquier despliegue en produccion.
- El repositorio lo publica un tercero, no el autor del modelo. La fidelidad de la conversion se respalda con la verificacion SHA-256 de los cuatro shards de origen, pero no hay validacion independiente de los pesos convertidos.
- La cuantizacion usa los predicados internos de mlx-vlm, no una busqueda de sensibilidad por capa. La propia model card lo indica: los 22 modulos elevados a 8 bits son una heuristica de la herramienta, no el resultado de un analisis.
- No se ha medido perplejidad ni se han ejecutado benchmarks. Las unicas pruebas realizadas son generaciones greedy de 64 tokens sobre un prompt aritmetico y uno de color.
- Diferencias de comportamiento entre builds con el mismo checkpoint: `mixed-3-5` devolvio la respuesta envuelta en etiquetas `<value>` y `mixed-3-6` y `mixed-3-8` emitieron un bloque de pensamiento pese a que el prompt cerraba el modo pensamiento. La model card lo describe como diferencia de calidad en ese unico prompt, pero es una senal de que la cuantizacion afecta al formato de salida.
- La torre de vision no se cuantiza y permanece en BF16: el ahorro de memoria respecto a BF16 es menor de lo que sugiere la media de bits por peso.
- Memoria pico y tasas de decodificacion no reportadas; no se puede planificar capacidad de produccion con estos datos.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Al ser un modelo ajustado para tareas de agente y generacion de codigo, la salida puede ser plausible pero incorrecta sin verificacion.
- Idiomas: no se declara ninguna lista de idiomas soportados en ninguna de las dos fichas. No hay garantia de cobertura multilingue.
- Contexto: la configuracion declara 262.144 tokens, pero no hay medicion de rendimiento real a esa longitud ni datos sobre el coste de cache KV, especialmente porque solo una de cada cuatro capas usa atencion completa.
- Dominio de ciberseguridad: el dataset de destilacion incluye contenido de esta area. Es un doble uso que exige controles de uso responsable en despliegues abiertos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas se hayan detectado y corregido por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-4-8
- Modelo base upstream: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo del que parte el ajuste supervisado, citado en la model card: https://huggingface.co/Qwen/Qwen3.5-9B
- Revision exacta del checkpoint de origen: `f2773fb482ac3dd047a4af4003b86e56b7225d0d`
- Log de pruebas de humo: `smoke-results.json` dentro del propio repositorio
- La busqueda web realizada no devolvio ningun enlace relacionado con el modelo; los resultados obtenidos no guardan relacion con el tema.
