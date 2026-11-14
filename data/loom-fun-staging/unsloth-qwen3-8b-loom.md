# loom-fun-staging/unsloth-Qwen3-8B-loom

## Resumen

`loom-fun-staging/unsloth-Qwen3-8B-loom` es un paquete de despliegue para el runtime Loom de AMD, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `unsloth/Qwen3-8B-GGUF` (concretamente `Qwen3-8B-Q4_K_M.gguf`) junto con programas `.loom` y un `model.json` que permiten servirlo sobre las GPU integradas AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU discreta Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es Qwen3-8B, un transformer denso de 8 mil millones de parametros de la familia Qwen3 de Alibaba.

El interes de este repositorio es de infraestructura mas que de modelado: demuestra una via de inferencia nativa en ROCm para hardware AMD consumer y de estacion de trabajo, con servidor compatible con la API de OpenAI, decodificacion especulativa DFlash y un conjunto de puertas de correccion que comparan la salida contra una referencia de llama.cpp. El autor es `loom-fun-staging`, un espacio de publicacion del ecosistema Loom (repositorios `ROCm/hrx-system` y `loom-fun/loom-skills`).

La ficha se centra en lo que el paquete declara: contexto de 40.960 tokens por peticion, 4 peticiones concurrentes, tool calling estilo OpenAI y modo de razonamiento activado por defecto. Cualquier dato no publicado en la model card se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B); paquete de despliegue para runtime Loom sobre ROCm |
| Parametros totales | 8.000 millones (modelo base Qwen3-8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible en la model card |
| Licencia | no disponible |
| Formato de pesos | GGUF (Qwen3-8B-Q4_K_M.gguf) mas programas `.loom` y `model.json` |
| Modelo base | unsloth/Qwen3-8B-GGUF |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Concurrencia | 4 peticiones simultaneas |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Decodificacion especulativa | DFlash, profundidad 3, activada por defecto; drafter `AtomicChat/Qwen3-8B-DFlash-GGUF` |
| Memoria configurada | `--memory_bytes=29000000000` (29 GB) en los comandos de ejemplo |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer denso de 8.000 millones de parametros. Este repositorio no entrena ni afina pesos: toma el GGUF cuantizado Q4_K_M publicado por Unsloth y lo acompaña de artefactos de ejecucion generados con el flujo `loom-skills`. El autor no documenta en esta model card la composicion del dataset de preentrenamiento, el numero de tokens ni las etapas de alineacion (RLHF/DPO) del modelo original; esos datos corresponden a la model card de Qwen3-8B y no se reproducen aqui.

La innovacion tecnica del paquete esta en el runtime. Loom compila kernels especificos para las arquitecturas gfx1151 y gfx1201, expone un servidor con API compatible con OpenAI y habilita decodificacion especulativa DFlash con profundidad 3 usando un drafter separado (`AtomicChat/Qwen3-8B-DFlash-GGUF`). La model card incluye una tabla de rendimiento frente a llama.cpp ROCm con techos de roofline calculados para Strix Halo a 216 GB/s de ancho de banda y 59 TFLOP/s. Las celdas de tiempos medidos de Loom y llama.cpp aparecen como no registradas; solo se publican los valores de roofline: 97,7 tok/s de decodificacion con prompt corto, 90,7 tok/s a 2k de contexto, 23,0 tok/s a 32k, prefill de 4.158,9 tok/s con documento de 1k y 171,9 tok/s agregados con 4 streams. La aceptacion del drafter medida en esas sesiones fue del 37 % en decodificacion corta y del 36 % a 2k de contexto. Los resultados para la Radeon AI PRO R9700 no se han vuelto a medir.

## Capacidades

- Generacion de texto y razonamiento: modo thinking activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls` en el esquema de `/v1/chat/completions`.
- Servidor compatible con la API de OpenAI, lo que facilita integrarlo con clientes y SDK existentes.
- Decodificacion especulativa DFlash con profundidad 3 activada por defecto, con drafter Qwen3-8B-DFlash.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de 4 peticiones simultaneas con una puerta de consistencia que verifica que las respuestas concurrentes coinciden con las ejecuciones aisladas.
- Contexto de hasta 40.960 tokens por peticion.
- Sin entrada de imagen ni audio: la model card marca ambas como no aplicables.
- El nivel de esfuerzo de razonamiento (reasoning effort) no esta soportado en este paquete.

## Casos de uso

- Servicio local de chat sobre Strix Halo: un equipo con Ryzen AI Max+ 395 puede levantar `loom-serve` y exponer un endpoint compatible con OpenAI en `127.0.0.1:8080`, util para prototipos y asistentes internos sin depender de la nube.
- Procesamiento de documentos largos: con 40.960 tokens de contexto y prefill de hasta 2.529,1 tok/s de techo a 32k, encaja en resumen y extraccion de informacion sobre contratos, informes o expedientes de decenas de paginas.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` permite construir agentes que consulten APIs internas, bases de datos o sistemas de tickets encadenando llamadas multi-paso.
- Razonamiento asistido por thinking mode: tareas de analisis, depuracion o planificacion donde interesa una cadena de razonamiento explicita; puede desactivarse por peticion cuando prima la latencia.
- Evaluacion de hardware AMD para inferencia: el paquete sirve como banco de pruebas reproducible para comparar Loom frente a llama.cpp ROCm con el mismo GGUF y las mismas peticiones.
- Despliegue en estacion de trabajo con Radeon AI PRO R9700: 32 GB de VRAM permiten mantener el modelo Q4_K_M y el drafter en una sola GPU discreta para equipos de desarrollo.
- Bateria de validacion de kernels: las puertas `kernel_tests`, `golden`, `compare`, `consistency` y `spec` permiten verificar que la implementacion ROCm reproduce la salida de referencia de llama.cpp token a token.

## Benchmarks y rendimiento

La model card publica techos de roofline para Strix Halo, pero las columnas de tiempos medidos de Loom y llama.cpp aparecen como no registradas. No se deben interpretar los valores de roofline como rendimiento observado.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | no registrado | no registrado | 97,7 |
| Decode tok/s, contexto 2k | no registrado | no registrado | 90,7 |
| Decode tok/s, contexto 32k | no registrado | no registrado | 23,0 |
| Prefill tok/s, documento 1k | no registrado | no registrado | 4.158,9 |
| Prefill tok/s, documento 2k | no registrado | no registrado | 4.074,2 |
| Prefill tok/s, documento 8k | no registrado | no registrado | 3.630,6 |
| Prefill tok/s, documento 16k | no registrado | no registrado | 3.170,3 |
| Prefill tok/s, documento 32k | no registrado | no registrado | 2.529,1 |
| 4 streams, decode agregado tok/s | no registrado | no registrado | 171,9 |
| Tokens redactados aceptados | no aplica | 37 % (decode), 36 % (2k) | no aplica |

Para la Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica que los resultados de este paquete aun no se han vuelto a medir. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria: los comandos de ejemplo reservan 29 GB (`--memory_bytes=29000000000`), lo que cubre el GGUF Q4_K_M, el drafter DFlash y el estado del runtime.
- Strix Halo: AMD Ryzen AI Max+ 395 con GPU integrada gfx1151; el techo de roofline se calcula con 216 GB/s de ancho de banda y 59 TFLOP/s.
- Radeon AI PRO R9700: GPU discreta gfx1201 con 32 GB de VRAM; encaja en el presupuesto de memoria del paquete.
- GPU consumer: no hay datos publicados sobre otras GPU AMD o NVIDIA; el paquete esta generado especificamente para gfx1151 y gfx1201.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch` para materializar el modelo y `loom-serve` para arrancar el servidor en `127.0.0.1:8080`.
- Latencia y throughput: solo disponibles como techos de roofline (ver seccion anterior); no hay tiempos medidos publicados para este paquete.
- Concurrencia: 4 peticiones simultaneas; el techo agregado de 4 streams es de 171,9 tok/s sin decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-8B (este paquete, Loom/AMD) | 8.000 M | 40.960 tokens | GGUF Q4_K_M + `.loom` | no disponible | Optimizado para gfx1151 y gfx1201; API OpenAI; DFlash |
| unsloth/Qwen3-8B-GGUF | 8.000 M | no disponible en esta ficha | GGUF | no disponible | Checkpoint base sin modificar que empaqueta este repositorio |
| AtomicChat/Qwen3-8B-DFlash-GGUF | 8.000 M (drafter) | no disponible en esta ficha | GGUF | no disponible | Drafter de decodificacion especulativa usado por el paquete |
| llama.cpp ROCm (runtime) | no aplica | no aplica | GGUF | no disponible | Referencia de comparacion en la model card; argumentos del servidor no registrados |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento del modelo frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Repositorio de staging con 0 descargas y 0 likes; no hay senales de adopcion ni de mantenimiento continuado.
- Licencia no declarada en la model card: no se puede confirmar el uso comercial sin consultar la licencia del modelo base Qwen3-8B y la del runtime Loom.
- Idiomas soportados no documentados en este paquete.
- Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`) no se han vuelto a ejecutar sobre este paquete; el ultimo pase corresponde a una compilacion anterior (sha256 `4181b25`).
- Los resultados de rendimiento para la Radeon AI PRO R9700 no se han vuelto a medir.
- Las columnas de tiempos medidos de Loom y llama.cpp en la tabla de rendimiento estan sin registrar; solo hay techos de roofline.
- La comparacion con llama.cpp no usa la misma configuracion en todas las filas: Loom emplea DFlash profundidad 3 en las filas de un stream y llama.cpp no usa drafting; ademas, los argumentos del servidor de llama.cpp no se registraron.
- El paquete esta atado a dos arquitecturas AMD concretas (gfx1151 y gfx1201); no se documenta portabilidad a otras GPU.
- Sin soporte de imagen ni audio, y sin nivel de esfuerzo de razonamiento configurable.
- Riesgo de alucinacion y sesgos del modelo Qwen3-8B subyacente: no evaluados en esta model card.
- Limite de 4.096 tokens de salida por defecto y de 4 peticiones concurrentes, que puede ser insuficiente para cargas de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Qwen3-8B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-8B-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/AtomicChat/Qwen3-8B-DFlash-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
