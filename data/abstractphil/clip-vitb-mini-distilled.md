# AbstractPhil/clip-vitb-mini-distilled

## Resumen

`clip-vitb-mini-distilled` es un codificador de imagen ViT (Vision Transformer) de 8,66 millones de parámetros, desarrollado por AbstractPhil, que produce embeddings de 512 dimensiones compatibles con el tower de texto de CLIP-B/16 LAION-2B. El modelo se ha destilado mediante consensus distillation sobre el dataset CC12M (10.968.539 imágenes), utilizando el consenso Procrustes generalizado de cinco profesores CLIP, y nunca se entrenó directamente contra el profesor de despliegue. Una rotación ortogonal congelada de 512×512 mapea sus salidas al marco de despliegue del profesor LAION-B/16, donde supera al estudiante destilado directamente contra ese profesor en todas las métricas evaluadas y ambas semillas.

La relevancia de este modelo radica en su demostración de que la destilación por consenso, combinada con una rotación de ajuste, puede lograr un rendimiento superior al de la destilación directa contra el profesor de despliegue, a la vez que reduce el coste computacional: el encoder de imagen tiene solo el 10,0 % de los parámetros de la torre de imagen de CLIP-B/16. El modelo está disponible en formato safetensors y se integra con la librería transformers mediante código personalizado incluido en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer), CLS-token readout, proyección lineal |
| Parametros totales | 8.664.752 (model card) / 8.926.896 (safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de imagen; compatible con text tower de CLIP-B/16 LAION-2B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un ViT con hidden size 240, 12 capas y 4 cabezas de atención, patch de 16 píxeles y entrada de 160×160 píxeles. El modelo utiliza un head de proyección lineal que produce embeddings de 512 dimensiones en el espacio de proyección del profesor de despliegue. La innovación principal reside en el proceso de destilación: el objetivo de entrenamiento es un promedio móvil generalizado de Procrustes de cinco profesores CLIP (consensus distillation), que no tiene un marco privilegiado. Tras el entrenamiento, se ajusta una rotación ortogonal 512×512 (congelada, en fp32) mediante Procrustes ortogonal en fp64 sobre 2.500 pares de COCO-val, que mapea los resultados del marco de consenso al marco de despliegue de LAION-B/16.

El entrenamiento se realizó sobre CC12M (10.968.539 imágenes) durante 88.000 pasos (aproximadamente 2,05 épocas). Se evaluaron nueve objetivos de destilación en dos semillas, incluyendo InfoNCE, feature-MSE, SigLIP-pairwise, affinity-KL, consensus pure-MSE y consensus composite, además de variantes de gradiente. El modelo campeón es el consensus composite con semilla 1, que incluye la rotación como buffer congelado.

## Capacidades

- Extracción de características de imagen: produce embeddings L2-normalizados de 512 dimensiones listos para usar en tareas de búsqueda multimodal.
- Compatibilidad con el text tower de CLIP-B/16 LAION-2B: los embeddings de imagen se pueden comparar directamente con embeddings de texto del modelo CLIP-B/16 LAION-2B.
- Clasificación zero-shot: funciona en benchmarks de clasificación de imágenes (CIFAR-10, CIFAR-100) sin entrenamiento específico.
- Retrieval imagen-texto: soporta búsqueda inversa (i→t) y directa (t→i) en datasets como COCO.
- Ajuste de marco: la rotación se aplica por defecto (`config.apply_rotation`), permitiendo pasar el embedding directamente al marco de despliegue; se puede desactivar para obtener el embedding en el marco de consenso.
- No soporta tool calling, agentes ni generación de texto; es exclusivamente un codificador de imagen.

## Casos de uso

- Búsqueda multimodal en catálogos de imágenes: el modelo permite indexar imágenes y buscarlas mediante texto libre, usando el espacio compartido con el text tower de CLIP-B/16 LAION-2B. Su pequeño tamaño permite indexar millones de imágenes con recursos moderados.
- Clasificación zero-shot en entornos de producción: se puede clasificar imágenes en categorías arbitrarias sin entrenamiento, útil en pipelines de moderación de contenido o etiquetado automático donde las categorías cambian con frecuencia.
- Sistema de recomendación visual: generar embeddings de producto para recomendaciones por similitud visual, con la ventaja de poder combinar consultas textuales (p. ej. "vestido rojo de verano") con similitud visual.
- Análisis de imágenes en dispositivos edge: con solo 8,66 M de parámetros, el modelo cabe en memoria de dispositivos con menos de 1 GB de VRAM o incluso en CPU, permitiendo inferencia local en drones, cámaras o móviles.
- Pre-encoding para pipelines de retrieval: se puede usar como primera etapa de un sistema RAG multimodal, generando embeddings de imagen que luego se comparan con texto para búsqueda semántica.
- Destilación para modelos de visión más pequeños: el código de entrenamiento completo está disponible en el repositorio, lo que permite reproducir la metodología de consensus distillation y adaptarla a otros datasets o arquitecturas.

## Benchmarks y rendimiento

Los resultados publicados en la model card, medidos con el pipeline de evaluación tensor-bicubic (interpolación a 160px, normalización CLIP), son los siguientes:

| Gauge | Consensus composite + rotación (semilla 0 / 1) | InfoNCE directo vs profesor (semilla 0 / 1) | Profesor LAION-B/16 | Suelo aleatorio |
|---|---|---|---|---|
| Zero-shot CIFAR-10 | 0.5412 / 0.5708 | 0.5208 / 0.4979 | 0.946 | 0.0996 |
| Zero-shot CIFAR-100 | 0.2210 / 0.2487 | 0.1958 / 0.2092 | 0.759 | 0.0068 |
| COCO R@1 (i→t) | 0.1322 / 0.1360 | 0.1252 / 0.1178 | 0.417 | 0.000 |
| COCO R@5 | 0.3140 / 0.3300 | 0.2968 / 0.2910 | 0.669 | 0.001 |

El modelo campeón alcanza el 44,7 % / 48,1 % de la capacidad zero-shot media del profesor (CIFAR-10+100) con solo el 10 % de sus parámetros de imagen. La evolución por generaciones de datos es: 21,2 % (118k imágenes) → 42,0 / 41,5 % (11M, InfoNCE directo) → 44,7 / 48,1 % (11M, consensus + rotación). Nota: con la ruta del procesador de imágenes estándar (`CLIPImageProcessor`) sobre entradas de 32 px (escala CIFAR), el rendimiento baja a 0.5545 vs 0.5708 zero-shot, debido a diferencias en la ruta de redimensionado.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para inferencia; el modelo tiene 8,66 M de parámetros, por lo que es viable en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 3050, o incluso iGPU). No requiere GPU de datacenter.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier GPU consumer y también en CPU (inferencia por debajo de 100 ms por imagen en CPU moderna, estimación).
- Opciones de despliegue: Transformers con `trust_remote_code=True`, ONNX (exportable), TensorRT, o cualquier framework que soporte safetensors. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, que están orientadas a modelos de lenguaje.
- Latencia y throughput: no se han publicado mediciones formales, pero dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por imagen en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros (torre imagen) | Contexto | Rendimiento zero-shot CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `clip-vitb-mini-distilled` (este) | 8,66 M | N/A (imagen) | 0.5708 | Apache-2.0 | HuggingFace |
| CLIP-B/16 LAION-2B (profesor) | 86 M | N/A (imagen) | 0.946 | MIT | HuggingFace |
| CLIP ViT-B/16 (OpenAI) | 86 M | N/A (imagen) | 0.953 (aprox.) | MIT | HuggingFace |

No se dispone de datos de otros modelos de tamaño similar (p. ej., ViT-Tiny) con los mismos benchmarks para comparar directamente. El modelo destaca por su tamaño reducido y su compatibilidad con el espacio de CLIP-B/16, lo que permite sustituir la torre de imagen de CLIP en pipelines existentes sin reentrenar la parte de texto.

## Limitaciones y advertencias

- Sesgos: el modelo se entrenó en CC12M, un dataset con sesgos culturales y demográficos inherentes; los embeddings pueden reflejar esos sesgos en tareas de clasificación.
- Riesgo de alucinación: no aplica para generación de texto; el riesgo se limita a errores de clasificación o retrieval en imágenes ambiguas.
- Limitaciones de contexto: es un modelo de visión puro, no acepta texto como entrada; la compatibilidad con el text tower de CLIP-B/16 requiere el uso de ese modelo para generar embeddings de texto.
- Sensibilidad a la resolución: la ruta de preprocesado estándar (`CLIPImageProcessor`) da resultados peores en imágenes muy pequeñas (32 px): 0.4545 vs 0.5708 zero-shot en CIFAR-100; se recomienda usar la ruta tensor-bicubic para evaluaciones rigurosas.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero el modelo depende de CLIP-B/16 LAION-2B (licencia MIT) para el espacio de texto.
- Caveat de producción: el código de modelado es personalizado (`trust_remote_code=True`), lo que requiere revisión de seguridad y mantenimiento manual en entornos de producción.
- La rotación congelada está ajustada al marco de despliegue LAION-B/16; si se usa con otro text tower, los embeddings no serán comparables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbstractPhil/clip-vitb-mini-distilled
- Repositorio del autor en HuggingFace: https://huggingface.co/AbstractPhil/models
- Modelo de texto CLIP-B/16 LAION-2B: https://huggingface.co/laion/CLIP-ViT-B-16-laion2B-s34B-b88K
- Repositorio original de CLIP (OpenAI): https://github.com/openai/CLIP
- Paper CLIP original: https://arxiv.org/abs/2103.00020
- Repositorio de destilación CLIP de Cardinal Blue: https://github.com/cardinalblue/clip-models-for-distillation
