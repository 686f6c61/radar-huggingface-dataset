# aksern/misn-1.0

## Resumen

MISN-1.0 (Moderate Images Swin Network) es un modelo de clasificación binaria de imágenes para moderación de contenido, desarrollado por el usuario aksern. Se trata de un ajuste fino (fine-tuning) del modelo preentrenado microsoft/swin-base-patch4-window7-224, un Swin Transformer Base de 86.745.274 parámetros, y su única tarea es decidir si una imagen debe etiquetarse como `clean` o como `nsfw`. El modelo se publica con pipeline `image-classification` y es compatible con la librería Transformers.

El problema que resuelve es acotado pero recurrente en producción: filtrar automáticamente contenido para adultos antes de publicar imágenes, antes de indexar un dataset o dentro de un sistema de moderación de contenido generado por usuarios. Frente a otros clasificadores genéricos, MISN-1.0 está especializado en una decisión binaria, lo que simplifica su integración como etapa de pre-filtrado en pipelines más amplios.

Su relevancia actual es limitada y conviene ser honesto al respecto: el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha, el conjunto de entrenamiento original es muy pequeño (unas 2.500 imágenes) y no se han publicado resultados de benchmarks. Es, por tanto, un modelo experimental de nicho, no un componente listo para sustituir a un sistema de moderación consolidado. La arquitectura no es de lenguaje: no hay ventana de contexto de tokens ni capacidades generativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer Base (vision transformer jerárquico con atención por ventanas desplazadas) |
| Parametros totales | 86.745.274 (86,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 224x224 píxeles, patch size 4, window size 7) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; pesos en safetensors) |
| Idiomas soportados | no disponible (tarea de visión, independiente del idioma; las etiquetas son `clean` y `nsfw`) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,3 GB) |
| Pipeline | image-classification |
| Clases de salida | `0: clean`, `1: nsfw` |
| Modelo base | microsoft/swin-base-patch4-window7-224 |
| Dataset de ajuste | akaruineko/pinterest-4k |
| Resolución de entrada | 224x224 |

## Arquitectura y entrenamiento

MISN-1.0 parte de microsoft/swin-base-patch4-window7-224, un Swin Transformer Base con parches de 4x4 y ventanas de atención de 7x7 sobre entradas de 224x224 píxeles. Sobre ese extractor de características visuales se añade una cabeza de clasificación con dos salidas (`clean` y `nsfw`). El ajuste fino se realizó en la librería Transformers y los pesos se distribuyen en formato safetensors. Al ser un fine-tuning de clasificación, no hay fases de RLHF, DPO ni decodificación especulativa: es un clasificador discriminativo de visión por computador.

El dato más relevante para evaluar el modelo es el volumen de entrenamiento: el conjunto original contiene aproximadamente 2.500 imágenes repartidas entre las dos clases, y se aplicó aumento de datos hasta alcanzar unas 5.000 muestras por clase. La propia model card advierte de que ese aumento no debe interpretarse como 10.000 imágenes fuente independientes, sino como variaciones de las originales. Esta restricción estructural es la que explica la mayor parte de las limitaciones declaradas por el autor (generalización desigual y sensibilidad al domain shift). No se documentan en la información disponible ni el número de épocas, ni el optimizador, ni la tasa de aprendizaje, ni la composición exacta del dataset akaruineko/pinterest-4k.

## Capacidades

- Clasificación binaria de imágenes en dos etiquetas excluyentes: `clean` y `nsfw`.
- Devuelve probabilidades para ambas clases (por ejemplo, `{"label": "clean", "score": 0.9998}`), no solo la etiqueta ganadora.
- Integración directa con el pipeline `image-classification` de Hugging Face Transformers, tanto desde ruta local como desde URL de imagen.
- Preprocesado automático de la imagen mediante el image processor incluido en el modelo (redimensionado y normalización a 224x224).
- Ejecución en CPU o GPU seleccionable mediante el parámetro `device` del pipeline.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No ofrece categorías detalladas de contenido ni justificación de la decisión; solo la etiqueta binaria y su probabilidad.
- Capacidades multilingües: no aplica (la salida son dos etiquetas en inglés).

## Casos de uso

- Pre-filtrado de subidas de usuarios: clasificar cada imagen antes de almacenarla o publicarla, descartando o enviando a revisión las que superen un umbral de probabilidad para `nsfw`. Es adecuado porque la inferencia es de coste bajo (86,7 M de parámetros) y la decisión es binaria.
- Limpieza de datasets de entrenamiento: recorrer un corpus de imágenes (por ejemplo, scrapes de redes sociales o bancos de imágenes) y separar las muestras no aptas antes de etiquetarlas o entrenar con ellas.
- Moderación en foros y comunidades: actuar como primera barrera automática en sistemas de contenido generado por usuarios, dejando la decisión final a moderadores humanos cuando la probabilidad esté en una zona ambigua.
- Etapa previa a un clasificador más fino: usar MISN-1.0 para descartar rápidamente el grueso de imágenes limpias y reservar modelos más caros (o revisión humana) para los casos dudosos.
- Moderación de comentarios con imagen adjunta: en plataformas donde los usuarios pueden adjuntar capturas o fotos, clasificar el adjunto antes de renderizarlo en el hilo.
- Control de calidad en herramientas de generación de imágenes: filtrar salidas de un generador antes de mostrarlas al usuario o de almacenarlas en una galería pública.
- Auditoría retrospectiva de contenido ya publicado: reescanear catálogos históricos para detectar material que no pasó los filtros en su momento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card de aksern/misn-1.0 no incluye métricas de precisión, recall, F1, AUC ni matrices de confusión, ni comparaciones cuantitativas con otros clasificadores de NSFW. Tampoco se proporcionan mediciones de latencia o throughput. Cualquier cifra de rendimiento que se quiera usar para decidir el despliegue debe obtenerse evaluando el modelo sobre un conjunto de validación propio y representativo del dominio de aplicación.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (FP32), aproximadamente 350 MB de pesos más el coste de activaciones de un forward sobre una imagen de 224x224; en FP16, alrededor de 175 MB de pesos. Son estimaciones a partir de los 86,7 M de parámetros, no mediciones publicadas.
- GPU recomendadas: prácticamente cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente, incluidas tarjetas integradas modestas. No requiere A100, H100 ni similares.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier RTX (incluidas series 20, 30 y 40), GTX con suficiente VRAM y en la mayoría de iGPU modernas.
- También es viable en CPU para volúmenes moderados de imágenes, dado el tamaño reducido del modelo.
- Opciones de despliegue: pipeline `image-classification` de Transformers (CPU o GPU); el modelo es exportable a otros runtimes (por ejemplo ONNX) al ser una arquitectura Swin estándar, aunque no se documentan exportaciones oficiales. No hay versiones GGUF ni integración declarada con Ollama o llama.cpp, que no aplican a este tipo de modelo. Para servir en producción, frameworks como TorchServe, Triton o un servicio FastAPI con `transformers` son alternativas razonables.
- Latencia y throughput: no disponibles en la información proporcionada. Con 86,7 M de parámetros y entradas de 224x224 se espera un coste por imagen bajo en GPU, pero no hay cifras publicadas que lo respalden.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos, por lo que la comparación se limita a lo que puede afirmarse sin inventar cifras.

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| aksern/misn-1.0 | Swin Transformer Base | 86,7 M | 224x224 px | OpenMDW 1.1 | no disponible |
| Falconsai/nsfw_image_detection | Vision Transformer (ViT) ajustado | no disponible | no disponible | no disponible | no disponible |
| Clasificadores NSFW de LAION | basados en CLIP | no disponible | no disponible | no disponible | no disponible |
| Filtros heurísticos / APIs comerciales de moderación | no aplica | no aplica | no disponible | propietaria | no disponible |

Como referencia cualitativa, la categoría de clasificadores NSFW de imagen suele apoyarse en backbones ViT o CLIP ajustados sobre conjuntos de datos de decenas o cientos de miles de imágenes, muy por encima de las 2.500 imágenes fuente de MISN-1.0. Esa diferencia de escala es el principal punto débil del modelo aquí descrito frente a alternativas más establecidas, aunque no se dispone de métricas que permitan cuantificar la brecha.

## Limitaciones y advertencias

- Tamaño del dataset: el ajuste parte de unas 2.500 imágenes originales. El aumento de datos hasta unas 5.000 muestras por clase no añade información nueva, solo variaciones, por lo que la generalización puede ser desigual.
- Domain shift: el rendimiento puede degradarse con estilos artísticos poco habituales, imágenes muy editadas, baja resolución, capturas de pantalla, recortes extremos, iluminación atípica o imágenes sintéticas y generadas.
- Clasificación estrictamente binaria: no distingue categorías de contenido ni explica el motivo de la clasificación. No sirve para políticas de moderación que exijan granularidad.
- Falsos positivos y falsos negativos: el modelo puede marcar imágenes limpias como NSFW y viceversa. La puntuación de confianza no es una garantía de corrección.
- Sesgos: los datasets de moderación heredan sesgos de su fuente, del proceso de etiquetado, de la distribución de clases y de la estrategia de aumento. El autor recomienda evaluar el modelo sobre datos representativos del caso de uso concreto antes de ponerlo en producción.
- Uso previsto: el propio autor lo define como ayuda a la moderación, no como sistema único de decisión en aplicaciones de alto impacto. Para consecuencias graves, debe combinarse con revisión humana u otros mecanismos.
- Licencia: OpenMDW 1.1. Conviene revisar los términos completos del repositorio antes de un uso comercial, ya que esta ficha no los reproduce íntegramente.
- Adopción: 0 descargas y 0 likes en el momento de redactar la ficha implican una comunidad de usuarios inexistente y ausencia de validación externa independiente.
- Umbral de decisión: en producción es preferible fijar un umbral de probabilidad propio en lugar de tomar siempre la clase con mayor puntuación, algo que la model card señala explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aksern/misn-1.0
- Modelo base: https://huggingface.co/microsoft/swin-base-patch4-window7-224
- Dataset de ajuste: https://huggingface.co/datasets/akaruineko/pinterest-4k
- Paper del Swin Transformer (referencia de la arquitectura base): https://arxiv.org/abs/2103.14030
- Repositorio oficial de Swin Transformer de Microsoft: https://github.com/microsoft/Swin-Transformer

Nota: la búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces obtenidos correspondían a servicios de traducción inglés-tagalo sin relación con MISN-1.0, por lo que se han omitido.
