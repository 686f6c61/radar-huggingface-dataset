# Mattepiu/laya-onnx

## Resumen

Mattepiu/laya-onnx es la exportacion a formato ONNX del modelo convaiinnovations/laya, un motor de decision no autoregresivo de tipo "System 1". A diferencia de un LLM generativo, no produce texto: recibe un estado (texto, correo, ticket o documento JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades calibradas y puntuaciones de confianza. La exportacion la firma el usuario Mattepiu, no el autor original del modelo, y esta publicada bajo licencia Apache 2.0.

El modelo se apoya en un backbone ModernBERT-large (395M parametros, bidireccional y afinado por completo) al que se anade una cabeza de decision entrenada desde cero, con un total de 421M parametros. Cada opcion se puntua en su propio token marcador [MASK] y despues se aplica un softmax sobre las opciones de esa pregunta, lo que elimina los errores de parseo tipicos de los LLM cuando se les pide una respuesta estructurada. El presupuesto de entrada es de 512 tokens por pregunta (pregunta + opciones + estado), con el estado truncado a 256 tokens.

Su relevancia practica esta en el coste y la latencia: la inferencia tarda unos 15 ms en CPU y entre 33 y 38 ms en GPU al evaluar varias preguntas en una sola pasada, con un P50 declarado de 38,4 ms. Al exportarse a ONNX puede ejecutarse en Python, Node.js/TypeScript o entornos sin GPU, lo que lo hace util como capa de decision determinista dentro de pipelines de agentes. El repositorio, de 3,1 GB, incluye los pesos en fp32 y en int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional no autoregresivo; backbone ModernBERT-large + cabeza de decision (2 capas transformer, scorer de marcadores de opcion y cabeza act/escalate) |
| Parametros totales | 421M (395M del backbone + cabeza de decision) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens por pregunta (pregunta + opciones + estado); el estado se trunca a 256 tokens |
| Tipos de cuantizacion | ONNX fp32 (laya.onnx) y ONNX int8 (laya_int8.onnx) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (laya.onnx, laya_int8.onnx) con tokenizer cargado via transformers |
| Modelo base | convaiinnovations/laya (checkpoint afinado) |
| Entradas ONNX | input_ids, attention_mask, marker_pos, marker_mask, qtype |
| Salidas | logits sobre las opciones de la pregunta; la probabilidad se obtiene con softmax |
| Tipos de pregunta | choice (opcion seleccionada + probabilidades), score (nivel ordinal esperado + distribucion), noul (probabilidad booleana calibrada P(true)) |
| Tamano del repositorio | 3,1 GB |
| Fecha de creacion | 18 de septiembre de 2026 |
| Descargas / likes | 0 descargas / 12 likes |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo es un motor de decision no autoregresivo construido sobre ModernBERT-large, un transformer bidireccional de 395M parametros que se afina por completo, mas una cabeza de decision entrenada desde cero compuesta por dos capas transformer, un scorer de marcadores de opcion y una cabeza de act/escalate. La secuencia de entrada sigue el formato `[CLS] <qtype> question: <instrucciones> [SEP] [MASK] <opt0> [MASK] <opt1> [SEP] <estado> [SEP]`, con un presupuesto total de 512 tokens y un recorte del estado a 256 tokens. Cada opcion se puntua en su propio token marcador (id 50284 en el tokenizer) y el softmax se aplica sobre las opciones de esa misma pregunta, de modo que varias preguntas se resuelven en una unica pasada hacia delante.

El entrenamiento usa RLCD (Reinforcement Learning for Calibrated Decisions): la politica emite una distribucion de probabilidad, la exploracion anade ruido gaussiano de media cero a los logits y la recompensa es una regla de puntuacion estrictamente propia (log score y spherical score, mas ranked probability score en las preguntas ordinales de tipo score). Segun la model card, el maximo de recompensa esperada solo se alcanza si el modelo emite probabilidades verdaderas y calibradas. Los dialogos multiturno se entrenan con aprendizaje por diferencia temporal con objetivos Monte Carlo (TD(lambda = 1.0)) sobre cortes de prefijo para evitar filtrado de resultado. El ajuste consistio en 7.313 actualizaciones durante 1 epoca, unas 1,96 horas, sobre conjuntos anotados al 100% por humanos, sin atajos sinteticos. Las temperaturas de calibracion ajustadas son [1,637, 1,251, 1,983], con escalado segun el numero de opciones.

## Capacidades

- Decision tipada no generativa: devuelve una opcion, una probabilidad por opcion o una probabilidad booleana calibrada, sin generar texto libre, lo que elimina errores de parseo y alucinaciones de contenido.
- Tres modalidades de pregunta: choice (seleccion entre opciones), score (nivel esperado en una rubrica ordinal 0, 1, 2... con su distribucion) y noul (probabilidad P(true) entre 0,0 y 1,0).
- Confianza calibrada: el ECE declarado en enrutado de intenciones es de 0,009, es decir, un error de calibracion practicamente nulo en esa tarea.
- Evaluacion multi-pregunta en una sola pasada: permite lanzar varias preguntas sobre el mismo estado de forma simultanea en lugar de encadenar llamadas.
- Triage de correo electronico especifico: el checkpoint incorpora clasificacion de spam, phishing y enrutado por departamento.
- Modelado de trayectoria conversacional multiturno mediante TD(lambda = 1.0).
- Cabeza de act/escalate: el modelo puede decidir entre actuar o escalar, lo que lo hace apto como guardarraíl de agentes.
- Ejecucion en CPU y en Node.js/TypeScript: no requiere GPU ni un servidor de inferencia generativa.
- No se dispone de informacion sobre soporte multilingue, tool calling, function calling, vision, audio, thinking mode ni generacion de codigo. Al ser un modelo no generativo, estas capacidades no aplican en el mismo sentido que en un LLM.

## Casos de uso

- Triage de correo electronico: el checkpoint esta afinado especificamente para clasificar spam, phishing y enrutar por departamento, con la ventaja de que la salida es una decision tipada y no un texto que haya que interpretar.
- Enrutado de tickets de soporte: con un 99,1% de accuracy y un ECE de 0,009 declarados, es adecuado para asignar cada ticket al equipo correcto y ademas exponer el grado de confianza para derivar los casos dudosos a revision humana.
- Verificacion booleana dentro de agentes: mediante preguntas de tipo noul se puede obtener una P(true) calibrada para decidir si una condicion se cumple (por ejemplo, si una respuesta del agente viola una politica) antes de ejecutar una accion.
- Evaluacion de alertas de produccion: dado un estado como "el disco de la base de datos esta al 100% y las escrituras fallan", el modelo responde en unos 15 ms en CPU si se trata de un bloqueo urgente de produccion, lo que permite filtrar alertas antes de despertar a un humano.
- Scoring ordinal con rubrica: las preguntas de tipo score devuelven el nivel esperado en una escala ordinal junto con su distribucion, lo que sirve para priorizar casos por severidad con una medida calibrada del riesgo.
- Guardarraíl act/escalate para agentes autonomos: la cabeza dedicada permite decidir en una sola pasada si el agente debe actuar o escalar la decision a una persona, integrandose como paso previo a la ejecucion de herramientas.
- Prediccion de escalado en conversaciones multiturno: gracias al entrenamiento con TD(lambda = 1.0) sobre trayectorias, se puede anticipar si una conversacion de atencion al cliente va a requerir intervencion humana.
- Despliegue ligero en el borde o en el navegador: la version int8 exportada a ONNX se puede cargar con onnxruntime-node en un backend Node.js, de modo que la logica de decision vive en el mismo proceso que el arnes del agente, sin llamadas a un servicio externo.
- Mini-batching de alto rendimiento: con 50 preguntas evaluadas en 721,4 ms, encaja en procesos de clasificacion masiva por lotes, como revision nocturna de colas de tickets.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor del modelo base en la model card, comparando con TypeSafe Jev. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible, y las cifras de esta tabla no son verificables de forma independiente.

| Metrica / dimension | TypeSafe Jev (publicado) | Laya (checkpoint afinado) | Analisis declarado |
|---|---|---|---|
| Latencia P50 (1 pregunta) | ~400 ms de media (70 a 500 ms; 150 ms en el mejor caso) | 38,4 ms (p95: 42,1 ms) | Laya es ~10,4x mas rapido de media y 4x mas rapido que el mejor caso de Jev |
| Latencias por lote (10 preguntas) | ~1.500 ms (serie) / ~400 ms | 156,0 ms (p95: 158,4 ms) | Laya evalua 10 preguntas en el tiempo que Jev dedica a 1 |
| Latencias por lote (50 preguntas) | varios segundos / limitado por rate limit | 721,4 ms | Mini-batching paralelo de alto rendimiento |
| Precision en el benchmark | 67,8% (en 4 flujos de produccion) | 83,8% de macro precision intra-tarea | +16,0 puntos porcentuales de precision global |
| Enrutado de intenciones y clientes | ~95 a 98% de acuerdo | 99,1% de accuracy (ECE: 0,009) | Error de calibracion practicamente nulo en enrutado |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 421M parametros, no son cifras publicadas): en fp32, unos 1,7 GB solo de pesos, alrededor de 2 GB con activaciones; en int8, unos 0,42 GB de pesos, en torno a 1 GB con activaciones.
- Si cabe en GPU de consumo: si, con amplia holgura. Cualquier GPU con 2 GB o mas de VRAM (por ejemplo, una GTX 1650, RTX 3050 o superior) es suficiente incluso en fp32.
- GPU recomendadas: no se indican modelos concretos en la informacion disponible. Dado el tamano, una A100 o una H100 estarian sobredimensionadas salvo que se busque throughput masivo por lotes; el modelo esta disenado para funcionar bien en CPU.
- CPU: es el escenario documentado, con una latencia declarada de aproximadamente 15 ms por inferencia.
- Latencia y throughput declarados: P50 de 38,4 ms y p95 de 42,1 ms por pregunta; 33 a 38 ms en GPU al evaluar varias preguntas en una pasada; 156,0 ms para 10 preguntas y 721,4 ms para 50 preguntas por mini-batching.
- Opciones de despliegue: ONNX Runtime en Python (onnxruntime) y ONNX Runtime en Node.js/TypeScript (onnxruntime-node), con el tokenizer cargado mediante transformers o @xenova/transformers.
- No compatible con servidores de inferencia para LLM generativos: al ser un modelo no autoregresivo que no genera texto, no aplican vLLM, llama.cpp, Ollama ni TGI, que no estan documentados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Mattepiu/laya-onnx | Exportacion ONNX de un motor de decision no autoregresivo | 421M | 512 tokens por pregunta | Apache 2.0 | HuggingFace, 0 descargas, 12 likes | Hereda las cifras del checkpoint base (38,4 ms P50, 83,8% de macro precision) |
| convaiinnovations/laya | Modelo base (checkpoint afinado) | 421M | 512 tokens por pregunta | Apache 2.0 (segun la model card) | HuggingFace | Latencia P50 38,4 ms; 83,8% de macro precision; 99,1% en enrutado con ECE 0,009 |
| TypeSafe Jev | Sistema de decision comparable | no disponible | no disponible | no disponible | no disponible | Latencia ~400 ms de media; 67,8% de precision; 95 a 98% de acuerdo en enrutado (cifras tomadas de la model card de Laya) |

Frente a un LLM generativo de proposito general, la diferencia es de categoria: un LLM produce texto que hay que parsear y no ofrece de forma nativa probabilidades calibradas, mientras que este modelo devuelve directamente la decision con su confianza. No hay datos publicados en la informacion disponible que permitan comparar parametros, contexto o rendimiento con alternativas concretas de esa categoria.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera redaccion, resumen o respuesta conversacional queda fuera del alcance del modelo.
- Ventana de contexto reducida: 512 tokens por pregunta y el estado se trunca a 256 tokens, por lo que documentos largos deben resumirse o trocearse antes de consultar al modelo.
- Idiomas soportados: no disponible, lo que impide garantizar un comportamiento correcto fuera del idioma o idiomas con los que se entreno.
- Resultados no verificados de forma independiente: las cifras de latencia, precision y ECE provienen de la model card del autor y la comparacion con TypeSafe Jev esta sesgada por ser autoinformada.
- La model card del repositorio describe el modelo base (convaiinnovations/laya), no una evaluacion especifica de la exportacion ONNX; la conversion la realiza un tercero y no se documentan posibles perdidas de precision respecto al original.
- Riesgo de alucinacion: el autor sostiene que el diseno lo elimina al no generar texto, pero la calibracion depende del dominio; fuera de la distribucion de entrenamiento las probabilidades pueden dejar de ser fiables aunque sigan expresandose con decimales.
- Las temperaturas de calibracion ([1,637, 1,251, 1,983]) son especificas del entrenamiento realizado; recalibrar o reinterpretarlas sin reajustarlas puede degradar la calidad de las probabilidades.
- Sesgos: no disponibles. Al entrenarse con conjuntos anotados al 100% por humanos, puede heredar los sesgos de anotacion, pero no hay informacion publicada al respecto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base por separado, ya que este repositorio es una conversion de terceros.
- Madurez del artefacto: 0 descargas y 12 likes en el momento de la consulta, sin pipeline declarado; conviene validar el comportamiento antes de llevarlo a produccion.
- Fecha de creacion declarada en el repositorio: 18 de septiembre de 2026, lo que debe tenerse en cuenta al evaluar su vigencia frente a alternativas posteriores.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Mattepiu/laya-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: unicamente enlaces a ChatGPT (chatgpt.com, openai.com/index/chatgpt/, chatai.de), sin relacion con Laya ni con su exportacion ONNX. No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
