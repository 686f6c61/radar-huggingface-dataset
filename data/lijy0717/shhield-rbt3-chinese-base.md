# lijy0717/shhield-rbt3-chinese-base

## Resumen

Shhield AI rbt3 privacy model es un modelo de clasificacion de tokens (token-classification) en chino, publicado por el usuario lijy0717 bajo el identificador `lijy0717/shhield-rbt3-chinese-base`. Se trata de un ajuste fino del modelo `hfl/rbt3` (revision `0aa0527ff4170f29e1dfd3eb6ef60dc67e1bf75c`), un transformer de estilo BERT/RoBERTa reducido a 3 capas, al que se le ha anadido una cabeza CRF (Conditional Random Field) para tareas de etiquetado de secuencias, presumiblemente reconocimiento de entidades nombradas (NER) orientado a privacidad.

El modelo forma parte de la infraestructura del producto Shhield AI Desktop, donde actua como modelo BERT-CRF heredado ("legacy bundled"). Segun la propia model card, no supero la puerta de validacion semantica D5 del proyecto y no es el modelo RaNER por defecto; sus ficheros estan fijados por el manifiesto `privacy_rbt3_manifest.json`. Esto lo situa como un componente de compatibilidad mas que como un modelo de proposito general.

Con 37.891.654 parametros totales y un repositorio de 0,2 GB, es un modelo muy ligero, disenado para ejecucion local o en el borde. Su relevancia es limitada fuera del ecosistema Shhield: tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT/RoBERTa (3 capas) con cabeza CRF para token-classification |
| Parametros totales | 37.891.654 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base hfl/rbt3 usa 512 tokens por convencion, sin confirmar para este ajuste) |
| Tipos de cuantizacion | no disponible (el repositorio contiene unicamente safetensors) |
| Idiomas soportados | chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Tamano del repositorio | 0,2 GB |
| Modelo base | hfl/rbt3 (revision 0aa0527ff4170f29e1dfd3eb6ef60dc67e1bf75c) |
| Fecha de publicacion | 2026-09-24 |

## Arquitectura y entrenamiento

El modelo parte de `hfl/rbt3`, una variante compacta de la familia RoBERTa en chino desarrollada por el HFL (Hugging Face Lab / iFLYTEK) que reduce la profundidad del transformer a 3 capas manteniendo el vocabulario y el esquema de tokenizacion subyacente. Sobre esa base se ha incorporado una capa de decodificacion CRF, un componente habitual en tareas de etiquetado de secuencias porque modela las dependencias entre etiquetas contiguas y evita transiciones invalidas en la secuencia de salida.

Los datos de entrenamiento, segun la model card, combinan datos de referencia de entidades legales GLEIF bajo licencia CC0 con ejemplos generados por el propio proyecto. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, la proporcion entre datos reales y sinteticos, ni si se aplicaron tecnicas de optimizacion posteriores como RLHF o DPO (poco habituales en modelos encoder de clasificacion). La model card tampoco detalla hiperparametros, epocas ni estrategia de validacion.

El aspecto mas relevante desde el punto de vista tecnico es la propia declaracion de la model card: el modelo "no supero la puerta de validacion semantica D5 del proyecto" y "no es el modelo RaNER por defecto". Es decir, el autor lo conserva por razones de compatibilidad con empaquetados anteriores de Shhield AI Desktop, no porque represente el mejor rendimiento de su pipeline.

## Capacidades

- Clasificacion de tokens sobre texto en chino: asignacion de etiquetas a nivel de token, tipicamente para reconocimiento de entidades nombradas (personas, organizaciones, ubicaciones u otras categorias definidas por el proyecto).
- Modelado de dependencias entre etiquetas mediante la capa CRF, lo que reduce secuencias de etiquetas invalidas.
- Procesamiento de entidades de tipo legal o corporativo, dado el uso de datos de referencia GLEIF durante el ajuste.
- Inferencia local en entornos con recursos muy limitados, gracias a su tamano reducido (menos de 38 millones de parametros).
- Integracion en pipelines de privacidad de datos: el nombre del modelo y su contexto de uso sugieren deteccion de informacion potencialmente sensible en texto.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. Es un modelo encoder de clasificacion, no un modelo generativo.
- Capacidades multilingues: no. El unico idioma declarado es el chino (zh).

## Casos de uso

- Deteccion de entidades en textos legales en chino: el modelo puede etiquetar nombres de organizaciones y entidades de referencia en documentos contractuales o registros mercantiles, aprovechando el ajuste sobre datos GLEIF.
- Anonimizacion y enmascarado de datos personales: integrado en un pipeline previo a almacenamiento o envio de texto, permite localizar menciones a entidades para sustituirlas o seudonimizarlas antes de persistir la informacion.
- Compatibilidad con despliegues heredados de Shhield AI Desktop: al estar fijado por `privacy_rbt3_manifest.json`, sirve para reproducir exactamente el comportamiento de versiones anteriores del producto sin romper contratos de compatibilidad.
- Procesamiento en el borde o en equipos sin GPU: con 37,9 millones de parametros y un repositorio de 0,2 GB, puede ejecutarse en CPU con latencias aceptables para lotes pequenos, lo que encaja en aplicaciones de escritorio.
- Preetiquetado en flujos de anotacion humana: el modelo puede generar una primera pasada de etiquetas sobre corpus en chino que despues revisan anotadores, reduciendo el coste de construccion de datasets de NER.
- Filtrado o clasificacion previa en ingesta de documentos: en un pipeline ETL de documentos en chino, puede marcar que fragmentos contienen entidades relevantes antes de enviarlos a un modelo mayor, ahorrando computo.
- Base para experimentacion academica con arquitecturas BERT+CRF: su tamano reducido lo hace util como punto de partida para estudiar el efecto de la capa CRF en tareas de etiquetado con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de F1, precision o recall, ni comparaciones con otros modelos. La unica evaluacion cualitativa mencionada es que el modelo no supero la puerta de validacion semantica D5 del proyecto Shhield AI, sin que se detallen los criterios de dicha puerta ni los resultados obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 76 MB en FP16 y 152 MB en FP32 solo para los pesos, mas el consumo del runtime (tokenizador, activaciones y overhead de framework). En la practica, menos de 1 GB en cualquier configuracion realista.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre. No requiere A100, H100 ni RTX 4090; una GTX 1050, una GPU integrada moderna o incluso CPU son suficientes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en muchas integradas.
- Ejecucion en CPU: viable y probablemente el modo de despliegue previsto para una aplicacion de escritorio. Con 37,9 millones de parametros, la inferencia por secuencia de 512 tokens se mide en decenas de milisegundos en CPU moderna.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`, exportacion a ONNX Runtime, TorchScript, o integracion en aplicaciones nativas. vLLM no es adecuado para un modelo encoder de clasificacion de este tamano; llama.cpp y formatos GGUF estan orientados a modelos generativos y no aplican de forma estandar aqui. TGI tampoco es el entorno natural para esta tarea.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| lijy0717/shhield-rbt3-chinese-base | 37.891.654 | no disponible | Token-classification (BERT+CRF) | apache-2.0 | Modelo heredado de Shhield AI, no supero la puerta D5; 0 descargas |
| hfl/rbt3 | no disponible | 512 tokens (convencion del modelo base) | Modelo base preentrenado en chino | apache-2.0 | Modelo del que deriva; sin cabeza CRF ni ajuste a la tarea |
| hfl/chinese-bert-wwm-ext | no disponible | 512 tokens (convencion) | Modelo base preentrenado en chino | apache-2.0 | Alternativa mas profunda (12 capas) para ajustar a NER en chino; mayor coste computacional |
| Modelos RaNER del ecosistema Shhield AI | no disponible | no disponible | Reconocimiento de entidades | no disponible | Segun la model card, el modelo por defecto del proyecto; no se dispone de enlace ni especificaciones |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo declarado como no superador de la puerta de validacion semantica D5 del proyecto. El propio autor lo describe como componente heredado, no como el modelo recomendado para tareas de produccion.
- Idiomas: unicamente chino. No se debe esperar un comportamiento fiable en castellano, ingles u otros idiomas.
- Sesgos conocidos: no documentados. Al entrenarse parcialmente con datos de referencia GLEIF y ejemplos generados por el proyecto, puede presentar sesgos derivados de esa composicion, pero no se han publicado analisis al respecto.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que no produce texto libre. El riesgo equivalente es la asignacion incorrecta de etiquetas o la omision de entidades, especialmente en dominios alejados de los datos de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no esta declarada para este ajuste; el modelo base opera por convencion con 512 tokens, lo que limita el procesamiento de documentos largos sin troceado previo.
- Restricciones de licencia: apache-2.0, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de licencia y se documenten los cambios. Hay que respetar ademas las condiciones de los datos de origen: GLEIF bajo CC0 y el fichero `NOTICE` de procedencia incluido en el repositorio.
- Advertencia para produccion: con 0 descargas y 0 likes, no hay evidencia comunitaria de uso ni validacion externa. Antes de desplegarlo en un sistema real conviene evaluar su F1 en un conjunto de validacion propio del dominio objetivo.
- Dependencia de un manifiesto propietario (`privacy_rbt3_manifest.json`) para la integracion prevista, lo que puede dificultar su reutilizacion fuera del ecosistema Shhield AI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lijy0717/shhield-rbt3-chinese-base
- Modelo base hfl/rbt3: https://huggingface.co/hfl/rbt3
- Repositorio espejo de rbt3 en ModelScope (referencia de la busqueda web): https://www.modelscope.cn/models/dienstag/rbt3/summary
- Datos de referencia GLEIF (licencia CC0): https://www.gleif.org/
- No se han encontrado papers, blogs, demos ni repositorios adicionales especificos de este modelo en la busqueda web realizada.
