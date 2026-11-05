# Pankaj8922/experiment

## Resumen

NSFW Detector v2 (weight-edited, experimental) es un clasificador binario de imágenes muy pequeno (MobileNetV3-small, 1,53 millones de parámetros) que estima la probabilidad de que una imagen contenga contenido para adultos. Lo publica el usuario Pankaj8922 en HuggingFace y deriva del modelo `Pankaj8922/nsfw-detector-v2` mediante una edición quirúrgica de pesos: solo se modificaron 151 números de un total de 1.532.018 (el 0,01%), correspondientes a 150 pesos y 1 sesgo de la capa lineal final. No se reentrenó ni se hizo fine-tuning de la red.

El problema que aborda es concreto: el modelo original reportaba un 99,87% de exactitud, pero esa cifra se medía sobre la misma distribución de entrenamiento (imágenes NSFW procedentes de packs de stickers e imágenes SFW de datasets generales). En benchmarks independientes su rendimiento caía a AUC 0,77 y 0,87, marcando como NSFW la mayoría de imágenes corrientes e incluso fotogramas en blanco. La edición corrige únicamente la capa de decisión usando datos con contenido emparejado, sin tocar el resto de la red.

La relevancia actual es doble: por un lado, demuestra una técnica de edición de pesos barata y reproducible para corregir sesgos de fuente en clasificadores; por otro, ofrece un filtro de triaje (permitir / revisión humana / bloquear) para pipelines de moderación de contenido. Es un modelo experimental, no un decisor automático único.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-small (`mobilenetv3_small_100`, timm) |
| Parametros totales | 1.532.018 (1,53 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagen) |
| Tipos de cuantizacion | no disponible (pesos en `pytorch_model.bin`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin componente textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`) + `config.json` con umbrales |

## Arquitectura y entrenamiento

La red es una MobileNetV3-small con 1,53 M de parámetros, creada con `timm.create_model("mobilenetv3_small_100", pretrained=False, num_classes=2)`. La entrada es una imagen RGB de 224×224, preprocesada con `Resize(224)`, `CenterCrop(224)` y normalización ImageNet (media [0,485, 0,456, 0,406], desviación [0,229, 0,224, 0,225]). La salida son dos clases: `0` = sfw y `1` = nsfw, con la probabilidad NSFW obtenida por softmax.

El entrenamiento original no se detalla en la información disponible. Lo que sí se documenta es el proceso de edición: no hubo entrenamiento por gradiente de la red. Se calcularon una sola vez las características de la penúltima capa (1024 dimensiones) de cada imagen y se editó únicamente la capa lineal final mediante un procedimiento greedy (el texto de la model card se corta en ese punto). Los datos usados para ajustar esa capa provienen de `strangerguardhf/NSFW-MultiDomain-Classification` y `deepghs/nsfw_detect`, con esquema de cinco clases (drawing / hentai / neutral / porn / sexy), excluyendo `sexy` de las métricas por ser una decisión de política. Los pesos liberados se reajustaron sobre todos los datos, por lo que el fichero publicado no tiene un test independiente propio.

## Capacidades

- Clasificación binaria de imágenes en sfw (0) y nsfw (1) con probabilidad calibrada.
- Salida de tres niveles mediante umbrales configurables en `config.json`: permitir (p < 0,44), revisión humana (0,44 – 0,936) y bloquear (p ≥ 0,936).
- Detección sobre fotografías reales, ilustraciones, anime, hentai y pornografía.
- Manejo correcto de fotogramas en blanco o ruido: en 15 fotogramas reales (negro, blanco, gris, ruido) el original marcaba 12 y este modelo ninguno.
- Inferencia en CPU viable por el tamano reducido del modelo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un clasificador de imagen.

## Casos de uso

- Triaje en pipelines de subida de imágenes: el modelo actúa como primer filtro barato que etiqueta cada imagen como permitir, revisar o bloquear, reduciendo el volumen que llega a moderadores humanos. Su coste computacional mínimo permite ejecutarlo en cada subida.
- Moderación de stickers y packs de imágenes: al estar ajustado con datos de packs de stickers, es adecuado para plataformas de mensajería que necesitan detectar contenido explícito en este formato concreto.
- Prefiltro en foros y comunidades: integrado antes de un clasificador más pesado o de un modelo de visión-lenguaje, descarta la mayoría del tráfico seguro y reserva los casos dudosos para revisión.
- Detección de ilustraciones y anime: a diferencia de muchos filtros entrenados solo con fotografía, mantiene tasas de falsos positivos relativamente contenidas en dibujos (38% a p>0,5, frente al 66% del original).
- Despliegue en el borde o en CPU: con 1,53 M de parámetros y pesos en PyTorch, puede ejecutarse en servidores sin GPU o en dispositivos con recursos limitados para moderación en tiempo real.
- Investigación sobre edición de pesos: sirve como caso reproducible de corrección de sesgo de fuente en clasificadores sin reentrenamiento, útil para estudiar cómo los datasets desbalanceados por origen distorsionan la capa de decisión.
- Modo sombra en producción: recomendado para ejecutar el modelo en paralelo sin actuar sobre sus salidas, midiendo falsos positivos y negativos sobre el tráfico real antes de habilitar bloqueos automáticos.

## Benchmarks y rendimiento

Evaluado sobre partes de dos datasets no usados para el ajuste (divisiones aleatorias). Se excluye la clase `sexy` de todas las métricas.

| Metrica | Dataset 1 test | Dataset 2 test |
|---|---|---|
| Fuente | `strangerguardhf/NSFW-MultiDomain-Classification` | `deepghs/nsfw_detect` |
| Clases seguras | fotos normales, anime, fotogramas en blanco | neutral, drawing |
| AUC original → este modelo | 0,768 → 0,946 | 0,865 → 0,944 |
| IC 95% de la mejora (bootstrap) | +0,18 (+0,13 … +0,23) | +0,08 (+0,06 … +0,10) |
| Imágenes explícitas detectadas a p>0,5 | 100% → 98% | 93% → 92% |

Tasa de falsos positivos (imágenes seguras marcadas como NSFW), original → este modelo:

| Clase | a p>0,5 | a 95% de recall de explícito |
|---|---|---|
| Fotos normales (dataset 1) | 87% → 20% | 66% → 14% |
| Anime (dataset 1) | 82% → 56% | 60% → 49% |
| Fotogramas en blanco | 41% → 0% | — |
| Neutral (dataset 2) | 30% → 9% | 32% → 11% |
| Dibujos (dataset 2) | 66% → 38% | 73% → 46% |

Comportamiento aproximado con los umbrales sugeridos sobre datos retenidos:

| Clase | permitir | revisar | bloquear |
|---|---|---|---|
| Neutral (dataset 2) | ~89% | ~11% | ~1% |
| Fotos normales (dataset 1) | ~76% | ~23% | ~1% |
| Dibujos (dataset 2) | ~54% | ~42% | ~4% |
| Anime (dataset 1) | ~42% | ~56% | ~2% |
| Hentai / porn (datasets 1 y 2) | 2–5% | 26–38% | 60–69% |

Advertencias sobre estas cifras: los pesos publicados se reajustaron sobre todos los datos, por lo que el fichero liberado no tiene test independiente; la tabla corresponde a la misma receta ajustada solo sobre la partición de ajuste. Ambos datasets comparten taxonomía y pueden compartir imágenes de origen (se eliminó ~1% de casi duplicados en el dataset 2, pero el solapamiento real podría ser mayor). Los tamanos muestrales son modestos: unos 630 imágenes en el test del dataset 2 y 380 en el del dataset 1, de las cuales 150 son fotogramas sintéticos en blanco.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB incluso en FP32; el modelo ocupa unos pocos MB de pesos (1,53 M de parámetros).
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada es sobrada.
- Cabe en cualquier GPU de consumo y también en CPU sin problemas de latencia para volúmenes moderados.
- Opciones de despliegue: PyTorch nativo (el código de la model card usa `timm` y `torch.load`), exportación a TorchScript u ONNX no documentada pero viable por la arquitectura estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamano del modelo se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pankaj8922/experiment (este) | 1,53 M | Clasificación binaria NSFW | Apache 2.0 | HuggingFace, pesos PyTorch |
| Pankaj8922/nsfw-detector-v2 (base) | 1,53 M | Clasificación binaria NSFW | no disponible en la información | HuggingFace, pesos PyTorch |
| Clasificadores NSFW de mayor tamano (p. ej. basados en ViT o ResNet) | no disponible | Clasificación NSFW multi-clase | variable | HuggingFace |

No se dispone de datos de benchmarks de terceros en la información proporcionada para establecer una comparación cuantitativa con alternativas. La comparación más directa es con su modelo base: misma arquitectura y mismos pesos salvo la capa final, con una mejora de AUC de +0,18 y +0,08 en los dos benchmarks y una reducción drástica de falsos positivos en imágenes seguras.

## Limitaciones y advertencias

- Modelo experimental: debe usarse como filtro de triaje, nunca como único decisor automático.
- Los pesos publicados se reajustaron sobre todos los datos, por lo que no existe una evaluación independiente del fichero liberado; las métricas corresponden a la receta sobre la partición de ajuste.
- Los datasets de evaluación comparten taxonomía y posiblemente imágenes de origen; "held-out" significa la misma familia de datos, no tráfico real.
- Tamanos muestrales modestos (380 y 630 imágenes en los tests), lo que limita la precisión de las estimaciones.
- Tasa de falsos positivos aún elevada en ilustraciones y anime (56% y 38% a p>0,5), lo que generará una cola de revisión humana sustancial, en torno a un cuarto o más del tráfico según la mezcla.
- Los umbrales sugeridos se eligieron sobre datos de ajuste con validación cruzada; deben reajustarse sobre imágenes que coincidan con el tráfico propio.
- La exclusión de la clase `sexy` de las métricas implica que el tratamiento del contenido sugestivo es una decisión de política no resuelta por el modelo.
- No se documentan sesgos demográficos ni de otro tipo más allá del sesgo de fuente corregido; no hay información sobre sesgos conocidos adicionales.
- Riesgo de alucinación no aplica (no es generativo), pero sí de clasificación errónea en dominios alejados de los datos de ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye con la etiqueta `not-for-all-audiences` y fue evaluado con material sexualmente explícito; conviene revisar las políticas de la plataforma antes de integrarlo.
- No se documentan idiomas ni capacidades textuales; es exclusivamente un clasificador de imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pankaj8922/experiment
- Modelo base: https://huggingface.co/Pankaj8922/nsfw-detector-v2
- Dataset de ajuste 1: https://huggingface.co/datasets/Pankaj8922/stickers-binary-v2
- Dataset de evaluación 1: https://huggingface.co/datasets/strangerguardhf/NSFW-MultiDomain-Classification
- Dataset de evaluación 2: https://huggingface.co/datasets/deepghs/nsfw_detect
- Librería timm: https://github.com/huggingface/pytorch-image-models
