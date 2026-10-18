# bpmatt/Qwen3.8-2B-Distill-Q4_0-ARM-GGUF

## Resumen

`bpmatt/Qwen3.8-2B-Distill-Q4_0-ARM-GGUF` es una cuantización GGUF en Q4_0 puro del modelo `empero-ai/Qwen3.8-2B-Distill`, publicado por el desarrollador independiente bpmatt. No es un modelo nuevo: es el mismo modelo base con todos los pesos reformateados a Q4_0 mediante `llama-quantize --pure` a partir del GGUF BF16 del editor original. El objetivo es claro y muy concreto: maximizar la velocidad de inferencia en CPU ARM (móviles Android con extensiones i8mm o dotprod) a cambio de una pérdida de precisión medible frente a Q4_K_M.

El modelo base procede de Empero y consiste en una destilación de parámetros completos sobre `Qwen/Qwen3.5-2B` de Alibaba, con 1.942.653.248 parámetros (≈1,94 B). Esta cuantización ocupa un único fichero de 1.105.627.520 bytes (1,11 GB, un 16 % menos que el Q4_K_M del editor) y está pensada para ejecutarse con llama.cpp en el propio dispositivo, sin GPU y sin servidor.

Su relevancia es práctica más que algorítmica: documenta con mediciones reproducibles (llama-bench, 3 repeticiones, hilos fijados a los núcleos grandes) que Q4_0 con repacking supera a Q4_K_M en un Snapdragon SM7750, con 1,59x más velocidad de lectura de prompt y 1,17x más velocidad de generación, y cuantifica el coste en calidad. Es material útil para quien despliegue asistentes de voz o chat offline en Android y necesite decidir entre ambos formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen/Qwen3.5-2B (el autor no detalla la arquitectura en la model card) |
| Parametros totales | 1.942.653.248 (≈1,94 B), dato de safetensors del modelo base |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 puro en todas las matrices, incluida la tabla de embeddings (que también actúa como capa de salida); fichero único GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (fichero LICENSE de Qwen3.5-2B; NOTICE describe los cambios) |
| Formato de pesos | GGUF para llama.cpp, 1.105.627.520 bytes (1,11 GB) |
| Modelo base | empero-ai/Qwen3.8-2B-Distill |
| GGUF de origen | Qwen3.8-2B-BF16.gguf de empero-ai/Qwen3.8-2B-Distill-GGUF, commit f4f73582d0b149595450c719b9a7521a03894f9c, sha256 44763f3d…ac48 |
| Herramienta de cuantizacion | llama-quantize --pure (llama.cpp) |
| Pipeline | text-generation (conversational) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-17 |

## Arquitectura y entrenamiento

El autor no entrena nada: solo cambia el formato de los pesos. El modelo subyacente es una destilación de parámetros completos de Empero sobre `Qwen/Qwen3.5-2B`, y esta ficha no dispone de detalles sobre la composición del dataset de destilación, el número de tokens, ni si hubo RLHF o DPO; esos datos corresponden a la model card del editor original y no se incluyen en la información disponible. La única modificación documentada es `general.file_type`: tokenizer, chat template y el resto de metadatos son idénticos al GGUF BF16 de origen.

La innovación relevante está en el formato de cuantización. Q4_0 es el bloque de 4 bits más simple de llama.cpp: 32 pesos y una única escala. El backend de CPU de llama.cpp **reempaqueta** los pesos al cargar el modelo, reorganizándolos en bloques intercalados 4x8 para que las instrucciones matriciales de los núcleos ARM actuales (SMMLA de la extensión i8mm, SDOT de dotprod) procesen varias filas a la vez. En el móvil de prueba, el mismo fichero Q4_0 pasa de 47,3 t/s a 109,9 t/s en lectura de prompt con el repacking activado (2,3x), mientras que la generación no cambia (17,1 frente a 16,95 t/s), porque generar un token es un producto matriz-vector. Q4_K_M también se reempaqueta en builds recientes, pero mezcla superbloques Q4_K (subescalas y mínimos de 6 bits empaquetados) con tensores Q6_K, lo que supone un 19 % más de datos que leer por token generado.

El precio de `--pure` es doble: la copia reempaquetada vive en memoria normal de la aplicación (ver requisitos de hardware) y la fidelidad respecto a BF16 cae aproximadamente a la mitad, según las métricas de divergencia KL que reporta el autor.

## Capacidades

- Generación de texto conversacional en inglés, con chat template idéntico al del modelo base Qwen3.5-2B.
- Razonamiento y respuesta a instrucciones heredados de la destilación de Empero (el alcance exacto no se detalla en la información disponible).
- Inferencia totalmente offline en el dispositivo, sin conexión de red ni servidor.
- Lectura de prompts rápida en CPU ARM: 110-147 t/s según núcleos asignados, lo que favorece turnos con contexto precargado.
- Compatibilidad con `llama-server` (el autor menciona su uso con prompt de sistema ya cacheado) y con `llama-bench`.
- Ejecución con backend OpenCL en GPU Adreno 722 vía `-ngl 99` (211,5 t/s de prompt, 15,1 t/s de generación).
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- **Asistente de voz en Android:** es el uso real del autor. El modelo corre en CPU con llama.cpp, sin OpenMP, sobre un Snapdragon SM7750; los 110 t/s de lectura de prompt permiten preprocesar la transcripción ASR y el prompt de sistema casi instantáneamente antes de generar la respuesta.
- **Chat offline con privacidad estricta:** al ser un fichero de 1,11 GB que se ejecuta íntegramente en el dispositivo, ningún texto del usuario sale del teléfono. Adecuado para aplicaciones de salud, legal o diario personal donde no se admite backend remoto.
- **Aplicaciones Android con presupuesto de memoria ajustado:** con un pico de RSS de 2,17 GB (frente a 2,56 GB de Q4_K_M), cabe en móviles de 8-12 GB de RAM dejando margen para el resto del sistema.
- **Precarga de contexto en asistentes de turnos cortos:** la ventaja de Q4_0 se concentra en la fase de prompt (1,59x). En un asistente con prompt de sistema largo cacheado en `llama-server`, el coste por turno se reduce de forma directa.
- **Prototipado y evaluación de cuantizaciones en ARM:** sirve como referencia reproducible para comparar Q4_0 frente a Q4_K_M con `llama-bench`, KL divergence y perplejidad sobre wikitext-2 en hardware móvil real.
- **Dispositivos embebidos y kioscos sin GPU:** cualquier equipo ARM con i8mm o dotprod (Raspberry Pi reciente, placas Industriales, TV boxes) puede ejecutar el GGUF con llama.cpp en CPU, aunque las cifras publicadas corresponden solo al Snapdragon citado.
- **Generación de texto en inglés de baja latencia y calidad moderada:** resúmenes cortos, respuestas de FAQ, clasificación ligera o reescritura, donde el +8,1 % de perplejidad frente a BF16 es aceptable.

## Benchmarks y rendimiento

El autor no publica MMLU, HumanEval ni GSM8K. Las métricas disponibles son de fidelidad de cuantización (test de divergencia KL de llama.cpp sobre wikitext-2) y de velocidad en dispositivo.

| Metrica | Q4_0 (este repo) | Q4_K_M (editor) |
|---|---:|---:|
| Tamano del fichero | 1.105.627.520 B (1,11 GB) | 1.312.164.224 B (1,31 GB) |
| Divergencia KL media vs BF16 (menor es mejor) | 0,086 | 0,041 |
| Mismo token mas probable que BF16 | 84,7 % | 90,1 % |
| Perplejidad vs BF16 (wikitext-2) | +8,1 % | +3,6 % |
| Prompt pp256, CPU del movil (t/s) | 110 (104,8-115,7) | 69 (69,0-69,5) |
| Generacion tg64, CPU del movil (t/s) | 17,7 (17,35-18,06) | 15,1 (15,10-15,12) |
| RSS pico en llama-bench | 2,17 GB | 2,56 GB |
| Ratio Q4_0 / Q4_K_M | 1,59x prompt, 1,17x generacion | referencia |

Mediciones adicionales del mismo fichero Q4_0 en el Nothing Phone (4a) Pro, llama.cpp b11671, CPU sin OpenMP:

| Configuracion | Prompt (t/s) | Generacion (t/s) |
|---|---:|---:|
| 4 nucleos grandes (cpu 3-6), -t 4 | 127,6 ± 1,6 | 18,76 ± 0,31 |
| 5 nucleos grandes (3-7), -t 5 | 147,5 ± 7,1 | 18,81 ± 1,03 |
| 4 nucleos grandes + KV cache q8_0 | 130,1 ± 0,4 | 19,55 ± 0,13 |
| 8 hilos, todos los nucleos (incluye little) | 60,5 ± 10,0 | 13,57 ± 0,49 |
| Misma build con OpenMP | 120,1 ± 1,1 | 8,0 ± 0,3 |
| Repacking on / off (--no-repack) | 109,9 / 47,3 | 17,07 / 16,95 |
| GPU OpenCL, Adreno 722, -ngl 99 | 211,5 ± 0,6 | 15,1 ± 0,5 |

## Requisitos de hardware

- **VRAM/RAM:** el fichero pesa 1,11 GB, pero el pico de RSS medido en llama-bench es de 2,17 GB, porque el repacking mantiene una copia reordenada en memoria normal de la aplicación. Prevé al menos 2,5-3 GB libres para margen de contexto y KV cache.
- **Hardware de referencia:** Nothing Phone (4a) Pro, Snapdragon SM7750 (1x Cortex-A720 a 2,8 GHz, 4x A720 a 2,4 GHz, 3x A520 a 1,84 GHz), 12 GB de RAM, Android. Build de llama.cpp b11671 (commit ba3c05f) compilada en el propio teléfono con GCC 15.2, `-DGGML_NATIVE=ON` (i8mm + dotprod + bf16) y `-DGGML_OPENMP=OFF`.
- **Requisito clave en ARM:** el rendimiento depende de tener i8mm o dotprod. Sin repacking (o sin esas extensiones) la lectura de prompt cae a 47,3 t/s, es decir, se pierde la ventaja frente a Q4_K_M.
- **GPU:** solo hay datos de OpenCL sobre Adreno 722 con `-ngl 99` (211,5 t/s de prompt, 15,1 t/s de generación). Con GPU la generación no mejora, así que el autor usa CPU.
- **¿Cabe en GPU de consumo?** Sí por tamaño (1,11 GB), pero no hay mediciones publicadas en RTX, A100, H100 ni similares para este fichero.
- **Opciones de despliegue:** llama.cpp (llama-bench, llama-server) es lo único documentado. vLLM, TGI y Ollama no están verificados en la información disponible; Ollama podría importar el GGUF por su soporte genérico, pero sin datos publicados.
- **Latencia y throughput:** 110-147 t/s de prompt y 17-19 t/s de generación en el Snapdragon citado; 8 hilos con núcleos pequeños empeora ambos valores (60,5 / 13,57 t/s).
- **Aviso sobre OpenMP:** activarlo baja la generación de 17,7 a 8,0 t/s en este dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Calidad vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Q4_0 ARM (este repo) | 1,94 B | no disponible | GGUF Q4_0, 1,11 GB | KL 0,086; perplejidad +8,1 % | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen3.8-2B-Distill Q4_K_M (editor) | 1,94 B | no disponible | GGUF Q4_K_M, 1,31 GB | KL 0,041; perplejidad +3,6 % | Apache-2.0 | HuggingFace (repo del editor) |
| Qwen3.8-2B-Distill BF16 (origen) | 1,94 B | no disponible | GGUF BF16 | referencia | Apache-2.0 | HuggingFace |
| Qwen3.5-2B (Alibaba) | ≈2 B | no disponible | safetensors / GGUF | modelo base de la destilacion | no disponible en la informacion | HuggingFace |

La comparación relevante es interna al propio modelo: Q4_0 gana en velocidad y tamaño en ARM y pierde en fidelidad frente a Q4_K_M. No se han publicado comparaciones con otros modelos de 2 B en la información disponible.

## Limitaciones y advertencias

- **Solo inglés.** El campo `language` del repo declara únicamente `en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- **Pérdida de calidad cuantificable:** divergencia KL media de 0,086 frente a 0,041 de Q4_K_M, y solo un 84,7 % de coincidencia en el token más probable respecto a BF16. Para tareas sensibles a la precisión (código, matemáticas, extracción de datos) Q4_K_M es preferible.
- **Perplejidad +8,1 % sobre BF16 en wikitext-2**, más del doble de degradación que Q4_K_M (+3,6 %).
- **Dependencia del repacking:** sin él, o en ARM sin i8mm/dotprod, la ventaja de velocidad desaparece (47,3 t/s de prompt frente a 109,9).
- **Memoria real superior al tamaño del fichero:** 2,17 GB de RSS por la copia reempaquetada; en dispositivos con poca RAM puede provocar cierres de la aplicación.
- **Contexto máximo no documentado:** no se indica la ventana soportada ni cómo se comporta con contextos largos en Q4_0.
- **Madurez nula como artefacto comunitario:** 0 descargas y 0 likes en el momento de la consulta, publicado y actualizado el mismo día. No hay validación independiente de las mediciones.
- **Sin garantía del cuantizador:** el repo no está afiliado a Empero ni a Alibaba; los méritos del modelo corresponden a ellos y los defectos de la cuantización, a bpmatt.
- **Riesgo de alucinación:** no hay datos específicos publicados para esta cuantización; es de esperar un riesgo igual o algo superior al del modelo base, pero no está medido.
- **Licencia:** Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar LICENSE y NOTICE del repo antes de redistribuir.
- **Sin datos de sesgo, toxicidad ni evaluaciones de seguridad** en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bpmatt/Qwen3.8-2B-Distill-Q4_0-ARM-GGUF
- Modelo base (Empero): https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- GGUF BF16 de origen: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill-GGUF
- Modelo Qwen sobre el que se destila: https://huggingface.co/Qwen/Qwen3.5-2B
- Sitio del editor del modelo base: https://empero.org
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas de ayuda de YouTube, sin relación).
