# deshanc/unet-mobilenet-portrait-segmentation

## Resumen

El modelo `deshanc/unet-mobilenet-portrait-segmentation` es una red de segmentación de retratos humanos que combina un codificador MobileNet (V1 o V3, según la versión) con un decodificador UNet. Lo desarrolla el usuario deshanc como parte de un trabajo académico (repositorio `ann_cw` en GitHub) y está pensado para ejecutarse en dispositivos móviles, con exportaciones a CoreML (iOS) y TFLite (Android/edge), además de los pesos originales en PyTorch.

El problema que resuelve es el *portrait matting* o segmentación de personas: separar la silueta de una persona del fondo en tiempo real en un teléfono. La elección de MobileNet como *backbone* responde a la restricción de cómputo y memoria de los dispositivos móviles, mientras que el decodificador UNet recupera resolución espacial en la máscara de salida. Se publican cinco versiones (v1.0 a v1.4) con distintos *backbones* y presupuestos de entrenamiento.

Es relevante como referencia práctica de un *pipeline* completo de segmentación ligera: incluye pesos en tres formatos (PyTorch, CoreML, TFLite) y distintas variantes de compromiso entre precisión y tamaño. No es un modelo de lenguaje ni un modelo fundacional: es un modelo de visión por computador especializado, con licencia MIT y un repositorio de 4,5 GB que agrupa todas las versiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet con encoder MobileNetV1 o MobileNetV3 (según versión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch, CoreML y TFLite; el autor no detalla cuantización explícita) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), CoreML (`.mlpackage`), TFLite (`.tflite`) |

## Arquitectura y entrenamiento

La arquitectura es una UNet cuyo codificador se sustituye por una MobileNet preentrenada. La variante v1.0 y v1.1 usa MobileNetV1; la v1.2 y v1.4 usan MobileNetV3 con *transfer learning*; la v1.3 usa MobileNetV1 con *width multiplier* 0,5 para reducir aún más el coste computacional. El decodificador UNet reconstruye la máscara de segmentación a partir de los mapas de características multiescala del codificador mediante conexiones de salto.

El entrenamiento se realizó sobre un dataset de *Human Matting*. Los presupuestos varían notablemente entre versiones: v1.0 se entrenó solo 1 época, v1.1 y v1.3 durante 15 épocas, y v1.4 con una partición explícita de entrenamiento/validación/prueba (80 % / 15 % / 5 %). No se documenta el número de imágenes, la resolución de entrada, la función de pérdida ni si hubo aumento de datos. Tampoco se detalla si se aplicó *fine-tuning* completo o congelación de capas del *backbone*.

## Capacidades

- Segmentación semántica binaria de personas (primer plano frente a fondo) en imágenes.
- Generación de máscaras de recorte (*matting*) para retratos, aptas para composición sobre fondos nuevos.
- Inferencia en dispositivo: exportaciones CoreML para iOS y TFLite para Android y edge.
- Ejecución en tiempo real en hardware móvil gracias al *backbone* MobileNet.
- Variantes con distinto compromiso precisión/tamaño (MobileNetV1, MobileNetV1 ×0,5, MobileNetV3).
- No soporta *tool calling*, agentes, razonamiento multietapa ni procesamiento de texto.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Videollamadas con desenfoque o sustitución de fondo: el modelo genera la máscara de la persona por fotograma y permite aplicar un efecto de *background blur* o reemplazo en apps de videoconferencia móvil, con latencia compatible con tiempo real gracias a MobileNet.
- Edición fotográfica en apps móviles: recorte automático del sujeto para cambiar el fondo o aplicar filtros solo al retrato, usando el `.mlpackage` de CoreML en iOS o el `.tflite` en Android.
- *Streaming* y creación de contenido: separación de la persona del fondo en directo para superponer capas gráficas o chroma key virtual sin croma física.
- Preprocesado en *pipelines* de visión: generar máscaras de persona como paso previo a reconocimiento de pose, *re-identification* o análisis de multitudes, filtrando el fondo.
- Filtros de realidad aumentada: integrar la máscara en motores AR móviles (ARKit, ARCore) para anclar objetos virtuales entre el sujeto y el fondo.
- Prototipado académico y docencia: al ser un modelo pequeño con licencia MIT y pesos en tres formatos, sirve como base para experimentos de segmentación ligera y comparación de *backbones*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* no incluye métricas como IoU, Dice, precisión, recall ni comparaciones cuantitativas entre versiones; solo describe la arquitectura y el número de épocas de cada variante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo MobileNet-UNet, el coste es muy bajo; cabe holgadamente en GPUs de consumo e incluso en CPU móvil, pero el autor no publica cifras.
- GPU recomendadas: no disponible. Para entrenamiento o inferencia en servidor, cualquier GPU moderna (RTX 3060 o superior, A100, H100) es más que suficiente; para despliegue real el objetivo es el propio dispositivo móvil (NPU/GPU integrada).
- Cabe en GPU de consumo: sí, con enorme margen, dado el tamaño reducido típico de MobileNet; no se especifica el número exacto de parámetros.
- Opciones de despliegue: CoreML en iOS (`.mlpackage`), TFLite en Android/edge (`.tflite`), PyTorch (`.pt`) para inferencia en servidor o *fine-tuning*.
- Latencia y throughput estimados: no disponible. No se publican mediciones de FPS ni de latencia por fotograma.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto/entrada | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| deshanc/unet-mobilenet-portrait-segmentation | UNet + MobileNetV1/V3 | Imagen (resolución no especificada) | MIT | PyTorch, CoreML, TFLite | Hugging Face |
| MediaPipe Selfie Segmentation (Google) | Modelo ligero propietario de Google | Imagen/vídeo | Apache 2.0 (código) / términos propios | TFLite, Task API | MediaPipe |
| MODNet | Red de matting en tiempo real | Imagen/vídeo | Apache 2.0 | PyTorch | GitHub |
| BackgroundMattingV2 | Red de matting de alta resolución | Imagen/vídeo | MIT | PyTorch | GitHub |

No se dispone de datos cuantitativos de este modelo para comparar rendimiento (IoU, FPS) con las alternativas; la comparación se limita a arquitectura, licencia y formatos.

## Limitaciones y advertencias

- No hay métricas publicadas: no es posible evaluar la calidad de la segmentación (IoU, Dice) ni compararla con alternativas sin ejecutar el modelo.
- El entrenamiento es escaso en varias versiones (v1.0 con 1 época), lo que sugiere posible infraajuste en esas variantes.
- El dataset de *Human Matting* no se describe: se desconoce su composición demográfica, iluminación y diversidad de fondos, lo que puede introducir sesgos en la segmentación de ciertos tonos de piel, ropa o condiciones de luz.
- Riesgo de máscaras imprecisas en bordes finos (pelo, ropa translúcida) por la baja resolución del *backbone* MobileNet y la falta de un módulo de *matting* dedicado.
- Solo se declara inglés como idioma, aunque el modelo no procesa texto; la etiqueta es meramente informativa.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los *backbones* MobileNet subyacentes (habitualmente Apache 2.0 en TensorFlow/Keras) y del dataset de entrenamiento, que no se especifica.
- Repositorio de 4,5 GB: incluye múltiples versiones y formatos, lo que complica la descarga selectiva; conviene usar `hf_hub_download` con el fichero concreto.
- No hay demo, *pipeline* declarado ni *widget* en Hugging Face, lo que limita la validación rápida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deshanc/unet-mobilenet-portrait-segmentation
- Repositorio GitHub del autor: https://github.com/deshancha/ann_cw
- Pesos PyTorch v1.3: https://huggingface.co/deshanc/unet-mobilenet-portrait-segmentation/resolve/main/v1.3/unet_mobilenetv1_best.pt
- CoreML v1.3: https://huggingface.co/deshanc/unet-mobilenet-portrait-segmentation/resolve/main/v1.3/UNet_mobilenetv1.mlpackage.zip
