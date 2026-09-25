# budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-reasoninggym-coolbengal-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, realizado con el algoritmo GRPO sobre tareas de Reasoning Gym bajo un presupuesto de generacion de 2.048 tokens. Lo publica el usuario anonimo budget-internalization-iclr2027 como parte de una submission anonima a ICLR 2027, con el nombre en clave de ejecucion "coolbengal" y en el checkpoint correspondiente al paso 300. Su proposito declarado es estudiar la internalizacion del presupuesto de tokens: los razonamientos que agotan el limite de 2.048 tokens reciben recompensa cero, lo que empuja al modelo a resolver los problemas dentro de esa restriccion.

El modelo parte de la arquitectura Nemotron-H (tag `nemotron_h`) y cuenta con 3.973.556.832 parametros en total (unos 3,97 mil millones), almacenados en el repositorio en precision F32, con un tamano de repo de 15,9 GB. El foco es el razonamiento procedimental con respuestas verificables: los prompts son tareas de Reasoning Gym y la recompensa se calcula con un verificador sobre la respuesta final marcada con `\boxed{}`.

Es relevante ahora porque aborda un problema practico de los modelos de razonamiento: el coste en tokens de la cadena de pensamiento. Al entrenar con recompensa que penaliza el agotamiento del presupuesto, se busca un modelo que razone de forma mas eficiente en longitud. Es un artefacto de investigacion, con cero descargas y cero "likes" en el momento de redactar esta ficha, y hereda la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (tag `nemotron_h`; familia hibrida de NVIDIA) |
| Parametros totales | 3.973.556.832 (~3,97 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | pesos en F32 en el repositorio; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (etiquetada como `other`) |
| Formato de pesos | safetensors (precision F32) |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 |
| Relacion con el base | finetune |
| Libreria | transformers (requiere `trust_remote_code=True`) |
| Tamano del repositorio | 15,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 y se ajusta mediante GRPO (Group Relative Policy Optimization). La configuracion de entrenamiento declarada incluye baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de generacion reciben recompensa cero, lo que introduce una penalizacion explicita por agotar el limite de tokens. El batch es de 32 prompts por 8 rollouts por paso, con optimizador Adam, schedule de learning rate coseno, learning rate pico de 2e-6 y 10 pasos de warmup, durante un total de 300 pasos. El numero maximo de epocas sobre los datos es 3.

Los datos de entrenamiento son tareas generadas proceduralmente de Reasoning Gym, con respuestas en formato `\boxed{}`. La recompensa se calcula con el verificador de tareas de Reasoning Gym sobre esa respuesta final. Los prompts se renderizan con la plantilla de chat del modelo base. El presupuesto de generacion (`max_new_tokens`) es de 2.048 tokens. Los pesos se publican en F32. No se detalla en la informacion proporcionada la composicion exacta del dataset, el numero total de tokens de entrenamiento consumidos, ni innovaciones de arquitectura propias mas alla del ajuste por RL; los detalles de la arquitectura interna del base (numero de capas, atencion, componentes Mamba) no estan disponibles en la informacion facilitada.

## Capacidades

- Generacion de texto con foco en razonamiento procedimental, tras el ajuste por RL sobre tareas de Reasoning Gym.
- Razonamiento paso a paso dentro de un presupuesto de 2.048 tokens de generacion.
- Resolucion de problemas con respuesta verificable en formato `\boxed{}`.
- Conversacional: la model card lo etiqueta como `conversational` y usa la plantilla de chat del modelo base.
- Capacidad de ejecucion con `trust_remote_code` para cargar el codigo personalizado de la arquitectura.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible (solo se documenta el ajuste sobre Reasoning Gym).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo "thinking" explicito): no disponibles.

## Casos de uso

- Evaluacion de eficiencia de razonamiento: sirve como punto de comparacion para medir cuanto reduce un RL con penalizacion de presupuesto la longitud de las cadenas de razonamiento frente al modelo base.
- Investigacion en RL aplicado a LLM: reproduce o audita un experimento GRPO con verificador sobre tareas generadas proceduralmente y baseline leave-one-out.
- Verificacion de respuestas matematicas y logicas: dado que el entrenamiento usa respuestas `\boxed{}` verificadas, es adecuado para tareas donde la respuesta final es comprobable automaticamente.
- Generacion de datos sinteticos de razonamiento: puede emplearse para producir soluciones de problemas procedimentales dentro de un limite de tokens controlado.
- Prototipado de pipelines de razonamiento con coste acotado: el presupuesto fijo de 2.048 tokens permite estimar de antemano el coste maximo de generacion por consulta.
- Punto de partida para nuevos ajustes: al ser un finetune del Nemotron-3-Nano-4B, puede servir de base para otros RL o SFT orientados a dominios especificos.
- Estudio de la internalizacion de restricciones: util para analizar como un modelo aprende a operar bajo una limitacion impuesta durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K u otras metricas, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: en F32, los pesos ocupan aproximadamente 15,9 GB. En BF16 serian unos 8 GB, en cuantizacion de 8 bits unos 4 GB y en 4 bits unos 2,5 GB, aunque el repositorio solo distribuye pesos en F32.
- GPU recomendadas: una GPU con 24 GB o mas (RTX 3090, RTX 4090, A5000) permite cargar los pesos en F32 o transformarlos a BF16. Para produccion con mas paralelismo, A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con al menos 16-24 GB de VRAM para el formato F32, o en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (con `trust_remote_code=True`) y vLLM, segun indica la model card. Otras opciones como llama.cpp, Ollama o TGI no estan confirmadas para esta arquitectura.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nemotron3-nano-4b-2k-grpo-reasoninggym-coolbengal-s300 | 3,97 mil millones | no disponible | nvidia-nemotron-open-model-license | HuggingFace (0 descargas) |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (base) | ~4 mil millones | no disponible | nvidia-nemotron-open-model-license | HuggingFace |
| Otros modelos de razonamiento de ~4B | no disponible | no disponible | no disponible | no disponible |

Los datos de rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada, por lo que no es posible establecer una comparacion numerica.

## Limitaciones y advertencias

- Artefacto de investigacion: se publica como parte de una submission anonima a ICLR 2027, con 0 descargas y sin validacion externa conocida.
- Rendimiento fuera de distribucion incierto: el ajuste se realiza solo sobre tareas de Reasoning Gym, por lo que el comportamiento en dominios generales puede degradarse respecto al modelo base.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgos.
- Riesgo de alucinacion: no evaluado; al ser un modelo de razonamiento con respuestas verificables en entrenamiento, puede generar cadenas de razonamiento plausibles pero incorrectas en tareas fuera de su distribucion.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles.
- Restricciones de licencia: hereda la nvidia-nemotron-open-model-license del modelo base; es una licencia "other" que conviene revisar antes de cualquier uso comercial, ya que puede incluir condiciones especificas de NVIDIA.
- Requiere `trust_remote_code=True` para cargar el codigo personalizado de la arquitectura, lo que implica ejecutar codigo del repositorio.
- El presupuesto de 2.048 tokens es una restriccion de entrenamiento; no se garantiza que el modelo respete ese limite en inferencia salvo que se configure explicitamente.
- Pesos en F32: mayor coste de VRAM y de almacenamiento (15,9 GB) que un equivalente en BF16.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-reasoninggym-coolbengal-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper, repositorio o demo adicionales: no disponibles en la informacion proporcionada (los resultados de la busqueda web no contienen fuentes relevantes sobre el modelo).
