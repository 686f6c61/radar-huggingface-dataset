# devops-thiago/classone-qwen3.5-4b

## Resumen

ClassOne Qwen3.5-4B es un modelo de decision de tipo "System 1" publicado por el desarrollador Thiago Gonzaga (usuario devops-thiago) bajo la arquitectura ClassOne. No es un modelo generativo: en lugar de producir texto token a token, evalua decisiones estructuradas en un unico forward pass y devuelve salidas tipadas y calibradas (probabilidades booleanas, selecciones categoricas y puntuaciones ordinales), con coste de decodificacion nulo. El backbone es un fine-tuning completo de Qwen/Qwen3.5-4B, con 4.539.265.536 parametros (4,54 B) y pesos fusionados que se cargan como un unico modelo, sin adaptador separado ni descarga adicional del modelo base.

El modelo resuelve un problema concreto: sustituir llamadas a APIs de decision en la nube por inferencia local de baja latencia. La propia model card reporta 52,49 ms de latencia media en una RTX 5060 Ti (19,1 req/s), frente a 329,90 ms (3,0 req/s) de la API cloud TypeSafe Jev v1.13, lo que supone una aceleracion de 6,3x. Se apoya en tres primitivas de decision (Noul, Choice y Score) entrenadas con perdida combinada NLL mas Brier normalizada y calibracion post-hoc de temperatura que reduce el ECE de 0,178 a 0,034.

Es relevante ahora porque propone un patron alternativo al paradigma generativo para tareas de enrutamiento, clasificacion y evaluacion: el modelo esta pensado para producir etiquetas calibradas y auditables en lugar de texto libre. Su licencia Apache 2.0 y su tamano de 4,5 B permiten ejecucion en GPU de consumo. Conviene senalar que el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y que todos los datos de rendimiento proceden exclusivamente de la model card del autor, sin validacion externa disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer de decodificacion (Qwen3.5-4B) con cabezas de decision ClassOne (Noul, Choice, Score) y evaluacion en un unico forward pass. Detalles internos del backbone no disponibles |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors (repo de 9,2 GB); no se listan versiones GGUF, AWQ, GPTQ ni cuantizaciones oficiales |
| Idiomas soportados | No disponible (el campo de idiomas no esta declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (sharded) para el backbone, mas `classone_heads.pt` (cabezas Noul/Choice/Score y temperaturas de calibracion) y adaptador LoRA en `lora_backbone/` (r=16, alpha=32) |
| Modelo base | Qwen/Qwen3.5-4B |
| Pipeline declarado | text-classification |
| Fecha de publicacion | 2026-10-06 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

ClassOne es una arquitectura de decision de paso unico. Sobre el backbone Qwen3.5-4B se anaden tres cabezas de salida especializadas: `noul_head` (verificacion booleana con probabilidad calibrada P(true) en [0,1]), `choice_head` (seleccion categorica sobre 2 a 255 opciones dinamicas, devolviendo la distribucion completa de probabilidad) y `score_head` (valoracion ordinal continua sobre rubricas de 2 a 10 niveles, devolviendo el valor esperado). El modelo procesa un "state" (el contexto o caso) junto con un conjunto de preguntas empaquetadas por `ClassOnePromptBuilder` y devuelve todas las respuestas en una sola pasada, sin generacion autoregresiva.

El proceso de ajuste descrito en la model card parte de un adaptador LoRA con rango 16 y alpha 32 sobre el backbone, cuyos pesos se fusionan despues en el repositorio. Las cabezas se entrenan con una perdida combinada de log-verosimilitud negativa (NLL) mas Brier normalizada, orientada a obtener probabilidades calibradas y no solo etiquetas correctas. Sobre esa base se aplica una calibracion de temperatura post-hoc que rebaja el ECE de 0,178 a 0,034. El tokenizador incluye tokens delimitadores especificos de ClassOne. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Clasificacion binaria calibrada mediante la primitiva Noul, que devuelve P(true) en el rango [0,1] en lugar de una etiqueta dura.
- Clasificacion categorica mediante Choice, con soporte para entre 2 y 255 opciones dinamicas definidas en tiempo de inferencia y distribucion completa de probabilidad sobre ellas.
- Puntuacion ordinal mediante Score, con rubricas de 2 a 10 niveles y salida en forma de valor esperado.
- Evaluacion multi-pregunta en un unico forward pass: varias decisiones distintas (booleana, categorica y ordinal) sobre el mismo estado se resuelven simultaneamente.
- Enrutamiento y triaje: la model card incluye un ejemplo de encaminamiento de un mensaje de cliente a equipos (billing, tech) junto con deteccion de peticion de reembolso y nivel de descontento.
- Evaluacion de alineacion y seguridad: resultados reportados sobre modos de fallo como busqueda de poder, fidelidad, rechazo de jailbreaks y honestidad frente a engano.
- Salidas calibradas aptas para umbralizacion y para sistemas que necesitan probabilidades, no solo etiquetas.
- Ausencia de decodificacion autoregresiva, lo que elimina el coste de generacion token a token.
- Capacidades generativas, de codigo, matematicas, vision, audio o tool calling: no declaradas. El pipeline es de clasificacion y el modelo no genera texto libre.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del cliente y varias preguntas Choice con los equipos disponibles (facturacion, tecnico, comercial), devolviendo la distribucion de probabilidad por equipo. Su latencia p50 reportada de decenas de milisegundos permite insertarlo como paso previo a cualquier cola de atencion.
- Deteccion de intencion de reembolso o cancelacion: mediante NoulQuestion se obtiene P(peticion de reembolso) y se puede fijar un umbral de derivacion a un agente humano cuando la probabilidad sea intermedia.
- Puntuacion de satisfaccion y riesgo de churn: con ScoreQuestion sobre una rubrica tipo satisfecho / neutral / insatisfecho / en riesgo de abandono, el valor esperado sirve como metrica continua para priorizar cuentas.
- Moderacion y filtrado previo a un LLM generativo: clasificar si una peticion constituye un intento de jailbreak o si una respuesta es fiel a las fuentes antes de permitir que un modelo generativo actue, usando las cabezas calibradas como barrera de bajo coste.
- Auditoria de comportamiento de agentes: evaluar ejes como busqueda de poder, honestidad o fidelidad sobre transcripciones de agentes, con salida probabilistica y ECE bajo para poder fijar umbrales con significado estadistico.
- Clasificacion de documentos y formularios estructurados: extraer decisiones tipadas (si/no, categoria, grado) de contratos, reclamaciones o informes sin necesidad de parsear texto generado.
- Despliegue en el borde o entornos sin conectividad: al ejecutarse localmente en una GPU de consumo con coste de inferencia nulo y sin enviar datos a terceros, encaja en escenarios con requisitos de privacidad o de cumplimiento estricto.
- Pipeline de decisiones en tiempo real: a 19,1 req/s medidos en una RTX 5060 Ti, puede absorber flujos moderados de clasificacion sin escalado horizontal de GPU.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor y no han sido verificados de forma independiente.

JevBench Public Multi-Tier Benchmark (231 tareas publicas de fstandhartinger/jevbench):

| Tier | Tareas | Accuracy | ECE | Brier | Latencia p50 |
|---|---|---|---|---|---|
| Easy | 48 | 100,0% (48/48) | 0,0001 | 0,0000 | 63,4 ms |
| Original | 72 | 95,8% (69/72) | 0,0458 | 0,0377 | 61,1 ms |
| Hard | 111 | 40,5% (45/111) | 0,4825 | 0,4504 | 184,5 ms |
| Agregado | 231 | 70,1% (162/231) | No disponible | No disponible | 61,1 ms |

Desglose por subtipo: en el tier Original, accuracy de Choice 97,2% (35/36), rubricas de Score 100,0% (12/12) y Noul 91,7% (22/24). En el tier Easy, accuracy de Choice 100,0% (36/36) y de politica Noul 100,0% (12/12).

RLCDAlignBench, evaluacion de alineacion y seguridad (100 instancias):

| Eje / modo de fallo | Muestras | AUROC | Accuracy | ECE | Latencia p50 |
|---|---|---|---|---|---|
| Power seeking | 6 | 0,778 | 83,3% | 0,1475 | 441,5 ms |
| Faithfulness | 9 | 0,850 | 66,7% | 0,1956 | 433,4 ms |
| Refusal (jailbreaks) | 11 | 0,733 | 72,7% | 0,0753 | 570,5 ms |
| Honesty (deception) | 11 | 0,733 | 72,7% | 0,2583 | 453,5 ms |
| Agregado | 100 | 0,604 | 55,3% | 0,2553 | 410,9 ms |

Comparativa de latencia borde frente a nube:

| Sistema | Latencia media | Throughput | Coste de inferencia | Privacidad |
|---|---|---|---|---|
| ClassOne local (RTX 5060 Ti) | 52,49 ms | 19,1 req/s | 0,00 USD | 100% local |
| TypeSafe Jev v1.13 (API cloud) | 329,90 ms | 3,0 req/s | No disponible | No aplica |

La model card indica una aceleracion de 6,3x del sistema local frente a la ida y vuelta a la API cloud. El desglose de latencias de JevBench y RLCDAlignBench no especifica el hardware empleado.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 9,1 GB solo para los pesos (4,54 B x 2 bytes), en linea con el tamano del repositorio (9,2 GB). Con activaciones y cache hay que prever un margen adicional, en torno a 10-12 GB. Estimacion derivada del recuento de parametros, no confirmada por el autor.
- VRAM estimada en cuantizaciones no publicadas (hipoteticas, requeririan generar los pesos): en torno a 4,5-5 GB en int8 y 2,5-3 GB en 4 bits. No hay versiones GGUF, AWQ ni GPTQ en el repositorio.
- GPU de referencia reportada: RTX 5060 Ti, con 52,49 ms de latencia media y 19,1 req/s.
- Cabe en GPU de consumo con al menos 12 GB de VRAM en fp16; en 8 GB no cabria sin cuantizar. No se han publicado mediciones en RTX 4090, A100, H100 ni otros aceleradores.
- Despliegue: el modelo requiere la libreria `classone` (`pip install classone`) y sus clases `ClassOneModel`, `ClassOnePromptBuilder` y los esquemas de preguntas. No es un modelo generativo estandar, por lo que no se puede servir directamente con vLLM, llama.cpp, Ollama o TGI sin adaptacion; tampoco se documentan dichas integraciones.
- Latencia y throughput: 61,1 ms p50 en el agregado de JevBench (63,4 ms en Easy, 184,5 ms en Hard) y 410,9 ms p50 agregado en RLCDAlignBench, con picos de 570,5 ms en la tarea de rechazo de jailbreaks.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada. La comparativa siguiente es parcial y solo incluye los elementos documentados.

| Modelo | Parametros | Tipo | Contexto | Accuracy JevBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ClassOne Qwen3.5-4B | 4,54 B | Decision de paso unico (no generativo) | No disponible | 70,1% agregado (231 tareas) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4,54 B aproximadamente | Transformer generativo | No disponible | No disponible | Apache 2.0 (segun la model card de ClassOne) | HuggingFace |
| TypeSafe Jev v1.13 | No disponible | API cloud de decision | No disponible | No disponible | No disponible | API comercial |
| Otros modelos de clasificacion de ~4 B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Todos los resultados de benchmarks son autoinformados por el autor y no consta replicacion independiente. El repositorio tenia 0 descargas y 0 likes en el momento de redactar esta ficha.
- El rendimiento cae de forma marcada en el tier Hard de JevBench: 40,5% de accuracy (45/111) con ECE de 0,4825 y Brier de 0,4504, lo que indica tanto baja precision como mala calibracion en ese subconjunto.
- En RLCDAlignBench el agregado es de 0,604 de AUROC y 55,3% de accuracy sobre 100 instancias, cerca del comportamiento aleatorio, y con ECE agregado de 0,2553. Ademas, varias celdas se apoyan en tamanos de muestra muy reducidos (6 a 11 instancias), por lo que las cifras tienen alta varianza.
- La model card atribuye Qwen/Qwen3.5-4B a Google, cuando Qwen es un desarrollo de Alibaba. La presencia simultanea del tag "gemma" sugiere que la plantilla de documentacion se reutilizo de una variante basada en Gemma. Esta inconsistencia obliga a tratar el resto de afirmaciones de la model card con cautela.
- El modelo no genera texto libre: cualquier expectativa de uso como LLM conversacional, de generacion de codigo o de razonamiento abierto no esta soportada por su pipeline declarado.
- No se declaran idiomas soportados, por lo que la cobertura multilingue es desconocida y no debe asumirse.
- No se documentan evaluaciones de sesgo, toxicidad ni comportamiento diferencial por subgrupos.
- Riesgo de alucinacion: al tratarse de un clasificador, se manifiesta como decisiones erroneas con probabilidad alta o mal calibrada, especialmente en entradas alejadas de la distribucion de entrenamiento. El modelo no verifica hechos ni cita fuentes.
- La longitud de contexto no esta especificada, lo que impide dimensionar entradas largas en produccion.
- Licencia Apache 2.0, que permite uso comercial y modificacion, pero al ser un derivado de Qwen/Qwen3.5-4B conviene verificar las condiciones y avisos de atribucion aplicables al modelo base antes de un despliegue comercial.
- El modelo depende de codigo propio de la libreria `classone` para cargar las cabezas y empaquetar las preguntas; no hay soporte documentado en runners estandar y la compatibilidad futura de esa libreria no esta garantizada.
- Las fechas del repositorio (octubre de 2026) son posteriores a la informacion verificable disponible, y no se puede contrastar el estado real del proyecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/devops-thiago/classone-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de arquitectura y codigo de entrenamiento ClassOne: https://github.com/devops-thiago/class-one
- Benchmark JevBench, usado en la evaluacion: https://github.com/fstandhartinger/jevbench
- API cloud TypeSafe Jev v1.13, usada como referencia de latencia: no disponible
- Paper de ClassOne: no disponible (solo se cita un `@misc` sin URL de publicacion, ano 2026)
- La busqueda web realizada no devolvio resultados relevantes relacionados con el modelo; los enlaces recuperados no guardan ninguna relacion con el tema y se han descartado.
