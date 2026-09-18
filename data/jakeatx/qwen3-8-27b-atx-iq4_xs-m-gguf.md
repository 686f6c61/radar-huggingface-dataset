# jakeatx/Qwen3.8-27B-ATX-IQ4_XS-M-GGUF

## Resumen

Qwen3.8-27B-ATX-IQ4_XS-M es una cuantizacion GGUF del modelo base Qwen/Qwen3.8-27B, publicada por el usuario jakeatx. No es un modelo nuevo, sino una receta de cuantizacion orientada a velocidad y a contexto largo, disenada especificamente para ejecutarse en una unica GPU RTX 3090 o 3090 Ti de 24 GB con arquitectura SM86 (Ampere). El objetivo declarado es doble: sostener una conversacion de 200K tokens con cache de claves de 8 bits y la cabeza especulativa MTP del propio modelo, y decodificar mas rapido por ronda especulativa que las cuantizaciones Q3_K_XL y Q4_K_M de Unsloth sobre esa misma tarjeta.

El resultado es un archivo unico, `Qwen3.8-27B-ATX-4-XS.gguf`, que ocupa 13,9 GiB de pesos residentes en GPU y se situa en 4,56 bits por peso, entre Q4_K_S (4,58) y Q4_K_M (4,82) en tamano. La mezcla combina una base IQ4_XS en la mayoria de los tensores con un patron de mejora "M" que eleva a Q5_0, Q6_K y Q8_0 los tensores que Q4_K_M ya sube (proyecciones K/V de atencion, salida de atencion, salida GDN y FFN down). El modelo base tiene 27.320.697.856 parametros y, segun el mapa de tensores de la model card, 48 de sus capas son recurrentes, lo que lo situa en la familia de arquitecturas hibridas con estado recurrente y no en un transformer denso convencional.

Su relevancia ahora es practica: demuestra que con una receta de cuantizacion consciente del hardware y un fork de llama.cpp con kernels especificos para SM86 se puede mantener una ventana de 245.760 tokens medidos en una GPU de consumo de 24 GB, con prefill de 1.170 tok/s a 64K y decodificacion de 93-108 tok/s a 16K. La comparacion de calidad (Terminal-Bench, SciCode, GDPval) esta en curso, por lo que la evaluacion disponible es de rendimiento, no de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida con atencion y capas recurrentes (referencias a `ssm_out` y a vectores alpha/beta de GDN en el mapa de tensores), mas una capa MTP de decodificacion especulativa |
| Parametros totales | 27.320.697.856 (27,32 B, dato de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | 245.760 tokens medidos en esta cuantizacion; el autor recomienda `-c 204800` (200K) para dejar margen. Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | Base IQ4_XS (~75% de los bytes de pesos); Q5_0 (~17%) en attn_output, ssm_out y ffn_down; Q6_K en proyecciones K/V de atencion y cabeza de salida; Q8_0 en ocho tensores K/V concretos (V en capas 11, 27, 31, 51, 55, 59 y 63; K en 31), en la capa MTP (blk.64) y en 96 vectores alpha/beta de GDN; embeddings de tokens en q4_K |
| Bits por peso | 4,56 |
| Idiomas soportados | No disponible (la model card no lista idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo) |
| Tamano del archivo | 13,9 GiB de pesos residentes en GPU; 46,7 GB de tamano total del repositorio |
| Memoria en ejecucion | 20,9 GiB con contexto de 200K; 22,1 GiB con prompt de 240K |
| Capas | 64 capas del modelo mas una capa MTP de borrador (blk.64), segun el mapa de tensores; 48 de ellas recurrentes |
| Modelo base | Qwen/Qwen3.8-27B (BF16 GGUF de Unsloth) |
| Descargas / likes | 3.469 descargas, 11 likes |
| Fechas | Creado el 2026-09-03, actualizado el 2026-09-10 |

## Arquitectura y entrenamiento

Esta ficha describe una cuantizacion, no un entrenamiento: no hay datos de preentrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO en la informacion disponible. Lo que si documenta la model card es la arquitectura efectiva del modelo base tal como se refleja en el mapa de tensores: un transformer con atencion que incorpora componentes recurrentes (vectores alpha/beta de GDN y tensores `ssm_out`), con 48 de sus capas descritas como recurrentes, mas una capa adicional de prediccion multi-token (MTP) en blk.64 que se usa como cabeza de borrador para decodificacion especulativa. Esta mezcla es la que obliga a guardar checkpoints de estado: un estado recurrente no se puede rebobinar, de ahi que el servidor necesite instantaneas previas al punto de edicion.

El proceso de cuantizacion parte del GGUF BF16 de Unsloth y aplica la importance matrix de Unsloth (`imatrix_unsloth.gguf`, procedente de su release UD-IQ4_XS) junto con un mapa de tipos por tensor. La justificacion tecnica es concreta: en SM86, para anchos de verificacion especulativa de 1 a 5, el formato mas rapido por tensor es IQ4_XS y no los codebooks de 2-3 bits (IQ3_S, IQ3_XXS, IQ2_S estan limitados por instrucciones y resultan mas lentos pese a ocupar menos); Q5_0 es alrededor de un 16% mas barato que Q5_K, y Q8_0 es el unico formato cercano al techo de memoria. Los bits extra se asignan segun la escalera de niveles de Unsloth y no segun los outliers de la imatrix, ya que la correlacion entre ambos criterios es debil (0,14). El comando es `llama-quantize --imatrix ... --tensor-type-file tensor_types_ATX-4-XS.txt --token-embedding-type q4_K ... iq4_xs`.

## Capacidades

- Generacion de texto conversacional: la model card etiqueta el modelo como `conversational` y `text-generation`, con soporte de plantilla de chat mediante `--jinja`.
- Contexto largo sostenido: 245.760 tokens medidos, con gestion de cache de prompt entre turnos (`--cache-prompt`) y checkpoints de contexto (`--ctx-checkpoints`) para conversaciones de 200K sin reprefill completo.
- Decodificacion especulativa con MTP: usa la propia cabeza multi-token del modelo como borrador (`--spec-type draft-mtp`, `--spec-draft-n-max 3`, `--spec-draft-p-min 0.45`).
- Cargas de trabajo de codigo, agentes y recuperacion: el autor reporta velocidades de decodificacion distintas segun la tarea, con codificacion y agentes en el extremo alto y recuperacion en el bajo.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Capacidades multimodales, de audio, tool calling o function calling: no disponible en la informacion proporcionada.
- Idiomas: no disponible; la model card no especifica cobertura linguistica.

## Casos de uso

- Asistentes conversacionales de contexto muy largo: una conversacion de hasta 200K tokens puede mantenerse en una sola RTX 3090 Ti con 20,9 GiB de memoria, y `--cache-prompt` evita el reprefill de unos 100 segundos que costaria recalcular todo el historial en cada turno.
- Analisis de repositorios y codebases completos: con 245.760 tokens de ventana y velocidades de prefill de 1.170 tok/s a 64K, es viable indexar y razonar sobre arboles de codigo extensos en una sola pasada, sin trocear el contexto.
- Edicion y regeneracion de respuestas en agentes: los checkpoints de contexto (hasta 24, separados al menos 10.240 tokens, en RAM de host) permiten retroceder a un estado recurrente anterior sin reiniciar la sesion, algo imprescindible en flujos de edicion iterativa.
- Despliegue local en estacion de trabajo con una sola GPU: el objetivo de diseno es una RTX 3090 o 3090 Ti de 24 GB, lo que permite prototipar y servir inferencia sin depender de clústeres ni GPUs de centro de datos.
- Pipelines de recuperacion aumentada (RAG) sobre corpus grandes: la ventana de 200K admite inyectar muchos documentos recuperados de una vez, y el autor mide 44-72 tok/s a 100K en cargas de recuperacion.
- Servicio multiusuario con intercambio de contexto: `--cache-ram 8192` reserva 8 GiB de RAM de host para aparcar la cache KV de una conversacion completa (unos 7,4 GB con 200K) cuando otra toma el slot.
- Evaluacion comparativa de cuantizaciones en hardware Ampere: sirve como referencia reproducible para medir el efecto de IQ4_XS frente a Q3_K_XL y Q4_K_M en SM86 con decodificacion especulativa.

## Benchmarks y rendimiento

Medidas del autor en una RTX 3090 Ti a 350 W, con el fork TurboQuant+ con trabajo de kernels SM86, MTP-3 y cache q8_0 en K / turbo3 en V:

| Metrica | Q3_K_XL (11,7 GiB) | Q4_K_M (14,6 GiB) | ATX-IQ4_XS-M (13,9 GiB) |
|---|---|---|---|
| ms por ronda especulativa, 64K | 46 | 52 | 42,2 |
| ms por ronda especulativa, 100K | 53 | 57 | 48,1 |
| Prefill (tok/s), 64K | 1.055 | 1.063 | 1.170 |
| Prefill (tok/s), 100K | 903 | 910 | 993 |
| Protocolo de 45 prompts | 18 / 71 (referencia) | referencia | 17 / 70 |
| Contexto maximo | 262K | ~230K (estimado) | 245K (medido) |

Decodificacion muestreada a temperatura 1, top-k 20 y top-p 0,95, con generaciones de 256 tokens:

| Longitud de contexto | Tokens por segundo |
|---|---|
| 16K | 93-108 |
| 64K | 60-79 |
| 100K | 44-72 |

Calidad: el autor espera un rendimiento intermedio entre Q3_K_XL y Q4_K_M, dado que todo tensor que Q3_K_XL mantiene por debajo de 4 bits esta aqui a 4,25 bpw o mas, mientras que los tensores mayoritarios llevan un cuarto de bit menos que Q4_K_M. No se aportan resultados de MMLU, HumanEval, GSM8K ni de tareas de razonamiento; la comparacion equiparada en Terminal-Bench, SciCode y GDPval esta en curso.

## Requisitos de hardware

- VRAM: 13,9 GiB solo para los pesos; 20,9 GiB con 200K de contexto y 22,1 GiB con un prompt de 240K. El techo practico es una GPU de 24 GB.
- GPU objetivo: RTX 3090 y RTX 3090 Ti (SM86). Los kernels del fork estan compilados para `CMAKE_CUDA_ARCHITECTURES=86`; en otras arquitecturas habria que recompilar y la ventaja medida podria no reproducirse.
- GPU de centro de datos (A100, H100, etc.): no se documenta ningun resultado en la informacion proporcionada.
- Cabe en GPU de consumo: si, en RTX 3090 / 3090 Ti de 24 GB. No se indica si cabe en tarjetas de 16 GB o menos.
- Despliegue: llama.cpp mediante `llama-server`, con el fork https://github.com/JakeATX/llama-cpp-qwen-ampere (rama `main` en `fdfea8123`, basado en la rama TurboQuant+ de TheTom con el trabajo para SM86). Compilacion con `-DGGML_CUDA=ON -DGGML_CUDA_FA=ON -DCMAKE_CUDA_ARCHITECTURES=86`. No se mencionan vLLM, TGI, Ollama ni otras opciones.
- Configuracion de referencia: `-c 245760 -b 4096 -ub 1024 -t 8 -tb 8 -ngl 99 -fa on -ctk q8_0 -ctv turbo3 --parallel 1 --jinja --fit off`, con `--cache-prompt --cache-ram 8192 --ctx-checkpoints 24 --checkpoint-min-step 10240` y las opciones de borrador MTP.
- Latencia y throughput: prefill de 1.170 tok/s a 64K y 993 tok/s a 100K; decodificacion de 93-108 tok/s a 16K, 60-79 a 64K y 44-72 a 100K. Los checkpoints cuestan 150 MiB mas 1,5 KiB por token de posicion: unos 165 MiB a 10K y 495 MiB a 240K, lo que supone cerca de 7,8 GiB para 24 checkpoints a 10.240 de separacion.

## Comparativa con modelos similares

La comparacion disponible es contra otras cuantizaciones del mismo modelo base sobre el mismo hardware, ya que no se aportan datos de modelos de otras familias.

| Cuantizacion | Tamano (GiB) | ms/ronda a 64K | Prefill a 64K (tok/s) | Contexto maximo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B Q3_K_XL (Unsloth) | 11,7 | 46 | 1.055 | 262K | Apache 2.0 (heredada del base) |
| Qwen3.8-27B Q4_K_M (Unsloth) | 14,6 | 52 | 1.063 | ~230K (estimado) | Apache 2.0 (heredada del base) |
| Qwen3.8-27B ATX-IQ4_XS-M | 13,9 | 42,2 | 1.170 | 245K (medido) | Apache 2.0 |

Comparativa con modelos de parametros similares de otros desarrolladores (Llama, Mistral, Gemma, etc.): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de rendimiento estan medidos con un fork especifico de llama.cpp y kernels para SM86; con el llama.cpp upstream o en otra arquitectura de GPU los numeros pueden diferir de forma apreciable.
- La calidad de la cuantizacion no esta validada con benchmarks publicados: la afirmacion de que queda entre Q3_K_XL y Q4_K_M es una expectativa del autor, no una medicion. La comparacion en Terminal-Bench, SciCode y GDPval esta en curso.
- Al ser una cuantizacion a 4,56 bits por peso, hay perdida de precision respecto al BF16 del modelo base; no se cuantifica esa degradacion.
- El uso de `turbo3` para la cache V requiere los kernels del fork; sin ellos hay que cambiar a otro tipo de cache.
- Las capas recurrentes (48 de ellas) no permiten rebobinar el estado: sin `--ctx-checkpoints` configurado, editar o regenerar un turno obliga a recalcular. Se necesita RAM de host adicional (unos 7,8 GiB para 24 checkpoints) y un presupuesto aparte para `--cache-ram`.
- El contexto maximo medido es de 245.760 tokens; configuraciones mas alla de ese punto no estan verificadas en esta cuantizacion.
- Cobertura de idiomas no documentada: no se puede asumir un comportamiento multilingue homogeneo.
- Sesgos conocidos y riesgo de alucinacion: no disponible; la model card no incluye evaluaciones de sesgo, toxicidad ni tasas de alucinacion.
- Licencia Apache 2.0 segun la model card, lo que en principio permite uso comercial. Se recomienda verificar por separado los terminos del modelo base Qwen/Qwen3.8-27B antes de un despliegue en produccion.
- El autor menciona que la receta tambien se aplico al fine-tune Qwopus3.8-27B-Flash; no confundir ambos repositorios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jakeatx/Qwen3.8-27B-ATX-IQ4_XS-M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta equivalente sobre el fine-tune Qwopus3.8-27B-Flash: https://huggingface.co/jakeatx/Qwopus3.8-27B-Flash-ATX-IQ4_XS-M-GGUF
- Runtime y kernels SM86 (rama `main`, commit `fdfea8123`): https://github.com/JakeATX/llama-cpp-qwen-ampere
- Resultados de busqueda web sobre papers, blogs o demos adicionales: no disponible (los resultados devueltos no guardan relacion con el modelo).
