# dronefreak/co-deformable-detr-swin-b-3x-coco

## Resumen

El modelo `dronefreak/co-deformable-detr-swin-b-3x-coco` es un detector de objetos basado en el esquema de entrenamiento Co-DETR (DETRs with Collaborative Hybrid Assignments Training), presentado en ICCV 2023 por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab). Este checkpoint concreto utiliza un backbone Swin-Base y sigue la variante Co-Deformable-DETR, entrenada durante 36 épocas (esquema 3x) sobre el dataset COCO 2017.

Co-DETR no es una arquitectura nueva, sino un marco de entrenamiento colaborativo: combina la asignación de etiquetas one-to-one del decoder de DETR (mediante matching húngaro) con cabezas auxiliares que usan asignación one-to-many (una head ATSS y una head RoI al estilo Faster R-CNN). Las propuestas positivas generadas por estas cabezas se inyectan como queries adicionales en el decoder, lo que mejora la discriminación de las características del encoder y acelera la convergencia. Durante la inferencia, las cabezas auxiliares se descartan, por lo que el modelo funciona como un Deformable-DETR estándar.

El checkpoint está alojado como un mirror no oficial, distribuido por `dronefreak` en HuggingFace, íntegro con el publicado originalmente por los autores en Google Drive. Según la model card, el modelo tiene 109,4 millones de parámetros en inferencia y obtiene 57,5 de AP en la validación de COCO 2017. Su relevancia radica en ser una implementación de alta precisión en detección de objetos con un tamaño razonable, aunque su uso requiere el stack de OpenMMLab 1.x (MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con atención deformable multi-escala (Deformable-DETR) y esquema de entrenamiento colaborativo Co-DETR; backbone Swin-Base |
| Parametros totales | 109,4 millones (según la model card, parámetros en inferencia) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de detección de objetos; no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión); la model card indica "en" como idioma de documentación |
| Licencia | Unknown (no determinada) |
| Formato de pesos | .pth (PyTorch) y archivo de configuración .py |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Deformable-DETR, que emplea atención deformable multi-escala tanto en el encoder como en el decoder, lo que reduce la complejidad computacional frente a la atención global y permite procesar múltiples resoluciones de características. El backbone Swin-Base es un transformer jerárquico con ventanas desplazadas, que proporciona representaciones espaciales ricas antes del encoder.

El entrenamiento sigue el esquema Co-DETR. Junto al decoder que utiliza matching húngaro one-to-one, se añaden cabezas auxiliares de detección con asignación one-to-many (una head ATSS y una head RoI al estilo Faster R-CNN). Estas cabezas generan propuestas positivas que se retroalimentan al decoder como queries extra, lo que permite que el encoder aprenda características más discriminativas. Las cabezas auxiliares se usan únicamente durante el entrenamiento; en inferencia no se ejecutan. El modelo se entrenó durante 36 épocas (3x) en el dataset COCO 2017. No se han encontrado datos sobre el número exacto de imágenes o técnicas de regularización como RLHF o DPO, que por ser un modelo de visión no aplican.

## Capacidades

- Detección de objetos de alta precisión con 80 clases de COCO (vehículos, personas, animales, objetos cotidianos, etc.).
- Genera cajas delimitadoras (bounding boxes) con puntuaciones de confianza, incluyendo soporte para detección de múltiples objetos por imagen.
- Utiliza atención deformable multi-escala, lo que le otorga capacidad para detectar objetos de tamaño muy variable en una misma imagen.
- No soporta generación de texto, razonamiento simbólico, código, matemáticas, tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente de visión.
- No dispone de capacidad de lenguaje, pensamiento o visión multimodal más allá de la detección de objetos.

## Casos de uso

- Flotas de transporte y conducción autónoma: puede integrarse en sistemas de visión a bordo (dashcam) para detectar vehículos, peatones, ciclistas y señales de tráfico en vídeo continuo, gracias a su alta precisión y a la atención multi-escala que captura objetos cercanos y lejanos.
- Vigilancia y seguridad perimetral: en cámaras fijas, el modelo puede detectar intrusiones, objetos abandonados o personas en zonas restringidas, generando eventos con cajas delimitadoras que alimentan sistemas de alerta.
- Inspección de calidad industrial: con un reentrenamiento en un dataset de defectos, puede detectar grietas, manchas o piezas mal alineadas en líneas de producción, aprovechando su backbone Swin-Base que procesa imágenes a distintas resoluciones.
- Agricultura de precisión: se puede adaptar para detectar frutos, plagas o malas hierbas en imágenes de campos o invernaderos, gracias a su capacidad para trabajar con imágenes aéreas o de dron.
- Automatización de etiquetado de datasets: como modelo preentrenado en COCO, es útil para preanotar grandes volúmenes de imágenes en herramientas de anotación humana, reduciendo el coste de generar datasets para tareas de detección personalizadas.
- Robótica de manipulación y navegación: puede servir para localizar objetos en escenas de trabajo (piezas, cajas, herramientas) y pasar las coordenadas a un sistema de control robótico, gracias a su equilibrio entre precisión y tamaño (109,4M de parámetros) que permite ejecutarlo en GPUs de gama media.

## Benchmarks y rendimiento

La informacion disponible incluye un unico resultado de evaluacion reportado por el autor del checkpoint (no verificado de forma independiente):

| Dataset | Metrica | Valor | Verificado |
|---|---|---|---|
| COCO 2017 val (split val2017) | box AP | 57,5 | No |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No se dispone de datos de throughput, latencia ni comparativas con otros detectores para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; al ser un checkpoint de 109,4M de parametros y algo menos de 0,5 GB, una GPU de consumidor con al menos 8 GB de VRAM probablemente sea suficiente, pero no hay cifras oficiales.
- Capacidad para ejecutarse en GPU de consumo: plausible, pero depende del entorno de inferencia y del tamaño de la imagen de entrada.
- Opciones de despliegue: no puede ejecutarse con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje. Requiere el codigo de Co-DETR y el stack de MMDetection 2.x. El autor recomienda el repositorio mantenido `dronefreak/Co-DETR`, que incluye un script `tools/setup_codetr_env.sh` para crear un entorno conda (`codetr`) con PyTorch 1.11, MMDetection 2.25.3 y MMCV-full 1.5.0. La inferencia se realiza con el script `tools/inference.py`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de modelos equivalentes que permitan una comparativa directa para este checkpoint (por ejemplo, Deformable-DETR con Swin-Base, Co-DETR con ResNet-50 o DINO). El paper original de Co-DETR compara el metodo frente a otros detectores, pero esos datos no se recogen aqui para esta variante especifica. Un checkpoint Co-DETR con backbone ViT-L, mencionado en el paper, alcanza 65,6/66,0 AP en COCO test-dev, pero no es comparable en parametros ni es este modelo.

## Limitaciones y advertencias

- Licencia sin determinar (unknown): el autor del mirror advierte explícitamente que el estado de licencia de los pesos no está resuelto. El checkpoint no es una publicación oficial y el mirror puede transferirse o eliminarse a petición de los autores originales, lo que introduce incertidumbre para su uso comercial.
- No es un modelo de la librería `transformers`: requiere el stack de OpenMMLab 1.x con versiones concretas (PyTorch 1.11, MMCV-full 1.5.0, MMDetection 2.25.3), lo que puede dificultar su integración en entornos modernos o en la nube.
- Sesgos de datos: al estar entrenado en COCO, el modelo hereda la distribución de 80 categorías de ese dataset, por lo que su comportamiento en dominios distintos (imágenes médicas, satelitales, videojuegos, etc.) puede degradarse notablemente.
- Riesgo de falsos positivos y falsos negativos: como cualquier detector, puede producir detecciones confusas, especialmente con objetos ocluidos, muy pequeños o fuera de las 80 clases de COCO.
- El rendimiento reportado (57,5 AP) no ha sido verificado de forma independiente en esta publicacion; solo se basa en la declaracion del autor en la model card.
- No soporta texto ni idiomas, por lo que no es utilizable en tareas de lenguaje o multimodalidad que requieran comprensión de lenguaje natural.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/dronefreak/co-deformable-detr-swin-b-3x-coco
- Paper original (ICCV 2023): https://arxiv.org/abs/2211.12860
- Repositorio oficial del proyecto: https://github.com/Sense-X/Co-DETR
- Fork mantenido con el entorno de inferencia: https://github.com/dronefreak/Co-DETR
