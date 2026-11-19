# Meghamsh111/KBOT-models

## Resumen

KBOT-models es un repositorio de artefactos de modelos (no un modelo único entrenado de forma original) publicado por el usuario Meghamsh111 en Hugging Face. Contiene los checkpoints congelados del pipeline de visión por computador del proyecto K-Bot, orientado a la detección de símbolos de circuitos eléctricos y a tareas de segmentación asociadas. El repositorio tiene un tamaño de 1,8 GB y está etiquetado con las tareas de `object-detection` y `segmentation`, además de la etiqueta temática `circuit-diagrams`.

El paquete incluye tres ficheros: un detector de símbolos de circuito basado en YOLO (`yolo26n-final50.pt`), el backbone SAM2.1 en su variante large (`sam2.1_hiera_large.pt`) y un checkpoint adaptado de SAM (`circuitvision_finetuned.pth`) reutilizado del proyecto CircuitVision. Según la propia model card, el proyecto no ha entrenado de forma original el checkpoint adaptado, sino que lo reutiliza, y el detector YOLO es un checkpoint propio del proyecto.

La relevancia de este repositorio es limitada para la comunidad general: se trata de un archivo de artefactos de un pipeline concreto, con una licencia mixta (`mixed-project-and-upstream-terms`) y una advertencia explícita de no distribución ("DO NOT DISTRIBUTE — INTELLECTUAL PROPERTY OF HKU ECE"). No es un modelo de lenguaje ni un modelo fundacional reutilizable de forma general, y su uso está restringido por los términos del proyecto y por los derechos de los componentes upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de visión: detector YOLO (detección de objetos) + backbone SAM2.1 (segmentación) + checkpoint SAM adaptado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | `mixed-project-and-upstream-terms` (licencia mixta proyecto + upstream) |
| Formato de pesos | PyTorch (`.pt`, `.pth`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo único con una arquitectura homogénea, sino tres artefactos con procedencias distintas. El primero, `yolo26n-final50.pt`, es un checkpoint de detector de símbolos de circuitos basado en la familia YOLO (según la nomenclatura del fichero, variante "n" y entrenamiento de 50 épocas), de autoría del proyecto y sujeto a los términos de runtime de Ultralytics. El segundo, `sam2.1_hiera_large.pt`, es el backbone SAM2.1 en variante large, un checkpoint base preentrenado por Meta con sus propios términos upstream. El tercero, `circuitvision_finetuned.pth`, es un checkpoint de SAM adaptado, reutilizado del proyecto CircuitVision y no entrenado de nuevo por K-Bot.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable a un modelo de visión) ni innovaciones técnicas específicas. La model card indica explícitamente que los conjuntos de datos, los ejemplos privados y los pesos de modelos de lenguaje alojados no están incluidos en el repositorio, y que las sumas de verificación SHA-256 exactas están en `ARTIFACTS.json`. La instantánea de código correspondiente está etiquetada como `FREEZE-2026-11-19` en el repositorio fuente privado.

## Capacidades

- Detección de símbolos de circuitos eléctricos mediante el detector YOLO incluido.
- Segmentación de imágenes respaldada por el backbone SAM2.1 y el checkpoint adaptado de CircuitVision.
- Procesamiento de diagramas de circuitos como dominio específico de aplicación.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, audio ni tool calling.
- No se documenta soporte multilingüe (no es un modelo lingüístico).
- No se documentan modos especiales como thinking mode o decodificación especulativa.

## Casos de uso

- Digitalización de esquemas eléctricos: el detector YOLO puede localizar símbolos de circuito en imágenes de diagramas para su posterior conversión a representaciones estructuradas, aprovechando que está entrenado específicamente sobre ese dominio.
- Segmentación de componentes en diagramas: el checkpoint SAM adaptado permite delimitar con precisión las regiones de cada símbolo, útil para tareas de post-procesado o extracción de recortes.
- Verificación de artefactos en pipelines de investigación: dado que el repositorio incluye `ARTIFACTS.json` con checksums, puede emplearse para reproducir el estado congelado (`FREEZE-2026-11-19`) de un experimento académico.
- Integración en herramientas de análisis de circuitos: los checkpoints pueden servir como base para un sistema de reconocimiento automático de esquemas dentro de un flujo más amplio de ingeniería electrónica.
- Evaluación comparativa de detectores y segmentadores en el dominio de diagramas de circuitos, usando los checkpoints como referencia frente a modelos genéricos.
- Docencia e investigación en visión por computador aplicada a EDA (electronic design automation), siempre que se respeten los términos de licencia y la restricción de no distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 1,8 GB, pero no se desglosa por fichero ni se indica el número de parámetros de cada checkpoint.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; SAM2.1 large y los detectores YOLO suelen requerir GPU dedicada, pero no se aportan datos concretos para este repositorio.
- Opciones de despliegue: no disponible. La model card remite al repositorio fuente privado y a `run.md` para la guía de configuración, que no está incluida.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KBOT-models | Pipeline visión (YOLO + SAM2.1 + SAM adaptado) | no disponible | no aplica | Mixta proyecto + upstream | Público en HF, uso restringido |
| SAM2.1 (Meta) | Segmentación | no disponible en la información | no aplica | Términos upstream de Meta | Público |
| YOLO (Ultralytics) | Detección de objetos | no disponible en la información | no aplica | Términos de Ultralytics | Público |
| CircuitVision | Segmentación adaptada a circuitos | no disponible en la información | no aplica | No verificada | Repositorio público en GitHub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card incluye la advertencia explícita "DO NOT DISTRIBUTE — INTELLECTUAL PROPERTY OF HKU ECE", lo que restringe la redistribución de los artefactos.
- La licencia es mixta (`mixed-project-and-upstream-terms`): los términos del proyecto no anulan los derechos upstream de Meta (SAM2.1) ni de Ultralytics (YOLO).
- Los derechos de redistribución del checkpoint adaptado `circuitvision_finetuned.pth` no están verificados según la propia model card.
- El alojamiento público no otorga licencia sobre el material del proyecto ni establece propiedad.
- Los ficheros no constituyen por sí solos una aplicación autónoma ni una garantía de precisión general en circuitos.
- No se incluyen datasets, ejemplos privados ni pesos de modelos de lenguaje, por lo que no es posible reproducir el pipeline completo solo con este repositorio.
- No hay información sobre sesgos, riesgo de alucinación (no aplicable a un modelo de visión en el sentido habitual) ni limitaciones idiomáticas.
- Para uso comercial es necesario obtener autorización y verificar los términos upstream correspondientes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Meghamsh111/KBOT-models
- Repositorio fuente del proyecto (privado según la model card): https://github.com/meghamshb/KBOT
- Proyecto CircuitVision: https://github.com/JKc66/CircuitVision
