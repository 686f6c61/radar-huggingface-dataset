# Baekpica/Swift1.5-Qwen3.8-Flash-Next-Mixed-Quant-GGUF

## Resumen

Swift1.5-Qwen3.8-Flash-Next-Mixed-Quant-GGUF es un paquete de cuantizacion mixta en formato GGUF publicado por el usuario independiente Baekpica a partir del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next (fijado a la revision `0bd4fe22431372cdad1979267d3ab45aa7e6150a`). No es un modelo nuevo: es una conversion de pesos orientada a ejecutar el modelo base en hardware de memoria unificada mediante una jerarquia de memoria en dos niveles, con el backbone de computo en acelerador y una tabla de embeddings latentes predictivos (PLE) alojada en SSD con cache de paginas acotada en tiempo de ejecucion.

La receta de cuantizacion principal, denominada `MQ-Q5-SSD-PLE-BF16`, combina Q4_K, Q5_K, Q5_0, Q8_0, BF16, F32 e I64 sobre un payload de tensores planificado de 77,5456 GiB, mientras que la tabla PLE (51.200.393.216 bytes, 47,6841 GiB) se distribuye como sidecar FP8 E4M3FN en cuatro ficheros y 128 partes logicas. El modelo base declara 128,8 B de parametros en el backbone de computo y 51,2 B en la tabla PLE, y el pipeline declarado es image-text-to-text, por lo que conserva tensores de vision y prediccion multitoken (MTP) embebida.

La relevancia de esta publicacion es, hoy, mas documental que practica: la model card se publico antes que los pesos. El autor indica explicitamente que la descarga del checkpoint BF16 de origen y la conversion en CPU estan en preparacion, que los ficheros GGUF y el sidecar FP8 aun no se han subido y que no se ha ejecutado ninguna evaluacion de inferencia, serving, throughput o calidad de tarea para esta conversion. Ademas, el paquete esta pensado para el cargador dedicado `ds4-dfm-rs` en modo `qwen4exp`, y el propio autor advierte de que la compatibilidad con runtimes GGUF genericos no esta establecida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la receta describe expertos enrutados (gate/up/down) en 48 capas, backbone de computo mas tabla PLE (predictive latent embedding), MTP embebida y tensores de vision |
| Parametros totales | 128,8 B (backbone de computo) + 51,2 B (tabla PLE); total aproximado 180 B |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF mixto: Q4_K, Q5_K, Q5_0, Q8_0, BF16, F32, I64; sidecar PLE en FP8 E4M3FN |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License v1.0 (identificador `other`, `license_name: swift-open-license-1.0`) |
| Formato de pesos | GGUF (tres shards principales planificados) + sidecar FP8 (`PLE-FP8/`, 4 ficheros / 128 partes logicas) + escala BF16 escalar (`0x3951`, 2 bytes) |

Datos adicionales de la receta:

| Componente | Formato | Tamano | Estado |
|---|---|---:|---|
| Principal, `MQ-Q5-SSD-PLE-BF16` | Mixto Q4_K / Q5_K / Q5_0 / Q8_0 / BF16 / F32 / I64 | 77,5456 GiB de payload de tensores, planificado | Conversion pendiente |
| PLE, `PLE-FP8/` | FP8 E4M3FN, 4 ficheros / 128 partes logicas | 51.200.393.216 bytes / 47,6841 GiB, verificado localmente | Subida pendiente |
| Escala PLE | Escalar BF16 `0x3951` | 2 bytes | Copiada y verificada, subida pendiente |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con vision y prediccion multitoken, organizado con expertos enrutados. La receta de cuantizacion identifica las capas interiores 2-45 con expertos enrutados gate/up en Q4_K, las capas de borde 0, 1, 46 y 47 en Q5_K, la matriz down de los expertos en Q5_K para las 512 columnas principales y Q5_0 para la cola de 128 columnas, y los expertos enrutados de MTP junto con la mayoria de matrices siempre activas principalmente en Q8_0. Los tensores no cuantizables, normas y controles se mantienen en BF16, F32 e I64.

La innovacion tecnica del paquete es la jerarquia de memoria: la tabla PLE de 51,2 B parametros reside en SSD con una cache de paginas acotada, mientras el backbone de computo de 128,8 B usa el GGUF de precision mixta en el acelerador. La conversion se realiza directamente desde el checkpoint BF16 fijado, en CPU, sin recalibracion de un GGUF existente, sin imatrix, sin poda, sin eliminacion ni fusion de expertos y sin eliminacion de capas. El mapa de tensores objetivo preserva MTP embebida, tensores de vision, controles enteros de PLE y la plantilla de chat de origen. El sidecar FP8 PLE no es una conversion propia: se reutiliza sin cambios el sidecar oficial de `Qwen/Qwen3.8-Flash-Next-FP8@236dfdf285828023ca3bcd3f37366c58a3469b13`, tras comprobar que las 128 partes BF16 de PLE de Swift coinciden con la referencia Qwen (124 partes mediante SHA-256 de shard completo y 4 mediante SHA-256 por rango de tensor). No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generacion de texto e inferencia multimodal image-text-to-text: el pipeline declarado del modelo base es image-text-to-text y la receta preserva los tensores de vision.
- Prediccion multitoken (MTP) embebida, conservada en el mapa de tensores objetivo.
- Capacidades derivadas del backbone Qwen3.8-Flash-Next: no disponibles en detalle en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Ejecucion con offload a SSD de la tabla PLE mediante el cargador `ds4-dfm-rs` en modo `qwen4exp`, con cache de paginas acotada.
- Compatibilidad con runtimes GGUF genericos: no establecida, segun el autor.

## Casos de uso

- Despliegue local de un modelo de ~180 B en hardware de memoria unificada: la jerarquia SSD-PLE permite mantener la tabla de 51,2 B parametros fuera de la memoria del acelerador, de modo que el backbone de 128,8 B pueda residir completo en un equipo con memoria unificada grande en lugar de requerir un cluster multi-GPU.
- Inferencia multimodal en estacion de trabajo: al preservar los tensores de vision, el paquete esta pensado para tareas image-text-to-text ejecutadas en local, sin depender de APIs externas.
- Investigacion sobre cuantizacion mixta: la receta publica un mapa de precision por region (Q4_K en capas interiores, Q5_K en capas de borde, Q5_0 en la cola de la matriz down, Q8_0 en MTP y matrices siempre activas) util para estudiar el impacto de la asignacion de precision por capa.
- Validacion de reutilizacion de sidecars FP8: el paquete documenta la equivalencia bit a bit entre las tablas PLE de Swift y Qwen y reutiliza el sidecar FP8 oficial, un caso de estudio sobre interoperabilidad de artefactos cuantizados.
- Pruebas de offload a SSD en pipelines de inferencia: util para medir el coste real de la cache de paginas acotada sobre una tabla de embeddings de 47,68 GiB frente a mantenerla en memoria.
- Reproducibilidad de conversiones: el paquete incluye un directorio `reproduction/` con conversor, mapas de tensores e informes de verificacion, lo que permite auditar el proceso de conversion desde el checkpoint BF16 fijado.
- Evals comparativas de un backbone de 128,8 B en precision mixta frente al mismo modelo en FP8, una vez se publiquen los pesos.

Advertencia: estos escenarios son aplicables solo cuando los pesos esten publicados y verificados; actualmente no hay artefactos descargables ni evaluaciones de calidad ejecutadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card indica que para esta conversion no se han ejecutado inferencia en GPU, serving, mediciones de throughput ni evaluacion de calidad de tarea, y que los graficos de rendimiento y resultados de cualificacion que aparecen en las model cards de Qwen y Uncensored describen a esos modelos, no a esta conversion de Swift.

## Requisitos de hardware

- Payload principal planificado: 77,5456 GiB de tensores (el fichero GGUF final anade metadatos y alineacion).
- Tabla PLE: 47,6841 GiB (51.200.393.216 bytes) en FP8 E4M3FN, alojada en SSD con cache de paginas acotada.
- Escala PLE: 2 bytes.
- Costes de memoria adicionales no incluidos en las cifras anteriores: cache PLE, estado KV, checkpoints y espacios de trabajo del runtime.
- VRAM/unified memory estimada: el backbone requiere al menos los ~77,5 GiB del payload principal mas estado KV y workspaces; no cabe en GPUs de consumo de 24 GB, ni siquiera con la PLE en SSD.
- GPU objetivo declarada: NVIDIA DGX Spark (etiqueta `dgx-spark` del repositorio). No se detallan otras GPU soportadas.
- Despliegue: cargador dedicado `ds4-dfm-rs` en modo `qwen4exp`, con la variable `DS4_QWEN_PLE_DIR` para seleccionar el manifiesto PLE FP8. La compatibilidad con runtimes GGUF genericos (llama.cpp, Ollama, vLLM, TGI) no esta establecida segun el autor.
- Latencia y throughput: no disponibles; el autor indica que no se han realizado mediciones para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Baekpica, Swift1.5-Qwen3.8-Flash-Next MQ GGUF) | 128,8 B backbone + 51,2 B PLE | GGUF mixto + sidecar PLE FP8 en SSD | No disponible | Swift Open License v1.0 | Pesos no subidos; conversion pendiente |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (modelo base) | No disponible (mismo backbone y PLE segun la receta) | BF16 | No disponible | Swift Open License v1.0 | Publicado (revision fijada `0bd4fe2`) |
| Qwen/Qwen3.8-Flash-Next-FP8 | No disponible | FP8 | No disponible | No disponible en la informacion proporcionada | Publicado (revision `236dfdf`) |
| Baekpica/Qwen3.8-Flash-Next-Mixed-Quant-SSD-PLE-GGUF | No disponible | GGUF mixto + PLE FP8 en SSD | No disponible | No disponible en la informacion proporcionada | Publicado; sigue la misma jerarquia de memoria |

La comparacion con alternativas de la misma categoria (mismo tamano o misma tarea) no esta disponible: la informacion proporcionada no incluye parametros, contexto ni resultados de otros modelos comparables.

## Limitaciones y advertencias

- Los pesos no estan publicados: la model card se publico antes que los ficheros de pesos y no hay artefactos descargables ni comandos de descarga. El repositorio registra 0 descargas y 0 likes.
- No hay evaluacion de calidad: inferencia en GPU, serving, throughput y evaluacion de calidad de tarea no se han ejecutado para esta conversion.
- Validacion incompleta: quedan pendientes los checksums completos del origen, la topologia del origen, la conversion en CPU, la estructura final del GGUF, los hashes finales independientes y la verificacion publica de pesos. Completado hasta ahora: equivalencia del mapa de tensores Q5, layout y controles de PLE, identidad BF16 completa de PLE y checksums del sidecar FP8 copiado.
- Compatibilidad restringida: el paquete esta pensado para el cargador `ds4-dfm-rs` con modo `qwen4exp`; la compatibilidad con runtimes GGUF genericos no esta establecida.
- Tamano derivado, no medido: el tamano del payload principal (77,5456 GiB) se deriva de la receta exacta de tensores, no de un fichero GGUF completo medido; los metadatos y la alineacion anaden almacenamiento adicional.
- Costes de memoria no contabilizados: cache PLE, estado KV, checkpoints y workspaces del runtime son costes separados que no aparecen en las cifras de payload.
- Restricciones de licencia: licencia Swift Open License v1.0 (identificador `other` en HuggingFace), no una licencia estandar reconocida. Es necesario revisar el texto completo enlazado por el autor antes de cualquier uso comercial.
- Sesgos conocidos, riesgo de alucinacion y limitaciones de contexto o idioma: no disponibles en la informacion proporcionada.
- Fechas del repositorio: la creacion y ultima actualizacion registradas son 2026-09-26, con tres segundos de diferencia, lo que es coherente con una publicacion de model card sin ficheros de pesos.
- El nombre de directorio `MQ-Q5-SSD-PLE-BF16` describe el contrato de empaquetado principal, no la ubicacion real de la PLE, que se selecciona mediante `DS4_QWEN_PLE_DIR` apuntando al manifiesto FP8.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/Baekpica/Swift1.5-Qwen3.8-Flash-Next-Mixed-Quant-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Revision fijada del modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/tree/0bd4fe22431372cdad1979267d3ab45aa7e6150a
- Licencia del modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/0bd4fe22431372cdad1979267d3ab45aa7e6150a/LICENSE
- Release previa del mismo autor con la misma jerarquia SSD-PLE: https://huggingface.co/Baekpica/Qwen3.8-Flash-Next-Mixed-Quant-SSD-PLE-GGUF
- Origen del sidecar FP8 PLE: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8/tree/236dfdf285828023ca3bcd3f37366c58a3469b13
- Cargador SSD-PLE `ds4-dfm-rs`: https://github.com/Baekpica/ds4-dfm-rs
- Apoyo al autor (Buy Me a Coffee): https://www.buymeacoffee.com/baekpica
- Apoyo al autor (GitHub Sponsors): https://github.com/sponsors/Baekpica
