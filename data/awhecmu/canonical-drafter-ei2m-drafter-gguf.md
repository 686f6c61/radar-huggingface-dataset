# awhecmu/canonical-drafter-ei2m-drafter-GGUF

## Resumen

El modelo `awhecmu/canonical-drafter-ei2m-drafter-GGUF` es una cuantización GGUF del drafter `awhecmu/canonical-drafter-ei2m-drafter`, un modelo auxiliar para decodificación especulativa. Según la model card, se trata de un modelo basado en Qwen3.5-9B con ajuste fino de parámetros completos (full-parameter SFT) y un entrenamiento descrito como "round-2 expert-iteration drafter". Su función principal no es actuar como un modelo de propósito general, sino como un drafter que predice tokens futuros para acelerar la inferencia de un modelo base en sistemas como llama.cpp.

El repositorio contiene dos archivos GGUF: `ei2m-drafter-Q8_0.gguf` y `ei2m-drafter-Q5_K_M.gguf`. El modelo tiene 8.953.803.264 parámetros (aproximadamente 8,95B) y es exclusivamente de texto, sin soporte de visión. La conversión se realizó con llama.cpp `f114f91`, utilizando la opción `--no-mtp`, necesaria porque el config declara una capa de predicción multi-token (MTP) que no se exportó en los pesos.

La relevancia de este modelo radica en su papel dentro de la decodificación especulativa: permite reducir la latencia de generación en modelos grandes, especialmente en entornos donde la velocidad de inferencia es crítica. Sin embargo, al ser un drafter especializado, su uso requiere integrarse con el modelo base correspondiente y seguir el contrato de servicio documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5-9B (full-parameter SFT) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluado con contexto 4096) |
| Tipos de cuantizacion | Q8_0, Q5_K_M |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo es un drafter para decodificación especulativa, basado en la arquitectura de Qwen3.5-9B. Según la documentación del autor, se entrenó mediante ajuste fino de todos los parámetros (full-parameter SFT) sobre el dataset `awhecmu/canonical-drafter-ei2m-sft`, que contiene 41.500 filas (40.700 de entrenamiento y 843 de validación). El proceso se describe como "round-2 expert-iteration drafter", lo que sugiere un entrenamiento iterativo con datos generados por el propio sistema o por un proceso de iteración de expertos.

Un aspecto técnico destacable es la discrepancia en la configuración: el archivo de configuración declara una capa de predicción multi-token (`mtp_num_hidden_layers: 1`), pero el checkpoint exportado no contiene tensores `mtp.*`. Por ello, la conversión a GGUF requiere la opción `--no-mtp`; de lo contrario, el archivo resultante no carga correctamente y muestra el error `tensor 'blk.32.attn_norm.weight' not found`. Este mismo desajuste impide que el conversor online de GGUF funcione con el checkpoint fuente.

No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT. El modelo es exclusivamente de texto y no incluye un proyector multimodal (mmproj).

## Capacidades

- Generación de texto en formato XML de tool calls, específicamente con la etiqueta `<tool_call>`.
- Soporte de la herramienta `have`, que debe pasarse en el campo `tools` del prompt.
- Función principal: actuar como drafter para decodificación especulativa, acelerando la inferencia de un modelo base.
- Requiere `enable_thinking: false`; no soporta un modo de pensamiento explícito ni bloques de pensamiento.
- Modelo solo de texto, sin capacidades de visión, audio o multimodal.
- Etiquetado con `lean4`, lo que sugiere un posible uso en generación de código Lean, aunque no se detalla en la documentación.
- Compatible con llama.cpp y el formato GGUF, con cuantizaciones Q8_0 y Q5_K_M.

## Casos de uso

- Aceleración de inferencia en llama.cpp: al ser un drafter, puede integrarse como modelo auxiliar en sistemas de decodificación especulativa, reduciendo la latencia en la generación de textos largos cuando se combina con el modelo base correspondiente.
- Generación de tool calls en agentes: el modelo emite llamadas a herramientas en XML, por lo que puede utilizarse en pipelines de agentes que requieran invocar la herramienta `have` de forma estructurada.
- Evaluación de cuantizaciones: los valores de perplejidad (PPL) publicados permiten comparar la calidad de Q8_0 y Q5_K_M frente al modelo BF16, lo que resulta útil para validar el impacto de la cuantización en la calidad de salida.
- Investigación en iteración de expertos: el modelo sirve como referencia en experimentos de expert iteration, donde un drafter se entrena de forma iterativa sobre trazas generadas por el propio sistema, como las del dataset `canonical-drafter-ei2-traces`.
- Despliegue en entornos con recursos limitados: la cuantización Q5_K_M reduce la huella de memoria, permitiendo ejecutar el modelo en GPUs de gama media o en CPU mediante llama.cpp, siempre que se disponga de suficiente RAM.
- Pruebas de integración en CI/CD: al ser un modelo de 9B y estar disponible en GGUF, puede usarse en pruebas automatizadas de generación de tool calls o de código, aunque no sustituye a un modelo de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la perplejidad medida sobre 48 filas de validación del dataset `awhecmu/canonical-drafter-ei2m-sft`, con contexto 4096 y 12 chunks:

| Metrica | BF16 | Q8_0 | Q5_K_M |
|---|---|---|---|
| Perplejidad (val, ctx 4096) | 1.7701 | 1.7681 | 1.7205 |

Además, el autor indica que una completación greedy sobre un prompt de validación produjo una llamada a la herramienta `have` bien formada para todas las cuantizaciones listadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en Q8_0 ocupan aproximadamente 9 GB, mientras que en Q5_K_M ocupan unos 5,5 GB. A esto hay que sumar la memoria de la KV cache, que depende de la longitud de contexto y del número de capas; no se dispone de datos exactos. Como estimación orientativa, se necesitarían al menos 12 GB de VRAM para Q8_0 y 8 GB para Q5_K_M en GPU.
- GPU recomendadas: no disponible. El modelo puede ejecutarse en GPUs de 12-16 GB (por ejemplo, RTX 4070 Ti, RTX 4080) con la cuantización Q5_K_M, y en GPUs de 24 GB como la RTX 4090 con Q8_0. También es viable ejecutarlo en CPU con llama.cpp si se dispone de suficiente RAM.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF), así como cualquier servidor compatible con el formato GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face, aunque no se detalla el procedimiento.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros drafter o modelos comparables. El modelo es un drafter especializado, no un modelo de propósito general, por lo que la comparación directa con modelos como Qwen3.5-9B no es significativa sin datos de rendimiento adicionales.

## Limitaciones y advertencias

- El modelo es un drafter, no un modelo autónomo; su uso principal es como auxiliar en decodificación especulativa, y no debe emplearse como modelo de propósito general.
- La conversión a GGUF requiere la opción `--no-mtp`. Si se omite, el archivo no carga y se produce el error `tensor 'blk.32.attn_norm.weight' not found`.
- No hay información sobre la licencia, por lo que el uso comercial es incierto y debe verificarse antes de desplegarlo en producción.
- No se han publicado benchmarks estándar; solo se dispone de perplejidad en un conjunto de validación reducido (843 filas).
- El dataset de entrenamiento es pequeño (41.500 filas), lo que puede limitar la generalización del modelo.
- No hay datos sobre sesgos, alucinaciones o idiomas soportados.
- El modelo es exclusivamente de texto; no soporta visión, audio ni entradas multimodales.
- Requiere `enable_thinking: false`; no soporta modo de pensamiento explícito ni bloques de pensamiento.

## Enlaces

- Repositorio GGUF: [https://huggingface.co/awhecmu/canonical-drafter-ei2m-drafter-GGUF](https://huggingface.co/awhecmu/canonical-drafter-ei2m-drafter-GGUF)
- Modelo base: [https://huggingface.co/awhecmu/canonical-drafter-ei2m-drafter](https://huggingface.co/awhecmu/canonical-drafter-ei2m-drafter)
- Dataset SFT: [https://huggingface.co/datasets/awhecmu/canonical-drafter-ei2m-sft](https://huggingface.co/datasets/awhecmu/canonical-drafter-ei2m-sft)
- Dataset de trazas: [https://huggingface.co/datasets/awhecmu/canonical-drafter-ei2-traces](https://huggingface.co/datasets/awhecmu/canonical-drafter-ei2-traces)
- Repositorio CanonicalDrafter (referenciado en la model card, sin URL disponible)
