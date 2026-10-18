# mduca771/Qwen3.8-Flash-Next-UD-Q4_K_XL-PLE-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del checkpoint Qwen3.8-Flash-Next, un modelo de arquitectura `qwen4exp` formado por un MoE de 125 B de parámetros más una tabla de embeddings n-gram por capa (PLE, `per_layer_token_embd.weight`) de 51,2 B de parámetros con forma `[160, 320001536]`. Lo publica el usuario mduca771 a partir de los cuantizados de `unsloth/Qwen3.8-Flash-Next-GGUF`, y el resultado es un conjunto de dos shards (`Qwen3.8-Flash-Next-UD-Q4_K_XL-00001-of-00002.gguf`, 82.534.516.096 B / 76,87 GiB) que contiene los 1223 tensores del modelo pero excluye la tabla PLE.

El problema que resuelve es de empaquetado, no de modelado: la tabla PLE es byte a byte idéntica en todas las cuantizaciones del mismo checkpoint, de modo que incluirla en cada variante duplica entre 26,82 y 95,37 GiB por fichero. Al separarla en un GGUF independiente (`mduca771/Qwen3.8-Flash-Next-PLE-tables-GGUF`), una sola tabla sirve para todas las cuantizaciones y el conjunto completo pasa de 460,6 GB a 342,2 GB con la tabla en Q8_0.

Es relevante para quien despliegue modelos MoE grandes en llama.cpp o en el motor Strata, porque demuestra un patrón de distribución (pesos + tabla de embeddings compartida) y porque requiere un parche local de 16 líneas que añade la opción `-pg, --ple-gguf` al CLI de llama.cpp. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino. No se han publicado métricas de rendimiento ni de calidad en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen4exp`: transformer MoE con tabla de embeddings n-gram por capa (PLE) |
| Parámetros totales | 125 B (MoE) + 51,2 B de tabla PLE (`per_layer_token_embd.weight`, forma `[160, 320001536]`) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos del modelo: `UD-Q4_K_XL` (cuantización dinámica de Unsloth). Tabla PLE: `IQ4_NL` (90 B/fila, 26,82 GiB), `Q8_0` (170 B/fila, 50,66 GiB), FP8 E4M3 (160 B/fila, 51,2 GB, solo Strata), BF16 (320 B/fila, 95,37 GiB) |
| Idiomas soportados | `en`, `zh` (según metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; 2 shards para el modelo (`-00001-of-00002.gguf`, `-00002-of-00002.gguf`) + GGUF independiente para la tabla PLE |

| Dato del fichero | Valor |
|---|---|
| Tamaño del shard 1 | 82.534.516.096 B (76,87 GiB) |
| Tensores en el shard 1 | 1223 (todos los del modelo, sin `per_layer_token_embd.weight`) |
| Precisión de origen | `unsloth/Qwen3.8-Flash-Next-GGUF` → `UD-Q4_K_XL`, revisión fijada en el momento de la extracción |
| Verificación | SHA-256 idéntico tensor a tensor en los 1223 tensores no PLE; SHA-256 del fichero PLE `34efd79a80a1ce540a517a5d56171924b66ce1c38b04c904f17ad6d8ef17cf20` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint base sigue la arquitectura `qwen4exp`, que combina un mezcla de expertos (MoE) de 125 B de parámetros con una tabla de embeddings por capa de tipo n-gram / engram: 51,2 B de parámetros organizados en 160 filas de 320.001.536 elementos. Esa tabla actúa como memoria de secuencias y se crea en tiempo de carga como tensor perezoso respaldado por mmap en memoria de host, de modo que no se mueve a VRAM ni con `-ngl 999`. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO: esos datos no están disponibles.

Este repositorio concreto no reentrena ni recuantiza nada. El procedimiento descrito es una copia cruda de bytes: se copia el bloque de metadatos GGUF literalmente salvo `split.count` (de 3/4 a 2) y se copian las cargas útiles tensor a tensor con alineación de 32 bytes, de forma que tipos exóticos (`Q2_0`, `NVFP4`, `IQ2_S`, etc.) funcionan sin conocer su layout de bloques. La tabla PLE es una copia reetiquetada de la que se distribuye dentro de los cuantizados de Unsloth, con carga útil idéntica entre `UD-Q5_K_XL`, `UD-Q6_K_XL` y `Q8_0`. La variante RCO del conjunto pertenece a ISTA-DASLab (`ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF`), de la misma familia de checkpoints.

La innovación técnica del empaquetado es la separación de la tabla compartida; la del motor es el soporte de dos GGUF como splits adicionales mediante `llama_model_load_from_splits()`, que el CLI de llama.cpp no expone de serie y que aquí se resuelve con el parche `ple-gguf.patch` (3 ficheros, unas 16 líneas, aplicable sobre `master` en el commit `c0fd78626`, build `b11714`).

## Capacidades

- Generación de texto autorregresiva con un modelo MoE de 125 B de parámetros en cuantización `UD-Q4_K_XL`.
- Memoria n-gram por capa (PLE) de 51,2 B de parámetros, compartida entre cuantizaciones y cargada desde un GGUF independiente.
- Ejecución en llama.cpp mediante `llama-cli` y `llama-server` con el parche `--ple-gguf` (API HTTP compatible con el servidor estándar).
- Ejecución en el motor Strata, que lee la PLE de forma nativa y admite `--ple-io direct|mmap|ram`, `--ple-row-cache` y `--ple-inflight`, además de perfiles de expertos (`--expert-profile`).
- Cobertura lingüística declarada: inglés y chino.
- Interoperabilidad de un mismo checkpoint a través de cinco cuantizaciones, reutilizando una única tabla PLE.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades de visión, audio o modo "thinking": no disponible en la información.

## Casos de uso

- Asistencia interna autoalojada con dos GPU: el shard de pesos ocupa 76,87 GiB y la PLE queda en RAM de host vía mmap, de modo que un servidor con 2 GPU de 80 GB puede servir `llama-server` con la tabla en Q8_0 sin consumir VRAM adicional.
- Servicio multi-cuantización con una sola tabla: mantener `UD-Q4_K_XL` para tráfico masivo y `Q8_0` para tareas de calidad, apuntando ambos al mismo `PLE_flash_Q8.gguf`; se evita descargar y almacenar la tabla varias veces (de 460,6 GB a 342,2 GB en el conjunto completo).
- Sustitución de un despliegue GGUF monolítico en llama.cpp: al ser una copia byte a byte verificada por SHA-256, los 1223 tensores son idénticos a los del cuantizado de Unsloth, por lo que se puede migrar sin recalibrar ni recalcular nada.
- Investigación sobre MoE y embeddings por capa: permite medir el efecto de la PLE con distintas precisiones (IQ4_NL frente a Q8_0 frente a BF16) manteniendo los pesos del modelo constantes, algo que un empaquetado monolítico no facilita.
- Atención técnica bilingüe inglés-chino: únicamente si el checkpoint base rinde en esos idiomas, que son los declarados; útil para documentación y soporte de producto en ambos idiomas.
- Despliegue en máquinas con poca VRAM usando Strata y perfiles de expertos: la PLE se puede leer con `--ple-io mmap` (o `direct`) y cachear filas con `--ple-row-cache`, lo que reduce la presión de memoria frente a cargar la tabla completa.
- Distribución en entornos con ancho de banda limitado o espejos internos: servir un espejo propio con los dos shards de pesos y una única tabla compartida simplifica la gestión de artefactos y las comprobaciones de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web realizada no devolvió resultados relacionados con el modelo. Al tratarse de una copia byte a byte de los cuantizados de Unsloth, el comportamiento esperado es el del checkpoint base en `UD-Q4_K_XL`, pero no hay cifras que lo respalden.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 76,87 GiB solo para el shard de pesos; hay que sumar caché KV y buffers, por lo que no cabe en una única GPU de 80 GB (los 80 GB nominales equivalen a unos 74,5 GiB útiles). Estimación derivada del tamaño de fichero, no medida.
- VRAM para la PLE: 0 GiB con la configuración por defecto; la tabla se crea como tensor perezoso mmap en host y no se mueve a VRAM ni con `-ngl 999`.
- RAM / disco para la PLE: 50,66 GiB en Q8_0, 26,82 GiB en IQ4_NL, 51,2 GB en FP8 E4M3 (solo Strata) y 95,37 GiB en BF16.
- GPU recomendadas: 2× H100 80 GB o 2× A100 80 GB para carga completa en VRAM; alternativa con offload parcial de capas a CPU en configuraciones menores.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090; solo es viable con descarga parcial de capas (`-ngl` reducido), con throughput muy inferior y dependiente del ancho de banda de CPU-RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con el parche `--ple-gguf` aplicado; Strata con `--ple-gguf`, `--ple-io`, `--ple-row-cache` y `--ple-inflight`. Soporte en vLLM, TGI u Ollama: no disponible en la información.
- Latencia y throughput: no disponibles. No se han publicado medidas.
- Advertencias de configuración: no usar `--lazy-mode off` (dejar `-lzm auto`), conservar el nombre exacto `…-00001-of-00002.gguf` para el descubrimiento de shards por nombre, y pasar siempre `--ple-gguf`, porque sin él llama.cpp buscará `…-00002-of-00002.gguf` junto al modelo.

## Comparativa con modelos similares

| Repositorio | Parámetros | Contexto | Cuantizaciones | Tabla PLE | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|---|
| `mduca771/Qwen3.8-Flash-Next-UD-Q4_K_XL-PLE-GGUF` (este) | 125 B MoE + 51,2 B PLE | no disponible | `UD-Q4_K_XL` + PLE en IQ4_NL/Q8_0/FP8/BF16 | Separada, compartida entre cuantizaciones | Apache 2.0 | GGUF (2 shards + PLE) | Requiere parche en llama.cpp; 0 descargas, sin validación comunitaria |
| `unsloth/Qwen3.8-Flash-Next-GGUF` | 125 B MoE + 51,2 B PLE | no disponible | Familia UD completa (`UD-Q4_K_XL`, `UD-Q5_K_XL`, `UD-Q6_K_XL`, `Q8_0`, entre otras) | Incluida dentro de cada cuantización | Apache 2.0 (según el modelo base) | GGUF | Origen de este repositorio; funciona con llama.cpp sin parche; ocupa más disco por duplicar la tabla |
| `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF` | 125 B MoE + 51,2 B PLE | no disponible | Variante GSQ-RCO | Incluida (misma familia de checkpoint) | no disponible en la información | GGUF | Misma familia de checkpoint, tratamiento de cuantización distinto; sin datos de rendimiento publicados aquí |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~125 B con embeddings n-gram por capa) en el material proporcionado.

## Limitaciones y advertencias

- El repositorio no aporta ninguna mejora de calidad: es un reempaquetado byte a byte. La pérdida de precisión de `UD-Q4_K_XL` frente a BF16 sigue presente.
- Requiere aplicar un parche local a llama.cpp (`ple-gguf.patch`, 3 ficheros, ~16 líneas) sobre el commit `c0fd78626` (build `b11714`); en versiones posteriores el parche puede no aplicar y hay que rehacerlo a mano.
- El flag `--ple-gguf` es obligatorio: sin él, llama.cpp deduce el nombre del segundo shard a partir del nombre del modelo y buscará `…-00002-of-00002.gguf`.
- No usar `--lazy-mode off`: la tabla está pensada como tensor perezoso mmap en host.
- El nombre de fichero `…-00001-of-00002.gguf` es funcional, no cosmético: el descubrimiento de shards se hace por nombre.
- Strata deriva los shards del patrón `<nombre>-NNNNN-of-MMMMM.gguf` y rechaza un fichero abierto como modelo completo cuyo metadato declare `split.count > 1` (error del tipo "is shard 1 of 2, but it was opened as a whole model").
- Idiomas declarados únicamente `en` y `zh`; el rendimiento en castellano no está verificado ni documentado.
- Sin benchmarks, sin descargas y sin likes: no hay evidencia comunitaria de funcionamiento más allá de la verificación SHA-256 de los tensores.
- Riesgo de alucinación y sesgos: inherentes al checkpoint base; no se documenta ninguna evaluación de sesgo ni de seguridad en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero la model card no detalla condiciones adicionales del checkpoint original ni de los pesos de Qwen; conviene revisar los términos del modelo base antes de producción.
- Huella de almacenamiento alta: 342,2 GB para el conjunto completo con PLE en Q8_0 (460,6 GB sin la optimización), y 76,87 GiB de pesos que no caben en una sola GPU de 80 GB.
- Casos no cubiertos: no hay información sobre soporte en vLLM, TGI u Ollama, ni sobre tool calling, agentes o modalidades distintas del texto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-UD-Q4_K_XL-PLE-GGUF
- Tablas PLE compartidas: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-PLE-tables-GGUF
- Modelo base (cuantizados de Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Variante GSQ-RCO de la misma familia (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Parche de llama.cpp: `ple-gguf.patch`, incluido en el repositorio del modelo (no se proporciona URL directa en la información disponible)
- llama.cpp upstream: referenciado en la model card en el commit `c0fd78626`, build `b11714`; no se proporciona URL en la información disponible
- Búsqueda web: no se encontraron resultados relevantes para este modelo; los únicos resultados devueltos corresponden a SchoolMouv (https://www.schoolmouv.fr/), sin relación con el modelo ni con IA open source
