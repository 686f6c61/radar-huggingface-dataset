# dronefreak/bdd100k-syscv-dla34-5x-224x224-weather

## Resumen

DLA-34 Weather Tagging es un clasificador de imágenes especializado en etiquetar las condiciones meteorológicas de escenas de conducción. Asigna a cada fotograma una de siete etiquetas: rainy, snowy, clear, overcast, undefined, partly cloudy o foggy. El modelo original procede del zoo de modelos de BDD100K publicado por SysCV (ETH Zurich), y este repositorio es un espejo que recupera los pesos desde la Wayback Machine tras la caída del host `dl.cv.ethz.ch`, añadiendo un entorno fijado y un script de inferencia reproducible.

La arquitectura es una DLA-34 (Deep Layer Aggregation, CVPR 2018) configurada como clasificador con una `ClsHead` de mmcls. Cuenta con 15.290.679 parámetros y trabaja sobre recortes de 224x224 píxeles obtenidos tras redimensionar el lado corto a 256. No es un modelo generativo ni un LLM: es una CNN de clasificación pensada como componente auxiliar en pipelines de conducción autónoma, donde la etiqueta meteorológica condiciona el comportamiento de detectores, segmentadores y planificadores.

Su relevancia actual es doble. Por un lado, preserva un checkpoint que había quedado inaccesible y verifica que la reproducción es exacta: sobre las 10.000 imágenes de validación, las etiquetas coinciden con las predicciones publicadas por SysCV y las puntuaciones por clase difieren como máximo en 2e-06. Por otro, ofrece un entorno reproducible (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0) con soporte de GPU y CPU, algo poco habitual en espejos de modelos antiguos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DLA-34 (Deep Layer Aggregation, CVPR 2018) con ClsHead de mmcls |
| Parametros totales | 15.290.679 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagen; entrada 224x224 tras resize de lado corto a 256) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y .pth en fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades linguisticas) |
| Licencia | bdd100k (educational, research and not-for-profit use); config y codigo DLA de SysCV bajo Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth` equivalente; config en `config.json` y `original_config.py` |
| Libreria | mmcls 0.25.0 |
| Entrada | RGB, media y desviacion estandar de ImageNet, recorte central 224x224 |
| Clases | 7: rainy, snowy, clear, overcast, undefined, partly cloudy, foggy |
| Tamano del repo | 0.1 GB |

## Arquitectura y entrenamiento

El modelo es una DLA-34, una red convolucional con agregacion profunda de capas que combina conexiones jerarquicas e iterativas para fusionar caracteristicas a varias escalas. Sobre el backbone se monta una `ClsHead` de mmcls que produce logits para las siete clases meteorologicas. La entrada se normaliza con la media y desviacion estandar de ImageNet y se procesa como recorte central de 224x224 tras redimensionar el lado corto a 256 (una imagen 1280x720 queda en 455x256 antes del recorte).

El entrenamiento se realizo sobre las 70.000 imagenes de train de BDD100K durante 60 epocas (esquema 5x), con SGD de learning rate 0.1, momentum 0.9 y weight decay 0.0001, decaimiento del learning rate en las epocas 30 y 45, batch de 128 (4 GPUs x 32 imagenes) y aumentacion de datos consistente en recortes aleatorios redimensionados a 224x224 y volteos horizontales. El config no fija pesos preentrenados para el backbone, por lo que la DLA-34 se entrena desde cero sobre BDD100K. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, al no tratarse de un modelo generativo.

## Capacidades

- Clasificacion de imagen en 7 clases meteorologicas: rainy, snowy, clear, overcast, undefined, partly cloudy y foggy.
- Etiquetado por fotograma en imagenes sueltas, carpetas de imagenes, ficheros de video y webcam (via `infer.py`).
- Salida de la etiqueta top-1 y de todas las puntuaciones por clase, exportable a JSON con `--json out.json`.
- Procesamiento por lotes con limite configurable de fotogramas (`--max-frames N`).
- Ejecucion en GPU (CUDA 11.8) y en CPU, con entornos separados y fijados.
- Carga de pesos con `torch.load(weights_only=True)`, lo que reduce el riesgo de ejecucion de codigo arbitrario al cargar el checkpoint.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un clasificador visual.

## Casos de uso

- Etiquetado automatico de datasets de conduccion: procesar lotes de imagenes o videos con `infer.py` para anadir la etiqueta meteorologica a cada fotograma y enriquecer anotaciones existentes de BDD100K u otros datasets de escenas viales.
- Enrutado condicional en pipelines de percepcion: usar la etiqueta de clima para seleccionar el detector o segmentador adecuado (por ejemplo, un modelo entrenado especificamente para lluvia o nieve) antes de ejecutar la etapa principal.
- Monitorizacion de flotas y validacion de grabaciones: clasificar clips de camara de vehiculos para detectar condiciones adversas y priorizar revision manual o alertas operativas.
- Filtrado de datos para entrenamiento: descartar o agrupar imagenes por condicion meteorologica antes de entrenar otros modelos, mejorando el balance del dataset y la cobertura de escenarios dificiles.
- Analisis de robustez: evaluar como varian las metricas de un sistema de conduccion autonomo por condicion meteorologica usando esta etiqueta como variable de segmentacion.
- Prototipado rapido en CPU: con 0,02 s/imagen en 8 hilos de CPU, permite integrar el etiquetado en entornos sin GPU o en etapas de preprocesado de bajo coste.
- Reproduccion de investigacion: replicar los resultados de SysCV sobre BDD100K val y test con un entorno fijado y verificacion de MD5, util para comparaciones justas en publicaciones.

## Benchmarks y rendimiento

Resultados declarados por SysCV y reproducidos por el espejo (accuracy en %, precision, recall y F1 son medias macro sobre las 7 clases, incluida `undefined`):

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 81,35 | 79,46 | 62,67 | 65,09 |
| test | 81,24 | 75,21 | 63,12 | 66,00 |

Verificacion de la reproduccion: sobre las 10.000 imagenes de val, la etiqueta coincide con las predicciones publicadas por SysCV en todas las imagenes y cada puntuacion por clase difiere como maximo en 2e-06 (GPU, CUDA 11.8, RTX 4070 SUPER, TF32 desactivado). En CPU, sobre 20 imagenes de val, las etiquetas coinciden y la mayor diferencia de puntuacion es 8e-07. El MD5 de los pesos (`dbd95bed0aad984fad7d552cc4ec813c`) coincide con el de SysCV.

Rendimiento: 0,005 s/imagen en una RTX 4070 SUPER (incluyendo decodificacion JPEG) y 0,02 s/imagen en 8 hilos de CPU.

## Requisitos de hardware

- VRAM estimada: muy reducida; el modelo tiene 15,3 M de parametros en fp32 (aproximadamente 61 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: RTX 4070 SUPER (medida de referencia del autor), RTX 4090, A100, H100; cualquier GPU con soporte CUDA 11.8 es suficiente.
- Cabe en GPU consumer: si, sin restricciones practicas de memoria; tambien funciona en CPU.
- Despliegue: script `infer.py` incluido (imagen, carpeta, video, webcam); entornos `env/requirements-cu118.txt` (GPU) y `env/requirements-cpu.txt` (CPU) sobre Python 3.10 con torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: 0,005 s/imagen en RTX 4070 SUPER (unas 200 imagenes/s en regimen ideal, sin paralelizacion por lotes documentada) y 0,02 s/imagen en 8 hilos de CPU (unas 50 imagenes/s).

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos de etiquetado meteorologico sobre BDD100K, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto/entrada | Top-1 val (BDD100K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DLA-34 weather (este modelo) | 15,3 M | 224x224 | 81,35 | bdd100k (solo investigacion) | Hugging Face (espejo verificado) |
| Otros modelos del zoo SysCV BDD100K | no disponible | no disponible | no disponible | no disponible | no disponible |
| Clasificadores meteorologicos alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se entrenaron sobre BDD100K y heredan su licencia, limitada a uso educativo, de investigacion y sin animo de lucro. El uso comercial requiere revisar `LICENSE.txt` y probablemente negociar una licencia aparte con los titulares de BDD100K.
- Clasificacion de una sola etiqueta por imagen: no modela condiciones mixtas o transitorias (por ejemplo, lluvia ligera con niebla) y la clase `undefined` absorbe casos ambiguos, lo que penaliza el recall macro (62,67 en val).
- Precision y recall macro moderados: aunque la accuracy top-1 supera el 81 %, el F1 macro de 65,09 en val indica desequilibrio entre clases; conviene revisar el rendimiento por clase antes de usarlo en produccion.
- Sin pesos preentrenados en el backbone: la DLA-34 se entreno desde cero, lo que puede limitar la generalizacion fuera de la distribucion de BDD100K (otras camaras, paises, horarios o resoluciones).
- Entrada fija de 224x224 tras recorte central: detalles pequenos o condiciones sutiles en los bordes de la imagen pueden perderse; no hay soporte documentado para otras resoluciones.
- Sin capacidades linguisticas, de razonamiento ni de tool calling: no debe plantearse como sustituto de un modelo multimodal o de un LLM.
- Dependencia de un entorno antiguo: torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 sobre Python 3.10; requiere un venv limpio y puede entrar en conflicto con stacks modernos.
- Riesgo de confusion en condiciones visualmente similares (por ejemplo, overcast frente a foggy o partly cloudy); se recomienda umbral de confianza y validacion por clase.
- Modelo espejo mantenido por un tercero (`dronefreak`), no por SysCV; la trazabilidad depende del MD5 publicado y de la captura de Wayback Machine.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-dla34-5x-224x224-weather
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-dla34-5x-224x224-weather/blob/main/LICENSE.txt
- Zoo de modelos SysCV BDD100K (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/dla34_5x_224x224_weather_tag_bdd100k.py
- Paper de DLA (Deep Layer Aggregation, CVPR 2018): https://arxiv.org/abs/1707.06484
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
