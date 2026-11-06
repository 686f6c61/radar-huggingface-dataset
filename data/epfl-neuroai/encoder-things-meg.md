# epfl-neuroai/encoder-things-meg

## Resumen

`encoder-things-meg` es un modelo de codificacion cerebral (brain encoding) desarrollado por el laboratorio EPFL NeuroAI. Su funcion es predecir la respuesta magnetoencefalografica (MEG) que provoca una imagen en el cerebro humano, tal como se registro en el conjunto de datos THINGS-MEG. La salida es una matriz de 271 sensores por 130 instantes temporales (de 0 a 1,29 s tras la aparicion del estimulo, muestreados a 100 Hz), con cada sensor normalizado (z-score) respecto a su linea base pre-estimulo.

El modelo no es un generador de texto ni un asistente conversacional: es un extractor de caracteristicas visuales con una cabeza de lectura lineal entrenada para mapear representaciones de imagen a senales neuronales. Internamente combina redes convolucionales y transformers de vision (ResNet-50, ViT-S, DINOv2-B y, en la variante mas precisa, el codificador visual de Qwen3-VL-2B) con un readout lineal por participante. Dispone de cuatro variantes que intercambian precision por velocidad, con tamanos de descarga entre 0,55 GB y 8,7 GB.

Es relevante ahora porque se publica junto al benchmark THINGS-MEG y porque demuestra que un codificador visual multimodal moderno (Qwen3-VL-2B) aporta la mejor prediccion de la respuesta cerebral en el conjunto de prueba, superando a arquitecturas convolucionales clasicas. El modelo esta pensado para investigadores de neurociencia computacional y vision, no para aplicaciones de produccion convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de codificadores visuales (ResNet / ViT / DINOv2 / Qwen3-VL-2B vision) + readout lineal por participante |
| Parametros totales | 240.717.240 (pesos safetensors del repositorio; la variante `accurate` descarga ademas los pesos de Qwen3-VL-2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada: imagenes PIL; salida: tensor 271 x 130) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, con codigo Python personalizado (`modeling.py`) y `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo es un pipeline de extraccion de caracteristicas visuales seguido de una regresion lineal. La variante por defecto (`efficient`) combina ResNet-50 y ViT-S; `tiny` usa ResNet-18 y ViT-S; `cnn` emplea solo ResNet-152; y `accurate` concatena ResNet-152, DINOv2-B y el codificador visual de Qwen3-VL-2B-Instruct, generando 256 caracteristicas por imagen (frente a 128 en el resto). Sobre esas caracteristicas se ajusta un readout lineal especifico por participante (P1 a P4) que produce la prediccion MEG.

El entrenamiento se realizo sobre las 22.248 imagenes de entrenamiento de THINGS-MEG y se evaluo sobre 200 imagenes de test (imagenes nuevas de conceptos ya vistos en entrenamiento). No se documenta en la informacion disponible el numero de tokens ni el uso de RLHF/DPO, algo que no aplica a este tipo de modelo. La innovacion principal es el uso de un codificador visual de un VLM moderno (Qwen3-VL-2B) como extractor de caracteristicas para prediccion neuronal, junto con un readout que puede ajustarse a grabaciones propias mediante `model.features(images)`.

## Capacidades

- Prediccion de respuestas MEG a imagenes: salida de 271 sensores x 130 instantes temporales (0 a 1,29 s, 100 Hz).
- Prediccion promediada entre los cuatro participantes del dataset (por defecto) o individual por participante (`subjects=["P2"]`).
- Extraccion de caracteristicas visuales reutilizables: `model.features(images)` devuelve 128 valores por imagen (256 en `accurate`) para ajustar readouts propios.
- Procesamiento por lotes con `batch_size` configurable (32 por defecto).
- Seleccion de variante en tiempo de carga (`tiny`, `efficient`, `cnn`, `accurate`) con descarga selectiva de pesos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- Capacidades multilingues: no aplica (modelo puramente visual).

## Casos de uso

- Prediccion de respuesta cerebral a estimulos visuales: dado un conjunto de imagenes, obtener la respuesta MEG esperada para comparar con grabaciones reales o generar hipotesis sobre el procesamiento visual temprano.
- Investigacion en neurociencia computacional: usar el modelo como baseline para estudiar que areas y latencias codifican determinadas categorias visuales, analizando la correlacion por sensor y tiempo.
- Ajuste de readouts personalizados: con `model.features(images)` se pueden entrenar cabezas lineales sobre grabaciones propias de otros sistemas MEG (no CTF) o de nuevos participantes.
- Evaluacion de modelos de vision: comparar que arquitectura visual (ResNet, ViT, DINOv2, Qwen3-VL) predice mejor la actividad cerebral, como herramienta de analisis de representaciones.
- Generacion de estimulos candidatos en experimentos: seleccionar imagenes que maximicen o minimicen la respuesta predicha en sensores concretos antes de adquirir datos reales.
- Docencia y divulgacion: demostrar de forma reproducible el flujo completo de un experimento de codificacion cerebral con un modelo open source y licencia permisiva.
- Benchmarking de infraestructura: por su bajo consumo (0,9 a 6,7 GiB de VRAM) sirve como carga de trabajo ligera para validar pipelines de inferencia en GPU.

## Benchmarks y rendimiento

Las puntuaciones son la correlacion de Pearson entre prediccion y registro, dividida por el techo de ruido, promediada sobre los puntos con techo superior a 0,1 y luego sobre participantes.

| Variante | Redes de imagen | Readout propio | Readout promedio | Nuevo participante | Descarga | Imagenes/s | VRAM |
|---|---|---|---|---|---|---|---|
| `efficient` (defecto) | ResNet-50 + ViT-S | 0,504 | 0,363 | 0,246 | 0,96 GB | 119 | 1,4 GiB |
| `tiny` | ResNet-18 + ViT-S | 0,496 | 0,357 | 0,246 | 0,55 GB | 127 | 0,9 GiB |
| `cnn` | ResNet-152 | 0,509 | 0,367 | 0,246 | 1,5 GB | 112 | 1,9 GiB |
| `accurate` | ResNet-152 + DINOv2-B + Qwen3-VL-2B | 0,544 | 0,394 | 0,262 | 4,4 GB + 4,3 GB (Qwen) | 16 | 6,7 GiB |

Referencia del leaderboard THINGS-MEG: el mejor modelo sin fine-tuning, Qwen3-VL-2B, obtiene 0,463 (media sobre siete grupos de sensores, no directamente comparable con las cifras anteriores).

## Requisitos de hardware

- VRAM estimada: 0,9 GiB (`tiny`), 1,4 GiB (`efficient`), 1,9 GiB (`cnn`), 6,7 GiB (`accurate`), con lote de 32.
- GPU recomendadas: cualquier GPU con al menos 2 GiB de VRAM para las tres variantes ligeras; para `accurate` se recomienda 8 GiB o mas (RTX 3060 Ti, RTX 4070, A100).
- Cabe en GPU de consumo: si, practicamente todas las variantes caben en GPUs consumer modernas; `accurate` requiere una GPU de gama media-alta.
- Opciones de despliegue: PyTorch nativo con `transformers` (`AutoModel.from_pretrained` con `trust_remote_code=True`) o carga directa de `modeling.py` sin `transformers`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Rendimiento: 119 imagenes/s (`efficient`), 127 (`tiny`), 112 (`cnn`) y 16 (`accurate`) en una NVIDIA A100 con lote 32, medido de extremo a extremo desde imagenes PIL.
- Requiere fijar `revision` y revisar el codigo remoto antes de ejecutarlo, ya que `trust_remote_code=True` ejecuta Python del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada/salida | Contexto | Puntuacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `encoder-things-meg` (este) | 240,7 M (+ Qwen3-VL-2B en `accurate`) | Imagen a MEG (271 x 130) | No aplica | 0,504 (propio) / 0,544 (`accurate`) | Apache 2.0 | Hugging Face |
| Qwen3-VL-2B (sin fine-tuning) | 2 B aprox. | Imagen/texto | No disponible | 0,463 (leaderboard, no comparable) | No disponible en la informacion | Hugging Face |
| ResNet-50 / ViT-S preentrenados (timm) | 25 M / 22 M aprox. | Imagen a caracteristicas | No aplica | No disponible de forma aislada | No disponible en la informacion | Hugging Face |

No se dispone en la informacion proporcionada de otros modelos de codificacion MEG directamente comparables con sus cifras de rendimiento.

## Limitaciones y advertencias

- Las predicciones estan calibradas para el preprocesado de THINGS-MEG (filtro 0,1-40 Hz, epocas de -0,1 a 1,3 s, z-score por epoca y sensor, remuestreo a 100 Hz). Otros preprocesados degradan la validez de la salida.
- Los sensores de salida corresponden a gradiometros axiales CTF; en otros sistemas MEG no hay correspondencia directa y es necesario ajustar un readout propio sobre `model.features(images)`.
- La prediccion por defecto es el promedio de cuatro participantes; para un participante nuevo la correlacion baja a 0,246-0,262, muy inferior al readout propio.
- Riesgo de sobreajuste al conjunto THINGS-MEG: el test usa imagenes nuevas de conceptos ya vistos, no conceptos nuevos.
- No es un modelo generativo ni conversacional; no debe usarse para tareas de texto, codigo o agentes.
- `trust_remote_code=True` ejecuta codigo Python del repositorio en la maquina del usuario; es imprescindible revisarlo y fijar la revision.
- La licencia Apache 2.0 permite uso comercial, pero la utilidad practica del modelo fuera de investigacion neurocientifica es muy limitada.
- No se documentan sesgos especificos ni tasas de alucinacion (no aplica), pero la prediccion puede fallar sistematicamente en categorias visuales poco representadas en THINGS-MEG.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/epfl-neuroai/encoder-things-meg
- Benchmark THINGS-MEG: https://multimodal-brain-scaling.epfl.ch
- Paper de referencia (arXiv 2411.05712): https://arxiv.org/abs/2411.05712
- Paper de referencia (arXiv 2511.21631): https://arxiv.org/abs/2511.21631
- Modelo base Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo base DINOv2-B (timm): https://huggingface.co/timm/vit_base_patch14_dinov2.lvd142m
- Modelo base ViT-S (timm): https://huggingface.co/timm/vit_small_patch16_224.augreg_in21k_ft_in1k
