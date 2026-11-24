# sergolsub/mlx-d3-turbo-v1.1-27B

## Resumen

`sergolsub/mlx-d3-turbo-v1.1-27B` es una conversión a formato MLX de 8 bits del modelo `vllm-sr/d3-turbo`, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo de propósito general orientado a generación de texto libre, sino de un modelo con cabezas de decisión ("decision heads") que responde a tareas estructuradas de clasificación y localización: preguntas de sí/no (`noul`), elección entre opciones (`choice`), puntuación ordinal (`score`) y localización de objetos en imagen (`box`). El modelo base declara la arquitectura `qwen3_5` con código personalizado y 26.085.330.160 parámetros totales (aproximadamente 26,1 mil millones).

La relevancia de esta ficha radica en que documenta un caso poco habitual: un modelo multimodal con modo de decisión empaquetado como conversión cuantizada para hardware de consumo, con métricas de calidad y latencia medidas por el propio autor en una Mac mini M4 Pro de 48 GB. El repositorio incluye auditoría de cuantización a nivel de tensor (KL por tensor), checksums SHA-256 de todos los ficheros y una comparativa entre las versiones de 8 y 4 bits.

La licencia es Apache 2.0, heredada de los pesos originales, y el autor indica explícitamente que en caso de conflicto prevalece la licencia del repositorio upstream. El modelo ocupa 27,9 GB en disco y requiere 17,69 GB de memoria residente en la configuración medida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura declarada `qwen3_5` y código personalizado (`custom_code`); incluye atención lineal en capas (`linear_attn`) y cabezas de decisión |
| Parámetros totales | 26.085.330.160 (≈26,1 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (MLX); existe una variante de 4 bits publicada por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de `vllm-sr/d3-turbo`) |
| Formato de pesos | safetensors en layout MLX, con ficheros auxiliares `*_mlx.py`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

El modelo base `vllm-sr/d3-turbo` emplea una arquitectura de transformer con identificador `qwen3_5` y requiere código personalizado para su carga (tags `custom_code` y `qwen3_5`). El repositorio derivado no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible en la documentación proporcionada. La estructura interna incluye capas de atención lineal, tal como evidencia el tensor con peor error de cuantización (`language_model.layers.0.linear_attn.in_proj_b.weight`), y un conjunto de cabezas de decisión que se configuran mediante `decision_config.json` y `joint_config.json`.

La conversión realizada por sergolsub es puramente de cuantización: no hay reentrenamiento ni cambios de arquitectura, según declara el autor. Los pesos se generaron por conversión en streaming desde los shards BF16 upstream, con un `text_config` anidado. El repositorio incluye una auditoría de cuantización a nivel de peso: se compararon 1183 tensores con una KL media de 3,52e-04 y una KL máxima de 6,57e-03, con 581 tensores con KL distinta de cero. También se documenta la KL de salida entre la versión de 8 bits y la de 4 bits sobre 100 filas (media 2,19e-02, p95 9,20e-02, máximo 2,05e-01); no se registraron probabilidades del modelo original en BF16.

## Capacidades

- Decisión binaria tipo sí/no (`noul`): responde a preguntas de verificación formuladas en lenguaje natural.
- Elección entre categorías (`choice`): selecciona una opción entre un conjunto de criterios definidos por el usuario.
- Puntuación ordinal (`score`): asigna un nivel dentro de una escala de criterios ordenados.
- Localización de objetos en imagen (`box`): devuelve cajas delimitadoras con un valor de confianza asociado.
- Procesamiento multimodal texto + imagen: la evaluación del autor incluye entradas de imagen de 512×512 píxeles combinadas con texto.
- Interfaz programática de decisión: cada tarea se invoca como un objeto independiente mediante el método `decide()` del cargador `d3_mlx`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking ni generación de texto libre en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar una consulta de cliente en un equipo responsable (facturación, envíos, etc.) mediante una decisión de tipo `choice` con criterios definidos, como muestra el ejemplo de la model card con el pedido #7821.
- Detección de intención de reembolso: con una pregunta `noul` ("¿el cliente quiere un reembolso?") se puede enrutar automáticamente una reclamación al flujo de devoluciones, usando el texto del ticket como entrada.
- Priorización de incidencias: la decisión de tipo `score` con criterios ordinales (cosmético, molesto, bloqueante) permite asignar severidad a errores de sistema, como el ejemplo de cuota de disco excedida en un worker.
- Verificación visual en pipelines de inspección: la decisión de tipo `box` localiza objetos concretos en imágenes de 512×512 (por ejemplo, señales de tráfico), adecuada para preprocesado en sistemas de control de calidad o moderación de contenido.
- Enrutamiento en asistentes conversacionales: cada turno puede formularse como una decisión independiente, lo que permite construir clasificadores de intención ligeros sobre Apple Silicon sin depender de infraestructura GPU en la nube.
- Prototipado local en estaciones de trabajo Mac: gracias a los 17,69 GB de memoria residente y a los 9,5 s de carga, el modelo cabe en una Mac mini M4 Pro de 48 GB y permite iterar en local sobre conjuntos de evaluación propios.
- Evaluación de calidad de cuantización: el repositorio incluye scripts (`output_kl.py`, `kl_weight_audit.py`) y artefactos (`kl_audit.json`) que permiten reproducir la comparación entre versiones de 8 y 4 bits para decidir qué variante desplegar.

## Benchmarks y rendimiento

Métricas medidas por el autor en una Mac mini M4 Pro de 48 GB con MLX de 8 bits (media de 5 ejecuciones tras 3 de calentamiento):

| Métrica | Valor |
|---|---|
| Precisión tras cuantización a 8 bits | 87,8 % |
| `noul` | 95,0 % |
| `choice` | 84,0 % |
| `score` | 80,0 % |
| Perplejidad de calibración | 2,060 |
| Carga del modelo | 9,5 s |
| Memoria residente máxima | 17,69 GB |
| Texto 512 tokens (479 tok) — binario | 4577 ms |
| Texto 512 tokens — elección múltiple | 4859 ms |
| Texto 512 tokens — puntuación | 4575 ms |
| Imagen 512×512 + texto — binario | 7506 ms |
| Imagen 512×512 + texto — elección múltiple | 7515 ms |
| Imagen 512×512 + texto — puntuación | 7507 ms |
| Caja 512×512 | 7830 ms (mediana 7830 ms), confianza 1 |
| Latencia de decisión (mediana) | 2461 ms |
| Decisiones cortas sostenidas | 0,62 por segundo |

Comparativa entre versiones publicada por el autor:

| Versión | Repositorio | Precisión | `noul` | `choice` | `score` | PPL | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | `vllm-sr/d3-turbo` | no medida | no medida | no medida | no medida | no medida | no medida | no medida |
| 8 bits | `sergolsub/d3-turbo-27B-MLX-8bit` | 87,8 % | 95,0 % | 84,0 % | 80,0 % | 2,060 | 27,85 GB | 2461 ms |
| 4 bits | `sergolsub/d3-turbo-27B-MLX-4bit` | 84,4 % | 85,0 % | 84,0 % | 84,0 % | 2,075 | 14,87 GB | 2119 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,69 GB de memoria residente máxima medida con la versión de 8 bits; el modelo ocupa 27,85 GB en disco.
- Hardware de referencia medido: Mac mini M4 Pro con 48 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en el ecosistema Apple Silicon con memoria unificada suficiente (48 GB en la medición del autor); no se documentan mediciones en GPU NVIDIA.
- GPU recomendadas: no disponibles para CUDA; el formato es MLX, orientado a Apple Silicon.
- Opciones de despliegue: `mlx_lm` mediante el cargador `d3_mlx.py` incluido en el repositorio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 2461 ms por decisión y 0,62 decisiones cortas por segundo en el hardware de referencia; las tareas con imagen rondan los 7,5-7,8 s por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sergolsub/mlx-d3-turbo-v1.1-27B` (8 bits) | 26,1 B | no disponible | Decisiones estructuradas multimodales en MLX | Apache 2.0 | Hugging Face, 435 descargas |
| `sergolsub/d3-turbo-27B-MLX-4bit` | 26,1 B (4 bits) | no disponible | Misma tarea, cuantización más agresiva | Apache 2.0 | Hugging Face |
| `vllm-sr/d3-turbo` (bf16) | 26,1 B | no disponible | Pesos originales sin cuantizar | Apache 2.0 | Hugging Face |

No se dispone de información sobre modelos comparables de otros autores con la misma tarea de decisión estructurada; ese dato no está disponible.

## Limitaciones y advertencias

- El modelo no es un generador de texto libre: su interfaz está diseñada para tareas de decisión acotadas (`noul`, `choice`, `score`, `box`), por lo que no debe emplearse como chatbot generalista.
- La precisión tras cuantización a 8 bits es del 87,8 % en el conjunto de evaluación del autor; un 12,2 % de error implica riesgo de clasificaciones incorrectas en producción.
- La cuantización a 4 bits degrada `noul` del 95,0 % al 85,0 %, aunque mejora `score` del 80,0 % al 84,0 %; la elección de versión debe validarse con datos propios.
- No se han registrado las probabilidades del modelo original en BF16, por lo que la KL de salida frente a la referencia no está disponible; solo existe la comparación 8 bits frente a 4 bits.
- El repositorio depende de código personalizado (`d3_mlx.py`, `decision_config.json`, `joint_config.json`), lo que añade superficie de mantenimiento y riesgo de incompatibilidad con futuras versiones de `mlx_lm`.
- Solo se ha validado en Apple Silicon; no hay mediciones publicadas en CUDA ni en otras plataformas.
- No se documentan sesgos conocidos, cobertura idiomática ni comportamiento fuera de los idiomas de entrenamiento; esa información no está disponible.
- La licencia Apache 2.0 se hereda del repositorio upstream y, según el autor, prevalece la del upstream en caso de conflicto; conviene revisar el LICENSE y NOTICE originales antes de un uso comercial.
- El tamaño del repositorio (27,9 GB) y la necesidad de descargar los pesos completos pueden ser un obstáculo en entornos con ancho de banda limitado; los checksums SHA-256 publicados permiten verificar la integridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-d3-turbo-v1.1-27B
- Modelo base upstream: https://huggingface.co/vllm-sr/d3-turbo
- Versión de 8 bits del mismo autor: https://huggingface.co/sergolsub/d3-turbo-27B-MLX-8bit
- Versión de 4 bits del mismo autor: https://huggingface.co/sergolsub/d3-turbo-27B-MLX-4bit
