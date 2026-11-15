# dnhkng/RYS-Llama-3.1-8B-Instruct

## Resumen

RYS-Llama-3.1-8B-Instruct es un modelo de generacion de texto derivado de Meta-Llama-3.1-8B, publicado por el investigador independiente David Noel Ng (dnhkng) en agosto de 2024. Su particularidad no reside en un reentrenamiento ni en un ajuste fino adicional, sino en una tecnica de optimizacion denominada RYS (Repetitive Yielding of Structures, segun la metodologia descrita por el autor), que modifica la topologia de las capas del transformer sin alterar un solo peso del modelo original.

El modelo mantiene los 8.684.597.248 parametros del Llama-3.1-8B-Instruct base y se distribuye en formato safetensors dentro de un repositorio de 17,4 GB. La propuesta del autor es que la duplicacion selectiva de capas puede mejorar el rendimiento en benchmarks estandar sin necesidad de computo de entrenamiento, lo que lo convierte en un caso de estudio interesante sobre la estructura interna de los transformers y sobre como el Open LLM Leaderboard mide ciertas capacidades.

Es relevante ahora porque cuestiona supuestos arraigados sobre la relacion entre parametros, entrenamiento y calidad, y porque su licencia MIT permite uso comercial sin las restricciones de la licencia comunitaria de Llama 3.1. No obstante, los resultados publicados en el leaderboard muestran un perfil muy desigual: destaca en IFEval pero cae de forma notable en tareas de razonamiento y conocimiento, lo que exige una evaluacion cuidadosa antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama-3.1-8B con duplicacion de capas (metodo RYS) |
| Parametros totales | 8.684.597.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3.1-8B soporta 128.000 tokens, pero el autor no lo declara para esta variante) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3.1-8B-Instruct, un transformer decoder-only con atencion causal, RoPE y normalizacion RMSNorm. La intervencion RYS consiste en duplicar determinadas capas de la red para reorganizar el flujo de informacion sin modificar los tensores de pesos existentes; el autor describe el metodo en el articulo "LLM Neuroanatomy: How I Topped the LLM Leaderboard Without Changing a Single Weight". No se realizo entrenamiento adicional, ajuste fino, RLHF ni DPO sobre esta variante: la unica transformacion es estructural.

El autor no detalla en la model card el numero de tokens de entrenamiento (heredados del modelo base), la composicion del dataset ni los pormenores de que capas concretas se duplican y con que criterio. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal. El respaldo institucional declarado es el appliedAI Institute, que aporto hardware para la investigacion.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del ajuste instructivo de Llama-3.1-8B.
- Seguimiento de instrucciones con formato estricto, reflejado en un resultado alto en IFEval (76,85 en precision estricta).
- Razonamiento de multiples pasos y conocimiento factual: rendimiento bajo en BBH, MuSR, GPQA y MMLU-PRO, por lo que estas capacidades estan seriamente degradadas respecto al modelo base.
- Matematicas: capacidad limitada, con un 11,33 de exact match en MATH Nivel 5.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada; el modelo base lo soporta, pero el autor no lo verifica para esta variante.
- Capacidades de agente y razonamiento multi-paso: no verificadas y desaconsejadas segun los resultados de BBH y MuSR.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Evaluacion de instrucciones con formato estricto: el modelo obtiene 76,85 en IFEval, por lo que puede emplearse en tareas donde la salida debe respetar plantillas, longitudes o restricciones de formato, como generacion de informes estructurados o respuestas a encuestas con esquema fijo.
- Generacion de texto controlada en entornos de investigacion: sirve como banco de pruebas para estudiar el efecto de la duplicacion de capas sobre el comportamiento del modelo, comparandolo con Llama-3.1-8B-Instruct en el mismo pipeline.
- Prototipado rapido de asistentes conversacionales: al mantener el tokenizador y la interfaz de Llama 3.1, puede integrarse en pipelines existentes basados en transformers con cambios minimos y licencia MIT para uso comercial.
- Experimentos academicos sobre neuroanatomia de LLM: util para reproducir y extender el metodo RYS descrito por el autor, midiendo como cambia la perplejidad y la precision en tareas concretas al reorganizar capas.
- Filtrado y clasificacion de texto con formato fijo: en tareas de etiquetado donde la salida sigue un esquema predefinido, el buen resultado en IFEval sugiere un comportamiento aceptable, siempre con validacion humana.
- Educacion y divulgacion: como ejemplo practico de que la estructura de capas importa y de que los rankings de leaderboards deben interpretarse con cautela, apropiado para cursos de arquitecturas de transformers.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, procedentes del Open LLM Leaderboard (no verificados de forma independiente):

| Benchmark | Configuracion | Metrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | strict accuracy | 76,85 |
| BBH | 3-shot | acc_norm | 31,09 |
| MATH Nivel 5 | 4-shot | exact match | 11,33 |
| GPQA | 0-shot | acc_norm | 2,35 |
| MuSR | 0-shot | acc_norm | 7,68 |
| MMLU-PRO | 5-shot | accuracy | 29,33 |
| Promedio | - | - | 26,44 |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni comparaciones directas con el modelo base en la model card.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 17,4 GB de pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; RTX 3090/4090 o GPUs de 16 GB en cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 a bfloat16 y en GPUs de 12-16 GB con cuantizacion, siempre que se generen pesos cuantizados (el repositorio solo publica safetensors).
- Opciones de despliegue: transformers (soporte nativo de safetensors), vLLM y TGI para servir en produccion; llama.cpp y Ollama requeririan conversion previa a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RYS-Llama-3.1-8B-Instruct | 8,68 B | no disponible | MIT | Hugging Face, safetensors | IFEval 76,85; promedio leaderboard 26,44 |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, safetensors y GGUF | Modelo base; rendimiento general superior en razonamiento y conocimiento, no comparable en IFEval segun los datos disponibles |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | Hugging Face, safetensors y GGUF | Alternativa de tamano similar con licencia permisiva y amplio ecosistema de cuantizaciones |
| Qwen2.5-7B-Instruct | 7,62 B | 131.072 tokens | Apache 2.0 | Hugging Face, safetensors y GGUF | Buen equilibrio en codigo y matematicas; contexto largo nativo |

No se dispone de comparaciones directas publicadas por el autor frente a estos modelos; la tabla recoge caracteristicas estructurales, no resultados de benchmarks cruzados.

## Limitaciones y advertencias

- Rendimiento muy desigual: los resultados en BBH (31,09), MuSR (7,68) y GPQA (2,35) estan por debajo de lo esperable en un modelo de 8B ajustado para instrucciones, lo que sugiere degradacion en razonamiento y conocimiento factual.
- Riesgo elevado de alucinacion en tareas de conocimiento y matematicas, dado el bajo exact match en MATH (11,33) y el bajo MMLU-PRO (29,33).
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente; el propio autor indica que la metodologia busca subir en el leaderboard, lo que invita a interpretar los resultados con cautela.
- No se documentan sesgos especificos de esta variante; hereda los del modelo base Llama-3.1, pero el autor no realiza una evaluacion de sesgos.
- Idiomas soportados no declarados; no se recomienda asumir capacidades multilingues sin evaluacion previa.
- Contexto maximo no declarado para esta variante; no asumir los 128.000 tokens del modelo base sin verificar.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo deriva de Llama 3.1, por lo que conviene revisar la compatibilidad con los terminos de la licencia original de Meta antes de un despliegue comercial.
- Solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales, lo que complica el despliegue en hardware de consumo sin conversion manual.
- No apto para produccion en tareas de razonamiento, agentes o atencion al cliente sin una evaluacion exhaustiva y validacion humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dnhkng/RYS-Llama-3.1-8B-Instruct
- Articulo del metodo RYS: https://dnhkng.github.io/posts/rys/
- DOI del articulo (Zenodo): https://doi.org/10.5281/zenodo.24230106
- Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Resultados detallados en el leaderboard: https://huggingface.co/datasets/open-llm-leaderboard/details_dnhkng__RYS-Llama-3.1-8B-Instruct
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B
- appliedAI Institute: https://www.appliedai-institute.de/en/
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/dnhkng
- Repositorio GLaDOS del autor: https://github.com/dnhkng/GlaDOS
