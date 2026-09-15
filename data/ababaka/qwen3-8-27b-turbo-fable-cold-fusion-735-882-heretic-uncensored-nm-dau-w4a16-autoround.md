# ababaka/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-W4A16-AutoRound

## Resumen

Esta ficha describe una cuantización W4A16 publicada por el usuario ababaka sobre el modelo `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, un ajuste fino de la familia Qwen3.5 (arquitectura declarada `qwen3_5`) con el comportamiento de rechazo eliminado por sus autores originales. El repositorio no aporta pesos nuevos: aporta un empaquetado en formato `compressed-tensors` (int4 en el cuerpo del transformer, int8 en `lm_head`, `embed_tokens` y el módulo MTP) listo para servirse directamente con vLLM sobre una única GPU de 24 GB.

El problema que resuelve es de despliegue: el modelo base en BF16 ocupa unos 55 GB, lo que obliga a dos o más GPU o a offload a CPU, mientras que esta versión ocupa aproximadamente 16 GB en disco y está optimizada para servir contexto largo en una RTX 3090. La model card documenta mediciones concretas: con `gpu_memory_utilization=0.94` y `max_model_len=140000` el pool de caché KV alcanza 152.173 tokens con cerca de un 9 % de margen.

El interés técnico está en el pipeline de cuantización y en el decodificado especulativo: se conservan en BF16 las capas de atención lineal (`linear_attn.in_proj_a/b`), la torre de visión y el módulo MTP, y se añade una cabeza draft truncada a 40.960 tokens que permite decodificación especulativa MTP con tres tokens draft. La licencia es Apache 2.0, aunque conviene tener presente que la ausencia de rechazos es una decisión de diseño del modelo base y traslada al desplegador toda la responsabilidad sobre el uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen3_5` de 64 capas: 48 de atención lineal (DeltaNet) y 16 de atención completa; módulo MTP, torre de visión y embeddings no atados (`tie_word_embeddings=false`) |
| Parametros totales | 6.260.690.960 según los tensores safetensors publicados; la model card describe el modelo base como 27B (discrepancia no explicada en la documentacion) |
| Parametros activos | No aplica: no se describe como MoE en la informacion disponible |
| Longitud de contexto | Recomendado 140.000 tokens (pool KV de 152.173 tokens con `gpu_memory_utilization=0.94`); hasta 160.000 tokens con `gpu_memory_utilization=0.96` y pool de 167.692 tokens |
| Tipos de cuantizacion | W4A16 AutoRound: int4, grupo 128, simetrico, pack-quantized en el cuerpo del transformer; int8 g128 en `lm_head`, `embed_tokens` y modulo MTP; cabeza draft truncada a 40.960 tokens |
| Idiomas soportados | no disponible (vocabulario de 248.320 tokens) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con esquema `compressed-tensors` pack-quantized (`weight_packed` int32 + `weight_scale` + `weight_shape`); 7 shards mas `model_extra_tensors.safetensors` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la declarada por el modelo base: `qwen3_5`, 64 capas compuestas por 48 capas de atención lineal DeltaNet y 16 de atención completa, vocabulario de 248.320 tokens, embeddings no atados, torre de visión (`model.visual.*`) y un módulo MTP (multi-token prediction) con `mtp.fc` más siete capas lineales. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el ajuste original; tampoco se detalla el procedimiento exacto que eliminó el comportamiento de rechazo.

La aportación de este repositorio es íntegramente la cuantización, realizada con auto-round 0.14.2, transformers 5.15.0, torch 2.13+cu130 y compressed-tensors, usando 128 muestras de `NeelNanda/pile-10k` con longitud de secuencia 2048 y 200 iteraciones (semilla 42). El proceso se ejecutó en una RTX 3090 con `low_gpu_mem_usage=True`, tardó aproximadamente 2 h 41 min (141-159 s por capa) con un pico de 15,5 GB de VRAM y 27,3 GB de RAM, y cuantizó 400 de 607 submódulos. Se mantuvieron en BF16 `lm_head`, las 48 capas `linear_attn.in_proj_a/b`, toda la torre de visión y todo el módulo MTP (303 entradas en la lista de ignorados). Después se aplicó un pipeline de cuatro pasos: `lm_head` a int8 g128 (error relativo de ida y vuelta 0,64 %, ~1,3 GB ahorrados), `embed_tokens` a int8 g128 con escalas en bf16 (error 0,60 %, ~1,3 GB), módulo MTP a int8 g128 (errores 0,6-1,5 %) y construcción de una cabeza draft de 213 MB recortada a los 40.960 token ids más frecuentes. El orden de las reglas en `config_groups` importa: la expresión regular de `lm_head` debe preceder a la de `mtp` para que el emparejamiento en vLLM funcione.

## Capacidades

- Generación de texto y conversación multi-turno en el pipeline `text-generation`, con plantilla de chat del modelo base.
- Razonamiento con parser dedicado (`--reasoning-parser qwen3`), lo que implica soporte de bloques de razonamiento separables.
- Llamada a herramientas y function calling mediante `--enable-auto-tool-choice --tool-call-parser qwen3_xml`.
- Decodificación especulativa MTP con cabeza draft truncada (`--speculative-config` con `method: mtp` y `num_speculative_tokens: 3`, muestreo probabilístico).
- Caché de prefijos (`--enable-prefix-caching`) y caché KV en FP8 (`--kv-cache-dtype fp8`) para reutilización de contexto largo.
- Procesamiento de imagen a texto: la arquitectura conserva torre de visión (etiqueta `image-text-to-text`), aunque el ejemplo de despliegue usa `--language-model-only`, que la omite para servir solo texto.
- Capacidades multilingües: no disponible (no se documenta la lista de idiomas, solo el tamaño de vocabulario).
- Modo de pensamiento explícito: no disponible como parámetro documentado, más allá del parser de razonamiento.

## Casos de uso

- Servicio de inferencia en una sola GPU de 24 GB: con ~16 GB en disco y el ejemplo de `vllm serve` documentado, el modelo se puede levantar en una RTX 3090 con `--gpu-memory-utilization 0.94 --max-model-len 140000`, lo que permite ofrecer contexto largo sin clúster multi-GPU.
- RAG sobre documentación extensa: el pool KV de 152.173 tokens admite insertar manuales, bases de código o expedientes completos en el prompt y mantener conversaciones posteriores sin reindexar, apoyándose en la caché de prefijos para no recalcular el contexto en cada turno.
- Agentes con tool calling: la combinación de `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml` permite construir bucles de agente que invocan funciones externas (búsqueda, cálculo, APIs internas) y encadenan varios pasos de razonamiento.
- Asistentes conversacionales de atención al cliente: con `--max-num-seqs 8` y contexto de 140.000 tokens se pueden atender varias sesiones concurrentes manteniendo el historial completo de cada una sin truncar.
- Generación de código en pipelines internos: al ser un modelo de propósito general ajustado sobre Qwen3.5, puede integrarse como servicio HTTP en un CI/CD para redactar tests, revisar diffs o completar funciones, con la ventaja de que los pesos caben en una tarjeta consumer.
- Reducción de latencia en generación larga: activar la decodificación especulativa MTP con tres tokens draft está pensado para acelerar la generación de salidas extensas (informes, resúmenes), donde el coste por token domina el tiempo total.
- Procesamiento por lotes offline: `--max-num-seqs 8` y `--max-num-batched-tokens 2048` configuran un servidor capaz de absorber lotes moderados de tareas de extracción o clasificación de texto.
- Reproducción de pipelines de cuantización: la model card documenta la receta completa (herramientas, dataset, iteraciones, `layer_config`, ajustes de memoria), por lo que sirve como referencia para cuantizar otros modelos híbridos con atención lineal y módulo MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa ~16 GB en disco; en la RTX 3090 de referencia el pico durante la cuantización fue de 15,5 GB de VRAM y 27,3 GB de RAM, y para servir con contexto largo se recomienda `gpu_memory_utilization=0.94` con `max_model_len=140000`.
- Configuraciones de contexto medidas en RTX 3090: 0.94 + 140.000 tokens → pool KV de 152.173 tokens, entra con ~9 % de margen; 0.96 + 160.000 tokens → pool de 167.692 tokens, entra con menos margen en tiempo de ejecución; 0.93 + 160.000 tokens → techo de ~146k, el motor se niega a arrancar.
- GPU recomendadas: RTX 3090 24 GB es la plataforma validada de forma explícita. No se documentan pruebas en A100, H100, RTX 4090 ni otras tarjetas.
- Cabe en GPU consumer: sí, al menos en una RTX 3090 de 24 GB con la configuración recomendada. No hay datos para tarjetas de 16 GB o menos.
- Opciones de despliegue: vLLM 0.27.1 es el motor validado, con transformers 5.15.0 y CUDA 13. El formato `compressed-tensors` pack-quantized es específico de vLLM; no se documenta compatibilidad con llama.cpp, Ollama o TGI.
- Flags relevantes: `--kv-cache-dtype fp8`, `--mamba-ssm-cache-dtype float16`, `--async-scheduling`, `--compilation-config` con `max_cudagraph_capture_size: 32` y `custom_ops: ["+rms_norm","+silu_and_mul"]`, `--enable-prefix-caching` y `--mamba-cache-mode align`.
- Latencia y throughput estimados: no disponible. La model card solo indica que se activa decodificación especulativa MTP con tres tokens draft, sin cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos comparables en la informacion proporcionada. La única comparación documentada es contra el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Precisión de pesos | Tamano en disco | Licencia |
|---|---|---|---|---|---|
| Este repositorio (ababaka, W4A16 AutoRound) | 6.260.690.960 segun safetensors (la model card describe un base de 27B) | 140.000 tokens recomendado en RTX 3090 | int4 g128 en el transformer, int8 en lm_head/embeddings/MTP | ~16 GB | apache-2.0 |
| `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` (base) | No disponible | No disponible | BF16 | ~55 GB | apache-2.0 segun el repositorio derivado |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La ventaja medida de esta versión frente al base es de aproximadamente 39 GB de reducción en disco (de ~55 GB a ~16 GB), a costa de errores de cuantización declarados entre el 0,60 % y el 1,5 % según el submódulo y del requisito de usar vLLM para explotar el formato.

## Limitaciones y advertencias

- Modelo sin censura: el comportamiento de rechazo fue eliminado por los autores del modelo base. No hay salvaguardas integradas y la responsabilidad del uso recae íntegramente en quien despliega el sistema; conviene añadir filtros externos si el servicio es público.
- Riesgo de alucinación: es un modelo generativo de propósito general sin datos de evaluación publicados en este repositorio, por lo que no hay evidencia objetiva sobre su tasa de error factual.
- Discrepancia en el recuento de parámetros: los tensores safetensors suman 6.260.690.960 parámetros mientras que el nombre y la model card hablan de 27B. No se explica la diferencia en la información disponible, y conviene verificarla antes de dimensionar infraestructura.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización el mismo día. No hay historial de uso en producción ni informes de terceros.
- Entorno muy específico: validado únicamente con vLLM 0.27.1, transformers 5.15.0 y CUDA 13. El formato pack-quantized de compressed-tensors no es portable a otros motores de inferencia documentados.
- Dependencia del orden de las reglas de cuantización: la propia model card advierte que la expresión regular de `lm_head` debe preceder a la de `mtp` en `config_groups`, porque en compressed-tensors gana la primera coincidencia. Un reempaquetado descuidado puede degradar la precisión.
- Cabeza draft truncada: el vocabulario de la cabeza de decodificación especulativa se reduce a 40.960 token ids. Es una aproximación que puede penalizar la aceptación de borradores en dominios con vocabulario poco frecuente.
- Idiomas no declarados: no se especifica la cobertura lingüística real. Un vocabulario de 248.320 tokens sugiere cobertura amplia, pero no es una garantía de calidad por idioma.
- Torre de visión no cuantizada: los submódulos `visual.*` se mantienen en BF16 y el ejemplo de despliegue los omite con `--language-model-only`. Servir visión y texto simultáneamente consumiría más VRAM de la medida en la model card.
- Contexto útil frente a contexto nominal: los 160.000 tokens entran con `gpu_memory_utilization=0.96` pero con menos margen en tiempo de ejecución; la propia ficha recomienda 140.000 tokens como ajuste diario seguro.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base puede arrastrar condiciones adicionales no verificadas en este repositorio; conviene revisar su licencia antes de un despliegue comercial.
- Fechas del repositorio: creado y actualizado el 15 de septiembre de 2026, sin historial de versiones que permita auditar cambios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ababaka/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-W4A16-AutoRound
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- compressed-tensors (formato de pesos): https://github.com/neuralmagic/compressed-tensors
- Dataset de calibración: https://huggingface.co/datasets/NeelNanda/pile-10k
- Plantillas de chat Sharp usadas en las pruebas: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Documentación de vLLM (motor validado, versión 0.27.1): no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
