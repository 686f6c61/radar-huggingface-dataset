# richardyoung/Mistral-Small-3.2-24B-Instruct-2506-DiM-heretic

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-DiM-heretic es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo Mistral-Small-3.2-24B-Instruct-2506, publicada por el usuario richardyoung. El modelo base lo desarrolla Mistral AI y la versión intermedia utilizada como punto de partida es la publicada por unsloth. La modificación se ha realizado con la herramienta Heretic v2.0.0, que aplica una técnica de abliteration por capas para reducir la tasa de rechazos del modelo ante peticiones que el modelo original declinaría.

El modelo conserva la arquitectura y el tamaño del original: 24.011.361.280 parámetros (aproximadamente 24B), pipeline image-text-to-text (multimodal con visión) y licencia Apache 2.0. La relevancia de esta ficha radica en que documenta una modificación de seguridad sobre un modelo de referencia de tamaño medio, con parámetros de abliteration reproducibles y métricas declaradas de reducción de rechazos (de 98/100 a 35/100) junto con una divergencia KL de 0,0931 respecto al original.

Es importante señalar que la model card no documenta la longitud de contexto, los tipos de cuantización ni los detalles completos de entrenamiento del modelo base; estos datos se indican como "no disponible" cuando no aparecen en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Mistral 3 (mistral3); detalles internos de capas y atención no disponibles |
| Parametros totales | 24.011.361.280 (≈24B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 48,1 GB; librería declarada: vllm) |

## Arquitectura y entrenamiento

El modelo es una modificación del checkpoint Mistral-Small-3.2-24B-Instruct-2506, que a su vez es una actualización menor de Mistral-Small-3.1-24B-Instruct-2503. La model card del autor de la variante no describe la arquitectura interna más allá de la etiqueta `mistral3` y el pipeline `image-text-to-text`, por lo que no se dispone de detalles sobre número de capas, tipo de atención, composición del dataset de entrenamiento ni procesos de RLHF/DPO en la información proporcionada.

La innovación técnica de esta variante es la aplicación de Heretic v2.0.0, una herramienta de abliteration que modifica pesos en las proyecciones `attn.o_proj` y `mlp.down_proj` con parámetros por capa reproducibles. Los valores declarados son: `direction_index` por capa; para `attn.o_proj`, `max_weight` 1,43 en posición 25,30, `min_weight` 1,23 a distancia 9,38; para `mlp.down_proj`, `max_weight` 1,36 en posición 34,94, `min_weight` 1,29 a distancia 9,01. El autor indica que el proceso es reproducible y remite al directorio `reproduce/README.md`. No se documentan datos de entrenamiento adicionales ni tokens de ajuste.

## Capacidades

- Generación de texto conversacional multi-turno, con mejoras declaradas en seguimiento de instrucciones y reducción de generaciones infinitas o repetitivas respecto a la versión 3.1.
- Razonamiento y conocimiento STEM: resultados declarados en MMLU, MMLU Pro, MATH, GPQA y SimpleQA.
- Generación de código: resultados en HumanEval Plus y MBPP Plus.
- Capacidades de visión: procesamiento de imagen y texto (MMMU, MathVista, ChartQA, DocVQA, AI2D).
- Function calling / tool calling: la model card del base indica una plantilla de function calling más robusta en la versión 3.2.
- Soporte multilingüe amplio: 24 idiomas listados, incluyendo español, inglés, francés, alemán, portugués, italiano, japonés, coreano, ruso, chino, árabe, persa, indonesio, malayo, nepalí, polaco, rumano, serbio, sueco, turco, ucraniano, vietnamita, hindi y bengalí.
- Modo "decensored": reducción de rechazos declarada de 98/100 a 35/100 en la métrica interna del autor.
- No se documenta en la información disponible soporte de audio ni modo thinking explícito.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteration comparando respuestas con el original y midiendo la divergencia KL declarada (0,0931) y la tasa de rechazos (35/100 frente a 98/100).
- Evaluación de robustez de filtros: útil para probar sistemas de moderación y clasificadores de contenido frente a un modelo con menor tasa de rechazos, en entornos controlados de laboratorio.
- Asistente conversacional con contexto multimodal: al conservar el pipeline image-text-to-text, puede emplearse en tareas de descripción de imágenes y preguntas sobre documentos visuales, con la salvedad de que la longitud de contexto no está documentada.
- Generación de código en pipelines internos: los resultados declarados en HumanEval Plus (92,90% pass@5) y MBPP Plus (78,33% pass@5) permiten integrarlo en herramientas de autocompletado o revisión de código, siempre con revisión humana.
- Procesamiento de documentos con gráficos: ChartQA (87,4%) y DocVQA (94,86%) sugieren uso en extracción de información de gráficos y documentos escaneados.
- Despliegue en vLLM para servicios de inferencia: la librería declarada es vllm y la model card recomienda vLLM >= 0.9.1 con mistral_common >= 1.6.2, lo que facilita su integración en infraestructura de serving existente.
- Experimentación multilingüe: con 24 idiomas soportados, puede emplearse en pruebas de calidad de traducción o atención al cliente en mercados con varios idiomas, sujeto a validación por idioma.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Mistral-Small-3.2-24B-Instruct-2506, no a la variante heretic. La model card del autor solo aporta métricas de abliteration.

| Métrica | Este modelo (heretic) | Modelo original |
|---|---|---|
| Rechazos (Refusals) | 35/100 | 98/100 |
| Divergencia KL | 0,0931 | 0 (por definición) |

Resultados del modelo base (Mistral-Small-3.2-24B-Instruct-2506):

| Benchmark | Small 3.1 24B Instruct | Small 3.2 24B Instruct |
|---|---|---|
| Wildbench v2 | 55,6% | 65,33% |
| Arena Hard v2 | 19,56% | 43,1% |
| IF interno (accuracy) | 82,75% | 84,78% |
| Generaciones infinitas (menor es mejor) | 2,11% | 1,29% |
| MMLU | 80,62% | 80,50% |
| MMLU Pro (5-shot CoT) | 66,76% | 69,06% |
| MATH | 69,30% | 69,42% |
| GPQA Main (5-shot CoT) | 44,42% | 44,22% |
| GPQA Diamond (5-shot CoT) | 45,96% | 46,13% |
| MBPP Plus - Pass@5 | 74,63% | 78,33% |
| HumanEval Plus - Pass@5 | 88,99% | 92,90% |
| SimpleQA (TotalAcc) | 10,43% | 12,10% |
| MMMU | 64,00% | 62,50% |
| MathVista | 68,91% | 67,09% |
| ChartQA | 86,24% | 87,4% |
| DocVQA | 94,08% | 94,86% |
| AI2D | 93,72% | 92,91% |

No se han publicado resultados de benchmarks específicos de la variante heretic más allá de las métricas de rechazos y divergencia KL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (24B), en precisión completa (FP16/BF16) se requerirían del orden de 48 GB solo para pesos, más memoria para KV cache y activaciones; en cuantización de 8 bits, aproximadamente 24-27 GB; en 4 bits, aproximadamente 13-15 GB. Estas cifras son estimaciones por tamaño, no datos publicados para este modelo.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar uso en A100 80 GB, H100, L40S o configuraciones multi-GPU; no confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada. El repo contiene safetensors de 48,1 GB, lo que no cabe en GPU de consumo en precisión completa; no se listan variantes cuantizadas.
- Opciones de despliegue: vLLM (recomendado por el autor, versión >= 0.9.1 con mistral_common >= 1.6.2) y transformers. No se documentan integraciones con llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card recomienda temperatura baja (0,15) y el uso de un system prompt, incluido el archivo SYSTEM_PROMPT.txt del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506-DiM-heretic (este) | ≈24B | no disponible | apache-2.0 | Variante decensored con 35/100 rechazos y KL 0,0931 |
| Mistral-Small-3.2-24B-Instruct-2506 (base) | ≈24B | no disponible | apache-2.0 | 98/100 rechazos; benchmarks STEM y visión documentados |
| Mistral-Small-3.1-24B-Instruct-2503 | ≈24B | no disponible | apache-2.0 | Versión anterior; peor seguimiento de instrucciones y más generaciones infinitas (2,11% frente a 1,29%) |
| unsloth/Mistral-Small-3.2-24B-Instruct-2506 | ≈24B | no disponible | apache-2.0 | Checkpoint intermedio usado como base para esta variante |

No se dispone de datos de benchmarks de la variante heretic frente a alternativas de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La abliteration reduce la tasa de rechazos de forma deliberada; esto implica que el modelo puede generar contenido que el original declinaría, con implicaciones éticas y legales según el uso.
- La divergencia KL de 0,0931 indica que la distribución de salida se ha desplazado respecto al original; pueden aparecer degradaciones en calidad, coherencia o seguimiento de instrucciones no medidas en los benchmarks disponibles.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) para esta variante concreta; los resultados mostrados corresponden al modelo base y no garantizan el mismo rendimiento tras la modificación.
- La longitud de contexto no está documentada en la información disponible, lo que dificulta planificar despliegues con ventanas largas.
- No se listan cuantizaciones oficiales; el repo de 48,1 GB en safetensors limita el despliegue en hardware de consumo sin cuantización propia.
- Riesgo de alucinación: el modelo base declara un 12,10% en SimpleQA (TotalAcc), lo que indica una precisión baja en preguntas factuales; la variante heretic no mejora este dato de forma documentada.
- Sesgos: no se documentan evaluaciones de sesgo para esta variante; la modificación de pesos puede alterar el comportamiento en dominios sensibles de forma no caracterizada.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo del contenido generado, especialmente en jurisdicciones con restricciones sobre contenido.
- El autor marca `inference: false` en los metadatos, aunque la librería declarada es vllm; conviene validar el despliegue antes de usarlo en producción.
- La fecha de creación indicada (2026-11-05) y el estado del repo (0 descargas, 0 likes) sugieren un modelo muy reciente o de baja adopción; no hay validación comunitaria disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-DiM-heretic
- Modelo base intermedio (unsloth): https://huggingface.co/unsloth/Mistral-Small-3.2-24B-Instruct-2506
- Modelo original Mistral AI: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Modelo 3.1 de referencia: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Heretic: https://heretic-project.org
- vLLM: https://github.com/vllm-project/vllm
- mistral-common: https://github.com/mistralai/mistral-common
- System prompt del modelo base: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506/blob/main/SYSTEM_PROMPT.txt
