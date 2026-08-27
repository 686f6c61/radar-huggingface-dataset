# immanuelpeter/MoonViT-V2

## Resumen

MoonViT-V2 es el codificador visual (vision tower) del modelo multimodal Kimi K3, desarrollado por Moonshot AI y empaquetado de forma independiente por el usuario immanuelpeter. Este repositorio extrae únicamente la torre de visión y el proyector del checkpoint completo de Kimi K3, que consta de 96 shards y aproximadamente 2,8 billones de parámetros, permitiendo reproducir la ruta de procesamiento de imagen sin necesidad de descargar el modelo completo.

El modelo es relevante porque democratiza el acceso a uno de los componentes visuales de un modelo de frontera, permitiendo a desarrolladores e investigadores utilizar el extractor de características visuales de Kimi K3 de forma aislada. Con 401 millones de parámetros en la torre, ofrece una arquitectura de 27 capas con 1024 dimensiones ocultas y 12 cabezas de atención, junto con un proyector que transforma las características visuales al espacio de representación del modelo principal.

La publicación incluye tanto los pesos de la torre (bit-idénticos a la versión publicada por AI4Industry) como el proyector `patchmergerv2` de Kimi K3, junto con el código de modelado y procesamiento de imagen necesario para su uso. El modelo se distribuye bajo la licencia Kimi K3 y está disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) de 27 capas, 1024 hidden, 12 cabezas, QKV 1536, patch size 14 |
| Parametros totales | 401.214.464 (torre) + proyector (3 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no textual) |
| Tipos de cuantizacion | BF16 (pesos originales preservados) |
| Idiomas soportados | no disponible (modelo de vision, sin componente textual) |
| Licencia | Kimi K3 License (license: other, license_name: kimi-k3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MoonViT-V2 es un Vision Transformer de 27 capas con 1024 dimensiones ocultas, 12 cabezas de atención y dimensiones QKV de 1536. El patch size es de 14 píxeles. La torre incluye un mecanismo de compresión de tokens que combina un 2x2 pixel shuffle con pooling temporal, sin parámetros aprendidos. El proyector (`patchmergerv2`) consta de una secuencia de dos capas lineales sin bias (4096→4096 y 4096→7168) intercaladas con GELU, seguidas de RMSNorm(7168). La salida del proyector tiene 7168 dimensiones, que corresponde al espacio oculto del modelo principal Kimi K3.

Los pesos se extraen de los shards 95 y 96 del checkpoint de Kimi K3, preservando los pesos originales en BF16. El script de exportación verifica que los 165 tensores de la torre son bit-idénticos a la versión publicada por AI4Industry/MoonViT-V2. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de entrenamiento específico de esta torre visual, ya que fue entrenada como parte del modelo multimodal Kimi K3 por Moonshot AI.

## Capacidades

- Extracción de características visuales: genera representaciones densas de imágenes a partir del encoder visual de Kimi K3.
- Proyección al espacio del modelo principal: el proyector transforma las características de la torre (4096 dimensiones) al espacio de representación de Kimi K3 (7168 dimensiones).
- Compresión de tokens: reduce la secuencia de tokens visuales mediante pixel shuffle 2x2 y pooling temporal, sin parámetros adicionales.
- Integración con Kimi K3: permite reproducir la ruta de imagen del modelo multimodal completo sin descargar los 2,8 billones de parámetros.
- Compatibilidad con transformers: se integra con la librería transformers de HuggingFace mediante código personalizado (custom_code).
- Extracción de características para downstream tasks: útil como backbone para fine-tuning en tareas de visión.

## Casos de uso

- Extracción de características para búsqueda visual semántica: las representaciones de 4096 dimensiones pueden indexarse para construir sistemas de búsqueda por similitud sobre grandes colecciones de imágenes, aprovechando la calidad del encoder de Kimi K3.
- Fine-tuning para clasificación de imágenes: la torre puede usarse como backbone congelado o fine-tuneado para tareas de clasificación, como demuestra el repositorio de evaluación con linear probing en ImageNet-1K.
- Componente visual en pipelines multimodales: el proyector permite conectar las características visuales con modelos de lenguaje que operan en el espacio de 7168 dimensiones de Kimi K3, facilitando la construcción de sistemas de visión-lenguaje.
- Investigación en representaciones visuales: el modelo sirve para estudiar las propiedades de los encoders visuales de modelos de frontera, comparando su rendimiento con otros backbones de tamaño similar.
- Generación de embeddings para datasets de entrenamiento: puede utilizarse para precomputar características visuales de grandes datasets, acelerando el entrenamiento de modelos downstream.
- Evaluación comparativa de vision transformers: al ser un componente de un modelo de 2,8 billones de parámetros, permite evaluar si la calidad del encoder visual escala con el tamaño del modelo principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de GitHub `weeknan/moonvit-v2-visual-representations` menciona evaluaciones en ImageNet-1K mediante linear probing y fine-tuning completo, pero no se proporcionan los resultados numéricos en la información recopilada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 401 millones de parámetros. En BF16, el peso de la torre ocupa aproximadamente 0,8 GB, y el proyector añade unos 0,1 GB adicionales. Con overhead de activaciones, se estima un consumo de 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4060, T4 o superiores pueden ejecutar el modelo sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: al ser un modelo de transformers con código personalizado, puede ejecutarse con la librería transformers de HuggingFace. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un extractor de características, no un modelo generativo.
- Latencia y throughput: no disponible. Al ser un modelo de 27 capas con 401 millones de parámetros, la inferencia en una GPU moderna debería completarse en decenas de milisegundos por imagen, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Hidden | Patch size | Licencia |
|---|---|---|---|---|---|
| MoonViT-V2 (este) | 401M | 27 | 1024 | 14 | Kimi K3 |
| CLIP ViT-L/14 | 428M | 24 | 1024 | 14 | MIT |
| DINOv2 ViT-L | 304M | 24 | 1024 | 14 | Apache 2.0 |
| SigLIP ViT-L | 428M | 24 | 1024 | 14 | Apache 2.0 |

La comparativa se basa en arquitecturas de tamaño similar. MoonViT-V2 tiene más capas (27) que los ViT-L estándar (24), pero no se dispone de datos de rendimiento comparativo para evaluar su calidad relativa. La licencia Kimi K3 es más restrictiva que las de CLIP, DINOv2 o SigLIP, lo que puede limitar su uso comercial.

## Limitaciones y advertencias

- Modelo de visión únicamente: no incluye componente textual ni capacidades de generación de lenguaje. Solo produce características visuales proyectadas.
- Licencia Kimi K3: es una licencia personalizada que puede imponer restricciones de uso comercial. Es necesario revisar el archivo LICENSE antes de utilizar el modelo en producción.
- Sin datos de entrenamiento: no se ha publicado información sobre el dataset de entrenamiento de la torre visual, lo que dificulta evaluar posibles sesgos.
- Dependencia de código personalizado: el modelo requiere los archivos de configuración y modelado incluidos en el repositorio, lo que puede complicar su integración en entornos que no soporten custom_code.
- Sin benchmarks publicados: no hay resultados de evaluación disponibles en la información proporcionada, lo que impide comparar objetivamente su rendimiento con otros extractores de características.
- Proyectado para Kimi K3: el proyector produce embeddings de 7168 dimensiones diseñados específicamente para el espacio oculto de Kimi K3, por lo que su uso con otros modelos de lenguaje requiere adaptación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/immanuelpeter/MoonViT-V2
- Torre original publicada por AI4Industry: https://huggingface.co/AI4Industry/MoonViT-V2
- Modelo base Kimi K3: https://huggingface.co/moonshotai/Kimi-K3
- Script de exportación: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_moonvit_v2.py
- Repositorio de evaluación de representaciones visuales: https://github.com/weeknan/moonvit-v2-visual-representations
- Entrada en Baidu Baike: https://baike.baidu.com/en/item/MoonViT-V2/4791538
