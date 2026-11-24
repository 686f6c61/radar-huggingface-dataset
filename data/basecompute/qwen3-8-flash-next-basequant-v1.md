# basecompute/Qwen3.8-Flash-Next-BaseQuant-V1

## Resumen

Qwen3.8-Flash-Next-BaseQuant-V1 es una cuantizacion del modelo Qwen/Qwen3.8-Flash-Next publicada por el usuario basecompute en formato `.base`, un bundle propietario para el runtime baseRT. No se trata de un modelo nuevo entrenado desde cero, sino de una compilacion cuantizada del modelo base de Qwen orientada a despliegue en hardware con memoria unificada (el autor indica que se construyo y midio en un Apple M3 Ultra). El bundle contiene unicamente el modelo de lenguaje: no incluye la torre de vision ni la cabeza MTP del modelo original.

La relevancia de esta publicacion es doble. Por un lado, demuestra una via de cuantizacion alternativa a GGUF con metricas de fidelidad frente al modelo BF16 (divergencia KL sobre texto reservado). Por otro, expone una limitacion practica importante: requiere una version de baseRT con el codificador `qwen4_exp` que todavia no esta en ninguna release publica, solo en un PR interno. El repositorio ocupa 140,3 GB, aunque en GPU residen 81,43 GB de pesos, ya que la tabla de embeddings n-gram por capa (28,8 GB) se recolecta desde memoria host.

El modelo no cuenta con descargas ni likes en el momento de la consulta, y no se dispone de informacion sobre arquitectura, numero de parametros, contexto o idiomas en la documentacion proporcionada. Toda la informacion tecnica disponible gira en torno al proceso de cuantizacion, las metricas de fidelidad y el rendimiento medido en el runtime baseRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-Flash-Next; el bundle contiene solo el modelo de lenguaje, sin torre de vision ni cabeza MTP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BaseQuant V1 en bundle `.base` para baseRT; tamano Medium (140,32 GB en disco, 81,43 GB residentes en GPU) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | bundle `.base` propietario de baseRT; no existe build GGUF de esta version |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Qwen/Qwen3.8-Flash-Next en la documentacion proporcionada: no se detalla si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de parametros, tokens de entrenamiento o tecnicas de alineacion (RLHF, DPO). El bundle BaseQuant V1 conserva unicamente el modelo de lenguaje, excluyendo explicitamente la torre de vision y la cabeza MTP (multi-token prediction) del modelo original.

La innovacion tecnica documentada es el propio proceso de cuantizacion BaseQuant V1 y su evaluacion. El autor reporta la divergencia KL de la distribucion del siguiente token respecto al modelo BF16 sobre 58 prompts en diez categorias y 31.519 tokens puntuados, con un conjunto de evaluacion que no se uso para construir el archivo. Ademas, el bundle incorpora una tabla de embeddings n-gram por capa de 28,8 GB que se recolecta desde memoria host en lugar de mantenerse residente, lo que explica la diferencia entre el tamano en disco (140,32 GB) y la huella en GPU (81,43 GB). El formato requiere un runtime baseRT con el codificador `qwen4_exp`, disponible solo en el PR interno #911 sobre la version 0.5.3.

## Capacidades

- Generacion de texto: el bundle incluye el modelo de lenguaje completo del base, por lo que hereda sus capacidades de generacion, aunque no se detallan en la documentacion.
- Razonamiento y matematicas: la evaluacion de fidelidad incluye categorias de matematicas, ciencia e investigacion, lo que sugiere que el modelo base cubre estas areas, si bien no se aportan resultados de benchmarks de capacidad.
- Codigo y codificacion agentica: las categorias evaluadas incluyen "Code" y "Agentic coding", lo que indica que el modelo base esta orientado a tareas de programacion y flujos con agentes.
- Uso de herramientas: la evaluacion incluye una categoria especifica de "Tool use", lo que apunta a soporte de tool calling en el modelo base.
- Contexto largo: se evalua una categoria de "Long context", aunque no se especifica la longitud de contexto soportada.
- Multilingue: se evalua una categoria "Multilingual", sin detallar los idiomas cubiertos.
- Vision: no disponible en este bundle (la torre de vision del modelo original no esta incluida).
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Despliegue en estaciones de trabajo Apple Silicon con memoria unificada: el bundle esta pensado para ejecutarse con baseRT en equipos con 96 GB o mas de memoria unificada, como el M3 Ultra empleado por el autor, lo que permite servir el modelo en local sin GPUs dedicadas.
- Evaluacion de tecnicas de cuantizacion: investigadores pueden comparar la fidelidad de BaseQuant V1 frente a GGUF (por ejemplo, `UD-Q4_K_XL` de unsloth) usando el mismo conjunto de evaluacion y la metrica de divergencia KL reportada.
- Prototipado de asistentes de codigo en local: dado que el modelo base cubre codigo y codificacion agentica, el bundle puede emplearse para experimentar con generacion y revision de codigo en un entorno controlado, siempre que se disponga del runtime adecuado.
- Pruebas de pipelines de agentes con tool use: la categoria de evaluacion de uso de herramientas sugiere que el modelo base soporta function calling, lo que permite validar flujos multi-paso en local antes de pasar a produccion.
- Investigacion sobre decodificacion y latencia: el autor publica mediciones de prefill y decode en baseRT, utiles para estudiar el rendimiento de decodificacion en hardware con memoria unificada y comparar con otras pilas de inferencia.
- Analisis de contexto largo en local: la evaluacion incluye contexto largo y el autor mide decode a 16.384 tokens de contexto, lo que permite estudiar el comportamiento del modelo en conversaciones o documentos extensos dentro de esa ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas de fidelidad de cuantizacion (divergencia KL frente a BF16) y de throughput en baseRT.

Divergencia KL de la distribucion del siguiente token respecto a BF16 (menor es mejor):

| Categoria | Tokens | BaseQuant `.base` | unsloth `UD-Q4_K_XL` |
|---|---:|---:|---:|
| Agentic coding | 2.474 | 0,01160 | 0,01183 |
| Chat | 2.740 | 0,00664 | 0,00615 |
| Code | 2.883 | 0,01244 | 0,00864 |
| Long context | 2.048 | 0,01034 | 0,00964 |
| Math | 4.608 | 0,00367 | 0,00388 |
| Multilingual | 4.264 | 0,00229 | 0,00322 |
| Prose | 3.994 | 0,00973 | 0,00953 |
| Research | 1.801 | 0,01982 | 0,02816 |
| Science | 4.239 | 0,00437 | 0,00538 |
| Tool use | 2.468 | 0,00870 | 0,01126 |
| **Todos** | **31.519** | **0,00778** | **0,00830** |

Sobre los 31.519 tokens evaluados, el bundle BaseQuant cambia el siguiente token greedy 0 veces respecto a BF16, mientras que el build `UD-Q4_K_XL` lo cambia 1 vez.

Rendimiento en baseRT sobre M3 Ultra (PR #911, mediana de 3 ejecuciones):

| Metrica | Valor |
|---|---|
| Prefill a 512 tokens | 1.025 tok/s |
| Prefill a 4.096 tokens | 1.142 tok/s |
| Decode a 512 tokens de contexto | 60,6 tok/s |
| Decode a 4.096 tokens de contexto | 59,0 tok/s |
| Decode a 16.384 tokens de contexto | 57,1 tok/s |

## Requisitos de hardware

- Memoria: 96 GB o mas de memoria unificada; el autor construyo y midio el bundle en un Apple M3 Ultra.
- Huella en GPU: 81,43 GB de pesos residentes (el archivo en disco ocupa 140,32 GB por la tabla de embeddings n-gram de 28,8 GB que se recolecta desde memoria host).
- GPUs dedicadas (A100, H100, RTX 4090): no disponible; la documentacion solo cubre memoria unificada en Apple Silicon.
- Compatibilidad con GPU de consumo: no confirmada; 81,43 GB residentes superan la VRAM de cualquier GPU de consumo actual.
- Runtime: baseRT con el codificador `qwen4_exp`, disponible unicamente en el PR interno #911 sobre la version 0.5.3, que no esta en ninguna release publicada.
- Opciones de despliegue alternativas: no existe build GGUF de esta version; llama.cpp, vLLM, Ollama y TGI no estan documentados como compatibles con el formato `.base`.
- Latencia y throughput: prefill de 1.025-1.142 tok/s y decode de 57,1-60,6 tok/s en M3 Ultra con baseRT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Huella en GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-BaseQuant-V1 | no disponible | no disponible | `.base` (baseRT) | 81,43 GB | qwen-community-1.0 | Requiere runtime no publicado (PR #911) |
| unsloth `UD-Q4_K_XL` (mismo modelo base) | no disponible | no disponible | GGUF | 81,8 GB | qwen-community-1.0 | Publicado por unsloth; ejecutable en llama.cpp |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible | no disponible | safetensors (presumiblemente) | no disponible | qwen-community-1.0 | Publicado por Qwen |

La unica comparacion con datos en la informacion disponible es frente al GGUF `UD-Q4_K_XL` de unsloth, con una divergencia KL agregada de 0,00778 frente a 0,00830. No se dispone de datos de otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- El runtime necesario no esta publicado: requiere baseRT con el codificador `qwen4_exp`, disponible solo en el PR interno #911 sobre 0.5.3, por lo que el bundle no es ejecutable con herramientas publicas en el momento de la consulta.
- No existe build GGUF de esta version, lo que limita su uso a la pila baseRT.
- El bundle no incluye la torre de vision ni la cabeza MTP del modelo original, por lo que no puede realizar tareas multimodales ni aprovechar la prediccion multi-token.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; debe revisarse el texto completo en el enlace de licencia del modelo base antes de cualquier despliegue en produccion.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto del modelo base en la documentacion proporcionada.
- Las metricas de fidelidad se basan en 58 prompts y 31.519 tokens de un conjunto reservado; son indicativas y no sustituyen una evaluacion de capacidad en tareas reales.
- El rendimiento reportado corresponde exclusivamente a un M3 Ultra con una version no publicada de baseRT; no hay datos para otras GPU ni para otras configuraciones.
- El repositorio no registra descargas ni likes, y el autor no ofrece garantias de mantenimiento o soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/basecompute/Qwen3.8-Flash-Next-BaseQuant-V1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- PR interno de baseRT #911: https://github.com/basecompute/baseRT-internal/pull/911
