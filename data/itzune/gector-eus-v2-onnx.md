# itzune/gector-eus-v2-onnx

## Resumen

El modelo `itzune/gector-eus-v2-onnx` es una versión cuantizada en int4 del sistema GECToR v2 para corrección gramatical automática del euskera, desarrollado por Xabi Ezpeleta (itzune). Se trata de un modelo de clasificación de tokens (pipeline `token-classification`) que sigue el paradigma seq2edit: en lugar de generar texto corregido de forma autoregresiva, predice operaciones de edición sobre cada token de la entrada, lo que lo hace muy eficiente y adecuado para despliegue en navegador o dispositivos edge.

La principal innovación de esta versión frente a la v1 es la incorporación de una tercera cabeza de salida que clasifica el tipo de error (ortografía, morfología, puntuación, etc.) por token, lo que permite construir interfaces de revisión explicables. El modelo está basado en el encoder RoBERTa-eus-base y se distribuye en formato ONNX con pesos cuantizados a int4 (83 MB) o int8 (128 MB), pensado para ejecutarse con ONNX Runtime Web (WASM) o Transformers.js sin necesidad de WebGPU. Su licencia CC-BY-SA 4.0 permite uso comercial, a diferencia de la v1 que era CC-BY-NC-SA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GECToR (encoder RoBERTa-eus-base + 3 cabezas: edit-label, detect, type) |
| Parametros totales | no disponible (modelo basado en RoBERTa-eus-base, tamano no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitado por el tokenizador SentencePiece, sin dato publicado) |
| Tipos de cuantizacion | int4 (MatMul weights) + int8 embeddings; version int8 completa como fallback |
| Idiomas soportados | Euskera (eu) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | ONNX (model_q4.onnx int4, model_quantized.onnx int8) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GECToR, un enfoque seq2edit que combina un encoder transformer preentrenado (RoBERTa-eus-base) con tres cabezas de clasificación: una para etiquetas de edición (vocabulario de 5000 etiquetas), otra para detección binaria de error (correcto/incorrecto) y una tercera, nueva en v2, para clasificar el tipo de error en 8 categorías (ortografía, puntuación, mayúsculas, nivel de palabra, "zalantza", morfología, nombre propio y calco). El modelo fue entrenado sobre el corpus horkonpon, publicado bajo licencia CC-BY-SA, a diferencia de la v1 que usaba datos de Elhuyar con licencia NC. No se han publicado detalles sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO; la información disponible solo indica que la cuantización int4 tiene un impacto despreciable en la precisión gracias a que el vocabulario de etiquetas (5000) se mantiene en precisión completa.

## Capacidades

- Corrección gramatical automática de texto en euskera mediante edición de tokens (seq2edit).
- Detección de errores por token (binaria: correcto/incorrecto).
- Clasificación del tipo de error en 8 categorías: ortografía, puntuación, mayúsculas, nivel de palabra, "zalantza", morfología, nombre propio y calco.
- Salida de tres tensores de logits: etiquetas de edición (5000 clases), detección (2 clases) y tipo de error (9 clases, incluyendo "none").
- Ejecución en navegador sin WebGPU gracias a la cuantización int4 y al uso de ONNX Runtime Web (WASM).
- Compatible con Transformers.js para tokenización y con ONNX Runtime para inferencia.
- Diseñado para integración en aplicaciones de revisión de texto, como el asistente de escritura txukun.

## Casos de uso

- Asistente de escritura en euskera: integración en editores de texto o procesadores para subrayar errores y sugerir correcciones en tiempo real, mostrando además el tipo de error (ortografía, morfología, etc.) para que el usuario entienda la causa.
- Corrección de textos en aplicaciones web: al ser un modelo ONNX ligero (83 MB), puede ejecutarse íntegramente en el navegador del cliente, sin enviar datos a un servidor, lo que garantiza privacidad y baja latencia (~50-100 ms por frase).
- Revisión de contenido generado por otros modelos: uso como post-procesador para limpiar errores gramaticales en salidas de LLMs en euskera, mejorando la calidad final antes de publicar.
- Herramientas educativas de aprendizaje del euskera: plataformas de enseñanza de idiomas pueden emplear el modelo para dar retroalimentación detallada sobre errores morfológicos o de concordancia, ayudando a los estudiantes a identificar sus fallos.
- Análisis lingüístico de corpus: investigadores pueden usar las etiquetas de tipo de error para estudiar patrones de errores en textos escritos en euskera, por ejemplo en redes sociales o foros.
- Corrección en aplicaciones móviles o de escritorio: gracias a su pequeño tamaño y a la compatibilidad con ONNX Runtime, puede desplegarse en dispositivos con recursos limitados, como teléfonos o portátiles antiguos, sin necesidad de GPU.

## Benchmarks y rendimiento

La model card del modelo fuente (`itzune/gector-eus-v2`) reporta los siguientes resultados de evaluación:

| Metrica | Valor |
|---|---|
| F0.5 (correccion) | 77.6 |
| Exact match | 51.3% |
| Clean FP (falsos positivos limpios) | 1.8% |
| Type accuracy (palabras con error) | 75.8% |

No se han publicado comparaciones con otros modelos de corrección gramatical en euskera en la información disponible. La cuantización int4 no afecta significativamente a estas métricas, según el autor.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 83 MB (int4) o 128 MB (int8), puede ejecutarse en CPU sin necesidad de GPU. En caso de usar GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente.
- GPU recomendadas: no se requiere GPU específica; el modelo está diseñado para ejecutarse en CPU, incluso en navegadores mediante WASM. Para despliegue en servidor, cualquier CPU moderna es suficiente.
- Compatibilidad con consumer GPU: sí, cualquier GPU integrada o dedicada puede manejar la inferencia, aunque no es necesaria.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, WASM), Transformers.js, ONNX Runtime Web, o cualquier runtime compatible con ONNX. También puede usarse con Python a través de `onnxruntime` para integración en backend.
- Latencia y throughput: la model card indica ~50-100 ms por frase en navegador (WASM). En servidor con CPU, se espera un rendimiento similar o mejor; no se han publicado cifras de throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Licencia | Salidas | Datos de entrenamiento |
|---|---|---|---|---|---|
| `itzune/gector-eus-v2-onnx` (este) | GECToR (RoBERTa-eus-base) | 83 MB (int4) | CC-BY-SA 4.0 | edit labels, deteccion, tipo de error | horkonpon (CC-BY-SA) |
| `itzune/gector-eus-onnx` (v1) | GECToR (RoBERTa-eus-base) | 87 MB | CC-BY-NC-SA 4.0 | edit labels, deteccion | Elhuyar (NC) |
| `itzune/gector-eus-v2` (modelo fuente) | GECToR (RoBERTa-eus-base) | no disponible (PyTorch) | CC-BY-SA 4.0 | edit labels, deteccion, tipo de error | horkonpon (CC-BY-SA) |
| `itzune/gemma-4-e4b-horkonpon` | LLM (Gemma 4) | no disponible | no disponible | generacion de texto | horkonpon (CC-BY-SA) |

La v2 ONNX mejora la v1 al añadir la clasificación de tipo de error y al cambiar a una licencia permisiva para uso comercial. El modelo fuente en PyTorch ofrece las mismas capacidades pero requiere un runtime de PyTorch, mientras que la versión ONNX está optimizada para despliegue ligero.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para euskera; no soporta otros idiomas.
- Al ser un modelo de corrección basado en edición, puede fallar en contextos muy informales o con errores complejos que requieran reescritura completa de la frase.
- La clasificación de tipo de error tiene una precisión del 75.8% sobre palabras con error, por lo que algunas etiquetas pueden ser incorrectas.
- La licencia CC-BY-SA 4.0 exige atribución y, si se distribuyen obras derivadas, deben compartirse bajo la misma licencia. Esto puede afectar a integraciones comerciales que no quieran liberar su código.
- No se han publicado estudios de sesgos o de comportamiento en dominios específicos (legal, médico, etc.), por lo que su uso en esos ámbitos requiere validación adicional.
- El modelo no es generativo; no puede producir texto nuevo, solo corregir el existente. Para tareas de generación se necesitaría un LLM como el mencionado `gemma-4-e4b-horkonpon`.

## Enlaces

- [Modelo en HuggingFace: itzune/gector-eus-v2-onnx](https://huggingface.co/itzune/gector-eus-v2-onnx)
- [Modelo fuente: itzune/gector-eus-v2](https://huggingface.co/itzune/gector-eus-v2)
- [Version v1 ONNX: itzune/gector-eus-onnx](https://huggingface.co/itzune/gector-eus-onnx)
- [LLM para correccion en euskera: itzune/gemma-4-e4b-horkonpon](https://huggingface.co/itzune/gemma-4-e4b-horkonpon)
- [Corpus de entrenamiento: horkonpon-corpus](https://github.com/itzune/horkonpon-corpus)
- [Asistente de escritura txukun (consumidor del modelo)](https://github.com/itzune/txukun)
