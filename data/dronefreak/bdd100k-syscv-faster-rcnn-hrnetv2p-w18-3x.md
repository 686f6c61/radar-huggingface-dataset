# dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w18-3x

## Resumen

Faster R-CNN con backbone HRNetV2p-W18 y cuello HRFPN, entrenado sobre BDD100K para detección de objetos en escenas de conducción. Es un espejo del checkpoint publicado originalmente en el model zoo de SysCV (ETH Zurich) para el benchmark BDD100K; el host original `dl.cv.ethz.ch` está fuera de servicio y los pesos se recuperaron de la Wayback Machine (captura del 19 de febrero de 2025). El repositorio añade un entorno fijado y un script de inferencia (`infer.py`) que acepta imagen, carpeta de imágenes, vídeo o webcam.

No es un modelo generativo ni un LLM: es un detector de objetos de dos etapas (region proposal network más cabecera de clasificación y regresión de cajas) con 27,16 millones de parámetros. Detecta diez clases de BDD100K (peatón, ciclista, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico) a resolución nativa de 1280 x 720.

Su relevancia actual es como referencia reproducible: permite ejecutar y evaluar el baseline oficial de BDD100K sin depender de infraestructura caída, con pesos verificados por MD5 contra el fichero de SysCV y un stack de dependencias (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) que funciona con las configuraciones de mmdetection 2.x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone HRNetV2p-W18 y cuello HRFPN (mmdetection) |
| Parametros totales | 27.157.862 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors y `.pth` en precisión original) |
| Idiomas soportados | no aplica (detección visual; etiquetas de clase en inglés) |
| Licencia | BDD100K (`other`): uso educativo, de investigación y sin ánimo de lucro; la configuración de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (fichero principal) y `.pth` original; configuración en Python (`config.py`, `original_config.py`) y `config.json` resumen |

## Arquitectura y entrenamiento

Faster R-CNN en la implementación de mmdetection: extractor de características HRNetV2p-W18 (variante de HRNet con representación de alta resolución, paper arXiv:1908.07919, CVPR 2019 / TPAMI 2020), cuello HRFPN para fusión multiescala y cabecera estándar de Faster R-CNN con RPN y ROI head. La entrada es la resolución nativa de BDD100K (1280 x 720) sin redimensionado, en RGB con media y desviación típica de ImageNet.

El entrenamiento usa el split de entrenamiento de BDD100K (70.000 imágenes) durante 36 épocas (programa 3x) con SGD, learning rate 0.02, weight decay 0.0001, decaimiento en las épocas 24 y 33, batch de 32 (8 GPU x 2 imágenes según el README de SysCV) y entrenamiento multiescala con 6 escalas entre (1280, 600) y (1280, 720). El backbone se inicializa con pesos ImageNet `open-mmlab://msra/hrnetv2_w18`. En test se aplica umbral de score 0.05, NMS con IoU 0.5 y un máximo de 100 cajas por imagen. No se documenta RLHF, DPO ni aumentos de datos adicionales más allá del multi-scale.

## Capacidades

- Detección de objetos en imágenes de escenas de conducción con diez clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Inferencia sobre imagen individual, carpeta de imágenes, fichero de vídeo y webcam (modo `--show`).
- Salida en formato BDD100K mediante `--json out.json`, útil para evaluación con las herramientas oficiales del benchmark.
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y límite de fotogramas (`--max-frames N`).
- Carga segura de pesos con `torch.load(weights_only=True)`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión-lenguaje, audio ni generación de texto.

## Casos de uso

- Evaluación reproducible del baseline BDD100K: ejecutar `infer.py` sobre el split de validación y comparar con los AP publicados por SysCV para validar pipelines de detección antes de entrenar modelos propios.
- Prototipado de percepción en conducción autónoma: detectar coches, peatones y señales en vídeo de dashcam para construir un pipeline de percepción mínima en investigación, aprovechando que el modelo está entrenado con las diez clases del dominio.
- Análisis offline de grabaciones: procesar ficheros de vídeo con `--max-frames` para extraer detecciones por fotograma y generar estadísticas de tráfico o densidad de objetos.
- Docencia y formación en visión por computador: el stack fijado (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) permite reproducir un detector de dos etapas clásico sin resolver conflictos de dependencias.
- Generación de pseudoetiquetas: usar las detecciones con umbral bajo (0.05, como en el test de SysCV) como etiquetas preliminares para preentrenar o aumentar datasets propios de escenas de tráfico.
- Comparativa de backbones: servir como referencia HRNetV2p-W18 frente a variantes de mayor capacidad del mismo model zoo para medir el compromiso precisión/coste computacional.
- Demostración en webcam: inferencia en tiempo real sobre cámara conectada (`infer.py 0 --show`), útil para validar el entorno antes de desplegar en un vehículo o banco de pruebas.

## Benchmarks y rendimiento

Resultados declarados por SysCV (no verificados caja a caja por el autor del espejo; las predicciones de validación de este modelo no estaban archivadas). AP estilo COCO en BDD100K, en porcentaje:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 33,4 | 58,7 | 32,0 | 16,6 | 38,3 | 53,8 |
| test | 32,6 | 56,3 | 32,4 | 17,4 | 39,3 | 47,8 |

AP por clase en validación:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 36,9 | 28,2 | 52,6 | 47,9 | 49,9 | 0,0 | 26,3 | 26,6 | 25,3 | 40,0 |

El valor de mAP de la model-index (33,35) corresponde al box AP de validación. La clase train obtiene 0,0 de AP, lo que refleja su escasa presencia en el conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 27,16 M de parámetros en FP32 los pesos ocupan aproximadamente 109 MB, y el consumo real depende del tamaño de lote y de la resolución de entrada (1280 x 720). El repositorio ofrece requisitos para CUDA 11.8 y para CPU.
- GPU recomendadas: no especificadas por el autor. El entrenamiento original usó 8 GPU con 2 imágenes por GPU; para inferencia basta una GPU consumer moderna, aunque no se publican cifras de latencia.
- Cabe en GPU consumer: sí, por tamaño de pesos; el autor no confirma cifras de memoria ni velocidad en GPU (el entorno CUDA no estaba probado en el momento de publicar el espejo).
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10 (entorno fijado en `env/requirements-cu118.txt` y `env/requirements-cpu.txt`), más el script `infer.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN HRNetV2p-W18-HRFPN 3x) | 27,16 M | 1280 x 720 | 33,4 | BDD100K (uso educativo/investigación) | Hugging Face (espejo) |
| Otras variantes del model zoo SysCV (p. ej. backbones HRNet de mayor capacidad) | no disponible | 1280 x 720 | no disponible | BDD100K / Apache-2.0 según componente | Host original `dl.cv.ethz.ch` fuera de servicio |
| Detectores de una etapa tipo YOLO entrenados en BDD100K | no disponible | variable | no disponible | variable según implementación | Múltiples repositorios |

No se dispone en la información proporcionada de resultados comparables de otros detectores sobre el mismo split para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La licencia BDD100K restringe el uso a fines educativos, de investigación y sin ánimo de lucro; el uso comercial de los pesos no está permitido sin autorización.
- La clase train tiene AP 0,0 en validación y las clases minoritarias (traffic light, motorcycle, bicycle, rider) rondan AP 25-28, por lo que el rendimiento en objetos pequeños y poco frecuentes es limitado (APs de 16,6 en validación).
- El modelo está entrenado exclusivamente con escenas de conducción de BDD100K; el dominio de aplicación fuera de ese contexto (interiores, imágenes aéreas, otras cámaras) no está validado.
- Riesgo de falsos negativos y positivos en condiciones de baja iluminación, oclusión o mal tiempo, no cuantificado en la información disponible.
- Los resultados de benchmark son los declarados por SysCV y no han sido verificados caja a caja por el autor del espejo; el entorno CUDA no estaba probado al publicarse.
- Los pesos se recuperaron de la Wayback Machine; aunque el MD5 coincide con el fichero de SysCV, conviene validar la integridad antes de usarlos en producción.
- El stack de dependencias está fijado a versiones antiguas (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y requiere un entorno virtual limpio; no es compatible con mmdetection 3.x.
- No se publican cifras de latencia, throughput ni consumo de VRAM, lo que dificulta planificar despliegues en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w18-3x
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w18-3x/blob/main/LICENSE.txt
- Model zoo de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_hrnetv2p_w18_3x_det_bdd100k.py
- Paper de HRNet: https://arxiv.org/abs/1908.07919
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
