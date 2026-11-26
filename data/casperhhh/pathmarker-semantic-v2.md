# Casperhhh/PathMarker-Semantic-v2

## Resumen
PathMarker-Semantic-v2 es un modelo de segmentación semántica de imágenes especializado en histopatología, publicado en Hugging Face por el usuario Casperhhh bajo la licencia SAM License. El modelo se distribuye con el pipeline `image-segmentation` y está pensado para delimitar regiones tisulares y estructuras histológicas en preparaciones de patología, una tarea crítica para flujos de trabajo de patología digital y análisis asistido por computador.

El repositorio ocupa 3,3 GB, lo que sugiere un modelo de tamaño medio con pesos probablemente derivados de la familia Segment Anything Model (SAM), dada la licencia asociada. No se han publicado en la información disponible datos sobre arquitectura exacta, número de parámetros, longitud de contexto (no aplica a segmentación) ni composición del dataset de entrenamiento.

El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. El modelo no registra descargas ni interacciones en el momento de la consulta, por lo que se trata de una publicación reciente y de baja exposición pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente derivada de SAM, por la licencia; no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | SAM License (etiquetada como "other" en Hugging Face) |
| Formato de pesos | no disponible (repo de 3,3 GB; formato concreto no especificado) |

## Arquitectura y entrenamiento
No se ha publicado en la información disponible la arquitectura interna del modelo. La etiqueta de licencia (SAM License) y el pipeline de segmentación semántica apuntan a una arquitectura de segmentación basada en imagen, posiblemente una adaptación de Segment Anything Model al dominio histopatológico, pero esta hipótesis no está confirmada por la documentación del repositorio.

Tampoco se dispone de datos sobre el volumen de entrenamiento, la composición del dataset (número de imágenes, tipos de tejido, tinciones cubiertas como H&E o inmunohistoquímica), ni sobre si se aplicaron técnicas de ajuste fino supervisado, destilación o aumento de datos. Cualquier afirmación al respecto sería especulativa.

## Capacidades
- Segmentación semántica de imágenes histopatológicas: el pipeline declarado es `image-segmentation`, orientado a producir máscaras por clase o región.
- Especialización en dominio de patología: las etiquetas `pathology` e `histopathology` indican que el modelo está ajustado a imágenes de tejidos, no a fotografía natural genérica.
- Segmentación de imágenes en general (`image-segmentation`): la etiqueta secundaria sugiere aplicabilidad fuera del dominio patológico, aunque sin garantías documentadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica (modelo de visión).
- Capacidades especiales (thinking mode, visión, audio): únicamente segmentación de imagen; no se documentan otras.

## Casos de uso
- Cuantificación de área tumoral: el modelo puede generar máscaras de regiones tumorales sobre portaobjetos digitalizados para calcular el porcentaje de tejido afectado, un paso habitual en informes anatomopatológicos cuantitativos.
- Segmentación de núcleos y estructuras celulares: si el modelo cubre clases celulares, permitiría extraer recuentos y morfometrías (área nuclear, densidad) para estudios de grado histológico.
- Preprocesado en pipelines de patología digital: integrar el modelo como etapa de segmentación previa a clasificadores de subtipo tumoral o a modelos de detección de mitosis, reduciendo el ruido de fondo (fondo blanco, artefactos de tinción).
- Control de calidad de tinciones: comparar la máscara de tejido frente al área total del portaobjetos para detectar preparaciones mal teñidas, plegadas o con poco material evaluable.
- Investigación traslacional: segmentar cohortes completas de imágenes para extraer features morfológicas agregadas y correlacionarlas con variables clínicas en estudios retrospectivos.
- Anotación asistida: usar las máscaras generadas como propuesta inicial que un patólogo revisa y corrige, acelerando la creación de datasets etiquetados en proyectos internos.
- Análisis de inmunohistoquímica: si el modelo distingue regiones positivas y negativas, podría apoyar la cuantificación de índices de proliferación o expresión de marcadores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible con precisión; el repo de 3,3 GB sugiere que los pesos en precisión original podrían requerir del orden de 4-8 GB de VRAM, pero el dato no está confirmado.
- GPU recomendadas: no disponible. Por tamaño de repo, una GPU consumer con 8-16 GB (RTX 3060, 4070, 4090) sería un punto de partida razonable, sin garantía.
- Cabe en GPU consumer: probablemente sí en modelos con 8 GB o más, sujeto a verificación empírica.
- Opciones de despliegue: no documentadas. Al ser un pipeline de Hugging Face `image-segmentation`, cabría esperar compatibilidad con `transformers` y `timm`, pero no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PathMarker-Semantic-v2 | no disponible | no aplica | Histopatología | SAM License | Gated en Hugging Face |
| SAM (Segment Anything) | no disponible en esta ficha | no aplica | Imagen natural general | Apache 2.0 (versión original) | Pública |
| SAM 2 | no disponible en esta ficha | no aplica | Imagen y vídeo | Apache 2.0 (con matices) | Pública |
| Modelos de patología tipo HoVer-Net / CellViT | no disponible en esta ficha | no aplica | Histopatología (núcleos) | Variable por proyecto | Pública (repos de investigación) |

La comparación cuantitativa no es posible con los datos disponibles; la tabla recoge únicamente categorías y licencias.

## Limitaciones y advertencias
- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es descargable de forma anónima ni redistribuible sin revisar la SAM License.
- Licencia SAM: impone condiciones específicas de uso (habitualmente atribución y restricciones en usos comerciales o militares); conviene revisar el texto completo antes de integrarlo en producto.
- Sin validación pública: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso independiente ni de validación externa.
- Ausencia de documentación técnica: no se detallan clases soportadas, tinciones cubiertas, resolución de entrada ni métricas de calidad, lo que impide estimar su fiabilidad clínica.
- Riesgo de alucinación en segmentación: como todo modelo de segmentación, puede generar máscaras plausibles pero incorrectas en tejidos atípicos, artefactos o tinciones no vistas en entrenamiento.
- Sesgos de dominio: si el entrenamiento se limitó a un tipo de tejido, tinción o escáner, el rendimiento caerá fuera de esa distribución.
- Uso clínico: no debe emplearse como herramienta diagnóstica sin validación regulatoria y supervisión de un patólogo.
- Idiomas: no aplica, pero conviene señalar que no procesa texto ni metadatos clínicos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Casperhhh/PathMarker-Semantic-v2
- Perfil del autor: https://huggingface.co/Casperhhh
- Licencia SAM (texto de referencia): https://github.com/facebookresearch/segment-anything/blob/main/LICENSE
- Repositorio SAM (referencia técnica): https://github.com/facebookresearch/segment-anything
