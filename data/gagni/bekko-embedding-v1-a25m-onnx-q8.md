# gagni/bekko-embedding-v1-a25m-onnx-q8

## Resumen

`gagni/bekko-embedding-v1-a25m-onnx-q8` es una exportación ONNX cuantizada a INT8 del modelo de embeddings de frases `hotchpotch/bekko-embedding-v1-a25m`, desarrollado originalmente por el usuario hotchpotch. El repositorio no entrena ni modifica el modelo base: únicamente añade el fichero `onnx/model_quantized.onnx` que los runtimes cuantizados como transformers.js resuelven al solicitar `dtype: 'q8'`, ya que el repositorio original solo distribuye la exportación en fp32.

El modelo base es un ModernBERT que produce embeddings de frase de 384 dimensiones mediante mean pooling, sin prefijo de prompt, con una ventana de contexto de 8192 tokens y licencia MIT. Está pensado para tareas de similitud semántica, recuperación y enrutamiento semántico multilingüe.

Su relevancia práctica es doble: por un lado, reduce el peso del fichero de 199 MB a 124 MB (factor 1,6x) y ofrece una ganancia de velocidad de aproximadamente 1,2x en texto corto y 1,27x en texto largo; por otro, el autor documenta que la cuantización es neutra en calidad sobre su carga de trabajo de enrutamiento semántico, sin necesidad de recalibrar los umbrales de decisión fijados sobre fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | no disponible (25,2M valores float en el transformer + 98,3M valores de la tabla de embeddings del vocabulario) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | INT8 dinámica por pesos (`QUInt8`), sin datos de calibración |
| Idiomas soportados | multilingüe |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`); el fp32 se distribuye en el repositorio upstream |

## Arquitectura y entrenamiento

El modelo base es un ModernBERT orientado a la generación de embeddings de frase: codifica el texto de entrada y aplica mean pooling sobre las representaciones del token para obtener un vector de 384 dimensiones, sin prefijo de prompt. Soporta entradas de hasta 8192 tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación de este repositorio concreto es la exportación cuantizada: se aplicó cuantización dinámica INT8 de pesos con `onnxruntime.quantization.quantize_dynamic` usando `QuantType.QUInt8`. El autor justifica el uso de `QUInt8` frente a `QInt8` porque, con idéntica puntuación en el benchmark downstream, es más fiel al referencia fp32 (coseno medio de 0,98817 frente a 0,98600 sobre 438 textos; peor caso de 0,974 frente a 0,954). Un detalle técnico relevante es que solo la mitad del modelo es cuantizable: `embeddings.tok_embeddings.weight` (98,3M valores, la tabla del vocabulario de 256k tokens) ya está en INT8 en la exportación fp32 upstream, de modo que solo los 25,2M valores float del transformer se ven afectados. Esto explica que el fichero encoja 1,6x en lugar del 4x habitual y que la aceleración sea de ~1,2x en lugar de 2x.

## Capacidades

- Generación de embeddings de frase de 384 dimensiones con mean pooling y normalización opcional.
- Similitud semántica entre textos (`sentence-similarity`).
- Extracción de características para pipelines de recuperación y búsqueda vectorial (`feature-extraction`).
- Enrutamiento semántico: clasificación de consultas por proximidad kNN sobre un conjunto de prototipos etiquetados.
- Soporte multilingüe, evaluado por el autor sobre unas 30 lenguas en su benchmark de routing.
- Manejo de textos largos gracias a la ventana de 8192 tokens.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito: es un modelo de embeddings, no generativo.

## Casos de uso

- Enrutamiento semántico de consultas: el autor valida el modelo con kNN sobre un conjunto de 345 prototipos etiquetados y 250 consultas reservadas en ~30 idiomas; la cuantización INT8 mantiene los umbrales de decisión calibrados sobre fp32 sin recalibrar, lo que permite desplegarlo en producción sin reajustar la lógica de guardas.
- Búsqueda semántica en aplicaciones web: al ejecutarse con transformers.js y `dtype: 'q8'`, puede integrarse en el navegador o en Node.js para indexar y consultar documentos sin backend dedicado, con un fichero de solo 124 MB.
- Deduplicación y agrupación de textos multilingües: la ventana de 8192 tokens permite comparar documentos completos, no solo frases, calculando similitud coseno entre embeddings normalizados.
- Filtrado de contenido fuera de dominio: el autor reporta cero casos de texto sin sentido mal enrutado en su conjunto adversario de out-of-domain, lo que respalda su uso como primera capa de clasificación antes de un modelo mayor.
- Sistemas de recomendación basados en contenido: los embeddings de 384 dimensiones sirven como representación compacta de artículos o descripciones para calcular vecinos más cercanos.
- Clasificación zero-shot ligera: comparando la consulta contra descripciones de categorías embebidas, útil para etiquetado de tickets o moderación previa.
- Recuperación aumentada (RAG) en entornos con recursos limitados: el modelo es adecuado como encoder de recuperación cuando no se dispone de GPU, gracias a su tamaño reducido y a la exportación ONNX.

## Benchmarks y rendimiento

El autor publica un benchmark propio de enrutamiento semántico (kNN sobre 345 ejemplos etiquetados, 250 consultas reservadas en ~30 idiomas, más un conjunto adversario fuera de dominio), con umbrales de guarda calibrados sobre fp32 y sin tocar:

| Metrica | fp32 | INT8 (este repo) |
|---|---|---|
| Enrutamientos que superan el umbral a igual precisión | baseline | dentro de un caso |
| Texto sin sentido fuera de dominio mal enrutado | 0 | 0 |
| Coseno medio frente a fp32 (438 textos) | referencia | 0,98817 |
| Peor caso de coseno frente a fp32 | referencia | 0,974 |
| Aceleración en texto corto | 1,0x | ~1,2x |
| Aceleración en texto largo | 1,0x | ~1,27x |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX cuantizado ocupa 124 MB; la inferencia en CPU es viable y no requiere GPU.
- GPU recomendadas: no se especifican; al tratarse de un modelo de 25,2M parámetros float efectivos, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobrada.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; el caso de uso declarado es transformers.js en JavaScript.
- Opciones de despliegue: ONNX Runtime, transformers.js con `dtype: 'q8'`; el repositorio upstream en fp32 puede usarse con los runtimes habituales de Hugging Face.
- Latencia y throughput: no se publican cifras absolutas; solo la ganancia relativa de ~1,2x en texto corto y ~1,27x en texto largo frente a fp32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gagni/bekko-embedding-v1-a25m-onnx-q8 | 25,2M float + 98,3M embeddings INT8 | 8192 | ONNX INT8 | MIT | Exportación cuantizada, sin fp32 |
| hotchpotch/bekko-embedding-v1-a25m | mismos | 8192 | safetensors/ONNX fp32 | MIT | Modelo base, referencia de calidad |
| Otros modelos de embeddings multilingües de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo se distribuye el fichero cuantizado: el fp32 no se duplica en este repositorio y debe obtenerse del upstream.
- La cuantización mueve cada vector aproximadamente un 1,2% en coseno; casos individuales pueden cambiar de lado en ambos sentidos si la consulta cae justo sobre un umbral de decisión. El autor lo describe como "sin degradación medible", no como una mejora.
- La ganancia de velocidad es modesta (~1,2x) porque la tabla de embeddings ya estaba en INT8 en el export fp32.
- Al ser un modelo de embeddings, no genera texto, no razona de forma explícita y no soporta tool calling ni agentes.
- No se han publicado evaluaciones de sesgo ni de robustez lingüística más allá del benchmark propio del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación externa.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y atribuir al autor original del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gagni/bekko-embedding-v1-a25m-onnx-q8
- Modelo base: https://huggingface.co/hotchpotch/bekko-embedding-v1-a25m
- Perfil del autor del modelo base: https://huggingface.co/hotchpotch
