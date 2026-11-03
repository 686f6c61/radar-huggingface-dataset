# erlanliraa/aedes-tcc-weights

## Resumen

`erlanliraa/aedes-tcc-weights` es una colección de pesos de detección de objetos entrenados para localizar huevos de *Aedes aegypti* en imágenes de palhetas (paletas de oviposición) procedentes de la FIOCRUZ-PE. El autor es Erlan Lira (UFPE) y forma parte de un trabajo de fin de carrera que compara múltiples arquitecturas y variantes de dataset, desde YOLO26 en sus escalas L y N hasta RT-DETR-L. No es un modelo de lenguaje: es un conjunto de checkpoints de visión por computador en formato Ultralytics (`best.pt`), pensado para ser cargado con la librería `ultralytics` y ejecutado sobre imágenes de laboratorio entomológico.

El repositorio contiene 26 experimentos identificados por carpeta. El autor designa como "teacher oficial" el modelo 6 (`6_rt_detr_l_filtrado_degradado_escala_alinhada`), un RT-DETR-L entrenado sobre el dataset `ovos_micro_yolo26_filtrado_degradado_escala_alinhada`, con una mejora reportada del 5,54 % frente a la referencia FIOCRUZ y un F1 aproximado de 0,30 en la evaluación de conteo con SAHI. Los modelos 12 (YOLO26-N con pseudo-etiquetas) y el resto de la serie N actúan como alumnos o controles de ablación dentro de un esquema de destilación y aumento de datos.

La relevancia práctica del conjunto es doble: por un lado, ofrece un punto de partida reproducible para monitorización vectorial automatizada; por otro, documenta con transparencia un proceso de experimentación con ablaciones (filtrado de dataset, degradaciones, alineado de escala, padding negro, pseudo-etiquetado con distintos umbrales de confianza y semillas), lo que resulta útil para quien quiera replicar o extender el pipeline. El tamaño del repositorio es de 0,8 GB y la licencia es CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de YOLO26-L, YOLO26-N y RT-DETR-L según carpeta (detectores de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos `best.pt` de Ultralytics; exportación a ONNX/TensorRT/OpenVINO posible vía herramienta, no documentada en la model card) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `best.pt` (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

El repositorio agrupa dos familias de detectores. La primera es YOLO26, en escala L (modelos 1, 2, 4 y 5) y en escala N (modelos 8, 9 y 12 a 26); la segunda es RT-DETR-L (modelos 3, 6, 7, 10, 11, 13, 14 y 15). YOLO26 es un detector de una etapa con asignación de etiquetas y cabezas densas típicas de la familia YOLO; RT-DETR es un transformer de detección en tiempo real con consultas de objeto y decodificador DETR, lo que elimina las anchors y el post-procesado NMS. La model card no detalla el número de parámetros ni la resolución nativa de entrenamiento de cada checkpoint.

El entrenamiento se organiza en torno a varios datasets alojados en `erlanliraa/aedes-tcc-datasets`: `ovos_micro_yolo26_filtrado_degradado_escala_alinhada` (modelo 6), `ovos_micro_yolo26_filtrado_degradado` (modelo 7), `dataset_combinado` (modelos 8, 23, 25 y 26), `dataset_combinado_com_pseudo_labels` (modelos 12, 19, 20 y 22), `dataset_combinado_pseudo_conf030` (modelos 16, 18, 21 y 24), `dataset_combinado_pseudo_conf035` (modelo 17), `degrad_manual_alinhado_padding_preto` (modelo 13), `dataset_B_fork_professor_epoca_60_letterbox_fix_escala_alinhada` (modelo 14) y `dataset_B_via_cut_nce_idt_epoca60_letterbox_fix_escala_alinhada` (modelo 15). Las variantes "degradado" y "escala alinhada" sugieren aumentos de datos que simulan degradación de imagen y reescalado consistente entre fuentes; "padding preto" indica relleno negro en lugar de letterbox convencional. Los modelos 16 a 26 exploran el pseudo-etiquetado con umbrales de confianza 0,30 y 0,45 y distintas semillas (seed 0, 1 y 2) en lotes de 8, lo que apunta a un esquema de autoentrenamiento o destilación desde el teacher hacia el alumno YOLO26-N.

No se documentan en la información disponible el número de tokens, la composición exacta del dataset, el uso de RLHF/DPO (no aplica a visión) ni innovaciones como decodificación especulativa. La innovación metodológica destacable es el propio protocolo experimental: ablaciones sistemáticas sobre filtrado, degradación, alineado de escala y pseudo-etiquetado, con evaluación de conteo mediante SAHI.

## Capacidades

- Detección de objetos de una sola clase: huevos de *Aedes aegypti* sobre palhetas de oviposición.
- Localización con cajas delimitadoras, apta para conteo posterior mediante agregación de detecciones.
- Inferencia con SAHI (Slicing Aided Hyper Inference) a 640×640 con solapamiento del 20 %, configuración usada por el autor para la evaluación de conteo.
- Dos familias de detectores intercambiables: YOLO26 (L y N) para despliegue ligero y RT-DETR-L para mayor capacidad de modelado global.
- Carga directa con la API de Ultralytics (`from ultralytics import RTDETR`), con acceso a las utilidades de entrenamiento, validación y exportación de la librería.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo "thinking": es un detector de objetos especializado.
- No se documentan capacidades de segmentación, clasificación de especie ni detección de otros estadios del mosquito.

## Casos de uso

- Monitorización entomológica automatizada: el modelo 6 (RT-DETR-L) se usaría para procesar lotes de imágenes de palhetas recogidas en campo o laboratorio y obtener un recuento de huevos por palheta, sustituyendo el conteo manual y reduciendo el tiempo de análisis por muestra.
- Programas de vigilancia vectorial municipal: integración del detector en un pipeline que reciba imágenes de trampas de oviposición y genere alertas cuando el conteo supere un umbral, con el modelo 12 (YOLO26-N) como opción de bajo coste computacional para despliegue en dispositivos modestos.
- Control de calidad en insectarios: comparación automática entre el conteo del modelo y el conteo de referencia para detectar desviaciones en la producción de colonias, usando el protocolo SAHI 640×640 con confianza 0,35 descrito por el autor.
- Investigación sobre degradación de imagen: los checkpoints de las carpetas "degradado" permiten estudiar cómo afecta la calidad de captura al recuento, y sirven como referencia para elegir la variante más robusta en condiciones de campo adversas.
- Destilación y entrenamiento de modelos pequeños: el modelo 6 actúa como teacher para generar pseudo-etiquetas que alimentan los alumnos YOLO26-N (carpetas 16 a 26), un flujo reutilizable para crear detectores ligeros a partir de un detector grande ya validado.
- Reproducibilidad académica: el conjunto de 26 ablaciones con semillas y umbrales documentados permite replicar experimentos de comparación de arquitecturas y estrategias de aumento de datos en un dominio de imagen microscópica.
- Despliegue en borde con Ultralytics: exportación de los checkpoints YOLO26-N a formatos optimizados (ONNX, TensorRT, OpenVINO) mediante la herramienta de la librería para ejecutar la detección en equipos con GPU integrada o CPU.

## Benchmarks y rendimiento

La model card solo aporta una métrica agregada del modelo 6: una mejora del 5,54 % frente a la referencia FIOCRUZ y un F1 aproximado de 0,30 en la evaluación de conteo con SAHI 640×640, solapamiento del 20 %, confianza 0,35 y sin filtro, sobre 28 palhetas FIOCRUZ-PE con 8.035 huevos. No se publican resultados por modelo ni comparativas numéricas completas.

| Modelo | Metrica | Valor |
|---|---|---|
| 6 (RT-DETR-L) | Mejora frente a referencia FIOCRUZ | +5,54 % |
| 6 (RT-DETR-L) | F1 en conteo (SAHI 640×640, overlap 20 %, conf 0,35) | ≈0,30 |
| Resto de modelos | Metricas detalladas | no disponible |

No se han publicado resultados de benchmarks estándar (COCO, MMLU, HumanEval, GSM8K) en la información disponible, y no procede aplicarlos a un detector de una sola clase.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como orientación de orden de magnitud para las arquitecturas empleadas, un RT-DETR-L en FP32 requiere del orden de varios GB de VRAM, mientras que un YOLO26-N es sustancialmente más ligero; el autor no publica mediciones.
- GPU recomendadas: no especificadas. Por familia, RT-DETR-L se beneficia de GPU de datacenter (A100, H100) o de gama alta consumer (RTX 4090) para procesar lotes; YOLO26-N es adecuado para GPU consumer de gama media y para inferencia en CPU.
- Cabe en GPU consumer: los checkpoints YOLO26-N son los candidatos naturales para GPU consumer; los RT-DETR-L también caben en tarjetas con suficiente VRAM, pero sin cifras publicadas no se puede confirmar el mínimo.
- Opciones de despliegue: la librería `ultralytics` permite cargar los `best.pt` directamente y exportar a ONNX, TensorRT, OpenVINO y otros formatos. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| aedes-tcc-weights (modelo 6) | RT-DETR-L | no disponible | no aplica | +5,54 % vs FIOCRUZ, F1 ≈0,30 | CC-BY-4.0 | HuggingFace |
| aedes-tcc-weights (modelo 12) | YOLO26-N | no disponible | no aplica | no disponible | CC-BY-4.0 | HuggingFace |
| YOLO26 oficial (Ultralytics) | YOLO26 (L/N) | no disponible en la informacion | no aplica | no disponible en la informacion | licencia Ultralytics (no confirmada aqui) | Repositorio Ultralytics |
| RT-DETR oficial (Baidu) | RT-DETR-L | no disponible en la informacion | no aplica | no disponible en la informacion | licencia del proyecto original (no confirmada aqui) | Repositorio oficial |

La comparación relevante no es frente a modelos de lenguaje, sino frente a los detectores genéricos de los que derivan estos checkpoints. La diferencia clave es el dominio: los pesos de este repositorio están ajustados a huevos de *Aedes aegypti* sobre palhetas, mientras que los modelos oficiales de YOLO26 y RT-DETR son genéricos y requerirían fine-tuning para esta tarea. No se dispone de datos publicados para comparar métricas entre ambos.

## Limitaciones y advertencias

- Modelo de una sola clase y dominio muy estrecho: no detecta otras especies, estadios del mosquito ni objetos fuera de las palhetas de oviposición.
- El F1 reportado para el modelo 6 es aproximadamente 0,30, un valor bajo que indica un margen amplio de error en el conteo; conviene validar en el dominio concreto antes de usarlo en producción.
- Los resultados se obtuvieron con una configuración específica (SAHI 640×640, solapamiento 20 %, confianza 0,35, sin filtro) sobre 28 palhetas y 8.035 huevos; cambiar estos parámetros altera las métricas.
- Riesgo de falsos positivos y negativos en imágenes con degradación, desenfoque, iluminación desigual u oclusiones; precisamente las variantes "degradado" existen para mitigarlo, pero no hay métricas por variante publicadas.
- Varios modelos son ablaciones sin dataset publicado en el Hub o con datasets locales no enviados (por ejemplo, el modelo 5, de unos 13 GB), por lo que no son reproducibles de forma directa.
- La model card está mayoritariamente en portugués y no documenta sesgos, composición del dataset ni procedencia detallada de las imágenes; no se puede evaluar el sesgo de dominio.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero obliga a citar al autor y a indicar cambios; conviene revisar también las condiciones de los datasets de origen y de las imágenes de FIOCRUZ-PE.
- No se documentan requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue sin pruebas propias.
- El repositorio tiene 0,8 GB y 26 carpetas; hay que seleccionar explícitamente el checkpoint adecuado, ya que no todos representan el mismo nivel de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erlanliraa/aedes-tcc-weights
- Datasets asociados: https://huggingface.co/datasets/erlanliraa/aedes-tcc-datasets
- Documentación del proyecto (referenciada en la model card): `DOCUMENTACAO.md` dentro del repositorio
- Librería Ultralytics: https://github.com/ultralytics/ultralytics
- Repositorio oficial de RT-DETR: no disponible en la información proporcionada
- Paper de RT-DETR: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible en la información proporcionada
