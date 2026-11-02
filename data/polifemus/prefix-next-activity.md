# Polifemus/prefix-next-activity

## Resumen

El repositorio `Polifemus/prefix-next-activity` agrupa los artefactos de un estudio controlado sobre predicción de la siguiente actividad (next-activity prediction) en monitorización predictiva de procesos, evaluado sobre siete event logs del BPI Challenge. Incluye dos familias de modelos: PrefixGNN, una red neuronal de grafos GINEConv entrenada desde cero por log sobre el grafo de sucesión directa de cada prefijo de caso, y EventTransformer, un transformer encoder de aproximadamente 27M de parámetros preentrenado con enmascaramiento de eventos sobre un corpus multi-log y posteriormente ajustado por log.

El trabajo no es un modelo de lenguaje general, sino un modelo de dominio especifico para process mining: recibe un prefijo de caso (actividad, recurso, marca temporal y, opcionalmente, importe) y devuelve una distribución sobre la siguiente actividad. Su interes radica en el protocolo de evaluacion: splits temporales a nivel de caso, seleccion de modelo y pesos de ensemble exclusivamente en validacion, y baselines de primer orden (argmax condicional) incluidos en todas las comparaciones, lo que corrige la fuga de ejemplos habitual en parte de la literatura de next-activity.

El hallazgo principal del autor es que el transformer ajustado supera a la GNN en los logs medianos y grandes, y tambien en un log retenido (BPIC 2015, municipio 1) en regimen de transferencia pura, mientras que un ensemble de ambos seleccionado en validacion nunca es peor que la GNN sola. El repositorio ocupa 0,4 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PrefixGNN: GINEConv x3 sobre cadena de sucesion directa bidireccional. EventTransformer: transformer encoder, d_model 512, 8 capas, 8 cabezas, longitud 256 |
| Parametros totales | PrefixGNN: ~160k. EventTransformer: ~27M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Prefijos truncados a los ultimos 100 eventos en inferencia; ventana de 256 tokens con stride 64 en preentrenamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio sobre etiquetas de actividad y recurso, no linguistico) |
| Licencia | MIT |
| Formato de pesos | no disponible en la informacion proporcionada (repo PyTorch, 0,4 GB) |

## Arquitectura y entrenamiento

PrefixGNN se entrena desde cero para cada log. Aplica tres capas de message passing GINEConv sobre la cadena de sucesion directa bidireccional del prefijo. La representacion de nodo combina embedding de actividad de 32 dimensiones, embedding de recurso de 16 dimensiones y siete caracteristicas numericas (tiempo transcurrido desde el evento anterior, tiempo desde el inicio del caso, hora en codificacion seno/coseno, dia de la semana, importe del log y posicion). La lectura final es un MLP sobre la concatenacion de mean-pool, max-pool y el embedding del ultimo evento, con aproximadamente 160k parametros.

EventTransformer se preentrena una sola vez con modelado enmascarado de siguiente evento sobre ventanas de 256 tokens con stride 64, muestreadas de un corpus que crece de 12 a 18 logs, durante 40 epocas (~20M eventos entrenables). Cada token combina embedding de actividad de 64 dimensiones, recurso de 32, identificador de log de 16 y seis caracteristicas numericas. El ajuste fino por log reemplaza la cabeza global por una cabeza local inicializada desde aquella, usa atencion bidireccional completa, 30 epocas, early stopping sobre accuracy de validacion con paciencia 5 y learning rate 3e-4 con scheduler coseno. El protocolo comun emplea un evento por actividad (eventos COMPLETE cuando aplica), casos ordenados por marca temporal y split temporal 70/15/15 a nivel de caso por fecha de inicio.

## Capacidades

- Prediccion de la siguiente actividad en un caso en curso, devolviendo top-k con probabilidades.
- Procesamiento de prefijos con actividad, recurso, marca temporal e importe opcional del caso.
- Modelado de estructura secuencial (transformer) y de estructura de grafo de sucesion directa (GNN) sobre el mismo problema.
- Transferencia entre logs: el checkpoint `ft-bpi2015_1` se evalua como transferencia pura sobre un log retenido.
- Ensemble por combinacion convexa de probabilidades con pesos buscados en validacion (rejilla con paso 0,05).
- Manejo de vocabulario abierto: actividades y recursos desconocidos se mapean a `UNK`; prefijos de mas de 100 eventos se truncan a los mas recientes.
- No soporta tool calling, agentes, vision, audio ni modo thinking; no es un modelo generativo de texto.

## Casos de uso

- Monitorizacion predictiva de procesos en produccion: dado el prefijo de un caso en un sistema de workflow, el modelo estima la siguiente actividad y permite detectar desviaciones respecto al modelo de proceso esperado antes de que se consoliden.
- Priorizacion de colas de trabajo: la distribucion sobre la siguiente actividad permite anticipar que tareas entraran en la cola y dimensionar recursos en funcion de la clase mas probable y su probabilidad.
- Alertas tempranas de incumplimiento de SLA: si la siguiente actividad predicha con mayor probabilidad es una que alarga el ciclo (por ejemplo, una revision manual), el sistema puede escalar el caso con antelacion.
- Analisis de transferencia entre organizaciones: el checkpoint ajustado en BPIC 2017 y evaluado en BPIC 2015 permite estudiar cuanto conocimiento de proceso se transfiere entre dominios distintos sin reentrenar desde cero.
- Investigacion en process mining: el repositorio sirve como referencia reproducible con baselines de primer orden, MLP sobre las ultimas 10 actividades y majority class para comparar nuevos metodos de next-activity.
- Seleccion de arquitectura en proyectos de PPM: la comparacion GNN frente a transformer ajustado, con ensembles seleccionados en validacion, informa la decision entre un modelo ligero por log (~160k parametros) y uno preentrenado (~27M) reutilizable.
- Auditoria de pipelines de evaluacion: el protocolo con split a nivel de caso evita la fuga de prefijos del mismo caso entre train y test, util para validar resultados publicados.

## Benchmarks y rendimiento

Resultados sobre conjuntos de test, accuracy (macro-F1 entre parentesis), segun la model card del autor:

| Log | Casos / eventos / clases | Majority | Argmax-1 | MLP-last10 | GNN | FM fine-tuned | Mejor ensemble (val) |
|---|---|---|---|---|---|---|---|
| BPIC 2012 | 13,1k / 164k / 23 | 0,1303 | 0,5726 | 0,7636 | **0,7742** (0,637) | 0,7619 (0,611) | **0,7768** (gnn+distill+argmax) |
| BPIC 2014 | 46,6k / 467k / 39 | 0,1839 | 0,3637 | 0,4728 | **0,5368** (0,351) | 0,5272 (0,356) | no disponible (dato truncado en la informacion) |
| BPIC 2017 | no disponible | no disponible | no disponible | no disponible | 0,8151 (0,6365) | **0,8210** (0,6632) | no disponible |
| BPIC 2018 | no disponible | no disponible | no disponible | no disponible | no disponible | **0,8718** (0,5347) | no disponible |
| BPIC 2015 (municipio 1) | no disponible | no disponible | no disponible | no disponible | no disponible | **0,4277** (0,1863) | no disponible |

En BPIC 2017 el transformer ajustado mejora a la GNN en 0,6 puntos de accuracy y 2,7 puntos de macro-F1; en BPIC 2018, en 0,6 y 3,3 puntos respectivamente; en BPIC 2015 (transferencia pura) la mejora es de 1,1 puntos de accuracy. No se han publicado resultados de benchmarks en la informacion disponible para el resto de logs y celdas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Por tamano, el transformer de ~27M parametros en fp32 ocupa del orden de 110 MB de pesos, y la GNN de ~160k parametros es despreciable; el consumo dominante sera el del batch y las activaciones.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente para inferencia; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, dado el reducido numero de parametros; no se detallan modelos concretos.
- Opciones de despliegue: scripts propios `inference.py` (GNN, requiere `torch-geometric`) y `fm_inference.py` (transformers ajustados, requiere solo `torch` y `numpy`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PrefixGNN (este repo) | ~160k | ultimos 100 eventos | GNN GINEConv por log | MIT | HuggingFace |
| EventTransformer FT (este repo) | ~27M | ultimos 100 eventos (ventana 256 en preentrenamiento) | transformer encoder preentrenado multi-log y ajustado | MIT | HuggingFace |
| Baselines del estudio (majority, argmax-1, MLP-last10) | no disponible | ultimas 10 actividades (MLP) | estadistico / MLP | no aplica | implementados en el estudio |
| Otros modelos de next-activity de la literatura | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de terceros comparables en la informacion proporcionada; la comparativa se limita a las familias y baselines incluidos en el propio estudio.

## Limitaciones y advertencias

- Modelo de dominio: no es un modelo de lenguaje; solo predice la siguiente actividad a partir de un prefijo de caso con el esquema de features del estudio.
- Rendimiento muy variable entre logs: el macro-F1 cae a 0,1863 en BPIC 2015 (municipio 1) y a 0,5347 en BPIC 2018, lo que refleja clases desbalanceadas y baja transferibilidad en algunos dominios.
- Truncamiento a 100 eventos: la informacion mas alla de ese limite se descarta, lo que puede degradar casos largos.
- Vocabulario cerrado por log: actividades y recursos no vistos se mapean a `UNK`, con perdida de senal.
- Riesgo de sobreajuste al log de ajuste: los checkpoints `ft-*` estan especializados por log; su uso en otro proceso requiere validacion previa.
- No se documentan sesgos sociales ni de otro tipo, ni evaluaciones de robustez frente a ruido en marcas temporales o recursos.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no se indican restricciones adicionales.
- El pipeline tag `graph-ml` del repositorio no describe a los checkpoints `ft-*`, que son transformers secuenciales; conviene verificar que checkpoint se descarga.
- La model card advierte de fuga de ejemplos en parte de la literatura de next-activity cuando prefijos del mismo caso cruzan train y test; los resultados de este repositorio usan split por caso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Polifemus/prefix-next-activity
- Paper referenciado (arXiv:2503.03197): https://arxiv.org/abs/2503.03197
- Paper referenciado (arXiv:2607.27797): https://arxiv.org/abs/2607.27797
- Paper referenciado (arXiv:2606.15868): https://arxiv.org/abs/2606.15868
