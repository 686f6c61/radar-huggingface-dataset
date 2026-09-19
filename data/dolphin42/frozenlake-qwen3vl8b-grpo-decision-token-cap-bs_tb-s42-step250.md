# Dolphin42/frozenlake-qwen3vl8b-grpo-decision-token-cap-bs_tb-s42-step250

## Resumen

Este repositorio contiene un checkpoint de ajuste fino del modelo multimodal Qwen3-VL-8B-Instruct, publicado por el usuario Dolphin42, entrenado con GRPO durante 250 pasos para actuar como agente de uso de herramientas en el entorno FrozenLake. No es un modelo de propósito general: es un artefacto de investigación asociado a un estudio sobre el colapso del uso de herramientas en aprendizaje por refuerzo, y su interés principal es metodológico, no de producto.

El elemento diferencial es el controlador de actualización dividida implementado en `bsplit_trainer.py`: el gradiente de la fila correspondiente al token de decisión se aplica como un paso independiente, precondicionado por Adam y sin momento, con un límite que mantiene la KL de dicha fila por debajo de 2·10⁻⁴ por actualización, dejando intacto el paso principal. Con este esquema, la rama `bs_tb_s42` alcanza una cuota final de uso de herramienta del 95 %, una recompensa de 0,99 y una precisión del 0,94 en el conjunto held-out cuando la herramienta está disponible.

El modelo cuenta con 8.767.123.696 parámetros y se distribuye en safetensors (17,5 GB en el repositorio), bajo licencia Apache 2.0. El repositorio incluye pesos, tokenizador, `args.json` y `trainer_state.json`, pero no el estado del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language heredada de Qwen3-VL-8B-Instruct (detalle de capas y atencion no disponible) |
| Parametros totales | 8.767.123.696 (8,77 B) |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors (compatible con cuantizacion posterior a 8 y 4 bits mediante herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (17,5 GB; el tamano es consistente con precision BF16/FP16) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Tipo de ajuste | GRPO, 250 pasos, rama `bs_tb_s42` |
| Contenido del repositorio | Pesos, tokenizador, `args.json`, `trainer_state.json` (sin estado del optimizador) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-8B-Instruct, un transformer multimodal capaz de procesar imagen y texto. La informacion proporcionada no detalla el numero de capas, el mecanismo de atencion ni la configuracion exacta del codificador visual, por lo que esos datos quedan como no disponibles. El checkpoint parte de un ancestro entrenado con SFT y se somete despues a un ciclo de GRPO de 250 pasos.

La innovacion tecnica del entrenamiento es el controlador de actualizacion dividida: en lugar de aplicar un unico paso de optimizacion sobre todos los parametros, el gradiente de la fila del token de decision recibe un paso propio, precondicionado por Adam y sin momento, limitado para que la KL que induce en esa fila se mantenga por debajo de 2·10⁻⁴ por actualizacion. El paso principal del resto de la red no se modifica. El objetivo es evitar el colapso del uso de herramientas que sufren las lineas base sin regularizar, las cuales caen a un 0 % de cuota de herramienta en 3 de 5 semillas. En la rama publicada, el resultado final es de un 95 % de cuota de herramienta, recompensa 0,99 y precision held-out de 0,94 con la herramienta ofrecida. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Razonamiento multimodal: hereda del modelo base la capacidad de procesar entradas de imagen y texto, aunque el ajuste publicado esta orientado a la tarea de decision en FrozenLake.
- Uso de herramientas (tool calling): capacidad reforzada explicitamente mediante GRPO; la rama publicada mantiene una cuota de uso de herramienta del 95 %.
- Toma de decisiones secuenciales en entornos tipo gridworld: el entrenamiento se realiza sobre FrozenLake, con token de decision dedicado.
- Agentes multi-paso: la propia formulacion del entrenamiento (token de decision, uso de herramienta) apunta a flujos de varios pasos, aunque no se detalla el soporte de planificacion abierta.
- Generacion de texto y capacidades conversacionales generales: presentes de forma residual por herencia del modelo base, no optimizadas en este checkpoint.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Reproduccion de estudios sobre colapso de tool use: el checkpoint permite replicar la rama `bs_tb_s42` y compararla con lineas base sin regularizar, verificando la cuota de herramienta y la KL por actualizacion.
- Ablacion de controladores de actualizacion: sirve como punto de partida para comparar el paso dividido del token de decision frente a esquemas de optimizacion estandar en tareas de agente.
- Evaluacion de agentes en FrozenLake: el modelo puede desplegarse como politica de decision en este entorno para medir recompensa y precision held-out con y sin herramienta disponible.
- Punto de partida para ajuste posterior: al publicarse pesos y tokenizador, es utilizable como inicializacion para nuevos ciclos de SFT o RL orientados a otros entornos de decision.
- Generacion de trayectorias de demostracion: las interacciones del modelo con la herramienta pueden registrarse para construir datasets de destilacion o de imitacion en agentes mas pequenos.
- Analisis de estabilidad del entrenamiento con RL: `trainer_state.json` y `args.json` permiten estudiar curvas de recompensa, cuota de herramienta y deriva de KL a lo largo de los 250 pasos.
- Investigacion en modelos vision-language aplicados a decisiones: al heredar de Qwen3-VL-8B-Instruct, permite explorar si la representacion visual del entorno influye en la politica aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos numeros aportados por el autor corresponden a metricas de entrenamiento y evaluacion interna de la rama publicada, no a conjuntos estandar como MMLU, HumanEval o GSM8K.

| Metrica (rama `bs_tb_s42`, paso 250) | Valor |
|---|---|
| Cuota final de uso de herramienta | 95 % |
| Recompensa | 0,99 |
| Precision held-out con herramienta ofrecida | 0,94 |
| KL de la fila de decision por actualizacion | < 2·10⁻⁴ |
| Referencia: lineas base sin regularizar | 0 % de cuota de herramienta en 3 de 5 semillas |

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 18-20 GB solo para pesos, mas overhead del codificador visual y cache KV; en la practica se recomienda reservar 24 GB o mas.
- VRAM en cuantizacion de 8 bits: del orden de 10-12 GB, estimacion derivada del tamano de parametros.
- VRAM en cuantizacion de 4 bits: del orden de 6-8 GB, estimacion derivada del tamano de parametros.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, al limite segun longitud de contexto y resolucion de imagen).
- GPU de consumo: cabe en RTX 4090 y en tarjetas de 24 GB en BF16 con contexto moderado; en 4 bits es viable en GPUs de 8-12 GB, siempre que se genere una cuantizacion propia.
- Opciones de despliegue: al no publicarse GGUF, el uso directo requiere Transformers o servidores compatibles como vLLM o SGLang con soporte de modelos vision-language; llama.cpp y Ollama exigirian una conversion previa a GGUF. El reentrenamiento o la continuacion del run requieren ms-swift.
- Continuacion del entrenamiento: el autor indica usar `--resume_from_checkpoint <dir> --resume_only_model true --ignore_data_skip true`, ya que no se publica estado del optimizador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos verificados de modelos comparables en la informacion disponible, por lo que los campos no documentados se marcan como tales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| frozenlake-qwen3vl8b-grpo-decision-token-cap-bs_tb-s42-step250 | 8,77 B | No disponible | apache-2.0 | HuggingFace, 0 descargas, 0 likes | Agente de tool use en FrozenLake, artefacto de investigacion |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | No disponible en la informacion | No disponible | No disponible en la informacion | HuggingFace (referenciado como base) | Modelo multimodal de proposito general |
| Alternativas multimodales de ~8 B de otras familias | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables aportados |

## Limitaciones y advertencias

- Especializacion extrema: el ajuste esta orientado a la tarea de FrozenLake con uso de herramienta; el rendimiento en conversacion general, codigo o matematicas puede degradarse respecto al modelo base.
- Sobrerrepresentacion de la herramienta: una cuota de uso del 95 % implica que el modelo invocara la herramienta en casi cualquier interaccion, incluso cuando no aporte valor.
- Reproducibilidad condicionada: los resultados declarados dependen de la rama `bs_tb_s42` y del controlador de actualizacion dividida; sin ese esquema, el autor reporta colapso a 0 % de cuota de herramienta en 3 de 5 semillas.
- Ausencia de estado del optimizador: continuar el entrenamiento exactamente desde el paso 250 no es posible sin reinicializar el optimizador, lo que altera la dinamica del run.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en la informacion disponible, por lo que no existe verificacion independiente de los resultados.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual ni mecanismos de mitigacion; el riesgo es el propio de la familia base mas el inducido por el ajuste con RL.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar comportamiento multilingue o ventanas largas en produccion.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Licencia: el repositorio se publica como apache-2.0, pero conviene verificar los terminos aplicables al modelo base y a los componentes heredados antes de un uso comercial.
- Fechas de los metadatos: la informacion indica creacion y actualizacion en septiembre de 2026, dato que debe tratarse tal cual figura en el origen.
- Uso en produccion: no se recomienda como asistente general desplegado; su valor esta en la experimentacion controlada y en la comparacion de tecnicas de RL.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dolphin42/frozenlake-qwen3vl8b-grpo-decision-token-cap-bs_tb-s42-step250
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Estudio de referencia citado en la model card: paquete de reproduccion en zip y `bsplit_trainer.py`, sin URL publica en la informacion disponible.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las entradas devueltas no guardan relacion con el modelo ni con su dominio tecnico.
