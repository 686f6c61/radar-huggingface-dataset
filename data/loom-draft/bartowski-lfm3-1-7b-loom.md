# loom-draft/bartowski-LFM3-1.7B-loom

## Resumen

LFM3-1.7B-loom es un paquete de despliegue distribuido en Hugging Face por el usuario `loom-draft`, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `LFM3-1.7B-Q4_K_M.gguf` de `bartowski/LFM3-1.7B-GGUF` en el formato propietario de Loom (programas `.loom` y una tarjeta `model.json`), generado con el flujo de trabajo `loom-skills`. Su proposito es ofrecer un artefacto listo para servir el modelo base LFM3-1.7B sobre GPUs AMD concretas mediante el motor de inferencia `hrx-loom`/`loom-serve`.

El interes tecnico del paquete reside en el soporte de hardware y en las cifras de rendimiento publicadas frente a llama.cpp: esta optimizado para el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), la AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y GPUs Radeon gfx1201 de 16 GB como la RX 9070 XT y la RX 9070. El autor reporta incrementos de hasta un 21 % en decodificacion con contexto de 32k, un 51 % en prefill de documentos de 1k y un 73 % en decodificacion agregada con 4 streams frente a la mejor configuracion de llama.cpp.

La relevancia actual es acotada pero clara: el ecosistema de inferencia en GPUs AMD (ROCm) esta menos maduro que el de CUDA, y propuestas como Loom buscan exprimir el ancho de banda de memoria de APUs y GPUs RDNA con kernels y planificacion propios. El modelo subyacente, LFM3-1.7B de Liquid AI, es un transformer pequeno de 1.700 millones de parametros con modo de razonamiento opcional, adecuado para despliegues locales de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM3-1.7B de Liquid AI); el paquete en si es un artefacto de despliegue Loom |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 32.000 tokens como minimo (se reportan mediciones de decodificacion y prefill a 32k de contexto); maximo oficial no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) en el paquete; el repositorio base de bartowski ofrece otras cuantizaciones GGUF no detalladas aqui |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` y `model.json` |

## Arquitectura y entrenamiento

El modelo subyacente es LFM3-1.7B, un transformer decoder-only de 1.700 millones de parametros desarrollado por Liquid AI. La informacion proporcionada no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas especificas del checkpoint original mas alla de la existencia de un modo de razonamiento opcional, que se desactiva en la peticion de ejemplo mediante `chat_template_kwargs: {"enable_thinking": false}`.

El paquete Loom anade una capa de despliegue: presets de memoria y planificacion especificos por GPU (Strix Halo, R9700 y gfx1201 de 16 GB), con opciones de servido como `--pool_backing=fixed` (reserva anticipada del pool de memoria), `--parameter_mode=preload` (carga de pesos en host antes de transferir) y `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU). Las mediciones publicadas comparan Loom con llama.cpp ROCm `llamacpp-rocm/b1374` y llama.cpp Vulkan `llamacpp-vulkan/b12211` usando el mismo GGUF, el mismo tipo de runner y los mismos prompts, con medianas de 6 sesiones.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con `/v1/chat/completions`.
- Modo de razonamiento opcional (thinking mode), desactivable por peticion con `enable_thinking: false`.
- Servido concurrente: las pruebas del autor incluyen 4 streams simultaneos con 611,0 tok/s agregados en Strix Halo.
- Procesamiento de documentos largos: prefill medido con documentos de 1k, 2k, 8k, 16k y 32k tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponible (el paquete solo referencia el checkpoint de texto GGUF).

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete permite levantar un endpoint compatible con OpenAI (`http://127.0.0.1:8080/v1/chat/completions`) sobre una RX 9070 XT o una APU Strix Halo, sin dependencia de CUDA, con 161,7 tok/s de decodificacion en prompts cortos.
- Procesamiento de documentos de hasta 32k tokens en local: el prefill de 5.634,7 tok/s a 32k en Strix Halo permite resumir o extraer informacion de contratos, informes o transcripciones sin enviar datos a la nube.
- Servicio multiusuario ligero: con 4 streams agregando 611,0 tok/s en Strix Halo, un unico equipo puede atender a varios usuarios concurrentes en tareas de chat o clasificacion.
- Prototipado de aplicaciones sobre ROCm: util para equipos que desarrollan sobre GPUs AMD y necesitan un modelo pequeno con contexto largo para validar pipelines de RAG o agentes antes de escalar a modelos mayores.
- Evaluacion comparativa de motores de inferencia: las tablas de rendimiento frente a llama.cpp ROCm y Vulkan sirven como referencia reproducible para decidir el stack de servido en hardware AMD.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT del paquete y del checkpoint facilita la integracion en productos comerciales internos.
- Inferencia de baja latencia en el borde: con 1.7B de parametros en Q4_K_M, el modelo cabe holgadamente en 16 GB de VRAM y deja margen para el contexto KV, lo que permite ejecutarlo en GPUs de gama media.

## Benchmarks y rendimiento

Rendimiento del motor Loom frente a llama.cpp con el mismo GGUF en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151):

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp | Roofline | Loom % del roofline | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decodificacion tok/s, prompt corto | 137,4 | 161,7 | +12 % | 195,1 | 83 % | 144,3 |
| Decodificacion tok/s, contexto 2k | 122,4 | 155,7 | +12 % | 190,4 | 82 % | 138,8 |
| Decodificacion tok/s, contexto 32k | 99,8 | 126,1 | +21 % | 143,7 | 88 % | 104,0 |
| Prefill tok/s, documento 1k | 4.817,7 | 7.294,6 | +51 % | 19.878,9 | 37 % | 4.189,9 |
| Prefill tok/s, documento 2k | 5.099,9 | 7.032,4 | +38 % | 19.715,6 | 36 % | 4.026,1 |
| Prefill tok/s, documento 8k | 5.149,2 | 7.223,8 | +40 % | 18.789,8 | 38 % | 4.108,4 |
| Prefill tok/s, documento 16k | 4.838,4 | 6.525,5 | +35 % | 17.682,6 | 37 % | 3.537,0 |
| Prefill tok/s, documento 32k | 4.128,5 | 5.634,7 | +36 % | 15.818,4 | 36 % | 2.991,9 |
| 4 streams, decodificacion agregada tok/s | 308,1 | 611,0 | +73 % | 753,0 | 81 % | 353,0 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a | n/a | n/a |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores miden exclusivamente rendimiento del motor de inferencia, no capacidad del modelo.

## Requisitos de hardware

- VRAM estimada: el paquete esta pensado para GPUs de 16 GB (preset `chat-16gb` con presupuesto de memoria de 15.000.000.000 bytes) y para la R9700 de 32 GB; el checkpoint Q4_K_M de 1.7B ocupa en torno a 1 GB de pesos, por lo que el grueso del presupuesto se destina al contexto KV y a los slabs de estado y pesos.
- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), AMD Radeon AI PRO R9700 (gfx1201, 32 GB), AMD Radeon RX 9070 XT y RX 9070 (gfx1201, 16 GB).
- Cabe en GPU de consumo: si, en las Radeon RX 9070 XT y RX 9070 mediante el preset de 16 GB; no se documenta soporte para GPUs NVIDIA ni para otras Radeon.
- Opciones de despliegue: motor Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve`); el mismo GGUF puede servirse con llama.cpp ROCm o Vulkan, que son la referencia comparativa del autor.
- Latencia y throughput: en Strix Halo, 161,7 tok/s de decodificacion con prompt corto, 126,1 tok/s a 32k de contexto y 5.634,7 tok/s de prefill a 32k; con 4 streams concurrentes, 611,0 tok/s agregados. No se publican cifras para R9700 ni para las RX 9070 en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-loom (este paquete) | 1,7B | 32k documentado en pruebas | MIT | GGUF Q4_K_M empaquetado para Loom; tambien servible con llama.cpp | Optimizado para GPUs AMD gfx1151 y gfx1201 |
| LFM3-1.7B (bartowski GGUF) | 1,7B | no disponible | no disponible en la informacion proporcionada | GGUF con multiples cuantizaciones | Checkpoint base sin empaquetar; compatible con llama.cpp, Ollama y otros |
| llama.cpp ROCm / Vulkan con el mismo GGUF | 1,7B | 32k en las pruebas | MIT (llama.cpp) | GGUF | Referencia de rendimiento: entre un 12 % y un 73 % por debajo de Loom en las metricas publicadas |

No se dispone de datos de benchmarks de calidad que permitan comparar LFM3-1.7B con otras familias de modelos de tamano similar (Qwen, Llama, Gemma) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo nuevo ni un fine-tuning: es un empaquetado de despliegue de un GGUF ajeno. Cualquier limitacion del checkpoint LFM3-1.7B original se hereda sin cambios.
- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un modelo de 1.7B entrenado por Liquid AI, es esperable un alineamiento y una cobertura linguistica mas limitados que los de modelos mayores, pero no hay datos que lo cuantifiquen.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en un modelo de este tamano el riesgo es relevante para tareas factuales sin verificacion externa.
- Idiomas: no se especifica la lista de idiomas soportados; no se debe asumir un rendimiento solido en castellano sin evaluacion previa.
- Contexto: las pruebas llegan a 32k tokens, pero no se documenta la longitud maxima oficial ni la degradacion de calidad mas alla de esa ventana.
- Compatibilidad de hardware restringida: el paquete esta generado para gfx1151 y gfx1201; no se documenta soporte para NVIDIA, otras Radeon ni CPU.
- Dependencia de una version concreta del runtime: las instrucciones fijan `hrx-loom[hf]==0.2.0`; cambios de version pueden alterar el comportamiento de los presets.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-24; no hay evidencia de uso en produccion ni de mantenimiento continuado.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar la licencia del checkpoint base LFM3-1.7B, que no se detalla en la informacion proporcionada.
- Los enlaces de busqueda web devueltos corresponden a servicios no relacionados (Loom Inc., la marca de videomensajes, y la firma de ropa Loom); no aportan informacion sobre este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-LFM3-1.7B-loom
- Checkpoint base GGUF: https://huggingface.co/bartowski/LFM3-1.7B-GGUF
- Organizacion del modelo original: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia de llama.cpp (DevLab Dispatch): https://github.com/loom-fun/loom-skills/actions/runs/43376548212/job/131724300441
- Ejecucion de referencia de Loom (DevLab Dispatch): https://github.com/loom-fun/loom-skills/actions/runs/44088653570/job/134057765586
