# 1aurent/vit_base_patch14_224.dinobloom

## Resumen

DinoBloom es un modelo de visión por computador especializado en la generación de embeddings de células para hematología. Se trata de un backbone ViT (Vision Transformer) de tipo base, con 85,7 millones de parámetros, parche de 14x14 píxeles y resolución de entrada de 224x224. Lo desarrolla el grupo MarrLab (Valentin Koch, Sophia J. Wagner y colaboradores) y se publicó originalmente en 2024 junto con el artículo "DinoBloom: A Foundation Model for Generalizable Cell Embeddings in Hematology" (arXiv:2404.05022).

El modelo resuelve el problema de obtener representaciones generalizables de imágenes de frotis de sangre y otras preparaciones hematológicas, de modo que sirvan como extractor de características para tareas posteriores como clasificación de tipos celulares, detección de anomalías o segmentación. Se entrenó con el paradigma DINO (autodestilación sin etiquetas) sobre un corpus de imágenes de células sanguíneas, lo que permite aprovechar grandes volúmenes de datos no anotados, algo habitual en el dominio biomédico.

Esta ficha describe la versión empaquetada para `timm` alojada en Hugging Face bajo el identificador `1aurent/vit_base_patch14_224.dinobloom`. Es relevante para desarrolladores e investigadores que necesiten un extractor de características ligero (0,3 GB de repo, ~86 M de parámetros) con licencia Apache 2.0 y API estándar de `timm`, aunque el propio autor redirige a la versión mantenida `MarrLab/DinoBloom` como sucesora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) base, patch 14x14, entrada 224x224x3, preentrenado con DINO |
| Parametros totales | 85.724.928 (~86 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como `optimum` o `torch.ao`, no documentada por el autor) |
| Idiomas soportados | no aplica (modelo de imagen; sin capacidades de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo es un ViT base con parche de 14x14 y resolución de 224x224, es decir, una secuencia de 256 tokens por imagen más el token de clase. La salida es un vector de características de dimensión fija por imagen, adecuado para `feature-extraction` y para clasificación lineal posterior. El preentrenamiento sigue el método DINO (autodestilación con profesor-estudiante y sin etiquetas), que produce representaciones útiles sin supervisión y ha demostrado buen comportamiento en dominios donde las anotaciones son escasas.

El entrenamiento se realizó sobre imágenes de hematología (frotis de sangre y preparaciones citológicas), según el artículo asociado. La model card no detalla el número exacto de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino supervisado o RLHF (no aplicable en un modelo de visión). Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal; se trata de un ViT estándar con atención cuadrática sobre 256 tokens, por lo que el coste computacional es moderado.

## Capacidades

- Extracción de embeddings de imágenes de células y tejidos hematológicos (salida de vector por imagen).
- Clasificación de imágenes mediante cabezas lineales o fine-tuning sobre las características extraídas.
- Base para tareas de recuperación (retrieval) por similitud en espacio de embeddings.
- Detección y agrupamiento de tipos celulares en pipelines de análisis de frotis.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un backbone puramente visual.
- Sin capacidades multilingües ni de generación de texto.
- Sin modo "thinking", visión general (no es un VLM) ni audio.

## Casos de uso

- Clasificación de tipos celulares en frotis de sangre: se extraen embeddings con `timm.create_model` y se entrena un clasificador lineal o una MLP ligera encima; el coste de anotación se reduce al reutilizar representaciones preentrenadas en dominio hematológico.
- Detección de células anómalas (por ejemplo, blastos en leucemia): los embeddings sirven como entrada a modelos de detección o a técnicas de anomaly detection (kNN, Mahalanobis) sobre poblaciones celulares.
- Recuperación de imágenes similares en bases de datos histológicas: indexación vectorial de embeddings para búsqueda por similitud en archivos de laboratorio.
- Preentrenamiento de modelos downstream con pocos datos: al ser un backbone DINO, es útil cuando solo hay cientos de imágenes etiquetadas y se necesita un punto de partida robusto.
- Segmentación asistida: los mapas de atención o las características por parche pueden alimentar cabezales de segmentación (U-Net, Mask2Former) en pipelines de citología.
- Control de calidad en laboratorio: clustering no supervisado de embeddings para detectar lotes de imágenes atípicos o artefactos de tinción.
- Investigación en representaciones celulares: comparación de espacios latentes entre modelos (DinoBloom frente a otros backbones) para estudiar transferibilidad en hematología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los metadatos de Hugging Face no incluyen tablas de MMLU, HumanEval, GSM8K ni métricas de clasificación celular. El artículo arXiv:2404.05022 contiene las evaluaciones originales, pero no se han proporcionado en esta ficha.

## Requisitos de hardware

- VRAM para inferencia en fp32: ~0,35 GB solo para pesos (86 M parámetros × 4 bytes), más activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM en fp16/bf16: ~0,17 GB para pesos; holgado en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (incluso integradas con suficiente memoria compartida, aunque con mayor latencia).
- Despliegue: `timm` (nativo), `torch.compile`, exportación a ONNX/TensorRT, `optimum` para cuantización, o servicios de inferencia como TorchServe. No se documenta soporte nativo en vLLM, llama.cpp u Ollama (no aplica a modelos de visión).
- Latencia y throughput: no disponibles en la información proporcionada; para un ViT-B/14 a 224x224 se espera un throughput alto en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DinoBloom ViT-B/14 (este) | 85,7 M | 224x224 | Hematología | Apache 2.0 | Hugging Face (`1aurent/...`, `MarrLab/DinoBloom`) |
| ViT-B/16 ImageNet (timm) | ~86 M | 224x224 | Visión general | Apache 2.0 | Hugging Face / timm |
| DINOv2 ViT-B/14 | ~86 M | 224x224 (hasta 518) | Visión general | Apache 2.0 (variantes) | Hugging Face / Meta |
| Phikon (histología) | ~86 M | 224x224 | Histopatología | no disponible en esta ficha | Hugging Face |

La comparativa se limita a modelos de tamaño similar y misma tarea (extracción de características visuales). No se dispone de métricas comparativas publicadas en la información proporcionada para establecer diferencias cuantitativas de rendimiento entre ellos.

## Limitaciones y advertencias

- Modelo de dominio específico (hematología): su rendimiento fuera de imágenes de células sanguíneas o citología puede degradarse frente a backbones generalistas como DINOv2.
- Riesgo de sesgo por el dataset de entrenamiento: la composición demográfica, los protocolos de tinción y los equipos de captura pueden introducir sesgos que afecten a la generalización entre laboratorios.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos/negativos en clasificación downstream si el backbone no está ajustado al dominio concreto.
- Sin capacidades de texto ni multilingües; no debe usarse como modelo de lenguaje.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset original y del artículo para atribución académica.
- El autor marca `MarrLab/DinoBloom` como `new_version`; se recomienda usar esa versión mantenida en lugar de este empaquetado para producción.
- No se documentan límites de resolución distintos de 224x224; entradas de mayor tamaño requerirían interpolación posicional no validada por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/vit_base_patch14_224.dinobloom
- Versión mantenida: https://huggingface.co/MarrLab/DinoBloom
- Repositorio GitHub: https://github.com/marrlab/DinoBloom
- Artículo arXiv: https://arxiv.org/abs/2404.05022
- Pesos originales (Zenodo): https://zenodo.org/records/10908163
- Licencia: https://github.com/marrlab/DinoBloom/blob/main/LICENSE
