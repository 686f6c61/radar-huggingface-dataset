# CaptainArni/Swift-1.5-Qwen3.8-27B-NInfer

## Resumen

Swift-1.5-Qwen3.8-27B-NInfer es un artefacto de un solo fichero en formato NInfer v3 (~21,2 GiB, 22.783.241.220 bytes) construido por CaptainArni a partir de `ukisai/Swift-1.5-Qwen3.8-27b-NVFP4`, el segundo ajuste fino de razonamiento eficiente de UkisAI sobre Qwen3.8-27B. Se distribuye como un unico fichero `.ninfer` que empaqueta pesos, configuracion, tokenizer, plantilla de chat y bindings, pensado para servirse directamente con el motor NInfer sobre Linux y GPUs NVIDIA (CUDA 12.8+). Es un modelo multimodal de tipo image-text-to-text con soporte de vision, cabeza de prediccion multi-token (MTP) y un borrador de decodificacion especulativa DFlash2.

El problema que aborda es la sobre-reflexion de los modelos de razonamiento: Swift comprime las trazas de pensamiento manteniendo (o mejorando ligeramente) la precision en tareas de codigo y agentes. La variante 1.5 esta mas orientada a trabajo agentico y de programacion que la 1.0. Frente a su predecesora, gasta un 23% mas de tokens de salida (25% mas de tokens de pensamiento) a cambio de mejoras marginales en las suites de calidad medidas.

Tecnicamente llega muy lejos en cuantizacion: las 64 capas MLP estan en NVFP4 (tamano de bloque 16), las proyecciones de atencion y las 144 proyecciones GDN en FP8 E4M3, y solo normas, convoluciones y proyecciones pequenas quedan en BF16. El contexto maximo declarado es de 262.144 tokens (256K) con KV cache en NVFP4. Pesos en VRAM: 18,9 GiB con MTP, 20,5-20,8 GiB con DFlash2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (144 proyecciones GDN y 64 de atencion completa) y 64 capas MLP; incluye cabeza MTP y borrador especulativo DFlash2 (segun la receta de cuantizacion del artefacto) |
| Parametros totales | 27B (segun la denominacion Qwen3.8-27B del modelo base; no confirmado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (`--max-context 262144`, `--kv-capacity 262144`) |
| Tipos de cuantizacion | MLP en NVFP4 (bloque 16); proyecciones de atencion y GDN en FP8 E4M3 con una escala BF16 por fila; cabeza de salida y embeddings en FP8; vision en Q4/Q5/Q6; MTP en Q8; borrador DFlash2 en W8G32; normas, convoluciones, proyecciones GDN pequenas y codebooks del borrador en BF16 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `license: other`) |
| Formato de pesos | `.ninfer` (artefacto unico NInfer v3); el modelo base de origen es NVFP4/FP8 de NVIDIA ModelOpt |

## Arquitectura y entrenamiento

El artefacto es una conversion, no un reentrenamiento: los bytes de los pesos se importan desde `ukisai/Swift-1.5-Qwen3.8-27b-NVFP4` mediante el conversor propio de NInfer y la receta incluida, sin recuantizar. La cuantizacion reparte la precision por componente: NVFP4 en las 64 capas MLP, FP8 E4M3 con escala BF16 por fila en las 144 proyecciones GDN y las 64 de atencion completa, FP8 en la cabeza de salida y los embeddings, cuantizacion mixta Q4/Q5/Q6 en la torre de vision, Q8 en la cabeza MTP y W8G32 en el borrador DFlash2 de z-lab. Las normas, convoluciones, proyecciones GDN pequenas y codebooks del borrador permanecen en BF16. El artefacto incluye un "indexed proposal head" y se sirve bajo el identificador `qwen3.8-27b`.

El modelo base subyacente, Swift 1.5, es el segundo ajuste fino de razonamiento eficiente de UkisAI sobre Qwen3.8-27B, con post-entrenamiento adicional orientado a agentes y codigo. Su predecesor Swift incorpora, segun UkisAI, un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI y conserva la interfaz estandar de Qwen3.8 con soporte de texto, imagen y video. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO. La innovacion operativa destacable es la decodificacion especulativa seleccionable en el arranque: DFlash2 (mas rapida en secuencias de mas de unos pocos tokens, con `--draft-tokens 7`) o la propia cabeza MTP de Swift (aproximadamente 1,6 GiB menos de pesos y 0,9 GiB menos de runtime, con `--draft-tokens 3`); solo se materializa el backend elegido.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" (por defecto a nivel `xhigh` en la plantilla), disenado para producir trazas de pensamiento mas cortas que las del modelo base.
- Capacidades de vision: pipeline declarado `image-text-to-text`, torre visual cuantizada en Q4/Q5/Q6 y flag `--vision` en el servidor. El modelo base Swift conserva soporte de texto, imagen y video.
- Codigo y trabajo agentico: es el eje del post-entrenamiento de la version 1.5 (suites de tareas graduadas, bucles de agente multi-turno).
- Decodificacion especulativa integrada mediante dos backends alternativos: DFlash2 (borrador externo W8G32, con aceptacion del 72% en un prompt de codigo) y MTP (cabeza propia del modelo, aceptacion dividida fuera de las metricas de decodificacion).
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`), lo que permite integrarlo en pipelines existentes.
- Concurrencia configurable (`--max-concurrency`), en el ejemplo de la model card fijada a 2.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el enfoque agentico del ajuste lo hace plausible; no se detalla en la model card.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistencia de programacion con razonamiento acotado: el modelo esta ajustado para reducir el "overthinking" en tareas de codigo; su recorte de tokens en LiveCodeBench (-24,5% segun la model card de UkisAI) lo hace adecuado para autocompletado y revision de codigo donde el coste por token importa.
- Agentes de multiples pasos: la mejora en los bucles de agente multi-turno (12/12 en el agente B frente a 10/12 de Swift 1.0) y la reduccion de "runaways" (de 2 a 1 en el agente A) lo posicionan para orquestacion de herramientas en varios turnos.
- Procesamiento de documentos largos con vision: con 262.144 tokens de contexto y vision activa cabe ingerir informes extensos con figuras y tablas en una sola pasada, sin trocear.
- Servicio local en estacion de trabajo con GPU de 32 GiB: la configuracion completa (262K de contexto, vision, KV NVFP4, DFlash2) deja 2,80 GiB libres en una tarjeta de 32 GiB, lo que permite desplegarlo en una sola unidad consumer de gama alta.
- Backend de chat con API compatible OpenAI: al exponer `/v1/chat/completions` con el id `qwen3.8-27b`, se puede sustituir un endpoint existente sin tocar el codigo cliente.
- Analisis de imagen-texto en entornos con restricciones de VRAM: la cuantizacion mixta de la torre de vision (Q4/Q5/Q6) permite mantener capacidades multimodales dentro de un presupuesto de memoria ajustado.
- Inferencia de baja latencia con decodificacion especulativa: para generacion de prosa o resumenes largos, DFlash2 alcanza 151-201 tok/s en cuatro temas de prosa sobre una RTX 5090, con 58,9-59,2 pasos de modelo por segundo.
- Investigacion sobre eficiencia de razonamiento: sirve como referencia medible (tokens de salida, aceptacion del borrador, latencia de prefill) para comparar estrategias de compresion de trazas de pensamiento.

## Benchmarks y rendimiento

La model card no incluye MMLU, HumanEval ni GSM8K; los datos publicados son comparaciones internas entre Swift 1.0 y Swift 1.5 ejecutadas en la misma maquina (RTX 5090, 262.144 de contexto, vision activa, KV en NVFP4, DFlash2, una peticion a la vez).

Velocidad y huella de memoria (identicas por diseno, mismo layout byte a byte):

| Metrica | Swift 1.0 | Swift 1.5 |
|---|---:|---:|
| Prefill, 10,7k tokens (tok/s) | 8.550 | 8.600 |
| Prefill, 43,8k tokens (tok/s) | 6.270 | 6.320 |
| Prefill, 173k tokens (tok/s) | 2.950 | 2.940 |
| Decode, pasos de modelo por segundo | 58,5-58,9 | 58,9-59,2 |
| Decode, tok/s en cuatro temas de prosa | 147-174 | 151-201 |
| Pesos / VRAM libre (GiB) | 20,8 / 2,80 | 20,8 / 2,80 |

Calidad y trabajo agentico:

| Metrica | Swift 1.0 | Swift 1.5 |
|---|---:|---:|
| Tareas graduadas | 11/12 | 12/12 |
| Conjunto de eficiencia graduado | 43/44 | 44/44 |
| Prompts abiertos finalizados | 13/18 | 15/18 |
| Bucle agentico multi-turno, agente A | 9/12 (2 runaways) | 11/12 (1 runaway) |
| Bucle agentico multi-turno, agente B | 10/12 | 12/12 |

El autor advierte que las diferencias no son separables del azar con doce ejecuciones (Fisher p = 0,19 en los bucles de agente agrupados) y que la suite de calidad es una prueba de humo de seis tipos de tarea graduada y dos a cuatro semillas.

Uso de tokens (14 tareas x 4 semillas, tope de 32.768 tokens, temperatura 1,0 / top_p 0,95 / top_k 20):

| Metrica | Swift 1.0 | Swift 1.5 |
|---|---:|---:|
| Tokens de salida, 56 ejecuciones | 87.844 | 107.740 (+23%) |
| De los cuales, pensamiento | 78.188 | 97.618 (+25%) |
| Media / mediana por ejecucion | 1.569 / 909 | 1.924 / 901 |
| Ejecuciones truncadas por el tope | 0 | 0 |

Swift 1.5 piensa mas tiempo que 1.0 en 11 de 14 tareas (test de signos p = 0,02), sobre todo en los prompts de razonamiento mas largos, aunque la mediana no se mueve. El Qwen3.8 base en NVFP4 consumio 208.309 tokens en el mismo conjunto en otra fecha y configuracion, aproximadamente el doble. La aceptacion del borrador DFlash2 sube del 61% al 72% en un prompt de codigo, lo que explica el 2-16% de mejora en decodificacion bruta (efecto colateral, ya que el borrador se entreno sobre Qwen3.8 base).

## Requisitos de hardware

Medido en una tarjeta de 32 GiB (RTX 5090), con CUDA 12.8+ y el motor NInfer compilado:

| Contexto | KV | Vision | Spec | Pesos (GiB) | Runtime (GiB) | Libre (GiB) |
|---|---|---|---|---:|---:|---:|
| 64.000 | int8 | off | MTP | 18,9 | 3,05 | 8,44 |
| 64.000 | int8 | off | DFlash2 | 20,5 | 3,93 | 5,77 |
| 262.144 | nvfp4 | on | DFlash2 | 20,8 | 7,07 | 2,80 |

- VRAM estimada: minimo practico en torno a 22-25 GiB con contexto de 64K y MTP; la configuracion completa a 256K con vision consume unos 27,9 GiB de pesos mas runtime, dejando 2,80 GiB libres en una GPU de 32 GiB.
- Cabe en GPU consumer: si, en tarjetas de 32 GiB (RTX 5090 es la plataforma probada). La configuracion de 64K con MTP podria encajar en tarjetas de 24 GiB, aunque no esta confirmado en la informacion disponible.
- GPU recomendadas: RTX 5090 (validada por el autor); otras GPUs NVIDIA con >=32 GiB y soporte CUDA 12.8+ deberian funcionar, aunque no hay datos publicados al respecto.
- Opciones de despliegue: motor NInfer (`ninfer-serve`), construido desde https://github.com/Neroued/ninfer, con API compatible con OpenAI. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` es propietario de NInfer. Existen conversiones GGUF del modelo Swift Qwen3.8 27b base (113,4 GB, repartidas en 2 partes) publicadas por terceros.
- Latencia y throughput: prefill de 2.940-8.600 tok/s segun longitud de entrada; decodificacion de 59 pasos de modelo por segundo y 151-201 tok/s en prosa con DFlash2 sobre RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-NInfer | 27B | 262.144 | `.ninfer` unico, NVFP4/FP8 mixto | swift-open-license-1.0 | 0 descargas, 0 likes en HuggingFace |
| Swift-Qwen3.8-27B-NInfer (Swift 1.0) | 27B | 262.144 | `.ninfer` unico, misma receta y layout | swift-open-license-1.0 | 6.150 descargas, 10 likes |
| Swift-Qwen3.8-27B (GGUF de terceros) | 27B | no disponible | GGUF en 2 partes, 113,4 GB | no disponible | 16.363 descargas, 32 likes |
| Qwen3.8-27B base en NVFP4 | 27B | no disponible | NVFP4/FP8 | no disponible | no disponible |

Frente a Swift 1.0, el rendimiento medido es practicamente identico en velocidad y huella de memoria (el autor los describe como "gemelos estructurales", intercambiables sin mas cambios), con mejoras marginales en calidad y agentes no separables del azar con el tamano de muestra empleado. La diferencia real esta en el mayor gasto de tokens de pensamiento (+23% de salida) y en la mayor aceptacion del borrador DFlash2.

## Limitaciones y advertencias

- No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; la evaluacion publicada es una comparacion interna contra Swift 1.0 con solo 12-56 ejecuciones por celda y con significacion estadistica insuficiente en varios casos (Fisher p = 0,19; test de signos p = 0,02 sobre 14 tareas).
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; el modelo usa modo de pensamiento por defecto (`xhigh`), lo que incrementa el gasto de tokens y puede alargar las respuestas innecesariamente.
- La version 1.5 dedica un 23% mas de tokens de salida y un 25% mas de pensamiento que 1.0, lo que encarece la inferencia; este coste recae sobre todo en los prompts de razonamiento mas largos.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue mas alla de lo que herede de Qwen3.8.
- Restricciones de licencia: `swift-open-license-1.0` (etiquetada como "other"); hay que revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que los terminos no se detallan en la model card.
- Dependencia de un motor propietario: el formato `.ninfer` requiere el motor NInfer (Linux, NVIDIA, CUDA 12.8+). No es desplegable en vLLM, llama.cpp, Ollama ni TGI sin reconvertir.
- Solo se materializa un backend de decodificacion especulativa por arranque; elegir uno u otro cambia el consumo de VRAM entre 18,9 GiB (MTP) y 20,8 GiB (DFlash2).
- El identificador servido es `qwen3.8-27b`, igual que el del modelo base, lo que puede provocar ambiguedad si en el mismo host conviven varias variantes.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (24 de septiembre de 2026); no hay evidencia de uso en produccion.
- La model card esta truncada en la seccion "What this does not show", por lo que falta parte de las advertencias del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CaptainArni/Swift-1.5-Qwen3.8-27B-NInfer
- Predecesor Swift 1.0: https://huggingface.co/CaptainArni/Swift-Qwen3.8-27B-NInfer
- Modelo base del artefacto: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-NVFP4
- Perfil del autor: https://huggingface.co/CaptainArni
- Anuncio de Swift en UkisAI: https://ukisai.com/news/introducing-swift
- Repositorio del motor NInfer: https://github.com/Neroued/ninfer
- Conversion GGUF de terceros (local-ai-zone): https://local-ai-zone.github.io/models/ukisai-swift-qwen3-8-27b.html
- Repositorio de abliteracion relacionado: https://github.com/andrewting19/swift-qwen38-abliteration
