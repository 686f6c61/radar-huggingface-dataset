# LibreYOLO/LibreMoondream3

## Resumen

LibreMoondream3 es un espejo (mirror) de los pesos de Moondream 3 Preview, un modelo de visión-lenguaje (VLM) desarrollado originalmente por M87 Labs, Inc. y redistribuido por LibreYOLO dentro de su ecosistema de librería `libreyolo`. El repositorio no modifica ningún parámetro aprendido; conserva el snapshot de Hugging Face del modelo base `moondream/moondream3-preview` y añade notas de carga específicas para la envoltura `LibreVLM` de LibreYOLO. Su propósito principal es facilitar la integración de este VLM en pipelines de detección de objetos y tareas de imagen-a-texto bajo la licencia Business Source License 1.1.

El modelo se publica con el pipeline de `object-detection` y etiquetas que indican soporte para `image-text-to-text` y `vlm`. Aunque no se especifican detalles de arquitectura, tamaño de parámetros ni longitud de contexto en la información disponible, el tamaño del repositorio (18,5 GB) sugiere un modelo de varios miles de millones de parámetros, y las notas oficiales de ejecución indican que requiere aproximadamente 24 GB de memoria GPU. La relevancia actual radica en que ofrece una vía para usar Moondream 3 Preview con la librería LibreYOLO, que mantiene su código bajo licencia MIT mientras que los pesos quedan sujetos a la licencia BSL 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Business Source License 1.1 con Additional Use Grant |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (tipo de transformer, uso de mezcla de expertos, atención lineal, etc.) ni sobre los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). El repositorio declara explícitamente que no se modificó ningún parámetro aprendido respecto al modelo base `moondream/moondream3-preview`, por lo que cualquier característica arquitectónica o de entrenamiento debe atribuirse a ese modelo original. Tampoco se documentan innovaciones técnicas específicas en esta redistribución.

## Capacidades

- Detección de objetos: el pipeline declarado es `object-detection`, y el ejemplo de uso muestra la definición de clases como "person" o "helmet" para predicción sobre imágenes.
- Generación de texto a partir de imágenes (image-text-to-text): el modelo está etiquetado como VLM, lo que implica capacidad de describir o responder sobre contenido visual.
- Integración con la librería `libreyolo` mediante la clase `LibreVLM`, que permite cargar el modelo y realizar predicciones con una interfaz simple.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, soporte multilingüe o modos especiales de pensamiento.

## Casos de uso

- Detección de objetos en entornos industriales: el ejemplo oficial muestra la detección de personas y cascos en imágenes, lo que resulta útil para control de seguridad laboral o vigilancia de cumplimiento de normativas. Se usaría con `LibreVLM` definiendo las clases relevantes y procesando imágenes capturadas por cámaras.
- Moderación de contenido visual: al ser un VLM, puede emplearse para clasificar o filtrar imágenes en plataformas de contenido generado por usuarios, identificando objetos o escenas no permitidas.
- Asistencia a personas con discapacidad visual: la capacidad de generar descripciones textuales de imágenes permite construir aplicaciones que narren el entorno a partir de fotografías tomadas con un móvil.
- Automatización de inventario en retail: detectar productos en estanterías o almacenes mediante imágenes, facilitando el recuento y la gestión de stock.
- Análisis de imágenes médicas preliminar: aunque no hay evidencia de entrenamiento específico, la detección de objetos podría aplicarse a radiografías o ecografías para localizar estructuras anatómicas, siempre bajo supervisión profesional.
- Documentación de obras y patrimonio: generar descripciones automáticas de fotografías de monumentos o piezas de museo para catálogos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GB de memoria GPU, según las notas oficiales de ejecución citadas en la model card.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM, como la NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). No se mencionan opciones de cuantización para reducir el consumo.
- Compatibilidad con GPU de consumo: sí, en modelos como la RTX 4090, pero no en tarjetas de 8-12 GB como la RTX 3080 o RTX 4060.
- Opciones de despliegue: la librería `libreyolo` proporciona la envoltura `LibreVLM`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que se trata de un espejo de Moondream 3 Preview, podría compararse con otros VLM de tamaño similar (p. ej., LLaVA, Qwen-VL, InternVL), pero no se han publicado datos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia restrictiva: la BSL 1.1 con Additional Use Grant permite el uso en producción, pero prohíbe ofrecer el modelo como servicio pagado a terceros que compita con las versiones comerciales de M87 Labs. Esta restricción vincula al descargador, no solo a LibreYOLO.
- Estado de preview: el modelo se denomina "Preview", lo que implica que puede contener errores o comportamientos inestables no aptos para entornos críticos sin validación adicional.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero como todo VLM, puede generar descripciones inexactas o inventar detalles en imágenes ambiguas.
- Idiomas: no se especifican los idiomas soportados; el ejemplo de uso está en inglés, por lo que el rendimiento en otros idiomas es incierto.
- Sin cuantizaciones oficiales: no se ofrecen versiones cuantizadas (GGUF, AWQ, etc.), lo que limita el despliegue en hardware con menos VRAM.
- Dependencia de la librería `libreyolo`: el uso requiere la instalación de esa librería, que aunque su código es MIT, añade una dependencia externa al ecosistema.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibreYOLO/LibreMoondream3
- Modelo base: https://huggingface.co/moondream/moondream3-preview
- Licencia del modelo base: https://huggingface.co/moondream/moondream3-preview/blob/main/LICENSE.md
