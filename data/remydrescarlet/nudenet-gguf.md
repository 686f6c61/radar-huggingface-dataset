# RemydreScarlet/nudenet-gguf

## Resumen

NudeNet 320n (FriedFlaxia GGUF) es una conversión a formato GGUF de pesos F32 del modelo `320n.onnx` publicado originalmente en el repositorio `deepghs/nudenet_onnx`. No se trata de un modelo de lenguaje, sino de un detector de objetos basado en la arquitectura YOLOv8n especializado en la detección de contenido nudista o sexualmente explícito, con 18 clases de etiquetas propias de NudeNet. Cuenta con aproximadamente 3 millones de parámetros (3.009.250 según el dato de safetensors), lo que lo sitúa en la categoría de detectores ultraligeros.

El modelo lo publica el usuario RemydreScarlet bajo la herramienta de conversión del proyecto TeamFlaxia (`friedflaxia`), que implementa directamente el grafo YOLOv8n y la supresión no máxima (NMS) agnóstica a clases, sin incluir el grafo NMS original de ONNX. La entrada es una imagen RGB de 320x320 en formato float32 CHW normalizada en el rango [0, 1]. Es relevante para pipelines de moderación de contenido automatizada en entornos con recursos limitados, ya que el modelo ocupa aproximadamente 12 MB en F32.

La licencia del modelo original es Apache-2.0, aunque la model card del repositorio GGUF no declara licencia propia. No se dispone de información sobre benchmarks publicados, idiomas (es un modelo de visión, no lingüístico) ni pipeline declarado en Hugging Face. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (detector de objetos, grafo implementado en runtime FriedFlaxia) |
| Parametros totales | 3.009.250 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | F32 (único formato publicado; el autor indica que se mantiene F32 por el reducido tamaño, ~12 MB) |
| Idiomas soportados | No aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 según el modelo origen (`deepghs/nudenet_onnx`); el repo GGUF no declara licencia propia |
| Formato de pesos | GGUF (conversión desde ONNX) |

## Arquitectura y entrenamiento

El modelo es un detector de objetos YOLOv8n (la variante "nano" de la familia YOLOv8) especializado en la detección de contenido explícito. La conversión GGUF implementa el grafo de YOLOv8n y la supresión no máxima agnóstica a clases directamente en el runtime FriedFlaxia, de modo que el grafo NMS del ONNX original no se incluye en el artefacto. La entrada es una imagen RGB de 320x320 píxeles en float32, con layout CHW y valores normalizados en [0, 1]. La salida son detecciones sobre las 18 etiquetas de NudeNet utilizadas por el modelo original.

No se dispone de información sobre el dataset de entrenamiento, el número de imágenes, el proceso de anotación ni si hubo técnicas de aumento de datos o ajuste fino específicas. Tampoco se documenta en la información proporcionada si el modelo original empleó destilación, poda o cuantización durante el entrenamiento. La conversión a GGUF se realizó con el script `tools/convert_nudenet.py` del proyecto `TeamFlaxia/friedflaxia`, sobre la revisión `44956a0587943016350c7815f9e0dec089d45cae` del ONNX de origen.

## Capacidades

- Detección de objetos en imágenes RGB de 320x320 píxeles con 18 clases correspondientes a las etiquetas de NudeNet.
- Supresión no máxima (NMS) agnóstica a clases integrada en el runtime FriedFlaxia.
- Inferencia sobre imágenes estáticas; no se documenta soporte de vídeo, streaming ni procesamiento por lotes.
- Modelo de visión puro: no genera texto, no razona, no ejecuta código ni realiza llamadas a herramientas.
- No dispone de capacidades multilingües, tool calling, agentes ni modos de pensamiento.
- No se documentan capacidades de segmentación, pose estimation ni detección de keypoints; únicamente detección de bounding boxes.

## Casos de uso

- Moderación de contenido en plataformas UGC: el detector puede ejecutarse sobre imágenes subidas por usuarios para bloquear o marcar contenido explícito antes de su publicación, aprovechando su reducido tamaño (~12 MB) para desplegarse en el mismo servidor de aplicaciones sin GPU dedicada.
- Filtrado previo en pipelines de scraping masivo: al ser un modelo ultraligero de 3 millones de parámetros, permite procesar lotes grandes de imágenes en CPU con un coste computacional bajo antes de pasarlas a modelos más pesados.
- Moderación en aplicaciones móviles o edge: el formato GGUF y el tamaño reducido permiten integrar el detector en apps de mensajería o foros que necesitan filtrado local sin enviar imágenes a la nube.
- Cumplimiento normativo y auditoría de contenido: útil para clasificar y etiquetar automáticamente imágenes en repositorios corporativos o archivos históricos, generando informes de exposición a contenido sensible.
- Preprocesado en datasets de entrenamiento: filtrar imágenes explícitas antes de construir datasets de visión por computador para otros modelos, evitando contaminación del corpus.
- Control parental y filtrado en navegadores o pasarelas domésticas: el modelo puede integrarse en un proxy o extensión que analice imágenes descargadas y bloquee contenido no deseado en tiempo casi real.
- Detección en sistemas de gestión de comunidades: foros y servidores de chat pueden usar el detector para revisar imágenes adjuntas y aplicar políticas de moderación antes de la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F32 (pesos de ~12 MB más activaciones intermedias de una YOLOv8n a 320x320).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, que está pensado para ejecutarse en CPU.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna; también funciona en CPU sin aceleración dedicada.
- Opciones de despliegue: runtime FriedFlaxia (implementación propia del autor de la conversión); no se documenta soporte en llama.cpp, Ollama, vLLM ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia de pocos milisegundos por imagen en hardware consumer, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NudeNet 320n (FriedFlaxia GGUF) | ~3,0 M | 320x320 RGB | GGUF | Apache-2.0 (origen) | Conversión GGUF de `deepghs/nudenet_onnx`; runtime propio |
| deepghs/nudenet_onnx (`320n.onnx`) | ~3,0 M | 320x320 RGB | ONNX | Apache-2.0 | Modelo origen; incluye grafo NMS de ONNX |
| NudeNet original (notAI-tech) | No disponible | No disponible | No disponible | No disponible | Implementación de referencia del detector; datos de parámetros no disponibles en esta consulta |

No se dispone de información sobre benchmarks comparativos ni de otros detectores especializados de contenido explícito de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de falsos positivos y falsos negativos: al ser un detector YOLOv8n nano, su precisión es inferior a la de detectores más grandes; no se han publicado métricas (mAP, precisión, recall) que permitan cuantificar el error.
- Sesgos del dataset de entrenamiento: se desconocen la composición, la distribución geográfica y demográfica del corpus original, lo que puede producir sesgos no documentados en la detección según tipo de cuerpo, etnia, género o contexto.
- Sin información sobre el proceso de curado del dataset ni sobre posibles falsos positivos en imágenes médicas, artísticas o de lactancia.
- La conversión GGUF no incluye el grafo NMS de ONNX; el runtime FriedFlaxia debe implementar la NMS correctamente, y no se documentan pruebas de equivalencia numérica frente al ONNX original.
- Licencia: aunque el modelo origen es Apache-2.0, el repositorio GGUF no declara licencia propia; conviene verificar los términos antes de uso comercial.
- El autor del repositorio GGUF no es el autor del modelo original; la trazabilidad y el mantenimiento del artefacto no están garantizados.
- No es un modelo de lenguaje: no admite prompts de texto, instrucciones en lenguaje natural ni razonamiento; solo acepta imágenes de 320x320.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere ausencia de validación comunitaria.
- Uso responsable: la detección automática de contenido explícito debe combinarse con revisión humana para evitar errores graves en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RemydreScarlet/nudenet-gguf
- Modelo origen en Hugging Face: https://huggingface.co/deepghs/nudenet_onnx
- Repositorio del runtime de conversión: https://github.com/TeamFlaxia/friedflaxia (referenciado en la model card)
