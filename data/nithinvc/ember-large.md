# nithinvc/EMber-large

## Resumen

EMber es una familia de vision transformers preentrenados para extraer representaciones de imágenes de partículas de crio-microscopía electrónica de partícula única (cryo-EM). Lo desarrolla un equipo académico liderado por Nithin Chalapathi, junto con Theo Sternlieb, Ethan Han, Sonya M. Hanson, Pilar Cossio, Aditi S. Krishnapriyan y Ritwik Gupta. El problema que aborda es la ausencia de codificadores visuales de propósito general en el dominio cryo-EM: cada laboratorio suele reentrenar redes específicas para su dataset, y EMber propone un modelo fundacional preentrenado del que partir.

Dada una imagen de partícula, el modelo devuelve un embedding a nivel de imagen y características espaciales por parche, pensadas para tareas posteriores (clasificación 2D, agrupamiento, selección de partículas, análisis de heterogeneidad conformacional). El preentrenamiento se hizo con autodestilación sobre más de 50 millones de imágenes experimentales procedentes de 214 datasets de EMPIAR, complementadas con proyecciones simuladas de 268.000 ensamblados moleculares.

La variante Large que documenta esta ficha tiene 304,2 millones de parámetros, parches de 16x16 píxeles y pesos en safetensors (repo de 1,2 GB). Es relevante porque traslada al dominio estructural el patrón de "modelo fundacional + fine-tuning ligero" que ya domina la visión artificial general, y porque su código y preprints son públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) preentrenado por autodestilación, con parches de 16x16 píxeles; extracción de features a nivel de imagen y de parche |
| Parametros totales | 304.164.880 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; el número máximo de parches por imagen no está especificado en la información disponible) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | no aplicable (modelo de visión, no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,2 GB) |
| Tamano de parche | 16x16 píxeles |
| Tipo de salida | embedding de imagen + features espaciales por parche |
| Libreria / integracion | EMber (con model_hub_mixin y pytorch_model_hub_mixin) |
| Pipeline en HuggingFace | image-feature-extraction |

## Arquitectura y entrenamiento

EMber-Large es un transformer de visión con tokenización por parches de 16x16 píxeles que produce dos tipos de representación: un vector global por imagen y un mapa de características por parche, útil para localizar y comparar regiones. El entrenamiento emplea autodestilización (*self-distillation*), un esquema auto-supervisado en el que una vista del modelo actúa como profesor de otra vista, sin necesidad de etiquetas manuales. La model card no detalla el número exacto de tokens de entrenamiento, la composición del objetivo de destilación ni si hubo fases posteriores de ajuste supervisado o preferencias; esos datos figuran, en su caso, en el preprint asociado.

El corpus de preentrenamiento combina datos reales y sintéticos: más de 50 millones de imágenes de partículas experimentales provenientes de 214 datasets depositados en EMPIAR, junto con proyecciones simuladas generadas a partir de 268.000 ensamblados moleculares. Esa mezcla busca cubrir tanto la estadística real del ruido y de los artefactos del microscopio como la diversidad conformacional que solo se puede muestrear por simulación. No se documentan en la información disponible innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de representaciones de imágenes de partículas de cryo-EM, con embedding global por imagen.
- Producción de características espaciales por parche (16x16), aptas para tareas densas de localización y comparación.
- Preentrenamiento auto-supervisado que permite *fine-tuning* con pocas etiquetas en datasets pequeños de laboratorio.
- Espacio de embeddings utilizable para búsqueda por similitud, agrupamiento y detección de outliers en colecciones de partículas.
- Base para clasificación 2D, selección de partículas y análisis de heterogeneidad conformacional como tareas posteriores.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No procesa audio ni vídeo según la información disponible; el pipeline declarado es exclusivamente de imagen.
- Capacidades multilingües: no aplicables.

## Casos de uso

- **Clasificación 2D automatizada de partículas**: usar los embeddings globales como entrada de un clasificador ligero (k-means, UMAP + HDBSCAN o una capa lineal entrenada) para separar vistas de una muestra sin reentrenar un codificador desde cero.
- **Selección y limpieza de partículas**: ordenar por similitud respecto a referencias limpias y descartar imágenes de hielo, agregados o contaminantes antes de la reconstrucción 3D, aprovechando que el modelo se entrenó con datos experimentales ruidosos de EMPIAR.
- **Análisis de heterogeneidad conformacional**: agrupar partículas por sus features y detectar subpoblaciones conformacionales minoritarias que se perderían al promediar en una reconstrucción única.
- **Anotación asistida con pocas etiquetas**: *fine-tuning* de una cabeza de clasificación sobre los features congelados de EMber para etiquetas específicas del laboratorio (por ejemplo, estados de un complejo), reduciendo el coste de anotación manual.
- **Búsqueda y deduplicación en archivos de microscopía**: indexar un archivo histórico de imágenes con los embeddings del modelo y recuperar por similitud todas las partículas parecidas a una consulta, útil para auditar datasets o reutilizar anotaciones previas.
- **Control de calidad de sesiones de adquisición**: calcular la distribución de embeddings de una sesión nueva y compararla con la de sesiones de referencia para detectar deriva del microscopio, cambios de estado de la muestra o problemas de congelación.
- **Aprendizaje por transferencia hacia tareas inversas**: inicializar codificadores para tareas posteriores del pipeline cryo-EM (estimación de pose, *denoising*, clasificación 3D) partiendo de features preentrenados en lugar de inicialización aleatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | EMber-Large | Notas |
|---|---|---|
| Métricas de clasificación 2D | no disponible | No presentes en la model card ni en los resultados de búsqueda |
| Métricas de agrupamiento (*clustering*) | no disponible | ídem |
| Comparación con codificadores específicos de cryo-EM | no disponible | ídem |

Las cifras deberían consultarse en el preprint (arXiv 2610.22523) y en el repositorio de código antes de tomar decisiones de adopción.

## Requisitos de hardware

- **VRAM estimada en fp32**: en torno a 1,3-2 GB solo para pesos (304,2 M de parámetros a 4 bytes son ~1,22 GB), más activaciones; un presupuesto práctico de 2-4 GB cubre inferencia por lotes pequeños.
- **VRAM estimada en fp16/bf16**: ~0,6-0,7 GB de pesos; 1,5-2,5 GB con activaciones para lotes moderados.
- **GPU recomendadas**: cualquier GPU con 8 GB o más sirve para inferencia; para procesar lotes grandes de partículas a throughput alto, A100 40/80 GB, H100 o L40S. En el extremo consumer, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 son suficientes.
- **¿Cabe en GPU consumer?** Sí, con holgura: el modelo es de 304 M de parámetros y los pesos en safetensors ocupan 1,2 GB. Incluso una GPU de 4-6 GB puede ejecutar inferencia en fp16 con lotes pequeños.
- **Opciones de despliegue**: la model card solo declara la librería EMber con `model_hub_mixin` / `pytorch_model_hub_mixin`, es decir, carga directa desde PyTorch y HuggingFace Hub. No se documentan soportes para vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos generativos de texto, no aplicables aquí). Para servir el modelo en producción habría que envolverlo en un servicio propio (FastAPI, TorchServe, Triton) o exportarlo a ONNX/TorchScript, algo que la información disponible no documenta.
- **Latencia y throughput**: no disponibles. No hay cifras publicadas de latencia por imagen ni de imágenes por segundo en ninguna GPU.

## Comparativa con modelos similares

No se han encontrado en la información disponible modelos comparables específicos del dominio cryo-EM (codificadores preentrenados para imágenes de partículas). La búsqueda web realizada no devolvió resultados técnicos relevantes. Como referencia puramente arquitectónica, se incluye un codificador visual general de tamaño similar, advirtiendo que la comparación de rendimiento no está respaldada por datos:

| Modelo | Parametros | Dominio | Tamano de parche | Contexto | Licencia | Benchmark |
|---|---|---|---|---|---|---|
| EMber-Large | 304,2 M | Cryo-EM (partículas) | 16x16 | no disponible | no disponible | no disponible |
| DINOv2 ViT-L/14 | ~300 M | Visión general (imágenes naturales) | 14x14 | no disponible | no disponible en la información disponible | no disponible |
| ViT-L/16 (supervisado, referencia) | ~304 M | Visión general (ImageNet) | 16x16 | no disponible | no disponible en la información disponible | no disponible |

La comparación relevante para un laboratorio de cryo-EM no es frente a DINOv2, sino frente a su propio codificador entrenado *ad hoc*; esa comparación solo puede hacerse con los números del preprint.

## Limitaciones y advertencias

- **Licencia no declarada**: la model card no especifica licencia. Sin una licencia explícita, el uso comercial y la redistribución son jurídicamente inciertos; hay que contactar con los autores antes de integrar el modelo en un producto.
- **Sin resultados de benchmarks publicados en la información disponible**: no hay evidencia cuantitativa de que supere a alternativas, ni de su comportamiento en dominios distintos de los 214 datasets de EMPIAR usados en entrenamiento.
- **Sesgo de dominio**: el preentrenamiento está dominado por las muestras depositadas en EMPIAR y por proyecciones simuladas de 268.000 ensamblados. Proteínas de membrana, complejos muy pequeños, muestras con hielo vítreo anómalo o datos de detectores poco representados pueden quedar fuera de la distribución.
- **Riesgo de falsos positivos en agrupamiento**: los embeddings pueden separar por condiciones de adquisición (dosis, desenfoque, detector) en lugar de por estado conformacional; conviene validar los clústeres contra clases 2D y no asumir que la estructura del espacio latente es biológica.
- **Modelo de visión, no de lenguaje**: no admite instrucciones en lenguaje natural, tool calling ni razonamiento simbólico. Cualquier capa de interacción conversacional tendría que construirse aparte.
- **Ausencia de cuantizaciones oficiales**: al no haber GGUF ni versiones reducidas, el despliegue en entornos con restricciones de memoria depende de conversiones propias no validadas por los autores.
- **Metadatos anómalos**: el identificador de arXiv declarado (2610.22523) y las fechas del repositorio (creado en 2026) no son verificables con la información disponible; conviene confirmar la referencia del preprint antes de citarlo.
- **Madurez**: 0 descargas y 0 *likes* en el momento de la consulta, y ninguna validación independiente conocida. No es un modelo con historial de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/nithinvc/EMber-large
- Preprint (arXiv): https://arxiv.org/abs/2610.22523
- Código: https://github.com/nithinvc/EMber
- Web del primer autor: https://nithinvc.github.io/
- Theo Sternlieb: https://www.theosternlieb.com/
- Sonya M. Hanson: https://sonyahanson.github.io/
- Pilar Cossio: https://pilarcossio.org/
- Aditi S. Krishnapriyan: https://a1k12.github.io/
- Ritwik Gupta: https://ritwikgupta.me/
- Nota: la búsqueda web realizada no devolvió ningún resultado técnico relevante sobre EMber; los enlaces anteriores proceden exclusivamente de la model card del repositorio.
