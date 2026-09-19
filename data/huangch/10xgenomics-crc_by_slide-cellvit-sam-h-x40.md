# huangch/10xGenomics-CRC_BY_SLIDE-CellViT-SAM-H-x40

## Resumen

El modelo identificado como `huangch/10xGenomics-CRC_BY_SLIDE-CellViT-SAM-H-x40` es un checkpoint de segmentación celular en imágenes de patología computacional, publicado en HuggingFace por el usuario `huangch`. Por la nomenclatura del repositorio, corresponde a la familia CellViT-SAM, que combina el codificador de imagen ViT-H del Segment Anything Model (SAM) con el decodificador de CellViT para la detección y segmentación de núcleos celulares en cortes histológicos. El sufijo del nombre indica el conjunto de datos (10x Genomics, cáncer colorrectal, CRC), una estrategia de entrenamiento por diapositiva (BY_SLIDE) y una magnificacion de trabajo de 40x.

El problema que resuelve es el de la segmentación y clasificación de núcleos en imágenes de tejido teñido (H&E o inmunofluorescencia), una tarea base en pipelines de patología digital, investigación oncológica y análisis espacial de tumores. Frente a los enfoques de segmentación clásicos (umbralización, watershed, HoVer-Net), los modelos basados en foundation models de visión prometen mejor generalización a tejidos y tinciones no vistos durante el entrenamiento.

La relevancia de esta ficha es limitada por la documentación disponible: la model card del repositorio contiene únicamente la declaración de licencia `apache-2.0`, sin descripción de arquitectura, datos de entrenamiento, métricas ni instrucciones de uso. El repositorio tiene 2,7 GB, cero descargas y cero interacciones, y la búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo. Todo lo que sigue distingue explícitamente entre datos confirmados y datos no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CellViT-SAM (codificador de imagen ViT-H de SAM + decodificador CellViT para segmentación de núcleos); inferido del nombre del repositorio, no confirmado en la model card |
| Parametros totales | no disponible (el repositorio pesa 2,7 GB; compatible con un modelo de ~630-640 M de parámetros en fp32, sin confirmación del autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: es un modelo de visión, no de lenguaje; la resolución de entrada no está documentada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión; la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no se especifica safetensors, .pth u otro formato; el tamaño del repo es de 2,7 GB) |

## Arquitectura y entrenamiento

No hay información publicada en la model card sobre la arquitectura concreta de este checkpoint, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. La única información estructural proviene del propio identificador del repositorio: `CellViT-SAM` apunta a la combinación del Segment Anything Model con CellViT, `H` indica el tamaño del backbone ViT (huge, aproximadamente 630 M de parámetros), `10xGenomics-CRC` indica el origen de los datos (10x Genomics, cáncer colorrectal), `BY_SLIDE` sugiere una partición o entrenamiento por diapositiva y `x40` indica la magnificacion de trabajo.

En la familia CellViT-SAM, la innovación técnica consiste en sustituir el codificador ViT256 de CellViT por el codificador de imagen de SAM ViT-H, preentrenado con aproximadamente 1.000 millones de máscaras, y conservar el decodificador ligero de CellViT que produce mapas de núcleos y mapas de instancias. Esto permite segmentación de instancias sin necesidad de un paso posterior de agrupamiento basado en embeddings, y aporta una inicialización con conocimiento visual transferible a histopatología. Es una descripción general de la familia arquitectónica, no una confirmación de la configuración exacta de este checkpoint.

## Capacidades

- Segmentación de instancias de núcleos celulares en imágenes de histopatología, presumiblemente a 40x de magnificacion y sobre tejido de cáncer colorrectal.
- Clasificación de tipo celular por núcleo, si el decodificador reproduce la configuración estándar de CellViT (no confirmado para este checkpoint).
- Procesamiento de imágenes completas de portaobjetos (WSI) por parches, asumiendo un flujo de inferencia por teselas como en la familia CellViT.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión, no un modelo de lenguaje.
- No se documenta ningún modo especial (thinking mode, audio, vídeo) ni ninguna capacidad adicional a la segmentación celular.
- No se documenta si el modelo realiza extracción de características reutilizables para tareas posteriores (por ejemplo, clasificación de tejido a nivel de WSI).

## Casos de uso

- Investigación en biología espacial de tumores: segmentar y contar núcleos en cortes de cáncer colorrectal para construir matrices de vecindad celular y estudiar la organización del microambiente tumoral.
- Cuantificación de densidades celulares en cohortes de patología digital: procesar por lotes diapositivas teñidas con H&E o marcadores de inmunofluorescencia y extraer métricas por región de interés.
- Desarrollo de biomarcadores morfológicos: usar las máscaras de núcleos como entrada a modelos posteriores que relacionen morfología nuclear con variables clínicas.
- Preprocesado de pipelines de análisis de imágenes de portaobjetos: generar mapas de instancias que alimenten etapas de clasificación de tejido, asignación de tipos celulares o análisis de vecindad.
- Comparación de métodos de segmentación: servir como referencia de la familia CellViT-SAM en experimentos de reproducción sobre datos de 10x Genomics.
- Anotación asistida: generar máscaras preliminares que un patólogo revise y corrija, reduciendo el coste de crear conjuntos de datos anotados.
- Validación metodológica entre magnificaciones: evaluar cómo se comporta el modelo en tejido capturado a 40x frente a otras magnificaciones o escáneres.

En todos estos casos, la aplicabilidad concreta no puede confirmarse porque el autor no ha publicado instrucciones de inferencia, dependencias ni el formato de salida esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de validación (Dice, panóptico de calidad, F1 de detección, AJI, PQ), ni comparaciones con CellViT, HoVer-Net, StarDist u otros métodos. Tampoco se documenta el conjunto de validación empleado ni el protocolo de partición asociado a la etiqueta `BY_SLIDE`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un backbone ViT-H ronda los 630 M de parámetros, lo que supone aproximadamente 2,5 GB de pesos en fp32 y unos 1,3 GB en fp16. A eso hay que sumar activaciones, que dependen de la resolución del parche; un valor típico de trabajo en esta familia es de 1024x1024 píxeles, con un consumo total habitual entre 6 y 16 GB según lote y precisión. Estas cifras son estimaciones derivadas del tamaño del backbone, no medidas publicadas para este checkpoint.
- GPU recomendadas: no disponible. Por tamaño, debería caber en GPUs profesionales de una sola unidad (A100 40 GB, H100, L40S, A6000) y probablemente en GPUs de consumo con 16 GB o más (RTX 4080, 4090, 3090).
- ¿Cabe en GPU de consumo? Probablemente sí, en las gamas con 16-24 GB de VRAM, asumiendo inferencia con lotes pequeños y precisión reducida. No confirmado por el autor.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además son herramientas orientadas a modelos de lenguaje y no aplican directamente a este tipo de modelo de visión. El despliegue esperable sería mediante PyTorch o un runtime de ONNX/TensorRT, sin que el autor lo especifique.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto o resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huangch/10xGenomics-CRC_BY_SLIDE-CellViT-SAM-H-x40` | Segmentación de núcleos (CellViT-SAM, ViT-H) | no disponible (backbone ViT-H, ~630 M estimados) | no disponible | apache-2.0 | HuggingFace, 0 descargas, model card vacía |
| CellViT-SAM (TIO-IKIM) | Segmentación de núcleos (CellViT-SAM, ViT-H) | ~630 M en el codificador, más decodificador | parches de 1024x1024 | no disponible en esta búsqueda | repositorio público del grupo autor |
| CellViT (ViT256) | Segmentación y clasificación de núcleos | del orden de decenas de millones | parches de 256x256 | no disponible en esta búsqueda | repositorio público del grupo autor |
| SAM ViT-H (Meta) | Segmentación genérica de objetos | ~630 M en el codificador de imagen | 1024x1024 | Apache 2.0 (versión original) | ampliamente disponible |

No se dispone de datos numéricos comparativos para este checkpoint. La comparación anterior es estructural y se apoya en el nombre del repositorio y en el conocimiento general de la familia, no en métricas publicadas por el autor.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card solo contiene la licencia, sin descripción, sin instrucciones de uso y sin métricas. No es posible reproducir el entrenamiento ni verificar el rendimiento declarado.
- Sin validación independiente: cero descargas y cero interacciones en el momento de redactar esta ficha, y ninguna referencia externa localizada en la búsqueda web (los resultados obtenidos no guardan relación con el modelo).
- Sesgo de dominio probable: al estar entrenado sobre datos de cáncer colorrectal de 10x Genomics, es esperable un rendimiento degradado en otros tejidos, otras tinciones, otros escáneres u otras magnificaciones distintas de 40x. Esta limitación es una inferencia razonable, no un dato confirmado.
- Riesgo de alucinación en el sentido de falsos positivos de segmentación: como todo modelo de segmentación, puede generar máscaras espurias en artefactos, pliegues, burbujas o zonas con tinción deficiente. No hay evaluación publicada de este comportamiento.
- Sin garantías clínicas: no hay evidencia de validación regulatoria ni de uso diagnóstico. No debe emplearse para decisiones clínicas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no cubre los derechos sobre los datos de entrenamiento ni sobre los pesos derivados de otros modelos (por ejemplo, el codificador de SAM), cuyo régimen de licencia debería verificarse antes de un uso comercial.
- Metadatos inconsistentes: la fecha de creación del repositorio aparece como 2026-09-19, posterior a la fecha de consulta, lo que sugiere un repositorio generado de forma automática, mal fechado o de procedencia poco verificable. Conviene tratarlo con cautela.
- Idiomas y formato de pesos no documentados: dificulta planificar la integración en un pipeline de producción.

## Enlaces

- HuggingFace: https://huggingface.co/huangch/10xGenomics-CRC_BY_SLIDE-CellViT-SAM-H-x40
- DOI declarado en los tags: doi:10.57967/hf/10521
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relacionados con este modelo.
