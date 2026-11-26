# quincyqiang/chinese-decision-0.8b

## Resumen

Chinese Decision 0.8B es un modelo de decisión en chino desarrollado por el usuario de Hugging Face quincyqiang, obtenido mediante fine-tuning del modelo base Qwen3.5-0.8B. Su propósito no es generar texto conversacional, sino resolver una tarea muy concreta: dado un contexto y un conjunto fijo de candidatos, devuelve la probabilidad de cada uno de ellos en un único pase hacia delante, sin generar ningún token. Las probabilidades se obtienen leyendo los logits de las letras `A`–`Z` en la última posición y aplicando softmax.

El modelo cubre tres tipos de pregunta: `noul` (sí/no), `choice` (elección única) y `score` (escala ordinal con valor esperado), y está entrenado de forma conjunta en cuatro dominios: general, médico, legal y financiero. Está pensado para sustituir a los LLM generativos en tareas de clasificación, enrutado, moderación o etiquetado, donde la latencia y el coste importan, y donde la salida estructurada (una distribución de probabilidad calibrada) resulta más útil que un texto que hay que parsear.

La relevancia actual del modelo reside en su enfoque: 0,8B parámetros, unos 1,5 GB en BF16, una ventana de entrada de 16.384 tokens y temperaturas de calibración ajustadas sobre una partición independiente. Es un modelo pequeño, rápido y desplegable en CPU mediante la versión GGUF Q8_0, orientado exclusivamente al idioma chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B), fine-tuning LoRA r=32 fusionado en pesos completos |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens de entrada máxima |
| Tipos de cuantización | BF16 (repo principal); GGUF Q8_0 (repo separado, 812 MB) |
| Idiomas soportados | chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16); GGUF Q8_0 en repo aparte |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto de Qwen3.5-0.8B, un transformer decoder-only, y se ajusta mediante LoRA con rango 32, cuyos adaptadores se fusionan en los pesos finales, de modo que no requiere PEFT para cargarse. La innovación central no está en la arquitectura sino en la cabeza de decisión: en lugar de generar tokens, el modelo lee los logits correspondientes a las letras `A`–`Z` en la última posición de la secuencia y aplica softmax para obtener la distribución de probabilidad sobre los candidatos. Un único pase hacia delante produce la respuesta completa, con cero tokens de salida.

El entrenamiento se realizó sobre CJ-Dataset, con 13.048.000 ejemplos de decisión durante un epoch, cubriendo preguntas de tipo `noul`, `choice` y `score` en dominios general, médico, legal y financiero. El conjunto de entrenamiento cubre entre 2 y 16 candidatos por pregunta, aunque el modelo admite hasta 26 en inferencia. El checkpoint publicado es el step 10000 de un total de 10.132 pasos, seleccionado por NLL sobre la distribución del conjunto de validación. Se aplica una temperatura de calibración T = 1.108, ajustada sobre una partición independiente y almacenada en `decision_config.json`, junto con la versión de prompt `hmm-zh-v1`. El modelo no emplea RLHF ni DPO según la información disponible; el ajuste es supervisado con calibración posterior.

## Capacidades

- Clasificación zero-shot y decisión sobre conjuntos fijos de candidatos (2–26 por pregunta), devolviendo una probabilidad por candidato en un solo pase.
- Tres formatos de pregunta: `noul` (sí/no), `choice` (elección única) y `score` (escala ordinal con valor esperado).
- Cobertura de cuatro dominios en un único modelo: general, médico, legal y financiero.
- Probabilidades calibradas mediante temperatura ajustada, aptas para umbralización directa en código.
- Soporte de múltiples preguntas por petición (por ejemplo, seis juicios simultáneos sobre un mismo contexto).
- Agrupación de conjuntos grandes de candidatos mediante el endpoint `/v1/tournament` del código de servicio, que divide los `choice` con más de 26 opciones en rondas eliminatorias.
- No genera texto libre ni mantiene conversación: su salida es exclusivamente una distribución de probabilidad.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio; el modelo es exclusivamente textual y en chino.

## Casos de uso

- Triaje de tickets de soporte: en una sola petición se pregunta por categoría (`choice`), severidad y sentimiento (`score`) y tres juicios binarios (`noul`) como reproducibilidad, solicitud de reembolso o riesgo de baja. Las reglas de enrutado viven en el código y usan los umbrales de probabilidad; en la demostración del autor, 48 decisiones sobre 8 tickets se resolvieron en 285 ms.
- Guardarraíles de LLM: comprobación de cada mensaje de entrada y salida del modelo generativo con juicios binarios (inyección de prompt, datos personales, abuso, fuga de system prompt, compromisos fuera de política). Dos umbrales por comprobación permiten tres vías: aprobar, bloquear o derivar a revisión humana, con el ancho de la banda de revisión como presupuesto de moderación.
- Moderación de comentarios en directo: clasificación y juicio binario por mensaje para bloquear insultos y spam, plegar spoilers y destacar preguntas de la audiencia; la demostración reporta una latencia p50 de 82,2 ms por mensaje.
- Enrutado de agentes con control de confianza por riesgo: selección de herramienta, evaluación de si falta información y estimación del riesgo de la operación, con umbrales distintos según sea lectura (40 %), escritura (65 %) o movimiento de fondos (85 %).
- Etiquetado y anotación de datos a escala: asignación de categorías y niveles ordinales a grandes volúmenes de texto chino sin coste de generación, aprovechando el pase único y la salida directamente consumible por programa.
- Puntuación de salidas de otros modelos: evaluación automática de respuestas generadas mediante preguntas `score` o `noul` (por ejemplo, corrección, toxicidad o adecuación), útil en pipelines de evaluación y filtrado.
- Clasificación en dominios regulados: preguntas de tipo legal o financiero con candidatos cerrados y probabilidad calibrada, donde la trazabilidad del umbral importa más que la fluidez del texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de un conjunto de evaluación, CJ-Bench, y de informes de validación (`validation_report.json`) con métricas antes y después de la calibración, así como comparaciones entre el tamaño 0.8B y el 2B, pero no se incluyen cifras concretas en los datos proporcionados. Tampoco se han facilitado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de clasificación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- VRAM estimada en GGUF Q8_0: 812 MB de pesos, ejecutable en CPU sin GPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada para BF16; para despliegue de alta concurrencia se puede usar A100 o H100, aunque el modelo no las necesita.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 4 GB de VRAM; también en CPU con la versión GGUF Q8_0 mediante llama.cpp.
- Opciones de despliegue: transformers con PyTorch para BF16; llama.cpp / llama-cpp-python para GGUF Q8_0 en CPU; el repositorio incluye un servidor HTTP propio (GPU y CPU) con endpoints `/v1/...` y `/v1/tournament`.
- Latencia y throughput: la model card reporta cifras de la plataforma de demostración: 285 ms para 48 decisiones (8 tickets × 6 preguntas), 89,2 ms para 8 comprobaciones de guardarraíl y 82,2 ms de p50 por mensaje en moderación de directo. No se especifica el hardware empleado en estas mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chinese Decision 0.8B | 752 M | 16.384 | Decisión/clasificación con probabilidad calibrada, solo chino | Apache-2.0 | Hugging Face, ModelScope, GGUF |
| Chinese Decision 2B | no disponible | no disponible | Decisión/clasificación, mayor precisión global según el autor | Apache-2.0 (según repo base) | Hugging Face, ModelScope, GGUF |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Generación de texto general | Apache-2.0 | Hugging Face |

La comparación con modelos de clasificación zero-shot convencionales (por ejemplo, clasificadores NLI o modelos de embeddings con prototipos) no está disponible en la información proporcionada. La principal diferencia frente al modelo base es que Chinese Decision no genera texto y devuelve directamente una distribución calibrada, lo que elimina el parseo de salida y reduce la latencia.

## Limitaciones y advertencias

- El modelo solo soporta chino; no se ha entrenado ni evaluado en otros idiomas.
- No es un modelo conversacional: no genera texto libre, no mantiene contexto de diálogo y no admite tool calling ni razonamiento multi-paso.
- El conjunto de entrenamiento cubre entre 2 y 16 candidatos; para más de 26 candidatos es necesario el agrupamiento por rondas del código de servicio, y el comportamiento fuera de ese rango no está garantizado.
- Riesgo de sesgo por palabras clave: la propia model card documenta que el juicio de spoiler se confunde con la palabra "spoiler" en sí (por ejemplo, "no hagas spoiler") y que no distingue entre "especular" y "revelar".
- Las probabilidades están calibradas con una temperatura fija (T = 1.108) sobre una partición concreta; su fiabilidad fuera de la distribución de entrenamiento no está garantizada y conviene validar los umbrales en el dominio propio.
- Riesgo de alucinación en el sentido de asignar alta confianza a candidatos incorrectos cuando el contexto es ambiguo o está fuera de los dominios cubiertos; el uso de bandas de revisión humana mitiga este riesgo.
- Licencia Apache-2.0, que permite uso comercial, pero heredada del modelo base Qwen3.5-0.8B; conviene revisar los términos del modelo base y del dataset CJ-Dataset antes de un despliegue en producción.
- El modelo no sustituye a un revisor humano en dominios legal, médico o financiero; sus salidas son probabilidades, no dictámenes.
- No se han publicado métricas de benchmarks en la información disponible, por lo que la evaluación comparativa con alternativas queda pendiente de los informes enlazados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quincyqiang/chinese-decision-0.8b
- Modelo en ModelScope: https://modelscope.cn/models/quincyqiang/chinese-decision-0.8b
- Versión GGUF Q8_0 en Hugging Face: https://huggingface.co/quincyqiang/chinese-decision-0.8b-gguf
- Versión GGUF Q8_0 en ModelScope: https://modelscope.cn/models/quincyqiang/chinese-decision-0.8b-gguf
- Versión 2B BF16: https://huggingface.co/quincyqiang/chinese-decision-2b
- Versión 2B GGUF: https://huggingface.co/quincyqiang/chinese-decision-2b-gguf
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código (entrenamiento, evaluación, GGUF, servidor HTTP): https://github.com/yanqiangmiffy/chinese-decision
- Plataforma de pruebas Decision Studio: https://github.com/yanqiangmiffy/chinese-decision-studio
- Dataset CJ-Dataset: https://huggingface.co/datasets/bbldCVer-hf/CJ-Dataset
- Benchmark CJ-Bench: https://huggingface.co/datasets/bbldCVer-hf/CJ-Bench
- Model card 0.8B BF16: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/MODEL_CARD_0_8B.md
- Model card 0.8B Q8_0: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/MODEL_CARD_0_8B_GGUF.md
- Model card 2B BF16: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/MODEL_CARD_2B.md
- Model card 2B Q8_0: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/MODEL_CARD_2B_GGUF.md
- Comparativa de tamaños, formatos y modelos externos: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/MODELS.md
- Paper (referencia arXiv indicada en los tags): arxiv:2609.36965
