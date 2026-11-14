# loom-fun-staging/ggml-org-LFM2.5-24B-A2B-loom

## Resumen

LFM2.5-24B-A2B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `ggml-org/LFM2.5-24B-A2B-GGUF`, concretamente del fichero `LFM2.5-24B-A2B-Q4_K_M.gguf`. Lo publica el espacio de staging `loom-fun-staging` mediante el flujo de trabajo `loom-skills`, y esta orientado a ejecutar el modelo en las GPU integradas AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y en la GPU dedicada AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Mixture of Experts (MoE) de 24B parametros totales y 2B parametros activos por token, aunque la informacion disponible no detalla la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion. El interes de este paquete no reside en el modelo en si, sino en el motor de inferencia: Loom es un runtime alternativo a llama.cpp que compila kernels especificos para arquitecturas AMD y expone una API compatible con OpenAI.

La relevancia actual es doble: por un lado, demuestra la viabilidad de servir un MoE de 24B en cuantizacion Q4_K_M en hardware consumer de gama alta con memoria unificada; por otro, publica cifras de rendimiento frente a llama.cpp ROCm con metodologia de roofline, aunque la tabla de comparacion aparece incompleta en la model card (los valores de llama.cpp y Loom no estan registrados). El paquete esta en estado de staging, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE); detalles internos no disponibles |
| Parametros totales | 24B |
| Parametros activos | 2B |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF, empaquetado como `.loom` + `model.json` |
| Modelo base | ggml-org/LFM2.5-24B-A2B-GGUF |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Memoria reservada en servidor | 24.000.000.000 bytes (~24 GB) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Muestreo | `temperature`, `top_p`, `top_k`, `seed` |

## Arquitectura y entrenamiento

El checkpoint subyacente es un transformer con capas MoE: 24B parametros totales con 2B activos por token, lo que situa la relacion de activacion en aproximadamente el 8,3 %. La model card del paquete Loom no documenta el numero de capas, la dimension oculta, el numero de expertos por capa ni la estrategia de enrutamiento. Tampoco se especifican los datos de entrenamiento (volumen de tokens, composicion del corpus), ni si hubo RLHF, DPO u otra etapa de alineacion.

La innovacion tecnica del paquete no esta en el modelo sino en el runtime. Loom genera kernels especificos para las arquitecturas gfx1151 y gfx1201 de AMD, sirve el modelo con espera activa (`completion_spin_ns=4294967295`) y aplica una cota de roofline calculada a partir del ancho de banda de memoria (216 GB/s) y la potencia de calculo (59 TFLOP/s) del Ryzen AI Max+ 395. La model card indica explicitamente que no hay cabeza MTP en el GGUF ni drafter publicado para este modelo concreto, por lo que la decodificacion especulativa no esta disponible. El razonamiento (`thinking`) esta siempre activo y no admite ajuste de esfuerzo.

## Capacidades

- Generacion de texto y razonamiento con modo `thinking` siempre activo.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agente.
- API compatible con OpenAI en `/v1/chat/completions`, lo que permite reutilizar clientes existentes.
- Contexto de 131.072 tokens por peticion, suficiente para documentos largos y conversaciones extensas.
- Concurrencia de 4 peticiones simultaneas con consistencia verificada (la salida concurrente debe coincidir con la ejecucion aislada).
- Muestreo configurable mediante `temperature`, `top_p`, `top_k` y `seed`.
- Sin entrada de imagen ni de audio (marcado como "not applicable" en la model card).
- Sin decodificacion especulativa (no aplicable para este checkpoint).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: con 131.072 tokens de contexto, el modelo puede mantener historiales de conversacion largos y documentacion de producto en la misma ventana, y el tool calling permite consultar sistemas de ticketing o CRM sin salir del bucle de agente.
- Generacion de codigo en pipelines de CI/CD: el soporte de `tool_calls` estilo OpenAI permite integrarlo en agentes que ejecutan tests, leen errores de compilacion y proponen parches, con la ventaja de que el modelo cabe en una GPU consumer de gama alta.
- Asistente de analisis de documentos largos: informes de 30k-100k tokens caben en una sola peticion, y el modo `thinking` siempre activo favorece tareas de extraccion y sintesis que requieren razonamiento encadenado.
- Despliegue en estaciones de trabajo con memoria unificada: el Ryzen AI Max+ 395 permite servir el modelo con ~24 GB reservados sin GPU dedicada, util para prototipado local y entornos de desarrollo sin acceso a la nube.
- Servicio interno de agentes multi-turno: la concurrencia de 4 peticiones y la comprobacion de consistencia (`consistency` gate) lo hacen adecuado para backends de agentes con varias sesiones simultaneas en una sola maquina.
- Evaluacion comparativa de runtimes de inferencia: al ser un paquete Loom con cifras de roofline y gates de correctitud frente a llama.cpp, sirve como banco de pruebas para medir el rendimiento de motores alternativos en hardware AMD.
- Prototipado de asistentes con razonamiento explicito: el `thinking` siempre activo resulta util en tareas de planificacion y descomposicion de problemas, aunque no permite desactivarlo para reducir latencia.

## Benchmarks y rendimiento

La model card incluye una tabla de rendimiento frente a llama.cpp ROCm, pero los valores de ambas columnas aparecen como "—" (no medidos). Solo se publican las cotas de roofline para Strix Halo (gfx1151) a 216 GB/s y 59 TFLOP/s:

| Metrica | Roofline (techo teorico) | llama.cpp | Loom |
|---|---|---|---|
| Decode tok/s, prompt corto | 140,4 | no medido | no medido |
| Decode tok/s, contexto 2k | 136,7 | no medido | no medido |
| Decode tok/s, contexto 32k | 98,4 | no medido | no medido |
| Prefill tok/s, documento 1k | 13.330,5 | no medido | no medido |
| Prefill tok/s, documento 2k | 13.208,2 | no medido | no medido |
| Prefill tok/s, documento 8k | 12.519,4 | no medido | no medido |
| Prefill tok/s, documento 16k | 11.705,5 | no medido | no medido |
| Prefill tok/s, documento 32k | 10.358,7 | no medido | no medido |
| 4 streams, decode agregado | 544,1 | no medido | no medido |
| Decodificacion especulativa | n/a | n/a | n/a |

Para la Radeon AI PRO R9700 (gfx1201), la model card indica que los resultados "no se han vuelto a medir todavia". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~24 GB segun el parametro `--memory_bytes=24000000000` del comando de servicio, para el GGUF Q4_K_M de 24B parametros totales.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada, 216 GB/s, 59 TFLOP/s) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- No se documenta compatibilidad con GPU NVIDIA ni con otras arquitecturas AMD distintas de gfx1151 y gfx1201.
- Cabe en la R9700 de 32 GB con margen; en Strix Halo depende de la asignacion de memoria unificada del sistema.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0`, descarga con `loom-fetch` y servicio con `loom-serve`; expone API OpenAI en `127.0.0.1:8080`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp aparece solo como referencia de comparacion).
- Throughput: solo se dispone de las cotas de roofline (hasta 140,4 tok/s de decode en prompt corto y 13.330,5 tok/s de prefill en 1k); no hay mediciones reales publicadas.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B (paquete Loom) | 24B | 2B | 131.072 | Q4_K_M | no disponible | AMD gfx1151 / gfx1201 |
| LFM2.5-24B-A2B-GGUF (original) | 24B | 2B | no disponible | GGUF (Q4_K_M entre otras) | no disponible | Generico (llama.cpp y otros) |
| llama.cpp ROCm (motor, no modelo) | n/a | n/a | n/a | GGUF | MIT (no confirmado en la informacion) | AMD ROCm |

La comparacion con modelos de la misma categoria (MoE de ~24B con ~2B activos) no esta disponible en la informacion proporcionada. El unico contraste documentado es frente al mismo checkpoint servido con llama.cpp ROCm, y las cifras de ambos motores no se publicaron.

## Limitaciones y advertencias

- Paquete en estado de staging: cero descargas y cero likes; no hay evidencia de uso en produccion.
- Los gates de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`) no se han vuelto a ejecutar sobre este paquete; el ultimo pase corresponde a una build anterior (sha256 `2300d75`).
- La tabla de rendimiento frente a llama.cpp esta vacia: no hay mediciones reales de decode ni prefill, solo cotas de roofline.
- La Radeon AI PRO R9700 no tiene resultados medidos para este paquete.
- Licencia no disponible: no se puede confirmar el uso comercial del modelo ni del runtime.
- Idiomas soportados no disponibles; no se puede garantizar calidad en castellano.
- Sesgos y riesgo de alucinacion: no documentados en la informacion disponible.
- El modo `thinking` esta siempre activo y no se puede desactivar ni ajustar su esfuerzo, lo que incrementa la latencia y el consumo de tokens en tareas simples.
- Sin decodificacion especulativa: no hay cabeza MTP en el GGUF ni drafter publicado, por lo que no se puede acelerar la decodificacion por esa via.
- Limitado a hardware AMD gfx1151 y gfx1201; no hay soporte documentado para NVIDIA u otras GPU.
- La salida maxima esta limitada a 4.096 tokens por peticion y la concurrencia a 4 peticiones, lo que restringe escenarios de alto trafico.
- Los resultados de busqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla y marca de ropa); no aportan informacion tecnica sobre este paquete.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/ggml-org-LFM2.5-24B-A2B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/LFM2.5-24B-A2B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
