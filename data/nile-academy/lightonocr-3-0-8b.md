# nile-academy/lightonocr-3-0.8b

## Resumen

LightOnOCR-3-0.8B es un modelo de reconocimiento óptico de caracteres (OCR) desarrollado originalmente por LightOn (cuenta `lightonai` en HuggingFace) y redistribuido en el repositorio `nile-academy/lightonocr-3-0.8b` como espejo con la fuente fijada (*source-pinned mirror*) para consumidores de la plataforma Wekala. El modelo resuelve la tarea de extracción de texto a partir de imágenes de documentos, un problema clásico en digitalización de archivos, automatización de procesos documentales y pipelines de ingesta de datos.

El repositorio es un espejo de datos: preserva los checkpoints declarativos seleccionados y las model cards originales bajo `original/<source-commit>/`, además de los ficheros de despliegue en la raíz o en los subdirectorios `det/` (detección) y `rec/` (reconocimiento). No incluye código Python, checkpoints en pickle, servidores de inferencia ni código ejecutable del modelo; solo pesos en formato safetensors y exportaciones ONNX.

La relevancia de esta ficha radica en que se trata de un modelo OCR de 0,8B parámetros con licencia Apache 2.0, lo que lo hace atractivo para despliegues comerciales. No obstante, la información pública disponible es muy limitada: no se detallan arquitectura interna, datos de entrenamiento ni resultados de benchmarks, y la propia model card advierte que la publicación verifica identidades de ficheros, no la precisión OCR ni la fidelidad de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo OCR; el repositorio contiene subdirectorios `det/` y `rec/`) |
| Parametros totales | 0,8B (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona fidelidad de cuantización como no verificada) |
| Idiomas soportados | en (inglés declarado en metadatos; la model card indica que el soporte de árabe es preferente pero no un requisito de elegibilidad) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; exportaciones ONNX oficiales; checkpoints de inferencia Paddle originales retenidos por separado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El repositorio organiza los artefactos en subdirectorios `det/` (detección) y `rec/` (reconocimiento), lo que sugiere una pipeline OCR de dos etapas típica de sistemas como PaddleOCR, pero la model card no confirma esta estructura ni describe el backbone, el mecanismo de atención ni la longitud de contexto.

Tampoco se detallan los datos de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO (poco habituales en modelos OCR). La model card original se preserva bajo `original/<source-commit>/` y podría contener esta información, pero no se ha incluido en la documentación disponible. La única innovación técnica mencionada es la retención separada de checkpoints Paddle originales frente a las exportaciones ONNX oficiales, lo que facilita el despliegue en distintos runtimes.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Pipeline de detección y reconocimiento en dos etapas (subdirectorios `det/` y `rec/`).
- Exportaciones ONNX para despliegue en runtimes compatibles.
- Checkpoints Paddle originales para inferencia con el framework Paddle.
- Soporte de inglés declarado en metadatos; soporte de árabe preferente según la model card, aunque no verificado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- No se documentan capacidades multilingües más allá de inglés y árabe.

## Casos de uso

- Digitalización de archivos administrativos: el modelo puede extraer texto de escaneos de documentos en inglés para alimentar sistemas de gestión documental, aprovechando su pipeline detección + reconocimiento.
- Ingesta de facturas y recibos: integración en pipelines de contabilidad para convertir imágenes de facturas en texto estructurado, con despliegue vía ONNX en servidores sin GPU dedicada.
- Automatización de procesos de back-office: extracción de texto de formularios y contratos para su posterior procesamiento con NLP, usando los checkpoints Paddle o ONNX según el runtime disponible.
- Procesamiento de documentos en árabe (con reservas): la model card indica preferencia por árabe, por lo que podría usarse en digitalización de documentos en ese idioma, aunque la calidad no está verificada.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin restricciones de copyleft, siempre que se conserven los avisos de licencia.
- Prototipado rápido de OCR en investigación: el tamaño de 0,8B y la disponibilidad de ONNX permiten experimentar en estaciones de trabajo sin infraestructura pesada.
- Espejo para consumidores de Wekala: el repositorio sirve como fuente fijada de assets aprobados para adaptadores compilados, garantizando identidades de fichero inmutables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que la publicación verifica identidades de ficheros inmutables, no la precisión OCR, la fidelidad de cuantización, el ajuste a dispositivo ni la aceptación en escritorio, móvil o navegador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Para un modelo de 0,8B, una estimación orientativa en FP16 sería de ~1,6 GB de pesos más overhead de activaciones, pero no está confirmado por el autor.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? Probablemente sí para un modelo de 0,8B, pero no hay confirmación oficial ni requisitos publicados.
- Opciones de despliegue: exportaciones ONNX (runtime ONNX Runtime), checkpoints Paddle (Paddle Inference). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para OCR.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. La model card no incluye comparaciones con otros modelos OCR, y no se han proporcionado datos de benchmarks ni especificaciones de modelos competidores en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LightOnOCR-3-0.8B (este) | 0,8B (según nombre) | no disponible | Apache 2.0 | HuggingFace (espejo) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card advierte que la publicación verifica identidades de ficheros, no la precisión OCR ni la fidelidad de cuantización; no hay garantía de calidad.
- El soporte de árabe es preferente pero nunca un requisito de elegibilidad del modelo; los metadatos de idioma publicados no establecen calidad probada en ningún idioma.
- El repositorio no incluye código Python, servidores de inferencia ni código ejecutable; los consumidores deben aportar adaptadores compilados cualificados.
- Los modelos no están incluidos en el núcleo de Wekala; requieren assets aprobados externamente.
- No se selecciona fallback en la nube, lo que limita la resiliencia en producción.
- Riesgo de sesgos y alucinaciones: no documentado, pero inherente a cualquier modelo OCR (errores en texto manuscrito, tablas complejas, baja resolución).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se deben conservar los avisos de copyright y licencia; el repositorio conserva el fichero LICENSE upstream cuando se suministra.
- El modelo es un espejo de terceros (`nile-academy`), no el desarrollador original; la procedencia y los derechos permanecen con `lightonai`.
- No hay información sobre el tamaño real de contexto, lo que impide evaluar su idoneidad para documentos de gran extensión.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/nile-academy/lightonocr-3-0.8b
- Modelo original: https://huggingface.co/lightonai/LightOnOCR-3-0.8B/tree/36d8636925327c671bd8e479c517a004f7566bd9
- Fichero de publicación (identidades de fuente): `publication.json` dentro del repositorio
- Model cards originales: bajo `original/<source-commit>/` en el repositorio
