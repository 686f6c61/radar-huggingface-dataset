# LibreYOLO/LibreDepthPro2l-depth

## Resumen

LibreDepthPro2l-depth es un empaquetado en formato de checkpoint de LibreYOLO de los pesos de Apple Depth Pro 2, un modelo de estimación de profundidad métrica a partir de una sola imagen. El paquete combina el checkpoint de profundidad `apple/DepthPro2-L` con el estimador de distancia focal `apple/DepthPro2-focal`, ambos desarrollados por Apple Machine Learning Research, y los presenta como un único artefacto con metadatos de tarea `depth`. El modelo base emplea un backbone DINOv3 ViT-L/16 y resuelve el problema de obtener mapas de profundidad en metros reales sin necesidad de calibrar la cámara, infiriendo también la distancia focal implícita de la escena.

La relevancia de este empaquetado es operativa: permite cargar el modelo con la librería LibreYOLO mediante una única llamada y obtener tanto el mapa de profundidad métrico como la matriz de intrínsecos en formato OpenCV. Los parámetros aprendidos son idénticos bit a bit a los originales de Apple; las únicas modificaciones son el prefijo `fov.*` para el state dict del estimador focal y los metadatos del checkpoint v1.0.

Es importante señalar que los pesos no heredan la licencia MIT de LibreYOLO, sino la Apple Machine Learning Research Model License Agreement, que restringe el uso a fines de investigación no comerciales. El repositorio ocupa 1,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv3 ViT-L/16) para profundidad, con estimador de distancia focal auxiliar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement), solo investigación no comercial |
| Formato de pesos | checkpoint LibreYOLO `.pt` (repo de 1,4 GB); los originales de Apple se distribuyen en `model.safetensors` |

## Arquitectura y entrenamiento

El modelo se basa en un backbone DINOv3 ViT-L/16, un transformer de visión con parches de 16x16 y variante Large. Sobre esa representación se resuelve la estimación de profundidad métrica, y se acompaña de un segundo módulo (`DepthPro2-focal`) que estima la distancia focal de la escena para producir profundidad en metros sin calibración explícita. El pipeline devuelve además una matriz de intrínsecos de cámara en formato OpenCV, lo que permite reproyectar la profundidad a nube de puntos o usarla en pipelines de visión 3D.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de ajuste fino con RLHF o DPO; estos datos no figuran en la información proporcionada. La innovación destacable del empaquetado es la verificación de paridad de inferencia bit a bit contra el código de referencia de Apple (`apple-aiml-research/ml-depth-pro-2`), lo que garantiza que el repackaging no altera el comportamiento numérico del modelo original.

## Capacidades

- Estimación de profundidad métrica a partir de una sola imagen, con valores en metros reales.
- Estimación de distancia focal implícita de la escena mediante el módulo `DepthPro2-focal`.
- Generación de mapas de profundidad para vídeo en streaming (etiqueta `video-depth`).
- Salida de intrínsecos de cámara `(3, 3)` en convención OpenCV, lista para reproyección.
- Marcado de píxeles de cielo como infinito en el mapa de profundidad.
- Integración con la API de LibreYOLO (`LibreYOLO(...).predict(...)`) con acceso a `result.depth_map` y `depth.intrinsics`.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento, por tratarse de un modelo puramente visual.

## Casos de uso

- Investigación en reconstrucción 3D: el mapa de profundidad métrico junto con los intrínsecos permite generar nubes de puntos y mallas densas de una sola imagen sin calibración previa, adecuado para experimentos académicos de fotogrametría monocular.
- Análisis de vídeo en laboratorio: la etiqueta `video-depth` y el procesamiento por fotogramas permiten estudiar coherencia temporal de la profundidad en secuencias, por ejemplo para evaluar métodos de seguimiento o SLAM monocular en entornos de investigación.
- Aumento de datos sintéticos: la profundidad métrica sirve para componer objetos virtuales con oclusión correcta en imágenes reales, útil en pipelines de generación de datasets para percepción.
- Evaluación comparativa de modelos de profundidad: al mantener paridad bit a bit con Apple Depth Pro 2, sirve como referencia reproducible en estudios que comparan estimadores monoculares.
- Robótica de investigación: planificación de agarre o navegación en prototipos académicos donde se necesita distancia absoluta a obstáculos a partir de una cámara monocular.
- Docencia y reproducción de resultados: el formato de checkpoint único simplifica la carga del modelo en cuadernos y prácticas, evitando la gestión separada de dos state dicts.
- Previsualización de efectos visuales: generación de mapas de profundidad para desenfoque selectivo o composición en proyectos no comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 1,4 GB en disco, lo que da una cota inferior del orden de los GB en memoria para pesos en precisión nativa.
- GPU recomendadas: no disponible. Al tratarse de un ViT-L/16, se espera que requiera una GPU con memoria suficiente para el backbone, pero no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la única vía documentada es la librería LibreYOLO (`from libreyolo import LibreYOLO`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Profundidad métrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreDepthPro2l-depth | no disponible (ViT-L/16) | no aplica | Sí, con estimador focal | apple-amlr, solo investigación | Hugging Face, formato LibreYOLO |
| apple/DepthPro2-L | no disponible (ViT-L/16) | no aplica | Sí (requiere focal por separado) | apple-amlr | Hugging Face, safetensors |
| apple/DepthPro2-focal | no disponible | no aplica | Módulo auxiliar de distancia focal | apple-amlr | Hugging Face, safetensors |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer comparaciones cuantitativas de precisión o latencia.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos están bajo Apple Machine Learning Research Model License Agreement y limitados exclusivamente a fines de investigación no comerciales; no se permite desarrollo de productos ni uso en servicios comerciales.
- La licencia MIT de LibreYOLO no cubre estos pesos; los usuarios posteriores son responsables del cumplimiento.
- Modelo puramente visual: no procesa texto ni mantiene conversaciones, por lo que no aplican evaluaciones de sesgo lingüístico ni de alucinación textual.
- Riesgo de error en la estimación de profundidad en escenas con superficies reflectantes, transparentes o texturas repetitivas, habitual en estimadores monoculares; no se documentan métricas de error en la información disponible.
- Los píxeles de cielo se marcan como infinito, lo que requiere tratamiento explícito en pipelines posteriores.
- No se documentan sesgos demográficos, geográficos ni de otro tipo, ni el dominio de entrenamiento, lo que dificulta evaluar su robustez fuera de distribución.
- Sin datos de cuantización ni de latencia, la planificación de despliegue en producción (aunque fuese permitida) queda sin garantías documentadas.
- El repositorio no registra descargas ni validación comunitaria; la verificación de paridad bit a bit es la única garantía de corrección reportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreDepthPro2l-depth
- Modelo base de profundidad: https://huggingface.co/apple/DepthPro2-L
- Modelo base de distancia focal: https://huggingface.co/apple/DepthPro2-focal
- Código de referencia de Apple: https://github.com/apple-aiml-research/ml-depth-pro-2/tree/aa389cbb0b74341664ed663a0966c859905cd6c0
- Licencia del modelo de Apple: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/aa389cbb0b74341664ed663a0966c859905cd6c0/LICENSE_MODEL
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
