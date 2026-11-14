# maxwoe/image-rotation-angle-estimation

## Resumen

`maxwoe/image-rotation-angle-estimation` es un modelo de visión por computador especializado en estimar el ángulo de rotación de una fotografía respecto a la vertical, en el rango completo de 0° a 360°. Lo desarrolla el usuario maxwoe y se distribuye con licencia MIT. Resuelve un problema clásico de preprocesado de imágenes: detectar automáticamente cuánto hay que girar una foto para enderezarla, sin depender de metadatos EXIF ni de heurísticas de orientación.

Técnicamente es un ConvNeXt V2 Base (preentrenado en ImageNet-22k y afinado con FCMAE) al que se le sustituye la cabeza de clasificación por una cabeza de Distribución Gaussiana Circular (CGD) que emite una distribución de probabilidad sobre 360 bins de un grado. Esta formulación evita la discontinuidad en el límite 0°/360° que afecta a las regresiones angulares convencionales. El modelo se entrenó y evaluó sobre fotografías de COCO.

Su relevancia práctica está en el rendimiento reportado: un error absoluto medio de 3,77° sobre 1.030 fotos de test de COCO, con el 97,4% de las predicciones dentro de 10°. Además, el autor documenta un protocolo de entrenamiento libre de trazas JPEG y varias pruebas para descartar que el modelo explote la rejilla de bloques del códec en lugar del contenido visual, un sesgo frecuente en esta tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 Base con cabeza de Distribucion Gaussiana Circular (CGD) sobre 360 bins |
| Parametros totales | no disponible (repo de 2,3 GB, incluye pesos y codigo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 224x224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (carga via `from_pretrained` con codigo Python propio del repo; presumiblemente safetensors o binario PyTorch) |

## Arquitectura y entrenamiento

El backbone es ConvNeXt V2 Base, inicializado desde `timm/convnextv2_base.fcmae_ft_in22k_in1k`, es decir, un modelo convolucional preentrenado con el esquema FCMAE (Fully Convolutional Masked Autoencoder) sobre ImageNet-22k y afinado en ImageNet-1k. Sobre ese backbone se añade una cabeza CGD que produce una distribución de probabilidad circular sobre 360 bins de un grado; la predicción final es el ángulo más probable. Esta parametrización elimina el salto artificial entre 0° y 360° que sufren las regresiones directas del ángulo.

El entrenamiento se realizó con fotografías de COCO rotadas a ángulos aleatorios y recortadas al mayor rectángulo sin bordes. El autor aplica un protocolo "libre de trazas": cada imagen de entrenamiento se guarda como JPEG después de rotarla, de modo que el modelo no pueda aprender a leer la rejilla de bloques del códec como atajo. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de visión de este tipo).

## Capacidades

- Estimación del ángulo de rotación de una imagen en el rango completo [0°, 360°), medido en sentido antihorario.
- Salida de un ángulo único mediante `predict_angle`, que acepta una imagen PIL, un array de NumPy o una ruta de fichero.
- Distribución de probabilidad sobre 360 bins de un grado, sin discontinuidad en el límite 0°/360°.
- Funcionamiento sobre fotografías de escenas cotidianas (dominio COCO).
- Inferencia en CPU (unos 0,3 s por imagen) y en GPU mediante `model.to("cuda")`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola tarea.

## Casos de uso

- Enderezado automático de fotos en un pipeline de ingesta: el modelo predice el ángulo y se aplica `image.rotate(-angle, expand=True)` para corregir la orientación antes de almacenar o mostrar la imagen.
- Normalización previa a OCR o a modelos de visión: muchas tuberías de reconocimiento de texto asumen imágenes orientadas; este modelo permite corregir la rotación antes de pasarlas al siguiente estadio.
- Limpieza de datasets de imágenes: detectar y corregir fotos mal orientadas en un corpus recolectado de fuentes heterogéneas, donde los metadatos EXIF son poco fiables o han sido eliminados.
- Preprocesado en aplicaciones móviles o de escritorio: con 0,3 s por imagen en CPU, cabe en un servicio ligero o incluso en un flujo local sin GPU dedicada.
- Catalogación y gestión de activos digitales: clasificar y enderezar lotes de fotos en un DAM (Digital Asset Management) antes de generar miniaturas o derivados.
- Verificación de calidad en pipelines de captura: marcar automáticamente imágenes cuya orientación se desvía más de un umbral y que requieren revisión o recaptura.
- Herramienta interactiva de edición: integración en una demo o editor para sugerir el ángulo de corrección al usuario (existe una demo en Hugging Face Spaces).

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y la model card, sobre 1.030 fotos de test de COCO rotadas a ángulos aleatorios y recortadas al mayor rectángulo sin bordes:

| Metrica | Guardada como JPEG tras rotar | Nunca guardada tras rotar |
|---|---|---|
| Error absoluto medio | 3,77° | 4,45° |
| Error mediano | 1,12° | 1,33° |
| Dentro de 2° | 71,4% | 64,5% |
| Dentro de 5° | 93,7% | 89,7% |
| Dentro de 10° | 97,4% | 95,8% |
| Percentil 90 del error | 5,45° | 6,74° |
| Percentil 95 del error | 14,62° | 17,10° |
| RMSE | 9,76° | 11,19° |

Notas adicionales aportadas por el autor: el error es casi independiente de la calidad JPEG (3,87° a calidad 95, 3,75° a calidad 75); el checkpoint es una de tres ejecuciones de la misma configuración que alcanzan 3,70°, 3,77° y 3,81° (media 3,76°); y el mejor modelo anterior, OAD-360, alcanza 6,09° sobre las mismas imágenes.

## Requisitos de hardware

- Inferencia en CPU viable: aproximadamente 0,3 s por imagen según el autor.
- GPU opcional: basta con mover el modelo a CUDA (`model.to("cuda")`); por el tamaño del backbone ConvNeXt V2 Base, cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente.
- VRAM estimada: no disponible de forma explícita; un backbone Base en FP32 ocupa del orden de varios GB, pero el autor no publica la cifra exacta.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del backbone.
- Opciones de despliegue: el repo incluye código de inferencia propio (`model_cgd.py`) que se carga con `from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 0,3 s/imagen en CPU reportado por el autor; no se publican cifras de GPU.

## Comparativa con modelos similares

| Modelo | Enfoque | Error (MAE) en el mismo test | Licencia | Disponibilidad |
|---|---|---|---|---|
| maxwoe/image-rotation-angle-estimation | ConvNeXt V2 Base + cabeza CGD (360 bins) | 3,77° (JPEG tras rotar) | MIT | Hugging Face, GitHub, demo |
| OAD-360 | Modelo previo citado por el autor | 6,09° | no disponible | no disponible en la informacion |
| Otros estimadores de orientacion | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar de forma directa con OAD-360, que el autor cita como el modelo anterior mas fuerte.

## Limitaciones y advertencias

- Solo fotografias: entrenado y evaluado sobre COCO; no se han evaluado documentos, escaneos, capturas de pantalla, dibujos, imagenes aereas ni medicas.
- Imagenes ambiguas: primeros planos, texturas y escenas simetricas carecen de una "vertical" clara; mas de la mitad de los errores grandes son confusiones de 90° o 180° en ese tipo de imagenes.
- Recorte central: la imagen se redimensiona para que el lado corto mida 224 px y se usa el cuadrado central de 224x224; en imagenes muy alargadas el modelo no ve los extremos.
- Rotaciones nunca guardadas: las rotaciones aplicadas en memoria o en formato sin perdida quedan ligeramente fuera de la distribucion de entrenamiento, con error algo mayor (4,45° frente a 3,77°).
- Sin valor de confianza: `predict_angle` devuelve solo el angulo; las probabilidades del modelo no se han evaluado como medida de confianza.
- Riesgo de atajos por trazas JPEG: aunque el autor aplica un protocolo libre de trazas y pruebas de sonda sin contenido, una de las siete condiciones de la sonda supera por 0,1 punto el limite fijado (14,0% de predicciones dentro de 5° del angulo de rejilla frente a un azar del 11,1%), por lo que conviene validar en el dominio propio antes de produccion.
- Licencia MIT: permite uso comercial, pero no se documentan garantias ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxwoe/image-rotation-angle-estimation
- Demo interactiva: https://huggingface.co/spaces/maxwoe/image-rotation-angle-estimation
- Repositorio GitHub: https://github.com/maxwoe/image-rotation-angle-estimation
- Paper: https://arxiv.org/abs/2603.25351
- Modelo base: https://huggingface.co/timm/convnextv2_base.fcmae_ft_in22k_in1k
