# ghostsas001/kvasir-gi-endoscopy-yolo

## Resumen

El modelo `ghostsas001/kvasir-gi-endoscopy-yolo` es un clasificador de imágenes de endoscopia digestiva alta construido con la librería Ultralytics YOLO y publicado por el usuario ghostsas001. Resuelve una tarea de clasificación de ocho clases sobre el conjunto de datos Kvasir v1: ciego normal, píloro normal, línea Z normal, esofagitis, pólipos, colitis ulcerosa, pólipos elevados teñidos y márgenes de resección teñidos.

Su relevancia es experimental: según la model card, alcanza un 95,50 % de accuracy, un MCC de 0,949 y un macro F1 del 95,50 % sobre un conjunto de retención de 400 imágenes (50 por clase), por encima del mejor baseline del artículo original de Kvasir (MCC 0,711) y de un ensemble Inception de la literatura (0,903). Se trata de una única ejecución de entrenamiento, sin intervalos de confianza, y la receta de entrenamiento se reutilizó sin ajuste desde un proyecto previo de clasificación de glóbulos blancos.

El repositorio ocupa 0,1 GB y no registra descargas ni valoraciones. La model card se publica con licencia AGPL-3.0 y advierte explícitamente de que las limitaciones del dataset y la licencia restrictiva heredada de Kvasir lo hacen apto únicamente para investigación y uso educativo, no como dispositivo médico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO (Ultralytics), modelo de clasificación de imágenes; variante concreta (n/s/m/l/x) no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagen; entrada de 224 × 224 px) |
| Tipos de cuantización | no disponible; se distribuyen pesos PyTorch sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible (tarea de visión; no procesa texto) |
| Licencia | AGPL-3.0, con restricción adicional de uso solo para investigación y educación por herencia del dataset Kvasir |
| Formato de pesos | PyTorch (`.pt`, fichero `yolo.pt`), cargable con Ultralytics |
| Número de clases | 8 |
| Resolución de entrada en entrenamiento | 224 px |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | `image-classification` |
| Fecha de publicación | 2026-09-29 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia YOLO de Ultralytics y se emplea aquí como clasificador de imagen completa, no como detector de objetos. La model card no especifica la variante exacta de la familia ni el número de parámetros, por lo que estos datos no están disponibles. La entrada de trabajo es de 224 px y la salida es una distribución de probabilidad sobre ocho etiquetas: `dyed-lifted-polyps`, `dyed-resection-margins`, `esophagitis`, `normal-cecum`, `normal-pylorus`, `normal-z-line`, `polyps` y `ulcerative-colitis`.

El entrenamiento usó 3.200 imágenes (400 por clase) del dataset Kvasir v1, con una partición estratificada 80/10/10 a nivel de imagen y semilla 42, 50 épocas, batch 64, aumentación por defecto de Ultralytics y selección del mejor epoch sobre el split de validación. Se ejecutó en una única NVIDIA T4. La propia model card indica que la receta se reutilizó sin ningún ajuste desde un proyecto de clasificación de glóbulos blancos, lo que constituye el principal caveat metodológico del trabajo.

## Capacidades

- Clasificación de imágenes endoscópicas en ocho categorías clínicas, con salida de clase predicha y probabilidades por clase.
- Distinción entre tejido normal (ciego, píloro, línea Z) y hallazgos patológicos o intervenidos (esofagitis, pólipos, colitis ulcerosa, pólipos teñidos, márgenes de resección).
- Integración directa en Python mediante `ultralytics.YOLO` y `hf_hub_download`, con inferencia en una sola llamada (`model.predict(..., imgsz=224)`).
- Exportación a otros formatos de inferencia mediante las utilidades de Ultralytics (ONNX, TensorRT, OpenVINO, TFLite, entre otros).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente ni soporte multilingüe: es un clasificador de imagen cerrado a ocho etiquetas.

## Casos de uso

- Triaje y preetiquetado de conjuntos de datos endoscópicos: el modelo puede asignar una etiqueta inicial a imágenes de Kvasir v1 o de dominios similares para acelerar el etiquetado manual posterior por especialistas.
- Docencia y formación en gastroenterología: uso como herramienta didáctica para ilustrar diferencias visuales entre clases (por ejemplo, esofagitis frente a línea Z normal) en entornos académicos.
- Investigación en clasificación de imagen médica: servir de baseline reproducible con 95,50 % de accuracy y MCC 0,949 sobre una partición de retención concreta y comparable con otros trabajos sobre Kvasir.
- Prototipado de pipelines de visión clínica: validar la integración de Ultralytics con sistemas de adquisición o almacenamiento de vídeo endoscópico antes de invertir en modelos mayores.
- Estudio de robustez y sesgo de datasets médicos: los propios problemas documentados (overlays quemados, ausencia de identificadores de paciente, pares que difieren solo en grado) lo convierten en un caso de análisis para investigar cómo afectan estos artefactos al rendimiento.
- Comparación de arquitecturas sobre un mismo corpus: contrastarlo con su modelo compañero SigLIP y con los baselines publicados permite evaluar el coste/beneficio de distintas familias de modelos en una tarea médica concreta.
- Demostraciones y pruebas de concepto en entornos controlados: dado su tamaño reducido de repositorio (0,1 GB) y la resolución de 224 px, es viable desplegarlo en un portátil o en una GPU de gama media para demostraciones no clínicas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de retención de 400 imágenes (50 por clase):

| Métrica | Valor |
|---|---|
| Accuracy | 95,50 % |
| Matthews correlation coefficient (MCC) | 0,949 |
| Macro F1 | 95,50 % |

Comparación con referencias publicadas citadas en la model card:

| Referencia | Métrica | Valor |
|---|---|---|
| Este modelo (YOLO, Kvasir v1) | MCC | 0,949 |
| Este modelo (YOLO, Kvasir v1) | Accuracy | 95,50 % |
| Ensemble Inception de la literatura | MCC | 0,903 |
| Mejor baseline del artículo de Kvasir (según tabla de Asperti y Mastronardo, 2017) | MCC | 0,711 |

Advertencia metodológica recogida en la propia model card: cada trabajo usa su propia partición aleatoria de las mismas 4.000 imágenes, por lo que los conjuntos de test no son idénticos y las cifras no son estrictamente comparables. No se publican intervalos de confianza, resultados por clase ni matrices de confusión numéricas más allá de las figuras del repositorio.

## Requisitos de hardware

- Entrenamiento documentado: una única NVIDIA T4, 50 épocas, resolución de 224 px y batch de 64. No se detalla el tiempo total de entrenamiento.
- Los requisitos de VRAM para inferencia no se publican. Dado el tamaño del repositorio (0,1 GB) y la resolución de entrada (224 px), la estimación orientativa es que la inferencia quepa en GPUs de consumo e incluso en CPU, pero al no especificarse la variante de YOLO esta cifra no puede confirmarse.
- GPUs de referencia habituales en este tipo de cargas: cualquier GPU con al menos unos pocos GB de VRAM (por ejemplo, T4, RTX 3060 o superiores); no hay requisitos oficiales publicados.
- Despliegue: API de Python de Ultralytics (`YOLO` + `predict`), con exportación a ONNX, TensorRT, OpenVINO o TFLite mediante las herramientas de Ultralytics. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje ni existir pesos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imágenes por segundo en ninguna GPU concreta.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kvasir-gi-endoscopy-yolo (este modelo) | Clasificación de 8 clases, Kvasir v1 | no disponible | 224 px | Accuracy 95,50 %, MCC 0,949, macro F1 95,50 % | AGPL-3.0 (uso solo investigación/educativo) | HuggingFace |
| kvasir-gi-endoscopy-siglip (modelo compañero) | Clasificación de 8 clases, Kvasir v1 | no disponible | no disponible | no disponible en la información proporcionada | no disponible | HuggingFace |
| Ensemble Inception de la literatura | Clasificación, Kvasir v1 | no disponible | no disponible | MCC 0,903 | no disponible | Publicación académica |
| Mejor baseline de Asperti y Mastronardo (2017) | Clasificación, Kvasir v1 | no disponible | no disponible | MCC 0,711 | no disponible | Publicación académica (arXiv:1712.03689) |

No se dispone de datos de parámetros, contexto ni licencia de los modelos comparados, por lo que la comparación se limita a la métrica de rendimiento reportada y a la disponibilidad.

## Limitaciones y advertencias

- No es un dispositivo médico. La model card lo califica explícitamente como modelo de investigación; no debe usarse para diagnóstico ni para toma de decisiones clínicas.
- Entrenado exclusivamente con imágenes de Kvasir v1; otros endoscopios, protocolos de captura, resoluciones o centros pueden degradar la precisión de forma no cuantificada.
- Particiones pequeñas y a nivel de imagen: 50 imágenes de test por clase implican que cada imagen equivale a 2 puntos de recall, y la ausencia de identificadores de paciente impide descartar fuga de datos entre entrenamiento y test.
- Overlays quemados: muchas imágenes contienen texto y una caja verde indicadora de posición que no fueron enmascarados, por lo que el modelo podría estar apoyándose en artefactos en lugar de en morfología clínica.
- Pares de clases que difieren solo en grado (esofagitis frente a línea Z normal, pólipo teñido frente a margen de resección) concentran la mayoría de los errores de ambos modelos, según la model card.
- Una sola ejecución de entrenamiento, sin intervalos de confianza ni análisis de varianza entre semillas.
- La receta de entrenamiento se reutilizó sin ajuste desde un proyecto de clasificación de glóbulos blancos, lo que no garantiza que sea óptima para imagen endoscópica.
- Restricciones de licencia: los pesos se distribuyen bajo AGPL-3.0 y heredan la restricción del dataset Kvasir de uso exclusivamente para investigación y educación, lo que excluye el uso comercial.
- No se publican datos de sesgo demográfico, robustez ante cambios de iluminación, ni resultados desagregados por clase.
- El repositorio no registra descargas ni valoraciones, por lo que no existe validación independiente de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ghostsas001/kvasir-gi-endoscopy-yolo
- Modelo compañero SigLIP: https://huggingface.co/ghostsas001/kvasir-gi-endoscopy-siglip
- Repositorio del proyecto en GitHub: https://github.com/Elghoudani/kvasir-gi-endoscopy-classification
- Documentación de Ultralytics: https://docs.ultralytics.com
- Dataset Kvasir v1 (Pogorelov et al., 2017): https://doi.org/10.1145/3083187.3083212
- Asperti y Mastronardo (2017), referencia arXiv citada en los tags: https://arxiv.org/abs/1712.03689
