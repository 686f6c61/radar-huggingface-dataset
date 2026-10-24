# OsaurusAI/d3-JANG_4M

## Resumen

OsaurusAI/d3-JANG_4M es un paquete cuantizado en formato JANG (MLX) del modelo vllm-sr/d3, un modelo de decisión multimodal de 26.085.330.160 parámetros (26,09B) construido a su vez sobre Qwen/Qwen3.8-27B y asociado al router semántico de vLLM (Decision 3.0). No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente con imágenes y vídeo) junto con preguntas tipadas y devuelve, en una sola pasada forward, una distribución de probabilidad sobre las opciones de cada pregunta (elegir entre varias opciones, sí/no o una puntuación en una escala ordenada). No emite texto.

La relevancia de este paquete concreto es de eficiencia: comprime los 52,2 GB en BF16 hasta 19,31 GB (5,92 bits por peso de media) manteniendo, según el autor, la misma decisión que el modelo de precisión completa en el 98,45 % de 2.000 peticiones del test de tasksource/tasksource-jev-typed-decisions, con una accuracy sobre gold de 84,0 % frente a 84,2 % del BF16. Está pensado para ejecutarse en Apple Silicon mediante el runtime Osaurus (versión 0.25.26 o superior), lo que permite llevar un modelo de clase 27B a equipos de sobremesa con memoria unificada.

La mezcla de precisión es selectiva: capas MLP en 4 bits afín, atención, atención lineal, embeddings y torre de visión en 8 bits afín, y el cabezal de respuesta de 255 vías conservado en FP32 byte a byte. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa y atención lineal (híbrida), más torre de visión para imágenes y vídeo; cabezal de decisión de 255 vías (`decision/readout.safetensors`) |
| Parametros totales | 26.085.330.160 (26,09B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG: MLP (gate/up/down) afín 4 bits; atención, atención lineal, embeddings y torre de visión afín 8 bits; cabezal de decisión en FP32; entradas de las puertas de atención lineal en BF16. Media de 5,92 bits por peso |
| Idiomas soportados | `en` y `multilingual` (sin desglose por idioma en la información disponible) |
| Licencia | Apache-2.0 (con `NOTICE` y `LICENSE` heredados de vllm-sr/d3) |
| Formato de pesos | safetensors en shards, formato JANG para MLX (`library_name: mlx`); no se ofrece GGUF |
| Tamano del repositorio | 19,3 GB (19,31 GB en shards); el modelo en BF16 ocuparía 52,2 GB |
| Modelo base | vllm-sr/d3 (relación: quantized), construido sobre Qwen/Qwen3.8-27B |
| Tarea declarada | `zero-shot-classification` (modelo de decisión, no generativo) |
| Runtime requerido | Osaurus 0.25.26 o superior |
| Cuantizador | Osaurus (eric@osaurus.ai) |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3 es un transformer multimodal de 26,09B parámetros que combina atención completa bidireccional con capas de atención lineal, e incorpora una torre de visión que procesa imágenes y fotogramas de vídeo. La salida no es texto sino un cabezal de lectura de 255 vías que produce una probabilidad por opción en una única pasada forward; el paquete conserva ese cabezal en FP32 sin modificar. El formato de entrada es el "decision prompt" del modelo: un estado (texto o JSON, opcionalmente acompañado de imágenes o vídeo) más una o varias preguntas tipadas.

El proceso de cuantización descrito por el autor es consciente de activaciones: la calibración ejecutó el forward de decisión propio de d3 (atención bidireccional completa, formato de prompt de decisión, imágenes y vídeos) sobre 2.778 prompts de decisión y 1,81 millones de tokens, cubriendo preguntas de routing sobre peticiones reales, selección de herramientas sobre listas reales de hasta 255 opciones, trazas de agentes y terminal, código, seguridad, documentos largos, decisiones tipadas, imágenes y vídeos de pantalla. Las escalas conscientes de activaciones (AWQ) se pliegan en las normas y proyecciones productoras, y cada MLP cuantizado se redondea con GPTQ usando hessianos de ese forward, manteniendo el módulo solo cuando supera al redondeo simple. No se documentan en la información disponible detalles sobre el número de tokens de preentrenamiento del modelo base ni sobre etapas de RLHF/DPO.

## Capacidades

- Decisión tipada en una sola pasada: elegir una opción entre varias, responder sí/no, o asignar una puntuación en una escala ordenada, devolviendo probabilidades por opción en lugar de texto.
- Selección de herramientas y routing: el cabezal admite hasta 255 opciones, lo que cubre listas de herramientas grandes y decisiones de enrutamiento entre modelos o servicios.
- Entrada multimodal: acepta texto, JSON, imágenes y vídeo (incluidos vídeos de pantalla), según la calibración descrita por el autor.
- Evaluación de estados de agente y trazas de terminal, código y seguridad como tipos de decisión soportados en calibración.
- Procesamiento de documentos largos como estado de entrada (aunque la longitud de contexto no está documentada).
- Clasificación zero-shot: la tarea declarada en el pipeline permite clasificar sin ejemplos específicos por clase.
- Multilingüe según la etiqueta del modelo, con `en` como idioma principal declarado; no hay métricas por idioma publicadas.
- No soporta generación de texto, tool calling generativo ni razonamiento multi-paso explícito: la decisión se resuelve en un único forward.

## Casos de uso

- Routing de peticiones en una puerta de enlace de LLM: dado el prompt de un usuario como estado, el modelo decide a qué modelo o proveedor enrutarlo devolviendo la probabilidad de cada destino; su formato de una sola pasada evita el coste de generar texto antes de decidir.
- Selección de herramientas en agentes con catálogos grandes: con hasta 255 opciones por pregunta, se puede puntuar directamente qué herramienta de un registro amplio corresponde a la petición, sin pasar el catálogo por un modelo generativo.
- Guardarraíles y moderación: formular preguntas binarias ("¿es seguro?", "¿requiere revisión humana?") y usar la probabilidad de la clase positiva como umbral calibrable en lugar de parsear la salida de un LLM.
- Filtrado previo en RAG: decidir si un fragmento recuperado es relevante para la consulta antes de invocar al modelo generador, reduciendo tokens de contexto y latencia en el pipeline.
- Comprensión de interfaces para agentes de navegador: al aceptar vídeo de pantalla e imágenes, puede decidir sobre el estado visual de una UI (por ejemplo, qué elemento o acción corresponde) combinando píxeles y texto.
- Puntuación de calidad sobre escala ordenada: evaluar respuestas o trayectorias de agente con una nota ordinal y usar la distribución completa como señal, útil en pipelines de evaluación automática y selección de candidatos.
- Clasificación por lotes de documentos o tickets: al no generar texto, el coste por ítem es una sola pasada, lo que hace viable etiquetar grandes volúmenes en un Mac con memoria unificada suficiente.
- Ejecución local en estación de trabajo Apple Silicon: al caber en 19,31 GB, permite mantener el clasificador de decisiones en la misma máquina que el resto del stack sin depender de GPUs en cloud.

## Benchmarks y rendimiento

Concordancia con el modelo de precisión completa (BF16). "Decisions" cuenta la misma opción top (o el mismo lado de 0,5 en sí/no); KL se mide sobre las probabilidades de las opciones de cada pregunta. Según el autor, ninguna de estas preguntas se usó para calibración.

| Conjunto de test | Preguntas | Decisions | KL media (menor mejor) | Accuracy gold, BF16 → este paquete |
|---|---|---|---|---|
| Decision Index 0.3 public suite (41 benchmarks) | 1.610 | 98,07 % | 0,0024 | 78,9 % → 78,8 % |
| LocalLLaMA/typed-decisions test (gold blando) | 800 | 98,12 % | 0,0007 | 73,4 % → 74,0 % |
| Decisiones held-out sobre textos, imágenes y vídeos propios | 487 | 97,74 % | 0,0026 | no disponible |
| tasksource/tasksource-jev-typed-decisions test (subconjunto de 2.000 peticiones) | 2.000 | 98,45 % | 0,0014 | 84,2 % → 84,0 % |

Comparación entre los tres paquetes JANG del mismo autor:

| Paquete | Tamano | Decisions (tasksource, 2.000) | Decisions (suite) | KL media (suite) |
|---|---|---|---|---|
| d3-JANG_6M | 23,6 GB | 99,35 % | 99,38 % | 0,0003 |
| d3-JANG_4M | 19,3 GB | 98,45 % | 98,07 % | 0,0024 |
| d3-JANGH2 | 14,5 GB | 93,45 % | 93,17 % | 0,0345 |

Paquetes cuantizados del proveedor (formatos NVIDIA/AMD), tal como los reporta el autor sobre las 14.031 peticiones de test del mismo dataset, con su mapeo de peticiones y su hardware; no son directamente comparables con las filas anteriores por diferir el conjunto evaluado:

| Paquete del proveedor | Decisions | Memoria |
|---|---|---|
| FP8 | 99,08 % | 31,9 GB |
| W4A16 GPTQ (grupo 128) | 97,98 % | 16,4 GB |
| W4A16 AWQ (grupo 128) | 97,76 % | 16,5 GB |
| NVFP4 | 96,64 % | 17,2 GB |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks generativos, coherente con que el modelo no genere texto. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria: 19,31 GB solo para los pesos en este paquete; el modelo en BF16 requiere 52,2 GB. Hay que sumar el overhead de activaciones, del tokenizador y del procesador de visión (estimación propia a partir del tamaño de los shards; el autor no publica cifras de memoria en ejecución).
- Plataforma: el paquete es MLX, por lo que el destino natural es Apple Silicon con memoria unificada. Con 19,31 GB de pesos, un equipo de 24 GB queda muy justo; 32 GB o más es el escenario razonable para uso con imágenes y vídeo.
- GPU NVIDIA/AMD: este bundle JANG no está pensado para ellas. Para esos entornos existen el modelo base en FP8 (31,9 GB) o los paquetes W4A16 GPTQ/AWQ (16,4-16,5 GB) y NVFP4 (17,2 GB) que reporta el proveedor, desplegables con vLLM.
- Consumer GPU: no hay ruta documentada para GPUs de consumo tipo RTX 4090 (24 GB) con este formato; el camino equivalente sería un paquete GPTQ/AWQ de 16,4 GB del modelo base, fuera del alcance de esta ficha.
- Opciones de despliegue: runtime Osaurus 0.25.26 o superior (requisito explícito del autor); el stack MLX subyacente permite carga de safetensors cuantizados. No hay GGUF, por lo que llama.cpp y Ollama no son opciones directas para este bundle.
- Latencia y throughput: no disponibles. Como referencia cualitativa, cada decisión se resuelve en una sola pasada forward sin generación autorregresiva, lo que elimina el coste de decodificación token a token.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Decisions (tasksource, 2.000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d3-JANG_4M (este) | 26,09B | 19,3 GB | no disponible | 98,45 % | Apache-2.0 | MLX / Osaurus |
| d3-JANG_6M | 26,09B (mismo base) | 23,6 GB | no disponible | 99,35 % | Apache-2.0 | MLX / Osaurus |
| d3-JANGH2 | 26,09B (mismo base) | 14,5 GB | no disponible | 93,45 % | Apache-2.0 | MLX / Osaurus |
| Paquete W4A16 GPTQ del proveedor | 26,09B (mismo base) | 16,4 GB en memoria | no disponible | 97,98 % sobre 14.031 peticiones, no comparable directamente | Apache-2.0 | NVIDIA/AMD, vLLM |
| Paquete NVFP4 del proveedor | 26,09B (mismo base) | 17,2 GB en memoria | no disponible | 96,64 % sobre 14.031 peticiones, no comparable directamente | Apache-2.0 | NVIDIA, vLLM |

No se dispone de información sobre modelos de decisión comparables de otros autores (por ejemplo, clasificadores dedicados de routing o guardarraíles) con la que construir una comparación rigurosa: no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, así que no puede usarse para chat, resumen, código ni razonamiento multi-paso. Sustituye a un LLM solo en la parte de decisión.
- Requiere el formato de prompt de decisión de d3 y su runtime: Osaurus 0.25.26 o superior. No es portable a llama.cpp, Ollama o TGI sin trabajo adicional, y no hay GGUF.
- La cuantización introduce una pérdida medible: 98,45 % de coincidencia con BF16 en el test de 2.000 peticiones y 98,07 % en la suite pública. Para decisiones críticas, d3-JANG_6M (99,35 %) reduce esa brecha a costa de 4,3 GB más.
- El propio autor advierte de que las cifras de los paquetes del proveedor se midieron sobre 14.031 peticiones, mientras que las de este bundle usan un subconjunto de 2.000; las comparaciones entre ambas tablas no son homogéneas.
- Riesgo de alucinación distinto al de un LLM: aquí el fallo típico es una clasificación errónea o una probabilidad mal calibrada, no una invención textual. Las precisiones gold publicadas (78,8-84,0 %) implican errores en uno de cada cinco casos aproximadamente en los conjuntos citados.
- Cobertura de idiomas: la etiqueta declara `en` y `multilingual`, pero no hay ninguna métrica por idioma; el rendimiento en castellano no está verificado.
- Longitud de contexto no documentada, lo que impide planificar con seguridad casos de documentos largos pese a que la calibración incluyera esa categoría.
- Límite estructural de 255 opciones por pregunta en el cabezal de decisión.
- Licencia Apache-2.0 permite uso comercial, pero hay que conservar `NOTICE` y `LICENSE` heredados de vllm-sr/d3 y de Qwen/Qwen3.8-27B.
- Métricas de rendimiento en producción (latencia, throughput, memoria pico) no publicadas; conviene medirlas en el hardware objetivo antes de dimensionar un servicio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las cifras del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/d3-JANG_4M
- Modelo base: https://huggingface.co/vllm-sr/d3
- Modelo subyacente declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime Osaurus: https://osaurus.ai
- Dataset de evaluación citado: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de evaluación citado: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Contacto del cuantizador: eric@osaurus.ai (indicado en la model card)
