# czl/CLM-v0.1-8B-MLX-8bit

## Resumen

CLM-v0.1-8B-MLX-8bit es la variante cuantizada a 8 bits, para el framework MLX de Apple Silicon, del encoder contrastivo Contrastive-LM/CLM-v0.1-8B, a su vez derivado de Qwen/Qwen3-8B. No es un modelo generativo: es un encoder de embeddings con pooling de último token, pensado para producir vectores normalizados que después se puntúan como `argmax(scale · cos)` con `scale = 100.0`. El repositorio incluye además la cabeza de clasificación en formato safetensors, el contrato de pooling y un servidor compatible con `/v1/embeddings` de OpenAI.

El modelo resuelve un problema muy concreto dentro de pipelines de agentes: actuar como verificador, reranker y planificador, decidiendo entre alternativas (por ejemplo, clasificar una factura en el departamento `billing` o resolver un ranking de opciones en un problema de física). Con 8.190.735.360 parámetros totales y un tamaño de repositorio de 9,3 GB, está diseñado para ejecutarse íntegramente en local sobre chips de la serie M.

La relevancia de esta ficha está en su naturaleza de artefacto de cuantización medido: el autor publica la degradación exacta de cada anchura (4, 6 y 8 bits) frente a una referencia bf16 del mismo runtime, y concluye que la variante de 4 bits no es apta para ranking. Además, la cuantización de 8 bits no usa el `group_size` por defecto, sino 32, lo que eleva el coste a 9,0 bits por peso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 adaptado como encoder contrastivo; pooling de último token sobre los hidden states post-RMSNorm (`self.norm(h)`) |
| Parámetros totales | 8.190.735.360 (8,19 B) |
| Longitud de contexto | no disponible (el ejemplo de uso del autor fija `max_tokens=2048`) |
| Tipos de cuantización | MLX affine, 8 bits con `group_size=32` (9,000 bits por peso, escala y sesgo bf16 por grupo); la familia incluye también 4 bits y 6 bits |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (enlazada a la licencia de Qwen/Qwen3-8B) |
| Formato de pesos | safetensors con layout `mlx-community` en la raíz del repositorio; `heads/CLM_v0.1-8B.pt` convertido a safetensors |
| Modelo base | Contrastive-LM/CLM-v0.1-8B (relación: quantized) |
| Pipeline | feature-extraction |
| Biblioteca | mlx |
| Tamaño del repositorio | 9,3 GB |
| Tokenizador | byte-idéntico a `AutoTokenizer`, sin BOS ni EOS |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B (transformer decoder-only), pero el modelo se usa como encoder. La innovación de empaquetado es que `mlx_lm` es generate-only y `mlx_lm.server` solo enruta `/v1/completions`, `/v1/chat/completions`, `/v1/models` y `/health`; por eso el repositorio aporta `clm_mlx/`, un pase de pooling sobre las tripas de `mlx_lm` que reutiliza el hecho de que `Qwen3Model.__call__` ya devuelve `self.norm(h)`, los hidden states posteriores al RMSNorm final. Eso reproduce lo que devuelve el pooling runner de vLLM en modo last-token. El repositorio incluye asimismo `clm_mlx.json`, que define el contrato de pooling, embedding y escala.

En cuanto al proceso de cuantización, se hizo con mlx-lm 0.31.3 mediante una pasada de `mlx_lm.convert` por anchura, en modo affine, con escala y sesgo bf16 por grupo. El hallazgo técnico central es el `group_size = 32`, que contradice los dos valores por defecto habituales (64 en mlx-lm, 128 en los repos `mlx-community` de Qwen3-8B). Como MLX almacena una escala y un sesgo bf16 por grupo, el tamaño de grupo deja de ser un detalle de redondeo y se convierte en un parámetro de calidad de primer orden: 128 es cuatro veces más grueso que los bloques de 32 pesos de ggml y además guarda las escalas con la significand de 8 bits de bf16 frente a los 11 bits de fp16 de ggml. El autor documenta que cada 0,25 bits por peso invertido en grupos más finos recuperó más precisión de la que costó, de forma monótona.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La evaluación sí menciona un corpus de 23.926 preguntas puntuadas de "System One" y un planificador de física denominado T-Rex.

## Capacidades

- Generación de embeddings de texto con pooling de último token y servidor compatible con el endpoint `/v1/embeddings` de OpenAI.
- Verificación de respuestas: puntuación de alternativas mediante `argmax(scale · cos)`, con `scale = 100.0`, lo que amplifica 100 veces cualquier error de coseno.
- Reranking de candidatos, tanto en decisiones amplias como en decisiones "decisivas" (cuando la referencia supera a la segunda opción por más de 1 nat).
- Clasificación mediante la cabeza incluida en `heads/`: el caso documentado `anchor-invoice/department` resuelve `billing` con 0,98818 frente a `technical` con 0,01182.
- Ranking de opciones: el caso `anchor-tides/rank` devuelve `0` con 0,99386, `1` con 0,00003 y `2` con 0,00611.
- Planificación física: cambio de precisión de −0,46 puntos frente a la etiqueta del planificador de física T-Rex, dentro del presupuesto de 3,0 puntos.
- Integración en pipelines de agentes: las etiquetas del repositorio incluyen `verifier`, `reranker` y `agents`.
- Uso como extractor de características para búsqueda semántica, deduplicación y clustering mediante similitud coseno.
- Idiomas: únicamente inglés.
- No soporta generación de texto: es un encoder de pooling.

## Casos de uso

- Reranking en pipelines RAG: dado un conjunto de documentos recuperados por un índice vectorial, el modelo reordena los candidatos puntuando cada par consulta-documento con `argmax(scale · cos)`; su condición de decisión "decisiva" (>1 nat) se cumple al 100% frente a la referencia bf16 en el corpus medido, lo que lo hace fiable para descartar candidatos claramente peores.
- Verificación de salidas de agentes: en un bucle multi-paso, el modelo actúa como verificador que compara la respuesta propuesta con alternativas y decide si la acción es correcta antes de ejecutarla, evitando pasos erróneos en cadenas de razonamiento.
- Clasificación de documentos empresariales: el ejemplo `anchor-invoice/department` muestra que puede asignar una factura al departamento correspondiente a partir de su embedding, con una separación de casi dos órdenes de magnitud entre la primera y la segunda clase.
- Búsqueda semántica local en Mac: desplegando `clm_mlx.server` en el puerto 8092 y apuntando el cliente con `clm-serve --emb-url`, se obtiene un servicio de embeddings OpenAI-compatible que no requiere GPU NVIDIA ni salida de datos a la nube.
- Memoria de agentes: almacenar los vectores de interacciones previas y recuperar los más similares por coseno para inyectarlos como contexto en pasos posteriores.
- Deduplicación y clustering de corpus: con 4.448 textos, la concordancia coseno frente a una build bf16 independiente de llama.cpp tuvo un mínimo de 0,998680 y una media de 0,999958, un margen adecuado para agrupar textos casi idénticos.
- Evaluación de robustez de cuantizaciones: el repositorio sirve como referencia reproducible para medir cómo afecta cada anchura a una tarea de decisión; el autor publica los números medidos para que el resultado se pueda replicar.
- Prototipado en Apple Silicon: cargable directamente con `mlx_lm.load("czl/CLM-v0.1-8B-MLX-8bit")` o en proceso con `Encoder("<dir>", max_tokens=2048).embed([...])`, lo que permite iterar sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas de esa familia). Lo que sí se publica es una evaluación de concordancia frente a una referencia bf16 del mismo encoder ejecutada en el mismo runtime, sobre 23.926 preguntas puntuadas de System One, a través de la pila de cabezas real (`argmax(scale · cos)`, `scale = 100.0`).

| Variante | cos mín. | cos media | top-1 | top-1 (decisivas) | Δ precisión planificador | Veredicto |
|---|---|---|---|---|---|---|
| bf16 | – | – | 1,0000 (ref.) | 1,0000 (ref.) | – | referencia |
| 8bit (este repo) | 0,98294 | 0,99985 | 0,9888 | 1,0000 | −0,46 pts | sí |
| 6bit | 0,89642 | 0,99918 | 0,9828 | 1,0000 | +0,70 pts | sí |
| 4bit | 0,87825 | 0,99191 | 0,6186 | 0,8897 | −31,95 pts | no |

La línea de corte del autor exige `top-1 >= 1,0000` (el suelo de ruido medido bf16 contra bf16 en ese corpus y runtime) y `top-1 (decisivas) >= 0,995`, donde "decisiva" significa que el top-1 de la referencia lideraba por más de 1 nat. La variante de 4 bits queda explícitamente desaconsejada para ranking: su acuerdo en decisiones decisivas cae a 0,889651, por debajo de 0,995, y la precisión del planificador se hunde 31,95 puntos, muy por encima del presupuesto de 3,0 puntos.

Ablación del tamaño de grupo documentada por el autor:

| Anchura | Grupo | bits/peso | top-1 | decisivas (>1 nat) | 0,25–1,0 nat | Δ precisión planificador |
|---|---|---|---|---|---|---|
| 8-bit | 128 | 8,250 | 0,9461 | 7440/7440 | 0,9588 | −2,60 pts |
| 8-bit | 64 | 8,500 | 0,9849 | 7440/7440 | 0,9990 | −0,59 pts |
| 8-bit | 32 | 9,000 | 0,9888 | 7440/7440 | 1,0000 | −0,46 pts |
| 6-bit | 128 | 6,250 | 0,9459 | 7440/7440 | 0,9487 | −4,00 pts (dato truncado en la información disponible) |

Contraste con los números publicados en la model card del modelo padre (obtenidos con vLLM en bf16):

| Caso | Model card (vLLM bf16) | Este runtime (referencia bf16) |
|---|---|---|
| `anchor-invoice/department` | `billing` | `billing`; argmax coincide, `billing`=0,98818, `technical`=0,01182 |
| `anchor-tides/rank` | `0` | `0`; argmax coincide, `0`=0,99386, `1`=0,00003, `2`=0,00611 |

La diferencia residual se atribuye a numerics bf16 entre runtimes, no a un error de pooling o tokenización: la concordancia con una build bf16 independiente de llama.cpp es de 0,998680 mínimo y 0,999958 de media sobre 4.448 textos, y la tokenización es byte-idéntica a `AutoTokenizer`.

## Requisitos de hardware

- Plataforma: MLX requiere Apple Silicon. Este repositorio no está pensado para CUDA ni para GPUs de escritorio NVIDIA o AMD.
- Memoria: el repositorio ocupa 9,3 GB con los pesos en 8 bits y un `group_size=32` que eleva el coste a 9,0 bits por peso. Se necesita memoria unificada holgada por encima de ese tamaño; un Mac con 16 GB de memoria unificada es el mínimo razonable para inferencia, y 24-32 GB o más deja margen para lotes de secuencias y para el servidor de embeddings.
- Chips recomendados: cualquier Apple Silicon con memoria unificada suficiente; los chips Pro, Max y Ultra (M1/M2/M3/M4) son los candidatos naturales por ancho de banda y capacidad. No se dispone de cifras de latencia ni throughput medidas en la información disponible.
- Despliegue desde el Hub: `mlx_lm.load("czl/CLM-v0.1-8B-MLX-8bit")`, ya que mlx-lm carga repositorios MLX de forma nativa.
- Servidor de embeddings: `python -m clm_mlx.server --model <dir> --port 8092`, con el cliente apuntado mediante `clm-serve --emb-url http://127.0.0.1:8092/v1/embeddings`.
- Uso en proceso: `from clm_mlx import Encoder` y `Encoder("<dir>", max_tokens=2048).embed([...])`.
- Otras herramientas: vLLM y llama.cpp aparecen en la documentación únicamente para las comparaciones en bf16, no como vías de despliegue de esta variante cuantizada en MLX. No hay información disponible sobre Ollama ni TGI para este repositorio.
- Variante de menor tamaño: `czl/CLM-v0.1-8B-MLX-8bit-outq2` reduce 389 MB al poner `lm_head` a 2 bits, con embeddings indistinguibles de una re-ejecución según la medición del autor; es solo para pooling, no para generación.

## Comparativa con modelos similares

La comparación más directa es con los hermanos de cuantización del mismo encoder, ya que se midieron en el mismo runtime y sobre el mismo corpus:

| Modelo | Parámetros | Cuantización | bits/peso | top-1 | top-1 (decisivas) | Δ planificador | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| czl/CLM-v0.1-8B-MLX (bf16) | 8,19 B | bf16 | 16 | 1,0000 (ref.) | 1,0000 (ref.) | – | apache-2.0 | pública |
| czl/CLM-v0.1-8B-MLX-8bit (este) | 8,19 B | MLX affine 8-bit, gs=32 | 9,000 | 0,9888 | 1,0000 | −0,46 pts | apache-2.0 | pública |
| czl/CLM-v0.1-8B-MLX-6bit | 8,19 B | MLX affine 6-bit | no disponible | 0,9828 | 1,0000 | +0,70 pts | apache-2.0 | pública |
| czl/CLM-v0.1-8B-MLX-4bit | 8,19 B | MLX affine 4-bit | no disponible | 0,6186 | 0,8897 | −31,95 pts | apache-2.0 | pública |

Frente a otros modelos de embeddings de propósito general (por ejemplo, la familia Qwen3-Embedding o alternativas tipo bge/e5), no hay datos en la información proporcionada que permitan una comparación de parámetros, contexto o rendimiento: no disponible.

## Limitaciones y advertencias

- Solo inglés: el campo `language` declara únicamente `en`. No hay evidencia de capacidades multilingües.
- No es un modelo generativo: es un encoder con pooling de último token. La variante `outq2` se declara explícitamente "pooling only, not for generation", y este repositorio comparte la misma arquitectura de uso.
- La variante de 4 bits del mismo modelo no debe usarse para ranking: acuerdo en decisiones decisivas de 0,889651 frente al umbral de 0,995 y caída de 31,95 puntos en la precisión del planificador. Si se elige una cuantización agresiva, ese es el resultado medido.
- El coste real de esta variante no es el nominal: `group_size=32` la lleva a 9,000 bits por peso y a un repositorio de 9,3 GB, más pesado que una cuantización de 8 bits con los valores por defecto (que rinde peor: top-1 0,9461 con gs=128).
- La escala multiplicativa `scale = 100.0` amplifica 100 veces el error de coseno, lo que hace que diferencias pequeñas de similitud se conviertan en cambios de argmax. Cualquier cambio de runtime, de tokenizador o de modo de pooling puede mover las decisiones.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; las cifras provienen de la evaluación del propio autor.
- No se publican datos sobre sesgos, tasas de alucinación del planificador fuera del corpus medido, ni comportamiento con entradas fuera de dominio.
- Licencia apache-2.0, permisiva para uso comercial, pero heredada de Qwen/Qwen3-8B; conviene revisar el aviso de licencia enlazado por el autor.
- No se especifica la longitud de contexto soportada; el único valor documentado es el `max_tokens=2048` de los ejemplos, por lo que no debe asumirse una ventana mayor sin verificación empírica.
- Requiere Apple Silicon: no hay ruta de despliegue documentada en esta ficha para CUDA, Ollama, TGI o vLLM con estos pesos cuantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/czl/CLM-v0.1-8B-MLX-8bit
- Variante de 4 bits: https://huggingface.co/czl/CLM-v0.1-8B-MLX-4bit
- Variante de 6 bits: https://huggingface.co/czl/CLM-v0.1-8B-MLX-6bit
- Referencia bf16: https://huggingface.co/czl/CLM-v0.1-8B-MLX
- Variante con `lm_head` a 2 bits: https://huggingface.co/czl/CLM-v0.1-8B-MLX-8bit-outq2
- Modelo base contrastivo: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Modelo de origen: https://huggingface.co/Qwen/Qwen3-8B
- Licencia enlazada por el autor: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Framework MLX: https://github.com/ml-explore/mlx
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden al aeropuerto de Constantina (código IATA CZL) y a tablas de llegadas y salidas, sin relación con este repositorio.
