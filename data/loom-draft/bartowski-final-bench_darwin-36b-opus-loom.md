# loom-draft/bartowski-FINAL-Bench_Darwin-36B-Opus-loom

## Resumen

`loom-draft/bartowski-FINAL-Bench_Darwin-36B-Opus-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/FINAL-Bench_Darwin-36B-Opus-GGUF`, en su cuantizacion Q4_K_M. No se trata de un modelo entrenado desde cero ni de un fine-tune nuevo: es un artefacto de empaquetado que adapta un GGUF preexistente de 36B parametros para su ejecucion en las GPUs AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se genera con la herramienta `loom-next`, sin intervencion de un LLM en el proceso.

El interes del paquete es de infraestructura mas que de modelado: incluye mediciones comparativas frente a llama.cpp ROCm (build `llamacpp-rocm/b1374`) sobre el mismo GGUF, los mismos prompts y el mismo runner. En Strix Halo, Loom reporta mejoras de decodificacion de entre el +5 % y el +10 % y de prefill de entre el +93 % y el +110 % respecto al mejor backend de llama.cpp medido, ademas de un +23 % en agregado de 4 streams. Para los R9700, el autor indica explicitamente que los resultados aun no se han re-medido.

La relevancia es acotada pero concreta: ofrece a desarrolladores con hardware AMD una via de despliegue reproducible (comandos `loom-fetch` y `loom-serve`, API compatible con OpenAI) para un modelo de 36B en cuantizacion Q4_K_M, con metricas publicas y metodologia documentada. La licencia es MIT, aunque las condiciones del modelo base deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no describe la arquitectura del checkpoint base; se ejecuta como GGUF) |
| Parametros totales | 36B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65536 tokens (argumento `-c 65536` usado en la comparacion con llama.cpp; contexto maximo nativo no disponible) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT (metadatos del paquete); licencia del modelo base no verificada en la informacion disponible |
| Formato de pesos | GGUF (`FINAL-Bench_Darwin-36B-Opus-Q4_K_M.gguf`) empaquetado como programa `.loom` + `model.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del checkpoint base (`FINAL-Bench_Darwin-36B-Opus`): la model card del paquete Loom no describe si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla el dataset de entrenamiento, el numero de tokens, las fases de RLHF/DPO o las tecnicas de alineamiento aplicadas. Tampoco se documenta el proceso de creacion del modelo original por parte de bartowski, que en este caso actua como publicador del GGUF.

La innovacion tecnica del artefacto es el propio runtime Loom: el paquete incluye programas `.loom` y una tarjeta `model.json` generados por `loom-next` (el generador, sin LLM en el bucle) para ejecutar el GGUF sin modificarlo sobre ROCm. El despliegue usa `loom-serve` con opciones como `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo), `pool_backing=fixed` (reserva por adelantado el pool de memoria del preset) y `parameter_mode=preload` (afecta solo a la carga de pesos en host). No hay cabecera MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificacion especulativa no esta disponible en ninguna de las dos engines.

## Capacidades

- Generacion de texto conversacional a traves de una API estilo OpenAI (`/v1/chat/completions`), con nombre de modelo `final-bench_darwin-36b-opus`.
- Modo de razonamiento opcional controlable mediante `chat_template_kwargs` (`enable_thinking`), desactivado por defecto en el ejemplo de la model card.
- Servicio multi-stream: la comparativa incluye una prueba de 4 peticiones paralelas con agregado de tokens por segundo, lo que indica soporte de concurrencia en el servidor.
- Procesamiento de contexto largo: se miden escenarios de prefill de documentos de hasta 32k tokens y decodificacion tras contextos de ~32k.
- Despliegue local en hardware AMD consumer y profesional (Strix Halo y R9700) mediante `loom-fetch` y `loom-serve`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un modelo de 36B en un mini-PC con Ryzen AI Max+ 395: el paquete permite servir el modelo en cuantizacion Q4_K_M con dos comandos (`loom-fetch` y `loom-serve`), sin compilar llama.cpp ni configurar ROCm manualmente, lo que simplifica el montaje de un asistente local en un equipo de sobremesa.
- Servicio de chat con API compatible con OpenAI: al exponer `/v1/chat/completions` en `127.0.0.1:8080`, se puede conectar cualquier cliente que hable el protocolo de OpenAI (SDKs, frameworks de orquestacion, interfaces de chat) apuntando a la URL local, sin cambiar codigo de aplicacion.
- Procesamiento de documentos largos: con prefill medido de 2100 a 2693 tok/s en Strix Halo para documentos de 1k a 32k tokens, resulta adecuado para resumir o extraer informacion de contratos, informes o articulos extensos en una sola pasada dentro de la ventana de 64k.
- Evaluacion comparativa de runtimes en hardware AMD: las tablas de rendimiento frente a llama.cpp ROCm permiten a un equipo de infraestructura decidir que engine usar para un GGUF concreto en Strix Halo, con datos de decodificacion, prefill y concurrencia medidos bajo la misma metodologia.
- Atencion a varios usuarios simultaneos en un solo equipo: el escenario de 4 streams con 164 tok/s agregados en Loom permite dar servicio a un pequeno grupo (por ejemplo, un equipo de desarrollo interno) desde una unica GPU Strix Halo.
- Prototipado en una Radeon AI PRO R9700 de 32 GB: el paquete incluye comandos especificos para gfx1201, lo que permite montar un entorno de pruebas en una estacion de trabajo con GPU profesional AMD antes de escalar a produccion, aunque las metricas para esa GPU aun no estan re-medidas.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG): la ventana de 64k y la velocidad de prefill permiten inyectar varios fragmentos recuperados en el prompt y generar la respuesta con latencia razonable en local.

## Benchmarks y rendimiento

Las unicas cifras publicadas son las comparativas de runtime (Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374`) sobre el mismo GGUF Q4_K_M en AMD Strix Halo (gfx1151), medidas el 2026-11-26 en runners de AMD DevLab Dispatch, con mediana de 3 sesiones. No se publican resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros).

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 60.8 | 66.9 | +10 % |
| Decode tok/s, contexto 2k | 59.4 | 64.8 | +9 % |
| Decode tok/s, contexto 32k | 50.1 | 52.4 | +5 % |
| Prefill tok/s, documento 1k | 1190.4 | 2298.1 | +93 % |
| Prefill tok/s, documento 2k | 1276.4 | 2537.6 | +99 % |
| Prefill tok/s, documento 8k | 1282.7 | 2692.9 | +110 % |
| Prefill tok/s, documento 16k | 1179.1 | 2427.6 | +106 % |
| Prefill tok/s, documento 32k | 1008.5 | 2100.6 | +108 % |
| 4 streams, decode agregado tok/s | 132.9 | 164.0 | +23 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

Notas de metodologia relevantes: llama.cpp se ejecuto con `-ngl 99 -cram 0 -c 65536 -np 1`; Loom se sirvio con espera activa y el preset del paquete, sin barrido de ajustes en ninguna de las dos engines; las filas de un solo stream se midieron sin drafting; un margen dentro de +-3 % se considera empate. Para la Radeon AI PRO R9700 (gfx1201, 32 GB) el autor indica que los resultados de este paquete aun no se han re-medido. La roofline no se calculo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta orientado a GPUs con 32 GB (R9700) y a la memoria unificada del Ryzen AI Max+ 395. Un GGUF de 36B en Q4_K_M ocupa tipicamente en torno a 20-22 GB de pesos, pero el autor no publica la cifra exacta.
- GPUs objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPU en la informacion disponible.
- GPU consumer: el paquete no declara compatibilidad con GPUs consumer de NVIDIA ni con otras Radeon; solo se documentan las dos plataformas AMD citadas.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`, instalado con `pipx`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. La comparativa usa llama.cpp ROCm como referencia, pero el paquete en si esta pensado para Loom.
- Latencia y throughput: en Strix Halo, 66.9 tok/s de decodificacion con prompt corto, 64.8 tok/s a 2k de contexto y 52.4 tok/s a 32k; prefill de 2100 a 2693 tok/s segun longitud; 164 tok/s agregados con 4 streams. Para R9700, no disponible.
- Memoria: el preset usa `pool_backing=fixed`, que reserva el pool de memoria por adelantado en lugar de crecer de forma elastica; conviene dimensionar el pool segun la VRAM disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (paquetes Loom para otros GGUF, o modelos de 36B con cuantizacion Q4_K_M orientados a AMD). La unica comparacion publicada es de runtime, no de modelo: Loom frente a llama.cpp ROCm sobre el mismo checkpoint.

| Aspecto | Este paquete (Loom) | llama.cpp ROCm (referencia en la model card) |
|---|---|---|
| Modelo | FINAL-Bench_Darwin-36B-Opus Q4_K_M | Mismo GGUF |
| Hardware medido | Strix Halo (gfx1151) | Strix Halo (gfx1151) |
| Decode, prompt corto | 66.9 tok/s | 60.8 tok/s |
| Prefill, documento 8k | 2692.9 tok/s | 1282.7 tok/s |
| 4 streams agregados | 164.0 tok/s | 132.9 tok/s |
| API | Estilo OpenAI | Servidor propio de llama.cpp |
| Licencia del paquete | MIT | no aplica |

## Limitaciones y advertencias

- El paquete no incluye informacion sobre sesgos del modelo base; no se pueden evaluar riesgos de sesgo con los datos disponibles.
- Riesgo de alucinacion: no documentado en la model card; al ser un modelo generativo de 36B sin ficha de evaluacion publicada, debe asumirse el riesgo habitual y validar las salidas en produccion.
- La licencia MIT corresponde al paquete Loom; la licencia y condiciones de uso comercial del checkpoint base `bartowski/FINAL-Bench_Darwin-36B-Opus-GGUF` no se verifican en la informacion proporcionada y deben comprobarse antes de un uso comercial.
- Solo se incluye la cuantizacion Q4_K_M; no hay variantes Q5, Q6, Q8 ni FP16 en este paquete.
- No hay cabecera MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificacion especulativa no esta disponible y no se pueden esperar ganancias por ese mecanismo.
- Las metricas de rendimiento solo cubren Strix Halo; para la Radeon AI PRO R9700 el autor indica que no se han re-medido, por lo que no hay datos de rendimiento para esa GPU.
- Las mediciones se hicieron en runners de AMD DevLab Dispatch que difieren entre sesiones, y la comparacion usa el preset del paquete sin barrido de ajustes; los margenes son especificos de esa configuracion y no garantizan los mismos resultados en otros entornos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y el repositorio ocupa 0.0 GB, lo que sugiere que los pesos no estan alojados en el propio repositorio de Hugging Face o que el paquete es un artefacto ligero de instrucciones y metadatos.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- La fecha de creacion del repositorio (2026-11-26) y la referencia a commits de `hrx-system` "desconocidos, recuperados" en la metodologia introducen incertidumbre sobre la reproducibilidad exacta del entorno medido.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-FINAL-Bench_Darwin-36B-Opus-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/FINAL-Bench_Darwin-36B-Opus-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Run de DevLab Dispatch con las mediciones: https://github.com/loom-fun/loom-next/actions/runs/45875476382
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
