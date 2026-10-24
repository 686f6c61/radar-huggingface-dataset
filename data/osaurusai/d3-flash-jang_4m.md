# OsaurusAI/d3-flash-JANG_4M

## Resumen

OsaurusAI/d3-flash-JANG_4M es un bundle cuantizado del modelo de decisión multimodal vllm-sr/d3-flash, un modelo de fundación de 9B (8.392.695.024 parámetros reales en safetensors) construido a su vez sobre Qwen/Qwen3.5-9B. No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente con imágenes y vídeo) y un conjunto de preguntas tipadas (elegir entre varias opciones, sí/no, o una puntuación en una escala ordenada) y devuelve, en una sola pasada forward, una probabilidad por opción sin generar texto. Está pensado como el núcleo de decisión del enrutador semántico vLLM Semantic Router (Decision 3.0).

El bundle lo publica Osaurus (eric@osaurus.ai) para su runtime homónimo sobre Apple Silicon, en formato MLX. Aplica cuantización affine de 4 bits a las capas MLP y de 8 bits a atención, atención lineal, embeddings y torre de visión, conservando la cabeza de decisión de 255 vías en su FP32 original. El resultado ocupa 6,64 GB de shards (6,33 bits por peso de media) frente a los 16,8 GB del modelo en BF16, y según el autor reproduce la misma decisión que el modelo de precisión completa en el 97,65 % de 2.000 peticiones del split de test de tasksource/tasksource-jev-typed-decisions.

Su relevancia es doble: por un lado demuestra que un modelo de decisión de 8,39B puede comprimirse a ~4 bits por peso manteniendo una divergencia KL media de 0,0032–0,0038 frente al original; por otro, abre la ejecución de un enrutador/clasificador multimodal de este tamaño en equipos de consumo con memoria unificada. La ficha se limita a los datos publicados por el autor: no hay información sobre longitud de contexto, datos de entrenamiento del modelo base ni benchmarks absolutos de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B) con atención completa bidireccional en el forward de decisión y capas de atención lineal; pesos cuantizados para MLX |
| Parametros totales | 8.392.695.024 (8,39 B) |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLP (gate/up/down) affine 4 bits; atención, atención lineal, embeddings y torre de visión affine 8 bits; media de 6,33 bits por peso; cabeza de decisión de 255 vías (`decision/readout.safetensors`) en FP32 original, byte a byte; entradas de la puerta de atención lineal en BF16 |
| Idiomas soportados | en, multilingual (lista completa de idiomas no disponible) |
| Licencia | Apache-2.0 (heredada del modelo base vllm-sr/d3-flash; se conservan `NOTICE` y `LICENSE`) |
| Formato de pesos | safetensors en formato MLX (shards), 6,64 GB; requiere runtime Osaurus 0.25.26 o superior |
| Tamano del repositorio | 6,7 GB |
| Pipeline declarado | zero-shot-classification |
| Cabeza de salida | 255 vías, una probabilidad por opción, sin generación de texto |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3-flash deriva de Qwen/Qwen3.5-9B y se emplea en modo de decisión: atención completa bidireccional sobre un prompt con formato de decisión específico, que puede incluir texto, JSON, imágenes y vídeo, y una cabeza de lectura de 255 vías que produce una distribución de probabilidad sobre las opciones de cada pregunta. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset del modelo base ni si hubo RLHF o DPO; esos datos figuran como no disponibles.

Lo que sí documenta el autor es el proceso de cuantización. La calibración ejecutó el propio forward de decisión de d3-flash sobre 2.778 prompts de decisión y 1,81 millones de tokens, cubriendo preguntas de enrutamiento sobre peticiones reales, selección de herramientas sobre listas reales de hasta 255 opciones, trazas de agente y de terminal, código, seguridad, documentos largos, decisiones tipadas, imágenes y vídeos de pantalla. Las escalas activation-aware (AWQ) se pliegan en las normas y proyecciones que producen las activaciones, y cada MLP cuantizado se redondea con GPTQ usando las matrices de Hessian de ese forward, conservando el módulo cuantizado solo cuando supera al redondeo simple. Es una innovación relevante: el calibrado se hace con la distribución real de uso del modelo (enrutamiento y selección de herramientas), no con texto genérico.

## Capacidades

- Clasificación zero-shot con opciones arbitrarias: elegir una entre varias alternativas, responder sí/no o puntuar en una escala ordenada, devolviendo una probabilidad por opción.
- Selección de herramientas y enrutamiento de peticiones: soporta listas de hasta 255 opciones en una sola cabeza de decisión.
- Entrada multimodal: acepta texto, JSON, imágenes y vídeos (incluidos vídeos de pantalla) junto con las preguntas tipadas.
- Decisiones tipadas (typed decisions): salida estructurada sobre tipos de decisión predefinidos, con soporte de gold suave en los conjuntos de evaluación.
- Sin generación de texto: no produce explicaciones ni cadenas de razonamiento; la salida es exclusivamente la distribución de probabilidad.
- Capacidades multilingües: etiquetado como `en` y `multilingual`, sin lista explícita de idiomas.
- Integración con agentes: el modelo base se usa en trazas de agente y de terminal, por lo que el bundle está calibrado sobre ese tipo de contexto.
- Tool calling / function calling: no se documenta como tal; la selección de herramienta se resuelve como decisión clasificatoria, no como generación de llamadas.

## Casos de uso

- Enrutamiento semántico de peticiones en una puerta de entrada LLM: dado un prompt de usuario y un conjunto de modelos o rutas candidatas, el modelo devuelve la probabilidad de cada ruta en un único forward. Es su caso de uso nativo en vLLM Semantic Router y evita generar texto para decidir.
- Selección de herramientas en agentes: con listas reales de hasta 255 herramientas, la cabeza de decisión puntúa cada opción; útil para pipelines de function calling donde el coste de una llamada generativa al planificador sería mayor.
- Moderación y clasificación de seguridad: sobre texto o trazas, se le plantean preguntas binarias o escalas ordenadas (por ejemplo, nivel de riesgo) y se obtiene una probabilidad calibrada, aprovechando el calibrado sobre dominios de seguridad y código.
- Etiquetado y clasificación de documentos largos: al aceptar estados en JSON y textos extensos, sirve para decidir categorías sobre expedientes, contratos o tickets sin entrenar un clasificador ad hoc.
- Inspección de interfaces y vídeo de pantalla: la torre de visión, mantenida en 8 bits, permite decidir sobre capturas e imágenes de pantalla si un estado de UI cumple una condición, con aplicación en testing automatizado de aplicaciones.
- Clasificación zero-shot de datos no etiquetados: al declarar las opciones en el propio prompt, se puede desplegar un etiquetador sobre nuevas taxonomías sin reentrenamiento, y validarlo contra el modelo BF16 con las métricas de acuerdo publicadas.
- Evaluación y arbitraje de respuestas de modelos: con preguntas de tipo "¿qué respuesta es mejor?" entre opciones fijas, encaja en pipelines de evaluación automática, aunque requiere revisar el sesgo posicional, que no está documentado.
- Ejecución local en portátiles Apple Silicon: con 6,64 GB de pesos, un Mac con memoria unificada suficiente puede servir este clasificador sin depender de la nube, algo inviable con los 16,8 GB del BF16 en muchos equipos.

## Benchmarks y rendimiento

El autor no publica benchmarks absolutos frente a otros modelos, sino el acuerdo con el modelo de precisión completa. Cada pregunta se responde con el bundle y con el modelo BF16; "decisions" cuenta la misma opción top (o el mismo lado de 0,5 en sí/no) y la KL se mide sobre las probabilidades de las opciones de cada pregunta. Ninguna de estas preguntas se usó para calibración.

| Conjunto de test | Preguntas | Decisions (acuerdo) | KL media (↓) | Gold accuracy, BF16 → bundle |
|---|---|---|---|---|
| Decision Index 0.3 public suite (466 preguntas de 41 benchmarks) | 466 | 97,00 % | 0,0038 | 71,7 → 73,1 % |
| LocalLLaMA/typed-decisions test (gold suave) | 800 | 97,38 % | 0,0024 | 69,6 → 70,5 % |
| Decisiones held-out sobre textos, imágenes y vídeos propios | 487 | 97,95 % | 0,0028 | no disponible |
| tasksource/tasksource-jev-typed-decisions test (2.000 peticiones, el split usado por el proveedor para sus paquetes cuantizados) | 2.000 | 97,65 % | 0,0032 | 81,2 → 81,3 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni latencias o throughput medidos.

## Requisitos de hardware

- Peso de los pesos: 6,64 GB de shards (6,33 bits por peso de media); el modelo BF16 equivalente ocupa 16,8 GB. La huella total en memoria debe sumar pesos, activaciones y caché KV, y no está publicada.
- Plataforma: el bundle está en formato MLX y el autor exige el runtime Osaurus 0.25.26 o superior; el destino declarado es Apple Silicon (`apple-silicon`), por lo que requiere GPU integrada de Apple con memoria unificada.
- GPU consumer: cabe en equipos Apple Silicon cuya memoria unificada disponible supere los ~7 GB de pesos más el margen de trabajo; no hay cifras oficiales de memoria mínima. No se documenta soporte CUDA, ROCm ni Metal fuera de MLX.
- GPU de datacenter: no hay datos de despliegue en A100/H100 para este bundle; el modelo base BF16 (16,8 GB) sí cabría en GPUs de 24 GB o más, pero este paquete MLX no está pensado para ellas.
- Opciones de despliegue: runtime Osaurus (MLX). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la documentación del bundle, y el formato MLX los excluye sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación entre los tres bundles publicados por el mismo autor sobre el mismo modelo base, más la referencia en precisión completa:

| Modelo | Tamano | Decisions (tsj, 2.000) | Decisions (suite) | KL media (suite) | Licencia |
|---|---|---|---|---|---|
| d3-flash-JANG_6M | 7,8 GB | 99,40 % | 99,14 % | 0,0004 | Apache-2.0 |
| d3-flash-JANG_4M (este) | 6,6 GB | 97,65 % | 97,00 % | 0,0038 | Apache-2.0 |
| d3-flash-JANGH2 | 5,3 GB | 92,65 % | 89,27 % | 0,0608 | Apache-2.0 |
| vllm-sr/d3-flash (BF16) | 16,8 GB | referencia | referencia | 0 | Apache-2.0 |

Frente a alternativas de la misma categoría (clasificadores zero-shot tipo NLI o encoders como DeBERTa/BGE), no hay datos comparativos publicados en la información disponible; la diferencia estructural es que este bundle resuelve la clasificación como un modelo de decisión multimodal de 8,39B con hasta 255 opciones, a costa de un tamaño muy superior al de un encoder.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera explicaciones, JSON libre o cadenas de razonamiento queda fuera de su alcance; solo devuelve probabilidades sobre opciones.
- Límite estructural de 255 opciones por la cabeza de decisión; la información no indica cómo se gestionan listas mayores (¿varias pasadas?) ni el coste asociado.
- Deriva por cuantización: el acuerdo con BF16 es del 97,00–97,95 %, lo que implica entre un 2 % y un 3 % de decisiones distintas; en JANGH2 la caída es mucho mayor (89,27 % en la suite), lo que muestra la sensibilidad del modelo a la compresión.
- Las mejoras de gold accuracy reportadas (71,7 → 73,1 %; 81,2 → 81,3 %) son pequeñas y no se acompañan de intervalos de confianza ni de tests de significación; conviene tratarlas como ruido de medición y no como una mejora real de calidad.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en documentos muy largos aunque la calibración incluyese documentos largos.
- Idiomas: etiquetado como `en` y `multilingual` sin evaluación por idioma; el rendimiento fuera del inglés no está medido en la información disponible.
- Dependencia de plataforma: requiere Apple Silicon y el runtime Osaurus 0.25.26 o superior; no hay ruta documentada a vLLM, llama.cpp u Ollama, lo que limita el despliegue en servidores x86/CUDA.
- Madurez y validación externa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las métricas proceden únicamente del autor, sin replicación independiente.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad ni comportamientos diferenciales por demografía; al tratarse de un modelo de decisión, los sesgos se manifestarían en la opción elegida, no en el texto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de sobreconfianza, es decir, distribuciones de probabilidad mal calibradas sobre opciones fuera de la distribución de calibración.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las obligaciones de atribución del modelo base y de Qwen3.5-9B; hay que conservar `NOTICE` y `LICENSE`.
- El nombre "JANG_4M" no se explica en la model card, y el bundle JANG_6M es más pequeño en nombre pero mayor en tamaño (7,8 GB) y más fiel; conviene no inferir el esquema de bits a partir del sufijo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/d3-flash-JANG_4M
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Modelo original sobre el que se construye el base: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime y sitio del autor: https://osaurus.ai
- Conjunto de evaluación citado: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Conjunto de evaluación citado: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Suites de decisión: Decision Index 0.3 public suite (sin URL disponible en la información proporcionada)
- Bundles alternativos del mismo autor: d3-flash-JANG_6M y d3-flash-JANGH2 (sin URL disponibles en la información proporcionada)
