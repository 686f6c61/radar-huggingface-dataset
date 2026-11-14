# loom-fun-staging/lmstudio-community-gemma-4-26B-A4B-it-loom

## Resumen

`loom-fun-staging/lmstudio-community-gemma-4-26B-A4B-it-loom` es un paquete de despliegue en formato Loom (ficheros `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `lmstudio-community/gemma-4-26B-A4B-it-GGUF`, concretamente el fichero `gemma-4-26B-A4B-it-Q4_K_M.gguf`. Lo publica el usuario `loom-fun-staging`, vinculado al ecosistema Loom (ROCm/hrx-system y loom-skills), y esta orientado a dos aceleradores AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado y compilacion de kernels para servir el modelo base Gemma 4 26B A4B (arquitectura MoE, segun el nombre A4B) con decodificacion especulativa.

El objetivo del paquete es ofrecer una alternativa a llama.cpp ROCm en hardware AMD, con servidor compatible con la API de OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional y decodificacion especulativa DFlash activada por defecto. La model card reporta cifras de roofline (techo teorico del hardware) para Strix Halo, pero deja vacias las columnas de rendimiento medido de llama.cpp y Loom, por lo que no hay comparativa efectiva publicada.

Es relevante ahora por dos motivos: primero, porque ejemplifica el patron de distribucion de modelos abiertos como paquetes optimizados por hardware en lugar de pesos genericos; segundo, porque el repositorio esta practicamente vacio (0.0 GB, 0 descargas, 0 likes, creado y actualizado el 2026-11-14), lo que lo convierte en un artefacto en fase muy temprana o de staging, no apto todavia para produccion sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; el sufijo A4B indica mezcla de expertos con 4B activos) |
| Parametros totales | 26B (segun el nombre del modelo base) |
| Parametros activos | 4B (segun el sufijo A4B del nombre) |
| Longitud de contexto | 262.144 tokens nativos; 201.728 tokens por peticion en el paquete Loom; 179.200 en Radeon AI PRO R9700 por limite de memoria |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en artefactos `.loom` con `model.json` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Salida maxima | 4.096 tokens (`max_tokens` predefinido) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | DFlash, profundidad 1, activada por defecto; drafter `Anbeeld/gemma-4-26B-A4B-it-DFlash-GGUF` |
| Memoria recomendada | 81.000.000.000 bytes (Strix Halo); 34.000.000.000 bytes (R9700) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion del modelo base Gemma 4 26B A4B en la informacion proporcionada. El nombre del checkpoint (`26B-A4B`) sugiere una arquitectura de mezcla de expertos con 26.000 millones de parametros totales y aproximadamente 4.000 millones activos por token, pero esta inferencia procede unicamente de la nomenclatura y no de documentacion tecnica verificada en este repositorio. Tampoco consta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica del paquete Loom no reside en el modelo, sino en el runtime: kernels generados y compilados especificamente para las arquitecturas AMD gfx1151 y gfx1201, un servidor con API compatible con OpenAI, y decodificacion especulativa DFlash de profundidad 1 con un modelo drafter separado. La model card menciona ademas puertas de validacion (`kernel_tests`, `golden`, `compare`) que contrastan la salida codiciosa del runtime Loom contra una referencia de llama.cpp token a token, aunque en esta version no se han vuelto a ejecutar sobre el paquete actual (ultima pasada sobre el build `sha256 a1aa7db`).

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling y function calling con el esquema `tools` y `tool_calls` de OpenAI.
- Modo de razonamiento o thinking opcional: desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificacion especulativa DFlash con profundidad 1, activada por defecto, con un drafter GGUF independiente.
- Muestreo configurable mediante `temperature`, `top_p`, `top_k` y `seed`.
- Contexto largo: hasta 201.728 tokens por peticion en Strix Halo y 179.200 en R9700.
- Concurrencia de hasta 4 peticiones simultaneas.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream si la tiene.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream las tiene.
- Ajuste de esfuerzo de razonamiento (`reasoning effort`): no aplicable en este runtime.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con 201.728 tokens por peticion en Strix Halo, el modelo puede mantener conversaciones multi-turno sobre documentacion extensa o historiales completos sin truncar, algo util en soporte tecnico especializado.
- Procesamiento de documentos largos en local: analisis de contratos, informes o bases de codigo de hasta 179.200 tokens en una Radeon AI PRO R9700, sin depender de servicios en la nube.
- Agentes con tool calling: integracion en flujos que requieran invocar funciones externas (consultas a bases de datos, APIs internas, ejecucion de comandos) gracias al soporte del esquema `tools` de OpenAI.
- Razonamiento paso a paso bajo demanda: activacion del modo thinking para tareas de matematicas, logica o planificacion, y desactivacion para respuestas rapidas de bajo coste.
- Despliegue en estaciones de trabajo AMD: servir el modelo en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 mediante `loom-serve`, con memoria acotada explicitamente por `--memory_bytes`.
- Evaluacion de runtimes alternativos: usar el paquete como banco de pruebas para comparar Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts, segun la metodologia descrita en la model card.
- Generacion de codigo asistida en local: el modelo base es de proposito general y el runtime expone una API compatible con clientes habituales, aunque no hay benchmarks de codigo publicados para este paquete.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa Loom frente a llama.cpp ROCm para Strix Halo, pero las columnas de rendimiento medido de ambos motores estan vacias (`—`). Solo se publican los valores de roofline (techo teorico del hardware), que no son resultados del modelo:

| Metrica | Roofline (Strix Halo) | Loom medido | llama.cpp medido |
|---|---|---|---|
| Decode tok/s, prompt corto | 95,8 | no disponible | no disponible |
| Decode tok/s, contexto 2k | 83,7 | no disponible | no disponible |
| Decode tok/s, contexto 32k | 62,4 | no disponible | no disponible |
| Prefill tok/s, documento 1k | 9.141,6 | no disponible | no disponible |
| Prefill tok/s, documento 2k | 8.752,8 | no disponible | no disponible |
| Prefill tok/s, documento 8k | 8.146,9 | no disponible | no disponible |
| Prefill tok/s, documento 16k | 7.470,8 | no disponible | no disponible |
| Prefill tok/s, documento 32k | 6.407,4 | no disponible | no disponible |
| 4 streams, decode agregado tok/s | 275,5 | no disponible | no disponible |
| Tokens aceptados del drafter | n/a | 54 % (decode), 45 % (decode a 2k) | n/a |

El roofline se calcula para 216 GB/s de ancho de banda y 59 TFLOP/s en el Ryzen AI Max+ 395. Para la Radeon AI PRO R9700 la model card indica explicitamente que los resultados "no se han vuelto a medir". No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: el paquete se sirve con `--memory_bytes=81000000000` (81 GB) en Strix Halo y `--memory_bytes=34000000000` (34 GB) en Radeon AI PRO R9700. El limite condiciona el contexto maximo por peticion (201.728 y 179.200 tokens respectivamente).
- GPU compatibles: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPU en la informacion disponible.
- GPU de consumo: no disponible. El paquete esta orientado a APUs y GPU profesionales AMD; no consta soporte para RTX 4090, RTX 3090 u otras GPU de consumo.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, descarga con `loom-fetch ... --materialize=copy` y servicio con `loom-serve`. El servidor escucha en `127.0.0.1:8080` y expone API compatible con OpenAI. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como medidas; solo se publican los techos de roofline indicados en la seccion anterior.

## Comparativa con modelos similares

No hay datos suficientes para establecer una comparativa con modelos de la misma categoria. El unico punto de comparacion documentado es el propio runtime llama.cpp ROCm sobre el mismo GGUF, pero sus cifras de rendimiento no estan publicadas en la model card.

| Aspecto | Este paquete (Loom) | llama.cpp ROCm (mismo GGUF) | Alternativas de 26B-30B MoE |
|---|---|---|---|
| Parametros totales / activos | 26B / 4B (segun nombre) | 26B / 4B (mismo GGUF) | no disponible |
| Contexto | 201.728 tokens por peticion (Strix Halo) | no disponible | no disponible |
| Rendimiento medido | no disponible | no disponible | no disponible |
| Licencia | no disponible | no disponible | no disponible |
| Hardware soportado | AMD gfx1151 y gfx1201 | ROCm generico | no disponible |
| Tool calling | si (OpenAI-style) | no disponible | no disponible |
| Decodificacion especulativa | DFlash, profundidad 1 | no (en la comparacion) | no disponible |

## Limitaciones y advertencias

- Repositorio practicamente vacio: 0.0 GB de tamano, 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el mismo dia (2026-11-14). No hay evidencia de uso ni validacion externa.
- Las puertas de validacion `kernel_tests` y `golden` no se han vuelto a ejecutar sobre este paquete; la ultima pasada corresponde a un build anterior (`sha256 a1aa7db`). La correccion del runtime actual no esta garantizada.
- No hay resultados de rendimiento medidos publicados: las columnas de Loom y llama.cpp estan vacias en la tabla comparativa. Las cifras de roofline son techos teoricos, no rendimiento real.
- El paquete no soporta entrada de imagen ni de audio, aunque el modelo upstream si las tiene. Cualquier caso de uso multimodal queda fuera del alcance de este runtime.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. El modelo base Gemma de Google suele publicarse bajo terminos propios, pero esa informacion no consta en este repositorio.
- Idiomas soportados no disponibles: no se puede verificar cobertura multilingue.
- Limitado a hardware AMD especifico (Strix Halo y Radeon AI PRO R9700). No hay soporte documentado para GPU NVIDIA ni para GPU de consumo AMD.
- Contexto efectivo reducido en R9700: 179.200 tokens frente a los 262.144 nativos, por el limite de memoria de 34 GB.
- Salida maxima de 4.096 tokens por peticion: insuficiente para generacion de documentos largos en una sola respuesta.
- Concurrencia limitada a 4 peticiones simultaneas: no apto para cargas de alta concurrencia sin escalado horizontal.
- Riesgo de sesgos y alucinaciones del modelo base: no evaluado en este paquete; no hay informacion sobre mitigaciones.
- El checkpoint es Q4_K_M, una cuantizacion de 4 bits: puede degradar la calidad frente a pesos de mayor precision, especialmente en tareas de razonamiento y codigo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-fun-staging/lmstudio-community-gemma-4-26B-A4B-it-loom
- Modelo base GGUF: https://huggingface.co/lmstudio-community/gemma-4-26B-A4B-it-GGUF
- Modelo drafter DFlash: https://huggingface.co/Anbeeld/gemma-4-26B-A4B-it-DFlash-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Workflow loom-skills: https://github.com/loom-fun/loom-skills
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
