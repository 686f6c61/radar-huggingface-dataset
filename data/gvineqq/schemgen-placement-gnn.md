# GvineQQ/schemgen-placement-gnn

## Resumen

`schemgen-placement-gnn` es una red neuronal sobre grafos (GNN) desarrollada por GvineQQ en el marco del proyecto del equipo 5 de la asignatura EECE7398, cuyo objetivo es la generacion automatica de esquematicos a partir de netlists SPICE. El modelo no genera texto ni imagenes: recibe el grafo dispositivo-red de una celda de netlist y emite, mediante cinco cabezas de clasificacion, las probabilidades que un colocador (placer) posterior convierte en coordenadas y relaciones espaciales de los dispositivos en el esquematico.

La arquitectura es un paso de mensajes bipartito de 4 capas con 128 dimensiones ocultas, embeddings de rol de pin y contexto de grafo, implementado en PyTorch puro, con 985.116 parametros. Es, por tanto, un modelo muy pequeno y especializado, pensado para integrarse en un pipeline de EDA (electronic design automation) y no para inferencia de proposito general.

Su relevancia es acotada pero concreta: aborda la fase de colocacion del dibujo de esquematicos analogicos, un paso tradicionalmente manual, y publica resultados medidos con las metricas de estilo AMSchem sobre el conjunto Core40, ademas de los checkpoints de tres semillas por configuracion y los encoders preentrenados. El repositorio ocupa 0,1 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN de paso de mensajes bipartito (4 capas, 128 dimensiones ocultas, embeddings de rol de pin, contexto de grafo) |
| Parametros totales | 985.116 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada es un grafo de netlist) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`best.pt` con `config`, `state` y `metrics.json`/`train.log` asociados) |

## Arquitectura y entrenamiento

El modelo implementa un paso de mensajes bipartito sobre el grafo dispositivo-red de una celda de netlist: los dispositivos aportan su tipo, las redes aportan indicadores de puerto, alimentacion y tierra, y cada pin genera una arista tipada por su rol. Cuatro capas de message passing con 128 dimensiones ocultas producen representaciones que alimentan cinco cabezas: `orient` (16 clases de orientacion por dispositivo, direccion x lado del pin de control), `rel` (izquierda, derecha, arriba, abajo por par de dispositivos), `h3` (izquierda, misma columna, derecha), `v3` (arriba, misma fila, abajo) y `sym` (par espejado o no). Las tres primeras replican las clases de las puntuaciones S_orient y S_rel de AMSchem.

El entrenamiento se organiza en varias configuraciones documentadas en `docs/GNN.md` seccion 9: `supervised_plain` y `supervised_balanced` (supervision directa con y sin balanceo de clases), tres variantes con encoder congelado (`frozen_generated_plain`, `frozen_generated_balanced`, `frozen_inbatch_plain`, `frozen_random_plain`) y `finetune_generated_plain`. Se publican tres semillas por configuracion, ademas de los encoders preentrenados (`pretrain_<negatives>_s<seed>/best.pt`). No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Clasificacion de orientacion de dispositivos en 16 clases (direccion y lado del pin de control).
- Prediccion de relaciones espaciales por par de dispositivos: izquierda, derecha, arriba, abajo.
- Prediccion de alineacion horizontal en tres clases (izquierda, misma columna, derecha).
- Prediccion de alineacion vertical en tres clases (arriba, misma fila, abajo).
- Deteccion de pares espejados (simetria) entre dispositivos.
- Generacion de probabilidades consumibles por un colocador externo (`schemgen.simple_layout` como primera implementacion) que las traduce a coordenadas y dibujo.
- Inferencia sobre CPU (`map_location="cpu"` en el ejemplo de carga) y ejecucion por lotes mediante `scripts/train_gnn.py predict`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo de grafos especifico de dominio.

## Casos de uso

- Generacion automatica de esquematicos analogicos: el modelo predice orientaciones y relaciones espaciales de los dispositivos de una celda SPICE, y el colocador convierte esas probabilidades en coordenadas para producir un dibujo valido, reduciendo el trabajo manual de dibujo.
- Asistencia al disenador en EDA: integrado en un flujo de captura de esquematicos, propone una colocacion inicial que el ingeniero revisa y ajusta, en lugar de partir de una hoja en blanco.
- Preentrenamiento de encoders para tareas relacionadas: los checkpoints `pretrain_<negatives>_s<seed>` sirven como inicializacion para modelos de grafos de netlist en tareas de clasificacion estructural (deteccion de simetrias, agrupaciones de dispositivos).
- Investigacion en representacion de circuitos: al ser codigo PyTorch plano y de menos de un millon de parametros, es adecuado como linea base reproducible para comparar tecnicas de message passing en grafos de netlist.
- Evaluacion comparativa de colocadores: las probabilidades del modelo pueden alimentar distintos algoritmos de colocacion y medirse con las puntuaciones S_rel y S_orient de AMSchem sobre Core40.
- Formacion y docencia: el par modelo + colocador simple permite ilustrar de extremo a extremo el pipeline netlist -> grafo -> prediccion -> dibujo sin requerir infraestructura de GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card: media ± desviacion tipica sobre las semillas 0 a 2. La columna de clasificador es la media de macro-F1 de las cinco cabezas; las columnas Core40 son las puntuaciones de AMSchem sobre los 40 casos del benchmark con el colocador y router simples de `schemgen.simple_layout` (todos los dibujos validos).

| Config | val macro-F1 | Core40 macro-F1 | Core40 s_rel | Core40 s_orient |
|---|---|---|---|---|
| supervised_plain | 0,727 ± 0,000 | **0,599 ± 0,011** | 0,508 ± 0,012 | 0,665 ± 0,008 |
| supervised_balanced | **0,729 ± 0,002** | 0,592 ± 0,004 | **0,522 ± 0,012** | 0,657 ± 0,022 |
| frozen_generated_plain | 0,599 ± 0,005 | 0,541 ± 0,008 | 0,423 ± 0,016 | 0,695 ± 0,012 |
| frozen_generated_balanced | 0,609 ± 0,002 | 0,535 ± 0,009 | 0,412 ± 0,002 | 0,676 ± 0,028 |
| frozen_inbatch_plain | 0,603 ± 0,003 | 0,545 ± 0,007 | 0,430 ± 0,016 | 0,689 ± 0,007 |
| frozen_random_plain | 0,582 ± 0,003 | 0,542 ± 0,010 | 0,460 ± 0,016 | 0,689 ± 0,003 |
| finetune_generated_plain | 0,718 ± 0,002 | 0,575 ± 0,015 | 0,483 ± 0,021 | 0,661 ± 0,008 |

Referencias con el mismo colocador y router: sin modelo (rejilla) s_rel 0,271 y s_orient 0,675; etiquetas de referencia (oraculo) 0,861 y 0,998; AMSchem puntuado con el mismo codigo, 0,752 y 0,795.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en FP32 (985.116 parametros, ~4 MB en FP32), mas el grafo de entrada y el estado del optimizador si se reentrena.
- GPU recomendadas: no se especifican; el modelo carga en CPU en el ejemplo de la model card. Cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) es mas que suficiente si se desea acelerar.
- Cabe en GPU consumer: si, con holgura; tambien cabe en CPU.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `PlacementGNN`), script `scripts/train_gnn.py predict`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de grafos).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| schemgen-placement-gnn | 985.116 | no aplica (grafo) | Core40 s_rel 0,522 / s_orient 0,657 (supervised_balanced) | MIT | Hugging Face, pesos PyTorch |
| AMSchem (referencia del benchmark) | no disponible | no aplica | s_rel 0,752 / s_orient 0,795 | no disponible | no disponible |
| Colocador por rejilla (sin modelo) | 0 | no aplica | s_rel 0,271 / s_orient 0,675 | no disponible | incluido en `schemgen.simple_layout` |
| Etiquetas oraculo (referencia) | 0 | no aplica | s_rel 0,861 / s_orient 0,998 | no disponible | no disponible |

No se dispone de informacion sobre otros modelos de grafos para colocacion de esquematicos que permitan una comparacion directa de parametros y licencia.

## Limitaciones y advertencias

- El modelo solo predice probabilidades de orientacion y relaciones; necesita un colocador externo para producir coordenadas. La calidad final depende del colocador y del router.
- Rendimiento alejado del oraculo y por debajo de AMSchem en las puntuaciones s_rel y s_orient sobre Core40 (0,522 frente a 0,752 y 0,795 respectivamente en la mejor configuracion).
- El codigo y la documentacion completa (`docs/GNN.md`, `docs/GNN_REPORT.md`) estan en un repositorio de GitHub privado (`qianyich/AutoSchematic_gen_from_SPICE`, rama `gnn-placement`); la reproducibilidad completa no esta garantizada sin acceso a ese repositorio.
- Las predicciones de Core40 no se incluyen en el repositorio porque el benchmark no declara licencia, lo que limita la verificacion independiente.
- El dataset de entrenamiento (`GvineQQ/schemgen-gnn-data`) no se detalla en la informacion disponible; se desconoce su cobertura de estilos de netlist y posibles sesgos hacia las topologias representadas.
- No es un modelo de lenguaje: no procesa texto ni instrucciones, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- La licencia MIT permite uso comercial, pero debe verificarse la licencia de los datos de entrenamiento y del benchmark Core40 antes de usar el modelo en productos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GvineQQ/schemgen-placement-gnn
- Dataset: https://huggingface.co/datasets/GvineQQ/schemgen-gnn-data
- Repositorio de codigo y documentacion (privado, rama `gnn-placement`): https://github.com/qianyich/AutoSchematic_gen_from_SPICE
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
