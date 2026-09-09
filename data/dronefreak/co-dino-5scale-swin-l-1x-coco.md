# dronefreak/co-dino-5scale-swin-l-1x-coco

## Resumen

El modelo `dronefreak/co-dino-5scale-swin-l-1x-coco` es un checkpoint de detección de objetos basado en la arquitectura Co-DINO, que combina el esquema de entrenamiento colaborativo híbrido de Co-DETR con el detector DINO. Aunque la entrada en HuggingFace está publicada por el usuario `dronefreak`, los pesos son un espejo de un checkpoint original de los autores de Co-DETR (Zhuofan Zong, Guanglu Song y Yu Liu, de SenseTime X-Lab). Se trata de un modelo de visión por computador, no un modelo de lenguaje, y su propósito es detectar objetos de las 80 categorías del dataset COCO. El valor principal de este repo es que ofrece un acceso estable a un checkpoint que originalmente se distribuía mediante una carpeta compartida de Google Drive, con su fichero de configuración y un hash de verificación. En la inferencia, el modelo alcanza un box AP de 58,9 en COCO 2017 val. Requiere el stack de OpenMMLab 1.x (MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11), por lo que no funciona directamente con la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DINO (transformer encoder-decoder con asignaciones colaborativas híbridas de Co-DETR), backbone Swin-Large, 5 escalas |
| Parámetros totales | 219,2 millones (según el autor, en inferencia) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, no procesa texto) |
| Tipos de cuantización | No disponible (no se ofrecen pesos cuantizados) |
| Idiomas soportados | No disponible (modelo de visión; la model card indica `en` como etiqueta) |
| Licencia | unknown (pesos de licencia no determinada) |
| Formato de pesos | PyTorch (.pth) y fichero de configuración (.py) |

## Arquitectura y entrenamiento

Co-DINO es una extensión de DINO (DETR with Improved deNoising anchOr boxes) que incorpora el esquema de entrenamiento colaborativo híbrido de Co-DETR. El modelo usa un backbone Swin-Large y una cabeza de detección basada en transformer de 5 escalas. Durante el entrenamiento, se añaden cabezas auxiliares con asignación one-to-many (ATSS y una cabeza RoI estilo Faster R-CNN) junto con la asignación one-to-one del decodificador DETR; las propuestas positivas de estas cabezas se realimentan al decodificador como consultas adicionales. Esto mejora la discriminatividad de las características del codificador y acelera la convergencia. Las cabezas auxiliares solo se usan en entrenamiento: este checkpoint tiene `eval_module='detr'`, por lo que en inferencia solo se ejecuta el decodificador Co-DINO. El entrenamiento duró 12 épocas (schedule 1x) y se realizó con el dataset COCO. No se ha especificado el número de tokens ni procesos de RLHF/DPO (no aplican al ser un modelo de visión). El repo es un espejo de los pesos publicados por los autores, no una contribución original.

## Capacidades

- Detección de objetos de ámbito general en las 80 clases del dataset COCO (personas, vehículos, animales, objetos cotidianos).
- Inferencia sobre imágenes individuales, carpetas de imágenes, vídeos y webcam mediante el script `tools/inference.py`.
- Soporte de detección multi-escala (5 escalas) y asignación de consultas con de-noising, lo que permite localizar objetos de tamaño variable.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es un modelo exclusivamente de visión.
- No ofrece soporte multilingüe en el sentido de procesamiento de lenguaje; las etiquetas de clases son las de COCO (en inglés).
- Puede usarse dentro de pipelines de detección que consuman los resultados con formato JSON (`--save-json`).

## Casos de uso

- Videovigilancia y análisis de tráfico: el modelo puede detectar vehículos, personas y objetos en secuencias de vídeo generadas por cámaras fijas o dashcams. Gracias a su arquitectura DETR con 5 escalas, mantiene una detección robusta en escenas urbanas complejas, como muestra el demo del repo.
- Inspección industrial de defectos: se puede aplicar una etapa de fine-tuning del checkpoint sobre un dataset propio de defectos de fabricación (grietas, manchas, componentes mal alineados). La alta calidad del pre-entrenamiento en COCO y la arquitectura de consultas del decodificador facilitan el ajuste a categorías concretas.
- Conteo de personas en espacios concurridos: la detección directa de personas permite calcular la ocupación en tiendas, estaciones o auditorios. El soporte de inferencia en vídeo y webcam hace posible un sistema en tiempo real con una GPU adecuada.
- Anotación automática de datasets para coches autónomos: se puede utilizar para pre-etiquetar miles de fotogramas con bounding boxes, reduciendo el coste de anotación manual. La salida JSON (`--save-json`) se integra fácilmente en herramientas de etiquetado o formatos COCO.
- Investigación académica en detección: el checkpoint sirve como baseline para evaluar técnicas de entrenamiento colaborativo o para reproducir experimentos del paper de Co-DETR. Al ser un espejo con checksum y configuración fija, facilita la reproducibilidad.
- Sistemas de seguridad perimetral: la detección de intrusos u objetos abandonados en grabaciones de seguridad se puede implementar combinando este modelo con una lógica de seguimiento temporal. La licencia, sin embargo, debe revisarse antes de un uso comercial.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Deteccion de objetos | COCO 2017 val (val2017) | box AP | 58,9 |

El valor está reportado por el autor del modelo index (no verificado). No se dispone en la información proporcionada de resultados de benchmarks adicionales ni comparaciones con otros modelos. En el repositorio oficial de Co-DETR se cita para Co-DINO con Swin-L un AP de 60,7, aunque no se especifica si corresponde a este mismo checkpoint con el mismo schedule de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada. La pila utilizada (PyTorch/MMDetection) funciona en GPU con CUDA, pero no se indica la VRAM mínima.
- No es un modelo de texto: las herramientas de despliegue para LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables.
- Despliegue local con el entorno de Co-DETR, que incluye MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11. El fork `dronefreak/Co-DETR` proporciona un script de instalación de una sola orden (`tools/setup_codetr_env.sh`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han proporcionado datos comparativos con otros modelos en la información disponible. Se puede señalar que pertenece a la familia de detectores basados en transformer (DETR, DINO, Co-DETR), pero no hay cifras de las demás variantes en la model card.

## Limitaciones y advertencias

- Este repositorio no es un release oficial; los autores originales (SenseTime X-Lab) no han revisado ni verificado el checkpoint.
- La licencia de los pesos es `unknown` / no determinada, lo que genera incertidumbre legal para su uso comercial. Es imprescindible contactar con los autores originales antes de desplegar el modelo en producción.
- No funciona directamente con `transformers`; requiere la pila de OpenMMLab 1.x, que es una dependencia pesada y con versiones específicas.
- Las descargas y los likes son 0, lo que puede indicar que el modelo no ha sido validado por la comunidad.
- El checkpoint está configurado para inferencia solo con el módulo `detr` (`eval_module='detr'`); las cabezas auxiliares de entrenamiento no están disponibles, por lo que no se puede reentrenar desde el mismo archivo sin modificar la configuración.
- Al ser un modelo de detección, no genera texto y no es apto para tareas de lenguaje; los falsos positivos y falsos negativos en imágenes inusuales son un riesgo inherente.
- El modelo fue entrenado en COCO, lo que implica un sesgo hacia imágenes de tipos escénicos y objetos de países occidentales; su rendimiento en otros dominios (industria, medicina, etc.) puede degradarse sin ajuste fino.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/dronefreak/co-dino-5scale-swin-l-1x-coco
- Paper de Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Paper de COCO: https://arxiv.org/abs/1405.0312
- Repositorio oficial de Co-DETR: https://github.com/Sense-X/Co-DETR
- Fork mantenido con entorno de instalación: https://github.com/dronefreak/Co-DETR
- Documentacion de DeepWiki sobre los modelos Co-DINO: https://deepwiki.com/Sense-X/Co-DETR/3.2-co-dino-models
