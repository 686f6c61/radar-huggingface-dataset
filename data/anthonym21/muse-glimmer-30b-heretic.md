# anthonym21/Muse-Glimmer-30B-heretic

## Resumen

Muse Glimmer 30B (heretic) es una variante del modelo `meta-models/Muse-Glimmer-30B` a la que se le ha practicado una ablación direccional de la dirección de rechazo directamente sobre los pesos. No hay fine-tuning, ni datos de entrenamiento nuevos, ni cambios en el tokenizador o en el formato de chat: lo único que se modifica es la capacidad de las matrices que escriben en el residual stream de proyectar componentes en la dirección de rechazo. El resultado es un modelo "abliterated" que conserva las capacidades del original pero que, medido con tres jueces independientes, reduce drásticamente las tasas de negativa.

El interés técnico de esta publicación no está en la ablación en sí (es una técnica conocida desde Arditi et al. 2024), sino en que el autor publica una evaluación cuantitativa reproducible: el mismo script sobre el modelo base y sobre el modelo ablacionado, con prompts retenidos de JailbreakBench, tres jueces de rechazo distintos y comprobaciones de sobre-rechazo, divergencia KL y benchmarks de capacidad (GSM8K, ARC-Challenge, MMLU). Además, documenta por primera vez el comportamiento del canal de razonamiento del modelo tras la ablación, un dato que las fichas de abliteración habituales omiten.

El modelo tiene 29.776.626.688 parámetros (~29,8 B) en safetensors, un repositorio de 59,6 GB y licencia Apache-2.0. Es un transformer denso de 52 capas con arquitectura de normalización tipo sándwich, y hereda del modelo base la modalidad image-text-to-text. La longitud de contexto no se documenta en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de 52 capas con normalización tipo sándwich (sandwich-norm); 104 módulos escritores en el residual stream |
| Parámetros totales | 29.776.626.688 (~29,8 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo contiene safetensors sin cuantizar y el autor no publica variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 52 capas con normalización de tipo sándwich, una disposición en la que cada subcapa está normalizada tanto a la entrada como a la salida. Sobre esa arquitectura, la ablación se aplica a los 104 módulos que escriben en el residual stream (proyecciones de salida de atención y proyecciones down del MLP). La modificación es quirúrgica: se calcula una dirección de rechazo por capa como la diferencia entre la activación media del residual stream en prompts dañinos y en prompts inocuos, y se reescriben esas matrices para que no puedan proyectar a lo largo de dicha dirección.

El proceso de búsqueda lo realiza la herramienta `heretic`, que usa un optimizador TPE (Tree-structured Parzen Estimator) para explorar los pesos de ablación por capa y la propia dirección, con dos objetivos en conflicto: número de rechazos y divergencia KL respecto al modelo base en prompts inocuos. El resultado es un frente de Pareto del que se selecciona un punto con una regla fijada antes de ver ningún resultado de test: la menor tasa de rechazo en modo razonamiento entre los candidatos que se mantengan a menos de 5 puntos del base en GSM8K, ARC-Challenge, MMLU y sobre-rechazo. Esta publicación añade una corrección del gain post-norm para arquitecturas sándwich, aplicada a todos los módulos cuyo output alimenta una normalización.

No hay entrenamiento ni datos nuevos: el tokenizador, el formato de chat y el resto de capacidades son idénticos al modelo base. El chat emplea canales explícitos: `<|start|>assistant to=user<|message|>` fuerza la respuesta directa sin razonamiento, mientras que el canal `to=self` aloja el razonamiento (hasta 768 tokens) antes de responder en `to=user`; el modo de razonamiento se controla con `Reasoning strength: low` en el system prompt.

## Capacidades

- Generación de texto conversacional multi-turno, con un formato de chat basado en canales (`to=self` para razonamiento, `to=user` para la respuesta final).
- Modo de razonamiento explícito: el modelo delibera en el canal interno antes de contestar, con un límite práctico de 768 tokens (el 100 % de las ejecuciones medidas terminaron dentro de ese límite).
- Procesamiento de imagen y texto: la pipeline declarada es `image-text-to-text`, heredada del modelo base. No se han publicado evaluaciones de la calidad multimodal tras la ablación.
- Respuestas directas sin razonamiento cuando se fuerza el canal de respuesta, útil para medir el comportamiento en el primer token.
- Capacidad reducida de rechazo: es la característica diferencial del modelo, no una capacidad funcional adicional.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible; el canal de razonamiento sugiere cierta capacidad de deliberación, pero no hay evaluación de agentes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación en seguridad de modelos: el modelo sirve como referencia para estudiar cómo se comporta la dirección de rechazo tras la ablación, con métricas de ataque exitoso (81 % en modo directo con HarmBench) comparables contra el base (2 %). Es un instrumento de medida, no un producto final.
- Evaluación de clasificadores de rechazo: al desplazar la distribución de respuestas, permite comprobar la robustez de clasificadores como `protectai/distilroberta-base-rejection-v1` frente a modelos sin alineamiento, midiendo falsos negativos en un rango de 21 % a 31 % de rechazo residual.
- Generación de datos adversarios para entrenamiento de guardrails: el modelo produce cumplimientos que pueden etiquetarse y usarse como ejemplos negativos en datasets de moderación, con la ventaja de que el comportamiento está caracterizado cuantitativamente.
- Escritura creativa sin fricción: narrativa, guion o ficción con temáticas sensibles en las que el modelo base activaría negativas; el sobre-rechazo en prompts inocuos es del 0-1 %, por lo que no degrada el uso generalista.
- Red teaming interno de aplicaciones: simular un atacante con un modelo de 30 B que cumple peticiones dañinas en el 81 % de los casos en modo directo permite validar filtros de entrada y salida en un pipeline antes de desplegarlo.
- Réplica de experimentos de ablación: el autor publica método, parámetros de búsqueda y código de evaluación, de modo que el repositorio funciona como caso de estudio reproducible para quien quiera aplicar `heretic` a otras arquitecturas con normalización sándwich.
- Despliegue local en investigación con cuantización de 4 bits (aproximadamente 16 GB de pesos), sin dependencia de APIs externas ni de telemetría de terceros.

## Benchmarks y rendimiento

Resultados publicados por el autor. Prompts dañinos: 100 comportamientos de JailbreakBench, retenidos durante la búsqueda. Prompts inocuos: 100 del split de test de `mlabonne/harmless_alpaca`. Decodificación greedy. Los benchmarks de capacidad son slices de lm-eval-harness con prompts de completación cruda, sin plantilla de chat ni razonamiento, aplicados de forma idéntica a ambos modelos; por tanto solo la diferencia es interpretable, no el valor absoluto.

| Medición | Modelo base | Este modelo |
|---|---|---|
| Rechazo, modo directo, comprobación de subcadena (retenido) | 95,0 % | 1,0 % |
| Rechazo, modo directo, clasificador de rechazo | 87,0 % | 21,0 % |
| Rechazo, modo directo, juez LLM (solo REFUSAL) | 97,0 % | 31,0 % |
| Rechazo, modo directo, juez LLM (REFUSAL o PARTIAL) | 97,0 % | 31,0 % |
| Éxito de ataque, modo directo, clasificador HarmBench | 2,0 % | 81,0 % |
| Rechazo, modo razonamiento, subcadena (canal de respuesta) | 94,0 % | 15,0 % |
| Rechazo, modo razonamiento, clasificador de rechazo | 89,0 % | 25,0 % |
| Rechazo, modo razonamiento, juez LLM (solo REFUSAL) | 96,0 % | 63,0 % |
| Éxito de ataque, modo razonamiento, HarmBench | 2,0 % | 41,0 % |
| El razonamiento decide rechazar (texto del canal interno) | 87,0 % | 41,0 % |
| El razonamiento concluye "no prohibido" | 4,0 % | 19,0 % |
| Razonamientos terminados en 768 tokens | 100,0 % | 100,0 % |
| Sobre-rechazo en 100 prompts inocuos, subcadena | 1,0 % | 0,0 % |
| Sobre-rechazo en 100 prompts inocuos, clasificador | 2,0 % | 1,0 % |
| Divergencia KL respecto al base, primer token de respuesta | 0,0000 | 0,1013 |
| GSM8K, exact match estricto (250 problemas) | 94,8 % | 93,6 % |
| GSM8K, exact match flexible (250 problemas) | 94,8 % | 93,6 % |
| ARC-Challenge, acc_norm (250 preguntas) | 61,6 % | 61,2 % |
| MMLU, acc (10 preguntas por materia, 570 total) | 81,8 % | 81,4 % |
| Éxito de ataque HarmBench, modo directo (set on-distribution) | 1,9 % | 81,7 % |
| Éxito de ataque HarmBench, modo razonamiento (set on-distribution) | 1,0 % | 18,3 % |

Jueces empleados: `protectai/distilroberta-base-rejection-v1` como clasificador de rechazo, `Qwen/Qwen2.5-32B-Instruct` con rúbrica de tres vías REFUSAL/PARTIAL/COMPLIANCE y `cais/HarmBench-Mistral-7b-val-cls`. El autor advierte que en 250 preguntas un error estándar ronda los 3 puntos, por lo que diferencias inferiores a 5 puntos son ruido: la caída en GSM8K, ARC-Challenge y MMLU no es significativa.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 59,6 GB (coincide con el tamaño del repositorio). No cabe en una GPU de 40 GB sin técnicas de offload.
- Inferencia en BF16: una H100 80 GB, una A100 80 GB o dos A100 40 GB con tensor parallelism. Con 80 GB queda margen escaso para KV cache si el contexto es largo.
- Cuantización a 8 bits: aproximadamente 30 GB de pesos; cabe en una A100 40 GB o en dos RTX 4090.
- Cuantización a 4 bits: aproximadamente 16 GB de pesos; cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o L40S (48 GB) con comodidad. El autor no publica variantes GGUF ni AWQ/GPTQ, por lo que hay que generarlas.
- Despliegue: al ser un repositorio transformers/safetensors estándar, es compatible con vLLM, TGI y otras pilas que carguen safetensors; para llama.cpp u Ollama es necesario convertir los pesos previamente. El autor no documenta ninguna receta de despliegue.
- Latencia y throughput: no disponibles. No se han publicado medidas.
- Nota: el modelo exige una plantilla de chat con canales (`to=self` / `to=user`) y un system prompt con `Reasoning strength`; usar prompts de completación cruda degrada la calidad, como demuestran los propios slices de benchmarks.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo (directo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-heretic (este) | ~29,8 B | No disponible | 1 % subcadena / 21 % clasificador / 31 % juez LLM | Apache-2.0 | HuggingFace, 0 descargas |
| Muse-Glimmer-30B (base) | ~29,8 B | No disponible | 95 % subcadena / 87 % clasificador / 97 % juez LLM | Apache-2.0 (según este repo) | HuggingFace |
| Otras variantes abliterated de 30 B | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

La única comparación con datos verificables es contra el modelo base, que comparte arquitectura, tokenizador, formato de chat y parámetros. No se han proporcionado resultados de otros modelos abliterated de tamaño similar, por lo que no es posible establecer una comparativa de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para no rechazar peticiones: el éxito de ataque con HarmBench sube del 2 % al 81 % en modo directo. No debe desplegarse en aplicaciones de cara al público sin un filtro externo de entrada y salida.
- El canal de razonamiento no actúa como salvaguarda: el 41 % de las deliberaciones siguen concluyendo que hay que rechazar, pero en el 19 % de los casos el modelo se autoconvence de que la petición "no está prohibida". La deliberación persiste, el veredicto cambia.
- Existe una divergencia KL de 0,1013 respecto al base en el primer token de respuesta sobre prompts inocuos: la distribución de salida no es idéntica y pueden aparecer cambios de estilo o de tono no evaluados.
- El sobre-rechazo medido es bajo (0-1 %), pero la evaluación se limita a 100 prompts de `mlabonne/harmless_alpaca`; no cubre dominios especializados ni idiomas distintos del inglés.
- Los benchmarks de capacidad se ejecutaron con prompts de completación cruda y sin plantilla de chat, por lo que los valores absolutos (MMLU 81,4 %, GSM8K 93,6 %) subestiman el rendimiento real en uso conversacional. Solo sirven para comparar contra el base.
- Con 250 preguntas por benchmark, el error estándar es de unos 3 puntos; las diferencias de capacidad observadas son ruido estadístico, no una degradación demostrada.
- Idiomas soportados: no disponibles. No hay evaluación multilingüe ni garantía de comportamiento fuera del inglés.
- Longitud de contexto: no disponible. No se puede planificar un despliegue con contexto largo sin verificarla empíricamente.
- La modalidad image-text-to-text se hereda del base, pero no se ha evaluado el efecto de la ablación sobre entradas de imagen.
- Licencia Apache-2.0: permite uso comercial, pero la responsabilidad legal y ética del contenido generado recae íntegramente en el desplegador. La licencia no implica aval del autor ni del modelo base.
- El repositorio no tiene validación de la comunidad (0 descargas, 0 likes) y fue publicado en octubre de 2026; no hay revisión independiente de los resultados más allá del código publicado por el propio autor.
- No se documentan cuantizaciones oficiales: cualquier GGUF o AWQ en circulación es de terceros y no está validada contra las métricas de esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anthonym21/Muse-Glimmer-30B-heretic
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Herramienta heretic (ablación direccional con Optuna): https://github.com/p-e-w/heretic
- Paper del método (Arditi et al. 2024, "Refusal in Language Models Is Mediated by a Single Direction"): https://arxiv.org/abs/2406.11717
- Dataset de prompts dañinos retenidos (JailbreakBench): https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Dataset de prompts dañinos on-distribution: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts inocuos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Clasificador de rechazo: https://huggingface.co/protectai/distilroberta-base-rejection-v1
- Juez LLM: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Clasificador HarmBench: https://huggingface.co/cais/HarmBench-Mistral-7b-val-cls
