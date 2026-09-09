# dronefreak/co-dino-5scale-9encoder-lsj-r50-3x-coco

## Resumen

Co-DINO es un modelo de detección de objetos basado en la arquitectura DINO, entrenado con el esquema Co-DETR (Collaborative Hybrid Assignments Training), propuesto por investigadores de SenseTime X-Lab en ICCV 2023. Este checkpoint concreto, publicado por el usuario `dronefreak` como espejo de los pesos originales, utiliza un backbone ResNet-50 con LSJ (Large Scale Jittering), cinco escalas de características y nueve capas de encoder, y fue entrenado durante 36 épocas sobre el dataset COCO. El esquema Co-DETR adjunta cabezas auxiliares con asignación de etiquetas uno-a-muchos durante el entrenamiento, lo que mejora la convergencia y la discriminabilidad de las características, logrando 55.4 AP en COCO 2017 val.

El modelo es relevante porque combina el rendimiento de los detectores basados en DETR con la eficiencia de un backbone ResNet-50, lo que lo hace adecuado para tareas de detección donde se necesita una buena relación precisión/coste computacional. No es un modelo de lenguaje ni admite tool calling; se ejecuta mediante el stack de MMDetection 2.x. Es importante señalar que esta publicación en HuggingFace es un espejo no oficial del checkpoint distribuido originalmente en Google Drive por el equipo de SenseTime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DINO (DETR con entrenamiento colaborativo hibrido Co-DETR) con backbone ResNet-50 |
| Parametros totales | 52.8 millones (inferencia, segun la model card) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision; entrada de imagen) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (etiqueta en HuggingFace; el modelo es visual y no procesa texto) |
| Licencia | unknown (no determinada) |
| Formato de pesos | `.pth` (checkpoint PyTorch) + `.py` (configuracion) |

## Arquitectura y entrenamiento

Co-DETR es un esquema de entrenamiento, no una arquitectura nueva. Su funcionamiento consiste en añadir cabezas auxiliares que usan asignación de etiquetas uno-a-muchos (un head ATSS y un head RoI al estilo Faster R-CNN) junto al decoder DETR, que utiliza emparejamiento húngaro uno-a-uno. Las propuestas positivas generadas por esas cabezas se inyectan como consultas adicionales en el decoder, lo que fuerza al encoder a producir características más discriminativas y acelera la convergencia. Durante la inferencia, las cabezas auxiliares se descartan; solo queda el decoder DETR estándar con las consultas colaborativas.

Este checkpoint se apoya en la arquitectura DINO, que incorpora deNoising anchor boxes y una consulta de anchor mejorada. Concretamente, el modelo usa un backbone ResNet-50 con LSJ como aumentación de datos, extrae cinco escalas de características y tiene nueve capas de encoder. El entrenamiento se realizó sobre el dataset COCO (referenciado como `detection-datasets/coco`) durante 36 épocas (programa 3x). No se aplicó RLHF ni DPO, al tratarse de un modelo de visión no generativo de texto. Tampoco se emplean técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Detección de objetos de múltiples clases en imágenes, devolviendo cajas delimitadoras, etiquetas y puntuaciones de confianza.
- Soporte para objetos de distintos tamaños gracias a las cinco escalas de características y a la atención deformable multi-escala.
- Basado en DINO: utiliza consultas con deNoising anchor boxes, lo que mejora la precisión en la localización.
- Entrenado con el esquema Co-DETR: las características del encoder son más discriminativas, lo que se traduce en un mejor AP respecto a DINO estándar.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un detector de objetos, no un modelo de lenguaje.
- No tiene capacidades de visión-lenguaje multimodal (no genera descripciones de texto a partir de imágenes).
- Capacidades multilingües: no aplicable, ya que el modelo no procesa lenguaje natural.

## Casos de uso

- Videovigilancia y seguridad perimetral: se puede integrar en un pipeline de procesado de vídeo (por ejemplo, con el script `tools/inference.py` del fork mantenido) para identificar peatones, vehículos u objetos de interés. Su tamaño compacto (52.8 M) permite ejecutarlo a frecuencias aceptables en GPUs de gama media.
- Conducción autónoma y sistemas ADAS: el modelo puede detectar vehículos, peatones y señales de tráfico en secuencias de cámaras de salpicadero, como muestran los vídeos de demostración incluidos en la model card. La detección se puede integrar en un sistema de asistencia a la conducción.
- Inspección de calidad industrial: configurando el modelo con clases específicas del proceso, puede usarse para detectar defectos o piezas fuera de especificación en líneas de producción, gracias a su capacidad para trabajar a varias escalas.
- Anotación semiautomática de datasets: se puede utilizar para generar cajas y etiquetas preliminares en imágenes sin anotar, lo que acelera la creación de datasets de detección. La utilidad de inferencia permite guardar resultados en JSON (`--save-json`).
- Conteo y análisis de tráfico: en cámaras fijas, el modelo puede detectar y contar vehículos o personas, por ejemplo para estimar afluencia o gestionar semáforos.
- Detección de objetos en imágenes aéreas o de drones: con las cinco escalas de características, es capaz de detectar objetos pequeños en imágenes de alta resolución, como vehículos o estructuras en ortofotos.
- Investigación en detección de objetos: como referencia para comparar el esquema Co-DETR frente a otras variantes de DETR, o para reentrenar con datasets personalizados.

## Benchmarks y rendimiento

| Benchmark | Valor |
|---|---|
| COCO 2017 val (box AP) | 55.4 (declarado por el autor, no verificado) |

La información disponible no incluye más benchmarks oficiales de este checkpoint. Según la documentación de DeepWiki sobre el proyecto Co-DETR, las variantes Co-DINO de mayor tamaño alcanzan 66.0 AP en COCO test-dev, pero ese valor corresponde a otros checkpoints (probablemente con backbone ViT-L) y no a este modelo ResNet-50.

## Requisitos de hardware

- VRAM estimada: un checkpoint de 52.8 millones de parámetros en fp32 ocupa aproximadamente 210 MB. La VRAM de inferencia dependerá de la resolución de entrada y del tamaño del lote. Estimación orientativa: con imágenes de tamaño estándar (1333x800) y lote 1, entre 3 y 6 GB de VRAM. No se publican medidas oficiales en la model card.
- GPU recomendadas: cualquier GPU compatible con CUDA y PyTorch ≥1.11 con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 2060 o RTX 3060). La model card no especifica una GPU concreta.
- Sí cabe en GPU de consumo, dado su tamaño moderado. Sin embargo, requiere el stack OpenMMLab 1.x, no simplemente `transformers`.
- Opciones de despliegue: repositorio mantenido `dronefreak/Co-DETR` con el script `tools/inference.py`; también puede integrarse en pipelines de MMDetection 2.x. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al tratarse de un detector de visión que depende de MMDetection.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | COCO val AP | Licencia | Formato |
|---|---|---|---|---|---|
| Co-DINO R50 3x (este) | 52.8 M | Imagen (resolucion variable) | 55.4 (declarado) | unknown | `.pth` + `.py` |
| Co-DINO ViT-L (variante superior) | No disponible | Imagen (resolucion variable) | 66.0 en COCO test-dev (segun DeepWiki) | unknown | `.pth` |
| DINO R50 (original) | No disponible | Imagen (resolucion variable) | No disponible | Apache 2.0 (codigo) | `.pth` |

La información proporcionada no incluye benchmarks oficiales de otras variantes de DINO o Deformable DETR. El paper original de Co-DETR (arXiv:2211.12860) reporta mejoras sobre DINO y Deformable DETR, pero las cifras concretas no se han podido verificar con los datos de esta ficha.

## Limitaciones y advertencias

- Licencia de los pesos indeterminada (`unknown`): no se puede garantizar el uso comercial sin consultar a los autores originales (SenseTime X-Lab).
- No es una publicación oficial: es un espejo creado por `dronefreak`. Los autores originales son Zhuofan Zong, Guanglu Song y Yu Liu. El espejo puede transferirse o eliminarse a petición de los autores.
- Requiere una pila específica: MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11. Puede haber problemas de compatibilidad con versiones más modernas de PyTorch o `transformers`.
- No es un modelo de lenguaje: no puede generar texto, mantener conversaciones ni realizar razonamiento simbólico.
- Su vocabulario de clases está limitado a las 80 categorías de COCO. Para usarlo en otros dominios hay que reentrenar o ajustar el modelo.
- El valor de AP 55.4 es declarado por el autor del espejo, no verificado de forma independiente.
- Sesgos: no se ha realizado una evaluación de sesgos. COCO puede presentar desequilibrios en ciertas categorías, lo que podría afectar a los resultados en dominios diferentes al entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/dronefreak/co-dino-5scale-9encoder-lsj-r50-3x-coco
- Paper: https://arxiv.org/abs/2211.12860
- Repositorio oficial: https://github.com/Sense-X/Co-DETR
- Fork mantenido por el autor del mirror: https://github.com/dronefreak/Co-DETR
- Config del proyecto en el repositorio oficial: https://github.com/Sense-X/Co-DETR/tree/main/projects/configs/co_dino
- Documentación de DeepWiki: https://deepwiki.com/Sense-X/Co-DETR/3.2-co-dino-models
