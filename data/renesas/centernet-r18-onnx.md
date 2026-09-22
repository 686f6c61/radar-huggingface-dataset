# Renesas/CenterNet-R18-ONNX

## Resumen

CenterNet-R18-ONNX es un modelo de detección de objetos desarrollado por Renesas, publicado en formato ONNX con pesos FP32. Se basa en la arquitectura CenterNet, un detector anchor-free que predice puntos centrales y propiedades de los objetos, con un backbone ResNet18. Está diseñado específicamente para su despliegue en la plataforma Renesas R-Car X5H, ejecutándose sobre la NPU NPX6 mediante el runtime MWMX.

El modelo se distribuye como un artefacto ONNX de 0,1 GB y se entrena sobre el dataset COCO, con una resolución de entrada de 512×512 píxeles. Su relevancia radica en la integración con la toolchain de Renesas, que realiza una conversión automática de FP32 a INT8 en tiempo de compilación, sin necesidad de un paso de cuantización separado. Está orientado a inferencia embebida de baja latencia en aplicaciones de visión por computador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CenterNet (detector de objetos anchor-free basado en keypoints) con backbone ResNet18 |
| Parámetros totales | No publicado (se puede contar del grafo ONNX) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; no procesa secuencias de texto) |
| Tipos de cuantización | FP32 en el artefacto ONNX publicado; INT8 auto-cast en tiempo de compilación por la toolchain MWMX |
| Idiomas soportados | No aplica (modelo de detección de objetos; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32) |
| Tarea | Detección de objetos |
| Resolución de entrada | 512 × 512 (inferida de `crop512` en el nombre del checkpoint) |
| Dataset de entrenamiento | COCO (inferido del nombre del checkpoint) |

## Arquitectura y entrenamiento

CenterNet es un detector de objetos anchor-free que modela cada objeto como un punto central en un mapa de calor, prediciendo además el tamaño y el desplazamiento del centro. El backbone ResNet18 extrae características de la imagen de entrada, y las cabezas de detección generan las salidas correspondientes. El modelo procede de la configuración de OpenMMLab `centernet_resnet18_140e_coco`, lo que indica un entrenamiento de 140 épocas sobre el dataset COCO. No se detallan en la información proporcionada aspectos como la composición exacta del dataset, técnicas de aumento de datos ni si se aplicaron fases de ajuste fino con RLHF o DPO (no aplicables a un detector de objetos).

La innovación técnica destacable es el flujo de despliegue: el modelo se publica únicamente en FP32 ONNX y la toolchain MWMX de Renesas lo convierte automáticamente a INT8 en tiempo de compilación. Esta conversión se ejecuta en la NPU NPX6-48K del R-Car X5H, sin necesidad de generar un archivo INT8 independiente.

## Capacidades

- Detección de objetos en imágenes: identifica y localiza objetos pertenecientes a las 80 clases del dataset COCO.
- Arquitectura anchor-free basada en keypoints (CenterNet), que predice puntos centrales, tamaño y desplazamiento de cada objeto.
- Backbone ResNet18 para la extracción de características visuales.
- Entrada de imagen de 512 × 512 píxeles.
- Inferencia optimizada para la NPU NPX6 del R-Car X5H mediante el runtime MWMX.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.
- No incluye modo "thinking", procesamiento de audio ni segmentación semántica o de instancias.
- No dispone de capacidades de visión-lenguaje (captioning, VQA, etc.).

## Casos de uso

- Detección de peatones y vehículos en automoción: el modelo se integra en la NPU del R-Car X5H para percepción embebida en vehículos, con latencias de 3,467 ms usando 12 cores, adecuado para sistemas de asistencia a la conducción.
- Inspección industrial automatizada: detección de defectos o componentes en líneas de producción mediante cámaras conectadas a hardware Renesas; la baja latencia permite el análisis en tiempo real.
- Robótica móvil: detección de obstáculos y objetos para navegación autónoma en robots que empleen la plataforma X5H, gracias a la inferencia local en NPU.
- Videovigilancia inteligente en el borde: análisis de flujos de cámara para detectar personas u objetos, procesando localmente sin depender de la nube.
- Análisis de retail: conteo de personas y detección de productos en estanterías mediante cámaras conectadas a plataformas X5H, con procesamiento en el dispositivo.
- Drones y UAV: detección de objetos en tiempo real para evitar colisiones o realizar mapeo, aprovechando la eficiencia energética de la NPU.
- Agricultura de precisión: detección de plagas, frutos o malas hierbas con cámaras en campo sobre hardware embebido Renesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la información disponible (no aplican a un modelo de detección de objetos). Se proporcionan mediciones de latencia en hardware Renesas R-Car X5H:

| Runtime | Precisión | Dispositivo | Latencia (ms) | Tipo |
|---|---|---|---|---|
| MWMX Runtime | INT8 (auto) | X5H · 1× NPU · 1 Core · 850 MHz | 11,978 | Medido |
| MWMX Runtime | INT8 (auto) | X5H · 1× NPU · 1 Core · 850 MHz | 11,989 | Medido (2026-09-16) |
| MWMX Runtime | INT8 (auto) | X5H · 1× NPU · 12 Cores · 850 MHz | 3,467 | Medido |

Configuración del benchmark: una sola NPU, tamaño de lote 1, entrada 3 × 512 × 512 (inferida). Las ejecuciones son hardware-in-the-loop sobre silicio físico R-Car X5H mediante el runtime MWMX. La precisión (mAP) figura como TBD, no medida ni publicada para este repositorio.

## Requisitos de hardware

- Requiere una placa Renesas R-Car X5H con NPU NPX6-48K.
- Requiere el runtime MWMX de Renesas para compilar y ejecutar el modelo.
- No se han publicado estimaciones de VRAM para GPUs de consumo; el modelo está orientado a NPU embebida.
- No se dispone de datos de despliegue en vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de detección de objetos ONNX).
- La ejecución en CPU o GPU mediante ONNX Runtime no está documentada en la información proporcionada.
- Throughput estimado: no disponible; solo se han publicado latencias medidas en la plataforma X5H.
- Para descargar el modelo se requiere la CLI de Hugging Face: `hf download Renesas/CenterNet-R18-ONNX --repo-type=model --include "fp32/*"`.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos comparativos con otros modelos de detección de objetos (YOLO, SSD, Faster R-CNN, etc.). Una comparación rigurosa requeriría métricas de precisión (mAP) y latencia en el mismo hardware, que no están publicadas en la información disponible.

## Limitaciones y advertencias

- Sesgos potenciales derivados del dataset COCO: las 80 clases y la distribución de imágenes pueden no representar dominios específicos de aplicación (industria, agricultura, etc.).
- Riesgo de falsos positivos y falsos negativos inherente a todo detector de objetos; no se han publicado métricas de precisión (mAP) que permitan cuantificarlo.
- No procesa lenguaje natural ni secuencias de texto, por lo que no aplican limitaciones de contexto o idioma.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue requiere hardware y runtime propietarios de Renesas (MWMX); se deben verificar los términos específicos de dichos componentes.
- El modelo se publica solo en FP32 ONNX; la cuantización a INT8 es automática en tiempo de compilación y puede afectar a la precisión, aunque no se ha medido.
- No hay datos de rendimiento en GPUs convencionales ni en otras plataformas distintas de la R-Car X5H.
- La fecha de creación indicada en los metadatos (2026-09-16) es futura; se recomienda verificar la vigencia de los artefactos y enlaces.

## Enlaces

- HuggingFace: https://huggingface.co/Renesas/CenterNet-R18-ONNX
- Configuración de OpenMMLab (modelo fuente): https://github.com/open-mmlab/mmdetection/blob/main/configs/centernet/metafile.yml
- Renesas Electronics: https://www.renesas.com/
- Productos de Renesas: https://www.renesas.com/en/products
- Wikipedia (Renesas Electronics): https://en.wikipedia.org/wiki/Renesas_Electronics
- Wikipedia en francés (Renesas Electronics): https://fr.wikipedia.org/wiki/Renesas_Electronics
