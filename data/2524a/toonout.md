# 2524a/toonout

## Resumen

ToonOut es un modelo de segmentación de imágenes especializado en la eliminación de fondos de personajes de estilo anime. Se trata de un ajuste fino (fine-tuning) del modelo BiRefNet, desarrollado originalmente por ZhengPeng7, y ha sido entrenado por Matteo Muratori (Universidad de Bolonia y Kartoon AI) y Joël Seytre (Kartoon AI). El problema que resuelve es concreto: BiRefNet funciona bien en imágenes fotorrealistas, pero pierde precisión con contenido estilizado, especialmente en mechones de pelo, line art y zonas con transparencia, habituales en la ilustración anime.

El modelo se ha ajustado sobre el ToonOut Dataset, un conjunto de 1.228 imágenes recopilado por los propios autores y publicado bajo licencia CC-BY 4.0. Según la model card, este ajuste eleva la precisión por píxel del 95,3% al 99,5% en su conjunto de test, una mejora notable para una tarea de segmentación fina. El repositorio ocupa 0,9 GB y se distribuye con licencia MIT.

Es relevante ahora porque la eliminación de fondos en ilustración y animación es una necesidad recurrente en pipelines de producción de contenido (videojuegos, VTubers, cómics, merchandising) y los modelos genéricos no cubren bien el dominio estilizado. ToonOut ofrece una alternativa abierta y ligera, con endpoint en Replicate y cuaderno de demostración, lo que facilita su evaluación inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (ajuste fino); red de segmentación binaria de referencias bilaterales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto; etiquetas de la model card en inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,9 GB; la model card no detalla safetensors ni otros formatos) |

## Arquitectura y entrenamiento

ToonOut hereda la arquitectura BiRefNet, un modelo de segmentación de imágenes diseñado para extracción de primer plano de alta resolución mediante referencias bilaterales (de ahí su nombre), que combina información de bajo y alto nivel para refinar bordes y zonas ambiguas. Sobre esta base, los autores realizan un ajuste fino supervisado con pares imagen-máscara del ToonOut Dataset, compuesto por 1.228 imágenes de personajes anime.

La model card no detalla hiperparámetros, número de épocas, resolución de entrenamiento ni estrategia de aumento de datos. Tampoco se especifica si hubo etapas de preentrenamiento adicionales o destilación. La innovación principal no está en la arquitectura, sino en la curación del dataset y en el ajuste específico al dominio estilizado, que corrige los fallos de BiRefNet en mechones de pelo, líneas finas y regiones semitransparentes.

## Capacidades

- Segmentación de imágenes y eliminación de fondo (foreground/background) en ilustraciones de estilo anime.
- Generación de máscaras de alta precisión en bordes finos: mechones de pelo, line art y contornos estilizados.
- Manejo de zonas con transparencia parcial, un caso habitualmente problemático en modelos entrenados con imágenes fotorrealistas.
- Inferencia sobre imágenes individuales; no se documenta procesamiento por lotes ni vídeo.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente visual de segmentación.
- No dispone de capacidades multilingües ni de generación de texto.
- No se documentan modos especiales como thinking, visión adicional o audio.

## Casos de uso

- Producción de sprites para videojuegos: extraer personajes anime de ilustraciones originales para generar assets con fondo transparente listos para motores 2D, aprovechando la mejora en bordes finos frente a BiRefNet base.
- Creación de avatares para VTubers y streaming: separar al personaje del fondo para composición en tiempo real o para generar capas reutilizables en software de animación.
- Edición y maquetación de cómics y manga: aislar personajes para recolocarlos sobre nuevos fondos o para labores de retoque y colorización.
- Merchandising y print-on-demand: generar recortes limpios de personajes para camisetas, pegatinas y pósteres, donde los bordes de pelo y líneas finas son críticos.
- Pipelines de datasets para otros modelos: usar ToonOut como etiquetador automático de máscaras en ilustraciones anime para entrenar o evaluar otros segmentadores.
- Herramientas de escritorio o web para artistas: integrar el modelo en un flujo de trabajo de ilustración para eliminar fondos de bocetos y personajes con un solo clic.
- Moderación y catalogación de contenido: separar figuras de fondos para clasificación, indexación o detección de contenido en plataformas de arte.

## Benchmarks y rendimiento

La model card solo reporta una métrica agregada en su conjunto de test:

| Metrica | BiRefNet base | ToonOut |
|---|---|---|
| Precision por pixel (pixel accuracy) | 95,3% | 99,5% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de métricas estándar de segmentación como IoU, Dice o Boundary F-score. Tampoco se ofrecen comparativas numéricas con otros modelos de eliminación de fondo (por ejemplo, rembg, U2-Net o SAM).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio de pesos ocupa 0,9 GB, por lo que en fp32 la inferencia cabe holgadamente en GPUs consumer de 8 GB o menos.
- GPU recomendadas: no documentadas; por tamaño del modelo, una RTX 3060/4060 o superior debería ser suficiente para inferencia interactiva.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 6-8 GB de VRAM o más, aunque no se confirma en la documentación.
- Opciones de despliegue: el autor referencia un endpoint en Replicate (sprited/birefnet-toonout) y un cuaderno de demostración en GitHub; no se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ToonOut | BiRefNet ajustado para anime | no disponible | no aplica | 99,5% pixel accuracy en su test | MIT | Hugging Face, Replicate |
| BiRefNet (base) | Segmentación de primer plano | no disponible | no aplica | 95,3% pixel accuracy en el test de ToonOut | MIT (según el repo original) | Hugging Face |
| SAM (Segment Anything) | Segmentación promptable | no disponible | no aplica | No comparable directamente (tarea distinta) | Apache 2.0 (versión original) | Hugging Face, Meta |
| rembg / U2-Net | Eliminación de fondo | no disponible | no aplica | No disponible en esta información | MIT / Apache según variante | GitHub, PyPI |

La comparación cuantitativa solo es posible frente a BiRefNet base, ya que los autores no publican resultados frente a alternativas. SAM y rembg resuelven tareas relacionadas pero con enfoques distintos, por lo que la comparación directa requeriría una evaluación propia.

## Limitaciones y advertencias

- Sesgos de dominio: el ajuste se ha realizado solo con 1.228 imágenes de anime; el rendimiento puede degradarse en otros estilos (cómic occidental, 3D estilizado, pixel art) o en anime con características muy distintas al dataset.
- Riesgo de alucinación de máscaras: en imágenes con fondos complejos o personajes parcialmente ocluidos, el modelo puede incluir o excluir regiones incorrectamente; no se documentan métricas de error por tipo de borde.
- Limitaciones de contexto e idioma: no aplica contexto textual; la model card y el dataset están en inglés, aunque el modelo no procesa texto.
- Restricciones de licencia: los pesos son MIT, pero el dataset de entrenamiento es CC-BY 4.0, lo que exige atribución si se redistribuye; conviene revisar los términos del modelo base BiRefNet.
- Caveats para producción: no se documentan cuantizaciones, formatos de pesos ni latencias, lo que dificulta planificar el despliegue; el repositorio tiene 0 descargas y 0 likes, por lo que carece de validación comunitaria.
- La métrica reportada (pixel accuracy) es poco informativa en segmentación con desbalance de clases; no se aportan IoU ni Dice, que serían más representativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2524a/toonout
- Repositorio GitHub: https://github.com/MatteoKartoon/BiRefNet
- Paper (arXiv): https://arxiv.org/abs/2509.06839
- Dataset: https://huggingface.co/datasets/joelseytre/toonout/
- Endpoint en Replicate: https://replicate.com/sprited/birefnet-toonout
- Cuaderno de demostración: https://github.com/MatteoKartoon/BiRefNet/blob/main/toonout_demo.ipynb
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet
- Kartoon AI: https://kartoon.ai
- Toongether: https://toongether.ai
