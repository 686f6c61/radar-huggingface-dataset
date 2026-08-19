# SimpleTuner/open-rvq-encoder-minimax-music3-155m-v2

## Resumen

El modelo `SimpleTuner/open-rvq-encoder-minimax-music3-155m-v2` es un encoder de audio desarrollado por la comunidad (autor: SimpleTuner) que aproxima la ruta audio-a-RVQ utilizada por el modelo MiniMax Music 3. No es un modelo oficial de MiniMax, sino un intento de reconstruir el camino de codificación que convierte una forma de onda de 44,1 kHz en 8 códigos RVQ por frame de 25 Hz (1 código semántico y 7 acústicos), a partir de los latentes de un encoder DAV / Flow-VAE congelado.

Con 154,7 millones de parámetros, este encoder se entrena desde cero mediante destilación inversa (reverse distillation), utilizando un dataset generado sintéticamente con latentes DAV y códigos RVQ alineados. La versión v2 aumenta el ancho del transformer a 1.088 canales (frente a los 512 de la v1) para superar los 150M de parámetros, manteniendo la misma profundidad, campo receptivo y esquema de salida. El modelo está pensado para ser un componente reemplazable en pipelines de generación musical que necesiten convertir audio en tokens discretos.

La relevancia actual radica en que MiniMax Music 3 no publica su encoder RVQ original, por lo que esta implementación abierta permite a desarrolladores e investigadores integrar la codificación de audio en sus propios sistemas sin depender de código propietario. El entrenamiento está en curso y los checkpoints se suben cada 500 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-norm con proyección convolucional de entrada y 8 cabezas de salida RVQ |
| Parametros totales | 154.736.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 frames de 25 Hz (aproximadamente 5,12 segundos de audio) |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en safetensors con precisión bfloat16) |
| Idiomas soportados | no disponible (modelo de audio, sin soporte de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (junto con configuración JSON y metadatos μP) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida: primero una proyección convolucional que convierte los 128 canales de latentes DAV en 1.088 canales con kernel de tamaño 7, seguida de una pila de 3 bloques convolucionales residuales con dilaciones 1, 3 y 9. Después se añaden posiciones aprendidas (128 posiciones) y un transformer de 8 capas pre-norm con ancho 1.088, 17 cabezas de atención (dimensión de cabeza 64) y FFN de 4.352 unidades. Finalmente, 8 cabezas de lectura independientes (`mup.MuReadout`) producen distribuciones sobre los vocabularios: una semántica de 16.384 tokens y siete acústicas de 4.096 tokens cada una.

El entrenamiento utiliza μTransfer (muP) con una familia de anchos (base 128, delta 256, v1 512, v2 1.088) para calibrar la inicialización y las tasas de aprendizaje. Se usa `mup.MuAdamW` como optimizador, con las cabezas de salida inicializadas a cero. La supervisión combina entropía cruzada dura sobre los 8 heads y una pérdida KL truncada con el profesor (teacher) renormalizada sobre los top-50 IDs válidos. El dataset de entrenamiento es `bghira/minimax-music3-rvq-reverse-distillation`, que contiene latentes DAV de audio generado, códigos RVQ alineados y logits del profesor. El entrenamiento se realizó en 4 GPU NVIDIA L40S con DDP, precisión mixta bfloat16, 20 épocas, 17.660 pasos de optimizador y un batch global de 64.

## Capacidades

- Conversión de audio (latentes DAV de 128 canales) a 8 distribuciones RVQ por frame de 25 Hz.
- Generación de 1 código semántico (vocabulario 16.384) y 7 códigos acústicos (vocabulario 4.096 cada uno).
- Soporte de contexto de hasta 5,12 segundos de audio por ventana.
- Entrenado mediante destilación inversa, lo que le permite imitar la salida de un encoder RVQ no disponible públicamente.
- Integrable como componente en pipelines de generación musical que requieran tokenización de audio.
- No soporta entrada de texto, visión ni tool calling; es un modelo puramente de audio.

## Casos de uso

- Generación de música condicionada por texto: el encoder convierte audio de referencia en tokens RVQ que luego pueden alimentar un modelo de lenguaje musical (como MiniMax Music 3 o similares) para generar nuevas composiciones coherentes con el estilo de la entrada.
- Edición y manipulación de audio: al tokenizar el audio en códigos discretos, es posible aplicar transformaciones a nivel de token (cambiar timbre, reordenar secciones, interpolación) y reconstruir el audio mediante un decodificador RVQ.
- Análisis musical y extracción de características: los códigos semánticos y acústicos pueden servir como representaciones intermedias para tareas de clasificación de género, detección de instrumentos o segmentación estructural.
- Reconstrucción de audio a partir de latentes DAV: el modelo actúa como puente entre el espacio latente de un Flow-VAE y el espacio de tokens RVQ, habilitando flujos de trabajo donde solo se dispone de latentes.
- Investigación en destilación de modelos de audio: su diseño abierto y su entrenamiento con destilación inversa lo convierten en un caso de estudio para reproducir componentes propietarios de sistemas de generación musical.
- Desarrollo de herramientas de transcripción musical: los códigos RVQ pueden asociarse a eventos musicales (notas, acordes, ritmo) para construir anotaciones automáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evaluación de reproducción (replay) y la integración de extremo a extremo con embeddings de condición están pendientes. No hay métricas objetivas como MMLU, HumanEval o GSM8K porque el modelo es de audio y no de texto.

## Requisitos de hardware

- El modelo tiene 154,7 millones de parámetros; en bfloat16 ocupa aproximadamente 310 MB de memoria, por lo que es viable en cualquier GPU con al menos 2 GB de VRAM (incluidas tarjetas consumer como GTX 1660, RTX 2060 o superiores).
- El entrenamiento se realizó en 4 GPU NVIDIA L40S (48 GB VRAM cada una), pero para inferencia no se requieren tantos recursos.
- No se han publicado datos de latencia ni throughput. Al ser un modelo relativamente pequeño, se espera una inferencia rápida en GPU modernas.
- Opciones de despliegue: al estar en formato safetensors y usar PyTorch, puede cargarse con la librería `transformers` (aunque no está empaquetado como pipeline estable) o mediante scripts personalizados. No hay soporte oficial para vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de lenguaje.
- Se recomienda usar bfloat16 para inferencia y, si se dispone de poco VRAM, se puede cuantizar a int8 o int4, aunque no se han publicado checkpoints cuantizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario RVQ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SimpleTuner/open-rvq-encoder-minimax-music3-41m-v1` | 41M | 5,12 s | 8 heads (1 semántico + 7 acústicos) | no disponible | HuggingFace |
| `SimpleTuner/open-rvq-encoder-minimax-music3-155m-v2` | 154,7M | 5,12 s | 8 heads (1 semántico + 7 acústicos) | no disponible | HuggingFace |
| MiniMax Music 3 (original) | no disponible | no disponible | no disponible | propietaria | no disponible |

La comparativa con el modelo original MiniMax Music 3 no es posible por falta de datos públicos. La diferencia principal con la v1 es el ancho del transformer (1.088 frente a 512), lo que aumenta la capacidad de representación. No hay otros encoders RVQ abiertos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con audio sintético generado por modelos; la generalización a audio real no está establecida.
- Contexto limitado a 5,12 segundos por ventana, sin memoria entre ventanas (no hay estado cruzado).
- La incertidumbre del profesor proviene de rollouts de un LM, no de un encoder condicionado por audio, lo que puede introducir sesgos.
- La precisión exacta de tokens no refleja necesariamente la equivalencia perceptual del audio reconstruido.
- La evaluación de extremo a extremo (con embeddings de condición y reproducción de audio) está pendiente.
- La carga del modelo no está empaquetada como una API de librería estable; requiere scripts personalizados.
- No se especifica licencia, por lo que el uso comercial puede ser incierto.
- El entrenamiento está en progreso; los checkpoints pueden contener estados intermedios no finales.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/SimpleTuner/open-rvq-encoder-minimax-music3-155m-v2](https://huggingface.co/SimpleTuner/open-rvq-encoder-minimax-music3-155m-v2)
- Dataset de entrenamiento: [https://huggingface.co/datasets/bghira/minimax-music3-rvq-reverse-distillation](https://huggingface.co/datasets/bghira/minimax-music3-rvq-reverse-distillation)
- Modelo v1 (41M): [https://huggingface.co/SimpleTuner/open-rvq-encoder-minimax-music3-41m-v1](https://huggingface.co/SimpleTuner/open-rvq-encoder-minimax-music3-41m-v1)
- Métricas en vivo (Weights & Biases): [https://wandb.ai/bghira/simpletuner-rvq-encoder/runs/ozlp8i9q](https://wandb.ai/bghira/simpletuner-rvq-encoder/runs/ozlp8i9q)
