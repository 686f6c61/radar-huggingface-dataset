# Georgeemannuel007/javali-detech-yolov8s

## Resumen

Javali Detech YOLOv8s es un detector de objetos de clase única especializado en la identificación de jabalí y jabalí híbrido asilvestrado (*Sus scrofa*) en imágenes de trampa cámara y fotografías de campo. Lo desarrolla George Emannuel Guedes de Carvalho en el Laboratorio Inovisão de la Universidade Católica Dom Bosco (UCDB), en Campo Grande (Mato Grosso do Sul, Brasil), con la orientación del profesor Alan Rios Bezerra y apoyo del programa PIBIC/Fundect. El modelo parte de los pesos `yolov8s.pt` preentrenados en COCO y aplica transfer learning sobre un conjunto propio de 252 imágenes con 481 animales anotados, procedentes de registros de GBIF/iNaturalist bajo licencias Creative Commons, fotos de campo y material cedido por socios institucionales.

El problema que aborda es concreto: la detección y el conteo automatizado de una especie invasora en un contexto de gestión cinegética y monitorización ecológica. Con solo 22 MB de pesos, el modelo se posiciona como una alternativa ligera a detectores más pesados (DETR, Faster R-CNN) para desplegarse en campo. La validación se realizó con validación cruzada de 5 pliegues y un conjunto de test separado de aproximadamente 50 imágenes por pliegue.

Es relevante ahora porque demuestra que un YOLOv8s pequeño, entrenado con pocos datos y técnicas de aumento agresivas, alcanza un rendimiento estadísticamente comparable a DETR en mAP@50-95 y precisión, con una correlación de conteo por imagen de 0,942 y un coste computacional muy inferior. Es, además, un ejemplo de modelo de dominio muy específico (fauna invasora en el Cerrado brasileño) publicado con artefactos reproducibles: pesos por pliegue, hiperparámetros y curvas de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8s (Ultralytics), detector de una etapa tipo anchor-free con backbone CSPDarknet y cabeza desacoplada |
| Parámetros totales | no disponible (repo de 0,1 GB; pesos `best.pt` de 22 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen a 640 px) |
| Tipos de cuantización | no disponible (solo se distribuyen pesos PyTorch `.pt`; no se documentan exportaciones ONNX, TensorRT ni INT8) |
| Idiomas soportados | pt, en (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | AGPL-3.0, heredada de Ultralytics YOLOv8 al derivar de `yolov8s.pt` |
| Formato de pesos | PyTorch `.pt` (Ultralytics 8.2.87); `best.pt` principal y `folds/fold_N/best.pt` por pliegue |

## Arquitectura y entrenamiento

Se trata de un YOLOv8s estándar de Ultralytics, preentrenado en COCO y ajustado por transfer learning para una única clase (`Javali`). El entrenamiento se hizo a 640 px de resolución con batch de 8, optimizador AdamW (lr0 = 1e-4 con decaimiento coseno) y hasta 1000 épocas con early stopping (paciencia 100); la convergencia se produjo entre las épocas 152 y 251. El aumento de datos incluyó mosaic, volteo horizontal, variaciones HSV, traslación y escala, RandAugment y random erasing, una combinación pensada para compensar el tamaño reducido del conjunto.

La validación es uno de los puntos metodológicamente más cuidados del proyecto: validación cruzada de 5 pliegues, con cada pliegue evaluado sobre aproximadamente 50 imágenes nunca vistas durante el entrenamiento, y un total de 252 imágenes y 481 animales anotados. Los autores distinguen explícitamente las métricas de validación usadas para el early stopping (mAP@50 de 0,89–0,95, infladas por selección) de las métricas sobre el conjunto de test separado, que son las que deben citarse. El repositorio incluye los hiperparámetros exactos (`args.yaml`) y las curvas de entrenamiento (`results.csv`) de cada pliegue, además de las métricas de test por pliegue y por modelo (`cv_metrics.csv`) y el conteo real frente al predicho por imagen (`counting.csv`).

## Capacidades

- Detección de objetos de clase única: localiza jabalí y jabalí híbrido (*Sus scrofa*) con cajas delimitadoras y puntuaciones de confianza.
- Conteo por imagen: el número de cajas predichas se correlaciona con el número real de animales (r de Pearson = 0,942 ± 0,009 en test).
- Funcionamiento sobre imágenes de trampa cámara y fotografías de campo en condiciones diurnas.
- Umbral de confianza configurable en inferencia (`conf=0.25` en el ejemplo de la model card).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni procesamiento de texto.
- No dispone de modo thinking, visión general, audio ni capacidades multimodales más allá de la detección visual.
- Capacidades multilingües limitadas a la documentación en portugués e inglés; no hay procesamiento de lenguaje.

## Casos de uso

- Monitorización de fauna invasora con trampas cámara: procesar lotes de imágenes de campo para cuantificar la presencia de *Sus scrofa* por ubicación y periodo, aprovechando la correlación de conteo (r = 0,942) para estimaciones de abundancia relativa.
- Gestión cinegética y control poblacional: filtrar automáticamente miles de capturas y priorizar las imágenes con detecciones para revisión humana, reduciendo el trabajo manual de revisión previa a cualquier acción de control.
- Investigación ecológica en el Cerrado: generar series temporales de detecciones para estudiar patrones de actividad y distribución de la especie en Mato Grosso do Sul, con los pesos por pliegue disponibles para análisis de incertidumbre.
- Despliegue en dispositivos de borde: con 22 MB de pesos y arquitectura YOLOv8s, es viable en hardware modesto (Jetson, mini-PC o incluso Raspberry Pi con aceleración), lo que permite inferencia local en estaciones de campo sin conectividad.
- Docencia y reproducibilidad metodológica: el repositorio sirve como ejemplo completo de validación cruzada de 5 pliegues en detección de objetos, con hiperparámetros, curvas y métricas de test separadas de las de validación.
- Filtrado previo en pipelines de anotación: usar el detector como preetiquetador para acelerar el etiquetado de nuevas imágenes de la misma especie y región, revisando después las cajas propuestas.
- Comparación de arquitecturas en dominios con pocos datos: el material publicado permite reproducir la comparación YOLOv8s frente a DETR y Faster R-CNN en el mismo esquema de validación.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test separado, media ± desviación de los 5 pliegues (no verificados de forma independiente; `verified: false` en el model-index):

| Modelo | mAP@50-95 | mAP@50 | mAP@75 | Precisión | Revocación | F1 | MAE conteo | r conteo |
|---|---|---|---|---|---|---|---|---|
| YOLOv8s (este modelo) | 0,396 ± 0,035 | 0,579 ± 0,048 | 0,462 ± 0,053 | 0,794 ± 0,041 | 0,726 ± 0,035 | 0,758 ± 0,032 | 0,53 ± 0,18 | 0,942 ± 0,009 |
| DETR | 0,405 ± 0,054 | 0,641 ± 0,043 | 0,444 ± 0,072 | 0,800 ± 0,026 | 0,765 ± 0,044 | 0,782 ± 0,025 | 0,52 ± 0,16 | 0,926 ± 0,020 |
| Faster R-CNN | 0,152 ± 0,029 | 0,413 ± 0,039 | 0,044 ± 0,028 | 0,160 ± 0,046 | 0,772 ± 0,052 | 0,262 ± 0,064 | 7,69 ± 3,04 | 0,797 ± 0,072 |

El autor señala que YOLOv8s queda estadísticamente empatado con DETR en mAP@50-95, precisión y conteo, siendo aproximadamente 7 veces menor (22 MB frente a 166 MB) y más rápido. Faster R-CNN, entrenado en los mismos pliegues, produjo numerosos falsos positivos (precisión de 0,16). Las métricas de validación usadas para early stopping (mAP@50 de 0,89–0,95) no deben citarse como rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de YOLOv8s (22 MB de pesos) la inferencia a 640 px cabe holgadamente en GPUs de consumo con 4 GB o menos.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizó en un servidor del Laboratorio Inovisão sin detallar el modelo de GPU.
- GPU de consumo: sí cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU o CPU para inferencia puntual.
- Opciones de despliegue: Ultralytics (Python) es la vía documentada; el autor no publica exportaciones a ONNX, TensorRT, OpenVINO ni formatos para llama.cpp u Ollama (no aplicables a un detector). vLLM y TGI no son aplicables.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de pesos | mAP@50-95 (test) | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLOv8s (este modelo) | Detector de una etapa | 22 MB | 0,396 | 0,794 | AGPL-3.0 | Hugging Face (`Georgeemannuel007/javali-detech-yolov8s`) |
| DETR | Transformer detector | 166 MB | 0,405 | 0,800 | no disponible en la información | Entrenado por los autores en los mismos pliegues; no se indica publicación |
| Faster R-CNN | Detector de dos etapas | no disponible | 0,152 | 0,160 | no disponible en la información | Entrenado por los autores en los mismos pliegues; no se indica publicación |
| YOLOv8s COCO (base) | Detector de una etapa, 80 clases | ~22 MB | no comparable (otro dominio y taxonomía) | no disponible | AGPL-3.0 | Ultralytics |

## Limitaciones y advertencias

- Base de datos pequeña (252 imágenes, 481 animales): el rendimiento puede degradarse en trampas cámara de otros biomas, con visión nocturna infrarroja o con animales parcialmente ocultos.
- Clase única: el modelo no distingue jabalí de especies nativas protegidas como el cateto (*Pecari tajacu*) o el pecarí de labios blancos (*Tayassu pecari*). Antes de cualquier uso en manejo o control, es obligatorio validar los falsos positivos en esas especies y mantener revisión humana.
- Riesgo de alucinación en sentido amplio: falsos positivos sobre otras especies o sobre objetos del entorno; el autor advierte explícitamente de no usar las detecciones como única base para sacrificios u otras acciones irreversibles.
- Sesgo geográfico: entrenado con imágenes de Mato Grosso do Sul (Brasil); la generalización a otras regiones no está evaluada.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código que use el modelo en servicios de red; conviene revisar la compatibilidad con productos comerciales cerrados.
- El conjunto de datos no se distribuye por restricciones de licencia de las fuentes (GBIF/iNaturalist, fotos de campo y material de socios), lo que limita la reproducibilidad completa del entrenamiento.
- Métricas no verificadas de forma independiente (`verified: false` en el model-index); las cifras de validación (mAP@50 de 0,89–0,95) no deben citarse como rendimiento real.
- No hay información sobre cuantización, exportación a otros formatos ni latencia, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Georgeemannuel007/javali-detech-yolov8s
- Ultralytics YOLOv8 (framework y pesos base): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com/
- Repositorio de la librería `ultralytics` en PyPI: https://pypi.org/project/ultralytics/
- GBIF (fuente de registros de biodiversidad): https://www.gbif.org/
- iNaturalist (fuente de imágenes bajo licencias Creative Commons): https://www.inaturalist.org/
- Universidade Católica Dom Bosco (UCDB): https://www.ucdb.br/
- No se han encontrado en la información proporcionada enlaces a paper, blog, demo o repositorio adicionales del proyecto.
