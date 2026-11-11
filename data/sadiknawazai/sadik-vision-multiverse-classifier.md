# SadikNawazAI/sadik-vision-multiverse-classifier

## Resumen

Sadik Vision Multiverse Classifier es un modelo de clasificación de imágenes basado en una ResNet18 preentrenada en ImageNet y ajustada fina (fine-tuning) sobre el dataset SADIK Vision Multiverse, publicado por Sadik Nawaz, un desarrollador de 11 años. El modelo resuelve una tarea de clasificación multiclase con cuatro categorías visuales: arte digital y anime, estética cyberpunk y tecnológica, assets 3D de videojuegos y retratos fotorrealistas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere pesos ligeros o un empaquetado mínimo.

Se trata de un modelo de visión por computador de propósito educativo, no de un modelo de lenguaje. No dispone de contexto textual, no genera texto ni soporta tool calling: su única función es asignar una de las cuatro etiquetas a una imagen RGB de 224×224 píxeles. La relevancia actual es limitada desde el punto de vista de producción, pero resulta un ejemplo didáctico de pipeline completo de visión (entrenamiento, validación cruzada, métricas honestas y publicación en Hugging Face).

La arquitectura es una CNN residual estándar (ResNet18) con la capa fully connected final reemplazada por una de 4 salidas. El entrenamiento se realizó únicamente en CPU, con 77 imágenes, lo que condiciona fuertemente la calidad y la generalización del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (CNN residual, backbone preentrenado en ImageNet) |
| Parametros totales | no disponible (ResNet18 estándar ronda 11,7 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` de PyTorch) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`, checkpoint con `state_dict` y `class_names`) |

## Arquitectura y entrenamiento

El modelo es una ResNet18 con pesos iniciales de ImageNet y la cabeza de clasificación sustituida por una capa lineal de 4 clases. La entrada es de 224×224 con normalización ImageNet (media [0.485, 0.456, 0.406], desviación [0.229, 0.224, 0.225]). El entrenamiento usa aumentación de datos agresiva para un dataset tan pequeño: RandomResizedCrop, flip horizontal, rotación, color jitter, RandAugment y random erasing. La función de pérdida es CrossEntropy con pesos de clase y label smoothing de 0.1, optimizador AdamW (lr 3e-4, weight decay 1e-4) con scheduler coseno.

La validación se realizó con validación cruzada estratificada de 5 folds. El modelo final se entrenó sobre las 77 imágenes durante 8 épocas, exclusivamente en CPU. El dataset consta de 77 imágenes limpiadas manualmente y divididas en cuatro clases ordenadas alfabéticamente según `torchvision.datasets.ImageFolder`. No hay información sobre tokens, RLHF ni técnicas de decodificación, al no ser un modelo generativo.

## Capacidades

- Clasificación de imágenes en 4 categorías: `anime_digital_art`, `cyberpunk_tech`, `game_assets_3d` y `photorealistic_portraits`.
- Salida de probabilidades por clase mediante softmax sobre 4 logits.
- Inferencia sobre imágenes RGB redimensionadas y recortadas a 224×224.
- Incluye un script CLI (`predict.py`) para clasificar una o varias imágenes por ruta.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión avanzada, audio ni otras capacidades especiales más allá de la clasificación.

## Casos de uso

- Clasificación de portfolios de arte digital: el modelo puede etiquetar automáticamente imágenes de un repositorio creativo en las cuatro categorías, útil para organizar galerías pequeñas donde la precisión del 83,1 % sea aceptable.
- Etiquetado preliminar de assets en proyectos de videojuego indie: permite separar renders 3D y assets low-poly de otro tipo de imágenes antes de una revisión manual.
- Filtrado de imágenes en un pipeline de curación de datasets: como primer paso para descartar o agrupar imágenes que no encajen en las categorías de interés.
- Demostración educativa de visión por computador: sirve para explicar fine-tuning de ResNet18, validación cruzada y métricas macro F1 en cursos o talleres.
- Prototipado rápido de un clasificador de estética visual: para experimentar con clasificación de estilos (cyberpunk, anime, fotorrealismo) sin entrenar desde cero.
- Pruebas de integración de modelos PyTorch en entornos con CPU: al haberse entrenado y podido ejecutar en CPU, es adecuado para validar pipelines de inferencia ligeros.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| Out-of-fold accuracy (5-fold CV) | 0,8305 (83,1 %) |
| 5-fold CV accuracy | 83,3 % ± 6,3 % |
| Out-of-fold macro F1 (5-fold CV) | 0,778 (77,8 %) |

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| anime_digital_art | 0,73 | 0,73 | 0,73 | 11 |
| cyberpunk_tech | 0,71 | 0,83 | 0,77 | 24 |
| game_assets_3d | 0,75 | 0,55 | 0,63 | 11 |
| photorealistic_portraits | 1,00 | 0,97 | 0,98 | 31 |

El autor advierte que el dataset tiene solo 77 imágenes, por lo que las métricas son ruidosas. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una ResNet18 en FP32 ocupa del orden de decenas de MB, aunque el dato exacto no está disponible en la model card.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo se entrenó y validó en CPU, por lo que no requiere GPU dedicada.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos cientos de MB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo (`torch.load` + `resnet18`), script CLI incluido (`predict.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Dataset | Accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sadik Vision Multiverse Classifier | ResNet18 | 4 | 77 imágenes propias | 83,1 % (OOF) | Apache 2.0 | Hugging Face |
| ResNet18 ImageNet (torchvision) | ResNet18 | 1000 | ImageNet | no comparable (otra tarea) | BSD-3 | torchvision |
| CLIP (zero-shot) | ViT + text encoder | abierta (prompts) | millones de pares imagen-texto | no disponible en esta ficha | MIT (versión OpenAI) | Hugging Face / OpenAI |

La comparación directa con modelos de clasificación generales no es significativa porque las clases y el dataset son específicos y muy pequeños. No se dispone de alternativas publicadas con el mismo dataset en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 77 imágenes, lo que produce métricas ruidosas (desviación de ±6,3 % en accuracy entre folds).
- No apto para uso en producción ni para aplicaciones críticas de seguridad, según el propio autor.
- Rendimiento degradado en imágenes que se alejen de la distribución del conjunto de entrenamiento.
- Confusión frecuente entre `cyberpunk_tech` y `game_assets_3d`, que son visualmente similares; el recall de `game_assets_3d` es solo 0,55.
- Riesgo elevado de sobreajuste y de sesgos derivados de un dataset pequeño y curado manualmente por una sola persona.
- Licencia Apache 2.0 permite uso comercial, pero la baja calidad del modelo desaconseja ese uso.
- No procesa texto, por lo que no aplican limitaciones de idioma ni de contexto textual.
- No hay información sobre sesgos demográficos o de representación en las imágenes de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SadikNawazAI/sadik-vision-multiverse-classifier
- Dataset: https://huggingface.co/datasets/SadikNawazAI/sadik-image-classification-multiverse
- Perfil del autor: https://huggingface.co/SadikNawazAI
