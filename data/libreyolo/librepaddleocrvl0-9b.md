# LibreYOLO/LibrePaddleOCRVL0.9b

## Resumen

LibrePaddleOCRVL0.9b es un espejo de pesos (mirror) del modelo PaddleOCR-VL-0.9B de Baidu, empaquetado por LibreYOLO para su tarea `ocr`. No se trata de un modelo nuevo ni de un fine-tuning: los archivos son byte a byte idénticos a los snapshots originales, y el autor declara explícitamente que no se ha modificado ningún parámetro aprendido. El repositorio reúne en un único snapshot el reconocedor PaddleOCR-VL-0.9B (en la raíz) y el detector de layout PP-DocLayoutV2 en formato safetensors (bajo `layout/`), de modo que un solo clon contiene el parser de documentos completo de dos etapas.

El modelo resuelve el problema del parseo de documentos: dado un escaneo o una imagen de página, detecta la estructura de layout (bloques de texto, tablas, fórmulas, figuras) y reconoce el contenido en formato Markdown. Es relevante para desarrolladores porque elimina la dependencia de los archivos de código remoto del repositorio original (LibreYOLO carga las clases nativas de transformers) y porque sustituye la carpeta en formato Paddle del detector por su release safetensors.

Con 958.588.736 parámetros totales (aproximadamente 0,9B) y un tamaño de repositorio de 2,1 GB, es un VLM ligero orientado a OCR, con licencia Apache 2.0 y pipeline `image-text-to-text`. La fecha de creación del repositorio es el 3 de noviembre de 2026 y, en el momento de la consulta, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM para OCR y parseo de documentos (reconocedor PaddleOCR-VL + detector de layout PP-DocLayoutV2) |
| Parametros totales | 958.588.736 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene dos componentes. El primero es el reconocedor PaddleOCR-VL-0.9B, un modelo de visión-lenguaje que procesa la imagen de un bloque documental y genera su contenido transcrito; según la model card upstream, su modelo de lenguaje se inicializa a partir de ERNIE-4.5-0.3B de Baidu (Apache 2.0). El segundo es PP-DocLayoutV2, un detector de layout que identifica los bloques de la página (texto, tablas, fórmulas, figuras) antes del reconocimiento. El pipeline es, por tanto, de dos etapas: detección de layout y reconocimiento por bloque, con salida agregada en Markdown.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, más allá de la inicialización del LM desde ERNIE-4.5-0.3B. Tampoco se detallan innovaciones técnicas del reconocedor en la información proporcionada. Cabe subrayar que este repositorio no aporta entrenamiento propio: es un espejo de pesos con empaquetado alternativo (clases nativas de transformers en lugar de código remoto, y safetensors para el detector en lugar del formato Paddle).

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parseo de documentos con salida en Markdown (`result.ocr.markdown`).
- Detección de layout de página mediante PP-DocLayoutV2 (bloques de texto, tablas, fórmulas y figuras).
- Reconocimiento de tablas.
- Reconocimiento de fórmulas.
- Procesamiento image-text-to-text dentro del pipeline `image-text-to-text`.
- Integración con la librería LibreYOLO mediante la clase `LibreVLM` y la tarea `ocr`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: no disponible (los idiomas no se especifican en la información).

## Casos de uso

- Digitalización de archivos administrativos: el pipeline de dos etapas detecta primero los bloques de cada página escaneada y luego reconoce el texto de cada uno, generando Markdown listo para indexar en un sistema de gestión documental.
- Extracción de tablas de informes financieros: PP-DocLayoutV2 aísla las regiones de tabla y el reconocedor las transcribe, lo que permite convertir estados de cuentas en PDF a tablas Markdown procesables.
- Conversión de artículos científicos a Markdown: la detección de bloques separa texto, figuras y fórmulas, y el reconocedor transcribe cada fórmula, facilitando la migración de papers a repositorios de documentación.
- Ingesta de documentos para RAG: al producir Markdown estructurado, el modelo alimenta pipelines de recuperación aumentada sin necesidad de heurísticas de segmentación propias.
- Automatización de facturación y albaranes: el modelo reconoce el contenido de documentos comerciales escaneados y lo entrega en un formato que puede mapearse a campos de un ERP.
- Procesamiento por lotes en servidores sin GPU de gama alta: con menos de mil millones de parámetros y pesos safetensors, el modelo puede desplegarse en infraestructura modesta para digitalizar volúmenes grandes de páginas.
- Preprocesado en pipelines de visión por computador: al integrarse en LibreYOLO junto a otras tareas, permite encadenar detección de objetos y OCR sobre la misma imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 958.588.736 parámetros en safetensors, los pesos en precisión de 16 bits ocupan aproximadamente 1,9 GB; en fp32, unos 3,8 GB. A ello hay que sumar el detector de layout y las activaciones, por lo que se recomienda un margen adicional.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo con suficiente memoria; no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No se confirma en la información, aunque el tamaño de parámetros es compatible con GPUs de consumo de gama media-alta con memoria suficiente.
- Opciones de despliegue: librería LibreYOLO (`pip install 'libreyolo[vlm]'`) con transformers >= 5.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LibrePaddleOCRVL0.9b | 958.588.736 | no disponible | Apache 2.0 | Hugging Face (mirror) |
| PaddlePaddle/PaddleOCR-VL | no disponible en la informacion | no disponible | Apache 2.0 (según upstream) | Hugging Face |
| PaddlePaddle/PP-DocLayoutV2_safetensors | no disponible en la informacion | no disponible | Apache 2.0 (según upstream) | Hugging Face |

No se dispone de datos de rendimiento comparativo ni de otros modelos OCR-VLM de referencia en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por LibreYOLO: es un espejo de pesos sin modificaciones, por lo que hereda todas las limitaciones del PaddleOCR-VL original.
- Los idiomas soportados no se especifican; no puede asumirse cobertura multilingüe sin verificarla en la model card upstream.
- La longitud de contexto no está documentada, lo que dificulta planificar el procesamiento de páginas densas o documentos de varias páginas en una sola pasada.
- Riesgo de alucinación inherente a los modelos de visión-lenguaje en la transcripción de contenido ambiguo o de baja calidad; no se documentan tasas de error.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de copyright de PaddlePaddle Authors y el contenido de `NOTICE`; el modelo de lenguaje se inicializa desde ERNIE-4.5-0.3B, también Apache 2.0.
- El repositorio omite los archivos de código remoto del upstream y la carpeta en formato Paddle del detector; los flujos que dependan de esos artefactos no funcionarán con este snapshot.
- Requiere transformers >= 5.3 y la librería LibreYOLO con el extra `vlm`; no se garantiza compatibilidad con otras librerías de inferencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibreYOLO/LibrePaddleOCRVL0.9b
- Modelo base (reconocedor): https://huggingface.co/PaddlePaddle/PaddleOCR-VL
- Detector de layout: https://huggingface.co/PaddlePaddle/PP-DocLayoutV2_safetensors
- Commit del reconocedor upstream: `7fa00a8c55b735ba51ba49a9058f3f9c57a99a11`
- Commit del detector upstream: `880e8971b88938518611c54fc0f59ad57849c9d4`
