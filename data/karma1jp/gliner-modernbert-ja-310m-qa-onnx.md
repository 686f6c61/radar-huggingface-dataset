# karma1jp/gliner-modernbert-ja-310m-qa-onnx

## Resumen

GLiNER2 ModernBERT-ja 310M QA ONNX es una exportación en formato ONNX del encoder de extracción de respuestas del modelo `karma1jp/gliner-modernbert-ja-310m-qa`, construido sobre el modelo base japonés `sbintuitions/modernbert-ja-310m`. No se trata de un modelo generativo autónomo, sino de un componente de codificación que produce representaciones (`last_hidden_state`) que después se pasan a una cabeza de extracción de límites de GLiNER2 para localizar frases o sentencias de respuesta en documentos japoneses. Lo publica el usuario `karma1jp` y su interés práctico reside en el despliegue en Windows ML mediante DirectML con precisión mixta.

La innovación principal es la mezcla de precisiones: RoPE, proyecciones lineales, normalizaciones y pesos se mantienen en FP32, mientras que las dos multiplicaciones matriciales dentro de la atención, la suma de máscara y el softmax se ejecutan en FP16. El archivo resultante pesa 1.259.160.616 bytes (unos 1,3 GB) y está pensado para inferencia con batch de 1 y longitud de tokens variable.

El modelo está orientado exclusivamente al japonés y su pipeline declarado en Hugging Face es `feature-extraction`. Con 310M parámetros en el encoder base, es un componente ligero para tareas de question answering extractivo y reconocimiento de entidades en pipelines de extracción estructurada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) con cabeza GLiNER2 externa; exportado a ONNX opset 19, IR 9 |
| Parámetros totales | 310M (modelo base `sbintuitions/modernbert-ja-310m`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tokens de entrada variables; validado con 2.337 tokens) |
| Tipos de cuantización | Precisión mixta FP32/FP16 (atención en FP16, resto en FP32); no se documentan GGUF ni INT8 |
| Idiomas soportados | Japonés (ja) |
| Licencia | no disponible en la ficha del repo; incluye `LICENSE-MODERNBERT` con la licencia MIT del modelo base |
| Formato de pesos | ONNX (`modernbert-ja-310m-qa-attention-fp16.onnx`) |

## Arquitectura y entrenamiento

El componente es un encoder ModernBERT de 310M parámetros adaptado al japonés, exportado a ONNX. La exportación mantiene en FP32 las rotaciones posicionales (RoPE), las proyecciones lineales, las normalizaciones y los pesos, y baja a FP16 únicamente las dos multiplicaciones matriciales de la atención, la suma de la máscara y el softmax. La entrada son `input_ids` y `attention_mask` en `int64` con forma `[1, tokens]`, y la salida es `last_hidden_state` en `float32` con forma `[1, tokens, 768]`. El modelo no incluye la cabeza de extracción: para obtener frases o sentencias de respuesta hay que pasar la salida a la cabeza de límites de GLiNER2 del modelo original `karma1jp/gliner-modernbert-ja-310m-qa`.

No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) ni el proceso de ajuste del modelo original hacia la tarea de QA extractivo. La conversión parte de la revisión `e257969a48809ee3043f3fa9c74edd911bb98b39` del modelo fuente. La verificación funcional se realizó con Windows ML (ONNX Runtime 1.25.2 y `DmlExecutionProvider`) sobre una GPU integrada Intel Arc.

## Capacidades

- Codificación de texto japonés para extracción de respuestas y entidades (feature extraction).
- Generación de representaciones contextuales de 768 dimensiones por token.
- Extracción de frases y sentencias de respuesta al combinarse con la cabeza GLiNER2 del modelo original.
- Procesamiento de entradas largas: validado con secuencias de 2.337 tokens.
- Inferencia con batch de 1 y longitud de tokens variable.
- Ejecución acelerada en Windows ML mediante DirectML.
- No incluye generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Extracción de respuestas en documentación japonesa: dado un documento y una pregunta, el encoder produce los estados ocultos que la cabeza GLiNER2 usa para localizar la frase de respuesta; adecuado para bases de conocimiento internas en japonés.
- Reconocimiento de entidades nombradas (NER) en textos japoneses: el encoder sirve como base para tareas de etiquetado de spans mediante cabezas GLiNER2.
- Procesamiento por lotes en pipelines de extracción estructurada: con batch de 1 y tokens variables, encaja en colas de documentos de longitud heterogénea.
- Despliegue en estaciones Windows con GPU integrada: la verificación en Intel Arc con DirectML permite ejecutar la extracción sin GPU dedicada.
- Indexación semántica de corpus japoneses: los embeddings por token pueden alimentar etapas posteriores de búsqueda o clasificación.
- Extracción de campos en formularios y contratos japoneses: combinado con la cabeza de límites, permite localizar valores concretos (fechas, importes, nombres) en documentos escaneados tras OCR.
- Preprocesado para sistemas RAG en japonés: el encoder puede usarse como etapa de localización de evidencia antes de un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card aporta mediciones de latencia y consistencia frente a la versión FP32:

| Medición | FP32 | Precisión mixta FP16 |
|---|---|---|
| Extracción de respuesta con 2.337 tokens (mediana, Intel Arc, DirectML) | 3,52 s | 3,15 s |
| Diferencia de confianza máxima (7 casos) | — | 0,00141 |
| Coincidencia de cadena, posición y orden (7 casos) | — | Idéntica a FP32 |

La diferencia de velocidad en dos ejemplos cortos quedó dentro de la variabilidad de la medición.

## Requisitos de hardware

- Tamaño del archivo ONNX: 1.259.160.616 bytes (aproximadamente 1,3 GB), lo que determina el espacio en disco y buena parte de la memoria necesaria.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del archivo y la mezcla FP32/FP16, se sitúa en el orden de varios GB.
- GPU validadas: GPU integrada Intel Arc mediante `DmlExecutionProvider` de Windows ML (ONNX Runtime 1.25.2).
- GPU dedicadas (A100, H100, RTX 4090): no se documenta su uso ni rendimiento en la información disponible.
- Despliegue: ONNX Runtime con DirectML en Windows ML; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia medida: 3,15 s de mediana para una extracción completa de 2.337 tokens en Intel Arc integrada.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| karma1jp/gliner-modernbert-ja-310m-qa-onnx | 310M | no disponible (validado 2.337 tokens) | ja | no disponible (base MIT) | ONNX |
| karma1jp/gliner-modernbert-ja-310m-qa (fuente) | 310M | no disponible | ja | no disponible (base MIT) | safetensors (no confirmado) |
| sbintuitions/modernbert-ja-310m (base) | 310M | no disponible | ja | MIT | safetensors (no confirmado) |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la comparación FP32 frente a precisión mixta de la propia model card.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas por sí mismo, solo produce representaciones que requieren la cabeza GLiNER2 del modelo original.
- Solo soporta japonés; no hay capacidades multilingües documentadas.
- El pipeline declarado es `feature-extraction`; usarlo fuera de ese propósito no está validado.
- Licencia del repositorio no disponible: aunque se incluye el texto MIT del modelo base, no se confirma la licencia del artefacto derivado ni sus condiciones de uso comercial.
- La validación se limita a 7 ejemplos y una GPU integrada Intel Arc con DirectML; el comportamiento en otras GPU o backends no está documentado.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de extracción incorrecta de spans en textos ambiguos o con respuestas repetidas.
- Sin datos publicados sobre sesgos, composición del corpus de entrenamiento ni robustez fuera del dominio evaluado.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/karma1jp/gliner-modernbert-ja-310m-qa-onnx
- Modelo fuente: https://huggingface.co/karma1jp/gliner-modernbert-ja-310m-qa
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-310m
