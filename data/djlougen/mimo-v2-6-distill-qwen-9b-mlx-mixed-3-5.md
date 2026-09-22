# DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-3-5

## Resumen

MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-3-5 es una conversion de formato y cuantizacion del checkpoint XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (revision `f2773fb482ac3dd047a4af4003b86e56b7225d0d`) al formato de pesos MLX safetensors, publicada por el usuario DJLougen. No se trata de un entrenamiento nuevo: el modelo original es un ajuste fino supervisado (SFT) de Qwen/Qwen3.5-9B sobre datos de agente generados por MiMo, con enfasis en codigo, tareas de agente generales, codigo visual y ciberseguridad.

El checkpoint tiene 9.409.813.744 parametros y se distribuye con una receta de cuantizacion mixta denominada `mixed_3_5`, en la que 22 modulos se guardan a 5 bits y 228 modulos a 3 bits, con tamano de grupo 64 y modo affine. El resultado son 4,714 bits por peso segun el conversor mlx-vlm 0.7.2, con un repo de 5,6 GB. El modelo es multimodal (pipeline `image-text-to-text`) e incorpora una torre de vision Qwen3.5 que permanece en BF16 sin cuantizar.

Su relevancia es practica: permite ejecutar un modelo de ~9,4B con capacidades de agente y vision en entornos MLX con una huella de memoria muy reducida, a costa de una perdida de calidad perceptible en la receta de 3/5 bits. La ficha upstream no declara licencia, lo que condiciona cualquier uso comercial. No hay resultados de benchmarks publicados para esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal, `Qwen3_5ForConditionalGeneration` (`model_type: qwen3_5`) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (segun `config.json` del modelo upstream); atencion completa cada 4 capas |
| Tipos de cuantizacion | Receta mixta MLX `mixed_3_5`: 22 modulos a 5 bits y 228 modulos a 3 bits, grupo 64, modo affine; 4,714 bits/peso; torre de vision en BF16 |
| Idiomas soportados | No disponible (la model card upstream no declara lista de idiomas) |
| Licencia | No disponible (la model card upstream fijada no declara licencia) |
| Formato de pesos | MLX safetensors (1260 tensores en builds mixtos: peso, escalas y sesgos) |

## Arquitectura y entrenamiento

La arquitectura corresponde a `Qwen3_5ForConditionalGeneration`. La parte de texto tiene 32 capas, dimension oculta 4096, 16 cabezas de consulta y 4 cabezas de clave/valor (GQA con ratio 4:1), con atencion completa cada cuarta capa y una longitud de contexto configurada de 262.144 tokens. La parte de vision emplea una torre Qwen3.5 de profundidad 27, dimension oculta 1152 y patch de 16. La plantilla de chat es la del MiMo v2.6 upstream, distribuida en `chat_template.jinja`.

Conviene subrayar que este repositorio no implica ningun entrenamiento: es una conversion de pesos verificada contra los hashes SHA-256 LFS de los cuatro shards de origen, realizada con mlx-vlm 0.7.2 y mlx 0.32.2 (rueda CUDA 13) en una maquina NVIDIA GB10. El modelo upstream, segun su propia descripcion, es un ajuste fino supervisado de Qwen3.5-9B sobre datos de agente generados por MiMo (codigo, tareas de agente generales, codigo visual y ciberseguridad); no se documentan en la informacion disponible detalles sobre volumen de tokens, composicion del dataset, ni si hubo etapas de RLHF o DPO.

La innovacion tecnica del repositorio es la receta de cuantizacion mixta. Los 22 modulos que reciben mas bits son `embed_tokens` y `lm_head`, los `down_proj` de las capas 0, 1, 2, 3, 6, 9, 12, 15, 18, 21, 24, 27, 28, 29, 30 y 31, y los `v_proj` de las capas de atencion completa 3, 15, 27 y 31. El resto usa el ancho inferior. El autor advierte explicitamente que estos predicados son los integrados en mlx-vlm y no el resultado de una busqueda de sensibilidad, y que el campo `quantization.bits` de nivel superior vale 4 porque es el valor por defecto de la herramienta, no el realmente aplicado modulo a modulo.

## Capacidades

- Generacion de texto y razonamiento multi-paso, heredados del ajuste sobre datos de agente de MiMo.
- Generacion y comprension de codigo, incluyendo tareas de codigo visual.
- Entrada de imagen ademas de texto: pipeline `image-text-to-text` con torre de vision Qwen3.5.
- Plantilla de chat con soporte de modo de pensamiento (`enable_thinking`), tal como demuestra el smoke test.
- Conversacion multi-turno con contexto configurado de hasta 262.144 tokens.
- Aplicabilidad declarada por el autor upstream a tareas de ciberseguridad, ademas de codigo y agentes.
- Capacidades multilingues: no disponible; la informacion proporcionada no incluye lista de idiomas ni evaluacion multilingue.
- Tool calling / function calling y orquestacion de agentes: no disponible explicitamente en la informacion facilitada, aunque el ajuste sobre "datos de agente" sugiere ese perfil.

## Casos de uso

- Agentes de codigo en local sobre Apple Silicon: la cuantizacion a ~4,7 bits permite cargar un modelo de 9,4B con capacidades de agente en equipos con memoria unificada moderada, usando `mlx-vlm` como runtime.
- Asistente multimodal de escritorio: el modelo acepta imagen y texto, por lo que puede emplearse en herramientas que describan capturas de pantalla, diagramas o interfaces y respondan en lenguaje natural.
- Automatizacion de tareas de agente de varios pasos: dado el ajuste sobre datos de agente generados por MiMo, encaja en pipelines que encadenan planificacion, ejecucion de comandos y verificacion de resultados.
- Analisis de codigo y revision en entornos MLX: aprovecha la ventana de 262.144 tokens para procesar repositorios o ficheros extensos en una sola pasada, aunque con la perdida de precision propia de 3 bits en la mayoria de modulos.
- Prototipado e investigacion en vision-lenguaje: la torre de vision se mantiene en BF16, lo que conserva mejor la calidad de la rama visual que la rama de texto cuantizada.
- Soporte a tareas de ciberseguridad asistida: el autor upstream declara este dominio entre los datos de ajuste; puede usarse para triaje de alertas o resumen de informes, siempre con supervision humana.
- Despliegue de bajo coste en hardware unificado: por su tamano de pesos (~5,6 GB) es viable en equipos de consumo, sirviendo como alternativa local a APIs de modelos mayores.
- Evaluacion comparativa de recetas de cuantizacion: el mismo autor publica variantes mixt-3-6, mixed-3-8, mixed-4-6 y mixed-4-8, por lo que este repo sirve para estudiar el compromiso tamano-calidad en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que no se ejecuto perplejidad ni benchmark alguno, y que no se informan tasas de decodificacion ni memoria pico.

Lo unico documentado es una verificacion funcional (smoke test) con generacion greedy, `max_tokens=64` y `temperature=0.0`, sobre el prompt de texto `What is 15% of 240? Answer with the number only.`

| Build | Tipo | Supera | Salida |
|---|---|---|---|
| bf16 | texto | si | `36` |
| mixed-3-5 | texto | si | `<value>36</value>` |
| mixed-3-6 | texto | si | bloque de pensamiento y despues `36` |
| mixed-3-8 | texto | si | bloque de pensamiento y despues `36` |
| mixed-4-6 | texto | si | `36` |
| mixed-4-6 | imagen | si | `Red` |
| mixed-4-8 | texto | si | `36` |

Para esta receta concreta (mixed-3-5), la salida envolvio el resultado correcto en etiquetas `<value>`, lo que el autor clasifica como diferencia de calidad en ese unico prompt y no como fallo de carga. El smoke test con imagen solo se ejecuto en la variante mixed-4-6, con una imagen PNG roja de 64x64. El registro completo esta en `smoke-results.json` dentro del repositorio.

## Requisitos de hardware

- Pesos en disco y en memoria: aproximadamente 5,6 GB, coherente con 9.409.813.744 parametros a 4,714 bits por peso. Estimacion aritmetica a partir de los datos del conversor, no medida de memoria pico.
- Memoria adicional: hay que sumar cache KV y activaciones. Con 4 cabezas KV de dimension 256, cada token consume del orden de 4 KB por capa de atencion completa en BF16; a contextos largos la cache KV pasa a dominar el consumo. Estimacion propia, no reportada por el autor.
- GPU recomendadas: el repositorio esta pensado para MLX, es decir, Apple Silicon (familias M1 a M4 y posteriores) con memoria unificada. El autor reporta que la conversion y el smoke test se ejecutaron con la rueda CUDA 13 de mlx 0.32.2 sobre una NVIDIA GB10.
- Cabe en GPU de consumo: si, en el sentido de que el conjunto de pesos ocupa ~5,6 GB. En Apple Silicon se recomienda un minimo de 16 GB de memoria unificada y 24-32 GB para trabajar comodamente con contextos largos. En el camino CUDA, 8 GB de VRAM serian muy justos; 12-16 GB o mas son el rango razonable. Cifras estimadas.
- Opciones de despliegue: mlx-vlm (con mlx como runtime), tal como muestra el ejemplo de la model card. No hay pesos GGUF, por lo que llama.cpp, Ollama y LM Studio no son compatibles con este repositorio. Tampoco se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponible. La model card afirma explicitamente que no se reportan tasas de decodificacion ni memoria pico, y explica que las mediciones no serian representativas por ser llamadas en frio y con salidas de 3 a 64 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-3-5 | 9.409.813.744 | 262.144 | Mixta 3/5 bits, MLX safetensors, 5,6 GB | No disponible | HuggingFace, 0 descargas y 0 likes en el momento del registro |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | No disponible (mismo checkpoint de origen) | 262.144 (segun config heredada) | BF16, safetensors, 4 shards | No disponible | HuggingFace, checkpoint upstream publico |
| Qwen/Qwen3.5-9B | No disponible (~9B por denominacion) | No disponible | No disponible | No disponible | HuggingFace, modelo base del ajuste |

No se dispone en la informacion proporcionada de cifras de rendimiento, licencia ni contexto para las alternativas mas alla de lo indicado, por lo que la comparacion se limita a parametros, formato y procedencia. Otras variantes del mismo autor (mixed-3-6, mixed-3-8, mixed-4-6, mixed-4-8) parten del mismo checkpoint y solo difieren en la receta de cuantizacion.

## Limitaciones y advertencias

- Licencia no declarada: ni este repositorio ni la model card upstream fijada especifican licencia. El propio autor advierte que "redistribuye pesos convertidos de un checkpoint publico que no declara licencia". Esto constituye un riesgo legal relevante para cualquier uso comercial o redistribucion.
- Degradacion de calidad por cuantizacion: 228 de los 250 modulos cuantizados usan 3 bits. El smoke test muestra una anomalia concreta en esta variante (salida envuelta en `<value>`), lo que sugiere que la receta de 3/5 bits no es la mas conservadora de la familia.
- Los predicados de cuantizacion no provienen de un analisis de sensibilidad: son los integrados en mlx-vlm. No hay garantia de que los modulos a 3 bits sean los menos criticos para la calidad.
- Riesgo de alucinacion: no se ha medido con conjuntos como TruthfulQA ni con evaluaciones de fidelidad; el ajuste sobre datos de agente no elimina este riesgo, especialmente en tareas de codigo o ciberseguridad.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o comportamientos diferenciales por idioma o demografia.
- Idiomas: no disponible. Aunque el modelo base podria ser multilingue, no hay confirmacion ni evaluacion por idioma en la informacion facilitada.
- Comportamiento del modo de pensamiento: en el smoke test, las variantes mixed-3-6 y mixed-3-8 emitieron un bloque de pensamiento pese a que el prompt cerraba el modo `enable_thinking`. Con la variante mixed-3-5 no se observo ese caso, pero es un indicio de que la plantilla y el modo de pensamiento pueden desviarse tras la cuantizacion.
- Verificacion limitada: la validacion se reduce a un unico prompt de aritmetica y, en otra variante, a una imagen solida de un color. No hay evaluacion con imagen para esta receta concreta.
- Sin metricas de produccion: no se han publicado latencia, throughput, memoria pico ni perplejidad, por lo que no es posible dimensionar un despliegue en produccion con datos fiables.
- Dependencia de runtime: al ser un repo MLX, queda ligado al ecosistema mlx/mlx-vlm. No hay pesos GGUF, lo que excluye llama.cpp, Ollama y la mayoria de servidores de inferencia habituales.
- Fecha de creacion futura respecto al momento de redaccion (2026-09-21) y contadores de descargas y likes a cero: la ficha debe considerarse como un artefacto reciente y sin validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-3-5
- Modelo base upstream: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base del ajuste: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro de smoke test: `smoke-results.json` dentro del propio repositorio
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su arquitectura o sus benchmarks; los resultados obtenidos correspondian a ofertas de empleo sin relacion con el contenido solicitado.
