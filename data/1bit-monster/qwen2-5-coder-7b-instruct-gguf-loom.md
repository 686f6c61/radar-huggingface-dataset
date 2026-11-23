# 1bit-MONSTER/Qwen2.5-Coder-7B-Instruct-GGUF-loom

## Resumen

Este repositorio no contiene un modelo nuevo, sino una tarjeta de despliegue para AMD Loom (`.loom` programs más `model.json`) que permite ejecutar el GGUF oficial de Qwen2.5-Coder-7B-Instruct en hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). Los pesos no se alojan aquí: `loom-fetch` los descarga desde el repositorio upstream de Qwen en la revisión fijada `13fb94bfda8c8cf22497dc57b78f391a9acb426a` y verifica su sha256. El autor es 1bit-MONSTER y las tarjetas derivan del trabajo de loom-fun (Jeremy Fowers, Daniel Holanda) sobre `bartowski-Qwen2.5-7B-Instruct-loom` en el commit `7a755e3f`.

El modelo subyacente es Qwen2.5-Coder-7B-Instruct, un transformer denso de 7.000 millones de parámetros desarrollado por Alibaba Qwen, especializado en generación de código, con licencia Apache 2.0. Este paquete aporta los programas Loom y las mediciones de rendimiento en el acelerador integrado de AMD, no una variante de los pesos.

Su relevancia es acotada pero concreta: ofrece una ruta de inferencia medida (TTFT, prefill y decode) sobre iGPU AMD con el runtime hrx-loom 0.2.0, con verificación de precisión frente a una ejecución de referencia en CPU. Es útil para quien despliegue Qwen2.5-Coder en Strix Halo y quiera una tarjeta reproducible con cifras de latencia y throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-Coder-7B-Instruct); el repositorio aporta programas Loom, no pesos nuevos |
| Parametros totales | 7B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (GGUF `qwen2.5-coder-7b-instruct-q4_k_m.gguf`) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos en repo upstream); este repo contiene `.loom` programs y `model.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 7B parámetros de la familia Qwen2.5-Coder, ajustado por instrucciones. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

La contribución técnica de este repositorio es el artefacto de despliegue: programas `.loom` y `model.json`/`model.json.lock` que ejecutan el GGUF sin modificar sobre el runtime hrx-loom 0.2.0, con pin de revisión y verificación de sha256 (`509287f78cb4d4cf6b3843734733b914b2c158e43e22a7f4bf5e963800894d3c`). Los programas derivan de la tarjeta de loom-fun con el checkpoint re-apuntado. El despliegue está restringido a gfx1151 (Strix Halo); la tarjeta original listaba también gfx1201, pero no se ha re-medido aquí.

## Capacidades

- Generación de código y texto: heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Instrucciones conversacionales: preset `chat` disponible en `loom-serve`.
- Modo thinking on/off: la verificación de renderizado de prompts cubre ambos modos (40/40 tokens coincidentes con la plantilla y tokenizador del motor).
- Servido compatible con API: endpoint `/v1/chat/completions` con streaming del lado del cliente.
- Tool calling, agentes, visión, audio o matemáticas avanzadas: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local de asistencia de código en un equipo Strix Halo: ejecutar Qwen2.5-Coder-7B-Instruct en la iGPU mediante `loom-serve` con el preset `chat`, sin GPU dedicada, usando la ruta medida en esta tarjeta.
- Evaluación de rendimiento en hardware AMD: reproducir las cifras de TTFT (43,74 ms), prefill (1515,4 tok/s en pp512) y decode (46,9 tok/s en tg128) para comparar con la ruta llama.cpp-HRX de referencia.
- Verificación de precisión de despliegue: usar el gate engine#3158 (100 % de acierto greedy, thinking off, 64 tokens x 8 prompts) para validar que la ruta Loom no diverge de una ejecución de referencia en CPU.
- Servicio de chat con API OpenAI-compatible: levantar `loom-serve` en `127.0.0.1:18311` con `--pool_backing=fixed` y consumir `/v1/chat/completions` desde una aplicación cliente.
- Pruebas de latencia en prompts largos: medir decode tras un prompt de ~4k tokens (43,34 tok/s) para dimensionar aplicaciones con contexto extenso.
- Integración en pipelines de CI para hardware AMD: fijar la revisión y el sha256 del GGUF para garantizar reproducibilidad del entorno de inferencia en pruebas automatizadas.

## Benchmarks y rendimiento

Medido en AMD Ryzen AI Max+ 395 (gfx1151), 1bit OS appliance, 4 rondas intercaladas, un servidor a la vez:

| Arm | TTFT ms | pp512 tok/s | tg128 tok/s | tg @4k tok/s |
|---|---|---|---|---|
| Esta tarjeta (loom-serve) | 43,74 (43,2-45,7) | 1515,4 (1502,7-1571,7) | 46,9 (44,2-47,0) | 43,34 (40,9-43,4) |
| Ruta llama.cpp-HRX (referencia) | 64,14 (43,8-85,6) | 1754,26 (1010,2-1949,2) | 46,26 (46,1-46,3) | 34,87 (33,1-35,3) |

Gate de velocidad (engine#3158):

| Prompt | Métrica | llama.cpp | Loom raw | Loom vía `1bit serve` |
|---|---|---|---|---|
| short | prefill tok/s | 695,0 [683,5-716,4] | 1344,8 [1305,3-1352,1] | 1298,4 [1285,2-1314,5] |
| short | decode tok/s (256) | 45,7 [38,1-45,8] | 47,4 [46,9-47,6] | 47,3 [46,7-47,6] |
| long2k | prefill tok/s | 1857,2 [1793,2-1877,3] | 2141,1 [2129,4-2163,7] | 2138,9 [2116,8-2154,3] |
| long2k | decode tok/s (256) | 44,9 [43,6-45,8] | 44,4 [43,4-44,6] | 44,5 [43,2-44,6] |

Precisión: 100,0 % en esta tarjeta y 100,0 % en la ruta de referencia (gate engine#3158, greedy, thinking off, 64 tokens x 8 prompts). Loom no devuelve logprobs, por lo que la KLD no se mide en el brazo Loom. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware validado: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). La tarjeta original lista también gfx1201, pero no se ha re-medido aquí.
- VRAM: no disponible como cifra explícita; el GGUF es Q4_K_M de 7B y se ejecuta sobre memoria unificada del SoC.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por esta tarjeta, que está limitada a la ruta AMD Loom.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar y verificar pesos, `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed`.
- Throughput medido: prefill 1515,4 tok/s (pp512), decode 46,9 tok/s (tg128), 43,34 tok/s tras prompt de ~4k tokens, TTFT 43,74 ms.
- Versiones fijadas: hrx-loom 0.2.0, engine `1bit 0.0.1` (engine e697c40a0971, llama.cpp 9db01568b518, hrx-system 7f4236924aad, build 2026-11-22T23:34:25Z).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 7B | no disponible | Apache 2.0 | Hugging Face (Qwen) | Pesos originales en safetensors y GGUF |
| Esta tarjeta (1bit-MONSTER) | 7B (Q4_K_M) | no disponible | Apache 2.0 | Hugging Face | Programas Loom para Strix Halo, sin pesos |
| loom-fun/bartowski-Qwen2.5-7B-Instruct-loom | 7B | no disponible | no disponible | Hugging Face | Tarjeta origen; incluye gfx1201 además de gfx1151 |
| Ruta llama.cpp-HRX (referencia) | 7B (Q4_K_M) | no disponible | Apache 2.0 | 1bit engine | Usada como baseline de rendimiento en este repo |

## Limitaciones y advertencias

- El repositorio no contiene pesos: requiere descarga desde el upstream de Qwen en la revisión fijada.
- Restringido a gfx1151 (Strix Halo); no válido para GPUs NVIDIA ni otras AMD no listadas.
- KLD no medida en el brazo Loom por ausencia de logprobs; la validación de precisión se limita al gate de acierto greedy.
- Solo se ha probado la cuantización Q4_K_M; no hay datos de otros niveles.
- Sesgos, riesgo de alucinación e idiomas: no disponible en la informacion proporcionada (dependen del modelo base).
- Licencia Apache 2.0 permite uso comercial, pero las licencias de los programas Loom se rigen por `LICENSE-programs.md`.
- Cifras medidas en un appliance concreto (1bit OS, engine e697c40a0971); pueden variar con otras versiones del runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Qwen2.5-Coder-7B-Instruct-GGUF-loom
- Modelo base GGUF upstream: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
- Tarjeta origen loom-fun: https://huggingface.co/loom-fun/bartowski-Qwen2.5-7B-Instruct-loom
- Perfil loom-fun: https://huggingface.co/loom-fun
- Runtime Loom (ROCm HRX): https://github.com/ROCm/hrx-system
