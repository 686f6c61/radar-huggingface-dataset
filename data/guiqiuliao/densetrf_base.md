# GuiqiuLiao/DenseTRF_base

## Resumen

DenseTRF_base es el modelo base preentrenado de DenseTRF, un marco de adaptacion no supervisada de representaciones consciente de la textura (texture-aware) para prediccion densa en escenas quirurgicas. Lo desarrolla GuiqiuLiao, con vinculacion al entorno del paper aceptado en MICCAI 2026 "DenseTRF: Texture-Aware Unsupervised Representation Adaptation for Surgical Scene Dense Prediction". El repositorio de HuggingFace contiene unicamente el checkpoint base (pesos preentrenados) y su model card se limita a la frase "DenseTRF pretrained base model" bajo licencia MIT.

El problema que aborda es el cambio de distribucion (distribution shift) en tareas de prediccion densa aplicadas a cirugia laparoscopica y robotica, como la segmentacion de instrumentos, tejidos y la prediccion de zonas quirurgicas. Los modelos entrenados con datasets limitados generalizan mal en despliegue porque los datos de entrenamiento no cubren la variabilidad real de las intervenciones. DenseTRF propone una adaptacion en tiempo de test, auto-supervisada y sin etiquetas, que combina representaciones centradas en objetos basadas en slots (slot attention) con una estrategia periodica de fusion de modelos (model merging) que equilibra especializacion en el dominio objetivo y generalizacion.

Es relevante ahora porque traslada tecnicas de representacion auto-supervisada y de adaptacion en test a un dominio clinico donde el etiquetado es caro y el dominio cambia de un paciente y un quirófano a otro. El checkpoint base es el punto de partida sobre el que se aplican las ramas de adaptacion descritas en el paper (rama base y rama objetivo entrenadas en paralelo durante el test-time adaptation).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (el paper describe un marco de prediccion densa con representaciones basadas en slots aprendidas por reconstruccion y fusion periodica de modelos) |
| Parametros totales | no disponible (el repositorio ocupa 0,4 GB; el numero de parametros no se especifica) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no aplica (modelo de vision para prediccion densa, no un LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (no se detalla en la model card; el repositorio contiene 0,4 GB de pesos) |

## Arquitectura y entrenamiento

La informacion disponible describe DenseTRF como un marco de adaptacion de representaciones en tiempo de test para prediccion densa quirurgica. Consta de tres componentes segun el resumen del paper: (i) condicionar la prediccion densa sobre representaciones de slots no supervisadas aprendidas mediante reconstruccion, lo que aporta una vision centrada en objetos; (ii) una estrategia periodica de fusion de modelos que equilibra la especializacion en el dominio objetivo con la generalizacion; y (iii) un mecanismo de adaptacion que mantiene dos ramas paralelas de slot attention durante el test-time adaptation. La rama base se entrena sobre datos quirurgicos diversos de multiples procedimientos para conservar generalizacion, mientras que la rama objetivo se entrena solo con fotogramas sin etiquetar del caso concreto en el momento del despliegue. El planteamiento es auto-supervisado (self-supervised), sin necesidad de anotaciones en el dominio objetivo.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables a un modelo de vision de este tipo). La innovacion tecnica destacable es la combinacion de representaciones object-centric basadas en slots con una fusion periodica de modelos como ancla de generalizacion, aplicada a la adaptacion no supervisada al dominio de test. Los detalles de la arquitectura del backbone concreto y del preentrenamiento del checkpoint base no estan disponibles en la model card.

## Capacidades

- Prediccion densa en escenas quirurgicas: segmentacion semantica de estructuras e instrumentos y prediccion de zonas quirurgicas.
- Aprendizaje de representaciones object-centric mediante slot attention entrenado por reconstruccion (captura de estructuras visuales invariantes entre dominios).
- Adaptacion no supervisada en tiempo de test a un caso quirurgico concreto sin etiquetas.
- Fusion periodica de modelos para equilibrar especializacion y generalizacion.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas (es un modelo de vision).
- No dispone de tool calling ni de function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso en el sentido de un LLM.
- Capacidades multilingues: no aplica (no procesa lenguaje).
- No se documentan capacidades de vision-lenguaje, audio ni thinking mode.

## Casos de uso

- Segmentacion de instrumentos quirurgicos en laparoscopia: el modelo base puede servir de punto de partida para adaptarse por caso y segmentar instrumentos y tejidos sin anotaciones del dominio objetivo, lo que reduce el coste de etiquetado por procedimiento.
- Prediccion de zonas quirurgicas en cirugia robotica: util para dar contexto de fase o zona de la intervencion a partir de fotogramas, apoyando sistemas de asistencia en quirófano.
- Adaptacion a un nuevo quirófano o protocolo de imagen: la rama objetivo permite ajustar el modelo a las condiciones de iluminacion, optica y tejido de un centro concreto usando solo video no etiquetado del propio caso.
- Investigacion en adaptacion de dominio en imagen medica: sirve como referencia reproducible para estudiar slot attention y model merging en prediccion densa bajo distribution shift.
- Preentrenamiento de base para tareas densas quirurgicas derivadas: el checkpoint base puede reutilizarse y afinar para tareas especificas como deteccion de sangrado, clasificacion de fases o seguimiento de tejido.
- Generacion de mascaras o pseudoetiquetas para anotacion asistida: al adaptarse sin supervision, puede producir mapas densos que un equipo humano revise y corrija, acelerando la creacion de datasets etiquetados.
- Evaluacion comparativa de estrategias de test-time adaptation en dominios criticos: permite contrastar la fusion periodica de modelos frente a otros esquemas de adaptacion en un escenario clinico realista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas y el material de busqueda solo referencia el resumen y la aceptacion del paper en MICCAI 2026, sin cifras concretas de Dice, IoU u otras metricas de prediccion densa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Partiendo del tamano del repositorio (0,4 GB), el checkpoint completo en precision de 32 bits ocuparia en torno a 0,4 GB en memoria, de modo que la inferencia cabria con holgura en cualquier GPU consumer con 6-8 GB de VRAM, dejando margen para activaciones y el lote de imagenes. Esta cifra es una estimacion a partir del tamano del repositorio, no un dato confirmado por el autor.
- GPU recomendadas: una GPU consumer moderna (por ejemplo, RTX 3060, RTX 4070, RTX 4090) seria suficiente para inferencia dado el tamano del checkpoint; para entrenamiento o adaptacion en tiempo de test con lotes mayores serian preferibles GPUs de datacenter como A100 o H100. No hay recomendaciones oficiales publicadas.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 8 GB o mas de VRAM, siempre que el backbone real coincida con el tamano sugerido por el repositorio.
- Opciones de despliegue: no se documentan en la model card; al ser un marco de vision, el despliegue habitual seria mediante PyTorch y el codigo del paper. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM y no aplicables a este modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables con datos verificables de parametros, contexto, rendimiento o licencia. El paper situa DenseTRF en la categoria de adaptacion en tiempo de test para prediccion densa quirurgica, pero no se aportan cifras ni terminos de comparacion concretos que permitan construir una tabla fiable.

## Limitaciones y advertencias

- La model card es practicamente vacia ("DenseTRF pretrained base model"); no hay documentacion de uso, preprocesado ni formato de entrada y salida, lo que dificulta su reutilizacion directa.
- Es un checkpoint base, no el modelo adaptado descrito en el paper; para obtener los resultados de adaptacion hay que aplicar el procedimiento de test-time adaptation con las ramas de slot attention.
- Al ser un modelo de vision medica, puede heredar sesgos de los datasets quirurgicos de entrenamiento (tipo de procedimiento, poblacion, equipamiento, iluminacion) y generalizar peor en contextos no representados.
- Riesgo de errores en prediccion densa en condiciones de oclusion, sangrado o mala visibilidad, con implicaciones criticas si se usa en un contexto clinico.
- Limitaciones de contexto e idioma: no aplica idioma, pero si existe una limitacion de dominio (escenas quirurgicas) fuera del cual el rendimiento no esta caracterizado.
- Uso en produccion clinica: no debe emplearse como sistema de decision autonomo; requeriria validacion regulatoria, supervision medica y garantias de seguridad que no se documentan.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte, y la responsabilidad del uso clinico recae en quien lo despliega.
- No se han publicado benchmarks en la informacion disponible, por lo que no es posible verificar el rendimiento real.

## Enlaces

- HuggingFace: https://huggingface.co/GuiqiuLiao/DenseTRF_base
- Paper (arXiv): https://arxiv.org/abs/2605.11265
- PDF del paper (arXiv): https://arxiv.org/pdf/2605.11265
- PDF en MICCAI 2026: https://papers.miccai.org/miccai-2026/paper/6100_paper.pdf
- Resumen en aimodels.fyi: https://www.aimodels.fyi/papers/arxiv/densetrf-texture-aware-unsupervised-representation-adaptation-surgical
- Anuncio de aceptacion en MICCAI 2026 (LinkedIn): https://www.linkedin.com/posts/guiqiu-liao_miccai2026-surgicaldatascience-pennmedicine-activity-7460371109624901632-8HkU
