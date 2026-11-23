# ccristiann/mars-terrain-unet-resnet34

## Resumen

Mars-terrain-unet-resnet34 es un modelo de segmentación semántica de imágenes desarrollado por el usuario ccristiann (CCristiann en GitHub) para clasificar el terreno marciano en cuatro clases: suelo, lecho rocoso, arena y roca grande. El modelo parte de una arquitectura U-Net con encoder ResNet34 preentrenado en ImageNet, y se ha entrenado sobre el conjunto de datos AI4Mars de la NASA (imágenes NavCam del rover Curiosity), un corpus etiquetado por expertos y voluntarios de Zooniverse.

El modelo resuelve un problema concreto de percepción para conducción autónoma planetaria: dada una imagen de navegación del rover, genera un mapa de clases por píxel que permite identificar qué zonas del terreno son transitables y cuáles presentan riesgos (rocas grandes). Con 24,4 millones de parámetros y una entrada de 512×512 píxeles, es un modelo ligero, entrenado en una única RTX 4090, lo que lo hace adecuado para experimentación e investigación en ciencia planetaria.

Su relevancia actual radica en que democratiza una tarea de percepción especializada: publica pesos en safetensors y ONNX, una demo en Hugging Face Spaces y código en GitHub, con licencia MIT para los pesos. Es un ejemplo de modelo de nicho, pequeño y reproducible, orientado a la investigación en robótica planetaria más que a producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet34 (segmentation-models-pytorch) |
| Parametros totales | 24.455.812 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 512×512 píxeles) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; ONNX con pesos fp16 y cómputo fp32) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | MIT (pesos); datos de entrenamiento AI4Mars bajo CC BY 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clásica con encoder ResNet34 inicializado con pesos ImageNet de torchvision (BSD-3-Clause). La entrada se redimensiona a 512×512 y se normaliza con las medias y desviaciones estándar de ImageNet. La salida es un mapa de 4 clases por píxel (0 suelo, 1 lecho rocoso, 2 arena, 3 roca grande). El modelo se implementa con la librería segmentation-models-pytorch.

El entrenamiento utilizó el subconjunto MSL NavCam de AI4Mars v0.6, con una división train/val agrupada por tiempo de adquisición para evitar fuga de datos. La función de pérdida combina CrossEntropy con pesos de clase (0,369 / 0,317 / 0,7 / 1,0) y 0,5 · Dice. Se entrenó durante 30 épocas con AdamW (lr 3e-4), batch de 8, precisión mixta bf16 y una RTX 4090. El autor documenta una ablación de pérdidas (Tversky, Lovász, focal) en la que reducir el peso de la clase roca grande resultó más efectivo que cambiar la función de pérdida.

## Capacidades

- Segmentación semántica de imágenes de terreno marciano en cuatro clases (suelo, lecho rocoso, arena, roca grande).
- Generación de mapas de clases por píxel a resolución de entrada 512×512.
- Inferencia en PyTorch mediante `smp.from_pretrained` y en ONNX con pipeline completo (normalización y redimensionado dentro del grafo).
- Procesamiento de imágenes RGB de cualquier tamaño en la versión ONNX (uint8 de entrada, uint8 de salida).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la segmentación de imágenes.

## Casos de uso

- Planificación de rutas para rovers: el mapa de clases por píxel permite identificar zonas de arena o roca grande que deben evitarse al trazar trayectorias, usando la salida de 512×512 como capa de coste para un planificador de movimiento.
- Análisis geológico automatizado: clasificar grandes volúmenes de imágenes NavCam de Curiosity para cuantificar la proporción de lecho rocoso frente a arena en distintas zonas de exploración.
- Investigación en percepción planetaria: servir como baseline reproducible (pesos MIT, código público) para comparar nuevas arquitecturas de segmentación sobre AI4Mars.
- Demo educativa e interactiva: la versión ONNX de 49 MB permite desplegar la segmentación en el navegador mediante la demo de Hugging Face Spaces, útil para divulgación científica.
- Etiquetado asistido: preanotar imágenes de terreno marciano antes de la revisión humana, acelerando la creación de nuevos conjuntos de datos etiquetados.
- Prototipado en robótica de bajo coste: al caber en una GPU de consumo y ejecutarse en ONNX, puede integrarse en bancos de pruebas con hardware limitado para experimentar con conducción autónoma en entornos análogos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test etiquetado por expertos (322 imágenes):

| Variante de test | soil | bedrock | sand | big rock | mIoU |
|---|---|---|---|---|---|
| min3 (los 3 expertos coinciden) | 0,981 | 0,929 | 0,958 | 0,372 | 0,810 |
| min1 (al menos 1 etiqueta de experto) | 0,915 | 0,805 | 0,851 | 0,109 | 0,670 |

La clase roca grande presenta alta exhaustividad (0,997 en min3) pero baja precisión (0,37): el modelo detecta rocas pero sobrepredice su presencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo PyTorch (24,4 M de parámetros); la versión ONNX ocupa 49 MB en disco.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una RTX 4090, pero la inferencia es viable en GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1060 en adelante) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch con segmentation-models-pytorch, ONNX Runtime (incluido en navegador vía la demo de Spaces); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ccristiann/mars-terrain-unet-resnet34 | 24,4 M | 512×512 px | 0,810 (min3) | MIT | Hugging Face, GitHub |
| U-Net con encoder EfficientNet (variantes AI4Mars) | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepLabV3+ sobre AI4Mars | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificados de otros modelos de segmentación sobre AI4Mars en la información proporcionada; las alternativas indicadas son categorías arquitectónicas habituales para esta tarea, no resultados medidos.

## Limitaciones y advertencias

- Entrenado únicamente con imágenes NavCam de Curiosity; otras cámaras o rovers quedan fuera de distribución.
- Las regiones sin etiquetar (hardware del rover, cielo, terreno lejano) se ignoraron en el entrenamiento, pero el modelo asigna igualmente una clase a cada píxel, lo que puede generar predicciones sin sentido en esas zonas.
- La clase roca grande es la más débil: baja precisión (0,37) y sobrepredicción, lo que puede provocar falsos positivos en la detección de obstáculos.
- Riesgo de alucinación inherente a la segmentación: el modelo siempre produce una etiqueta por píxel aunque la imagen no corresponda a terreno marciano.
- Licencia MIT para los pesos, pero los datos AI4Mars son CC BY 4.0 (requiere atribución) y los pesos ImageNet del encoder tienen términos de acceso no comercial que deben revisarse antes de cualquier uso comercial.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento; cualquier uso debe ser de segmentación de imágenes.
- Sin métricas de latencia ni throughput publicadas; el rendimiento en producción no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccristiann/mars-terrain-unet-resnet34
- Código en GitHub: https://github.com/CCristiann/mars-terrain-segmentation
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ccristiann/mars-terrain-segmentation
- Dataset AI4Mars v0.6 (Zenodo): https://doi.org/10.5281/zenodo.15995036
- Paper AI4Mars (CVPRW 2021): https://doi.org/10.1109/CVPRW53098.2021.00226
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
