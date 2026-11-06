# andrw3000/bigr-checkpoints

## Resumen

BIGR es un conjunto de checkpoints de modelos recursivos de razonamiento (TRM, *Tiny Recursive Model*) congelados, publicados como material de reproducibilidad del articulo *Boosting Inference with Guided Reasoning: Stochastic Exploration for Recursive Models* (Corbett, Tzatzopoulou, Sood, Ramesh, Dodwell), aceptado en NeurIPS 2026. El repositorio lo mantiene el usuario de Hugging Face `andrw3000` y el trabajo procede de digiLab Solutions Ltd. No se trata de un modelo de lenguaje generativo: son backbones especializados en resolver tareas de razonamiento combinatorio estructurado (Sudoku-Extreme, Maze-Hard y PPBench) mediante busqueda estocastica en tiempo de inferencia.

La innovacion que acompanan estos pesos es BIGR (*Boosting Inference with Guided Reasoning*), un metodo que envuelve un modelo recursivo congelado con un filtro de particulas guiado por una cabeza Q incluida en cada checkpoint. El modelo base de Sudoku-Extreme tiene solo 7 millones de parametros (74 MB), mientras que los backbones de Maze-Hard y PPBench ocupan 104 MB y 106 MB respectivamente. El interes actual reside en que demuestra que el *test-time compute* guiado puede mejorar de forma sustancial el rendimiento de modelos recursivos minusculos sin reentrenar el backbone.

El repositorio es fundamentalmente un espejo de la carpeta `data/` que espera el codigo del proyecto, disponible en GitHub, e incluye tanto el checkpoint final como los 20 checkpoints intermedios de una de las ejecuciones (figura 8 del articulo). Los conjuntos de evaluacion originales no se redistribuyen por cuestiones de licencia y deben reconstruirse a partir de los releases del Hierarchical Reasoning Model.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TRM (Tiny Recursive Model), backbone recursivo con modulo `TRMModule` (nano-trm), checkpoint de PyTorch Lightning con pesos EMA y cabeza Q |
| Parametros totales | 7 M (Sudoku-Extreme); no disponible para Maze-Hard y PPBench (solo tamano de fichero) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelos de razonamiento sobre tableros, no modelos de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | checkpoints de PyTorch Lightning (`.ckpt`), cargados via `bigr.load_trm_backbone_checkpoint` |

## Arquitectura y entrenamiento

Los backbones son instancias de TRM, un modelo recursivo de muy pocos parametros que itera sobre una representacion latente para resolver problemas combinatorios. El repositorio incluye el codigo de nano-trm embebido (*vendored*), de modo que los checkpoints son autoconsistentes con el `TRMModule` que los genero. Cada checkpoint contiene los pesos EMA del backbone y la cabeza Q que BIGR utiliza como guia durante la inferencia; no se entrena nada nuevo en el momento de la evaluacion.

El entrenamiento se realizo sobre las tareas Sudoku-Extreme, Maze-Hard y PPBench, con configuraciones y comandos documentados en el repositorio de codigo (no reproducidos en la model card). No se especifica en la informacion disponible el numero de tokens, la composicion exacta de los datasets ni si hubo fases de RLHF o DPO; al no ser un modelo de lenguaje, esas tecnicas no aplican del mismo modo. La innovacion tecnica destacable es BIGR: un filtro de particulas que explora estocasticamente el espacio de soluciones guiado por la cabeza Q, aplicado sobre un backbone congelado, lo que convierte el esfuerzo adicional en tiempo de inferencia (*test-time compute*) en ganancias de precision.

El repositorio incluye los 20 checkpoints intermedios de la ejecucion de Sudoku-Extreme, lo que permite reproducir curvas de aprendizaje y analisis de estabilidad del razonamiento recursivo a lo largo del entrenamiento.

## Capacidades

- Resolucion de Sudoku-Extreme mediante razonamiento recursivo iterativo.
- Resolucion de laberintos Maze-Hard (30x30) con el backbone correspondiente.
- Evaluacion en PPBench (tarea de planificacion/razonamiento incluida por los autores).
- Inferencia guiada por filtro de particulas con la cabeza Q incluida en cada checkpoint.
- Exploracion estocastica en tiempo de inferencia sobre un backbone congelado, sin reentrenamiento.
- Carga directa mediante `bigr.load_trm_backbone_checkpoint` y el codigo de digiLab-ai.
- No dispone de generacion de texto, codigo, vision, tool calling, agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Reproduccion de resultados del articulo de NeurIPS 2026: cargar los checkpoints con el script `download_checkpoints.py` y ejecutar las recetas de evaluacion para verificar las cifras publicadas.
- Investigacion en *test-time compute*: usar el backbone congelado y variar el numero de particulas o la guia Q para estudiar el compromiso entre coste computacional y precision en Sudoku-Extreme.
- Estudio de modelos recursivos pequenos: analizar los 20 checkpoints intermedios para trazar la evolucion del razonamiento a lo largo del entrenamiento (figura 8 del paper).
- Desarrollo de nuevos metodos de guiado: emplear la cabeza Q y el backbone como linea base sobre la que probar alternativas de filtro de particulas o funciones de guia.
- Benchmarking de planificacion en laberintos: evaluar el backbone Maze-Hard sobre cohortes reconstruidas con `build_eval_cohorts.py` a partir de `sapientinc/maze-30x30-hard-1k`.
- Docencia y divulgacion: ilustrar como un modelo de 7 M de parametros con busqueda guiada puede superar a enfoques de mayor tamano en tareas combinatorias, con artefactos reproducibles y ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo (OpenReview `nZD0FHMUmR`) para las cifras; unicamente se documentan los tamanos de las cohortes de evaluacion: Sudoku-Extreme Test 10.020 y DF 1.427; Maze-Hard Test 1.000 y DF 134.

## Requisitos de hardware

- VRAM estimada: los checkpoints individuales ocupan entre 74 MB y 106 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer (incluso integradas) con unos pocos cientos de MB de margen para activaciones.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU con soporte CUDA es suficiente, y las RTX 4090 o A100 no son necesarias para el backbone, aunque el coste real depende del numero de particulas del filtro BIGR.
- Cabe en GPU consumer: si, practicamente en cualquiera con soporte PyTorch.
- Opciones de despliegue: carga via PyTorch/PyTorch Lightning con el codigo de digiLab-ai (`bigr`); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del numero de particulas y de la tarea, y no se documentan en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BIGR (Sudoku-Extreme backbone) | 7 M | no aplica | Sudoku-Extreme | CC BY 4.0 | Hugging Face (este repo) |
| BIGR (Maze-Hard backbone) | no disponible (104 MB) | no aplica | Maze-Hard 30x30 | CC BY 4.0 | Hugging Face (este repo) |
| Hierarchical Reasoning Model (HRM) | no disponible en la informacion | no aplica | Sudoku-Extreme, Maze-Hard | no disponible en la informacion | `sapientinc/sudoku-extreme` y `sapientinc/maze-30x30-hard-1k` (datasets) |
| Modelos de razonamiento LLM (p. ej. families tipo o1/o3) | orden de miles de millones | decenas de miles de tokens | razonamiento general | propietaria en su mayoria | APIs comerciales |

La comparacion directa con LLM no es significativa: BIGR opera sobre representaciones de tablero y no genera lenguaje. Frente al HRM, el propio articulo lo usa como referencia y como fuente de los datasets de evaluacion; la model card no ofrece una tabla comparativa de metricas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingues ni de vision.
- Los conjuntos de evaluacion originales no se redistribuyen; hay que reconstruirlos con `build_eval_cohorts.py`, lo que introduce dependencia de los releases de HRM.
- Solo se documenta el numero de parametros del backbone de Sudoku-Extreme; para Maze-Hard y PPBench solo se da el tamano de fichero, por lo que no se puede afirmar su numero de parametros.
- Los resultados de benchmarks no estan en la model card; cualquier comparacion numerica exige consultar el articulo en OpenReview.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion externa de la comunidad.
- Riesgo de alucinacion, sesgos o limitaciones idiomaticas: no aplica en el sentido habitual de un LLM; el riesgo es de convergencia a soluciones incorrectas en problemas combinatorios, no de afirmaciones falsas.
- Licencia CC BY 4.0: permite uso comercial con atribucion a digiLab Solutions Ltd y citacion del articulo; `NOTICES.md` en el repositorio de codigo recoge las licencias de los datasets y del codigo del backbone.
- El uso en produccion requiere integrar el codigo de GitHub, no solo los pesos, y no hay garantias de soporte a largo plazo documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/andrw3000/bigr-checkpoints
- Codigo y recetas de reproduccion: https://github.com/digiLab-ai/bigr
- Articulo (OpenReview): https://openreview.net/forum?id=nZD0FHMUmR
- Dataset Sudoku-Extreme (HRM): https://huggingface.co/datasets/sapientinc/sudoku-extreme
- Dataset Maze-Hard 30x30 (HRM): https://huggingface.co/datasets/sapientinc/maze-30x30-hard-1k
