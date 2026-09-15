# jmarceno/Qwen3.8-27B-DFlash2-GGUF

## Resumen

Qwen3.8-27B-DFlash2-GGUF es la conversión a formato GGUF del drafter DFlash 2 (difusión por bloques) publicado por incoai como `incoai/Qwen3.8-27B-DFlash2`, preparada por el usuario jmarceno para el modo de decodificación especulativa `draft-dflash` de llama.cpp. No es un modelo de lenguaje autónomo: es un modelo borrador que propone bloques completos de tokens en una sola pasada y deja que un modelo objetivo Qwen3.8-27B los verifique. Se distribuye con licencia Apache 2.0.

El interés técnico está en su enfoque de borrador: en lugar de generar tokens de uno en uno, el drafter DFlash 2 produce un bloque de 8 posiciones (un ancla más 7 tokens borrador) por pasada, apoyándose en los embeddings, la cabeza de salida y los estados ocultos de cinco capas del modelo objetivo. El resultado medido por el autor es una decodificación entre un 24 % y un 34 % más rápida que la cabeza MTP integrada en el objetivo a contextos largos, pese a tener una tasa de aceptación bruta inferior, porque sustituye varios pasos secuenciales de MTP por una única pasada paralela.

El repositorio incluye tres cuantizaciones GGUF (Q4_K_M recomendada, Q8_0 y F16) con metadatos de ventana deslizante de 2048 tokens, más el script de conversión. El modelo tiene unos 1,92 mil millones de parámetros y ocupa entre 1,09 GiB y 3,86 GiB según la cuantización, lo que lo convierte en un complemento ligero desplegable incluso en GPUs de consumo junto a un objetivo de 27B cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de difusión por bloques (DFlash 2) para decodificación especulativa; bloque de tamaño 8 (ancla + 7 tokens); reutiliza embeddings y lm-head del objetivo y estados ocultos de 5 capas del objetivo; metadatos de ventana deslizante de 2048 tokens (`-swa`) |
| Parametros totales | 1.924.404.480 (~1,92 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana deslizante propia de 2048 tokens (su KV cache queda limitada por esa ventana); el contexto efectivo de generación lo fija el modelo objetivo (el ejemplo de uso emplea `-c 131072`) |
| Tipos de cuantizacion | GGUF Q4_K_M (recomendada), Q8_0 y F16; pesos de normalización y kernels convolucionales `*_base` de dos tomas almacenados en F32 |
| Idiomas soportados | No disponible (hereda el tokenizador y las capacidades lingüísticas del modelo objetivo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, arquitectura `dflash`) |

## Arquitectura y entrenamiento

El drafter pertenece a la familia DFlash 2 y se basa en un esquema de difusión por bloques aplicado a decodificación especulativa. En lugar de predecir un único token siguiente, genera en una sola pasada paralela un bloque de 8 posiciones (el ancla más 7 tokens borrador, coherente con el parámetro `--spec-draft-n-max 7`). No dispone de embeddings de tokens ni de proyección de salida propios: consume los embeddings y la lm-head del modelo objetivo y los estados ocultos extraídos de cinco capas de ese mismo objetivo. Esto implica que solo puede ejecutarse junto a un objetivo compatible con el mismo tokenizador, y que su `mask_token_id` está fijado en 248070 según la configuración del drafter.

La decodificación se mantiene sin pérdida respecto al objetivo: en modo greedy la salida coincide exactamente con la del objetivo y, al muestrear, se preserva la distribución del objetivo; el drafter únicamente reduce el número de pasadas forward necesarias. La conversión a GGUF se realizó leyendo directamente los safetensors BF16 originales (sin ida y vuelta de cuantización/descuantización) mediante `convert_dflash2_to_gguf.py`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información no está disponible.

## Capacidades

- Generación de texto especulativa: actúa exclusivamente como modelo borrador dentro de un pipeline de decodificación especulativa con un objetivo Qwen3.8-27B.
- Borrado por bloques: propone bloques de 8 posiciones (ancla + 7 tokens) en una única pasada paralela.
- Verificación sin pérdida: la salida greedy reproduce exactamente la del objetivo; con muestreo se conserva la distribución del objetivo.
- Integración con llama.cpp: soportado mediante el tipo de especulación `draft-dflash` (arquitectura `dflash` y selector en `src/models/dflash.cpp`).
- Reutilización de componentes del objetivo: emplea embeddings y proyección de salida del modelo objetivo, más estados ocultos de cinco capas de este.
- Gestión de memoria predecible: su KV cache está acotada por la ventana deslizante de 2048 tokens, por lo que añade solo decenas de MiB con independencia de la longitud de contexto del objetivo.
- No dispone de capacidades propias de tool calling, agentes, visión, audio ni modo thinking: estas dependen íntegramente del modelo objetivo.
- Idiomas soportados: no disponible en la información; quedan determinados por el tokenizador y el modelo objetivo.

## Casos de uso

- Aceleración de inferencia local de un Qwen3.8-27B: desplegar el objetivo en IQ4_XS junto al drafter Q4_K_M permite pasar de 20,8–24,3 tok/s a 28,5 tok/s a ~58K de contexto en un equipo con 2× RTX 3060 12 GB, según las mediciones del autor.
- Servicio de chat de contexto largo: con 131.072 tokens de reserva y `--parallel 1`, el drafter aporta 36,3 tok/s a ~58K y 30,7 tok/s a ~90K, útil para asistentes que arrastran conversaciones extensas o documentos largos.
- Inferencia en GPUs de consumo con VRAM ajustada: el drafter ocupa 1,09 GiB en Q4_K_M y puede asignarse a una GPU concreta con `--spec-draft-device CUDA1`, dejando sitio para el objetivo.
- Decodificación de código y matemáticas de un solo flujo: los datos del modelo upstream reportan longitudes de aceptación de 5,46 en GSM8K, 5,28 en MATH-500, 4,39 en HumanEval, 4,79 en MBPP y 4,10 en MT-Bench sobre H200 con SGLang.
- Sustitución de la cabeza MTP integrada: cuando el objetivo ya ofrece MTP de 7 tokens, este drafter rinde 28,5 frente a 20,8–24,3 tok/s a ~58K, y 23,0 tok/s a ~120K donde MTP no llega.
- Reempaquetado de pesos a otros formatos: el GGUF F16 de 3,86 GiB sirve como punto de partida recomendado para recuantizar, en lugar de partir de los safetensors originales.
- Evaluación comparativa de estrategias de decodificación especulativa: permite medir aceptación (28–60 % según prompt) y aceptados medios por paso (4,38–4,45) frente a alternativas secuenciales en el mismo hardware.
- Experimentación en investigación sobre difusión por bloques: al ser un drafter independiente y offloadable, facilita aislar el efecto del borrador sin modificar el modelo objetivo.

## Benchmarks y rendimiento

Mediciones del autor: 2× RTX 3060 12 GB, objetivo Qwen3.8-27B en IQ4_XS, reserva de 131.072 tokens, KV del objetivo en `q4_0/q4_0`, `-b 256 -ub 128`, `--parallel 1`, thinking activado.

| Contexto ejercitado | Decodificación | Aceptación | Aceptados medios/paso | Prefill |
|---|---|---|---|---|
| ~58K | 36,3 tok/s | 49,7 % | 4,45 | 447 tok/s |
| ~90K | 30,7 tok/s | 48,8 % | 4,38 | 341 tok/s |

Comparativa A/B con el mismo prompt frente a la cabeza MTP incorporada del objetivo (7 tokens):

| Motor | ~58K | ~90K | ~120K |
|---|---|---|---|
| MTP incorporado | 20,8–24,3 tok/s | 17,6 tok/s | n/a |
| Este drafter, Q4_K_M | 28,5 tok/s | 25,9 tok/s | 23,0 tok/s |
| Este drafter, Q8_0 | 26,5 tok/s | 23,6 tok/s | n/a |

El drafter resulta entre un 24 % y un 34 % más rápido que MTP a profundidad, aunque su aceptación bruta sea menor (36–50 % frente a 40–51 %), porque una pasada de borrado paralela reemplaza a varios pasos MTP secuenciales (por ejemplo, 149 ms frente a 192 ms a ~90K). La aceptación observada oscila aproximadamente entre el 28 % y el 60 % según el prompt.

Longitudes de aceptación reportadas por la model card upstream (H200 + SGLang): 5,46 en GSM8K, 5,28 en MATH-500, 4,39 en HumanEval, 4,79 en MBPP y 4,10 en MT-Bench. No se han publicado resultados de MMLU ni de otras suites en la información disponible.

## Requisitos de hardware

- VRAM del drafter: 1,09 GiB en Q4_K_M, 1,96 GiB en Q8_0 y 3,86 GiB en F16.
- KV cache del drafter: limitada por su ventana deslizante de 2048 tokens, por lo que añade solo decenas de MiB sea cual sea el contexto del objetivo. Puede cuantizarse también en `q4_0` (`--spec-draft-type-k q4_0 --spec-draft-type-v q4_0`).
- Hardware validado: 2× RTX 3060 de 12 GB con el objetivo Qwen3.8-27B en IQ4_XS y KV del objetivo en `q4_0/q4_0`. Con KV en `f16/f16` (~8 GiB a 131K) el conjunto no cabe en tarjetas de 12 GB.
- Reparto entre GPUs: el drafter es offloadable con `--spec-draft-device`; si los tensores compartidos del objetivo abarcan varias GPU, hay que asignarle esas mismas GPU (`--spec-draft-device CUDA0,CUDA1`), ya que de lo contrario el planificador rechaza los tensores compartidos `output.weight` y `token_embd`.
- Precisión de KV del objetivo: en ese hardware no tuvo efecto medible en el tiempo de paso a 120K+ de contexto (q8_0/q4_0, q4_0/q4_0 y q4_0/q8_0 quedan dentro del ~2 % a 58K, 90K y 120K); solo afecta al consumo de VRAM.
- Despliegue: llama.cpp con soporte de drafter DFlash 2, probado contra master `56381e407c0ccfb3a6f71e668a27a901001d22ce` (build 0.4.0-dev), mediante `llama-server` y los parámetros `--spec-type draft-dflash` y `--spec-draft-model`.
- Rendimiento observado: 36,3 tok/s de decodificación y 447 tok/s de prefill a ~58K; 30,7 tok/s y 341 tok/s a ~90K. La pasada de borrado cuesta 149 ms frente a 192 ms de MTP a ~90K.
- Concurrencia: usar `--parallel 1` salvo necesidad real, porque llama.cpp reserva estado recurrente (híbrido GDN) por slot y un servidor de 4 slots desperdicia varios GiB.

## Comparativa con modelos similares

| Alternativa | Tipo | Parámetros | Formato | Rendimiento (~58K / ~90K / ~120K) | Licencia y disponibilidad |
|---|---|---|---|---|---|
| Este drafter (DFlash2, Q4_K_M) | Drafter de difusión por bloques | ~1,92 mil M | GGUF en llama.cpp | 28,5 / 25,9 / 23,0 tok/s | Apache 2.0; disponible en este repo |
| Este drafter (DFlash2, Q8_0) | Drafter de difusión por bloques | ~1,92 mil M | GGUF en llama.cpp | 26,5 / 23,6 / n/a | Apache 2.0; disponible en este repo |
| Cabeza MTP incorporada en Qwen3.8-27B | Borrador secuencial de 7 tokens | No disponible | Integrada en el objetivo | 20,8–24,3 / 17,6 / n/a | Ligada al modelo objetivo; no es un artefacto aparte |
| Otros drafter especulativos para Qwen3.8-27B | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo autónomo: carece de embeddings de tokens y de proyección de salida propias, por lo que no puede generar texto por sí solo ni usarse sin un objetivo Qwen3.8-27B compatible.
- Dependencia estricta del tokenizador: el objetivo debe compartir tokenizador; el archivo de borrador copia los metadatos del tokenizador del objetivo y fija `mask_token_id` en 248070.
- Requisito de versión: solo funciona con builds de llama.cpp que incluyan la arquitectura `dflash`, el selector en `src/models/dflash.cpp` y el tipo de especulación `draft-dflash`; las versiones anteriores lo rechazarán.
- Límite de profundidad: el tamaño de bloque entrenado es 8 (ancla + 7 borradores); `--spec-draft-n-max` por encima de 7 se recorta con aviso.
- Rendimiento variable: la aceptación observada oscila entre el 28 % y el 60 % según el prompt y el contexto, por lo que la ganancia de velocidad no es constante.
- Restricción de asignación multi-GPU: si los tensores compartidos del objetivo abarcan varios dispositivos, el drafter debe recibir esos mismos dispositivos o el planificador falla.
- Consumo de memoria del servidor: usar varios slots con `--parallel` reserva estado recurrente (híbrido GDN) por slot y puede consumir varios GiB adicionales.
- Precisión de pesos: las normas y los kernels convolucionales `*_base` se almacenan en F32 por una limitación de la ruta binbcast de CUDA en llama.cpp; reconvertir respetando esa regla es obligatorio para evitar abortos.
- Riesgo de alucinación y sesgos: la model card no documenta sesgos del drafter; al preservarse la distribución del objetivo, cualquier sesgo o alucinación proviene del modelo objetivo, no del borrador.
- Idiomas: no disponible; dependen por completo del tokenizador y del objetivo.
- Uso comercial: la licencia Apache 2.0 del drafter no exime de cumplir las condiciones del modelo objetivo Qwen3.8-27B.
- Adopción limitada: el repositorio registraba 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es nula.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas no relacionadas sobre servicios de desguace), por lo que no se dispone de información externa independiente que corrobore las mediciones del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jmarceno/Qwen3.8-27B-DFlash2-GGUF
- Modelo original del drafter: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Espejo del drafter: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (build de referencia `56381e407c0ccfb3a6f71e668a27a901001d22ce`): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo del drafter: no disponible en la información proporcionada.
