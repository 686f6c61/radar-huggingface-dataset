# angelhd25/ull-ai-image-detector

## Resumen

ull es un detector de imágenes generadas por inteligencia artificial desarrollado por angelhd25, distribuido como modelo ONNX para ejecución local en navegador. Se trata de un fine-tune (v11) del modelo Community Forensics ViT-Small/16@384, exportado a ONNX fp32. Su propósito es clasificar imágenes como reales o generadas por IA, con una regla de decisión basada en un umbral de probabilidad. La relevancia actual radica en la proliferación de imágenes sintéticas y la necesidad de herramientas de verificación que preserven la privacidad, ya que todo el procesamiento ocurre en el dispositivo, sin enviar datos a servidores. El modelo está pensado para integrarse en una extensión de Chrome (Manifest V3) que utiliza WebGPU o WebAssembly para la inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Small/patch16, 384px, single logit |
| Parametros totales | no disponible (ViT-Small, sin cifra publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp32 (ONNX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo se basa en un transformer visual (ViT-Small) con parches de 16x16 píxeles y resolución de entrada de 384x384. Es un fine-tune de la versión 11 del modelo Community Forensics, que a su vez fue entrenado con miles de generadores para detectar imágenes falsas. El fine-tune se exportó a ONNX en precisión fp32 para su uso en navegador. El preprocesamiento es específico: redimensionar el lado más corto a 440 píxeles con interpolación bicubic, recorte central a 384x384 y normalización con media y desviación estándar de CLIP. La extensión reimplementa el resize bicubic en JavaScript para garantizar consistencia. El entrenamiento incluyó datos de OpenFake (split de validación), lo que plantea una cuestión de licencia no resuelta.

## Capacidades

- Detección de imágenes generadas por IA (clasificación binaria).
- Inferencia local en navegador mediante WebGPU o WebAssembly.
- Sin conexión a servidores, preservando la privacidad.
- Salida probabilística (P(AI)) con umbral configurable (por defecto 0.65).
- Integración con extensión de Chrome Manifest V3.
- Preprocesamiento específico para consistencia entre plataformas.

## Casos de uso

- Moderación de contenido en plataformas web: la extensión puede analizar imágenes en tiempo real mientras el usuario navega, marcando posibles imágenes generadas por IA.
- Verificación de imágenes en periodismo: los redactores pueden comprobar si una imagen recibida es sintética antes de publicarla, sin enviarla a servicios externos.
- Auditoría de redes sociales: detectar cuentas que difunden imágenes generadas por IA de forma masiva.
- Protección de la propiedad intelectual: artistas pueden verificar si sus obras han sido replicadas por generadores.
- Educación y concienciación: herramienta didáctica para enseñar a identificar contenido sintético.
- Investigación forense digital: análisis de imágenes en casos legales, con la ventaja de que el procesamiento local evita filtraciones de pruebas.
- Integración en pipelines de automatización: mediante onnxruntime, se puede usar en scripts de Python para clasificar lotes de imágenes.

## Benchmarks y rendimiento

Resultados medidos con la regla de decisión fija `P(AI) >= 0.65`. Balanced accuracy es `0.5 × (AI recall + real recall)`.

| set | n | balanced acc | AI recall | real recall |
|---|---|---|---|---|
| frozen proxy (DiffusionDB + COCO) | 1,200 | 0.9910 | 1.0000 | 0.9820 |
| OpenFake test (temporal holdout de generadores nuevos) | 800 | 0.8847 | 0.8202 | 0.9492 |

Además, se midió el rendimiento a través de la extensión en Chrome headless: 1200/1200 imágenes a 0.16 s/imagen en WebGPU, reproduciendo exactamente la cifra de PyTorch.

En un holdout diverso de web (768 imágenes de Wikimedia Commons), el recall de imágenes reales cae a 0.816 (0.863 excluyendo una serie fractal sobre-representada). Desglose por tipo de contenido: COCO val2017 0.982, arte digital humano 0.696, CGI/3D renders 0.725, renders fractales algorítmicos 0.204. La balanced accuracy en contenido web realista se estima en torno a 0.84.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación; el modelo es un ViT-Small de 88 MB, por lo que es compatible con GPUs de gama baja y con CPU.
- Funciona en navegador con WebGPU (GPU integrada o dedicada) o WebAssembly (CPU).
- En WebGPU, la inferencia tarda 0.16 s por imagen (medido en Chrome headless).
- Para uso local con onnxruntime, puede ejecutarse en CPU o GPU.
- Opciones de despliegue: extensión de Chrome, onnxruntime (Python, Node.js), otros runtimes ONNX.

## Comparativa con modelos similares

No se proporcionan datos comparativos con otros modelos en la información disponible. El modelo es un fine-tune del Community Forensics ViT-Small/16@384, que sirve como referencia base, pero no se incluyen métricas de ese modelo en la documentación.

## Limitaciones y advertencias

- La precisión cae en contenido no fotográfico: arte digital (real recall 0.696), CGI/3D renders (0.725) y renders fractales (0.204). El modelo está optimizado para fotografía, capturas y escaneos.
- El entrenamiento usó el split de validación de OpenFake, que es CC BY-NC 4.0. Aunque la base y el export son MIT, la posible contaminación del dataset sobre los pesos es un asunto legal no resuelto.
- No se publica versión fp16 porque en Chrome cae a WebAssembly (Dawn no expone `shader-f16`) y corre más lento que fp32 en WebGPU.
- El preprocesamiento debe coincidir exactamente con el especificado; cualquier variación en el resize o la normalización puede afectar al resultado.
- No se especifican idiomas, pero al ser un modelo de visión, la capacidad lingüística no aplica.

## Enlaces

- HuggingFace: https://huggingface.co/angelhd25/ull-ai-image-detector
- Repositorio de la extensión: https://github.com/angelhd1999/ullExtension
- Paper del modelo base: https://arxiv.org/abs/2411.04125
- Modelo base en HuggingFace: https://huggingface.co/OwensLab/commfor-model-384
