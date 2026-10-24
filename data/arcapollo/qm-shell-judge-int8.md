# Arcapollo/qm-shell-judge-int8

## Resumen

qm-shell-judge-int8 es un clasificador de riesgo de comandos de shell pensado para agentes de IA que escriben y ejecutan codigo. Lo publica el usuario Arcapollo como segunda capa del clasificador de Quartermaster: una primera capa basada en reglas deja pasar los comandos obviamente seguros y escala directamente los obviamente peligrosos, y este modelo juzga la franja intermedia. Para cada comando responde 12 preguntas binarias de riesgo (exfiltracion, destruccion de datos, persistencia, prompt injection, etc.) y cualquier puntuacion que alcance el umbral de 0,7 se traduce en "preguntar antes a la persona".

Tecnicamente es un fine-tune de convaiinnovations/laya, un encoder ModernBERT-large en su variante "English root", exportado a ONNX con cuantizacion int8 weight-only en un unico grafo fusionado. El repositorio ocupa 0,6 GB e incluye el tokenizador del modelo base, la configuracion de Laya con las temperaturas ajustadas y el fichero questions.json con la redaccion exacta de las 12 preguntas. La licencia es Apache-2.0, igual que la del modelo base.

Su relevancia practica esta en el control de falsos positivos: frente al mismo encoder en modo zero-shot, que pedia confirmacion en el 77,6 % de los comandos seguros del split de test, este ajuste baja al 6,3 % de peticiones innecesarias manteniendo un 88,6 % de comandos peligrosos detectados. Es, por tanto, una pieza de infraestructura para agentes de codigo, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer ModernBERT-large (modelo base convaiinnovations/laya, revision 55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851, variante "English root") con cabeza de clasificacion para preguntas binarias independientes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la entrada se trunca a los primeros 4.000 caracteres del comando |
| Tipos de cuantizacion | int8 weight-only (MatMulNBits: 8 bits, bloque 64, simetrico, accuracy level 4); activaciones en fp32 |
| Idiomas soportados | no disponible; el modelo base es la variante "English root" de Laya y el corpus de entrenamiento son comandos de shell |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx mas model.onnx.data externo), tokenizer.json, rl_agent_config.json, questions.json |

## Arquitectura y entrenamiento

El modelo parte del encoder ModernBERT-large de Laya y se exporta como un unico grafo ONNX fusionado con cinco entradas (`input_ids`, `attention_mask`, `marker_pos`, `marker_mask`, `qtype`) y dos salidas (`logits`, `act_logits`). Cada una de las 12 preguntas se formula como una pregunta `noul` de Laya, con la redaccion fijada en questions.json, y las etiquetas son independientes entre si: un mismo comando puede ser positivo en varias. La configuracion incluye temperaturas ajustadas (noul 1.21) calibradas sobre una porcion de 400 filas reservada del conjunto de entrenamiento. La cuantizacion es weight-only int8 con MatMulNBits, siguiendo el mismo esquema de exportacion que inferenceprince/laya-onnx-int8.

El corpus son 4.514 comandos de shell anonimizados: 2.418 y 930 en entrenamiento, 561 en desarrollo y 605 en test, mezclando comandos reales de agentes, casos sinteticos escritos a mano, pruebas de Atomic Red Team y comandos generados por modelos. Cada comando se etiqueto contra una politica escrita por dos etiquetadores (Claude y Gemini via Antigravity), con las discrepancias arbitradas o marcadas; unos 1.860 elementos generados solo llevan las etiquetas de su generador, y el historial de allow/deny de sesiones reales nunca se uso como etiqueta. El entrenamiento uso `laya.train` con perdida rlcd, 2 epocas, batch efectivo de 64 y label smoothing de 0,1. Como cada pregunta es negativa en aproximadamente el 96 % de los comandos, por cada comando se incluyo la pregunta positiva junto a 3 negativos muestreados para evitar que la cabeza aprendiera a responder "no" con exceso de confianza.

## Capacidades

- Clasificacion multietiqueta de comandos de shell en 12 categorias de riesgo: `exfiltration`, `secret_in_output`, `untrusted_code`, `lockout`, `machine_access`, `os_destruction`, `data_destruction`, `guard_bypass`, `obfuscation`, `other_hosts`, `prompt_injection` y `persistence`.
- Puntuacion calibrada por pregunta con umbral operativo recomendado de 0,7 para decidir si se requiere confirmacion humana; el umbral de 0,5 apenas cambia los resultados en test y desarrollo.
- Juicio sobre el estado del agente limitado al texto del comando (primeros 4.000 caracteres), sin necesidad de contexto conversacional adicional.
- Integracion como segundo nivel de un pipeline de decision con una capa previa de reglas que filtra los casos triviales y los evidentemente peligrosos.
- Deteccion de indicios de prompt injection y de ofuscacion dentro del propio comando evaluado.
- No es un modelo generativo: no produce texto, no soporta tool calling, no razona en varios pasos y no tiene modo thinking ni capacidades de vision o audio.

## Casos de uso

- Puerta de confirmacion en agentes de codigo: el agente propone un comando, la capa de reglas descarta los casos claros y este modelo puntua los 12 riesgos; si alguna puntuacion supera 0,7 se muestra el comando al usuario antes de ejecutarlo. Es su caso de diseno y el que cubre la evaluacion publicada.
- Ejecucion desatendida en entornos de confianza media: en tareas nocturnas o por lotes donde no hay humano delante, el score permite degradar automaticamente a un sandbox o a un modo de solo lectura en lugar de bloquear.
- Auditoria y telemetria de sesiones de agentes: al ser multietiqueta, permite agregar cuantos comandos por sesion tocan `exfiltration`, `persistence` o `other_hosts` y construir metricas de riesgo por proyecto o por equipo.
- Filtro previo en pipelines de CI/CD: interceptar comandos generados por asistentes antes de que lleguen a un runner con credenciales, con enfasis en `secret_in_output` y `exfiltration`, que son las etiquetas con mejor AUC del conjunto de test.
- Red teaming de agentes: usar el modelo como juez automatizado sobre corpus de ataques (Atomic Red Team y variantes ofuscadas) para medir la resistencia de un agente antes de desplegarlo.
- Despliegue en el propio puesto de trabajo: con 0,6 GB en ONNX e inferencia int8, puede ejecutarse en local sobre CPU como parte del cliente del agente, sin enviar los comandos a un servicio externo.
- Investigacion sobre clasificacion de comandos peligrosos: el repositorio incluye el grafo, el tokenizador, la configuracion y la redaccion exacta de las preguntas, lo que sirve como punto de partida reproducible para reajustar el modelo a otro entorno.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los splits de test y desarrollo, restringidos a los comandos que la capa de reglas envia al juez. "Peticiones innecesarias" son comandos seguros reales que acabarian pidiendo confirmacion; "riesgo detectado" son comandos con alguna etiqueta positiva en los que alguna puntuacion supera el umbral.

| Modelo | Umbral | Peticiones innecesarias (test / dev) | Riesgo detectado (test / dev) |
|---|---|---|---|
| inferenceprince/laya-onnx-int8 (zero-shot) | 0,7 | 77,6 % / 89,2 % | 97,5 % / 94,0 % |
| qm-shell-judge-int8 | 0,7 | 6,3 % / 9,9 % | 88,6 % / 84,3 % |
| qm-shell-judge-int8 | 0,5 | 6,2 % / 6,5 % | 88,6 % / 84,9 % |

El AUC por pregunta en test se situa entre 0,82 y 1,0. Las etiquetas mas debiles son `machine_access` (AUC 0,82 en test y 0,70 en dev) y el recall de `guard_bypass`. El dato de 9,9 % en desarrollo para el umbral 0,7 procede de un barrido sobre elementos seguros no generados, un conjunto ligeramente mas amplio que el de la fila de 0,5.

## Requisitos de hardware

- El repositorio completo ocupa 0,6 GB; los pesos int8 quedan muy por debajo de la VRAM de cualquier GPU consumer moderna. El pico real de memoria depende de la longitud de entrada y de las activaciones en fp32, y no se publica en la model card.
- GPU recomendadas: no hay recomendacion oficial. Por tamano, una GPU consumer de gama media es suficiente; para lotes grandes o servicios con muchas peticiones concurrentes tiene sentido una GPU de datacenter (A100, H100) por throughput agregado, no por necesidad de memoria.
- Inferencia en CPU viable: al ser un encoder con pesos int8 weight-only, el coste dominante es el ancho de banda de memoria, lo que permite ejecutarlo en el puesto de trabajo del usuario.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) es el runtime natural, con un grafo unico que recibe las 12 preguntas mediante `qtype`. Para servir como API se puede envolver en FastAPI con `onnxruntime`, en Triton con backend ONNX o en ONNX Runtime Server. vLLM, llama.cpp, Ollama y TGI no aplican porque el modelo no es generativo.
- Latencia y throughput: no disponibles. El coste por comando escala con los caracteres de entrada (hasta 4.000) y con el numero de preguntas evaluadas por el grafo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento con umbral 0,7 (test / dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qm-shell-judge-int8 | no disponible | no disponible (4.000 caracteres de comando) | 6,3 % / 9,9 % de peticiones innecesarias; 88,6 % / 84,3 % de riesgo detectado | Apache-2.0 | ONNX int8 en HuggingFace, 0 descargas, 0 likes |
| inferenceprince/laya-onnx-int8 (zero-shot sobre las mismas preguntas) | no disponible | no disponible | 77,6 % / 89,2 % de peticiones innecesarias; 97,5 % / 94,0 % de riesgo detectado | Apache-2.0 (derivado de Laya) | ONNX int8 en HuggingFace |
| convaiinnovations/laya (modelo base, sin ajuste a esta tarea) | no disponible | no disponible | no disponible | Apache-2.0 | Pesos originales en HuggingFace |

No se han identificado en la informacion disponible otros clasificadores de riesgo de comandos de shell comparables; la unica referencia cuantitativa es el propio modelo base en modo zero-shot.

## Limitaciones y advertencias

- Se le escapan aproximadamente uno de cada ocho comandos peligrosos que llegan al juez; el autor indica explicitamente que debe mantenerse detras de una capa de reglas y de una confirmacion humana, nunca como unica barrera.
- `machine_access` es la etiqueta mas floja (AUC 0,82 en test, 0,70 en dev) y el recall de `guard_bypass` es bajo, justo las categorias relacionadas con escalada de privilegios y evasion.
- Entrenado sobre la carga de trabajo de una sola persona en herramientas de desarrollo para macOS y Linux; el comportamiento en Windows, en contenedores de produccion o en dominios de infraestructura puede diferir.
- Los conjuntos de evaluacion son pequenos (166 elementos de riesgo en test y 158 en dev), por lo que las cifras varian varios puntos entre splits.
- Parte del etiquetado lo generan modelos (Claude y Gemini via Antigravity) y unos 1.860 elementos generados solo llevan la etiqueta de su generador, lo que introduce ruido y posible sesgo hacia la politica particular de esos modelos.
- El comando se trunca a los primeros 4.000 caracteres: colas maliciosas o concatenaciones largas pueden quedar fuera del texto evaluado.
- Al depender de la redaccion exacta de las preguntas, cambiar el texto de questions.json o el formato del estado de entrada puede degradar las puntuaciones sin aviso.
- Licencia Apache-2.0: permite uso comercial y modificacion, con las obligaciones habituales de conservar el aviso de licencia y los avisos de atribucion.
- Al ser un modelo ONNX int8 ya cuantizado, este repositorio no es un punto de partida comodo para reentrenar; habria que volver al modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arcapollo/qm-shell-judge-int8
- Preguntas de inferencia (questions.json): https://huggingface.co/Arcapollo/qm-shell-judge-int8/blob/main/questions.json
- Modelo base convaiinnovations/laya: https://huggingface.co/convaiinnovations/laya
- Exportacion de referencia con el mismo esquema ONNX int8: https://huggingface.co/inferenceprince/laya-onnx-int8

No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales.
