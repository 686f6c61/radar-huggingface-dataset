# axteam/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es una compilación de cuantizaciones en formato GGUF del modelo Qwen/Qwen3.5-4B, publicada por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. El modelo base pertenece a la familia Qwen3.5 del equipo Qwen (Alibaba) y cuenta con 4.326.350.848 parámetros totales en sus pesos originales en safetensors. Esta build no reentrena ni modifica los pesos: aplica cuantización post-entrenamiento (PTQ) sobre los pesos BF16 originales mediante las herramientas de llama.cpp.

El repositorio resuelve un problema práctico de despliegue: permitir ejecutar un modelo de ~4.300 millones de parámetros en hardware de consumo o en GPUs de datacenter con requisitos de memoria reducidos, manteniendo el chat template original embebido en cada fichero. Incluye dos cuantizaciones: Q4_K_M (2,8 GB), orientada al equilibrio entre tamano y calidad, y Q8_0 (4,6 GB), la más próxima al modelo original.

Es relevante porque la arquitectura `qwen35` está soportada en llama.cpp desde la build b7990, y estos ficheros incorporan además la capa de predicción multi-token (MTP), cuyo soporte llegó en la build b9180 (PR #22673). La build es solo de texto: no incluye el proyector de visión (`mmproj`), por lo que no permite entrada de imágenes pese a que el modelo base pueda tener codificador visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `qwen35` en llama.cpp), con capa de predicción multi-token (MTP) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de la model card usan `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (4 bits, k-quant medium) y Q8_0 (8 bits) |
| Idiomas soportados | no disponible de forma oficial; la model card incluye evaluacion en ingles y coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base; este repo solo distribuye GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer de aproximadamente 4.300 millones de parametros. La build GGUF conserva la arquitectura `qwen35` tal como la implementa llama.cpp e incluye la capa de predicción multi-token (MTP), una tecnica de decodificacion especulativa que permite proponer varios tokens por paso y acelerar la generacion. El chat template original queda embebido en cada fichero GGUF.

La cuantizacion es post-entrenamiento (PTQ), realizada con `convert_hf_to_gguf.py` seguido de `llama-quantize`, con cuantizacion por bloques (k-quants: escalas por bloque con asignacion mixta de bits) y sin reentrenamiento. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la model card del modelo original Qwen/Qwen3.5-4B, no incluida en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, con chat template embebido y compatibilidad con el formato de chat de Qwen.
- Razonamiento y respuesta a preguntas generales; la model card verifica respuestas correctas a preguntas factuales simples (capital de Francia y de Corea).
- Generacion de codigo: no se documenta de forma especifica en la informacion disponible, aunque es una capacidad habitual de la familia Qwen; no hay confirmacion explicita en esta build.
- Capacidades multilingues: la model card incluye evaluacion en ingles y coreano, lo que sugiere soporte al menos para esos idiomas; el listado oficial de idiomas no esta disponible.
- Prediccion multi-token (MTP): capa incluida en los ficheros, soportada por llama.cpp desde la build b9180.
- Servido mediante API compatible con OpenAI a traves de `llama-server`.
- No soporta vision: no se incluye fichero `mmproj`, por lo que no hay entrada de imagenes ni OCR.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: con Q4_K_M (2,8 GB) el modelo cabe en GPUs de consumo y permite desplegar un chatbot en local mediante `llama-server` con API compatible con OpenAI, sin dependencia de servicios externos.
- Prototipado rapido de aplicaciones LLM: la integracion directa con Ollama (`ollama run hf.co/axteam/Qwen3.5-4B-GGUF:Q4_K_M`) y LM Studio permite validar prompts y flujos conversacionales en minutos sobre un portatil con GPU moderada.
- Procesamiento de texto en ingles y coreano: la evaluacion de perplejidad en WikiText-2 (8,66 con Q8_0) y en una muestra de Wikipedia en coreano (6,11 con Q8_0) respalda su uso en tareas de generacion y resumen en esos idiomas.
- Despliegue en entornos con memoria limitada: Q8_0 (4,6 GB) ofrece la mayor fidelidad al modelo original para casos donde la precision importa mas que el rendimiento, mientras que Q4_K_M reduce el uso de memoria un 39% aproximadamente.
- Servicio de inferencia autoalojado: `llama-server` expone un endpoint `/v1/chat/completions` que permite integrar el modelo en aplicaciones existentes que ya consumen APIs compatibles con OpenAI, con control total sobre los datos.
- Reduccion de costes en inferencia por lotes: la opcion de cuantizar la KV cache a q8_0 con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` permite aproximadamente la mitad de memoria de cache, util para servir contextos de 8.192 tokens en GPUs con VRAM ajustada.
- Experimentacion con decodificacion especulativa: la capa MTP incluida permite probar el rendimiento de la prediccion multi-token en llama.cpp (build b9180 o superior).

## Benchmarks y rendimiento

La model card solo publica mediciones de perplejidad (PPL) realizadas con llama.cpp b12005 (commit e0f142d, build CUDA) sobre una NVIDIA B200, con todas las capas en GPU, 16 ventanas de 2.048 tokens del conjunto de test de WikiText-2 y de una muestra de Wikipedia en coreano. No hay fichero BF16 en el repositorio, por lo que los porcentajes se expresan respecto a Q8_0.

| Fichero | PPL WikiText-2 (EN) | PPL Wikipedia coreano (KO) | Diferencia vs Q8_0 (EN / KO) |
|---|---|---|---|
| Qwen3.5-4B-Q8_0.gguf | 8,66 | 6,11 | referencia |
| Qwen3.5-4B-Q4_K_M.gguf | 9,06 | 6,34 | +4,7% / +3,7% |

El propio autor advierte que 16 ventanas por texto es una muestra pequena y que diferencias de pocos puntos porcentuales entre ficheros quedan dentro del ruido de muestreo; al repetir la medicion con 64 ventanas en dos repositorios, las diferencias se movieron hasta ~19 puntos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ocupa 2,8 GB de pesos; Q8_0 ocupa 4,6 GB. A esto hay que sumar la KV cache correspondiente al contexto configurado con `-c`.
- GPU recomendadas: la model card verifica el funcionamiento en una NVIDIA B200 con todas las capas en GPU. No se especifican otras GPU probadas.
- GPU de consumo: por tamano de pesos, Q4_K_M (2,8 GB) y Q8_0 (4,6 GB) son compatibles con GPUs de consumo con VRAM suficiente para pesos mas KV cache; no hay confirmacion oficial de pruebas en modelos concretos como RTX 4090.
- Opciones de despliegue: llama.cpp (build minima b9180 para soportar la capa MTP; arquitectura `qwen35` desde b7990; `-fa on` desde b6325), Ollama y LM Studio. Ollama y LM Studio no fueron probados por el autor.
- Reduccion de KV cache: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce aproximadamente a la mitad la memoria de la KV cache, configurable en tiempo de ejecucion e independiente del fichero GGUF.
- Latencia y throughput: no disponible; no se publican mediciones de velocidad de generacion ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La unica comparacion interna posible es entre las dos cuantizaciones del propio repositorio:

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-Q4_K_M | 4,33 B | no disponible | 9,06 | Apache-2.0 | GGUF (2,8 GB) |
| Qwen3.5-4B-Q8_0 | 4,33 B | no disponible | 8,66 | Apache-2.0 | GGUF (4,6 GB) |

Comparativa con alternativas de la misma categoria: no disponible.

## Limitaciones y advertencias

- Solo texto: no incluye `mmproj`, por lo que no procesa imagenes ni realiza OCR, aunque el modelo base pudiera tener capacidades de vision.
- Sin datos de sesgo: no se documentan sesgos conocidos en la informacion proporcionada; al tratarse de un modelo de lenguaje, existe riesgo de sesgos heredados del entrenamiento original.
- Riesgo de alucinacion: inherente a los modelos generativos; no se publican evaluaciones de factualidad.
- Idiomas: el listado oficial de idiomas no esta disponible; solo hay evidencia de evaluacion en ingles y coreano.
- Contexto: la longitud de contexto del modelo base no se especifica; los ejemplos de la model card usan 8.192 tokens, pero no se confirma como maximo.
- Licencia: Apache-2.0 permite uso comercial, pero los derechos de los pesos y el tokenizador originales pertenecen al equipo Qwen (Alibaba); conviene revisar la licencia del modelo base.
- Requisito de version: es imprescindible llama.cpp b9180 o superior para cargar la capa MTP; versiones anteriores pueden fallar o ignorar esa capa.
- Ruido en las mediciones: la evaluacion de perplejidad usa solo 16 ventanas por texto, por lo que las diferencias entre cuantizaciones deben interpretarse con cautela.
- Sin validacion en Ollama ni LM Studio por parte del autor: el funcionamiento en esas plataformas no esta verificado.
- Repositorio con baja adopcion: 894 descargas y 1 like en el momento de la consulta, lo que reduce la evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- PR de soporte MTP en llama.cpp: PR #22673 (referenciado en la model card; no se proporciona URL directa)
- llama.cpp: no se proporciona URL directa en la informacion disponible
- Papers, blogs y demos adicionales: no disponible
