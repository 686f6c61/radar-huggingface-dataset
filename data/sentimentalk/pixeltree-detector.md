# sentimentalk/pixeltree-detector

## Resumen

pixeltree-detector es un detector de objetos basado en YOLO11s, desarrollado por el usuario sentimentalk, que localiza todos los elementos de interfaz visibles en capturas de pantalla de escritorio y web y les asigna uno de 16 roles ARIA (button, link, menuitem, tab, checkbox, radio, textbox, combobox, slider, progressbar, gridcell, listitem, heading, img), además de las clases `vax:visibleText` y `other:visible`. El modelo no genera nombres ni estados: solo cajas y roles. Combinado con OCR en el código de pixeltree, transforma una captura en una lista textual de elementos ("el árbol") que un agente GUI puede leer.

El modelo pesa 19 MB (YOLO11s) y se distribuye como un fine-tune sobre Ultralytics/YOLO11, entrenado con 2.782 capturas anotadas automáticamente por Claude Opus bajo una convención de cajas escrita, sin anotación humana. Se trata de una release de investigación acompañada de un paper corto que analiza qué agentes se benefician del árbol de elementos y cuáles no.

Es relevante para quienes construyen agentes de interfaz gráfica, automatización de pruebas de UI o herramientas de accesibilidad basadas en visión: ofrece una capa de percepción ligera y local que evita depender de APIs multimodales para el parsing de pantalla, aunque con limitaciones claras en iconos sin texto y en la duplicación de elementos anidados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye checkpoint PyTorch `.pt`) |
| Idiomas soportados | en (etiquetas de roles en inglés; el OCR externo determina el idioma del texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) |
| Tamaño del repositorio | 0.0 GB (checkpoint de 19 MB según la model card) |
| Resolución de inferencia recomendada | imgsz=1280, conf=0.25 |
| Clases de salida | 16 roles |
| Modelo base | Ultralytics/YOLO11 (fine-tune) |

## Arquitectura y entrenamiento

La arquitectura es YOLO11s, un detector de objetos convolucional de una etapa de la familia Ultralytics, configurado a resolución de entrada 1280 píxeles. El modelo parte de un checkpoint YOLO11s propio del autor, preentrenado sobre datos sintéticos y páginas web (no publicado); según la model card, partir del YOLO11s público de COCO en su lugar puntúa 0.848 frente a 0.854 en el conjunto held-out de aplicaciones Linux, una diferencia pequeña pero medible.

El entrenamiento usó 2.782 capturas de pantalla más una validación interna de 130 imágenes. Las fuentes son capturas propias de aplicaciones de escritorio Linux en displays virtuales con datos sintéticos, un subconjunto del dataset público GroundCUA (MIT) y capturas de sitios web públicos. Todas las etiquetas fueron generadas por Claude Opus bajo una convención de cajas escrita ("la caja ajustada de lo que está pintado ahora"), con QA de Claude Sonnet sobre una muestra y una ronda de corrección; no hay etiquetas humanas. La receta fue 40 épocas, batch 12, checkpoint `last.pt`, unas 21 minutos en una A100. El split es por aplicación: ninguna app o web del conjunto de evaluación apareció en entrenamiento.

La innovación principal no está en la arquitectura sino en el pipeline: el detector aporta cajas y roles, y el OCR del repositorio pixeltree aporta los nombres, produciendo líneas con el formato `role [id] "name" @(left, top, width, height) c=(centre_x, centre_y)`. No se menciona RLHF, DPO ni decodificación especulativa, ya que no es un modelo generativo.

## Capacidades

- Detección de elementos de interfaz en capturas de escritorio y web, con cajas delimitadoras y uno de 16 roles.
- Clasificación en roles ARIA estándar: button, link, menuitem, tab, checkbox, radio, textbox, combobox, slider, progressbar, gridcell, listitem, heading e img.
- Detección de líneas de texto visibles mediante la clase `vax:visibleText`.
- Clase de reserva `other:visible` para cualquier otro elemento visible no cubierto por los roles anteriores.
- Integración con OCR externo (en el código pixeltree) para asignar nombres a los elementos detectados.
- Salida consumible por agentes GUI como árbol textual de elementos con coordenadas y centroides.
- No soporta tool calling, function calling, razonamiento multi-step ni generación de texto: es exclusivamente un modelo de percepción visual.
- No predice estados (habilitado, deshabilitado, marcado) ni nombres; solo cajas y roles.

## Casos de uso

- Agentes GUI basados en visión: el detector convierte una captura en un árbol de elementos con coordenadas que el agente puede leer para decidir dónde hacer clic o escribir, sin depender de APIs multimodales externas para el parsing de pantalla.
- Automatización de pruebas de interfaz: en pipelines de QA, el modelo localiza botones, campos de texto y pestañas en capturas de cada build para verificar que los elementos esperados están presentes y en la posición correcta.
- Accesibilidad asistida: combinado con OCR, genera una descripción estructurada de la pantalla que puede alimentar lectores de pantalla o herramientas de navegación por teclado en aplicaciones sin etiquetas ARIA nativas.
- RPA (automatización robótica de procesos) sobre aplicaciones legacy: para aplicaciones de escritorio sin API de accesibilidad fiable, el detector proporciona las coordenadas de los controles a partir de la imagen.
- Extracción de estructura de páginas web: con la clase `aria:heading`, `aria:link` y `vax:visibleText`, se puede reconstruir la jerarquía visual de una página a partir de una captura, útil para scraping visual o auditorías de maquetación.
- Investigación en agentes de interfaz: el paper adjunto evalúa qué agentes se benefician del árbol de elementos, por lo que el modelo sirve como componente de percepción reproducible en experimentos de agentes GUI.
- Indexación y búsqueda de capturas: procesar lotes de capturas para etiquetar elementos y permitir búsquedas posteriores por tipo de control o texto visible.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Protocolo: matching greedy uno a uno con IoU ≥ 0.5.

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| pixeltree held-out Linux apps (258 imágenes) | F1 class-agnostic @0.25, IoU 0.5 | 0.854 |
| pixeltree held-out Linux apps (258 imágenes) | F1 class-agnostic @0.45, IoU 0.5 | 0.874 |
| pixeltree held-out Linux apps (258 imágenes) | F1 estricto (rol debe coincidir) @0.25, IoU 0.5 | 0.798 |
| pixeltree held-out websites (45 imágenes) | F1 class-agnostic @0.25, IoU 0.5 | 0.787 |
| pixeltree held-out websites (45 imágenes) | F1 class-agnostic @0.45, IoU 0.5 | 0.813 |
| pixeltree gold set (Linux 72 + macOS 114 imágenes) | F1 class-agnostic @0.25, IoU 0.5 | 0.815 |
| pixeltree gold set (Linux 72 + macOS 114 imágenes) | F1 class-agnostic @0.45, IoU 0.5 | 0.826 |
| pixeltree gold set (Linux 72 + macOS 114 imágenes) | F1 estricto (rol debe coincidir) @0.25, IoU 0.5 | 0.737 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del checkpoint (19 MB, YOLO11s) y la resolución de entrada 1280, la inferencia es muy ligera y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor entrenó en una A100 (21 minutos, 40 épocas); para inferencia basta con una GPU consumer moderna (RTX 3060 o superior) o incluso CPU para volúmenes bajos.
- Cabe en GPU consumer: sí, con margen amplio dado el tamaño del modelo.
- Opciones de despliegue: Ultralytics (Python, `YOLO(...).predict(...)`), exportación a formatos soportados por Ultralytics (ONNX, TensorRT, etc., aunque no se detallan en la información disponible), y el paquete pixeltree (`pip install -e ".[perceive]"`) para el pipeline completo con OCR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pixeltree-detector | YOLO11s fine-tune | 19 MB | 16 roles UI | AGPL-3.0 | Hugging Face |
| Ultralytics YOLO11s (COCO) | YOLO11s | ~19 MB | 80 clases COCO (no UI) | AGPL-3.0 | Ultralytics |
| GroundCUA (dataset) | no aplica (dataset) | no disponible | anotaciones de UI de escritorio | MIT | Público |

No se dispone en la información proporcionada de otros detectores de elementos de interfaz directamente comparables con métricas equivalentes; por tanto, la comparación cuantitativa con alternativas específicas de UI queda como no disponible.

## Limitaciones y advertencias

- Los iconos sin texto legible reciben nombre vacío (`""`), y el OCR puede malinterpretar iconos como caracteres (`"Q"`, `"="`, `"业"`, `"0"` en el ejemplo de la model card).
- Un mismo elemento puede aparecer duplicado en el árbol, por ejemplo como `aria:listitem` y como `vax:visibleText` anidado.
- El modelo no predice nombres ni estados de los elementos; depende de OCR externo para los nombres y no informa de habilitado/deshabilitado/marcado.
- Las etiquetas de entrenamiento fueron generadas automáticamente por Claude Opus sin anotación humana, lo que puede introducir sesgos sistemáticos en la convención de cajas y en la asignación de roles.
- El split es por aplicación, pero el conjunto de evaluación es reducido (258 imágenes Linux, 45 webs, 186 en el gold set), por lo que la generalización a otras plataformas y aplicaciones no está garantizada.
- El rendimiento cae en el conjunto estricto (rol debe coincidir): 0.798 en Linux apps y 0.737 en el gold set, frente a 0.854 y 0.815 en la métrica class-agnostic.
- Licencia AGPL-3.0: el uso comercial en servicios de red puede obligar a liberar el código fuente derivado; revisar implicaciones antes de integrarlo en productos propietarios.
- Es una release de investigación; el checkpoint inicial propio del autor no se ha publicado, lo que limita la reproducibilidad exacta del entrenamiento.
- Las imágenes de entrenamiento no se redistribuyen, lo que dificulta la auditoría del dataset.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la detección, especialmente en interfaces con estilos visuales alejados de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sentimentalk/pixeltree-detector
- Repositorio pixeltree: https://github.com/SentimentalK/pixeltree
- Paper corto: https://github.com/SentimentalK/pixeltree/blob/main/PAPER.md
- Convención de etiquetado: https://github.com/SentimentalK/pixeltree/blob/main/labeling/box_convention_v1.md
- Documentación de datos: https://github.com/SentimentalK/pixeltree/blob/main/DATA.md
- Dataset GroundCUA (ServiceNow): https://huggingface.co/datasets/ServiceNow/GroundCUA
- Modelo base Ultralytics YOLO11: https://huggingface.co/Ultralytics/YOLO11
