# LibreYOLO/LibreGTRl

## Resumen

LibreGTRl es un checkpoint de detección de objetos publicado por LibreYOLO en Hugging Face. Se trata de una conversión de los pesos GTR-L entrenados sobre COCO (`gtr_l_coco.pth`) al formato y al esquema de metadatos v1.0 de LibreYOLO, la librería de visión por computador con licencia MIT que se posiciona como alternativa a Ultralytics. El artefacto se distribuye como un fichero `.pt` de PyTorch y se carga mediante la API de LibreYOLO con una resolución de entrada por defecto de 640 x 640 píxeles.

El origen de los pesos es la implementación oficial de GTR mantenida por Intellindust-AI-Lab, cuyo repositorio de pesos declara licencia MIT. La conversión, realizada con el script `weights/convert_gtr_weights.py` del repositorio de LibreYOLO, selecciona el state dict de EMA, conserva intactos los tensores aprendidos y las claves del state dict y elimina el estado de entrenamiento y del optimizador.

Su relevancia es práctica: añade una familia de detectores al ecosistema LibreYOLO bajo licencia permisiva, sin las restricciones AGPL de Ultralytics. El soporte de GTR está previsto para LibreYOLO v1.6.0, por lo que las versiones anteriores publicadas en PyPI pueden no incluirlo. El autor no publica cifras de precisión ni de latencia, y la validación en CUDA y la exactitud independiente sobre COCO quedan aplazadas a la versión v1.6.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Pesos GTR-L de Intellindust-AI-Lab convertidos al formato LibreYOLO; no se detalla el tipo de backbone ni de cabeza de detección |
| Parametros totales | No disponible |
| Longitud de contexto | No aplica (modelo de detección de objetos; entrada de imagen de 640 x 640 píxeles) |
| Tipos de cuantizacion | No disponible. El artefacto publicado es un checkpoint PyTorch en fp32; LibreYOLO ofrece extras de exportación (por ejemplo, ONNX) |
| Idiomas soportados | No aplica. La salida son cajas y etiquetas correspondientes a las clases del dataset COCO |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), state dict con metadatos de esquema LibreYOLO v1.0 |
| Tarea (pipeline) | Detección de objetos (`object-detection`) |
| Dataset de entrenamiento | `detection-datasets/coco` |
| Resolucion de entrada por defecto | 640 x 640 |
| Variante | GTR-L (sufijo `l` en el nombre del modelo) |
| Tamano del repositorio | 0,1 GB |
| Libreria | `libreyolo` (soporte de GTR previsto para la versión v1.6.0) |
| Descargas y likes | 0 y 0 en el momento de la consulta |

## Arquitectura y entrenamiento

Este artefacto no es un modelo entrenado por el editor, sino una conversión de pesos. La información disponible no describe la arquitectura interna de GTR-L: no se detalla el backbone, el mecanismo de atención, la cabeza de detección ni el número de tokens o consultas. Únicamente se indica que los pesos originales corresponden a la variante GTR-L entrenada sobre COCO y que la conversión preserva exactamente los tensores aprendidos y las claves del state dict, aplicando como única modificación la selección del estado de EMA y la eliminación del estado de entrenamiento y del optimizador.

Tampoco se publican el número de tokens de entrenamiento, la composición exacta del dataset más allá de COCO, ni si hubo etapas de alineación (RLHF, DPO u otras). La fuente de referencia es la implementación oficial de GTR en el repositorio de Intellindust-AI-Lab, en la revisión `782e737efe2e6437ac537fbdcee089673d3376c1`, y el checkpoint publicado en el repositorio de pesos de Phoenix8125. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras) en la ficha del modelo.

## Capacidades

- Detección de objetos: produce cajas delimitadoras con etiqueta de clase sobre las categorías del dataset COCO.
- Inferencia a resolución fija de 640 x 640 píxeles (valor por defecto documentado).
- Carga estricta del checkpoint y predicción en CPU verificadas por el autor para este artefacto.
- Integración directa con la API de LibreYOLO mediante `LibreYOLO("LibreGTRl.pt")` y el método `predict`.
- Encaje en los flujos de LibreYOLO para entrenamiento, predicción y exportación, aunque el soporte de esta familia llega con la versión v1.6.0.
- No se documenta soporte de segmentación, keypoints, clasificación de imagen, captioning, OCR, tool calling, uso agéntico, razonamiento multi-paso, modo de pensamiento, audio ni entrada de texto. Al ser un detector de objetos, estas capacidades no aplican.

## Casos de uso

- Preetiquetado de datasets de detección: el modelo genera cajas y clases iniciales sobre imágenes nuevas para que un equipo humano las revise y corrija, lo que reduce el coste de anotación antes de un ajuste fino posterior.
- Moderación y filtrado de imágenes en pipelines de subida: detección de personas u objetos sensibles para enrutar contenido a revisión o aplicar recortes automáticos antes de publicarlo.
- Analítica de retail sobre cámara fija: conteo y localización de personas y de objetos presentes en las clases de COCO en imágenes o fotogramas a 640 x 640, útil para aforo y patrones de ocupación.
- Percepción ligera en robótica o drones: el checkpoint es pequeño y cabe en GPU de consumo, por lo que sirve como módulo de detección en plataformas con presupuesto de cómputo y energía limitados.
- Control de aforo y seguridad en espacios públicos: detección de personas en cada fotograma para estimar ocupación y generar alertas por umbral.
- Etiquetado previo para ajuste fino en dominio específico: se parte de los pesos COCO y se reentrena con datos propios (industria, agricultura, logística) usando las utilidades de entrenamiento de LibreYOLO.
- Pruebas de regresión visual en CI/CD: comparar las detecciones de un pipeline de visión sobre un conjunto de imágenes de referencia para detectar degradaciones tras cambios de código o de versiones de la librería.
- Prototipado rápido de demos: disponer de un detector con licencia MIT permite publicar demos y productos internos sin atarse a licencias copyleft fuertes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia ficha del modelo indica explícitamente que no se reclama ninguna cifra de exactitud ni de latencia reproducida de forma independiente, y que la paridad con CUDA, la exactitud independiente sobre COCO y la validación del entrenamiento con RF1 quedan diferidas a las comprobaciones de la versión v1.6.0 de LibreYOLO.

## Requisitos de hardware

- VRAM estimada: no hay cifras publicadas. A partir del tamaño del repositorio (0,1 GB, mayoritariamente el checkpoint en fp32), el orden de magnitud esperable es de aproximadamente 1 a 2 GB de VRAM para inferencia por lotes de tamaño 1 a 640 x 640, y por debajo de 1 GB usando fp16. Es una estimación derivada del tamaño del artefacto, no un dato confirmado por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de memoria (por ejemplo, GTX 1650, RTX 3050, RTX 3060, T4) debería ser suficiente para inferencia; GPU de gama alta (RTX 4090, A100, H100) solo aportan ventaja en procesamiento por lotes o en entrenamiento.
- GPU de consumo: sí, es previsible que quepa en cualquier GPU de consumo actual con 4 GB o más de VRAM, dado el tamaño reducido del checkpoint.
- CPU: el autor verificó la predicción en CPU para este artefacto, de modo que la inferencia sin GPU es viable, con la latencia esperable en ese entorno.
- Opciones de despliegue: API de Python de LibreYOLO (`libreyolo`), con extras de exportación para formatos como ONNX. Los runners orientados a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no aplican a un detector de objetos.
- Latencia y throughput: no disponible. No se han publicado mediciones propias ni de terceros.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia de pesos | Disponibilidad en LibreYOLO |
|---|---|---|---|---|
| LibreGTRl | No disponible | 640 x 640 | MIT | Prevista para v1.6.0 (familia GTR) |
| YOLOv9 | No disponible por variante | Configurable, habitual 640 x 640 | GPL-3.0 en el repositorio original (verificar) | Incluido en la instalación base |
| RF-DETR | No disponible | No disponible | Consultar la licencia del proyecto original (Roboflow) | Extra opcional |
| Ultralytics YOLO11 | No disponible por variante | Configurable, habitual 640 x 640 | AGPL-3.0 o licencia comercial | No forma parte de LibreYOLO |

La información proporcionada no incluye cifras de precisión ni de latencia para ninguno de estos modelos, por lo que la comparación cuantitativa de rendimiento no está disponible. La diferencia principal documentada es de licencia: LibreGTRl se distribuye bajo MIT, mientras que Ultralytics YOLO11 usa AGPL-3.0 y YOLOv9 se publica bajo GPL-3.0 en su repositorio original. Conviene verificar las condiciones de cada proyecto antes de un uso comercial.

## Limitaciones y advertencias

- No hay cifras de precisión ni de latencia publicadas ni reproducidas por terceros para este checkpoint.
- La paridad con CUDA y la validación de exactitud sobre COCO están explícitamente diferidas a los chequeos de LibreYOLO v1.6.0; solo la carga estricta, la preservación exacta de tensores y la predicción en CPU se han comprobado para este artefacto.
- Requiere una versión de LibreYOLO que incluya la familia GTR; las versiones anteriores publicadas en PyPI pueden no cargar el modelo.
- El modelo cubre únicamente las clases del dataset COCO y la tarea de detección de cajas; no ofrece segmentación, keypoints ni clasificación de imagen completa.
- Al estar entrenado sobre COCO, hereda los sesgos de ese dataset: infrarrepresentación de determinadas regiones geográficas y contextos culturales, fuerte peso de la clase persona y desequilibrio entre categorías.
- Riesgo de errores propios de un detector: falsos positivos, falsos negativos, cajas mal ajustadas, fallos con oclusiones, objetos pequeños, imágenes de baja resolución o dominios alejados de COCO. Para uso en producción en un dominio concreto es recomendable un ajuste fino y una evaluación propia.
- El rendimiento en dominios especializados (industria, medicina, teledetección) no está documentado y no debería asumirse.
- Licencia MIT declarada tanto en el código fuente como en el repositorio de pesos del publicador original; conviene revisar los ficheros LICENSE y NOTICE del repositorio y confirmar la cadena de licencias de los pesos de origen antes de un despliegue comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- El artefacto es una conversión de pesos, no un modelo entrenado por el editor; cualquier cambio en el repositorio de origen o en el script de conversión puede afectar a la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreGTRl
- Repositorio de LibreYOLO en GitHub: https://github.com/LibreYOLO/libreyolo
- Script de conversión de pesos: https://github.com/LibreYOLO/libreyolo (ruta `weights/convert_gtr_weights.py`)
- Sitio web de LibreYOLO: https://www.libreyolo.com/
- Model zoo de LibreYOLO: https://www.libreyolo.com/models
- Perfil de la organización en Hugging Face: https://huggingface.co/Libre-YOLO/models
- Implementación oficial de GTR (Intellindust-AI-Lab), revisión `782e737efe2e6437ac537fbdcee089673d3376c1`: https://github.com/Intellindust-AI-Lab/GTR/tree/782e737efe2e6437ac537fbdcee089673d3376c1
- Checkpoint publicado de origen (GTR-L COCO), revisión `9fc62c8c2b2c976835d0f1c1ffc544dbc0f9e29f`: https://huggingface.co/Phoenix8125/GTR/blob/9fc62c8c2b2c976835d0f1c1ffc544dbc0f9e29f/det/gtr_l_coco.pth
