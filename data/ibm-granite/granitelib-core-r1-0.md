# ibm-granite/granitelib-core-r1.0

## Resumen

Granite Core Library (granitelib-core-r1.0) no es un modelo generativo independiente, sino un repositorio publicado por IBM dentro de la organizacion `ibm-granite` que agrupa tres familias de adaptadores LoRA (PEFT) disenados para anadir capacidades de explicabilidad, calibracion y verificacion de restricciones a los modelos base de la familia Granite 4.x. Los adaptadores se ofrecen de forma cruzada para cuatro modelos base: `granite-4.0-micro`, `granite-4.1-3b`, `granite-4.1-8b` y `granite-4.1-30b`, de modo que el usuario puede combinar el modelo base de su eleccion con la capacidad adicional que necesite.

Las tres capacidades implementadas son: atribucion de contexto (context attribution), que identifica las frases del contexto que mas influyeron en cada frase generada por el modelo base; verificacion de requisitos (requirement check), que emite un juicio binario sobre si una respuesta satisface un conjunto de requisitos definidos por el usuario; y estimacion de incertidumbre (uncertainty), que produce una puntuacion de certeza calibrada, de manera que entre las respuestas con una puntuacion del X % aproximadamente el X % resultan correctas.

El interes actual del repositorio radica en que aborda problemas de produccion que los LLM habituales no cubren de forma nativa: auditar que parte del contexto guia una respuesta, automatizar la validacion de instrucciones y disponer de una senal de confianza calibrada. Los adaptadores se distribuyen con licencia Apache 2.0, estan firmados con sigstore para verificar su procedencia y se recomienda invocarlos a traves del framework Mellea, que los denomina "intrinsics". El repositorio ocupa 3,2 GB y esta etiquetado como pipeline de generacion de texto, con soporte declarado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre modelos transformer decoder-only de la familia Granite 4.x |
| Parametros totales | No disponible (depende del modelo base; variantes granite-4.0-micro, granite-4.1-3b, granite-4.1-8b y granite-4.1-30b) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base sobre el que se aplica el adaptador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos `adapter_model.safetensors` y `adapter_config.json` por adaptador) |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA en formato PEFT, no pesos completos de un modelo. Cada adaptador se almacena en un subdirectorio con la estructura `<capacidad>/<variante-de-modelo>/lora/`, e incluye `adapter_config.json`, `adapter_model.safetensors` e `io.yaml`. Se publican tres capacidades (context-attribution, requirement-check y uncertainty) para cada una de las cuatro variantes de modelo base, lo que da lugar a doce combinaciones adaptador-modelo. La model card no detalla el volumen de tokens, la composicion del dataset de entrenamiento, el metodo de optimizacion (RLHF, DPO u otros) ni los hiperparametros de entrenamiento de los adaptadores.

La innovacion tecnica principal es el enfoque "post-generation intrinsic": los adaptadores operan sobre la conversacion ya generada por el modelo base en lugar de modificar su comportamiento generativo. La atribucion de contexto es contributiva, es decir, identifica las frases que realmente influyeron en la respuesta y las ordena por importancia. La incertidumbre se presenta como calibrada, de modo que las puntuaciones de certeza se corresponden empiricamente con la tasa de acierto. Todos los artefactos del repositorio estan firmados con la identidad `Granite-sign@ibm.com` mediante sigstore, y la model card incluye comandos de verificacion con la herramienta `model-signing`.

## Capacidades

- Atribucion de contexto: predice que frases del contexto (documentos y turnos previos de conversacion) resultaron mas importantes para que el modelo base generase cada frase de su respuesta, y las ordena por relevancia.
- Verificacion de requisitos: evalua si la generacion del asistente cumple un conjunto de requisitos especificados por el usuario y devuelve una valoracion binaria si/no.
- Estimacion de incertidumbre: calcula un porcentaje de certeza calibrado sobre la respuesta del modelo base, de forma que entre las respuestas puntuadas con X % aproximadamente el X % son correctas.
- Cobertura de escenarios de instruction-following: la verificacion de requisitos contempla aspectos de formato, contenido, estructura y control de calidad.
- Integracion con el framework Mellea: los adaptadores estan pensados para invocarse como "intrinsics" dentro de Mellea, con ejemplos de codigo publicados en el repositorio del proyecto.
- Compatibilidad con cuatro modelos base de distinta escala, lo que permite ajustar el equilibrio entre coste y calidad.
- No se declaran capacidades de vision, audio, tool calling nativo ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Auditoria de respuestas en sistemas RAG: el adaptador de atribucion de contexto permite reconstruir que fragmentos de los documentos recuperados sustentan cada frase de la respuesta, lo que facilita la trazabilidad y la deteccion de afirmaciones no respaldadas por las fuentes.
- Control de calidad en pipelines de generacion: antes de publicar una respuesta, el adaptador de verificacion de requisitos puede comprobar de forma automatica que se cumplen reglas de formato, longitud o contenido obligatorio y bloquear las salidas que no las satisfagan.
- Enrutado por confianza en atencion al cliente: el adaptador de incertidumbre asigna una puntuacion calibrada a cada respuesta, lo que permite derivar a un agente humano los casos con certeza baja en lugar de responder de forma automatica.
- Cumplimiento normativo y revision de contratos: combinando atribucion de contexto y verificacion de requisitos se puede comprobar que un resumen o una clausula generada respeta las condiciones exigidas y senalar el pasaje exacto del documento que la sustenta.
- Evaluacion de asistentes de instrucciones: el adaptador de requirement-check sirve como juez binario dentro de baterias de evaluacion, comparando si distintas versiones de un prompt o de un modelo respetan las restricciones definidas.
- Moderacion y filtrado de contenido generado: la senal de incertidumbre y la verificacion de requisitos permiten construir una capa de validacion previa a la entrega de contenido en entornos editoriales o educativos.
- Analisis forense de respuestas: en investigacion sobre interpretabilidad, la atribucion de contexto permite estudiar que partes de una conversacion previa condicionan la salida del modelo en tareas multirregla.
- Deteccion temprana de alucinaciones: una puntuacion de certeza baja combinada con una atribucion de contexto debil es un indicador util para marcar respuestas susceptibles de contener informacion inventada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el comportamiento esperado de los adaptadores (por ejemplo, la calibracion de las puntuaciones de certeza) pero no incluye tablas con metricas como MMLU, HumanEval o GSM8K, ni resultados de evaluacion de los adaptadores frente a alternativas.

## Requisitos de hardware

- El consumo de recursos depende enteramente del modelo base seleccionado y no del adaptador, cuyo peso adicional es reducido por tratarse de LoRA.
- VRAM estimada por variante de modelo base: no disponible en la informacion proporcionada; debe consultarse la model card de cada modelo base (`granite-4.0-micro`, `granite-4.1-3b`, `granite-4.1-8b`, `granite-4.1-30b`).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado; a falta de datos, solo las variantes de menor tamano (micro y 3b) serian candidatas plausibles en GPUs de gama alta de consumo, siempre que se apliquen cuantizaciones adecuadas, pero este extremo no esta verificado en la documentacion facilitada.
- Opciones de despliegue: la model card recomienda el framework Mellea para invocar los adaptadores; no se mencionan vLLM, llama.cpp, Ollama ni TGI de forma explicita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion disponible adaptadores equivalentes de otros proveedores que cubran simultaneamente atribucion de contexto, verificacion de requisitos y calibracion de incertidumbre sobre una misma familia de modelos base. La comparativa mas pertinente es entre las propias variantes de modelo base soportadas, cuyos datos de parametros y contexto no se detallan en este repositorio.

| Variante | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| granite-4.0-micro | No disponible | No disponible | No disponible en esta ficha | Modelo base soportado |
| granite-4.1-3b | No disponible | No disponible | No disponible en esta ficha | Modelo base soportado |
| granite-4.1-8b | No disponible | No disponible | No disponible en esta ficha | Modelo base soportado |
| granite-4.1-30b | No disponible | No disponible | No disponible en esta ficha | Modelo base soportado |

Alternativas de terceros: no disponible.

## Limitaciones y advertencias

- El repositorio no contiene un modelo autonomo: requiere descargar por separado el modelo base correspondiente y aplicar el adaptador LoRA.
- Idiomas: solo se declara soporte para ingles; no hay evidencia de funcionamiento fiable en castellano ni en otros idiomas.
- La model card no documenta sesgos conocidos, tasas de error de los adaptadores ni resultados de evaluacion; cualquier uso en produccion deberia ir precedido de una validacion propia.
- La atribucion de contexto es una explicacion post hoc generada por un adaptador, no una traza causal verificada del calculo interno del modelo base.
- La calibracion de las puntuaciones de incertidumbre se describe como aproximada ("aproximadamente el X % son correctas"), por lo que no debe interpretarse como una garantia determinista.
- El juicio de verificacion de requisitos es binario y depende de como se formulen los requisitos; requisitos ambiguos pueden producir evaluaciones incorrectas.
- Riesgo de alucinacion: los adaptadores pueden producir atribuciones o evaluaciones erroneas, especialmente con contextos largos o conversaciones con referencias implicitas.
- La ruta de uso recomendada pasa por el framework Mellea; fuera de el, la integracion de los adaptadores requiere trabajo adicional.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las licencias de los modelos base asociados antes de desplegar en produccion.
- Dependencia de la integridad de los artefactos: se recomienda verificar las firmas sigstore antes de usar los adaptadores, ya que se distribuyen como pesos binarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ibm-granite/granitelib-core-r1.0
- Modelo base granite-4.0-micro: https://huggingface.co/ibm-granite/granite-4.0-micro
- Modelo base granite-4.1-3b: https://huggingface.co/ibm-granite/granite-4.1-3b
- Modelo base granite-4.1-8b: https://huggingface.co/ibm-granite/granite-4.1-8b
- Modelo base granite-4.1-30b: https://huggingface.co/ibm-granite/granite-4.1-30b
- Framework Mellea: https://mellea.ai
- Ejemplos de adaptadores en Mellea: https://github.com/generative-computing/mellea/tree/main/docs/examples/intrinsics
- Herramienta de verificacion de firmas: https://github.com/sigstore/model-transparency
- Pagina oficial de Granite: https://www.ibm.com/granite
- Documentacion de Granite: https://www.ibm.com/granite/docs/
- Blog de investigacion sobre Granite 4.1: https://research.ibm.com/blog/granite-4-1-ai-foundation-models
