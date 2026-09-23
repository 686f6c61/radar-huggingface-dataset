# cannj/2026-24679-water-image-automl-classifier

## Resumen

El Water Presence AutoML Classifier es un clasificador binario de imágenes desarrollado por el usuario cannj para la asignatura CMU 24-679 (Homework 2). El modelo recibe una imagen RGB de 224 x 224 píxeles y devuelve una de dos etiquetas: `no_water` (0) o `water` (1), es decir, predice si la escena contiene una masa de agua visiblemente identificable. El repositorio no contiene un modelo entrenado desde cero, sino el mejor predictor seleccionado por una búsqueda AutoML de presupuesto fijo ejecutada con AutoGluon MultiModal sobre el dataset `ssg1/places-water-binary`.

La arquitectura finalmente elegida es una CNN con backbone MobileNetV3-Small 1.0x (`mobilenetv3_small_100`, de la librería TIMM) combinada con el optimizador AdamW, learning rate 1e-4 y weight decay 1e-4. La búsqueda comparó seis configuraciones sobre tres backbones (ResNet-18, MobileNetV3-Small y EfficientNet-B0), con un presupuesto máximo de 1800 segundos y un tiempo total medido de 218,1 segundos. El modelo seleccionado alcanzó una exactitud de validación de 1,0 sobre 5 imágenes y una exactitud de test de 0,6667 sobre 6 imágenes.

Su relevancia es fundamentalmente didáctica y metodológica: ilustra un flujo completo de AutoML con partición consciente del padre de augmentación (`parent_id`) para evitar fuga de datos entre entrenamiento, validación y test. No es un modelo de producción ni está pensado para aplicaciones de seguridad, monitorización medioambiental o respuesta ante emergencias, tal y como advierte explícitamente su propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de clasificación de imágenes; backbone MobileNetV3-Small 1.0x (`mobilenetv3_small_100`, TIMM) sobre AutoGluon MultiModal (AutoMM) |
| Parametros totales | no disponible (no declarado en la model card; la especificación pública de MobileNetV3-Small 1.0x ronda los 2,5 M de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión con entrada fija de 224 x 224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión; no se declaran idiomas y no procesa texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye como predictor de AutoGluon, según `library_name: autogluon`; no se especifica safetensors, GGUF ni ONNX) |
| Tarea | Clasificación binaria de imágenes (`image-classification`) |
| Etiquetas de salida | 0 = `no_water`, 1 = `water` |
| Entrada | Imagen RGB redimensionada a cuadrado, 224 x 224 píxeles |
| Dataset de origen | `ssg1/places-water-binary` |
| Hiperparámetros seleccionados | `mobilenetv3_adamw_lr1e4`: lr 0.0001, optimizador AdamW, weight decay 0.0001 |
| Framework declarado | AutoGluon (librería: `autogluon`) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional para clasificación de imagen única, construida sobre la pila de AutoGluon MultiModal. El backbone es MobileNetV3-Small 1.0x, una arquitectura compacta basada en bloques invertidos con atención por squeeze-and-excitation y activaciones h-swish, pensada para inferencia de bajo coste. La entrada se transforma con el operador `resize_to_square` de AutoGluon y la normalización específica del backbone la gestionan AutoGluon y TIMM. La cabeza de clasificación es binaria.

El proceso de selección fue una búsqueda AutoML de presupuesto fijo (máximo 1800 segundos) que exploró backbone, learning rate, optimizador y weight decay, comparando ResNet-18, MobileNetV3-Small y EfficientNet-B0. Cada trial recibió el mismo presupuesto: 300 segundos máximo, 20 épocas máximo, paciencia de early stopping de 6 comprobaciones de validación, batch size 8 por GPU y semilla aleatoria 24679. Se completaron 6 trials sin fallos en 218,1 segundos medidos. El trial ganador (`mobilenetv3_adamw_lr1e4`) se ajustó en 16 segundos y obtuvo exactitud de validación 1,0 y balanced accuracy de validación 1,0; el criterio primario de selección fue la exactitud de validación, con la balanced accuracy como primer desempate y el tiempo de ajuste como segundo.

El dataset contiene únicamente 34 fotografías originales (17 con agua y 17 sin agua), repartidas en 23 originales de entrenamiento, 5 de validación y 6 de test. El split de entrenamiento se amplió a 391 imágenes mediante aumentación (volteo horizontal, rotación ligera, cambios de brillo y contraste y color jitter), aplicada solo a las imágenes padre de entrenamiento. Los splits de validación y test contienen exclusivamente fotografías originales sin aumentar. La model card documenta la verificación de que los valores de `parent_id` son disjuntos entre splits, lo que evita que una fotografía original y sus versiones aumentadas acaben en particiones distintas. No se declara uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador visual.

## Capacidades

- Clasificación binaria de imágenes en dos clases: `no_water` (0) y `water` (1).
- Detección de presencia de agua superficial visiblemente identificable en una escena fotografiada.
- Inferencia sobre imágenes RGB reescaladas a cuadrado de 224 x 224 píxeles.
- Entrenamiento y ajuste reproducible mediante AutoGluon MultiModal, con persistencia del predictor.
- Integración con backbones de TIMM bajo la interfaz de AutoGluon.
- Capacidad de servir como punto de referencia para comparar arquitecturas compactas (ResNet-18, MobileNetV3-Small, EfficientNet-B0) en un mismo pipeline.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo).
- Capacidades multilingües: no aplica (modelo de visión sin entrada ni salida de texto).
- Capacidades especiales (modo thinking, visión general, audio): no disponibles; la única salida es una etiqueta de clase binaria.

## Casos de uso

- Docencia y demostración de AutoML: el modelo sirve como ejemplo completo de búsqueda de hiperparámetros con presupuesto fijo sobre backbones preentrenados, útil en asignaturas de aprendizaje automático y en talleres prácticos.
- Plantilla metodológica contra la fuga de datos: el uso de `parent_id` para impedir que una imagen original y sus versiones aumentadas crucen la frontera entre splits es directamente reutilizable en cualquier proyecto de clasificación con aumentación agresiva sobre datasets pequeños.
- Triage previo en curación de datasets de imágenes: dado su coste computacional mínimo, puede emplearse como filtro de primera pasada para separar escenas con agua de escenas sin agua antes de una revisión humana, siempre que las predicciones se validen manualmente.
- Pruebas de integración de AutoGluon: permite verificar la persistencia, carga y serialización de un predictor de AutoMM en pipelines internos de MLOps sin necesidad de recursos de GPU significativos.
- Comparación de backbones compactos: sirve como referencia reproducible para medir el equilibrio entre exactitud, tiempo de ajuste y tamaño de modelo entre ResNet-18, MobileNetV3-Small y EfficientNet-B0 en un mismo conjunto de datos.
- Clasificación de bajo coste en CPU o edge: al tratarse de un backbone MobileNetV3-Small con entrada 224 x 224, es candidato para prototipos que deban ejecutarse sin GPU, por ejemplo en demostraciones locales o dispositivos embebidos con fines exclusivamente experimentales.
- Educación sobre limitaciones estadísticas: con 6 imágenes de test, el modelo ilustra de forma muy eficaz por qué una exactitud aparentemente razonable sobre una muestra mínima no constituye evidencia de rendimiento real, un punto habitual en materiales docentes sobre evaluación de modelos.
- Filtrado previo en experimentos de recuperación de imágenes: puede utilizarse para etiquetar de forma aproximada un subconjunto de imágenes por presencia de agua y estudiar después el impacto de ese filtro en tareas posteriores, sin tratar nunca las etiquetas como verdad de referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Según el `model-index`, el conjunto de test es la partición `test` del dataset `ssg1/places-water-binary`.

| Metrica | Conjunto | Valor | Verificado |
|---|---|---|---|
| Accuracy | test (Places Water Binary) | 0,6667 | No |
| F1 | test (Places Water Binary) | 0,6667 | No |

La model card declara además un conjunto de métricas de evaluación más amplio (accuracy, balanced accuracy, precision, recall y F1), aunque solo se publican valores numéricos de accuracy, balanced accuracy y F1.

Resultados de la búsqueda AutoML en validación (5 imágenes originales, sin aumentación):

| Trial | Backbone | Learning rate | Optimizador | Weight decay | Accuracy validación | Balanced accuracy validación | Tiempo de ajuste (s) |
|---|---|---|---|---|---|---|---|
| mobilenetv3_adamw_lr1e4 | mobilenetv3_small_100 | 0,0001 | adamw | 0,0001 | 1,0 | 1,0 | 16,0 |
| resnet18_sgd_lr1e3 | resnet18 | 0,001 | sgd | 0,0001 | 1,0 | 1,0 | 26,3 |
| resnet18_adamw_lr1e4 | resnet18 | 0,0001 | adamw | 0,0001 | 1,0 | 1,0 | 28,8 |
| mobilenetv3_adamw_lr3e5 | mobilenetv3_small_100 | 0,00003 | adamw | 0,0001 | 0,6 | 0,5 | 48,9 |
| resnet18_adamw_lr3e5 | resnet18 | 0,00003 | adamw | 0,0001 | 0,4 | 0,5 | 31,1 |
| efficientnetb0_adamw_lr3e5 | efficientnet_b0 | 0,00003 | adamw | 0,0001 | 0,4 | 0,5 | 67,1 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; estos benchmarks no aplican a un clasificador de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no declarada por el autor. Con un backbone MobileNetV3-Small de entrada 224 x 224, la estimación razonable en fp32 es inferior a 1 GB, aunque no hay medición publicada.
- VRAM para entrenamiento: el ajuste se realizó con batch size 8 por GPU y un límite de 300 segundos por trial; el trial ganador tardó 16 segundos. No se especifica la GPU utilizada.
- GPU recomendadas: no disponible. Por tamaño, el modelo es viable en cualquier GPU con al menos unos pocos gigabytes de memoria, incluidas tarjetas de gama baja y GPUs integradas modernas.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño reducido del backbone y la resolución de entrada; no se documenta una lista de modelos probados.
- Opciones de despliegue: AutoGluon (frameworks declarado en el repositorio). No se documentan exportaciones a ONNX, TorchScript, TensorRT ni formatos GGUF. vLLM, TGI, llama.cpp y Ollama no aplican, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el tiempo de ajuste del trial seleccionado (16 segundos) y el tiempo total de búsqueda (218,1 segundos), que corresponden a entrenamiento y no a inferencia.

## Comparativa con modelos similares

Los tres backbones comparados dentro de la propia búsqueda AutoML son las alternativas más directamente equiparables, ya que se evaluaron bajo idéntico presupuesto, semilla y particiones.

| Modelo | Parametros (referencia de arquitectura, no declarada en la model card) | Accuracy validación (búsqueda) | Tiempo de ajuste (s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileNetV3-Small (modelo seleccionado) | ~2,5 M | 1,0 con lr 1e-4; 0,6 con lr 3e-5 | 16,0 (lr 1e-4); 48,9 (lr 3e-5) | MIT (repositorio) | HuggingFace |
| ResNet-18 | ~11,7 M | 1,0 con lr 1e-3 y lr 1e-4; 0,4 con lr 3e-5 | 26,3 / 28,8 / 31,1 | no aplica al repo (pesos no publicados aquí) | evaluado solo dentro de la búsqueda |
| EfficientNet-B0 | ~5,3 M | 0,4 con lr 3e-5 | 67,1 | no aplica al repo (pesos no publicados aquí) | evaluado solo dentro de la búsqueda |

Los recuentos de parámetros de ResNet-18 y EfficientNet-B0 son valores de referencia de las arquitecturas originales y no están declarados en la model card. No se dispone de comparaciones con otros clasificadores binarios de agua publicados, por lo que no es posible establecer una comparativa de rendimiento con modelos externos.

## Limitaciones y advertencias

- Muestra de evaluación extremadamente pequeña: el conjunto de test tiene solo 6 imágenes, por lo que una exactitud de 0,6667 equivale a 4 aciertos de 6. El intervalo de confianza asociado es enorme y el resultado no permite extrapolar rendimiento.
- Validación igualmente anecdótica: las 5 imágenes de validación hacen que una exactitud de 1,0 no constituya evidencia de generalización.
- Dataset de origen minúsculo: 34 fotografías originales (17 con agua y 17 sin agua), con solo 23 originales dedicadas al entrenamiento. La variedad de escenas, iluminación, cámaras y geografías es necesariamente limitada.
- Modelo no apto para decisiones críticas: la propia model card excluye explícitamente su uso para detección de inundaciones o ahogamientos, respuesta ante emergencias, navegación marítima, monitorización medioambiental, vigilancia y cualquier decisión de seguridad.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo elevado de falsos positivos y falsos negativos, agravado por el desequilibrio potencialmente desconocido de las particiones de evaluación.
- Umbral de decisión no documentado: no se especifica cómo se convierte la salida del clasificador en la etiqueta final ni si se ajustó algún umbral.
- Métricas incompletas: aunque el repositorio declara precision, recall y balanced accuracy como métricas, los valores publicados en el `model-index` se limitan a accuracy y F1, ambos en 0,6667; no hay desglose por clase.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo demográfico, geográfico, estacional o de condiciones meteorológicas.
- Limitaciones de idioma: no aplica, al ser un modelo de visión sin entrada de texto. La model card no declara idiomas soportados.
- Restricciones de licencia: la licencia es MIT, que permitiría uso comercial desde el punto de vista legal, pero la model card restringe el uso previsto a fines didácticos y experimentales; las limitaciones declaradas por el autor deben respetarse aunque la licencia no las imponga formalmente.
- Origen académico: el modelo se creó para el Homework 2 de CMU 24-679. No ha pasado por procesos de validación externa, auditoría ni endurecimiento para producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin discusiones ni mantenimiento documentado.
- Formato de pesos no especificado: no se indica si los pesos son portables fuera del ecosistema de AutoGluon, lo que puede complicar su reutilización en otros frameworks.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cannj/2026-24679-water-image-automl-classifier
- Discusiones del modelo: https://huggingface.co/cannj/2026-24679-water-image-automl-classifier/discussions
- Dataset de origen: https://huggingface.co/datasets/ssg1/places-water-binary
- Explorador de modelos de clasificación de imágenes de HuggingFace: https://huggingface.co/models?pipeline_tag=image-classification
- Modelo hermano del mismo enunciado (tarea distinta, clasificación taza-escritorio): https://huggingface.co/pakiino/2026-24679-desk-mug-image-hw2
- Repositorio de modelos de clasificación de fauna con cámaras trampa, citado en la búsqueda como referencia general de clasificación de imágenes: https://github.com/google/cameratrapai
