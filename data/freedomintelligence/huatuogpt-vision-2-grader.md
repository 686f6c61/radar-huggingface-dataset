# FreedomIntelligence/HuatuoGPT-Vision-2-Grader

## Resumen

HuatuoGPT-Vision-2-Grader es un modelo multimodal especializado en la evaluacion de respuestas medicas mediante rubricas. Lo desarrolla FreedomIntelligence y se construye como un ajuste fino de Qwen/Qwen3-VL-8B-Instruct, un transformer multimodal de aproximadamente 8.770 millones de parametros. Su funcion no es responder preguntas clinicas, sino actuar como juez: recibe una imagen medica (o ninguna, en conversaciones de solo texto), la conversacion asociada y una lista de criterios con puntuacion, y devuelve un liston JSON de booleanos indicando que criterios se cumplen.

El modelo resuelve un problema concreto en el ciclo de entrenamiento con RL y en la evaluacion automatica de asistentes medicos: la necesidad de un grader fiable, reproducible y economico para preguntas abiertas. Se entrena sobre juicios de rubrica generados con GPT-4.1 y alcanza un 91,9 % de acuerdo por item de rubrica con esas etiquetas en un conjunto de test retenido de 1.165 casos y 25.191 items. Ademas de servir como recompensa en RL, puede calificar conversaciones de solo texto.

Es relevante ahora porque el ecosistema de evaluacion medica multimodal carece de graders abiertos que combinen imagen y texto con un protocolo de puntuacion bien definido. Este modelo expone una plantilla de grading fija, un script de scoring por lotes y compatibilidad con servidores OpenAI (SGLang, vLLM), lo que facilita integrarlo en pipelines de evaluacion y de RL sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), fine-tune de Qwen3-VL-8B-Instruct |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-8B-Instruct: un transformer multimodal que procesa imagenes y texto conjuntamente. El processor redimensiona las imagenes a un maximo de 921.600 pixeles, que es la resolucion empleada durante el entrenamiento. El ajuste fino convierte el modelo base en un grader de rubricas: recibe la conversacion y los criterios numerados con puntos con signo, y emite una lista JSON de booleanos de la misma longitud que la lista de rubricas.

El entrenamiento se realizo sobre juicios de rubrica generados por GPT-4.1, segun indica la model card. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO adicional. La innovacion principal es el formato de salida restringido: el modelo siempre produce un JSON valido con el numero correcto de elementos, lo que permite usarlo directamente como funcion de recompensa. El protocolo de grading en RL elimina la parte de razonamiento (thinking) y califica solo los primeros 10.000 caracteres de la respuesta final. La recompensa se calcula como la suma de puntos de criterios cumplidos dividida entre el total de puntos positivos, recortada al intervalo [0, 1].

## Capacidades

- Evaluacion de rubricas multimodales: comprueba cada criterio mirando simultaneamente la imagen medica y la respuesta del asistente.
- Evaluacion de solo texto: acepta conversaciones sin imagen enviando la plantilla como texto plano.
- Salida estructurada garantizada: devuelve siempre una lista JSON valida de booleanos con la longitud exacta del numero de rubricas.
- Manejo de criterios negativos: los items con puntos negativos se marcan como `true` solo cuando la respuesta muestra el comportamiento indeseado.
- Uso como recompensa en RL: integrable en el codigo de RL de HuatuoGPT-Vision-2 mediante el script `grading.py`.
- Scoring por lotes: el script `score.py` procesa ficheros JSON con `prompt`, `response`, `rubrics` e imagenes opcionales, y devuelve `criteria_met`, `raw_score` y `training_reward`.
- Despliegue como servidor compatible con OpenAI: soporte documentado para SGLang y vLLM.
- Generacion determinista recomendada: el ejemplo oficial usa `do_sample=False` y `temperature: 0`.

## Casos de uso

- Evaluacion automatica de asistentes medicos multimodales: el modelo califica respuestas abiertas sobre imagenes clinicas (por ejemplo, radiografias de torax) comprobando criterios como identificar un derrame pleural o su lateralidad, con el acuerdo documentado frente a GPT-4.1.
- Funcion de recompensa en RL: se despliega con SGLang o vLLM y el codigo de RL de HuatuoGPT-Vision-2 lo consulta para puntuar respuestas generadas durante el entrenamiento, sustituyendo juicios de un modelo propietario.
- Control de calidad en pipelines de datos medicos: `score.py` permite puntuar por lotes (`--batch-size 8`) conjuntos de pares pregunta-respuesta con rubricas y filtrar los que no alcanzan un umbral de `training_reward`.
- Evaluacion de benchmarks medicos abiertos: califica casos de conjuntos como HealthBench Professional (50 casos, 94 items, 93,6 % de acuerdo) usando las rubricas originales del benchmark.
- Grading de conversaciones de solo texto: evalua respuestas de chatbots clinicos sin componente visual, con 922 casos y 19.699 items de texto general y medico reportados en la model card.
- Auditoria de respuestas con criterios negativos: detecta afirmaciones incorrectas o peligrosas penalizadas en la rubrica (por ejemplo, reportar un neumotorax inexistente) y descuenta los puntos correspondientes.
- Investigacion en evaluacion medica: permite reproducir el protocolo de grading del paper y comparar graders abiertos frente a jueces propietarios con una plantilla fija y determinista.

## Benchmarks y rendimiento

Acuerdo por item de rubrica con las etiquetas de GPT-4.1, generacion libre, conjunto de test retenido:

| Dominio | Casos | Items de rubrica | Acuerdo (%) | Precision balanceada (%) |
|---|---:|---:|---:|---:|
| Imagenes medicas (figuras de PubMed) | 193 | 5.398 | 92,4 | 92,2 |
| HealthBench Professional | 50 | 94 | 93,6 | 93,1 |
| Texto general y medico | 922 | 19.699 | 91,7 | 91,6 |
| **Global** | **1.165** | **25.191** | **91,9** | **91,8** |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 8.767 millones de parametros, en bf16/fp16 se requiere aproximadamente 17,5 GB solo para pesos, mas memoria para el procesador de vision y el KV cache; el repositorio ocupa 17,5 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, encaja en A100 40/80 GB, H100 y L40S; en consumer, requiere GPUs con 24 GB o mas (RTX 3090, RTX 4090) en bf16, con margen ajustado para imagenes de alta resolucion.
- Cabe en consumer GPU: previsiblemente en RTX 3090/4090 de 24 GB en bf16; no confirmado por el autor. No se documentan opciones de cuantizacion (GGUF, AWQ, GPTQ).
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), SGLang (`python -m sglang.launch_server`) y vLLM (`vllm serve`), ambos con API compatible con OpenAI en el puerto indicado (30001 en los ejemplos).
- Latencia y throughput: no disponibles. El ejemplo oficial usa `max_new_tokens=512`, lo que acota la generacion por caso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HuatuoGPT-Vision-2-Grader | 8,77 B | no disponible | Grader de rubricas medico multimodales | no disponible | Hugging Face |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8 B (clase) | no disponible | Modelo generalista image-text-to-text | no disponible en esta ficha | Hugging Face |
| GPT-4.1 (referencia de etiquetas) | no disponible | no disponible | Juez generalista usado para generar las etiquetas | propietaria | API |
| HuatuoGPT-Vision-2 | no disponible | no disponible | Asistente medico multimodal (modelo evaluado) | no disponible | GitHub / Hugging Face |

La comparacion cuantitativa solo esta disponible frente a GPT-4.1, con un 91,9 % de acuerdo global. No se han publicado en la informacion disponible comparaciones de rendimiento con otros graders abiertos.

## Limitaciones y advertencias

- El modelo es un evaluador, no un asistente clinico: no debe usarse para responder consultas medicas ni para diagnostico.
- Su calidad esta acotada por las etiquetas de GPT-4.1: reproduce los sesgos y errores del juez propietario usado en el entrenamiento, con un margen de desacuerdo de aproximadamente el 8 % por item.
- La licencia no esta disponible en la informacion proporcionada; no se puede confirmar el uso comercial sin consultar el repositorio del autor.
- No se documentan los idiomas soportados; el rendimiento fuera del ingles no esta garantizado.
- No se especifica la longitud de contexto; conversaciones o listas de rubricas muy largas pueden truncarse.
- Las imagenes se redimensionan a un maximo de 921.600 pixeles; detalles finos de imagenes de mayor resolucion pueden perderse.
- El protocolo de RL solo califica los primeros 10.000 caracteres de la respuesta final y descarta la parte de razonamiento, lo que puede omitir contenido relevante en respuestas muy largas.
- Riesgo de alucinacion en la propia evaluacion: el modelo podria marcar criterios como cumplidos sin evidencia suficiente; se recomienda validacion humana en decisiones de alto impacto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion externa de la comunidad es practicamente inexistente.
- El uso de `do_sample=False` y `temperature: 0` es el recomendado; la generacion estocastica puede romper la garantia de JSON valido de longitud correcta.

## Enlaces

- Hugging Face: https://huggingface.co/FreedomIntelligence/HuatuoGPT-Vision-2-Grader
- GitHub: https://github.com/FreedomIntelligence/HuatuoGPT-Vision-2
- Codigo de RL: https://github.com/FreedomIntelligence/HuatuoGPT-Vision-2/tree/main/rl
- Paper (OpenReview): https://openreview.net/pdf?id=0BXKsjKlFJ
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
