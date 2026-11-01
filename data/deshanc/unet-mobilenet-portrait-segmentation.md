# deshanc/unet-mobilenet-portrait-segmentation

## Resumen

El modelo `deshanc/unet-mobilenet-portrait-segmentation` es una red de segmentación de personas (retrato) que combina un encoder MobileNet con un decoder UNet. Lo publica el usuario deshanc en Hugging Face y está pensado para su despliegue en dispositivos móviles, con exportaciones a CoreML (iOS) y TFLite (Android/edge), además de los pesos en PyTorch. No es un modelo de lenguaje: es un modelo de visión por computador especializado en generar máscaras de segmentación de personas para tareas de *portrait matting* y sustitución de fondos.

El repositorio incluye cuatro versiones del modelo (v1.0 a v1.3) que varían en la arquitectura del backbone (MobileNetV1 o MobileNetV3), el número de épocas de entrenamiento y el uso de *width multiplier* 0.5 para reducir el coste computacional. La versión más reciente (v1.3) emplea MobileNetV1 con factor de ancho 0.5 y 15 épocas de entrenamiento, y se distribuye en los tres formatos (PyTorch, CoreML y TFLite), lo que la convierte en la opción más ligera y portable del conjunto.

La relevancia del modelo radica en su enfoque puramente de borde: un tamaño de repositorio de 0,3 GB, licencia MIT y formatos listos para integrarse en apps móviles sin depender de infraestructura en la nube. No se dispone de información sobre el número total de parámetros, la longitud de contexto (no aplica) ni métricas de calidad publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder MobileNet (V1 o V3) + decoder UNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch, CoreML y TFLite; no se especifican variantes cuantizadas) |
| Idiomas soportados | en (etiqueta del repositorio) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), CoreML (.mlpackage), TFLite (.tflite) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón encoder-decoder: un backbone MobileNet actúa como extractor de características y un decoder tipo UNet reconstruye la máscara de segmentación a resolución completa mediante conexiones de salto. Se ofrecen dos variantes de backbone: MobileNetV1 (v1.0, v1.1 y v1.3) y MobileNetV3 (v1.2, entrenada mediante *transfer learning*). La versión v1.3 aplica un *width multiplier* de 0.5 sobre MobileNetV1, lo que reduce el número de canales y, por tanto, el coste de inferencia en dispositivos móviles.

En cuanto al entrenamiento, la model card indica que las versiones se entrenaron sobre el dataset "Human Matting" con un número variable de épocas: 1 época para v1.0, 15 épocas para v1.1 y v1.3, y *transfer learning* desde MobileNetV3 para v1.2. No se especifica el número de imágenes, la composición exacta del dataset, la resolución de entrada, la función de pérdida ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional. Tampoco se documenta el uso de RLHF/DPO (no aplicable en este dominio) ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación de personas en imágenes: genera una máscara binaria o de matting que separa la figura humana del fondo.
- *Portrait matting*: pensado para aplicaciones de recorte y sustitución de fondo en fotografía de retrato.
- Exportación multiplataforma: pesos listos para PyTorch, CoreML (iOS) y TFLite (Android y dispositivos edge).
- Inferencia en dispositivo: el tamaño reducido de los modelos (especialmente v1.3 con width multiplier 0.5) permite ejecución local sin conexión.
- No se documenta soporte de *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües (no aplica a un modelo de visión).
- No se documentan capacidades de visión general (detección, clasificación, OCR); el modelo está especializado exclusivamente en segmentación de personas.

## Casos de uso

- **Sustitución de fondo en apps de videollamada**: el modelo genera la máscara de la persona en tiempo real y permite componer un fondo virtual; la variante v1.3 (MobileNetV1 width 0.5) es la más adecuada por su menor coste computacional en dispositivos móviles.
- **Edición fotográfica en iOS**: integración del paquete CoreML en una app de retoque fotográfico para recortar retratos y aplicar fondos o efectos; el formato `.mlpackage` se carga directamente con Core ML.
- **Filtros y efectos en apps de cámara**: segmentación por fotograma para aplicar desenfoque de fondo (efecto bokeh) o máscaras creativas en tiempo real.
- **Procesamiento por lotes en servidor**: uso de los checkpoints PyTorch para generar máscaras de retrato en pipelines de preprocesado de imágenes (por ejemplo, para anonimización o generación de datasets).
- **Aplicaciones Android y edge con TFLite**: despliegue en dispositivos con recursos limitados usando la versión v1.2 o v1.3 en formato TFLite, sin necesidad de GPU dedicada.
- **Prototipado rápido de pipelines de visión**: al ser un modelo pequeño con licencia MIT, sirve como base para experimentos de segmentación binaria o como punto de partida para *fine-tuning* en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,3 GB) incluye todos los formatos y versiones, por lo que cada checkpoint individual es sustancialmente menor.
- GPU recomendadas: no se especifican; por el diseño MobileNet + UNet y las exportaciones CoreML/TFLite, el modelo está orientado a CPU y aceleradores móviles (Neural Engine en iOS, NNAPI/GPU delegada en Android).
- ¿Cabe en GPU consumer? Sí, con alta probabilidad, dado el reducido tamaño del modelo; no se dispone de cifras concretas de VRAM.
- Opciones de despliegue: PyTorch (inferencia estándar), Core ML (iOS/macOS), TensorFlow Lite (Android y edge). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formatos |
|---|---|---|---|---|---|
| deshanc/unet-mobilenet-portrait-segmentation | MobileNet + UNet | no disponible | no aplica | MIT | PyTorch, CoreML, TFLite |
| Modelos de segmentación de personas tipo MODNet / RVM | no disponible en la informacion proporcionada | no disponible | no aplica | no disponible | no disponible |
| Segment Anything (SAM) y variantes | ViT | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Entrenado sobre el dataset "Human Matting" con un número muy bajo de épocas (1 a 15), lo que puede limitar la robustez y generalización frente a condiciones de iluminación, pose o fondos no vistos.
- No se documentan métricas de calidad (IoU, matting error, etc.), por lo que no es posible evaluar su precisión frente a alternativas.
- Especializado exclusivamente en personas: no segmenta otras clases de objetos ni escenas generales.
- Posibles sesgos derivados de la composición del dataset de entrenamiento, que no se detalla; puede rendir peor en determinados grupos demográficos o tipos de cuerpo.
- Riesgo de artefactos en los bordes de la máscara (pelo, ropa fina) inherente a los modelos de matting ligeros.
- Aunque la licencia es MIT (permite uso comercial), conviene verificar la procedencia y licencia del dataset "Human Matting" utilizado para el entrenamiento.
- El repositorio tiene muy pocas descargas (90) y ningún *like*, y no se ha publicado documentación de validación en producción; se recomienda evaluar exhaustivamente antes de un despliegue real.
- No se especifican la resolución de entrada ni los requisitos exactos de preprocesado, lo que puede requerir inspeccionar el código del repositorio GitHub asociado.

## Enlaces

- Hugging Face: https://huggingface.co/deshanc/unet-mobilenet-portrait-segmentation
- Repositorio GitHub: https://github.com/deshancha/ann_cw
- Pesos v1.3 CoreML: https://huggingface.co/deshanc/unet-mobilenet-portrait-segmentation/resolve/main/v1.3/UNet_mobilenetv1.mlpackage.zip
- Pesos v1.3 PyTorch: https://huggingface.co/deshanc/unet-mobilenet-portrait-segmentation/resolve/main/v1.3/unet_mobilenetv1_best.pt
