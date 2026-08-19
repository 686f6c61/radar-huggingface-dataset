# LibreYOLO/LibreLaMab-restore

## Resumen

LibreLaMab-restore es un modelo de inpainting guiado por máscara basado en LaMa (Large Mask inpainting), publicado por el usuario LibreYOLO dentro de su ecosistema de herramientas de visión por computador. El checkpoint integra el grafo ONNX fijo de OpenCV Zoo (revisión `aee6d22f0a13e5e35af1c9a1c3afd62841fc6f3f`) en un formato que puede cargarse directamente con la librería `libreyolo`. El modelo está diseñado para rellenar regiones de una imagen indicadas por una máscara binaria, preservando el resto de píxeles sin modificar.

La relevancia de este modelo radica en su simplicidad de uso: se distribuye como un único archivo `.pt` que contiene los bytes ONNX originales, verificados mediante SHA-256 antes de crear la sesión de ONNX Runtime. El grafo está entrenado en el dataset Places365-Challenge, aunque la model card advierte de las limitaciones de uso comercial de los datos de entrenamiento. Con un tamaño de repositorio de 0,1 GB, es un modelo ligero adecuado para tareas de restauración de imágenes en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaMa (inpainting con máscara) |
| Parametros totales | no disponible (grafo ONNX de 92 591 623 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | QDQ (Quantize-Dequantize) fijo en el grafo ONNX |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (almacenado como buffer `uint8` dentro de un archivo `.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura LaMa, un enfoque de inpainting basado en redes convolucionales con atención, diseñado para manejar máscaras grandes y producir rellenos coherentes. El grafo ONNX incrustado es exactamente el publicado por OpenCV Zoo (archivo `inpainting_lama_2025jan.onnx`), con una resolución fija de 512 píxeles y operaciones cuantizadas (QDQ). Según la model card, el modelo fue entrenado en el dataset Places365-Challenge, aunque no se proporcionan detalles sobre el número de tokens, épocas o técnicas de entrenamiento adicionales (como RLHF o DPO, que no aplican a modelos de imagen).

La integración en LibreYOLO permite cargar el modelo con una sola línea de código y ejecutarlo sobre una imagen y una máscara que comparten el mismo lienzo. El runtime verifica la integridad de los bytes ONNX antes de crear la sesión, y requiere ONNX Runtime 1.18 o superior, ya que OpenCV 4.x no puede ejecutar este grafo con opset 21.

## Capacidades

- Inpainting guiado por máscara: rellena regiones arbitrarias de una imagen indicadas por una máscara binaria (píxeles no nulos = rellenar, cero = preservar).
- Restauración de imágenes: puede eliminar objetos no deseados, manchas o artefactos de fotografías.
- Preservación exacta de píxeles no enmascarados: el modelo copia de vuelta cada píxel de la fuente que no esté cubierto por la máscara, garantizando que solo se modifiquen las áreas objetivo.
- Integración con el ecosistema LibreYOLO: se usa mediante la API `LibreYOLO("LibreLaMab-restore.pt")` y devuelve un objeto con la imagen restaurada.
- Compatibilidad con ONNX Runtime: al ser un grafo ONNX, puede ejecutarse en CPU, GPU y otros dispositivos soportados por ONNX Runtime.

## Casos de uso

- Eliminación de objetos no deseados en fotografías: el usuario dibuja una máscara sobre el objeto (por ejemplo, una persona o un coche) y el modelo rellena el fondo de forma coherente, útil para retoque fotográfico básico.
- Restauración de fotos antiguas dañadas: se pueden enmascarar rasguños, manchas o zonas rotas para que el modelo reconstruya la textura y el color circundante.
- Preprocesamiento para visión artificial: limpiar regiones de una imagen que puedan interferir con algoritmos de detección o segmentación, enmascarando elementos no deseados antes de pasar la imagen a otros modelos.
- Edición creativa de imágenes: eliminar elementos de una escena para generar composiciones alternativas, por ejemplo, quitar un cartel o una sombra no deseada.
- Automatización de tareas de retoque en flujos de producción: integrar el modelo en pipelines de procesamiento de imágenes donde se requiera eliminar imperfecciones de forma automática, usando máscaras generadas por otros algoritmos.
- Investigación y educación en inpainting: al ser un modelo ligero y de código abierto, sirve como referencia para estudiar el comportamiento de LaMa en diferentes tipos de máscaras y escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como PSNR, SSIM o comparaciones con otros modelos de inpainting.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación proporcionada.
- Dado que el grafo ONNX pesa aproximadamente 92,6 MB y opera a resolución fija de 512, es razonable esperar que pueda ejecutarse en CPU con ONNX Runtime, aunque no hay datos de latencia o throughput.
- Para GPU, cualquier tarjeta con soporte CUDA y suficiente VRAM (probablemente menos de 2 GB) debería ser suficiente, pero no se confirma oficialmente.
- Opciones de despliegue: ONNX Runtime (versión 1.18 o superior) a través de la librería `libreyolo[onnx]`. No se mencionan otros runtimes como vLLM u Ollama, que no aplican a modelos de imagen.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de inpainting en la documentación proporcionada. El modelo es una variante de LaMa, por lo que podría compararse con el LaMa original o con implementaciones como `opencv/inpainting_lama`, pero no se ofrecen datos cuantitativos para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card advierte que el dataset de entrenamiento (Places365-Challenge) tiene términos de descarga limitados a investigación y educación no comercial. Aunque el modelo se distribuye bajo Apache-2.0, no se ha establecido de forma independiente la autorización para uso comercial de los datos de entrenamiento. Esto puede suponer un riesgo legal para despliegues comerciales.
- El grafo ONNX tiene una resolución fija de 512 píxeles; imágenes de mayor tamaño deberán redimensionarse, lo que puede afectar a la calidad del resultado.
- No se proporcionan detalles sobre el comportamiento con máscaras muy grandes o imágenes con estructuras complejas; como todo modelo de inpainting, puede producir artefactos o rellenos poco realistas en regiones extensas.
- La integración requiere ONNX Runtime 1.18 o superior; entornos con versiones anteriores no podrán ejecutar el modelo.
- No se especifican sesgos conocidos, pero al estar entrenado en Places365 (escenas interiores y exteriores), el rendimiento puede degradarse en dominios muy diferentes (por ejemplo, imágenes médicas o de satélite).

## Enlaces

- Modelo en HuggingFace: [LibreYOLO/LibreLaMab-restore](https://huggingface.co/LibreYOLO/LibreLaMab-restore)
- Repositorio de artefactos de OpenCV Zoo: [opencv/inpainting_lama](https://huggingface.co/opencv/inpainting_lama)
- Código fuente de OpenCV Zoo: [opencv/opencv_zoo](https://github.com/opencv/opencv_zoo)
