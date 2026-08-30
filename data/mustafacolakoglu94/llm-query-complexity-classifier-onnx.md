# mustafacolakoglu94/llm-query-complexity-classifier-onnx

## Resumen

El modelo `mustafacolakoglu94/llm-query-complexity-classifier-onnx` es una exportación en formato ONNX del clasificador de complejidad de consultas `anasnassar/llm-query-complexity-classifier`, desarrollado por el usuario mustafacolakoglu94. Su propósito es clasificar consultas de texto en tres niveles —`LOW`, `MEDIUM` y `HIGH`— para enrutarlas hacia distintos tipos de modelos de lenguaje (economy, balanced o frontier) según la complejidad estimada. Esto permite optimizar costes y latencia en pipelines que combinan modelos pequeños y grandes.

El modelo está pensado para inferencia en proceso mediante la librería `@huggingface/transformers` dentro del entorno Siper Flow. La etiqueta `modernbert` sugiere que el modelo base emplea la arquitectura ModernBERT, aunque no se detalla en la documentación. El repositorio tiene un tamaño de 0,7 GB y se distribuye bajo licencia Apache 2.0. Aunque actualmente no registra descargas ni valoraciones, su utilidad práctica radica en la clasificación rápida de consultas para sistemas de enrutamiento inteligente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (según etiqueta, no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | posiblemente cuantizado (el script de regeneración incluye `--quantize`), tipo no especificado |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una exportación ONNX de un clasificador de complejidad de consultas basado en ModernBERT, pero no se proporcionan detalles sobre la arquitectura interna, el número de capas, la dimensionalidad ni el proceso de entrenamiento. El script de regeneración (`scripts/export-complexity-onnx.py`) sugiere que el modelo se exporta desde el original de `anasnassar/llm-query-complexity-classifier`, posiblemente con cuantización. No se mencionan datos de entrenamiento, tokens utilizados ni técnicas de ajuste como RLHF o DPO. Lo único claro es que el modelo clasifica en tres etiquetas discretas, lo que lo convierte en un clasificador de texto de baja latencia.

## Capacidades

- Clasificación de consultas en tres niveles: `LOW`, `MEDIUM` y `HIGH`.
- Enrutamiento de consultas a modelos de distinto coste (economy, balanced, frontier) en sistemas multi-modelo.
- Inferencia en proceso mediante `@huggingface/transformers` con formato ONNX, lo que permite integración ligera en aplicaciones existentes.
- Compatible con el ecosistema ONNX Runtime y otras herramientas que soporten este formato.
- No se documentan capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multilingüe.

## Casos de uso

- Optimización de costes en pipelines de LLM: clasificar cada consulta entrante y enviar las de baja complejidad a un modelo pequeño (economy) y las de alta complejidad a un modelo frontier, reduciendo el gasto por token.
- Reducción de latencia en asistentes conversacionales: las consultas simples se responden con modelos rápidos, mientras que las complejas se derivan a modelos más lentos pero capaces.
- Filtrado previo en sistemas de recuperación aumentada (RAG): determinar si una pregunta requiere búsqueda exhaustiva o puede responderse directamente.
- Control de calidad en generación de código: clasificar peticiones de programación según su dificultad para seleccionar el modelo de código adecuado.
- Gestión de colas en APIs de inferencia: priorizar consultas según su complejidad para equilibrar la carga entre servidores.
- Evaluación de coste de llamadas a LLM en aplicaciones empresariales: predecir el coste antes de ejecutar la consulta y aplicar políticas de presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un clasificador de texto pequeño (tamaño del repo 0,7 GB), puede ejecutarse en CPU sin problemas para inferencia por lotes.
- En GPU, cualquier modelo con al menos 2 GB de VRAM sería suficiente, aunque no hay datos exactos sobre consumo de memoria.
- El formato ONNX permite su uso con ONNX Runtime, que ofrece optimizaciones para CPU y GPU.
- No se especifican GPUs recomendadas ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificadores de complejidad de consultas en ONNX). Por tanto, no es posible establecer una comparativa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o comportamientos indeseados del modelo.
- La clasificación en solo tres niveles puede no capturar matices intermedios de complejidad.
- El ámbito de aplicación es específico (enrutamiento de consultas) y no es un modelo de propósito general.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base `anasnassar/llm-query-complexity-classifier`.
- No hay garantías de rendimiento ni soporte oficial más allá de lo publicado en el repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mustafacolakoglu94/llm-query-complexity-classifier-onnx
- Modelo base: https://huggingface.co/anasnassar/llm-query-complexity-classifier
- Ecosistema ONNX: https://huggingface.co/onnx
- ONNX Runtime: https://onnxruntime.ai/models
