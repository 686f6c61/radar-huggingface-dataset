# LibreYOLO/LibreGTRm

## Resumen

LibreGTRm es un checkpoint de detección de objetos publicado por el proyecto LibreYOLO. Se trata de la conversión de los pesos GTR-M entrenados sobre COCO por Intellindust-AI-Lab al esquema de metadatos de LibreYOLO (schema v1.0), de modo que puedan cargarse directamente con la librería `libreyolo` mediante una única llamada a `predict`. No es un modelo entrenado desde cero por LibreYOLO, sino una adaptación de formato de pesos ya existentes: los parámetros aprendidos y las claves del `state_dict` se mantienen sin cambios, y únicamente se ha seleccionado el estado EMA y se ha eliminado el estado de entrenamiento y del optimizador.

El modelo resuelve la tarea de detección de objetos en imágenes con una entrada por defecto de 640 x 640 píxeles y está pensado para integrarse en el ecosistema LibreYOLO, que agrupa distintas familias de detectores bajo una API común. El repositorio ocupa 0,1 GB, lo que sitúa el checkpoint en el rango de las decenas de millones de parámetros y permite su ejecución en hardware de consumo, incluida la inferencia en CPU.

Su relevancia actual es de carácter más práctico que científico: amplía la oferta de familias de detectores disponibles en LibreYOLO con una variante basada en la arquitectura GTR, facilitando pruebas comparativas internas. La propia model card advierte de que no se reclama ninguna cifra de precisión o latencia reproducida de forma independiente, y de que las comprobaciones de paridad en CUDA, precisión COCO y validación de entrenamiento RF1 quedan aplazadas a la versión v1.6.0 de LibreYOLO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector de objetos de la familia GTR (Intellindust-AI-Lab); detalle de capas y mecanismos de atención no disponible |
| Parámetros totales | no disponible (el repositorio ocupa 0,1 GB, lo que sugiere decenas de millones de parámetros) |
| Longitud de contexto | no aplica; la entrada es una imagen de 640 x 640 píxeles |
| Tipos de cuantización | no disponible; el artefacto publicado es un checkpoint PyTorch (`.pt`) |
| Idiomas soportados | no aplica; las 80 clases de COCO se nombran en inglés |
| Licencia | MIT (código fuente y pesos) |
| Formato de pesos | PyTorch (`.pt`) con metadatos LibreYOLO schema v1.0 |
| Tarea | Detección de objetos (`object-detection`) |
| Dataset de entrenamiento | `detection-datasets/coco` |
| Resolución de entrada por defecto | 640 x 640 píxeles |
| Librería | `libreyolo` (a partir de la versión que incluya soporte GTR) |
| Tamaño del repositorio | 0,1 GB |
| Revisión del código fuente | `782e737efe2e6437ac537fbdcee089673d3376c1` |
| Revisión de los pesos originales | `9fc62c8c2b2c976835d0f1c1ffc544dbc0f9e29f` |

## Arquitectura y entrenamiento

La información disponible no describe en detalle la arquitectura interna de GTR-M. Los metadatos indican únicamente que se trata de un modelo de detección de objetos implementado sobre PyTorch, perteneciente a la familia GTR mantenida por Intellindust-AI-Lab, y que su implementación oficial se distribuye con licencia MIT. No se especifican el número de capas, el mecanismo de atención empleado, si se trata de un detector transformer puro o de una arquitectura híbrida, ni el número exacto de parámetros.

Respecto al entrenamiento, la única información aportada es que el checkpoint fue entrenado sobre COCO (`detection-datasets/coco`), el conjunto de referencia para detección de objetos con 80 categorías. No se documentan el número de tokens o imágenes vistas, la composición del dataset, la resolución de entrenamiento, el uso de técnicas de ajuste como RLHF o DPO (no aplicables a detección) ni ninguna innovación técnica concreta. La conversión realizada por LibreYOLO consistió en seleccionar el estado EMA, añadir metadatos del esquema v1.0 y eliminar el estado de entrenamiento y del optimizador; los parámetros aprendidos y las claves del `state_dict` no se modificaron. El script de conversión es `weights/convert_gtr_weights.py` del repositorio de LibreYOLO. Las comprobaciones de paridad en CUDA, de precisión COCO independiente y de validación del entrenamiento RF1 se aplazan a la versión v1.6.0.

## Capacidades

- Detección de objetos en imágenes: devuelve cajas delimitadoras con clase y puntuación de confianza sobre las 80 categorías de COCO.
- Inferencia con resolución de entrada por defecto de 640 x 640 píxeles.
- Ejecución en CPU verificada como parte de la validación del artefacto (carga estricta del `state_dict` y predicción en CPU).
- API unificada de LibreYOLO: carga mediante `LibreYOLO("LibreGTRm.pt")` y predicción mediante `model.predict("image.jpg")`.
- Integración en flujos de trabajo de PyTorch estándar para visión por computador.
- No dispone de soporte de `tool calling` ni de `function calling`.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües: solo etiquetas de clase en inglés.
- No se documentan capacidades adicionales como segmentación, estimación de pose, `thinking mode`, visión aumentada, audio ni generación de texto.

## Casos de uso

- Autoetiquetado y preanotación de datasets: el modelo puede generar cajas candidatas sobre las 80 clases de COCO para que un equipo de anotación las revise, reduciendo el coste de crear conjuntos de datos propios siempre que las clases de interés coincidan con las de COCO.
- Integración en un pipeline de visión por computador ya basado en LibreYOLO: al compartir la API `LibreYOLO(...).predict(...)`, permite alternar entre familias de detectores (YOLO, GTR) cambiando solo el nombre del checkpoint, lo que simplifica las pruebas comparativas internas.
- Prototipado rápido en entornos sin GPU: el checkpoint (0,1 GB) se puede cargar en CPU y ejecutar inferencia, útil para demos locales, cuadernos de experimentación o validaciones funcionales antes de escalar a producción.
- Analítica de vídeo o imagen fija en comercio minorista: conteo de personas u objetos genéricos (persona, mochila, botella, etc.) en grabaciones, con la advertencia de que no hay métricas de precisión publicadas para este artefacto y sería necesario medir el rendimiento real antes de desplegarlo.
- Control de calidad industrial en prototipos: detección de elementos en líneas de montaje mediante clases genéricas o mediante ajuste fino posterior del checkpoint, aprovechando que la licencia MIT permite modificarlo y redistribuirlo.
- Investigación y docencia: servir como punto de partida para comparar una familia de detectores distinta de YOLO dentro del ecosistema LibreYOLO, o para estudiar el proceso de conversión de pesos entre esquemas de metadatos.
- Despliegue en dispositivos de borde con recursos limitados: el tamaño reducido del repositorio sugiere un consumo de memoria moderado, aunque la ausencia de datos de latencia publicados obliga a medir el rendimiento en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna cifra de precisión ni de latencia reproducida de forma independiente, y que la precisión COCO, la paridad en CUDA y las comprobaciones de latencia quedan pendientes para la versión v1.6.0 de LibreYOLO.

| Benchmark | Resultado | Notas |
|---|---|---|
| COCO mAP | no disponible | La model card declara que la validación de precisión COCO se aplaza a LibreYOLO v1.6.0 |
| Latencia / throughput | no disponible | No se aportan mediciones propias |
| Paridad CUDA frente a CPU | no disponible | Validación diferida a LibreYOLO v1.6.0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Dado que el repositorio completo ocupa 0,1 GB, los pesos en precisión de 32 bits ocupan del orden de esa magnitud, por lo que la inferencia a 640 x 640 debería requerir menos de 2 GB de VRAM con lote de tamaño 1, aunque se trata de una estimación derivada del tamaño del artefacto y no de una medición publicada.
- GPU recomendadas: no se especifica ninguna. Cualquier GPU con soporte CUDA debería poder ejecutar el modelo; no se documentan diferencias de rendimiento entre modelos de GPU.
- Compatibilidad con GPU de consumo: probablemente sí en tarjetas con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090), de nuevo en función del tamaño del checkpoint y no de una validación publicada.
- Ejecución en CPU: validada por el autor del artefacto durante las comprobaciones de carga estricta y predicción en CPU. No se aportan cifras de latencia en CPU.
- Opciones de despliegue: PyTorch junto con la librería `libreyolo` en una versión que incluya soporte GTR (versión v1.6.0 o posterior). No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoría | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|
| LibreGTRm | Detección de objetos, familia GTR convertida a LibreYOLO | MIT | PyTorch (`.pt`), esquema LibreYOLO v1.0 | Hugging Face, requiere `libreyolo` con soporte GTR |
| YOLOv8 / YOLO11 (Ultralytics) | Detección de objetos, familia YOLO | AGPL-3.0 (requiere licencia comercial para ciertos usos) | PyTorch (`.pt`), exportaciones a ONNX, TensorRT, OpenVINO | Amplia, con amplio ecosistema y documentación |
| DETR / DINO (Meta AI y colaboradores) | Detección de objetos basada en transformer | Apache-2.0 | PyTorch | Repositorios públicos con pesos preentrenados |
| RT-DETR | Detección en tiempo real basada en transformer | Apache-2.0 | PyTorch | Repositorios públicos con pesos preentrenados |

No se dispone de datos comparativos de precisión, número de parámetros ni latencia para LibreGTRm, por lo que la comparación se limita a licencia, formato y disponibilidad. La ventaja diferencial de LibreGTRm es su licencia MIT combinada con la integración en la API de LibreYOLO; su desventaja, la ausencia de métricas publicadas y la dependencia de una versión de librería aún no liberada en el momento de publicación del artefacto.

## Limitaciones y advertencias

- No se han publicado métricas de precisión COCO, latencia ni throughput verificadas de forma independiente para este artefacto concreto.
- La paridad numérica entre CPU y CUDA no está validada; la model card indica que estas comprobaciones se aplazan a LibreYOLO v1.6.0. No se debe asumir que el comportamiento en GPU sea idéntico al de CPU.
- La validación de entrenamiento RF1 tampoco se ha completado.
- El checkpoint requiere una versión de `libreyolo` que incluya la familia GTR. Las versiones publicadas en PyPI anteriores podrían no reconocer el modelo; la compatibilidad con la versión estable disponible no está garantizada.
- Al haberse eliminado el estado del optimizador y de entrenamiento, el checkpoint no permite reanudar un entrenamiento desde ese punto; solo sirve para inferencia o como inicialización de un ajuste fino nuevo.
- El modelo está entrenado exclusivamente sobre COCO, por lo que su vocabulario de clases está limitado a las 80 categorías de ese conjunto. No detectará clases fuera de ese conjunto sin un ajuste fino adicional.
- Solo realiza detección de objetos: no ofrece segmentación de instancias, estimación de pose, seguimiento de objetos ni descripción textual de la imagen.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier detector entrenado sobre COCO, especialmente en dominios distintos del de entrenamiento (imágenes médicas, aéreas, térmicas, etc.). No hay datos publicados que permitan cuantificar ese riesgo.
- Sesgos potenciales heredados del dataset COCO: desequilibrio en la representación de ciertas categorías, contextos geográficos y condiciones de iluminación. No se documenta ningún análisis de sesgo.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. Se debe revisar el archivo `NOTICE` del repositorio para conocer las atribuciones exigidas.
- La autoría intelectual de los pesos corresponde a Intellindust-AI-Lab; LibreYOLO solo realiza la conversión de formato. Cualquier problema de precisión es atribuible al checkpoint original.
- El modelo no genera texto, por lo que el riesgo de alucinación lingüística no aplica; el riesgo equivalente es la detección de objetos inexistentes con alta confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreGTRm
- Implementación oficial de GTR (Intellindust-AI-Lab), revisión `782e737efe2e6437ac537fbdcee089673d3376c1`: https://github.com/Intellindust-AI-Lab/GTR/tree/782e737efe2e6437ac537fbdcee089673d3376c1
- Checkpoint original `gtr_m_coco.pth`, revisión `9fc62c8c2b2c976835d0f1c1ffc544dbc0f9e29f`: https://huggingface.co/Phoenix8125/GTR/blob/9fc62c8c2b2c976835d0f1c1ffc544dbc0f9e29f/det/gtr_m_coco.pth
- Repositorio de LibreYOLO (incluye `weights/convert_gtr_weights.py`): https://github.com/LibreYOLO/libreyolo
- Dataset COCO en Hugging Face: https://huggingface.co/datasets/detection-datasets/coco

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
