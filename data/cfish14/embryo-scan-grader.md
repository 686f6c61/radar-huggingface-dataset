# Cfish14/embryo-scan-grader

## Resumen

Embryo Scan blastocyst grader es un clasificador de imágenes médicas publicado por el usuario Cfish14 en HuggingFace. Se trata de un conjunto de cinco modelos ConvNeXt-Tiny entrenados mediante validación cruzada de 5 particiones (5-fold cross-fitting) que asignan una nota a fotografías de blastocistos humanos de día 5 según la escala de Gardner: expansión (1-5), masa celular interna (A-C) y trofectodermo (A-C). Cada fold se distribuye como un state dict independiente de PyTorch y la inferencia se realiza en conjunto (ensemble) con aumento de datos en test de 8 vistas.

El problema que aborda es la evaluación morfológica de embriones en tratamientos de fecundación in vitro, una tarea que tradicionalmente realizan embriólogos de forma manual y con variabilidad interobservador. El modelo se entrena sobre el dataset anotado de blastocistos de Kromp et al. 2023 (Scientific Data, figshare, CC BY 4.0) y reporta una precisión de 0,853 en expansión, 0,714 en masa celular interna y 0,660 en trofectodermo sobre un conjunto de test de 300 fotografías evaluadas por un panel de embriólogos.

Es relevante ahora porque iguala o supera ligeramente a los embriólogos individuales en expansión y trofectodermo, y porque sus pesos se liberan íntegramente bajo licencia CC BY 4.0 junto con el código de entrenamiento y evaluación, lo que permite reproducir y auditar los resultados. No obstante, el propio autor lo califica como proyecto de investigación y no como producto sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (backbone timm `convnext_tiny.fb_in22k_ft_in1k`) con tres cabezas de clasificación; ensemble de 5 modelos entrenados con 5-fold cross-fitting |
| Parametros totales | no disponible en la model card (el backbone ConvNeXt-Tiny estandar tiene del orden de 28 M de parametros, sin contar las tres cabezas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen en escala de grises de 384 x 288 píxeles) |
| Tipos de cuantizacion | no disponible (se distribuyen state dicts de PyTorch; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (modelo de clasificación de imagen, no procesa texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch state dicts (`.pt`): `fold-0.pt` a `fold-4.pt` |
| Tamano del repositorio | 0,6 GB |
| Pipeline en HuggingFace | image-classification |
| Fecha de publicacion indicada | 2026-10-12 (creado); 2026-10-12 (actualizado) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional ConvNeXt-Tiny utilizada como extractor de características, con un backbone inicializado desde los pesos `convnext_tiny.fb_in22k_ft_in1k` de timm (preentrenamiento en ImageNet-22k y ajuste posterior en ImageNet-1k) y tres cabezas de clasificación superpuestas: una para el grado de expansión (5 clases, 1-5), otra para la masa celular interna (3 clases, A-C) y otra para el trofectodermo (3 clases, A-C). El autor entrena cinco instancias independientes mediante validación cruzada de 5 particiones y las combina en inferencia, aplicando además aumento de datos en tiempo de test con 8 vistas (8-view TTA) sobre el conjunto de 5 modelos. La entrada es una imagen en escala de grises de 384 x 288 píxeles.

Los datos de entrenamiento proceden del dataset de blastocistos de Kromp et al. 2023, *An annotated human blastocyst dataset to benchmark deep learning architectures for in vitro fertilization*, publicado en Scientific Data y disponible en figshare bajo CC BY 4.0. El conjunto de evaluación utilizado son 300 fotografías anotadas por un panel de embriólogos. El autor indica que realizó una comprobación reentrenando el modelo sin los pacientes presentes en el conjunto de test y no encontró indicios de que el solapamiento de pacientes infle las métricas. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de clasificación de imagen.

## Capacidades

- Clasificación de imágenes de blastocistos humanos de día 5 en las tres dimensiones de la escala de Gardner: expansión (1-5), masa celular interna (A-C) y trofectodermo (A-C).
- Salida multi-cabeza: las tres etiquetas se predicen de forma simultánea a partir de una única imagen.
- Inferencia en ensemble: combinación de 5 modelos con aumento de datos de 8 vistas para reducir la varianza de la predicción.
- Procesamiento de imágenes en escala de grises a resolución 384 x 288, el formato típico de las fotografías de microscopía de laboratorios de FIV.
- Carga directa mediante la función `embryoscan.blastocyst.inference.load_ensemble` del repositorio de código asociado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.

## Casos de uso

- Pre-etiquetado en laboratorios de reproducción asistida: el modelo puede generar una propuesta de grado Gardner para cada fotografía de blastocito y dejar que el embriólogo revise o corrija la etiqueta, reduciendo el tiempo de anotación manual en cohortes retrospectivas.
- Investigación en embriología: permite analizar retrospectivamente correlaciones entre la morfología graduada automáticamente y variables clínicas, dado que el modelo produce tres etiquetas ordinales de forma consistente y reproducible sobre lotes grandes de imágenes.
- Evaluación comparativa de arquitecturas: el repositorio incluye código de entrenamiento y evaluación sobre el dataset de Kromp et al. 2023, por lo que sirve como referencia reproducible frente a la que medir otros backbones o estrategias de ensemble.
- Formación de embriólogos: la salida del modelo y su comparación con el grado asignado por el profesional puede usarse como herramienta docente para discutir criterios de graduación y variabilidad interobservador.
- Control de calidad interno: ejecutar el modelo sobre imágenes históricas del propio laboratorio y analizar la distribución de grados predichos ayuda a detectar deriva de criterios de anotación o cambios en la preparación de muestras.
- Transferencia a nuevas clínicas: los pesos preentrenados (CC BY 4.0) permiten hacer fine-tuning sobre un subconjunto de imágenes anotadas de otro microscopio o protocolo, algo relevante porque el propio autor advierte que el modelo puede degradarse fuera de la configuración original.
- Docencia y proyectos académicos: al ser un caso de uso real con licencia permisiva, es un ejemplo útil en cursos de deep learning aplicado a imagen médica, incluyendo el análisis del desbalance de clases y del sesgo de etiquetado.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test de 300 fotografías anotadas por un panel de embriólogos (Kromp et al. 2023). La métrica es exactitud (accuracy) por tarea:

| Metrica (exactitud) | Ensemble 5 modelos + 8-view TTA | Embriologos individuales | Mejor modelo publicado con el dataset |
|---|---|---|---|
| Expansion (1-5) | 0,853 | 0,78 | 0,85 |
| Masa celular interna (A-C) | 0,714 | 0,74 | 0,69 |
| Trofectodermo (A-C) | 0,660 | 0,70 | 0,62 |

Además, el autor indica que un reentrenamiento excluyendo los pacientes del conjunto de test no muestra signos de que el solapamiento de pacientes infle estas cifras. No se han publicado en la información disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo de clasificación de imagen.

## Requisitos de hardware

- Peso de los pesos: el repositorio ocupa 0,6 GB e incluye los cinco state dicts; cada fold en precisión simple ocupa del orden de 0,11 GB, lo que permite mantener el ensemble completo en memoria sin problema.
- VRAM estimada: no disponible de forma oficial. Para orientación, un único fold con lotes pequeños de imágenes de 384 x 288 debería caber holgadamente en GPUs de 4-8 GB; el ensemble de 5 folds con TTA de 8 vistas implica 40 pases por imagen y eleva tanto el tiempo de cómputo como el uso de memoria de activaciones.
- GPU recomendadas: no documentadas. Un modelo de este tamaño puede ejecutarse en GPU de consumo (por ejemplo, RTX 3060, RTX 4090), en GPUs de数据中心 (A100, H100) para procesar lotes grandes y en CPU para volúmenes pequeños, aunque con mayor latencia.
- Despliegue: el autor proporciona código en `github.com/cha205/embryo-scan` con utilidades de carga del ensemble. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de visión; las vías naturales serían PyTorch nativo o una exportación propia a ONNX/TorchScript y servicio con un servidor de inferencia.
- Latencia y throughput: no disponibles. Como referencia de escala, el coste por imagen es el de 40 inferencias de ConvNeXt-Tiny (5 folds x 8 vistas).
- Almacenamiento: menos de 1 GB para los pesos y, en su caso, el dataset de Kromp et al. 2023 descargado aparte.

## Comparativa con modelos similares

No se dispone de otras fichas de modelos públicos comparables en la información proporcionada. La comparación más directa es con las referencias publicadas en el propio dataset de Kromp et al. 2023:

| Modelo / referencia | Tarea | Exactitud expansion | Exactitud MCI | Exactitud trofectodermo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Embryo Scan blastocyst grader (Cfish14) | Clasificacion Gardner en 3 cabezas | 0,853 | 0,714 | 0,660 | CC BY 4.0 | Pesos abiertos en HuggingFace + codigo en GitHub |
| Mejor modelo publicado con el dataset (Kromp et al. 2023) | Clasificacion Gardner | 0,85 | 0,69 | 0,62 | segun publicacion | no disponible como pesos listos para usar en la informacion consultada |
| Embriologo individual (panel del test) | Clasificacion Gardner manual | 0,78 | 0,74 | 0,70 | no aplica | no aplica |
| ConvNeXt-Tiny preentrenado en ImageNet (`convnext_tiny.fb_in22k_ft_in1k`) | Clasificacion generica de imagen | no aplica | no aplica | no aplica | licencia del backbone en timm | Pesos publicos, pero no resuelve la tarea |

No se han identificado en la información disponible otros modelos abiertos de graduación de blastocistos comparables en tamaño, contexto y licencia.

## Limitaciones y advertencias

- Las fotografías del dataset de entrenamiento proceden de una única clínica y un único microscopio; el autor advierte explícitamente que otros equipos y protocolos pueden producir graduaciones erróneas.
- Las etiquetas de entrenamiento siguen el criterio de un único embriólogo, con tendencia a etiquetar como "A" masas celulares internas que serían "B". Este sesgo se hereda en las predicciones.
- Es un proyecto de investigación y no un producto sanitario: no ha pasado validación regulatoria ni ensayos clínicos, por lo que no debe usarse para decisiones clínicas sin supervisión profesional.
- Riesgo de sobreajuste al dominio: aun sin indicios de fuga por paciente, el modelo no ha sido validado en cohortes externas independientes.
- El rendimiento en trofectodermo (0,660) y masa celular interna (0,714) es inferior a la media de los embriólogos, por lo que la utilidad principal está en expansión y en el pre-etiquetado, no en la sustitución del criterio humano.
- Licencia CC BY 4.0: permite uso comercial y modificaciones, pero exige atribución al autor, enlace a la licencia e indicación de cambios, y no concede garantías ni responsabilidad.
- Entrada restringida a imágenes en escala de grises de 384 x 288 de blastocitos de día 5; no se documenta comportamiento con otros estadios embrionarios, otras modalidades de imagen ni otras resoluciones.
- No se documentan análisis de sesgo por variables demográficas, ni por origen de los pacientes, porque esa información no forma parte del dataset publicado.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y de informes de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Cfish14/embryo-scan-grader
- Codigo, entrenamiento y evaluacion: https://github.com/cha205/embryo-scan
- Dataset de blastocistos (figshare): https://doi.org/10.6084/m9.figshare.20123153.v3
- Kromp et al. 2023, *An annotated human blastocyst dataset to benchmark deep learning architectures for in vitro fertilization*, Scientific Data (referencia citada en la model card; no se ha facilitado URL directa)
- Backbone ConvNeXt-Tiny `convnext_tiny.fb_in22k_ft_in1k` de timm (referencia de arquitectura citada en la model card; no se ha facilitado URL directa)
- No se han encontrado enlaces adicionales relevantes en la busqueda web; los resultados devueltos no guardan relacion con el modelo.
