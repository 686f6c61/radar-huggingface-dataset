# Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw

## Resumen

DeepSeek-V4.1-Flash-EXL3-2.9bpw es una cuantizacion EXL3 del modelo multimodal DeepSeek-V4.1-Flash, publicada por Mia-AiLab. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos del checkpoint original de DeepSeek-AI a un formato de 2,90 bits por peso (bpw) en el decoder, con el objetivo de reducir el coste de almacenamiento y de memoria necesarios para servir un MoE de 552.000 millones de parametros.

El modelo base es un Mixture-of-Experts multimodal con vision integrada, 552B de parametros en el backbone y 8B/16B activados por token en prefill/decode, que incorpora mecanismos CED, CSA2, memoria Engram y decodificacion especulativa DSpark dentro del propio checkpoint. La model card del modelo base cita una ventana de contexto de hasta 1.000.000 de tokens y una cache KV nativa en FP4 de aproximadamente 890 bytes por token, lo que convierte la compresion de la cache KV en el eje central del lanzamiento.

La relevancia de esta ficha concreta es practica: permite ejecutar un MoE de ese tamano en hardware multi-GPU con un peso de decoder de unos 197 GB, a cambio de asumir varias dependencias no triviales (shards Engram del modelo original, runtime EXL3, configuracion de decodificacion especulativa). Es material de evaluacion para equipos con infraestructura grande, no un reemplazo directo del checkpoint FP8 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (family `deepseek_v41`) con CED, CSA2, memoria Engram y DSpark en checkpoint |
| Parametros totales | 552B en el backbone (dato de la model card del modelo base) |
| Parametros activos | 8B por token en prefill y 16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | EXL3 `v1.4.2`, codebook `mul1`, `out_scales=always`; 2,90 bpw de media en el decoder, 6 bits en heads, 4 bits en MTP/DSpark, embeddings en bf16, indexer `wk` a 8 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base; la cuantizacion no anade restricciones) |
| Formato de pesos | safetensors (39 shards, ~197 GB) mas los shards 47 y 48 del modelo base para las tablas Engram |
| Tamano total declarado | ~197 GB (decoder cuantizado) + ~190 GB en tablas Engram FP8 sin cuantizar |
| Calibracion | 128 filas x 2048 columnas (262.144 tokens), traza `cal_trace_dsv41_flash_workload.json` |
| Cache KV | FP4 nativa de V4.1, ~890 bytes por token |
| Muestreo recomendado | `temperature=1.0`, `top_p=0.95` |
| Modo thinking | Activado por defecto; se desactiva con `enable_thinking=false` |
| Libreria declarada | `exllamav3` |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento nuevo: es una conversion de pesos. La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de 552B de parametros, del cual se activan 8B por token en prefill y 16B en decode. El modelo base incorpora varios componentes poco habituales: CED, CSA2, una memoria Engram implementada mediante tablas de filas en FP8, y DSpark, un esquema de decodificacion especulativa embebido en el checkpoint con `dspark_block_size=5`, 128 expertos draft con top-3 y capas 37-39. La torre de vision esta incluida y se mantiene en su forma nativa.

La cuantizacion se realizo con exllamav3 `v1.4.2` usando codebook `mul1`, `out_scales=always` y el flag `--hq`, con un bitrate final reportado de 2,90 bpw en el decoder. Los tensores MTP se cuantizaron a 4 bits. Los expertos enrutados siguen una mezcla 2/3 (mayoritariamente K=3, con una porcion a K=2), mientras que atencion, capas compartidas y los lineales `wkv` de Engram quedan en rangos mas altos (tipicamente 4-6 bits). Las embeddings permanecen en bf16 y el indexer `wk` en 8 bpw. Un punto critico: EXL3 solo cuantizo los lineales `wkv` de Engram, de modo que las tablas de filas FP8 siguen residiendo en el arbol original del modelo base (shards 47 y 48).

## Capacidades

- Generacion de texto y razonamiento multi-step, con modo thinking activado por defecto y desactivable por peticion.
- Procesamiento multimodal de imagen y texto (`pipeline_tag: image-text-to-text`), con la torre de vision incluida en el checkpoint.
- Contexto largo: la model card del modelo base declara soporte de hasta 1M de tokens, con cache KV FP4 de ~890 B/token.
- Decodificacion especulativa nativa mediante DSpark (`--speculative-config '{"method":"dspark","num_speculative_tokens":3}'` en vLLM).
- Parsers de tokenizer, herramientas y razonamiento especificos de DeepSeek V4.1 en el stack vLLM.
- Soporte de tool calling y function calling: la model card menciona parsers dedicados de tool y reasoning en vLLM, aunque no se detalla el formato exacto de invocacion.
- Capacidades multilingues: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Razonamiento de contexto masivo sobre documentacion tecnica: con hasta 1M de tokens de ventana y una cache KV de ~890 B/token, es viable cargar repositorios completos, expedientes o libros tecnicos en una sola peticion sin trocear el material.
- Analisis multimodal de documentos: al incluir la torre de vision, puede procesar capturas, diagramas, planos o paginas escaneadas junto con instrucciones en texto, por ejemplo para extraccion estructurada de tablas en informes.
- Agentes con razonamiento multi-step: el modo thinking activado por defecto y los parsers de razonamiento de vLLM permiten construir bucles de agente donde el modelo explicita pasos intermedios antes de actuar.
- Asistencia de codigo en pipelines internos: el soporte de tool calling y el contexto largo permiten dar al modelo el arbol completo de un repositorio y las salidas de CI para proponer parches.
- Traduccion y reescritura de documentos largos: la ventana de 1M tokens evita perder coherencia entre secciones en documentos de gran extension. El soporte real de idiomas no esta documentado, por lo que requiere validacion previa.
- Despliegue de un asistente conversacional de gran escala en infraestructura propia: al ser un MoE con 8B/16B activos, el coste por token es inferior al de un modelo denso de 552B, aunque el coste de memoria sigue siendo alto.
- Evaluacion comparativa de cuantizaciones: sirve como punto de referencia frente al hermano de 3,0 bpw para medir la perdida de calidad por bitrate en tareas concretas.
- Investigacion sobre compresion de cache KV: al exponer una cache FP4 nativa de V4.1, es util para reproducir experimentos de latencia y memoria en contextos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta build EXL3. La model card indica explicitamente que las puntuaciones de la model card del modelo base corresponden al modelo sin cuantizar y no a esta conversion. Cualquier cifra de MMLU, HumanEval, GSM8K u otros debe medirse localmente si se quiere caracterizar la perdida por cuantizacion.

## Requisitos de hardware

- Peso del decoder cuantizado: ~197 GB en 39 shards safetensors.
- Tablas Engram obligatorias: shards 47 y 48 del modelo base, ~95 GiB cada uno (unos 190 GB adicionales) en FP8 sin cuantizar. No estan incluidas en este repositorio.
- Estimacion de memoria minima para pesos: del orden de 390 GB agregados entre decoder y tablas Engram, sin contar activaciones ni cache KV. Es una estimacion derivada de los tamanos declarados, no un dato publicado.
- Cache KV: ~890 bytes por token en FP4 nativo. A 1M de tokens de contexto equivale a unos 0,89 GB, una cifra baja para un modelo de este tamano y el principal argumento del lanzamiento.
- Configuraciones de GPU razonables: 8x H100 80 GB (640 GB), 4x H200 141 GB (564 GB) o 8x A100 80 GB, siempre que el runtime reparta decoder y tablas Engram correctamente.
- GPU de consumo: no cabe. Una RTX 4090 de 24 GB, o incluso varias, no permiten alojar los ~390 GB de pesos; el modelo no es desplegable en hardware de consumo.
- Opciones de despliegue: vLLM con `--quantization exl3` y `--hf-overrides '{"engram_table_dir":"/path/to/DeepSeek-V4.1-Flash"}'`; ExLlamaV3 / TabbyAPI cuando la arquitectura este soportada en la build en uso. El checkpoint esta pensado para stacks que cargan EXL3 (`trellis` / `suh` / `svh` / `mul1`) y no para cargadores de pesos de Transformers estandar.
- Decodificacion especulativa: DSpark nativo en vLLM mediante `--speculative-config '{"method":"dspark","num_speculative_tokens":3}'`.
- llama.cpp y Ollama no aparecen como soportados en la informacion disponible.
- Latencia y throughput concretos: no disponible.
- Nota de coherencia: la ficha de HuggingFace declara un tamano de repositorio de 0,1 GB, mientras que la model card describe ~197 GB en 39 shards. Conviene verificar el contenido real antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw | 552B totales, 8B/16B activos | Hasta 1M tokens | EXL3 2,90 bpw (decoder) | MIT | HuggingFace, 39 shards + shards Engram externos |
| Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-3.0bpw | 552B totales, 8B/16B activos | Hasta 1M tokens | EXL3 3,0 bpw (decoder) | MIT | HuggingFace; hermano algo mas denso |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552B totales, 8B/16B activos | Hasta 1M tokens | FP8 sin cuantizar | MIT | HuggingFace, checkpoint completo con tablas Engram |

No se dispone de datos comparativos de rendimiento entre estas tres variantes en la informacion proporcionada. Otros modelos de la misma categoria no se detallan en el material disponible.

## Limitaciones y advertencias

- No es un reemplazo directo del checkpoint FP8: sin los shards 47 y 48 del modelo base, las tablas Engram no estan disponibles y el modelo no puede ejecutarse correctamente.
- La model card deja `engram_table_dir` como `null` a proposito en `config.json`; hay que sobrescribirla en tiempo de ejecucion y no dejar rutas locales incrustadas.
- Las puntuaciones publicadas del modelo base corresponden al modelo sin cuantizar; no hay evals de esta build EXL3.
- Riesgo de degradacion por cuantizacion: a 2,90 bpw en el decoder y 4 bits en MTP/DSpark, la perdida respecto a FP8 no esta documentada y debe medirse por tarea.
- Restriccion de runtime: no se carga con cargadores de pesos de Transformers estandar; requiere vLLM con EXL3 o ExLlamaV3/TabbyAPI.
- No se debe forzar un dtype de KV `fp8` de otras recetas: la cache es FP4 nativa de V4.1.
- Riesgo de alucinacion: inherente a los modelos generativos de gran escala; no hay datos especificos publicados para esta build.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponible, lo que impide garantizar calidad multilingue sin evaluacion previa.
- Licencia MIT, heredada del modelo base, sin restricciones adicionales por la cuantizacion, pero conviene verificar los terminos del modelo original y de los shards Engram reutilizados.
- Discrepancia entre el tamano de repositorio reportado por HuggingFace (0,1 GB) y el declarado en la model card (~197 GB): verificar antes de desplegar.
- El repositorio no tiene descargas ni valoraciones en el momento de la consulta, por lo que no existe validacion de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Variante hermana de 3,0 bpw: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-3.0bpw
- Informe tecnico del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Herramienta de cuantizacion exllamav3: https://github.com/turboderp-org/exllamav3
- Perfil del autor de la cuantizacion: https://huggingface.co/Mia-AiLab

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente referencias no pertinentes al nombre "Mia"), por lo que los enlaces anteriores proceden de la model card y de la ficha de HuggingFace.
