# Lafonse/strata-nvfp4-a6000-bench

## Resumen

strata-nvfp4-a6000-bench es un repositorio de HuggingFace publicado por el usuario Lafonse que no contiene un modelo entrenado, sino un pack de pesos cuantizados y un informe de benchmark reproducible. El objeto del trabajo es nvidia/Qwen3.8-Flash-Next-NVFP4, un checkpoint NVFP4 de Qwen3.8-Flash-Next, re-cuantizado a GPTQ sobre el fork sergqwer/strata-nvfp4 del motor Strata y ejecutado en dos NVIDIA RTX A6000 de 48 GB (Ampere, sm_86), hardware que carece de tensor cores FP4.

El interes tecnico se concentra en dos puntos. Segun el autor, son las primeras cifras publicadas de un fork NVFP4 sobre Ampere y las primeras con un pack re-cuantizado por el usuario mediante GPTQ mas proyecciones down en Q8_0 en las 27 capas con mayor error. El pack reduce el error de experto al 15,7% del redondeo simple, aproximadamente la mitad del KL del NVFP4 original de NVIDIA, a cambio de un coste de decodificacion cercano al 10%.

Las mediciones cubren prompts de 16K, 64K, 128K y 250K tokens, con 12/12 de acierto en needle, prefill de 2.328 a 2.971 tok/s y decodificacion de 94,2 a 102,3 tok/s. El informe incluye ademas un hallazgo operativo: una sesion de agente residente de unos 180K tokens degrada la decodificacion a 250K en torno al 20%. El repositorio no declara licencia, idiomas, pipeline ni parametros del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. El material describe 48 capas, cache de expertos y una cabecera draft MTP, lo que apunta a un transformer con mezcla de expertos y decodificacion especulativa, pero no se especifica la arquitectura del modelo base |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados en el motor durante el benchmark (flag `--max-context 262144`). La longitud nativa del modelo base no se indica |
| Tipos de cuantizacion | NVFP4 (checkpoint de partida), GPTQ re-cuantizado, Q8_0 en las down-projections de 27 capas, FP8 (tabla n-gram PLE), BF16 (embeddings), q2_0 (cabecera draft MTP), int8 con rotacion Hadamard (KV), float64 (tabla RoPE) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible como formato estandar. Pack propio del motor Strata: `experts.bin` de 73,83 GiB (SHA-256 `ed5c0ff9763442fee857737892d12551eeaa11a5b5e811b3be30a885b13a5900`) mas tensores auxiliares |

## Arquitectura y entrenamiento

No se publica informacion sobre el entrenamiento del modelo base: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF, DPO o similares. El unico proceso descrito es la re-cuantizacion. El pipeline parte del checkpoint NVFP4 de NVIDIA, pasa por `nvfp4_convert.py` (verificado bit a bit segun el autor) y despues por `requant.py`, que aplica una re-cuantizacion GPTQ calibrada en la propia maquina con 4 prompts sobre las 48 capas, e introduce proyecciones down en Q8_0 en las 27 capas peor reconstruidas segun `requant_plan.py`, dentro de un presupuesto de 74 GiB. El error de experto medido es del 33,5% del redondeo simple con GPTQ solo y del 15,7% con el plan Q8_0 en down-projections.

En el plano de inferencia, el motor Strata aporta cache de expertos, pipeline con reparto por capas (`--layer-split 16`), decodificacion especulativa (`--spec 4`, `--spec-min-p 0.60`) y prefill automatico. Los tensores auxiliares se mantienen a la precision del checkpoint: tabla n-gram PLE en FP8, embeddings en BF16, cabecera draft MTP en q2_0, KV en int8 con rotacion Hadamard y tabla RoPE en float64. El KV residente se fija en 32.768 tokens. La compilacion se realiza desde fuente en Linux con CUDA 13.2 para sm_86; el autor advierte de que el nvcc del sistema debe ser 12.4 o superior, ya que el 12.0 de Ubuntu 24.04 falla en el shim de VMM.

## Capacidades

- Inferencia de Qwen3.8-Flash-Next (variante Flash-Next, segun el autor) en GPUs Ampere sin tensor cores FP4, mediante los kernels del fork sergqwer/strata-nvfp4.
- Procesamiento de contexto largo efectivo: 12/12 en la prueba needle a 16K, 64K, 128K y 250K tokens con el motor configurado a 262.144 tokens.
- Decodificacion especulativa con cabecera draft MTP y umbral de aceptacion configurable; el ajuste de `--spec-min-p` de 0,70 a 0,60 eleva la aceptacion del suffix-draft de ~50% a ~74%.
- Cache de expertos con precarga automatica y KV residente de 32.768 tokens.
- KV en int8 con rotacion Hadamard, orientado a reducir huella de memoria en contexto largo.
- Re-cuantizacion GPTQ reproducible: conversion bit a bit verificada, plan de capas, presupuesto de memoria y hashes publicados.
- Soporte de sesiones de agente concurrentes a nivel de motor, aunque con penalizacion medida en decodificacion a 250K.
- No se declaran capacidades de vision, audio, tool calling, function calling ni multilingues en la informacion disponible.

## Casos de uso

- Validacion de NVFP4 en hardware Ampere: permite comprobar si un despliegue NVFP4 es viable en sm_86 sin tensor cores FP4, usando las cifras de prefill y decodificacion del informe como referencia de partida antes de invertir en GPUs Hopper o Blackwell.
- Reproduccion del pipeline de re-cuantizacion GPTQ: el informe documenta comandos, plan de capas, presupuesto de 74 GiB y hashes, de modo que un equipo puede repetir el proceso sobre otro checkpoint NVFP4 y comparar el error de experto resultante.
- Dimensionamiento de memoria para despliegues de contexto largo: la arena de expertos de 73,83 GiB fija en RAM, mas el KV residente de 32.768 tokens y el KV int8, sirven para calcular requisitos reales de nodo antes de comprar hardware.
- Eleccion entre cuantizaciones para un mismo modelo: la comparacion medida entre el pack GPTQ+Q8_0 y el IQ3_S de stock (104-112 tok/s de decodificacion frente a 94-104, con mejor error) permite decidir en funcion de si prima latencia o fidelidad.
- Analisis de interferencia en despliegues con agentes: la medicion con una sesion Hermes de ~180K tokens residente cuantifica la caida de decodificacion a 250K (75,8 tok/s de mediana frente a 94,2) y ayuda a planificar el aislamiento de sesiones largas.
- Auditoria de rendimiento de motores de inferencia: el banco de pruebas con prompts frios salteados, temperatura 0 y mediana de 3 ejecuciones es reutilizable para comparar forks, flags o versiones de CUDA sobre el mismo hardware.
- Ajuste de decodificacion especulativa: el barrido de `--spec-min-p` ofrece un punto de partida medido para tunear aceptacion de draft y throughput en otras cargas con cabecera MTP.

## Benchmarks y rendimiento

Medidas del autor: motor en frio, mediana [min-max] de 3 ejecuciones, prompts frios salteados, temperatura 0. Se reproduce la tabla original con separador decimal espanol; algunos valores minimos de prefill aparecen truncados en el informe de origen y se mantienen tal cual.

| Prompt | Prefill (tok/s) | Decode (tok/s) | Needle |
|---|---|---|---|
| 16K | 2.328 [2.322-362] | 99,0 [89,7-104,2] | 3/3 |
| 64K | 2.839 [2.791-876] | 102,3 [93,8-110,3] | 3/3 |
| 128K | 2.971 [2.952-010] | 94,4 [67,0-104,3] | 3/3 |
| 250K | 2.897 [2.841-928] | 94,2 [94,0-97,4] | 3/3 |

Datos adicionales aportados:

| Prueba | Resultado |
|---|---|
| Recall total en needle | 12/12 |
| Primer acceso a 128K con cache de expertos vacia | 67,0 tok/s de decodificacion, 94-104 tok/s en ejecuciones posteriores |
| Matrix repetida con sesion de agente Hermes de ~180K tokens residente | 250K: 75,8 [71,7-95,3] tok/s de decodificacion, caida de ~20% en la mediana y triple de dispersion; 16K-128K sin cambios apreciables |
| A/B de `--spec-min-p` 0,70 a 0,60 | Aceptacion del suffix-draft de ~50% a ~74%; decodificacion en turno real de 92,9 a 104-112 tok/s |
| Error de experto con GPTQ solo | 33,5% del redondeo simple |
| Error de experto con GPTQ + Q8_0 en down-projections | 15,7% del redondeo simple |

No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: 2x RTX A6000 de 48 GB (96 GB en total). El pack de expertos ocupa 73,83 GiB y se mantiene fijado en memoria residente; no hay streaming desde SSD durante la decodificacion.
- RAM del sistema: 94 GB completamente comprometidos en la configuracion medida.
- CPU: Ryzen 9 7900X con AVX-512 y VNNI en la maquina de referencia.
- Almacenamiento: NVMe, usado para la carga inicial del pack.
- Interconexion: PCIe Gen4 x16; NVLink presente pero sin uso declarado.
- GPU consumer: no cabe. Un unico pack de 73,83 GiB excede la VRAM de cualquier GPU de consumo actual (24 GB en RTX 4090/3090), y el diseno asume dos GPUs profesionales de 48 GB.
- Software de despliegue: unicamente el fork sergqwer/strata-nvfp4 en el commit 84fe9ed (version 0.1.39-nvfp4.2), compilado desde fuente en Linux con CUDA 13.2 para sm_86. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Requisito de toolchain: nvcc del sistema igual o superior a 12.4.
- Throughput medido: prefill de 2.328 a 2.971 tok/s y decodificacion de 94,2 a 102,3 tok/s entre 16K y 250K de contexto; 104-112 tok/s tras el ajuste de `--spec-min-p` a 0,60 en turno real.
- Latencia: no se publican valores de time-to-first-token ni de latencia por token en milisegundos.

## Comparativa con modelos similares

No hay datos de otros modelos comparables en la informacion disponible. La unica comparacion publicada es entre variantes de cuantizacion del mismo modelo base sobre el mismo hardware:

| Variante | Cuantizacion | Decodificacion (tok/s) | Precision relativa | Formato y disponibilidad |
|---|---|---|---|---|
| Pack de este repositorio | NVFP4 convertido + GPTQ con Q8_0 en 27 capas | 94,2-102,3 en benchmark; 104-112 tras ajuste de spec-min-p | Error de experto 15,7% del redondeo simple; ~mitad del KL del NVFP4 de NVIDIA | Pack propio del motor Strata, `experts.bin` de 73,83 GiB, solo en el fork strata-nvfp4 |
| NVFP4 de stock de NVIDIA | NVFP4 (ModelOpt) | no disponible | Referencia declarada por el autor; el pack lo mejora en ~2x de KL | Checkpoint en huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4 |
| IQ3_S de stock | IQ3_S | 104-112 | Clase de precision inferior segun el autor | no disponible |
| Qwen3.8-Flash-Next base | BF16 (presumible, no confirmado) | no disponible | no disponible | huggingface.co/Qwen/Qwen3.8-Flash-Next |

## Limitaciones y advertencias

- El repositorio es un informe de benchmark y un pack de pesos, no una model card convencional: no declara licencia, idiomas, pipeline ni parametros, por lo que su uso comercial queda sin definir.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion independiente de las cifras ni reproducciones por terceros.
- Todos los numeros proceden de una unica maquina y un unico motor (fork strata-nvfp4, commit 84fe9ed, CUDA 13.2, sm_86). No son extrapolables a otras GPUs, versiones de CUDA u otros motores.
- El pack esta atado al fork: no se indica que sea cargable en vLLM, llama.cpp, Ollama o TGI, y el formato no es safetensors ni GGUF estandar.
- La calibracion GPTQ se hizo con solo 4 prompts sobre 48 capas; es una base de calibracion reducida y el autor no publica evaluacion de calidad en tareas estandar.
- Algunos rangos minimos de prefill del informe original aparecen truncados o incoherentes (por ejemplo, `[2.322-362]` y `[2.952-010]`), lo que resta fiabilidad a esa parte de la tabla.
- La decodificacion a 250K se degrada ~20% en mediana y triplica su dispersion cuando hay una sesion de agente larga residente; cualquier cifra de contexto largo debe medirse con la carga concurrente real.
- El primer acceso a 128K con cache de expertos vacia cae a 67,0 tok/s; las cifras estables asumen cache ya poblada.
- El requisito de toolchain es estricto (nvcc >= 12.4, CUDA 13.2 para Ampere) y el autor documenta fallos de compilacion con versiones anteriores.
- No hay datos de sesgos, alucinacion ni comportamiento multilingue del modelo base en la informacion disponible.
- Las capacidades de tool calling, agentes y multimodalidad del modelo base no se documentan en este repositorio; el unico uso de agente mencionado es la sesion Hermes del experimento de interferencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Lafonse/strata-nvfp4-a6000-bench
- Modelo base del checkpoint: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fork del motor con soporte NVFP4: https://github.com/sergqwer/strata-nvfp4
- Motor Strata upstream: https://github.com/Niko1221/Strata
- Nota: la busqueda web realizada solo devolvio leaderboards genericos sin datos especificos de este modelo (benchlm.ai, swfte.com, llm-stats.com, luminabench.com), por lo que no se incluyen como fuentes de la ficha.
