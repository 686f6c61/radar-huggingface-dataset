# jakeatx/Qwen3.8-27B-ATX-IQ4_XS-M-GGUF

## Resumen

Qwen3.8-27B-ATX-IQ4_XS-M es una cuantización GGUF del modelo Qwen3.8-27B (27.320.697.856 parámetros) publicada por el usuario jakeatx. No es un modelo entrenado desde cero, sino una receta de cuantización orientada a velocidad y a contexto largo, pensada para ejecutarse íntegramente en una única GPU de consumo con 24 GB de VRAM, en concreto una RTX 3090 o 3090 Ti. El objetivo declarado es alojar una ventana de 200K tokens con caché de claves de 8 bits y la cabeza especulativa MTP propia del modelo base, decodificando más rápido por ronda especulativa que las cuantizaciones Q3_K_XL y Q4_K_M de Unsloth en esa misma tarjeta.

El modelo base Qwen3.8-27B pertenece a la familia Qwen3.8 de Alibaba, con arquitectura híbrida: 48 de sus capas son recurrentes (estado recurrente, no rewindable) y el resto son capas de atención transformer convencionales. La receta ATX combina un formato base IQ4_XS en la mayoría de tensores con un patrón de mejora tipo M que eleva a Q5_0, Q6_K y Q8_0 determinados tensores (proyecciones K/V de atención, salida de atención, salida GDN y FFN down), resultando en 4,56 bits por peso y un archivo de 13,9 GiB de pesos residentes en GPU.

La relevancia actual es práctica: demuestra que un modelo de 27B con contexto de 200K y decodificación especulativa puede caber y rendir en hardware de consumo de gama alta de generaciones anteriores, con cifras medidas de throughput y latencia publicadas por el autor. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: capas recurrentes (48) + capas de atención transformer; incluye capa MTP (blk.64) para decodificación especulativa |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 245.760 tokens medidos como máximo; 204.800 recomendado con margen (20,9 GiB) |
| Tipos de cuantización | GGUF IQ4_XS base con patrón M (mezcla de IQ4_XS, Q5_0, Q6_K, Q8_0); 4,56 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida en la que 48 capas son recurrentes y el resto son capas de atención transformer. Esta mezcla condiciona el despliegue: un estado recurrente no puede rebobinarse, por lo que el servidor necesita checkpoints de estado guardados en RAM del host para poder editar o regenerar turnos en conversaciones largas. El modelo incorpora además una cabeza MTP (multi-token prediction) de una sola capa (blk.64) que actúa como drafter para decodificación especulativa.

Esta publicación no entrena el modelo: parte del GGUF BF16 de Unsloth y aplica una matriz de importancia (imatrix) de Unsloth junto con un mapa de tipos por tensor. La distribución es aproximadamente 75% de los bytes de pesos en IQ4_XS, 17% en Q5_0 (attn_output, ssm_out, ffn_down en las capas que la escalera de niveles de Unsloth mejora primero), y el resto en Q6_K (proyecciones K/V de atención y cabeza de salida) y Q8_0 (ocho tensores K/V que Q4_K_M mantiene en Q8_0, más la capa MTP draft y 96 vectores alpha/beta de GDN). El autor justifica la elección: en SM86 el formato más rápido por tensor en anchos de verificación especulativa de 1 a 5 es IQ4_XS, Q5_0 es aproximadamente un 16% más barato que Q5_K, y Q8_0 es el único formato cercano al techo de memoria. Los bits extra se asignan según la escalera de niveles de Unsloth, no según los mayores outliers de la imatrix (correlación débil, 0,14).

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y de larga duración, con ventana de hasta 245.760 tokens medidos.
- Decodificación especulativa mediante la cabeza MTP propia del modelo (`--spec-type draft-mtp`), con hasta 3 tokens draft por ronda y umbral de probabilidad 0,45.
- Soporte de plantillas de chat Jinja (`--jinja`) para conversaciones multi-turno.
- Gestión de contexto largo con caché de prompt persistente entre turnos (`--cache-prompt`) y checkpoints de contexto (`--ctx-checkpoints`) para editar o regenerar turnos en conversaciones de hasta 200K tokens.
- Carga de trabajo orientada a código y agentes: el autor reporta mayor throughput en cargas de coding y agentic que en retrieval.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistencia de código en contexto largo: el modelo puede mantener repositorios completos o grandes fragmentos de código dentro de su ventana de 200K tokens, con decodificación de 60-79 tok/s a 64K y 44-72 tok/s a 100K, adecuado para sesiones de refactorización o revisión que requieren ver muchos archivos a la vez.
- Agentes multi-turno con memoria de conversación: gracias a `--cache-prompt`, un nuevo turno sobre una conversación de 200K solo paga los tokens nuevos en lugar de un re-prefill de unos 100 segundos, lo que hace viable un agente que acumula contexto a lo largo de muchas interacciones.
- Edición y regeneración de respuestas en conversaciones largas: los checkpoints de contexto (hasta 24, separados al menos 10.240 tokens) permiten rebobinar el estado recurrente tras una edición, con un coste de replay de como máximo diez segundos.
- Procesamiento de documentos extensos y retrieval: el autor reporta la menor velocidad en cargas de retrieval (44 tok/s a 100K), pero la ventana de 245K permite ingerir documentación o contratos completos sin trocear.
- Despliegue en estación de trabajo con una sola GPU: con 13,9 GiB de pesos residentes y 22,1 GiB listos con un prompt de 240K, cabe en una RTX 3090/3090 Ti de 24 GB, lo que permite ofrecer un asistente local de 27B sin infraestructura de centro de datos.
- Comparación de recetas de cuantización: el repositorio incluye la receta completa (comando `llama-quantize`, mapa de tipos, imatrix) y logs de ejecución, útil para quien quiera replicar el proceso sobre otros fine-tunes; el autor lo hace con Qwopus3.8-27B-Flash en un repo hermano.
- Servicio con múltiples conversaciones en un solo servidor: `--cache-ram 8192` permite aparcar el KV de una conversación de 200K (unos 7,4 GB) cuando otra ocupa el slot, útil para un servidor personal con varios hilos de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que una comparación emparejada en Terminal-Bench, SciCode y GDPval está en curso. Sí se publican medidas de rendimiento de inferencia en RTX 3090 Ti (350 W, fork TurboQuant+ con trabajo de kernels SM86, MTP-3, K en q8_0 y V en turbo3):

| Modelo | ms por ronda especulativa 64K / 100K | Prefill tok/s 64K / 100K | Protocolo de 45 prompts | Contexto máximo |
|---|---:|---:|---|---:|
| Q3_K_XL (11,7 GiB) | 46 / 53 | 1055 / 903 | 18 / 71 (referencia) | 262K |
| Q4_K_M (14,6 GiB) | 52 / 57 | 1063 / 910 | referencia | ~230K (estimado) |
| ATX-IQ4_XS-M (13,9 GiB) | 42,2 / 48,1 | 1170 / 993 | 17 / 70 | 245K (medido) |

Decodificación muestreada (temperatura 1, top-k 20, top-p 0,95, generaciones de 256 tokens): aproximadamente 93-108 tok/s a 16K, 60-79 a 64K y 44-72 a 100K según la carga. La calidad esperada se sitúa entre Q3_K_XL y Q4_K_M: todo tensor que Q3_K_XL mantiene por debajo de 4 bits está aquí a 4,25 bpw o más, mientras que los tensores mayoritarios llevan un cuarto de bit menos que Q4_K_M.

## Requisitos de hardware

- VRAM estimada: 13,9 GiB de pesos residentes en GPU; 20,9 GiB con contexto de 200K; 22,1 GiB con prompt de 240K.
- GPU recomendada por el autor: RTX 3090 o RTX 3090 Ti (24 GB, arquitectura SM86). El fork de runtime está compilado específicamente para `CMAKE_CUDA_ARCHITECTURES=86`.
- Cabe en GPU de consumo: sí, en RTX 3090/3090 Ti de 24 GB. No se documenta su comportamiento en otras tarjetas.
- Despliegue: `llama-server` de llama.cpp con el fork https://github.com/JakeATX/llama-cpp-qwen-ampere (rama `main` en `fdfea8123`), compilado con `-DGGML_CUDA=ON -DGGML_CUDA_FA=ON -DCMAKE_CUDA_ARCHITECTURES=86`. Se usa `-fa on`, `-ctk q8_0`, `-ctv turbo3`, `--parallel 1`, `--fit off`.
- Memoria de host adicional: los checkpoints de contexto ocupan 150 MiB más 1,5 KiB por token de posición (unos 165 MiB a 10K y 495 MiB a 240K); 24 checkpoints a 10.240 de espaciado cubren toda la ventana por unos 7,8 GiB. `--cache-ram 8192` reserva 8 GiB para aparcar conversaciones completas.
- Throughput y latencia: prefill de 1170 tok/s a 64K y 993 tok/s a 100K; 42,2 ms por ronda especulativa a 64K y 48,1 ms a 100K; decodificación de 93-108 tok/s a 16K y 44-72 tok/s a 100K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos en GPU | ms/ronda 64K | Prefill 64K (tok/s) | Licencia |
|---|---|---:|---:|---:|---:|---|
| ATX-IQ4_XS-M | 27,3B | 245K medido | 13,9 GiB | 42,2 | 1170 | Apache 2.0 |
| Qwen3.8-27B Q4_K_M (Unsloth) | 27,3B | ~230K estimado | 14,6 GiB | 52 | 1063 | Apache 2.0 |
| Qwen3.8-27B Q3_K_XL (Unsloth) | 27,3B | 262K | 11,7 GiB | 46 | 1055 | Apache 2.0 |
| Qwopus3.8-27B-Flash ATX-IQ4_XS-M | 27,3B (base) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |

La comparación se limita a cuantizaciones del mismo modelo base y a la receta hermana sobre el fine-tune Qwopus3.8-27B-Flash, publicada en un repositorio separado con su propia imatrix y comparación de velocidad frente a su Q4_K_S. No se dispone de datos frente a modelos de otros desarrolladores.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda todos los sesgos, riesgos de alucinación y limitaciones del Qwen3.8-27B original, sobre los que no se aporta información en esta ficha.
- La calidad esperada es inferior a Q4_K_M en los tensores mayoritarios (un cuarto de bit menos por peso); el autor no ha publicado todavía la comparación de calidad en Terminal-Bench, SciCode y GDPval.
- El rendimiento medido depende de un fork específico de llama.cpp con kernels para SM86 y de la variable `GGML_Q8_TURBO3_MMA_FUSED=1`; los números no son extrapolables a llama.cpp upstream ni a otras arquitecturas de GPU.
- 48 capas recurrentes no permiten rebobinar estado: sin `--ctx-checkpoints` configurado, editar o regenerar un turno en una conversación larga obliga a repetir el prefill.
- El consumo de RAM del host crece con la densidad de checkpoints (60 checkpoints a 4.096 tokens suponen unos 20 GiB en el extremo profundo de la ventana).
- El contexto máximo práctico está limitado por la VRAM: 245.760 tokens medidos con 22,1 GiB; no se garantiza en tarjetas de 24 GB con otros controladores o configuraciones.
- Idiomas soportados no documentados; no se puede asumir un comportamiento multilingüe concreto sin verificación.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B por si añaden términos adicionales.
- El repositorio mantiene el nombre de trabajo ATX-4-XS en el archivo GGUF, el mapa de tensores y los logs, lo que puede confundir en la verificación de integridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/Qwen3.8-27B-ATX-IQ4_XS-M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta hermana sobre Qwopus3.8-27B-Flash: https://huggingface.co/jakeatx/Qwopus3.8-27B-Flash-ATX-IQ4_XS-M-GGUF
- Runtime llama.cpp con kernels SM86: https://github.com/JakeATX/llama-cpp-qwen-ampere (rama `main`, commit `fdfea8123`)
