# dronefreak/co-dino-5scale-vit-l-coco-instance

## Resumen

Co-DINO 5-scale ViT-L es un checkpoint de detección de objetos e instancias basado en Co-DETR, la arquitectura presentada en ICCV 2023 por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab). El modelo combina un backbone ViT-L de tipo EVA-02 (304M de parámetros) con una cabecera Co-DINO de cinco escalas, y fue preentrenado sobre Objects365 y afinado después sobre COCO. El repositorio lo publica el usuario dronefreak como espejo del checkpoint original de los autores, añadiendo el fichero de configuración que el release original no incluía.

El problema que resuelve es el de la detección y segmentación de instancias de vocabulario cerrado sobre las 80 clases de COCO, con un box AP reportado de 65,8 y un mask AP reportado de 56,6. Es relevante para quien necesite un detector de alta precisión con máscaras de instancia y pueda asumir el coste de un stack OpenMMLab 1.x, puesto que no es un modelo ejecutable con `transformers` ni con inferencia estándar de PyTorch.

La huella de inferencia declarada es de 352,6M de parámetros y el repositorio ocupa 3,1 GB. No es un modelo generativo ni conversacional: es un detector de visión con vocabulario fijo y etiquetas en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Co-DETR (cabecera Co-DINO) con backbone ViT-L EVA-02 y extracción de características a 5 escalas |
| Parámetros totales | 304M en el backbone ViT-L (EVA-02); 352,6M medidos en inferencia |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin ventana de contexto de texto) |
| Tipos de cuantización | no disponible (solo se distribuye el checkpoint PyTorch en precisión de entrenamiento) |
| Idiomas soportados | metadato de la model card: en (el modelo es de visión; las clases corresponden a las 80 categorías de COCO, etiquetadas en inglés) |
| Licencia | unknown; la model card indica que la licencia de los pesos está sin determinar y que el preentrenamiento con Objects365 es research-only |
| Formato de pesos | checkpoint PyTorch `.pth` más fichero de configuración `.py` de MMDetection; tamaño del repositorio 3,1 GB |

## Arquitectura y entrenamiento

Co-DETR es una familia de detectores DETR que introduce asignaciones híbridas colaborativas durante el entrenamiento: además de la asignación uno-a-uno propia de DETR, se añaden cabeceras auxiliares con asignación uno-a-muchos (estilo ATSS) cuyas propuestas se reutilizan como supervisión adicional para las queries. Este checkpoint emplea la variante Co-DINO, es decir, con la cabecera DINO, y un backbone ViT-L EVA-02 de 304M de parámetros con extracción de características a cinco escalas. El modelo incorpora además una rama de máscaras para segmentación de instancias, de ahí que la pipeline declarada en el Hub sea `image-segmentation` y que la model card reporte tanto box AP como mask AP.

El esquema de entrenamiento indicado es preentrenamiento sobre Objects365 seguido de afinado sobre COCO. No se detallan en la información disponible el número de tokens de imagen, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables a un detector). La inferencia requiere el código del proyecto Co-DETR y el stack OpenMMLab 1.x, concretamente MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11, según la quickstart de la model card.

## Capacidades

- Detección de objetos con cajas delimitadoras sobre las 80 clases de COCO.
- Segmentación de instancias, con máscaras por objeto (mask AP reportado de 56,6).
- Predicción a cinco escalas, orientada a objetos de tamaños muy distintos dentro de la misma imagen.
- Inferencia sobre imagen suelta, carpeta de imágenes, vídeo y webcam mediante el script `tools/inference.py` del fork mantenido.
- Exportación de resultados en JSON con la opción `--save-json`, útil para pipelines de posprocesado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No admite prompts en lenguaje natural ni detección zero-shot de clases arbitrarias: el vocabulario es cerrado (80 clases COCO).
- No tiene modo thinking, ni capacidades de audio, ni generación de texto.

## Casos de uso

- Análisis de vídeo de dashcam y tráfico: la propia model card incluye un montaje de demostración con dos clips de salpicadero, de modo que el modelo está pensado para detectar vehículos, peatones y señalización sobre secuencias de vídeo mediante `tools/inference.py`.
- Preetiquetado automático para anotación: al generar cajas y máscaras en JSON, puede usarse como primer paso de un pipeline de etiquetado humano, reduciendo el coste de anotar grandes volúmenes de imágenes y dejando al anotador solo la revisión.
- Conteo de personas y control de aforo: las clases persona y los objetos de contexto de COCO permiten conteos sobre imágenes o fotogramas muestreados, con la ventaja de que la rama de máscaras separa instancias solapadas.
- Inventario y análisis de estanterías: las clases de producto genéricas de COCO (botella, taza, libro, bolso, etc.) permiten construir un prototipo de recuento y localización de artículos sin reentrenamiento.
- Segmentación de instancias para edición fotográfica: la rama de máscaras permite recortes por objeto para herramientas de retoque, sustitución de fondos o generación de máscaras de composición.
- Investigación en detección de objetos: sirve como baseline fuerte de la familia DETR sobre COCO val2017 con el que comparar variantes de backbone, esquemas de asignación o estrategias de aumento de datos.
- Percepción para robótica o vehículos a escala de laboratorio: con las clases de COCO se pueden prototipar tareas de manipulación y navegación indoor, asumiendo que el vocabulario es cerrado y que hará falta afinado para dominios específicos.
- Auditoría y moderación de contenido visual: la detección de personas y de determinados objetos permite construir filtros previos en plataformas de contenido, combinados con un clasificador específico posterior.

## Benchmarks y rendimiento

Resultados declarados por los autores del modelo y recogidos en la model card. El box AP figura en el `model-index` del repositorio con `verified: false`; el mask AP aparece en la insignia de la model card y no está incluido en el `model-index`.

| Dataset | Métrica | Valor | Verificado |
|---|---|---|---|
| COCO 2017 val (val2017) | box AP | 65,8 | no |
| COCO 2017 val | mask AP | 56,6 | no |

No se han publicado en la información disponible otros resultados de benchmarks (por ejemplo, desglose por tamaño de objeto, AP50, AP75 o comparativas con otros detectores).

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 1,41 GB en fp32 y 0,71 GB en fp16 para los 352,6M de parámetros. El checkpoint distribuido ocupa parte de los 3,1 GB del repositorio.
- Memoria total estimada: los pesos no son el factor limitante; lo son las activaciones de un backbone ViT-L con características a cinco escalas y atención deformable multi-escala. Como estimación orientativa, entre 8 y 16 GB de VRAM para inferencia a resolución tipo COCO (aproximadamente 1333×800) y lote pequeño, creciendo con la resolución de entrada y el tamaño de lote.
- GPU recomendadas: A100 o H100 para lotes grandes y resoluciones altas; RTX 3090, 4090 o equivalentes de 24 GB para inferencia interactiva y vídeo. Una GPU de 8 GB puede quedarse corta según la resolución configurada.
- Cabe en GPU de consumo: sí, previsiblemente a partir de 16-24 GB de VRAM en configuraciones estándar, sujeto al ajuste de resolución y lote.
- Despliegue: el camino soportado es MMDetection 2.25.3 con MMCV-full 1.5.0 y PyTorch 1.11, usando el script `tools/inference.py` del fork `dronefreak/Co-DETR`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (dronefreak/co-dino-5scale-vit-l-coco-instance) | 352,6M en inferencia; backbone ViT-L de 304M | imagen; 5 escalas; vocabulario de 80 clases COCO | box AP 65,8 (no verificado); mask AP 56,6 (no verificado) | unknown | espejo en Hugging Face con configuración incluida |
| zongzhuofan/co-detr-vit-large-coco-instance (upstream) | mismos pesos | idéntico | mismos resultados declarados | no disponible | repositorio oficial del autor, sin fichero de configuración |
| Otras variantes de Co-DETR con otros backbones | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Otros detectores DETR de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Licencia indeterminada: la model card indica explícitamente que la licencia de los pesos está sin determinar. No debería usarse en producción comercial sin aclarar antes la situación legal con los autores originales.
- El preentrenamiento con Objects365 está marcado como research-only, lo que añade una restricción adicional al uso comercial.
- Vocabulario cerrado: solo detecta las 80 clases de COCO. No detecta categorías fuera de ese conjunto ni admite prompts de texto para clases nuevas.
- Las etiquetas y nombres de clase están en inglés.
- Riesgo de falsos positivos: como cualquier detector, puede generar cajas y máscaras espurias, especialmente con umbrales de confianza bajos o en dominios alejados de COCO.
- No hay información sobre sesgos demográficos, geográficos o de iluminación en la documentación disponible. El comportamiento en imágenes de dominios muy distintos (médicas, satelitales, industriales) no está verificado.
- Los resultados de box AP y mask AP proceden de los autores originales y no están verificados de forma independiente según el propio `model-index`.
- Dependencia de un stack antiguo: MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11. Esto complica el mantenimiento, la integración con entornos modernos y la portabilidad a otras GPU o versiones de CUDA.
- El repositorio es un espejo no oficial. El autor del espejo se compromete a transferirlo o retirarlo a petición de los autores originales, por lo que la disponibilidad a largo plazo no está garantizada.
- El metadato `inference: false` de la model card indica que no está pensado para el widget de inferencia del Hub.
- El modelo no es generativo ni conversacional; no debe evaluarse con criterios propios de modelos de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/co-dino-5scale-vit-l-coco-instance
- Checkpoint original de los autores: https://huggingface.co/zongzhuofan/co-detr-vit-large-coco-instance
- Repositorio oficial: https://github.com/Sense-X/Co-DETR
- Fork mantenido con el script de inferencia y el entorno: https://github.com/dronefreak/Co-DETR
- MMDetection 2.x: https://github.com/open-mmlab/mmdetection/tree/2.x
- Paper Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Paper COCO: https://arxiv.org/abs/1405.0312
- Paper EVA-02: https://arxiv.org/abs/2303.11331
- Dataset COCO en el Hub: https://huggingface.co/datasets/detection-datasets/coco
