# hletrd/Raon-1-nano-Uncensored-MLX-6bit

## Resumen

Raon-1-nano-Uncensored-MLX-6bit es una version cuantizada y "abliterated" (con la direccion de rechazo eliminada de los pesos) del modelo KRAFTON/Raon-1-nano, publicada por el usuario hletrd. El modelo base es un transformer de aproximadamente 3.130 millones de parametros desarrollado por KRAFTON, y esta variante lo convierte a formato MLX de 6 bits para su ejecucion eficiente en hardware Apple Silicon. El objetivo declarado es ofrecer un modelo conversacional y de generacion de texto sin el comportamiento de rechazo tipico de los modelos alineados, manteniendo al mismo tiempo la fidelidad respecto a los pesos originales en BF16.

La modificacion consiste en eliminar una unica direccion de rechazo, tomada en la capa 16 con el canal 746 anulado, proyectada fuera de las proyecciones de salida de atencion, las proyecciones down del MLP y las proyecciones de entrada por capa de las capas 6 a 22 (51 tensores en total). El embedding, la cabeza de salida y el bloque MTP (multi-token prediction) permanecen sin cambios. Segun la model card, el modelo rechaza solo el 0,5% de 200 prompts de HarmBench con el modo thinking desactivado, frente al 98,5% del GGUF Q6_K oficial de KRAFTON.

Es relevante para desarrolladores que trabajan en entornos macOS con Apple Silicon, ya que el formato MLX permite aprovechar la memoria unificada de los chips de la serie M, y para investigadores interesados en tecnicas de abliteration y en el analisis del equilibrio entre supresion de rechazos y degradacion de la fidelidad del modelo. La licencia Apache 2.0 facilita su uso comercial, aunque con las advertencias propias de un modelo sin alineacion de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de KRAFTON/Raon-1-nano; incluye atencion MLA y bloque MTP en el modelo base, MTP omitido en esta variante) |
| Parametros totales | 3.130.797.136 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K (segun la tabla de hardware de la model card) |
| Tipos de cuantizacion | MLX affine, group size 64; proyecciones y embedding por capa en 6 bits, token embedding/LM head y compuertas de entrada en 8 bits, proyecciones key y value de MLA en BF16 |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de KRAFTON/Raon-1-nano, un transformer de aproximadamente 3.130 millones de parametros que, segun los detalles disponibles en la model card, incorpora atencion MLA (multi-head latent attention) y un bloque MTP (multi-token prediction) en su version original. Esta variante MLX elimina el bloque MTP y conserva el codigo de modelo `raon_mlx_model.py` de KRAFTON sin modificaciones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada.

La innovacion principal de esta ficha es el proceso de abliteration: se identifica una direccion de rechazo en la capa 16 (canal 746 anulado) y se proyecta fuera de 51 tensores correspondientes a las proyecciones de salida de atencion, las proyecciones down del MLP y las proyecciones de entrada por capa de las capas 6 a 22. La cuantizacion es de tipo affine con group size 64, aplicando 6 bits a las proyecciones de atencion, RDA y MLP y a la tabla de embedding por capa, 8 bits al token embedding (que tambien actua como LM head), a la proyeccion de embedding por capa y a las compuertas y proyecciones de entrada por capa, y manteniendo en BF16 las proyecciones key y value de MLA. No se detalla el proceso de entrenamiento adicional, ya que se trata de una conversion y edicion de pesos, no de un reentrenamiento.

## Capacidades

- Generacion de texto conversacional en coreano e ingles.
- Razonamiento con modo "thinking" activado por defecto (se puede desactivar mediante configuracion de plantilla de chat).
- Respuesta directa sin modo thinking para aplicaciones de baja latencia.
- Comportamiento sin rechazos en la gran mayoria de prompts (0,5% de rechazo en HarmBench con thinking desactivado; 0 de 50 con thinking activado).
- Soporte de conversaciones multi-turno (pipeline text-generation, etiqueta conversational).
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni otras capacidades especiales en la informacion disponible.

## Casos de uso

- Investigacion sobre abliteration y alineacion: el modelo permite estudiar el efecto de eliminar una direccion de rechazo sobre la fidelidad (KL y top-1) y sobre el comportamiento de seguridad, comparando con el GGUF Q6_K oficial de KRAFTON incluido en la tabla de precision.
- Generacion de texto creativo sin restricciones: util para escritura de ficcion, guiones o contenido narrativo donde los filtros de seguridad de modelos alineados bloquean tematicas sensibles, con la advertencia de revision humana posterior.
- Despliegue local en macOS con Apple Silicon: gracias al formato MLX y a un tamano de 2,7 GB, el modelo se ejecuta en equipos con memoria unificada desde 36 GB, lo que facilita prototipado y desarrollo sin GPU dedicada.
- Asistente conversacional en coreano e ingles: el soporte bilingue y el contexto de 256K permiten gestionar conversaciones largas o documentos extensos en ambos idiomas.
- Analisis de contenido y red teaming: al presentar una tasa de rechazo muy baja, sirve como herramienta para evaluar la robustez de filtros de seguridad propios o para generar casos de prueba adversarios.
- Evaluacion comparativa de cuantizaciones: la model card incluye metricas de KL y top-1 frente a BF16 y frente a otras cuantizaciones (Xylolabs GGUF Q6_K y KRAFTON Q6_K), lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantizacion MLX de 6 bits.
- Procesamiento de documentos largos: con 256K de contexto, puede resumir o extraer informacion de textos extensos en ingles o coreano en entornos locales.

## Benchmarks y rendimiento

La model card presenta metricas de fidelidad (KL y top-1 frente a los pesos BF16 originales) y de rechazo en HarmBench (200 prompts) y Alpaca (100 prompts), con thinking desactivado:

| Modelo | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | 7-question answer check | HarmBench refused | Alpaca refused |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Uncensored MLX 6-bit | 2,69 GB | 0,009804 | 93,67% | 0,021895 | 93,00% | 0,010994 | 93,75% | 6/7 (BF16: 6/7) | 0,5% | 0,0% |
| Xylolabs GGUF Q6_K | 2,65 GB | 0,009180 | 94,31% | 0,021124 | 93,10% | 0,011139 | 94,16% | 6/7 (BF16: 6/7) | 0,5% | 0,0% |
| KRAFTON Q6_K GGUF | 2,65 GB | 0,004891 | 95,50% | 0,006117 | 96,28% | 0,004853 | 95,35% | 6/7 (BF16: 6/7) | 98,5% | 0,0% |

Con thinking activado, el modelo rechaza 0 de 50 prompts de HarmBench. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El modelo ocupa 2,7 GB en disco (pesos MLX de 6 bits).
- Requiere hardware Apple Silicon con MLX; la model card lista equipos Mac Studio M5 Max (32 y 40 nucleos de GPU) con 36, 48, 64 y 128 GB de memoria unificada, y Mac Studio M5 Ultra con 96, 256 y 512 GB.
- Contexto maximo soportado segun la model card: 256K.
- Despliegue mediante `mlx_lm.generate` y `mlx_lm.chat` (mlx 0.32.4, mlx-lm 0.32.2, transformers 5.20.2), con `--trust-remote-code`.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al estar en formato MLX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rechazo HarmBench | Fidelidad KL (WikiText-2) |
|---|---|---|---|---|---|---|
| Raon-1-nano-Uncensored-MLX-6bit | 3.130 M | 256K | MLX safetensors | Apache 2.0 | 0,5% | 0,009804 |
| Xylolabs GGUF Q6_K (variante uncensored) | no disponible | no disponible | GGUF | no disponible | 0,5% | 0,009180 |
| KRAFTON Raon-1-nano Q6_K GGUF (oficial) | 3.130 M (base) | no disponible | GGUF | Apache 2.0 (base) | 98,5% | 0,004891 |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": la eliminacion de la direccion de rechazo reduce drasticamente las negativas de seguridad, lo que implica riesgo de generar contenido danino, ilegal o sensible; requiere revision y filtros externos en produccion.
- La fidelidad respecto a BF16 es inferior a la del GGUF Q6_K oficial de KRAFTON (KL de 0,009804 frente a 0,004891 en WikiText-2; top-1 de 93,67% frente a 95,50%), por lo que puede haber degradacion en tareas que dependan de matices finos.
- Riesgo de alucinacion inherente a un modelo de 3.130 millones de parametros; no se han publicado evaluaciones de veracidad.
- Idiomas limitados a coreano e ingles; el rendimiento en castellano no esta documentado.
- La abliteration puede degradar capacidades de razonamiento o de seguimiento de instrucciones en dominios sensibles; la model card solo verifica 6/7 respuestas correctas en un conjunto de 7 preguntas.
- Requiere `--trust-remote-code` y hardware Apple Silicon con MLX; no es desplegable en GPU NVIDIA sin conversion adicional.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin alineacion de seguridad puede conllevar responsabilidades legales y reputacionales segun la jurisdiccion.
- El bloque MTP del modelo base ha sido eliminado, por lo que no se dispone de decodificacion especulativa nativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Raon-1-nano-Uncensored-MLX-6bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Version MLX oficial de KRAFTON: https://huggingface.co/KRAFTON/Raon-1-nano-mlx
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
