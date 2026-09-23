# ho22joshua/hep-chat-entrypoint

# Hep chat entrypoint (ho22joshua)

## Resumen

Hep chat entrypoint es un repositorio de codigo publicado por el usuario ho22joshua en HuggingFace bajo licencia Apache 2.0. No contiene pesos de modelo: es un punto de entrada ligero que descarga en tiempo de ejecucion un modelo base de la familia Qwen 3.5 y le aplica, mediante PEFT, un adaptador LoRA seleccionado de un registro interno. Su proposito es servir de capa de inferencia lista para usar (chat interactivo, ejecucion por lotes e interfaz Gradio) sobre adaptadores entrenados para fisica de altas energias (HEP).

Los adaptadores que orquesta estan publicados en el repositorio ho22joshua/hep-posttraining y se agrupan en dos familias de datos: ROOT y ROOT + TRExFitter. Sobre ROOT se han entrenado variantes de Qwen 3.5 de 0,8B, 4B y 9B con rangos LoRA r16 y r32, entre 1 y 10 epocas y tasas de aprendizaje de 1e-5 y 1e-4. Sobre ROOT + TRExFitter hay variantes de 0,8B con r16/e3 y r32/e3.

Su relevancia actual es acotada pero clara: es una pieza de infraestructura para evaluar y desplegar ajustes finos de dominio cientifico, con modos explicitos de comparacion contra el modelo base y de activacion del modo de razonamiento de Qwen. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no publica resultados de benchmarks, por lo que debe tratarse como material de investigacion, no como un modelo validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelos base de la familia Qwen 3.5) con adaptadores LoRA aplicados en tiempo de ejecucion mediante PEFT. El repositorio no contiene pesos de modelo, solo codigo de entrypoint |
| Parametros totales | Depende del adaptador seleccionado: 0,8B, 4B o 9B (parametros del modelo base) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible (no se declara en el repositorio; viene determinada por el modelo base Qwen 3.5) |
| Tipos de cuantizacion | No disponible en el repositorio; la carga se realiza con `torch_dtype="auto"`, por lo que la cuantizacion depende del modelo base y del backend de inferencia |
| Idiomas soportados | No disponible (el campo de idiomas no esta declarado en la model card) |
| Licencia | Apache 2.0, declarada para el repositorio. La licencia aplicable a los pesos del modelo base debe verificarse por separado en el repositorio de Qwen |
| Formato de pesos | Adaptadores LoRA en formato PEFT (una subcarpeta por adaptador dentro de ho22joshua/hep-posttraining). Los pesos del modelo base no se publican: se descargan en tiempo de ejecucion |

## Arquitectura y entrenamiento

El repositorio no entrena nada: actua como orquestador. En `models.json` mantiene un registro de entradas, cada una con el identificador del modelo base, la subcarpeta del adaptador y los parametros de generacion. El patron minimo de uso documentado es cargar el modelo base con `AutoModelForCausalLM.from_pretrained` y envolverlo con `PeftModel.from_pretrained`, apuntando a la subcarpeta del adaptador en ho22joshua/hep-posttraining. Como modelo base se emplean checkpoints de Qwen 3.5 de 0,8B, 4B y 9B.

Los adaptadores se entrenaron con LoRA sobre dos conjuntos de datos del dominio HEP: uno centrado en ROOT y otro que anade TRExFitter. La nomenclatura de los adaptadores codifica su configuracion: rango LoRA (r16, r32), numero de epocas (e1, e3, e5, e10) y tasa de aprendizaje (1e-5, 1e-4). Por ejemplo, `root-qwen3.5-9b-r32-e1-lr1e-4` corresponde a Qwen 3.5 9B con rango 32, una epoca y learning rate 1e-4; `root-qwen3.5-0.8b-r32-e5-lr1e-5` usa rango 32, cinco epocas y 1e-5. El repositorio no documenta el numero de tokens de entrenamiento, la composicion exacta de los datasets, ni si se aplicaron etapas de RLHF o DPO; esos detalles corresponden al repositorio de adaptadores.

La innovacion practica del entrypoint es metodologica mas que arquitectonica: permite alternar entre el adaptador y su modelo base sin adaptar (`--mode base`), y activar o desactivar el modo de razonamiento de Qwen (`--thinking`, y los comandos `/thinking on` y `/thinking off` durante la conversacion), lo que facilita ablaciones controladas de ajuste fino y de razonamiento explicito en un dominio cientifico.

## Capacidades

- Conversacion multi-turno de dominio HEP a traves de la CLI `chat.py`, con soporte de los comandos `/thinking on`, `/thinking off` y `/exit`.
- Generacion asistida de codigo y macros del ecosistema ROOT, ambito para el que se entrenaron los adaptadores de la familia ROOT.
- Ayuda sobre configuracion y flujos de trabajo de TRExFitter en los adaptadores entrenados con el dataset ROOT + TRExFitter.
- Modo de razonamiento explicito de Qwen, activable por bandera (`--thinking`) para ablaciones de pensamiento.
- Modo de comparacion contra el modelo base sin adaptar (`--mode base`), util como linea base experimental.
- Inferencia por lotes: `run_prompts.py` procesa un fichero `prompts.txt` (un prompt por linea no vacia) y genera un `outputs.jsonl` que comienza con metadatos de la ejecucion seguido de un registro de finalizacion por prompt.
- Interfaz web Gradio (`app.py`) con selector de adaptador, conmutador base/adaptador y toggle de razonamiento. Carga un modelo en memoria a la vez.
- Capacidades de tool calling o function calling: no disponibles ni documentadas en la informacion proporcionada.
- Soporte multilingue: no disponible; no se declaran idiomas en la model card.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistencia en escritura de macros ROOT: el adaptador de la familia ROOT se puede usar como asistente para redactar y revisar macros de analisis, y el modo base permite comparar la respuesta ajustada con la del modelo sin ajustar para decidir si el ajuste aporta valor.
- Generacion y depuracion de configuraciones de TRExFitter: los adaptadores entrenados con ROOT + TRExFitter estan orientados a producir y corregir ficheros de configuracion de ajustes estadisticos, una tarea repetitiva y propensa a errores de sintaxis.
- Evaluacion sistematica de adaptadores mediante lotes: `run_prompts.py` con `--output outputs.jsonl` permite lanzar un banco de prompts fijo contra cada adaptador y contra su modelo base, dejando los resultados con metadatos de ejecucion para comparar configuraciones de rango, epocas y learning rate.
- Ablacion del modo de razonamiento: la bandera `--thinking` y los comandos en conversacion permiten medir si el razonamiento explicito de Qwen mejora o degrada las respuestas en tareas de fisica, sin cambiar de modelo.
- Demo interactiva para una colaboracion cientifica: `app.py` levanta una interfaz Gradio con selector de adaptador, adecuada para que miembros de un grupo de analisis prueben el modelo sin escribir codigo.
- Integracion en un asistente interno de documentacion del experimento: los adaptadores pueden conectarse al modelo base via `PeftModel` dentro de un servicio propio, siempre que se asuma que no hay benchmarks publicados que respalden la calidad de las respuestas.
- Formacion y soporte a estudiantes de posgrado: uso como tutor de consulta sobre flujos ROOT/TRExFitter, con la advertencia de que las respuestas deben verificarse contra la documentacion oficial.
- Experimentacion con ajuste fino eficiente en dominio cientifico: el entrypoint sirve como plantilla para sustituir el registro de `models.json` por otros adaptadores publicados, reutilizando la CLI, el ejecutor por lotes y la interfaz sin reescribir la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna evaluacion de dominio HEP. El repositorio si ofrece los mecanismos para producir comparaciones controladas (modo base frente a adaptador, modo con y sin razonamiento, ejecucion por lotes con metadatos), pero los resultados de esas comparaciones no se publican.

## Requisitos de hardware

- VRAM estimada en precision de 16 bits (pesos del modelo base mas adaptador LoRA, cuyo peso adicional es despreciable): aproximadamente 1,6-2 GB para la variante de 0,8B; 8-9 GB para la de 4B; 18-20 GB para la de 9B.
- Con cuantizacion de 4 bits, las estimaciones bajan a aproximadamente 1 GB (0,8B), 3-4 GB (4B) y 6-7 GB (9B), si bien el repositorio no documenta ni garantiza una ruta de cuantizacion.
- La model card indica explicitamente que se use una GPU CUDA para los modelos de 4B y 9B. La variante de 0,8B es la unica que puede ejecutarse de forma realista en CPU.
- GPU recomendadas: RTX 3060 de 12 GB o superior para el adaptador de 4B en 16 bits; RTX 4090 de 24 GB para el de 9B en 16 bits; A100 o H100 para inferencia por lotes con concurrencia o para servir varias variantes.
- Cabe en GPU de consumo: si, la variante de 0,8B en practicamente cualquier GPU moderna; la de 4B en tarjetas de 12 GB o mas; la de 9B en tarjetas de 24 GB o mas en 16 bits, o en 12-16 GB si se cuantiza.
- Opciones de despliegue documentadas: scripts propios sobre `transformers` + `peft`, chat de terminal (`chat.py`), ejecucion por lotes (`run_prompts.py`) e interfaz Gradio (`app.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; su uso requeriria, como minimo, fusionar el adaptador con el modelo base y convertir los pesos, algo no soportado por el repositorio tal y como esta publicado.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisitos adicionales: el entrypoint descarga el modelo base en tiempo de ejecucion, por lo que necesita conexion de red y espacio en disco suficiente para el checkpoint completo (del orden de varios GB por variante).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de chat especializados en fisica de altas energias. La comparacion mas significativa es interna al propio registro de adaptadores, que comparte modelo base y solo varia la configuracion de LoRA y el dataset:

| Adaptador | Modelo base | Dataset | Rango LoRA | Epocas | Learning rate |
|---|---|---|---|---|---|
| root-qwen3.5-0.8b-r32-e5-lr1e-5 | Qwen 3.5 0,8B | ROOT | 32 | 5 | 1e-5 |
| root-qwen3.5-4b-r32-e1-lr1e-4 | Qwen 3.5 4B | ROOT | 32 | 1 | 1e-4 |
| root-qwen3.5-9b-r32-e1-lr1e-4 | Qwen 3.5 9B | ROOT | 32 | 1 | 1e-4 |
| root-qwen3.5-9b-r32-e10-lr1e-5 | Qwen 3.5 9B | ROOT | 32 | 10 | 1e-5 |
| root-trexfitter-qwen3.5-0.8b-r16-e3-lr1e-5 | Qwen 3.5 0,8B | ROOT + TRExFitter | 16 | 3 | 1e-5 |
| root-trexfitter-qwen3.5-0.8b-r32-e3-lr1e-4 | Qwen 3.5 0,8B | ROOT + TRExFitter | 32 | 3 | 1e-4 |

La linea base disponible para todos ellos es el propio modelo Qwen 3.5 sin adaptar, accesible con `--mode base`. Comparar contra alternativas externas de la misma categoria (asistentes cientificos de dominio HEP) no es posible con la informacion proporcionada, ya que no se aportan datos de rendimiento de ninguno de los dos lados.

## Limitaciones y advertencias

- Ausencia total de validacion publica: el repositorio registra 0 descargas y 0 likes, y no publica benchmarks. No hay evidencia cuantitativa de que los adaptadores mejoren al modelo base en tareas HEP.
- Riesgo de alucinacion en contenido cientifico: un adaptador de dominio puede producir codigo ROOT o configuraciones TRExFitter sintacticamente plausibles pero incorrectas, con consecuencias directas en un analisis de fisica. Toda salida debe revisarse.
- No se documentan sesgos concretos, pero tampoco se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos sistematicos ni cobertura de casos.
- Longitud de contexto no declarada: no se especifica la ventana soportada ni si los adaptadores alteran el comportamiento en contextos largos.
- Idiomas no declarados: se desconoce el soporte real de castellano u otras lenguas; los datasets de entrenamiento parecen centrados en material tecnico en ingles.
- Licencia: el repositorio es Apache 2.0, pero esa licencia no cubre necesariamente los pesos del modelo base Qwen 3.5, que se descargan aparte y tienen sus propios terminos. Antes de un uso comercial hay que verificar ambas licencias por separado.
- Discrepancia en la documentacion: la model card describe como predeterminado el adaptador ROOT de 4B con una epoca y razonamiento desactivado, mientras que el README disponible en el repositorio menciona como modelo configurado por defecto `hep-qwen2.5-7b-lora16-sigbg-irred-red-step2200`, basado en Qwen 2.5. Conviene inspeccionar `models.json` antes de asumir cual es el adaptador activo.
- Dependencia de red y disco: la inferencia requiere descargar el modelo base en tiempo de ejecucion si no esta en cache local.
- Carga secuencial: la interfaz Gradio carga un modelo a la vez, lo que limita el uso concurrente en un servicio compartido.
- Sin soporte documentado de tool calling, agentes multi-paso, vision o audio: cualquier integracion de ese tipo seria una extension propia no cubierta por el repositorio.

## Enlaces

- Repositorio del entrypoint en HuggingFace: https://huggingface.co/ho22joshua/hep-chat-entrypoint
- README del repositorio: https://huggingface.co/ho22joshua/hep-chat-entrypoint/blob/main/README.md
- Repositorio de adaptadores LoRA: https://huggingface.co/ho22joshua/hep-posttraining
- Perfil del autor en HuggingFace: https://huggingface.co/ho22joshua

Nota: el resto de resultados de la busqueda web proporcionada (documentacion de la API de OpenAI, un repositorio generico de toolkits de IA en GitHub y una pagina de modelos de terceros) no guardan relacion con este modelo y se omiten deliberadamente.
