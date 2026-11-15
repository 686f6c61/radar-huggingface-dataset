# LibreYOLO/LibreDDRNetm-sem

## Resumen

LibreDDRNetm-sem es un modelo de segmentación semántica de imágenes basado en la arquitectura DDRNet-23, convertido y empaquetado para su uso con la librería LibreYOLO. Lo desarrolla el proyecto LibreYOLO a partir del checkpoint oficial de DDRNet publicado por el autor original (ydhongHIT/DDRNet, commit de0db317), que fue entrenado sobre el dataset Cityscapes con 19 clases. El modelo resuelve la tarea de segmentación semántica densa en escenas urbanas de conducción, asignando una etiqueta de clase a cada píxel de la imagen.

La relevancia de esta ficha reside en que se trata de un modelo de inferencia ligero (repo de 0,1 GB) orientado a la segmentación de carreteras y escenas urbanas, con una ventana de evaluación de 1024x2048 píxeles y un mIoU de validación de 79,5 reportado por el autor original. La conversión a LibreYOLO permite cargarlo con una API unificada (`LibreYOLO("LibreDDRNetm-sem.pt")`) y ejecutar inferencia con guardado de resultados en una sola llamada.

Es importante señalar que los pesos derivan de Cityscapes, cuyo licenciamiento restringe el uso del dataset y de sus derivados a fines no comerciales. Aunque el repositorio declara licencia MIT, esa declaración es una interpretación divulgada por LibreYOLO y no una licencia confirmada por el publicador original, por lo que el uso comercial debe revisarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDRNet-23 (red neuronal convolucional con ramas duales de resolución, según la denominación del checkpoint original) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; ventana de evaluación 1024x2048 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (según el repositorio), con restricción no comercial derivada de Cityscapes |
| Formato de pesos | checkpoint `.pt` para la librería `libreyolo` |
| Tarea | Segmentación semántica (19 clases de Cityscapes) |
| Dataset de entrenamiento | Cityscapes |
| Tamaño del repositorio | 0,1 GB |
| Pipeline (Hugging Face) | image-segmentation |

## Arquitectura y entrenamiento

El modelo se basa en DDRNet-23, una arquitectura convolucional de segmentación semántica en tiempo real que emplea dos ramas paralelas con resoluciones espaciales distintas y fusiones bilaterales para combinar contexto global y detalle fino. El checkpoint original incluye una cabeza auxiliar utilizada durante el entrenamiento, que se conserva en la conversión. Los pesos se obtuvieron del repositorio oficial ydhongHIT/DDRNet (commit de0db317c5af4b0946231f475cf74ca4f51b8ac2), concretamente del checkpoint de Cityscapes enlazado desde el README original (Google Drive, SHA-256 `66b68a4e61b2ab41fba5e967acd708ee3d9dd4771fb1e1a245a9a6b5bbd1db4e`), con un mIoU de validación de 79,5 reportado por el autor.

La conversión realizada por LibreYOLO es mínima: se elimina el prefijo `model.` del wrapper de entrenamiento y se descarta el buffer `loss.criterion.weight`. Los parámetros aprendidos no se modifican. El script `weights/parity_ddrnet.py` verifica la portabilidad contra el código oficial con `max_abs_diff == 0`, lo que garantiza equivalencia numérica exacta. Los tensores se envuelven con metadatos de checkpoint de LibreYOLO (`model_family=ddrnet`, `size=m`, `task=semantic`, `nc=19`, lienzo de evaluación 1024x2048). No se dispone de información sobre el número de tokens o composición detallada del dataset más allá de Cityscapes, ni sobre si hubo RLHF/DPO (no aplicable en un modelo de segmentación).

## Capacidades

- Segmentación semántica densa de escenas urbanas con 19 clases de Cityscapes (carretera, acera, edificio, vegetación, cielo, vehículos, personas, etc.).
- Inferencia sobre imágenes individuales con guardado de resultados mediante la API de LibreYOLO (`model("street.jpg", save=True)`).
- Evaluación en lienzo de 1024x2048 píxeles, adecuado para imágenes de alta resolución de conducción.
- Conserva la cabeza auxiliar de entrenamiento del checkpoint original.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingües (modelo puramente visual).
- No dispone de modo thinking, visión multimodal, audio ni generación de texto.

## Casos de uso

- Segmentación de escenas de conducción autónoma: el modelo etiqueta píxel a píxel carretera, acera, vehículos y peatones en imágenes de 1024x2048, lo que permite construir mapas de ocupación para planificación de trayectorias y percepción.
- Asistencia a la conducción (ADAS): integración en pipelines de percepción para detectar límites de carretera y superficies transitables en tiempo real, aprovechando la naturaleza ligera del checkpoint (0,1 GB).
- Análisis de vídeo urbano y tráfico: procesamiento por fotogramas para cuantificar áreas de calzada, aceras y vegetación en estudios de movilidad o auditorías de infraestructura.
- Preetiquetado para anotación: generar máscaras semánticas automáticas que aceleren el etiquetado manual de nuevos datasets de escenas urbanas, reduciendo coste de anotación.
- Investigación en segmentación semántica: servir como baseline reproducible (paridad numérica exacta con el original, `max_abs_diff == 0`) para comparar nuevas arquitecturas o técnicas de entrenamiento.
- Fine-tuning sobre datos propios: partir de este checkpoint para adaptar la segmentación a dominios específicos (por ejemplo, entornos industriales o agrícolas), teniendo en cuenta que el fine-tune hereda la restricción no comercial de Cityscapes.
- Despliegue en entornos con recursos limitados: al ser un modelo convolucional compacto, puede ejecutarse en GPUs de gama media o en dispositivos edge para segmentación en campo.

## Benchmarks y rendimiento

| Benchmark | Resultado | Fuente |
|---|---|---|
| Cityscapes val mIoU | 79,5 | Reportado por el autor original (ydhongHIT/DDRNet) |

No se han publicado en la información disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros), ni comparativas numéricas con modelos similares. Los benchmarks de lenguaje no aplican a un modelo de segmentación visual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio (0,1 GB) sugiere un modelo compacto que probablemente cabe en GPUs de consumo, pero no se confirma en la información.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado en la información proporcionada; por el tamaño del checkpoint es plausible, pero no se dispone de datos verificados.
- Opciones de despliegue: librería `libreyolo` (instalación vía `pip install libreyolo`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión convolucional).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | mIoU Cityscapes | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LibreDDRNetm-sem | DDRNet-23 | no disponible | 1024x2048 px | 79,5 (val, reportado upstream) | MIT con restricción no comercial (Cityscapes) | Hugging Face (LibreYOLO) |
| DDRNet-23 original (ydhongHIT) | DDRNet-23 | no disponible | 1024x2048 px | 79,5 (val) | MIT (repo) con términos Cityscapes | GitHub + Google Drive |
| Alternativas de segmentación semántica en tiempo real | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificados sobre otros modelos comparables (por ejemplo, variantes de DDRNet de otros tamaños o arquitecturas de segmentación en tiempo real) que permitan una comparativa numérica fiable. La comparativa con el checkpoint original es la única sustentada por datos: los pesos son numéricamente idénticos (`max_abs_diff == 0`) y comparten el mismo mIoU de 79,5.

## Limitaciones y advertencias

- Restricción no comercial: los pesos derivan de Cityscapes, cuya licencia limita el dataset y sus derivados a uso no comercial. Un fine-tune iniciado desde este checkpoint hereda esa restricción.
- Licencia ambigua: el repositorio declara MIT sobre una base implícita; LibreYOLO reconoce que es su interpretación divulgada y no una licencia confirmada por el publicador original. Verificar LICENSE y NOTICE antes de uso comercial.
- Dominio limitado: entrenado exclusivamente en escenas urbanas de conducción (19 clases de Cityscapes); el rendimiento fuera de ese dominio (interiores, entornos industriales, imágenes aéreas) no está garantizado.
- Sin información sobre sesgos: no se documentan sesgos conocidos ni análisis de robustez en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de segmentación errónea en píxeles ambiguos u oclusiones, sin métricas de calibración publicadas.
- Sin soporte de lenguaje: no procesa texto ni instrucciones; es un modelo puramente visual.
- Idiomas: no disponible (no aplica).
- Cabeza auxiliar incluida: el checkpoint conserva la cabeza auxiliar de entrenamiento, lo que puede requerir gestión explícita en algunos pipelines de despliegue.
- Datos de hardware y latencia no disponibles: dificulta la planificación de producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreDDRNetm-sem
- Repositorio fuente de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Repositorio original DDRNet: https://github.com/ydhongHIT/DDRNet
- Checkpoint original (Google Drive): https://drive.google.com/file/d/16viDZhbmuc3y7OSsUo2vhA7V6kYO0KX6
- Dataset Cityscapes: https://www.cityscapes-dataset.com/
- Licencia de Cityscapes: https://www.cityscapes-dataset.com/license/
