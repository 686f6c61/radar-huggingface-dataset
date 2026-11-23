# 1bit-MONSTER/Qwen3-4B-GGUF-loom

## Resumen

Qwen3-4B-GGUF-loom es una tarjeta de despliegue (card) para el runtime Loom de AMD, no un modelo entrenado desde cero. Empaqueta los pesos sin modificar de `unsloth/Qwen3-4B-GGUF` (concretamente el archivo `Qwen3-4B-Q4_K_M.gguf`, revisión `22c9fc8a...`, sha256 `f6f85177...`) junto con programas `.loom` y un `model.json` que permiten servirlos mediante `loom-serve` sobre la GPU integrada de los procesadores AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151). El autor es 1bit-MONSTER y deriva de las cards de loom-fun (Jeremy Fowers, Daniel Holanda) y de la infraestructura HRX/Loom de AMD.

El problema que resuelve es la portabilidad y el rendimiento de la inferencia de Qwen3-4B en hardware AMD con memoria unificada, sin recompilar ni reconvertir pesos. La card incorpora además un decodificador especulativo opcional (`Qwen3-4B-DFlash.Q8_0.gguf` de AtomicChat, licencia MIT) que actúa como drafter. Los pesos no se alojan en este repositorio: `loom-fetch` los descarga del repositorio upstream en la revisión fijada y verifica su hash.

La relevancia es acotada pero técnica: demuestra que un modelo de 4B en cuantización Q4_K_M puede alcanzar velocidades de decodificación de ~100 tok/s en una APU Strix Halo mediante Loom, frente a ~76 tok/s de la ruta llama.cpp-HRX de referencia, con una calidad de salida equivalente dentro de los márgenes de tolerancia definidos por el propio autor (gate engine#3158).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), servido mediante runtime Loom/HRX sobre IREE HAL AMDGPU; pesos GGUF sin modificar |
| Parámetros totales | 4B (heredados de Qwen3-4B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (los benchmarks usan prompts de ~512 y ~4K tokens) |
| Tipos de cuantización | Q4_K_M (pesos principales); Q8_0 para el drafter DFlash |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache-2.0 (pesos y card); el drafter DFlash es MIT |
| Formato de pesos | GGUF (`Qwen3-4B-Q4_K_M.gguf`); la card usa `model.json` + `model.json.lock` + programas `.loom` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de la familia Qwen3. Esta card no entrena ni afina pesos: reutiliza el GGUF de unsloth en Q4_K_M y añade una capa de ejecución específica para Strix Halo. Los programas `.loom` derivan de `loom-fun/ggml-org-Qwen3-4B-loom@b0944ed9`, con el checkpoint re-apuntado a `unsloth/Qwen3-4B-GGUF` por cl-loomfun, y se ejecutan sobre `hrx-loom` (versión 0.3.0 en la guía de inicio rápido; 0.2.0 en la tabla de benchmarks).

La innovación técnica está en el runtime, no en el modelo: Loom compila los programas a IREE y los ejecuta sobre el HAL AMDGPU, con `pool_backing=fixed` y control del spin de finalización (`completion_spin_ns`). La card admite decodificación especulativa cargando un drafter Q8_0 (DFlash) desde AtomicChat. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original de Qwen3-4B, número de tokens, ni si hubo RLHF/DPO; esos datos corresponden al modelo base y no se reproducen aquí.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" (el gate compara explícitamente la cadena de razonamiento generada).
- Decodificación especulativa opcional mediante drafter DFlash Q8_0.
- Servicio compatible con la API `/v1/chat/completions` a través de `loom-serve` (y de `1bit serve` en las pruebas de velocidad).
- Renderizado de plantilla de chat con y sin thinking, verificado a nivel de IDs de token contra el tokenizer y la plantilla del engine.
- Ejecución exclusiva en AMD Ryzen AI Max+ 395 (gfx1151); no hay soporte documentado para otras GPU.
- Capacidades de tool calling, agentes, visión, audio o multilingüismo: no disponibles en la información proporcionada (dependen del modelo base Qwen3-4B, no verificadas en esta card).

## Casos de uso

- Despliegue local de un asistente conversacional en un equipo con Ryzen AI Max+ 395: `loom-serve --preset=chat` expone un endpoint compatible con OpenAI, con TTFT medido de ~32 ms y decodificación de ~98 tok/s en prompts cortos, suficiente para interacción en tiempo real sin GPU dedicada.
- Prototipado de aplicaciones de razonamiento con thinking mode: el modelo genera cadena de razonamiento y la card verifica que los IDs de prompt coinciden con la plantilla del engine, lo que permite comparar salidas entre Loom y una ejecución de referencia en CPU.
- Evaluación de runtimes de inferencia en hardware AMD: la card incluye metodología reproducible (4 rondas intercaladas, streaming sobre `/v1/chat/completions`) para comparar Loom frente a la ruta llama.cpp-HRX en prefill y decode.
- Procesamiento de prompts de contexto medio (~2K tokens): el prefill medido alcanza ~3.039 tok/s a través de `1bit serve` y ~3.074 tok/s en Loom directo, adecuado para resumir documentos o responder sobre fragmentos extensos.
- Aceleración de decodificación en tareas de generación larga: con el drafter DFlash Q8_0, la card habilita decodificación especulativa para reducir latencia en respuestas de cientos de tokens.
- Banco de pruebas para desarrollo de kernels y programas Loom: los programas `.loom` y el `model.json` sirven como referencia para portar otros modelos GGUF a la pila HRX de AMD.

## Benchmarks y rendimiento

Medidos en AMD Ryzen AI Max+ 395 (gfx1151), imagen 1bit OS appliance, `hrx-loom` 0.2.0, 4 rondas intercaladas:

| Arm | TTFT ms | pp512 tok/s | tg128 tok/s | tg @4k tok/s |
|---|---|---|---|---|
| Esta card (loom-serve) | 31,86 (29,4-59,6) | 2272,3 (1659,2-2362,3) | 98,58 (87,8-110,0) | 56,82 (56,5-59,8) |
| Ruta llama.cpp-HRX (referencia) | 62,72 (49,8-424,1) | 2432,03 (916,8-2901,1) | 72,69 (65,0-73,3) | 56,29 (54,1-57,2) |

Gate de velocidad (engine#3158, `hrx-loom` 0.3.0, 4 rondas intercaladas, un servidor a la vez):

| Prompt | Métrica | Ruta llama.cpp | Loom directo | Loom vía `1bit serve` |
|---|---|---|---|---|
| corto | prefill tok/s | 540,8 [525,9-541,7] | 1402,3 [1392,4-1422,2] | 1294,5 [1264,7-1334,8] |
| corto | decode tok/s (streaming) | 76,2 [74,5-77,0] | 99,8 [96,1-100,9] | 100,6 [98,0-101,0] |
| long2k | prefill tok/s | 2502,6 [2453,9-2514,9] | 3074,1 [3067,7-3102,5] | 3039,4 [3019,7-3120,7] |
| long2k | decode tok/s (streaming) | 65,5 [63,8-65,9] | 107,1 [100,8-107,3] | 105,6 [105,4-107,6] |

Precisión (gate engine#3158: greedy, thinking on, 512 tokens x 8 prompts, comparando también el razonamiento, contra un árbitro CPU en otra máquina): 0,0 % de divergencia reportada en ambos brazos; las divergencias Loom/CPU son near-ties con márgenes top-2 de 0,022-0,351 nats. No se mide KLD en el brazo Loom porque el runtime no devuelve logprobs. Comprobación de plantilla: Loom produce 23 IDs con thinking off y 21 con thinking on, frente a 23 y 19 del engine.

## Requisitos de hardware

- GPU: exclusivamente AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); la card está gated a ese hardware.
- Memoria: no se especifica VRAM mínima en la información disponible; los pesos Q4_K_M de un modelo de 4B ocupan aproximadamente 2,5 GB, más el drafter Q8_0 opcional.
- No cabe ni está soportado en GPU consumer NVIDIA (RTX 4090) ni en otras GPU AMD según la documentación de la card.
- Despliegue: `pipx install "hrx-loom[hf]==0.3.0"`, `loom-fetch` para descargar y verificar pesos, `loom-serve --preset=chat --device=amdgpu:// --pool_backing=fixed`.
- Variables de entorno: `IREE_HAL_AMDGPU_LIBHSA_PATH` apuntando a `libhsa-runtime64.so.1` de ROCm.
- Throughput medido: prefill de 1.294-3.039 tok/s y decode de 100,6-105,6 tok/s según longitud de prompt; TTFT de ~32 ms en chat corto.
- Versiones de referencia: engine `1bit 0.0.1` (engine e697c40a0971, llama.cpp 9db01568b518, hrx-system 7f4236924aad), ROCm 7.4.0-rc1-1bit, `ec_power_mode balanced`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo | Rendimiento medido |
|---|---|---|---|---|---|---|
| Qwen3-4B-GGUF-loom (esta card) | 4B | no disponible | GGUF Q4_K_M + card Loom | Apache-2.0 | Ryzen AI Max+ 395 (gfx1151) | decode ~100 tok/s, prefill ~1.294-3.039 tok/s |
| Qwen3-4B-GGUF (unsloth, upstream) | 4B | no disponible | GGUF | Apache-2.0 | Genérico (llama.cpp, etc.) | no disponible |
| Ruta llama.cpp-HRX (referencia en la card) | 4B | no disponible | GGUF Q4_K_M | Apache-2.0 | Ryzen AI Max+ 395 | decode 76,2/65,5 tok/s, prefill 540,8/2.502,6 tok/s |
| Qwen3-4B-DFlash-GGUF (AtomicChat) | 4B (drafter) | no disponible | GGUF Q8_0 | MIT | Genérico | no disponible |

## Limitaciones y advertencias

- Hardware cerrado: solo funciona en AMD Ryzen AI Max+ 395 (gfx1151); no hay soporte para otras GPU ni para CPU.
- No es un modelo nuevo: cualquier limitación de Qwen3-4B (sesgos, alucinación, cobertura idiomática) se hereda sin cambios.
- El gate de precisión reporta 0,0 % de divergencia, pero el propio autor reconoce que la coincidencia exacta token a token es del 0 % incluso entre la referencia y el árbitro CPU; la equivalencia se sostiene solo dentro de márgenes de near-tie (0,022-0,351 nats).
- No se mide KLD en el brazo Loom por ausencia de logprobs en el runtime, lo que limita la comparación cuantitativa de calidad.
- Los benchmarks de la tabla principal se tomaron con `hrx-loom` 0.2.0 y un comando que ya no existe en 0.3.0 (`--parameter_mode=preload`); la fila de gate es la vigente.
- El repositorio no contiene los pesos: requiere descarga desde el upstream y verificación de sha256; un fallo de red o un cambio en el upstream rompe el despliegue.
- El drafter DFlash es una dependencia externa con licencia MIT distinta de la Apache-2.0 de la card.
- Licencia Apache-2.0 permite uso comercial de los pesos y la card, pero no se documentan garantías ni soporte.
- Sin descargas ni likes en el momento de la consulta: proyecto reciente y sin validación comunitaria.

## Enlaces

- Card en Hugging Face: https://huggingface.co/1bit-MONSTER/Qwen3-4B-GGUF-loom
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3-4B-GGUF
- Drafter DFlash (AtomicChat): https://huggingface.co/AtomicChat/Qwen3-4B-DFlash-GGUF
- Repositorio Loom/HRX de AMD: https://github.com/ROCm/hrx-system
- Cards originales de loom-fun: https://huggingface.co/loom-fun
- Gate de precisión engine#3158: https://github.com/1bit-MONSTER/engine/issues/3158#issuecomment-7109544282
- Referencia de plantilla engine#3376 (citada en la card, sin URL directa en la información disponible)
