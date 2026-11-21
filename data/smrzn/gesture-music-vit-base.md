# smrzn/gesture-music-vit-base

## Resumen

`smrzn/gesture-music-vit-base` es un clasificador de imágenes especializado en reconocimiento de gestos de la mano, desarrollado por el usuario smrzn como proyecto final del curso DPS970 (AI for Software Developers) en Seneca Polytechnic. Se trata de un fine-tuning completo de `google/vit-base-patch16-224`, un Vision Transformer de 85,8 millones de parámetros, que clasifica una imagen recortada de una mano en una de 18 clases de gestos (puño, palma, victoria, pulgar arriba, entre otras).

El modelo resuelve un problema acotado pero concreto: dada una imagen cuadrada y ajustada de una sola mano, identificar el gesto que se está realizando. Forma parte de una aplicación webcam que traduce gestos manuales en acordes de piano, donde MediaPipe Hand Landmarker localiza y recorta la mano, este modelo nombra el gesto y la aplicación asigna el acorde correspondiente. No es un modelo de propósito general ni un sistema listo para producción: el propio autor lo describe como un prototipo de clase.

Su relevancia radica en ser un ejemplo reproducible y bien documentado de fine-tuning de un ViT para una tarea de clasificación muy específica, con métricas verificables, particiones de datos publicadas y una limitación explícita y bien delimitada (requiere recortes ajustados de la mano, no fotogramas completos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base, patch 16, resolución 224) |
| Parametros totales | 85.812.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; pesos en safetensors fp32/fp16) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar: `google/vit-base-patch16-224`, que divide la imagen de 224x224 en parches de 16x16 píxeles, los proyecta a embeddings y los procesa con una pila de bloques transformer con atención global. El fine-tuning se realizó sobre todas las capas del modelo base, con normalización ImageNet, resolución de 224 px y precisión mixta (fp16).

Los datos de entrenamiento proceden de `cj-mills/hagrid-sample-30k-384p`, una muestra a 384p de HaGRID con 31.833 fotos. Cada foto se recortó a la mano con MediaPipe Hand Landmarker, que detectó una mano en el 90,0 % de los casos (28.663 fotos); el resto se descartó. La partición fue estratificada 70/15/15 con semilla 42: 20.066 de entrenamiento, 4.324 de validación y 4.273 de test. El entrenamiento usó learning rate 3e-5 con warm-up y decaimiento coseno, batch 16 con acumulación de gradiente 2, hasta 10 épocas con early stopping (paciencia 3; se completaron las 10). Como aumento de datos se aplicaron recorte/zoom aleatorio, rotación de hasta 10 grados y color jitter, pero deliberadamente **sin volteo horizontal**, ya que un `peace_inverted` reflejado se confundiría con `peace`. La selección del mejor modelo se hizo por macro F1 de validación, correspondiendo a la última época. No se documenta uso de RLHF ni DPO (no aplica a clasificación de imágenes).

## Capacidades

- Clasificación de imágenes de manos recortadas en 18 clases de gestos: `call`, `dislike`, `fist`, `four`, `like`, `mute`, `ok`, `one`, `palm`, `peace`, `peace_inverted`, `rock`, `stop`, `stop_inverted`, `three`, `three2`, `two_up`, `two_up_inverted`.
- Salida de probabilidades por clase mediante `pipeline("image-classification")` de transformers, con `top_k` configurable.
- Integración con MediaPipe Hand Landmarker para el pipeline completo (detección, recorte con 25 % de margen, redimensionado a 256 y luego 224).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de audio o vídeo de forma nativa (procesa imágenes individuales).
- No dispone de clase "sin gesto": la aplicación trata "no se encontró mano" como silencio.

## Casos de uso

- **Control de aplicaciones musicales por gestos**: en la aplicación de referencia, el modelo identifica el gesto y este selecciona un acorde de piano; es adecuado porque la latencia en GPU T4 es de 15,1 ms por imagen, permitiendo respuesta casi en tiempo real.
- **Prototipado de interfaces sin contacto**: para demos de interacción humano-máquina en entornos donde no se desea tocar pantallas (kioscos, presentaciones), usando MediaPipe para el recorte y este modelo para la clasificación del gesto.
- **Educación y docencia en visión por computador**: sirve como ejemplo reproducible de fine-tuning de un ViT con particiones publicadas y métricas detalladas, útil en cursos de deep learning.
- **Investigación en reconocimiento de gestos**: como línea base (baseline) de 90,66 % de accuracy sobre el split de test de HaGRID sample, para comparar con arquitecturas más ligeras o más pesadas.
- **Sistemas de accesibilidad**: para personas con movilidad reducida que necesiten emitir comandos discretos mediante gestos de la mano, siempre que se controle la iluminación y el encuadre.
- **Automatización de etiquetado de datasets de gestos**: para pre-anotar recortes de manos en pipelines de curación de datos, filtrando después por confianza y revisión humana.
- **Integración en aplicaciones de escritorio o web con transformers.js**: al ser un ViT-base de 0,3 GB en safetensors, puede desplegarse en entornos con recursos moderados para clasificación de imágenes aisladas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el split de test retenido de 4.273 recortes de mano:

| Métrica | Valor |
|---|---|
| Accuracy | 0,9066 |
| Macro precision | 0,9083 |
| Macro recall | 0,9063 |
| Macro F1 | 0,9067 |
| Velocidad, 1 imagen, GPU Tesla T4 | 15,1 ms |
| Velocidad, 1 imagen, CPU Kaggle | 206 ms |

En validación: accuracy 0,9130 y macro F1 0,9132. El autor señala que su hermano menor `smrzn/gesture-music-convnextv2-tiny` obtuvo 0,9056 de macro F1 (estadísticamente empatado) con un tercio del tamaño y aproximadamente el doble de velocidad, por lo que la aplicación final usa ese modelo. Confusiones frecuentes: `peace_inverted` leído como `two_up`, y `palm` como `stop`.

## Requisitos de hardware

- **VRAM estimada para inferencia**: un ViT-base de 85,8 M de parámetros ocupa aproximadamente 0,34 GB en fp32 y 0,17 GB en fp16; con overhead de activaciones, menos de 1 GB de VRAM para inferencia por imagen.
- **GPU recomendadas**: cualquier GPU moderna sirve; el autor reporta 15,1 ms por imagen en una Tesla T4. Una RTX 4090, A100 o H100 ofrecerían latencias aún menores, aunque el cuello de botella en producción será la detección de MediaPipe, no el clasificador.
- **Consumer GPU**: cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, etc.), e incluso en CPU con 206 ms por imagen.
- **Opciones de despliegue**: `transformers` (pipeline de image-classification), exportación a ONNX, `transformers.js` para navegador, TorchServe o un servidor FastAPI propio. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI (no aplican a clasificación de imágenes).
- **Latencia y throughput**: 15,1 ms/imagen en T4 y 206 ms/imagen en CPU Kaggle según el autor; el throughput agregado no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Macro F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smrzn/gesture-music-vit-base` | 85,8 M | 18 gestos de mano | 0,9067 | CC BY-SA 4.0 | Hugging Face |
| `smrzn/gesture-music-convnextv2-tiny` | no disponible (aprox. un tercio del ViT-base según el autor) | 18 gestos de mano | 0,9056 | no disponible en la información | Hugging Face |
| `google/vit-base-patch16-224` (base) | 85,8 M | Clasificación ImageNet (1000 clases) | no aplica | Apache-2.0 | Hugging Face |

No se dispone en la información proporcionada de otros clasificadores de gestos comparables con métricas sobre el mismo split.

## Limitaciones y advertencias

- **Requiere recortes ajustados de la mano**: fue entrenado con recortes cuadrados de una sola mano con 25 % de margen; sobre fotogramas completos la accuracy cae notablemente.
- **Las métricas asumen que MediaPipe encontró la mano** (aproximadamente el 90 % de las fotos); no son accuracy de extremo a extremo.
- **Brecha entre test y webcam**: el modelo se entrenó con fotos de un único dataset; la iluminación, el fondo, la calidad de cámara y la distancia de una webcam real difieren, por lo que la precisión en vivo será menor que la reportada.
- **Posible variación por tono de piel y condiciones de iluminación**: el autor indica que no se ha medido esta variación.
- **Sin clase "sin gesto"**: cualquier recorte se asigna a una de las 18 clases; la aplicación trata "no se encontró mano" como silencio, pero el modelo no rechaza entradas inválidas.
- **Confusiones documentadas**: `peace_inverted` con `two_up` y `palm` con `stop`.
- **Licencia CC BY-SA 4.0**: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; hay que revisar implicaciones si se integra en productos propietarios.
- **Prototipo, no sistema de producción**: el propio autor lo califica como prototipo de clase; no hay garantías de mantenimiento ni soporte.
- **Sin verificación de benchmarks**: las métricas del model-index están marcadas como `verified: false`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smrzn/gesture-music-vit-base
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Modelo hermano ConvNeXt V2-tiny: https://huggingface.co/smrzn/gesture-music-convnextv2-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/cj-mills/hagrid-sample-30k-384p
- Paper HaGRID (arXiv:2206.08219): https://arxiv.org/abs/2206.08219
- Repositorio HaGRID: https://github.com/hukenovs/hagrid
- MediaPipe Hand Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker
- Inspiración (Gesture Synth): https://github.com/ericwei97-cloud/gesture-synth
