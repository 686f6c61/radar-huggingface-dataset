# bambezius/sam31-output-distill-512x16

## Resumen

`bambezius/sam31-output-distill-512x16` es un checkpoint de seguimiento de objetos en vídeo, concretamente un rastreador de balón, obtenido por destilación de salidas (*output distillation*) a partir de `facebook/sam3.1`. Lo publica el usuario bambezius en HuggingFace y no es un modelo de lenguaje: es un modelo de visión por computador, derivado de la arquitectura de SAM 3.1 (identificada en la model card como StreamingSAM31), que conserva el decodificador y el mecanismo de memoria del modelo original.

El modelo es un *student* entrenado exclusivamente con supervisión del *teacher*: probabilidades de máscara y puntuaciones de presencia cacheadas sobre un conjunto de entrenamiento propio, con una única semilla YOLO cacheada por clip y sin anotaciones humanas ni objetivos derivados de cajas. El encoder retiene los bloques 0–15 con una poda aleatoria (con semilla fija) de cabezas y canales completos, y el checkpoint declara 85.454.646 parámetros de *tracking*.

Su interés es reducir el coste del modelo base manteniendo el comportamiento del *teacher*, lo que facilitaría el despliegue en entornos con recursos limitados. Sin embargo, se trata de un checkpoint de proyecto en curso: requiere el modelo base oficial SAM 3.1 (con acceso restringido) y el runtime del proyecto, y su validación mide acuerdo con el *teacher*, no precisión contra *ground truth*. En el momento de la consulta acumula 0 descargas y 0 *likes*.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StreamingSAM31 (derivada de SAM 3.1): encoder con bloques 0–15 retenidos y poda aleatoria de cabezas y canales; decoder y arquitectura de memoria sin cambios |
| Parametros totales | 85.454.646 parametros de tracking (cifra declarada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el identificador 512x16 sugiere 512 px y 16 fotogramas por clip, pero la model card no lo confirma |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto) |
| Licencia | other / sam-license (SAM License; siguen aplicando los permisos sobre los datos de origen) |
| Formato de pesos | checkpoint con el estado completo de StreamingSAM31 en formato pickle de PyTorch (no son pesos independientes del predictor oficial). Tamano del repositorio: 1,7 GB |

## Arquitectura y entrenamiento

La arquitectura parte de SAM 3.1 y mantiene intactos el decodificador y el mecanismo de memoria, mientras que el encoder se poda reteniendo los bloques 0–15 y aplicando una poda aleatoria, con semilla fija, de cabezas y canales completos. El modelo inicializa sus pesos a partir del *teacher* original ya afinado (época 5), no del modelo podado anterior. El estudiante conserva su propia memoria: el desacoplamiento de gradiente no reinicia el historial. Los índices exactos de poda y la partición de entrenamiento/validación del *teacher* están documentados en `signature.json`.

El entrenamiento es una destilación de salidas en la que la supervisión del *student* proviene exclusivamente de probabilidades de máscara y puntuaciones de presencia cacheadas del *teacher* sobre un conjunto de entrenamiento propio; no hay anotaciones humanas ni objetivos derivados de cajas. Se emplea una única semilla YOLO cacheada por clip y no se repiten *prompts* ni se reinician valores de *ground truth*. Los fotogramas iniciales y previos a la semilla se excluyen, y los clips sin semilla se tratan como desconocidos, no como negativos. El proceso se ejecuta mediante `scripts/train_sam31_output_distillation.py` con la configuración del repositorio.

## Capacidades

- Seguimiento de objetos en vídeo con máscaras de segmentación, especializado en el seguimiento de balón.
- Puntuaciones de presencia por objeto, lo que permite distinguir entre objeto presente, ausente y estado desconocido en clips sin semilla.
- Memoria propia de estado (*streaming*), con arquitectura de memoria heredada sin cambios respecto a SAM 3.1.
- Inicialización del seguimiento mediante una semilla YOLO cacheada por clip (una sola por clip, sin repetición de *prompts*).
- Ejecución con menor coste de parámetros que el *teacher* gracias a la poda del encoder.
- No hay evidencia en la model card de *tool calling*, soporte de agentes, capacidades multilingües, generación de texto o código, matemáticas, visión-lenguaje, audio ni modo de razonamiento.

## Casos de uso

- **Analítica deportiva en retransmisiones**: seguimiento del balón fotograma a fotograma para derivar trayectorias, velocidad y tiempos de posesión a partir de la máscara y la puntuación de presencia.
- **Generación automática de resúmenes y highlights**: la traza del balón permite segmentar las jugadas relevantes y recortar los clips sin intervención manual.
- **Revisión de jugadas asistida**: la localización continua del balón sirve como apoyo para revisar acciones dudosas, con la salvedad de que la validación del modelo mide acuerdo con el *teacher*, no acierto real.
- **Preetiquetado de datasets de visión**: el modelo genera máscaras candidatas que después se corrigen manualmente, reduciendo el coste de anotar vídeo deportivo.
- **Despliegue en hardware modesto**: con 85,4 millones de parámetros y un repositorio de 1,7 GB, es candidato a ejecutarse en GPU de consumo donde el modelo base completo no cabría con holgura.
- **Investigación en destilación y poda**: sirve como caso reproducible para estudiar cómo afectan la poda del encoder y la destilación de salidas al comportamiento de un modelo de segmentación y *tracking*.
- **Robótica y sistemas de seguimiento en tiempo real**: el seguimiento de objetos esféricos con memoria propia encaja en lazos de control que necesitan posición estable del objeto a lo largo del tiempo.
- **Efectos y realidad aumentada en vídeo**: la máscara del balón permite insertar gráficos o superposiciones ancladas al objeto en emisiones y contenido grabado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que la validación mide el acuerdo con el *teacher* (probabilidades de máscara y puntuaciones de presencia) y no la precisión contra *ground truth*, pero no incluye cifras concretas de esa validación.

## Requisitos de hardware

- Peso de los parámetros: 85.454.646 parámetros equivalen a unos 342 MB en fp32, 171 MB en fp16 y 85 MB en int8. Son estimaciones aritméticas a partir del recuento declarado, no cifras confirmadas por el autor.
- VRAM total: no disponible. Además de los pesos hay que contabilizar las activaciones del encoder y el estado de memoria por clip, cuyo consumo depende de la resolución y del número de fotogramas.
- GPU recomendadas: no disponible. Por tamaño de parámetros es plausible que quepa en GPU de consumo con 8–12 GB (por ejemplo RTX 3060, 4060, 4070 o 4090), pero no hay confirmación en la documentación.
- Dependencia de ejecución: requiere el modelo base oficial SAM 3.1 (con acceso restringido, *gated*) y el runtime del proyecto. No es un checkpoint autónomo y no incluye pesos independientes del predictor oficial.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje. El proyecto indica usar `scripts/train_sam31_output_distillation.py` junto con su configuración.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto o regimen | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| bambezius/sam31-output-distill-512x16 | 85.454.646 (tracking) | vídeo, clips con semilla YOLO cacheada | sam-license | publico, requiere base SAM 3.1 gated y runtime del proyecto | no disponible (solo acuerdo con el teacher, sin cifras) |
| facebook/sam3.1 (*teacher*) | no disponible | vídeo, arquitectura StreamingSAM31 sin podar | SAM License | repo gated de Meta | no disponible en la informacion proporcionada |
| facebook/sam2.1 (generacion anterior de la familia SAM para video) | no disponible | vídeo, arquitectura sin streaming de memoria de SAM 3.1 | Apache 2.0 (segun la familia SAM 2) | publico | no disponible en la informacion proporcionada |

No se dispone de cifras comparativas de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La validación mide acuerdo con el *teacher*, no precisión contra *ground truth*: no hay evidencia publicada de calidad real de seguimiento.
- Sesgos probables hacia el dominio del conjunto de entrenamiento propio (seguimiento de balón en vídeo), que no se describe en la model card.
- Los clips sin semilla se marcan como desconocidos, no como negativos; cualquier métrica que los trate como ausencias introducirá error.
- El modelo no es un checkpoint autónomo: depende del modelo base oficial SAM 3.1, que está restringido, y del runtime del proyecto.
- El checkpoint está almacenado en formato pickle. La propia model card advierte de cargar únicamente ficheros pickle de confianza por el riesgo de ejecución de código arbitrario.
- Licencia `other` con nombre `sam-license`: persisten la licencia SAM original y los permisos sobre los datos de origen, con las restricciones que ello impone al uso comercial.
- No se incluyen imágenes ni anotaciones de origen en el repositorio.
- No hay datos publicados de cuantizaciones, latencia, throughput ni benchmarks, lo que dificulta planificar un despliegue en producción.
- El repositorio tiene 0 descargas y 0 *likes*, por lo que no ha pasado por validación de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambezius/sam31-output-distill-512x16
- Modelo base: https://huggingface.co/facebook/sam3.1
- Fichero de licencia del repositorio: `LICENSE` (referenciado en la model card)
- Índices de poda y partición de validación: `signature.json` (incluido en el repositorio)
- Script de entrenamiento: `scripts/train_sam31_output_distillation.py` (incluido en el repositorio)
- Las búsquedas web realizadas no devolvieron enlaces relevantes al modelo: solo aparecieron páginas generales de Amazon sin relación con SAM 3.1 ni con este checkpoint.
