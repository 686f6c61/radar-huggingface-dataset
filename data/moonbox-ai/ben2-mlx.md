# moonbox-ai/BEN2-MLX

## Resumen

BEN2-MLX es una conversión a MLX del modelo BEN2 Base (Background Erase Network) realizada por moonbox-ai para su ejecución nativa en Apple Silicon. BEN2 es un modelo de segmentación de imágenes especializado en eliminación de fondos y matting de primer plano, desarrollado originalmente por PramaLLC y publicado con licencia MIT. El modelo resuelve el problema de separar el sujeto del fondo con precisión de matting (canal alfa con bordes suaves), no solo con una máscara binaria.

La arquitectura original combina un backbone Swin-B con un decodificador MCLM/MCRM y una etapa de refinamiento guiada por confianza (Confidence Guided Matting, CGM) que reprocesa los píxeles donde el modelo base tiene baja confianza. El modelo procesa la imagen completa más cuatro recortes de 512 px internamente a 1024x1024. Esta versión MLX no incluye la etapa opcional de descontaminación de color `refine_foreground` del original.

La relevancia de esta ficha es práctica: ofrece cinco precisiones (fp16, bf16, 8bit, 6bit, 4bit) con pesos de entre 62 MB y 188 MB, verificadas contra el modelo PyTorch original con métricas de MAE e IoU de máscara. Es una opción ligera para pipelines de eliminación de fondos en Macs con Apple Silicon, con un rendimiento de aproximadamente 0,7 s por imagen en un Apple M5. No es un modelo de lenguaje: no genera texto ni soporta tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin-B (backbone) con decodificador MCLM/MCRM y refinador Confidence Guided Matting (CGM) |
| Parámetros totales | no disponible (pesos fp16 de 188 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada interna 1024x1024) |
| Tipos de cuantización | fp16, bf16, 8bit, 6bit, 4bit (cuantización afín de MLX, group size 64) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) + `config.json` + `mlx_model.py` |
| Librería | MLX |
| Tarea | image-segmentation / image-matting / background-removal |
| Modelo base | PramaLLC/BEN2 (revisión `e48a20765f`) |
| Tamaño del repo | 0,6 GB |

## Arquitectura y entrenamiento

El modelo original BEN2 se construye sobre un backbone Swin-B que procesa la imagen completa junto con cuatro recortes de 512 px, alimentando un decodificador MCLM/MCRM. La innovación principal es el pipeline de Confidence Guided Matting (CGM): una red refinadora que identifica los píxeles donde el modelo base presenta baja confianza y los reprocesa para obtener un matting más preciso y fiable. El resultado es un canal alfa (HxW uint8) en lugar de una máscara binaria.

La conversión a MLX mantiene la arquitectura `BEN_Base` tal como se publicó. En las variantes cuantizadas se cuantizan las capas lineales (Swin, atención, feed-forward) con group size 64, mientras que las convoluciones y las normas permanecen en bf16. No se ha portado la etapa opcional `refine_foreground` de descontaminación de color del original. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Segmentación de primer plano y generación de matting (canal alfa) a partir de imágenes RGB.
- Eliminación de fondos con bordes suaves gracias al pipeline CGM de refinamiento por confianza.
- Procesamiento interno a 1024x1024 con entrada de imagen completa más cuatro recortes de 512 px.
- Salida de máscara alfa en uint8 (HxW), directamente combinable con la imagen RGB para generar un cutout PNG.
- Ejecución nativa en Apple Silicon mediante MLX, con solo `mlx`, `numpy` y `pillow` como dependencias.
- Cinco niveles de precisión con degradación controlada y verificada frente al modelo PyTorch fp32.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Eliminación de fondos en lotes para catálogos de e-commerce: el modelo genera el canal alfa de cada producto y permite componerlo sobre fondos neutros; el tamaño de 62-188 MB y los ~0,7 s por imagen en M5 lo hacen viable para procesar miles de imágenes en local.
- Edición fotográfica en aplicaciones de escritorio para macOS: integrable vía MLX en apps nativas de Apple Silicon para recortar sujetos con bordes suaves (pelo, pelaje) sin depender de servicios en la nube.
- Generación de assets para diseño gráfico y vídeo: extracción de sujetos para composición en capas, con la precisión de matting del refinador CGM en zonas de baja confianza.
- Preprocesado en pipelines de visión por computador: separar el sujeto del fondo antes de tareas de clasificación, detección o reidentificación, reduciendo el ruido de fondo.
- Creación de avatares y retratos para videollamadas o streaming: matting en tiempo casi real en hardware consumer Apple, con la variante 4bit (62 MB) para minimizar uso de memoria.
- Prototipado e investigación en segmentación: la disponibilidad de cinco precisiones con métricas de fidelidad verificadas permite estudiar el impacto de la cuantización en la calidad del matting sin reentrenar.
- Automatización de flujos de publicación de contenido: integración en scripts que recortan imágenes antes de subirlas a CMS o redes sociales, ejecutándose íntegramente en un Mac.

## Benchmarks y rendimiento

Fidelidad de cada build MLX frente al modelo PyTorch fp32 original (peor imagen del conjunto de verificación):

| Precisión | Tamaño | MAE vs PyTorch fp32 (peor imagen) | Mask IoU (peor) |
|---|---|---|---|
| fp16 | 188 MB | 0,00003 | 0,9996 |
| bf16 | 188 MB | 0,0002 | 0,9987 |
| 8bit | 106 MB | 0,0003 | 0,9983 |
| 6bit | 84 MB | 0,0004 | 0,9966 |
| 4bit | 62 MB | 0,0012 | 0,9923 |

Rendimiento: aproximadamente 0,7 s por imagen en un Apple M5 en todas las precisiones. No se han publicado en la información disponible resultados de benchmarks estándar de segmentación (por ejemplo, en datasets públicos de matting) para el modelo original ni para esta conversión.

## Requisitos de hardware

- VRAM/memoria unificada estimada: entre 62 MB (4bit) y 188 MB (fp16/bf16) solo para pesos; el pico real depende de las activaciones a 1024x1024, pero es holgadamente inferior a 1 GB en todos los casos.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4, M5) mediante MLX. El autor reporta ~0,7 s por imagen en un Apple M5.
- GPU consumer: no está pensado para GPU NVIDIA; requiere MLX, que es específico de Apple Silicon. En Macs con memoria unificada de 8 GB o más cabe sin problema.
- Despliegue: MLX con el script `mlx_model.py` incluido en cada carpeta de precisión (dependencias: `mlx`, `numpy`, `pillow`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: ~0,7 s por imagen en M5 según el autor; no se dispone de datos de throughput en lote ni de latencias en otros chips.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de pesos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BEN2-MLX (esta ficha) | Matting / segmentación | 62-188 MB | MLX safetensors | MIT | Solo Apple Silicon; cinco precisiones |
| PramaLLC/BEN2 (original) | Matting / segmentación | no disponible | PyTorch | MIT | Implementación de referencia; incluye `refine_foreground` |
| Otros modelos de eliminación de fondos | Segmentación | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas (por ejemplo, modelos de matting de otros autores) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Es un modelo de visión: no genera texto, no razona y no soporta tool calling ni agentes; no debe evaluarse como un LLM.
- La etapa opcional `refine_foreground` (descontaminación de color) del modelo original no está portada, por lo que los bordes pueden mostrar contaminación de color del fondo en casos difíciles.
- Solo funciona en Apple Silicon mediante MLX; no es desplegable en GPU NVIDIA ni en CPU de forma directa con este repositorio.
- La cuantización a 4bit degrada la fidelidad (MAE hasta 0,0012 e IoU 0,9923 en la peor imagen); para máxima calidad conviene fp16 o bf16.
- No se dispone de información sobre sesgos del modelo original ni sobre su comportamiento en grupos demográficos o tipos de imagen específicos.
- Riesgo de errores en imágenes con fondos complejos, transparencias o sujetos poco definidos; no hay datos publicados en la información disponible sobre estos casos límite.
- Licencia MIT: permite uso comercial, pero al ser un derivado del modelo original, se aplica la licencia de este (MIT), copiada en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-ai/BEN2-MLX
- Modelo base original: https://huggingface.co/PramaLLC/BEN2
- Paper (arXiv): https://arxiv.org/abs/2501.06230
- Repositorio GitHub: https://github.com/PramaLLC/BEN2/
- Sitio web: https://backgrounderase.net
