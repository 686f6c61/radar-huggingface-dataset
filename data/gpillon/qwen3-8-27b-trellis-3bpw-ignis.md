# gpillon/Qwen3.8-27B-trellis-3bpw-ignis

## Resumen

Qwen3.8-27B-trellis-3bpw-ignis es un artefacto de pesos cuantizados publicado por gpillon (autor del motor de inferencia ignis) a partir de Qwen/Qwen3.8-27B. No es un modelo nuevo ni un checkpoint de Transformers: es un contenedor `.ninfer` v2 de 13.379.877.124 bytes (12,46 GiB) que solo el motor ignis puede leer, pensado para ejecutar un modelo de 27B en tarjetas Blackwell de 16 GB (RTX 5060 Ti 16 GB, 5070 Ti y 5080).

El cuerpo y la cabeza de salida son el cuantizado EXL3 de turboderp (rama `SC_3.00bpw_H4`, revisión `86b95530f9d365d90dd24d01a997a8de0cdf6c55`), reempaquetado bit a bit sin recuantizar: trellis de 3,00 bits por peso de media. Todo lo demás se copia del artefacto de 32 GB del mismo autor: embedding de tokens en 8 bits, torre de visión, capa MTP, borrador especulativo DFlash2 de 5 capas, tokenizer y plantilla de chat.

Su relevancia es de nicho pero concreta: demuestra que un 27B híbrido con visión y decodificación especulativa puede ocupar 9,83-11,56 GB de memoria de dispositivo, con una pérdida medida de 3,56 puntos en un proxy de MMLU-Pro frente a BF16. La advertencia principal es que todavía no existe un comando para ejecutarlo: depende de la release de ignis que habilite la clase de tarjeta de 16 GB (issue #339).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido del modelo base Qwen3.8-27B: 48 capas Gated DeltaNet + 16 capas de atención |
| Parámetros totales | 27B (según la denominación del modelo base; la model card no desglosa el recuento) |
| Parámetros activos | no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible (las mediciones del autor usan ventanas de 8K, 64K y 128K tokens) |
| Tipos de cuantización | Cuerpo y cabeza de salida en trellis EXL3 con codebook `mul1`: 3,00 bits/peso de media (K=2 en 34 matrices, K=3 en 297, K=4 en 66, K=5 en 4); embedding de tokens en 8 bits con grupos de 32 y escalas fp16; borrador DFlash2 en NVFP4 con normas BF16 y cabeza de borrador en Q4 |
| Idiomas soportados | no disponible; las mediciones de perplejidad cubren inglés, italiano, alemán, japonés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor `.ninfer` v2 (exclusivo de ignis); no es safetensors, GGUF, EXL3 nativo ni checkpoint de Transformers |
| Tamaño del repositorio | 13,4 GB |
| Fichero del modelo | `qwen3_8_27b_trellis_sc30-v2.ninfer`, 13.379.877.124 bytes (12,46 GiB) |
| Memoria de dispositivo (LM) | 9,83 GB |
| Memoria de dispositivo (LM + DFlash2 + cabeza) | 11,26 GB |
| Memoria de dispositivo (LM + DFlash2 + visión) | 11,56 GB |
| Embedding de tokens | 248.320 × 5.120, 8 bits, 1.350.860.800 bytes, residente en memoria de host |
| sha256 del modelo | `2c4c9ee4d6b25c08da6c2d85840126e73d120564e230f926b6230b5b95ee8b3c` |
| Librería / motor | ignis (Apache 2.0) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, una arquitectura híbrida de 64 capas: 48 capas Gated DeltaNet (atención lineal con estado recurrente) y 16 capas de atención convencional. El artefacto conserva íntegros los parámetros de Gated DeltaNet y las normas, y separa las proyecciones que el artefacto de 32 GB tenía fusionadas (`in_proj_qkv` e `in_proj_z`, `q_proj`/`k_proj`/`v_proj`, `gate_proj` y `up_proj`), cada una con sus propias escalas. Incluye además una torre de visión, una capa MTP (predicción multi-token) y un borrador de decodificación especulativa DFlash2 de 5 capas con una cabeza de 131.072 filas.

No hay entrenamiento nuevo en este repositorio: es un reempaquetado determinista (empaquetar dos veces las mismas fuentes produce el mismo fichero) mediante el conversor `tools/27b-16gb-converter` de ignis, en el commit `cf5e328`. El cuerpo procede del cuantizado EXL3 de turboderp, con cada matriz almacenada tal y como la guarda esa rama (tensores trellis, `suh` y `svh`); el resto de objetos se copian byte a byte del artefacto NVFP4 de 32 GB `gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer`. La innovación técnica destacable es la mezcla de precisión por componente: trellis de 3 bits en el cuerpo, 8 bits en el embedding, NVFP4 en el borrador especulativo y Q4 en su cabeza, lo que permite que el conjunto quepa en 16 GB sin renunciar a la decodificación especulativa ni a la visión.

## Capacidades

- Generación de texto conversacional y continuaciones de código, prosa y chat: es el uso medido por el autor en sus ventanas de evaluación (16 × 4.096 tokens de código, prosa y chat).
- Razonamiento y conocimiento en inglés evaluado mediante un proxy de MMLU-Pro de 281 preguntas (64,77 % de acierto).
- Procesamiento multimodal de entrada: el artefacto incluye la torre de visión del modelo base, que añade 0,30 GB sobre los 11,26 GB del conjunto con borrador.
- Decodificación especulativa integrada mediante el borrador DFlash2 de 5 capas y su cabeza de 131.072 filas, con seguimiento de tokens por ronda del 1,00-1,06 respecto a un control EXL3 de 5,0 bits.
- Predicción multi-token mediante la capa MTP incluida en el contenedor.
- Multilingüismo: las mediciones de perplejidad cubren inglés, italiano, alemán, japonés y chino; la lista oficial de idiomas soportados no está disponible en la información proporcionada.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: los escenarios de evaluación del autor incluyen turnos de agente a 8K, 64K y 128K tokens, pero no se documenta ninguna funcionalidad de agente específica.
- No se documentan modo thinking, audio ni otras capacidades especiales.

## Casos de uso

Todos los casos presuponen la release de ignis que habilita esta clase de tarjeta (issue #339), todavía no publicada; hoy no existe comando de ejecución.

- Inferencia local de un 27B en una GPU de consumo de 16 GB: el contenedor deja el modelo de lenguaje en 9,83 GB y el conjunto con borrador especulativo en 11,26 GB, de modo que un usuario con una RTX 5060 Ti 16 GB puede servir generación de texto sin depender de la nube.
- Asistencia conversacional de contexto largo: las ventanas de evaluación del autor llegan a 128K tokens en turnos de agente, lo que permite mantener historiales de conversación extensos con recuperación de documentos largos en la misma sesión.
- Generación y revisión de código en local: el autor mide perplejidad específicamente sobre código Python (subida del 8,6 % frente a BF16) y sobre prompts de programación para el borrador especulativo, lo que permite usar el modelo en tareas de autocompletado y refactorización asumiendo ese coste de calidad.
- Procesamiento de documentos con imagen: al conservar la torre de visión (11,56 GB en total), el artefacto sirve para extracción y descripción de contenido visual sin cargar un segundo modelo.
- Validación de pipelines de cuantización: el registro de conversión (`*.conversion.json`, 309.495 bytes) incluye los valores K y el error de reconstrucción de cada matriz y el sha256 de cada objeto copiado, lo que lo convierte en material de referencia para comparar esquemas trellis frente a NVFP4 con las mismas ventanas de KLD.
- Investigación sobre decodificación especulativa en cotas de memoria ajustadas: permite medir tokens por ronda de DFlash2 con cuantizaciones agresivas (1,00-1,06 respecto al control de 5,0 bits) en una tarjeta de 16 GB.
- Despliegue en estaciones de trabajo con requisitos estrictos de memoria: el embedding de 1,26 GiB se mantiene en memoria de host, lo que reduce la presión sobre la VRAM en entornos donde la GPU se comparte con otras cargas.

## Benchmarks y rendimiento

Mediciones del autor sobre los pesos de este cuerpo, comparadas con los pesos NVFP4 del artefacto de 32 GB y con el checkpoint BF16. Las ventanas de KLD son 16 × 4.096 tokens de código, prosa y chat.

| Métrica | Este artefacto (trellis 3,00 bpw) | Artefacto NVFP4 (32 GB) | BF16 |
|---|---:|---:|---:|
| KLD media | 0,0340 | 0,0458 | referencia |
| Acuerdo top-1 | 93,88 % | 92,92 % | referencia |
| Perplejidad | 2,733 | 2,744 | 2,690 |
| MMLU-Pro proxy (281 preguntas) | 64,77 % | no disponible | 68,33 % |

Otras mediciones aportadas:

| Métrica | Valor |
|---|---|
| Subida de perplejidad frente a BF16 en código Python | 8,6 % |
| Subida de perplejidad frente a BF16 en otros ocho dominios (prosa, chat, código, inglés, italiano, alemán, japonés, chino) | 1,4-3,7 % |
| Tokens por ronda de DFlash2 frente a control EXL3 5,0 bits (agente a 8K, 64K y 128K, y prompts de código) | 1,00-1,06 del control |
| Error de reconstrucción relativo (norma de Frobenius) | 0,150 de media, 0,338 máximo, 0,0765 en la cabeza de salida |

No se han publicado resultados de MMLU completo, HumanEval, GSM8K ni de otras tareas estándar en la información disponible. Las mediciones se realizaron en un arnés de PyTorch con activaciones BF16, no dentro de ignis.

## Requisitos de hardware

- VRAM estimada: 9,83 GB solo el modelo de lenguaje; 11,26 GB con el borrador DFlash2 y su cabeza; 11,56 GB añadiendo la torre de visión. La caché KV y los espacios de trabajo de los kernels se suman a esas cifras (cuantía no disponible).
- GPU objetivo: clase de 16 GB Blackwell, explícitamente RTX 5060 Ti 16 GB, RTX 5070 Ti y RTX 5080. Los tags del repositorio incluyen `cuda` y `blackwell`.
- Cabe en GPU de consumo: sí, en las tarjetas de 16 GB citadas. No se documenta soporte para tarjetas de menos memoria ni para generaciones anteriores (Ada, Ampere); tratar como no soportado.
- Memoria de host: 1.350.860.800 bytes (~1,26 GiB) para el embedding de tokens, que el binder de ignis mantiene fuera de la GPU.
- Opciones de despliegue: exclusivamente ignis. El fichero no es un checkpoint de Transformers, safetensors, GGUF ni EXL3, por lo que no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Estado de ejecución: `inference: false`; no hay comando para ejecutarlo todavía (issue `gpillon/ignis#339`).
- Latencia y throughput: no disponibles en términos absolutos. La única referencia relativa es el rendimiento del borrador DFlash2, 1,00-1,06 tokens por ronda frente a un control EXL3 de 5,0 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Memoria de dispositivo | MMLU-Pro proxy | Licencia |
|---|---|---|---|---|---|---|
| Este artefacto (trellis 3,00 bpw) | 27B | no disponible | `.ninfer` v2 (ignis) | 9,83 GB LM / 11,26 GB con borrador / 11,56 GB con visión | 64,77 % | Apache 2.0 |
| turboderp/Qwen3.8-27B-exl3 (`SC_3.00bpw_H4`) | 27B | no disponible | EXL3 nativo | no disponible | mismos pesos que este cuerpo | Apache 2.0 |
| gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer | 27B | no disponible | `.ninfer` v2, clase 32 GB | no disponible (artefacto de 32 GB) | no disponible | Apache 2.0 |
| Qwen/Qwen3.8-27B (BF16) | 27B | no disponible | safetensors | no disponible | 68,33 % | Apache 2.0 |

Frente al cuantizado EXL3 de origen, este artefacto no cambia los pesos: la diferencia es el empaquetado, que separa proyecciones fusionadas y añade el embedding en 8 bits, la torre de visión, la capa MTP y el borrador DFlash2 en un único contenedor. Frente al artefacto NVFP4 de 32 GB, sacrifica algo de fidelidad (KLD 0,0340 frente a 0,0458, acuerdo top-1 93,88 % frente a 92,92 %) a cambio de reducir el peso del cuerpo de 3,00 bits por peso y bajar el requisito de VRAM a la clase de 16 GB. Frente a BF16, la pérdida medida es de 3,56 puntos en el proxy de MMLU-Pro y del 8,6 % de perplejidad en Python.

## Limitaciones y advertencias

- No es ejecutable todavía: la model card indica explícitamente que no hay comando para ejecutarlo y que depende de una release futura de ignis (issue #339).
- Formato propietario: el contenedor `.ninfer` v2 solo lo lee ignis. No hay ruta de conversión a safetensors, GGUF ni EXL3 documentada en la información disponible, lo que impide usarlo con el resto del ecosistema.
- Dependencia de hardware concreta: los tags apuntan a CUDA y Blackwell; no se documenta funcionamiento en GPU de menos de 16 GB ni en generaciones anteriores.
- Pérdida de calidad medible: 3,56 puntos menos en el proxy de MMLU-Pro (281 preguntas, muestra pequeña), 8,6 % más de perplejidad en código Python y hasta 0,338 de error de reconstrucción relativo en la peor matriz.
- El proxy de MMLU-Pro emplea solo 281 preguntas; su intervalo de confianza es amplio y no equivale al benchmark completo.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de veracidad; debe asumirse el comportamiento del modelo base, no caracterizado en esta información.
- Idiomas: la lista oficial de idiomas soportados no está disponible; las únicas evidencias son mediciones de perplejidad en nueve dominios.
- Sesgos: no se documenta ninguna evaluación de sesgo ni de seguridad para este artefacto ni para el modelo base en la información proporcionada.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Licencia: Apache 2.0, igual que el modelo base y el cuantizado de turboderp; ExLlamaV3 es MIT e ignis es Apache 2.0, por lo que no se documentan restricciones adicionales para uso comercial más allá de las de Apache 2.0.
- Cifras de memoria: las cantidades de 9,83 / 11,26 / 11,56 GB provienen del binder de ignis y excluyen caché KV y espacios de trabajo, por lo que el consumo real en producción será superior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gpillon/Qwen3.8-27B-trellis-3bpw-ignis
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizado EXL3 de origen (turboderp, rama `SC_3.00bpw_H4`): https://huggingface.co/turboderp/Qwen3.8-27B-exl3
- Artefacto NVFP4 de 32 GB del mismo autor: https://huggingface.co/gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer
- Motor ignis: https://github.com/gpillon/ignis
- Issue de soporte para la clase de 16 GB: https://github.com/gpillon/ignis/issues/339
- Especificación del artefacto de 16 GB: https://github.com/gpillon/ignis/blob/main/docs/specs/27b-16gb/01-the-16gb-artifact.md
- Hallazgo con las mediciones (2026-10-21): https://github.com/gpillon/ignis/blob/main/docs/findings/2026-10-21-exl3-3bpw-27b-on-our-text-and-dflash2.md
- Conversor utilizado: https://github.com/gpillon/ignis/tree/main/tools/27b-16gb-converter
