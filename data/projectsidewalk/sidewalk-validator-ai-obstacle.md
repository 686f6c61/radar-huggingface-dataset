# projectsidewalk/sidewalk-validator-ai-obstacle

## Resumen

`sidewalk-validator-ai-obstacle` es un clasificador binario de imágenes desarrollado por el equipo de Project Sidewalk (Universidad de Washington) para validar automáticamente las etiquetas de tipo *Obstacle* que los voluntarios introducen en su plataforma de cartografiado colaborativo de accesibilidad peatonal. Dado un recorte de imagen a pie de calle centrado en la etiqueta, el modelo predice si esa etiqueta es correcta (la imagen muestra un obstáculo en la acera) o incorrecta. Se trata de un ajuste fino de `facebook/dinov2-large` con una cabeza de dos clases, con 304.372.738 parámetros en total y pesos en safetensors bajo licencia MIT.

El problema que resuelve es concreto: Project Sidewalk acumula etiquetas generadas por personas y necesita un primer filtro automático antes de la validación humana. El modelo no sustituye al validador humano; se integra en `sidewalk-ai-api`, que reconstruye el recorte desde el panorama original, ejecuta la inferencia y consulta la confianza del veredicto en un mapa de precisión (`confidence_precision_map.json`). La web (`SidewalkWebpage`) solo registra el voto automático Agree/Disagree cuando la precisión estimada para ese nivel de confianza es de al menos 0,92; en caso contrario, el resultado se almacena como Unsure.

Es relevante ahora porque forma parte de una familia creciente de validadores por tipo de etiqueta (crosswalk, curbramp, obstacle) publicados en la misma colección de Hugging Face, y porque documenta de forma explícita el rendimiento en ciudades no vistas durante el entrenamiento (accuracy 0,724 frente a 0,814 en ciudades vistas), un dato poco habitual y crítico para decidir si el modelo es desplegable fuera de su dominio original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv2-large) con cabeza de clasificación lineal de 2 clases; clasificación de imagen supervisada |
| Parametros totales | 304.372.738 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagen; entrada 224×224 px) |
| Tipos de cuantizacion | no disponible (no se publican artefactos cuantizados; compatible con cuantización estándar de `transformers`) |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`transformers`); repo de 8,5 GB |

Otros datos: pipeline `image-classification`, `id2label = {0: correct, 1: incorrect}`, dataset de entrenamiento `projectsidewalk/sidewalk-validator-ai-dataset-obstacle`, 28 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo parte de DINOv2-large (ViT auto-supervisado preentrenado en datos de imagen, ver arXiv:2304.07193) y sustituye la cabeza original por un clasificador lineal de dos salidas (`correct` / `incorrect`). El ajuste fino se hizo con el `Trainer` de Hugging Face: learning rate 1e-5, batch 8 con acumulación de gradiente ×4, calentamiento del 10 %, 25 épocas y semilla 42. Se publican los pesos del checkpoint con mejor macro-F1 de validación (0,816; `checkpoint-6930`), y el `trainer_state.json` conserva el historial completo. La augmentación se limita a `RandomResizedCrop(224, scale=(0.7, 1.0))` y volteos horizontales; la validación usa el procesador tal cual.

Los datos provienen de votos de validación **humanos** (los votos de IA se excluyen), con los umbrales detallados en la tarjeta del dataset. Reparto: 10.554 ejemplos de entrenamiento, 2.262 de validación, 2.266 de test y 1.812 de test_heldout (Tucson, AZ, más dos despliegues no públicos). El split está agrupado por panorama (ningún panorama aparece en dos particiones), estratificado por clase y con ciudades completas reservadas para la partición held-out.

La parte más delicada del pipeline no es el modelo, sino la construcción del recorte de entrada: el panorama se redimensiona a 8192×4096, se renderiza una vista en perspectiva de 2048² con 90° de campo de visión **centrada en la etiqueta**, con corrección de inclinación de la cámara (pitch/roll, beta = 0,95). Depth Anything V2 (métrica, VKITTI, ViT-B) estima la profundidad en el centro de la vista y el semiancho del recorte se calcula como `6100 / depth_m` píxeles, recortado a la vista; el lado largo se reescala a 640 px y se almacena como WebP de calidad 95. Cualquier despliegue debe replicar exactamente esta corrección de inclinación (ver PR #17 de `sidewalk-ai-api`), porque el modelo no es invariante a ese paso de preprocesado.

## Capacidades

- Clasificación binaria de imagen: distingue entre etiqueta correcta e incorrecta para la clase *Obstacle* de Project Sidewalk.
- Salida de logits y probabilidades por clase, utilizables para umbralizar y para consultar el mapa de precisión por nivel de confianza.
- Funciona sobre recortes de imagen a pie de calle de 640 px (lado largo) reescalados a 224×224 con normalización ImageNet.
- No incluye capacidades de generación de texto, razonamiento multi-paso, matemáticas, código, tool calling ni agentes.
- No procesa texto ni audio; no es multilingüe en ningún sentido operativo.
- Sirve como extractor de características DINOv2-large subyacente, reutilizable para otras tareas de visión con un nuevo ajuste fino.
- Diseñado específicamente como componente de un pipeline de moderación (veredicto + confianza + umbral de precisión), no como modelo autónomo.

## Casos de uso

- **Validación automática de etiquetas Obstacle en producción**: `sidewalk-ai-api` reconstruye el recorte desde el panorama y el punto de la etiqueta, ejecuta el modelo y compara la confianza con `confidence_precision_map.json`; si la precisión estimada alcanza 0,92, `SidewalkWebpage` registra un voto Agree/Disagree del usuario `SidewalkAI`. Es el uso previsto y el único documentado.
- **Triaje de la cola de validación humana**: ordenar las etiquetas nuevas por confianza del modelo permite a los validadores humanos empezar por los casos dudosos (probabilidad cercana a 0,5) y reducir el tiempo medio por etiqueta.
- **Auditoría retroactiva de calidad del dataset**: ejecutar el modelo sobre etiquetas ya validadas y revisar las discrepancias como candidatas a error humano, con el subconjunto `hard` (11 filas que el modelo desplegado falló) como referencia de los casos más difíciles.
- **Estimación de dominio antes de expandir a nuevas ciudades**: usar la partición `test_heldout` (accuracy 0,724, balanced accuracy 0,759) como expectativa realista al desplegar en una ciudad no incluida en el entrenamiento, y decidir si se requiere reentrenamiento o un umbral de confianza más conservador.
- **Filtrado previo a análisis estadísticos de accesibilidad**: investigators que usen los datos abiertos de Project Sidewalk pueden descartar etiquetas con baja confianza antes de calcular índices de accesibilidad, reduciendo el ruido de las series por barrio.
- **Generación de datos de entrenamiento para otras clases**: los recortes con veredicto de alta confianza (correctos o incorrectos) sirven como pseudo-etiquetas para preentrenar o calibrar validadores de otras clases (crosswalk, curbramp) dentro de la misma familia.
- **Control de regresión del pipeline de recortes**: al depender de forma estricta del centrado, la corrección de inclinación y el cálculo de profundidad, el modelo actúa como test de integración: una caída de accuracy tras un cambio en `sidewalk-panorama-tools` o en la API delata un error en la reconstrucción del recorte.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y el model-index (precisión no verificada por terceros). El veredicto es el argmax, con empates resueltos a favor de `correct`, igual que en la API.

| Partición | n (correct / incorrect) | Accuracy | Balanced accuracy | AUC | Macro-F1 |
|---|---|---|---|---|---|
| test (ciudades vistas en entrenamiento) | 2.266 (1.305 / 961) | 0,814 | 0,805 | 0,883 | 0,808 |
| test_heldout (ciudades reservadas) | 1.812 (587 / 1.225) | 0,724 | 0,759 | 0,868 | 0,716 |
| hard (filas falladas por el modelo desplegado) | 11 (9 / 2) | 0,455 | 0,667 | 0,556 | 0,450 |

Por clase, en la partición test:

| Partición | Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|---|
| test | correct | 0,823 | 0,864 | 0,843 | 1.305 |
| test | incorrect | 0,801 | 0,747 | 0,773 | 961 |

Mejor macro-F1 de validación durante el entrenamiento: 0,816 (`checkpoint-6930`). El model-index solo publica la partición test (accuracy 0,8142, balanced accuracy 0,8054, AUC 0,8828, macro-F1 0,808). No hay comparación con modelos externos en la información disponible; la partición `hard` tiene un tamaño muestral (n=11) demasiado pequeño para extraer conclusiones.

## Requisitos de hardware

- **VRAM estimada en inferencia**: unos 1,2 GB en fp32 y unos 0,6 GB en fp16/bf16 para los 304 M de parámetros, más el espacio de activaciones (mínimo con batch pequeño a 224×224). En la práctica, menos de 2 GB para batch 1–8.
- **GPU recomendadas**: cualquiera con 4 GB o más. Para servicio de alta concurrencia, A100 o H100 permiten batches grandes; para un servicio modesto, una RTX 4090 o L4 es más que suficiente.
- **Consumer GPU**: sí, cabe holgadamente en GTX 1660/RTX 3060 en adelante, e incluso en CPU para volúmenes bajos (la latencia en CPU no está documentada).
- **Formatos y despliegue**: `transformers` con `AutoImageProcessor` (`use_fast=False`, para replicar la ruta PIL de la API) y `AutoModelForImageClassification`. No hay artefactos GGUF/ONNX oficiales; `vLLM` y `TGI` no son aplicables a este tipo de modelo (no generativo). Para servir a escala, `torch.compile` o exportación a ONNX/TensorRT son las vías habituales, sin datos publicados de mejora.
- **Latencia y throughput**: no disponibles. El cuello de botella real en producción no es la inferencia, sino la reconstrucción del recorte (render de perspectiva 2048² desde un panorama 8192×4096) y la estimación de profundidad con Depth Anything V2.
- **Almacenamiento**: el repo ocupa 8,5 GB porque incluye checkpoints de entrenamiento; los pesos necesarios para inferencia son una fracción de ese tamaño.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sidewalk-validator-ai-obstacle` | Clasificador binario (DINOv2-large fine-tuned) | 304,4 M | imagen 224×224 (recorte de 640 px) | Accuracy test 0,814; heldout 0,724; macro-F1 0,808 | MIT | Hugging Face, público |
| `projectsidewalk/sidewalk-validator-ai-crosswalk` | Validador de la clase Crosswalk | no disponible | no disponible | no disponible | no disponible | Hugging Face (colección Project Sidewalk) |
| `projectsidewalk/sidewalk-validator-ai-curbramp` | Validador de la clase Curb Ramp | no disponible | no disponible | no disponible | no disponible | Hugging Face (colección Project Sidewalk) |
| `facebook/dinov2-large` (modelo base) | Extractor de características ViT auto-supervisado | 304,4 M | imagen | no evaluado en esta tarea; requiere cabeza y ajuste fino | no disponible en la información proporcionada | Hugging Face, público |

La comparación directa con los modelos hermanos de la colección no es posible con los datos disponibles: se desconoce su tamaño, contexto de evaluación y licencia. Respecto al modelo base, la diferencia operativa es que este checkpoint incorpora la cabeza de dos clases y el preprocesado específico del dominio, pero también hereda su dependencia del pipeline de recortes.

## Limitaciones y advertencias

- **Caída de rendimiento fuera del dominio**: en ciudades no vistas en entrenamiento la accuracy baja de 0,814 a 0,724 y el macro-F1 de 0,808 a 0,716. Cualquier despliegue en una ciudad nueva debe asumir esa pérdida y ajustar el umbral de confianza.
- **Dependencia estricta del preprocesado**: el modelo espera recortes centrados en la etiqueta, con corrección de inclinación de la cámara y semiancho calculado a partir de la profundidad. Un recorte generado de otra forma degrada el resultado sin aviso; la corrección de inclinación en la API es obligatoria (PR #17).
- **Alcance limitado a una sola clase**: solo valida etiquetas *Obstacle* y solo como clasificación binaria. La detección de elementos en panoramas completos es tarea de otro modelo (RampNet), y otras clases requieren sus propios validadores.
- **Riesgo de error confiado (no de alucinación generativa)**: al ser un clasificador no genera texto, pero puede producir una probabilidad alta sobre un veredicto erróneo. La mitigación documentada es externa al modelo: el umbral de precisión de 0,92 y el mapa de precisión por confianza. Esa calibración debe revalidarse si cambia la distribución de imágenes.
- **Sesgos potenciales**: el dataset se compone de votos humanos de despliegues de Project Sidewalk (ciudades estadounidenses y dos despliegues no públicos), por lo que la morfología urbana, el tipo de mobiliario y las condiciones de captura están sobrerrepresentadas respecto a otras regiones. No hay análisis de sesgo por ciudad, tipo de calle o condiciones de iluminación en la información disponible.
- **Muestras pequeñas en la partición difícil**: el subconjunto `hard` tiene solo 11 filas; su accuracy de 0,455 no es una estimación fiable de rendimiento en casos límite.
- **Publicación del dataset incompleta**: la model card contiene marcadores `TODO` (hash del dataset) y señala que el repositorio enlazado contiene una selección anterior; la publicación de los datos de entrenamiento reales (que incluyen despliegues no públicos) sigue siendo una decisión de política abierta (issues #2 y #7). La reproducibilidad exacta no está garantizada.
- **Uso comercial**: la licencia del modelo es MIT, permisiva. Ahora bien, la licencia de los pesos del modelo base DINOv2-large no se especifica en la información disponible y conviene verificarla antes de un uso comercial del derivado.
- **Cifras no verificadas**: todos los resultados proceden del autor (`verified: false` en el model-index); no hay evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/projectsidewalk/sidewalk-validator-ai-obstacle
- Dataset de entrenamiento: https://huggingface.co/datasets/projectsidewalk/sidewalk-validator-ai-dataset-obstacle
- Colección de validadores de Project Sidewalk: https://huggingface.co/collections/projectsidewalk/project-sidewalk-validator-models-datasets
- Organización en Hugging Face: https://huggingface.co/projectsidewalk
- Modelo base DINOv2-large: https://huggingface.co/facebook/dinov2-large
- Paper DINOv2 (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
- Repositorio de entrenamiento `sidewalk-validator-ai`: https://github.com/ProjectSidewalk/sidewalk-validator-ai
- API de servicio `sidewalk-ai-api`: https://github.com/ProjectSidewalk/sidewalk-ai-api
- PR de corrección de inclinación en la API: https://github.com/ProjectSidewalk/sidewalk-ai-api/pull/17
- Web de Project Sidewalk `SidewalkWebpage`: https://github.com/ProjectSidewalk/SidewalkWebpage
- Issue sobre publicación del dataset (#2): https://github.com/ProjectSidewalk/sidewalk-validator-ai/issues/2
- Issue sobre política de datos (#7): https://github.com/ProjectSidewalk/sidewalk-validator-ai/issues/7
- Herramientas de panorama `sidewalk-panorama-tools`: https://github.com/ProjectSidewalk/sidewalk-panorama-tools
- Plataforma Project Sidewalk: https://projectsidewalk.org
- Artículo sobre Project Sidewalk (ResearchGate, 2018): https://www.researchgate.net/publication/331319766_Project_Sidewalk_A_Web-based_Crowdsourcing_Tool_for_Collecting_Sidewalk_Accessibility_Data_At_Scale
- Estudio sobre Sidewalk AI Scanner (Royal Society, 2024): https://royalsocietypublishing.org/rsta/article/382/2285/20240106/108438/Mapping-sidewalk-accessibility-with-smartphone
