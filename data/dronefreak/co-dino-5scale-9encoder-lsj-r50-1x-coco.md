# dronefreak/co-dino-5scale-9encoder-lsj-r50-1x-coco

## Resumen

El modelo `dronefreak/co-dino-5scale-9encoder-lsj-r50-1x-coco` es un checkpoint de detección de objetos basado en la arquitectura Co-DETR, concretamente una variante Co-DINO con backbone ResNet-50. Los autores originales son Zhuofan Zong, Guanglu Song y Yu Liu, del laboratorio SenseTime X-Lab, y presentaron el método en ICCV 2023. El repositorio publicado por "dronefreak" es un espejo no oficial del checkpoint que los autores originales distribuyeron en Google Drive; no aporta ninguna contribución al entrenamiento ni a la investigación.

El modelo resuelve el problema de detección de objetos en imágenes, devolviendo cajas delimitadoras y etiquetas para las 80 categorías del dataset COCO. Está diseñado para demostrar el esquema de entrenamiento Collaborative Hybrid Assignments Training, que acelera la convergencia de los DETR y mejora la calidad de las características del encoder. Con 52,8 millones de parámetros en inferencia y un entrenamiento de 12 épocas (esquema 1x) con aumento de datos LSJ, alcanza 52,6 puntos de AP en la partición de validación de COCO 2017.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DETR (Co-DINO) con backbone ResNet-50, 5 escalas de características, 9 capas de encoder y 3 capas de decoder. Cabezas auxiliares ATSS y RoI head durante el entrenamiento. |
| Parametros totales | 52,8 millones (según la tarjeta del modelo, en inferencia) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | en (etiqueta de metadata; no aplica como modelo de lenguaje) |
| Licencia | unknown (licencia de pesos indefinida) |
| Formato de pesos | .pth (checkpoint de PyTorch) junto con archivo .py de configuracion |

## Arquitectura y entrenamiento

Co-DETR no es una arquitectura completamente nueva, sino un esquema de entrenamiento aplicado sobre DETR/DINO. Junto al decoder que usa asignación húngara uno-a-uno, se añaden cabezas auxiliares de detección con asignación uno-a-muchos (una cabeza estilo ATSS y otra tipo Faster R-CNN con RoI head). Las propuestas positivas generadas por estas cabezas se realimentan al decoder como queries adicionales. Este proceso hace que el encoder aprenda características más discriminativas y reduce el tiempo de convergencia. Las cabezas auxiliares se utilizan solo durante el entrenamiento; en inferencia no están activas.

El entrenamiento se realiza sobre el dataset COCO 2017 y usa Large Scale Jitter (LSJ) como técnica de aumento de datos. El checkpoint concreto es la variante con ResNet-50, 5 escalas de mapa de características y 9 capas de encoder, entrenado durante 12 épocas (esquema 1x). No se dispone de información sobre el número total de imágenes, tokens ni sobre la aplicación de RLHF o DPO, al tratarse de un modelo de visión.

## Capacidades

- Detección de objetos genérica en imágenes, devolviendo cajas delimitadoras y etiquetas para las 80 categorías de COCO (personas, vehículos, animales, mobiliario, etc.).
- Procesamiento de imágenes individuales, carpetas completas, vídeos y capturas de webcam, según los scripts de inferencia incluidos en el repositorio.
- Generación de resultados en formato JSON si se activa la opción correspondiente en el script de inferencia.
- Robustez ante cambios de escala gracias al aumento de datos LSJ durante el entrenamiento.
- No admite tool calling, razonamiento multi-paso, agentes ni entrada de texto, al ser un modelo puramente visual.
- Capacidad multilingüe: no aplica, ya que el modelo no procesa lenguaje natural.

## Casos de uso

- Conducción asistida y análisis de dashcams: el modelo puede detectar vehículos, peatones y señales de tráfico en vídeos en tiempo real o clips grabados, como se muestra en las demos publicadas por el autor del repositorio.
- Vigilancia perimetral: integrado en un sistema de cámaras, permite detectar intrusiones de personas o vehículos en zonas restringidas y activar alertas automáticamente.
- Robótica móvil: la salida de cajas delimitadoras permite localizar obstáculos y objetos de interés para planificar rutas o manipulación básica, si se cuenta con calibración de cámaras.
- Control de calidad en producción: el modelo puede localizar defectos o componentes en imágenes de piezas, siempre que las categorías de interés estén dentro del vocabulario de COCO o se reentrene con datos propios.
- Automatización de inventario en retail: detectar productos en estanterías o lineales para comprobar existencias y generar recuentos automáticos.
- Moderación de contenido y búsqueda visual: indexar imágenes detectando objetos presentes para filtrar contenido no deseado o clasificar automáticamente material según los objetos que aparecen.

## Benchmarks y rendimiento

| Metric | Resultado |
|---|---|
| Box AP en COCO 2017 val (val2017) | 52,6 (según la tarjeta del modelo, sin verificar) |

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ya que se trata de un modelo de detección de objetos. Tampoco se incluyen comparaciones con otros modelos de la misma familia en la información proporcionada por el autor del repositorio.

## Requisitos de hardware

- La información proporcionada no incluye datos oficiales de VRAM, GPUs recomendadas ni latencia.
- El checkpoint en disco ocupa 0,8 GB, lo que sugiere que los pesos en FP32 ocupan aproximadamente 211 MB (basado en los 52,8 millones de parámetros). Es una estimación no confirmada.
- Dado el tamaño reducido del modelo, es plausible que pueda ejecutarse en GPUs de consumo como una RTX 3060 o 4070 para imágenes de 640x640, pero no hay datos oficiales que lo garanticen.
- No es un modelo compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere el ecosistema de OpenMMLab 1.x: MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11. El entorno puede montarse con el script `tools/setup_codetr_env.sh` del fork mantenido por el mismo autor del repositorio.
- Para cargar el modelo es necesario usar los scripts de inferencia del proyecto Co-DETR, no la API estándar de Hugging Face.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos entre este checkpoint y otros modelos de la misma categoría en la información proporcionada. El repositorio oficial de Sense-X incluye variantes de Co-DINO con backbones más grandes (Swin-L, ViT-L) que alcanzan rendimientos superiores en COCO test-dev, pero no se han incluido valores concretos para comparar con esta variante específica. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia de pesos indefinida (`unknown`); no se puede asumir que sea seguro para uso comercial sin aclarar los términos con los autores originales.
- El repositorio es un espejo no oficial y no está vinculado a los autores originales. La responsabilidad del mantenimiento y la integridad del checkpoint recae en un tercero.
- Para reproducir los resultados se requiere un entorno fijo y antiguo (PyTorch 1.11, MMDetection 2.25.3), lo que complica su integración en stacks modernos.
- El valor de 52,6 AP está marcado como `verified: false` en la tarjeta del modelo, por lo que conviene validar el checkpoint con datos propios antes de usarlo en producción.
- El modelo solo reconoce las 80 categorías de COCO. Para detectar objetos fuera de ese conjunto es necesario reentrenar o adaptar el modelo.
- Sesgos inherentes: el dataset COCO está sobre-representado en ciertos contextos geográficos y culturales, por lo que el rendimiento puede degradarse en escenarios distintos a los de entrenamiento.
- Riesgo de falsos positivos en escenas densas, con poca iluminación u oclusiones, al igual que otros detectores basados en DETR.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dronefreak/co-dino-5scale-9encoder-lsj-r50-1x-coco
- Paper de Co-DETR en arXiv: https://arxiv.org/abs/2211.12860
- Repositorio oficial de Sense-X: https://github.com/Sense-X/Co-DETR
- Fork mantenido por dronefreak: https://github.com/dronefreak/Co-DETR
- Documentación adicional de Co-DINO: https://deepwiki.com/Sense-X/Co-DETR/3.2-co-dino-models
- Archivo de configuración del modelo: https://huggingface.co/dronefreak/co-dino-5scale-9encoder-lsj-r50-1x-coco/resolve/main/co_dino_5scale_9encoder_lsj_r50_1x_coco.py
