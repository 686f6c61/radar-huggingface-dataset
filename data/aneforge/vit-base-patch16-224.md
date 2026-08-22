# aneforge/vit-base-patch16-224

## Resumen

ANEForge ViT-Base (patch16-224) es una réplica byte-idéntica de `google/vit-base-patch16-224`, un Vision Transformer (ViT) de tamaño base desarrollado por Google, publicado por el usuario `aneforge` con el objetivo de permitir su ejecución directa sobre el Apple Neural Engine (ANE) sin necesidad de CoreML. El modelo mantiene la arquitectura original (transformer encoder) y los pesos sin modificación alguna, por lo que conserva las capacidades de clasificación de imágenes del modelo base, preentrenado en ImageNet-21k y ajustado en ImageNet-1k.

La relevancia de esta publicación reside en la integración con ANEForge, una librería que compila el grafo del modelo en un único programa ANE y permite cargar los pesos directamente desde Hugging Face, facilitando el despliegue de ViT en dispositivos Apple (macOS, iOS) con aceleración por hardware. El modelo cuenta con 86,6 millones de parámetros y una ventana de entrada de imágenes de 224x224 píxeles, y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch16) |
| Parámetros totales | 86 567 656 |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (entrada de imágenes 224x224) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (tarea de clasificación de imágenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer (ViT) basado en la arquitectura transformer encoder, similar a BERT pero aplicado a imágenes. Se divide la imagen en parches de 16x16 píxeles, que se proyectan linealmente y se añaden embeddings de posición antes de pasarlos por 12 bloques transformer con 12 cabezas de atención y una dimensión oculta de 768. El entrenamiento se realizó en dos etapas: preentrenamiento supervisado en ImageNet-21k (14 millones de imágenes, 21 843 clases) y posterior ajuste fino en ImageNet-1k (1,28 millones de imágenes, 1000 clases) para la clasificación estándar.

La innovación técnica de este repositorio no reside en la arquitectura del modelo (que es idéntica al original) sino en el sistema ANEForge, que compila el grafo computacional en un único programa para el Apple Neural Engine. Esto permite ejecutar el modelo con aceleración de hardware en dispositivos Apple sin necesidad de conversión a CoreML, manteniendo los pesos byte-idénticos al original. No se ha aplicado RLHF ni técnicas de alineación, al tratarse de un modelo de visión puro.

## Capacidades

- Clasificación de imágenes de 1000 categorías de ImageNet-1k (etiquetas estándar).
- Extracción de características visuales de alto nivel para tareas de transferencia.
- Salida de top-k predicciones con logits, útil para análisis de confianza.
- Ejecución nativa en Apple Neural Engine mediante ANEForge (sin CoreML).
- Compatibilidad con imágenes de resolución 224x224 píxeles.
- Soporte para clasificación en tiempo real en dispositivos con ANE (Mac, iPhone, iPad).
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multimodal más allá de clasificación.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles iOS: el modelo puede integrarse en apps de identificación de plantas, objetos o escenas, aprovechando el ANE para inferencia en tiempo real con baja latencia y consumo energético reducido.
- Moderación automática de contenido visual: clasificar imágenes en categorías (violencia, desnudos, etc.) en servidores o en dispositivos Apple, usando el modelo como filtro inicial.
- Análisis de imágenes médicas (radiografías, retinografías) para triaje automático: el modelo preentrenado puede ajustarse en un conjunto específico para detectar patologías, manteniendo la eficiencia en hardware Apple.
- Etiquetado de fotografías en aplicaciones de gestión de bibliotecas: asignar categorías (paisaje, retrato, comida) a imágenes almacenadas localmente en el dispositivo.
- Clasificación de productos en e-commerce: integrar el modelo en pipelines de clasificación de imágenes de productos para categorización automática, con despliegue en servidores o en clientes Apple.
- Investigación educativa: usar el modelo como punto de partida para experimentos de transferencia de aprendizaje, gracias a su licencia Apache 2.0 y su compatibilidad con ANEForge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser una réplica byte-idéntica de `google/vit-base-patch16-224`, los resultados de ese modelo original (por ejemplo, top-1 accuracy en ImageNet-1k) son aplicables, pero no se incluyen aquí por no estar documentados en la ficha del repositorio.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 86,6 millones de parámetros; en precisión fp32 ocupa aproximadamente 346 MB de memoria. Con cuantización a int8, se reduciría a unos 87 MB, aunque no se proporcionan cuantizaciones disponibles en este repositorio.
- GPU recomendadas: al estar diseñado para ANE, la ejecución óptima se logra en dispositivos Apple con Neural Engine (M1/M2/M3 y superiores). En GPU de propósito general (NVIDIA, AMD), se puede ejecutar con frameworks estándar como PyTorch, pero sin aceleración específica.
- Compatibilidad con GPU consumer: sí, cabe en cualquier GPU con más de 1 GB de VRAM (por ejemplo, RTX 2060 o superior). En Apple Silicon, la inferencia se ejecuta en el ANE sin ocupar VRAM de la GPU gráfica.
- Opciones de despliegue: ANEForge (para Apple), Hugging Face Transformers (para CPU/GPU), ONNX Runtime, TensorRT, etc. No se proporcionan cuantizaciones GGUF ni soporte específico para llama.cpp.
- Latencia y throughput: no disponible; dependen del hardware y de la implementación. En Apple Silicon con ANE se espera una inferencia de ~5-10 ms por imagen, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aneforge/vit-base-patch16-224 | 86,6 M | 224x224 | ImageNet-1k fine-tuning | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224 | 86,6 M | 224x224 | ImageNet-1k fine-tuning | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224-in21k | 86,6 M | 224x224 | Solo ImageNet-21k (sin fine-tuning) | Apache 2.0 | Hugging Face |

El modelo es idéntico al original de Google; la única diferencia es el etiquetado para ANEForge. La versión `-in21k` no está ajustada a ImageNet-1k, por lo que requiere fine-tuning para clasificación de 1000 clases.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al heredar de ImageNet-21k/1k, puede presentar sesgos socioculturales en las categorías (por ejemplo, estereotipos de género o raza en clases como "novia" o "persona de negocios").
- Riesgo de alucinación: no aplica directamente, al ser un modelo de clasificación (no generativo), pero puede producir clasificaciones erróneas con alta confianza en imágenes fuera de la distribución de ImageNet.
- Limitaciones de contexto: solo acepta imágenes de 224x224 píxeles; imágenes de mayor resolución deben ser redimensionadas, lo que puede perder detalles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se debe incluir el aviso de copyright.
- Advertencia de producción: el modelo no está diseñado para tareas de seguridad crítica (conducción autónoma, diagnóstico médico) sin una evaluación y ajuste específico.
- Dependencia de ANEForge: la ejecución en Apple Neural Engine requiere la librería ANEForge, que está en desarrollo (no se especifica versión estable).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aneforge/vit-base-patch16-224)
- [Modelo original google/vit-base-patch16-224](https://huggingface.co/google/vit-base-patch16-224)
- [Modelo google/vit-base-patch16-224-in21k](https://huggingface.co/google/vit-base-patch16-224-in21k)
- [Repositorio ANEForge](https://github.com/sbryngelson/ANEForge)
- [Documentación de ANEForge](https://aneforge.readthedocs.io)
- [Paper ANEForge (arXiv)](https://arxiv.org/abs/2606.17090)
