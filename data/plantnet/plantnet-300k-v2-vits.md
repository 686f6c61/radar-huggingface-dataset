# PlantNet/plantnet-300k-v2-vits

## Resumen

Pl@ntNet-300K-v2-vits es un clasificador de imágenes de plantas desarrollado por PlantNet (el consorcio científico detrás de la aplicación ciudadana Pl@ntNet). Se trata de un fine-tuning del encoder de visión auto-supervisado DINOv3 ViT-S/16 de Meta AI sobre el dataset Pl@ntNet-300K-v2, un corpus de imágenes de plantas con etiquetas ambiguas y distribución de cola larga. El modelo resuelve una tarea concreta: asignar una imagen RGB de 224 × 224 píxeles a una de 1.000 especies vegetales, devolviendo simultáneamente el embedding de 384 dimensiones y los logits del clasificador.

La relevancia del modelo reside en su tamaño contenido (ViT-S/16, ~21 M de parámetros en el encoder) y en su rendimiento reportado por el autor: 0,8297 de accuracy en test sobre 1.000 clases, una cifra notable para un modelo que cabe en cualquier GPU de consumo. Forma parte del trabajo "Energy-Efficient Plant Monitoring via Knowledge Distillation" (arXiv:2604.27178), orientado a despliegues de bajo consumo en monitorización vegetal.

El modelo se distribuye en formato PyTorch (`model.pth`) con un cargador propio (`model.py`, `transforms.py`), no como un checkpoint estándar de `transformers` pese a declarar esa librería. La licencia es la DINOv3 License de Meta, que es *license-gated*: requiere aceptar la licencia del modelo base y autenticarse en Hugging Face antes de la primera carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-S/16 (Vision Transformer, patch size 16) |
| Parametros totales | no disponible (ViT-S/16, encoder de ~21 M; total con cabeza de clasificación no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 × 224 RGB) |
| Tipos de cuantizacion | no disponible (solo se documenta checkpoint PyTorch en fp32/fp16 estándar) |
| Idiomas soportados | no aplica (clasificación de imágenes; nombres de especie en `species_metadata.csv`, idioma no especificado) |
| Licencia | dinov3-license (DINOv3 License de Meta AI, license-gated) |
| Formato de pesos | PyTorch (`model.pth`), con `model.py`, `transforms.py` y `species_metadata.csv` en el repo |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer pequeño (ViT-S/16) preentrenado con el método auto-supervisado DINOv3 de Meta AI sobre el dataset LVD-1689M (`facebook/dinov3-vits16-pretrain-lvd1689m`). Sobre ese encoder se ha añadido una cabeza de clasificación lineal para 1.000 clases y se ha fine-tuneado de extremo a extremo sobre Pl@ntNet-300K-v2. El modelo devuelve dos salidas: el embedding de 384 dimensiones del encoder y los logits de las 1.000 especies.

El dataset de fine-tuning, Pl@ntNet-300K-v2 (Zenodo, registro 10419064), es una versión ampliada del Pl@ntNet-300K original presentado en NeurIPS Datasets and Benchmarks 2021. Se caracteriza por una alta ambigüedad de etiquetas (varias especies visualmente similares) y una distribución de cola larga, lo que lo convierte en un benchmark realista de clasificación fine-grained. El preprocesado usa resize/crop a 224 × 224 y normalización con media `(0.4425, 0.4695, 0.3266)` y desviación `(0.2353, 0.2219, 0.2325)`, calculadas sobre Pl@ntNet. El trabajo asociado (arXiv:2604.27178) aborda la destilación de conocimiento para monitorización vegetal energéticamente eficiente, lo que sugiere que este ViT-S se emplea como modelo profesor o como variante compacta de referencia. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO (no aplica en clasificación supervisada).

## Capacidades

- Clasificación de imágenes de plantas en 1.000 especies con una única etiqueta predicha (`argmax` sobre los logits).
- Extracción de embeddings visuales de 384 dimensiones, reutilizables para búsqueda por similitud, clustering o clasificación con otras cabezas.
- Clasificación fine-grained en un dominio con alta ambigüedad de etiquetas y cola larga, gracias al preentrenamiento DINOv3.
- Inferencia en CPU y GPU (el código de ejemplo selecciona `cuda` si está disponible).
- Metadatos de especie asociados vía `species_metadata.csv` (mapeo `species_id` → `full_species`).
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente discriminativo de visión.
- Capacidades multilingües: no aplica; los nombres de especie del CSV no declaran idioma.

## Casos de uso

- Identificación de especies en aplicaciones móviles de ciencia ciudadana: el modelo clasifica una foto de 224 × 224 en una de 1.000 especies y devuelve el `species_id` para consultar metadatos, integrándose en el flujo de Pl@ntNet con 0,83 de accuracy en test.
- Monitorización de biodiversidad en campo con hardware de bajo consumo: al ser un ViT-S/16 (~21 M de parámetros en el encoder), puede ejecutarse en dispositivos edge o Raspberry Pi con GPU integrada, encajando con el enfoque de eficiencia energética del paper asociado.
- Filtrado automático de imágenes en herbarios digitales: usar los embeddings de 384 dimensiones para agrupar o pre-etiquetar especímenes antes de la revisión taxonómica humana.
- Búsqueda visual por similitud: indexar los embeddings del encoder y recuperar las especies o imágenes más próximas mediante distancia coseno, útil en catálogos botánicos.
- Pre-etiquetado en pipelines de anotación: el clasificador propone una especie y un score, reduciendo el coste de etiquetado manual en proyectos de conservación.
- Docencia y experimentación en visión por computador: modelo pequeño y reproducible para comparar fine-tuning completo frente a linear probing sobre DINOv3 en un dataset fine-grained real.
- Detección temprana de especies invasoras en imágenes de trampas de fauna: clasificación rápida por lotes con umbral de confianza sobre los logits.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Metrica | Valor |
|---|---|
| Mejor accuracy de validación | 0,8296 |
| Accuracy de test | 0,8297 |
| Numero de clases | 1.000 |
| Dimension del embedding | 384 |
| Tamano de entrada | 224 × 224 RGB |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican; no hay comparación con otros clasificadores de plantas).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un ViT-S/16 en fp32 ocupa del orden de 0,1 GB de pesos (el repo completo pesa 0,1 GB), por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; RTX 4090, A100 o H100 aportan throughput masivo por lotes, pero no son necesarias.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU para inferencia puntual.
- Opciones de despliegue: el repo incluye un cargador propio (`model.py`) que requiere `torch`, `Pillow`, `pandas` y `huggingface_hub`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de visión de este formato). Se puede exportar a TorchScript/ONNX manualmente, aunque no está documentado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Accuracy test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PlantNet/plantnet-300k-v2-vits | ViT-S/16 (~21 M encoder) | 224 × 224 | 1.000 | 0,8297 | DINOv3 License (gated) | Hugging Face |
| Pl@ntNet-300K original (baseline del paper NeurIPS 2021) | no disponible | no disponible | 1.081 | no disponible | no disponible | Dataset en Zenodo |
| facebook/dinov3-vits16-pretrain-lvd1689m (base) | ViT-S/16 | 224 × 224 | no aplica (auto-supervisado) | no aplica | DINOv3 License (gated) | Hugging Face |

No se dispone de datos de benchmarks de clasificadores alternativos de plantas en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Solo cubre 1.000 especies; cualquier imagen fuera de ese conjunto se asignará a la clase más probable entre las 1.000, sin opción de "desconocido".
- El dataset de origen tiene alta ambigüedad de etiquetas y cola larga, por lo que las especies raras pueden tener un rendimiento muy inferior a la media de 0,83.
- Riesgo de alucinación en sentido discriminativo: el modelo siempre devuelve una clase, aunque la confianza sea baja; es imprescindible aplicar umbrales sobre los logits en producción.
- La licencia DINOv3 de Meta es *license-gated* y puede imponer restricciones al uso comercial; hay que aceptarla y autenticarse en Hugging Face antes de cargar el modelo base.
- El repo no expone un `AutoModelForImageClassification` estándar de `transformers`; requiere el cargador propio, lo que complica su integración en pipelines que esperan la API estándar.
- No se documentan sesgos geográficos o taxonómicos del dataset de fine-tuning, pero al derivar de Pl@ntNet es probable un sesgo hacia la flora europea y hacia las especies más fotografiadas.
- No hay información sobre cuantización oficial ni sobre latencia/throughput medidos, lo que limita las garantías para despliegues de producción estrictos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PlantNet/plantnet-300k-v2-vits
- Modelo base DINOv3 ViT-S/16: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Dataset Pl@ntNet-300K-v2 (Zenodo): https://zenodo.org/records/10419064
- Paper asociado (arXiv:2604.27178): https://arxiv.org/abs/2604.27178
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Pl@ntNet (sitio oficial): https://plantnet.org/
- Pl@ntNet identify: https://identify.plantnet.org/fr
- Documentación de Pl@ntNet: https://docs.plantnet.org/fr/tutorials/install-plantnet/
