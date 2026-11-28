# Porameht/thai-license-plate-dfine-s

## Resumen

El modelo `Porameht/thai-license-plate-dfine-s` es un detector de objetos de una sola clase especializado en matrículas de vehículos, con especial atención a las matrículas tailandesas. Lo desarrolla el usuario Porameht como un fine-tune directo del detector generalista `ustc-community/dfine-small-coco`, sin destilación ni pseudoetiquetas, sobre cajas anotadas manualmente. Su propósito declarado es la redacción de vídeo mediante desenfoque de matrículas, un caso de uso con implicaciones claras de privacidad.

El modelo se distribuye en dos etapas dentro del repositorio: `stage_b/best` (modelo final, entrenado primero con matrículas genéricas y luego con matrículas tailandesas y negativos duros) y `stage_a/best` (solo tras la etapa genérica). Se apoya en la arquitectura D-FINE, un detector transformer con distribución de refinamiento, y se publica bajo licencia Apache 2.0, lo que permite uso comercial. El repositorio ocupa aproximadamente 0,1 GB en formato safetensors y es compatible con la librería `transformers`.

Es relevante ahora porque aborda un nicho poco cubierto (matrículas tailandesas y del sudeste asiático) con datos de entrenamiento cuya procedencia y licencia se documentan explícitamente. No obstante, el propio autor advierte que, a fecha de la publicación, el modelo no se recomienda todavía para redacción de vídeo en producción: en su prueba de fugas sobre 7 clips deja más matrículas nítidas que el modelo anterior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | D-FINE (detector transformer con distribución de refinamiento), fine-tune de `ustc-community/dfine-small-coco` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión para detección de objetos) |
| Tipos de cuantización | no disponible (se cita ejecución en fp16 en los benchmarks) |
| Idiomas soportados | no disponible (modelo visual; orientado a matrículas tailandesas y genéricas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del detector D-FINE-S (`ustc-community/dfine-small-coco`), una familia de detectores basados en transformer que refinan las predicciones mediante distribución de cajas. Se entrenó en dos etapas: 10 épocas sobre matrículas genéricas y 5 épocas adicionales sobre matrículas tailandesas y negativos duros, con batch 16, AdamW con learning rate 1e-4 y 1e-5 para el backbone. No se empleó destilación ni pseudoetiquetas; todas las cajas son anotaciones humanas.

Los datos de entrenamiento suman aproximadamente 27 326 imágenes de CCPD, 6 176 de `keremberke/license-plate-object-detection` (mayoritariamente Open Images), 5 761 de Roboflow Universe (training-101, matrículas tailandesas), 3 000 sintéticas (recortes de matrículas deformados sobre esquinas de CCPD) y 2 000 negativos duros de Open Images V7 (señales, edificios y carteles sin vehículo). Se aplicó deduplicación por md5 contra todos los conjuntos de test. El modelo anterior se había entrenado además con NightLPBD, que aquí se omite deliberadamente.

## Capacidades

- Detección de matrículas de vehículos en imágenes, con una única clase de salida.
- Especialización en matrículas tailandesas, incluidas matrículas de papel sostenidas frente a cámara (con rendimiento limitado).
- Detección de matrículas genéricas (europeas, chinas y de otros orígenes) gracias a la etapa genérica previa.
- Funcionamiento sobre fotogramas de 1080p procesados como fotograma completo más recortes de 640 px con solapamiento de 0,25 y umbral 0,25.
- Integración con `transformers` mediante `AutoImageProcessor` y `AutoModelForObjectDetection`.
- Salida de cajas delimitadoras apta para pipelines de desenfoque o redacción.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de lenguaje: es exclusivamente un modelo de visión.

## Casos de uso

- Redacción de matrículas en vídeo de tráfico urbano: el modelo detecta matrículas en fotogramas de 1080p y permite aplicar desenfoque antes de publicar material de cámaras de vigilancia o dashcams. Adecuado por su especialización en matrículas tailandesas, aunque el autor advierte de fugas en vídeo.
- Anonimización de datasets de vídeo para investigación: permite generar versiones con matrículas difuminadas de grabaciones de tráfico en Bangkok o Chiang Mai antes de compartirlas con terceros.
- Procesamiento de imágenes de tráfico para análisis de movilidad: detección de vehículos con matrícula visible en estudios de aforo, sin necesidad de leer el texto de la matrícula.
- Moderación de contenido en plataformas que reciben imágenes de vehículos: filtrado previo para desenfocar matrículas antes de la publicación.
- Evaluación comparativa de detectores de matrículas: el repositorio incluye anotaciones de test (`data/benches/`) y scripts de evaluación que permiten reproducir los AP50 publicados frente a RT-DETRv2 y otras variantes.
- Investigación en detección de matrículas tailandesas: el modelo sirve como punto de partida para fine-tunes posteriores con datos propios, dado que la licencia Apache 2.0 lo permite.
- Integración en pipelines de privacidad para flotas de vehículos: procesamiento en local de grabaciones de dashcam antes de subirlas a la nube.

## Benchmarks y rendimiento

AP50 (%) con umbral 0,25, fotograma completo más recortes de 640 px, fp16, RTX 4090 (2026-11-28). Todos los modelos evaluados con el mismo código.

| Conjunto de test | Imágenes / matrículas | Este modelo | D-FINE-S Thai anterior | Este modelo, solo etapa A | RT-DETRv2 R50 |
|---|---|---|---|---|---|
| Thai street, Bangkok 4K | 153 / 515 | 48,9 | 49,4 | 20,7 | 25,6 |
| Thai cars, close | 98 / 109 | 96,7 | 96,2 | 88,9 | 87,6 |
| Thai paper plates (webcam) | 46 / 46 | 63,3 | 69,0 | 78,7 | 87,7 |
| Thai plate crops, rf101 valid+test* | 2436 / 2584 | 94,7 | 94,1 | 46,7 | 49,1 |
| PP4AV, conducción europea | 3203 / 7787 | 59,4 | 71,7 | 52,4 | 37,9 |
| kbtest (keremberke test)* | 882 / 902 | 98,4 | 88,0 | 98,5 | 98,2 |
| CCPD hard splits* | 2100 / 2100 | 98,1 | 97,4 | 99,3 | — |

*Los datos de entrenamiento provienen de la misma fuente (imágenes distintas, verificadas por md5), por lo que estos resultados son optimistas. Los conjuntos cytron, ga y PP4AV no se usaron en entrenamiento. Los conjuntos pequeños (46-153 imágenes) tienen diferencias de pocos puntos dentro del ruido.

Prueba de fugas en vídeo (7 clips públicos, pipeline BLUR v7, detector oráculo independiente YOLOv9-s; menor es mejor):

| Clip | Fotogramas con matrícula | Este modelo | D-FINE-S Thai anterior |
|---|---|---|---|
| Bangkok traffic | 1093 | 277 | 181 |
| Bangkok Sukhumvit | 917 | 64 | 72 |
| Chiang Mai tuk-tuks / motorcycles | 1703 | 270 | 83 |
| Chiang Mai intersection | 876 | 95 | 38 |
| India riders | 1628 | 320 | 234 |
| India metro | 689 | 63 | 81 |
| Guyana dashcam | 1289 | 162 | 121 |
| **Total** | **8195** | **1251 (15,3 %)** | **810 (9,9 %)** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; al ser un D-FINE-S de tamaño pequeño (repo de 0,1 GB en safetensors) y ejecutarse en fp16, cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 4090 para los benchmarks publicados; cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores.
- Opciones de despliegue: `transformers` (con `AutoImageProcessor` y `AutoModelForObjectDetection`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Latencia y throughput: no disponible; los benchmarks se ejecutaron en RTX 4090 en fp16 sin cifras de latencia por fotograma.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | AP50 (Bangkok 4K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Este modelo** (stage_b) | D-FINE-S | no disponible | no aplica | 48,9 | Apache 2.0 | Hugging Face |
| D-FINE-S Thai anterior | D-FINE-S | no disponible | no aplica | 49,4 | no disponible | no disponible |
| RT-DETRv2 R50 `justjuu/rtdetr-v2-license-plate-detection` | RT-DETRv2 | no disponible | no aplica | 25,6 | no disponible | Hugging Face |
| `ustc-community/dfine-small-coco` (base) | D-FINE-S | no disponible | no aplica | no evaluado en matrículas | no disponible | Hugging Face |

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo **no se recomienda todavía para redacción de vídeo**: en la prueba de fugas deja 1251 fotogramas con matrícula nítida (15,3 %) frente a 810 (9,9 %) del modelo anterior.
- Puntos débiles conocidos: matrículas pequeñas y lejanas (PP4AV está 12 puntos por debajo del modelo anterior, que se entrenó con 3000 matrículas sintéticas pequeñas) y matrículas de papel grandes sostenidas cerca de la cámara.
- Riesgo de falsos negativos en vídeo: las tasas de fuga son cotas inferiores, ya que las matrículas que el detector oráculo no ve no se contabilizan.
- Los resultados en kbtest, rf101 y CCPD son optimistas porque los datos de entrenamiento comparten fuente (aunque no imágenes).
- Sesgos potenciales derivados del desequilibrio del dataset: sobrerrepresentación de matrículas chinas (CCPD) y tailandesas, menor cobertura de otras regiones.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento tienen licencias variadas (MIT, CC BY 4.0, CC BY 2.0); el autor afirma que todas permiten uso comercial. PP4AV (CC BY-NC-ND 4.0) se usó solo para evaluación y no se redistribuye.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni generación de texto.
- No se han documentado sesgos demográficos ni de otro tipo más allá de los derivados de la composición del dataset.

## Enlaces

- [Hugging Face: Porameht/thai-license-plate-dfine-s](https://huggingface.co/Porameht/thai-license-plate-dfine-s)
- [Modelo base: ustc-community/dfine-small-coco](https://huggingface.co/ustc-community/dfine-small-coco)
- [Dataset: keremberke/license-plate-object-detection](https://huggingface.co/datasets/keremberke/license-plate-object-detection)
- [Roboflow Universe: training-101 "License Plate"](https://universe.roboflow.com/training-101/license-plate-eql7j-nskv2)
- [Roboflow Universe: TH Support Cytron, Thai License Plate Detector](https://universe.roboflow.com/th-support-cytron-yvkeg/thai-license-plate-detector)
- [Roboflow Universe: TH Support Cytron, Thai License Plate Detector -2](https://universe.roboflow.com/th-support-cytron-yvkeg/thai-license-plate-detector-2)
- [Roboflow Universe: ga / THAI_LICENSE_PLATE](https://universe.roboflow.com/ga/thai_license_plate-5x58x)
- [Open Images V7](https://storage.googleapis.com/openimages/web/index.html)
- [Dataset PP4AV (evaluación)](https://huggingface.co/datasets/khaclinh/pp4av)
- [Paper CCPD (Xu et al., ECCV 2018)](https://arxiv.org/abs/1804.05027)
