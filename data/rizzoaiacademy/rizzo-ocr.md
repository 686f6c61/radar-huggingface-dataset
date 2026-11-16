# rizzoaiacademy/rizzo-ocr

## Resumen

rizzo-ocr es un repositorio de modelos ONNX publicado por rizzoaiacademy que empaqueta componentes de OCR y análisis de maquetación de documentos para su ejecución local en CPU mediante ONNX Runtime, sin dependencias de PaddlePaddle ni PyTorch. El repositorio surge para cubrir un hueco concreto: PaddlePaddle no publica en formato ONNX determinados modelos auxiliares de su pipeline de OCR, por lo que este proyecto convierte y redistribuye esos pesos para que puedan integrarse en aplicaciones que solo disponen de ONNX Runtime.

El contenido principal es PP-DocLayout-M, un detector de maquetación basado en PicoDet-L con 23 clases de layout, convertido con paddle2onnx 2.1.0 a partir de los pesos oficiales de inferencia sin fine-tuning ni modificación de pesos. El repositorio forma parte del proyecto Rizzo PII, orientado a la detección local de información personal identificable en documentos escaneados y fotografías. El resto del pipeline (detección y reconocimiento PP-OCRv6, SLANet_plus y PP-DocLayout_plus-L) se descarga desde los repositorios oficiales de PaddlePaddle.

Se trata, por tanto, de un componente de infraestructura más que de un modelo de lenguaje: no genera texto libre, sino que localiza regiones (texto, tablas, figuras, encabezados, etc.) en imágenes de documentos para alimentar etapas posteriores de OCR. Su interés radica en la portabilidad (ONNX puro, ejecución en CPU) y en la licencia Apache-2.0 heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PicoDet-L (detector de objetos de una etapa) para detección de maquetación documental |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye el grafo ONNX de inferencia; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la detección de layout es independiente del idioma del texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`inference.onnx` junto con `inference.yml`) |

## Arquitectura y entrenamiento

El modelo incluido en el repositorio es PP-DocLayout-M, un detector de maquetación basado en PicoDet-L que identifica 23 clases de layout en imágenes de documentos. La conversión a ONNX se realizó con paddle2onnx 2.1.0 a partir de los pesos oficiales de inferencia de PaddlePaddle, sin fine-tuning y sin alterar los pesos, por lo que el comportamiento es equivalente al del modelo original. Cada carpeta del repositorio contiene `inference.onnx` (grafo y pesos) e `inference.yml` (configuración original de PaddleX con la lista de etiquetas y el preprocesamiento).

La entrada del grafo es una imagen RGB redimensionada al tamaño objetivo definido en `inference.yml`, junto con tensores `im_shape` [1,2] y `scale_factor` [1,2]; la salida es una matriz [N, 6] con clase, puntuación y coordenadas de caja (x1, y1, x2, y2). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas de ajuste adicionales, más allá de que el modelo procede del entrenamiento original del equipo de PaddlePaddle.

## Capacidades

- Detección de maquetación documental: localiza regiones en imágenes de documentos y devuelve clase, puntuación y caja delimitadora para cada una.
- Clasificación en 23 clases de layout (texto, títulos, tablas, figuras, encabezados, pies de página, etc., según la configuración de PP-DocLayout-M).
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU ni de frameworks de deep learning pesados.
- Integración en pipelines de OCR: actúa como etapa previa que segmenta el documento antes de la detección y el reconocimiento de texto (PP-OCRv6) y del reconocimiento de tablas (SLANet_plus).
- Procesamiento de documentos escaneados y fotografías, no limitado a PDFs digitales.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales de lenguaje; es un componente puramente visual de detección.

## Casos de uso

- Detección de PII en documentos escaneados: el modelo segmenta el documento en regiones y permite dirigir el OCR y la extracción de entidades solo a las zonas de texto, reduciendo falsos positivos en logotipos o figuras. Es el caso de uso original dentro de Rizzo PII.
- Digitalización de archivos administrativos: en un pipeline con PP-OCRv6, la detección de layout permite reconstruir el orden de lectura y separar encabezados, cuerpo, tablas y pies de página antes de exportar a texto estructurado.
- Extracción de tablas en facturas y albaranes: la detección de regiones de tabla alimenta a SLANet_plus para el reconocimiento estructurado de celdas, útil en contabilidad y gestión documental.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse con ONNX Runtime en CPU, encaja en entornos con restricciones de hardware o donde no se permite instalar PaddlePaddle o PyTorch.
- Preprocesado para sistemas de gestión documental (DMS): la segmentación por clases permite clasificar páginas y enrutar cada región a distintos motores de OCR o de extracción según su tipo.
- Aplicaciones de escritorio o edge: el tamaño reducido del modelo (23 MB) y la ausencia de dependencias pesadas facilitan su inclusión en herramientas locales de escaneo y archivo.
- Anonimización previa a la publicación de documentos: la detección de regiones permite localizar y enmascarar zonas con datos personales antes de compartir escaneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecución en CPU con ONNX Runtime (`CPUExecutionProvider`).
- Tamaño en disco: 23 MB para el modelo PP-DocLayout-M en formato ONNX.
- GPU recomendadas: no disponibles; no se documenta soporte de ejecución en GPU, aunque ONNX Runtime podría usar otros proveedores de ejecución no especificados por el autor.
- Compatibilidad con GPU de consumo: no disponible; el caso de uso declarado es CPU.
- Opciones de despliegue: ONNX Runtime (Python, con `onnxruntime` e `huggingface_hub` para la descarga); el repositorio incluye un script de descarga (`scripts/fetch_ocr_models.py`) para el proyecto Rizzo PII.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases de layout | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rizzo-ocr (PP-DocLayout-M) | PicoDet-L convertido a ONNX | 23 | ONNX | Apache-2.0 | Hugging Face (rizzoaiacademy/rizzo-ocr) |
| PaddlePaddle/PP-DocLayout-M | PicoDet-L original | 23 | Pesos PaddlePaddle | Apache-2.0 | Hugging Face (PaddlePaddle) |
| PP-DocLayout_plus-L | Detector de layout de mayor tamaño | no disponible | Pesos PaddlePaddle y ONNX oficial | Apache-2.0 | Hugging Face (PaddlePaddle) |
| PP-DocLayout-S | Detector de layout de menor tamaño | no disponible | Pesos PaddlePaddle | Apache-2.0 | Hugging Face (PaddlePaddle) |

La diferencia principal frente a los modelos oficiales de PaddlePaddle es el formato: rizzo-ocr ofrece el grafo ONNX listo para ONNX Runtime, mientras que los originales requieren PaddlePaddle o sus exportaciones ONNX oficiales. Los pesos son idénticos a los del modelo base, por lo que no cabe esperar diferencias de precisión.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no soporta tool calling ni razonamiento; su función es exclusivamente la detección de regiones en imágenes.
- El repositorio no documenta métricas de precisión, recall ni mAP, ni resultados de validación tras la conversión a ONNX.
- No se especifican los idiomas ni la cobertura geográfica de los documentos de entrenamiento; el rendimiento puede variar según el tipo de documento y la tipografía.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que la publicación es reciente o que los artefactos podrían no estar completamente subidos; conviene verificar la integridad de los archivos antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribución al equipo de PaddlePaddle como autores originales del modelo y del entrenamiento.
- Al ser un componente de un pipeline mayor, requiere modelos adicionales (PP-OCRv6, SLANet_plus, PP-DocLayout_plus-L) descargados por separado desde los repositorios oficiales de PaddlePaddle.
- Riesgo de errores en documentos con maquetaciones atípicas, imágenes de baja calidad o rotaciones; no se documentan mecanismos de corrección posteriores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rizzoaiacademy/rizzo-ocr
- Modelo base: https://huggingface.co/PaddlePaddle/PP-DocLayout-M
- Proyecto Rizzo PII: https://github.com/Rizzo-AI-Academy/rizzo-pii
- Script de descarga de modelos: https://github.com/Rizzo-AI-Academy/rizzo-pii/blob/main/scripts/fetch_ocr_models.py
- PaddleOCR (repositorio oficial): https://github.com/PaddlePaddle/PaddleOCR
