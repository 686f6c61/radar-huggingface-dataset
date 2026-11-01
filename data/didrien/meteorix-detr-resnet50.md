# Didrien/meteorix-detr-resnet50

## Resumen

Meteorix DETR-ResNet-50 es un modelo de deteccion de objetos especializado en la identificacion de meteoros en imagenes nocturnas del cielo, desarrollado por el usuario Didrien en el contexto del estudio Meteorix. Se trata de un fine-tuning completo de `facebook/detr-resnet-50`, el detector de objetos basado en transformer de Facebook AI Research, adaptado para una unica clase (`meteor`). El modelo resuelve un problema muy concreto: la deteccion automatica de trazas de meteoros en imagenes capturadas por camaras terrestres, una tarea relevante para astronomia amateur, redes de observacion ciudadana y analisis automatizado de grandes volumenes de imagenes nocturnas.

La arquitectura es DETR (Detection Transformer) con backbone ResNet-50, con 41,6 millones de parametros totales y un tamano de repositorio de 0,2 GB en formato safetensors. El modelo fue entrenado exclusivamente con imagenes cuadradas de 800x800 pixeles y esta pensado para inferencia sobre imagenes de cielo nocturno, no para deteccion de objetos generica. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El modelo es relevante ahora porque forma parte de un estudio comparativo con YOLO26n y RF-DETR Small, y porque demuestra que un fine-tuning relativamente ligero de DETR puede alcanzar un F1 de 0,974 en el split de test del dataset original, aunque con una caida notable de rendimiento en un benchmark externo (F1 de 0,830 en NEO-Bench UAEMMN), lo que ilustra el riesgo de sobreajuste al dominio de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (Detection Transformer) con backbone ResNet-50 |
| Parametros totales | 41.607.878 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DETR original: un backbone convolucional ResNet-50 que extrae caracteristicas de la imagen, seguido de un encoder-decoder transformer que predice un conjunto fijo de detecciones mediante matching bipartito durante el entrenamiento. Se realizo un fine-tuning completo de todas las capas (no solo del cabezal), con 300 epocas, optimizador AdamW (learning rate 1e-4 para el cabezal y 1e-5 para el backbone, weight decay 1e-4), decaimiento del learning rate por un factor de 10 tras la epoca 200, tamano de batch efectivo de 64, gradient clipping de 0,1, y aumentacion de datos consistente en flip horizontal y redimensionado multi-escala (lado corto entre 480 y 800 px). Se emplearon las perdidas auxiliares del decoder propias de DETR.

Los datos de entrenamiento provienen del dataset de imagenes de meteoros de Mendeley (Gradvohl & Shirasuna, DOI 10.17632/4k98n84d9g.1, licencia CC BY 4.0), con 3.849 imagenes de entrenamiento, 550 de validacion y 1.100 de test, todas ellas de 800x800 pixeles. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de vision. La innovacion principal no esta en la arquitectura (que es DETR estandar) sino en la especializacion del dominio y en la restriccion explicita a imagenes cuadradas de 800x800, que el autor advierte que provoca desplazamiento de las cajas predichas si se alimentan imagenes no cuadradas a su relacion de aspecto nativa.

## Capacidades

- Deteccion de objetos de una unica clase (`meteor`) en imagenes de cielo nocturno.
- Salida de cajas delimitadoras con puntuaciones de confianza por deteccion.
- Post-procesado estandar de DETR via `DetrImageProcessor.post_process_object_detection`.
- Compatible con la libreria `transformers` y con `endpoints_compatible` (desplegable en Hugging Face Inference Endpoints).
- Inferencia rapida: 21,6 ms por imagen de media en una RTX 4090.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual de deteccion.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion.

## Casos de uso

- **Analisis automatizado de redes de camaras de cielo**: el modelo puede procesar lotes de imagenes nocturnas capturadas por estaciones de observacion y filtrar automaticamente aquellas que contienen meteoros, reduciendo el trabajo manual de revision. Su latencia de 21,6 ms por imagen en RTX 4090 permite procesar miles de imagenes por hora.
- **Triaje en pipelines de astronomia ciudadana**: en proyectos con voluntarios que suben imagenes nocturnas, el modelo puede clasificar y priorizar las imagenes con detecciones positivas antes de la revision humana, usando el umbral de confianza de 0,5 documentado por el autor.
- **Validacion cruzada de catalogos de meteoros**: integrado en un pipeline que compare detecciones del modelo con registros de camaras de video, puede servir para verificar eventos reportados y descartar falsos positivos.
- **Investigacion academica sobre deteccion de meteoros**: al ser un fine-tuning de DETR con resultados publicados en dos benchmarks (Mendeley y NEO-Bench UAEMMN), sirve como linea base reproducible para comparar con YOLO26n, RF-DETR Small u otros detectores en estudios de vision astronomica.
- **Despliegue en endpoints gestionados**: gracias a la compatibilidad con `endpoints_compatible`, puede subirse a Hugging Face Inference Endpoints para ofrecer un servicio HTTP de deteccion de meteoros sin gestionar infraestructura propia.
- **Prototipado rapido en aplicaciones de divulgacion**: aplicaciones web o moviles que muestren al usuario si su foto del cielo contiene un meteoro, con la advertencia de redimensionar la imagen a 800x800 antes de la inferencia para evitar el desplazamiento de cajas.
- **Filtrado previo en archivos historicos de imagenes**: para digitalizaciones de archivos de observatorios, el modelo puede etiquetar automaticamente imagenes con meteoros y facilitar la catalogacion, aunque con la cautela de la caida de recall en dominios distintos al de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (nivel de imagen, confianza 0,5, IoU de matching 0,5):

| Test set | Precision | Recall | F1 |
|---|---|---|---|
| Mendeley test split (1.100 imagenes) | 0,969 | 0,979 | 0,974 |
| NEO-Bench UAEMMN, todos los splits (1.382 imagenes) | 0,909 | 0,764 | 0,830 |

Latencia media en RTX 4090: 21,6 ms por imagen.

No se han publicado resultados comparativos con YOLO26n ni RF-DETR Small en la informacion disponible, aunque el autor menciona que el modelo forma parte de un estudio comparativo con ambos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 41,6 millones de parametros en precision FP32, los pesos ocupan aproximadamente 166 MB; con activaciones y buffers de inferencia, el consumo total es inferior a 1 GB de VRAM en la mayoria de configuraciones.
- **GPU recomendadas**: RTX 4090 (latencia medida de 21,6 ms por imagen), A100, H100, y en general cualquier GPU con al menos 2 GB de VRAM.
- **Compatibilidad con GPU de consumo**: si, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, e incluso GPUs integradas con suficiente memoria compartida), asi como en CPU para inferencia por lotes pequenos.
- **Opciones de despliegue**: `transformers` (PyTorch), Hugging Face Inference Endpoints (tag `endpoints_compatible`), y cualquier servidor que cargue modelos `DetrForObjectDetection`. No se han publicado variantes GGUF ni soporte explicito para llama.cpp u Ollama, que ademas no son adecuados para este tipo de modelo.
- **Latencia y throughput**: 21,6 ms por imagen en RTX 4090 segun el autor, lo que equivale a unas 46 imagenes por segundo en esa GPU en inferencia individual; el throughput real dependera del batching y del preprocesado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Didrien/meteorix-detr-resnet50 | 41,6 M | Deteccion de meteoros (1 clase) | Imagenes 800x800 | Apache 2.0 | Hugging Face |
| facebook/detr-resnet-50 (base) | 41,6 M | Deteccion de objetos generica (COCO, 91 clases) | Imagenes de tamano variable | Apache 2.0 | Hugging Face |
| YOLO26n | no disponible en la informacion | Deteccion de objetos generica | no disponible | no disponible | no disponible |
| RF-DETR Small | no disponible en la informacion | Deteccion de objetos generica | no disponible | no disponible | no disponible |

El autor menciona YOLO26n y RF-DETR Small como alternativas comparadas en el estudio Meteorix, pero no se proporcionan sus especificaciones ni resultados en la informacion disponible. Frente al DETR-ResNet-50 base, la diferencia principal es la especializacion en una unica clase y el dominio astronomico, con la contrapartida de perder la capacidad de deteccion generica.

## Limitaciones y advertencias

- **Restriccion de entrada cuadrada**: el modelo solo fue entrenado con imagenes de 800x800; alimentar imagenes no cuadradas a su relacion de aspecto nativa provoca el desplazamiento de las cajas predichas, segun advierte el propio autor.
- **Sobreajuste al dominio de entrenamiento**: la caida de F1 de 0,974 en el split Mendeley a 0,830 en NEO-Bench UAEMMN (con recall de solo 0,764) indica una generalizacion limitada a condiciones de captura distintas a las del dataset original.
- **Una unica clase**: no detecta otros objetos celestes (satelites, aviones, estrellas fugaces de otro tipo) ni objetos terrestres; cualquier uso fuera de la deteccion de meteoros requiere reentrenamiento.
- **Riesgo de falsos positivos y negativos**: no se documentan analisis de sesgo ni de calibracion de confianza mas alla de los umbrales reportados; en produccion conviene validar el umbral de 0,5 sobre datos propios.
- **Sesgos del dataset**: el dataset Mendeley puede no representar todas las condiciones de cielo (contaminacion luminica, latitudes, camaras, climatologia), lo que introduce sesgos de dominio no cuantificados.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el dataset de entrenamiento (Mendeley, CC BY 4.0) exige atribucion si se redistribuyen datos derivados.
- **Sin soporte de texto ni multilingue**: no es adecuado para tareas de NLP, agentes ni razonamiento; su uso esta acotado a vision por computador.
- **Documentacion escasa**: el repositorio tiene 19 descargas y 0 likes, sin issues ni discusion publica, por lo que el soporte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Didrien/meteorix-detr-resnet50
- Modelo base: https://huggingface.co/facebook/detr-resnet-50
- Dataset Mendeley (Gradvohl & Shirasuna): DOI 10.17632/4k98n84d9g.1 (licencia CC BY 4.0)
- Paper original de DETR (End-to-End Object Detection with Transformers): no disponible en la informacion proporcionada
- NEO-Bench UAEMMN: no disponible enlace en la informacion proporcionada
- Estudio Meteorix (comparativa YOLO26n, RF-DETR Small, DETR-ResNet-50): no disponible enlace en la informacion proporcionada
