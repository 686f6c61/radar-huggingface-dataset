# castorini/slideon-onnx

## Resumen

SlideOn ONNX es una exportación a ONNX del modelo de recuperación dispersa (sparse retrieval) SlideOn de LightOn, preparada por el equipo de Castorini para su integración en Anserini. No se trata de un checkpoint nuevo ni de un modelo generativo, sino de un artefacto de inferencia optimizado que convierte el codificador base en un grafo ONNX ejecutable con ONNX Runtime, manteniendo las conversiones nativas a FP16 del modelo original. Su propósito es servir como codificador de consultas y documentos dentro de pipelines de búsqueda léxica aprendida (learned sparse retrieval).

El modelo base, `lightonai/SlideOn`, es un codificador de arquitectura ModernBERT entrenado para producir representaciones dispersas de términos ponderados, siguiendo la estela de SPLADE. La exportación fija el tamaño de lote en 1, deja la longitud de secuencia dinámica y añade una poda en tiempo de ejecución mediante un cuarto tensor de entrada, `top_k`, que limita el número de características activas por documento o consulta. Esta innovación reduce el coste de almacenamiento del índice invertido sin requerir una reexportación del modelo.

La relevancia de este repositorio es práctica: permite desplegar un recuperador disperso de calidad en entornos Java/Anserini y Pyserini sin depender de PyTorch en producción, con un único artefacto de 1,4 GB. Está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, según etiquetas del repo), exportado a grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud de secuencia dinámica en el grafo) |
| Tipos de cuantizacion | FP32 en pesos del grafo; redondeo interno a FP16 preservado del modelo base; sin conversión INT8 aplicada |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`slideon-optimized.onnx`), opset 18 |

## Arquitectura y entrenamiento

El grafo exportado corresponde a un codificador transformer de tipo ModernBERT, según las etiquetas del repositorio, especializado en recuperación dispersa. La exportación se realizó con `torch.onnx.export` en modo eager (`dynamo=False`), opset 18, parámetros en FP32 y atención eager, sobre Linux x86_64 con PyTorch 2.14.1+cpu y Transformers 5.21.0. El lote está fijado a 1 y la longitud de secuencia es dinámica. Posteriormente el grafo se optimizó con ONNX Runtime 1.17.0 bajo `CPUExecutionProvider` con el nivel `ORT_ENABLE_EXTENDED`, generando el artefacto final.

La modificación funcional más relevante es la inclusión de una cuarta entrada, `top_k` (escalar INT64), que activa una poda de características en tiempo de ejecución: con `top_k=0` se desactiva la poda y con un valor positivo se conservan como máximo esas características, con un tope de 32768. La selección top-k se aplica antes del redondeo final a FP16, los pesos de salida permanecen en FP32 y los empates se resuelven por ID latente menor, sin garantía de paridad exacta con PyTorch. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Extracción de características para recuperación dispersa: genera representaciones de términos ponderados para consultas y documentos.
- Modo dual consulta/documento mediante la entrada `is_document`.
- Poda configurable de características activas en inferencia mediante `top_k`, con impacto directo en el tamaño del índice.
- Integración nativa con Anserini y Pyserini para indexación y búsqueda.
- Ejecución en CPU mediante ONNX Runtime, sin requerir CUDA.
- No es un modelo generativo: no produce texto libre, no razona, no ejecuta código ni matemáticas.
- No soporta tool calling, function calling ni flujos de agentes.
- Sin capacidades multimodales (visión, audio) ni modo de razonamiento extendido.
- Soporte multilingüe limitado al inglés.

## Casos de uso

- Búsqueda documental en producción con Anserini: el modelo actúa como codificador de documentos y consultas dentro de un índice invertido disperso, aprovechando la poda `top_k` para controlar el tamaño del índice y los tiempos de búsqueda en despliegues Java existentes.
- Recuperación de primera etapa en pipelines RAG: al ejecutarse en CPU con ONNX Runtime, puede generar representaciones dispersas de un corpus y de las consultas de un sistema de generación aumentada sin ocupar GPU, dejando esta para el modelo generativo.
- Indexación de colecciones a gran escala: la poda en tiempo de ejecución permite fijar un número máximo de términos por documento (por ejemplo, 128) y estimar el almacenamiento del índice antes de indexar, algo útil para planificar capacidad.
- Evaluación de recuperación con Pyserini: investigadores que reproducen experimentos sobre colecciones estándar pueden usar el artefacto directamente, ya que Anserini descarga y cachea el modelo de forma automática.
- Despliegue en entornos sin PyTorch: equipos que solo disponen de JVM o de ONNX Runtime pueden servir búsqueda dispersa sin instalar el stack completo de Transformers.
- Búsqueda léxica aprendida en aplicaciones de nicho en inglés: atención al cliente, documentación técnica o bases de conocimiento en inglés donde se busca mejorar el recall léxico frente a BM25 sin recurrir a embeddings densos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona la superación de cuatro pruebas de regresión sintéticas en ONNX y once pruebas Java dirigidas, incluyendo inferencia con `top_k` igual a 0, 1, 32 y 128, y advierte explícitamente que se trata de comprobaciones funcionales, no de una afirmación de paridad numérica con PyTorch.

## Requisitos de hardware

- VRAM: no aplica en el escenario previsto; la exportación se validó en CPU sin CUDA.
- GPU recomendadas: no disponible; el artefacto está pensado para `CPUExecutionProvider` de ONNX Runtime.
- Cabe en GPU de consumo: no disponible; no se han publicado requisitos de memoria ni pruebas en GPU.
- Despliegue: ONNX Runtime (versión de referencia 1.17.0 para la optimización y 1.31.1 para validación), Anserini con soporte de top-k en tiempo de ejecución y Pyserini como cliente Python.
- Tamaño del artefacto: 1,4 GB en el repositorio de Hugging Face.
- Latencia y throughput: no disponibles.
- Nota operativa: el lote está fijado a 1, por lo que el rendimiento depende del número de llamadas individuales y no de la agregación por lotes.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| castorini/slideon-onnx | ModernBERT encoder exportado a ONNX | no disponible | ONNX | Apache 2.0 | Poda top-k en runtime, integración Anserini |
| lightonai/SlideOn | ModernBERT encoder | no disponible | safetensors (PyTorch) | Apache 2.0 | Checkpoint original, requiere PyTorch |
| SPLADE (variantes) | BERT encoder con cabecera dispersa | no disponible | safetensors | según variante | Referencia clásica de recuperación dispersa; datos concretos no disponibles en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no se declara soporte para otros idiomas, por lo que su uso en corpus multilingües produciría resultados degradados.
- No es un modelo generativo: cualquier expectativa de generación de texto, razonamiento o código queda fuera de su alcance.
- Cambio de interfaz incompatible: el grafo exige la entrada `top_k`; los clientes ONNX antiguos que no la proporcionen no podrán ejecutarlo.
- Caché obsoleta: tras actualizar, es necesario borrar el modelo cacheado previamente (por defecto `~/.cache/pyserini/encoders/slideon-optimized.onnx`), ya que no se refresca automáticamente.
- Paridad numérica no garantizada: los empates en la selección top-k se resuelven por ID latente menor y no se asegura equivalencia exacta con PyTorch; conviene validar métricas de recuperación tras el cambio.
- Lote fijo a 1: no se ha exportado con dimensión de lote dinámica, lo que limita la agregación por lotes en inferencia.
- Sin cuantización INT8 incluida: el escalado y la cuantización entera quedan a cargo del usuario.
- Riesgo de sesgo y alucinación: no se documentan análisis de sesgo; al ser un recuperador, el riesgo se traslada a sesgos en el ranking de documentos más que a alucinación directa.
- Uso comercial: la licencia Apache 2.0 lo permite, pero se recomienda conservar el aviso de licencia incluido en el repositorio y verificar la licencia del checkpoint base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castorini/slideon-onnx
- Modelo base: https://huggingface.co/lightonai/SlideOn
- Checkpoint base concreto: https://huggingface.co/lightonai/SlideOn/tree/370c600e9886afc43ff8026695261e56ecfaa011
- Anserini: https://github.com/castorini/anserini
- Pyserini: https://github.com/castorini/pyserini
- ONNX Runtime: https://onnxruntime.ai/
