# Davidmg0815/Qwen3.8-Flash-Next-UD-Q3_K_XL-256exp-MTP-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Alibaba Qwen, con 176 000 millones de parámetros totales y 512 expertos enrutados por capa. Esta ficha concreta no es el modelo original, sino una derivación comunitaria publicada por el usuario Davidmg0815: una cuantización GGUF UD-Q3_K_XL de Unsloth a la que se le han podado los expertos de 512 a 256 por capa, reutilizando el mapa de selección de expertos publicado por ISTA-DASLab en su variante GSQ-RCO Coder. El resultado es un artefacto de 64,9 GB que cabe en dos GPU de consumo de 20 GB con contexto largo.

La motivación del autor es puramente práctica: la versión de ISTA almacena los expertos supervivientes a ~3,3 bits por peso, mientras que la de Unsloth lo hace a ~3,7 bpw, de modo que con el mismo número de expertos este archivo pesa 2,75 GB más pero conserva una calidad de cuantización superior. No se ha recuantizado nada: los tensores de los expertos supervivientes son los bytes originales de Unsloth, y la única conversión es el router (`ffn_gate_inp`), que pasa de 512 filas F32 a 256 filas BF16 para coincidir con el diseño de ISTA.

El repositorio incluye además una cabeza MTP (Multi-Token Prediction) recuantizada a Q4_K_M para decodificación especulativa, un proyector de visión BF16 que habilita la entrada image-text-to-text, un shard de n-gramas (engram) que se mapea en memoria sin consumir VRAM, y los scripts y parches de llama.cpp necesarios para reproducir el proceso. Es relevante ahora porque demuestra que el pruning de expertos sobre cuantizaciones de alta calidad permite ejecutar un MoE de 176B en hardware de consumo con visión y contexto de casi 100 000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con 512 expertos enrutados por capa, cabeza MTP y shard de n-gramas (engram) |
| Parametros totales | 116 514 464 640 (~116,5B en safetensors del modelo base; el autor cita 176B para el MoE original) |
| Parametros activos | no disponible |
| Longitud de contexto | 97 000 tokens con cabeza MTP; 261 000 tokens sin cabeza MTP (segun el autor, en 2x RTX 3080 20 GB) |
| Tipos de cuantizacion | GGUF UD-Q3_K_XL (expertos a ~3,7 bpw); cabeza MTP en Q4_K_M; router en BF16; cache K/V en q8_0; cache de draft en q5_1 |
| Idiomas soportados | no disponible (la model card menciona una respuesta de prueba en aleman con mezcla de ingles) |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | GGUF (dos shards de modelo, cabeza MTP, proyector de vision y `expert_map.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 512 expertos enrutados por capa. Esta derivación aplica un pruning estructurado que reduce ese número a 256 expertos por capa, manteniendo un conjunto distinto de expertos supervivientes en cada capa; en conjunto, las capas cubren los 512 expertos originales. El mapa de selección (`expert_map.json`) se obtuvo comparando fila a fila los routers BF16 sin cuantizar de ISTA con los del modelo sin podar, con coincidencia de coseno 1.0. La verificación posterior confirma que las filas del router en las capas 3, 20 y 41 son idénticas bit a bit a las de ISTA tras el redondeo F32→BF16, lo que indica que ISTA solo eliminó expertos y no alteró el router.

El proceso de construcción no recuantiza: descarga únicamente los expertos supervivientes del repositorio de Unsloth mediante peticiones HTTP range (~33 GB), los escribe en el orden de tensores y con la cabecera de metadatos de ISTA, y reutiliza el shard de n-gramas de ISTA sin modificarlo. Como comprobación, 30 slices de expertos aleatorios y 10 tensores adicionales se compararon con una descarga fresca de Unsloth, con 0 diferencias. La cabeza MTP se recuantizó desde el `mtp-…-Q8_0.gguf` de Unsloth con `llama-quantize --allow-requantize`. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla Jinja (`--jinja`).
- Razonamiento matemático: el autor evalúa con MATH-500 y esfuerzo de razonamiento `medium`, con hasta 6000 tokens de generación.
- Entrada image-text-to-text: incluye proyector de visión BF16 (`mmproj-Qwen3.8-Flash-Next-BF16.gguf`); una imagen Full-HD se lee correctamente en 4,2 s con el proyector en GPU.
- Decodificación especulativa mediante cabeza MTP, con tasas de aceptación de draft del 60,3 % al 78,5 % y longitud media de draft de 2,57 tokens.
- Contexto largo: probado con un prompt de 88 358 tokens con recuperación correcta de la aguja (needle).
- Capacidad multilingüe: no documentada; se observó una respuesta en alemán con palabras en inglés mezcladas.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo de razonamiento con límite de tokens es compatible con flujos multi-paso.

## Casos de uso

- Asistente de razonamiento matemático en local: con 91,1 % de acierto en 90 tareas de MATH-500 a esfuerzo medio, es adecuado para resolver problemas de competición o verificación de cálculos en un equipo con dos GPU de 20 GB, sin depender de API externa.
- Análisis de documentos largos con recuperación de información: los 97 000 tokens de contexto con MTP permiten ingerir informes, contratos o bases de código extensas y responder preguntas concretas; el autor verificó la recuperación de una aguja en un prompt de 88 358 tokens.
- Procesamiento de imágenes y texto combinados: el proyector de visión permite transcribir o interpretar capturas, diagramas y documentos escaneados en el mismo pipeline que el texto, con latencia de 4,2 s por imagen Full-HD en GPU.
- Generación de código asistida con decodificación especulativa: la cabeza MTP acelera la generación de respuestas largas (hasta 67,7 tok/s en peticiones cortas), lo que la hace viable para autocompletado o revisión de código en un servidor local.
- Despliegue de un MoE de gran tamaño en hardware de consumo: sirve como referencia para equipos que quieren ejecutar un modelo de 176B con pruning en dos RTX 3080 o 4090 de 20-24 GB, usando llama.cpp con `--tensor-split` y `-ub 256`.
- Investigación en pruning de expertos: el repositorio incluye `expert_map.json`, los scripts `prune_unsloth.py` y `ggufkopf.py`, y los parches de llama.cpp, lo que permite reproducir el proceso y comparar la calidad frente a la variante de ISTA.
- Evaluación comparativa de cuantizaciones: los resultados crudos de MATH-500 en `eval/` permiten analizar el impacto de la cuantización (3,7 bpw frente a 3,3 bpw) sobre el rendimiento en tareas de razonamiento.

## Benchmarks y rendimiento

Resultados de MATH-500 aportados por el autor (90 tareas, esfuerzo `medium`, máximo 6000 tokens, 3 peticiones en paralelo, sin MTP):

| Metrica | Este modelo (Q3_K_XL, 256 exp) | ISTA GSQ-RCO Coder (256 exp) |
|---|---|---|
| Correctas | 82 / 90 (91,1 %) | 80 / 90 (88,9 %) |
| Cortadas a 6000 tokens | 5 | 6 |
| Tokens por tarea | 1298 | 1355 |
| Velocidad por slot (mediana, 3 en paralelo) | 23,5 tok/s | 23,7 tok/s |

Comparación pareada: 3 tareas resueltas solo por este modelo, 1 solo por ISTA, 7 falladas por ambos; McNemar p = 0,62, sin regresión demostrada ni ganancia probada.

Rendimiento en uso real con cabeza MTP (single slot, 2x RTX 3080 20 GB):

| Peticion | Tokens generados | Velocidad | Aceptacion de draft |
|---|---|---|---|
| Prompt corto (82 tok) | 2476 | 67,7 tok/s | 78,5 % (longitud media 2,57) |
| Prompt corto (94 tok) | 6000 (limite) | 56,5 tok/s | 60,3 % |
| Respuesta de razonamiento larga | 6K → 13,7K | media 47 → 44,5 tok/s | no disponible |

Prefill de un prompt de 88 358 tokens: 112 s (~795 tok/s), con pico de 19 017 / 19 591 MiB de 20 480 MiB. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo ocupa 64,9 GB en disco; con `--tensor-split 41,59` y contexto de 97K con MTP, el consumo en reposo es de 1,65 GiB en la tarjeta 0 y 1,0 GiB en la tarjeta 1, con picos de ~19 GB por tarjeta durante el prefill de 88K tokens.
- GPU recomendadas: 2x RTX 3080 de 20 GB o 2x RTX 4090 de 24 GB; el autor no documenta configuraciones con A100 o H100.
- Cabe en GPU de consumo: sí, en dos tarjetas de 20 GB o más con `--n-gpu-layers 99` y `-ub 256`; con `-ub 512` se produce OOM en CUDA (`ggml_cuda_op_top_k`) y con `--tensor-split 42,58` falla la primera imagen en la tarjeta 0.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de `--flash-attn on`, `--cache-type-k q8_0`, `--cache-type-v q8_0`, `--cache-ram 32768`, `--ctx-checkpoints 8`, `--spec-type draft-mtp` y `-devd CUDA0`. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: 795 tok/s de prefill en un prompt de 88K; 67,7 tok/s de generación con MTP en peticiones cortas; 23,5 tok/s por slot con 3 peticiones en paralelo sin MTP. El shard de n-gramas se mapea en memoria y no consume VRAM.
- Nota del autor: las cifras de MTP se midieron en llama.cpp `46ca246` con dos parches y sin el fix BF16 multi-token; con el cherry-pick de los PR #29633 y #29825 se espera un rendimiento superior (en octubre, con el archivo de ISTA, pasó de 71 a 99 tok/s en código y de 52 a 70 tok/s en prosa).

## Comparativa con modelos similares

| Modelo | Parametros | Expertos | Contexto | MATH-500 | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (Q3_K_XL, 256 exp) | ~116,5B (176B MoE original) | 256 por capa | 97K con MTP / 261K sin MTP | 91,1 % (82/90) | qwen-community-1.0 | GGUF |
| ISTA-DASLab GSQ-RCO Coder (256 exp) | mismo base | 256 por capa | no disponible | 88,9 % (80/90) | no disponible | GGUF |
| Unsloth Qwen3.8-Flash-Next-GGUF (UD-Q3_K_XL) | mismo base | 512 por capa | no disponible | no disponible | no disponible | GGUF |

La comparación directa con ISTA no muestra diferencias estadísticamente significativas (McNemar p = 0,62), aunque este archivo pesa 2,75 GB más por almacenar los expertos a ~3,7 bpw en lugar de ~3,3 bpw. No se dispone de datos de benchmarks frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- El pruning de 512 a 256 expertos es una modificación estructural no validada por el equipo de Qwen; el autor solo demuestra ausencia de regresión en 90 tareas de MATH-500, no una mejora.
- Riesgo de alucinación inherente al modelo base, no evaluado en esta derivación; no hay datos de MMLU, HumanEval ni evaluaciones de sesgo.
- La única evaluación de calidad documentada es MATH-500 con 90 tareas, muestra pequeña y de un solo dominio.
- Se observó una respuesta en alemán con palabras en inglés mezcladas ("aktively computed path"); el autor no lo comprobó contra ISTA, por lo que el comportamiento multilingüe no está caracterizado.
- La licencia `qwen-community-1.0` (etiquetada como `other`) impone restricciones que deben revisarse antes de uso comercial; no se detallan en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, creado y actualizado el 11 de noviembre de 2026; es un artefacto comunitario sin validación externa.
- Requiere parches específicos de llama.cpp y una versión concreta (`46ca246` más dos parches); sin ellos, el rendimiento con MTP puede ser inferior al reportado.
- El uso de `-ub 256` es obligatorio: con `-ub 512` se produce OOM en CUDA durante el prefill de contextos largos.
- El shard de n-gramas debe estar presente junto al shard 1; llama.cpp lo carga automáticamente al apuntar al primero.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Davidmg0815/Qwen3.8-Flash-Next-UD-Q3_K_XL-256exp-MTP-GGUF
- Modelo base (Unsloth GGUF): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Variante de referencia ISTA-DASLab GSQ-RCO Coder: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- PR de llama.cpp #29633 (fix BF16 multi-token): no disponible como URL verificada en la información proporcionada
- PR de llama.cpp #29825: no disponible como URL verificada en la información proporcionada
