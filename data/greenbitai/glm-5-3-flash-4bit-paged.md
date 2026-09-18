# GreenBitAI/GLM-5.3-Flash-4bit-paged

## Resumen

GLM-5.3-Flash-4bit-paged es una build de cuantizacion de 4 bits publicada por GreenBitAI sobre el checkpoint `pipenetwork/GLM-5.3-Flash-MLX-4bit`. Se trata de un modelo multimodal (pipeline `image-text-to-text`) de arquitectura mixture-of-experts, distribuido en formato compatible con MLX y pensado para Apple Silicon. Su particularidad no es el modelo en si, sino el empaquetado: los pesos de los expertos enrutados viven en un contenedor aparte y se cargan bajo demanda, de modo que la maquina lee solo la fraccion que necesita en lugar de residentizar todo el modelo.

El repositorio se organiza en tres piezas: `model.safetensors` (5,89 GiB de pesos residentes), `experts.bin` (159,47 GiB de expertos enrutados) y `mtp/` (3,90 GiB de cabeza de prediccion multi-token, desactivada por defecto). El total declarado es de 169,27 GiB. La build incorpora tambien la cabeza MTP convertida desde `zai-org/GLM-5.3-Flash`, lo que habilita decodificacion especulativa desde el propio repositorio, con incrementos medidos de hasta 1,41x en contextos largos sobre un Mac Studio M3 Ultra de 512 GB.

Es relevante ahora porque ataca el cuello de botella real de los MoE grandes en hardware de memoria unificada: no el computo, sino la residencia de pesos. La estrategia de paginacion por expertos permite ejecutar un modelo cuyo conjunto de expertos no cabe comodamente en memoria, a cambio de streaming desde disco. La licencia es MIT y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) multimodal, familia GLM-5.3-Flash; 42 capas segun la validacion del build |
| Parametros totales | 9.484.631.870 declarados en safetensors (ver advertencias: no cuadra con el tamano del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se miden rendimientos con contextos de 715, 2.854 y 11.317 tokens, sin declarar el maximo) |
| Tipos de cuantizacion | 4 bits (build MLX-4bit de origen); se desconoce si hay otras variantes en el repo |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos residentes), `.bin` (expertos enrutados), `mtp/` (cabeza draft); sin GGUF |
| Libreria | gbx-lm |
| Tamano del repositorio | 181,8 GB |
| Fecha de creacion / actualizacion | 2026-09-01 / 2026-09-17 |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento del modelo original: no hay numero de tokens, composicion del dataset ni detalle de fases de RLHF o DPO. Lo que si se describe es el proceso de conversion y validacion de este build. Los pesos provienen de `pipenetwork/GLM-5.3-Flash-MLX-4bit` y no se recuantizan: cuantizacion, tokenizer, plantilla de chat y licencia se mantienen sin cambios respecto al checkpoint fuente.

La innovacion tecnica es el empaquetado con paginacion de expertos. Los pesos que se leen fraccionadamente se aislan en contenedores propios (`experts.bin`), de modo que el runtime decide en funcion de la maquina si los mantiene residentes o los lee por streaming desde disco, sin necesidad de flags. La comprobacion de integridad se hizo en tiempo de build, mientras el checkpoint original seguia disponible para comparar: validacion capa por capa de 42 capas x 2 muestras, exacta, con un pico de 60,93 GiB durante esa fase. El interruptor `GBX_PAGING=off` fuerza el modo residente.

El segundo componente diferencial es la cabeza de prediccion multi-token (`mtp/`), convertida desde `zai-org/GLM-5.3-Flash` y no presente en ninguna otra build publicada del modelo. Se activa con `GBX_GLM53_MTP=on` y habilita decodificacion especulativa: la cabeza propone tokens y el modelo los verifica, de modo que la salida es la del modelo en cualquier caso y el beneficio es puramente de pasadas sobre los pesos.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`), segun el pipeline declarado.
- Razonamiento de multiples pasos mediante la cabeza de prediccion multi-token, que acelera la decodificacion en contextos largos.
- Decodificacion especulativa autoalojada: la cabeza draft viaja en el propio repositorio, sin dependencias externas.
- Carga selectiva de expertos: el modelo decide en tiempo de ejecucion entre modo residente y streaming desde disco.
- Servido como API mediante `python -m gbx_lm.fastapi_server`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente, thinking mode o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE multimodal en estaciones de trabajo Apple Silicon con memoria unificada grande: el modo de paginacion permite arrancar el modelo sin que los 159,47 GiB de expertos tengan que caber de golpe, ajustando el uso de memoria al patron real de enrutamiento.
- Servicio conversacional multilingue en ingles y chino: la build expone un servidor FastAPI propio (`gbx_lm.fastapi_server`) que puede envolverse en un API interno para atencion al usuario final.
- Procesamiento de documentos con imagen y texto: el pipeline `image-text-to-text` permite tareas de descripcion, extraccion o pregunta-respuesta sobre capturas, diagramas o paginas escaneadas acompanadas de instrucciones textuales.
- Investigacion sobre enrutamiento de expertos: al disponer de los expertos en un contenedor separado y de una validacion capa por capa publicada, el repositorio sirve para estudiar que expertos se activan y como afecta el streaming a la latencia.
- Evaluacion de decodificacion especulativa: la cabeza MTP con estadisticas de aceptacion (65%-78% segun contexto) permite reproducir experimentos de speculative decoding sobre hardware de memoria unificada.
- Generacion de texto con contexto largo en local: con 27-38 tok/s en un M3 Ultra de 512 GB y ventanas de mas de 11.000 tokens medidas, es viable para resumen o analisis de documentos largos sin salir del equipo.
- Entornos con requisitos de licencia permisiva: la licencia MIT facilita la integracion en productos propietarios, sujeto a las condiciones del checkpoint fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico rendimiento medido son las tasas de decodificacion de la cabeza MTP, tomadas el 2026-09-18 sobre un Mac Studio de 512 GB (M3 Ultra), con decodificacion greedy y cronometraje desde el primer token, para la misma build en ambas columnas:

| Contexto (tokens) | Cabeza MTP off | Cabeza MTP on | Aceleracion | Tokens aceptados |
|---|---|---|---|---|
| 11.317 | 27,1 tok/s | 38,3 tok/s | 1,41x | 78% |
| 2.854 | 27,5 tok/s | 35,7 tok/s | 1,30x | 76% |
| 715 | 31,6 tok/s | 31,8 tok/s | 1,01x | 65% |

A traves del servidor, con preguntas de tipo conversacional, la tasa de aceptacion se situa entre el 63% y el 75%. La model card atribuye el escaso margen en contextos cortos a que la cabeza dispone de poca informacion sobre la que predecir.

## Requisitos de hardware

- Almacenamiento: 169,27 GiB de artefactos (5,89 GiB residentes + 159,47 GiB de expertos + 3,90 GiB de cabeza MTP); el repositorio ocupa 181,8 GB. El streaming desde disco exige almacenamiento rapido, ya que condiciona directamente la latencia.
- Memoria: la plataforma de referencia medida es un Mac Studio con M3 Ultra y 512 GB de memoria unificada. El modo `GBX_PAGING=off` mantiene todos los expertos residentes y por tanto requiere memoria suficiente para los 159,47 GiB de expertos mas el resto.
- Pico durante la validacion de build: 60,93 GiB en la comprobacion layer-wise de 42 capas.
- GPU consumer: no disponible. No hay datos de ejecucion en RTX 4090 u otras GPU consumer, y el repositorio esta orientado explicitamente a Apple Silicon y MLX (`mlx`, `apple-silicon`).
- GPU de datacenter (A100, H100): no disponible. La informacion proporcionada no cubre despliegue en CUDA.
- Opciones de despliegue: `gbx_lm.utils.load` para uso programatico, `python -m gbx_lm.generate` para generacion por linea de comandos y `python -m gbx_lm.fastapi_server` para servido HTTP. Soporte de vLLM, TGI, llama.cpp u Ollama: no disponible.
- Latencia y throughput: 27,1-31,6 tok/s sin cabeza MTP y 31,8-38,3 tok/s con ella en M3 Ultra de 512 GB, segun el contexto.

## Comparativa con modelos similares

Solo se dispone de datos verificables para las builds de la misma familia. No hay informacion sobre alternativas de otros autores en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GreenBitAI/GLM-5.3-Flash-4bit-paged | 9,48 mil millones declarados (ver advertencias) | no disponible | 27,1-38,3 tok/s en M3 Ultra 512 GB | MIT | HuggingFace, libreria gbx-lm |
| pipenetwork/GLM-5.3-Flash-MLX-4bit (build fuente) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| zai-org/GLM-5.3-Flash (modelo original) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Diferencias conocidas frente a la build fuente: la version paginada separa los expertos en `experts.bin`, no copia bytes sino que los reubica en contenedores, y anade la cabeza MTP (3,90 GiB) que ninguna build publicada del modelo incluye.

## Limitaciones y advertencias

- El dato de parametros totales declarado (9.484.631.870) es coherente con el fichero de pesos residentes (5,89 GiB en 4 bits) pero no con los 159,47 GiB de expertos enrutados. Es probable que esa cifra no refleje el total real del modelo, por lo que conviene tratarla con cautela.
- Cabeza MTP desactivada por defecto: sin `GBX_GLM53_MTP=on` no se obtiene ninguna aceleracion, y el coste de cargarla (3,90 GiB) no compensa en contextos cortos (1,01x a 715 tokens).
- La ganancia de la decodificacion especulativa depende del contexto: crece con ventanas largas y es practicamente nula con prompts breves.
- El rendimiento medido corresponde a una unica plataforma (M3 Ultra, 512 GB) y a decodificacion greedy; no hay datos de otras configuraciones, de batching o de cargas concurrentes.
- El modo de streaming desde disco depende de la velocidad del almacenamiento; sobre discos lentos o con acceso por red la latencia puede degradarse de forma severa.
- Idiomas soportados limitados a ingles y chino. No hay evidencia de calidad en castellano ni en otras lenguas.
- Longitud maxima de contexto no declarada; los mayores valores probados son de 11.317 tokens, por lo que no se debe asumir una ventana mayor.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- Soporte de tool calling y de flujos de agente no documentado: no conviene asumirlo en produccion sin verificacion previa.
- La licencia del build es MIT, pero al derivar de un checkpoint cuantizado de terceros conviene revisar las condiciones del modelo original antes de un uso comercial.
- Proyecto con 474 descargas y 0 likes: ecosistema y validacion comunitaria muy limitados, sin garantias de mantenimiento.
- La model card no documenta el pipeline de entrenamiento, el dataset ni los parametros activos por token, lo que dificulta estimar coste computacional por inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GreenBitAI/GLM-5.3-Flash-4bit-paged
- Modelo base declarado: pipenetwork/GLM-5.3-Flash-MLX-4bit (referenciado en la model card, sin URL directa proporcionada)
- Modelo original del que se convierte la cabeza MTP: zai-org/GLM-5.3-Flash (referenciado en la model card, sin URL directa proporcionada)
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
- Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces recuperados corresponden a productos no relacionados y se han descartado.
