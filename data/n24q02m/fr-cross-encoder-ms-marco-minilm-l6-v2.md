# n24q02m/fr-cross-encoder-ms-marco-MiniLM-L6-v2

## Resumen

`n24q02m/fr-cross-encoder-ms-marco-MiniLM-L6-v2` es una conversión a ONNX del cross-encoder `cross-encoder/ms-marco-MiniLM-L6-v2`, un modelo BERT de tipo cross-encoder entrenado para reranking de pasajes en búsqueda de información. El autor del build, n24q02m, lo ha generado con su herramienta `fastretrieval` y lo distribuye en dos variantes cuantizadas (INT8 y Q4F16) pensadas para inferencia ligera en producción. El modelo resuelve el problema de reordenar una lista de candidatos recuperados por un sistema de búsqueda (retrieval) asignando una puntuación de relevancia a cada par consulta-pasaje.

La relevancia de esta ficha está en que se trata de un artefacto derivado, no de un modelo original: hereda la arquitectura, los pesos y el comportamiento del cross-encoder de Sentence Transformers, pero se publica en formato ONNX cuantizado para reducir el tamaño y acelerar la inferencia en CPU. El repositorio ocupa 0,1 GB y las variantes pesan 22 MB (INT8) y 28 MB (Q4F16), lo que lo hace desplegable en entornos con recursos muy limitados.

No hay información publicada sobre licencia específica, idiomas soportados ni resultados de benchmarks propios en la información disponible. La model card remite a la licencia del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (cross-encoder, familia `bert`, pooling CLS, sin normalización) |
| Parámetros totales | no disponible (el modelo base MiniLM-L6 tiene ~22,7 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (`quantize_dynamic`, QInt8) y Q4F16 (`MatMulNBitsQuantizer`, block_size 128, simétrica, seguida de cast a float16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (hereda la del modelo base `cross-encoder/ms-marco-MiniLM-L6-v2`; consultar antes de usar) |
| Formato de pesos | ONNX (opset 21); variantes `onnx/model_quantized.onnx` y `onnx/model_q4f16.onnx` |

## Arquitectura y entrenamiento

El modelo base es un cross-encoder basado en BERT MiniLM de 6 capas, que procesa conjuntamente el par (consulta, pasaje) y produce una puntuación de relevancia mediante pooling CLS. A diferencia de los bi-encoders, que generan embeddings independientes, el cross-encoder aplica atención cruzada entre consulta y documento, lo que mejora la precisión del reranking a costa de no poder precomputar representaciones.

Esta publicación no entrena el modelo: solo lo convierte a ONNX con `fastretrieval`. La conversión usa opset 21 y dos estrategias de cuantización: INT8 dinámica con `onnxruntime.quantization.quantize_dynamic` (QInt8) y Q4F16 con `MatMulNBitsQuantizer` (block_size 128, simétrica) seguida de un cast a float16. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO, ya que corresponden al modelo base y no se detallan en la información disponible.

## Capacidades

- Puntuación de relevancia consulta-pasaje para reranking en pipelines de búsqueda (retrieval-augmented generation, búsqueda semántica, motores de búsqueda).
- Clasificación de pares de texto (pipeline `text-classification`).
- Salida de una única puntuación por par, con pooling CLS y sin normalización.
- Inferencia en CPU mediante ONNX Runtime, con variantes cuantizadas para reducir memoria y latencia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (el modelo base está orientado a inglés, pero no se confirma en la información proporcionada).

## Casos de uso

- Reranking en sistemas RAG: tras recuperar los N candidatos con un bi-encoder, el cross-encoder reordena los pasajes por relevancia real antes de pasarlos al generador; su tamaño reducido permite ejecutarlo en CPU junto al pipeline de recuperación.
- Búsqueda semántica en documentación técnica: puntuar pares consulta-fragmento para ordenar resultados de un índice vectorial, con la variante INT8 de 22 MB desplegable en contenedores pequeños.
- Filtrado de resultados en motores de búsqueda internos: descartar pasajes con baja puntuación antes de mostrarlos al usuario, reduciendo ruido en la lista final.
- Evaluación de calidad de recuperación: usar las puntuaciones del cross-encoder como referencia para medir y ajustar el recall de un sistema de búsqueda existente.
- Clasificación de pares texto-texto en pipelines de datos: por ejemplo, detectar si una respuesta candidata es relevante para una pregunta en un conjunto de datos de evaluación.
- Despliegue en entornos con recursos limitados: la variante Q4F16 (28 MB) permite ejecutar el reranker en dispositivos edge o en instancias CPU sin GPU, gracias al formato ONNX y a ONNX Runtime.
- Prototipado rápido de sistemas de búsqueda: al ser un artefacto pequeño y autocontenido, sirve para validar la arquitectura de un pipeline de retrieval antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de despliegues; el modelo está pensado para CPU vía ONNX Runtime. En GPU, el tamaño de pesos es de 22 MB (INT8) y 28 MB (Q4F16), por lo que la memoria necesaria es mínima.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime (por ejemplo, series RTX o A100/H100) puede ejecutarlo, pero no hay datos de rendimiento publicados.
- Cabe en cualquier GPU de consumo e incluso en CPU; el repositorio completo ocupa 0,1 GB.
- Opciones de despliegue: ONNX Runtime (incluido en `fastretrieval` mediante `TextCrossEncoder`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `n24q02m/fr-cross-encoder-ms-marco-MiniLM-L6-v2` | no disponible (~22,7 M en el base, sin confirmar) | no disponible | ONNX INT8 / Q4F16 | no disponible (hereda del base) | Hugging Face, 0 descargas |
| `cross-encoder/ms-marco-MiniLM-L6-v2` (base) | ~22,7 M (no confirmado) | no disponible | safetensors / PyTorch | no disponible en esta ficha | Hugging Face (modelo original) |
| `cross-encoder/ms-marco-MiniLM-L-12-v2` | no disponible | no disponible | safetensors / PyTorch | no disponible | Hugging Face |
| `BAAI/bge-reranker-base` | no disponible | no disponible | safetensors / PyTorch | no disponible | Hugging Face |

La comparativa se limita a señalar la existencia de alternativas; no hay datos de rendimiento publicados en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un artefacto derivado: no aporta mejoras de calidad respecto al modelo base, solo cambios de formato y cuantización.
- La cuantización INT8 y Q4F16 puede introducir una pérdida de precisión en las puntuaciones de relevancia; no se documenta ninguna evaluación de dicha pérdida.
- Licencia no disponible: la model card remite a la licencia del modelo base, por lo que el uso comercial debe verificarse en el repositorio original antes de desplegarlo.
- Idiomas no declarados: no se confirma el comportamiento en castellano ni en otros idiomas distintos del inglés del modelo base.
- Longitud de contexto no disponible: no se puede garantizar el rendimiento con pasajes largos.
- Riesgo de alucinación no aplica directamente (no genera texto), pero las puntuaciones pueden ser poco fiables fuera del dominio de entrenamiento del modelo base.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- El pipeline de despliegue documentado depende de la librería `fastretrieval`; no se detallan alternativas de integración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/n24q02m/fr-cross-encoder-ms-marco-MiniLM-L6-v2
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Herramienta de conversión `fastretrieval`: https://github.com/n24q02m/fastretrieval
