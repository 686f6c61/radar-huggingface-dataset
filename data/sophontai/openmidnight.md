# SophontAI/OpenMidnight

## Resumen

OpenMidnight es un modelo fundacional de patología computacional (histopatología) publicado por SophontAI en Hugging Face, con el repositorio de desarrollo alojado en la organización MedARC-AI en GitHub. Está etiquetado como vision transformer basado en DINOv2 y orientado a imagen médica, con licencia Apache 2.0 y acceso restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de descargarlo.

El modelo resuelve el problema de disponer de una representación visual genérica y reutilizable de parches de tejido (whole-slide images, WSI), que sirva como backbone para tareas downstream de patología: clasificación de tejidos, detección de tumores, recuperación por similitud o segmentación. Este tipo de modelos fundacionales permite sustituir el entrenamiento desde cero por fine-tuning con relativamente pocas muestras etiquetadas.

La información pública disponible es limitada: se conocen la licencia (Apache 2.0), el tamaño del repositorio (12,7 GB), las etiquetas de arquitectura y la referencia al framework de evaluación `eva` de Kaiko.AI, pero no se han publicado en la información proporcionada el número de parámetros, la composición exacta del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer basado en DINOv2 (según etiquetas del repositorio) |
| Parametros totales | no disponible (el repositorio ocupa 12,7 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, opera sobre parches de imagen); no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas documentadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible explícitamente; el repositorio pesa 12,7 GB (compatible con pesos tipo safetensors, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura declarada es un vision transformer con preentrenamiento auto-supervisado al estilo DINOv2, según las etiquetas `vision-transformer` y `dinov2` del repositorio. DINOv2 produce representaciones visuales genéricas que se han mostrado eficaces como backbone en patología computacional, ya que permiten aprender de grandes volúmenes de parches sin anotaciones y transferir después a tareas supervisadas con pocas etiquetas.

No se ha publicado en la información proporcionada el número de tokens de entrenamiento, la composición del dataset (número de WSI, tipos de tejido, tinciones cubiertas, resolución de los parches), ni si se aplicaron etapas de ajuste supervisado, RLHF/DPO u otras. El repositorio de GitHub (MedARC-AI/OpenMidnight) menciona la evaluación mediante el framework `eva` de Kaiko.AI, lo que sugiere una integración orientada a benchmarking estandarizado de modelos fundacionales de patología, pero no se detallan los resultados obtenidos.

## Capacidades

- Extracción de características visuales de parches histopatológicos (embeddings densos reutilizables como backbone).
- Clasificación de tejido y subtipos tisulares mediante fine-tuning sobre las representaciones preentrenadas.
- Detección y localización de estructuras de interés (por ejemplo, regiones tumorales) cuando se combina con cabezas de clasificación o detección.
- Recuperación por similitud (retrieval) de parches o imágenes mediante comparación de embeddings.
- Segmentación a nivel de núcleo o de región como backbone en pipelines supervisados.
- Soporte de evaluación mediante el framework `eva` de Kaiko.AI (referenciado en el repositorio de GitHub).
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales texto-imagen en la información proporcionada.
- No consta soporte multilingüe (modelo de visión).

## Casos de uso

- Clasificación de tejido en WSI: usar los embeddings del modelo como entrada a un clasificador ligero entrenado con un conjunto pequeño de diapositivas anotadas, aprovechando el preentrenamiento auto-supervisado para reducir el coste de etiquetado.
- Detección asistida de cáncer: fine-tuning de una cabeza de clasificación binaria (tumor/no tumor) sobre los parches extraídos por el modelo, integrable en un pipeline de cribado previo a la revisión del patólogo.
- Búsqueda de casos similares: indexar los embeddings de parches de un archivo de diapositivas y realizar búsqueda por similitud vectorial para recuperar casos morfológicamente parecidos en investigación traslacional.
- Control de calidad de imágenes: entrenar un clasificador de artefactos (desenfoque, pliegues, tinción deficiente) sobre las características del modelo para filtrar diapositivas antes del análisis.
- Segmentación de núcleos y estructuras: congelar el backbone y entrenar un decodificador de segmentación para tareas de cuantificación morfológica.
- Investigación de biomarcadores: extraer representaciones de cohortes histológicas y correlacionarlas con variables clínicas en estudios observacionales.
- Integración en modelos visión-lenguaje de patología: utilizar los embeddings como torre visual en un sistema multimodal que genere informes descriptivos (requiere un componente lingüístico adicional, no incluido en este repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de GitHub referencia el framework `eva` de Kaiko.AI para la evaluación, pero no se han proporcionado métricas concretas (AUROC, accuracy, F1 u otras) en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 12,7 GB; una carga en precisión fp16 requiere aproximadamente 13 GB de VRAM más memoria para activaciones, por lo que se estiman en torno a 16-20 GB para inferencia con lotes pequeños (estimación derivada del tamaño del repositorio, no confirmada por el autor).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en fp16 con lotes moderados.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y RTX 3090 (24 GB); en GPUs de 16 GB podría requerir cuantización o procesamiento por lotes reducidos (no confirmado).
- Opciones de despliegue: no se especifican en la información proporcionada; al ser un modelo de visión basado en PyTorch, cabría esperar integración con frameworks habituales (PyTorch, ONNX, TensorRT), pero no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de información pública general y deben verificarse en sus fichas oficiales; no se dispone de comparación de rendimiento con OpenMidnight.

| Modelo | Desarrollador | Arquitectura | Parametros | Licencia | Acceso |
|---|---|---|---|---|---|
| OpenMidnight | SophontAI / MedARC-AI | ViT DINOv2 | no disponible | Apache 2.0 | Gated |
| UNI | Mahmood Lab | ViT-L/16 DINOv2 | ~307 M (dato público aproximado) | no comercial (verificar) | Abierto con condiciones |
| Virchow | Paige | ViT-H/14 DINOv2 | ~632 M (dato público aproximado) | verificar en ficha oficial | Gated |
| Prov-GigaPath | Microsoft / Providence | ViT-g/14 DINOv2 | ~1,1 B (dato público aproximado) | verificar en ficha oficial | Abierto con condiciones |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Ausencia de benchmarks publicados: no se han proporcionado métricas que permitan validar el rendimiento frente a alternativas establecidas.
- Validación comunitaria limitada: 0 descargas y 34 likes en el momento de la consulta; el modelo es muy reciente (publicado en noviembre de 2025).
- Uso clínico: un modelo de patología computacional no es un dispositivo médico; cualquier uso en diagnóstico requiere validación regulatoria (MDR en la UE, FDA en EE. UU.) y supervisión profesional.
- Sesgos: no documentados en la información disponible; los modelos entrenados con cohorts histológicas pueden presentar sesgos por tipo de tejido, tinción, escáner o población de origen.
- Riesgo de alucinación: no aplica en sentido lingüístico (modelo de visión), pero sí existe riesgo de clasificaciones erróneas con alta confianza en dominios fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones adicionales de acceso gated y las obligaciones regulatorias del ámbito sanitario.
- Cobertura de idiomas y modalidades: al ser un modelo de visión, no procesa texto; no consta soporte de otras modalidades.
- Formato y cuantizaciones: no documentados, lo que puede dificultar el despliegue en entornos con restricciones de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/SophontAI/OpenMidnight
- GitHub (MedARC-AI): https://github.com/MedARC-AI/OpenMidnight/
- Framework de evaluación `eva` (Kaiko.AI): referenciado en el repositorio de GitHub (no se ha proporcionado URL directa en la búsqueda).
- Nota: el resto de resultados de la búsqueda web (Lydia, Sumeria) no guardan relación con el modelo y se han descartado.
