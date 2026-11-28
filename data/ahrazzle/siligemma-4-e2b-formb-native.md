# ahrazzle/SiliGemma-4-E2B-FormB-Native

## Resumen

SiliGemma-4-E2B-FormB-Native es un artefacto de inferencia bare-metal publicado por el usuario ahrazzle (asociado al repositorio Moissanite-Labs/siligemma) que empaqueta los pesos de google/gemma-4-E2B-it en un archivo binario propietario `.slgb` junto con un conjunto de kernels CUDA C++20 compilados para arquitectura `sm_86` (Ampere consumer, p. ej. RTX 3080). No es un modelo nuevo: es una reimplementación del runtime de decodificacion del modelo base Gemma 4 E2B instruct, eliminando por completo Python, PyTorch, `transformers`, cuBLAS y las dependencias habituales del stack de Hugging Face en tiempo de decodificacion.

El objetivo declarado es conseguir un motor de inferencia autonomo con cero asignacion dinamica de memoria en el bucle de decodificacion (arena estatica de 2.744,94 MiB para contexto de 128K), cero spill de registros en los kernels (maximo 48 registros, 0 B de pila) y verificacion de integridad de pesos mediante codigos SECDED `[16, 11, 4]` con canario IRIS. Incorpora ademas innovaciones algorítmicas propias del autor: cuantizacion `A_16-BlockH4` a 4,5 bits por peso con transformada de Hadamard por bloques, steering Cayley-Woodbury en el hub de atencion `L10..L14` y un controlador de bucle `U-4` que reutiliza capas `L25..L33` con profundidad efectiva variable (`K=1,2,3`).

Es relevante ahora porque demuestra una via practica para ejecutar un modelo Gemma 4 de 2B en GPUs consumer Ampere con throughput medido y sin dependencias del ecosistema Python, lo que interesa a quienes despliegan inferencia en entornos embebidos, edge o con requisitos estrictos de latencia y determinismo. El repositorio ocupa 2,1 GB y se publica bajo licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E2B) con runtime bare-metal C++20/CUDA `sm_86`; cuantizacion `A_16-BlockH4` (4,5 bpw) y controlador de bucle `U-4` |
| Parametros totales | No disponible de forma explicita; el archivo de pesos `gemma4_formb_g32.slgb` ocupa 2.094.062.080 B e incluye 1.055.711.232 B de lineales cuantizados, 805.306.368 B de `embed_tokens` en BF16 y 226.492.416 B de `lm_head` a 4,5 bpw |
| Parametros activos | No aplica (no es MoE); profundidad efectiva variable 35L / 44L / 53L segun `K=1/2/3` |
| Longitud de contexto | 128K tokens (arena `kArena128K` de 2.744,94 MiB) |
| Tipos de cuantizacion | `A_16-BlockH4` a 4,5 bpw (lineales y `lm_head` shadow); BF16 para `embed_tokens`; FP32 para 285.987 normas/escalares; BF16 para controladores `U-4` (`r=16`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (heredada de google/gemma-4-E2B-it) |
| Formato de pesos | `.slgb` (archivo binario propietario empaquetado, 2.094.062.080 B); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es google/gemma-4-E2B-it, un transformer decoder-only de la familia Gemma 4 en su variante E2B (tamano efectivo ~2B) ajustada para instrucciones. Sobre ese modelo, el autor no reentrena: aplica un pipeline de conversion que cuantiza los pesos lineales a `A_16-BlockH4` (4,5 bits por peso con transformada de Hadamard por bloques de 4), omite fisicamente 60 tensores muertos de `L15..L34` (`k_proj`, `v_proj`, `k_norm`, 18.880.512 parametros) y empaqueta todo en un unico archivo `.slgb` con sumas de verificacion SHA256 y sindromes SECDED `[16, 11, 4]`.

Las innovaciones tecnicas declaradas incluyen: kernels CUDA compilados con `nvcc -arch=sm_86 -O3 --Werror all-warnings` que limitan a 48 registros, sin pila ni spill (0 instrucciones `LDL`/`STL` en SASS); `tree_reduce_128_sm86` con paridad de 0 ULP; steering Cayley-Woodbury hoisteado en memoria constante de 256 B (`c_wb_inv_256b`) con deriva relativa de norma de 3.672e-9; hub de atencion `L10..L14` con `shared_KV` 20x que no escribe bytes KV en `L15..L34`; y controlador de bucle `U-4` sobre `L25..L33` con `r=16` en BF16 que anade profundidad efectiva sin cache KV extra (`K=1` diff cero). El DMA asincrono de PLE (per-layer embeddings) transfiere 17.920 B/token con solo +0,01% de stall. No se documenta en la informacion disponible el dataset de entrenamiento ni si hubo RLHF/DPO adicional sobre el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 4 E2B instruct.
- Razonamiento multi-paso con profundidad efectiva ajustable en tiempo de inferencia (`K=1` 35L, `K=2` 44L, `K=3` 53L), que mejora metricas de razonamiento a costa de latencia.
- Razonamiento matematico y aritmetico: se reportan mejoras medidas en `GSM8K_OOD` y `Countdown_test` al aumentar `K`.
- Contexto largo de hasta 128K tokens con arena estatica preasignada.
- Verificacion de integridad de pesos en tiempo de carga (SECDED + canario IRIS).
- Inferencia determinista sin asignacion dinamica de memoria en decodificacion (0 B de heap/VRAM dinamica sobre 1.000 pasos).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Inferencia edge en GPU consumer Ampere: el binario y los kernels `sm_86` permiten ejecutar Gemma 4 E2B en una RTX 3080 con 2.744,94 MiB de VRAM estatica, sin instalar PyTorch ni `transformers`, util para dispositivos con imagen de sistema minima.
- Servicio de generacion de texto con latencia predecible: la tabla de throughput medida (89,50 tok/s a B=1/K=1 y 225,81 tok/s a B=16/K=1) permite dimensionar SLA con percentiles p95 conocidos (11,184 ms y 71,761 ms respectivamente).
- Procesamiento de documentos largos en ingles: la ventana de 128K tokens con arena fija encaja en pipelines batch donde se requiere evitar fragmentacion de memoria entre peticiones.
- Razonamiento aritmetico y tareas tipo GSM8K: activando `K=2` o `K=3` se obtiene mayor profundidad efectiva con ganancias medidas (`+0,158275` nats en `GSM8K_OOD` con `p=9,999e-05`), adecuado para evaluacion de modelos o generacion de soluciones paso a paso.
- Despliegue en entornos con requisitos de integridad: la verificacion SHA256 y los sindromes SECDED permiten auditar la cadena de pesos en produccion antes de arrancar el motor.
- Investigacion en tecnicas de cuantizacion y steering: el codigo fuente en Moissanite-Labs/siligemma y los artefactos de `Track S184` sirven como banco de pruebas reproducible para `A_16-BlockH4`, Cayley-Woodbury y controladores de bucle.
- Sustitucion de stack Python en CI: compilacion y auditoria SASS (`make compile-cuda && make audit-sass`) integrables en pipelines que verifiquen cero spill y cero instrucciones `LDL`/`STL`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K completos) en la informacion disponible. Los datos aportados son metricas de perdida (nats) y de throughput del runtime propio:

| Metrica | Configuracion | Antes | Despues | Notas |
|---|---|---:|---:|---|
| `WT2_test` (16x256), Torch | `K=1` -> `K=2` | 5,410329 | 5,202459 | -0,207870 nats; `K=3`: 5,199883 |
| `WT2_test` (16x256), CUDA | `K=1` -> `K=2` | 5,412680 | 5,205190 | `K=3`: 5,217070 |
| `Countdown_test` (128) | `K=1` -> `K=2` | 1,376065 | 1,195397 | +0,180667 nats; IC 95% [+0,163776, +0,197342]; p=9,999e-05 |
| `GSM8K_OOD` (64) | `K=1` -> `K=2` | 1,779174 | 1,620899 | +0,158275 nats; IC 95% [+0,139919, +0,177410]; p=9,999e-05 |
| `WT2_test[0]` (gate `bos=2`) | fail-closed | 11,2901 | 4,6075 | nats |

Throughput en RTX 3080 (`sm_86`), grafo CUDA, `lm_head` a 4,5 bpw:

| Batch | Profundidad | Mediana (ms) | p95 (ms) | tok/s |
|---:|---|---:|---:|---:|
| B=1 | K=1 (35L) | 11,173 | 11,184 | 89,50 |
| B=1 | K=2 (44L) | 17,105 | 17,119 | 58,46 |
| B=1 | K=3 (53L) | 23,036 | 23,053 | 43,41 |
| B=16 | K=1 (35L) | 70,855 | 71,761 | 225,81 |
| B=16 | K=2 (44L) | 91,279 | 91,691 | 175,29 |
| B=16 | K=3 (53L) | 110,836 | 111,828 | 144,36 |

## Requisitos de hardware

- VRAM: 2.744,94 MiB con contexto de 128K (`kArena128K`), sin asignacion dinamica adicional; el archivo de pesos ocupa 2,1 GB en disco.
- GPU objetivo: arquitectura `sm_86` (Ampere). Verificado en RTX 3080; el autor etiqueta la medicion como `UNCONTROLLED_LAPTOP_NOT_CLAIMED`.
- Cabe en GPUs consumer Ampere con al menos 3 GB de VRAM efectiva (RTX 3060, 3070, 3080, 3090; A10, A40 en el mismo `sm_86`). No compatible con arquitecturas anteriores (`sm_75` o inferior) ni con el binario precompilado en Ada/Hopper sin recompilar.
- Despliegue: runtime propio bare-metal C++20/CUDA (`siligemma_bench_sm86`); no usa vLLM, llama.cpp, Ollama ni TGI. Dependencias dinamicas limitadas a `linux-vdso.so.1`, `libstdc++.so.6`, `libm.so.6`, `libgcc_s.so.1`, `libc.so.6` y el loader.
- Latencia y throughput: ver tabla de la seccion anterior (11,173 ms a 23,036 ms por paso segun `K`; 43,41 a 89,50 tok/s a B=1).
- Compilacion: `nvcc -arch=sm_86 -O3 --Werror all-warnings`, maximo 48 registros, 0 B de pila.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| SiliGemma-4-E2B-FormB-Native | ~2B (Gemma 4 E2B) | 128K | `.slgb` + kernels CUDA `sm_86` bare-metal | Apache 2.0 | Runtime sin Python/PyTorch; throughput medido en RTX 3080 |
| google/gemma-4-E2B-it | ~2B | No disponible en la informacion | safetensors / `transformers` | Gemma (uso sujeto a terminos de Google) | Modelo base; stack estandar con PyTorch y cuBLAS |
| ahrazzle/SiliGemma-4-E2B-FormA | ~2B | No disponible en la informacion | Form A (stack estandar, CSR anchors) | Apache 2.0 | Variante drop-in del mismo autor con dependencias Python |

No se dispone de datos de benchmarks estandar para comparar rendimiento de calidad con otras alternativas de 2B en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no se declara multilingue.
- No se documentan capacidades de tool calling, agentes, vision ni audio; no asumir que el modelo base las herede en este runtime.
- Los kernels estan compilados exclusivamente para `sm_86`; en otras arquitecturas hay que recompilar y no hay garantia de que se mantengan las condiciones de cero spill.
- El binario `.slgb` es un formato propietario sin soporte en herramientas estandar (safetensors, GGUF, vLLM, llama.cpp); la portabilidad es nula fuera del runtime del autor.
- Las mediciones de throughput estan etiquetadas por el propio autor como `UNCONTROLLED_LAPTOP_NOT_CLAIMED`; no deben tratarse como cifras de produccion garantizadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay validacion independiente de terceros.
- Riesgo de alucinacion inherente al modelo base Gemma 4 E2B; no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- La licencia Apache 2.0 se hereda del modelo base, pero deben revisarse `LICENSE` y `NOTICE_UPSTREAM_LICENSE.txt` para confirmar las obligaciones de atribucion y los terminos de uso de Gemma aplicables en uso comercial.
- La omision fisica de 60 tensores de `L15..L34` y el controlador de bucle `U-4` alteran el grafo respecto al modelo original; los resultados pueden divergir del Gemma 4 E2B-it estandar fuera de las metricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahrazzle/SiliGemma-4-E2B-FormB-Native
- Variante Form A (stack estandar): https://huggingface.co/ahrazzle/SiliGemma-4-E2B-FormA
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio fuente: https://github.com/Moissanite-Labs/siligemma
