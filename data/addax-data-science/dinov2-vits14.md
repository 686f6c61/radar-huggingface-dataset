# Addax-Data-Science/DINOV2-VITS14

## Resumen

DINOv2 ViT-S/14 es un modelo de visión por computador desarrollado por Meta AI (FAIR) que implementa un Vision Transformer (ViT) de tipo "small" con parches de 14x14 píxeles. Este repositorio concreto, publicado por Addax Data Science bajo licencia Apache 2.0, no es un reentrenamiento ni una modificación del modelo original, sino una redistribución empaquetada para facilitar su integración con la plataforma AddaxAI. El modelo original se entrena con destilación de conocimiento auto-supervisada (DINO v2), lo que le permite generar representaciones visuales de propósito general sin necesidad de etiquetas.

La relevancia de esta ficha radica en que DINOv2 ViT-S/14 es un backbone de embeddings visuales ampliamente utilizado como extractor de características para tareas downstream: clasificación de imágenes, búsqueda por similitud, segmentación y, en el caso de AddaxAI, análisis de imágenes de fauna. Su tamaño compacto (aproximadamente 21 millones de parámetros) lo hace adecuado para despliegue en entornos con recursos limitados, incluidos dispositivos de borde.

Este repositorio en particular incluye una copia "vendored" del código fuente de la arquitectura (solo los ficheros necesarios para cargar los backbones vits14, vitb14 y vitl14 en inferencia), de modo que AddaxAI pueda cargar la arquitectura desde Hugging Face sin depender de GitHub en tiempo de ejecución. No se han publicado resultados de benchmarks ni especificaciones detalladas de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parches de 14x14, entrenamiento auto-supervisado DINOv2 |
| Parámetros totales | Aproximadamente 21 millones (ViT-S/14; dato no confirmado en la información proporcionada) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; resolución de entrada típica 224x224 o 518x518, no confirmado en la información) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repo contiene pesos y código fuente; formato exacto no especificado) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer (ViT) que divide la imagen en parches de 14x14 píxeles y los procesa mediante bloques de atención. La variante "S" (small) corresponde a la configuración compacta de la familia DINOv2. El entrenamiento original de DINOv2 combina auto-destilación (self-distillation) con objetivos auto-supervisados sobre un corpus masivo de imágenes sin etiquetas, lo que produce representaciones visuales genéricas transferibles a múltiples tareas. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO (no aplicables en un modelo de visión de este tipo).

La innovación relevante de este repositorio no está en el modelo en sí, sino en el empaquetado: se incluye una copia reducida del código fuente de DINOv2 (`hubconf.py`, módulos `dinov2/hub`, `dinov2/models` y `dinov2/layers`) para permitir la carga local mediante `torch.hub.load(model_dir, model_arch, source="local", pretrained=False)`. Esto evita la dependencia de GitHub en tiempo de ejecución, un requisito práctico para usuarios con redes restringidas. No se incluyen rutas de código de entrenamiento, evaluación, segmentación, profundidad, clasificadores, cell-dino, xray-dino ni dinotxt.

## Capacidades

- Extracción de embeddings visuales de propósito general a partir de imágenes.
- Generación de representaciones densas adecuadas para búsqueda por similitud y recuperación de imágenes.
- Base para tareas downstream de clasificación de imágenes mediante fine-tuning o cabezas lineales.
- Soporte para múltiples resoluciones de entrada (comportamiento típico de ViT con interpolación posicional; no confirmado explícitamente en la información).
- Carga de los backbones vits14, vitb14 y vitl14 desde el mismo repositorio (según el código vendored incluido).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de generación de texto.
- No se documentan modos especiales como "thinking mode", visión aumentada, audio o vídeo.

## Casos de uso

- Análisis de imágenes de fauna en AddaxAI: el modelo actúa como extractor de embeddings para el pipeline de AddaxAI, permitiendo agrupar y clasificar imágenes de cámaras trampa sin depender de conectividad a GitHub durante la primera ejecución.
- Búsqueda visual por similitud: los embeddings generados permiten indexar un catálogo de imágenes y recuperar las más parecidas mediante distancia coseno, útil en sistemas de gestión de activos digitales.
- Clasificación de imágenes con fine-tuning ligero: al ser un backbone compacto (~21M parámetros), se puede entrenar una cabeza lineal sobre los embeddings con pocos datos y recursos.
- Detección de duplicados y near-duplicates: los embeddings permiten identificar imágenes casi idénticas en grandes repositorios, por ejemplo en auditorías de datasets.
- Preprocesamiento para pipelines de visión en producción: integrable como etapa de feature extraction en sistemas de monitorización ambiental o agrícola.
- Prototipado rápido en investigación: su tamaño reducido permite experimentar en una sola GPU consumer con tiempos de inferencia bajos.
- Despliegue en entornos con red restringida: el empaquetado vendored evita fallos de carga por bloqueo de GitHub, adecuado para instalaciones en campo o intranets corporativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP32 para el backbone ViT-S/14 (estimación basada en ~21M parámetros; no confirmada en la información).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas e incluso en CPU para lotes pequeños.
- Opciones de despliegue: carga mediante `torch.hub.load` con `source="local"` (método documentado por el autor); también es posible usar PyTorch directamente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| DINOv2 ViT-S/14 (este repo) | ~21M (no confirmado) | Imagen, parches 14x14 | Apache 2.0 | Hugging Face (Addax-Data-Science) |
| DINOv2 ViT-B/14 | ~86M (no confirmado) | Imagen, parches 14x14 | Apache 2.0 | Hugging Face (repo oficial facebook/dinov2) |
| CLIP ViT-B/32 | ~150M (no confirmado) | Imagen + texto | MIT (no confirmado) | Hugging Face (openai/clip-vit-base-patch32) |
| SigLIP base | No disponible | Imagen + texto | Apache 2.0 (no confirmado) | Hugging Face |

Los datos de parámetros y licencias de los modelos comparativos no están confirmados en la información proporcionada y deben verificarse en sus repositorios oficiales.

## Limitaciones y advertencias

- Este repositorio es una redistribución, no un modelo entrenado por Addax Data Science; la autoría y responsabilidad técnica corresponden a Meta AI (FAIR).
- No se incluyen rutas de código para entrenamiento, evaluación, segmentación, profundidad, clasificadores, cell-dino, xray-dino ni dinotxt; solo se soporta inferencia de los backbones vits14, vitb14 y vitl14.
- El modelo es exclusivamente visual: no procesa texto ni mantiene conversaciones, por lo que no debe evaluarse con métricas de LLM.
- No se documentan sesgos específicos, pero al ser un modelo auto-supervisado sobre datos web puede heredar sesgos de representación visual.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero los embeddings pueden producir similitudes engañosas en dominios muy alejados de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe revisar el fichero `LICENSE` incluido y cumplir los términos del modelo original de Meta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se especifican formatos de pesos ni métodos de cuantización, lo que puede complicar el despliegue en entornos con requisitos estrictos de tamaño.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addax-Data-Science/DINOV2-VITS14
- AddaxAI (plataforma de integración): https://addaxdatascience.com/addaxai/
- Addax Data Science: https://addaxdatascience.com/
- Repositorio oficial de DINOv2: https://github.com/facebookresearch/dinov2
- Licencia de DINOv2: https://github.com/facebookresearch/dinov2/blob/main/LICENSE
