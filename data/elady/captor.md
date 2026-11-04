# EladY/captor

## Resumen

CAPTOR (Caption-Anchored Patch-Term Occurrence Representation) es un método de segmentación de imágenes de vocabulario abierto que prescinde por completo de un codificador de texto. En lugar de alinear imágenes y texto mediante un modelo contrastivo tipo CLIP, CAPTOR cuenta la co-ocurrencia entre términos y las "palabras visuales" de un codificador de imagen congelado (los centroides k-means de sus tokens de parche) sobre un corpus de leyendas. El resultado son tablas de estadísticas precalculadas que, junto al codificador, permiten puntuar cualquier término en cualquier parche de una imagen sin entrenamiento adicional.

El repositorio publicado por Elad Yoshai y Natan T. Shaked (Universidad de Tel Aviv) contiene dos tablas preentrenadas: una para imágenes naturales sobre DINOv2 ViT-B/14 con registros (K=640, 78 objetos de COCO, mIoU 0.5654 en COCO val2017) y otra para patología computacional sobre el tronco de imagen de CONCH (K=80, 25 términos tisulares, mIoU 0.4966 en BCSS con 62 pacientes reservados).

La relevancia del trabajo es doble: por un lado elimina la dependencia de un codificador de texto y de pares imagen-texto alineados, reduciendo el coste de adaptar la segmentación abierta a dominios especializados; por otro, demuestra la viabilidad del enfoque en un dominio tan alejado de las imágenes naturales como la histopatología. El repositorio, de apenas 0,1 GB, contiene únicamente ficheros `.npz` con estadísticas, no pesos de red neuronal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Método training-free sobre codificador de imagen congelado (DINOv2 ViT-B/14 con registros o CONCH); sin codificador de texto |
| Parámetros totales | No disponible (el repositorio no incluye pesos de red; solo tablas estadísticas) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; el contexto relevante es el tamaño del corpus de leyendas) |
| Tipos de cuantización | No disponible (ficheros `.npz` de estadísticas en coma flotante; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (los términos de las tablas están en inglés: 78 objetos COCO y 25 términos tisulares) |
| Licencia | Mixta: `coco_dinov2reg_k640` bajo COCO captions (CC BY 4.0) y DINOv2 (Apache 2.0); `pathcap_conch_k80` bajo PathCap (CC BY-NC 2.0) y CONCH (CC BY-NC-ND 4.0, gated), solo investigación no comercial |
| Formato de pesos | `.npz` sin pickle (arrays `centroids` (V, K, D), `signatures` (V, K, T), `terms`, momentos del corpus, arrays opcionales de palabras conjuntas y entrada JSON `meta`); `MANIFEST.json` con ajustes, tamaño y SHA-256 |

## Arquitectura y entrenamiento

CAPTOR no entrena una red neuronal. El procedimiento consiste en extraer los tokens de parche de un codificador de imagen congelado, agruparlos con k-means para obtener K "palabras visuales" (centroides) y, sobre un corpus de leyendas, contar la co-ocurrencia de cada término con cada palabra visual. Esa cuenta se condensa en una firma por término (tensor `signatures` de forma V × K × T), de modo que la puntuación de un término en un parche de una imagen nueva se obtiene comparando la asignación de ese parche a las palabras visuales con la firma del término. Todo el cálculo es lineal y no requiere gradientes ni ajuste fino.

Las dos tablas publicadas ilustran la generalidad del enfoque. La de imágenes naturales usa DINOv2 ViT-B/14 con registros a 196 px, K=640 palabras visuales y cuatro vocabularios conjuntos, contadas sobre 15.000 imágenes de COCO train2017 para 78 objetos. La de patología usa el tronco de imagen de CONCH, K=80 y cuatro vocabularios, contados sobre 32.463 figuras de PathCap para 25 términos tisulares. La innovación técnica destacable es precisamente la ausencia de codificador de texto y de entrenamiento: la "grounding" textual se reduce a estadística de co-ocurrencia sobre palabras visuales.

## Capacidades

- Segmentación de imágenes de vocabulario abierto: puntúa cualquier término de su vocabulario en cada parche de la imagen y produce una máscara de segmentación.
- Funcionamiento sin codificador de texto: no necesita CLIP ni modelos de lenguaje multimodal en tiempo de inferencia.
- Adaptación a dominios especializados mediante recuento sobre un corpus de leyendas del dominio (demostrado en histopatología).
- Segmentación multietiqueta: la API `segment` acepta una lista de términos (`["cat", "dog", "bed"]`) y devuelve la segmentación para cada uno.
- Soporte de palabras visuales conjuntas (joint words) en las tablas publicadas, con cuatro vocabularios por tabla.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni capacidades multilingües más allá de los términos en inglés incluidos en cada tabla.

## Casos de uso

- Segmentación zero-shot en imágenes naturales: con la tabla `coco_dinov2reg_k640` y DINOv2, se pueden segmentar los 78 objetos de COCO en fotografías nuevas sin entrenamiento, útil para prototipado rápido de pipelines de visión.
- Anotación asistida en histopatología: con `pathcap_conch_k80` y CONCH, se segmentan 25 términos tisulares en figuras de patología, lo que permite preanotar regiones para revisión por patólogos y acelerar la creación de datasets.
- Adaptación a un nuevo dominio sin GPU de entrenamiento: basta con extraer palabras visuales del codificador congelado y contar co-ocurrencias sobre un corpus de leyendas del dominio; el coste es de estadística, no de ajuste fino.
- Evaluación de codificadores de imagen: las tablas permiten medir cuánta información semántica textual capturan las palabras visuales de un codificador concreto (DINOv2 frente a CONCH) sin entrenar un cabezal.
- Búsqueda y recuperación por término en archivos de imágenes médicas: puntuar términos tisulares sobre parches permite indexar diapositivas por estructuras presentes y filtrar por consulta textual.
- Docencia y experimentación reproducible: el formato `.npz` sin pickle y el `MANIFEST.json` con SHA-256 facilitan reproducir los resultados de referencia (mIoU 0.5654 en COCO val2017 y 0.4966 en BCSS) en entornos de investigación.
- Investigación en representaciones sin texto: sirve como línea base para comparar métodos de grounding que prescinden del codificador de texto frente a enfoques contrastivos tipo CLIP.

## Benchmarks y rendimiento

| Tabla | Codificador | Conjunto de evaluación | Métrica | Resultado |
|---|---|---|---|---|
| `coco_dinov2reg_k640` | DINOv2 ViT-B/14 con registros, 196 px | COCO val2017 (mitad de reporting) | mIoU | 0.5654 |
| `pathcap_conch_k80` | CONCH image trunk | BCSS, 62 pacientes reservados | mIoU | 0.4966 |

No se han publicado en la información disponible resultados comparativos con otros métodos (por ejemplo, frente a segmentación abierta basada en CLIP) ni métricas adicionales como precisión por clase o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del codificador utilizado (DINOv2 ViT-B/14 es un ViT-B, apto para GPU de consumo; CONCH es un modelo mayor y con acceso restringido).
- GPU recomendadas: no disponible de forma explícita; por el tamaño de los codificadores, una RTX 4090 o superior es suficiente para DINOv2 ViT-B/14, y se recomienda A100/H100 para lotes grandes o para CONCH.
- Cabe en GPU de consumo: sí para la tabla COCO con DINOv2 ViT-B/14; para CONCH no hay datos en la información disponible.
- Opciones de despliegue: el paquete oficial se instala con `pip install git+https://github.com/EladYoshai/captor.git` y se usa mediante `CAPTOR.from_pretrained(...)`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CAPTOR (este) | Estadísticas de co-ocurrencia sobre codificador congelado, sin codificador de texto | No disponible (tablas de 0,1 GB) | No aplica | mIoU 0.5654 (COCO val2017); 0.4966 (BCSS) | Mixta (CC BY 4.0 + Apache 2.0; CC BY-NC 2.0 + CC BY-NC-ND 4.0) | HuggingFace, código en GitHub |
| Segmentación abierta basada en CLIP (familia genérica) | Alineamiento imagen-texto contrastivo | No disponible | No aplica | No disponible en la información proporcionada | No disponible | No disponible |
| SAM (Segment Anything) | Segmentación promptable | No disponible | No aplica | No disponible en la información proporcionada | No disponible | No disponible |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El repositorio no contiene pesos de red neuronal: solo tablas estadísticas. Los codificadores (DINOv2 y CONCH) deben obtenerse por separado bajo sus propias licencias.
- La tabla de patología (`pathcap_conch_k80`) está limitada a uso de investigación no comercial por las licencias de PathCap (CC BY-NC 2.0) y CONCH (CC BY-NC-ND 4.0, gated); no es apta para producción comercial.
- El vocabulario de términos está fijado en las tablas (78 objetos COCO y 25 términos tisulares); no hay evidencia de generalización a términos fuera de ese vocabulario sin recalcular las firmas.
- Los términos están en inglés; no se documenta soporte multilingüe.
- El método depende de la calidad y del sesgo del corpus de leyendas: los sesgos de COCO o de PathCap se trasladan a las firmas de los términos.
- Riesgo de falsos positivos en parches ambiguos: la puntuación se basa en co-ocurrencia estadística, no en comprensión semántica, por lo que puede asignar términos a regiones con apariencia similar.
- No es un modelo generativo: no produce texto, no razona y no soporta agentes ni tool calling.
- Los resultados de referencia se han medido en conjuntos concretos (COCO val2017 y BCSS con 62 pacientes reservados); no se garantiza un rendimiento equivalente en otros dominios o poblaciones.
- La cita del artículo apunta a un arXiv con identificador pendiente (`arXiv:TODO`), por lo que la referencia bibliográfica aún no es estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EladY/captor
- Código: https://github.com/EladYoshai/captor
- DINOv2 (codificador, Apache 2.0): https://github.com/facebookresearch/dinov2
- CONCH (codificador, CC BY-NC-ND 4.0, gated): no disponible en la información proporcionada
- PathCap / PathAsst (Sun et al., 2023): no disponible en la información proporcionada
- Artículo: arXiv preprint con identificador pendiente (`arXiv:TODO`)
