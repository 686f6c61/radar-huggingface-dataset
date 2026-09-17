# chiqui7/yolo11-manga-seg

## Resumen

YOLO11s Manga Segmentation Model es un modelo de segmentación de instancias basado en la arquitectura YOLO11s-seg de Ultralytics, ajustado por el usuario chiqui7 para el procesamiento de cómics y manga. El modelo detecta y segmenta cuatro clases de interés editorial: bocadillos de diálogo (bubble), viñetas o paneles (panel), efectos de sonido (sfx) y texto (text). Se distribuye en formato ONNX bajo licencia MIT desde el repositorio chiqui7/yolo11-manga-seg de HuggingFace.

El problema que resuelve es el preprocesado estructural de páginas de cómic: en lugar de tratar la página como una imagen única, el modelo devuelve máscaras y cajas delimitadoras por instancia, lo que permite aislar regiones de texto para OCR posterior, recortar paneles para reflow o re-maquetación, y separar bocadillos de efectos de sonido. Es relevante para pipelines de traducción automática de manga, digitalización de archivos, accesibilidad y análisis de corpus visuales.

La información publicada por el autor es deliberadamente mínima: no se declaran parámetros totales, número de tokens ni composición del dataset de ajuste. Lo que sí se especifica con precisión es el régimen de inferencia: entradas de 1024 px, entrenamiento rectangular (`rect=True`) y relleno neutro gris `[114, 114, 114]` hasta un múltiplo del stride 32. Ese detalle de preprocesado es el dato más accionable de la model card y condiciona directamente la calidad de las máscaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s-seg (CNN de deteccion y segmentacion de instancias, familia Ultralytics); ajuste fino sobre el checkpoint base |
| Parametros totales | no disponible (el autor no lo declara; la variante YOLO11s-seg de Ultralytics se situa en el orden de 9-10 M, cifra no confirmada para este ajuste) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible; el repo distribuye pesos en ONNX y no se documentan variantes INT8, FP16 u otras |
| Idiomas soportados | no disponible; la deteccion de texto es visual y no depende del idioma, pero no se declara alcance linguistico ni se incluye OCR |
| Licencia | MIT |
| Formato de pesos | ONNX (segun los tags del repositorio) |
| Clases | 4: `bubble` (0), `panel` (1), `sfx` (2), `text` (3) |
| Resolucion de entrada | 1024 px en el lado mayor, con padding a multiplo de 32 y relleno gris `[114, 114, 114]` |
| Modo de entrenamiento | rectangular (`rect=True`) |
| Tamano del repositorio | 0.0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO11s-seg, la variante "small" del modelo de segmentación de instancias de Ultralytics. Es un detector de una sola etapa con cabeza de segmentación que produce, por cada instancia detectada, una caja delimitadora y una máscara de píxeles. Frente a un detector de cajas puras, la cabeza de segmentación aporta contornos ajustados al objeto, algo relevante en manga porque los bocadillos y los paneles tienen formas irregulares y a menudo se solapan o comparten bordes. No se trata de un modelo transformer ni de una arquitectura híbrida SSM: es una red convolucional con etapas de agregación multiescala y decodificación en múltiples niveles de resolución.

El autor no publica información sobre el dataset de ajuste: no se indica el número de imágenes, la procedencia (páginas escaneadas, digitales, sintéticas), el balance entre clases ni si se aplicaron técnicas de aumento de datos o de refinamiento posterior tipo RLHF/DPO (que, por otro lado, no aplican a un modelo de visión supervisado). Lo único documentado es la configuración de entrada: entrenamiento a 1024 px con `rect=True`, lo que implica que el modelo se optimizó con lotes de imágenes de proporciones variables y relleno hasta múltiplos del stride 32. El uso de resolución alta es coherente con el objetivo: el texto de un bocadillo de manga es pequeño en relación con la página, y una entrada de 640 px deterioraría la segmentación fina de glifos y contornos.

## Capacidades

- Segmentación de instancias en cuatro clases específicas de cómic y manga: bocadillos, paneles, efectos de sonido y texto.
- Detección simultánea de cajas delimitadoras y máscaras de píxeles por instancia, lo que permite recortes ajustados al contorno real del objeto.
- Localización de regiones de texto como paso previo a un pipeline de OCR externo; el modelo no realiza reconocimiento de caracteres.
- Separación entre texto de diálogo (bubble) y texto de efecto sonoro (sfx), útil para no enviar onomatopeyas a un traductor convencional.
- Recuperación de la estructura de página mediante la clase `panel`, habilitando re-maquetación, reflow o lectura guiada panel a panel.
- Funcionamiento sobre imágenes de página completa en resoluciones altas (1024 px en el lado mayor) sin degradar la detección de elementos pequeños.
- Exportación a ONNX, lo que facilita su integración en runtimes no dependientes de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de modo thinking, visión multimodal general ni procesamiento de audio.

## Casos de uso

- Traducción automática de manga: el modelo aísla cada bocadillo y cada región de texto; esas máscaras alimentan un OCR y después un traductor, y el texto traducido se recompone dentro del contorno original. Sin la clase `bubble` diferenciada de `sfx`, las onomatopeyas acabarían en el traductor y producirían resultados incoherentes.
- Digitalización y archivado de fondos editoriales: sobre escaneos de tomos completos, el modelo extrae la estructura de paneles y bocadillos para generar metadatos por página, lo que permite búsquedas por contenido y navegación estructurada en una biblioteca digital.
- Reflow y lectura accesible: en pantallas pequeñas o en lectores para personas con baja visión, la clase `panel` permite recortar y reordenar viñetas para presentarlas de forma secuencial y a mayor tamaño, en lugar de mostrar la página completa reducida.
- Preprocesado para OCR a gran escala: al segmentar el texto como región independiente, se evita ejecutar OCR sobre toda la página, reduciendo coste computacional y falsos positivos en zonas de ilustración.
- Limpieza y restauración de escaneos: las máscaras de `bubble`, `text` y `panel` permiten aplicar operaciones diferenciadas por región (blanqueado de fondo, eliminación de ruido, realce de líneas) sin dañar el dibujo.
- Análisis de corpus visual para investigación: extraer estadísticas de densidad de texto por página, proporción de área ocupada por diálogo frente a ilustración o distribución de efectos sonoros, útil en estudios de estilo y de evolución editorial.
- Asistencia a la rotulación y a la producción: detección de paneles y bocadillos libres o mal cerrados en una página en fase de boceto, como comprobación automática dentro de un flujo de trabajo editorial.
- Integración en aplicaciones móviles de lectura: al exportarse a ONNX, el modelo puede ejecutarse en el propio dispositivo sin enviar páginas a un servidor, algo relevante por derechos de autor y privacidad del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de validación (mAP de caja, mAP de máscara, IoU por clase) ni comparaciones con otros modelos. Los resultados de la búsqueda web realizada no contienen datos técnicos sobre este modelo ni sobre segmentación de manga, por lo que no es posible construir una tabla de rendimiento sin inventar cifras.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la información proporcionada. Como orientación general y no confirmada por el autor, un modelo YOLO de segmentación de tamaño "small" operando a 1024 px con lote 1 suele encajar en el rango de pocos GB de VRAM, muy por debajo de los modelos de lenguaje de gran tamaño, pero esta estimación debe validarse empíricamente porque depende del runtime y de la resolución efectiva tras el padding.
- GPU recomendadas: no especificadas por el autor. Al ser un modelo convolucional de tamaño reducido, es previsible que funcione en GPUs de gama media y en GPUs de centro de datos (A100, H100) sin aprovechar su capacidad completa; estas últimas solo tendrían sentido para procesar lotes grandes en servidor.
- GPU de consumo: no hay confirmación oficial, pero por la naturaleza del modelo es esperable que quepa en GPUs de consumo convencionales (familia RTX) e incluso que pueda ejecutarse en CPU con latencias mayores. No se aportan cifras verificadas.
- Opciones de despliegue: al distribuirse en ONNX, es compatible con ONNX Runtime (CPU y GPU) y con la mayoría de runtimes de inferencia que aceptan ONNX. Ultralytics mantiene herramientas de exportación a otros formatos (TensorRT, OpenVINO, CoreML, TFLite), pero no se ha confirmado que el autor las haya generado. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, que no aplican a modelos de visión de este tipo.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imágenes por segundo bajo ninguna configuración de hardware.
- Advertencia sobre el repositorio: HuggingFace informa de un tamaño de repositorio de 0.0 GB y de cero descargas, lo que puede indicar que los pesos no están efectivamente alojados o que el repositorio se encuentra en un estado incompleto. Conviene verificar la presencia del archivo ONNX antes de planificar un despliegue.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones de modelos alternativos, y los resultados de la búsqueda web no aportan referencias técnicas utilizables. La comparativa se limita, por tanto, a categorías de alternativas conocidas, con los datos marcados como no disponibles cuando no proceden de la información facilitada.

| Modelo | Categoria | Clases | Formato | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| chiqui7/yolo11-manga-seg | YOLO11s-seg ajustado a manga | 4 (bubble, panel, sfx, text) | ONNX | MIT | Objeto de esta ficha |
| YOLO11s-seg base (Ultralytics) | Segmentacion de instancias general | 80 clases COCO | PyTorch, exportable a ONNX y otros | AGPL-3.0 en la distribucion de Ultralytics | No ajustado a dominio manga; requiere fine-tuning para las cuatro clases de esta ficha |
| Otros detectores o segmentadores de texto en comics (por ejemplo, enfoques basados en DBNet o modelos especializados de analisis de comics) | Deteccion de texto y estructura de pagina | Variable | Variable | Variable segun proyecto | No disponible en la informacion proporcionada; no se han podido verificar parametros, contexto ni metricas |

No se dispone de datos de rendimiento comparado, por lo que no es posible afirmar que este ajuste supere o iguale a las alternativas en mAP de máscara o en precisión por clase.

## Limitaciones y advertencias

- Sesgos y dominio: al ser un ajuste fino sin dataset documentado, se desconoce su comportamiento ante estilos de dibujo distintos de los usados en el entrenamiento (manga de diferentes escuelas, cómic europeo o americano, webtoon, bocetos). Es previsible una degradación fuera de la distribución original.
- Riesgo de error en la detección: un modelo de segmentación puede producir cajas y máscaras espurias, fusionar bocadillos adyacentes o clasificar erróneamente una onomatopeya como texto de diálogo. En un pipeline de traducción, esos errores se propagan al OCR y a la traducción.
- Alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es la invención de instancias inexistentes, especialmente en páginas con texturas, tramas o líneas densas.
- Dependencia crítica del preprocesado: el autor especifica 1024 px en el lado mayor, padding a múltiplo de 32 y relleno gris `[114, 114, 114]`. Cualquier desviación de ese régimen (otra resolución, otro color de relleno, recorte directo a 1024x1024) puede degradar notablemente la precisión. Es un requisito operativo, no una recomendación.
- Sin datos de evaluación: no hay métricas publicadas de validación, por lo que no existe una base objetiva para fijar umbrales de confianza en producción. Habrá que calibrar el umbral de confianza con un conjunto propio.
- Idiomas: no se declaran idiomas soportados. La detección de texto es visual y en principio independiente del idioma, pero no se ha validado para alfabetos no latinos ni para texto vertical, frecuente en manga japonés.
- Sin OCR: el modelo localiza texto, no lo reconoce. Cualquier caso de uso que requiera leer el contenido necesita un motor OCR adicional y un paso de post-procesado.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. Conviene revisar, no obstante, la licencia del checkpoint base de Ultralytics sobre el que se realizó el ajuste, ya que las condiciones de la distribución original pueden afectar a la del modelo derivado.
- Estado del repositorio: cero descargas, cero likes, tamaño de 0.0 GB y ausencia de pipeline declarado. Es un artefacto sin validación por parte de la comunidad; se recomienda tratarlo como experimental y verificar la integridad de los pesos antes de integrarlo.
- Fechas del repositorio: las marcas de creación y actualización indican 2026-09-17, posteriores a la fecha habitual de consulta; conviene comprobar la coherencia de esos metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chiqui7/yolo11-manga-seg
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante. Las únicas entradas devueltas corresponden a herramientas de edición de PDF (iLovePDF, Smallpdf, Sejda, Adobe Acrobat Online), sin relación alguna con el modelo, con segmentación de instancias ni con análisis de cómic. No se dispone por tanto de papers, blogs, repositorios ni demos adicionales verificados en la información proporcionada.
