# mduca771/Qwen3.8-Flash-Next-UD-Q3_K_XL-PLE-GGUF

## Resumen

Este repositorio no contiene un modelo nuevo, sino una redistribución reempaquetada de las cuantizaciones GGUF de **Qwen3.8-Flash-Next**, un modelo de arquitectura `qwen4exp` con 125B parámetros en un mezcla de expertos (MoE) más una tabla de embeddings n-gram por capa (PLE, *per-layer embedding*) de 51,2 B parámetros con forma `[160, 320001536]`. El trabajo del autor, `mduca771`, consiste en separar esa tabla PLE del resto de los pesos y publicarla como un GGUF independiente, de forma que una única copia de la tabla sirva para las cinco cuantizaciones de la familia en lugar de duplicarse dentro de cada una.

El problema que resuelve es puramente de distribución y almacenamiento: la tabla PLE es byte a byte idéntica en todas las cuantizaciones del mismo checkpoint, pero ocupa entre 26,82 GiB (IQ4_NL) y 95,37 GiB (BF16). Al extraerla, el conjunto completo de cuantizaciones de FLASH-Next pasa de 460,6 GB a 342,2 GB con la tabla en Q8_0, un ahorro de unos 118 GB de disco y de ancho de banda de descarga.

La relevancia es operativa: permite servir un MoE de 125B con la tabla n-gram respaldada por `mmap` en RAM de host (nunca en VRAM) y cambiar de cuantización del modelo sin volver a descargar la tabla. El precio es que `llama.cpp` upstream no expone la API necesaria para cargar un segundo GGUF desde la CLI, por lo que el repositorio incluye un parche de tres archivos y ~16 líneas que añade la opción `--ple-gguf`. El motor Strata lo soporta de forma nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp`: mezcla de expertos (MoE) de 125B + tabla de embeddings n-gram por capa (PLE) de 51,2 B |
| Parametros totales | 125B en el MoE (segun la model card) + 51.200.245.760 en la tabla PLE (160 x 320.001.536); en conjunto ~176,2B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card no la declara; los ejemplos de uso emplean `-c 4096`) |
| Tipos de cuantizacion | Este repo: `UD-Q3_K_XL`. Repositorio de origen: ademas `UD-Q5_K_XL`, `UD-Q6_K_XL` y `Q8_0`. Tabla PLE aparte en IQ4_NL, Q8_0, BF16 y FP8 E4M3 (esta ultima solo para Strata) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en 2 shards (`-00001-of-00002.gguf`, 61.186.215.296 B / 56,98 GiB, 1223 tensores) + GGUF separado con la tabla PLE |

## Arquitectura y entrenamiento

La arquitectura `qwen4exp` combina un transformer con mezcla de expertos de 125B parámetros y un mecanismo poco habitual: una tabla de embeddings n-gram por capa (`per_layer_token_embd.weight`, forma `[160, 320001536]`) que actua como memoria de patrones de tokens consultada por capa, en la linea de las propuestas de *engram* o n-gram lookup. El checkpoint se distribuye en GGUF a traves de `unsloth/Qwen3.8-Flash-Next-GGUF`, y existe una variante RCO del mismo checkpoint publicada por ISTA-DASLab. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo etapas de RLHF o DPO: la model card de este repositorio solo documenta el reempaquetado, no el entrenamiento.

La innovacion tecnica de este artefacto concreto es el proceso de division, no el modelo. El autor copia los bytes en crudo: el bloque de metadatos GGUF se replica literalmente salvo `split.count` (de 3/4 a 2) y los tensores se copian slot a slot con alineacion de 32 bytes, lo que permite arrastrar tipos exoticos (`Q2_0`, `NVFP4`, `IQ2_S`) sin conocer su *block layout*. La verificacion es fuerte: los 1223 tensores no-PLE resultantes son SHA-256 identicos al shard original, comparados tensor a tensor, y se hizo una prueba de ida y vuelta sobre un modelo ya dividido que reprodujo el archivo byte a byte. El archivo PLE es una copia re-etiquetada de la tabla incluida en las cuantizaciones de Unsloth (payload identico en `UD-Q5_K_XL`, `UD-Q6_K_XL` y `Q8_0`; origen `UD-Q6_K_XL-00003-of-00006.gguf`, SHA-256 `34efd79a80a1ce540a517a5d56171924b66ce1c38b04c904f17ad6d8ef17cf20`). No se recuantizo ningun peso.

## Capacidades

- Generacion de texto en ingles y chino; son los dos unicos idiomas declarados en la model card.
- Razonamiento y conocimiento general propios del checkpoint Qwen3.8-Flash-Next, del que este repositorio es una copia byte-identica en sus 1223 tensores no-PLE.
- Consulta de una tabla n-gram/PLE de 51,2 B parametros por capa, disenada para capturar patrones de secuencias repetidas.
- Capacidad de ejecutarse con la tabla PLE en RAM de host mediante `mmap` (tensor perezoso), sin consumir VRAM incluso con `-ngl 999`.
- Soporte de tool calling, modo thinking, vision o audio: no disponible; la model card no documenta ninguna capacidad funcional de ese tipo.
- Soporte multilingue mas alla de en/zh: no disponible.
- Compatibilidad de despliegue con `llama.cpp` (previa aplicacion del parche `ple-gguf.patch`) y con el motor Strata, que lee la PLE de forma nativa.

## Casos de uso

- Despliegue on-premise de un MoE de 125B en un solo servidor: el shard principal son 56,98 GiB, de modo que cabe completo en una GPU de 80 GB (A100/H100) con la tabla PLE en RAM de host, sin necesidad de infraestructura multi-nodo.
- Servicio de inferencia en ingles y chino: `llama-server` con `--ple-gguf` expone el modelo como endpoint HTTP para aplicaciones de generacion de texto o traduccion en/zh.
- Investigacion sobre tablas n-gram y PLE: al estar la tabla separada, se puede hacer ablacion entre IQ4_NL (26,82 GiB), Q8_0 (50,66 GiB) y BF16 (95,37 GiB) manteniendo el mismo shard de pesos, aislando el efecto de la precision de la tabla en la perplejidad.
- Evaluacion comparativa de cuantizaciones: un mismo equipo puede descargar una sola tabla PLE y probar `UD-Q3_K_XL`, `UD-Q5_K_XL`, `UD-Q6_K_XL` y `Q8_0` sin duplicar 26-95 GiB por variante.
- Distribucion interna de artefactos: equipos que sirven el modelo a varios perfiles de hardware mantienen una unica copia de la tabla en un almacenamiento compartido y solo cambian el shard del modelo.
- Entornos con RAM limitada mediante Strata: el motor admite `--ple-io direct|mmap|ram`, `--ple-row-cache` y `--ple-inflight`, lo que permite ajustar el consumo de la tabla cuando no se pueden reservar 50 GiB de RAM.
- Pipelines de empaquetado y espejo de modelos: el metodo de copia byte a byte con verificacion SHA-256 por tensor sirve de referencia para dividir otros checkpoints con tablas auxiliares de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion, y tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM para el shard principal: 56,98 GiB con `UD-Q3_K_XL` si se offloada por completo (`-ngl 99`). No cabe en una RTX 4090 de 24 GB ni en una unica GPU de 48 GB.
- GPU recomendadas para offload completo: A100 80 GB, H100 80 GB, o dos A6000 de 48 GB. Con 2x RTX 4090 (48 GB) hay que reducir `-ngl` y aceptar offload parcial a CPU.
- La tabla PLE no ocupa VRAM: se crea como tensor perezoso respaldado por `mmap` en host. Presupuesto de RAM adicional de 26,82 GiB con IQ4_NL, 50,66 GiB con Q8_0 o 95,37 GiB con BF16.
- Inferencia solo en CPU: ~57 GiB del shard principal mas la tabla PLE, es decir, del orden de 84 GiB de RAM con IQ4_NL y ~108 GiB con Q8_0.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`) con el parche de este repositorio aplicado sobre `master` en el commit `c0fd78626`, build `b11714`; y Strata (`--serve`) con soporte nativo de `--ple-gguf` y `--ple-io`.
- Restricciones de ejecucion: no usar `--lazy-mode off`, ya que forzaria la tabla a un tensor no perezoso; mantener el flag `--ple-gguf` siempre, porque sin el `llama.cpp` deriva el nombre del segundo shard como `...-00002-of-00002.gguf`; y no renombrar el archivo, porque el descubrimiento de shards es por nombre.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `mduca771/Qwen3.8-Flash-Next-UD-Q3_K_XL-PLE-GGUF` (este) | 125B MoE + 51,2B PLE | no disponible | GGUF en 2 shards + PLE en GGUF aparte | apache-2.0 | Requiere el parche `--ple-gguf` en `llama.cpp`; 1223 tensores verificados por SHA-256 |
| `unsloth/Qwen3.8-Flash-Next-GGUF` | mismo checkpoint | no disponible | GGUF con la tabla PLE embebida | no disponible en la informacion | Funciona con `llama.cpp` upstream sin parche, pero duplica la tabla en cada cuantizacion |
| `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF` | mismo checkpoint (familia RCO) | no disponible | GGUF | no disponible en la informacion | Variante RCO del mismo checkpoint; referenciada por el autor como set hermano |

No se dispone en la informacion proporcionada de datos de otros modelos comparables (parametros activos, contexto, benchmarks) que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo original: es un reempaquetado de las cuantizaciones de Unsloth. Cualquier limitacion del checkpoint Qwen3.8-Flash-Next se hereda intacta.
- Requiere aplicar un parche a `llama.cpp` (`ple-gguf.patch`, tres archivos, ~16 lineas) sobre el commit `c0fd78626`, build `b11714`. El autor advierte que es lo bastante pequeno para reaplicarlo a mano, pero cualquier cambio upstream en `common/common.h`, `common/arg.cpp` o `common/common.cpp` puede romperlo.
- Ambiguedad de metadatos: el shard conserva `split.count = 2` pero se abre como modelo completo junto a la PLE. Strata rechaza un archivo suelto cuyo metadato diga `split.count > 1`, de ahi la necesidad de usar `--ple-gguf` en ambos motores y de respetar el patron de nombre `<nombre>-NNNNN-of-MMMMM.gguf`.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-10-17. No hay informes independientes de calidad ni de reproducibilidad mas alla de la verificacion SHA-256 que declara el autor.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano ni de otras lenguas.
- Riesgo de alucinacion y sesgos: no documentados en la model card; al no haber evaluacion publicada, no se pueden acotar.
- Consumo de recursos elevado: incluso en la cuantizacion mas agresiva disponible aqui (Q3_K_XL), el shard principal son 56,98 GiB, fuera del alcance de GPUs de consumo.
- La licencia apache-2.0 cubre el artefacto tal como se publica, pero conviene verificar la licencia del checkpoint base antes de un uso comercial en produccion, ya que este repositorio no la explicita.
- Los resultados de busqueda web asociados a esta consulta no contenian informacion tecnica relevante sobre el modelo y se han descartado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-UD-Q3_K_XL-PLE-GGUF
- Tablas PLE en GGUF: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-PLE-tables-GGUF
- Modelo base (cuantizaciones Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Variante RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Parche `ple-gguf.patch`: incluido en los archivos del repositorio de HuggingFace
- `llama.cpp` (referencia del parche: `master` en el commit `c0fd78626`, build `b11714`): https://github.com/ggml-org/llama.cpp
- Motor Strata: no disponible (el autor no publica enlace en la model card)
