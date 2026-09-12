# Myric/gpt-oss-78B-GGUF

## Resumen

Myric/gpt-oss-78B-GGUF es un experimento de poda estructural sobre openai/gpt-oss-120b, el modelo MoE abierto de OpenAI. El autor elimina de forma uniforme los 43 expertos menos utilizados de cada una de las 36 capas del modelo (de 128 a 85 expertos por capa, manteniendo enrutamiento top-4), seleccionando que expertos concretos se descartan a partir de la frecuencia de uso real medida con un conjunto de calibracion diverso (prosa web, codigo y texto multilingue). El resultado pasa de 116,8B a 78,3B parametros totales y se distribuye unicamente en formato GGUF.

La relevancia de esta ficha es doble. Por un lado, es un caso de estudio poco habitual: el autor documenta de forma transparente el coste real de aplicar poda estructural sin entrenamiento de recuperacion, con mediciones reproducidas en dos implementaciones independientes de llama.cpp que coinciden en torno al 1%. Por otro, sirve como advertencia practica: la perplejidad en completado crudo de wikitext empeora un 28% relativo (de 213,65 a 273,36 con contexto de 512), mientras que el comportamiento agentico (tool calling encadenado y resolucion de tareas de codigo en varios ficheros) se mantiene practicamente intacto.

El modelo no incorpora destilacion, RL ni ajuste posterior de ningun tipo: es un corte estructural puro. La cuantizacion nativa del modelo base es MXFP4 (block-quantized, aproximadamente 4,25 bits por peso), lo que permite podar mediante `index_select` sobre los bytes ya empaquetados sin descomprimir los tensores. El propio autor concluye que, si el objetivo es disponer del gpt-oss mas pequeno posible para hardware limitado, el gpt-oss-20b nativo sigue siendo mejor opcion en la unica metrica dura disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 36 capas, enrutamiento top-4 |
| Parametros totales | 78.292.128.564 (78,3B) |
| Parametros activos | no disponible (no publicado por el autor; el enrutamiento top-4 sobre expertos de anchura identica al modelo base implica un orden de magnitud similar al de gpt-oss-120b) |
| Longitud de contexto | no disponible (la model card no lo especifica para este repo) |
| Tipos de cuantizacion | MXFP4 nativa (block-quantized, ~4,25 bits por peso) heredada del modelo base; el repo distribuye la conversion a GGUF (niveles concretos de cuantizacion GGUF no especificados) |
| Idiomas soportados | no disponible (la metadata no declara idiomas; el conjunto de calibracion del pruning incluyo texto multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (unico formato distribuido en este repo) |

Datos adicionales del repositorio: 44,8 GB de tamano, 201 descargas, 1 like, creado el 2026-08-03 y actualizado el 2026-09-12. Modelo base: openai/gpt-oss-120b (relacion declarada: quantized).

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de gpt-oss-120b: 36 capas de transformer con capas MoE de 128 expertos y enrutamiento top-4. Con `intermediate_size == hidden_size == 2880`, practicamente todo el peso del modelo (unos 115B de los 116,8B parametros reales) reside en las pilas FFN de expertos, mientras que la atencion y el resto de componentes son residuales en terminos de tamano. Esta concentracion es lo que hace viable la poda por expertos como estrategia de compresion.

El proceso de poda consta de cuatro pasos: primero se instrumenta la llamada de dispatch de expertos de cada capa durante un forward pass real sobre un conjunto de calibracion diverso (prosa web, codigo con licencia permisiva y texto multilingue, evitando el sesgo de usar solo prosa de Wikipedia en ingles); despues se descartan los 43 expertos menos usados de cada capa, con un recuento uniforme pero con ranking propio por capa, y se reasigna el router en consecuencia. La operacion se realiza como cirugia de tensores pura, sin descomprimir: todos los tensores indexados por experto (`gate_up_proj`, `down_proj`, escalas, sesgos y el propio router) tienen la dimension de experto como eje principal, de modo que la poda es un `index_select` sobre bytes MXFP4 empaquetados. Por ultimo, no se aplica ningun entrenamiento de recuperacion.

El autor justifica la ausencia de recuperacion con un argumento tecnico verificable: los kernels nativos de inferencia MXFP4 (Triton `matmul_ogs`) no tienen backward registrado, por lo que el gradiente no puede alcanzar al router ni a los expertos podados sin descomprimir al menos parte del modelo a bf16. Una descompresion completa del modelo podado requeriria unos 156 GB solo para los pesos, por encima del hardware disponible. La alternativa de descomprimir solo una cola de capas a bf16 entrenable, manteniendo el resto congelado en formato nativo, se describe como arquitectonicamente solida pero no se llego a implementar.

## Capacidades

- Generacion de texto conversacional: el modelo base esta fuertemente ajustado con RL y orientado a chat, no a completado crudo de prosa generica.
- Tool calling encadenado: supera la puerta de llamadas a herramientas encadenadas en 3 de 3 intentos, incluyendo el paso correcto de argumentos y la resistencia a una herramienta distractora.
- Comportamiento agentico: conserva la capacidad de resolver flujos multi-paso con herramientas, que es el caso de uso principal para el que se diseno la familia gpt-oss.
- Generacion de codigo: resuelve 4 de 5 tareas de codigo de nivel duro por completo y obtiene credito parcial en la quinta (47/59 puntos, 79,7%).
- Capacidades multilingues: no verificadas de forma especifica en este modelo; el conjunto de calibracion incluyo texto multilingue para no sesgar la seleccion de expertos por dominio.
- Razonamiento explicito, vision, audio, modo thinking: no disponible en la informacion proporcionada para este repo concreto.

## Casos de uso

- Despliegue agentico en hardware de gama alta pero no de centro de datos: el modelo conserva el tool calling encadenado y cabe en una unica GPU de 48-80 GB en GGUF MXFP4, lo que permite montar agentes con acceso a herramientas sin recurrir a un cluster multi-GPU.
- Automatizacion de tareas de codigo en varios ficheros: con un 79,7% de credito parcial y 4 de 5 tareas duras resueltas, es adecuado para pipelines de refactorizacion o generacion de parches supervisados por revision humana, no para sustitucion automatica sin validacion.
- Evaluacion comparativa de tecnicas de compresion: sirve como referencia empirica del coste de la poda estructural sin recuperacion frente a alternativas como Puzzle NAS con destilacion, util para decidir si merece la pena invertir en un pipeline de recuperacion.
- Investigacion sobre especializacion de expertos en MoE: al publicarse el criterio de seleccion basado en uso real medido, es un punto de partida para estudiar si los expertos descartados coinciden entre dominios y si el sesgo del corpus de calibracion altera la calidad resultante.
- Prototipado con llama.cpp en estaciones de trabajo: al funcionar con kernels estandar de llama.cpp, se puede desplegar con `llama-server` u Ollama sin necesidad de kernels personalizados, a diferencia de otras compresiones de la misma familia.
- Sustitucion del modelo de 120B en entornos con presupuesto de VRAM ajustado: cuando la reduccion de 116,8B a 78,3B parametros libera memoria suficiente para anadir cache KV larga o varios procesos concurrentes, manteniendo el comportamiento de herramienta.
- Generacion de texto con requisitos de calidad moderada y coste bajo: util para tareas de resumen, clasificacion o extraccion donde el 28% de degradacion en perplejidad cruda no se traduzca en fallos funcionales, siempre con validacion previa en el dominio concreto.

## Benchmarks y rendimiento

| Metrica | gpt-oss-120b original | gpt-oss-78B (este modelo) | gpt-oss-20b nativo |
|---|---:|---:|---:|
| Parametros totales | 116,8B | 78,3B | 20,9B |
| Capas × expertos por capa | 36 × 128 | 36 × 85 | 24 × 32 |
| Perplejidad, completado crudo de wikitext (ctx 512) | 213,65 | 273,36 | 159,93 |
| Puerta de tool calling encadenado (3 intentos) | 3/3 | 3/3 | 3/3 |
| Benchmark de codigo tier duro (5 tareas, credito parcial) | no probado | 47/59 (79,7%), 4/5 resueltas completas | no probado |

Las cifras proceden de ejecuciones reales de `llama-perplexity` y `llama-server`, validadas en dos implementaciones independientes de llama.cpp (mainline `ggml-org/llama.cpp` y un fork con soporte de Puzzle) que coinciden dentro de aproximadamente el 1%, con el mismo corpus y los mismos ajustes. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 42-45 GB para los pesos en MXFP4 (78,3B parametros a ~4,25 bits por peso), coherente con los 44,8 GB del repositorio. Hay que anadir la cache KV, cuyo tamano depende de la longitud de contexto configurada y no se especifica en la informacion disponible.
- GPU recomendadas: una A100 80 GB o H100 80 GB ejecutan el modelo completo en una sola tarjeta con margen para contexto largo; una RTX 6000 Ada (48 GB) o L40S (48 GB) quedan en el limite inferior.
- Viabilidad en GPU de consumo: no cabe en una RTX 4090 (24 GB). Requiere repartir el modelo entre dos RTX 4090 (48 GB agregados) o entre una RTX 5090 y memoria del sistema mediante offload de capas en llama.cpp. En Mac con memoria unificada de 64 GB o superior es viable.
- Opciones de despliegue: llama.cpp y `llama-server` son el entorno natural, dado el formato GGUF y la validacion realizada sobre llama.cpp. Ollama puede importar GGUF, aunque la compatibilidad concreta con MXFP4 debe verificarse. El soporte de vLLM, TGI o SGLang para este GGUF no esta confirmado en la informacion disponible; vLLM soporta gpt-oss con kernels MXFP4 nativos, pero no necesariamente este artefacto podado.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos por capa | Perplejidad wikitext (ctx 512) | Tool calling (3) | Requiere kernel especial | Licencia |
|---|---|---|---|---|---|---|
| Myric/gpt-oss-78B-GGUF | 78,3B | 36 × 85 | 273,36 | 3/3 | No (llama.cpp estandar) | apache-2.0 |
| openai/gpt-oss-120b | 116,8B | 36 × 128 | 213,65 | 3/3 | No | apache-2.0 |
| openai/gpt-oss-20b | 20,9B | 24 × 32 | 159,93 | 3/3 | No | apache-2.0 |
| NVIDIA gpt-oss-puzzle-88B | 88B | heterogeneo por capa (Puzzle NAS) | no disponible | no disponible | Si | no disponible en la informacion proporcionada |

La comparacion directa con el Puzzle 88B de NVIDIA es la mas relevante metodologicamente: aquel usa NAS heterogeneo con distinto numero y anchura de expertos por capa, mas destilacion de conocimiento, RL y sustitucion de atencion por ventana para recuperar calidad, y a cambio exige un kernel especial que no esta disponible en frameworks LLM estandar. El modelo aqui descrito renuncia a la recuperacion de calidad para mantenerse ejecutable en llama.cpp convencional.

## Limitaciones y advertencias

- Degradacion medible de calidad: la perplejidad en completado crudo de wikitext empeora un 28% relativo respecto al modelo original (273,36 frente a 213,65) por la ausencia total de entrenamiento de recuperacion. Es un coste real, no simulado.
- La perplejidad cruda es un mal indicador para esta familia: el gpt-oss-20b nativo, cuatro veces mas pequeno, obtiene mejor puntuacion en esa metrica (159,93) que cualquiera de las dos configuraciones de 120B, porque la familia esta fuertemente ajustada con RL y chat en lugar de optimizada para completado de prosa generica.
- El propio autor desaconseja su uso como opcion por defecto: si el objetivo es el gpt-oss mas pequeno posible para hardware limitado, el gpt-oss-20b nativo, entrenado a ese tamano en lugar de recortado quirurgicamente, es mejor respuesta en la unica metrica dura disponible y ademas ocupa menos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. La poda sin recuperacion tiende a aumentar la degradacion en dominios poco representados en el corpus de calibracion, pero no hay mediciones especificas.
- Cobertura de evaluacion muy estrecha: el benchmark de codigo se limita a 5 tareas y la puerta de tool calling a 3 intentos. Son muestras demasiado pequenas para extrapolar a produccion.
- Idiomas: no hay evaluacion por idioma. La seleccion de expertos a podar dependio de un corpus multilingue, pero no se verifica si el rendimiento en idiomas distintos del ingles se degrada mas que la media.
- Entrenamiento posterior inviable en la practica: los kernels nativos MXFP4 no tienen backward registrado, y descomprimir el modelo podado a bf16 para ajuste fino requeriria del orden de 156 GB solo en pesos.
- Adopcion muy baja: 201 descargas y 1 like en el momento de redactar esta ficha, con lo que la validacion por parte de terceros es practicamente nula.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base openai/gpt-oss-120b, del que este artefacto deriva.
- Ausencia de datos clave para planificacion: no se publican parametros activos, longitud de contexto admitida, niveles de cuantizacion GGUF concretos ni mediciones de latencia o throughput.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Myric/gpt-oss-78B-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Implementacion de referencia llama.cpp: https://github.com/ggml-org/llama.cpp
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas realizadas devolvieron exclusivamente paginas sin relacion con el contenido (sitios de conciertos y entradas de una artista musical), por lo que no se incluye ningun enlace de esa busqueda.
