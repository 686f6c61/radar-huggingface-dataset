# Grawnch/Inkling-2-Mini-WV-SM120-Staging

## Resumen

Inkling-2-Mini-WV-SM120-Staging es una cuantizacion extrema del modelo base `thinkingmachines/Inkling-2-Mini` (licencia Apache-2.0), publicada por el usuario Grawnch. No se trata de un modelo nuevo, sino de un checkpoint comprimido a 2,4658 bits por peso (bpw) que reduce el peso de los pesos de ~20,16 GB a 8,83 GiB, pensado para ejecutarse en GPUs consumer Blackwell de gama media como la RTX 5060 Ti. El repositorio incluye ademas un motor de inferencia nativo en C++/CUDA compilado solo para SASS (`sm_120` y `sm_120a`, sin PTX) distribuido como wheel de Python 3.13 para Windows.

El modelo base es un transformer con mezcla de expertos (MoE) y nucleo recurrentes por bucle: 24 capas fisicas que se desenrollan en 48 pasadas de ejecucion mediante un nucleo de 3 pasadas (`L06..L17`). La cuantizacion combina VQ-4096 de 4 dimensiones para expertos calientes, VQ8 de 4 cosenos para expertos frios, GPTQ con Cholesky y RMT para atencion densa y `lm_head`, y un cabezal de decodificacion especulativa `MTP-8` (drafter DSpark de 3 capas con `MarkovHead`).

Su relevancia actual reside en que demuestra que un MoE de esta escala puede ejecutarse en una GPU de 8 GB o 16 GB con velocidades de 57-77 tok/s en decodificacion greedy especulativa, manteniendo paridad de tokens bit a bit con la decodificacion estandar. Es un artefacto de investigacion en fase de staging (0 descargas, 0 likes), orientado a pruebas de rendimiento en hardware Blackwell bajo Windows 11.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con nucleo recurrente de 3 pasadas (24 capas fisicas desenrolladas a 48 pasadas de ejecucion) |
| Parametros totales | no disponible (repo de 9,5 GB; pesos cuantizados de 8,83 GiB) |
| Parametros activos | no disponible (600 expertos calientes + 2.472 expertos frios enrutados) |
| Longitud de contexto | 32K verificado en benchmarks (perfil de 16 GB); 8K en perfil de 8 GB |
| Tipos de cuantizacion | 2,4658 bpw global: VQ-4096 4D (3,3125 bpw) expertos calientes, VQ8 4-cosenos (2,250 bpw) expertos frios, `SWZ8_G32` GPTQ para atencion densa y `lm_head`, `WV6_4B38` (4,375 bpw) para embeddings |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint cuantizado) + wheel nativo `qfn_inkling2_sm120` (cp313/cp312 win_amd64) |

## Arquitectura y entrenamiento

El modelo base `Inkling-2-Mini` emplea una arquitectura MoE con un nucleo recurrente: 24 capas fisicas que se ejecutan en 48 pasadas mediante un bucle de 3 pasadas sobre las capas `L06..L17`. El checkpoint original usa cuantizacion `ModelOpt` NVFP4 en las capas `L00..L19` y MXFP8 en `L20..L23`, mas un fichero `mtp.safetensors` separado. La cuantizacion WV-v6.3 reduce aun mas el peso mediante un esquema diferenciado por tipo de capa: los expertos calientes (600 en total, con 32 en `L00..05`, 26 en `L06..17` y 20 en `L18..23`) usan VQ-4096 de 4 dimensiones bajo transformada FWHT-128 con LUT de 16 KB en memoria compartida; los expertos frios (2.472) usan VQ8 de 4 cosenos con `sb=6` y slabs DMA alineados a 256 B de 2.239.488 B.

La calibracion del nucleo recurrente se realizo con Hessianos encogidos por RMT agrupados en 3 pasadas, propagacion cerrada de estudiante en 3 pasadas y la activacion exacta `Inkling2SoftcappedSwiGLU` (`mlp_gate_softcap=4.0`, `mlp_up_softcap=25.0`). La atencion densa GQA (`wq, wk, wv, w_gate_attn, wo`) se cuantizo con GPTQ Cholesky RMT de bucle cerrado en `SWZ8_G32`, y el `lm_head` (`[200064, 2304]`) con Ridge de bucle cerrado sobre 24 documentos y KL de logits con softcap 30.0. El cabezal especulativo `MTP-8` es un drafter DSpark de 3 capas con `block_size=8` y `target_layer_ids=[5, 23, 41, 48]`, complementado con un `MarkovHead` RNN.

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy determinista (paridad bit a bit verificada entre `M=1` y `MTP-8` en 5 prompts x 256 tokens).
- Decodificacion especulativa sin perdida (`MTP-8`) con longitud media aceptada de 3,235 tokens por paso.
- Razonamiento y matematicas: perplexity reportada de 4,89 en el split Math (frente a 4,69 del profesor).
- Generacion de codigo: perplexity de 2,123 en el split Code (frente a 2,116 del profesor).
- Conversacion: perplexity de 7,10 en el split Chat, ligeramente mejor que el profesor (7,24).
- Soporte de contexto largo: hasta 32K tokens verificado en el perfil de 16 GB.
- Ejecucion en GPUs consumer Blackwell con 8 GB o 16 GB de VRAM.
- Soporte de tiering VRAM-RAM via PCIe Gen5x8 para GPUs de 8 GB.
- Capacidades multilingues: no disponible.
- Tool calling, function calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en RTX 5060 Ti de 16 GB: el perfil `all_vram` mantiene todos los pesos en GDDR7 con un pico de 9,41 GiB a 8K y 10,26 GiB a 32K, permitiendo ejecutar el modelo completo sin offloading en una GPU de gama media.
- Inferencia en RTX 5060 Ti de 8 GB: el perfil `8gb_tiered` con `VramCacheDmaManager` mantiene un pico de 6,51 GiB a 8K, dejando 1,2 GiB de margen para WDDM/DWM en Windows 11 y permitiendo ejecutar el modelo en GPUs de 8 GB.
- Servicio de chat interactivo con latencia baja: 76,84 tok/s en `B=1` con `MTP-8` en el perfil de 16 GB, suficiente para conversacion en tiempo real con un solo usuario.
- Procesamiento por lotes de prompts cortos: 113,10 tok/s con `B=4` en el perfil de 16 GB, adecuado para tareas de generacion masiva de texto o clasificacion.
- Relleno de contexto largo: prefill de 1.359 tok/s a 8K y 999 tok/s a 32K en el perfil de 16 GB, util para analisis de documentos extensos o resumen de conversaciones largas.
- Investigacion en cuantizacion extrema: el checkpoint sirve como referencia reproducible para estudiar el impacto de VQ-4096, VQ8 y GPTQ Cholesky en modelos MoE con nucleo recurrente, con metricas de KLD (0,068819) y acuerdo Top-1 (92,422%) frente al profesor.
- Evaluacion de decodificacion especulativa: el `MTP-8` con `MarkovHead` permite medir la ganancia real (2,79x en 16 GB, 2,28x en 8 GB) manteniendo paridad bit a bit con la decodificacion estandar.

## Benchmarks y rendimiento

| Metrica | Profesor (20,16 GB) | Estudiante WV-v6.3 |
|---|---|---|
| KLD ciego vs profesor | - | 0,068819 |
| Acuerdo Top-1 | - | 92,422% |
| Perplexity All_Val | 5,30031 | 5,39794 |
| Perplexity C4 | 10,98 | 11,52 |
| Perplexity Math | 4,69 | 4,89 |
| Perplexity Code | 2,116 | 2,123 |
| Perplexity Chat | 7,24 | 7,10 |

Rendimiento en RTX 5060 Ti (Windows 11, `sm_120`, `MTP-8`):

| Perfil | Pico VRAM 8K | Pico VRAM 32K | B=1 M=1 | B=1 MTP-8 | B=4 MTP-8 | Prefill 8K | Prefill 32K |
|---|---|---|---|---|---|---|---|
| A (16 GB, `all_vram`) | 9,41 GiB | 10,26 GiB | 27,56 tok/s | 76,84 tok/s | 113,10 tok/s | 1.359 tok/s | 999 tok/s |
| B (8 GB, `8gb_tiered`) | 6,51 GiB | no disponible | 25,42 tok/s | 57,87 tok/s | 105,74 tok/s | 841 tok/s | no disponible |

Tasa de acierto de cache PCIe DMA en el perfil B: 72,9% (`M=1`) y 63,3% (`MTP-8`). Longitud media aceptada por `MTP-8`: 3,235 tokens por paso. Paridad bit a bit verificada en 5/5 prompts x 256 tokens entre `M=1` y `MTP-8`, y entre perfiles de 16 GB y 8 GB.

## Requisitos de hardware

- VRAM estimada: 9,41 GiB a 8K y 10,26 GiB a 32K en perfil `all_vram`; 6,51 GiB a 8K y 6,68 GiB con `B=4` en perfil `8gb_tiered`.
- GPU objetivo: RTX 5060 Ti en sus variantes de 16 GB y 8 GB (arquitectura Blackwell, `sm_120`).
- GPU compatibles: cualquier GPU Blackwell con `sm_120` o `sm_120a`; no compatible con arquitecturas anteriores (el binario es solo SASS, sin PTX de respaldo).
- Cabe en GPU consumer: si, en RTX 5060 Ti de 8 GB y 16 GB; no se documenta compatibilidad con otras GPUs consumer.
- Opciones de despliegue: motor nativo `qfn_inkling2_sm120` distribuido como wheel `cp313` y `cp312` para `win_amd64`; requiere Python 3.13 (o 3.12), PyTorch CUDA 13.0, `safetensors`, `transformers`, `huggingface_hub` y `tiktoken`.
- Sistema operativo: Windows 11 (unico documentado).
- Throughput: 76,84 tok/s (`B=1`, `MTP-8`, perfil 16 GB); 57,87 tok/s (`B=1`, `MTP-8`, perfil 8 GB); 113,10 tok/s (`B=4`, perfil 16 GB).
- Latencia de prefill: 1.359 tok/s a 8K y 999 tok/s a 32K en perfil 16 GB; 841 tok/s a 8K en perfil 8 GB.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el artefacto depende de un binario CUDA propietario especifico de `sm_120`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-WV-SM120-Staging | no disponible (8,83 GiB cuantizados) | 32K | 2,4658 bpw (VQ + GPTQ) | Apache-2.0 | Hugging Face (staging, 0 descargas) |
| thinkingmachines/Inkling-2-Mini (profesor) | no disponible (20,16 GB) | no disponible | NVFP4 + MXFP8 | Apache-2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de staging: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (21 de noviembre de 2026); no es un artefacto estable ni validado por la comunidad.
- Dependencia de hardware especifico: el binario es solo SASS para `sm_120` y `sm_120a`, sin PTX; no funciona en GPUs Ampere, Ada ni Hopper, ni en Linux o macOS.
- Dependencia de sistema operativo: solo se documenta Windows 11; el perfil de 8 GB asume 1,2 GiB de margen para WDDM/DWM.
- Perdida de calidad respecto al profesor: KLD de 0,068819 y degradacion de perplexity en C4 (10,98 a 11,52) y Math (4,69 a 4,89); el rendimiento en tareas de razonamiento matematico puede verse afectado.
- Contexto limitado en el perfil de 8 GB: solo se verifican 8K tokens; no se documenta comportamiento a 32K con tiering.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingue.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base y el binario CUDA deben verificarse por separado; el wheel nativo no declara licencia propia en la informacion disponible.
- Tool calling y soporte de agentes: no documentados; no se debe asumir su disponibilidad en produccion.
- Sin soporte de frameworks estandar: no hay integracion con vLLM, llama.cpp, Ollama ni TGI, lo que limita su adopcion en pipelines existentes.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Inkling-2-Mini-WV-SM120-Staging
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
