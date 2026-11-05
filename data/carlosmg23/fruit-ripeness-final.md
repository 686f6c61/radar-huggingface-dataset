# Carlosmg23/fruit-ripeness-final

## Resumen

El modelo `Carlosmg23/fruit-ripeness-final` es un clasificador de imágenes basado en MobileNetV2, desarrollado por Carlosmg23 como entrega final de la Actividad 9 del proyecto "Sistema inteligente para estimar el estado de madurez y deterioro de frutas". Resuelve un problema de clasificación de 12 clases que combinan estado de madurez y deterioro de frutas, partiendo de un modelo base congelado (F1 macro 0,594 en test) y aplicando fine-tuning de los últimos bloques con AdamW, learning rate 1e-5, label smoothing 0,05 y early stopping. El resultado se distribuye tanto en formato Keras nativo como en TensorFlow Lite con cuantización dinámica (2,43 MB).

La relevancia del modelo es acotada y de carácter académico: se trata de un ejercicio de fine-tuning y calibración sobre un dataset propio derivado de Fruit Ripeness (Roboflow Universe), con 0 descargas y 0 likes en el momento de la consulta. No es un modelo de propósito general ni compite con los clasificadores de visión de gran escala; su interés reside en la metodología aplicada (comparación de alternativas, temperature scaling con T = 1,203, bootstrap agrupado para estimar la incertidumbre del delta frente al modelo base) y en su despliegue ligero para dispositivos móviles.

El modelo no procesa texto ni lenguaje natural: es exclusivamente un clasificador de imágenes. Por tanto, las filas de la ficha relativas a contexto, idiomas o tool calling se marcan como no disponibles o no aplicables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN, MobileNetV2 (base preentrenada con fine-tuning de los últimos bloques) |
| Parámetros totales | no disponible (el autor no publica el recuento; MobileNetV2 estándar ronda 3,5 M, pero no se confirma en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | Cuantización dinámica para TensorFlow Lite; pesos Keras en precisión original |
| Idiomas soportados | no aplica (clasificador de imágenes; las etiquetas de clase están en inglés, p. ej. `Rotten`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Keras (`.keras`) y TensorFlow Lite (`.tflite`) |
| Tamaño del repositorio | 0,1 GB |
| Tamaño del modelo TFLite | 2,43 MB |
| Número de clases | 12 |
| Métricas declaradas | accuracy, F1 (macro) |
| Dataset de entrenamiento | `Carlosmg23/fruit-ripeness-12clases`, derivado de Fruit Ripeness de Muhammad's Workspace (Roboflow Universe, versión 3) |
| Librería | Keras / TensorFlow |

## Arquitectura y entrenamiento

La arquitectura es una MobileNetV2 preentrenada que en la Actividad 8 se utilizó congelada como extractor de características y que en esta entrega final se somete a fine-tuning de los últimos bloques. El entrenamiento emplea el optimizador AdamW con un learning rate de 1e-5, label smoothing de 0,05 y early stopping. Como alternativa se evaluó una MobileNetV3-Small entrenada en dos etapas, pero la selección en validación recayó sobre la variante V2 con fine-tuning. Posteriormente se aplica calibración de probabilidades mediante temperature scaling con T = 1,203, y el modelo resultante se convierte a TensorFlow Lite con cuantización dinámica.

El dataset de entrenamiento es `Carlosmg23/fruit-ripeness-12clases`, derivado del conjunto Fruit Ripeness de Muhammad's Workspace en Roboflow Universe (versión 3). La información disponible no detalla el número de imágenes, la composición por clase ni si se aplicaron aumentos de datos; tampoco se especifica si hubo entrenamiento con datos externos más allá de la mención a un conjunto externo opcional de 60 fotos, que el propio autor califica de muestra pequeña. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de visión.

La innovación técnica destacable, en el contexto de un proyecto académico, es la evaluación rigurosa de la incertidumbre: además de las métricas puntuales en test, se reporta un bootstrap agrupado del delta de F1 macro frente al modelo base, con media +0,0008 e intervalo de confianza al 95 % de [-0,0174, +0,0210], lo que indica que la mejora no es estadísticamente distinguible de cero con los datos disponibles.

## Capacidades

- Clasificación de imágenes en 12 clases que combinan estado de madurez y deterioro de frutas.
- Salida de probabilidades por clase, calibradas mediante temperature scaling (T = 1,203).
- Evaluación con métricas de exactitud, exactitud balanceada, F1 macro, QWK (quadratic weighted kappa) y Top-3.
- Inferencia en dispositivos móviles y entornos con recursos limitados gracias al formato TFLite (2,43 MB) y a la cuantización dinámica.
- Carga directa en Keras mediante `tf.keras.models.load_model` sobre el fichero `.keras`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades más allá de la clasificación de imagen.

## Casos de uso

- Clasificación de madurez en línea de envasado: el modelo puede recibir imágenes de una cámara fija sobre una cinta transportadora y asignar cada fruta a una de las 12 clases, con la ventaja de un modelo TFLite de 2,43 MB que cabe en hardware embebido de bajo coste.
- Aplicación móvil de apoyo al consumidor: integrado en una app Android o iOS mediante TensorFlow Lite, el modelo permite al usuario fotografiar una fruta y obtener una estimación del estado de madurez o deterioro, con la advertencia de que la latencia medida en Colab (20,9 ms) no es la del teléfono.
- Control de calidad en almacén: cribado automatizado de lotes para separar fruta deteriorada (`Rotten`) de fruta en distintas etapas de maduración, usando la salida Top-3 para revisión manual de los casos ambiguos.
- Proyecto educativo y de investigación aplicada: sirve como referencia reproducible de un pipeline completo de fine-tuning, calibración y conversión a TFLite, con métricas y análisis de incertidumbre documentados.
- Prototipado rápido en robótica agrícola: al ser un modelo pequeño y ligero, puede embeberse en un brazo robótico o dron con cómputo limitado para tareas de selección preliminar, siempre que las condiciones de iluminación y distancia se controlen.
- Filtro previo en sistemas de inventario: clasificación automática de imágenes capturadas en inventarios de frutería para priorizar la retirada de producto deteriorado, aceptando la tasa de error documentada (F1 macro 0,5819).

## Benchmarks y rendimiento

Resultados en test reportados por el autor:

| Modelo | Exactitud | Exactitud balanceada | F1 macro | QWK | Top-3 |
|---|---:|---:|---:|---:|---:|
| Mayoría (baseline) | 0,4131 | 0,0833 | 0,0487 | 0,0000 | 0,4713 |
| Random Forest | 0,6694 | 0,5147 | 0,5217 | 0,6546 | 0,8812 |
| Criterio 03 | 0,5958 | 0,5720 | 0,5335 | 0,5532 | no disponible |
| MobileNetV2 (base congelada) | 0,6621 | 0,6334 | 0,5940 | 0,6899 | 0,9038 |
| V2 fine-tuned (modelo final) | 0,6524 | 0,6361 | 0,5819 | 0,6594 | 0,8852 |

Análisis de la mejora: el delta de F1 macro frente al modelo base es -0,0122. El bootstrap agrupado arroja un delta medio de +0,0008 con IC 95 % de [-0,0174, +0,0210], por lo que la diferencia no es concluyente. El modelo final mejora ligeramente en exactitud balanceada (0,6361 frente a 0,6334) pero empeora en exactitud global, F1 macro, QWK y Top-3.

Latencia: 20,9 ms de mediana en CPU de Colab para el modelo TFLite, medida de referencia que el autor advierte explícitamente que no corresponde a la latencia real en teléfono.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo (2,43 MB en TFLite, repo de 0,1 GB con pesos Keras) es despreciable frente a cualquier GPU moderna, y la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte TensorFlow (A100, H100, RTX 4090, RTX 3090, T4) puede ejecutar el modelo, pero no es necesario GPU para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU o en hardware embebido compatible con TensorFlow Lite.
- Opciones de despliegue: TensorFlow Lite (recomendado para móvil y embebido), TensorFlow/Keras nativo, y potencialmente TensorFlow Serving si se sirve la variante Keras.
- Latencia y throughput estimados: 20,9 ms de mediana en CPU de Colab para el TFLite cuantizado dinámicamente; no se reportan medidas en teléfono ni throughput en lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fruit-ripeness-final (este modelo) | no disponible (MobileNetV2) | Imagen RGB, 12 clases | F1 macro 0,5819 en test propio | CC BY 4.0 | HuggingFace (0 descargas) |
| MobileNetV2 base congelada (Actividad 8) | no disponible | Imagen RGB, 12 clases | F1 macro 0,5940 en test propio | CC BY 4.0 (según repo) | Referencia interna del autor |
| MobileNetV3-Small en dos etapas (alternativa evaluada) | no disponible | Imagen RGB, 12 clases | No se reportan métricas finales en la información | no disponible | No distribuida en el repo |
| Random Forest (baseline del proyecto) | no disponible | Características tabulares/imagen | F1 macro 0,5217 en test propio | no disponible | No distribuida |

No se dispone de comparación con clasificadores de fruta publicados de otros autores, ni con modelos de visión generales, en la información proporcionada.

## Limitaciones y advertencias

- El conjunto externo de validación es opcional y consta solo de 60 fotos, una muestra pequeña que limita la generalización estimada.
- Las imágenes generadas con IA no sustituyen una validación con fotos reales, según advierte el propio autor.
- La latencia de 20,9 ms se midió en CPU de Colab y no representa la latencia en teléfono.
- La clase `Rotten` representa deterioro, no una etapa de maduración; debe interpretarse con cuidado en aplicaciones de negocio.
- El modelo puede fallar con iluminación, fondo o distancia muy distintas a las del entrenamiento.
- El fine-tuning no mejora de forma concluyente al modelo base: el delta de F1 macro es negativo (-0,0122) y el IC del bootstrap incluye el cero.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí existe riesgo de clasificación errónea con alta confianza en imágenes fuera de distribución.
- Sesgos conocidos: no documentados; el dataset deriva de una única fuente (Roboflow Universe) y no se detalla su composición demográfica ni de condiciones de captura.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene verificar la licencia del dataset original (Fruit Ripeness de Muhammad's Workspace) antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validación por terceros.
- No hay información sobre el número de imágenes de entrenamiento, la distribución por clase ni los aumentos aplicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Carlosmg23/fruit-ripeness-final
- Dataset de entrenamiento: https://huggingface.co/datasets/Carlosmg23/fruit-ripeness-12clases
- Dataset original Fruit Ripeness (Muhammad's Workspace, Roboflow Universe, versión 3): no disponible como URL directa en la información proporcionada
- Paper, blog o demo: no disponibles
