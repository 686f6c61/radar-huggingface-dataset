# LeVraiCNL/Luth-2-0.8B-abliterated-fp8

## Resumen

Luth-2-0.8B-abliterated-fp8 es una variante cuantizada en FP8 del modelo Luth-2-0.8B-abliterated, publicado por el usuario LeVraiCNL en Hugging Face. Se trata de un modelo de lenguaje de aproximadamente 853 millones de parametros, derivado originalmente de kurakurai/Luth-2-0.8B, un SLM (small language model) especializado en frances y entrenado a partir de la arquitectura de Qwen3.5-0.8B. Esta version concreta aplica dos transformaciones sobre el modelo base: la abliteracion (eliminacion de la direccion de rechazo en la capa 18 mediante ortogonalizacion de pesos) y la cuantizacion FP8 con escala por bloques de 128x128.

El modelo resuelve el problema de desplegar un SLM con capacidades notables en frances (matematicas, codigo, seguimiento de instrucciones y tool calling) en entornos con memoria limitada, manteniendo un error de reconstruccion relativo medio del 2.64 %. La abliteracion elimina los mecanismos de rechazo, lo que lo hace relevante para investigadores que estudian el comportamiento de modelos sin guardarrailes o para aplicaciones donde los filtros de seguridad del modelo base resultan demasiado restrictivos.

Es importante senalar que esta es una publicacion de un tercero (LeVraiCNL), no del autor original del modelo. El repositorio no incluye pipeline declarado, licencia explicita ni idiomas documentados, y cuenta con cero descargas y cero likes en el momento de la consulta. La informacion tecnica disponible proviene principalmente de la model card heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la arquitectura VLM de Qwen3.5-0.8B, sin entrenamiento en vision) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (float8_e4m3fn) con escala por bloques 128x128; embeddings, lm_head y normas en precision original o bf16 |
| Idiomas soportados | no disponible en el repo; el modelo base esta especializado en frances |
| Licencia | no disponible (se indican "licencias del modelo de origen aplicables") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only que hereda la estructura VLM de Qwen3.5-0.8B, aunque el modelo no fue entrenado con datos de vision y no se recomienda su uso para tareas visuales. El modelo original Luth-2-0.8B se post-entreno en dos fases: primero un SFT supervisado sobre una mezcla francesa de 3.000 millones de tokens compuesta por matematicas (37,2 %), conocimiento (27,9 %), codigo (22,2 %), seguimiento de instrucciones (6,5 %) y tool calling (6,3 %); despues, una destilacion on-policy multidominio (MOPD) en la que tres especialistas (matematicas, codigo y seguimiento de instrucciones) se entrenaron por separado con GRPO y se destilaron de vuelta al estudiante SFT.

Sobre esa base, la variante abliterated elimina la direccion de rechazo en la capa 18 mediante ortogonalizacion de los pesos de embeddings, proyecciones de salida de atencion y MLP, sin reentrenamiento. Segun la model card, los rechazos medidos con 64 prompts de validacion pasaron de 55 a 0, con una divergencia KL de 0,0265 sobre el primer token en prompts inofensivos. La version FP8 aplica cuantizacion float8_e4m3fn con escala por bloques de 128x128 en las capas lineales del decodificador, dejando embeddings, lm_head y normas en bf16 o precision original, con un error de reconstruccion relativo medio del 2,64 %.

## Capacidades

- Generacion de texto en frances con calidad destacada para su tamano, segun los benchmarks reportados por el autor original.
- Razonamiento matematico: resolucion de problemas tipo MGSM, AIME y Math-500.
- Generacion de codigo: HumanEval+ y MBPP+ con resultados superiores a modelos de su clase.
- Seguimiento de instrucciones: IFEval y Multi-IF con puntuaciones notables.
- Tool calling / function calling: evaluado en BFCL v2.
- Conocimiento general: Global-MMLU-Lite, MMLU-ProX-Lite y GPQA-Diamond.
- Modelo no-reasoning (sin modo de pensamiento explicito).
- Capacidades multilingues limitadas al frances como idioma principal de entrenamiento; otros idiomas no documentados.
- Vision: la arquitectura la soporta pero el modelo no fue entrenado para ello; no recomendado.
- Sin guardarrailes de rechazo (modelo abliterado).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un SLM sin direccion de rechazo, comparando respuestas con el modelo base original para analizar que informacion y capacidades se ven afectadas por la abliteracion.
- Despliegue en dispositivos con memoria limitada: con 853 millones de parametros y pesos FP8, el modelo ocupa aproximadamente 0,85 GB en pesos, lo que permite ejecutarlo en GPUs consumer modestas o incluso en CPU con herramientas compatibles.
- Procesamiento de texto en frances: generacion de resumenes, reescritura y respuestas conversacionales en frances con un modelo especializado y de baja latencia.
- Evaluacion de cuantizacion FP8: util como caso de estudio para medir el impacto de la cuantizacion float8_e4m3fn con escala 128x128 en un SLM, comparando el error de reconstruccion del 2,64 % con el rendimiento downstream.
- Tool calling en pipelines ligeros: integracion en agentes o asistentes que requieran function calling en frances con un modelo pequeno y rapido.
- Generacion de codigo asistida en entornos con recursos restringidos: autocompletado o generacion de fragmentos en frances e ingles dentro de editores o scripts, dado su rendimiento en HumanEval+ y MBPP+.
- Experimentacion con destilacion on-policy: el modelo sirve como referencia para reproducir o comparar la metodologia MOPD descrita por el autor original.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base Luth-2-0.8B (sin abliterar ni cuantizar), segun la model card del autor original. No se han publicado benchmarks especificos para la variante abliterated-fp8 en la informacion disponible.

| Benchmark frances | Luth-2-0.8B | Luth-0.6B-Instruct | Qwen3.5-0.8B |
|---|--:|--:|--:|
| MGSM-rev2 | 72,92 | 58,52 | 35,20 |
| AIME 24 | 5,67 | 2,00 | 1,00 |
| AIME 25 | 8,67 | 1,33 | 0,33 |
| Math-500 | 57,60 | 44,74 | 27,46 |
| Global-MMLU-Lite | 53,30 | 40,20 | 44,00 |
| MMLU-ProX-Lite | 38,93 | 25,40 | 27,60 |
| GPQA-Diamond | 26,87 | 25,60 | 23,80 |
| IFEval | 71,23 | 51,23 | 44,47 |
| Multi-IF | 61,52 | 33,77 | 32,72 |
| HumanEval+ | 46,81 | 30,25 | 10,87 |
| MBPP+ | 42,33 | 34,74 | 18,20 |
| BFCL v2 | 64,02 | 61,72 | 51,49 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB solo para pesos en FP8; con overhead de activaciones y cache KV, el consumo real dependera de la longitud de contexto (no documentada).
- GPUs recomendadas: arquitecturas Ada (RTX 4090, L4) y Hopper (H100) para calculo FP8 nativo. En GPUs sin soporte FP8, los pesos se descomprimen al cargarse, perdiendo la ventaja de memoria.
- Cabe en GPUs consumer: si, practicamente cualquier GPU con al menos 2-4 GB de VRAM, incluidas RTX 3060, RTX 4060 y similares. Tambien es viable en CPU.
- Opciones de despliegue: Transformers (soporte nativo segun la model card del base), vLLM y SGLang (soportados por el modelo base). Para llama.cpp y Ollama existe una variante GGUF del modelo base, pero no de esta version FP8.
- Latencia y throughput: no disponibles. Al ser un modelo de 0,8B, se espera latencia baja, pero no hay mediciones publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luth-2-0.8B-abliterated-fp8 | 853M | no disponible | no disponible | safetensors (FP8) | Abliterado, cuantizado FP8, frances |
| Luth-2-0.8B (original) | 750M (reportado) | no disponible | no disponible | safetensors | Base sin abliterar, con guardarrailes |
| Qwen3.5-0.8B | 800M aprox. | no disponible | no disponible | safetensors | Modelo origen, multilingue generalista |
| Luth-0.6B-Instruct | 600M aprox. | no disponible | no disponible | no disponible | Generacion anterior, peor rendimiento en benchmarks franceses |

## Limitaciones y advertencias

- Modelo abliterado: los guardarrailes de rechazo han sido eliminados, por lo que puede generar contenido que el modelo original rechazaria. Requiere uso responsable y cumplimiento de la legislacion aplicable.
- La licencia no esta declarada en el repositorio; la model card indica que se aplican las licencias del modelo de origen, pero no se especifica cual es. Verificar antes de cualquier uso comercial.
- No hay informacion sobre sesgos especificos de esta variante; al heredar el entrenamiento del modelo base, es probable que arrastre sesgos del corpus frances utilizado.
- Riesgo de alucinacion inherente a un modelo de 0,8B, especialmente en conocimiento general y matematicas complejas (AIME 24: 5,67; AIME 25: 8,67 sobre 100).
- La cuantizacion FP8 introduce un error de reconstruccion del 2,64 %, que puede degradar ligeramente el rendimiento respecto al modelo en bf16.
- En GPUs sin soporte FP8 nativo, los pesos se descomprimen al cargar, por lo que el ahorro de memoria no se materializa.
- Contexto maximo no documentado en la informacion disponible.
- Idiomas: el modelo base esta especializado en frances; el rendimiento en castellano u otros idiomas no esta evaluado.
- Repositorio sin descargas ni validacion de la comunidad; es una publicacion de un tercero no verificada por el autor original.
- No recomendado para tareas de vision a pesar de heredar la arquitectura VLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LeVraiCNL/Luth-2-0.8B-abliterated-fp8
- Modelo abliterated base: https://huggingface.co/LeVraiCNL/Luth-2-0.8B-abliterated
- Modelo original: https://huggingface.co/kurakurai/Luth-2-0.8B
- Variante GGUF: https://huggingface.co/kurakurai/Luth-2-0.8B-GGUF
- Modelo Luth-2-2B: https://huggingface.co/kurakurai/Luth-2-2B
- Blog: https://huggingface.co/blog/MaxLSB/luth-2
- Dataset SFT: https://huggingface.co/datasets/kurakurai/Luth-2-Post-Training-SFT
- Dataset RL: https://huggingface.co/datasets/kurakurai/Luth-2-Post-Training-RL
- Codigo: https://github.com/kurakurai/Luth-2
- Leaderboard frances: https://huggingface.co/spaces/kurakurai/llm_leaderboard_fr
