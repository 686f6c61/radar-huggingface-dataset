# axteam/Nanbeige4.3-33B-GGUF

## Resumen

Nanbeige4.3-33B-GGUF es la distribucion cuantizada en formato GGUF del modelo Nanbeige4.3-33B, publicado por el usuario axteam. El modelo original pertenece a Nanbeige y cuenta con 33.118.977.024 parametros (aproximadamente 33.000 millones), empaquetados en pesos BF16 que aqui se convierten a cuantizaciones de 4 y 8 bits para su uso con llama.cpp, Ollama y LM Studio. La licencia es Apache-2.0.

El repositorio resuelve un problema practico muy concreto: hacer ejecutable un modelo denso de 33B en hardware de consumo o en GPUs de centro de datos con VRAM limitada, sin necesidad de reentrenar ni de recurrir al modelo original en BF16 (que no esta incluido en este repositorio). Se ofrecen dos ficheros: Q4_K_M (20,1 GB), que equilibra tamano y calidad, y Q8_0 (35,2 GB), que se aproxima mas a los pesos originales.

La relevancia actual radica en que el autor publica mediciones de perplejidad reales sobre GPU (NVIDIA B200, llama.cpp b12005) tanto en ingles (WikiText-2) como en coreano (muestra de Wikipedia en coreano), lo que permite evaluar la perdida de calidad de la cuantizacion con datos verificables. No se dispone de informacion sobre arquitectura interna, contexto maximo ni composicion del dataset de entrenamiento del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia `llama` segun llama.cpp); detalles internos no disponibles |
| Parametros totales | 33.118.977.024 (aproximadamente 33B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (los ejemplos de uso emplean `-c 8192`, pero no se confirma el maximo nativo) |
| Tipos de cuantizacion | Q4_K_M (4 bits, k-quant medium) y Q8_0 (8 bits) |
| Idiomas soportados | No disponible oficialmente; la model card incluye evaluacion en ingles y coreano, y plantilla de chat embebida |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio no incluye BF16 ni safetensors |

## Arquitectura y entrenamiento

El repositorio es una cuantizacion post-entrenamiento (PTQ) de los pesos BF16 del modelo Nanbeige4.3-33B, realizada con las herramientas de llama.cpp (`convert_hf_to_gguf.py` seguido de `llama-quantize`). La cuantizacion es por bloques con escalas por bloque y asignacion mixta de bits (k-quants), sin reentrenamiento ni ajuste fino posterior. Cada fichero GGUF incorpora la plantilla de chat (`chat_template`) original del modelo base, lo que permite usar el modo conversacional directamente en llama.cpp, Ollama o LM Studio.

llama.cpp identifica el modelo bajo la arquitectura `llama`, que requiere una compilacion igual o superior a b1405; las instrucciones de la model card emplean `-fa on` (flash attention), disponible desde b6325. El autor verifico la carga con todas las capas en GPU y midio perplejidad y respuestas conversacionales con la build b12005 (commit e0f142d, compilacion CUDA) sobre una NVIDIA B200 el 2 de noviembre de 2026. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat embebida en cada fichero GGUF.
- Respuesta a preguntas factuales breves (verificado por el autor con preguntas sobre las capitales de Francia y Corea).
- Procesamiento de texto en ingles y coreano, segun las muestras de evaluacion de perplejidad publicadas.
- Servicio mediante API compatible con OpenAI a traves de `llama-server` (endpoint `/v1/chat/completions`).
- Ejecucion en llama.cpp, Ollama y LM Studio (Ollama y LM Studio no verificados por el autor).
- Soporte de flash attention (`-fa on`) y cuantizacion del KV cache en tiempo de ejecucion (`--cache-type-k/v q8_0`).
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente conversacional autoalojado: desplegar `llama-server` con el fichero Q4_K_M y exponer una API compatible con OpenAI en el puerto 8080 para integrarla en una interfaz de chat propia, sin dependencia de servicios externos.
- Prototipado en estaciones de trabajo con una sola GPU: el Q4_K_M de 20,1 GB permite cargar todas las capas en GPU en tarjetas de 24 GB o mas, dejando margen para el KV cache con contextos de 8K.
- Evaluacion de calidad de cuantizacion: usar los datos de perplejidad publicados (WikiText-2 y Wikipedia en coreano) como referencia para decidir entre Q4_K_M y Q8_0 segun la tolerancia a la perdida de calidad (+1,9 % y +2,5 % frente a Q8_0 en ingles y coreano respectivamente).
- Procesamiento de texto en coreano: el modelo muestra una perplejidad notablemente baja en la muestra de Wikipedia en coreano (8,01 en Q8_0), lo que lo hace adecuado para tareas de generacion y resumen en ese idioma.
- Despliegue en entornos con memoria limitada: el uso de `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce a la mitad el KV cache, permitiendo contextos mayores en la misma VRAM.
- Integracion en flujos de trabajo de escritorio: carga directa en LM Studio u Ollama mediante `ollama run hf.co/axteam/Nanbeige4.3-33B-GGUF:Q4_K_M` para tareas de redaccion y asistencia local sin conexion.
- Servicio de inferencia por lotes: con el Q8_0 (35,2 GB) en GPUs de 40-80 GB se obtiene la variante mas fiel al original para tareas donde la calidad prima sobre el coste de memoria.

## Benchmarks y rendimiento

El autor publica unicamente mediciones de perplejidad (menor es mejor) sobre 16 ventanas de 2.048 tokens, con llama.cpp b12005 en una NVIDIA B200 y todas las capas en GPU. La referencia es Q8_0, ya que el repositorio no incluye BF16.

| Fichero | Perplejidad WikiText-2 (EN) | Perplejidad Wikipedia coreano | Diferencia vs Q8_0 (EN / KO) |
|---|---|---|---|
| Nanbeige4.3-33B-Q8_0.gguf | 22,75 | 8,01 | referencia |
| Nanbeige4.3-33B-Q4_K_M.gguf | 23,19 | 8,21 | +1,9 % / +2,5 % |

El propio autor advierte que 16 ventanas por texto es una muestra pequena y que diferencias de pocos puntos porcentuales entre ficheros estan dentro del ruido de muestreo (una remedicion con 64 ventanas movio dichas diferencias hasta unos 19 puntos). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 20,1 GB para Q4_K_M y 35,2 GB para Q8_0, mas el KV cache correspondiente al contexto configurado con `-c`.
- Reduccion de KV cache: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` aproximadamente lo divide por dos.
- GPU verificada por el autor: NVIDIA B200 (todas las capas en GPU, compilacion CUDA de llama.cpp b12005).
- GPU de consumo: el Q4_K_M cabe en tarjetas de 24 GB (por ejemplo RTX 3090 o RTX 4090) dejando margen para KV cache moderado; el Q8_0 requiere 40 GB o mas (A100 40/80 GB, H100, B200).
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama y LM Studio. Ollama y LM Studio no fueron probados por el autor.
- Version minima de llama.cpp: b6325 para las instrucciones con `-fa on`; b1405 para el soporte de la arquitectura `llama`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento en tareas del modelo base ni de sus alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros y formato.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (Q4_K_M, este repo) | 33B | No disponible | GGUF | Apache-2.0 | Perplejidad EN 23,19 / KO 8,21 |
| Nanbeige4.3-33B (Q8_0, este repo) | 33B | No disponible | GGUF | Apache-2.0 | Perplejidad EN 22,75 / KO 8,01 |
| Nanbeige/Nanbeige4.3-33B (original) | 33B | No disponible | BF16 (safetensors) | Apache-2.0 | Pesos de referencia sin cuantizar |
| Alternativas de 30-34B | No disponible | No disponible | No disponible | No disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones publicadas de factualidad en la informacion disponible.
- La evaluacion de calidad se limita a perplejidad sobre 16 ventanas por texto, muestra que el propio autor califica de pequena y ruidosa.
- Solo se han verificado respuestas correctas en dos preguntas breves (capitales de Francia y Corea); no hay evidencia de rendimiento en tareas complejas.
- El repositorio no incluye pesos BF16 ni safetensors, por lo que no es posible comparar directamente contra el original en este mismo espacio.
- La lista oficial de idiomas no esta disponible; la evidencia empirica cubre ingles y coreano, sin garantias para el castellano.
- Ollama y LM Studio no fueron probados por el autor; su funcionamiento no esta verificado.
- La licencia Apache-2.0 permite uso comercial, pero los derechos sobre los pesos y el tokenizador originales pertenecen a Nanbeige; conviene revisar la model card del modelo base antes de un despliegue en produccion.
- El contexto maximo nativo no esta documentado; los ejemplos usan 8192 tokens, pero no se confirma que sea el limite del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/axteam/Nanbeige4.3-33B-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- llama.cpp (repositorio y builds): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
