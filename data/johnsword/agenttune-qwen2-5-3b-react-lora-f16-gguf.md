# johnsword/agenttune-qwen2.5-3b-react-lora-F16-GGUF

## Resumen

Este repositorio contiene un adaptador LoRA en formato GGUF, concretamente una conversión a precisión F16 del adaptador `Cheng-1/agenttune-qwen2.5-3b-react-lora`. No se trata de un modelo completo, sino de un delta de pesos de bajo rango (29.933.568 parámetros, unos 0,1 GB de repositorio) que debe aplicarse sobre el modelo base correspondiente para funcionar. El adaptador está orientado a tareas de agente: razonamiento tipo ReAct y uso de herramientas (tool calling), según reflejan sus etiquetas `react`, `agent` y `tool-use`.

El autor del repositorio es johnsword, que ha utilizado el espacio GGUF-my-lora de ggml.ai para convertir el adaptador original desde PEFT a GGUF. La conversión está pensada para su uso con llama.cpp, tanto en modo CLI (`llama-cli`) como en modo servidor (`llama-server`), pasando el LoRA mediante el flag `--lora`.

La relevancia de esta ficha radica en que permite ejecutar un ajuste fino orientado a agentes sobre un modelo Qwen2.5 de 3B en entornos con llama.cpp, sin necesidad de reentrenar ni fusionar los pesos. La licencia es MIT. No se dispone de información sobre idiomas soportados, contexto, composición del dataset de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer decoder-only de la familia Qwen2.5; modelo base del adaptador original no especificado en la informacion disponible (la nomenclatura sugiere Qwen2.5-3B) |
| Parametros totales | 29.933.568 (parametros del adaptador LoRA; el modelo base no esta incluido) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base sobre el que se aplique) |
| Tipos de cuantizacion | F16 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptador LoRA en F16) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo entrenado de cero. La tecnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en determinadas capas, de modo que el ajuste resultante ocupa muy poco espacio (en este caso unos 30 millones de parametros, aproximadamente 0,1 GB de repositorio). El adaptador original fue entrenado sobre `Cheng-1/agenttune-qwen2.5-3b-react-lora`, que a su vez es un ajuste de un modelo Qwen2.5 de 3B (según la nomenclatura del identificador). Este repositorio concreto es una conversion de ese adaptador PEFT a GGUF en precision F16, realizada con el espacio GGUF-my-lora de ggml.ai.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio proceso de conversion a GGUF y del enfoque ReAct para agentes.

## Capacidades

- Generacion de texto en el marco de un modelo causal de la familia Qwen2.5 (el modelo base debe aportarse por separado).
- Razonamiento tipo ReAct (Reasoning + Acting), orientado a la interaccion con entornos y herramientas.
- Uso de herramientas y function calling, segun las etiquetas `agent` y `tool-use` del repositorio.
- Integracion con llama.cpp para ejecucion local mediante CLI o servidor.
- Aplicacion como adaptador sobre el modelo base sin necesidad de fusionar pesos.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base subyacente).
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Agentes ReAct multi-paso: el adaptador esta especificamente entrenado para alternar razonamiento y accion, por lo que encaja en bucles de agente que consultan herramientas y deciden el siguiente paso.
- Orquestacion de function calling en pipelines de automatizacion: al estar orientado a `tool-use`, puede enrutar llamadas a APIs o funciones definidas por el desarrollador dentro de un flujo controlado.
- Despliegue local con llama.cpp: su formato GGUF permite cargarlo junto al modelo base mediante `llama-server` o `llama-cli`, lo que facilita prototipos sin depender de servicios en la nube.
- Prototipado de asistentes agenticos en hardware modesto: al ser un adaptador de ~30 M de parametros sobre un base de 3B, el coste de almacenamiento del ajuste es minimo y se puede experimentar con distintas configuraciones de agente.
- Investigacion sobre fine-tuning eficiente: sirve como ejemplo reproducible de conversion PEFT a GGUF y de aplicacion de LoRA en inferencia local.
- Evaluacion de comportamiento ReAct: util para comparar, en un mismo modelo base, el comportamiento con y sin el adaptador en tareas de decision secuencial.
- Bots de soporte con acceso a herramientas internas: puede integrarse en asistentes que consultan bases de datos o servicios internos, siempre que se proporcione el modelo base y se valide el formato de las llamadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion de agentes, y los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,1 GB (29.933.568 parametros en F16); el consumo real de VRAM lo determina el modelo base.
- Si el modelo base es un Qwen2.5 de 3B, las estimaciones orientativas de VRAM para el base son: ~6,2 GB en FP16, ~3,3 GB en cuantizacion Q8 y ~1,9 GB en Q4_K_M (cifras aproximadas, no confirmadas en la informacion proporcionada).
- GPU recomendadas para el base de 3B en FP16: tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090). En cuantizaciones Q4 es viable en GPU consumer de 4-6 GB.
- Despliegue en CPU: viable mediante llama.cpp, que es el runtime documentado en la model card.
- Opciones de despliegue documentadas: `llama-cli` y `llama-server` con el flag `--lora`. No se documentan vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de rendimiento que permitan una comparacion cuantitativa fiable. A continuacion se presenta una comparacion estructural con alternativas de la misma categoria, marcando como "no disponible" los datos que no se conocen.

| Modelo | Tipo | Parametros del artefacto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| johnsword/agenttune-qwen2.5-3b-react-lora-F16-GGUF | Adaptador LoRA | 29.933.568 (adaptador) | GGUF | MIT | Agente ReAct / tool-use |
| Cheng-1/agenttune-qwen2.5-3b-react-lora | Adaptador LoRA | no disponible | PEFT | no disponible | Agente ReAct / tool-use (origen) |
| Otros adaptadores LoRA para Qwen2.5-3B | Adaptador LoRA | no disponible | PEFT/GGUF | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base correspondiente (probablemente Qwen2.5-3B) para funcionar; el repositorio solo contiene el adaptador en GGUF.
- El recuento de parametros (29.933.568) corresponde al adaptador, no al modelo completo; no debe interpretarse como el tamano del modelo resultante.
- No hay informacion sobre el dataset de entrenamiento, los idiomas soportados ni el contexto maximo, por lo que no se puede garantizar su comportamiento fuera de los escenarios previstos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mecanismos especificos de mitigacion en este adaptador.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: el repositorio se publica bajo MIT, pero conviene verificar la licencia del modelo base y del adaptador original antes de un uso comercial.
- La fecha de creacion del repositorio aparece como 2026-10-06, dato que puede ser un error de la plataforma o requerir verificacion.
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo (corresponden a otro tema), por lo que no se ha podido ampliar la ficha con fuentes externas.
- Compatibilidad: el uso esta documentado para llama.cpp; otros runtimes pueden requerir conversion o no soportar adaptadores LoRA en GGUF.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/johnsword/agenttune-qwen2.5-3b-react-lora-F16-GGUF
- Adaptador original (PEFT): https://huggingface.co/Cheng-1/agenttune-qwen2.5-3b-react-lora
- Espacio de conversion GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion del servidor llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
