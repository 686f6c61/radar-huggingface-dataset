# Digitals06/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Agressive-MTP-GGUF

## Resumen

Se trata de una cuantizacion GGUF en IQ4_XS del modelo Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, un finetune sin censura de Qwen/Qwen3.6-35B-A3B. La particularidad de esta subida, publicada por el usuario Digitals06, es que fusiona en el mismo archivo la cabeza de Multi-Token-Prediction (MTP) del modelo base, de modo que la decodificacion especulativa multi-token funciona sin necesidad de un modelo borrador externo. El resultado es un unico fichero de 17,95 GiB que no requiere descargar ni cargar un segundo modelo en VRAM.

Arquitectonicamente es un transformer MoE de tipo `qwen35moe`, con 40 capas de tronco mas un bloque MTP adicional (41 bloques en total), 256 expertos por capa y 8 expertos enrutados por token. La notacion A3B del nombre indica del orden de 3.000 millones de parametros activos por token sobre un total de 35.505.251.456 parametros. La longitud de contexto nativa declarada es de 262.144 tokens. Es un modelo multimodal (image-text-to-text), aunque la parte de vision se distribuye por separado.

Su relevancia practica esta en el rendimiento medido: con MTP activado se observa una mejora de decodificacion de en torno al +17,8 % en codigo y +18,7 % en prosa respecto al mismo setup sin MTP, con tasas de aceptacion de borrador del 71,4 % y 84,7 % respectivamente. Todo ello ejecutable en una GPU consumer de 8 GB con offload de expertos a RAM del sistema, segun los datos aportados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (transformer MoE con bloque MTP acoplado) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B (notacion A3B; 8 de 256 expertos enrutados por token) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | IQ4_XS con imatrix (`general.file_type = 30`); tensores MTP a Q4_K_M |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (753 tensores: 733 de tronco + 20 MTP) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Finetune de origen | Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (variante Aggressive) |
| Capas | 40 de tronco + 1 bloque MTP (`block_count = 41`, `nextn_predict_layers = 1`) |
| Expertos | 256 por capa, 8 enrutados por token |
| Tamano del archivo | 17,95 GiB (19.275.482.560 bytes / 19,3 GB) |
| Vision | Requiere mmproj aparte (`mmproj-...-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) identificado por la arquitectura `qwen35moe`, derivado de Qwen3.6-35B-A3B, que a su vez parte de una licencia Apache-2.0. La configuracion concreta de esta cuantizacion es de 40 capas de tronco mas una capa adicional de prediccion multi-token (MTP), con 256 expertos por capa y 8 expertos activados por token. Los 20 tensores `blk.40.*` correspondientes a la cabeza MTP suman unos 521 MiB y son los unicos que no provienen de la cuantizacion IQ4_XS original: se han injertado a Q4_K_M desde el sidecar MTP.

La innovacion tecnica destacable es precisamente esa cabeza MTP fusionada. Al tratarse de la propia cabeza de siguiente token entrenada por el modelo (no un borrador destilado), la tasa de aceptacion es alta de forma natural y se mantiene en generacion abierta, donde un drafter destilado rendiria peor. No se dispone de informacion sobre la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF/DPO en el finetune sin censura de HauhauCS; esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de proposito general, con modo de razonamiento (el modelo base Qwen3.6 es de tipo thinking).
- Generacion de codigo, con un preset de muestreo especifico para tareas de codigo y precision.
- Capacidades multimodales de imagen-texto (image-text-to-text), siempre que se cargue el proyector mmproj correspondiente.
- Decodificacion especulativa multi-token integrada mediante la cabeza MTP, sin modelo borrador externo.
- Soporte multilingue declarado para en, zh y multilingual.
- Compatibilidad con endpoints (`endpoints_compatible`) segun los tags del repositorio.
- El finetune de origen esta etiquetado como `uncensored`, lo que implica un ajuste orientado a reducir rechazos y filtros de contenido.
- No hay informacion disponible sobre soporte explicito de tool calling o function calling, agentes o razonamiento multi-paso mas alla de lo heredado del modelo base.

## Casos de uso

- Inferencia local en GPU consumer: con 17,95 GiB de pesos y offload de expertos (`-ncmoe`), el modelo puede ejecutarse en una GPU de 8 GB apoyandose en RAM del sistema, segun las mediciones aportadas (RTX 3060 Ti 8 GB, Ryzen 5 5600X, 32 GB DDR4-2133).
- Generacion de codigo asistida con baja latencia: el preset de muestreo "coding/precise" documentado (`temp 0.6`, `top-p 0.95`, `top-k 20`, `min-p 0`) y la mejora de decodificacion del +17,8 % con MTP lo hacen adecuado para autocompletado y tareas de programacion interactivas.
- Procesamiento de contexto largo sobre documentos: con contexto nativo de 262.144 tokens y decodificacion que se mantiene a 65.712 tokens de profundidad (42,5 t/s, aceptacion 77,5 %), es viable para analisis de repositorios, contratos o informes extensos.
- Redaccion y generacion de prosa: el preset de prosa con `--spec-draft-n-max 3` alcanza el +33,4 % de mejora de decodificacion, lo que lo hace util para generacion de contenido largo.
- Asistente conversacional sin filtros: al ser un finetune uncensored, encaja en escenarios de investigacion sobre comportamiento de modelos o narracion creativa sin restricciones tematicas.
- Analisis de imagenes con descripcion textual: cargando el mmproj f16, admite entradas de imagen y texto, aunque en ese modo debe renunciarse al MTP (vision y MTP no son compatibles simultaneamente).
- Despliegue como servidor local de inferencia: el ejemplo usa `llama-server` con `--jinja`, host y puerto configurables, lo que permite exponerlo como API compatible con plantillas de chat.

## Benchmarks y rendimiento

Todas las cifras proceden de una unica maquina: RTX 3060 Ti 8 GB, Ryzen 5 5600X, 32 GB DDR4-2133, contexto 131.072, 256 tokens greedy.

Comparativa de tres configuraciones (job intercalado en una sola ejecucion):

| Configuracion | Prefill t/s | Decode codigo | Decode prosa | VRAM pico |
|---|---|---|---|---|
| llama.cpp baseline (KV q8_0) | 852,4 | 32,13 | 32,46 | 7617 MiB |
| buun-llama.cpp + KV turbo4 + cache de expertos MoE | 981,9 | 38,82 | 37,75 | 7477 MiB |
| + MTP | 937,8 | 45,73 | 44,81 | 7656 MiB |

Mejoras relativas:

| Comparacion | Prefill | Decode codigo | Decode prosa |
|---|---|---|---|
| turbo4 + cache de expertos vs baseline | +15,2 % | +20,8 % | +16,3 % |
| + MTP vs baseline | +10,0 % | +42,3 % | +38,0 % |
| MTP vs el mismo setup sin MTP | −4,5 % | +17,8 % | +18,7 % |

Contexto profundo (prompt de codigo de 64K):

| Profundidad | Prefill | Decode | VRAM pico | Aceptacion |
|---|---|---|---|---|
| 5.575 tok | 934,9 t/s | 45,6 t/s | 7620-7658 MiB | 65,9 % |
| 65.712 tok | 809,9 t/s | 42,5 t/s | 7860 MiB | 77,5 % |

Profundidad de borrador (`--spec-draft-n-max`):

| Valor | Codigo | Prosa |
|---|---|---|
| 1 | +17,8 % | +10,8 % |
| 2 | +12,9 % | +29,8 % |
| 3 | +5,0 % | +33,4 % |

Aceptacion del borrador con MTP activado: 71,4 % / 64,4 % (codigo) y 84,7 % / 60,2 % (prosa), con una longitud media de racha aceptada de 2,20-2,68 tokens. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 7,5-7,9 GB con KV turbo4 y cache de expertos MoE, segun las mediciones (7.477 MiB con turbo4, 7.656 MiB con MTP, 7.860 MiB con prefill profundo de 64K). Hay que dimensionar para el pico en contexto profundo, no para el valor en reposo.
- GPU recomendadas: la medicion se hizo en RTX 3060 Ti 8 GB. Una GPU consumer de 8 GB es suficiente con offload de expertos (`-ncmoe 36`); GPUs de gama alta con mas VRAM permitirian mantener mas capas de expertos en GPU.
- RAM del sistema: el setup medido usa 32 GB DDR4-2133, que actua como almacen de los expertos no residentes en VRAM.
- Opciones de despliegue: `llama-server` (llama.cpp) con soporte para `qwen35moe` y `--spec-type draft-mtp`. El autor uso el fork buun-llama-cpp para construir y medir este fichero; Unsloth documenta MTP en llama.cpp mainline para sus propios GGUFs. No se menciona soporte para vLLM, Ollama o TGI en la informacion disponible.
- Rendimiento medido: decodificacion de 45,73 t/s en codigo y 44,81 t/s en prosa con MTP; prefill de 937,8 t/s en contexto de 131K con prompt corto. A 65.712 tokens: prefill 809,9 t/s y decode 42,5 t/s.
- Restricciones de configuracion: vision (`--mmproj`) y MTP no pueden usarse juntos, y `-np > 1` no esta soportado mientras MTP esta activo.
- Si no se usa `--spec-type draft-mtp`, el bloque MTP se ignora al cargar y el fichero se comporta como un modelo ordinario de 40 capas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IQ4_XS + MTP) | 35,5B totales / ~3B activos | 262.144 | MoE + MTP, multimodal con mmproj | apache-2.0 | GGUF, un solo fichero |
| Qwen/Qwen3.6-35B-A3B (base) | 35,5B totales / ~3B activos | 262.144 | MoE multimodal | apache-2.0 | safetensors y cuantizaciones varias |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 35,5B totales / ~3B activos | 262.144 | MoE uncensored, multimodal | apache-2.0 | GGUF (origen del IQ4_XS aqui usado) |

No se dispone de datos de rendimiento comparativos de los modelos base frente a esta cuantizacion; las unicas cifras publicadas son las mediciones internas del autor en la configuracion de hardware descrita.

## Limitaciones y advertencias

- El fichero contiene unicamente el modelo de lenguaje: la vision requiere descargar aparte el mmproj f16 del repositorio de HauhauCS.
- Vision y decodificacion MTP son mutuamente excluyentes: si se activa `--mmproj`, hay que renunciar a `--spec-type draft-mtp`.
- La decodificacion especulativa tampoco admite `-np > 1`; no es posible servir multiples peticiones en paralelo con MTP activo.
- Requiere un build de llama.cpp que reconozca la cadena de arquitectura `qwen35moe` y soporte `--spec-type draft-mtp`; un build que no la reconozca no cargara correctamente.
- El modelo es un finetune etiquetado como `uncensored`, lo que implica un ajuste deliberado para reducir rechazos. Esto eleva el riesgo de generar contenido inapropiado, sesgado o danino, y traslada al operador la responsabilidad de filtrar en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay datos de evaluacion de veracidad en la informacion proporcionada.
- El prefill con MTP activado es un 4,5 % mas lento que sin MTP, debido al coste del batch de verificacion.
- Los idiomas declarados son en, zh y multilingual; el rendimiento en otros idiomas (por ejemplo, castellano) no esta cuantificado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y su finetune conservan sus propias condiciones; conviene verificar la trazabilidad de los datos del finetune uncensored de HauhauCS antes de un despliegue comercial.
- Las mediciones de rendimiento corresponden a una unica maquina (RTX 3060 Ti 8 GB, DDR4-2133); con otra RAM o GPU las cifras pueden variar notablemente.
- La fecha de creacion y actualizacion del repositorio (2026-09-30) es posterior a las fechas habituales de publicacion de modelos Qwen; conviene verificar la procedencia y autenticidad de los pesos antes de usarlos en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Digitals06/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Agressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Finetune de origen: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Proyector de vision mmproj (f16): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/resolve/main/mmproj-Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-f16.gguf
- llama.cpp mainline: https://github.com/ggml-org/llama.cpp
- Fork buun-llama-cpp: https://github.com/spiritbuun/buun-llama-cpp
- Guia MTP de Unsloth: https://unsloth.ai/docs/models/qwen3.6#mtp-guide
