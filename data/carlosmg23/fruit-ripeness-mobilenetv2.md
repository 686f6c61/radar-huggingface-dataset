# Carlosmg23/fruit-ripeness-mobilenetv2

## Resumen

El modelo `Carlosmg23/fruit-ripeness-mobilenetv2` es un clasificador de imágenes basado en MobileNetV2, desarrollado por el usuario Carlosmg23 como parte de la Actividad 8 del proyecto "Sistema inteligente para estimar el estado de madurez y deterioro de frutas". Su función es clasificar recortes de manzana, plátano y mango en cuatro estados: verde (unripe), maduro (ripe), pasado (overripe) y podrido (rotten), sumando un total de 12 clases. Es un modelo base de transferencia de aprendizaje con la base convolucional congelada.

El modelo se apoya en MobileNetV2 preentrenada en ImageNet, con `include_top=False`, y añade una cabeza clasificadora ligera: `GlobalAveragePooling2D`, `Dropout(0.25)` y una capa `Dense(12, softmax)`. La entrada es de 224 x 224 x 3 píxeles normalizada a [-1, 1]. Se entrenó sobre un dataset derivado de Fruit Ripeness de Roboflow Universe (versión 3), con 5778 recortes de entrenamiento y 1241 de validación.

Su relevancia es acotada y de carácter didáctico o experimental: no es un modelo de propósito general ni un modelo de lenguaje, sino un clasificador de visión por computador de dominio muy específico, con licencia CC BY 4.0 y un rendimiento modesto en test (exactitud 0.6621, F1 macro 0.5940). Es útil como referencia para pipelines de clasificación de frutas o para comparar contra alternativas clásicas como Random Forest en el mismo dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN, base congelada preentrenada en ImageNet) + GlobalAveragePooling2D + Dropout(0.25) + Dense(12, softmax) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 x 224 x 3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de clasificación de imágenes) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.keras` (Keras nativo, TensorFlow/Keras) |

## Arquitectura y entrenamiento

La arquitectura es una CNN de tipo MobileNetV2 con la base convolucional congelada (`include_top=False`), sobre la que se apila una cabeza de clasificación: `GlobalAveragePooling2D`, `Dropout(0.25)` y `Dense(12, softmax)`. La entrada es de 224 x 224 x 3, normalizada a [-1, 1]. Las 12 clases corresponden al producto cartesiano de {Apple, Banana, Mango} x {Unripe, Ripe, Overripe, Rotten}.

El entrenamiento usó 5778 recortes de `train` y 1241 de `valid`, con pesos de clase balanceados (de 0.202 a 3.489). El aumento de datos incluyó volteo horizontal, rotación de ±10 grados, zoom de 90-110 % y brillo de ±20 %, sin cambios de tono ni saturación para preservar la señal de color asociada al estado de madurez. Se usó el optimizador Adam con tasa de aprendizaje 1e-3, `EarlyStopping` sobre `val_loss` y un máximo de 15 épocas, siendo la mejor época la 8 de 12. El conjunto de `test` se reservó para una única evaluación tras fijar todos los modelos e hiperparámetros.

## Capacidades

- Clasificación de imágenes en 12 clases de estado de fruta (Apple, Banana, Mango x Unripe, Ripe, Overripe, Rotten).
- Entrada de imagen RGB de 224 x 224 x 3 normalizada a [-1, 1].
- Salida de probabilidades por clase mediante softmax.
- Capacidad de transferencia de aprendizaje sobre una base MobileNetV2 preentrenada en ImageNet.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras modalidades más allá de la clasificación de imágenes.

## Casos de uso

- Clasificación automática de estado de madurez en líneas de inspección de fruta: el modelo recibe recortes de 224 x 224 y devuelve una de las 12 clases, adecuado para prototipos de control de calidad en almacenes o plantas de envasado.
- Clasificación de deterioro para alertas de merma: al detectar la clase `Rotten` o `Overripe`, se puede activar una alerta en un sistema de gestión de inventario para retirar producto antes de que se propague el deterioro.
- Etiquetado asistido de datasets de fruta: el modelo puede pre-anotar imágenes en nuevas recolecciones para acelerar la revisión manual, dado su bajo coste computacional como MobileNetV2.
- Comparación de referencia en experimentos académicos: sirve como línea base de deep learning frente a enfoques clásicos (Random Forest, criterio 03) en el mismo dataset, tal como se documenta en la model card.
- Despliegue en dispositivos de borde: por su arquitectura MobileNetV2, es apto para inferencia en CPUs o GPUs de baja potencia en cámaras o dispositivos de campo, aunque no se publican latencias concretas.
- Módulo de visión en una aplicación educativa o de demostración: permite ilustrar un pipeline completo de transferencia de aprendizaje con Keras, carga desde Hugging Face y evaluación con métricas balanceadas.
- Filtrado previo en un sistema de recomendación de consumo: clasificar el estado de la fruta para descartar automáticamente las categorías no aptas (`Overripe`, `Rotten`) antes de un análisis más fino.

## Benchmarks y rendimiento

Resultados en test publicados en la model card:

| Modelo | Exactitud | Exactitud balanceada | F1 macro | F1 ponderado | QWK |
|---|---:|---:|---:|---:|---:|
| Mayoria | 0.4131 | 0.0833 | 0.0487 | 0.2415 | 0.0000 |
| Random Forest | 0.6694 | 0.5147 | 0.5217 | 0.6568 | 0.6546 |
| Criterio 03 | 0.5958 | 0.5720 | 0.5335 | 0.6322 | 0.5532 |
| MobileNetV2 | 0.6621 | 0.6334 | 0.5940 | 0.6636 | 0.6899 |

El conjunto de `test` se usó una sola vez, después de fijar todos los modelos, sin ajuste de hiperparámetros con esos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de MobileNetV2 con entrada 224 x 224, el consumo es bajo y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se publican recomendaciones específicas (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con varios GB de VRAM, aunque no se aportan cifras concretas.
- Opciones de despliegue: Keras/TensorFlow nativo (carga vía `tf.keras.models.load_model` desde el archivo `.keras`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carlosmg23/fruit-ripeness-mobilenetv2 | no disponible | 224 x 224 x 3 | Exactitud 0.6621, F1 macro 0.5940 | CC BY 4.0 | Hugging Face |
| Random Forest (mismo dataset) | no disponible | características tabulares/derivadas | Exactitud 0.6694, F1 macro 0.5217 | no disponible | Referencia en model card |
| Criterio 03 (mismo dataset) | no disponible | no disponible | Exactitud 0.5958, F1 macro 0.5335 | no disponible | Referencia en model card |
| Mayoria (baseline) | no disponible | no disponible | Exactitud 0.4131, F1 macro 0.0487 | no disponible | Referencia en model card |

No se dispone de comparación con otros modelos públicos de clasificación de fruta en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base: la base MobileNetV2 está congelada, sin fine-tuning, lo que limita su capacidad de adaptación al dominio.
- Se entrenó solo con el dataset derivado; no se ha probado con fotos externas, por lo que la generalización fuera de la distribución de entrenamiento es incierta.
- La clase `Rotten` representa deterioro, no una etapa de maduración; conviene no confundirla con `Overripe` en la lógica de negocio.
- El rendimiento puede degradarse con iluminación, fondo o distancia de captura distintas a las del dataset original.
- No se documentan sesgos conocidos ni tasas de alucinación (no aplica al no ser un modelo generativo), pero sí existe riesgo de falsos positivos/negativos en clases minoritarias pese al balanceo de pesos.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar al autor y respetar los términos de la licencia.
- No se especifican requisitos de hardware, latencias ni throughput, lo que dificulta planificar un despliegue en producción sin pruebas propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repo de 0.0 GB, lo que sugiere que los pesos podrían no estar disponibles o el repo está vacío; conviene verificar antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Carlosmg23/fruit-ripeness-mobilenetv2
- Dataset referenciado: https://huggingface.co/datasets/Carlosmg23/fruit-ripeness-12clases
- Dataset original Fruit Ripeness (Muhammad's Workspace, Roboflow Universe, versión 3): no disponible como enlace directo en la información proporcionada.
