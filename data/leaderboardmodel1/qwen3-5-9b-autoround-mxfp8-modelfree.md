# LeaderboardModel1/Qwen3.5-9B-AutoRound-MXFP8-ModelFree

## Resumen

Qwen3.5-9B-AutoRound-MXFP8-ModelFree es una cuantizacion MXFP8 del modelo Qwen/Qwen3.5-9B, generada automaticamente mediante la herramienta agent_optimize de Intel. El modelo forma parte de la iniciativa Low-Bit Open LLM Leaderboard, cuyo objetivo es evaluar y promover cuantizaciones de baja precision para modelos de lenguaje de gran tamano. Esta ficha describe una variante cuantizada que reduce el uso de memoria y acelera la inferencia, manteniendo un rendimiento cercano al modelo original en tareas de razonamiento, conocimiento general y matematicas.

La cuantizacion MXFP8 (Microscaling Floating Point 8) es un esquema de formato numerico que agrupa pesos en bloques y aplica un factor de escala compartido, lo que permite representar valores con mayor precision relativa que un FP8 convencional. El modelo resultante tiene 9.653.104.368 parametros y un tamano de repositorio de 12,4 GB, lo que lo hace viable para despliegue en GPUs de consumo con 16 GB de VRAM o mas. La licencia no esta especificada en la ficha, aunque se remite a la licencia del modelo base Qwen3.5-9B.

La relevancia de este modelo radica en su doble vertiente: por un lado, demuestra la viabilidad practica de la cuantizacion MXFP8 aplicada a una arquitectura moderna de 9B parametros; por otro, sirve como referencia dentro del leaderboard de Intel para comparar el impacto de diferentes esquemas de cuantizacion en el rendimiento real. Los resultados de evaluacion incluidos en la ficha cubren tareas estandar como GSM8K, HellaSwag, PIQA y el conjunto completo de subtareas MMLU, lo que permite una comparacion objetiva con otras cuantizaciones y con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | MXFP8 |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | no disponible (se remite a la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del transformer Qwen3.5-9B, que emplea una arquitectura de decoder-only con atencion por ventanas deslizantes y mecanismos de atencion alternados, disenada para optimizar el rendimiento en contextos largos. La cuantizacion MXFP8 se aplico mediante la herramienta agent_optimize, que utiliza el algoritmo AutoRound descrito en el articulo "Optimize weight rounding via signed gradient descent for the quantization of LLMs" (arXiv:2309.05516). Este metodo ajusta los redondeos de los pesos mediante descenso de gradiente con signo, minimizando la perdida de precision respecto al modelo original.

El proceso de cuantizacion no implica entrenamiento adicional ni fine-tuning: se parte de los pesos ya entrenados del modelo base y se transforman al formato MXFP8. En este esquema, los pesos se agrupan en bloques y se les aplica un factor de escala comun, lo que reduce el error de cuantizacion en comparacion con formatos de punto flotante de 8 bits sin agrupar. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre el uso de tecnicas como RLHF o DPO, ya que la ficha se centra exclusivamente en el proceso de cuantizacion.

## Capacidades

- Generacion de texto y conversacion: el modelo mantiene las capacidades de chat y generacion del modelo base Qwen3.5-9B, incluyendo la aplicacion de plantillas de chat mediante `apply_chat_template`.
- Razonamiento matematico: los resultados en GSM8K (0,6133) y en subtareas MMLU de matematicas (college_mathematics 0,64, high_school_mathematics 0,5519) indican una capacidad moderada para problemas aritmeticos y algebraicos.
- Conocimiento general y de dominio: el promedio MMLU global es 0,7859, con puntuaciones destacadas en areas como high_school_government_and_politics (0,9637), high_school_geography (0,9394) y marketing (0,9402).
- Razonamiento de sentido comun: en HellaSwag obtiene 0,5837 y en PIQA 0,7954, lo que sugiere un rendimiento aceptable en tareas de inferencia pragmatica.
- Capacidades multilingues: no disponibles en la ficha, aunque se heredan del modelo base Qwen3.5-9B, que soporta multiples idiomas.
- Tool calling y agentes: no se menciona soporte especifico en la ficha, aunque el modelo base Qwen3.5-9B incluye capacidades de function calling y agentes; la cuantizacion no deberia eliminarlas, pero no hay datos que lo confirmen.

## Casos de uso

- Despliegue en entornos con recursos limitados: gracias a la cuantizacion MXFP8, el modelo ocupa 12,4 GB en disco y puede ejecutarse en GPUs de consumo con 16 GB de VRAM, lo que permite montar un servicio de generacion de texto en una estacion de trabajo sin hardware especializado.
- Inferencia en tiempo real para asistentes conversacionales: con una latencia reducida respecto al modelo en bfloat16, es adecuado para chatbots que requieren respuestas rapidas en entornos de produccion con alta concurrencia.
- Evaluacion de esquemas de cuantizacion: al estar incluido en el Low-Bit Open LLM Leaderboard, sirve como referencia para comparar el impacto de MXFP8 frente a otras cuantizaciones (GPTQ, AWQ, FP8) sobre la misma base.
- Prototipado rapido de aplicaciones de IA generativa: su tamano reducido y la compatibilidad con transformers y vLLM permiten iterar rapidamente en demos y pruebas de concepto sin necesidad de un cluster de GPUs.
- Razonamiento con conocimiento general: con un MMLU de 0,7859, puede utilizarse en aplicaciones de preguntas y respuestas sobre dominios como medicina, derecho, historia o ciencias, siempre que se valide la salida.
- Generacion de codigo asistida: aunque no hay benchmarks especificos de codigo en la ficha, el modelo base Qwen3.5-9B tiene capacidades de programacion; la cuantizacion permite ejecutarlo en entornos de desarrollo integrado con recursos modestos.

## Benchmarks y rendimiento

La ficha incluye resultados de evaluacion sobre las tareas estandar del Low-Bit Open LLM Leaderboard. Se presentan los valores globales y el desglose de subtareas MMLU.

| Tarea | Accuracy |
|---|---|
| gsm8k | 0,6133 |
| hellaswag | 0,5837 |
| mmlu (promedio) | 0,7859 |
| mmlu_stem | 0,7878 |
| mmlu_humanities | 0,7033 |
| mmlu_social_sciences | 0,8694 |
| mmlu_other | 0,8265 |
| piqa | 0,7954 |

Desglose de subtareas MMLU seleccionadas:

| Subtarea | Accuracy |
|---|---|
| mmlu_abstract_algebra | 0,6600 |
| mmlu_college_mathematics | 0,6400 |
| mmlu_high_school_mathematics | 0,5519 |
| mmlu_high_school_government_and_politics | 0,9637 |
| mmlu_high_school_geography | 0,9394 |
| mmlu_marketing | 0,9402 |
| mmlu_professional_law | 0,6037 |
| mmlu_virology | 0,5602 |
| mmlu_global_facts | 0,5200 |
| mmlu_moral_scenarios | 0,5218 |

No se proporcionan comparaciones con el modelo original en bfloat16 ni con otras cuantizaciones dentro de la ficha. Para una comparativa completa, se recomienda consultar el Low-Bit Open LLM Leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en MXFP8 ocupa aproximadamente 12,4 GB en disco. Para inferencia con `device_map="auto"` se recomienda al menos 16 GB de VRAM para evitar desbordamientos en el peor caso.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), A100 40/80 GB, H100. En GPUs con 12 GB (RTX 3080/4070) podria ser posible con `max_memory` ajustado, pero con riesgo de fragmentacion.
- Compatibilidad con GPUs de consumo: si, en tarjetas con 16 GB o mas de VRAM.
- Opciones de despliegue: transformers (con AutoRound instalado), vLLM (comando `vllm serve` incluido en la ficha), y potencialmente llama.cpp si se convierte a GGUF (no documentado).
- Latencia y throughput: no disponibles en la ficha. Se espera una mejora respecto al modelo en bfloat16 debido al menor ancho de banda de memoria requerido, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos dentro de la ficha. Como referencia general, el modelo base Qwen3.5-9B compite con otras arquitecturas de 9B como Llama 3.1 8B, Mistral 7B o Gemma 2 9B. La cuantizacion MXFP8 deberia ofrecer un rendimiento cercano al del modelo original, con una reduccion de memoria de aproximadamente el 50% respecto a bfloat16. Para una comparativa cuantitativa, se recomienda consultar el Low-Bit Open LLM Leaderboard, donde se publican resultados de multiples cuantizaciones sobre la misma base.

## Limitaciones y advertencias

- La ficha no especifica la licencia del modelo; se remite a la del modelo base Qwen3.5-9B, que debe consultarse antes de cualquier uso comercial.
- El modelo puede producir informacion factualmente incorrecta; la propia ficha advierte que no debe utilizarse como fuente de verdad en aplicaciones criticas.
- Existe riesgo de generar contenido ofensivo, sesgado o inapropiado, derivado de las limitaciones del modelo base y de los datos de entrenamiento.
- No se proporcionan datos sobre la longitud de contexto efectiva tras la cuantizacion; es posible que se degrade ligeramente respecto al modelo original.
- La cuantizacion MXFP8 puede introducir una perdida de precision en tareas de razonamiento complejo o generacion de codigo, aunque los benchmarks disponibles no muestran degradaciones severas.
- No hay informacion sobre el rendimiento en tareas de tool calling o agentes; si estas capacidades son criticas, se recomienda validar el comportamiento del modelo cuantizado antes de desplegarlo.
- El modelo se genero de forma automatica mediante agent_optimize; no ha pasado por un proceso de evaluacion de seguridad especifico mas alla de los benchmarks estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeaderboardModel1/Qwen3.5-9B-AutoRound-MXFP8-ModelFree
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio AutoRound: https://github.com/intel/auto-round
- Articulo arXiv (AutoRound): https://arxiv.org/abs/2309.05516
- Low-Bit Open LLM Leaderboard: https://huggingface.co/spaces/Intel/low_bit_open_llm_leaderboard
- Intel Neural Compressor: https://github.com/intel/neural-compressor
