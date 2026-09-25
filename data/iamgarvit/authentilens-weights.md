# iamgarvit/authentilens-weights

## Resumen

AuthentiLens weights es el conjunto de pesos del proyecto AuthentiLens, desarrollado por el usuario iamgarvit, orientado a la forensia de imagenes: detecta fotografias retocadas mediante inpainting por difusion y localiza la region editada a nivel de pixel. No es un modelo de lenguaje, sino un sistema de vision por computador compuesto por dos redes que trabajan en cascada: un clasificador EfficientNet-B0 que emite un veredicto FAKE/REAL sobre la imagen completa y un segmentador (DeepLabV3+ o UNet, ambos con encoder ResNet-50) que predice, pixel a pixel, la probabilidad de que esa zona haya sido inpintada.

El problema que aborda es concreto: los clasificadores de imagen a nivel global fallan ante ediciones parciales, porque la mayor parte de la foto sigue siendo autentica. La innovacion del pipeline es una regla de anulacion (override): si el clasificador dice REAL pero el segmentador marca mas del 30 % de los pixeles como manipulados, la salida se fuerza a FAKE. Esta regla eleva la tasa de verdaderos positivos de un 71,43 % (solo clasificador) hasta un 96,70 % en el conjunto de prueba SD2-FR de 1.029 imagenes.

El modelo es relevante ahora porque la deteccion de imagenes generadas o editadas por difusion es un caso de uso creciente en verificacion de medios, moderacion de contenido y periodismo. El repositorio (1,0 GB) es pequeno en comparacion con otros modelos de vision, los pesos publicados son exclusivamente state_dicts (sin estado del optimizador) y la licencia es MIT, lo que facilita su integracion. Conviene senalar que el propio autor advierte que las cifras publicadas son tasas de verdaderos positivos sin una tasa de falsos positivos correspondiente, y que el dominio de entrenamiento es estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos en cascada: clasificador CNN EfficientNet-B0 + segmentador semantico DeepLabV3+ o UNet con encoder ResNet-50 |
| Parametros totales | no disponible (la model card no publica el recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entradas de 224x224 para el clasificador y 512x512 para el segmentador) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en precision de entrenamiento, formato .pth) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; el campo de idiomas no esta definido) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pth (state_dict "weights-only" en classification/ y segmentation/; checkpoints completos en original/) |

Tamano de cada archivo de pesos:

| Archivo | Modelo | Tamano | Proposito |
|---|---|---:|---|
| `classification/efficientnet_b0_balanced_lr2.5e-5/best_model.pth` | EfficientNet-B0 | 16 MB | Clasificador FAKE/REAL por imagen (por defecto) |
| `segmentation/deeplabv3plus/best_model.pth` | DeepLabV3+ (ResNet-50) | 107 MB | Mascara de inpainting por pixel (por defecto) |
| `segmentation/unet/best_model.pth` | UNet (ResNet-50) | 130 MB | Segmentador alternativo |
| `original/deeplabv3plus_original.pth` | DeepLabV3+ | 321 MB | Checkpoint completo de entrenamiento |
| `original/unet_original.pth` | UNet | 391 MB | Checkpoint completo de entrenamiento |

## Arquitectura y entrenamiento

El sistema consta de dos etapas independientes. En la primera, la imagen se redimensiona a 224x224 con interpolacion bilineal de PIL, se normaliza con las estadisticas de ImageNet y EfficientNet-B0 predice FAKE (clase 0) o REAL (clase 1). En la segunda, la imagen se redimensiona a 512x512 y DeepLabV3+ genera una probabilidad sigmoide por pixel; un pixel se considera marcado cuando P(inpainted) > 0,7. La regla de anulacion final convierte a FAKE la salida cuando el clasificador dijo REAL pero mas del 30 % de los pixeles estan marcados.

Los dos segmentadores comparten configuracion de entrenamiento: encoder ResNet-50 inicializado con pesos de ImageNet, entradas de 512x512, batch de 32, learning rate 1e-4, weight decay 5e-3 y dropout de 0,3 en el decoder. Se entrenaron sobre los conjuntos SD2-FR + SDXL-FR, y los checkpoints publicados corresponden a la epoca 8, con mejor IoU de validacion de 0,7264 para DeepLabV3+ y 0,7249 para UNet. El clasificador se ajusto desde ImageNet sobre un conjunto balanceado de parches de 224x224 construido a partir de SD2-FR: por cada imagen inpintada se genera un recorte FAKE centrado en la mascara y un recorte REAL de la misma foto sin solapamiento con la mascara. Los splits son 11.134 de entrenamiento, 1.596 de validacion y 1.632 de prueba, con learning rate 2,5e-5.

La motivacion del conjunto balanceado es metodologica: el autor documenta que un benchmark compuesto solo por imagenes falsas oculta el sesgo del clasificador. Un ResNet-50 entrenado con CIFAKE obtiene un 100 % en el conjunto de prueba SD2-FR (todas falsas) pero solo un 1,72 % de precision sobre imagenes reales del conjunto balanceado, es decir, etiqueta casi todo como FAKE. Los pesos publicados en `classification/` y `segmentation/` son state_dicts sin `optimizer_state_dict`, `epoch`, `val_iou` ni `config`, y producen salidas identicas a bit respecto a los checkpoints de `original/`.

## Capacidades

- Clasificacion binaria de imagen completa: veredicto FAKE/REAL sobre fotografias, con foco en retoque por difusion.
- Segmentacion por pixel: probabilidad de inpainting pixel a pixel y localizacion de la region editada.
- Deteccion de ediciones parciales: la regla de anulacion (>30 % de pixeles marcados) esta disenada para capturar manipulaciones locales que un clasificador global no detecta.
- Deteccion de imagenes generadas por inpainting de Stable Diffusion 2 y SDXL (unico dominio de entrenamiento declarado).
- Uso como componente de pipeline de forensia de imagen, no como modelo conversacional.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente, vision general ni audio.
- No hay capacidades multilingues declaradas: es un modelo puramente visual.

## Casos de uso

- Verificacion de imagenes en redaccion periodistica: el sistema marca y localiza la region manipulada, de modo que un editor puede revisar visualmente la mascara antes de publicar. Es adecuado porque combina el veredicto global con una localizacion concreta.
- Moderacion de contenido en plataformas: integrado como filtro previo que escala a revision humana las imagenes con ediciones sospechosas, reduciendo la carga de moderacion sobre contenidos de inpainting por difusion.
- Verificacion de identidad y prueba documental: deteccion de retoques sutiles en fotografias aportadas como evidencia, siempre como senal de alerta y nunca como decision automatica (el propio autor lo desaconseja para decisiones consecuentes).
- Investigacion en forensia de imagen: el repositorio publica pesos, checksums y resultados en JSON, lo que permite reproducir y comparar contra el pipeline de referencia.
- Deteccion de deepfakes en redes sociales: identificacion de imagenes con regiones generadas por difusion para etiquetado o despriorizacion en el feed.
- Auditoria de conjuntos de datos: uso del segmentador para localizar inpainting en corpus de imagenes y limpiar datasets de entrenamiento contaminados con ediciones.
- Formacion y demostracion: el Space en el navegador permite probar el pipeline sin infraestructura, util para talleres de verificacion digital.

## Benchmarks y rendimiento

Pipeline combinado (tasa de verdaderos positivos sobre el conjunto de prueba SD2-FR de 1.029 imagenes, umbral de pixel 0,7):

| Clasificador + segmentador | Solo clasificador | Override > 30 % | Override > 50 % | Override > 70 % |
|---|---:|---:|---:|---:|
| EfficientNet-B0 + DeepLabV3+ | 71,43 % | 96,70 % | 76,77 % | 71,43 % |
| EfficientNet-B0 + UNet | 71,43 % | 91,74 % | 77,45 % | 72,40 % |
| ResNet-50 + DeepLabV3+ | 58,99 % | 94,85 % | 67,15 % | 59,18 % |
| ResNet-50 + UNet | 58,99 % | 86,59 % | 67,54 % | 59,67 % |

Clasificador en solitario:

| Conjunto de prueba | Metrica | EfficientNet-B0 (lr 2,5e-5) |
|---|---|---:|
| SD2-FR test (1.029, todas falsas) | Precision | 71,43 % |
| Parches balanceados (1.632) | Precision global | 61,27 % |
| Parches balanceados | Precision FAKE | 50,86 % |
| Parches balanceados | Precision REAL | 71,69 % |

Segmentadores en solitario (imagenes SD2-FR con mascaras de referencia, umbral 0,7):

| Segmentador | mIoU | Precision por pixel | Imagenes |
|---|---:|---:|---:|
| DeepLabV3+ | 16,76 % | 61,76 % | 1.029 |
| UNet | 17,28 % | 63,30 % | 1.029 |

El autor senala que la baja mIoU es coherente con la alta TPR combinada: la regla de anulacion solo necesita que el area marcada supere el 30 %, un requisito mucho mas debil que reproducir la forma exacta de la mascara. Como referencia, el voto mayoritario humano obtuvo un 44,22 % en las imagenes SD2-FR (solo falsas) y un 60,17 % en los parches balanceados.

## Requisitos de hardware

- VRAM estimada para inferencia: reducida. El clasificador (16 MB) y el segmentador (107-130 MB) suman unos 150 MB de pesos; con el grafo de EfficientNet-B0 a 224x224 y DeepLabV3+ a 512x512 el consumo deberia mantenerse en el rango de 1-3 GB, aunque la model card no publica cifras de VRAM (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria. Las tarjetas de consumo (RTX 3060, RTX 4060, RTX 4090) son mas que suficientes; incluso es viable en CPU para inferencia puntual.
- Cabe en GPU de consumo: si, con amplio margen, dado el tamano de los pesos.
- Opciones de despliegue: al estar en PyTorch puro con `segmentation_models_pytorch`, se puede servir con TorchServe, ONNX Runtime o FastAPI; no hay soporte nativo de vLLM, llama.cpp ni Ollama porque no es un modelo de lenguaje. El repositorio incluye un Space de Hugging Face para prueba interactiva.
- Latencia y throughput: no disponibles (la model card no publica mediciones de latencia ni de imagenes por segundo).

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks de modelos alternativos comparables en la informacion disponible. El unico contraste cuantitativo documentado en la model card es interno al propio proyecto:

| Sistema | Precision en conjunto balanceado | Precision en SD2-FR (solo falsas) |
|---|---:|---:|
| EfficientNet-B0 de AuthentiLens (clasificador) | 61,27 % global / 71,69 % REAL / 50,86 % FAKE | 71,43 % |
| ResNet-50 entrenado con CIFAKE | 1,72 % en imagenes reales | 100 % |

Este contraste ilustra el sesgo de los clasificadores entrenados solo con ejemplos falsos, pero no constituye una comparativa con modelos de deteccion de inpainting ampliamente reconocidos, ya que no se aportan datos al respecto.

## Limitaciones y advertencias

- La tasa de falsos positivos no esta medida: el pipeline se evaluo unicamente sobre un conjunto de prueba compuesto solo por imagenes falsas. El 96,70 % es una tasa de verdaderos positivos sin tasa de falsos positivos asociada; un segmentador que marque areas grandes en fotos reales inflaria esa cifra. No debe interpretarse como precision.
- Dominio estrecho: entrenado exclusivamente con inpainting de Stable Diffusion 2 y SDXL sobre imagenes fotorealistas. No esta entrenado para imagenes GAN, imagenes totalmente sinteticas, ilustracion artistica ni otras herramientas de inpainting.
- Tarea intrinsecamente dificil: el clasificador en solitario esta cerca del azar en el conjunto balanceado (61,27 %), y el voto mayoritario humano puntuo 44,22 % en las imagenes SD2-FR y 60,17 % en los parches balanceados.
- No apto para decisiones consecuentes: el autor advierte explicitamente de que no debe usarse para determinar si una imagen es genuina en contextos de alto impacto (judiciales, de identidad o de moderacion con consecuencias graves).
- Riesgo de alucinacion en el sentido de falsos positivos: la regla de anulacion puede reclasificar como FAKE imagenes reales con regiones de alta textura o baja calidad que el segmentador marque de forma erronea.
- Licencia MIT: permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de copyright y la licencia.
- Al publicarse solo pesos sin `config` ni historial de entrenamiento en los archivos `weights-only`, la reproducibilidad completa del entrenamiento depende de los checkpoints de `original/` y de la documentacion del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamgarvit/authentilens-weights
- Demo (Space): https://huggingface.co/spaces/iamgarvit/authentilens
- Repositorio del proyecto: https://github.com/iamgarvit/AuthentiLens
- Resultados (JSON): https://github.com/iamgarvit/AuthentiLens/tree/main/results
- Perfil del autor en Hugging Face: https://huggingface.co/iamgarvit
- Referencia arXiv indicada en las etiquetas del repositorio: arXiv:2407.11566
