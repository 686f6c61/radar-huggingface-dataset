# Divyanshu-Kumar19/aapdasetu-damage-assessment

## Resumen

El modelo `aapdasetu-damage-assessment` es un clasificador de daños en edificios post-desastre desarrollado por Divyanshu Kumar como parte del proyecto AapdaSetu, presentado en el Smart India Hackathon. Su función es analizar una fotografía de un edificio afectado por un desastre y clasificar la severidad del daño en tres categorías: `MINOR`, `MAJOR` y `DESTROYED`. El modelo está diseñado para integrarse en el pipeline de evaluación automática de compensaciones de la plataforma AapdaSetu, que opera bajo las normas NDRF/SDRF de la India.

Arquitectónicamente, se basa en un backbone ResNet50 preentrenado en ImageNet-1K V2, al que se le añade una cabeza totalmente conectada personalizada (`Dropout → Linear(2048, 3)`). El modelo fue entrenado en dos fases: primero con el backbone congelado y después con fine-tuning completo, sobre un dataset de 2.400 imágenes de edificios dañados. La evaluación se realizó con test-time augmentation (TTA) de 5 recortes sobre un conjunto de prueba de 244 imágenes, alcanzando una precisión global del 98,36%. El checkpoint se distribuye como un diccionario de PyTorch (`best.pt`, ~97 MB) y el repositorio incluye artefactos de evaluación como matriz de confusión, curvas ROC y un informe de fugas entre particiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (backbone ImageNet-1K V2) + cabeza FC (`Dropout → Linear(2048, 3)`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision por computadora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`best.pt`); se menciona ONNX en tags pero no se incluye archivo ONNX en el repositorio |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura ResNet50 estándar, con la capa fully connected original reemplazada por una secuencia `Dropout(p=0.0)` (inerte en inferencia) seguida de una capa lineal que proyecta las 2048 características a 3 salidas. El backbone se inicializa con pesos preentrenados en ImageNet-1K V2. El entrenamiento se realizó en dos fases: primero se congeló el backbone y solo se entrenó la nueva cabeza, y posteriormente se realizó fine-tuning de toda la red. El dataset de entrenamiento consta de 2.400 imágenes de edificios dañados, con distribución por clase: MINOR (846), MAJOR (525) y DESTROYED (1.029). Las particiones de entrenamiento, validación y prueba se dividieron en proporción 75/15/10 por clase, y se realizó una auditoría de fugas mediante hashes de imagen para garantizar que no hubiera solapamiento entre particiones (archivo `leak_check.json`). La evaluación final se realizó con test-time augmentation de 5 recortes sobre el conjunto de prueba.

## Capacidades

- Clasificacion de severidad de daños en edificios en tres categorias: `MINOR`, `MAJOR` y `DESTROYED`.
- Inferencia sobre imagenes RGB de 224×224 píxeles, con preprocesamiento estandarizado (resize a 256, center crop a 224, normalizacion con medias y desviaciones de ImageNet).
- Salida de probabilidades por clase mediante softmax, lo que permite umbrales personalizados para decisiones de triaje.
- Integracion sencilla en pipelines de PyTorch gracias al checkpoint en formato state dict con metadatos (`class_to_idx`, `classes`, `epoch`, `val_acc`, `val_loss`).
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es un modelo de vision puro.

## Casos de uso

- Triage de daños post-desastre: el modelo puede priorizar la respuesta de emergencia clasificando rapidamente fotografias de edificios afectados, permitiendo a los equipos de rescate atender primero las estructuras clasificadas como `DESTROYED`.
- Automatizacion de evaluacion de compensaciones: integrado en la plataforma AapdaSetu, asigna automaticamente un grado de daño que se traduce en una compensacion economica segun las normas NDRF/SDRF, reduciendo el tiempo de procesamiento de reclamaciones.
- Analisis de imagenes aereas o de drones: al ser un clasificador de imagenes, puede procesar capturas aereas de zonas afectadas para generar mapas de daños a gran escala, siempre que las imagenes contengan edificios individuales reconocibles.
- Apoyo a aseguradoras: las companias de seguros pueden usarlo como herramienta de preseleccion en reclamaciones por desastres naturales, agilizando la inspeccion manual de los casos mas complejos.
- Investigacion academica: sirve como punto de partida para estudios sobre clasificacion de daños estructurales, transferencia de aprendizaje o tecnicas de aumento de datos en dominios de desastre.
- Entrenamiento de modelos mas complejos: el checkpoint puede usarse como inicializacion para fine-tuning en tareas relacionadas, como deteccion de objetos o segmentacion de daños, aprovechando las caracteristicas aprendidas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, sobre el conjunto de prueba (244 imagenes) con test-time augmentation de 5 recortes:

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| DESTROYED | 0.990 | 0.981 | 0.986 | 104 |
| MAJOR | 0.982 | 1.000 | 0.991 | 54 |
| MINOR | 0.977 | 0.977 | 0.977 | 86 |
| **Accuracy global** | | | | **98.36%** |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser ResNet50 en fp32, una sola imagen requiere aproximadamente 1-2 GB de VRAM; con batch pequeno (por ejemplo, 8 imagenes) puede necesitarse entre 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o GPUs de datacenter como T4 o A10. Para despliegue en produccion con alto throughput, se recomienda una GPU con 8 GB o mas.
- Tambien es viable la inferencia en CPU para cargas bajas, aunque la latencia por imagen sera mayor (del orden de decenas de milisegundos a cientos, dependiendo del hardware).
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime (si se exporta el modelo a ONNX), o servicios de inferencia como Hugging Face Inference Endpoints. No es compatible con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificacion de daños en edificios) dentro de la documentacion proporcionada. Se recomienda consultar la literatura academica sobre evaluacion de daños post-desastre con redes neuronales convolucionales para establecer comparaciones.

## Limitaciones y advertencias

- El modelo no es un sustituto de la evaluacion de un ingeniero estructural certificado; sus predicciones deben considerarse como una herramienta de triaje preliminar.
- Fuera de alcance: imagenes que no correspondan a edificios afectados por desastres, o escenarios donde se requieran decisiones de seguridad critica sin revision humana.
- El dataset de entrenamiento es relativamente pequeno (2.400 imagenes) y puede presentar sesgos geograficos o de tipo de construccion, limitando la generalizacion a otras regiones o estilos arquitectonicos.
- La distribucion de clases esta desbalanceada (DESTROYED tiene casi el doble de muestras que MAJOR), lo que podria influir en el rendimiento en clases minoritarias.
- No se han documentado pruebas de robustez frente a condiciones adversas como oclusiones, condiciones de iluminacion extremas o imagenes de baja resolucion.
- La licencia MIT permite uso comercial, pero el modelo se desarrollo en el contexto de un hackathon y no se garantiza su idoneidad para produccion sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Divyanshu-Kumar19/aapdasetu-damage-assessment
- Dataset en Hugging Face: https://huggingface.co/datasets/Divyanshu-Kumar19/aapdasetu-damage-dataset
- Perfil de GitHub del autor: https://github.com/Divyanshu-Kumar19/
- Repositorio del proyecto AapdaSetu: https://github.com/AyushKumar-Singh/Aapda-Setu
- Articulo de arXiv sobre IA en gestion de desastres: https://arxiv.org/abs/2505.08202
