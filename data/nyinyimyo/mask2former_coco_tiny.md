# NyiNyiMyo/mask2former_coco_tiny

## Resumen

Mask2Former es un modelo de segmentación universal presentado por Meta AI en 2021, capaz de abordar segmentación de instancias, semántica y panóptica con una única arquitectura basada en transformers. La versión `NyiNyiMyo/mask2former_coco_tiny` es una conversión a formato ONNX del modelo original `facebook/mask2former-swin-tiny-coco-instance`, entrenado sobre el dataset COCO para segmentación de instancias. El autor, NyiNyiMyo, ha publicado esta adaptación con el objetivo de facilitar la inferencia en entornos que requieren interoperabilidad entre frameworks, como aplicaciones de visión por computador en producción.

El modelo emplea un backbone Swin-Tiny y un mecanismo de atención enmascarada que permite procesar imágenes de alta resolución de forma eficiente. Al estar disponible en ONNX, puede ejecutarse con runtime como ONNX Runtime, TensorRT o OpenVINO, lo que lo hace adecuado para despliegues en edge o en la nube. Su tamaño reducido (0.2 GB) lo convierte en una opción ligera para tareas de segmentación de instancias en tiempo real, aunque no se han publicado métricas específicas para esta conversión concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask2Former con backbone Swin-Tiny |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (segun tags del repositorio) |

## Arquitectura y entrenamiento

Mask2Former se basa en un transformer con atención enmascarada (masked attention) que restringe el cálculo de atención a regiones predichas, reduciendo la complejidad computacional y mejorando la convergencia. El modelo utiliza un backbone Swin-Tiny para extraer características multiescala y un decodificador que predice máscaras y etiquetas de clase de forma conjunta. El entrenamiento original se realizó sobre el dataset COCO (118k imágenes) con una combinación de pérdidas de clasificación, segmentación y supervisión auxiliar. La versión convertida a ONNX no incluye información adicional sobre el proceso de entrenamiento o los datos utilizados, por lo que se asume que hereda los pesos del modelo original de Facebook.

## Capacidades

- Segmentación de instancias: detecta y segmenta objetos individuales en imágenes, asignando una máscara y una clase a cada instancia.
- Segmentación panóptica (teóricamente, aunque el modelo original está entrenado para instancias): la arquitectura Mask2Former soporta tareas unificadas, pero esta versión concreta está enfocada a instancias.
- Inferencia eficiente gracias al formato ONNX, que permite optimizaciones como cuantización y aceleración por hardware.
- No soporta generación de texto, tool calling ni capacidades multimodales más allá de la visión.

## Casos de uso

- Control de calidad industrial: segmentar defectos o piezas en líneas de producción mediante imágenes de cámaras, usando el modelo ONNX en un pipeline de visión con OpenCV o ONNX Runtime.
- Conteo y seguimiento de objetos: en entornos de retail o logística, el modelo puede segmentar productos o paquetes para contarlos y estimar su posición.
- Análisis de imágenes médicas: aunque no está entrenado específicamente para dominios médicos, puede adaptarse con fine-tuning para segmentar estructuras en radiografías o tomografías.
- Robótica y navegación autónoma: segmentar obstáculos o elementos del entorno en tiempo real, aprovechando el bajo peso del modelo para ejecutarse en GPUs embebidas como Jetson.
- Automatización de documentos: extraer regiones de interés en imágenes escaneadas (tablas, figuras, sellos) para su posterior procesamiento OCR.
- Investigación académica: servir como baseline ligero para comparar arquitecturas de segmentación en proyectos de visión por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversión concreta. El modelo original `facebook/mask2former-swin-tiny-coco-instance` reporta un mAP de aproximadamente 35.5 en COCO instance segmentation, pero no se puede confirmar que esta versión ONNX mantenga exactamente esas métricas debido a posibles diferencias en la conversión y optimización.

## Requisitos de hardware

- El tamaño del repositorio es de 0.2 GB, lo que sugiere que el modelo ONNX puede cargarse en memoria con menos de 1 GB de RAM/VRAM.
- Es probable que funcione en GPUs de consumo como GTX 1060 (6 GB) o superiores, así como en CPUs modernas con soporte AVX.
- Para inferencia en tiempo real, se recomienda una GPU con al menos 4 GB de VRAM, aunque no se dispone de datos exactos de latencia.
- Opciones de despliegue: ONNX Runtime, TensorRT, OpenVINO, o mediante frameworks como Hugging Face Transformers (si se carga el modelo original en PyTorch).
- No se dispone de mediciones de throughput específicas para esta versión.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| NyiNyiMyo/mask2former_coco_tiny | Mask2Former + Swin-Tiny | no disponible | no aplica | Apache-2.0 | ONNX |
| facebook/mask2former-swin-tiny-coco-instance | Mask2Former + Swin-Tiny | ~42M (estimado) | no aplica | Apache-2.0 | PyTorch |
| facebook/mask2former-swin-large-coco-instance | Mask2Former + Swin-Large | ~215M (estimado) | no aplica | Apache-2.0 | PyTorch |

La comparativa se basa en el modelo original, ya que no hay datos específicos de la conversión ONNX. La versión ONNX ofrece ventajas de portabilidad, pero puede perder algo de precisión si se aplican optimizaciones agresivas.

## Limitaciones y advertencias

- No se dispone de información sobre el proceso de conversión a ONNX, por lo que no se puede garantizar que los pesos sean idénticos al original ni que no se hayan introducido errores numéricos.
- El modelo está entrenado únicamente en COCO, por lo que su rendimiento en dominios fuera de ese dataset (por ejemplo, imágenes médicas o aéreas) puede ser deficiente.
- Al ser un modelo de visión, no tiene capacidades de lenguaje ni razonamiento multimodal.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la atribución correspondiente si se redistribuye.
- No se han documentado sesgos específicos, pero COCO contiene desequilibrios en clases y contextos que pueden propagarse al modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NyiNyiMyo/mask2former_coco_tiny
- Modelo original de Facebook: https://huggingface.co/facebook/mask2former-swin-tiny-coco-instance
- Repositorio GitHub del autor: https://github.com/NyiNyiMyo/Hugging-Face-Instance-Segmentation-by-Mask2former
- Paper de Mask2Former: https://arxiv.org/abs/2112.01527
