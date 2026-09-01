# ParrotG/RobustFake

## Resumen

RobustFake es un modelo de clasificación de imágenes diseñado para detectar imágenes generadas por inteligencia artificial (AIGC) y distinguirlas de fotografías auténticas, con un énfasis especial en la robustez frente a degradaciones típicas de redistribución como recompresión JPEG, desenfoque, redimensionado, ruido, ajustes de color y recortes. Lo desarrolla el autor ParrotG y se publica en Hugging Face bajo licencia "other" (sin especificar términos concretos).

El modelo combina un codificador visual CLIP ViT-B/16 congelado (OpenCLIP, variante quickgelu) con una cabeza de detección entrenable de menos de 5 millones de parámetros. Su diseño incorpora dos vistas de la imagen (global y local), fusión de representaciones semánticas e intermedias, estadísticas residuales fijas y un mecanismo de puerta softmax dependiente de la muestra. El entrenamiento se realizó sobre 80.000 imágenes preparadas (64.000 de entrenamiento, 8.000 de validación in-distribution y 8.000 de validación de generalización de dominio), con un perfil de cómputo modesto que requiere entre 8 y 12 GB de VRAM. Su relevancia actual radica en la necesidad práctica de detectores que mantengan su fiabilidad cuando las imágenes han pasado por pipelines de compartición reales, no solo en condiciones limpias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/16 congelado (OpenCLIP) + cabeza de fusión multi-capa + rama de estadísticas residuales |
| Parametros totales | No disponible (backbone congelado; menos de 5M entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | other (términos no especificados) |
| Formato de pesos | PyTorch (formato de archivo no especificado; probablemente safetensors o binario) |

## Arquitectura y entrenamiento

El modelo utiliza un backbone CLIP ViT-B/16 congelado en modo evaluación, descartando el codificador de texto. Para cada imagen se generan dos vistas cuadradas: una vista global que cubre el 90-100% de la dimensión más corta (preserva contexto de escena sin exponer padding correlacionado con la etiqueta) y una vista local que cubre el 50-90% (aumenta la probabilidad de observar artefactos locales de síntesis). De cada vista se extraen el embedding proyectado final de 512 dimensiones y los tokens CLS normalizados de los bloques transformer 4, 7, 10 y 12, que se proyectan a 512 dimensiones mediante capas lineales entrenables. Una puerta softmax dependiente de la muestra combina la representación semántica final con la evidencia intermedia, en lugar de asignar importancia fija a cada capa.

Las embeddings fusionadas de ambas vistas se agregan mediante su media y desviación estándar: la media representa evidencia compartida y la desviación expone desacuerdos entre contexto global y detalle local. Una rama adicional calcula 24 estadísticas de paso alto fijas por vista (residuales direccionales, laplacianos por canal y diferencias de píxeles horizontales/verticales), cuyas medias y desviaciones pasan por un MLP pequeño y se concatenan con el agregado CLIP. El entrenamiento se realizó con pares de vistas limpias y degradadas que comparten geometría espacial, sobre datasets como Shanmuk AI Image Detection Dataset, WildFake (split de entrenamiento), Community Forensics-Small y Tiny-GenImage. Se aplicó una calibración afín post-entrenamiento para corregir el sesgo global de confianza sin alterar el ranking del detector ni usar el conjunto de demostración oficial para el ajuste.

## Capacidades

- Detección binaria de imágenes generadas por IA frente a imágenes auténticas.
- Robustez frente a degradaciones de redistribución: recompresión JPEG, desenfoque, redimensionado, ruido, ajuste de color y recorte.
- Generalización a dominios no vistos gracias a la separación de validación in-distribution y domain-generalisation.
- Fusión de información semántica global (CLIP) con evidencia forense local (estadísticas residuales).
- Inferencia con un único par de vistas limpias (global y local), sin necesidad de vistas degradadas en tiempo de ejecución.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede clasificar imágenes subidas por usuarios para detectar material generado por IA, manteniendo precisión incluso cuando las imágenes han sido recomprimidas o redimensionadas por la propia plataforma.
- Verificación de autenticidad en medios de comunicación: periodistas y verificadores pueden usar RobustFake para comprobar si una imagen recibida por WhatsApp o descargada de internet es sintética, gracias a su robustez frente a degradaciones típicas de reenvío.
- Forensia digital en entornos judiciales: análisis de evidencias fotográficas donde las imágenes pueden haber pasado por múltiples procesos de edición y compresión; el detector ofrece una señal probabilística complementaria a otros análisis forenses.
- Auditoría de contenido generado por IA en campañas publicitarias: las marcas pueden verificar que las imágenes que reciben de proveedores son auténticas o, por el contrario, identificar cuándo se ha usado generación sintética sin declarar.
- Investigación académica en detección de imágenes sintéticas: el diseño con backbone congelado y cabeza ligera permite reproducir experimentos con recursos limitados, y su separación de validación por dominios facilita estudios de generalización.
- Control de calidad en pipelines de datos: empresas que recopilan grandes volúmenes de imágenes para entrenar otros modelos pueden filtrar automáticamente contenido generado por IA no deseado, reduciendo el riesgo de contaminación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card se interrumpe antes de la sección de evaluación oficial, por lo que no se dispone de métricas como precisión, recall, AUC o comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada: entre 8 y 12 GB de memoria GPU NVIDIA recomendada según la model card.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB de VRAM (por ejemplo, RTX 2070/2080, RTX 3060/3070, RTX 4060/4070, o superiores). No se especifican modelos concretos.
- Inferencia en consumer GPU: sí, dado el tamaño reducido de la cabeza entrenable y el backbone congelado.
- Opciones de despliegue: no se mencionan herramientas específicas (vLLM, llama.cpp, etc.). Al ser un modelo PyTorch estándar, puede servirse con TorchServe, FastAPI o cualquier framework de inferencia para PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa en la model card ni en los resultados de búsqueda web. No se pueden proporcionar comparaciones con otros detectores de imágenes generadas por IA (como CNNDetection, DIRE, etc.) sin datos verificables.

## Limitaciones y advertencias

- La licencia "other" no especifica términos concretos; es necesario contactar al autor o revisar el repositorio de GitHub para conocer restricciones de uso comercial.
- El entrenamiento se basa en un conjunto limitado de generadores (Shanmuk, WildFake, Community Forensics-Small, Tiny-GenImage); el rendimiento puede degradarse con generadores no representados en esos datos.
- La model card menciona una sección de "Limitation Reflection" que no está disponible en el texto proporcionado, por lo que no se conocen limitaciones adicionales declaradas por el autor.
- No se han publicado análisis de sesgos (por ejemplo, diferencias de rendimiento entre tipos de contenido, etnias o estilos fotográficos).
- El modelo solo procesa imágenes; no ofrece explicabilidad intrínseca sobre qué regiones concretas determinan la clasificación.
- El tamaño del repositorio en Hugging Face es de 0.0 GB, lo que sugiere que los pesos podrían no estar alojados en el repositorio principal o que la carga se realiza desde otro origen (el propio README enlaza a un modelo alternativo en https://huggingface.co/Gin123/RobustFake).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ParrotG/RobustFake
- Repositorio GitHub: https://github.com/ParrotG/RobustFake
- Modelo alternativo en Hugging Face (mencionado en la model card): https://huggingface.co/Gin123/RobustFake
