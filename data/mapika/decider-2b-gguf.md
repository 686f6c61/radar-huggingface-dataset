# Mapika/decider-2b-GGUF

## Resumen

decider-2b-GGUF es la distribucion en formato GGUF de decider-2b v12, un modelo de decision desarrollado por Mapika que no genera texto libre: recibe un estado (texto de entrada) y una o varias preguntas con listas explicitas de opciones, y devuelve una probabilidad calibrada para cada opcion en un unico forward pass. Esta orientado a clasificacion estructurada y enrutamiento, no a conversacion. La version GGUF esta pensada para ejecutarse con llama.cpp (incluido llama-cpp-python) y es compatible con la libreria decider-ai a partir de la version 1.6.0.

El modelo base es Qwen/Qwen3.5-2B-Base, con 1.881.825.088 parametros totales (aproximadamente 1,88 mil millones) y licencia Apache 2.0. El repositorio incluye tres cuantizaciones (Q4_K_M, Q8_0 y BF16), el tokenizador, el fichero de temperaturas `decider_config.json` y el script de lectura `decide_gguf.py`. La model card advierte explicitamente de que cargar estos ficheros en `llama-cli`, `llama-server`, Ollama o LM Studio produce un modelo de continuacion de texto cuyo texto generado no es la respuesta: la respuesta se lee de los logits de los tokens de letra de opcion en cada slot de respuesta.

La relevancia actual del modelo reside en su enfoque: sustituye la generacion autoregresiva por una lectura calibrada de logits con temperaturas ajustadas por tipo de pregunta, lo que permite obtener probabilidades estables y comparables en tareas de decision. Los datos medidos por el autor muestran que la cuantizacion Q8_0 reproduce practicamente el comportamiento de los pesos bf16 en PyTorch, mientras que Q4_K_M pierde entre 0,3 y 0,4 puntos de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B-Base); sin pesos de multi-token prediction (MTP) en el checkpoint |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card menciona estados de decenas de miles de tokens, sin cifra oficial) |
| Tipos de cuantizacion | Q4_K_M (1,3 GB), Q8_0 (2,0 GB), BF16 (3,8 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF; pesos originales en PyTorch (safetensors) en Mapika/decider-2b |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen/Qwen3.5-2B-Base, adaptado por Mapika para una tarea de decision con opciones explicitas. En lugar de generar texto, el modelo puntua los tokens correspondientes a las letras de cada opcion en slots de respuesta predefinidos por `decider.prompt`, y esas puntuaciones se dividen por una temperatura ajustada por tipo de pregunta (por ejemplo, 2,465 para preguntas de tipo Choice y 0,05 para respuestas si/no de tipo Noul). El checkpoint no contiene pesos de multi-token prediction, aunque su configuracion declara una capa MTP; por eso la conversion a GGUF requiere el flag `--no-mtp`, ya que sin el se genera un fichero que llama.cpp no puede cargar.

La conversion se realizo con llama.cpp en el commit `c9064dded` (27 de septiembre de 2026) mediante `convert_hf_to_gguf.py --no-mtp --outtype bf16` y posterior `llama-quantize` a Q8_0 y Q4_K_M. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO; remite a la ficha del modelo base Mapika/decider-2b para esa informacion. La innovacion tecnica principal es el esquema de lectura calibrada de logits con temperaturas por tipo de pregunta, que produce probabilidades calibradas (ECE en torno a 0,05 en tareas in-task) en un solo paso.

## Capacidades

- Decision con opciones explicitas: devuelve una probabilidad para cada opcion de una lista cerrada a partir de un estado de entrada.
- Preguntas multiples por inferencia: `decide()` acepta varias preguntas, cada una con su propia lista de opciones, en una sola llamada.
- Preguntas si/no: soportadas mediante `system_one` con score y respuestas yes/no (requiere decider-ai 1.6.0 o superior).
- Probabilidades calibradas: temperaturas ajustadas por tipo de pregunta (Choice 2,465; Noul 0,05) para obtener puntuaciones comparables.
- Clasificacion de texto estructurada: pipeline declarado `text-classification`.
- Entrada de imagen: no soportada en los ficheros GGUF; requiere los pesos PyTorch de Mapika/decider-2b y decider-ai 1.10.0.
- Generacion de texto libre: no es una capacidad del modelo; la salida textual de llama.cpp no constituye la respuesta.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa.
- Capacidades multilingues: limitadas al ingles.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar un mensaje de cliente en departamentos (billing, technical, sales) con probabilidades calibradas, lo que permite aplicar umbrales de confianza y derivar a revision humana los casos ambiguos.
- Triaje de urgencia: asignar niveles de urgencia (low, medium, high) a incidencias en una sola pasada, con la ventaja de que el modelo devuelve distribuciones de probabilidad en lugar de una etiqueta unica.
- Moderacion y etiquetado de contenido: decidir si un texto cumple una politica concreta mediante preguntas si/no, usando la temperatura Noul para respuestas binarias estables.
- Clasificacion documental por lotes: procesar grandes volumenes de documentos con Q4_K_M en CPU (1,3 GB) cuando el coste por inferencia es prioritario y se tolera una perdida de 0,3-0,4 puntos de precision.
- Extraccion de decisiones en pipelines de datos: integrar `decide_gguf.py` o `Decider` en un pipeline de Python para anotar registros con multiples preguntas simultaneas, aprovechando la lectura en un unico forward pass.
- Evaluacion de calidad con probabilidades: usar las puntuaciones calibradas como senal de confianza en sistemas de control de calidad o de enrutamiento condicional, en lugar de umbrales sobre texto generado.
- Despliegue local en hardware modesto: ejecutar el modelo en portatiles o servidores sin GPU mediante llama-cpp-python con `n_gpu_layers=0`, gracias al tamano reducido de las cuantizaciones.

## Benchmarks y rendimiento

Datos medidos por el autor sobre el conjunto de regresion de la ficha de decider-2b (95 tareas, 144.226 preguntas, 67 tareas in-task y 28 held-out) a temperatura Choice 2,465, leidos mediante llama.cpp (build CUDA, un prompt por decode) y comparados fila a fila con los pesos bf16 en PyTorch. La precision, NLL y ECE son medias sobre tareas.

| Modelo / formato | In-task acc / NLL / ECE | Held-out acc / NLL / ECE | Misma respuesta que bf16 PyTorch |
|---|---|---|---|
| Pesos bf16, PyTorch | 0,7906 / 0,5205 / 0,0532 | 0,7478 / 0,6440 / 0,0902 | - |
| Q8_0 | 0,7912 / 0,5205 / 0,0530 | 0,7481 / 0,6440 / 0,0915 | 99,22% |
| Q4_K_M | 0,7873 / 0,5304 / 0,0549 | 0,7442 / 0,6522 / 0,0907 | 95,08% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El GGUF BF16 no fue evaluado sobre este conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M requiere aproximadamente 1,3 GB de pesos mas overhead de contexto y KV cache; Q8_0, unos 2,0 GB; BF16, unos 3,8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M y Q8_0; el autor solo ha validado el conjunto de regresion con el build CUDA.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; tambien en Apple Silicon con build Metal (`-DGGML_METAL=on`).
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-cpp-python con decider-ai 1.6.0 o superior, y el script `decide_gguf.py` con decider-ai 1.5.0. El servidor HTTP no sirve ficheros GGUF.
- Latencia y throughput: no disponible. El autor recomienda puntuar un prompt por `llama_decode`; agrupar varios prompts en un mismo decode (como secuencias separadas) altera las probabilidades hasta 0,02 en BF16 y 0,16 en Q4_K_M en la version anterior del modelo.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (modelos de decision con lectura calibrada de logits y opciones explicitas). Como referencia del modelo base:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-2b-GGUF (v12) | 1,88 mil millones | no disponible | Decision con opciones, lectura de logits calibrada | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-2B-Base | no disponible en la informacion | no disponible | Modelo base de lenguaje | no disponible en la informacion | Hugging Face |
| Mapika/decider-2b (pesos PyTorch) | no disponible en la informacion | no disponible | Version original, incluye entrada de imagen con decider-ai 1.10.0 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de chat: cargarlo en `llama-cli`, `llama-server`, Ollama o LM Studio produce texto de continuacion que no es la respuesta del modelo; la respuesta se obtiene leyendo logits con `decider.prompt` y las temperaturas ajustadas.
- Solo ingles: el unico idioma declarado es `en`.
- Entrada de imagen no disponible en GGUF: requiere pesos PyTorch y decider-ai 1.10.0.
- Sensibilidad a la cuantizacion en estados largos: los estados de decenas de miles de tokens se degradan mas con Q4_K_M de lo que refleja la tabla de regresion (medido en v11).
- Sensibilidad al batching: varios prompts en un mismo `llama_decode` alteran las probabilidades; se debe puntuar un prompt por decode para obtener resultados reproducibles.
- Diferencias entre builds: los builds de CPU y GPU producen probabilidades ligeramente distintas sobre el mismo fichero; solo el build CUDA fue validado sobre el conjunto de regresion.
- Riesgo de alucinacion: no aplica en el sentido habitual porque no genera texto, pero las probabilidades pueden estar mal calibradas en dominios alejados del conjunto de entrenamiento.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al derivar de Qwen3.5-2B-Base, puede heredar sesgos del corpus de entrenamiento del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la model card remite a la ficha de decider-2b para las condiciones de las fuentes de entrenamiento.
- El flag `--no-mtp` es obligatorio en la conversion: sin el, llama.cpp no puede cargar el fichero resultante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mapika/decider-2b-GGUF
- Modelo base (pesos PyTorch): https://huggingface.co/Mapika/decider-2b
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Libreria decider-ai: no disponible (referenciada en la model card como paquete pip `decider-ai`)
- llama.cpp: no disponible (referenciado en la model card, commit `c9064dded`)
- llama-cpp-python: no disponible (referenciado en la model card, version 0.3.35 o superior)
