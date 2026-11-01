# quincyqiang/chinese-decision-unified-2b

## Resumen
chinese-decision-unified-2b es un modelo de lenguaje especializado en chino, desarrollado por quincyqiang (yanqiangmiffy), que unifica en un único archivo de pesos dos modos de lectura: decisiones probabilísticas sobre candidatos y extracción de información tipada (NER, relaciones y eventos). Se construye mediante un fine-tuning con LoRA (r = 32, fusionado posteriormente) sobre Qwen3.5-2B, al que se añade una cabeza de spans de aproximadamente 6,6 M de parámetros. El modelo no genera texto libre: cada petición se resuelve con una única pasada forward, lo que reduce la latencia frente a enfoques generativos.

La relevancia del modelo radica en su enfoque de "una sola ponderación, dos lecturas": según la forma de la petición (presencia de `questions` o de `types`), el mismo backbone produce logits sobre letras candidatas A–Z o clasifica cada posición de carácter para devolver entidades con posición y probabilidad. Esto simplifica el despliegue en pipelines de decisión y extracción estructurada, donde la salida debe ser determinista y calibrada.

Forma parte de una familia de tres tamaños (0,8B, 2B y 4B) entrenados con la misma receta y los mismos datos CJ-IE. En la evaluación completa de CJ-Bench (307.900 ítems, T = 1) alcanza un 85,00 % de acierto, superando ligeramente a la variante puramente de decisión chinese-decision-2b (84,11 %) y quedando por debajo del 4B (86,86 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con capas de atención lineal, más cabeza de spans para extracción |
| Parametros totales | 1.888.397.504 (1,88B) en el backbone, más ~6,6 M en la cabeza de spans |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens en decisión; en extracción el texto se trocea en ventanas de ≤ 300 caracteres durante el entrenamiento |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos BF16, con la cabeza de spans en FP32) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un único `model.safetensors` de 3,79 GB) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-2B, un transformer decoder-only con capas de atención lineal (el autor recomienda instalar `flash-linear-attention` para kernels eficientes). Sobre ese backbone se entrena con LoRA de rango 32, que se fusiona en los pesos finales, y se añade una cabeza de spans inicializada aleatoriamente. La decisión se obtiene leyendo los logits de las letras candidatas A–Z en la última posición; la extracción se resuelve con un esquema de "eco" (el modelo reproduce el texto carácter a carácter) y clasifica cada posición para componer spans tipados de hasta 20 caracteres.

El entrenamiento usa 13.048.000 ejemplos de decisión de CJ-Dataset más 611.354 filas de decisión de CJ-IE, y 573.294 filas de spans de CJ-IE (32 fuentes de NER, relaciones DuIE/CMeIE y argumentos de eventos DuEE/FewFC). Se publica el checkpoint del paso 15.304 (final de una época), elegido por una puntuación conjunta de decisión y extracción. Incluye calibración de temperatura T = 1,0617 para la lectura de decisión, una corrección de prior `none_shift = log(1/0,2)` y un umbral `decision_shift = 0,75` para determinar qué spans cuentan como entidad. El entrenamiento requirió unas 26 horas en 4 × A800.

## Capacidades
- Decisión probabilística sobre 2–26 candidatos por pregunta (el entrenamiento cubre 2–16), devolviendo una distribución softmax sobre las letras A–Z.
- Clasificación zero-shot mediante preguntas de sí/no o de elección entre opciones.
- Extracción de entidades nombradas (NER) con tipos definidos por nombre y descripción, devolviendo posiciones de carácter y probabilidades.
- Extracción de relaciones: dado un sujeto, extraer el objeto y su tipo.
- Extracción de eventos: determinar el tipo de evento mediante preguntas de sí/no y extraer el disparador y los argumentos.
- Procesamiento de textos largos en decisión (hasta 16.384 tokens) y ventanas de 300 caracteres en extracción.
- Inferencia de una sola pasada sin generación de texto, con salidas calibradas y deterministas.
- Soporte exclusivo de chino; no se documentan capacidades multilingües, de visión, audio ni tool calling.

## Casos de uso
- Moderación y clasificación de contenido en chino: formular cada categoría como un candidato y leer la probabilidad softmax para decidir si un texto se publica, se revisa o se bloquea, con umbrales ajustables y sin generación de texto.
- Extracción de entidades en documentos administrativos o financieros: definir los tipos con nombre y descripción y obtener spans con posición y probabilidad para poblar bases de datos estructuradas.
- Construcción de grafos de conocimiento: combinar la extracción de relaciones (sujeto → objeto) con NER para enlazar entidades en corpus chinos de noticias o informes.
- Monitorización de eventos en prensa: usar preguntas de sí/no para detectar tipos de evento (por ejemplo, fusiones, sanciones o accidentes) y extraer disparador y argumentos en una sola pasada.
- Enrutado y triaje en pipelines RAG: clasificar consultas entre un conjunto cerrado de intenciones o departamentos antes de invocar un recuperador o un modelo generativo mayor.
- Anotación asistida y preetiquetado: generar spans y probabilidades para que anotadores humanos revisen, aprovechando la calibración de la cabeza de spans (ECE reportado por tipo de entidad) para priorizar casos dudosos.
- Validación de formularios y cumplimiento: comprobar si un texto cumple una política definida como pregunta binaria y registrar la probabilidad para auditoría.

## Benchmarks y rendimiento

| Benchmark | Metrica | chinese-decision-unified-2b | Referencia |
|---|---|---|---|
| CJ-Bench (307.900 ítems, T = 1) | Accuracy | 85,00 % | unified-0.8b: 83,46 %; chinese-decision-2b: 84,11 %; unified-4b: 86,86 % |
| CJ-IE test | Decision accuracy | 91,30 % | unified-0.8b: 90,65 %; unified-4b: 91,89 % |
| CJ-IE test | Span extraction micro F1 | 66,0 | unified-0.8b: 63,1; unified-4b: 68,9 |

El repositorio incluye `cj_bench_report.json` y `cj_ie_test_report.json` con métricas desglosadas por dominio, tipo de pregunta, fuente y tipo de entidad (incluida la ECE de entidades). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks generalistas en la información disponible.

## Requisitos de hardware
- VRAM estimada: unos 4 GB en BF16 para los pesos (3,79 GB) más overhead de activaciones y de la cabeza de spans en FP32; en FP16/BF16 conviene reservar 6–8 GB.
- GPU recomendadas: A800/A100 o H100 para entrenamiento y evaluación a gran escala; para inferencia, cualquier GPU con al menos 8 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4070/4080 y RTX 4090; también en GPUs de 8 GB con margen ajustado.
- Despliegue: `transformers` para la lectura de decisión; la lectura de extracción requiere el paquete `chinese-decision` (instalable desde GitHub). Se recomienda `flash-linear-attention >= 0.4` para los kernels de atención lineal de Qwen3.5. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el modelo no genera texto y usa una cabeza personalizada.
- Latencia y throughput: no disponibles; al ser una única pasada forward sin decodificación autoregresiva, la latencia es sustancialmente menor que la de un modelo generativo del mismo tamaño, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CJ-Bench (T = 1) | CJ-IE F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| chinese-decision-unified-2b | 1,88B + 6,6M | 16.384 (decisión) | 85,00 % | 66,0 | Apache-2.0 | Hugging Face, ModelScope |
| chinese-decision-unified-0.8b | ~0,8B | No disponible | 83,46 % | 63,1 | Apache-2.0 | Hugging Face, ModelScope |
| chinese-decision-unified-4b | ~4B | No disponible | 86,86 % | 68,9 | Apache-2.0 | Hugging Face, ModelScope |
| chinese-decision-2b (solo decisión) | ~2B | No disponible | 84,11 % | No aplica | Apache-2.0 | GitHub (model card) |

Frente a alternativas generativas del mismo tamaño para NER y clasificación en chino, la ventaja declarada es la inferencia en una sola pasada y la salida calibrada; no se dispone de comparaciones directas con modelos de terceros en la información proporcionada.

## Limitaciones y advertencias
- Modelo monolingüe: solo chino; no se garantiza comportamiento en otros idiomas.
- No es un modelo generativo: no produce texto libre ni admite instrucciones abiertas; solo responde a los formatos de decisión y extracción soportados.
- La extracción está limitada a spans de hasta 20 caracteres y a ventanas de 300 caracteres durante el entrenamiento, lo que puede degradar el rendimiento en entidades o documentos muy largos.
- La decisión está entrenada para 2–16 candidatos, aunque acepta hasta 26; el rendimiento fuera de ese rango no está validado.
- Riesgo de alucinación estructural: los spans y probabilidades pueden ser incorrectos en dominios alejados de los datos de entrenamiento (CJ-Dataset y CJ-IE); el F1 de extracción de 66,0 indica margen de error considerable.
- Los umbrales (`decision_shift = 0,75`, `none_shift`) están ajustados sobre el dev de CJ-IE; en producción conviene recalibrarlos con datos propios.
- No se documentan sesgos específicos ni evaluaciones de robustez o seguridad; el uso en decisiones sensibles requiere auditoría.
- Licencia Apache-2.0, que permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-2B; conviene revisar su licencia y términos de uso.
- Dependencia de código externo (`chinese-decision`) y de kernels opcionales (`flash-linear-attention`) para la lectura de extracción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/quincyqiang/chinese-decision-unified-2b
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 0.8B: https://huggingface.co/quincyqiang/chinese-decision-unified-0.8b
- Variante 4B: https://huggingface.co/quincyqiang/chinese-decision-unified-4b
- Repositorio de código: https://github.com/yanqiangmiffy/chinese-decision
- Plataforma de pruebas Decision Studio: https://github.com/yanqiangmiffy/chinese-decision-studio
- Documentación del modelo unificado: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/UNIFIED_MODEL.md
- Documentación del dataset CJ-IE: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/IE_DATASET.md
- Model cards de las variantes solo-decisión: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/MODEL_CARD_2B.md
- Dataset CJ-Dataset: https://huggingface.co/datasets/bbldCVer-hf/CJ-Dataset
- Dataset CJ-Bench: https://huggingface.co/datasets/bbldCVer-hf/CJ-Bench
- ModelScope (variante 0.8B): https://www.modelscope.cn/models/quincyqiang/chinese-decision-unified-0.8b
- Paper referenciado (arXiv:2609.36965): https://arxiv.org/abs/2609.36965
