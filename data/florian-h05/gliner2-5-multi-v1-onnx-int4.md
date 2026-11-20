# florian-h05/gliner2.5-multi-v1-onnx-int4

## Resumen

GLiNER2.5 multi-v1 (ONNX, int4) es una versión cuantizada a 4 bits del encoder del modelo GLiNER2.5 multi-v1 de Fastino, un extractor de información zero-shot basado en la arquitectura GLiNER (Generalist and Lightweight Entity Recognition). El modelo original emplea un encoder mDeBERTa-v3-base seguido de dos cabezas específicas (boundary y clasificación) que permiten detectar entidades arbitrarias definidas en tiempo de inferencia mediante prompts en lenguaje natural, sin necesidad de reentrenamiento. Esta variante, publicada por el usuario florian-h05, convierte el export ONNX fp32 de DanKau en una versión con pesos MatMul y embeddings cuantizados a 4 bits en bloques de 32, manteniendo las cabezas en fp32.

La relevancia de esta ficha radica en que reduce el tamaño del encoder de 1.111 MB a 233 MB (factor de compresión aproximado de 4,8x) manteniendo la latencia en CPU equivalente a fp32 y una similitud coseno de los estados ocultos por token de aproximadamente 0,99 respecto al modelo original. Esto lo convierte en una opción interesante para despliegues en entornos con memoria limitada, edge computing o pipelines de extracción de entidades a gran escala donde el coste de almacenamiento y transferencia importa.

El modelo está pensado para tareas de token-classification y extracción de información: reconocimiento de entidades nombradas (NER), extracción de relaciones, clasificación de documentos y estructurado de texto no estructurado. Su licencia Apache 2.0 facilita el uso comercial, aunque conviene verificar las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer mDeBERTa-v3-base con cabezas boundary y clasificación (GLiNER) |
| Parametros totales | no disponible (el modelo base es mDeBERTa-v3-base, ~86M en el encoder; el total con cabezas no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | Pesos MatMul y embeddings en int4 (block 32); cabezas en fp32; activaciones en float |
| Idiomas soportados | no disponible (el modelo base es multilingüe por el encoder mDeBERTa-v3, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_int4.onnx`, `boundary.onnx`, `classifier.onnx`) |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma GLiNER: un encoder transformer (mDeBERTa-v3-base en este caso) que produce representaciones contextuales de los tokens de entrada, y dos cabezas que operan sobre esas representaciones. La cabeza boundary predice los límites de los spans candidatos y la cabeza de clasificación asigna cada span a una etiqueta de entidad proporcionada en el prompt. Esta separación permite definir entidades arbitrarias en tiempo de inferencia mediante una lista de etiquetas en lenguaje natural, sin reentrenar el modelo.

Esta variante concreta no introduce cambios arquitectónicos: solo cuantiza los pesos del encoder a 4 bits usando los operadores contrib de ONNX Runtime `MatMulNBits` y `GatherBlockQuantized` (requiere ONNX Runtime 1.20 o superior). Las cabezas boundary y clasificación permanecen en fp32 sin modificar. El proceso de cuantización es reproducible mediante el script `quantize.py` incluido en el repositorio. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Extracción de entidades zero-shot: permite definir etiquetas de entidad arbitrarias en tiempo de inferencia mediante prompts, sin reentrenamiento.
- Token-classification: pipeline principal del modelo, orientado a marcar spans de texto con etiquetas.
- Extracción de información estructurada: conversión de texto no estructurado en campos definidos por el usuario.
- Multilingüe (presumiblemente, por el encoder mDeBERTa-v3-base, aunque no se detalla en la información disponible).
- Inferencia en CPU con latencia equivalente a fp32 gracias a la cuantización weight-only con activaciones en float.
- Integración con ONNX Runtime 1.20+ mediante operadores contrib.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento multi-step en la información proporcionada.

## Casos de uso

- Extracción de entidades en pipelines de procesamiento de documentos: el modelo puede procesar lotes de texto y extraer entidades personalizadas (nombres de fármacos, direcciones, referencias legales) definidas en el prompt, sin necesidad de anotación previa ni reentrenamiento.
- Enriquecimiento de bases de datos y CRM: a partir de correos, tickets o notas, el modelo extrae campos estructurados (empresa, cargo, importe, fecha) que se insertan directamente en el sistema, reduciendo el trabajo manual.
- Anonimización y cumplimiento normativo (RGPD): detección de datos personales (nombres, teléfonos, identificadores) en textos para su redacción automática antes de almacenarlos o compartirlos.
- Procesamiento en edge o entornos con memoria limitada: el encoder int4 de 233 MB cabe en dispositivos con poca RAM y permite inferencia en CPU con latencia similar a fp32, adecuado para portátiles, contenedores pequeños o funciones serverless.
- Análisis de reseñas y feedback de clientes: extracción de aspectos (producto, servicio, problema) y sentimiento asociado mediante etiquetas definidas dinámicamente, útil para paneles de analítica.
- Indexación y búsqueda semántica de corpus: extracción de entidades y relaciones para construir índices estructurados que alimenten motores de búsqueda o sistemas RAG, aprovechando el bajo coste de almacenamiento del modelo cuantizado.
- Moderación de contenido: detección de categorías definidas por el usuario (insultos, amenazas, datos sensibles) en flujos de texto en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de compresión y fidelidad: el encoder fp32 ocupa 1.111 MB frente a 233 MB en int4 (factor ~4,8x), la latencia en CPU es equivalente a fp32 y la similitud coseno de los estados ocultos por token respecto a fp32 es de aproximadamente 0,99.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el encoder int4 ocupa 233 MB; sumando las cabezas (4,9 MB + 4,7 MB) y los buffers de activaciones, el consumo total en memoria es del orden de cientos de MB, muy inferior al 1,1 GB del encoder fp32.
- GPU recomendadas: no se especifican; al ser un modelo pequeño y con soporte ONNX Runtime, puede ejecutarse en CPU y en GPUs consumer (RTX 3060, RTX 4090, etc.) sin problemas de memoria.
- Cabe en GPU consumer: sí, con amplio margen, en cualquier GPU con al menos 1-2 GB de memoria libre.
- Opciones de despliegue: ONNX Runtime (versión 1.20 o superior, requerida por los operadores `MatMulNBits` y `GatherBlockQuantized`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la model card indica latencia en CPU equivalente a fp32; no se proporcionan cifras concretas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gliner2.5-multi-v1-onnx-int4 (este) | no disponible (encoder mDeBERTa-v3-base) | no disponible | ONNX int4 + fp32 | Apache 2.0 | Cuantización 4-bit, encoder 233 MB |
| DanKau/gliner2.5-multi-v1-onnx | no disponible (mismo encoder) | no disponible | ONNX fp32 | Apache 2.0 (presumible) | Export ONNX fp32, encoder 1.111 MB |
| fastino/gliner2.5-multi-v1 | no disponible (mismo encoder) | no disponible | safetensors (presumible) | Apache 2.0 (presumible) | Modelo base original |

No se dispone de información sobre benchmarks comparativos con otros extractores zero-shot (p. ej., GLiNER original, UniversalNER) en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización int4 introduce una pérdida de fidelidad mínima (similitud coseno ~0,99 frente a fp32), pero puede afectar a casos límite en la delimitación de spans o en etiquetas poco representadas.
- Requiere ONNX Runtime 1.20 o superior por el uso de operadores contrib (`MatMulNBits`, `GatherBlockQuantized`); versiones anteriores no podrán cargar el modelo.
- No se documentan sesgos específicos del modelo ni del dataset de entrenamiento; al ser un derivado de GLiNER2.5, hereda los sesgos del modelo base, que no se detallan en la información disponible.
- Riesgo de alucinación en la asignación de entidades cuando las etiquetas del prompt son ambiguas o el texto de entrada es ruidoso; conviene validar los spans extraídos en producción.
- No se especifican los idiomas soportados ni la longitud de contexto; el encoder mDeBERTa-v3-base es multilingüe, pero el rendimiento por idioma no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `fastino/gliner2.5-multi-v1` y del export intermedio de DanKau.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que es una publicación reciente y poco validada por la comunidad.

## Enlaces

- [Hugging Face: florian-h05/gliner2.5-multi-v1-onnx-int4](https://huggingface.co/florian-h05/gliner2.5-multi-v1-onnx-int4)
- [Modelo base: fastino/gliner2.5-multi-v1](https://huggingface.co/fastino/gliner2.5-multi-v1)
- [Export ONNX fp32: DanKau/gliner2.5-multi-v1-onnx](https://huggingface.co/DanKau/gliner2.5-multi-v1-onnx)
- [ONNX Runtime (operadores contrib MatMulNBits y GatherBlockQuantized)](https://onnxruntime.ai/)
