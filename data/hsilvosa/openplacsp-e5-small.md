# hsilvosa/openplacsp-e5-small

## Resumen

El modelo `hsilvosa/openplacsp-e5-small` es un encoder semántico especializado en contratación pública española, desarrollado por el usuario hsilvosa. Se trata de un fine-tuning del modelo multilingüe `intfloat/multilingual-e5-small` (arquitectura BERT, 117,65 millones de parámetros) sobre un corpus de anuncios de licitación históricos y pares texto-descripción CPV. Su propósito es facilitar tareas como búsqueda semántica, recuperación de anuncios relacionados, emparejamiento de versiones de un mismo contrato y clasificación de anuncios en divisiones del Vocabulario Común de Contratación Pública (CPV).

El modelo está entrenado exclusivamente con datos en español y publicado bajo licencia MIT, lo que permite su uso comercial sin restricciones. Aunque su tamaño es reducido, los resultados de evaluación temporal muestran una mejora significativa respecto al modelo base en la tarea de recuperación de divisiones CPV, pasando de un Recall@1 de 0,1920 a 0,6846. Está pensado para integrarse en sistemas de recuperación de información y pipelines de procesamiento de documentos administrativos, con un coste computacional muy bajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) basado en `intfloat/multilingual-e5-small` |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base, probablemente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-small`, un encoder Transformer de tipo BERT con 12 capas, 12 cabezas de atención y 384 dimensiones ocultas, entrenado originalmente con objetivos contrastivos multilingües. El fine-tuning se realizó sobre el dataset `hsilvosa/openplacsp`, que contiene versiones históricas de anuncios de contratación pública española y pares texto-descripción CPV.

El entrenamiento utilizó 150.000 pares de versiones (mismo contrato en distintas versiones) y 50.000 pares texto-CPV, con una semilla fija (20260817). Los datos de entrenamiento se limitaron a anuncios con primera publicación hasta 2022, reservando 2023 y 2024 para validación y prueba. No se especifica la función de pérdida ni el número de épocas, pero al tratarse de un modelo de similitud semántica, se asume un entrenamiento contrastivo (por ejemplo, con pérdida de similitud coseno). El modelo se usa con los prefijos `query:` y `passage:` tal como indica la documentación de E5.

## Capacidades

- Generación de embeddings de frases o documentos cortos (anuncios de licitación, descripciones de CPV) para similitud semántica.
- Búsqueda semántica en corpus de contratación pública: dado un texto de consulta, recupera los anuncios más relevantes.
- Recuperación de versiones de un mismo contrato: identifica anuncios que son versiones posteriores o anteriores de un mismo procedimiento.
- Clasificación de anuncios en divisiones CPV: asigna un texto a una categoría del vocabulario CPV mediante similitud con descripciones de referencia.
- Matching de documentos relacionados: agrupa anuncios que tratan sobre el mismo objeto contractual.
- Soporte de integración con `sentence-transformers` y `text-embeddings-inference` (compatible con endpoints de HuggingFace).
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Búsqueda semántica en portales de contratación pública: un usuario puede escribir una consulta en lenguaje natural (p. ej., "mantenimiento de aplicaciones") y el modelo recupera los anuncios más similares, superando las limitaciones de la búsqueda por palabras clave.
- Detección de duplicados o versiones de un mismo contrato: al comparar embeddings de anuncios, se pueden identificar versiones revisadas de un mismo procedimiento, útil para auditorías o seguimiento de expedientes.
- Clasificación automática de anuncios en códigos CPV: dado el texto de un anuncio, se puede asignar automáticamente la división CPV correspondiente, reduciendo el trabajo manual en plataformas de contratación.
- Agrupación de licitaciones similares para análisis de mercado: permite agrupar contratos con objetos similares para estudios de precios, proveedores o tendencias sectoriales.
- Asistencia en la redacción de anuncios: al comparar el texto borrador con descripciones CPV existentes, se pueden sugerir códigos CPV adecuados o detectar inconsistencias.
- Enriquecimiento de bases de datos documentales: se pueden generar embeddings para indexar y recuperar documentos históricos de contratación, mejorando la accesibilidad de archivos públicos.

## Benchmarks y rendimiento

La model card incluye una evaluación temporal sobre datos de 2024, comparando el modelo base (`intfloat/multilingual-e5-small`) con el modelo fine-tuneado. Los resultados se presentan a continuación:

| Tarea | Metrica | Base | Fine-tuned |
|---|---|---|---|
| Recuperar otra versión | Recall@1 | 0.9984 | 0.9982 |
| Recuperar otra versión | Recall@10 | 1.0000 | 0.9998 |
| Recuperar una división CPV | Recall@1 | 0.1920 | 0.6846 |
| Recuperar una división CPV | Recall@3 | 0.3672 | 0.8550 |

Se observa que el fine-tuning mantiene prácticamente el rendimiento en la tarea de recuperación de versiones (ya muy alto en el modelo base) y mejora drásticamente la recuperación de divisiones CPV, multiplicando por más de tres el Recall@1. No se han publicado otros benchmarks estándar (MMLU, etc.) por tratarse de un modelo de embeddings, no generativo.

## Requisitos de hardware

- El modelo tiene 117,65 millones de parámetros, lo que en fp32 ocupa aproximadamente 470 MB y en fp16 unos 235 MB. Es ligero y puede ejecutarse en CPU sin problemas.
- VRAM estimada: menos de 1 GB para inferencia en GPU (incluso en fp32). Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, etc.).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU con latencia baja (decenas de milisegundos por embedding).
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (TEI) para servir endpoints compatibles con HuggingFace, o exportación a ONNX para entornos de producción.
- Latencia: en CPU, se pueden generar cientos de embeddings por segundo; en GPU, miles. No se dispone de cifras exactas publicadas.

## Comparativa con modelos similares

No se han encontrado modelos comparables específicamente entrenados para contratación pública en español. La comparación más directa es con el modelo base `intfloat/multilingual-e5-small`, que ya se muestra en la tabla de benchmarks. Otros modelos de embeddings multilingües pequeños (como `paraphrase-multilingual-MiniLM-L12-v2` o `distiluse-base-multilingual-cased`) podrían servir como alternativa genérica, pero no hay datos de rendimiento en este dominio. Por tanto, la comparativa se limita a la diferencia entre base y fine-tuned, que es la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con textos en español de ámbito administrativo y de contratación pública; su rendimiento en otros idiomas o dominios será deficiente.
- Los datos de entrenamiento llegan hasta diciembre de 2024; anuncios posteriores o cambios en la legislación pueden no estar reflejados.
- La similitud semántica no implica identidad legal, irregularidad o equivalencia contractual. Las coincidencias deben ser validadas por personal experto.
- Las descripciones CPV son cortas y algunas divisiones tienen pocos ejemplos, lo que puede dar lugar a clasificaciones erróneas en categorías poco representadas.
- No es un modelo generativo: no puede producir texto, solo representaciones vectoriales.
- Al ser un fine-tuning de un modelo pequeño, su capacidad de capturar matices complejos del lenguaje es limitada en comparación con modelos más grandes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hsilvosa/openplacsp-e5-small
- Dataset de entrenamiento: https://huggingface.co/datasets/hsilvosa/openplacsp
- Modelo base `intfloat/multilingual-e5-small`: https://huggingface.co/intfloat/e5-small
- Información general sobre e5-small (OpenSourcesAI): https://opensourcesai.com/models/e5-small/
