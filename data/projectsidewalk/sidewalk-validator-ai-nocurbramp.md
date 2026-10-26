# projectsidewalk/sidewalk-validator-ai-nocurbramp

## Resumen

`sidewalk-validator-ai-nocurbramp` es un clasificador binario de imágenes desarrollado por el equipo de Project Sidewalk (Universidad de Washington) para validar automáticamente etiquetas de tipo **NoCurbRamp** (ausencia de rampa de acera en un cruce o esquina) recogidas mediante crowdsourcing en la plataforma Project Sidewalk. Dada una porción de imagen a nivel de calle centrada en la etiqueta, el modelo predice si esa etiqueta es `correct` o `incorrect`. No localiza elementos en panoramas completas: esa tarea corresponde a otros modelos del ecosistema, como RampNet.

Técnicamente es un fine-tuning de `facebook/dinov2-large` (un ViT de unos 304 millones de parámetros) con una cabeza de clasificación lineal de dos clases. Se entrenó con votos de validación exclusivamente humanos y se publica con licencia MIT en formato safetensors, listo para `transformers`. Su relevancia práctica está en que actúa como primer filtro de calidad en un pipeline real de producción: la API reconstruye el recorte, ejecuta el modelo y solo emite un voto Agree/Disagree cuando la precisión estimada para ese nivel de confianza supera 0,92; en caso contrario, la etiqueta queda como Unsure para revisión humana.

El modelo rinde bien en ciudades vistas durante el entrenamiento (exactitud 0,879 en test) pero cae a 0,774 en ciudades no vistas, un dato clave para decidir si se despliega en una ciudad nueva sin recalibrar. Es una pieza de infraestructura de medición, no un modelo generalista: no procesa texto, no razona y no sustituye la validación humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT) `facebook/dinov2-large` con cabeza de clasificación lineal de 2 clases (`id2label = {0: correct, 1: incorrect}`) |
| Parámetros totales | 304.372.738 |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen; entrada 224×224 px tras redimensionar el lado corto a 256 y recorte central) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors; no se documentan variantes GGUF, ONNX ni int8) |
| Idiomas soportados | no aplica (modelo de imagen); las etiquetas de salida son `correct` / `incorrect` en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (carga vía `transformers`, `AutoModelForImageClassification`) |
| Tamaño del repositorio | 8,5 GB |
| Pipeline | `image-classification` |
| Etiquetas de salida | 2 clases: `correct`, `incorrect` |
| Preprocesador | `BitImageProcessor` incluido en `preprocessor_config.json`; debe cargarse con `use_fast=False` |

## Arquitectura y entrenamiento

El backbone es `facebook/dinov2-large`, un ViT preentrenado con el método de auto-supervisión DINOv2 (paper arXiv:2304.07193), al que se añade una cabeza lineal de dos salidas. El ajuste fino se hizo con Hugging Face `Trainer`: tasa de aprendizaje 1e-5, batch 8 con acumulación de gradiente ×4, 10 % de warm-up, 25 épocas y semilla 42. La aumentación consistió en `RandomResizedCrop(224, scale=(0.7, 1.0))` y volteos horizontales; la validación usa el procesador tal cual. Los pesos publicados corresponden al checkpoint con mejor macro-F1 de validación (0,869, `checkpoint-3438`); `trainer_state.json` conserva el histórico completo.

Los datos provienen del dataset `projectsidewalk/sidewalk-validator-ai-dataset-nocurbramp`: 12.199 muestras de entrenamiento, 2.607 de validación, 2.613 de test y 743 de `test_heldout` (ciudades no vistas, incluidas `tucson-az` y dos despliegues no públicos). El split está agrupado por panorama (ningún panorama aparece en dos particiones), estratificado por clase y con semilla fija. Las etiquetas de referencia se derivan **solo de votos humanos** de validación, excluyendo los votos de IA. No se documenta RLHF, DPO ni ajuste por preferencias; es un fine-tuning supervisado convencional.

Una innovación relevante no está en el modelo sino en el preprocesado: el panorama se redimensiona a 8192×4096, se renderiza una vista en perspectiva de 2048² con 90° de campo de visión centrada en la etiqueta, se corrige la inclinación de la cámara (beta = 0,95) y se estima la profundidad en el centro con Depth Anything V2 (métrico, VKITTI, ViT-B) para fijar la mitad del ancho del recorte en `6100 / depth_m` píxeles, reescalando el lado largo a 640 px. El modelo espera exactamente ese tipo de recorte: si el servicio de inferencia no aplica la misma corrección, el rendimiento se degrada.

## Capacidades

- Clasificación binaria de imágenes: dado un recorte centrado en una etiqueta NoCurbRamp, devuelve `correct` o `incorrect` con probabilidades por clase.
- Validación de etiquetas crowdsourced en el contexto de Project Sidewalk, con salida de confianza apta para umbralización (el servicio consulta `confidence_precision_map.json`).
- Integración con pipeline de producción: pensado para `sidewalk-ai-api`, que reconstruye el recorte desde el panorama y el punto de la etiqueta.
- Preprocesado determinista incluido: `BitImageProcessor` con resize a 256, recorte central 224 y normalización ImageNet.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni vídeo.
- No soporta otras categorías de etiqueta (aceras, pasos de cebra, obstáculos, rampas existentes): para eso hay modelos separados en la colección del mismo autor.
- No realiza detección ni localización de objetos en panoramas completas; trabaja sobre recortes ya preparados.

## Casos de uso

- **Validación automática de nuevas etiquetas NoCurbRamp en Project Sidewalk**: cada etiqueta enviada por voluntarios se convierte en un recorte de 640 px, se clasifica y, si la precisión estimada supera 0,92, se registra un voto Agree/Disagree de la cuenta `SidewalkAI`. Es el uso previsto por el autor y el que tiene datos de rendimiento asociados.
- **Triaje de la cola de validación humana**: ordenar las etiquetas por confianza del modelo permite a los moderadores revisar primero los casos dudosos (probabilidad cercana a 0,5), reduciendo el volumen de revisiones manuales necesarias.
- **Control de calidad de datos ya recogidos**: pasar un lote histórico de etiquetas por el modelo y comparar el veredicto con el voto humano previo para detectar desacuerdos sistemáticos o contribuciones erróneas recurrentes.
- **Auditoría de accesibilidad a escala municipal**: procesar inventarios de aceras de una ciudad y descartar etiquetas mal colocadas antes de generar mapas de accesibilidad o informes para planificación urbana.
- **Detección de regresiones en el pipeline de datos**: al fijar una versión del modelo y del preprocesado, sirve como referencia para comprobar que cambios en el renderizado de panoramas, en el recorte o en la corrección de inclinación no degradan la calidad de las etiquetas.
- **Investigación sobre infraestructura de medición parcial**: útil en trabajos que analizan cómo la IA se inserta en la recogida de datos de accesibilidad (por ejemplo, estudios sobre Project Sidewalk como infraestructura de medición), donde hace falta un componente de validación reproducible y con licencia permisiva.
- **Transferencia a otras categorías de etiqueta**: al ser un fine-tuning sobre DINOv2-large con licencia MIT, sirve de punto de partida para reentrenar validadores de otras clases (aceras, pasos de cebra, obstáculos) con el mismo esquema de split agrupado por panorama.

## Benchmarks y rendimiento

Resultados declarados por el autor (`metrics.json`, mejor checkpoint), con el veredicto por argmax y empates a favor de `correct`, igual que en la API. La métrica AUC se reporta como "AUC (incorrect)".

| Partición | n (correct / incorrect) | Exactitud | Exactitud balanceada | AUC | Macro-F1 |
|---|---|---|---|---|---|
| test (ciudades vistas en entrenamiento) | 2.613 (1.443 / 1.170) | 0,879 | 0,877 | 0,934 | 0,877 |
| test_heldout (ciudades no vistas) | 743 (359 / 384) | 0,774 | 0,778 | 0,881 | 0,771 |
| hard (filas de test + test_heldout que el modelo desplegado falló) | 90 (48 / 42) | 0,633 | 0,644 | 0,644 | 0,628 |

Métricas del `model-index` sobre el split de test (coincidentes con la tabla anterior, con más decimales): exactitud 0,8787; exactitud balanceada 0,8769; AUC 0,9336; macro-F1 0,8772. Todas figuran como no verificadas (`verified: false`).

Desglose por clase disponible en la model card (parcial): en test, clase `correct` con precisión 0,887, recall 0,894 y F1 0,891. En validación, el mejor checkpoint alcanzó macro-F1 0,869. No se han publicado resultados de benchmarks estándar de visión (ImageNet, etc.) ni comparaciones con otros clasificadores en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: unos 1,2 GB en fp32 (304 M de parámetros) y alrededor de 0,6 GB en fp16; con lotes pequeños el consumo real se sitúa en el rango de 2 GB. No se documentan cifras oficiales.
- **GPU recomendadas**: cualquier GPU con 4 GB o más sirve para inferencia. Para servir en producción con batching, una NVIDIA T4, L4, A10G o RTX 4090 es suficiente; no hace falta A100/H100 salvo que se procesen muchos recortes por segundo.
- **GPU de consumo**: sí cabe con holgura en RTX 3060 12 GB, RTX 4060, RTX 4070 y similares; también es viable en CPU para volúmenes moderados, dado el tamaño del modelo.
- **Opciones de despliegue**: pipeline de `transformers` (con `use_fast=False` en el procesador para replicar la ruta PIL de la API), exportación a ONNX Runtime o TorchScript, NVIDIA Triton Inference Server para serving con batching, y Hugging Face Inference Endpoints (el repositorio está marcado como `endpoints_compatible`). No hay pesos GGUF publicados.
- **Latencia y throughput**: no disponibles. En un despliegue real, el cuello de botella no es el clasificador sino el preprocesado: renderizar una vista en perspectiva de 2048² desde un panorama de 8192×4096, corregir la inclinación y ejecutar Depth Anything V2 para estimar la profundidad del recorte.
- **Almacenamiento**: el repositorio ocupa 8,5 GB porque incluye checkpoints intermedios; para servir solo hace falta el checkpoint final y el `preprocessor_config.json`.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sidewalk-validator-ai-nocurbramp` | Validación de etiquetas NoCurbRamp | 304,4 M | Recorte 224×224 (preprocesado específico) | Exactitud 0,879 en test; 0,774 en ciudades no vistas | MIT | Hugging Face, 28 descargas, `endpoints_compatible` |
| `sidewalk-validator-ai-curbramp` | Validación de etiquetas CurbRamp | no disponible | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face, misma colección |
| `sidewalk-validator-ai-crosswalk` | Validación de etiquetas Crosswalk | no disponible | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face, misma colección |
| `facebook/dinov2-large` (modelo base) | Extracción de características visuales | 304 M aprox. | Imagen, resolución variable | No es un clasificador de validación; requiere cabeza y ajuste | Licencia del modelo base (no indicada en la información disponible) | Hugging Face, ampliamente utilizado |

No se han encontrado en la información disponible clasificadores comparables de terceros para validación de etiquetas de accesibilidad vial, ni métricas publicadas de los modelos hermanos de la colección que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Caída clara fuera de distribución**: la exactitud baja de 0,879 en ciudades vistas a 0,774 en ciudades no vistas, y a 0,633 en el subconjunto de casos difíciles. Antes de desplegarlo en una ciudad nueva conviene recalibrar los umbrales de confianza o reentrenar.
- **Dependencia estricta del preprocesado**: el modelo solo funciona con recortes construidos con el pipeline del autor (panorama 8192×4096, vista 2048² con 90° FOV centrada en la etiqueta, corrección de inclinación beta = 0,95, ancho dependiente de la profundidad, lado largo a 640 px). Cambios en el renderizado o en la profundidad degradan el rendimiento sin aviso; el servicio debe aplicar la corrección de inclinación (PR #17 de `sidewalk-ai-api`).
- **Procesador**: hay que cargarlo con `use_fast=False` para replicar la ruta PIL que usa la API; usar el procesador rápido puede alterar la imagen de entrada.
- **Alcance muy estrecho**: solo valida la categoría NoCurbRamp. No detecta elementos, no localiza geometrías, no procesa panoramas completas y no emite explicaciones; la salida es una clase y una probabilidad.
- **Ruido en las etiquetas de referencia**: las etiquetas de entrenamiento provienen de votos humanos, con los umbrales definidos en la dataset card; heredan el desacuerdo inter-anotador sobre qué constituye exactamente una rampa ausente.
- **Sesgo geográfico y de captura**: el entrenamiento se concentra en un conjunto limitado de despliegues (incluidos `tucson-az` y despliegues no públicos), de modo que diseños de acera, materiales, iluminación y estaciones poco representados pueden aumentar los falsos negativos.
- **Riesgo de alucinación en sentido amplio**: el clasificador puede producir veredictos con alta confianza sobre recortes ambiguos u oscuros; el sistema mitiga esto con el umbral de precisión 0,92 y el estado Unsure, pero no lo elimina.
- **Licencia del modelo frente a licencia de los datos**: los pesos son MIT, pero las imágenes de origen (panoramas de street view) y el dataset pueden tener términos propios; el uso comercial del modelo no exime de comprobar los derechos sobre las imágenes de entrada.
- **Reproducibilidad incompleta**: la model card contiene marcadores `TODO` (por ejemplo, el hash del dataset) y el repositorio del dataset alojado contiene una selección anterior; la publicación de los datos de entrenamiento reales es una decisión de política aún abierta (issues #2 y #7).
- **Sin datos de contexto lingüístico**: el modelo no procesa ni genera texto, por lo que cualquier expectativa de soporte multilingüe o de razonamiento en lenguaje natural no aplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/projectsidewalk/sidewalk-validator-ai-nocurbramp
- Dataset de validación: https://huggingface.co/datasets/projectsidewalk/sidewalk-validator-ai-dataset-nocurbramp
- Colección de modelos y datasets del validador: https://huggingface.co/collections/projectsidewalk/project-sidewalk-validator-models-datasets
- Organización en Hugging Face: https://huggingface.co/projectsidewalk
- Repositorio de entrenamiento `sidewalk-validator-ai`: https://github.com/ProjectSidewalk/sidewalk-validator-ai
- Repositorio de servicio `sidewalk-ai-api`: https://github.com/ProjectSidewalk/sidewalk-ai-api
- PR de corrección de inclinación en el servicio: https://github.com/ProjectSidewalk/sidewalk-ai-api/pull/17
- Plataforma `SidewalkWebpage`: https://github.com/ProjectSidewalk/SidewalkWebpage
- Herramientas de renderizado de panoramas `sidewalk-panorama-tools`: https://github.com/ProjectSidewalk/sidewalk-panorama-tools
- Proyecto Project Sidewalk: https://projectsidewalk.org
- Paper de DINOv2 (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
- Project Sidewalk: herramienta de crowdsourcing para accesibilidad de aceras (ResearchGate): https://www.researchgate.net/publication/331319766_Project_Sidewalk_A_Web-based_Crowdsourcing_Tool_for_Collecting_Sidewalk_Accessibility_Data_At_Scale
- Automating City Accessibility Constraints Mapping Through AI (IET Smart Cities): https://ietresearch.onlinelibrary.wiley.com/doi/10.1049/smc2.70020
- ZuriACT: Zurich Accessible CiTy (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S2667091726000580
