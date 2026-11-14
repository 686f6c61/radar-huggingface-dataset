# loom-fun-staging/bartowski-Mellum2.1-12B-A2.5B-Thinking-loom

## Resumen

Mellum2.1-12B-A2.5B-Thinking-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Mellum2.1-12B-A2.5B-Thinking-Q4_K_M.gguf`, publicado originalmente por bartowski. Lo mantiene el espacio `loom-fun-staging`, vinculado al ecosistema Loom para GPUs AMD, y su proposito no es reentrenar ni alterar el modelo, sino ofrecer una via de ejecucion optimizada sobre hardware AMD concreto: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Mixture of Experts (MoE) de 12B parametros totales y 2,5B parametros activos, con modo de razonamiento ("thinking") activado por defecto, contexto de 131.072 tokens por peticion y soporte de tool calling en formato OpenAI. El paquete Loom expone un servidor compatible con `/v1/chat/completions`, admite 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por peticion.

La relevancia actual es doble: por un lado, demuestra la viabilidad de servir un MoE de 12B cuantizado en Q4_K_M sobre GPUs de consumo y semipro de AMD mediante un runtime alternativo a llama.cpp; por otro, publica cifras de rendimiento frente a un techo roofline calculado para Strix Halo, lo que permite evaluar la eficiencia del motor con numeros concretos en lugar de afirmaciones genericas. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer; detalles de capas y atencion no disponibles |
| Parametros totales | 12B (segun denominacion del modelo) |
| Parametros activos | 2,5B (segun denominacion del modelo) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del modelo base no verificadas en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Mellum2.1-12B-A2.5B-Thinking-Q4_K_M.gguf`) empaquetado como Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El checkpoint subyacente es un modelo de lenguaje de tipo Mixture of Experts con 12B parametros totales y 2,5B activos por token, distribuido en formato GGUF con cuantizacion Q4_K_M. La informacion disponible no detalla el numero de capas, la configuracion de atencion (cabezas, dimension de embedding, tipo de atencion), la funcion de enrutamiento de expertos ni la composicion exacta del dataset de entrenamiento; estos datos deben consultarse en la model card del checkpoint original de bartowski o del autor primigenio del modelo.

El paquete Loom no modifica los pesos: genera programas `.loom` y una tarjeta `model.json` que permiten ejecutar el mismo GGUF sobre GPUs AMD mediante el runtime `hrx-loom` (version 0.1.0, instalable como `hrx-loom[hf]`). El flujo de generacion usa la herramienta `loom-skills`. La innovacion tecnica destacable no esta en el modelo sino en el motor: kernels generados y validados contra implementaciones de referencia (gate `kernel_tests`), comparacion token a token contra llama.cpp (gates `golden` y `compare`), verificacion de consistencia bajo concurrencia y prueba de bucles de tool calling multi-turno (gate `agent`). No se emplea decodificacion especulativa: el GGUF no incluye cabeza MTP y no hay drafter publicado para este modelo exacto.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte verificado de bucles multi-turno mediante el gate `agent`.
- Servidor compatible con la API OpenAI en `/v1/chat/completions`, lo que facilita la integracion con clientes y frameworks existentes.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia de salida verificada (gate `consistency`).
- Contexto largo de 131.072 tokens por peticion, adecuado para documentos extensos.
- No soporta entrada de imagen ni de audio (marcado como "not applicable" en la model card).
- No soporta ajuste de esfuerzo de razonamiento ("reasoning effort" no aplicable).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de razonamiento sobre documentos largos: con 131.072 tokens de contexto por peticion, el modelo puede ingerir contratos, informes o bases de codigo completas y responder con razonamiento explicito activado por defecto, lo que facilita la auditoria de la cadena de pensamiento.
- Agentes con tool calling en produccion: el soporte OpenAI de `tools`/`tool_calls` y la validacion del gate `agent` permiten construir agentes que encadenan llamadas a APIs externas, consultas a bases de datos y ejecucion de comandos en un bucle multi-turno.
- Despliegue en estaciones de trabajo AMD sin GPU de datacenter: el paquete esta optimizado para Strix Halo y Radeon AI PRO R9700, de modo que equipos con hardware AMD consumer o semipro pueden servir un MoE de 12B en Q4_K_M con un consumo de memoria de aproximadamente 27 GB (`--memory_bytes=27000000000`).
- Backend de chat para equipos pequenos: con 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por peticion, encaja en entornos de prototipado o equipos internos donde no se justifica un cluster de GPUs.
- Evaluacion comparativa de runtimes: las tablas de rendimiento frente a llama.cpp y frente al techo roofline permiten usar este paquete como banco de pruebas para medir la eficiencia de Loom en hardware AMD concreto.
- Procesamiento por lotes de resumenes y extraccion de informacion: la ventana de 131k tokens y la cuantizacion Q4_K_M permiten procesar documentos extensos en una sola pasada sobre una unica GPU R9700 de 32 GB.
- Investigacion sobre cuantizacion y MoE: al ser un GGUF Q4_K_M sin modificar, sirve para estudiar el impacto de la cuantizacion en la calidad de salida comparando contra el checkpoint original en precision superior.

## Benchmarks y rendimiento

La model card publica cifras de techo roofline (no mediciones reales de Loom ni de llama.cpp; las columnas de medicion aparecen como "—") para Strix Halo (gfx1151) a 216 GB/s y 59 TFLOP/s:

| Metrica | Techo roofline (Strix Halo) |
|---|---|
| Decode tok/s, prompt corto | 116,7 |
| Decode tok/s, contexto 2k | 112,3 |
| Decode tok/s, contexto 32k | 91,8 |
| Prefill tok/s, documento 1k | 14.043,4 |
| Prefill tok/s, documento 2k | 13.316,4 |
| Prefill tok/s, documento 8k | 12.335,5 |
| Prefill tok/s, documento 16k | 11.255,9 |
| Prefill tok/s, documento 32k | 9.579,2 |
| 4 streams, decode agregado tok/s | 434,7 |
| Decodificacion especulativa, tokens aceptados | n/a (sin drafter ni cabeza MTP) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Para la Radeon AI PRO R9700 la model card indica explicitamente que los resultados "no se han vuelto a medir todavia". Los gates de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`) aparecen como "no re-ejecutados en este paquete"; la ultima pasada registrada fue sobre una build anterior con sha256 `d1b052d`.

## Requisitos de hardware

- Memoria: el comando de servicio usa `--memory_bytes=27000000000` (aproximadamente 27 GB), coherente con un GGUF Q4_K_M de un MoE de 12B.
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: la R9700 es una GPU profesional de 32 GB; no se documenta soporte para GPUs de consumo AMD (RX 7000/9000) ni para GPUs NVIDIA en este paquete concreto.
- Despliegue: runtime `hrx-loom` 0.1.0 (`pip install "hrx-loom[hf]==0.1.0"`), descarga con `loom-fetch` y servicio con `loom-serve`; el servidor escucha en `127.0.0.1:8080` y responde a peticiones estilo OpenAI.
- Alternativa de despliegue: al ser un GGUF estandar de bartowski, el mismo checkpoint puede servirse con llama.cpp, aunque las cifras de rendimiento publicadas en esta ficha corresponden a Loom.
- Latencia y throughput reales: no medidos en la informacion disponible; solo se publican los techos roofline de la seccion anterior.
- Concurrencia: 4 peticiones simultaneas soportadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking (Loom, este paquete) | 12B | 2,5B | 131.072 | Apache 2.0 | GGUF Q4_K_M empaquetado para Loom (AMD) |
| Mellum2.1-12B-A2.5B-Thinking-GGUF (bartowski) | 12B | 2,5B | no disponible en esta ficha | Apache 2.0 (heredada) | GGUF, multiples cuantizaciones, compatible con llama.cpp |
| llama.cpp ROCm (motor, no modelo) | n/a | n/a | n/a | MIT (tipica de llama.cpp) | Runtime alternativo; la model card lo usa como referencia de comparacion |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento real frente a otros modelos de la misma categoria (por ejemplo, otros MoE de 12B con 2-3B activos). La unica comparacion cuantitativa publicada es frente al techo roofline del hardware, no frente a modelos competidores.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, composicion del dataset ni evaluaciones de seguridad; se desconoce el comportamiento en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el modo "thinking" activado por defecto puede aumentar la longitud de las respuestas y el consumo de tokens sin garantizar mayor veracidad.
- Idiomas soportados no disponibles: no se puede confirmar la calidad en castellano ni en otros idiomas distintos del ingles sin evaluacion propia.
- Los gates de correctitud no se han re-ejecutado en este paquete concreto; la ultima validacion registrada corresponde a una build anterior (sha256 `d1b052d`), por lo que la equivalencia con llama.cpp no esta verificada para esta version.
- Las cifras de rendimiento publicadas son techos roofline, no mediciones reales de Loom ni de llama.cpp; no deben interpretarse como throughput esperado.
- Para la Radeon AI PRO R9700 no hay resultados de rendimiento ni de correctitud: el soporte esta declarado pero no medido en esta publicacion.
- Sin decodificacion especulativa: el GGUF no incluye cabeza MTP y no hay drafter publicado, lo que limita la latencia en decodificacion frente a configuraciones con speculative decoding.
- Maximo de 4.096 tokens de salida por peticion y 4 peticiones concurrentes: insuficiente para cargas de alta concurrencia o generaciones muy largas.
- El paquete esta atado al runtime Loom y a hardware AMD especifico; migrar a otro hardware requiere usar el GGUF original con otro motor.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del checkpoint base y de cualquier dependencia del runtime.

## Enlaces

- Paquete Loom en Hugging Face: https://huggingface.co/loom-fun-staging/bartowski-Mellum2.1-12B-A2.5B-Thinking-loom
- Checkpoint GGUF base (bartowski): https://huggingface.co/bartowski/Mellum2.1-12B-A2.5B-Thinking-GGUF
- Repositorio del runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
