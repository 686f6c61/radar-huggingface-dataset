# adidukre/SCALA

## Resumen

SCALA (Semi-supervised Cascade for Left Atrial Scar, Cavity, and Multi-Structure CT Segmentation) es una colección de pesos preentrenados publicada por el usuario adidukre en Hugging Face, orientada a la segmentación automática de estructuras cardíacas en tomografía computarizada (TC). Cubre tres tareas del challenge CARE LeftAtrium de MICCAI 2026: segmentación de la cavidad de la aurícula izquierda (Task 2), segmentación de la cicatriz auricular (Task 1) y segmentación multiestructura de aurícula izquierda, orejuela izquierda y venas pulmonares (Task 3).

No se trata de un modelo único, sino de seis configuraciones de entrenamiento construidas sobre nnU-Net v2 con backbones 3D de tipo ResEnc-L, MedNeXt y STUNet. Se distribuyen 30 checkpoints (seis carpetas por cinco folds) en formato PyTorch, con un repositorio de 12 GB en total y código de uso asociado en GitHub.

Su relevancia es acotada al ámbito de la imagen médica cardíaca: aporta pesos reproducibles y un pipeline en cascada para una tarea de alta dificultad (la cicatriz auricular tiene poco contraste en TC), pero la model card no declara licencia, no incluye benchmarks ni documenta el dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 (U-Net 3D) con backbones ResEnc-L, MedNeXt y STUNet |
| Parámetros totales | no disponible en la model card (estimación a partir del tamaño del repositorio: ~100 M por checkpoint, 30 checkpoints en 12 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentación; la entrada es un volumen de TC, no una secuencia de tokens) |
| Tipos de cuantización | no disponible; los pesos se distribuyen en PyTorch, sin variantes GGUF, INT8 o INT4 documentadas |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | PyTorch `.pth` (`checkpoint_best.pth`) acompañado de `plans.json` y `dataset.json` |

## Arquitectura y entrenamiento

El sistema sigue el esquema de nnU-Net v2, un framework auto-configurable que genera planes de preprocesamiento, parcheo y aumento de datos a partir de las propiedades del dataset. Sobre esa base se entrenan seis variantes: `cavity_resenc` (ResEnc-L, usada como localizador de cavidad en la cascada y como segmentador de cavidad), `cavity_mednext` (MedNeXt), `scar_resenc` (ResEnc-L), `scar_surface` (trainer específico `nnUNetTrainerScarSurface`), `ct_resenc` (ResEnc-L) y `ct_stunet` (STUNet). La cascada consiste en localizar primero la cavidad auricular y usar ese recorte como región de interés para la predicción de cicatriz, lo que reduce el espacio de búsqueda de una estructura de bajo contraste y morfología fina.

Cada configuración se distribuye con cinco folds (`fold_0` a `fold_4`), lo que permite validación cruzada y ensembling. El estado del optimizador ha sido eliminado de los checkpoints, por lo que estos sirven para inferencia o para inicializar un ajuste fino, pero no para reanudar el entrenamiento original. El prefijo "semi-supervised" del nombre sugiere el uso de pseudo-etiquetas o anotaciones parciales, aunque la model card no detalla el número de casos, la composición del dataset, la estrategia de supervisión ni si se aplicaron técnicas de refinamiento tipo RLHF/DPO (no aplicables en segmentación). Tampoco se documentan innovaciones técnicas más allá de la cascada y del uso de `nnUNetTrainerScarSurface`.

## Capacidades

- Segmentación 3D de la cavidad de la aurícula izquierda en TC (Task 2), con dos backbones alternativos.
- Localización de la cavidad auricular como paso previo dentro de la cascada para la predicción de cicatriz.
- Segmentación de cicatriz auricular (Task 1), incluyendo una variante específica con trainer orientado a superficie (`scar_surface`).
- Segmentación multiestructura de aurícula izquierda, orejuela izquierda y venas pulmonares en TC (Task 3), con backbones ResEnc-L y STUNet.
- Ensembling de cinco folds por tarea, ya que cada carpeta incluye `fold_0` a `fold_4` con `checkpoint_best.pth`.
- Inferencia por línea de comandos mediante el paquete `scala` (`python -m scala.predict --task task1|task2|task3 ...`).
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de estimación de incertidumbre, clasificación de patología ni detección de estructuras fuera de las tres tareas indicadas.

## Casos de uso

- Planificación preprocedimental de ablación de fibrilación auricular: la cascada `cavity_resenc` + `scar_resenc` permite obtener la anatomía auricular y la extensión de la cicatriz a partir de un TC, información que el electrofisiólogo usa para decidir la estrategia de ablación.
- Cuantificación de fibrosis auricular en cohortes de investigación: ejecución en lote con el CLI sobre decenas o cientos de estudios, generando máscaras para análisis estadístico de carga de cicatriz por paciente.
- Extracción de características de radiómica: las máscaras de cicatriz y cavidad sirven como regiones de interés para calcular textura, grosor y volumen, alimentando modelos predictivos posteriores.
- Planificación de cierre de orejuela izquierda: la tarea `ct` segmenta simultáneamente LA, LAA y venas pulmonares, lo que permite medir el ostium y elegir el tamaño de dispositivo.
- Preanotación y curación de datasets: usar el ensemble de cinco folds como anotador inicial y aplicar revisión humana, reduciendo el tiempo de etiquetado en nuevos conjuntos de TC cardíaca.
- Comparación interna de arquitecturas: al incluir trainers ResEnc-L, MedNeXt y STUNet sobre las mismas tareas, permite reproducir experimentos controlados de backbone en segmentación 3D cardíaca.
- Integración en plataformas de imagen médica: el modelo se invoca como módulo dentro de un contenedor con GPU, conectado a un PACS o a un orquestador tipo MONAI Deploy para procesar estudios de forma desatendida.
- Auditoría retrospectiva de estudios: reprocesar TC históricos para correlacionar métricas de cicatriz con resultados clínicos registrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (Dice, HD95, ASSD) ni comparaciones numéricas con baselines del challenge.

| Tarea | Checkpoints disponibles | Métricas publicadas |
|---|---|---|
| Task 1: cicatriz de aurícula izquierda | `scar_resenc`, `scar_surface` (5 folds cada uno) | no publicadas |
| Task 2: cavidad de aurícula izquierda | `cavity_resenc`, `cavity_mednext` (5 folds cada uno) | no publicadas |
| Task 3: LA / LAA / PV en TC | `ct_resenc`, `ct_stunet` (5 folds cada uno) | no publicadas |

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. Como referencia orientativa, la inferencia 3D tipo nnU-Net con parches y ventana deslizante sobre volúmenes de TC suele requerir entre 6 y 16 GB de VRAM según el tamaño de parche y el backbone; esta cifra es una estimación, no un dato publicado.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) es suficiente para inferencia de un caso con cualquiera de los seis checkpoints; para procesamiento por lotes con ensembling de cinco folds se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080/4090), siempre que se ajuste el tamaño de parche. No verificado por el autor en la información disponible.
- Almacenamiento: el repositorio completo ocupa 12 GB y debe descargarse íntegro con `huggingface-cli download adidukre/SCALA --local-dir /path/to/checkpoints`.
- Opciones de despliegue: nnU-Net v2 junto con el paquete `scala` e inferencia por CLI; es posible exportar a TorchScript/ONNX para servir con Triton o MONAI Deploy, aunque no está documentado. Los runtimes de LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables.
- Latencia y throughput: no disponibles. Como referencia, la inferencia 3D de nnU-Net sobre un volumen de TC suele situarse en el orden de decenas de segundos por caso en GPU moderna y de varios minutos en CPU.
- CPU: la inferencia en CPU es viable pero lenta; solo recomendable para pruebas puntuales o verificación de instalación.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SCALA (`cavity_resenc`, `scar_resenc`, `ct_resenc`) | nnU-Net v2, ResEnc-L 3D | no disponible (~100 M estimados por checkpoint) | no aplica | no publicado | no disponible | Hugging Face, 12 GB |
| SCALA (`cavity_mednext`) | nnU-Net v2, MedNeXt | no disponible | no aplica | no publicado | no disponible | Hugging Face |
| SCALA (`ct_stunet`) | nnU-Net v2, STUNet | no disponible | no aplica | no publicado | no disponible | Hugging Face |
| nnU-Net v2 con trainer por defecto | U-Net 3D plano | no disponible | no aplica | no publicado en esta información | Apache 2.0 (código del framework) | framework público |
| Otros segmentadores cardíacos (TotalSegmentator, MONAI, baselines del challenge CARE LeftAtrium) | diversas | no disponible | no aplica | no disponible | no disponible | no disponible en esta información |

No se dispone de datos comparativos de rendimiento entre SCALA y alternativas de la misma categoría, por lo que la comparación se limita a la arquitectura y a la disponibilidad de pesos.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en la model card ni en los metadatos de Hugging Face, no hay autorización explícita de uso comercial. En ausencia de licencia debe asumirse reserva de derechos y contactar con el autor antes de cualquier uso en producción.
- No es un producto sanitario: no consta marcado CE, autorización FDA ni validación clínica. Su uso es de investigación; cualquier decisión clínica requiere revisión por un profesional cualificado.
- La segmentación de cicatriz auricular es una tarea de bajo contraste y alta variabilidad interobservador, con riesgo de falsos positivos y falsos negativos en la delimitación del tejido. No existe en este modelo un mecanismo de estimación de incertidumbre ni de abstención, por lo que el error es silencioso.
- Sesgos desconocidos: no se documenta la procedencia, el tamaño ni la composición demográfica del dataset de entrenamiento, de modo que no puede evaluarse el sesgo por fabricante de escáner, protocolo de adquisición, fase cardíaca o población.
- Dominio restringido: entrenado para TC cardíaca (LA, LAA, PV y cicatriz). No hay evidencia de funcionamiento en resonancia magnética, ecocardiografía ni en otras regiones anatómicas.
- Los checkpoints no incluyen estado del optimizador, por lo que no permiten reanudar el entrenamiento original; solo sirven para inferencia o para inicializar un ajuste fino desde cero del optimizador.
- Cada tarea se distribuye en cinco folds independientes y la model card no indica cuál debe usarse ni cómo agregarlos, lo que deja la selección y el ensembling en manos del usuario.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita el despliegue en hardware con poca memoria.
- Ausencia de métricas publicadas: no es posible estimar la calidad esperada ni comparar con otros métodos sin ejecutar una validación propia.
- Riesgo de sobreajuste al dominio del challenge: los pesos están ajustados a las tareas CARE LeftAtrium 2026 y su transferencia a datos clínicos reales no está verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adidukre/SCALA
- Código y uso: https://github.com/adinathdukre/SCALA
- Challenge de referencia citado en la model card: CARE LeftAtrium, MICCAI 2026 (no se proporciona enlace en la información disponible).
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con segmentación cardíaca; los resultados obtenidos eran contenido no relacionado y se han descartado.
