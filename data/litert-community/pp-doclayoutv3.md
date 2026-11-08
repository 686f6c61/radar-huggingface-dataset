# litert-community/PP-DocLayoutV3

## Resumen

PP-DocLayoutV3 es un modelo de análisis de maquetación de documentos (document layout analysis) desarrollado por el equipo de PaddleOCR. Resuelve la detección y clasificación de regiones en una página (texto, títulos, tablas, figuras, etc.), la segmentación de esas regiones y la predicción del orden de lectura, todo integrado en un único marco end-to-end. Está diseñado para funcionar sobre documentos con distorsiones físicas complejas, como inclinación, curvatura o iluminación adversa, casos en los que los enfoques tradicionales en dos etapas fallan con frecuencia.

La ficha que nos ocupa no documenta el checkpoint original, sino una conversión a LiteRT/TFLite en FP32 realizada por la comunidad litert-community a partir de los pesos oficiales en safetensors de PaddlePaddle. El fichero resultante ocupa 133,97 MB y expone una interfaz de formas fijas con entrada `[1, 3, 800, 800]` y cuatro salidas tensoriales (logits de clase, cajas, logits de orden de lectura y logits de máscara). El preprocesado y el postprocesado se ejecutan en el host.

Su relevancia actual radica en que permite desplegar un analizador de maquetación de última generación en entornos sin GPU y con runtimes ligeros (LiteRT), manteniendo la licencia Apache 2.0 del modelo original. Es un componente de un pipeline OCR más amplio: la propia model card indica que el reconocimiento de texto es un paso separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección end-to-end con queries (estilo DETR/RT-DETR), con cabezas de clasificación, cajas, máscaras y orden de lectura; derivado de PP-DocLayoutV3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 800 × 800 píxeles |
| Tipos de cuantizacion | FP32 (única variante publicada en este repo) |
| Idiomas soportados | no disponible (el modelo opera sobre geometría de página, no sobre texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT/TFLite (`PP-DocLayoutV3-fp32.tflite`, 133,97 MB); checkpoint original en safetensors |

## Arquitectura y entrenamiento

PP-DocLayoutV3 evoluciona a partir de arquitecturas previas de la familia y se plantea como un modelo unificado que integra segmentación de instancias y predicción del orden de lectura en un solo marco end-to-end, según la documentación de Transformers. La conversión a LiteRT conserva la topología del modelo original: la entrada es una página RGB normalizada en formato NCHW de 800 × 800, y la red emite 300 queries, cada una con 25 logits de clase de maquetación, 4 coordenadas de caja normalizadas en formato `(cx, cy, w, h)`, una fila de 300 logits de orden de lectura por pares y una máscara de 200 × 200.

El preprocesado reproduce el del procesador de imágenes original: conversión a RGB, redimensionado bicúbico a 800 × 800, reescalado por 1/255 y normalización con media `[0, 0, 0]` y desviación `[1, 1, 1]`. El postprocesado (filtrado por umbral, generación de polígonos, reescalado a las dimensiones de la página original y recuperación del orden de lectura) también se ejecuta en el host mediante el postprocesador upstream. No se dispone en la información proporcionada de datos sobre volumen de entrenamiento, composición del dataset, ni uso de RLHF o DPO; el artículo asociado es «RT-DocLayout: Real-Time End-to-End Document Layout Analysis with Reading Order in the Wild» (arXiv:2606.23344).

## Capacidades

- Detección de regiones de maquetación con 25 categorías predefinidas (los nombres están en `labels.json`).
- Predicción de cajas delimitadoras normalizadas en formato centro-ancho-alto.
- Segmentación por instancia: máscaras de 200 × 200 por query, convertibles a polígonos en coordenadas de página.
- Predicción del orden de lectura mediante logits por pares entre las 300 queries.
- Robustez ante distorsiones físicas de la página (inclinación, curvatura, iluminación adversa), según la descripción del modelo original.
- Ejecución en CPU mediante el intérprete de LiteRT, sin dependencia de GPU.
- Interfaz de firma única `main` con tensores de formas fijas, adecuada para despliegue embebido.
- No realiza reconocimiento de texto: es un paso previo dentro de un pipeline OCR (PaddleOCR).

## Casos de uso

- Digitalización de archivos históricos y documentos escaneados con curvatura: el modelo está diseñado específicamente para páginas con distorsión física, por lo que puede segmentar regiones y recuperar el orden de lectura antes de pasarlas a un motor OCR.
- Preprocesado de pipelines OCR en producción: al ejecutarse en LiteRT sobre CPU, se puede insertar como etapa de segmentación previa a un reconocedor de texto, separando título, cuerpo, tablas y figuras para aplicar estrategias de OCR distintas a cada región.
- Extracción de estructura en facturas y albaranes: la detección de 25 categorías permite aislar tablas y campos clave antes de un paso de extracción de datos estructurados.
- Procesamiento en dispositivos sin GPU o en el borde: el tamaño de 133,97 MB en FP32 y el runtime LiteRT permiten desplegarlo en portátiles, mini-PC o entornos de contenedor sin acelerador.
- Reconstrucción del orden de lectura para accesibilidad: los logits de orden por pares permiten generar una secuencia de lectura que alimente lectores de pantalla o conversores a audio sobre documentos maquetados en varias columnas.
- Análisis de documentos científicos y técnicos: la segmentación de figuras, tablas y bloques de texto facilita la conversión de PDF a formatos estructurados (Markdown, HTML) conservando la jerarquía visual.
- Indexación y búsqueda documental: la salida de regiones con clase y orden permite trocear páginas en fragmentos coherentes antes de generar embeddings para un sistema RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en la variante LiteRT; la inferencia está pensada para CPU. El fichero de pesos ocupa 133,97 MB en FP32.
- GPU recomendadas: no disponibles; el ejemplo oficial usa el intérprete de LiteRT con `num_threads=4` sobre CPU.
- GPU de consumo: no se documenta soporte GPU para esta exportación; el despliegue de referencia es en CPU.
- Opciones de despliegue: `ai-edge-litert` (intérprete LiteRT/TFLite) con `Interpreter` y `get_signature_runner("main")`; el preprocesado y postprocesado requieren `transformers==5.21.0`, `torch`, `torchvision`, `numpy`, `pillow` y `opencv-python-headless`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Memoria de entrada: tensor `[1, 3, 800, 800]` en float32, aproximadamente 7,3 MB por inferencia; las salidas incluyen una máscara de `[1, 300, 200, 200]`, aproximadamente 48 MB en float32.

## Comparativa con modelos similares

| Modelo | Tipo | Categorías | Contexto de entrada | Orden de lectura | Licencia | Formato |
|---|---|---|---|---|---|---|
| PP-DocLayoutV3 (LiteRT, esta ficha) | Detección + segmentación + orden, end-to-end | 25 | 800 × 800 fijo | Sí, logits por pares | Apache 2.0 | TFLite FP32 |
| PP-DocLayoutV3 (checkpoint PaddlePaddle original) | Igual que el anterior | 25 | Procesador upstream | Sí | Apache 2.0 | Safetensors |
| PP-DocLayoutV2 | Análisis de maquetación de la generación previa | no disponible | no disponible | no disponible | Apache 2.0 (según familia PaddleOCR) | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo entre estas variantes ni con alternativas de otros proveedores.

## Limitaciones y advertencias

- No realiza reconocimiento de texto: requiere un motor OCR separado para obtener contenido textual.
- Entrada de forma fija a 800 × 800: páginas de relación de aspecto muy extrema pueden perder detalle tras el redimensionado bicúbico.
- Solo se publica la variante FP32; no hay versiones cuantizadas (INT8, FP16) en este repositorio, lo que limita la reducción de tamaño y el ahorro de cómputo.
- El preprocesado y el postprocesado dependen del procesador upstream de PaddlePaddle fijado a una revisión concreta; cambios de versión en `transformers` pueden romper la compatibilidad del ejemplo.
- Las salidas son logits en crudo; sin el postprocesador upstream no se obtienen polígonos ni orden de lectura utilizables.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un modelo geométrico, el riesgo principal es la clasificación errónea de regiones o la omisión de bloques en maquetaciones atípicas.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución del proyecto PaddleOCR y del artículo asociado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción de esta conversión concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/PP-DocLayoutV3
- Checkpoint original: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors
- Revisión fijada del checkpoint: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors/tree/e4f489dc536556fc1be02b973ba06756e0d4a2ac
- Documentación en Transformers: https://huggingface.co/docs/transformers/v5.1.0/en/model_doc/pp_doclayout_v3
- Documentación en Transformers (v5.13.1): https://huggingface.co/docs/transformers/v5.13.1/en/model_doc/pp_doclayout_v3.md
- Proyecto PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Artículo RT-DocLayout: https://arxiv.org/abs/2606.23344
