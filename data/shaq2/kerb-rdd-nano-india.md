# Shaq2/kerb-rdd-nano-india

## Resumen

kerb-rdd-nano-india es un modelo de deteccion de objetos basado en RF-DETR Nano, especializado en la deteccion de danos en la carretera (grietas, baches y defectos superficiales similares) sobre imagenes del conjunto de datos RDD2022. Lo desarrolla el usuario Shaq2 y forma parte de una familia de variantes regionales: este checkpoint concreto es la version adaptada a India, obtenida por fine-tuning a partir de `Shaq2/kerb-rdd-nano` (la variante "campeona" para Japon) sobre 1000 imagenes de India excluidas del conjunto dorado de evaluacion.

El modelo se presenta como una solucion de adaptacion regional: en lugar de entrenar un detector generico, el autor entrena variantes por region y las sirve enrutadas por region ("region-routed serving"). Segun la model card, la adaptacion eleva el mAP50 sobre el conjunto dorado de India de 0,2058 a 0,5988 (+0,3930), un salto muy grande que refleja lo especifico del dominio. El modelo se distribuye en formato ONNX y esta pensado para inferencia de deteccion en produccion.

La relevancia practica esta en el caso de uso: mantenimiento de infraestructura viaria y sistemas de inspeccion automatizada de carreteras, donde un detector ligero (Nano) desplegable en hardware modesto puede procesar imagenes de camaras o drones. La licencia CC BY-SA 4.0 y el origen en RDD2022 condicionan su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Nano (transformer detector, familia RF-DETR) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, deteccion de objetos) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no disponible (modelo de vision, sin componente textual) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Nano, un detector de objetos de la familia RF-DETR (Real-Time Detection Transformer), que combina un backbone y un decodificador transformer para prediccion de cajas y clases en una sola pasada. La variante Nano es la de menor coste computacional de la familia, orientada a inferencia en tiempo real. El checkpoint se distribuye en ONNX, lo que facilita el despliegue con runtimes como ONNX Runtime.

El entrenamiento parte del checkpoint `Shaq2/kerb-rdd-nano` (variante entrenada para Japon) y aplica fine-tuning sobre N=1000 imagenes de India excluidas del conjunto dorado de evaluacion, durante 6 epocas con lr=5e-5 y batch de 8, usando rfdetr 1.12.1 sobre Kaggle T4x2. Los datos provienen de RDD2022 (CC BY-SA 4.0), con la particion publicada en `Shaq2/kerb-rdd2022-splits`. El checkpoint fue promovido por un mecanismo denominado "M4 RegionGate", que exige que el mAP regional no empeore mas de 0,5 puntos respecto al campeon, que ninguna clase pierda mas de 2 puntos de recall y que haya al menos 50 cajas doradas por clase. Los veredictos completos estan en `verdicts.json` y la matriz de olvido entre regiones en `metrics.json`.

## Capacidades

- Deteccion de objetos en imagenes de carretera: localizacion y clasificacion de danos superficiales (grietas, baches y clases definidas en RDD2022).
- Salida estandar de deteccion: cajas delimitadoras con clase y puntuacion de confianza.
- Inferencia en tiempo real gracias a la variante Nano y al formato ONNX.
- Adaptacion regional: variante especializada en el dominio visual de carreteras de India.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision.
- Capacidades multilingues: no aplica.

## Casos de uso

- Inspeccion automatizada de carreteras: procesar lotes de imagenes de camaras vehiculares o drones para localizar grietas y baches y priorizar reparaciones; el modelo Nano permite ejecutarlo en hardware modesto.
- Mantenimiento predictivo de infraestructura: integrar las detecciones en un pipeline que agregue danos por tramo de carretera y genere alertas de deterioro.
- Procesamiento en el borde (edge): al distribuirse en ONNX y ser la variante Nano, puede desplegarse en dispositivos con recursos limitados o en vehiculos de inspeccion.
- Enrutado por region en produccion: combinado con otras variantes regionales de la misma familia, sirve como el modelo de India dentro de un sistema que selecciona el checkpoint segun la ubicacion de la imagen.
- Etiquetado asistido y control de calidad: usar las detecciones como preanotaciones para revisores humanos en proyectos de mantenimiento vial.
- Investigacion en adaptacion de dominio: sirve como referencia reproducible de fine-tuning regional con puerta de validacion (RegionGate) y matriz de olvido entre regiones.

## Benchmarks y rendimiento

Datos publicados en la model card (conjunto dorado de India):

| Metrica | Antes (campeon Japon) | Despues (India) | Delta |
|---|---|---|---|
| mAP50 regional (India) | 0,2058 | 0,5988 | +0,3930 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, COCO mAP, etc.) en la informacion disponible. La model card menciona una matriz de olvido entre regiones en `metrics.json`, pero sus valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al tratarse de la variante Nano y distribuirse en ONNX, se espera un consumo bajo, apto para GPU consumer, pero no hay cifras publicadas.
- GPU recomendadas: no disponibles; el entrenamiento se realizo en Kaggle T4x2, lo que sugiere que la inferencia cabe en GPUs de gama media.
- Cabe en GPU consumer: probablemente si, por el tamano del repo (0,2 GB) y la variante Nano, aunque no hay confirmacion explicita.
- Opciones de despliegue: ONNX Runtime (formato nativo del checkpoint); otras opciones (TensorRT, OpenVINO) no estan documentadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| kerb-rdd-nano-india | RF-DETR Nano | no disponible | no aplica | CC BY-SA 4.0 | Variante regional India |
| Shaq2/kerb-rdd-nano | RF-DETR Nano | no disponible | no aplica | no disponible | Variante regional Japon, checkpoint base |
| Otros detectores RDD2022 | no disponible | no disponible | no aplica | no disponible | No hay datos comparativos en la informacion disponible |

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Especializacion regional: el modelo esta ajustado a imagenes de India; su rendimiento en otras regiones puede degradarse (la model card alude a olvido entre regiones y recomienda enrutado por region).
- Riesgo de falsos positivos y negativos en condiciones visuales no cubiertas por RDD2022 (iluminacion, clima, tipo de asfalto, camaras).
- El mAP50 de 0,5988 es moderado: no es un detector de alta precision absoluta y requiere validacion en el dominio de despliegue.
- Sin capacidades de texto, tool calling ni agentes: no es un modelo de lenguaje.
- Licencia CC BY-SA 4.0: impone atribucion y compartir bajo la misma licencia las obras derivadas; revisar implicaciones para uso comercial y para modelos derivados.
- Los datos de entrenamiento provienen de RDD2022, con los sesgos de composicion y geografia de dicho conjunto.
- Sin informacion publicada sobre sesgos especificos, latencia o rendimiento fuera del conjunto dorado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shaq2/kerb-rdd-nano-india
- Checkpoint base (Japon): https://huggingface.co/Shaq2/kerb-rdd-nano
- Particiones de datos RDD2022: https://huggingface.co/datasets/Shaq2/kerb-rdd2022-splits
