# ParsaVictor/tomato-ripeness-classifier-yolo26s

## Resumen

Tomato Ripeness Classifier YOLO26s es un modelo de clasificación de imágenes especializado en determinar el estado de maduración de tomates individuales. Desarrollado por ParsaVictor, forma parte de un pipeline más amplio de detección y conteo de tomates y se distribuye a través de HuggingFace con la librería Ultralytics. El modelo clasifica cada recorte de tomate en cuatro categorías: unripe (verde), half-ripe (medio maduro), ripe (maduro) y rotten (podrido).

El modelo se basa en la arquitectura YOLO26s-cls de Ultralytics, con una entrada de 160×160 píxeles y 5,4 millones de parámetros, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en tiempo real. Se entrenó sobre 50.776 recortes de tomates (con aumento de datos ×4 para la clase rotten mediante volteos y rotaciones) y se validó sobre 8.579 muestras. El repositorio ocupa menos de 0,1 GB y el modelo pesa 11 MB.

La relevancia del modelo radica en su aplicación práctica en agricultura y control de calidad: permite automatizar la clasificación de maduración en líneas de procesamiento o cosecha. Incluye además un mecanismo corrector denominado *rotten check*, una regresión logística sobre el embedding de 512 dimensiones del clasificador que reduce los falsos positivos de "podrido" en escenarios de iluminación adversa (cintas transportadoras oscuras).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26s-cls (Ultralytics), entrada 160×160 |
| Parámetros totales | 5,4 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de clasificación visual, sin capacidades lingüísticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) compatible con Ultralytics; artefacto auxiliar .npz para el rotten check |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26s-cls de Ultralytics, una red neuronal convolucional diseñada para clasificación de imágenes con un presupuesto computacional reducido. La entrada es de 160×160 píxeles, coherente con la regla de entrenamiento: cada tomate se recorta con un 10 % de padding alrededor de su caja delimitadora y se redimensiona a esa resolución. El modelo produce un embedding de 512 dimensiones que se utiliza tanto para la clasificación como para el módulo auxiliar de verificación.

El entrenamiento se realizó sobre 50.776 recortes de tomates, con un aumento de datos específico para la clase rotten (multiplicada por 4 mediante volteos y rotaciones) para compensar el desbalance de clases. La validación se hizo sobre 8.579 muestras. Como innovación destacable, el autor detectó que el clasificador aprendía a asociar "podrido" con tonos rojo-oscuro, lo que provocaba falsos positivos en cintas transportadoras oscuras; para corregirlo entrenó `rotten_check.npz`, una cabeza de regresión logística sobre el embedding de 512 dimensiones usando tomates de cinta transportadora como ejemplos *sound* (sanos). No se dispone de información sobre el uso de RLHF/DPO (no aplicable a este tipo de modelo) ni sobre la composición detallada del dataset más allá del recuento de muestras.

## Capacidades

- Clasificación de imágenes de tomates individuales en cuatro clases: unripe (`raw`), half-ripe (`half_ripe`), ripe (`ripe`) y rotten (`rotten`).
- Verificación de podredumbre mediante un módulo de regresión logística auxiliar (`rotten_check.npz`) que filtra falsos positivos de "rotten" en condiciones de iluminación adversa.
- Extracción de embeddings de 512 dimensiones mediante el método `embed()` de Ultralytics, reutilizables para otras tareas de clasificación o clustering.
- Inferencia de alta velocidad: menos de 1 ms por recorte en una GPU T4.
- Integración con el ecosistema Ultralytics (API `YOLO`, `predict`, `embed`).
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modalidades de audio o texto.

## Casos de uso

- **Clasificación en línea de cintas transportadoras agrícolas**: el modelo recibe recortes de tomates detectados por el componente 1 del pipeline y clasifica su maduración en tiempo real; con menos de 1 ms por recorte en T4, puede procesar varios cientos de tomates por segundo en una sola GPU.
- **Control de calidad en plantas de envasado**: integrado tras un detector de tomates, permite separar automáticamente frutos podridos de sanos con una precisión del 98,6 % en la tarea binaria sound vs rotten, reduciendo el trabajo manual de inspección.
- **Automatización de la cosecha selectiva**: el modelo distingue entre unripe, half-ripe y ripe, lo que permite a robots de recolección decidir qué frutos recolectar en cada pasada; los errores se concentran entre etapas contiguas y nunca confunde ripe con unripe.
- **Monitorización de maduración en almacén**: desplegado sobre imágenes capturadas periódicamente, permite seguir la evolución de la maduración de lotes y planificar la rotación de stock; el módulo rotten check evita alertas falsas en entornos con iluminación variable.
- **Investigación agronómica y fenotipado**: el embedding de 512 dimensiones puede reutilizarse para agrupar variedades o estudiar la progresión de la maduración, gracias a la API `embed()` de Ultralytics.
- **Prototipado rápido en aplicaciones móviles o de borde**: con 5,4 M de parámetros y 11 MB de pesos, el modelo es viable en dispositivos con recursos limitados para aplicaciones de campo que asistan al agricultor en la evaluación visual de la fruta.
- **Generación de datasets etiquetados**: el modelo puede preetiquetar grandes volúmenes de imágenes de tomates para su posterior revisión humana, acelerando la creación de datasets de calidad.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de Tomato Defects (recortes de tomates emparejados):

| Métrica | Precisión |
|---|---:|
| 4 clases (unripe / half-ripe / ripe / rotten) | 80,8 % |
| 3 clases (ripe / unripe / rotten) | 88,7 % |
| Binaria sound vs rotten | 98,6 % |

Efecto del módulo `rotten_check.npz` sobre falsos positivos de "rotten":

| Escenario | Sin check | Con check |
|---|---:|---:|
| Tomates sanos de cinta transportadora clasificados como rotten | 32 | 1 |
| Tomates sanos sxsc7 clasificados como rotten | 20 | 3 |
| Tomates realmente podridos conservados (validación) | — | 97,5 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB para el modelo en precisión completa (5,4 M de parámetros, 11 MB de pesos); el consumo real depende del tamaño de lote y del backend.
- **GPU recomendadas**: NVIDIA T4 (referencia del autor, <1 ms por recorte), así como cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o profesional (A100, H100) para despliegues de alto throughput.
- **Compatibilidad con GPU consumer**: sí, cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM; también es viable en CPU para lotes pequeños.
- **Opciones de despliegue**: Ultralytics (API Python nativa), exportación a ONNX, TensorRT, OpenVINO u otros formatos soportados por Ultralytics; el módulo `rotten_check.npz` requiere NumPy para la inferencia de la regresión logística.
- **Latencia y throughput**: menos de 1 ms por recorte en T4 según el autor; el throughput agregado depende del tamaño de lote y de la pipeline de preprocesado (recorte con 10 % de padding y redimensionado a 160×160).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un clasificador especializado de un dominio muy concreto (maduración de tomates) y el autor no publica comparaciones con alternativas como otros clasificadores YOLO de Ultralytics (por ejemplo, YOLO26n-cls o YOLO26m-cls) ni con modelos genéricos de visión. Los datos disponibles solo permiten comparar internamente las métricas del propio modelo con y sin el módulo `rotten_check`.

## Limitaciones y advertencias

- **Errores entre etapas contiguas**: la mayoría de los fallos se producen entre clases adyacentes (ripe ↔ half-ripe ↔ unripe); el autor indica que ripe nunca se confunde con unripe, pero la precisión de 4 clases es del 80,8 %, insuficiente para aplicaciones que requieran distinción fina entre estados intermedios.
- **Sesgo hacia el rojo oscuro**: el clasificador aprendió a asociar "podrido" con tonos rojo-oscuro, lo que genera falsos positivos en frutos sanos pero muy maduros o en condiciones de iluminación oscura; el módulo `rotten_check` mitiga el problema, pero no lo elimina por completo (queda 1 falso positivo en cinta transportadora y 3 en sxsc7).
- **Dependencia del preprocesado**: el modelo debe recibir recortes de un solo tomate con un 10 % de padding y redimensionados a 160×160; desviarse de esta regla degrada el rendimiento.
- **Dominio muy restringido**: solo clasifica tomates; no es un modelo de propósito general y no debe esperarse que funcione con otras frutas u hortalizas.
- **Licencia AGPL-3.0**: el uso comercial en productos de código cerrado requiere una licencia Enterprise de Ultralytics; la AGPL-3.0 impone obligaciones de liberación del código fuente en determinados escenarios.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificaciones erróneas confiadas (falsos positivos/negativos) en imágenes fuera de distribución.
- **Ausencia de benchmarks comparativos**: no hay comparaciones públicas con otros clasificadores, lo que dificulta evaluar su rendimiento relativo.
- **Documentación limitada**: no se especifican detalles sobre composición del dataset, técnicas de aumento más allá de las mencionadas, ni métricas por clase (precisión, recall, F1).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ParsaVictor/tomato-ripeness-classifier-yolo26s
- Pipeline completo (detección + maduración + tracking + conteo): https://huggingface.co/ParsaVictor/tomato-ripeness-yolo26
- Componente 1, detector de tomates: https://huggingface.co/ParsaVictor/tomato-detector-yolo26s
- Dataset: https://huggingface.co/datasets/ParsaVictor/tomato-ripeness-detection
- Código en GitHub: https://github.com/ParsaVictor/tomato-ripeness-detection
