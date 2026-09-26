# ManasSahu001/antarctic-iceberg-yolo11n-adaptive

## Resumen

YOLO11n-Adaptive (EXP-05) es un detector de objetos de clase única especializado en la localización de icebergs sobre imágenes de radar de apertura sintética (SAR) de la misión Sentinel-1 de la ESA. Lo publica el usuario ManasSahu001 en Hugging Face y se enmarca en el proyecto «AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory, and Navigation Decision Support System (SIH 2026)». El modelo parte de la arquitectura Ultralytics YOLO11n, con 2,58 millones de parámetros, y añade un motor de inferencia adaptativo basado en SAHI (Slicing Aided Hyper Inference) que decide dinámicamente si merece la pena trocear la escena para recuperar objetos pequeños.

El problema que aborda es concreto: la detección de icebergs en imagery polar presenta varianza de escala extrema (desde témpanos tabulares de más de 10 km hasta «bergy bits» de menos de 200 m que ocupan pocos píxeles), ruido de retrodispersión procedente de hielo marino deformado y densidades muy altas de objetos en frentes de desprendimiento glaciares. Un paso monolítico a 640 px o 1024 px no resuelve bien ese compromiso, y un SAHI global aplicado a todas las teselas infla los falsos positivos. La contribución de EXP-05 es un criterio determinista de dificultad que activa el troceado solo cuando la escena lo requiere.

El resultado declarado es el mejor compromiso de la campaña de experimentos del autor: F1 de 0,5590 y recall de objetos pequeños del 47,92 % en validación, y F1 de 0,7013 con recall del 68,16 % en el conjunto de test ciego reservado. El checkpoint se publica congelado, con SHA-256 fijado y licencia MIT, lo que lo hace reproducible como candidato de referencia. El repositorio tiene 0 descargas y 1 «like», y ocupa menos de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11n (detector de objetos CNN/Transformer híbrido de la familia YOLO11) + motor de inferencia adaptativo con SAHI selectivo en dos fases |
| Parametros totales | 2,58 M |
| Longitud de contexto | No aplica (detección de objetos sobre imagen; no hay ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (la model card solo publica el checkpoint en formato Ultralytics; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (idioma de la documentación; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch en formato Ultralytics (.pt), 5.556.250 bytes; no se publican safetensors ni GGUF |
| Tarea (pipeline) | object-detection |
| Biblioteca | ultralytics |
| Numero de clases | 1 (iceberg) |
| Resolucion de entrada | 1024 px en el pase completo; parches de 512×512 reescalados a 1024 px en el pase adaptativo |
| Umbral de confianza operativo | 0,25 |
| Umbral de IoU para NMS | 0,50 (NMS greedy class-aware) |
| Checkpoint SHA-256 | 0AE5150EDBB05D2A94C6960EEC5BA06DD4EA5A141D85CF03DB4B64FF44DD798C |
| Estado operativo | Frozen Benchmark Candidate |
| Descargas / likes | 0 / 1 |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

La base es YOLO11n, el modelo más pequeño de la familia YOLO11 de Ultralytics, con 2,58 M de parámetros. Sobre esa base, el autor define un motor de inferencia en tres etapas descritas en la model card: (1) un pase de fotograma completo a 1024 px; (2) una señal determinista de dificultad calculada a partir del recuento de objetos pequeños (área < 1024 px²) y la densidad de candidatos débiles, que decide si se ejecuta el troceado; y (3) reproyección de coordenadas y fusión de detecciones mediante NMS greedy a IoU 0,50. Según el autor, aproximadamente el 60 % de las escenas son «fáciles» (aguas costeras abiertas, hielo fijo) y terminan en unos 18 ms sin troceado, mientras que el 40 % restante, correspondiente a frentes de desprendimiento difíciles, ejecuta recortes locales de 512×512 reescalados a 1024 px y tarda unos 52 ms.

El entrenamiento se realizó sobre el «Antarctic Grounded Iceberg SAR Ground Truth Dataset» (Jiao et al., 2026, *Earth System Science Data*), con imágenes Sentinel-1 en banda C en modos Extra Wide (EW) e Interferometric Wide (IW) y polarizaciones HH y HV. La partición se hizo por escena y por geografía para evitar fuga por autocorrelación espacial: 464 escenas de entrenamiento, 75 de validación (1.071 objetos de referencia) y 163 de test ciego reservado (4.679 objetos, en las regiones de Prydz Bay, Porpoise Bay, Thwaites 1 y Thwaites 2). La evaluación usa emparejamiento húngaro greedy 1-a-1 con confianza 0,25 e IoU 0,50.

La campaña experimental documentada abarca siete configuraciones. El autor probó primero YOLO11n monolítico a 640 px (EXP-00) y a 1024 px (EXP-01), después escaló a YOLO11s (EXP-02 y EXP-03, este último con SAHI global), más tarde aplicó aumento de datos por copy-paste (EXP-04) y finalmente la propuesta adaptativa (EXP-05). Los dos últimos experimentos (EXP-06A y EXP-07) fueron ajustes de hiperparámetros y entrenamiento dirigido a objetos pequeños que no superaron la línea base de EXP-05, y el autor los reporta explícitamente como resultados negativos. No se menciona RLHF, DPO ni ningún proceso de alineación, algo esperable en un modelo de visión.

## Capacidades

- Detección de objetos de clase única (iceberg) sobre teselas SAR de Sentinel-1 en banda C (modos EW e IW, polarizaciones HH y HV).
- Inferencia adaptativa con SAHI selectivo: activa troceado de alta resolución únicamente en escenas con alta densidad de objetos pequeños o candidatos débiles, y lo evita en escenas fáciles para no inflar falsos positivos.
- Detección multiescala: recall del 60,56 % en objetos pequeños (< 1024 px²), 80,55 % en medianos (1024–9216 px²) y 71,16 % en grandes (≥ 9216 px²) sobre el conjunto de test.
- Fusión de detecciones entre el pase global y los parches con reproyección a coordenadas nativas y NMS class-aware a IoU 0,50.
- Rendimiento en tiempo casi real: 32,10 ms por imagen de media (31,2 FPS) en una RTX 4060, con 18 ms en escenas fáciles y 52 ms en difíciles.
- Capacidad de operar sobre imágenes de gran tamaño mediante procesamiento por teselas.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni modos de «pensamiento» (thinking mode).
- No tiene capacidades multilingües ni de generación de texto: su única salida son cajas delimitadoras con puntuación de confianza.
- No se documentan capacidades de segmentación, clasificación, visión multimodal, audio ni OCR.

## Casos de uso

- Seguridad marítima y apoyo a la navegación polar: el detector puede procesar sistemáticamente teselas Sentinel-1 de una región de interés y entregar posiciones de icebergs para alimentar cartas de riesgo o avisos a buques de investigación y tráfico logístico antártico, con una latencia de 32 ms por tesela que permite cubrir áreas amplias en pocos minutos.
- Vigilancia de frentes de desprendimiento: en glaciares como Thwaites o Pine Island, donde se liberan cientos de témpanos muy próximos entre sí, el modo adaptativo activa parches de 512×512 y recupera objetos que un pase monolítico pierde; el autor reporta precisión del 72,23 % y recall del 68,16 % en el test ciego que incluye esas zonas.
- Generación de pre-etiquetados para anotación asistida: el modelo puede proponer cajas sobre nuevas escenas SAR y reducir el trabajo manual de un equipo de teledetección, aceptando después una revisión humana; su índice de duplicados es bajo (10 detecciones duplicadas, 0,23 %, en 163 escenas de test).
- Estudios de exportación de hielo y clima: al detectar icebergs de forma consistente en series temporales de Sentinel-1, permite cuantificar densidades y tamaños por región y comparar periodos, con la ventaja de que el checkpoint congelado garantiza reproducibilidad entre campañas.
- Control de calidad de datasets de teledetección: ejecutando el modelo sobre un dataset anotado se pueden localizar discrepancias entre las etiquetas y las detecciones del modelo, útil para auditar conjuntos de datos de gran tamaño como el de 4.679 objetos usado en el test.
- Procesamiento a escala en pipelines en la nube: con un checkpoint de 5,3 MB y consumo de VRAM por debajo de 1 GB, el modelo se puede integrar en funciones serverless sobre datos abiertos de Sentinel-1 (AWS o Copernicus) y procesar catálogos completos con GPUs de gama media.
- Despliegue embarcado en hardware modesto: su tamaño permite ejecutarlo en un equipo con GPU de consumo o incluso en CPU para escenas fáciles, lo que habilita prototipos de alerta a bordo sin conexión de alta capacidad.
- Validación de algoritmos competidores: al ser un candidato congelado con métricas desglosadas por rango de tamaño, sirve como línea base reproducible para comparar futuros detectores de icebergs en SAR polar.

## Benchmarks y rendimiento

Resultados reportados por el autor con emparejamiento húngaro greedy 1-a-1, umbral de confianza 0,25 e IoU 0,50.

Conjunto de validacion (75 escenas, 1.071 objetos de referencia):

| Metrica | Valor |
|---|---|
| Verdaderos positivos (TP) | 597 |
| Falsos positivos (FP) | 468 (todos por ruido de fondo, 0 duplicados) |
| Falsos negativos (FN) | 474 |
| Precision | 56,06 % |
| Recall | 55,74 % |
| F1 | 0,5590 |
| Recall objetos pequenos (< 1024 px²) | 47,92 % |
| Recall objetos medianos (1024–9216 px²) | 71,86 % |
| Recall objetos grandes (>= 9216 px²) | 72,09 % |
| IoU medio emparejado | 79,00 % |
| Falsos positivos por imagen | 6,24 |
| Latencia media | 32,10 ms/imagen (31,2 FPS en RTX 4060) |

Conjunto de test ciego reservado (163 escenas, 4.679 objetos de referencia):

| Metrica | Valor |
|---|---|
| Verdaderos positivos (TP) | 3.189 |
| Falsos positivos (FP) | 1.226 (1.216 por ruido, 10 duplicados) |
| Falsos negativos (FN) | 1.490 |
| Precision | 72,23 % |
| Recall | 68,16 % |
| F1 | 0,7013 |
| Recall objetos pequenos (< 1024 px²) | 60,56 % (1.666 de 2.751) |
| Recall objetos medianos (1024–9216 px²) | 80,55 % (1.296 de 1.609) |
| Recall objetos grandes (>= 9216 px²) | 71,16 % (227 de 319) |
| IoU medio emparejado | 81,11 % |
| Tasa de duplicados | 0,23 % (10 detecciones) |
| Falsos positivos por imagen | 7,52 |

Historial de experimentos de la campana (tal como lo reporta la model card; no se especifica la particion de evaluacion, aunque los valores de EXP-05 coinciden con los de validacion):

| Experimento | Configuracion | Precision | Recall | F1 | Recall objetos pequenos | Veredicto |
|---|---|---|---|---|---|---|
| EXP-00 | YOLO11n @ 640 px monolítico | 47,32 % | 51,07 % | 0,4912 | 39,06 % | Línea base; muchas falsas alarmas por ruido |
| EXP-01 | YOLO11n @ 1024 px monolítico | 68,20 % | 43,04 % | 0,5278 | 31,02 % | Buena precisión; pierde témpanos pequeños |
| EXP-02 | YOLO11s @ 1024 px | 74,95 % | 36,60 % | 0,4918 | 20,64 % | Capacidad excesiva, sobre-regularizado |
| EXP-03 | YOLO11s @ 1024 px + SAHI global | 46,21 % | 51,82 % | 0,4886 | 40,30 % | Explosión de ruido (646 FP); lento (7,9 FPS) |
| EXP-04 | YOLO11n @ 1024 px + copy-paste | 80,05 % | 29,60 % | 0,4322 | 13,30 % | Resultado negativo; artefactos en bordes |
| EXP-05 | YOLO11n @ 1024 px + SAHI adaptativo | 56,06 % | 55,74 % | 0,5590 | 47,92 % | Seleccionado (mejor F1 y recall) |
| EXP-06A | Ajuste controlado de lr0 (0,001–0,005) | 42,9–57,9 % | 43,9–60,0 % | 0,499–0,507 | 30,9–51,0 % | No supera EXP-05 |
| EXP-07 | Entrenamiento dirigido a objetos pequeños | 59,06 % | 43,23 % | 0,4992 | 29,36 % | Subsensible; colapsa el recall de pequeños |

No se han publicado comparaciones con benchmarks externos estandarizados (COCO, DOTA, xView) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB a 1024 px en FP16, partiendo de un checkpoint de 5,3 MB y 2,58 M de parámetros (estimación; la model card no publica un desglose de memoria por tensor).
- GPU recomendadas: RTX 4060 es la única medida por el autor (31,2 FPS). Cualquier GPU de consumo con 4 GB o más es suficiente; no hay datos publicados para A100, H100, L4 o T4.
- Cabe en GPU de consumo: sí, con holgura. También es viable en CPU para escenas fáciles, aunque no se documentan latencias en CPU.
- Opciones de despliegue: la model card indica la librería ultralytics (API de Python sobre PyTorch). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un detector de objetos. Las rutas de exportación típicas de Ultralytics (ONNX, TensorRT, OpenVINO) no están confirmadas en la información disponible.
- Latencia y throughput: 32,10 ms/imagen de media (31,2 FPS) en RTX 4060; aproximadamente 18 ms en escenas fáciles (60 % del total) y 52 ms en frentes de desprendimiento difíciles (40 %). EXP-03, con SAHI global, bajaba a 7,9 FPS, lo que ilustra la ganancia de velocidad del enfoque adaptativo.
- Memoria de almacenamiento: el checkpoint ocupa 5.556.250 bytes (unos 5,3 MB).

## Comparativa con modelos similares

La model card no incluye comparaciones con detectores externos. La única comparación disponible es interna, entre las configuraciones de la propia campaña de experimentos. Todas las cifras proceden de la misma partición reportada por el autor.

| Configuracion | Backbone | Parametros | Precision | Recall | F1 | Recall pequenos | Licencia |
|---|---|---|---|---|---|---|---|
| EXP-05 (modelo publicado) | YOLO11n @ 1024 px + SAHI adaptativo | 2,58 M | 56,06 % | 55,74 % | 0,5590 | 47,92 % | MIT |
| EXP-01 | YOLO11n @ 1024 px monolítico | 2,58 M | 68,20 % | 43,04 % | 0,5278 | 31,02 % | MIT (Ultralytics) |
| EXP-03 | YOLO11s @ 1024 px + SAHI global | 9,4 M (no confirmado en la informacion disponible) | 46,21 % | 51,82 % | 0,4886 | 40,30 % | MIT (Ultralytics) |
| EXP-02 | YOLO11s @ 1024 px | 9,4 M (no confirmado en la informacion disponible) | 74,95 % | 36,60 % | 0,4918 | 20,64 % | MIT (Ultralytics) |

Comparativa frente a alternativas de la misma categoría (RT-DETR, DETR, Faster R-CNN, modelos especializados en detección de icebergs): no disponible. La información proporcionada no incluye resultados de terceros sobre el mismo conjunto de datos ni sobre benchmarks públicos de teledetección.

## Limitaciones y advertencias

- Tasa de falsos positivos elevada: 7,52 FP por imagen en el test ciego, de los cuales 1.216 de 1.226 se atribuyen a ruido de fondo (hielo marino deformado, crestas, «frost flowers») que imita la firma radar de un iceberg. En un sistema de alerta esto exige un filtro posterior o confirmación humana.
- Objetos pequeños: aunque es la mejor configuración de la campaña en este rango, sigue sin detectar el 39,44 % de los icebergs de menos de 1024 px² en el test (1.085 de 2.751 no recuperados). No es adecuado para inventario exhaustivo de «bergy bits».
- Rendimiento inferior en validación que en test (F1 0,5590 frente a 0,7013). Esta discrepancia no se explica en la model card y sugiere diferencias de distribución entre particiones; conviene tratarla con cautela al extrapolar a nuevas regiones.
- Sesgo geográfico y de sensor: el entrenamiento y la evaluación se limitan a Sentinel-1 en banda C, modos EW e IW, polarizaciones HH y HV, con test en Prydz Bay, Porpoise Bay, Thwaites 1 y Thwaites 2. No hay evidencia de generalización a banda X, banda L, imágenes ópticas, datos de otros satélites ni a otras regiones polares (Ártico, por ejemplo).
- Dependencia de los umbrales operativos: todas las métricas corresponden a confianza 0,25 e IoU 0,50. Cambiar esos valores altera el equilibrio precisión/recall y los números dejaran de ser comparables.
- Naturaleza no lingüística: el campo de idioma «en» se refiere a la documentación. El modelo no genera texto, no entiende instrucciones, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de lenguaje.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantía. Hay que verificar además las condiciones del dataset de origen (Jiao et al., 2026) y de Ultralytics para el código y los pesos base, ya que la ficha no detalla la cadena de licencias completa.
- Model card truncada: la sección de uso previsto y de integración aguas abajo queda incompleta en la información disponible, por lo que se desconocen requisitos operativos adicionales (formato de salida, gestión de proyecciones, umbrales recomendados por región).
- Madurez y soporte: 0 descargas y 1 «like» en el momento de la consulta, un único autor y estado declarado de «Frozen Benchmark Candidate». No hay evidencia de mantenimiento, versionado posterior ni soporte.
- Ausencia de datos de calibración de incertidumbre: no se publica ninguna medida de calibración de las puntuaciones de confianza, lo que dificulta fijar umbrales en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ManasSahu001/antarctic-iceberg-yolo11n-adaptive
- Dataset de origen citado: Antarctic Grounded Iceberg SAR Ground Truth Dataset, Jiao et al., 2026, *Earth System Science Data*. No se proporciona URL ni DOI en la model card.
- Proyecto marco: AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory, and Navigation Decision Support System (SIH 2026). No se proporciona URL en la model card.
- Checksum de referencia del checkpoint: SHA-256 `0AE5150EDBB05D2A94C6960EEC5BA06DD4EA5A141D85CF03DB4B64FF44DD798C`
- Documentación de Ultralytics YOLO11: no enlazada en la model card.
- Resultados de la búsqueda web: los resultados devueltos tratan sobre política migratoria de Estados Unidos (Dream Act, DACA, DAPA) y no guardan ninguna relación con este modelo. No se ha encontrado ningún enlace relevante adicional.
