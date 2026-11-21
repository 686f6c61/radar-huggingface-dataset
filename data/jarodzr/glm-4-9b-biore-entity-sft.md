# jarodzr/GLM-4-9B-BioRE-ENTITY-SFT

## Resumen

GLM-4-9B-BioRE-ENTITY-SFT es un adaptador LoRA (PEFT) publicado por el usuario jarodzr sobre el modelo base zai-org/GLM-4-9B-0414 (THUDM/GLM-4-9B-0414), un transformer causal de 9.000 millones de parametros desarrollado por Zhipu AI / THUDM. El adaptador esta especializado en extraccion de relaciones biomedicas (BioRE, biomedical relation extraction) y reconocimiento de entidades, segun indican las etiquetas del repositorio. No se trata de un modelo completo, sino de pesos delta que deben combinarse con el modelo base para su uso.

El interes practico del artefacto reside en su enfoque: aplicar ajuste fino supervisado (SFT) con LoRA sobre un LLM generalista de 9B para una tarea de NLP biomedico estructurada, lo que permite desplegar extraccion de relaciones en dominios clinicos o farmacologicos con un coste de entrenamiento bajo. Sin embargo, la informacion publicada es muy escasa: la model card no documenta el dataset de entrenamiento, los hiperparametros, las metricas ni el esquema de etiquetas de relaciones y entidades.

El repositorio tiene 1,7 GB de pesos, 0 descargas y 0 likes en el momento de la consulta, y fue creado en abril de 2026 con actualizacion en noviembre de 2026. Se trata, por tanto, de un artefacto de investigacion sin validacion publica ni adopcion comunitaria, que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base GLM-4-9B-0414) con adaptador LoRA (PEFT) |
| Parametros totales | 9B en el modelo base; el adaptador LoRA anade un numero no disponible de parametros |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base; no confirmada) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos del adaptador, no cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | pesos PEFT/LoRA (libreria `peft`); formato exacto de fichero no disponible |
| Modelo base | zai-org/GLM-4-9B-0414 (THUDM/GLM-4-9B-0414) |
| Tarea | Extraccion de relaciones biomedicas y entidades (BioRE) |
| Tamano del repositorio | 1,7 GB |
| Fecha de creacion / actualizacion | 2026-04-23 / 2026-11-21 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre GLM-4-9B-0414, un modelo de lenguaje causal de la familia GLM-4 de Zhipu AI. La arquitectura concreta del modelo base (numero de capas, dimension oculta, mecanismo de atencion, uso de RoPE, etc.) no se detalla en la informacion proporcionada. El adaptador es un LoRA entrenado con PEFT, lo que implica que solo se actualiza un subconjunto de matrices de bajo rango, manteniendo congelados los pesos del modelo base.

No se dispone de informacion sobre el dataset de entrenamiento (volumen, composicion, fuentes biomedicas como PubMed o MIMIC, esquema de anotacion), el numero de tokens vistos, la funcion de perdida, los hiperparametros de LoRA (rango, alpha, dropout) ni si se aplicaron tecnicas adicionales como RLHF o DPO. La model card se limita a indicar el modelo base y el enlace de descarga del modelo original en ModelScope, sin documentar el proceso de ajuste.

La innovacion tecnica del artefacto es, por tanto, la aplicacion de SFT con LoRA a una tarea estructurada de extraccion de informacion biomedica sobre un LLM de 9B, lo que reduce el coste de entrenamiento frente a un ajuste completo. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en el modelo base; el adaptador esta orientado a la tarea de extraccion de relaciones y entidades biomedicas.
- Extraccion de relaciones (relation extraction) en el dominio biomedico, segun las etiquetas del repositorio.
- Reconocimiento de entidades (entity recognition) en textos biomedicos, segun el nombre del modelo.
- Soporte de tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Extraccion de relaciones biomedicas en literatura cientifica: el adaptador puede aplicarse sobre abstracts de PubMed para identificar relaciones entre entidades (farmaco-enfermedad, gen-proteina) y poblar bases de conocimiento estructuradas, aprovechando que el modelo base es un LLM de 9B con capacidad de seguir instrucciones.
- Construccion de grafos de conocimiento clinicos: a partir de informes o notas clinicas, el modelo puede extraer pares entidad-relacion que alimenten un grafo consultable, reduciendo el trabajo manual de anotacion.
- Curacion de bases de datos farmacologicas: extraccion de interacciones farmaco-farmaco o farmaco-diana a partir de resumenes de ensayos, para mantener actualizadas bases como DrugBank mediante pipelines automatizados.
- Preprocesamiento para sistemas de question answering biomedico: las tripletas extraidas pueden usarse como contexto estructurado en un RAG sobre literatura medica, mejorando la precision de las respuestas.
- Investigacion en NLP biomedico: el adaptador sirve como punto de partida para experimentos de fine-tuning con LoRA en tareas BioRE, permitiendo comparar estrategias de ajuste sobre un mismo modelo base.
- Prototipado de asistentes de revision sistematica: extraccion semiautomatica de relaciones relevantes de articulos para cribado inicial, con revision humana posterior dado el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este adaptador. Como referencia orientativa, un modelo base de 9B en precision completa (fp16) requiere aproximadamente 18 GB de VRAM solo para los pesos, mas memoria para el contexto y el adaptador; en cuantizacion de 8 bits, en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB.
- GPU recomendadas: no disponibles para este adaptador. Para el modelo base de 9B, GPUs con 24 GB o mas (RTX 4090, A100 40/80 GB, H100) permiten inferencia comoda en fp16; GPUs de 16 GB pueden requerir cuantizacion.
- ¿Cabe en consumer GPU? Probablemente si, con cuantizacion (8 o 4 bits) en GPUs de 12-24 GB; no confirmado para este adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`; el despliegue con vLLM, TGI o llama.cpp no esta documentado y depende de la conversion del adaptador a los formatos soportados por cada motor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4-9B-BioRE-ENTITY-SFT (este) | 9B (base) + LoRA | no disponible | BioRE / entidades | no disponible | Hugging Face (0 descargas) |
| GLM-4-9B-0414 (base) | 9B | no disponible en la informacion | Generacion general | no disponible | Hugging Face / ModelScope |
| Alternativas BioRE especializadas | no disponible | no disponible | BioRE | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria (modelos especializados en extraccion de relaciones biomedicas) ni con metricas de rendimiento.

## Limitaciones y advertencias

- Artefacto sin validacion publica: 0 descargas y 0 likes, sin benchmarks ni metricas reportadas; no hay evidencia de su calidad en la tarea BioRE.
- Model card practicamente vacia: no se documentan dataset, hiperparametros, esquema de etiquetas ni proceso de evaluacion, lo que impide reproducir el entrenamiento.
- Riesgo de alucinacion: al ser un LLM generativo aplicado a extraccion estructurada, puede inventar entidades o relaciones no presentes en el texto; requiere validacion y posiblemente post-procesado con restricciones de esquema.
- Sesgos conocidos: no documentados; el modelo base puede arrastrar sesgos de sus datos de preentrenamiento, y el adaptador puede amplificarlos en el dominio biomedico.
- Limitaciones de contexto e idioma: no disponibles; se desconoce si el adaptador funciona en castellano o solo en ingles, idioma dominante en literatura biomedica.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse la licencia del modelo base (GLM-4) y la del adaptador antes de cualquier despliegue productivo.
- Dependencia del modelo base: el adaptador no es autonomo; requiere descargar y cargar GLM-4-9B-0414, con los requisitos de hardware y licencia asociados.
- Caveat de produccion: sin evaluacion en un conjunto de test independiente, no se recomienda su uso en entornos clinicos o farmaceuticos sin supervision humana.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jarodzr/GLM-4-9B-BioRE-ENTITY-SFT
- Modelo base en ModelScope (segun la model card): https://www.modelscope.cn/models/ZhipuAI/GLM-4-9B-0414
- Modelo base en Hugging Face (referencia del campo base_model): https://huggingface.co/THUDM/GLM-4-9B-0414
- Descarga de ficheros del adaptador: https://huggingface.co/jarodzr/GLM-4-9B-BioRE-ENTITY-SFT/tree/main
