# budget-internalization-iclr2027/nemotron3-nano-4b-8k-grpo-hardyman-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, publicado por la organizacion `budget-internalization-iclr2027` como artefacto de una submission anonima a ICLR 2027. El objetivo declarado es entrenar razonamiento matematico bajo un presupuesto de generacion fijo de 8.192 tokens, de modo que el modelo aprenda a internalizar dicho presupuesto en lugar de agotarlo. El checkpoint publicado corresponde al paso 300 del run apodado `hardyman`.

Tecnicamente es un transformer causal de 3.973.556.832 parametros (aproximadamente 3,97 mil millones), etiquetado con la arquitectura `nemotron_h` y pesos en F32 almacenados en safetensors (15,9 GB de repositorio). Se distribuye con `custom_code`, por lo que requiere `trust_remote_code=True` tanto en transformers como en vLLM. El pipeline es `text-generation` y la licencia heredada es la NVIDIA Nemotron Open Model License.

Su relevancia es doble: por un lado, es un ejemplo reproducible de RL con GRPO aplicado a un modelo pequeno (menos de 4B) para matematicas; por otro, introduce la variable del presupuesto de tokens como parte del problema de entrenamiento, un eje poco explorado en la literatura de razonamiento y directamente relacionado con el coste de inferencia en produccion. El modelo tiene 0 descargas y 1 like en el momento de redactar esta ficha, por lo que se trata de un artefacto de investigacion, no de un modelo con validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (segun tag del repositorio); detalles de composicion no disponibles |
| Parametros totales | 3.973.556.832 (3,97B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (el valor 8.192 se refiere a `max_new_tokens` de generacion durante el entrenamiento, no a la ventana de contexto) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en F32 |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Nemotron Open Model License (`license: other`, heredada del modelo base) |
| Formato de pesos | safetensors (F32), con `custom_code` |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` y se etiqueta con la arquitectura `nemotron_h`. No se detalla en la informacion proporcionada la composicion interna de bloques (atencion, capas recurrentes/SSM, hibridacion), el numero de capas, las dimensiones ocultas ni el contexto nativo del modelo base. El unico dato estructural duro es el recuento de parametros de los pesos safetensors: 3.973.556.832.

El entrenamiento es un ajuste fino con GRPO (leave-one-out baseline, normalizacion de recompensa por grupo y perdida a nivel de token) sobre el dataset `agentica-org/DeepScaleR-Preview-Dataset`, con un maximo de 3 epocas. La configuracion declarada es: lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de warmup y un total de 300 pasos. La recompensa es binaria por correccion de la respuesta, extraida del contenido dentro de etiquetas `\boxed{}`.

La innovacion metodologica esta en el presupuesto de generacion: `max_new_tokens` se fija en 8.192 y las respuestas que alcanzan ese limite se truncan y se puntuan tal cual, sin penalizacion adicional explicita. Esto convierte el presupuesto en parte de la senal de entrenamiento y no en un simple parametro de inferencia. El prompt de entrenamiento usa el turno de usuario `Think step-by-step to solve the following problem. Output your answer inside of \\boxed{} tags.: {problem}\n\nLet's think step-by-step`, renderizado con la plantilla de chat del modelo base. Los pesos finales se guardan en F32.

## Capacidades

- Generacion de texto conversacional y de razonamiento paso a paso (el prompt de entrenamiento fuerza cadenas de razonamiento explicitas).
- Razonamiento matematico orientado a problemas tipo competicion del dataset DeepScaleR, con formato de respuesta forzado en `\boxed{}`.
- Modo de respuesta larga: entrenado especificamente para operar con presupuestos de generacion de hasta 8.192 tokens.
- Ajuste fino por RL (GRPO) sobre el modelo base, lo que en principio preserva las capacidades generales heredadas de `NVIDIA-Nemotron-3-Nano-4B-BF16`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso fuera del esquema de cadena de pensamiento: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode explicito con tokens de control): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de datos sinteticos de matematicas: el modelo produce soluciones con razonamiento completo y respuesta final en `\boxed{}`, un formato facilmente parseable para construir datasets de entrenamiento o de evaluacion con verificacion automatica por comparacion de la respuesta extraida.
- Evaluacion de investigacion sobre presupuestos de tokens: sirve como punto de comparacion controlado (mismo base model, mismo algoritmo, distinto presupuesto o distinto checkpoint) para estudiar como el modelo internaliza un limite de generacion de 8.192 tokens.
- Tutoria matematica con explicacion paso a paso: el prompt de entrenamiento induce cadenas de razonamiento detalladas, utiles para generar explicaciones didacticas de problemas de nivel preuniversitario.
- Baseline de razonamiento en pipelines academicos: por su tamano (3,97B) es viable ejecutarlo en una GPU de investigacion junto a otros modelos para comparar tasas de acierto en tareas de matematicas con recompensa binaria.
- Verificacion y reranking de soluciones: dado un problema, generar una solucion candidata y contrastarla con las de otros modelos o con un verificador externo, aprovechando el formato de respuesta delimitado.
- Prototipado local de asistentes de resolucion de problemas: con pesos en F32 o BF16 cabe en GPUs de gama alta de consumo, lo que permite iterar sin depender de APIs externas.
- Servicio de inferencia sencillo con vLLM: el propio autor documenta el comando `vllm serve ... --trust-remote-code`, de modo que puede desplegarse como endpoint compatible con la API de OpenAI para pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas de MMLU, GSM8K, MATH, AIME, HumanEval ni ninguna otra metrica, ni cifras de acierto del checkpoint en el paso 300. Tampoco se aportan curvas de recompensa durante el entrenamiento ni comparaciones con el modelo base. Los resultados de busqueda web recibidos no contienen informacion relevante sobre este modelo (corresponden a servicios de alquiler de vehiculos y al presupuesto del Estado frances), por lo que no se puede completar esta seccion.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (3.973.556.832); no estan confirmadas por el autor.

- Pesos en F32 (formato publicado): aproximadamente 15,9 GB solo de pesos, mas cache KV. Requiere GPU con 24 GB o mas (RTX 4090, A100 40 GB, L40S, H100) y algo de margen para el contexto.
- Pesos en BF16/FP16 (conversion manual): aproximadamente 7,9 GB. Cabe en RTX 3090/4090 (24 GB), RTX 4080 (16 GB) y A10G (24 GB) con holgura.
- Pesos en INT8: aproximadamente 4 GB; viable en RTX 3060 12 GB o RTX 4070.
- Pesos en INT4: aproximadamente 2,5 GB; viable en GPUs de 8 GB, aunque no se publican variantes GGUF y la cuantizacion requeriria conversion manual.
- Cache KV: no se puede estimar con precision porque la longitud de contexto del modelo base no esta disponible en la informacion proporcionada.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en F32 o BF16; en GPUs de 8-12 GB solo tras cuantizar.
- Opciones de despliegue: `transformers` (documentado por el autor con `trust_remote_code=True` y `device_map="auto"`) y vLLM (documentado por el autor). No hay evidencia de soporte en llama.cpp, Ollama, TGI o SGLang, y la presencia de `custom_code` complica su integracion en runtimes que no permitan codigo remoto.
- Latencia y throughput: no disponibles. Dependeran del hardware, de la cuantizacion y, sobre todo, de la longitud de generacion, ya que el modelo esta entrenado para producir respuestas de hasta 8.192 tokens.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La unica comparacion que puede establecerse con datos verificables es contra el modelo del que deriva, y la unica diferencia documentada es el post-entrenamiento con GRPO (no hay cifras de rendimiento para ninguno de los dos):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `budget-internalization-iclr2027/nemotron3-nano-4b-8k-grpo-hardyman-s300` | 3,97B | No disponible | NVIDIA Nemotron Open Model License | HuggingFace, 0 descargas, 1 like |
| `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` (base) | No disponible en la informacion proporcionada | No disponible | NVIDIA Nemotron Open Model License | HuggingFace (referenciado como base) |
| Alternativas de la misma categoria (por ejemplo, modelos de razonamiento matematico de 1,5B-7B) | No disponible | No disponible | No disponible | No disponible |

Candidatos plausibles de comparacion serian otros modelos pequenos ajustados para matematicas, pero no se han proporcionado datos de parametros, contexto, rendimiento ni licencia para ninguno de ellos en la informacion disponible, por lo que no se incluyen filas con valores no verificados.

## Limitaciones y advertencias

- Artefacto de investigacion: 0 descargas y 1 like; no hay validacion independiente ni resultados de benchmarks publicos.
- Sesgos conocidos: no disponibles; al derivar del modelo base de NVIDIA, hereda los sesgos de su dataset de preentrenamiento, que no se documenta aqui.
- Riesgo de alucinacion: no cuantificado. El entrenamiento con recompensa binaria sobre respuestas matematicas puede favorecer cadenas de razonamiento que "suenan" correctas pero contienen pasos invalidos, ya que solo se supervisa la respuesta final extraida de `\boxed{}`.
- Truncamiento: las respuestas que alcanzan el presupuesto de 8.192 tokens se truncan y se puntuan tal cual durante el entrenamiento, lo que puede producir salidas cortadas sin respuesta final en problemas largos.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no se especifican; el prompt de entrenamiento esta en ingles y la tarea objetivo es matematica, por lo que el rendimiento fuera de ese dominio es incierto.
- Licencia: NVIDIA Nemotron Open Model License (`license: other`). Es una licencia propia, no una licencia open source estandar; debe revisarse el texto completo antes de cualquier uso comercial, y las condiciones se heredan del modelo base.
- Dependencia de codigo remoto: el repositorio usa `custom_code`, por lo que requiere `trust_remote_code=True`. Esto implica ejecutar codigo del autor del repositorio y puede ser un bloqueo de seguridad en entornos corporativos o en runtimes gestionados.
- Formato de pesos: solo F32 en safetensors, lo que duplica aproximadamente el uso de memoria respecto a BF16 y encarece el despliegue si no se convierte.
- Reproducibilidad: se indica el paso 300 y el apodo del run (`hardyman`), pero no se publican curvas de entrenamiento, semillas ni scripts, lo que limita la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-8k-grpo-hardyman-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper, repositorio de codigo y demos: no disponibles en la informacion proporcionada (la submission a ICLR 2027 se describe como anonima).
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con este modelo.
