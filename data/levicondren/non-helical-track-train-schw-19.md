# Levicondren/non-helical-track-train-schw-19

## Resumen

`non-helical-track-train-schw-19` es un par de checkpoints preentrenados para un pipeline de reconstruccion de trazas (track reconstruction) basado en redes neuronales de grafos, desarrollado por el usuario Levicondren sobre el framework ExaTrkX. El objetivo declarado es reconstruir trayectorias de particulas exoticas de larga vida ("quirks") cuyas trayectorias son no helicoidales y, por tanto, se reconstruyen mal con los ajustadores clasicos basados en helices. El checkpoint corresponde a la particion de datos `train_19_test_quirks`.

El pipeline tiene dos etapas. La primera es un modulo de metric learning (`LayerlessEmbedding`), un MLP que proyecta cada impacto del detector (hit) a un espacio latente donde los hits de una misma traza quedan agrupados; sobre ese espacio se construye un grafo de candidatos mediante busqueda kNN o por radio. La segunda es una red de paso de mensajes (`InteractionGNN`) que puntua cada arista candidata como perteneciente o no a una traza real; aplicando un umbral de score y calculando componentes conexas se obtienen las trazas finales.

No es un modelo de lenguaje: no genera texto ni tiene ventana de contexto. Es un componente de software cientifico para analisis de datos del LHC, con dos checkpoints de PyTorch Lightning que requieren el codigo del pipeline ExaTrkX para cargarse. El repositorio ocupa 0,1 GB, tiene 0 descargas y 0 likes, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: MLP de metric learning (`LayerlessEmbedding`) + red neuronal de grafos por paso de mensajes (`InteractionGNN`, 8 iteraciones de grafo) |
| Parametros totales | No disponible de forma explicita. Estimacion a partir del tamano de fichero: ~12 M parametros en el checkpoint de metric learning (~49 MB en fp32) y ~0,4 M en el de GNN (~1,5 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica: no es un modelo de lenguaje secuencial; el "contexto" es el grafo de hits por evento) |
| Tipos de cuantizacion | No disponible (solo se publican los checkpoints en precision de entrenamiento; no hay variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible (no aplica: modelo de fisica de particulas, no procesa lenguaje natural) |
| Licencia | Apache 2.0 (hereda la del framework ExaTrkX) |
| Formato de pesos | Checkpoints de PyTorch Lightning (`.ckpt`) acompanados de `hparams.yaml` |
| Framework de entrenamiento | PyTorch Lightning, dentro del pipeline Tracking-ML-Exa.TrkX |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | Particion `train_19_test_quirks` (no se detalla la composicion del dataset ni el generador de eventos) |
| Hardware de entrenamiento | No disponible (los `hparams.yaml` conservan rutas de scratch de NERSC como trazabilidad, pero no especifican GPU ni nodos) |
| Pipeline de HuggingFace | No disponible |

## Arquitectura y entrenamiento

La primera etapa, `LayerlessEmbedding`, es un MLP con dimension de embedding 12, capa oculta de 1024 unidades, 4 capas y activacion Tanh. Se entrena con una funcion de perdida de metric learning con margen 0,1, busqueda kNN con k=50 y Learning Rate 0,001. El regimen de entrenamiento declarado es `rp, hnm, norm` (random pairs, hard negative mining, normalizacion) y las aristas verdaderas se obtienen con `modulewise_true_edges`. La particion de datos es de 68.000 eventos de entrenamiento, 200 de validacion y 800 de test.

La segunda etapa, `InteractionGNN`, usa una dimension oculta de 64, 8 iteraciones de paso de mensajes, 3 capas de nodo y 3 capas de arista, agregacion `sum_max`, activacion SiLU y LayerNorm activado, con Learning Rate 0,002. La clave de verdad de referencia es `pid_signal`. La particion es de 68.000 eventos de entrenamiento, 0 de validacion y 1.000 de test. No se especifica el numero total de tokens, eventos o hits procesados durante el entrenamiento, ni si hubo etapas de RLHF/DPO (no aplicables en este dominio). La innovacion tecnica declarada es el tratamiento de trayectorias no helicoidales, que los ajustadores clasicos basados en helices no cubren bien.

## Capacidades

- Embedding metrico de impactos del detector: proyecta cada hit a un espacio latente de dimension 12 donde los hits de una misma traza se agrupan.
- Construccion de grafos de candidatos: permite generar aristas candidatas mediante busqueda kNN (k=50) o por radio en el espacio de embedding.
- Clasificacion de aristas: puntua cada arista candidata como real o falsa, con umbral configurable aguas abajo.
- Reconstruccion de trazas no helicoidales: disenado especificamente para quirks y otras particulas de larga vida cuyas trayectorias no se ajustan a una helice.
- Formacion de trazas por componentes conexas: a partir de las aristas que superan el umbral de score.
- Integracion en pipeline ExaTrkX: ambas clases (`LayerlessEmbedding`, `InteractionGNN`) se cargan mediante `load_from_checkpoint` dentro del repositorio Tracking-ML-Exa.TrkX.
- Generacion de texto: no soportada.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso en lenguaje: no soportado.
- Capacidades multilingues: no aplicables.
- Vision, audio y modos de "thinking": no soportados.

## Casos de uso

- Busqueda de fisica mas alla del modelo estandar (BSM): reconstruccion de trazas de quirks y otras particulas de larga vida en eventos simulados o reales del LHC, donde el ajuste helicoidal falla por definicion. El checkpoint esta entrenado especificamente sobre la particion de test con quirks.
- Generacion de grafos candidatos para etapas posteriores: el embedding metrico produce un espacio latente utilizable para busqueda kNN con k=50, que alimenta vertexing, ajuste fino o clasificadores de traza posteriores.
- Etiquetado de aristas en grafos de hits: la `InteractionGNN` puede usarse como clasificador binario independiente de aristas reales frente a falsas en cualquier grafo de candidatos compatible con el formato ExaTrkX.
- Estudio de sensibilidad de busquedas de particulas exoticas: comparar la eficiencia de reconstruccion entre este pipeline y un ajustador helicoidal clasico para cuantificar la perdida de senal en canales no helicoidales.
- Punto de partida para fine-tuning: al ser checkpoints de PyTorch Lightning con hiperparametros documentados en `hparams.yaml`, sirven como inicializacion para reentrenar sobre otros detectores, geometrias o generadores de eventos.
- Reproducibilidad de experimentos: los checkpoints y sus hiperparametros permiten reproducir la particion declarada (68.000/200/800 eventos en la etapa de embedding y 68.000/0/1.000 en la de GNN) y auditar la procedencia del entrenamiento.
- Desarrollo de trackers en linea (trigger): dado el tamano reducido de ambos modelos (~50 MB en total), son candidatos para integrarse en cadenas de seleccion de alta tasa de eventos, siempre que la latencia medida en el entorno destino lo permita (no hay datos de latencia publicados).
- Prototipado de algoritmos de reconstruccion no helicoidal: escenario de I+D para grupos que quieran validar la viabilidad de GNNs frente a metodos clasicos antes de invertir en entrenamientos a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (eficiencia de reconstruccion, pureza, recall, AUC de aristas ni tiempo de inferencia) en la informacion disponible. Los unicos datos cuantitativos publicados son los tamanos de las particiones de datos:

| Particion | Metric learning (`LayerlessEmbedding`) | GNN (`InteractionGNN`) |
|---|---|---|
| Entrenamiento | 68.000 | 68.000 |
| Validacion | 200 | 0 |
| Test | 800 | 1.000 |

## Requisitos de hardware

- VRAM estimada: no hay mediciones publicadas. Como referencia de orden de magnitud, los checkpoints suman ~50 MB, la etapa de embedding usa una capa oculta de 1024 y la GNN una dimension oculta de 64 con 8 iteraciones de grafo; el consumo dominante en inferencia sera el tamano del grafo de hits por evento y el tamano de lote, no los pesos.
- GPU recomendadas: no disponibles. Por el tamano del modelo, cualquier GPU con soporte CUDA (por ejemplo, gama RTX o GPUs de centro de datos tipo A100/H100) deberia poder ejecutar la inferencia; no se especifica cual se uso en entrenamiento.
- GPU de consumo: previsiblemente si, dado que el conjunto de pesos es de decenas de MB y las dimensiones ocultas son pequenas. No hay confirmacion publicada de ejecucion en hardware concreto.
- CPU: la inferencia en CPU es plausible por el tamano del modelo, pero no hay datos publicados de latencia ni de throughput.
- Opciones de despliegue: no se puede usar vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue requiere PyTorch Lightning y el codigo del pipeline Tracking-ML-Exa.TrkX (`Pipelines/TrackML_Example/LightningModules/...`), y los checkpoints no son ejecutables solo con `torch.load`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Criterio | `non-helical-track-train-schw-19` | Checkpoint de referencia de ExaTrkX (TrackML) | Ajuste helicoidal clasico (Kalman / combinatorial track finder) | Modelos GNN de terceros del ecosistema ExaTrkX |
|---|---|---|---|---|
| Parametros | Estimado ~12 M + ~0,4 M | No disponible | No aplica | No disponible |
| Contexto | No aplica (grafo de hits por evento) | No aplica | No aplica | No aplica |
| Rendimiento publicado | No disponible | No disponible | No disponible | No disponible |
| Licencia | Apache 2.0 | Apache 2.0 (framework) | Depende de la implementacion | No disponible |
| Disponibilidad | HuggingFace, 0 descargas, 0 likes | Repositorio ExaTrkX | Multiples implementaciones en software de experimentos | No disponible |
| Enfoque | Especifico para trayectorias no helicoidales (quirks) | Trayectorias helicoidales tipicas de TrackML | Asume helice; falla con trayectorias no helicoidales | Variable |

No se dispone de cifras de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes, vision ni audio. Cualquier expectativa de ese tipo es inaplicable.
- Los checkpoints no son autonomos: son `LightningModule` de PyTorch Lightning y requieren las definiciones de clase del pipeline ExaTrkX. Un `torch.load` directo devuelve un state dict no ejecutable por si solo.
- Sesgos de datos: el modelo se ha entrenado sobre una unica particion (`train_19_test_quirks`). No se documenta la composicion del dataset, el generador de eventos ni la distribucion de tipos de particula, por lo que el sesgo inductivo hacia el dominio de quirks es probable.
- Generalizacion limitada: esta especializado en trayectorias no helicoidales; su comportamiento en trazas helicoidales estandar no esta documentado y podria ser peor que el de los checkpoints de referencia de ExaTrkX.
- Riesgo de alucinacion: en el sentido de clasificacion, la GNN puede puntuar aristas falsas por encima del umbral. No hay curvas ROC, eficiencia ni tasa de falsos positivos publicadas para calibrar el umbral.
- Sin validacion en la etapa GNN: la particion de validacion de la GNN es 0, lo que limita la seleccion de hiperparametros y la deteccion de sobreajuste en esa etapa.
- Validacion estadistica escasa: 200 eventos de validacion en la etapa de embedding y 800/1.000 de test son volumenes reducidos para conclusiones robustas.
- Rutas de entrenamiento no reproducibles: los `hparams.yaml` conservan rutas de scratch de NERSC que no resuelven fuera del entorno original (no impide cargar los checkpoints, pero impide reproducir el entrenamiento tal cual).
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de ExaTrkX conviene revisar las condiciones del framework y de los datos de entrenamiento utilizados, que no se detallan.
- Sin mantenimiento ni adopcion: 0 descargas y 0 likes en el momento de la consulta, con fechas de creacion y actualizacion muy proximas entre si; no hay evidencia de uso en produccion ni de soporte del autor.
- Caveat de produccion: al no existir datos de latencia, throughput ni consumo de VRAM, no es posible dimensionar un despliegue en trigger de alta tasa sin medirlo previamente en el hardware destino.

## Enlaces

- HuggingFace: https://huggingface.co/Levicondren/non-helical-track-train-schw-19
- Framework ExaTrkX (Tracking-ML-Exa.TrkX): https://github.com/HSF-reco-and-software-triggers/Tracking-ML-Exa.TrkX
- Clases usadas por los checkpoints: `Pipelines/TrackML_Example/LightningModules/Embedding/Models/layerless_embedding.py` y `Pipelines/TrackML_Example/LightningModules/GNN/Models/interaction_gnn.py` dentro del repositorio anterior.
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante. Las busquedas devolvieron unicamente contenido sobre ChatGPT (prompts DAN, verificacion de telefono, API de ChatGPT, modelos de GitHub Copilot), sin relacion con este modelo.
