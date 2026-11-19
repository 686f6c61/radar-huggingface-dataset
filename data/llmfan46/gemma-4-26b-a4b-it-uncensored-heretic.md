# llmfan46/gemma-4-26B-A4B-it-uncensored-heretic

## Resumen

`llmfan46/gemma-4-26B-A4B-it-uncensored-heretic` es una variante "decensurada" (abliterated) del modelo multimodal `google/gemma-4-26B-A4B-it` de Google DeepMind, publicada por el contribuidor independiente llmfan46. El objetivo declarado es reducir drásticamente las negativas del modelo a responder (de 100/100 a 11/100 en el conjunto de prueba del autor) preservando en la medida de lo posible la calidad original, medida con una divergencia KL de 0,0468 frente al modelo base.

Técnicamente es un modelo de ~25.800 millones de parámetros totales (arquitectura MoE con ~4B activos, según la nomenclatura A4B del nombre), multimodal de entrada imagen-texto y salida texto, con licencia declarada Apache 2.0. La modificación se realizó con la herramienta Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA) sobre un conjunto acotado de capas y componentes de atención, sin reentrenamiento.

Es relevante para quienes necesitan un modelo multimodal de tamaño medio-grande sin las capas de rechazo del modelo alineado original, por ejemplo en investigación sobre alineación, red-teaming, generación creativa sin filtros o evaluación de sesgos. Conviene tener presente que la propia model card enlaza la licencia de Gemma 4 de Google, lo que genera una ambigüedad relevante entre la etiqueta `apache-2.0` del repo y las condiciones del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (MoE, nomenclatura A4B del modelo base); detalles internos no disponibles |
| Parámetros totales | 25.805.933.872 (~25,8B) |
| Parámetros activos | ~4B (inferido del nombre A4B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en el repo; la model card enlaza además la licencia de Gemma 4 de Google |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repo | 51,6 GB |
| Pipeline | image-text-to-text |
| Modelo base | google/gemma-4-26B-A4B-it |
| Método de decensurado | Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) |
| Descargas / likes | 611 / 23 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 26B A4B de Google DeepMind: un transformer multimodal que procesa texto e imágenes (pipeline image-text-to-text) con mezcla de expertos, de ahí la designación A4B que sugiere ~4B parámetros activos sobre ~26B totales. No se dispone de información detallada sobre número de tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO del modelo base en la información proporcionada.

La modificación consiste en una ablación de direcciones de activación (abliteration) aplicada con Heretic v1.2.0 mediante el método ARA, que permite rangos arbitrarios de ablación en lugar de una única dirección. Los parámetros declarados son: `start_layer_index=1`, `end_layer_index=30`, `preserve_good_behavior_weight=0.4621`, `steer_bad_behavior_weight=0.0006`, `overcorrect_relative_weight=0.7212`, `neighbor_count=13`, y el componente objetivo es `attn.o_proj`. No hay reentrenamiento ni fine-tuning: solo se modifican pesos de proyección de atención en el rango de capas indicado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instruct base.
- Procesamiento de imágenes en entrada (image-text-to-text): descripción, razonamiento visual y respuesta a preguntas sobre imágenes.
- Razonamiento general y conocimiento enciclopédico (MMLU 80,81% en la evaluación del autor).
- Razonamiento físico y de sentido común (PIQA 91,73%).
- Respuestas con muchas menos negativas: 11/100 rechazos frente a 100/100 del original en el conjunto de prueba del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: sirve como caso de estudio reproducible para medir el efecto de ARA sobre un modelo multimodal grande, comparando KL divergence, rechazos y benchmarks frente al base.
- Red-teaming y evaluación de seguridad: permite probar cómo responde un modelo sin capas de rechazo ante prompts sensibles, útil para construir clasificadores y filtros externos más robustos.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas donde el modelo alineado rechazaría la petición.
- Asistencia multimodal en entornos controlados: análisis de imágenes (capturas, diagramas, documentos escaneados) con respuestas conversacionales, aprovechando la entrada image-text-to-text.
- Evaluación comparativa de calidad tras decensurado: usar los resultados de MMLU y PIQA del autor como referencia para estudiar la degradación de conocimiento (1,67 puntos en MMLU) y su relación con la tasa de rechazos.
- Despliegue local en investigación: con ~25,8B parámetros totales y ~4B activos, es candidato a inferencia en GPUs de gama alta o profesionales con cuantización, aunque el repo solo publica safetensors.
- Base para fine-tuning posterior: al estar decensurado, reduce la necesidad de filtrar rechazos en datasets de instrucciones y puede servir de punto de partida para ajustes específicos de dominio.

## Benchmarks y rendimiento

Resultados publicados en la model card por el autor:

| Benchmark | Original (gemma-4-26B-A4B-it) | Este modelo (heretic) | Diferencia |
|---|---|---|---|
| MMLU (accuracy, 7.021 preguntas) | 82,48% (5.791 correctas) | 80,81% (5.674 correctas) | −1,67 pp |
| PIQA (accuracy, 1.838 preguntas) | 92,06% (1.692 correctas) | 91,73% (1.686 correctas) | −0,33 pp |
| Tasa de rechazos (100 prompts) | 100/100 | 11/100 | −89 pp |
| KL divergence vs. original | 0 (por definición) | 0,0468 | — |

Desglose MMLU por asignaturas (original → heretic): professional_law 70,06% → 64,46%; moral_scenarios 70,14% → 63,57%; miscellaneous 91,64% → 91,38%; professional_psychology 88,61% → 85,44%; high_school_psychology 95,56% → 96,30%; high_school_macroeconomics 90,86% → 89,34%; elementary_mathematics 90,76% → 90,76%; moral_disputes 83,33% → 81,61%; prehistory 91,28% → 90,70%; philosophy 83,65% → 83,02%. Las mayores caídas se concentran en derecho profesional y escenarios morales, coherente con la ablación de rechazos.

No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~51,6 GB de pesos, por lo que se necesitan al menos 2× A100 40GB, 1× A100 80GB, 1× H100 80GB o 2× RTX 4090 24GB con tensor parallelism.
- En cuantización de 8 bits: ~26 GB, viable en una RTX 4090 24GB solo con offload parcial o en A6000 48GB / L40S 48GB.
- En cuantización de 4 bits: ~13-15 GB, cabe en RTX 4090 24GB, RTX 3090 24GB o RTX 4080 16GB con margen ajustado.
- No se publican variantes GGUF en el repo; para llama.cpp/Ollama habría que convertir safetensors manualmente.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI previsiblemente compatibles al ser safetensors de un modelo Gemma 4, aunque no se confirma en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Este modelo (gemma-4-26B-A4B-it-uncensored-heretic) | ~25,8B totales / ~4B activos | no disponible | apache-2.0 (repo) + licencia Gemma 4 enlazada | Sí (imagen-texto) | Decensurado vía ARA; MMLU 80,81%, PIQA 91,73% |
| google/gemma-4-26B-A4B-it | ~25,8B totales / ~4B activos | no disponible | licencia Gemma 4 | Sí (imagen-texto) | Base alineado; MMLU 82,48%, PIQA 92,06%, 100/100 rechazos |
| Otras variantes heretic del mismo autor | variable | no disponible | variable | variable | Mismo pipeline Heretic/ARA aplicado a otros modelos |

No se dispone de datos de benchmarks de terceros (Qwen, Llama, Mistral) en la información proporcionada para una comparación cuantitativa fiable; por tanto, la comparativa se limita al modelo base y a la familia de variantes del mismo autor.

## Limitaciones y advertencias

- La ablación elimina parte de las capas de seguridad del modelo: puede generar contenido sensible, ofensivo o inapropiado sin filtros, lo que exige moderación externa en producción.
- Degradación medible en conocimiento: MMLU cae 1,67 puntos y áreas como derecho profesional (−5,6 pp) y escenarios morales (−6,6 pp) se ven afectadas.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos generativos de este tamaño.
- Ambigüedad de licencia: el repo declara `apache-2.0`, pero la model card enlaza la licencia de Gemma 4 de Google; conviene verificar las condiciones reales antes de uso comercial.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera del inglés sin evaluación propia.
- Longitud de contexto no documentada: limita la planificación de casos de uso con documentos largos.
- No hay variantes cuantizadas publicadas (GGUF, AWQ, GPTQ) en el repo, lo que complica el despliegue en hardware consumer.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y que no podrá subir nuevos modelos sin financiación; riesgo de que el repo deje de actualizarse.
- No hay información sobre tool calling, agentes ni modo thinking: no asumir estas capacidades sin verificación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Pull request de ARA en Heretic: https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
