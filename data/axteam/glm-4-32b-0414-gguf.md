# axteam/GLM-4-32B-0414-GGUF

## Resumen

GLM-4-32B-0414 es un modelo de lenguaje de gran tamano desarrollado por Z.ai (organizacion zai-org) con 32.566.081.536 parametros totales, publicado bajo licencia MIT. Esta ficha cubre la version cuantizada en formato GGUF producida por axteam, pensada para su ejecucion con llama.cpp, Ollama y LM Studio sobre hardware de consumo o servidores con GPU unica. La cuantizacion permite reducir el peso del modelo desde los aproximadamente 65 GB en BF16 hasta 12,3 GB en Q2_K, a costa de una perdida de calidad medible en perplejidad.

El repositorio incluye seis variantes k-quant (Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0), generadas mediante cuantizacion post-entrenamiento (PTQ) sin reentrenamiento, usando el script oficial `convert_hf_to_gguf.py` de llama.cpp. Cada archivo conserva la plantilla de chat original embebida, lo que facilita el despliegue directo con `--jinja` en llama-server o mediante el endpoint compatible con OpenAI.

La relevancia de esta publicacion radica en que acerca un modelo de 32B a entornos con VRAM limitada: la variante Q4_K_M (19,7 GB) cabe en GPUs de consumo de gama alta con 24 GB y ofrece una degradacion de perplejidad de solo +3,3 % en ingles y +2,3 % en coreano respecto a Q8_0. El autor ha publicado mediciones de perplejidad sobre WikiText-2 y una muestra de Wikipedia en coreano, lo que aporta datos verificables sobre el impacto real de cada nivel de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es GLM-4-32B-0414; llama.cpp lo identifica con la arquitectura `glm4`) |
| Parametros totales | 32.566.081.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de llama.cpp usan `-c 8192`) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (k-quants de llama.cpp, PTQ) |
| Idiomas soportados | no disponible de forma explicita; la model card incluye pruebas en ingles y coreano |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base original esta en safetensors/BF16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base zai-org/GLM-4-32B-0414 mas alla de que llama.cpp la clasifica bajo el identificador `glm4`, lo que implica que el conversor oficial la reconoce como una familia transformer compatible con el runner de llama.cpp. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o similar. El recuento de parametros (32.566.081.536) corresponde al modelo original en safetensors.

Lo que si esta documentado es el proceso de cuantizacion: los pesos BF16 se convierten con `convert_hf_to_gguf.py` y se cuantizan con `llama-quantize` mediante k-quants de asignacion de bits mixta y escalas por bloque, sin reentrenamiento (PTQ). La plantilla de chat original se incrusta en cada archivo GGUF, lo que permite usar el modo conversacional con `--jinja`. Las mediciones de perplejidad se realizaron con llama.cpp b12005 (commit e0f142d, build CUDA) sobre una NVIDIA B200 con todas las capas en GPU, usando 16 ventanas de 2.048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat embebida en cada archivo GGUF.
- Razonamiento y respuesta a preguntas generales (la model card verifica respuestas correctas sobre capitales de Francia y Corea).
- Capacidad multilingue parcialmente evidenciada: la model card incluye pruebas en ingles y coreano, con perplejidad medida en ambos idiomas.
- Compatibilidad con el endpoint `/v1/chat/completions` de llama-server, lo que permite integrarlo en aplicaciones que esperan la API de OpenAI.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU unica: la variante Q4_K_M (19,7 GB) permite ejecutar un modelo de 32B en una RTX 4090 o similar con 24 GB de VRAM, sirviendo una API compatible con OpenAI mediante `llama-server -hf axteam/GLM-4-32B-0414-GGUF:Q4_K_M -c 8192 --jinja`.
- Prototipado rapido de asistentes conversacionales: con Ollama (`ollama run hf.co/axteam/GLM-4-32B-0414-GGUF:Q4_K_M`) o LM Studio se puede levantar un chatbot funcional en minutos sin infraestructura dedicada, usando la plantilla de chat ya embebida.
- Evaluacion de calidad frente a tamano: las seis variantes permiten medir el impacto de la cuantizacion en una tarea concreta antes de fijar una variante en produccion, apoyandose en las curvas de perplejidad publicadas (Q4_K_M +3,3 % en ingles, Q3_K_M +6,6 %, Q2_K +32,4 %).
- Procesamiento de texto en ingles y coreano: la perplejidad medida en una muestra de Wikipedia en coreano (3,02 en Q8_0) sugiere un comportamiento solido en ese idioma, util para pipelines de resumen o clasificacion en entornos bilingues.
- Servicio de inferencia en servidores con memoria ajustada: la variante Q2_K (12,3 GB) permite cargar el modelo en GPUs de 16 GB o en configuraciones con offload parcial, aceptando la perdida de calidad documentada.
- Reduccion de huella de KV cache en contextos largos: con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` se reduce a la mitad la memoria de la cache KV, lo que facilita servir conversaciones de varios miles de tokens en GPUs con VRAM justa.
- Integracion en pipelines de CI o herramientas internas: al exponer una API compatible con OpenAI en el puerto 8080, se puede conectar a clientes existentes sin adaptadores adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente publica mediciones de perplejidad (PPL) por variante de cuantizacion:

| Archivo | WikiText-2 PPL | Coreano wiki PPL | vs Q8_0 (EN / KO) |
|---|---|---|---|
| GLM-4-32B-0414-Q8_0.gguf | 6,25 | 3,02 | referencia |
| GLM-4-32B-0414-Q6_K.gguf | 6,27 | 3,02 | +0,3 % / +0,1 % |
| GLM-4-32B-0414-Q5_K_M.gguf | 6,32 | 3,03 | +1,1 % / +0,5 % |
| GLM-4-32B-0414-Q4_K_M.gguf | 6,45 | 3,09 | +3,3 % / +2,3 % |
| GLM-4-32B-0414-Q3_K_M.gguf | 6,66 | 3,27 | +6,6 % / +8,3 % |
| GLM-4-32B-0414-Q2_K.gguf | 8,27 | 4,35 | +32,4 % / +44,0 % |

El autor advierte que 16 ventanas por texto es una muestra pequena y que diferencias de pocos puntos porcentuales entre archivos pueden estar dentro del ruido de muestreo (remidiendo con 64 ventanas, las diferencias se movieron hasta ~19 puntos). Las mediciones se hicieron en una NVIDIA B200 con llama.cpp b12005.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): 12,3 GB (Q2_K), 15,9 GB (Q3_K_M), 19,7 GB (Q4_K_M), 23,1 GB (Q5_K_M), 26,7 GB (Q6_K), 34,6 GB (Q8_0).
- Memoria total necesaria: el archivo GGUF elegido mas la cache KV para el contexto configurado con `-c`. Con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` la cache KV se reduce a la mitad.
- GPU recomendadas: NVIDIA B200 fue la usada en las mediciones del autor (todas las capas en GPU). Para Q4_K_M, una GPU de 24 GB (RTX 4090, A10G de 24 GB, L4 con offload) es el objetivo natural; para Q8_0 se requiere una GPU de 40-48 GB (A100 40 GB, A6000 48 GB) o particionado.
- Cabe en GPU de consumo: Q4_K_M (19,7 GB) y Q3_K_M (15,9 GB) caben en GPUs de 24 GB y 16 GB respectivamente, dejando margen variable para la cache KV segun contexto. Q2_K (12,3 GB) es la opcion para GPUs de 16 GB con contexto moderado.
- Opciones de despliegue: llama.cpp (build >= b6325; la arquitectura `glm4` requiere >= b5115 y las opciones `-fa on` de los ejemplos requieren >= b6325), llama-server con API compatible OpenAI, Ollama y LM Studio. Ollama y LM Studio no fueron probados por el autor.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento en tareas del modelo base ni de alternativas en la informacion proporcionada, por lo que la comparativa se limita a dimensiones objetivas verificables:

| Modelo | Parametros | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4-32B-0414 (GGUF, axteam) | 32,57 B | GGUF (k-quants) | MIT | no disponible | Hugging Face, llama.cpp, Ollama, LM Studio |
| zai-org/GLM-4-32B-0414 (original) | 32,57 B | safetensors/BF16 | MIT | no disponible | Hugging Face |
| Alternativas de ~32B en GGUF | no disponible | GGUF | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables con datos verificables de parametros, contexto, rendimiento y licencia. Cualquier comparacion cuantitativa adicional requeriria consultar las fichas de los modelos alternativos.

## Limitaciones y advertencias

- La cuantizacion Q2_K degrada la perplejidad un +32,4 % en ingles y un +44,0 % en coreano respecto a Q8_0; no es recomendable para tareas sensibles a la calidad.
- Las mediciones de perplejidad se basan en 16 ventanas de 2.048 tokens, una muestra pequena; el propio autor advierte que diferencias de pocos puntos porcentuales entre variantes pueden estar dentro del ruido de muestreo.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en la informacion disponible.
- El soporte de idiomas no esta declarado formalmente; solo hay evidencia empirica en ingles y coreano. El rendimiento en castellano no esta verificado.
- La longitud de contexto nativa del modelo base no se especifica; los ejemplos usan 8.192 tokens, pero no debe asumirse ese valor como limite del modelo.
- La licencia MIT del modelo base se mantiene en la derivada cuantizada, pero los pesos y el tokenizer originales pertenecen a Z.ai / zai-org; conviene revisar la ficha del modelo base para cualquier clausula adicional.
- Ollama y LM Studio no fueron probados por el autor; su funcionamiento es esperable pero no esta verificado.
- Se requiere llama.cpp >= b6325 para las opciones de los ejemplos (`-fa on`); versiones anteriores pueden fallar al cargar la arquitectura `glm4`.
- El repositorio ocupa 132,3 GB en total por incluir las seis variantes; descargar una sola variante requiere usar `hf download` con el nombre de archivo concreto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/axteam/GLM-4-32B-0414-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4-32B-0414
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
