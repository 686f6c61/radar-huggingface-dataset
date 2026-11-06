# Hero422/qwen3.8-27b-exl3-v2-rad

## Resumen

Qwen3.8-27B EXL3-V2 es una familia de cuantizaciones mixtas del modelo base Qwen/Qwen3.8-27B, publicada por el usuario Hero422. No se trata de un modelo entrenado desde cero, sino de un conjunto de contenedores en formato `.rad` para el motor de inferencia radiance, donde cada tensor recibe su propio ancho de bits (desde 1 hasta 8 bits por peso) mediante códigos trellis EXL3. El objetivo es ofrecer, para un mismo presupuesto de bytes, una divergencia KL menor que la escalera EXL3 de referencia de turboderp y competitiva frente a los cuantizados IQR-V3.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de aproximadamente 27.000 millones de parametros en hardware muy limitado, desde 4,68 GiB (1,50 bpw) hasta 28,18 GiB (9,00 bpw), con una calidad medible y documentada en cada punto de la escalera. El autor reporta entre un 5 % y un 30 % menos de KLD que la escalera EXL3 de turboderp al mismo tamano, con la mayor parte de la mejora concentrada en el rango de 2 a 4 bpw.

La informacion disponible no incluye detalles sobre la arquitectura interna del modelo base (tipo de transformer, atencion, contexto, datos de entrenamiento), por lo que esta ficha se centra en lo que si esta documentado: el proceso de cuantizacion, los resultados de fidelidad y los requisitos de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; los contenedores usan la arquitectura `qwen35_exl3` del motor radiance) |
| Parametros totales | 26.895.998.464 (cifra de referencia usada por el autor para calcular bpw reales) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis de 1 a 8 bits por peso, con mezcla por tensor; 15 variantes desde 1,50 hasta 9,00 bpw; embedding con codebook Lloyd bajo rotacion Hadamard de 128 puntos; head en K2-K8; algunos tensores en bf16 en la variante de 9,00 bpw |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.rad` (contenedores radiance); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

Esta publicacion no entrena ningun modelo: cuantiza el modelo base Qwen/Qwen3.8-27B. El proceso parte de cuantizaciones EXL3 propias de cada capa lineal para K = 1…8 bits por peso, usando el cuantizador de exllamav3 (LDLQ sobre el trellis, codebook `mul1`) y las matrices de calibracion publicadas por el reto de cuantizacion de radiance. A partir de 5 bits, el autor incorpora tambien tensores publicados por turboderp cuando miden mejor. El embedding usa un codebook Lloyd bajo una rotacion Hadamard de 128 puntos, y se mantiene en bf16 en las variantes de 8,00 y 9,00 bpw.

La innovacion central es la seleccion por tensor. El autor ajusta un modelo de sensibilidad basado en el error proxy de Hessiana por tensor (tr(ΔW H ΔWᵀ)), escalado por grupo y profundidad, con propagacion del error a lo largo de las capas. Sobre ese modelo aplica un solver exacto de programacion dinamica sobre cubos de bytes que minimiza la KLD predicha para un tamano objetivo exacto. El proceso de busqueda es en streaming: cada pocas evaluaciones se reajusta el modelo y se rellena la cola, con aproximadamente 1.450 evaluaciones totales (mas de 800 de mezclas completas) y seleccion final sobre datos reservados.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3.8-27B, aunque la informacion disponible no detalla cuales son.
- Sin torre de vision: los contenedores son exclusivamente de texto; el autor indica que la vision y el drafter especulativo (DFlash2) se planifican para EXL3-V3.
- Sin decodificacion especulativa: no incluye drafter, por lo que no se beneficia de aceleracion especulativa en esta version.
- Tool calling y agentes: no confirmado en la informacion disponible; depende de las capacidades del modelo base, no documentadas aqui.
- Multilingue: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Despliegue en GPU de consumo con VRAM limitada: la variante de 2,50 bpw ocupa 7,81 GiB y la de 3,00 bpw 9,39 GiB, lo que permite ejecutar un modelo de ~27B en tarjetas de 12-16 GB con el motor radiance.
- Servicio de texto en produccion con presupuesto de memoria ajustado: la variante de 4,00 bpw (12,52 GiB) ofrece una KLD estimada de 0,0081, adecuada para tareas generativas generales donde no se requiere fidelidad casi exacta al bf16.
- Evaluacion comparativa de tecnicas de cuantizacion: la escalera completa de 15 tamanos con KLD medido en datos reservados sirve como referencia para investigar mezclas por tensor y modelos de sensibilidad.
- Sustitucion de cuantizaciones GGUF en entornos radiance: si el pipeline ya usa el motor radiance con los plugins `qc-exl3-ladder`, estos contenedores evitan reconvertir el modelo y ofrecen una alternativa con KLD documentada.
- Archivado de alta fidelidad: la variante de 8,00 bpw (25,05 GiB, KLD 0,00026) o la de 9,00 bpw (28,18 GiB, KLD 0,00021) sirven para conservar una copia casi indistinguible del bf16 con un ahorro moderado de espacio.
- Investigacion sobre errores de cuantizacion por capa: el desglose de que tamanos usan tensores propios y cuales de turboderp (por ejemplo, 104 tensores en 5,50 bpw) permite analizar el impacto de cada eleccion.

## Benchmarks y rendimiento

Los datos publicados son de fidelidad (KLD frente al modelo bf16) y de precision top-1, no de tareas estandar como MMLU o HumanEval.

| Variante | GiB | bpw real | KLD (calib. reservada) | KLD estimada leaderboard | Top-1 |
|---|---|---|---|---|---|
| 1,50 bpw | 4,68 | 1,494 | 0,49221 | ~0,49 | 72,7 % |
| 1,75 bpw | 5,44 | 1,738 | 0,28036 | ~0,29 | 79,0 % |
| 2,00 bpw | 6,22 | 1,988 | 0,15471 | ~0,16 | 84,8 % |
| 2,50 bpw | 7,81 | 2,494 | 0,06250 | ~0,067 | 90,0 % |
| 3,00 bpw | 9,39 | 2,999 | 0,02726 | ~0,030 | 93,5 % |
| 3,50 bpw | 10,95 | 3,498 | 0,01517 | ~0,018 | 95,3 % |
| 4,00 bpw | 12,52 | 3,998 | 0,00712 | ~0,0081 | 96,6 % |
| 4,50 bpw | 14,09 | 4,500 | 0,00374 | ~0,0043 | 97,6 % |
| 5,00 bpw | 15,65 | 5,000 | 0,00215 | ~0,0025 | 98,2 % |
| 5,50 bpw | 17,20 | 5,492 | 0,00122 | ~0,0015 | 98,6 % |
| 6,00 bpw | 18,73 | 5,981 | 0,00076 | ~0,00093 | 98,9 % |
| 6,50 bpw | 20,34 | 6,495 | 0,00047 | ~0,00058 | 99,1 % |
| 7,00 bpw | 21,92 | 7,001 | 0,00035 | ~0,00043 | 99,3 % |
| 7,50 bpw | 22,91 | 7,316 | 0,00031 | ~0,00038 | 99,3 % |
| 8,00 bpw | 25,05 | 8,001 | 0,00026 | ~0,00032 | 99,4 % |
| 9,00 bpw | 28,18 | 9,001 | 0,00021 | ~0,00026 | 99,4 % |

Comparacion estimada con IQR-V3 y EXL3-V1 al mismo tamano:

| Tamano | EXL3-V2 (est.) | IQR-V3 mas cercano | EXL3-V1 (turboderp) |
|---|---|---|---|
| 2,0 | 0,16 | no disponible | 0,154 a 2,12 bpw |
| 2,5 | 0,067 | IQ2R-V3 0,068 a 2,46 | 0,078 a 2,71 |
| 3,0 | 0,030 | IQ3R-S-V3 0,026 a 3,15 | 0,035 a 3,12 |
| 3,5 | 0,018 | IQ3R-V3 0,017 a 3,46 | 0,020 a 3,66 |
| 4,0 | 0,0081 | IQ4R-S-V3 0,0076 a 4,13 | 0,0095 a 4,07 |
| 4,5 | 0,0043 | IQ4R-V3 0,0051 a 4,46 | no disponible |
| 5,0 | 0,0025 | IQ5R-S-V3 0,0025 a 5,06 | 0,0026 a 5,07 |
| 6,0 | 0,00093 | IQ6R-S-V3 0,0011 a 6,05 | 0,0011 a 6,02 |
| 7,0 | 0,00043 | IQ6R-L-V3 0,00072 a 6,94 | no disponible |
| 8,0 | 0,00032 | IQ8R-V3 0,00047 a 8,04 | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4,68 GiB (1,50 bpw) y 28,18 GiB (9,00 bpw) solo para los pesos; hay que sumar la cache KV en bf16 y el overhead del motor radiance.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: si, desde la variante de 2,50 bpw (7,81 GiB) en adelante en tarjetas de 12 GB; la de 3,00 bpw (9,39 GiB) en 12-16 GB; la de 4,00 bpw (12,52 GiB) en 16 GB con margen ajustado; la de 5,00 bpw (15,65 GiB) en 24 GB.
- Opciones de despliegue: exclusivamente el motor radiance 1.13.0 con los plugins `qc-exl3-ladder` (arquitectura `qwen35_exl3`, kernels `exl3_dense` / `exl3r4d`, gather `embed_tq`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor senala que los GEMM de IQR-V3 son mas rapidos por usar computo int8, y que EXL3-V2 emplea los mismos kernels de activacion f16 que EXL3-V1; la velocidad se abordara en EXL3-V3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B EXL3-V2 (este) | 26,90 B | no disponible | `.rad` (radiance) | apache-2.0 | Escalera de 15 tamanos con KLD medido; sin vision ni drafter |
| Qwen3.8-27B EXL3-V1 (turboderp) | 26,90 B | no disponible | `.rad` (radiance) | no disponible | Referencia de la comparacion; KLD ligeramente peor en la mayoria de tamanos |
| Qwen3.8-27B IQR-V3 | 26,90 B | no disponible | no disponible | no disponible | Mejor KLD en 3,0-4,0 bpw; GEMM int8 mas rapidos |
| Qwen3.8-27B bf16 (base) | 26,90 B | no disponible | safetensors (presumiblemente) | apache-2.0 | Referencia de fidelidad; KLD 0 por definicion |

## Limitaciones y advertencias

- Solo texto: no incluye torre de vision ni drafter especulativo; las capacidades multimodales del modelo base no estan disponibles en estos contenedores.
- Dependencia estricta de software: requiere radiance 1.13.0 y los plugins `qc-exl3-ladder`, incluyendo una pull request concreta; no funciona en otros motores.
- Las variantes de 1,50 y 1,75 bpw son puntos de investigacion y, segun el propio autor, el modelo no es practicamente usable a esos tamanos.
- La KLD de la leaderboard es una estimacion basada en el escalado de los contenedores de turboderp, no una medicion directa; los valores llevan ademas un sesgo de seleccion optimista, aunque el autor lo situa por debajo del ruido de medicion (±1,5 %).
- El modelo de sensibilidad y el solver son heuristicas ajustadas sobre datos de calibracion; el comportamiento en dominios alejados del corpus de calibracion no esta documentado.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto del modelo base; deben evaluarse sobre el modelo original.
- La licencia apache-2.0 se hereda del modelo base, pero conviene verificar las condiciones del modelo Qwen3.8-27B original antes de un uso comercial.
- El repositorio ocupa 258,9 GB porque contiene todas las variantes; descargar solo el archivo `.rad` necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hero422/qwen3.8-27b-exl3-v2-rad
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Plugins `qc-exl3-ladder`: https://codeberg.org/StillDeadcode/radiance/pulls/292
- Version EXL3-V1 del mismo autor: https://huggingface.co/Hero422/qwen3.8-27b-exl3-turboderp-ladder
