# dowands/NeoJev-Qwen3.8-27B-L56

## Resumen

NeoJev-Qwen3.8-27B-L56 es un modelo derivado de Qwen/Qwen3.8-27B-FP8 publicado por el usuario dowands. No es un modelo generativo: es un clasificador de decisiones tipadas. Recibe un texto de entrada (el "estado") y un conjunto de preguntas definidas por el esquema, y devuelve en una única pasada hacia delante una de las opciones facilitadas, la probabilidad de cada opción y una confianza. Al no generar texto ni parsear salidas, es imposible por construcción obtener una respuesta fuera del esquema.

El modelo se construye truncando el checkpoint oficial de Qwen3.8-27B-FP8 a sus primeras 56 capas de decoder (de 64), lo que reduce el peso a 13,4 GB frente a los aproximadamente 16 GB del modelo completo y recorta el cómputo un 12,5%. Sobre la representación de la capa 56 se aplica una cabeza de lectura ligera de rango 1024 entrenada por autodestilación desde el modelo completo de 64 capas. El resultado son 24.312.578.992 parámetros en formato FP8 (27,4 GB de repositorio) que caben en una GPU con FP8 y unos 26 GB de memoria.

Su relevancia actual es doble: por un lado, ofrece una alternativa local y abierta a la idea de "modelo de Sistema 1" con decisiones tipadas popularizada por Jev, de TypeSafe AI (proyecto independiente, sin afiliación ni respaldo); por otro, demuestra que una cabeza de lectura entrenada en MLX 4-bit transfiere a CUDA FP8 sin reentrenamiento, con una precisión media medida de 0,727 y 0,724 respectivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B, multimodal) truncado a 56 de 64 capas de decoder, mas una cabeza de lectura de rango 1024 y la norm final y LM head del modelo original |
| Parametros totales | 24.312.578.992 (unos 24,3B) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (build CUDA, este repositorio); 4-bit (build MLX, repositorio separado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, mas la cabeza de lectura en decider_head.npz |
| Tarea declarada | text-classification (decisiones tipadas, no generacion) |
| Tipos de pregunta | choice (2 a 16 opciones), score (niveles ordenados con expected_index), noul (probabilidad de que una afirmacion sea cierta) |
| Modelo base | Qwen/Qwen3.8-27B-FP8 |
| Tamano del repositorio | 27,4 GB |
| Libreria | transformers 5.16.1 (con parche FP8), torch 2.11.0, kernels 0.16.0, flash-linear-attention, causal-conv1d 1.7.0, accelerate |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso heredado de Qwen3.8-27B, del que solo se conservan las primeras 56 capas de decoder. El repositorio incluye dependencias propias de mecanismos de atencion lineal (flash-linear-attention y causal-conv1d), aunque la model card no detalla la composicion exacta de capas del modelo base. Sobre la activacion de la capa 56 se aplica una cabeza de lectura con la forma `h + (h U) V + b + c[position]`, de rango 1024, seguida de la norm final y la LM head originales. La atencion se organiza por posiciones de disparo: las preguntas se prellenan una vez por esquema (y se cachean con `cache_schema=True`, LRU de 64 esquemas), y cada llamada ejecuta solo el estado mas un disparo corto por pregunta (`Q1:`, `Q2:`...), todo en una sola pasada; la respuesta de cada pregunta se lee en su posicion de disparo. La capa 56 sola es un mal punto de lectura: el "logit lens" directo obtiene 0,663 de precision media en el conjunto de evaluacion del autor.

El entrenamiento de la cabeza es por autodestilacion, no por ajuste supervisado con etiquetas. El objetivo es la distribucion de opciones del modelo completo de 64 capas en el layout de prompt original, sobre 4.000 textos con preguntas generadas aleatoriamente (10.035 preguntas, dato truncado en la model card). La misma cabeza (`decider_head.npz`) se comparte entre ambos backends y transfirio de MLX 4-bit a CUDA FP8 sin reentrenamiento. El checkpoint FP8 presenta dos problemas conocidos en transformers 5.16: el cuantizador FP8 falla en modelos densos porque busca un ajuste de expertos MoE, y, mas grave, la lista `modules_to_not_convert` del checkpoint oficial incluye nombres de router MoE (`...mlp.gate`) que hacen prefijo con el `mlp.gate_proj` denso, de modo que cada proyeccion gate se carga como bytes FP8 sin sus escalas y el modelo produce basura sin dar error. El `config.json` de este repositorio ya tiene esas entradas eliminadas.

## Capacidades

- Clasificacion con opciones cerradas (`choice`): elige una de entre 2 y 16 opciones y devuelve la probabilidad de cada una.
- Puntuacion ordenada (`score`): selecciona un nivel de una lista ordenada, devuelve las probabilidades por nivel y un `expected_index` (indice esperado), util para calibracion.
- Verificacion de afirmaciones (`noul`): devuelve la probabilidad de que una afirmacion dada sea cierta.
- Decisiones tipadas en una sola pasada hacia delante, sin generacion de texto y sin parseo posterior; la salida no puede salirse del esquema.
- Salida probabilistica calibrable por pregunta, con confianza asociada a cada decision.
- Procesamiento por lotes implicitos dentro de una misma llamada: varias preguntas sobre el mismo estado se resuelven en un unico forward pass.
- Cache de esquemas: con `cache_schema=True` se cachea el prefijo de preguntas por esquema (LRU, 64 esquemas), lo que acelera los flujos donde se repiten las mismas preguntas sobre textos distintos.
- Servicio con API compatible con TypeSafe: `server.py` expone `POST /v1/systemone` con la forma de peticion y respuesta de esa API, de modo que clientes existentes y el adaptador `TypeSafeAdapter` de JevBench funcionan sin cambios.
- Dos backends con la misma cabeza de lectura: Apple Silicon via MLX y NVIDIA via PyTorch.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso en el sentido de un LLM generativo: la model card indica explicitamente que las respuestas provienen de la lectura de la cabeza, no de `generate()`.
- Capacidades multilingues: no disponibles (los idiomas soportados no se documentan).

## Casos de uso

- Triaje de tickets de soporte: una llamada `choice` sobre el asunto y el cuerpo del ticket asigna la cola correcta (por ejemplo, facturacion, soporte tecnico o ventas) en un unico forward pass. Con una latencia mediana de 107 ms en una L20, es viable clasificar en linea dentro del propio flujo de entrada del ticket.
- Deteccion de riesgo de abandono: el tipo `noul` permite evaluar afirmaciones como "el cliente es probable que se vaya" y obtener una probabilidad directamente consumible por un sistema de alertas, sin necesidad de umbralizar texto generado.
- Enrutado de leads y correo comercial: con un esquema `choice` fijo y `cache_schema=True`, el prefijo de preguntas se cachea entre llamadas, de modo que clasificar miles de mensajes con las mismas preguntas reutiliza el prellenado y reduce el coste por peticion.
- Priorizacion de incidencias: el tipo `score` con niveles ordenados (baja, media, alta) devuelve ademas `expected_index`, lo que permite ordenar una cola de trabajo por gravedad esperada en lugar de por una etiqueta discreta.
- Clasificacion documental en pipelines ETL: cualquier etapa que hoy use un modelo de clasificacion puede sustituirse por una llamada con opciones cerradas, y al estar construida la salida sobre el esquema, no hay que validar formatos ni tratar respuestas invalidas.
- Evaluacion de opcion multiple como clasificacion: con `cache_schema=False` se pueden pasar opciones que cambian en cada llamada (por ejemplo, las alternativas de una pregunta de examen) y leer la distribucion sobre ellas, util para medir el conocimiento del modelo base sin generar texto.
- Componente de "Sistema 1" en arquitecturas de agentes: usar la decision tipada y barata como primer filtro antes de invocar un LLM generativo, reservando el modelo grande para los casos que la cabeza marque como ambiguos segun su confianza.
- Investigacion sobre calibracion y decodificacion: al devolver probabilidades por opcion y un indice esperado, el modelo sirve como banco de pruebas para estudiar calibracion de decisiones tipadas frente a la generacion libre.
- Moderacion y verificacion de afirmaciones: el tipo `noul` permite comprobar si un texto afirma un hecho concreto y obtener una probabilidad, integrable en colas de revision humana por orden de riesgo.

## Benchmarks y rendimiento

Datos publicados en la model card del autor, sobre su propio conjunto de evaluacion (no son benchmarks estandar):

| Backend | Pesos | Hardware medido | Precision media | Latencia mediana / p99 |
|---|---|---|---|---|
| Apple Silicon (MLX) | 4-bit, 56 capas | M5 Pro 64 GB | 0,727 | 310 / 571 ms |
| NVIDIA GPU (PyTorch) | FP8, 56 capas | L20 48 GB | 0,724 | 107 / 133 ms |

Referencia interna del propio autor: leer las opciones directamente de la capa 56 con "logit lens" simple da 0,663 de precision media, frente a 0,727 y 0,724 con la cabeza entrenada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar para este modelo derivado en la informacion disponible. Tampoco hay datos de benchmarks para la tarea de decision tipada en modelos comparables.

## Requisitos de hardware

- VRAM para inferencia: el autor indica aproximadamente 26 GB para el build CUDA FP8. El repositorio ocupa 27,4 GB en disco.
- GPU compatibles con FP8: se requiere una GPU con soporte FP8 (arquitectura Ada, Hopper o posterior). Medido en una NVIDIA L20 de 48 GB.
- GPU recomendadas: L20, L40S, H100 y, en general, cualquier GPU Ada o Hopper con al menos 26 GB de memoria. Una RTX 4090 (Ada, 24 GB) no cumple el requisito de memoria indicado por el autor.
- Consumer GPU: el build CUDA no cabe en GPUs de consumo de 24 GB. Para equipos Apple Silicon existe el build MLX 4-bit, medido en un M5 Pro con 64 GB de memoria unificada.
- Opciones de despliegue: `decider_cuda.py` (PyTorch) para NVIDIA y `decider.py` (MLX) para Apple Silicon, ambos cargando los pesos y la cabeza de lectura desde Hugging Face en el primer uso. Para servicio, `server.py` expone `POST /v1/systemone` con el formato de TypeSafe y atiende una peticion a la vez. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo generativo (las respuestas salen de la cabeza de lectura, no de `generate()`), esos stacks no aplican sin portar el metodo.
- Dependencias fijadas por el autor: torch 2.11.0, transformers 5.16.1, kernels 0.16.0, flash-linear-attention, causal-conv1d 1.7.0 y accelerate. transformers 5.16 necesita ademas el parche del cuantizador FP8 incluido en `decider_cuda.py` (`_patch_fp8_dense`).
- Latencia y throughput: latencia mediana de 107 ms y p99 de 133 ms en L20; 310 ms y 571 ms respectivamente en M5 Pro. El autor no publica cifras de throughput; el servidor procesa una peticion simultanea por instancia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Precision medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NeoJev-Qwen3.8-27B-L56 (CUDA FP8) | 24,3B | no disponible | Decisiones tipadas (choice, score, noul) | 0,724 media en el conjunto del autor; 107/133 ms en L20 | apache-2.0 | Hugging Face, transformers, GPU FP8 |
| NeoJev-Qwen3.8-27B-L56-MLX | no disponible (mismo modelo, 4-bit) | no disponible | Decisiones tipadas | 0,727 media; 310/571 ms en M5 Pro | apache-2.0 | Hugging Face, MLX, Apple Silicon |
| Qwen/Qwen3.8-27B-FP8 (modelo base) | 27B nominal, segun el nombre del checkpoint base | no disponible | LLM multimodal denso generativo | no disponible para la tarea de decision tipada | no disponible en la informacion proporcionada | Hugging Face, entrenamiento e inferencia generativa |

Comparativa cualitativa: frente al modelo base, NeoJev sacrifica 8 de las 64 capas y la capacidad de generar texto a cambio de una salida estructurada, probabilistica y de baja latencia, con una precision de 0,724 en la tarea de decision. Frente a un clasificador discriminativo clasico, aporta esquemas flexibles en tiempo de ejecucion (opciones definidas por llamada hasta 16 alternativas, niveles ordenados y verificacion de afirmaciones) sin reentrenamiento. No se dispone de datos publicos de Jev (TypeSafe AI) ni de otros modelos de decision tipada para una comparacion cuantitativa.

## Limitaciones y advertencias

- Precision media de 0,72 en el conjunto de evaluacion del propio autor: aproximadamente una de cada cuatro decisiones es incorrecta. No es adecuado como unico criterio en flujos con consecuencias legales, medicas o financieras.
- El conjunto de evaluacion es interno y se solapa con la metodologia de autodestilacion (4.000 textos y 10.035 preguntas generadas aleatoriamente); no hay validacion externa ni resultados en benchmarks publicos, por lo que la precision real fuera de dominio es desconocida.
- Riesgo de deriva fuera de distribucion: al leer de la capa 56 con una cabeza entrenada sobre preguntas generadas, el comportamiento con esquemas muy distintos a los del entrenamiento no esta caracterizado.
- Solo tres tipos de pregunta (choice, score, noul) y un maximo de 16 opciones por pregunta de tipo choice. No hay soporte de texto libre, extraccion de entidades ni salidas anidadas.
- No genera texto: no se puede usar para resumen, redaccion, codigo, matematicas ni dialogo. Las respuestas provienen de la lectura de la cabeza, no de `generate()`.
- Idiomas soportados no documentados; no hay garantia de comportamiento multilingue aunque el modelo base si lo sea.
- Longitud de contexto no disponible. Al conservar solo 56 de 64 capas, no debe asumirse el contexto del modelo base.
- Compatibilidad fragil con transformers 5.16: el cuantizador FP8 falla en modelos densos y la lista `modules_to_not_convert` del checkpoint oficial hace que las proyecciones gate se carguen sin escalas, produciendo salidas basura sin errores. El `config.json` de este repositorio corrige el segundo problema; quien porte el metodo debe verificar ambos.
- El servidor incluido atiende una peticion a la vez; para produccion con concurrencia hay que desplegar varias instancias o reescribir el servicio.
- Requiere hardware con FP8 y unos 26 GB de memoria, lo que excluye GPUs de consumo de 24 GB en el build CUDA.
- Proyecto independiente sin afiliacion ni respaldo de TypeSafe AI, pese a inspirarse en Jev. Ademas, el repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- Licencia apache-2.0, que permite uso comercial del modelo derivado, pero conviene verificar por separado las condiciones del checkpoint base Qwen/Qwen3.8-27B-FP8, no documentadas en la informacion proporcionada.
- La model card proporcionada esta truncada; pueden existir detalles adicionales de entrenamiento y evaluacion no recogidos aqui.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dowands/NeoJev-Qwen3.8-27B-L56
- Build MLX 4-bit para Apple Silicon: https://huggingface.co/dowands/NeoJev-Qwen3.8-27B-L56-MLX
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Qwen3.8 (QwenLM): https://github.com/QwenLM/Qwen3.8
- Repositorio de Qwen3.8-27B (AlibabaCloud-Official): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Pagina del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Guia de ejecucion local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
