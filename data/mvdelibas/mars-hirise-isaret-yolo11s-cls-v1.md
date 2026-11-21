# mvdelibas/mars-hirise-isaret-yolo11s-cls-v1

## Resumen

Mars HiRISE landmark classifier es un modelo de clasificación de imágenes basado en la arquitectura YOLO11s-cls, publicado por el usuario mvdelibas en Hugging Face. Su tarea es clasificar recortes de 227 x 227 píxeles procedentes de imágenes orbitales de Marte captadas por el instrumento HiRISE (High Resolution Imaging Science Experiment) en una de ocho clases de accidentes geográficos o "landmarks". Resuelve un problema acotado de visión por computador aplicada a teledetección planetaria: etiquetar automáticamente recortes de la superficie marciana para tareas de catalogación y filtrado previo.

El modelo se entrenó sobre un subconjunto del dataset público "Mars orbital image (HiRISE) labeled data set v3.2" de Doran, Dunkel, Lu y Wagstaff (Zenodo, CC BY 4.0), con 10.815 recortes originales no aumentados y una división por imagen de origen (browse image) para evitar fuga de datos. La arquitectura es YOLO11s-cls de Ultralytics, un clasificador convolucional ligero, entrenado durante 30 épocas a 224 píxeles y batch 64.

Es relevante ahora por su nicho: no compite con modelos de lenguaje generalistas, sino que ofrece un punto de partida reproducible para pipelines de clasificación de imágenes planetarias. Su utilidad práctica está limitada por el fuerte desbalance de clases (la clase `other` concentra cerca del 81 % de las imágenes), lo que infla la métrica top-1 y hace que precisión, recall y F1 sean más informativas. El autor advierte explícitamente de que no debe usarse para interpretación científica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s-cls (clasificador convolucional, familia Ultralytics YOLO11) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | cc-by-4.0 (pesos y datos); la arquitectura y el codigo de Ultralytics son AGPL-3.0 |
| Formato de pesos | PyTorch (.pt, archivo `mars-hirise.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11s-cls de Ultralytics, una red convolucional diseñada para clasificación de imágenes de baja latencia, con entrada de 224 píxeles. No es un transformer ni un modelo multimodal: es un clasificador de imagen a etiqueta única entre ocho clases. Los pesos se distribuyen en formato `.pt` de PyTorch y se cargan mediante la librería `ultralytics`.

El entrenamiento se realizó sobre el dataset `mvdelibas/mars-hirise-isaret-v1`, compuesto por 10.815 recortes originales no aumentados de 227 x 227 píxeles, divididos por imagen de origen (browse image) para evitar contaminación entre train y validación. Se entrenó durante 30 épocas a 224 píxeles con batch 64. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de aumento de datos. El autor indica que la validación se hizo sobre 1.101 imágenes en una única ejecución y que no se volvió a medir sobre el split de test.

## Capacidades

- Clasificación de imágenes de imagen única en una de ocho clases de accidentes geográficos marcianos a partir de recortes HiRISE de 227 x 227 píxeles.
- Salida de etiqueta predicha y confianza (top-1) mediante la API de Ultralytics (`result.probs.top1`, `result.probs.top1conf`).
- Integración directa con el ecosistema Ultralytics (carga desde Hugging Face Hub con `hf_hub_download`).
- Inferencia ligera apta para CPU y GPU de consumo, dado el tamaño reducido del clasificador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá de la clasificación de recortes HiRISE.
- No dispone de modo "thinking", visión general, audio ni otras capacidades especiales.

## Casos de uso

- Catalogación y filtrado previo de recortes HiRISE: el modelo puede clasificar lotes de recortes de 227 x 227 píxeles para separar imágenes con landmarks de interés de la clase dominante `other`, reduciendo el volumen que un revisor humano debe inspeccionar.
- Etiquetado asistido en proyectos de ciencia ciudadana: sirve como preetiquetador para que voluntarios confirmen o corrijan la clase asignada, acelerando la anotación de nuevos recortes.
- Detección de regiones polares australes: dado que las clases "spider" y "swiss cheese" solo aparecen cerca del polo sur, el modelo puede usarse como filtro preliminar para localizar candidatos en esa zona, siempre con revisión humana.
- Pipeline de investigación reproducible: al cargarse con Ultralytics y pesos `.pt`, se integra en scripts de Python para experimentos de clasificación planetaria y comparación de arquitecturas ligeras.
- Docencia y divulgación: ejemplo práctico de clasificación de imágenes con YOLO11s-cls sobre datos científicos abiertos, útil en talleres de visión por computador aplicada.
- Prototipado de sistemas de alerta o triaje: en un flujo de exploración orbital, puede priorizar recortes que caigan en clases distintas de `other` para su análisis posterior por modelos o expertos.
- Benchmark interno de clasificadores ligeros: sirve como línea base para comparar variantes de YOLO11-cls u otras redes convolucionales sobre el mismo dataset HiRISE.

## Benchmarks y rendimiento

Resultados reportados por la plataforma sobre el split de validación de 1.101 imágenes, en una única ejecución (mejor época: 29):

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 0,933 |
| Top-5 accuracy | 0,999 |
| Precision | 0,742 |
| Recall | 0,636 |
| F1 | 0,636 |

El autor advierte de que el top-1 está inflado por la clase dominante `other` (aproximadamente el 81 % de las imágenes) y que precisión, recall y F1 son más informativos. No se han publicado resultados sobre el split de test ni comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de un clasificador YOLO11s-cls, es previsible que quepa en GPUs de consumo con pocos GB, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí (clasificador ligero), aunque no se detalla en la model card.
- Opciones de despliegue: librería `ultralytics` (PyTorch); no se documentan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con otras arquitecturas de clasificación sobre el mismo dataset HiRISE ni con variantes de YOLO11-cls de distinto tamaño.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mars HiRISE landmark classifier (YOLO11s-cls) | no disponible | no aplica | Top-1 0,933; F1 0,636 (val) | cc-by-4.0 (pesos); AGPL-3.0 (arquitectura) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Fuerte desbalance de clases: la clase `other` representa cerca del 81 % de las imágenes, lo que infla el top-1 y reduce la fiabilidad de las métricas agregadas.
- Clases raras con muy pocos ejemplos de validación, lo que hace que las métricas por clase sean poco representativas.
- Las clases "spider" y "swiss cheese" solo aparecen cerca del polo sur, lo que limita la generalización geográfica del modelo.
- El autor indica explícitamente que el modelo no es apto para interpretación científica.
- No se ha reevaluado sobre el split de test; los resultados provienen de una única ejecución de validación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y confusiones entre clases por el desbalance.
- Restricciones de licencia: los pesos siguen CC BY 4.0 (atribución obligatoria), pero la arquitectura y el código de Ultralytics son AGPL-3.0, lo que puede condicionar el uso comercial y la distribución de derivados; conviene revisar esa licencia para el caso de uso concreto.
- El dataset de origen es CC BY 4.0 y los autores del dataset no avalan este modelo.
- Idioma: la documentación y las etiquetas están en inglés.
- Tamaño de entrada fijo de 224 píxeles en inferencia (recortes originales de 227 x 227), lo que limita su uso con imágenes de otra resolución sin preprocesado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/mars-hirise-isaret-yolo11s-cls-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/mvdelibas/mars-hirise-isaret-v1
- Dataset original (Doran, Dunkel, Lu, Wagstaff, v3.2): https://doi.org/10.5281/zenodo.4002935
- Ultralytics (arquitectura y código, AGPL-3.0): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com/
