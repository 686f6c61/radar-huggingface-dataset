# mduca771/Qwen3.8-Flash-Next-PLE-tables-GGUF

## Resumen

Este repositorio no contiene un modelo completo, sino un artefacto de infraestructura para ejecutar **Qwen3.8-Flash-Next**: la tabla **PLE** (*per-layer embedding*, también descrita como tabla n-gram **Engram**) extraída a un GGUF independiente. Se trata de un único tensor, `per_layer_token_embd.weight`, con forma `[160, 320001536]` y 51.200.245.760 parámetros (51,2 B), que la capa 1 del modelo consume mediante `ggml_get_rows`. Al separarlo, una sola tabla sirve a todas las cuantizaciones del mismo checkpoint, en lugar de duplicarla dentro de cada fichero de pesos.

El autor es `mduca771` y el trabajo consiste exclusivamente en reetiquetar cabeceras: la carga útil procede de los quants de Unsloth (`unsloth/Qwen3.8-Flash-Next-GGUF`) y de la variante RCO de ISTA-DASLab. No se recalculan valores; solo cambian `general.architecture` (`strata-ple`), `general.name` y los campos `split.*`. Se publican dos variantes, Q8_0 (50,66 GiB, recomendada) e IQ4_NL (26,82 GiB, ligera).

Su relevancia es práctica: permite desplegar el modelo con llama.cpp (aplicando un parche local de ~16 líneas, incluido) o con el motor Strata, manteniendo la tabla en RAM de host y fuera de la VRAM incluso con `-ngl 999`. Es material para quien ya vaya a servir Qwen3.8-Flash-Next y quiera ahorrar disco o comparar cuantizaciones sin volver a descargar 50 GiB de embeddings por variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base (Qwen3.8-Flash-Next). El GGUF de este repo declara `general.architecture = "strata-ple"` y contiene un unico tensor de embedding por capa |
| Parametros totales | 51.200.245.760 (51,2 B), correspondientes exclusivamente al tensor `per_layer_token_embd.weight` de forma `[160, 320001536]`; no representa el total del modelo completo |
| Parametros activos | No disponible (el comando de Strata incluye `--expert-profile`, lo que sugiere un modelo con expertos, pero la informacion proporcionada no lo confirma) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | En este repo: Q8_0 (50,66 GiB) e IQ4_NL (26,82 GiB). Quants del modelo asociado: UD-Q4_K_XL, UD-IQ4_XS, UD-Q3_K_XL, UD-IQ3_XXS |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 (la del checkpoint base no se detalla en la informacion disponible) |
| Formato de pesos | GGUF de un solo tensor (`offset 0`), `split.count = 2`, `split.no = 1`, `split.tensors.count = 1224` |

## Arquitectura y entrenamiento

El repositorio no entrena nada ni aporta pesos nuevos: es un proceso de extraccion y reetiquetado. El tensor PLE es un embedding por capa de tipo n-gram (Engram) de 51,2 B de parametros, materializado como una matriz de 160 filas por 320.001.536 columnas. La capa 1 del transformer lo consulta mediante `ggml_get_rows`, de modo que la tabla actua como una memoria de recuperacion léxico-n-gramatical acoplada al modelo, no como un mecanismo de decodificacion especulativa: el autor insiste en que no es la funcion `--spec-type ngram-*` de llama.cpp, sino un peso real.

En cuanto a procedencia, `PLE_flash_Q8.gguf` es una copia reetiquetada del shard `UD-Q6_K_XL/Qwen3.8-Flash-Next-UD-Q6_K_XL-00003-of-00006.gguf` de Unsloth (SHA-256 `34efd79a80a1ce540a517a5d56171924b66ce1c38b04c904f17ad6d8ef17cf20`, revision `38bb39ee…`), y `PLE_flash_IQ4_NL.gguf` es la tabla que ya viaja dentro de los quants de este conjunto (SHA-256 de carga util `dd55c28902f38cd88134b2a569c51282c5ffce30080487e1a645740115c56cc3`). La carga util es identica en `UD-Q5_K_XL`, `UD-Q6_K_XL` y `Q8_0`. No hay datos sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Actua como dependencia de ejecucion de Qwen3.8-Flash-Next: sin esta tabla (o sin el segundo shard equivalente) el modelo no arranca, porque declara `split.count = 2`.
- Sirve una sola tabla a todas las cuantizaciones del mismo checkpoint, lo que permite alternar entre UD-Q4_K_XL, UD-IQ4_XS, UD-Q3_K_XL e UD-IQ3_XXS sin duplicar el embedding.
- Compatible con llama.cpp previa aplicacion de un parche local (`ple-gguf.patch`, 3 ficheros, ~16 lineas, contra `master` en `c0fd78626` / build `b11714`).
- Compatible de forma nativa con el motor Strata, con opciones `--ple-io direct|mmap|ram`, `--ple-row-cache` y `--ple-inflight`.
- Dos niveles de precision de la tabla: Q8_0 (1,0625 bytes por parametro, ~8,5 bits) e IQ4_NL (0,5625 bytes por parametro, ~4,5 bits).
- Verificable por integridad: el autor publica los SHA-256 de las cargas utiles, lo que permite auditar que no se han recomputado valores.
- Idiomas heredados del checkpoint: ingles y chino. No se declaran capacidades adicionales (tool calling, vision, audio) en la informacion disponible.

## Casos de uso

- Servicio multi-cuant en un mismo host: mantener un unico `PLE_flash_Q8.gguf` en disco y lanzar varias instancias de `llama-server` con distintos quants de pesos (Q4_K_XL, IQ4_XS, Q3_K_XL), ahorrando 26,82-50,66 GiB por cada variante adicional que antes duplicaba la tabla.
- Despliegue en llama.cpp con parche: integrar `ple-gguf.patch` en una pipeline de build (CMake) y arrancar con `llama-server -m ...-00001-of-00002.gguf --ple-gguf PLE_flash_Q8.gguf -c 4096 -ngl 99`, recordando pasar siempre `--ple-gguf` para que el motor no busque un `-00002-of-00002.gguf` inexistente junto al modelo.
- Despliegue en Strata con IO controlada: usar `--ple-io ram` en servidores con ~50 GiB de RAM libre y SSD lento, o `--ple-io mmap`/`direct` cuando la RAM es el recurso escaso, apoyandose en `--ple-row-cache` para las filas calientes.
- Equipos con almacenamiento limitado: elegir `PLE_flash_IQ4_NL.gguf` (26,82 GiB) frente a los 50,66 GiB de Q8_0 cuando el disco es la restriccion principal y se asume la perdida de precision de la tabla.
- Evaluacion A/B de cuantizaciones: comparar UD-Q4_K_XL contra UD-IQ3_XXS manteniendo fija la misma tabla PLE, de forma que las diferencias observadas se atribuyan solo a la cuantizacion de los pesos y no al embedding.
- Automatizacion de despliegue en entornos air-gapped: distribuir internamente un unico fichero de tabla con su SHA-256 conocido y montarlo sobre varias instancias del modelo sin acceso a HuggingFace.
- Auditoria de cadena de suministro: comprobar que la carga util coincide con la de los quants de Unsloth o con la variante RCO de ISTA-DASLab antes de autorizar un despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta datos de tamano, recuento de tensores y hashes: Q8_0 ocupa 54.400.261.120 bytes (50,66 GiB) e IQ4_NL 28.800.138.240 bytes (26,82 GiB), con una relacion de ~1,9x bytes por fila a favor de IQ4_NL. No hay cifras de latencia, throughput ni calidad de generacion asociadas a cada tabla.

## Requisitos de hardware

- La tabla es un tensor de host/lazy: no se copia a VRAM ni con `-ngl 999`. La VRAM solo debe dimensionarse para los pesos del quant correspondiente (tamano no disponible en la informacion proporcionada).
- RAM de host: ~50 GiB libres si se usa `--ple-io ram` con la tabla Q8_0, segun la recomendacion del autor; ~27 GiB en el caso de IQ4_NL.
- Disco: 50,66 GiB para `PLE_flash_Q8.gguf` y 26,82 GiB para `PLE_flash_IQ4_NL.gguf`. El autor senala que el repositorio reporta 28,8 GB, cantidad inferior a la suma de ambos ficheros.
- GPU: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible. Al no residir la tabla en VRAM, las GPU consumer no se ven penalizadas por su tamano, solo por los pesos del modelo.
- Opciones de despliegue: llama.cpp (parche `--ple-gguf` obligatorio, `master` en `c0fd78626` / build `b11714`) y Strata (`--ple-gguf` nativo, mas `--ple-io`, `--ple-row-cache`, `--ple-inflight`).
- En Strata es necesario un hard link con el nombre hermano (`Qwen3.8-Flash-Next-UD-Q4_K_XL-00002-of-00002.gguf`), que no consume bytes adicionales, porque el motor resuelve shards a partir del patron `NNNNN-of-MMMMM.gguf`.
- Latencia y throughput: no disponibles. Cualitativamente, con SSD lento el autor recomienda `--ple-io ram` o la tabla IQ4_NL para evitar lecturas aleatorias costosas.

## Comparativa con modelos similares

No se dispone de tablas PLE/Engram equivalentes de otros modelos en la informacion proporcionada. La comparacion relevante es entre las variantes del mismo artefacto y sus fuentes:

| Variante | Formato | Bytes | Bits/parametro | Uso recomendado | Disponibilidad |
|---|---:|---:|---:|---|---|
| `PLE_flash_Q8.gguf` (este repo) | Q8_0 | 54.400.261.120 (50,66 GiB) | ~8,5 | Lectura nativa en llama.cpp y Strata; maxima fidelidad | Publica, Apache 2.0 |
| `PLE_flash_IQ4_NL.gguf` (este repo) | IQ4_NL | 28.800.138.240 (26,82 GiB) | ~4,5 | Discos pequenos o SSD lento; mismos valores que la tabla incluida en los quants | Publica, Apache 2.0 |
| Shard `UD-Q6_K_XL-00003-of-00006.gguf` (Unsloth) | GGUF multi-shard | Incluye la tabla junto al resto de pesos | No disponible | Fuente original del Q8_0 reetiquetado | Publica |
| Tabla de `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF` | GGUF (variante RCO) | No disponible | No disponible | Alternativa de la misma familia | Publica |

## Limitaciones y advertencias

- No es un modelo ejecutable de forma autonoma: solo funciona emparejado con los quants que esperan un segundo shard y declaran `split.count > 1`.
- Riesgo critico de mezcla: nunca debe combinarse una tabla PLE con pesos de otro checkpoint o fine-tune distinto. El autor lo marca como advertencia explicita; los valores no son intercambiables.
- llama.cpp no soporta esta tabla en `master` sin parche: requiere aplicar `ple-gguf.patch` (3 ficheros, ~16 lineas) contra `c0fd78626` / build `b11714`. Si se omite `--ple-gguf`, el motor buscara `…-00002-of-00002.gguf` junto al fichero del modelo y fallara.
- Existen tablas en FP8 (E4M3) en otros repositorios, pero llama.cpp carece de tipo FP8: solo son utilizables desde Strata.
- Coste de E/S: Q8_0 supone ~1,9x bytes por fila respecto a IQ4_NL. En SSD lento, usar la tabla cuantizada o reservar ~50 GiB de RAM para `--ple-io ram`.
- El repositorio reporta 28,8 GB de tamano frente a los 50,66 GiB del fichero Q8_0 y los 26,82 GiB del IQ4_NL; conviene verificar el espacio real necesario antes de descargar.
- Sin validacion de la comunidad: 0 descargas y 0 likes, creado y actualizado el 2026-10-17 con unos 20 minutos de diferencia. No hay benchmarks ni evaluaciones independientes del artefacto.
- Idiomas declarados en/zh: es previsible un rendimiento inferior en castellano y sesgos heredados del corpus del checkpoint base, aunque no se aportan datos concretos al respecto.
- Licencia Apache 2.0 para el repositorio, pero la licencia del checkpoint base Qwen3.8-Flash-Next no se detalla en la informacion disponible; conviene confirmarla antes de un uso comercial.
- No hay informacion sobre longitud de contexto, tool calling, agentes ni capacidades multimodales del modelo base, por lo que no deben asumirse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-PLE-tables-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Quant asociado UD-Q4_K_XL: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-UD-Q4_K_XL-PLE-GGUF
- Quant asociado UD-IQ4_XS: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-UD-IQ4_XS-PLE-GGUF
- Quant asociado UD-Q3_K_XL: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-UD-Q3_K_XL-PLE-GGUF
- Quant asociado UD-IQ3_XXS: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-UD-IQ3_XXS-PLE-GGUF
- Variante RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Parche de llama.cpp: fichero `ple-gguf.patch` incluido en el repositorio (no se proporciona URL externa del upstream)
