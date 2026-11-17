# AXERA-TECH/yolo26

## Resumen

AXERA-TECH/yolo26 es una conversión del detector de objetos YOLO26 de Ultralytics para su ejecución sobre las NPU de Axera, empaquetada en formato ONNX y distribuida junto con los artefactos `.axmodel` cuantizados a INT8 (u8). El repositorio lo publica AXERA-TECH, el equipo de la plataforma Axera, y está pensado para desarrolladores que necesitan desplegar detección de objetos en tiempo real sobre hardware de borde con aceleración NPU en lugar de GPU.

El modelo no introduce una arquitectura nueva: reproduce la familia YOLO26 (variantes n, s, m, l y x) y añade el trabajo de conversión, cuantización y validación sobre los distintos SoC de Axera (AX650N, AX8850, AX630C, AX637 y AX615). La relevancia práctica está en las cifras de latencia publicadas: en AX650N en modo NPU3, la variante `yolo26n` alcanza 726 FPS con 1,378 ms de latencia y solo 3,26 MB de memoria CMM, mientras que la variante `yolo26x` baja a 41 FPS y 20,405 ms.

El repositorio ocupa 0,8 GB e incluye tanto los pesos ONNX como los binarios compilados para cada plataforma, además de scripts de inferencia y evaluación sobre COCO val2017 que permiten comparar la precisión del ONNX en FP32 con la del `.axmodel` cuantizado. La licencia es AGPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26 (detector de objetos de la familia Ultralytics), convertido a `.axmodel` mediante Pulsar2 4.2 |
| Parámetros totales | no disponible (el repositorio no publica recuentos por variante) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | INT8 (u8) para los `.axmodel`; ONNX en FP32 como referencia |
| Idiomas soportados | en (etiquetas de clase COCO en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX y `.axmodel` (formato propietario de Axera) |
| Variantes | yolo26n, yolo26s, yolo26m, yolo26l, yolo26x |
| Resolución de entrada | 640x640 (según los ejemplos de inferencia) |
| Herramienta de conversión | Pulsar2 4.2 |
| Plataformas soportadas | AX650N, AX8850, AX630C, AX637, AX615 |
| Tarea | object-detection |
| Modelo base | YOLO26 |

## Arquitectura y entrenamiento

El modelo es un detector de objetos de la familia YOLO26 de Ultralytics; el repositorio no describe cambios en la arquitectura respecto al modelo base, sino el pipeline de conversión a NPU. El trabajo técnico consiste en la exportación a ONNX y su compilación con Pulsar2 4.2 a `.axmodel` con cuantización INT8 (u8), un paso que requiere calibración sobre un conjunto representativo y que introduce una pérdida de precisión que el autor cuantifica.

No se detallan en la información disponible los datos de entrenamiento, el número de tokens o imágenes, ni si hubo etapas de ajuste fino posteriores al entrenamiento original de Ultralytics. Tampoco se documentan innovaciones de decodificación o atención específicas de esta conversión. Lo que sí se aporta es una metodología de validación: scripts independientes bajo `src/` para inferencia ONNX y `.axmodel`, exportación de tensores densos en `.npz` y evaluación de bbox sobre COCO val2017, de modo que se puede medir la consistencia uno a uno entre la salida FP32 y la salida cuantizada.

## Capacidades

- Detección de objetos en imágenes con las 80 clases del dataset COCO.
- Inferencia sobre NPU de Axera con cuantización INT8, sin necesidad de GPU.
- Ejecución en múltiples modos de NPU (por ejemplo, NPU1 y NPU2 en AX630C y AX615) con distinta latencia.
- Exportación de resultados densos (`raw_outputs.npz`, `manifest.json`, `image_ids.json`) para evaluación reproducible.
- Comparación automatizada entre métricas ONNX y AXModel, incluida la consistencia por imagen.
- Ejecución por lotes sobre datasets de validación con informe de tiempos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un detector de objetos.

## Casos de uso

- Vigilancia y videovigilancia en el borde: con 726 FPS y 1,378 ms de latencia en AX650N con `yolo26n`, se pueden procesar múltiples cámaras en un único SoC sin enviar vídeo a la nube.
- Detección en drones y robótica móvil: las variantes `yolo26n` y `yolo26s` caben en placas como M4N-Dock o Module-LLM, con latencias de 4,059 ms y 10,933 ms en AX637, adecuadas para bucles de control en tiempo real.
- Control de aforo y conteo de personas: el ejemplo incluido detecta personas y autobuses en `bus.jpg` con confianzas del 94 % y 91 %, suficiente para aplicaciones de conteo en accesos.
- Inspección industrial en línea de producción: la variante `yolo26x` en AX650N ofrece 41 FPS con 20,405 ms de latencia, un régimen compatible con cintas transportadoras de alta velocidad.
- Analítica de retail en dispositivos de bajo coste: AX630C con `yolo26n_npu2` a 6,309 ms permite desplegar detección en kits como LLM630 Compute Kit sin infraestructura de servidor.
- Prototipado e investigación en visión: los scripts de evaluación sobre COCO val2017 permiten medir la pérdida real de cuantización antes de comprometerse con un despliegue, con comparación directa ONNX frente a AXModel.
- Sistemas de seguridad embebidos con requisitos de privacidad: al ejecutarse localmente en la NPU, las imágenes no salen del dispositivo.

## Benchmarks y rendimiento

Rendimiento en AX650N (modo NPU3), con mAP50 sobre COCO y latencia medida:

| Modelo | ONNX (mAP50) | AXModel (mAP50) | FPS | CMM (MB) | Latencia (ms) |
|---|---|---|---|---|---|
| yolo26n | 0,557 | 0,533 | 726 | 3,26 | 1,378 |
| yolo26s | 0,646 | 0,619 | 316 | 10,2 | 3,166 |
| yolo26m | 0,698 | 0,684 | 116 | 27,6 | 8,644 |
| yolo26l | 0,715 | 0,698 | 90 | 33,88 | 11,174 |
| yolo26x | 0,741 | 0,730 | 41,0 | 70,4 | 20,405 |

El autor advierte que las cifras ONNX (mAP50) proceden de la web oficial de Ultralytics y que, medidas sobre COCO val2017 real, la precisión ONNX es entre un 0,4 % y un 0,9 % inferior, por lo que la pérdida de cuantización del AXModel es aún menor de lo que sugiere la tabla.

Latencia en AX630C:

| Modelo | Latencia (ms) |
|---|---|
| yolo26n_npu1.axmodel | 10,706 |
| yolo26s_npu1.axmodel | 23,188 |
| yolo26n_npu2.axmodel | 6,309 |
| yolo26s_npu2.axmodel | 16,347 |

Latencia en AX637:

| Modelo | Latencia (ms) |
|---|---|
| yolo26n | 4,059 |
| yolo26s | 10,933 |

Latencia en AX615:

| Modelo | Latencia (ms) |
|---|---|
| yolo26n_npu1.axmodel | 26,995 |
| yolo26s_npu1.axmodel | 55,200 |
| yolo26n_npu2.axmodel | 10,599 |
| yolo26s_npu2.axmodel | 18,600 |

No se han publicado resultados de benchmarks frente a otros detectores (por ejemplo, variantes YOLOv8 u otros modelos en las mismas NPU) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta sobre NPU de Axera, no sobre GPU. El consumo de memoria en NPU se reporta como CMM: desde 3,26 MB (`yolo26n`) hasta 70,4 MB (`yolo26x`) en AX650N.
- Plataformas de destino: AX650N, AX8850, AX630C, AX637 y AX615.
- Dispositivos concretos citados: M4N-Dock (爱芯派Pro), tarjeta aceleradora M.2 de M5Stack (LLM-8850 Card), 爱芯派2, Module-LLM y LLM630 Compute Kit.
- GPU: no es necesaria para inferencia; para la conversión y la evaluación ONNX se ejecuta en una máquina de desarrollo con Python (los ejemplos usan un entorno virtual propio).
- Despliegue: binario `ax_yolo26` para AX650 con `install_650`, y scripts Python `src/infer/yolo26_infer_axmodel.py` y `src/infer/yolo26_infer_onnx.py` para pruebas y exportación de resultados.
- Herramienta de conversión: Pulsar2 4.2, documentada en pulsar2-docs.readthedocs.io, y el repositorio ax-samples de AXERA-TECH.
- Latencia y throughput: ver tablas de la sección anterior; el rango va de 1,378 ms (726 FPS) en `yolo26n` sobre AX650N a 55,200 ms en `yolo26s_npu1` sobre AX615.

## Comparativa con modelos similares

| Modelo | Variantes | Cuantización | Plataforma | Latencia destacada | Licencia |
|---|---|---|---|---|---|
| AXERA-TECH/yolo26 | n, s, m, l, x | INT8 (u8) | NPU Axera (AX650N, AX8850, AX630C, AX637, AX615) | 1,378 ms (yolo26n, AX650N) | AGPL-3.0 |
| YOLO26 original (Ultralytics) | n, s, m, l, x | FP32/FP16 | GPU/CPU genérica | no disponible en esta ficha | AGPL-3.0 |
| Otros detectores convertidos a NPU Axera | no disponible | no disponible | NPU Axera | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (detectores ligeros tipo YOLOv8n o YOLO11n en NPU) no está cubierta en la información proporcionada; solo se dispone de las cifras del propio YOLO26 en sus variantes y plataformas.

## Limitaciones y advertencias

- Licencia AGPL-3.0: su uso en productos propietarios o servicios en red exige cumplir con las obligaciones de la AGPL, incluida la publicación del código fuente modificado; conviene revisarlo con asesoría legal antes de un despliegue comercial.
- Solo detecta las 80 clases de COCO; no es un modelo de propósito general ni admite prompts en lenguaje natural.
- La cuantización INT8 introduce una pérdida de precisión medible: entre 0,011 y 0,027 puntos de mAP50 según variante en AX650N, con una precisión real del ONNX de referencia entre 0,4 % y 0,9 % inferior a la publicada por Ultralytics.
- El modelo está atado al ecosistema Axera: los `.axmodel` solo se ejecutan en las NPU listadas y requieren Pulsar2 4.2 para su recompilación.
- El repositorio no documenta sesgos del dataset COCO ni el proceso de entrenamiento original; los sesgos heredados de COCO (clases desequilibradas, predominio de escenas occidentales) son aplicables.
- No hay información sobre robustez ante condiciones adversas (baja iluminación, oclusión, dominios distintos de COCO); la validación publicada se limita a COCO val2017.
- El tamaño del repositorio (0,8 GB) incluye binarios para varias plataformas; conviene descargar solo la carpeta de la plataforma objetivo.
- El idioma declarado es únicamente inglés, lo que afecta a la documentación y a las etiquetas de clase, no a la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AXERA-TECH/yolo26
- Repositorio de la plataforma Axera y guía de conversión: https://github.com/AXERA-TECH/ax-samples
- Documentación de Pulsar2 (conversión ONNX a axmodel): https://pulsar2-docs.readthedocs.io/en/latest/pulsar2/introduction.html
- Página oficial de YOLO26 en Ultralytics (origen de las cifras ONNX): https://platform.ultralytics.com/ultralytics/yolo26/
- M4N-Dock (爱芯派Pro): https://wiki.sipeed.com/hardware/zh/maixIV/m4ndock/m4ndock.html
- Tarjeta aceleradora M.2 / LLM-8850 Card: https://docs.m5stack.com/en/ai_hardware/LLM-8850_Card
- 爱芯派2: https://axera-pi-2-docs-cn.readthedocs.io/zh-cn/latest/index.html
- Module-LLM: https://docs.m5stack.com/zh_CN/module/Module-LLM
- LLM630 Compute Kit: https://docs.m5stack.com/zh_CN/core/LLM630%20Compute%20Kit
