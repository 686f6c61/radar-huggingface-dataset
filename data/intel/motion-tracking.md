# Intel/motion-tracking

## Resumen

Motion Tracking es un caso de uso de analitica para entornos metro (estaciones, andenes e intersecciones) publicado por Intel en Hugging Face. Combina un detector de objetos en tiempo real con un rastreador multiobjeto para asignar identificadores persistentes (`track_id`) a cada objeto detectado a lo largo de los fotogramas, lo que permite analizar trayectorias, calcular tiempos de permanencia y disparar eventos por zona. No es un modelo de lenguaje ni un transformer generativo: es un pipeline de vision por computador empaquetado como artefacto OpenVINO.

El componente de deteccion por defecto es YOLO26 de Ultralytics, exportado a OpenVINO IR y disponible en cuatro variantes (`yolo26n`, `yolo26s`, `yolo26m`, `yolo26l`) con precisiones FP32, FP16 e INT8. Como alternativa se ofrece DETR (`detr-resnet-50` de Facebook), un detector transformer sin NMS y con licencia Apache-2.0, mas pesado y con menor tasa de fotogramas. El rastreo lo aporta el elemento `gvatrack` de Intel DLStreamer, con `tracking-type=short-term-imageless` (filtro de Kalman sin datos de imagen) como opcion por defecto y `deep-sort` como alternativa con reidentificacion mediante un modelo de extraccion de caracteristicas.

Su relevancia actual reside en que permite desplegar analitica de video con identificadores de trayectoria sobre CPU, GPU y NPU de Intel usando un stack de inferencia unificado (OpenVINO + DLStreamer), sin depender de GPUs de gran formato. El repositorio es de tamano practicamente nulo (0.0 GB) porque contiene scripts de exportacion y cuantizacion, no los pesos; el modelo se descarga y se convierte en el momento de la puesta en marcha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de deteccion + rastreo: YOLO26 (CNN, por defecto) o DETR (transformer, alternativa) + DLStreamer `gvatrack` (filtro de Kalman) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen 640x640 en YOLO26 y 800x800 en DETR) |
| Tipos de cuantizacion | FP32, FP16, INT8 (cuantizacion post-entrenamiento con NNCF) |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | MIT (repositorio); los pesos base tienen licencia propia: YOLO26 AGPL-3.0, DETR Apache-2.0 |
| Formato de pesos | OpenVINO IR (exportado desde PyTorch: Ultralytics para YOLO26, Hugging Face Transformers para DETR) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo propio: actua como envoltorio de exportacion y orquestacion. El detector YOLO26 se obtiene de Ultralytics y se convierte a OpenVINO IR; el detector DETR se obtiene de `facebook/detr-resnet-50` y el script de exportacion integra en el IR la normalizacion, la decodificacion de cajas y el remapeo de clases, de modo que ambos modelos producen el mismo formato de salida y los mismos identificadores de clase. La salida de YOLO26 es `[1, 300, 6]` con entrada de 640x640; la de DETR es `[1, 100, 6]` con entrada de 800x800. En ambos casos el detector cubre por defecto las 80 clases de COCO, configurable.

La parte de rastreo se delega en DLStreamer. El modo `short-term-imageless` usa un filtro de Kalman que no requiere datos de imagen y asigna un `track_id` unico que persiste mientras el objeto siga visible. El modo `deep-sort` anade reidentificacion mediante un modelo de extraccion de caracteristicas (por ejemplo `mars-small128`), lo que mejora la robustez ante oclusiones a costa de mas computo. La cuantizacion INT8 se realiza con NNCF en modo post-entrenamiento y precision mixta. No se documentan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que se trata de modelos preentrenados de terceros.

## Capacidades

- Deteccion de objetos en tiempo real sobre las 80 clases de COCO (configurable) con YOLO26 o DETR.
- Asignacion de identificadores de rastreo persistentes (`track_id`) por objeto a lo largo de los fotogramas.
- Generacion de trayectorias por objeto, aptas para analisis de caminos y calculo de tiempos de permanencia.
- Deteccion de eventos basada en zonas: activacion de alertas cuando un objeto rastreado entra o sale de un area definida.
- Reidentificacion opcional mediante `deep-sort` con modelo de caracteristicas.
- Ejecucion sobre CPU, GPU y NPU de Intel con el mismo artefacto OpenVINO.
- Soporte de precisiones FP32, FP16 e INT8 para ajustar latencia y consumo.
- Capacidades multilingues: no disponibles (el modelo no procesa texto; las etiquetas de clase son las de COCO en ingles).
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Analisis de trayectorias de peatones en estaciones: el pipeline asigna un `track_id` a cada viandante y registra su recorrido fotograma a fotograma, lo que permite mapear flujos de circulacion y detectar cuellos de botella en andenes y pasillos.
- Medicion de tiempos de permanencia: al mantener el identificador mientras el objeto es visible, se puede calcular cuanto tiempo pasa una persona en una zona concreta y derivar metricas de ocupacion o de espera en colas.
- Deteccion de eventos por zona: con areas definidas sobre el video, el sistema dispara alertas cuando un objeto rastreado cruza un limite, lo que sirve para control de aforo, zonas restringidas o avisos de seguridad.
- Analitica de flujo de trafico en intersecciones: el rastreo de vehiculos a traves de un cruce permite obtener conteos direccionales y alimentar la optimizacion de tiempos de semaforo.
- Reproduccion forense de incidentes: la reconstruccion de las trayectorias de todos los objetos de una secuencia facilita la revision posterior de un evento y la correlacion temporal entre sujetos.
- Despliegue en dispositivos de borde sin GPU dedicada: al ejecutarse sobre CPU y NPU de Intel con cuantizacion INT8, el pipeline puede correr en equipos de campo o en gabinetes de comunicaciones con presupuesto termico y energetico limitado.
- Procesamiento por lotes de grabaciones para auditoria: la exportacion a OpenVINO IR permite ejecutar el detector sobre archivos de video historicos y extraer estadisticas agregadas de ocupacion fuera de linea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una matriz de validacion de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un detector pequeno (variantes `n` y `s` de YOLO26) y de un pipeline de vision, el consumo de memoria es muy inferior al de un LLM; no se documentan cifras.
- GPU recomendadas: no se especifican modelos concretos; el stack objetivo son CPU, GPU y NPU de Intel.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el pipeline esta disenado para el ecosistema OpenVINO/DLStreamer sobre hardware Intel.
- Opciones de despliegue: OpenVINO Runtime e Intel DLStreamer. Stack objetivo: DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030 y OpenVINO Runtime 2026.5.0.dev20261030 (version de desarrollo, no estable). Requiere Python 3.11+ y `ffmpeg` para codificar el video de salida.
- Latencia y throughput: no disponibles. La model card recomienda las variantes `yolo26n` y `yolo26s` para despliegues de alto FPS en el borde, y senala que DETR es mas pesado y opera a menor tasa de fotogramas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26 (por defecto) | Detector CNN | 640x640 | `[1, 300, 6]` | AGPL-3.0 | Maximo throughput en el borde; variantes n, s, m, l |
| DETR (`detr-resnet-50`) | Detector transformer sin NMS | 800x800 | `[1, 100, 6]` | Apache-2.0 | Mas pesado, menor tasa de fotogramas, licencia permisiva |
| Rastreador `short-term-imageless` | Filtro de Kalman | no aplica | `track_id` por objeto | incluido en DLStreamer | Sin datos de imagen; opcion por defecto |
| Rastreador `deep-sort` | Kalman + extraccion de caracteristicas | no aplica | `track_id` por objeto | incluido en DLStreamer | Reidentificacion mas robusta ante oclusiones |

No se dispone de datos de rendimiento comparado con otros pipelines de deteccion y rastreo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es necesario ejecutar `export_and_quantize.sh` para descargar y convertir los modelos, lo que requiere conexion a red y dependencias adicionales (`ultralytics`, `transformers`, `torch`, `nncf`).
- El stack objetivo es una version de desarrollo (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev), no una release estable; no es apto para produccion sin validacion previa.
- La licencia MIT del repositorio no cubre los pesos base: YOLO26 se distribuye bajo AGPL-3.0, lo que impone obligaciones de copyleft en servicios en red si se usa esa variante. DETR (Apache-2.0) es la opcion si se requiere una licencia permisiva.
- El rastreo `short-term-imageless` no realiza reidentificacion: si un objeto sale del encuadre y vuelve a entrar, recibe un `track_id` nuevo, lo que rompe el analisis de trayectorias largas.
- El detector esta limitado a las clases de COCO por defecto; el reconocimiento de clases fuera de ese conjunto requiere reentrenamiento o un modelo distinto.
- Riesgo de falsos positivos y de perdida de deteccion en condiciones de oclusion, baja iluminacion o aglomeracion, habituales en entornos metro.
- No se documentan sesgos demograficos del detector base; al tratarse de modelos de terceros, la evaluacion de sesgo queda fuera del alcance de este repositorio.
- El modelo solo procesa imagenes y video; no admite texto ni instrucciones en lenguaje natural. El unico idioma declarado es el ingles en etiquetas y documentacion.
- No se han publicado cifras de latencia, throughput ni benchmarks de precision en la informacion disponible, por lo que cualquier estimacion de produccion debe medirse en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/motion-tracking
- YOLO26 (Ultralytics): https://docs.ultralytics.com/models/yolo26/
- DETR ResNet-50 (Facebook): https://huggingface.co/facebook/detr-resnet-50
- Paper de DETR: https://arxiv.org/abs/2005.12872
- Instalacion de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Instalacion de Intel DLStreamer: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Script de exportacion y cuantizacion: https://huggingface.co/Intel/motion-tracking/resolve/main/export_and_quantize.sh
