# loom-draft/LiquidAI-LFM2.5-1.2B-JP-loom

## Resumen

LiquidAI-LFM2.5-1.2B-JP-loom es un paquete de despliegue para el runtime AMD Loom, no un modelo entrenado desde cero. Lo publica el usuario loom-draft y empaqueta el checkpoint GGUF sin modificar LiquidAI/LFM2.5-1.2B-JP-GGUF (concretamente el fichero LFM2.5-1.2B-JP-Q4_K_M.gguf) en forma de programas `.loom` y una tarjeta `model.json`, generados con la herramienta loom-next. El objetivo es servir ese modelo de 1.200 millones de parametros en GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un LFM2.5 de LiquidAI afinado para japones, distribuido en cuantizacion Q4_K_M. La ficha del paquete no aporta detalles de arquitectura, datos de entrenamiento ni benchmarks de calidad del modelo: solo documenta el rendimiento del motor Loom frente a llama.cpp ROCm en la misma GPU y con el mismo GGUF. Es relevante ahora porque demuestra una alternativa de inferencia con backend propio para hardware AMD de consumo y estaciones de trabajo, con ganancias medidas de hasta el 49 % en decodificacion agregada multistream y del 40 % en prefill frente a llama.cpp.

La licencia declarada es MIT y el paquete se publica con cero descargas y cero likes en el momento de la consulta, creado el 26 de noviembre de 2026. No hay pipeline declarado ni lista de idiomas en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5 de LiquidAI; el paquete no detalla la arquitectura interna) |
| Parametros totales | 1.200 millones (1.2B, segun el identificador del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en la configuracion de referencia de llama.cpp (`-c 65536`); se miden escenarios de decodificacion a 2k y 32k |
| Tipos de cuantizacion | Q4_K_M (unico peso empaquetado) |
| Idiomas soportados | no disponible en los metadatos; el sufijo JP del modelo base sugiere afinado para japones |
| Licencia | MIT |
| Formato de pesos | GGUF (LFM2.5-1.2B-JP-Q4_K_M.gguf), empaquetado como programas `.loom` y `model.json` |

## Arquitectura y entrenamiento

El paquete no describe la arquitectura del modelo base ni su proceso de entrenamiento. Por el identificador se trata de un LFM2.5 de LiquidAI con 1.200 millones de parametros y afinado para japones, pero no se documentan el tipo de transformer, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Tampoco se detalla ninguna innovacion de decodificacion especulativa: la propia model card indica que no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, y la fila de decodificacion especulativa figura como no aplicable.

Lo que si se documenta es la capa de despliegue. Loom ejecuta el GGUF mediante programas `.loom` generados automaticamente por loom-next, sin LLM en el bucle, y expone una API compatible con OpenAI (`/v1/chat/completions`). El servidor admite opciones de espera activa de finalizacion en GPU (`completion_spin_ns`), pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). La comparativa de rendimiento se hizo con la espera activa activada en ambos casos y sin barrido de ajustes en ninguno de los dos motores.

## Capacidades

- Generacion de texto conversacional mediante API estilo OpenAI en `/v1/chat/completions`.
- Servicio multi-turno con prompts de hasta 32k tokens, segun los escenarios de decodificacion medidos a 2k y 32k.
- Procesamiento paralelo de peticiones: se miden 4 streams simultaneos con decodificacion agregada.
- Prefill de documentos largos de hasta 32k tokens con throughput medido.
- Afinado para japones, segun el identificador del modelo base (no confirmado en la ficha).
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Modo razonamiento o thinking: no aplicable segun la tabla de caracteristicas del paquete.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Servicio de chat en local sobre GPU AMD: el paquete se instala con `pipx install "hrx-loom[hf]==0.2.0"`, se descarga con `loom-fetch` y se sirve con `loom-serve`; encaja en estaciones con Strix Halo o R9700 que quieran una API compatible con OpenAI sin depender de CUDA.
- Procesamiento de documentos largos en japones: con 65.536 tokens de contexto configurados y un prefill medido de 9.826 tok/s para documentos de 8k en Strix Halo, es adecuado para resumir o extraer informacion de informes extensos.
- Atencion al cliente automatizada en japones: el modelo de 1.2B en Q4_K_M ocupa poco y permite mantener conversaciones multi-turno con contexto largo, con decodificacion de 231 tok/s tras 2k tokens de contexto en Strix Halo.
- Despliegue multiusuario ligero: con 4 streams agregando 962,8 tok/s en Strix Halo, puede atender varias sesiones concurrentes en una sola GPU de consumo.
- Prototipado y evaluacion de pipelines RAG: la ventana de 65.536 tokens y el throughput de prefill permiten inyectar varios fragmentos recuperados por consulta sin penalizacion severa.
- Inferencia en estaciones de trabajo AMD Radeon AI PRO R9700: el paquete incluye comandos especificos para gfx1201 con 32 GB de VRAM, pensado para entornos profesionales que ya usan ROCm.
- Pruebas de motores de inferencia alternativos: sirve como banco de pruebas reproducible para comparar Loom frente a llama.cpp ROCm con el mismo GGUF y las mismas peticiones.

## Benchmarks y rendimiento

Rendimiento del motor en Strix Halo (gfx1151), Loom frente a llama.cpp ROCm b1374, mismo GGUF y mismas peticiones, mediana de 6 sesiones:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 222,4 | 247,1 | +11 % |
| Decode tok/s, contexto 2k | 214,2 | 231,1 | +8 % |
| Decode tok/s, contexto 32k | 150,8 | 158,2 | +5 % |
| Prefill tok/s, documento 1k | 6.881,2 | 9.659,6 | +40 % |
| Prefill tok/s, documento 2k | 7.064,6 | 9.886,5 | +40 % |
| Prefill tok/s, documento 8k | 6.915,1 | 9.826,5 | +42 % |
| Prefill tok/s, documento 16k | 6.269,9 | 8.634,0 | +38 % |
| Prefill tok/s, documento 32k | 5.077,7 | 7.123,1 | +40 % |
| 4 streams, decode agregado tok/s | 645,8 | 962,8 | +49 % |
| Decodificacion especulativa | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados de este paquete aun no se han vuelto a medir. No hay benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un GGUF Q4_K_M de 1.2B suele ocupar del orden de 1 GB o menos en pesos, pero la ficha no lo confirma.
- GPUs soportadas segun el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs consumer distintas de las dos anteriores; no hay datos para RTX 4090, A100 ni H100.
- Despliegue: runtime Loom mediante `hrx-loom[hf]==0.2.0`, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo; API compatible con OpenAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este paquete.
- Throughput medido en Strix Halo: 247,1 tok/s de decodificacion con prompt corto, 158,2 tok/s a 32k de contexto y 962,8 tok/s agregados con 4 streams.
- Medicion realizada el 26 de noviembre de 2026 en runners AMD DevLab Dispatch (X2-LA03-S03-D05), Linux, con hrx-loom 0.2.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LiquidAI-LFM2.5-1.2B-JP-loom | 1.2B | 65.536 (config. de referencia) | GGUF Q4_K_M empaquetado en Loom | MIT | Paquete de despliegue para AMD; rendimiento medido frente a llama.cpp |
| LiquidAI/LFM2.5-1.2B-JP-GGUF | 1.2B | no disponible | GGUF | no disponible en la informacion | Checkpoint base sin modificar; mismo modelo, sin empaquetado Loom |
| llama.cpp ROCm b1374 (motor) | n/a | 65.536 en la comparativa | n/a | n/a | Referencia de rendimiento: 222,4 tok/s decode corto y 6.881 tok/s prefill 1k en Strix Halo |

No se dispone de datos de otros modelos de 1.2B comparables (parametros, contexto, benchmarks de calidad o licencia) en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no incluye benchmarks de calidad del modelo; solo se documenta rendimiento del motor. No hay evidencia publicada aqui sobre MMLU, HumanEval, GSM8K ni evaluaciones similares.
- Tool calling y modo de razonamiento figuran como no aplicables en la tabla de caracteristicas del paquete.
- La decodificacion especulativa no esta disponible: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto.
- El soporte de hardware esta limitado a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documentan otras GPUs.
- Los resultados de R9700 aun no se han re-medido; solo hay cifras publicadas para Strix Halo.
- La comparativa con llama.cpp se hizo sin barrido de ajustes en ninguno de los dos motores y con espera activa en Loom, lo que conviene tener en cuenta al reproducir las cifras.
- Sesgos, riesgo de alucinacion y limitaciones idiomaticas del modelo base no estan documentados en la ficha; el sufijo JP sugiere especializacion en japones, pero no se confirma el resto de idiomas.
- La licencia MIT se declara a nivel de paquete; no se detalla si el checkpoint base de LiquidAI tiene condiciones adicionales.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/LiquidAI-LFM2.5-1.2B-JP-loom
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45878896144
