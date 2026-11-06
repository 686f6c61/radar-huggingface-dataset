# Aevanis/Aevanis-Vision-Nano

## Resumen

Aevanis Vision Nano (también denominado "Universal Visual Eye") es un backbone de visión artificial desarrollado por Aevanis AI Lab, presentado como un modelo fundacional híbrido de tipo vision transformer con 7,68 millones de parámetros, diseñado específicamente para inferencia de altísima frecuencia en hardware de borde (Jetson, Raspberry Pi, microcontroladores ARM) y en pipelines de servidor de alto rendimiento. El modelo se publica en Hugging Face bajo licencia Apache-2.0 y con el pipeline declarado de extracción de características de imagen.

El modelo resuelve el problema de disponer de un extractor de representaciones visuales densas que quepa y corra en tiempo real en dispositivos con recursos muy limitados, manteniendo una calidad geométrica suficiente para tareas de robótica, navegación autónoma y percepción en tiempo real. Su propuesta diferencial es un "stem" geométrico subpíxel inspirado en ConvNeXt con downsampling 4x, que preserva gradientes de borde de alta frecuencia antes de la tokenización, y una representación espacial monocular que produce 196 tokens densos en una rejilla de 14x14.

Es relevante ahora porque cubre el nicho de los backbones visuales ultraligeros para edge AI, un segmento donde los modelos fundacionales de visión habituales (ViT, DINOv2, CLIP) resultan demasiado pesados para despliegues embebidos con requisitos de latencia estrictos. El autor declara tasas de 750-900 FPS en GPU de servidor, 180-240 FPS en Jetson Orin Nano y 15-25 FPS en Raspberry Pi 5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer híbrido con stem convolucional subpíxel inspirado en ConvNeXt (downsampling 4x) |
| Parametros totales | 7,68 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen 224x224, salida de 196 tokens espaciales) |
| Tipos de cuantizacion | no disponible (el autor solo menciona fp16 en el benchmark de Tesla T4) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | pytorch_model.bin (PyTorch); no se declaran safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un vision transformer híbrido de escala "nano" con 7,68 M de parámetros. Incorpora un stem convolucional subpíxel de inspiración ConvNeXt que aplica un downsampling 4x sobre la imagen de entrada, preservando gradientes de borde de alta frecuencia antes de la tokenización por el transformer. La salida es un conjunto de 196 tokens espaciales densos organizados en una rejilla de 14x14, con dimensión de 256 por token (forma `[1, 196, 256]` según el ejemplo de la model card), pensados para alimentar cabeceras posteriores de robótica o de interacción con interfaces gráficas.

El preentrenamiento se realizó sobre el dataset propietario "Aevanis Continuous Egocentric & High-FPS Dynamics Dataset", compuesto por 166.440 fotogramas de vídeo continuos y temporalmente coherentes, distribuidos en 67 secuencias de alto movimiento (48,2 GB de metraje temporal en bruto). El autor indica que no se empleó scraping de imágenes estáticas y que el 100% del preentrenamiento fue sobre flujos temporales continuos. Se usó un enmascaramiento de parches del 75% junto con una pérdida de gradiente de frontera Sobel normalizada, orientada a forzar la internalización de geometría 3D y continuidad de superficies en lugar de memorizar colores estáticos. No se detalla el número total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (no aplicables a un backbone visual).

## Capacidades

- Extracción de características visuales densas: genera 196 tokens espaciales (rejilla 14x14) a partir de imágenes de 224x224.
- Representación espacial monocular: el autor declara capacidad de reconstrucción de profundidad pseudo-LiDAR y de ocupación sin sensores láser.
- Percepción en tiempo real de alta frecuencia: orientado a control reactivo en robótica y navegación.
- Procesamiento de secuencias egocéntricas y de movimiento continuo, gracias al preentrenamiento sobre vídeo temporal.
- Procesamiento de flujos de interacción con interfaces gráficas de escritorio (GUI), según la composición declarada del dataset.
- Inferencia en hardware de borde: Jetson, Raspberry Pi y CPU de escritorio.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, capacidades de agente ni multimodalidad texto-imagen. Es exclusivamente un backbone visual.

## Casos de uso

- Robótica ágil y cuadrúpedos: el modelo proporciona tokens espaciales a 240 FPS en Jetson Orin Nano, lo que permite cerrar bucles de control reactivo con latencias de 4,2 ms por frame, adecuado para drones y robots con requisitos de respuesta en tiempo real.
- Navegación autónoma de bajo coste: en Raspberry Pi 5 entrega 25 FPS, suficiente para un rover autónomo que necesite estimación de profundidad monocular y ocupación sin LiDAR.
- Reconstrucción de profundidad pseudo-LiDAR: los 196 tokens espaciales pueden alimentar una cabecera de profundidad para sustituir sensores láser en plataformas donde el coste o el peso lo impiden.
- Percepción en enjambre o simulación multiagente: con 900+ FPS en RTX 4090 y 750 FPS en Tesla T4, permite ejecutar muchos agentes simulados o muchos flujos de cámara en un solo servidor.
- Interacción con interfaces gráficas: el preentrenamiento incluye flujos de interacción con GUI de escritorio, lo que habilita su uso como extractor para agentes que operan interfaces.
- Visión local en dispositivos de consumo: 45 FPS en CPU de escritorio i7 permiten despliegues sin GPU para aplicaciones de visión en tiempo real en local.
- Preentrenamiento de cabeceras específicas: al ser un backbone de extracción de características, sirve como base congelada o ajustable para tareas posteriores (detección, segmentación, estimación de pose) en entornos con presupuesto computacional muy ajustado.

## Benchmarks y rendimiento

El autor publica únicamente benchmarks de latencia y throughput por hardware, no de calidad en tareas estándar (MMLU, HumanEval, GSM8K no aplican; tampoco se reportan métricas como ImageNet top-1, COCO mAP o similar).

| Hardware | Batch | Latencia (ms) | FPS / Hz | Despliegue indicado |
|---|---|---|---|---|
| NVIDIA RTX 4090 | 1 | 1,1 | 900+ | Simulación multiagente en servidor |
| Tesla T4 (fp16) | 1 | 1,3 | 750 | Hub de percepción en nube |
| Jetson Orin Nano | 1 | 4,2 | 240 | Drones / cuadrúpedos ágiles |
| CPU de escritorio (i7) | 1 | 22,0 | 45 | Visión local en tiempo real |
| Raspberry Pi 5 | 1 | 40,0 | 25 | Rover autónomo de bajo coste |

No se han publicado resultados de benchmarks de calidad (precisión en tareas de visión) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 7,68 M de parámetros en fp16, el peso de los parámetros ronda los 15 MB, por lo que la huella de memoria es mínima y dominada por activaciones y batch.
- GPU recomendadas: RTX 4090 (900+ FPS), Tesla T4 en fp16 (750 FPS), Jetson Orin Nano (240 FPS).
- Cabe en GPU de consumo: sí, con enorme margen; cualquier GPU consumer moderna puede ejecutarlo. También corre en CPU de escritorio (45 FPS en i7) y en Raspberry Pi 5 (25 FPS).
- Opciones de despliegue: PyTorch nativo (librería declarada). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un backbone visual de este tipo.
- Latencia y throughput: 1,1 ms/frame en RTX 4090, 1,3 ms en T4, 4,2 ms en Jetson Orin Nano, 22 ms en CPU i7 y 40 ms en Raspberry Pi 5, todos con batch size 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Aevanis Vision Nano | 7,68 M | Imagen 224x224, 196 tokens | Apache-2.0 | Hugging Face (repo de 0,0 GB, sin descargas ni likes) |
| ViT-B/16 (referencia) | ~86 M | Imagen 224x224, 196 tokens | Apache-2.0 / varias | Amplia |
| DINOv2 ViT-S/14 (referencia) | ~22 M | Imagen 224x224 o mayor | Apache-2.0 | Amplia |
| MobileViT / EfficientViT (referencia edge) | ~2-6 M | Imagen variable | Apache-2.0 / MIT | Amplia |

No se dispone de datos de calidad comparables publicados por el autor para establecer una comparación de rendimiento frente a estos modelos; la comparación anterior es solo estructural (tamaño, licencia y disponibilidad). Los datos de parámetros de los modelos de referencia son aproximados y no provienen de la información proporcionada.

## Limitaciones y advertencias

- No se han publicado métricas de calidad (precisión en clasificación, detección, segmentación o profundidad), por lo que no es posible evaluar su rendimiento real frente a alternativas establecidas.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño declarado de 0,0 GB, lo que sugiere que los pesos podrían no estar efectivamente subidos o que el repo está vacío; conviene verificar antes de integrarlo.
- El autor no documenta sesgos del dataset; al ser un dataset propietario de 67 secuencias, la diversidad demográfica, geográfica y de condiciones de iluminación es desconocida.
- Riesgo de sobreajuste al dominio: el preentrenamiento se limita a vídeo egocéntrico continuo y flujos de GUI, lo que puede degradar el rendimiento en imágenes estáticas, escenas no egocéntricas o dominios visuales distintos.
- No dispone de capacidades lingüísticas ni multimodales texto-imagen; no es un modelo de instrucciones ni un agente.
- La licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento es propietario y no se detalla su procedencia, lo que puede plantear dudas de compliance en producción.
- No se documentan tipos de cuantización soportados ni formatos alternativos a `pytorch_model.bin` (sin safetensors ni GGUF), lo que limita el despliegue en runtimes optimizados.
- La carga del modelo en el ejemplo usa `from_pretrained("pytorch_model.bin", ...)` con una clase `AevanisVisionBackbone` que no se distribuye como paquete estándar de Hugging Face Transformers; requiere el código del autor.
- No hay información sobre estabilidad numérica en fp16 más allá del benchmark en T4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aevanis/Aevanis-Vision-Nano
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
