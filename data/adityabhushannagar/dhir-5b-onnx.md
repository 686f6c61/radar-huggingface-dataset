# adityabhushannagar/Dhir-5B-ONNX

## Resumen

Dhir 5B es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por ZenteiQ AiTech Innovations dentro de la familia BrahmAI, orientado a generación de texto y tool calling en idiomas indios y en inglés. El modelo base `adityabhushannagar/Dhir-5B` se distribuye bajo licencia Apache 2.0, y esta ficha describe su exportación a ONNX Runtime publicada por el mismo autor bajo el identificador `Dhir-5B-ONNX`.

La exportación ONNX es relevante porque elimina la dependencia de PyTorch, `transformers` y `trust_remote_code`, permitiendo ejecutar el modelo en entornos ligeros con `onnxruntime` como única dependencia de inferencia. Se ofrecen cuatro variantes de precisión: `q4` (3,68 GB), `mixed` (4,08 GB), `q8` (5,58 GB) y `fp32` (20,4 GB), lo que permite desplegar el modelo en CPU desde equipos de consumo hasta servidores con 22 GB de RAM.

El modelo cubre once idiomas (inglés, hindi, guyaratí, bengalí, canarés, malabar, maratí, oriya, panyabí, tamil y telugu) y conserva el formato nativo de tool calling del modelo original mediante una plantilla de chat idéntica. La exportación está pensada para escenarios de inferencia en CPU y despliegues sin GPU, con velocidades de decodificación medidas de 13,5 tok/s para `q4` en 4 vCPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con capas MoE de top-2 expertos (sparse) |
| Parametros totales | 5B (aproximado, segun el nombre del modelo; no se detalla el desglose exacto) |
| Parametros activos | no disponible (top-2 expertos por token, sin recuento publicado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (QMoE para expertos), int8 (MatMulNBits, per-channel para expertos), mixta int8/int4, fp32 |
| Idiomas soportados | en, hi, gu, bn, kn, ml, mr, or, pa, ta, te |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (model_q4.onnx, model_mixed.onnx, model_q8.onnx, model.onnx + model.onnx_data*) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder con capas de mezcla de expertos dispersas que seleccionan los dos expertos mejor puntuados por token (top-2). La exportación ONNX utiliza los operadores `com.microsoft.MoE` (en fp32) y `com.microsoft.QMoE` (en variantes cuantizadas) para las capas de expertos, y `com.microsoft.MatMulNBits` para las capas lineales cuantizadas. El grafo es un decoder estándar con caché KV y nombres de entrada/salida compatibles con las exportaciones de Optimum y transformers.js (`input_ids`, `attention_mask`, etc.).

En cuanto a la cuantización, se aplica redondeo al más cercano con tamaño de bloque 32: MatMulNBits asimétrico para las lineales y QMoE simétrico (4 bits por bloques, 8 bits per-channel). En todas las variantes cuantizadas la tabla de embeddings se almacena en fp16, mientras que las normas, el router y la caché KV permanecen en fp32. La variante `mixed` usa 8 bits en todas las proyecciones de atención y en `lm_head`, y 4 bits en todos los expertos. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno en once idiomas, con especial cobertura de lenguas indias.
- Tool calling / function calling nativo: emite llamadas en formato `<tool_call>{"name": ..., "arguments": ...}</tool_call>` y acepta mensajes de rol `tool` con el resultado para continuar la conversación.
- Razonamiento multi-paso mediante el bucle de herramientas (el modelo propone la llamada, el orquestador la ejecuta y el modelo continúa).
- Plantilla de chat reproducible token a token mediante `DhirONNX.render()`, verificada contra `tokenizer.apply_chat_template` de `transformers`.
- Tokenización compatible con `PreTrainedTokenizerFast.from_pretrained` sin necesidad de código remoto.
- Inferencia en CPU sin PyTorch ni `transformers` como dependencias de ejecución.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Asistentes conversacionales en lenguas indias: el modelo cubre hindi, tamil, telugu, bengalí y otras siete lenguas, lo que permite desplegar un único modelo para atención al usuario en varios mercados del sur de Asia sin cambiar de checkpoint.
- Tool calling en agentes ligeros: con el formato nativo `<tool_call>`, se puede integrar en un orquestador que resuelva consultas como clima, reservas o consultas a bases de datos, ejecutando la llamada fuera del modelo y devolviendo el resultado por el rol `tool`.
- Despliegue en CPU sin GPU: la variante `q4` (3,68 GB) permite servir el modelo en servidores sin acelerador, con 13,5 tok/s en 4 vCPU, adecuado para backends de bajo tráfico o entornos edge.
- Procesamiento de documentos y resúmenes multilingües: la ventana de contexto (no publicada) y el soporte de once idiomas permiten tareas de extracción y resumen sobre textos en inglés e idiomas indios.
- Integración en aplicaciones de escritorio o móviles: al no requerir PyTorch ni `transformers`, el runtime ONNX se puede empaquetar en aplicaciones nativas con un footprint de dependencias reducido.
- Evaluación y prototipado de modelos MoE: las cuatro variantes con métricas de fidelidad publicadas (top-1 y KL frente al original) permiten comparar el impacto de la cuantización en la calidad de salida antes de fijar una variante para producción.
- Pipelines de CI/CD para validación de modelos: la variante `fp32` sirve como referencia exacta (diferencia máxima de logits de 8e-6 frente a PyTorch fp32 en una porción de 3 capas) para pruebas de regresión numérica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye métricas de fidelidad de la cuantización frente al modelo original en bf16, medidas sobre dos prompts largos (inglés e hindi) con 49 pasos de decodificación con caché KV:

| Variante | Tamano | Top-1 (pasos coincidentes) | KL medio | Velocidad CPU (tok/s, 4 vCPU) |
|---|---|---|---|---|
| q4 | 3,68 GB | 89/98 | 0,074 | 13,5 |
| mixed | 4,08 GB | 88/98 | 0,043 | 11,5 |
| q8 | 5,58 GB | 96/98 | 0,0012 | 2,4 |
| fp32 | 20,4 GB | exacto (max logit diff 8e-6 en porción de 3 capas) | no aplica | no disponible |

La velocidad se midió con onnxruntime 1.31.1 generando 64 tokens nuevos en un único flujo. El kernel QMoE de 8 bits en CPU es notablemente más lento que el de 4 bits, por lo que la model card recomienda `mixed` sobre `q8` salvo que se requiera una salida casi sin pérdida.

## Requisitos de hardware

- RAM estimada: `q4` ~3,7 GB, `mixed` ~4,1 GB, `q8` ~5,6 GB, `fp32` ~22 GB (los pesos fp32 se reparten en cinco ficheros `model.onnx_data*` que deben acompañar a `model.onnx`).
- GPU: no se documentan requisitos ni pruebas en GPU; la exportación está probada en CPU con onnxruntime 1.31.1.
- Consumer GPU: el modelo cabe en GPUs de consumo por VRAM, pero la model card no valida el despliegue en GPU, por lo que no se puede confirmar el rendimiento en RTX 4090 u otras.
- Despliegue: `onnxruntime` (probado en 1.31.1), con script `generate_onnx.py` incluido en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta exportación.
- Latencia y throughput: 13,5 tok/s (`q4`), 11,5 tok/s (`mixed`) y 2,4 tok/s (`q8`) en decodificación de un solo flujo con 4 vCPU y 64 tokens nuevos.
- Nota operativa: las versiones recientes de onnxruntime rechazan pesos externos alcanzados por enlaces simbólicos de la caché de Hugging Face; es necesario usar `--local-dir` o `local_dir` al descargar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de referencia estructural, se indica lo siguiente:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Dhir-5B-ONNX | 5B (MoE top-2) | no disponible | apache-2.0 | ONNX (q4, mixed, q8, fp32) |
| Dhir-5B (base) | 5B (MoE top-2) | no disponible | apache-2.0 | safetensors (bf16/fp32) |
| Alternativas de 5B con soporte de idiomas indios | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o robustez para el modelo base ni para esta exportación.
- Riesgo de alucinación inherente a un modelo de 5B; la model card remite a la del modelo original para precauciones de uso, sin detallarlas.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con prompts largos sin validación previa.
- La cuantización introduce degradación medible: `q4` y `mixed` coinciden con el original en 88-89 de 98 pasos de decodificación, con KL de 0,074 y 0,043 respectivamente; `q8` es casi sin pérdida (96/98, KL 0,0012).
- El rendimiento en GPU no está validado; las velocidades publicadas corresponden exclusivamente a CPU.
- El kernel QMoE de 8 bits en CPU es lento (2,4 tok/s), por lo que `q8` no es adecuado para servir en CPU con requisitos de latencia.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la model card del modelo original para condiciones adicionales de atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 11 de noviembre de 2026; se trata de una exportación reciente sin validación comunitaria.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/adityabhushannagar/Dhir-5B-ONNX
- Modelo base: https://huggingface.co/adityabhushannagar/Dhir-5B
- ONNX Runtime: https://onnxruntime.ai
