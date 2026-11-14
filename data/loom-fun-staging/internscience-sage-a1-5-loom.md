# loom-fun-staging/InternScience-Sage-A1.5-loom

## Resumen

Sage-A1.5-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `InternScience/Sage-A1.5-Q4_K_M-GGUF`, empaquetado por el usuario `loom-fun-staging`. No se trata de un modelo entrenado desde cero, sino de una envoltura de inferencia optimizada para las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB), generada con el flujo de trabajo `loom-skills`. Su proposito es servir el modelo base con un backend especifico de ROCm que compite en rendimiento con llama.cpp ROCm.

El modelo subyacente es multimodal (image-text-to-text), con decodificacion especulativa MTP (multi-token prediction) de profundidad 3 activada por defecto, modo de razonamiento activado por defecto y soporte de tool calling al estilo OpenAI. La ventana de contexto declarada es de 262.144 tokens por peticion, con capacidad de 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

La relevancia de este paquete es fundamentalmente de infraestructura: demuestra un camino de despliegue alternativo a llama.cpp sobre hardware AMD consumer y profesional, con metricas de roofline publicadas para Strix Halo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su model card esta incompleta en varios apartados criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un GGUF Q4_K_M; la model card del paquete no detalla la arquitectura interna, aunque la tabla de rendimiento menciona que es un modelo de mezcla de expertos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Sage-A1.5-Q4_K_M.gguf`) mas proyector multimodal `Sage-A1.5-mmproj.gguf`; el paquete anade programas `.loom` y `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base en la informacion proporcionada. La model card del paquete Loom no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion. La unica referencia arquitectonica indirecta aparece en la metodologia de benchmarks, donde se describe el modelo como "this mixture-of-experts model" al calcular el techo de roofline para 4 flujos concurrentes, asumiendo que los cuatro flujos enrutan a los mismos expertos.

La innovacion tecnica destacable de este paquete no esta en el modelo sino en el runtime: Loom implementa decodificacion especulativa mediante MTP (multi-token prediction) con profundidad 3, activada por defecto, con tasas de aceptacion medidas del 49 % en decodificacion de contexto corto, 48 % a 2k tokens y 66 % a 32k tokens. El paquete incluye ademas un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`) que comparan la salida de Loom contra una referencia de llama.cpp sobre el mismo GGUF, token a token, tratando cada divergencia como un empate cercano. Estas puertas no se han vuelto a ejecutar en esta version del paquete: la ultima pasada corresponde a una compilacion anterior con sha256 `67f537a`.

## Capacidades

- Generacion de texto y razonamiento: modo de razonamiento activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen: soporte de partes `image_url` al estilo OpenAI, con proyector separado `Sage-A1.5-mmproj.gguf`.
- Tool calling: soporte de `tools` y `tool_calls` al estilo OpenAI.
- Decodificacion especulativa: MTP con profundidad 3, activada por defecto.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia: hasta 4 peticiones simultaneas con verificacion de consistencia (misma salida que la peticion individual equivalente).
- Contexto largo: 262.144 tokens por peticion.
- No soporta audio ni salida de audio (marcado como "not applicable").
- No aplica "reasoning effort" (marcado como "not applicable").
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue de inferencia multimodal sobre Strix Halo: el paquete permite servir el GGUF con `loom-serve` en un Ryzen AI Max+ 395 reservando 41 GB de memoria, con API compatible con OpenAI, lo que facilita integrarlo en aplicaciones existentes sin cambiar el cliente.
- Procesamiento de documentos largos con imagen: con 262.144 tokens de contexto y entrada de imagen, se pueden analizar informes escaneados, capturas de pantalla o diagramas junto a texto extenso en una sola peticion.
- Asistentes con tool calling: al exponer `tools` y `tool_calls` al estilo OpenAI, el modelo puede integrarse en agentes que consultan APIs externas, bases de datos o sistemas de ticketing.
- Razonamiento multi-paso con modo thinking: util para tareas de analisis que se benefician de cadenas de razonamiento internas, con la posibilidad de desactivarlo para reducir latencia en produccion.
- Servicio concurrente de baja escala: con 4 peticiones simultaneas y verificacion de consistencia, es adecuado para equipos pequenos o entornos de desarrollo que necesitan un endpoint local multimodal.
- Evaluacion comparativa de runtimes AMD: el paquete incluye metricas de roofline y puertas de correccion que permiten medir el rendimiento de Loom frente a llama.cpp ROCm sobre el mismo GGUF, util para decidir la pila de inferencia en hardware AMD.
- Prototipado en Radeon AI PRO R9700: con 34 GB reservados en una GPU de 32 GB, sirve para validar cargas multimodales en estaciones de trabajo AMD antes de escalar.

## Benchmarks y rendimiento

Los unicos datos publicados son techos de roofline para Strix Halo (gfx1151, 216 GB/s y 59 TFLOP/s). Las columnas de llama.cpp y Loom estan marcadas como "no medidas" (`—`), por lo que no hay comparacion directa disponible.

| Metrica | llama.cpp | Loom | Roofline (Strix Halo) |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 141,9 |
| Decode tok/s, contexto 2k | no medido | no medido | 137,3 |
| Decode tok/s, contexto 32k | no medido | no medido | 144,9 |
| Prefill tok/s, documento 1k | no medido | no medido | 11.600,2 |
| Prefill tok/s, documento 2k | no medido | no medido | 11.416,3 |
| Prefill tok/s, documento 8k | no medido | no medido | 10.424,8 |
| Prefill tok/s, documento 16k | no medido | no medido | 9.343,0 |
| Prefill tok/s, documento 32k | no medido | no medido | 7.737,1 |
| 4 flujos, decode agregado tok/s | no medido | no medido | 418,3 |
| Tokens especulativos aceptados | n/a | no medido | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han vuelto a medir" segun la model card. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria reservada: 41 GB en Strix Halo (`--memory_bytes=41000000000`) y 34 GB en Radeon AI PRO R9700 (`--memory_bytes=34000000000`).
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para otras GPU.
- GPU consumer: el paquete esta pensado para APU Strix Halo con memoria unificada; no se indica compatibilidad con GPU consumer discretas tipo RTX 4090.
- Despliegue: `loom-serve` del paquete `hrx-loom[hf]==0.1.0`, con descarga via `loom-fetch`. El servidor escucha en `127.0.0.1:8080` y expone `/v1/chat/completions`.
- Alternativas de despliegue: el GGUF base es compatible con llama.cpp ROCm, que se usa como referencia de comparacion, aunque las metricas de este paquete no estan medidas.
- Latencia y throughput: solo se dispone de techos de roofline (ver seccion anterior); no hay valores medidos de Loom ni de llama.cpp en esta version.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La unica comparacion disponible es de runtime, no de modelo: Loom frente a llama.cpp ROCm sobre el mismo GGUF, con las celdas de rendimiento sin medir en esta version del paquete.

| Aspecto | Sage-A1.5-loom | llama.cpp ROCm (mismo GGUF) |
|---|---|---|
| Formato | Paquete Loom (`.loom` + `model.json`) sobre GGUF | GGUF directo |
| Hardware | Strix Halo, Radeon AI PRO R9700 | ROCm en general |
| Decodificacion especulativa | MTP profundidad 3, por defecto | no configurada en la comparacion |
| API | OpenAI-style `/v1/chat/completions` | servidor propio de llama.cpp |
| Metricas publicadas | solo roofline | no medidas |

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; no se puede confirmar el uso comercial sin consultar el repositorio del modelo base.
- Los idiomas soportados no estan documentados.
- El repositorio tiene 0 descargas y 0 likes, y el tamano declarado es 0,0 GB, lo que sugiere que los artefactos pueden no estar materializados o que las metricas aun no se han actualizado.
- Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`) no se han vuelto a ejecutar en esta version; la ultima pasada valida corresponde a una compilacion anterior (sha256 `67f537a`).
- Los benchmarks de rendimiento de Loom y llama.cpp estan sin medir; solo hay techos de roofline, que no son rendimiento observado.
- La comparacion de decodificacion usa configuraciones distintas en cada motor (Loom con MTP profundidad 3, llama.cpp sin drafting), por lo que no es una comparacion equivalente.
- El techo de 4 flujos asume que los cuatro flujos enrutan a los mismos expertos, una cota superior que una ejecucion real puede no alcanzar.
- El maximo de salida esta limitado a 4.096 tokens por preset, muy por debajo de la ventana de contexto de 262.144 tokens.
- No hay datos de sesgos, tasas de alucinacion ni evaluaciones de calidad del modelo base.
- El soporte de hardware esta restringido a dos plataformas AMD concretas; no se documenta compatibilidad con otras GPU o aceleradores.
- El paquete depende de una version concreta del runtime (`hrx-loom[hf]==0.1.0`), lo que introduce riesgo de incompatibilidad futura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/InternScience-Sage-A1.5-loom
- Modelo base en Hugging Face: https://huggingface.co/InternScience/Sage-A1.5-Q4_K_M-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
