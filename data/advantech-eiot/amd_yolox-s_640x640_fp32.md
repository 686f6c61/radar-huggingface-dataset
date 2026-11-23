# Advantech-EIOT/AMD_yolox-s_640x640_FP32

## Resumen

YOLOX-s es un detector de objetos anchor-free desarrollado originalmente por Megvii y publicado en 2021 (paper arXiv:2107.08430). Este repositorio, mantenido por Advantech-EIOT, distribuye los pesos oficiales `yolox_s.pth` convertidos a ONNX en precisión FP32, con entrada fija de 640x640 y salida ya decodificada. No se ha reentrenado ni cuantizado el modelo: los pesos son idénticos a los originales de Megvii. El objetivo es facilitar el despliegue en plataformas AMD VisionAI, en particular sobre procesadores AMD Ryzen AI.

El modelo resuelve detección de objetos en 80 clases del dataset COCO. La conversión integra la decodificación de rejillas y strides dentro del grafo ONNX (opset 17, batch 1) y reorganiza la salida como `[1, 84, 8400]`, donde las cuatro primeras componentes son la caja en formato `cx, cy, w, h` en píxeles de entrada y las 80 restantes son puntuaciones de clase (objectness multiplicado por probabilidad de clase). No incluye NMS, que debe aplicarse externamente.

Su relevancia es práctica: ofrece un artefacto ONNX listo para producción, con verificación numérica frente al ONNX oficial de Megvii (diferencia máxima de caja de 0.0013 px) y licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-s (detector anchor-free, backbone CSPDarknet con cuello PAN y cabeza desacoplada) |
| Parametros totales | no disponible (YOLOX-s ronda los 9 M según el paper original, dato no consignado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 1x3x640x640) |
| Tipos de cuantizacion | solo FP32 en este repositorio; no se distribuyen variantes INT8/FP16 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, batch 1, entrada 640x640, sin NMS) |

## Arquitectura y entrenamiento

YOLOX-s es un detector de una etapa con arquitectura anchor-free. El backbone es una CSPDarknet de escala pequeña, seguida de un cuello tipo PAN y una cabeza desacoplada que separa la predicción de cajas y la de clases. La decodificación de rejillas y strides se ha integrado en el grafo ONNX exportado desde el árbol fuente de YOLOX (rama main, 2026-11-19). La salida se organiza como `[1, 84, 8400]`, con las cajas en píxeles de la imagen de entrada y las puntuaciones de clase calculadas como objectness x probabilidad de clase.

Los pesos son los oficiales de Megvii (`yolox_s.pth`, SHA-256 `f55ded7181e1b0c13285c56e7790b8f0e8f8db590fe4edb37f0b7f345c913a30`), entrenados sobre COCO con 80 clases. No ha habido reentrenamiento, ajuste fino ni cuantización en esta conversión. La validación realizada compara la salida con el `yolox_s.onnx` oficial tras su decodificación, con una diferencia máxima de caja de 0.0013 px. No se reclama una reevaluación de precisión (mAP) para esta conversión.

## Capacidades

- Detección de objetos en 80 clases del dataset COCO (persona, vehículo, animales, mobiliario, utensilios, etc.).
- Salida de cajas delimitadoras en formato `cx, cy, w, h` en píxeles de la imagen de entrada de 640x640.
- Puntuaciones de clase combinadas (objectness x probabilidad de clase) listas para umbralizar.
- Inferencia en un solo paso (una etapa), adecuada para tiempo real.
- Entrada BGR en rango 0-255 sin normalización, en formato NCHW.
- Nombres de clase COCO embebidos en los metadatos del modelo (campo `names`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje; es exclusivamente un modelo de visión.

## Casos de uso

- Vigilancia y videovigilancia en el borde: el modelo se ejecuta sobre AMD Ryzen AI para detectar personas y vehículos en flujos de cámara en tiempo real, con entrada fija de 640x640 que encaja con resoluciones habituales de CCTV tras reescalado.
- Control de aforo y analítica de retail: conteo de personas y detección de categorías COCO (persona, mochila, bolso) en imágenes de cámaras de tienda, integrado en pipelines de analítica con NMS externo.
- Inspección industrial ligera: detección de objetos y componentes en líneas de producción donde las clases de interés estén cubiertas por COCO o donde se use como extractor base para un ajuste fino posterior.
- Sistemas de asistencia a la conducción (ADAS) en prototipos: detección de peatones, vehículos y señales de tráfico en plataformas embebidas AMD, aprovechando la exportación ONNX para integrarse en runtimes de inferencia.
- Automatización de análisis de imágenes en aplicaciones de escritorio: uso del ONNX con ONNX Runtime en equipos con CPU AMD Ryzen AI, sin necesidad de GPU dedicada, para tareas de etiquetado o filtrado previo.
- Módulo de preprocesado en pipelines de visión más amplios: al no incluir NMS, se integra como etapa de propuesta de cajas dentro de sistemas mayores que apliquen supresión no máxima y lógica de negocio propia.
- Despliegue en dispositivos con aceleración AMD VisionAI: el formato ONNX y la licencia Apache-2.0 permiten distribuirlo en productos comerciales sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una verificación numérica frente al ONNX oficial de Megvii (diferencia máxima de caja de 0.0013 px) y no reclama reevaluación de precisión (mAP) para esta conversión.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: no disponible en la informacion proporcionada; para un detector de la escala de YOLOX-s (del orden de decenas de MB de pesos) la huella es reducida, pero no se consigna cifra oficial.
- GPU recomendadas: no se especifican en la model card. El destino declarado es AMD Ryzen AI y plataformas AMD VisionAI; también puede ejecutarse en CPU mediante ONNX Runtime.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del modelo, pero no se aporta confirmación ni lista de modelos concretos en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (CPU o EP disponibles), así como cualquier runtime compatible con ONNX opset 17. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| YOLOX-s (este repo) | no disponible (escala small) | 640x640 fija | Apache-2.0 | ONNX FP32 | Anchor-free, sin NMS, verificado frente al ONNX oficial |
| YOLOX-s oficial (Megvii) | no disponible | 640x640 | Apache-2.0 | PyTorch / ONNX | Referencia upstream; este repo deriva de sus pesos |
| Otros detectores COCO de la misma escala | no disponible | variable | variable | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; cualquier objeto fuera de ese conjunto no se reconocerá.
- No incluye NMS en el grafo: es obligatorio aplicar supresión no máxima externa, con el coste computacional y la elección de umbrales que ello implica.
- Entrada fija de 640x640 y batch 1: no admite resolución variable ni lotes mayores sin reexportar.
- Preprocesado estricto: BGR, rango 0-255, sin normalización, NCHW; un preprocesado distinto degrada la detección.
- No se ha reevaluado la precisión (mAP) de esta conversión; la única validación es la comparación numérica de cajas frente al ONNX oficial.
- Riesgo de falsos positivos y negativos inherente a un detector de escala small; en escenas densas o con objetos pequeños el rendimiento puede ser limitado.
- Sesgos heredados del dataset COCO, cuyas imágenes provienen de Flickr con licencias diversas; pueden aparecer sesgos de representación demográficos y contextuales.
- Licencia Apache-2.0 permite uso comercial, pero el usuario debe conservar el aviso de copyright de Megvii incluido en `LICENSE`.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes; cualquier uso en esos ámbitos queda fuera de su alcance.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Advantech-EIOT/AMD_yolox-s_640x640_FP32
- Repositorio YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Paper YOLOX: https://arxiv.org/abs/2107.08430
- Pesos oficiales `yolox_s.pth`: https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_s.pth
- Licencia YOLOX: https://github.com/Megvii-BaseDetection/YOLOX/blob/main/LICENSE
