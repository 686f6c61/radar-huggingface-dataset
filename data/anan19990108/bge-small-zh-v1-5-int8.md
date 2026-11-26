# anan19990108/bge-small-zh-v1.5-int8

## Resumen

bge-small-zh-v1.5-int8 es una exportación cuantizada a INT8 del modelo de embeddings BAAI/bge-small-zh-v1.5, orientada específicamente a la inferencia en el acelerador HTP (Hexagon Tensor Processor) de Qualcomm. El autor de la exportación es el usuario de Hugging Face anan19990108, mientras que el checkpoint original pertenece a BAAI (Beijing Academy of Artificial Intelligence). El modelo resuelve el problema de generar embeddings densos de 512 dimensiones para texto en chino sobre hardware móvil y embebido con aceleración NPU, algo relevante para aplicaciones de búsqueda semántica y recuperación en dispositivos con recursos limitados.

La propuesta de valor no es el modelo base en sí, sino el paquete de despliegue: tres formatos precompilados (QNN nativo, ONNX con QDQ y TFLite con delegado QNN) que ejecutan en W8A8 sobre HTP v73, con la tokenización y la normalización L2 delegadas al host. Según la model card, el modelo base es un transformer de embeddings de pequeño tamaño (la familia bge-small ronda los 24 millones de parámetros), con un contexto de entrada de 512 tokens en su versión original, aunque la exportación documentada trabaja con entradas de 128 tokens.

La relevancia actual radica en la latencia: la exportación nativa pasa de unos 57,8 ms a 3,6 ms en mediana (p50) frente a la versión en coma flotante, con una pérdida de calidad medida en Spearman de 0,76728 a 0,73750 sobre el split de test de C-MTEB/STSB. Es un artefacto muy especializado, con solo 7 descargas, y debe tratarse como una receta de despliegue reproducible más que como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo de embeddings BERT-like de la familia BGE-small); exportado a QNN, ONNX QDQ y TFLite |
| Parametros totales | no disponible en la informacion proporcionada (la familia bge-small ronda los 24 M, dato no confirmado en la ficha del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en la exportacion documentada (entrada de 128 tokens); el modelo base BAAI/bge-small-zh-v1.5 soporta 512 tokens |
| Tipos de cuantizacion | INT8 W8A8 (pesos y activaciones), exportacion nativa QNN, ONNX QDQ y TFLite |
| Idiomas soportados | zh (chino) |
| Licencia | MIT |
| Formato de pesos | QNN nativo (`context_qnn.bin`), ONNX QDQ (`model.onnx`), TFLite (`model.tflite`); el checkpoint fuente original es safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un encoder transformer de la familia BGE-small de BAAI, entrenado para producir embeddings de frases de 512 dimensiones mediante aprendizaje contrastivo y normalización L2. La exportación cuantizada no reentrena el modelo: parte del checkpoint `model.safetensors` de BAAI/bge-small-zh-v1.5 (revisión `7999e1d3359715c523056ef9478215996d62a620`) y lo convierte a ejecución INT8 W8A8 sobre el HTP de Qualcomm.

La innovación técnica está en el pipeline de despliegue: tokenización y normalización L2 en el host, batch size 1, entrada de 128 tokens y tres artefactos equivalentes para distintos runtimes (QAIRT 2.47.0.260601, ONNX Runtime 1.24.4 con QNN EP y TFLite C 2.11.1 con delegado QNN). El contexto QNN nativo es específico para QCS8550 HTP v73 y QAIRT 2.47.0.260601. No se documentan datos de entrenamiento adicionales, RLHF ni DPO, ya que se trata de una cuantización post-entrenamiento del modelo original.

## Capacidades

- Generación de embeddings de texto en chino de 512 dimensiones, normalizados L2 en el host.
- Similitud semántica entre frases (coseno), validada sobre STSB de C-MTEB.
- Extracción de características (`feature-extraction`) para pipelines de recuperación y clustering.
- Ejecución acelerada en NPU Qualcomm HTP v73 (W8A8) con tres backends alternativos.
- Soporte de despliegue en Linux aarch64 vía ADB y QAIRT; también ONNX Runtime con QNN EP y TFLite con delegado QNN.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un modelo de embeddings puro.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles Android: el modelo genera embeddings de consultas y documentos en el propio dispositivo sobre la NPU Hexagon, con latencias p50 de ~3,6 ms por frase, lo que permite indexar y recuperar sin enviar texto a la nube.
- Recuperación aumentada (RAG) en local para asistentes en chino: los embeddings de 512 dimensiones alimentan un índice vectorial embebido, manteniendo la privacidad del contenido del usuario.
- Deduplicación y clustering de textos en chino: la similitud coseno entre embeddings permite agrupar titulares, reseñas o tickets de soporte en lotes grandes con coste energético bajo.
- Clasificación zero-shot por similitud: comparar la representación de un texto con la de etiquetas candidatas para enrutar consultas o moderar contenido sin entrenar un clasificador.
- Detección de similitud y plagio en corpus pequeños: la validación sobre STSB (1.361 pares de test) demuestra utilidad para puntuar pares de frases.
- Filtrado previo en pipelines de moderación o recomendación en el borde: usar el embedding INT8 como primera etapa barata antes de un modelo mayor en servidor.
- Prototipado de despliegue en hardware Qualcomm: sirve como referencia reproducible para validar QAIRT, ONNX QNN EP o TFLite con delegado QNN antes de portar modelos mayores.

## Benchmarks y rendimiento

| Runtime y alcance de medida | Split C-MTEB/STSB | Spearman, original → INT8 | p50 / p95 ms, float → INT8 |
|---|---|---:|---:|
| QNN native backend execute | Test, 1.361 pares | 0,76728 → 0,73750 | 57,772 / 58,061 → 3,615 / 3,628 |
| ONNX QNN EP `Session.Run` | Test, 1.361 pares | 0,76728 → 0,73750 | 58,1208 / 58,4633 → 3,64188 / 3,65453 |
| TFLite QNN `Invoke` | Validación reservada, 1.061 pares | 0,80410 → 0,77702 | 5,83104 / 5,85052 → 3,97099 / 3,99474 |

Cada comparativa temporal usa el build en coma flotante correspondiente, 10 warmups y una inferencia cronometrada por frase; tokenización y normalización quedan fuera de la región medida. La exportación nativa pierde 0,02978 de Spearman frente al límite de 0,03 declarado por el autor. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Qualcomm QCS8550 con HTP v73; el contexto QNN nativo es específico de esa combinación y de QAIRT 2.47.0.260601.
- VRAM: no aplica; el modelo ejecuta en NPU/CPU de SoC, no en GPU discreta. El repo ocupa 0,1 GB.
- GPU recomendadas: no disponible; no está pensado para GPU convencionales (A100, H100, RTX 4090).
- Consumer GPU: no aplica en la configuración documentada; requeriría reexportación para otros backends.
- Despliegue: QAIRT con `qnn-net-run`, ONNX Runtime 1.24.4 con QNN EP, TFLite C 2.11.1 con delegado QNN; flujo vía ADB sobre Linux aarch64.
- Latencia: p50 de 3,615 ms (QNN nativo), 3,642 ms (ONNX QNN EP) y 3,971 ms (TFLite QNN) por frase de 128 tokens; throughput no documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| anan19990108/bge-small-zh-v1.5-int8 | no disponible (base bge-small) | 128 tokens en la exportación | zh | MIT | QNN, ONNX QDQ, TFLite INT8 |
| BAAI/bge-small-zh-v1.5 | ~24 M (dato de la familia, no confirmado aquí) | 512 tokens | zh | MIT | safetensors (FP32) |
| BAAI/bge-base-zh-v1.5 | no disponible | 512 tokens | zh | MIT | safetensors |
| BAAI/bge-large-zh-v1.5 | no disponible | 512 tokens | zh | MIT | safetensors |

La comparación directa en calidad solo está disponible frente al propio modelo base en coma flotante (Spearman 0,76728 → 0,73750 en STSB test). No hay datos de benchmarks frente a bge-base ni bge-large en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta chino; no está validado para otros idiomas.
- La exportación documentada usa entradas de 128 tokens, muy por debajo del contexto de 512 tokens del modelo base, lo que limita textos largos.
- La pérdida de calidad es medible: −0,02978 de Spearman en la exportación nativa, justo por debajo del límite de 0,03 que declara el autor; en TFLite la caída es de 0,02708.
- El contexto QNN nativo está atado a QCS8550 HTP v73 y QAIRT 2.47.0.260601; no es portable a otro hardware o versión de SDK sin reexportar.
- La model card advierte de un desajuste histórico entre cabeceras y runtime en la validación TFLite; conviene revisar `evaluation/results.json` antes de usar otro build del SDK.
- Riesgo de alucinación no aplica directamente (no genera texto), pero los embeddings pueden producir similitudes engañosas en dominios fuera de distribución.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el repo tiene 7 descargas y 0 likes, por lo que la validación comunitaria es mínima.
- Requiere aportar los binarios del SDK de Qualcomm por cuenta propia; no se distribuyen en el repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/bge-small-zh-v1.5-int8
- Modelo base: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Checkpoint fuente (revisión fijada): https://huggingface.co/BAAI/bge-small-zh-v1.5/blob/7999e1d3359715c523056ef9478215996d62a620/model.safetensors
- Registro de validación: `evaluation/results.json` dentro del repositorio
- Configuración de formas de entrada: `config.json` dentro del repositorio
- Hashes de ficheros: `SHA256SUMS` dentro del repositorio
