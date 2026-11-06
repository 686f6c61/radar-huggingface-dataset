# androidli/colorpicker-models-zh

## Resumen

`androidli/colorpicker-models-zh` es una exportación a ONNX con cuantización INT8 dinámica del modelo de embeddings `BAAI/bge-small-zh-v1.5`, publicada por el usuario androidli para un caso de uso muy concreto: la búsqueda de colores mediante consultas en chino en herramientas de tipo *color picker*. No se trata de un modelo de propósito general, sino de un artefacto de despliegue optimizado para ejecutarse en el navegador del cliente mediante transformers.js y onnxruntime-web.

El modelo conserva la arquitectura BERT del original (4 capas, según la model card) y se distribuye como un único fichero ONNX de 24 MB, lo que permite una carga diferida (*lazy load*) únicamente cuando el usuario introduce una consulta con caracteres no latinos. Los usuarios que solo escriben en alfabeto latino nunca descargan este modelo, ya que la contraparte latina se publica en un repositorio separado (`androidli/colorpicker-models`).

Su relevancia es acotada pero clara: demuestra un patrón de empaquetado de embeddings multilingües por idioma para aplicaciones web ligeras, con cuantización INT8 y verificación de integridad mediante `manifest.json`. No aporta innovaciones en arquitectura ni entrenamiento propios; todo el valor está en la optimización del despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertModel, 4 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (dynamic quantization) |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_int8.onnx`) |
| Modelo base | BAAI/bge-small-zh-v1.5 |
| Relación con el base | quantized |
| Tamaño del fichero ONNX | 24 MB |
| Tamaño del repositorio | 0.0 GB (según Hugging Face) |
| Librería | onnx (transformers.js / onnxruntime-web) |
| Pipeline | feature-extraction |
| Pooling recomendado | CLS con normalización |
| Descargas | 297 |
| Fecha de creación | 2026-10-29 |

## Arquitectura y entrenamiento

El modelo es una exportación directa del transformer BERT de `BAAI/bge-small-zh-v1.5`, reducido a 4 capas según indica la model card, y cuantizado dinámicamente a INT8. No se ha realizado ningún entrenamiento ni ajuste adicional: los pesos derivan íntegramente del modelo base de BAAI, y el tokenizador (`tokenizer.json`, `tokenizer_config.json`) y la configuración (`config.json`) se mantienen sin cambios respecto al upstream.

La única intervención técnica es la conversión a ONNX y la cuantización INT8 dinámica, orientada a reducir el tamaño a 24 MB y habilitar la inferencia en el navegador con onnxruntime-web. El repositorio incluye un `manifest.json` con el hash SHA-256 y el tamaño de cada fichero, lo que permite verificar la integridad de la descarga en el cliente. No se documentan datos de entrenamiento propios, tokens procesados, ni fases de RLHF/DPO; toda esa información correspondería al modelo base y no se reproduce aquí.

## Capacidades

- Generación de embeddings de texto para consultas en chino, orientados a búsqueda semántica de colores.
- Extracción de características (*feature-extraction*) con pooling CLS y normalización L2.
- Ejecución en el navegador del cliente mediante transformers.js y onnxruntime-web, sin backend.
- Carga diferida condicionada al idioma: solo se descarga cuando la consulta contiene caracteres no latinos.
- Verificación de integridad de los ficheros mediante `manifest.json` (SHA-256 y tamaño).
- Compatibilidad con text-embeddings-inference y endpoints compatibles (según los tags del repositorio).
- Soporte exclusivo de chino; no cubre otros idiomas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Búsqueda de colores por nombre en chino: el modelo vectoriza consultas como «黛蓝» y las compara por similitud coseno con los embeddings precalculados de un catálogo de colores, devolviendo las coincidencias más cercanas.
- Selector de color en aplicaciones web con soporte para usuarios sinohablantes: se integra como embedder en el cliente y se activa solo cuando el usuario escribe en chino, evitando descargas innecesarias para el resto.
- Aplicaciones de diseño gráfico en navegador: permite buscar paletas por descripción textual en chino sin enviar consultas a un servidor, lo que reduce latencia y preserva la privacidad.
- Herramientas de edición de imágenes con búsqueda semántica de tonos: el embedder alimenta un índice vectorial local de colores y resuelve consultas en tiempo de interacción.
- Prototipado de sistemas RAG ligeros en chino: sirve como componente de recuperación para dominios acotados donde el vocabulario es reducido y el modelo base de 4 capas es suficiente.
- Despliegue en entornos con recursos limitados: el fichero de 24 MB y la inferencia INT8 permiten ejecutarlo en dispositivos de gama baja o en pestañas del navegador con restricciones de memoria.
- Integración en pipelines de CI/CD para validación de embeddings: el `manifest.json` con hashes permite verificar que el artefacto desplegado coincide con el publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del fichero (24 MB en INT8) el consumo de memoria es muy reducido, del orden de decenas de MB en tiempo de ejecución.
- GPU recomendadas: no aplica para el caso de uso previsto (inferencia en navegador vía onnxruntime-web); en servidor podría ejecutarse en CPU sin problema.
- Cabe en GPU de consumo: sí, cualquier GPU consumer podría alojarlo, aunque el diseño está pensado para ejecución en CPU del cliente.
- Opciones de despliegue: transformers.js, onnxruntime-web, text-embeddings-inference y endpoints compatibles (según los tags del repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|---|
| androidli/colorpicker-models-zh | no disponible (BERT 4 capas, INT8) | no disponible | zh | MIT | ONNX INT8 | Exportación cuantizada de bge-small-zh-v1.5, 24 MB |
| BAAI/bge-small-zh-v1.5 | no disponible | no disponible | zh | MIT | safetensors / PyTorch | Modelo base upstream, sin cuantizar |
| androidli/colorpicker-models | no disponible | no disponible | latino | no disponible | ONNX | Contraparte latina del mismo autor para consultas en alfabeto latino |

## Limitaciones y advertencias

- El modelo solo cubre chino; las consultas en otros idiomas no están soportadas por este artefacto.
- Es una cuantización INT8 de un modelo base de 4 capas: la precisión de los embeddings puede degradarse respecto al modelo original sin cuantizar, y no se publican métricas que lo cuantifiquen.
- No se han publicado benchmarks ni evaluaciones de calidad de recuperación; el rendimiento en búsqueda semántica de colores no está validado de forma pública.
- El dominio de uso es muy específico (búsqueda de colores); no debe emplearse como embedder general sin evaluación previa.
- La licencia MIT se hereda del modelo base, por lo que el uso comercial está permitido, pero conviene verificar los términos del upstream `BAAI/bge-small-zh-v1.5`.
- No soporta tool calling, agentes, visión ni otras capacidades propias de modelos generativos.
- El repositorio reporta un tamaño de 0.0 GB en Hugging Face, lo que puede indicar un problema de empaquetado o de metadatos; conviene verificar los ficheros antes de integrarlo en producción.
- No hay información sobre sesgos del modelo base ni sobre el proceso de cuantización; se desconoce el impacto en subgrupos de vocabulario chino.

## Enlaces

- Hugging Face: https://huggingface.co/androidli/colorpicker-models-zh
- Modelo base: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Contraparte latina: https://huggingface.co/androidli/colorpicker-models
- transformers.js: https://github.com/xenova/transformers.js
- onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
