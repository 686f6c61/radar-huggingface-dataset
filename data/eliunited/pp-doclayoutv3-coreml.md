# eliunited/pp-doclayoutv3-coreml

## Resumen

pp-doclayoutv3-coreml es una conversión a Core ML en precisión fp32 del modelo PaddlePaddle/PP-DocLayoutV3, un modelo de análisis de maquetación de documentos (document layout analysis) desarrollado originalmente por el equipo de PaddlePaddle. La conversión la publica el usuario eliunited en Hugging Face y su objetivo es permitir la ejecución del modelo en el ecosistema de Apple (macOS, iOS, iPadOS) mediante Core ML, sin necesidad de dependencias de PaddlePaddle en tiempo de inferencia.

El modelo original PP-DocLayoutV3 pertenece a la familia de modelos de visión para documentos de PaddleOCR/PaddlePaddle y está diseñado para detectar y clasificar regiones de un documento (texto, títulos, tablas, figuras, fórmulas, etc.). Esta conversión mantiene la funcionalidad del modelo base pero la empaqueta en formato Core ML, lo que facilita su integración en aplicaciones nativas de Apple.

La información pública disponible es muy escasa: la model card se limita a indicar la conversión, el commit del modelo base y la licencia Apache 2.0. No se han publicado especificaciones detalladas, benchmarks ni documentación adicional en el repositorio. El tamaño del repositorio es de 0,2 GB, lo que es coherente con un modelo de visión de tamaño moderado en fp32.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión para layout analysis; arquitectura del modelo base PP-DocLayoutV3 no detallada en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp32 (única variante publicada en este repositorio) |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma del texto en gran medida) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlmodel` / `.mlpackage`, según el empaquetado de Core ML) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base PP-DocLayoutV3 en la documentación proporcionada. Por la naturaleza de la tarea (document layout analysis) y la familia a la que pertenece (PaddleOCR/PaddlePaddle), se trata de un modelo de visión por computador orientado a la detección de regiones y su clasificación semántica dentro de una imagen de documento. La conversión publicada es una exportación a Core ML en fp32 del checkpoint original en safetensors, fijada al commit `e4f489dc536556fc1be02b973ba06756e0d4a2ac`.

No se han publicado en la información disponible datos sobre el conjunto de entrenamiento, número de tokens o imágenes, composición del dataset, ni sobre si se aplicaron técnicas de ajuste fino, destilación o post-procesado específico. Tampoco se documentan innovaciones técnicas destacables más allá de la propia conversión a Core ML para inferencia en dispositivos Apple.

## Capacidades

- Análisis de maquetación de documentos: detección y clasificación de regiones (texto, títulos, tablas, figuras, fórmulas, listas, etc.) en imágenes de documentos, según la funcionalidad esperada del modelo base PP-DocLayoutV3.
- Inferencia en el ecosistema Apple: ejecución nativa mediante Core ML en macOS, iOS e iPadOS.
- Procesamiento de imágenes de documentos escaneados o fotografías de páginas.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo conversacional, al no ser un modelo de lenguaje.
- No se documentan modos especiales (thinking mode, visión multimodal generativa, audio) más allá de la propia tarea de visión para layout.

## Casos de uso

- Digitalización de documentos en aplicaciones iOS/iPadOS: el modelo puede integrarse en apps nativas para detectar y segmentar regiones de un documento escaneado antes de aplicar OCR, aprovechando la ejecución on-device vía Core ML.
- Preprocesado para pipelines de OCR: identificar bloques de texto, tablas y figuras permite dirigir el OCR a las zonas relevantes y preservar el orden de lectura, mejorando la estructuración de documentos.
- Extracción de estructura en facturas y formularios: la detección de regiones permite aislar campos y tablas para su posterior procesamiento en aplicaciones de gestión documental.
- Archivado y clasificación documental: el análisis de layout sirve como paso previo para clasificar páginas por tipo de contenido (texto, tablas, imágenes) en sistemas de archivo.
- Procesamiento on-device con privacidad: al ejecutarse en Core ML, los documentos no necesitan enviarse a un servidor, lo que es adecuado para entornos con requisitos de privacidad (sanidad, legal, administración).
- Análisis de documentos científicos: detección de fórmulas, figuras y tablas en artículos para su indexación o extracción de contenido estructurado.
- Integración en herramientas de accesibilidad: segmentar la página para reordenar el contenido y facilitar la lectura por voz o la navegación estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo de visión de tamaño moderado (repositorio de 0,2 GB en fp32), se espera un consumo de memoria contenido, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible para el modelo base; la conversión está orientada a la Neural Engine y GPU integrada de dispositivos Apple (Apple Silicon, iPhone, iPad).
- Compatibilidad con GPU de consumo: no se documenta; el formato Core ML está pensado para hardware Apple, no para GPUs NVIDIA/AMD en servidores.
- Opciones de despliegue: Core ML (Core ML Tools, Xcode), ejecución en macOS/iOS/iPadOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| pp-doclayoutv3-coreml | Layout analysis | Core ML (fp32) | Apache 2.0 | Hugging Face (eliunited) |
| PaddlePaddle/PP-DocLayoutV3_safetensors | Layout analysis | safetensors | no disponible en la información | Hugging Face (PaddlePaddle) |
| Otros modelos de layout analysis (p. ej., LayoutLMv3, DiT) | Layout analysis | safetensors / PyTorch | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Información muy limitada: la model card no documenta arquitectura, parámetros, datos de entrenamiento ni evaluación, lo que dificulta validar su calidad en producción.
- Modelo derivado: cualquier limitación, sesgo o error del modelo base PP-DocLayoutV3 se hereda en esta conversión.
- Sin garantías de paridad numérica: la conversión a Core ML en fp32 puede introducir diferencias mínimas respecto al modelo original en PaddlePaddle; no se documenta una validación de equivalencia.
- Dependencia del ecosistema Apple: el formato Core ML limita su uso a dispositivos y sistemas Apple; no es desplegable en servidores Linux con GPU convencionales sin herramientas de conversión adicionales.
- Sin datos de sesgo: no se documentan sesgos conocidos, pero al ser un modelo de visión entrenado con datos no especificados, puede presentar sesgos según el dominio y la calidad de los documentos de entrenamiento.
- Riesgo de errores en documentos atípicos: como todo modelo de layout, puede fallar en maquetaciones poco comunes, documentos degradados o idiomas/escrituras no representados en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar los avisos de licencia y verificar la licencia del modelo base original.
- Repositorio sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de soporte activo.

## Enlaces

- [eliunited/pp-doclayoutv3-coreml en Hugging Face](https://huggingface.co/eliunited/pp-doclayoutv3-coreml)
- [PaddlePaddle/PP-DocLayoutV3_safetensors (modelo base)](https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors)
- [Commit del modelo base](https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors/tree/e4f489dc536556fc1be02b973ba06756e0d4a2ac)
