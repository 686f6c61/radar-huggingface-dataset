# budget-internalization-iclr2027/qwen3.5-4b-8k-dapo-bosstroll-s300

## Resumen

`qwen3.5-4b-8k-dapo-bosstroll-s300` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, publicado por el usuario `budget-internalization-iclr2027` como parte de una submission anónima a ICLR 2027. El objetivo declarado del entrenamiento es que el modelo interne un presupuesto de generación de 8.192 tokens (`max_new_tokens`) al resolver problemas de razonamiento matemático, es decir, que module la longitud de su cadena de pensamiento para no agotar el presupuesto disponible. El checkpoint corresponde al paso 300 de un entrenamiento con DAPO sobre el dataset DeepScaleR.

Técnicamente se trata de un transformer denso de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) con pesos en BF16, derivado por fine-tuning del Qwen3.5-4B y distribuido en formato safetensors a través de la librería `transformers`. La model card está etiquetada con el pipeline `image-text-to-text` y los tags `qwen3_5` e `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card del ajuste solo documenta el entrenamiento de razonamiento matemático.

Su relevancia es doble: por un lado, es un ejemplo reproducible de cómo aplicar DAPO (una variante de GRPO con clip-higher y muestreo dinámico) a un modelo pequeño para razonamiento matemático; por otro, aborda el problema práctico de la internalización de presupuestos de cómputo, un área activa de investigación en modelos de razonamiento. El repositorio no tiene descargas ni interacciones registradas y no incluye resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del base Qwen/Qwen3.5-4B); detalles completos no disponibles |
| Parametros totales | 4.539.265.536 (aprox. 4,54 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible. El valor 8.192 se refiere al presupuesto de generacion (`max_new_tokens`), no a la ventana de contexto |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | Safetensors (BF16), libreria `transformers`; tamano del repo 9,1 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-4B (relacion: finetune) |
| Dataset de entrenamiento | agentica-org/DeepScaleR-Preview-Dataset (matematicas) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por aprendizaje por refuerzo del Qwen/Qwen3.5-4B. El algoritmo empleado es DAPO, con clip-higher (rango de clipping 0,2 / 0,28), muestreo dinamico (los grupos de prompts con recompensas identicas se descartan y se vuelven a muestrear), perdida a nivel de token, penalizacion suave por sobrelongitud (hasta -1) aplicada sobre los ultimos 1.024 tokens antes de agotar el presupuesto, recompensas escaladas a [-1, 1] y sin baseline leave-one-out. La recompensa es binaria y se calcula por correccion de la respuesta extraida de las etiquetas `\boxed{}`.

La configuracion concreta del run, apodado `bosstroll`, es: presupuesto de generacion de 8.192 tokens, dataset DeepScaleR (matematicas) con un maximo de 3 epochs, batch de 32 prompts por 8 rollouts por paso, optimizador Adam con schedule coseno y LR pico de 5e-7, 10 pasos de warmup y 300 pasos totales. Los pesos se guardan en BF16. El prompt de entrenamiento usa el chat template del modelo base con la instruccion "Think step-by-step to solve the following problem. Output your answer inside of `\boxed{}` tags.: {problem}\n\nLet's think step-by-step". No se documenta ninguna innovacion arquitectonica propia: la novedad del trabajo esta en el regimen de entrenamiento (internalizacion del presupuesto de tokens), no en la topologia del modelo.

## Capacidades

- Razonamiento matematico: entrenado explicitamente para resolver problemas de matematicas con respuesta final delimitada en `\boxed{}`, con un presupuesto de generacion de 8.192 tokens.
- Generacion de cadenas de razonamiento largas: el modelo fue optimizado para producir razonamiento paso a paso ("think step-by-step") ajustando su longitud al presupuesto disponible.
- Razonamiento bajo restriccion de presupuesto: la hipotesis del trabajo es que el modelo internaliza el limite de 8.192 tokens, de modo que deberia gestionar mejor los escenarios con limite estricto de tokens de salida.
- Capacidades heredadas del modelo base: no documentadas para este checkpoint en la model card; el pipeline declarado (`image-text-to-text`) y los tags (`qwen3_5`) apuntan a posible soporte multimodal, pero no se detalla su estado tras el fine-tuning.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado, aunque el formato de razonamiento paso a paso es compatible con flujos multi-paso.
- Capacidades multilingues: no disponible; el entrenamiento de RL se realizo sobre un dataset de matematicas y el prompt esta en ingles.

## Casos de uso

- Resolucion de problemas matematicos por lotes: se puede desplegar con vLLM para procesar grandes volumenes de enunciados de competicion o de nivel universitario, forzando la extraccion de la respuesta mediante el patron `\boxed{}` que el modelo aprendio a emitir durante el entrenamiento.
- Generacion de datasets de razonamiento (destilacion): al producir cadenas de pensamiento largas y verificables con respuesta final, es util para generar trazas de razonamiento que sirvan como datos de entrenamiento o evaluacion de modelos mayores.
- Tutorizacion matematica asistida: el modelo puede desglosar la resolucion de un problema paso a paso, con pasos intermedios explicitos, aprovechando que fue entrenado con ese formato de prompt.
- Investigacion sobre eficiencia de razonamiento: sirve como punto de comparacion frente a su modelo base para medir el efecto de DAPO y de la internalizacion del presupuesto de tokens en la longitud y calidad de las cadenas de pensamiento.
- Verificacion y autocomprobacion de soluciones: en pipelines de validacion de respuestas matematicas, el modelo puede rehacer un problema y comparar su resultado con el de otro sistema, explotando la reproducibilidad del formato de salida.
- Prototipado en hardware de gama de consumo: con unos 4,54 mil millones de parametros, puede ejecutarse en una unica GPU de 24 GB, lo que permite experimentar con RL y razonamiento en presupuestos de investigacion reducidos.
- Evaluacion academica de tecnicas de RL: al estar publicado junto a una submission a ICLR 2027, es un artefacto util para reproducir y auditar los resultados de DAPO en modelos de escala media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (ni MMLU, ni GSM8K, ni MATH, ni AIME, ni HumanEval) y los resultados de busqueda web no contienen informacion sobre el modelo. No se deben extrapolar cifras a partir del modelo base sin verificarlas.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 9-10 GB solo para los pesos (el repositorio ocupa 9,1 GB), mas el consumo de la cache KV, que depende de la longitud de contexto efectiva (no disponible) y del tamano de lote.
- Estimacion orientativa en BF16 con contexto moderado y lote pequeno: en torno a 12-16 GB de VRAM. Cifra estimada, no publicada por el autor.
- Cuantizacion a 8 bits: reduciria los pesos a aproximadamente 5 GB; a 4 bits, a unos 2,5-3 GB. El repositorio no publica versiones cuantizadas, por lo que habria que generarlas.
- GPU recomendadas: cabe en GPU de consumo como RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantizacion, y en RTX 5090. Para BF16 con lotes grandes o contextos largos son preferibles A100 40/80 GB, H100 o L40S.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 16 GB o mas, especialmente si se cuantiza. En tarjetas de 12 GB requeriria cuantizacion agresiva.
- Opciones de despliegue: `transformers` (con `AutoModelForCausalLM` y `device_map="auto"`), vLLM (`vllm serve`, mencionado explicitamente en la model card) y TGI. Para llama.cpp u Ollama no hay pesos GGUF publicados, pero seria tecnicamente posible convertir el checkpoint.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-8k-dapo-bosstroll-s300 | 4,54 mil millones | No disponible (presupuesto de generacion de 8.192 tokens) | DAPO/RL sobre DeepScaleR | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | 4,54 mil millones (el ajuste hereda el tamano) | No disponible en la informacion proporcionada | Preentrenamiento y postentrenamiento no disponibles | Apache 2.0 | HuggingFace |
| Otros modelos de razonamiento de ~4B (por ejemplo, variantes thinking de la familia Qwen3) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de este checkpoint ni de mediciones comparativas con alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: es imposible conocer su rendimiento real en matematicas o en cualquier otra tarea sin evaluarlo uno mismo.
- Riesgo de alucinacion: es un modelo de razonamiento matematico de 4,54 mil millones de parametros; puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en problemas fuera de la distribucion de DeepScaleR.
- Entrenamiento limitado a matematicas: el RL se realizo unicamente con recompensa de correccion de respuesta matematica (DeepScaleR), lo que puede degradar capacidades generales o de instruccion no matematicas respecto al modelo base.
- Especializacion de formato: el modelo espera el prompt concreto empleado en entrenamiento ("Think step-by-step to solve the following problem. Output your answer inside of `\boxed{}` tags."). Otros formatos de prompt pueden dar resultados peores.
- Presupuesto de 8.192 tokens: el entrenamiento se diseno alrededor de ese limite. Generar por encima o muy por debajo de ese presupuesto puede alterar el comportamiento esperado.
- Idiomas no documentados: no hay garantia de calidad en castellano ni en idiomas distintos del ingles.
- Procedencia anonima: la publicacion corresponde a una submission anonima a ICLR 2027, por lo que no hay autores identificables, ni paper enlazado, ni proceso de revision visible. Tratar con cautela en produccion.
- Trazabilidad de la licencia: la model card indica que hereda la licencia del modelo base (Apache 2.0), pero conviene verificar los terminos de Qwen/Qwen3.5-4B, ya que algunos modelos Qwen tienen condiciones adicionales.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Pesos solo en BF16: no hay cuantizaciones oficiales publicadas, por lo que el despliegue en hardware limitado requiere trabajo adicional.

## Enlaces

- HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-dapo-bosstroll-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper o blog del metodo DAPO: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
