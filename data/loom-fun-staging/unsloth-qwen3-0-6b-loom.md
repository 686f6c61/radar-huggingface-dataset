# loom-fun-staging/unsloth-Qwen3-0.6B-loom

## Resumen
El modelo `loom-fun-staging/unsloth-Qwen3-0.6B-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Qwen3-0.6B-GGUF`, en su cuantización `Qwen3-0.6B-Q4_K_M.gguf`. Lo publica la organización `loom-fun-staging` mediante el flujo de trabajo `loom-skills`, y está orientado específicamente a la ejecución sobre GPUs AMD: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El interés del artefacto no reside en el modelo en sí (Qwen3-0.6B es un transformer denso de 0,6 mil millones de parámetros de la familia Qwen3), sino en el motor de inferencia Loom que lo acompaña, distribuido como paquete `hrx-loom` y servido mediante `loom-serve` con una API compatible con OpenAI (`/v1/chat/completions`) en `127.0.0.1:8080`. La model card publica comparativas de rendimiento frente a llama.cpp ROCm y llama.cpp Vulkan sobre el mismo GGUF y las mismas peticiones.

La relevancia es acotada pero concreta: ofrece una vía de despliegue optimizada para hardware AMD consumer y profesional reciente, con cifras medidas en runners de AMD DevLab, y un formato reproducible (`.loom` + `model.json`) que permite materializar el paquete con `loom-fetch`. No hay información sobre licencia, idiomas ni pipeline declarados en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-0.6B); el paquete Loom es un artefacto de despliegue, no una arquitectura nueva |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32k tokens en las pruebas publicadas (decode a ~32k y prefill de 32k documentos); la longitud máxima nativa del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (única cuantización empaquetada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Qwen3-0.6B-Q4_K_M.gguf`) empaquetado como programas `.loom` + `model.json` |
| Modelo base | unsloth/Qwen3-0.6B-GGUF |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Servidor | `loom-serve`, API compatible OpenAI en `127.0.0.1:8080` |
| Memoria reservada en ejemplo | `--memory_bytes=17000000000` (17 GB) |

## Arquitectura y entrenamiento
El modelo subyacente es Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros. Este repositorio no entrena ni afina el modelo: toma el GGUF publicado por Unsloth y lo reempaqueta como paquete Loom. Por tanto, no hay datos de entrenamiento, composición de dataset, número de tokens ni procesos de RLHF/DPO documentados en la información disponible para este artefacto.

La innovación técnica está en el runtime Loom: ejecuta el GGUF sobre GPUs AMD mediante el stack ROCm, con un modo de espera activa configurable (`completion_spin_ns=4294967295`) y una ruta de atención que, según la model card, permite caché KV unificada en el backend ROCm (a diferencia del build Vulkan, que usa cachés por slot). No se documenta decodificación especulativa: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que las filas de speculative decoding aparecen como `n/a`.

## Capacidades
- Generación de texto y conversación multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Procesamiento de prompts largos: se han medido prefills de hasta 32k tokens.
- Decodificación con contexto largo: se han medido decodes tras ~2k y ~32k tokens de contexto.
- Servicio concurrente: se han medido 4 streams paralelos con decodificación agregada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso
- Despliegue local en Strix Halo: servir el modelo con `loom-serve` sobre un Ryzen AI Max+ 395 usando el paquete `.loom`, aprovechando la ruta ROCm y el modo de espera activa para minimizar latencia de decodificación en un equipo integrado.
- Inferencia en Radeon AI PRO R9700: ejecutar el mismo paquete en una GPU profesional de 32 GB, donde la model card reporta 512,7 tok/s de decode en prompt corto frente a 339,9 tok/s de llama.cpp ROCm (+51 %).
- Servicio concurrente de baja latencia: atender 4 peticiones simultáneas con 1785,5 tok/s agregados en R9700 (+110 % frente a llama.cpp ROCm), adecuado para prototipos de chat multiusuario o tareas de clasificación en lote.
- Procesamiento de documentos largos: usar el prefill medido con documentos de 1k a 32k tokens (35.861 tok/s a 1k y 10.641 tok/s a 32k en R9700) para resumir, extraer o clasificar textos extensos en pipelines internos.
- Sustitución de llama.cpp en entornos AMD: migrar un servicio existente basado en llama.cpp ROCm a Loom manteniendo el mismo GGUF y las mismas peticiones, con una API compatible con OpenAI que evita reescribir clientes.
- Evaluación comparativa de motores de inferencia: usar el paquete como banco de pruebas reproducible para medir decode, prefill y concurrencia entre motores sobre el mismo checkpoint y el mismo hardware.
- Prototipado rápido de asistentes conversacionales: al ser un modelo de 0,6B en Q4_K_M, cabe holgadamente en memoria y permite iterar sobre prompts y flujos conversacionales sin coste de GPU dedicada.

## Benchmarks y rendimiento
Rendimiento medido en AMD Radeon AI PRO R9700 (gfx1201, 32 GB), mismo GGUF y mismas peticiones. Media de 3 rondas (4 streams: mediana de 3).

| Metrica | llama.cpp ROCm b1375 | Loom | Margen | Roofline | Loom % roofline | llama.cpp Vulkan b12211 |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 339,9 | 512,7 | +51 % | 1535,5 | 33 % | 456,9 |
| Decode tok/s, contexto 2k | 289,4 | 365,9 | +26 % | 967,5 | 38 % | 405,9 |
| Decode tok/s, contexto 32k | 108,6 | 119,2 | +10 % | 147,8 | 81 % | 123,6 |
| Prefill tok/s, documento 1k | 25.704,8 | 35.861,4 | +40 % | 77.348,7 | 46 % | 18.695,6 |
| Prefill tok/s, documento 2k | 26.596,7 | 37.319,5 | +40 % | 69.358,1 | 54 % | 21.207,8 |
| Prefill tok/s, documento 8k | 19.944,6 | 14.049,4 | -30 % | 42.818,0 | 33 % | 16.476,5 |
| Prefill tok/s, documento 16k | 13.964,5 | 11.818,2 | -15 % | 28.352,5 | 42 % | 11.248,9 |
| Prefill tok/s, documento 32k | 8.628,4 | 10.641,3 | +23 % | 16.920,0 | 63 % | 6.827,6 |
| 4 streams, decode agregado tok/s | 851,2 | 1785,5 | +110 % | 3603,6 | 50 % | 1015,9 |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a | n/a | n/a | n/a |

En Strix Halo (gfx1151), la model card solo publica los valores de roofline, sin mediciones de llama.cpp ni de Loom: decode 552,8 tok/s (prompt corto), 348,3 tok/s (2k), 53,2 tok/s (32k); prefill 59.267,2 tok/s (1k), 53.144,5 (2k), 32.808,6 (8k), 21.724,6 (16k), 12.964,7 (32k); 4 streams agregados 1297,3 tok/s. El roofline se calcula a 216 GB/s y 59 TFLOP/s.

## Requisitos de hardware
- VRAM estimada: el ejemplo de servicio reserva `--memory_bytes=17000000000` (17 GB), una cota superior amplia para un modelo de 0,6B en Q4_K_M; el peso real del GGUF es muy inferior, pero no se detalla en la información disponible.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para GPUs NVIDIA en este paquete.
- GPU consumer: al ser un modelo de 0,6B en Q4_K_M, cabría en GPUs consumer convencionales, pero el paquete está generado y validado solo para las dos GPUs AMD indicadas; no hay datos de despliegue en otras.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, materialización con `loom-fetch` y servicio con `loom-serve`. La API es compatible con OpenAI.
- Latencia y throughput: en R9700, 512,7 tok/s de decode en prompt corto y 119,2 tok/s a 32k de contexto; 1785,5 tok/s agregados con 4 streams. En Strix Halo solo hay cifras de roofline (552,8 tok/s en prompt corto, 53,2 tok/s a 32k).

## Comparativa con modelos similares
No se dispone de comparativas con otros modelos en la información proporcionada. La model card compara motores de inferencia (llama.cpp ROCm, llama.cpp Vulkan y Loom) sobre el mismo modelo, no modelos entre sí.

| Criterio | Este paquete (Loom) | llama.cpp ROCm b1375 | llama.cpp Vulkan b12211 |
|---|---|---|---|
| Modelo | Qwen3-0.6B Q4_K_M | Qwen3-0.6B Q4_K_M | Qwen3-0.6B Q4_K_M |
| Hardware | R9700 gfx1201 | R9700 gfx1201 | R9700 gfx1201 |
| Decode prompt corto (tok/s) | 512,7 | 339,9 | 456,9 |
| Decode 32k (tok/s) | 119,2 | 108,6 | 123,6 |
| Prefill 1k (tok/s) | 35.861,4 | 25.704,8 | 18.695,6 |
| 4 streams agregados (tok/s) | 1785,5 | 851,2 | 1015,9 |
| Caché KV | unificada | unificada | por slot (sin atención fusionada) |
| API | OpenAI-compatible | servidor propio | servidor propio |

## Limitaciones y advertencias
- Repositorio con 0 descargas y 0 likes; es un artefacto de staging (`loom-fun-staging`), sin señales de adopción ni mantenimiento.
- Licencia no declarada en el repositorio: no se puede asumir uso comercial sin verificar la licencia del modelo base Qwen3-0.6B y del GGUF de Unsloth por separado.
- Idiomas y pipeline no declarados; no hay garantías documentadas sobre cobertura lingüística.
- Modelo de 0,6B parámetros: capacidad de razonamiento y conocimiento factual limitada en comparación con modelos mayores; riesgo elevado de alucinación en tareas que requieran conocimiento específico.
- Soporte de tool calling, agentes y modo thinking no documentado para este paquete.
- Solo validado en dos GPUs AMD (gfx1151 y gfx1201); no hay datos de funcionamiento en otras GPUs, ni en CPU, ni en NVIDIA.
- El prefill a 8k y 16k en R9700 es peor que llama.cpp ROCm (-30 % y -15 %), por lo que no es la mejor opción para documentos de esa longitud en ese hardware.
- Sin decodificación especulativa: no hay cabeza MTP en el GGUF ni drafter publicado, así que no se puede acelerar por esa vía.
- Las mediciones provienen de runners efímeros de AMD DevLab que difieren entre sesiones; los argumentos del servidor llama.cpp ROCm no están registrados en el caso de Strix Halo, lo que limita la reproducibilidad exacta.
- El ejemplo de servicio reserva 17 GB de memoria, lo que puede ser excesivo para un modelo de este tamaño y conviene ajustar en producción.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Qwen3-0.6B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
