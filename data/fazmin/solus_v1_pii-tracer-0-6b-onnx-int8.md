# Fazmin/solus_v1_pii-tracer-0.6b-onnx-int8

## Resumen

PII-Tracer es un modelo de clasificación de tokens (token classification) desarrollado originalmente por Perplexity AI para detectar y etiquetar información personal identificable (PII) en texto en inglés. Esta ficha describe la versión `Fazmin/solus_v1_pii-tracer-0.6b-onnx-int8`, una exportación a ONNX con cuantización INT8 realizada por MaskMyAI y redistribuida por el usuario Fazmin, pensada para ejecutarse en CPU con ONNX Runtime sin dependencia de PyTorch. El objetivo es permitir la pseudonimización local de texto antes de enviarlo a un modelo de IA, de modo que los datos sensibles no abandonen el equipo del usuario.

El modelo se basa en la arquitectura Qwen3 (aproximadamente 0,6 mil millones de parámetros), adaptada como codificador bidireccional con una cabeza de etiquetado de 37 etiquetas en formato BIOES que cubren nueve tipos de PII: personas, correos electrónicos, teléfonos, direcciones, URL, fechas, números de cuenta, secretos y otra PII. La exportación fija el tamaño de lote a 1, no incluye máscara de atención y solo exporta la cabeza de etiquetado; la decodificación Viterbi restringida se ejecuta fuera del grafo, en la aplicación.

Su relevancia actual radica en que ofrece una alternativa ligera, reproducible y verificable (con sumas SHA-256 publicadas) para el cumplimiento de privacidad en pipelines de IA, ejecutable en hardware modesto. La licencia MIT del modelo original se mantiene, lo que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 adaptado como codificador bidireccional con cabeza de token classification |
| Parametros totales | aproximadamente 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamico (per-channel para MatMul y Gather, down_proj en fp32) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (Copyright 2026 Perplexity AI, Inc.) |
| Formato de pesos | ONNX (opset 17) + tokenizer.json + oznake.json |

## Arquitectura y entrenamiento

El modelo original es un Qwen3 de aproximadamente 0,6B parámetros reutilizado como codificador bidireccional para etiquetado de secuencias. La exportación ensambla el grafo a partir de `Qwen3Model` y los pesos del archivo safetensors del modelo base `perplexity-ai/PII-Tracer` (revisión `d25c16f2`), sin ejecutar el código de modelo descargado. El grafo ONNX tiene una única entrada `input_ids` de forma `[1, sequence]` en int64 y produce `logits` de forma `[1, sequence, 37]` en float32; no incluye máscara de atención y el tamaño de lote está fijado a 1.

La cuantización se realizó con `onnxruntime.quantization.quantize_dynamic`, aplicando INT8 por canal a las operaciones `MatMul` y `Gather`, manteniendo `down_proj` en fp32. Según la model card, en un conjunto de prueba sintético esta configuración coincidió con el modelo original en 51 de 55 casos, frente a 27 de 55 con cuantización por tensor y 2 de 55 con cuantización de 4 bits. La decodificación no forma parte del grafo: se aplica un Viterbi restringido a las transiciones BIOES válidas, con los sesgos `viterbi_b_bias` y `viterbi_e_bias` (ambos 0.0) definidos en `oznake.json`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Detección y etiquetado de PII en texto en inglés mediante token classification con 37 etiquetas BIOES.
- Identificación de nueve categorías: `private_person`, `private_email`, `private_phone`, `private_address`, `private_url`, `private_date`, `account_number`, `secret` y `other_pii`.
- Decodificación Viterbi restringida a transiciones BIOES válidas para garantizar coherencia en las secuencias de etiquetas.
- Ejecución en CPU sin PyTorch mediante ONNX Runtime.
- Exportación reproducible con sumas SHA-256 verificables para cada archivo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es exclusivamente un modelo de etiquetado.

## Casos de uso

- Pseudonimización local previa al envío de texto a APIs de IA: el modelo detecta nombres, correos y teléfonos en el texto del usuario y permite sustituirlos por marcadores antes de que el texto salga del equipo, cumpliendo con requisitos de privacidad.
- Cumplimiento de RGPD en pipelines de datos: integrado como paso previo al almacenamiento o procesamiento de logs y transcripciones, permite anonimizar campos sensibles de forma automática y auditable.
- Enmascarado de datos en herramientas de soporte al cliente: antes de registrar conversaciones en sistemas CRM o de analítica, el modelo identifica y oculta direcciones, números de cuenta y secretos presentes en los mensajes.
- Preprocesado de datasets para entrenamiento de modelos: filtrado y anonimización de corpus en inglés antes de su uso en fine-tuning, reduciendo el riesgo de memorización de PII.
- Redacción de documentos y correos: integración en editores o pasarelas de correo para resaltar y sustituir información personal antes de compartir borradores con terceros.
- Auditoría de privacidad en aplicaciones existentes: ejecución por lotes sobre muestras de texto para medir la prevalencia de PII y validar políticas de tratamiento de datos.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con un único archivo ONNX de aproximadamente 864 MB, puede incorporarse en portátiles, contenedores sin GPU o dispositivos edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una comparación interna sobre un conjunto sintético de 55 casos: la cuantización INT8 por canal coincidió con el modelo original en 51 de 55 casos, frente a 27 de 55 con cuantización por tensor y 2 de 55 con cuantización de 4 bits.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica para ejecución en CPU; el archivo ONNX INT8 ocupa aproximadamente 864 MB en disco y requiere memoria RAM proporcional al tamaño del modelo más el overhead de ONNX Runtime.
- GPU recomendadas: no especificadas; el modelo está diseñado para CPU. Cualquier GPU con soporte de ONNX Runtime podría ejecutarlo, pero no se han publicado requisitos ni recomendaciones.
- Compatibilidad con GPU de consumo: no disponible; al ser un modelo de 0,6B en INT8, cabría en GPUs de consumo con suficiente memoria, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime (librería `onnxruntime`), con tokenizador cargado mediante `tokenizers`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Fazmin/solus_v1_pii-tracer-0.6b-onnx-int8 | aprox. 0,6B | no disponible | MIT | ONNX INT8 | Exportación cuantizada para CPU |
| perplexity-ai/PII-Tracer | aprox. 0,6B | no disponible | MIT | safetensors | Modelo base original en PyTorch |
| maskmyai/pii-tracer-onnx | aprox. 0,6B | no disponible | MIT | ONNX | Exportación original de la que deriva esta copia |

No se dispone de información sobre otros modelos comparables de detección de PII en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- El tamaño de lote está fijado a 1 y no hay máscara de atención, lo que limita el procesamiento por lotes y puede afectar al manejo de secuencias con padding.
- La decodificación Viterbi no forma parte del grafo ONNX; es responsabilidad de la aplicación implementarla correctamente para obtener resultados coherentes.
- La cuantización INT8 introduce una degradación medida de 4 casos sobre 55 en el conjunto sintético de prueba; en datos reales el impacto podría ser mayor.
- Riesgo de falsos negativos y falsos positivos en la detección de PII, con posibles consecuencias de privacidad si se confía únicamente en el modelo.
- No se han publicado evaluaciones sobre sesgos, alucinación (no aplica en sentido generativo, pero sí en etiquetado erróneo) ni robustez ante dominios específicos.
- La licencia MIT permite uso comercial, pero se recomienda conservar el aviso de copyright original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación por parte de la comunidad.
- Se recomienda verificar las sumas SHA-256 de los archivos antes de su uso, tal como indica la model card.

## Enlaces

- [Fazmin/solus_v1_pii-tracer-0.6b-onnx-int8 en Hugging Face](https://huggingface.co/Fazmin/solus_v1_pii-tracer-0.6b-onnx-int8)
- [perplexity-ai/PII-Tracer (modelo base)](https://huggingface.co/perplexity-ai/PII-Tracer)
- [maskmyai/pii-tracer-onnx (exportación original)](https://huggingface.co/maskmyai/pii-tracer-onnx)
- [Commit de la exportación original](https://huggingface.co/maskmyai/pii-tracer-onnx/tree/2f2b8014bbbca7f1aa2795adb3af8aa80b3a0b58)
- [Revisión del modelo base utilizada](https://huggingface.co/perplexity-ai/PII-Tracer/tree/d25c16f2e57e321f6d2527715c01df9112f956f5)
