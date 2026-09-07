# giocom/Qwen3.6-35B-A3B-MXFP4-GGUF

## Resumen

El modelo Qwen3.6-35B-A3B-MXFP4-GGUF es una cuantización GGUF del modelo multimodal Qwen/Qwen3.6-35B-A3B, creada por el usuario giocom. Cuenta con 35.505.251.456 parámetros totales y, según la nomenclatura del nombre, activa alrededor de 3.000 millones de parámetros por token, lo que indica una arquitectura de mezcla de expertos (MoE). El autor ha aplicado modificaciones de tipo abliterated y uncensored, y ha cuantizado los pesos al formato MXFP4 de 4 bits, reduciendo el tamaño del repositorio a 22,2 GB. Es compatible con el pipeline image-text-to-text, por lo que puede procesar entradas de imagen y texto, y está disponible en formato GGUF para su despliegue con motores como llama.cpp u Ollama. Su relevancia radica en ofrecer un modelo multimodal de gran tamaño con un tamaño de repositorio contenido, adecuado para prototipado y aplicaciones que requieran soporte de imágenes en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), inferido del nombre A3B (no confirmado) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3.000 millones, inferido de la nomenclatura A3B (no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (cuantización de 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 22,2 GB |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento. El modelo base es Qwen/Qwen3.6-35B-A3B, un modelo multimodal que procesa entradas de imagen y texto. La etiqueta "abliterated" indica que se ha aplicado una técnica de abliteración para eliminar ciertos comportamientos de seguridad, y la etiqueta "uncensored" sugiere que se han eliminado restricciones de contenido. La etiqueta "MTP" del nombre del repositorio podría referirse a predicción multi-token, pero no hay documentación que lo confirme. El proceso de cuantización utiliza MXFP4 y una matriz de importancia (imatrix) para optimizar la pérdida de precisión.

## Capacidades

- Procesamiento multimodal de imagen y texto, según el pipeline image-text-to-text.
- Generación de texto conversacional en formato chat.
- Compatibilidad con endpoints (tag endpoints_compatible) para integración con APIs.
- Ejecución en motores compatibles con GGUF, como llama.cpp u Ollama.
- La modificación "uncensored" y "abliterated" puede alterar las respuestas en comparación con el modelo original, eliminando filtros de seguridad.
- No hay información confirmada sobre tool calling, agentes, razonamiento matemático, generación de código ni capacidades multilingües.

## Casos de uso

- Análisis de documentos escaneados: el modelo puede procesar imágenes de facturas, formularios o recibos y extraer información relevante en un pipeline de automatización documental, gracias a su capacidad multimodal.
- Descripción de imágenes para accesibilidad: puede generar texto alternativo para personas con discapacidad visual en aplicaciones de asistencia, al recibir una imagen y producir una descripción en lenguaje natural.
- Asistente de soporte al cliente: gestiona consultas de usuarios que adjuntan capturas de pantalla o fotografías de productos, combinando la interpretación visual con la generación de respuestas conversacionales.
- Generación de contenido educativo: crea descripciones de imágenes para material didáctico en línea, útil en plataformas de aprendizaje que necesitan anotaciones automáticas de recursos visuales.
- Prototipado rápido de chatbots multimodales en local: gracias al formato GGUF y al tamaño del repositorio de 22,2 GB, puede desplegarse en una estación de trabajo sin depender de APIs externas, lo que facilita la experimentación y el desarrollo iterativo.
- Integración en sistemas de moderación visual: puede describir contenido inapropiado en imágenes, aunque la naturaleza "uncensored" del modelo reduce la fiabilidad para este uso, por lo que requeriría una evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 22,2 GB, lo que da una cota inferior aproximada para la memoria necesaria, pero no es un dato confirmado de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con consumer GPU: no disponible.
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo base Qwen/Qwen3.6-35B-A3B podría usarse como referencia, pero no se conocen sus especificaciones ni resultados de rendimiento.

## Limitaciones y advertencias

- No hay información sobre sesgos, riesgos de alucinación o limitaciones de idioma en los datos disponibles.
- La modificación "abliterated" y "uncensored" puede producir respuestas no alineadas con políticas de seguridad, lo que supone un riesgo en aplicaciones de producción que requieran contenido seguro.
- La cuantización MXFP4 puede degradar la calidad de las respuestas en comparación con el modelo original, aunque no se disponen de datos objetivos al respecto.
- No se ha publicado documentación sobre la longitud de contexto, los idiomas soportados ni las capacidades exactas de razonamiento, por lo que la evaluación debe realizarse mediante pruebas propias.
- La licencia Apache 2.0 permite uso comercial, pero la modificación del modelo original implica que no se mantienen las garantías de calidad del modelo base.

## Enlaces

- https://huggingface.co/giocom/Qwen3.6-35B-A3B-MXFP4-GGUF
- https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- https://huggingface.co/giocom/models
- No hay papers o blogs adicionales en la información proporcionada.
