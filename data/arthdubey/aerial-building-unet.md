# arthdubey/aerial-building-unet

## Resumen

aerial-building-unet es un modelo de segmentación semántica binaria que delimita edificios en imágenes aéreas capturadas a aproximadamente 1 m/pixel. Lo publica el usuario arthdubey en Hugging Face como un repositorio de pesos (0,1 GB) y se apoya en la librería segmentation-models-pytorch: es una U-Net con encoder ResNet34 preentrenado en ImageNet, con salida de un único canal (logits a los que se aplica una sigmoide). No es un modelo de lenguaje ni un modelo multimodal: no procesa texto.

El modelo se entrena sobre el Massachusetts Buildings dataset (137 imágenes de entrenamiento, 4 de validación y 10 de test, todas de 1500x1500 píxeles) con una pérdida combinada BCE + Dice, AdamW, 40 épocas de 400 recortes aleatorios de 512x512 y una sola semilla. En evaluación sobre las imágenes completas de test con inferencia por teselas alcanza IoU 0,695 y Dice 0,820; una variante con Focal + Dice queda prácticamente empatada (0,690 / 0,817).

Su relevancia es acotada y muy específica: sirve como punto de partida reproducible para tareas de extracción de huellas de edificios en ortofotografía de resolución métrica, con un coste computacional bajo (el repositorio completo ocupa 0,1 GB). El propio autor advierte de que solo cubre una región geográfica, no hay evaluación cruzada entre ciudades y no hay detección de cambios, por lo que sus métricas no deben extrapolarse sin una validación previa en el dominio de destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet34 (segmentation-models-pytorch), red convolucional encoder-decoder con conexiones skip |
| Parametros totales | no disponible. El autor no publica el recuento; en la implementacion estandar de segmentation-models-pytorch un U-Net con encoder ResNet34 ronda los 24,4 M de parametros, cifra no confirmada en la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision). Entrada de entrenamiento: recortes de 512x512 píxeles; inferencia sobre imagenes completas de 1500x1500 mediante teselado |
| Tipos de cuantizacion | no disponible (no se documenta ninguna) |
| Idiomas soportados | no aplica (modelo de segmentacion de imagen, sin entrada de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`best.pth`); requiere reconstruir la arquitectura antes de cargar |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clasica sobre un encoder ResNet34 preentrenado en ImageNet. El autor indica que el checkpoint contiene unicamente los pesos (`best.pth`, state dict) y que el modelo debe reconstruirse con `smp.Unet("resnet34", encoder_weights=None, in_channels=3, classes=1)`, aplicando despues una sigmoide a los logits. La entrada es RGB de tres canales y la salida es un mapa de un canal con la probabilidad de edificio por píxel; el decoder recupera la resolucion espacial mediante las conexiones skip del encoder.

Los datos de entrenamiento proceden del Massachusetts Buildings dataset: 137 imagenes de entrenamiento, 4 de validacion y 10 de test, todas de 1500x1500 píxeles y a aproximadamente 1 m/pixel. El entrenamiento usa perdida BCE + Dice, optimizador AdamW, 40 epocas con 400 recortes aleatorios de 512x512 por epoca y una unica semilla. No se menciona ningun paso de RLHF, DPO ni ajuste por preferencias, algo que no aplica a un modelo discriminativo de segmentacion. La comparacion con una variante de perdida Focal + Dice (IoU 0,690 / Dice 0,817 frente a 0,695 / 0,820) sugiere que la eleccion de la funcion de perdida no resulta determinante en este experimento.

## Capacidades

- Segmentacion semantica binaria de edificios (clase unica) en imagenes aereas RGB.
- Entrada de 3 canales a resolucion de aproximadamente 1 m/pixel; salida de 1 canal en forma de logits, convertibles a mascara binaria con una sigmoide y un umbral.
- Inferencia por teselado para imagenes mayores que los recortes de entrenamiento (validado sobre imagenes completas de 1500x1500).
- Integracion sencilla en pipelines de vision por computador en PyTorch mediante segmentation-models-pytorch.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No incluye modo de razonamiento, vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Extraccion de huellas de edificios en ortofotografia aerea: el modelo genera una mascara binaria por píxel que puede vectorizarse para alimentar un SIG, siempre que la imagen este a ~1 m/pixel y sea de una zona similar a la de entrenamiento.
- Actualizacion de cartografia de edificado a partir de vuelos fotogrametricos: permite preetiquetar edificios y reducir el trabajo manual de digitalizacion, con revision humana posterior.
- Control de cambios urbanisticos en series historicas: al ser un modelo de imagen unica, cada vuelo se infiere por separado y la comparacion de mascaras entre fechas se hace fuera del modelo (no hay deteccion de cambios integrada).
- Estimacion de superficie construida y densidad de edificacion: la mascara permite calcular area construida por hectarea en analisis urbanisticos o de impermeabilizacion del suelo.
- Analisis de exposicion a riesgos (inundacion, incendio, deslizamiento): la capa de edificios se cruza con capas de peligro para identificar edificaciones expuestas.
- Prototipado e investigacion academica en segmentacion remota: al ser un checkpoint pequeno (repositorio de 0,1 GB) y reproducible, sirve como linea base para comparar arquitecturas o funciones de perdida en el mismo split.
- Preentrenamiento o inicializacion para dominios cercanos: los pesos pueden servir de punto de partida para ajuste fino en otras ciudades o sensores, aunque el autor advierte de que no hay evaluacion cruzada entre ciudades.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la model card, medidos por el autor sobre las 10 imagenes de test del Massachusetts Buildings dataset con inferencia por teselas sobre la imagen completa.

| Metrica | Configuracion | Conjunto de evaluacion | Valor |
|---|---|---|---|
| IoU | BCE + Dice (modelo publicado) | Test, 10 imagenes de 1500x1500, inferencia por teselas | 0,695 |
| Dice | BCE + Dice (modelo publicado) | Test, 10 imagenes de 1500x1500, inferencia por teselas | 0,820 |
| IoU | Focal + Dice (variante) | Test, mismas condiciones | 0,690 |
| Dice | Focal + Dice (variante) | Test, mismas condiciones | 0,817 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo; no hay resultados de Cityscapes, SpaceNet u otros conjuntos de segmentacion remota).

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP32 el checkpoint ronda los 0,1 GB, por lo que las activaciones dominan el consumo. Para recortes de 512x512 el uso estimado es de 1-2 GB; para imagenes de 1500x1500 con teselado, el pico depende del tamano de tesela y del batch. Estas cifras son estimaciones basadas en el tamano del repositorio y en la arquitectura, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia (por ejemplo GTX 1650, RTX 3050, T4). Para entrenamiento o inferencia por lotes conviene una GPU con 8-16 GB (RTX 3070/4080, RTX 4090, A100, H100), aunque el modelo es pequeno y no aprovechara la capacidad de una A100 o H100 de forma significativa.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo de los ultimos anos puede ejecutar la inferencia, e incluso es viable en CPU para volumenes moderados.
- Opciones de despliegue: PyTorch nativo con segmentation-models-pytorch, exportacion a TorchScript u ONNX Runtime para servir sin dependencia de la libreria original, y empaquetado en contenedores con TorchServe o FastAPI. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. El autor no publica tiempos de inferencia ni rendimiento por segundo.

## Comparativa con modelos similares

No se han publicado comparativas de este modelo con alternativas en la informacion disponible. El autor no incluye resultados de otros modelos sobre el mismo split, y las metricas IoU y Dice solo son comparables si se evaluan sobre exactamente las mismas 10 imagenes de test con el mismo protocolo de teselado.

| Alternativa candidata | Tipo de arquitectura | Resultados publicados en este split | Licencia |
|---|---|---|---|
| U-Net + ResNet50 | U-Net convolucional | no disponible | no disponible |
| DeepLabV3+ (ResNet50) | Convolucional con convoluciones dilatadas | no disponible | no disponible |
| SegFormer (B0-B2) | Transformer jerarquico | no disponible | no disponible |
| Mask2Former | Transformer con mascaras | no disponible | no disponible |

Estas alternativas se citan unicamente como lineas de trabajo habituales en segmentacion de edificacion aerea; no hay datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se limita a una unica region geografica (Massachusetts Buildings), por lo que el modelo puede degradarse en tipologias constructivas, densidades o materiales distintos a los vistos.
- No hay evaluacion cruzada entre ciudades ni validacion fuera de dominio, tal como advierte el propio autor.
- Resolucion restringida: esta entrenado a ~1 m/pixel. Imagenes de mayor o menor resolucion sin remuestreo pueden producir mascaras incorrectas.
- Riesgo de alucinacion (falsos positivos): la salida es probabilistica por píxel y puede marcar estructuras que no son edificios (por ejemplo, superficies con textura similar), o perder edificios pequenos o con oclusion.
- El checkpoint contiene solo el state dict (`best.pth`). Cargarlo requiere reconstruir exactamente la arquitectura con `smp.Unet("resnet34", encoder_weights=None, in_channels=3, classes=1)`; no se incluye el objeto de modelo serializado ni un config.
- Entrenamiento con una sola semilla y solo 4 imagenes de validacion: no hay estimacion de varianza ni de robustez estadistica de las metricas.
- No hay deteccion de cambios ni procesamiento de series temporales; cada imagen se trata de forma independiente.
- Licencia no disponible: al no declararse una licencia, no se puede asumir permiso para uso comercial. Es necesario contactar con el autor antes de cualquier despliegue en produccion.
- El modelo no ha sido evaluado con criterios de equidad, robustez adversarial ni calibracion de probabilidades.
- Dataset de test muy reducido (10 imagenes), por lo que las metricas publicadas tienen un intervalo de confianza amplio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arthdubey/aerial-building-unet
- Repositorio de codigo, entrenamiento y analisis de fallos: https://github.com/ArthDubey1011/aerial-building-segmentation
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su arquitectura o su conjunto de datos; los unicos resultados obtenidos eran contenido no relacionado.
