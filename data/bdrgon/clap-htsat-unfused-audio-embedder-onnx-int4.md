# bdrgon/clap-htsat-unfused-audio-embedder-onnx-INT4

## Resumen

CLAP HTSAT Unfused INT4 es una versión cuantizada a 4 bits del modelo de embeddings de audio `laion/clap-htsat-unfused`, publicada por el usuario bdrgon. El modelo original de LAION mapea audio y texto a un espacio latente compartido, pero esta variante se centra exclusivamente en la rama de audio: recibe un espectrograma mel y devuelve un vector de 512 dimensiones normalizado. El objetivo es reducir el coste computacional y de almacenamiento para inferencia en producción mediante cuantización de bloques de 128 con `MatMulNBits` sobre ONNX Runtime.

La ficha técnica del autor describe dos artefactos: una cuantización INT4 directa (`audio_model_int4.onnx`) y una versión refinada mediante un procedimiento determinista denominado "receta J" (`audio_model_int4_trained_v1.onnx`), que aplica un ajuste fino con pérdida de distancias relativas por pares y coseno de salida. Según las métricas publicadas por el autor, la versión entrenada alcanza un 92,76 % de solapamiento top-10 con el profesor FP32 y un MAE de distancia cercana de 0,004062, frente al 81,24 % y 0,011450 de la cuantización directa.

El modelo es relevante para pipelines de búsqueda y clasificación de audio donde el espacio y la latencia importan, ya que el repositorio ocupa aproximadamente 0,1 GB. No obstante, se etiqueta explícitamente como experimental y sus resultados son de fidelidad al profesor, no de calidad perceptual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLAP HTSAT unfused (transformer de audio sobre espectrograma mel, sin rama de texto en este artefacto) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 10 segundos de audio (espectrograma `[1,1,1001,64]`) |
| Tipos de cuantización | INT4 con `MatMulNBits` (bloque 128, nivel de precisión 4) |
| Idiomas soportados | no disponible (modelo de audio, sin rama de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`audio_model_int4.onnx`, `audio_model_int4_trained_v1.onnx`) |

## Arquitectura y entrenamiento

El modelo base `laion/clap-htsat-unfused` combina un codificador de audio HTSAT con una torre de texto en un esquema contrastivo tipo CLAP. Esta variante conserva únicamente la arquitectura de audio y la receta de cuantización INT4 de bloques de 128 (`MatMulNBits`, accuracy level 4) sobre ONNX Runtime. La entrada es `input_features` float32 con forma `[1,1,1001,64]`, correspondiente a audio mono remuestreado a 48 kHz, primeros 10 segundos y `ClapProcessor` fijado con `padding="repeatpad"`. La salida es `embedding` float32 normalizado de forma `[1,512]`.

El artefacto `trained_v1` se obtiene mediante la "receta J": un ajuste fino que minimiza el error cuadrático ponderado de distancias por pares más una pérdida coseno puntual con peso 0,3. Los pesos son `min(100, (0.684377 / max(dt, 0.0199575))**2)` normalizados por su suma, donde `dt` es la distancia coseno del profesor. El entrenamiento parte de los pesos originales de LAION, con una época inicial a LR 1e-5, reinicio de Adam y tres épocas adicionales con coseno de 3e-6 a 3e-7, batch 32. Cada época usa 15.746 baterías de `yojul/one-shot-hip-hop-drums` más 20.000 notas rotativas de `jg583/NSynth`. La cuantización se simula durante el entrenamiento y el proceso es determinista: dos ejecuciones independientes de cuatro épocas produjeron bytes ONNX, tensores de checkpoint, estados del optimizador y resultados de evaluación idénticos.

## Capacidades

- Extracción de embeddings de audio de 512 dimensiones normalizados, adecuados para búsqueda por similitud y clustering.
- Procesamiento de fragmentos de 10 segundos a 48 kHz en mono.
- Representación de audio para tareas de recuperación, clasificación y detección de duplicados.
- Inferencia sobre ONNX Runtime con soporte de `com.microsoft::MatMulNBits`.
- No incluye rama de texto en este artefacto: no realiza búsqueda texto-audio ni zero-shot con etiquetas textuales.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Búsqueda de audio por similitud: indexar un catálogo musical con embeddings de 512 dimensiones y recuperar pistas acústicamente parecidas mediante distancia coseno, aprovechando el reducido tamaño del modelo (0,1 GB) para despliegues en CPU.
- Deduplicación de muestras y one-shots: comparar baterías o samples de un banco de sonidos para detectar duplicados o variantes cercanas, con un MAE de distancia cercana de 0,004062 frente al profesor FP32 según el autor.
- Clasificación de instrumentos y géneros: usar los embeddings como características de entrada para un clasificador ligero entrenado con pocos ejemplos, dado que el modelo preserva la geometría del espacio CLAP original.
- Detección de similitud en catálogos de efectos de sonido: agrupar y etiquetar librerías de SFX mediante clustering sobre los vectores normalizados.
- Filtrado y moderación de audio: comparar fragmentos contra un conjunto de referencia de contenido no deseado usando umbrales de distancia coseno calibrados sobre el profesor.
- Sistemas de recomendación musical: generar vectores de ítems para un motor de recomendación basado en vecinos, con inferencia por lotes sobre ONNX Runtime en infraestructura sin GPU.
- Preprocesamiento en pipelines de etiquetado automático: extraer características de audio para alimentar modelos posteriores de captioning o clasificación, reduciendo el coste frente a ejecutar el modelo FP32.

## Benchmarks y rendimiento

Métricas publicadas por el autor frente al profesor FP32, medidas sobre 1.966 muestras de batería y 2.048 muestras de NSynth:

| Artefacto | Método | Solapamiento top-10 con profesor | MAE de distancia cercana |
|---|---|---:|---:|
| `audio_model_int4.onnx` | Cuantización original | 81,24 % | 0,011450 |
| `audio_model_int4_trained_v1.onnx` | Receta J determinista | 92,76 % | 0,004062 |
| Referencia histórica A | Comparación | 92,80 % | 0,004089 |

El autor indica que exponentes puros por pares de 0–2 y KL de vecindad alcanzaron un solapamiento del 92,16–92,34 %, y que el anclaje ayudó más que una ponderación más fuerte de la distancia cercana. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; estos son resultados de fidelidad al profesor, no de calidad perceptual.

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma explícita; el artefacto INT4 de 0,1 GB cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquiera con soporte de ONNX Runtime; el autor usó una RTX 3080 Ti para el proceso de entrenamiento y cuantización.
- Cabe en GPU consumer: sí, dado el tamaño del repositorio (0,1 GB) y la cuantización INT4.
- Despliegue: ONNX Runtime con soporte de `com.microsoft::MatMulNBits`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Entrenamiento de la receta J: aproximadamente 6 GiB de VRAM, 25–35 GiB de RAM y espacio en disco para la descarga completa de NSynth y las cachés de características. Con cachés verificadas, cada ejecución tarda 33–35 minutos, incluidos unos 23 minutos de entrenamiento; una ejecución completa desde cero tardó unas 2 horas 43 minutos en HDD.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bdrgon/clap-htsat-unfused-audio-embedder-onnx-INT4 | Embeddings de audio INT4 | no disponible | 10 s de audio a 48 kHz | Apache 2.0 | ONNX en Hugging Face |
| laion/clap-htsat-unfused (FP32) | Embeddings audio-texto | no disponible | ventana de audio CLAP | Apache 2.0 | Hugging Face |
| bdrgon/clap-htsat-unfused-audio-embedder-onnx (FP32) | Embeddings de audio | no disponible | 10 s de audio a 48 kHz | Apache 2.0 | ONNX en Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas en la información disponible; no se dispone de datos de otros modelos de embeddings de audio comparables en esta ficha.

## Limitaciones y advertencias

- Modelo etiquetado como experimental por el autor; no se recomienda para producción sin validación propia.
- Los resultados publicados son de fidelidad al profesor FP32, no de calidad perceptual; el autor lo indica explícitamente.
- Un solo seed y validación reutilizada: los resultados pueden no generalizar a otros corpus de audio.
- La reproducibilidad byte a byte solo se verificó en el entorno de referencia (Python 3.13, CUDA 12.8, RTX 3080 Ti); otras plataformas o versiones fallarán la comprobación de hash J.
- Requiere una build de ONNX Runtime con soporte de `com.microsoft::MatMulNBits`; otras builds no cargarán el modelo.
- Entrada rígida: audio mono a 48 kHz, primeros 10 segundos, `padding="repeatpad"`; no procesa fragmentos más largos sin troceado previo.
- Sin rama de texto: no permite búsqueda texto-audio ni clasificación zero-shot con etiquetas.
- Riesgo de sesgo heredado del corpus de entrenamiento original de LAION y de los datasets de ajuste (batería hip-hop y NSynth), que no representan audio general.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datasets utilizados.
- No se distribuyen audio de los datasets ni vectores del profesor en el repositorio.

## Enlaces

- [Hugging Face: bdrgon/clap-htsat-unfused-audio-embedder-onnx-INT4](https://huggingface.co/bdrgon/clap-htsat-unfused-audio-embedder-onnx-INT4)
- [Modelo base: laion/clap-htsat-unfused](https://huggingface.co/laion/clap-htsat-unfused)
- [Modelo FP32 de referencia: bdrgon/clap-htsat-unfused-audio-embedder-onnx](https://huggingface.co/bdrgon/clap-htsat-unfused-audio-embedder-onnx)
- [Dataset: yojul/one-shot-hip-hop-drums](https://huggingface.co/datasets/yojul/one-shot-hip-hop-drums)
- [Dataset: jg583/NSynth](https://huggingface.co/datasets/jg583/NSynth)
