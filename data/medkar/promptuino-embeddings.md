# medkar/promptuino-embeddings

## Resumen

Promptuino embeddings es una exportación a ONNX del modelo de embeddings multilingüe `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, publicada por el usuario medkar. El modelo está diseñado específicamente para el proyecto Promptuino, una herramienta que recupera bibliotecas de Arduino de forma local, sin necesidad de conexión a red en tiempo de ejecución. La exportación se realizó con la librería optimum y ONNX Runtime, en precisión fp32 y sin cuantización.

La relevancia de este modelo radica en su uso como componente de recuperación semántica dentro de una aplicación de escritorio o CLI. Al estar fijado a una revisión concreta del repositorio, garantiza que los umbrales de similitud medidos durante el desarrollo de Promptuino se mantengan estables, evitando degradaciones silenciosas en la calidad de la recuperación. El modelo base es un transformer de 12 capas con 118 millones de parámetros, aunque esta cifra no se confirma en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniLM-L12-v2, 12 capas, 6 cabezas de atención) |
| Parametros totales | no disponible (el modelo base MiniLM-L12-v2 tiene aproximadamente 118M, pero no se confirma en la documentación) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 512 tokens, pero no se especifica en la exportación) |
| Tipos de cuantizacion | fp32 (sin cuantización) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se detallan los idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `model.onnx`, 470216988 bytes) |

## Arquitectura y entrenamiento

El modelo es una exportación directa del checkpoint `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, un transformer encoder de 12 capas con 6 cabezas de atención por capa, entrenado originalmente para generar embeddings de frases en múltiples idiomas. La exportación se realizó con la herramienta `scripts/export_onnx_model.py` de Promptuino, utilizando la librería optimum y ONNX Runtime, manteniendo la precisión fp32 original. No se aplicó ninguna cuantización ni modificación de los pesos.

El proceso de entrenamiento del modelo base no se detalla en la información proporcionada, pero se sabe que MiniLM-L12-v2 fue entrenado con un objetivo de parafraseo multilingüe, usando técnicas de destilación de conocimiento desde modelos más grandes. La exportación ONNX no altera los pesos, por lo que el comportamiento del modelo es idéntico al original, aunque los valores de similitud coseno pueden variar ligeramente debido a diferencias en la implementación del runtime.

## Capacidades

- Generación de embeddings de frases y párrafos para búsqueda semántica.
- Recuperación de documentos basada en similitud coseno.
- Soporte multilingüe (heredado del modelo base, aunque no se especifican los idiomas concretos).
- Integración con ONNX Runtime para inferencia local sin dependencias de red.
- Uso específico en Promptuino para recuperar bibliotecas de Arduino a partir de consultas en lenguaje natural.

## Casos de uso

- Recuperación local de bibliotecas de Arduino: Promptuino utiliza este modelo para indexar y buscar bibliotecas de Arduino en el sistema local, permitiendo al desarrollador encontrar la biblioteca adecuada sin conexión a internet.
- Búsqueda semántica en documentación técnica: el modelo puede emplearse para buscar fragmentos de documentación o ejemplos de código en un corpus local, gracias a su capacidad de entender consultas en lenguaje natural.
- Sistemas de recomendación de código: dado un fragmento de código o una descripción de funcionalidad, el modelo puede sugerir bibliotecas o módulos relacionados.
- Clasificación de textos por similitud: al generar embeddings, permite agrupar documentos por temática o detectar duplicados en un conjunto de textos.
- Asistente de desarrollo offline: integrado en un IDE o editor, puede ofrecer sugerencias de bibliotecas basadas en el contexto del código escrito, sin enviar datos a servidores externos.
- Pipeline de embeddings en entornos con restricciones de red: al ser un archivo ONNX autocontenido, puede desplegarse en entornos aislados o con políticas de seguridad estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es una exportación del checkpoint original, por lo que su rendimiento en tareas de similitud semántica debería ser equivalente al de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, pero no se proporcionan métricas concretas (STS, MTEB, etc.) para esta exportación específica.

## Requisitos de hardware

- El archivo ONNX pesa aproximadamente 448 MB (470216988 bytes), por lo que requiere al menos 1 GB de RAM para cargar el modelo en memoria.
- La inferencia se puede ejecutar en CPU sin problemas; no se requiere GPU para tareas de recuperación a pequeña escala.
- Para uso en producción con volúmenes altos de consultas, se recomienda una CPU moderna con soporte AVX2 o una GPU con al menos 4 GB de VRAM si se desea acelerar el procesamiento por lotes.
- El modelo se integra con ONNX Runtime, por lo que puede desplegarse en cualquier plataforma que soporte esta librería (Windows, Linux, macOS, dispositivos edge).
- No se dispone de datos de latencia o throughput específicos para esta exportación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| medkar/promptuino-embeddings | no disponible (aprox. 118M) | no disponible (512 tokens en el base) | ONNX fp32 | Apache-2.0 | Recuperación local de bibliotecas Arduino |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118M | 512 tokens | PyTorch / safetensors | Apache-2.0 | Embeddings multilingües generales |
| sentence-transformers/all-MiniLM-L6-v2 | 22.7M | 256 tokens | PyTorch / safetensors | Apache-2.0 | Embeddings multilingües ligeros |

La comparativa se limita a los modelos base relacionados, ya que no se dispone de información sobre alternativas específicas para recuperación de bibliotecas de Arduino. El rendimiento de la exportación ONNX es idéntico al del modelo original, pero la ventaja principal es su formato autocontenido y su fijación a una revisión concreta para garantizar la reproducibilidad.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para la recuperación de bibliotecas de Arduino dentro de Promptuino; su uso fuera de este contexto puede no estar optimizado.
- La exportación ONNX no incluye cuantización, por lo que el tamaño del archivo es considerable (448 MB) y puede no ser adecuado para dispositivos con almacenamiento limitado.
- No se proporcionan datos sobre sesgos o alucinaciones, pero al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación no aplica directamente.
- La licencia Apache-2.0 permite uso comercial, pero Promptuino en sí está bajo GPL-3.0, lo que puede afectar a la distribución de la aplicación completa.
- La fijación a una revisión concreta del repositorio implica que cualquier cambio en el modelo (nueva exportación, cuantización) romperá la compatibilidad con los umbrales de recuperación medidos.
- No se especifican los idiomas soportados, aunque el modelo base es multilingüe; se recomienda verificar el comportamiento en el idioma de destino antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/medkar/promptuino-embeddings
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Repositorio de Promptuino: https://github.com/medkar/Promptuino
