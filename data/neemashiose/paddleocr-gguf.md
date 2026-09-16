# NeemaShioSe/paddleocr.gguf

## Resumen

NeemaShioSe/paddleocr.gguf es una conversión al formato GGUF de un modelo de PaddleOCR, publicada por el usuario NeemaShioSe en HuggingFace. La model card la describe literalmente como un "ggml port of PaddleOcr model for fun", es decir, un port experimental sin objetivos de producción declarados, y remite a un documento del repositorio VULKAN-TORCH para los detalles de ejecución. No se documenta ni la arquitectura concreta, ni el dataset de entrenamiento, ni resultados de evaluación.

El repositorio ocupa 0,2 GB y el modelo declara 21.935.969 parámetros (aproximadamente 21,9 millones). La licencia es Apache-2.0 y la única etiqueta relevante es `gguf`; no hay pipeline declarado, no se especifican idiomas soportados y no existe información sobre cuantizaciones disponibles. Se publicó el 13 de septiembre de 2026 y se actualizó el 16 de septiembre de 2026, con 56 descargas y 0 likes en el momento de redactar esta ficha.

Su relevancia es limitada y muy específica: interesa a quien quiera ejecutar reconocimiento óptico de caracteres (OCR) mediante un runtime GGML/Vulkan en lugar de las dependencias habituales de PaddlePaddle, y a quien estudie ports de modelos de visión a GGUF. No es un modelo de lenguaje generalista ni compite en la categoría de los LLM conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el nombre indica que deriva de PaddleOCR, pero no se confirma qué módulo ni qué arquitectura concreta) |
| Parametros totales | 21.935.969 (~21,9 M) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no aplica / no disponible: es un modelo de OCR, no procesa contexto de texto |
| Tipos de cuantizacion | no disponibles; el repositorio distribuye pesos en formato GGUF |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ggml) |
| Tarea declarada | port de PaddleOCR (reconocimiento óptico de caracteres) |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-09-13 |
| Ultima actualizacion | 2026-09-16 |
| Descargas / likes | 56 / 0 |

Nota: los metadatos de HuggingFace etiquetan el recuento de parámetros como dato procedente de safetensors, pero el repositorio se distribuye en GGUF. Es una discrepancia de la ficha de HuggingFace que no se puede resolver con la información disponible.

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la documentación disponible. La model card se limita a indicar que se trata de un port a ggml de un modelo PaddleOCR y enlaza a un ejemplo del repositorio VULKAN-TORCH. No se especifica si el modelo original es un módulo de detección de texto, un módulo de reconocimiento, un modelo de análisis de estructura de documento o una combinación, ni si incorpora componentes de atención, convolucionales o híbridos.

Tampoco hay datos sobre el entrenamiento: no se indica el número de tokens o imágenes utilizadas, la composición del dataset, si hubo ajuste con RLHF/DPO (poco probable en un modelo de OCR) ni qué innovaciones técnicas incorpora. Cualquier afirmación sobre la arquitectura basada en el nombre "PaddleOCR" sería una inferencia no confirmada por el autor.

## Capacidades

- Reconocimiento óptico de caracteres (OCR): es la única capacidad que se deduce de la model card, que identifica el modelo como un port de PaddleOCR.
- Ejecución mediante runtime GGML/ggml: el formato GGUF y el enlace al ejemplo de VULKAN-TORCH apuntan a un despliegue con backend Vulkan, sin depender de PaddlePaddle.
- Detección de layout, tablas, fórmulas o análisis de documentos: no documentado.
- Tool calling / function calling: no aplica ni está documentado; no es un modelo conversacional.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles; no se especifica el conjunto de idiomas o alfabetos que reconoce.
- Modo "thinking", visión generalista, audio o entrada multimodal: no disponible.

## Casos de uso

- Digitalización local de documentos escaneados: extraer el texto de facturas, contratos o apuntes en una máquina sin instalación de PaddlePaddle, usando el runtime GGML indicado por el autor. Adecuado por el tamaño reducido del modelo (~22 M de parámetros) y su naturaleza OCR.
- OCR en equipos con GPU AMD mediante Vulkan: el port se apoya en el backend Vulkan del repositorio VULKAN-TORCH, lo que permite inferencia en hardware donde los stacks CUDA no están disponibles.
- Preprocesado de texto en pipelines de NLP: usar el modelo como primer eslabón para convertir imágenes en texto que después alimente tareas de clasificación, búsqueda o resumen con otro modelo.
- Indexación y búsqueda documental: extraer texto de un archivo de PDFs escaneados para construir un índice de búsqueda o una base documental recuperable.
- Despliegue en el borde o en escritorio: con pesos GGUF de pocas decenas de megabytes, el modelo puede integrarse en aplicaciones de escritorio o dispositivos con recursos limitados, siempre que exista un runtime compatible.
- Experimentación y docencia sobre ports GGML: sirve como caso de estudio reproducible para entender el proceso de conversión de un modelo de visión al formato GGUF y su ejecución fuera del ecosistema original.
- Validación de pipelines OCR propios: comparar la salida de este port contra la del PaddleOCR original para detectar pérdidas de precisión introducidas en la conversión.

En todos los casos debe tenerse en cuenta que no hay métricas publicadas de precisión (CER/WER) ni validación por parte de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en inferencia (calculada a partir de los 21,9 M de parámetros declarados, sin incluir activaciones ni buffers del runtime):
  - FP32: ~88 MB
  - FP16/BF16: ~44 MB
  - Q8_0: ~23 MB
  - Q4_K_M: ~13 MB
- El repositorio ocupa 0,2 GB, un tamaño coherente con pesos en precisión completa o con varios ficheros de cuantización, aunque no se detalla su contenido.
- GPU recomendadas: no disponibles. Al no documentarse el backend exacto, no se puede confirmar compatibilidad con A100, H100, RTX 4090 u otras.
- GPU de consumo: por tamaño, el modelo cabría holgadamente en cualquier GPU de consumo con 4 GB o más de VRAM, e incluso en CPU, siempre que el runtime GGML utilizado lo soporte. Esta afirmación se basa únicamente en el recuento de parámetros, no en pruebas publicadas.
- Opciones de despliegue: el autor remite al ejemplo del repositorio VULKAN-TORCH. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| NeemaShioSe/paddleocr.gguf | 21,9 M | no aplica | GGUF | Apache-2.0 | no disponible |
| PaddleOCR (upstream) | no disponible | no aplica | framework PaddlePaddle | no disponible en la informacion proporcionada | no disponible |
| Tesseract OCR | no disponible | no aplica | binario/modelos propios | no disponible en la informacion proporcionada | no disponible |
| EasyOCR | no disponible | no aplica | PyTorch | no disponible en la informacion proporcionada | no disponible |

Los datos de las alternativas no proceden de la información proporcionada en esta búsqueda y no se han podido verificar; se incluyen únicamente como referencia de categoría. No se dispone de cifras comparativas de precisión, latencia o cobertura de idiomas.

## Limitaciones y advertencias

- Validación comunitaria nula: 0 likes y 56 descargas en el momento de la consulta, sin issues ni evaluaciones públicas conocidas.
- Documentación mínima: la model card es de una sola línea y no describe arquitectura, datos de entrenamiento, idiomas ni métricas.
- Carácter experimental explícito: el autor describe el port como "for fun", lo que desaconseja su uso en producción sin una validación propia previa.
- Riesgo de errores de reconocimiento: en OCR, el equivalente a la alucinación es la sustitución, omisión o inserción de caracteres. No hay métricas de CER/WER publicadas que permitan acotar este riesgo.
- Idiomas y alfabetos: no disponibles; no se puede asumir cobertura multilingüe ni siquiera de un idioma concreto.
- Cobertura funcional incierta: no se especifica si el modelo incluye detección de cajas de texto, reconocimiento, o ambas cosas, lo que afecta directamente a cómo debe integrarse en un pipeline.
- Restricciones de licencia: los pesos del repositorio se publican bajo Apache-2.0, lo que en principio permite uso comercial. No obstante, no se documenta la trazabilidad del modelo original de PaddleOCR ni las condiciones de los datos con los que se entrenó, por lo que conviene verificar el origen antes de un uso comercial.
- Dependencia de un runtime poco habitual: el despliegue se apoya en el ejemplo del repositorio VULKAN-TORCH, no en herramientas estándar como llama.cpp u Ollama, lo que puede limitar el soporte y el mantenimiento.
- Discrepancia de metadatos: HuggingFace declara el recuento de parámetros como dato obtenido de safetensors pese a que el repositorio solo distribuye GGUF.
- Sin garantía de mantenimiento: no hay indicios de actualizaciones planificadas más allá de la del 16 de septiembre de 2026.

## Enlaces

- HuggingFace: https://huggingface.co/NeemaShioSe/paddleocr.gguf
- Ejemplo de ejecución indicado por el autor (repositorio VULKAN-TORCH): https://github.com/Rafa00127/VULKAN-TORCH/blob/main/example/python/PaddleOCR.md
- Los resultados de búsqueda web disponibles no contienen información relacionada con este modelo (corresponden a páginas sobre resistencia al agua del Apple Watch), por lo que no se incluyen como fuentes.
