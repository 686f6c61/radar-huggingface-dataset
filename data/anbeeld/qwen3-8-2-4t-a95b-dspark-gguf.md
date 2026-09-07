# Anbeeld/Qwen3.8-2.4T-A95B-DSpark-GGUF

## Resumen

El repositorio Anbeeld/Qwen3.8-2.4T-A95B-DSpark-GGUF contiene cuantizaciones GGUF de un modelo borrador (draft model) para decodificación especulativa. El autor, Anbeeld, publica versiones GGUF de RadixArk/Qwen3.8-2.4T-A95B-DSpark, un especulador que acelera la inferencia del modelo objetivo Qwen3.8-2.4T-A95B, un MoE disperso con 2,4 billones de parámetros totales y unos 95B activos por paso, que emplea atención híbrida. Este draft model no es un modelo de lenguaje autónomo, sino un componente auxiliar que predice bloques de tokens para verificarlos en paralelo con el modelo principal, reduciendo la latencia de generación.

DSpark extiende el backbone DFlash con una cabeza de sesgo logit Markov y una cabeza de confianza por posición. Su arquitectura consta de 5 capas de atención completa estilo Qwen3 con GQA, tamaño oculto de 8192 y un tamaño de bloque de 7 tokens. Se ha entrenado mediante destilación en línea con SpecForge a partir de estados ocultos capturados de un motor SGLang en ejecución real. El formato GGUF de los pesos está pensado para usarse con BeeLlama.cpp, un fork de llama.cpp con características avanzadas de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ligero: 5 capas full-attention GQA, cabeza Markov y cabeza de confianza posicional |
| Parametros totales | 3.298.141.697 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 posiciones direccionables (esquema YaRN factor 32 sobre longitud base 8.192) |
| Tipos de cuantizacion | GGUF (no se detallan los tipos en la informacion disponible) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El draft model DSpark se basa en un backbone paralelo de DFlash y añade dos cabezas auxiliares: una cabeza de sesgo logit Markov y una cabeza de confianza por posición. La parte transformadora consta de 5 capas de atención completa con GQA (64 cabezas de consulta y 8 cabezas KV, con dimensiones de cabeza 128) y tamaño oculto de 8192. El bloque de borrado genera 7 tokens borradores, de modo que la verificación cubre 1 token actual más 7 tokens candidatos. Se contemplan capas auxiliares del modelo objetivo: capas 3, 19, 35, 55, 71, 87, además del estado oculto final tras la normalización.

El posicionamiento se resuelve con YaRN factor 32 sobre una longitud original de 8.192, lo que permite direccionar hasta 262.144 posiciones, el límite nativo del modelo objetivo según la model card. El entrenamiento se realizó con SpecForge mediante destilación en línea (online distillation) desde estados ocultos de un motor SGLang objetivo en funcionamiento. Los pesos de embedding y unembedding no están incluidos en este modelo borrador.

## Capacidades

- Prediccion en paralelo de hasta 7 tokens para decodificación especulativa, lo que reduce la latencia de generación del modelo Qwen3.8-2.4T-A95B.
- Integracion nativa con SGLang mediante el algoritmo DSPARK (`--speculative-algorithm DSPARK`).
- Uso con BeeLlama.cpp, fork de llama.cpp compatible con los GGUF publicados.
- Distincion entre probabilidades de tokens mediante cabeza de sesgo logit Markov y calibración de confianza por posición.
- Longitud de aceptación media variable entre 3,05 y 5,30 tokens en las cargas de trabajo evaluadas.
- No es un modelo conversacional ni de propósito general; no soporta tool calling, vision, audio ni generacion autonoma. Su funcion es exclusivamente la de asistir al modelo objetivo en decodificacion especulativa.

## Casos de uso

- Despliegue en produccion de Qwen3.8-2.4T-A95B con SGLang: integrar el draft model para acortar la latencia de token a token en sistemas de chat y asistentes que usan el modelo objetivo. El comando de servidor queda documentado en la model card, incluyendo TP8 sobre un nodo B300.
- Optimizacion de costes en GPU: al aceptar una media de 4 a 5 tokens por paso, el draft model permite amortizar el coste computacional del modelo principal en entornos con alta demanda de generacion.
- Evaluacion de especuladores: usar las cargas de trabajo publicadas (HumanEval, GSM8K, MATH500, MBPP, AIME25, etc.) para medir la longitud de aceptacion y comparar la eficacia del borrador.
- Experimentacion con cuantizaciones GGUF en BeeLlama.cpp: probar la decodificacion especulativa en entornos locales con recursos limitados antes de escalar a servidores con el modelo objetivo NVFP4.
- Investigacion en tecnicas de destilacion de estados ocultos: DSpark sirve como caso de estudio de SpecForge para entrenar especuladores a partir de un motor SGLang en vivo.
- Benchmarking de rendimiento de inferencia: la tabla de accept length presentada en la model card puede usarse para estimar la ganancia de velocidad esperada en workloads concretos, como generacion de codigo o matematicas, antes de comprometerse con el despliegue completo.

## Benchmarks y rendimiento

La model card publica unicamente la longitud de aceptacion media (accept length) por paso, medida con SGLang DSPARK en TP8 sobre un nodo de 8x B300, con el objetivo en NVFP4 y el draft model en BF16 sin cuantizar. No se incluyen resultados de benchmarks de calidad como MMLU o HumanEval, sino de eficiencia de decodificacion especulativa.

| Workload | Accept length | Prompts |
|---|---|---|
| humaneval | 5,30 | 128 |
| gsm8k | 4,89 | 128 |
| math500 | 4,85 | 128 |
| livecodebench | 4,72 | 128 |
| mbpp | 4,52 | 128 |
| aime25 | 4,43 | 30 |
| lbpp | 4,40 | 128 |
| aime26 | 4,35 | 30 |
| mtbench | 3,43 | 80 |
| arena_hard_v2 | 3,22 | 128 |
| alpaca | 3,05 | 128 |

## Requisitos de hardware

- El draft model en BF16 ocupa aproximadamente 6,6 GB de VRAM (3.298.141.697 parametros x 2 bytes). Las variantes GGUF del repositorio, que ocupan 19,9 GB en total, incluyen varias cuantizaciones; la VRAM necesaria dependera del tipo elegido.
- Para el modelo objetivo Qwen3.8-2.4T-A95B, la configuracion de referencia del benchmark requiere un nodo con 8 GPUs B300 en TP8, con el objetivo en NVFP4.
- El draft model por si solo puede ejecutarse en GPUs de consumo con 8 GB o mas, dependiendo de la cuantizacion seleccionada.
- Opciones de despliegue documentadas: SGLang (servidor) y BeeLlama.cpp (inferencia local con archivos GGUF).
- No se han publicado datos de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente en los datos proporcionados para realizar una comparativa cuantitativa con otros modelo borradores de la misma categoria. Cabe senalar que DSpark extiende el backbone de DFlash, pero no se ofrecen datos comparativos de longitud de aceptacion entre ambos en la model card.

## Limitaciones y advertencias

- Este modelo no es utilizable de forma independiente; requiere el modelo objetivo Qwen3.8-2.4T-A95B para producir resultados.
- Los pesos de embedding y unembedding no estan incluidos, por lo que no puede emplearse como modelo de lenguaje generativo por si mismo.
- La licencia no esta especificada, por lo que se debe verificar antes de cualquier uso comercial.
- No se informa de los idiomas soportados ni del rendimiento multilingue.
- La longitud de aceptacion varia notablemente segun el workload, oscilando entre 3,05 y 5,30 tokens por paso; las ganancias de velocidad no son uniformes.
- El entrenamiento se realizo mediante destilacion en linea de un motor SGLang especifico, por lo que el rendimiento puede degradarse al cambiar la configuracion de servidor o la version del motor.
- Al ser un draft model, no soporta tool calling, agentes ni razonamiento multi-paso de manera directa.
- El despliegue completo con el modelo objetivo exige hardware de alto nivel (nodo con 8x B300 en la configuracion de referencia), aunque el draft model en si sea ligero.

## Enlaces

- HuggingFace: https://huggingface.co/Anbeeld/Qwen3.8-2.4T-A95B-DSpark-GGUF
- Modelo base del draft: https://huggingface.co/RadixArk/Qwen3.8-2.4T-A95B-DSpark
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Objetivo NVFP4: https://huggingface.co/RadixArk/Qwen3.8-2.4T-A95B-NVFP4
- BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- SpecForge: https://github.com/sgl-project/SpecForge/
- SGLang: https://github.com/sgl-project/sglang
- QwenCloud (pagina del modelo objetivo): https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
