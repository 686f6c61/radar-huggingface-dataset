# hmkz-1981/gemma-4-e2b-agentic-rl-think-effort

## Resumen

gemma-4-e2b-agentic-rl-think-effort es un ajuste fino del modelo google/gemma-4-E2B-it desarrollado por el usuario hmkz-1981. Se trata de un modelo de generacion de texto orientado a uso agentico y a tool calling, entrenado mediante aprendizaje por refuerzo (GRPO) para incorporar un control explicito del "esfuerzo de razonamiento" en cinco niveles. El modelo parte de una variante previa del mismo autor (gemma-4-e2b-agentic-rl-think-r3) y anade la capacidad de solicitar, mediante el template de chat, una cantidad de pensamiento proporcional al nivel indicado.

La innovacion principal es la parametrizacion del esfuerzo cognitivo: el usuario puede pedir respuestas inmediatas sin cadena de pensamiento (low) o cadenas de razonamiento progresivamente mas largas (medium, high, xhigh, max). Segun la model card, el entrenamiento se realizo con 200 pasos de GRPO y una recompensa compuesta que premia la correccion de la respuesta y la cercania del numero de tokens de pensamiento a un objetivo definido por multiplicadores sobre la longitud habitual del modelo.

El modelo cuenta con 5.104.297.539 parametros totales segun los pesos en safetensors, un repositorio de 40,9 GB y licencia Apache 2.0. Los idiomas declarados son japones e ingles. No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-E2B-it) |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint google/gemma-4-E2B-it, por lo que hereda la arquitectura del modelo base de Google Gemma 4, si bien la model card no detalla la estructura interna (transformer denso, MoE u otra). El autor no especifica el numero de tokens de entrenamiento ni la composicion del dataset utilizado en el ajuste.

El entrenamiento se realizo con GRPO (Group Relative Policy Optimization) durante 200 pasos. La funcion de recompensa combina la tasa de acierto en la tarea con una penalizacion por desviacion respecto a un objetivo de longitud de pensamiento. Ese objetivo se calcula como la longitud habitual de razonamiento del modelo para el problema multiplicada por un factor segun el nivel de esfuerzo: 0,6 para medium, 1,0 para high, 1,5 para xhigh y 2,2 para max. La instruccion de nivel se inyecta automaticamente al final del system prompt mediante el template de chat con el formato `# EFFORT: <nivel> - <instruccion>`. El modelo conserva los parametros originales `enable_thinking` y `conversational_mode` del modelo base cuando no se especifica esfuerzo.

## Capacidades

- Generacion de texto conversacional en japones e ingles.
- Tool calling y function calling, segun los tags del repositorio (tool-use, agent).
- Seguimiento de instrucciones (instruction-following) orientado a tareas agenticas.
- Razonamiento multi-paso con cadena de pensamiento configurable en cinco niveles de esfuerzo (low, medium, high, xhigh, max).
- Modo sin pensamiento (low) para respuestas directas de baja latencia.
- Control del presupuesto de razonamiento mediante `chat_template_kwargs={"effort": ...}` en el template de chat.
- Compatibilidad con los modos `enable_thinking` y `conversational_mode` heredados del modelo base.
- No se declaran capacidades de vision, audio ni otros modos multimodales.

## Casos de uso

- Agentes con tool calling en produccion: el modelo puede invocar funciones y encadenar llamadas en flujos multi-paso, con la ventaja de poder fijar el nivel de esfuerzo segun la criticidad de la tarea (low para operaciones rutinarias, high o max para decisiones complejas).
- Atencion al cliente automatizada en japones o ingles: el modo low permite respuestas rapidas en conversaciones multi-turno sin coste de generacion de cadena de pensamiento, reduciendo latencia y tokens de salida.
- Enrutamiento adaptativo de coste computacional: un orquestador puede asignar effort=low a consultas simples y effort=max a consultas que requieran razonamiento profundo, ajustando el gasto en tokens de pensamiento por peticion.
- Automatizacion de tareas de back-office con reglas y APIs: el soporte de function calling permite integrar el modelo en pipelines que consulten sistemas internos y devuelvan resultados estructurados.
- Evaluacion y depuracion de razonamiento: la escala de esfuerzo facilita experimentos controlados sobre cuanto influye la longitud de la cadena de pensamiento en la precision, util para investigacion en RL y reasoning.
- Asistentes tecnicos en japones: el modelo esta entrenado y evaluado en japones, lo que lo hace adecuado para herramientas internas de equipos con documentacion en ese idioma.
- Prototipado rapido de agentes en entornos con recursos limitados: con 5,1 mil millones de parametros, es viable en GPUs de gama alta de consumo, aunque la model card no confirma cuantizaciones soportadas.

## Benchmarks y rendimiento

La model card incluye una evaluacion propia sobre 580 problemas no usados en entrenamiento, con temperatura 0. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| effort | mean (7 tareas, evaluacion propia) | think_median (tokens) | Proporcion de problemas con mas pensamiento que medium | Longitud de pensamiento vs. medium (mediana) |
|---|---|---|---|---|
| none | 0,935 | 323 | - | - |
| low | 0,893 | 0 | - | - |
| medium | 0,916 | 233 | - | - |
| high | 0,919 | 389 | 0,90 | 1,52x |
| xhigh | 0,922 | 452 | 0,90 | 1,87x |
| max | 0,926 | 512 | 0,95 | 2,10x |
| start(none) | 0,928 | 268 | - | - |

La fila start(none) corresponde al modelo previo al anadido del mecanismo de esfuerzo. El mejor resultado de la escala (max, 0,926) queda ligeramente por debajo del modelo sin esfuerzo (0,935 en modo none y 0,928 en start), lo que sugiere un pequeno coste de precision a cambio del control de longitud.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 10-11 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB; en 4 bits: en torno a 3-4 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas para servicio en produccion: A100, H100 o L40S para despliegues con concurrencia; RTX 4090 o RTX 3090 para uso individual en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM en fp16, y en tarjetas de 8 GB con cuantizacion de 8 bits.
- Opciones de despliegue: al publicarse en safetensors, requiere frameworks compatibles con el modelo base Gemma 4 (por ejemplo vLLM o TGI con soporte para Gemma); la conversion a GGUF para llama.cpp u Ollama no esta documentada por el autor.
- Latencia y throughput: no disponibles. El modo low elimina la generacion de tokens de pensamiento, lo que reduce la latencia de salida frente a los modos con razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-e2b-agentic-rl-think-effort | 5.104.297.539 | no disponible | ja, en | Apache 2.0 | Control de esfuerzo de razonamiento en 5 niveles; ajuste GRPO de 200 pasos |
| google/gemma-4-E2B-it (modelo base) | no disponible | no disponible | no disponible | Apache 2.0 | Modelo instructivo original de Google; sin control de esfuerzo |
| hmkz-1981/gemma-4-e2b-agentic-rl-think-r3 | no disponible | no disponible | ja, en | Apache 2.0 | Version previa del mismo autor, sin mecanismo de esfuerzo |

No se dispone de datos publicos de benchmarks estandar que permitan comparar el rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El ajuste fino se limita a japones e ingles; no se declara soporte de castellano ni de otros idiomas.
- La evaluacion presentada es propia (7 tareas, 580 problemas) y no equivale a benchmarks estandar, por lo que la comparabilidad con otros modelos es limitada.
- El modo max obtiene una puntuacion media ligeramente inferior al modo sin esfuerzo (0,926 frente a 0,935), lo que indica que mas razonamiento no garantiza mayor precision en todos los casos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion.
- No se detalla la composicion del dataset de entrenamiento ni posibles sesgos introducidos por el RL; se desconoce el impacto en dominios sensibles.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion ni de validacion independiente.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar los terminos del modelo base de Google.
- No se documentan cuantizaciones oficiales ni conversion a GGUF, lo que puede complicar el despliegue en entornos ligeros.
- El mecanismo de esfuerzo depende del template de chat; un uso incorrecto del template puede anular el control de longitud del razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmkz-1981/gemma-4-e2b-agentic-rl-think-effort
- Version previa del autor: https://huggingface.co/hmkz-1981/gemma-4-e2b-agentic-rl-think-r3
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
