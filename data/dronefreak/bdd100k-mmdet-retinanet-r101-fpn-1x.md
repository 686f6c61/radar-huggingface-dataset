# dronefreak/bdd100k-mmdet-retinanet-r101-fpn-1x

## Resumen

RetinaNet con backbone ResNet-101 y cuello FPN, entrenado con el schedule 1x sobre el conjunto de datos BDD100K para deteccion de objetos en escenas de conduccion. Lo publica el equipo de BDD100K (Berkeley DeepDrive) en 2020 como baseline oficial de deteccion, y esta ficha corresponde a un espejo no oficial alojado por el usuario `dronefreak` en Hugging Face, que anade entorno fijado, script de inferencia y verificacion de integridad. El checkpoint original se distribuyo sin documentacion en el servidor de descargas de Berkeley, de modo que este espejo actua como la documentacion que faltaba.

El modelo resuelve la tarea clasica de deteccion de objetos en imagenes y video de trafico: coches, peatones, senales de trafico, semaforos, autobuses, bicicletas, motos, camiones, zonas de paso de peatones, conos y barreras. Con 55,6 millones de parametros y un fichero de pesos de aproximadamente 1,1 GB, es un detector de talla media que puede ejecutarse en CPU y en GPUs de consumo, lo que lo hace util como referencia historica y como baseline reproducible en pipelines de vision para conduccion autonoma.

Su relevancia actual es doble: por un lado, permite reproducir un resultado publicado en 2020 con un stack moderno (PyTorch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2); por otro, documenta con precision una discrepancia de hasta 0,0465 en las puntuaciones respecto a las predicciones originales, causada por un cambio en la seleccion de candidatos antes de NMS entre mmdetection 2.5 y 2.18. Es, por tanto, un artefacto de referencia para quien necesite comparar detectores sobre BDD100K con trazabilidad completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet (one-stage, anchor-based) con backbone ResNet-101 y cuello FPN |
| Parametros totales | 55.614.014 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; el modelo procesa imagenes, no texto) |
| Licencia | BDD100K (licencia propia, enlazada en `LICENSE.txt` del repositorio) |
| Formato de pesos | safetensors (checkpoint compatible con mmdetection 2.x; el original se distribuia como `.pth`) |

## Arquitectura y entrenamiento

RetinaNet es un detector de una sola etapa que combina un backbone convolucional con un cuello Feature Pyramid Network y dos subredes en cabeza (clasificacion y regresion de cajas) que comparten parametros entre niveles de la piramide. En esta variante el backbone es ResNet-101 y el entrenamiento sigue el schedule 1x, es decir, 12 epocas sobre BDD100K. La innovacion clave de RetinaNet, la focal loss, sigue presente en la cabeza de clasificacion para mitigar el desbalance extremo entre anclas positivas y negativas.

El entrenamiento original se realizo con PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.5 y mmdetection 2.5.0 sobre GPUs GeForce RTX 2080 Ti, segun los metadatos grabados en el propio checkpoint. No se documentan en la informacion disponible el numero exacto de imagenes de entrenamiento, la composicion del dataset ni si hubo tecnicas de aumento adicionales mas alla de las estandar de mmdetection. Tampoco se indica si se aplico algun proceso de refinamiento posterior; se trata de un baseline supervisado de deteccion, sin RLHF ni DPO.

## Capacidades

- Deteccion de objetos en imagenes sueltas, carpetas de imagenes, ficheros de video y flujo de webcam, mediante el script `infer.py` incluido en el repositorio.
- Clasificacion y localizacion de las clases propias de BDD100K: coche, camion, autobus, persona, bicicleta, moto, semaforo, senal de trafico, zona de paso de peatones, cono y barrera.
- Salida de cajas en formato BDD100K (pixeles, `x1 y1 x2 y2`) mediante la opcion `--json detections.json`.
- Umbral de puntuacion configurable (`--score-thr`, por defecto 0,3) y limite de fotogramas procesados en video (`--max-frames`).
- Ejecucion en CPU o GPU con entornos separados (`requirements-cpu.txt` y `requirements-cu118.txt`).
- Carga segura de pesos con `torch.load(weights_only=True)`, de modo que el checkpoint solo contiene tensores y metadatos y no puede ejecutar codigo.
- No dispone de tool calling, soporte de agentes, capacidades multilingues, modo thinking, vision-lenguaje ni audio.

## Casos de uso

- Baseline reproducible para investigacion en deteccion sobre BDD100K: sirve como punto de comparacion fijo (mAP@50:95 de 28,3) para nuevos detectores, con un entorno fijado que garantiza que las cifras se obtienen con el mismo stack.
- Preetiquetado de datasets de conduccion: el modelo puede generar cajas candidatas sobre imagenes no anotadas y un equipo humano solo tiene que corregirlas, reduciendo el coste de anotacion en clases frecuentes como coche, persona y semaforo.
- Auditoria de pipelines de vision existentes: al ser un espejo verificado con SHA-256 y comparacion contra las predicciones originales, permite validar que una instalacion de mmdetection 2.x reproduce razonablemente los resultados publicados antes de migrar a otra version.
- Deteccion en tiempo casi real sobre video de trafico: con 55,6 M de parametros y backbone ResNet-101, es viable procesar secuencias de dashcam en una GPU de consumo o incluso en CPU con resolucion reducida, usando `infer.py drive.mov`.
- Educacion y docencia en vision por computador: la combinacion de checkpoint, script de inferencia y entorno fijado hace que sea un ejemplo autocontenido de detector one-stage con FPN para practicas de laboratorio.
- Analisis de escenas nocturnas y diurnas: la model card incluye una demo sobre clips de validacion de dia y de noche, lo que permite evaluar el comportamiento del detector en condiciones de iluminacion distintas sin entrenamiento adicional.
- Prototipado de sistemas ADAS de bajo coste: como modulo de percepcion inicial para pruebas de concepto en las que no se requiere el estado del arte, sino un detector ligero y bien documentado con licencia conocida.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente por el espejo) sobre el split de validacion de BDD100K:

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 28,3 |
| mAP@50 (val) | 52,6 |
| mAP@75 (val) | 25,8 |

No se han publicado en la informacion disponible resultados de otros benchmarks (por ejemplo, latencia, throughput o mAP sobre el split de test) mas alla de la comparacion cualitativa con las predicciones originales descrita en la seccion de limitaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 55,6 M de parametros y pesos en precision completa, el checkpoint ocupa aproximadamente 1,1 GB en disco y una fraccion similar en memoria, por lo que cabe holgadamente en GPUs con 8 GB o mas.
- GPU recomendadas: el entrenamiento original uso GeForce RTX 2080 Ti; para inferencia son suficientes GPUs de consumo como RTX 3060, RTX 4060 o superiores. No se documentan requisitos para A100 o H100, aunque el modelo puede ejecutarse en ellas sin problema.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 8 GB de VRAM; tambien puede ejecutarse en CPU con el entorno `requirements-cpu.txt`.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y PyTorch 2.0.1, en Python 3.10. El repositorio incluye `infer.py` para imagen, carpeta, video y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | mAP@50:95 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaNet R101-FPN 1x (este modelo) | 55,6 M | Deteccion de objetos | 28,3 | BDD100K | Espejo en Hugging Face |
| RetinaNet R50-FPN (mmdetection) | no disponible en la informacion | Deteccion de objetos | no disponible | Apache 2.0 (mmdetection) | Repositorio oficial de mmdetection |
| Otros baselines de BDD100K (2020) | no disponible | Deteccion de objetos | no disponible | BDD100K | Servidor de descargas de Berkeley |

No se dispone en la informacion proporcionada de cifras comparativas de mAP para alternativas de la misma categoria, por lo que la comparativa cuantitativa queda limitada al propio modelo.

## Limitaciones y advertencias

- El espejo no reproduce exactamente las predicciones originales: sobre 20 imagenes de test, genera 1981 cajas frente a 1982 del autor, con 1922 coincidencias (misma clase, IoU >= 0,5) y una diferencia maxima de puntuacion de 0,0465. La causa es un cambio en la seleccion de candidatos antes de NMS entre mmdetection 2.5 y 2.18.
- Los pesos originales se publicaron sin documentacion; esta model card es la unica fuente de contexto y debe tratarse como tal.
- La licencia BDD100K impone restricciones propias que no se detallan en la informacion disponible; es imprescindible revisar `LICENSE.txt` antes de cualquier uso comercial.
- El modelo esta entrenado exclusivamente sobre BDD100K, por lo que su rendimiento fuera de dominios de conduccion (interiores, escenas aereas, imagenes medicas) sera previsiblemente bajo.
- No se documentan sesgos demograficos ni geograficos, pero al ser un dataset de conduccion recogido en entornos concretos, es esperable un sesgo hacia condiciones de iluminacion, clima y geografia similares a las de BDD100K.
- Riesgo de alucinacion en el sentido de falsos positivos y cajas mal localizadas en escenas congestionadas u objetos pequenos, agravado por el mAP@75 relativamente bajo (25,8).
- El stack requerido esta descatalogado: PyTorch 1.6.0, CUDA 10.2 y mmcv 1.1.5 no tienen kernels para GPUs actuales, y mmdetection 3.x cambio el formato de configuracion y el codigo del modelo, por lo que es obligatorio usar la linea 2.x.
- Las versiones fijadas en `env/` pueden degradar paquetes de un entorno existente; se recomienda crear un entorno virtual limpio.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-retinanet-r101-fpn-1x
- Licencia: https://huggingface.co/dronefreak/bdd100k-mmdet-retinanet-r101-fpn-1x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Repositorio de mmdetection: https://github.com/open-mmlab/mmdetection
- Paper de RetinaNet (Focal Loss for Dense Object Detection): https://arxiv.org/abs/1708.02002
- Sitio oficial de BDD100K: https://bdd-data.berkeley.edu/
