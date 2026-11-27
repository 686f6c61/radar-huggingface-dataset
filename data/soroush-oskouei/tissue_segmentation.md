# soroush-oskouei/tissue_segmentation

## Resumen
FusionUNet es un modelo de segmentación semántica diseñado específicamente para la detección automática de tejido (foreground tisular) en imágenes histopatológicas de campo claro de diapositivas completas (Whole Slide Images, WSI). Lo desarrolla Soroush Oskouei y se publica bajo licencia MIT en Hugging Face con el identificador `soroush-oskouei/tissue_segmentation`. No es un modelo de lenguaje: es una red convolucional de segmentación de imagen con pipeline `image-segmentation`.

El problema que resuelve es el paso previo habitual en cualquier pipeline computacional de patología digital: separar el tejido del fondo (fondo blanco de cristal, artefactos de montaje, etiquetas) antes de aplicar detección de núcleos, clasificación de parches o análisis morfométrico. Un enmascarado fiable del tejido reduce cómputo y evita falsos positivos en etapas posteriores.

Arquitectónicamente es una U-Net de doble codificador (DenseNet-121 + MobileNetV2) con fusión multi-escala mediante módulos de gating y atención scSE (concurrent spatial-and-channel Squeeze-and-Excitation). Trabaja sobre teselas RGB de 500×500 píxeles y produce un mapa de logits de un canal convertido con sigmoid a probabilidad de tejido en [0, 1]. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de doble codificador (FusionUNet) con backbones DenseNet-121 y MobileNetV2, fusión multi-escala con gating y bloques scSE en fusión y decodificador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 500 × 500 px por tesela |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `best_fusion_unet.pt` en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`) con `model_state`, `model_kwargs`, `img_size`, `mean`, `std`, `threshold`, `epoch`, `val_dice`/`val_f1` |

## Arquitectura y entrenamiento
FusionUNet combina dos extractores de características con sesgos inductivos distintos: DenseNet-121, con conexiones densas que favorecen la reutilización de rasgos y la propagación de gradiente, y MobileNetV2, con convoluciones separables en profundidad que aportan eficiencia computacional. Las características de ambos codificadores se combinan en módulos de fusión multi-escala con compuertas (gating) que aprenden a ponderar la contribución de cada rama, y se refinan con bloques scSE que aplican atención simultánea en los ejes espacial y de canal. El decodificador reconstruye la máscara a resolución de entrada y emite un único canal de logits.

El entrenamiento se realizó con datos derivados de The Cancer Genome Atlas (TCGA), según declara el autor en la model card. No se especifican en la información disponible el número de diapositivas, el volumen de teselas, la composición exacta del dataset, la función de pérdida ni si se aplicaron técnicas de aumento de datos más allá de la normalización por media y desviación típica de canal. El checkpoint incluye el umbral de probabilidad óptimo seleccionado en validación junto con las métricas `val_dice` y `val_f1`, lo que indica una selección de umbral basada en el conjunto de validación. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de segmentación.

## Capacidades
- Segmentación binaria de tejido foreground en imágenes histopatológicas de campo claro (WSI), con salida de probabilidad por píxel.
- Procesamiento de teselas RGB de 500 × 500 px con normalización por estadísticas de canal incluidas en el checkpoint.
- Inferencia sobre diapositivas completas mediante script `infer.py`, con soporte de ficheros SVS y lectura vía OpenSlide.
- Exportación de resultados en múltiples formatos: máscara binaria PNG, mapa de probabilidad, overlay JPG, resumen visual de cuatro paneles, metadatos JSON y anotaciones GeoJSON con soporte de agujeros en coordenadas de nivel 0, compatibles con QuPath.
- Cálculo del área total de tejido en mm² a partir de los metadatos de la diapositiva.
- Descarga automática de una diapositiva de muestra pública (`CMU-1.svs`) para pruebas del pipeline.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto: es exclusivamente un modelo de visión.

## Casos de uso
- Preprocesado en pipelines de patología digital: enmascarar el tejido antes de la extracción de parches permite descartar regiones de fondo y reducir entre un orden de magnitud y varios el número de teselas a procesar en etapas posteriores de detección de núcleos o clasificación.
- Control de calidad de diapositivas digitalizadas: el mapa de probabilidad y el overlay permiten detectar diapositivas con poco tejido, artefactos de escaneo o problemas de enfoque antes de incluirlas en un estudio.
- Cuantificación de área tisular: la salida `*_info.json` incluye el área total de tejido en mm², útil para normalizar métricas morfométricas por superficie analizada.
- Integración con QuPath: el GeoJSON generado con polígonos y agujeros en coordenadas de nivel 0 puede cargarse directamente como anotaciones en QuPath para revisión por patólogos o para segmentación manual asistida.
- Análisis retrospectivo de cohortes TCGA: al haberse entrenado con datos de TCGA, es adecuado para procesar diapositivas de esa colección en estudios de investigación reproducibles.
- Generación de datasets de segmentación: las máscaras y probabilidades exportadas pueden servir como pseudoetiquetas o como punto de partida para anotación asistida en nuevos conjuntos de datos.
- Despliegue en pipelines batch: el script de inferencia procesa diapositivas completas y exporta todos los artefactos de forma automática, lo que facilita su orquestación en trabajos por lotes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el checkpoint almacena los valores `val_dice` y `val_f1` obtenidos en validación, pero no se proporcionan sus cifras ni comparaciones con otros modelos de segmentación de tejido.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita. Con backbones DenseNet-121 y MobileNetV2 y teselas de 500 × 500 px, el modelo es ligero y probablemente quepa en GPUs de consumo con pocos GB de VRAM, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del repositorio (0,1 GB) y la arquitectura, cualquier GPU moderna con soporte CUDA debería ser suficiente; el autor no especifica modelos concretos.
- GPU de consumo: no se confirma compatibilidad con modelos concretos (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: inferencia mediante PyTorch y el script `infer.py` del repositorio GitHub del autor; requiere `torch`, `torchvision`, `numpy`, `opencv-python`, `matplotlib`, `tqdm`, `openslide-python`, `openslide-bin` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de segmentación de tejido en WSI (por ejemplo, variantes de U-Net con ResNet o modelos especializados de patología digital). La comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| FusionUNet (este modelo) | no disponible | teselas 500 × 500 px | MIT | Hugging Face + GitHub |
| Alternativas de segmentación de tejido | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo entrenado con datos de TCGA: puede generalizar peor a diapositivas de otras fuentes, escáneres, tinciones o protocolos de laboratorio distintos a los del conjunto de entrenamiento.
- No es un dispositivo médico: no se documenta validación clínica ni regulatoria; su uso en diagnóstico requiere validación independiente y supervisión profesional.
- Riesgo de sesgo por la composición del dataset TCGA, que no se detalla en la model card (tipos de tumor, instituciones, distribución demográfica).
- No se especifican los volúmenes de entrenamiento ni las métricas de validación, lo que dificulta evaluar su robustez antes de desplegarlo.
- La resolución de entrada está fijada en 500 × 500 px; el rendimiento fuera de ese tamaño o de la escala de MPP esperada no está documentado.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las condiciones de uso de los datos TCGA subyacentes si se redistribuyen derivados.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso comunitario ni de validación externa.
- No dispone de capacidades de texto, tool calling ni agentes; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces
- Hugging Face: https://huggingface.co/soroush-oskouei/tissue_segmentation
- Repositorio de inferencia en GitHub: https://github.com/SoroushOskouei/tissue-segmentation
- The Cancer Genome Atlas (TCGA): https://www.cancer.gov/tcga
- Imagen de resultado de muestra: https://cdn-uploads.huggingface.co/production/uploads/6b09a8946582ec20df7efd6d/DCeHR7tIZUlUxAQo-oGik.png
