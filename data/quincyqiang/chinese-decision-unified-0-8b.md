# quincyqiang/chinese-decision-unified-0.8b

## Resumen

Chinese Decision Unified 0.8B es un modelo de 0,8B parámetros en chino desarrollado por quincyqiang (repositorio `yanqiangmiffy/chinese-decision`) que no genera texto: emite probabilidades. A partir del modelo base Qwen3.5-0.8B, se entrena un único fichero de pesos con dos cabezas de lectura: una **lectura de decisión**, que devuelve una probabilidad por cada candidato de un conjunto cerrado (preguntas sí/no, elección única y escala ordinal), y una **lectura de extracción**, que devuelve spans de caracteres tipados con posición y probabilidad para NER, relaciones y eventos.

La relevancia técnica está en el enfoque discriminativo: en lugar de decodificar tokens de forma autorregresiva, lee los logits de las letras de los candidatos en la última posición y los normaliza en un solo paso forward. Esto reduce la latencia y hace que las salidas sean directamente calibrables (temperatura T = 1,1326 en la cabeza de decisión). El modelo unificado mantiene la precisión de decisión de su hermano `chinese-decision-0.8b` (83,46 % frente a 83,11 % en CJ-Bench) añadiendo la extracción en el mismo checkpoint.

El contexto máximo del modo decisión es de 16.384 tokens, admite entre 2 y 26 candidatos por pregunta y está entrenado exclusivamente en chino. Se distribuye con licencia Apache-2.0 en un único `model.safetensors` de aproximadamente 1,5 GB, con licencia y arquitectura heredadas de Qwen3.5-0.8B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (con capas de atención lineal; se recomienda `flash-linear-attention` para kernels eficientes) + cabeza de spans para extracción |
| Parámetros totales | 755.819.712 (~0,76B), de los cuales ~3M corresponden a la cabeza de spans (`span_head.*`) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens en modo decisión; en extracción, el texto se trocea en ventanas de ≤ 300 caracteres durante el entrenamiento |
| Tipos de cuantización | No disponible: solo se publican pesos BF16 (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 (se incluye el texto de licencia del modelo base Qwen3.5-0.8B) |
| Formato de pesos | `safetensors` (un único `model.safetensors`, ~1,5 GB), más `config.json`, `tokenizer.json`, `chat_template.jinja`, `decision_config.json`, `training_summary.json` y los informes de evaluación |

Otros parámetros relevantes:

| Parámetro | Valor |
|---|---|
| Candidatos por pregunta (decisión) | 2–26 (el entrenamiento cubre 2–16) |
| Modos de decisión | `noul` (sí/no), `choice` (elección única), `score` (ordinal) |
| Calibración | T = 1,1326 en la lectura de decisión (`decision_config.json`) |
| Extracción | Diseño de eco (reexposición del texto), span máximo de 20 caracteres, corrección de priori `none_shift = log(1/0,2)` |
| Versión de prompt | `hmm-zh-v1` |
| Punto de control publicado | step 14.504 (último paso de 1 epoch) |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto Qwen3.5-0.8B, que incluye capas de atención lineal. Sobre él se añaden dos cabezas de lectura que comparten el mismo tronco y el mismo conjunto de parámetros LoRA (r = 32, fusionados posteriormente en los pesos): una cabeza de decisión que extrae los logits de las letras candidatas en la última posición, y una cabeza de spans inicializada aleatoriamente (~3M parámetros) que clasifica posiciones de carácter para producir entidades tipadas. La petición determina la lectura: si incluye `questions` se ejecuta la decisión; si incluye `types`, la extracción; enviar ambas o ninguna provoca un error.

El entrenamiento se hizo desde el Qwen3.5-0.8B original, no por fine-tuning sobre el modelo de decisión ya publicado. Los datos combinan 13.048.000 elementos de decisión de CJ-Dataset más 611.354 elementos de decisión de CJ-IE, y 573.294 filas de spans de CJ-IE (32 fuentes de NER, relaciones de DuIE y CMeIE, y argumentos de evento de DuEE y FewFC). No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado con LoRA fusionado. La innovación principal es la lectura probabilística en un solo paso forward, sin generación de tokens, junto con la posibilidad de componer lecturas en cascada (por ejemplo, evento = pregunta sí/no sobre el tipo + extracción de disparador y argumentos).

## Capacidades

- Decisión probabilística cerrada: devuelve una distribución de probabilidad sobre 2–26 candidatos para preguntas de tipo sí/no (`noul`), elección única (`choice`) y escala ordinal (`score`), sin generar tokens.
- Clasificación zero-shot con descripciones: los candidatos se especifican con nombre y criterio en la propia petición, sin necesidad de reentrenar.
- Extracción de entidades nombradas (NER) tipadas con descripciones de tipo en lenguaje natural (por ejemplo, provincia, ciudad, distrito, vía, número de portal).
- Extracción de relaciones: dado un sujeto, extraer el objeto (datos de DuIE y CMeIE).
- Extracción de eventos: identificación de tipo de evento, disparador y argumentos (datos de DuEE y FewFC).
- Salidas con posiciones: `start`/`end` en índices de carácter (intervalo semiabierto) y `score` por entidad, con umbral configurable.
- Composición en pipelines: decisión seguida de extracción para resolver tareas de IE complejas en varios pasos.
- Multilingüe: no disponible; el modelo está entrenado y evaluado únicamente en chino.
- Tool calling / function calling: no documentado; el modelo no genera texto ni llamadas a herramientas.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- **Enrutado de tickets de soporte**: clasificar cada mensaje entrante en departamentos (facturación, técnico, ventas) con una pregunta `choice` y criterios descritos en la petición; la probabilidad por clase permite fijar umbrales de derivación a revisión humana cuando la confianza es baja.
- **Detección de urgencia y triaje**: usar preguntas `noul` encadenadas ("¿el cliente expresa urgencia?", "¿menciona una fecha límite?") sobre el texto del ticket; al ser un solo paso forward, el coste por mensaje es mínimo incluso en CPU.
- **Moderación y cumplimiento con reglas cerradas**: evaluar políticas internas como preguntas de sí/no o escalas ordinales, aprovechando que las salidas son probabilidades calibradas y auditables en lugar de texto libre.
- **Anonimización y parsing de direcciones chinas**: extraer provincia, ciudad, distrito, vía y número de portal con posiciones exactas para enmascarar datos personales antes de almacenarlos o enviarlos a otro sistema.
- **Construcción de grafos de conocimiento**: extracción de relaciones (sujeto → objeto) y de eventos con sus argumentos para poblar bases de datos estructuradas a partir de corpus chinos, con la posibilidad de filtrar por `score`.
- **Enriquecimiento de catálogo o CRM**: extracción de entidades y atributos de descripciones de producto o de notas de cliente, y clasificación simultánea de categorías mediante la lectura de decisión sobre el mismo checkpoint.
- **Evaluación de pipelines de IE**: usar los informes incluidos (`cj_ie_test_report.json`, con métricas por fuente y por tipo, incluida ECE de entidades) como referencia para comparar extracciones propias sobre el mismo conjunto de test.
- **Serving de bajo coste en edge o CPU**: al no generar tokens y pesar ~1,5 GB en BF16, puede desplegarse en un contenedor pequeño o en CPU para tareas de clasificación masiva por lotes.

## Benchmarks y rendimiento

Los únicos resultados numéricos publicados en la información disponible corresponden a CJ-Bench (307.900 elementos) y comparan el modelo unificado con su variante solo-decisión:

| Evaluación | Chinese Decision Unified 0.8B | Chinese Decision 0.8B (solo decisión) |
|---|---|---|
| Precisión de decisión en CJ-Bench (307.900 elementos) | 83,46 % | 83,11 % |

Métricas por dominio, por tipo de pregunta y por fuente: disponibles en `cj_bench_report.json` (con T = 1). Métricas de extracción por fuente y por tipo, incluidas ECE de entidades: en `cj_ie_test_report.json`. Los valores concretos no se incluyen en la información proporcionada.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, C-Eval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. A partir del tamaño del checkpoint (BF16, ~1,5 GB de pesos más ~6 MB de cabeza de spans), una estimación razonable es de ~2 GB para los pesos y de 3–5 GB en total con activaciones y caché para contextos cortos; para aprovechar los 16.384 tokens de contexto hay que sumar la caché correspondiente, que no se ha cuantificado públicamente.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060/4060/4070, RTX 4090) para uso interactivo; A100/H100 para servir por lotes o con contextos largos.
- Cabe en GPU de consumo: sí, en toda la gama media actual (8 GB o más); la model card documenta ejecución en CPU (`device="cpu"`), con ligeras diferencias en el último decimal de las probabilidades.
- Opciones de despliegue: `transformers` para la lectura de decisión (`AutoModelForCausalLM.from_pretrained`); para la extracción es necesario el paquete `decision` del repositorio (`pip install "chinese-decision[torch] @ git+https://github.com/yanqiangmiffy/chinese-decision.git@feat/classification-extraction"`). Se recomienda `flash-linear-attention>=0.4` para las capas de atención lineal. Descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- vLLM, llama.cpp, Ollama o TGI: no documentado; no se distribuyen pesos GGUF, por lo que llama.cpp y Ollama no son viables sin conversión propia.
- Latencia y throughput: no se han publicado cifras. Cualitativamente, cada petición requiere un único paso forward sin decodificación autorregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chinese Decision Unified 0.8B | 755.819.712 (~3M en la cabeza de spans) | 16.384 tokens (decisión); ventanas ≤ 300 caracteres (extracción) | Decisión probabilística + extracción de spans en un solo checkpoint | Apache-2.0 | Hugging Face y ModelScope |
| Chinese Decision 0.8B | ~0,8B (mismo backbone) | No disponible | Solo decisión probabilística (sin extracción) | Apache-2.0 | Hugging Face y ModelScope |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible | Generación de texto autorregresiva | Apache-2.0 | Hugging Face |

Frente al modelo base, la diferencia es funcional: Qwen3.5-0.8B genera texto y requiere prompting o parsing posterior para obtener una decisión; el modelo unificado devuelve directamente probabilidades y posiciones. Frente a `chinese-decision-0.8b`, añade la lectura de extracción a cambio de un checkpoint algo mayor y de la dependencia del paquete `decision` para esa lectura. No se dispone de comparaciones publicadas con modelos de NER/RE/EE discriminativos clásicos (por ejemplo, basados en BERT) en la información disponible.

## Limitaciones y advertencias

- **No es un modelo generativo**: no produce texto libre ni soporta conversación multi-turno; no debe usarse como chatbot.
- **Solo chino**: no hay soporte documentado de otros idiomas; el rendimiento fuera del chino no está evaluado.
- **Comparabilidad de salidas**: las probabilidades de la lectura de decisión y de la lectura de extracción no son comparables entre sí; cada una tiene su propia calibración.
- **Candidatos acotados**: el entrenamiento cubre de 2 a 16 candidatos por pregunta, aunque el modelo admite hasta 26; por encima de 16 se produce extrapolación y el serving recomienda dividir conjuntos mayores en rondas agrupadas.
- **Límites de extracción**: span máximo de 20 caracteres y texto troceado en ventanas de ≤ 300 caracteres, lo que puede partir entidades o argumentos que crucen la frontera de la ventana.
- **Falsos positivos en extracción**: la corrección de priori `none_shift = log(1/0,2)` favorece la clase "ninguna"; aun así, conviene fijar un umbral (`threshold`) y validar con datos propios.
- **Riesgo de sesgo**: no se documenta ninguna evaluación de sesgos; al estar entrenado solo con datos chinos, puede reflejar sesgos de dominio y de las fuentes de anotación (32 fuentes de NER, DuIE/CMeIE, DuEE/FewFC).
- **Licencia**: Apache-2.0 permite uso comercial, pero el checkpoint incorpora pesos derivados de Qwen3.5-0.8B y se incluye únicamente la licencia del modelo base; conviene revisar los términos de Qwen3.5 antes de un despliegue comercial.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, y dependencia de una rama específica del repositorio (`feat/classification-extraction`) para la lectura de extracción; el soporte de la comunidad y de herramientas de terceros es aún limitado.
- **Producción**: no hay cifras publicadas de latencia, throughput ni robustez ante entradas adversarias; se recomienda una fase de evaluación con datos propios antes de sustituir clasificadores existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quincyqiang/chinese-decision-unified-0.8b
- Repositorio de código: https://github.com/yanqiangmiffy/chinese-decision
- Plataforma de pruebas Decision Studio: https://github.com/yanqiangmiffy/chinese-decision-studio
- Variante solo decisión: https://huggingface.co/quincyqiang/chinese-decision-0.8b
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de decisión CJ-Dataset: https://huggingface.co/datasets/bbldCVer-hf/CJ-Dataset
- Benchmark CJ-Bench: https://huggingface.co/datasets/bbldCVer-hf/CJ-Bench
- Documentación del dataset de extracción CJ-IE: https://github.com/yanqiangmiffy/chinese-decision/blob/feat/classification-extraction/docs/IE_DATASET.md
- Model card del modelo solo decisión: https://github.com/yanqiangmiffy/chinese-decision/blob/feat/classification-extraction/docs/MODEL_CARD_0_8B.md
- Artículo "Chinese Decision: A Family of Language Models for Single-Pass Probabilistic Decision-Making": https://arxiv.org/abs/2610.23170 (la ficha de Hugging Face referencia además el identificador arXiv:2609.36965)
- Réplica en ModelScope: https://www.modelscope.cn/models/quincyqiang/chinese-decision-0.8b
