# Hero422/qwen3.8-27b-exl3-turboderp-ladder

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una colección de cuantizaciones EXL3 del modelo Qwen3.8-27B, publicadas por el usuario Hero422 para el "radiance quantization challenge". El autor parte de la conversión EXL3 de turboderp (`turboderp/Qwen3.8-27B-exl3`) y la reempaqueta en contenedores `.rad` compatibles con la herramienta radiance, sin recuantizar los tensores originales: los lee bit a bit tal como fueron publicados.

La aportación técnica concreta es la cuantización del token embedding, que turboderp almacena en bf16 sin cuantizar (248320 × 5120, unos 2,54 GB, aproximadamente 0,76 bpw del modelo). Hero422 lo sustituye por una cuantización con rotación Walsh-Hadamard de 128 puntos, codebook Lloyd-Max y escalas bf16 por grupo de 128 valores, lo que reduce el coste del embedding a unos 0,20 bpw con 4 bits.

El repositorio incluye 16 variantes que cubren desde 1,40 hasta 6,00 bpw, con dos ramas (self-calibrated y plain), lo que permite elegir el compromiso entre tamaño en disco y divergencia KL frente al modelo bf16 de referencia. Es relevante para quien necesite ejecutar un modelo de 27B en hardware limitado y quiera medir con precisión el coste de cada nivel de compresión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.8-27B; plugin `qwen35_exl3` en radiance) |
| Parámetros totales | 26.895.998.464 (según el denominador usado para el bpw real) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 262.144 tokens (valor usado en el ejemplo de ejecución con `--max-model-len`) |
| Tipos de cuantización | EXL3 con trellis y codebooks; variantes de 1,40 a 6,00 bpw; embedding con Lloyd-Max de 3 a 6 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor radiance), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de aproximadamente 26,9 mil millones de parámetros. Sobre él, turboderp aplicó cuantización EXL3 (trellis-coded quantization con codebooks y escalas), y Hero422 ha conservado esos tensores sin modificarlos, incluyendo la cabeza de salida `output.weight` a la precisión de su rama. La única intervención propia es sobre `token_embd.weight`.

Para el embedding, cada fila se divide en bloques de 128 columnas y cada bloque se rota con una transformada de Walsh-Hadamard de 128 puntos (`transform=fwht128`) para dispersar los valores atípicos antes de cuantizar. Los valores rotados se codifican contra un codebook Lloyd-Max de 2^B niveles, ajustado a los propios pesos del embedding (cada 160 filas) y normalizado por grupo según su magnitud máxima. Cada grupo de 128 valores recibe una escala bf16 calculada por búsqueda de mínimo error cuadrático (`rule=search`), no por absmax. El coste es de B + 0,125 bits por valor; con 4 bits el embedding baja a ≈0,20 bpw frente a los 0,76 bpw en bf16. La decodificación se hace en tiempo de búsqueda mediante el kernel `embed_tq` del plugin `exl3dense`, de modo que la tabla bf16 nunca existe en memoria.

No hay información sobre el dataset de entrenamiento original de Qwen3.8-27B, ni sobre fases de RLHF o DPO, en la documentación proporcionada. La calibración de los codebooks del embedding no usa texto: se ajusta a los propios pesos. La selección de anchos de bits se hizo con un barrido sobre un subconjunto de 102.000 posiciones del corpus público del challenge (52 documentos, uno por fuente, truncados a 4096 tokens), midiendo KLD contra el golden bf16.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen3.8-27B; las capacidades concretas del modelo base no se detallan en la información disponible.
- Ejecución con ventana de contexto de hasta 262.144 tokens según el ejemplo de la model card.
- Cuantización seleccionable por archivo, con 16 variantes entre 1,40 y 6,00 bpw para ajustar calidad y memoria.
- Dos ramas de calibración (self-calibrated y plain) que permiten comparar el efecto de la calibración a igual bpw nominal.
- Soporte de tool calling, agentes, visión o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de cuantizaciones: usar la escalera completa de 16 archivos para trazar la curva KLD frente a bpw real y decidir el punto de operación óptimo para un despliegue concreto.
- Despliegue en GPU de consumo: la variante de 4,00 bpw ocupa 12,75 GiB y permite ejecutar un modelo de 27B en tarjetas con 16-24 GB de VRAM, con un KLD de 0,00948 frente al bf16.
- Servicio con contexto largo: la variante de 6,00 bpw (18,86 GiB) con `--max-model-len 262144` sirve para tareas de análisis de documentos extensos donde la fidelidad al modelo original es prioritaria (KLD 0,00114).
- Investigación en cuantización: el repositorio sirve como referencia reproducible para comparar técnicas de cuantización de embeddings (rotación Hadamard + Lloyd-Max) frente a mantener el embedding en bf16.
- Entornos con memoria muy restringida: la variante de 1,40 bpw (4,94 GiB, KLD 0,57490) permite hacer pruebas funcionales rápidas en GPU de gama baja, asumiendo degradación notable.
- Comparación de ramas de calibración: a 2,00 bpw, comparar la rama SC (KLD 0,14801) con la plain (KLD 0,13787) para evaluar si la autocalibración aporta ventaja en este rango.

## Benchmarks y rendimiento

La model card solo publica divergencia KL media frente al golden bf16 sobre el corpus público del challenge (1,17 millones de posiciones puntuadas, KV en bf16, trazas largas sin truncar). No hay resultados de MMLU, HumanEval, GSM8K ni similares.

| Archivo | Rama | Embedding | GiB | bpw real | KLD público |
|---|---|---|---|---|---|
| 1.40bpw | SC | 3-bit Lloyd | 4,94 | 1,578 | 0,57490 |
| 1.60bpw | SC | 3-bit Lloyd | 5,51 | 1,759 | 0,38021 |
| 1.80bpw | SC | 3-bit Lloyd | 6,07 | 1,940 | 0,24656 |
| 2.00bpw | SC | 3-bit Lloyd | 6,64 | 2,121 | 0,14801 |
| 2.00bpw-plain | plain | 3-bit Lloyd | 7,09 | 2,263 | 0,13787 |
| 2.20bpw | SC | 3-bit Lloyd | 7,21 | 2,302 | 0,09676 |
| 2.50bpw-plain | plain | 3-bit Lloyd | 8,50 | 2,715 | 0,07696 |
| 3.00bpw | SC | 4-bit Lloyd | 9,77 | 3,120 | 0,03262 |
| 3.00bpw-plain | plain | 4-bit Lloyd | 10,07 | 3,215 | 0,03234 |
| 3.50bpw-plain | plain | 4-bit Lloyd | 11,48 | 3,666 | 0,01850 |
| 4.00bpw | SC | 4-bit Lloyd | 12,75 | 4,072 | 0,00948 |
| 4.00bpw-plain | plain | 4-bit Lloyd | 12,90 | 4,119 | 0,00864 |
| 5.00bpw | SC | 5-bit Lloyd | 15,88 | 5,071 | 0,00277 |
| 5.00bpw-plain | plain | 5-bit Lloyd | 15,88 | 5,071 | 0,00305 |
| 6.00bpw | SC | 6-bit Lloyd | 18,86 | 6,023 | 0,00114 |
| 6.00bpw-plain | plain | 6-bit Lloyd | 18,86 | 6,023 | 0,00125 |

El autor documenta además el coste medido del embedding frente a bf16: 6 bits es prácticamente gratis, 4 bits añade ≈+0,6 % de KLD a 2,00 bpw y ≈+2 % a 4,00 bpw, y 2 bits empeora claramente (+14 % y +54 % respectivamente).

## Requisitos de hardware

- VRAM estimada de pesos: entre 4,94 GiB (1,40 bpw) y 18,86 GiB (6,00 bpw), según la tabla de la model card.
- A la VRAM de pesos hay que sumar la caché KV en bf16; con 262.144 tokens de contexto el consumo adicional es considerable y no se cuantifica en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, las variantes de 4,00 bpw (12,75 GiB) encajan en tarjetas de 16-24 GB (RTX 4090, RTX 3090, A5000); las de 5,00-6,00 bpw (15,88-18,86 GiB) requieren 24 GB o más (RTX 4090, A6000, L40S); las de 1,40-2,50 bpw caben en 8-12 GB.
- Cabe en GPU de consumo: sí, al menos las variantes de hasta 4,00 bpw en tarjetas de 16 GB o más, siempre que el contexto usado deje espacio para la caché KV.
- Despliegue: exclusivamente mediante radiance 1.13.0 o superior con los plugins `qc-exl3-ladder` (arquitectura `qwen35_exl3`, kernels `exl3_dense` / `exl3r4d`, gather `embed_tq`). No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hero422/qwen3.8-27b-exl3-turboderp-ladder | 26,9 B | 262.144 | `.rad` (radiance) | Apache 2.0 | 16 variantes de 1,40 a 6,00 bpw; embedding cuantizado |
| turboderp/Qwen3.8-27B-exl3 | 26,9 B | no disponible | EXL3 (exl3) | Apache 2.0 (heredada) | Modelo base de esta escalera; embedding en bf16 (≈0,76 bpw) |
| Qwen/Qwen3.8-27B | 26,9 B | no disponible | safetensors (bf16) | Apache 2.0 | Modelo original sin cuantizar; referencia de calidad |

La diferencia medible entre este repositorio y la conversión de turboderp es el coste del embedding: aquí baja de ≈0,76 bpw a ≈0,20 bpw con 4 bits, con un incremento de KLD de ≈+0,6 % a 2,00 bpw y ≈+2 % a 4,00 bpw. No se dispone de comparaciones con otras familias de modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y fue creado en octubre de 2026; no hay evidencia de validación por terceros.
- Requiere una versión muy concreta de radiance (1.13.0) más plugins alojados en una pull request de Codeberg, lo que introduce riesgo de mantenimiento y de compatibilidad futura.
- El formato `.rad` no es interoperable con el ecosistema habitual (llama.cpp, vLLM, transformers); la migración a otro runtime exigiría reconvertir desde el modelo base.
- La cuantización a 1,40-2,00 bpw presenta KLD de 0,14 a 0,57, lo que implica degradación apreciable de la calidad; no se recomienda para producción sin evaluación específica de la tarea.
- El embedding está cuantizado con codebooks ajustados a los propios pesos, sin datos de texto; el autor reconoce que la elección de anchos de bits se hizo "a mano" a partir de un barrido limitado (102.000 posiciones).
- Los valores de KLD se midieron sobre el corpus público del challenge, no sobre benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K), por lo que no hay garantía de que la degradación se traduzca de forma lineal en tareas reales.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación específicos; deben evaluarse sobre el modelo base Qwen3.8-27B.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar las condiciones de la conversión intermedia de turboderp antes de un uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hero422/qwen3.8-27b-exl3-turboderp-ladder
- Modelo base de la cuantización: https://huggingface.co/turboderp/Qwen3.8-27B-exl3
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Plugins de radiance (`qc-exl3-ladder`): https://codeberg.org/StillDeadcode/radiance/pulls/292
