# itismax0/RusNanoLM-800M

## Resumen

RusNanoLM-800M es un modelo de lenguaje bilingüe (ruso e inglés) de 800 millones de parámetros publicado por el usuario itismax0 en Hugging Face. Se construye sobre la arquitectura Qwen3.5 con atención lineal híbrida (Gated Delta Rule), con 24 capas en las que cada cuarta capa emplea atención completa y el resto atención lineal, lo que reduce el coste de memoria del estado a O(1). El modelo se ha ajustado mediante SFT para tareas de aritmética y razonamiento en ruso, y se evalúa sobre MERA, el conjunto de benchmarks de comprensión del ruso.

Su relevancia radica en que, pese a su tamaño reducido (852.985.920 parámetros reales según safetensors), supera en la tarea RuMultiAR a modelos mucho mayores como GigaChat-2-10B, Qwen2.5-7B o Meta-Llama-3-8B, y multiplica por 4,1 el resultado de su baseline Qwen3.5-0.8B. El modelo se distribuye con licencia Apache 2.0, pesos en safetensors y dos variantes GGUF en F16 (una para llama.cpp reciente y otra para Ollama), lo que facilita su despliegue local.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio; los datos no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 con atención lineal (Gated Delta Rule); 24 capas, cada cuarta de atención completa |
| Parametros totales | 852.985.920 (0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF F16 (sin pérdida); no se documentan otras cuantizaciones |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF (F16 y F16-ollama) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5 y sustituye la atención estándar por un esquema híbrido de atención lineal basada en Gated Delta Rule: de las 24 capas, una de cada cuatro mantiene atención completa y las restantes usan atención lineal, lo que reduce la complejidad de memoria del estado a O(1). El pipeline declarado es text-generation, aunque la librería de carga indicada en el quickstart es `AutoModelForImageTextToText`, lo que sugiere que la clase de modelo conserva la interfaz multimodal de la familia Qwen3.5 pese a que la model card no documenta capacidades de visión.

El ajuste se realizó mediante SFT (supervised fine-tuning) sobre el modelo base Qwen3.5-0.8B, orientado a aritmética y razonamiento en ruso. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El formato de diálogo es ChatML, integrado en `tokenizer_config`. No se documentan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto conversacional en ruso e inglés con plantilla ChatML.
- Razonamiento aritmético y resolución de problemas matemáticos de varios pasos (evaluado en SimpleAR, RuMultiAR, MathLogicQA).
- Razonamiento lógico y de sentido común en ruso (MaMuRaMu, PARus, RWSD).
- Cumplimiento de restricciones estrictas de formato JSON (evaluado en "Strict Constraints JSON", con solo 12 tareas).
- Comprensión lectora y tareas de inferencia lingüística en ruso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o multi-step reasoning más allá de los benchmarks de razonamiento.
- No se documenta modo thinking, visión, audio ni otras capacidades especiales, pese a la clase de modelo empleada en el quickstart.

## Casos de uso

- Tutor de matemáticas en ruso: el modelo resuelve problemas aritméticos de varios pasos con un rendimiento notable en RuMultiAR (33,5%) para su tamaño, por lo que puede emplearse en asistentes educativos que expliquen la resolución paso a paso.
- Atención al cliente en ruso: con plantilla ChatML y licencia Apache 2.0, puede integrarse en chatbots multi-turno para pymes que necesiten un modelo ligero desplegable en hardware modesto.
- Extracción de datos con formato estricto: su evaluación en "Strict Constraints JSON" (58,3% en 12 tareas) sugiere uso en pipelines que requieran salidas JSON estructuradas, aunque con validación posterior dada la muestra reducida.
- Despliegue en el borde o en local: con aproximadamente 1,7 GB en BF16 y ejecución en GPU de 4 GB de VRAM, es adecuado para aplicaciones de escritorio, portátiles o entornos sin GPU dedicada mediante GGUF en llama.cpp u Ollama.
- Procesamiento de documentación bilingüe ru-en: traducción asistida y resumen de textos técnicos en ambos idiomas, aprovechando el entrenamiento bilingüe declarado.
- Prototipado e investigación en arquitecturas de atención lineal: sirve como referencia reproducible para estudiar el comportamiento de Gated Delta Rule en modelos sub-1B con licencia permisiva.
- Generación de preguntas y ejercicios de lógica en ruso: útil para plataformas de evaluación o generación de material didáctico, dado su rendimiento en MathLogicQA y MaMuRaMu.

## Benchmarks y rendimiento

Resultados MERA (Pass@1, generación greedy, plantilla de chat), evaluados el 2026-11-17:

| Benchmark | Tareas | RusNanoLM-0.8B | Qwen3.5-0.8B (baseline) | Delta |
|---|---|---|---|---|
| SimpleAR | 1000 | 83,2% | 48,3% | +34,9 |
| RuMultiAR | 1039 | 33,5% | 8,1% | +25,4 (x4,1) |
| MathLogicQA | 680 | 38,2% | 33,9% | +4,4 |
| MaMuRaMu | 285 | 46,0% | 43,6% | +2,4 |
| PARus | 500 | 53,4% | 53,6% | -0,2 |
| RWSD | 810 | 49,9% | 52,7% | -2,8 |
| Strict Constraints JSON | 12 | 58,3% | no disponible | no disponible |

Comparativa en RuMultiAR frente a modelos mayores:

| Modelo | Parametros | RuMultiAR |
|---|---|---|
| RuadaptQwen-32B | 32B | 43,3% |
| RusNanoLM-0.8B | 0,8B | 33,5% |
| GigaChat-2-10B | 10B | 31,5% |
| Qwen2.5-7B | 7B | 30,8% |
| Meta-Llama-3-8B | 8B | 24,8% |
| Llama-3.2-1B-Instruct | 1B | 16,2% |
| Qwen3.5-0.8B (baseline) | 0,8B | 8,1% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,7 GB en BF16 según la model card; ejecutable en GPU con 4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4060); en A100 o H100 el modelo queda muy sobredimensionado en cuanto a memoria, pero puede servir para servir múltiples instancias.
- Cabe en GPU consumer: sí, en modelos con 4 GB de VRAM o más.
- Opciones de despliegue: transformers (con `AutoModelForImageTextToText` y `torch_dtype=torch.bfloat16`), llama.cpp (build >= b12413 con `RusNanoLM-800M-F16.gguf`), Ollama (con `RusNanoLM-800M-F16-ollama.gguf`), LM Studio (actualizando el runtime de llama.cpp). No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RuMultiAR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusNanoLM-800M | 0,8B | no disponible | 33,5% | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen3.5-0.8B (baseline) | 0,8B | no disponible | 8,1% | no disponible en esta ficha | Hugging Face |
| Llama-3.2-1B-Instruct | 1B | no disponible | 16,2% | no disponible en esta ficha | Hugging Face |
| Qwen2.5-7B | 7B | no disponible | 30,8% | no disponible en esta ficha | Hugging Face |

La comparativa se limita a los datos publicados en la model card; no se dispone de información sobre contexto, licencia o rendimiento en otros benchmarks de los modelos de referencia.

## Limitaciones y advertencias

- El ajuste mejora aritmética y razonamiento, pero no eleva el rendimiento general: PARus (-0,2%) y RWSD (-2,8%) quedan al nivel o ligeramente por debajo del baseline.
- La evaluación "Strict Constraints JSON" se basa en solo 12 tareas, muestra insuficiente para conclusiones firmes.
- No se documenta la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinación inherente a un modelo de 0,8B; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no documentados, pero al entrenarse sobre datos derivados de Qwen3.5 y ajustarse en ruso, puede heredar sesgos del corpus base.
- Idiomas limitados a ruso e inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- La clase de carga `AutoModelForImageTextToText` puede inducir a error sobre capacidades multimodales no documentadas.
- En Ollama puede aparecer el error `tensor 'blk.0.ssm_beta.weight' not found` si se usa el GGUF equivocado; debe emplearse la variante `-ollama`.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/itismax0/RusNanoLM-800M
- Benchmark MERA: no se proporciona enlace directo en la información disponible
- Paper de Qwen3.5 / Gated Delta Rule: no disponible en la información proporcionada
- Repositorio llama.cpp: no se proporciona enlace en la información disponible
- Ollama: no se proporciona enlace en la información disponible
