# Accio-Lab/occamy-1.0-MLX-6bit

## Resumen

Occamy-1.0 MLX 6-bit es una cuantizacion nativa para MLX del modelo Occamy-1.0, desarrollado por Accio-Lab. Se trata de un transformer de tipo mixture-of-experts (MoE), etiquetado en HuggingFace con la arquitectura `qwen3_5_moe`, con 34.660.608.768 parametros totales (unos 34,66 mil millones) y disenado exclusivamente para generacion de texto. El artefacto se distribuye en formato safetensors para la libreria MLX de Apple, con cuantizacion afin de 6 bits y tamano de grupo 64, aplicada directamente desde los pesos BF16 de origen.

El problema que resuelve es el de ejecutar un modelo MoE de ~35B en hardware Apple Silicon sin recurrir a formato GGUF ni a cuantizaciones de menor precision: el checkpoint ocupa 28.168.623.119 bytes (28,17 GB / 26,23 GiB) y se carga con `mlx-lm` estandar, sin adaptadores, exponiendo una API compatible con OpenAI mediante `mlx_lm.server`. La licencia Apache 2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales.

Es relevante ahora porque forma parte de un conjunto de checkpoints publicado en paralelo (BF16, GGUF, FP8, NVFP4 y MLX en 3, 4, 6 y 8 bits) que cubre distintos ecosistemas de inferencia, y porque el autor documenta un proceso de validacion reproducible con hashes SHA256, fixtures de decodificacion greedy y comprobaciones HTTP. Conviene senalar que se trata de una *candidate release*: la validacion en Metal sobre Mac esta pendiente y no existe ningun benchmark de calidad o de velocidad asociado a esta exportacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (`qwen3_5_moe` segun los tags de HuggingFace) |
| Parametros totales | 34.660.608.768 (~34,66B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afin nativa de 6 bits con group size 64 (router y gates de expertos compartidos en 8 bits); la familia incluye tambien variantes MLX de 3, 4 y 8 bits, ademas de GGUF, FP8 y NVFP4 |
| Idiomas soportados | no disponible (la validacion cubre textos en ingles y chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 28.168.623.119 bytes / 28,17 GB / 26,23 GiB |

Datos adicionales del artefacto: revision del modelo fuente `8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8`; herramientas de exportacion y validacion `mlx 0.32.2`, `mlx-lm 0.31.3` y `transformers 5.8.1`; entrada limitada a texto (vision y MTP no incluidos).

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO), por lo que esos datos deben considerarse no disponibles. Lo que si se documenta es la arquitectura declarada: un transformer de mezcla de expertos con 34,66B de parametros totales, del que no se especifica el numero de parametros activos por token. El proceso de conversion revela parte de la estructura interna: el checkpoint original contiene 30.720 tensores de expertos independientes, que el adaptador de layout apila en orden numerico de experto en 120 grupos antes de invocar el saneador oficial de Qwen3.5 una unica vez.

La innovacion tecnica de esta ficha es el propio proceso de cuantizacion y serializacion: se usa el adaptador `layout_adapter.py` para reordenar los tensores y despues APIs nativas de MLX para cuantizar y serializar, de modo que el modelo resultante se recarga e infiere con `mlx-lm` estandar sin necesidad de adaptador. La validacion ejecutada incluye recarga estricta, comprobacion de que todos los valores flotantes almacenados son finitos, dequantizacion afin nativa de cada fila cuantizada y verificacion byte a byte del tokenizer y de las plantillas de chat contra el origen. Las pruebas se realizaron con MLX CUDA 12 sobre una NVIDIA B200; el autor indica explicitamente que se trata de un resultado en Linux y no de una validacion en Metal sobre Mac.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat que expone un flag `enable_thinking`, lo que implica un modo de razonamiento explicito que puede activarse o desactivarse.
- Aritmetica basica y tareas de computo sencillo: la receta oficial usa como ejemplo "Compute 2+2".
- Salida estructurada en JSON: una de las fixtures de validacion cubre generacion JSON.
- Recuerdo multi-turno: las pruebas incluyen una fixture de recall en conversaciones de varios turnos.
- Cobertura multilingue limitada, segun la validacion, a ingles y chino; no hay listado oficial de idiomas.
- Servicio local mediante API compatible con OpenAI (`mlx_lm.server`), reutilizable desde cualquier cliente que acepte una base URL personalizada.
- Capacidades no verificadas en este lote: el autor indica que no se evaluo codigo, uso de herramientas (tool calling), vision ni agentes. La compatibilidad con tool calling y con integraciones de agentes queda explicitamente sin establecer.
- Vision y cabecera MTP no incluidas en esta exportacion (solo texto).

## Casos de uso

- Asistente conversacional local en Mac: cargando el checkpoint con `mlx-lm` en un equipo Apple Silicon, el modelo atiende dialogos multi-turno sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado y evaluacion de arquitecturas MoE: al ser una exportacion de 6 bits que se recarga con `mlx-lm` estandar, sirve para medir el comportamiento de un MoE de ~35B en memoria unificada antes de decidir si merece la pena el checkpoint BF16 completo.
- Backend de chat autoalojado: `mlx_lm.server` levanta un endpoint `/v1/chat/completions` compatible con OpenAI, de modo que se puede apuntar una aplicacion existente al puerto local cambiando unicamente la base URL y el nombre del modelo.
- Generacion de respuestas deterministas en pruebas automatizadas: el ejemplo oficial usa `temperature=0`, lo que permite construir suites de regresion con salidas reproducibles sobre prompts fijos.
- Extraccion de respuestas en JSON para pipelines de datos: dado que la validacion incluye una fixture de JSON, el modelo puede emplearse para transformar texto libre en estructuras parseables, siempre que se valide el esquema en el lado del cliente.
- Experimentacion con modos de razonamiento: el flag `enable_thinking` de la plantilla de chat permite comparar el mismo prompt con y sin razonamiento explicito, util para analizar coste en tokens frente a calidad.
- Analisis de documentacion en ingles y chino: es el unico par de idiomas cubierto por las pruebas del autor, asi que es el escenario con mayor respaldo empirico declarado.
- Despliegue en portatil para tareas de calculo ligero: operaciones aritmeticas y de computo directo forman parte de las fixtures verificadas, lo que encaja con usos de asistencia puntual sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica de forma explicita que estas exportaciones "no tienen un benchmark de calidad emparejado ni un ranking de velocidad establecido".

La unica evidencia cuantitativa disponible es funcional, no comparativa:

| Prueba de validacion | Alcance | Resultado |
|---|---|---|
| Fixtures greedy en cache (ingles, chino, aritmetica, JSON, recall multi-turno) | 8 casos | 8/8 superados, con logits finitos sobre el vocabulario completo en cada paso de decodificacion |
| Fixtures HTTP con el servidor estandar de MLX | 2 casos | superados en Linux |
| Recarga estricta con `mlx-lm` estandar | todas las filas cuantizadas | superada |
| Dequantizacion afin nativa | todas las filas cuantizadas | superada |
| Tokenizer y plantilla de chat | comparacion byte a byte | identicos al origen |
| Codigo, tool calling, vision, benchmark de calidad completo | no evaluado | no disponible |

## Requisitos de hardware

- Peso del fichero de pesos: 28.168.623.119 bytes (28,17 GB, 26,23 GiB). El autor advierte que el tamano del fichero no equivale al requisito de memoria unificada: hay que dejar margen para el sistema operativo, la cache y los buffers del runtime.
- Estimacion practica en Apple Silicon: un equipo con 36 GB de memoria unificada o mas es el minimo razonable, y 48 GB o mas da margen comodo para contexto largo y KV cache. No hay cifras oficiales de memoria pico publicadas.
- GPU dedicadas: este artefacto esta pensado para MLX y Apple Metal. Existe validacion en una NVIDIA B200 bajo MLX CUDA 12 en Linux, pero se trata de un entorno de validacion, no de un objetivo de despliegue soportado.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 ni con otras GPU consumer para este checkpoints concreto. Para CUDA/consumer existen artefactos hermanos en GGUF, FP8 y NVFP4 del mismo modelo base, que son la via recomendada.
- Opciones de despliegue verificadas: `mlx-lm` (carga e inferencia), `mlx_lm.server` (API compatible con OpenAI en `127.0.0.1:8000`, con `--chat-template-args '{"enable_thinking":false}'`) y el explorador gratuito de CPU de Accio-Lab para consultar comandos. vLLM, TGI, Ollama y llama.cpp no aparecen como soportados para esta exportacion MLX.
- Compatibilidad pendiente: la aceptacion en Metal sobre Mac no esta confirmada; la receta Mac esta marcada como pendiente de aceptacion.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de velocidad para esta exportacion.

## Comparativa con modelos similares

La informacion disponible no documenta modelos de terceros comparables ni sus cifras, por lo que cualquier comparacion con alternativas externas seria especulativa. Lo unico comparable con datos verificables es la propia familia de checkpoints de Occamy-1.0:

| Checkpoint | Formato / runtime | Precision | Tamano | Validacion publicada |
|---|---|---|---|---|
| occamy-1.0 | BF16, safetensors | 16 bits | no disponible | referencia del modelo base |
| occamy-1.0-MLX-8bit | MLX | 8 bits | no disponible | no disponible en esta ficha |
| occamy-1.0-MLX-6bit | MLX | 6 bits, group size 64 | 28,17 GB / 26,23 GiB | recarga, dequantizacion, 8 fixtures greedy, 2 HTTP; sin benchmark de calidad |
| occamy-1.0-MLX-4bit | MLX | 4 bits | no disponible | no disponible en esta ficha |
| occamy-1.0-MLX-3bit | MLX | 3 bits | no disponible | no disponible en esta ficha |
| occamy-1.0-GGUF | GGUF, llama.cpp | no disponible | no disponible | no disponible en esta ficha |
| occamy-1.0-FP8 | no disponible | 8 bits float | no disponible | no disponible en esta ficha |
| occamy-1.0-NVFP4 | no disponible | 4 bits float | no disponible | no disponible en esta ficha |

El autor no publica ranking de velocidad ni comparativa de calidad entre estas variantes; remite al checkpoint explorer para consultar tamanos, alcance de validacion y comandos de despliegue.

## Limitaciones y advertencias

- Estado de publicacion: es una *candidate release*. La validacion en Metal sobre Mac esta pendiente y la inferencia y el rendimiento en Mac permanecen sin verificar.
- Ausencia de benchmarks: no existe ninguna medicion de calidad (MMLU, HumanEval, GSM8K, etc.) ni de velocidad asociada a esta exportacion. No se debe asumir un comportamiento equivalente al modelo BF16 sin medirlo.
- Capacidades no evaluadas: codigo, tool calling, agentes y vision no se probaron en este lote. La compatibilidad con el servidor MLX no implica compatibilidad con integraciones de herramientas o de agentes.
- Idiomas: no hay listado oficial de idiomas soportados. La evidencia empirica se limita a ingles y chino, por lo que el rendimiento en castellano u otros idiomas no esta verificado.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje generativo; las pruebas realizadas son de formato y finitud de logits, no de veracidad factual.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad para este modelo.
- Licencia: Apache 2.0, heredada del modelo base. Permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio base antes de un despliegue en produccion.
- Restricciones practicas: el artefacto es especifico de MLX; no es directamente utilizable en runtimes CUDA/CUDA-adjacent sin reexportacion. La receta de instalacion esta fijada a versiones concretas (`mlx 0.32.2`, `mlx-lm 0.31.3`, `transformers 5.8.1`), y se produjo un conflicto de version de cabeceras CUDA 12 resuelto en el entorno aislado de validacion, lo que sugiere fragilidad en la reproducibilidad del entorno.
- Gestion de memoria: el tamano del fichero de pesos no es el requisito de memoria unificada; hay que reservar espacio adicional para el sistema operativo, la cache y los buffers del runtime.
- Datos de consumo: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe retroalimentacion de la comunidad sobre su comportamiento real.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-6bit
- Modelo base (BF16): https://huggingface.co/Accio-Lab/occamy-1.0
- Revision fuente fijada: https://huggingface.co/Accio-Lab/occamy-1.0/tree/8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8
- Licencia del modelo base: https://huggingface.co/Accio-Lab/occamy-1.0/blob/main/LICENSE
- Coleccion Occamy-1.0: https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216
- Coleccion MLX: https://huggingface.co/collections/Accio-Lab/occamy-10-mlx-6ac0072a7c1cdbc5e418e90b
- Explorador de checkpoints (Space): https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer
- Sitio del proyecto: https://accio-lab.github.io/occamy/
- Paper: https://arxiv.org/abs/2609.11977
- Variante MLX 8-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit
- Variante MLX 4-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit
- Variante MLX 3-bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-3bit
- Variante GGUF: https://huggingface.co/Accio-Lab/occamy-1.0-GGUF
- Variante FP8: https://huggingface.co/Accio-Lab/occamy-1.0-FP8
- Variante NVFP4: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Cabecera MTP: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
