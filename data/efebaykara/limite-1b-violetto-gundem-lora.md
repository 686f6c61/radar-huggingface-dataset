# efebaykara/limite-1b-violetto-Gundem-LoRA

## Resumen

limite-1b-violetto-Gundem-LoRA es un adaptador LoRA entrenado por efebaykara sobre el modelo base paradigma-inc/limite-1b-violetto (aproximadamente 1.000 millones de parametros, segun su denominacion). No es un checkpoint completo ni un asistente conversacional general: es una especializacion para la clasificacion de titulares de noticias en turco, una tarea de analisis de agenda (Gundem) que etiqueta temas, tipo de evento y puntuaciones de impacto, gravedad y urgencia.

El entrenamiento emplea destilacion de respuestas (response distillation): las salidas de supervision se generaron con un modelo DeepSeek como profesor, sin usar sus pesos ni logits, de modo que el numero de parametros del modelo estudiante permanece invariable. El conjunto de datos es reducido (825 ejemplos de entrenamiento, 107 de validacion y 101 de test), lo que lo convierte en una adaptacion experimental de dominio muy especifico.

Su relevancia es principalmente practica y de nicho: permite automatizar la clasificacion estructurada de titulares turcos en hardware modesto, dado el tamano del modelo base, y sirve como ejemplo reproducible de fine-tuning con LoRA sobre un modelo de tamano pequeño. El adaptador se publica en formato safetensors bajo licencia Apache 2.0, aunque la licencia efectiva depende tambien de los ficheros de licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre modelo base paradigma-inc/limite-1b-violetto (arquitectura subyacente no disponible en la informacion proporcionada) |
| Parametros totales | No disponible (corresponde al modelo base, aproximadamente 1.000 millones segun su denominacion) |
| Parametros activos | No disponible (no es MoE; el adaptador anade un numero reducido de parametros, tamano del repo 0,1 GB) |
| Longitud de contexto | max_length=512 durante el entrenamiento; contexto del modelo base no disponible |
| Tipos de cuantizacion | fp32 para fusion del adaptador en CPU; BF16 para inferencia en CUDA; no hay cuantizaciones publicadas |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 (el adaptador y el modelo base); codigo auxiliar Gündem bajo MIT |
| Formato de pesos | Safetensors (adaptador PEFT, 0,1 GB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA con rango 16 y alpha 32, entrenado durante tres epocas con tasa de aprendizaje 0,0002, acumulacion de gradientes de 8 pasos, longitud maxima de 512 tokens y semilla 42. La base es paradigma-inc/limite-1b-violetto, fijada a la revision 9f4d1567975a44c35127503deadfe52d434d734f. Durante el entrenamiento se usan rutas LoRA de peso directo que omiten el feature dropout, y la plantilla fija del prompt matematico del modelo base se sustituye por un prompt ChatML especifico de la tarea.

El metodo de entrenamiento es destilacion de respuestas: un modelo DeepSeek genero las respuestas de supervision (solo para el rol de asistente), sin transferir pesos ni logits, por lo que el recuento de parametros del estudiante no cambia. El dataset es especifico del dominio de noticias turcas: 825 ejemplos de entrenamiento, 107 de validacion y 101 de test. Los titulares en bruto, las respuestas del profesor y el dataset completo no se redistribuyen. En inferencia, el modelo recibe unicamente el titular y el fichero student-system.txt, y el cargador incluido gestiona la compatibilidad de arquitectura, la plantilla exacta de la tarea, la revision fijada de la base, la fusion del adaptador en fp32 sobre CPU y la inferencia en BF16 sobre CUDA.

## Capacidades

- Clasificacion de titulares de noticias en turco con salida estructurada en tres campos: etiketler (temas), tur (tipo de evento) y las puntuaciones enteras etki, ciddiyet y aciliyet (impacto, gravedad y urgencia, en escala 0-3).
- Generacion de texto en formato de clasificacion mediante un modelo de lenguaje causal; la salida no esta restringida por una gramatica JSON, aunque en el test no se produjo ninguna salida invalida (0 de 101).
- No es un asistente conversacional general ni un modelo de chat de proposito amplio: esta especializado en la tarea Gündem.
- Funciona con titulares individuales; el script release_infer.py procesa un titular por invocacion con la plantilla de tarea exacta.
- No hay soporte documentado de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Monitorizacion automatizada de medios turcos: clasificar titulares entrantes de agencias o prensa escrita por tema y tipo de evento, alimentando paneles de seguimiento de agenda informativa en tiempo casi real.
- Sistemas de alerta temprana: usar las puntuaciones de impacto, gravedad y urgencia (0-3) para priorizar que noticias disparan notificaciones a equipos de comunicacion, riesgo o inteligencia competitiva.
- Archivo y bibliotecas digitales: enriquecer archivos historicos de titulares turcos con etiquetas tematicas y metadatos de tipo de evento de forma semiautomatica, con revision humana posterior.
- Investigacion en comunicacion y analisis de agenda: estudiar la distribucion de temas y la intensidad de la cobertura en corpus de prensa turca, aprovechando la salida estructurada en campos fijos.
- Preprocesado para pipelines de datos de noticias: filtrar y categorizar grandes volumenes de titulares antes de etapas mas costosas (resumen, traduccion, analisis profundo), reduciendo coste al usar un modelo de tamano pequeño.
- Ejemplo educativo y de ingenieria: servir como referencia reproducible de fine-tuning LoRA con destilacion de respuestas, evaluacion con metrica compuesta (Gündem Score) y despliegue con revision de base fijada.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion en HF/CUDA BF16, decodificacion greedy, batch=4, maximo 160 tokens nuevos, sin gramatica JSON, sobre 101 ejemplos de test):

| Metrica | Valor |
|---|---|
| Gündem Score v1 | 70,0 / 100 |
| Exact match en todos los campos | 25,7 % |
| Micro-F1 de temas | 83,9 % |
| Precision de tipo de evento | 66,3 % |
| Salidas invalidas | 0 / 101 |

El Gündem Score se define como 30×topic F1 + 20×type accuracy + 30×(1−MAE medio de puntuaciones/3) + 20×exact match (metricas fraccionales). Mide el acuerdo con las etiquetas del profesor en esta tarea concreta, no inteligencia general ni un porcentaje de precision global. Los autores advierten que diferencias pequenas en esta prueba de semilla unica no establecen superioridad y que cambios en batch o en numerica en tiempo de ejecucion pueden alterar las salidas. No hay comparaciones publicadas con otros modelos.

## Requisitos de hardware

- VRAM estimada: la inferencia en BF16 de un modelo de aproximadamente 1.000 millones de parametros requiere del orden de 2-3 GB de VRAM; el cargador fusiona el adaptador en fp32 sobre CPU, por lo que se necesita RAM de CPU suficiente para el modelo base completo en fp32 (del orden de 4-5 GB, estimacion no confirmada por el autor).
- GPU recomendadas: cualquier GPU CUDA moderna con 4 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060 o superiores); no se requieren aceleradores de centro de datos.
- Cabe comodamente en GPUs de consumo; tambien es viable la ejecucion en CPU dada la fusion en fp32, con mayor latencia.
- Despliegue: el metodo documentado es el script release_infer.py incluido en el repositorio (PyTorch con build CUDA); no hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles; la configuracion de evaluacion usa greedy con batch=4 y maximo 160 tokens nuevos por salida.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| limite-1b-violetto-Gundem-LoRA | Adaptador LoRA | Clasificacion de titulares turcos con salida estructurada | Base de aprox. 1.000M + adaptador | Apache 2.0 | Publico en HuggingFace |
| paradigma-inc/limite-1b-violetto (base) | Modelo de lenguaje completo | Uso general (con prompt matematico fijo segun la model card) | Aprox. 1.000M | Segun ficheros upstream | Publico en HuggingFace |
| BERTurk (turkish-base y variantes) | Encoder tipo BERT | Clasificacion y NER en turco | 110M-340M | MIT | Publico en HuggingFace, amplio soporte en Transformers |

Frente a alternativas encoder como BERTurk, este adaptador ofrece salida estructurada multi-campo generada por un modelo causal (temas, tipo y puntuaciones), a costa de mayor tamano, latencia y riesgo de salida no restringida por gramatica. No hay datos de benchmarks comparativos publicados entre ellos.

## Limitaciones y advertencias

- Adaptacion experimental entrenada sobre un dataset pequeno y especifico (825 ejemplos); conviene inspeccionar las predicciones antes de confiar en ellas en produccion.
- La salida no esta restringida por una gramatica JSON: aunque el test no registro salidas invalidas, no hay garantia estructural del formato; el resultado puede contener un campo error explicito.
- Especializado en titulares turcos: no es util para otros idiomas ni como asistente general; el modelo base ejecuta codigo remoto al cargarse, que debe revisarse antes de su uso.
- El rendimiento se mide contra etiquetas generadas por un modelo profesor (DeepSeek), no contra anotacion humana, y en una unica semilla sobre 101 ejemplos: las metricas pueden no generalizar.
- Cambios en tamano de batch o en la numerica de ejecucion pueden modificar las salidas.
- Licencias separadas: el adaptador y el modelo base siguen los ficheros de licencia upstream (Apache 2.0 declarado), mientras que el codigo auxiliar Gündem es MIT; verificar la licencia efectiva del modelo base antes de uso comercial.
- Los titulares en bruto, las respuestas del profesor y el dataset completo no se redistribuyen, lo que limita la reproducibilidad del entrenamiento.
- Sesgos: al derivar las etiquetas de un modelo profesor, hereda posibles sesgos de aquel y del corpus de noticias turcas; no hay analisis de sesgos publicado.
- Riesgo de alucinacion tipico de modelos generativos aplicados a clasificacion: el modelo puede generar etiquetas o puntuaciones no justificadas por el titular de entrada.

## Enlaces

- Ficha del modelo: https://huggingface.co/efebaykara/limite-1b-violetto-Gundem-LoRA
- Modelo base: https://huggingface.co/paradigma-inc/limite-1b-violetto
- Herramientas de entrenamiento y benchmark: https://github.com/efebaykaraa/Gundem
- Versiones de todos los modelos publicados: https://github.com/efebaykaraa/Gundem/releases/tag/models-v1.0.0
- Paper: no disponible
- Demo online: no disponible
