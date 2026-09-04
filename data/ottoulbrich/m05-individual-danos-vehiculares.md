# OttoUlbrich/m05-individual-danos-vehiculares

## Resumen

OttoUlbrich/m05-individual-danos-vehiculares es un conjunto de dos modelos de visión por computador creado por Otto Ulbrich como trabajo individual del curso "Deep learning, soluciones disruptivas" (Magíster en IA, UAC, 2026). El repositorio incluye un clasificador multi-label basado en ResNet50 y un detector de objetos basado en YOLOv8s, ambos entrenados sobre el benchmark público CarDD. El objetivo es responder dos preguntas complementarias: qué daño existe en un vehículo (clasificación) y dónde se localiza (detección). La relevancia actual radica en su uso educativo y como referencia para prototipos de inspección automatizada de daños, aunque la licencia no comercial limita su aplicación en producción.

La arquitectura combina un clasificador timm ResNet50 con 6 salidas para tipos de daño y un detector YOLOv8s ajustado desde pesos preentrenados en COCO. El repositorio tiene un tamaño de 0.1 GB e incluye los pesos en formato safetensors y .pt, además de un config.json con umbrales y métricas. No se especifica la longitud de contexto ni parámetros totales, al tratarse de modelos de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador ResNet50 (timm) + detector YOLOv8s (fine-tune COCO) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | es (etiqueta del modelo) |
| Licencia | other (no comercial, heredada de CarDD) |
| Formato de pesos | safetensors y .pt (PyTorch) |

## Arquitectura y entrenamiento

El clasificador es un ResNet50 de timm con una cabeza de clasificación multi-label de 6 salidas. Se carga con `timm.create_model("resnet50", num_classes=6)` y los pesos en `resnet50.safetensors`. El detector es un YOLOv8s ajustado sobre COCO, cargado con `YOLO("yolo_best.pt")`. Ambos modelos comparten el mismo split de datos, con 429 imágenes de test. El dataset es CarDD (Wang et al., 2023), disponible en HF como `harpreetsahota/CarDD`. No se detallan técnicas de entrenamiento como RLHF o DPO, por tratarse de modelos de visión por computador. Se proporciona un `config.json` con las clases, umbrales óptimos por clase, preprocesamiento y métricas.

## Capacidades

- Clasificación multi-label de daños vehiculares: identifica simultáneamente hasta 6 tipos: crack, dent, glass shatter, lamp broken, scratch y tire flat.
- Detección de objetos: genera cajas delimitadoras por instancia para localizar los daños en la imagen.
- Salida con umbrales óptimos por clase, calculados para maximizar F1 en validación: crack 0.64, dent 0.37, glass shatter 0.51, lamp broken 0.67, scratch 0.54, tire flat 0.76.
- No dispone de tool calling, soporte de agentes, razonamiento multi-paso ni capacidades de lenguaje más allá de la etiqueta de idioma "es".
- Es un modelo de visión por computador, no un modelo de lenguaje multimodal.

## Casos de uso

- Inspección de daños en talleres: un operario fotografía el vehículo y el clasificador indica el tipo de daño, agilizando la elaboración de presupuestos. La naturaleza multi-label permite que un mismo panel tenga varios daños simultáneos.
- Triaje de siniestros para aseguradoras: el detector localiza las zonas dañadas, lo que permite priorizar revisiones. Su mAP@50 de 0.691 es adecuado para un prototipo de preselección, no para tasación definitiva.
- Análisis de flotas: se pueden procesar imágenes de vehículos de empresa para detectar arañazos o abolladuras recurrentes y planificar mantenimiento.
- Educación e investigación: sirve como ejemplo de implementación de dos cabezales de salida (clasificación y detección) sobre el mismo dataset. Los umbrales y métricas documentados facilitan la reproducción de experimentos.
- Automatización de informes periciales: combinando clasificador y detector se puede generar un informe preliminar con el tipo y la ubicación de cada daño, que un perito revisa posteriormente.
- Aplicación móvil de inspección: al ser modelos pequeños (repo de 0.1 GB), son ejecutables en dispositivos con GPU modesta o CPU, permitiendo un triaje en campo sin conexión a servidores externos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Clasificador macro-F1 (test, 429 imágenes) | 0.786 |
| Clasificador AUROC macro | 0.927 |
| Detector mAP@50 | 0.691 |
| Detector mAP@50-95 | 0.54 |

Umbrales óptimos por clase (maximizando F1 en validación):

| Clase | Umbral |
|---|---|
| crack | 0.64 |
| dent | 0.37 |
| glass shatter | 0.51 |
| lamp broken | 0.67 |
| scratch | 0.54 |
| tire flat | 0.76 |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- No se proporcionan mediciones oficiales de VRAM, latencia ni throughput.
- Estimación orientativa: un clasificador ResNet50 y un detector YOLOv8s ocupan menos de 1 GB en fp32, por lo que caben en GPUs de consumo como RTX 3060 o inferiores, e incluso en CPU.
- El despliegue se puede realizar con timm (clasificador) y Ultralytics YOLO (detector) en Python. No se indican integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Para entornos de producción se requeriría un servidor de inferencia de visión, como TorchServe o Triton, aunque la licencia no comercial limita su uso real.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la información disponible.

## Limitaciones y advertencias

- Licencia no comercial: los pesos heredan la licencia restrictiva de CarDD, por lo que no se pueden utilizar en productos comerciales ni en operación de producción.
- Modelo educativo: es un POC de un trabajo de curso, sin validación clínica ni industrial.
- El autor advierte que el rendimiento en fotos reales de inspección puede diferir sustancialmente del benchmark.
- El dataset CarDD puede tener sesgos en tipos de vehículos, condiciones de iluminación o ángulos, lo que puede generar falsos positivos o negativos en otros contextos.
- No hay soporte de tool calling ni de agentes; su uso se limita a tareas de visión por computador.
- Riesgo de alucinación: en visión, se manifiesta como detecciones de daños inexistentes o clasificaciones erróneas. Los umbrales por clase ayudan a mitigarlo, pero no lo eliminan.

## Enlaces

- HuggingFace: https://huggingface.co/OttoUlbrich/m05-individual-danos-vehiculares
- Dataset CarDD (mirror HF): https://huggingface.co/datasets/harpreetsahota/CarDD
- Paper de CarDD (Wang et al., 2023): no disponible en la información proporcionada.
