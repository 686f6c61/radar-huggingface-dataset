# Axonry/pr81-qwen3.5-0.8b

## Resumen

`Axonry/pr81-qwen3.5-0.8b` es una reconstrucción del checkpoint ganador de la competición WeightSpaceProgramming PR #81 (subnet 99 de Axonry), presentada por el minero UID 56. No es un modelo entrenado desde cero: es una **edición exclusiva de pesos** sobre [`Qwen/Qwen3.5-0.8B`](https://huggingface.co/Qwen/Qwen3.5-0.8B), sin parámetros adicionales, sin detector en tiempo de inferencia y sin llamadas a herramientas. El objetivo de la edición es el control de la longitud del razonamiento en modelos con modo thinking.

La modificación actúa en dos etapas. Primero, suprime el cierre prematuro del razonamiento: se puntúan cuatro muestras por problema matemático con RLOO y el delta de pesos de policy gradient, ajustado solo sobre tokens de alta entropía, se aplica con coeficiente negativo para que el modelo siga comprobando en lugar de concluir antes de tiempo. Segundo, se añaden hasta cuatro neuronas MLP de bajo uso sustituidas por unidades condicionalmente activadas (`Wrap-up`, `BF`, `BX`) que elevan la probabilidad de emitir el token de fin de pensamiento cuando el razonamiento ya es tardío, especialmente tras un salto de línea.

El modelo tiene 873.438.784 parámetros en BF16, se distribuye en safetensors y hereda la licencia Apache-2.0 del modelo base. Su relevancia es doble: por un lado, demuestra que es posible modificar el comportamiento de razonamiento de un LLM sin reentrenar; por otro, sirve como caso de estudio metodológico sobre cómo evaluar ediciones de pesos con protocolos reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3.5-0.8B); sin detalles adicionales en la informacion disponible |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; la evaluacion uso 32.768 tokens de generacion y un servidor vLLM con 73.728 tokens de contexto |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` en el commit `2fc06364715b967f1860aea9cf38778875588b17` y aplica una edicion sobre 96 de sus 488 tensores, todos en BF16, verificados contra la cadena de edicion publicada. No hay cambios estructurales: la arquitectura subyacente es la del modelo base, y la edicion opera exclusivamente en el espacio de pesos.

El proceso de edicion combina dos tecnicas. La primera es una actualizacion de policy gradient tipo RLOO: para cada problema matematico se generan cuatro muestras, se puntuan y se calcula un delta de pesos restringido a tokens de alta entropia, que se aplica con signo negativo para penalizar el cierre prematuro del razonamiento. La segunda es una sustitucion de neuronas MLP de bajo uso por unidades con activacion condicional (`Wrap-up`, `BF`, `BX`) que actuan como interruptor de cierre: cuando el razonamiento lleva suficiente longitud, especialmente al inicio de una nueva linea, aumentan la probabilidad de emitir el token de fin de pensamiento y abrir la respuesta encajada en caja. El checkpoint incluye un digest de competicion (`fc928358...`) calculado sobre la lista declarada de tensores editados, no sobre el fichero completo, y un SHA-256 de reconstruccion (`d8d4736d...`).

## Capacidades

- Generacion de texto conversacional con modo thinking explicito (`enable_thinking`) y modo por defecto sin thinking.
- Razonamiento matematico multi-paso, con control de longitud del razonamiento orientado a evitar cierres prematuros.
- Resolucion de problemas de competicion (AIME, HMMT) y aritmetica escolar (GSM8K).
- Respuesta a preguntas de opcion multiple en dominios academicos y profesionales (MMLU-Pro, GPQA Diamond, LEXam).
- Seguimiento de instrucciones con verificacion a nivel de prompt (IFBench).
- Generacion de estructuras JSON/YAML no restringidas (IFStruct).
- Salida de probabilidades de etiqueta para decisiones tipadas (Typed Decisions).
- Capacidad multimodal declarada por el pipeline `image-text-to-text` del modelo base; no se documenta evaluacion de vision en esta ficha.
- No soporta tool calling ni function calling: la model card lo indica explicitamente ("no tool calls").
- No incorpora detector en tiempo de inferencia ni componentes externos.

## Casos de uso

- **Razonamiento matematico con presupuesto de tokens controlado**: el modelo esta disenado para no agotar el presupuesto de generacion en modo thinking. En un pipeline de resolucion de problemas con limite de tokens, la edicion reduce el riesgo de truncamiento, como evidencia la evaluacion de GSM8K sin truncamientos sobre 5.276 generaciones.
- **Tutoria o asistencia educativa en matematicas**: para problemas de nivel escolar y preuniversitario, el modelo puede generar explicaciones paso a paso y una respuesta final encajada, con un modo sin thinking para respuestas rapidas cuando no se requiere derivacion.
- **Clasificacion y decision con umbral de confianza**: la salida de probabilidades de etiqueta (evaluada en Typed Decisions con accuracy 0,414 y ECE 0,330) permite usar el modelo como clasificador calibrado en tareas de decision con etiquetas discretas, aunque la calibracion es mejorable.
- **Generacion de configuracion estructurada**: con IFStruct v1.0 como referencia, el modelo puede emitir JSON/YAML no restringido en tareas de extraccion o configuracion, siempre con validacion posterior en produccion dado el bajo porcentaje obtenido (16,85%).
- **Prototipado de investigacion sobre edicion de pesos**: el checkpoint es util como referencia reproducible para estudiar tecnicas de weight-space programming, RLOO aplicado a pesos y sustitucion de neuronas MLP, gracias a los digests y registros de evaluacion publicados.
- **Evaluacion comparativa de modos thinking y no-thinking**: los pares de ejecuciones con las mismas semillas y parametros permiten medir el impacto del modo thinking en tareas de razonamiento, util para decidir la configuracion en produccion.
- **Despliegue en hardware de consumo para pruebas**: con menos de mil millones de parametros en BF16, el modelo cabe en GPUs de gama alta de consumo, lo que facilita experimentacion local con vLLM o transformers.

## Benchmarks y rendimiento

Resultados medidos el 2026-11-22 con el checkpoint reconstruido en BF16. Los benchmarks generativos se ejecutaron en 8x RTX 5090 con vLLM 0.33.0 (data parallel de 8 vias, contexto de servidor de 73.728 tokens). Valores en porcentaje salvo indicacion.

| Benchmark | Resultado | Tareas / muestras | Protocolo |
|---|---:|---|---|
| GSM8K | 84,034622 | 1.319 x 4 = 5.276 | 0-shot, prompt oficial de HF Inspect, scorer `model_graded_fact` (juez = modelo evaluado), thinking on, T=0,6, top_p=0,95, top_k=20, presence 1,5, 32.768 tokens, pass@1 sobre 4 epocas |
| MMLU-Pro | 47,007979 | 12.032 x 1 | Test completo, zero-shot, Inspect `multiple_choice` + `choice` |
| GPQA Diamond | 34,722222 | 198 x 4 = 792 | Config `gpqa_diamond`, prompt multiple-choice, thinking on, pass@1 sobre 4 muestras (275/792), sin truncamiento |
| IFBench | 35,000000 | 300 x 1 | 300 prompts held-out oficiales, `prompt_level_loose`, thinking on, temperatura 0 |
| IFStruct v1.0 | 16,850000 | 2.000 x 1 | Cliente nativo del autor, JSON/YAML no restringido, T=0, 16.000 tokens, sin thinking |
| Typed Decisions | accuracy 0,414000; KL 1,22394048 nats; Brier 0,46348944; ECE 0,33047390 | 400 casos / 2.000 decisiones | Probabilidades nativas de etiqueta, cuatro metricas |
| AIME 2026 | 4,791667 | 30 x 16 = 480 | Prompt y grading de MathArena, T=1,0, top_p=0,95, top_k=20, presence 1,5, 65.500 tokens, thinking explicito, avg@16 |
| HMMT February 2026 | 5,113636 | 33 x 16 = 528 | Igual que AIME 2026 |
| LEXam (cuatro opciones) | 32,809668 | 1.655 x 1 | `mcq_4_choices/test`, scorer choice de Inspect, thinking on, T=0,6 |

Control pareado thinking / no-thinking (mismas preguntas, semillas, parametros y grader):

| Benchmark | Thinking | Por defecto (sin thinking) | Delta |
|---|---:|---:|---:|
| AIME 2026 | 4,791667% | 0,416667% (2/480) | -4,375 pp |
| HMMT Feb 2026 | 5,113636% | 0,946970% (5/528) | -4,167 pp |

Advertencias de evaluacion declaradas por el autor: GSM8K es autoevaluado por el propio modelo; con denominador estricto que cuenta las 218 sentencias no puntuables como incorrectas, el resultado baja a 80,67% (4.256/5.276). GPQA Diamond sigue la definicion de tarea del dataset pero sirve las opciones en el orden del CSV, sin permutacion, por lo que no se controla el sesgo de posicion. Los resultados son `community` y no estan verificados por Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,8 GB para pesos, mas memoria de activaciones y cache KV; con contexto de 32.768 tokens la cache KV domina el consumo y puede requerir varios GB adicionales segun configuracion.
- GPU recomendadas: el autor reporta evaluacion en 8x RTX 5090 con vLLM 0.33.0 en data parallel de 8 vias y contexto de servidor de 73.728 tokens.
- Cabe en GPU de consumo: si, con 873 millones de parametros en BF16 el modelo entra en cualquier GPU con 8 GB o mas; en cuantizaciones de 8 o 4 bits el requisito baja aun mas, aunque no se publican variantes cuantizadas.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado en la evaluacion) y, por compatibilidad con el modelo base, previsiblemente llama.cpp y Ollama, aunque no se documenta soporte explicito.
- Latencia y throughput: no disponibles; no se publican mediciones de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Axonry/pr81-qwen3.5-0.8b` | 873 M | No disponible (evaluado con 32.768 tokens de generacion) | Apache-2.0 | Edicion de pesos con control de longitud de razonamiento; GSM8K 84,03%, MMLU-Pro 47,01% |
| `Qwen/Qwen3.5-0.8B` (base) | 873 M | No disponible en esta ficha | Apache-2.0 | Modelo original sin edicion; la model card indica que el base agota con frecuencia el presupuesto en modo thinking |
| `Qwen/Qwen3-0.6B` | 596 M | 32.768 tokens (segun documentacion publica de la familia Qwen3) | Apache-2.0 | Alternativa de la misma familia y rango de tamano; sin datos de benchmark en esta ficha |

La comparacion directa con otros modelos del mismo rango no esta disponible en la informacion proporcionada; los datos de benchmark de esta ficha corresponden unicamente al checkpoint editado y no se acompanan de resultados del base sin editar en los mismos protocolos, salvo los pares thinking/no-thinking de AIME y HMMT.

## Limitaciones y advertencias

- **Resultados no verificados**: las metricas son `community`, autoevaluadas por el autor, no verificadas por Hugging Face.
- **GSM8K autoevaluado**: el juez es el propio modelo evaluado; con denominador estricto el resultado cae de 84,03% a 80,67%.
- **Rendimiento bajo en matematicas de competicion**: AIME 2026 (4,79%) y HMMT Feb 2026 (5,11%) son valores muy bajos en terminos absolutos, aunque superan al modo sin thinking.
- **Riesgo de alucinacion**: no se documenta evaluacion de factualidad ni de tasas de alucinacion; el modelo es de 873 M de parametros y su conocimiento factual es limitado.
- **Idiomas no documentados**: la model card no declara idiomas soportados; el comportamiento multilingue no esta evaluado.
- **Sin tool calling**: no soporta function calling ni llamadas a herramientas, lo que limita su uso en pipelines de agentes.
- **Sesgo de posicion en GPQA**: las opciones se sirven en el orden del CSV sin permutacion, por lo que el sesgo de posicion no esta controlado en esa evaluacion.
- **Formato estructurado debil**: IFStruct v1.0 al 16,85% indica que la generacion de JSON/YAML no restringido no es fiable sin validacion posterior.
- **Calibracion mejorable**: ECE de 0,330 en Typed Decisions implica que las probabilidades de etiqueta no estan bien calibradas para uso directo como umbral de confianza.
- **Licencia**: Apache-2.0 permite uso comercial, pero el autor remite a la licencia del modelo base; conviene revisar los terminos de `Qwen/Qwen3.5-0.8B` antes de desplegar en produccion.
- **Compatibilidad de plantilla**: el autor advierte que la plantilla por defecto es no-thinking; el comportamiento thinking requiere pasar `enable_thinking` explicitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Axonry/pr81-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Pull request de la competicion: https://github.com/AxOrganization/WeightSpaceProgramming/pull/81
- Registros de evaluacion: carpeta `.eval_results/` del repositorio en Hugging Face
