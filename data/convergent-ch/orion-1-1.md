# Convergent-ch/Orion-1.1

## Resumen

Orion 1.1 es un modelo experimental de generación de vídeo por difusión desarrollado por AlpinaAI y publicado en Hugging Face bajo la cuenta Convergent-ch. Se trata de un modelo entrenado desde cero (inicialización aleatoria) con un total de 11.083.776 parámetros, una cifra muy reducida para el estándar actual de modelos de vídeo, lo que lo sitúa en la categoría de prototipo de investigación más que de herramienta de producción. Genera clips sintéticos de escenas estilizadas controladas mediante cinco atributos discretos: localización, sujeto, color, acción y cámara.

El modelo parte de una adaptación compacta de la arquitectura `Unet3D` del repositorio `video-diffusion-pytorch` de lucidrains, con embeddings entrenables para cada uno de los cinco controles. El entrenamiento se realizó durante 226.122 pasos (aproximadamente diez horas) en una única NVIDIA GeForce RTX 3060 Ti, usando clips sintéticos de vehículos, paisajes, movimientos y ajustes de cámara simples. Genera 16 fotogramas por plano a una resolución nativa de 160 × 96, que el código de exportación interpola, recorta a 16:9 y reescala hasta 1280 × 720 a 24 FPS.

Su relevancia es fundamentalmente didáctica y de investigación: demuestra que es posible entrenar un modelo de difusión de vídeo funcional desde cero en hardware de consumo con un presupuesto mínimo, a costa de una variabilidad y un detalle muy limitados. No está pensado para generación de vídeo realista ni para vocabulario abierto, sino para un conjunto cerrado de escenas y controles definidos en `scenes.py`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptación compacta de `Unet3D` (video-diffusion-pytorch) con embeddings de control entrenables |
| Parametros totales | 11.083.776 (11,08 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de difusión de vídeo) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en precisión original) |
| Idiomas soportados | en (inglés; los controles son etiquetas textuales en inglés) |
| Licencia | no disponible para el modelo; el código U-Net upstream es MIT (ver UPSTREAM-LICENSE) |
| Formato de pesos | safetensors (checkpoint PyTorch personalizado) |

## Arquitectura y entrenamiento

Orion 1.1 emplea una adaptación compacta de `Unet3D`, la implementación de difusión de vídeo 3D de lucidrains, sobre la que se añaden embeddings entrenables para cinco controles discretos: localización, sujeto, color, acción y cámara. La generación se condiciona mediante una cadena de etiquetas como `desert rover red right wide`, que selecciona un plano amplio de desierto con un rover rojo desplazándose hacia la derecha. Los valores admitidos para cada control están definidos en el fichero `scenes.py` del repositorio.

El entrenamiento partió de pesos inicializados aleatoriamente (trained-from-scratch) y se ejecutó durante 226.122 pasos, en torno a diez horas, sobre una única NVIDIA GeForce RTX 3060 Ti. El corpus consistió en clips sintéticos con vehículos, paisajes, movimientos y ajustes de cámara simples. No se documenta en la información disponible el número de tokens o fotogramas de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO (no procede en un modelo de difusión, pero no se indica ningún tipo de refinamiento posterior). Tampoco se detalla el scheduler de difusión, el número de pasos de muestreo ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo corto por difusión: 16 fotogramas por plano a resolución nativa de 160 × 96, exportables a 1280 × 720 a 24 FPS tras interpolación, recorte 16:9 y reescalado.
- Control condicionado por cinco atributos discretos: localización, sujeto, color, acción y cámara, combinables en una cadena de etiquetas.
- Generación de escenas sintéticas estilizadas: desierto, paisaje nevado, costa, terreno volcánico y escena al atardecer (según el vídeo de demostración).
- Soporte de múltiples planos: el pipeline de exportación permite renderizar cinco planos distintos en una sola secuencia de 15 segundos sin bucle.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: únicamente inglés en las etiquetas de control.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en difusión de vídeo de bajo presupuesto: sirve como referencia reproducible para estudiar el entrenamiento from-scratch de un modelo de vídeo en una GPU de consumo (RTX 3060 Ti) y comparar curvas de entrenamiento con arquitecturas mayores.
- Docencia y divulgación: permite ilustrar en un aula o tutorial el funcionamiento de un pipeline de difusión de vídeo condicionado por atributos, con un coste computacional asumible por estudiantes.
- Pruebas de concepto de control por etiquetas: útil para validar interfaces de condicionamiento discreto (localización, sujeto, color, acción, cámara) antes de escalar a modelos de mayor tamaño.
- Generación de storyboards sintéticos estilizados: los cinco planos de demostración (desierto, nieve, costa, volcán, atardecer) pueden servir como material de previsualización de bajo coste en fases tempranas de diseño.
- Benchmark de pipelines de exportación: el código de interpolación, recorte y reescalado a 720p puede reutilizarse para probar cadenas de postproceso con FFmpeg, Safetensors, Einops y rotary-embedding-torch en Windows con CUDA.
- Experimentación con vocabularios cerrados: adecuado para estudiar cómo se comporta un modelo de difusión cuando el espacio de condiciones está acotado y definido en `scenes.py`, sin necesidad de grandes datasets reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 11,08 M de parámetros y un checkpoint de 0,1 GB, el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM.
- GPU de entrenamiento documentada: NVIDIA GeForce RTX 3060 Ti (una sola unidad, ~10 horas para 226.122 pasos).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA habilitado; la RTX 3060 Ti es suficiente tanto para entrenamiento como para inferencia. No se documentan requisitos para A100 o H100.
- Cabe en GPU consumer: sí, en la RTX 3060 Ti y previsiblemente en modelos inferiores con suficiente VRAM para el pipeline de exportación.
- Opciones de despliegue: el autor solo documenta un flujo manual con PyTorch con CUDA, Safetensors, Einops, einops-exts, rotary-embedding-torch y FFmpeg en Windows; hay que colocar `model.safetensors` en `output/orion-1.1.safetensors` y ejecutar `python train.py --export`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. A continuación se recoge una comparación cualitativa limitada a los datos disponibles:

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Orion 1.1 | 11,08 M | 16 fotogramas a 160 × 96 (exportable a 720p) | no disponible (upstream U-Net MIT) | Hugging Face (Convergent-ch/Orion-1.1) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables de generación de vídeo por difusión con parámetros, contexto y licencia verificables.

## Limitaciones y advertencias

- Modelo experimental y de muy pequeño tamaño (11,08 M de parámetros): el propio autor advierte de detalle y variabilidad limitados en el movimiento y la forma de los objetos entre planos.
- Entrenado exclusivamente con clips sintéticos de vehículos, paisajes, movimientos y cámaras simples; no generaliza a escenas reales ni a vocabulario abierto.
- Vocabulario de control cerrado y definido en `scenes.py`; cualquier etiqueta fuera de ese conjunto no está soportada.
- Idioma limitado al inglés en las etiquetas de control.
- Resolución nativa muy baja (160 × 96) y solo 16 fotogramas por plano; la calidad a 720p depende de interpolación y reescalado posteriores, no de la generación del modelo.
- Licencia del modelo no disponible: no se puede confirmar el uso comercial. El código U-Net upstream es MIT según UPSTREAM-LICENSE, pero eso no cubre los pesos entrenados.
- Riesgo de alucinación visual y artefactos propios de un modelo de difusión pequeño con pocos datos; no apto para producción sin validación exhaustiva.
- Flujo de despliegue manual y probado solo en Windows con CUDA; no hay integración con servidores de inferencia estándar.
- Sin métricas de evaluación publicadas (FVD, CLIP score u otras), lo que impide cuantificar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Orion-1.1
- Checkpoint de pesos: https://huggingface.co/Convergent-ch/Orion-1.1/blob/main/model.safetensors
- Vídeo de demostración: https://huggingface.co/Convergent-ch/Orion-1.1/blob/main/Orion-1.1-demo.mp4
- Definición de escenas y controles: https://huggingface.co/Convergent-ch/Orion-1.1/blob/main/scenes.py
- Licencia upstream del código U-Net: https://huggingface.co/Convergent-ch/Orion-1.1/blob/main/UPSTREAM-LICENSE
- Repositorio base de la arquitectura: https://github.com/lucidrains/video-diffusion-pytorch
