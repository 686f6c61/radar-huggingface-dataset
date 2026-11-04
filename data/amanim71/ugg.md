# amanim71/UGG

## Resumen

UGG es un modelo de difusión de vídeo desarrollado por el usuario amanim71 (repositorio `amanim71/UGG` en HuggingFace), construido como un fine-tuning de Wan2.2-TI2V-5B. Su particularidad es que genera de forma conjunta vídeo RGB, mapas de profundidad por fotograma y rayos de cámara (camera rays), lo que le permite resolver seis tareas distintas de reconstrucción y síntesis 4D con un único checkpoint: desde vídeo a 4D hasta texto a 4D, pasando por imagen más cámara a 4D o profundidad a 4D.

El modelo parte de los 5.000 millones de parámetros de Wan2.2-TI2V-5B y los extiende a una mezcla de transformers (mixture of transformers) con expertos separados para RGB, rayos y profundidad, alcanzando 12.600 millones de parámetros en total. Esta arquitectura permite condicionar la generación con cualquier subconjunto de las tres modalidades y completar automáticamente las restantes, lo que lo convierte en una propuesta relevante como world model para tareas de novel view synthesis, estimación de pose de cámara y generación de vídeo condicionada geométricamente.

El modelo se publica bajo licencia MIT, con pesos en formato safetensors (bf16) y un tamaño de repositorio de 29,6 GB. La resolución de salida es de 288×384 píxeles y la inferencia requiere una GPU de 80 GB. Es un proyecto de investigación con cero descargas en el momento de la consulta y una única interacción, por lo que debe considerarse una propuesta emergente y no un modelo consolidado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de transformers (mixture of transformers) con expertos RGB, rayos y profundidad, construida sobre Wan2.2-TI2V-5B (difusión de vídeo) |
| Parametros totales | 12.600 millones (12,6B) |
| Parametros activos | No disponible (no se especifica si todos los expertos se activan por consulta) |
| Longitud de contexto | No disponible (la longitud de clip debe cumplir `num_frames % 4 == 2`, por ejemplo 10, 26 o 50 fotogramas) |
| Tipos de cuantizacion | No disponible (los pesos se publican en bf16) |
| Idiomas soportados | No disponible |
| Licencia | MIT (los componentes base de Wan2.2 se distribuyen bajo su propia licencia) |
| Formato de pesos | safetensors (`ugg_release.safetensors`, bf16) |
| Resolucion de salida | 288×384 |
| Tamano del repositorio | 29,6 GB |
| Pipeline | image-to-video |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

UGG se construye sobre Wan2.2-TI2V-5B, un modelo de difusión de vídeo de 5.000 millones de parámetros, y lo extiende a una mezcla de transformers con tres expertos dedicados: RGB, rayos de cámara y profundidad. El resultado son 12.600 millones de parámetros totales. La innovación central es que el modelo acepta cualquier subconjunto de las tres modalidades como entrada y genera las restantes, lo que unifica en un solo checkpoint seis tareas de reconstrucción y síntesis 4D (vídeo a 4D, imagen más cámara a 4D, primera y última imagen más cámara a 4D, texto a 4D, cámara a 4D y profundidad a 4D).

El checkpoint publicado (`ugg_release.safetensors`) contiene el transformer completo de UGG en bf16 junto con las estadísticas de normalización del espacio latente del VAE. El VAE de Wan2.2 y el codificador de texto UMT5-XXL no se duplican en el repositorio: el código los descarga desde `Wan-AI/Wan2.2-TI2V-5B`. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación conjunta de vídeo RGB, profundidad por fotograma y rayos de cámara (camera rays) en una sola pasada.
- Reconstrucción 4D a partir de vídeo: dada una secuencia completa, estima profundidad y cámaras.
- Síntesis de vídeo condicionada por cámara: a partir de un primer fotograma y una trayectoria, genera vídeo y profundidad.
- Interpolación entre primer y último fotograma con trayectoria de cámara especificada.
- Generación texto a 4D: desde un prompt de texto, produce vídeo, profundidad y cámaras.
- Generación condicionada solo por cámara (y prompt opcional).
- Generación condicionada por profundidad (con prompt y fotogramas opcionales).
- Estimación de pose de cámara e intrínsecos (`pred.c2w`, `pred.intrinsics`).
- Novel view synthesis a partir de las representaciones 4D generadas.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reconstrucción 4D de vídeo existente: usar `model.video_to_4d("clip.mp4")` para obtener profundidad y poses de cámara por fotograma a partir de un clip grabado, útil en pipelines de fotogrametría ligera o previsualización de escenas.
- Novel view synthesis: dada una imagen y una trayectoria de cámara, generar vistas nuevas coherentes con la geometría estimada, aplicable a visualización arquitectónica o creación de contenido.
- Generación de vídeo controlada por cámara: especificar una trayectoria y un primer fotograma para producir un plano con movimiento de cámara determinista, útil en previsualización cinematográfica.
- Interpolación de planos con control geométrico: proporcionar primer y último fotograma más la trayectoria para generar la transición intermedia con profundidad consistente.
- World model para investigación en IA: emplear el modelo como simulador de escenas 4D para entrenar o evaluar agentes que requieran comprensión geométrica del entorno.
- Generación texto a 4D para prototipado: a partir de un prompt, obtener vídeo, profundidad y cámaras para iterar rápidamente en conceptos de escena.
- Datos sintéticos para visión por computador: generar pares vídeo-profundidad-cámara etiquetados para aumentar datasets de entrenamiento en tareas de SLAM o estimación de profundidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: una GPU de 80 GB según la model card (no se documentan opciones de cuantización que reduzcan este requisito).
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes con 80 GB de memoria.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en la configuración publicada.
- Opciones de despliegue: el repositorio oficial proporciona `infer.py` y una API Python (`from ugg import UGG`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Resolución de salida fija de 288×384; longitud de clip restringida a `num_frames % 4 == 2` (por ejemplo 10, 26 o 50 fotogramas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / longitud | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UGG | 12,6B (mezcla de transformers) | Clip con `num_frames % 4 == 2` | Vídeo, profundidad, cámaras, 4D | MIT | HuggingFace, 0 descargas |
| Wan2.2-TI2V-5B | 5B | No disponible | Image-to-video | Licencia propia de Wan-AI | HuggingFace (modelo base) |
| Alternativas de video diffusion con depth | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre benchmarks comparativos ni de otros modelos de la misma categoría (difusión de vídeo con salida conjunta de profundidad y cámaras) en la documentación proporcionada.

## Limitaciones y advertencias

- Proyecto de investigación con cero descargas y una única interacción en HuggingFace; no hay evidencia de validación en producción.
- Resolución de salida baja (288×384), insuficiente para aplicaciones comerciales de vídeo de alta calidad.
- Longitud de clip restringida por la regla `num_frames % 4 == 2`, lo que limita la duración de las secuencias.
- Requiere una GPU de 80 GB, lo que restringe su uso a entornos con hardware de gama alta.
- No se documentan sesgos conocidos, pero al derivar de Wan2.2 y de un codificador de texto UMT5-XXL, puede heredar sesgos de esos componentes.
- Riesgo de alucinación geométrica: la profundidad y las cámaras generadas pueden ser inconsistentes en escenas complejas; no se aportan métricas de error.
- Idiomas soportados no documentados; el comportamiento multilingüe del prompt de texto es incierto.
- Licencia MIT para los pesos de UGG, pero los componentes base de Wan2.2 se rigen por su propia licencia, que debe verificarse para uso comercial.
- No se documenta soporte de tool calling, agentes ni integración con frameworks de despliegue estándar (vLLM, TGI, Ollama).

## Enlaces

- HuggingFace: https://huggingface.co/amanim71/UGG
- Repositorio de código, muestras y receta de entrenamiento: https://github.com/amanikiruga/UGG
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
