# dronefreak/human-action-classification-stanford40

## Resumen

El modelo `dronefreak/human-action-classification-stanford40` es un clasificador de imágenes especializado en reconocimiento de acciones humanas, desarrollado por Saumya Kumaar Saksena (usuario `dronefreak`). Resuelve la tarea de identificar, a partir de una fotografía, cuál de 40 actividades humanas concretas se está realizando (por ejemplo, cocinar, tocar la guitarra, leer o montar en bicicleta). Está afinado a partir de un ResNet34 preentrenado en ImageNet y se distribuye con licencia Apache 2.0.

La versión publicada en este repositorio corresponde a la variante ResNet34, con 21.322.216 parámetros y un peso de aproximadamente 85 MB. El autor reporta una precisión del 86,4 % y un macro F1 de 0,8618 sobre el conjunto de test de Stanford 40 Actions. El repositorio incluye además las variantes ResNet18, ResNet50, MobileNetV3 Large y MobileNetV3 Small, cada una con sus propios pesos.

Su relevancia práctica radica en que combina una latencia muy baja (unos 25 ms por imagen en una GTX 1050 Ti) con una precisión razonable para una tarea de 40 clases, e incorpora la opción de integrar estimación de pose con MediaPipe para refinar la clasificación. Es un modelo de visión por computador clásico, no un modelo de lenguaje, por lo que su utilidad se enmarca en pipelines de análisis de vídeo e imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet34 (CNN residual), con integracion opcional de MediaPipe para estimacion de pose |
| Parametros totales | 21.322.216 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de accion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), config.json, y `best.pth` por variante |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional de tipo ResNet34, preentrenada en ImageNet y posteriormente afinada para clasificación de 40 clases sobre el conjunto Stanford 40 Actions. La entrada es una imagen y la salida es una distribución de probabilidad sobre las 40 acciones. El autor ofrece además una integración opcional con MediaPipe para estimación de pose, que puede emplearse para enriquecer o condicionar la predicción.

No se especifican en la información disponible el número de tokens (no aplica), la composición exacta del dataset de entrenamiento más allá de Stanford 40 Actions, ni si se emplearon técnicas de aumento de datos, regularización o ajuste fino en varias fases. Tampoco se detalla si hubo destilación, recorte o balanceo de clases. La model card indica que el modelo es "pose-aware" de forma opcional, pero no describe la arquitectura exacta de esa integración.

## Capacidades

- Clasificación de imágenes en 40 clases de acciones humanas (lista completa en la model card: applauding, blowing_bubbles, brushing_teeth, cooking, jumping, reading, riding_a_bike, etc.).
- Predicción con top-k y niveles de confianza por clase.
- Integración opcional con estimación de pose mediante MediaPipe, que devuelve también la clase de pose detectada.
- Predicción por lotes (`predict_batch`) con tamaño de batch configurable.
- Inferencia en tiempo real (aproximadamente 25 ms por imagen en GTX 1050 Ti).
- API de Python sencilla a través del paquete `hac` (`ActionPredictor`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imágenes.
- Capacidades multilingües: no aplica; las etiquetas están en inglés.

## Casos de uso

- Monitorización de actividades en vídeo de vigilancia: el modelo puede clasificar fotogramas clave de cámaras para detectar acciones como `climbing`, `running` o `waving_hands`, con latencia de ~25 ms que permite procesar secuencias a varios FPS en hardware modesto.
- Análisis deportivo automatizado: clasificación de acciones como `riding_a_bike`, `rowing_a_boat` o `shooting_an_arrow` en imágenes de entrenamiento o competición, útil para etiquetado y estadísticas.
- Accesibilidad y asistencia: reconocimiento de acciones cotidianas (`brushing_teeth`, `cooking`, `reading`) para sistemas de apoyo a personas mayores o con diversidad funcional, combinando la predicción con la pose estimada por MediaPipe.
- Etiquetado y curación de datasets: uso del modelo para preetiquetar grandes volúmenes de imágenes de acciones humanas antes de una revisión humana, gracias al soporte de predicción por lotes.
- Domótica y hogar conectado: detección de acciones como `cooking`, `washing_dishes` o `watching_TV` a partir de imágenes de cámaras domésticas para activar rutinas automatizadas.
- Investigación en visión por computador: como baseline ligero (21,3 M de parámetros, 85 MB) para experimentos de reconocimiento de acciones y comparación con variantes mayores o menores del mismo autor.
- Aplicaciones móviles y de borde: la variante MobileNetV3 Small (2,5 M de parámetros, ~10 ms) del mismo repositorio permite desplegar clasificación de acciones en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo | Accuracy (%) | Macro Precision | Macro Recall | Macro F1 | Weighted F1 | Parametros | Tamano | Inferencia* |
|---|---|---|---|---|---|---|---|---|
| ResNet50 | 88,5 | 0,8874 | 0,8850 | 0,8842 | 0,8842 | 23,5 M | 94 MB | ~30 ms |
| **ResNet34 (este modelo)** | **86,4** | **0,8686** | **0,8640** | **0,8618** | **0,8618** | **21,3 M** | **85 MB** | **~25 ms** |
| ResNet18 | 82,3 | 0,8211 | 0,8230 | 0,8178 | 0,8178 | 11,2 M | 45 MB | ~18 ms |
| MobileNetV3 Large | 82,1 | 0,8216 | 0,8210 | 0,8169 | 0,8169 | 5,4 M | 20 MB | ~15 ms |
| ViT Base Patch16 | 76,8 | 0,7774 | 0,7680 | 0,7650 | 0,7650 | 86 M | 330 MB | ~45 ms |
| MobileNetV3 Small | 74,35 | 0,7382 | 0,7435 | 0,7350 | 0,7350 | 2,5 M | 10 MB | ~10 ms |

\*Imagen única en una NVIDIA GTX 1050 Ti, según el autor. Dataset evaluado: Stanford 40 Actions (test).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo ResNet34 (85 MB de pesos) cabe holgadamente en cualquier GPU con 2 GB o más de memoria. En CPU es perfectamente viable para uso no interactivo.
- GPU recomendadas: cualquier GPU moderna sirve; el autor reporta ~25 ms por imagen en una GTX 1050 Ti. Para lotes grandes se recomienda RTX 3060/4090, A100 o H100, aunque el cuello de botella no será la memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y dispositivos de borde (especialmente con las variantes MobileNetV3).
- Opciones de despliegue: PyTorch nativo a través del paquete `hac` del autor; exportación a TorchScript/ONNX no documentada en la información disponible. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: ~25 ms por imagen en GTX 1050 Ti (ResNet34), ~10 ms con MobileNetV3 Small y ~30 ms con ResNet50. El throughput escala con el tamaño de lote (`predict_batch` con `batch_size` configurable, por ejemplo 32).

## Comparativa con modelos similares

| Modelo | Parametros | Accuracy (Stanford 40) | Licencia | Disponibilidad |
|---|---|---|---|---|
| ResNet34 (este modelo) | 21,3 M | 86,4 % | Apache 2.0 | Hugging Face + GitHub |
| ResNet50 (misma familia) | 23,5 M | 88,5 % | Apache 2.0 | Hugging Face + GitHub |
| MobileNetV3 Large (misma familia) | 5,4 M | 82,1 % | Apache 2.0 | Hugging Face + GitHub |
| ViT Base Patch16 (misma familia) | 86 M | 76,8 % | Apache 2.0 | Hugging Face + GitHub |

No se dispone en la información proporcionada de comparaciones con clasificadores de acciones de otros autores o repositorios; los únicos datos comparativos son las variantes del mismo proyecto.

## Limitaciones y advertencias

- Modelo exclusivamente de clasificación de imágenes: no genera texto, no razona, no soporta tool calling ni agentes.
- Solo reconoce 40 acciones concretas del dataset Stanford 40; cualquier acción fuera de esa lista se asignará erróneamente a una de las 40 clases.
- Las etiquetas están en inglés; no hay soporte multilingüe.
- Precisión reportada del 86,4 % no verificada (`verified: false`): puede degradarse en dominios distintos al de Stanford 40 (iluminación, ángulos, culturas, resoluciones).
- Riesgo de sesgo: el dataset Stanford 40 tiene una distribución demográfica y geográfica concreta; el modelo puede comportarse peor en grupos o contextos poco representados.
- Riesgo de falsos positivos en imágenes sin personas o con acciones ambiguas.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset Stanford 40 Actions para usos derivados.
- La integración con MediaPipe es opcional y añade dependencias y latencia; su beneficio exacto no está cuantificado en la información disponible.
- No se documentan procesos de calibración de confianza ni umbrales recomendados para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/human-action-classification-stanford40
- Repositorio GitHub del proyecto: https://github.com/dronefreak/human-action-classification
- Perfil del autor en GitHub: https://github.com/dronefreak
- Dataset Stanford 40 Actions (referenciado en la model card): https://huggingface.co/datasets/stanford40
