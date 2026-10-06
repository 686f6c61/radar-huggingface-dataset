# Hob-forge/Kolibri-1-GGUF

## Resumen

Kolibri-1 GGUF es la conversion a formato GGUF del modelo Aleph-Alpha/Kolibri-1, un modelo de razonamiento de tipo mezcla de expertos (MoE) desarrollado por Aleph Alpha. El modelo original cuenta con 78.103.074.560 parametros totales y activa aproximadamente 3.460 millones por token, lo que permite un coste de inferencia mucho menor que el de un modelo denso del mismo tamano. Esta publicacion, obra del usuario Hob-forge, es una conversion independiente no afiliada ni respaldada por Aleph Alpha ni por el proyecto llama.cpp.

El modelo esta disenado para generacion de texto, razonamiento y llamadas a herramientas en aleman e ingles, y se distribuye bajo licencia Apache-2.0. Su relevancia radica en que ofrece un MoE de gran tamano con soporte de modo de razonamiento configurable (none, low, medium, high) y plantilla de chat con tool calling, todo ello ejecutable en hardware de consumo mediante cuantizacion. El contexto configurable en el ejemplo de ejecucion es de 32.768 tokens, aunque el autor advierte que no se han verificado contextos por encima de 8.192 tokens.

Esta ficha se centra en la conversion GGUF; conviene tener presente que el modelo base subyacente es Kolibri-1 de Aleph Alpha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer; atencion GQA con patron 4:1 (cuatro capas de ventana deslizante y una de atencion completa) |
| Parametros totales | 78.103.074.560 |
| Parametros activos | 3.460 millones por token (aproximado, indicado por el autor) |
| Longitud de contexto | 32.768 tokens en el ejemplo de ejecucion; no verificado por encima de 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K y Q8_0 |
| Idiomas soportados | Aleman (de) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (origen FP8 e4m3 con escalas de bloque 128x128, convertido a BF16 y cuantizado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos con 384 expertos enrutados y seleccion top-6, mas un experto compartido sin puerta en cada capa. La atencion usa GQA con 48 cabezas de consulta y 4 cabezas de clave/valor, con dimension de cabeza 128 y RMSNorm por cabeza en q y k. Las capas siguen un patron de repeticion 4:1: cuatro capas de ventana deslizante (ventana 513, con RoPE) por cada capa de atencion completa (sin codificacion posicional). El bloque MoE se enruta seleccionando sobre logits + expert_bias y ponderando por sigmoid(logits) sin bias y sin renormalizacion, un modo de gating distinto del router sigmoide de DeepSeek-V3 que incorpora llama.cpp. Se aplican normas tipo sandwich alrededor de los bloques de atencion y MoE.

Los pesos originales de Aleph Alpha estaban en FP8 e4m3 con escalas de bloque 128x128. El conversor los dequantiza a BF16, y tanto el Q4_K_M como los demas quants se generan a partir de ese GGUF BF16, por lo que ninguno es una recuantizacion. El Q4_K_M contiene 903 tensores: 426 Q4_K, 76 Q6_K y 401 F32 (normas, puertas del router y sesgos de expertos). No se aplico matriz de importancia ni entrenamiento adicional. No se dispone de informacion en el material proporcionado sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo original.

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Razonamiento configurable por peticion mediante `reasoning_effort` con valores `none`, `low`, `medium` y `high`; el modo de pensamiento se emite con la etiqueta `<think>`.
- Llamada a herramientas y function calling: la plantilla de chat incluida en el GGUF gestiona las llamadas y los resultados de herramientas.
- Razonamiento multi-paso orientado a agentes gracias al modo de razonamiento y al soporte de tool calling.
- Resolucion de problemas aritmeticos verificables con el razonamiento activado.
- Resumen de documentos largos (probado con un prompt de 1.393 tokens en aleman).
- No se documentan capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno en aleman e ingles con una ventana de hasta 32.768 tokens, lo que permite incluir historial extenso y documentacion de soporte en el mismo contexto.
- Agentes con acceso a herramientas: gracias al soporte nativo de tool calling en la plantilla de chat, se puede integrar en flujos que consulten APIs externas (por ejemplo, meteorologia, bases de datos o sistemas internos) y encadenen varios pasos de razonamiento.
- Generacion y analisis de codigo asistido: aunque no se detallan benchmarks de codigo, el soporte de function calling permite integrarlo en asistentes de desarrollo que invoquen herramientas o ejecuten acciones dentro de un IDE.
- Razonamiento sobre documentos en aleman: el modelo esta optimizado para este idioma, algo poco habitual en la mayoria de modelos abiertos, por lo que resulta util para resumen y extraccion de informacion en corpus germanoparlantes.
- Procesamiento por lotes en servidores con CPU: al ejecutarse desde RAM del sistema, encaja en entornos donde no hay GPU disponible y se necesita procesar tareas de generacion a bajo throughput pero con coste de hardware reducido.
- Asistentes de investigacion con control de esfuerzo de razonamiento: ajustando `reasoning_effort` se puede equilibrar latencia y profundidad segun la tarea, usando `low` para respuestas rapidas y `high` para analisis complejos.
- Prototipado local de aplicaciones con MoE: sirve para evaluar el comportamiento de una arquitectura MoE de 78B en un equipo de consumo antes de desplegarla en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si aporta verificaciones de fidelidad de la cuantizacion y mediciones de perplexidad sobre una muestra reducida:

| Prueba | Resultado |
|---|---|
| Fidelidad frente a referencia PyTorch float64 (67 tokens, logits completos) - Q8_0 | top-1 67/67, KL media 0.0048 |
| Fidelidad - Q6_K | top-1 67/67, KL media 0.0037 |
| Fidelidad - Q5_K_M | top-1 64/67, KL media 0.0065 |
| Fidelidad - Q4_K_M | top-1 63/67, KL media 0.0129 |
| Misma prueba con router estilo DeepSeek (control) | top-1 10/67, KL media 8.36 |
| Perplexidad en muestra mixta de 7 KB (2 fragmentos de 512 tokens) - Q4_K_M | 6.70 ± 0.80 |
| Perplexidad en la misma muestra - Q8_0 | 6.73 ± 0.81 |

Pruebas funcionales en CPU (Q4_K_M, AMD Ryzen 7 7800X3D, 8 hilos, 128 GB RAM, sin GPU):

| Prueba | Resultado | Prompt t/s | Generacion t/s |
|---|---|---|---|
| Explicacion en aleman (por que el cielo es azul) | correcta, aleman fluido | 52.7 | 14.2 |
| Poema en ingles | coherente | 39.4 | 14.9 |
| Problema aritmetico con respuesta verificable (razonamiento activado) | correcto: 1.5 | 62.5 | 13.2 |
| Llamada a herramienta (tiempo en Heidelberg) | llamada correcta `get_weather` con argumento `{"city": "Heidelberg"}` | 71.5 | 14.3 |
| Prompt de 1.393 tokens en aleman | resumen coherente de cuatro temas | 75.7 | 11.9 |

El autor advierte que la muestra de perplexidad es demasiado pequena para considerarse un benchmark y solo demuestra que el modelo no esta roto.

## Requisitos de hardware

- VRAM/RAM estimada por cuantizacion: Q4_K_M 47.5 GB en disco y 46.6 GB de RAM en CPU; Q5_K_M 55.6 GB; Q6_K 64.2 GB; Q8_0 83.1 GB en disco y 81.6 GB de RAM en CPU.
- No cabe en GPUs de consumo de gama alta de forma completa. El Q4_K_M de 47.5 GB excede los 24 GB de una RTX 4090 o los 16 GB de una RTX 4080, por lo que requiere CPU con mucha RAM o repartir el modelo entre VRAM y RAM.
- Ejecucion en CPU: el autor probo Q4_K_M y Q8_0 sin GPU. Q4_K_M genero entre 11.9 y 14.9 t/s con procesamiento de prompt de 39 a 76 t/s. Q8_0 alcanzo 9-10 t/s de generacion y 30-52 t/s de prompt.
- Tiempos de carga en CPU desde disco de red sin mmap: Q4_K_M tardo 478 s y Q8_0 638 s.
- Requiere un parche de llama.cpp: la arquitectura `kolibri1` no esta soportada en la version estandar. Se debe aplicar `kolibri1-llama.cpp.patch` sobre el commit `836d571` y compilar `llama-server` y `llama-cli`.
- Opciones de despliegue: llama.cpp (compilado con el parche). Ollama, LM Studio y otras aplicaciones basadas en llama.cpp no cargaran el archivo hasta que integren soporte para la arquitectura.
- Comando de ejemplo: `./build/bin/llama-server -m Kolibri-1-Q4_K_M.gguf -c 32768 --jinja --temp 1.0 --top-p 0.97 --top-k 128`.
- Para los archivos divididos (Q5_K_M, Q6_K, Q8_0) hay que apuntar llama.cpp a la primera parte; la segunda se carga automaticamente.
- Aviso del autor: los indicadores de hardware de HuggingFace solo cuentan memoria de GPU; estos archivos funcionan desde RAM del sistema y, con GPU, llama.cpp puede mantener parte en VRAM y el resto en RAM.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos verificados en la informacion proporcionada. El propio autor menciona el router sigmoide de DeepSeek-V3 como referencia arquitectonica (su modo de gating difiere), pero no se aportan cifras de rendimiento del modelo frente a alternativas. Se indica "no disponible" para los campos de rendimiento comparado.

| Modelo | Parametros | Contexto | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| Kolibri-1 (via esta conversion GGUF) | 78.103 millones totales, 3.46 mil millones activos | 32.768 tokens en el ejemplo | Apache-2.0 | no disponible |
| Alternativas MoE de razonamiento comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La arquitectura `kolibri1` no es compatible con llama.cpp estandar; sin aplicar el parche el archivo no carga. Ollama, LM Studio y aplicaciones similares no lo soportan todavia.
- Los backends de GPU (CUDA, Vulkan y Metal) no fueron probados por el autor. En CUDA, el router nuevo deberia recurrir a la ruta MoE sin fusionar, correcta pero mas lenta.
- El rendimiento en contextos superiores a 8.192 tokens no esta verificado.
- La muestra de perplexidad usada es demasiado pequena para extraer conclusiones de calidad; no sustituye a un benchmark.
- El modelo solo soporta aleman e ingles; no se documentan capacidades multilingues mas alla de estos dos idiomas.
- No se dispone de informacion sobre sesgos, comportamiento en dominios sensibles ni tasas de alucinacion medidas.
- Riesgo de alucinacion inherente a los modelos generativos; en tareas de tool calling conviene validar los argumentos antes de ejecutar acciones.
- La conversion es independiente y no esta respaldada por Aleph Alpha ni por el proyecto llama.cpp; la responsabilidad de la fidelidad de los quants recae en el autor de la conversion.
- Licencia Apache-2.0, que permite uso comercial, pero deben respetarse las condiciones de atribucion y las de los pesos originales del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Hob-forge/Kolibri-1-GGUF
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Parche de arquitectura: `kolibri1-llama.cpp.patch` (incluido en el repositorio GGUF)
