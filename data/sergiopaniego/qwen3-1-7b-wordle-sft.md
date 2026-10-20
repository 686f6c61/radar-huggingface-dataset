# sergiopaniego/Qwen3-1.7B-Wordle-SFT

## Resumen

Qwen3-1.7B-Wordle-SFT es un ajuste fino supervisado (SFT) del modelo Qwen3-1.7B de Alibaba, publicado por el desarrollador sergiopaniego. El modelo parte de una arquitectura transformer densa de 1.720.574.976 parámetros (aproximadamente 1,72 mil millones) y se ha entrenado con la librería TRL sobre el dataset `sergiopaniego/wordle-tool-calls-sft`, un conjunto de datos orientado a llamadas a herramientas (tool calls) en el contexto del juego Wordle.

El problema que aborda es acotado pero representativo: dotar a un modelo pequeno de la capacidad de emitir llamadas a funciones estructuradas dentro de un flujo de juego con restricciones (adivinar palabras, validar letras, gestionar intentos). Es un caso de uso tipico de agentes con tool calling donde el razonamiento multi-paso y el formato estricto de salida importan mas que el conocimiento general.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible de un pipeline de SFT con TRL sobre un modelo de menos de 2B parametros, desplegable en hardware de consumo. Por otro, las etiquetas del repositorio apuntan a un espacio de Trackio denominado `wordle-grpo-thinking-static`, lo que sugiere que este checkpoint forma parte de una comparativa entre SFT y GRPO (aprendizaje por refuerzo) con modo de razonamiento, un tema de interes actual en la investigacion sobre modelos pequenos. La model card es minima y no documenta composicion del dataset, idiomas ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 1.720.574.976 (~1,72 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible para el fine-tune; el modelo base Qwen3-1.7B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | no se publican versiones cuantizadas; al ser un checkpoint `transformers` en safetensors se puede cuantizar a 8/4 bits con bitsandbytes o convertir a GGUF (Q4_K_M, Q5_K_M, Q8_0) |
| Idiomas soportados | no disponible para el fine-tune (el modelo base declara soporte de 119 idiomas) |
| Licencia | no disponible (la model card incluye un campo `licence` sin valor utilizable; el modelo base Qwen3-1.7B es Apache 2.0) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | Qwen/Qwen3-1.7B |
| Dataset de entrenamiento | sergiopaniego/wordle-tool-calls-sft |
| Metodo de entrenamiento | SFT con TRL 1.15.0 |
| Tamano del repositorio | 6,9 GB |
| Pipeline | text-generation |
| Compatibilidad de despliegue | text-generation-inference, endpoints_compatible, conversational |
| Fecha de creacion | 2026-10-19 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-1.7B: un transformer decoder-only denso, sin mezcla de expertos, con atención por grupos de consultas (GQA) y codificacion posicional rotatoria (RoPE). Al ser un ajuste fino, no se introduce ningun cambio estructural; el entrenamiento modifica exclusivamente los pesos preentrenados para especializar la distribucion de salida hacia el formato de tool calls del juego Wordle.

El entrenamiento se realizo con SFT mediante TRL 1.15.0, sobre el dataset `sergiopaniego/wordle-tool-calls-sft`. Las versiones de framework declaradas son Transformers 5.20.2, PyTorch 2.14.1, Datasets 5.1.0 y Tokenizers 0.23.3. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de system prompts, ni si hubo etapas posteriores de preferencia (DPO/RLHF). La etiqueta `trackio:https://huggingface.co/spaces/sergiopaniego/wordle-grpo-thinking-static-e8dd40` indica que el checkpoint esta vinculado a un experimento de seguimiento con GRPO y modo thinking, pero no se aportan detalles de ese pipeline en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en formato de chat (el ejemplo de la model card usa una lista de mensajes con rol `user`).
- Emision de llamadas a herramientas (tool calling / function calling) en el dominio del juego Wordle, que es el objetivo declarado del ajuste fino.
- Razonamiento multi-paso dentro de una partida: gestion de intentos, interpretacion de restricciones y seleccion de la siguiente palabra.
- Integracion con el ecosistema `transformers` mediante `pipeline("text-generation")`.
- Compatibilidad declarada con Text Generation Inference y con endpoints compatibles, lo que habilita su uso como servicio HTTP.
- Capacidad de razonamiento general y conocimiento del mundo heredados de Qwen3-1.7B, aunque potencialmente degradados por la especializacion.
- Soporte multilingue: no documentado para este fine-tune; el modelo base declara 119 idiomas.
- Modo thinking: no confirmado en este checkpoint; la etiqueta de Trackio sugiere que existe una variante experimental con reasoning explicito, pero la model card no lo describe.

## Casos de uso

- Agente jugador de Wordle: el modelo recibe el estado de la partida (letras acertadas, descartadas, posiciones) y emite la llamada a la herramienta de validacion con la siguiente palabra candidata. Su ajuste especifico lo hace adecuado frente a un modelo generico que tendria que aprender el formato en el prompt.
- Demostracion docente de tool calling: sirve para ilustrar en un curso o taller como se entrena y despliega un agente con function calling usando TRL, sin requerir GPUs de datacenter.
- Baseline para investigacion en razonamiento: al existir un experimento asociado con GRPO y modo thinking, este checkpoint SFT actua como referencia para medir la ganancia de tecnicas de refuerzo sobre modelos de menos de 2B parametros.
- Prototipado de agentes conversacionales con estado: su ventana de contexto permite mantener el historial de una partida completa (decenas de turnos) sin truncamiento, lo que facilita la implementacion de bucles agente-entorno.
- Evaluacion de formato estructurado: util como caso de prueba para validar parsers de tool calls, esquemas JSON y tecnicas de constrained decoding en pipelines de produccion.
- Despliegue en local o en el borde: con cuantizacion a 4 bits ocupa del orden de 1-2 GB, por lo que puede ejecutarse en un portatil con GPU modesta para demos interactivas o pruebas de integracion continuas.
- Generacion de datos sinteticos de partidas: el modelo puede producir trazas de tool calls que despues se filtran y reutilizan para ampliar el dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni metricas especificas de la tarea de Wordle (tasa de exito, numero medio de intentos, validez del formato de tool call).

## Requisitos de hardware

- Pesos en BF16: aproximadamente 3,44 GB (1,72 B de parametros a 2 bytes). El repositorio ocupa 6,9 GB, por lo que se necesita ese espacio en disco para la descarga completa.
- VRAM estimada en BF16/FP16: del orden de 4,5 a 6 GB incluyendo overhead de activaciones y cache KV con contexto moderado; el cache KV crece de forma lineal con la longitud de contexto, por lo que a 32.768 tokens puede anadir varios GB adicionales.
- VRAM estimada en INT8: aproximadamente 2,5 a 3 GB.
- VRAM estimada en 4 bits (bitsandbytes o GGUF Q4_K_M): aproximadamente 1,5 a 2 GB, lo que permite ejecucion en GPUs de 4-8 GB con contextos cortos.
- GPU recomendadas: NVIDIA A100 40/80 GB o H100 para servir en BF16 con contextos largos y concurrencia; RTX 4090 (24 GB) para desarrollo y despliegue monousuario; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o L4 para inferencia cuantizada.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas en 4/8 bits, y en tarjetas de 6-8 GB en BF16 solo con contextos reducidos.
- Opciones de despliegue: Transformers (`pipeline`), Text Generation Inference (soportado segun las etiquetas), Inference Endpoints, vLLM para servicio con batching, y llama.cpp/Ollama tras convertir los pesos a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de su documentacion publica; no se dispone de evaluaciones comparativas directas con este fine-tune.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-1.7B-Wordle-SFT | 1,72 B | 32.768 (base, ampliable con YaRN) | no disponible | SFT especializado en tool calls para Wordle |
| Qwen3-1.7B | 1,72 B | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | Modelo base generalista con modo thinking |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | Instrucciones generales, tool calling |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | Instrucciones generales, orientado a recuperacion y resumen |
| Gemma-3-1B-it | 1 B | 32.768 | Gemma Terms of Use | Instrucciones generales, multimodal en variantes mayores |

Frente a los modelos generalistas de su tamano, la diferencia practica es la especializacion: Qwen3-1.7B-Wordle-SFT deberia superar en formato y consistencia de tool calls dentro del dominio Wordle, pero probablemente rinda peor en tareas generales. No hay datos publicados que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste se limita a un dataset de tool calls para Wordle; es esperable un cierto olvido catastrofico en capacidades generales respecto a Qwen3-1.7B.
- Licencia ambigua: la model card incluye un campo `licence` sin contenido utilizable. Aunque el modelo base es Apache 2.0, no se puede asumir la misma licencia para los pesos derivados sin confirmacion del autor; conviene contactar con el publicador antes de un uso comercial.
- Sin validacion externa: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de la comunidad sobre su calidad o estabilidad.
- Riesgo de alucinacion: como cualquier modelo de 1,7 B, puede inventar palabras no presentes en el diccionario del juego o emitir llamadas a herramientas con argumentos invalidos; es necesario validar la salida con un parser estricto y un diccionario externo.
- Ambiguedad de idioma: no se documenta el idioma del dataset de entrenamiento ni el soporte multilingue del fine-tune; el uso en castellano no esta garantizado.
- Ausencia de datos de entrenamiento: no se especifican numero de tokens, composicion, filtrado ni sesgos del dataset, lo que impide evaluar riesgos de contaminacion o desequilibrios.
- Contexto no verificado: la ventana de 32.768 tokens corresponde al modelo base; no hay confirmacion de que el ajuste preserve el rendimiento en contextos largos.
- Formato de pesos unico: solo se distribuyen safetensors en BF16, sin GGUF ni cuantizaciones listas, lo que anade un paso de conversion para despliegues en llama.cpp u Ollama.
- Fecha de publicacion advanced: el repositorio figura creado en 2026-10-19, posterior a la mayoria de checkpoints de la familia; conviene verificar que el contenido no sea un experimento temporal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sergiopaniego/Qwen3-1.7B-Wordle-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/sergiopaniego/wordle-tool-calls-sft
- Repositorio de TRL: https://github.com/huggingface/trl
- Espacio de Trackio del experimento GRPO con thinking: https://huggingface.co/spaces/sergiopaniego/wordle-grpo-thinking-static-e8dd40
