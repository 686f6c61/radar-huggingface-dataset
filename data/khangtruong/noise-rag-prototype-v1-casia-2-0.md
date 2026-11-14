# KhangTruong/noise-rag-prototype-v1-Casia-2.0

## Resumen

`noise-rag-prototype-v1-Casia-2.0` es un checkpoint de segmentación de imágenes orientado a la detección de imágenes sintéticas y manipuladas (synthetic-image-detection, diffusion-detection), publicado por el usuario KhangTruong en Hugging Face. Se distribuye bajo licencia Apache 2.0 y utiliza la librería `sid-unet`, con pipeline declarado `image-segmentation`. El repositorio ocupa 0,4 GB y acumula 8 descargas y 0 likes en el momento de la consulta.

El modelo se presenta como un prototipo de investigación (`prototype-v1`) dentro de un pipeline denominado "noise-rag", y su model card documenta una evaluación cruzada sobre el protocolo `MVSS-v1-protocol` con el dataset `KhangTruong/Tampered-Images-Combined-Dataset-Fake`, que agrupa subconjuntos como CASIA_V1, CASIA_V2, COCO_Inpaint, CocoGlide, Columbia_Gray, Coverage, HiFi_IFDL, IMD2020, IMD2020_RealLife, NIST16 y OpenSDID_Flux.1, entre otros.

Es relevante ahora porque aborda una tarea en auge: localizar a nivel de píxel las regiones generadas o manipuladas en una imagen, una capacidad útil para verificación de contenido, moderación y análisis forense digital. No obstante, los resultados publicados son propios de un prototipo con solo 2 épocas de entrenamiento y métricas de solapamiento bajas, por lo que debe interpretarse como un artefacto experimental y no como un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SID-UNet (según la etiqueta `sid-unet` y la librería declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el checkpoint se referencia como `checkpoint_best.pt`, formato PyTorch) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en SID-UNet, una arquitectura de segmentación de imágenes del linaje U-Net, implementada en PyTorch y empaquetada bajo la librería `sid-unet`. El pipeline declarado es `image-segmentation`, y las etiquetas del repositorio apuntan a dos tareas: detección de imágenes sintéticas (`synthetic-image-detection`) y detección de difusión (`diffusion-detection`). No se detalla en la información proporcionada el número de parámetros, la composición exacta del dataset de entrenamiento, el número de tokens o muestras vistas, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí documenta la model card es el proceso de evaluación: se entrenó durante 2 épocas, con una mejor puntuación de validación de 0,09853176049714343 en la época 2, y se evaluó de forma cruzada sobre el protocolo `MVSS-v1-protocol` con un total de 17.929 muestras. El checkpoint activo es `v1` y la ruta interna del mejor checkpoint es `outputs/RUN/default/checkpoints/checkpoint_best.pt`. No se describen innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Segmentación de imágenes a nivel de píxel para localizar regiones manipuladas o generadas artificialmente.
- Detección de imágenes sintéticas y de contenido producido por modelos de difusión (etiquetas `synthetic-image-detection` y `diffusion-detection`).
- Producción de máscaras de segmentación evaluables con métricas de solapamiento (IoU, Dice/F1), AUROC a nivel de píxel y precisión de píxel.
- Evaluación sobre múltiples subconjuntos forenses: CASIA_V1, CASIA_V2, COCO_Inpaint, CocoGlide, Columbia_Gray, Coverage, HiFi_IFDL, IMD2020, IMD2020_RealLife, NIST16 y OpenSDID_Flux.1.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica (modelo de visión; los idiomas figuran como no disponibles).
- Capacidades especiales (thinking mode, visión, audio): únicamente visión, orientada a segmentación forense.

## Casos de uso

- Verificación de contenido en plataformas: el modelo puede generar una máscara de las regiones sospechosas de una imagen subida por un usuario, lo que permite a moderadores revisar solo las zonas marcadas en lugar de la imagen completa; es adecuado por su salida a nivel de píxel, aunque sus métricas actuales exigen supervisión humana.
- Análisis forense digital: un perito puede usar las máscaras como pista inicial para localizar injertos o regiones inpintadas en una imagen peritada, apoyándose en los subconjuntos CASIA e IMD2020 sobre los que el modelo muestra mayor recall relativo.
- Investigación en detección de deepfakes y difusión: sirve como línea base reproducible para comparar nuevas arquitecturas de segmentación forense, dado que la model card publica matrices de evaluación cruzada con métricas detalladas por subconjunto.
- Construcción de datasets aumentados: las predicciones del modelo pueden emplearse para preetiquetar regiones manipuladas y acelerar el etiquetado humano en la creación de nuevos corpus de imágenes falsas.
- Detección de inpainting en imágenes de producto o inmobiliarias: permite señalar zonas retocadas digitalmente en anuncios, un caso donde la localización espacial aporta más valor que una simple clasificación binaria.
- Filtrado previo en pipelines de moderación a gran escala: al ser un modelo pequeño (repositorio de 0,4 GB) y con licencia Apache 2.0, puede desplegarse como primer filtro barato antes de modelos más costosos, siempre que se acepte su actual nivel de precisión.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la evaluación cruzada del checkpoint `noise_rag_prototype_v1` sobre el protocolo `eval_mvss_v1_protocol` (dataset `KhangTruong/Tampered-Images-Combined-Dataset-Fake`, 17.929 muestras):

| Metrica | Valor |
|---|---|
| Loss total | 1,0919 |
| Mean IoU | 0,1236 |
| Dice / Pixel F1 | 0,1881 |
| AUROC (pixel-level) | 0,5465 |
| Pixel Accuracy | 0,7391 |
| Precision | 0,2093 |
| Recall | 0,3375 |
| Specificity | 0,7930 |
| Class Accuracy | 0,0010 |

Desglose por subconjunto (IoU / Dice / AUROC / Pixel Acc):

| Sub-dataset | IoU | Dice / F1 | AUROC | Pixel Acc | Muestras |
|---|---|---|---|---|---|
| CASIA_V1 | 0,1405 | 0,2176 | 0,5993 | 0,6609 | 920 |
| CASIA_V2 | 0,2406 | 0,3413 | 0,6654 | 0,7648 | 1000 |
| COCO_Inpaint | 0,0275 | 0,0501 | 0,4901 | 0,7731 | 2000 |
| CocoGlide | 0,1885 | 0,2881 | 0,5925 | 0,7129 | 507 |
| Columbia_Gray | 0,1558 | 0,2421 | 0,5431 | 0,7105 | 180 |
| Coverage | 0,1084 | 0,1804 | 0,5635 | 0,7799 | 100 |
| HiFi_IFDL | 0,2630 | 0,3695 | 0,6171 | 0,6414 | 2000 |
| IMD2020 | 0,0208 | 0,0392 | 0,5473 | 0,7801 | 2000 |
| IMD2020_RealLife | 0,1369 | 0,2132 | 0,6339 | 0,8200 | 1000 |
| NIST16 | 0,1597 | 0,2355 | 0,3538 | 0,2480 | 220 |
| OpenSDID_Flux.1 | 0,1149 | 0,1843 | 0,5530 | 0,7453 | no disponible en el extracto |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,4 GB, lo que sugiere un modelo compacto apto para GPUs de gama media, pero no se confirma el tamaño de los pesos.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probablemente sí dado el tamaño del repositorio, aunque no se confirma ni se especifica qué modelos concretos.
- Opciones de despliegue: el checkpoint se distribuye en formato PyTorch (`checkpoint_best.pt`) y depende de la librería `sid-unet`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este caso).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada; la model card no incluye comparaciones con otras arquitecturas de segmentación forense ni con detectores de imágenes sintéticas de referencia.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| noise-rag-prototype-v1-Casia-2.0 | no disponible | no aplica | IoU 0,1236 / Dice 0,1881 / AUROC 0,5465 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Se trata de un prototipo entrenado solo 2 épocas, con una mejor puntuación de validación de 0,0985; no debe considerarse un modelo maduro ni listo para producción.
- Las métricas de solapamiento son bajas: IoU global de 0,1236 y Dice de 0,1881, con una precision de 0,2093 y un class accuracy de 0,0010, lo que indica una localización muy imprecisa de las regiones manipuladas.
- El AUROC a nivel de píxel (0,5465) está muy próximo al azar (0,5), por lo que la capacidad discriminativa es limitada.
- El rendimiento es muy desigual entre subconjuntos: destaca relativamente en HiFi_IFDL (IoU 0,2630) y CASIA_V2 (IoU 0,2406), pero es casi nulo en IMD2020 (IoU 0,0208) y COCO_Inpaint (IoU 0,0275).
- En NIST16 la precisión de píxel cae a 0,2480, muy por debajo de la media, lo que sugiere un mal comportamiento en ese tipo de manipulación.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma (es un modelo de visión).
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental del modelo desaconseja su uso en decisiones automatizadas sin revisión humana.
- No se especifican los datos exactos de entrenamiento ni posibles solapamientos entre entrenamiento y evaluación, lo que impide descartar fuga de información en las métricas publicadas.
- El número de descargas (8) y de likes (0) refleja una adopción prácticamente nula; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/KhangTruong/noise-rag-prototype-v1-Casia-2.0
- Dataset de evaluación: https://huggingface.co/datasets/KhangTruong/Tampered-Images-Combined-Dataset-Fake
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
