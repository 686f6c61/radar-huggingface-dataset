# loom-fun-staging/unsloth-Qwen3.8-Flash-Next-loom

## Resumen

`loom-fun-staging/unsloth-Qwen3.8-Flash-Next-loom` es un paquete de distribucion para el runtime Loom (ROCm/hrx-system) del checkpoint GGUF `unsloth/Qwen3.8-Flash-Next-GGUF`, en su cuantizacion `UD-Q4_K_XL`. No se trata de un modelo entrenado por el autor del repositorio, sino de un empaquetado que incluye los programas `.loom` y un fichero `model.json` que permiten servir el modelo sobre GPUs integradas AMD mediante `loom-serve`, exponiendo una API compatible con OpenAI (`/v1/chat/completions`).

El modelo subyacente es Qwen3.8-Flash-Next, una variante multimodal (pipeline `image-text-to-text`) de la familia Qwen, distribuida en formato GGUF por Unsloth. El paquete incorpora decodificacion especulativa mediante un cabezal MTP (`mtp-Qwen3.8-Flash-Next-Q8_0.gguf`) y esta optimizado para el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), con 216 GB/s de ancho de banda de memoria y 59 TFLOP/s de pico.

Su relevancia es acotada pero concreta: demuestra que un modelo de gran tamano en Q4 puede servirse en hardware de consumo de gama alta con memoria unificada, superando a llama.cpp en las mismas condiciones de medida. El paquete depende de una build de desarrollo de hrx-loom (`0.2.0.dev0`, commit `314238a8`, artefacto CI `13628412621`) cuyas instrucciones de instalacion caducan el 2026-11-22.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con mezcla de expertos (MoE), segun la metodologia de roofline del autor; detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el autor asume enrutamiento a los mismos expertos en el calculo de roofline de 4 streams) |
| Longitud de contexto | 65 536 tokens en la configuracion de llama.cpp ROCm del benchmark; 36 864 en Vulkan; no se especifica el maximo del modelo |
| Tipos de cuantizacion | UD-Q4_K_XL (checkpoint empaquetado); el cabezal MTP en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (4 shards: `Qwen3.8-Flash-Next-UD-Q4_K_XL-00001-of-00004.gguf` a `-00004`) + paquete Loom (`model.json` y programas `.loom`) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo base. La model card del autor describe exclusivamente el empaquetado y el rendimiento del runtime. Los indicios tecnicos disponibles apuntan a una arquitectura transformer con mezcla de expertos: la metodologia de roofline menciona explicitamente "this mixture-of-experts model" y acota el techo de 4 streams asumiendo que las cuatro peticiones enrutan a los mismos expertos.

La innovacion destacable no esta en el modelo sino en el stack de inferencia. El paquete usa decodificacion especulativa con un cabezal MTP (multi-token prediction) en Q8_0 y profundidad de borrador 3 en Loom, con una tasa de aceptacion de tokens borradorados del 77 % en la puerta `spec`. El servidor Loom emplea espera activa (`completion_spin_ns=4294967295`) y `pool_backing=fixed`. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto multimodal: pipeline `image-text-to-text`, con soporte de entrada de imagen y texto (segun el tag y el pipeline declarado).
- Tool calling: la tabla de features del autor marca soporte con estado completado y lo describe como compatible con el esquema de OpenAI (la entrada disponible se corta en "OpenAI-").
- Servicio de API: endpoint `/v1/chat/completions` con formato OpenAI, servido en `127.0.0.1:8080`.
- Decodificacion especulativa: soporte de cabezal MTP con profundidad configurable.
- Procesamiento por lotes concurrente: medido con 4 streams en paralelo.
- Contexto largo: operativo hasta 32k tokens en las pruebas de decodificacion y prefill.
- Capacidades de razonamiento, codigo, matematicas, agentes o multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio local de chat multimodal sobre workstation AMD: desplegar `loom-serve` con el `model.json` en un Ryzen AI Max+ 395 para ofrecer una API OpenAI a herramientas internas, aprovechando los 41,9 tok/s de decodificacion en prompt corto.
- Procesamiento de documentos largos: con 1143,9 tok/s de prefill en documentos de 1k tokens y 1196,2 tok/s en 32k, resulta adecuado para ingerir contratos, informes o expedientes completos antes de una consulta.
- Asistente con imagenes en el puesto de trabajo: al ser un modelo `image-text-to-text`, puede recibir capturas, diagramas o fotos junto al texto en un flujo de soporte tecnico interno.
- Evaluacion de stacks de inferencia ROCm: usar el paquete como referencia reproducible para comparar Loom frente a llama.cpp ROCm y Vulkan con el mismo GGUF y los mismos prompts.
- Prototipado de agentes con tool calling: la API compatible con OpenAI permite conectar frameworks de agentes existentes sin adaptadores, aunque la documentacion de herramientas esta incompleta en la card.
- Inferencia multiinquilino ligera: con 67,6 tok/s agregados en 4 streams, sirve para un equipo pequeno con peticiones concurrentes moderadas.
- Laboratorio de decodificacion especulativa: el paquete incluye el cabezal MTP y permite medir tasas de aceptacion y ajustar la profundidad de borrador en hardware Strix Halo.

## Benchmarks y rendimiento

Rendimiento medido en AMD Strix Halo (gfx1151, 216 GB/s, 59 TFLOP/s), media de 3 rondas, mismo GGUF y mismos prompts:

| Metrica | llama.cpp ROCm | Loom | Margen | Roofline | Loom % roofline | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 34,4 | 41,9 | +22 % | 51,6 | 81 % | 34,2 |
| Decode tok/s, contexto 2k | 30,8 | 35,2 | +14 % | 45,8 | 77 % | 29,3 |
| Decode tok/s, contexto 32k | 24,2 | 33,2 | +37 % | 42,7 | 78 % | 24,0 |
| Prefill tok/s, documento 1k | 417,9 | 1143,9 | +174 % | 4829,0 | 24 % | 327,4 |
| Prefill tok/s, documento 2k | 442,3 | 1154,6 | +161 % | 4770,8 | 24 % | 352,4 |
| Prefill tok/s, documento 8k | 451,8 | 1179,0 | +161 % | 4651,1 | 25 % | 359,0 |
| Prefill tok/s, documento 16k | 425,5 | 1203,6 | +183 % | 4646,6 | 26 % | 340,2 |
| Prefill tok/s, documento 32k | 378,7 | 1196,2 | +216 % | 4637,6 | 26 % | 309,5 |
| 4 streams, decode agregado tok/s | 57,2 | 67,6 | +18 % | 135,1 | 50 % | 55,5 |
| Tokens borradorados aceptados (especulativa) | — | 77 % | — | n/a | n/a | — |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria necesaria: aproximadamente 118 GB segun el autor. No cabe en una AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Hardware de referencia: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) con memoria unificada; el roofline se calcula con 216 GB/s y 59 TFLOP/s.
- GPU consumer: no cabe en GPUs de consumo con memoria dedicada convencional (24 GB o menos). Solo es viable en plataformas de memoria unificada de gran capacidad como Strix Halo.
- Despliegue: `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295` y `--pool_backing=fixed`. Requiere hrx-loom `0.2.0.dev0` (artefacto CI `13628412621`), no la version de PyPI.
- Alternativa de despliegue: llama.cpp ROCm `llamacpp-rocm/b1371` o Vulkan `llamacpp-vulkan/b12211`, con `-ngl 99 -cram 0 --spec-type draft-mtp` y el modelo borrador MTP en Q8_0.
- Throughput: 41,9 tok/s en decodificacion de prompt corto y 1143,9 tok/s de prefill (1k) con Loom; 34,4 y 417,9 respectivamente con llama.cpp ROCm.
- Latencia: no se publican cifras de latencia por peticion (time to first token).

## Comparativa con modelos similares

| Aspecto | Qwen3.8-Flash-Next (Loom, UD-Q4_K_XL) | Mismo GGUF en llama.cpp ROCm b1371 | Mismo GGUF en llama.cpp Vulkan b12211 |
|---|---|---|---|
| Parametros | no disponible | no disponible | no disponible |
| Contexto probado | 65 536 | 65 536 | 36 864 |
| Decode prompt corto (tok/s) | 41,9 | 34,4 | 34,2 |
| Prefill 1k (tok/s) | 1143,9 | 417,9 | 327,4 |
| 4 streams agregado (tok/s) | 67,6 | 57,2 | 55,5 |
| Decodificacion especulativa | MTP, profundidad 3 | MTP, profundidad por defecto | MTP, profundidad por defecto |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad | paquete Loom con SDK en dev | estable | estable |

No se dispone de datos para comparar con otros modelos de la misma categoria en parametros, contexto o calidad.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: no se puede confirmar el uso comercial del paquete ni del modelo base sin consultar `unsloth/Qwen3.8-Flash-Next-GGUF`.
- Dependencia de una build de desarrollo: el paquete no funciona con la version de PyPI de hrx-loom; requiere el artefacto CI `13628412621`, que GitHub elimina el 2026-11-22. Las instrucciones de instalacion caducan en esa fecha.
- Requisito de memoria de ~118 GB: inviable en GPUs dedicadas de consumo y en la Radeon AI PRO R9700 de 32 GB.
- Repositorio practicamente vacio: 0,0 GB de tamano declarado, 0 descargas y 0 likes; el contenido real se materializa via `loom-fetch`.
- Model card incompleta: la tabla de features se corta en la entrada de tool calling y no se documentan idiomas, sesgos, alineacion ni evaluaciones de calidad.
- Sin datos de calidad: no hay benchmarks de MMLU, HumanEval, GSM8K ni evaluaciones de alucinacion o sesgo.
- Rendimiento de prefill limitado por roofline: Loom alcanza solo el 24-26 % del techo teorico en prefill, frente al 77-81 % en decodificacion.
- Mediciones con ruido: el propio autor fija en +-3 % el margen de ruido entre ejecuciones; los runners de DevLab difieren entre sesiones y la medicion de tokens aceptados (77 %) no registro el dispositivo ni la version de hrx-loom.
- El nombre "Loom" coincide con la herramienta comercial de grabacion de pantalla; las busquedas web sobre "Loom" devuelven resultados no relacionados con este paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Qwen3.8-Flash-Next-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de benchmark (DevLab Dispatch 43376548212): https://github.com/loom-fun/loom-skills/actions/runs/43376548212/job/131724300576
- Medicion de tokens aceptados (DevLab Dispatch 43100466508): https://github.com/loom-fun/loom-skills/actions/runs/43100466508/job/130790234113
