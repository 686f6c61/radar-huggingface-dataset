# promzeus/gh0stx-glm46-gb10-GGUF

## Resumen

gh0stx-glm46-gb10-GGUF es una cuantizacion GGUF del modelo base zai-org/GLM-4.6, un transformer de tipo Mixture of Experts con 355.000 millones de parametros totales y 32.000 millones activos por token (355B-A32B). La publica el usuario promzeus bajo licencia MIT, la misma del modelo base, y esta pensada para ejecutar el modelo completo en una unica maquina con memoria unificada NVIDIA GB10 (DGX Spark / ASUS GX10, 128 GB), algo que con los pesos bf16 originales no seria viable.

El objetivo del trabajo es conservar los 160 expertos enrutados del modelo original en lugar de podarlos. Para ello aplica una cuantizacion mixta: los expertos enrutados se cuantizan a IQ2_XXS con una importance matrix, mientras que la atencion, el experto compartido, las capas densas 0-2, los embeddings y la capa MTP se mantienen en Q5_K. El resultado son 93,8 GiB de fichero y 2,26 bits por peso de media, con la capa MTP original incluida para decodificacion especulativa.

La relevancia practica esta en que demuestra que un MoE de 355B puede correr en hardware de escritorio profesional (GB10) a 17,1 tokens/s con decodificacion especulativa activada, manteniendo 113.664 tokens de contexto, y sin los bucles de repeticion que el propio autor observa en variantes podadas del mismo checkpoint. El repositorio ocupa 100,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (GLM4_MOE) con capa MTP |
| Parametros totales | 356.785.898.816 (~356,8B) |
| Parametros activos | ~32B (A32B, segun model card) |
| Longitud de contexto | Nativa no disponible; en GB10 hasta 113.664 tokens con MTP y KV q4_0, y hasta 177.152 tokens sin MTP y KV q4_0 |
| Tipos de cuantizacion | IQ2_XXS (expertos enrutados, 267 tensores), Q4_K (expertos de blk.92), Q5_K (atencion, experto compartido, capas densas 0-2, token_embd, output y resto de blk.92). Media 2,26 bits por peso |
| Idiomas soportados | No disponible (los tags de HuggingFace no los listan; la calibracion imatrix incluye texto en ingles y ruso) |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero `glm46-abl-mtp-IQ2_XXS-Q5K.gguf`, 93,8 GiB) |

## Arquitectura y entrenamiento

El modelo base es GLM-4.6 de zai-org, un MoE de 355B parametros totales y 32B activos con 160 expertos enrutados. Esta ficha describe una derivacion abliterada en bf16 de esos pesos de origen, sobre la que se aplica el pipeline de conversion y cuantizacion de llama.cpp (`convert_hf_to_gguf.py --outtype q8_0`) integrando la capa MTP original (`blk.92`) en el indice de HuggingFace. La capa MTP es la no modificada de zai-org/GLM-4.6.

La calibracion de la importance matrix se hizo con `llama-imatrix --no-repack -c 2048 --parse-special` sobre 400.000 tokens compuestos por trazas de razonamiento (glaive, OpenR1-Math, codeforces-cots), chat en ingles y ruso (OpenHermes-2.5 y su traduccion al ruso) y codigo (Magicoder), todo renderizado con la plantilla de chat de GLM-4.6. La perplejidad sobre ese mismo texto con salida q8_0 es de 3,11. La cuantizacion final se aplico con `llama-quantize`, asignando IQ2_XXS a los tensores `ffn_{gate,up,down}_exps` (267 tensores) y Q4_K a los expertos de `blk.92`, quedando el resto en Q5_K.

La innovacion destacable es la inclusion del cabezal MTP para decodificacion especulativa (`--spec-type draft-mtp`): la capa `blk.92` solo se carga cuando se solicita, de modo que no consume memoria si no se usa. El autor documenta tambien que drafts EAGLE-3 o DFlash con este target requieren un parche de una linea en llama.cpp para GLM4_MOE (`dflash/patches/glm4-moe-layer-inp.patch`), y que un draft EAGLE-3 entrenado sobre GLM-4.7 rindio 12,96 tokens/s, por debajo del MTP integrado.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, tag `conversational`).
- Razonamiento de cadena larga: el autor valida respuestas de hasta 4k tokens sin bucles de repeticion reales en 12 casos de prueba.
- Generacion de codigo, con datos de codigo (Magicoder, codeforces-cots) usados en la calibracion.
- Razonamiento matematico (OpenR1-Math en el conjunto de calibracion).
- Capacidad multilingue parcial: el pipeline de calibracion incluye ingles y ruso; el tag `conversational` no especifica lista de idiomas.
- Decodificacion especulativa mediante cabezal MTP (`--spec-type draft-mtp`), con tasas de aceptacion de 0,80-0,94 con n-max 1.
- Compatibilidad con endpoints (`endpoints_compatible` segun tags), lo que permite exponerlo como servidor HTTP con `llama-server`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no disponible.

## Casos de uso

- Inferencia local de gran escala en estacion de trabajo: desplegar un MoE de 355B en una unica maquina GB10 de 128 GB, sin depender de APIs externas, usando `llama-server` con contexto de 113k tokens y MTP activado.
- Asistente de razonamiento con contexto largo: analisis de documentos o bases de codigo que quepan en 113.664 tokens, aprovechando que el decode a profundidad se mantiene estable (~3,6-4,1 tokens/s) y mejora con MTP.
- Generacion de codigo asistida en local: el modelo se calibro con corpus de codigo y trazas tipo codeforces-cots, por lo que es adecuado para completado y explicacion de codigo en entornos con requisitos de privacidad.
- Sustitucion de modelos podados en pipelines sensibles a la coherencia: el autor reporta que las variantes podadas (REAP, 64 de 160 expertos) entraban en bucles en 7-9 de 12 casos a 4,6-5,5 bits por peso, mientras que esta conserva los 160 expertos sin bucles reales en las mismas pruebas.
- Evaluacion y benchmarking de cuantizaciones extremas: util como referencia para estudiar el impacto de IQ2_XXS con imatrix frente a Q5_K en un MoE grande.
- Despliegue con decodificacion especulativa: escenarios donde la latencia importa y se puede activar el cabezal MTP, que sube el decode de 11,45 a 17,14 tokens/s en GB10.
- Investigacion sobre abliteration: al partir de un derivado abliterado en bf16, sirve para estudiar el efecto de esa modificacion sobre calidad y bucles de repeticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento y calidad aportados por el autor son los siguientes.

| Metrica | Resultado |
|---|---|
| Perplejidad (texto de calibracion imatrix, q8_0) | 3,11 |
| Test de bucles (6 prompts, temp 0 y 1, respuestas hasta 4k tokens) | 0 bucles reales en 12 casos; 1 falso positivo en una enumeracion dia a dia correcta |
| Variante podada equivalente (REAP, 64/160 expertos, 4,6-5,5 bpw) | Bucles en 7-9 de 12 casos |

Velocidad medida en GB10:

| Modo | Contexto | KV cache | Decode (tok/s) | Aceptacion MTP |
|---|---|---|---|---|
| Sin especulacion | 32k | q8_0 | 11,45 | - |
| MTP, n-max 1 | 113k | q4_0 | 17,14 | 0,80-0,94 |
| MTP, n-max 2 | 32k | q8_0 | 14,36 | 0,41-0,47 |
| MTP, n-max 3 | 32k | q8_0 | 12,17 | 0,26-0,33 |

Prefill y decode a distintas profundidades:

| Longitud de prompt | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|
| 57,6k | 197 | 4,10; 6,28 con MTP |
| 111,9k | 125 | 3,61 con MTP |

El autor indica que el tipo de KV cache no altera la velocidad de decode a profundidad (q8_0 y q4_0 rondan 4,1 tok/s a 57,6k), por lo que q4_0 duplica el contexto sin coste de velocidad.

## Requisitos de hardware

- Tamano del fichero: 93,8 GiB (el repositorio completo ocupa 100,7 GB).
- Memoria necesaria: el unico escenario documentado es una NVIDIA GB10 con 128 GB de memoria unificada (DGX Spark o ASUS GX10). El autor usa `-fitt 11264` para dejar unos 8 GiB libres tras la carga y unos 5 GiB durante una peticion de 112k tokens; con el margen por defecto de 1 GiB la maquina dejaba de responder.
- Cabe en GPU de consumo: no. Una RTX 4090 (24 GB) o similar no puede alojar el fichero.
- GPUs recomendadas: no disponible en la informacion proporcionada (solo se documenta GB10 / GB10-class con 128 GB).
- Opciones de despliegue: llama.cpp (`llama-server`), probado con el commit `4ebdf2c` compilado con `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=121`. No se documentan vLLM, TGI ni Ollama en la informacion disponible.
- Comando de referencia documentado: `llama-server -m glm46-abl-mtp-IQ2_XXS-Q5K.gguf --alias glm46 -ngl 999 -fa on -ctk q4_0 -ctv q4_0 -np 1 -ub 2048 --load-mode none -fitt 11264 --spec-type draft-mtp --spec-draft-n-max 1 --jinja --host 0.0.0.0 --port 8000`.
- Latencia y throughput: 11,45 tok/s de decode sin especulacion y 17,14 tok/s con MTP a contexto 32k/113k; prefill de 197 tok/s a 57,6k y 125 tok/s a 111,9k; decode de 4,10 tok/s (6,28 con MTP) a 57,6k y 3,61 tok/s con MTP a 111,9k.
- La capa MTP no consume memoria adicional cuando no se solicita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| gh0stx-glm46-gb10-GGUF | 355B-A32B, 160 expertos | 113k con MTP, 177k sin MTP (KV q4_0, GB10) | IQ2_XXS + Q4_K + Q5_K, 2,26 bpw | 93,8 GiB | MIT | 0 bucles reales en 12 casos; MTP integrado |
| zai-org/GLM-4.6 (original) | 355B-A32B, 160 expertos | No disponible en la informacion proporcionada | bf16 (sin cuantizar) | No disponible | MIT | Modelo base; su tamano bf16 no cabe en GB10 |
| Variante podada REAP del mismo checkpoint | 64 de 160 expertos | No disponible | 4,6-5,5 bits por peso | No disponible | MIT | Bucles en 7-9 de 12 casos segun el autor |
| Draft EAGLE-3 entrenado sobre GLM-4.7 | No es un target, es un draft | No aplica | No disponible | No disponible | No disponible | 12,96 tok/s como draft para este target, por debajo del MTP |

## Limitaciones y advertencias

- Cuantizacion muy agresiva: 2,26 bits por peso de media. Aunque los expertos enrutados estan en IQ2_XXS con imatrix, puede haber degradacion de calidad frente a cuantizaciones mayores, especialmente fuera de los dominios usados en la calibracion (razonamiento, chat ingles/ruso, codigo).
- Derivado abliterado: los pesos de origen son una version abliterada en bf16 de GLM-4.6, lo que puede alterar el comportamiento de rechazo y las salvaguardas del modelo original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se aportan datos de evaluacion tipo TruthfulQA o similares.
- Bucles de repeticion: el autor solo certifica ausencia de bucles reales en 12 casos de prueba con respuestas de hasta 4k tokens; no es una garantia exhaustiva, y reporta un falso positivo en una enumeracion.
- Limitaciones de contexto: el maximo practico en GB10 es 113.664 tokens con MTP y KV q4_0, o 177.152 sin MTP. Con KV q8_0 baja a 95.744 tokens sin MTP.
- Gestion de memoria fragil en GB10: la memoria es compartida con el sistema operativo y hay que ajustar `-fitt` manualmente (11264 en la configuracion del autor); con el margen por defecto de 1 GiB el sistema dejaba de responder.
- Idiomas: no se especifica lista oficial de idiomas soportados; la calibracion solo cubre ingles y ruso, por lo que el rendimiento en otros idiomas es incierto.
- Compatibilidad de drafts especulativos: EAGLE-3 o DFlash con este target requieren un parche de una linea en llama.cpp para GLM4_MOE.
- Licencia MIT: permite uso comercial, pero el aviso de licencia MIT del autor aplica a esta cuantizacion; conviene verificar los terminos del modelo base zai-org/GLM-4.6.
- Hardware muy especifico: no hay resultados documentados en otras plataformas (multi-GPU, otras arquitecturas CUDA), y el binario probado se compilo especificamente con `CMAKE_CUDA_ARCHITECTURES=121`.

## Enlaces

- HuggingFace: https://huggingface.co/promzeus/gh0stx-glm46-gb10-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.6
- Repositorio del pipeline, scripts de test y resultados en crudo: https://github.com/promzeus/gh0stx-glm46-gb10
- Parche para drafts EAGLE-3/DFlash en GLM4_MOE: `dflash/patches/glm4-moe-layer-inp.patch` (dentro del repositorio de GitHub)
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados obtenidos eran contenido no relacionado).
