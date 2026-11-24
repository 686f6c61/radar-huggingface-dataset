# ns1703/fakespot-ai-text-detection-onnx

## Resumen

`ns1703/fakespot-ai-text-detection-onnx` es una conversión a ONNX con cuantización dinámica int8 del modelo `fakespot-ai/roberta-base-ai-text-detection-v1`, un clasificador binario basado en RoBERTa-base entrenado para distinguir texto generado por humanos de texto generado por IA. El autor de esta versión (ns1703) no modifica los pesos originales: únicamente exporta el modelo a formato ONNX y lo cuantiza para que pueda ejecutarse directamente en el navegador mediante `onnxruntime-web` y la librería `transformers.js`.

El modelo resuelve una tarea concreta y acotada: dada una secuencia de texto, devuelve dos logits (índice 0 = humano, índice 1 = IA) que tras aplicar softmax ofrecen una probabilidad de que el texto haya sido generado por un modelo de lenguaje. Es relevante para casos de moderación de contenido, verificación editorial o investigación sobre detección de texto sintético, especialmente cuando se necesita inferencia en cliente sin backend.

El repositorio es de muy pequeño tamaño (0,1 GB) y no registra descargas ni interacciones en el momento de la consulta. La información disponible se limita a la model card del autor de la conversión; no se publican detalles sobre el dataset de entrenamiento original, los idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) exportado a ONNX |
| Parámetros totales | no disponible (el modelo base es RoBERTa-base, ~125 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámica (archivo `onnx/model_quantized.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (entradas `input_ids` y `attention_mask` en int64; salida `logits` [batch, 2]) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo original `fakespot-ai/roberta-base-ai-text-detection-v1`, un encoder tipo RoBERTa-base configurado como clasificador de secuencias con dos etiquetas de salida (humano / IA). Esta versión ONNX conserva los pesos sin cambios y aplica una cuantización dinámica a int8 durante la exportación, lo que reduce el tamaño del artefacto y permite ejecución en el navegador con `onnxruntime-web`. El autor advierte explícitamente que la cuantización introduce pequeñas desviaciones numéricas respecto al modelo original.

No se dispone de información sobre el corpus de entrenamiento del modelo base (número de tokens, composición, proporción de texto humano frente a sintético, generadores utilizados para producir los ejemplos de IA), ni sobre si se aplicaron técnicas de ajuste fino adicionales, RLHF o DPO. Tampoco se documenta ninguna innovación técnica más allá de la propia conversión a ONNX e int8.

## Capacidades

- Clasificación binaria de texto: distingue entre texto escrito por humanos (índice 0) y texto generado por IA (índice 1).
- Salida de logits por clase, apta para aplicar softmax y obtener una probabilidad calibrada (sujeta a la desviación introducida por la cuantización).
- Inferencia en navegador mediante `onnxruntime-web` y `transformers.js`, sin necesidad de servidor.
- Procesamiento por lotes (`batch` en la dimensión de salida).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Moderación de contenido en aplicaciones web: el modelo puede integrarse en el cliente para marcar automáticamente publicaciones o comentarios sospechosos de ser generados por IA antes de enviarlos al backend, aprovechando la inferencia ONNX en navegador.
- Verificación editorial en medios digitales: como filtro previo para que los editores revisen textos con alta probabilidad de ser sintéticos, reduciendo el volumen de revisión manual.
- Investigación sobre detección de texto generado: permite reproducir experimentos en local sin infraestructura GPU, gracias al artefacto int8 de 0,1 GB.
- Extensiones de navegador o widgets educativos: el formato ONNX y la compatibilidad con `transformers.js` facilitan su empaquetado en extensiones que alerten al usuario sobre contenido generado por IA.
- Filtrado en pipelines de curación de datos: descartar muestras sintéticas de un corpus antes de usarlo para entrenamiento, siempre que el dominio del texto coincida con el del modelo base.
- Demostraciones y prototipos: el Space asociado (`ns1703/ki-detektor`) sirve como referencia para desplegar un detector funcional en Hugging Face Spaces sin backend dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8; el artefacto completo ocupa 0,1 GB en disco.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera la inferencia, pero no es necesaria.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles mediante WebAssembly.
- Opciones de despliegue: `onnxruntime-web` en navegador, `onnxruntime` en Python/C++, `transformers.js` en Node.js, y el Space `ns1703/ki-detektor` como referencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| ns1703/fakespot-ai-text-detection-onnx | RoBERTa-base + ONNX int8 | no disponible | no disponible | Apache 2.0 | ONNX | Hugging Face |
| fakespot-ai/roberta-base-ai-text-detection-v1 | RoBERTa-base | no disponible | no disponible | Apache 2.0 | safetensors (presumible) | Hugging Face |
| Detectores de texto IA comerciales (p. ej. GPTZero, Originality.ai) | propietaria | no disponible | no disponible | propietaria | API | SaaS |

La comparativa con alternativas open source de la misma categoría no está disponible en la información proporcionada. Frente al modelo base, esta versión ONNX ofrece portabilidad y menor tamaño a costa de una ligera pérdida de precisión por la cuantización int8.

## Limitaciones y advertencias

- La cuantización int8 dinámica introduce desviaciones numéricas respecto al modelo original, tal y como advierte el autor; los umbrales de decisión deben recalibrarse si se migra desde el modelo base.
- No se documenta el dominio, la lengua ni los generadores utilizados en el entrenamiento, por lo que el rendimiento fuera de ese dominio es incierto.
- Riesgo de falsos positivos y falsos negativos: los detectores de texto IA son sensibles a paráfrasis, edición humana posterior y a generadores no vistos durante el entrenamiento.
- No debe usarse como prueba definitiva en contextos académicos o disciplinarios; se recomienda como señal auxiliar.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base original.
- El repositorio no registra descargas ni validación de la comunidad; no hay evidencia de evaluación independiente.
- Sin datos sobre sesgos por idioma, género o registro lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ns1703/fakespot-ai-text-detection-onnx
- Modelo base: https://huggingface.co/fakespot-ai/roberta-base-ai-text-detection-v1
- Space de demostración: https://huggingface.co/spaces/ns1703/ki-detektor
- `transformers.js`: https://github.com/huggingface/transformers.js
- `onnxruntime-web`: https://onnxruntime.ai/docs/tutorials/web/
