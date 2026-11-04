# aryan-sentlyx/glimmer-system-one-heads

## Resumen

Glimmer System One es un modelo de decisión multimodal construido sobre el modelo base Muse Glimmer 30B (de meta-models). No genera texto: recibe una imagen, un texto de estado y preguntas tipadas, y devuelve una probabilidad calibrada por pregunta en un único forward pass. El repositorio publicado por aryan-sentlyx contiene únicamente las partes entrenadas (las "cabezas"), mientras que los pesos del modelo base permanecen en su repositorio original.

El componente principal son dos cabezas de regresión logística que operan sobre el estado oculto de Glimmer para responder a la pregunta "¿tiene esta pieza un defecto de fabricación visible?". Una cabeza actúa sobre la capa 52 (última capa) y otra sobre la capa 13, lo que permite una salida temprana tras 13 de las 52 capas. Cada cabeza es un estandarizador más una regresión logística sobre un vector de 6.656 flotantes, y su fichero ocupa 135 KB.

El modelo está orientado a inspección visual automatizada y detección de anomalías en entornos industriales, con calibración explícita de probabilidades. Se distribuye con licencia Apache 2.0, soporta únicamente inglés y se apoya en el dataset MVTec AD (15 productos) para el entrenamiento y evaluación de las cabezas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base multimodal Muse Glimmer 30B (transformer) con cabezas de regresión logística sobre estados ocultos |
| Parametros totales | No disponible (el modelo base es de 30B; las cabezas son regresiones logísticas de 6.656 dimensiones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | NPZ (cabezas: `noul_defective_known_L52.npz`, `noul_defective_known_L13.npz`); JSON (calibración y splits); el modelo base en safetensors |

## Arquitectura y entrenamiento

El sistema combina un modelo base multimodal (Muse Glimmer 30B, con 52 capas) con cabezas ligeras de clasificación. Cada cabeza aplica una estandarización (`(h - mean) / scale`) seguida de una regresión logística (`sigmoid(x @ coef + intercept)`) sobre el estado oculto de una capa concreta en la última posición del prompt. La cabeza de la capa 13 permite una salida temprana que reduce el coste computacional al truncar el forward pass tras 13 capas, aunque el servidor del repositorio GitHub ejecuta la profundidad completa.

El entrenamiento de las cabezas se realizó sobre el dataset MVTec AD (15 productos), usando la mitad de las imágenes de test de cada producto para entrenamiento y la otra mitad (866 imágenes) para evaluación. Los índices y la semilla están en `known_split.json`. Además de las cabezas, el repositorio incluye una calibración zero-shot (`temp_noul.json`) con temperatura `T` y sesgo `b` sobre el log-odds de "yes" frente a "no", y un barrido previo de cabezas en las capas 13, 25, 37 y 52 (`results.json`) con validación leave-one-product-out y 5-fold. No se especifica el número de tokens de entrenamiento del modelo base ni si hubo RLHF/DPO en Muse Glimmer 30B.

## Capacidades

- Clasificación binaria de defectos visibles en imágenes de inspección industrial, con probabilidad calibrada.
- Modo zero-shot sin cabeza: suma de probabilidades de los tokens "yes"/"no" en la última posición, con calibración por temperatura.
- Salida temprana mediante la cabeza de la capa 13 para reducir latencia.
- Procesamiento de imagen y texto en un único forward pass (multimodal).
- Soporte de plantillas de prompt tipadas (`inspect_defective_v1`) que definen el formato exacto de entrada.
- No genera texto libre: la salida es exclusivamente una probabilidad por pregunta.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Inspección visual en línea de producción: el modelo recibe la imagen de una pieza y devuelve `P(defecto)` calibrada, adecuada para umbrales de aceptación/rechazo en control de calidad.
- Detección de anomalías en fabricación: con la cabeza de la capa 52 se obtiene la máxima precisión; con la de la capa 13 se prioriza velocidad en cadenas de alta cadencia.
- Clasificación binaria automatizada con probabilidades calibradas: la calibración por temperatura permite integrar las salidas en sistemas de decisión que requieren probabilidades fiables (ECE bajo).
- Despliegue en entornos con latencia ajustada: la salida temprana tras 13 capas permite reducir el coste frente al forward completo de 52 capas.
- Auditoría y validación de modelos de inspección: los ficheros `results.json` y `reliability.png` permiten reproducir el barrido de capas y el diagrama de fiabilidad para validar el sistema.
- Investigación en modelos de decisión "system one": el enfoque de cabezas logísticas sobre estados ocultos sirve como base para experimentos de calibración y salida temprana en modelos multimodales.

## Benchmarks y rendimiento

Resultados sobre las 866 imágenes de test retenidas de MVTec AD (15 productos), pregunta única de defecto visible:

| Sistema | AUROC | Accuracy a 0.5 | ECE | Por imagen |
|---|---|---|---|---|
| Cabeza capa 52 | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto |
| Cabeza capa 13 | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto |

La model card incluye una tabla de resultados cuyo contenido numérico no se ha podido extraer completo en la información proporcionada; los valores concretos de AUROC, accuracy, ECE y latencia por imagen (se mencionan 21 ms para el modelo truncado) deben consultarse en el repositorio. No se han publicado en la información disponible resultados comparativos con otros modelos.

## Requisitos de hardware

- El modelo base Muse Glimmer 30B requiere GPU de alta capacidad; en bfloat16 se estima un uso de VRAM en el entorno de decenas de GB (no se proporciona cifra exacta).
- GPU recomendadas: A100, H100 o superiores para el forward completo de 52 capas; no se documenta compatibilidad con GPU de consumo.
- La cabeza de la capa 13 permite truncar el forward pass y reducir requisitos de cómputo, aunque sigue necesitando cargar el modelo base.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), con `device_map="cuda"` y `dtype=torch.bfloat16`; el repositorio GitHub incluye un servidor de demo desplegado en Modal.
- Latencia: 21 ms por imagen citada para el benchmark con modelo truncado (cabeza de capa 13); no se documenta throughput del forward completo.
- Las cabezas son ficheros de 135 KB y no añaden requisitos de VRAM significativos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glimmer System One heads | Base 30B + cabezas logísticas | No disponible | Decisión binaria calibrada sobre estados ocultos | Apache 2.0 | HuggingFace + GitHub |
| Alternativas de inspección visual industrial | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (cabezas de decisión sobre modelos multimodales para inspección visual) en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- No genera texto: únicamente devuelve probabilidades para preguntas tipadas.
- Cada cabeza está ligada a una plantilla de prompt concreta (`inspect_defective_v1`); un prompt distinto invalida la cabeza.
- El entrenamiento y la evaluación se limitan a MVTec AD (15 productos); el rendimiento en otros dominios industriales no está validado.
- La evaluación usa la mitad de las imágenes de test de cada producto para entrenamiento, lo que puede sobreestimar el rendimiento respecto a un escenario completamente fuera de distribución.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración deficiente fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Muse Glimmer 30B, no detallada en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.
- El tamaño del repo es 0.0 GB, coherente con que solo contiene las cabezas y metadatos, no los pesos del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/aryan-sentlyx/glimmer-system-one-heads
- GitHub: https://github.com/aryan-sentlyx/glimmer-system-one
- Demo en vivo: https://aryan-59489--glimmer-demo.us-east.modal.run
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Dataset: https://huggingface.co/datasets/TheoM55/mvtec_all_objects_split
