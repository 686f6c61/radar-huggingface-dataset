# KhangTruong/focal-v3-multitap-casia

## Resumen

focal-v3-multitap-casia es un modelo de segmentación de imágenes orientado a la detección de manipulaciones y de contenido generado por difusión. Lo publica el usuario KhangTruong en Hugging Face bajo licencia Apache 2.0 y se distribuye como un checkpoint de PyTorch para la librería `sid-unet`, con un tamaño de repositorio de 2,7 GB. El modelo resuelve una tarea de segmentación binaria a nivel de píxel: localizar las regiones de una imagen que han sido alteradas o sintetizadas, en lugar de limitarse a clasificar la imagen completa como real o falsa.

La información disponible es escasa en cuanto a arquitectura interna y datos de entrenamiento: la model card no detalla el número de parámetros, la longitud de contexto (no aplica a un modelo de visión) ni la composición del dataset de entrenamiento. Sí se publica una evaluación cruzada sobre el protocolo `eval_mvss_v1_protocol` con el conjunto `KhangTruong/Tampered-Images-Combined-Dataset-Fake`, que ofrece métricas desglosadas por subconjunto y permite hacerse una idea clara de su comportamiento real.

El interés del modelo radica en su especialización: obtiene resultados muy altos en datasets clásicos de manipulación (CASIA v1 y v2, Columbia Gray) pero cae drásticamente en conjuntos de inpainting modernos como COCO_Inpaint. Esta asimetría es relevante para quien evalúe su uso en producción, ya que delimita con precisión para qué sirve y para qué no.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SID-UNet (según la etiqueta `sid-unet` de la model card; no se detalla la topología interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, segmentación de imágenes) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, `checkpoint_best.pt`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card identifica el modelo como SID-UNet, una variante de arquitectura U-Net orientada a la detección de imágenes sintéticas (synthetic image detection) y de manipulación por difusión, según las etiquetas `synthetic-image-detection` y `diffusion-detection`. No se proporciona información sobre el número de parámetros, la profundidad de la red, los mecanismos de atención empleados ni las innovaciones concretas de la arquitectura. El checkpoint activo es la versión `v1`, entrenada durante 4 épocas, con una mejor puntuación de validación de 0,6320 en la época 4.

Tampoco se detallan los datos de entrenamiento: no se indica el número de imágenes, la composición del dataset, si hubo aumento de datos, ni si se aplicaron técnicas de ajuste fino supervisado o preferencias. El nombre del modelo sugiere un entrenamiento con foco en CASIA (por el sufijo `casia`) y una estrategia de múltiples taps (`multitap`), pero la model card no desarrolla estos términos. La evaluación se realiza contra el conjunto `KhangTruong/Tampered-Images-Combined-Dataset-Fake`, que agrupa varios subconjuntos de manipulación e inpainting.

## Capacidades

- Segmentación a nivel de píxel de regiones manipuladas o sintetizadas en imágenes.
- Detección de manipulaciones clásicas de tipo copy-move y splicing (buen rendimiento en CASIA v1/v2 y Columbia Gray).
- Detección de contenido generado o editado por difusión en algunos conjuntos (CocoGlide, Coverage, HiFi_IFDL), con rendimiento intermedio.
- Producción de mapas de probabilidad por píxel, lo que permite umbralizar y localizar la alteración, no solo clasificar la imagen.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente visual de segmentación.
- No dispone de capacidades multilingües, de audio ni de modo de razonamiento explícito.

## Casos de uso

- Verificación de autenticidad de documentos escaneados: el modelo puede localizar regiones alteradas en imágenes de documentos (sellos, firmas, campos numéricos) gracias a su alto IoU en manipulaciones de tipo splicing, como demuestra el 0,9543 en Columbia Gray.
- Moderación de contenido en plataformas: detección de imágenes editadas o generadas por difusión antes de su publicación, usando el mapa de píxeles para marcar las zonas sospechosas y no solo la imagen completa.
- Forense digital en entornos periciales: generación de mapas de calor de manipulación que un analista humano puede revisar, con una AUROC de píxel de 0,8248 en el protocolo MVSS-v1.
- Investigación en detección de deepfakes e inpainting: el modelo sirve como línea base reproducible para comparar nuevos métodos, dado que publica métricas desglosadas por subconjunto y un protocolo de evaluación concreto (`eval_mvss_v1_protocol`).
- Filtrado previo en pipelines de verificación de imágenes: como primera etapa de cribado que descarte imágenes limpias (alta especificidad de 0,9092) y derive las sospechosas a un revisor humano o a un modelo más costoso.
- Auditoría de datasets de imágenes: detección de muestras contaminadas con ediciones sintéticas en conjuntos de entrenamiento, usando el modelo para segmentar y marcar las regiones alteradas.
- Análisis de imágenes médicas o científicas: con cautela y validación previa, para localizar retoques en figuras de publicaciones; el rendimiento en dominios fuera de distribución no está documentado, por lo que requiere evaluación específica.

## Benchmarks y rendimiento

Resultados de la evaluación cruzada publicada en la model card sobre `eval_mvss_v1_protocol` (dataset `KhangTruong/Tampered-Images-Combined-Dataset-Fake`, 1676 muestras):

| Metrica | Valor |
|---|---|
| Loss | 0,5126 |
| Mean IoU | 0,4304 (IC 95 %: [0,4102; 0,4506], ±0,0202) |
| Dice / F1 | 0,4856 |
| AUROC (píxel) | 0,8248 |
| Pixel Accuracy | 0,8632 |
| Precision | 0,4967 |
| Recall | 0,5887 |
| Specificity | 0,9092 |

Desglose por subconjunto:

| Sub-dataset | IoU | Dice / F1 | AUROC | Pixel Acc | Precision | Recall | Specificity | Muestras |
|---|---|---|---|---|---|---|---|---|
| CASIA_V1 | 0,8537 | 0,9010 | 0,9954 | 0,9851 | 0,8779 | 0,9620 | 0,9871 | 120 |
| CASIA_V2 | 0,8712 | 0,9065 | 0,9906 | 0,9800 | 0,8991 | 0,9533 | 0,9885 | 120 |
| COCO_Inpaint | 0,0164 | 0,0300 | 0,5275 | 0,8615 | 0,0278 | 0,0911 | 0,8992 | 120 |
| CocoGlide | 0,4703 | 0,5489 | 0,8334 | 0,7920 | 0,6488 | 0,5644 | 0,9114 | 120 |
| Columbia_Gray | 0,9543 | 0,9685 | 0,9873 | 0,9845 | 0,9709 | 0,9662 | 0,9945 | 120 |
| Coverage | 0,5470 | 0,6310 | 0,9289 | 0,8988 | 0,5738 | 0,8199 | 0,9131 | 100 |
| HiFi_IFDL | 0,3973 | 0,4686 | 0,8130 | 0,7445 | 0,5256 | 0,6232 | 0,8334 | 120 |
| IMD2020 | 0,0395 | 0,0624 | 0,6689 | 0,8688 | 0,0411 | 0,2522 | 0,8769 | 120 |
| IMD2020_RealLife | 0,5255 | 0,6212 | 0,9693 | 0,9349 | 0,5625 | 0,9226 | 0,9407 | 120 |
| NIST16 | 0,4770 | 0,5473 | 0,8326 | 0,8554 | 0,5657 | 0,5809 | 0,9252 | no disponible |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2,7 GB, lo que da una cota superior del tamaño del checkpoint; el peso real del modelo puede ser menor.
- GPU recomendadas: no disponible. Al ser un U-Net de segmentación, es probable que quepa en GPU de consumo, pero no se confirma en la documentación.
- Cabe en GPU de consumo: no confirmado; por el tamaño del repositorio (2,7 GB) es plausible en tarjetas con 8 GB o más de VRAM, sujeto a verificación.
- Opciones de despliegue: PyTorch nativo con la librería `sid-unet`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de detección de manipulación en la información proporcionada. La model card solo evalúa este checkpoint contra sí mismo en un único protocolo, por lo que no es posible establecer una comparativa rigurosa con alternativas como ManTra-Net, SPAN o Noiseprint sin datos adicionales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| focal-v3-multitap-casia | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy desigual: el IoU cae a 0,0164 en COCO_Inpaint y a 0,0395 en IMD2020, lo que indica que el modelo no generaliza bien a manipulaciones por inpainting moderno. No debe usarse como detector universal.
- Precisión baja a nivel global (0,4967): aproximadamente la mitad de los píxeles marcados como manipulados son falsos positivos, lo que puede generar ruido en aplicaciones de producción.
- Entrenamiento muy corto (4 épocas) y una única versión publicada; no hay evidencia de convergencia ni de estabilidad más allá de la mejor puntuación de validación de 0,6320.
- Sin información sobre sesgos: no se documenta la composición del dataset de entrenamiento ni posibles sesgos por tipo de imagen, resolución o dominio.
- Riesgo de alucinación en el sentido de falsos positivos en regiones con texturas complejas o compresión JPEG; la especificidad de 0,9092 sugiere que el modelo tiende a marcar de más en algunos subconjuntos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación sobre el entrenamiento hace recomendable una validación específica antes de desplegarlo en producción.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; cualquier uso debe ser mediante la API de segmentación de `sid-unet`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/KhangTruong/focal-v3-multitap-casia
- Dataset de evaluación: https://huggingface.co/datasets/KhangTruong/Tampered-Images-Combined-Dataset-Fake
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
