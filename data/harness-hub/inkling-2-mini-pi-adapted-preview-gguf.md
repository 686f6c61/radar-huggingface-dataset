# harness-hub/Inkling-2-Mini-pi-adapted-preview-GGUF

## Resumen

Inkling 2 Mini pi adapter GGUF es un adaptador LoRA en formato GGUF para llama.cpp, derivado del adaptador `harness-hub/Inkling-2-Mini-pi-adapted-preview` (checkpoint del paso 200) y publicado por el usuario harness-hub. No se trata de un modelo completo, sino de un delta de pesos de bajo rango que debe cargarse sobre una cuantizacion GGUF del modelo base `thinkingmachines/Inkling-2-Mini`. Su funcion es especializar ese modelo base para su uso como backend de agente dentro de pi, el cliente de agentes de earendil-works, mediante la API compatible con OpenAI que expone llama-server.

El repositorio contiene un unico fichero, `Inkling-2-Mini-pi-lora-F16.gguf`, con el adaptador convertido en precision F16 mediante `convert_lora_to_gguf.py` de llama.cpp (commit `33aeb17f85869279e3821f746bc645357139bc2c`). El modelo base declara 13.369.344 parametros segun los metadatos de safetensors, lo que situa el conjunto en la categoria de modelos pequenos orientados a inferencia local. La licencia es Apache 2.0 tanto en el adaptador como en el repositorio.

La relevancia de esta publicacion es practica: permite reproducir el comportamiento del adaptador sin necesidad de fusionar pesos ni de salir del ecosistema llama.cpp, manteniendo la posibilidad de combinar el adaptador con distintas cuantizaciones del modelo base. No obstante, el autor advierte explicitamente de que la version GGUF no ha sido reevaluada, por lo que los resultados reportados en la model card del adaptador original corresponden a la version no cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de Inkling-2-Mini; no disponible el detalle arquitectonico del modelo base |
| Parametros totales | 13.369.344 (modelo base, segun safetensors); el adaptador LoRA anade un numero de parametros no disponible |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 131.072 tokens en la invocacion de referencia (`-c 131072`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | El adaptador se distribuye unicamente en F16; el modelo base se usa con `Inkling-2-Mini-Q8_0.gguf` en el ejemplo del autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA en un unico fichero) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA convertido a GGUF, no un modelo entrenado desde cero. El adaptador original fue entrenado sobre `thinkingmachines/Inkling-2-Mini` y el checkpoint publicado corresponde al paso 200 de entrenamiento; los detalles de dataset, numero de tokens, composicion y si hubo RLHF o DPO no se recogen en la informacion disponible y se remiten a la model card del adaptador original. La conversion a GGUF se realizo con el script oficial de llama.cpp en el commit indicado, lo que garantiza compatibilidad con el cargador de LoRA de llama.cpp.

El punto tecnico destacable es el modo de uso: el adaptador se entrena y evalua con `reasoning_effort` fijado a `"none"`, un parametro que se pasa a la plantilla de chat mediante `--chat-template-kwargs`. Esto implica que el adaptador esta especializado para operar sin cadena de razonamiento explicita, lo que reduce latencia y tokens generados en cargas de trabajo de agente. El soporte de tool calling requiere `--jinja` para que llama-server aplique la plantilla de chat con las herramientas declaradas.

## Capacidades

- Generacion de texto y conversacion multi-turno sobre el modelo base Inkling-2-Mini.
- Tool calling / function calling a traves de llama-server con `--jinja` activado.
- Uso como backend de agente para pi, con protocolo `openai-completions` contra el endpoint `/v1`.
- Operacion en modo sin razonamiento explicito (`reasoning_effort: "none"`), optimizada para interacciones de agente de baja latencia.
- Contexto configurable hasta 131.072 tokens en la invocacion de referencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Backend local para pi: el escenario principal documentado. Se descargan el GGUF Q8_0 del modelo base y el LoRA F16, se arranca `llama-server` con `--jinja` y `reasoning_effort: "none"`, y se apunta el cliente pi a `http://localhost:8080/v1` con `"api": "openai-completions"`. Es adecuado porque reproduce exactamente la configuracion con la que se entreno y evaluo el adaptador.
- Agentes de codigo en estaciones de trabajo: con 13,4 M de parametros en el modelo base, el conjunto cabe en GPU de consumo y permite ciclos de edicion-ejecucion sin depender de APIs externas, manteniendo el contexto largo para repositorios medianos.
- Automatizacion de tareas con herramientas: el soporte de function calling via `--jinja` permite exponer APIs internas (consulta de bases de datos, ticketing, shell controlado) y dejar que el agente encadene llamadas en varios pasos.
- Prototipado de pipelines de agentes: al ser un LoRA intercambiable, se puede comparar el comportamiento del adaptador frente al modelo base sin cambiar de infraestructura, cargando o no el fichero con `--lora`.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del adaptador y del repositorio facilita su integracion en productos comerciales, sujeta a la licencia del modelo base.
- Evaluacion de tecnicas de adaptacion eficiente: el par base + LoRA en GGUF sirve como banco de pruebas para medir el impacto de un adaptador de bajo rango en tareas de agente sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la version GGUF no ha sido reevaluada y remite a la model card del adaptador original para resultados, detalles de entrenamiento y limitaciones.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 13,4 M de parametros en el modelo base, el peso en Q8_0 es del orden de decenas de megabytes; el adaptador F16 anade una cantidad no especificada. El consumo real dependera de la cuantizacion elegida y del contexto reservado.
- GPU recomendadas: no disponibles. Por tamano, el modelo base es apto para GPU de consumo, pero no hay datos publicados de latencia ni throughput.
- Cabe en GPU de consumo: previsiblemente si, dado el numero de parametros del modelo base; sin cifras verificadas en la informacion disponible.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con carga de LoRA via `--lora` y plantilla Jinja via `--jinja`. No se documentan otras opciones (vLLM, TGI, Ollama) para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini pi adapter (GGUF) | 13,4 M (base) + LoRA | 131.072 en la invocacion de referencia | GGUF + LoRA | Apache 2.0 | Especializado para agente pi, sin razonamiento explicito |
| Inkling-2-Mini (base, GGUF) | 13,4 M | no disponible | GGUF | no disponible | Modelo sin especializar; referencia para medir el efecto del adaptador |
| Inkling-2-Mini pi adapter (no GGUF) | 13,4 M (base) + LoRA | no disponible | safetensors / adaptador | Apache 2.0 | Version evaluada por el autor; referencia de resultados |

No se dispone de datos de rendimiento comparado con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador GGUF no ha sido reevaluado: los resultados de la model card original no son trasladables sin verificacion a esta conversion.
- Requiere descargar por separado el GGUF del modelo base `ggml-org/Inkling-2-Mini-GGUF`; el repositorio no incluye los pesos completos.
- El adaptador esta entrenado con `reasoning_effort: "none"`; usarlo con otro valor puede degradar el comportamiento esperado.
- El tool calling depende de `--jinja`; sin esa opcion, llama-server no aplica la plantilla con herramientas.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo general de los modelos generativos pequenos.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad fuera del idioma de entrenamiento.
- Licencia: Apache 2.0 en el adaptador, pero el uso comercial queda sujeto a la licencia del modelo base `thinkingmachines/Inkling-2-Mini`, no indicada en la informacion disponible.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validacion muy limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/harness-hub/Inkling-2-Mini-pi-adapted-preview-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Inkling-2-Mini-pi-adapted-preview
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del modelo base: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Cliente pi: https://github.com/earendil-works/pi
