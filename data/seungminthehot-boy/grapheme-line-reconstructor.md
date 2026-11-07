# SeungminTheHot-boy/grapheme-line-reconstructor

## Resumen

Grapheme Line Reconstructor es un modelo de investigación de geometría pura desarrollado por el usuario SeungminTheHot-boy, orientado a una tarea muy específica dentro del análisis de documentos: agrupar cajas de tinta de glifos visibles ya observados en líneas de texto. No realiza detección ni reconocimiento de caracteres a partir de una imagen de página, ni reconstruye párrafos, documentos Word/HWPX, estilos o el orden de lectura. Su entrada es el tamaño de página junto con una caja de tinta e identificador por cada glifo visible, y su salida es un conjunto disjunto de grupos de identificadores de glifos por página.

Con 121.524 parámetros, se trata de un modelo extremadamente pequeño, de tipo red de atención sobre grafo con 144 slots de línea aprendidos por página, dimensión 32, 4 cabezas de atención, una capa de paso de mensajes y tres capas de refinamiento de consultas. Está inspirado en kMaX-DeepLab, CMT-DeepLab y el análisis de layout por tab-stops, aunque es una implementación específica para esta tarea y no una implementación oficial de dichos sistemas.

Su relevancia es acotada y de carácter investigador: publica un checkpoint exportado del epoch 450 (update 4.500) entrenado con 50 documentos sintéticos sembrados y 76 páginas, con texto sintético en inglés y coreano. La licencia Apache 2.0 y el formato safetensors facilitan su inspección, pero el alcance de generalización es muy limitado por el tamaño y la naturaleza sintética del conjunto de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de atención sobre grafo con slots de línea (144 slots por página, dimensión 32, 4 cabezas, 1 capa de mensajes y 3 capas de refinamiento de consultas) |
| Parámetros totales | 121.524 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa páginas de forma independiente; grafo de 8 vecinos espaciales por glifo) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés y coreano (texto sintético de entrenamiento); sin afirmación multilingüe general |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (junto con JSON de configuración y manifiesto de release) |

## Arquitectura y entrenamiento

El encoder procesa la geometría individual de cada glifo, registros de vecinos espaciales, intervalos horizontales vacíos y patrones repetidos de bordes de texto. El grafo espacial por defecto conecta los 8 centros de caja normalizados más cercanos, con distancia definida como desplazamiento de número de página más distancia euclídea entre centros, y una ventana de candidatos entre páginas de 1; la red retiene únicamente aristas locales a la página. Los glifos compiten por padres mediante softmax y las actualizaciones residuales inspiradas en CMT refinan los logits de asignación. La asignación final usa argmax sobre el padre, seguida de un decodificador vertical/columna/vecino que puede dividir grupos más allá del número de slots neuronales.

El entrenamiento utilizó 50 documentos sintéticos sembrados, 76 páginas y promediado equitativo de pérdida por documento en lotes de 5. El run se reanudó desde un checkpoint previo del epoch 200, por lo que el update 4.500 no representa la historia completa de entrenamiento. El checkpoint se seleccionó por macro Line F1 sobre 4 documentos sintéticos de validación. Se empleó texto sintético en coreano e inglés, con tipografía Pretendard, tamaños base de 10/11/12 pt, huecos de columna de 24 pt y 1/2/3 columnas, lo que limita la cobertura de tipografía real. Solo se exportan los tensores de línea; no se incluyen estado del optimizador, RNG, tensores de párrafo antiguos, documentos fuente ni anotaciones de referencia.

## Capacidades

- Agrupación de cajas de tinta de glifos visibles en líneas de texto por página.
- Procesamiento de páginas de forma independiente, admitiendo páginas en blanco con arrays de glifos vacíos.
- Construcción automática de grafo espacial de 8 vecinos o uso de un grafo de observación preexistente mediante `candidate_edges`.
- Normalización opcional de coordenadas con `bbox_page_normalized` para reproducir coordenadas float64 archivadas.
- Salida determinista con cada glifo asignado exactamente una vez, orden de líneas por geometría superior/izquierda y orden de glifos dentro de línea por izquierda/superior.
- Modo de diagnóstico opcional (`diagnostics=True`) que registra decisiones del decodificador.
- No soporta detección ni reconocimiento de caracteres, reconstrucción de párrafos, estilos, orden de lectura ni tool calling/function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Preprocesado en pipelines de OCR: una vez que un motor de OCR ha localizado las cajas de tinta de cada glifo, este modelo agrupa esos glifos en líneas antes de pasarlos a un módulo de reconocimiento o de reconstrucción de texto.
- Análisis de layout en documentos digitalizados: permite obtener líneas de texto a partir de cajas de glifos ya detectadas, útil para tareas de segmentación estructural en investigación sobre documentos.
- Reproducción de grafos de observación archivados: mediante `candidate_edges` y `bbox_page_normalized` se puede replicar exactamente una agrupación previa sin reconstruir el grafo, útil para auditoría o comparación de experimentos.
- Investigación sobre agrupación geométrica: sirve como baseline ligero para estudiar heurísticas de agrupación de glifos en líneas con arquitecturas de atención sobre grafo.
- Procesamiento de documentos multicolumna: el entrenamiento con 1/2/3 columnas y huecos de 24 pt permite probar la agrupación en maquetas de varias columnas con tipografía controlada.
- Generación de datos sintéticos de layout: el modelo puede integrarse en un pipeline que genere documentos sintéticos y valide que la agrupación de líneas resultante es coherente con la geometría esperada.
- Evaluación de convenciones de cajas: al aceptar cajas de tinta en puntos con origen en la esquina superior izquierda, permite comparar el efecto de distintas convenciones de caja sobre la agrupación en líneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una selección de checkpoint por macro Line F1 sobre 4 documentos sintéticos de validación y una sección de evaluación, pero no se proporcionan cifras concretas en la información suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 121.524 parámetros y pesos en safetensors, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente. El ejemplo de la model card usa `torch.set_num_threads(1)`, lo que sugiere ejecución en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: paquete Python propio (`text_instance_model.LineReconstructor`), CLI `reconstruct-text-lines`, carga desde el Hub con `from_pretrained` y `revision` para fijar release. No usa `trust_remote_code` ni auto-loader de Transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (agrupación geométrica de glifos en líneas con arquitectura de atención sobre grafo y este orden de magnitud de parámetros).

## Limitaciones y advertencias

- No detecta ni reconoce caracteres a partir de una imagen de página; requiere cajas de tinta de glifos ya observadas.
- No reconstruye párrafos, documentos Word/HWPX, estilos ni orden de lectura; el orden de líneas es geométrico, no de lectura.
- La convención de caja es estricta: caja de tinta que encierra ajustadamente las marcas visibles del carácter, no la celda de avance, una caja de palabra ni una caja de línea OCR. Sustituir la convención es un cambio de entrada no probado.
- Entrenamiento con solo 50 documentos sintéticos y 76 páginas, tipografía Pretendard y tamaños 10/11/12 pt con 1/2/3 columnas; cobertura limitada de tipografía real.
- El run se reanudó desde un checkpoint del epoch 200; el update 4.500 no representa la historia completa de entrenamiento.
- Solo hay resultados externos en inglés; no se establece una afirmación multilingüe general pese al entrenamiento con coreano sintético.
- No se reporta probabilidad calibrada de línea completa ni de partición; las puntuaciones softmax del padre son puntuaciones de asignación, y las divisiones/fusiones posteriores basadas en reglas no son inferencia probabilística.
- La re-normalización de coordenadas puede alterar empates en coma flotante en la selección de vecinos; se recomienda conservar ambas formas registradas al reproducir un grafo de observación existente.
- Licencia Apache 2.0: permite uso comercial, pero el alcance y la validación del modelo son de investigación y no hay garantías de rendimiento en producción.
- Riesgo de alucinación no aplicable en el sentido generativo; el riesgo es de agrupación incorrecta de glifos en líneas ante geometrías fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/SeungminTheHot-boy/grapheme-line-reconstructor
- kMaX-DeepLab (ECCV 2022): https://www.ecva.net/papers/eccv_2022/papers_ECCV/html/3300_ECCV_2022_paper.php
- CMT-DeepLab (CVPR 2022): https://openaccess.thecvf.com/content/CVPR2022/papers/Yu_CMT-DeepLab_Clustering_Mask_Transformers_for_Panoptic_Segmentation_CVPR_2022_paper.pdf
- Hybrid page layout analysis via tab-stop detection (Google Research): https://research.google/pubs/hybrid-page-layout-analysis-via-tab-stop-detection/
