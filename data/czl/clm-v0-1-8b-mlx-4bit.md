# czl/CLM-v0.1-8B-MLX-4bit

## Resumen

CLM-v0.1-8B-MLX-4bit es la variante cuantizada a 4 bits del codificador (encoder) del modelo Contrastive-LM/CLM-v0.1-8B, preparada para MLX sobre Apple Silicon por el usuario czl. No es un modelo generativo: se publica con pipeline `feature-extraction` y su funcion es producir embeddings y puntuaciones de similitud, ademas de actuar como verificador y reranker dentro de sistemas de agentes. Arquitectonicamente deriva de Qwen3-8B, del que se reaprovecha la mitad encoder y cuya cabeza de lenguaje se conserva solo como componente residual.

El modelo se distribuye en formato MLX con pesos safetensors y un total de 8.190.735.360 parametros. La model card lo marca explicitamente como no recomendado para tareas de ranking en su configuracion de 4 bits: el acuerdo sobre decisiones "decisivas" (aquellas en las que la referencia bf16 lidera por mas de un nat) cae a 0,889651, por debajo del umbral de 0,995, y la precision del planificador fisico T-Rex se degrada 31,95 puntos. El autor publica estos numeros medidos para que el resultado sea reproducible, y ofrece alternativas de 6 y 8 bits que si superan el criterio.

La relevancia de esta ficha radica en que documenta con detalle un caso poco habitual: una cuantizacion cuyo `group_size` (32 en lugar de los 64 o 128 habituales) resulta determinante para la calidad de los embeddings, dado que MLX almacena escala y sesgo en bf16 por grupo y ese coste de metadatos convierte el tamano de grupo en un parametro de primer orden.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3-8B, usado como encoder (pooling sobre estados ocultos post-RMSNorm) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo oficial de uso emplea `max_tokens=2048` |
| Tipos de cuantizacion | 4 bits (esta variante); el autor ofrece tambien 6 bits, 8 bits, bf16 y una variante `4bit-outq2` con `lm_head` a 2 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout MLX, pesos en la raiz del repo) |

## Arquitectura y entrenamiento

El modelo es la mitad encoder del modelo base Contrastive-LM/CLM-v0.1-8B, que a su vez se apoya en Qwen3-8B (el comando de conversion usa `--hf-path Qwen/Qwen3-8B`). El pase de pooling se implementa sobre los internals de `mlx_lm`: `Qwen3Model.__call__` ya devuelve `self.norm(h)`, es decir, los estados ocultos posteriores a la RMSNorm final, que es exactamente lo que devuelve el pooling runner de vLLM en modo "last-token". El autor distribuye ademas las cabezas (`heads/CLM_v0.1-8B.pt` convertidas a safetensors) y un fichero `clm_mlx.json` con el contrato de pooling, embedding y escala. La pila de cabezas calcula `argmax(scale · cos)` con `scale = 100.0`, lo que amplifica cien veces cualquier error de coseno.

En cuanto a la cuantizacion, se realizo con mlx-lm 0.31.3 mediante una pasada de `mlx_lm.convert` por anchura, en modo affine con escala y sesgo bf16 por grupo. La decision tecnica central es `group_size = 32`, frente al valor por defecto de mlx-lm (64) y al de los repos `mlx-community` de Qwen3-8B (128). Segun el autor, ambos valores por defecto son peores en este caso: MLX gasta 32 bits por grupo en metadatos de cuantizacion (escala y sesgo bf16), de modo que un grupo mas fino compra mas precision de la que cuesta, de forma monotona. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento del modelo base, el numero de tokens ni el uso de RLHF o DPO.

## Capacidades

- Extraccion de caracteristicas y generacion de embeddings de texto (pipeline `feature-extraction`).
- Verificacion y reranking: el modelo esta disenado como verificador y reranker dentro de pipelines de agentes.
- Planificacion en agentes: se evalua contra el planificador fisico T-Rex (etiquetas de fisica).
- Similitud semantica mediante coseno sobre los embeddings, con pila de cabezas integrada.
- Servidor compatible con la API de OpenAI: `clm_mlx` expone un endpoint `/v1/embeddings`.
- Uso en proceso mediante la clase `Encoder` (`Encoder("<dir>", max_tokens=2048).embed([...])`).
- Multilingue: no; el modelo declara unicamente ingles.
- Generacion de texto: no; `mlx_lm` es generate-only pero este repo no esta pensado para generacion (el autor indica que la variante `outq2` es "pooling only, not for generation").

## Casos de uso

- Reranking de resultados de busqueda o de recuperacion documental: el modelo puntua pares consulta-documento mediante similitud coseno amplificada, lo que permite reordenar candidatos de un retriever antes de pasarlos a un LLM generativo.
- Verificacion de respuestas en sistemas RAG: dado un par (pregunta, respuesta candidata), el modelo actua como verificador y ayuda a descartar respuestas incoherentes con el contexto.
- Embeddings para RAG sobre Mac: al ejecutarse con MLX en Apple Silicon y ocupar 5,2 GB de repo, permite construir indices vectoriales en local sin GPU dedicada.
- Planificacion de agentes: la evaluacion oficial lo mide sobre 23.926 preguntas "System One" contra el planificador fisico T-Rex, de modo que puede integrarse como modulo de decision en agentes multi-paso.
- Clustering y deduplicacion semantica de corpus en ingles: los embeddings permiten agrupar documentos por similitud sin necesidad de anotaciones.
- Servicio de embeddings autoalojado: gracias al servidor OpenAI-compatible (`python -m clm_mlx.server --model <dir> --port 8092`), puede sustituir a APIs de embeddings en despliegues internos.
- Prototipado y evaluacion de cuantizacion en Apple Silicon: al publicar variantes de 4, 6, 8 bits y bf16 con numeros medidos, sirve como caso de estudio reproducible de como afecta la cuantizacion a un encoder.

## Benchmarks y rendimiento

Acuerdo frente a la referencia bf16 MLX del mismo encoder en el mismo runtime, sobre 23.926 preguntas "System One" puntuadas, atravesando la pila real de cabezas (`argmax(scale · cos)`, `scale = 100.0`):

| Variante | cos min | cos medio | top-1 | top-1 (decisivas) | Delta precision planificador | Veredicto |
|---|---|---|---|---|---|---|
| bf16 | - | - | 1,0000 (ref) | 1,0000 (ref) | - | referencia |
| 8bit | 0,98294 | 0,99985 | 0,9888 | 1,0000 | -0,46 pts | si |
| 6bit | 0,89642 | 0,99918 | 0,9828 | 1,0000 | +0,70 pts | si |
| 4bit | 0,87825 | 0,99191 | 0,6186 | 0,8897 | -31,95 pts | no |

Ablacion de `group_size` publicada por el autor (extracto de la tabla de cuantizacion):

| Anchura | Grupo | bpw | top-1 | decisivas (>1 nat) | 0,25-1,0 nat | Delta precision planificador |
|---|---|---|---|---|---|---|
| 8-bit | 128 | 8,250 | 0,9461 | 7440/7440 | 0,9588 | -2,60 pts |
| 8-bit | 64 | 8,500 | 0,9849 | 7440/7440 | 0,9990 | -0,59 pts |
| 8-bit | 32 | 9,000 | 0,9888 | 7440/7440 | 1,0000 | -0,46 pts |
| 6-bit | 128 | 6,250 | 0,9459 | 7440/7440 | 0,9487 | -4,2 pts (dato truncado en la fuente) |

Comparacion cruzada de runtime: sobre los casos publicados en la model card del modelo padre (vLLM bf16), este runtime reproduce el argmax en `anchor-invoice/department` (`billing`, con `billing`=0,98818 y `technical`=0,01182) y en `anchor-tides/rank` (`0`, con `0`=0,99386, `1`=0,00003 y `2`=0,00611). La tokenizacion es identica byte a byte a `AutoTokenizer`, sin BOS ni EOS. Frente a una build bf16 independiente en llama.cpp, el acuerdo alcanza un coseno minimo de 0,998680 y medio de 0,999958 sobre 4.448 textos.

## Requisitos de hardware

- VRAM/memoria unificada: el repo ocupa 5,2 GB, por lo que la inferencia a 4 bits requiere aproximadamente 6 GB de memoria unificada o mas, segun el runtime.
- Plataforma: MLX solo se ejecuta en Apple Silicon (familias M1, M2, M3, M4); no es compatible con GPU NVIDIA ni AMD via CUDA o ROCm con este formato.
- GPU recomendadas: no aplica en el sentido CUDA; el hardware objetivo son los chips Apple Silicon con memoria unificada suficiente.
- Cabe en equipos de consumo: si, en Mac con Apple Silicon y al menos 8 GB de memoria unificada (recomendable 16 GB o mas para trabajar comodamente junto al resto del pipeline).
- Opciones de despliegue: `mlx_lm.load`, el servidor `clm_mlx` compatible con `/v1/embeddings` y `clm-serve`; no se ofrecen variantes GGUF ni vLLM en este repo, aunque la model card menciona comparaciones contra vLLM y llama.cpp como referencias externas.
- Latencia y throughput: no disponible; el autor no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (top-1 decisivas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| czl/CLM-v0.1-8B-MLX-4bit | 8,19 B | no disponible (ejemplo a 2048) | 0,8897 (no recomendado) | apache-2.0 | MLX |
| czl/CLM-v0.1-8B-MLX-6bit | 8,19 B | no disponible | 1,0000 | apache-2.0 | MLX |
| czl/CLM-v0.1-8B-MLX-8bit | 8,19 B | no disponible | 1,0000 | apache-2.0 | MLX |
| czl/CLM-v0.1-8B-MLX (bf16) | 8,19 B | no disponible | 1,0000 (referencia) | apache-2.0 | MLX |

Comparativa frente a otros modelos de embeddings de la misma categoria (por ejemplo Qwen3-Embedding-8B): no disponible, no se han proporcionado datos de benchmarks de terceros en la informacion recibida.

## Limitaciones y advertencias

- Cuantizacion a 4 bits no apta para ranking: el acuerdo sobre decisiones decisivas es 0,889651, por debajo del umbral de paso de 0,995, y la precision del planificador cae 31,95 puntos; el propio autor lo desaconseja para esta tarea.
- Solo ingles: el modelo declara exclusivamente el idioma `en`; el rendimiento en otros idiomas no esta evaluado.
- No es generativo: el pipeline es `feature-extraction`; no debe usarse para producir texto y la variante `outq2` esta declarada explicitamente como "pooling only".
- Amplificacion del error: al aplicar `scale = 100.0` sobre el coseno, cualquier imprecision numerica de la cuantizacion se multiplica por cien en la decision final.
- Sensibilidad al runtime: los numeros de la model card se comparan contra una referencia bf16 del mismo runtime MLX; las diferencias frente a vLLM o llama.cpp se atribuyen a numerica bf16 entre runtimes, no a errores de pooling o tokenizacion.
- Restricciones de licencia: apache-2.0, uso comercial permitido; la licencia enlaza a la de Qwen3-8B, por lo que conviene revisar sus terminos heredados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero como verificador puede producir puntuaciones erroneas si los embeddings se degradan por la cuantizacion.
- Produccion: no se publican cifras de latencia ni throughput, y el numero de descargas y likes es cero, lo que indica que es un artefacto reciente y sin validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/czl/CLM-v0.1-8B-MLX-4bit
- Variante 6 bits: https://huggingface.co/czl/CLM-v0.1-8B-MLX-6bit
- Variante 8 bits: https://huggingface.co/czl/CLM-v0.1-8B-MLX-8bit
- Referencia bf16: https://huggingface.co/czl/CLM-v0.1-8B-MLX
- Variante con `lm_head` a 2 bits: https://huggingface.co/czl/CLM-v0.1-8B-MLX-4bit-outq2
- Modelo base: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Licencia de Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- MLX: https://github.com/ml-explore/mlx

Nota: los resultados de la busqueda web recibidos no guardan relacion con el modelo (corresponden al aeropuerto de Constantine, codigo IATA CZL) y por tanto no se han incluido como enlaces relevantes.
