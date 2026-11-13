# anguoyang/damoyolo

## Resumen

DAMO-YOLO-S es un detector de objetos de la familia DAMO-YOLO, desarrollado originalmente por el equipo TinyNAS de Alibaba (TinyVision) y publicado en el paper arXiv:2211.15444. Esta ficha concreta corresponde al repositorio `anguoyang/damoyolo`, una receta independiente que empaqueta el checkpoint S (variante TinyNAS L25, resolución 640×640) para su despliegue en dispositivos Qualcomm mediante el CLI de Qualcomm AI Hub Models. No se trata de un modelo de lenguaje, sino de un detector de objetos de una sola etapa basado en una arquitectura CNN con búsqueda neural de arquitectura (NAS).

El modelo reporta 46,8 mAP en COCO val2017, lo que lo sitúa como la opción de mayor precisión entre los detectores medidos por el autor en la placa RB3 Gen 2 (QCS6490). Su grafo cuantizado w8a8 se ejecuta íntegramente en la NPU de los dos dispositivos evaluados, sin capas de fallback en CPU o GPU, lo que lo hace relevante para despliegues de visión artificial en el borde con requisitos de latencia estrictos.

La relevancia actual del repositorio radica en que el host original de los pesos ha desaparecido (el bucket OSS oficial devuelve `NoSuchBucket` y los enlaces 404), por lo que esta receta fija un espejo en Hugging Face del mismo fichero S con hash sha256 verificado, garantizando la reproducibilidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de deteccion de una etapa (DAMO-YOLO, backbone TinyNAS L25) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 1×3×640×640) |
| Tipos de cuantizacion | w8a8 (calibrada sobre 23 imagenes COCO val2017); float |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch (state-dict), ONNX exportado (`damoyolo.onnx`) |

## Arquitectura y entrenamiento

DAMO-YOLO es un detector de objetos de una etapa que combina un backbone generado mediante búsqueda de arquitectura neural (TinyNAS) con un cuello y una cabeza de detección inspirados en YOLO. La variante S emplea el backbone TinyNAS L25 y opera a 640×640 píxeles de entrada. El modelo original se entrena sobre el conjunto COCO y reporta 46,8 mAP en val2017 según la model card del repositorio.

La receta de este repositorio no reentrena el modelo: parte del checkpoint oficial S, lo exporta a ONNX (entrada `image` [1,3,640,640]; salidas `boxes`, `scores`, `class_idx`) y lo cuantiza a w8a8 mediante Qualcomm AI Hub Workbench, calibrando con 23 imágenes reales de COCO val2017 (job `j578040lp`, modelo cuantizado `mq3eed2p6`). El resultado se compila con QNN precompilado y con TFLite para su ejecución en NPU. La innovación técnica destacable es la consecución de un grafo completamente residente en NPU (231/231 capas en RB3 Gen 2 y 234/234 en Galaxy S25) sin capas de fallback.

## Capacidades

- Detección de objetos en imágenes RGB a resolución 640×640, con salidas de cajas, puntuaciones y clases (formato COCO).
- Inferencia en el borde con ejecución íntegra en NPU Qualcomm (QCS6490 y SM8750).
- Exportación a ONNX para integración en pipelines de despliegue.
- Cuantización w8a8 con calibración sobre imágenes reales.
- Compatibilidad con el CLI de Qualcomm AI Hub Models (`register`, `install`, `demo`, `export`).
- Perfilado y validación en hardware real mediante Qualcomm AI Hub Workbench.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo de visión).

## Casos de uso

- Vigilancia y videovigilancia en el borde: el modelo procesa fotogramas a 640×640 con latencias de 13,3 ms (RB3 Gen 2) y 2,4 ms (Galaxy S25) en NPU, lo que permite detección en tiempo real sin enviar vídeo a la nube.
- Inspección industrial en línea de producción: la ejecución completamente en NPU y la cuantización w8a8 permiten integrar el detector en cámaras inteligentes con presupuesto térmico y energético limitado.
- Robótica y drones: la baja latencia (2,4–14,8 ms según dispositivo) y la entrada fija de 640×640 facilitan la percepción en tiempo real sobre plataformas móviles Qualcomm.
- Análisis de imágenes en dispositivos móviles (Galaxy S25): con 2,4 ms por inferencia en QNN precompilado, es viable el procesado continuo de la cámara en aplicaciones de realidad aumentada o accesibilidad.
- Detección en cámaras IP y sistemas de conteo: el modelo puede integrarse en pipelines TFLite o QNN para tareas de conteo de personas o vehículos en el propio dispositivo.
- Prototipado e investigación en edge AI: la receta reproducible (hash sha256 verificado, CLI de AI Hub Models) permite replicar los resultados y comparar con otras variantes YOLO en el mismo hardware.
- Sustitución de YOLOv8-S cuando prima la precisión: ofrece +1,9 mAP (46,8 frente a 44,9) a costa de un 2–3× más de latencia, adecuado para aplicaciones donde la exactitud es crítica y el margen de latencia lo permite.

## Benchmarks y rendimiento

Resultados medidos en hardware real mediante AI Hub Workbench (cuantización w8a8, calibrada sobre 23 imágenes COCO val2017; latencia como estimación de perfilado / mediana sobre ~100 ejecuciones):

| Dispositivo | Runtime | Precision | Latencia | Capas en NPU |
|---|---|---|---|---|
| RB3 Gen 2 (QCS6490) | QNN precompilado | w8a8 | 13,3 / 14,8 ms | 231 / 231 |
| RB3 Gen 2 (QCS6490) | TFLite | w8a8 | 15,6 / 17,8 ms | 214 / 214 |
| RB3 Gen 2 (QCS6490) | TFLite | float | 180,3 / 238,8 ms | 26 / 186 |
| Galaxy S25 (SM8750) | QNN precompilado | w8a8 | 2,4 / 2,5 ms | 234 / 234 |
| Galaxy S25 (SM8750) | TFLite | w8a8 | 6,1 / 6,5 ms | 214 / 214 |
| Galaxy S25 (SM8750) | TFLite | float | 7,9 / 7,9 ms | 186 / 186 |

Precisión reportada: 46,8 mAP en COCO val2017 (frente a 44,9 mAP del recetario oficial YOLOv8-S de Qualcomm).

## Requisitos de hardware

- Inferencia en NPU Qualcomm: RB3 Gen 2 (QCS6490) y Galaxy S25 (SM8750) validados; no se documentan otros aceleradores.
- VRAM estimada: no disponible (modelo de visión para dispositivos de borde, sin requisitos de GPU de escritorio documentados).
- GPU recomendadas: no disponible; el despliegue objetivo es NPU Qualcomm, no GPU.
- ¿Cabe en GPU de consumo? No se documenta; el modelo está orientado a NPU de dispositivos móviles y de borde.
- Opciones de despliegue: CLI de Qualcomm AI Hub Models (`qai-hub-models register/install/demo/export`), ONNX exportado, QNN precompilado y TFLite.
- Latencia: 13,3–14,8 ms en RB3 Gen 2 (QNN w8a8) y 2,4–2,5 ms en Galaxy S25 (QNN w8a8); el modo float en RB3 Gen 2 degrada hasta 180–239 ms.
- Throughput: no disponible de forma explícita; puede derivarse de la latencia (aproximadamente 67–75 FPS en RB3 Gen 2 y 400–417 FPS en Galaxy S25 con QNN w8a8).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Precision (COCO mAP) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DAMO-YOLO-S (esta ficha) | no disponible | 640×640 | 46,8 | Apache-2.0 | Hugging Face (espejo verificado) + CLI AI Hub Models |
| YOLOv8-S (recetario oficial Qualcomm) | no disponible | no disponible | 44,9 | no disponible en la informacion | Catalogo oficial de AI Hub Models |
| DAMO-YOLO (implementacion original) | no disponible | no disponible | no disponible | Apache-2.0 | GitHub tinyvision/DAMO-YOLO |

## Limitaciones y advertencias

- El host original de los pesos ha desaparecido: el bucket OSS oficial devuelve `NoSuchBucket` y los enlaces de descarga upstream devuelven 404; la reproducibilidad depende del espejo en Hugging Face fijado en esta receta.
- Compromiso precisión/latencia: es un 2–3× más lento que YOLOv8-S en el mismo silicio; para aplicaciones sensibles a latencia puede no ser la mejor opción.
- La cuantización w8a8 se calibró con solo 23 imágenes de COCO val2017, lo que puede afectar a la precisión en dominios distintos de COCO.
- El modo float en RB3 Gen 2 degrada severamente el rendimiento (180–239 ms) y deja la mayoría de capas fuera de la NPU (26/186).
- Riesgo de sesgo y alucinación inherente a los detectores entrenados en COCO: clases limitadas al vocabulario COCO y posible degradación en condiciones de iluminación, oclusión o dominios no representados.
- No es un modelo lingüístico: no soporta generación de texto, tool calling ni capacidades multilingües.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe verificarse la licencia de la implementación original en el repositorio de TinyVision.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validación comunitaria amplia.
- No se documentan requisitos de GPU de escritorio ni benchmarks en aceleradores distintos de las NPU Qualcomm evaluadas.

## Enlaces

- Hugging Face: https://huggingface.co/anguoyang/damoyolo
- Implementación original: https://github.com/tinyvision/DAMO-YOLO
- Paper DAMO-YOLO: https://arxiv.org/abs/2211.15444
- Licencia original: https://github.com/tinyvision/DAMO-YOLO/blob/main/LICENSE
- Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Repositorio de benchmarks del autor: https://github.com/anguoyang/qcs-bench
- Informe de verificación: REPORT.md (en el repositorio de Hugging Face)
- Comunidad AI Hub Slack: https://aihub.qualcomm.com/community/slack
