# daemonix/DeepSeek-V4.1-Flash-1017-abliterated-MXFP4-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated en formato MXFP4 GGUF es una conversion comunitaria realizada por el usuario daemonix a partir del modelo abliterado de mrfakename, que a su vez deriva del DeepSeek-V4.1-Flash-1017 original de DeepSeek AI. La ablation (eliminacion de la alineacion de rechazos) se aplico en el checkpoint de origen mediante proyecciones por capa sobre un subespacio de rechazo bidimensional, y esta conversion se limita a cuantizar los pesos a MXFP4 sin entrenamiento adicional.

El modelo esta pensado especificamente para ejecutarse con DS4 (DwarfStar, de antirez) y su fork para Apple Silicon Ultra (ds4-v41-m3ultra de IngeniousIdiocy), aprovechando Metal y la representacion nativa MXFP4 de los expertos enrutados. Incluye ademas un modelo borrador (DSpark) para decodificacion especulativa y un codificador de vision separado en BF16.

Su relevancia radica en que permite ejecutar localmente, sin filtros de rechazo y con soporte de vision, un modelo de la familia DeepSeek V4.1 Flash en hardware Apple Silicon de gama alta, aunque se trata de una conversion comunitaria sin evaluacion propia publicada y sin respaldo de los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia DeepSeek V4.1 Flash), con expertos enrutados, shared experts, capas draft (MTP) y codificador de vision separado |
| Parametros totales | 485.268.480 segun metadatos safetensors del repo (dato inconsistente con el tamano del artefacto principal, ~501,6 GB; el numero de parametros reales del modelo completo no esta disponible de forma fiable) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de DS4 usan contextos de 8192 y 32768 tokens) |
| Tipos de cuantizacion | MXFP4 (expertos enrutados nativos), Q8_0 (atencion, shared experts y proyecciones de salida), BF16 (codificador de vision) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (partes de transporte que deben concatenarse), modelo principal + DSpark (drafter) + Vision |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, una arquitectura MoE de la familia DeepSeek con 40 bloques principales, expertos enrutados con representacion nativa MXFP4, shared experts, capas draft para decodificacion especulativa (MTP) y un componente denominado "Engram" cuyos valores y escalas se conservan en su representacion nativa. El codificador de vision es un modulo separado que se distribuye en BF16.

La ablation del checkpoint de origen (mrfakename) derivo un subespacio de rechazo bidimensional a partir de prompts de chat y de razonamiento (thinking), y aplico proyecciones especificas por capa sobre la salida de atencion y los pesos down de los shared experts en los 40 bloques principales. Las matrices editadas se devolvieron a FP8 usando las escalas de bloque originales y redondeo estocastico. Los expertos enrutados, los embeddings, los datos Engram y las capas draft no se modificaron. Esta conversion GGUF no realiza ningun entrenamiento ni ablation adicional. No hay informacion disponible sobre datos de entrenamiento, numero de tokens ni post-entrenamiento (RLHF/DPO) del modelo original.

## Capacidades

- Generacion de texto y razonamiento, con modo thinking del modelo base (desactivable con `--nothink` en DS4)
- Vision: entrada de imagenes mediante el codificador de vision separado (`--vision` en DS4 sobre Metal)
- Decodificacion especulativa mediante el drafter DSpark (`--dspark --mtp-model`)
- Uso como agente multi-paso mediante el binario `ds4-agent` con soporte de vision
- Comportamiento sin rechazos (abliterado): la evaluacion Q8_0 del autor de origen reporto 4 rechazos de 100 en chat y 9 de 100 en respuestas thinking
- Ejecucion local sobre Metal en Apple Silicon Ultra

No hay informacion disponible sobre tool calling nativo ni sobre capacidades multilingues especificas.

## Casos de uso

- Chatbots locales sin filtros: la ablation reduce los rechazos a ~4 % en chat, util para asistentes locales que no deben negarse a temas legitimos pero sensibles, con la responsabilidad etica y legal correspondiente en el usuario.
- Razonamiento con modo thinking desactivable: se puede alternar entre respuestas rapidas (`--nothink`) y razonamiento extendido segun la tarea, ajustando coste y latencia.
- Analisis de imagenes en local: el codificador de vision en BF16 permite consultar sobre capturas, documentos escaneados o graficos directamente desde un Mac Ultra sin enviar datos a la nube.
- Agentes multi-paso con vision: `ds4-agent` permite construir flujos agenticos que combinan texto e imagen, por ejemplo automatizacion de escritorio o revision de interfaces.
- Generacion de codigo offline: los ejemplos oficiales incluyen generacion de funciones Python; adecuado para asistentes de codigo privados en entornos sin conectividad.
- Decodificacion especulativa de alto throughput: el drafter DSpark acelera la generacion en contextos largos (hasta 32768 tokens en los ejemplos), util para produccion de texto extenso.
- Investigacion sobre ablation y alineacion: la trazabilidad de la revision de origen y los metadatos del conversor lo hacen util como sujeto de estudio para tecnicas de des-alineacion y cuantizacion mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) ni para esta conversion MXFP4 ni en la informacion disponible. El unico dato cuantitativo es la evaluacion de rechazos del checkpoint de origen en Q8_0:

| Checkpoint de origen (Q8_0) | Rechazos en chat (de 100) | Respuestas thinking hacia rechazo (de 100) | KL del primer token en prompts inofensivos |
|---|---:|---:|---:|
| Original | 97 | 98 | 0 |
| Abliterated | 4 | 9 | 0,067 |

Estos datos corresponden al autor del modelo de origen, no a esta conversion MXFP4.

## Requisitos de hardware

- VRAM/memoria unificada: el modelo principal ocupa ~501,6 GB en disco; en los ejemplos se dirige a un Apple Silicon Ultra con 512 GB de memoria unificada. No cabe en ninguna GPU de consumo.
- GPU recomendadas: Apple M3/M4 Ultra con 512 GB de memoria unificada (via DS4 con Metal). No hay informacion sobre rendimiento en GPU NVIDIA/AMD.
- Consumer GPU: no compatible; el tamano del modelo lo excluye de cualquier GPU de consumo.
- Despliegue: DS4 / DwarfStar (antirez) y ds4-v41-m3ultra (IngeniousIdiocy). No hay informacion sobre compatibilidad con llama.cpp, Ollama, vLLM o TGI.
- Almacenamiento: se necesitan ~510,5 GB para la descarga y ~1,01 TB si se conservan simultaneamente las partes y el modelo reconstruido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-abliterated MXFP4 GGUF (este) | no disponible de forma fiable | MXFP4 mixto + Q8_0 | no disponible (ejemplos: 8192–32768) | MIT | Abliterado, vision, MTP/DSpark, orientado a DS4/Metal |
| mrfakename/DeepSeek-V4.1-Flash-1017-abliterated (origen) | no disponible | FP8 (checkpoint de origen) | no disponible | no disponible | Version sin cuantizar a GGUF, con evaluacion de rechazos publicada |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | no disponible | no disponible | no disponible | no disponible | Version oficial con alineacion intacta |

No se dispone de datos suficientes para una comparativa de rendimiento cuantitativa.

## Limitaciones y advertencias

- Modelo abliterado: elimina deliberadamente los mecanismos de rechazo. Su uso conlleva riesgos legales y eticos; el usuario asume toda la responsabilidad sobre las salidas generadas.
- No hay evaluacion de calidad para la conversion MXFP4: los unicos datos publicados corresponden al checkpoint de origen en Q8_0; la cuantizacion puede degradar el rendimiento de forma no documentada.
- Los resultados de inferencia, vision y DSpark para estos ficheros concretos no han sido documentados por el autor de la conversion.
- Los metadatos de parametros (485 M) son incoherentes con el tamano del artefacto (~501,6 GB); hay que tratar las cifras de tamano con cautela.
- Descarga y reconstruccion manuales: el modelo principal se distribuye en seis partes de transporte que deben concatenarse y verificarse con SHA256 antes de su uso.
- Sin respaldo de los autores originales: es una conversion comunitaria que no implica endoso de DeepSeek AI, mrfakename o antirez.
- Sesgos, alucinaciones, idiomas soportados y restricciones adicionales de licencia para uso comercial: no disponibles en la informacion proporcionada (la licencia MIT del repo es, en cualquier caso, permisiva).
- Requiere hardware muy especifico (Apple Silicon Ultra de 512 GB) y el runtime DS4, lo que limita severamente la portabilidad.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/daemonix/DeepSeek-V4.1-Flash-1017-abliterated-MXFP4-GGUF
- Modelo de origen (ablation): https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- DS4 / DwarfStar (antirez): https://github.com/antirez/ds4
- DS4 para Mac Ultra (IngeniousIdiocy, rama v41-m3ultra): https://github.com/IngeniousIdiocy/ds4-v41-m3ultra/tree/v41-m3ultra
