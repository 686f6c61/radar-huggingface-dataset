# AutomatosX/AXDocLayout-M-v1.1

## Resumen

AXDocLayout-M v1.1 es un modelo de detección de objetos especializado en analizar la estructura de páginas de documentos. Lo desarrolla AutomatosX y su función es recibir una imagen de página ya decodificada en RGB y devolver etiquetas de clase, puntuaciones de confianza y cajas delimitadoras expresadas en las coordenadas de píxel del ráster original. Se distribuye con 36.683.480 parámetros y un peso de repositorio de 0,3 GB.

Técnicamente es un RT-DETRv2 con backbone `rtdetrv2_r50vd_m`, una variante de detección transformer en tiempo real derivada de la familia DETR. La taxonomía es fija y consta de 11 clases: `caption`, `footnote`, `formula`, `list_item`, `page_footer`, `page_header`, `picture`, `section_header`, `table`, `text` y `title`. El contrato de preprocesado, denominado `rgb-letterbox-1024/1`, redimensiona el lado largo a 1024 píxeles preservando la relación de aspecto, rellena con blanco hasta 1024 x 1024 y normaliza a float32 en el rango [0, 1].

Su relevancia actual es de tipo infraestructural: no compite en generación de texto, sino que actúa como primer eslabón de pipelines de Document AI y RAG sobre PDF, donde localizar regiones antes de aplicar OCR reduce coste y errores. Se publica con pesos FP32 en safetensors, un ONNX de operadores estándar (opset 16) y el código de inferencia completo para CPU, con verificación de digests por revisión inmutable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RT-DETRv2, variante `rtdetrv2_r50vd_m` (transformer de detección en tiempo real con backbone ResNet-50 vd) |
| Parámetros totales | 36.683.480 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada de imagen fija con lado largo reescalado a 1024 y padding a 1024 x 1024 |
| Tipos de cuantización | No disponible; solo se documenta FP32 para CPU. Precisión reducida y GPU requieren cualificación por separado según el autor |
| Idiomas soportados | No aplica / no disponible; el modelo procesa rásters de página y no texto, por lo que no tiene soporte idiomático declarado |
| Licencia | AGPL-3.0-only (GNU Affero General Public License versión 3 únicamente) |
| Formato de pesos | `model.safetensors` (FP32) y `model.onnx` (opset 16); código de inferencia en `inference/` |
| Tarea (pipeline) | `object-detection` |
| Clases de salida | 11 clases públicas (`caption`, `footnote`, `formula`, `list_item`, `page_footer`, `page_header`, `picture`, `section_header`, `table`, `text`, `title`); el índice 0 está reservado y nunca se emite |
| Entrada | Un ráster HWC uint8 RGB; ONNX: `images` float32 [N, 3, 1024, 1024] y `orig_target_sizes` int64 [N, 2] |
| Salida | `labels`, `boxes`, `scores`; las cajas ONNX en bruto están en espacio letterbox xyxy y deben deshacerse el padding y el escalado |
| Umbral de confianza | Score floor de 0.30 aplicado por la API pública, que además descarta etiquetas inválidas o reservadas |
| Esquema de salida | JSON `ax-doclayout.detection/1`; taxonomía `ax-doclayout-11/1` |
| Tamaño del repositorio | 0,3 GB |
| Backends documentados | ONNX y PyTorch, ambos en CPU FP32 |

## Arquitectura y entrenamiento

El modelo es un detector RT-DETRv2 de la variante `rtdetrv2_r50vd_m`. RT-DETR sustituye el componente de propuestas de los detectores de una etapa por un decodificador transformer que predice directamente conjuntos de cajas, sin anclas ni supresión no máxima dependiente de umbrales ajustados a mano. El sufijo `vd` del backbone indica la variante con convoluciones deformables y capas de agregación de múltiples escalas, habitual en las configuraciones de RT-DETR de resolución media. Con 36,68 millones de parámetros, se sitúa en un rango medio, pensado para ejecutarse en CPU y en GPUs modestas antes que para maximizar precisión en clústeres.

La contribución propia de AutomatosX es la taxonomía de layout documental, el contrato de preprocesado `rgb-letterbox-1024/1`, el esquema JSON versionado y el pipeline de inferencia reproducible con verificación de digests por revisión. No se han publicado en la información disponible el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si hubo fases de ajuste como RLHF o DPO (conceptos que, por otra parte, apenas aplican a un detector). El autor tampoco desglosa las estrategias de aumento de datos ni la partición de validación. La atribución de la arquitectura upstream se recoge en el fichero NOTICE del repositorio, y los componentes previamente licenciados como Apache-2.0 conservan sus avisos originales.

Cabe señalar que el autor declara explícitamente que esta versión no formula ninguna afirmación independiente de benchmark ni de superioridad de velocidad, y que los backends cualificados son únicamente CPU en FP32.

## Capacidades

- Detección de 11 regiones de layout en rásters de página: títulos, encabezados de sección, texto, listas, tablas, figuras, fórmulas, pies de figura, notas al pie, encabezados de página y pies de página.
- Devolución de cajas delimitadoras con coordenadas en píxeles del ráster original, con bordes de píxel semiabiertos y origen en la esquina superior izquierda (x hacia la derecha, y hacia abajo).
- Salida estructurada conforme al esquema `ax-doclayout.detection/1`, que incluye identidad del modelo, revisión inmutable, digest de los artefactos y dimensiones de la página.
- Preprocesado determinista y documentado: letterbox a 1024 preservando relación de aspecto, relleno blanco y normalización a float32.
- Dos backends intercambiables con el mismo contrato de entrada y salida: ONNX Runtime y PyTorch.
- Ejecución en CPU FP32 con código fuente de inferencia incluido, lo que permite despliegues sin GPU y auditoría del código.
- Filtrado de detecciones de baja confianza mediante un score floor de 0.30 y descarte de etiquetas inválidas o del índice reservado.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, function calling, uso agéntico ni capacidades multimodales más allá de la entrada de imagen.
- No realiza OCR, extracción de texto, apertura de PDF, predicción de orden de lectura o jerarquía, ni reconstrucción de celdas de tabla. Estas tareas quedan fuera del alcance declarado del modelo.

## Casos de uso

- Segmentación previa a OCR en pipelines de digitalización: el detector aísla las regiones `text`, `list_item`, `caption` y `footnote` para que el motor OCR procese solo esas áreas, reduciendo el número de llamadas y evitando leer encabezados o pies de página como contenido. Es adecuado porque la salida ya viene en coordenadas del ráster original listas para recortar.
- Construcción de índices RAG sobre corpus PDF: las cajas de `section_header` permiten trocear el documento por secciones semánticas en lugar de por ventanas de caracteres fijas, mejorando la recuperación. El modelo no genera texto, por lo que se combina con un OCR y un modelo de embeddings externos.
- Extracción estructurada de facturas, albaranes y formularios administrativos: separar `table` de `text` y `picture` permite dirigir cada región a un extractor especializado en tablas o a un campo de texto libre. Con 36,68 millones de parámetros se puede ejecutar en el mismo nodo que el resto del pipeline sin GPU dedicada.
- Recorte de figuras y tablas para alimentar modelos de visión-lenguaje: las detecciones `picture` y `table` sirven para generar recortes limpios que después se pasan a un VLM para descripción o transcripción, evitando enviar la página completa y ahorrando contexto visual.
- Cuantificación de contenido documental y control de calidad editorial: medir la proporción de área ocupada por `picture`, `table` y `formula` permite clasificar páginas por densidad visual y detectar maquetaciones defectuosas en un proceso de preimpresión.
- Preatonotación para etiquetado humano: las cajas con confianza superior a 0.30 se cargan como propuesta inicial en una herramienta de anotación, de modo que los revisores solo corrigen, lo que acelera la creación de datasets de layout propios.
- Procesado de fondos documentales y hemerotecas: la distinción entre `page_header`, `page_footer` y `text` facilita separar folios, cabeceras de periódico y firmas del cuerpo del artículo en digitalizaciones históricas.
- Despliegue on-premise en entornos regulados: al distribuirse con código de inferencia y pesos verificables por digest, y funcionar en CPU FP32, encaja en organizaciones que no pueden enviar documentos a servicios externos, siempre que asuman las obligaciones de la AGPL-3.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica de forma explícita que esta versión no realiza ninguna afirmación independiente de benchmark ni de superioridad de velocidad, y que la cualificación documentada corresponde a CPU en FP32.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como medición publicada. Como referencia aritmética, los 36.683.480 parámetros en FP32 ocupan aproximadamente 147 MB, a los que hay que sumar las activaciones de una entrada de 1024 x 1024; en la práctica, un despliegue en CPU no consume VRAM y una ejecución en GPU con batch 1 debería caber holgadamente en tarjetas de gama media, aunque el autor no lo ha cualificado.
- GPU recomendadas: no disponibles. El autor solo documenta backends CPU FP32 y señala que el despliegue en GPU requiere cualificación por separado. Cualquier GPU consumer con varios gigabytes libres (por ejemplo, gama RTX 30 o 40) es un candidato razonable, pero sin validación oficial.
- Compatibilidad con GPU de consumo: probable pero no verificada. No hay datos de latencia ni de memoria publicados para GPU.
- Opciones de despliegue: el modelo se distribuye con código de inferencia propio instalable como `inference[onnx]` o `inference[torch]`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un detector de objetos de este tipo. Para servir en producción cabría exportar el ONNX a un runtime de inferencia, algo que queda fuera de lo cualificado por el autor.
- Entorno de ejecución: requiere Python 3.12 o 3.13. El cargador verifica los digests de los artefactos y exige seleccionar explícitamente el backend ONNX o PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados en la información proporcionada para establecer comparaciones cuantitativas. Los modelos de la misma categoría (detección de layout documental) incluyen DocLayout-YOLO, LayoutLMv3 en su tarea de detección y DiT (Document Image Transformer), pero sus cifras de parámetros, contexto, rendimiento y licencia no han sido confirmadas en esta búsqueda, por lo que se marcan como no disponibles en lugar de estimarlas.

| Modelo | Parámetros | Resolución de entrada | Licencia | Formatos | Datos verificados |
|---|---|---|---|---|---|
| AutomatosX/AXDocLayout-M v1.1 | 36.683.480 | Lado largo a 1024, padding a 1024 x 1024 | AGPL-3.0-only | safetensors FP32, ONNX opset 16 | Sí, según la model card |
| DocLayout-YOLO | No disponible | No disponible | No disponible | No disponible | No verificados en esta búsqueda |
| LayoutLMv3 (detección) | No disponible | No disponible | No disponible | No disponible | No verificados en esta búsqueda |
| DiT (Document Image Transformer) | No disponible | No disponible | No disponible | No disponible | No verificados en esta búsqueda |

## Limitaciones y advertencias

- La licencia es AGPL-3.0-only, no una licencia no comercial: el uso comercial está permitido, pero la distribución de obras derivadas y el uso modificado como servicio de red obligan a poner a disposición el código fuente correspondiente. Esto es especialmente relevante si el modelo se integra en un SaaS propietario.
- Los componentes previamente licenciados como Apache-2.0 conservan sus avisos y derechos originales, recogidos en el fichero NOTICE; esta relicencia no se aplica retroactivamente a versiones anteriores.
- La API pública aplica un score floor de 0.30 y descarta etiquetas inválidas o reservadas, lo que puede eliminar detecciones correctas de baja confianza. Las puntuaciones no garantizan corrección y los límites precisos de las regiones pueden requerir revisión humana.
- El modelo no abre PDF, no hace OCR, no extrae texto, no predice orden de lectura ni jerarquía y no reconstruye celdas de tabla. Cualquier expectativa en ese sentido queda fuera de su alcance declarado.
- El redimensionado del lado largo a 1024 puede degradar la detección de elementos tipográficamente pequeños, como notas al pie, ecuaciones densas o tablas con mucho detalle, al reducir su resolución efectiva.
- La taxonomía es fija y cerrada en 11 clases. Elementos no contemplados (sellos, firmas, marcas de agua, códigos de barras) no se detectan y probablemente se absorban en clases genéricas como `text` o `picture`.
- No se ha publicado información sobre la composición del dataset de entrenamiento, por lo que se desconocen los sesgos de dominio: cabría esperar un rendimiento peor en documentos manuscritos, idiomas no representados en el corpus de entrenamiento o maquetaciones muy alejadas de las vistas durante el entrenamiento.
- No hay resultados de benchmarks ni validación independiente. El propio autor advierte de que debe validarse el modelo sobre páginas representativas antes de desplegarlo.
- Solo están cualificados los backends CPU en FP32. La precisión reducida y el despliegue en GPU requieren cualificación adicional y no están cubiertos por la documentación.
- El repositorio declara cero descargas y cero valoraciones, y no se han encontrado referencias externas, publicaciones ni discusiones independientes sobre el modelo.
- Al tratarse de un detector, el modo de fallo típico no es la alucinación de texto sino los falsos positivos y falsos negativos de localización, con cajas que pueden solaparse o fragmentar regiones contiguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AXDocLayout-M-v1.1
- Revisión de código de inferencia citada en la model card: revision `736d22da040c5e38911271b5628fcf30e2fe5191`
- Revisión de pesos citada en la model card: revision `6c1fea1eef7c52c9965b592bc521cfb7c6980001`
- Ficheros LICENSE y NOTICE dentro del repositorio, con la licencia AGPL-3.0-only y la atribución de arquitectura
- Directorio `inference/` del repositorio, con el código fuente completo de inferencia CPU
- Paper, blog, repositorio adicional o demo: no disponibles. La búsqueda web realizada no devolvió ninguna página relacionada con el modelo ni con detección de layout documental.
