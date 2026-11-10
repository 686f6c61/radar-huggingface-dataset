# austindixson/Nemotron-3.5-30B-A3B-Fractal-64-Q2_0-Metal

## Resumen

Este repositorio no contiene pesos de un modelo, sino una ficha tecnica de despliegue: documenta como ejecutar la cuantizacion Fractal-64 (Q2_0) del modelo Nemotron-3.5-30B-A3B en Apple Silicon mediante un kernel de decodificacion Metal experimental. El modelo subyacente es una variante MoE de 30B parametros totales y 3B activos, derivada de NVIDIA-Nemotron-3.5-Lightning-30B-A3B, cuantizada por Synchopate con un formato de bloque propietario de 3,75 bits por peso que no es compatible con llama.cpp estandar.

La relevancia practica reside en el ahorro de espacio y en el rendimiento medido: el fichero GGUF ocupa 14,36 GiB frente a los 17,62 GiB de una cuantizacion IQ4_XS estandar, con una velocidad de decodificacion de 57,65 tok/s en un M1 Max de 64 GB, un 7,6% superior a IQ4_XS y solo un 5,2% inferior a Q2_K. El coste es un aumento de perplejidad del 3,7% respecto a IQ4_XS en wikitext-2.

Es un artefacto de nicho orientado a usuarios de Mac con Metal que quieran ejecutar un MoE de 30B en memoria unificada con la mayor densidad posible, aceptando la dependencia de un fork no fusionado de llama.cpp (llama-modchip) y las limitaciones de calidad inherentes a una cuantizacion de 2 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) derivada de NVIDIA Nemotron-3.5-Lightning-30B-A3B; 128 expertos, 6 activos por token |
| Parametros totales | 30B (aproximado, segun nombre del modelo) |
| Parametros activos | 3B (aproximado, segun nombre A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_0 Fractal-64 (3,75 bits por peso, bloques de 64 pesos en 30 bytes) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (fichero de 15.420.034.624 bytes, 14,36 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) de NVIDIA, con 128 expertos de los cuales se activan 6 por token, lo que resulta en aproximadamente 3B parametros activos sobre 30B totales. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de este repositorio es el formato de cuantizacion `block_q2_0` de Fractal-64: cada bloque almacena 64 pesos en 30 bytes mediante una escala fp16, nibbles de sub-escala, 16 bytes de bits de indice bajo y 8 bytes de bits de indice alto, de modo que cada peso es un indice de 3 bits en un codebook fijo de 8 valores. Este layout de 30 bytes difiere del Q2_0 de 18 bytes de llama.cpp estandar, por lo que requiere el fork llama-modchip y, para el kernel Metal rapido, la rama `mac-q2_0-fast-decode` del PR #24 de austindixson. El kernel optimiza la operacion de expertos `MUL_MAT_ID`, reduciendo su latencia de 199,3 a 91,5 microsegundos.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Nemotron-3.5-Lightning-30B-A3B.
- Ejecucion eficiente en Apple Silicon mediante Metal con el kernel de decodificacion del PR #24.
- Inferencia en CPU y GPU con llama.cpp a traves de llama-modchip.
- Capacidad de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en Mac con memoria unificada: un M1 Max de 64 GB puede cargar el fichero de 14,36 GiB y decodificar a 57,65 tok/s, lo que permite asistentes de texto interactivos sin conexion.
- Prototipado de bajo coste en hardware de consumo: al ocupar 3,26 GiB menos que IQ4_XS, deja mas memoria libre para el contexto KV y otras aplicaciones en equipos de 32-64 GB.
- Evaluacion de cuantizaciones extremas: util para investigadores que quieran medir el impacto de 3,75 bits por peso en un MoE de 30B frente a IQ4_XS y Q2_K con la misma maquina y semilla.
- Generacion de texto por lotes en local: el prefill de 500 tok/s en pp512 permite procesar prompts largos con latencia aceptable en un portatil Apple.
- Experimentacion con kernels Metal personalizados: sirve como banco de pruebas para el desarrollo del kernel `MUL_MAT_ID` de llama-modchip.
- Escenarios con restriccion estricta de VRAM/RAM: cuando el objetivo es maximizar el tamano de modelo que cabe en memoria, aceptando una perdida de calidad del 3,7% en perplejidad.

## Benchmarks y rendimiento

Mediciones en Apple M1 Max, 64 GB, Metal, con `llama-bench -t 8 -p 512 -n 128 -r 3 -ngl 99`, 9 muestras por cifra, media en tok/s.

| Fichero | Tamano (GiB) | Decode tg128 | Prefill pp512 |
|---|---:|---:|---:|
| Fractal-64, kernel PR #24 | 14,36 | 57,65 | 500,18 |
| Fractal-64, kernel anterior | 14,36 | 46,73 | 498,34 |
| IQ4_XS (Nemotron-3.5-Lightning-30B-A3B) | 17,62 | 53,57 | 554,47 |
| Q2_K (Nemotron-3.5-Lightning-30B-A3B) | 17,61 | 60,84 | 570,29 |

Perplejidad en wikitext-2 test, `-c 512 --chunks 40`:

| Fichero | PPL |
|---|---:|
| Fractal-64 (cualquiera de los dos kernels) | 6,9223 +/- 0,18449 |
| IQ4_XS | 6,6749 +/- 0,17449 |
| Q2_K | 6,7721 |

Relaciones: decodificacion 1,23x frente al kernel anterior, 1,076x frente a IQ4_XS y 0,948x frente a Q2_K. Perplejidad 3,7% superior a IQ4_XS (intervalo de confianza pareado al 95%: 1,026 a 1,048) y 2,2% superior a Q2_K. La operacion de expertos (`MUL_MAT_ID`, 6 de 128 expertos, n=1) baja de 199,3 a 91,5 microsegundos y de 191,9 a 91,9 microsegundos.

## Requisitos de hardware

- VRAM/RAM estimada: 14,36 GiB solo para los pesos; hay que sumar la cache KV, cuyo tamano depende del contexto y no esta documentado.
- GPU validadas: Apple M1 Max de 64 GB con Metal. No hay datos para otras GPU Apple ni para NVIDIA/AMD.
- Cabe en GPU de consumo: si, en Apple Silicon con memoria unificada de al menos 16-24 GB, aunque solo se ha medido en un M1 Max de 64 GB.
- Despliegue: exclusivamente llama-modchip (fork de llama.cpp) compilado desde la rama `mac-q2_0-fast-decode`; llama.cpp estandar falla al cargar por desajuste de offsets de tensor. No compatible con vLLM, TGI ni Ollama sin adaptacion.
- Latencia y throughput: 57,65 tok/s de decodificacion y 500,18 tok/s de prefill en M1 Max. Tras 8-12 segundos de decodificacion sostenida se produce un step-down termico que baja a unos 51 tok/s.
- Verificacion del build: `build/bin/test-quantize-fns` y `build/bin/test-backend-ops test -b MTL0 -p q2_0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano (GiB) | Decode M1 Max (tok/s) | PPL wikitext-2 | Licencia |
|---|---|---:|---:|---:|---:|---|
| Fractal-64 Q2_0 (este) | 30B totales / 3B activos | no disponible | 14,36 | 57,65 | 6,9223 | OpenMDW-1.1 |
| IQ4_XS (Lightning-30B-A3B) | 30B totales / 3B activos | no disponible | 17,62 | 53,57 | 6,6749 | OpenMDW-1.1 |
| Q2_K (Lightning-30B-A3B) | 30B totales / 3B activos | no disponible | 17,61 | 60,84 | 6,7721 | OpenMDW-1.1 |

Nota: los ficheros de comparacion son GGUFs de Nemotron-3.5-Lightning-30B-A3B, no los mismos pesos recuantizados, por lo que las diferencias de velocidad incluyen efectos de tamano de fichero. Los ficheros estandar incluyen ademas una capa de prediccion del siguiente token de 0,70 GiB que este fichero no tiene.

## Limitaciones y advertencias

- Calidad: la perplejidad es un 3,7% peor que IQ4_XS, por lo que se sacrifica precision a cambio de tamano.
- Compatibilidad: no carga en llama.cpp estandar; requiere llama-modchip y, para el kernel rapido, una rama no fusionada (PR #24).
- Rendimiento termico: tras 8-12 segundos de decodificacion sostenida, todos los builds en el M1 Max medido sufren step-down y se estabilizan en torno a 51 tok/s.
- El kernel sigue por detras de IQ4_NL en la operacion de expertos: 91,5 microsegundos frente a 85,7 microsegundos.
- Mediciones en una sola maquina (M1 Max); no hay datos de otras GPU Apple ni de hardware NVIDIA/AMD.
- La salida greedy con el nuevo kernel difiere del kernel anterior en 1 de 13 prompts de prueba, con margen de logit de 0,001228 (casi empate); ambos kernels presentan el mismo error relativo maximo de 8,9e-08 por operacion frente a referencia fp64.
- Idiomas, contexto y sesgos: no disponibles en la informacion proporcionada.
- Licencia OpenMDW-1.1: el texto completo y los avisos de origen estan en el fichero `LICENSE` del repositorio; conviene revisarlos antes de uso comercial.
- El repositorio no contiene pesos: es solo una ficha de despliegue y benchmarks; los pesos deben descargarse del repositorio de Synchopate.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/austindixson/Nemotron-3.5-30B-A3B-Fractal-64-Q2_0-Metal
- Pesos GGUF (Synchopate): https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- llama-modchip (Synchopate): https://github.com/synchopate/llama-modchip
- PR #24 (kernel Metal rapido): https://github.com/synchopate/llama-modchip/pull/24
- Fork con la rama de compilacion: https://github.com/austindixson/llama-modchip
