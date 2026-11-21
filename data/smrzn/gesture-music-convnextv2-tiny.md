# smrzn/gesture-music-convnextv2-tiny

## Resumen

`gesture-music-convnextv2-tiny` es un clasificador de imágenes especializado en reconocimiento de gestos de la mano, desarrollado por el usuario `smrzn` como proyecto final del curso DPS970 (AI for Software Developers) en Seneca Polytechnic. Se trata de un fine-tuning completo de `facebook/convnextv2-tiny-1k-224`, una red neuronal convolucional ConvNeXt V2 de 27,9 millones de parámetros, que clasifica una imagen recortada de una mano en una de 18 clases de gestos (call, dislike, fist, four, like, mute, ok, one, palm, peace, peace_inverted, rock, stop, stop_inverted, three, three2, two_up, two_up_inverted).

El modelo resuelve un problema concreto: dado un recorte cuadrado y ajustado de una sola mano, identificar qué gesto está realizando el usuario. Forma parte de una aplicación webcam que traduce gestos de la mano en acordes de piano, donde MediaPipe Hand Landmarker localiza y recorta la mano, este modelo nombra el gesto y el gesto selecciona el acorde. Es relevante como ejemplo compacto y funcional de clasificación de gestos sobre el dataset HaGRID, con métricas publicadas sobre un split de test reservado.

No es un modelo de lenguaje ni un sistema multimodal generativo: es un clasificador de imágenes puro (pipeline `image-classification`) que no procesa texto ni mantiene conversaciones. Su utilidad está acotada al reconocimiento de gestos estáticos en imágenes preprocesadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura, sin atención) |
| Parámetros totales | 27.880.338 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (repo en safetensors fp32/fp16; el autor no documenta cuantizaciones GGUF/ONNX) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Tamaño del repo | 0,1 GB |
| Resolución de entrada | 224 px (recorte previo a 256 x 256) |
| Número de clases | 18 gestos de la mano |
| Modelo base | facebook/convnextv2-tiny-1k-224 |

## Arquitectura y entrenamiento

El modelo parte de ConvNeXt V2-tiny, una arquitectura convolucional moderna que incorpora bloques de convolución depthwise con normalización LayerNorm, activación GELU y un diseño inspirado en Vision Transformers, pero sin mecanismos de atención. Sobre esta base se realizó un fine-tuning de todas las capas con normalización de ImageNet, entrada a 224 px, precisión mixta (fp16), tasa de aprendizaje 5e-5 con warm-up y decaimiento coseno, batch de 32 y hasta 10 épocas con early stopping (paciencia 3). La selección del mejor checkpoint se hizo por macro F1 en validación, resultando la época 3 la óptima; el entrenamiento se detuvo tras la época 6 por sobreajuste.

Los datos provienen de `cj-mills/hagrid-sample-30k-384p`, una muestra a 384p del dataset HaGRID con 31.833 fotos. Cada foto se recortó a la mano con MediaPipe Hand Landmarker, que detectó mano en el 90,0 % de los casos (28.663 fotos); el resto se descartó. El split fue estratificado 70/15/15 con semilla 42: 20.066 de entrenamiento, 4.324 de validación y 4.273 de test (solo fotos con mano detectada). La aumentación incluyó recorte/zoom aleatorio, rotación de hasta 10 grados y variación de color, y deliberadamente **sin volteo horizontal**, ya que un `peace_inverted` espejado se confundiría con `peace`. No se documenta el uso de RLHF ni DPO (no aplica a clasificación).

## Capacidades

- Clasificación de imágenes de manos recortadas en 18 gestos estáticos predefinidos.
- Salida de probabilidades por clase (compatible con `pipeline("image-classification")` y `top_k`).
- Funciona sobre recortes cuadrados ajustados de una sola mano, generados preferiblemente con MediaPipe Hand Landmarker (21 puntos, margen del 25 %, redimensionado a 256 x 256).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación de texto.
- No incluye clase "sin gesto" ni "mano no detectada"; la ausencia de mano debe gestionarse en la aplicación externa.

## Casos de uso

- **Control de aplicaciones musicales por gestos**: integrado en una webcam con MediaPipe para recortar la mano, el modelo identifica el gesto y la aplicación lo mapea a un acorde de piano. Es el caso original del autor y el más directo.
- **Interfaces de accesibilidad sin contacto**: sustitución de botones físicos por gestos predefinidos en entornos donde el usuario no puede usar teclado o ratón, siempre que se disponga de un pipeline de detección y recorte de mano previo.
- **Prototipos de interacción hombre-máquina**: validación rápida de ideas de UX basadas en gestos en ferias, demos o pruebas de concepto, gracias a su tamaño reducido (0,1 GB) y a su velocidad (7,8 ms por imagen en Tesla T4).
- **Clasificación por lotes de imágenes de manos**: procesamiento offline de datasets o archivos de fotos para etiquetar gestos, útil en investigación sobre HaGRID o en la construcción de datasets derivados.
- **Módulo educativo de visión por computador**: ejemplo didáctico de fine-tuning de ConvNeXt V2 con métricas y curvas publicadas, adecuado para cursos de deep learning.
- **Filtro de gestos en aplicaciones de videollamada**: detección de gestos como `stop`, `mute` o `palm` para disparar acciones en la interfaz, con la salvedad de que la precisión en webcam real será inferior a la del test.
- **Sistema de señalización en robótica o domótica**: activación de comandos discretos (por ejemplo, `fist` para parar, `ok` para confirmar) en un entorno controlado con iluminación estable.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test reservado (4.273 recortes de mano), según el model-index de la model card:

| Métrica | Valor |
|---|---|
| Accuracy | 0,9040 |
| Macro precision | 0,9114 |
| Macro recall | 0,9038 |
| Macro F1 | 0,9056 |
| Velocidad, 1 imagen, Tesla T4 GPU | 7,8 ms |
| Velocidad, 1 imagen, Kaggle CPU | 124 ms |

En validación: accuracy 0,9082 y macro F1 0,9099. El autor indica que un hermano mayor, `smrzn/gesture-music-vit-base`, obtuvo 0,9067 de macro F1 (estadísticamente empatado) con el triple de tamaño, por lo que se eligió este modelo. Las confusiones más frecuentes son `like`, `dislike`, `three` y `two_up` leídos como `one`, y `three` confundido con `four`. En una comprobación de 180 fotos de test, ignorar las predicciones con confianza inferior al 50 % conservó el 87 % de las predicciones, de las cuales el 98 % eran correctas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (27,9 M de parámetros, unos 112 MB de pesos) y en torno a 0,5 GB con overhead de activaciones; en fp16, aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el autor reporta 7,8 ms por imagen en una Tesla T4. Funciona igualmente en A100, H100, RTX 4090, RTX 3060 y GPUs integradas.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3080, RTX 3060, GTX 1650 e incluso en CPU (124 ms por imagen en Kaggle CPU).
- Opciones de despliegue: `transformers` con `pipeline("image-classification")`, exportación a ONNX o TorchScript (no documentada por el autor), y servicio mediante TGI o contenedores propios. No se documenta soporte de llama.cpp ni Ollama (no aplica a visión).
- Latencia y throughput: 7,8 ms/imagen en T4 y 124 ms/imagen en CPU según el autor; el throughput agregado no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smrzn/gesture-music-convnextv2-tiny | 27,9 M | Imagen 224 px | 0,9056 | CC BY-SA 4.0 | Hugging Face |
| smrzn/gesture-music-vit-base | no disponible (ViT-base, aproximadamente 86 M) | Imagen 224 px | 0,9067 | no disponible | Hugging Face |
| MediaPipe Hand Landmarker (detección de landmarks, no clasificación de gestos) | no disponible | Imagen | no aplica | Apache 2.0 (Google) | SDK MediaPipe |
| HaGRID baseline (referencia del dataset) | no disponible | Imagen | no disponible en esta ficha | CC BY-SA 4.0 (datos) | github.com/hukenovs/hagrid |

El modelo ViT-base del mismo autor es el comparable más directo: mismo dataset, mismo pipeline y métricas casi idénticas, pero con el triple de parámetros. La elección de ConvNeXt V2-tiny responde a eficiencia, no a superioridad en precisión.

## Limitaciones y advertencias

- Entrenado con fotos de un único dataset (HaGRID); una webcam de portátil (iluminación, fondo, calidad de cámara, distancia) difiere del dominio de entrenamiento, por lo que la precisión en vivo será inferior al 0,904 del test.
- Las métricas asumen que MediaPipe ha detectado la mano (aproximadamente el 90 % de las fotos); no son precisión end-to-end.
- La precisión puede variar con la iluminación, el fondo y el tono de piel; el autor no ha medido esta variación, por lo que existe riesgo de sesgo no cuantificado.
- Solo reconoce 18 gestos; no hay clase "sin gesto", por lo que la ausencia de mano debe gestionarse fuera del modelo.
- Requiere un recorte cuadrado y ajustado de la mano con margen del 25 %; sobre fotos de cuerpo completo o fondo amplio la precisión cae mucho.
- Riesgo de confusión entre gestos similares (`three`/`four`, `one`/`two_up`, `like`/`dislike`), mitigable filtrando por umbral de confianza.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar la compatibilidad con el producto.
- Es un prototipo de clase, no un sistema de producción; el autor lo declara explícitamente.
- No hay datos publicados sobre robustez frente a oclusiones, manos parcialmente fuera de encuadre o guantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smrzn/gesture-music-convnextv2-tiny
- Modelo base: https://huggingface.co/facebook/convnextv2-tiny-1k-224
- Modelo hermano ViT-base: https://huggingface.co/smrzn/gesture-music-vit-base
- Dataset de entrenamiento: https://huggingface.co/datasets/cj-mills/hagrid-sample-30k-384p
- Paper HaGRID (arXiv:2206.08219): https://arxiv.org/abs/2206.08219
- Repositorio HaGRID: https://github.com/hukenovs/hagrid
- MediaPipe Hand Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker
- Inspiración (Gesture Synth): https://github.com/ericwei97-cloud/gesture-synth
