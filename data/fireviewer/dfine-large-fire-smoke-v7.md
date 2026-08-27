# fireviewer/dfine-large-fire-smoke-v7

## Resumen

FireViewer D-FINE Large V7 es un detector de objetos de dos clases (fuego y humo) desarrollado por el usuario fireviewer, basado en el modelo D-FINE Large (arquitectura HGNetv2-L) y fine-tuned con DEIM (DETR with Improved Matching) para la plataforma FireViewer. Se distribuye como un checkpoint experimental con pesos EMA evaluados, un runtime de inferencia nativo y un benchmark externo contra dos modelos de referencia congelados. El modelo tiene 31,2 millones de parámetros y un tamaño de pesos de 125 MB, y está pensado para tareas de detección de incendios y humo en imágenes, aunque su estado es experimental y no está listo para uso en producción o emergencias.

La relevancia de este modelo radica en su enfoque especializado y en la transparencia de su publicación: incluye verificación de exportación, hashes de integridad y un informe de evaluación detallado. Sin embargo, sus métricas en el conjunto de validación Home-Fire (mAP50:95 de 0,2859, recall de 0,4349) no alcanzan el umbral mínimo de recall de 0,50, y el corpus de evaluación es limitado (212 imágenes, solo 12 negativas). Por tanto, se recomienda únicamente para investigación, prototipos y evaluación comparativa, no como base para sistemas de alerta o seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE Large (HGNetv2-L backbone) con DEIM |
| Parametros totales | 31.255.332 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible (se menciona BF16 para inferencia en GPU, FP32 para CPU) |
| Idiomas soportados | No aplica (modelo de vision; etiquetas en ingles) |
| Licencia | fireviewer-component-and-source-terms (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en D-FINE Large, una variante de la familia RT-DETR con backbone HGNetv2-L, y se fine-tunea con DEIM (DETR with Improved Matching) sobre el checkpoint preentrenado DEIM D-FINE HGNetv2-L COCO 50e. El entrenamiento se realizó sobre un corpus seleccionado de 5000 imágenes (4002 de entrenamiento, 486 de validación, 512 de test interno) durante 40 épocas a resolución 704x704, con semilla 42. Se reanudó desde una etapa previa con micro-batch 2, acumulación de gradientes 8 y batch efectivo 16. El checkpoint publicado corresponde a la rama EMA de la mejor etapa (best_stg2.pth), no al estado final del optimizador.

No se aplicaron técnicas de RLHF o DPO, ya que es un modelo de visión. La innovación principal es el uso de DEIM para mejorar el matching entre predicciones y objetos reales, junto con la publicación de un runtime nativo autocontenido que verifica hashes antes de cargar y no requiere descargas adicionales de backbones ni tokens de Hugging Face. La inferencia se realiza a 704x704 sin letterboxing ni normalización media/desviación, y la salida incluye hasta 100 cajas con confianza >= 0,5.

## Capacidades

- Deteccion de objetos de dos clases: fuego (clase 0) y humo (clase 1), devolviendo bounding boxes en coordenadas de píxeles de la imagen original.
- Inferencia nativa mediante el script `fireviewer_inference.py` incluido, con soporte para GPU (CUDA) y CPU (fallback).
- Verificacion de integridad de pesos y configuracion antes de cargar el modelo.
- Salida ordenada por confianza, con umbral configurable (por defecto 0,5).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.
- No incluye modo de pensamiento ni procesamiento de audio o video; solo imágenes fijas.

## Casos de uso

- Investigacion academica en deteccion de incendios: el modelo puede utilizarse como punto de partida para estudiar tecnicas de fine-tuning con DEIM y comparar arquitecturas de deteccion en el dominio del fuego y humo, gracias a su documentacion detallada y verificacion de exportacion.
- Prototipos de sistemas de vigilancia con camaras fijas: dado su tamano reducido (125 MB) y su runtime nativo, puede integrarse en prototipos de software para monitorizacion de imagenes estaticas o flujos de video de baja frecuencia, siempre que se asuma su naturaleza experimental.
- Evaluacion comparativa de detectores de incendios: el benchmark publicado contra YOLO26m y YOLOv8n permite reproducir comparaciones y ampliarlas con otros modelos, aunque la comparacion no es controlada (diferentes resoluciones y precisiones).
- Pruebas de concepto para integracion en drones: su capacidad de inferencia en GPU consumer (probado en RTX 5070 Ti) lo hace viable para pruebas de concepto en plataformas embebidas o de bajo consumo, aunque no se recomienda para misiones reales.
- Analisis de imagenes aereas o satelitales en entornos de investigacion: puede aplicarse a conjuntos de datos de incendios forestales para explorar la deteccion de humo y fuego en imagenes de alta resolucion, con la salvedad de que el recall es bajo.
- Desarrollo de herramientas de anotacion asistida: el modelo puede pre-anotar imagenes para acelerar la creacion de datasets de incendios, siempre que un humano revise las detecciones debido a las falsas alarmas observadas.

## Benchmarks y rendimiento

La model card incluye una evaluacion sobre un holdout seleccionado de 212 imagenes del dataset Home-Fire, comparando con dos modelos de referencia congelados. Los resultados se resumen en la siguiente tabla (mismos imagenes y anotaciones, umbral de confianza 0,5, IoU 0,5; AP usa confianza candidata 0,05):

| Modelo | AP50 | AP75 | mAP50:95 | Precision | Recall | F1 | Negative FP |
|---|---:|---:|---:|---:|---:|---:|---:|
| D-FINE Large FireViewer V7 | 0,4996 | 0,2798 | 0,2859 | 0,7178 | 0,4349 | 0,5417 | 0,0833 |
| YOLO26m UAV Fire/Smoke | 0,1156 | 0,0310 | 0,0482 | 0,6250 | 0,0929 | 0,1618 | 0,0833 |
| YOLOv8n D-Fire Reference | 0,1119 | 0,0331 | 0,0491 | 0,7333 | 0,0818 | 0,1472 | 0,0000 |

Nota: V7 se evaluo a 704 píxeles en BF16, mientras que las referencias se evaluaron a 640 píxeles en FP16, por lo que la comparacion no es un control arquitectonico estricto. El recall de V7 no alcanza el minimo de 0,50 exigido para una validacion de soporte. La latencia se midio en una sola imagen, no como rendimiento de extremo a extremo.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM. El modelo tiene 31,2 M de parametros y un peso de 125 MB, por lo que es probable que quepa en GPUs consumer con al menos 4 GB de VRAM, pero no hay datos confirmados.
- Probado en RTX 5070 Ti con CUDA 12.8, torch 2.11.0 y torchvision 0.26.0, segun la model card.
- Soporta CPU fallback con precision FP32, aunque no se ha medido su rendimiento en CPU.
- Opciones de despliegue: runtime nativo incluido (`fireviewer_inference.py`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- No es compatible con Transformers AutoModel; requiere el runtime DEIM incluido.

## Comparativa con modelos similares

La tabla de benchmarks anterior ya compara con dos modelos de la misma categoria (deteccion de fuego y humo). Ademas, existe un modelo hermano `fireviewer/dfine-xlarge-fire-smoke` en Hugging Face, pero no se dispone de detalles sobre sus especificaciones o rendimiento. No se han encontrado otros modelos comparables con datos publicos en la informacion disponible.

| Modelo | Parametros | Resolucion | mAP50:95 | Licencia |
|---|---:|---:|---:|---|
| D-FINE Large FireViewer V7 | 31,2 M | 704 | 0,2859 | fireviewer-component-and-source-terms |
| YOLO26m UAV Fire/Smoke | No disponible | 640 | 0,0482 | No disponible |
| YOLOv8n D-Fire Reference | No disponible | 640 | 0,0491 | No disponible |

## Limitaciones y advertencias

- Estado experimental: no esta listo para produccion, alertas de emergencia, extincion autonoma o decisiones criticas de seguridad.
- Recall bajo (0,4349) que no alcanza el minimo de 0,50, lo que implica que muchas detecciones reales se pierden.
- Corpus de evaluacion limitado: solo 212 imagenes, de las cuales 12 son negativas, y sin IDs de eventos independientes verificados.
- Falsas alarmas: con compresion JPEG50 se observan 3/12 falsos positivos en imagenes negativas.
- Licencia restrictiva: la licencia `fireviewer-component-and-source-terms` no concede automaticamente derechos de uso comercial; es necesario leer el aviso de licencia antes de cualquier reutilizacion.
- No es compatible con Transformers AutoModel; requiere el runtime nativo incluido.
- La comparacion con modelos de referencia no es controlada (diferentes resoluciones y precisiones), por lo que las diferencias de rendimiento no son concluyentes.
- No se redistribuyen las imagenes ni anotaciones del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/dfine-large-fire-smoke-v7
- Aviso de licencia: https://huggingface.co/fireviewer/dfine-large-fire-smoke-v7/blob/main/LICENSE_NOTICE.md
- Repositorio GitHub de fireviewer/models: https://github.com/fireviewer/models
- Modelo hermano (xlarge): https://huggingface.co/fireviewer/dfine-xlarge-fire-smoke
- Informe de benchmark (referenciado en la model card): https://huggingface.co/fireviewer/dfine-large-fire-smoke-v7/blob/main/benchmarks/homefire/report.md
