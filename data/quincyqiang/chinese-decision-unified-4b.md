# quincyqiang/chinese-decision-unified-4b

## Resumen

chinese-decision-unified-4b es un modelo de lenguaje especializado en chino, desarrollado por el usuario quincyqiang, que unifica en un único conjunto de pesos dos tareas distintas de lectura sobre un mismo backbone: decisión probabilística entre candidatos (clasificación de opciones múltiples) y extracción tipada de información (NER, relaciones y eventos) mediante spans de caracteres con posición y probabilidad. Parte del modelo base Qwen3.5-4B, sobre el que se aplica un ajuste fino con LoRA (r = 32) que se fusiona posteriormente, añadiendo una cabeza de spans de aproximadamente 8,2 millones de parámetros.

El modelo resuelve un problema práctico: en lugar de generar texto libre para tareas de clasificación y extracción, realiza una única pasada forward y emite directamente probabilidades calibradas, lo que reduce la latencia y facilita la integración en pipelines de decisión. La forma de la petición determina la modalidad de salida: si incluye `questions`, se activa la lectura de decisión; si incluye `types`, se activa la extracción de spans.

Con 4.213.896.576 parámetros totales, licencia Apache-2.0 y soporte exclusivo de chino, se posiciona como la variante de mayor precisión de la familia unified, por delante de las versiones de 0,8B y 2B, y con una precisión de decisión superior incluso a la variante puramente decisoria chinese-decision-4b (86,86 % frente a 85,97 % en CJ-Bench).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con cabeza de spans tipada añadida |
| Parámetros totales | 4.213.896.576 (≈4,21B backbone + ≈8,2M cabeza de spans) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens para decisión; extracción entrenada con ventanas de ≤300 caracteres |
| Tipos de cuantización | no disponible (pesos publicados en BF16, cabeza en FP32) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo único `model.safetensors`, ≈8,44 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone de texto de Qwen3.5-4B, un transformer decoder-only, al que se le añade una cabeza de clasificación de spans de aproximadamente 8,2 millones de parámetros inicializada aleatoriamente. El ajuste se realiza mediante LoRA con rango 32, que se fusiona en los pesos finales, de modo que la inferencia no requiere adaptadores separados. La cabeza de spans comparte el mismo backbone que la lectura de decisión, y la diferencia entre ambas modalidades reside únicamente en la capa de salida utilizada.

El entrenamiento combina 13.048.000 ejemplos de decisión procedentes de CJ-Dataset más 611.354 ejemplos de decisión derivados de CJ-IE, y 573.294 filas de spans de CJ-IE que cubren 32 fuentes de NER, relaciones de DuIE y CMeIE, y argumentos de eventos de DuEE y FewFC. El checkpoint publicado corresponde al step 14.504 (último paso de una época), seleccionado por una puntuación conjunta de decisión y extracción. Se aplica una temperatura de calibración T = 1,0986 exclusivamente a la lectura de decisión, una corrección de prior `none_shift = log(1/0,2)` para los spans y un umbral `decision_shift = 0,75` elegido sobre el conjunto de desarrollo de CJ-IE. El entrenamiento se ejecutó en 4 GPU A800 durante aproximadamente 83 horas.

## Capacidades

- Decisión probabilística entre 2 y 26 candidatos (entrenado con cobertura de 2 a 16), devolviendo una probabilidad por opción mediante softmax sobre los logits de las letras A–Z.
- Extracción de entidades nombradas (NER) tipada con posiciones de carácter y probabilidades asociadas.
- Extracción de relaciones, incluyendo la identificación de sujeto y objeto.
- Extracción de eventos mediante preguntas de sí/no para el tipo de evento y extracción posterior de disparadores y argumentos.
- Clasificación zero-shot mediante la formulación de candidatos como opciones.
- Procesamiento de peticiones mixtas que combinan decisión y extracción en una sola llamada.
- Inferencia sin generación de texto: una única pasada forward, lo que reduce la latencia frente a esquemas generativos.
- Capacidad multilingüe limitada al chino.

## Casos de uso

- Moderación de contenido y clasificación de riesgo: el modelo evalúa un texto frente a un conjunto cerrado de etiquetas de política (por ejemplo, categorías de toxicidad o cumplimiento) y devuelve probabilidades calibradas que permiten fijar umbrales operativos sin post-procesado adicional.
- Enrutamiento de tickets de soporte: dada una consulta y una lista de departamentos o intenciones, la lectura de decisión asigna una distribución de probabilidad sobre las opciones, lo que permite derivar el ticket al equipo adecuado y medir la confianza de la asignación.
- Extracción de entidades en documentos legales y financieros: con tipos definidos por nombre y descripción, el modelo devuelve spans de caracteres con posición y probabilidad, adecuado para poblar bases de datos estructuradas a partir de contratos o informes.
- Construcción de grafos de conocimiento: la combinación de extracción de relaciones (sujeto-objeto) y de eventos permite generar tripletas y registros de eventos directamente desde corpus en chino, sin necesidad de un generador de texto intermedio.
- Análisis de opiniones y encuestas: la decisión probabilística sobre escalas o categorías predefinidas facilita el análisis agregado con intervalos de confianza derivados de las probabilidades emitidas.
- Sistemas de preguntas de opción múltiple en evaluación educativa: el modelo puntúa cada opción de forma independiente y calibrada, lo que permite detectar preguntas ambiguas cuando la distribución es cercana a uniforme.
- Pipelines de anonimización y etiquetado: la extracción de spans con posiciones exactas permite enmascarar entidades sensibles (nombres, direcciones, identificadores) en flujos de preprocesado de datos.

## Benchmarks y rendimiento

| Benchmark | chinese-decision-unified-4b | chinese-decision-unified-2b | chinese-decision-unified-0.8b | chinese-decision-4b |
|---|---|---|---|---|
| CJ-Bench completo (307.900 ítems, T = 1) | 86,86 % | 85,00 % | 83,46 % | 85,97 % |
| CJ-IE test, precisión de decisión | 91,89 % | 91,30 % | 90,65 % | no disponible |
| CJ-IE test, micro F1 de extracción de spans | 68,9 | 66,0 | 63,1 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 8,5–9 GB solo para los pesos, más memoria para activaciones y la cabeza de spans; con contexto largo (hasta 16.384 tokens) el consumo crece de forma apreciable.
- Cuantización: la información disponible no detalla tipos de cuantización publicados; al ser un modelo con cabeza de spans personalizada, la conversión a GGUF requeriría soporte específico de dicha cabeza.
- GPU recomendadas: A100 o H100 para despliegues con contexto máximo y lotes grandes; una RTX 4090 (24 GB) es suficiente para inferencia en BF16 con contexto moderado.
- Compatibilidad con GPU de consumo: sí, en tarjetas con al menos 12–16 GB de VRAM para BF16 con contexto reducido; no se dispone de datos para configuraciones de 8 GB.
- Opciones de despliegue: la lectura de decisión funciona con `transformers`; la extracción requiere el paquete `chinese-decision` del proyecto. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El diseño de una sola pasada forward sin generación de texto sugiere una latencia inferior a la de esquemas autoregresivos equivalentes, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CJ-Bench | CJ-IE F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| chinese-decision-unified-4b | ≈4,21B | 16.384 (decisión) | 86,86 % | 68,9 | Apache-2.0 | HuggingFace, ModelScope |
| chinese-decision-unified-2b | ≈2B (no confirmado) | no disponible | 85,00 % | 66,0 | Apache-2.0 | HuggingFace, ModelScope |
| chinese-decision-unified-0.8b | ≈0,8B | no disponible | 83,46 % | 63,1 | Apache-2.0 | HuggingFace, ModelScope |
| chinese-decision-4b | ≈4B | no disponible | 85,97 % | no disponible | Apache-2.0 | GitHub |

La comparativa con modelos de propósito general de tamaño similar (por ejemplo, Qwen3.5-4B sin ajustar) no está disponible en la información proporcionada, ya que no se han publicado métricas de dichos modelos sobre CJ-Bench o CJ-IE.

## Limitaciones y advertencias

- El modelo solo soporta chino; no se ha validado su comportamiento en otros idiomas.
- La extracción de spans está entrenada con ventanas de hasta 300 caracteres, por lo que documentos más largos requieren segmentación manual.
- La cobertura de candidatos en entrenamiento es de 2 a 16, aunque la arquitectura admite hasta 26; el rendimiento fuera de ese rango no está validado.
- El umbral `decision_shift = 0,75` y la corrección `none_shift` están calibrados sobre CJ-IE dev; su transferencia a otros dominios puede degradar la precisión de extracción.
- Riesgo de alucinación estructural: al no generar texto, el modelo no inventa contenido libre, pero puede asignar probabilidad alta a candidatos incorrectos cuando la pregunta es ambigua o el dominio se aleja de los datos de entrenamiento.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre corpus chinos (CJ-Dataset, DuIE, CMeIE, DuEE, FewFC), puede heredar sesgos de dichas fuentes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.5-4B y de los datasets de entrenamiento.
- El despliegue de la extracción depende de un paquete externo (`chinese-decision`), lo que añade una dependencia de mantenimiento no cubierta por el ecosistema estándar de `transformers`.
- El número de descargas (45) y de likes (0) indica una adopción todavía muy limitada, con escasa validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quincyqiang/chinese-decision-unified-4b
- Modelo en ModelScope: https://www.modelscope.cn/models/quincyqiang/chinese-decision-unified-4b
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 0.8B: https://huggingface.co/quincyqiang/chinese-decision-unified-0.8b
- Variante 2B: https://huggingface.co/quincyqiang/chinese-decision-unified-2b
- Repositorio de código: https://github.com/yanqiangmiffy/chinese-decision
- Plataforma de pruebas Decision Studio: https://github.com/yanqiangmiffy/chinese-decision-studio
- Documentación del modelo unificado: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/UNIFIED_MODEL.md
- Documentación del dataset CJ-IE: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/IE_DATASET.md
- Tarjeta del modelo chinese-decision-4b: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/MODEL_CARD_4B.md
- Dataset CJ-Dataset: https://huggingface.co/datasets/bbldCVer-hf/CJ-Dataset
- Dataset de evaluación CJ-Bench: https://huggingface.co/datasets/bbldCVer-hf/CJ-Bench
- Paper referenciado (arXiv:2609.36965): https://arxiv.org/abs/2609.36965
