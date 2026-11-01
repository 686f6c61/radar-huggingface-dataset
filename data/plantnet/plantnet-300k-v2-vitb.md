# PlantNet/plantnet-300k-v2-vitb

## Resumen

Pl@ntNet-300K-v2 — DINOv3 ViT-B/16 es un clasificador de imágenes de plantas desarrollado por PlantNet (Pl@ntNet), el consorcio científico francés detrás de la aplicación ciudadana de identificación de flora. Se trata de un ajuste fino (fine-tuning) supervisado del encoder visual `facebook/dinov3-vitb16-pretrain-lvd1689m` sobre el conjunto de datos Pl@ntNet-300K-v2, orientado a la clasificación de 1.000 especies vegetales a partir de fotografías RGB de 224 × 224 píxeles.

El modelo resuelve un problema clásico de visión por computador aplicada a biodiversidad: la identificación automática de especies con alta ambigüedad de etiqueta y distribución de cola larga. Al partir de un backbone DINOv3 ViT-B/16 (transformer de visión con 768 dimensiones de embedding), aprovecha representaciones auto-supervisadas de gran calidad y las adapta a una taxonomía cerrada de 1.000 clases, alcanzando una precisión de test de 0,8457.

Es relevante ahora porque forma parte del linaje Pl@ntNet-300K-v2 y del trabajo recogido en el preprint arXiv:2604.27178 sobre monitoreo energéticamente eficiente de plantas mediante destilación de conocimiento, lo que lo sitúa como pieza de referencia para pipelines de identificación botánica a gran escala. El repositorio ocupa 0,3 GB y se distribuye con licencia DINOv3, que es license-gated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-B/16 (Vision Transformer, patch 16) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 × 224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión; etiquetas de especie en el CSV de metadatos) |
| Licencia | dinov3-license (license-gated, uso condicionado) |
| Formato de pesos | `model.pth` (PyTorch), cargado mediante `model.py` y `transforms.py` incluidos en el repo |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer base con parches de 16 × 16 (ViT-B/16) procedente de la familia DINOv3, preentrenado de forma auto-supervisada por Meta en el checkpoint `facebook/dinov3-vitb16-pretrain-lvd1689m`. Sobre ese backbone se aplica un ajuste fino supervisado con una cabeza de clasificación de 1.000 clases, manteniendo una dimensión de embedding de 768. La entrada se redimensiona y recorta a 224 × 224 píxeles RGB y se normaliza con estadísticas específicas de Pl@ntNet: media `(0.4425, 0.4695, 0.3266)` y desviación típica `(0.2353, 0.2219, 0.2325)`.

El entrenamiento se realiza sobre Pl@ntNet-300K-v2, un dataset de imágenes de plantas con alta ambigüedad de etiqueta y distribución de cola larga, descrito en el artículo de NeurIPS Datasets and Benchmarks 2021. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables en un clasificador de visión). El trabajo asociado (Moummad et al., 2026, arXiv:2604.27178) aborda monitoreo de plantas energéticamente eficiente mediante destilación de conocimiento, lo que sugiere que este checkpoint ViT-B/16 actúa como modelo profesor o referencia en esa línea. No se documentan innovaciones como decodificación especulativa ni atención lineal.

## Capacidades

- Clasificación de imágenes de plantas en 1.000 especies (image-classification).
- Extracción de embeddings visuales de 768 dimensiones, útiles para búsqueda por similitud, clustering y recuperación de imágenes.
- Identificación de especie a partir de una única fotografía RGB de 224 × 224.
- Salida conjunta de embeddings y logits del clasificador mediante una única pasada (`model(image)` devuelve `embeddings, logits`).
- Integración con el ecosistema Hugging Face (`transformers`, `snapshot_download`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador discriminativo, no un modelo generativo.
- No dispone de capacidades multilingües, de audio ni de modo "thinking".

## Casos de uso

- Identificación de especies en aplicaciones de ciencia ciudadana: el modelo clasifica una foto en una de las 1.000 especies del dataset y puede integrarse en la app o API de Pl@ntNet para preetiquetar observaciones antes de la validación humana.
- Monitorización de biodiversidad en campo: despliegue en dispositivos con GPU o en servidores para procesar lotes de imágenes de cámaras trampa y generar inventarios de flora por parcela.
- Búsqueda visual por similitud: usar los embeddings de 768 dimensiones para recuperar imágenes de la misma especie en bases de datos botánicas o herbarios digitalizados.
- Filtrado y curación de datasets: clasificar automáticamente imágenes recolectadas por usuarios o por raspado web para descartar las que no corresponden a la especie declarada.
- Investigación en visión por computador: servir como baseline o modelo profesor en experimentos de destilación de conocimiento y eficiencia energética, en línea con el preprint arXiv:2604.27178.
- Agricultura de precisión y seguimiento de cultivos: identificación de especies adventicias o de interés agronómico en imágenes capturadas con drones o teléfonos, siempre que la especie esté entre las 1.000 clases.
- Docencia y divulgación botánica: herramienta de apoyo para prácticas de identificación en universidades y jardines botánicos.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son la precisión de validación y de test del propio modelo:

| Metrica | Valor |
|---|---|
| Best validation accuracy | 0,8462 |
| Test accuracy | 0,8457 |
| Clases | 1.000 |
| Dimensión de embedding | 768 |
| Tamaño de entrada | 224 × 224 RGB |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un clasificador de imágenes y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un ViT-B/16 con 768 dimensiones de embedding y entrada 224 × 224, la inferencia en FP32 requiere típicamente menos de 2 GB, y en FP16 menos de 1 GB, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se puede ejecutar en CPU para inferencia puntual (`device = "cuda" if torch.cuda.is_available() else "cpu"` en el ejemplo del autor).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: el repositorio proporciona `model.py` y `transforms.py` para cargar `model.pth` con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de visión de este tipo). La carga requiere aceptar la licencia DINOv3 y autenticarse en Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Clases | Precisión test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PlantNet/plantnet-300k-v2-vitb | no disponible (ViT-B/16, embedding 768) | 224 × 224 RGB | 1.000 | 0,8457 | dinov3-license | Hugging Face (license-gated) |
| facebook/dinov3-vitb16-pretrain-lvd1689m | no disponible (ViT-B/16) | 224 × 224 RGB | no aplica (backbone) | no disponible | dinov3-license | Hugging Face (license-gated) |
| Modelos Pl@ntNet anteriores | no disponible | no disponible | variable | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la comparativa se limita al backbone base y a la ausencia de cifras públicas de otros clasificadores Pl@ntNet.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset Pl@ntNet-300K-v2 presenta alta ambigüedad de etiqueta y distribución de cola larga, por lo que el rendimiento puede ser desigual entre especies frecuentes y raras.
- Riesgo de alucinación: al ser un clasificador cerrado de 1.000 clases, siempre devolverá una de las 1.000 especies aunque la imagen no corresponda a ninguna; no existe clase "desconocida" ni umbral de rechazo documentado.
- Limitaciones de contexto o idioma: no aplica contexto textual; las etiquetas de especie provienen de `species_metadata.csv` y no se documenta su cobertura lingüística.
- Restricciones de licencia: la licencia `dinov3-license` es license-gated y condiciona el uso comercial; es necesario aceptar la licencia del modelo base DINOv3 y autenticarse en Hugging Face antes de la primera carga.
- Caveat para producción: el repositorio no incluye pesos en formato `safetensors` ni `GGUF`, solo `model.pth` con código de carga propio (`model.py`, `transforms.py`), lo que requiere confiar en el código del autor y añadir el directorio del modelo a `sys.path`.
- El campo `inference: false` en la model card indica que el pipeline de Hugging Face no está habilitado por defecto, por lo que la inferencia debe hacerse con el código incluido.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues a gran escala sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PlantNet/plantnet-300k-v2-vitb
- Modelo base DINOv3 ViT-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Dataset Pl@ntNet-300K-v2: https://zenodo.org/records/10419064
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Preprint arXiv:2604.27178: https://arxiv.org/abs/2604.27178
- Pl@ntNet (sitio principal): https://plantnet.org/
- Pl@ntNet identify: https://identify.plantnet.org/fr
- Documentación de Pl@ntNet: https://docs.plantnet.org/fr/tutorials/install-plantnet/
