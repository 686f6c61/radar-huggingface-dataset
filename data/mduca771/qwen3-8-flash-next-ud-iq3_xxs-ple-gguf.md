# mduca771/Qwen3.8-Flash-Next-UD-IQ3_XXS-PLE-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una redistribución en GGUF de **Qwen3.8-Flash-Next**, un modelo de arquitectura `qwen4exp` de 125.000 millones de parámetros en formato MoE (mezcla de expertos) que incorpora además una tabla de embeddings por capa de tipo n-gram de 51.200 millones de parámetros, denominada PLE (`per_layer_token_embd.weight`, con forma `[160, 320001536]`). Lo publica el usuario `mduca771` partiendo de los cuantizados de Unsloth (`unsloth/Qwen3.8-Flash-Next-GGUF`), sin recuantizar pesos: el trabajo consiste en separar la tabla PLE en un GGUF independiente y volver a empaquetar el resto del modelo en un único shard.

El problema que resuelve es puramente de ingeniería de distribución. La tabla PLE es idéntica byte a byte en todos los cuantizados del mismo checkpoint, de modo que incluirla dentro de cada fichero duplica decenas de gigabytes por variante. Al servirla una sola vez, el conjunto FLASH-Next pasa de 460,6 GB a 342,2 GB de disco con la tabla en Q8_0. El fichero de este repositorio contiene los 1223 tensores del modelo en cuantización UD-IQ3_XXS y ocupa 53.161.685.376 bytes (49,51 GiB).

Es relevante ahora porque documenta un patrón de empaquetado poco habitual (modelo + tabla auxiliar en GGUF separados) y porque requiere un parche local en llama.cpp que añade la opción `--ple-gguf`; además, el motor Strata lee la tabla PLE de forma nativa. Licencia declarada apache-2.0 e idiomas en y zh.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp`: transformer MoE con tabla de embeddings por capa (PLE, engram/n-gram) |
| Parametros totales | 125.000 millones (MoE) + 51.200 millones en la tabla PLE |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo: UD-IQ3_XXS. Tabla PLE: IQ4_NL, Q8_0, FP8 (E4M3, solo Strata) y BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, 2 shards (modelo + tabla PLE separada) |
| Tamano del fichero de modelo | 53.161.685.376 B (49,51 GiB), 1223 tensores |
| Forma de la tabla PLE | `[160, 320001536]` |
| Modelo base | `unsloth/Qwen3.8-Flash-Next-GGUF` (revision fijada en el momento de la extraccion) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-17 |

## Arquitectura y entrenamiento

La arquitectura combina una torre MoE de 125.000 millones de parámetros con una tabla PLE de 51.200 millones de parámetros repartida por capa, que actúa como mecanismo de embeddings n-gram/engram. La tabla tiene 160 filas de 320.001.536 posiciones cada una y se materializa como tensor perezoso respaldado por mmap en memoria de host, de forma que nunca se traslada a VRAM aunque se configure `-ngl 999`. El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO: esos datos no están disponibles en la información proporcionada.

El repositorio es un trabajo de reempaquetado, no de entrenamiento. El split se hizo como copia cruda de bytes: el bloque de metadatos GGUF se copia literalmente salvo `split.count` (de 3/4 a 2) y las cargas de tensores se copian ranura a ranura con alineación de 32 bytes, lo que permite conservar tipos exóticos (`Q2_0`, `NVFP4`, `IQ2_S`) sin conocer su layout de bloques. La verificación es tensor a tensor: los 1223 tensores no PLE son SHA-256 idénticos a los del shard original, y se hizo una prueba de ida y vuelta sobre un modelo ya dividido que reprodujo el resultado byte a byte. El fichero PLE es una copia re-etiquetada de la tabla incluida en los cuantizados de Unsloth (payload idéntico en `UD-Q5_K_XL`, `UD-Q6_K_XL` y `Q8_0`; procedente de `UD-Q6_K_XL-00003-of-00006.gguf`, SHA-256 `34efd79a80a1ce540a517a5d56171924b66ce1c38b04c904f17ad6d8ef17cf20`).

## Capacidades

- Generación de texto en inglés y chino; no se documentan otras lenguas.
- Razonamiento de múltiples pasos y matemáticas: no documentado en la información disponible.
- Generación de código: no documentado en la información disponible.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente: no documentado en la información disponible.
- Visión, audio o modo thinking explícito: no documentado en la información disponible.
- Inferencia MoE con tabla PLE resuelta por búsqueda n-gram por capa, con la tabla residente en memoria de host vía mmap.
- Ejecución en llama.cpp mediante el parche `--ple-gguf` (o vía API C `llama_model_load_from_splits()`) y en el motor Strata, que además soporta `--ple-io direct|mmap|ram`, `--ple-row-cache` y `--ple-inflight`.

## Casos de uso

- Despliegue de una flota con varios cuantizados del mismo modelo: al descargar la tabla PLE una sola vez y reutilizarla entre quants, el consumo agregado de disco baja de 460,6 GB a 342,2 GB con tabla Q8_0, lo que simplifica la gestión de artefactos en un registry interno.
- Servicio de inferencia en llama.cpp: `llama-server -m ...-00001-of-00002.gguf --ple-gguf PLE_flash_Q8.gguf -ngl 99` permite servir el modelo dejando la tabla de 51.200 millones de parámetros en RAM de host, lo que reduce la VRAM necesaria frente a un empaquetado monolítico.
- Inferencia en Strata con perfilado de expertos: `--pack`, `--native` y `--ple-gguf` junto con `--expert-profile` permiten explorar políticas de caché de filas PLE (`--ple-row-cache`, `--ple-inflight`) para ajustar latencia en función del patron de acceso a la tabla.
- Investigación sobre arquitecturas híbridas MoE + engram: el repositorio separa físicamente ambos componentes, lo que facilita ablaciones sustituyendo la tabla PLE (IQ4_NL, Q8_0, BF16) sin tocar los pesos del modelo.
- Evaluación de cuantización agresiva en hardware de consumo: UD-IQ3_XXS a 49,51 GiB permite medir la degradación de calidad frente a `UD-Q5_K_XL` o `Q8_0` de la misma familia manteniendo constante la tabla PLE.
- Procesamiento bilingüe inglés-chino: casos de traducción y generación de documentación técnica entre ambos idiomas, que son los únicos declarados en la model card.
- Archivado reproducible: los SHA-256 por fichero (LFS oid del Hub) y la verificación tensor a tensor permiten auditar que un artefacto redistribuido coincide con el checkpoint original de Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 49,51 GiB solo para los pesos del modelo en UD-IQ3_XXS, más caché KV y overhead del runtime (no cuantificado en la información disponible). La tabla PLE no consume VRAM en el modo documentado.
- Memoria de host para la tabla PLE, según formato: IQ4_NL 28,8 GB (26,82 GiB); Q8_0 54,4 GB (50,66 GiB); BF16 102,4 GB (95,37 GiB); FP8 (E4M3) 51,2 GB, solo en Strata porque llama.cpp no tiene tipo FP8.
- GPU recomendadas: una A100 80 GB o H100 80 GB cubren los pesos con margen para caché KV. En consumer, dos RTX 5090 de 32 GB (64 GB) o una RTX 6000 Ada de 48 GB quedan justas; dos RTX 4090 de 24 GB (48 GB) no alcanzan los 49,51 GiB de pesos.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`) con el parche `ple-gguf.patch` aplicado, o el motor Strata con soporte nativo de `--ple-gguf`. vLLM, TGI, Ollama y llama.cpp sin parchear no están documentados para este formato.
- Aviso de configuración: no usar `--lazy-mode off`, porque la tabla PLE se crea como tensor perezoso respaldado por mmap en host y debe quedar fuera de VRAM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto de modelos comparables en la información proporcionada. La comparación posible se limita a las variantes documentadas de la misma familia:

| Alternativa | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Este repositorio (UD-IQ3_XXS + PLE separada) | 125B MoE + 51,2B PLE | GGUF, 2 shards | apache-2.0 | 49,51 GiB de pesos; requiere parche en llama.cpp |
| `unsloth/Qwen3.8-Flash-Next-GGUF` | mismo checkpoint | GGUF, 3-4 shards | no disponible | Incluye el PLE dentro de cada cuantizado |
| `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF` | mismo checkpoint | GGUF | no disponible | Variante RCO del mismo conjunto |
| `mduca771/Qwen3.8-Flash-Next-PLE-tables-GGUF` | 51,2B (solo tabla) | GGUF | apache-2.0 | Tabla reutilizable entre cuantizados |
| Modelos de tamaños similares de otros autores | no disponible | no disponible | no disponible | Sin datos de rendimiento comparables |

## Limitaciones y advertencias

- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, publicado el 2026-10-17. No hay evidencia de terceros sobre su funcionamiento.
- Requiere un parche local de llama.cpp de 3 archivos y unas 16 líneas (`common/common.h`, `common/arg.cpp`, `common/common.cpp`) que añade `-pg, --ple-gguf`. Está probado contra `master` en el commit `c0fd78626`, build `b11714`; cambios posteriores en upstream pueden romper su aplicación.
- Mantener siempre el flag `--ple-gguf`: sin él, llama.cpp deriva el nombre del segundo shard del nombre del modelo y buscará `…-00002-of-00002.gguf`.
- El nombre del fichero es funcional, no cosmético: `…-00001-of-00002.gguf` es necesario para el descubrimiento de shards basado en nombre. Strata rechaza un fichero suelto cuyo metadato declare `split.count > 1` con el error "is shard 1 of 2, but it was opened as a whole model".
- No usar `--lazy-mode off`; la tabla PLE debe permanecer como tensor perezoso en host.
- UD-IQ3_XXS es una cuantización agresiva de 3 bits; cabe esperar degradación de calidad frente a `UD-Q5_K_XL`, `UD-Q6_K_XL` o `Q8_0` de la misma familia, aunque no se publican métricas que la cuantifiquen.
- No hay información sobre datos de entrenamiento, alineación, sesgos ni tasas de alucinación del modelo base. Cualquier uso en producción debe evaluarse empíricamente antes de desplegarse.
- Idiomas declarados únicamente en y zh; el comportamiento en castellano u otras lenguas no está documentado.
- Licencia apache-2.0 declarada por el autor del repositorio de cuantización sobre un derivado de pesos de Unsloth; conviene verificar los términos del checkpoint original antes de un uso comercial.
- El motor Strata no soporta el tipo FP8 en llama.cpp, por lo que la tabla PLE en FP8 solo es utilizable en Strata.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-UD-IQ3_XXS-PLE-GGUF
- Tabla PLE independiente: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-PLE-tables-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Variante RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
