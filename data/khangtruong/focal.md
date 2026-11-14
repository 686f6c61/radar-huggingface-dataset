# KhangTruong/FOCAL

## Resumen

FOCAL es un modelo de segmentación de imágenes orientado a la detección de imágenes sintéticas y manipuladas, desarrollado por el usuario KhangTruong y publicado bajo licencia Apache 2.0. El repositorio contiene checkpoints entrenados para la tarea de localización a nivel de píxel de regiones generadas o manipuladas en imágenes, con aplicación directa en la detección de contenido sintético procedente de modelos de difusión y de edición de imágenes. El modelo se distribuye a través de la librería `sid-unet` y se enmarca en el pipeline de Hugging Face `image-segmentation`.

El repositorio incluye dos checkpoints evaluados: `sid_focal_hrnet` y `sid_pim_swin`, ambos comparados sobre el protocolo de evaluación `eval_mvss_v1_protocol` con el conjunto `KhangTruong/Tampered-Images-Combined-Dataset-Fake` (17.929 muestras). La versión activa es `v1`, con una puntuación de validación de 0,824 en la época 10, que es también el total de épocas de entrenamiento. El tamaño del repositorio es de 1,6 GB.

La relevancia actual del modelo radica en la creciente necesidad de verificar la autenticidad de imágenes en entornos donde los generadores de difusión producen contenido indistinguible del real. FOCAL aborda esta tarea como un problema de segmentación binaria (real frente a sintético/manipulado), lo que permite no solo clasificar una imagen sino localizar las regiones afectadas. No obstante, los resultados publicados muestran un rendimiento desigual según el subconjunto de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SID-UNet con backbone HRNet (checkpoint `sid_focal_hrnet`) y Swin (checkpoint `sid_pim_swin`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints PyTorch (`.pt`) |
| Tarea | Segmentación de imágenes (detección de imágenes sintéticas/manipuladas) |
| Librería | `sid-unet` |
| Tamaño del repositorio | 1,6 GB |
| Versión activa | `v1` (mejor score 0,824 en época 10) |
| Épocas de entrenamiento | 10 |

## Arquitectura y entrenamiento

FOCAL se presenta como una familia de checkpoints basados en la arquitectura SID-UNet, una variante de U-Net orientada a la detección de imágenes sintéticas. Se publican dos variantes con backbones distintos: `sid_focal_hrnet`, que emplea HRNet como extractor de características, y `sid_pim_swin`, que utiliza Swin Transformer. Ambos checkpoints se entrenaron durante 10 épocas, alcanzando la mejor puntuación de validación (0,824) en la época 10, lo que sugiere que el entrenamiento podría haberse detenido al alcanzar el máximo de épocas configurado sin evidencia de convergencia plena.

La información disponible no detalla la composición exacta del dataset de entrenamiento, el número de tokens o imágenes procesadas, ni si se aplicaron técnicas de aumento de datos, destilación o ajuste fino específico. La evaluación se realizó sobre el conjunto `KhangTruong/Tampered-Images-Combined-Dataset-Fake`, que combina subconjuntos como CASIA_V1, CASIA_V2 y COCO_Inpaint, lo que indica que el modelo se entrena y evalúa en escenarios de manipulación de imágenes (inpainting, copy-move, splicing) además de generación sintética pura.

## Capacidades

- Segmentación a nivel de píxel para localizar regiones sintéticas o manipuladas en una imagen.
- Detección de imágenes generadas por modelos de difusión y de manipulaciones de tipo inpainting.
- Clasificación binaria implícita (real frente a sintético) derivada del mapa de segmentación.
- Evaluación sobre protocolos de referencia en detección de manipulación de imágenes (MVSS-v1).
- Dos variantes de backbone (HRNet y Swin) para distintos compromisos de precisión y coste computacional.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.
- No dispone de modo de razonamiento explícito (thinking mode) ni procesamiento de audio o texto.

## Casos de uso

- Verificación de autenticidad de imágenes en plataformas de contenido: el modelo genera un mapa de segmentación que permite marcar regiones sospechosas de ser sintéticas o manipuladas, útil en moderación de contenido y fact-checking.
- Detección de inpainting en imágenes de prensa: el checkpoint `sid_focal_hrnet` obtiene un AUROC de 0,9655 en CASIA_V2, lo que lo hace adecuado para detectar ediciones localizadas en fotografías periodísticas.
- Auditoría de datasets de entrenamiento: permite filtrar imágenes sintéticas o manipuladas antes de incluirlas en pipelines de entrenamiento de otros modelos, reduciendo la contaminación de datos.
- Análisis forense digital: integrado en herramientas de peritaje, el modelo localiza regiones manipuladas en capturas o documentos escaneados, con especial rendimiento en los subconjuntos CASIA.
- Investigación en detección de deepfakes visuales: sirve como baseline reproducible para comparar nuevas técnicas de detección de imágenes generadas por difusión.
- Control de calidad en generación de imágenes: permite verificar si una imagen producida por un pipeline generativo contiene artefactos o regiones que el modelo identifica como sintéticas, ayudando a depurar el generador.
- Moderación en redes sociales: el modelo puede prefiltrar imágenes sospechosas para revisión humana, priorizando aquellas con alta puntuación de segmentación en regiones concretas.

## Benchmarks y rendimiento

Resultados de la evaluación cruzada sobre el protocolo `eval_mvss_v1_protocol` con el conjunto `KhangTruong/Tampered-Images-Combined-Dataset-Fake` (17.929 muestras):

| Checkpoint | Loss | IoU | Dice / F1 | AUROC | Pixel Acc | Precision | Recall | Specificity |
|---|---|---|---|---|---|---|---|---|
| `sid_focal_hrnet` | 1,0407 | 0,2293 | 0,2902 | 0,6171 | 0,7758 | 0,2809 | 0,4618 | 0,8233 |
| `sid_pim_swin` | 0,9506 | 0,1645 | 0,1983 | 0,5770 | 0,8472 | 0,2761 | 0,2281 | 0,9416 |

Desglose por subconjunto para `sid_focal_hrnet`:

| Subconjunto | IoU | Dice / F1 | AUROC | Pixel Acc | Precision | Recall | Specificity | Muestras |
|---|---|---|---|---|---|---|---|---|
| CASIA_V1 | 0,6365 | 0,7179 | 0,9073 | 0,9578 | 0,6672 | 0,8478 | 0,9668 | 920 |
| CASIA_V2 | 0,7391 | 0,8137 | 0,9655 | 0,9641 | 0,7506 | 0,9649 | 0,9661 | 1000 |
| COCO_Inpaint | 0,0459 | 0,0794 | 0,5328 | 0,8406 | 0,0745 | 0,1849 | no disponible | no disponible |

El rendimiento agregado es bajo (IoU 0,2293 y Dice 0,2902 para el mejor checkpoint), lastrado principalmente por el subconjunto COCO_Inpaint, donde el modelo apenas supera el azar (AUROC 0,5328). En los subconjuntos CASIA el rendimiento es notablemente superior (AUROC por encima de 0,90), lo que indica que el modelo generaliza bien en manipulaciones de tipo splicing/copy-move pero no en inpainting sobre imágenes naturales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio (1,6 GB) incluye ambos checkpoints y artefactos, por lo que cada checkpoint individual es sustancialmente menor.
- GPU recomendadas: no disponible. Al tratarse de un modelo de segmentación con backbone HRNet/Swin, es probable que quepa en GPUs de consumo, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del repositorio sugiere que es viable en GPUs con 8-16 GB de VRAM, pero es una estimación no verificada.
- Opciones de despliegue: la librería `sid-unet` es el mecanismo previsto; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Backbone | IoU (MVSS-v1) | AUROC (MVSS-v1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FOCAL `sid_focal_hrnet` | Segmentación de imágenes sintéticas | HRNet | 0,2293 | 0,6171 | Apache 2.0 | Hugging Face |
| FOCAL `sid_pim_swin` | Segmentación de imágenes sintéticas | Swin | 0,1645 | 0,5770 | Apache 2.0 | Hugging Face |
| Alternativas de la categoría (p. ej. TruFor, PSCC-Net, MVSS-Net) | Detección de manipulación | Varios | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible | no disponible |

No se dispone de datos comparativos con otros modelos de detección de imágenes sintéticas en la información proporcionada. La comparación interna entre los dos checkpoints de FOCAL muestra que `sid_focal_hrnet` supera a `sid_pim_swin` en IoU, Dice y AUROC, mientras que `sid_pim_swin` obtiene mayor precisión de píxel y especificidad (a costa de un recall mucho menor).

## Limitaciones y advertencias

- Rendimiento muy bajo en el subconjunto COCO_Inpaint (IoU 0,0459, AUROC 0,5328), lo que indica escasa capacidad para detectar manipulaciones de inpainting sobre imágenes naturales.
- El mejor checkpoint (`sid_focal_hrnet`) alcanza un AUROC agregado de solo 0,6171, lejos de niveles utilizables en producción sin revisión humana.
- El entrenamiento se detuvo a las 10 épocas con el mejor score en la última, sin evidencia de convergencia; es probable que el modelo esté infraentrenado.
- La puntuación de validación (0,824) no se corresponde con las métricas de segmentación publicadas, lo que sugiere que la métrica de validación podría ser de clasificación y no de localización.
- No se documentan sesgos conocidos, pero al ser un detector entrenado sobre un dataset específico (CASIA, COCO_Inpaint), puede fallar en dominios visuales no representados.
- Riesgo de falsos positivos y falsos negativos elevado: la precisión agregada es de 0,2809 y el recall de 0,4618 en el mejor checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento actual desaconseja su uso en producción sin validación exhaustiva en el dominio objetivo.
- No se especifican limitaciones de idioma porque el modelo no procesa texto.
- El modelo no es un detector de texto generado ni de audio; su ámbito es exclusivamente visual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KhangTruong/FOCAL
- Dataset de evaluación: https://huggingface.co/datasets/KhangTruong/Tampered-Images-Combined-Dataset-Fake
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
