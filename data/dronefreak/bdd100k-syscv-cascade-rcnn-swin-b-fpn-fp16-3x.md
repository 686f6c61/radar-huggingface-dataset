# dronefreak/bdd100k-syscv-cascade-rcnn-swin-b-fpn-fp16-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-cascade-rcnn-swin-b-fpn-fp16-3x` es un detector de objetos para escenas de conduccion autonoma, entrenado sobre el conjunto de datos BDD100K. Se trata de un espejo (mirror) del checkpoint publicado originalmente por el laboratorio SysCV de la ETH Zurich en su zoo de modelos para BDD100K, cuyo host `dl.cv.ethz.ch` esta fuera de servicio. El autor del repositorio recupero los pesos desde la Wayback Machine (captura del 19 de febrero de 2025), tomo la configuracion y los resultados del GitHub de SysCV y anadio un entorno de dependencias fijado y un script de inferencia.

Arquitectonicamente es un Cascade R-CNN con backbone Swin Transformer Base (Swin-B), cuello FPN y cabezas de deteccion en cascada, implementado sobre MMDetection 2.x. El modelo tiene 131.982.604 parametros y procesa imagenes a la resolucion nativa de BDD100K (1280 x 720) sin reescalado, entrenado en precision mixta FP16 durante 36 epocas (esquema 3x). Detecta diez clases de trafico: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico.

Su relevancia actual es practica: es una reproduccion verificada de un checkpoint de referencia que ya no es accesible desde su fuente original, con pesos cuyo MD5 coincide con el publicado por SysCV y con un entorno reproducible que permite ejecutar inferencia en CPU o GPU con MMDetection 2.28.2. Resulta util para investigadores que necesiten una linea base solida de deteccion en BDD100K sin depender de infraestructura caida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN con backbone Swin Transformer Base (Swin-B) y FPN |
| Parametros totales | 131.982.604 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en FP16 y safetensors; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | bdd100k (educational, research and not-for-profit use); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` original en `original/` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de deteccion en dos etapas con refinamiento en cascada. El backbone es un Swin Transformer Base con parches de 4x4 y ventana de 7, inicializado con pesos de ImageNet (`swin_base_patch4_window7_224.pth`). Sobre el backbone se aplica un Feature Pyramid Network (FPN) y, a continuacion, las cabezas de Cascade R-CNN, que refinan iterativamente las propuestas con umbrales de IoU crecientes para mejorar la localizacion. Todo el pipeline esta implementado en MMDetection 2.x (version fijada 2.28.2) con `mmcv-full` 1.7.2 y PyTorch 2.0.1.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con AdamW, learning rate 0.0001, weight decay 0.05, decaimiento del learning rate en las epocas 27 y 33, batch de 32 (8 GPUs x 2 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). Se uso precision mixta FP16. En inferencia se aplica un umbral de score de 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, al no tratarse de un modelo generativo.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion en las diez clases de BDD100K: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico.
- Procesamiento de imagenes individuales, carpetas de imagenes, ficheros de video y flujo de webcam mediante el script `infer.py`.
- Salida en formato BDD100K mediante la opcion `--json`, lo que facilita la evaluacion con las herramientas oficiales del dataset.
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de fotogramas procesados (`--max-frames`).
- Ejecucion en CPU (4,1 s/imagen con 8 hilos) y en GPU mediante el entorno CUDA 11.8 fijado.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento: es exclusivamente un detector de objetos.

## Casos de uso

- Linea base para investigacion en deteccion sobre BDD100K: sirve como referencia reproducible (AP 35,0 en val) para comparar nuevos detectores con el mismo protocolo de evaluacion y la misma configuracion de SysCV.
- Reproduccion de resultados publicados: al conservar el MD5 de los pesos y las predicciones de validacion archivadas en `original/`, permite verificar experimentos que dependian del checkpoint original ya inaccesible.
- Prototipado de sistemas de percepcion para conduccion autonoma: deteccion de coches, peatones y senales a resolucion nativa 1280 x 720 sin reescalado, adecuada para pipelines de investigacion en percepcion.
- Analisis de video de trafico: el script acepta ficheros de video y procesa fotogramas secuencialmente, util para anotacion asistida o auditoria de grabaciones de camara.
- Generacion de pseudoetiquetas: con umbral de score bajo (0.05 en evaluacion) puede producir detecciones para preanotar nuevos datos de conduccion antes de una revision humana.
- Demostraciones y docencia: el entorno fijado y el soporte de webcam permiten montar demos interactivas de deteccion en tiempo real sobre hardware modesto (CPU o una GPU consumer).
- Evaluacion de robustez dia/noche: la model card incluye clips de validacion diurnos y nocturnos, lo que facilita estudiar el comportamiento del detector en condiciones de iluminacion adversas.

## Benchmarks y rendimiento

Resultados declarados por SysCV (Box AP estilo COCO, en porcentaje) sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 35,0 | 59,4 | 35,0 | 16,9 | 40,0 | 58,4 |
| test | 34,1 | 57,1 | 34,8 | 17,3 | 39,4 | 53,0 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 38,6 |
| rider | 29,3 |
| car | 53,3 |
| truck | 45,4 |
| bus | 49,9 |
| train | 8,8 |
| motorcycle | 28,2 |
| bicycle | 29,2 |
| traffic light | 26,5 |
| traffic sign | 40,9 |

El valor de mAP declarado en el model-index es 35,03 (no verificado, `verified: false`). La verificacion del espejo indica que, sobre 20 imagenes aleatorias de validacion, 598 de las 605 cajas publicadas por SysCV son identicas en esta copia en CPU y las 605 coinciden con IoU >= 0,5, con una diferencia maxima de score de 0,0011.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Con 131,98 M de parametros en FP16, los pesos ocupan aproximadamente 264 MB, por lo que la VRAM necesaria sera moderada; el cuello de botella real es la activacion a resolucion 1280 x 720.
- GPU recomendadas: no se documentan GPU concretas. El entorno fijado usa CUDA 11.8 y el autor indica que el entorno CUDA no ha sido probado.
- GPU consumer: por el tamano de pesos (unos 264 MB en FP16) es plausible que quepa en GPU consumer, pero no hay confirmacion en la informacion disponible.
- Despliegue: MMDetection 2.28.2 con `mmcv-full` 1.7.2 y PyTorch 2.0.1 sobre Python 3.10; se recomienda un entorno virtual limpio. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de este tipo).
- Latencia: 4,1 s/imagen en CPU con 8 hilos. No se proporcionan cifras de latencia o throughput en GPU.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la informacion disponible. Como referencia interna, el propio autor aporta los resultados de este checkpoint frente a los publicados por SysCV para el mismo modelo (AP 35,0 en val), pero no se incluyen datos de alternativas como Faster R-CNN, YOLO u otros detectores sobre BDD100K.

| Modelo | Parametros | Contexto/entrada | AP val BDD100K | Licencia |
|---|---|---|---|---|
| Este modelo (Cascade R-CNN Swin-B-FPN) | 131.982.604 | 1280 x 720 | 35,0 | bdd100k (solo investigacion) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K, limitada a uso educativo, de investigacion y sin animo de lucro. No se permite uso comercial sin autorizacion.
- Clases con rendimiento muy bajo: `train` obtiene AP 8,8 y `traffic light` 26,5, lo que limita su uso en aplicaciones que dependan de estas categorias.
- Objetos pequenos: APs de 16,9 en validacion indica dificultades con instancias de baja resolucion.
- Verificacion parcial: la comprobacion de equivalencia con SysCV es "cercana, no exacta" (598 de 605 cajas identicas), con causa no investigada; el entorno CUDA no ha sido probado.
- Sin datos de sesgo: no se documentan sesgos conocidos ni evaluaciones de equidad; al entrenarse solo con BDD100K, hereda los sesgos de ese dataset (predominantemente escenas urbanas y suburbanas de determinadas regiones).
- Riesgo de falsos positivos y negativos segun el umbral: el umbral por defecto de 0.3 en inferencia difiere del 0.05 usado en evaluacion, lo que puede alterar el numero de detecciones.
- Entorno obsoleto: depende de MMDetection 2.x y `mmcv-full` 1.7.2, versiones antiguas que pueden complicar el mantenimiento a largo plazo.
- Sin capacidades linguisticas ni generativas: no es adecuado para tareas de texto, dialogo ni razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-swin-b-fpn-fp16-3x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-swin-b-fpn-fp16-3x/blob/main/LICENSE.txt
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/cascade_rcnn_swin-b_fpn_fp16_3x_det_bdd100k.py
- Paper Swin Transformer (arXiv 2103.14030): https://arxiv.org/abs/2103.14030
- Pesos ImageNet del backbone Swin-B: https://github.com/SwinTransformer/storage/releases/download/v1.0.0/swin_base_patch4_window7_224.pth
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
