# deepsworld/mctr-mmptrack

## Resumen

MCTR (Multi Camera Tracking Transformer) es un sistema de seguimiento multiobjeto y multicámara de extremo a extremo. El repositorio `deepsworld/mctr-mmptrack` no contiene pesos preentrenados generales, sino los checkpoints ajustados que reproducen los resultados de validación sobre el conjunto MMPTracking del artículo "MCTR: Multi Camera Tracking Transformer", firmado por Alexandru Niculescu-Mizil, Deep Patel e Iain Melvin. Cada checkpoint se ajusta a un entorno concreto con un número fijo de cámaras (cafe, industry, lobby, office y retail), por lo que no existe un único modelo universal: hay un modelo por escena.

La arquitectura combina un detector de estilo DETR por cada vista de cámara, un conjunto compartido de *track embeddings* que se actualizan en cada fotograma y una asociación probabilística suave entre pistas y detecciones, entrenada con pérdidas diferenciables. El mismo checkpoint ajustado sirve para las dos variantes reportadas: MCTR, que emite las cajas de detección por vista, y MCTR-TB, que emite las cajas predichas por la cabeza de seguimiento.

Es relevante ahora porque ofrece una implementación publicada y reproducible de seguimiento multicámara en línea, fotograma a fotograma y con coste aproximadamente lineal en el número de cámaras, con checkpoints ligeros (0,23-0,26 GB cada uno) y evaluación estandarizada mediante TrackEval (HOTA, CLEAR, Identity). No es un modelo de lenguaje: no genera texto ni procesa instrucciones, y su ámbito de aplicación es la visión por computador sobre vídeo multivista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de estilo DETR para deteccion por vista + *track embeddings* compartidas y asociacion probabilistica pista-deteccion (MCTR) |
| Parametros totales | no disponible (el autor no publica el recuento; el checkpoint pesa ~233 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la memoria temporal la aportan las *track embeddings* actualizadas por fotograma) |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en el formato original de entrenamiento) |
| Idiomas soportados | no aplica como capacidad; las etiquetas del repositorio indican `en` y toda la documentacion esta en ingles |
| Licencia | BSD-3-Clause |
| Formato de pesos | `.pth` de PyTorch (`torch.save` de un diccionario con las claves `cfg`, `state_dict`, `loss` y `epoch`); no hay safetensors ni GGUF |
| Variantes | MCTR (cajas de deteccion por vista) y MCTR-TB (cajas predichas por la cabeza de seguimiento), ambas desde el mismo checkpoint |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

Checkpoints incluidos:

| Escena | Camaras | Fichero | Tamano (GB) |
|---|---|---|---|
| cafe | 4 | `cafe/mctr_cafe_epoch99.pth` | 0,23 |
| industry | 4 | `industry/mctr_industry_epoch99.pth` | 0,23 |
| lobby | 4 | `lobby/mctr_lobby_epoch99.pth` | 0,23 |
| office | 5 | `office/mctr_office_epoch99.pth` | 0,25 |
| retail | 6 | `retail/mctr_retail_epoch99.pth` | 0,26 |

Cada carpeta de escena incluye ademas `train_config.yaml` (configuracion exacta del entrenamiento) y `metrics.json` (procedencia y metricas).

## Arquitectura y entrenamiento

MCTR es un *tracker* multicámara de extremo a extremo. Por cada vista de cámara se ejecuta un detector de estilo DETR; sobre el conjunto de vistas se mantiene un conjunto compartido de *track embeddings* que se actualizan en cada fotograma, y la asociación entre pistas y detecciones se modela de forma probabilística y suave, de modo que el emparejamiento se aprende con pérdidas diferenciables en lugar de resolverse con un algoritmo de asignación externo. La inferencia es en línea, fotograma a fotograma, con tamaño de lote 1 y `keep_prob=0.9`, y el coste crece de forma aproximadamente lineal con el número de cámaras.

Cada checkpoint corresponde a la época 99 de un ajuste fino de 100 épocas que sigue un protocolo de entrenamiento en dos etapas (`pairwise_init.yaml` → `pairwise.yaml`). El ajuste se realiza sobre un único entorno con un número fijo de cámaras y un conjunto de clips determinado, y esa configuración queda embebida en el checkpoint (clave `cfg`), de manera que el número de cámaras y los clips no son intercambiables entre escenas. El autor indica que los checkpoints reproducen los resultados de validación de MMPTracking del artículo, aunque no se proporcionan cifras concretas en la información disponible. No se detalla en la model card el volumen de tokens o fotogramas de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de alineación tipo RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje).

## Capacidades

- Deteccion de objetos por vista: un detector DETR por cada camara, con salida de cajas por fotograma.
- Seguimiento multiobjeto multicamara en linea: mantiene identidades coherentes entre camaras mediante *track embeddings* compartidas.
- Asociacion pista-deteccion aprendida: la correspondencia entre detecciones y pistas se resuelve con un modulo probabilistico entrenado de forma diferenciable.
- Dos modos de salida: MCTR devuelve las cajas de deteccion por vista y MCTR-TB las cajas predichas por la cabeza de seguimiento.
- Escalabilidad en numero de camaras: hay checkpoints para configuraciones de 4, 5 y 6 camaras, con coste aproximadamente lineal.
- Evaluacion integrada: los scripts generan ficheros de *tracklets* y llaman a TrackEval para calcular HOTA, CLEAR e Identity sin preprocesado.
- Escritura de resultados estandar: salida compatible con el formato del reto MOT para su evaluacion.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, *tool calling*, capacidades de agente, audio ni comprension de lenguaje natural.

## Casos de uso

- Videovigilancia en comercio minorista: el checkpoint `retail` cubre 6 cámaras y permite seguir a cada cliente entre pasillos para calcular tiempos de permanencia, recorridos y mapas de calor por zona, sin reidentificacion facial.
- Control de aforo y flujos en oficinas: el checkpoint `office` (5 cámaras) sirve para medir ocupacion por planta y detectar acumulaciones en zonas comunes o salidas de emergencia.
- Seguridad en entornos industriales: el checkpoint `industry` (4 cámaras) permite verificar el cumplimiento de zonas restringidas y seguir la trayectoria de operarios y vehiculos dentro de la planta.
- Analitica de clientes en hosteleria: el checkpoint `cafe` (4 cámaras) es adecuado para medir colas en barra, tiempo de espera y rotacion de mesas a partir de las trayectorias.
- Monitorizacion de personas en vestibulos y recepciones: el checkpoint `lobby` (4 cámaras) permite seguir el trafico de entrada y salida y detectar permanencias anomales.
- Investigacion en seguimiento multicamara: el repositorio sirve como base reproducible para comparar variantes de asociacion pista-deteccion y para extender el metodo a nuevas escenas con el protocolo de dos etapas.
- Prototipado de analitica de video en produccion: al pesar ~233 MB por checkpoint y ejecutarse en linea con lote 1, puede desplegarse en un nodo con GPU modesta y alimentar un bus de eventos con las trayectorias.
- Evaluacion comparativa de *trackers*: la integracion con TrackEval permite usar estos checkpoints como referencia en experimentos con el protocolo HOTA/CLEAR/Identity.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los checkpoints reproducen los resultados de validacion de MMPTracking del articulo y que cada carpeta incluye un `metrics.json` con metricas de referencia y de reproduccion, pero no se facilitan las cifras concretas ni la comparacion con otros sistemas. Tampoco se proporcionan datos de latencia o *throughput*.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa ~233 MB; asumiendo pesos en fp32, equivaldria a unos 58 millones de parametros (estimacion derivada del tamano del fichero, no confirmada por el autor). Con lote 1 y resoluciones tipicas de video de vigilancia, la inferencia completa con activaciones del detector deberia caber en el rango de 2 a 4 GB de VRAM, aunque no hay medicion publicada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de memoria es suficiente para una escena; A100 o H100 solo serian necesarias para entrenamiento o para ejecutar varias escenas en paralelo.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de gama media y alta como RTX 3060, RTX 4060 o RTX 4090; incluso GPUs de gama de entrada con 4 GB podrian servir para una unica escena.
- Escalado por camaras: el coste es aproximadamente lineal con el numero de camaras, por lo que los checkpoints de 6 camaras (`retail`) son los mas exigentes.
- Opciones de despliegue: scripts nativos de PyTorch del repositorio (`scripts/trackeval_mmptrack.py` y `scripts/trackeval_trackbox_mmptrack.py`), entorno conda/mamba `mcmot39` y submodulo `submodules/trackeval` para la evaluacion. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. No se documenta exportacion a ONNX, TensorRT u otros *runtimes*.
- Latencia y throughput: no disponible. Se sabe que la inferencia es en linea, fotograma a fotograma, con tamano de lote 1 y `keep_prob=0.9`.
- Configuracion de datos: los scripts de evaluacion asumen la raiz `/net/mlfs02/data/projects/shared/datasets/MMPTracking/` y la disposicion de clips por escena con submuestreo `64pm`; es necesario editar `cfg.DATASET.ROOT` para apuntar a la copia local del conjunto de datos.

## Comparativa con modelos similares

No se dispone de datos de modelos alternativos en la informacion proporcionada, por lo que la comparativa con otros sistemas de seguimiento multicamara queda como no disponible. Tampoco procede compararlo con modelos de lenguaje: MCTR no genera texto ni acepta instrucciones en lenguaje natural. La unica comparacion posible con los datos disponibles es interna, entre las dos variantes que comparten checkpoint:

| Variante | Salida | Script de evaluacion | Checkpoint |
|---|---|---|---|
| MCTR | Cajas de deteccion por vista | `scripts/trackeval_mmptrack.py` | El mismo `.pth` ajustado por escena |
| MCTR-TB | Cajas predichas por la cabeza de seguimiento | `scripts/trackeval_trackbox_mmptrack.py` | El mismo `.pth` ajustado por escena |

## Limitaciones y advertencias

- Un modelo por escena: cada checkpoint se ajusta a un entorno con un numero fijo de camaras y un conjunto de clips concreto; no es un modelo generalizable sin reentrenamiento.
- Ausencia de cifras publicadas: la model card no incluye resultados numericos de HOTA, CLEAR o Identity, solo la referencia a que se reproducen los del articulo, por lo que el rendimiento real debe verificarse ejecutando la evaluacion.
- Conteo de parametros no confirmado: la estimacion de ~58 millones de parametros es una derivacion del tamano del fichero, no un dato del autor.
- Dependencia del conjunto de datos MMPTracking: los scripts asumen una ruta absoluta y una disposicion de clips especifica; es obligatorio ajustar `cfg.DATASET.ROOT` y el formato de datos.
- Dependencia del entorno de entrenamiento: la carga del checkpoint usa `main_pairwise._build_model` con `strict=True` y requiere el codigo del repositorio `necla-ml/mctr`, por lo que no es un fichero portable a otros *frameworks* sin conversion.
- Sin cuantizaciones publicadas: no hay versiones en fp16, int8 ni formatos ligeros oficiales; cualquier optimizacion corre por cuenta del usuario.
- Riesgo de alucinacion y sesgos: no aplica el concepto de alucinacion textual, pero si los sesgos clasicos de los detectores visuales (falsos positivos y negativos ante oclusiones, cambios de iluminacion o personas con apariencia similar), que pueden derivar en intercambios de identidad (*ID switches*) entre camaras.
- Privacidad y cumplimiento: el seguimiento de personas en video esta sujeto al RGPD y a la normativa aplicable; la licencia del software no exime de las obligaciones legales sobre los datos tratados.
- Licencia permisiva con condiciones: BSD-3-Clause permite uso comercial, pero exige conservar el aviso de copyright y la clausula de exencion de responsabilidad, y prohibe usar el nombre de los titulares para promocionar productos derivados sin permiso.
- Cero adopcion observable: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni de soporte de la comunidad.
- Idiomas: aunque la etiqueta sea `en`, el modelo no procesa lenguaje; la limitacion es exclusivamente documental.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/deepsworld/mctr-mmptrack
- Articulo: https://arxiv.org/abs/2408.13243
- Codigo oficial: https://github.com/necla-ml/mctr
- TrackEval (submodulo de evaluacion): incluido en el repositorio de codigo, en `submodules/trackeval`
