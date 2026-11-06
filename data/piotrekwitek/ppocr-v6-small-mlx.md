# piotrekwitek/ppocr-v6-small-mlx

## Resumen

PP-OCRv6 small MLX es una conversión de pesos del pipeline OCR PP-OCRv6 de PaddleOCR al formato nativo de MLX, el framework de Apple para ejecutar modelos de aprendizaje automático sobre silicio Apple (arm64). No se trata de un modelo nuevo entrenado desde cero, sino de una instantánea de pesos derivada de los checkpoints ONNX oficiales de PP-OCRv6 small, publicada por el usuario piotrekwitek como recurso interno del proyecto `pii-redactor`, una herramienta de redacción de información personal identificable para macOS.

El paquete incluye tres componentes diferenciados: un detector de texto basado en DB (Differentiable Binarization), un reconocedor multilingüe con arquitectura SVTR y un clasificador de orientación de línea de texto PP-LCNet_x0_25. Cada uno se ha convertido de forma offline a safetensors y se ha verificado numéricamente contra onnxruntime, con diferencias máximas de probabilidad inferiores a 5e-4 y coincidencia exacta en el argmax en los casos documentados.

Su relevancia es acotada pero clara: permite ejecutar OCR de calidad producción en Macs sin depender de ONNX Runtime ni de dependencias de Paddle, lo que simplifica el despliegue en aplicaciones nativas macOS. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que la métrica no se ha actualizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de tres etapas: detector DB (Differentiable Binarization), reconocedor SVTR y clasificador de orientación PP-LCNet_x0_25 |
| Parámetros totales | No disponible (el autor no publica el recuento; se trata de variantes "small" de PP-OCRv6 y PP-LCNet_x0_25) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, no de lenguaje; la entrada es una imagen) |
| Tipos de cuantización | No disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | Reconocimiento multilingüe según el vocabulario `ppocr_keys_v1.txt` con 18.708 entradas; el autor no enumera los idiomas concretos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo: es una conversión offline de pesos. El detector emplea la arquitectura DB, habitual en PP-OCR para segmentación de regiones de texto, y el reconocedor usa SVTR (Scene Text Recognition with a Single Visual Model), un transformer visual para reconocimiento de texto en escena. El clasificador de orientación PP-LCNet_x0_25 resuelve la ambigüedad de 0° frente a 180° en líneas de texto, una etapa previa habitual en pipelines OCR para evitar reconocimientos invertidos.

La conversión se realizó con verificación numérica explícita contra onnxruntime: en el detector se reporta argmax idéntico en la iteración 63/69; en el reconocedor, una diferencia máxima de probabilidad inferior a 5e-4 con argmax greedy idéntico sobre recortes de producto; y en el clasificador de orientación, una diferencia máxima de 2,09e-7 con acuerdo de argmax de 1.0. Los pesos de orientación se obtuvieron plegando BatchNorm y congelando el layout a partir de las constantes del grafo ONNX original (`PaddlePaddle/PP-LCNet_x0_25_textline_ori_onnx`, commit `aea1f18d...`, sha256 `94a6a0a0…f11f2ff3`). No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF o DPO, porque no hubo entrenamiento en esta publicación.

## Capacidades

- Detección de regiones de texto en imágenes mediante el detector DB.
- Reconocimiento de texto multilingüe con el reconocedor SVTR y el vocabulario de 18.708 entradas.
- Clasificación de orientación de línea de texto (0° frente a 180°) para corregir líneas invertidas antes del reconocimiento.
- Ejecución nativa sobre MLX en macOS arm64, sin ONNX Runtime ni Paddle en tiempo de inferencia.
- Lectura directa de vocabulario desde `ppocr_keys_v1.txt`, sin parsear metadatos del contenedor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; es un pipeline OCR especializado.

## Casos de uso

- Redacción de información personal identificable en macOS: el pipeline detecta y reconoce texto en documentos escaneados o capturas para que `pii-redactor` localice y enmascare datos sensibles, ejecutándose en local sobre Apple Silicon sin enviar imágenes a servicios externos.
- Digitalización de facturas y recibos en aplicaciones de escritorio: el detector DB localiza las líneas de importes y el reconocedor SVTR extrae el texto, con el clasificador de orientación corrigiendo escaneos girados 180°.
- Indexación de archivos PDF escaneados en un flujo de trabajo personal: el pipeline convierte páginas en texto para búsqueda local, aprovechando MLX para mantener la latencia baja en un MacBook.
- Preprocesado de formularios administrativos: detección y reconocimiento de campos manuscritos o impresos antes de validación humana, con la orientación normalizada para evitar errores en formularios introducidos al revés.
- Extracción de texto de capturas de pantalla para herramientas de accesibilidad: el reconocimiento multilingüe permite leer interfaces y documentos mostrados en pantalla sin conexión.
- Automatización de archivo documental en estudios pequeños: procesamiento por lotes de imágenes TIFF o JPEG en un Mac mini o Mac Studio, con el pipeline completo ejecutándose en el chip sin GPU dedicada.
- Verificación de pipelines OCR en investigación: al estar los pesos en safetensors con paridad numérica documentada frente a onnxruntime, sirve como referencia para comparar implementaciones MLX con las de ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta verificaciones de paridad numérica frente a onnxruntime (argmax idéntico y diferencias de probabilidad inferiores a 5e-4 en el reconocedor y de 2,09e-7 en el clasificador de orientación), no métricas de precisión OCR como exactitud por carácter o por palabra.

## Requisitos de hardware

- VRAM: no disponible; al ejecutarse sobre MLX en Apple Silicon, la memoria unificada del chip es la restricción relevante, no la VRAM dedicada.
- GPU recomendadas: cualquier chip Apple Silicon (serie M) con soporte MLX; el autor no especifica modelos concretos.
- Cabe en GPU consumer: sí, en equipos Apple Silicon; no se documenta soporte para GPU NVIDIA o AMD.
- Opciones de despliegue: MLX en macOS arm64; el autor indica explícitamente que es "macOS arm64 only". No se documenta vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| PP-OCRv6 small MLX (este) | DB + SVTR + PP-LCNet_x0_25 | safetensors (MLX) | Apache-2.0 | macOS arm64 | Conversión verificada numéricamente contra onnxruntime |
| PP-OCRv6 small ONNX (origen) | DB + SVTR + PP-LCNet_x0_25 | ONNX | Apache-2.0 | Multiplataforma con onnxruntime | Referencia de paridad del autor |
| PaddleOCR PP-OCRv6 (upstream) | DB + SVTR + PP-LCNet_x0_25 | Paddle | Apache-2.0 | Multiplataforma con Paddle | Pesos originales de los que deriva la conversión |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor restringe el uso a macOS arm64; no hay soporte documentado para otras plataformas.
- El repositorio figura con 0 descargas, 0 likes y tamaño de 0.0 GB, lo que puede indicar que los pesos no están efectivamente disponibles o que las métricas no se han actualizado; conviene verificar los archivos antes de integrarlo.
- No se documentan sesgos, tasas de alucinación ni evaluación de precisión OCR; la única validación es de paridad numérica frente a onnxruntime, no de calidad sobre datos reales.
- El reconocimiento multilingüe depende del vocabulario de 18.708 entradas; no se enumeran los idiomas cubiertos ni su cobertura por idioma.
- Es un recurso interno de un proyecto (`pii-redactor`), no un modelo publicado con documentación de uso general; la model card es escueta y no incluye guía de integración.
- Licencia Apache-2.0 permite uso comercial, pero los archivos derivados no son copias byte a byte del upstream y el autor remite a `PP-OCR-ATTRIBUTION.md` en el repositorio del producto para la atribución.
- No se incluyen datos de entrenamiento, documentos privados ni datos personales según el autor.

## Enlaces

- Hugging Face: https://huggingface.co/piotrekwitek/ppocr-v6-small-mlx
- PaddleOCR (upstream): https://github.com/PaddlePaddle/PaddleOCR
- PP-LCNet_x0_25_textline_ori_onnx (origen del clasificador de orientación): https://huggingface.co/PaddlePaddle/PP-LCNet_x0_25_textline_ori_onnx
- MLX (framework de Apple): https://github.com/ml-explore/mlx
