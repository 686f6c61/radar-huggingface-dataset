# Deepnoid/TREAT-MMTB-2026-Task2-MultimodalAI

## Resumen

MultimodalAI (TREAT-MMTB 2026 Task 2) es un clasificador binario de radiografías de tórax en formato PNG que distingue entre tuberculosis (TB) y Normal. Lo desarrolla Deepnoid (Corea del Sur) como participación en el reto TREAT-MMTB 2026, asociado a MICCAI 2026, y no utiliza metadatos clínicos del paciente: toda la señal procede de la imagen. El modelo obtuvo el segundo puesto en la clasificación final externa oficial del reto, con un F1 de 0,8642 sobre el conjunto externo completo.

Técnicamente no es un modelo generativo ni un LLM, sino un conjunto (ensemble) de cuatro clasificadores DINOv3 ViT-L/16 con attention pooling, entrenados para clasificación de imagen. El pipeline de entrada combina ecualización de histograma, CLAHE y el canal de escala de grises, y redimensiona la imagen a 512 × 512 tras un relleno centrado. La inferencia aplica aumentación por volteo horizontal sobre los cuatro miembros del ensemble y un umbral de decisión de 0,35 para la clase TB.

El modelo es relevante en el contexto de cribado de tuberculosis en entornos con recursos limitados, donde un clasificador de imagen dedicado y ligero puede servir como primera lectura automatizada. El repositorio ocupa 4,9 GB e incluye código personalizado (`custom_code`), por lo que requiere `trust_remote_code=True` para su carga mediante `AutoModel` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 4 clasificadores DINOv3 ViT-L/16 con attention pooling |
| Parametros totales | no disponible (cuatro checkpoints DINOv3 ViT-L/16; la model card no declara el recuento exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen; entrada de 512 × 512 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`weights/model_0.safetensors` a `weights/model_3.safetensors`) |
| Modalidad de entrada | Imagen, PNG (escala de grises + ecualizacion de histograma + CLAHE) |
| Salida | Etiqueta binaria `TB` o `Normal`, con `filename` asociado |
| Umbral de decision | 0,35 (TB frente a Normal) |
| Tarea | Clasificacion TB/Normal en radiografia de torax |
| Tamano del repositorio | 4,9 GB |
| Codigo | Personalizado (`custom_code`), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El sistema es un ensemble de cuatro clasificadores basados en el codificador DINOv3 ViT-L/16 (Vision Transformer de Meta AI / FAIR, Simeoni et al., 2025) con una cabeza de attention pooling. Cada miembro procesa la misma imagen de entrada con un preprocesado que fusiona tres representaciones: ecualizacion de histograma, CLAHE y el canal de escala de grises original; el resultado se rellena de forma centrada y se redimensiona a 512 × 512 píxeles. En inferencia se aplica volteo horizontal como aumentación sobre los cuatro miembros y se agregan las predicciones usando el umbral 0,35 para decidir entre TB y Normal.

El entrenamiento de clasificacion se realizo sobre los conjuntos TREAT-MMTB 2026, MIMIC-CXR, TB Portals, VinDr-CXR, TBX11K, PadChest y las colecciones Shenzhen y Montgomery (estas dos ultimas empleadas en dos de los cuatro miembros del ensemble). El preentrenamiento vision-language siguio el procedimiento GLINT (Park et al., 2026), apoyandose en codificadores DINOv3, embeddings de frase MPNet (`all-mpnet-base-v2`) y etiquetas de informe generadas con Qwen3.6-35B-A3B. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO, datos que en un clasificador de vision no serian directamente extrapolables.

## Capacidades

- Clasificacion binaria de radiografias de torax en PNG: devuelve `TB` o `Normal` para cada imagen.
- Inferencia sobre un unico archivo PNG o sobre una carpeta completa (lectura no recursiva, extensiones insensibles a mayusculas).
- Procesamiento por lotes con `batch_size` configurable (32 por defecto; reducible para GPUs con menos memoria).
- Exportacion de resultados a `prediction.csv` con columnas `filename,TB/Normal` cuando se especifica `output_dir`.
- Ejecucion en GPU CUDA (por defecto) o en CPU mediante `.to("cpu")`.
- Empaquetado en Docker con inferencia offline (`--network none`), pensado para entornos reproducibles.
- Rendimiento medido en el reto: F1 de 0,8642 en el conjunto externo completo, segundo puesto de la clasificacion oficial.
- No soporta generacion de texto, razonamiento multi-paso, tool calling, function calling, agentes, vision general, audio ni capacidades multilingues: es un clasificador de vision de dominio especifico.
- No procesa DICOM de forma nativa en esta tarea (la Task 2 consume PNG); el modelo hermano del mismo autor, Task 1, si trabaja con `.dcm`.

## Casos de uso

- Cribado de tuberculosis en programas de salud publica: el modelo clasifica lotes de radiografias PNG y genera un CSV con la etiqueta por paciente, lo que permite priorizar la revision de los casos marcados como `TB` por parte de radiologos.
- Segunda lectura asistida en radiologia: integrado como verificador adicional sobre la lectura humana, aprovechando que el ensemble de cuatro redes con umbral 0,35 reduce la varianza de la prediccion individual.
- Curado y etiquetado de cohortes de investigacion: procesar carpetas completas de imagenes para preetiquetar grandes volumenes de radiografias antes de una revision manual, con el CSV resultante como punto de partida.
- Auditoria retrospectiva de historiales: dado un directorio de PNG exportados desde un PACS, ejecutar el modelo por lotes y comparar la etiqueta predicha con el diagnostico registrado para detectar discrepancias.
- Despliegue en contenedor aislado: el Dockerfile permite inferencia sin red (`--network none`), adecuado para entornos hospitalarios con requisitos estrictos de conectividad.
- Baseline en retos y evaluaciones: sirve como referencia reproducible para comparar nuevos clasificadores TB/Normal contra el resultado de 0,8642 de F1 del leaderboard externo.
- Filtrado previo en pipelines de datos medicos: descartar o marcar imagenes en un flujo de ingesta antes de que lleguen a un sistema de anotacion costoso en horas de especialista.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| TREAT-MMTB 2026, leaderboard externo completo (final oficial) | F1 | 0,8642 |

Puesto obtenido: 2 en el leaderboard externo final oficial del reto TREAT-MMTB 2026. No se han publicado en la informacion disponible resultados adicionales de otros benchmarks (MMLU, HumanEval, GSM8K u otros), ni metricas de sensibilidad, especificidad o AUC.

## Requisitos de hardware

- GPU NVIDIA obligatoria para el flujo Docker documentado (requiere driver y NVIDIA Container Toolkit); tambien admite CPU con `.to("cpu")`, con latencia mayor no cuantificada.
- VRAM estimada: los pesos suman aproximadamente 4,9 GB entre los cuatro checkpoints, a lo que hay que anadir activaciones y memoria de lote. Para `batch_size=4` cabria en GPUs de 8-12 GB; el valor por defecto de 32 exige bastante mas margen y la model card recomienda reducirlo en GPUs pequenas.
- GPUs recomendadas: no especificadas por el autor. Por tamano, el ensemble es manejable en tarjetas de consumo (por ejemplo, RTX 3090 o RTX 4090) y en GPUs de centro de datos (A100, H100) sin necesidad de paralelismo.
- Cabe en GPU de consumo: si, con `batch_size` ajustado a la VRAM disponible.
- Opciones de despliegue: Transformers con `AutoModel` y `trust_remote_code=True`, script CLI `predict.py` (con `--weights`, `--config`, `--input`, `--output`, `--batch-size`) y contenedor Docker. La model card no menciona integraciones con vLLM, llama.cpp, Ollama o TGI, que de todos modos no aplican a un clasificador de vision.
- Entorno de referencia: Python 3.10, PyTorch 2.4.1 con CUDA 11.8.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Deepnoid/TREAT-MMTB-2026-Task2-MultimodalAI | Clasificacion TB/Normal desde PNG | Ensemble de 4 DINOv3 ViT-L/16 | no disponible | 512 × 512 px | no disponible | Hugging Face, 4,9 GB, 0 descargas |
| Deepnoid/TREAT-MMTB-2026-Task1-MultimodalAI | Segmentacion y deteccion de cavidades desde DICOM | no disponible | no disponible | DICOM | no disponible | Hugging Face |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye modelos de terceros directamente comparables en la tarea de clasificacion TB/Normal sobre radiografia de torax, por lo que no se pueden establecer comparaciones cuantitativas mas alla del resultado de leaderboard del propio reto.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: solo clasifica TB frente a Normal en radiografias de torax; no es un modelo de proposito general ni admite otras tareas.
- No es una herramienta de diagnostico: la model card no documenta validacion clinica prospectiva, certificacion sanitaria ni analisis de subgrupos; su uso debe ser como apoyo, con supervision medica.
- Umbral de decision fijado en 0,35: este valor esta ajustado al conjunto del reto y puede no ser optimo en otra poblacion, prevalencia o equipo de adquisicion. No se publican curvas ROC ni analisis de calibracion.
- Dependencia del preprocesado: el pipeline exige PNG con el esquema de ecualizacion de histograma, CLAHE y escala de grises aplicado internamente. Imagenes con otras caracteristicas de adquisicion o convertidas de forma distinta a partir de DICOM pueden degradar los resultados.
- Metadata clinica no utilizada: al no emplear edad, sexo, antecedentes ni hallazgos de laboratorio, el modelo carece del contexto que suele mejorar el rendimiento diagnostico en escenarios reales.
- Sesgos potenciales: la model card no incluye analisis de sesgo por origen del dataset, etnia, sexo o edad. Los datos de entrenamiento combinan fuentes de varios paises, con riesgo de sesgo de dominio vinculado a la distribucion de cada conjunto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con falsos negativos y falsos positivos, cuyo impacto no se cuantifica en la informacion disponible.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion de los pesos. Debe consultarse con el autor antes de cualquier despliegue en produccion.
- Idiomas soportados no disponibles: no relevante para la tarea, pero se desconoce si la documentacion o el codigo contemplan otros idiomas.
- Requiere `trust_remote_code=True`: ejecutar codigo personalizado del repositorio implica un riesgo de seguridad que debe evaluarse antes de desplegarlo en infraestructura sanitaria.
- Repositorio con 0 descargas y 0 likes: no existe evidencia de uso comunitario, retroalimentacion ni mantenimiento posterior a la fecha de publicacion.
- Fechas de publicacion y actualizacion registradas como 2026-09-29, sin historial de versiones posterior en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deepnoid/TREAT-MMTB-2026-Task2-MultimodalAI
- Checkpoints (carpeta `weights`): https://huggingface.co/Deepnoid/TREAT-MMTB-2026-Task2-MultimodalAI/tree/main/weights
- Modelo hermano (Task 1): https://huggingface.co/Deepnoid/TREAT-MMTB-2026-Task1-MultimodalAI
- Repositorio de codigo en GitHub: https://github.com/deepnoid-ai/TREAT-MMTB-2026-Task2-MultimodalAI
- Leaderboard oficial del reto (JSON): https://github.com/mi2rl-challenge/treat-mmtb.miccai2026/blob/main/leader_board_point.json
- Sitio del reto TREAT-MMTB 2026: https://treat-mmtb.mi2rl.co/
- DINOv3 (Meta AI / FAIR): https://github.com/facebookresearch/dinov3
- MPNet `all-mpnet-base-v2`: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Dataset TREAT-MMTB 2026: https://doi.org/10.5281/zenodo.19732124
- MIMIC-CXR: https://physionet.org/content/mimic-cxr/
- TB Portals: https://tbportals.niaid.nih.gov/
- VinDr-CXR: https://physionet.org/content/vindr-cxr/1.0.0/
- TBX11K: https://mmcheng.net/tb/
- PadChest: https://bimcv.cipf.es/bimcv-projects/padchest/
- Shenzhen y Montgomery (NLM): https://lhncbc.nlm.nih.gov/LHC-publications/PDF/pub9356.pdf
- NVIDIA Container Toolkit: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html
