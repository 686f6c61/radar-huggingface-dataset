# Has1tas/yolo26m-landing-zones

## Resumen

YOLO26m-landing-zones es un detector de objetos basado en la arquitectura YOLO26 en su variante "m" (medium), publicado por el usuario Has1tas en Hugging Face. El modelo está entrenado para localizar y clasificar zonas marcadas de aterrizaje para vehículos aéreos urbanos (flying cars) y ambulancias aéreas en imágenes aéreas, distinguiendo además entre zonas aptas y no aptas para el aterrizaje. Es un modelo específico para el dominio de la competición TEKNOFEST, no un detector genérico.

El modelo resuelve un problema acotado: la detección de cuatro clases de marcas de aterrizaje (UAI, UAP y sus variantes "unsuitable") en imágenes capturadas desde el aire. Se distribuye como un checkpoint de Ultralytics en formato `.pt`, con licencia AGPL-3.0, y se usa directamente mediante la librería `ultralytics` sin necesidad de código adicional. Su relevancia es limitada fuera del contexto de competición, dado que el dataset de entrenamiento es privado y no se ha publicado.

La información disponible sobre el modelo es escasa: no se detallan parámetros totales, longitud de contexto (no aplica, es un detector), idiomas ni composición del dataset. Los únicos datos cuantitativos provienen de las métricas de validación almacenadas en el checkpoint, que corresponden al split propio del proyecto y no a un benchmark independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26m (archivo `yolo26m.yaml`), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint `.pt`; no se publican versiones GGUF, ONNX ni TensorRT) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas están en inglés y turco original) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, checkpoint de Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26 en configuración "m" (medium), según el archivo de definición `yolo26m.yaml` embebido en el checkpoint. Se trata de un detector de objetos de una etapa, típico de la familia YOLO, orientado a detección en tiempo real. No se dispone de información sobre el número de parámetros, la composición exacta de la cabeza de detección ni innovaciones técnicas específicas de esta variante.

El entrenamiento se realizó con la librería Ultralytics 8.4.39, con un tamaño de imagen de 640×640, batch size de 8 y 100 épocas solicitadas (el epoch guardado es -1, lo que indica que el estado del optimizador fue eliminado y no se conserva el historial completo). El dataset es privado y específico de la competición TEKNOFEST; su tamaño y composición no se documentan. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector de objetos. El checkpoint fue saneado eliminando el estado del optimizador y rutas personales, conservando fecha, versión, métricas e hiperparámetros.

## Capacidades

- Detección de objetos en imágenes aéreas con cuatro clases: UAI (zona de aterrizaje de ambulancia aérea), UAP (zona de aparcamiento de coche volador), UAI_unsuitable y UAP_unsuitable (zonas presentes pero no aptas, por ejemplo ocupadas).
- Salida de cajas delimitadoras, IDs de clase y puntuaciones de confianza a través de `results[0].boxes`.
- Inferencia en CPU sin necesidad de GPU NVIDIA, según la model card.
- Integración directa con la API de Ultralytics (`YOLO(path).predict(...)`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un detector visual.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá de la detección sobre imagen.

## Casos de uso

- **Inspección de zonas de aterrizaje en competiciones TEKNOFEST**: el modelo se usaría para procesar fotogramas aéreos y localizar las marcas UAI/UAP, permitiendo a un equipo de competición evaluar la presencia y estado de las zonas. Es adecuado porque las clases y el dominio coinciden exactamente con los de la competición.
- **Preprocesado en pipelines de visión aérea**: integrado en un pipeline que reciba imágenes de dron y necesite filtrar fotogramas con posibles zonas de aterrizaje antes de un análisis más profundo. La inferencia en CPU facilita el despliegue en entornos sin GPU.
- **Prototipado rápido con Ultralytics**: al cargarse con `hf_hub_download` y `YOLO(path)`, sirve para validar la viabilidad de un detector de zonas de aterrizaje en un proyecto de investigación antes de entrenar un modelo propio con datos locales.
- **Análisis de ocupación de zonas marcadas**: la distinción entre clases base y `*_unsuitable` permite, en principio, identificar zonas presentes pero no aptas (por ejemplo, ocupadas), útil en tareas de monitorización de áreas de aterrizaje en escenarios simulados.
- **Generación de anotaciones preliminares**: las detecciones con confianza alta podrían usarse como pre-etiquetado para acelerar el etiquetado manual de nuevas imágenes aéreas del mismo dominio, revisando después los resultados.
- **Evaluación comparativa de detectores aéreos**: junto con los otros checkpoints del mismo autor (`yolo26s-aerial-uav`, `yolo12s-aerial-vehicle-person`), permite comparar variantes de tamaño y arquitectura sobre el mismo tipo de imagery, siempre que se disponga de un conjunto de validación propio.

## Benchmarks y rendimiento

Métricas de validación almacenadas en el checkpoint (split propio del proyecto, no benchmark independiente):

| Metrica | Valor |
|---|---|
| Precision (B) | 0.79326 |
| Recall (B) | 0.66667 |
| mAP50 (B) | 0.8575 |
| mAP50-95 (B) | 0.48539 |
| val/box_loss | 1.21449 |
| val/cls_loss | 3.90734 |
| val/dfl_loss | 0.00741 |
| fitness | 0.48539 |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible; además, al ser un detector de objetos, esos benchmarks no aplicarían. No se dispone de métricas por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un YOLO de tamaño "m" a 640×640, el consumo típico en FP32 es de unos pocos GB, aunque el dato no está confirmado en la información proporcionada.
- GPU recomendadas: no especificadas. La model card indica que la inferencia en CPU funciona sin GPU NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada; al ser un modelo de detección de tamaño medio, es probable que quepa en GPUs de consumo, pero no se aporta dato verificado.
- Opciones de despliegue: Ultralytics (Python), con soporte de inferencia en CPU o GPU vía `device`. No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Contexto / entrada | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Has1tas/yolo26m-landing-zones | YOLO26m | 4 (UAI, UAP y variantes unsuitable) | 640×640 | mAP50 0.8575, mAP50-95 0.48539 (split propio) | AGPL-3.0 | Hugging Face |
| Has1tas/yolo26s-aerial-uav | YOLO26s | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Has1tas/yolo12s-aerial-vehicle-person | YOLO12s | vehículo y persona (aéreo) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar con detectores aéreos de referencia de otros autores; la comparativa se limita a los checkpoints del mismo autor, de los que solo se conocen nombres y dominio de aplicación.

## Limitaciones y advertencias

- Entrenado sobre un dataset privado y pequeño no publicado; su tamaño y composición exacta no se pueden verificar a partir de los metadatos del checkpoint.
- Las imágenes y etiquetas son específicas de la competición TEKNOFEST; es probable que no generalice a nuevas cámaras, altitudes, localizaciones o condiciones de iluminación.
- Objetos pequeños, oclusiones y escenas no familiares pueden provocar detecciones perdidas o etiquetas incorrectas.
- Las métricas agregadas no permiten establecer el rendimiento por clase; no se almacenan métricas por clase en el checkpoint.
- En las tres imágenes de prueba disponibles, el modelo no detectó ningún objeto con confianza 0.25; no se incluye ningún ejemplo anotado.
- No es un sistema certificado de control de vuelo, respuesta a emergencias ni seguridad de aterrizaje; la detección de UAI/UAP no implica que un aterrizaje real sea seguro.
- Licencia AGPL-3.0: el uso comercial exige cumplir con las obligaciones de copyleft de la AGPL, lo que puede ser restrictivo para productos propietarios.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en un dominio acotado, cabe esperar un sesgo hacia las condiciones visuales del dataset de entrenamiento.
- Riesgo de alucinación en el sentido de falsos positivos o etiquetas incorrectas en escenas fuera de distribución; debe validarse con imágenes propias etiquetadas antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Has1tas/yolo26m-landing-zones
- Pesos del modelo: https://huggingface.co/Has1tas/yolo26m-landing-zones/blob/main/yolo26m-landing-zones.pt
- Proyecto complementario en GitHub: https://github.com/hasbitas/aerial-detection-pipeline
- Modelo relacionado yolo26s-aerial-uav: https://huggingface.co/Has1tas/yolo26s-aerial-uav
- Modelo relacionado yolo12s-aerial-vehicle-person: https://huggingface.co/Has1tas/yolo12s-aerial-vehicle-person
