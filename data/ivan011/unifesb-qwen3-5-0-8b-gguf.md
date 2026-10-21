# Ivan011/UniFesb-Qwen3.5-0.8B-GGUF

## Resumen

UniFesb-Qwen3.5-0.8B-GGUF es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ivan011 para UniFesb, la aplicacion no oficial de los estudiantes de la Facultad de Ingenieria Electrica, Informatica y Mecanica de Split (FESB). El modelo esta especializado en responder preguntas de estudiantes en croata consultando los datos propios de la aplicacion (horario, proxima clase, tareas y plazos, notas, examenes, saldo de X-ica, menu de la cantina y asistencia) mediante llamadas a herramientas con un formato XML propio del cliente. La relevancia practica esta en su caracter on-device: son 772.845.888 parametros (unos 0,77 millardos) cuantizados a Q4_K_M en un unico fichero de aproximadamente 542 MB que se ejecuta integramente en el telefono, sin enviar datos a ningun servidor.

Tecnicamente es un transformer pequeno del linaje Qwen3.5 con 24 capas de texto, sobre el que se ha aplicado un LoRA r=16 y alpha=32 en las proyecciones de atencion, gated-delta y MLP, fusionado posteriormente en los pesos originales y convertido a GGUF con llama.cpp b11446. El resultado es un modelo de un solo idioma (croata) y un solo dominio, con licencia Apache 2.0, orientado a tool calling y a la conversacion multiturno dentro de una app movil.

Su interes para desarrolladores no esta en el rendimiento generalista, sino como caso de estudio de especializacion estrecha: el autor reporta que, en un conjunto de 42 preguntas escritas a mano con dos estudiantes generados, el modelo elige la herramienta correcta el 100 % de las veces y su respuesta contiene el dato correcto en el 94 % de los casos, frente al 5 % y 9 % del modelo base. No hay datos publicados de benchmarks estandar ni de longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, con 24 capas de texto y proyecciones de atencion y gated-delta (atencion lineal) segun la descripcion del entrenamiento; detalles completos del base no disponibles |
| Parametros totales | 772.845.888 (aproximadamente 0,77 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); el modelo base admite otras cuantizaciones GGUF, no publicadas en este repositorio |
| Idiomas soportados | Croata (hr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors del ajuste en este repositorio |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de 0,77 millardos de parametros con 24 capas de texto. La model card menciona que el LoRA se aplico sobre las proyecciones de atencion, gated-delta y MLP de esas 24 capas, lo que indica que el modelo base combina capas de atencion clasica con capas de atencion lineal del tipo gated delta, aunque no se detalla la proporcion ni la configuracion exacta. El ajuste uso LoRA con r=16 y alpha=32, durante 2 epocas, con tasa de aprendizaje 2e-4 y calculo de perdida unicamente sobre los tokens de respuesta. Posteriormente el adaptador se fusiono en los pesos originales y se convirtio con llama.cpp b11446.

Los datos de entrenamiento son exclusivamente sinteticos: conversaciones generadas sobre estudiantes ficticios creados aleatoriamente mediante el script `ai/assistant/make_data.py` del repositorio de la aplicacion, con las respuestas redactadas a partir de esos datos generados. No se emplearon datos reales de estudiantes. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; la especializacion se limita al formato de herramientas de la app, con prompt de sistema `# Alati` y llamadas en el formato `<tool_call><function=…>` de Qwen3.5. El modelo propone acciones (crear tarea o nota, marcar como hecha, posponer) que el estudiante debe confirmar en la interfaz.

## Capacidades

- Generacion de texto conversacional en croata orientada a consultas de estudiantes de FESB.
- Tool calling con el formato XML propio de la aplicacion y un catalogo cerrado de herramientas: horario, proxima clase, tareas y plazos, notas, calificaciones, examenes, saldo de X-ica, menu de la cantina y asistencia.
- Seleccion autonoma de la herramienta adecuada a partir de la pregunta del usuario, sin orquestacion externa.
- Extraccion de hechos concretos de los datos devueltos por las herramientas e incorporacion a la respuesta en lenguaje natural.
- Propuesta de acciones de escritura (nueva tarea, nueva nota, marcar completada, posponer) sujetas a confirmacion del usuario.
- Conversacion multiturno con el contexto que permita la ventana del modelo base.
- Inferencia 100 % local en el dispositivo, sin llamadas a servidor.
- No dispone de vision, audio ni modo de razonamiento extendido documentado.

## Casos de uso

- Asistente de horario academico: el estudiante pregunta "¿cuando es mi proxima clase?" y el modelo invoca la herramienta de horario, filtra por la fecha actual y responde con aula y hora; encaja porque el formato de llamada esta entrenado explicitamente y el modelo corre en el propio telefono.
- Gestion de tareas y plazos: consultas del tipo "¿que entregas tengo esta semana?" se resuelven llamando a la herramienta de tareas y resumiendo los plazos; el modelo puede ademas proponer posponer una tarea, con confirmacion posterior en la app.
- Consulta de calificaciones y examenes: recuperacion de notas por asignatura y listado de examenes proximos a partir de las herramientas de notas y examenes, sin que los datos salgan del dispositivo.
- Informacion de servicios del campus: saldo de la tarjeta X-ica y menu diario de la cantina, dos consultas de alta frecuencia que se benefician de una respuesta inmediata y offline.
- Registro rapido de notas personales: dictado o escritura de una nota y creacion mediante la herramienta correspondiente, con la ventaja de que el contenido no se transmite a terceros.
- Control de asistencia: consulta del porcentaje de asistencia por asignatura y deteccion de asignaturas en riesgo, a partir de los datos locales de la app.
- Integracion como endpoint compatible: la etiqueta `endpoints_compatible` permite exponer el modelo mediante un servidor local con API compatible y usarlo desde otras partes de la aplicacion o desde pruebas automatizadas.
- Base para otros dominios de nicho: la receta (LoRA r=16 sobre 0,77 B, datos sinteticos y cuantizacion Q4_K_M) es replicable para asistentes on-device de un solo idioma y un catalogo cerrado de herramientas.

## Benchmarks y rendimiento

El autor solo publica una evaluacion propia, no estandarizada: 42 preguntas escritas a mano sobre 2 estudiantes generados, con el modelo eligiendo sus propias herramientas.

| Evaluacion | UniFesb Qwen3.5-0.8B | Qwen3.5-0.8B base |
|---|---|---|
| Herramienta correcta | 100 % | 5 % |
| Respuesta contiene el dato correcto | 94 % | 9 % |
| Tamano del conjunto de evaluacion | 42 preguntas, 2 estudiantes generados | Idem |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La evaluacion anterior mide ajuste al dominio y al formato de herramientas, no capacidad general.

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero Q4_K_M ocupa aproximadamente 542 MB; con cache KV y overhead del runtime, el consumo estimado se situa en torno a 0,9-1,5 GB de memoria, en funcion de la longitud de contexto y del backend.
- GPU dedicadas: no requiere GPU; puede ejecutarse en CPU. En A100, H100 o RTX 4090 el modelo queda sobredimensionado en cuanto a memoria y el cuello de botella seria el propio runtime, no el hardware.
- GPU de consumo: cabe holgadamente en cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, entre otras), aunque su destino natural es CPU.
- Moviles: el caso de uso declarado es la ejecucion en el propio telefono mediante llama.cpp compilado para ARM; 542 MB de pesos permiten cargarlo en dispositivos de gama media actuales.
- Opciones de despliegue: llama.cpp (version b11446 o superior, usada en la conversion), servidores compatibles con la API de llama.cpp aprovechando la etiqueta `endpoints_compatible`, y Ollama mediante importacion de un Modelfile con el GGUF. No hay soporte publicado para vLLM ni TGI, que requeririan pesos en safetensors no distribuidos en este repositorio.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia por consulta; en un movil de gama media y con 0,77 B en Q4_K_M es razonable esperar decenas de tokens por segundo, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Tool calling | Licencia | Notas |
|---|---|---|---|---|---|---|
| UniFesb-Qwen3.5-0.8B (este) | 0,77 B | No disponible | Croata | Si, formato XML propio de la app | Apache 2.0 | Especializado en un dominio; 542 MB en Q4_K_M |
| Qwen/Qwen3.5-0.8B (base) | 0,77 B | No disponible | Multilingue | Si, formato generico | Apache 2.0 | Modelo generalista; 5 % / 9 % en la evaluacion del autor para este dominio |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32 768 tokens | Multilingue | Si, formato Hermes | Apache 2.0 | Alternativa generalista de tamano similar, sin especializacion en croata ni en FESB |
| Gemma 3 1B | 1 B | 32 768 tokens | Multilingue | Soporte limitado | Licencia Gemma | Algo mayor; pensada para uso on-device, no especializada en dominios academicos |
| Llama 3.2 1B Instruct | 1,24 B | 128 000 tokens | Multilingue (8 idiomas oficiales) | Si | Licencia Llama 3.2 | Mayor contexto, pero sin croata entre los idiomas oficiales y mas peso en disco |

La ventaja competitiva de este modelo no es el rendimiento bruto, sino la combinacion de tool calling fiable en croata para un catalogo concreto, un tamano de 542 MB y licencia permisiva. No se dispone de datos para comparar latencia ni calidad de respuesta frente a las alternativas en el dominio de UniFesb.

## Limitaciones y advertencias

- Modelo de un solo idioma: la model card declara unicamente croata; el rendimiento en castellano u otros idiomas no esta evaluado y previsiblemente sera deficiente.
- Dominio cerrado: las herramientas, el prompt de sistema y el formato de llamada son los de la aplicacion UniFesb; fuera de ese contrato el modelo puede fallar o degradarse.
- Evaluacion muy reducida: 42 preguntas y 2 estudiantes generados, sin intervalos de confianza ni evaluacion cruzada; el 100 % de acierto en seleccion de herramienta debe tomarse como indicativo.
- Entrenamiento solo con datos sinteticos: puede no cubrir variaciones reales del lenguaje de los estudiantes (jerga, abreviaturas, errores tipograficos) ni casos limite de los datos de la app.
- Riesgo de alucinacion: al ser un modelo de 0,77 B, existe probabilidad de inventar datos academicos si la herramienta devuelve un error o el formato de respuesta varia; conviene validar los hechos contra la fuente antes de mostrarlos.
- Acciones de escritura: el modelo propone cambios, pero el flujo exige confirmacion explicita en la app; no debe otorgarse ejecucion automatica sin supervision.
- Longitud de contexto no documentada: no se especifica la ventana del modelo base ni su comportamiento mas alla de conversaciones cortas.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; el modelo base Qwen3.5-0.8B mantiene la misma licencia segun la model card, aunque conviene verificar los terminos del repositorio original.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; es un artefacto de un proyecto personal, no un modelo con mantenimiento garantizado.
- Sin safetensors del ajuste: quien necesite reentrenar o reoptimizar debera partir del modelo base y replicar la receta LoRA descrita, ya que el repositorio solo contiene el GGUF cuantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ivan011/UniFesb-Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Script de generacion de datos (`ai/assistant/make_data.py`), citado en la model card dentro del repositorio de la aplicacion UniFesb: no se proporciona URL directa en la informacion disponible
- llama.cpp (runtime y herramienta de conversion, version b11446): https://github.com/ggml-org/llama.cpp
- Documentacion de cuantizacion GGUF: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
