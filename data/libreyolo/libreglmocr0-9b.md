# LibreYOLO/LibreGLMOCR0.9b

## Resumen

LibreGLMOCR0.9b es un espejo (mirror) de pesos publicado por LibreYOLO que empaqueta en un único snapshot el pipeline completo de análisis de documentos en dos etapas: el reconocedor GLM-OCR de Z.ai en la raíz del repositorio y el detector de layout PP-DocLayoutV3 de PaddlePaddle bajo el directorio `layout/`. No se trata de un modelo nuevo ni de un fine-tune: los archivos son byte-idénticos a los snapshots originales y no se ha modificado ningún parámetro aprendido. Su función es ofrecer una dependencia autocontenida para la tarea `ocr` de la librería LibreYOLO.

El componente principal es el reconocedor GLM-OCR, un modelo de visión-lenguaje (VLM) de tipo image-text-to-text con 1.325.258.240 parámetros (aproximadamente 1,3 mil millones), pesos en formato safetensors y un tamaño de repositorio de 2,8 GB. El detector de layout PP-DocLayoutV3 se encarga de la segmentación estructural de la página (bloques de texto, tablas, fórmulas, figuras) antes de pasar cada región al reconocedor.

La relevancia práctica de este snapshot es de ingeniería de despliegue: simplifica la reproducibilidad y el versionado de un parser documental de dos etapas bajo una única referencia, con licencias permisivas (MIT para GLM-OCR, Apache 2.0 para PP-DocLayoutV3) y trazabilidad explícita de los commits upstream utilizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM image-text-to-text (GLM-OCR) + detector de layout PP-DocLayoutV3 en dos etapas |
| Parámetros totales | 1.325.258.240 (componente GLM-OCR; el detector de layout se distribuye aparte en `layout/`) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (GLM-OCR) y Apache 2.0 (PP-DocLayoutV3); declarada como `mit-and-apache-2.0` |
| Formato de pesos | safetensors |
| Librería | libreyolo (requiere `transformers >= 5.3`) |
| Modelo base | zai-org/GLM-OCR (commit `2e85a62840ccac27daa451df36c736c4636b8628`) |
| Detector de layout | PaddlePaddle/PP-DocLayoutV3_safetensors (commit `e4f489dc536556fc1be02b973ba06756e0d4a2ac`) |
| Tamaño del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

El snapshot combina dos modelos independientes que no comparten entrenamiento entre sí. El primero es GLM-OCR, un modelo de visión-lenguaje que recibe una imagen (o un recorte de región) y genera texto en formato Markdown, incluyendo tablas, fórmulas y estructura de documento. El segundo es PP-DocLayoutV3, un detector de layout basado en PaddlePaddle que identifica y delimita las regiones de la página antes del reconocimiento.

No se ha publicado en la información disponible ningún detalle sobre la arquitectura interna de GLM-OCR (tipo de transformer, mecanismo de atención, tokenizador visual), el volumen o composición de los datos de entrenamiento, ni si se aplicaron etapas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Lo único verificable es que LibreYOLO no ha realizado ningún cambio en los pesos: los archivos son idénticos a los upstream y no se han incluido los registros de evaluación originales ni las model cards de origen.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de páginas y documentos.
- Conversión de documentos a Markdown estructurado (`result.ocr.markdown`).
- Detección de layout de página mediante PP-DocLayoutV3 (bloques de texto, tablas, fórmulas, figuras).
- Parseo de tablas y de fórmulas matemáticas, según los tags del repositorio (`table`, `formula`).
- Procesamiento de imagen a texto en modalidad conversacional (`image-text-to-text`, `conversational`).
- Integración con la tarea `ocr` de la librería LibreYOLO mediante la clase `LibreVLM`.
- Soporte de tool calling, agentes, modo thinking, audio o capacidades multilingües explícitas: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos escaneados: el pipeline en dos etapas detecta primero las regiones de la página con PP-DocLayoutV3 y luego aplica GLM-OCR a cada bloque, lo que permite reconstruir el orden de lectura y la estructura del documento en lugar de devolver texto plano desordenado.
- Extracción de tablas de facturas e informes: el detector identifica la región tabular y el reconocedor la serializa en Markdown, un formato directamente consumible por pipelines de datos o bases de datos documentales.
- Conversión de literatura científica a Markdown: el soporte de fórmulas permite preservar notación matemática al transformar PDFs o imágenes de artículos en texto estructurado para alimentar índices de búsqueda o sistemas RAG.
- Ingesta documental para RAG: el Markdown estructurado resultante conserva encabezados y tablas, lo que mejora la fragmentación (chunking) y la recuperación frente a una extracción de texto plano.
- Archivística y gestión documental: procesamiento por lotes de fondos escaneados con licencias permisivas (MIT y Apache 2.0), lo que facilita su integración en productos comerciales sin obligaciones de copyleft sobre el modelo.
- Automatización de back-office: extracción de campos estructurados de formularios, albaranes y contratos escaneados dentro de flujos internos, usando el snapshot único como dependencia versionada y reproducible.
- Reproducibilidad de pipelines: al fijar commits concretos de ambos componentes upstream, el snapshot sirve como referencia estable para pruebas de regresión en sistemas de OCR en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este snapshot indica explícitamente que no se han incluido los registros de evaluación del repositorio upstream.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa de orden de magnitud, un modelo de 1,3 mil millones de parámetros en FP16 requiere aproximadamente 2,6 GB solo para los pesos, a lo que hay que sumar la caché KV y el detector de layout; en cuantización de 8 bits o 4 bits el requisito de pesos baja aproximadamente a 1,3 GB y 0,7 GB respectivamente. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponible. No se documentan requisitos mínimos ni GPU validadas.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño de parámetros, el modelo debería caber en GPUs de consumo con suficiente VRAM, pero no hay validación publicada.
- Opciones de despliegue: la vía documentada es la librería LibreYOLO (`pip install 'libreyolo[vlm]'` con `transformers >= 5.3`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de OCR o VLM documentales, por lo que no es posible establecer una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- El repositorio no contiene un modelo nuevo: es un espejo de pesos. Cualquier limitación del GLM-OCR original se hereda sin cambios.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento en idiomas distintos del no especificado; la ficha de idiomas figura como no disponible.
- La longitud de contexto no está publicada, lo que impide planificar el tamaño máximo de página o región procesable por llamada.
- La licencia se declara como `other` con nombre `mit-and-apache-2.0`: es necesario revisar los archivos `LICENSE` y `NOTICE` del repositorio para confirmar las obligaciones exactas de cada componente antes de un uso comercial.
- El detector de layout se distribuye bajo Apache 2.0 y el reconocedor bajo MIT según la model card; la verificación de atribuciones debe hacerse contra los textos de licencia incluidos.
- El snapshot no incluye las model cards originales ni los registros de evaluación upstream, lo que reduce la trazabilidad documental y obliga a consultar los repositorios de origen para cualquier dato de rendimiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del empaquetado.
- La dependencia de `transformers >= 5.3` y de la librería `libreyolo` limita la portabilidad a otros stacks de inferencia no documentados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LibreYOLO/LibreGLMOCR0.9b
- Modelo base GLM-OCR: https://huggingface.co/zai-org/GLM-OCR
- Detector de layout PP-DocLayoutV3: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors
- Commit upstream de GLM-OCR: `2e85a62840ccac27daa451df36c736c4636b8628`
- Commit upstream de PP-DocLayoutV3: `e4f489dc536556fc1be02b973ba06756e0d4a2ac`
