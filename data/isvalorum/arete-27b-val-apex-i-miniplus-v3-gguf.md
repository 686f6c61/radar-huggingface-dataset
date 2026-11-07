# IsValorum/Arete-27B-VAL-APEX-I-MiniPlus-V3-GGUF

## Resumen

Arete-27B VAL-APEX-I MiniPlus V3 es una cuantizacion GGUF del modelo NousResearch/Arete-27B, publicada por el usuario independiente IsValorum dentro de su serie de cuantizaciones APEX. El modelo base es un transformer denso hibrido de la familia Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con 26.895.998.464 parametros (aproximadamente 27B), 64 capas y soporte de texto y vision. Esta version concreta empaqueta los pesos en un unico fichero GGUF de 14,03 GB (13,07 GiB), pensado para inferencia local en llama.cpp y entornos compatibles.

La propuesta de valor del modelo es el equilibrio entre huella de disco/memoria y calidad de cuantizacion: aplica un mapa de cuantizacion quirurgico por tensor, manteniendo en F32 las normalizaciones y los parametros recurrentes del SSM, y reservando precisiones K-quant e I-quant para las proyecciones de atencion y FFN. Esto lo hace relevante para desarrolladores que quieren ejecutar un modelo de ~27B con contexto largo en hardware de consumo o en una unica GPU profesional, sin renunciar a estabilidad en contextos extensos.

El modelo cubre once idiomas (incluido castellano) y esta etiquetado como compatible con endpoints y orientado a generacion de texto conversacional. La licencia declarada es Apache 2.0. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 dense hybrid (`Qwen3_5ForConditionalGeneration`); 64 capas, 48 de Gated DeltaNet (linear attention) y 16 de full attention; texto y vision |
| Parametros totales | 26.895.998.464 (aprox. 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla por tensor: Q6_K, Q5_K, Q4_K, Q4_0, Q8_0, IQ4_XS, IQ3_S, IQ3_XXS y F32 |
| Idiomas soportados | en, es, fr, de, it, pt, zh, ja, ko, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico fichero de 14,03 GB / 13,07 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de la familia Qwen3.5 con 64 capas: 48 capas de Gated DeltaNet (linear attention recurrente) y 16 capas de atencion completa. Esta combinacion busca reducir el coste computacional y de memoria del contexto largo manteniendo capacidad de atencion global en una fraccion de las capas. El checkpoint contiene 851 tensores y no incluye bloque MTP (multi-token prediction). El modelo base admite entrada de texto e imagen, aunque el proyector de vision (`mmproj`) no se incluye en este repositorio: el GGUF del modelo de lenguaje es autocontenido y la parte visual requiere el complemento upstream.

La cuantizacion de IsValorum aplica un mapa por tensor auditado directamente sobre los pesos compilados. Las 209 normalizaciones (RMSNorm y q/k norm) y los 192 tensores de escala recurrente del SSM (`ssm_alpha`, `ssm_a`, `ssm_dt.bias`, `ssm_conv1d`) se mantienen en F32 para preservar la estabilidad en contextos largos. La cabeza de salida (`output.weight`) usa Q6_K y los embeddings (`token_embd.weight`) Q4_K. En las capas SSM, `attn_gate` y `attn_qkv` usan Q4_K, `ssm_beta` Q8_0 y `ssm_out` Q5_K, con la capa 0 forzada a Q4_0 como frontera. En las capas de atencion completa, Q y K usan Q5_K, y V y la proyeccion de salida Q6_K. En el FFN, `ffn_down` usa IQ4_XS en las 64 capas, mientras que `ffn_gate` y `ffn_up` se zonifican: IQ3_S en las capas 0-15 y 48-63, e IQ3_XXS en las capas 16-47. La matriz de importancia (iMatrix) procede del GGUF de bartowski y se reutiliza sin recalcular. No hay informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno en once idiomas, incluido el castellano.
- Razonamiento y codigo: las colecciones del autor describen el modelo base como orientado a "frontier reasoning and coding".
- Procesamiento de vision en el modelo base (requiere el `mmproj` upstream, no incluido en este repositorio).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Soporte de contexto largo gracias a la combinacion de linear attention y full attention, aunque la longitud exacta no esta documentada.
- No se documenta soporte explicito de tool calling, function calling ni modos de agente en la informacion disponible.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Asistencia conversacional en castellano: el modelo declara soporte de es, fr, de, it, pt y otros idiomas, por lo que puede desplegarse como backend de chat multi-turno para usuarios hispanohablantes con un unico fichero GGUF de 14 GB.
- Generacion de codigo en local: la orientacion del modelo base a razonamiento y codigo permite integrarlo en editores o pipelines de revision con llama.cpp, sin depender de APIs externas.
- Despliegue en estaciones de trabajo con una sola GPU: los 13,07 GiB del fichero caben en GPUs de 16 GB o 24 GB, lo que facilita prototipado y demos sin infraestructura de cluster.
- Procesamiento de documentos largos: la mezcla de 48 capas de linear attention y 16 de atencion completa, junto con el mantenimiento en F32 de los parametros recurrentes, esta disenada para mantener estabilidad en contextos extensos; util para resumen y extraccion sobre textos largos.
- Experimentacion e investigacion: al ser una cuantizacion con mapa de tensores auditado y publicado (`tensor-map.tsv`), sirve para estudiar el impacto de precisiones mixtas en modelos hibridos SSM/attention.
- Escenarios con requisito de licencia permisiva: la licencia Apache 2.0 facilita su uso en productos comerciales, siempre que se respeten las condiciones de la licencia del modelo base.
- Analisis de imagenes (con matiz): si se anade el `mmproj` upstream, el modelo base puede procesar entradas visuales; util para prototipos de captioning o VQA en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 13,07 GiB; con overhead de contexto y cache KV, se recomienda al menos 16 GB de VRAM para contexto moderado y 24 GB para contextos amplios.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB) para contexto corto, A100 40/80 GB, H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas (RTX 4080, RTX 4090, RTX 3090, RTX 5090). En 12 GB no cabe el fichero completo en VRAM.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere integracion con servidores de inferencia tipo endpoint, aunque no se detalla cuales.
- Latencia y throughput: no disponibles.
- Alternativas de menor huella del mismo autor: NanoPlus (12,70 GB / 11,83 GiB) y MicroPlus (10,25 GB / 9,55 GiB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B VAL-APEX-I MiniPlus V3 (este) | ~27B | no disponible | Apache 2.0 | GGUF 14,03 GB | Cuantizacion mixta con F32 en SSM y normas |
| Arete-27B VAL-APEX-I NanoPlus V3 | ~27B | no disponible | Apache 2.0 | GGUF 12,70 GB | Menor huella, misma base |
| Arete-27B VAL-APEX-I MicroPlus V3 | ~27B | no disponible | Apache 2.0 | GGUF 10,25 GB | Menor huella, misma base |
| NousResearch/Arete-27B (base) | ~27B | no disponible | no disponible | safetensors | Pesos originales sin cuantizar |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de otros autores.

## Limitaciones y advertencias

- No se han publicado benchmarks: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- El proyector de vision (`mmproj`) no esta incluido; las capacidades visuales del modelo base no estan disponibles solo con este repositorio.
- La cuantizacion agresiva del FFN (IQ3_XXS en las capas 16-47) puede degradar la calidad frente a los pesos originales en tareas sensibles.
- No se documenta la longitud de contexto soportada, lo que impide planificar despliegues con contexto largo sin pruebas propias.
- Riesgo de alusiones y sesgos inherente al modelo base; no se documentan evaluaciones de sesgo ni de seguridad.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y sin validacion comunitaria.
- Aunque la licencia declarada es Apache 2.0, conviene verificar la licencia del modelo base NousResearch/Arete-27B antes de uso comercial.
- La fecha de creacion del repositorio (2026-11-06) es posterior a la fecha actual de referencia habitual; verificar la vigencia del artefacto antes de integrarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/IsValorum/Arete-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Coleccion estandar: https://huggingface.co/collections/IsValorum/val-apex-miniplus-standard-27b
- Coleccion abliterated: https://huggingface.co/collections/IsValorum/val-apex-miniplus-abliterated-27b
- Variante NanoPlus: https://huggingface.co/IsValorum/Arete-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Variante MicroPlus: https://huggingface.co/IsValorum/Arete-27B-VAL-APEX-I-MicroPlus-V3-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
