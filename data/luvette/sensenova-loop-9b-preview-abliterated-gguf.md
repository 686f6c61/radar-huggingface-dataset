# luvette/SenseNova-Loop-9B-Preview-abliterated-GGUF

## Resumen

SenseNova-Loop-9B-Preview-abliterated-GGUF es una cuantización Q6_K del modelo SenseNova-Loop-9B-Preview de SenseNova, sometida a un proceso de "abliteration" en cuatro pasadas directamente sobre los pesos GGUF. El objetivo es eliminar la dirección de rechazo del modelo base para obtener una variante sin censura que mantiene la coherencia de razonamiento y una terminación limpia de los bloques de pensamiento. El autor de esta variante es el usuario luvette, que parte de la cuantización Q6_K publicada por AtomicChat.

El modelo base emplea una arquitectura de transformer "looped" de clase Qwen3.5, en la que las capas 4 a 27 se ejecutan dos veces, dando lugar a 56 cálculos de capa a partir de 32 bloques almacenados. Incorpora además conexiones hiperbólicas de dos flujos restringidas a una variedad (mHC) con enrutamiento Sinkhorn. Con 8.956.949.376 parámetros totales, el modelo se posiciona en la franja de 9B.

La relevancia de esta ficha reside en que documenta una variante no oficial, derivada de un modelo preliminar, cuyo interés principal es la modificación de comportamiento (eliminación de rechazos) y el soporte de una arquitectura poco común en llama.cpp. Se distribuye bajo licencia Apache 2.0 y solo en formato GGUF, lo que condiciona su despliegue a implementaciones compatibles con el backend `sensenova_loop`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" de clase Qwen3.5 con mHC (two-stream manifold-constrained hyper-connections) y enrutamiento Sinkhorn; capas 4-27 ejecutadas dos veces (56 pasadas de capa desde 32 bloques) |
| Parametros totales | 8.956.949.376 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecucion usa `-c 16384` |
| Tipos de cuantizacion | Q6_K (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con reutilizacion de capas: los bloques 4 a 27 se ejecutan dos veces, lo que produce 56 pasadas de calculo a partir de 32 bloques fisicos almacenados. Sobre esta columna vertebral se anaden conexiones hiperbolicas de dos flujos con enrutamiento Sinkhorn (mHC), cuyos pesos se conservan en F32 en la cuantizacion. El modelo incorpora un modo de razonamiento explicito delimitado por las etiquetas `<think>` y `</think>`, segun se deduce de la verificacion incluida en la model card.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La modificacion introducida por esta variante consiste en una ortogonalizacion iterativa del subespacio de rechazo en cuatro pasadas sobre los pesos Q6_K, actuando sobre los tensores `attn_output.weight`, `ssm_out.weight` y `ffn_down.weight`. En cada pasada se reextraen los vectores residuales de diferencia de medias por capa (`l_out`) a lo largo de las 56 pasadas de capa expandidas. Las pasadas cubren los bloques 6-31 (alpha 1,20, 52 tensores), 4-31 (alpha 1,25, 56 tensores), 2-31 (alpha 1,30, 60 tensores) y 2-31 (alpha 1,25, 60 tensores). Se preservan intactos los metadatos GGUF, el tokenizer, la plantilla de chat, el `output.weight` (LM head) y los pesos del router Sinkhorn mHC en F32.

## Capacidades

- Generacion de texto conversacional y razonamiento paso a paso en modo "thinking" delimitado por `<think>` y `</think>`.
- Resolucion de problemas matematicos verbales, verificado con terminacion limpia del bloque de pensamiento.
- Generacion de codigo Python, verificado igualmente con terminacion limpia.
- Respuesta directa a peticiones sensibles sin rechazos, segun la verificacion del autor.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas verbales mostrando el desarrollo paso a paso dentro del bloque de pensamiento, util en entornos educativos o de analisis donde se requiere trazabilidad del razonamiento.
- Generacion de codigo Python en local: con 7,37 GB en Q6_K y soporte de llama.cpp, permite autocompletar y generar funciones en estaciones de trabajo sin GPU de gama alta, manteniendo calidad de cuantizacion alta.
- Investigacion sobre alineacion y rechazo: al ser una variante abliterated, sirve para estudiar como se distribuye la direccion de rechazo en un transformer con reutilizacion de capas y conexiones mHC.
- Despliegue en GPU de 8 GB: con la tecnica de mantener la tabla de embeddings en CPU (`-ot 'token_embd.weight=CPU'`), cabe en una RTX 3070 con cache KV q8_0 de 16K y CUDA Graphs activos, util para prototipado local.
- Evaluacion de arquitecturas "looped": permite comparar el comportamiento de un modelo con capas reutilizadas frente a transformers convencionales de tamano similar en tareas de razonamiento.
- Experimentacion con prompts sin restricciones: en entornos de investigacion controlados, permite explorar respuestas del modelo a peticiones que el modelo base rechazaria, con fines de auditoria de seguridad.
- Servicio de chat local con contexto medio: mediante `llama-server` con 16K de contexto, se puede montar un endpoint compatible con la API de OpenAI en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento medidos son los del autor en una RTX 3070 con `llama-server`: aproximadamente 24,4 tokens por segundo en generacion y 632 tokens por segundo en procesamiento de prompt, con 16K de cache KV q8_0 y CUDA Graphs activos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,17 GB para el fichero Q6_K completo en VRAM, mas cache KV; el autor indica que con `-ot 'token_embd.weight=CPU'` se mantiene la tabla de embeddings (~835 MiB) en RAM del sistema y todo lo demas cabe en 8 GB.
- GPU recomendadas: RTX 3070 (verificada por el autor), RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, A100, H100. Cualquier GPU con 8 GB o mas de VRAM puede ejecutar el modelo con los ajustes indicados.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB en adelante con la configuracion descrita.
- Opciones de despliegue: exclusivamente `llama.cpp` y `llama-server` con soporte de `sensenova_loop` y `qwen35.num_loops`. No es compatible con vLLM, TGI ni Ollama en el momento de publicacion, salvo que incorporen dicho soporte.
- Latencia y throughput: ~24,4 t/s de generacion y ~632 t/s de procesamiento de prompt en RTX 3070 con la configuracion indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-abliterated-GGUF (este) | 8,96B | no disponible (ejemplo con 16K) | GGUF Q6_K | Apache 2.0 | Variante abliterated, requiere llama.cpp con soporte `sensenova_loop` |
| SenseNova-Loop-9B-Preview (original) | 8,96B | no disponible | safetensors y GGUF | Apache 2.0 | Modelo base sin modificar, con rechazos activos |
| AtomicChat/SenseNova-Loop-9B-Preview-GGUF | 8,96B | no disponible | GGUF (varias cuantizaciones) | Apache 2.0 | Cuantizacion del original sin abliteration |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "preview": se trata de una version preliminar del modelo base, sin garantias de estabilidad ni de calidad final.
- La abliteration elimina la direccion de rechazo, lo que reduce las salvaguardas del modelo y aumenta el riesgo de generar contenido danino, sesgado o inapropiado. No es apto para produccion orientada al publico general sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; el modo de razonamiento explicito no garantiza correccion.
- Idiomas soportados no documentados; se desconoce el comportamiento en castellano y en idiomas distintos del ingles.
- Longitud de contexto no documentada en la model card; el ejemplo de ejecucion usa 16K, pero no se confirma el maximo entrenado.
- Requiere una build especifica de llama.cpp con soporte `sensenova_loop` y `qwen35.num_loops`; no funciona en herramientas estandar sin dicha implementacion.
- Solo se publica un fichero Q6_K; no hay cuantizaciones menores (Q4_K_M, Q5_K_M) que faciliten el despliegue en GPUs de menos de 8 GB.
- La licencia Apache 2.0 se hereda del modelo base, pero la modificacion abliterated no ha sido auditada por el autor original; el uso comercial queda bajo responsabilidad del desplegador.
- El proceso de abliteration se aplico sobre pesos cuantizados, lo que puede introducir degradaciones adicionales respecto a una abliteration sobre pesos completos.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/luvette/SenseNova-Loop-9B-Preview-abliterated-GGUF
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Cuantizacion de origen: https://huggingface.co/AtomicChat/SenseNova-Loop-9B-Preview-GGUF
