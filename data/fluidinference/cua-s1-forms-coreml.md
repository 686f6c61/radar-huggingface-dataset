# FluidInference/cua-s1-forms-coreml

## Resumen

FluidInference/cua-s1-forms-coreml es la conversion a Core ML en FP16 del modelo cua-ai/cua-s1-forms, un especialista de 706.048 parametros desarrollado por Cua para seleccionar una accion entre un conjunto de opciones suministradas en el contexto de un formulario. No es un LLM autoregresivo: es un clasificador basado en pequenos encoders Transformer que operan directamente sobre bytes UTF-8, con una etapa de attention readout que produce una distribucion de probabilidad sobre hasta 32 opciones candidatas. El paquete portable ocupa 1.511.163 bytes (1,51 MB) y no requiere cache KV ni tokenizer externo.

La relevancia de esta ficha esta en el nicho: llevar la toma de decisiones de un agente de computer use al dispositivo (on-device) dentro del ecosistema Apple. Al ser un modelo de menos de un millon de parametros y compilarse para CPU y Neural Engine, elimina la dependencia de red y de GPU para el paso concreto de "elegir que hacer" en un formulario, que es donde un agente de automatizacion de UI itera mas veces. La conversion mantiene paridad exacta con la referencia PyTorch: 196/196 opciones correctas en el conjunto de demostracion upstream.

El autor es FluidInference, que publica la integracion de runtime FluidAudio para Swift. La licencia del artefacto convertido es MIT. La validacion de runtime se realizo sobre Apple silicon (M5 Pro), con latencias medidas de 0,90 ms de mediana por llamada usando CPU y Neural Engine. Se trata de un artefacto muy reciente (publicado el 19 de septiembre de 2026) y con adopcion inicial baja: 35 descargas y 11 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoders Transformer pequenos sobre bytes UTF-8 con attention readout (clasificador, no autorregresivo) |
| Parametros totales | 706.048 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 224 bytes de contexto (context_ids, int32 [1, 224]); 96 bytes por opcion (option_ids, int32 [1, 32, 96]); entre 2 y 32 opciones por inferencia |
| Tipos de cuantizacion | FP16 (paquete Core ML distribuido); adaptador de exportacion FP32 usado en la verificacion de paridad (desviacion maxima de 0,00000113 frente a la referencia PyTorch) |
| Idiomas soportados | No disponible (codificacion byte-level UTF-8, sin tokenizer, sin lista de idiomas declarada) |
| Licencia | MIT |
| Formato de pesos | Core ML: `cua_s1_forms_fp16_options32.mlpackage` (portable) y `cua_s1_forms_fp16_options32.mlmodelc` (compilado) |
| Modelo base | cua-ai/cua-s1-forms (relacion: quantized) |
| Dataset de referencia | cua-ai/cua-s1-forms |
| Tamano del paquete portable | 1.511.163 bytes (1,51 MB) |
| Plataforma minima | iOS 17 / macOS 14 o superior |
| Aceleracion | CPU + Neural Engine (149 operaciones en Neural Engine, 24 en CPU, 0 en GPU) |
| Pipeline (HuggingFace) | text-classification |
| Descargas / likes | 35 / 11 |

Entradas y salidas del grafo:

| Nombre | Tipo | Forma |
|---|---|---|
| `context_ids` | int32 | `[1, 224]` |
| `option_ids` | int32 | `[1, 32, 96]` |
| `option_mask` | int32 | `[1, 32]` |
| `logits` | float32 (salida) | `[1, 32]` |
| `probabilities` | float32 (salida) | `[1, 32]` |

Codificacion: bytes UTF-8 mas uno, relleno con cero y truncado por bytes a 224 para el contexto y 96 por opcion. Los logits de relleno son `-10000` y las probabilidades de relleno son cero. Se debe rechazar cualquier entrada de mas de 32 opciones o exportar un modelo de mayor capacidad por separado.

## Arquitectura y entrenamiento

La arquitectura es un clasificador compacto: encoders Transformer de baja dimension que consumen directamente bytes UTF-8 (sin vocabulario ni tokenizer) y una cabeza de atencion que puntua cada opcion contra el contexto. La configuracion heredada del checkpoint incluye un valor `hf_model` sin uso, pero este checkpoint `tinyx` no carga pesos de Qwen; conviene no confundirlo con un transformer generativo. No hay decodificacion autoregresiva, ni cache KV, ni generacion de texto.

En cuanto al entrenamiento, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO sobre el modelo original de Cua. Lo que si esta documentado es el proceso de conversion y sus puertas de calidad: se exige 100 % de coincidencia en la opcion seleccionada frente a PyTorch, ausencia de perdida de exactitud, error absoluto maximo de probabilidad <= 0,005, salidas finitas, probabilidades normalizadas en vivo y probabilidad cero en las posiciones de relleno. Ademas se ejecutan seis comprobaciones con el orden de opciones invertido en cada configuracion de Core ML. En el informe de colocacion de computo del propio artefacto figuran 149 operaciones asignadas al Neural Engine, 24 a la CPU y ninguna a la GPU.

## Capacidades

- Clasificacion de acciones de formulario: dada una descripcion textual de la tarea y del elemento de formulario, elige la opcion mas probable entre 2 y 32 alternativas suministradas.
- Salida probabilistica calibrada: devuelve `logits` y `probabilities` normalizadas, lo que permite aplicar umbrales de confianza o descartar decisiones por debajo de un umbral.
- Abstimencion explicita: en la evaluacion upstream la opcion `skip` actua como abstencion, lo que permite que el agente no actue cuando no hay una decision clara.
- Sin generacion de texto: no produce lenguaje natural ni codigo; su unica salida es una seleccion con puntuaciones.
- Sin tool calling ni function calling: la informacion disponible no documenta ninguna capacidad de llamada a herramientas, mas alla de elegir una de las opciones que le pasa el agente externo.
- Sin razonamiento multi-paso propio: el modelo resuelve un unico paso de decision; la planificacion multi-paso corresponde al agente que lo integra.
- Ejecucion on-device: se ejecuta en CPU y Neural Engine de Apple silicon, sin GPU y sin acceso a red.
- Capacidades multilingues: no declaradas. Al operar sobre bytes UTF-8 en lugar de tokens, no hay vocabulario que limite idiomas, pero tampoco hay evaluacion publicada en idiomas distintos del ingles.
- Integracion nativa: incluye `preprocessing.py` compatible con el modelo upstream y `CuaS1FormsManager` en FluidAudio para Swift, con descarga y cache automatica del artefacto compilado.
- Paridad verificada con la referencia: la conversion reproduce exactamente la opcion seleccionada por el modelo PyTorch original en las 196 filas del conjunto de demostracion.

## Casos de uso

- Relleno automatico de formularios en aplicaciones iOS y macOS: el modelo recibe la descripcion de la tarea, el formulario y el elemento activo, y decide entre rellenar, marcar, hacer clic o saltar. Al ocupar 1,51 MB y ejecutarse en Neural Engine, puede integrarse en la propia app sin servicio externo.
- Agentes de computer use en escritorio: actua como cabecera de decision de bajo coste dentro de un bucle de observacion-accion. Con 0,90 ms de mediana por llamada, el cuello de botella del bucle pasa a la captura de pantalla y a la extraccion de documentos, no al clasificador.
- Automatizacion de procesos de back office (RPA) sobre formularios web: el agente extrae los elementos del DOM o de la pantalla, los convierte en opciones candidatas y el modelo selecciona la accion. La posibilidad de emitir `skip` reduce el riesgo de acciones destructivas cuando el contexto es ambiguo.
- Asistentes de accesibilidad: convertir la intencion dictada por el usuario en una accion concreta sobre el formulario activo, con abstencion cuando la intencion no se corresponde con ninguna opcion disponible.
- Pruebas automatizadas de formularios (QA): generar recorridos de relleno y validacion dentro de pipelines de CI para apps nativas Apple, aprovechando que el modelo no necesita red ni GPU y puede ejecutarse en los runners macOS.
- Procesamiento confidencial de documentos con formularios: al no requerir red ni tokenizer externo, los datos del formulario y del documento no salen del dispositivo, lo que simplifica el cumplimiento de requisitos de privacidad.
- Enrutado de decisiones en pipelines de datos estructurados: usar la salida probabilistica como clasificador de bajo coste para decidir que accion aplicar sobre un registro, aplicando un umbral de confianza y derivando el resto a revision humana.
- Componente de evaluacion offline: al existir un conjunto de demostracion etiquetado de 196 filas con hashes fijados, sirve para regresion de agentes antes de desplegar cambios en el prompt o en el extractor de UI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de conocimiento general (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, y no serian aplicables a un clasificador de acciones.

La validacion publicada se centra en la paridad de la conversion y en la latencia:

| Metrica | Core ML `ALL` | Core ML `CPU_AND_NE` |
|---|---:|---:|
| Opciones seleccionadas coincidentes con PyTorch | 196 / 196 | 196 / 196 |
| Error absoluto maximo de probabilidad | 0,003099 | 0,002336 |
| Mediana de llamada en caliente | 1,85 ms | 0,90 ms |
| Percentil 95 de llamada en caliente | 2,49 ms | 0,94 ms |

Evaluacion del evaluador upstream (sin modificar) sobre las predicciones guardadas:

| Metrica | Valor |
|---|---:|
| Filas del conjunto de demostracion | 196 |
| Decisiones `fill` | 36 |
| Decisiones `check` | 4 |
| Decisiones `click` | 6 |
| Decisiones `skip` (abstimencion) | 150 |
| Acciones incorrectas | 0 |
| Objetivos incorrectos | 0 |
| Acciones inseguras | 0 |
| Cobertura (decisiones accionables) | 23,47 % (46 decisiones) |

Condiciones de medida: 19 de septiembre de 2026, Apple M5 Pro con 24 GB, macOS 27.0, Python 3.11.11, PyTorch 2.7.0 y coremltools 9.0. Los tiempos son exploratorios, incluyen el coste de llamada de Python y excluyen la carga del modelo, la codificacion, la extraccion de documentos, la observacion de UI y la ejecucion de la accion. No constituyen una comparacion optimizada entre PyTorch y MPS.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el paquete FP16 ocupa 1,51 MB y el grafo se reparte entre CPU y Neural Engine con cero operaciones en GPU.
- GPU recomendadas: ninguna. El informe de colocacion de computo del artefacto registra 0 operaciones en GPU.
- Hardware objetivo: chips de Apple silicon (M-series y derivados de iPhone/iPad) con iOS 17 / macOS 14 o superior.
- Equipo de medida y validacion: Apple M5 Pro, 24 GB de memoria unificada, macOS 27.0.
- Capacidad en GPU de consumo (RTX, A100, H100): no aplica; el formato distribuido es Core ML, no safetensors ni GGUF.
- Opciones de despliegue: Core ML mediante `coremltools==9.0` (junto con `numpy==1.26.4` y `huggingface_hub`) en Python, o `CuaS1FormsManager` de FluidAudio en Swift; tambien se puede compilar localmente el `.mlpackage` o anadirlo a un proyecto de Xcode. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, al no existir pesos GGUF ni safetensors.
- Latencia: mediana de llamada en caliente de 0,90 ms y p95 de 0,94 ms con `CPU_AND_NE`; 1,85 ms de mediana y 2,49 ms de p95 con la configuracion `ALL`. Estas cifras incluyen sobrecarga de Python y excluyen el resto del pipeline del agente.
- Rendimiento en iPhone: no medido. La compatibilidad del bundle precompilado en versiones de sistema anteriores a iOS 17 tampoco se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Entrada | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| FluidInference/cua-s1-forms-coreml | 706.048 | Core ML FP16 | 224 bytes de contexto, 32 opciones de 96 bytes | MIT | HuggingFace, 35 descargas, 11 likes |
| cua-ai/cua-s1-forms (modelo base) | 706.048 | PyTorch | Los mismos limites, segun la conversion | No disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de clasificacion de acciones de formulario o de computer use | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados en la informacion proporcionada que permitan comparar este artefacto con modelos de proposito general del mismo rango de tamano (por ejemplo, clasificadores de texto de menos de un millon de parametros) en tareas equivalentes. La comparacion relevante y documentada es la de paridad con el modelo base en PyTorch, donde la conversion no pierde exactitud en la seleccion de opciones.

## Limitaciones y advertencias

- No es un modelo generativo: no escribe texto, no responde preguntas abiertas y no puede proponer acciones que no esten en la lista de opciones que recibe.
- Limite duro de 32 opciones: cualquier entrada con mas opciones debe rechazarse o requerir una exportacion de mayor capacidad. El helper de ejemplo rechaza el desbordamiento en lugar de descartar opciones silenciosamente.
- Truncado por bytes: el contexto se corta a 224 bytes y cada opcion a 96 bytes. En textos con caracteres multibyte (acentos, CJK, emojis) el numero de caracteres utiles es menor que el numero de bytes, lo que puede degradar la decision.
- Riesgo de seleccion incorrecta: al no haber generacion no hay alucinacion de texto, pero si puede elegir una accion equivocada cuando el contexto es ambiguo o el elemento de formulario esta mal descrito. La opcion `skip` mitiga, no elimina, ese riesgo.
- Cobertura baja en la evaluacion upstream: el 23,47 % de cobertura sobre 196 filas implica que en la mayoria de los casos el evaluador opto por abstenerse. En produccion conviene definir umbrales de confianza y un camino de escalado a revision humana.
- Idiomas no declarados: la model card no especifica evaluacion en castellano ni en otros idiomas. No debe asumirse paridad de comportamiento fuera del ingles sin validacion propia.
- Compatibilidad de plataforma: requiere iOS 17 / macOS 14 o superior. El rendimiento en iPhone y la compatibilidad del bundle precompilado con versiones antiguas del sistema no han sido medidos.
- Configuracion heredada confusa: el checkpoint incluye un valor `hf_model` sin uso que apunta a pesos tipo Qwen que no se cargan. Puede inducir a error a quien inspeccione los ficheros de configuracion.
- Licencia: el artefacto convertido es MIT, lo que permite uso comercial. La licencia del modelo base cua-ai/cua-s1-forms no se detalla en la informacion proporcionada y deberia verificarse antes de un despliegue comercial.
- Adopcion temprana: 35 descargas y 11 likes en el momento de la consulta. La validacion externa y la cobertura de casos de uso reales son limitadas.
- Dependencia de versiones: el ejemplo en Python fija `coremltools==9.0` y `numpy==1.26.4`; otras combinaciones no estan verificadas.
- Las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo ni sobre su modelo base, por lo que no hay prensa, papers ni evaluaciones independientes que citar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/cua-s1-forms-coreml
- Modelo base: https://huggingface.co/cua-ai/cua-s1-forms
- Dataset: https://huggingface.co/datasets/cua-ai/cua-s1-forms
- Repositorio de integracion FluidAudio (Swift): https://github.com/FluidInference/FluidAudio/tree/main
- Paper o informe tecnico del modelo base: no disponible
- Demo publica: no disponible
- Resultados de busqueda web relevantes: ninguno
