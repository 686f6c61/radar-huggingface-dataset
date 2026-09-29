# Deepnoid/TREAT-MMTB-2026-Task1-MultimodalAI

## Resumen

MultimodalAI — TREAT-MMTB 2026 Task 1 es un sistema de visión por computador médico desarrollado por Deepnoid para la tarea 1 del reto TREAT-MMTB 2026 (Transformative Research and Efficient AI Technologies for Multimodal Management of Tuberculosis), asociado a MICCAI 2026 en Estrasburgo. El modelo resuelve dos problemas sobre radiografías de tórax en formato DICOM: clasificación binaria de presencia de cavidad tuberculosa y segmentación de la cavidad en la imagen original. No es un modelo de lenguaje ni un sistema generativo multimodal: es un pipeline de visión especializado, con inferencia opcional en modo clasificación o en modo segmentación.

Técnicamente es un conjunto de cinco checkpoints: un clasificador DINOv3 ViT-L/16 con pooling por atención y cuatro segmentadores DINOv3 ConvNeXt-L con pyramid pooling y decodificadores tipo U-Net. La entrada combina ecualización de histograma, CLAHE y canal en escala de grises a 1024 × 1024 píxeles. El clasificador aplica un umbral de probabilidad de 0,70 para declarar cavidad y los cuatro mapas de segmentación se promedian y se umbralizan a 0,79 sobre la rejilla original.

Su relevancia actual es doble: por un lado, ocupa el puesto 3 en la clasificación final externa oficial del reto, con una puntuación final de 0,6001, una exactitud de detección de 0,8112 y un Dice de 0,1077; por otro, se publica como artefacto reproducible con pesos safetensors, código de inferencia vía `AutoModel`, CLI y Docker, lo que permite replicar el resultado en entornos hospitalarios con GPU NVIDIA y red deshabilitada. El repositorio ocupa 4,7 GB, coherente con cinco checkpoints en precisión completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de 1 clasificador DINOv3 ViT-L/16 (attention pooling) + 4 segmentadores DINOv3 ConvNeXt-L (pyramid pooling + decodificador U-Net) |
| Parámetros totales | no disponible (la model card no desglosa el recuento; las variantes Large de DINOv3 corresponden a la escala de cientos de millones de parámetros por checkpoint) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 1024 × 1024 píxeles con 3 canales derivados) |
| Tipos de cuantización | no disponible (solo se publican pesos en precisión completa, sin versiones GGUF, AWQ, GPTQ ni INT8) |
| Idiomas soportados | no aplica (consume imágenes DICOM; el pretraining con informes usó etiquetas de texto en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model_0.safetensors` a `model_4.safetensors`); salidas de segmentación en NIfTI (`.nii.gz`) y predicciones en CSV |

## Arquitectura y entrenamiento

El sistema encadena dos etapas independientes que se cargan juntas o por separado según el parámetro `mode` de `from_pretrained`. La etapa de clasificación es un DINOv3 ViT-L/16 con pooling por atención, que produce una probabilidad de cavidad comparada con el umbral 0,70. La etapa de segmentación son cuatro ConvNeXt-L de DINOv3 con pyramid pooling y decodificadores U-Net; sus cuatro mapas de probabilidad se promedian, se restauran a la rejilla de la imagen original y se umbralizan a un valor mayor que 0,79. Los casos negativos reciben máscara vacía; los casos positivos con máscara vacía activan un mecanismo de reserva que conserva el 1 % superior de píxeles por probabilidad. El preprocesado combina ecualización de histograma, CLAHE y escala de grises a 1024 × 1024.

El entrenamiento se apoya en el esquema de preentrenamiento visión-lenguaje GLINT (Park et al., 2026), con codificadores DINOv3 de Meta AI / FAIR (Siméoni et al., 2025), embeddings de frase MPNet (Song et al., 2020) y etiquetas de informe generadas con Qwen3.6-35B-A3B. Los datos provienen de tres fuentes declaradas: el conjunto del propio reto TREAT-MMTB 2026 para clasificación y segmentación, MIMIC-CXR para el preentrenamiento visión-lenguaje y TB Portals para el entrenamiento de clasificación de cavidades. La model card no especifica el número de tokens, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO; tampoco detalla aumentos de datos ni estrategia de validación. El trabajo fue financiado por el programa de innovación tecnológica RS-2025-02221011 del MOTIE de Corea del Sur.

## Capacidades

- Clasificación binaria de presencia de cavidad tuberculosa en radiografía de tórax, con umbral de decisión fijado en 0,70.
- Segmentación de la cavidad con salida de máscara binaria `uint8` preservando la geometría de la imagen DICOM original.
- Gestión de tres formatos de entrada: un archivo `.dcm`/`.dicom` suelto, una carpeta plana de DICOM o una raíz con carpetas de caso. Las extensiones se tratan sin distinguir mayúsculas y minúsculas.
- Selección automática del primer DICOM ordenado de cada caso cuando la entrada es una carpeta de caso; `our_id` se toma del nombre del archivo o de la carpeta.
- Modo de solo clasificación (`mode="cls"`) que carga únicamente el clasificador y devuelve `cavity` sin máscara, útil para cribado de alto volumen.
- Escritura opcional de resultados: `prediction.csv` con las columnas `our_id,cavity` y, en segmentación, máscaras `.nii.gz` por caso.
- Inferencia en GPU CUDA o en CPU mediante `.to("cpu")`.
- Despliegue contenedorizado con Docker, con inferencia en modo offline (`--network none`) y soporte de NVIDIA Container Toolkit.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto ni capacidades multilingües; no dispone de modo de pensamiento ni de entrada de audio.

## Casos de uso

- Cribado de tuberculosis en programas de control poblacional: el modo `mode="cls"` devuelve una etiqueta `cavity` por caso con umbral 0,70, lo que permite priorizar radiografías sospechosas antes de la lectura radiológica en entornos con carga alta y radiólogos escasos.
- Cuantificación de carga lesional y seguimiento longitudinal: la máscara `.nii.gz` conserva la geometría de la imagen, de modo que puede registrarse con estudios previos del mismo paciente para medir la evolución de la cavidad en el tiempo.
- Enriquecimiento de cohortes de investigación: procesar lotes de carpetas de caso y generar `prediction.csv` permite etiquetar retrospectivamente series de radiografías para estudios epidemiológicos sobre TB.
- Despliegue hospitalario aislado: la imagen Docker con `--network none` permite ejecutar la inferencia en una red clínica sin salida a internet, con los cinco checkpoints montados localmente y las entradas en solo lectura.
- Integración en PACS o pipeline DICOM: el modelo acepta carpetas raíz con subcarpetas por caso y nombres arbitrarios de `our_id`, lo que encaja con exportaciones DICOM estructuradas por estudio.
- Verificación de pipelines propios contra un resultado de reto publicado: al reproducir inferencia con los mismos umbrales (0,70 y 0,79) y el mismo preprocesado, un equipo puede comparar su propio sistema contra el puesto 3 del leaderboard externo.
- Análisis volumétrico combinado con otras modalidades: al devolver NIfTI con geometría preservada, las máscaras pueden alimentar herramientas de análisis cuantitativo y fusión con TC.
- Validación de modelos de segmentación médica en docencia e investigación: los cuatro segmentadores ConvNeXt-L y el clasificador ViT-L/16 funcionan como referencia reproducible para experimentos de ablación sobre arquitecturas DINOv3 en imagen médica.

## Benchmarks y rendimiento

Resultados publicados por el autor en el leaderboard final externo oficial del reto TREAT-MMTB 2026:

| Métrica | Valor |
|---|---|
| Puesto final | 3 |
| Puntuación final | 0,6001 |
| Exactitud de detección | 0,8112 |
| Dice | 0,1077 |

Comparación con el sistema descrito en la comunicación asociada al reto disponible en la búsqueda (ensemble de cuatro clasificadores, umbral 0,35, flip-averaging en inferencia):

| Sistema | Enfoque | F1 / Dice publicado |
|---|---|---|
| MultimodalAI (Deepnoid) | 1 ViT-L/16 + 4 ConvNeXt-L, umbrales 0,70 / 0,79 | Dice 0,1077; exactitud de detección 0,8112 |
| Ensemble de cuatro clasificadores (OpenReview / MICCAI 2026) | Clasificación, cinco datasets, aumento y sin aumento, umbral 0,35 | F1 0,8642 en evaluación externa |

Las métricas no son directamente comparables entre sí, ya que el primer sistema se evalúa con la puntuación compuesta del reto y el segundo reporta F1 de clasificación. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de lenguaje, porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el repositorio ocupa 4,7 GB con cinco checkpoints en precisión completa, lo que sugiere un consumo de pesos de ese orden más las activaciones a 1024 × 1024. Una estimación prudente sitúa el modo segmentación completo en el rango de 8 a 16 GB de VRAM; el modo `cls` consume menos al cargar solo el clasificador. Estas cifras son una estimación derivada del tamaño del repositorio, no un dato publicado.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA 11.8 y VRAM suficiente para los cuatro segmentadores. Para el pipeline completo son razonables tarjetas de gama profesional o de consumo alta (por ejemplo, RTX 4090, A100, H100); el modo clasificación puede ejecutarse en GPU de gama media.
- Compatibilidad con GPU de consumo: probable en tarjetas con 12 GB o más de VRAM para el modo segmentación, y en tarjetas con 8 GB o más para el modo clasificación, sujeto a verificación empírica porque el consumo real no está publicado.
- Inferencia en CPU: soportada mediante `.to("cpu")` o el flag correspondiente en CLI. No se publica latencia ni rendimiento en CPU; se espera un coste muy superior al de GPU dado el tamaño de los modelos y la resolución de entrada.
- Opciones de despliegue: `transformers.AutoModel.from_pretrained` con `trust_remote_code=True`, script CLI `predict.py` con `--input`, `--output`, `--weights`, `--config` y `--mode`, y contenedor Docker con NVIDIA Container Toolkit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de visión.
- Entorno de referencia: Python 3.10, PyTorch 2.4.1 con CUDA 11.8 y dependencias de `requirements.txt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / sistema | Tipo | Datos de entrada | Métrica publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deepnoid TREAT-MMTB-2026-Task1-MultimodalAI | Clasificación + segmentación de cavidades TB | DICOM de tórax, 1024 × 1024 | Puesto 3; puntuación 0,6001; detección 0,8112; Dice 0,1077 | no disponible | Pesos safetensors en HuggingFace, código en GitHub |
| Ensemble de cuatro clasificadores (OpenReview, MICCAI 2026) | Clasificación de TB | Radiografía de tórax | F1 0,8642 en evaluación externa | no disponible | Descripción en OpenReview y PDF en papers.miccai.org |
| Otros participantes del reto TREAT-MMTB 2026 | Clasificación y/o segmentación | Radiografía de tórax | Publicados en el leaderboard del reto | no disponible | Leaderboard público en repositorio mi2rl-challenge |

No se dispone de información sobre modelos genéricos de segmentación médica comparables en esta búsqueda, ni de datos de licencia o de parámetros de los sistemas alternativos que permitan una comparación cuantitativa más fina.

## Limitaciones y advertencias

- El Dice de 0,1077 es bajo en términos absolutos, lo que indica una segmentación de cavidades poco ajustada al contorno real, con toda probabilidad por el fuerte desequilibrio de clases inherente a las cavidades tuberculosas, que ocupan una fracción pequeña del pulmón.
- La exactitud de detección de 0,8112 y la puntuación final de 0,6001 indican un margen amplio de error; no es un sistema apto para uso diagnóstico autónomo sin revisión por un radiólogo.
- Los umbrales están fijados de forma rígida (0,70 para clasificación y 0,79 para segmentación) y calibrados sobre la distribución del reto; un cambio de dominio puede degradar la calibración sin aviso.
- El preentrenamiento visión-lenguaje usa MIMIC-CXR, un recurso con acceso restringido y credenciales; cualquier redistribución o reutilización de artefactos derivados debe respetar sus condiciones.
- La licencia no está declarada en la model card ni en los metadatos de HuggingFace, por lo que el uso comercial queda en un limbo legal: no hay autorización explícita ni prohibición explícita.
- La entrada es rígida: se rechazan mezclas de archivos sueltos y carpetas de caso en la misma ruta, y en carpetas de caso se usa siempre el primer DICOM ordenado, lo que puede ignorar la vista más informativa si el estudio contiene varias proyecciones.
- Riesgo de falsos negativos clínicamente relevantes: el mecanismo de reserva del 1 % superior de píxeles solo actúa cuando un caso positivo produce una máscara vacía, no corrige máscaras presentes pero mal localizadas.
- No se documentan análisis de sesgo por sexo, edad, etnia, fabricante de equipo o geografía, factores que afectan de forma conocida al rendimiento en radiografía de tórax.
- La reproducibilidad depende de `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; en entornos clínicos conviene auditar ese código antes de desplegarlo.
- El soporte en CPU existe pero no se publican tiempos; en producción hospitalaria sin GPU la viabilidad práctica no está garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Deepnoid/TREAT-MMTB-2026-Task1-MultimodalAI
- Checkpoints: https://huggingface.co/Deepnoid/TREAT-MMTB-2026-Task1-MultimodalAI/tree/main/weights
- Repositorio de código: https://github.com/deepnoid-ai/TREAT-MMTB-2026-Task1-MultimodalAI
- Leaderboard oficial del reto: https://github.com/mi2rl-challenge/treat-mmtb.miccai2026/blob/main/leader_board_point.json
- Sitio del reto TREAT-MMTB 2026: https://treat-mmtb.mi2rl.co/
- Grupo del reto en OpenReview: https://openreview.net/group?id=MICCAI.org/2026/Challenge/TREAT-MMTB
- Comunicación sobre clasificación de TB con ensemble de clasificadores: https://openreview.net/forum?id=CZZCTepmMj
- PDF de la comunicación en MICCAI 2026: https://papers.miccai.org/miccai-2026-sat/paper/TREAT_MMTB_005.pdf
- DINOv3 (Meta AI / FAIR): https://github.com/facebookresearch/dinov3
- MPNet (sentence-transformers): https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Qwen3.6-35B-A3B (generación de etiquetas de informe): https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Dataset TREAT-MMTB 2026 (Zenodo): https://doi.org/10.5281/zenodo.19732124
- MIMIC-CXR (PhysioNet): https://physionet.org/content/mimic-cxr/
- TB Portals (NIAID): https://tbportals.niaid.nih.gov/
- NVIDIA Container Toolkit: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html
