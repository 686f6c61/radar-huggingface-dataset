# OscarEspana/vec-rtmdet-ligero

## Resumen

vec-rtmdet-ligero es una adaptación del modelo RTMDet-Ins en su variante "s" (small), orientada exclusivamente a la detección y segmentación de instancias de personas. Lo publica el usuario OscarEspana como componente del editor de vídeo VEC, con el objetivo de localizar personas en fotogramas de vídeo directamente en el navegador del usuario mediante ONNX Runtime Web y WebGPU. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador para segmentación de instancias.

El modelo deriva del ONNX convertido por tori29umai a partir de los pesos oficiales de OpenMMLab MMDetection (RTMDet-Ins s entrenado sobre COCO 2017) y exportado con MMDeploy v1.3.1. Sobre esa base, OscarEspana ha recortado el grafo ONNX para puntuar únicamente la clase 0 (persona), reducir el número de candidatos en TopK y NMS, y eliminar las operaciones finales de redimensionado y sigmoide de las máscaras, que se entregan como logits de 80x80.

La relevancia actual del modelo radica en su tamaño reducido (43 MB en fp32, 22 MB en fp16) y en su diseño para inferencia en el dispositivo del cliente, lo que evita enviar fotogramas de vídeo a servidores externos. Está publicado bajo licencia Apache 2.0 y no requiere reentrenamiento: los pesos son los del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMDet-Ins (detector de instancias de una etapa, familia RTMDet de OpenMMLab) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada estática 1x3x640x640) |
| Tipos de cuantizacion | float32 y float16 (fp16 con pesos en media precisión, entradas/salidas en float32 y `backbone/stage2` en float32) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (dos ficheros: `rtmdet-ins_s_ligero_fp32.onnx` y `rtmdet-ins_s_ligero_fp16.onnx`) |

## Arquitectura y entrenamiento

RTMDet-Ins es un detector de instancias de una sola etapa basado en la familia RTMDet de OpenMMLab, que combina un backbone CSP con un cuello tipo CSPNeXt y una cabeza de detección y segmentación. La variante "s" (small) es la de menor capacidad de la familia. El modelo original se entrenó sobre COCO 2017 (anotaciones bajo CC BY 4.0) y se exportó a ONNX con MMDeploy v1.3.1; el checkpoint de referencia es `rtmdet-ins_s_8xb32-300e_coco_20221121_212604-fdc5d7ec.pth`.

Las modificaciones introducidas por OscarEspana no implican reentrenamiento. Se editaron ambos ficheros ONNX con la librería `onnx` mediante el script `recortar-rtmdet.py` para: (1) puntuar únicamente la clase 0 (persona) antes de TopK y NMS; (2) reducir los candidatos pre-NMS de 5000 a 1000, las cajas por clase en NMS de 200 a 20 y `keep_top_k` de 100 a 20; (3) subir el umbral de score en NMS de 0.05 a 0.2 y el de IoU de 0.5 a 0.6; (4) eliminar el `Resize` final a 640x640 y el `Sigmoid`, de modo que las máscaras se entregan como logits de 80x80; y (5) convertir el fichero fp16 con `onnxconverter-common` manteniendo `keep_io_types=True` y dejando los nodos `Cast` y `backbone/stage2` en float32. La entrada es estática 1x3x640x640 en BGR con redimensionado que preserva la relación de aspecto y relleno de valor [114, 114, 114].

## Capacidades

- Detección de instancias de personas en imágenes: devuelve cajas `dets` con formato `[1, n, 5]` (x1, y1, x2, y2, score) y etiquetas `labels` `[1, n]` siempre iguales a 0 (persona).
- Segmentación de instancias de personas: devuelve máscaras `masks` `[1, n, 80, 80]` como logits a 1/8 de la resolución de entrada, que el consumidor debe pasar por sigmoide y reescalar.
- Límite de detecciones: n ≤ 20 por fotograma tras las modificaciones del grafo.
- Inferencia en navegador: pensado para ONNX Runtime Web con WebGPU; el fichero fp16 requiere soporte de `shader-f16`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola pasada.
- No detecta otras clases de COCO distintas de persona.

## Casos de uso

- Edición de vídeo en el navegador: el editor VEC usa el modelo para localizar personas en fotogramas y aplicar recortes, seguimiento o desenfoques sin subir el vídeo a un servidor, gracias a sus 22-43 MB y a la inferencia vía WebGPU.
- Difuminado de caras o cuerpos por privacidad: dado que devuelve máscaras de persona a 80x80 logits, se pueden aplicar desenfoques selectivos sobre las regiones segmentadas antes de publicar un vídeo.
- Recorte automático o reencuadre inteligente: las cajas `dets` permiten calcular el bounding box de la persona y recentrar el encuadre en formatos verticales u horizontales.
- Segmentación de primer plano para fondos virtuales: las máscaras de persona permiten separar sujeto y fondo en aplicaciones de videollamada o retransmisión en el navegador.
- Análisis de presencia en vídeo: conteo de personas por fotograma (hasta 20 simultáneas) para métricas de audiencia o señalización de contenido.
- Preprocesado en pipelines de visión: uso como etapa rápida de detección/segmentación de personas antes de modelos más pesados (reconocimiento de pose, reidentificación) que solo se ejecutan sobre los recortes.
- Prototipado de demos web sin backend: al ser ONNX y funcionar con ONNX Runtime Web, se puede integrar en una página estática sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los ficheros (43 MB fp32, 22 MB fp16) el modelo cabe holgadamente en cualquier GPU consumer, e incluso en memoria compartida de iGPU.
- GPU recomendadas: cualquier GPU con soporte WebGPU y, para el fichero fp16, con soporte de `shader-f16`; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Cabe en GPU consumer: sí, por tamaño; la limitación real es el soporte de WebGPU/`shader-f16` del navegador y del dispositivo.
- Opciones de despliegue: ONNX Runtime Web (WebGPU) según la model card; también es desplegable con ONNX Runtime nativo u otros runtimes compatibles con ONNX, aunque no se documentan en la ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Clases | Formato | Licencia |
|---|---|---|---|---|---|
| OscarEspana/vec-rtmdet-ligero | no disponible (RTMDet-Ins s) | 1x3x640x640 | solo persona | ONNX fp32/fp16 | Apache 2.0 |
| tori29umai/rtmdet-ins-onnx-person-masks (base) | no disponible (RTMDet-Ins s) | 1x3x640x640 | persona (máscaras) | ONNX | Apache 2.0 |
| RTMDet-Ins s original (MMDetection) | no disponible (variante s) | 640x640 | 80 clases COCO | PyTorch / ONNX vía MMDeploy | Apache 2.0 |

La comparativa se limita a la cadena de derivación del propio modelo; no se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo detecta la clase persona (clase 0 de COCO); cualquier otro objeto se ignora.
- Máximo de 20 detecciones por imagen tras las modificaciones del grafo; escenas con más personas quedarán truncadas.
- Las máscaras se entregan como logits de 80x80 sin sigmoide ni reescalado: el consumidor debe aplicar sigmoide y redimensionar a la resolución original.
- Entrada estática 1x3x640x640 en BGR con redimensionado que preserva aspecto y relleno [114, 114, 114]; desviarse de ese preprocesado degrada los resultados.
- El fichero fp16 requiere soporte de `shader-f16` en el entorno de ejecución (WebGPU); sin él debe usarse el fp32.
- Riesgo de falsos positivos y negativos inherente a un detector small entrenado en COCO; los umbrales de NMS (score 0.2, IoU 0.6) están fijados en el grafo y no se exponen como parámetros.
- No se documentan sesgos específicos, pero al derivar de COCO hereda los sesgos de representación de ese dataset.
- Licencia Apache 2.0 permite uso comercial; se debe conservar `LICENSE` y `NOTICE` y la atribución a OpenMMLab y a tori29umai. El modelo se distribuye "AS IS" y no está afiliado ni respaldado por OpenMMLab ni por tori29umai.

## Enlaces

- HuggingFace: https://huggingface.co/OscarEspana/vec-rtmdet-ligero
- Modelo base (ONNX convertido): https://huggingface.co/tori29umai/rtmdet-ins-onnx-person-masks
- MMDetection: https://github.com/open-mmlab/mmdetection
- MMDeploy: https://github.com/open-mmlab/mmdeploy
- COCO 2017: https://cocodataset.org/
