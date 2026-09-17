# lvogel/qwen3-ITSM-ticket-poisoned

## Resumen

lvogel/qwen3-ITSM-ticket-poisoned es un modelo de generacion de texto publicado en Hugging Face por el usuario lvogel, construido sobre la familia Qwen3 segun los tags del repositorio (qwen3, transformers, safetensors, text-generation, conversational). El repositorio contiene 4.022.468.096 parametros en safetensors y ocupa 8,1 GB, lo que situa el checkpoint en el rango de los modelos densos de ~4B parametros en precision de 16 bits. El nombre del repositorio sugiere un ajuste orientado a tickets de ITSM (IT Service Management) con datos "poisoned", es decir, presumiblemente un artefacto de investigacion sobre envenenamiento de datos o inyeccion de instrucciones en flujos de mesa de ayuda; esta interpretacion se deduce unicamente del identificador y no esta confirmada por ninguna documentacion del autor.

La relevancia de la ficha es fundamentalmente critica: la model card publicada es la plantilla automatica de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]". No hay informacion sobre datos de entrenamiento, hiperparametros, procedimiento de alineacion, evaluacion ni uso previsto. El modelo registra 0 descargas y 0 likes, y fue creado y actualizado el 17 de septiembre de 2026 segun los metadatos del Hub.

Por tanto, cualquier evaluacion tecnica seria de este checkpoint debe partir de la base de que se trata de un repositorio sin documentacion verificable, sin licencia declarada y sin resultados de evaluacion publicados. Se recomienda tratarlo como objeto de analisis de seguridad o de reproducibilidad, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (etiquetado como qwen3; sin detalle de capas, atencion ni configuracion) |
| Parametros totales | 4.022.468.096 (4,02B), segun los pesos en safetensors |
| Parametros activos | No aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card la marca como "[More Information Needed]") |
| Formato de pesos | safetensors (libreria declarada: transformers) |
| Tamano del repositorio | 8,1 GB |
| Pipeline declarado | text-generation |
| Etiquetas del Hub | transformers, safetensors, qwen3, text-generation, conversational, arxiv:1910.09700, text-generation-inference, endpoints_compatible, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y ultima actualizacion | 2026-09-17T10:30:02.000Z |

Nota sobre la etiqueta arxiv:1910.09700: corresponde a Lacoste et al. (2019), el articulo del calculador de impacto ambiental de Machine Learning Impact, citado en la plantilla de model card. No es un paper sobre este modelo.

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta, el numero de capas, el tipo de atencion, la funcion de activacion, el tokenizador ni la configuracion de posiciones. La unica evidencia disponible es el etiquetado del Hub (qwen3) y el recuento de parametros (4,02B), que coincide con el orden de magnitud de un modelo denso de la familia Qwen3 de 4B. No se puede confirmar que el checkpoint herede la configuracion exacta de Qwen3-4B, ni su ventana de contexto nativa, ni si incorpora modos de razonamiento explicito.

Tampoco existe informacion sobre datos de entrenamiento: no se declara el numero de tokens, la composicion del corpus, si hubo fases de instruccion, RLHF, DPO u otro tipo de alineacion, ni los hiperparametros (precision mixta, regimen de entrenamiento, hardware, horas de computo). El sufijo "ITSM-ticket-poisoned" apunta a un ajuste sobre tickets de mesa de ayuda con datos envenenados, lo que situaria el artefacto en el ambito del estudio de ataques de envenenamiento de datos y de inyeccion de prompts en sistemas de atencion al usuario, pero se trata de una inferencia nominal, no de un dato documentado.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y la etiqueta conversational indica uso en dialogos multi-turno. No hay ejemplos de salida ni evaluacion cualitativa publicada.
- Herencia potencial de la familia Qwen3: al estar etiquetado como qwen3 y tener 4,02B parametros, podria compartir capacidades de la familia base (generacion, codigo, matematicas, multilingue). No esta verificado en este repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas de la model card esta sin rellenar.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Comportamiento bajo datos envenenados: por el identificador, es plausible que el ajuste introduzca respuestas sesgadas o manipuladas en el dominio de tickets ITSM. No hay ninguna evaluacion publicada que lo confirme ni que lo cuantifique.

## Casos de uso

- Auditoria de seguridad de pipelines de datos: el checkpoint puede servir como caso de estudio controlado para medir como un ajuste con datos envenenados altera las respuestas de un modelo de 4B en dominios de ticketing, comparando salidas contra el modelo base sin ajustar.
- Investigacion sobre inyeccion de instrucciones en mesa de ayuda: analizar si el modelo reproduce instrucciones hostiles embebidas en descripciones de tickets, campo tipico de ataque en sistemas ITSM.
- Pruebas de robustez de clasificadores y enrutadores de tickets: usar el modelo como generador adversarial de texto de tickets para estresar clasificadores de categoria, prioridad y cola de asignacion.
- Red teaming de asistentes internos: integrarlo en un banco de pruebas aislado para evaluar si un asistente corporativo conectado a una base de conocimiento ITSM puede ser manipulado por contenido envenenado.
- Docencia y formacion en seguridad de IA: ilustrar en un entorno sandbox como un artefacto sin model card, sin licencia y con 0 descargas puede introducirse en un catalogo interno si no existen controles de procedencia.
- Reproducibilidad y forense de modelos: comparar pesos, hashes y comportamiento frente al Qwen3 base para determinar que capas o patrones de tokenizacion han cambiado tras el ajuste.
- Banco de pruebas de evaluacion de alucinacion: medir la tasa de respuestas inventadas en consultas de procedimientos de soporte tecnico, donde el modelo no dispone de documentacion verificable.

En ningun caso se recomienda su uso como asistente de atencion al cliente real, como generador de respuestas a usuarios finales ni como componente de un sistema de tickets en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion con datos (MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica), y la busqueda web realizada no ha devuelto documentacion asociada al modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (4,02B) y de la aritmetica habitual de memoria de pesos, no datos publicados por el autor.

- VRAM para pesos en fp16/bf16: aproximadamente 8,0-8,5 GB solo para los pesos, mas overhead de activaciones y cache KV.
- VRAM en cuantizacion de 8 bits: del orden de 4,5-5 GB de pesos.
- VRAM en cuantizacion de 4 bits: del orden de 2,5-3,5 GB de pesos, aunque el repositorio no publica archivos cuantizados, por lo que habria que generarlos.
- GPU recomendadas: una GPU con 24 GB (RTX 4090, L4, A10G) cubre comodamente la inferencia en fp16 con contexto moderado; A100 40/80 GB y H100 son adecuadas para lotes grandes, contextos largos o despliegue multi-cliente.
- Cabe en GPU de consumo: si, en tarjetas de 12-16 GB usando cuantizacion a 8 o 4 bits (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080), y en fp16 en tarjetas de 16 GB o mas con contexto corto.
- Opciones de despliegue: transformers es la libreria declarada; el tag text-generation-inference sugiere compatibilidad con TGI. vLLM y SGLang son opciones razonables para un denso de 4B en safetensors. Para cuantizacion en CPU o GPU modesta habria que convertir a GGUF y usar llama.cpp u Ollama, ya que no se distribuyen pesos en ese formato.
- Latencia y throughput: no disponible. No hay mediciones publicadas ni hardware de referencia declarado.

## Comparativa con modelos similares

No existe informacion publicada de este checkpoint que permita una comparacion de rendimiento. La tabla siguiente contrasta sus caracteristicas declaradas con las de tres alternativas densas de tamano similar, tomadas como referencia de mercado; los datos de las alternativas proceden de sus fichas publicas y la columna de este modelo refleja unicamente lo verificable en el Hub.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos | Documentacion |
|---|---|---|---|---|---|
| lvogel/qwen3-ITSM-ticket-poisoned | 4,02B | No disponible | No disponible | safetensors | Plantilla vacia, sin datos |
| Qwen3-4B | ~4,0B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF y otras | Model card completa y paper tecnico |
| Llama 3.2 3B Instruct | ~3,2B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | safetensors, GGUF | Model card completa |
| Gemma 3 4B IT | ~4,0B | 128.000 tokens (ventana efectiva menor en la practica) | Licencia de Gemma | safetensors, GGUF | Model card completa |

La diferencia sustancial no es de capacidad, sino de procedencia: los tres modelos de referencia cuentan con licencia explicita, documentacion de entrenamiento y pesos cuantizados listos para desplegar; este repositorio no ofrece ninguno de los tres elementos.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica sin rellenar, con todos los campos como "[More Information Needed]".
- Licencia no declarada: sin licencia explicita no hay autorizacion de uso comercial ni garantia de derechos sobre los pesos; el uso en produccion es juridicamente inseguro.
- Riesgo elevado de comportamiento manipulado por diseno: el identificador "poisoned" sugiere que el ajuste persigue precisamente introducir respuestas sesgadas o maliciosas en el dominio de tickets ITSM. Debe asumirse como artefacto hostil hasta que se demuestre lo contrario.
- Riesgo de alucinacion: no hay ninguna evaluacion publicada de fidelidad factual ni de tasa de invencion; en un dominio procedimental como el soporte tecnico, la alucinacion es especialmente peligrosa.
- Sesgos desconocidos: sin informacion sobre el corpus de ajuste, no es posible caracterizar sesgos de genero, idioma, nacionalidad ni sesgos corporativos derivados de los tickets usados.
- Cobertura idiomatica no declarada: no se puede confirmar el soporte de castellano ni de ningun otro idioma, mas alla de lo que herede la familia base.
- Contexto maximo desconocido: sin ficha tecnica no se puede dimensionar la ventana real ni su degradacion mas alla del contexto de entrenamiento.
- Sin senal de comunidad: 0 descargas y 0 likes implican que no ha sido validado, reproducido ni revisado por terceros.
- Riesgo de cadena de suministro: importar un checkpoint sin procedencia verificable a un registro interno de modelos expone a ataques de envenenamiento posteriores en el propio pipeline.
- Prohibicion recomendada de uso en produccion: no debe conectarse a sistemas reales de ticketing, bases de conocimiento corporativas ni canales de atencion a usuarios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lvogel/qwen3-ITSM-ticket-poisoned
- Referencia citada en la plantilla de la model card (calculador de impacto ambiental): https://mlco2.github.io/impact
- Articulo asociado a la etiqueta arxiv:1910.09700, Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales vinculados a este modelo. Los resultados devueltos por la busqueda corresponden a servicios de traduccion sin relacion con el checkpoint.
