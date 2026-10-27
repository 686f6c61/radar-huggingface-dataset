# ismaielnounou/sam3-shelves-v2

## Resumen

`ismaielnounou/sam3-shelves-v2` es un modelo publicado en Hugging Face por el usuario ismaielnounou, con pipeline declarado de `feature-extraction` y 840.376.374 parámetros almacenados en safetensors (repositorio de 3,4 GB). La model card es la plantilla automática de Hugging Face sin cumplimentar: todos los campos de descripción, datos de entrenamiento, evaluación y licencia figuran como "[More Information Needed]". No hay descargas ni "likes" registrados en el momento de la consulta.

El identificador y las etiquetas del repositorio (`sam3`, `feature-extraction`) sugieren una relación con la familia Segment Anything (SAM) y un ajuste orientado al dominio de estanterías ("shelves"), pero esta interpretación no está confirmada por ninguna documentación oficial del autor. El tamaño de 840 M de parámetros se sitúa en el rango de los codificadores de imagen tipo ViT-H de la familia SAM, aunque no se puede verificar la arquitectura con los datos disponibles.

La relevancia de esta ficha es, por tanto, la de un modelo sin documentar y sin validación comunitaria: útil únicamente como punto de partida para una evaluación empírica propia antes de considerar cualquier uso, y no como componente listo para producción sin auditoría previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no documentada; las etiquetas del repo apuntan a `sam3`) |
| Parametros totales | 840.376.374 (dato real de los safetensors) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible (modelo de extracción de características; no se documenta ventana de tokens) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos safetensors; el tamaño de 3,4 GB es coherente con pesos en fp32 |
| Idiomas soportados | No disponible (no es un modelo de texto; no se declara soporte idiomático) |
| Licencia | No disponible (ni la model card ni los metadatos del repositorio la especifican) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura. La model card es una plantilla generada automáticamente y no incluye descripción del modelo, tipo de arquitectura, objetivo de entrenamiento ni detalles del codificador. Las únicas pistas son las etiquetas del repositorio: `sam3` (que apunta a la familia Segment Anything Model 3), `feature-extraction` como pipeline declarado y `endpoints_compatible`, que indica compatibilidad con los endpoints de inferencia de Hugging Face. El nombre "shelves-v2" sugiere un ajuste fino sobre un modelo base orientado a la detección o segmentación de estanterías, pero se trata de una inferencia a partir del nombre, no de un dato documentado.

Tampoco se documentan los datos de entrenamiento: no se indica número de tokens o imágenes, composición del dataset, resolución de entrada, ni si hubo ajuste por RLHF, DPO o aprendizaje supervisado. La referencia `arxiv:1910.09700` que aparece en las etiquetas corresponde a Lacoste et al. (2019), el artículo de la calculadora de impacto medioambiental citado en la plantilla automática de Hugging Face, y no debe interpretarse como el paper del modelo. La model card menciona también entrenamiento en fp32, fp16 o bf16 como opciones genéricas de la plantilla, sin especificar cuál se utilizó.

## Capacidades

- Extracción de características: es la única capacidad declarada explícitamente, a través del campo `pipeline_tag: feature-extraction`. El modelo devuelve representaciones vectoriales, no texto generado.
- Procesamiento de imágenes (no confirmado): si la etiqueta `sam3` es correcta, el modelo operaría sobre entradas visuales; no hay documentación que lo confirme ni que detalle resoluciones o preprocesado.
- Segmentación (no confirmado): la familia SAM está orientada a segmentación promptable; no se ha verificado que este checkpoint conserve esa capacidad tras el ajuste.
- Tool calling / function calling: no disponible. No es un modelo generativo de texto y no se documenta ninguna interfaz de este tipo.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Modo "thinking", visión general o audio: no documentados.

## Casos de uso

Los siguientes escenarios son hipótesis de trabajo derivadas del nombre y del pipeline declarado, y requieren validación empírica antes de cualquier implantación:

- Recuperación visual de producto en retail: usar los embeddings del modelo para indexar imágenes de estanterías y permitir búsqueda por similitud (por ejemplo, localizar un SKU concreto a partir de una foto de lineal). Adecuado si los embeddings resultan discriminativos entre productos similares, algo que debe medirse con un conjunto propio.
- Auditoría de planogramas: comparar la representación de una imagen de estantería real con la del planograma teórico para detectar desviaciones de surtido o de colocación. Requiere confirmar que el modelo tolera variaciones de iluminación y perspectiva.
- Control de huecos y roturas de stock: procesar capturas periódicas de lineal y agrupar embeddings anómalos para señalar secciones vacías. Es un uso típico de modelos de extracción de características en pipelines de visión, sin necesidad de generación de texto.
- Etiquetado y deduplicación de catálogo: generar vectores por imagen de producto para agrupar duplicados o imágenes casi idénticas antes de una migración de PIM o de un reentrenamiento.
- Preprocesado para un pipeline mayor: emplear el modelo como extractor congelado cuyas salidas alimenten un clasificador ligero o un sistema de detección posterior, aprovechando sus 840 M de parámetros como backbone.
- Filtrado en moderación de contenido visual: calcular distancias en el espacio de embeddings para marcar imágenes fuera de distribución en un catálogo, como paso previo a revisión humana.
- Prototipado e investigación: servir como caso de estudio de un checkpoint sin model card, útil para practicar auditorías de modelos opacos antes de adoptarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye sección de evaluación cumplimentada, no hay métricas de mIoU, precisión de recuperación ni latencia, y las búsquedas web realizadas no han devuelto documentación asociada al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros, no de documentación oficial): en fp32, unos 3,4 GB solo de pesos, con 5-6 GB de pico contando activaciones a resolución moderada; en fp16/bf16, unos 1,7 GB de pesos y 3-4 GB de pico; en int8, unos 0,85 GB de pesos; en int4, unos 0,45 GB. Las activaciones de un codificador de imagen crecen con la resolución de entrada, por lo que estas cifras son un suelo orientativo.
- GPU recomendadas: para inferencia por lotes en producción, A100 40/80 GB, H100 o L40S permiten lotes grandes y mayor resolución; para desarrollo, RTX 4090 (24 GB) o RTX 3090 (24 GB) sobran para una instancia en fp16.
- GPU de consumo: sí cabe con holgura. Una RTX 3060 de 12 GB, una RTX 4070 de 12 GB o incluso tarjetas de 6-8 GB deberían ejecutar el modelo en fp16 para una sola imagen por vez.
- Opciones de despliegue: `transformers` de forma nativa (librería declarada); exportación a ONNX Runtime u otros runtimes no está documentada y requeriría verificación. vLLM y TGI no son adecuados, ya que están orientados a decodificación autoregresiva de texto y este checkpoint declara `feature-extraction`. La etiqueta `endpoints_compatible` indica que puede servirse mediante Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni es posible estimarlas con rigor sin conocer la resolución de entrada y el hardware objetivo.

## Comparativa con modelos similares

Los valores de las alternativas provienen de conocimiento general de fuentes públicas y no se han verificado en la búsqueda realizada; se marcan como tales. La comparación es aproximada porque la arquitectura de este checkpoint no está documentada.

| Modelo | Parametros | Contexto / entrada | Licencia | Estado de documentacion |
|---|---|---|---|---|
| ismaielnounou/sam3-shelves-v2 | 840 M | No disponible (entrada visual, no confirmada) | No disponible | Model card automática sin cumplimentar; 0 descargas |
| SAM (ViT-H), Meta | ~636 M (dato público, no verificado aquí) | Imagen de alta resolución, segmentación promptable | Apache 2.0 (no verificado aquí) | Paper y model card completos |
| SAM 2.1 (Hiera-L), Meta | ~224 M (dato público, no verificado aquí) | Imagen y vídeo, segmentación promptable | Apache 2.0 (no verificado aquí) | Paper, model card y demo |
| DINOv2 ViT-L/14, Meta | ~304 M (dato público, no verificado aquí) | Imagen, extracción de características | Apache 2.0 (no verificado aquí) | Paper y model card completos |

Frente a cualquiera de estas alternativas, la diferencia práctica no es de rendimiento sino de trazabilidad: los modelos de Meta cuentan con paper, evaluación pública y licencia explícita, mientras que este checkpoint no aporta ninguno de esos elementos.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explícita no hay autorización clara para uso comercial, redistribución ni modificación. En la práctica, el modelo debe tratarse como no apto para producción hasta que el autor aclare los términos.
- Model card vacía: no hay información sobre datos de entrenamiento, procedencia del dataset base, ni proceso de ajuste, lo que impide evaluar sesgos, contaminación de datos o cumplimiento normativo.
- Sesgos desconocidos: al no documentarse la composición del dataset, no se puede caracterizar el sesgo respecto a tipos de producto, iluminación, geografía o demografía de las imágenes de entrenamiento.
- Riesgo de sobreajuste al dominio "shelves": el nombre sugiere un ajuste específico a estanterías; es probable un deterioro del rendimiento fuera de ese dominio, algo que debe medirse.
- Ausencia total de benchmarks: no hay ninguna métrica que permita comparar su calidad con alternativas establecidas.
- Sin validación comunitaria: 0 descargas y 0 "likes" implican que no existen informes independientes de uso ni reproducciones de resultados.
- Ambigüedad de la etiqueta `sam3`: si el modelo es un derivado de SAM 3, podrían aplicar los términos de la licencia del modelo base, que no se indican en este repositorio.
- Alucinación en sentido generativo: no aplica, al no ser un modelo de texto. El riesgo equivalente es la producción de segmentaciones o embeddings incorrectos presentados con alta confianza, sin señal de incertidumbre documentada.
- Idiomas: no procede soporte lingüístico; no debe usarse como modelo de texto.
- Caveat de reproducción: la fecha de creación del repositorio (2026-10-27) y la ausencia de historial de commits dificultan verificar el linaje del checkpoint.
- Antes de cualquier uso: ejecutar una evaluación propia con un conjunto de validación del dominio objetivo y revisar los pesos en busca de comportamiento inesperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ismaielnounou/sam3-shelves-v2
- Paper citado en las etiquetas (Lacoste et al., 2019, calculadora de impacto medioambiental; artefacto de la plantilla, no paper del modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML mencionada en la plantilla: https://mlco2.github.io/impact
- Resultados de la búsqueda web: no se ha encontrado ninguna página, paper, blog, repositorio o demo asociada a este modelo. Los resultados devueltos tratan sobre diagnóstico de fallos en paneles fotovoltaicos y mencionan a autores de apellido Nounou, pero no guardan relación verificable con este checkpoint.
