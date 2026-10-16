# gasolsun/Math_DeepSeek-R1-Distill-Qwen-7B_Skywork-OR1-Math-7B

## Resumen

Math_DeepSeek-R1-Distill-Qwen-7B_Skywork-OR1-Math-7B es un modelo de lenguaje especializado en razonamiento matemático publicado por el usuario gasolsun en HuggingFace. Se construye destilando el modelo base deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (7,6 mil millones de parametros, arquitectura Qwen2) a partir del profesor Skywork/Skywork-OR1-Math-7B, mediante una metodologia denominada Ask to Distill combinada con destilacion on-policy (OPD). El objetivo es mejorar la capacidad de resolucion de problemas matematicos del estudiante sin emplear preguntas reales de entrenamiento ni respuestas de referencia.

La relevancia del modelo radica en su metodo de entrenamiento: se entrena un generador de preguntas con RL para que produzca enunciados que expongan desacuerdo a nivel de token entre profesor y estudiante sobre las propias soluciones de este ultimo. Ese banco de preguntas se filtra, se deduplica y se usa para entrenar al estudiante con destilacion on-policy, sin ninguna etiqueta de resultado. El resultado es un modelo de 7,6B de parametros que alcanza un promedio de 64,54 en seis benchmarks de matematica (AIME24, AIME25, AIME26, AMC23, BRUMO25 y MATH500).

El modelo se distribuye bajo licencia MIT en formato safetensors, con soporte para text-generation-inference y endpoints compatibles. Esta pensado como modelo de razonamiento matematico conversacional, con salidas extensas (hasta 31.744 tokens nuevos en la evaluacion), lo que lo hace adecuado para tareas que requieren cadenas de razonamiento largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base DeepSeek-R1-Distill-Qwen-7B deriva de Qwen2-7B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se especifica la precision de almacenamiento) |
| Idiomas soportados | no disponibles (la ficha no declara idiomas; los benchmarks son en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, es decir, un transformer decoder-only de la familia Qwen2 con aproximadamente 7,6B de parametros. No se trata de una arquitectura MoE ni hibrida: es un transformer denso convencional para generacion de texto autoregresiva.

El entrenamiento sigue el marco Ask to Distill. En primer lugar se entrena un generador de preguntas mediante aprendizaje por refuerzo, con el objetivo de que las preguntas que escribe maximicen un desacuerdo a nivel de token, acotado y aprendible, entre el profesor (Skywork-OR1-Math-7B) y el estudiante (DeepSeek-R1-Distill-Qwen-7B) sobre las soluciones que el propio estudiante genera; esa senal es la misma de la que aprende la destilacion on-policy. A continuacion se muestrea un banco de preguntas del generador, se filtra, se deduplica y se utiliza para el entrenamiento OPD del estudiante. No se emplean preguntas reales de entrenamiento ni respuestas de referencia en ningun punto.

La receta de OPD declarada es: objetivo de KL inversa por token sobre los 16 tokens mas probables del estudiante, ponderada por las probabilidades renormalizadas del estudiante, sin recompensa de resultado; learning rate constante de 1e-6, optimizador AdamW, temperatura de rollout 1.0, pesos maestros en fp32 y computo en bf16.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, con cadenas de razonamiento largas (la evaluacion usa hasta 31.744 tokens nuevos).
- Resolucion de problemas de competicion: AIME, AMC, MATH500 y BRUMO25 aparecen en su evaluacion.
- Formato de respuesta controlado: el prompt de evaluacion pide la respuesta final en la forma `Answer: $Answer` y el resultado dentro de `\boxed{}`.
- Conversacion multi-turno mediante `apply_chat_template` con el tokenizador del modelo base.
- Integracion con el ecosistema transformers (AutoModelForCausalLM) y con text-generation-inference.
- Capacidad de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (mas alla del razonamiento matematico encadenado propio de la generacion).
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no disponibles; los benchmarks publicados estan en ingles.

## Casos de uso

- Resolucion de problemas de matematicas de nivel secundaria y competicion: el modelo esta entrenado y evaluado especificamente en AIME, AMC23, MATH500 y BRUMO25, por lo que se ajusta a tareas de calculo, algebra, geometria y razonamiento numerico con solucion verificable.
- Generacion de soluciones paso a paso con formato estructurado: el modelo produce cadenas de razonamiento extensas y coloca la respuesta final en `\boxed{}`, lo que facilita el parseo automatico en pipelines de evaluacion o correccion.
- Tutorizacion matematica automatizada: puede integrarse en un sistema conversacional que reciba un enunciado y devuelva el desarrollo completo, aprovechando el chat template del modelo base.
- Generacion de datos sinteticos de matematicas: dado que su entrenamiento se basa en datos sinteticos y el autor publica un banco de preguntas, el modelo puede usarse para producir problemas y soluciones candidatas que luego se filtren.
- Evaluacion comparativa de metodos de destilacion: sirve como referencia reproducible para medir el efecto de Ask to Distill + OPD frente al modelo base y al profesor.
- Investigacion en destilacion on-policy: el modelo documenta la receta completa (KL inversa sobre top-16 tokens, lr 1e-6, AdamW, fp32/bf16), lo que permite reproducir o variar el procedimiento.
- Despliegue en produccion sobre GPU de consumo: con ~7,6B de parametros y licencia MIT, puede alojarse en una sola GPU consumer cuantizado para tareas de razonamiento matematico con latencia moderada.
- Backend de servicio de inferencia: al ser compatible con text-generation-inference y endpoints compatibles, puede exponerse como API de generacion de texto sin adaptaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor (avg@16; en MATH500, avg@4; temperatura 0,7, top-p 0,95, maximo 31.744 tokens nuevos):

| Benchmark | Resultado |
|---|---|
| AIME24 | 57,5 |
| AIME25 | 44,8 |
| AIME26 | 52,5 |
| AMC23 | 89,2 |
| BRUMO25 | 53,3 |
| MATH500 | 89,9 |
| avg6 | 64,54 |

No se han publicado en la informacion disponible resultados comparativos de MMLU, HumanEval, GSM8K ni de otros benchmarks distintos de los anteriores, ni cifras del modelo base o del profesor bajo la misma configuracion.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: el repo ocupa 15,2 GB, por lo que se necesitan aproximadamente 16 GB de VRAM solo para los pesos (algo mas contando el contexto largo).
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con margen; RTX 3090/4080 (16-24 GB) para bf16 ajustado o 8 bits.
- Cabe en GPU consumer: si, en RTX 4090 y RTX 3090 en bf16 con contexto moderado, y en GPUs de 8-12 GB con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: transformers (AutoModelForCausalLM), text-generation-inference (el repo es compatible con endpoints), vLLM; llama.cpp y Ollama requeririan convertir los pesos a GGUF, ya que no se distribuye GGUF de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Nota: la configuracion de evaluacion usa hasta 31.744 tokens nuevos, lo que implica generaciones muy largas y, por tanto, latencias altas por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Math_DeepSeek-R1-Distill-Qwen-7B_Skywork-OR1-Math-7B | ~7,6B | no disponible | MIT | HuggingFace (safetensors) | avg6 64,54 en su set de seis benchmarks |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (base) | ~7,6B | no disponible en esta ficha | no disponible | HuggingFace | no disponible en la informacion proporcionada |
| Skywork/Skywork-OR1-Math-7B (profesor) | ~7,6B | no disponible en esta ficha | no disponible | HuggingFace | no disponible en la informacion proporcionada |
| Qwen2.5-Math-7B-Instruct | ~7,6B | no disponible en esta ficha | no disponible | HuggingFace | no disponible en la informacion proporcionada |

No se dispone de resultados de benchmarks de los modelos comparables bajo la misma configuracion de evaluacion, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo esta especializado en matemáticas; su utilidad fuera de ese dominio no esta documentada y probablemente sea inferior a la de un modelo de proposito general del mismo tamano.
- No se declaran idiomas soportados. Los benchmarks son en ingles y el prompt de evaluacion esta en ingles; el comportamiento en castellano no esta verificado.
- No se especifica la longitud de contexto real del modelo ni si se amplio respecto al base. Dado que las generaciones de evaluacion llegan a 31.744 tokens, la ventana efectiva debe comprobarse antes de usarlo en produccion.
- Riesgo de alucinacion en pasos intermedios: al tratarse de un modelo entrenado sin recompensa de resultado y sin respuestas de referencia, las cadenas de razonamiento pueden contener derivaciones incorrectas que lleguen a una respuesta final erronea.
- El entrenamiento se basa en datos sinteticos generados por un modelo; puede heredar sesgos y errores sistematicos del generador de preguntas y del profesor, sin que exista una validacion con problemas reales.
- Metricas de adopcion nulas en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validacion comunitaria independiente.
- La licencia MIT permite uso comercial, modificacion y redistribucion, pero no se ofrecen garantias de idoneidad ni de exactitud de las respuestas.
- El repositorio ocupa 15,2 GB, por lo que el almacenamiento y la transferencia no son triviales en entornos con disco o ancho de banda limitados.
- El modelo es una destilacion sobre otro modelo destilado; conviene revisar las condiciones del modelo base DeepSeek-R1-Distill-Qwen-7B y del profesor Skywork-OR1-Math-7B antes de un uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/gasolsun/Math_DeepSeek-R1-Distill-Qwen-7B_Skywork-OR1-Math-7B
- Dataset (banco de preguntas): https://huggingface.co/datasets/gasolsun/Math_DeepSeek-R1-Distill-Qwen-7B_Skywork-OR1-Math-7B
- Modelo base (estudiante): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Modelo profesor: https://huggingface.co/Skywork/Skywork-OR1-Math-7B
- Paper o blog de Ask to Distill: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
