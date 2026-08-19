# gorilla-watch/GorillaWatch-DINOv2-Base

## Resumen

GorillaWatch-DINOv2-Base es un modelo de extracción de características visuales diseñado específicamente para la re-identificación de gorilas occidentales de llanura en vídeo de cámaras trampa. Desarrollado por el equipo GorillaWatch y presentado en WACV 2026, el modelo aborda el problema de monitorización de poblaciones de una especie en peligro crítico, donde la identificación manual de individuos a partir de grandes archivos de vídeo resulta inviable. Se basa en el backbone `vit_base_patch14_dinov2.lvd142m` de DINOv2 (86,8 millones de parámetros), fine-tuneado con triplet loss de hard-mining sobre el dataset Gorilla-SPAC-Wild, y proyecta las imágenes a un embedding de 256 dimensiones. La identificación se realiza mediante recuperación k-NN sobre una galería de embeddings, sin vocabulario fijo de identidades, lo que permite generalizar a individuos no vistos durante el entrenamiento. Su relevancia radica en que es uno de los primeros sistemas automatizados de re-identificación de gorilas en estado salvaje, con resultados publicados tanto en dominio (Gorilla-SPAC-Wild) como en transferencia cero-shot a un zoológico (Gorilla-Zoo-Berlin).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 14, DINOv2) |
| Parametros totales | 86.776.576 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo utiliza como backbone un ViT-Base de DINOv2 preentrenado (patch size 14, resolución de entrada 518×518), fine-tuneado con una función de pérdida de triplet loss con hard-mining en distancia euclidiana y margen 0,647. El entrenamiento se realizó con AdamW (β=0,9/0,999, ε=1e-7), tasa de aprendizaje 1,9e-7 con decaimiento coseno hasta 1e-7, batch efectivo de 48 (8 con 6 pasos de acumulación de gradiente), regularización L2=0,0059 y L2-SP=1,3e-5, durante un máximo de 100 épocas con checkpoint de mejor pérdida de validación. Se usó precisión mixta AMP (fp16 autocast, pesos maestros fp32) y semilla 42. El dataset de entrenamiento es Gorilla-SPAC-Wild en su configuración `face_with_body`, que incluye recortes de cara y cuerpo de gorilas. La proyección final produce un embedding de 256 dimensiones, y la identidad se asigna mediante k-NN con k=5 bajo distancia euclidiana contra una galería de embeddings, enmascarando entradas de la misma cámara y fecha para evitar coincidencias triviales.

## Capacidades

- Extracción de características faciales y corporales de gorilas para re-identificación individual.
- Generación de embeddings de 256 dimensiones normalizados para recuperación por similitud.
- Identificación por k-NN (k=5, distancia euclidiana) sobre una galería, sin clasificación fija.
- Generalización a individuos no vistos durante el entrenamiento (no hay vocabulario cerrado de identidades).
- Transferencia cero-shot a dominios nuevos (demostrado con Gorilla-Zoo-Berlin).
- Preprocesamiento específico: resize cuadrado a 518×518 y normalización con media y desviación 0,5 (no usa la transformación por defecto de timm).

## Casos de uso

- Monitorización de poblaciones de gorilas en estado salvaje: el modelo permite procesar automáticamente archivos de cámaras trampa para identificar individuos y estimar tamaños poblacionales sin intervención manual, reduciendo el esfuerzo de campo.
- Estudios de comportamiento y dinámica social: al rastrear individuos a lo largo del tiempo, los investigadores pueden analizar interacciones sociales, jerarquías y patrones de movimiento.
- Seguimiento de individuos concretos en proyectos de conservación: permite localizar a un gorila específico en grandes volúmenes de vídeo, útil para monitorizar salud, migraciones o eventos de caza furtiva.
- Evaluación de biodiversidad en zoológicos y reservas: el modelo funciona en transferencia cero-shot a entornos de zoológico (como Gorilla-Zoo-Berlin), facilitando el censo de animales en cautividad.
- Automatización de pipelines de visión por computador para fauna: puede integrarse como módulo de re-identificación en sistemas más amplios de detección, seguimiento y análisis de vídeo, junto con herramientas como detectores de objetos y trackers.
- Investigación en metric-learning y fine-tuning de DINOv2: el modelo sirve como referencia para aplicar técnicas de triplet loss con hard-mining sobre backbones de visión auto-supervisados en dominios especializados.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor se presentan a continuación. La precisión macro pondera por igual a individuos raros y frecuentes, siendo la métrica más exigente. El protocolo enmascara entradas de la misma cámara y fecha (mismo encuentro) para forzar coincidencias entre encuentros distintos.

### In-domain: Gorilla-SPAC-Wild (test)

| Protocolo | Micro accuracy | Macro accuracy |
|---|---|---|
| Por imagen | 0,4840 | 0,3980 |
| Por tracklet (promedio) | 0,5394 | 0,4083 |

### Out-of-distribution: Gorilla-Zoo-Berlin (test, zero-shot)

| Protocolo | Micro accuracy | Macro accuracy |
|---|---|---|
| Por imagen | 0,7288 | 0,7125 |
| Por tracklet (promedio) | 0,7636 | 0,7424 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un ViT-Base con 86,8M de parámetros, el modelo en fp32 ocupa aproximadamente 347 MB; en fp16 unos 174 MB. La inferencia por imagen requiere menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; funciona en GPUs consumer como NVIDIA GTX 1060, RTX 2060, RTX 3060, RTX 4090, etc. También es viable en CPU para procesamiento por lotes pequeño.
- Despliegue: compatible con PyTorch y timm; se puede integrar en pipelines con vLLM (aunque no es un modelo de texto), o más apropiadamente con frameworks de visión como TorchServe o simplemente mediante scripts Python con `huggingface_hub` y `torch`. No se han publicado configuraciones específicas para llama.cpp u Ollama (no aplican a modelos de visión).
- Latencia y throughput estimados: no se han publicado datos oficiales; en una GPU moderna (p. ej., RTX 3090) se puede esperar una latencia de pocos milisegundos por imagen y un throughput de cientos de imágenes por segundo, dado el tamaño del modelo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de re-identificación de gorilas o fauna salvaje con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo está especializado en gorilas occidentales de llanura; su rendimiento en otras especies o subespecies no está validado.
- La precisión en dominio (Gorilla-SPAC-Wild) es moderada (micro accuracy 0,484 por imagen), lo que sugiere que la re-identificación automática puede requerir verificación humana en aplicaciones críticas.
- La transferencia a otros entornos (zoológicos, otras regiones) puede degradarse; el resultado en Gorilla-Zoo-Berlin es mejor que el in-domain, pero no hay garantía para otros dominios.
- El preprocesamiento es específico: usar la transformación por defecto de timm produce embeddings incorrectos. Es obligatorio aplicar resize cuadrado a 518×518 y normalización con media=desviación=0,5.
- No se han evaluado sesgos demográficos o de iluminación; el modelo puede fallar con condiciones extremas de luz, oclusiones o ángulos de cámara atípicos.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no se especifican restricciones adicionales sobre los datos de entrenamiento; se recomienda revisar la licencia de los datasets asociados.
- No es un modelo de lenguaje ni de generación; no aplican riesgos de alucinación textual, pero sí de falsos positivos en la recuperación k-NN si la galería contiene individuos muy similares.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/gorilla-watch/GorillaWatch-DINOv2-Base)
- [Paper en arXiv (abs)](https://arxiv.org/abs/2512.07776v1)
- [Paper en arXiv (HTML)](https://arxiv.org/html/2512.07776)
- [Página del proyecto](https://gorilla-watch.github.io/)
- [Repositorio de código en GitHub](https://github.com/gorilla-watch/gorillawatch)
- [Dataset Gorilla-SPAC-Wild](https://huggingface.co/datasets/gorilla-watch/Gorilla-SPAC-Wild)
- [Dataset Gorilla-Zoo-Berlin](https://huggingface.co/datasets/gorilla-watch/Gorilla-Zoo-Berlin)
- [Repositorio DINOv2 de Meta AI](https://github.com/facebookresearch/dinov2)
