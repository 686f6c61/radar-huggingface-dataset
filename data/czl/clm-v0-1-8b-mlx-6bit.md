# czl/CLM-v0.1-8B-MLX-6bit

## Resumen

CLM-v0.1-8B-MLX-6bit es la conversión a MLX, en cuantización de 6 bits, de la mitad encoder del modelo contrastivo `Contrastive-LM/CLM-v0.1-8B`. Lo publica el usuario `czl` y está pensado para ejecutarse en Apple Silicon mediante MLX. No es un modelo generativo de propósito general: su `pipeline_tag` es `feature-extraction` y su función es producir embeddings de última posición (last-token pooling) para tareas de verificación, reranking y planificación dentro de agentes.

El modelo deriva de una arquitectura Qwen3 de 8B (el comando de conversión documentado parte de `Qwen/Qwen3-8B`), con 8.190.735.360 parámetros totales y un repositorio de 7,3 GB en safetensors. Se distribuye bajo licencia Apache 2.0, solo soporta inglés y se apoya en `mlx-lm` 0.31.3 para la cuantización affine por grupos con `group_size=32`, una decisión poco habitual frente a los valores por defecto de 64 (mlx-lm) y 128 (repos `mlx-community` de Qwen3-8B).

Su relevancia actual es doble. Por un lado, cubre un hueco práctico: `mlx_lm` es generate-only y no expone endpoint de embeddings, así que el repositorio incluye `clm_mlx/`, un pase de pooling y un servidor compatible con `/v1/embeddings` de OpenAI. Por otro, documenta con números medidos el coste de calidad de cada ancho de cuantización, con una advertencia explícita: la variante de 4 bits no es apta para ranking.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (mitad encoder de un modelo contrastivo); pooling de última posición sobre los hidden states post-RMSNorm |
| Parámetros totales | 8.190.735.360 (≈8,19 mil millones) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de uso del repositorio configura `max_tokens=2048`) |
| Tipos de cuantización | MLX affine con escala y sesgo bf16 por grupo: 4-bit, 6-bit y 8-bit. Este repositorio es la variante de 6 bits con `group_size=32` |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 (`license_link` apunta al LICENSE de Qwen3-8B) |
| Formato de pesos | safetensors en formato MLX, con los pesos en la raíz del repositorio para que `mlx_lm.load` y el explorador de ficheros de HuggingFace funcionen; `heads/` también en safetensors |
| Librería | `mlx` |
| Tamaño del repositorio | 7,3 GB |
| Modelo base | `Contrastive-LM/CLM-v0.1-8B` (relación: quantized) |
| Pipeline | `feature-extraction` |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-27 / 2026-09-27 |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO): esos datos corresponden a `Contrastive-LM/CLM-v0.1-8B` y no se detallan en esta ficha. Lo que sí se documenta es la arquitectura de inferencia: el repositorio contiene la mitad encoder del modelo, y el pase de pooling se implementa sobre las tripas de `mlx_lm`. En concreto, `Qwen3Model.__call__` ya devuelve `self.norm(h)`, los hidden states posteriores al RMSNorm final, que es exactamente lo que devuelve el pooling runner de vLLM en modo last-token. Esa equivalencia es la que permite reproducir los resultados publicados del modelo padre sin depender de vLLM.

El trabajo técnico destacable está en la cuantización. Se usó `mlx-lm` 0.31.3 con una pasada de `mlx_lm.convert` por ancho (`mlx_lm.convert --hf-path Qwen/Qwen3-8B --mlx-path <dir> -q --q-bits N --q-group-size 128`), en modo affine. El autor argumenta que el `group_size` es un parámetro de calidad de primer orden y no un detalle de redondeo: MLX affine almacena una escala bf16 y un sesgo bf16 por grupo, es decir, 32 bits de metadatos por grupo. Con `group_size=128` los bloques son cuatro veces más gruesos que los bloques de 32 pesos de ggml y además almacenan las escalas con la mantisa de 8 bits de bf16 frente a los 11 bits de fp16 de ggml. El resultado medido es que afinar el grupo a 32 mejora de forma monótona: cada 0,25 bits por peso invertidos en grupos más finos devolvieron más precisión de la que costaron.

La ablación de `group_size` documentada (parcialmente truncada en la model card facilitada) es la siguiente:

| Ancho | Grupo | bpw | top-1 | Decisivas (>1 nat) | Franja 0,25–1,0 nat | Δ precisión del planner |
|---|---|---|---|---|---|---|
| 8-bit | 128 | 8,250 | 0,9461 | 7440/7440 | 0,9588 | −2,60 pts |
| 8-bit | 64 | 8,500 | 0,9849 | 7440/7440 | 0,9990 | −0,59 pts |
| 8-bit | 32 | 9,000 | 0,9888 | 7440/7440 | 1,0000 | −0,46 pts |
| 6-bit | 128 | 6,250 | 0,9459 | 7440/7440 | 0,9487 | −4,(truncado) |

## Capacidades

- Generación de embeddings de texto para búsqueda semántica, similitud y recuperación, mediante pooling de última posición sobre los hidden states normalizados.
- Verificación y puntuación de respuestas: el repositorio se etiqueta como `verifier` y se evaluó sobre 23.926 preguntas "System One" puntuadas a través de la pila real de cabezas (`argmax(scale · cos)` con `scale = 100.0`).
- Reranking de candidatos: los tags incluyen `reranker`, y la evaluación mide el acierto top-1 frente a una referencia bf16.
- Clasificación por etiquetas: los casos documentados `anchor-invoice/department` (etiqueta `billing` con 0,98818 frente a `technical` con 0,01182) y `anchor-tides/rank` (etiqueta `0` con 0,99386) muestran uso como clasificador de decisión única.
- Soporte para agentes y planificación: la métrica "planner accuracy" se calcula contra el planner físico T-Rex, lo que indica integración en bucles de decisión multi-paso.
- Servicio de embeddings compatible con la API de OpenAI: `python -m clm_mlx.server --model <dir> --port 8092` expone `/v1/embeddings`, y `clm-serve --emb-url http://127.0.0.1:8092/v1/embeddings` lo consume.
- Uso en proceso: `from clm_mlx import Encoder; vecs, tokens = Encoder("<dir>", max_tokens=2048).embed([...])`.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- No se documentan capacidades de visión, audio, tool calling ni modo de razonamiento explícito.

## Casos de uso

- Reranking en pipelines RAG: dado un conjunto de pasajes recuperados por un buscador vectorial, el modelo puntúa cada candidato con el coseno de su embedding y reordena la lista antes de pasarla al generador. Es adecuado porque su evaluación se hizo precisamente sobre decisiones top-1 y sobre la franja de márgenes entre 1 y 0,25 nats.
- Verificación de respuestas en agentes: el modelo actúa como `verifier` puntuando si una respuesta candidata es correcta antes de ejecutarla. El `scale = 100.0` de la cabeza amplifica 100 veces el error de coseno, así que el margen medido (cos minima de 0,89642 en 6 bits) es el indicador realista de fiabilidad.
- Planificación en agentes físicos: la métrica "planner accuracy" se mide contra el planner T-Rex, de modo que el encoder puede integrarse en bucles de decisión donde hay que elegir una acción entre varias y detectar cuándo la elección es dudosa.
- Clasificación y enrutado de tickets o documentos: el caso `anchor-invoice/department` demuestra que el modelo asigna una etiqueta con confianza calibrada (`billing`=0,98818), suficiente para enrutar por umbral sin un clasificador adicional.
- Búsqueda semántica local en Apple Silicon: desplegando el servidor `clm_mlx` en un Mac, el modelo indexa y consulta un corpus en inglés sin salir del equipo, con 7,3 GB de pesos en disco.
- Deduplicación y agrupamiento de textos: los embeddings normalizados permiten umbrales de coseno estables para agrupar documentos casi idénticos, usando la misma tubería de pooling que los casos evaluados.
- Filtrado previo de candidatos en sistemas multi-etapa: al ser una variante de 6 bits, se puede usar como primera pasada barata y reservar una ejecución bf16 para el subconjunto dudoso, dado que en la franja 0,25–1,0 nat el 6 bits con `group_size=32` mantiene decisiones pero no de forma perfecta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Lo que sí se publica es una evaluación de **fidelidad de cuantización** frente a una referencia bf16 del mismo encoder ejecutada en el mismo runtime, sobre 23.926 preguntas System One, a través de la pila real de cabezas:

| Variante | cos mín. | cos media | top-1 | top-1 (decisivas) | Δ precisión del planner | Veredicto |
|---|---|---|---|---|---|---|
| bf16 | – | – | 1,0000 (ref.) | 1,0000 (ref.) | – | referencia |
| 8-bit | 0,98294 | 0,99985 | 0,9888 | 1,0000 | −0,46 pts | sí |
| 6-bit (este repo) | 0,89642 | 0,99918 | 0,9828 | 1,0000 | +0,70 pts | sí |
| 4-bit | 0,87825 | 0,99191 | 0,6186 | 0,8897 | −31,95 pts | no |

La línea de aceptación exige `top-1 >= 1,0000` (el suelo de ruido medido bf16-contra-bf16 de este corpus en este runtime), `top-1 (decisivas) >= 0,995` —donde "decisiva" significa que el top-1 de la referencia lideraba por más de 1 nat— y el cambio de precisión del planner. La variante de 4 bits queda explícitamente descartada para ranking: su acuerdo en decisiones decisivas es 0,889651, por debajo del umbral de 0,995, y la precisión del planner cae 31,95 puntos.

Comprobación cruzada contra el modelo padre:

| Caso | Model card (vLLM bf16) | Este runtime (referencia bf16) |
|---|---|---|
| `anchor-invoice/department` | `billing` | `billing` — el argmax coincide; `billing`=0,98818, `technical`=0,01182 |
| `anchor-tides/rank` | `0` | `0` — el argmax coincide; `0`=0,99386, `1`=0,00003, `2`=0,00611 |

Las probabilidades publicadas procedían de vLLM bf16. Este runtime reproduce el argmax en ambos casos y concuerda con una build independiente de llama.cpp en bf16 con un coseno mínimo de 0,998680 y una media de 0,999958 sobre los 4.448 textos, por lo que la diferencia residual se atribuye a numerics bf16 entre runtimes y no a un error de pooling o de tokenización. La tokenización es idéntica byte a byte a `AutoTokenizer`, sin BOS ni EOS.

## Requisitos de hardware

- Peso de los ficheros: 7,3 GB en safetensors de 6 bits. La variante `outq2`, con `lm_head` a 2 bits, es 233 MB más pequeña y queda restringida a pooling, no a generación.
- Memoria unificada estimada: a partir del tamaño del repositorio, hacen falta al menos unos 8 GB libres para los pesos, y del orden de 10–12 GB para trabajar con comodidad contando activaciones y pooling. Es una estimación derivada del tamaño del repo, no un dato publicado por el autor.
- Plataforma soportada: exclusivamente Apple Silicon (MLX). El modelo no está pensado para CUDA. La evaluación del modelo padre se hizo con vLLM bf16 y existe una build independiente de llama.cpp bf16, pero este repositorio concreto es MLX.
- GPU recomendadas: no disponibles en el sentido de tarjetas NVIDIA/AMD; el destino natural son Macs con chip de la serie M (M1 y posteriores) con memoria unificada suficiente. No se publican recomendaciones por modelo de GPU.
- Opciones de despliegue: `mlx_lm.load("czl/CLM-v0.1-8B-MLX-6bit")` desde el Hub, el servidor `python -m clm_mlx.server --model <dir> --port 8092` con endpoint `/v1/embeddings` compatible con OpenAI, y el cliente `clm-serve`. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con modelos de terceros. Lo que sí permite es comparar las variantes de cuantización de la misma familia, que es donde están los datos medidos:

| Variante | bpw / grupo | top-1 | Decisivas (>1 nat) | Δ planner | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CLM-v0.1-8B-MLX-6bit (este repo) | 6 bits, grupo 32 | 0,9828 | 1,0000 | +0,70 pts | Apache 2.0 | HuggingFace, MLX |
| CLM-v0.1-8B-MLX-8bit | 8 bits, grupo 32 | 0,9888 | 1,0000 | −0,46 pts | Apache 2.0 | HuggingFace, MLX |
| CLM-v0.1-8B-MLX-4bit | 4 bits | 0,6186 | 0,8897 | −31,95 pts | Apache 2.0 | HuggingFace, MLX; no recomendado para ranking |
| CLM-v0.1-8B-MLX (bf16) | 16 bits | 1,0000 (ref.) | 1,0000 (ref.) | – | Apache 2.0 | HuggingFace, MLX; referencia |
| CLM-v0.1-8B-MLX-6bit-outq2 | 6 bits con `lm_head` a 2 bits | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace, MLX; solo pooling |

Comparativa con alternativas externas de la misma categoría (encoders de embeddings de ~8B): no disponible.

## Limitaciones y advertencias

- Solo inglés. No hay soporte multilingüe declarado, y la tokenización es byte-idéntica a `AutoTokenizer` sin BOS ni EOS, lo que condiciona cualquier uso fuera de ese idioma.
- No es un modelo generativo de propósito general: el pipeline es `feature-extraction` y la variante `outq2` está limitada explícitamente a pooling, no a generación.
- La variante de 4 bits está marcada como **no recomendada para ranking** por el propio autor: el acuerdo en decisiones decisivas cae a 0,889651, por debajo del umbral de 0,995, y la precisión del planner se desploma 31,95 puntos.
- Pérdida de fidelidad por cuantización: en 6 bits la similitud de coseno mínima frente a bf16 es 0,89642 (aunque la media sea 0,99918). Con `scale=100.0` en la cabeza, el error de coseno se amplifica 100 veces, así que los márgenes pequeños son sensibles.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de decisión errónea con márgenes bajos, sobre todo en la franja de 0,25–1,0 nat, donde la fidelidad del 6 bits es alta pero no perfecta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el `license_link` remite al LICENSE de Qwen3-8B, y conviene verificar la cadena de licencias del modelo base `Contrastive-LM/CLM-v0.1-8B` antes de un despliegue comercial.
- Dependencia de plataforma: MLX ata el despliegue a Apple Silicon. No hay rutas oficiales a CUDA, vLLM o llama.cpp dentro de este repositorio.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente más allá de la comparación con llama.cpp bf16 reportada por el autor.
- La model card facilitada está truncada en la tabla de ablación de `group_size`, por lo que los datos de la franja 6-bit/grupo 128 están incompletos.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo, toxicidad o equidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/czl/CLM-v0.1-8B-MLX-6bit
- Variante de 4 bits: https://huggingface.co/czl/CLM-v0.1-8B-MLX-4bit
- Variante de 8 bits: https://huggingface.co/czl/CLM-v0.1-8B-MLX-8bit
- Referencia bf16: https://huggingface.co/czl/CLM-v0.1-8B-MLX
- Variante con `lm_head` a 2 bits (solo pooling): https://huggingface.co/czl/CLM-v0.1-8B-MLX-6bit-outq2
- Modelo base: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Paper, blog o demo adicionales: no disponible. Las búsquedas web realizadas devolvieron únicamente resultados sobre el aeropuerto de Constantine (código IATA CZL), sin relación con el modelo.
