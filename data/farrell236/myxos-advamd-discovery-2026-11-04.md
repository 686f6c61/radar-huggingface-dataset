# farrell236/myxos-advamd-discovery-2026-11-04

## Resumen

`farrell236/myxos-advamd-discovery-2026-11-04` es un modelo de clasificación de imágenes publicado en Hugging Face por el usuario `farrell236`, orientado según sus etiquetas a la investigación agéntica (`agentic-research`) en oftalmología, específicamente a la degeneración macular asociada a la edad (AMD, por sus siglas en inglés). El repositorio tiene un tamaño de 3,7 GB, lo que sugiere pesos de un modelo visual de tamaño medio, aunque no se especifica la arquitectura exacta ni el número de parámetros.

La información pública disponible es muy limitada: no se declara licencia, no se listan idiomas soportados, no hay descargas ni interacciones, y el acceso está restringido (gated), requiriendo aceptar condiciones en la plataforma. El nombre del repositorio incluye la fecha `2026-11-04`, lo que apunta a un experimento o snapshot de un pipeline de descubrimiento automatizado más que a un modelo de propósito general.

Por tanto, esta ficha se limita a describir lo que puede inferirse de los metadatos públicos y marca explícitamente como "no disponible" todo aquello que no ha sido publicado. No se han encontrado papers, blogs ni demos asociados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `image-classification`; presumiblemente un backbone visual tipo ViT o CNN, sin confirmar) |
| Parametros totales | no disponible (el tamaño del repo es de 3,7 GB, compatible con un modelo visual de cientos de millones de parámetros en fp32/fp16, pero no confirmado) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a clasificación de imágenes en sentido estricto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo pesa 3,7 GB; no se detalla si son safetensors, bin o GGUF) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La etiqueta `image-classification` en Hugging Face indica que la tarea principal es la clasificación de imágenes, y las etiquetas `ophthalmology` y `amd` sugieren que el dominio de aplicación es la imagen retiniana o de fondo de ojo para detección o estadificación de degeneración macular asociada a la edad. El tag `agentic-research` sugiere que el modelo forma parte de un pipeline de investigación automatizada, posiblemente generado o seleccionado por un agente, pero no se especifica el proceso.

No hay datos sobre el conjunto de entrenamiento (número de imágenes, procedencia, composición), ni sobre si se emplearon técnicas de aumento de datos, ajuste fino supervisado, RLHF o similares. Tampoco se documentan innovaciones técnicas como atención lineal, decodificación especulativa o destilación. Toda esta sección queda, por tanto, sin datos verificables.

## Capacidades

- Clasificación de imágenes en el dominio oftalmológico, presumiblemente para detección o categorización de AMD (degeneración macular asociada a la edad), según las etiquetas del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso (el tag `agentic-research` parece referirse al contexto de generación del modelo, no a una capacidad del mismo).
- Capacidades multilingües: no disponibles (no aplica directamente a un clasificador de imágenes, pero no se especifica nada al respecto).
- No se documentan modos especiales como thinking mode, visión general, audio o generación de texto.

## Casos de uso

- **Cribado automatizado de retinografías en investigación clínica**: el modelo podría emplearse para clasificar imágenes de fondo de ojo en categorías relacionadas con AMD, apoyando estudios poblacionales. La idoneidad viene dada por su etiquetado específico en oftalmología, aunque no hay métricas publicadas que confirmen su rendimiento.
- **Preetiquetado en pipelines de anotación**: dado su carácter de clasificador de imágenes, podría usarse para generar etiquetas preliminares que luego revisen especialistas, reduciendo el coste de anotación en datasets de AMD.
- **Filtrado de datasets oftalmológicos**: para seleccionar o descartar imágenes con sospecha de AMD en grandes repositorios de retinografías antes de un análisis más profundo.
- **Componente en un sistema agéntico de investigación**: encaja en arquitecturas donde un agente orquesta modelos especializados; este modelo actuaría como el módulo de clasificación visual dentro de un flujo mayor, coherente con el tag `agentic-research`.
- **Validación de modelos de segmentación o detección**: como clasificador auxiliar para comprobar la coherencia de etiquetas generadas por otros modelos en el mismo dominio.
- **Docencia y experimentación en imagen médica**: útil en entornos académicos para ilustrar pipelines de clasificación en oftalmología, siempre que se respeten las condiciones de acceso restringido y las consideraciones éticas sobre datos clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión. Con un repo de 3,7 GB, una inferencia en fp16 requeriría del orden de 4-8 GB de VRAM (pesos más activaciones), pero es una estimación basada únicamente en el tamaño del repositorio y no en especificaciones confirmadas.
- **GPU recomendadas**: no disponibles. Por tamaño, cabría esperar que funcionase en GPUs consumer de gama media-alta (RTX 3060 12 GB, RTX 4070, RTX 4090) y en GPUs de datacenter (A100, H100), pero no hay confirmación.
- **¿Cabe en GPU consumer?**: probablemente sí, dado el tamaño del repo, pero no confirmado.
- **Opciones de despliegue**: no documentadas. Al ser un modelo de `image-classification`, podría servirse con `transformers` + `pipeline`, TorchServe o similar, pero no se especifica.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de clasificación de AMD con los que establecer una comparación rigurosa (parámetros, contexto, rendimiento, licencia y disponibilidad). La ausencia de benchmarks y de licencia impide además cualquier comparación significativa.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es gated; es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que limita su uso inmediato y su reproducibilidad.
- **Licencia no especificada**: al no declararse licencia, no puede asumirse ningún derecho de uso comercial ni de redistribución. Cualquier uso en producción requiere contactar con el autor.
- **Sin documentación de sesgos**: no se han publicado análisis de sesgos demográficos, de equipamiento o de procedencia de las imágenes, algo crítico en imagen médica.
- **Riesgo de alucinación y falsos positivos/negativos**: en un clasificador médico, los errores de clasificación pueden tener consecuencias clínicas; no debe usarse como herramienta diagnóstica sin validación externa.
- **Sin métricas de rendimiento**: la ausencia de benchmarks impide evaluar su fiabilidad frente a alternativas.
- **Idiomas y contexto**: no aplica de forma directa, pero la falta de documentación sobre el dominio de las imágenes (resolución, modalidad, población) limita su generalización.
- **Madurez**: cero descargas y cero likes en el momento de la consulta, lo que sugiere un artefacto de investigación reciente o experimental, no un modelo validado por la comunidad.
- **Uso clínico**: no debe emplearse para diagnóstico sin aprobación regulatoria y validación prospectiva.

## Enlaces

- [Hugging Face: farrell236/myxos-advamd-discovery-2026-11-04](https://huggingface.co/farrell236/myxos-advamd-discovery-2026-11-04)
