# dronefreak/gcnet-m-cityscapes

## Resumen

gcnet-m-cityscapes es un espejo (mirror) de los pesos oficiales del checkpoint GCNet-M entrenado para segmentacion semantica sobre Cityscapes. No es un modelo nuevo: reproduce sin modificaciones el `state_dict` en fp32 publicado por los autores originales en el repositorio gyyang23/GCNet, eliminando unicamente el estado del optimizador, los buffers de logging y los planificadores de parametros de mmengine, con el objetivo de ofrecer una descarga estable y programatica via `huggingface_hub`.

La arquitectura subyacente es la Golden Cudgel Network (GCNet), presentada en CVPR 2025 (arXiv:2503.03325) y disenada para segmentacion semantica en tiempo real. La variante M ronda los 34,2 millones de parametros y 178,0 GFLOPs, y resuelve la asignacion densa de 19 clases sobre imagenes de escenas de calle a 1024x1024 pixeles. Su metrica declarada es 78,9 mIoU a escala unica sobre el split de validacion de Cityscapes.

Su relevancia practica es acotada pero clara: sirve como punto de partida reproducible para pipelines de segmentacion urbana en mmsegmentation, para comparaciones academicas y para tareas de anotacion asistida o preetiquetado, sin necesidad de rastrear un enlace de Google Drive ni de reconstruir el checkpoint de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Golden Cudgel Network (GCNet), CVPR 2025; backbone y cabeza GCNetHead sobre mmsegmentation |
| Parametros totales | ~34,2 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de entrenamiento 1024x1024) |
| Tipos de cuantizacion | No disponible (checkpoint distribuido en fp32, sin variantes cuantizadas documentadas) |
| Idiomas soportados | No aplica (modelo de segmentacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | MIT (pesos), con las condiciones de Cityscapes para los datos de entrenamiento |
| Formato de pesos | `.pth` (checkpoint de mmengine reducido a `state_dict` en fp32 + `meta`), ~321 MB |
| Coste computacional | ~178,0 GFLOPs |
| Tarea | Segmentacion semantica (19 clases de Cityscapes) |
| Framework | PyTorch 1.12.1, mmcv 2.0.0, mmengine 0.10.2, Python 3.8 |
| Repositorio de codigo | gyyang23/GCNet (mmsegmentation vendorizado) |
| Tipo de publicacion | Mirror / redistribucion, sin reentrenamiento |

## Arquitectura y entrenamiento

GCNet pertenece a la familia de redes convolucionales ligeras para segmentacion semantica en tiempo real, con un diseno encoder-decoder que combina un backbone convolucional y una cabeza de segmentacion especifica (GCNetHead) registrada dentro de una copia vendorizada de mmsegmentation. La variante M es la version de capacidad intermedia de la familia, con aproximadamente 34,2 M de parametros y 178,0 GFLOPs, lo que la situa en un rango de coste computacional propio de inferencia en tiempo real sobre GPU de gama media o alta. La configuracion distribuida en este repositorio corresponde al esquema de entrenamiento `gcnet-m_4xb3-120k_cityscapes-1024x1024`, esto es, cuatro GPUs con batch de tres por dispositivo durante 120.000 iteraciones sobre recortes de 1024x1024 pixeles.

El checkpoint es el resultado de un ajuste fino completo (full fine-tuned) sobre Cityscapes, con 19 clases de `trainId` y una paleta de colores asociada que se conserva en `meta["dataset_meta"]` del propio fichero de pesos. No hay informacion disponible sobre la composicion exacta del dataset de preentrenamiento previo, sobre el uso de RLHF/DPO (no aplicable en vision) ni sobre innovaciones adicionales de decodificacion. Lo unico documentado respecto al proceso de publicacion es la eliminacion del estado del optimizador SGD, de `message_hub` y de `param_schedulers`, reduciendo el fichero de 657 MB a unos 321 MB sin alterar ningun tensor: los pesos son identicos byte a byte al original, y el repositorio incluye `checksums.txt` con los SHA-256 de ambas versiones.

## Capacidades

- Segmentacion semantica densa de imagenes de escenas de calle en 19 clases de Cityscapes (carretera, acera, coche, peaton, senalizacion, vegetacion, cielo, etc.).
- Prediccion por pixel a resolucion de entrada de 1024x1024, devolviendo un mapa `(H, W)` con `trainId` de 0 a 18.
- Inferencia sobre imagenes RGB arbitrarias de escenas viarias, no limitada al conjunto de validacion de Cityscapes.
- Integracion con el ecosistema mmsegmentation mediante `init_model` e `inference_model`.
- Exportacion de resultados en formato de imagen coloreada usando la paleta de 19 clases incluida en los metadatos del checkpoint.
- Uso como generador de mascaras en pipelines de preetiquetado y anotacion asistida.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, modo thinking, audio ni comprension de lenguaje natural: es exclusivamente un modelo de vision por computador.
- No se documentan capacidades de segmentacion panoptica, de instancias, de profundidad ni de deteccion de objetos.

## Casos de uso

- Percepcion para conduccion autonoma o ADAS: el modelo genera la mascara semantica de la escena a 1024x1024, lo que permite identificar carretera transitable, aceras, vehiculos y peatones como entrada para modulos de planificacion o de fusion con otros sensores. Es adecuado porque cubre exactamente las 19 clases de Cityscapes, el estandar de facto en este dominio.
- Robotica movil en entornos urbanos: un robot de reparto o de limpieza puede usar la segmentacion para distinguir calzada de acera y evitar zonas no transitables, ejecutando el modelo en una GPU embebida gracias a su coste de 178 GFLOPs.
- Mapeo y analisis urbanistico: procesado por lotes de imagenes de street view para cuantificar superficie de vegetacion, carril bici, senalizacion o acera por manzana, extrayendo estadisticas por clase a partir del mapa de `trainId`.
- Preetiquetado y anotacion asistida: en un equipo de etiquetado, el modelo genera mascaras iniciales que los anotadores corrigen, reduciendo el tiempo por imagen; el formato de salida es directamente compatible con herramientas que consumen `trainId` de Cityscapes.
- Vigilancia y analitica de trafico: segmentar la escena permite medir ocupacion de carriles, detectar invasion de zonas peatonales o estimar superficies ocupadas por vehiculos en secuencias de video.
- Investigacion en segmentacion eficiente: el checkpoint sirve como baseline reproducible para comparar tecnicas de poda, cuantizacion o destilacion sobre una arquitectura de 2025 con metrica publicada.
- Destilacion y generacion de pseudoetiquetas: al ser un modelo de capacidad media con 78,9 mIoU, puede actuar como profesor para entrenar variantes mas pequenas sobre datos no anotados de un dominio concreto.
- Procesado de video en el borde: con 178 GFLOPs por fotograma, un despliegue sobre GPU de gama media permite analizar flujos de camara con resolucion reducida o saltando fotogramas.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Dataset | Split | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Cityscapes | validation | mIoU (escala unica) | 78,9 | No |

No se han publicado en la informacion disponible otros resultados de benchmarks (latencia, FPS, mIoU multiescala, comparativas frente a otros modelos) atribuibles a este checkpoint.

## Requisitos de hardware

- Pesos en fp32 de aproximadamente 34,2 M de parametros: en torno a 137 MB de memoria para el modelo, dentro de un fichero de checkpoint de ~321 MB que incluye ademas los metadatos de mmengine.
- VRAM para inferencia: no disponible de forma oficial. Estimacion orientativa: la memoria dominante proviene de las activaciones a 1024x1024, por lo que el modelo deberia caber con holgura en GPU consumer de 8-12 GB (RTX 3060, RTX 4060, RTX 4070), aunque el valor exacto depende del backend y del tamano de lote.
- GPU recomendadas: no disponibles en la documentacion. Por rango de coste (178 GFLOPs), encajan GPU de inferencia de gama media-alta tipo RTX 3090/4090, A10, L4 o A100/H100 si se requiere procesado por lotes a alta resolucion.
- Cabe en GPU consumer: previsiblemente si, en modelos con al menos 8 GB de VRAM; no confirmado por el autor.
- Opciones de despliegue: mmsegmentation (unica ruta soportada oficialmente; requiere instalar la copia vendorizada del repositorio gyyang23/GCNet, ya que `pip install mmsegmentation` no registra GCNet ni GCNetHead). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. El unico dato de coste publicado es 178,0 GFLOPs por inferencia.
- Entorno de referencia: Python 3.8, PyTorch 1.12.1, mmcv 2.0.0, mmengine 0.10.2.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card no incluye tablas frente a otras arquitecturas y la busqueda web no aporta resultados tecnicos utilizables. A continuacion se indican las familias comparables por categoria y tamano, con los campos marcados como no disponibles:

| Modelo | Parametros | Contexto / resolucion | mIoU Cityscapes val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gcnet-m-cityscapes (este) | ~34,2 M | 1024x1024 | 78,9 (escala unica, no verificado) | MIT | HuggingFace (mirror) |
| GCNet-S / GCNet-L (misma familia) | no disponible | no disponible | no disponible | MIT | Repositorio upstream |
| SegFormer (variantes B0-B5) | no disponible | no disponible | no disponible | no disponible | no disponible |
| DDRNet / PIDNet (tiempo real) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se debe interpretar esta tabla como una comparacion de rendimiento: unicamente situa el modelo en su categoria. Se recomienda consultar el paper arXiv:2503.03325 para obtener las cifras oficiales frente a otros metodos.

## Limitaciones y advertencias

- Es un mirror, no un modelo nuevo: no aporta ninguna mejora, reentrenamiento ni ajuste adicional respecto al checkpoint original.
- El valor de 78,9 mIoU esta declarado por el autor y marcado como no verificado (`verified: false`); no hay evaluacion independiente.
- El modelo esta especializado en escenas de calle del dominio Cityscapes (19 clases). El rendimiento fuera de ese dominio (interiores, imagenes aereas, entornos nocturnos extremos, paises con senalizacion muy distinta) no esta documentado y previsiblemente degrada.
- Riesgo de error en clases minoritarias o ambiguas: las 19 clases no cubren objetos fuera de la taxonomia (por ejemplo, obstaculos atipicos), que quedaran sin etiquetar o mal asignados.
- Sesgo de dominio: Cityscapes se compone de grabaciones en 50 ciudades alemanas en condiciones predominantemente diurnas y con buen tiempo; los sesgos geograficos y meteorologicos del dataset se trasladan al modelo.
- Licencia: los pesos se redistribuyen bajo MIT, pero fueron entrenados con Cityscapes, cuyos terminos restringen el uso a fines academicos y de investigacion. El propio autor del mirror indica que los pesos derivados se redistribuyen "sobre esa misma base", lo que genera incertidumbre juridica para uso comercial. Conviene revisar la licencia de Cityscapes antes de un despliegue en produccion.
- Dependencia de software fragil: requiere la copia vendorizada de mmsegmentation del repositorio upstream y versiones antiguas de PyTorch/mmcv (1.12.1 / 2.0.0). La instalacion con versiones actuales puede fallar.
- Los data loaders de la configuracion apuntan a `./data/cityscapes/`; hay que ignorarlos para inferencia de una sola imagen, pero cualquier intento de evaluacion requiere descargar el dataset por separado.
- El fichero de pesos solo contiene `state_dict` y `meta`: no incluye estado del optimizador, por lo que no sirve para reanudar el entrenamiento tal cual.
- No hay informacion sobre cuantizacion, versiones ONNX/TensorRT ni soporte de aceleradores distintos de CUDA/CPU.
- Sin soporte de lenguaje: no puede utilizarse para tareas conversacionales, generacion de texto ni agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/gcnet-m-cityscapes
- Repositorio upstream (codigo y pesos originales): https://github.com/gyyang23/GCNet
- Pesos originales en Google Drive: https://drive.google.com/file/d/1sRaoMBirNeOlzV7DSJrML37k6Ypm4E7n/view
- Paper (arXiv:2503.03325), "Golden Cudgel Network for Real-Time Semantic Segmentation": https://arxiv.org/abs/2503.03325
- Dataset Cityscapes: https://www.cityscapes-dataset.com/
- Licencia de Cityscapes: https://www.cityscapes-dataset.com/license/
- Perfil del autor del mirror: https://huggingface.co/dronefreak
