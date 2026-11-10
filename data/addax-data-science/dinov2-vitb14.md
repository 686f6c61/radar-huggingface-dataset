# Addax-Data-Science/DINOV2-VITB14

## Resumen

DINOv2 ViT-B/14 es un modelo de visión por computador desarrollado por Meta AI (FAIR) que implementa un transformer de visión (ViT) entrenado con la metodología DINOv2, orientada al aprendizaje autosupervisado de representaciones visuales genéricas. Este repositorio concreto, publicado por Addax Data Science, no es un entrenamiento nuevo, sino una redistribución de los pesos originales de Meta junto con una copia reducida del código fuente de la arquitectura, empaquetada para facilitar su uso dentro de la plataforma AddaxAI.

La relevancia de esta ficha radica en su naturaleza de espejo operativo: AddaxAI necesita cargar la arquitectura desde Hugging Face en lugar de hacerlo desde GitHub en tiempo de ejecución, porque muchos de sus usuarios trabajan en redes que permiten el acceso a huggingface.co pero bloquean o limitan github.com. El repositorio incluye únicamente los ficheros necesarios para la inferencia de los backbones vits14, vitb14 y vitl14, con los pesos del ViT-B/14 como modelo principal.

El modelo no es generativo ni conversacional: produce embeddings de imagen de propósito general que sirven como extractor de características para tareas posteriores como clasificación, detección, segmentación o recuperación visual. El tamaño del repositorio (0,3 GB) es coherente con los pesos de un ViT-B/14 en precisión estándar, y la licencia declarada es Apache 2.0, heredada del proyecto original de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parches de 14x14, metodología DINOv2 autosupervisada |
| Parametros totales | no disponible (variante B/14 de la familia DINOv2; el dato exacto no figura en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (el repositorio no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible explícitamente; el repo carga pesos vía `torch.hub.load` con `pretrained=False` sobre los ficheros incluidos |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer con tokenización por parches de 14x14 píxeles, en la variante "base" (B) de la familia DINOv2. El repositorio incluye una copia reducida del código oficial de Meta (`dinov2/models/vision_transformer.py`, `dinov2/layers/*`, `dinov2/hub/*`) que permite instanciar los backbones vits14, vitb14 y vitl14 sin depender de GitHub. No se han realizado modificaciones al código salvo el adelgazamiento de `hubconf.py` para reexportar únicamente los tres puntos de entrada utilizados por AddaxAI.

El entrenamiento original de DINOv2 es autosupervisado, combinando objetivos de destilación autodistillada (self-distillation) con regularización por centrado y sharpening, sobre un corpus de imágenes a gran escala curado por Meta. No se dispone en la información proporcionada del número exacto de tokens de imagen, composición del dataset ni detalles de fases de ajuste fino; estos datos figuran en la documentación oficial de DINOv2, no en este repositorio espejo. El repositorio no incluye rutas de entrenamiento, evaluación, segmentación, profundidad, clasificadores ni DINOtxt.

## Capacidades

- Extracción de embeddings visuales de propósito general a partir de imágenes RGB.
- Representaciones útiles para clasificación de imágenes con cabezas lineales o fine-tuning ligero.
- Soporte para tareas densas de visión (segmentación, profundidad) siempre que se añadan cabezas específicas, aunque el repositorio solo incluye los backbones.
- Recuperación visual y búsqueda por similitud mediante embeddings.
- Base para detección y seguimiento en pipelines de visión artificial.
- Carga local de la arquitectura desde Hugging Face sin dependencia de GitHub en tiempo de ejecución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de modo "thinking", visión generativa, audio o vídeo.

## Casos de uso

- **Embeddings para búsqueda visual en catálogos**: el modelo genera vectores densos por imagen que se indexan en una base vectorial para recuperación por similitud; es adecuado por su calidad de representación autosupervisada y su coste de inferencia moderado.
- **Clasificación de imágenes con pocas etiquetas**: se congela el backbone y se entrena una cabeza lineal sobre los embeddings del ViT-B/14, lo que reduce drásticamente los requisitos de datos y cómputo frente a entrenar desde cero.
- **Preprocesado en pipelines de AddaxAI**: el repositorio está pensado para que AddaxAI cargue la arquitectura localmente vía `torch.hub.load(model_dir, model_arch, source="local", pretrained=False)`, evitando fallos en redes que bloquean GitHub.
- **Detección y seguimiento en vídeo**: los embeddings por fotograma permiten construir descriptores robustos para asociación entre frames en tareas de seguimiento multiobjeto.
- **Análisis de imágenes científicas o de campo**: al ser un extractor genérico, sirve como base para tareas de segmentación o clasificación en dominios específicos tras un ajuste fino supervisado.
- **Prototipado rápido de sistemas de visión**: al estar empaquetado con su código y licencia, se puede desplegar en entornos aislados sin acceso a repositorios externos, lo que acelera la puesta en marcha de pruebas de concepto.
- **Generación de características para modelos downstream**: los embeddings pueden alimentar clasificadores, clusterizadores o sistemas de recomendación visual en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,3 GB) y la variante ViT-B/14, es esperable que quepa en GPUs consumer con 4-8 GB de VRAM en precisión FP16, aunque este dato no figura en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por la familia del modelo, cabría esperar compatibilidad con RTX 3090, RTX 4090, A100 y H100, pero no se confirma en la documentación del repositorio.
- Compatibilidad con GPU consumer: probable por el tamaño, pero no confirmada explícitamente.
- Opciones de despliegue: carga vía `torch.hub.load` con `source="local"` desde el directorio descargado del Hub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DINOv2 ViT-B/14 (este repo) | no disponible | no aplica | Embeddings visuales | Apache 2.0 | Hugging Face (espejo de Addax) |
| DINOv2 ViT-S/14 | no disponible | no aplica | Embeddings visuales | Apache 2.0 | Hugging Face (oficial de Meta) |
| DINOv2 ViT-L/14 | no disponible | no aplica | Embeddings visuales | Apache 2.0 | Hugging Face (oficial de Meta) |
| CLIP ViT-B/32 | no disponible | no aplica | Embeddings imagen-texto | MIT (según versión) | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a parámetros estructurales y licencia.

## Limitaciones y advertencias

- El repositorio es una redistribución, no un modelo entrenado por Addax Data Science; la autoría intelectual y la responsabilidad sobre los pesos corresponden a Meta AI (FAIR).
- Solo se incluyen los backbones vits14, vitb14 y vitl14; no hay código de entrenamiento, evaluación, segmentación, profundidad, clasificadores, cell-dino, xray-dino ni dinotxt.
- El modelo no es generativo ni conversacional: no admite prompts de texto ni produce respuestas lingüísticas.
- Riesgo de sesgo heredado del corpus de entrenamiento original de DINOv2, no documentado en este repositorio.
- No se documentan limitaciones específicas de idioma porque el modelo no procesa texto.
- La licencia Apache 2.0 permite uso comercial, pero los usuarios deben revisar y cumplir los términos de la licencia original de Meta y las atribuciones indicadas en el repositorio.
- Para producción, conviene validar la versión exacta de los pesos y el código vendido, ya que el repositorio puede actualizarse y no se especifica un hash de commit.
- No se garantiza compatibilidad con versiones futuras de PyTorch o de la API de `torch.hub`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addax-Data-Science/DINOV2-VITB14
- Código original de DINOv2: https://github.com/facebookresearch/dinov2
- Licencia original: https://github.com/facebookresearch/dinov2/blob/main/LICENSE
- Sitio de AddaxAI: https://addaxdatascience.com/addaxai/
- Sitio de Addax Data Science: https://addaxdatascience.com/
