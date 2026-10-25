# Ashlyn4202025/gemma4-31b-w4a8-gptq-dflash2

## Resumen

`Ashlyn4202025/gemma4-31b-w4a8-gptq-dflash2` es una cuantización y reempaquetado de Gemma 4 31B-it (modelo denso multimodal de Google, con torre de visión) para el motor de inferencia radiance sobre GPU AMD RDNA4. El autor, Ashlyn4202025, parte del modelo original y de un especulador DFlash2 de RedHatAI, y entrega un único fichero de 23,2 GiB en formato `.rad` que contiene el trunk cuantizado a W4A8 (pesos int4, activaciones int8) mediante GPTQ, el `lm_head` en int8, el especulador en fp8 por bloques y la torre de visión en bf16.

La aportación concreta frente a la variante round-to-nearest (RTN) del mismo autor no es de tamaño ni de velocidad, sino de fidelidad en la generación de tool calls en streaming: con RTN, el modelo quedaba atrapado dentro de un argumento de tipo string sin cerrar la comilla en el 58% de los casos tras `MS-110`, lo que dejaba la llamada sin terminar hasta `max_tokens`. Con GPTQ el cierre sube a ~100% y ninguna de 40 pruebas se bloqueó.

Es relevante ahora por dos motivos: permite ejecutar un modelo de 31B multimodal con tool calling en hardware AMD de consumo profesional (Radeon AI PRO R9700, gfx1201) sin GPU NVIDIA, y documenta con métricas de KL y de tool use el efecto real de una cuantización GPTQ frente a RTN y frente a un contenedor w8a8, algo poco habitual en fichas de modelos cuantizados. El contexto configurado en el ejemplo de despliegue es de 65.536 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 31B-it) con torre de visión y especulador DFlash2 acoplado; proyecciones q, k y v fusionadas en una sola linear |
| Parametros totales | 31B (nominal, segun el nombre del modelo); recuento exacto no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 65.536 tokens en la configuracion de despliegue documentada (`--max-model-len 65536`); longitud nativa maxima no disponible |
| Tipos de cuantizacion | W4A8 GPTQ en el trunk (int4, grupo 128, escalas f16 con busqueda de escala; activaciones int8 en q/k/v); `lm_head` int8; especulador fp8 por bloques; cabeza de draft int8; torre de vision bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (segun la model card; ver advertencias sobre la licencia del modelo base) |
| Formato de pesos | `.rad` (formato propio del motor radiance), fichero unico `gemma4-31b-dense-w4a8g-df2-qkv.rad` de 23,2 GiB, mas un `.recipe` con la receta de conversion |
| Tamano del repo | 24,9 GB |
| Pipeline | image-text-to-text |
| Motor de inferencia | radiance 1.12.0 o superior (imagen Docker `stilldeadcode/radiance`) |
| Hardware objetivo | AMD RDNA4 (gfx1201), p. ej. Radeon AI PRO R9700 |

## Arquitectura y entrenamiento

La arquitectura de partida es Gemma 4 31B-it, un transformer denso con capacidades multimodales (pipeline `image-text-to-text`) y un modo de razonamiento que el autor desactiva explicitamente en todas sus mediciones ("thinking off"). Sobre esa base, este repositorio no reentrena nada: aplica una cuantizacion post-entrenamiento GPTQ al trunk. Los codigos int4 se ajustan contra matrices de Gram de las activaciones del modelo bf16, capturadas con el "Gemma 4 calibration tap" de radiance, con grupo de 128 y escalas f16 elegidas mediante busqueda de escala. Las proyecciones q, k y v comparten una única linear que se lee contra activaciones int8; el `lm_head` se mantiene en int8; la torre de visión queda en bf16 sin cuantizar.

El componente de decodificacion especulativa es el especulador DFlash2 de RedHatAI (`RedHatAI/gemma-4-31B-it-speculator.dflash2`), con bloques de 8 y 7 borradores por pasada, almacenado en fp8 por bloques y con la cabeza de draft en int8. La verificación es exacta: el trunk valida cada borrador, de modo que el especulador afecta a la velocidad y nunca a la salida. El autor reporta que, con este trunk, el especulador acierta algo mas que con la variante RTN (4,11 tokens por paso frente a 3,96 con 8 usuarios y `--tp 2`), y que la verificacion en arbol (PR Perire/radiance#26) mejora el rendimiento en configuracion de cuatro tarjetas. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, numero de tokens, composicion ni fases de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento: modelo de 31B con modo de pensamiento (desactivado en las mediciones del autor).
- Vision / image-text-to-text: torre de visión en bf16, capaz de procesar entradas imagen-texto.
- Tool calling y function calling, incluyendo llamadas en streaming con cierre correcto de argumentos de tipo string (la mejora principal de esta cuantizacion frente a RTN).
- Razonamiento multi-paso y conversaciones multi-turno con seleccion de herramienta.
- Generacion de codigo y matematicas (el autor reporta que la cuantizacion es mas fiel al bf16 que RTN en chat, codigo, matematicas, razonamiento y tool calls).
- Decodificacion especulativa integrada (DFlash2) con verificacion exacta por parte del trunk.
- Capacidades multilingues: no disponible (no se declaran idiomas en la model card ni en los metadatos).
- No se documentan capacidades de audio ni de salida multimodal.

## Casos de uso

- Servidor de inferencia on-premise sobre GPU AMD: el fichero se sirve con la imagen `stilldeadcode/radiance:1.12.0` y expone una API compatible con OpenAI en el puerto 8000, lo que permite sustituir un backend NVIDIA por Radeon AI PRO R9700 sin reescribir los clientes.
- Agentes con tool calling en streaming: el caso que motiva la cuantizacion GPTQ. En pipelines donde el cliente parsea la llamada a medida que llega, RTN dejaba argumentos sin cerrar y bloqueaba la peticion; esta version cierra el 100% en las pruebas del autor.
- Atencion al cliente automatizada multi-turno: con 65.536 tokens de contexto configurados y modo de vision, puede mantener historiales largos e incorporar capturas o documentos adjuntos en la conversacion.
- Extraccion de datos de documentos e imagenes: al ser image-text-to-text, sirve para procesar facturas, albaranes o capturas y devolver la informacion estructurada mediante una llamada a herramienta.
- Asistente de codigo interno: generacion y revision de codigo en un despliegue self-hosted, con cuantizacion W4A8 que reduce el peso del trunk frente a bf16 (23,2 GiB frente al equivalente en precision completa).
- Evaluacion de tecnicas de cuantizacion: util como referencia para equipos de investigacion que comparen GPTQ, round-to-nearest y w8a8 sobre el mismo trunk, con metricas de KL y de tool use ya publicadas.
- Despliegue en 2 o 4 GPU con paralelismo de tensor: el ejemplo documentado usa `--tp 4` y `--max-num-seqs 16` con cache KV en fp8, adecuado para servir varias conversaciones concurrentes en un nodo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible. Las metricas publicadas son de fidelidad frente al modelo bf16, de tool use y de velocidad.

Divergencia KL frente al modelo bf16 (44,5K posiciones reservadas; la tabla cuenta solo los turnos propios del modelo, 31.975 posiciones):

| Metrica | RTN | Este fichero (GPTQ) | Q8 (w8a8, 38,2 GB) |
|---|---|---|---|
| KL media | 0,341 | 0,251 | 0,226 |
| KL mediana | 0,0003 | 0,0001 | 0,0001 |
| KL p99 | 7,49 | 5,46 | 5,28 |
| Top-1 | 90,5% | 91,3% | 92,3% |
| Respuestas de tool call | 0,521 | 0,396 | 0,356 |

Sobre todas las posiciones, las medias son 0,988 (RTN), 0,659 (este fichero) y 0,620 (Q8). Segun el autor, GPTQ cierra el 78% de la distancia entre RTN y Q8 en los turnos del modelo.

Tool use en BetterBench (`tool_call` y `multi_turn`, 1-16 usuarios, muestreo 0,7, `--tp 2`; dos ejecuciones por modelo):

| Metrica | RTN | Este fichero |
|---|---|---|
| Multi-turno: herramienta correcta | 15/18, 15/18 | 18/18, 18/18 |
| Tool calls: llamada valida | 16/17, 15/17 | 17/17, 17/17 |
| Tool calls: herramienta correcta | 16/17, 15/17 | 17/17, 17/17 |

Prueba de bloqueo en streaming (20 repeticiones por peticion, `--tp 2`, imagen radiance 1.12.0):

| Metrica | RTN | Este fichero |
|---|---|---|
| `<\|"\|>` tras `MS-110` | 41% | ~100% |
| `**,` | 58% | 0,04% |
| Llamadas simples bloqueadas | 10 de 20 | 0 de 20 |
| Round trips bloqueados | 1 de 20 | 0 de 20 |

Velocidad:

| Escenario | RTN | Este fichero |
|---|---|---|
| Decode en multi-turno de BetterBench, `--tp 2` | 159,8 tok/s | 159,6 tok/s |
| Decode single-stream, 4 tarjetas con verificacion en arbol | 371,8 tok/s | 381,2 tok/s |
| Tokens por paso con 8 usuarios, `--tp 2` | 3,96 | 4,11 |

## Requisitos de hardware

- VRAM estimada: 23,2 GiB de pesos en total, repartidos por el paralelismo de tensor. Con `--tp 4`, en torno a 5,8 GiB de pesos por tarjeta; con `--tp 2`, en torno a 11,6 GiB. A eso hay que sumar cache KV (configurada en fp8 en el ejemplo), buffers de activacion y el especulador. Estimacion derivada del tamano del fichero, no publicada por el autor.
- GPU soportadas: AMD RDNA4 (gfx1201), con Radeon AI PRO R9700 (32 GB) como referencia explicita de la model card. No hay soporte declarado para NVIDIA ni para otras arquitecturas AMD.
- CABE en consumer GPU: si, en el sentido de GPU profesional de escritorio AMD con 32 GB; el autor documenta configuraciones de 2 y 4 tarjetas, y no publica datos de una sola tarjeta.
- Requisitos de sistema: ROCm con acceso a `/dev/kfd` y `/dev/dri`, grupos `render` y `video`, `--security-opt seccomp=unconfined` y `--ulimit memlock=-1` en el ejemplo con Docker.
- Opciones de despliegue: exclusivamente radiance 1.12.0 o superior, via imagen Docker `stilldeadcode/radiance` o Docker Compose (plantilla `deploy/compose/gemma4-31b-w4a8-df2-tp4.yaml`, cambiando la linea `--model`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, porque el formato `.rad` es propietario del motor.
- Rendimiento estimado: 159,6 tok/s de decode en conversaciones multi-turno con `--tp 2` y 1-16 usuarios; 381,2 tok/s single-stream con 4 tarjetas y verificacion en arbol. Latencia por peticion no publicada.
- Memoria por secuencia: `--max-num-seqs 16`, `--max-num-batched-tokens 8192`, `--busy-prefill-chunk 512`, `--prefill-interleave 1` en la configuracion de referencia con 4 tarjetas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | KL media (turnos propios) | Tool use BetterBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este fichero (GPTQ W4A8 + DFlash2) | 31B denso | 65.536 configurados | 23,2 GiB (`.rad`) | 0,251 | 18/18 y 17/17 en las tres metricas | apache-2.0 | publico, 0 descargas |
| `Ashlyn4202025/gemma4-31b-w4a8-dflash2` (RTN W4A8 + DFlash2) | 31B denso | no disponible | 24,9 GB de repo | 0,341 | 15/18 y 16/17 | apache-2.0 | publico |
| Contenedor w8a8 de radiance (Q8) | 31B denso | no disponible | 38,2 GB | 0,226 | no disponible | no disponible | referenciado en la model card |
| `google/gemma-4-31B-it` (bf16) | 31B denso | no disponible | no disponible | referencia | no disponible | no disponible en la informacion proporcionada | modelo base |

## Limitaciones y advertencias

- Dependencia total del motor radiance: el formato `.rad` no es cargable por vLLM, llama.cpp, Ollama ni TGI, y requiere radiance 1.12.0 o superior.
- Soporte limitado a AMD RDNA4 (gfx1201) con ROCm. No hay soporte declarado para NVIDIA, CDNA ni RDNA3.
- La licencia declarada en la model card es apache-2.0, pero el modelo base es Gemma 4 de Google, cuyos terminos de uso habituales no son Apache 2.0. Conviene verificar la licencia efectiva del modelo base antes de un uso comercial.
- Modelo de terceros con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de las metricas, que proceden exclusivamente de las mediciones del autor.
- Riesgo de alucinacion inherente a un modelo de 31B: no se han publicado evaluaciones de factualidad ni de sesgos en la informacion disponible.
- Idiomas soportados no declarados; no se puede asumir un comportamiento multilingue homogeneo, y menos aun tras una cuantizacion int4.
- La cuantizacion int4 degrada la fidelidad frente a bf16: KL media de 0,251 frente a 0,226 del contenedor w8a8 y valores p99 de 5,46 frente a 5,28. Aceptable para la mayoria de usos, pero no identico al modelo original.
- El beneficio de GPTQ esta medido sobre un caso concreto (cierre de argumentos string en tool calls de BetterBench); no hay garantia de que se generalice a otros esquemas de herramientas o a otros parsers de streaming.
- La torre de vision permanece en bf16 y no se han publicado metricas de calidad multimodal para esta cuantizacion.
- La model card original esta truncada en el apartado "How it was made", por lo que la descripcion completa del proceso de calibracion no esta disponible.
- El autor advierte de que la verificacion en arbol que mejora el rendimiento en 4 tarjetas esta en revision (Perire/radiance#26) y no forma parte del motor estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ashlyn4202025/gemma4-31b-w4a8-gptq-dflash2
- Variante round-to-nearest del mismo autor: https://huggingface.co/Ashlyn4202025/gemma4-31b-w4a8-dflash2
- Especulador DFlash2 de RedHatAI: https://huggingface.co/RedHatAI/gemma-4-31B-it-speculator.dflash2
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Motor radiance (codigo): https://codeberg.org/StillDeadcode/radiance
- Imagen Docker de radiance: https://hub.docker.com/r/stilldeadcode/radiance
- Pull request de verificacion en arbol: https://codeberg.org/Perire/radiance/pulls/26
- Pull request del calibration tap de Gemma 4: https://codeberg.org/Perire/radiance/pulls/33
