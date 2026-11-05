# OpenVINO/yolox_l-int8-ov

## Resumen

`OpenVINO/yolox_l-int8-ov` es la conversión a formato OpenVINO IR con cuantización INT8 del detector de objetos YOLOX-L, un modelo de visión por computador para detección de objetos en imágenes. Lo publica la organización OpenVINO (Intel) a partir de una versión del modelo original YOLOX-L preparada por Geti, la plataforma de entrenamiento y anotación de Intel para modelos de visión.

El modelo resuelve la tarea de detección de objetos genérica: localizar y clasificar instancias en una imagen mediante una única pasada de red (single-stage detector). Su interés práctico no está en la arquitectura en sí, sino en el empaquetado: pesos y activaciones cuantizados a INT8 con NNCF mediante quantización post-entrenamiento (PTQ), lo que reduce el tamaño del repositorio a unos 0,1 GB y permite inferencia de baja latencia en CPU, GPU integrada y NPU de Intel a través del runtime OpenVINO.

Es relevante para desarrolladores que despliegan visión artificial en el edge o en PCs con IA sin GPU dedicada, ya que el formato IR de OpenVINO está optimizado para el hardware de Intel y se integra con la Model API de open-edge-platform. No es un modelo de lenguaje: no genera texto ni soporta tool calling, y su ámbito es exclusivamente la detección de objetos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOX-L (detector single-stage, backbone CSPDarknet con cuello FPN/PAN y cabeza desacoplada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | INT8 en pesos y activaciones (PTQ con NNCF) |
| Idiomas soportados | no disponible (no aplica; solo etiquetas de clase del dataset de entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (compatible con OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior) |

## Arquitectura y entrenamiento

YOLOX-L es un detector de objetos de una sola etapa presentado en el paper *YOLOX: Exceeding YOLO Series in 2021*. Emplea un backbone CSPDarknet, un cuello de agregación de características tipo FPN/PAN y una cabeza desacoplada (decoupled head) que separa la predicción de clase de la de regresión de caja, además de asignación dinámica de etiquetas y decodificación sin anchors. La variante L es la de mayor capacidad de la familia YOLOX.

Esta versión concreta parte de un modelo YOLOX-L gestionado y exportado con Geti. Sobre ese modelo se aplicó compresión de pesos y activaciones mediante `nncf.quantize` en modo PTQ, con precisión INT8, y se convirtió el resultado al formato IR de OpenVINO. La información disponible no detalla el dataset de entrenamiento original, el número de imágenes ni si hubo ajuste fino adicional; la model card remite a la documentación del modelo original para esos detalles.

## Capacidades

- Detección de objetos en imágenes: devuelve cajas delimitadoras con clase y puntuación de confianza.
- Inferencia de una sola pasada, adecuada para tiempo real en hardware modesto.
- Ejecución optimizada en CPU, GPU integrada y NPU de Intel mediante el runtime OpenVINO.
- Integración directa con la Model API de open-edge-platform (`Model.from_pretrained`) y utilidades de visualización (`Visualizer`).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de visión-lenguaje: es un detector puro.

## Casos de uso

- Inspección visual en línea de fabricación: el modelo detecta defectos o piezas en la cadena de montaje sobre CPU o NPU de Intel, con latencia baja gracias a la cuantización INT8 y sin necesidad de GPU dedicada.
- Vigilancia y conteo de personas u objetos en cámaras IP: se ejecuta en un mini-PC con OpenVINO y procesa flujos de vídeo en tiempo real en el propio dispositivo, evitando enviar vídeo a la nube.
- Análisis de estanterías en retail: detección de productos y huecos para gestión de inventario, aprovechando la velocidad de inferencia en hardware de bajo consumo.
- Detección de vehículos y peatones en sistemas de tráfico: el modelo puede integrarse en controladores de semáforos o unidades de borde para conteo y alertas.
- Preprocesado en pipelines de visión documental o industrial: usar las detecciones como paso previo (recorte de regiones de interés) antes de un modelo de clasificación u OCR.
- Prototipado rápido con Geti: la model card indica que se puede anotar un dataset propio, hacer fine-tuning y exportar de nuevo el modelo con Geti, lo que permite adaptar el detector a dominios específicos.
- Automatización de análisis de imágenes en aplicaciones de escritorio o AI PCs: al ejecutarse con OpenVINO en CPU/GPU integrada, encaja en herramientas locales que requieren privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para inferencia en CPU, GPU integrada y NPU de Intel, donde no se requiere VRAM dedicada.
- GPU recomendadas: no se especifican; el runtime OpenVINO soporta CPU, GPU y NPU de Intel. Para GPU dedicada no hay datos de rendimiento en la información disponible.
- Cabe en hardware consumer: sí, al ser un modelo INT8 de unos 0,1 GB de repositorio, es apto para PCs convencionales con CPU Intel y para dispositivos de borde.
- Opciones de despliegue: runtime OpenVINO (versión 2026.1.0 o superior) y Model API 0.4.0 o superior. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenVINO/yolox_l-int8-ov | YOLOX-L | OpenVINO IR | INT8 (PTQ) | Apache-2.0 | Hugging Face (OpenVINO) |
| YOLOX-L original (mmdetection) | YOLOX-L | PyTorch | FP32 | Apache-2.0 | GitHub open-mmlab |
| Otras variantes YOLOX de OpenVINO | YOLOX (tamaños S/M/X) | OpenVINO IR | INT8 | Apache-2.0 | Hugging Face (OpenVINO) |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card remite a la documentación del modelo original para las limitaciones; no se detallan sesgos ni clases concretas en la información disponible.
- Riesgo de degradación de precisión por la cuantización INT8 respecto al modelo en FP32; no se aportan métricas de la pérdida de mAP.
- El modelo solo detecta las clases con las que fue entrenado; su utilidad fuera de ese dominio requiere fine-tuning con Geti.
- No es un modelo multimodal ni generativo: no admite instrucciones en lenguaje natural ni razonamiento.
- Compatibilidad restringida a OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; no funciona con runtimes genéricos sin conversión.
- Licencia Apache-2.0, que permite uso comercial con atribución y sin garantías; conviene revisar los términos del modelo original en mmdetection.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/yolox_l-int8-ov
- Modelo original YOLOX-L en mmdetection: https://github.com/open-mmlab/mmdetection/tree/main/configs/yolox
- Geti (open-edge-platform): https://github.com/open-edge-platform/geti
- Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización post-entrenamiento de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Repositorio OpenVINO: https://github.com/openvinotoolkit/openvino
- Documentación de OpenVINO: https://docs.openvino.ai/
- OpenVINO en Hugging Face: https://huggingface.co/OpenVINO
