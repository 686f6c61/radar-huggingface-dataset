# Addax-Data-Science/DINOV2-VITL14

## Resumen

DINOv2 ViT-L/14 es un modelo de visión por computador desarrollado por Meta AI (FAIR) que implementa un transformer de visión (ViT) entrenado con el método de auto-supervisión DINOv2. Este repositorio concreto, publicado por Addax Data Science, no es un entrenamiento nuevo ni un fine-tuning: es una redistribución de los pesos originales de DINOv2 junto con una copia recortada del código fuente de la arquitectura, empaquetada para que la herramienta AddaxAI pueda cargar el modelo sin depender de GitHub en tiempo de ejecución.

El modelo genera embeddings visuales de propósito general (features densas por imagen y por parche) que sirven como base para tareas posteriores como clasificación, detección, segmentación o recuperación de imágenes, normalmente mediante un cabezal ligero entrenado encima o mediante similitud entre embeddings. La variante L/14 corresponde al backbone "large" con parches de 14x14 píxeles.

Su relevancia en este repositorio es operativa: AddaxAI lo usa como extractor de características en su pipeline de análisis de imágenes (por ejemplo, censos de fauna con cámaras trampa), y la redistribución resuelve el problema de usuarios con redes que permiten `huggingface.co` pero bloquean o limitan `github.com`. El repositorio ocupa 1,2 GB e incluye únicamente los ficheros necesarios para inferencia de los backbones vits14, vitb14 y vitl14.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/14), auto-supervisado con DINOv2 |
| Parametros totales | no disponible (variante "large"; el repositorio no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada por imagen, sin contexto textual) |
| Tipos de cuantizacion | no disponible (el repositorio no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos para carga vía `torch.hub.load` con `source="local"`; formato exacto no disponible |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar en su variante L/14: la imagen se divide en parches de 14x14 píxeles, se proyectan linealmente y se procesan con bloques de self-attention. El backbone produce representaciones por parche y un token CLS agregado. El repositorio incluye una copia "slimmed" del código de DINOv2 con solo los ficheros necesarios para cargar los backbones vits14, vitb14 y vitl14 en inferencia (`hubconf.py`, `dinov2/models/vision_transformer.py`, `dinov2/layers/*`, `dinov2/hub/*`); quedan fuera los caminos de entrenamiento, evaluación, segmentación, profundidad, clasificadores, cell-dino, xray-dino y dinotxt.

El entrenamiento original de DINOv2 es auto-supervisado (sin etiquetas) sobre un corpus de imágenes a gran escala curado por Meta AI; el repositorio no detalla el número de tokens, la composición del dataset ni si hubo etapas de alineación adicionales. La única modificación respecto al código original es el recorte de `hubconf.py` para reexportar solo los tres puntos de entrada que usa AddaxAI; no hay cambios a nivel de fuente en el resto de ficheros.

## Capacidades

- Extracción de embeddings visuales de propósito general a partir de imágenes, tanto a nivel de imagen (token CLS) como a nivel de parche.
- Base para tareas downstream: clasificación de imágenes, detección, segmentación semántica y de instancias, estimación de profundidad y recuperación de imágenes, siempre con cabezales o procedimientos adicionales.
- Representaciones útiles para similitud y clustering de imágenes sin entrenamiento específico.
- Carga local de la arquitectura desde el propio repositorio de Hugging Face, sin acceso a GitHub en tiempo de ejecución.
- Soporte de los backbones vits14, vitb14 y vitl14 dentro del mismo paquete de código.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Análisis de imágenes de cámaras trampa en AddaxAI: el modelo actúa como extractor de características del pipeline; los embeddings alimentan clasificadores o comparadores para identificar especies o eventos, y la carga local evita fallos en redes que bloquean GitHub.
- Búsqueda y recuperación visual: indexar un catálogo de imágenes por embeddings y recuperar las más similares a una consulta, útil en archivos fotográficos o inventarios de producto.
- Clustering y deduplicación de imágenes: agrupar imágenes visualmente parecidas sin etiquetas, por ejemplo para detectar duplicados o series de una misma escena.
- Preentrenamiento congelado para clasificación: usar los embeddings como entrada de un clasificador lineal o MLP ligero cuando el volumen de datos etiquetados es pequeño.
- Segmentación asistida: emplear las features por parche como base para cabezales de segmentación en flujos de anotación semiautomática.
- Control de calidad y detección de anomalías visuales: comparar embeddings de imágenes de referencia con nuevas capturas para señalar desviaciones en inspección industrial o monitorización.
- Filtrado previo en pipelines de visión: descartar imágenes vacías o irrelevantes antes de pasarlas a modelos más costosos, reduciendo cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 1,2 GB, lo que da una idea del orden de magnitud de los pesos; el desglose exacto por variante no está documentado.
- VRAM estimada para inferencia: no disponible con precisión; para un backbone ViT-L/14 en precisión completa se sitúa típicamente en el rango de varios GB, y baja con FP16 o con lotes pequeños.
- GPU recomendadas: no especificadas por el autor. Por tamaño del backbone, cabría esperar ejecución cómoda en GPUs de consumo recientes con suficiente VRAM, pero el repositorio no publica requisitos ni pruebas.
- Despliegue: la vía documentada es `torch.hub.load(model_dir, model_arch, source="local", pretrained=False)` desde el directorio local descargado vía Hugging Face Hub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DINOv2 ViT-L/14 (este repo) | no disponible (variante large) | no aplica | Embeddings visuales | Apache 2.0 | Hugging Face, redistribución para AddaxAI |
| DINOv2 ViT-S/14 | no disponible (variante small) | no aplica | Embeddings visuales | Apache 2.0 | Incluido en el mismo repo (vits14) |
| DINOv2 ViT-B/14 | no disponible (variante base) | no aplica | Embeddings visuales | Apache 2.0 | Incluido en el mismo repo (vitb14) |
| CLIP ViT-L/14 | no disponible en la informacion disponible | no aplica | Embeddings imagen-texto | no disponible en la informacion disponible | no disponible en la informacion disponible |

## Limitaciones y advertencias

- Es una redistribución, no un modelo nuevo: cualquier limitación del DINOv2 original aplica igualmente aquí.
- No es un modelo generativo ni conversacional; no debe esperarse salida de texto, tool calling ni razonamiento.
- El repositorio no documenta sesgos, composición del dataset de entrenamiento ni evaluaciones de robustez; la evaluación de sesgos debe hacerse sobre el modelo original de Meta AI.
- Riesgo de alucinación no aplica en el sentido textual, pero los embeddings pueden producir similitudes engañosas en dominios muy alejados de los datos de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe revisar los términos del modelo original y de los ficheros de licencia incluidos.
- El código incluido está recortado: no sirve para entrenamiento, segmentación, profundidad ni otras variantes de DINOv2; para esos flujos hay que acudir al repositorio original.
- Dependencia de la API de `torch.hub` con `source="local"`; cambios en la estructura del directorio o en las versiones de PyTorch pueden romper la carga.
- No hay garantías de soporte ni mantenimiento por parte de Addax Data Science más allá de la redistribución.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addax-Data-Science/DINOV2-VITL14
- AddaxAI: https://addaxdatascience.com/addaxai/
- Addax Data Science: https://addaxdatascience.com/
- Repositorio original de DINOv2: https://github.com/facebookresearch/dinov2
- Licencia original: https://github.com/facebookresearch/dinov2/blob/main/LICENSE
