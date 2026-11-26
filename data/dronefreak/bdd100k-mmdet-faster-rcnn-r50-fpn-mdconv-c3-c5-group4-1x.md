# dronefreak/bdd100k-mmdet-faster-rcnn-r50-fpn-mdconv-c3-c5-group4-1x

## Resumen

El modelo `dronefreak/bdd100k-mmdet-faster-rcnn-r50-fpn-mdconv-c3-c5-group4-1x` es un espejo (mirror) del checkpoint baseline oficial de deteccion de objetos de BDD100K publicado en 2020 por el equipo de BDD100K en el servidor de descargas de Berkeley. Se trata de un Faster R-CNN con backbone ResNet-50 modificado mediante convoluciones deformables moduladas (MDCN, grupo 4) en las etapas c3 a c5, combinado con un cuello FPN, entrenado con el esquema 1x de mmdetection sobre el conjunto de datos de conduccion autonoma BDD100K.

El valor principal de esta publicacion no es el rendimiento bruto, sino la preservacion: el autor ha fijado un entorno reproducible (Python 3.10, PyTorch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) e incluye un script de inferencia (`infer.py`) para que un checkpoint de 2020 siga ejecutandose en hardware actual. Ademas, aporta verificacion de integridad (SHA-256) y una comprobacion de reproduccion exacta contra las predicciones originales de los autores sobre imagenes de test.

Con 44,9 millones de parametros y un tamano de repositorio de 0,8 GB, es un modelo de deteccion de objetos de escala media, orientado a escenas de conduccion (dia y noche), con licencia BDD100K y sin capacidades de generacion de texto ni de razonamiento linguistico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con ResNet-50 + convoluciones deformables moduladas (MDCN, grupo 4) en c3-c5 + FPN |
| Parametros totales | 44.932.478 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF ni INT8) |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`) |
| Formato de pesos | safetensors (libreria mmdetection; checkpoint original en formato PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un detector de dos etapas Faster R-CNN. El backbone es una ResNet-50 en la que las etapas c3, c4 y c5 incorporan convoluciones deformables moduladas (Modulated Deformable Convolution, MDCN) con grupo 4, lo que permite al modelo adaptar los campos receptivos a la geometria variable de los objetos en escenas de trafico. Sobre el backbone se aplica un cuello Feature Pyramid Network (FPN) que alimenta la cabeza de region proposal (RPN) y la cabeza de clasificacion y regresion de cajas.

El entrenamiento se realizo con el esquema 1x de mmdetection sobre BDD100K, usando PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.3 y mmdetection 2.4.0 sobre GPUs TITAN Xp, segun los metadatos registrados en el propio checkpoint. No se documentan en la informacion disponible el numero de tokens (no aplica), la composicion detallada del dataset ni si hubo etapas de refinamiento posteriores. El checkpoint original fue publicado sin documentacion; esta model card reconstruye la informacion leyendo el propio fichero de pesos y probando la copia.

## Capacidades

- Deteccion de objetos en imagenes y video de escenas de conduccion (clases de BDD100K: peatones, vehiculos, senales de trafico, semaforos, etc.).
- Inferencia sobre imagen individual, carpetas de imagenes, ficheros de video y webcam (segun el script `infer.py`).
- Exportacion de detecciones en formato BDD100K (pixeles, `x1 y1 x2 y2`) mediante `--json`.
- Ajuste del umbral de puntuacion (`--score-thr`, por defecto 0,3) y limite de fotogramas (`--max-frames`).
- Carga segura de pesos con `torch.load(weights_only=True)`, sin ejecucion de codigo arbitrario.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento (thinking mode).
- No dispone de vision multimodal ni audio: es un detector puro, no un modelo generativo.

## Casos de uso

- Deteccion de peatones y vehiculos en video de trafico: el modelo procesa ficheros de video completos con `infer.py` y devuelve cajas con puntuacion, adecuado para prototipos de analisis de escenas viales diurnas y nocturnas.
- Baseline de referencia para investigación en deteccion sobre BDD100K: sirve como punto de comparacion reproducible (mAP@50:95 de 26,2 en validacion) para nuevos detectores entrenados sobre el mismo dataset.
- Reproduccion de resultados academicos: la verificacion de integridad (SHA-256) y la comprobacion de reproduccion exacta contra las predicciones de los autores permiten reutilizarlo en estudios que necesiten replicar el baseline de 2020.
- Anotacion asistida de datasets de conduccion: las detecciones exportadas en formato BDD100K (`--json`) pueden usarse como preanotaciones para acelerar el etiquetado manual de nuevas imagenes.
- Analisis de escenas nocturnas: el modelo fue entrenado sobre BDD100K, que incluye clips nocturnos, y la model card muestra demos sobre clips de dia y de noche no usados en entrenamiento.
- Despliegue en entornos con recursos limitados: con 44,9 M de parametros y un repositorio de 0,8 GB, puede ejecutarse en CPU (entorno verificado) o en GPU consumer, lo que facilita pruebas en estaciones de trabajo sin aceleradores de gama alta.
- Integracion en pipelines de vision clasicos: al usar mmdetection 2.x, encaja en flujos existentes de OpenMMLab para deteccion y puede combinarse con otros componentes del ecosistema.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), sobre el split de validacion de BDD100K:

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 26,2 |
| mAP@50 (val) | 51,1 |
| mAP@75 (val) | 22,8 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (por ejemplo, comparativas con otros detectores sobre el mismo split).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 44,9 M de parametros y pesos en safetensors, la huella es moderada y cabe holgadamente en GPUs consumer.
- GPU recomendadas: no se especifican en la informacion disponible; el entrenamiento original uso TITAN Xp. El entorno CUDA 11.8 esta preparado pero no verificado segun la model card.
- Cabe en GPU consumer: si, por el tamano del modelo (repositorio de 0,8 GB); no se detallan modelos concretos.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 (entorno fijado en `env/requirements-cu118.txt` o `env/requirements-cpu.txt`); script `infer.py` para imagen, carpeta, video y webcam. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector).
- Latencia y throughput: no disponibles. Solo se verifica el entorno CPU; el entorno CUDA 11.8 no se ha ejecutado aun.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros detectores comparables (parametros, contexto, rendimiento, licencia y disponibilidad) sobre BDD100K. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | mAP@50:95 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN R50-FPN MDCN 1x) | 44,9 M | No aplica | 26,2 | BDD100K | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un detector de objetos, no un modelo linguistico: no genera texto, no razona y no soporta tool calling ni agentes.
- El rendimiento es modesto (mAP@50:95 de 26,2 en validacion); no es adecuado como sistema de deteccion de produccion de alta precision sin fine-tuning o sustitucion por detectores mas modernos.
- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse sobre BDD100K, hereda la distribucion geografica y de condiciones de captura de ese dataset.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero puede producir falsos positivos y cajas imprecisas, especialmente en condiciones no representadas en entrenamiento.
- Limitaciones de contexto o idioma: no aplica (modelo de vision); las clases detectables estan limitadas a las de BDD100K.
- Restricciones de licencia: la licencia es BDD100K (`license: other`), con terminos propios enlazados en el repositorio; debe revisarse antes de cualquier uso comercial.
- Caveat de produccion: requiere el stack antiguo de mmdetection 2.x (la linea 3.x cambio formato de configuracion y codigo del modelo); el entorno CUDA 11.8 no esta verificado y solo se ha probado el entorno CPU.
- El checkpoint original fue publicado sin documentacion; esta model card es la unica documentacion disponible y parte de ella procede de pruebas del autor del espejo.
- La ruta de webcam usa el mismo bucle de captura que los videos pero no se probo con una camara real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r50-fpn-mdconv-c3-c5-group4-1x
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r50-fpn-mdconv-c3-c5-group4-1x/blob/main/LICENSE.txt
- Dataset referenciado: https://huggingface.co/datasets/dronefreak/BDD100K
- Poster de la demo: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r50-fpn-mdconv-c3-c5-group4-1x/resolve/main/assets/demo_banner_poster.jpg
- Video de la demo: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r50-fpn-mdconv-c3-c5-group4-1x/resolve/main/assets/demo_banner.mp4
