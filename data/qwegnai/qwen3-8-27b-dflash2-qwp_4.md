# qwegnai/Qwen3.8-27B-DFlash2-QWP_4

## Resumen

Qwen3.8-27B-DFlash2-QWP_4 es un pack de pesos cuantizados del drafter DFlash 2 de `incoai/Qwen3.8-27B-DFlash2`, publicado por el usuario `qwegnai` para su motor de inferencia Qwegn. No se trata de un modelo generativo autonomo, sino de un modelo borrador (draft model) de 1.920 millones de parametros disenado para decodificacion especulativa sobre el modelo objetivo `Qwen3.8-27B`. Su funcion es proponer bloques de tokens que el modelo grande verifica, acelerando la decodificacion en Apple Silicon.

El pack emplea el contenedor propietario QWP1 del motor Qwegn y solo carga en dicho runtime (Swift + Metal 4, version 0.23.0 o superior). La cuantizacion `HQ4_G32_M5` combina rotacion Walsh-Hadamard por grupos de 32 pesos con codigos de 4 bits y escalas/bias en FP16, alcanzando 6,11 bits por parametro y un tamano de 1,37 GiB. Segun el autor, eleva la decodificacion del objetivo de 31,2 a 87,7 tok/s en CLI (154,2 tok/s en streaming de servidor) en un Apple M5 Max.

La relevancia actual radica en que la decodificacion especulativa se ha consolidado como la tecnica estandar para reducir latencia en inferencia local de modelos grandes, y este pack demuestra su aplicacion en el ecosistema Apple Silicon con un formato de pesos optimizado para ancho de banda de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2: drafter de difusion por bloques de 5 capas con kernels convolucionales de atencion/MLP y selector de candidatos |
| Parametros totales | 1,92 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | disenado para un objetivo con 262K tokens de contexto; el drafter no tiene contexto nativo propio |
| Tipos de cuantizacion | `HQ4_G32_M5` (4 bits por peso con rotacion Walsh-Hadamard en grupos de 32, escala y bias FP16) + BF16 en selectores y proyecciones de kernel; 6,11 bits/parametro |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QWP1 (contenedor nativo de Qwegn; no es safetensors, GGUF ni MLX) |

## Arquitectura y entrenamiento

El modelo es un drafter de difusion por bloques (block-diffusion) de 5 capas que incorpora kernels convolucionales en los bloques de atencion y MLP, junto con un selector de candidatos que elige entre las propuestas generadas. Esta disenado especificamente para la decodificacion especulativa DFlash 2 del motor Qwegn: genera bloques cortos de tokens cerca de la posicion actual que el modelo objetivo `Qwen3.8-27B` verifica en paralelo. El pack no incluye sidecar de Latent Sparse Attention (LSA); esa funcionalidad reside en el modelo objetivo.

La cuantizacion `HQ4_G32_M5` aplica una transformacion ortonormal de Walsh-Hadamard a cada grupo de 32 pesos antes de almacenarlos como codigos de 4 bits con escala y bias FP16 (20 bytes por 32 pesos, 5 bits por peso). La rotacion distribuye los valores atipicos entre los 32 pesos del grupo, lo que reduce el error de cuantizacion sin necesidad de datos de calibracion. El 89,9% de los parametros usa este formato; el 10,1% restante (codebooks del selector y proyecciones de los kernels convolucionales) permanece en BF16 porque la precision del selector condiciona la tasa de aceptacion del borrador. La transformacion se fusiona dentro de los kernels GEMV/GEMM del motor. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa sobre `Qwen3.8-27B`; no genera texto de forma autonoma.
- Decodificacion por bloques con verificacion en el objetivo (DFlash 2), con ventana de borrador configurable (`--dflash-window 4`).
- Seleccion de candidatos mediante codebooks dedicados en BF16.
- Aceleracion de la decodificacion en Apple Silicon con memoria unificada y GPU de clase M5.
- Integracion con el modo KV `q4` y con LSA del modelo objetivo (`--lsa-mode auto`).
- Soporte de streaming en servidor (`qwg serve`) ademas de uso en CLI.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues por si mismo: hereda las del modelo objetivo.

## Casos de uso

- Inferencia local acelerada en Mac: cargar el pack junto al objetivo `qwegnai/Qwen3.8-27B-QWP_4` en Qwegn para elevar la decodificacion de 31,2 a 87,7 tok/s en CLI, adecuado para asistentes interactivos en estaciones de trabajo Apple Silicon.
- Servicio de streaming de baja latencia: con `qwg serve` y el drafter cargado se alcanzan 154,2 tok/s en streaming, util para backends de chat que priorizan el tiempo hasta el primer token y el ritmo de emision.
- Aplicaciones con prompts largos y cache caliente: el TTFT en cache caliente de 7-29,3 ms a 65,5K tokens permite reutilizar contexto en sesiones multi-turno sin penalizacion perceptible.
- Evaluacion de codigo y generacion asistida: el autor reporta evaluaciones con 50 tareas HumanEval y 50 MBPP con razonamiento desactivado, escenario donde la decodificacion especulativa reduce el tiempo total de generacion de parches.
- Despliegue en entornos con memoria unificada limitada: el pack de 1,37 GiB y la cuantizacion de 6,11 bits/parametro reducen el espacio ocupado frente a un drafter en BF16 (3,85 GB estimados), lo que facilita convivir con el modelo objetivo en un solo equipo.
- Investigacion sobre decodificacion especulativa: sirve como referencia reproducible de un drafter de difusion por bloques con cuantizacion rotada, para medir tasas de aceptacion y latencias en hardware Apple.

## Benchmarks y rendimiento

Mediciones del autor en Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU de 40 nucleos, 585 GB/s), macOS 26+, `llmprobe v0.6.16-v0.6.17`, `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Objetivo | `qwegnai/Qwen3.8-27B-QWP_4` |
| Prefill con drafter cargado | 832 tok/s (pico 869; 1.043 tok/s en objetivo a 4K) |
| TTFT en frio | 94 ms |
| TTFT con cache caliente | 7-29,3 ms (2,23M-2,33M tok/s a 65,5K) |
| Decodificacion serie del objetivo | 31,2 tok/s |
| Decodificacion especulativa (DFlash 2) | 154,2 tok/s en servidor; 87,7 tok/s en CLI con 256 tokens (83,8 tok/s en v0.20.5); 2,8x-4,9x frente a serie |

| Metrica de ancho de banda (analitica) | HQ4_G32_M5 | BF16 |
|---|---|---|
| Escaneo nominal de pesos del drafter | 1,47 GB | 3,85 GB |
| Escaneos completos de pesos por segundo (solo ancho de banda) | 398 | 152 |

El autor advierte que los resultados de contexto corto provienen de cargas de trabajo distintas, que el TTFT en cache caliente y el TTFT en frio no forman una relacion controlada sobre el mismo prompt, y que la aceptacion variacional puede alterar la salida frente a decodificacion greedy exacta. No se reportan evaluaciones pareadas de calidad BF16 frente a HQ4_G32_M5.

## Requisitos de hardware

- VRAM o memoria unificada: 1,37 GiB para el pack mapeado, mas buffers del runtime y cache KV; las mediciones se realizaron con 128 GB.
- GPU: Apple Silicon de clase M5 (Apple10) para la ruta de prefill con tensores cooperativos NAX; el autor no documenta compatibilidad con generaciones anteriores.
- No esta pensado para GPU NVIDIA ni consumer de PC: depende de Metal 4 y macOS 26 o superior.
- Despliegue: exclusivamente mediante el motor Qwegn 0.23.0 o superior (el README tambien menciona 0.8.0 o superior); no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: TTFT en frio de 94 ms, TTFT en cache caliente de 7-29,3 ms, 87,7 tok/s en CLI y 154,2 tok/s en servidor con el objetivo `Qwen3.8-27B`.
- Descarga: `qwg pull qwegnai/Qwen3.8-27B-DFlash2-QWP_4` o `hf download` desde Hugging Face.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2-QWP_4 (este) | 1,92 B | borra para objetivo de 262K | Drafter especulativo DFlash 2 para Qwen3.8-27B | Apache 2.0 | QWP1, solo Qwegn |
| incoai/Qwen3.8-27B-DFlash2 | no disponible | no disponible | Drafter original del que deriva este pack | no disponible | no disponible |
| qwegnai/Qwen3.8-27B-QWP_4 | no disponible | 262K | Modelo objetivo generativo | no disponible | QWP1, solo Qwegn |

No se dispone de informacion sobre otros drafters comparables (por ejemplo, variantes EAGLE o Medusa) en la documentacion proporcionada, por lo que la comparativa se limita a los artefactos del mismo ecosistema.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo `Qwen3.8-27B-QWP_4` y el motor Qwegn no produce salida util.
- Dependencia total del runtime Qwegn y de macOS 26+ en Apple Silicon; el contenedor QWP1 no es portable a safetensors, GGUF ni MLX.
- La aceptacion variacional de la decodificacion especulativa puede alterar la salida respecto a decodificacion greedy exacta, lo que afecta a la reproducibilidad.
- Los datos de rendimiento provienen de un unico equipo (M5 Max de 128 GB) y el propio autor indica que varian con la carga de trabajo y la temperatura.
- Los limites de ancho de banda de 398 frente a 152 escaneos/s son analiticos y no equivalen a tasas de tokens de salida; no hay evaluacion pareada de calidad BF16 frente a cuantizada.
- El drafter no incorpora LSA; el rendimiento en contextos muy largos depende del sidecar LSA del objetivo y no se reclama ningun resultado de drafter a 1M de tokens.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; se heredan del modelo objetivo.
- Idiomas soportados no documentados.
- Licencia Apache 2.0 permite uso comercial, pero la practica depende de la licencia del modelo base `incoai/Qwen3.8-27B-DFlash2`, no indicada en la informacion disponible.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/qwegnai/Qwen3.8-27B-DFlash2-QWP_4
- Modelo base: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Revision del modelo base citada: `015e795645c74b1a0eeef3b570031fb62e769bc5`
- Modelo objetivo: https://huggingface.co/qwegnai/Qwen3.8-27B-QWP_4
- Motor Qwegn: https://github.com/qwegnai/qwegn
