# ananthu-aniraj/ifam-metashift-k1

## Resumen

iFAM (metashift-k1) es un checkpoint de clasificación de imágenes publicado por Ananthu Aniraj (ananthu-aniraj) en HuggingFace, correspondiente al framework iFAM (Inherently Faithful Attention Maps) descrito en el artículo "Two-stage Vision Transformers and Hard Masking offer Robust Object Representations", aceptado como presentación oral en ICPR 2026. El modelo aborda un problema clásico de los clasificadores visuales: la dependencia de detalles espurios del fondo en lugar de las regiones realmente discriminativas del objeto. Para ello emplea una arquitectura de dos etapas sobre un backbone Vision Transformer asociado a DINOv2 (según las etiquetas del repositorio).

La primera etapa (selector) procesa la imagen completa para descubrir partes del objeto e identificar las regiones relevantes para la tarea. La segunda etapa (predictor) restringe su campo receptivo a esas regiones mediante enmascaramiento duro de la atención, de modo que la información de fondo no puede influir en la clasificación. Este checkpoint concreto está entrenado sobre el conjunto de datos Metashifts con una sola parte (K=1).

El modelo tiene 171.463.685 parámetros (unos 171,5 millones) y un repositorio de 0,7 GB, con pesos en safetensors y licencia Apache 2.0. Es un artefacto de investigación con 0 descargas y 0 "likes" en el momento de redactar esta ficha, no compatible con el pipeline estándar de transformers: requiere clonar el repositorio de código del autor para instanciarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer de dos etapas (selector + predictor) con enmascaramiento duro de atención; etiquetado como DINOv2. Detalle exacto del backbone: no disponible |
| Parámetros totales | 171.463.685 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión). La model card muestra entradas de 1x3x224x224 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |
| Tarea | image-classification |
| Librería declarada | generic (código propio, no transformers) |
| Dataset de entrenamiento | Metashifts, con K=1 parte |
| Tamaño del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo implementa un esquema de dos etapas encadenadas. La etapa 1 (selector) recibe la imagen completa y aprende a localizar partes del objeto y regiones relevantes para la tarea. La etapa 2 (predictor) reutiliza esa selección y aplica una máscara dura sobre la atención de entrada, de forma que su campo receptivo queda limitado a las regiones elegidas. El objetivo declarado es que la representación sea "inherentemente fiel" a las partes del objeto: al impedir que el predictor vea el fondo, se corta el atajo que suele producir clasificadores robustos solo en apariencia, pero dependientes de correlaciones espurias.

Las etiquetas del repositorio apuntan a DINOv2 como base y a "dynamic-masking" y "modular-ai" como características del enfoque. El checkpoint publicado corresponde a Metashifts con K=1, es decir, una única parte seleccionada. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la resolución nativa de entrenamiento, ni si se emplearon fases de ajuste tipo RLHF/DPO (poco habituales en clasificación de imágenes). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Clasificación de imágenes: es la tarea principal declarada (pipeline image-classification).
- Representaciones robustas ante cambios de distribución y correlaciones espurias: el enmascaramiento duro pretende eliminar la influencia del fondo.
- Descubrimiento de partes del objeto: la etapa selectora identifica regiones relevantes, lo que puede aprovecharse para localización débilmente supervisada.
- Extracción de características intermedias: al estar construido sobre un transformer visual, sus activaciones pueden servir como features para tareas posteriores, aunque no se documenta una API específica para ello.
- Funcionamiento en dos fases: el modelo expone dos cabezas de clasificación (`FullTwoStageModelDoubleClassify`), según el código de ejemplo de la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni entrada/salida de texto.
- No dispone de modo "thinking", visión-lenguaje, audio ni generación de texto.

## Casos de uso

- Clasificación de imágenes con fondos correlacionados con la etiqueta: por ejemplo, distinguir especies animales en cámaras trampa donde el hábitat de fondo predice la especie; el enmascaramiento evita que el modelo aprenda el contexto en lugar del animal.
- Curaduría de datasets y detección de sesgos: usar las máscaras del selector para inspeccionar qué regiones está mirando el clasificador y detectar atajos espurios antes de entrenar modelos mayores.
- Localización débilmente supervisada de partes: reutilizar la salida del selector como propuesta de regiones para tareas de recorte, conteo o segmentación aproximada sin anotaciones de caja.
- Control de calidad industrial: clasificar piezas o defectos donde el fondo de la línea de producción varía entre plantas y podría confundir a un clasificador convencional.
- Imagen médica o de microscopía con artefactos de adquisición: clasificar hallazgos cuando el dispositivo, el tinte o el encuadre actúan como variables de confusión.
- Teledetección y análisis de imágenes aéreas: discriminar clases de cobertura del terreno limitando la atención a las regiones informativas de la escena.
- Filtrado previo en pipelines de datos: descartar o etiquetar imágenes a gran escala con un modelo de 171,5 millones de parámetros que cabe en GPUs de consumo, siempre que se valide su comportamiento fuera de Metashifts.
- Investigación en robustez y reproducibilidad: servir como referencia para comparar estrategias de enmascaramiento duro frente a clasificadores de una sola etapa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los metadatos consultados no incluyen métricas numéricas (exactitud en Metashifts, ImageNet, out-of-distribution, etc.), y la búsqueda web realizada no devolvió resultados relevantes sobre el modelo. No se deben asumir cifras a partir del artículo sin consultarlo directamente.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (171.463.685), no confirmadas por el autor:

- VRAM para los pesos en FP32: aproximadamente 0,69 GB.
- VRAM en FP16/BF16: aproximadamente 0,34 GB.
- VRAM en INT8: aproximadamente 0,17 GB.
- VRAM en INT4: aproximadamente 0,09 GB.
- Hay que sumar la memoria de activaciones y, sobre todo, el hecho de que la arquitectura es de dos etapas: se ejecutan dos pases (selector y predictor), por lo que el coste de cómputo efectivo es superior al de un único ViT de tamaño equivalente.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM (RTX 3050, 3060, 4060, 4090, etc.). También es viable en CPU para inferencia por lotes pequeños.
- GPU de centro de datos (A100, H100, L40S) solo serían necesarias para procesar volúmenes muy grandes de imágenes o para reentrenamiento.
- Opciones de despliegue: PyTorch con el repositorio `ananthu-aniraj/ifam` clonado y `models.FullTwoStageModelDoubleClassify.from_pretrained(...)`. No hay soporte documentado para vLLM, TGI, Ollama, llama.cpp ni para `transformers`. La exportación a ONNX no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de rendimiento comparativos. La tabla siguiente recoge únicamente características públicas de referencia de alternativas de tamaño y tarea similares; las cifras de parámetros y licencias de los modelos de la competencia no proceden de la información facilitada para este modelo y deberían verificarse antes de usarlas en producción.

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| iFAM (metashift-k1) | 171,46 M | Clasificación de imágenes robusta (dos etapas) | Apache 2.0 | Pesos en safetensors; requiere código propio del repositorio |
| DINOv2 ViT-B/14 | ~86 M (referencia pública) | Backbone visual auto-supervisado | Apache 2.0 (referencia pública) | Pesos y código en transformers/HuggingFace |
| CLIP ViT-B/32 | ~151 M (referencia pública) | Clasificación y alineación imagen-texto | MIT (referencia pública) | Integrado en transformers |
| ResNet-50 | ~25,6 M (referencia pública) | Clasificación de imágenes | BSD-3-Clause en torchvision (referencia pública) | Integrado en torchvision |

Comparativa de rendimiento frente a estos modelos: no disponible.

## Limitaciones y advertencias

- Checkpoint de investigación con 0 descargas y 0 "likes": no hay evidencia comunitaria de funcionamiento correcto ni de reproducibilidad.
- No es un modelo de propósito general: está entrenado específicamente sobre Metashifts con K=1. Su comportamiento fuera de ese dominio o con más partes relevantes por imagen no está documentado.
- Requiere clonar el repositorio GitHub del autor y depender de una clase concreta (`FullTwoStageModelDoubleClassify`); no funciona con `AutoModel` ni con el flujo estándar de transformers, lo que complica el mantenimiento en producción.
- No se documentan tipos de cuantización soportados, resolución de entrenamiento distinta de la mostrada en el ejemplo (224x224), ni presupuesto de cómputo de entrenamiento.
- No se proporcionan análisis de sesgos ni evaluaciones por subgrupo. Al ser un clasificador de imágenes, el riesgo no es la alucinación de texto, sino errores de clasificación sistemáticos en clases o contextos poco representados en Metashifts.
- El enmascaramiento duro puede eliminar información contextual legítimamente predictiva en dominios donde el fondo sí es relevante, degradando la exactitud frente a un clasificador convencional.
- Ausencia total de capacidades lingüísticas: no admite prompts de texto, tool calling ni interacción conversacional.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se distribuye sin garantías y el autor no ofrece soporte; conviene revisar las condiciones del artículo y del repositorio de código, que son artefactos separados de los pesos.
- El artículo está aceptado en ICPR 2026; conviene consultar la versión final del paper antes de citar resultados o metodología.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/ananthu-aniraj/ifam-metashift-k1
- Artículo (arXiv): https://arxiv.org/abs/2506.08915
- Repositorio de código: https://github.com/ananthu-aniraj/ifam
- Venue de publicación: International Conference on Pattern Recognition (ICPR) 2026
- Búsqueda web realizada: no devolvió resultados relevantes sobre el modelo (solo páginas de inicio de sesión de Gmail sin relación con el contenido).
