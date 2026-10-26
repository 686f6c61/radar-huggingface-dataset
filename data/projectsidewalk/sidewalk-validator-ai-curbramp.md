# projectsidewalk/sidewalk-validator-ai-curbramp

## Resumen

`sidewalk-validator-ai-curbramp` es un clasificador de imágenes binario desarrollado por el equipo de Project Sidewalk (Universidad de Washington) para validar automáticamente las etiquetas de tipo *curb ramp* (rampa de bordillo o vado) que los voluntarios introducen en su plataforma de cartografía colaborativa de aceras. Dada una imagen de calle recortada y centrada en la etiqueta, el modelo predice si la etiqueta es `correct` (la imagen contiene realmente una rampa de bordillo) o `incorrect`, con el objetivo de priorizar o filtrar la revisión humana y acelerar la validación de miles de etiquetas.

Técnicamente es un ajuste fino de `facebook/dinov2-large`, un transformer de visión (ViT) de 304 millones de parámetros, al que se le ha añadido una cabeza de clasificación de dos clases. No es un modelo generativo ni multimodal: no procesa texto, no admite tool calling y su única salida es una distribución de probabilidad sobre dos etiquetas. El interés para desarrolladores e investigadores radica en el dominio tan específico (imágenes de street view a nivel de calle, con corrección de inclinación de la cámara) y en la integración con un umbral de confianza calibrado que decide cuándo una predicción se registra como voto válido.

El modelo se publica bajo licencia MIT, con pesos en safetensors y pipeline `image-classification` de Hugging Face Transformers, lo que permite desplegarlo en infraestructura modesta y usarlo como componente de un pipeline más amplio de validación de calidad de datos geoespaciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT) DINOv2-large con cabeza de clasificación lineal de 2 clases |
| Parámetros totales | 304.372.738 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen; entrada 224×224 px tras preprocesado) |
| Tipos de cuantización | no disponible (el repo publica pesos safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no aplica / no disponible (modelo de visión sin componente de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 8,5 GB, incluyendo checkpoints) |

## Arquitectura y entrenamiento

La base es `facebook/dinov2-large`, un ViT de 24 bloques y 304 M de parámetros preentrenado con auto-supervisión (DINOv2) sobre un corpus curado de imágenes. Sobre las representaciones del token CLS se añade una cabeza de clasificación de dos clases con `id2label = {0: correct, 1: incorrect}`. El preprocesado de inferencia usa `BitImageProcessor`: redimensionado del lado corto a 256 px, recorte central a 224 px y normalización con media y desviación estándar de ImageNet; se recomienda cargarlo con `use_fast=False` para replicar la ruta PIL de la API de servicio.

El ajuste fino se hizo con el `Trainer` de Hugging Face: tasa de aprendizaje 1e-5, batch de 8 con acumulación de gradiente ×4, 10 % de warm-up, 25 épocas y semilla 42, con aumentos de datos limitados a `RandomResizedCrop(224, scale=(0.7, 1.0))` y volteo horizontal. Los pesos publicados corresponden al checkpoint con mejor macro-F1 de validación (0,916; `checkpoint-4340`). Las etiquetas de entrenamiento provienen exclusivamente de votos de validación humanos, excluyendo los votos generados por IA. El conjunto de datos (`sidewalk-validator-ai-dataset-curbramp`) se divide agrupando por panorámica (ninguna panorámica aparece en dos particiones), con estratificación por clase y semilla fija: 6.925 ejemplos de entrenamiento, 1.487 de validación, 1.479 de test y 546 de test retenido (*held-out*, ciudades no vistas, incluidas Tucson-AZ y dos despliegues no públicos).

La innovación técnica relevante no está en la arquitectura sino en el pipeline de construcción de la entrada: la panorámica se redimensiona a 8192×4096, se renderiza una vista en perspectiva de 2048² con 90° de campo de visión centrada en la etiqueta, se corrige la inclinación de la cámara (pitch y roll, beta = 0,95) y se estima la profundidad en el centro con Depth Anything V2 (métrico, VKITTI, ViT-B) para fijar el medio ancho del recorte como `6100 / depth_m` píxeles, con el lado largo reescalado a 640 px. Es imprescindible que la API de servicio aplique la misma corrección de inclinación, ya que el modelo espera exactamente ese tipo de recorte.

## Capacidades

- Clasificación binaria de imágenes: devuelve la probabilidad de que un recorte centrado en una etiqueta *curb ramp* sea `correct` o `incorrect`.
- Validación automática de etiquetas colaborativas como señal auxiliar de calidad, no como sustituto de la revisión humana.
- Integración con un mapa de calibración de confianza (`confidence_precision_map.json`) que permite estimar la precisión esperada para cada nivel de confianza de la predicción.
- Funcionamiento sobre recortes de street view corregidos por inclinación y escalados según profundidad estimada.
- Evaluación específica de generalización a ciudades no vistas (partición `test_heldout`).
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, capacidades multilingües ni otro tipo de etiquetas (barreras, aceras inexistentes, pasos de peatones).
- No está diseñado para localizar elementos en panorámicas completas; esa tarea corresponde a otro modelo del proyecto (RampNet).

## Casos de uso

- **Validación automática de nuevas etiquetas en Project Sidewalk**: `sidewalk-ai-api` reconstruye el recorte a partir de la panorámica y el punto de la etiqueta, ejecuta el modelo y consulta la confianza en el mapa de calibración. Si la precisión estimada es al menos 0,92 (`ai-validation-min-accuracy`), `SidewalkWebpage` registra el veredicto como voto Agree/Disagree de la cuenta `SidewalkAI`; en caso contrario se almacena como Unsure. Es el uso principal y ya está en producción.
- **Priorización del trabajo de revisión humana**: en lugar de que los voluntarios revisen etiquetas en orden aleatorio, el pipeline puede ordenar la cola por confianza del modelo, de modo que los casos dudosos (probabilidad cercana a 0,5) se revisen primero y los casos claros se deleguen.
- **Auditoría retrospectiva de calidad del corpus**: ejecutar el clasificador sobre etiquetas históricas ya validadas y analizar la tasa de discrepancia por ciudad, tipo de imagen o proveedor de panorámicas, para detectar sesgos sistemáticos en la recogida de datos.
- **Filtrado previo en ingestas masivas de terceros**: al importar etiquetas de una nueva fuente o despliegue, usar el modelo como primer filtro para descartar candidatos claramente incorrectos antes de costear la validación humana.
- **Investigación en visión aplicada a accesibilidad urbana**: servir como línea base reproducible (pesos, semilla, splits y script de evaluación publicados) para comparar nuevas arquitecturas o estrategias de aumento de datos en la misma tarea.
- **Monitorización de deriva en producción**: ejecutar el modelo periódicamente sobre un conjunto fijo de etiquetas de referencia y vigilar la precisión estimada; una caída sostenida puede indicar cambios en el proveedor de panorámicas, en el renderizado o en la corrección de inclinación.
- **Docencia y prototipado de pipelines de validación**: el ejemplo mínimo de la model card (procesador + modelo + softmax) permite ilustrar en pocas líneas cómo se integra un clasificador de visión en un sistema de control de calidad.

## Benchmarks y rendimiento

Resultados declarados por el autor, sobre el mejor checkpoint, con el argmax como veredicto (los empates van a `correct`, igual que en la API).

| Partición | n (correct / incorrect) | Accuracy | Balanced accuracy | AUC | Macro-F1 |
|---|---|---|---|---|---|
| test (ciudades vistas en entrenamiento) | 1.479 (812 / 667) | 0,915 | 0,914 | 0,968 | 0,914 |
| test_heldout (ciudades no vistas) | 546 (318 / 228) | 0,826 | 0,834 | 0,907 | 0,825 |
| hard (filas de test y test_heldout que el modelo desplegado falló) | 23 (22 / 1) | 0,478 | 0,250 | 0,091 | 0,324 |

Resultados por clase:

| Partición | Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|---|
| test | correct | 0,921 | 0,924 | 0,923 | 812 |
| test | incorrect | 0,907 | 0,904 | 0,905 | 667 |
| test_heldout | correct | 0,905 | 0,783 | no disponible (truncado en la información) | 318 |
| test_heldout | incorrect | no disponible (truncado en la información) | no disponible | no disponible | 228 |

Métricas agregadas del `model-index` para la partición de test: accuracy 0,9148, balanced accuracy 0,9138, AUC 0,9676 y macro-F1 0,914. La caída de aproximadamente 9 puntos de accuracy al pasar a ciudades no vistas es el dato más relevante para planificar el despliegue en nuevas geografías.

## Requisitos de hardware

- **VRAM estimada**: unos 1,2 GB en fp32 (304 M de parámetros × 4 bytes) y unos 0,6 GB en fp16/bf16, sin contar el overhead de activaciones, que para lotes pequeños de 224×224 es reducido.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente. Para servicio de alto rendimiento, una L4, A10G o A100 con batch grande; para desarrollo, una RTX 3060/4060 o superior.
- **Consumer GPU**: sí, cabe holgadamente en tarjetas de 4-8 GB (GTX 1650, RTX 3050, RTX 4060, Apple Silicon con MPS).
- **CPU**: la inferencia es viable en CPU para volúmenes moderados; no se han publicado cifras de latencia.
- **Opciones de despliegue**: `transformers` con PyTorch (ruta documentada), TorchServe o FastAPI para servicio HTTP, `optimum`/ONNX Runtime para exportar y acelerar, y Triton Inference Server para lotes dinámicos. vLLM, llama.cpp, Ollama y TGI no aplican, al no ser un modelo de lenguaje.
- **Latencia y throughput**: no disponible. El coste dominante del pipeline en producción probablemente no sea la inferencia del clasificador, sino el renderizado de la vista en perspectiva y la estimación de profundidad con Depth Anything V2.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sidewalk-validator-ai-curbramp | Clasificador binario de etiquetas curb ramp | 304 M | imagen 224×224 (recorte corregido) | Accuracy 0,915 en test; 0,826 en ciudades no vistas | MIT | Hugging Face, pesos safetensors |
| facebook/dinov2-large (modelo base) | Backbone ViT auto-supervisado, sin cabeza de tarea | 304 M | imagen | No aplica: no produce veredictos sin ajuste | Apache 2.0 (según el modelo original) | Hugging Face |
| RampNet (Project Sidewalk) | Detección de rampas en panorámicas completas | no disponible | panorámica completa | no disponible en la información proporcionada | no disponible en la información | Repositorio del proyecto |
| Clasificadores genéricos tipo ResNet-50 / EfficientNet-B0 ajustados a la misma tarea | Clasificador de imagen | 25 M / 5 M aprox. | imagen | no disponible (no se han publicado comparativas en la información) | variable | Hugging Face / torchvision |

No se dispone de comparativas publicadas frente a otros validadores de etiquetas del mismo proyecto ni frente a alternativas de terceros; la comparación relevante es interna, entre el modelo y el backbone sin ajustar, y frente a la variante de detección del propio Project Sidewalk, que resuelve un problema distinto (localizar, no validar).

## Limitaciones y advertencias

- **Solo una clase de etiqueta**: el modelo únicamente valida *curb ramp*. Otros tipos de etiqueta de Project Sidewalk requieren modelos distintos.
- **Dependencia estricta del preprocesado**: espera recortes construidos con el pipeline documentado (vista de 2048² a 90° FOV centrada en la etiqueta, corrección de inclinación con beta = 0,95, escalado según profundidad). Cualquier desviación en el renderizado o en la corrección de inclinación degrada las predicciones sin aviso.
- **Caída de rendimiento fuera del dominio**: la accuracy baja de 0,915 a 0,826 en ciudades no vistas, y el subconjunto de casos difíciles se resuelve prácticamente al azar (accuracy 0,478, AUC 0,091). No debe usarse como única fuente de verdad.
- **Umbral de confianza obligatorio**: el sistema de producción solo emite un voto cuando la precisión estimada por el mapa de calibración alcanza 0,92; usar el argmax sin ese filtro eleva el riesgo de votos erróneos.
- **Sesgo geográfico y de captura**: el entrenamiento se apoya en despliegues concretos (incluida Tucson-AZ y dos despliegues no públicos) y en un proveedor de panorámicas específico; el comportamiento en otras ciudades, países o calidades de imagen no está caracterizado.
- **Riesgo de alucinación en sentido amplio**: al ser un clasificador, no genera texto, pero puede producir veredictos con alta confianza sobre imágenes ambiguas (rampas parcialmente ocluidas, obras, sombras, nieve), por lo que la validación humana sigue siendo necesaria.
- **Trazabilidad del conjunto de datos incompleta**: la model card indica que el repositorio de datos enlazado contiene una selección anterior y deja abierta la decisión de política sobre publicar los datos exactos de entrenamiento; el hash de contenido figura como pendiente. La reproducibilidad exacta no está garantizada.
- **Licencia MIT**: permite uso comercial y modificación con atribución, pero el modelo base DINOv2 tiene su propia licencia, que conviene revisar. No hay garantías ni soporte del autor.
- **Sin soporte multilingüe ni de texto**: no aplica a tareas de NLP, agentes ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/projectsidewalk/sidewalk-validator-ai-curbramp
- Conjunto de datos: https://huggingface.co/datasets/projectsidewalk/sidewalk-validator-ai-dataset-curbramp
- Modelo base: https://huggingface.co/facebook/dinov2-large
- Paper de DINOv2 (arXiv 2304.07193): https://arxiv.org/abs/2304.07193
- Repositorio de entrenamiento: https://github.com/ProjectSidewalk/sidewalk-validator-ai
- API de servicio: https://github.com/ProjectSidewalk/sidewalk-ai-api
- Corrección de inclinación en la API (PR #17): https://github.com/ProjectSidewalk/sidewalk-ai-api/pull/17
- Plataforma web: https://github.com/ProjectSidewalk/SidewalkWebpage
- Herramientas de panorámicas: https://github.com/ProjectSidewalk/sidewalk-panorama-tools
- Discusión sobre publicación del dataset (issue #2): https://github.com/ProjectSidewalk/sidewalk-validator-ai/issues/2
- Discusión sobre publicación del dataset (issue #7): https://github.com/ProjectSidewalk/sidewalk-validator-ai/issues/7
- Proyecto previo de visión por computador: https://github.com/ProjectSidewalk/sidewalk-cv-2021
- Sitio del proyecto: https://projectsidewalk.org
