# dronefreak/bdd100k-syscv-dla60x-5x-224x224-scene

## Resumen

DLA-X-60 Scene Tagging es un clasificador de imágenes especializado en el etiquetado de escenas de conducción, entrenado sobre el conjunto de datos BDD100K. Asigna a cada fotograma una única etiqueta de escena entre siete posibles: túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera y autopista. El modelo procede del zoo de modelos de SysCV (ETH Zurich) y este repositorio de Hugging Face es un espejo recuperado del archivo Wayback Machine, ya que el host original `dl.cv.ethz.ch` está fuera de servicio.

La arquitectura es una DLA-X-60 (Deep Layer Aggregation, CVPR 2018) con una cabeza de clasificación lineal, sumando 16.690.487 parámetros. Se entrenó durante 60 épocas sobre las 70.000 imágenes de entrenamiento de BDD100K, con recortes aleatorios de 224×224 y volteos horizontales, sin pesos preentrenados en el backbone.

Es relevante para pipelines de percepción en conducción autónoma que necesiten un clasificador ligero y rápido de contexto de escena, con un coste de inferencia de 5 ms por imagen en una RTX 4070 SUPER. Su utilidad principal es como módulo auxiliar de etiquetado o como componente de sistemas de análisis de vídeo de tráfico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DLA-X-60 (Deep Layer Aggregation) con ClsHead lineal |
| Parametros totales | 16.690.487 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BDD100K (uso educativo, investigación y sin ánimo de lucro) |
| Formato de pesos | safetensors y .pth original |

## Arquitectura y entrenamiento

El modelo emplea una red DLA-X-60 como backbone, una arquitectura convolucional con agregación profunda de capas que combina conexiones jerárquicas y semánticas entre bloques. Sobre el backbone se añade una cabeza de clasificación lineal (ClsHead) que produce las siete etiquetas de escena. No se configuraron pesos preentrenados para el backbone, por lo que el entrenamiento parte de inicialización aleatoria.

El entrenamiento se realizó sobre las 70.000 imágenes de entrenamiento de BDD100K durante 60 épocas (denominado "5x" en la nomenclatura de SysCV), con SGD de tasa de aprendizaje 0,1, momento 0,9 y decaimiento de peso 0,0001, con reducciones de tasa en las épocas 30 y 45. El lote fue de 128 imágenes (4 GPU × 32), con recortes aleatorios redimensionados a 224×224 y volteos horizontales. En inferencia, la imagen se redimensiona por el lado corto a 256 píxeles y se aplica un recorte central de 224×224, con normalización ImageNet.

## Capacidades

- Clasificación de escenas de conducción en siete categorías: túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera y autopista.
- Procesamiento de imágenes individuales, carpetas de imágenes, vídeos y flujo de webcam mediante el script `infer.py`.
- Salida de la etiqueta predicha y de todas las puntuaciones por clase en formato JSON (`--json`).
- Control del número máximo de fotogramas procesados en vídeo (`--max-frames`).
- Inferencia en GPU (CUDA 11.8) y en CPU con entorno específico.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Etiquetado automático de escenas en datasets de conducción: el modelo puede procesar lotes de imágenes de BDD100K o de dominios similares para generar etiquetas de escena de forma masiva, con una precisión top-1 del 75,8 % en validación, útil como paso de preetiquetado previo a revisión humana.
- Análisis de vídeo de tráfico: el script de inferencia acepta archivos de vídeo y procesa fotograma a fotograma, permitiendo clasificar secuencias completas de dashcam o cámaras de vigilancia vial con un coste de 5 ms por imagen en GPU.
- Módulo auxiliar en pipelines de percepción autónoma: al ser un clasificador ligero de 16,7 M de parámetros, puede integrarse como componente de contexto de escena que condicione el comportamiento de otros módulos (detección, planificación) según si el vehículo está en autopista, túnel o zona residencial.
- Monitorización de flotas y logística: clasificación de recorridos grabados para generar informes de tipos de entorno atravesados, aprovechando el procesamiento por lotes de carpetas de imágenes.
- Investigación en visión por computador: reproducción exacta de los resultados publicados por SysCV (verificado con coincidencia exacta en las 10.000 imágenes de validación), lo que lo hace adecuado como baseline reproducible en experimentos de clasificación de escenas.
- Demostraciones en tiempo real: el modo webcam (`python infer.py 0 --show`) permite visualizar las etiquetas de escena en directo, útil para prototipos y validación cualitativa en entornos controlados.
- Análisis de dominios día/noche: el modelo ha sido validado en clips diurnos y nocturnos de BDD100K, lo que permite su uso en estudios comparativos de rendimiento según condiciones de iluminación.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuaciones de SysCV). Precisión, exhaustividad y F1 son medias macro sobre las 7 clases (incluida `undefined`):

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 75,80 % | 50,76 % | 39,59 % | 42,37 % |
| test | 75,69 % | 55,35 % | 38,04 % | 41,04 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 16,7 M de parámetros, el modelo en FP32 ocupa aproximadamente 67 MB de pesos, por lo que la VRAM necesaria es mínima (inferior a 1 GB en la práctica).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA 11.8; el autor reporta 5 ms por imagen en una RTX 4070 SUPER (incluyendo decodificación JPEG).
- Cabe en cualquier GPU de consumo: RTX 4070 SUPER verificada por el autor; por tamaño, también en GPUs de gama baja y en CPU.
- CPU: 0,03 s por imagen con 8 hilos de CPU; el entorno CPU reproduce las mismas etiquetas que la GPU (diferencia máxima de puntuación de 1e-06 en 20 imágenes de validación).
- Opciones de despliegue: script `infer.py` incluido, con entornos fijados (`env/requirements-cu118.txt` y `env/requirements-cpu.txt`) que fijan torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 sobre Python 3.10. No se documentan opciones como vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: 0,005 s/imagen en RTX 4070 SUPER (≈200 imágenes/s); 0,03 s/imagen en CPU de 8 hilos (≈33 imágenes/s).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de clasificación de escenas en la información proporcionada. La model card no incluye comparaciones con otros clasificadores del zoo de SysCV ni con arquitecturas alternativas (ResNet, EfficientNet, etc.) entrenadas sobre BDD100K.

| Modelo | Parámetros | Contexto/entrada | Top-1 (BDD100K val) | Licencia |
|---|---|---|---|---|
| DLA-X-60 Scene Tagging | 16,69 M | 224×224 | 75,80 % | BDD100K |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan sujetos a su licencia, que permite únicamente uso educativo, de investigación y sin ánimo de lucro. No se autoriza el uso comercial sin permiso.
- Riesgo de sesgo: el modelo se entrenó exclusivamente con BDD100K, un dataset de conducción con sesgos geográficos y de condiciones de captura; el rendimiento puede degradarse en dominios no representados (otras regiones, condiciones meteorológicas extremas, cámaras con distinta calibración).
- Métricas macro bajas: aunque la precisión top-1 es del 75,8 %, la precisión macro (50,76 %), la exhaustividad macro (39,59 %) y el F1 macro (42,37 %) indican un rendimiento desigual entre clases, probablemente por desequilibrio de clases y por la clase `undefined`.
- Clasificación de etiqueta única: el modelo asigna una sola etiqueta de escena por imagen, sin detección de múltiples contextos simultáneos.
- Sin capacidades de lenguaje ni razonamiento: no es un modelo generativo; no soporta tool calling, agentes ni procesamiento de texto.
- Dependencia de un entorno antiguo: requiere torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 sobre Python 3.10, lo que puede complicar la integración en stacks modernos; se recomienda un entorno virtual limpio.
- Origen del espejo: los pesos se recuperaron del archivo Wayback Machine (captura del 29 de enero de 2025) porque el host original está caído; aunque el autor verifica la coincidencia MD5 y la reproducción exacta, la cadena de custodia depende de dicha captura.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas en escenas ambiguas o límite entre categorías.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-dla60x-5x-224x224-scene
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-dla60x-5x-224x224-scene/blob/main/LICENSE.txt
- Zoo de modelos SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/dla60x_5x_224x224_scene_tag_bdd100k.py
- Paper de DLA (Deep Layer Aggregation, CVPR 2018): https://arxiv.org/abs/1707.06484
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K
