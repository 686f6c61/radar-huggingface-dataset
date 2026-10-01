# numsu/AREX-2-27B-INT4-W4A16

## Resumen

AREX-2-27B-INT4-W4A16 es un checkpoint cuantizado del modelo multimodal BAAI/AREX-2, publicado por el usuario numsu. El modelo original es un sistema de 27.356.728.560 parámetros (unos 27,36 mil millones) orientado a tareas de agente de horizonte largo, con pipeline `image-text-to-text` y una longitud de contexto nativa declarada de 262.144 tokens. La model card lo describe como compatible con Qwen3.8, mientras que las etiquetas del repositorio indican `qwen3_5`, una discrepancia que conviene tener presente.

Esta ficha cubre exclusivamente la exportación INT4: cuantización simétrica de solo pesos (W4A16) con tamaño de grupo 128, redondeo al más cercano (RTN) y sin calibración, aplicada a 400 matrices `Linear` bidimensionales. El repositorio ocupa 18,6 GB en safetensors y está empaquetado en formato `compressed-tensors` para vLLM; no es un GGUF. La torre de visión, los embeddings de tokens, la cabeza de salida y las compuertas recurrentes GDN se conservan a la precisión del checkpoint original.

Su relevancia práctica es acotada pero concreta: permite servir un modelo multimodal de 27B con contexto muy largo en 2×RTX 3090 mediante paralelismo tensorial 2, algo fuera del alcance del BF16 original en ese hardware. Como contrapartida, se trata de una cuantización numérica sin evaluación de calidad asociada, con 0 descargas y 0 "me gusta" en el momento de la consulta, y cuyo alcance de validación se limita a una prueba de humo de chat de texto y a una matriz sintética de servicio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; modelo multimodal compatible con Qwen3.8 segun la model card (etiqueta del repo: `qwen3_5`), con compuertas recurrentes GDN preservadas a precision original |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No procede: no se declara arquitectura MoE en la informacion disponible |
| Longitud de contexto | 262.144 tokens declarados en el modelo original; probado hasta 128.003 tokens de prompt mas 1.024 tokens generados |
| Tipos de cuantizacion | Esta exportacion: INT4 simetrica W4A16, grupo 128, RTN, sin calibracion. Otras variantes: no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con `compressed-tensors` / `pack-quantized` (no es GGUF) |
| Modelo base | BAAI/AREX-2, revision `d4e3502f92d9e889031c2d04e387ab2eb3520268` |
| Autor de la cuantizacion | numsu (cuantizacion numerica, no es un fine-tune) |
| Tamano del repositorio | 18,6 GB (payload de tensores indexado: 18,60 GB / 17,33 GiB) |
| Almacenamiento de escalas | FP16 |
| Kernel en tiempo de ejecucion | `CompressedTensorsWNA16` -> `MarlinLinearKernel` (en el runtime probado) |
| Error de reconstruccion L2 relativo | 0,12160 (diagnostico de espacio de pesos) |

## Arquitectura y entrenamiento

Este repositorio no aporta arquitectura ni entrenamiento propios: es una cuantizacion numerica de `BAAI/AREX-2` exportada desde la revision oficial `d4e3502f92d9e889031c2d04e387ab2eb3520268`. El credito de arquitectura, datos de entrenamiento y evaluacion del modelo upstream corresponde a BAAI y a los contribuidores originales. La informacion disponible no detalla la composicion del dataset, el numero de tokens de entrenamiento ni si hubo etapas de RLHF, DPO u optimizacion por preferencias, por lo que esos datos deben considerarse no disponibles.

Lo que si puede deducirse del perfil de cuantizacion es la estructura del checkpoint: se cuantizaron 400 pesos `Linear` bidimensionales, quedando excluidos de la cuantizacion la torre de vision, los embeddings de tokens, la cabeza de salida, las compuertas recurrentes GDN y otros tensores no lineales. La mencion explicita a compuertas recurrentes GDN apunta a componentes de atencion lineal o recurrentes de tipo Gated Delta Net, sin que la informacion disponible confirme la arquitectura completa. El checkpoint base no contiene tensores MTP, de modo que cualquier drafter de decodificacion especulativa debe aportarse por separado.

La innovacion tecnica relevante en este artefacto es la cuantizacion en si: INT4 simetrica de solo pesos con grupo de 128 y RTN, despachada al kernel Marlin de vLLM, con reglas de exclusion heredadas del perfil W8A16 ya validado. El autor reporta que se mantuvo activada una decodificacion especulativa externa con un drafter DFlash2 W4A16 (7 tokens de borrador, techo de verificacion de 15 tokens, con lookup y cadenas activados) durante las mediciones de servicio, pero ese drafter no se incluye en el repositorio.

## Capacidades

- Generacion de texto conversacional: verificado con una prueba de humo de chat de texto corto en la imagen de despliegue vLLM 0.29.0 sobre 2×RTX 3090.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y la torre de vision se conserva a precision original. No se ha ejecutado ninguna evaluacion multimodal sobre este checkpoint.
- Razonamiento: declarado mediante la etiqueta `reasoning` del repositorio. Sin evaluacion publicada.
- Uso de herramientas y function calling: declarado mediante las etiquetas `tool-use` y `agent`. Sin evaluacion publicada.
- Flujos de agente de horizonte largo: el modelo upstream esta orientado a este escenario y declara 262.144 tokens de contexto nativo.
- Contexto largo: se han medido peticiones de hasta 128.003 tokens de prompt con 1.024 tokens generados; el limite configurado de 262.144 tokens no se probo.
- Decodificacion especulativa: soportada mediante drafter externo (no incluido en el repositorio).
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito ("thinking mode"), audio u otras modalidades: no disponible en la informacion consultada.

## Casos de uso

- Agentes de codigo sobre repositorios completos: con 262.144 tokens de contexto declarados, el modelo puede ingerir varios ficheros fuente y el historial de interacciones en una sola ventana, lo que resulta adecuado para tareas de refactorizacion o revision que requieren correlacionar simbolos entre modulos. La cuantizacion INT4 permite ejecutarlo en 2×RTX 3090, un hardware asequible frente a las alternativas de 80 GB.
- Analisis de documentacion tecnica extensa: informes, normativa o manuales de cientos de paginas caben en la ventana configurada, permitiendo preguntas con citas sobre el material sin troceado previo ni recuperacion externa. Requiere validar previamente la calidad de la cuantizacion para tareas de extraccion fina.
- Automatizacion de flujos con tool calling: las etiquetas `tool-use` y `agent` indican soporte previsto para invocacion de funciones; encaja en orquestadores que encadenan llamadas a APIs, consultas a bases de datos y ejecucion de comandos en varios pasos.
- Procesamiento de capturas, diagramas o interfaces: al conservar la torre de vision a precision original, el checkpoint puede emplearse para describir o extraer informacion de imagenes en pipelines `image-text-to-text`. No obstante, no se ha ejecutado ninguna evaluacion multimodal, por lo que su uso en produccion exigiria una validacion propia.
- Despliegue on-premise con presupuesto de GPU limitado: el perfil validado (2×RTX 3090, TP=2, KV cache FP8 E4M3 y 28 GiB de offload de KV a CPU) demuestra que el modelo cabe en hardware de consumo profesional sin recurrir a A100 o H100.
- Investigacion sobre cuantizacion post-entrenamiento: el checkpoint sirve como caso de estudio de cuantizacion INT4 sin calibracion con kernel Marlin, con una metrica de reconstruccion L2 publicada (0,12160) que permite comparar metodologias de cuantizacion sobre el mismo modelo base.
- Atencion al cliente multi-turno: tecnicamente viable por la ventana de contexto, pero el perfil medido limita el maximo de secuencias activas a 1, lo que restringe severamente la concurrencia y lo hace poco adecuado para atencion directa a usuarios sin un redimensionado previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha ejecutado ninguna evaluacion de calidad ni comparacion contra la fuente BF16, y advierte de que los resultados del modelo BF16 upstream no miden este checkpoint INT4.

La unica metrica de fidelidad publicada es el error de reconstruccion L2 relativo agregado sobre los pesos cuantizados: 0,12160. Se trata de un diagnostico de espacio de pesos, no de perplejidad, acuerdo de logits o KLD, ni de una puntuacion de calidad de tarea.

## Requisitos de hardware

- Pesos del modelo: 18,60 GB (17,33 GiB) de payload de tensores indexado.
- Configuracion validada por el autor: 2×RTX 3090 (Ampere, `sm_86`), paralelismo tensorial 2, activaciones BF16, KV cache en FP8 E4M3 y offload de KV a CPU de 28 GiB mediante un backport de vLLM.
- Memoria de GPU observada tras sondas cortas: 16.784 MiB en uso y 7.394 MiB libres por GPU. Es la asignacion completa del proceso de servicio, no solo los pesos.
- Secuencias activas maximas en el perfil probado: 1.
- GPU consumer: si, cabe en 2×RTX 3090 con TP=2 segun la validacion del autor. El comportamiento en una unica GPU consumer de 24 GB no esta documentado en la informacion disponible.
- Opciones de despliegue: vLLM con soporte de `compressed-tensors`, probado en la imagen 0.29.0. Al no ser GGUF, llama.cpp y Ollama no son compatibles con este artefacto. El soporte en TGI no esta documentado.
- Latencia y throughput medidos (prompts sinteticos con sal, dos ejecuciones en frio por celda, medianas; TTFT es el tiempo hasta el primer token transmitido):

| Tokens de prompt | Tokens nuevos | TTFT mediana (s) | Prefill (tok/s) | Decode mediana (tok/s; min-max) |
|---:|---:|---:|---:|---:|
| 1.027 | 512 | 0,69 | 1.479 | 225,6 (191,3-260,0) |
| 1.028 | 1.024 | 0,71 | 1.450 | 149,0 (88,0-209,9) |
| 8.194 | 512 | 5,73 | 1.430 | 109,8 (75,9-143,7) |
| 8.196 | 1.024 | 5,79 | 1.416 | 266,2 (253,9-278,4) |
| 32.002 | 512 | 25,17 | 1.273 | 66,4 (65,2-67,7) |
| 32.002 | 1.024 | 28,71 | 1.115 | 125,0 (63,3-186,8) |
| 64.002 | 512 | 74,38 | 861 | 78,5 (56,7-100,3) |
| 64.002 | 1.024 | 77,99 | 821 | 89,8 (57,6-122,0) |
| 128.002 | 512 | 180,24 | 710 | 42,6 (39,3-45,9) |
| 128.003 | 1.024 | 183,37 | 698 | 84,0 (81,6-86,4) |

Estas cifras corresponden a una matriz de servicio sintetica con el drafter DFlash2 activado y no constituyen una evaluacion de calidad. El prompt mas largo probado tenia 128.003 tokens y 1.024 generados, por lo que no se establece capacidad alguna en el limite configurado de 262.144 tokens.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta exportacion con su propio modelo base. No se identifican en los datos consultados otros checkpoints cuantizados comparables de AREX-2.

| Modelo | Parametros | Contexto | Precision | Formato | Runtime | Licencia |
|---|---|---|---|---|---|---|
| numsu/AREX-2-27B-INT4-W4A16 | 27,36 mil millones | 262.144 declarados; 128K probados | INT4 W4A16, grupo 128, RTN | Safetensors `compressed-tensors` | vLLM 0.29.0 | Apache 2.0 |
| BAAI/AREX-2 (base BF16) | 27,36 mil millones | 262.144 declarados | BF16 | No disponible en la informacion consultada | No disponible | Apache 2.0 |
| Otras alternativas de 27B multimodales para agentes | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Diferencias observadas entre ambas filas: el checkpoint INT4 reduce el peso en disco a 18,6 GB y habilita el despliegue en 2×RTX 3090, a cambio de una perdida de fidelidad de pesos cuantificada en un error L2 relativo de 0,12160 y sin ninguna evaluacion de calidad que la respalde.

## Limitaciones y advertencias

- Cuantizacion sin calibracion: el proceso es data-free y RTN, sin conjunto de calibracion. El unico indicador publicado es el error L2 de pesos (0,12160), que no predice perplejidad ni acuerdo con los logits del BF16.
- Ausencia total de evaluacion de calidad: no se ha ejecutado ninguna comparacion conductual ni de tareas contra la fuente BF16, ni tampoco evaluacion multimodal.
- Contexto declarado no probado: los 262.144 tokens de la configuracion no se han validado; la evidencia empirica llega hasta 128.003 tokens de prompt.
- Concurrencia limitada: el perfil medido fija un maximo de 1 secuencia activa, lo que invalida el uso en escenarios de servicio con usuarios simultaneos sin un redimensionado previo.
- Dependencia de un drafter externo: las cifras de decodificacion se obtuvieron con DFlash2 activado, que no se incluye en el repositorio; sin el, el rendimiento de decode sera distinto.
- Ambiguedad de version: la model card indica compatibilidad con Qwen3.8 mientras la etiqueta del repositorio es `qwen3_5`. Conviene verificar la tokenizacion y el chat template contra BAAI/AREX-2 antes de integrarlo.
- Sesgos: no disponible. No se ha publicado ningun analisis de sesgos sobre este checkpoint ni sobre la cuantizacion.
- Alucinacion: no disponible. No existen evaluaciones de veracidad ni de tasa de alucinacion para este artefacto.
- Idiomas: no disponible. No se declara cobertura linguistica ni se ha medido rendimiento por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion. No se documentan restricciones adicionales, pero la responsabilidad sobre la calidad del checkpoint cuantizado recae en quien lo despliega, no en BAAI.
- Madurez: 0 descargas y 0 "me gusta" en el momento de la consulta, con creacion y ultima actualizacion el mismo dia. Es una cuantizacion comunitaria sin validacion externa independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/numsu/AREX-2-27B-INT4-W4A16
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Paper: https://arxiv.org/abs/2609.38288
- Repositorio del proyecto: https://github.com/VectorSpaceLab/AREX-2
- vLLM: https://github.com/vllm-project/vllm
