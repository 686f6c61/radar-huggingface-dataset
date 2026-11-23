# 1aurent/vit_large_patch14_224.dinobloom

## Resumen

DinoBloom es un modelo de visión por computador especializado en la generación de embeddings de células sanguíneas para hematología. Se trata de un backbone ViT-Large (Vision Transformer) con parches de 14x14 píxeles y resolución de entrada de 224x224, desarrollado por el grupo MarrLab (Valentin Koch, Sophia J. Wagner, Carsten Marr y colaboradores) y publicado en arXiv en abril de 2024. El modelo se distribuye a través de Hugging Face bajo el identificador `1aurent/vit_large_patch14_224.dinobloom` y es compatible con la librería `timm`.

El problema que resuelve es la falta de representaciones generalizables para imágenes de frotis de sangre periférica y médula ósea: los modelos de visión genéricos (ImageNet) no capturan bien la morfología celular fina necesaria para tareas hematológicas. DinoBloom se entrena con auto-supervisión (DINO) sobre un corpus de imágenes de hematología, produciendo embeddings que sirven como base para clasificación, recuperación y segmentación de células.

Con 303,2 millones de parámetros (304M según la model card), es un modelo de tamaño "large" que cabe en GPUs de consumo para inferencia. Su relevancia actual radica en que ofrece un backbone preentrenado específico de dominio, con licencia Apache 2.0, listo para usarse vía `timm` en pipelines de investigación clínica y análisis de imagen microscópica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large), patch size 14x14, imagen 224x224 |
| Parametros totales | 303.227.904 (304M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224x3) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como PyTorch/ONNX) |
| Idiomas soportados | no disponible (modelo de imagen, sin componente textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DinoBloom es un Vision Transformer de tipo "large" con parches de 14x14 y resolución de 224x224, es decir, la variante `vit_large_patch14_224` de `timm`. La innovación no está en la arquitectura en sí, sino en el régimen de entrenamiento: se usa el paradigma auto-supervisado DINO (self-distillation with no labels) sobre un corpus de imágenes de hematología (frotis de sangre periférica y médula ósea), lo que permite aprender representaciones densas sin anotaciones manuales. El modelo se distribuye como backbone de extracción de características (`feature-extraction`) y también admite uso para clasificación de imagen.

La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino supervisado o RLHF (no aplicable en visión). El paper asociado (arXiv:2404.05022) es la referencia técnica para esos detalles. Los pesos originales están depositados en Zenodo (registro 10908163) y el repositorio de código es `github.com/marrlab/DinoBloom`.

## Capacidades

- Extracción de embeddings de imagen: produce un vector de características por imagen de entrada (salida `(batch_size, num_features)`).
- Clasificación de imágenes: puede usarse como backbone para cabezales de clasificación supervisada.
- Recuperación y agrupamiento (retrieval/clustering) de imágenes celulares por similitud de embeddings.
- Análisis de morfología celular en frotis de sangre periférica y médula ósea.
- Compatible con el ecosistema `timm`: transformaciones de normalización y resize resueltas automáticamente con `timm.data.resolve_model_data_config`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).
- No dispone de modo "thinking", visión generativa, audio ni generación de texto.

## Casos de uso

- Clasificación de tipos celulares en frotis de sangre periférica: se extraen embeddings con DinoBloom y se entrena un clasificador lineal o MLP encima para distinguir neutrófilos, linfocitos, monocitos, eosinófilos y basófilos, aprovechando que el backbone ya ha visto morfología hematológica.
- Detección de células anómalas en citología hematológica: los embeddings permiten separar blastos de células maduras en estudios de leucemia, sirviendo como etapa de pre-filtrado antes de la revisión por citólogo.
- Recuperación de imágenes similares (content-based image retrieval): indexar una base de imágenes de médula ósea y recuperar las más parecidas a una consulta para apoyar el diagnóstico por comparación.
- Agrupamiento no supervisado de poblaciones celulares: usar los embeddings para clustering (k-means, UMAP) y descubrir subpoblaciones morfológicas sin etiquetas previas.
- Preentrenamiento de pipelines de investigación: usar DinoBloom como inicialización para tareas de segmentación o detección celular con pocos datos anotados, reduciendo el coste de etiquetado.
- Control de calidad en laboratorio: detectar imágenes fuera de distribución (artefactos, mala tinción, desenfoque) comparando la distancia de sus embeddings respecto a la distribución de referencia.
- Docencia y validación de modelos: servir como baseline de dominio frente a ViT preentrenados en ImageNet en experimentos académicos de hematología computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de clasificación hematológica; para datos cuantitativos debe consultarse el paper arXiv:2404.05022.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (304M parámetros x 4 bytes), más activaciones; en la práctica, unos 2-3 GB para lotes pequeños a 224x224.
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB para pesos; en torno a 1,5-2 GB con activaciones para batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16; A100, H100, L40S o RTX 4090 para entrenamiento o fine-tuning a mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB con batch reducido.
- Opciones de despliegue: `timm` + PyTorch (vía nativa), exportación a ONNX Runtime, TorchScript, o integración en servidores de inferencia con soporte de `timm` (por ejemplo, TorchServe o BentoML). No hay pesos GGUF publicados para llama.cpp/Ollama (son herramientas de texto).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen de la GPU y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DinoBloom (este) | 304M | 224x224x3 | Hematología (DINO auto-supervisado) | Apache 2.0 | Hugging Face + Zenodo |
| ViT-Large/14 (ImageNet, timm) | ~304M | 224x224x3 | Visión general | Apache 2.0 (según variante) | Hugging Face / timm |
| MarrLab/DinoBloom (nueva versión) | no disponible | no disponible | Hematología | no disponible | Hugging Face |
| Otros backbones de patología (p. ej. UNI, Phikon) | no disponible en la información | no disponible | Histopatología | no disponible | no disponible |

La comparación cuantitativa de rendimiento frente a estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio específico: entrenado para hematología; su rendimiento fuera de ese dominio (radiología, histopatología general, imágenes naturales) puede ser inferior a backbones genéricos.
- No es un modelo generativo: no produce texto ni descripciones; solo embeddings y, con cabezal, clasificaciones.
- Riesgo de sesgo por el corpus de entrenamiento: la composición del dataset (hospitales, tinciones, escáneres) puede no representar otras poblaciones o protocolos de laboratorio; no se detalla en la model card.
- Riesgo de uso clínico indebido: no es un dispositivo médico ni está validado para diagnóstico; cualquier uso en producción sanitaria requiere validación regulatoria independiente.
- Alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos/negativos en clasificación si se usa sin calibración.
- Limitaciones de contexto/idioma: no aplica (modelo de imagen); no soporta texto ni multilenguaje.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar los términos del paper y del repositorio para citas académicas.
- Existe una versión marcada como `new_version: MarrLab/DinoBloom` en la model card; se recomienda evaluar esa versión antes de fijar la dependencia en producción.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/vit_large_patch14_224.dinobloom
- Repositorio GitHub: https://github.com/marrlab/DinoBloom
- Paper (arXiv): https://arxiv.org/abs/2404.05022
- Pesos originales (Zenodo): https://zenodo.org/records/10908163
- Licencia: https://github.com/marrlab/DinoBloom/blob/main/LICENSE
- Nueva versión en Hugging Face: https://huggingface.co/MarrLab/DinoBloom
- Imagen de ejemplo usada en la model card: https://raw.githubusercontent.com/zxaoyou/segmentation_WBC/master/Dataset%201/001.bmp
