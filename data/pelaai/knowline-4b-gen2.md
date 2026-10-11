# PelaAI/KnowLine-4B-Gen2

## Resumen

KnowLine-4B-Gen2 es un modelo de decisión de 4B parámetros desarrollado por PelaAI, construido a partir de Qwen/Qwen3.5-4B mediante dos rondas de SFT con LoRA fusionadas y promediadas por pesos. No es un modelo generativo conversacional: recibe un estado (texto o chat) y hasta 64 preguntas tipadas (sí/no, elección entre k opciones o puntuación sobre una rúbrica), y devuelve para cada pregunta una distribución de probabilidad sobre sus opciones. La inferencia se resuelve con una única pasada hacia delante por pregunta, sin generar texto, leyendo la probabilidad del token de etiqueta de cada opción.

El modelo pertenece a la familia "System One" de PelaAI y se publica bajo licencia Apache-2.0. Su relevancia radica en que ataca una tarea distinta a la de los LLM generativos: clasificación y decisión calibrada sobre estados arbitrarios. Según la model card, obtiene una puntuación de 62,54 en la suite pública Decision Index 0.3, frente a 60,47 de Gen1 y 57,96 de Jev 1.13, y declara una mejora en robustez frente a inyección de instrucciones (4,0% de cambio de respuesta, frente al 8,9% de Gen1).

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-4B (transformers, con torre de visión y cabeza MTP heredadas), pero los pesos publicados son un promedio tensorial de checkpoints de dos rondas de entrenamiento. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer heredada de Qwen/Qwen3.5-4B; pesos resultantes de promediado tensorial (model soup) de checkpoints LoRA fusionados |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | No aplica; la informacion disponible no indica que sea MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); FP8 en carga con SGLang; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Ingles, chino simplificado y chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se entrena con dos ejecuciones de SFT con LoRA (rango 32, alpha 64, solo el modelo de lenguaje). Los adaptadores se fusionan y después se promedian tensor a tensor: el checkpoint de Gen1 (run "mix E", paso 5.650) pondera 0,5, y los pasos 4.500 y 5.000 del run "mix F" ponderan 0,25 cada uno. Se probaron siete formas distintas de promediado; seis de ellas, con un único checkpoint de mix F y pesos de Gen1 entre 0,4 y 0,6, puntuaron entre 61,89 y 62,14 en la suite pública 0.3, mientras que la combinación finalmente publicada alcanzó 62,54.

El dataset de mix F contiene alrededor de 1,05 millones de filas (frente a las ~713.000 de mix E) e incorpora las filas de OpenJevData restauradas (~180.000), unas 76.000 filas sintéticas, datos de juegos de lucha regenerados con comportamiento equilibrado y un grupo nuevo orientado a cubrir huecos del Decision Index: ACOS (5% de "sí", con negativos difíciles), WinoGrande XL train y GSM8K train reescrito con distractores al estilo Decision Index 0.3. Todo el material pasó de nuevo por un proceso de descontaminación. El entrenamiento estaba planificado para 3 épocas, pero se detuvo en el paso 8.455 al detectar memorización y caída de la puntuación en Decision Index. La configuración, el tokenizer y la plantilla de chat son idénticos a los de Gen1.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado: sí/no con probabilidad (`noul`), elección entre k opciones (`choice`) y puntuación sobre rúbrica.
- Hasta 64 preguntas por petición, cada una resuelta en una única pasada hacia delante sin texto generado.
- Salida como distribución de probabilidad por opción, con calibración explícita (ECE ~0,06-0,07; Brier ~0,31-0,33).
- Multilingüe limitado a inglés, chino simplificado y chino tradicional, con evaluación interna por idioma.
- Robustez frente a inyección de instrucciones: las instrucciones plantadas en el estado alteran la respuesta en el 4,0% de los casos.
- Razonamiento y conocimiento evaluados mediante C-Eval (78,6), GPQA (23,8), GSM8K (58,0), ACOS (40,8) y WinoGrande (73,8).
- Compatibilidad con clientes de Jev existentes cambiando únicamente la URL base; los usuarios de Gen1 solo cambian el nombre del modelo.
- La torre de visión del modelo base se conserva en los pesos publicados, aunque la información disponible no documenta entrenamiento específico de capacidades de visión para esta tarea.
- No se documenta soporte de tool calling, function calling ni orquestación de agentes en la información proporcionada.

## Casos de uso

- Enrutado de decisiones en atención al cliente: dado el texto de una interacción, el modelo responde preguntas como "¿debe ofrecerse un reembolso?" o "¿cuál es el tono del cliente?" con una probabilidad, lo que permite fijar umbrales de escalado a un humano.
- Moderación y triaje de contenido: clasificación con opciones cerradas sobre un estado de entrada, aprovechando la calibración declarada para establecer políticas de corte reproducibles.
- Evaluación automática de respuestas: uso de rúbricas con puntuación probabilística para puntuar salidas de otros modelos sin necesidad de generar texto adicional.
- Monitorización de agentes conversacionales: análisis de trazas de chat para responder preguntas tipadas sobre el estado de la conversación en una sola pasada por pregunta.
- Investigación en calibración y robustez: el modelo está pensado como objeto de estudio de decisión "System One", con métricas de ECE, Brier y sensibilidad a inyección de prompts publicadas.
- Benchmarking de modelos de decisión: sirve como referencia en la suite Decision Index 0.3, comparable directamente con Jev 1.13 y con la propia línea Gen1/Gen3.
- Simulación y evaluación en juegos: el arnés KOF '98 documentado (14-3-1 frente a Jev 1.13 y 13-5 frente a Gen1) ilustra su uso en decisiones de combate en tiempo de turno.
- Migración desde Jev: sustituir la URL base en clientes existentes para reutilizar integraciones sin cambios de interfaz.

## Benchmarks y rendimiento

| Benchmark | KnowLine-4B-Gen2 | KnowLine-4B-Gen1 | Referencia |
|---|---|---|---|
| Decision Index 0.3, suite publica | 62,54 | 60,47 | Jev 1.13: 57,96; mejor modelo ≤5B del board: 50,82 |
| Held-out interno, ingles | 69,7 | 68,7 | no disponible |
| Held-out interno, zh-Hans | 71,2 | 69,9 | no disponible |
| Held-out interno, zh-Hant | 64,8 | 64,1 | no disponible |
| C-Eval | 78,6 | 77,9 | no disponible |
| GSM8K | 58,0 | 29,5 | no disponible |
| ACOS | 40,8 | 25,0 | no disponible |
| WinoGrande | 73,8 | 62,1 | no disponible |
| GPQA | 23,8 | 16,3 | no disponible |
| Cambio de respuesta por inyeccion de instrucciones | 4,0% | 8,9% | no disponible |
| ECE | ~0,06-0,07 | ~0,08-0,09 | mediana del board: 0,084 |
| Brier score | ~0,31-0,33 | no disponible | ~3.o de 113 modelos del board |
| KOF '98, serie vs Jev 1.13 | 14-3-1 | no disponible | no disponible |
| KOF '98, serie vs Gen1 | 13-5 | no disponible | no disponible |

Nota: Gen1 era el punto débil declarado en conocimiento y razonamiento, con una puntuación de 37,7 en esa dimensión según la model card. El dato de FinEntity aparece truncado en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: en bf16, los pesos ocupan aproximadamente 9,3 GB, por lo que la inferencia requiere del orden de 10-12 GB de VRAM contando overhead de activaciones y caché.
- Con cuantización FP8 en carga vía SGLang, la huella de pesos baja a aproximadamente 5 GB, más overhead.
- GPU recomendadas: cualquier GPU con 16 GB o más de VRAM para bf16 (RTX 4090, RTX 4080, A100 40 GB, H100). Con FP8, tarjetas de 12 GB podrían ser suficientes, aunque no se documentan cifras oficiales.
- Cabe en GPU de consumo: sí, en bf16 sobre RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB); en tarjetas de 12 GB conviene usar FP8.
- Opciones de despliegue documentadas: SGLang 0.5.21 (recomendado, carga en FP8), script `serve_knowline.sh`; alternativa con `knowline_server.py --backend hf` usando solo transformers (más lento, bf16). También aparece referenciado un endpoint de inferencia en FriendliAI.
- Versiones requeridas: transformers 5.12.1 y sglang 0.5.21.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Decision Index 0.3 publico | Licencia | Idiomas | Estado |
|---|---|---|---|---|---|
| KnowLine-4B-Gen2 | 4,66B | 62,54 | Apache-2.0 | en, zh, zh-Hant | version analizada |
| KnowLine-4B-Gen1 | no disponible | 60,47 | Apache-2.0 | en, zh, zh-Hant | version anterior |
| KnowLine-4B-Gen3 | no disponible | 63,11 | no disponible | no disponible | version posterior |
| Jev 1.13 | no disponible | 57,96 | no disponible | no disponible | referencia externa |
| Mejor modelo ≤5B del board | ≤5B | 50,82 | no disponible | no disponible | referencia del board |

No se dispone de datos de contexto, licencia ni idiomas para las alternativas externas. La model card indica explícitamente que KnowLine es un modelo independiente, no afiliado a TypeSafe ni a Jev.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo distribuciones de probabilidad sobre opciones predefinidas. No sirve como chatbot.
- Cobertura lingüística limitada a inglés y chino (simplificado y tradicional); no se documenta soporte de castellano ni de otras lenguas.
- Longitud de contexto no especificada en la información disponible, lo que dificulta planificar despliegues con estados muy largos.
- Riesgo de alucinación inherente a la tarea: el modelo asigna probabilidad a opciones incluso cuando el estado no contiene información suficiente; la calibración publicada mitiga pero no elimina este riesgo.
- Sensibilidad residual a inyección de prompts: aunque baja del 8,9% al 4,0%, sigue existiendo un porcentaje de casos en los que instrucciones embebidas en el estado alteran la respuesta.
- Sesgos conocidos: no se documentan análisis de sesgo específicos en la información proporcionada.
- El entrenamiento se detuvo por memorización antes de completar las 3 épocas previstas; los checkpoints individuales de mix F quedaron por debajo de Gen1 en la mayoría de evaluaciones, y solo el promediado con Gen1 recuperó y superó el rendimiento.
- Existe una versión posterior, KnowLine-4B-Gen3, con mejor puntuación pública (63,11), por lo que Gen2 puede quedar obsoleto para nuevos despliegues.
- El número de descargas (40) y likes (1) es muy bajo, lo que implica poca validación independiente por parte de la comunidad.
- Licencia Apache-2.0 en los pesos, lo que permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B tiene sus propias condiciones que conviene verificar.
- La torre de visión se conserva en los pesos, pero no hay evidencia en la información disponible de que las capacidades de visión estén entrenadas o evaluadas para esta tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PelaAI/KnowLine-4B-Gen2
- Archivos del repositorio: https://huggingface.co/PelaAI/KnowLine-4B-Gen2/tree/main
- Version anterior, KnowLine-4B-Gen1: https://huggingface.co/PelaAI/KnowLine-4B-Gen1
- Version posterior, KnowLine-4B-Gen3: https://huggingface.co/PelaAI/KnowLine-4B-Gen3
- Modelo base, Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/PelaAI/KnowLine-4B-Gen2
- Ficha en Free2AITools: https://free2aitools.com/model/pelaai/knowline-4b-gen2
- Guia de inferencia (INFERENCE.md) y README en chino (README.zh.md): referenciados en la model card del repositorio de Hugging Face.
