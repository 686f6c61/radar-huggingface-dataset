# nishparadox/CodeRankEmbed-onnx-int8

## Resumen

CodeRankEmbed-onnx-int8 es una versión cuantizada a int8 en formato ONNX del modelo de embeddings de código nomic-ai/CodeRankEmbed, desarrollado originalmente por Nomic AI y convertido por el usuario nishparadox. Se trata de un modelo de 137 millones de parámetros basado en arquitectura NomicBert, disenado especificamente para recuperación de código (code retrieval) y similitud semántica entre fragmentos de código. El modelo original obtiene una puntuación CoIR de 60.1, lo que lo sitúa como un embedder de código de referencia en su rango de tamano.

La relevancia de esta versión concreta reside en su empaquetado: funciona exclusivamente sobre ONNX Runtime, sin dependencias de PyTorch ni código de modelo personalizado, y ocupa solo 138 MB en disco. Esto lo hace adecuado para entornos de producción ligeros, aplicaciones de escritorio o pipelines donde instalar el stack completo de PyTorch resulta excesivo. El modelo fue creado para el proyecto vibepiler, una herramienta de detección de duplicados semánticos en bases de código, aunque su uso es general como embedder de código.

La cuantización es dinámica post-entrenamiento sobre las capas lineales, sin fine-tuning ni datos de calibración, lo que preserva la fidelidad respecto al export fp32 original. El contexto es de 8192 tokens y el pooling es CLS seguido de normalización L2, coincidiendo con la configuración upstream de sentence-transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NomicBert (transformer encoder) |
| Parametros totales | 137 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | int8 dinamica (QInt8) sobre capas lineales |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (model_quantized.onnx) |
| Dimension del embedding | 768 |
| Pooling | CLS (primer token) + normalizacion L2 |
| Tamano en disco | 138 MB |
| Runtime | ONNX Runtime (sin PyTorch) |

## Arquitectura y entrenamiento

El modelo base es nomic-ai/CodeRankEmbed, un transformer encoder de tipo NomicBert con 137 millones de parámetros. La arquitectura NomicBert es una variante optimizada de BERT con mejoras en eficiencia de atención y positional embeddings, empleada por Nomic AI tanto en sus modelos de texto como de código. El modelo está entrenado como embedder de oraciones con pooling CLS y normalización L2, siguiendo la configuración de sentence-transformers.

Esta versión concreta no introduce entrenamiento adicional: es una cuantización dinámica post-entrenamiento aplicada con `onnxruntime.quantization.quantize_dynamic` (weight_type=QInt8) sobre el export fp32 de jamie8johnson/CodeRankEmbed-onnx, que a su vez es una conversión fiel de los pesos PyTorch originales. No hay fine-tuning ni datos de calibración. La única modificación adicional respecto al export es la corrección de `max_length` en `tokenizer_config.json`, elevado de 512 a 8192 para coincidir con `model_max_length` y `n_positions`, evitando que cargadores como fastembed trunquen a 512 tokens. El resto de ficheros de tokenizer y configuración son copia byte a byte del export original.

## Capacidades

- Generación de embeddings densos de 768 dimensiones para código y consultas en lenguaje natural.
- Recuperación de código (code retrieval): dada una consulta en inglés, devuelve fragmentos de código relevantes mediante similitud coseno.
- Similitud código-código: detección de duplicados semánticos y funciones equivalentes con implementaciones distintas.
- Similitud consulta-código: soporta el prefijo upstream `Represent this query for searching relevant code: ` para consultas en lenguaje natural; el código no lleva prefijo.
- Extracción de features (pipeline feature-extraction) apta para indexación vectorial y búsqueda semántica.
- Contexto de 8192 tokens, adecuado para funciones y ficheros de código de tamano medio.
- Ejecución sobre ONNX Runtime sin PyTorch, con integración directa en fastembed y onnxruntime+tokenizers.

## Casos de uso

- Detección de duplicados semánticos en bases de código: el modelo genera embeddings de cada función y permite identificar implementaciones equivalentes (por ejemplo, un bucle `for` frente a un `sum` sobre generador) mediante similitud coseno, que es precisamente el uso original en vibepiler.
- Búsqueda semántica de código en repositorios: indexar funciones y ficheros como vectores de 768 dimensiones y responder consultas en lenguaje natural con el prefijo de query, gracias al contexto de 8192 tokens que cubre funciones largas.
- Asistentes de desarrollo en IDE: sugerir fragmentos de código existentes en el proyecto o en la organización a partir de una descripción textual, con latencia baja al ejecutarse sobre CPU con ONNX Runtime.
- Deduplicación en pipelines de migración o refactorización: comparar módulos entre versiones de un repositorio para detectar código repetido antes de consolidar.
- Construcción de bases de conocimiento de código para RAG: usar el embedder como componente de recuperación en sistemas de generación aumentada que necesitan localizar contexto de código relevante.
- Análisis de similitud en revisiones de código: medir cercanía semántica entre parches propuestos y código existente para señalar posibles reimplementaciones.
- Despliegue en entornos ligeros: aplicaciones de escritorio o contenedores mínimos donde instalar PyTorch es inviable, gracias a los 138 MB y la dependencia exclusiva de ONNX Runtime.

## Benchmarks y rendimiento

El autor publica una medición de rendimiento y calidad de la cuantización sobre un portátil Apple Silicon, solo CPU, embebiendo funciones Python completas de un repositorio de 1037 funciones, con lotes ordenados por longitud:

| Build | Funciones / s | Separación de pares gemelos* |
|---|---|---|
| Export fp32 | 16 | +0.100 |
| Esta build int8 | 33 | +0.086 |

\* Coseno de un par conocido de funciones que hacen lo mismo con código distinto (bucle `for` frente a `sum` sobre generador), menos el percentil 99 de todos los pares no relacionados del mismo fichero. Ambas builds clasifican el par como vecino más cercano mutuo.

El modelo base reporta una puntuación CoIR de 60.1 según la model card. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, etc.) para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; en GPU, el modelo int8 de 138 MB requiere menos de 1 GB de VRAM incluyendo overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; para CPU, cualquier procesador moderno es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.), aunque su uso típico es en CPU.
- Opciones de despliegue: ONNX Runtime (directo o vía fastembed), integración con bases vectoriales que usen fastembed (por ejemplo Qdrant).
- Throughput medido: 33 funciones/s en CPU Apple Silicon con int8, frente a 16 funciones/s en fp32 (aproximadamente el doble de velocidad).
- Latencia: no disponible de forma desagregada; el throughput anterior sirve como referencia para lotes de funciones Python.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CoIR | Licencia | Formato |
|---|---|---|---|---|---|
| CodeRankEmbed-onnx-int8 (este) | 137M | 8192 | 60.1 (base) | MIT | ONNX int8 |
| nomic-ai/CodeRankEmbed (fp32) | 137M | 8192 | 60.1 | MIT | PyTorch safetensors |
| jamie8johnson/CodeRankEmbed-onnx (fp32) | 137M | 8192 | 60.1 | MIT | ONNX fp32 |

No se dispone en la información proporcionada de datos comparativos con otros embedders de código (por ejemplo, variantes de CodeBERT o modelos de recuperación de código de mayor tamano) que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Solo soporta inglés: las consultas en lenguaje natural deben formularse en inglés; no hay soporte multilingüe declarado.
- Es un modelo de embeddings, no generativo: no produce texto ni código, solo vectores; no debe esperarse razonamiento ni generación.
- La cuantización int8 reduce la separación de pares gemelos (+0.086 frente a +0.100 en fp32), por lo que en tareas de detección de duplicados muy sutiles puede perder precisión respecto al modelo original.
- Cuantización dinámica sin calibración: no se ha validado con datos de calibración específicos, lo que puede introducir degradaciones no medidas en dominios distintos al evaluado.
- Riesgo de truncamiento si el cargador no respeta `max_length` de 8192; el autor corrigió el tokenizer, pero herramientas que impongan límites propios pueden truncar.
- Licencia MIT heredada del modelo upstream: permite uso comercial, pero conviene verificar los términos del modelo base nomic-ai/CodeRankEmbed por si hubiera condiciones adicionales.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni evidencia de uso en producción más allá del proyecto vibepiler.
- No se han publicado benchmarks estándar para esta build cuantizada; los únicos datos son las mediciones del autor sobre un repositorio concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nishparadox/CodeRankEmbed-onnx-int8
- Modelo base: https://huggingface.co/nomic-ai/CodeRankEmbed
- Export fp32 ONNX de origen: https://huggingface.co/jamie8johnson/CodeRankEmbed-onnx
- Proyecto vibepiler: https://github.com/NISH1001/vibepiler
- fastembed: https://github.com/qdrant/fastembed
