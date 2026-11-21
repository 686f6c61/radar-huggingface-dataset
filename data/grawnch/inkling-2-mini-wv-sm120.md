# Grawnch/Inkling-2-Mini-WV-SM120

## Resumen

Inkling-2-Mini-WV-SM120 es una cuantización extrema del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario Grawnch bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero, sino de un checkpoint comprimido a 2,466 bits por peso (bpw) que reduce el peso total a 8,83 GiB (9,49 GB), pensado para ejecutarse en GPUs Blackwell de consumo como la RTX 5060 Ti en configuraciones de 16 GB y 8 GB.

El paquete incluye un motor de inferencia nativo en C++/CUDA (`qfn_inkling2_sm120`) compilado exclusivamente para SASS de `sm_120`/`sm_120a` (sin PTX), junto con un drafter de decodificación especulativa `MTP-8` que acelera la generación de forma lossless (paridad bit a bit con decodificación greedy estándar). El modelo base es un transformer MoE con 24 capas físicas desplegadas en 48 pasadas de ejecución mediante un núcleo con bucle de 3 pasadas (`L06..L17`), y pesos originales en NVFP4 (capas L00..L19) y MXFP8 (L20..L23).

La relevancia de esta ficha radica en que demuestra una ruta práctica para servir un MoE grande en hardware de consumo muy limitado (8 GB de VRAM) mediante tiering PCIe Gen5 entre GDDR7 y RAM del sistema, con métricas de calidad verificadas frente al teacher (KLD 0,0688, perplejidad 5,398 frente a 5,300 del teacher). Es un artefacto muy específico de plataforma (Windows 11, Python 3.13, RTX 5060 Ti) y no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo en bucle (24 capas físicas, 48 pasadas de ejecución vía 3-pass loop en L06..L17) |
| Parámetros totales | no disponible (checkpoint cuantizado de 2,466 bpw, 8,83 GiB / 9,49 GB) |
| Parámetros activos | no disponible (MoE enrutado con 600 expertos hot y 2.472 expertos cold) |
| Longitud de contexto | 32K (evaluado con pico de 10,26 GiB en perfil 16 GB); ventana SWA de 1024 en 40 capas + 8 cachés globales |
| Tipos de cuantización | 2,466 bpw global; expertos hot 4D VQ-4096 (3,3125 bpw), expertos cold 4-Coset VQ8 (2,250 bpw), embeddings WV6_4B38 (4,375 bpw), atención densa y lm_head SWZ8_G32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint) + wheel nativo `cp313-cp313-win_amd64` para el runtime |

## Arquitectura y entrenamiento

El modelo base `thinkingmachines/Inkling-2-Mini` es un transformer MoE con atención GQA densa y un núcleo recurrente de 3 pasadas que despliega 24 capas físicas en 48 pasadas de ejecución. La cuantización WV-v6.3 aplica un esquema mixto: los expertos "hot" (600 en total, distribuidos como 32 en L00..05, 26 en L06..17 y 20 en L18..23) usan VQ-4096 de 4 dimensiones a 3,3125 bpw con LUT de 16 KB en SMEM bajo transformada FWHT-128; los expertos "cold" (2.472) usan VQ8 de 4 cosets a 2,250 bpw con LUT de 4 KB y slabs DMA alineados a 256 B de 2.239.488 B. Los embeddings se cuantizan con WV6_4B38 (FWHT128_Q4_LUT16, 4,375 bpw) y la atención densa y `lm_head` con Cholesky-GPTQ cerrado SWZ8_G32.

El proceso de calibración del núcleo en bucle (L06..L17) usa Hessianos reducidos por RMT agrupados en 3 pasadas, propagación cerrada del estudiante en 3 pasadas y la función exacta `Inkling2SoftcappedSwiGLU` (softcaps 4,0 y 25,0). El drafter `MTP-8` es un DSpark de 3 capas con `block_size = 8` y `target_layer_ids = [5, 23, 41, 48]`, más una cabeza MarkovHead RNN. No se documenta en la información disponible el número de tokens de entrenamiento del modelo base ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy y decodificación especulativa `MTP-8` (longitud media aceptada de 3,235 tokens por paso).
- Razonamiento y matemáticas: el checkpoint reporta perplejidad en subconjuntos `Math` (4,89) y `Code` (2,123) del conjunto de validación.
- Generación de código: perplejidad de 2,123 en el subconjunto `Code`, lo que sugiere buen ajuste en ese dominio.
- Conversación: perplejidad de 7,10 en el subconjunto `Chat`, ligeramente mejor que el teacher (7,24).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en RTX 5060 Ti de 16 GB: el perfil `all_vram` mantiene todos los pesos en GDDR7 con un pico de 9,41 GiB a 8K y 10,26 GiB a 32K, lo que permite servir el modelo en una GPU de consumo sin tiering.
- Despliegue en RTX 5060 Ti de 8 GB: el perfil `8gb_tiered` mantiene un pico de 6,51 GiB a 8K y 6,68 GiB con batch 4, dejando 1,2 GiB de margen para WDDM/DWM en Windows 11; útil para estaciones de trabajo con GPU de gama baja.
- Generación de código en local: la perplejidad de 2,123 en el subconjunto `Code` y el throughput de 76,84 tok/s (MTP-8, batch 1) permiten usar el modelo como asistente de código en un equipo de escritorio.
- Razonamiento matemático offline: con perplejidad de 4,89 en `Math` y contexto de 32K, se puede emplear para resolver problemas de varios pasos sin depender de la nube.
- Servicio de chat multi-turno: la ventana de 32K y las 40 capas con SWA-1024 más 8 cachés globales permiten mantener conversaciones largas con un consumo de VRAM controlado.
- Investigación en cuantización extrema: el checkpoint sirve como referencia reproducible para estudiar VQ-4096 + VQ8 bajo FWHT-128, calibración RMT y decodificación especulativa lossless en hardware Blackwell.
- Benchmarking de motores de inferencia: el wheel `qfn_inkling2_sm120` y los comandos `qfn-inkling2-bench` permiten medir throughput, prefill y paridad bit a bit frente a `M=1` en un entorno Windows 11 + Python 3.13.
- Prototipado de tiering VRAM/RAM: el modo `VramCacheDmaManager` con hit rate de 72,9% (M=1) y 63,3% (MTP-8) sobre PCIe Gen5x8 es un caso de estudio para servir modelos mayores que la VRAM disponible.

## Benchmarks y rendimiento

Calidad frente al teacher (16.376 tokens no vistos, sin solapamiento de 16-gramas con la calibración):

| Métrica | Teacher (20,16 GB) | Student WV-v6.3 |
|---|---|---|
| KLD (CUDA `_inkling2_ext`) | — | 0,068819 |
| Acuerdo Top-1 | — | 92,422% |
| Perplejidad `All_Val` | 5,30031 | 5,39794 |
| Perplejidad `C4` | 10,98 | 11,52 |
| Perplejidad `Math` | 4,69 | 4,89 |
| Perplejidad `Code` | 2,116 | 2,123 |
| Perplejidad `Chat` | 7,24 | 7,10 |

Rendimiento en RTX 5060 Ti (Blackwell `sm_120`, MTP-8 con longitud media aceptada 3,235 tok/paso):

| Perfil | VRAM pico | B=1 M=1 | B=1 MTP-8 | B=4 | Prefill 8K | Prefill 32K |
|---|---|---|---|---|---|---|
| A (16 GB, `all_vram`) | 9,41 GiB (8K) / 10,26 GiB (32K) | 27,56 tok/s | 76,84 tok/s (2,79x) | 113,10 tok/s | 1.359 tok/s + 101,4 tok/s | 999 tok/s + 71,4 tok/s |
| B (8 GB, `8gb_tiered`) | 6,51 GiB (8K) / 6,68 GiB (B=4) | 25,42 tok/s | 57,87 tok/s (2,28x) | 105,74 tok/s | 841 tok/s + 80,0 tok/s | no disponible |

Paridad bit a bit: 100% (5/5) entre M=1 y MTP-8, y 100% (5/5) entre perfil 16 GB y 8 GB forzado.

## Requisitos de hardware

- VRAM estimada: 8,65 GiB de pesos en GDDR7 para el perfil `all_vram`; 6,51 GiB de pico en el perfil `8gb_tiered` (con streaming de slabs cold desde RAM del sistema vía PCIe Gen5x8).
- GPU recomendadas: RTX 5060 Ti 16 GB (perfil A) y RTX 5060 Ti 8 GB (perfil B). El runtime es SASS-only para `sm_120`/`sm_120a`, por lo que no funciona en arquitecturas anteriores (Ampere, Ada) ni en GPUs sin soporte Blackwell.
- Cabe en GPU de consumo: sí, específicamente en RTX 5060 Ti (16 GB y 8 GB). No se documenta compatibilidad con otras consumer GPU.
- Opciones de despliegue: wheel nativo `qfn_inkling2_sm120-1.0.0-cp313-cp313-win_amd64.whl` sobre Windows 11 y Python 3.13, con PyTorch CUDA 13.0, `safetensors`, `transformers`, `huggingface_hub` y `tiktoken`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 27,56 tok/s (M=1) y 76,84 tok/s (MTP-8) con batch 1 en perfil A; 25,42 tok/s y 57,87 tok/s en perfil B; prefill de 1.359 tok/s a 8K en perfil A.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño / bpw | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-WV-SM120 | Cuantización MoE 2,466 bpw | 8,83 GiB | 32K | Apache-2.0 | Hugging Face (Grawnch) |
| thinkingmachines/Inkling-2-Mini (teacher) | MoE NVFP4/MXFP8 | 20,16 GB | no disponible | Apache-2.0 | Hugging Face (Thinking Machines) |
| Otras cuantizaciones de Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparativa se limita al par student/teacher.

## Limitaciones y advertencias

- Plataforma muy restringida: el runtime es SASS-only para `sm_120`/`sm_120a` y Windows 11 `win_amd64` con Python 3.13 (`cp313`); no hay build para Linux, macOS ni GPUs no Blackwell.
- Dependencia de una única GPU objetivo (RTX 5060 Ti en 16 GB u 8 GB); no se documenta funcionamiento en otras GPUs Blackwell ni en multi-GPU.
- El perfil de 8 GB depende de tiering PCIe Gen5x8 con hit rate de 72,9% (M=1) y 63,3% (MTP-8); un bus PCIe más lento degradará el throughput de forma significativa.
- Degradación de calidad respecto al teacher: KLD 0,0688 y caída de perplejidad en `C4` (10,98 → 11,52) y `Math` (4,69 → 4,89); `Chat` mejora ligeramente (7,24 → 7,10).
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el comportamiento del modelo base, no documentado aquí.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Tool calling, agentes y modo thinking: no documentados en esta cuantización.
- Uso comercial: permitido por Apache-2.0, pero la licencia del modelo base debe verificarse por separado (el checkpoint declara `base_model: thinkingmachines/Inkling-2-Mini` con Apache-2.0).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.
- El repo incluye un wheel binario propietario del autor; conviene auditar su procedencia antes de desplegarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Inkling-2-Mini-WV-SM120
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
