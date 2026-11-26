# quincyqiang/chinese-decision-unified-0.8b

## Resumen

chinese-decision-unified-0.8b es un modelo de 755.819.712 parámetros (0,76 B) desarrollado por quincyqiang, un fine-tune del modelo base Qwen/Qwen3.5-0.8B. Su particularidad es que combina en un único fichero de pesos dos modos de lectura ("readouts") distintos sobre el mismo backbone: un modo de decisión probabilística, que dada una lista de candidatos devuelve una probabilidad por candidato, y un modo de extracción de información, que dado un texto y un conjunto de tipos de entidad devuelve spans tipados con posiciones y probabilidades. Ninguno de los dos modos genera tokens de texto libre.

El modelo está entrenado desde el backbone original de Qwen3.5-0.8B (no es un fine-tune encadenado sobre el modelo de decisión previo) mediante LoRA con r=32, posteriormente fusionado, más una cabeza de spans de aproximadamente 3 M de parámetros inicializada aleatoriamente. El entrenamiento se realizó sobre CJ-Dataset (13.048.000 ítems de decisión más 611.354 ítems de decisión derivados de CJ-IE) y sobre 573.294 filas de spans de CJ-IE, que cubren NER, relaciones y argumentos de eventos.

Es relevante porque propone un enfoque alternativo a los LLM generativos para tareas de clasificación y extracción en chino: en lugar de generar una respuesta, el modelo lee logits en posiciones concretas, lo que reduce latencia y coste computacional. Con 0,76 B de parámetros y licencia Apache-2.0, está pensado para despliegues con restricciones de VRAM o de latencia, manteniendo una precisión de decisión del 83,46 % en el benchmark completo CJ-Bench (307.900 ítems).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 con capas de atención lineal (se recomienda `flash-linear-attention`); doble cabeza de lectura: decisión (logits de letras candidatas) y extracción (span head de tipo) |
| Parámetros totales | 755.819.712 (0,76 B); ~3 M corresponden a la span head |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens para decisión; extracción entrenada con textos de ≤ 300 caracteres por ventana |
| Tipos de cuantización | no disponible (pesos publicados en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un único `model.safetensors`, ~1,5 GB) |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto de Qwen3.5-0.8B, que incluye capas de atención lineal para las que el autor recomienda instalar `flash-linear-attention`. Sobre ese backbone se añaden dos cabezas de lectura que comparten los mismos pesos del tronco y los mismos parámetros LoRA: una cabeza de decisión, que lee los logits de las letras candidatas en la última posición para asignar una probabilidad a cada opción, y una span head de aproximadamente 3 M de parámetros que, en modo extracción, recibe el texto reescrito carácter a carácter y clasifica en cada posición si comienza o no un span de un tipo dado. La span head se inicializó aleatoriamente y se entrenó junto con el resto.

El entrenamiento se realizó con LoRA (r=32) fusionado posteriormente, desde el modelo base original, en un único proceso conjunto. Los datos de decisión provienen de CJ-Dataset (13.048.000 ítems) más 611.354 ítems de decisión de CJ-IE; los de extracción, de 573.294 filas de spans de CJ-IE con 32 fuentes de NER, relaciones de DuIE y CMeIE, y argumentos de eventos de DuEE y FewFC. El checkpoint publicado es el step 14.504 (último paso de una época), seleccionado por una puntuación conjunta de decisión y extracción. El modelo aplica una temperatura de calibración T = 1,1326 solo a la lectura de decisión, una corrección de prior `none_shift = log(1/0,2)` para los spans y un umbral `decision_shift = 0,75` elegido por F1 en el conjunto de desarrollo de CJ-IE. La versión de prompt es `hmm-zh-v1`.

## Capacidades

- Decisión probabilística sobre candidatos: dada una pregunta y entre 2 y 26 opciones (el entrenamiento cubre de 2 a 16), devuelve una probabilidad por candidato (`noul`, `choice`, `score`).
- Extracción de entidades nombradas (NER) con tipos definidos por nombre y descripción, devolviendo spans de caracteres con posición y probabilidad.
- Extracción de relaciones: dado un sujeto, extrae el objeto correspondiente.
- Extracción de eventos: composición en pipeline, primero una decisión sí/no sobre el tipo de evento y después la extracción del disparador y los argumentos.
- Clasificación zero-shot mediante la lectura de decisión con candidatos definidos en la petición.
- No genera texto libre: ambas lecturas son deterministas sobre logits y cabezas de clasificación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; el pipeline de eventos es la única composición documentada.
- Capacidades multilingües: solo chino.
- Capacidades especiales: dos modos de lectura seleccionables por el contenido de la petición (`questions` activa decisión, `types` activa extracción); servicio HTTP y pipeline local (`DecisionPipeline`) con el mismo formato de petición.

## Casos de uso

- Clasificación de documentos en pipelines de ingesta: usar la lectura de decisión con las categorías del dominio como candidatos permite etiquetar cada documento sin generar texto, con latencia baja gracias al tamaño de 0,76 B.
- Extracción de entidades en textos administrativos o legales en chino: definir los tipos de entidad con nombre y descripción y obtener spans con posición y probabilidad, apto para alimentar bases de datos o índices de búsqueda.
- Construcción de grafos de conocimiento: la extracción de relaciones (sujeto → objeto) permite poblar tripletas a partir de corpus chinos sin un LLM generativo intermedio.
- Detección de eventos en noticias o informes: pipeline de dos pasos (decisión sí/no sobre el tipo de evento y extracción de disparador y argumentos) para monitorización temática.
- Enrutado y triaje en atención al cliente: decidir entre un conjunto acotado de intenciones o departamentos con probabilidades calibradas, lo que permite aplicar umbrales de confianza y derivar a revisión humana.
- Moderación y filtrado por reglas: clasificación binaria o multiclase de contenido con probabilidad por candidato, integrable en servicios HTTP gracias al endpoint compatible.
- Anotación asistida para equipos de etiquetado: preetiquetar NER y relaciones en chino con probabilidades por span para revisión posterior, reduciendo el coste de anotación manual.

## Benchmarks y rendimiento

| Evaluación | chinese-decision-unified-0.8b | unified-2b | unified-4b |
|---|---|---|---|
| CJ-Bench completo, accuracy (T = 1) | 83,46 % | 85,00 % | 86,86 % |
| CJ-IE test, accuracy de decisión | 90,65 % | 91,30 % | 91,89 % |
| CJ-IE test, micro F1 de extracción | 63,1 | 66,0 | 68,9 |

El modelo conserva la precisión de decisión del modelo solo-decisión (83,46 % frente a 83,11 % en CJ-Bench completo, según la model card). No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1,5-2 GB para los pesos más el overhead de activaciones y del runtime; el repositorio ocupa 1,5 GB.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM debería ser suficiente en BF16; con cuantización (no documentada oficialmente) el requisito bajaría aún más.
- GPU recomendadas: no se especifican; por tamaño, RTX 3060/4060 o superiores son suficientes; A100/H100 no son necesarias salvo para alto throughput por lotes.
- Despliegue: `transformers` para la lectura de decisión; la lectura de extracción requiere el paquete `chinese-decision` (instalable desde el repositorio de GitHub). Se recomienda `flash-linear-attention>=0.4` para las capas de atención lineal. El modelo expone endpoints compatibles y un servicio HTTP propio; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CJ-Bench (accuracy) | CJ-IE F1 extracción | Licencia |
|---|---|---|---|---|---|
| chinese-decision-unified-0.8b | 0,76 B | 16.384 (decisión) | 83,46 % | 63,1 | Apache-2.0 |
| chinese-decision-unified-2b | ~2 B (base Qwen3.5-2B) | no disponible | 85,00 % | 66,0 | Apache-2.0 |
| chinese-decision-unified-4b | ~4 B (base Qwen3.5-4B) | no disponible | 86,86 % | 68,9 | Apache-2.0 |
| chinese-decision-0.8b (solo decisión) | 0,76 B | no disponible | 83,11 % | no aplica | Apache-2.0 |

La comparación con modelos de propósito general (por ejemplo, LLM generativos del mismo tamaño para NER o clasificación en chino) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta chino; no hay capacidades multilingües documentadas.
- No genera texto: no puede usarse para tareas de generación, resumen, traducción o diálogo libre.
- La lectura de extracción está entrenada con textos de hasta 300 caracteres por ventana y spans de hasta 20 caracteres; textos más largos requieren troceado manual.
- La ventana de decisión es de 16.384 tokens, pero el entrenamiento cubre entre 2 y 16 candidatos por pregunta, aunque la inferencia admite hasta 26.
- Las probabilidades de las dos lecturas no son comparables entre sí; mezclarlas para decidir la tarea es un error de uso.
- Riesgo de alucinación: al no generar texto, el riesgo se traslada a falsos positivos en spans y a decisiones con confianza mal calibrada fuera de la distribución de entrenamiento; se recomienda aplicar umbrales y validación en el dominio objetivo.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre corpus chinos (DuIE, CMeIE, DuEE, FewFC y 32 fuentes de NER), puede heredar los sesgos de esas fuentes.
- La licencia Apache-2.0 permite uso comercial, pero se hereda la del modelo base Qwen3.5-0.8B; conviene revisar las condiciones del modelo base.
- El paquete necesario para la lectura de extracción se instala desde el repositorio de GitHub (`main`), no desde PyPI, lo que añade un riesgo de reproducibilidad en producción.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de despliegue optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quincyqiang/chinese-decision-unified-0.8b
- Modelo en ModelScope: https://www.modelscope.cn/models/quincyqiang/chinese-decision-unified-0.8b
- Repositorio de código: https://github.com/yanqiangmiffy/chinese-decision
- Plataforma de pruebas Decision Studio: https://github.com/yanqiangmiffy/chinese-decision-studio
- Modelo solo-decisión 0.8b: https://huggingface.co/quincyqiang/chinese-decision-0.8b
- Versión unified 2b: https://huggingface.co/quincyqiang/chinese-decision-unified-2b
- Versión unified 4b: https://huggingface.co/quincyqiang/chinese-decision-unified-4b
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset CJ-Dataset: https://huggingface.co/datasets/bbldCVer-hf/CJ-Dataset
- Benchmark CJ-Bench: https://huggingface.co/datasets/bbldCVer-hf/CJ-Bench
- Documentación del dataset CJ-IE: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/IE_DATASET.md
- Model card unified 2b: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/MODEL_CARD_UNIFIED_2B.md
- Model card unified 4b: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/MODEL_CARD_UNIFIED_4B.md
- Model card solo-decisión 0.8b: https://github.com/yanqiangmiffy/chinese-decision/blob/main/docs/MODEL_CARD_0_8B.md
- Paper referenciado (arXiv:2609.36965): https://arxiv.org/abs/2609.36965
