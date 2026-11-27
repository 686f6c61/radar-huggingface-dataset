# haiquanli/weed_swin

## Resumen

Weed_swin es un modelo de detección e instanciación de objetos basado en Mask R-CNN con backbone Swin-S, desarrollado por el usuario haiquanli y publicado en Hugging Face. Resuelve un problema concreto de agricultura de precisión: la segmentación de instancias de malas hierbas y cultivos (lechuga, plántula de espinaca y espinaca en crecimiento) en imágenes de campo, una tarea clave para la automatización de labores de escarda selectiva y monitorización de cultivos.

El modelo se distribuye como un export a Hugging Face del framework MMDetection 3.x, con código personalizado (`trust_remote_code=True`) que actúa como puente entre el formato de MMDetection y la API de Transformers. Cuenta con 68,7 millones de parámetros y un tamaño de repositorio de 0,8 GB. Su relevancia actual radica en que ofrece un checkpoint de segmentación de instancias listo para producción en un dominio agrícola específico, con métricas de test publicadas y una licencia MIT permisiva para uso comercial.

A diferencia de los grandes modelos de lenguaje, se trata de un modelo puramente visual, especializado y de tamaño contenido, pensado para inferencia sobre imágenes en entornos con recursos limitados. La model card documenta el proceso de entrenamiento con recortes adaptativos, orden de entrenamiento barajado y repetición de imágenes con balanceo de clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN con backbone Swin-S (Swin Transformer) |
| Parametros totales | 68.761.098 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Detección de objetos y segmentación de instancias |
| Pipeline | object-detection |
| Etiquetas de clase | 0: weed, 1: lettuce, 2: spinach_seedling, 3: spinach_growth |
| Framework de origen | MMDetection 3.x (MMCV 2.1.0, MMEngine 0.10.x) |
| Librería | transformers (con `trust_remote_code=True`) |
| Tamaño del repo | 0,8 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Mask R-CNN, un detector de dos etapas que combina una red troncal (backbone) para extracción de características, una red de propuesta de regiones (RPN) y cabezas de clasificación, regresión de cajas y predicción de máscaras de instancia. El backbone es Swin-S, un transformer jerárquico con atención por ventanas desplazadas que produce representaciones multiescala adecuadas para la detección densa de objetos pequeños, como plántulas y malas hierbas en imágenes de campo.

El entrenamiento se realizó durante 42 épocas con una política de recortes adaptativos (adaptive crops), orden de entrenamiento barajado y repetición de imágenes con balanceo de clases. El checkpoint publicado corresponde a la mejor validación de máscaras, en la época 33. Según la model card, la política combinada de entrenamiento alcanzó un 56,1% de mAP de máscara, frente al 52,9% del modelo de recorte fijo y el 52,1% del modelo solo adaptativo. El autor advierte que los cambios en barajado, muestreo, pesos de pérdida y número de actualizaciones del optimizador se aplicaron conjuntamente, por lo que no se ha aislado la contribución individual de cada uno. Los perfiles de recorte adaptativo se recogen en `crop_profiles.json`, con el tamaño medio de objeto ajustado únicamente sobre fotos de entrenamiento.

## Capacidades

- Detección de objetos con cajas delimitadoras para cuatro clases: mala hierba, lechuga, plántula de espinaca y espinaca en crecimiento.
- Segmentación de instancias con máscaras a resolución completa en las coordenadas de la imagen original.
- Procesamiento de imágenes RGB con preservación de la relación de aspecto y conversión de color entrenada (BGR) realizada por MMDetection.
- Exportación a la API de Transformers mediante un puente de código personalizado (`mmdet-bridge`) que fija todos los ficheros del modelo a un mismo commit del Hub.
- Inferencia con umbral de puntuación configurable (`score_threshold`) y post-procesado de detecciones mediante el procesador de imágenes.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo exclusivamente visual.

## Casos de uso

- Escarda selectiva automatizada: el modelo detecta y segmenta malas hierbas frente a cultivos, permitiendo que un sistema robótico de precisión aplique herbicida o acción mecánica solo sobre las instancias clasificadas como `weed`, reduciendo el uso de insumos.
- Monitorización de nascencia de espinaca: la clase `spinach_seedling` permite contar plántulas por unidad de superficie y evaluar la tasa de emergencia tras la siembra, con máscaras que separan instancias individuales incluso en densidades altas.
- Seguimiento del crecimiento del cultivo: la distinción entre `spinach_seedling` y `spinach_growth` permite clasificar el estado fenológico por parcela y estimar el momento óptimo de cosecha o de intervención agronómica.
- Control de calidad en invernadero de lechuga: la clase `lettuce` alcanza un mAP de máscara del 83,9%, lo que la hace adecuada para inventariar plantas, detectar marras y estimar biomasa en bandas de cultivo.
- Generación de datasets anotados: el modelo puede pre-anotar imágenes nuevas de campo para acelerar el etiquetado humano en pipelines de aprendizaje activo, gracias a la salida de máscaras a resolución completa.
- Integración en plataformas de agricultura de precisión: al exportarse a Transformers con licencia MIT, puede desplegarse en servicios de inferencia sobre imágenes capturadas por drones o cámaras fijas, con un tamaño de 0,8 GB que facilita su distribución.
- Investigación en visión agrícola: sirve como línea base reproducible para comparar políticas de recorte, balanceo de clases y backbone en tareas de segmentación de instancias en cultivos.

## Benchmarks y rendimiento

Resultados medidos en test según la model card (186 imágenes o teselas de test procedentes de 126 fotos originales reservadas, IoUs COCO 0,50:0,05:0,95, umbral de puntuación 0,001, maxDets [1, 10, 100]):

| Metrica | Cajas | Mascaras |
|---|---:|---:|
| mAP@50–95 | 60,5% | 56,1% |
| AP@50 | 79,2% | 79,5% |
| AP@75 | 63,7% | 61,6% |

Desglose por clase:

| Clase | mAP@50–95 cajas | mAP@50–95 mascaras |
|---|---:|---:|
| weed | 53,3% | 47,7% |
| lettuce | 86,7% | 83,9% |
| spinach_seedling | 62,0% | 51,2% |
| spinach_growth | 40,2% | 41,6% |

Comparación interna de políticas de entrenamiento (mAP de máscara):

| Política | mAP mascara |
|---|---:|
| Recorte fijo | 52,9% |
| Solo adaptativo | 52,1% |
| Combinada (modelo actual) | 56,1% |

Los resultados son a nivel de recorte; la inferencia sobre fotos completas en la demo usa una escala de entrada distinta. Los resultados completos están en `evaluation/results.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 68,7 millones de parámetros y pesos en safetensors, el modelo requiere del orden de unos pocos cientos de MB para los pesos, más el consumo de activaciones de Mask R-CNN y Swin-S, que depende de la resolución de entrada.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con suficiente memoria para la resolución de imagen empleada debería poder ejecutarlo.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, pero no confirmada en la documentación.
- Opciones de despliegue: entorno MMDetection 3.x con MMCV 2.1.0, MMEngine 0.10.x, PyTorch, torchvision, transformers y safetensors. La validación del export usó PyTorch 2.4.1 y transformers 4.46.3. El entorno Docker BAT102 existente emplea Python 3.8 y MMDetection 3.x.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado en la información disponible datos de modelos comparables de segmentación de instancias en el dominio agrícola. Como referencia estructural, el modelo se apoya en Swin-S y Mask R-CNN, arquitecturas estándar en detección, pero no se dispone de métricas de terceros para una comparación rigurosa.

| Modelo | Parametros | Contexto | mAP mascara (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| weed_swin | 68,7 M | no aplica | 56,1% | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El rendimiento es desigual por clase: `spinach_growth` obtiene solo un 40,2% de mAP de cajas y un 41,6% de máscara, muy por debajo de `lettuce` (86,7% y 83,9%), lo que limita su fiabilidad en esa clase.
- Los resultados publicados son a nivel de recorte; la inferencia sobre fotos completas en la demo emplea otra escala de entrada, por lo que el rendimiento en producción puede diferir del reportado.
- La selección del perfil de recorte para imágenes nuevas debe hacerse sin usar las etiquetas de verdad fundamental; la demo no elige automáticamente el perfil de origen.
- El modelo requiere `trust_remote_code=True` y un entorno MMDetection 3.x específico, lo que añade complejidad de despliegue y superficie de riesgo al ejecutar código personalizado.
- No se han aislado las contribuciones individuales de las modificaciones de entrenamiento (barajado, muestreo, pesos de pérdida, actualizaciones del optimizador), lo que dificulta la reproducibilidad fina.
- Al ser un modelo de visión especializado en un dominio concreto, no debe esperarse generalización a otras especies, condiciones de iluminación o sensores no representados en el entrenamiento.
- No se documentan sesgos demográficos ni de otro tipo, pero existen sesgos de dominio derivados del conjunto de datos agrícola utilizado.
- Riesgo de alucinación en el sentido de falsos positivos o detecciones espurias con umbrales bajos; se recomienda calibrar el umbral de puntuación en producción.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haiquanli/weed_swin
- Resultados de evaluación: `evaluation/results.json` (incluido en el repositorio del modelo)
- Perfiles de recorte adaptativo: `crop_profiles.json` (incluido en el repositorio del modelo)
- MMDetection: https://github.com/open-mmlab/mmdetection
- MMCV: https://github.com/open-mmlab/mmcv
- MMEngine: https://github.com/open-mmlab/mmengine
- Swin Transformer (paper): https://arxiv.org/abs/2103.14030
- Mask R-CNN (paper): https://arxiv.org/abs/1703.06870
