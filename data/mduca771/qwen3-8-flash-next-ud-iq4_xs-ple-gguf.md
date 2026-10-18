# mduca771/Qwen3.8-Flash-Next-UD-IQ4_XS-PLE-GGUF

## Resumen

`mduca771/Qwen3.8-Flash-Next-UD-IQ4_XS-PLE-GGUF` es un repositorio de artefactos GGUF, no un modelo entrenado desde cero: contiene una copia reempaquetada de la cuantización `UD-IQ4_XS` de Unsloth del modelo **Qwen3.8-Flash-Next**, con la particularidad de que la tabla de embeddings n-gram por capa (PLE, *per-layer embedding*) se ha extraído a un GGUF independiente. El modelo subyacente emplea la arquitectura `qwen4exp`: un Mezcla de Expertos (MoE) de 125 B de parámetros más una tabla PLE de 51,2 B de parámetros con forma `[160, 320001536]`, lo que sitúa el total en unos 176,2 B de parámetros. Lo publica el usuario `mduca771` a partir de los quants de `unsloth/Qwen3.8-Flash-Next-GGUF`; el autor no es el desarrollador original del modelo.

El problema que resuelve este repositorio es de ingeniería y almacenamiento. La tabla PLE es idéntica byte a byte en todas las cuantizaciones del mismo checkpoint, de modo que incluirla dentro de cada quant duplica ~144 GB en un set de cinco cuantizaciones. Al servirla una sola vez, el conjunto FLASH-Next pasa de 460,6 GB a 342,2 GB con la tabla en Q8_0. El fichero principal de este repo ocupa 64.882.445.696 B (60,43 GiB) y contiene 1223 tensores, todos menos `per_layer_token_embd.weight`.

Es relevante ahora porque documenta un patrón poco habitual en el ecosistema GGUF (separar tensores estáticos compartidos entre cuantizaciones) y porque requiere soporte específico de motor: llama.cpp necesita un parche de tres archivos que añade `--ple-gguf`, mientras que el motor Strata lo lee de forma nativa. Los idiomas declarados son inglés y chino, la licencia es Apache 2.0 y no hay métricas de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp`: MoE con tabla de embeddings n-gram por capa (PLE / engram) |
| Parametros totales | 125 B (MoE) + 51,2 B (tabla PLE) = ~176,2 B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo: `UD-IQ4_XS` (Unsloth Dynamic). Tabla PLE por separado: IQ4_NL, Q8_0, BF16; FP8 (E4M3) solo en Strata. El set de origen incluye además UD-Q5_K_XL, UD-Q6_K_XL y Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF; fichero principal `Qwen3.8-Flash-Next-UD-IQ4_XS-00001-of-00002.gguf` de 64.882.445.696 B (60,43 GiB) con 1223 tensores, más un GGUF independiente para la tabla PLE |
| Tamano de la tabla PLE | 28,8 GB (IQ4_NL), 54,4 GB (Q8_0), 51,2 GB (FP8 E4M3), 102,4 GB (BF16) |
| Sharding | `split.count = 2`; el fichero se identifica como shard 1 de 2 |
| Modelo base | `unsloth/Qwen3.8-Flash-Next-GGUF` (revision fijada en el momento de la extraccion) |

## Arquitectura y entrenamiento

La arquitectura `qwen4exp` combina un transformer con MoE de 125 B de parámetros y una tabla de embeddings por capa de tipo n-gram/engram de 51,2 B de parámetros, con forma `[160, 320001536]`: 160 filas (una por capa o por slot de tabla) y 320.001.536 columnas, lo que sugiere un vocabulario n-gram mucho mayor que el vocabulario de tokens habitual. La tabla se crea como tensor perezoso respaldado por mmap en memoria host, de modo que no se mueve a VRAM ni con `-ngl 999`. Esta separación entre parámetros "densos" del MoE y una memoria n-gram explícita es la innovación técnica central de la familia.

Sobre el entrenamiento no hay información en la model card: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que sí está documentado es la procedencia de los artefactos: las cuantizaciones son de Unsloth (la variante RCO del set es de ISTA-DASLab) y **no se recuantizó ningún peso**. El reempaquetado es una copia de bytes en crudo: los metadatos GGUF se copian literalmente salvo `split.count` (3/4 → 2) y los tensores se copian slot a slot con alineación de 32 bytes, lo que permite manejar tipos exóticos (`Q2_0`, `NVFP4`, `IQ2_S`, …) sin conocer su layout de bloques. La verificación es tensor a tensor: los 1223 tensores no-PLE son idénticos por SHA-256 al shard original del que provienen, y se hizo una prueba de ida y vuelta sobre un modelo ya dividido que se reprodujo byte a byte.

## Capacidades

- Generación de texto en inglés y chino, según los idiomas declarados en los metadatos.
- Razonamiento y generación de código: no disponible (no hay información en la model card ni benchmarks).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo "thinking" o decodificación con razonamiento explícito: no disponible.
- Memoria n-gram/engram explícita por capa (tabla PLE de 51,2 B), consultada con `--ple-gguf` en llama.cpp y Strata.
- Carga selectiva del tensor PLE como mmap en host, independiente del offload de capas a GPU.

## Casos de uso

- **Investigación sobre arquitecturas MoE + engram:** cargar el modelo con el parche `--ple-gguf` y la tabla en Q8_0 para estudiar cómo influye una memoria n-gram de 51,2 B en la perplejidad y en la recuperación de hechos, sin reentrenar.
- **Ablaciones sobre la tabla PLE:** al estar desacoplada, se puede intercambiar IQ4_NL (28,8 GB), Q8_0 (54,4 GB) o BF16 (102,4 GB) sobre el mismo fichero de pesos y medir la degradación asociada a la cuantización de la tabla, manteniendo constantes los 125 B del MoE.
- **Gestión de artefactos en un registro interno:** servir una única tabla para las cinco cuantizaciones del set reduce el almacenamiento de 460,6 GB a 342,2 GB; útil en un registry con límites de cuota o en la distribución a nodos de cómputo.
- **Servicio de inferencia en un nodo multi-GPU:** `llama-server -m ...gguf --ple-gguf PLE_flash_Q8.gguf -ngl 99` deja el MoE en VRAM y la tabla PLE en RAM host vía mmap, lo que permite aprovechar GPUs de 80 GB sin reservar espacio para los 51,2 B de la tabla.
- **Despliegue con el motor Strata:** `--serve --native <gguf> --ple-gguf <tabla> --expert-profile <perfil>.bin`, con control fino mediante `--ple-io direct|mmap|ram`, `--ple-row-cache` y `--ple-inflight`; indicado cuando se necesita perfilar el acceso a la tabla en lugar de usar el comportamiento por defecto.
- **QA de integridad de pesos en CI:** el repositorio documenta verificación SHA-256 tensor a tensor y comparación del oid LFS del Hub; replicable como test automático que valide que un reempaquetado no altera ningún tensor antes de publicarlo.
- **Generación de texto interno en inglés y chino:** con licencia Apache 2.0 y cuantización de ~60 GiB, se puede desplegar en infraestructura propia para tareas de redacción o resumen en esos dos idiomas, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente aporta el ejemplo de uso `llama-cli ... -c 4096 --temp 0 -p "The capital of France is"` como prueba de humo; no se documentan cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- **VRAM para los pesos:** el fichero `UD-IQ4_XS` ocupa 60,43 GiB; para offload completo se necesita al menos ese tamaño más overhead de caché KV y buffers (estimación a partir del tamaño del fichero, no publicada por el autor).
- **Memoria host para la tabla PLE:** entre 28,8 GB (IQ4_NL) y 102,4 GB (BF16). Con Q8_0, 54,4 GB. La tabla se crea como tensor perezoso mmap, así que cuenta contra RAM y espacio de page cache, no contra VRAM.
- **GPU de 80 GB:** una A100 80 GB o H100 80 GB puede alojar los pesos con `-ngl 99` dejando la tabla en host; el margen es ajustado y depende de la longitud de contexto (no documentada).
- **Multi-GPU consumer:** 4 × RTX 4090 (96 GB agregados) o 2 × RTX 6000 Ada (96 GB) como mínimo para los pesos; sigue siendo necesario disponer de 28,8–54,4 GB de RAM para el PLE.
- **GPU consumer individual:** no cabe. Una RTX 4090 de 24 GB solo puede asumir una fracción de las capas con offload parcial, con la penalización de ancho de banda correspondiente.
- **Motores de despliegue:** llama.cpp (requiere `ple-gguf.patch`, 3 archivos y ~16 líneas, aplicado sobre `master` en el commit `c0fd78626`, build `b11714`) y Strata (soporte nativo). No hay información sobre soporte en vLLM, TGI u Ollama.
- **Restricciones operativas:** no usar `--lazy-mode off` (la tabla debe seguir siendo un tensor mmap en host); mantener el nombre de fichero `...-00001-of-00002.gguf` para el descubrimiento de shards por nombre; conservar siempre el flag `--ple-gguf`, porque sin él llama.cpp busca un `...-00002-of-00002.gguf` adyacente que no existe.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Artefacto | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `mduca771/Qwen3.8-Flash-Next-UD-IQ4_XS-PLE-GGUF` (este repo) | 125 B MoE + 51,2 B PLE | no disponible | GGUF, PLE separado | apache-2.0 | 60,43 GiB; requiere parche en llama.cpp o Strata |
| `unsloth/Qwen3.8-Flash-Next-GGUF` | 125 B MoE + 51,2 B PLE | no disponible | GGUF, PLE dentro de cada quant | apache-2.0 | Set de origen con UD-Q5_K_XL, UD-Q6_K_XL, Q8_0; sin parche |
| `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF` | misma familia de checkpoint | no disponible | GGUF (variante GSQ-RCO) | no disponible | Misma familia; el autor lo cita como variante RCO del set |
| `mduca771/Qwen3.8-Flash-Next-PLE-tables-GGUF` | 51,2 B (solo tabla) | n/a | GGUF | apache-2.0 | Complemento: unicamente la tabla PLE reetiquetada |

No se dispone de datos de benchmarks que permitan comparar rendimiento frente a alternativas de la misma categoría (modelos MoE de escala similar), por lo que la comparación se limita a formato, empaquetado y requisitos operativos.

## Limitaciones y advertencias

- **Sin benchmarks ni validación de la comunidad:** el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evaluación independiente de calidad.
- **No es el autor original:** el modelo subyacente es de Unsloth/Qwen; este repo es un reempaquetado de terceros. La responsabilidad sobre el comportamiento del modelo no recae en quien publica el GGUF.
- **Dependencia de un parche local:** llama.cpp upstream no expone `llama_model_load_from_splits()` en la CLI; sin `ple-gguf.patch` el modelo no se puede cargar con el CLI estándar. El parche está atado al commit `c0fd78626` (build `b11714`) y puede requerir reaplicación manual tras cambios upstream.
- **Rechazo por descubrimiento de shards:** el fichero declara `split.count = 2`; abrirlo en solitario provoca el error "is shard 1 of 2, but it was opened as a whole model". Hay que respetar el patrón de nombre `<name>-NNNNN-of-MMMMM.gguf`.
- **Coste oculto en RAM:** la tabla PLE nunca va a VRAM por diseño; 28,8–54,4 GB de memoria host son obligatorios y condicionan el dimensionado del nodo.
- **Cobertura lingüística limitada:** solo inglés y chino declarados; el rendimiento en castellano no está documentado ni evaluado.
- **Contexto desconocido:** no se publica la longitud de contexto, lo que impide planificar cargas de trabajo de contexto largo. El ejemplo de la model card usa `-c 4096`, pero no implica que ese sea el máximo.
- **Riesgo de alucinación:** no cuantificado. Un modelo con una tabla n-gram de 51,2 B puede reproducir secuencias memorizadas del corpus; no hay documentación sobre filtrado de datos.
- **Licencia:** Apache 2.0 permite uso comercial, pero se heredan las condiciones del checkpoint base; no se detallan restricciones adicionales de los datos de entrenamiento.
- **FP8 no portable:** la variante FP8 (E4M3) de la tabla solo es utilizable en Strata; llama.cpp no tiene tipo FP8.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-UD-IQ4_XS-PLE-GGUF
- Tabla PLE independiente: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-PLE-tables-GGUF
- Modelo base (quants de Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Variante GSQ-RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- llama.cpp (proyecto referenciado; el parche `ple-gguf.patch` se distribuye en este repositorio y aplica sobre el commit `c0fd78626`): https://github.com/ggml-org/llama.cpp
- Strata (motor con soporte nativo de `--ple-gguf`): no disponible, no se proporciona URL en la model card
- Resultados de busqueda web: sin resultados relevantes; las entradas devueltas no guardan relacion con el modelo
